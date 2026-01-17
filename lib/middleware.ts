import { NextApiRequest, NextApiResponse } from 'next'
import { authService, AuthError } from './auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token required'
        })
      }

      const token = authHeader.substring(7)
      const payload = authService.verifyToken(token)

      // Attach user info to request
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }

      // Continue with the handler
      return await handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      if (error instanceof AuthError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message
        })
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication'
      })
    }
  }
}

export function withAdminAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      })
    }

    return await handler(req, res)
  })
}
