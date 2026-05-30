package com.finalproject.pms.dto.admin;

public record AdminAnalyticsResponse(
        long totalUsers,
        long totalOwners,
        long totalCustomers,
        long totalParkingSpaces,
        long approvedParkingSpaces,
        long pendingParkingSpaces,
        long activeBookings,
        long cancelledBookings,
        long totalReviews
) {
}
