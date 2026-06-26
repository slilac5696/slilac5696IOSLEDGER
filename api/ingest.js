import {
  extractSmsFromRequest,
  saveTransaction,
  looksLikeBankSms,
} from './ingestLib.js'

function getConfig() {
  return {
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

function extractUserId(body, query) {
  const id = query?.user_id ?? body?.user_id ?? body?.userId
  return typeof id === 'string' ? id.trim() : null
}

function isPlaceholderMessage(msg) {
  const lower = msg.toLowerCase().trim()
  const placeholders = new Set([
    'shortcut input', 'message', 'sms', 'text', 'provided input', 'input',
  ])
  return placeholders.has(lower) || !looksLikeBankSms(msg)
}

export default async function ingest(req, res) {
  const { serviceKey } = getConfig()
  const headerKey = req.headers['x-service-key']
  if (!serviceKey || headerKey !== serviceKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = typeof req.body === 'object' ? req.body : {}
  const user_id = extractUserId(body, req.query)
  const raw_message = extractSmsFromRequest(req)

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' })
  }
  if (!raw_message) {
    return res.status(400).json({ error: 'Missing SMS text' })
  }
  if (isPlaceholderMessage(raw_message)) {
    return res.status(400).json({ error: 'SMS text not wired correctly in Shortcut' })
  }

  try {
    await saveTransaction(user_id, raw_message)
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
