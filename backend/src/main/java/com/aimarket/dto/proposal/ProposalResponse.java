package com.aimarket.dto.proposal;

import com.aimarket.entity.enums.ProposalStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProposalResponse(
    Long id,
    Long contractId,
    Long jobId,
    String jobTitle,
    ExpertInfo expert,
    BigDecimal price,
    Integer timelineDays,
    String coverLetter,
    ProposalStatus status,
    // AI screening fields
    Double aiScore,
    String aiFeedback,
    // Interview field
    String interviewNotes,
    LocalDateTime createdAt
) {
    public record ExpertInfo(
        Long id,
        String fullName,
        String avatarUrl,
        BigDecimal rating,
        Integer totalReviews,
        List<String> skills,
        Integer yearsOfExperience
    ) {}
}

