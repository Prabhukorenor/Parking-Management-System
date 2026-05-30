package com.finalproject.pms.service;

import com.finalproject.pms.dto.user.UserProfileResponse;
import com.finalproject.pms.dto.user.UserProfileUpdateRequest;

public interface UserService {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request);
}
