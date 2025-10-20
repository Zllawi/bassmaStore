import rateLimit from 'express-rate-limit'
import { env } from '../config/env'

// In development, skip rate limiting to avoid blocking local work.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 300 : Number.MAX_SAFE_INTEGER,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV !== 'production',
  message: { message: 'Too many requests, please try again later.' }
})

export default limiter
