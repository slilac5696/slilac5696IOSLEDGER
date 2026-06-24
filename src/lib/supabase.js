const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function headers(token, extra = {}) {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
    ...extra,
  }
}

export async function login(email, password) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Login failed')
  return data
}

export async function fetchTransactions(token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/transactions?select=*&order=received_at.desc`,
    { headers: headers(token) }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to fetch transactions')
  }
  return res.json()
}

export async function insertTransaction(token, userId, rawMessage) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
    method: 'POST',
    headers: headers(token, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({ user_id: userId, raw_message: rawMessage }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to save transaction')
  }
  return res.json()
}

export async function deleteTransaction(token, id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`,
    {
      method: 'DELETE',
      headers: headers(token),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to delete transaction')
  }
}
