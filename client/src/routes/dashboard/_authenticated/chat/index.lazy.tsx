// @ts-nocheck
import { useState } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { User, Conversation } from '@/api/hooks/useMessaging'
import { useBreadcrumb } from '@/hooks/useBreadCrumb'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatSidebar } from '@/components/chat/ChatSidebar'

export const Route = createLazyFileRoute('/dashboard/_authenticated/chat/')({
  component: ChatPage,
})

function ChatPage() {
  useBreadcrumb([{ title: 'Messages', link: '/chat' }])

  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >()

  const handleUserSelect = (user: User, conversationId?: string | number) => {
    setSelectedUser(user)
    setSelectedConversationId(String(conversationId))
  }

  const handleConversationSelect = (conversation: Conversation) => {
    if (conversation.other_participant) {
      setSelectedUser(conversation.other_participant)
      setSelectedConversationId(String(conversation.id))
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
        conversationId={String(selectedConversationId)}
      />
    </div>
  )
}
