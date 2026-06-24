package com.aimarket.service;

import com.aimarket.dto.job.CreateJobRequest;
import com.aimarket.dto.job.UpdateJobRequest;
import com.aimarket.entity.Job;
import com.aimarket.entity.User;
import com.aimarket.entity.enums.JobStatus;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.exception.BusinessException;
import com.aimarket.exception.ForbiddenException;
import com.aimarket.repository.JobRepository;
import com.aimarket.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JobServiceTest {

    @Mock
    private JobRepository jobRepository;
    
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobService jobService;

    private User expertUser;
    private User clientUser;
    private User otherClient;
    private Job job;

    @BeforeEach
    void setUp() {
        expertUser = new User();
        expertUser.setId(1L);
        expertUser.setRole(UserRole.EXPERT);
        
        clientUser = new User();
        clientUser.setId(2L);
        clientUser.setRole(UserRole.CLIENT);
        
        otherClient = new User();
        otherClient.setId(3L);
        otherClient.setRole(UserRole.CLIENT);
        
        job = Job.builder()
                .id(100L)
                .client(clientUser)
                .status(JobStatus.IN_PROGRESS)
                .build();
    }

    @Test
    void testCreateJob_NotClientRole() {
        CreateJobRequest request = new CreateJobRequest("Title", "Description", 
                new BigDecimal("100"), new BigDecimal("500"), null, null, null, Collections.emptyList());
                
        when(userRepository.findById(1L)).thenReturn(Optional.of(expertUser));
        
        ForbiddenException ex = assertThrows(ForbiddenException.class, () -> {
            jobService.createJob(request, 1L);
        });
        
        assertEquals("Only clients can create jobs", ex.getMessage());
        verify(jobRepository, never()).save(any());
    }

    @Test
    void testUpdateJob_NotOwner() {
        UpdateJobRequest request = new UpdateJobRequest("New Title", null, null, null, null, null, null, null);
        
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        
        // Trying to update with otherClient ID
        assertThrows(ForbiddenException.class, () -> {
            jobService.updateJob(100L, request, 3L, UserRole.CLIENT);
        });
        
        verify(jobRepository, never()).save(any());
    }

    @Test
    void testDeleteJob_WithActiveProposals() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        
        // Job status is IN_PROGRESS, not DRAFT or OPEN
        BusinessException ex = assertThrows(BusinessException.class, () -> {
            jobService.deleteJob(100L, 2L, UserRole.CLIENT);
        });
        
        assertEquals("Cannot delete job with status: IN_PROGRESS", ex.getMessage());
        verify(jobRepository, never()).delete(any());
    }

    @Test
    void testCreateJob_WithTimeline() {
        java.time.LocalDate startDate = java.time.LocalDate.now().plusDays(1);
        java.time.LocalDate deadline = java.time.LocalDate.now().plusDays(15);
        String duration = "2 weeks";
        
        CreateJobRequest request = new CreateJobRequest("Title", "Description", 
                new BigDecimal("100"), new BigDecimal("500"), deadline, startDate, duration, Collections.emptyList());
                
        when(userRepository.findById(2L)).thenReturn(Optional.of(clientUser));
        when(jobRepository.save(any(Job.class))).thenAnswer(i -> {
            Job saved = i.getArgument(0);
            saved.setId(101L);
            return saved;
        });
        
        com.aimarket.dto.job.JobResponse response = jobService.createJob(request, 2L);
        
        assertEquals(startDate, response.startDate());
        assertEquals(deadline, response.deadline());
        assertEquals(duration, response.expectedDuration());
    }

    @Test
    void testUpdateJob_Timeline() {
        java.time.LocalDate newStartDate = java.time.LocalDate.now().plusDays(5);
        java.time.LocalDate newDeadline = java.time.LocalDate.now().plusDays(20);
        String newDuration = "3 weeks";
        
        UpdateJobRequest request = new UpdateJobRequest(null, null, null, null, newDeadline, newStartDate, newDuration, null);
        
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(jobRepository.save(any(Job.class))).thenAnswer(i -> i.getArgument(0));
        
        com.aimarket.dto.job.JobResponse response = jobService.updateJob(100L, request, 2L, UserRole.CLIENT);
        
        assertEquals(newStartDate, response.startDate());
        assertEquals(newDeadline, response.deadline());
        assertEquals(newDuration, response.expectedDuration());
    }
}
