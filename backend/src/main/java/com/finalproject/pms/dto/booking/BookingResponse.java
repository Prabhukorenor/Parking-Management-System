package com.finalproject.pms.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.finalproject.pms.dto.auth.UserResponse;
import com.finalproject.pms.model.enums.BookingStatus;

public record BookingResponse(
        Long id,
        Long parkingId,
        String parkingTitle,
        Long slotId,
        String slotNumber,
        BigDecimal pricePerHour,
        BigDecimal pricePerDay,
        LocalDateTime startDate,
        LocalDateTime endDate,
        BigDecimal basePrice,
        BigDecimal amenityCharges,
        BigDecimal totalPrice,
        LocalDateTime entryTime,
        LocalDateTime exitTime,
        boolean isVehicleEntered,
        BigDecimal refundAmount,
        BookingStatus status,
        PaymentResponse payment,
        UserResponse user
) {
}
