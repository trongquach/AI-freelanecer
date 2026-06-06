package com.aimarket.controller;

import com.aimarket.dto.profile.PortfolioItemRequest;
import com.aimarket.dto.profile.UpdateProfileRequest;
import com.aimarket.dto.profile.UserProfileResponse;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "User Profile", description = "View and update user profile")
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    // ─── Get my profile ───────────────────────────────────
    @Operation(summary = "Get my profile")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(userProfileService.getProfile(user.getUserId()));
    }

    // ─── Update my profile ────────────────────────────────
    @Operation(summary = "Update my profile")
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userProfileService.updateProfile(user.getUserId(), request));
    }

    // ─── Set availability (experts) ───────────────────────
    @Operation(summary = "Toggle availability (Experts only)")
    @PatchMapping("/me/availability")
    @PreAuthorize("hasRole('EXPERT')")
    public ResponseEntity<UserProfileResponse> setAvailability(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody Map<String, Boolean> body) {
        boolean available = Boolean.TRUE.equals(body.get("available"));
        return ResponseEntity.ok(userProfileService.setAvailability(user.getUserId(), available));
    }

    // ─── Get any user's public profile ────────────────────
    @Operation(summary = "Get public profile by user ID")
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getPublicProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userProfileService.getPublicProfile(userId));
    }

    // ─── Portfolio ─────────────────────────────────────────
    @Operation(summary = "Add portfolio item")
    @PostMapping("/me/portfolio")
    @PreAuthorize("hasRole('EXPERT')")
    public ResponseEntity<UserProfileResponse> addPortfolioItem(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody PortfolioItemRequest request) {
        return ResponseEntity.ok(userProfileService.addPortfolioItem(user.getUserId(), request));
    }

    @Operation(summary = "Update portfolio item")
    @PutMapping("/me/portfolio/{itemId}")
    @PreAuthorize("hasRole('EXPERT')")
    public ResponseEntity<UserProfileResponse> updatePortfolioItem(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long itemId,
            @Valid @RequestBody PortfolioItemRequest request) {
        return ResponseEntity.ok(userProfileService.updatePortfolioItem(user.getUserId(), itemId, request));
    }

    @Operation(summary = "Delete portfolio item")
    @DeleteMapping("/me/portfolio/{itemId}")
    @PreAuthorize("hasRole('EXPERT')")
    public ResponseEntity<UserProfileResponse> deletePortfolioItem(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(userProfileService.deletePortfolioItem(user.getUserId(), itemId));
    }
}
