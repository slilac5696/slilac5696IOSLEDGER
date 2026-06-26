import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { PRESET_CATEGORIES, iconFor, suggestIcon } from '../lib/categoryIcons'
import { upsertMonthlyIncome, insertCategories } from '../lib/supabase'
import { money, monthLabel } from '../lib/format'

export default function OnboardingFlow({ token, userId, month, year, monthIndex, currency = 'MVR', onComplete }) {
  const [step, setStep] = useState(1)
  const [income, setIncome] = useState('')
  const [picked, setPicked] = useState({})
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const incomeNum = parseFloat(income) || 0
  const entries = Object.entries(picked)
  const totalBudgeted = entries.reduce((sum, [, amt]) => sum + (parseFloat(amt) || 0), 0)
  const leftToBudget = incomeNum - totalBudgeted
  const pct = incomeNum > 0 ? Math.min((totalBudgeted / incomeNum) * 100, 100) : 0

  function togglePreset(name) {
    setPicked((prev) => {
      const next = { ...prev }
      if (name in next) delete next[name]
      else next[name] = ''
      return next
    })
  }

  function setAmount(name, value) {
    setPicked((prev) => ({ ...prev, [name]: value }))
  }

  function addCustom() {
    const name = customName.trim()
    if (!name) return
    const exists = Object.keys(picked).some((k) => k.toLowerCase() === name.toLowerCase())
    if (exists) {
      setError(`"${name}" is already added.`)
      return
    }
    setPicked((prev) => ({ ...prev, [name]: '' }))
    setCustomName('')
    setError('')
  }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      await upsertMonthlyIncome(token, userId, month, incomeNum)
      const categories = entries.map(([name, amt], i) => ({
        month,
        name,
        icon: suggestIcon(name),
        budgeted: parseFloat(amt) || 0,
        sort_order: i,
      }))
      await insertCategories(token, userId, categories)
      onComplete()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-stone-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-6 py-10">
        <p className="font-mono text-[11px] uppercase tracking-widest text-teal-700">
          {monthLabel(year, monthIndex)} · Step {step} of 2
        </p>

        {step === 1 ? (
          <div className="flex flex-col flex-1">
            <h1 className="mt-6 font-display text-3xl text-stone-900 leading-tight">
              What's your income this month?
            </h1>
            <p className="mt-3 font-mono text-xs text-stone-500 leading-relaxed">
              This is your starting point. Every {currency} gets a job.
            </p>

            <div className="mt-10 flex items-baseline gap-2 border-b-2 border-teal-800 pb-3">
              <span className="font-display text-2xl text-stone-400">{currency}</span>
              <input
                type="number"
                inputMode="decimal"
                value={income}
                autoFocus
                onChange={(e) => setIncome(e.target.value)}
                placeholder="0"
                className="flex-1 min-w-0 bg-transparent font-display text-4xl text-stone-900 focus:outline-none placeholder:text-stone-300"
              />
            </div>

            <div className="flex-1" />

            <button
              type="button"
              disabled={incomeNum <= 0}
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-teal-800 text-white font-mono text-xs uppercase tracking-widest rounded-xl disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <h1 className="mt-6 font-display text-3xl text-stone-900 leading-tight">
              Now divide it into categories.
            </h1>
            <p className="mt-3 font-mono text-xs text-stone-500 leading-relaxed">
              Tap to add a category, then give it a budget.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {PRESET_CATEGORIES.map((preset) => {
                const active = preset.name in picked
                const Icon = iconFor(preset.icon)
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePreset(preset.name)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs border transition-colors ${
                      active
                        ? 'bg-teal-800 text-white border-teal-800'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    <Icon size={13} strokeWidth={1.75} />
                    {preset.name}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustom()
                  }
                }}
                placeholder="Add your own category"
                className="flex-1 min-w-0 border-b border-stone-200 bg-transparent py-2 font-mono text-xs text-stone-800 focus:outline-none focus:border-teal-800"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!customName.trim()}
                className="shrink-0 inline-flex items-center gap-1 rounded-full bg-teal-800 text-white px-3 py-1.5 font-mono text-xs disabled:opacity-40"
              >
                <Plus size={13} strokeWidth={2} /> Add
              </button>
            </div>

            {entries.length > 0 && (
              <div className="mt-6 space-y-2">
                {entries.map(([name, amt]) => {
                  const Icon = iconFor(suggestIcon(name))
                  return (
                    <div key={name} className="flex items-center gap-3 rounded-xl bg-white border border-stone-200 px-3 py-2.5">
                      <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <Icon size={15} strokeWidth={1.75} />
                      </span>
                      <span className="flex-1 text-sm text-stone-800 truncate">{name}</span>
                      <span className="font-mono text-xs text-stone-400">{currency}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={amt}
                        onChange={(e) => setAmount(name, e.target.value)}
                        placeholder="0"
                        className="w-20 border border-stone-200 px-2 py-1 font-mono text-xs text-right text-stone-800 focus:outline-none focus:border-teal-800 rounded-sm"
                      />
                      <button
                        type="button"
                        onClick={() => togglePreset(name)}
                        className="shrink-0 text-stone-300 hover:text-orange-500 px-1"
                        aria-label={`Remove ${name}`}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between font-mono text-[11px] text-stone-500">
                <span>{money(totalBudgeted, currency)} of {money(incomeNum, currency)} budgeted</span>
                {Math.abs(leftToBudget) <= 0.005 ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check size={12} strokeWidth={2.5} /> balanced
                  </span>
                ) : leftToBudget > 0 ? (
                  <span className="text-amber-600">{money(leftToBudget, currency)} left</span>
                ) : (
                  <span className="text-orange-600">{money(Math.abs(leftToBudget), currency)} over</span>
                )}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-stone-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${leftToBudget < -0.005 ? 'bg-orange-400' : 'bg-teal-600'}`}
                  style={{ width: `${leftToBudget < -0.005 ? 100 : pct}%` }}
                />
              </div>
            </div>

            {error && <p className="mt-3 font-mono text-xs text-orange-700">{error}</p>}

            <div className="flex-1" />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-stone-500 border border-stone-200 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                disabled={saving || entries.length === 0}
                onClick={finish}
                className="flex-1 py-3.5 bg-teal-800 text-white font-mono text-xs uppercase tracking-widest rounded-xl disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Start budgeting'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
