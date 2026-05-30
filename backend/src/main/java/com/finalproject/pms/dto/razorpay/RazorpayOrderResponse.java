package com.finalproject.pms.dto.razorpay;

public record RazorpayOrderResponse(
        String orderId,
        String key,
        Double amount,
        String currency
) {}
