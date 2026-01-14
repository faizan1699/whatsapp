import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMessages } from './ErrorMessage'

type UserFormData = {
  email: string
  password: string
  full_name: string
  username: string
  phone: string
}

interface UserFormProps {
  initialData?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  loading?: boolean
}

export default function UserForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEdit = false, 
  loading = false 
}: UserFormProps) {
  const { showError, showSuccess } = useMessages()
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    reset,
    setValue,
    watch
  } = useForm<UserFormData>({
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      username: '',
      phone: ''
    },
    mode: 'onChange'
  })

  // Set initial data when editing
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof UserFormData, value || '')
      })
    }
  }, [initialData, setValue])

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data)
      if (!isEdit) {
        reset()
      }
      showSuccess(`User ${isEdit ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      showError(`Failed to ${isEdit ? 'update' : 'create'} user`)
    }
  }

  const watchedEmail = watch('email')
  const watchedUsername = watch('username')

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-6">
        {isEdit ? 'Edit User' : 'Create New User'}
      </h3>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="Enter email address"
                disabled={isEdit}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field - Only for create */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Enter password"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Controller
            name="full_name"
            control={control}
            rules={{
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Full name must be at least 2 characters'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter full name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.full_name 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username *
          </label>
          <Controller
            name="username"
            control={control}
            rules={{
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Enter username"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.username 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone (optional)
          </label>
          <Controller
            name="phone"
            control={control}
            rules={{
              pattern: {
                value: /^[+]?[\d\s\-\(\)]+$/,
                message: 'Invalid phone number format'
              }
            }}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                placeholder="Enter phone number"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.phone 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isDirty || !isValid}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEdit ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
