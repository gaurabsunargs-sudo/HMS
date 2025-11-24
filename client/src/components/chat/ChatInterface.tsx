// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Cookies from 'js-cookie'
import {
  Send,
  Image,
  Paperclip,
  MoreVertical,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  CheckCheck,
  Check,
  Clock,
} from 'lucide-react'
import { decryptData } from '@/lib/encryptionUtils'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useConversationMessages,
  useMessaging,
  User,
  Message,
  formatMessageTime,
} from '../../api/hooks/useMessaging'
import { serverImageUrl } from '../../api/server-url'
import { validateMessage } from '../../utils/emoji-suggestion'

const getCurrentUserId = (): string => {
  try {
    const userData = decryptData(Cookies.get('hms-user')) as any
    const userId = userData?.id ?? ''
    return String(userId)
  } catch (error) {
    console.error('❌ Failed to extract user ID from hms-user:', error)
    return ''
  }
}

interface ChatInterfaceProps {
  selectedUser?: User
  conversationId?: number
  onBack?: () => void
  expectingUser?: boolean
  isLoadingUser?: boolean
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

const ProfileAvatar = React.memo<{
  user: User
  size?: 'small' | 'default' | 'large'
}>(({ user, size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-10 w-10',
  }

  const profilePictureUrl = useMemo(() => getProfilePictureUrl(user), [user])
  const hasProfilePicture = Boolean(profilePictureUrl)

  const userInitials = useMemo(() => {
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    return (
      `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      'U'
    )
  }, [user.first_name, user.last_name, user.username])

  const displayName = useMemo(() => {
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    return `${firstName} ${lastName}`.trim() || user.username || 'Unknown User'
  }, [user.first_name, user.last_name, user.username])

  return (
    <Avatar className={cn(sizeClasses[size], 'flex-shrink-0')}>
      {hasProfilePicture ? (
        <>
          <AvatarImage
            src={profilePictureUrl!}
            alt={displayName}
            className='object-cover object-top'
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextSibling as HTMLElement
              if (fallback) {
                fallback.style.display = 'flex'
              }
            }}
          />
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-medium'>
            {userInitials}
          </AvatarFallback>
        </>
      ) : (
        <AvatarFallback className='bg-primary/10 text-primary text-xs font-medium'>
          {userInitials}
        </AvatarFallback>
      )}
    </Avatar>
  )
})

ProfileAvatar.displayName = 'ProfileAvatar'

function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(id)
  }, [interval])

  return now
}

const MessageItem = React.memo<{
  message: Message
  currentUserId: string
  sendError: any
  onRetryMessage: (messageId: number) => void
}>(({ message, currentUserId, sendError, onRetryMessage }) => {
  useNow(1000)

  const isOwnMessage = String(message.sender.id) === String(currentUserId)
  const messageTime = formatMessageTime(message.created_at)
  const hasError = message.error || (message.is_optimistic && sendError)

  return (
    <div
      className={cn(
        'mb-4 flex gap-3 transition-all duration-300',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar only for received messages */}
      {!isOwnMessage && (
        <div className='flex-shrink-0'>
          <ProfileAvatar user={message.sender} size='default' />
        </div>
      )}

      {/* Message content container */}
      <div className='flex max-w-[75%] flex-col'>
        <div className='flex items-end gap-2'>
          {/* Main message bubble */}
          <div
            className={cn(
              'relative rounded-2xl px-4 py-2 shadow-sm transition-all duration-300',
              'group hover:shadow-md',
              isOwnMessage
                ? hasError
                  ? 'border-destructive bg-destructive/10 text-destructive border'
                  : message.is_optimistic
                    ? 'bg-primary/20 text-primary'
                    : 'bg-primary text-primary-foreground'
                : 'bg-card text-card-foreground hover:bg-accent border'
            )}
          >
            {/* Image attachments */}
            {message.image && (
              <div className='mb-2 overflow-hidden rounded-lg'>
                <img
                  src={message.image}
                  alt='Message attachment'
                  className='h-auto max-w-full cursor-pointer object-cover transition-transform duration-300 hover:scale-105'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Text content */}
            {message.content && (
              <p
                className={cn(
                  'text-sm leading-relaxed break-words',
                  isOwnMessage && !hasError
                    ? 'text-primary-foreground'
                    : 'text-card-foreground'
                )}
              >
                {message.content}
              </p>
            )}

            {/* Sending indicator */}
            {message.is_optimistic && !hasError && (
              <div className='absolute -top-1 -right-1 flex items-center justify-center'>
                <div className='h-2 w-2 animate-ping rounded-full bg-blue-500' />
                <div className='absolute h-2 w-2 rounded-full bg-blue-500' />
              </div>
            )}

            {/* Error indicator */}
            {hasError && (
              <div className='absolute -top-1 -right-1 flex items-center justify-center'>
                <div className='flex h-4 w-4 items-center justify-center rounded-full bg-red-500'>
                  <AlertCircle className='h-3 w-3 text-white' />
                </div>
              </div>
            )}
          </div>

          {/* Timestamp and status */}
          <div
            className={cn(
              'text-muted-foreground flex flex-col items-start gap-1 pb-1 text-xs',
              isOwnMessage ? 'items-end' : 'items-start'
            )}
          >
            <span className='whitespace-nowrap opacity-70'>{messageTime}</span>

            {isOwnMessage && (
              <div className='flex items-center'>
                {hasError ? (
                  <button
                    className='text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors'
                    onClick={() => onRetryMessage?.(message.id)}
                    title='Retry sending'
                  >
                    <AlertCircle className='h-3 w-3' />
                    <span className='hidden group-hover:inline'>Retry</span>
                  </button>
                ) : (
                  <>
                    {message.is_optimistic ? (
                      <span className='text-primary flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                      </span>
                    ) : message.is_read ? (
                      <span className='flex items-center gap-1 text-green-500'>
                        <CheckCheck className='h-3 w-3' />
                      </span>
                    ) : (
                      <span className='text-muted-foreground flex items-center gap-1'>
                        <Check className='h-3 w-3' />
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for alignment on own messages */}
      {isOwnMessage && <div className='w-10 flex-shrink-0' />}
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedUser,
  conversationId,
  onBack,
  expectingUser = false,
  isLoadingUser = false,
}) => {
  const [messageText, setMessageText] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [hasUnsentMessage, setHasUnsentMessage] = useState(false)
  const [emojiSuggestion, setEmojiSuggestion] = useState<{
    suggestions: Array<{ emoji: string; description: string }>
    isChecking: boolean
  }>({
    suggestions: [],
    isChecking: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentUserId = useMemo(() => {
    const id = getCurrentUserId()

    return String(id)
  }, [])

  const {
    sendMessage,
    markMessagesAsRead,
    isConnected,
    isSending,
    sendError,
    retryConnection,
  } = useMessaging()

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useConversationMessages(conversationId)

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  useEffect(() => {
    if (conversationId && messages.length > 0 && currentUserId) {
      const unreadMessages = messages.filter(
        (msg) =>
          String(msg.recipient.id) === String(currentUserId) &&
          !msg.is_read &&
          !msg.is_optimistic
      )

      if (unreadMessages.length > 0) {
        if (markReadTimeoutRef.current) {
          clearTimeout(markReadTimeoutRef.current)
        }

        markReadTimeoutRef.current = setTimeout(() => {
          markMessagesAsRead(conversationId)
        }, 1000)
      }
    }

    return () => {
      if (markReadTimeoutRef.current) {
        clearTimeout(markReadTimeoutRef.current)
      }
    }
  }, [conversationId, messages, currentUserId, markMessagesAsRead])

  const checkEmojiSuggestions = useCallback(async (text: string) => {
    if (!text.trim()) {
      setEmojiSuggestion({
        suggestions: [],
        isChecking: false,
      })
      return
    }

    setEmojiSuggestion((prev) => ({ ...prev, isChecking: true }))

    try {
      const validation = await validateMessage(text)
      setEmojiSuggestion({
        suggestions: validation.suggestions,
        isChecking: false,
      })
    } catch (error) {
      console.error('❌ Error checking emoji suggestions:', error)
      setEmojiSuggestion({
        suggestions: [],
        isChecking: false,
      })
    }
  }, [])

  useEffect(() => {
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current)
    }

    if (messageText.trim()) {
      detectionTimeoutRef.current = setTimeout(() => {
        checkEmojiSuggestions(messageText)
      }, 500)
    } else {
      setEmojiSuggestion({
        suggestions: [],
        isChecking: false,
      })
    }

    return () => {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current)
      }
    }
  }, [messageText, checkEmojiSuggestions])

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() && !selectedImage) return
    if (!selectedUser || isSending) return

    const messageContent = messageText.trim()

    try {
      await sendMessage({
        recipient_id: selectedUser.id,
        conversation_id: conversationId,
        content: messageContent || undefined,
        image: selectedImage || undefined,
      })

      setMessageText('')
      setSelectedImage(null)
      setHasUnsentMessage(false)
      setEmojiSuggestion({
        suggestions: [],
        isChecking: false,
      })
      inputRef.current?.focus()
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      setHasUnsentMessage(true)
    }
  }, [
    messageText,
    selectedImage,
    selectedUser,
    conversationId,
    sendMessage,
    isSending,
  ])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.size <= 10 * 1024 * 1024) {
        setSelectedImage(file)
      } else if (file) {
        alert('File size must be less than 10MB')
      }
    },
    []
  )

  const removeSelectedImage = useCallback(() => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const getUserDisplayName = useCallback((user: User) => {
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    return `${firstName} ${lastName}`.trim() || user.username || 'Unknown User'
  }, [])
  const renderConnectionStatus = useCallback(() => {
    if (!isConnected) {
      return (
        <Alert className='mb-4'>
          <WifiOff className='h-4 w-4' />
          <AlertDescription className='flex items-center justify-between'>
            <span>
              Connection lost. Messages will be sent when reconnected.
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={retryConnection}
              className='ml-2 h-6 px-2 text-xs'
            >
              <RefreshCw className='mr-1 h-3 w-3' />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
    return null
  }, [isConnected, retryConnection])

  const messagesList = useMemo(() => {
    return messages
      .filter((msg) => String(msg.id) !== '0')
      .map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          sendError={sendError}
          onRetryMessage={() => {}}
        />
      ))
  }, [messages, currentUserId, sendError])

  if (!selectedUser && !expectingUser) {
    return (
      <div className='bg-muted/30 flex flex-1 items-center justify-center'>
        <div className='text-center'>
          <div className='bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
            <MessageCircle className='text-muted-foreground h-8 w-8' />
          </div>
          <h3 className='text-foreground mb-2 text-lg font-medium'>
            Select a conversation
          </h3>
          <p className='text-muted-foreground'>
            Choose a user from the sidebar to start messaging
          </p>
        </div>
      </div>
    )
  }

  if (!selectedUser && expectingUser && isLoadingUser) {
    return (
      <div className='bg-card flex flex-1 flex-col'>
        <div className='flex items-center justify-between border-b p-4'>
          <div className='flex items-center gap-3'>
            {onBack && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onBack}
                className='md:hidden'
              >
                ←
              </Button>
            )}
            <div className='bg-muted h-10 w-10 animate-pulse rounded-full'></div>
            <div>
              <div className='bg-muted h-4 w-24 animate-pulse rounded'></div>
              <div className='bg-muted/50 mt-1 h-3 w-16 animate-pulse rounded'></div>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          <div className='text-muted-foreground flex h-full items-center justify-center'>
            <div className='text-center'>
              <MessageCircle className='text-muted-foreground/50 mx-auto mb-3 h-12 w-12' />
              <p>Loading conversation...</p>
            </div>
          </div>
        </div>

        <div className='border-t p-4'>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='Loading...'
              disabled={true}
              className='bg-muted flex-1'
            />
            <Button disabled={true} size='sm' className='h-10 w-10 p-0'>
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedUser && expectingUser && !isLoadingUser) {
    return (
      <div className='bg-muted/30 flex flex-1 items-center justify-center'>
        <div className='text-center'>
          <div className='bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
            <MessageCircle className='text-destructive h-8 w-8' />
          </div>
          <h3 className='text-foreground mb-2 text-lg font-medium'>
            User not found
          </h3>
          <p className='text-muted-foreground'>
            The user you're trying to chat with could not be found.
          </p>
        </div>
      </div>
    )
  }

  const user = selectedUser!

  return (
    <div className='bg-card flex flex-1 flex-col'>
      <div className='bg-card flex items-center justify-between border-b p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          {onBack && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='md:hidden'
            >
              ←
            </Button>
          )}

          <ProfileAvatar user={user} size='large' />

          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <h3 className='text-foreground font-semibold'>
                {getUserDisplayName(user)}
              </h3>
              {isConnected ? (
                <Wifi className='h-3 w-3 text-green-500' />
              ) : (
                <WifiOff className='h-3 w-3 text-orange-500' />
              )}
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-muted-foreground text-sm capitalize'>
                {user.role}
              </p>
              <div className='bg-muted-foreground h-1 w-1 rounded-full'></div>
              <p
                className={`text-sm ${user.is_currently_online ? 'text-green-500' : 'text-muted-foreground'}`}
              >
                {user.is_currently_online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className='bg-muted/30 flex-1 p-4'>
        {renderConnectionStatus()}

        {messagesError && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Failed to load messages. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {messagesLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground flex items-center gap-2'>
              <RefreshCw className='h-4 w-4 animate-spin' />
              Loading messages...
            </div>
          </div>
        ) : messages.length > 0 ? (
          <div className='space-y-1'>
            {messagesList}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className='text-muted-foreground py-8 text-center'>
            <MessageCircle className='text-muted-foreground/50 mx-auto mb-3 h-12 w-12' />
            <p className='mb-1 text-lg font-medium'>No messages yet</p>
            <p className='text-sm'>
              Start the conversation with {getUserDisplayName(user)}!
            </p>
          </div>
        )}
      </ScrollArea>

      <div className='bg-card border-t p-4'>
        {sendError && (
          <Alert variant='destructive' className='mb-3'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Failed to send message. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Emoji suggestions */}
        {emojiSuggestion.suggestions.length > 0 && (
          <div className='bg-primary/5 mb-3 rounded-lg border p-3'>
            <div className='mb-2 flex items-center gap-2'>
              <span className='text-primary text-sm font-medium'>
                Suggested emojis:
              </span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {emojiSuggestion.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessageText((prev) => prev + ' ' + suggestion.emoji)
                    inputRef.current?.focus()
                  }}
                  className='bg-card hover:bg-accent flex items-center gap-1 rounded-md border px-2 py-1 text-sm transition-colors'
                  title={suggestion.description}
                >
                  <span className='text-lg'>{suggestion.emoji}</span>
                  <span className='text-muted-foreground text-xs'>
                    {suggestion.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analysis loading indicator */}
        {emojiSuggestion.isChecking && (
          <div className='bg-primary/5 mb-3 flex items-center gap-2 rounded-lg border p-3'>
            <RefreshCw className='text-primary h-4 w-4 animate-spin' />
            <span className='text-primary text-sm'>Analyzing emotions...</span>
          </div>
        )}

        {selectedImage && (
          <div className='bg-muted/50 mb-3 flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-2'>
              <Image className='text-muted-foreground h-4 w-4' />
              <span className='text-foreground text-sm font-medium'>
                {selectedImage.name}
              </span>
              <span className='bg-muted text-muted-foreground rounded px-2 py-1 text-xs'>
                {(selectedImage.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={removeSelectedImage}
              className='text-muted-foreground hover:text-destructive h-6 w-6 p-0'
            >
              ×
            </Button>
          </div>
        )}

        <div className='flex items-end gap-2'>
          <div className='relative flex-1'>
            <Input
              ref={inputRef}
              placeholder={
                isConnected
                  ? `Message ${getUserDisplayName(user)}...`
                  : 'Waiting for connection...'
              }
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value)
                setHasUnsentMessage(false)
              }}
              onKeyPress={handleKeyPress}
              disabled={!isConnected && !hasUnsentMessage}
              className={cn(
                'resize-none pr-10',
                hasUnsentMessage && 'border-orange-300 bg-orange-50'
              )}
            />
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleImageSelect}
            className='hidden'
          />

          <Button
            variant='ghost'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className='h-10 w-10 flex-shrink-0 p-0'
          >
            <Paperclip className='h-4 w-4' />
          </Button>

          <Button
            onClick={handleSendMessage}
            disabled={(!messageText.trim() && !selectedImage) || isSending}
            size='sm'
            className='h-10 w-10 flex-shrink-0 p-0'
          >
            {isSending ? (
              <RefreshCw className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
