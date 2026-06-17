import { useRef, useState } from 'react'
import { input, resetInput } from '../game/input'

// 한 손가락 조이스틱: 위/아래 = 전진/후진, 좌/우 = 방향 전환.
export function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const [nub, setNub] = useState({ x: 0, y: 0 })
  const activeId = useRef<number | null>(null)

  const update = (clientX: number, clientY: number) => {
    const el = baseRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const max = r.width / 2 - 12
    const dist = Math.hypot(dx, dy)
    if (dist > max) { dx = (dx / dist) * max; dy = (dy / dist) * max }
    setNub({ x: dx, y: dy })
    // 정규화
    input.turn = dx / max          // 우(+)/좌(-)
    input.move = -dy / max         // 위로 밀면 전진(+)
  }

  const end = () => {
    activeId.current = null
    setNub({ x: 0, y: 0 })
    resetInput()
  }

  return (
    <div
      ref={baseRef}
      className="joystick"
      onPointerDown={(e) => {
        activeId.current = e.pointerId
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        update(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (activeId.current === e.pointerId) update(e.clientX, e.clientY)
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="nub" style={{ transform: `translate(${nub.x}px, ${nub.y}px)` }}>🚶</div>
    </div>
  )
}
