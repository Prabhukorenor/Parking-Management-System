CREATE DATABASE IF NOT EXISTS parking_management_system;

USE parking_management_system;

ALTER TABLE bookings
MODIFY COLUMN status ENUM('BOOKED', 'COMPLETED', 'CANCELLED') NOT NULL;
