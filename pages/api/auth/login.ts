import { NextApiRequest, NextApiResponse } from 'next'
import { authService, AuthError } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    const result = await authService.login({ email, password })

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          full_name: result.user.full_name,
          role: result.user.role,
          is_active: result.user.is_active,
          avatar_url: result.user.avatar_url
        },
        token: result.token
      },
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      })
    }
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
