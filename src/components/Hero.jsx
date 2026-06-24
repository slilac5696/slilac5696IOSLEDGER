function prevMonthLabel(viewYear, viewMonth) {
  return new Date(viewYear, viewMonth - 1).toLocaleDateString('en-US', { month: 'long' })
}

export default function Hero({
  total,
  changePercent,
  currency,
  monthLabel,
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
}) {
  const isUp = changePercent > 0
  const isDown = changePercent < 0

  return (
    <section className="bg-teal-800 text-white px-6 pt-8 pb-6">
      <nav className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onPrevMonth}
          className="text-white/70 hover:text-white text-lg px-1 transition-opacity"
          aria-label="Previous month"
        >
          ◀
        </button>
        <span className="font-display text-base text-white">{monthLabel}</span>
        <button
          type="button"
          onClick={onNextMonth}
          className="text-white/70 hover:text-white text-lg px-1 transition-opacity"
          aria-label="Next month"
        >
          ▶
        </button>
      </nav>

      <p className="font-mono text-[10px] uppercase tracking-widest text-white/60 mb-1">
        Total spend
      </p>
      <p className="font-display text-[56px] leading-none tracking-tight text-white">
        {currency} {total.toFixed(2)}
      </p>

      {changePercent !== null && (
        <p
          className={`font-mono text-xs mt-3 ${
            isUp ? 'text-orange-300' : isDown ? 'text-emerald-300' : 'text-white/60'
          }`}
        >
          {isUp ? '▲' : isDown ? '▼' : '—'} {Math.abs(changePercent).toFixed(0)}% vs{' '}
          {prevMonthLabel(viewYear, viewMonth)}
        </p>
      )}
    </section>
  )
}
