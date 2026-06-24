import { useRef, useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { formatAmount } from '../lib/parseMessage'

export default function TransactionRow({ transaction, parsed, onDelete }) {
  const [offsetX, setOffsetX] = useState(0)
  const startX = useRef(0)
  const dragging = useRef(false)

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX
    dragging.current = true
  }

  function handleTouchMove(e) {
    if (!dragging.current) return
    const diff = startX.current - e.touches[0].clientX
    if (diff > 0) setOffsetX(Math.min(diff, 56))
    else setOffsetX(0)
  }

  function handleTouchEnd() {
    dragging.current = false
    setOffsetX((x) => (x > 28 ? 56 : 0))
  }

  const unparsed = !parsed

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-14 flex items-center justify-center bg-red-50">
        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          className="p-3 text-red-600"
          aria-label="Delete transaction"
        >
          <Trash2 size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div
        className={`relative bg-stone-50 transition-transform duration-150 ${
          unparsed ? 'bg-orange-50' : ''
        }`}
        style={{ transform: `translateX(-${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between px-4 py-3.5 border-b border-stone-100">
          {unparsed ? (
            <div className="flex gap-2 flex-1 min-w-0 pr-3">
              <AlertTriangle
                size={16}
                strokeWidth={1.5}
                className="text-orange-700 shrink-0 mt-0.5"
              />
              <p className="font-mono text-[11px] text-orange-700 line-clamp-2 leading-relaxed">
                {transaction.raw_message}
              </p>
            </div>
          ) : (
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-[15px] font-semibold text-stone-900 truncate">
                {parsed.merchant}
              </p>
              <p className="font-mono text-[11px] text-stone-400 mt-0.5">
                {parsed.date} · {parsed.time} · ••{parsed.cardLast4}
              </p>
            </div>
          )}
          {parsed && (
            <p className="font-mono text-[15px] text-stone-800 tabular-nums shrink-0">
              {formatAmount(parsed.amount, parsed.currency)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
