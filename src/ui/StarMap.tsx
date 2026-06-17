import { useState } from 'react'
import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'
import { PLANET_THEMES, THEME_BY_KEY, NEW_PLANET_COST, type PlanetTheme } from '../game/planets'

export function StarMap({ onToast }: { onToast: (m: string) => void }) {
  const setPanel = useGame((s) => s.setPanel)
  const planets = useGame((s) => s.planets)
  const currentPlanetId = useGame((s) => s.currentPlanetId)
  const coins = useGame((s) => s.coins)
  const travelTo = useGame((s) => s.travelTo)
  const createPlanet = useGame((s) => s.createPlanet)

  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [theme, setTheme] = useState<PlanetTheme>('desert')

  const onCreate = () => {
    const id = createPlanet(theme, name)
    if (!id) { onToast('별빛이 모자라요'); return }
    setCreating(false); setName('')
    onToast('새로운 별을 발견했어요 ✦')
    travelTo(id)
  }

  return (
    <Sheet
      title="별지도 🗺️"
      sub="내가 가꾼 별들을 오갈 수 있어요. 새 별을 발견해 또 다른 풍경을 만들어보세요."
      onClose={() => setPanel(null)}
    >
      <div className="badge" style={{ display: 'inline-flex', marginBottom: 12 }}>🪙 {coins} 별빛</div>

      <div className="planet-list">
        {planets.map((p) => {
          const t = THEME_BY_KEY[p.theme]
          const here = p.id === currentPlanetId
          return (
            <button
              key={p.id}
              className={`planet-card ${here ? 'here' : ''}`}
              onClick={() => { if (!here) travelTo(p.id); else setPanel(null) }}
            >
              <div className="orb" style={{ background: `radial-gradient(circle at 35% 30%, ${t.accent}, ${t.ground})` }}>{t.emoji}</div>
              <div className="pc-meta">
                <div className="pc-name">{p.name}</div>
                <div className="pc-sub">{t.name} · 장식 {p.items.length} · 블록 {p.blocks.length}</div>
              </div>
              <div className="pc-go">{here ? '현재 별' : '여행 →'}</div>
            </button>
          )
        })}
      </div>

      {!creating ? (
        <button className="btn full" style={{ marginTop: 16 }} onClick={() => setCreating(true)}>
          ✦ 새 별 발견하기 (🪙 {NEW_PLANET_COST})
        </button>
      ) : (
        <div style={{ marginTop: 16 }}>
          <input className="txt" placeholder="새 별의 이름" value={name} maxLength={12} onChange={(e) => setName(e.target.value)} />
          <p className="sub" style={{ margin: '12px 0 6px' }}>풍경 고르기</p>
          <div className="chips">
            {PLANET_THEMES.map((t) => (
              <button key={t.theme} className={`chip ${theme === t.theme ? 'active' : ''}`} onClick={() => setTheme(t.theme)}>
                {t.emoji} {t.name}
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn ghost" onClick={() => setCreating(false)}>취소</button>
            <button className="btn" onClick={onCreate} disabled={coins < NEW_PLANET_COST}>발견하기</button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
