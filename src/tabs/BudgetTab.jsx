import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import ZeroBar from '../components/ZeroBar'
import CategoryRow from '../components/CategoryRow'
import { money, monthLabel } from '../lib/format'

export default function BudgetTab({
  income,
  totalSpent,
  totalBudgeted,
  currency,
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
  categoryStats,
  expandedId,
  onToggleCategory,
  onEditBudget,
  onDeleteCategory,
  onAddCategory,
}) {
  return (
    <div className="pb-28">
      <section className="bg-teal-800 text-white px-5 pt-4 pb-6">
        <div className="flex items-center justify-center gap-4">
          <button type="button" onClick={onPrevMonth} className="p-1 text-teal-200" aria-label="Previous month">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <span className="font-mono text-xs uppercase tracking-widest text-teal-50">
            {monthLabel(year, monthIndex)}
          </span>
          <button type="button" onClick={onNextMonth} className="p-1 text-teal-200" aria-label="Next month">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal-200">Income</p>
            <p className="mt-1 font-display text-xl">{money(income, currency)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal-200">Spent</p>
            <p className="mt-1 font-display text-xl">{money(totalSpent, currency)}</p>
          </div>
        </div>

        <ZeroBar income={income} budgeted={totalBudgeted} currency={currency} />
      </section>

      <section>
        {categoryStats.length === 0 ? (
          <p className="px-5 py-10 text-center font-mono text-xs text-stone-400">
            No categories yet. Add one to start giving every {currency} a job.
          </p>
        ) : (
          categoryStats.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              spent={cat.spent}
              transactions={cat.transactions}
              currency={currency}
              expanded={expandedId === cat.id}
              onToggle={() => onToggleCategory(cat.id)}
              onEditBudget={onEditBudget}
              onDelete={onDeleteCategory}
            />
          ))
        )}

        <button
          type="button"
          onClick={onAddCategory}
          className="w-full px-5 py-4 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest text-teal-800 border-b border-stone-100"
        >
          <Plus size={16} strokeWidth={2} /> Add category
        </button>
      </section>
    </div>
  )
}
