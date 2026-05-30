package com.finalproject.pms.dto.location;

public record LocationResponse(
        Long id,
        String street,
        String area,
        String city,
        String state,
        String country,
        String pincode
) {
}
