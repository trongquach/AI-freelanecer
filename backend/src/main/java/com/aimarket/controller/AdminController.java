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
}
