package com.finalproject.pms.repository;

import com.finalproject.pms.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByParkingSpaceIdOrderByCreatedAtDesc(Long parkingId);
    List<Review> findAllByOrderByCreatedAtDesc();
    boolean existsByUserIdAndParkingSpaceId(Long userId, Long parkingId);
    long countByParkingSpaceId(Long parkingId);

    @Query("select avg(r.rating) from Review r where r.parkingSpace.id = :parkingId")
    Optional<Double> findAverageRatingByParkingId(@Param("parkingId") Long parkingId);
}
