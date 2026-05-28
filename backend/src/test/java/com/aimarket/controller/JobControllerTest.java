package com.aimarket.controller;

import com.aimarket.dto.job.CreateJobRequest;
import com.aimarket.dto.job.JobResponse;
import com.aimarket.entity.enums.JobStatus;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.security.JwtAuthenticationFilter;
import com.aimarket.security.JwtTokenProvider;
import com.aimarket.service.JobService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = JobController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters to test pure controller logic or use @WithMockUser
public class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JobService jobService;
    
    @MockBean
    private JwtTokenProvider jwtTokenProvider; // Required by SecurityConfig if loaded

    private CustomUserDetails clientUser;
    private JobResponse mockResponse;

    @BeforeEach
    void setUp() {
        com.aimarket.entity.User userEntity = new com.aimarket.entity.User();
        userEntity.setId(1L);
        userEntity.setEmail("client@test.com");
        userEntity.setPasswordHash("hash");
        userEntity.setRole(UserRole.CLIENT);
        clientUser = new CustomUserDetails(userEntity);
        
        JobResponse.ClientInfo clientInfo = new JobResponse.ClientInfo(1L, "Test Client", null, 0.0);
        
        mockResponse = new JobResponse(
                100L, "Test Title", "Test Desc",
                new BigDecimal("100"), new BigDecimal("500"), LocalDate.now().plusDays(10),
                JobStatus.DRAFT, false, 0, clientInfo, Collections.emptyList(), LocalDateTime.now()
        );
    }

    @Test
    void testCreateJob_Success() throws Exception {
        CreateJobRequest request = new CreateJobRequest("Test Title", "This is a long description with 50 characters minimal length to pass the validation check.", 
                new BigDecimal("100"), new BigDecimal("500"), LocalDate.now().plusDays(10), Collections.emptyList());

        when(jobService.createJob(any(CreateJobRequest.class), eq(1L))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/jobs")
                .with(user(clientUser))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("Test Title"));
    }

    @Test
    void testCreateJob_InvalidPayload_Returns400() throws Exception {
        CreateJobRequest request = new CreateJobRequest("", "", // Invalid blanks
                new BigDecimal("100"), new BigDecimal("500"), LocalDate.now().minusDays(10), Collections.emptyList());

        mockMvc.perform(post("/api/v1/jobs")
                .with(user(clientUser))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetJobs_Pagination() throws Exception {
        Page<JobResponse> page = new PageImpl<>(List.of(mockResponse));
        when(jobService.listJobs(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/jobs")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(100))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
