package com.aimarket.controller;

import com.aimarket.dto.review.*;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Reviews", description = "Rating and review system")
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Submit review for completed contract")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ReviewResponse create(@Valid @RequestBody CreateReviewRequest request,
                                 @AuthenticationPrincipal CustomUserDetails user) {
        return reviewService.create(request, user.getUserId());
    }

    @Operation(summary = "Get reviews for a user")
    @GetMapping("/user/{userId}")
    public Page<ReviewResponse> getForUser(@PathVariable Long userId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return reviewService.getReviewsForUser(userId, page, size);
    }
}
