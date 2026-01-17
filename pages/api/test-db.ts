import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    // Test database connection
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if users table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'profiles', 'conversations'])

    if (tableError) {
      return res.status(500).json({ error: tableError.message })
    }

    // Check users table count
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    return res.status(200).json({
      success: true,
      tables: tables?.map(t => t.table_name) || [],
      usersCount: count,
      countError: countError?.message,
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'
      }
    })

  } catch (error) {
    console.error('Test DB error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
