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

export default async function resetPasswordHandler(req, res) {
  const { username, currentPassword, password } = req.body ?? {}
  const { supabaseUrl, serviceKey, anonKey } = getConfig()

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  if (!username || !currentPassword || !password) {
    return res
      .status(400)
      .json({ error: 'Username, current password, and new password are required.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' })
  }

  const email = resolveAuthEmail(username)

  try {
    // Prove identity: the current credentials must authenticate before we allow
    // a password change. A wrong username OR wrong password yields the same
    // generic error, so this neither enables account takeover nor reveals which
    // usernames exist.
    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: currentPassword }),
    })

    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid username or current password.' })
    }

    const session = await verifyRes.json()
    const userId = session?.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Invalid username or current password.' })
    }

    const adminHeaders = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    }

    const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ password }),
    })

    if (!updateRes.ok) {
      const text = await updateRes.text()
      return res.status(updateRes.status).json({ error: text || 'Could not update password' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
