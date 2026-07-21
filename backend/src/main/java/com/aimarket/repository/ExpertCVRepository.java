package com.aimarket.repository;

import com.aimarket.entity.ExpertCV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpertCVRepository extends JpaRepository<ExpertCV, Long> {
    Optional<ExpertCV> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
