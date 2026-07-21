package com.aimarket.service;

import com.aimarket.dto.job.*;
import com.aimarket.entity.Job;
import com.aimarket.entity.Skill;
import com.aimarket.entity.User;
import com.aimarket.entity.enums.JobStatus;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.exception.BusinessException;
import com.aimarket.exception.ForbiddenException;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.repository.JobRepository;
import com.aimarket.repository.SkillRepository;
import com.aimarket.repository.UserRepository;
import com.aimarket.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    // ─── Create Job ───────────────────────────────────────
    @Transactional
    public JobResponse createJob(CreateJobRequest request, Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", clientId));

        if (client.getRole() != UserRole.CLIENT) {
            throw new ForbiddenException("Only clients can create jobs");
        }

        Set<Skill> skills = resolveSkills(request.skillIds());

        Job job = Job.builder()
                .client(client)
                .title(request.title())
                .description(request.description())
                .budgetMin(request.budgetMin())
                .budgetMax(request.budgetMax())
                .deadline(request.deadline())
                .startDate(request.startDate())
                .expectedDuration(request.expectedDuration())
                .status(JobStatus.DRAFT)
                .skills(skills)
                .maxShortlist(request.maxShortlist() != null ? request.maxShortlist() : 5)
                .aiScreeningThreshold(request.aiScreeningThreshold() != null ? request.aiScreeningThreshold() : 0.6)
                .build();

        return toResponse(jobRepository.save(job));
    }

    // ─── Update Job ───────────────────────────────────────
    @Transactional
    public JobResponse updateJob(Long jobId, UpdateJobRequest request, Long currentUserId, UserRole currentRole) {
        Job job = findJobOrThrow(jobId);
        checkOwnerOrAdmin(job, currentUserId, currentRole);

        if (request.title()       != null) job.setTitle(request.title());
        if (request.description() != null) job.setDescription(request.description());
        if (request.budgetMin()   != null) job.setBudgetMin(request.budgetMin());
        if (request.budgetMax()   != null) job.setBudgetMax(request.budgetMax());
        if (request.deadline()    != null) job.setDeadline(request.deadline());
        if (request.startDate()   != null) job.setStartDate(request.startDate());
        if (request.expectedDuration() != null) job.setExpectedDuration(request.expectedDuration());
        if (request.skillIds()    != null) job.setSkills(resolveSkills(request.skillIds()));

        return toResponse(jobRepository.save(job));
    }

    // ─── Delete Job ───────────────────────────────────────
    @Transactional
    public void deleteJob(Long jobId, Long currentUserId, UserRole currentRole) {
        Job job = findJobOrThrow(jobId);
        checkOwnerOrAdmin(job, currentUserId, currentRole);

        if (job.getStatus() != JobStatus.DRAFT && job.getStatus() != JobStatus.OPEN) {
            throw new BusinessException("Cannot delete job with status: " + job.getStatus());
        }
        jobRepository.delete(job);
    }

    // ─── Get Job Detail ───────────────────────────────────
    @Transactional
    public JobResponse getJob(Long jobId) {
        Job job = findJobOrThrow(jobId);
        incrementViewCountAsync(jobId);
        return toResponse(job);
    }

    // ─── Publish Job ──────────────────────────────────────
    @Transactional
    public JobResponse publishJob(Long jobId, Long clientId) {
        Job job = findJobOrThrow(jobId);
        if (!job.getClient().getId().equals(clientId)) throw new ForbiddenException();

        if (job.getStatus() != JobStatus.DRAFT) {
            throw new BusinessException("Only DRAFT jobs can be published");
        }
        if (job.getTitle() == null || job.getDescription() == null || job.getBudgetMax() == null) {
            throw new BusinessException("Job must have title, description and budget before publishing");
        }

        job.setStatus(JobStatus.OPEN);
        return toResponse(jobRepository.save(job));
    }

    // ─── List Jobs (public) ───────────────────────────────
    @Transactional(readOnly = true)
    public Page<JobResponse> listJobs(JobFilterRequest filter) {
        PageRequest pageable = PageRequest.of(filter.page(), filter.size(),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        return jobRepository.findJobsWithFilter(
                filter.status(),
                filter.minBudget(),
                filter.maxBudget(),
                filter.keyword(),
                (filter.skillIds() != null && !filter.skillIds().isEmpty()) ? filter.skillIds() : null,
                pageable
        ).map(this::toResponse);
    }

    // ─── My Jobs ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<JobResponse> listMyJobs(Long clientId, int page, int size) {
        return jobRepository.findByClientIdOrderByCreatedAtDesc(clientId,
                PageRequest.of(page, size)).map(this::toResponse);
    }

    // ─── Helpers ──────────────────────────────────────────
    private Job findJobOrThrow(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", id));
    }

    private void checkOwnerOrAdmin(Job job, Long userId, UserRole role) {
        if (role == UserRole.ADMIN) return;
        if (!job.getClient().getId().equals(userId)) throw new ForbiddenException();
    }

    private Set<Skill> resolveSkills(List<Long> skillIds) {
        if (skillIds == null || skillIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(skillRepository.findAllById(skillIds));
    }

    @Async
    public void incrementViewCountAsync(Long jobId) {
        try { jobRepository.incrementViewCount(jobId); }
        catch (Exception e) { log.warn("Failed to increment view count for job {}", jobId); }
    }

    public JobResponse toResponse(Job job) {
        var profile = job.getClient().getProfile();
        var clientInfo = new JobResponse.ClientInfo(
                job.getClient().getId(),
                profile != null ? profile.getFullName() : null,
                profile != null ? profile.getAvatarUrl() : null,
                profile != null && profile.getRating() != null ? profile.getRating().doubleValue() : 0.0
        );
        var skillInfos = job.getSkills().stream()
                .map(s -> new JobResponse.SkillInfo(s.getId(), s.getName(), s.getCategory()))
                .collect(Collectors.toList());

        return new JobResponse(
                job.getId(), job.getTitle(), job.getDescription(),
                job.getBudgetMin(), job.getBudgetMax(), job.getDeadline(),
                job.getStartDate(), job.getExpectedDuration(),
                job.getStatus(), job.getAiEnhanced(), job.getViewCount(),
                job.getMaxShortlist(), job.getAiScreeningThreshold(),
                clientInfo, skillInfos, job.getCreatedAt()
        );
    }
}
