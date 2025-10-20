import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken } from '../../utils/jwt'
import { usersRepo } from '../../repo'

export async function register(name: string, email: string, password: string, phone?: string, city?: string, region?: string, addressDescription?: string) {
  const exist = await usersRepo.findOneByEmail(email)
  if (exist) throw Object.assign(new Error('Email already exists'), { status: 409 })
  const hash = await bcrypt.hash(password, 10)
  const user = await usersRepo.create({ name, email, password: hash, role: 'user', createdAt: new Date() as any, phone, city, region, addressDescription }) as any
  const payload = { id: user.id, role: user.role }
  return { user, accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) }
}

export async function login(email: string, password: string) {
  const user: any = await usersRepo.findOneByEmail(email)
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  const payload = { id: user.id, role: user.role }
  return { user, accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) }
}

export async function me(userId: string) {
  const user: any = await usersRepo.findById(userId)
  if (user) delete user.password
  return user
}
