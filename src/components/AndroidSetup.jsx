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
          One macro = one trigger (SMS) + one action (HTTP Request). Follow exactly:
        </p>

        <p className="mt-3 text-stone-700 uppercase tracking-wider text-[10px] font-medium">
          A · Trigger (red box)
        </p>
        <ol className="mt-1.5 list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Tap <strong>+</strong> on the red <strong>Triggers</strong> box.</li>
          <li>Open <strong>Call/SMS</strong> → tap <strong>SMS Received</strong>.</li>
          <li>
            On "Select Option" choose <strong>Any Number</strong> (catches every SMS) →
            <strong> OK</strong>.
          </li>
          <li>
            On "SMS Content" leave <strong>Any</strong> selected → <strong>OK</strong>.
          </li>
        </ol>

        <p className="mt-3 text-stone-700 uppercase tracking-wider text-[10px] font-medium">
          B · Action (blue box)
        </p>
        <ol className="mt-1.5 list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Tap <strong>+</strong> on the blue <strong>Actions</strong> box.</li>
          <li>
            Search <strong>http</strong> → under "Web Interactions" tap
            <strong> HTTP Request</strong>.
          </li>
          <li>
            On the <strong>Settings</strong> tab: Request method =
            <strong> POST</strong>, and paste the <strong>webhook URL</strong> above
            into <em>Enter url</em>.
          </li>
          <li>
            Swipe to the <strong>Content Body</strong> tab. Set
            <strong> Content type</strong> to <strong>text/plain</strong>.
          </li>
          <li>
            Keep <strong>Text</strong> selected. Tap the <strong>…</strong> button next
            to the Text box → <em>Magic Text</em> → <strong>SMS</strong> →
            <strong> Message</strong>. It inserts <code>[sms_message]</code>.
          </li>
          <li>
            The Text box should now show exactly <code>[sms_message]</code> and nothing
            else. Tap the <strong>✓</strong> (top right) to save the action.
          </li>
        </ol>

        <p className="mt-3 text-stone-700 uppercase tracking-wider text-[10px] font-medium">
          C · Save
        </p>
        <ol className="mt-1.5 list-decimal list-inside space-y-1.5 leading-relaxed text-[11px]">
          <li>Name the macro (e.g. "Ledger") and tap the save <strong>✓</strong>.</li>
          <li>Grant the SMS permission if prompted.</li>
          <li>Send yourself a bank-format SMS, or wait for a real one, to test.</li>
        </ol>

        <p className="mt-2 leading-relaxed text-stone-400 text-[11px]">
          Don't touch Query Params or Header Params — leave them empty.
          <code> [sms_message]</code> is MacroDroid's variable for the message text; it
          fills in the real SMS automatically.
        </p>
      </details>

      <p className="leading-relaxed text-stone-400 text-[11px]">
        Just testing? You can skip automation entirely — paste bank messages under
        <strong> Import SMS backlog</strong>, or add one with the <strong>+</strong> button.
      </p>
    </div>
  )
}
