import { useState, useEffect } from 'react'

export default function ShortcutSetup({ token, webhookUrl: webhookUrlProp, error: errorProp, onCopy, copied: copiedProp }) {
  const [webhookUrl, setWebhookUrl] = useState(webhookUrlProp || '')
  const [error, setError] = useState(errorProp || '')
  const [copied, setCopied] = useState(false)

  const urlControlled = webhookUrlProp !== undefined

  useEffect(() => {
    if (urlControlled || !token) return
    fetch('/api/my-ingest-url', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.webhookUrl) setWebhookUrl(data.webhookUrl)
        else setError(data.error || 'Could not load webhook URL')
      })
      .catch(() => setError('Could not load webhook URL'))
  }, [token, urlControlled])

  useEffect(() => {
    if (webhookUrlProp) setWebhookUrl(webhookUrlProp)
  }, [webhookUrlProp])

  useEffect(() => {
    if (errorProp) setError(errorProp)
  }, [errorProp])

  async function copyUrl() {
    if (onCopy) {
      onCopy()
      return
    }
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const isCopied = copiedProp ?? copied

  return (
    <div className="font-mono text-xs text-stone-600 space-y-3">
      <p className="leading-relaxed text-stone-500">
        Copy your personal URL. No passwords or headers needed in Shortcuts.
      </p>

      {error && <p className="text-orange-700">{error}</p>}

      {webhookUrl && (
        <>
          <p className="text-stone-400 uppercase tracking-wider text-[10px]">Webhook URL</p>
          <p className="break-all text-stone-800 bg-stone-100 p-2 border border-stone-200 text-[11px]">
            {webhookUrl}
          </p>
          <button
            type="button"
            onClick={copyUrl}
            className="w-full py-2.5 bg-teal-800 text-white uppercase tracking-wider text-[11px]"
          >
            {isCopied ? 'Copied!' : 'Copy URL'}
          </button>
        </>
      )}

      <div className="border border-orange-200 p-3 bg-orange-50 rounded-sm">
        <p className="text-orange-800 font-medium uppercase tracking-wider text-[10px] mb-1">
          Do not use a template
        </p>
        <p className="leading-relaxed text-orange-900 text-[11px]">
          Use only the blue <strong>Shortcut Input</strong> variable — the real SMS from your bank.
        </p>
      </div>

      <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px] text-stone-600">
        <li>Automation → Message → your bank sender</li>
        <li>
          <strong>Text</strong> → blue <strong>Shortcut Input</strong> only
        </li>
        <li>
          <strong>Get Contents of URL</strong> → POST → paste URL above
        </li>
        <li>
          Request Body → <strong>Form</strong> → Key <code>raw_message</code> → Shortcut Input
        </li>
        <li>Delete all Headers</li>
        <li>
          <strong>Show Notification</strong> → Contents of URL
        </li>
      </ol>
    </div>
  )
}
