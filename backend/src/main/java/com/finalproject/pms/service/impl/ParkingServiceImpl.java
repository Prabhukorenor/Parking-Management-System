package com.finalproject.pms.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.finalproject.pms.dto.parking.ParkingCreateRequest;
import com.finalproject.pms.dto.parking.ParkingDetailResponse;
import com.finalproject.pms.dto.parking.ParkingSlotRequest;
import com.finalproject.pms.dto.parking.ParkingSlotResponse;
import com.finalproject.pms.dto.parking.ParkingSummaryResponse;
import com.finalproject.pms.dto.parking.ParkingUpdateRequest;
import com.finalproject.pms.exception.BadRequestException;
import com.finalproject.pms.exception.ForbiddenException;
import com.finalproject.pms.exception.ResourceNotFoundException;
import com.finalproject.pms.mapper.EntityMapper;
import com.finalproject.pms.model.Location;
import com.finalproject.pms.model.ParkingSlot;
import com.finalproject.pms.model.ParkingSpace;
import com.finalproject.pms.model.User;
import com.finalproject.pms.model.VehicleType;
import com.finalproject.pms.model.enums.AmenityType;
import com.finalproject.pms.model.enums.Role;
import com.finalproject.pms.repository.BookingRepository;
import com.finalproject.pms.repository.LocationRepository;
import com.finalproject.pms.repository.ParkingSlotRepository;
import com.finalproject.pms.repository.ParkingSpaceRepository;
import com.finalproject.pms.repository.ReviewRepository;
import com.finalproject.pms.repository.UserRepository;
import com.finalproject.pms.repository.VehicleTypeRepository;
import com.finalproject.pms.service.ParkingService;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

@Service
public class ParkingServiceImpl implements ParkingService {

    private final ParkingSpaceRepository parkingSpaceRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ParkingServiceImpl(
            ParkingSpaceRepository parkingSpaceRepository,
            ParkingSlotRepository parkingSlotRepository,
            LocationRepository locationRepository,
            UserRepository userRepository,
            VehicleTypeRepository vehicleTypeRepository,
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository) {
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public ParkingSummaryResponse create(ParkingCreateRequest request, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found."));
        Location location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found."));
        if (request.availableTo().equals(request.availableFrom())) {
            throw new BadRequestException("Available from and available to cannot be the same.");
        }

        ParkingSpace parkingSpace = new ParkingSpace();
        parkingSpace.setOwner(owner);
        parkingSpace.setLocation(location);
        parkingSpace.setTitle(request.title());
        parkingSpace.setDescription(request.description());
        parkingSpace.setPricePerDay(request.pricePerDay());
        parkingSpace.setPricePerHour(request.pricePerHour());
        parkingSpace
                .setImages(request.images() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(request.images()));
        parkingSpace.setAmenities(new LinkedHashSet<>(request.amenities()));
        parkingSpace.setVehicleTypes(resolveVehicleTypes(request.vehicleTypes()));
        parkingSpace.setAvailableFrom(request.availableFrom());
        parkingSpace.setAvailableTo(request.availableTo());
        parkingSpace.setApproved(owner.getRole() == Role.ADMIN);

        ParkingSpace saved = parkingSpaceRepository.save(parkingSpace);
        return toParkingSummary(saved);
    }

    @Override
    public ParkingSummaryResponse update(Long parkingId, ParkingUpdateRequest request, Long userId, Role role) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        ensureOwnerOrAdmin(parkingSpace, userId, role);

        Location location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found."));
        if (request.availableTo().equals(request.availableFrom())) {
            throw new BadRequestException("Available from and available to cannot be the same.");
        }

        parkingSpace.setLocation(location);
        parkingSpace.setTitle(request.title());
        parkingSpace.setDescription(request.description());
        parkingSpace.setPricePerDay(request.pricePerDay());
        parkingSpace.setPricePerHour(request.pricePerHour());
        parkingSpace
                .setImages(request.images() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(request.images()));
        parkingSpace.setAmenities(new LinkedHashSet<>(request.amenities()));
        parkingSpace.setVehicleTypes(resolveVehicleTypes(request.vehicleTypes()));
        parkingSpace.setAvailableFrom(request.availableFrom());
        parkingSpace.setAvailableTo(request.availableTo());

        ParkingSpace updated = parkingSpaceRepository.save(parkingSpace);
        return toParkingSummary(updated);
    }

    @Override
    public List<ParkingSummaryResponse> getOwnerParking(Long userId, Role role) {
        if (role == Role.ADMIN) {
            return parkingSpaceRepository.findAll().stream()
                    .map(this::toParkingSummary)
                    .sorted(Comparator.comparing(ParkingSummaryResponse::id))
                    .toList();
        }
        if (role != Role.OWNER) {
            throw new ForbiddenException("Only owners or admins can view owner parking.");
        }
        return parkingSpaceRepository.findByOwnerId(userId).stream()
                .map(this::toParkingSummary)
                .sorted(Comparator.comparing(ParkingSummaryResponse::id))
                .toList();
    }

    @Override
    public List<ParkingSummaryResponse> search(
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
            Role currentRole) {
        if (startDate != null && endDate != null && !endDate.isAfter(startDate)) {
            throw new BadRequestException("End date must be after start date.");
        }

        Specification<ParkingSpace> specification = Specification.where(approvedVisibility(currentUserId, currentRole))
                .and(likeLocation("city", city))
                .and(likeLocation("area", area))
                .and(likeLocation("pincode", pincode))
                .and(priceAtLeast(minPrice))
                .and(priceAtMost(maxPrice))
                .and(hasVehicleType(vehicleType))
                .and(hasAmenities(amenities));

        List<ParkingSummaryResponse> responses = parkingSpaceRepository.findAll(specification).stream()
                .map(this::toParkingSummary)
                .filter(parking -> minRating == null || parking.averageRating() >= minRating)
                .filter(parking -> isAvailableForRange(parking.id(), startDate, endDate))
                .sorted(Comparator.comparing(ParkingSummaryResponse::id))
                .toList();

        return responses;
    }

    @Override
    public ParkingDetailResponse getById(Long id, Long currentUserId, Role currentRole) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        ensureVisibility(parkingSpace, currentUserId, currentRole);
        LocalDateTime currentTime = LocalDateTime.now();
        List<ParkingSlotResponse> slots = parkingSlotRepository.findByParkingSpaceId(id).stream()
                .map(slot -> toCurrentSlotResponse(slot, currentTime))
                .toList();
        return new ParkingDetailResponse(
                toParkingSummary(parkingSpace),
                EntityMapper.toAmenityChargeResponses(parkingSpace.getAmenities()),
                slots);
    }

    @Override
    public List<ParkingSlotResponse> getSlots(Long parkingId, Long currentUserId, Role currentRole) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        ensureVisibility(parkingSpace, currentUserId, currentRole);
        return parkingSlotRepository.findByParkingSpaceId(parkingId).stream()
                .map(EntityMapper::toSlotResponse)
                .toList();
    }

    @Override
    public List<ParkingSlotResponse> getAvailableSlots(Long parkingId, LocalDateTime startDate, LocalDateTime endDate,
            Long currentUserId, Role currentRole) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        ensureVisibility(parkingSpace, currentUserId, currentRole);

        return parkingSlotRepository.findByParkingSpaceId(parkingId).stream()
                .filter(slot -> slot.isAvailable() &&
                        (startDate == null || endDate == null ||
                                !bookingRepository.existsActiveOverlapBySlotId(slot.getId(), startDate, endDate)))
                .map(EntityMapper::toSlotResponse)
                .toList();
    }

    @Override
    public ParkingSlotResponse addSlot(Long parkingId, ParkingSlotRequest request, Long currentUserId,
            Role currentRole) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        ensureOwnerOrAdmin(parkingSpace, currentUserId, currentRole);
        if (parkingSlotRepository.existsByParkingSpaceIdAndSlotNumberIgnoreCase(parkingId,
                request.slotNumber().trim())) {
            throw new BadRequestException("Slot number already exists for this parking space.");
        }

        ParkingSlot slot = new ParkingSlot();
        slot.setParkingSpace(parkingSpace);
        slot.setSlotNumber(request.slotNumber().trim());
        slot.setSlotType(request.slotType());
        slot.setAvailable(request.isAvailable() == null || request.isAvailable());
        return EntityMapper.toSlotResponse(parkingSlotRepository.save(slot));
    }

    private ParkingSummaryResponse toParkingSummary(ParkingSpace parkingSpace) {
        List<ParkingSlot> slots = parkingSlotRepository.findByParkingSpaceId(parkingSpace.getId());
        int totalSlots = slots.size();
        long inventoryAvailableSlots = slots.stream().filter(ParkingSlot::isAvailable).count();
        long occupiedSlots = bookingRepository.countCurrentlyOccupiedAvailableSlotsByParkingId(
                parkingSpace.getId(),
                LocalDateTime.now());
        long availableSlots = Math.max(0, inventoryAvailableSlots - occupiedSlots);
        double averageRating = reviewRepository.findAverageRatingByParkingId(parkingSpace.getId()).orElse(0.0);
        long totalReviews = reviewRepository.countByParkingSpaceId(parkingSpace.getId());
        return EntityMapper.toParkingSummaryResponse(parkingSpace, totalSlots, availableSlots, round(averageRating),
                totalReviews);
    }

    private ParkingSlotResponse toCurrentSlotResponse(ParkingSlot slot, LocalDateTime currentTime) {
        boolean currentlyAvailable = slot.isAvailable()
                && !bookingRepository.existsActiveOverlapBySlotId(
                        slot.getId(),
                        currentTime,
                        currentTime.plusSeconds(1));
        return new ParkingSlotResponse(slot.getId(), slot.getSlotNumber(), currentlyAvailable, slot.getSlotType());
    }

    private Set<VehicleType> resolveVehicleTypes(Set<String> vehicleTypeNames) {
        Set<VehicleType> vehicleTypes = new LinkedHashSet<>();
        for (String vehicleTypeName : vehicleTypeNames) {
            vehicleTypes.add(vehicleTypeRepository.findByName(vehicleTypeName.trim())
                    .orElseGet(() -> vehicleTypeRepository.save(createVehicleType(vehicleTypeName.trim()))));
        }
        return vehicleTypes;
    }

    private VehicleType createVehicleType(String name) {
        VehicleType vehicleType = new VehicleType();
        vehicleType.setName(name);
        return vehicleType;
    }

    private void ensureVisibility(ParkingSpace parkingSpace, Long currentUserId, Role currentRole) {
        if (parkingSpace.isApproved()) {
            return;
        }
        if (currentRole == Role.ADMIN) {
            return;
        }
        if (currentUserId != null && parkingSpace.getOwner().getId().equals(currentUserId)) {
            return;
        }
        throw new ForbiddenException("This parking space is pending approval.");
    }

    private void ensureOwnerOrAdmin(ParkingSpace parkingSpace, Long currentUserId, Role currentRole) {
        if (currentRole == Role.ADMIN) {
            return;
        }
        if (currentUserId != null && parkingSpace.getOwner().getId().equals(currentUserId)) {
            return;
        }
        throw new ForbiddenException("Only the parking owner or admin can manage slots.");
    }

    private boolean isAvailableForRange(Long parkingId, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            return true;
        }
        List<ParkingSlot> slots = parkingSlotRepository.findByParkingSpaceId(parkingId);
        for (ParkingSlot slot : slots) {
            if (slot.isAvailable()
                    && !bookingRepository.existsActiveOverlapBySlotId(slot.getId(), startDate, endDate)) {
                return true;
            }
        }
        return false;
    }

    private Specification<ParkingSpace> approvedVisibility(Long currentUserId, Role currentRole) {
        return (root, query, cb) -> {
            if (currentRole == Role.ADMIN) {
                return cb.conjunction();
            }
            if (currentUserId != null) {
                return cb.or(
                        cb.isTrue(root.get("approved")),
                        cb.equal(root.get("owner").get("id"), currentUserId));
            }
            return cb.isTrue(root.get("approved"));
        };
    }

    private Specification<ParkingSpace> likeLocation(String field, String value) {
        return (root, query, cb) -> {
            if (value == null || value.isBlank()) {
                return cb.conjunction();
            }
            Join<Object, Object> location = root.join("location", JoinType.INNER);
            return cb.like(cb.lower(location.get(field)), "%" + value.toLowerCase(Locale.ROOT) + "%");
        };
    }

    private Specification<ParkingSpace> priceAtLeast(BigDecimal minPrice) {
        return (root, query, cb) -> minPrice == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("pricePerHour"), minPrice);
    }

    private Specification<ParkingSpace> priceAtMost(BigDecimal maxPrice) {
        return (root, query, cb) -> maxPrice == null ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("pricePerHour"), maxPrice);
    }

    private Specification<ParkingSpace> hasVehicleType(String vehicleType) {
        return (root, query, cb) -> {
            if (vehicleType == null || vehicleType.isBlank()) {
                return cb.conjunction();
            }
            query.distinct(true);
            Join<Object, Object> join = root.join("vehicleTypes", JoinType.INNER);
            return cb.equal(cb.lower(join.get("name")), vehicleType.toLowerCase(Locale.ROOT));
        };
    }

    private Specification<ParkingSpace> hasAmenities(Set<AmenityType> amenities) {
        return (root, query, cb) -> {
            if (amenities == null || amenities.isEmpty()) {
                return cb.conjunction();
            }
            query.distinct(true);
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            for (AmenityType amenity : amenities) {
                Join<Object, Object> join = root.join("amenities", JoinType.INNER);
                predicates.add(cb.equal(join, amenity));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    @Override
    public void deleteParking(Long parkingId, Long currentUserId, Role currentRole) {
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        ensureOwnerOrAdmin(parkingSpace, currentUserId, currentRole);

        if (hasActiveBookings(parkingId)) {
            throw new BadRequestException(
                    "This parking space has vehicles already parked. You won't be able to delete until the parking slots get completed.");
        }

        parkingSpaceRepository.deleteById(parkingId);
    }

    @Override
    public boolean hasActiveBookings(Long parkingId) {
        return bookingRepository.hasActiveBookingsByParkingId(parkingId);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
