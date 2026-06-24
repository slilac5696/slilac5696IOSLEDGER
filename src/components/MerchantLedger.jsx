import { formatAmount } from '../lib/parseMessage'
import SectionLabel from './SectionLabel'

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
    <section className="pb-2">
      <SectionLabel>Top merchants</SectionLabel>
      <ol className="px-4 space-y-2 pt-1">
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
