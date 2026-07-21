package com.aimarket.service;

import com.aimarket.ai.AIClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

import com.aimarket.repository.SkillRepository;
import com.aimarket.entity.Skill;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIJobAssistantService {

    private final AIClient aiClient;
    private final ObjectMapper objectMapper;
    private final SkillRepository skillRepository;

    private static final String SYSTEM_PROMPT = """
        You are an AI job assistant for an AI freelance marketplace.
        Analyze the job draft and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
        {
          "improvedTitle": "...",
          "improvedDescription": "...",
          "suggestedBudgetMin": 500,
          "suggestedBudgetMax": 2000,
          "missingSkills": ["skill1", "skill2"],
          "reasoning": "brief explanation"
        }
        IMPORTANT: For "missingSkills", you MUST ONLY select skills from the "Available Skills" list provided in the user prompt. Do not invent new skills.
        """;

    public record AIJobSuggestionDTO(
        String improvedTitle,
        String improvedDescription,
        Number suggestedBudgetMin,
        Number suggestedBudgetMax,
        List<String> missingSkills,
        String reasoning
    ) {}

    @Cacheable(value = "ai-job-enhance", key = "#title.concat(#description)")
    public AIJobSuggestionDTO enhanceJob(String title, String description, List<String> skills) {
        String availableSkills = skillRepository.findAll().stream()
                .map(Skill::getName)
                .collect(Collectors.joining(", "));
                
        String userMsg = String.format("Title: %s\nDescription: %s\nCurrent skills: %s\nAvailable Skills: %s",
                title, description, String.join(", ", skills), availableSkills);
        try {
            String raw = aiClient.complete(SYSTEM_PROMPT, userMsg, 2048);
            if (raw == null) return fallback(title, description);
            
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
            
            return objectMapper.readValue(raw, AIJobSuggestionDTO.class);
        } catch (Exception e) {
            log.warn("AI enhance job failed, returning fallback: {}", e.getMessage());
            return fallback(title, description);
        }
    }

    private AIJobSuggestionDTO fallback(String title, String description) {
        return new AIJobSuggestionDTO(title, description, null, null, List.of(),
                "AI is temporarily unavailable. Please try again later.");
    }
}
