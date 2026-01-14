import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'

// CORS middleware
const allowCors = (fn: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  return await fn(req, res)
}

const supabase = createServerSupabaseClient()

export default allowCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      case 'PUT':
        return await handlePut(req, res)
      case 'DELETE':
        return await handleDelete(req, res)
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
})

// GET /api/users-table - Fetch all users with pagination and filtering
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = 'all',
      is_active = true,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query as any

    const offset = (Number(page) - 1) * Number(limit)

    // Build query
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply role filter
    if (role !== 'all') {
      query = query.eq('role', role)
    }

    // Apply active status filter
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true')
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
    console.error('GET users-table error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// POST /api/users-table - Create new user
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password, full_name, username, phone, role = 'user' } = req.body

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

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      })
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      })
    }

    // Hash password (in production, use bcrypt)
    const password_hash = password // Note: Use bcrypt in production!

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        full_name,
        username,
        phone: phone || null,
        role
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create user',
        details: error.message
      })
    }

    return res.status(201).json({
      success: true,
      data,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('POST users-table error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// PUT /api/users-table - Update user
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, full_name, username, phone, role, is_active } = req.body

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
      .from('users')
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
        .from('users')
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
      .from('users')
      .update({
        full_name,
        username,
        phone: phone || null,
        role: role || existingUser.role,
        is_active: is_active !== undefined ? is_active : existingUser.is_active,
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
    console.error('PUT users-table error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// DELETE /api/users-table - Delete user
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
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

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
    console.error('DELETE users-table error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
