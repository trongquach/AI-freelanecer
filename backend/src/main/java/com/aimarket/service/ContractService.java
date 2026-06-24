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

    @Transactional(readOnly = true)
    public ContractResponse getContract(Long id, Long userId) {
        Contract contract = contractRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", id));
        boolean isParty = contract.getClient().getId().equals(userId) || contract.getExpert().getId().equals(userId);
        if (!isParty) throw new ForbiddenException();
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

        if (milestone.getStatus() != MilestoneStatus.PENDING && milestone.getStatus() != MilestoneStatus.IN_PROGRESS)
            throw new BusinessException("Milestone cannot be submitted in status: " + milestone.getStatus());

        milestone.setStatus(MilestoneStatus.SUBMITTED);
        milestone.setDeliverableUrl(deliverableUrl);
        milestone.setDeliverableNote(note);
        milestoneRepository.save(milestone);
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

        escrowService.releaseFunds(contractId, clientId, contract.getExpert().getId(), milestone.getAmount());

        // Auto-complete contract if all milestones approved
        boolean allDone = contract.getMilestones().stream()
                .allMatch(m -> m.getStatus() == MilestoneStatus.APPROVED);
        if (allDone || contract.getMilestones().isEmpty()) {
            contract.setStatus(ContractStatus.COMPLETED);
            contract.setCompletedAt(LocalDateTime.now());
            contractRepository.save(contract);
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

        BigDecimal escrowAmount = c.getMilestones().stream()
                .filter(m -> m.getStatus() != MilestoneStatus.APPROVED)
                .map(Milestone::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

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
