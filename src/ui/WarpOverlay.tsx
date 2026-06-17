import { useGame } from '../store/useGame'

// 별과 별 사이를 건너는 워프 연출 오버레이.
export function WarpOverlay() {
  const traveling = useGame((s) => s.traveling)
  if (!traveling) return null
  return (
    <div className="warp">
      <div className="warp-streaks">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 10) * 0.06}s`,
            top: `${(i * 53) % 100}%`,
          }} />
        ))}
      </div>
      <div className="warp-text">✦ 별과 별 사이를 건너는 중 ✦</div>
    </div>
  )
}
