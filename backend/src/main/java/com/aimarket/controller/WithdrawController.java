package com.aimarket.controller;

import com.aimarket.entity.Transaction;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.WithdrawService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "Withdrawals", description = "Withdrawal management")
@RestController
@RequiredArgsConstructor
public class WithdrawController {

    private final WithdrawService withdrawService;

    public record WithdrawRequest(
            @Positive BigDecimal amount,
            @NotBlank String bankName,
            @NotBlank String accountNumber,
            @NotBlank String accountHolder
    ) {}

    public record RejectWithdrawRequest(@NotBlank String reason) {}

    @Operation(summary = "Request withdrawal (EXPERT)")
    @PostMapping("/api/v1/payments/withdraw")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('EXPERT')")
    public Transaction requestWithdraw(@RequestBody WithdrawRequest req,
                                       @AuthenticationPrincipal CustomUserDetails user) {
        return withdrawService.requestWithdraw(
                user.getUserId(), req.amount(), req.bankName(), req.accountNumber(), req.accountHolder());
    }

    @Operation(summary = "List pending withdrawals (ADMIN)")
    @GetMapping("/api/v1/admin/withdrawals")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Transaction> listPendingWithdrawals(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        return withdrawService.listPendingWithdrawals(page, size);
    }

    @Operation(summary = "Approve withdrawal (ADMIN)")
    @PostMapping("/api/v1/admin/withdrawals/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Transaction approveWithdraw(@PathVariable Long id) {
        return withdrawService.approveWithdraw(id);
    }

    @Operation(summary = "Reject withdrawal (ADMIN)")
    @PostMapping("/api/v1/admin/withdrawals/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Transaction rejectWithdraw(@PathVariable Long id, @RequestBody RejectWithdrawRequest req) {
        return withdrawService.rejectWithdraw(id, req.reason());
    }
}
