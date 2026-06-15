package com.aimarket.dto.profile;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateProfileRequest(
        @Size(max = 255) String fullName,
        @Size(max = 2000) String bio,
        @Size(max = 500)  String avatarUrl,
        @Size(max = 500)  String portfolioUrl,
        @DecimalMin("0.0") BigDecimal hourlyRate,
        @Size(max = 100) String timezone,
        Boolean isAvailable
) {}
