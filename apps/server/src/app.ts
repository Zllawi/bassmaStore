import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import mongoose from 'mongoose'
import { env } from './config/env'
import rateLimiter from './middlewares/rateLimit'
import { notFound, onError } from './middlewares/error'
import authRouter from './modules/auth/router'
import productsRouter from './modules/products/router'
import ordersRouter from './modules/orders/router'
import usersRouter from './modules/users/router'

const app = express()
// When behind reverse proxies (e.g., Render/Heroku/Nginx), trust the proxy to get correct IPs
app.set('trust proxy', 1)

// Helmet: allow cross-origin resource policy so SPA on different port can load /uploads images
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
// CORS: allow configured origin plus common local dev variants
app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // Allow non-browser or same-origin requests (no Origin header)
      if (!origin) return cb(null, true)

      const allowed = new Set([
        env.CORS_ORIGIN,
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ])

      const isDev = env.NODE_ENV !== 'production'

      // Allow exact matches
      if (allowed.has(origin)) return cb(null, true)

      // In dev, allow any localhost/127.x port and file:// (Origin "null")
      if (
        isDev &&
        (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || origin === 'null')
      ) {
        return cb(null, true)
      }

      return cb(new Error('Not allowed by CORS'))
    }
  })
)
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))
app.use(rateLimiter)

// Friendly root route for platform/browser visits
app.get('/', (_req, res) => {
  res.type('text/plain').send('API is running. See /api/v1/health')
})

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }))

// DB health with helpful status/error for quick diagnostics
app.get('/api/v1/health/db', async (_req, res) => {
  const info: any = { vendor: env.DB_VENDOR, state: 'unknown', fallback: process.env.DB_FALLBACK }
  try {
    if (env.DB_VENDOR === 'mongodb' || env.DB_VENDOR === 'memory') {
      const stateMap = ['disconnected','connected','connecting','disconnecting'] as const
      const rs = (mongoose.connection as any).readyState as 0|1|2|3|undefined
      info.state = rs !== undefined ? stateMap[rs] : 'unknown'
      if (rs === 1 && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping()
        info.ping = 'ok'
      } else {
        info.ping = 'skipped'
      }
      info.name = mongoose.connection.name
      info.host = (mongoose.connection as any).host
    } else if (env.DB_VENDOR === 'firebase') {
      info.state = 'initialized'
      info.ping = 'n/a'
    }
    res.json({ ok: true, db: info })
  } catch (e: any) {
    info.error = e?.message || String(e)
    res.status(500).json({ ok: false, db: info })
  }
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/orders', ordersRouter)
app.use('/api/v1/users', usersRouter)

app.use(notFound)
app.use(onError)

export default app
