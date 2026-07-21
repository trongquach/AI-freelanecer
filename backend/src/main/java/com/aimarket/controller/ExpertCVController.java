package com.aimarket.controller;

import com.aimarket.dto.cv.ExpertCVRequest;
import com.aimarket.dto.cv.ExpertCVResponse;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.ExpertCVService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Expert CV", description = "Expert CV management — nhập tay vào hệ thống")
@RestController
@RequestMapping("/api/v1/cv")
@RequiredArgsConstructor
public class ExpertCVController {

    private final ExpertCVService expertCVService;

    @Operation(summary = "Expert tạo hoặc cập nhật CV của mình trong hệ thống")
    @PutMapping
    @PreAuthorize("hasRole('EXPERT')")
    public ExpertCVResponse upsert(@Valid @RequestBody ExpertCVRequest request,
                                   @AuthenticationPrincipal CustomUserDetails user) {
        return expertCVService.upsert(request, user.getUserId());
    }

    @Operation(summary = "Expert xem CV của chính mình")
    @GetMapping("/my")
    @PreAuthorize("hasRole('EXPERT')")
    public ExpertCVResponse getMyCv(@AuthenticationPrincipal CustomUserDetails user) {
        return expertCVService.getMyCv(user.getUserId());
    }

    @Operation(summary = "Client/Admin xem CV của một Expert theo userId")
    @GetMapping("/expert/{userId}")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public ExpertCVResponse getCvByUserId(@PathVariable Long userId) {
        return expertCVService.getCvByUserId(userId);
    }
}
