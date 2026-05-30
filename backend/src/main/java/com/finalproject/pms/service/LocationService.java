package com.finalproject.pms.service;

import com.finalproject.pms.dto.location.LocationRequest;
import com.finalproject.pms.dto.location.LocationResponse;

import java.util.List;

public interface LocationService {
    LocationResponse create(LocationRequest request);
    List<LocationResponse> getAll();
}
