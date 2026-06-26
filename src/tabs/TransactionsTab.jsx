import { useState, useMemo } from 'react'
import TransactionRow from '../components/TransactionRow'

export default function TransactionsTab({ transactions, categories, currency, onDelete, onAssign }) {
  const [filter, setFilter] = useState('All')

  const filters = useMemo(
    () => ['All', ...categories.map((c) => c.name), 'Uncategorized'],
    [categories]
  )

  const visible = useMemo(() => {
    if (filter === 'All') return transactions
    if (filter === 'Uncategorized') {
      return transactions.filter((tx) => tx.parsed && !tx.category_name)
    }
    return transactions.filter((tx) => tx.category_name === filter)
  }, [transactions, filter])

  return (
    <div className="pb-28">
      <div className="sticky top-14 z-10 bg-stone-50/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[11px] border transition-colors ${
                filter === f
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="px-5 py-12 text-center font-mono text-xs text-stone-400">
          No transactions{filter !== 'All' ? ` in ${filter}` : ' this month'} yet.
        </p>
      ) : (
        visible.map((tx) => (
          <TransactionRow
            key={tx.id}
            transaction={tx}
            currency={currency}
            onDelete={onDelete}
            onAssign={onAssign}
          />
        ))
      )}
    </div>
  )
}
