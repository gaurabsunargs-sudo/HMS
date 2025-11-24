import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  UsersResponse,
  UserResponse,
  UpdateUserRequest,
} from '@/schema/users-schema'
import { api } from '../client'

export const useUsers = ({
  page = 1,
  limit = 10,
  role = '',
  status = '',
  search = '',
}: {
  page?: number
  limit?: number
  role?: string
  status?: string
  search?: string
}) => {
  return useQuery<UsersResponse, Error>({
    queryKey: ['users', page, limit, role, status, search],
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>('/users', {
        params: {
          page,
          limit,
          role: role || undefined,
          status: status || undefined,
          search: search || undefined,
        },
      })
      return data
    },
  })
}
export const useGetUsersWithoutProfiles = () => {
  return useQuery<UsersResponse, Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>('/auth/users')
      return data
    },
  })
}

export const useUserById = (id: string | null) => {
  return useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await api.get<UserResponse>(`/users/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

// Chat-specific user data hook (for authenticated users, not admin-only)
export const useUserByIdForChat = (id: string | null) => {
  return useQuery<User, Error>({
    queryKey: ['chat-user', id],
    queryFn: async () => {
      const { data } = await api.get<UserResponse>(`/chat/user/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedUser,
    }: {
      id: string
      updatedUser: UpdateUserRequest
    }) => api.put(`/users/${id}`, updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      api.patch(`/users/${userId}/password`, { password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
