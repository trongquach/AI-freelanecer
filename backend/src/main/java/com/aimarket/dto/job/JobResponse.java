package com.aimarket.dto.job;

import com.aimarket.entity.enums.JobStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record JobResponse(
    Long id,
    String title,
    String description,
    BigDecimal budgetMin,
    BigDecimal budgetMax,
    LocalDate deadline,
    LocalDate startDate,
    String expectedDuration,
    JobStatus status,
    Boolean aiEnhanced,
    Integer viewCount,
    /** Số ứng viên tối đa cho vòng phỏng vấn */
    Integer maxShortlist,
    /** Ngưỡng điểm AI sàng lọc (0.0 – 1.0) */
    Double aiScreeningThreshold,
    ClientInfo client,
    List<SkillInfo> skills,
    LocalDateTime createdAt
) {
    public record ClientInfo(Long id, String fullName, String avatarUrl, Double rating) {}
    public record SkillInfo(Long id, String name, String category) {}
}

