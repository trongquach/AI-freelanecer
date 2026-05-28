package com.aimarket.dto.admin;

import com.aimarket.entity.enums.UserRole;
import com.aimarket.entity.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;
}
