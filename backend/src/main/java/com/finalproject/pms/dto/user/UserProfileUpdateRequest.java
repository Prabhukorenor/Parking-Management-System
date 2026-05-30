package com.finalproject.pms.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,
    
    @Email(message = "Email should be valid")
    String email,
    
    @Size(max = 50, message = "Gender must be less than 50 characters")
    String gender,
    
    String profileImage,
    
    @Size(max = 20, message = "Phone number must be less than 20 characters")
    String phoneNumber,
    
    @Size(max = 255, message = "Address must be less than 255 characters")
    String address
) {}
