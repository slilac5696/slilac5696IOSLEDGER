import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'
import SettingsAccordion from './SettingsAccordion'
import ShortcutSetup from './ShortcutSetup'
import AndroidSetup from './AndroidSetup'
import BulkImport from './BulkImport'

export default function SettingsSheet({
  open,
  onClose,
  token,
  userId,
  onSaved,
  onSignOut,
}) {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookError, setWebhookError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || !token) return
    fetch('/api/my-ingest-url', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.webhookUrl) {
          setWebhookUrl(data.webhookUrl)
          setWebhookError('')
        } else {
          setWebhookError(data.error || 'Could not load webhook URL')
        }
      })
      .catch(() => setWebhookError('Could not load webhook URL'))
  }, [open, token])

  async function copyWebhookUrl() {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="font-display text-lg text-stone-900 mb-4">Settings</h2>

      <SettingsAccordion title="iPhone Shortcut setup">
        <ShortcutSetup
          token={token}
          webhookUrl={webhookUrl}
          error={webhookError}
          onCopy={copyWebhookUrl}
          copied={copied}
        />
      </SettingsAccordion>

      <SettingsAccordion title="Android setup">
        <AndroidSetup
          webhookUrl={webhookUrl}
          error={webhookError}
          onCopy={copyWebhookUrl}
          copied={copied}
        />
      </SettingsAccordion>

      <SettingsAccordion title="Import SMS backlog">
        <BulkImport token={token} userId={userId} onSaved={onSaved} />
      </SettingsAccordion>

      <button
        type="button"
        onClick={() => {
          onClose()
          onSignOut()
        }}
        className="w-full mt-6 py-3 font-mono text-sm text-red-600 border-t border-stone-200"
      >
        Sign out
      </button>
    </BottomSheet>
  )
}
