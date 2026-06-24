import {
  extractSmsFromRequest,
  lookupUserByToken,
  saveTransaction,
} from './ingestLib.js'

export default async function ingestByToken(req, res) {
  const { token } = req.params
  const raw_message = extractSmsFromRequest(req)

  if (!token) {
    return res.status(400).json({ error: 'Missing token' })
  }
  if (!raw_message) {
    return res.status(400).json({
      error:
        'Missing SMS text. Request body must be the bank message (use Text action with Shortcut Input).',
    })
  }
  if (!raw_message.toLowerCase().includes('transaction from')) {
    return res.status(400).json({ error: 'Body does not look like a bank SMS.' })
  }

  try {
    const user_id = await lookupUserByToken(token)
    if (!user_id) {
      return res.status(401).json({ error: 'Invalid webhook URL. Copy a fresh URL from Ledger app.' })
    }
    await saveTransaction(user_id, raw_message)
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
