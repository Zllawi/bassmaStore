import mongoose from 'mongoose'
import { env } from '../config/env'
import { connectDB } from '../config/db'
import { User } from '../modules/auth/model'
import { Product } from '../modules/products/model'
import bcrypt from 'bcryptjs'

async function run() {
  await connectDB()
  console.log('Seeding data...')

  const adminEmail = 'admin@shop.test'
  const adminPass = 'Admin@123'
  const admin = await User.findOne({ email: adminEmail })
  if (!admin) {
    await User.create({ name: 'Admin', email: adminEmail, password: await bcrypt.hash(adminPass, 10), role: 'admin' })
    console.log('Admin created:', adminEmail)
  } else {
    console.log('Admin exists')
  }

  const count = await Product.countDocuments()
  if (count < 12) {
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
    console.log('Seeded products')
  } else {
    console.log('Products already seeded')
  }

  await mongoose.connection.close()
  console.log('Done.')
}

run().catch(e => { console.error(e); process.exit(1) })

