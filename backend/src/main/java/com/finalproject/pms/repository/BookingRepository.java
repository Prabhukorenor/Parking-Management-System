package com.finalproject.pms.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.finalproject.pms.model.Booking;
import com.finalproject.pms.model.ParkingSlot;
import com.finalproject.pms.model.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            select distinct b from Booking b
            join fetch b.user
            where b.user.id = :userId
            """)
    List<Booking> findByUserId(@Param("userId") Long userId);

    @Query("""
            select distinct b from Booking b
            join fetch b.user
            where b.parkingSpace.owner.id = :ownerId
            """)
    List<Booking> findByParkingSpaceOwnerId(@Param("ownerId") Long ownerId);

    @Query("""
            select distinct b from Booking b
            join fetch b.user
            where b.parkingSpace.owner.id = :ownerId
              and b.status in (
                  com.finalproject.pms.model.enums.BookingStatus.COMPLETED,
                  com.finalproject.pms.model.enums.BookingStatus.CANCELLED
              )
            order by b.endDate desc
            """)
    List<Booking> findCompletedAndCancelledBookingsByOwnerId(@Param("ownerId") Long ownerId);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    boolean existsBySlotAndStatusAndStartDateLessThanAndEndDateGreaterThan(
            ParkingSlot slot,
            BookingStatus status,
            LocalDateTime endDate,
            LocalDateTime startDate
    );

    boolean existsByUserIdAndParkingSpaceIdAndStatus(Long userId, Long parkingId, BookingStatus status);

    boolean existsByUserIdAndParkingSpaceIdAndStatusAndEndDateBefore(
            Long userId,
            Long parkingId,
            BookingStatus status,
            LocalDateTime endDate
    );

    long countByStatus(BookingStatus status);

    @Query("""
            select count(b) from Booking b
            where b.status = com.finalproject.pms.model.enums.BookingStatus.ACTIVE
               or (b.status not in (com.finalproject.pms.model.enums.BookingStatus.CANCELLED, com.finalproject.pms.model.enums.BookingStatus.COMPLETED)
                   and b.startDate <= :currentTime and b.endDate >= :currentTime)
            """)
    long countActiveBookings(@Param("currentTime") LocalDateTime currentTime);

    List<Booking> findAllByOrderByStartDateDesc();

    @Query("""
            select count(b) > 0 from Booking b
            join Payment p on p.booking = b
            where b.user.id = :userId
              and b.parkingSpace.id = :parkingId
              and b.status <> com.finalproject.pms.model.enums.BookingStatus.CANCELLED
              and (p.status = com.finalproject.pms.model.enums.PaymentStatus.PAID
                or p.status = com.finalproject.pms.model.enums.PaymentStatus.PARTIAL_REFUND)
            """)
    boolean existsPaidReviewEligibleBooking(
            @Param("userId") Long userId,
            @Param("parkingId") Long parkingId
    );

    @Modifying
    @Query("""
            update Booking b
            set b.status = :completedStatus,
                b.exitTime = coalesce(b.exitTime, b.endDate)
            where b.status = :currentStatus
              and b.endDate <= :currentTime
            """)
    int markExpiredBookingsAsCompleted(
            @Param("currentStatus") BookingStatus currentStatus,
            @Param("completedStatus") BookingStatus completedStatus,
            @Param("currentTime") LocalDateTime currentTime
    );

    @Query("""
            select count(b) > 0 from Booking b
            where b.slot.id = :slotId
              and b.status in (
                  com.finalproject.pms.model.enums.BookingStatus.BOOKED,
                  com.finalproject.pms.model.enums.BookingStatus.ACTIVE
              )
              and b.startDate < :endDate
              and b.endDate > :startDate
            """)
    boolean existsActiveOverlapBySlotId(
            @Param("slotId") Long slotId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
            select count(distinct b.slot.id) from Booking b
            where b.parkingSpace.id = :parkingId
              and b.slot.available = true
              and b.status in (
                  com.finalproject.pms.model.enums.BookingStatus.BOOKED,
                  com.finalproject.pms.model.enums.BookingStatus.ACTIVE
              )
              and b.startDate <= :currentTime
              and b.endDate > :currentTime
            """)
    long countCurrentlyOccupiedAvailableSlotsByParkingId(
            @Param("parkingId") Long parkingId,
            @Param("currentTime") LocalDateTime currentTime
    );

    @Query("""
            select exists(select 1 from Booking b
                         where b.parkingSpace.id = :parkingId
                         and b.status = com.finalproject.pms.model.enums.BookingStatus.ACTIVE)
            """)
    boolean hasActiveBookingsByParkingId(@Param("parkingId") Long parkingId);
}
