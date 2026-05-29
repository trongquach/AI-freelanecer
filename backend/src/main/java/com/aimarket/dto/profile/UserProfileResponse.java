package com.aimarket.dto.profile;

import com.aimarket.entity.enums.UserRole;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserProfileResponse(
        Long userId,
        String email,
        UserRole role,
        String fullName,
        String bio,
        String avatarUrl,
        String portfolioUrl,
        BigDecimal hourlyRate,
        BigDecimal rating,
        Integer totalReviews,
        BigDecimal completionRate,
        Boolean isAvailable,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
