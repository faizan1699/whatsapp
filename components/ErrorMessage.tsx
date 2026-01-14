import React, { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

export interface Message {
  id: string
  type: MessageType
  title?: string
  message: string
  duration?: number
  persistent?: boolean
}

interface ErrorMessageProps {
  message: Message
  onClose: (id: string) => void
}

const ErrorMessage = ({ message, onClose }: ErrorMessageProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    if (!message.persistent && message.duration !== 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(message.id), 300)
      }, message.duration || 5000)
      
      return () => clearTimeout(timer)
    }
  }, [message.id, message.duration, message.persistent, onClose])

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        flex items-start p-4 rounded-lg border shadow-sm
        max-w-md w-full
        ${getStyles()}
      `}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {message.title && (
            <h4 className="text-sm font-semibold mb-1">
              {message.title}
            </h4>
          )}
          <p className="text-sm">
            {message.message}
          </p>
        </div>
        {!message.persistent && (
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose(message.id), 300)
            }}
            className="flex-shrink-0 ml-3 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Global Message Container
interface MessageContainerProps {
  messages: Message[]
  onClose: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const MessageContainer = ({ 
  messages, 
  onClose, 
  position = 'top-right' 
}: MessageContainerProps) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div className={`
      fixed z-50 space-y-2
      ${getPositionStyles()}
    `}>
      {messages.map((message) => (
        <ErrorMessage
          key={message.id}
          message={message}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

// Hook for managing messages
export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (message: Omit<Message, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newMessage: Message = { ...message, id }
    
    setMessages(prev => [...prev, newMessage])
    return id
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const clearAllMessages = () => {
    setMessages([])
  }

  // Convenience methods
  const showSuccess = (message: string, options?: Partial<Omit<Message, 'id' | 'type' | 'message'>>) => {
    return addMessage({ type: 'success', message, ...options })
  }

  const showError = (message: string, options?: Partial<Omit<Message, 'id' | 'type' | 'message'>>) => {
    return addMessage({ type: 'error', message, ...options })
  }

  const showWarning = (message: string, options?: Partial<Omit<Message, 'id' | 'type' | 'message'>>) => {
    return addMessage({ type: 'warning', message, ...options })
  }

  const showInfo = (message: string, options?: Partial<Omit<Message, 'id' | 'type' | 'message'>>) => {
    return addMessage({ type: 'info', message, ...options })
  }

  return {
    messages,
    addMessage,
    removeMessage,
    clearAllMessages,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

export default ErrorMessage
