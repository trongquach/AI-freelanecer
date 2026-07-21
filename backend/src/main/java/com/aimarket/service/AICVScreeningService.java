package com.aimarket.service;

import com.aimarket.ai.AIClient;
import com.aimarket.entity.enums.ProposalStatus;
import com.aimarket.repository.ProposalRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service sàng lọc CV của Expert bằng AI.
 *
 * <p>Flow:
 * <ol>
 *   <li>Expert nộp Proposal → {@link ProposalService} gọi {@link #screenAsync} bất đồng bộ.</li>
 *   <li>Service xây dựng prompt gồm mô tả Job và nội dung CV từ hệ thống.</li>
 *   <li>Gọi {@link AIClient} (OpenAI/Anthropic/Gemini) để chấm điểm.</li>
 *   <li>Lưu aiScore + aiFeedback, đổi status → AI_PASSED hoặc AI_FAILED.</li>
 *   <li>Gửi thông báo kết quả cho Expert.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AICVScreeningService {

    private final AIClient aiClient;
    private final ProposalRepository proposalRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are an AI recruitment expert. Evaluate the suitability of the candidate's profile
            against the job requirements and return ONLY valid JSON (no markdown, no explanations):
            {
              "score": 0.85,
              "passed": true,
              "strengths": ["strength 1", "strength 2"],
              "weaknesses": ["weakness 1"],
              "feedback": "General feedback in English, around 2-3 sentences"
            }
            score is a number from 0.0 to 1.0. passed is true if score >= threshold.
            """;

    // ── Public API ────────────────────────────────────────────

    /**
     * Chạy bất đồng bộ — được gọi ngay sau khi Expert submit Proposal.
     *
     * @param proposalId      ID của Proposal vừa tạo
     * @param jobTitle        Tiêu đề công việc
     * @param jobDescription  Mô tả công việc
     * @param jobSkills       Danh sách kỹ năng yêu cầu
     * @param coverLetter     Cover letter của Expert
     * @param expertBio       Bio trong hồ sơ Expert
     * @param expertSkills    Kỹ năng trong hồ sơ Expert
     * @param cvSummary       Phần tóm tắt trong CV hệ thống của Expert
     * @param workExperiences Kinh nghiệm làm việc (dạng text)
     * @param yearsExp        Số năm kinh nghiệm
     * @param threshold       Ngưỡng điểm tối thiểu để qua (do Client cấu hình)
     * @param expertId        ID Expert để gửi thông báo kết quả
     */
    @Async
    @Transactional
    public void screenAsync(
            Long proposalId,
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
        // Đổi trạng thái → đang xử lý
        proposalRepository.findById(proposalId).ifPresent(p -> {
            p.setStatus(ProposalStatus.AI_SCREENING);
            proposalRepository.save(p);
        });

        try {
            String userMessage = buildPrompt(
                    jobTitle, jobDescription, jobSkills,
                    coverLetter, expertBio, expertSkills,
                    cvSummary, workExperiences, yearsExp, threshold
            );

            String raw = aiClient.complete(SYSTEM_PROMPT, userMessage, 1024);
            ScreeningResult result = parseResult(raw, threshold);

            // Lưu kết quả vào Proposal
            proposalRepository.findById(proposalId).ifPresent(p -> {
                p.setAiScore(result.score());
                p.setAiFeedback(result.feedback());
                p.setStatus(result.passed() ? ProposalStatus.AI_PASSED : ProposalStatus.AI_FAILED);
                proposalRepository.save(p);
                log.info("AI screening done for proposal {}: score={}, passed={}",
                        proposalId, result.score(), result.passed());
            });

            // Thông báo cho Expert
            String title = result.passed() ? "✅ CV passed AI screening" : "❌ CV does not meet requirements";
            String body = result.passed()
                    ? "Your CV matches the job requirements! The client will review your profile."
                    : "Your CV did not meet the criteria: " + result.feedback();
            notificationService.send(expertId, "CV_SCREENING_RESULT", title, body, proposalId);

            // Thông báo cho Client nếu passed
            if (result.passed()) {
                proposalRepository.findById(proposalId).ifPresent(p -> {
                    notificationService.send(
                            p.getJob().getClient().getId(),
                            "PROPOSAL_RECEIVED",
                            "New proposal received",
                            "A new candidate has passed the AI screening for your job: " + p.getJob().getTitle(),
                            proposalId
                    );
                });
            }
        } catch (Exception e) {
            log.warn("AI screening failed for proposal {}, fallback to PENDING: {}", proposalId, e.getMessage());
            // Nếu AI lỗi → trả về PENDING để Client tự xét thủ công
            proposalRepository.findById(proposalId).ifPresent(p -> {
                p.setStatus(ProposalStatus.PENDING);
                p.setAiFeedback("AI screening is temporarily unavailable. Please review manually.");
                proposalRepository.save(p);
                
                notificationService.send(
                        p.getJob().getClient().getId(),
                        "PROPOSAL_RECEIVED",
                        "New proposal requires manual review",
                        "A new proposal was submitted for your job '" + p.getJob().getTitle() + "' but AI screening is currently unavailable.",
                        proposalId
                );
            });
        }
    }

    // ── Private helpers ───────────────────────────────────────

    private String buildPrompt(
            String jobTitle, String jobDescription, List<String> jobSkills,
            String coverLetter, String expertBio, List<String> expertSkills,
            String cvSummary, String workExperiences, Integer yearsExp,
            double threshold
    ) {
        return String.format("""
                === JOB REQUIREMENTS ===
                Title: %s
                Description: %s
                Required Skills: %s
                Passing Threshold: %.2f

                === CANDIDATE PROFILE ===
                Cover Letter: %s
                CV Summary: %s
                Work Experiences: %s
                Years of Experience: %s
                Profile Bio: %s
                Current Skills: %s
                """,
                jobTitle,
                truncate(jobDescription, 1500),
                String.join(", ", jobSkills),
                threshold,
                truncate(coverLetter, 800),
                truncate(cvSummary != null ? cvSummary : "None", 500),
                truncate(workExperiences != null ? workExperiences : "None", 800),
                yearsExp != null ? yearsExp + " years" : "Not specified",
                truncate(expertBio != null ? expertBio : "None", 300),
                String.join(", ", expertSkills)
        );
    }

    private ScreeningResult parseResult(String raw, double threshold) {
        if (raw == null || raw.isBlank()) {
            return new ScreeningResult(0.0, false, "AI did not return a result.");
        }
        try {
            // Strip markdown code block nếu có
            raw = raw.trim();
            if (raw.startsWith("```json")) raw = raw.substring(7);
            else if (raw.startsWith("```")) raw = raw.substring(3);
            if (raw.endsWith("```")) raw = raw.substring(0, raw.length() - 3);
            raw = raw.trim();

            var node = objectMapper.readTree(raw);
            double score = node.path("score").asDouble(0.0);
            // Clamp về [0.0, 1.0]
            score = Math.max(0.0, Math.min(1.0, score));
            boolean passed = score >= threshold;
            String feedback = node.path("feedback").asText("No feedback provided.");
            return new ScreeningResult(score, passed, feedback);
        } catch (Exception e) {
            log.warn("Failed to parse AI screening result: {}", e.getMessage());
            return new ScreeningResult(0.0, false, "Failed to parse AI result.");
        }
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "..." : text;
    }

    // ── Internal DTO ──────────────────────────────────────────

    private record ScreeningResult(double score, boolean passed, String feedback) {}
}
