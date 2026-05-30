package com.finalproject.pms.dto.parking;

import com.finalproject.pms.model.enums.AmenityType;

import java.math.BigDecimal;

public record AmenityChargeResponse(
        AmenityType amenity,
        BigDecimal chargePerHour,
        BigDecimal chargePerDay
) {
}
