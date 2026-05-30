import { api } from './api'

export function createBooking(payload) {
  return api.post('/api/bookings', payload).then((response) => response.data)
}

export function getUserBookings() {
  return api.get('/api/bookings/user').then((response) => response.data)
}

export function getOwnerBookings() {
  return api.get('/api/bookings/owner').then((response) => response.data)
}

export function cancelBooking(bookingId) {
  return api.delete(`/api/bookings/${bookingId}`).then((response) => response.data)
}

export function startParking(bookingId) {
  return api.post(`/api/bookings/${bookingId}/start`).then((response) => response.data)
}

export function getExitRefundPreview(bookingId) {
  return api.get(`/api/bookings/${bookingId}/exit-preview`).then((response) => response.data)
}

export function exitParking(bookingId) {
  return api.post(`/api/bookings/${bookingId}/exit`).then((response) => response.data)
}

export function createRazorpayOrder(payload) {
  return api.post('/api/bookings/razorpay/create-order', payload).then((response) => response.data)
}

export function verifyRazorpayPayment(payload) {
  return api.post('/api/bookings/razorpay/verify', payload).then((response) => response.data)
}
