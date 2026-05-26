package com.aimarket.controller;

import com.aimarket.dto.job.*;
import com.aimarket.entity.enums.JobStatus;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Jobs", description = "Job posting and management")
@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @Operation(summary = "List/search jobs — public")
    @GetMapping
    public Page<JobResponse> listJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) List<Long> skillIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return jobService.listJobs(new JobFilterRequest(keyword, minBudget, maxBudget,
                status != null ? status : JobStatus.OPEN, skillIds, page, size));
    }

    @Operation(summary = "Create a new job — CLIENT only")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENT')")
    public JobResponse createJob(@Valid @RequestBody CreateJobRequest request,
                                 @AuthenticationPrincipal CustomUserDetails user) {
        return jobService.createJob(request, user.getUserId());
    }

    @Operation(summary = "Get job detail — public")
    @GetMapping("/{id}")
    public JobResponse getJob(@PathVariable Long id) {
        return jobService.getJob(id);
    }

    @Operation(summary = "Update job — CLIENT owner or ADMIN")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public JobResponse updateJob(@PathVariable Long id,
                                 @RequestBody UpdateJobRequest request,
                                 @AuthenticationPrincipal CustomUserDetails user) {
        return jobService.updateJob(id, request, user.getUserId(), user.getRole());
    }

    @Operation(summary = "Delete job — CLIENT owner or ADMIN")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public void deleteJob(@PathVariable Long id,
                          @AuthenticationPrincipal CustomUserDetails user) {
        jobService.deleteJob(id, user.getUserId(), user.getRole());
    }

    @Operation(summary = "Publish job from DRAFT to OPEN — CLIENT owner")
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('CLIENT')")
    public JobResponse publishJob(@PathVariable Long id,
                                  @AuthenticationPrincipal CustomUserDetails user) {
        return jobService.publishJob(id, user.getUserId());
    }

    @Operation(summary = "My jobs — CLIENT")
    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public Page<JobResponse> myJobs(@AuthenticationPrincipal CustomUserDetails user,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return jobService.listMyJobs(user.getUserId(), page, size);
    }
}
