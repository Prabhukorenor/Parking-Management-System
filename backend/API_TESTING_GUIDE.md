# Vehicle Parking Management System API Testing Guide

Base URL:

`http://localhost:8080`

Recommended Postman variables:

- `baseUrl`
- `adminToken`
- `ownerToken`
- `customerToken`
- `parkingId`
- `slotId`
- `bookingId`
- `reviewId`

## Admin APIs

| Method | Endpoint | Auth | Body | Expected Result |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | No | `{"email":"admin@pms.com","password":"Admin@123"}` | Returns admin JWT token |
| `GET` | `/api/admin/users` | `Bearer adminToken` | None | Returns all users |
| `GET` | `/api/admin/analytics` | `Bearer adminToken` | None | Returns analytics summary |
| `PUT` | `/api/admin/parking/{parkingId}/approve` | `Bearer adminToken` | None | Parking approved successfully |
| `DELETE` | `/api/admin/reviews/{reviewId}` | `Bearer adminToken` | None | Review deleted, returns `204 No Content` |
| `GET` | `/api/admin/users` | `Bearer customerToken` | None | `403 Forbidden` |

## Owner APIs

| Method | Endpoint | Auth | Body | Expected Result |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | `{"name":"Parking Owner","email":"owner1@example.com","password":"Owner123","role":"OWNER"}` | Owner registered successfully |
| `POST` | `/api/auth/login` | No | `{"email":"owner1@example.com","password":"Owner123"}` | Returns owner JWT token |
| `POST` | `/api/locations` | `Bearer ownerToken` | `{"street":"12 MG Road","area":"Central Market","city":"Bangalore","state":"Karnataka","country":"India","pincode":"560001"}` | Location created |
| `GET` | `/api/locations` | No | None | Returns all locations |
| `POST` | `/api/uploads/images` | `Bearer ownerToken` | `form-data` with key `files` and image files attached | Returns uploaded `imageUrls` |
| `POST` | `/api/parking` | `Bearer ownerToken` | `{"locationId":1,"title":"City Center Parking","description":"Safe parking with guards and CCTV","pricePerDay":500,"pricePerHour":50,"images":["/uploads/your-image.jpg"],"amenities":["CCTV surveillance","Security guards","EV charging facility"],"vehicleTypes":["CAR","BIKE"],"availableFrom":"06:00:00","availableTo":"23:00:00"}` | Parking created, usually pending approval |
| `POST` | `/api/parking/{parkingId}/slots` | `Bearer ownerToken` | `{"slotNumber":"A-101","slotType":"COVERED","isAvailable":true}` | Slot created |
| `POST` | `/api/parking/{parkingId}/slots` | `Bearer ownerToken` | `{"slotNumber":"A-102","slotType":"OPEN","isAvailable":true}` | Second slot created |
| `GET` | `/api/parking/{parkingId}/slots` | `Bearer ownerToken` | None | Returns slots for that parking |
| `POST` | `/api/bookings` | `Bearer ownerToken` | Any valid booking body | `403 Forbidden` |

## Customer APIs

| Method | Endpoint | Auth | Body | Expected Result |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | `{"name":"Customer User","email":"customer1@example.com","password":"Customer123","role":"CUSTOMER"}` | Customer registered successfully |
| `POST` | `/api/auth/login` | No | `{"email":"customer1@example.com","password":"Customer123"}` | Returns customer JWT token |
| `GET` | `/api/parking` | No | None | Returns approved parking listings |
| `GET` | `/api/parking/{parkingId}` | No | None | Returns parking details, slots, and amenity charges |
| `GET` | `/api/parking?city=Bangalore` | No | None | Returns parking filtered by city |
| `GET` | `/api/parking?vehicleType=CAR` | No | None | Returns parking filtered by vehicle type |
| `GET` | `/api/parking?amenities=CCTV surveillance&amenities=EV charging facility` | No | None | Returns parking filtered by amenities |
| `POST` | `/api/bookings` | `Bearer customerToken` | `{"parkingId":1,"slotId":1,"startDate":"2026-05-01T10:00:00","endDate":"2026-05-01T18:00:00","paymentStatus":"PAID"}` | Future booking created with `status = BOOKED` |
| `GET` | `/api/bookings/user` | `Bearer customerToken` | None | Returns customer bookings |
| `POST` | `/api/bookings` | `Bearer customerToken` | `{"parkingId":1,"slotId":1,"startDate":"2026-04-20T10:00:00","endDate":"2026-04-20T12:00:00","paymentStatus":"PAID"}` | Past booking created with `status = COMPLETED` |
| `GET` | `/api/bookings/user` | `Bearer customerToken` | None | Past booking appears as `COMPLETED` |
| `POST` | `/api/reviews` | `Bearer customerToken` | `{"parkingId":1,"rating":5,"comment":"Very secure and clean parking."}` | Review created successfully |
| `GET` | `/api/parking/{parkingId}/reviews` | No | None | Returns reviews for parking |
| `POST` | `/api/reviews` | `Bearer customerToken` | `{"parkingId":1,"rating":4,"comment":"Second review test"}` | `400 Bad Request`, duplicate review blocked |
| `DELETE` | `/api/bookings/{bookingId}` | `Bearer customerToken` | None | Booking cancelled, returns `204 No Content` |
| `GET` | `/api/bookings/user` | `Bearer customerToken` | None | Cancelled booking appears as `CANCELLED` |
| `POST` | `/api/uploads/images` | `Bearer customerToken` | `form-data` with key `files` | `403 Forbidden` |
| `POST` | `/api/bookings` | `Bearer customerToken` | Same slot and overlapping time | `400 Bad Request`, overlapping booking blocked |
| `POST` | `/api/reviews` | `Bearer anotherCustomerToken` | `{"parkingId":1,"rating":5,"comment":"Test"}` | `400 Bad Request`, no completed booking |

## Suggested Testing Order

1. Login as admin, owner, and customer.
2. Owner creates location.
3. Owner uploads images.
4. Owner creates parking.
5. Owner adds slots.
6. Admin approves parking.
7. Customer searches parking and checks details.
8. Customer creates a future booking.
9. Customer creates a past booking for review testing.
10. Customer posts review.
11. Admin deletes review for moderation testing.

## Notes

- Use uploaded image URLs from `/api/uploads/images` inside the parking create request.
- Review creation works only for customers with a completed booking.
- A booking created with a past `endDate` is stored as `COMPLETED`.
- A booking created with a future `endDate` is stored as `BOOKED`.
- Booking price now includes base price, amenity charges, and service fee.
