import { useState } from 'react'
import { ICON_OPTIONS, iconFor } from '../lib/categoryIcons'

export default function AddCategorySheet({ currency = 'MVR', onSave, onClose }) {
  const [icon, setIcon] = useState(ICON_OPTIONS[0])
  const [name, setName] = useState('')
  const [budgeted, setBudgeted] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await onSave({ name: name.trim(), icon, budgeted: parseFloat(budgeted) || 0 })
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave}>
      <h2 className="font-display text-lg text-stone-900 mb-4">Add category</h2>

      <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2">Icon</p>
      <div className="grid grid-cols-6 gap-2 mb-5">
        {ICON_OPTIONS.map((opt) => {
          const Icon = iconFor(opt)
          const active = icon === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setIcon(opt)}
              className={`aspect-square rounded-xl flex items-center justify-center border transition-colors ${
                active ? 'bg-teal-800 text-white border-teal-800' : 'bg-white text-stone-500 border-stone-200'
              }`}
              aria-label={opt}
            >
              <Icon size={18} strokeWidth={1.75} />
            </button>
          )
        })}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2">Name</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Groceries"
        className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-teal-800 rounded-lg mb-4"
      />

      <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2">Monthly budget</p>
      <div className="flex items-center gap-2 mb-5">
        <span className="font-mono text-sm text-stone-400">{currency}</span>
        <input
          type="number"
          inputMode="decimal"
          value={budgeted}
          onChange={(e) => setBudgeted(e.target.value)}
          placeholder="0"
          className="flex-1 border border-stone-200 bg-white px-3 py-2.5 font-mono text-sm text-stone-800 focus:outline-none focus:border-teal-800 rounded-lg"
        />
      </div>

      {error && <p className="font-mono text-xs text-orange-700 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full py-3 bg-teal-800 text-white font-mono text-xs uppercase tracking-widest rounded-xl disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Add category'}
      </button>
    </form>
  )
}
