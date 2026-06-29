import { useGame } from '../store/useGame'
import { ITEM_BY_KIND } from '../game/items'

export function HUD() {
  const happiness = useGame((s) => s.happiness)
  const planetName = useGame((s) => s.planets.find((p) => p.id === s.currentPlanetId)?.name ?? '첫별')
  const tool = useGame((s) => s.tool)
  const selectedKind = useGame((s) => s.selectedKind)
  const coins = useGame((s) => s.coins)
  const deliveries = useGame((s) => s.deliveries)
  const setTool = useGame((s) => s.setTool)
  const setPanel = useGame((s) => s.setPanel)

  return (
    <>
      <div className="hud-top">
        <button className="badge" onClick={() => setPanel('starmap')} style={{ border: 'none', cursor: 'pointer' }}>🗺️ {planetName}</button>
        <div className="happy-bar"><div className="happy-fill" style={{ width: `${happiness}%` }} /></div>
        <div className="badge">🪙 {coins}</div>
      </div>
      {deliveries.length > 0 && (
        <div className="delivery-ping">🚀 별빛 배달부가 오는 중… ({deliveries.length})</div>
      )}

      <div className="tool-rail">
        <button
          className={`tool-btn ${tool === 'place' ? 'active' : ''}`}
          onClick={() => setPanel('place')}
          aria-label="심기"
        >
          {ITEM_BY_KIND[selectedKind].emoji}
          <small>심기</small>
        </button>
        <button
          className={`tool-btn ${tool === 'build' ? 'active' : ''}`}
          onClick={() => setPanel('build')}
          aria-label="조형"
        >
          🔨<small>조형</small>
        </button>
        <button
          className={`tool-btn ${tool === 'remove' ? 'active' : ''}`}
          onClick={() => setTool(tool === 'remove' ? 'walk' : 'remove')}
          aria-label="치우기"
        >
          ✋<small>치우기</small>
        </button>
        <button className="tool-btn" onClick={() => setPanel('shop')} aria-label="상점">
          🛍️<small>상점</small>
        </button>
        <button className="tool-btn" onClick={() => setPanel('art')} aria-label="그림">
          🎨<small>그림</small>
        </button>
        <button className="tool-btn" onClick={() => setPanel('music')} aria-label="작곡">
          🎵<small>작곡</small>
        </button>
        <button className="tool-btn" onClick={() => setPanel('inner')} aria-label="마음">
          🌟<small>마음</small>
        </button>
        <button className="tool-btn" onClick={() => setPanel('menu')} aria-label="더보기">
          ☰<small>더보기</small>
        </button>
      </div>
    </>
  )
}
