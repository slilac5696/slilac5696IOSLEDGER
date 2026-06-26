import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Settings, Plus, PieChart, Receipt, BarChart3, ListPlus, FolderPlus } from 'lucide-react'
import LoginScreen from './components/LoginScreen'
import BottomSheet from './components/BottomSheet'
import SettingsSheet from './components/SettingsSheet'
import OnboardingFlow from './components/OnboardingFlow'
import AddCategorySheet from './components/AddCategorySheet'
import AssignCategorySheet from './components/AssignCategorySheet'
import ManualAdd from './components/ManualAdd'
import BudgetTab from './tabs/BudgetTab'
import TransactionsTab from './tabs/TransactionsTab'
import ReportsTab from './tabs/ReportsTab'
import { parseMessage, parseTransactionDate } from './lib/parseMessage'
import {
  fetchTransactions,
  deleteTransaction,
  updateTransactionCategory,
  fetchMonthlyIncome,
  fetchCategories,
  insertCategory,
  updateCategory,
  deleteCategory,
  refreshSession,
} from './lib/supabase'
import { monthKey } from './lib/format'
import { saveSession, loadSession, clearSession } from './lib/session'

function enrichTransaction(tx) {
  const parsed = parseMessage(tx.raw_message)
  const txDate = parsed ? parseTransactionDate(parsed.date) : new Date(tx.received_at)
  return { ...tx, parsed, txDate }
}

const TABS = [
  { id: 'budget', label: 'Budget', icon: PieChart },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
]

export default function App() {
  const [session, setSession] = useState(() => loadSession())
  const rememberRef = useRef(Boolean(loadSession()))

  const handleLogin = useCallback((next, remember = true) => {
    rememberRef.current = remember
    setSession(next)
    if (remember) saveSession(next)
    else clearSession()
  }, [])

  const handleSignOut = useCallback(() => {
    rememberRef.current = false
    setSession(null)
    clearSession()
  }, [])

  // Keep a saved session alive by refreshing its access token before expiry.
  useEffect(() => {
    if (!session?.refresh_token || !session?.expires_at) return
    let cancelled = false
    const delay = Math.max(session.expires_at * 1000 - Date.now() - 60_000, 0)
    const timer = setTimeout(async () => {
      try {
        const next = await refreshSession(session.refresh_token)
        if (cancelled) return
        setSession(next)
        if (rememberRef.current) saveSession(next)
      } catch {
        if (!cancelled) handleSignOut()
      }
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [session, handleSignOut])
  const [transactions, setTransactions] = useState([])
  const [income, setIncome] = useState(null)
  const [categories, setCategories] = useState([])
  const [budgetReady, setBudgetReady] = useState(false)

  const [activeTab, setActiveTab] = useState('budget')
  const [now] = useState(() => new Date())
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [assignTx, setAssignTx] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const month = monthKey(viewYear, viewMonth)
  const token = session?.access_token
  const userId = session?.user?.id

  const loadTransactions = useCallback(async () => {
    if (!token) return
    try {
      const data = await fetchTransactions(token)
      setTransactions(data.map(enrichTransaction))
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const loadBudget = useCallback(async () => {
    if (!token) return
    setBudgetReady(false)
    try {
      const [inc, cats] = await Promise.all([
        fetchMonthlyIncome(token, month),
        fetchCategories(token, month),
      ])
      setIncome(inc)
      setCategories(cats)
    } catch (err) {
      console.error(err)
    } finally {
      setBudgetReady(true)
    }
  }, [token, month])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  useEffect(() => {
    loadBudget()
  }, [loadBudget])

  // Refresh transactions when the app regains focus (newly ingested SMS).
  useEffect(() => {
    if (!token) return
    const onFocus = () => loadTransactions()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [token, loadTransactions])

  const monthTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => tx.txDate.getFullYear() === viewYear && tx.txDate.getMonth() === viewMonth)
        .sort((a, b) => b.txDate - a.txDate),
    [transactions, viewYear, viewMonth]
  )

  const currency = monthTransactions.find((tx) => tx.parsed)?.parsed?.currency ?? 'MVR'

  const totalSpent = useMemo(
    () => monthTransactions.reduce((sum, tx) => sum + (tx.parsed?.amount ?? 0), 0),
    [monthTransactions]
  )

  const incomeAmount = Number(income?.amount ?? 0)
  const totalBudgeted = useMemo(
    () => categories.reduce((sum, c) => sum + Number(c.budgeted ?? 0), 0),
    [categories]
  )

  const categoryStats = useMemo(
    () =>
      categories.map((c) => {
        const txs = monthTransactions.filter((tx) => tx.parsed && tx.category_name === c.name)
        const spent = txs.reduce((sum, tx) => sum + tx.parsed.amount, 0)
        return { ...c, budgeted: Number(c.budgeted ?? 0), spent, transactions: txs }
      }),
    [categories, monthTransactions]
  )

  const prevMonthSpend = useMemo(() => {
    const d = new Date(viewYear, viewMonth - 1)
    return transactions
      .filter((tx) => tx.parsed && tx.txDate.getFullYear() === d.getFullYear() && tx.txDate.getMonth() === d.getMonth())
      .reduce((sum, tx) => sum + tx.parsed.amount, 0)
  }, [transactions, viewYear, viewMonth])

  const monthlyTrend = useMemo(() => {
    const out = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - i, 1)
      const spend = transactions
        .filter((tx) => tx.parsed && tx.txDate.getFullYear() === d.getFullYear() && tx.txDate.getMonth() === d.getMonth())
        .reduce((sum, tx) => sum + tx.parsed.amount, 0)
      out.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), spend })
    }
    return out
  }, [transactions, viewYear, viewMonth])

  function prevMonth() {
    setExpandedId(null)
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    setExpandedId(null)
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  async function handleDeleteTransaction(id) {
    try {
      await deleteTransaction(token, id)
      setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAssign(categoryId, categoryName) {
    const tx = assignTx
    if (!tx) return
    try {
      await updateTransactionCategory(token, tx.id, categoryId, categoryName)
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, category_id: categoryId, category_name: categoryName } : t))
      )
    } catch (err) {
      console.error(err)
    } finally {
      setAssignTx(null)
    }
  }

  async function handleAddCategory(data) {
    const created = await insertCategory(token, userId, {
      month,
      name: data.name,
      icon: data.icon,
      budgeted: data.budgeted,
      sort_order: categories.length,
    })
    if (created) setCategories((prev) => [...prev, created])
  }

  async function handleEditBudget(id, budgeted) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, budgeted } : c)))
    try {
      await updateCategory(token, id, { budgeted })
    } catch (err) {
      console.error(err)
      loadBudget()
    }
  }

  async function handleDeleteCategory(id) {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setExpandedId(null)
    try {
      await deleteCategory(token, id)
    } catch (err) {
      console.error(err)
      loadBudget()
    }
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()
  const needsOnboarding = isCurrentMonth && budgetReady && !income && categories.length === 0

  if (needsOnboarding) {
    return (
      <OnboardingFlow
        token={token}
        userId={userId}
        month={month}
        year={viewYear}
        monthIndex={viewMonth}
        currency={currency}
        onComplete={loadBudget}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-stone-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh relative">
        <header className="sticky top-0 z-20 h-14 bg-stone-50/95 backdrop-blur-sm px-4 flex items-center justify-center">
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

        <main className="flex-1">
          {activeTab === 'budget' && (
            <BudgetTab
              income={incomeAmount}
              totalSpent={totalSpent}
              totalBudgeted={totalBudgeted}
              currency={currency}
              year={viewYear}
              monthIndex={viewMonth}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              categoryStats={categoryStats}
              expandedId={expandedId}
              onToggleCategory={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              onEditBudget={handleEditBudget}
              onDeleteCategory={handleDeleteCategory}
              onAddCategory={() => setAddCategoryOpen(true)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              transactions={monthTransactions}
              categories={categories}
              currency={currency}
              onDelete={handleDeleteTransaction}
              onAssign={(tx) => setAssignTx(tx)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              categoryStats={categoryStats}
              monthlyTrend={monthlyTrend}
              prevMonthSpend={prevMonthSpend}
              currency={currency}
            />
          )}
        </main>

        <button
          type="button"
          onClick={() => setFabOpen(true)}
          className="fixed bottom-24 z-30 w-14 h-14 rounded-full bg-teal-800 text-white shadow-lg flex items-center justify-center"
          style={{ right: 'calc(max(0px, 50vw - 14rem) + 1.5rem)' }}
          aria-label="Add"
        >
          <Plus size={24} strokeWidth={1.5} />
        </button>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20 bg-white border-t border-stone-200">
          <div className="grid grid-cols-3">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 ${active ? 'text-teal-800' : 'text-stone-400'}`}
                >
                  <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                  <span className="font-mono text-[10px] uppercase tracking-wider">{tab.label}</span>
                </button>
              )
            })}
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>

        <SettingsSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          token={token}
          userId={userId}
          month={month}
          year={viewYear}
          monthIndex={viewMonth}
          income={incomeAmount}
          currency={currency}
          onIncomeSaved={(value) => setIncome((prev) => ({ ...(prev || { month }), amount: value }))}
          onSaved={loadTransactions}
          onSignOut={handleSignOut}
        />

        <BottomSheet open={fabOpen} onClose={() => setFabOpen(false)}>
          <h2 className="font-display text-lg text-stone-900 mb-4">Add</h2>
          <button
            type="button"
            onClick={() => {
              setFabOpen(false)
              setManualOpen(true)
            }}
            className="w-full flex items-center gap-3 py-3.5 border-b border-stone-100 text-left"
          >
            <span className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <ListPlus size={17} strokeWidth={1.75} />
            </span>
            <span className="text-sm text-stone-800">Add transaction manually</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFabOpen(false)
              setActiveTab('budget')
              setAddCategoryOpen(true)
            }}
            className="w-full flex items-center gap-3 py-3.5 text-left"
          >
            <span className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <FolderPlus size={17} strokeWidth={1.75} />
            </span>
            <span className="text-sm text-stone-800">Add category</span>
          </button>
        </BottomSheet>

        <BottomSheet open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)}>
          <AddCategorySheet
            currency={currency}
            onSave={handleAddCategory}
            onClose={() => setAddCategoryOpen(false)}
          />
        </BottomSheet>

        <BottomSheet open={manualOpen} onClose={() => setManualOpen(false)}>
          <ManualAdd
            token={token}
            userId={userId}
            onSaved={loadTransactions}
            onClose={() => setManualOpen(false)}
            embedded
          />
        </BottomSheet>

        <BottomSheet open={Boolean(assignTx)} onClose={() => setAssignTx(null)}>
          {assignTx && (
            <AssignCategorySheet
              transaction={assignTx}
              categories={categories}
              currency={currency}
              onAssign={handleAssign}
              onClose={() => setAssignTx(null)}
            />
          )}
        </BottomSheet>
      </div>
    </div>
  )
}
