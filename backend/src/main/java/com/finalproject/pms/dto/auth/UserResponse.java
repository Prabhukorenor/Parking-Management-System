package com.finalproject.pms.dto.auth;

import com.finalproject.pms.model.enums.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean active
) {
}
