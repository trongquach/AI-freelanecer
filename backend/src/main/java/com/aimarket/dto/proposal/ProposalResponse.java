package com.aimarket.dto.proposal;

import com.aimarket.entity.enums.ProposalStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProposalResponse(
    Long id,
    Long jobId,
    String jobTitle,
    ExpertInfo expert,
    BigDecimal price,
    Integer timelineDays,
    String coverLetter,
    ProposalStatus status,
    LocalDateTime createdAt
) {
    public record ExpertInfo(Long id, String fullName, String avatarUrl, BigDecimal rating, Integer totalReviews) {}
}
