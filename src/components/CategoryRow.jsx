import { useState } from 'react'
import { Pencil, Check, X, Trash2 } from 'lucide-react'
import { iconFor } from '../lib/categoryIcons'
import { money, moneyShort } from '../lib/format'

export default function CategoryRow({
  category,
  spent,
  transactions = [],
  currency = 'MVR',
  expanded,
  onToggle,
  onEditBudget,
  onDelete,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(category.budgeted))

  const Icon = iconFor(category.icon)
  const remaining = category.budgeted - spent
  const overspent = remaining < -0.005
  const pct = category.budgeted > 0 ? Math.min((spent / category.budgeted) * 100, 100) : spent > 0 ? 100 : 0

  function startEdit(e) {
    e.stopPropagation()
    setDraft(String(category.budgeted))
    setEditing(true)
  }

  function saveEdit(e) {
    e.stopPropagation()
    const value = parseFloat(draft)
    if (!Number.isNaN(value) && value >= 0) {
      onEditBudget(category.id, value)
    }
    setEditing(false)
  }

  return (
    <div className="border-b border-stone-100 bg-stone-50">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
      >
        <span
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
            overspent ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-700'
          }`}
        >
          <Icon size={17} strokeWidth={1.75} />
        </span>

        <span className="flex-1 min-w-0">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm text-stone-800 truncate">{category.name}</span>
            {editing ? (
              <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-20 border border-teal-700 bg-white px-1.5 py-0.5 font-mono text-xs text-right text-stone-800 focus:outline-none rounded-sm"
                />
                <button type="button" onClick={saveEdit} className="p-1 text-emerald-600" aria-label="Save budget">
                  <Check size={15} strokeWidth={2} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(false) }} className="p-1 text-stone-400" aria-label="Cancel">
                  <X size={15} strokeWidth={2} />
                </button>
              </span>
            ) : (
              <span
                className={`font-mono text-sm tabular-nums shrink-0 ${
                  overspent ? 'text-orange-600' : 'text-emerald-600'
                }`}
              >
                {overspent ? '−' : ''}{moneyShort(Math.abs(remaining), currency)}
              </span>
            )}
          </span>

          <span className="mt-2 block h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
            <span
              className={`block h-full rounded-full ${overspent ? 'bg-orange-400' : 'bg-teal-600'}`}
              style={{ width: `${pct}%` }}
            />
          </span>

          <span className="mt-1.5 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-stone-400">
              {moneyShort(spent, currency)} spent of {moneyShort(category.budgeted, currency)} budgeted
            </span>
            {!editing && (
              <span
                role="button"
                tabIndex={0}
                onClick={startEdit}
                onKeyDown={(e) => e.key === 'Enter' && startEdit(e)}
                className="p-0.5 text-stone-300 hover:text-stone-500"
                aria-label="Edit budget"
              >
                <Pencil size={13} strokeWidth={1.75} />
              </span>
            )}
          </span>

          {overspent && (
            <span className="mt-1.5 inline-block rounded-full bg-orange-100 px-2 py-0.5 font-mono text-[10px] text-orange-700">
              Over by {moneyShort(Math.abs(remaining), currency)}
            </span>
          )}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 -mt-1">
          {transactions.length === 0 ? (
            <p className="font-mono text-[11px] text-stone-400 py-2">
              No transactions in this category yet.
            </p>
          ) : (
            <ul className="border-t border-dashed border-stone-200">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-dashed border-stone-100 last:border-0"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] text-stone-700 truncate">
                      {tx.parsed?.merchant || 'Unknown'}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      {tx.parsed?.date} · {tx.parsed?.time}
                    </span>
                  </span>
                  <span className="font-mono text-[13px] text-stone-700 tabular-nums shrink-0">
                    {money(tx.parsed?.amount ?? 0, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(category.id)}
              className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-red-500"
            >
              <Trash2 size={13} strokeWidth={1.75} /> Remove category
            </button>
          )}
        </div>
      )}
    </div>
  )
}
