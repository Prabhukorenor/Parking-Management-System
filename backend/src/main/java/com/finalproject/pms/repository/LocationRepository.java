package com.finalproject.pms.repository;

import com.finalproject.pms.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
