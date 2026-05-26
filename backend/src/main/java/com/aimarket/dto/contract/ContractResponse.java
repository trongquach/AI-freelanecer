package com.aimarket.dto.contract;

import com.aimarket.entity.enums.ContractStatus;
import com.aimarket.entity.enums.MilestoneStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ContractResponse(
    Long id,
    Long jobId,
    String jobTitle,
    PartyInfo client,
    PartyInfo expert,
    BigDecimal totalAmount,
    ContractStatus status,
    List<MilestoneInfo> milestones,
    LocalDateTime startedAt,
    LocalDateTime completedAt,
    LocalDateTime createdAt
) {
    public record PartyInfo(Long id, String fullName, String avatarUrl) {}
    public record MilestoneInfo(
        Long id, String name, BigDecimal amount, LocalDate dueDate,
        MilestoneStatus status, Integer orderIndex, String deliverableUrl
    ) {}
}
