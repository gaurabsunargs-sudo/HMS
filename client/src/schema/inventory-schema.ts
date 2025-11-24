import { Pagination } from './pagination-schema'

export interface InventoryItem {
  id: string
  name: string
  category: 'MEDICINE' | 'EQUIPMENT' | 'SUPPLIES' | 'OTHER'
  description?: string | null
  quantity: number
  minStockLevel: number
  unitPrice: number
  supplier?: string | null
  expiryDate?: string | null
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED'
  createdAt: string
  updatedAt: string
}

export interface InventoryResponse {
  success: boolean
  message: string
  data: InventoryItem[]
  meta: {
    pagination: Pagination
  }
}

export interface InventoryItemResponse {
  success: boolean
  message: string
  data: InventoryItem
}

export interface CreateInventoryItemRequest {
  name: string
  category: 'MEDICINE' | 'EQUIPMENT' | 'SUPPLIES' | 'OTHER'
  description?: string
  quantity: number
  minStockLevel: number
  unitPrice: number
  supplier?: string
  expiryDate?: string
}

export interface UpdateInventoryItemRequest {
  name?: string
  category?: 'MEDICINE' | 'EQUIPMENT' | 'SUPPLIES' | 'OTHER'
  description?: string
  quantity?: number
  minStockLevel?: number
  unitPrice?: number
  supplier?: string
  expiryDate?: string
  status?: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED'
}
