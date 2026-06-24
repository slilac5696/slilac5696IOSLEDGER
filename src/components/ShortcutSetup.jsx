import { useState, useEffect } from 'react'

export default function ShortcutSetup({ token }) {
  const [open, setOpen] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || !token) return
    fetch('/api/my-ingest-url', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.webhookUrl) setWebhookUrl(data.webhookUrl)
        else setError(data.error || 'Could not load webhook URL')
      })
      .catch(() => setError('Could not load webhook URL'))
  }, [open, token])

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="border-b border-dashed border-stone-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-teal-800"
      >
        <span>iPhone Shortcut setup</span>
        <span>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 font-mono text-xs text-stone-600 space-y-3">
          <p className="leading-relaxed">
            Copy your personal URL below. No passwords or headers needed in Shortcuts.
          </p>

          {error && <p className="text-orange-700">{error}</p>}

          {webhookUrl && (
            <>
              <p className="text-stone-500 uppercase tracking-wider">Your webhook URL</p>
              <p className="break-all text-stone-800 bg-stone-100 p-2 border border-dashed border-stone-200">
                {webhookUrl}
              </p>
              <button
                type="button"
                onClick={copyUrl}
                className="w-full py-2 border border-teal-800 text-teal-800 uppercase tracking-wider"
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </>
          )}

          <div className="border border-orange-700 border-dashed p-3 bg-orange-50">
            <p className="text-orange-800 font-medium uppercase tracking-wider mb-1">
              Do not use a template
            </p>
            <p className="leading-relaxed text-orange-900">
              Never type &quot;Transaction from xxx…&quot;. Use only the blue{' '}
              <strong>Shortcut Input</strong> variable — the real SMS from your bank.
            </p>
          </div>

          <div className="border border-dotted border-stone-200 p-3 space-y-2">
            <p className="text-stone-500 uppercase tracking-wider">Shortcut steps</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Automation → Message → your bank sender</li>
              <li>
                <strong>Text</strong> → delete everything → tap field → pick blue{' '}
                <strong>Shortcut Input</strong> only
              </li>
              <li>
                <strong>Get Contents of URL</strong> → POST → paste URL above
              </li>
              <li>
                Request Body → <strong>Text</strong> (not Form, not JSON) → pick{' '}
                <strong>Text</strong> from step 2
              </li>
              <li>Delete all Headers (leave empty)</li>
              <li>
                <strong>Show Notification</strong> → Contents of URL
              </li>
            </ol>
          </div>
        </div>
      )}
    </section>
  )
}
