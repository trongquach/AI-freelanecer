package com.aimarket.controller;

import com.aimarket.dto.chat.*;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@Tag(name = "Chat", description = "Real-time messaging per contract")
@RestController
@RequestMapping("/api/v1/contracts/{contractId}/messages")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Get chat history for a contract")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<MessageResponse> getHistory(@PathVariable Long contractId,
                                            @AuthenticationPrincipal CustomUserDetails user,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "50") int size) {
        return chatService.getHistory(contractId, user.getUserId(), user.getRole(), page, size);
    }

    @Operation(summary = "Send message via REST (also broadcasts via WS)")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public MessageResponse sendMessage(@PathVariable Long contractId,
                                       @Valid @RequestBody SendMessageRequest request,
                                       @AuthenticationPrincipal CustomUserDetails user) {
        return chatService.sendMessage(contractId, request.content(), user.getUserId(), user.getRole());
    }

    @Operation(summary = "Unread message count")
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Long> unreadCount(@PathVariable Long contractId,
                                         @AuthenticationPrincipal CustomUserDetails user) {
        return Map.of("count", chatService.unreadCount(contractId, user.getUserId()));
    }

    @Operation(summary = "Send typing event")
    @PostMapping("/typing")
    @PreAuthorize("isAuthenticated()")
    public void typingEvent(@PathVariable Long contractId,
                            @RequestParam boolean typing,
                            @AuthenticationPrincipal CustomUserDetails user) {
        chatService.sendTypingEvent(contractId, user.getUserId(), user.getRole(), typing);
    }
}
