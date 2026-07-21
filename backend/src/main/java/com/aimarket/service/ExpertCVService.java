package com.aimarket.service;

import com.aimarket.dto.cv.ExpertCVRequest;
import com.aimarket.dto.cv.ExpertCVResponse;
import com.aimarket.entity.ExpertCV;
import com.aimarket.entity.User;
import com.aimarket.entity.UserProfile;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.exception.ForbiddenException;
import com.aimarket.exception.ResourceNotFoundException;
import com.aimarket.repository.ExpertCVRepository;
import com.aimarket.repository.UserProfileRepository;
import com.aimarket.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Quản lý CV do Expert tự nhập vào hệ thống.
 * Mỗi Expert chỉ có 1 CV. Tạo hoặc cập nhật đều qua method {@link #upsert}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExpertCVService {

    private final ExpertCVRepository expertCVRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AIRecommendationService aiRecommendationService;
    private final ObjectMapper objectMapper;

    // ── Upsert (tạo mới hoặc cập nhật) ───────────────────────

    @Transactional
    public ExpertCVResponse upsert(ExpertCVRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getRole() != UserRole.EXPERT) {
            throw new ForbiddenException("Chỉ Expert mới có thể tạo/cập nhật CV");
        }

        ExpertCV cv = expertCVRepository.findByUserId(userId)
                .orElse(ExpertCV.builder().user(user).build());

        cv.setSummary(request.summary());
        cv.setLanguages(request.languages());
        cv.setGithubUrl(request.githubUrl());
        cv.setPortfolioUrl(request.portfolioUrl());
        cv.setYearsOfExperience(request.yearsOfExperience());

        cv.setWorkExperiences(toJson(request.workExperiences()));
        cv.setEducations(toJson(request.educations()));
        cv.setCertifications(toJson(request.certifications()));

        ExpertCV saved = expertCVRepository.save(cv);

        // Khi CV cập nhật → rebuild embedding để AI Recommendation chính xác hơn
        aiRecommendationService.updateExpertEmbedding(userId);

        log.info("CV upserted for user {}", userId);
        return toResponse(saved);
    }

    // ── Xem CV của chính mình ─────────────────────────────────

    @Transactional(readOnly = true)
    public ExpertCVResponse getMyCv(Long userId) {
        ExpertCV cv = expertCVRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("CV", userId));
        return toResponse(cv);
    }

    // ── Xem CV của Expert bất kỳ (Client/Admin) ───────────────

    @Transactional(readOnly = true)
    public ExpertCVResponse getCvByUserId(Long expertId) {
        ExpertCV cv = expertCVRepository.findByUserId(expertId)
                .orElseThrow(() -> new ResourceNotFoundException("CV của Expert", expertId));
        return toResponse(cv);
    }

    // ── Build text CV để AI Screening đọc ────────────────────

    /**
     * Tổng hợp nội dung CV thành chuỗi text để AI chấm điểm.
     * Trả về rỗng nếu Expert chưa tạo CV.
     */
    public String buildCvText(Long userId) {
        return expertCVRepository.findByUserId(userId)
                .map(cv -> {
                    StringBuilder sb = new StringBuilder();
                    if (cv.getSummary() != null) sb.append("Tóm tắt: ").append(cv.getSummary()).append("\n");
                    if (cv.getYearsOfExperience() != null)
                        sb.append("Số năm kinh nghiệm: ").append(cv.getYearsOfExperience()).append("\n");
                    if (cv.getWorkExperiences() != null)
                        sb.append("Kinh nghiệm: ").append(cv.getWorkExperiences()).append("\n");
                    if (cv.getEducations() != null)
                        sb.append("Học vấn: ").append(cv.getEducations()).append("\n");
                    if (cv.getCertifications() != null)
                        sb.append("Chứng chỉ: ").append(cv.getCertifications()).append("\n");
                    return sb.toString();
                })
                .orElse("");
    }

    public Integer getYearsOfExperience(Long userId) {
        return expertCVRepository.findByUserId(userId)
                .map(ExpertCV::getYearsOfExperience)
                .orElse(null);
    }

    // ── Helpers ───────────────────────────────────────────────

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Failed to serialize to JSON: {}", e.getMessage());
            return null;
        }
    }

    private <T> List<T> fromJson(String json, TypeReference<List<T>> type) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            log.warn("Failed to deserialize JSON: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private ExpertCVResponse toResponse(ExpertCV cv) {
        UserProfile profile = userProfileRepository.findByUserId(cv.getUser().getId()).orElse(null);

        List<ExpertCVResponse.WorkExperienceResponse> workExps = fromJson(
                cv.getWorkExperiences(),
                new TypeReference<>() {}
        );
        List<ExpertCVResponse.EducationResponse> educations = fromJson(
                cv.getEducations(),
                new TypeReference<>() {}
        );
        List<ExpertCVResponse.CertificationResponse> certifications = fromJson(
                cv.getCertifications(),
                new TypeReference<>() {}
        );

        return new ExpertCVResponse(
                cv.getId(),
                cv.getUser().getId(),
                profile != null ? profile.getFullName() : null,
                cv.getSummary(),
                workExps,
                educations,
                certifications,
                cv.getLanguages(),
                cv.getGithubUrl(),
                cv.getPortfolioUrl(),
                cv.getYearsOfExperience(),
                cv.getUpdatedAt()
        );
    }
}
