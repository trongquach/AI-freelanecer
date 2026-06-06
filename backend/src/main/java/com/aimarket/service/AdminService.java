package com.aimarket.service;

import com.aimarket.dto.admin.PlatformStatsResponse;
import com.aimarket.entity.enums.*;
import com.aimarket.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ContractRepository contractRepository;
    private final ExpertServiceRepository expertServiceRepository;
    private final TransactionRepository transactionRepository;
    private final EscrowAccountRepository escrowAccountRepository;
    private final NotificationService notificationService;
    private final ExpertServiceService expertServiceService;

    @Transactional(readOnly = true)
    public PlatformStatsResponse getStats() {
        long totalUsers   = userRepository.count();
        long totalClients = userRepository.countByRole(UserRole.CLIENT);
        long totalExperts = userRepository.countByRole(UserRole.EXPERT);
        long totalJobs    = jobRepository.count();
        long openJobs     = jobRepository.countByStatus(JobStatus.OPEN);
        long activeCons   = contractRepository.countByStatus(ContractStatus.ACTIVE);
        long completedCons= contractRepository.countByStatus(ContractStatus.COMPLETED);
        long totalSvc     = expertServiceRepository.count();

        BigDecimal totalVol = transactionRepository.sumAmountByType(TransactionType.RELEASE)
                .orElse(BigDecimal.ZERO);
        BigDecimal feeEarned = transactionRepository.sumAmountByType(TransactionType.FEE)
                .orElse(BigDecimal.ZERO);
        BigDecimal totalEscrowLocked = escrowAccountRepository.sumLockedAmount();
        if (totalEscrowLocked == null) totalEscrowLocked = BigDecimal.ZERO;

        return new PlatformStatsResponse(
                totalUsers, totalClients, totalExperts,
                totalJobs, openJobs,
                activeCons, completedCons,
                totalSvc,
                totalVol, feeEarned, totalEscrowLocked,
                List.of()
        );
    }

    @Transactional
    public void banUser(Long userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setStatus(com.aimarket.entity.enums.UserStatus.BANNED);
            userRepository.save(u);
        });
    }

    @Transactional
    public void activateService(Long serviceId) {
        expertServiceRepository.findById(serviceId).ifPresent(s -> {
            s.setStatus(ServiceStatus.ACTIVE);
            expertServiceRepository.save(s);
        });
    }

    @Transactional
    public void rejectService(Long serviceId) {
        expertServiceRepository.findById(serviceId).ifPresent(s -> {
            s.setStatus(ServiceStatus.REJECTED);
            expertServiceRepository.save(s);
        });
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.aimarket.dto.admin.UserDto> getUsers(org.springframework.data.domain.Pageable pageable) {
        return userRepository.findAllWithProfile(pageable)
                .map(u -> com.aimarket.dto.admin.UserDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getProfile() != null ? u.getProfile().getFullName() : null)
                        .role(u.getRole())
                        .status(u.getStatus())
                        .createdAt(u.getCreatedAt())
                        .build());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.aimarket.dto.service.ServiceResponse> getPendingServices(org.springframework.data.domain.Pageable pageable) {
        return expertServiceRepository.findByStatus(ServiceStatus.PENDING_REVIEW, pageable)
                .map(expertServiceService::toResponse);
    }

    @Transactional
    public void deleteJob(Long jobId) {
        jobRepository.findById(jobId).ifPresent(jobRepository::delete);
    }

    @Transactional
    public void deleteService(Long serviceId) {
        expertServiceRepository.findById(serviceId).ifPresent(expertServiceRepository::delete);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.aimarket.entity.Transaction> getTransactions(org.springframework.data.domain.Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }
}
