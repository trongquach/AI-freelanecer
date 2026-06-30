package com.aimarket.controller;

import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.AIJobAssistantService;
import com.aimarket.service.AIRecommendationService;
import com.aimarket.service.AIServiceGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "AI Modules", description = "AI-powered job assistant, service generator and expert recommendation")
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIJobAssistantService jobAssistant;
    private final AIServiceGeneratorService serviceGenerator;
    private final AIRecommendationService recommendationService;

    public record EnhanceJobRequest(
        @NotBlank String title,
        @NotBlank String description,
        List<String> skills
    ) {}

    public record GenerateServiceRequest(
        @NotBlank String prompt
    ) {}

    // ─── Job AI Enhance ───────────────────────────────────────────────────────

    @Operation(summary = "AI enhance job posting (CLIENT)")
    @PostMapping("/jobs/enhance")
    @PreAuthorize("hasRole('CLIENT')")
    public AIJobAssistantService.AIJobSuggestionDTO enhanceJob(
            @RequestBody EnhanceJobRequest req,
            @AuthenticationPrincipal CustomUserDetails user) {
        return jobAssistant.enhanceJob(req.title(), req.description(),
                req.skills() != null ? req.skills() : List.of());
    }

    // ─── Service Generator ────────────────────────────────────────────────────

    @Operation(summary = "AI generate service description (EXPERT)")
    @PostMapping("/services/generate")
    @PreAuthorize("hasRole('EXPERT')")
    public AIServiceGeneratorService.ServiceGeneratedDTO generateService(
            @RequestBody GenerateServiceRequest req,
            @AuthenticationPrincipal CustomUserDetails user) {
        return serviceGenerator.generate(req.prompt());
    }

    // ─── Expert Recommendation ────────────────────────────────────────────────

    @Operation(summary = "Get AI-recommended experts for a job (public)")
    @GetMapping("/jobs/{jobId}/recommend-experts")
    public List<AIRecommendationService.ExpertRecommendationDTO> recommendExperts(
            @PathVariable Long jobId) {
        return recommendationService.getTopExperts(jobId);
    }
}

