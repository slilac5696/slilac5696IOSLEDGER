export default function BottomSheet({ open, onClose, children }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-200 ${
          open ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-stone-50 shadow-2xl transition-transform duration-250 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ transitionDuration: '250ms' }}
        role="dialog"
        aria-modal={open}
      >
        <div className="sticky top-0 bg-stone-50 pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-stone-300" aria-hidden />
        </div>
        <div className="px-4 pb-8">{children}</div>
      </div>
    </>
  )
}
