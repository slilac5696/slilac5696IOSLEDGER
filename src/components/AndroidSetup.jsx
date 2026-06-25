export default function AndroidSetup({ webhookUrl, error, onCopy, copied }) {
  return (
    <div className="font-mono text-xs text-stone-600 space-y-3">
      <p className="leading-relaxed text-stone-500">
        Forward bank SMS to Ledger using an automation app (MacroDroid, Tasker, or Automate).
      </p>

      {error && <p className="text-orange-700">{error}</p>}

      {webhookUrl && (
        <>
          <p className="text-stone-400 uppercase tracking-wider text-[10px]">Webhook URL</p>
          <p className="break-all text-stone-800 bg-stone-100 p-2 border border-stone-200 text-[11px]">
            {webhookUrl}
          </p>
          <button
            type="button"
            onClick={onCopy}
            className="w-full py-2.5 bg-teal-800 text-white uppercase tracking-wider text-[11px]"
          >
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
        </>
      )}

      <div className="border border-dotted border-stone-200 p-3 space-y-2">
        <p className="text-stone-400 uppercase tracking-wider text-[10px]">MacroDroid</p>
        <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Trigger → SMS received → filter by bank sender</li>
          <li>Action → HTTP Request → Method <strong>POST</strong></li>
          <li>URL → paste webhook above</li>
          <li>Content type → <strong>Form URL encoded</strong></li>
          <li>Field <code>raw_message</code> → SMS body variable</li>
          <li>No extra headers needed</li>
        </ol>
      </div>

      <div className="border border-dotted border-stone-200 p-3 space-y-2">
        <p className="text-stone-400 uppercase tracking-wider text-[10px]">Tasker</p>
        <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Profile → Event → Phone → Received text → bank sender</li>
          <li>Task → Net → HTTP Request → POST your webhook URL</li>
          <li>Body → Form field <code>raw_message</code> = <code>%SMSRB</code> (message body)</li>
        </ol>
      </div>
    </div>
  )
}
