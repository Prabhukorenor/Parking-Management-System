package com.finalproject.pms.service;

import java.time.LocalDateTime;
import java.util.List;

import com.finalproject.pms.dto.booking.BookingRequest;
import com.finalproject.pms.dto.booking.BookingResponse;
import com.finalproject.pms.dto.booking.RefundPreviewResponse;
import com.finalproject.pms.model.enums.Role;

public interface BookingService {
    BookingResponse create(BookingRequest request, Long userId);
    List<BookingResponse> getUserBookings(Long userId, Role role);
    List<BookingResponse> getOwnerBookings(Long userId, Role role);
    BookingResponse startParking(Long bookingId, Long userId, Role role);
    BookingResponse cancel(Long bookingId, Long userId, Role role);
    BookingResponse exitParking(Long bookingId, Long userId, Role role);
    BookingResponse createFromRazorpayPayment(Long parkingId, Long slotId, LocalDateTime startDate, LocalDateTime endDate, Long userId);
    RefundPreviewResponse getExitRefundPreview(Long bookingId, Long userId, Role role);
}
