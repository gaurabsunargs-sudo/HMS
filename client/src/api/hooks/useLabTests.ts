import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LabTest, LabTestsResponse, LabTestResponse, CreateLabTestRequest, UpdateLabTestRequest } from '@/schema/lab-tests-schema'
import { api } from '../client'

export const useLabTests = ({
  page = 1,
  limit = 10,
  patientId = '',
  status = '',
  testType = '',
}: {
  page?: number
  limit?: number
  patientId?: string
  status?: string
  testType?: string
}) => {
  return useQuery<LabTestsResponse, Error>({
    queryKey: ['labTests', page, limit, patientId, status, testType],
    queryFn: async () => {
      const { data } = await api.get<LabTestsResponse>('/lab-tests', {
        params: {
          page,
          limit,
          patientId: patientId || undefined,
          status: status || undefined,
          testType: testType || undefined,
        },
      })
      return data
    },
  })
}

export const useLabTestById = (id: string | null) => {
  return useQuery<LabTest, Error>({
    queryKey: ['labTest', id],
    queryFn: async () => {
      const { data } = await api.get<LabTestResponse>(`/lab-tests/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const usePatientLabTests = (patientId: string | null) => {
  return useQuery<LabTest[], Error>({
    queryKey: ['patientLabTests', patientId],
    queryFn: async () => {
      const { data } = await api.get(`/lab-tests/patient/${patientId}`)
      return data.data
    },
    enabled: !!patientId,
  })
}

export const usePendingLabTests = () => {
  return useQuery<LabTest[], Error>({
    queryKey: ['pendingLabTests'],
    queryFn: async () => {
      const { data } = await api.get('/lab-tests/pending')
      return data.data
    },
  })
}

export const useCreateLabTest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newTest: CreateLabTestRequest) => api.post('/lab-tests', newTest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] })
      queryClient.invalidateQueries({ queryKey: ['pendingLabTests'] })
    },
  })
}

export const useUpdateLabTest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedTest,
    }: {
      id: string
      updatedTest: UpdateLabTestRequest
    }) => api.put(`/lab-tests/${id}`, updatedTest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] })
      queryClient.invalidateQueries({ queryKey: ['pendingLabTests'] })
    },
  })
}

export const useUpdateLabTestStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      results,
    }: {
      id: string
      status: string
      results?: any
    }) => api.patch(`/lab-tests/${id}/status`, { status, results }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] })
      queryClient.invalidateQueries({ queryKey: ['pendingLabTests'] })
    },
  })
}

export const useDeleteLabTest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lab-tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] })
      queryClient.invalidateQueries({ queryKey: ['pendingLabTests'] })
    },
  })
}
