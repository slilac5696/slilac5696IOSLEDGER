export default function SectionLabel({ children }) {
  return (
    <div className="border-t border-stone-200 pt-3 mt-1">
      <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 px-4 mb-2">
        {children}
      </p>
    </div>
  )
}
