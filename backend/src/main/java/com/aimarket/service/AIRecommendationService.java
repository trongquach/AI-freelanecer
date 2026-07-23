package com.aimarket.service;

import com.aimarket.ai.EmbeddingService;
import com.aimarket.entity.UserProfile;
import com.aimarket.repository.JobRepository;
import com.aimarket.repository.UserProfileRepository;
import com.aimarket.util.CosineSimilarityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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
    private final EmbeddingService embeddingService;

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
     * Recommend jobs for a given user profile based on matching skills and history.
     */
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
        List<Double> jobEmbedding = embeddingService.embed(jobText);
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

            List<Double> embedding = embeddingService.embed(text);
            if (embedding == null || embedding.isEmpty()) return;

            // Serialize and persist
            profile.setSkillsEmbedding(embeddingService.toJson(embedding));
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


    private ExpertRecommendationDTO toDTO(UserProfile profile, List<Double> jobEmbedding) {
        double score = 0.0;
        if (profile.getSkillsEmbedding() != null) {
            List<Double> expertEmbedding = embeddingService.fromJson(profile.getSkillsEmbedding());
            if (expertEmbedding != null) {
                score = cosineSimilarityUtil.cosineSimilarity(jobEmbedding, expertEmbedding);
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
