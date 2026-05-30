package com.finalproject.pms.dto.review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long userId,
        String userName,
        Long parkingId,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}
