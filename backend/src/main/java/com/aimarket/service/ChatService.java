package com.aimarket.service;

import com.aimarket.dto.chat.*;
import com.aimarket.entity.Contract;
import com.aimarket.entity.Message;
import com.aimarket.entity.User;
import com.aimarket.exception.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Send via REST (also broadcasts via WS) ──────────
    @Transactional
    public MessageResponse sendMessage(Long contractId, String content, Long senderId) {
        Contract contract = getContractAndCheckParty(contractId, senderId);
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", senderId));

        Message message = Message.builder()
                .contract(contract)
                .sender(sender)
                .content(content)
                .build();
        Message saved = messageRepository.save(message);
        MessageResponse response = toResponse(saved);

        // Broadcast to contract room — both client and expert receive
        messagingTemplate.convertAndSend("/topic/contract." + contractId, response);

        // Notify the other party via user-specific channel
        Long otherUserId = contract.getClient().getId().equals(senderId)
                ? contract.getExpert().getId() : contract.getClient().getId();
        messagingTemplate.convertAndSendToUser(
                String.valueOf(otherUserId), "/queue/notifications",
                new ChatNotification(contractId, sender.getId(), content));

        return response;
    }

    // ─── Get history ─────────────────────────────────────
    @Transactional
    public Page<MessageResponse> getHistory(Long contractId, Long userId, int page, int size) {
        getContractAndCheckParty(contractId, userId);
        messageRepository.markAsRead(contractId, userId);
        return messageRepository.findByContractId(contractId,
                PageRequest.of(page, size)).map(this::toResponse);
    }

    // ─── Unread count ─────────────────────────────────────
    @Transactional(readOnly = true)
    public long unreadCount(Long contractId, Long userId) {
        return messageRepository.countByContractIdAndIsReadFalseAndSenderIdNot(contractId, userId);
    }

    // ─── Helpers ─────────────────────────────────────────
    private Contract getContractAndCheckParty(Long contractId, Long userId) {
        Contract contract = contractRepository.findByIdWithDetails(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", contractId));
        boolean isParty = contract.getClient().getId().equals(userId)
                || contract.getExpert().getId().equals(userId);
        if (!isParty) throw new ForbiddenException();
        return contract;
    }

    private MessageResponse toResponse(Message m) {
        var profile = m.getSender().getProfile();
        return new MessageResponse(m.getId(), m.getContract().getId(),
                new MessageResponse.SenderInfo(m.getSender().getId(),
                        profile != null ? profile.getFullName() : null,
                        profile != null ? profile.getAvatarUrl() : null),
                m.getContent(), m.getIsRead(), m.getCreatedAt());
    }

    public record ChatNotification(Long contractId, Long senderId, String preview) {}
}
