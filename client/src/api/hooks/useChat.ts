import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'

export interface ChatUser {
  id: number | string
  firstName: string
  lastName: string
  email?: string
  profile?: string | null
  role?: string
}

export interface RecentChatItem {
  other_user_id: number
  other_user_name: string
  other_user_profile?: string | null
  last_message_content: string
  last_message_time: string
  unread_count: number
}

export interface ChatMessage {
  id: number
  content: string
  createdAt: string
  isRead: boolean
  senderId: number
  receiverId: number
  sender: {
    id: number
    firstName: string
    lastName: string
    profile?: string | null
  }
  receiver: {
    id: number
    firstName: string
    lastName: string
    profile?: string | null
  }
}

export const useChatRecent = () => {
  return useQuery<{ success: boolean; data: RecentChatItem[] }, Error>({
    queryKey: ['chat', 'recent'],
    queryFn: async () => {
      const { data } = await api.get('/chat/recent')
      return data
    },
    staleTime: 10_000,
  })
}

export const useChatUnreadCount = () => {
  return useQuery<{ success: boolean; data: { unreadCount: number } }, Error>({
    queryKey: ['chat', 'unreadCount'],
    queryFn: async () => {
      const { data } = await api.get('/chat/unread/count')
      return data
    },
    staleTime: 5_000,
  })
}

export const useChatUsers = ({
  page = 1,
  limit = 50,
  search = '',
}: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery<
    {
      success: boolean
      data: {
        users: ChatUser[]
        total: number
        page: number
        limit: number
        pages: number
      }
    },
    Error
  >({
    queryKey: ['chat', 'users', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get('/chat/chat/users', {
        params: { page, limit, search: search || undefined },
      })
      return data
    },
    staleTime: 10_000,
  })
}

export const useChatMessages = (userId: string | number | null) => {
  return useQuery<{ success: boolean; data: ChatMessage[] }, Error>({
    queryKey: ['chat', 'messages', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Missing user id')
      const { data } = await api.get(`/chat/${userId}`)
      return data
    },
    enabled: !!userId,
    staleTime: 0,
  })
}

export const useMarkChatRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string | number) => {
      const { data } = await api.put(`/chat/${userId}/read`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'unreadCount'] })
      queryClient.invalidateQueries({ queryKey: ['chat', 'recent'] })
    },
  })
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      receiverId: number | string
      content: string
    }) => {
      const { data } = await api.post('/chat/send', payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', String(variables.receiverId)],
      })
      queryClient.invalidateQueries({ queryKey: ['chat', 'recent'] })
    },
  })
}
