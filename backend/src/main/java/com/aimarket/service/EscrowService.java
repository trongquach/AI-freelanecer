package com.aimarket.service;

import com.aimarket.entity.*;
import com.aimarket.entity.enums.TransactionType;
import com.aimarket.exception.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EscrowService {

    private final EscrowAccountRepository escrowAccountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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
        EscrowAccount account = getOrCreate(userId);
        account.setBalance(account.getBalance().add(amount));
        account.setTotalDeposited(account.getTotalDeposited().add(amount));
        escrowAccountRepository.save(account);

        recordTransaction(userId, null, null, TransactionType.DEPOSIT, amount, stripePaymentId, "Stripe deposit");

        notificationService.send(userId, "DEPOSIT", "Nạp tiền thành công",
                String.format("Đã nạp $%.2f vào ví", amount), null);
        return account;
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

        // Credit expert
        EscrowAccount expertAccount = getOrCreate(expertId);
        expertAccount.setBalance(expertAccount.getBalance().add(expertAmount));
        escrowAccountRepository.save(expertAccount);

        String ref = UUID.randomUUID().toString();
        recordTransaction(clientId, contractId, null, TransactionType.RELEASE, amount, ref, "Payment released");
        recordTransaction(expertId, contractId, null, TransactionType.RELEASE, expertAmount, ref, "Payment received");
        recordTransaction(expertId, contractId, null, TransactionType.FEE, fee, ref, "Platform fee 10%");

        notificationService.send(expertId, "PAYMENT_RECEIVED", "Nhận thanh toán",
                String.format("Đã nhận $%.2f cho hợp đồng #%d", expertAmount, contractId), contractId);
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
        account.setBalance(account.getBalance().subtract(amount));
        escrowAccountRepository.save(account);

        recordTransaction(userId, null, null, TransactionType.WITHDRAW, amount,
                UUID.randomUUID().toString(), "Withdrawal request");

        notificationService.send(userId, "WITHDRAWAL", "Rút tiền đang xử lý",
                String.format("Yêu cầu rút $%.2f đang được xử lý", amount), null);
        return account;
    }

    // ─── Transaction history ─────────────────────────────
    @Transactional(readOnly = true)
    public Page<Transaction> getHistory(Long userId, int page, int size) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    // ─── Private helpers ─────────────────────────────────
    private void recordTransaction(Long userId, Long contractId, Long milestoneId,
                                   TransactionType type, BigDecimal amount, String refCode, String note) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Transaction tx = Transaction.builder()
                .user(user).type(type).amount(amount)
                .refCode(refCode).note(note).build();
        transactionRepository.save(tx);
    }
}
