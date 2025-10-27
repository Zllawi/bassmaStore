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
  addresses?: Array<{
    id: string
    label?: string
    name: string
    phone: string
    city: string
    region: string
    address: string
    addressDescription?: string
    isDefault?: boolean
  }>
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
  addresses: [{
    id: { type: String, required: true },
    label: { type: String },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    address: { type: String, required: true },
    addressDescription: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  tokenVersion: { type: Number, default: 0 }
})

export const User = mongoose.model<IUser>('User', userSchema)
