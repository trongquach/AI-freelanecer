package com.aimarket.service;

import com.aimarket.dto.service.CreateServiceRequest;
import com.aimarket.dto.service.ServiceResponse;
import com.aimarket.entity.ExpertService;
import com.aimarket.entity.User;
import com.aimarket.entity.enums.ServiceStatus;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.exception.ForbiddenException;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.repository.ExpertServiceRepository;
import com.aimarket.repository.SkillRepository;
import com.aimarket.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpertServiceServiceTest {

    @Mock
    private ExpertServiceRepository serviceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SkillRepository skillRepository;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ExpertServiceService expertServiceService;

    private User expertUser;
    private ExpertService expertService;

    @BeforeEach
    void setUp() {
        expertUser = new User();
        expertUser.setId(1L);
        expertUser.setRole(UserRole.EXPERT);

        expertService = new ExpertService();
        expertService.setId(100L);
        expertService.setExpert(expertUser);
        expertService.setTitle("Original Title");
        expertService.setPrice(BigDecimal.valueOf(100));
        expertService.setDeliveryDays(5);
        expertService.setStatus(ServiceStatus.PENDING_REVIEW);
    }

    @Test
    void createService_Success() {
        CreateServiceRequest request = new CreateServiceRequest("New Service", "Description", BigDecimal.valueOf(150), 3, List.of("AI"), List.of());
        when(userRepository.findById(1L)).thenReturn(Optional.of(expertUser));
        when(serviceRepository.save(any(ExpertService.class))).thenAnswer(i -> {
            ExpertService s = i.getArgument(0);
            s.setId(101L);
            return s;
        });

        ServiceResponse response = expertServiceService.createService(request, 1L);

        assertNotNull(response);
        assertEquals("New Service", response.title());
        assertEquals(BigDecimal.valueOf(150), response.price());
    }

    @Test
    void createService_FailsIfNotExpert() {
        User clientUser = new User();
        clientUser.setId(2L);
        clientUser.setRole(UserRole.CLIENT);
        when(userRepository.findById(2L)).thenReturn(Optional.of(clientUser));
        CreateServiceRequest request = new CreateServiceRequest("Title", "Desc", BigDecimal.TEN, 1, List.of(), List.of());

        assertThrows(ForbiddenException.class, () -> expertServiceService.createService(request, 2L));
    }

    @Test
    void updateService_Success() {
        CreateServiceRequest request = new CreateServiceRequest("Updated Title", "Updated Desc", BigDecimal.valueOf(200), 10, List.of(), List.of());
        when(serviceRepository.findById(100L)).thenReturn(Optional.of(expertService));
        when(serviceRepository.save(any(ExpertService.class))).thenAnswer(i -> i.getArgument(0));

        ServiceResponse response = expertServiceService.updateService(100L, request, 1L);

        assertEquals("Updated Title", response.title());
        assertEquals(BigDecimal.valueOf(200), response.price());
    }

    @Test
    void activateServiceByExpert_Success() {
        expertService.setStatus(ServiceStatus.INACTIVE); // Must not be PENDING_REVIEW
        when(serviceRepository.findById(100L)).thenReturn(Optional.of(expertService));
        when(serviceRepository.save(any(ExpertService.class))).thenAnswer(i -> i.getArgument(0));

        ServiceResponse response = expertServiceService.activateServiceByExpert(100L, 1L);

        assertEquals(ServiceStatus.ACTIVE, response.status());
    }

    @Test
    void deleteService_Success() {
        when(serviceRepository.findById(100L)).thenReturn(Optional.of(expertService));
        doNothing().when(serviceRepository).delete(expertService);

        assertDoesNotThrow(() -> expertServiceService.deleteService(100L, 1L, UserRole.EXPERT));
        verify(serviceRepository, times(1)).delete(expertService);
    }
}
