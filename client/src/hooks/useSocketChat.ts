import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Cookies from 'js-cookie'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { serverUrlSocket, serverUrl } from '@/api/server-url'
import { decryptData } from '@/lib/encryptionUtils'

// Import QUERY_KEYS from messaging hook
const QUERY_KEYS = {
  availableUsers: ['available-users'] as const,
} as const

type MessageHandler = (message: any) => void

interface UseSocketChatOptions {
  onNewMessage?: MessageHandler
  onMessageSent?: MessageHandler
  onMessagesRead?: MessageHandler
  onUserTyping?: (data: { userId: number; typing: boolean }) => void
  onUserOnline?: (data: { userId: number; lastSeen?: string }) => void
  onUserOffline?: (data: { userId: number; lastSeen?: string }) => void
  onOnlineUsersList?: (userIds: Array<string | number>) => void
}

const DEFAULT_SOCKET_BASE = 'http://localhost:5000'

function deriveSocketBaseUrl() {
  // Check if we have a specific socket URL from environment
  if (serverUrlSocket && serverUrlSocket.trim()) {
    try {
      const url = new URL(serverUrlSocket)
      return url.origin
    } catch (error) {}
  }

  // Fallback to API base URL without /api suffix
  if (serverUrl && serverUrl.trim()) {
    try {
      const url = new URL(serverUrl)
      return url.origin
    } catch (error) {}
  }

  // Final fallback
  return DEFAULT_SOCKET_BASE
}

export function useSocketChat(options: UseSocketChatOptions = {}) {
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const isConnectingRef = useRef(false)

  const baseUrl = useMemo(() => deriveSocketBaseUrl(), [])

  const getCurrentUserId = useCallback(() => {
    try {
      const userData = decryptData(Cookies.get('hms-user')) as any
      const userId = userData?.id ?? null
      return userId
    } catch (error) {
      console.error('❌ Failed to extract user ID:', error)
      return null
    }
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setConnected(false)
    }
    isConnectingRef.current = false
  }, [])

  const connect = useCallback(() => {
    // Prevent multiple concurrent connections
    if (socketRef.current?.connected || isConnectingRef.current) {
      return
    }

    isConnectingRef.current = true

    const socketBase = baseUrl || DEFAULT_SOCKET_BASE

    // Create socket instance
    const socket = io(socketBase, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: '/socket.io',
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      isConnectingRef.current = false

      const userId = getCurrentUserId()
      if (userId) {
        socket.emit('join-user', userId)
      }
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error)
      isConnectingRef.current = false
      setConnected(false)
    })

    socket.on('disconnect', (reason) => {
      setConnected(false)
      isConnectingRef.current = false
    })

    socket.on('error', (error) => {
      console.error('❌ Socket.IO general error:', error)
    })

    // Set up message handlers
    socket.on('new-message', (message) => {
      options.onNewMessage?.(message)
      // Auto-invalidate queries for real-time update on receiver side
      try {
        const senderId = String(message?.senderId ?? '')
        const receiverId = String(message?.receiverId ?? '')
        const currentUserId = getCurrentUserId()

        // Determine the conversation ID for both sender and receiver
        // For sender: conversation ID = receiver's ID
        // For receiver: conversation ID = sender's ID
        const senderConversationId = receiverId
        const receiverConversationId = senderId

        // Invalidate conversation messages for both perspectives
        if (senderConversationId) {
          queryClient.invalidateQueries({
            queryKey: ['conversation-messages', senderConversationId],
          })
        }
        if (receiverConversationId) {
          queryClient.invalidateQueries({
            queryKey: ['conversation-messages', receiverConversationId],
          })
        }

        // Only invalidate conversations list, not available users
        // This prevents unnecessary API calls to /chat/chat/users
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      } catch (err) {
        console.error('Error invalidating queries:', err)
      }
    })

    socket.on('message-sent', (message) => {
      options.onMessageSent?.(message)
      options.onNewMessage?.(message)

      // Also invalidate queries for message-sent events
      try {
        const senderId = String(message?.senderId ?? '')
        const receiverId = String(message?.receiverId ?? '')
        const currentUserId = getCurrentUserId()

        // Determine the conversation ID for both sender and receiver
        const senderConversationId = receiverId
        const receiverConversationId = senderId

        // Invalidate conversation messages for both perspectives
        if (senderConversationId) {
          queryClient.invalidateQueries({
            queryKey: ['conversation-messages', senderConversationId],
          })
        }
        if (receiverConversationId) {
          queryClient.invalidateQueries({
            queryKey: ['conversation-messages', receiverConversationId],
          })
        }

        // Only invalidate conversations list, not available users
        queryClient.invalidateQueries({ queryKey: ['conversations'] })
      } catch (err) {
        console.error('Error invalidating queries:', err)
      }
    })

    socket.on('message-update', (data) => {
      if (data.type === 'new_message') {
        options.onNewMessage?.(data.message)

        // Invalidate queries for message-update events
        try {
          const senderId = String(data.message?.senderId ?? data.senderId ?? '')
          const receiverId = String(
            data.message?.receiverId ?? data.receiverId ?? ''
          )
          const currentUserId = getCurrentUserId()

          // Determine the conversation ID for both sender and receiver
          const senderConversationId = receiverId
          const receiverConversationId = senderId

          // For conversation messages, we need to invalidate using the conversation ID
          if (senderConversationId) {
            queryClient.invalidateQueries({
              queryKey: ['conversation-messages', senderConversationId],
            })
          }

          // Also invalidate for the sender's perspective
          if (receiverConversationId) {
            queryClient.invalidateQueries({
              queryKey: ['conversation-messages', receiverConversationId],
            })
          }

          // Only invalidate conversations list, not available users
          queryClient.invalidateQueries({ queryKey: ['conversations'] })
        } catch (err) {
          console.error('Error invalidating queries:', err)
        }
      }
    })

    socket.on('messages-read', (data) => {
      options.onMessagesRead?.(data)
    })

    socket.on('user-typing', (data) => {
      options.onUserTyping?.(data)
    })

    socket.on('user-online', (data) => {
      options.onUserOnline?.(data)
      // Don't invalidate users query on every online/offline event
      // This causes too many API calls. Instead, let the UI handle real-time updates
      // through the socket events themselves
    })

    socket.on('user-offline', (data) => {
      options.onUserOffline?.(data)
      // Don't invalidate users query on every online/offline event
      // This causes too many API calls. Instead, let the UI handle real-time updates
      // through the socket events themselves
    })

    socket.on('online-users-list', (list: Array<string | number>) => {
      options.onOnlineUsersList?.(list)
    })
  }, [baseUrl, getCurrentUserId, queryClient])

  const sendMessage = useCallback(
    (data: {
      senderId: string | number
      receiverId: string | number
      content: string
    }) => {
      if (!socketRef.current?.connected) {
        console.warn('⚠️ Socket not connected, cannot send message')
        return
      }
      socketRef.current.emit('send-message', data)
    },
    []
  )

  const typingStart = useCallback(
    (data: { senderId: string | number; receiverId: string | number }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('typing-start', data)
      }
    },
    []
  )

  const typingStop = useCallback(
    (data: { senderId: string | number; receiverId: string | number }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('typing-stop', data)
      }
    },
    []
  )

  const markMessagesRead = useCallback(
    (data: { senderId: string | number; receiverId: string | number }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('mark-messages-read', data)
      }
    },
    []
  )

  const requestOnlineUsers = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get-online-users')
    }
  }, [])

  // Effect to manage connection
  useEffect(() => {
    // Only connect if not already connected
    if (!socketRef.current?.connected && !isConnectingRef.current) {
      connect()
    }

    // Cleanup function
    return () => {
      disconnect()
    }
  }, [baseUrl]) // Only depend on baseUrl, not the functions

  return {
    connected,
    socket: socketRef.current,
    connect,
    disconnect,
    sendMessage,
    typingStart,
    typingStop,
    markMessagesRead,
    getCurrentUserId,
    requestOnlineUsers,
  }
}
