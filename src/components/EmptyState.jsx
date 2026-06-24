import ReceiptIcon from './ReceiptIcon'

export default function EmptyState({ onAddManual }) {
  return (
    <div className="px-8 py-12 text-center">
      <div className="flex justify-center mb-6">
        <ReceiptIcon />
      </div>
      <h2 className="font-display text-xl text-stone-700 mb-3">
        Waiting for your
        <br />
        first transaction
      </h2>
      <p className="font-mono text-xs text-stone-400 leading-relaxed mb-6">
        Use your card and the
        <br />
        SMS will appear here
        <br />
        automatically.
      </p>
      <button
        type="button"
        onClick={onAddManual}
        className="font-mono text-xs text-teal-800 underline underline-offset-2"
      >
        Add one manually
      </button>
    </div>
  )
}
