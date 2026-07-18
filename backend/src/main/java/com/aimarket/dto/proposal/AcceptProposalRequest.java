package com.aimarket.dto.proposal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AcceptProposalRequest(
    List<MilestoneRequest> milestones
) {
    public record MilestoneRequest(
        String name,
        String description,
        BigDecimal amount,
        LocalDate dueDate
    ) {}
}
