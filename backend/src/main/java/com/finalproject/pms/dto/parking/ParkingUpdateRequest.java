package com.finalproject.pms.dto.parking;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import com.finalproject.pms.model.enums.AmenityType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ParkingUpdateRequest(
        @NotNull(message = "Location id is required")
        Long locationId,

        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description can be at most 2000 characters")
        String description,

        @NotNull(message = "Price per day is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price per day must be greater than zero")
        BigDecimal pricePerDay,

        @NotNull(message = "Price per hour is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price per hour must be greater than zero")
        BigDecimal pricePerHour,

        Set<String> images,
        
        List<String> removedImages,

        @NotEmpty(message = "At least one amenity is required")
        Set<AmenityType> amenities,

        @NotEmpty(message = "At least one vehicle type is required")
        Set<String> vehicleTypes,

        @NotNull(message = "Available from time is required")
        LocalTime availableFrom,

        @NotNull(message = "Available to time is required")
        LocalTime availableTo
) {
}
