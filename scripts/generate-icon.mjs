import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(join(__dirname, '../public/icon.svg'))

try {
  const sharp = (await import('sharp')).default
  const png = await sharp(svg).resize(192, 192).png().toBuffer()
  writeFileSync(join(__dirname, '../public/icon-192.png'), png)
  console.log('Generated public/icon-192.png')
} catch {
  // Fallback: minimal valid 192x192 PNG with teal background (no sharp)
  const { createRequire } = await import('module')
  console.warn('sharp not installed — run: npm install -D sharp')
  process.exit(1)
}
