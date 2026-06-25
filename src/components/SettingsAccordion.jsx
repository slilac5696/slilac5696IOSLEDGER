import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function SettingsAccordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-stone-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full py-3.5 flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-stone-800">
          {title}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`text-stone-400 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}
