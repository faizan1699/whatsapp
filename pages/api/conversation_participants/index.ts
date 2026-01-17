import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'
import { AuthenticatedRequest, withAuth } from '../../../lib/middleware'

const supabase = createServerSupabaseClient()

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req.query

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res)
      default:
        res.setHeader('Allow', ['GET'])
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

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { select, conversation_id, user_id } = req.query

    let query = supabase.from('conversation_participants')

    // Apply select if provided
    if (select) {
      query = query.select(String(select))
    } else {
      query = query.select(`
        *,
        user:profiles(id, username, full_name, avatar_url, is_online, last_seen),
        conversation:conversations(id, name, is_group, avatar_url, created_by, created_at, updated_at)
      `)
    }

    // Apply filters
    if (conversation_id) {
      query = query.eq('conversation_id', String(conversation_id))
    }
    if (user_id) {
      query = query.eq('user_id', String(user_id))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching conversation participants:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data || [])
  } catch (error) {
    console.error('Unexpected error fetching conversation participants:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
