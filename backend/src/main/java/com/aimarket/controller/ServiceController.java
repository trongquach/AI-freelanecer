package com.aimarket.controller;

import com.aimarket.dto.service.*;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.ExpertServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "Services", description = "Expert service marketplace")
@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ExpertServiceService serviceService;

    @Operation(summary = "Browse marketplace — public")
    @GetMapping
    public Page<ServiceResponse> browse(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer maxDeliveryDays,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return serviceService.browseMarketplace(keyword, minPrice, maxPrice, maxDeliveryDays, minRating, sortBy, page, size);
    }

    @Operation(summary = "Get service detail — public")
    @GetMapping("/{id}")
    public ServiceResponse getService(@PathVariable Long id) {
        return serviceService.getServiceDetail(id);
    }

    @Operation(summary = "Create service — EXPERT only")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('EXPERT')")
    public ServiceResponse createService(@Valid @RequestBody CreateServiceRequest request,
                                         @AuthenticationPrincipal CustomUserDetails user) {
        return serviceService.createService(request, user.getUserId());
    }

    @Operation(summary = "Update service — EXPERT owner")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EXPERT')")
    public ServiceResponse updateService(@PathVariable Long id,
                                         @Valid @RequestBody CreateServiceRequest request,
                                         @AuthenticationPrincipal CustomUserDetails user) {
        return serviceService.updateService(id, request, user.getUserId());
    }

    @Operation(summary = "Delete service — EXPERT owner or ADMIN")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public void deleteService(@PathVariable Long id,
                              @AuthenticationPrincipal CustomUserDetails user) {
        serviceService.deleteService(id, user.getUserId(), user.getRole());
    }

    @Operation(summary = "My services — EXPERT")
    @GetMapping("/my")
    @PreAuthorize("hasRole('EXPERT')")
    public Page<ServiceResponse> myServices(@AuthenticationPrincipal CustomUserDetails user,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return serviceService.getMyServices(user.getUserId(), page, size);
    }

    @Operation(summary = "Activate service — ADMIN only")
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ServiceResponse activate(@PathVariable Long id) {
        return serviceService.activateService(id);
    }

    @Operation(summary = "Deactivate service — EXPERT owner")
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('EXPERT')")
    public ServiceResponse deactivate(@PathVariable Long id,
                                      @AuthenticationPrincipal CustomUserDetails user) {
        return serviceService.deactivateService(id, user.getUserId());
    }
}
