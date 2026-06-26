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

export async function refreshSession(refreshToken) {
  assertConfig()
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Session refresh failed')
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

export async function updateTransactionCategory(token, id, categoryId, categoryName) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(token, {
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    }),
    body: JSON.stringify({
      category_id: categoryId ?? null,
      category_name: categoryName ?? null,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to update category')
  }
}

/* ------------------------------------------------------------------ */
/* Monthly income                                                      */
/* ------------------------------------------------------------------ */

export async function fetchMonthlyIncome(token, month) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/monthly_income?month=eq.${month}&select=*`,
    { headers: headers(token) }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to fetch income')
  }
  const rows = await res.json()
  return rows[0] ?? null
}

export async function upsertMonthlyIncome(token, userId, month, amount) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/monthly_income?on_conflict=user_id,month`,
    {
      method: 'POST',
      headers: headers(token, {
        'Content-Type': 'application/json',
        Prefer: 'return=representation,resolution=merge-duplicates',
      }),
      body: JSON.stringify({ user_id: userId, month, amount }),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to save income')
  }
  const rows = await res.json()
  return rows[0] ?? null
}

/* ------------------------------------------------------------------ */
/* Budget categories                                                   */
/* ------------------------------------------------------------------ */

export async function fetchCategories(token, month) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/budget_categories?month=eq.${month}&select=*&order=sort_order.asc,id.asc`,
    { headers: headers(token) }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to fetch categories')
  }
  return res.json()
}

export async function insertCategory(token, userId, category) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/budget_categories`, {
    method: 'POST',
    headers: headers(token, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({ user_id: userId, ...category }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to add category')
  }
  const rows = await res.json()
  return rows[0] ?? null
}

export async function insertCategories(token, userId, categories) {
  if (!categories.length) return []
  const payload = categories.map((c) => ({ user_id: userId, ...c }))
  const res = await fetch(`${SUPABASE_URL}/rest/v1/budget_categories`, {
    method: 'POST',
    headers: headers(token, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to add categories')
  }
  return res.json()
}

export async function updateCategory(token, id, patch) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/budget_categories?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: headers(token, {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      }),
      body: JSON.stringify(patch),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to update category')
  }
}

export async function deleteCategory(token, id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/budget_categories?id=eq.${id}`,
    {
      method: 'DELETE',
      headers: headers(token),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to delete category')
  }
}
