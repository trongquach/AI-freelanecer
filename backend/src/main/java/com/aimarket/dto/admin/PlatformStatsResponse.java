package com.aimarket.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public record PlatformStatsResponse(
    long totalUsers,
    long totalClients,
    long totalExperts,
    long totalJobs,
    long openJobs,
    long activeContracts,
    long completedContracts,
    long totalServices,
    BigDecimal totalTransactionVolume,
    BigDecimal platformFeeEarned,
    BigDecimal totalEscrowLocked,
    List<RecentActivity> recentActivity
) {
    public record RecentActivity(String type, String description, String createdAt) {}
}
