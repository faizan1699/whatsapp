import React, { useState, useRef, useEffect } from 'react'
import { Message, TypingIndicator } from '../lib/api'
import ChatBubble from './ChatBubble'
import { Send, Smile, Paperclip, Phone, Video, MoreVertical } from 'lucide-react'

interface ChatWindowProps {
  conversationId?: string
  conversationName?: string
  isGroup?: boolean
  messages: Message[]
  loading: boolean
  typingUsers: TypingIndicator[]
  currentUserId?: string
  onSendMessage: (content: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
  onReplyMessage: (messageId: string) => void
  onLoadMore: () => Promise<void>
  hasMore: boolean
  setTyping: (isTyping: boolean) => Promise<void>
}

export default function ChatWindow({
  conversationId,
  conversationName,
  isGroup = false,
  messages,
  loading,
  typingUsers,
  currentUserId,
  onSendMessage,
  onDeleteMessage,
  onReplyMessage,
  onLoadMore,
  hasMore,
  setTyping
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !conversationId) return

    try {
      await onSendMessage(messageInput)
      setMessageInput('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value)
    setTyping(true)
  }

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
  }

  const getReplyingMessage = () => {
    if (!replyingTo) return null
    return messages.find(m => m.id === replyingTo)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    if (scrollTop === 0 && hasMore && !loading) {
      onLoadMore()
    }
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to FChat</h2>
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
            <div>
              <h2 className="font-semibold text-gray-800">{conversationName}</h2>
              {typingUsers.length > 0 && (
                <p className="text-sm text-green-500">
                  {typingUsers.map(t => t.user?.full_name || t.user?.username).join(', ')} 
                  {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50"
      >
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {loading ? 'Loading...' : 'Load more messages'}
            </button>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUserId}
            onReply={handleReply}
            onDelete={onDeleteMessage}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && getReplyingMessage() && (
        <div className="bg-gray-100 px-4 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Replying to {getReplyingMessage()?.sender?.full_name}</p>
              <p className="text-sm text-gray-700 truncate">{getReplyingMessage()?.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end space-x-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1">
            <textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

import { MessageSquare } from 'lucide-react'
