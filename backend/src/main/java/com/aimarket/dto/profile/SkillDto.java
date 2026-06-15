package com.aimarket.dto.profile;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SkillDto {
    private Long id;
    private String name;
    private String category;
}
