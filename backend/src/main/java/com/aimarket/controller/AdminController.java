package com.aimarket.controller;

import com.aimarket.dto.admin.PlatformStatsResponse;
import com.aimarket.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Admin", description = "Platform administration")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Platform analytics dashboard")
    @GetMapping("/stats")
    public PlatformStatsResponse getStats() {
        return adminService.getStats();
    }

    @Operation(summary = "Ban a user")
    @PostMapping("/users/{id}/ban")
    public Map<String, String> banUser(@PathVariable Long id) {
        adminService.banUser(id);
        return Map.of("message", "User banned successfully");
    }

    @Operation(summary = "Unban a user")
    @PostMapping("/users/{id}/unban")
    public Map<String, String> unbanUser(@PathVariable Long id) {
        adminService.unbanUser(id);
        return Map.of("message", "User unbanned successfully");
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
}
