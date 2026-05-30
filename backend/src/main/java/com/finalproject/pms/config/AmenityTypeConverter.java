package com.finalproject.pms.config;

import org.springframework.core.convert.converter.Converter;

import com.finalproject.pms.model.enums.AmenityType;

public class AmenityTypeConverter implements Converter<String, AmenityType> {
    @Override
    public AmenityType convert(String source) {
        return AmenityType.fromValue(source);
    }
}
