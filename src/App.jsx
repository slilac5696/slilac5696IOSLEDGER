import { useState, useEffect, useCallback, useMemo } from 'react'
import LoginScreen from './components/LoginScreen'
import Hero from './components/Hero'
import TrendChart from './components/TrendChart'
import MerchantLedger from './components/MerchantLedger'
import TransactionRow from './components/TransactionRow'
import ManualAdd from './components/ManualAdd'
import { parseMessage, parseTransactionDate } from './lib/parseMessage'
import { fetchTransactions, deleteTransaction } from './lib/supabase'

function enrichTransaction(tx) {
  const parsed = parseMessage(tx.raw_message)
  const txDate = parsed ? parseTransactionDate(parsed.date) : new Date(tx.received_at)
  return { ...tx, parsed, txDate }
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function monthLabel(year, month) {
  return new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function App() {
  const [session, setSession] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [now] = useState(() => new Date())
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const loadTransactions = useCallback(async () => {
    if (!session?.access_token) return
    setLoading(true)
    try {
      const data = await fetchTransactions(session.access_token)
      setTransactions(data.map(enrichTransaction))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const monthTransactions = useMemo(
    () =>
      transactions
        .filter(
          (tx) =>
            tx.txDate.getFullYear() === viewYear && tx.txDate.getMonth() === viewMonth
        )
        .sort((a, b) => b.txDate - a.txDate),
    [transactions, viewYear, viewMonth]
  )

  const prevMonthDate = useMemo(() => new Date(viewYear, viewMonth - 1), [viewYear, viewMonth])
  const prevMonthTransactions = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.txDate.getFullYear() === prevMonthDate.getFullYear() &&
          tx.txDate.getMonth() === prevMonthDate.getMonth()
      ),
    [transactions, prevMonthDate]
  )

  const monthTotal = useMemo(
    () =>
      monthTransactions.reduce((sum, tx) => sum + (tx.parsed?.amount ?? 0), 0),
    [monthTransactions]
  )

  const prevMonthTotal = useMemo(
    () =>
      prevMonthTransactions.reduce((sum, tx) => sum + (tx.parsed?.amount ?? 0), 0),
    [prevMonthTransactions]
  )

  const changePercent = useMemo(() => {
    if (prevMonthTotal === 0) return null
    return ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100
  }, [monthTotal, prevMonthTotal])

  const currency = monthTransactions.find((tx) => tx.parsed)?.parsed?.currency ?? 'MVR'

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const buckets = Array.from({ length: daysInMonth }, (_, i) => ({
      day: String(i + 1),
      spend: 0,
    }))
    for (const tx of monthTransactions) {
      if (!tx.parsed) continue
      const day = tx.txDate.getDate()
      buckets[day - 1].spend += tx.parsed.amount
    }
    return buckets.filter((_, i) => i < daysInMonth)
  }, [monthTransactions, viewYear, viewMonth])

  const topMerchants = useMemo(() => {
    const map = new Map()
    for (const tx of monthTransactions) {
      if (!tx.parsed) continue
      const name = tx.parsed.merchant
      map.set(name, (map.get(name) ?? 0) + tx.parsed.amount)
    }
    return [...map.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [monthTransactions])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTransaction(session.access_token, id)
      setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  if (!session) {
    return <LoginScreen onLogin={setSession} />
  }

  return (
    <div className="min-h-dvh bg-stone-50">
      <div className="max-w-md mx-auto border-x border-stone-200 min-h-dvh">
        <header className="sticky top-0 z-10 bg-stone-50 border-b border-dashed border-stone-200 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSession(null)}
            className="font-mono text-xs text-stone-400 uppercase tracking-wider"
          >
            Sign out
          </button>
          <h1 className="font-display text-lg text-teal-800">Ledger</h1>
          <div className="w-14" />
        </header>

        <nav className="flex items-center justify-between px-4 py-3 border-b border-dashed border-stone-200">
          <button
            type="button"
            onClick={prevMonth}
            className="font-mono text-teal-800 text-lg px-2"
            aria-label="Previous month"
          >
            ←
          </button>
          <span className="font-display text-base text-stone-900">
            {monthLabel(viewYear, viewMonth)}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="font-mono text-teal-800 text-lg px-2"
            aria-label="Next month"
          >
            →
          </button>
        </nav>

        <Hero total={monthTotal} changePercent={changePercent} currency={currency} />
        <TrendChart data={dailyData} />
        <MerchantLedger merchants={topMerchants} currency={currency} />

        <ManualAdd
          token={session.access_token}
          userId={session.user.id}
          onSaved={loadTransactions}
        />

        <div
          className="h-3 perforation"
          aria-hidden
        />

        <section>
          {loading && transactions.length === 0 ? (
            <p className="px-4 py-8 font-mono text-xs text-stone-400 text-center">
              Loading…
            </p>
          ) : monthTransactions.length === 0 ? (
            <p className="px-4 py-8 font-mono text-xs text-stone-400 text-center">
              No transactions this month
            </p>
          ) : (
            monthTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                parsed={tx.parsed}
                onDelete={handleDelete}
              />
            ))
          )}
        </section>
      </div>
    </div>
  )
}
