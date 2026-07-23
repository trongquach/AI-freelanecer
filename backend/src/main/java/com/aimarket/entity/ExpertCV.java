package com.aimarket.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CV do Expert tự nhập vào hệ thống.
 * Mỗi Expert chỉ có 1 CV (OneToOne với User).
 * AI sẽ đọc CV này để chấm điểm khi Expert nộp đơn ứng tuyển.
 */
@Entity
@Table(name = "expert_cvs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpertCV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** Tóm tắt bản thân / mục tiêu nghề nghiệp */
    @Column(columnDefinition = "TEXT")
    private String summary;

    /** Kinh nghiệm làm việc — lưu dạng JSON array */
    @Column(name = "work_experiences", columnDefinition = "JSON")
    private String workExperiences;

    /** Học vấn — lưu dạng JSON array */
    @Column(columnDefinition = "JSON")
    private String educations;

    /** Chứng chỉ — lưu dạng JSON array */
    @Column(columnDefinition = "JSON")
    private String certifications;

    /** Ngôn ngữ sử dụng được (ví dụ: "Tiếng Việt, English (B2)") */
    @Column(length = 500)
    private String languages;

    /** Link Github / Portfolio bổ sung */
    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    /** Số năm kinh nghiệm tổng cộng */
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    /**
     * Vector embedding của toàn bộ nội dung CV (summary + work experiences + skills).
     * Được sinh tự động khi Expert tạo/cập nhật CV.
     * Dùng bởi {@link com.aimarket.service.AICVScreeningService} để tính cosine similarity.
     */
    @Column(name = "cv_embedding", columnDefinition = "JSON")
    private String cvEmbedding;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Nested value objects (stored as JSON) ──────────────────

    /** Một mục kinh nghiệm làm việc */
    public record WorkExperience(
        String company,
        String position,
        String description,
        LocalDate startDate,
        LocalDate endDate,       // null = đang làm hiện tại
        boolean current
    ) {}

    /** Một mục học vấn */
    public record Education(
        String school,
        String degree,
        String major,
        Integer graduationYear
    ) {}

    /** Một chứng chỉ */
    public record Certification(
        String name,
        String issuer,
        Integer year
    ) {}
}
