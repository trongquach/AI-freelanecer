package com.aimarket.service;

import com.aimarket.dto.review.*;
import com.aimarket.entity.*;
import com.aimarket.entity.enums.ContractStatus;
import com.aimarket.exception.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ReviewResponse create(CreateReviewRequest req, Long reviewerId) {
        Contract contract = contractRepository.findByIdWithDetails(req.contractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", req.contractId()));

        if (contract.getStatus() != ContractStatus.COMPLETED)
            throw new BusinessException("Can only review completed contracts");

        boolean isParty = contract.getClient().getId().equals(reviewerId)
                || contract.getExpert().getId().equals(reviewerId);
        if (!isParty) throw new ForbiddenException();

        if (reviewRepository.existsByContractIdAndReviewerId(req.contractId(), reviewerId))
            throw new BusinessException("You have already reviewed this contract");

        // Determine who is being reviewed
        Long revieweeId = contract.getClient().getId().equals(reviewerId)
                ? contract.getExpert().getId()
                : contract.getClient().getId();

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", reviewerId));
        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", revieweeId));

        Review review = Review.builder()
                .contract(contract)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(req.rating())
                .comment(req.comment())
                .build();
        reviewRepository.save(review);

        // Update reviewee's average rating
        updateUserRating(revieweeId);

        notificationService.send(revieweeId, "REVIEW", "New Review",
                String.format("You received a %.1f★ review for contract #%d", req.rating(), req.contractId()),
                req.contractId());

        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsForUser(Long userId, int page, int size) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    private void updateUserRating(Long userId) {
        BigDecimal avgRating = reviewRepository.averageRatingForUser(userId)
                .orElse(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        long count = reviewRepository.countByRevieweeId(userId);

        userRepository.findByIdWithProfile(userId).ifPresent(user -> {
            if (user.getProfile() != null) {
                user.getProfile().setRating(avgRating);
                user.getProfile().setTotalReviews((int) count);
                userRepository.save(user);
            }
        });
    }

    private ReviewResponse toResponse(Review r) {
        var profile = r.getReviewer().getProfile();
        return new ReviewResponse(r.getId(), r.getContract().getId(),
                new ReviewResponse.ReviewerInfo(r.getReviewer().getId(),
                        profile != null ? profile.getFullName() : null,
                        profile != null ? profile.getAvatarUrl() : null),
                r.getRating(), r.getComment(), r.getCreatedAt());
    }
}
