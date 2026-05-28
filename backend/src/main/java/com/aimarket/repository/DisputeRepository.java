package com.aimarket.repository;

import com.aimarket.entity.Dispute;
import com.aimarket.entity.enums.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    Optional<Dispute> findByContractIdAndStatusIn(Long contractId, java.util.List<DisputeStatus> statuses);
    Page<Dispute> findByStatusOrderByCreatedAtDesc(DisputeStatus status, Pageable pageable);
    Page<Dispute> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
