import React, { useState, useEffect } from 'react'
import { X, Search, Users, UserPlus } from 'lucide-react'
import { showSuccessAlert, showErrorAlert, showLoadingAlert, updateAlert } from '../lib/alerts'

interface User {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  email?: string
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChat: (userIds: string[], isGroup: boolean, groupName?: string) => Promise<void>
  searchUsers: (query: string) => Promise<User[]>
}

export default function NewChatModal({ isOpen, onClose, onCreateChat, searchUsers }: NewChatModalProps) {
  const [mode, setMode] = useState<'direct' | 'group'>('direct')
  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setLoading(true)
      const results = await searchUsers(searchQuery)
      setSearchResults(results.filter(user => user.id !== selectedUsers.find(u => u.id === user.id)?.id))
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (user: User) => {
    if (mode === 'direct') {
      setSelectedUsers([user])
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId))
  }

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return
    if (mode === 'group' && !groupName.trim()) return

    const loadingToastId = showLoadingAlert('Creating chat...')

    try {
      setCreating(true)
      const userIds = selectedUsers.map(u => u.id)
      await onCreateChat(userIds, mode === 'group', mode === 'group' ? groupName : undefined)
      
      const chatType = mode === 'group' ? 'group chat' : 'direct chat'
      updateAlert(loadingToastId, 'success', `${chatType.charAt(0).toUpperCase() + chatType.slice(1)} created successfully!`)
      handleClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create chat'
      updateAlert(loadingToastId, 'error', errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setMode('direct')
    setGroupName('')
    setSearchQuery('')
    setSearchResults([])
    setSelectedUsers([])
    setLoading(false)
    setCreating(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">New Chat</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mode Selection */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('direct')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                mode === 'direct' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Direct Chat</span>
            </button>
            <button
              onClick={() => setMode('group')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                mode === 'group' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Group Chat</span>
            </button>
          </div>

          {mode === 'group' && (
            <input
              type="text"
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center space-x-2"
                >
                  <span className="text-sm">
                    {user.full_name || user.username || user.email}
                  </span>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || 'User')}&background=128C7E&color=fff`}
                    alt={user.full_name || user.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {user.full_name || user.username || 'Unknown User'}
                    </div>
                    {user.email && (
                      <div className="text-sm text-gray-500">{user.email}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={selectedUsers.length === 0 || (mode === 'group' && !groupName.trim()) || creating}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : mode === 'direct' ? 'Start Chat' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
