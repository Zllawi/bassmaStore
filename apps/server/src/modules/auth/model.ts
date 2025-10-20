import mongoose, { Schema } from 'mongoose'

export type UserRole = 'admin'|'user'

export interface IUser {
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  phone?: string
  city?: string
  region?: string
  addressDescription?: string
  tokenVersion?: number
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  phone: { type: String },
  city: { type: String },
  region: { type: String },
  addressDescription: { type: String },
  tokenVersion: { type: Number, default: 0 }
})

export const User = mongoose.model<IUser>('User', userSchema)
