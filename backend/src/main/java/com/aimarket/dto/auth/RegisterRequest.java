package com.aimarket.dto.auth;

import com.aimarket.entity.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank 
    @Size(min = 9, message = "Mật khẩu phải lớn hơn 8 ký tự") 
    @jakarta.validation.constraints.Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\\[\\]|\\\\:;\"'<>,.?/-]).{9,}$",
        message = "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 ký tự đặc biệt"
    ) 
    String password,
    @NotNull UserRole role,
    @NotBlank @Size(max = 255) String fullName
) {}
