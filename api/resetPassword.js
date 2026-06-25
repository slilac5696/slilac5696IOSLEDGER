function getConfig() {
  return {
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
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
  const { username, password } = req.body ?? {}
  const { supabaseUrl, serviceKey } = getConfig()

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and new password are required.' })
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
    const listRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      { headers: adminHeaders }
    )

    if (!listRes.ok) {
      return res.status(500).json({ error: 'Could not look up user' })
    }

    const { users } = await listRes.json()
    const user = users?.[0]
    if (!user) {
      return res.status(404).json({ error: 'Username not found.' })
    }

    const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ password, email_confirm: true }),
    })

    if (!updateRes.ok) {
      const text = await updateRes.text()
      return res.status(updateRes.status).json({ error: text || 'Could not reset password' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
