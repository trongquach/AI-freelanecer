package com.aimarket.controller;

import com.aimarket.dto.admin.PlatformStatsResponse;
import com.aimarket.service.AdminService;
import com.aimarket.service.ContractService;
import com.aimarket.service.EscrowService;
import com.aimarket.service.NotificationService;
import com.aimarket.repository.ContractRepository;
import com.aimarket.entity.enums.ContractStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.aimarket.entity.Transaction;
import com.aimarket.repository.TransactionRepository;
import java.util.Map;

@Tag(name = "Admin", description = "Platform administration")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ContractRepository contractRepository;
    private final ContractService contractService;
    private final EscrowService escrowService;
    private final NotificationService notificationService;
    private final TransactionRepository transactionRepository;

    @Operation(summary = "Platform analytics dashboard")
    @GetMapping("/stats")
    public PlatformStatsResponse getStats() {
        return adminService.getStats();
    }

    @Operation(summary = "Ban a user")
    @PostMapping("/users/{id}/ban")
    public Map<String, String> banUser(@PathVariable Long id) {
        adminService.banUser(id);
        notificationService.broadcastAdminEvent("USER_UPDATED");
        return Map.of("message", "User banned successfully");
    }

    @Operation(summary = "Unban a user")
    @PostMapping("/users/{id}/unban")
    public Map<String, String> unbanUser(@PathVariable Long id) {
        adminService.unbanUser(id);
        notificationService.broadcastAdminEvent("USER_UPDATED");
        return Map.of("message", "User unbanned successfully");
    }

    @Operation(summary = "Settle pending earnings for expert")
    @PostMapping("/users/{id}/settle-earnings")
    public Map<String, String> settleEarnings(@PathVariable Long id) {
        escrowService.settleAllPendingEarnings(id);
        notificationService.broadcastAdminEvent("WALLET_UPDATED");
        return Map.of("message", "Pending earnings settled successfully");
    }

    @Operation(summary = "Broadcast a notification to all users")
    @PostMapping("/notifications/broadcast")
    public Map<String, String> broadcastNotification(@RequestBody Map<String, String> payload) {
        adminService.broadcastNotification(payload.get("title"), payload.get("content"));
        return Map.of("message", "Broadcast sent successfully");
    }

    @Operation(summary = "Activate a service listing")
    @PostMapping("/services/{id}/activate")
    public Map<String, String> activateService(@PathVariable Long id) {
        adminService.activateService(id);
        return Map.of("message", "Service activated");
    }

    @Operation(summary = "Reject a service listing")
    @PostMapping("/services/{id}/reject")
    public Map<String, String> rejectService(@PathVariable Long id) {
        adminService.rejectService(id);
        return Map.of("message", "Service rejected");
    }

    @Operation(summary = "Get all users")
    @GetMapping("/users")
    public Page<com.aimarket.dto.admin.UserDto> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getUsers(org.springframework.data.domain.PageRequest.of(page, size));
    }

    @Operation(summary = "Get pending services for moderation")
    @GetMapping("/services/pending")
    public Page<com.aimarket.dto.service.ServiceResponse> getPendingServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getPendingServices(org.springframework.data.domain.PageRequest.of(page, size));
    }

    @Operation(summary = "Get all transactions")
    @GetMapping("/transactions")
    public Page<com.aimarket.entity.Transaction> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getTransactions(org.springframework.data.domain.PageRequest.of(page, size));
    }

    @Operation(summary = "Get all jobs for admin")
    @GetMapping("/jobs")
    public org.springframework.data.domain.Page<com.aimarket.dto.job.JobResponse> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getAllJobs(org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()));
    }

    @Operation(summary = "Get all services for admin")
    @GetMapping("/services/all")
    public org.springframework.data.domain.Page<com.aimarket.dto.service.ServiceResponse> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getAllServices(org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()));
    }

    @Operation(summary = "Delete a job")
    @DeleteMapping("/jobs/{id}")
    public Map<String, String> deleteJob(@PathVariable Long id) {
        adminService.deleteJob(id);
        return Map.of("message", "Job deleted successfully");
    }

    @Operation(summary = "Delete a service")
    @DeleteMapping("/services/{id}")
    public Map<String, String> deleteService(@PathVariable Long id) {
        adminService.deleteService(id);
        return Map.of("message", "Service deleted successfully");
    }

    @Operation(summary = "Get all active contracts with escrow")
    @GetMapping("/contracts/active")
    public Page<com.aimarket.dto.contract.ContractResponse> getActiveContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return contractRepository.findByStatus(ContractStatus.ACTIVE, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(contractService::toResponse);
    }

    @Operation(summary = "Get all contracts (ACTIVE + COMPLETED) for admin escrow view")
    @GetMapping("/contracts/all")
    public Page<com.aimarket.dto.contract.ContractResponse> getAllContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return contractRepository.findByStatusIn(
                java.util.List.of(ContractStatus.ACTIVE, ContractStatus.COMPLETED),
                PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(contractService::toResponse);
    }

    @Operation(summary = "Admin force release escrow to expert")
    @PostMapping("/contracts/{id}/release-escrow")
    public Map<String, String> releaseEscrowToExpert(@PathVariable Long id) {
        escrowService.releaseAllPending(id);
        return Map.of("message", "Funds released to expert successfully");
    }

    @Operation(summary = "Get all pending clearing transactions")
    @GetMapping("/escrow/pending-clearings")
    public Page<Transaction> getPendingClearings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return transactionRepository.findByTypeAndStatusOrderByCreatedAtDesc(
                com.aimarket.entity.enums.TransactionType.RELEASE, "PENDING",
                PageRequest.of(page, size)
        );
    }

    @Operation(summary = "Settle a specific pending earning transaction")
    @PostMapping("/escrow/clearings/{id}/settle")
    public Map<String, String> settleClearingTransaction(@PathVariable Long id) {
        Transaction tx = transactionRepository.findById(id).orElseThrow();
        escrowService.settleEarning(tx);
        notificationService.broadcastAdminEvent("WALLET_UPDATED");
        return Map.of("message", "Earning settled successfully");
    }
}
