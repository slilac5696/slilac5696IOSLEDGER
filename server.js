import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import ingestHandler from './api/ingest.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distIndex = join(__dirname, 'dist', 'index.html')
const isProd =
  process.env.NODE_ENV === 'production' || existsSync(distIndex)
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/ingest', ingestHandler)

if (isProd) {
  app.use(express.static(join(__dirname, 'dist')))
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'))
  })
} else {
  const { createServer } = await import('vite')
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  })
  app.use(vite.middlewares)
}

app.listen(PORT, HOST, () => {
  console.log(`Ledger running at http://${HOST}:${PORT} (${isProd ? 'production' : 'dev'})`)
})
