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
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.expert.id = :expertId AND c.status = 'COMPLETED'")
    long countCompletedByExpertId(@Param("expertId") Long expertId);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.expert.id = :expertId AND c.status IN ('COMPLETED', 'CANCELLED', 'DISPUTED')")
    long countFinishedByExpertId(@Param("expertId") Long expertId);

    Page<Contract> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);
    Page<Contract> findByExpertIdOrderByCreatedAtDesc(Long expertId, Pageable pageable);

    long countByStatus(ContractStatus status);

    @Query("SELECT c FROM Contract c WHERE c.status = 'ACTIVE' AND (c.client.id = :uid OR c.expert.id = :uid)")
    Page<Contract> findActiveByUserId(@Param("uid") Long userId, Pageable pageable);
}
