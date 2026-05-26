package com.aimarket.repository;

import com.aimarket.entity.Transaction;
import com.aimarket.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Transaction> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, TransactionType type, Pageable pageable);
}
