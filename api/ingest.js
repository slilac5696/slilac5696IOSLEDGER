function getConfig() {
  return {
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

export default async function ingest(req, res) {
  const { supabaseUrl, serviceKey } = getConfig()
  const headerKey = req.headers['x-service-key']
  if (!serviceKey || headerKey !== serviceKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { user_id, raw_message } = req.body ?? {}
  if (!user_id || !raw_message) {
    return res.status(400).json({ error: 'Missing user_id or raw_message' })
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
