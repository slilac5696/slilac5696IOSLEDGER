import { resolveAuthEmail, normalizeUsername, isValidUsername, isValidPassword } from './auth.js'

export async function resetPassword(username, password) {
  const res = await fetch('/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.includes('@') ? username.trim() : normalizeUsername(username),
      password,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not reset password')
  return data
}
