package com.finalproject.pms.service.impl;

import com.finalproject.pms.dto.auth.AuthResponse;
import com.finalproject.pms.dto.auth.LoginRequest;
import com.finalproject.pms.dto.auth.RegisterRequest;
import com.finalproject.pms.dto.auth.ResetPasswordRequest;
import com.finalproject.pms.exception.BadRequestException;
import com.finalproject.pms.mapper.EntityMapper;
import com.finalproject.pms.model.User;
import com.finalproject.pms.model.enums.Role;
import com.finalproject.pms.repository.UserRepository;
import com.finalproject.pms.security.CustomUserDetails;
import com.finalproject.pms.security.JwtService;
import com.finalproject.pms.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (request.role() == Role.ADMIN) {
            throw new BadRequestException("Admin registration is not allowed through the public API.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered.");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        User savedUser = userRepository.save(user);
        CustomUserDetails userDetails = new CustomUserDetails(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getPassword(),
                savedUser.getRole(),
                savedUser.isActive()
        );
        String token = jwtService.generateToken(userDetails);
        return new AuthResponse(token, EntityMapper.toUserResponse(savedUser));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));
                
        if (!user.isActive()) {
            throw new BadRequestException("Your account has been deactivated by the administrator.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getEmail(), user.getPassword(), user.getRole(), user.isActive());
        String token = jwtService.generateToken(userDetails);
        return new AuthResponse(token, EntityMapper.toUserResponse(user));
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.newPassword())); // 🔥 IMPORTANT

        userRepository.save(user);
    }
}
