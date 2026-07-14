package com.aimarket.dto.wallet;

import java.math.BigDecimal;

public record WalletSummaryResponse(
    BigDecimal balance,
    BigDecimal lockedAmount,
    BigDecimal availableBalance,
    BigDecimal totalDeposited,
    BigDecimal totalReleased,
    BigDecimal pendingEarnings   // for experts: total remaining in active contracts
) {}
