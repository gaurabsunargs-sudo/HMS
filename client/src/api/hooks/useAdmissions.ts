import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Admission,
  AdmissionsResponse,
  AdmissionResponse,
  CreateAdmissionRequest,
  UpdateAdmissionRequest,
} from '@/schema/admissions-schema'
import { api } from '../client'

export const useAdmissions = ({
  page = 1,
  limit = 10,
  search = '',
  status = '',
}: {
  page?: number
  limit?: number
  search?: string
  status?: string
}) => {
  return useQuery<AdmissionsResponse, Error>({
    queryKey: ['admissions', page, limit, search, status],
    queryFn: async () => {
      const { data } = await api.get<AdmissionsResponse>('/admissions', {
        params: {
          page,
          limit,
          search,
          status: status || undefined,
        },
      })
      return data
    },
  })
}

export const useAdmissionById = (id: string | null) => {
  return useQuery<Admission, Error>({
    queryKey: ['admission', id],
    queryFn: async () => {
      const { data } = await api.get<AdmissionResponse>(`/admissions/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateAdmission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newAdmission: CreateAdmissionRequest) =>
      api.post('/admissions', newAdmission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
    },
  })
}

export const useUpdateAdmission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedAdmission,
    }: {
      id: string
      updatedAdmission: UpdateAdmissionRequest
    }) => api.put(`/admissions/${id}`, updatedAdmission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
    },
  })
}

export const useDeleteAdmission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
    },
  })
}
