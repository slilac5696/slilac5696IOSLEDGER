const USERNAME_DOMAIN = 'ledger.internal'

export function normalizeUsername(value) {
  return value.trim().toLowerCase()
}

export function isValidUsername(value) {
  return /^[a-z0-9_]{3,32}$/.test(normalizeUsername(value))
}

export function resolveAuthEmail(input) {
  const trimmed = input.trim()
  if (trimmed.includes('@')) return trimmed.toLowerCase()
  return `${normalizeUsername(trimmed)}@${USERNAME_DOMAIN}`
}

export function isValidPassword(value) {
  return value.length >= 6
}
