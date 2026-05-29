package com.aimarket.controller;

import com.aimarket.service.EscrowService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "Stripe Webhook", description = "Stripe payment webhook endpoint")
@Slf4j
@RestController
@RequestMapping("/api/v1/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final EscrowService escrowService;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.mock:false}")
    private boolean mockMode;

    /**
     * Stripe sends POST to this endpoint when payment events occur.
     * Must be public (no auth) — Stripe signs requests with webhook secret.
     */
    @Operation(summary = "Handle Stripe webhook events")
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        if (mockMode) {
            log.info("[STRIPE MOCK] Webhook received, skipping verification");
            return ResponseEntity.ok("mock_ok");
        }

        // Verify webhook signature
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            log.error("Stripe webhook parse error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Parse error");
        }

        // Handle events
        switch (event.getType()) {
            case "payment_intent.succeeded" -> {
                event.getDataObjectDeserializer().getObject().ifPresent(obj -> {
                    PaymentIntent pi = (PaymentIntent) obj;
                    Long userId = Long.parseLong(pi.getMetadata().getOrDefault("userId", "0"));
                    BigDecimal amount = BigDecimal.valueOf(pi.getAmount()).divide(BigDecimal.valueOf(100)); // cents → dollars
                    if (userId > 0) {
                        escrowService.deposit(userId, amount, pi.getId());
                        log.info("Stripe deposit: userId={}, amount={}, piId={}", userId, amount, pi.getId());
                    }
                });
            }
            case "payment_intent.payment_failed" -> {
                log.warn("Stripe payment failed: {}", event.getId());
            }
            default -> log.debug("Unhandled Stripe event: {}", event.getType());
        }

        return ResponseEntity.ok("received");
    }

    /**
     * DEV ONLY: Simulate a deposit without real Stripe.
     * Call: POST /api/v1/stripe/mock-deposit?userId=1&amount=100
     */
    @Operation(summary = "[DEV] Mock deposit to wallet")
    @PostMapping("/mock-deposit")
    public ResponseEntity<String> mockDeposit(
            @RequestParam Long userId,
            @RequestParam BigDecimal amount) {
        if (!mockMode) {
            return ResponseEntity.badRequest().body("Mock mode is disabled");
        }
        escrowService.deposit(userId, amount, "MOCK-" + System.currentTimeMillis());
        return ResponseEntity.ok("Deposited $" + amount + " to user " + userId);
    }
}
