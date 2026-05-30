package com.finalproject.pms.service;

import com.finalproject.pms.dto.review.ReviewRequest;
import com.finalproject.pms.dto.review.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse create(ReviewRequest request, Long userId);
    List<ReviewResponse> getParkingReviews(Long parkingId);
    void delete(Long reviewId);
}
