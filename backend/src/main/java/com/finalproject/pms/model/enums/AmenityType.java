package com.finalproject.pms.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.math.BigDecimal;
import java.util.Arrays;

public enum AmenityType {
    LOCK_AND_KEY("Lock and Key", new BigDecimal("5.00"), new BigDecimal("10.00")),
    SECURITY_GUARDS("Security guards", new BigDecimal("15.00"), new BigDecimal("20.00")),
    CCTV_SURVEILLANCE("CCTV surveillance", new BigDecimal("10.00"), new BigDecimal("30.00")),
    FIRE_EXTINGUISHER("Fire extinguisher", new BigDecimal("4.00"), new BigDecimal("15.00")),
    SMOKE_DETECTOR("Smoke detector", new BigDecimal("4.00"), new BigDecimal("10.00")),
    PRIVATE_ENTRANCE("Private entrance", new BigDecimal("9.00"), new BigDecimal("15.00")),
    PARKING_LIFT("Parking Lift", new BigDecimal("10.00"), new BigDecimal("10.00")),
    SUFFICIENT_LIGHTING("Sufficient lighting", new BigDecimal("5.00"), new BigDecimal("20.00")),
    HOUSEKEEPING("Housekeeping", new BigDecimal("7.00"), new BigDecimal("25.00")),
    EV_CHARGING_FACILITY("EV charging facility", new BigDecimal("20.00"), new BigDecimal("40.00"));

    private final String displayName;
    private final BigDecimal chargePerHour;
    private final BigDecimal chargePerDay;

    AmenityType(String displayName, BigDecimal chargePerHour, BigDecimal chargePerDay) {
        this.displayName = displayName;
        this.chargePerHour = chargePerHour;
        this.chargePerDay = chargePerDay;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public BigDecimal getChargePerHour() {
        return chargePerHour;
    }

    public BigDecimal getChargePerDay() {
        return chargePerDay;
    }

    @JsonCreator
    public static AmenityType fromValue(String value) {
        return Arrays.stream(values())
                .filter(item -> item.name().equalsIgnoreCase(value)
                        || item.displayName.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid amenity: " + value));
    }
}
