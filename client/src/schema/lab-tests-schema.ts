import { Pagination } from './pagination-schema'
import { Patient } from './patients-schema'
import { Doctor } from './doctors-schema'

export interface LabTestResult {
  parameter: string
  value: string
  normalRange: string
  unit: string
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL'
}

export interface LabTest {
  id: string
  patientId: string
  doctorId: string
  testType: string
  testName: string
  sampleType: 'BLOOD' | 'URINE' | 'STOOL' | 'SALIVA' | 'OTHER'
  status: 'ORDERED' | 'COLLECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  orderedDate: string
  collectedDate?: string | null
  completedDate?: string | null
  results?: LabTestResult[] | null
  notes?: string | null
  cost: number
  createdAt: string
  updatedAt: string
  patient: Patient
  doctor: Doctor
}

export interface LabTestsResponse {
  success: boolean
  message: string
  data: LabTest[]
  meta: {
    pagination: Pagination
  }
}

export interface LabTestResponse {
  success: boolean
  message: string
  data: LabTest
}

export interface CreateLabTestRequest {
  patientId: string
  doctorId: string
  testType: string
  testName: string
  sampleType: 'BLOOD' | 'URINE' | 'STOOL' | 'SALIVA' | 'OTHER'
  notes?: string
  cost: number
}

export interface UpdateLabTestRequest {
  status?: 'ORDERED' | 'COLLECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  collectedDate?: string
  completedDate?: string
  results?: LabTestResult[]
  notes?: string
  cost?: number
}
