import React from 'react'
import { Message } from '../lib/api'
import { format } from 'date-fns'

type Props = {
  message: Message
  isOwn: boolean
  onReply?: (messageId: string) => void
  onDelete?: (messageId: string) => void
}

export default function ChatBubble({ message, isOwn, onReply, onDelete }: Props) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm')
  }

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`${isOwn ? 'bg-gray-300' : 'bg-gray-200'} max-w-xs px-4 py-2 rounded-lg shadow-sm`}>
          <div className="text-sm italic text-gray-600">This message was deleted</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && message.sender && (
          <div className="text-xs text-gray-600 mb-1">{message.sender.full_name || message.sender.username}</div>
        )}
        
        {message.reply_to && (
          <div className="bg-gray-100 p-2 rounded-t-lg border-l-2 border-gray-300 mb-1">
            <div className="text-xs text-gray-500">
              Replying to {message.reply_to.sender?.full_name || 'someone'}
            </div>
            <div className="text-sm truncate">{message.reply_to.content}</div>
          </div>
        )}
        
        <div className={`${isOwn ? 'bg-green-500 text-white' : 'bg-white text-gray-800'} px-4 py-2 rounded-lg shadow-sm relative`}>
          <div className="break-words">{message.content}</div>
          <div className={`text-xs ${isOwn ? 'text-green-100' : 'text-gray-500'} mt-1 flex items-center justify-between`}>
            <span>{formatTime(message.created_at)}</span>
            {isOwn && (
              <div className="flex space-x-1 ml-2">
                <button 
                  onClick={() => onReply?.(message.id)}
                  className="hover:bg-green-600 rounded p-1"
                  title="Reply"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDelete?.(message.id)}
                  className="hover:bg-green-600 rounded p-1"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
