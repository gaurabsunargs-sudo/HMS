import { Pagination } from './pagination-schema'
import { User } from './users-schema'

export interface Patient {
  id: string
  userId: string
  patientId: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  bloodGroup: string
  contactNumber: string
  emergencyContact: string
  address: string
  medicalHistory?: string | null
  allergies?: string | null
  createdAt: string
  updatedAt: string
  user: User
  _count?: {
    appointments: number
    medicalRecords: number
    admissions: number
  }
}

export interface PatientsResponse {
  success: boolean
  message: string
  data: Patient[]
  meta: {
    pagination: Pagination
  }
}

export interface PatientResponse {
  success: boolean
  message: string
  data: Patient
}

export interface CreatePatientRequest {
  userId: string
  patientId: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  bloodGroup: string
  contactNumber: string
  emergencyContact: string
  address: string
  medicalHistory?: string
  allergies?: string
}

export interface RegisterPatientWithUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  profile?: string
  patientId: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  bloodGroup: string
  contactNumber: string
  emergencyContact: string
  address: string
  medicalHistory?: string
  allergies?: string
}

export interface UpdatePatientRequest {
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  bloodGroup?: string
  contactNumber?: string
  emergencyContact?: string
  address?: string
  medicalHistory?: string
  allergies?: string
}
