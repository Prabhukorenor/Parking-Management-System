package com.finalproject.pms.dto.parking;

import java.util.List;

public record ParkingDetailResponse(
        ParkingSummaryResponse parking,
        List<AmenityChargeResponse> amenityCharges,
        List<ParkingSlotResponse> slots
) {
}
