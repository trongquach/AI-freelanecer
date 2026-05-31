package com.aimarket.service;

import com.aimarket.dto.profile.UpdateProfileRequest;
import com.aimarket.dto.profile.UserProfileResponse;
import com.aimarket.entity.UserProfile;
import com.aimarket.entity.User;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.repository.UserProfileRepository;
import com.aimarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    // ─── Get my profile ───────────────────────────────────
    @Transactional(readOnly = true)
    @Cacheable(value = "user-profiles", key = "#userId")
    public UserProfileResponse getProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        return toResponse(profile);
    }

    // ─── Get public profile by userId ────────────────────
    @Transactional(readOnly = true)
    @Cacheable(value = "user-profiles", key = "'pub:' + #userId")
    public UserProfileResponse getPublicProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        return toResponse(profile);
    }

    // ─── Update profile ───────────────────────────────────
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "user-profiles", key = "#userId"),
        @CacheEvict(value = "user-profiles", key = "'pub:' + #userId")
    })
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    return UserProfile.builder().user(user).build();
                });

        if (request.fullName()    != null) profile.setFullName(request.fullName());
        if (request.bio()         != null) profile.setBio(request.bio());
        if (request.avatarUrl()   != null) profile.setAvatarUrl(request.avatarUrl());
        if (request.portfolioUrl()!= null) profile.setPortfolioUrl(request.portfolioUrl());
        if (request.hourlyRate()  != null) profile.setHourlyRate(request.hourlyRate());
        if (request.isAvailable() != null) profile.setIsAvailable(request.isAvailable());

        return toResponse(userProfileRepository.save(profile));
    }

    // ─── Set availability ────────────────────────────────
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "user-profiles", key = "#userId"),
        @CacheEvict(value = "user-profiles", key = "'pub:' + #userId")
    })
    public UserProfileResponse setAvailability(Long userId, boolean available) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        profile.setIsAvailable(available);
        return toResponse(userProfileRepository.save(profile));
    }

    // ─── Mapper ───────────────────────────────────────────
    public UserProfileResponse toResponse(UserProfile p) {
        return new UserProfileResponse(
                p.getUser().getId(),
                p.getUser().getEmail(),
                p.getUser().getRole(),
                p.getFullName(),
                p.getBio(),
                p.getAvatarUrl(),
                p.getPortfolioUrl(),
                p.getHourlyRate(),
                p.getRating(),
                p.getTotalReviews(),
                p.getCompletionRate(),
                p.getIsAvailable(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
