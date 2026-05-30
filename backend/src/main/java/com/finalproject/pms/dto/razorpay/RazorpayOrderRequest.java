package com.finalproject.pms.dto.razorpay;

import java.math.BigDecimal;

public record RazorpayOrderRequest(
        BigDecimal amount,
        Long parkingId,
        Long slotId,
        String startDate,
        String startHour,
        String endDate,
        String endHour
) {}
