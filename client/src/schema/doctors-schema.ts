import { Pagination } from './pagination-schema'
import { User } from './users-schema'

export interface Doctor {
  id: string
  userId: string
  licenseNumber: string
  specialization: string
  experience: number
  consultationFee: number
  qualifications: string[]
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  user: User
  _count?: {
    appointments: number
    medicalRecords: number
    prescriptions: number
  }
}

export interface DoctorsResponse {
  success: boolean
  message: string
  data: Doctor[]
  meta: {
    pagination: Pagination
  }
}

export interface DoctorResponse {
  success: boolean
  message: string
  data: Doctor
}

export interface CreateDoctorRequest {
  userId: string
  licenseNumber: string
  specialization: string
  experience: number
  consultationFee: number
  qualifications: string[]
}

export interface UpdateDoctorRequest {
  specialization?: string
  experience?: number
  consultationFee?: number
  qualifications?: string[]
  isAvailable?: boolean
}

export interface DoctorStatsResponse {
  success: boolean
  message: string
  data: {
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    totalPatients: number
    averageRating: number
    totalRevenue: number
    monthlyStats: {
      month: string
      appointments: number
      revenue: number
    }[]
  }
}

export interface RegisterDoctorRequest {
  username: string
  email: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  licenseNumber: string
  specialization: string
  experience?: number
  consultationFee?: number
  qualifications?: string[]
}
