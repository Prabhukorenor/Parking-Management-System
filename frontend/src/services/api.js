
import axios from 'axios'

const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function resolveAssetUrl(path) {
  if (!path) {
    return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${apiOrigin}${path}`
}