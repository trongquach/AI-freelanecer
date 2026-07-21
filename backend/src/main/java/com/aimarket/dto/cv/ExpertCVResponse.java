package com.aimarket.dto.cv;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ExpertCVResponse(
    Long id,
    Long userId,
    String fullName,
    String summary,
    List<WorkExperienceResponse> workExperiences,
    List<EducationResponse> educations,
    List<CertificationResponse> certifications,
    String languages,
    String githubUrl,
    String portfolioUrl,
    Integer yearsOfExperience,
    LocalDateTime updatedAt
) {
    public record WorkExperienceResponse(
        String company,
        String position,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        boolean current
    ) {}

    public record EducationResponse(
        String school,
        String degree,
        String major,
        Integer graduationYear
    ) {}

    public record CertificationResponse(
        String name,
        String issuer,
        Integer year
    ) {}
}
