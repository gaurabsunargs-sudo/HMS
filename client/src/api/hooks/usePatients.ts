import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Patient,
  PatientsResponse,
  PatientResponse,
  CreatePatientRequest,
  UpdatePatientRequest,
  RegisterPatientWithUserRequest,
} from '@/schema/patients-schema'
import { api } from '../client'

export const usePatients = ({
  page = 1,
  limit = 10,
  bloodGroup = '',
  gender = '',
  search = '',
}: {
  page?: number
  limit?: number
  bloodGroup?: string
  gender?: string
  search?: string
}) => {
  return useQuery<PatientsResponse, Error>({
    queryKey: ['patients', page, limit, bloodGroup, gender, search],
    queryFn: async () => {
      const { data } = await api.get<PatientsResponse>('/patients', {
        params: {
          page,
          limit,
          bloodGroup: bloodGroup || undefined,
          gender: gender || undefined,
          search: search || undefined,
        },
      })
      return data
    },
  })
}
export const usePatientsSelect = ({ }: {
  page?: number
  limit?: number
  bloodGroup?: string
  gender?: string
  search?: string
}) => {
  return useQuery<PatientsResponse, Error>({
    queryKey: ['patients', 'select'],
    queryFn: async () => {
      const { data } = await api.get<PatientsResponse>('/patients/select')
      return data
    },
  })
}

export const usePatientById = (id: string | null) => {
  return useQuery<Patient, Error>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get<PatientResponse>(`/patients/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreatePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newPatient: CreatePatientRequest) =>
      api.post('/patients', newPatient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patientsSelect'] })
    },
  })
}

export const useRegisterPatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newPatient: RegisterPatientWithUserRequest) =>
      api.post('/patients/register', newPatient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patientsSelect'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedPatient,
    }: {
      id: string
      updatedPatient: UpdatePatientRequest
    }) => api.put(`/patients/${id}`, updatedPatient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patientsSelect'] })
    },
  })
}

export const useDeletePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patientsSelect'] })
    },
  })
}
