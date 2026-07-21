package com.aimarket.entity.enums;

public enum ProposalStatus {
    // Vừa nộp, đang chờ AI xử lý
    PENDING,
    // AI đang phân tích CV
    AI_SCREENING,
    // AI duyệt qua — hiển thị cho Client
    AI_PASSED,
    // AI loại — không hiển thị cho Client
    AI_FAILED,
    // Client chọn vào vòng phỏng vấn
    SHORTLISTED,
    // Đã phỏng vấn xong (qua chat)
    INTERVIEWED,
    // Client chốt → Tạo hợp đồng
    ACCEPTED,
    // Bị loại bởi Client
    REJECTED,
    // Expert tự rút
    WITHDRAWN
}
