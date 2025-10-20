import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getFirestore, FieldValue, Filter, Timestamp } from 'firebase-admin/firestore'
import { env } from '../config/env'
import type { IUser } from '../modules/auth/model'
import type { IProduct } from '../modules/products/model'
import type { IOrder } from '../modules/orders/model'

let app: App | null = null
function ensureApp() {
  if (!app) {
    const creds = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    app = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID!,
        clientEmail: env.FIREBASE_CLIENT_EMAIL!,
        privateKey: creds!
      })
    })
  }
  return app
}

function toPlain<T>(doc: FirebaseFirestore.DocumentSnapshot): (T & { _id: string }) | null {
  if (!doc.exists) return null
  const data = doc.data() as any
  return { _id: doc.id, ...data }
}

const db = () => getFirestore(ensureApp())

export const usersRepo = {
  async findOneByEmail(email: string) {
    const snap = await db().collection('users').where('email','==', email).limit(1).get()
    if (snap.empty) return null as any
    return toPlain<IUser>(snap.docs[0]) as any
  },
  async create(input: Partial<IUser>) {
    const ref = await db().collection('users').add({ ...input, createdAt: Date.now() })
    const doc = await ref.get()
    return toPlain<IUser>(doc) as any
  },
  async findById(id: string) {
    const doc = await db().collection('users').doc(id).get()
    return toPlain<IUser>(doc) as any
  },
  async findAll() {
    const snap = await db().collection('users').limit(200).get()
    return snap.docs.map(d => toPlain<IUser>(d)!) as any
  },
  async updateById(id: string, patch: Partial<IUser>) {
    await db().collection('users').doc(id).set(patch, { merge: true })
    const doc = await db().collection('users').doc(id).get()
    const u = toPlain<IUser>(doc) as any
    if (u) delete (u as any).password
    return u
  },
  async deleteById(id: string) {
    await db().collection('users').doc(id).delete()
    return true
  }
}

export const productsRepo = {
  async list(query: any) {
    // For simplicity in Firestore: fetch latest and filter client-side
    const snap = await db().collection('products').orderBy('createdAt','desc').limit(200).get()
    let items = snap.docs.map(d => toPlain<IProduct>(d)!)
    const { q, category, minPrice, maxPrice, sort } = query || {}
    if (category) items = items.filter(p => (p as any).category === category)
    if (minPrice) items = items.filter(p => (p as any).price >= Number(minPrice))
    if (maxPrice) items = items.filter(p => (p as any).price <= Number(maxPrice))
    if (q) {
      const re = new RegExp(String(q), 'i')
      items = items.filter(p => re.test((p as any).name))
    }
    if (sort) {
      const key = String(sort).replace('-', '') as keyof IProduct
      const dir = String(sort).startsWith('-') ? -1 : 1
      items = items.sort((a: any, b: any) => (a[key] > b[key] ? dir : -dir))
    }
    return items as any
  },
  async byId(id: string) {
    const doc = await db().collection('products').doc(id).get()
    return toPlain<IProduct>(doc) as any
  },
  async create(input: Partial<IProduct>) {
    const ref = await db().collection('products').add({ ...input, createdAt: Date.now() })
    const doc = await ref.get()
    return toPlain<IProduct>(doc) as any
  },
  async update(id: string, patch: Partial<IProduct>) {
    await db().collection('products').doc(id).set(patch, { merge: true })
    const doc = await db().collection('products').doc(id).get()
    return toPlain<IProduct>(doc) as any
  },
  async remove(id: string) {
    await db().collection('products').doc(id).delete()
    return true
  }
}

export const ordersRepo = {
  async create(input: Partial<IOrder>) {
    const ref = await db().collection('orders').add({ ...input, createdAt: Date.now() })
    const doc = await ref.get()
    return toPlain<IOrder>(doc) as any
  },
  async mine(userId: string) {
    const snap = await db().collection('orders').where('userId', '==', userId).orderBy('createdAt','desc').limit(200).get()
    return snap.docs.map(d => toPlain<IOrder>(d)!) as any
  },
  async list(filter: any) {
    let col = db().collection('orders') as FirebaseFirestore.Query
    if (filter?.status) col = col.where('status','==', String(filter.status))
    const snap = await col.orderBy('createdAt','desc').limit(200).get()
    return snap.docs.map(d => toPlain<IOrder>(d)!) as any
  },
  async byId(id: string) { const doc = await db().collection('orders').doc(id).get(); return toPlain<IOrder>(doc) as any },
  async updateStatus(id: string, status: string) {
    await db().collection('orders').doc(id).set({ status }, { merge: true })
    const doc = await db().collection('orders').doc(id).get()
    return toPlain<IOrder>(doc) as any
  },
  async update(id: string, patch: Partial<IOrder>) {
    await db().collection('orders').doc(id).set(patch, { merge: true })
    const doc = await db().collection('orders').doc(id).get()
    return toPlain<IOrder>(doc) as any
  },
  async stats() {
    const snap = await db().collection('orders').limit(1000).get()
    const items = snap.docs.map(d => toPlain<IOrder>(d)!) as any[]
    const count = items.length
    const sales = items.reduce((a, b: any) => a + (b.total || 0), 0)
    return { count, sales, top: 0 }
  }
}
