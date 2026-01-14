import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'

const supabase = createServerSupabaseClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Valid user ID is required'
    })
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(id as string, res)
      case 'PUT':
        return handlePut(id as string, req, res)
      case 'DELETE':
        return handleDelete(id as string, res)
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
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

// GET /api/users-table/[id] - Get single user
async function handleGet(id: string, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }
      throw error
    }

    return res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    console.error('GET user error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// PUT /api/users-table/[id] - Update single user
async function handlePut(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { full_name, username, phone, role, is_active } = req.body

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
    console.error('PUT user error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// DELETE /api/users-table/[id] - Delete single user
async function handleDelete(id: string, res: NextApiResponse) {
  try {
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
    console.error('DELETE user error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
