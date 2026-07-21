package com.aimarket.dto.cv;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record ExpertCVRequest(
    @Size(max = 2000) String summary,

    @Valid List<WorkExperienceRequest> workExperiences,
    @Valid List<EducationRequest> educations,
    @Valid List<CertificationRequest> certifications,

    @Size(max = 500) String languages,
    @Size(max = 500) String githubUrl,
    @Size(max = 500) String portfolioUrl,

    @Min(0) @Max(50) Integer yearsOfExperience
) {
    public record WorkExperienceRequest(
        @NotBlank @Size(max = 255) String company,
        @NotBlank @Size(max = 255) String position,
        @Size(max = 2000) String description,
        LocalDate startDate,
        LocalDate endDate,
        boolean current
    ) {}

    public record EducationRequest(
        @NotBlank @Size(max = 255) String school,
        @Size(max = 255) String degree,
        @Size(max = 255) String major,
        Integer graduationYear
    ) {}

    public record CertificationRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 255) String issuer,
        Integer year
    ) {}
}
