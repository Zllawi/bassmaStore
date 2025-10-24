import { z } from 'zod'

export const libyaCities = z.enum([
  \u0027طرابلس\u0027,\u0027بنغازي\u0027,\u0027مصراتة\u0027,\u0027الزاوية\u0027,\u0027زليتن\u0027,\u0027سبها\u0027,\u0027سرت\u0027,\u0027درنة\u0027,\u0027البيضاء\u0027,\u0027طبرق\u0027,\u0027أجدابيا\u0027,\u0027غريان\u0027,\u0027نالوت\u0027,\u0027غات\u0027,\u0027الجفرة\u0027,\u0027وادي الشاطئ\u0027,\u0027مرزق\u0027,\u0027بني وليد\u0027,\u0027زوارة\u0027
])

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(6).max(20).optional(),
  city: libyaCities.optional(),
  region: z.string().min(2).optional(),
  addressDescription: z.string().min(4).optional()
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const productCreateSchema = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  images: z.array(z.string()).default([]),
  category: z.string().default('general'),
  stock: z.number().int().nonnegative().default(0),
  description: z.string().default(''),
  isFeatured: z.boolean().default(false),
  discount: z.number().min(0).max(100).default(0)
})

export const productUpdateSchema = productCreateSchema.partial()

export const orderCreateSchema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive(), price: z.number().nonnegative() })),
  total: z.number().nonnegative(),
  address: z.string().min(4).optional(),
  customerName: z.string().min(2).optional(),
  customerPhone: z.string().min(6).max(20).optional(),
  city: libyaCities.optional(),
  region: z.string().min(2).optional(),
  addressDescription: z.string().min(4).optional()
})

