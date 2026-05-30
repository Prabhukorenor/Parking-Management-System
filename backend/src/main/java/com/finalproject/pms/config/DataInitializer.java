package com.finalproject.pms.config;

import com.finalproject.pms.model.User;
import com.finalproject.pms.model.VehicleType;
import com.finalproject.pms.model.enums.Role;
import com.finalproject.pms.repository.UserRepository;
import com.finalproject.pms.repository.VehicleTypeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner bootstrapData(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            VehicleTypeRepository vehicleTypeRepository,
            @Value("${app.bootstrap.admin-email}") String adminEmail,
            @Value("${app.bootstrap.admin-password}") String adminPassword,
            @Value("${app.bootstrap.admin-name}") String adminName
    ) {
        return args -> {
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setName(adminName);
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
            seedVehicleTypes(vehicleTypeRepository, List.of("CAR", "BIKE", "SUV", "EV", "TRUCK"));
        };
    }

    private void seedVehicleTypes(VehicleTypeRepository vehicleTypeRepository, List<String> names) {
        for (String name : names) {
            vehicleTypeRepository.findByName(name).orElseGet(() -> {
                VehicleType vehicleType = new VehicleType();
                vehicleType.setName(name);
                return vehicleTypeRepository.save(vehicleType);
            });
        }
    }
}
