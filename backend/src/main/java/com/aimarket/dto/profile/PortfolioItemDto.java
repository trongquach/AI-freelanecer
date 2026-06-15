package com.aimarket.dto.profile;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PortfolioItemDto {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String demoUrl;
    private String technologies;
    private Integer displayOrder;
    private String createdAt;
}
