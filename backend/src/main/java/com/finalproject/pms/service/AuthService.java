package com.finalproject.pms.service;

import com.finalproject.pms.dto.auth.AuthResponse;
import com.finalproject.pms.dto.auth.LoginRequest;
import com.finalproject.pms.dto.auth.RegisterRequest;
import com.finalproject.pms.dto.auth.ResetPasswordRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);

    void resetPassword(ResetPasswordRequest request);
}
