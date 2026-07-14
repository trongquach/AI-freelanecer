package com.aimarket.controller;

import com.aimarket.dto.wallet.WalletSummaryResponse;
import com.aimarket.entity.EscrowAccount;
import com.aimarket.entity.Transaction;
import com.aimarket.repository.ContractRepository;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.EscrowService;
import com.aimarket.service.WithdrawService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Tag(name = "Wallet & Payments", description = "Escrow account and transaction management")
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WalletController {

    private final EscrowService escrowService;
    private final ContractRepository contractRepository;
    private final WithdrawService withdrawService;

    @Operation(summary = "Get wallet balance (raw)")
    @GetMapping
    public EscrowAccount getWallet(@AuthenticationPrincipal CustomUserDetails user) {
        return escrowService.getOrCreate(user.getUserId());
    }

    @Operation(summary = "Get wallet summary with dynamic pending earnings")
    @GetMapping("/summary")
    public WalletSummaryResponse getWalletSummary(@AuthenticationPrincipal CustomUserDetails user) {
        EscrowAccount account = escrowService.getOrCreate(user.getUserId());

        // For experts, pendingEarnings is now exactly the lockedAmount (funds in clearing)
        BigDecimal pendingEarnings = account.getLockedAmount();

        return new WalletSummaryResponse(
                account.getBalance(),
                account.getLockedAmount(),
                account.getAvailableBalance(),
                account.getTotalDeposited(),
                account.getTotalReleased(),
                pendingEarnings
        );
    }

    @Operation(summary = "Transaction history")
    @GetMapping("/transactions")
    public Page<Transaction> transactions(@AuthenticationPrincipal CustomUserDetails user,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return escrowService.getHistory(user.getUserId(), page, size);
    }

    @Operation(summary = "Request withdrawal")
    @PostMapping("/withdraw")
    public Transaction withdraw(@RequestBody Map<String, String> body,
                                  @AuthenticationPrincipal CustomUserDetails user) {
        BigDecimal amount = new BigDecimal(body.get("amount"));
        String bankName = body.getOrDefault("bankName", "N/A");
        String accountNumber = body.getOrDefault("accountNumber", "N/A");
        String accountHolder = body.getOrDefault("accountHolder", "N/A");
        
        return withdrawService.requestWithdraw(user.getUserId(), amount, bankName, accountNumber, accountHolder);
    }
}

