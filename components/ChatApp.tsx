import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useConversations } from '../hooks/useConversations'
import { useMessages } from '../hooks/useMessages'
import { useProfile } from '../hooks/useProfile'
import { Conversation, Message } from '../lib/api'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import NewChatModal from './NewChatModal'
import LoginScreen from './LoginScreen'

export default function ChatApp() {
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [chatMode, setChatMode] = useState<'direct' | 'group'>('direct')

  const { conversations, loading: conversationsLoading, createConversation, getOrCreateDirectConversation } = useConversations({
    userId: user?.id,
    autoRefresh: true
  })

  const { 
    messages, 
    loading: messagesLoading, 
    sendMessage, 
    deleteMessage, 
    loadMoreMessages, 
    typingUsers, 
    setTyping,
    hasMore 
  } = useMessages({
    conversationId: selectedConversation?.id,
    userId: user?.id,
    autoLoad: true
  })

  const { searchUsers } = useProfile({ userId: user?.id })

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleNewChat = () => {
    setChatMode('direct')
    setShowNewChatModal(true)
  }

  const handleNewGroup = () => {
    setChatMode('group')
    setShowNewChatModal(true)
  }

  const handleCreateChat = async (userIds: string[], isGroup: boolean, groupName?: string) => {
    try {
      if (isGroup) {
        await createConversation(groupName || '', true, userIds)
      } else {
        if (userIds.length > 0 && user?.id) {
          await getOrCreateDirectConversation(user.id, userIds[0])
        }
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation?.id) return
    await sendMessage(content)
  }

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId)
  }

  const handleReplyMessage = (messageId: string) => {
    // This would open reply mode in ChatWindow
    console.log('Reply to message:', messageId)
  }

  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.name || 'Group Chat'
    }
    
    // For 1-1 chats, we'd need to fetch the other participant's details
    // This is simplified - in a real app you'd include participant data
    return 'Direct Chat'
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List - Hidden on mobile when conversation is selected */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-shrink-0`}>
        <ChatList
          conversations={conversations}
          loading={conversationsLoading}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onNewGroup={handleNewGroup}
        />
      </div>

      {/* Chat Window */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        <ChatWindow
          conversationId={selectedConversation?.id}
          conversationName={selectedConversation ? getConversationDisplayName(selectedConversation) : undefined}
          isGroup={selectedConversation?.is_group}
          messages={messages}
          loading={messagesLoading}
          typingUsers={typingUsers}
          currentUserId={user.id}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onReplyMessage={handleReplyMessage}
          onLoadMore={loadMoreMessages}
          hasMore={hasMore}
          setTyping={setTyping}
        />
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat}
        searchUsers={searchUsers}
      />

      {/* Mobile Back Button */}
      {selectedConversation && (
        <div className="md:hidden fixed top-4 left-4 z-10">
          <button
            onClick={() => setSelectedConversation(null)}
            className="bg-white rounded-full p-2 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
