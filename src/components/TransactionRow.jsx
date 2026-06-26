import { useRef, useState } from 'react'
import { Trash2, AlertTriangle, Zap } from 'lucide-react'
import { money } from '../lib/format'

export default function TransactionRow({ transaction, currency = 'MVR', onDelete, onAssign }) {
  const [offsetX, setOffsetX] = useState(0)
  const startX = useRef(0)
  const dragging = useRef(false)
  const moved = useRef(false)

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX
    dragging.current = true
    moved.current = false
  }

  function handleTouchMove(e) {
    if (!dragging.current) return
    const diff = startX.current - e.touches[0].clientX
    if (Math.abs(diff) > 6) moved.current = true
    if (diff > 0) setOffsetX(Math.min(diff, 56))
    else setOffsetX(0)
  }

  function handleTouchEnd() {
    dragging.current = false
    setOffsetX((x) => (x > 28 ? 56 : 0))
  }

  const parsed = transaction.parsed
  const unparsed = !parsed
  const categorized = Boolean(transaction.category_name)

  function handleClick() {
    if (moved.current) return
    if (offsetX !== 0) {
      setOffsetX(0)
      return
    }
    if (!unparsed) onAssign?.(transaction)
  }

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
        className={`relative transition-transform duration-150 ${
          unparsed ? 'bg-orange-50' : !categorized ? 'bg-amber-50' : 'bg-stone-50'
        }`}
        style={{ transform: `translateX(-${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between px-4 py-3.5 border-b border-stone-100">
          {unparsed ? (
            <div className="flex gap-2 flex-1 min-w-0 pr-3">
              <AlertTriangle size={16} strokeWidth={1.5} className="text-orange-700 shrink-0 mt-0.5" />
              <p className="font-mono text-[11px] text-orange-700 line-clamp-2 leading-relaxed">
                {transaction.raw_message}
              </p>
            </div>
          ) : (
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-[15px] text-stone-900 truncate">{parsed.merchant}</p>
              <p className="font-mono text-[11px] text-stone-400 mt-0.5">
                {parsed.date} · {parsed.time} · •{parsed.cardLast4}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 font-mono text-[10px] text-teal-700">
                  <Zap size={10} strokeWidth={2} /> auto
                </span>
                {categorized ? (
                  <span className="rounded-full bg-stone-200 px-2 py-0.5 font-mono text-[10px] text-stone-600">
                    {transaction.category_name}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 font-mono text-[10px] text-amber-800">
                    Tap to assign
                  </span>
                )}
              </div>
            </div>
          )}
          {parsed && (
            <p className="font-mono text-[15px] text-stone-800 tabular-nums shrink-0">
              {money(parsed.amount, parsed.currency || currency)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
