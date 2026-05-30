package com.finalproject.pms.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.finalproject.pms.dto.user.UserProfileResponse;
import com.finalproject.pms.dto.user.UserProfileUpdateRequest;
import com.finalproject.pms.security.CustomUserDetails;
import com.finalproject.pms.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public UserProfileResponse getProfile(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return userService.getProfile(currentUser.getId());
    }

    @PutMapping("/profile")
    @ResponseStatus(HttpStatus.OK)
    public UserProfileResponse updateProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        return userService.updateProfile(currentUser.getId(), request);
    }
}
