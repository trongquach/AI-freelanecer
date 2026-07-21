package com.aimarket.integration;

import com.aimarket.dto.auth.AuthResponse;
import com.aimarket.dto.auth.LoginRequest;
import com.aimarket.dto.auth.RefreshTokenRequest;
import com.aimarket.dto.auth.RegisterRequest;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.repository.RefreshTokenRepository;
import com.aimarket.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
public class AuthIntegrationTest {

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
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @MockBean
    private ValueOperations<String, String> valueOperations;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testFullAuthFlow() throws Exception {
        // 1. Register
        RegisterRequest registerReq = new RegisterRequest(
                "integration@test.com", "Password123!", UserRole.CLIENT, "Integration Test"
        );

        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse registerResponse = objectMapper.readValue(
                registerResult.getResponse().getContentAsString(), AuthResponse.class);

        assertNotNull(registerResponse.accessToken());
        assertNotNull(registerResponse.refreshToken());
        assertEquals("integration@test.com", registerResponse.user().email());

        // Verify DB state
        assertTrue(userRepository.existsByEmail("integration@test.com"));
        assertEquals(1, refreshTokenRepository.count());

        // 2. Login
        LoginRequest loginReq = new LoginRequest("integration@test.com", "Password123!");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(), AuthResponse.class);

        assertNotNull(loginResponse.accessToken());
        assertNotNull(loginResponse.refreshToken());

        // 3. Refresh Token
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(loginResponse.refreshToken());

        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse refreshResponse = objectMapper.readValue(
                refreshResult.getResponse().getContentAsString(), AuthResponse.class);

        assertNotNull(refreshResponse.accessToken());
        assertNotNull(refreshResponse.refreshToken());
        assertNotEquals(loginResponse.refreshToken(), refreshResponse.refreshToken());

        // 4. Logout
        // Require auth header
        mockMvc.perform(post("/api/v1/auth/logout")
                .header("Authorization", "Bearer " + refreshResponse.accessToken())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
