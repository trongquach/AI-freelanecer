package com.aimarket.dto.job;

import com.aimarket.entity.enums.JobStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record JobFilterRequest(
    String keyword,
    BigDecimal minBudget,
    BigDecimal maxBudget,
    List<JobStatus> statuses,
    List<Long> skillIds,
    int page,
    int size
) {
    public JobFilterRequest {
        if (page < 0) page = 0;
        if (size <= 0 || size > 50) size = 10;
    }
}
