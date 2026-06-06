package com.aimarket.integration;

import com.aimarket.entity.EscrowAccount;
import com.aimarket.entity.User;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.repository.EscrowAccountRepository;
import com.aimarket.repository.UserRepository;
import com.aimarket.service.EscrowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
public class EscrowIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    private EscrowService escrowService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EscrowAccountRepository escrowAccountRepository;

    private User client;
    private User expert;

    @BeforeEach
    void setUp() {
        escrowAccountRepository.deleteAll();
        userRepository.deleteAll();

        client = new User();
        client.setEmail("client@test.com");
        client.setPasswordHash("hash");
        client.setRole(UserRole.CLIENT);
        client = userRepository.save(client);

        expert = new User();
        expert.setEmail("expert@test.com");
        expert.setPasswordHash("hash");
        expert.setRole(UserRole.EXPERT);
        expert = userRepository.save(expert);
    }

    @Test
    void testFullEscrowFlow() {
        // 1. Deposit
        escrowService.deposit(client.getId(), new BigDecimal("1000.00"), "pi_123");
        EscrowAccount clientAcc = escrowService.getBalance(client.getId());
        assertEquals(new BigDecimal("1000.00"), clientAcc.getBalance());

        // 2. Lock
        escrowService.lockFunds(client.getId(), 100L, new BigDecimal("400.00"));
        clientAcc = escrowService.getBalance(client.getId());
        assertEquals(new BigDecimal("1000.00"), clientAcc.getBalance());
        assertEquals(new BigDecimal("400.00"), clientAcc.getLockedAmount());

        // 3. Release (90% to expert, 10% fee)
        escrowService.releaseFunds(100L, client.getId(), expert.getId(), new BigDecimal("400.00"));
        
        clientAcc = escrowService.getBalance(client.getId());
        assertEquals(new BigDecimal("600.00"), clientAcc.getBalance());
        assertEquals(new BigDecimal("0.00"), clientAcc.getLockedAmount());

        EscrowAccount expertAcc = escrowService.getBalance(expert.getId());
        assertEquals(new BigDecimal("360.00"), expertAcc.getBalance()); // 400 * 90%

        // 4. Withdraw
        escrowService.requestWithdraw(expert.getId(), new BigDecimal("100.00"));
        expertAcc = escrowService.getBalance(expert.getId());
        assertEquals(new BigDecimal("260.00"), expertAcc.getBalance());
    }

    @Test
    void testConcurrentLockFunds() throws InterruptedException {
        escrowService.deposit(client.getId(), new BigDecimal("500.00"), "pi_123");

        int threads = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            executorService.submit(() -> {
                try {
                    // Try to lock 300 twice concurrently
                    escrowService.lockFunds(client.getId(), 100L, new BigDecimal("300.00"));
                } catch (Exception e) {
                    // One should fail with Insufficient balance BusinessException
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();

        // Verify total locked does not exceed balance
        EscrowAccount clientAcc = escrowService.getBalance(client.getId());
        assertEquals(new BigDecimal("500.00"), clientAcc.getBalance());
        assertEquals(new BigDecimal("300.00"), clientAcc.getLockedAmount()); // Only one lock succeeded
    }
}
