package com.aimarket.dto.profile;

import lombok.Data;
import java.util.List;

@Data
public class UpdateSkillsRequest {
    private List<Long> skillIds;
}
