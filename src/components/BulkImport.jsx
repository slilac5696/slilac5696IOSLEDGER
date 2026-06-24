import { useState, useMemo } from 'react'
import { parseMessage, splitBacklogMessages } from '../lib/parseMessage'
import { insertTransactions } from '../lib/supabase'

export default function BulkImport({ token, userId, onSaved }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const messages = useMemo(() => splitBacklogMessages(text), [text])
  const preview = useMemo(
    () =>
      messages.map((msg) => ({
        raw: msg,
        parsed: parseMessage(msg),
      })),
    [messages]
  )

  const parsedCount = preview.filter((p) => p.parsed).length
  const unparsedCount = preview.length - parsedCount

  async function handleImport(e) {
    e.preventDefault()
    if (!messages.length) return
    setSaving(true)
    setError('')
    setResult(null)
    try {
      await insertTransactions(token, userId, messages)
      setResult({ imported: messages.length, parsed: parsedCount })
      setText('')
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
        <span>Import SMS backlog</span>
        <span>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <form onSubmit={handleImport} className="px-4 pb-4">
          <p className="font-mono text-xs text-stone-500 mb-2 leading-relaxed">
            Paste old bank SMS messages from Messages. One per line block, or many in
            one paste — each must start with &quot;Transaction from…&quot;
          </p>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setResult(null)
            }}
            placeholder={'Transaction from 4172 on 21/06/26 at 19:13:35 for MVR351.10 at OLIVE TREE MARKET MA was processed...\n\nTransaction from 4172 on 20/06/26 at 12:00:00 for MVR50.00 at COFFEE SHOP was processed...'}
            rows={8}
            className="w-full border border-dashed border-stone-200 bg-transparent p-3 font-mono text-xs text-stone-800 focus:outline-none focus:border-teal-800 resize-none"
          />

          {messages.length > 0 && (
            <div className="mt-3 p-3 border border-dotted border-stone-200 font-mono text-xs">
              <p className="text-stone-500 uppercase tracking-wider mb-2">Preview</p>
              <p className="text-stone-800">
                {messages.length} message{messages.length !== 1 ? 's' : ''} found
              </p>
              <p className="text-emerald-700 mt-1">{parsedCount} will parse</p>
              {unparsedCount > 0 && (
                <p className="text-orange-700 mt-1">
                  {unparsedCount} unparsed (saved as raw text)
                </p>
              )}
              <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-stone-600">
                {preview.slice(0, 10).map((p, i) => (
                  <li key={i} className="truncate">
                    {p.parsed
                      ? `${p.parsed.date} · ${p.parsed.merchant} · ${p.parsed.currency}${p.parsed.amount.toFixed(2)}`
                      : `⚠ ${p.raw.slice(0, 50)}…`}
                  </li>
                ))}
                {preview.length > 10 && (
                  <li className="text-stone-400">+{preview.length - 10} more</li>
                )}
              </ul>
            </div>
          )}

          {result && (
            <p className="font-mono text-xs text-emerald-700 mt-2">
              Imported {result.imported} transaction{result.imported !== 1 ? 's' : ''}.
            </p>
          )}

          {error && (
            <p className="font-mono text-xs text-orange-700 mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !messages.length}
            className="mt-3 w-full py-2 border border-teal-800 text-teal-800 font-mono text-xs uppercase tracking-wider disabled:opacity-40"
          >
            {saving ? 'Importing…' : `Import ${messages.length || ''} transaction${messages.length !== 1 ? 's' : ''}`}
          </button>
        </form>
      )}
    </section>
  )
}
