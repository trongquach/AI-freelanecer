package com.aimarket.entity;

import com.aimarket.entity.enums.ProposalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "proposals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expert_id", nullable = false)
    private User expert;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "timeline_days", nullable = false)
    private Integer timelineDays;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProposalStatus status = ProposalStatus.PENDING;

    /** Điểm AI chấm CV (0.0 → 1.0). Null = chưa chấm */
    @Column(name = "ai_score")
    private Double aiScore;

    /** Nhận xét chi tiết của AI về mức độ phù hợp CV với Job */
    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    /** Ghi chú của Client sau khi phỏng vấn ứng viên */
    @Column(name = "interview_notes", columnDefinition = "TEXT")
    private String interviewNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
