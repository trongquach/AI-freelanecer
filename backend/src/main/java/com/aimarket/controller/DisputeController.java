package com.aimarket.controller;

import com.aimarket.entity.Dispute;
import com.aimarket.entity.enums.DisputeResolution;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.DisputeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Disputes", description = "Contract dispute management")
@RestController
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    public record OpenDisputeRequest(@NotBlank String reason) {}
    public record ResolveDisputeRequest(DisputeResolution resolution, String adminNote) {}

    @Operation(summary = "Open dispute for a contract")
    @PostMapping("/api/v1/contracts/{contractId}/dispute")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public Dispute open(@PathVariable Long contractId,
                        @RequestBody OpenDisputeRequest req,
                        @AuthenticationPrincipal CustomUserDetails user) {
        return disputeService.openDispute(contractId, user.getUserId(), req.reason());
    }

    @Operation(summary = "List all disputes (ADMIN)")
    @GetMapping("/api/v1/admin/disputes")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Dispute> listAll(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size) {
        return disputeService.listAll(page, size);
    }

    @Operation(summary = "Get dispute detail")
    @GetMapping("/api/v1/disputes/{id}")
    @PreAuthorize("isAuthenticated()")
    public Dispute getById(@PathVariable Long id) {
        return disputeService.getById(id);
    }

    @Operation(summary = "Resolve dispute (ADMIN)")
    @PostMapping("/api/v1/disputes/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public Dispute resolve(@PathVariable Long id, @RequestBody ResolveDisputeRequest req) {
        return disputeService.resolve(id, req.resolution(), req.adminNote());
    }
}
