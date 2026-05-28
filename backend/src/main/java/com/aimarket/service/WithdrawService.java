package com.aimarket.service;

import com.aimarket.entity.EscrowAccount;
import com.aimarket.entity.Transaction;
import com.aimarket.entity.enums.TransactionType;
import com.aimarket.exception.BusinessException;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.repository.EscrowAccountRepository;
import com.aimarket.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawService {

    private final EscrowService escrowService;
    private final EscrowAccountRepository escrowAccountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    @Transactional
    public Transaction requestWithdraw(Long expertId, BigDecimal amount, String bankName, String accountNumber, String accountHolder) {
        if (amount.compareTo(BigDecimal.valueOf(50)) < 0) {
            throw new BusinessException("Minimum withdrawal amount is $50");
        }

        // Deduct balance and create base transaction (will be tracked as PENDING)
        // Note: EscrowService.requestWithdraw actually creates a withdraw transaction and deducts balance.
        // But since we need bank details and specific status tracking, let's do it manually or update it.
        EscrowAccount account = escrowService.getOrCreate(expertId);
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient available balance");
        }
        
        account.setBalance(account.getBalance().subtract(amount));
        escrowAccountRepository.save(account);

        Transaction tx = Transaction.builder()
                .user(account.getUser())
                .type(TransactionType.WITHDRAW)
                .amount(amount)
                .status("PENDING")
                .refCode(UUID.randomUUID().toString())
                .note(String.format("Bank: %s, Acct: %s, Holder: %s", bankName, accountNumber, accountHolder))
                .build();
        
        transactionRepository.save(tx);

        // Notify Admin (userId = 1 in dev)
        notificationService.send(1L, "WITHDRAW_REQUEST", "Yêu cầu rút tiền", 
                "User " + expertId + " yêu cầu rút $" + amount, null);

        return tx;
    }

    @Transactional
    public Transaction approveWithdraw(Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId));

        if (!"PENDING".equals(tx.getStatus())) {
            throw new BusinessException("Withdrawal is not pending");
        }

        tx.setStatus("SUCCESS");
        transactionRepository.save(tx);
        
        notificationService.send(tx.getUser().getId(), "WITHDRAW_APPROVED", "Rút tiền thành công", 
                "Yêu cầu rút $" + tx.getAmount() + " đã được xử lý", null);

        return tx;
    }

    @Transactional
    public Transaction rejectWithdraw(Long transactionId, String reason) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId));

        if (!"PENDING".equals(tx.getStatus())) {
            throw new BusinessException("Withdrawal is not pending");
        }

        // Refund balance
        EscrowAccount account = escrowService.getOrCreate(tx.getUser().getId());
        account.setBalance(account.getBalance().add(tx.getAmount()));
        escrowAccountRepository.save(account);

        tx.setStatus("FAILED");
        tx.setNote(tx.getNote() + " | Rejected: " + reason);
        transactionRepository.save(tx);
        
        notificationService.send(tx.getUser().getId(), "WITHDRAW_REJECTED", "Rút tiền thất bại", 
                "Yêu cầu rút $" + tx.getAmount() + " bị từ chối: " + reason, null);

        return tx;
    }

    @Transactional(readOnly = true)
    public Page<Transaction> listPendingWithdrawals(int page, int size) {
        return transactionRepository.findByTypeAndStatusOrderByCreatedAtDesc(
                TransactionType.WITHDRAW, "PENDING", PageRequest.of(page, size));
    }
}
