package com.aimarket.repository;

import com.aimarket.entity.Proposal;
import com.aimarket.entity.enums.ProposalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    boolean existsByJobIdAndExpertId(Long jobId, Long expertId);

    boolean existsByJobIdAndExpertIdAndStatusNotIn(Long jobId, Long expertId, List<ProposalStatus> statuses);

    /** Danh sách tất cả proposals của 1 job (Admin/debug) */
    @Query("""
        SELECT p FROM Proposal p
        JOIN FETCH p.expert e
        LEFT JOIN FETCH e.profile
        WHERE p.job.id = :jobId
        ORDER BY p.createdAt DESC
        """)
    Page<Proposal> findByJobId(@Param("jobId") Long jobId, Pageable pageable);

    /**
     * Danh sách CV đã qua AI sàng lọc — sắp xếp theo điểm giảm dần.
     * Đây là danh sách Client nhìn thấy.
     */
    @Query("""
        SELECT p FROM Proposal p
        JOIN FETCH p.expert e
        LEFT JOIN FETCH e.profile
        WHERE p.job.id = :jobId
          AND p.status = :status
        ORDER BY p.aiScore DESC
        """)
    Page<Proposal> findByJobIdAndStatusOrderByAiScoreDesc(
            @Param("jobId") Long jobId,
            @Param("status") ProposalStatus status,
            Pageable pageable);

    /** Danh sách proposals theo nhiều trạng thái (ví dụ: SHORTLISTED + INTERVIEWED) */
    @Query("""
        SELECT p FROM Proposal p
        JOIN FETCH p.expert e
        LEFT JOIN FETCH e.profile
        WHERE p.job.id = :jobId
          AND p.status IN :statuses
        ORDER BY p.aiScore DESC
        """)
    List<Proposal> findByJobIdAndStatusIn(
            @Param("jobId") Long jobId,
            @Param("statuses") List<ProposalStatus> statuses);

    Page<Proposal> findByExpertIdOrderByCreatedAtDesc(Long expertId, Pageable pageable);

    @Query("""
        SELECT p FROM Proposal p
        JOIN FETCH p.job j
        JOIN FETCH j.client
        JOIN FETCH p.expert e
        LEFT JOIN FETCH e.profile
        WHERE p.id = :id
        """)
    Optional<Proposal> findByIdWithDetails(@Param("id") Long id);

    long countByJobIdAndStatus(Long jobId, ProposalStatus status);

    long countByJobId(Long jobId);

    long countByJobIdAndStatusNotIn(Long jobId, List<ProposalStatus> statuses);

    /** Cập nhật trạng thái hàng loạt (dùng khi reject tất cả sau khi chốt) */
    @Modifying
    @Query("""
        UPDATE Proposal p SET p.status = :newStatus
        WHERE p.job.id = :jobId
          AND p.status IN :currentStatuses
          AND p.id != :excludeId
        """)
    int bulkUpdateStatus(
            @Param("jobId") Long jobId,
            @Param("newStatus") ProposalStatus newStatus,
            @Param("currentStatuses") List<ProposalStatus> currentStatuses,
            @Param("excludeId") Long excludeId);
}

