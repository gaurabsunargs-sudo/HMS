import { Doctor } from './doctors-schema'
import { Pagination } from './pagination-schema'
import { Patient } from './patients-schema'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  dateTime: string
  duration: string
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'NO_SHOW'
  reason: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  patient: Patient
  doctor: Doctor
}

export interface AppointmentsResponse {
  success: boolean
  message: string
  data: Appointment[]
  meta: {
    pagination: Pagination
  }
}

export interface AppointmentResponse {
  success: boolean
  message: string
  data: Appointment
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  dateTime: string
  reason: string
  notes?: string
}

export interface UpdateAppointmentRequest {
  dateTime?: string
  status?: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'NO_SHOW'
  reason?: string
  notes?: string
}
