import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import DonutChart from '../components/DonutChart'
import { money, moneyShort } from '../lib/format'

function abbreviate(name) {
  return name.length > 9 ? `${name.slice(0, 8)}…` : name
}

export default function ReportsTab({ categoryStats, monthlyTrend, prevMonthSpend, currency }) {
  const donutData = useMemo(
    () => categoryStats.map((c) => ({ name: c.name, value: c.spent })),
    [categoryStats]
  )

  const barData = useMemo(
    () =>
      categoryStats.map((c) => ({
        name: abbreviate(c.name),
        budgeted: c.budgeted,
        spent: c.spent,
        over: c.spent > c.budgeted,
      })),
    [categoryStats]
  )

  const totalSpent = categoryStats.reduce((s, c) => s + c.spent, 0)

  const biggest = useMemo(
    () => categoryStats.filter((c) => c.spent > 0).sort((a, b) => b.spent - a.spent)[0] || null,
    [categoryStats]
  )

  const mostOver = useMemo(() => {
    const over = categoryStats
      .map((c) => ({ ...c, overBy: c.spent - c.budgeted }))
      .filter((c) => c.overBy > 0.005)
      .sort((a, b) => b.overBy - a.overBy)
    return over[0] || null
  }, [categoryStats])

  const savedDelta = prevMonthSpend - totalSpent
  const savedLess = savedDelta > 0.005

  const hasData = totalSpent > 0 || categoryStats.some((c) => c.budgeted > 0)

  if (!hasData) {
    return (
      <div className="pb-28 px-5 py-16 text-center">
        <p className="font-mono text-xs text-stone-400">
          Reports appear once you have a budget and some spending this month.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-28 px-4 pt-5 space-y-8">
      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2">
          Spending by category
        </h2>
        <DonutChart data={donutData} currency={currency} />
      </section>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
          Budget vs actual
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e7e5e4" />
              <XAxis
                dataKey="name"
                tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#a8a29e' }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#a8a29e' }} width={44} />
              <Tooltip
                formatter={(value, name) => [money(value, currency), name === 'budgeted' ? 'Budgeted' : 'Spent']}
                contentStyle={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
              />
              <Bar dataKey="budgeted" fill="#e7e5e4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="spent" radius={[3, 3, 0, 0]}>
                {barData.map((d) => (
                  <Cell key={d.name} fill={d.over ? '#fb923c' : '#0f766e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
          Last 6 months
        </h2>
        <div className="h-52 rounded-xl bg-stone-100 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e7e5e4" />
              <XAxis dataKey="label" tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#a8a29e' }} />
              <YAxis tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#a8a29e' }} width={44} />
              <Tooltip
                formatter={(value) => [money(value, currency), 'Spent']}
                contentStyle={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
              />
              <Line type="monotone" dataKey="spend" stroke="#0f766e" strokeWidth={2} dot={{ r: 3, fill: '#0f766e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Biggest" value={biggest ? biggest.name : '—'} sub={biggest ? moneyShort(biggest.spent, currency) : ''} tone="stone" />
        <StatCard
          label="Most over"
          value={mostOver ? mostOver.name : 'None'}
          sub={mostOver ? `+${moneyShort(mostOver.overBy, currency)}` : 'on track'}
          tone={mostOver ? 'orange' : 'emerald'}
        />
        <StatCard
          label="vs last month"
          value={savedLess ? 'Saved' : savedDelta < -0.005 ? 'Spent more' : 'Even'}
          sub={moneyShort(Math.abs(savedDelta), currency)}
          tone={savedLess ? 'emerald' : savedDelta < -0.005 ? 'orange' : 'stone'}
        />
      </section>
    </div>
  )
}

function StatCard({ label, value, sub, tone }) {
  const toneClass =
    tone === 'orange' ? 'text-orange-600' : tone === 'emerald' ? 'text-emerald-600' : 'text-stone-800'
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <p className="font-mono text-[9px] uppercase tracking-wider text-stone-400">{label}</p>
      <p className={`mt-1 text-sm truncate ${toneClass}`}>{value}</p>
      {sub && <p className="font-mono text-[10px] text-stone-400 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}
