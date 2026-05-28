package com.aimarket.service;

import com.aimarket.entity.Contract;
import com.aimarket.entity.Dispute;
import com.aimarket.entity.User;
import com.aimarket.entity.enums.ContractStatus;
import com.aimarket.entity.enums.DisputeStatus;
import com.aimarket.repository.ContractRepository;
import com.aimarket.repository.DisputeRepository;
import com.aimarket.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DisputeServiceTest {

    @Mock
    private DisputeRepository disputeRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EscrowService escrowService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private DisputeService disputeService;

    private User client;
    private User expert;
    private Contract contract;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        
        client = new User();
        client.setId(1L);
        
        expert = new User();
        expert.setId(2L);
        
        contract = new Contract();
        contract.setId(100L);
        contract.setClient(client);
        contract.setExpert(expert);
        contract.setStatus(ContractStatus.ACTIVE);
    }

    @Test
    void openDispute_success() {
        when(contractRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(contract));
        when(disputeRepository.save(any(Dispute.class))).thenAnswer(i -> i.getArguments()[0]);

        Dispute dispute = disputeService.openDispute(100L, 1L, "Late delivery: Expert has not delivered anything for 2 weeks");

        assertNotNull(dispute);
        assertEquals(DisputeStatus.OPEN, dispute.getStatus());
        assertEquals("Late delivery: Expert has not delivered anything for 2 weeks", dispute.getReason());
        assertEquals(ContractStatus.DISPUTED, contract.getStatus());
        
        verify(notificationService, times(1)).send(eq(1L), anyString(), anyString(), anyString(), eq(100L));
    }
}
