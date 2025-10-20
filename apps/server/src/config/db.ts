import mongoose from 'mongoose'
import { env } from './env'

let memServer: any = null

export async function connectDB() {
  if (env.DB_VENDOR === 'mongodb') {
    if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required for MongoDB vendor')
    try {
      await mongoose.connect(env.MONGODB_URI)
      console.log('Connected to MongoDB')
      return
    } catch (err: any) {
      console.error('[DB] Failed to connect to MongoDB:', err?.message || err)
      if (env.NODE_ENV !== 'production') {
        console.warn('[DB] Falling back to in-memory MongoDB for development so the API can start.')
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server')
          memServer = await MongoMemoryServer.create()
          const uri = memServer.getUri()
          await mongoose.connect(uri)
          // Expose a hint for health route/UI
          process.env.DB_FALLBACK = 'memory'
          console.log('Connected to in-memory MongoDB (fallback)')
          return
        } catch (fallbackErr: any) {
          console.error('[DB] Fallback to in-memory MongoDB failed:', fallbackErr?.message || fallbackErr)
          throw err
        }
      }
      // In production, do not fallback silently
      throw err
    }
  }
  if (env.DB_VENDOR === 'memory') {
    if (env.NODE_ENV === 'production') {
      throw new Error('DB_VENDOR=memory is not allowed in production.')
    }
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    memServer = await MongoMemoryServer.create()
    const uri = memServer.getUri()
    await mongoose.connect(uri)
    console.log('Connected to in-memory MongoDB (dev only)')
    return
  }
  if (env.DB_VENDOR === 'firebase') {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app')
    if (!getApps().length) {
      const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      initializeApp({ credential: cert({ projectId: env.FIREBASE_PROJECT_ID!, clientEmail: env.FIREBASE_CLIENT_EMAIL!, privateKey: privateKey! }) })
    }
    console.log('Initialized Firebase Admin SDK (Firestore)')
    return
  }
}
