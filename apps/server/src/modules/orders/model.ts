import mongoose, { Schema } from 'mongoose'

export type OrderStatus = 'pending'|'paid'|'shipped'|'canceled'

export interface IOrderItem { productId: string; name?: string; qty: number; price: number }

export interface IOrder {
  userId: string
  items: IOrderItem[]
  total: number
  status: OrderStatus
  address: string
  customerName: string
  customerPhone: string
  city: string
  region?: string
  addressDescription?: string
  invoiceRef?: string
  createdAt: Date
}

const orderSchema = new Schema<IOrder>({
  userId: { type: String, index: true },
  items: [{ productId: String, name: String, qty: Number, price: Number }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending','paid','shipped','canceled'], default: 'pending', index: true },
  address: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  city: { type: String },
  region: { type: String },
  addressDescription: { type: String },
  invoiceRef: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
})

export const Order = mongoose.model<IOrder>('Order', orderSchema)
