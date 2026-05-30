package com.finalproject.pms.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finalproject.pms.dto.review.ReviewRequest;
import com.finalproject.pms.dto.review.ReviewResponse;
import com.finalproject.pms.exception.BadRequestException;
import com.finalproject.pms.exception.ResourceNotFoundException;
import com.finalproject.pms.mapper.EntityMapper;
import com.finalproject.pms.model.Review;
import com.finalproject.pms.model.User;
import com.finalproject.pms.model.enums.BookingStatus;
import com.finalproject.pms.repository.BookingRepository;
import com.finalproject.pms.repository.ParkingSpaceRepository;
import com.finalproject.pms.repository.ReviewRepository;
import com.finalproject.pms.repository.UserRepository;
import com.finalproject.pms.service.ReviewService;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;
    private final BookingRepository bookingRepository;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            ParkingSpaceRepository parkingSpaceRepository,
            BookingRepository bookingRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest request, Long userId) {
        syncCompletedBookings();
        if (reviewRepository.existsByUserIdAndParkingSpaceId(userId, request.parkingId())) {
            throw new BadRequestException("You have already reviewed this parking space.");
        }
        if (!bookingRepository.existsPaidReviewEligibleBooking(userId, request.parkingId())) {
            throw new BadRequestException("Only users with a paid or partial refund booking can review this parking space.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Review review = new Review();
        review.setUser(user);
        review.setParkingSpace(parkingSpaceRepository.findById(request.parkingId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found.")));
        review.setRating(request.rating());
        review.setComment(request.comment());
        review.setCreatedAt(LocalDateTime.now());
        return EntityMapper.toReviewResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getParkingReviews(Long parkingId) {
        if (!parkingSpaceRepository.existsById(parkingId)) {
            throw new ResourceNotFoundException("Parking space not found.");
        }
        return reviewRepository.findByParkingSpaceIdOrderByCreatedAtDesc(parkingId).stream()
                .map(EntityMapper::toReviewResponse)
                .toList();
    }

    @Override
    public void delete(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found."));
        reviewRepository.delete(review);
    }

    private void syncCompletedBookings() {
        bookingRepository.markExpiredBookingsAsCompleted(
                BookingStatus.BOOKED,
                BookingStatus.COMPLETED,
                LocalDateTime.now()
        );
    }
}
