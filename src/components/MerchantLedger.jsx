import { formatAmount } from '../lib/parseMessage'

function LeaderLine() {
  return (
    <span
      className="flex-1 mx-2 border-b border-dotted border-stone-300 self-end mb-1"
      aria-hidden
    />
  )
}

export default function MerchantLedger({ merchants, currency }) {
  if (!merchants.length) return null

  return (
    <section className="px-4 py-4 border-b border-dashed border-stone-200">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-500 mb-3">
        Top merchants
      </p>
      <ol className="space-y-2">
        {merchants.map((m, i) => (
          <li key={m.name} className="flex items-baseline text-sm">
            <span className="font-mono text-xs text-stone-400 w-4">{i + 1}</span>
            <span className="font-mono text-stone-800 truncate max-w-[45%]">{m.name}</span>
            <LeaderLine />
            <span className="font-mono text-stone-900 tabular-nums">
              {formatAmount(m.total, currency)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
