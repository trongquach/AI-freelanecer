package com.aimarket.dto.auth;

import com.aimarket.entity.enums.UserRole;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresIn,
    UserInfo user
) {
    public record UserInfo(
        Long id,
        String email,
        UserRole role,
        String fullName,
        String avatarUrl
    ) {}

    public static AuthResponse of(String accessToken, String refreshToken, long expiresIn, UserInfo user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, user);
    }
}
