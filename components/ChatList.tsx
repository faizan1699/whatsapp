import React, { useState } from 'react'
import { Conversation } from '../lib/api'
import { format, isToday, isYesterday } from 'date-fns'
import { Search, Users, MessageSquare } from 'lucide-react'

interface ChatListProps {
  conversations: Conversation[]
  loading: boolean
  selectedId?: string
  onSelect: (conversation: Conversation) => void
  onNewChat: () => void
  onNewGroup: () => void
}

export default function ChatList({ conversations, loading, selectedId, onSelect, onNewChat, onNewGroup }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    return conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.participants?.some(p => p.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return format(date, 'dd/MM')
    }
  }

  const getDisplayName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.name || 'Group Chat'
    }
    
    // For 1-1 chats, show the other user's name
    const otherParticipant = conversation.participants?.find(p => p.user?.id !== conversation.created_by)
    return otherParticipant?.user?.full_name || otherParticipant?.user?.username || 'Unknown'
  }

  const getAvatar = (conversation: Conversation) => {
    if (conversation.avatar_url) {
      return conversation.avatar_url
    }
    
    if (conversation.is_group) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name || 'Group')}&background=128C7E&color=fff`
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user?.id !== conversation.created_by)
    const name = otherParticipant?.user?.full_name || otherParticipant?.user?.username || 'Unknown'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=128C7E&color=fff`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">FChat</h1>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onNewChat}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <button
            onClick={onNewGroup}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedId === conversation.id ? 'bg-green-50 border-l-4 border-green-500' : ''
              }`}
            >
              <img
                src={getAvatar(conversation)}
                alt={getDisplayName(conversation)}
                className="w-12 h-12 rounded-full mr-3"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {getDisplayName(conversation)}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatLastMessageTime(conversation.updated_at)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.is_group && (
                      <span className="text-xs text-gray-500 mr-1">
                        {conversation.participants?.length || 0} members
                      </span>
                    )}
                    Last message...
                  </p>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
