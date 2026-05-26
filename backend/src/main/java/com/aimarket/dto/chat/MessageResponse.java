package com.aimarket.dto.chat;

import java.time.LocalDateTime;

public record MessageResponse(
    Long id,
    Long contractId,
    SenderInfo sender,
    String content,
    Boolean isRead,
    LocalDateTime createdAt
) {
    public record SenderInfo(Long id, String fullName, String avatarUrl) {}
}
