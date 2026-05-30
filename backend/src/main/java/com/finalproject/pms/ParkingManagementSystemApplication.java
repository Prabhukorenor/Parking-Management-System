package com.finalproject.pms;

import com.finalproject.pms.config.FileStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(FileStorageProperties.class)
public class ParkingManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParkingManagementSystemApplication.class, args);
    }
}
