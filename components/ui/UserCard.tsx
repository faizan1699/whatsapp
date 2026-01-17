import React from 'react'
import { User } from '../../lib/api'
import Avatar from './Avatar'
import Badge from './Badge'

export interface UserCardProps {
  user: User & { email?: string; phone?: string } // Extend User interface
  currentUserId?: string
  onClick?: (user: User & { email?: string; phone?: string }) => void
  selected?: boolean
  showEmail?: boolean
  className?: string
}

const UserCard = ({
  user,
  currentUserId,
  onClick,
  selected = false,
  showEmail = true,
  className = ''
}: UserCardProps) => {
  const isCurrentUser = user.id === currentUserId

  return (
    <div
      className={`
        flex items-center p-3 rounded-lg border transition-all cursor-pointer
        ${selected 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
        ${className}
      `}
      onClick={() => onClick?.(user)}
    >
      <Avatar
        src={user.avatar_url}
        alt={user.full_name || user.username}
        fallback={user.full_name || user.username || 'Unknown User'}
        size="md"
        className="mr-3"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <div className="font-medium text-gray-800 truncate">
            {user.full_name || user.username || 'Unknown User'}
          </div>
          {isCurrentUser && (
            <Badge variant="secondary" size="sm">
              you
            </Badge>
          )}
        </div>
        
        {showEmail && user.email && (
          <div className="text-sm text-gray-500 truncate">
            {user.email}
          </div>
        )}
        
        {user.phone && (
          <div className="text-sm text-gray-400 truncate">
            {user.phone}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCard
