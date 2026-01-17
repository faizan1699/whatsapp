import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabaseServer'

const supabase = createServerSupabaseClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    // Disable RLS temporarily for seeding
    await supabase.rpc('disable_rls_temporarily')
    
    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'faizanrasheed169@gmail.com')
      .single()

    if (existingUser) {
      return res.status(200).json({ 
        success: true, 
        message: 'Admin user already exists',
        user: existingUser
      })
    }

    // Insert admin user (password: admin123)
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: '550e8400-299a-4d6a-8f5e-123456789abc', // Fixed UUID for testing
        email: 'faizanrasheed169@gmail.com',
        password_hash: '$2b$12$LQv3c1yqBWVwZ46Bg5E8G7R9fO2c1yqBWVwZ46Bg5E8G7R9fO', // bcrypt hash of 'admin123'
        username: 'faizan_admin',
        full_name: 'Faizan Rasheed',
        role: 'admin',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin user:', error)
      return res.status(500).json({ error: error.message })
    }

    // Create user preferences
    const { error: prefError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: '550e8400-299a-4d6a-8f5e-123456789abc',
        theme: 'dark',
        language: 'en',
        notifications_enabled: true,
        email_notifications: true,
        push_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (prefError) {
      console.warn('Warning: Could not create user preferences:', prefError.message)
    }

    return res.status(200).json({
      success: true,
      message: 'Admin user created successfully',
      user: data
    })

  } catch (error) {
    console.error('Seed admin error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
