package com.finalproject.pms.repository;

import com.finalproject.pms.model.ParkingSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ParkingSpaceRepository extends JpaRepository<ParkingSpace, Long>, JpaSpecificationExecutor<ParkingSpace> {
    List<ParkingSpace> findByApprovedTrue();
    List<ParkingSpace> findByOwnerId(Long ownerId);
}
