package com.aimarket.controller;

import com.aimarket.dto.proposal.*;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.ProposalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Proposals", description = "Job proposal management")
@RestController
@RequestMapping("/api/v1/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    @Operation(summary = "Submit proposal — EXPERT only")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('EXPERT')")
    public ProposalResponse submit(@Valid @RequestBody SubmitProposalRequest request,
                                   @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.submit(request, user.getUserId());
    }

    @Operation(summary = "List proposals for a job — CLIENT owner")
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public Page<ProposalResponse> listForJob(@PathVariable Long jobId,
                                             @AuthenticationPrincipal CustomUserDetails user,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return proposalService.listForJob(jobId, user.getUserId(), page, size);
    }

    @Operation(summary = "My submitted proposals — EXPERT")
    @GetMapping("/my")
    @PreAuthorize("hasRole('EXPERT')")
    public Page<ProposalResponse> myProposals(@AuthenticationPrincipal CustomUserDetails user,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return proposalService.myProposals(user.getUserId(), page, size);
    }

    @Operation(summary = "Accept proposal — CLIENT owner")
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('CLIENT')")
    public ProposalResponse accept(@PathVariable Long id,
                                   @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.accept(id, user.getUserId());
    }

    @Operation(summary = "Reject proposal — CLIENT owner")
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public ProposalResponse reject(@PathVariable Long id,
                                   @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.reject(id, user.getUserId());
    }

    @Operation(summary = "Withdraw proposal — EXPERT owner")
    @PostMapping("/{id}/withdraw")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('EXPERT')")
    public void withdraw(@PathVariable Long id,
                         @AuthenticationPrincipal CustomUserDetails user) {
        proposalService.withdraw(id, user.getUserId());
    }
}
