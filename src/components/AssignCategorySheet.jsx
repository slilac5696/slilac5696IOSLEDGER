import { iconFor } from '../lib/categoryIcons'
import { money } from '../lib/format'

export default function AssignCategorySheet({ transaction, categories, currency = 'MVR', onAssign, onClose }) {
  const parsed = transaction?.parsed

  return (
    <div>
      <h2 className="font-display text-lg text-stone-900 mb-1">Assign category</h2>
      {parsed && (
        <p className="font-mono text-xs text-stone-400 mb-4">
          {parsed.merchant} · {money(parsed.amount, parsed.currency || currency)}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="font-mono text-xs text-stone-400 py-6 text-center">
          No categories yet. Add one from the Budget tab first.
        </p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {categories.map((c) => {
            const Icon = iconFor(c.icon)
            const selected = transaction?.category_name === c.name
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onAssign(c.id, c.name)}
                  className="w-full flex items-center gap-3 py-3 text-left"
                >
                  <span className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 text-sm text-stone-800">{c.name}</span>
                  {selected && <span className="font-mono text-[10px] text-teal-700">current</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onAssign(null, null)}
        className="w-full mt-4 py-2.5 font-mono text-xs uppercase tracking-widest text-stone-500 border border-stone-200 rounded-xl"
      >
        Mark uncategorized
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-2 py-2.5 font-mono text-xs uppercase tracking-widest text-stone-400"
      >
        Cancel
      </button>
    </div>
  )
}
