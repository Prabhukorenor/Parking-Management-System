package com.finalproject.pms.repository;

import com.finalproject.pms.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByParkingSpaceId(Long parkingId);
    Optional<ParkingSlot> findByIdAndParkingSpaceId(Long slotId, Long parkingId);
    boolean existsByParkingSpaceIdAndSlotNumberIgnoreCase(Long parkingId, String slotNumber);
}
