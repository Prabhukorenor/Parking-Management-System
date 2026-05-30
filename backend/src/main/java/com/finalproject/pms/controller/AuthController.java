package com.finalproject.pms.controller;

import com.finalproject.pms.dto.auth.AuthResponse;
import com.finalproject.pms.dto.auth.LoginRequest;
import com.finalproject.pms.dto.auth.RegisterRequest;
import com.finalproject.pms.dto.auth.ResetPasswordRequest;
import com.finalproject.pms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // ✅ NEW
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return "Password updated successfully";
    }
}
