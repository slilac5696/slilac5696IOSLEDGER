import { useState, useMemo } from 'react'
import { parseMessage, splitBacklogMessages } from '../lib/parseMessage'
import { insertTransactions } from '../lib/supabase'

export default function BulkImport({ token, userId, onSaved }) {
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
    <form onSubmit={handleImport}>
      <p className="font-mono text-xs text-stone-400 mb-3 leading-relaxed">
        Paste old bank SMS messages from Messages. Each must start with &quot;Transaction from…&quot;
      </p>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setResult(null)
        }}
        placeholder={'Transaction from 4172 on 21/06/26 at 19:13:35 for MVR351.10 at OLIVE TREE MARKET MA was processed...'}
        rows={6}
        className="w-full border border-stone-200 bg-white p-3 font-mono text-xs text-stone-800 focus:outline-none focus:border-teal-800 resize-none rounded-sm"
      />

      {messages.length > 0 && (
        <div className="mt-3 p-3 border border-dotted border-stone-200 font-mono text-xs bg-stone-50">
          <p className="text-stone-400 uppercase tracking-wider text-[10px] mb-2">Preview</p>
          <p className="text-stone-800">
            {messages.length} message{messages.length !== 1 ? 's' : ''} · {parsedCount} will parse
          </p>
          {unparsedCount > 0 && (
            <p className="text-orange-700 mt-1">{unparsedCount} unparsed</p>
          )}
        </div>
      )}

      {result && (
        <p className="font-mono text-xs text-emerald-700 mt-2">
          Imported {result.imported} transaction{result.imported !== 1 ? 's' : ''}.
        </p>
      )}

      {error && <p className="font-mono text-xs text-orange-700 mt-2">{error}</p>}

      <button
        type="submit"
        disabled={saving || !messages.length}
        className="mt-4 w-full py-3 bg-teal-800 text-white font-mono text-xs uppercase tracking-wider disabled:opacity-40"
      >
        {saving ? 'Importing…' : `Import ${messages.length || ''} transaction${messages.length !== 1 ? 's' : ''}`}
      </button>
    </form>
  )
}
