/** Format a number as "MVR 1,234.56" (currency configurable). */
export function money(amount, currency = 'MVR') {
  const n = Number(amount) || 0
  return `${currency} ${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Compact form without decimals when whole, for tight spaces. */
export function moneyShort(amount, currency = 'MVR') {
  const n = Number(amount) || 0
  const hasFraction = Math.abs(n % 1) > 0.005
  return `${currency} ${n.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

/** "2026-06" key from a year + zero-based month index. */
export function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

/** Long label like "June 2026" from year + zero-based month index. */
export function monthLabel(year, monthIndex) {
  return new Date(year, monthIndex).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
