import React, { useState } from 'react'
import { MessageSquare, Eye, EyeOff } from 'lucide-react'
import { showSuccessAlert, showErrorAlert, showLoadingAlert, updateAlert, dismissAlert } from '../lib/alerts'

interface LoginScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string, metadata?: { full_name?: string; username?: string }) => Promise<void>
}

interface FormData {
  email: string
  password: string
  fullName: string
  username: string
}

export default function LoginScreen({ onSignIn, onSignUp }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    username: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await onSignUp(formData.email, formData.password, {
          full_name: formData.fullName,
          username: formData.username
        })
        showSuccessAlert('Account created successfully!')
      } else {
        await onSignIn(formData.email, formData.password)
        showSuccessAlert('Signed in successfully!')
      }
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        fullName: '',
        username: ''
      })
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred'
      setError(errorMessage)
      showErrorAlert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setFormData({
      email: '',
      password: '',
      fullName: '',
      username: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
          <MessageSquare className="w-8 h-8 text-white mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">FChat</h1>
          <p className="text-green-100">Connect with friends instantly</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="bg-red-50 border border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={toggleMode}
              className="text-green-500 hover:text-green-600 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
