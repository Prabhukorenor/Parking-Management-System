import { api } from './api'

export function createReview(payload) {
  return api.post('/api/reviews', payload).then((response) => response.data)
}

export function getParkingReviews(parkingId) {
  return api.get(`/api/parking/${parkingId}/reviews`).then((response) => response.data)
}
