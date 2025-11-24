import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Equipment, EquipmentResponse, SingleEquipmentResponse, CreateEquipmentRequest, UpdateEquipmentRequest } from '@/schema/equipment-schema'
import { api } from '../client'

export const useEquipment = ({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
}) => {
  return useQuery<EquipmentResponse, Error>({
    queryKey: ['equipment', page, limit],
    queryFn: async () => {
      const { data } = await api.get<EquipmentResponse>('/equipment', {
        params: {
          page,
          limit,
        },
      })
      return data
    },
  })
}

export const useEquipmentById = (id: string | null) => {
  return useQuery<Equipment, Error>({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const { data } = await api.get<SingleEquipmentResponse>(`/equipment/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newEquipment: CreateEquipmentRequest) => api.post('/equipment', newEquipment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedEquipment,
    }: {
      id: string
      updatedEquipment: UpdateEquipmentRequest
    }) => api.put(`/equipment/${id}`, updatedEquipment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/equipment/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}
