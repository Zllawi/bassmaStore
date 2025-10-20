import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { loginSchema, registerSchema } from '../../utils/validators'
import { env } from '../../config/env'
import * as svc from './service'

export const register = asyncHandler(async (req: Request, res: Response) => {
  const dto = registerSchema.parse(req.body)
  const { user, accessToken, refreshToken } = await svc.register(dto.name, dto.email, dto.password, dto.phone, dto.city, (dto as any).region, (dto as any).addressDescription)
  const prod = env.NODE_ENV === 'production'
  res.cookie('rt', refreshToken, { httpOnly: true, sameSite: prod ? 'none' : 'lax', secure: prod, maxAge: 7*24*60*60*1000 })
  res.status(201).json({ data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city, region: (user as any).region, addressDescription: (user as any).addressDescription, accessToken } })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const dto = loginSchema.parse(req.body)
  const { user, accessToken, refreshToken } = await svc.login(dto.email, dto.password)
  const prod = env.NODE_ENV === 'production'
  res.cookie('rt', refreshToken, { httpOnly: true, sameSite: prod ? 'none' : 'lax', secure: prod, maxAge: 7*24*60*60*1000 })
  res.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: (user as any).phone, city: (user as any).city, region: (user as any).region, addressDescription: (user as any).addressDescription, accessToken } })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rt = req.cookies?.rt
  if (!rt) return res.status(401).json({ message: 'No refresh token' })
  const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken')
  const { JWT_REFRESH_SECRET } = require('../../config/env').env
  try {
    const payload = jwt.verify(rt, JWT_REFRESH_SECRET) as any
    const accessToken = require('../../utils/jwt').signAccessToken({ id: payload.id, role: payload.role })
    res.json({ data: { accessToken } })
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
})

export const forgot = asyncHandler(async (req: Request, res: Response) => {
  // Dummy: Pretend we sent email
  console.log('Password reset requested for:', req.body.email)
  res.json({ message: 'If the email exists, a reset link was sent.' })
})

export const reset = asyncHandler(async (_req: Request, res: Response) => {
  // Dummy: Pretend reset succeeded
  res.json({ message: 'Password reset successful (dummy)' })
})
