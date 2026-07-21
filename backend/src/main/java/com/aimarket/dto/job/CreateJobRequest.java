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
    @FutureOrPresent LocalDate startDate,
    String expectedDuration,
    List<Long> skillIds,

    /** Số ứng viên tối đa muốn phỏng vấn (1–20, mặc định 5) */
    @Min(1) @Max(20) Integer maxShortlist,

    /** Ngưỡng điểm AI tối thiểu để CV hiển thị cho Client (0.0–1.0, mặc định 0.6) */
    @DecimalMin("0.0") @DecimalMax("1.0") Double aiScreeningThreshold
) {}

