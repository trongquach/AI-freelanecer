package com.aimarket.service;

import com.aimarket.dto.profile.UpdateProfileRequest;
import com.aimarket.dto.profile.UserProfileResponse;
import com.aimarket.dto.profile.PortfolioItemDto;
import com.aimarket.dto.profile.SkillDto;
import com.aimarket.entity.UserProfile;
import com.aimarket.entity.User;
import com.aimarket.entity.Skill;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.repository.UserProfileRepository;
import com.aimarket.repository.UserRepository;
import com.aimarket.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final AIRecommendationService aiRecommendationService;

    // ─── Get my profile ───────────────────────────────────
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        return toResponse(profile);
    }

    // ─── Get public profile by userId ────────────────────
    @Transactional(readOnly = true)
    public UserProfileResponse getPublicProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        return toResponse(profile);
    }

    // ─── Update profile ───────────────────────────────────
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().user(user).build());

        if (request.fullName()    != null) profile.setFullName(request.fullName());
        if (request.bio()         != null) profile.setBio(request.bio());
        if (request.avatarUrl()   != null) profile.setAvatarUrl(request.avatarUrl());
        if (request.portfolioUrl()!= null) profile.setPortfolioUrl(request.portfolioUrl());
        if (request.timezone()    != null) profile.setTimezone(request.timezone());
        if (request.hourlyRate()  != null) profile.setHourlyRate(request.hourlyRate());
        if (request.isAvailable() != null) profile.setIsAvailable(request.isAvailable());

        if (request.skillIds() != null) {
            List<Skill> skills = skillRepository.findAllById(request.skillIds());
            user.getSkills().clear();
            user.getSkills().addAll(skills);
            userRepository.save(user);
        }

        UserProfile saved = userProfileRepository.save(profile);
        
        // Trigger embedding update for EXPERT
        if (saved.getUser().getRole() == com.aimarket.entity.enums.UserRole.EXPERT) {
            aiRecommendationService.updateExpertEmbedding(userId);
        }

        return toResponse(saved);
    }

    // ─── Set availability ────────────────────────────────
    @Transactional
    public UserProfileResponse setAvailability(Long userId, boolean available) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        profile.setIsAvailable(available);
        return toResponse(userProfileRepository.save(profile));
    }

    // ─── Portfolio Management ──────────────────────────────
    @Transactional
    public UserProfileResponse addPortfolioItem(Long userId, com.aimarket.dto.profile.PortfolioItemRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        
        com.aimarket.entity.PortfolioItem item = com.aimarket.entity.PortfolioItem.builder()
                .userProfile(profile)
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .demoUrl(request.getDemoUrl())
                .skills(new HashSet<>())
                .build();
                
        if (request.getSkillIds() != null && !request.getSkillIds().isEmpty()) {
            List<Skill> itemSkills = skillRepository.findAllById(request.getSkillIds());
            item.getSkills().addAll(itemSkills);
        }
                
        profile.getPortfolioItems().add(item);
        return toResponse(userProfileRepository.save(profile));
    }

    @Transactional
    public UserProfileResponse updatePortfolioItem(Long userId, Long itemId, com.aimarket.dto.profile.PortfolioItemRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
                
        com.aimarket.entity.PortfolioItem item = profile.getPortfolioItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PortfolioItem", itemId));
                
        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getDemoUrl() != null) item.setDemoUrl(request.getDemoUrl());
        
        if (request.getSkillIds() != null) {
            List<Skill> itemSkills = skillRepository.findAllById(request.getSkillIds());
            item.getSkills().clear();
            item.getSkills().addAll(itemSkills);
        }
        
        return toResponse(userProfileRepository.save(profile));
    }

    @Transactional
    public UserProfileResponse deletePortfolioItem(Long userId, Long itemId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
                
        boolean removed = profile.getPortfolioItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new ResourceNotFoundException("PortfolioItem", itemId);
        }
        
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
                p.getTimezone(),
                p.getHourlyRate(),
                p.getRating(),
                p.getTotalReviews(),
                p.getCompletionRate(),
                p.getIsAvailable(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getPortfolioItems().stream()
                        .map(item -> PortfolioItemDto.builder()
                                .id(item.getId())
                                .title(item.getTitle())
                                .description(item.getDescription())
                                .imageUrl(item.getImageUrl())
                                .demoUrl(item.getDemoUrl())
                                .createdAt(item.getCreatedAt().toString())
                                .skills(item.getSkills().stream()
                                    .map(s -> SkillDto.builder()
                                        .id(s.getId())
                                        .category(s.getCategory())
                                        .name(s.getName())
                                        .build())
                                    .collect(Collectors.toList()))
                                .build())
                        .collect(Collectors.toList()),
                p.getUser().getSkills().stream()
                        .map(s -> SkillDto.builder()
                            .id(s.getId())
                            .category(s.getCategory())
                            .name(s.getName())
                            .build())
                        .collect(Collectors.toList())
        );
    }
}
