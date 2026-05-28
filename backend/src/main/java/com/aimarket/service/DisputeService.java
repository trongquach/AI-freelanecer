package com.aimarket.service;

import com.aimarket.entity.*;
import com.aimarket.entity.enums.*;
import com.aimarket.exception.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final EscrowService escrowService;
    private final NotificationService notificationService;

    @Transactional
    public Dispute openDispute(Long contractId, Long openedById, String reason) {
        Contract contract = contractRepository.findByIdWithDetails(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", contractId));

        if (contract.getStatus() != ContractStatus.ACTIVE)
            throw new BusinessException("Only ACTIVE contracts can be disputed");

        boolean alreadyOpen = disputeRepository
                .findByContractIdAndStatusIn(contractId, List.of(DisputeStatus.OPEN, DisputeStatus.INVESTIGATING))
                .isPresent();
        if (alreadyOpen) throw new BusinessException("A dispute is already open for this contract");

        boolean isParty = contract.getClient().getId().equals(openedById)
                || contract.getExpert().getId().equals(openedById);
        if (!isParty) throw new ForbiddenException();

        User opener = userRepository.findById(openedById)
                .orElseThrow(() -> new ResourceNotFoundException("User", openedById));

        contract.setStatus(ContractStatus.DISPUTED);
        contractRepository.save(contract);

        Dispute dispute = Dispute.builder()
                .contract(contract)
                .openedBy(opener)
                .reason(reason)
                .build();
        disputeRepository.save(dispute);

        // Notify admin (userId = 1 by convention in dev)
        notificationService.send(1L, "DISPUTE", "Tranh chấp mới",
                "Hợp đồng #" + contractId + " có tranh chấp mới cần xử lý", contractId);

        return dispute;
    }

    @Transactional(readOnly = true)
    public Page<Dispute> listAll(int page, int size) {
        return disputeRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Dispute getById(Long id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", id));
    }

    @Transactional
    public Dispute resolve(Long disputeId, DisputeResolution resolution, String adminNote) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));

        if (dispute.getStatus() == DisputeStatus.RESOLVED)
            throw new BusinessException("Dispute already resolved");

        Contract contract = dispute.getContract();

        switch (resolution) {
            case REFUND_CLIENT -> escrowService.refundAllLocked(contract.getId());
            case RELEASE_EXPERT -> escrowService.releaseAllPending(contract.getId());
            case PARTIAL -> log.info("Partial resolution for dispute {} — manual split required", disputeId);
        }

        contract.setStatus(resolution == DisputeResolution.RELEASE_EXPERT
                ? ContractStatus.COMPLETED : ContractStatus.CANCELLED);
        contractRepository.save(contract);

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(resolution);
        dispute.setAdminNote(adminNote);
        dispute.setResolvedAt(LocalDateTime.now());
        disputeRepository.save(dispute);

        // Notify both parties
        String msg = "Tranh chấp hợp đồng #" + contract.getId() + " đã được giải quyết: " + resolution;
        notificationService.send(contract.getClient().getId(), "DISPUTE_RESOLVED", "Giải quyết tranh chấp", msg, contract.getId());
        notificationService.send(contract.getExpert().getId(), "DISPUTE_RESOLVED", "Giải quyết tranh chấp", msg, contract.getId());

        return dispute;
    }
}
