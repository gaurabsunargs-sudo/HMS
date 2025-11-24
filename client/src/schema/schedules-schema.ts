import { Pagination } from './pagination-schema'
import { Doctor } from './doctors-schema'

export interface Schedule {
  id: string
  doctorId: string
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  isAvailable: boolean
  maxAppointments: number
  slotDuration: number // in minutes
  createdAt: string
  updatedAt: string
  doctor: Doctor
}

export interface SchedulesResponse {
  success: boolean
  message: string
  data: Schedule[]
  meta: {
    pagination: Pagination
  }
}

export interface ScheduleResponse {
  success: boolean
  message: string
  data: Schedule
}

export interface CreateScheduleRequest {
  doctorId: string
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  maxAppointments: number
  slotDuration: number
}

export interface UpdateScheduleRequest {
  dayOfWeek?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime?: string
  endTime?: string
  isAvailable?: boolean
  maxAppointments?: number
  slotDuration?: number
}
