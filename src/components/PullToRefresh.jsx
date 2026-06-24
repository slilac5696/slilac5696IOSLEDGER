import { useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function PullToRefresh({ onRefresh, refreshing, children }) {
  const containerRef = useRef(null)
  const startY = useRef(0)
  const pulling = useRef(false)
  const [pullDistance, setPullDistance] = useState(0)

  function handleTouchStart(e) {
    const el = containerRef.current
    if (!el || el.scrollTop > 0) return
    startY.current = e.touches[0].clientY
    pulling.current = true
  }

  function handleTouchMove(e) {
    if (!pulling.current || refreshing) return
    const diff = e.touches[0].clientY - startY.current
    if (diff > 0) setPullDistance(Math.min(diff * 0.4, 56))
    else setPullDistance(0)
  }

  function handleTouchEnd() {
    if (!pulling.current) return
    pulling.current = false
    if (pullDistance > 40) onRefresh()
    setPullDistance(0)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overscroll-y-contain"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex justify-center items-center overflow-hidden transition-[height] duration-150"
        style={{ height: refreshing ? 40 : pullDistance }}
      >
        <RefreshCw
          size={18}
          strokeWidth={1.5}
          className={`text-teal-800 ${refreshing ? 'animate-spin' : ''}`}
          style={{
            opacity: refreshing || pullDistance > 10 ? 1 : 0,
            transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  )
}
