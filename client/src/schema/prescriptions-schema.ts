import { Doctor } from './doctors-schema'
import { Pagination } from './pagination-schema'
import { Patient } from './patients-schema'

export interface Medicine {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
}

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  medicines: Medicine[]
  instructions: string
  validUntil: string
  createdAt: string
  updatedAt: string
  patient: Patient
  doctor: Doctor
  issuedDate: string
}

export interface PrescriptionsResponse {
  success: boolean
  message: string
  data: Prescription[]
  meta: {
    pagination: Pagination
  }
}

export interface PrescriptionResponse {
  success: boolean
  message: string
  data: Prescription
}

export interface CreatePrescriptionRequest {
  patientId: string
  doctorId: string
  medicines: Medicine[]
  instructions: string
  validUntil: string
}

export interface UpdatePrescriptionRequest {
  medicines?: Medicine[]
  instructions?: string
  validUntil?: string
}
