package com.aimarket.service;

import com.aimarket.dto.auth.AuthResponse;
import com.aimarket.dto.auth.LoginRequest;
import com.aimarket.dto.auth.RegisterRequest;
import com.aimarket.dto.auth.RefreshTokenRequest;
import com.aimarket.entity.RefreshToken;
import com.aimarket.entity.User;
import com.aimarket.entity.UserProfile;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.exception.BusinessException;
import com.aimarket.exception.UserAlreadyExistsException;
import com.aimarket.repository.RefreshTokenRepository;
import com.aimarket.repository.UserProfileRepository;
import com.aimarket.repository.UserRepository;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshTokenExpiration", 604800000L);
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest("test@test.com", "password", UserRole.CLIENT, "Test User");
        
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded_pwd");
        when(jwtTokenProvider.generateAccessToken(any(CustomUserDetails.class))).thenReturn("access_token");
        when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(900000L); // 15 mins

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access_token", response.accessToken());
        assertNotNull(response.refreshToken());
        assertEquals("test@test.com", response.user().email());
        
        verify(userRepository).save(any(User.class));
        verify(userProfileRepository).save(any(UserProfile.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("test@test.com", "password", UserRole.CLIENT, "Test User");
        
        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);
        
        assertThrows(UserAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLogin_WrongPassword() {
        LoginRequest request = new LoginRequest("test@test.com", "wrong_password");
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));
                
        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void testRefreshToken_Expired() {
        RefreshTokenRequest request = new RefreshTokenRequest("dummy_token");
        
        // Mock tokenHash will be some base64 string
        // We will mock the repository to return an expired token
        User user = new User();
        RefreshToken storedToken = RefreshToken.builder()
                .user(user)
                .tokenHash("some_hash")
                .expiresAt(LocalDateTime.now().minusDays(1)) // Expired
                .revoked(false)
                .build();
                
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(storedToken));
        
        BusinessException ex = assertThrows(BusinessException.class, () -> authService.refresh(request));
        assertEquals("Refresh token expired or revoked", ex.getMessage());
    }

    @Test
    void testLogout_Success() {
        String accessToken = "access_token";
        String refreshTokenValue = "refresh_token";
        
        when(jwtTokenProvider.getAccessTokenExpiration()).thenReturn(900000L);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        
        RefreshToken storedToken = new RefreshToken();
        storedToken.setRevoked(false);
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(storedToken));
        
        authService.logout(accessToken, refreshTokenValue);
        
        verify(valueOperations).set("jwt:blacklist:access_token", "1", 900000L, TimeUnit.MILLISECONDS);
        verify(refreshTokenRepository).save(storedToken);
        assertTrue(storedToken.getRevoked());
    }
}
