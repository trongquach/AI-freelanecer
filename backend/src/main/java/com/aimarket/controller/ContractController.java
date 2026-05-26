package com.aimarket.controller;

import com.aimarket.dto.contract.ContractResponse;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Contracts", description = "Contract and milestone management")
@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @Operation(summary = "Get contract detail")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ContractResponse getContract(@PathVariable Long id,
                                        @AuthenticationPrincipal CustomUserDetails user) {
        return contractService.getContract(id, user.getUserId());
    }

    @Operation(summary = "My contracts")
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public Page<ContractResponse> myContracts(@AuthenticationPrincipal CustomUserDetails user,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return contractService.myContracts(user.getUserId(), user.getRole().name(), page, size);
    }

    @Operation(summary = "Submit milestone deliverable — EXPERT")
    @PostMapping("/{contractId}/milestones/{milestoneId}/submit")
    @PreAuthorize("hasRole('EXPERT')")
    public ContractResponse submitMilestone(@PathVariable Long contractId,
                                            @PathVariable Long milestoneId,
                                            @RequestBody Map<String, String> body,
                                            @AuthenticationPrincipal CustomUserDetails user) {
        return contractService.completeMilestone(contractId, milestoneId,
                body.get("deliverableUrl"), body.get("note"), user.getUserId());
    }

    @Operation(summary = "Approve milestone — CLIENT")
    @PostMapping("/{contractId}/milestones/{milestoneId}/approve")
    @PreAuthorize("hasRole('CLIENT')")
    public ContractResponse approveMilestone(@PathVariable Long contractId,
                                             @PathVariable Long milestoneId,
                                             @AuthenticationPrincipal CustomUserDetails user) {
        return contractService.approveMilestone(contractId, milestoneId, user.getUserId());
    }

    @Operation(summary = "Reject milestone — CLIENT")
    @PostMapping("/{contractId}/milestones/{milestoneId}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public ContractResponse rejectMilestone(@PathVariable Long contractId,
                                            @PathVariable Long milestoneId,
                                            @AuthenticationPrincipal CustomUserDetails user) {
        return contractService.rejectMilestone(contractId, milestoneId, user.getUserId());
    }
}
