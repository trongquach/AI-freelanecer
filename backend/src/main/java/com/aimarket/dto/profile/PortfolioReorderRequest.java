package com.aimarket.dto.profile;

import lombok.Data;
import java.util.List;

@Data
public class PortfolioReorderRequest {
    private List<Long> orderedItemIds;
}
