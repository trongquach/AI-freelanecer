package com.aimarket.service;

import com.aimarket.ai.AIClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIServiceGeneratorService {

    private final AIClient aiClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
        You are an expert AI marketing assistant for freelancers.
        Based on the user's brief idea/keywords, generate a complete and attractive freelance service package.
        Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
        {
          "title": "I will develop a professional AI Chatbot...",
          "description": "Professional description of the service, highlighting benefits and process (about 150 words).",
          "suggestedPrice": 150,
          "suggestedDeliveryDays": 5,
          "suggestedTags": ["AI", "Chatbot", "Python"]
        }
        """;

    public record ServiceGeneratedDTO(
        String title,
        String description,
        Number suggestedPrice,
        Number suggestedDeliveryDays,
        List<String> suggestedTags
    ) {}

    public ServiceGeneratedDTO generate(String prompt) {
        String userMsg = "Idea or Keywords: " + prompt;
        try {
            String raw = aiClient.complete(SYSTEM_PROMPT, userMsg, 4096);
            if (raw == null) return fallback();
            
            raw = raw.trim();
            if (raw.startsWith("```json")) {
                raw = raw.substring(7);
            } else if (raw.startsWith("```")) {
                raw = raw.substring(3);
            }
            if (raw.endsWith("```")) {
                raw = raw.substring(0, raw.length() - 3);
            }
            raw = raw.trim();

            log.info("RAW AI OUTPUT: {}", raw);
            return objectMapper.readValue(raw, ServiceGeneratedDTO.class);
        } catch (Exception e) {
            log.warn("AI service generate failed: {}", e.getMessage());
            return fallback();
        }
    }

    private ServiceGeneratedDTO fallback() {
        return new ServiceGeneratedDTO(
                "I will provide professional services",
                "AI is temporarily unavailable. Please enter a description manually.",
                100, 3, List.of("Freelance"));
    }
}
