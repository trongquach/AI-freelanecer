package com.aimarket.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Set;

@Data
public class PortfolioItemRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @Size(max = 2000)
    private String description;
    @Size(max = 500)
    private String imageUrl;
    @Size(max = 500)
    private String demoUrl;
    private Set<Long> skillIds;
}
