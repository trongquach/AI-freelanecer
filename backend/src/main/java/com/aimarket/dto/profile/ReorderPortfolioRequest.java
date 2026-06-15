package com.aimarket.dto.profile;

import lombok.Data;
import java.util.List;

@Data
public class ReorderPortfolioRequest {
    private List<Long> itemIds;
}
