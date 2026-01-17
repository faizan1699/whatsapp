import { NextApiRequest, NextApiResponse } from 'next'
import { authService, AuthError } from '../../../lib/auth'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'

// Initialize Supabase client for profiles table
const supabase = createServerSupabaseClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        return handleGet(req, res)
      case 'POST':
        return handlePost(req, res)
      case 'PUT':
        return handlePut(req, res)
      case 'DELETE':
        return handleDelete(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// GET /api/users - Fetch all users with pagination and filtering
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = 'all',
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc',
      source = 'profiles' // 'profiles' for Supabase auth users, 'users' for branched API users
    } = req.query as any

    if (source === 'users') {
      // Use branched users table
      const result = await authService.getUsersWithPagination(
        Number(page),
        Number(limit),
        search,
        role,
        status === 'all' ? undefined : status === 'active',
        sortBy,
        sortOrder
      )

      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
        source: 'users'
      })
    } else {
      // Use original profiles table (Supabase auth)
      const offset = (Number(page) - 1) * Number(limit)

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (search) {
        if (source === 'users') {
          // For branched users table, search email, username, full_name, phone
          query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
        } else {
          // For profiles table, search username, full_name (no email/phone in profiles)
          query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
        }
      }

      // Apply status filter
      if (status !== 'all') {
        query = query.eq('is_online', status === 'online')
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      query = query.range(offset, offset + Number(limit) - 1)

      const { data, error, count } = await query

      if (error) throw error

      const totalPages = Math.ceil((count || 0) / Number(limit))

      return res.status(200).json({
        success: true,
        data: data || [],
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalUsers: count || 0,
          pageSize: Number(limit),
          hasNextPage: Number(page) < totalPages,
          hasPreviousPage: Number(page) > 1
        },
        source: 'profiles'
      })
    }
  } catch (error) {
    console.error('GET users error:', error)
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// POST /api/users - Create new user
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      email, 
      password, 
      full_name, 
      username, 
      phone, 
      role,
      source = 'profiles' // 'profiles' for Supabase auth, 'users' for branched API
    } = req.body

    if (source === 'users') {
      // Use branched users table
      const user = await authService.createUser({
        email,
        password,
        full_name,
        username,
        phone,
        role
      })

      return res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
        source: 'users'
      })
    } else {
      // Use original Supabase auth + profiles
      // Validate required fields
      if (!email || !password || !full_name || !username) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          required: ['email', 'password', 'full_name', 'username']
        })
      }

      // Validate email format
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        })
      }

      // Validate password
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        })
      }

      // Validate username
      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          error: 'Username can only contain letters, numbers, and underscores'
        })
      }

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username already exists'
        })
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          username
        }
      })

      if (authError) {
        return res.status(400).json({
          success: false,
          error: 'Failed to create auth user',
          details: authError.message
        })
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          full_name,
          phone: phone || null
        })
        .select()
        .single()

      if (profileError) {
        // Rollback auth user creation if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return res.status(500).json({
          success: false,
          error: 'Failed to create user profile',
          details: profileError.message
        })
      }

      return res.status(201).json({
        success: true,
        data: profileData,
        message: 'User created successfully',
        source: 'profiles'
      })
    }
  } catch (error) {
    console.error('POST users error:', error)
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// PUT /api/users - Update user
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      id, 
      full_name, 
      username, 
      phone, 
      role, 
      is_active,
      source = 'profiles' // 'profiles' for Supabase auth, 'users' for branched API
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      })
    }

    if (source === 'users') {
      // Use branched users table
      const updates: any = {}
      if (full_name !== undefined) updates.full_name = full_name
      if (username !== undefined) updates.username = username
      if (phone !== undefined) updates.phone = phone
      if (role !== undefined) updates.role = role
      if (is_active !== undefined) updates.is_active = is_active

      const updatedUser = await authService.updateUser(id, updates)

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
        source: 'users'
      })
    } else {
      // Use original profiles table
      // Validate required fields
      if (!full_name || !username) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          required: ['full_name', 'username']
        })
      }

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existingUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }

      // Check if username is being changed and if it's already taken
      if (username !== existingUser.username) {
        const { data: usernameCheck } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .neq('id', id)
          .single()

        if (usernameCheck) {
          return res.status(409).json({
            success: false,
            error: 'Username already exists'
          })
        }
      }

      // Update user
      const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name,
          username,
          phone: phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update user',
          details: updateError.message
        })
      }

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
        source: 'profiles'
      })
    }
  } catch (error) {
    console.error('PUT users error:', error)
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// DELETE /api/users - Delete user
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, source = 'profiles' } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      })
    }

    if (source === 'users') {
      // Use branched users table
      await authService.deleteUser(id as string)

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        source: 'users'
      })
    } else {
      // Use original Supabase auth + profiles
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existingUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }

      // Delete from auth (this will cascade delete profile)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(id as string)

      if (deleteError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete user',
          details: deleteError.message
        })
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        source: 'profiles'
      })
    }
  } catch (error) {
    console.error('DELETE users error:', error)
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    }
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
