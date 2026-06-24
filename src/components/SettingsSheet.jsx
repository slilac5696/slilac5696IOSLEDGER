import BottomSheet from './BottomSheet'
import ShortcutSetup from './ShortcutSetup'
import BulkImport from './BulkImport'

export default function SettingsSheet({
  open,
  onClose,
  token,
  userId,
  onSaved,
  onSignOut,
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <ShortcutSetup token={token} embedded />
      <div className="border-t border-stone-200 my-6" />
      <BulkImport token={token} userId={userId} onSaved={onSaved} embedded />
      <div className="border-t border-stone-200 my-6" />
      <button
        type="button"
        onClick={() => {
          onClose()
          onSignOut()
        }}
        className="w-full py-3 font-mono text-sm text-red-600"
      >
        Sign out
      </button>
    </BottomSheet>
  )
}
