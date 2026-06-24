import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import SectionLabel from './SectionLabel'

export default function TrendChart({ data }) {
  const hasData = data.some((d) => d.spend > 0)

  if (!hasData) {
    return (
      <section className="px-4 pb-2">
        <SectionLabel>Daily spend</SectionLabel>
        <div className="relative py-6 px-4">
          <div className="border-t border-dashed border-stone-300" />
          <p className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-stone-400 bg-stone-50 px-3">
            No spending data yet
          </p>
        </div>
      </section>
    )
  }

  const maxSpend = Math.max(...data.map((d) => d.spend))

  return (
    <section className="pb-2">
      <SectionLabel>Daily spend</SectionLabel>
      <div className="px-2 pt-1">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: '#a8a29e' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 12,
                border: '1px solid #e7e5e4',
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
      </div>
    </section>
  )
}
