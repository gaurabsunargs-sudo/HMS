import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Prescription,
  PrescriptionsResponse,
  PrescriptionResponse,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
} from '@/schema/prescriptions-schema'
import { api } from '../client'

export const usePrescriptions = ({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery<PrescriptionsResponse, Error>({
    queryKey: ['prescriptions', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionsResponse>('/prescriptions', {
        params: {
          page,
          limit,
          search,
        },
      })
      return data
    },
  })
}

export const usePrescriptionById = (id: string | null) => {
  return useQuery<Prescription, Error>({
    queryKey: ['prescription', id],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionResponse>(
        `/prescriptions/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreatePrescription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newPrescription: CreatePrescriptionRequest) =>
      api.post('/prescriptions', newPrescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedPrescription,
    }: {
      id: string
      updatedPrescription: UpdatePrescriptionRequest
    }) => api.put(`/prescriptions/${id}`, updatedPrescription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}

export const useDeletePrescription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/prescriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}
