package com.aimarket.dto.proposal;

import jakarta.validation.constraints.Size;

/** Client ghi chú sau khi phỏng vấn một ứng viên qua Chat */
public record InterviewNoteRequest(
    @Size(max = 3000) String notes
) {}
