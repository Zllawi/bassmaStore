import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import { env } from '../config/env'

export function signAccessToken(payload: object) {
  return jwt.sign(payload as any, env.JWT_ACCESS_SECRET as Secret, { expiresIn: env.ACCESS_TOKEN_TTL } as SignOptions)
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload as any, env.JWT_REFRESH_SECRET as Secret, { expiresIn: env.REFRESH_TOKEN_TTL } as SignOptions)
}
