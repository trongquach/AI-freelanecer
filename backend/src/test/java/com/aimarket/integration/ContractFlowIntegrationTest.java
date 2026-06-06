package com.aimarket.integration;

import com.aimarket.dto.contract.ContractResponse;
import com.aimarket.entity.Contract;
import com.aimarket.entity.Job;
import com.aimarket.entity.Milestone;
import com.aimarket.entity.User;
import com.aimarket.entity.enums.ContractStatus;
import com.aimarket.entity.enums.JobStatus;
import com.aimarket.entity.enums.MilestoneStatus;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.repository.ContractRepository;
import com.aimarket.repository.JobRepository;
import com.aimarket.repository.MilestoneRepository;
import com.aimarket.repository.UserRepository;
import com.aimarket.service.ContractService;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
public class ContractFlowIntegrationTest {

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
    private ContractService contractService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    private User client;
    private User expert;
    private Job job;
    private Contract contract;
    private Milestone milestone;

    @BeforeEach
    void setUp() {
        milestoneRepository.deleteAll();
        contractRepository.deleteAll();
        jobRepository.deleteAll();
        userRepository.deleteAll();

        client = new User();
        client.setEmail("client_contract@test.com");
        client.setPasswordHash("hash");
        client.setRole(UserRole.CLIENT);
        client = userRepository.save(client);

        expert = new User();
        expert.setEmail("expert_contract@test.com");
        expert.setPasswordHash("hash");
        expert.setRole(UserRole.EXPERT);
        expert = userRepository.save(expert);

        job = Job.builder()
                .title("Test Job")
                .description("Test Desc")
                .client(client)
                .status(JobStatus.IN_PROGRESS)
                .build();
        job = jobRepository.save(job);

        contract = new Contract();
        contract.setJob(job);
        contract.setClient(client);
        contract.setExpert(expert);
        contract.setTotalAmount(new BigDecimal("1000.00"));
        contract.setStatus(ContractStatus.ACTIVE);
        contract = contractRepository.save(contract);

        milestone = new Milestone();
        milestone.setContract(contract);
        milestone.setAmount(new BigDecimal("1000.00"));
        milestone.setStatus(MilestoneStatus.PENDING);
        milestone.setName("M1");
        milestone = milestoneRepository.save(milestone);
    }

    @Test
    void testContractFlow() {
        // 1. Submit Milestone (Expert)
        ContractResponse response = contractService.completeMilestone(
                contract.getId(), milestone.getId(), "http://deliverable", "Done", expert.getId());

        assertEquals(ContractStatus.ACTIVE, response.status());
        assertEquals(MilestoneStatus.SUBMITTED, response.milestones().get(0).status());
        assertEquals("http://deliverable", response.milestones().get(0).deliverableUrl());

        // 2. Approve Milestone (Client)
        response = contractService.approveMilestone(contract.getId(), milestone.getId(), client.getId());

        // Contract should automatically complete since it's the last (only) milestone
        assertEquals(ContractStatus.COMPLETED, response.status());
        assertEquals(MilestoneStatus.APPROVED, response.milestones().get(0).status());
        assertNotNull(response.completedAt());
    }
}
