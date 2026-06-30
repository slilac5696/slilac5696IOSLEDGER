// Format A: "Transaction from 4172 on 24/06/26 at 22:22:35 for MVR65.00 at
// MERCHANT was processed. Reference No:..., Approval Code:...."
const PATTERN_A =
  /Transaction from (\d{4}) on (\d{2}\/\d{2}\/\d{2}) at (\d{2}:\d{2}:\d{2}) for ([A-Z]{3})([\d,.]+) at (.+?) was processed\. Reference No:([\d]+), Approval Code:(\d+)\./

// Format B: "Your POS PURCHASE from ***4146 for 405.00 MVR at REDWAVE MEGA
// MALL, MV on 10.02.26 22:32 was processed successfully. Approval Code: 979888"
const PATTERN_B =
  /Your (?:POS )?PURCHASE from \*{0,4}(\d{4}) for ([\d,.]+)\s*([A-Z]{3}) at (.+?) on (\d{2}\.\d{2}\.\d{2}) (\d{2}:\d{2})(?::\d{2})? was processed(?: successfully)?\.? Approval Code:\s*(\d+)/

export function parseMessage(raw) {
  if (!raw?.trim()) return null
  const text = raw.trim()

  const a = text.match(PATTERN_A)
  if (a) {
    return {
      cardLast4: a[1],
      date: a[2],
      time: a[3],
      currency: a[4],
      amount: parseFloat(a[5].replace(/,/g, '')),
      merchant: a[6].trim(),
      referenceNo: a[7],
      approvalCode: a[8],
    }
  }

  const b = text.match(PATTERN_B)
  if (b) {
    return {
      cardLast4: b[1],
      date: b[5],
      time: b[6],
      currency: b[3],
      amount: parseFloat(b[2].replace(/,/g, '')),
      merchant: b[4].trim(),
      referenceNo: null,
      approvalCode: b[7],
    }
  }

  return null
}

// Header that identifies any supported bank SMS (used to detect/extract on ingest).
const BANK_SMS_HEADER = /(?:transaction|pos purchase|purchase) from/i

/**
 * Loose check that a string is a bank transaction SMS. True when it parses with
 * a known format, or carries a known header (so unrecognized variants are still
 * captured as raw messages rather than dropped).
 */
export function looksLikeBankSms(raw) {
  if (typeof raw !== 'string') return false
  const t = raw.trim()
  if (t.length < 30) return false
  if (/xxx/i.test(t)) return false
  return parseMessage(t) !== null || BANK_SMS_HEADER.test(t)
}

export function parseTransactionDate(dateStr) {
  const [day, month, year] = dateStr.split(/[/.]/).map(Number)
  return new Date(2000 + year, month - 1, day)
}

export function formatAmount(amount, currency = 'MVR') {
  return `${currency}${amount.toFixed(2)}`
}

/**
 * Keyword → category map for auto-assigning a category to a parsed merchant.
 * Customize freely; the first matching entry wins. The resulting category name
 * must match a budget category created for that month for the spend to roll up.
 */
export const CATEGORY_KEYWORDS = [
  { pattern: /market|grocery|supermart|super\s?mart|mart\b|veggie|fruit|butcher|bakery|store|mall|redwave/i, category: 'Groceries' },
  { pattern: /caf[eé]|restaurant|pizza|burger|coffee|dining|kitchen|bbq|grill|diner|eatery|food|snack|tea\b/i, category: 'Dining Out' },
  { pattern: /petrol|shell|fuel|filling|taxi|transport|ferry|bus\b|ride|uber|careem|pickme/i, category: 'Transport' },
  { pattern: /rent|housing|apartment|landlord|lease|property/i, category: 'Housing' },
  { pattern: /electric|water|utility|utilities|dhiraagu|ooredoo|internet|wifi|broadband|telecom|gas\b|power/i, category: 'Utilities' },
  { pattern: /pharmacy|clinic|hospital|medical|health|doctor|dental|adk|tree\s?top|medica/i, category: 'Health' },
  { pattern: /cinema|movie|netflix|spotify|game|gaming|entertainment|theatre|theater|olympus/i, category: 'Entertainment' },
]

/**
 * Attempt to classify a merchant string into a category by keyword.
 * Returns the category name, or null when nothing matches.
 */
export function matchCategory(merchant) {
  if (!merchant) return null
  for (const { pattern, category } of CATEGORY_KEYWORDS) {
    if (pattern.test(merchant)) return category
  }
  return null
}

/**
 * Normalize a merchant name into a stable key for the shared merchant→category
 * map. Uppercases, collapses whitespace, and strips a trailing 2-letter location
 * code (e.g. "REDWAVE MEGA MALL, MV" → "REDWAVE MEGA MALL") so branches of the
 * same shop share one key. Must stay identical on client and server.
 */
export function normalizeMerchant(merchant) {
  if (!merchant) return ''
  return merchant
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/,\s*[A-Z]{2}\s*$/, '')
    .trim()
}

/** Split pasted text into individual bank SMS messages. */
export function splitBacklogMessages(text) {
  if (!text?.trim()) return []
  const parts = text
    .split(/(?=Transaction from \d{4} on |Your (?:POS )?PURCHASE from )/g)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length > 1) return parts
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}
