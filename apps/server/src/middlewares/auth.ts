import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export type JwtUser = { id: string; role: 'admin'|'user' }

declare global {
  namespace Express {
    interface Request { user?: JwtUser }
  }
}

export function auth(required = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      if (required) return res.status(401).json({ message: 'Unauthorized' })
      return next()
    }
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUser & { iat: number, exp: number }
      req.user = { id: payload.id, role: payload.role }
      return next()
    } catch (e) {
      if (required) return res.status(401).json({ message: 'Invalid token' })
      return next()
    }
  }
}

export function requireRole(role: 'admin'|'user') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    if (role === 'admin' && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    return next()
  }
}

