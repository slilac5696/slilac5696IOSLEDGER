const PATTERN =
  /Transaction from (\d{4}) on (\d{2}\/\d{2}\/\d{2}) at (\d{2}:\d{2}:\d{2}) for ([A-Z]{3})([\d,.]+) at (.+?) was processed\. Reference No:([\d]+), Approval Code:(\d+)\./

export function parseMessage(raw) {
  if (!raw?.trim()) return null
  const match = raw.trim().match(PATTERN)
  if (!match) return null

  return {
    cardLast4: match[1],
    date: match[2],
    time: match[3],
    currency: match[4],
    amount: parseFloat(match[5].replace(/,/g, '')),
    merchant: match[6].trim(),
    referenceNo: match[7],
    approvalCode: match[8],
  }
}

export function parseTransactionDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(2000 + year, month - 1, day)
}

export function formatAmount(amount, currency = 'MVR') {
  return `${currency}${amount.toFixed(2)}`
}
