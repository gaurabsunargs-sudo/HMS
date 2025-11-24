'use client'

import { useState, useEffect } from 'react'
import { Bell, MessageCircle, User, Clock } from 'lucide-react'
import { useMessaging, formatMessageTime } from '@/api/hooks/useMessaging'
import { getCurrentUserId } from '@/api/hooks/useMessaging'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type ChatNotification = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderProfile?: string
  content: string
  timestamp: string
  read: boolean
  unreadCount: number
}

export function NotificationIcon() {
  const [chatNotifications, setChatNotifications] = useState<
    ChatNotification[]
  >([])
  const [isOpen, setIsOpen] = useState(false)
  const { conversations, markMessagesAsRead } = useMessaging()
  const currentUserId = getCurrentUserId()

  // Convert conversations to notifications
  useEffect(() => {
    const notifications: ChatNotification[] = conversations
      .filter((conv) => conv.unread_count > 0) // Only show conversations with unread messages
      .map((conv) => ({
        id: `chat-${conv.id}`,
        conversationId: String(conv.id),
        senderId: String(conv.other_participant?.id || ''),
        senderName: conv.other_participant
          ? `${conv.other_participant.first_name} ${conv.other_participant.last_name}`.trim() ||
            'Unknown User'
          : 'Unknown User',
        senderProfile: conv.other_participant?.profile_picture_url,
        content: conv.last_message?.content || 'New message',
        timestamp: conv.last_message_at,
        read: false,
        unreadCount: conv.unread_count,
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

    setChatNotifications(notifications)
  }, [conversations])

  const unreadCount = chatNotifications.reduce(
    (total, notification) => total + notification.unreadCount,
    0
  )

  const markAsRead = (id: string) => {
    setChatNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true, unreadCount: 0 }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setChatNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
        unreadCount: 0,
      }))
    )
  }

  const handleNotificationClick = async (notification: ChatNotification) => {
    markAsRead(notification.id)

    // Mark messages as read in the chat system
    try {
      await markMessagesAsRead(notification.conversationId)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }

    // You can add navigation to the chat here
    // For example: router.push(`/chat/${notification.conversationId}`)
    setIsOpen(false)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='bg-card relative scale-90 rounded-full shadow-xs'
              >
                <Bell className='size-[1.15rem]!' />
                {unreadCount > 0 && (
                  <span className='bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <span className='sr-only'>Chat Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[380px] p-0'>
              <div className='flex items-center justify-between border-b p-4'>
                <h3 className='font-semibold'>Chat Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-muted-foreground hover:text-foreground text-xs font-medium'
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>

              <ScrollArea className='max-h-[400px]'>
                {chatNotifications.length === 0 ? (
                  <div className='flex flex-col items-center justify-center p-6 text-center'>
                    <MessageCircle className='text-muted-foreground/50 mb-2 h-10 w-10' />
                    <p className='text-muted-foreground text-sm'>
                      No new messages
                    </p>
                  </div>
                ) : (
                  <div className='p-0'>
                    {chatNotifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className='hover:bg-muted cursor-pointer border-b p-4 last:border-b-0'
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className='flex w-full items-start gap-3'>
                          <div className='mt-0.5 shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-950/50'>
                            <MessageCircle className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                          </div>
                          <div className='grid min-w-0 flex-1 gap-1'>
                            <div className='flex items-center gap-2'>
                              <div className='truncate font-medium'>
                                {notification.senderName}
                              </div>
                              {notification.unreadCount > 0 && (
                                <Badge
                                  variant='default'
                                  className='h-5 shrink-0 px-1.5 text-[10px]'
                                >
                                  {notification.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className='text-muted-foreground truncate text-sm'>
                              {notification.content}
                            </div>
                            <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                              <Clock className='h-3 w-3' />
                              <span>
                                {formatMessageTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-primary cursor-pointer p-3 text-center text-sm font-medium'>
                View all conversations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Chat Notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
