package com.aimarket.repository;

import com.aimarket.entity.ExpertService;
import com.aimarket.entity.enums.ServiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpertServiceRepository extends JpaRepository<ExpertService, Long> {

    @Query("""
        SELECT s FROM ExpertService s
        LEFT JOIN FETCH s.expert e
        LEFT JOIN FETCH e.profile
        WHERE s.status = 'ACTIVE'
          AND (:keyword   IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%',:keyword,'%')))
          AND (:minPrice  IS NULL OR s.price >= :minPrice)
          AND (:maxPrice  IS NULL OR s.price <= :maxPrice)
          AND (:maxDays   IS NULL OR s.deliveryDays <= :maxDays)
          AND (:minRating IS NULL OR s.rating >= :minRating)
        """)
    Page<ExpertService> findWithFilter(
        @Param("keyword")   String keyword,
        @Param("minPrice")  BigDecimal minPrice,
        @Param("maxPrice")  BigDecimal maxPrice,
        @Param("maxDays")   Integer maxDays,
        @Param("minRating") BigDecimal minRating,
        Pageable pageable
    );

    Page<ExpertService> findByExpertIdAndStatus(Long expertId, ServiceStatus status, Pageable pageable);
    Page<ExpertService> findByExpertId(Long expertId, Pageable pageable);

    @Query("SELECT s FROM ExpertService s WHERE s.status = 'ACTIVE' ORDER BY s.rating DESC, s.orderCount DESC")
    List<ExpertService> findTopRated(Pageable pageable);

    List<ExpertService> findByStatus(ServiceStatus status);
    Page<ExpertService> findByStatus(ServiceStatus status, Pageable pageable);
}
