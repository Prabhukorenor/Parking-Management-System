package com.finalproject.pms.service;

import com.finalproject.pms.dto.admin.AdminAnalyticsResponse;
import com.finalproject.pms.dto.auth.UserResponse;
import com.finalproject.pms.dto.parking.ParkingSummaryResponse;

import com.finalproject.pms.dto.booking.BookingResponse;
import com.finalproject.pms.dto.review.ReviewResponse;

import java.util.List;

public interface AdminService {
    List<UserResponse> getUsers();
    AdminAnalyticsResponse getAnalytics();
    List<BookingResponse> getAllBookings();
    List<ReviewResponse> getAllReviews();
    ParkingSummaryResponse approveParking(Long parkingId);
    void deactivateUser(Long id);
    void activateUser(Long id);
}
