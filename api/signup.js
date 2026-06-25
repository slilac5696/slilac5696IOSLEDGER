function getConfig() {
  return {
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  }
}

function normalizeUsername(value) {
  return String(value).trim().toLowerCase()
}

function resolveAuthEmail(input) {
  const trimmed = String(input).trim()
  if (trimmed.includes('@')) return trimmed.toLowerCase()
  return `${normalizeUsername(trimmed)}@ledger.internal`
}

function isValidUsername(value) {
  return /^[a-z0-9_]{3,32}$/.test(normalizeUsername(value))
}

export default async function signupHandler(req, res) {
  const { username, password } = req.body ?? {}
  const { supabaseUrl, serviceKey, anonKey } = getConfig()

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  if (!username.includes('@') && !isValidUsername(username)) {
    return res.status(400).json({
      error: 'Username must be 3–32 characters: letters, numbers, underscore only.',
    })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  const email = resolveAuthEmail(username)
  const adminHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }

  try {
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { username: normalizeUsername(username) },
      }),
    })

    if (!createRes.ok) {
      const text = await createRes.text()
      if (/already|exists|registered/i.test(text)) {
        return res.status(409).json({ error: 'Username already taken.' })
      }
      return res.status(createRes.status).json({ error: text || 'Sign up failed' })
    }

    const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const session = await loginRes.json()
    if (!loginRes.ok) {
      return res.status(200).json({
        ok: true,
        message: 'Account created. Please sign in.',
      })
    }

    return res.status(200).json(session)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
