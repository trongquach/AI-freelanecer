package com.aimarket.dto.job;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateJobRequest(
    @NotBlank @Size(max = 255) String title,
    @NotBlank @Size(min = 50, message = "Description must be at least 50 characters") String description,
    @Positive BigDecimal budgetMin,
    @Positive BigDecimal budgetMax,
    @FutureOrPresent LocalDate deadline,
    List<Long> skillIds
) {}
