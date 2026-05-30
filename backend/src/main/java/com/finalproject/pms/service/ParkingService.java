package com.finalproject.pms.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.finalproject.pms.dto.parking.ParkingCreateRequest;
import com.finalproject.pms.dto.parking.ParkingDetailResponse;
import com.finalproject.pms.dto.parking.ParkingSlotRequest;
import com.finalproject.pms.dto.parking.ParkingSlotResponse;
import com.finalproject.pms.dto.parking.ParkingSummaryResponse;
import com.finalproject.pms.dto.parking.ParkingUpdateRequest;
import com.finalproject.pms.model.enums.AmenityType;
import com.finalproject.pms.model.enums.Role;

public interface ParkingService {
    ParkingSummaryResponse create(ParkingCreateRequest request, Long userId);

    ParkingSummaryResponse update(Long parkingId, ParkingUpdateRequest request, Long userId, Role role);

    List<ParkingSummaryResponse> getOwnerParking(Long userId, Role role);

    List<ParkingSummaryResponse> search(
            String city,
            String area,
            String pincode,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String vehicleType,
            Set<AmenityType> amenities,
            Double minRating,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long currentUserId,
            Role currentRole);

    ParkingDetailResponse getById(Long id, Long currentUserId, Role currentRole);

    List<ParkingSlotResponse> getSlots(Long parkingId, Long currentUserId, Role currentRole);

    List<ParkingSlotResponse> getAvailableSlots(Long parkingId, LocalDateTime startDate, LocalDateTime endDate,
            Long currentUserId, Role currentRole);

    ParkingSlotResponse addSlot(Long parkingId, ParkingSlotRequest request, Long currentUserId, Role currentRole);

    void deleteParking(Long parkingId, Long currentUserId, Role currentRole);

    boolean hasActiveBookings(Long parkingId);
}
