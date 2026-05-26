package com.aimarket.dto.service;

import com.aimarket.entity.enums.ServiceStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ServiceResponse(
    Long id,
    String title,
    String description,
    BigDecimal price,
    Integer deliveryDays,
    ServiceStatus status,
    List<String> tags,
    BigDecimal rating,
    Integer orderCount,
    ExpertInfo expert,
    List<SkillInfo> skills,
    LocalDateTime createdAt
) {
    public record ExpertInfo(Long id, String fullName, String avatarUrl, BigDecimal rating, Integer totalReviews) {}
    public record SkillInfo(Long id, String name, String category) {}
}
