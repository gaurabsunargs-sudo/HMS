import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bill,
  BillsResponse,
  BillResponse,
  CreateBillRequest,
  UpdateBillRequest,
} from '@/schema/bills-schema'
import { api } from '../client'

export const useBills = ({
  page = 1,
  limit = 10,
  search = '',
  status = '',
  admissionId = '',
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
  admissionId?: string
}) => {
  return useQuery<BillsResponse, Error>({
    queryKey: ['bills', page, limit, search, status, admissionId],
    queryFn: async () => {
      const { data } = await api.get<BillsResponse>('/bills', {
        params: {
          page,
          limit,
          search,
          status: status || undefined,
          admissionId: admissionId || undefined,
        },
      })
      return data
    },
  })
}

export const useBillById = (id: string | null) => {
  return useQuery<Bill, Error>({
    queryKey: ['bill', id],
    queryFn: async () => {
      const { data } = await api.get<BillResponse>(`/bills/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newBill: CreateBillRequest) => api.post('/bills', newBill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}

export const useUpdateBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedBill,
    }: {
      id: string
      updatedBill: UpdateBillRequest
    }) => api.put(`/bills/${id}`, updatedBill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}

export const useDeleteBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}
