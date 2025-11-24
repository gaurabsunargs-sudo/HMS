import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Schedule,
  SchedulesResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '@/schema/schedules-schema'
import { api } from '../client'

export const useSchedules = ({
  doctorId,
  startDate,
  endDate,
}: {
  doctorId?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery<SchedulesResponse, Error>({
    queryKey: ['schedules', doctorId, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<SchedulesResponse>('/schedules', {
        params: {
          doctorId,
          startDate,
          endDate,
        },
      })
      return data
    },
  })
}

export const useDoctorSchedule = (doctorId: string | null, date?: string) => {
  return useQuery<Schedule[], Error>({
    queryKey: ['doctorSchedule', doctorId, date],
    queryFn: async () => {
      const { data } = await api.get(`/schedules/doctor/${doctorId}`, {
        params: { date },
      })
      return data.data
    },
    enabled: !!doctorId,
  })
}

export const useAvailableSlots = ({
  doctorId,
  date,
}: {
  doctorId: string | null
  date: string | null
}) => {
  return useQuery<string[], Error>({
    queryKey: ['availableSlots', doctorId, date],
    queryFn: async () => {
      const { data } = await api.get('/schedules/available-slots', {
        params: { doctorId, date },
      })
      return data.data
    },
    enabled: !!doctorId && !!date,
  })
}

export const useCreateSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newSchedule: CreateScheduleRequest) =>
      api.post('/schedules', newSchedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['doctorSchedule'] })
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] })
    },
  })
}

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedSchedule,
    }: {
      id: string
      updatedSchedule: UpdateScheduleRequest
    }) => api.put(`/schedules/${id}`, updatedSchedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['doctorSchedule'] })
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] })
    },
  })
}

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['doctorSchedule'] })
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] })
    },
  })
}
