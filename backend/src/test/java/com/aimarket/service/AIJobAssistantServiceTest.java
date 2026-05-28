package com.aimarket.service;

import com.aimarket.ai.AIClient;
import com.aimarket.service.AIJobAssistantService.AIJobSuggestionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.ContextConfiguration;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = {
    AIJobAssistantServiceTest.TestConfig.class,
    AIJobAssistantService.class,
    ObjectMapper.class
})
public class AIJobAssistantServiceTest {

    @TestConfiguration
    @EnableCaching
    static class TestConfig {
        @Bean
        public CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("ai-job-enhance");
        }
    }

    @MockBean
    private AIClient aiClient;

    @Autowired
    private AIJobAssistantService aiJobAssistantService;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void setUp() {
        cacheManager.getCache("ai-job-enhance").clear();
    }

    @Test
    void testEnhanceJob_Success() throws Exception {
        String jsonResponse = """
            {
              "improvedTitle": "Better Title",
              "improvedDescription": "Better Desc",
              "suggestedBudgetMin": 500,
              "suggestedBudgetMax": 2000,
              "missingSkills": ["React", "Spring"],
              "reasoning": "Looks good"
            }
            """;
            
        when(aiClient.complete(anyString(), anyString(), anyInt())).thenReturn(jsonResponse);

        AIJobSuggestionDTO result = aiJobAssistantService.enhanceJob("Title", "Desc", List.of("Java"));
        
        assertNotNull(result);
        assertEquals("Better Title", result.improvedTitle());
        assertEquals("Better Desc", result.improvedDescription());
        assertEquals(2, result.missingSkills().size());
        assertEquals("Looks good", result.reasoning());
    }

    @Test
    void testEnhanceJob_AIUnavailable() throws Exception {
        when(aiClient.complete(anyString(), anyString(), anyInt())).thenThrow(new RuntimeException("API down"));

        AIJobSuggestionDTO result = aiJobAssistantService.enhanceJob("Title", "Desc", List.of("Java"));
        
        assertNotNull(result);
        assertEquals("Title", result.improvedTitle());
        assertTrue(result.reasoning().contains("AI tạm thời không khả dụng"));
    }

    @Test
    void testEnhanceJob_CachedResponse() throws Exception {
        String jsonResponse = """
            {
              "improvedTitle": "Better Title",
              "improvedDescription": "Better Desc",
              "suggestedBudgetMin": 500,
              "suggestedBudgetMax": 2000,
              "missingSkills": [],
              "reasoning": "Looks good"
            }
            """;
            
        when(aiClient.complete(anyString(), anyString(), anyInt())).thenReturn(jsonResponse);

        // Call first time
        aiJobAssistantService.enhanceJob("Title Cache", "Desc Cache", List.of("Java"));
        
        // Call second time with same parameters
        aiJobAssistantService.enhanceJob("Title Cache", "Desc Cache", List.of("Java"));
        
        // Verify AIClient was only called ONCE
        verify(aiClient, times(1)).complete(anyString(), anyString(), anyInt());
    }
}
