package com.finalproject.pms.dto.booking;

import java.math.BigDecimal;

public record RefundPreviewResponse(
        BigDecimal bookedAmount,
        String usedDuration,
        String rateApplied,
        BigDecimal usedCharges,
        BigDecimal refundAmount
) {
}
