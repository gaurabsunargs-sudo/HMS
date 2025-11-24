import { useRef, useCallback } from 'react'
import Cookies from 'js-cookie'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { decryptData } from '@/lib/encryptionUtils'
import { useSocketChat } from '@/hooks/useSocketChat'
import { api } from '../client'

// Types (keeping your existing types)
export interface User {
  id: string | number
  username: string
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  role: string
  profile_picture?: string
  profile_picture_url?: string
  is_online?: boolean
  last_seen?: string
  is_currently_online?: boolean
  last_conversation?: {
    id: number
    last_message_at: string
    last_message?: {
      content: string
      sender_id: number
      created_at: string
      is_read: boolean
    }
  }
}

export interface Message {
  id: number | string
  conversation: number | string
  sender: User
  recipient: User
  content?: string
  image?: string
  created_at: string
  is_read: boolean
  is_optimistic?: boolean
  error?: string
}

export interface Conversation {
  id: number | string
  participants: User[]
  other_participant?: User
  last_message_at: string
  last_message?: Message
  unread_count: number
  updated_at?: string
}

export interface WebSocketMessage {
  type:
    | 'new_message'
    | 'message_sent'
    | 'conversation_updated'
    | 'messages_marked_read'
    | 'user_typing'
    | 'user_stopped_typing'
    | 'ping'
    | 'pong'
    | 'chat_message'
    | 'conversation_update'
    | 'user_connected'
  id?: string | number
  conversation_id?: number
  data?: Message
  count?: number
  user_id?: number
  sender_id?: number
  recipient_id?: number
}

export interface SendMessageParams {
  recipient_id: string | number
  conversation_id?: string | number
  content?: string
  image?: File
  user_id?: number
}

// Constants
const QUERY_KEYS = {
  conversations: ['conversations'] as const,
  conversationMessages: (id: string | number) =>
    ['conversation-messages', id] as const,
  availableUsers: ['available-users'] as const,
  searchUsers: (query: string) => ['search-users', query] as const,
} as const

const CACHE_CONFIG = {
  conversations: {
    staleTime: 30 * 1000, // 30 seconds - reduced from 5 minutes
    gcTime: 10 * 60 * 1000,
  },
  messages: {
    staleTime: 60 * 1000, // 1 minute - reduced from 10 minutes
    gcTime: 15 * 60 * 1000,
  },
  users: {
    staleTime: 2 * 60 * 1000, // 2 minutes - increased from 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes - increased from 2 minutes
  },
  search: {
    staleTime: 10 * 1000,
    gcTime: 1 * 60 * 1000,
  },
} as const

// (removed unused socket config)

// FIXED: Enhanced utility functions - EXPORTED
export const getCurrentUserId = (): number => {
  try {
    const encryptedToken = Cookies.get('hms-token')
    if (!encryptedToken) return 0

    const token = decryptData(encryptedToken) as string
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.user_id || payload.sub || payload.id || 0
  } catch (error) {
    console.error('Failed to get current user ID:', error)
    return 0
  }
}

const generateOptimisticId = (): number => {
  return -(Date.now() + Math.floor(Math.random() * 1000)) // Negative to distinguish from real IDs
}

// (removed unused debounce)
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y`
}

export const getConversationWithUser = (
  conversations: Conversation[],
  userId: string | number
): Conversation | null => {
  const conversation =
    conversations.find((conv) =>
      conv.participants.some((p) => String(p.id) === String(userId))
    ) || null

  if (conversation) {
  } else {
  }

  return conversation
}

// Utility function to get conversation ID from user ID
export const getConversationIdForUser = (
  conversations: Conversation[],
  userId: string | number
): string | number | null => {
  const conversation = getConversationWithUser(conversations, userId)
  return conversation?.id || null
}

// Socket.IO bridge using existing useSocketChat
const useWebSocketConnection = (onIncomingMessage: (message: any) => void) => {
  const {
    connected,
    sendMessage: socketSendMessage,
    markMessagesRead,
    getCurrentUserId: getSocketUserId,
  } = useSocketChat({
    onNewMessage: (message) => {
      // Get current user ID to determine the correct conversation ID
      const currentUserId = getSocketUserId()
      const senderId = String(message.senderId)
      const receiverId = String(message.receiverId)

      // Determine conversation ID based on current user's perspective
      // If current user is the sender, conversation ID is receiver's ID
      // If current user is the receiver, conversation ID is sender's ID
      const conversationId =
        String(currentUserId) === senderId ? receiverId : senderId

      // Normalize to WebSocketMessage-like object for downstream handler
      const normalizedMessage = {
        type: 'chat_message',
        data: {
          id: message.id,
          conversation: conversationId,
          sender: {
            id: senderId,
            username: message.sender?.firstName || '',
            email: '',
            first_name: message.sender?.firstName || '',
            last_name: message.sender?.lastName || '',
            role: '',
            profile_picture_url: message.sender?.profile || '',
          } as User,
          recipient: {
            id: receiverId,
            username: message.receiver?.firstName || '',
            email: '',
            first_name: message.receiver?.firstName || '',
            last_name: message.receiver?.lastName || '',
            role: '',
            profile_picture_url: message.receiver?.profile || '',
          } as User,
          content: message.content,
          created_at: message.createdAt,
          is_read: Boolean(message.isRead),
        } as Message,
        conversation_id: conversationId,
        sender_id: senderId,
        recipient_id: receiverId,
      }

      onIncomingMessage(normalizedMessage)
    },
  })

  const sendMessage = useCallback(
    (payload: any) => {
      const senderId = getSocketUserId()
      if (!senderId) return false
      if (payload?.action === 'mark_read') {
        markMessagesRead({
          senderId: payload.conversation_id,
          receiverId: senderId,
        })
        return true
      }
      if (payload?.action === 'send_message') {
        socketSendMessage({
          senderId,
          receiverId: payload.recipient_id,
          content: payload.content,
        })
        return true
      }
      return false
    },
    [socketSendMessage, markMessagesRead, getSocketUserId]
  )

  return {
    isConnected: connected,
    sendMessage,
    disconnect: () => {},
    reconnect: () => {},
  }
}

// Enhanced Cache Management Hook
const useCacheManager = () => {
  const queryClient = useQueryClient()
  const lastProcessedMessageRef = useRef<Set<string>>(new Set())
  const currentUserId = getCurrentUserId()

  const updateConversationMessages = useCallback(
    (conversationId: string | number, newMessage: Message) => {
      queryClient.setQueryData(
        QUERY_KEYS.conversationMessages(conversationId),
        (oldMessages: Message[] | undefined): Message[] => {
          if (!oldMessages) return [newMessage]

          // Handle optimistic updates - replace with real message
          // Look for optimistic messages with matching content and sender (more flexible matching)
          const optimisticIndex = oldMessages.findIndex(
            (msg) =>
              msg.is_optimistic &&
              msg.content === newMessage.content &&
              String(msg.sender.id) === String(newMessage.sender.id)
            // Remove time matching as it's unreliable for WebSocket messages
          )

          if (optimisticIndex !== -1) {
            const updatedMessages = [...oldMessages]
            updatedMessages[optimisticIndex] = {
              ...newMessage,
              is_optimistic: false,
            }
            return updatedMessages.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
          }

          // Prevent duplicates - check by ID and also by content+sender for near-duplicate detection
          if (
            oldMessages.some(
              (msg) =>
                String(msg.id) === String(newMessage.id) ||
                (msg.content === newMessage.content &&
                  String(msg.sender.id) === String(newMessage.sender.id) &&
                  !msg.is_optimistic &&
                  Math.abs(
                    new Date(msg.created_at).getTime() -
                      new Date(newMessage.created_at).getTime()
                  ) < 5000)
            )
          ) {
            return oldMessages
          }

          // Add new message and sort
          return [...oldMessages, newMessage].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
        }
      )
    },
    [queryClient]
  )

  const updateConversationsList = useCallback(
    (conversationId: string | number, lastMessage: Message) => {
      queryClient.setQueryData(
        QUERY_KEYS.conversations,
        (
          oldConversations: Conversation[] | undefined
        ): Conversation[] | undefined => {
          if (!oldConversations) return oldConversations

          return oldConversations
            .map((conversation) => {
              if (String(conversation.id) === String(conversationId)) {
                return {
                  ...conversation,
                  last_message: lastMessage,
                  last_message_at: lastMessage.created_at,
                  updated_at: lastMessage.created_at,
                  unread_count:
                    lastMessage.sender.id === currentUserId
                      ? 0
                      : (conversation.unread_count ?? 0) + 1,
                }
              }
              return conversation
            })
            .sort(
              (a, b) =>
                new Date(b.last_message_at).getTime() -
                new Date(a.last_message_at).getTime()
            )
        }
      )
    },
    [queryClient, currentUserId]
  )

  const markMessagesAsReadInCache = useCallback(
    (conversationId: string | number) => {
      queryClient.setQueryData(
        QUERY_KEYS.conversationMessages(conversationId),
        (oldMessages: Message[] | undefined): Message[] | undefined => {
          if (!oldMessages) return oldMessages
          return oldMessages.map((msg) =>
            msg.sender.id !== currentUserId ? { ...msg, is_read: true } : msg
          )
        }
      )

      queryClient.setQueryData(
        QUERY_KEYS.conversations,
        (
          oldConversations: Conversation[] | undefined
        ): Conversation[] | undefined => {
          if (!oldConversations) return oldConversations
          return oldConversations.map((conv) =>
            String(conv.id) === String(conversationId)
              ? { ...conv, unread_count: 0 }
              : conv
          )
        }
      )
    },
    [queryClient, currentUserId]
  )

  const addOptimisticMessage = useCallback(
    (
      conversationId: string | number,
      message: Omit<Message, 'id'> & { id: number }
    ) => {
      const optimisticMessage: Message = {
        ...message,
        is_optimistic: true,
      }

      updateConversationMessages(conversationId, optimisticMessage)
      updateConversationsList(conversationId, optimisticMessage)

      return optimisticMessage.id
    },
    [updateConversationMessages, updateConversationsList]
  )

  const handleWebSocketMessage = useCallback(
    (wsMessage: WebSocketMessage) => {
      // Use the actual message ID from the data for better duplicate detection
      const actualMessageId = wsMessage.data?.id
      const messageId = actualMessageId
        ? `msg-${actualMessageId}`
        : `${wsMessage.type}-${Date.now()}-${wsMessage.conversation_id}`

      // Prevent duplicate processing with time-based cleanup
      if (lastProcessedMessageRef.current.has(messageId)) {
        return
      }

      lastProcessedMessageRef.current.add(messageId)

      // Clean up old message IDs (keep only last 100)
      if (lastProcessedMessageRef.current.size > 100) {
        const messageIds = Array.from(lastProcessedMessageRef.current)
        lastProcessedMessageRef.current = new Set(messageIds.slice(-50))
      }

      switch (wsMessage.type) {
        case 'new_message':
        case 'message_sent':
        case 'chat_message':
          if (wsMessage.conversation_id && wsMessage.data) {
            // Server should always send complete user data via MessageSerializer
            // Only use fallback if sender/recipient data is completely missing
            const messageData = {
              ...wsMessage.data,
              sender: wsMessage.data.sender
                ? ({
                    ...wsMessage.data.sender,
                    // Ensure all required User fields are present
                    username:
                      wsMessage.data.sender.username ||
                      `user_${wsMessage.data.sender.id}`,
                    first_name: wsMessage.data.sender.first_name || '',
                    last_name: wsMessage.data.sender.last_name || '',
                    email: wsMessage.data.sender.email || '',
                    role: wsMessage.data.sender.role || 'user',
                  } as User)
                : ({
                    id: wsMessage.sender_id || 0,
                    username: `user_${wsMessage.sender_id || 0}`,
                    first_name: '',
                    last_name: '',
                    email: '',
                    role: 'user',
                  } as User),
              recipient: wsMessage.data.recipient
                ? ({
                    ...wsMessage.data.recipient,
                    // Ensure all required User fields are present
                    username:
                      wsMessage.data.recipient.username ||
                      `user_${wsMessage.data.recipient.id}`,
                    first_name: wsMessage.data.recipient.first_name || '',
                    last_name: wsMessage.data.recipient.last_name || '',
                    email: wsMessage.data.recipient.email || '',
                    role: wsMessage.data.recipient.role || 'user',
                  } as User)
                : ({
                    id: wsMessage.recipient_id || 0,
                    username: `user_${wsMessage.recipient_id || 0}`,
                    first_name: '',
                    last_name: '',
                    email: '',
                    role: 'user',
                  } as User),
            } as Message

            // Update the conversation messages cache using WebSocket data only
            // This prevents API calls to /chat/{conversationId}
            updateConversationMessages(wsMessage.conversation_id, messageData)
            updateConversationsList(wsMessage.conversation_id, messageData)

            // Only invalidate conversations list, not individual conversation messages
            // This prevents unnecessary API calls to /chat/{conversationId}
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.conversations,
            })

            // Don't invalidate conversation messages - let WebSocket handle real-time updates
            // This prevents API calls to /chat/{conversationId}
            // The cache is already updated above with updateConversationMessages
          }
          break

        case 'conversation_update':
          if (wsMessage.conversation_id) {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.conversations,
            })
          }
          break

        case 'messages_marked_read':
          if (wsMessage.conversation_id) {
            markMessagesAsReadInCache(wsMessage.conversation_id)
          }
          break
      }
    },
    [
      updateConversationMessages,
      updateConversationsList,
      markMessagesAsReadInCache,
      queryClient,
      currentUserId,
    ]
  )

  return {
    handleWebSocketMessage,
    addOptimisticMessage,
    markMessagesAsReadInCache,
  }
}

// Query Hooks
export const useConversations = () => {
  return useQuery({
    queryKey: QUERY_KEYS.conversations,
    queryFn: async (): Promise<Conversation[]> => {
      const { data } = await api.get('/chat/recent')
      const items = (data?.data || []) as any[]
      const conversations = items.map((row) => {
        const otherUser: User = {
          id: String(row.other_user_id),
          username: '',
          email: '',
          first_name: String(row.other_user_name || '').split(' ')[0] || '',
          last_name:
            String(row.other_user_name || '')
              .split(' ')
              .slice(1)
              .join(' ') || '',
          role: '',
          profile_picture_url: row.other_user_profile || '',
        }
        const lastMsg: Message | undefined = row.last_message_content
          ? {
              id: '0',
              conversation: String(row.other_user_id),
              sender: otherUser,
              recipient: otherUser,
              content: row.last_message_content,
              created_at: row.last_message_time,
              is_read: row.unread_count === 0,
            }
          : undefined
        const conv: Conversation = {
          id: String(row.other_user_id),
          participants: [otherUser],
          other_participant: otherUser,
          last_message_at: row.last_message_time,
          last_message: lastMsg,
          unread_count: Number(row.unread_count || 0),
          updated_at: row.last_message_time,
        }
        return conv
      })
      return conversations.sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() -
          new Date(a.last_message_at).getTime()
      )
    },
    staleTime: CACHE_CONFIG.conversations.staleTime,
    gcTime: CACHE_CONFIG.conversations.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Prevent refetch on reconnect
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false
      return failureCount < 3
    },
  })
}

export const useConversationMessages = (conversationId?: number | string) => {
  return useQuery({
    queryKey: conversationId
      ? QUERY_KEYS.conversationMessages(String(conversationId))
      : [],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId) throw new Error('Conversation ID is required')
      const { data } = await api.get(`/chat/${conversationId}`)
      const raw = (data?.data || []) as any[]
      const messages: Message[] = raw.map((m) => ({
        id: String(m.id),
        conversation: String(conversationId),
        sender: {
          id: String(m.senderId || m.sender?.id),
          username: '',
          email: '',
          first_name: m.sender?.firstName || '',
          last_name: m.sender?.lastName || '',
          role: '',
          profile_picture_url: m.sender?.profile || '',
        } as User,
        recipient: {
          id: String(m.receiverId || m.receiver?.id),
          username: '',
          email: '',
          first_name: m.receiver?.firstName || '',
          last_name: m.receiver?.lastName || '',
          role: '',
          profile_picture_url: m.receiver?.profile || '',
        } as User,
        content: m.content,
        created_at: m.createdAt,
        is_read: Boolean(m.isRead),
      }))
      return messages.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    },
    enabled: !!conversationId,
    staleTime: CACHE_CONFIG.messages.staleTime,
    gcTime: CACHE_CONFIG.messages.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Prevent refetch on reconnect
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403)
        return false
      return failureCount < 3
    },
  })
}

export const useAvailableUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.availableUsers,
    queryFn: async (): Promise<User[]> => {
      const { data } = await api.get('/chat/chat/users')
      const users = (data?.data?.users || []) as any[]
      return users.map((u) => ({
        id: String(u.id),
        username: u.email || '',
        email: u.email || '',
        first_name: u.firstName || '',
        last_name: u.lastName || '',
        role: u.role || '',
        profile_picture_url: u.profile || '',
        is_currently_online: Boolean(u.isCurrentlyOnline),
        last_seen: u.lastSeen,
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - increased from 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - increased from 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Prevent refetch on reconnect
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false
      return failureCount < 2 // Reduced retry attempts
    },
  })
}

// Add a new hook for fetching a single user by ID
export const useUserById = (userId?: string | number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<User> => {
      if (!userId) throw new Error('User ID is required')
      const { data } = await api.get(`/users/${userId}`)
      const user = data?.data
      return {
        id: String(user.id),
        username: user.email || '',
        email: user.email || '',
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        role: user.role || '',
        profile_picture_url: user.profile || '',
        is_currently_online: Boolean(user.isCurrentlyOnline),
        last_seen: user.lastSeen,
      }
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 404)
        return false
      return failureCount < 2
    },
  })
}

export const useSearchUsers = (searchQuery: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.searchUsers(searchQuery),
    queryFn: async (): Promise<User[]> => {
      if (!searchQuery.trim()) return []
      const { data } = await api.get(
        `/messaging/search-users/?q=${encodeURIComponent(searchQuery)}`
      )
      return (data.results || data) as User[]
    },
    enabled: !!searchQuery.trim() && searchQuery.length > 2,
    staleTime: CACHE_CONFIG.search.staleTime,
    gcTime: CACHE_CONFIG.search.gcTime,
  })
}

// Mutation Hooks
export const useSendMessage = () => {
  const { addOptimisticMessage } = useCacheManager()
  const currentUserId = getCurrentUserId()
  const socket = useSocketChat()

  return useMutation({
    mutationFn: async (params: SendMessageParams): Promise<Message> => {
      if (!params.image && params.content) {
        const senderId = socket.getCurrentUserId()
        if (senderId) {
          socket.sendMessage({
            senderId,
            receiverId: params.recipient_id,
            content: params.content,
          })
          return {
            id: generateOptimisticId(),
            conversation:
              (params.conversation_id as any) || String(params.recipient_id),
            sender: { id: senderId } as any,
            recipient: { id: params.recipient_id } as any,
            content: params.content,
            created_at: new Date().toISOString(),
            is_read: false,
            is_optimistic: true,
          }
        }
      }
      const { data } = await api.post('/chat/send', {
        receiverId: params.recipient_id,
        content: params.content,
      })
      const m = data?.data
      return {
        id: String(m.id),
        conversation: String(m.receiverId),
        sender: {
          id: String(m.sender?.id ?? m.senderId),
          username: '',
          email: '',
          first_name: m.sender?.firstName || '',
          last_name: m.sender?.lastName || '',
          role: '',
          profile_picture_url: m.sender?.profile || '',
        } as User,
        recipient: {
          id: String(m.receiver?.id ?? m.receiverId),
          username: '',
          email: '',
          first_name: m.receiver?.firstName || '',
          last_name: m.receiver?.lastName || '',
          role: '',
          profile_picture_url: m.receiver?.profile || '',
        } as User,
        content: m.content,
        created_at: m.createdAt,
        is_read: Boolean(m.isRead),
      }
    },
    onMutate: async (variables) => {
      if (variables.conversation_id && (variables.content || variables.image)) {
        const optimisticMessage = {
          id: generateOptimisticId(),
          conversation: variables.conversation_id,
          sender: {
            id: currentUserId,
            username: 'You',
            first_name: 'You',
            last_name: '',
            email: '',
            role: '',
          } as User,
          recipient: { id: variables.recipient_id } as User,
          content: variables.content,
          image: variables.image
            ? URL.createObjectURL(variables.image)
            : undefined,
          created_at: new Date().toISOString(),
          is_read: false,
        }

        const optimisticId = addOptimisticMessage(
          variables.conversation_id,
          optimisticMessage
        )
        return { optimisticId, conversationId: variables.conversation_id }
      }
    },
    onSuccess: (data) => {
      // The optimistic message will be replaced by the WebSocket broadcast
      // or we can manually trigger the replacement here if needed
    },
    onError: (error) => {
      console.error('❌ Failed to send message:', error)
      // Could implement retry logic or mark message as failed
    },
  })
}

export const useMarkMessagesRead = () => {
  const { markMessagesAsReadInCache } = useCacheManager()
  const socket = useSocketChat()

  return useMutation({
    mutationFn: async (conversationId: number): Promise<void> => {
      // conversationId maps to other user's id
      const currentUserId = getCurrentUserId()
      if (currentUserId) {
        socket.markMessagesRead({
          senderId: conversationId,
          receiverId: currentUserId,
        })
      }
      await api.put(`/chat/${conversationId}/read`)
    },
    onMutate: (conversationId) => {
      markMessagesAsReadInCache(conversationId)
    },
    onError: (error) => {
      console.error('Failed to mark messages as read:', error)
    },
  })
}

// Enhanced Main Messaging Hook
export const useMessaging = () => {
  const { handleWebSocketMessage, addOptimisticMessage } = useCacheManager()
  const conversations = useConversations()
  const sendMessageMutation = useSendMessage()
  const markReadMutation = useMarkMessagesRead()

  const {
    isConnected,
    sendMessage: sendWebSocketMessage,
    reconnect,
  } = useWebSocketConnection(handleWebSocketMessage)

  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      const userdata = Cookies.get('hms-user')
      const user = decryptData(userdata) || '{}'
      const user_id = user.id

      // For images, use HTTP API (not supported in socket route)
      if (params.image) {
        try {
          return await sendMessageMutation.mutateAsync({
            ...params,
            user_id: user_id,
          })
        } catch (error) {
          console.error('❌ HTTP image send failed:', error)
          throw error
        }
      }

      // For text messages, use WebSocket for real-time updates
      // Add optimistic message first for immediate UI feedback
      let optimisticId: string | number | undefined
      if (
        params.conversation_id !== undefined &&
        params.conversation_id !== null
      ) {
        const optimisticMessage = {
          id: generateOptimisticId(),
          conversation: params.conversation_id,
          sender: {
            id: getCurrentUserId(),
            username: 'You',
            first_name: 'You',
            last_name: '',
            email: '',
            role: '',
          } as User,
          recipient: { id: params.recipient_id } as User,
          content: params.content,
          created_at: new Date().toISOString(),
          is_read: false,
        }

        const convKey =
          typeof params.conversation_id === 'number'
            ? params.conversation_id
            : Number.isFinite(Number(params.conversation_id))
              ? Number(params.conversation_id)
              : 'new'
        optimisticId = addOptimisticMessage(convKey, optimisticMessage)
      } else {
      }

      const wsSuccess = sendWebSocketMessage({
        action: 'send_message',
        recipient_id: params.recipient_id,
        conversation_id: params.conversation_id,
        content: params.content || '',
        user_id: user_id,
      })

      if (wsSuccess) {
        // Return a mock response for compatibility
        return {
          id: optimisticId || Date.now(),
          content: params.content || '',
          conversation: params.conversation_id,
        } as Message
      } else {
        try {
          return await sendMessageMutation.mutateAsync(params)
        } catch (error) {
          console.error('❌ HTTP fallback send failed:', error)
          throw error
        }
      }
    },
    [sendMessageMutation, sendWebSocketMessage, addOptimisticMessage]
  )
  const markMessagesAsRead = useCallback(
    async (conversationId: string | number) => {
      const wsSuccess = sendWebSocketMessage({
        action: 'mark_read',
        conversation_id: conversationId,
      })

      try {
        await markReadMutation.mutateAsync(conversationId as any)
      } catch (error) {
        console.error('Mark messages read failed:', error)
      }

      return wsSuccess
    },
    [sendWebSocketMessage, markReadMutation]
  )

  const retryConnection = useCallback(() => {
    if (!isConnected) {
      reconnect()
    }
  }, [isConnected, reconnect])

  return {
    conversations: conversations.data || [],
    isLoading: conversations.isLoading,
    isError: conversations.isError,
    error: conversations.error,
    isConnected,
    retryConnection,
    sendMessage,
    sendWebSocketMessage, // Add WebSocket message sending
    markMessagesAsRead,
    isSending: sendMessageMutation.isPending,
    sendError: sendMessageMutation.error,
    isMarkingRead: markReadMutation.isPending,
  }
}

// Additional hooks for prediction features
export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { participant_ids: number[] }) => {
      const response = await api.post('/messaging/conversations/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations })
    },
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      conversation_id: number
      recipient_id: number
      content: string
    }) => {
      const response = await api.post('/messaging/messages/', data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.conversationMessages(variables.conversation_id),
      })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations })
    },
  })
}
