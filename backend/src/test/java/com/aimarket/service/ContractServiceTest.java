package com.aimarket.service;

import com.aimarket.dto.contract.ContractResponse;
import com.aimarket.entity.Contract;
import com.aimarket.entity.Milestone;
import com.aimarket.entity.User;
import com.aimarket.entity.Job;
import com.aimarket.entity.enums.ContractStatus;
import com.aimarket.entity.enums.MilestoneStatus;
import com.aimarket.repository.ContractRepository;
import com.aimarket.repository.MilestoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;
    
    @Mock
    private MilestoneRepository milestoneRepository;

    @InjectMocks
    private ContractService contractService;

    private User client;
    private User expert;
    private Contract contract;
    private Milestone milestone1;
    private Milestone milestone2;

    @BeforeEach
    void setUp() {
        client = new User();
        client.setId(1L);
        
        expert = new User();
        expert.setId(2L);
        
        Job job = new Job();
        job.setId(10L);
        job.setTitle("Test Job");
        
        contract = new Contract();
        contract.setId(100L);
        contract.setClient(client);
        contract.setExpert(expert);
        contract.setJob(job);
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setTotalAmount(new BigDecimal("1000.00"));
        
        milestone1 = new Milestone();
        milestone1.setId(1000L);
        milestone1.setContract(contract);
        milestone1.setStatus(MilestoneStatus.SUBMITTED);
        milestone1.setAmount(new BigDecimal("500.00"));
        
        milestone2 = new Milestone();
        milestone2.setId(1001L);
        milestone2.setContract(contract);
        milestone2.setStatus(MilestoneStatus.PENDING);
        milestone2.setAmount(new BigDecimal("500.00"));
        
        List<Milestone> milestones = new ArrayList<>();
        milestones.add(milestone1);
        milestones.add(milestone2);
        
        contract.setMilestones(milestones);
    }

    @Test
    void testApproveMilestone_Success() {
        when(contractRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(contract));
        when(milestoneRepository.findById(1000L)).thenReturn(Optional.of(milestone1));
        
        ContractResponse response = contractService.approveMilestone(100L, 1000L, 1L);
        
        assertEquals(MilestoneStatus.APPROVED, milestone1.getStatus());
        assertEquals(ContractStatus.ACTIVE, contract.getStatus()); // Since milestone2 is PENDING
        
        verify(milestoneRepository).save(milestone1);
        verify(contractRepository, never()).save(any()); // Not all approved, contract not updated
    }

    @Test
    void testApproveMilestone_LastOne_ContractCompleted() {
        // Set first milestone to already be APPROVED
        milestone1.setStatus(MilestoneStatus.APPROVED);
        // Set second milestone to SUBMITTED so it can be approved
        milestone2.setStatus(MilestoneStatus.SUBMITTED);
        
        when(contractRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(contract));
        when(milestoneRepository.findById(1001L)).thenReturn(Optional.of(milestone2));
        
        ContractResponse response = contractService.approveMilestone(100L, 1001L, 1L);
        
        assertEquals(MilestoneStatus.APPROVED, milestone2.getStatus());
        assertEquals(ContractStatus.COMPLETED, contract.getStatus()); // All milestones APPROVED
        
        verify(milestoneRepository).save(milestone2);
        verify(contractRepository).save(contract);
    }
}
