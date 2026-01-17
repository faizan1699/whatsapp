import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'
import { AuthenticatedRequest, withAuth } from '../../../lib/middleware'

const supabase = createServerSupabaseClient()

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { select, id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(select ? String(select) : '*')
        .eq('id', String(id))
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Profile not found' })
        }
        return res.status(500).json({ error: error.message })
      }

      if (!data) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      return res.status(200).json(data)
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default withAuth(handler)
