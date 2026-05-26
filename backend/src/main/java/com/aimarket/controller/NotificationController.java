package com.aimarket.controller;

import com.aimarket.entity.Notification;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Notifications")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "List notifications")
    @GetMapping
    public Page<Notification> list(@AuthenticationPrincipal CustomUserDetails user,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "20") int size) {
        return notificationService.list(user.getUserId(), page, size);
    }

    @Operation(summary = "Unread count")
    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal CustomUserDetails user) {
        return Map.of("count", notificationService.unreadCount(user.getUserId()));
    }

    @Operation(summary = "Mark all as read")
    @PostMapping("/read-all")
    public Map<String, String> markAllRead(@AuthenticationPrincipal CustomUserDetails user) {
        notificationService.markAllRead(user.getUserId());
        return Map.of("message", "All notifications marked as read");
    }

    @Operation(summary = "Mark one as read")
    @PostMapping("/{id}/read")
    public Map<String, String> markRead(@PathVariable Long id,
                                        @AuthenticationPrincipal CustomUserDetails user) {
        notificationService.markRead(id, user.getUserId());
        return Map.of("message", "Notification marked as read");
    }
}
