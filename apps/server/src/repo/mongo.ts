import type { IUser } from '../modules/auth/model'
import { User } from '../modules/auth/model'
import type { IProduct } from '../modules/products/model'
import { Product } from '../modules/products/model'
import type { IOrder } from '../modules/orders/model'
import { Order } from '../modules/orders/model'

export const usersRepo = {
  async findOneByEmail(email: string) {
    return User.findOne({ email })
  },
  async create(input: Partial<IUser>) {
    return User.create(input as any)
  },
  async findById(id: string) {
    return User.findById(id)
  },
  async findAll() {
    return User.find().select('-password').limit(200)
  },
  async updateById(id: string, patch: Partial<IUser> | any, options: any = {}) {
    return User.findByIdAndUpdate(id, patch, { new: true, ...options }).select('-password')
  },
  async deleteById(id: string) {
    await User.findByIdAndDelete(id)
    return true
  }
}

export const productsRepo = {
  async list(query: any) {
    const { q, category, minPrice, maxPrice, sort } = query
    const filter: any = {}
    if (q) filter.name = { $regex: new RegExp(q, 'i') }
    if (category) filter.category = category
    if (minPrice || maxPrice) filter.price = { ...(minPrice?{ $gte: Number(minPrice) }:{}), ...(maxPrice?{ $lte: Number(maxPrice) }:{}) }
    const sortBy: any = {}
    if (sort) sortBy[sort.replace('-', '')] = sort.startsWith('-') ? -1 : 1
    const data = await Product.find(filter).sort(sortBy).limit(100)
    return data
  },
  async byId(id: string) { return Product.findById(id) },
  async create(input: Partial<IProduct>) { return Product.create(input as any) },
  async update(id: string, patch: Partial<IProduct>) { return Product.findByIdAndUpdate(id, patch, { new: true }) },
  async remove(id: string) { await Product.findByIdAndDelete(id); return true }
}

export const ordersRepo = {
  async create(input: Partial<IOrder>) { return Order.create(input as any) },
  async mine(userId: string) { return Order.find({ userId }).sort({ createdAt: -1 }) },
  async list(filter: any) {
    const q: any = {}
    if (filter.status) q.status = filter.status
    if (filter.userId) q.userId = filter.userId
    return Order.find(q).sort({ createdAt: -1 }).limit(200)
  },
  async byId(id: string) { return Order.findById(id) },
  async updateStatus(id: string, status: string) { return Order.findByIdAndUpdate(id, { status }, { new: true }) },
  async update(id: string, patch: Partial<IOrder>) { return Order.findByIdAndUpdate(id, patch, { new: true }) },
  async stats() {
    const count = await Order.countDocuments()
    const salesArr = await Order.aggregate([{ $group: { _id: null, sum: { $sum: "$total" } } }])
    const sales = salesArr[0]?.sum || 0
    return { count, sales, top: 0 }
  }
}
