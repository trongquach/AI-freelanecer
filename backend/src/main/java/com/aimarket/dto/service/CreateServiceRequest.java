package com.aimarket.dto.service;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateServiceRequest(
    @NotBlank @Size(max = 255) String title,
    @NotBlank @Size(min = 100, message = "Description must be at least 100 characters") String description,
    @NotNull @Positive @DecimalMax("99999.99") BigDecimal price,
    @NotNull @Min(1) @Max(365) Integer deliveryDays,
    @Size(max = 10, message = "Maximum 10 tags allowed") List<String> tags,
    List<Long> skillIds
) {}
