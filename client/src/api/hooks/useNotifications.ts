import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  NotificationsResponse,
  CreateNotificationRequest,
} from '@/schema/notifications-schema'
import { api } from '../client'

export const useNotifications = ({
  page = 1,
  limit = 10,
  unreadOnly = false,
}: {
  page?: number
  limit?: number
  unreadOnly?: boolean
}) => {
  return useQuery<NotificationsResponse, Error>({
    queryKey: ['notifications', page, limit, unreadOnly],
    queryFn: async () => {
      const { data } = await api.get<NotificationsResponse>('/notifications', {
        params: {
          page,
          limit,
          unreadOnly,
        },
      })
      return data
    },
  })
}

export const useUnreadNotificationCount = () => {
  return useQuery<{ count: number }, Error>({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count')
      return data
    },
  })
}

export const useCreateNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notification: CreateNotificationRequest) =>
      api.post('/notifications', notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}
