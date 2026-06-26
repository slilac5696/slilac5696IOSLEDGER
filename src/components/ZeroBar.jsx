import { Check } from 'lucide-react'
import { money } from '../lib/format'

/**
 * Zero-based budgeting bar: shows how much of income has been assigned to
 * categories, and how much is left to budget.
 */
export default function ZeroBar({ income, budgeted, currency = 'MVR' }) {
  const leftToBudget = income - budgeted
  const overBudgeted = leftToBudget < -0.005
  const fullyBudgeted = Math.abs(leftToBudget) <= 0.005 && income > 0
  const pct = income > 0 ? Math.min((budgeted / income) * 100, 100) : 0

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between font-mono text-[11px] text-teal-50/90">
        <span>Budgeted: {money(budgeted, currency)}</span>
        <span>
          {leftToBudget >= 0 ? 'Left to budget: ' : 'Over by: '}
          {money(Math.abs(leftToBudget), currency)}
        </span>
      </div>

      <div className="mt-2 h-2.5 w-full rounded-full bg-teal-900/40 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            overBudgeted ? 'bg-orange-300' : 'bg-teal-300'
          }`}
          style={{ width: `${overBudgeted ? 100 : pct}%` }}
        />
      </div>

      <div className="mt-2.5 min-h-[20px]">
        {overBudgeted ? (
          <p className="font-mono text-[11px] text-orange-200">
            You've assigned more than your income — trim a category.
          </p>
        ) : fullyBudgeted ? (
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-200">
            <Check size={13} strokeWidth={2.5} />
            Every dollar has a job
          </p>
        ) : leftToBudget > 0 ? (
          <p className="font-mono text-[11px] text-amber-200">
            Assign remaining dollars to a category
          </p>
        ) : null}
      </div>
    </div>
  )
}
