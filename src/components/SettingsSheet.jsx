import { useState, useEffect } from 'react'
import { Pencil, Check } from 'lucide-react'
import BottomSheet from './BottomSheet'
import SettingsAccordion from './SettingsAccordion'
import ShortcutSetup from './ShortcutSetup'
import AndroidSetup from './AndroidSetup'
import BulkImport from './BulkImport'
import { money, monthLabel } from '../lib/format'
import { upsertMonthlyIncome } from '../lib/supabase'

export default function SettingsSheet({
  open,
  onClose,
  token,
  userId,
  month,
  year,
  monthIndex,
  income = 0,
  currency = 'MVR',
  onIncomeSaved,
  onSaved,
  onSignOut,
}) {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookError, setWebhookError] = useState('')
  const [copied, setCopied] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [draft, setDraft] = useState(String(income))
  const [savingIncome, setSavingIncome] = useState(false)

  useEffect(() => {
    setDraft(String(income))
  }, [income])

  useEffect(() => {
    if (!open || !token) return
    fetch('/api/my-ingest-url', { headers: { Authorization: `Bearer ${token}` } })
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

  async function saveIncome() {
    const value = parseFloat(draft)
    if (Number.isNaN(value) || value < 0) {
      setEditingIncome(false)
      return
    }
    setSavingIncome(true)
    try {
      await upsertMonthlyIncome(token, userId, month, value)
      onIncomeSaved?.(value)
      setEditingIncome(false)
    } catch {
      // keep edit open on failure
    } finally {
      setSavingIncome(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="font-display text-lg text-stone-900 mb-4">Settings</h2>

      <div className="border-b border-stone-200 pb-4 mb-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2">
          Income · {monthLabel(year, monthIndex)}
        </p>
        {editingIncome ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-stone-400">{currency}</span>
            <input
              type="number"
              inputMode="decimal"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 border border-teal-800 bg-white px-2 py-1.5 font-mono text-sm text-stone-800 focus:outline-none rounded-sm"
            />
            <button
              type="button"
              onClick={saveIncome}
              disabled={savingIncome}
              className="p-2 text-emerald-600 disabled:opacity-40"
              aria-label="Save income"
            >
              <Check size={18} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingIncome(true)}
            className="flex items-center justify-between w-full"
          >
            <span className="font-display text-xl text-stone-900">{money(income, currency)}</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-teal-700">
              <Pencil size={13} strokeWidth={1.75} /> Edit
            </span>
          </button>
        )}
      </div>

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
