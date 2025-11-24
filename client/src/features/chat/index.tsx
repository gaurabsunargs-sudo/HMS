import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useChatMessages,
  useChatUsers,
  useMarkChatRead,
  useSendChatMessage,
} from '@/api/hooks/useChat'
import { getProfileImageUrl } from '@/lib/image-utils'
import { getUserData } from '@/lib/user-utils'
import { cn } from '@/lib/utils'
import { useSocketChat } from '@/hooks/useSocketChat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatProps {
  selectedUserId?: string
}

const Chat = ({ selectedUserId }: ChatProps) => {
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [activeUserId, setActiveUserId] = useState<string | null>(
    selectedUserId || null
  )
  const navigate = useNavigate()
  const currentUser = getUserData()

  const { data: usersRes } = useChatUsers({ page: 1, limit: 50, search })
  const { data: messagesRes, refetch: refetchMessages } =
    useChatMessages(activeUserId)
  const { mutate: markRead } = useMarkChatRead()
  const { mutate: sendChatMessage, isPending: isSending } = useSendChatMessage()

  const [typingUserIds, setTypingUserIds] = useState<Record<string, boolean>>(
    {}
  )
  const [onlineUserIds, setOnlineUserIds] = useState<Record<string, boolean>>(
    {}
  )

  const {
    connected,
    sendMessage,
    typingStart,
    typingStop,
    markMessagesRead,
    requestOnlineUsers,
  } = useSocketChat({
    onNewMessage: (msg) => {
      const uid = activeUserId ? String(activeUserId) : null
      if (!uid) return
      if (String(msg?.senderId) === uid || String(msg?.receiverId) === uid) {
        refetchMessages()
      }
    },
    onUserTyping: (data) => {
      setTypingUserIds((prev) => ({
        ...prev,
        [String(data.userId)]: data.typing,
      }))
    },
    onUserOnline: (data) => {
      setOnlineUserIds((prev) => ({ ...prev, [String(data.userId)]: true }))
    },
    onUserOffline: (data) => {
      setOnlineUserIds((prev) => ({ ...prev, [String(data.userId)]: false }))
    },
    onOnlineUsersList: (list) => {
      const map: Record<string, boolean> = {}
      list.forEach((id) => (map[String(id)] = true))
      setOnlineUserIds(map)
    },
  })

  useEffect(() => {
    if (selectedUserId) {
      setActiveUserId(selectedUserId)
    }
    requestOnlineUsers()
  }, [selectedUserId])

  const handleSelectUser = (id: number | string) => {
    setActiveUserId(String(id))
    navigate({ to: '/dashboard/chat/$id', params: { id: String(id) } })
    markRead(String(id))
    if (currentUser?.id) {
      markMessagesRead({
        senderId: String(id),
        receiverId: String(currentUser.id),
      })
    }
  }

  const handleSend = () => {
    if (!message.trim() || !activeUserId || !currentUser?.id) return
    const payload = {
      senderId: String(currentUser.id),
      receiverId: String(activeUserId),
      content: message.trim(),
    }

    if (connected) {
      sendMessage(payload)
      setMessage('')
    } else {
      sendChatMessage(
        { receiverId: payload.receiverId, content: payload.content },
        {
          onSuccess: () => {
            setMessage('')
            refetchMessages()
          },
        }
      )
    }
  }

  const users = usersRes?.data.users || []
  const messages = messagesRes?.data || []
  // const recent = recentRes?.data || []

  return (
    <div className='grid h-[calc(100dvh-7rem)] grid-cols-12 gap-4'>
      <div className='col-span-4 flex min-w-0 flex-col rounded-md border'>
        <div className='border-b p-3'>
          <Input
            placeholder='Search users'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className='flex-1'>
          <div className='p-2'>
            {(users.length ? users : []).map((u: any) => (
              <button
                key={u.id}
                className={cn(
                  'hover:bg-muted/60 flex w-full items-center gap-3 rounded-md p-2 text-left',
                  String(activeUserId) === String(u.id) && 'bg-muted'
                )}
                onClick={() => handleSelectUser(u.id)}
              >
                <Avatar className='size-8'>
                  <AvatarImage src={getProfileImageUrl(u.profile) || ''} />
                  <AvatarFallback>
                    {u.firstName?.[0]}
                    {u.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className='flex min-w-0 flex-col'>
                  <div className='flex items-center gap-2'>
                    <div className='truncate text-sm font-medium'>
                      {u.firstName} {u.lastName}
                    </div>
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        onlineUserIds[String(u.id)]
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      )}
                      title={onlineUserIds[String(u.id)] ? 'Online' : 'Offline'}
                    />
                  </div>
                  {typingUserIds[String(u.id)] && (
                    <div className='text-muted-foreground text-xs'>typing…</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className='col-span-8 flex min-w-0 flex-col rounded-md border'>
        <div className='border-b p-3'>
          <div className='text-sm font-medium'>
            {activeUserId
              ? users.find((x: any) => String(x.id) === String(activeUserId))
                  ?.firstName || 'Chat'
              : 'Select a user to start chatting'}
          </div>
        </div>
        <ScrollArea className='flex-1'>
          <div className='flex flex-col gap-2 p-3'>
            {messages.map((m: any) => {
              const mine = String(m.senderId) === String(currentUser?.id)
              return (
                <div
                  key={m.id}
                  className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-md px-3 py-2 text-sm',
                      mine ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <div>{m.content}</div>
                    <div className='text-muted-foreground mt-1 text-[10px]'>
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        <div className='border-t p-3'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Type a message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              onFocus={() => {
                if (currentUser?.id && activeUserId) {
                  typingStart({
                    senderId: String(currentUser.id),
                    receiverId: String(activeUserId),
                  })
                }
              }}
              onBlur={() => {
                if (currentUser?.id && activeUserId) {
                  typingStop({
                    senderId: String(currentUser.id),
                    receiverId: String(activeUserId),
                  })
                }
              }}
              onInput={() => {
                if (currentUser?.id && activeUserId) {
                  typingStart({
                    senderId: String(currentUser.id),
                    receiverId: String(activeUserId),
                  })
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!activeUserId || !message.trim() || isSending}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
