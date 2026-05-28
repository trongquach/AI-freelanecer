package com.aimarket.service;

import com.aimarket.entity.EscrowAccount;
import com.aimarket.entity.Transaction;
import com.aimarket.entity.User;
import com.aimarket.repository.EscrowAccountRepository;
import com.aimarket.repository.TransactionRepository;
import com.aimarket.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WithdrawServiceTest {

    @Mock
    private EscrowService escrowService;

    @Mock
    private EscrowAccountRepository escrowAccountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WithdrawService withdrawService;

    private User expert;
    private EscrowAccount escrowAccount;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        expert = new User();
        expert.setId(2L);
        expert.setEmail("expert@test.com");

        escrowAccount = new EscrowAccount();
        escrowAccount.setUser(expert);
        escrowAccount.setBalance(new BigDecimal("1000.00"));
        escrowAccount.setLockedAmount(new BigDecimal("0"));
    }

    @Test
    void requestWithdraw_success() {
        when(escrowService.getOrCreate(2L)).thenReturn(escrowAccount);
        when(escrowAccountRepository.save(any(EscrowAccount.class))).thenReturn(escrowAccount);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArguments()[0]);

        Transaction tx = withdrawService.requestWithdraw(2L, new BigDecimal("100.00"), "VCB", "123", "NGUYEN VAN A");

        assertNotNull(tx);
        assertEquals("PENDING", tx.getStatus());
        assertEquals(new BigDecimal("900.00"), escrowAccount.getBalance());

        verify(notificationService, times(1)).send(eq(1L), anyString(), anyString(), anyString(), isNull());
    }
}
