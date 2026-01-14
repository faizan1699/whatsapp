import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'

const supabase = createServerSupabaseClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { q, limit = 20 } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      })
    }

    // Search users by name, username, or email
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, avatar_url')
      .or(`full_name.ilike.%${q}%,username.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(Number(limit))
      .order('full_name', { ascending: true })

    if (error) throw error

    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Search users error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to search users',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
