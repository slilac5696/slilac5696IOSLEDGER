import { useState } from 'react'
import { parseMessage } from '../lib/parseMessage'
import { insertTransaction } from '../lib/supabase'

const SAMPLE =
  'Transaction from 4172 on 21/06/26 at 19:13:35 for MVR351.10 at OLIVE TREE MARKET MA was processed. Reference No:008636294270, Approval Code:309909.'

export default function ManualAdd({ token, userId, onSaved }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const preview = parseMessage(text)

  async function handleSave(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    setError('')
    try {
      await insertTransaction(token, userId, text.trim())
      setText('')
      setOpen(false)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="border-b border-dashed border-stone-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-teal-800"
      >
        <span>Add transaction manually</span>
        <span>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <form onSubmit={handleSave} className="px-4 pb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={SAMPLE}
            rows={4}
            className="w-full border border-dashed border-stone-200 bg-transparent p-3 font-mono text-xs text-stone-800 focus:outline-none focus:border-teal-800 resize-none"
          />

          {text.trim() && (
            <div className="mt-3 p-3 border border-dotted border-stone-200">
              <p className="font-mono text-xs uppercase tracking-wider text-stone-500 mb-2">
                Preview
              </p>
              {preview ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
                  <dt className="text-stone-400">Merchant</dt>
                  <dd className="text-stone-800">{preview.merchant}</dd>
                  <dt className="text-stone-400">Amount</dt>
                  <dd className="text-stone-800">
                    {preview.currency}{preview.amount.toFixed(2)}
                  </dd>
                  <dt className="text-stone-400">Date</dt>
                  <dd className="text-stone-800">{preview.date} {preview.time}</dd>
                  <dt className="text-stone-400">Card</dt>
                  <dd className="text-stone-800">••{preview.cardLast4}</dd>
                  <dt className="text-stone-400">Ref</dt>
                  <dd className="text-stone-800">{preview.referenceNo}</dd>
                </dl>
              ) : (
                <p className="font-mono text-xs text-orange-700">
                  Could not parse — will save as raw message
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="font-mono text-xs text-orange-700 mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="mt-3 w-full py-2 border border-teal-800 text-teal-800 font-mono text-xs uppercase tracking-wider disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}
    </section>
  )
}
