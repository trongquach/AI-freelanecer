package com.aimarket.dto.dispute;

import com.aimarket.entity.enums.DisputeResolution;
import com.aimarket.entity.enums.DisputeStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DisputeResponse {
    private Long id;
    private Long contractId;
    private String contractTitle;
    private OpenedByInfo openedBy;
    private String reason;
    private DisputeStatus status;
    private String adminNote;
    private DisputeResolution resolution;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class OpenedByInfo {
        private Long id;
        private String email;
        private String fullName;
    }
}
