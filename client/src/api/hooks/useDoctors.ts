import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Doctor,
  DoctorsResponse,
  DoctorResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorStatsResponse,
  RegisterDoctorRequest,
} from '@/schema/doctors-schema'
import { api } from '../client'

export const useDoctors = ({
  page = 1,
  limit = 10,
  specialization = '',
  available = '',
  search = '',
}: {
  page?: number
  limit?: number
  specialization?: string
  available?: string
  search?: string
}) => {
  return useQuery<DoctorsResponse, Error>({
    queryKey: ['doctors', page, limit, specialization, available, search],
    queryFn: async () => {
      const { data } = await api.get<DoctorsResponse>('/doctors', {
        params: {
          page,
          limit,
          specialization: specialization || undefined,
          available: available || undefined,
          search: search || undefined,
        },
      })
      return data
    },
  })
}
export const useDoctorsSelect = ({ }) => {
  return useQuery<DoctorsResponse, Error>({
    queryKey: ['doctors', 'select'],
    queryFn: async () => {
      const { data } = await api.get<DoctorsResponse>('/doctors/select')
      return data
    },
  })
}

export const useDoctorsPublic = ({
  page = 1,
  limit = 10,
  specialization = '',
  available = '',
  search = '',
}: {
  page?: number
  limit?: number
  specialization?: string
  available?: string
  search?: string
}) => {
  return useQuery<DoctorsResponse, Error>({
    queryKey: ['doctors-public', page, limit, specialization, available, search],
    queryFn: async () => {
      const { data } = await api.get<DoctorsResponse>('/doctors/public', {
        params: {
          page,
          limit,
          specialization: specialization || undefined,
          available: available || undefined,
          search: search || undefined,
        },
      })
      return data
    },
  })
}

export const useDoctorById = (id: string | null) => {
  return useQuery<Doctor, Error>({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data } = await api.get<DoctorResponse>(`/doctors/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useDoctorStats = (id: string | null) => {
  return useQuery<DoctorStatsResponse, Error>({
    queryKey: ['doctorStats', id],
    queryFn: async () => {
      const { data } = await api.get<DoctorStatsResponse>(
        `/doctors/${id}/stats`
      )
      return data
    },
    enabled: !!id,
  })
}

export const useCreateDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newDoctor: CreateDoctorRequest) =>
      api.post('/doctors', newDoctor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctorsselect'] })
    },
  })
}
export const useRegisterDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newDoctor: RegisterDoctorRequest) =>
      api.post('/doctors/register', newDoctor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctorsselect'] })
    },
  })
}

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedDoctor,
    }: {
      id: string
      updatedDoctor: UpdateDoctorRequest
    }) => api.put(`/doctors/${id}`, updatedDoctor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctorsselect'] })
    },
  })
}

export const useToggleDoctorAvailability = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/doctors/${id}/availability`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctorsselect'] })
    },
  })
}

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] })
      queryClient.invalidateQueries({ queryKey: ['doctorsselect'] })
    },
  })
}
