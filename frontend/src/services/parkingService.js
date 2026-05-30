import { api } from './api'

export function getParkingList(params) {
  return api.get('/api/parking', { params }).then((response) => response.data)
}

export function getOwnerParkingList() {
  return api.get('/api/parking/owner').then((response) => response.data)
}

export function getParkingDetails(parkingId) {
  return api.get(`/api/parking/${parkingId}`).then((response) => response.data)
}

export function getParkingSlots(parkingId) {
  return api.get(`/api/parking/${parkingId}/slots`).then((response) => response.data)
}

export function getAvailableParkingSlots(parkingId, params) {
  return api.get(`/api/parking/${parkingId}/available-slots`, { params }).then((response) => response.data)
}

export function createParking(payload) {
  return api.post('/api/parking', payload).then((response) => response.data)
}

export function updateParking(parkingId, payload) {
  return api.put(`/api/parking/${parkingId}`, payload).then((response) => response.data)
}

export function addParkingSlot(parkingId, payload) {
  return api.post(`/api/parking/${parkingId}/slots`, payload).then((response) => response.data)
}

export function deleteParking(parkingId) {
  return api.delete(`/api/parking/${parkingId}`).then((response) => response.data)
}

export function hasActiveBookings(parkingId) {
  return api.get(`/api/parking/${parkingId}/has-active-bookings`).then((response) => response.data)
}

export function uploadParkingImages(files) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return api
    .post('/api/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => response.data)
}
