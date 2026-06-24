function getConfig() {
  return {
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  }
}

function looksLikeBankSms(value) {
  if (typeof value !== 'string') return false
  const t = value.trim()
  if (!t.toLowerCase().includes('transaction from') || t.length < 40) return false
  if (/xxx/i.test(t)) return false
  return /Transaction from \d{4} on \d{2}\/\d{2}\/\d{2}/.test(t)
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

export function extractSmsFromRequest(req) {
  if (typeof req.body === 'string' && looksLikeBankSms(req.body)) {
    return req.body.trim()
  }

  if (req.body && typeof req.body === 'object') {
    for (const key of ['Text', 'text', 'raw_message', 'message', 'body', 'sms']) {
      const val = req.body[key]
      if (looksLikeBankSms(val)) return val.trim()
    }
    const fromObj = findBankSms(req.body)
    if (fromObj) return fromObj
  }

  const raw = req.rawBody || ''
  if (looksLikeBankSms(raw)) return raw.trim()

  try {
    return findBankSms(JSON.parse(raw || '{}'))
  } catch {
    return null
  }
}

export async function verifyUserJwt(authHeader) {
  const { supabaseUrl, anonKey } = getConfig()
  if (!authHeader?.startsWith('Bearer ') || !supabaseUrl || !anonKey) return null

  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: authHeader },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getOrCreateIngestToken(userId) {
  const { supabaseUrl, serviceKey } = getConfig()
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }

  const existing = await fetch(
    `${supabaseUrl}/rest/v1/ingest_tokens?user_id=eq.${userId}&select=token`,
    { headers }
  )
  if (existing.ok) {
    const rows = await existing.json()
    if (rows[0]?.token) return rows[0].token
  }

  const created = await fetch(`${supabaseUrl}/rest/v1/ingest_tokens`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: userId }),
  })
  if (!created.ok) throw new Error(await created.text())
  const rows = await created.json()
  return rows[0].token
}

export async function lookupUserByToken(token) {
  const { supabaseUrl, serviceKey } = getConfig()
  const res = await fetch(
    `${supabaseUrl}/rest/v1/ingest_tokens?token=eq.${token}&select=user_id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  )
  if (!res.ok) return null
  const rows = await res.json()
  return rows[0]?.user_id ?? null
}

export async function saveTransaction(userId, rawMessage) {
  const { supabaseUrl, serviceKey } = getConfig()
  const res = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ user_id: userId, raw_message: rawMessage }),
  })
  if (!res.ok) throw new Error(await res.text())
}

export function publicOrigin(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '')
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${req.headers.host}`
}
