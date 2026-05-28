package com.aimarket.dto.review;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateReviewRequest(
    @NotNull Long contractId,
    @NotNull @DecimalMin("1.0") @DecimalMax("5.0") BigDecimal rating,
    @Size(max = 2000) String comment
) {}
