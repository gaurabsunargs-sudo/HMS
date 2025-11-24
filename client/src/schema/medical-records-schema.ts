import { Pagination } from './pagination-schema'
import { Patient } from './patients-schema'
import { Doctor } from './doctors-schema'

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  symptoms: string
  diagnosis: string
  treatment: string
  notes?: string | null
  attachments?: string[]
  createdAt: string
  updatedAt: string
  patient: Patient
  doctor: Doctor
}

export interface MedicalRecordsResponse {
  success: boolean
  message: string
  data: MedicalRecord[]
  meta: {
    pagination: Pagination
  }
}

export interface MedicalRecordResponse {
  success: boolean
  message: string
  data: MedicalRecord
}

export interface CreateMedicalRecordRequest {
  patientId: string
  doctorId: string
  symptoms: string
  diagnosis: string
  treatment: string
  notes?: string
  attachments?: string[]
}

export interface UpdateMedicalRecordRequest {
  symptoms?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  attachments?: string[]
}
