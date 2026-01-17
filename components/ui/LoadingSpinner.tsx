import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  color?: 'primary' | 'secondary' | 'white'
}

const LoadingSpinner = ({
  size = 'md',
  className = '',
  color = 'primary'
}: LoadingSpinnerProps) => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-5 h-5 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  }

  const colors = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    white: 'border-white'
  }

  return (
    <div
      className={`
        animate-spin rounded-full border-solid border-t-transparent
        ${sizes[size]}
        ${colors[color]}
        ${className}
      `}
    />
  )
}

export default LoadingSpinner
