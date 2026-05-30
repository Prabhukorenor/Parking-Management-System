import { api } from './api'

export function getLocations() {
  return api.get('/api/locations').then((response) => response.data)
}

export function createLocation(payload) {
  return api.post('/api/locations', payload).then((response) => response.data)
}
