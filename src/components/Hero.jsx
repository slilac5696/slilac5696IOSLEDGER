import { formatAmount } from '../lib/parseMessage'

export default function Hero({ total, changePercent, currency }) {
  const isUp = changePercent > 0
  const isDown = changePercent < 0

  return (
    <section className="px-4 py-6 border-b border-dashed border-stone-200">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-1">
        Total spend
      </p>
      <p className="font-display text-5xl text-stone-900 tracking-tight">
        {formatAmount(total, currency)}
      </p>
      {changePercent !== null && (
        <p
          className={`font-mono text-sm mt-2 ${
            isUp ? 'text-orange-700' : isDown ? 'text-emerald-700' : 'text-stone-500'
          }`}
        >
          {isUp ? '↑' : isDown ? '↓' : '—'}{' '}
          {Math.abs(changePercent).toFixed(1)}% vs last month
        </p>
      )}
    </section>
  )
}
