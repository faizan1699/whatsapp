import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createServerSupabaseClient } from './supabaseServer'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SALT_ROUNDS = 12

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: 'admin' | 'moderator' | 'user'
  is_active: boolean
  is_verified: boolean
  last_login?: string
  created_at: string
  updated_at: string
  password_hash?: string // For internal use only
}

export interface CreateUserInput {
  email: string
  password: string
  username: string
  full_name: string
  phone?: string
  role?: 'admin' | 'moderator' | 'user'
}

export interface LoginInput {
  email: string
  password: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AuthService {
  private supabase = createServerSupabaseClient()

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      throw new AuthError('Invalid or expired token', 401)
    }
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const { email, password, username, full_name, phone, role = 'user' } = input

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      throw new AuthError('Invalid email format', 400)
    }

    // Validate password
    if (password.length < 8) {
      throw new AuthError('Password must be at least 8 characters long', 400)
    }

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      throw new AuthError('Username can only contain letters, numbers, and underscores', 400)
    }

    // Check if email already exists
    const { data: existingEmail } = await this.supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmail) {
      throw new AuthError('Email already exists', 409)
    }

    // Check if username already exists
    const { data: existingUsername } = await this.supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      throw new AuthError('Username already exists', 409)
    }

    // Hash password
    const password_hash = await this.hashPassword(password)

    // Create user
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        email,
        password_hash,
        username,
        full_name,
        phone: phone || null,
        role
      })
      .select()
      .single()

    if (error) {
      throw new AuthError(`Failed to create user: ${error.message}`, 500)
    }

    // Log activity
    await this.logActivity(data.id, 'user_created', 'user', data.id)

    return data as User
  }

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const { email, password } = input

    // Find user by email
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new AuthError('Invalid credentials', 401)
    }

    // Check if user is active
    if (!user.is_active) {
      throw new AuthError('Account is deactivated', 401)
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      throw new AuthError('Invalid credentials', 401)
    }

    // Update last login
    await this.supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Log activity
    await this.logActivity(user.id, 'user_login', 'user', user.id)

    return { user: user as User, token }
  }

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return data as User
  }

  async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error || !data) {
      throw new AuthError(`Failed to update user: ${error?.message || 'User not found'}`, 500)
    }

    // Log activity
    await this.logActivity(userId, 'user_updated', 'user', userId)

    return data as User
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      throw new AuthError(`Failed to delete user: ${error.message}`, 500)
    }

    // Log activity (this won't work since user is deleted, but keeping for reference)
    // await this.logActivity(userId, 'user_deleted', 'user', userId)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get current user
    const user = await this.getUserById(userId)
    if (!user) {
      throw new AuthError('User not found', 404)
    }

    // Verify current password
    const isValidPassword = await this.verifyPassword(currentPassword, user.password_hash || '')
    if (!isValidPassword) {
      throw new AuthError('Current password is incorrect', 401)
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new AuthError('New password must be at least 8 characters long', 400)
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword)

    // Update password
    const { error } = await this.supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId)

    if (error) {
      throw new AuthError(`Failed to update password: ${error.message}`, 500)
    }

    // Log activity
    await this.logActivity(userId, 'password_changed', 'user', userId)
  }

  async logActivity(
    userId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.rpc('log_user_activity', {
        user_uuid: userId,
        action_text: action,
        resource_type_name: resourceType,
        resource_uuid: resourceId,
        ip_addr: ipAddress,
        user_agent_text: userAgent,
        metadata_json: metadata || {}
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  async getUsersWithPagination(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    role: string = 'all',
    is_active: boolean = true,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ users: User[]; pagination: any }> {
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('users')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Apply role filter
    if (role !== 'all') {
      query = query.eq('role', role)
    }

    // Apply active status filter
    query = query.eq('is_active', is_active)

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new AuthError(`Failed to fetch users: ${error.message}`, 500)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      users: data as User[],
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: count || 0,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    }
  }
}

export const authService = new AuthService()
