package com.finalproject.pms.dto.parking;

import com.finalproject.pms.model.enums.SlotType;

public record ParkingSlotResponse(
        Long id,
        String slotNumber,
        boolean available,
        SlotType slotType
) {
}
