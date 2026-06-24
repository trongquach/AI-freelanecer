package com.aimarket.dto.profile;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PortfolioItemDto {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String demoUrl;
    private String createdAt;
    private Integer displayOrder;
    private List<SkillDto> skills;
}
