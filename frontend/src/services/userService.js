import { api } from './api'

export function getUserProfile() {
  return api.get('/api/users/profile').then((response) => response.data)
}

export function updateUserProfile(payload) {
  return api.put('/api/users/profile', payload).then((response) => response.data)
}
