package com.finalproject.pms.dto.razorpay;

public record RazorpayPaymentVerificationRequest(
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature,
        Long parkingId,
        Long slotId,
        String startDate,
        String startHour,
        String endDate,
        String endHour
) {}
