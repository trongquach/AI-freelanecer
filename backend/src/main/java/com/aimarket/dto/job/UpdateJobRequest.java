package com.aimarket.dto.job;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateJobRequest(
    String title,
    String description,
    BigDecimal budgetMin,
    BigDecimal budgetMax,
    LocalDate deadline,
    List<Long> skillIds
) {}
