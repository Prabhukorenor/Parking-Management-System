package com.finalproject.pms.controller;

import com.finalproject.pms.dto.admin.AdminAnalyticsResponse;
import com.finalproject.pms.dto.auth.UserResponse;
import com.finalproject.pms.dto.booking.BookingResponse;
import com.finalproject.pms.dto.parking.ParkingSummaryResponse;
import com.finalproject.pms.dto.review.ReviewResponse;
import com.finalproject.pms.service.AdminService;
import com.finalproject.pms.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ReviewService reviewService;

    public AdminController(AdminService adminService, ReviewService reviewService) {
        this.adminService = adminService;
        this.reviewService = reviewService;
    }

    @GetMapping("/users")
    public List<UserResponse> getUsers() {
        return adminService.getUsers();
    }

    @GetMapping("/analytics")
    public AdminAnalyticsResponse getAnalytics() {
        return adminService.getAnalytics();
    }

    @GetMapping("/bookings")
    public List<BookingResponse> getBookings() {
        return adminService.getAllBookings();
    }

    @GetMapping("/reviews")
    public List<ReviewResponse> getReviews() {
        return adminService.getAllReviews();
    }

    @PutMapping("/parking/{id}/approve")
    public ParkingSummaryResponse approveParking(@PathVariable Long id) {
        return adminService.approveParking(id);
    }

    @DeleteMapping("/reviews/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long id) {
        reviewService.delete(id);
    }

    @PutMapping("/users/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateUser(@PathVariable Long id) {
        adminService.deactivateUser(id);
    }

    @PutMapping("/users/{id}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activateUser(@PathVariable Long id) {
        adminService.activateUser(id);
    }
}
