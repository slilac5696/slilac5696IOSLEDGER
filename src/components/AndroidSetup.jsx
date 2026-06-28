import { useState } from 'react'

const PAYLOAD = '{"raw_message": "%text%"}'

export default function AndroidSetup({ webhookUrl, error, onCopy, copied }) {
  const [payloadCopied, setPayloadCopied] = useState(false)

  async function copyPayload() {
    try {
      await navigator.clipboard.writeText(PAYLOAD)
      setPayloadCopied(true)
      setTimeout(() => setPayloadCopied(false), 2000)
    } catch {
      setPayloadCopied(false)
    }
  }

  return (
    <div className="font-mono text-xs text-stone-600 space-y-3">
      <p className="leading-relaxed text-stone-500">
        Easiest way on Android — a free app with no scripting. Bank SMS get sent
        to Ledger automatically.
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

      <details open className="border border-teal-200 bg-teal-50 p-3 rounded-sm">
        <summary className="text-teal-800 uppercase tracking-wider text-[10px] font-medium cursor-pointer">
          Recommended · SMS to URL Forwarder (free)
        </summary>
        <ol className="mt-2 list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>
            Install <strong>SMS to URL Forwarder</strong> from the Play Store or
            F-Droid (open source, no account).
          </li>
          <li>Open it and tap <strong>+</strong> to add a rule.</li>
          <li>
            <strong>Sender</strong> → your bank's name or number (or <code>*</code> for all SMS).
          </li>
          <li><strong>URL</strong> → paste the webhook URL above.</li>
          <li>
            <strong>JSON payload</strong> → set it to exactly:
          </li>
        </ol>

        <p className="mt-2 break-all text-stone-800 bg-white p-2 border border-stone-200 text-[11px]">
          {PAYLOAD}
        </p>
        <button
          type="button"
          onClick={copyPayload}
          className="mt-2 w-full py-2 border border-teal-700 text-teal-800 uppercase tracking-wider text-[11px]"
        >
          {payloadCopied ? 'Copied!' : 'Copy payload'}
        </button>

        <ol start={6} className="mt-2 list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Save the rule and grant the SMS permission when asked.</li>
          <li>Send yourself a test SMS, or wait for the next bank message.</li>
        </ol>
        <p className="mt-2 leading-relaxed text-stone-500 text-[11px]">
          <code>%text%</code> is the app's placeholder for the message body — leave
          it as-is; it fills in the real SMS automatically.
        </p>
      </details>

      <details className="border border-dotted border-stone-200 p-3 rounded-sm">
        <summary className="text-stone-400 uppercase tracking-wider text-[10px] cursor-pointer">
          Alternative · MacroDroid (free)
        </summary>
        <p className="mt-2 leading-relaxed text-stone-500 text-[11px]">
          A free automation app. You'll build one macro with a trigger and an action.
        </p>
        <ol className="mt-2 list-decimal list-inside space-y-2 leading-relaxed text-[11px]">
          <li>Install <strong>MacroDroid</strong> from the Play Store and open it.</li>
          <li>Tap <strong>Add Macro</strong> (the + button).</li>
          <li>
            <strong>Add the trigger:</strong> tap <strong>Trigger</strong> →
            <em> Device Events</em> → <strong>SMS Received</strong>. For "Sender",
            type your bank's number/name, or leave it as <em>Any</em> to catch all SMS.
          </li>
          <li>
            <strong>Add the action:</strong> tap <strong>Action</strong> →
            <em> Connectivity</em> → <strong>HTTP Request</strong>.
          </li>
          <li>Set the method to <strong>POST</strong>.</li>
          <li>For the URL, paste the <strong>webhook URL</strong> from above.</li>
          <li>Set the body / content type to <strong>Form data</strong> (URL encoded).</li>
          <li>
            Add one field — name it <code>raw_message</code>. For its value, tap the
            tag/variable icon and pick <strong>SMS Message</strong> (the message text).
          </li>
          <li>Leave headers empty. Tick the checkmark to save the macro.</li>
          <li>Grant the SMS permission if prompted, then send a test SMS.</li>
        </ol>
      </details>

      <p className="leading-relaxed text-stone-400 text-[11px]">
        Just testing? You can skip automation entirely — paste bank messages under
        <strong> Import SMS backlog</strong>, or add one with the <strong>+</strong> button.
      </p>
    </div>
  )
}
