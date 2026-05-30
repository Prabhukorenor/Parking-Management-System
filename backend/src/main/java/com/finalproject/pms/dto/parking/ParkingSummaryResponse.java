package com.finalproject.pms.dto.parking;

import com.finalproject.pms.dto.location.LocationResponse;
import com.finalproject.pms.model.enums.AmenityType;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Set;

public record ParkingSummaryResponse(
        Long id,
        String title,
        String description,
        BigDecimal pricePerDay,
        BigDecimal pricePerHour,
        Set<String> images,
        Set<AmenityType> amenities,
        Set<String> vehicleTypes,
        LocalTime availableFrom,
        LocalTime availableTo,
        boolean approved,
        LocationResponse location,
        int totalSlots,
        long availableSlots,
        double averageRating,
        long totalReviews,
        String ownerName
) {
}
