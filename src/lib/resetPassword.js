import { normalizeUsername } from './auth.js'

export async function resetPassword(username, currentPassword, password) {
  const res = await fetch('/api/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.includes('@') ? username.trim() : normalizeUsername(username),
      currentPassword,
      password,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not update password')
  return data
}
