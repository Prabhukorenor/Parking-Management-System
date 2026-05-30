package com.finalproject.pms.service.impl;

import com.finalproject.pms.dto.admin.AdminAnalyticsResponse;
import com.finalproject.pms.dto.auth.UserResponse;
import com.finalproject.pms.dto.booking.BookingResponse;
import com.finalproject.pms.dto.parking.ParkingSummaryResponse;
import com.finalproject.pms.dto.review.ReviewResponse;
import com.finalproject.pms.exception.BadRequestException;
import com.finalproject.pms.exception.ResourceNotFoundException;
import com.finalproject.pms.mapper.EntityMapper;
import com.finalproject.pms.model.Booking;
import com.finalproject.pms.model.ParkingSpace;
import com.finalproject.pms.model.User;
import com.finalproject.pms.model.enums.BookingStatus;
import com.finalproject.pms.model.enums.Role;
import com.finalproject.pms.repository.BookingRepository;
import com.finalproject.pms.repository.ParkingSpaceRepository;
import com.finalproject.pms.repository.ReviewRepository;
import com.finalproject.pms.repository.UserRepository;
import com.finalproject.pms.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ParkingServiceImpl parkingService;

    public AdminServiceImpl(
            UserRepository userRepository,
            ParkingSpaceRepository parkingSpaceRepository,
            BookingRepository bookingRepository,
            ReviewRepository reviewRepository,
            ParkingServiceImpl parkingService
    ) {
        this.userRepository = userRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.parkingService = parkingService;
    }

    @Override
    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream().map(EntityMapper::toUserResponse).toList();
    }

    @Override
    @Transactional
    public AdminAnalyticsResponse getAnalytics() {
        bookingRepository.markExpiredBookingsAsCompleted(
                BookingStatus.BOOKED,
                BookingStatus.COMPLETED,
                LocalDateTime.now()
        );
        long totalUsers = userRepository.count();
        long totalOwners = userRepository.findAll().stream().filter(user -> user.getRole() == Role.OWNER).count();
        long totalCustomers = userRepository.findAll().stream().filter(user -> user.getRole() == Role.CUSTOMER).count();
        long totalParkingSpaces = parkingSpaceRepository.count();
        long approvedParkingSpaces = parkingSpaceRepository.findAll().stream().filter(ParkingSpace::isApproved).count();
        long pendingParkingSpaces = totalParkingSpaces - approvedParkingSpaces;
        return new AdminAnalyticsResponse(
                totalUsers,
                totalOwners,
                totalCustomers,
                totalParkingSpaces,
                approvedParkingSpaces,
                pendingParkingSpaces,
                bookingRepository.countActiveBookings(LocalDateTime.now()),
                bookingRepository.countByStatus(BookingStatus.CANCELLED),
                reviewRepository.count()
        );
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByStartDateDesc().stream()
                .map(booking -> EntityMapper.toBookingResponse(booking, null))
                .toList();
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(EntityMapper::toReviewResponse)
                .toList();
    }

    @Override
    public ParkingSummaryResponse approveParking(Long parkingId) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        parkingSpace.setApproved(true);
        parkingSpaceRepository.save(parkingSpace);
        return parkingService.search(null, null, null, null, null, null, null, null, null, null, null, Role.ADMIN)
                .stream()
                .filter(item -> item.id().equals(parkingId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Approved parking space could not be loaded."));
    }

    @Override
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
                
        List<Booking> userBookings = bookingRepository.findByUserId(id);
        boolean hasActive = userBookings.stream().anyMatch(b -> b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.ACTIVE);
        
        if (hasActive) {
            throw new BadRequestException("Cannot deactivate account. This account currently has active parking operations or related booking activity.");
        }
        
        if (user.getRole() == Role.OWNER) {
            List<Booking> ownerBookings = bookingRepository.findByParkingSpaceOwnerId(id);
            boolean hasActiveOwner = ownerBookings.stream().anyMatch(b -> b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.ACTIVE);
            if (hasActiveOwner) {
                throw new BadRequestException("Cannot deactivate account. This account currently has active parking operations or related booking activity.");
            }
        }
        
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        user.setActive(true);
        userRepository.save(user);
    }
}
