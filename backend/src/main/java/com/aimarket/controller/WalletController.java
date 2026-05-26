package com.aimarket.controller;

import com.aimarket.entity.EscrowAccount;
import com.aimarket.entity.Transaction;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.EscrowService;
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

    @Operation(summary = "Get wallet balance")
    @GetMapping
    public EscrowAccount getWallet(@AuthenticationPrincipal CustomUserDetails user) {
        return escrowService.getOrCreate(user.getUserId());
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
    public EscrowAccount withdraw(@RequestBody Map<String, String> body,
                                  @AuthenticationPrincipal CustomUserDetails user) {
        BigDecimal amount = new BigDecimal(body.get("amount"));
        return escrowService.requestWithdraw(user.getUserId(), amount);
    }
}
