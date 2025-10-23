import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import fs from 'fs'
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
const configuredOrigins = (env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
  .map(o => o.replace(/\/+$/, ''))

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // Allow non-browser or same-origin requests (no Origin header)
      if (!origin) return cb(null, true)

      const normalizedOrigin = origin.replace(/\/+$/, '')
      const isDev = env.NODE_ENV !== 'production'

      if (configuredOrigins.includes(normalizedOrigin)) return cb(null, true)

      if (configuredOrigins.length) {
        try {
          const originUrl = new URL(origin)
          const hostMatch = configuredOrigins.some(cfg => {
            try {
              const cfgUrl = new URL(cfg)
              return cfgUrl.host === originUrl.host
            } catch {
              return false
            }
          })
          if (hostMatch) return cb(null, true)
        } catch {
          // ignore parsing errors
        }
      }

      // Allow localhost variants in dev
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

const candidateClientDirs = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'apps/client/dist')
]

const clientDistPath = candidateClientDirs.find((p) => fs.existsSync(path.join(p, 'index.html')))
if (clientDistPath) {
  console.log('[static] Serving client build from:', clientDistPath)
  app.use(express.static(clientDistPath, { index: false }))
} else {
  console.warn('[static] client dist not found. Checked:', candidateClientDirs.join(', '))
}

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }))

// Uploads/storage health (Cloudinary/S3/local)
app.get('/api/v1/health/uploads', async (_req, res) => {
  const info: any = { provider: env.UPLOADS_PROVIDER }
  try {
    if (env.UPLOADS_PROVIDER === 'cloudinary') {
      const { v2: cloudinary } = await import('cloudinary')
      // Configure from separate vars if CLOUDINARY_URL not provided
      if (!process.env.CLOUDINARY_URL && env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
        cloudinary.config({
          cloud_name: env.CLOUDINARY_CLOUD_NAME,
          api_key: env.CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET
        })
      }
      info.vendor = 'cloudinary'
      try {
        const r: any = await (cloudinary as any).api.ping()
        info.ping = r?.status || 'ok'
      } catch (e: any) {
        info.ping = 'failed'
        info.error = e?.message || String(e)
        return res.status(500).json({ ok: false, uploads: info })
      }
      return res.json({ ok: true, uploads: info })
    }
    if (env.UPLOADS_PROVIDER === 's3') {
      info.vendor = 's3-compatible'
      // We intentionally avoid network calls here; presence of vars is a light-health signal
      info.bucket = process.env.S3_BUCKET || 'unset'
      return res.json({ ok: Boolean(process.env.S3_BUCKET), uploads: info })
    }
    // local
    info.vendor = 'local'
    info.path = 'uploads/'
    return res.json({ ok: true, uploads: info })
  } catch (e: any) {
    info.error = e?.message || String(e)
    return res.status(500).json({ ok: false, uploads: info })
  }
})

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

if (clientDistPath) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    if (req.path.startsWith('/uploads/')) return next()
    // Only serve SPA index for non-asset routes without a file extension
    const hasExt = path.extname(req.path)
    const acceptsHtml = (req.headers['accept'] || '').toString().includes('text/html')
    if (!hasExt && acceptsHtml) {
      const indexPath = path.join(clientDistPath, 'index.html')
      return res.sendFile(indexPath, err => {
        if (err) {
          console.error('[static] Failed to send index.html:', err)
          next(err)
        }
      })
    }
    return next()
  })
} else {
  // Friendly root route for platform/browser visits when SPA isn't bundled with the API
  app.get('/', (_req, res) => {
    res.type('text/plain').send('API is running. See /api/v1/health')
  })
}

app.use(notFound)
app.use(onError)

export default app
