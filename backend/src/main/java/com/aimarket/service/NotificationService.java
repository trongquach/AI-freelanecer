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
        notificationRepository.save(n);

        // Push via WebSocket
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + userId,
                    Map.of("type", type, "title", title, "content", content, "referenceId", referenceId)
            );
        } catch (Exception e) {
            log.warn("Failed to push WS notification to user {}: {}", userId, e.getMessage());
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
