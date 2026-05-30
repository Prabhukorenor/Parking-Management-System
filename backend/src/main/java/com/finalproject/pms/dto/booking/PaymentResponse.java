package com.finalproject.pms.dto.booking;

import com.finalproject.pms.model.enums.PaymentStatus;

import java.math.BigDecimal;

public record PaymentResponse(
        Long id,
        BigDecimal amount,
        PaymentStatus status
) {
}
