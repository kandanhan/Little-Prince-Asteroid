import type { ReactNode } from 'react'

export function Sheet({ title, sub, onClose, children }: {
  title: string
  sub?: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="scrim" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <div className="grabber" />
        <h2>{title}</h2>
        {sub && <p className="sub">{sub}</p>}
        {children}
      </div>
    </div>
  )
}
