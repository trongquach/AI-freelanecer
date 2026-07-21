package com.aimarket.service;

import com.aimarket.entity.*;
import com.aimarket.entity.enums.ContractStatus;
import com.aimarket.entity.enums.MilestoneStatus;
import com.aimarket.entity.enums.TransactionType;
import com.aimarket.exception.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EscrowService {

    private final EscrowAccountRepository escrowAccountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final com.aimarket.repository.ContractRepository contractRepository;

    @Value("${app.platform-fee-percent:10}")
    private double platformFeePercent;

    // ─── Get or create escrow account ────────────────────
    @Transactional
    public EscrowAccount getOrCreate(Long userId) {
        return escrowAccountRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));
            EscrowAccount account = EscrowAccount.builder().user(user).build();
            return escrowAccountRepository.save(account);
        });
    }

    // ─── Deposit (after Stripe webhook confirms payment) ──
    @Transactional
    public EscrowAccount deposit(Long userId, BigDecimal amount, String stripePaymentId) {
        if (transactionRepository.existsByRefCode(stripePaymentId)) {
            log.info("Deposit already processed for {}", stripePaymentId);
            return getOrCreate(userId);
        }

        EscrowAccount account = getOrCreate(userId);
        account.setBalance(account.getBalance().add(amount));
        account.setTotalDeposited(account.getTotalDeposited().add(amount));
        escrowAccountRepository.save(account);

        recordTransaction(userId, null, null, TransactionType.DEPOSIT, amount, stripePaymentId, "Stripe deposit");

        notificationService.send(userId, "DEPOSIT", "Deposit Successful",
                String.format("Deposited $%.2f into wallet", amount), null);
        return account;
    }

    @Transactional
    public boolean confirmStripeDeposit(Long userId, com.stripe.model.PaymentIntent intent) {
        if (transactionRepository.existsByRefCode(intent.getId())) {
            return false;
        }
        
        // Verify userId matches (optional but good for security)
        String intentUserId = intent.getMetadata().get("userId");
        if (intentUserId != null && !intentUserId.equals(String.valueOf(userId))) {
            log.warn("User ID mismatch for deposit confirmation. Expected {}, got {}", intentUserId, userId);
            return false;
        }

        BigDecimal amount = BigDecimal.valueOf(intent.getAmount()).divide(BigDecimal.valueOf(100));
        deposit(userId, amount, intent.getId());
        return true;
    }

    // ─── Lock funds for a contract (client escrows payment) ──
    @Transactional
    public void lockFunds(Long clientId, Long contractId, BigDecimal amount) {
        EscrowAccount account = getOrCreate(clientId);
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient balance to lock funds for contract");
        }
        account.setLockedAmount(account.getLockedAmount().add(amount));
        escrowAccountRepository.save(account);

        recordTransaction(clientId, contractId, null, TransactionType.ESCROW_LOCK, amount,
                UUID.randomUUID().toString(), "Escrow for contract " + contractId);
    }

    // ─── Release funds to expert (after milestone approved) ──
    @Transactional
    public void releaseFunds(Long contractId, Long clientId, Long expertId, BigDecimal amount) {
        // Deduct from client escrow
        EscrowAccount clientAccount = getOrCreate(clientId);
        clientAccount.setBalance(clientAccount.getBalance().subtract(amount));
        clientAccount.setLockedAmount(clientAccount.getLockedAmount().subtract(amount));
        clientAccount.setTotalReleased(clientAccount.getTotalReleased().add(amount));
        escrowAccountRepository.save(clientAccount);

        // Deduct platform fee
        BigDecimal fee = amount.multiply(BigDecimal.valueOf(platformFeePercent / 100))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal expertAmount = amount.subtract(fee);

        // Credit expert (Locked for 7 days)
        EscrowAccount expertAccount = getOrCreate(expertId);
        expertAccount.setBalance(expertAccount.getBalance().add(expertAmount));
        expertAccount.setLockedAmount(expertAccount.getLockedAmount().add(expertAmount));
        escrowAccountRepository.save(expertAccount);

        String ref = UUID.randomUUID().toString();
        recordTransaction(clientId, contractId, null, TransactionType.RELEASE, amount, ref, "Payment released", "SUCCESS");
        recordTransaction(expertId, contractId, null, TransactionType.RELEASE, expertAmount, ref, "Payment Received (Pending Clearing)", "PENDING");
        recordTransaction(expertId, contractId, null, TransactionType.FEE, fee, ref, "Platform fee 10%", "SUCCESS");

        notificationService.send(expertId, "PAYMENT_RECEIVED", "Payment Received",
                String.format("Received $%.2f for contract #%d", expertAmount, contractId), contractId);

        // Push real-time wallet refresh events (no notification stored in DB)
        notificationService.sendEvent(clientId, "WALLET_UPDATED", contractId);
        notificationService.sendEvent(expertId, "WALLET_UPDATED", contractId);
        // Notify admin dashboard
        notificationService.broadcastAdminEvent("ESCROW_RELEASED");
    }

    // ─── Withdraw request ─────────────────────────────────
    @Transactional
    public EscrowAccount requestWithdraw(Long userId, BigDecimal amount) {
        EscrowAccount account = getOrCreate(userId);
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient available balance");
        }
        if (amount.compareTo(BigDecimal.valueOf(10)) < 0) {
            throw new BusinessException("Minimum withdrawal amount is $10");
        }
        account.setLockedAmount(account.getLockedAmount().add(amount));
        escrowAccountRepository.save(account);

        recordTransaction(userId, null, null, TransactionType.WITHDRAW, amount,
                UUID.randomUUID().toString(), "Withdrawal pending (Admin approval required)", "PENDING");

        notificationService.send(userId, "WITHDRAWAL", "Withdrawal Processing",
                String.format("Withdrawal request for $%.2f is processing", amount), null);
        notificationService.sendEvent(userId, "WALLET_UPDATED", null);
        notificationService.broadcastAdminEvent("WITHDRAWAL_REQUESTED");
        return account;
    }

    // ─── Transaction history ─────────────────────────────
    @Transactional(readOnly = true)
    public Page<Transaction> getHistory(Long userId, int page, int size) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    // ─── Dispute resolution: refund all locked to client ─
    @Transactional
    public void refundAllLocked(Long contractId) {
        log.info("Refunding all locked funds for contract {}", contractId);
        var contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new com.aimarket.exception.ResourceNotFoundException("Contract", contractId));

        BigDecimal lockedAmount = contract.getMilestones().stream()
                .filter(m -> m.getStatus() != com.aimarket.entity.enums.MilestoneStatus.APPROVED)
                .map(com.aimarket.entity.Milestone::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (lockedAmount.compareTo(BigDecimal.ZERO) > 0) {
            EscrowAccount clientAccount = getOrCreate(contract.getClient().getId());
            clientAccount.setLockedAmount(
                    clientAccount.getLockedAmount().subtract(lockedAmount).max(BigDecimal.ZERO));
            escrowAccountRepository.save(clientAccount);
            recordTransaction(contract.getClient(), contractId, null,
                    TransactionType.REFUND, lockedAmount,
                    UUID.randomUUID().toString(), "Dispute refund for contract " + contractId);
            log.info("Refunded ${} to client {} for contract {}", lockedAmount,
                    contract.getClient().getId(), contractId);
        }
    }

    // ─── Dispute resolution: release all pending to expert ─
    @Transactional
    public void releaseAllPending(Long contractId) {
        log.info("Releasing all pending funds for contract {}", contractId);
        var contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new com.aimarket.exception.ResourceNotFoundException("Contract", contractId));

        // Guard: do NOT release if contract is already COMPLETED
        if (contract.getStatus() == ContractStatus.COMPLETED) {
            throw new com.aimarket.exception.BusinessException("Contract #" + contractId + " is already COMPLETED. Funds were already disbursed.");
        }
        BigDecimal approvedAmount = contract.getMilestones().stream()
                .filter(m -> m.getStatus() == MilestoneStatus.APPROVED)
                .map(Milestone::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pendingAmount = contract.getTotalAmount().subtract(approvedAmount);

        if (pendingAmount.compareTo(BigDecimal.ZERO) > 0) {
            releaseFunds(contractId, contract.getClient().getId(),
                    contract.getExpert().getId(), pendingAmount);
            log.info("Released ${} to expert {} for contract {}", pendingAmount,
                    contract.getExpert().getId(), contractId);
        }

        // Mark contract as COMPLETED after disbursement
        contract.setStatus(ContractStatus.COMPLETED);
        contract.setCompletedAt(LocalDateTime.now());
        contractRepository.save(contract);
        log.info("Contract {} marked as COMPLETED", contractId);

        // Notify both parties + trigger real-time updates
        notificationService.send(contract.getClient().getId(), "CONTRACT_COMPLETED",
                "Contract Completed",
                String.format("Contract #%d has been completed and funds disbursed", contractId), contractId);
        notificationService.send(contract.getExpert().getId(), "CONTRACT_COMPLETED",
                "Contract Completed",
                String.format("Contract #%d has been completed - funds have been added to your wallet", contractId), contractId);
        // Push contract-update events so both dashboards refresh
        notificationService.sendEvent(contract.getClient().getId(), "CONTRACT_UPDATED", contractId);
        notificationService.sendEvent(contract.getExpert().getId(), "CONTRACT_UPDATED", contractId);
        notificationService.broadcastAdminEvent("CONTRACT_COMPLETED");
    }

    // ─── Dispute resolution: partial split ───────────────────
    @Transactional
    public void resolvePartial(Long contractId, BigDecimal clientAmount, BigDecimal expertAmount) {
        log.info("Partial resolution for contract {}: client {}, expert {}", contractId, clientAmount, expertAmount);
        var contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new com.aimarket.exception.ResourceNotFoundException("Contract", contractId));

        if (contract.getStatus() == ContractStatus.COMPLETED) {
            throw new com.aimarket.exception.BusinessException("Contract #" + contractId + " is already COMPLETED.");
        }

        BigDecimal approvedAmount = contract.getMilestones().stream()
                .filter(m -> m.getStatus() == MilestoneStatus.APPROVED)
                .map(Milestone::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal lockedAmount = contract.getTotalAmount().subtract(approvedAmount);

        // Validate that the sum equals lockedAmount
        if (clientAmount.add(expertAmount).compareTo(lockedAmount) != 0) {
            throw new com.aimarket.exception.BusinessException("Sum of clientAmount and expertAmount must equal the locked amount of $" + lockedAmount);
        }

        // 1. Release to Expert
        if (expertAmount.compareTo(BigDecimal.ZERO) > 0) {
            releaseFunds(contractId, contract.getClient().getId(),
                    contract.getExpert().getId(), expertAmount);
            log.info("Released ${} to expert {} for contract {}", expertAmount,
                    contract.getExpert().getId(), contractId);
        }

        // 2. Refund to Client
        if (clientAmount.compareTo(BigDecimal.ZERO) > 0) {
            EscrowAccount clientAccount = getOrCreate(contract.getClient().getId());
            clientAccount.setLockedAmount(
                    clientAccount.getLockedAmount().subtract(clientAmount).max(BigDecimal.ZERO));
            // Note: balance is NOT subtracted because the client keeps it
            escrowAccountRepository.save(clientAccount);

            recordTransaction(contract.getClient().getId(), contractId, null,
                    TransactionType.REFUND, clientAmount,
                    UUID.randomUUID().toString(), "Dispute partial refund for contract " + contractId);
            log.info("Refunded ${} to client {} for contract {}", clientAmount,
                    contract.getClient().getId(), contractId);
        }

        // Mark contract as CANCELLED (or completed if they want? Usually cancelled for partial split)
        contract.setStatus(ContractStatus.CANCELLED);
        contract.setCompletedAt(LocalDateTime.now());
        contractRepository.save(contract);
        
        notificationService.sendEvent(contract.getClient().getId(), "CONTRACT_UPDATED", contractId);
        notificationService.sendEvent(contract.getExpert().getId(), "CONTRACT_UPDATED", contractId);
    }

    // ─── Auto-release after 7 days (BR-PRJ-03) ───────────
    // Runs every hour to check for submitted milestones older than 7 days
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoApproveExpiredMilestones() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<com.aimarket.entity.Contract> activeContracts =
                contractRepository.findByStatus(ContractStatus.ACTIVE, org.springframework.data.domain.Pageable.unpaged()).getContent();

        for (com.aimarket.entity.Contract contract : activeContracts) {
            boolean anyAutoApproved = false;
            for (Milestone m : contract.getMilestones()) {
                if (m.getStatus() == MilestoneStatus.SUBMITTED && m.getUpdatedAt() != null
                        && m.getUpdatedAt().isBefore(cutoff)) {
                    log.info("Auto-approving milestone {} for contract {} (submitted > 7 days ago)",
                            m.getId(), contract.getId());
                    m.setStatus(MilestoneStatus.APPROVED);
                    releaseFunds(contract.getId(), contract.getClient().getId(),
                            contract.getExpert().getId(), m.getAmount());
                    notificationService.send(contract.getExpert().getId(), "PAYMENT_RECEIVED",
                            "Automatic Disbursement",
                            String.format("Milestone '%s' was automatically approved after 7 days. Funds are in your wallet.", m.getName()),
                            contract.getId());
                    notificationService.send(contract.getClient().getId(), "MILESTONE_AUTO_APPROVED",
                            "Milestone Automatically Approved",
                            String.format("Milestone '%s' for contract #%d was automatically completed due to no response for 7 days.", m.getName(), contract.getId()),
                            contract.getId());
                    anyAutoApproved = true;
                }
            }
            // If all milestones are now approved, complete the contract
            if (anyAutoApproved) {
                boolean allApproved = contract.getMilestones().stream()
                        .allMatch(m -> m.getStatus() == MilestoneStatus.APPROVED);
                if (allApproved) {
                    contract.setStatus(ContractStatus.COMPLETED);
                    contract.setCompletedAt(LocalDateTime.now());
                    contractRepository.save(contract);
                }
            }
        }
    }

    // ─── Balance summary ──────────────────────────────────
    @Transactional(readOnly = true)
    public EscrowAccount getBalance(Long userId) {
        return getOrCreate(userId);
    }

    // ─── Private helpers ─────────────────────────────────
    private void recordTransaction(Long userId, Long contractId, Long milestoneId,
                                   TransactionType type, BigDecimal amount, String refCode, String note) {
        recordTransaction(userId, contractId, milestoneId, type, amount, refCode, note, "SUCCESS");
    }

    private void recordTransaction(User user, Long contractId, Long milestoneId,
                                   TransactionType type, BigDecimal amount, String refCode, String note) {
        recordTransaction(user, contractId, milestoneId, type, amount, refCode, note, "SUCCESS");
    }

    private void recordTransaction(Long userId, Long contractId, Long milestoneId,
                                   TransactionType type, BigDecimal amount, String refCode, String note, String status) {
        userRepository.findById(userId).ifPresent(user ->
                recordTransaction(user, contractId, milestoneId, type, amount, refCode, note, status));
    }

    private void recordTransaction(User user, Long contractId, Long milestoneId,
                                   TransactionType type, BigDecimal amount, String refCode, String note, String status) {
        Transaction tx = Transaction.builder()
                .user(user).type(type).amount(amount)
                .refCode(refCode).note(note).status(status).build();
        transactionRepository.save(tx);
    }
    
    // ─── Settlement logic ────────────────────────────────
    @Transactional
    public void settleEarning(Transaction tx) {
        if (!"PENDING".equals(tx.getStatus()) || tx.getType() != TransactionType.RELEASE) {
            return;
        }
        EscrowAccount account = getOrCreate(tx.getUser().getId());
        account.setLockedAmount(account.getLockedAmount().subtract(tx.getAmount()));
        escrowAccountRepository.save(account);

        // Delete the old pending transaction so it doesn't double-count in history
        transactionRepository.delete(tx);

        // Create a new transaction so it appears at the top of the history today
        Long milestoneId = tx.getMilestone() != null ? tx.getMilestone().getId() : null;
        recordTransaction(tx.getUser().getId(), 
                          tx.getContract() != null ? tx.getContract().getId() : null, 
                          milestoneId, 
                          TransactionType.RELEASE, 
                          tx.getAmount(), 
                          tx.getRefCode() + "-CLEAR", 
                          "Earnings Cleared to Available Balance (Received)");

        notificationService.send(tx.getUser().getId(), "EARNING_CLEARED", "Funds Cleared",
                String.format("The amount $%.2f has cleared the holding period and is now available in your balance", tx.getAmount()), null);
        notificationService.sendEvent(tx.getUser().getId(), "WALLET_UPDATED", null);
    }

    @Transactional
    public void settleAllPendingEarnings(Long expertId) {
        java.util.List<Transaction> pending = transactionRepository.findByUserIdAndTypeAndStatus(expertId, TransactionType.RELEASE, "PENDING");
        for (Transaction tx : pending) {
            settleEarning(tx);
        }
    }

    @Scheduled(cron = "0 0 * * * *") // Run every hour
    @Transactional
    public void autoSettleEarnings() {
        java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusDays(7);
        java.util.List<Transaction> pending = transactionRepository.findByTypeAndStatusAndCreatedAtBefore(TransactionType.RELEASE, "PENDING", cutoff);
        for (Transaction tx : pending) {
            settleEarning(tx);
        }
    }
}
