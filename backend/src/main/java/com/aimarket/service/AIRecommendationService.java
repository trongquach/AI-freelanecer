package com.aimarket.service;

import com.aimarket.entity.UserProfile;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.repository.JobRepository;
import com.aimarket.repository.UserProfileRepository;
import com.aimarket.util.CosineSimilarityUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Expert Recommendation Service.
 *
 * <p>Flow:
 * <ol>
 *   <li>Generate text embedding for the job description via OpenAI / Anthropic embedding API.</li>
 *   <li>Load all EXPERT profiles that have a stored skills_embedding.</li>
 *   <li>Rank experts by cosine similarity and return top-N.</li>
 * </ol>
 *
 * <p>Expert embeddings are built lazily the first time an expert saves/updates their profile
 * ({@link #updateExpertEmbedding(Long)}) and cached in {@code user_profiles.skills_embedding}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIRecommendationService {

    private final UserProfileRepository userProfileRepository;
    private final JobRepository jobRepository;
    private final CosineSimilarityUtil cosineSimilarityUtil;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${ai.provider:OPENAI}")
    private String aiProvider;

    private static final String OPENAI_EMBEDDING_URL = "https://api.openai.com/v1/embeddings";
    private static final String OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
    private static final int TOP_N = 5;

    // ─── DTO ──────────────────────────────────────────────────────────────────

    public record ExpertRecommendationDTO(
            Long expertId,
            String fullName,
            String avatarUrl,
            Double rating,
            Integer totalReviews,
            List<String> skills,
            Double similarityScore,
            Integer completedJobs
    ) {}

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Returns top-N recommended experts for a given job.
     * Results are cached in Redis for 10 minutes (see {@code CacheConfig}).
     */
    @Cacheable(value = "expert-recommendations", key = "#jobId")
    public List<ExpertRecommendationDTO> getTopExperts(Long jobId) {
        // 1. Load job
        var job = jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        // 2. Build text for the job
        String jobText = buildJobText(
                job.getTitle(),
                job.getDescription(),
                job.getSkills().stream().map(s -> s.getName()).collect(Collectors.toList())
        );

        // 3. Get job embedding
        List<Double> jobEmbedding = getEmbedding(jobText);
        if (jobEmbedding == null || jobEmbedding.isEmpty()) {
            log.warn("Could not generate embedding for job {}, falling back to skill-based matching", jobId);
            return fallbackBySkills(job);
        }

        // 4. Load all expert profiles with embeddings
        List<UserProfile> expertProfiles = userProfileRepository.findAllExpertsWithEmbedding();
        
        if (expertProfiles.isEmpty()) {
            log.info("No experts with embeddings found, falling back to skill-based matching");
            return fallbackBySkills(job);
        }

        // 5. Score & rank
        return expertProfiles.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsAvailable()))
                .filter(p -> p.getRating() == null || p.getRating().doubleValue() >= 0) // include all in dev
                .map(p -> toDTO(p, jobEmbedding))
                .filter(dto -> dto.similarityScore() > 0)
                .sorted(Comparator.comparingDouble(ExpertRecommendationDTO::similarityScore).reversed())
                .limit(TOP_N)
                .collect(Collectors.toList());
    }

    /**
     * Builds (or refreshes) the embedding vector for an expert's profile.
     * Called asynchronously after profile/skill updates.
     */
    @Async
    public void updateExpertEmbedding(Long userId) {
        try {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            if (profile == null) return;

            // Build text from bio + skills
            String skillsText = userProfileRepository.findSkillNamesByUserId(userId)
                    .stream().collect(Collectors.joining(", "));
            String bio = profile.getBio() != null ? profile.getBio() : "";
            String text = (skillsText + " " + bio).trim();

            if (text.isBlank()) return;

            List<Double> embedding = getEmbedding(text);
            if (embedding == null || embedding.isEmpty()) return;

            // Serialize and persist
            profile.setSkillsEmbedding(objectMapper.writeValueAsString(embedding));
            userProfileRepository.save(profile);
            log.info("Updated embedding for user {}", userId);
        } catch (Exception e) {
            log.error("Failed to update embedding for user {}: {}", userId, e.getMessage());
        }
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private String buildJobText(String title, String description, List<String> skills) {
        return String.format("%s. %s. Skills: %s", title, description,
                String.join(", ", skills));
    }

    /**
     * Calls OpenAI text-embedding-3-small to create a vector.
     * Falls back to null if API is unavailable (no crash).
     */
    @SuppressWarnings("unchecked")
    private List<Double> getEmbedding(String text) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            log.debug("OpenAI API key not configured – skipping embedding");
            return null;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            Map<String, Object> body = Map.of(
                    "model", OPENAI_EMBEDDING_MODEL,
                    "input", text.length() > 8000 ? text.substring(0, 8000) : text
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    OPENAI_EMBEDDING_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) response.getBody().get("data");
                if (dataList != null && !dataList.isEmpty()) {
                    List<Number> rawEmbedding = (List<Number>) dataList.get(0).get("embedding");
                    return rawEmbedding.stream().map(Number::doubleValue).collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            log.warn("Embedding API call failed: {}", e.getMessage());
        }
        return null;
    }

    private ExpertRecommendationDTO toDTO(UserProfile profile, List<Double> jobEmbedding) {
        double score = 0.0;
        if (profile.getSkillsEmbedding() != null) {
            try {
                List<Double> expertEmbedding = objectMapper.readValue(
                        profile.getSkillsEmbedding(), new TypeReference<List<Double>>() {});
                score = cosineSimilarityUtil.cosineSimilarity(jobEmbedding, expertEmbedding);
            } catch (Exception e) {
                log.debug("Could not parse embedding for profile {}: {}", profile.getId(), e.getMessage());
            }
        }

        // Fetch skills for display
        List<String> skillNames = userProfileRepository.findSkillNamesByUserId(profile.getUser().getId());

        return new ExpertRecommendationDTO(
                profile.getUser().getId(),
                profile.getFullName(),
                profile.getAvatarUrl(),
                profile.getRating() != null ? profile.getRating().doubleValue() : 0.0,
                profile.getTotalReviews() != null ? profile.getTotalReviews() : 0,
                skillNames,
                Math.round(score * 1000.0) / 1000.0,
                profile.getTotalReviews() != null ? profile.getTotalReviews() : 0
        );
    }

    /**
     * Fallback when embedding API is unavailable: match experts by shared skills with the job.
     */
    private List<ExpertRecommendationDTO> fallbackBySkills(com.aimarket.entity.Job job) {
        if (job.getSkills().isEmpty()) return List.of();

        List<Long> skillIds = job.getSkills().stream()
                .map(s -> s.getId())
                .collect(Collectors.toList());

        return userProfileRepository.findExpertsBySkillIds(skillIds)
                .stream()
                .limit(TOP_N)
                .map(p -> {
                    List<String> skillNames = userProfileRepository.findSkillNamesByUserId(p.getUser().getId());
                    return new ExpertRecommendationDTO(
                            p.getUser().getId(),
                            p.getFullName(),
                            p.getAvatarUrl(),
                            p.getRating() != null ? p.getRating().doubleValue() : 0.0,
                            p.getTotalReviews() != null ? p.getTotalReviews() : 0,
                            skillNames,
                            0.0, // no embedding score
                            p.getTotalReviews() != null ? p.getTotalReviews() : 0
                    );
                })
                .collect(Collectors.toList());
    }
}
