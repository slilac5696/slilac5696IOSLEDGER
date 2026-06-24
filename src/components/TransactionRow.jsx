import { useRef, useState } from 'react'
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
    if (diff > 0) setOffsetX(Math.min(diff, 80))
    else setOffsetX(0)
  }

  function handleTouchEnd() {
    dragging.current = false
    if (offsetX > 40) {
      setOffsetX(80)
    } else {
      setOffsetX(0)
    }
  }

  const unparsed = !parsed

  return (
    <div className="relative overflow-hidden group">
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          className="h-full px-4 bg-orange-700 text-stone-50 font-mono text-xs uppercase tracking-wider"
        >
          Delete
        </button>
      </div>

      <div
        className={`relative bg-stone-50 transition-transform duration-150 ${
          unparsed ? 'border-l-2 border-orange-700' : ''
        }`}
        style={{ transform: `translateX(-${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between px-4 py-3 border-b border-dashed border-stone-200 group-hover:pr-20">
          {unparsed ? (
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-mono text-xs text-orange-700 uppercase tracking-wider mb-1">
                Unparsed message
              </p>
              <p className="font-mono text-xs text-stone-600 break-words">{transaction.raw_message}</p>
            </div>
          ) : (
            <div className="flex-1 min-w-0 pr-4">
              <p className="font-mono text-sm text-stone-900 truncate">{parsed.merchant}</p>
              <p className="font-mono text-xs text-stone-500 mt-0.5">
                {parsed.date} · {parsed.time} · ••{parsed.cardLast4}
              </p>
            </div>
          )}
          {parsed && (
            <p className="font-mono text-sm text-stone-900 tabular-nums shrink-0">
              {formatAmount(parsed.amount, parsed.currency)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          className="hidden group-hover:block absolute right-0 top-0 bottom-0 px-4 bg-orange-700 text-stone-50 font-mono text-xs uppercase tracking-wider"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
