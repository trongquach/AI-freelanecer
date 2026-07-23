package com.aimarket.service;

import com.aimarket.dto.contract.ContractResponse;
import com.aimarket.entity.Contract;
import com.aimarket.entity.Milestone;
import com.aimarket.entity.enums.ContractStatus;
import com.aimarket.entity.enums.MilestoneStatus;
import com.aimarket.exception.*;
import com.aimarket.repository.ContractRepository;
import com.aimarket.repository.MilestoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final MilestoneRepository milestoneRepository;
    private final EscrowService escrowService;
    private final NotificationService notificationService;
    private final com.aimarket.repository.JobRepository jobRepository;

    @Transactional(readOnly = true)
    public ContractResponse getContract(Long id, Long userId, com.aimarket.entity.enums.UserRole role) {
        Contract contract = contractRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", id));
        boolean isParty = contract.getClient().getId().equals(userId) || contract.getExpert().getId().equals(userId);
        if (!isParty && role != com.aimarket.entity.enums.UserRole.ADMIN) throw new ForbiddenException();
        return toResponse(contract);
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> myContracts(Long userId, String role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return "EXPERT".equals(role)
                ? contractRepository.findByExpertIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse)
                : contractRepository.findByClientIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Transactional
    public ContractResponse completeMilestone(Long contractId, Long milestoneId, String deliverableUrl, String note, Long expertId) {
        Contract contract = getContractAndCheckExpert(contractId, expertId);
        Milestone milestone = getMilestoneOrThrow(milestoneId, contractId);

        if (milestone.getStatus() == MilestoneStatus.APPROVED)
            throw new BusinessException("Milestone cannot be submitted because it is already APPROVED");

        boolean hasPendingPrevious = contract.getMilestones().stream()
                .anyMatch(m -> m.getOrderIndex() < milestone.getOrderIndex() 
                            && m.getStatus() != MilestoneStatus.APPROVED);

        if (hasPendingPrevious) {
            throw new BusinessException("Bạn phải đợi Client duyệt xong Milestone trước đó thì mới được nộp Milestone tiếp theo.");
        }

        milestone.setStatus(MilestoneStatus.SUBMITTED);
        milestone.setDeliverableUrl(deliverableUrl);
        milestone.setDeliverableNote(note);
        milestoneRepository.save(milestone);

        // Notify client that expert submitted a milestone
        notificationService.send(contract.getClient().getId(), "MILESTONE_SUBMITTED",
                "Milestone đã được nộp",
                String.format("Expert đã nộp milestone '%s' trong hợp đồng #%d. Vui lòng kiểm tra và phê duyệt.", milestone.getName(), contractId),
                contractId);
        // Push real-time contract update to both parties
        notificationService.sendEvent(contract.getClient().getId(), "CONTRACT_UPDATED", contractId);

        return toResponse(contract);
    }

    @Transactional
    public ContractResponse approveMilestone(Long contractId, Long milestoneId, Long clientId) {
        Contract contract = getContractAndCheckClient(contractId, clientId);
        Milestone milestone = getMilestoneOrThrow(milestoneId, contractId);

        if (milestone.getStatus() != MilestoneStatus.SUBMITTED)
            throw new BusinessException("Milestone must be SUBMITTED before approval");

        milestone.setStatus(MilestoneStatus.APPROVED);
        milestoneRepository.save(milestone);

        // releaseFunds already sends WALLET_UPDATED + PAYMENT_RECEIVED events
        escrowService.releaseFunds(contractId, clientId, contract.getExpert().getId(), milestone.getAmount());

        // Push contract update to expert
        notificationService.sendEvent(contract.getExpert().getId(), "CONTRACT_UPDATED", contractId);

        // Auto-complete contract if all milestones approved
        boolean allDone = contract.getMilestones().stream()
                .allMatch(m -> m.getId().equals(milestone.getId()) ? true : m.getStatus() == MilestoneStatus.APPROVED);
        if (allDone || contract.getMilestones().isEmpty()) {
            contract.setStatus(ContractStatus.COMPLETED);
            contract.setCompletedAt(LocalDateTime.now());
            contractRepository.save(contract);

            var job = contract.getJob();
            if (job != null) {
                job.setStatus(com.aimarket.entity.enums.JobStatus.COMPLETED);
                jobRepository.save(job);
            }
            // Notify both parties contract is done
            notificationService.send(contract.getExpert().getId(), "CONTRACT_COMPLETED",
                    "Hợp đồng hoàn thành",
                    String.format("Tất cả milestones đã hoàn thành. Hợp đồng #%d đã kết thúc.", contractId), contractId);
            notificationService.sendEvent(contract.getClient().getId(), "CONTRACT_UPDATED", contractId);
            notificationService.sendEvent(contract.getExpert().getId(), "CONTRACT_UPDATED", contractId);
            notificationService.broadcastAdminEvent("CONTRACT_COMPLETED");
        }
        return toResponse(contract);
    }

    @Transactional
    public ContractResponse rejectMilestone(Long contractId, Long milestoneId, Long clientId) {
        Contract contract = getContractAndCheckClient(contractId, clientId);
        Milestone milestone = getMilestoneOrThrow(milestoneId, contractId);
        if (milestone.getStatus() != MilestoneStatus.SUBMITTED)
            throw new BusinessException("Milestone must be SUBMITTED to reject");
        milestone.setStatus(MilestoneStatus.REJECTED);
        milestoneRepository.save(milestone);

        // Notify expert that revision was requested
        notificationService.send(contract.getExpert().getId(), "MILESTONE_REJECTED",
                "Milestone bị từ chối",
                String.format("Client yêu cầu chỉnh sửa milestone '%s' trong hợp đồng #%d.", milestone.getName(), contractId),
                contractId);
        notificationService.sendEvent(contract.getExpert().getId(), "CONTRACT_UPDATED", contractId);

        return toResponse(contract);
    }

    // ─── Helpers ──────────────────────────────────────────
    private Contract getContractAndCheckExpert(Long contractId, Long expertId) {
        Contract c = contractRepository.findByIdWithDetails(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", contractId));
        if (!c.getExpert().getId().equals(expertId)) throw new ForbiddenException();
        if (c.getStatus() != ContractStatus.ACTIVE) throw new BusinessException("Contract is not active");
        return c;
    }

    private Contract getContractAndCheckClient(Long contractId, Long clientId) {
        Contract c = contractRepository.findByIdWithDetails(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", contractId));
        if (!c.getClient().getId().equals(clientId)) throw new ForbiddenException();
        return c;
    }

    private Milestone getMilestoneOrThrow(Long milestoneId, Long contractId) {
        return milestoneRepository.findById(milestoneId)
                .filter(m -> m.getContract().getId().equals(contractId))
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", milestoneId));
    }

    public ContractResponse toResponse(Contract c) {
        var clientProfile  = c.getClient().getProfile();
        var expertProfile  = c.getExpert().getProfile();
        var milestones = c.getMilestones().stream()
                .map(m -> new ContractResponse.MilestoneInfo(m.getId(), m.getName(), m.getAmount(),
                        m.getDueDate(), m.getStatus(), m.getOrderIndex(), m.getDeliverableUrl()))
                .collect(Collectors.toList());

        BigDecimal approvedAmount = c.getMilestones().stream()
                .filter(m -> m.getStatus() == MilestoneStatus.APPROVED)
                .map(Milestone::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal escrowAmount = c.getTotalAmount().subtract(approvedAmount);

        return new ContractResponse(
                c.getId(), c.getJob().getId(), c.getJob().getTitle(),
                new ContractResponse.PartyInfo(c.getClient().getId(),
                        clientProfile != null ? clientProfile.getFullName() : null,
                        clientProfile != null ? clientProfile.getAvatarUrl() : null),
                new ContractResponse.PartyInfo(c.getExpert().getId(),
                        expertProfile != null ? expertProfile.getFullName() : null,
                        expertProfile != null ? expertProfile.getAvatarUrl() : null),
                c.getTotalAmount(), escrowAmount, c.getStatus(), milestones,
                c.getStartedAt(), c.getCompletedAt(), c.getCreatedAt()
        );
    }
}
