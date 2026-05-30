package com.finalproject.pms.dto.location;

import jakarta.validation.constraints.NotBlank;

public record LocationRequest(
        @NotBlank(message = "Street is required")
        String street,

        @NotBlank(message = "Area is required")
        String area,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "State is required")
        String state,

        @NotBlank(message = "Country is required")
        String country,

        @NotBlank(message = "Pincode is required")
        String pincode
) {
}
