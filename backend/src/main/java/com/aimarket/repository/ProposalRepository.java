package com.aimarket.repository;

import com.aimarket.entity.Proposal;
import com.aimarket.entity.enums.ProposalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    boolean existsByJobIdAndExpertId(Long jobId, Long expertId);

    @Query("""
        SELECT p FROM Proposal p
        JOIN FETCH p.expert e
        LEFT JOIN FETCH e.profile
        WHERE p.job.id = :jobId
        ORDER BY p.createdAt DESC
        """)
    Page<Proposal> findByJobId(@Param("jobId") Long jobId, Pageable pageable);

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
}
