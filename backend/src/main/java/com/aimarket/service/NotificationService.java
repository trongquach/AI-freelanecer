package com.aimarket.service;

import com.aimarket.entity.Notification;
import com.aimarket.entity.User;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.repository.NotificationRepository;
import com.aimarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    @Transactional
    public void send(Long userId, String type, String title, String content, Long referenceId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification n = Notification.builder()
                .user(user).type(type).title(title).content(content).referenceId(referenceId)
                .build();
        n = notificationRepository.save(n);

        // Push via WebSocket — includes eventType so frontend can invalidate queries
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + userId,
                    Map.of(
                            "id", n.getId(),
                            "type", type, 
                            "title", title, 
                            "content", content,
                            "referenceId", referenceId != null ? referenceId : 0,
                            "isRead", false,
                            "createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : java.time.LocalDateTime.now().toString()
                    )
            );
        } catch (Exception e) {
            log.warn("Failed to push WS notification to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Push-only WebSocket event — does NOT save to DB, used for lightweight data refresh signals.
     */
    @Async
    public void sendEvent(Long userId, String eventType, Long referenceId) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + userId,
                    Map.of("type", eventType, "title", eventType, "content", "",
                           "referenceId", referenceId != null ? referenceId : 0,
                           "eventOnly", true)
            );
        } catch (Exception e) {
            log.warn("Failed to push WS event to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Broadcast an event to all connected admins via /topic/admin-events.
     * Used to trigger real-time refresh of admin dashboards.
     */
    @Async
    public void broadcastAdminEvent(String eventType) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/admin-events",
                    Map.of("type", eventType)
            );
            log.debug("Broadcast admin event: {}", eventType);
        } catch (Exception e) {
            log.warn("Failed to broadcast admin event {}: {}", eventType, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<Notification> list(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!n.getUser().getId().equals(userId)) return;
        n.setIsRead(true);
        notificationRepository.save(n);
    }
}
