import { User } from './users-schema'

export interface RegisterUserRequest {
  username: string
  email: string
  password?: string
  firstName: string
  middleName?: string
  lastName: string
  role: 'PATIENT' | 'ADMIN' | 'DOCTOR'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface ProfileResponse {
  success: boolean
  message: string
  data: User
}
