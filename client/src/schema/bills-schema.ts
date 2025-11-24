import { Pagination } from './pagination-schema'
import { Patient } from './patients-schema'
import { Admission } from './admissions-schema'

export interface BillItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Bill {
  id: string
  patientId: string
  admissionId?: string | null
  billNumber: string
  totalAmount: number
  paidAmount: number
  dueDate: string
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  billItems: BillItem[]
  createdAt: string
  updatedAt: string
  patient: Patient
  admission?: Admission | null
}

export interface BillsResponse {
  success: boolean
  message: string
  data: Bill[]
  meta: {
    pagination: Pagination
  }
}

export interface BillResponse {
  success: boolean
  message: string
  data: Bill
}

export interface CreateBillRequest {
  patientId: string
  admissionId?: string
  billNumber: string
  totalAmount: number
  dueDate: string
  billItems: BillItem[]
}

export interface UpdateBillRequest {
  totalAmount?: number
  paidAmount?: number
  dueDate?: string
  status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  billItems?: BillItem[]
}
