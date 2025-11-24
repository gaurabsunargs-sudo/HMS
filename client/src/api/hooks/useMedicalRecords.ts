import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MedicalRecord,
  MedicalRecordsResponse,
  MedicalRecordResponse,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
} from '@/schema/medical-records-schema'
import { api } from '../client'

export const useMedicalRecords = ({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery<MedicalRecordsResponse, Error>({
    queryKey: ['medicalRecords', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get<MedicalRecordsResponse>(
        '/medical-records',
        {
          params: {
            page,
            limit,
            search,
          },
        }
      )
      return data
    },
  })
}

export const useMedicalRecordById = (id: string | null) => {
  return useQuery<MedicalRecord, Error>({
    queryKey: ['medicalRecord', id],
    queryFn: async () => {
      const { data } = await api.get<MedicalRecordResponse>(
        `/medical-records/${id}`
      )
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newRecord: CreateMedicalRecordRequest) =>
      api.post('/medical-records', newRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] })
    },
  })
}

export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedRecord,
    }: {
      id: string
      updatedRecord: UpdateMedicalRecordRequest
    }) => api.put(`/medical-records/${id}`, updatedRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] })
    },
  })
}

export const useDeleteMedicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/medical-records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] })
    },
  })
}
