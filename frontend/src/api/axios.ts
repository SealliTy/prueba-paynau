/// <reference types="vite/client" />
import axios from 'axios'
import { getToken, removeToken } from '../lib/auth'

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
