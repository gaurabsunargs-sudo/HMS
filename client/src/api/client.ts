import axios from 'axios'
import Cookies from 'js-cookie'
import { decryptData } from '@/lib/encryptionUtils'
import { serverUrl } from './server-url'

export const api = axios.create({
  baseURL: serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const encryptedToken = Cookies.get('hms-token')

  if (encryptedToken) {
    try {
      const token = decryptData(encryptedToken) as string
      config.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.error('Token decryption failed:', error)
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize backend error so UI can show proper message
    const backendMessage = error?.response?.data?.message
    if (backendMessage) {
      error.message = backendMessage
    }
    return Promise.reject(error)
  }
)
