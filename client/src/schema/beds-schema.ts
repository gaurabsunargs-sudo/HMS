import { Pagination } from './pagination-schema'

export interface Bed {
  id: string
  bedNumber: string
  bedType: 'GENERAL' | 'ICU' | 'PRIVATE' | 'EMERGENCY'
  ward: string
  isOccupied: boolean
  pricePerDay: number
  createdAt: string
  updatedAt: string
  currentAdmission?: {
    id: string
    patient: {
      id: string
      user: {
        firstName: string
        lastName: string
      }
    }
    admissionDate: string
  } | null
}

export interface BedsResponse {
  success: boolean
  message: string
  data: Bed[]
  meta: {
    pagination: Pagination
  }
}

export interface BedResponse {
  success: boolean
  message: string
  data: Bed
}

export interface CreateBedRequest {
  bedNumber: string
  bedType: 'GENERAL' | 'ICU' | 'PRIVATE' | 'EMERGENCY'
  ward: string
  pricePerDay: number
}

export interface UpdateBedRequest {
  bedNumber?: string
  bedType?: 'GENERAL' | 'ICU' | 'PRIVATE' | 'EMERGENCY'
  ward?: string
  isOccupied?: boolean
  pricePerDay?: number
}
