import { api } from './api'

export function getUsers() {
  return api.get('/api/admin/users').then((response) => response.data)
}

export function getAnalytics() {
  return api.get('/api/admin/analytics').then((response) => response.data)
}

export function getAllBookings() {
  return api.get('/api/admin/bookings').then((response) => response.data)
}

export function getAllReviews() {
  return api.get('/api/admin/reviews').then((response) => response.data)
}

export function approveParking(parkingId) {
  return api.put(`/api/admin/parking/${parkingId}/approve`).then((response) => response.data)
}

export function deleteReview(reviewId) {
  return api.delete(`/api/admin/reviews/${reviewId}`)
}

export function deactivateUser(userId) {
  return api.put(`/api/admin/users/${userId}/deactivate`).then((response) => response.data)
}

export function activateUser(userId) {
  return api.put(`/api/admin/users/${userId}/activate`).then((response) => response.data)
}
