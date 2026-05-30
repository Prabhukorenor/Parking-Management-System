package com.finalproject.pms.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.finalproject.pms.dto.parking.ParkingCreateRequest;
import com.finalproject.pms.dto.parking.ParkingDetailResponse;
import com.finalproject.pms.dto.parking.ParkingSlotRequest;
import com.finalproject.pms.dto.parking.ParkingSlotResponse;
import com.finalproject.pms.dto.parking.ParkingSummaryResponse;
import com.finalproject.pms.dto.parking.ParkingUpdateRequest;
import com.finalproject.pms.model.enums.AmenityType;
import com.finalproject.pms.model.enums.Role;
import com.finalproject.pms.security.CustomUserDetails;
import com.finalproject.pms.service.ParkingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ParkingSummaryResponse create(
            @Valid @RequestBody ParkingCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return parkingService.create(request, currentUser.getId());
    }

    @PutMapping("/{id}")
    public ParkingSummaryResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ParkingUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return parkingService.update(id, request, currentUser.getId(), currentUser.getRole());
    }

    @GetMapping("/owner")
    public List<ParkingSummaryResponse> getOwnerParking(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return parkingService.getOwnerParking(currentUser.getId(), currentUser.getRole());
    }

    @GetMapping
    public List<ParkingSummaryResponse> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) Set<AmenityType> amenities,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser == null ? null : currentUser.getId();
        Role role = currentUser == null ? null : currentUser.getRole();
        return parkingService.search(city, area, pincode, minPrice, maxPrice, vehicleType, amenities, rating, startDate, endDate, userId, role);
    }

    @GetMapping("/{id}")
    public ParkingDetailResponse getById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser == null ? null : currentUser.getId();
        Role role = currentUser == null ? null : currentUser.getRole();
        return parkingService.getById(id, userId, role);
    }

    @GetMapping("/{id}/slots")
    public List<ParkingSlotResponse> getSlots(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser == null ? null : currentUser.getId();
        Role role = currentUser == null ? null : currentUser.getRole();
        return parkingService.getSlots(id, userId, role);
    }

    @GetMapping("/{id}/available-slots")
    public List<ParkingSlotResponse> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        Long userId = currentUser == null ? null : currentUser.getId();
        Role role = currentUser == null ? null : currentUser.getRole();
        return parkingService.getAvailableSlots(id, startDate, endDate, userId, role);
    }

    @PostMapping("/{id}/slots")
    @ResponseStatus(HttpStatus.CREATED)
    public ParkingSlotResponse addSlot(
            @PathVariable Long id,
            @Valid @RequestBody ParkingSlotRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return parkingService.addSlot(id, request, currentUser.getId(), currentUser.getRole());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteParking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        parkingService.deleteParking(id, currentUser.getId(), currentUser.getRole());
    }

    @GetMapping("/{id}/has-active-bookings")
    public boolean hasActiveBookings(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return parkingService.hasActiveBookings(id);
    }
}
