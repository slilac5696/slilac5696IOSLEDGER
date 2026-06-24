import { useState, useEffect, useCallback, useMemo } from 'react'
import { Settings, Plus } from 'lucide-react'
import LoginScreen from './components/LoginScreen'
import Hero from './components/Hero'
import TrendChart from './components/TrendChart'
import MerchantLedger from './components/MerchantLedger'
import TransactionRow from './components/TransactionRow'
import ManualAdd from './components/ManualAdd'
import EmptyState from './components/EmptyState'
import PullToRefresh from './components/PullToRefresh'
import SettingsSheet from './components/SettingsSheet'
import BottomSheet from './components/BottomSheet'
import SectionLabel from './components/SectionLabel'
import { parseMessage, parseTransactionDate } from './lib/parseMessage'
import { fetchTransactions, deleteTransaction } from './lib/supabase'

function enrichTransaction(tx) {
  const parsed = parseMessage(tx.raw_message)
  const txDate = parsed ? parseTransactionDate(parsed.date) : new Date(tx.received_at)
  return { ...tx, parsed, txDate }
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
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
    return buckets
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
    <div className="min-h-dvh bg-stone-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh relative">
        <header className="sticky top-0 z-20 bg-stone-50/95 backdrop-blur-sm px-4 py-3 flex items-center justify-center">
          <h1 className="font-display text-lg text-stone-900">Ledger</h1>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="absolute right-4 p-1 text-stone-600"
            aria-label="Settings"
          >
            <Settings size={22} strokeWidth={1.5} />
          </button>
        </header>

        <PullToRefresh onRefresh={loadTransactions} refreshing={loading}>
          <Hero
            total={monthTotal}
            changePercent={changePercent}
            currency={currency}
            monthLabel={monthLabel(viewYear, viewMonth)}
            viewYear={viewYear}
            viewMonth={viewMonth}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />

          <TrendChart data={dailyData} />
          <MerchantLedger merchants={topMerchants} currency={currency} />

          {loading && transactions.length === 0 ? (
            <p className="px-4 py-12 font-mono text-xs text-stone-400 text-center">Loading…</p>
          ) : monthTransactions.length === 0 ? (
            <EmptyState onAddManual={() => setAddOpen(true)} />
          ) : (
            <section className="pb-24">
              <SectionLabel>Transactions</SectionLabel>
              {monthTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  parsed={tx.parsed}
                  onDelete={handleDelete}
                />
              ))}
            </section>
          )}
        </PullToRefresh>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="absolute bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-teal-800 text-white shadow-lg flex items-center justify-center"
          aria-label="Add transaction"
        >
          <Plus size={24} strokeWidth={1.5} />
        </button>

        <SettingsSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          token={session.access_token}
          userId={session.user.id}
          onSaved={loadTransactions}
          onSignOut={() => setSession(null)}
        />

        <BottomSheet open={addOpen} onClose={() => setAddOpen(false)}>
          <ManualAdd
            token={session.access_token}
            userId={session.user.id}
            onSaved={loadTransactions}
            onClose={() => setAddOpen(false)}
            embedded
          />
        </BottomSheet>
      </div>
    </div>
  )
}
