import { useState, useEffect } from 'react'
import { createLazyFileRoute, useParams } from '@tanstack/react-router'
import {
  User,
  Conversation,
  useConversations,
  getConversationWithUser,
} from '@/api/hooks/useMessaging'
import { useUserByIdForChat } from '@/api/hooks/useUsers'
import { useBreadcrumb } from '@/hooks/useBreadCrumb'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatSidebar } from '@/components/chat/ChatSidebar'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/chat/$userId'
)({
  component: ChatWithUserPage,
})

function ChatWithUserPage() {
  const { userId } = useParams({
    from: '/dashboard/_authenticated/chat/$userId',
  })
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >()

  const { data: user, isLoading: userLoading } = useUserByIdForChat(userId)
  const { data: conversations = [], isLoading: conversationsLoading } =
    useConversations()

  useBreadcrumb([
    { title: 'Messages', link: '/chat' },
    {
      title: user ? `${user.firstName} ${user.lastName}` : 'Chat',
      link: `/chat/${userId}`,
    },
  ])

  useEffect(() => {
    if (userId && !userLoading && !conversationsLoading && user) {
      const selectedUser: User = {
        id: String(user.id),
        username: user.email || '',
        email: user.email || '',
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        role: user.role || '',
        profile_picture_url: user.profile || '',
        is_currently_online: Boolean(user?.isCurrentlyOnline),
        last_seen: user?.lastSeen,
      }

      setSelectedUser(selectedUser)

      const existingConversation = getConversationWithUser(
        conversations,
        selectedUser.id
      )
      if (existingConversation) {
        setSelectedConversationId(String(existingConversation.id))
      } else {
        setSelectedConversationId(undefined)
      }
    } else if (userId && userLoading) {
    }
  }, [userId, user, conversations, userLoading, conversationsLoading])

  const handleUserSelect = (user: User, conversationId?: number) => {
    setSelectedUser(user)
    setSelectedConversationId(conversationId)

    window.history.replaceState(null, '', `/dashboard/chat/${String(user.id)}`)
  }

  const handleConversationSelect = (conversation: Conversation) => {
    if (conversation.other_participant) {
      setSelectedUser(conversation.other_participant)
      setSelectedConversationId(conversation.id)

      window.history.replaceState(
        null,
        '',
        `/dashboard/chat/${String(conversation.other_participant.id)}`
      )
    }
  }

  return (
    <div className='bg-muted/30 flex h-[calc(100svh-60px)] overflow-hidden rounded-lg'>
      <ChatSidebar
        selectedUserId={selectedUser?.id}
        selectedConversationId={selectedConversationId}
        onUserSelect={handleUserSelect}
        onConversationSelect={handleConversationSelect}
      />
      <ChatInterface
        selectedUser={selectedUser}
        conversationId={selectedConversationId}
        expectingUser={true}
        isLoadingUser={userLoading || conversationsLoading}
      />
    </div>
  )
}
