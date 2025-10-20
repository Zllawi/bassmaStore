import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import { env } from '../config/env'
import { User } from '../modules/auth/model'
import { Product } from '../modules/products/model'

export async function ensureDevSeedIfEmpty() {
  // Ensure uploads directory
  const uploadsDir = path.resolve(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

  // Only auto-seed in memory vendor to avoid polluting real DBs
  if (env.DB_VENDOR !== 'memory') return

  const adminEmail = 'admin@shop.test'
  const hasAdmin = await User.findOne({ email: adminEmail })
  if (!hasAdmin) {
    await User.create({ name: 'Admin', email: adminEmail, password: await bcrypt.hash('Admin@123', 10), role: 'admin', phone: '0910000000', city: 'طرابلس', region: 'المركز', addressDescription: 'العنوان الافتراضي - طرابلس، المركز' })
    console.log('[bootstrap] Admin created:', adminEmail)
  }

  const pCount = await Product.countDocuments()
  if (pCount < 12) {
    const base = [
      { name: 'سماعات لاسلكية', price: 199, category: 'electronics' },
      { name: 'ساعة ذكية', price: 399, category: 'electronics' },
      { name: 'قميص كلاسيك', price: 99, category: 'fashion' },
      { name: 'حذاء رياضي', price: 249, category: 'fashion' },
      { name: 'مصباح مكتب', price: 79, category: 'home' },
      { name: 'خلاط مطبخ', price: 149, category: 'home' },
      { name: 'لوحة مفاتيح ميكانيكية', price: 299, category: 'electronics' },
      { name: 'ماوس ألعاب', price: 159, category: 'electronics' },
      { name: 'بنطال جينز', price: 129, category: 'fashion' },
      { name: 'معطف شتوي', price: 349, category: 'fashion' },
      { name: 'سجادة صوف', price: 499, category: 'home' },
      { name: 'كرسي مريح', price: 599, category: 'home' }
    ]
    for (const p of base) {
      await Product.create({ ...p, images: [], stock: 20, isFeatured: false, discount: 0, slug: p.name + '-' + Math.random().toString(36).slice(2,5) })
    }
    console.log('[bootstrap] Seeded products')
  }
}
