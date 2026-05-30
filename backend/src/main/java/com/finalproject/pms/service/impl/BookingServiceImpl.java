package com.finalproject.pms.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.finalproject.pms.dto.booking.BookingRequest;
import com.finalproject.pms.dto.booking.BookingResponse;
import com.finalproject.pms.dto.booking.RefundPreviewResponse;
import com.finalproject.pms.exception.BadRequestException;
import com.finalproject.pms.exception.ForbiddenException;
import com.finalproject.pms.exception.ResourceNotFoundException;
import com.finalproject.pms.mapper.EntityMapper;
import com.finalproject.pms.model.Booking;
import com.finalproject.pms.model.ParkingSlot;
import com.finalproject.pms.model.ParkingSpace;
import com.finalproject.pms.model.Payment;
import com.finalproject.pms.model.User;
import com.finalproject.pms.model.enums.AmenityType;
import com.finalproject.pms.model.enums.BookingStatus;
import com.finalproject.pms.model.enums.PaymentStatus;
import com.finalproject.pms.model.enums.Role;
import com.finalproject.pms.repository.BookingRepository;
import com.finalproject.pms.repository.ParkingSlotRepository;
import com.finalproject.pms.repository.ParkingSpaceRepository;
import com.finalproject.pms.repository.PaymentRepository;
import com.finalproject.pms.repository.UserRepository;
import com.finalproject.pms.service.BookingService;

@Service
public class BookingServiceImpl implements BookingService {

    private static final long MINUTES_PER_HOUR = 60;
    private static final long HOURS_PER_DAY = 24;
    private static final long MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;

    private final BookingRepository bookingRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            ParkingSpaceRepository parkingSpaceRepository,
            ParkingSlotRepository parkingSlotRepository,
            PaymentRepository paymentRepository,
            UserRepository userRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BookingResponse create(BookingRequest request, Long userId) {
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BadRequestException("End date must be after start date.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(request.parkingId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        if (!parkingSpace.isApproved()) {
            throw new BadRequestException("Parking space is not approved yet.");
        }

        ParkingSlot slot = parkingSlotRepository.findByIdAndParkingSpaceId(request.slotId(), request.parkingId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found for the selected parking space."));
        if (!slot.isAvailable()) {
            throw new BadRequestException("Selected slot is currently unavailable.");
        }
        if (bookingRepository.existsActiveOverlapBySlotId(slot.getId(), request.startDate(), request.endDate())) {
            throw new BadRequestException("Selected slot is already booked for the requested time range.");
        }

        Duration duration = Duration.between(request.startDate(), request.endDate());
        BillingUnit billingUnit = resolveBillingUnit(duration);
        BigDecimal basePrice = calculateBasePrice(parkingSpace, billingUnit);
        BigDecimal amenityCharges = calculateAmenityCharges(parkingSpace.getAmenities(), billingUnit);
        BigDecimal totalPrice = basePrice.add(amenityCharges).setScale(2, RoundingMode.HALF_UP);
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setParkingSpace(parkingSpace);
        booking.setSlot(slot);
        booking.setStartDate(request.startDate());
        booking.setEndDate(request.endDate());
        booking.setBasePrice(basePrice);
        booking.setAmenityCharges(amenityCharges);
        booking.setTotalPrice(totalPrice);

        PaymentStatus paymentStatus = request.paymentStatus() == null ? PaymentStatus.PAID : request.paymentStatus();
        if (!request.endDate().isAfter(LocalDateTime.now())) {
            booking.setStatus(BookingStatus.COMPLETED);
        } else {
            booking.setStatus(BookingStatus.BOOKED);
        }

        Booking savedBooking = bookingRepository.save(booking);

        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(totalPrice);
        payment.setStatus(paymentStatus);
        Payment savedPayment = paymentRepository.save(payment);

        return EntityMapper.toBookingResponse(savedBooking, savedPayment);
    }

    @Override
    @Transactional
    public List<BookingResponse> getUserBookings(Long userId, Role role) {
        syncCompletedBookings();
        List<Booking> bookings = role == Role.ADMIN
                ? bookingRepository.findAll()
                : bookingRepository.findByUserId(userId);
        return bookings.stream()
                .map(booking -> EntityMapper.toBookingResponse(booking, paymentRepository.findByBookingId(booking.getId()).orElse(null)))
                .toList();
    }

    @Override
    @Transactional
    public List<BookingResponse> getOwnerBookings(Long userId, Role role) {
        syncCompletedBookings();
        if (role == Role.ADMIN) {
            return bookingRepository.findAll().stream()
                    .map(booking -> EntityMapper.toBookingResponse(booking, paymentRepository.findByBookingId(booking.getId()).orElse(null)))
                    .toList();
        }
        if (role != Role.OWNER) {
            throw new ForbiddenException("Only owners or admins can view owner bookings.");
        }
        // Return all bookings for the owner, not just completed/cancelled
        return bookingRepository.findByParkingSpaceOwnerId(userId).stream()
                .map(booking -> EntityMapper.toBookingResponse(booking, paymentRepository.findByBookingId(booking.getId()).orElse(null)))
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse startParking(Long bookingId, Long userId, Role role) {
        syncBookingLifecycle();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        if (role != Role.ADMIN && !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only start your own bookings.");
        }
        if (booking.getStatus() != BookingStatus.BOOKED || booking.isVehicleEntered()) {
            throw new BadRequestException("This booking cannot be started.");
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(booking.getStartDate())) {
            throw new BadRequestException("Parking can be started only after the booking start time.");
        }
        if (!now.isBefore(booking.getEndDate())) {
            throw new BadRequestException("This booking window has already ended.");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking."));
        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new BadRequestException("Only paid bookings can be started.");
        }

        booking.setVehicleEntered(true);
        booking.setEntryTime(now);
        booking.setStatus(BookingStatus.ACTIVE);
        Booking savedBooking = bookingRepository.save(booking);
        return EntityMapper.toBookingResponse(savedBooking, payment);
    }

    @Override
    @Transactional
    public BookingResponse cancel(Long bookingId, Long userId, Role role) {
        syncBookingLifecycle();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        if (role != Role.ADMIN && !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only cancel your own bookings.");
        }
        if (booking.getStatus() != BookingStatus.BOOKED || booking.isVehicleEntered()) {
            throw new BadRequestException("This booking has already started. Use exit parking for partial refund.");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking."));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setExitTime(LocalDateTime.now());
        if (payment.getStatus() == PaymentStatus.PAID) {
            booking.setRefundAmount(booking.getTotalPrice().setScale(2, RoundingMode.HALF_UP));
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        } else {
            booking.setRefundAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }
        Booking savedBooking = bookingRepository.save(booking);
        return EntityMapper.toBookingResponse(savedBooking, payment);
    }

    @Override
    @Transactional
    public BookingResponse exitParking(Long bookingId, Long userId, Role role) {
        syncBookingLifecycle();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        if (role != Role.ADMIN && !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only exit your own bookings.");
        }
        if (booking.getStatus() != BookingStatus.ACTIVE || !booking.isVehicleEntered()) {
            throw new BadRequestException("Parking exit is available only after vehicle entry.");
        }

        LocalDateTime exitTime = LocalDateTime.now();
        LocalDateTime effectiveExitTime = exitTime.isAfter(booking.getEndDate()) ? booking.getEndDate() : exitTime;
        LocalDateTime entryTime = booking.getEntryTime() == null ? booking.getStartDate() : booking.getEntryTime();
        Duration bookingDuration = Duration.between(booking.getStartDate(), booking.getEndDate());
        Duration usedDuration = Duration.between(entryTime, effectiveExitTime);
        BigDecimal usedCharges = calculateUsedCharges(booking.getParkingSpace(), bookingDuration, usedDuration);
        BigDecimal refundAmount = booking.getTotalPrice()
                .subtract(usedCharges)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        booking.setExitTime(exitTime);
        booking.setRefundAmount(refundAmount);
        booking.setStatus(BookingStatus.COMPLETED);
        Booking savedBooking = bookingRepository.save(booking);

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking."));
        if (payment.getStatus() == PaymentStatus.PAID) {
            if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                payment.setStatus(PaymentStatus.PARTIAL_REFUND);
            }
            paymentRepository.save(payment);
        }

        return EntityMapper.toBookingResponse(savedBooking, payment);
    }

    private BigDecimal calculateBasePrice(ParkingSpace parkingSpace, BillingUnit billingUnit) {
        BigDecimal rate = billingUnit.isDaily()
                ? parkingSpace.getPricePerDay()
                : parkingSpace.getPricePerHour();
        if (rate == null) {
            throw new BadRequestException("Parking rate is not configured.");
        }
        return rate.multiply(BigDecimal.valueOf(billingUnit.units())).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAmenityCharges(Set<AmenityType> amenities, BillingUnit billingUnit) {
        if (amenities == null || amenities.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return amenities.stream()
                .map(amenity -> billingUnit.isDaily()
                        ? amenity.getChargePerDay().multiply(BigDecimal.valueOf(billingUnit.units()))
                        : amenity.getChargePerHour().multiply(BigDecimal.valueOf(billingUnit.units())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateUsedCharges(ParkingSpace parkingSpace, Duration bookingDuration, Duration usedDuration) {
        // FIXED: Determine billing unit based on ACTUAL used duration, not booked duration
        // If actual usage >= 24 hours, use daily pricing; otherwise use hourly pricing
        BillingUnit usedBillingUnit = resolveBillingUnit(usedDuration);
        
        // Calculate base price for used duration
        BigDecimal basePriceForUsed = calculateBasePrice(parkingSpace, usedBillingUnit);
        
        // Calculate amenity charges for used duration (proportional to actual usage)
        BigDecimal amenityChargesForUsed = calculateAmenityCharges(parkingSpace.getAmenities(), usedBillingUnit);
        
        // Note: Service fee is NOT refunded on early exit (standard industry practice)
        // Total used charges = base price + amenities for used duration
        return basePriceForUsed.add(amenityChargesForUsed).setScale(2, RoundingMode.HALF_UP);
    }

    private BillingUnit resolveBillingUnit(Duration duration) {
        long minutes = duration == null ? 0 : duration.toMinutes();
        if (minutes <= 0) {
            throw new BadRequestException("Booking duration must be greater than zero.");
        }
        boolean daily = minutes >= MINUTES_PER_DAY;
        return resolveBillingUnit(duration, daily);
    }

    private BillingUnit resolveBillingUnit(Duration duration, boolean daily) {
        long minutes = duration == null ? 0 : duration.toMinutes();
        long divisor = daily ? MINUTES_PER_DAY : MINUTES_PER_HOUR;
        long units = Math.max(1, divideAndRoundUp(minutes, divisor));
        return new BillingUnit(daily, units);
    }

    private long divideAndRoundUp(long value, long divisor) {
        return (long) Math.ceil(Math.max(value, 0) / (double) divisor);
    }

    private void syncCompletedBookings() {
        syncBookingLifecycle();
    }

    private void syncBookingLifecycle() {
        LocalDateTime now = LocalDateTime.now();
        bookingRepository.markExpiredBookingsAsCompleted(
                BookingStatus.ACTIVE,
                BookingStatus.COMPLETED,
                now
        );
        bookingRepository.markExpiredBookingsAsCompleted(
                BookingStatus.BOOKED,
                BookingStatus.COMPLETED,
                now
        );
    }

    @Override
    @Transactional
    public BookingResponse createFromRazorpayPayment(Long parkingId, Long slotId, LocalDateTime startDate, LocalDateTime endDate, Long userId) {
        if (!endDate.isAfter(startDate)) {
            throw new BadRequestException("End date must be after start date.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        ParkingSpace parkingSpace = parkingSpaceRepository.findById(parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found."));
        if (!parkingSpace.isApproved()) {
            throw new BadRequestException("Parking space is not approved yet.");
        }

        ParkingSlot slot = parkingSlotRepository.findByIdAndParkingSpaceId(slotId, parkingId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found for the selected parking space."));
        if (!slot.isAvailable()) {
            throw new BadRequestException("Selected slot is currently unavailable.");
        }
        if (bookingRepository.existsActiveOverlapBySlotId(slot.getId(), startDate, endDate)) {
            throw new BadRequestException("Selected slot is already booked for the requested time range.");
        }

        Duration duration = Duration.between(startDate, endDate);
        BillingUnit billingUnit = resolveBillingUnit(duration);
        BigDecimal basePrice = calculateBasePrice(parkingSpace, billingUnit);
        BigDecimal amenityCharges = calculateAmenityCharges(parkingSpace.getAmenities(), billingUnit);
        BigDecimal totalPrice = basePrice.add(amenityCharges).setScale(2, RoundingMode.HALF_UP);
        
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setParkingSpace(parkingSpace);
        booking.setSlot(slot);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setBasePrice(basePrice);
        booking.setAmenityCharges(amenityCharges);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.BOOKED);

        Booking savedBooking = bookingRepository.save(booking);

        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(totalPrice);
        payment.setStatus(PaymentStatus.PAID);
        Payment savedPayment = paymentRepository.save(payment);

        return EntityMapper.toBookingResponse(savedBooking, savedPayment);
    }

    @Override
    public RefundPreviewResponse getExitRefundPreview(Long bookingId, Long userId, Role role) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        if (role != Role.ADMIN && !booking.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You can only view refund preview for your own bookings.");
        }
        if (booking.getStatus() != BookingStatus.ACTIVE || !booking.isVehicleEntered()) {
            throw new BadRequestException("Refund preview is only available for active bookings with vehicle entry.");
        }

        LocalDateTime exitTime = LocalDateTime.now();
        LocalDateTime effectiveExitTime = exitTime.isAfter(booking.getEndDate()) ? booking.getEndDate() : exitTime;
        LocalDateTime entryTime = booking.getEntryTime() == null ? booking.getStartDate() : booking.getEntryTime();
        Duration bookingDuration = Duration.between(booking.getStartDate(), booking.getEndDate());
        Duration usedDuration = Duration.between(entryTime, effectiveExitTime);
        BigDecimal usedCharges = calculateUsedCharges(booking.getParkingSpace(), bookingDuration, usedDuration);
        BigDecimal refundAmount = booking.getTotalPrice()
                .subtract(usedCharges)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        // FIXED: Determine billing unit based on ACTUAL used duration, not booked duration
        BillingUnit usedBillingUnit = resolveBillingUnit(usedDuration);
        BigDecimal rate = usedBillingUnit.isDaily()
                ? booking.getParkingSpace().getPricePerDay()
                : booking.getParkingSpace().getPricePerHour();

        // Calculate used duration in a human-readable format
        long minutes = usedDuration.toMinutes();
        String usedDurationStr = formatDuration(minutes, usedBillingUnit.isDaily());

        String rateApplied = rate == null ? "N/A" : String.format("%s/%s", rate, usedBillingUnit.isDaily() ? "day" : "hour");

        return new RefundPreviewResponse(
                booking.getTotalPrice(),
                usedDurationStr,
                rateApplied,
                usedCharges.setScale(2, RoundingMode.HALF_UP),
                refundAmount
        );
    }

    private String formatDuration(long minutes, boolean daily) {
        if (daily) {
            long days = Math.max(1, divideAndRoundUp(minutes, MINUTES_PER_DAY));
            return days + " day" + (days == 1 ? "" : "s");
        } else {
            long hours = Math.max(1, divideAndRoundUp(minutes, MINUTES_PER_HOUR));
            return hours + " hour" + (hours == 1 ? "" : "s");
        }
    }

    private record BillingUnit(boolean isDaily, long units) {
    }
}
