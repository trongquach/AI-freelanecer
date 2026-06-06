package com.aimarket.repository;

import com.aimarket.entity.EscrowAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EscrowAccountRepository extends JpaRepository<EscrowAccount, Long> {
    Optional<EscrowAccount> findByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(e.lockedAmount) FROM EscrowAccount e")
    java.math.BigDecimal sumLockedAmount();
}
