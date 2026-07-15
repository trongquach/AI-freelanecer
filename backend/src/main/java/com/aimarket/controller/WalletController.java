package com.aimarket.controller;

import com.aimarket.dto.wallet.WalletSummaryResponse;
import com.aimarket.entity.EscrowAccount;
import com.aimarket.entity.Transaction;
import com.aimarket.repository.ContractRepository;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.EscrowService;
import com.aimarket.service.WithdrawService;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Tag(name = "Wallet & Payments", description = "Escrow account and transaction management")
@Slf4j
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WalletController {

    private final EscrowService escrowService;
    private final ContractRepository contractRepository;
    private final WithdrawService withdrawService;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

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

    @Operation(summary = "Create Stripe PaymentIntent for deposit")
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails user) {
        try {
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            if (amount.compareTo(BigDecimal.ONE) < 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Minimum deposit is $1"));
            }

            Stripe.apiKey = stripeSecretKey;

            // Convert dollars → cents (Stripe uses smallest currency unit)
            long amountCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountCents)
                    .setCurrency("usd")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    // Attach userId so webhook can identify who to credit
                    .putMetadata("userId", String.valueOf(user.getUserId()))
                    .setDescription("AIMarket wallet deposit for user " + user.getUserId())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            log.info("Created PaymentIntent {} for user {} amount ${}", intent.getId(), user.getUserId(), amount);

            return ResponseEntity.ok(Map.of("clientSecret", intent.getClientSecret()));
        } catch (Exception e) {
            log.error("Failed to create PaymentIntent: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Confirm Stripe Deposit")
    @PostMapping("/confirm-deposit")
    public ResponseEntity<?> confirmDeposit(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails user) {
        String paymentIntentId = body.get("paymentIntentId");
        if (paymentIntentId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "paymentIntentId is required"));
        }
        
        try {
            Stripe.apiKey = stripeSecretKey;
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            if ("succeeded".equals(intent.getStatus())) {
                boolean success = escrowService.confirmStripeDeposit(user.getUserId(), intent);
                if (success) {
                    return ResponseEntity.ok(Map.of("message", "Deposit confirmed successfully"));
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Deposit already processed or user mismatch"));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment not succeeded: " + intent.getStatus()));
            }
        } catch (Exception e) {
            log.error("Failed to confirm deposit: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
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

