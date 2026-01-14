import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'

// Initialize Supabase client
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
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query as any

    const offset = (Number(page) - 1) * Number(limit)

    // Build query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`)
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
      }
    })
  } catch (error) {
    console.error('GET users error:', error)
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
    const { email, password, full_name, username, phone } = req.body

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
        phone: phone || null,
        email
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
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('POST users error:', error)
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
    const { id, full_name, username, phone } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      })
    }

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
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('PUT users error:', error)
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
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
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
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('DELETE users error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
