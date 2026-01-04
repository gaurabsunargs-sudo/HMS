import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Payment,
  PaymentsResponse,
  PaymentResponse,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '@/schema/payments-schema'
import { api } from '../client'

export const usePayments = ({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery<PaymentsResponse, Error>({
    queryKey: ['payments', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get<PaymentsResponse>('/payments', {
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

export const usePaymentById = (id: string | null) => {
  return useQuery<Payment, Error>({
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data } = await api.get<PaymentResponse>(`/payments/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newPayment: CreatePaymentRequest) =>
      api.post('/payments', newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}

export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedPayment,
    }: {
      id: string
      updatedPayment: UpdatePaymentRequest
    }) => api.put(`/payments/${id}`, updatedPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}

export const useDeletePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}
