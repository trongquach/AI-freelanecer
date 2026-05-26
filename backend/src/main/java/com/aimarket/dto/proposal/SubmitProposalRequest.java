package com.aimarket.dto.proposal;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record SubmitProposalRequest(
    @NotNull Long jobId,
    @NotNull @Positive BigDecimal price,
    @NotNull @Min(1) @Max(365) Integer timelineDays,
    @NotBlank @Size(min = 50, max = 2000) String coverLetter
) {}
