-- Database schema initialization
-- Hibernate will automatically create/update columns based on @Entity definitions

ALTER TABLE bookings
MODIFY COLUMN status ENUM('BOOKED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL;

ALTER TABLE payments
MODIFY COLUMN status ENUM('PENDING', 'PAID', 'REFUNDED', 'PARTIAL_REFUND') NOT NULL;
