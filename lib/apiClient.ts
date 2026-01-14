import axios from 'axios'

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface User {
  id: string
  email?: string | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  phone?: string | null
  is_online?: boolean
  last_seen?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: 'all' | 'online' | 'offline'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUsers: number
    pageSize: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  error?: string
  message?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: string
}

export interface SearchResponse {
  success: boolean
  data: User[]
  count: number
}

// Users API
export const usersApi = {
  // Get all users with pagination and filtering
  async getUsers(params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Get single user by ID
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Create new user
  async createUser(userData: {
    email: string
    password: string
    full_name: string
    username: string
    phone?: string
  }): Promise<ApiResponse<User>> {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Update user
  async updateUser(id: string, userData: {
    full_name: string
    username: string
    phone?: string
  }): Promise<ApiResponse<User>> {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Search users
  async searchUsers(query: string, limit = 20): Promise<SearchResponse> {
    const response = await api.get('/users/search', { 
      params: { q: query, limit } 
    })
    return response.data
  }
}

export default usersApi
