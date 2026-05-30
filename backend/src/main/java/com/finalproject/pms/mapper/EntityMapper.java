package com.finalproject.pms.mapper;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.finalproject.pms.dto.auth.UserResponse;
import com.finalproject.pms.dto.booking.BookingResponse;
import com.finalproject.pms.dto.booking.PaymentResponse;
import com.finalproject.pms.dto.location.LocationResponse;
import com.finalproject.pms.dto.parking.AmenityChargeResponse;
import com.finalproject.pms.dto.parking.ParkingSlotResponse;
import com.finalproject.pms.dto.parking.ParkingSummaryResponse;
import com.finalproject.pms.dto.review.ReviewResponse;
import com.finalproject.pms.model.Booking;
import com.finalproject.pms.model.Location;
import com.finalproject.pms.model.ParkingSlot;
import com.finalproject.pms.model.ParkingSpace;
import com.finalproject.pms.model.Payment;
import com.finalproject.pms.model.Review;
import com.finalproject.pms.model.User;
import com.finalproject.pms.model.VehicleType;
import com.finalproject.pms.model.enums.AmenityType;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive());
    }

    public static LocationResponse toLocationResponse(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getStreet(),
                location.getArea(),
                location.getCity(),
                location.getState(),
                location.getCountry(),
                location.getPincode()
        );
    }

    public static ParkingSlotResponse toSlotResponse(ParkingSlot slot) {
        return new ParkingSlotResponse(slot.getId(), slot.getSlotNumber(), slot.isAvailable(), slot.getSlotType());
    }

    public static List<AmenityChargeResponse> toAmenityChargeResponses(Set<AmenityType> amenities) {
        return amenities.stream()
                .sorted(Comparator.comparing(AmenityType::name))
                .map(amenity -> new AmenityChargeResponse(
                        amenity,
                        amenity.getChargePerHour(),
                        amenity.getChargePerDay()
                ))
                .toList();
    }

    public static ParkingSummaryResponse toParkingSummaryResponse(
            ParkingSpace parkingSpace,
            int totalSlots,
            long availableSlots,
            double averageRating,
            long totalReviews
    ) {
        return new ParkingSummaryResponse(
                parkingSpace.getId(),
                parkingSpace.getTitle(),
                parkingSpace.getDescription(),
                parkingSpace.getPricePerDay(),
                parkingSpace.getPricePerHour(),
                safeSet(parkingSpace.getImages()),
                namesOfAmenities(parkingSpace.getAmenities()),
                namesOfVehicleTypes(parkingSpace.getVehicleTypes()),
                parkingSpace.getAvailableFrom(),
                parkingSpace.getAvailableTo(),
                parkingSpace.isApproved(),
                toLocationResponse(parkingSpace.getLocation()),
                totalSlots,
                availableSlots,
                averageRating,
                totalReviews,
                parkingSpace.getOwner().getName()
        );
    }

    public static BookingResponse toBookingResponse(Booking booking, Payment payment) {
        PaymentResponse paymentResponse = payment == null
                ? null
                : new PaymentResponse(payment.getId(), payment.getAmount(), payment.getStatus());

        return new BookingResponse(
                booking.getId(),
                booking.getParkingSpace().getId(),
                booking.getParkingSpace().getTitle(),
                booking.getSlot().getId(),
                booking.getSlot().getSlotNumber(),
                booking.getParkingSpace().getPricePerHour(),
                booking.getParkingSpace().getPricePerDay(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getBasePrice(),
                booking.getAmenityCharges(),
                booking.getTotalPrice(),
                booking.getEntryTime(),
                booking.getExitTime(),
                booking.isVehicleEntered(),
                booking.getRefundAmount(),
                booking.getStatus(),
                paymentResponse,
                toUserResponse(booking.getUser())
        );
    }

    public static ReviewResponse toReviewResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getName(),
                review.getParkingSpace().getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }

    private static Set<AmenityType> namesOfAmenities(Set<AmenityType> amenities) {
        return amenities.stream().collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private static Set<String> namesOfVehicleTypes(Set<VehicleType> vehicleTypes) {
        return vehicleTypes.stream().map(VehicleType::getName).collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private static Set<String> safeSet(Set<String> values) {
        return values == null ? Collections.emptySet() : values;
    }
}
