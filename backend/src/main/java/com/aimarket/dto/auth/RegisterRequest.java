package com.aimarket.dto.auth;

import com.aimarket.entity.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank(message = "Password is required")
    @Size(min = 9, message = "Password must be at least 9 characters long") 
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}\\[\\]|\\\\:;\"'<>,.?/-]).{9,}$",
        message = "Password must contain at least 1 uppercase letter and 1 special character"
    ) 
    String password,
    @NotNull UserRole role,
    @NotBlank @Size(max = 255) String fullName
) {}
