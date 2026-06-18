package com.aimarket.service;

import com.aimarket.dto.proposal.*;
import com.aimarket.entity.*;
import com.aimarket.entity.enums.*;
import com.aimarket.exception.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final EscrowService escrowService;

    // ─── Submit Proposal ─────────────────────────────────
    @Transactional
    public ProposalResponse submit(SubmitProposalRequest request, Long expertId) {
        User expert = userRepository.findById(expertId)
                .orElseThrow(() -> new ResourceNotFoundException("User", expertId));
        if (expert.getRole() != UserRole.EXPERT) throw new ForbiddenException("Only experts can submit proposals");

        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job", request.jobId()));
        if (job.getStatus() != JobStatus.OPEN) throw new BusinessException("Job is not open for proposals");
        if (job.getClient().getId().equals(expertId)) throw new BusinessException("Cannot propose on your own job");
        if (proposalRepository.existsByJobIdAndExpertId(job.getId(), expertId))
            throw new BusinessException("You have already submitted a proposal for this job");

        Proposal proposal = Proposal.builder()
                .job(job)
                .expert(expert)
                .price(request.price())
                .timelineDays(request.timelineDays())
                .coverLetter(request.coverLetter())
                .build();

        return toResponse(proposalRepository.save(proposal));
    }

    // ─── List Proposals for Job (Client view) ────────────
    @Transactional(readOnly = true)
    public Page<ProposalResponse> listForJob(Long jobId, Long clientId, int page, int size) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        if (!job.getClient().getId().equals(clientId)) throw new ForbiddenException();

        return proposalRepository.findByJobId(jobId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    // ─── My Proposals (Expert view) ──────────────────────
    @Transactional(readOnly = true)
    public Page<ProposalResponse> myProposals(Long expertId, int page, int size) {
        return proposalRepository.findByExpertIdOrderByCreatedAtDesc(expertId,
                PageRequest.of(page, size)).map(this::toResponse);
    }

    // ─── Accept Proposal — creates Contract ──────────────
    @Transactional
    public ProposalResponse accept(Long proposalId, Long clientId) {
        Proposal proposal = proposalRepository.findByIdWithDetails(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));

        if (!proposal.getJob().getClient().getId().equals(clientId)) throw new ForbiddenException();
        if (proposal.getStatus() != ProposalStatus.PENDING)
            throw new BusinessException("Proposal is not in PENDING status");

        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposalRepository.save(proposal);

        // Reject all other pending proposals for the same job
        proposalRepository.findByJobId(proposal.getJob().getId(), Pageable.unpaged())
                .stream()
                .filter(p -> !p.getId().equals(proposalId) && p.getStatus() == ProposalStatus.PENDING)
                .forEach(p -> { p.setStatus(ProposalStatus.REJECTED); proposalRepository.save(p); });

        // Update job status
        Job job = proposal.getJob();
        job.setStatus(JobStatus.IN_PROGRESS);
        jobRepository.save(job);

        // Create Contract
        Contract contract = Contract.builder()
                .proposal(proposal)
                .job(job)
                .client(job.getClient())
                .expert(proposal.getExpert())
                .totalAmount(proposal.getPrice())
                .startedAt(LocalDateTime.now())
                .build();
                
        Milestone m1 = Milestone.builder()
                .contract(contract)
                .name("Final Deliverable")
                .description("Complete project delivery based on proposal")
                .amount(proposal.getPrice())
                .dueDate(java.time.LocalDate.now().plusDays(proposal.getTimelineDays()))
                .status(MilestoneStatus.PENDING)
                .orderIndex(1)
                .build();
        contract.getMilestones().add(m1);
        
        contractRepository.save(contract);
        
        escrowService.lockFunds(clientId, contract.getId(), proposal.getPrice());
        log.info("Contract created: {} for job: {}", contract.getId(), job.getId());

        return toResponse(proposal);
    }

    // ─── Reject Proposal ─────────────────────────────────
    @Transactional
    public ProposalResponse reject(Long proposalId, Long clientId) {
        Proposal proposal = proposalRepository.findByIdWithDetails(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));
        if (!proposal.getJob().getClient().getId().equals(clientId)) throw new ForbiddenException();
        if (proposal.getStatus() != ProposalStatus.PENDING)
            throw new BusinessException("Proposal is not in PENDING status");

        proposal.setStatus(ProposalStatus.REJECTED);
        return toResponse(proposalRepository.save(proposal));
    }

    // ─── Withdraw Proposal ───────────────────────────────
    @Transactional
    public void withdraw(Long proposalId, Long expertId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));
        if (!proposal.getExpert().getId().equals(expertId)) throw new ForbiddenException();
        if (proposal.getStatus() != ProposalStatus.PENDING)
            throw new BusinessException("Can only withdraw PENDING proposals");

        proposal.setStatus(ProposalStatus.WITHDRAWN);
        proposalRepository.save(proposal);
    }

    // ─── Map ─────────────────────────────────────────────
    private ProposalResponse toResponse(Proposal p) {
        var profile = p.getExpert().getProfile();
        var expertInfo = new ProposalResponse.ExpertInfo(
                p.getExpert().getId(),
                profile != null ? profile.getFullName() : null,
                profile != null ? profile.getAvatarUrl() : null,
                profile != null ? profile.getRating() : java.math.BigDecimal.ZERO,
                profile != null ? profile.getTotalReviews() : 0
        );
        return new ProposalResponse(p.getId(), p.getJob().getId(), p.getJob().getTitle(),
                expertInfo, p.getPrice(), p.getTimelineDays(), p.getCoverLetter(),
                p.getStatus(), p.getCreatedAt());
    }
}
