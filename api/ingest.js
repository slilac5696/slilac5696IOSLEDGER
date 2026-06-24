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

function extractRawMessage(body) {
  if (!body || typeof body !== 'object') return null

  const candidates = [body.raw_message, body.sms, body.body, body.text, body.message]
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)

  const bankSms = candidates.find(
    (c) => c.toLowerCase().includes('transaction from') && c.length > 40
  )
  if (bankSms) return bankSms

  return candidates[0] ?? null
}

function isPlaceholderMessage(msg) {
  if (!msg) return true
  const lower = msg.toLowerCase().trim()
  if (PLACEHOLDERS.has(lower)) return true
  if (lower.startsWith('{{') && lower.endsWith('}}')) return true
  return !lower.includes('Transaction from')
}

export default async function ingest(req, res) {
  const { supabaseUrl, serviceKey } = getConfig()
  const headerKey = req.headers['x-service-key']
  if (!serviceKey || headerKey !== serviceKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body ?? {}
  const user_id = body.user_id ?? body.userId
  const raw_message = extractRawMessage(body)

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' })
  }
  if (!raw_message) {
    return res.status(400).json({
      error:
        'Missing SMS text. Send raw_message with the bank message body (use the Message variable in Shortcuts).',
    })
  }
  if (isPlaceholderMessage(raw_message)) {
    return res.status(400).json({
      error:
        'SMS text not wired correctly. In your Message automation, add a Text action with the Message variable, then use that Text as raw_message — do not type "Shortcut Input".',
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
