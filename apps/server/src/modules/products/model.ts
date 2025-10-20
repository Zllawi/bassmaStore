import mongoose, { Schema } from 'mongoose'

export interface IProduct {
  name: string
  slug: string
  price: number
  images: string[]
  category: string
  stock: number
  description?: string
  isFeatured?: boolean
  discount?: number
  createdAt: Date
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: String, index: true },
  stock: { type: Number, default: 0 },
  description: { type: String },
  isFeatured: { type: Boolean, default: false, index: true },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
})

export const Product = mongoose.model<IProduct>('Product', productSchema)

