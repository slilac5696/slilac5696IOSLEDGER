import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export default function TrendChart({ data }) {
  if (!data.length) {
    return (
      <div className="px-4 py-8 text-center font-mono text-xs text-stone-400">
        No spending data this month
      </div>
    )
  }

  const maxSpend = Math.max(...data.map((d) => d.spend))

  return (
    <section className="px-2 py-4 border-b border-dashed border-stone-200">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-500 px-2 mb-3">
        Daily spend
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: '#78716c' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 12,
              border: '1px dashed #e7e5e4',
              borderRadius: 0,
              background: '#fafaf9',
            }}
            formatter={(value) => [`MVR${value.toFixed(2)}`, 'Spend']}
          />
          <Bar dataKey="spend" radius={0}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.spend === maxSpend ? '#0f766e' : '#d6d3d1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
