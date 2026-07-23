package com.aimarket.service;

import com.aimarket.ai.EmbeddingService;
import com.aimarket.entity.enums.ProposalStatus;
import com.aimarket.repository.ExpertCVRepository;
import com.aimarket.repository.JobRepository;
import com.aimarket.repository.ProposalRepository;
import com.aimarket.util.CosineSimilarityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service sàng lọc CV bằng Vector Embedding + Cosine Similarity.
 *
 * <h2>Không dùng LLM/prompt để chấm điểm.</h2>
 * Toàn bộ điểm số tính bằng công thức toán học:
 *
 * <pre>
 * finalScore = cosine(jobSkills ↔ expertSkills) × 0.45
 *            + cosine(jobDesc   ↔ expertCV)     × 0.30
 *            + cosine(jobDesc   ↔ coverLetter)  × 0.15
 *            + sigmoid(yearsExp)                × 0.10
 * </pre>
 *
 * Feedback được sinh tự động từ điểm từng chiều, không gọi AI.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AICVScreeningService {

    private final EmbeddingService embeddingService;
    private final CosineSimilarityUtil cosineSimilarityUtil;
    private final ProposalRepository proposalRepository;
    private final JobRepository jobRepository;
    private final ExpertCVRepository expertCVRepository;
    private final NotificationService notificationService;

    // ── Trọng số ──────────────────────────────────────────────
    private static final double W_SKILL    = 0.45;
    private static final double W_EXP      = 0.30;
    private static final double W_COVER    = 0.15;
    private static final double W_SENIORITY = 0.10;

    // ── Public API ────────────────────────────────────────────

    @Async
    @Transactional
    public void screenAsync(
            Long proposalId,
            Long jobId,
            String jobTitle,
            String jobDescription,
            List<String> jobSkills,
            String coverLetter,
            String expertBio,
            List<String> expertSkills,
            String cvSummary,
            String workExperiences,
            Integer yearsExp,
            double threshold,
            Long expertId
    ) {
        proposalRepository.findById(proposalId).ifPresent(p -> {
            p.setStatus(ProposalStatus.AI_SCREENING);
            proposalRepository.save(p);
        });

        try {
            // ── 1. Lấy embedding JD (cache hoặc build mới) ────
            List<Double> jdVec = loadOrBuildJdEmbedding(jobId, jobTitle, jobDescription, jobSkills);

            // ── 2. Lấy CV embedding từ DB ─────────────────────
            List<Double> cvVec = loadCvEmbedding(expertId);

            // ── 3. Lấy skill embedding từ DB ──────────────────
            List<Double> expertSkillVec = expertSkills != null && !expertSkills.isEmpty()
                    ? embeddingService.embed(String.join(", ", expertSkills))
                    : null;

            // ── 4. Embed job skills (realtime) ────────────────
            List<Double> jobSkillVec = jobSkills != null && !jobSkills.isEmpty()
                    ? embeddingService.embed(String.join(", ", jobSkills))
                    : null;

            // ── 5. Embed cover letter (realtime) ──────────────
            List<Double> coverVec = coverLetter != null && !coverLetter.isBlank()
                    ? embeddingService.embed(coverLetter)
                    : null;

            // ── 6. Tính cosine từng chiều ─────────────────────
            double skillSim  = safeCosine(jobSkillVec,  expertSkillVec);
            double expSim    = safeCosine(jdVec,        cvVec);
            double coverSim  = safeCosine(jdVec,        coverVec);
            double expBonus  = calcExperienceBonus(yearsExp);

            // ── 7. Tổng hợp điểm có trọng số ─────────────────
            double finalScore = calcWeightedScore(
                    skillSim, expSim, coverSim, expBonus,
                    expertSkillVec != null, cvVec != null, coverVec != null
            );
            finalScore = Math.max(0.0, Math.min(1.0, finalScore));
            boolean passed = finalScore >= threshold;

            // ── 8. Sinh feedback từ điểm số (không dùng LLM) ─
            String feedback = buildFeedback(skillSim, expSim, coverSim, expBonus,
                    expertSkillVec != null, cvVec != null, passed);

            // ── 9. Lưu kết quả ────────────────────────────────
            double scoreToSave   = finalScore;
            String feedbackToSave = feedback;
            boolean passedToSave  = passed;

            proposalRepository.findById(proposalId).ifPresent(p -> {
                p.setAiScore(scoreToSave);
                p.setAiFeedback(feedbackToSave);
                p.setStatus(passedToSave ? ProposalStatus.AI_PASSED : ProposalStatus.AI_FAILED);
                proposalRepository.save(p);
                log.info("Vector screening done — proposal={} score={} passed={}",
                        proposalId, String.format("%.3f", scoreToSave), passedToSave);
            });

            // ── 10. Thông báo ─────────────────────────────────
            String title = passed ? "✅ CV passed AI screening" : "❌ CV does not meet requirements";
            String body  = passed
                    ? String.format("Your CV scored %.0f%%. The client will review your profile.", finalScore * 100)
                    : String.format("Your CV scored %.0f%% (minimum %.0f%%). %s", finalScore * 100, threshold * 100, feedback);
            notificationService.send(expertId, "CV_SCREENING_RESULT", title, body, proposalId);

            if (passed) {
                proposalRepository.findById(proposalId).ifPresent(p ->
                    notificationService.send(
                            p.getJob().getClient().getId(),
                            "PROPOSAL_RECEIVED",
                            "New proposal received",
                            "A candidate scored " + String.format("%.0f%%", finalScore * 100)
                                    + " and passed AI screening for: " + p.getJob().getTitle(),
                            proposalId
                    )
                );
            }

        } catch (Exception e) {
            log.warn("Vector screening failed for proposal {}: {}", proposalId, e.getMessage());
            proposalRepository.findById(proposalId).ifPresent(p -> {
                p.setStatus(ProposalStatus.PENDING);
                p.setAiFeedback("AI screening unavailable. Please review manually.");
                proposalRepository.save(p);
                notificationService.send(
                        p.getJob().getClient().getId(),
                        "PROPOSAL_RECEIVED",
                        "New proposal requires manual review",
                        "A proposal was submitted for '" + p.getJob().getTitle()
                                + "' but AI screening is currently unavailable.",
                        proposalId
                );
            });
        }
    }

    // ── Private helpers ───────────────────────────────────────

    private List<Double> loadOrBuildJdEmbedding(Long jobId, String title, String desc, List<String> skills) {
        return jobRepository.findById(jobId).map(job -> {
            if (job.getJdEmbedding() != null && !job.getJdEmbedding().isBlank()) {
                return embeddingService.fromJson(job.getJdEmbedding());
            }
            String skillText = skills != null ? String.join(", ", skills) : "";
            List<Double> vec = embeddingService.embed(title + ". " + desc + ". Skills: " + skillText);
            if (vec != null) {
                job.setJdEmbedding(embeddingService.toJson(vec));
                jobRepository.save(job);
            }
            return vec;
        }).orElse(null);
    }

    private List<Double> loadCvEmbedding(Long expertId) {
        return expertCVRepository.findByUserId(expertId)
                .map(cv -> embeddingService.fromJson(cv.getCvEmbedding()))
                .orElse(null);
    }

    private double safeCosine(List<Double> a, List<Double> b) {
        if (a == null || b == null) return 0.0;
        return cosineSimilarityUtil.cosineSimilarity(a, b);
    }

    /**
     * Seniority bonus: sigmoid centered at 3 years.
     * 0yr→0.50, 3yr→0.50, 5yr→0.73, 8yr→0.83, 10yr→0.88
     */
    private double calcExperienceBonus(Integer yearsExp) {
        if (yearsExp == null) return 0.5;
        return 1.0 / (1.0 + Math.exp(-0.3 * (yearsExp - 3)));
    }

    /**
     * Tính điểm tổng hợp. Nếu thiếu chiều → normalize lại weight.
     */
    private double calcWeightedScore(
            double skillSim, double expSim, double coverSim, double expBonus,
            boolean hasSkillVec, boolean hasCvVec, boolean hasCoverVec
    ) {
        double score = expBonus * W_SENIORITY;
        double total = W_SENIORITY;

        if (hasSkillVec) { score += skillSim * W_SKILL; total += W_SKILL; }
        if (hasCvVec)    { score += expSim   * W_EXP;   total += W_EXP;   }
        if (hasCoverVec) { score += coverSim * W_COVER; total += W_COVER; }

        return total > 0 ? score / total : 0.0;
    }

    /**
     * Sinh feedback dạng text từ điểm số — không gọi LLM.
     */
    private String buildFeedback(double skillSim, double expSim, double coverSim,
                                  double expBonus, boolean hasSkill, boolean hasCv, boolean passed) {
        StringBuilder sb = new StringBuilder();

        if (hasSkill) {
            sb.append("Skill match: ").append(toPercent(skillSim)).append(". ");
        }
        if (hasCv) {
            sb.append("Experience relevance: ").append(toPercent(expSim)).append(". ");
        }
        sb.append("Cover letter fit: ").append(toPercent(coverSim)).append(". ");
        sb.append("Seniority: ").append(toPercent(expBonus)).append(".");

        if (!passed) {
            if (hasSkill && skillSim < 0.5)  sb.append(" Consider strengthening your skill alignment with the job requirements.");
            if (hasCv    && expSim   < 0.5)  sb.append(" Your work experience may not closely match this role.");
            if (coverSim < 0.4)               sb.append(" A more targeted cover letter could improve your score.");
        }

        return sb.toString();
    }

    private String toPercent(double val) {
        return String.format("%.0f%%", val * 100);
    }
}
