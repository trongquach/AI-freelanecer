package com.aimarket.repository;

import com.aimarket.entity.Contract;
import com.aimarket.entity.enums.ContractStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    @Query("""
        SELECT c FROM Contract c
        JOIN FETCH c.client cl
        LEFT JOIN FETCH cl.profile
        JOIN FETCH c.expert ex
        LEFT JOIN FETCH ex.profile
        JOIN FETCH c.job
        LEFT JOIN FETCH c.milestones
        WHERE c.id = :id
        """)
    Optional<Contract> findByIdWithDetails(@Param("id") Long id);

    Optional<Contract> findByProposalId(Long proposalId);
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.expert.id = :expertId AND c.status = 'COMPLETED'")
    long countCompletedByExpertId(@Param("expertId") Long expertId);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.expert.id = :expertId AND c.status IN ('COMPLETED', 'CANCELLED', 'DISPUTED')")
    long countFinishedByExpertId(@Param("expertId") Long expertId);

    Page<Contract> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);
    Page<Contract> findByExpertIdOrderByCreatedAtDesc(Long expertId, Pageable pageable);

    Page<Contract> findByStatus(ContractStatus status, Pageable pageable);

    Page<Contract> findByStatusIn(java.util.List<ContractStatus> statuses, Pageable pageable);

    long countByStatus(ContractStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Contract c SET c.status = 'CANCELLED' WHERE c.job.id = :jobId AND c.status = 'INTERVIEWING' AND c.proposal.id != :acceptedProposalId")
    void bulkCancelInterviewingContracts(@Param("jobId") Long jobId, @Param("acceptedProposalId") Long acceptedProposalId);

    @Query("SELECT c FROM Contract c WHERE c.status = 'ACTIVE' AND (c.client.id = :uid OR c.expert.id = :uid)")
    Page<Contract> findActiveByUserId(@Param("uid") Long userId, Pageable pageable);

    @Query("""
        SELECT COALESCE(SUM(c.totalAmount), 0)
        FROM Contract c
        WHERE c.expert.id = :expertId AND c.status = 'ACTIVE'
        """)
    java.math.BigDecimal sumPendingEarningsByExpertId(@Param("expertId") Long expertId);
}
