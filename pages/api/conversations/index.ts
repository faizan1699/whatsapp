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
      case 'POST':
        return handlePost(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
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
    const { id, select, user_id } = req.query

    let query = supabase.from('conversations')

    // Apply select if provided
    if (select) {
      query = query.select(String(select))
    } else {
      query = query.select(`
        *,
        conversation_participants(
          *,
          user:profiles(id, username, full_name, avatar_url, is_online, last_seen)
        )
      `)
    }

    // Apply filters
    if (id) {
      query = query.eq('id', String(id))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return res.status(500).json({ error: error.message })
    }

    // If single conversation requested, return single object
    if (id) {
      const conversation = data?.length > 0 ? data[0] : null
      return res.status(200).json(conversation)
    }

    return res.status(200).json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Unexpected error fetching conversations:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handlePost(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { name, is_group, participant_ids } = req.body

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        name: is_group ? name : null,
        is_group: is_group || false,
        created_by: req.user.id
      })
      .select()
      .single()

    if (convError) {
      return res.status(500).json({ error: convError.message })
    }

    // Add participants
    const participants = [...(participant_ids || []), req.user!.id].map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: userId === req.user!.id ? 'admin' : 'member'
    }))

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participants)

    if (partError) {
      return res.status(500).json({ error: partError.message })
    }

    return res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    })
  } catch (error) {
    console.error('Unexpected error creating conversation:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)
