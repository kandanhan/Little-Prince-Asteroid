import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'
import { ITEM_CATALOG, ITEM_BY_KIND } from '../game/items'

export function PlacePanel({ onToast }: { onToast: (m: string) => void }) {
  const selectedKind = useGame((s) => s.selectedKind)
  const setSelectedKind = useGame((s) => s.setSelectedKind)
  const setPanel = useGame((s) => s.setPanel)

  return (
    <Sheet
      title="무엇을 심어볼까요?"
      sub="아이템을 고른 뒤, 행성 표면을 톡 누르면 그 자리에 놓여요."
      onClose={() => setPanel(null)}
    >
      <div className="item-grid">
        {ITEM_CATALOG.map((it) => (
          <button
            key={it.kind}
            className={`item-cell ${selectedKind === it.kind ? 'active' : ''}`}
            onClick={() => setSelectedKind(it.kind)}
          >
            <div className="emoji">{it.emoji}</div>
            <div className="nm">{it.name}</div>
          </button>
        ))}
      </div>
      <p className="sub" style={{ marginTop: 14 }}>“{ITEM_BY_KIND[selectedKind].hint}”</p>
      <button
        className="btn full"
        onClick={() => { setSelectedKind(selectedKind); setPanel(null); onToast(`${ITEM_BY_KIND[selectedKind].name} 선택! 행성을 눌러 심어보세요`) }}
      >
        이걸로 심기 시작 ✦
      </button>
    </Sheet>
  )
}
