package com.aimarket.dto.profile;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioItemRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String imageUrl;
    private String demoUrl;
}
