package com.finalproject.pms.dto.parking;

import com.finalproject.pms.model.enums.SlotType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParkingSlotRequest(
        @NotBlank(message = "Slot number is required")
        String slotNumber,

        @NotNull(message = "Slot type is required")
        SlotType slotType,

        Boolean isAvailable
) {
}
