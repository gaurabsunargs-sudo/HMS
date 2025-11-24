import { Pagination } from './pagination-schema'
import { Bill } from './bills-schema'

export interface Payment {
  id: string
  billId: string
  amount: number
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'INSURANCE' | 'KHALTI' | 'ESEWA'
  transactionId?: string | null
  paymentDate: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED'
  notes?: string | null
  createdAt: string
  updatedAt: string
  bill: Bill
}

export interface PaymentsResponse {
  success: boolean
  message: string
  data: Payment[]
  meta: {
    pagination: Pagination
  }
}

export interface PaymentResponse {
  success: boolean
  message: string
  data: Payment
}

export interface CreatePaymentRequest {
  billId: string
  amount: number
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'INSURANCE' | 'KHALTI' | 'ESEWA'
  transactionId?: string
  notes?: string
}

export interface UpdatePaymentRequest {
  amount?: number
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'INSURANCE' | 'KHALTI' | 'ESEWA'
  transactionId?: string
  status?: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED'
  notes?: string
}
