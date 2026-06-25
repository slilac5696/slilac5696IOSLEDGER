const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

import {
  resolveAuthEmail,
  isValidUsername,
  isValidPassword,
} from './auth.js'

function assertConfig() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error(
      'App not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Railway, then redeploy.'
    )
  }
}

function headers(token, extra = {}) {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${token}`,
    ...extra,
  }
}

export async function login(emailOrUsername, password) {
  assertConfig()
  const email = resolveAuthEmail(emailOrUsername)
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

export async function signUp(username, password) {
  assertConfig()
  if (!isValidUsername(username) && !username.includes('@')) {
    throw new Error('Username must be 3–32 characters: letters, numbers, underscore only.')
  }
  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 6 characters.')
  }

  const res = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Sign up failed')

  if (data.access_token) return data

  const session = await login(username, password)
  return session
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

export async function insertTransactions(token, userId, rawMessages) {
  const results = []
  for (const rawMessage of rawMessages) {
    results.push(await insertTransaction(token, userId, rawMessage))
  }
  return results
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
