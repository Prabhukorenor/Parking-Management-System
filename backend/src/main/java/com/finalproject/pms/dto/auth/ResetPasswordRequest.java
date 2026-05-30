package com.finalproject.pms.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(

        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "New password is required")
        String newPassword

) {}