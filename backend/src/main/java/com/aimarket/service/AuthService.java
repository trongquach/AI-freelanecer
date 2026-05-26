package com.aimarket.service;

import com.aimarket.dto.auth.*;
import com.aimarket.entity.RefreshToken;
import com.aimarket.entity.User;
import com.aimarket.entity.UserProfile;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.entity.enums.UserStatus;
import com.aimarket.exception.BusinessException;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.exception.UserAlreadyExistsException;
import com.aimarket.repository.RefreshTokenRepository;
import com.aimarket.repository.UserProfileRepository;
import com.aimarket.repository.UserRepository;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final StringRedisTemplate redisTemplate;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    // ─── Register ─────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException(request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .status(UserStatus.ACTIVE) // Auto-activate in dev; prod needs email verification
                .emailVerified(false)
                .build();
        userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(user)
                .fullName(request.fullName())
                .build();
        userProfileRepository.save(profile);

        // Create escrow account
        createEscrowAccount(user);

        log.info("New user registered: {} ({})", request.email(), request.role());
        // In prod: send verification email
        log.info("[DEV] Email verification link: http://localhost:8080/api/v1/auth/verify?token=MOCK_TOKEN");

        return buildAuthResponse(user, profile);
    }

    // ─── Login ────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User user = userRepository.findByIdWithProfile(userDetails.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", userDetails.getUserId()));

        // Revoke old refresh tokens for this device (single session)
        refreshTokenRepository.revokeAllByUserId(user.getId());

        return buildAuthResponse(user, user.getProfile());
    }

    // ─── Refresh Token ────────────────────────────────────────
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.refreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException("Invalid refresh token"));

        if (!stored.isValid()) {
            throw new BusinessException("Refresh token expired or revoked");
        }

        // Revoke old token (rotation)
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        User user = stored.getUser();
        return buildAuthResponse(user, user.getProfile());
    }

    // ─── Logout ───────────────────────────────────────────────
    @Transactional
    public void logout(String accessToken, String refreshTokenValue) {
        // Blacklist access token in Redis
        long ttl = jwtTokenProvider.getAccessTokenExpiration();
        redisTemplate.opsForValue().set(
                "jwt:blacklist:" + accessToken, "1", ttl, TimeUnit.MILLISECONDS
        );

        // Revoke refresh token
        if (refreshTokenValue != null) {
            String hash = hashToken(refreshTokenValue);
            refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
    }

    // ─── Forgot Password ──────────────────────────────────────
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(
                    "password:reset:" + resetToken, String.valueOf(user.getId()),
                    15, TimeUnit.MINUTES
            );
            // In prod: send email with reset link
            log.info("[DEV] Password reset link: http://localhost:3000/reset-password?token={}", resetToken);
        });
    }

    // ─── Reset Password ───────────────────────────────────────
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String key = "password:reset:" + token;
        String userIdStr = redisTemplate.opsForValue().get(key);
        if (userIdStr == null) {
            throw new BusinessException("Reset token invalid or expired");
        }

        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        redisTemplate.delete(key);
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    // ─── Private helpers ──────────────────────────────────────
    private AuthResponse buildAuthResponse(User user, UserProfile profile) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken  = jwtTokenProvider.generateAccessToken(userDetails);
        String rawRefreshToken = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(rawRefreshToken))
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        String fullName   = profile != null ? profile.getFullName() : null;
        String avatarUrl  = profile != null ? profile.getAvatarUrl() : null;

        return AuthResponse.of(
                accessToken,
                rawRefreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                new AuthResponse.UserInfo(user.getId(), user.getEmail(), user.getRole(), fullName, avatarUrl)
        );
    }

    private void createEscrowAccount(User user) {
        // EscrowAccount creation handled by EscrowService to avoid circular dependency
        // Called via ApplicationEvent in production; simplified here
        log.debug("Escrow account will be created for user: {}", user.getId());
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
