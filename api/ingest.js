function getConfig() {
  return {
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

const PLACEHOLDERS = new Set([
  'shortcut input',
  'message',
  'sms',
  'text',
  'provided input',
  'input',
])

function looksLikeBankSms(value) {
  return (
    typeof value === 'string' &&
    value.trim().toLowerCase().includes('transaction from') &&
    value.trim().length > 40
  )
}

function findBankSms(value, depth = 0) {
  if (depth > 6 || value == null) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return looksLikeBankSms(trimmed) ? trimmed : null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findBankSms(item, depth + 1)
      if (found) return found
    }
    return null
  }

  if (typeof value === 'object') {
    for (const v of Object.values(value)) {
      const found = findBankSms(v, depth + 1)
      if (found) return found
    }
  }

  return null
}

function extractUserId(body, query) {
  const id = query?.user_id ?? body?.user_id ?? body?.userId
  return typeof id === 'string' ? id.trim() : null
}

function extractRawMessage(body, rawBody) {
  if (typeof rawBody === 'string' && rawBody.trim()) {
    const trimmed = rawBody.trim()
    if (looksLikeBankSms(trimmed)) return trimmed
    try {
      const parsed = JSON.parse(trimmed)
      const fromJson = findBankSms(parsed)
      if (fromJson) return fromJson
    } catch {
      // not JSON
    }
  }

  if (body && typeof body === 'object') {
    const fromBody = findBankSms(body)
    if (fromBody) return fromBody

    const candidates = [
      body.raw_message,
      body.rawMessage,
      body.sms,
      body.body,
      body.content,
      body.text,
      body.message,
    ]
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)

    return candidates[0] ?? null
  }

  return null
}

function isPlaceholderMessage(msg) {
  if (!msg) return true
  const lower = msg.toLowerCase().trim()
  if (PLACEHOLDERS.has(lower)) return true
  if (lower.startsWith('{{') && lower.endsWith('}}')) return true
  return !lower.includes('transaction from')
}

export default async function ingest(req, res) {
  const { supabaseUrl, serviceKey } = getConfig()
  const headerKey = req.headers['x-service-key']
  if (!serviceKey || headerKey !== serviceKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user_id = extractUserId(
    typeof req.body === 'object' ? req.body : {},
    req.query
  )
  const raw_message = extractRawMessage(
    typeof req.body === 'object' ? req.body : {},
    typeof req.body === 'string' ? req.body : req.rawBody
  )

  if (!user_id) {
    return res.status(400).json({
      error:
        'Missing user_id. Add it in JSON/Form body, or append ?user_id=YOUR-UUID to the URL.',
    })
  }
  if (!raw_message) {
    return res.status(400).json({
      error:
        'Missing SMS text. Easiest fix: set URL to .../api/ingest?user_id=YOUR-UUID, Request Body = Text (bank SMS), Content-Type = text/plain.',
    })
  }
  if (isPlaceholderMessage(raw_message)) {
    return res.status(400).json({
      error:
        'SMS text not wired correctly. Add a Text action with the Message variable, then use that Text as the request body.',
    })
  }

  if (!supabaseUrl) {
    return res.status(500).json({ error: 'Server misconfigured: missing SUPABASE_URL' })
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ user_id, raw_message }),
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
