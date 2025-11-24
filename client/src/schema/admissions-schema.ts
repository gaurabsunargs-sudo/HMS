import { Bed } from './beds-schema'
import { Bill } from './bills-schema'
import { Pagination } from './pagination-schema'
import { Patient } from './patients-schema'

export interface Admission {
  id: string
  patientId: string
  bedId: string
  admissionDate: string
  dischargeDate?: string | null
  reason: string
  status: 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED'
  totalAmount: number
  createdAt: string
  updatedAt: string
  patient: Patient
  bed: Bed
  bills?: (Bill & { payments?: { amount: number | string }[] })[]
}

export interface AdmissionsResponse {
  success: boolean
  message: string
  data: Admission[]
  meta: {
    pagination: Pagination
  }
}

export interface AdmissionResponse {
  success: boolean
  message: string
  data: Admission
}

export interface CreateAdmissionRequest {
  patientId: string
  bedId: string
  reason: string
  totalAmount: number
}

export interface UpdateAdmissionRequest {
  dischargeDate?: string
  status?: 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED'
  totalAmount?: number
}
