// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Search,
  MessageCircle,
  Users,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useAvailableUsers,
  useMessaging,
  User,
  Conversation,
  formatMessageTime,
  getConversationWithUser,
} from '../../api/hooks/useMessaging'
import { getCurrentUserId } from '../../api/hooks/useMessaging'
import { serverImageUrl } from '../../api/server-url'
import { UserSearch } from './UserSearch'

interface ChatSidebarProps {
  selectedUserId?: string | number
  selectedConversationId?: string | number
  onUserSelect: (user: User, conversationId?: string | number) => void
  onConversationSelect: (conversation: Conversation) => void
}

const getProfilePictureUrl = (user: User): string | null => {
  const url = user.profile_picture_url || user.profile_picture
  if (!url) return null

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/media/') || url.startsWith('/')) {
    const baseUrl = serverImageUrl
    return `${baseUrl}${url}`
  }

  return url
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedUserId,
  selectedConversationId,
  onUserSelect,
  onConversationSelect,
}) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>(
    'conversations'
  )

  const {
    data,
    isLoading: usersLoading,
    error: usersError,
  } = useAvailableUsers()

  const availableUsers = useMemo(() => data ?? [], [data])

  const {
    conversations,
    isLoading: conversationsLoading,
    isError: conversationsError,
    error: conversationsErrorDetails,
    isConnected,
    retryConnection,
  } = useMessaging()

  const filteredUsers = useMemo<User[]>(() => {
    if (!searchTerm) return availableUsers
    const searchLower = searchTerm.toLowerCase()
    return availableUsers.filter(
      (user: User) =>
        (user.first_name &&
          user.first_name.toLowerCase().includes(searchLower)) ||
        (user.last_name &&
          user.last_name.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
    )
  }, [availableUsers, searchTerm])

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations
    const searchLower = searchTerm.toLowerCase()
    return conversations.filter((conv: Conversation) => {
      const participant = conv.other_participant
      if (!participant) return false

      return (
        (participant.first_name &&
          participant.first_name.toLowerCase().includes(searchLower)) ||
        (participant.last_name &&
          participant.last_name.toLowerCase().includes(searchLower)) ||
        (participant.username &&
          participant.username.toLowerCase().includes(searchLower)) ||
        (conv.last_message?.content &&
          conv.last_message.content.toLowerCase().includes(searchLower))
      )
    })
  }, [conversations, searchTerm])

  const handleUserClick = useCallback(
    (user: User) => {
      const existingConversation = getConversationWithUser(
        conversations,
        user.id
      )
      const targetId = String(user?.id || '')
      if (!targetId) return

      navigate({ to: `/dashboard/chat/${targetId}` })

      onUserSelect(user, existingConversation?.id)
    },
    [conversations, onUserSelect, navigate]
  )

  const handleConversationClick = useCallback(
    (conversation: Conversation) => {
      if (conversation.other_participant) {
        const targetId = String(conversation.other_participant?.id || '')
        if (!targetId) return

        navigate({ to: `/dashboard/chat/${targetId}` })

        onConversationSelect(conversation)
      }
    },
    [onConversationSelect, navigate]
  )

  const getUserInitials = useCallback((user: User) => {
    if (!user) return '??'

    return (
      `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
      '??'
    )
  }, [])

  const getUserDisplayName = useCallback((user: User) => {
    if (!user) return 'Unknown User'

    return (
      `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
      user.username ||
      'Unknown User'
    )
  }, [])

  const getLastMessagePreview = useCallback(
    (conversation: Conversation) => {
      if (!conversation.last_message) return 'No messages yet'

      const { content, image, sender } = conversation.last_message
      const isOwnMessage = String(sender.id) === String(selectedUserId)

      if (image && !content) {
        return isOwnMessage ? 'You sent an image' : 'Sent an image'
      }

      if (content) {
        const prefix = isOwnMessage ? 'You: ' : ''
        return `${prefix}${content.length > 30 ? content.substring(0, 30) + '...' : content}`
      }

      return 'No messages yet'
    },
    [selectedUserId]
  )

  const currentUserId = useMemo(() => String(getCurrentUserId()), [])

  const renderUserItem = useCallback(
    (user: User, isFromConversation = false, conversation?: Conversation) => {
      if (!user) return null

      const isSelected = String(selectedUserId) === String(user.id)
      const unreadCount = Math.ceil((conversation?.unread_count ?? 0) / 2)
      const lastMessage = conversation?.last_message

      return (
        <div
          key={`${isFromConversation ? 'conv' : 'user'}-${user.id}`}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all duration-200',
            'hover:bg-accent hover:shadow-sm',
            isSelected && 'bg-primary/10 border-primary/20 border shadow-sm'
          )}
          onClick={() => {
            if (isFromConversation && conversation) {
              handleConversationClick(conversation)
            } else {
              handleUserClick(user)
            }
          }}
        >
          <div className='relative'>
            <Avatar className='h-10 w-10'>
              <AvatarImage
                className='object-cover object-top'
                src={getProfilePictureUrl(user)}
                alt={getUserDisplayName(user)}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextSibling as HTMLElement
                  if (fallback) {
                    fallback.style.display = 'flex'
                  }
                }}
              />
              <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>

            {/* Role indicator */}
            {user.role === 'doctor' && (
              <div className='absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white'>
                Dr
              </div>
            )}

            {/* Online status indicator - only show if user is actually online */}
            {user.is_currently_online && (
              <div className='absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400' />
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between'>
              <h4 className='text-foreground truncate text-sm font-medium'>
                {getUserDisplayName(user)}
              </h4>
              {lastMessage && (
                <span className='text-muted-foreground ml-2 flex-shrink-0 text-xs'>
                  {formatMessageTime(lastMessage.created_at)}
                </span>
              )}
            </div>

            <div className='mt-1 flex items-center justify-between'>
              <p className='text-muted-foreground text-xs capitalize'>
                {user.role}
              </p>
              {unreadCount > 0 &&
                String(conversation?.last_message?.sender.id) !==
                  currentUserId && (
                  <Badge
                    variant='default'
                    className='absolute right-4 flex !h-[20px] !w-[20px] min-w-[20px] items-center justify-center rounded-full !p-0 text-xs font-medium'
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
            </div>

            {isFromConversation && conversation && (
              <p className='text-muted-foreground mt-1 truncate text-xs'>
                {getLastMessagePreview(conversation)}
              </p>
            )}
          </div>
        </div>
      )
    },
    [
      selectedUserId,
      getUserDisplayName,
      getUserInitials,
      handleConversationClick,
      handleUserClick,
      getLastMessagePreview,
      currentUserId,
    ]
  )

  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <Alert className='mb-3'>
          <WifiOff className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span className='text-xs'>Reconnecting...</span>
            <Button
              variant='outline'
              size='sm'
              onClick={retryConnection}
              className='h-6 px-2 text-xs'
            >
              <RefreshCw className='h-3 w-3' />
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
    return null
  }

  const renderContent = () => {
    if (activeTab === 'conversations') {
      if (conversationsLoading) {
        return (
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground flex items-center gap-2'>
              <RefreshCw className='h-4 w-4 animate-spin' />
              <span className='text-sm'>Loading conversations...</span>
            </div>
          </div>
        )
      }

      if (conversationsError) {
        return (
          <div className='p-4'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Failed to load conversations. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        )
      }

      if (filteredConversations.length === 0) {
        return (
          <div className='px-4 py-8 text-center'>
            <MessageCircle className='text-muted-foreground/50 mx-auto mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-sm'>
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <p className='text-muted-foreground/70 mt-1 text-xs'>
                Start a new chat to begin messaging
              </p>
            )}
          </div>
        )
      }

      return (
        <div className='space-y-1'>
          {filteredConversations.map(
            (conversation) =>
              conversation.other_participant &&
              renderUserItem(conversation.other_participant, true, conversation)
          )}
        </div>
      )
    } else {
      if (usersLoading) {
        return (
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground flex items-center gap-2'>
              <RefreshCw className='h-4 w-4 animate-spin' />
              <span className='text-sm'>Loading users...</span>
            </div>
          </div>
        )
      }

      if (usersError) {
        return (
          <div className='p-4'>
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Failed to load users. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        )
      }

      if (filteredUsers.length === 0) {
        return (
          <div className='px-4 py-8 text-center'>
            <Users className='text-muted-foreground/50 mx-auto mb-2 h-8 w-8' />
            <p className='text-muted-foreground text-sm'>
              {searchTerm ? 'No users found' : 'No users available'}
            </p>
          </div>
        )
      }

      return (
        <div className='space-y-1'>
          {filteredUsers
            .filter((u) => !!u && !!String(u.id))
            .map((user) => renderUserItem(user, false))}
        </div>
      )
    }
  }

  return (
    <div className='bg-card flex h-full w-80 flex-col border-r'>
      {/* Header */}
      <div className='space-y-3 border-b p-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-foreground flex items-center gap-2 text-lg font-semibold'>
            <MessageCircle className='h-5 w-5' />
            Messages
          </h2>
          <div className='flex items-center gap-1'>
            {isConnected ? (
              <Wifi className='h-4 w-4 text-green-500' />
            ) : (
              <WifiOff className='h-4 w-4 text-orange-500' />
            )}
          </div>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
          <Input
            placeholder='Search conversations...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Tabs */}
        <div className='bg-muted flex rounded-lg p-1'>
          <Button
            variant={activeTab === 'conversations' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 flex-1 text-xs'
            onClick={() => setActiveTab('conversations')}
          >
            <Clock className='mr-1 h-3 w-3' />
            Recent
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            size='sm'
            className='h-8 flex-1 text-xs'
            onClick={() => setActiveTab('users')}
          >
            <Users className='mr-1 h-3 w-3' />
            All Users
          </Button>
        </div>

        {/* Connection Status */}
        {renderConnectionStatus()}

        {/* Start New Chat */}
        <UserSearch onUserSelect={handleUserClick} />
      </div>

      {/* Content */}
      <ScrollArea className='flex-1'>
        <div className='p-2'>{renderContent()}</div>
      </ScrollArea>
    </div>
  )
}
