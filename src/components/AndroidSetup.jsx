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

      <div className="border border-teal-200 bg-teal-50 p-3 space-y-2 rounded-sm">
        <p className="text-teal-800 uppercase tracking-wider text-[10px] font-medium">
          Recommended · SMS to URL Forwarder (free)
        </p>
        <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
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

        <p className="break-all text-stone-800 bg-white p-2 border border-stone-200 text-[11px]">
          {PAYLOAD}
        </p>
        <button
          type="button"
          onClick={copyPayload}
          className="w-full py-2 border border-teal-700 text-teal-800 uppercase tracking-wider text-[11px]"
        >
          {payloadCopied ? 'Copied!' : 'Copy payload'}
        </button>

        <ol start={6} className="list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Save the rule and grant the SMS permission when asked.</li>
          <li>Send yourself a test SMS, or wait for the next bank message.</li>
        </ol>
        <p className="leading-relaxed text-stone-500 text-[11px]">
          <code>%text%</code> is the app's placeholder for the message body — leave
          it as-is; it fills in the real SMS automatically.
        </p>
      </div>

      <details className="border border-dotted border-stone-200 p-3 rounded-sm">
        <summary className="text-stone-400 uppercase tracking-wider text-[10px] cursor-pointer">
          Alternative · MacroDroid (free)
        </summary>
        <ol className="mt-2 list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Trigger → SMS received → filter by bank sender</li>
          <li>Action → HTTP Request → Method <strong>POST</strong></li>
          <li>URL → paste webhook above</li>
          <li>Content type → <strong>Form URL encoded</strong></li>
          <li>Field <code>raw_message</code> → SMS body variable</li>
          <li>No extra headers needed</li>
        </ol>
      </details>

      <details className="border border-dotted border-stone-200 p-3 rounded-sm">
        <summary className="text-stone-400 uppercase tracking-wider text-[10px] cursor-pointer">
          Alternative · Tasker (paid app)
        </summary>
        <ol className="mt-2 list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Profile → Event → Phone → Received text → bank sender</li>
          <li>Task → Net → HTTP Request → POST your webhook URL</li>
          <li>Body → Form field <code>raw_message</code> = <code>%SMSRB</code> (message body)</li>
        </ol>
      </details>

      <p className="leading-relaxed text-stone-400 text-[11px]">
        Just testing? You can skip automation entirely — paste bank messages under
        <strong> Import SMS backlog</strong>, or add one with the <strong>+</strong> button.
      </p>
    </div>
  )
}
