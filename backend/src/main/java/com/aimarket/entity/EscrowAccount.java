package com.aimarket.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrow_accounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EscrowAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "locked_amount", precision = 15, scale = 2)
    private BigDecimal lockedAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_deposited", precision = 15, scale = 2)
    private BigDecimal totalDeposited = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_released", precision = 15, scale = 2)
    private BigDecimal totalReleased = BigDecimal.ZERO;

    @Builder.Default
    @Column(length = 3)
    private String currency = "USD";

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BigDecimal getAvailableBalance() {
        return balance.subtract(lockedAmount);
    }
}
