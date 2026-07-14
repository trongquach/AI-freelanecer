package com.aimarket.dto.profile;

import com.aimarket.entity.enums.UserRole;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record UserProfileResponse(
        Long userId,
        String email,
        UserRole role,
        String fullName,
        String bio,
        String avatarUrl,
        String portfolioUrl,
        String timezone,
        BigDecimal hourlyRate,
        BigDecimal rating,
        Integer totalReviews,
        Integer jobsDone,
        BigDecimal completionRate,
        Boolean isAvailable,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<PortfolioItemDto> portfolioItems,
        List<SkillDto> skills
) {}
