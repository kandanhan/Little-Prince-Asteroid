import { useEffect, useState } from 'react'
import { useGame } from '../store/useGame'

// 보상형 광고 "체험" 플레이어. 실제 AdMob 연결 시 이 오버레이 대신 SDK 광고가 뜬다.
export function AdOverlay({ onToast }: { onToast: (m: string) => void }) {
  const adPlaying = useGame((s) => s.adPlaying)
  const finishRewardedAd = useGame((s) => s.finishRewardedAd)
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (!adPlaying) { setCount(5); return }
    setCount(5)
    const id = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [adPlaying])

  if (!adPlaying) return null

  const done = count <= 0

  return (
    <div className="scrim" style={{ zIndex: 36, alignItems: 'center' }}>
      <div className="ad-card">
        <div className="ad-tag">광고 (체험)</div>
        <div className="ad-art">🛸✨🪐</div>
        <div className="ad-copy">별빛 배달부가 잠시 광고를 전해요</div>
        {!done ? (
          <div className="ad-count">{count}초 후 보상을 받을 수 있어요…</div>
        ) : (
          <button
            className="btn full"
            onClick={() => { const g = finishRewardedAd(true); onToast(`별빛 +${g} 받았어요 🪙`) }}
          >
            별빛 받기 🪙
          </button>
        )}
        <button className="ad-skip" onClick={() => finishRewardedAd(false)}>
          {done ? '닫기' : '건너뛰기 (보상 없음)'}
        </button>
        <p className="ad-note">실제 출시 버전에서는 AdMob 보상형 광고가 표시됩니다.</p>
      </div>
    </div>
  )
}
