import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Appointment,
  AppointmentsResponse,
  AppointmentResponse,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
} from '@/schema/appointments-schema'
import { api } from '../client'

export const useAppointments = ({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery<AppointmentsResponse, Error>({
    queryKey: ['appointments', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get<AppointmentsResponse>('/appointments', {
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

export const useAppointmentById = (id: string | null) => {
  return useQuery<Appointment, Error>({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const { data } = await api.get<AppointmentResponse>(`/appointments/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newAppointment: CreateAppointmentRequest) =>
      api.post('/appointments', newAppointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedAppointment,
    }: {
      id: string
      updatedAppointment: UpdateAppointmentRequest
    }) => api.put(`/appointments/${id}`, updatedAppointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
