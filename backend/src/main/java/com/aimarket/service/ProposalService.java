package com.aimarket.service;

import com.aimarket.dto.proposal.*;
import com.aimarket.entity.*;
import com.aimarket.entity.enums.*;
import com.aimarket.exception.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final EscrowService escrowService;
    private final NotificationService notificationService;
    private final AICVScreeningService aiCVScreeningService;
    private final ExpertCVService expertCVService;
    private final UserProfileRepository userProfileRepository;

    // ─── Submit Proposal ─────────────────────────────────────
    @Transactional
    public ProposalResponse submit(SubmitProposalRequest request, Long expertId) {
        User expert = userRepository.findById(expertId)
                .orElseThrow(() -> new ResourceNotFoundException("User", expertId));
        if (expert.getRole() != UserRole.EXPERT) throw new ForbiddenException("Only experts can submit proposals");

        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job", request.jobId()));
        if (job.getStatus() != JobStatus.OPEN && job.getStatus() != JobStatus.INTERVIEWING) {
            throw new BusinessException("Job is not open for proposals");
        }
        if (job.getClient().getId().equals(expertId)) throw new BusinessException("Cannot propose on your own job");
        if (proposalRepository.existsByJobIdAndExpertId(job.getId(), expertId))
            throw new BusinessException("You have already submitted a proposal for this job");

        Proposal proposal = Proposal.builder()
                .job(job)
                .expert(expert)
                .price(request.price())
                .timelineDays(request.timelineDays())
                .coverLetter(request.coverLetter())
                .status(ProposalStatus.PENDING)
                .build();

        Proposal saved = proposalRepository.save(proposal);

        // Trigger AI CV screening bất đồng bộ
        triggerAIScreening(saved, job, expert);

        return toResponse(saved);
    }

    // ─── List CV đã qua AI — Client xem ──────────────────────
    @Transactional(readOnly = true)
    public Page<ProposalResponse> listPassedForJob(Long jobId, Long clientId, int page, int size) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        if (!job.getClient().getId().equals(clientId)) throw new ForbiddenException();

        return proposalRepository.findByJobIdAndStatusOrderByAiScoreDesc(
                jobId, ProposalStatus.AI_PASSED, PageRequest.of(page, size)
        ).map(this::toResponse);
    }

    // ─── List ứng viên đang trong vòng phỏng vấn ─────────────
    @Transactional(readOnly = true)
    public List<ProposalResponse> listInterviewCandidates(Long jobId, Long clientId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        if (!job.getClient().getId().equals(clientId)) throw new ForbiddenException();

        return proposalRepository.findByJobIdAndStatusIn(
                jobId, List.of(ProposalStatus.SHORTLISTED, ProposalStatus.INTERVIEWED)
        ).stream().map(this::toResponse).toList();
    }

    // ─── All proposals (Admin) ────────────────────────────────
    @Transactional(readOnly = true)
    public Page<ProposalResponse> listForJob(Long jobId, Long clientId, int page, int size) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        if (!job.getClient().getId().equals(clientId)) throw new ForbiddenException();
        return proposalRepository.findByJobId(jobId, PageRequest.of(page, size)).map(this::toResponse);
    }

    // ─── My Proposals (Expert view) ───────────────────────────
    @Transactional(readOnly = true)
    public Page<ProposalResponse> myProposals(Long expertId, int page, int size) {
        return proposalRepository.findByExpertIdOrderByCreatedAtDesc(expertId,
                PageRequest.of(page, size)).map(this::toResponse);
    }

    // ─── Client shortlist ứng viên vào Vòng Phỏng Vấn ────────
    @Transactional
    public ProposalResponse shortlist(Long proposalId, Long clientId) {
        Proposal proposal = proposalRepository.findByIdWithDetails(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));

        if (!proposal.getJob().getClient().getId().equals(clientId)) throw new ForbiddenException();
        if (proposal.getStatus() != ProposalStatus.AI_PASSED)
            throw new BusinessException("Chỉ có thể mời ứng viên đã qua sàng lọc AI vào phỏng vấn");

        // Kiểm tra giới hạn số ứng viên phỏng vấn
        long currentShortlisted = proposalRepository.countByJobIdAndStatus(
                proposal.getJob().getId(), ProposalStatus.SHORTLISTED)
                + proposalRepository.countByJobIdAndStatus(
                proposal.getJob().getId(), ProposalStatus.INTERVIEWED);

        int maxShortlist = proposal.getJob().getMaxShortlist() != null
                ? proposal.getJob().getMaxShortlist() : 5;

        if (currentShortlisted >= maxShortlist) {
            throw new BusinessException("Đã đạt tối đa " + maxShortlist + " ứng viên phỏng vấn. " +
                    "Hãy loại bớt một ứng viên trước khi mời thêm.");
        }

        proposal.setStatus(ProposalStatus.SHORTLISTED);
        proposalRepository.save(proposal);

        // Cập nhật Job status → INTERVIEWING nếu chưa
        Job job = proposal.getJob();
        if (job.getStatus() == JobStatus.OPEN) {
            job.setStatus(JobStatus.INTERVIEWING);
            jobRepository.save(job);
        }

        // Tạo Contract tạm thời để có thể chat trong lúc phỏng vấn
        Contract contract = Contract.builder()
                .proposal(proposal)
                .job(job)
                .client(job.getClient())
                .expert(proposal.getExpert())
                .totalAmount(proposal.getPrice()) // tạm dùng giá proposal
                .status(ContractStatus.INTERVIEWING)
                .startedAt(LocalDateTime.now())
                .build();
        contractRepository.save(contract);

        // Thông báo cho Expert
        notificationService.send(
                proposal.getExpert().getId(),
                "SHORTLISTED",
                "🎉 You are invited to an interview!",
                "The client wants to interview you for the job: \"" + job.getTitle() + "\". " +
                "Please go to the chat to discuss further!",
                contract.getId()
        );

        return toResponse(proposal);
    }

    // ─── Client đánh dấu đã phỏng vấn + ghi chú ──────────────
    @Transactional
    public ProposalResponse markInterviewed(Long proposalId, Long clientId, String notes) {
        Proposal proposal = proposalRepository.findByIdWithDetails(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));

        if (!proposal.getJob().getClient().getId().equals(clientId)) throw new ForbiddenException();
        if (proposal.getStatus() != ProposalStatus.SHORTLISTED)
            throw new BusinessException("Ứng viên phải ở trạng thái SHORTLISTED trước khi đánh dấu đã phỏng vấn");

        proposal.setStatus(ProposalStatus.INTERVIEWED);
        if (notes != null && !notes.isBlank()) {
            proposal.setInterviewNotes(notes);
        }
        proposalRepository.save(proposal);

        return toResponse(proposal);
    }

    // ─── Accept Proposal — tạo Contract ──────────────────────
    @Transactional
    public ProposalResponse accept(Long proposalId, AcceptProposalRequest request, Long clientId) {
        Proposal proposal = proposalRepository.findByIdWithDetails(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));

        if (!proposal.getJob().getClient().getId().equals(clientId)) throw new ForbiddenException();

        // Chỉ chấp nhận ứng viên đã qua phỏng vấn
        if (proposal.getStatus() != ProposalStatus.INTERVIEWED) {
            throw new BusinessException("Chỉ có thể chốt ứng viên sau khi đã phỏng vấn (trạng thái INTERVIEWED)");
        }

        // Validate milestones
        if (request == null || request.milestones() == null || request.milestones().isEmpty()) {
            throw new BusinessException("Cần ít nhất một milestone để tạo hợp đồng");
        }
        java.math.BigDecimal totalMilestoneAmount = request.milestones().stream()
                .map(AcceptProposalRequest.MilestoneRequest::amount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        if (totalMilestoneAmount.compareTo(proposal.getPrice()) != 0) {
            throw new BusinessException("Tổng tiền milestone phải bằng giá đề xuất: " + proposal.getPrice());
        }

        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposalRepository.save(proposal);

        // Từ chối tất cả ứng viên còn lại (bulk update hiệu quả hơn)
        proposalRepository.bulkUpdateStatus(
                proposal.getJob().getId(),
                ProposalStatus.REJECTED,
                List.of(ProposalStatus.PENDING, ProposalStatus.AI_SCREENING,
                        ProposalStatus.AI_PASSED, ProposalStatus.SHORTLISTED, ProposalStatus.INTERVIEWED),
                proposalId
        );

        // Cập nhật Job → IN_PROGRESS
        Job job = proposal.getJob();
        job.setStatus(JobStatus.IN_PROGRESS);
        jobRepository.save(job);

        // Update existing Contract + Milestones
        Contract contract = contractRepository.findByProposalId(proposalId)
                .orElseThrow(() -> new BusinessException("Contract not found"));
        
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setTotalAmount(proposal.getPrice());
        contract.setStartedAt(LocalDateTime.now());
        
        // Clear any existing milestones just in case
        if (contract.getMilestones() != null) {
            contract.getMilestones().clear();
        }

        int orderIndex = 1;
        for (AcceptProposalRequest.MilestoneRequest mr : request.milestones()) {
            Milestone milestone = Milestone.builder()
                    .contract(contract)
                    .name(mr.name())
                    .description(mr.description())
                    .amount(mr.amount())
                    .dueDate(mr.dueDate())
                    .status(MilestoneStatus.PENDING)
                    .orderIndex(orderIndex++)
                    .build();
            contract.getMilestones().add(milestone);
        }
        contractRepository.save(contract);

        // Khoá tiền Escrow
        escrowService.lockFunds(clientId, contract.getId(), proposal.getPrice());
        log.info("Contract {} created for job {} — expert {}", contract.getId(), job.getId(), proposal.getExpert().getId());

        // Thông báo trúng tuyển
        notificationService.send(
                proposal.getExpert().getId(),
                "CONTRACT_CREATED",
                "🎉 Congratulations! You are hired!",
                "The client has hired you for the job: \"" + job.getTitle() + "\". Your contract has been created.",
                contract.getId()
        );

        return toResponse(proposal);
    }

    // ─── Reject Proposal ─────────────────────────────────────
    @Transactional
    public ProposalResponse reject(Long proposalId, Long clientId) {
        Proposal proposal = proposalRepository.findByIdWithDetails(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));
        if (!proposal.getJob().getClient().getId().equals(clientId)) throw new ForbiddenException();

        if (!List.of(ProposalStatus.AI_PASSED, ProposalStatus.SHORTLISTED, ProposalStatus.INTERVIEWED)
                .contains(proposal.getStatus())) {
            throw new BusinessException("Không thể từ chối ứng viên ở trạng thái: " + proposal.getStatus());
        }

        proposal.setStatus(ProposalStatus.REJECTED);
        return toResponse(proposalRepository.save(proposal));
    }

    // ─── Withdraw Proposal ────────────────────────────────────
    @Transactional
    public void withdraw(Long proposalId, Long expertId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));
        if (!proposal.getExpert().getId().equals(expertId)) throw new ForbiddenException();

        if (!List.of(ProposalStatus.PENDING, ProposalStatus.AI_SCREENING,
                ProposalStatus.AI_PASSED, ProposalStatus.SHORTLISTED)
                .contains(proposal.getStatus())) {
            throw new BusinessException("Không thể rút đơn ở trạng thái: " + proposal.getStatus());
        }

        proposal.setStatus(ProposalStatus.WITHDRAWN);
        proposalRepository.save(proposal);
    }

    // ─── AI Screening trigger ─────────────────────────────────
    private void triggerAIScreening(Proposal proposal, Job job, User expert) {
        try {
            List<String> jobSkills = job.getSkills().stream()
                    .map(s -> s.getName()).toList();
            List<String> expertSkills = userProfileRepository.findSkillNamesByUserId(expert.getId());

            var profile = expert.getProfile();
            String expertBio = profile != null ? profile.getBio() : "";

            // Lấy nội dung CV từ hệ thống
            String cvText = expertCVService.buildCvText(expert.getId());
            String cvSummary = expertCVService.getYearsOfExperience(expert.getId()) != null
                    ? cvText : "";
            Integer yearsExp = expertCVService.getYearsOfExperience(expert.getId());

            double threshold = job.getAiScreeningThreshold() != null
                    ? job.getAiScreeningThreshold() : 0.6;

            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            aiCVScreeningService.screenAsync(
                                    proposal.getId(),
                                    job.getTitle(),
                                    job.getDescription(),
                                    jobSkills,
                                    proposal.getCoverLetter(),
                                    expertBio,
                                    expertSkills,
                                    cvSummary,
                                    cvText,
                                    yearsExp,
                                    threshold,
                                    expert.getId()
                            );
                        } catch (Exception e) {
                            log.warn("Failed to submit async AI screening task for proposal {}: {}", proposal.getId(), e.getMessage());
                        }
                    }
                }
            );
        } catch (Exception e) {
            log.warn("Failed to setup AI screening for proposal {}: {}", proposal.getId(), e.getMessage());
        }
    }

    // ─── Map to Response ─────────────────────────────────────
    public ProposalResponse toResponse(Proposal p) {
        var profile = p.getExpert().getProfile();
        List<String> skills = userProfileRepository.findSkillNamesByUserId(p.getExpert().getId());
        Integer yearsExp = expertCVService.getYearsOfExperience(p.getExpert().getId());

        var expertInfo = new ProposalResponse.ExpertInfo(
                p.getExpert().getId(),
                profile != null ? profile.getFullName() : null,
                profile != null ? profile.getAvatarUrl() : null,
                profile != null ? profile.getRating() : java.math.BigDecimal.ZERO,
                profile != null ? profile.getTotalReviews() : 0,
                skills,
                yearsExp
        );

        Contract contract = contractRepository.findByProposalId(p.getId()).orElse(null);
        Long contractId = contract != null ? contract.getId() : null;

        return new ProposalResponse(
                p.getId(), contractId, p.getJob().getId(), p.getJob().getTitle(),
                expertInfo,
                p.getPrice(), p.getTimelineDays(), p.getCoverLetter(),
                p.getStatus(),
                p.getAiScore(), p.getAiFeedback(),
                p.getInterviewNotes(),
                p.getCreatedAt()
        );
    }
}
