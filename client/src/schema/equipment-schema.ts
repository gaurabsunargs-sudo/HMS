import { Pagination } from './pagination-schema'

export interface Equipment {
  id: string
  name: string
  type: 'DIAGNOSTIC' | 'THERAPEUTIC' | 'SURGICAL' | 'MONITORING' | 'OTHER'
  model: string
  serialNumber: string
  location: string
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_ORDER'
  purchaseDate: string
  warranty?: string | null
  createdAt: string
  updatedAt: string
}

export interface EquipmentResponse {
  success: boolean
  message: string
  data: Equipment[]
  meta: {
    pagination: Pagination
  }
}

export interface SingleEquipmentResponse {
  success: boolean
  message: string
  data: Equipment
}

export interface CreateEquipmentRequest {
  name: string
  type: 'DIAGNOSTIC' | 'THERAPEUTIC' | 'SURGICAL' | 'MONITORING' | 'OTHER'
  model: string
  serialNumber: string
  location: string
  purchaseDate: string
  warranty?: string
}

export interface UpdateEquipmentRequest {
  name?: string
  type?: 'DIAGNOSTIC' | 'THERAPEUTIC' | 'SURGICAL' | 'MONITORING' | 'OTHER'
  model?: string
  location?: string
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_ORDER'
  warranty?: string
}
