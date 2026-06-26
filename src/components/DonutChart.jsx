import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { money } from '../lib/format'

const TEAL_PALETTE = [
  '#0f766e',
  '#0d9488',
  '#14b8a6',
  '#2dd4bf',
  '#5eead4',
  '#99f6e4',
  '#115e59',
  '#134e4a',
]

export default function DonutChart({ data, currency = 'MVR' }) {
  const slices = data.filter((d) => d.value > 0)
  const total = slices.reduce((sum, d) => sum + d.value, 0)

  if (!slices.length) {
    return (
      <p className="py-10 text-center font-mono text-xs text-stone-400">
        No spending to chart yet.
      </p>
    )
  }

  return (
    <div className="relative h-60">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={1.5}
            stroke="none"
          >
            {slices.map((entry, i) => (
              <Cell key={entry.name} fill={TEAL_PALETTE[i % TEAL_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [money(value, currency), name]}
            contentStyle={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e7e5e4',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl text-stone-900">
          {money(total, currency)}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400">
          total spent
        </span>
      </div>
    </div>
  )
}
