package com.finalproject.pms.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finalproject.pms.dto.user.UserProfileResponse;
import com.finalproject.pms.dto.user.UserProfileUpdateRequest;
import com.finalproject.pms.exception.ResourceNotFoundException;
import com.finalproject.pms.model.User;
import com.finalproject.pms.repository.UserRepository;
import com.finalproject.pms.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }

        if (request.email() != null && !request.email().isBlank()) {
            // Check if email is already in use by another user
            if (!user.getEmail().equals(request.email()) && 
                userRepository.findByEmail(request.email()).isPresent()) {
                throw new IllegalArgumentException("Email is already in use.");
            }
            user.setEmail(request.email());
        }

        if (request.gender() != null) {
            user.setGender(request.gender());
        }

        if (request.profileImage() != null) {
            user.setProfileImage(request.profileImage());
        }

        if (request.phoneNumber() != null && !request.phoneNumber().isBlank()) {
            user.setPhoneNumber(request.phoneNumber());
        }

        if (request.address() != null && !request.address().isBlank()) {
            user.setAddress(request.address());
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    private UserProfileResponse mapToResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getGender(),
                user.getProfileImage(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getRole().toString()
        );
    }
}
