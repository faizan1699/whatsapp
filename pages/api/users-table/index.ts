import { NextApiRequest, NextApiResponse } from 'next'
import { authService, AuthError } from '../../../lib/auth'

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

    const result = await authService.getUsersWithPagination(
      Number(page),
      Number(limit),
      search,
      role,
      is_active === 'true',
      sortBy,
      sortOrder
    )

    return res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('GET users-table error:', error)
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

// POST /api/users-table - Create new user
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password, full_name, username, phone, role } = req.body

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
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('POST users-table error:', error)
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
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('PUT users-table error:', error)
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

    await authService.deleteUser(id as string)

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('DELETE users-table error:', error)
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
