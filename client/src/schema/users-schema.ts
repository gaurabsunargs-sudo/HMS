import { Pagination } from './pagination-schema'

export interface AdminProfile {
  id: string
  userId: string
  employeeId: string
}

export interface User {
  id: string
  username: string
  email: string
  password: string
  firstName: string
  middleName?: string | null
  lastName: string
  profile?: string | null
  role: 'PATIENT' | 'ADMIN' | 'DOCTOR' | string
  isActive: boolean
  createdAt: string
  updatedAt: string
  doctor?: unknown | null
  patient?: unknown | null
  adminProfile?: AdminProfile | null
}

export interface UsersResponse {
  success: boolean
  message: string
  data: User[]
  meta: {
    pagination: Pagination
  }
}

export interface UserResponse {
  success: boolean
  message: string
  data: User
}

export interface UpdateUserRequest {
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  profile?: string
  isActive?: boolean
}
