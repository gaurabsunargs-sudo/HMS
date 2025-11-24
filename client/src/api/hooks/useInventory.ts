import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { InventoryItem, InventoryResponse, InventoryItemResponse, CreateInventoryItemRequest, UpdateInventoryItemRequest } from '@/schema/inventory-schema'
import { api } from '../client'

export const useInventory = ({
  page = 1,
  limit = 10,
  category = '',
  status = '',
  search = '',
}: {
  page?: number
  limit?: number
  category?: string
  status?: string
  search?: string
}) => {
  return useQuery<InventoryResponse, Error>({
    queryKey: ['inventory', page, limit, category, status, search],
    queryFn: async () => {
      const { data } = await api.get<InventoryResponse>('/inventory', {
        params: {
          page,
          limit,
          category: category || undefined,
          status: status || undefined,
          search: search || undefined,
        },
      })
      return data
    },
  })
}

export const useInventoryItemById = (id: string | null) => {
  return useQuery<InventoryItem, Error>({
    queryKey: ['inventoryItem', id],
    queryFn: async () => {
      const { data } = await api.get<InventoryItemResponse>(`/inventory/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useLowStockItems = () => {
  return useQuery<InventoryItem[], Error>({
    queryKey: ['lowStockItems'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/low-stock')
      return data.data
    },
  })
}

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newItem: CreateInventoryItemRequest) => api.post('/inventory', newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] })
    },
  })
}

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedItem,
    }: {
      id: string
      updatedItem: UpdateInventoryItemRequest
    }) => api.put(`/inventory/${id}`, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] })
    },
  })
}

export const useUpdateInventoryStock = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      quantity,
      type,
    }: {
      id: string
      quantity: number
      type: 'ADD' | 'SUBTRACT'
    }) => api.patch(`/inventory/${id}/stock`, { quantity, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] })
    },
  })
}

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] })
    },
  })
}
