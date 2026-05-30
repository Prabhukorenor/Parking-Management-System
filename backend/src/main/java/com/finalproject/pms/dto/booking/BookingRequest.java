package com.finalproject.pms.dto.booking;

import com.finalproject.pms.model.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record BookingRequest(
        @NotNull(message = "Parking id is required")
        Long parkingId,

        @NotNull(message = "Slot id is required")
        Long slotId,

        @NotNull(message = "Start date is required")
        LocalDateTime startDate,

        @NotNull(message = "End date is required")
        LocalDateTime endDate,

        PaymentStatus paymentStatus
) {
}
