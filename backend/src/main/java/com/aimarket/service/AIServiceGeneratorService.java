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
        Generate a professional AI service description for a freelance marketplace.
        Return ONLY valid JSON (no markdown, no explanation):
        {
          "description": "300 word professional description",
          "highlights": ["highlight1", "highlight2", "highlight3"],
          "whatYouGet": ["deliverable1", "deliverable2", "deliverable3"]
        }
        """;

    public record ServiceGeneratedDTO(
        String description,
        List<String> highlights,
        List<String> whatYouGet
    ) {}

    public ServiceGeneratedDTO generate(String title, List<String> keywords, int deliveryDays, double price) {
        String userMsg = String.format(
                "Service: %s\nKeywords: %s\nDelivery: %d days\nPrice: $%.2f",
                title, String.join(", ", keywords), deliveryDays, price);
        try {
            String raw = aiClient.complete(SYSTEM_PROMPT, userMsg, 800);
            if (raw == null) return fallback();
            return objectMapper.readValue(raw, ServiceGeneratedDTO.class);
        } catch (Exception e) {
            log.warn("AI service generate failed: {}", e.getMessage());
            return fallback();
        }
    }

    private ServiceGeneratedDTO fallback() {
        return new ServiceGeneratedDTO(
                "AI tạm thời không khả dụng. Vui lòng nhập mô tả thủ công.",
                List.of(), List.of());
    }
}
