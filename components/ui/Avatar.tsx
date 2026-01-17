import React from 'react'

export interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
  onClick?: () => void
}

const Avatar = ({
  src,
  alt,
  size = 'md',
  fallback = 'User',
  className = '',
  onClick
}: AvatarProps) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const avatarUrl = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallback)}&background=128C7E&color=fff`

  return (
    <div
      className={`
        relative inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium
        ${sizes[size]}
        ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {src ? (
        <img
          src={avatarUrl}
          alt={alt || fallback}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="uppercase">
          {fallback.charAt(0)}
        </span>
      )}
    </div>
  )
}

export default Avatar
