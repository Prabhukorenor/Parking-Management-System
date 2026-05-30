package com.finalproject.pms.service.impl;

import com.finalproject.pms.dto.location.LocationRequest;
import com.finalproject.pms.dto.location.LocationResponse;
import com.finalproject.pms.mapper.EntityMapper;
import com.finalproject.pms.model.Location;
import com.finalproject.pms.repository.LocationRepository;
import com.finalproject.pms.service.LocationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;

    public LocationServiceImpl(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Override
    public LocationResponse create(LocationRequest request) {
        Location location = new Location();
        location.setStreet(request.street());
        location.setArea(request.area());
        location.setCity(request.city());
        location.setState(request.state());
        location.setCountry(request.country());
        location.setPincode(request.pincode());
        return EntityMapper.toLocationResponse(locationRepository.save(location));
    }

    @Override
    public List<LocationResponse> getAll() {
        return locationRepository.findAll().stream().map(EntityMapper::toLocationResponse).toList();
    }
}
