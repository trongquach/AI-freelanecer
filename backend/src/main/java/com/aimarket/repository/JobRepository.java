package com.aimarket.repository;

import com.aimarket.entity.Job;
import com.aimarket.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @EntityGraph(attributePaths = {"client", "client.profile", "skills"})
    Optional<Job> findByIdWithDetails(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT j FROM Job j
        LEFT JOIN FETCH j.client c
        LEFT JOIN FETCH c.profile
        LEFT JOIN j.skills s
        WHERE (:status IS NULL OR j.status = :status)
          AND (:minBudget IS NULL OR j.budgetMax >= :minBudget)
          AND (:maxBudget IS NULL OR j.budgetMin <= :maxBudget)
          AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:skillIds IS NULL OR s.id IN :skillIds)
        """)
    Page<Job> findJobsWithFilter(
        @Param("status")    JobStatus status,
        @Param("minBudget") BigDecimal minBudget,
        @Param("maxBudget") BigDecimal maxBudget,
        @Param("keyword")   String keyword,
        @Param("skillIds")  List<Long> skillIds,
        Pageable pageable
    );

    Page<Job> findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable);

    long countByStatus(JobStatus status);

    @Modifying
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
