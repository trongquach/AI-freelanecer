package com.aimarket.entity;

import com.aimarket.entity.enums.JobStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "budget_min", precision = 15, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 15, scale = 2)
    private BigDecimal budgetMax;

    private LocalDate deadline;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expected_duration", length = 100)
    private String expectedDuration;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobStatus status = JobStatus.DRAFT;

    @Column(name = "ai_enhanced")
    @Builder.Default
    private Boolean aiEnhanced = false;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    /** Số ứng viên tối đa Client muốn mời vào vòng phỏng vấn (mặc định 5) */
    @Column(name = "max_shortlist")
    @Builder.Default
    private Integer maxShortlist = 5;

    /** Ngưỡng điểm AI tối thiểu để CV được hiển thị cho Client (0.0 → 1.0, mặc định 0.6) */
    @Column(name = "ai_screening_threshold")
    @Builder.Default
    private Double aiScreeningThreshold = 0.6;

    /**
     * Vector embedding của job description + skills — được sinh khi Job publish.
     * Cached để tránh gọi embedding API mỗi lần Proposal được nộp.
     */
    @Column(name = "jd_embedding", columnDefinition = "JSON")
    private String jdEmbedding;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "job_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
