import 'dotenv/config'
import { createServer } from 'http'
import app from './app'
import { env } from './config/env'
import { connectDB } from './config/db'
import { ensureDevSeedIfEmpty } from './scripts/bootstrap'

async function bootstrap() {
  await connectDB()
  await ensureDevSeedIfEmpty()
  const server = createServer(app)

  server.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${env.PORT} is already in use. Please stop the process using it or set PORT to a free port.`)
    } else {
      console.error('HTTP server error:', err)
    }
    process.exit(1)
  })

  server.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
