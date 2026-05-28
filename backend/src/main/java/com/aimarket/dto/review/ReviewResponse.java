package com.aimarket.dto.review;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    Long contractId,
    ReviewerInfo reviewer,
    BigDecimal rating,
    String comment,
    LocalDateTime createdAt
) {
    public record ReviewerInfo(Long id, String fullName, String avatarUrl) {}
}
