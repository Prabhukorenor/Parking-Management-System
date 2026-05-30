package com.finalproject.pms.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.finalproject.pms.dto.booking.BookingRequest;
import com.finalproject.pms.dto.booking.BookingResponse;
import com.finalproject.pms.dto.booking.RefundPreviewResponse;
import com.finalproject.pms.dto.razorpay.RazorpayOrderRequest;
import com.finalproject.pms.dto.razorpay.RazorpayOrderResponse;
import com.finalproject.pms.dto.razorpay.RazorpayPaymentVerificationRequest;
import com.finalproject.pms.security.CustomUserDetails;
import com.finalproject.pms.service.BookingService;
import com.finalproject.pms.service.RazorpayService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final RazorpayService razorpayService;

    public BookingController(BookingService bookingService, RazorpayService razorpayService) {
        this.bookingService = bookingService;
        this.razorpayService = razorpayService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return bookingService.create(request, currentUser.getId());
    }

    @GetMapping("/user")
    public List<BookingResponse> getUserBookings(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return bookingService.getUserBookings(currentUser.getId(), currentUser.getRole());
    }

    @GetMapping("/owner")
    public List<BookingResponse> getOwnerBookings(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return bookingService.getOwnerBookings(currentUser.getId(), currentUser.getRole());
    }

    @DeleteMapping("/{id}")
    public BookingResponse cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return bookingService.cancel(id, currentUser.getId(), currentUser.getRole());
    }

    @PostMapping("/{id}/start")
    public BookingResponse startParking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return bookingService.startParking(id, currentUser.getId(), currentUser.getRole());
    }

    @GetMapping("/{id}/exit-preview")
    public RefundPreviewResponse getExitRefundPreview(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return bookingService.getExitRefundPreview(id, currentUser.getId(), currentUser.getRole());
    }

    @PostMapping("/{id}/exit")
    public BookingResponse exitParking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return bookingService.exitParking(id, currentUser.getId(), currentUser.getRole());
    }

    @PostMapping("/razorpay/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public RazorpayOrderResponse createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return razorpayService.createOrder(request);
    }

    @PostMapping("/razorpay/verify")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse verifyRazorpayPayment(
            @Valid @RequestBody RazorpayPaymentVerificationRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        // Verify the payment signature
        if (!razorpayService.verifyPayment(request)) {
            throw new RuntimeException("Payment verification failed. Invalid signature.");
        }

        // Parse dates - format: "2026-05-06" and hour: "10"
        LocalDateTime startDateTime = LocalDateTime.of(
                LocalDate.parse(request.startDate()),
                LocalTime.of(Integer.parseInt(request.startHour()), 0, 0)
        );
        LocalDateTime endDateTime = LocalDateTime.of(
                LocalDate.parse(request.endDate()),
                LocalTime.of(Integer.parseInt(request.endHour()), 0, 0)
        );

        // Create booking from verified payment
        return bookingService.createFromRazorpayPayment(
                request.parkingId(),
                request.slotId(),
                startDateTime,
                endDateTime,
                currentUser.getId()
        );
    }
}
