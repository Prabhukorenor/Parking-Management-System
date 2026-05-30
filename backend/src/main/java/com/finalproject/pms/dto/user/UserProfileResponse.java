package com.finalproject.pms.dto.user;

public record UserProfileResponse(
    Long id,
    String name,
    String email,
    String gender,
    String profileImage,
    String phoneNumber,
    String address,
    String role
) {}
