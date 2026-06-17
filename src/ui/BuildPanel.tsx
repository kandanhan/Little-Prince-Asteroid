import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'
import { BUILD_PALETTE, BUILD_COLORS } from '../game/build'

export function BuildPanel({ onToast }: { onToast: (m: string) => void }) {
  const setPanel = useGame((s) => s.setPanel)
  const buildShape = useGame((s) => s.buildShape)
  const buildColor = useGame((s) => s.buildColor)
  const setBuildShape = useGame((s) => s.setBuildShape)
  const setBuildColor = useGame((s) => s.setBuildColor)

  return (
    <Sheet
      title="조형 공방 🔨"
      sub="블록을 골라 별 위에 톡 놓고, 블록 위를 다시 누르면 차곡차곡 쌓여요. 집·다리·탑을 지어보세요."
      onClose={() => setPanel(null)}
    >
      <div className="item-grid">
        {BUILD_PALETTE.map((b) => (
          <button
            key={b.shape}
            className={`item-cell ${buildShape === b.shape ? 'active' : ''}`}
            onClick={() => setBuildShape(b.shape)}
          >
            <div className="emoji">{b.emoji}</div>
            <div className="nm">{b.name}</div>
          </button>
        ))}
      </div>

      <p className="sub" style={{ margin: '16px 0 8px' }}>색</p>
      <div className="color-row">
        {BUILD_COLORS.map((c) => (
          <button
            key={c}
            className={`swatch ${buildColor === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => setBuildColor(c)}
            aria-label={c}
          />
        ))}
      </div>

      <button
        className="btn full"
        style={{ marginTop: 18 }}
        onClick={() => { setBuildShape(buildShape); setPanel(null); onToast('조형 시작! 별을 눌러 블록을 놓아보세요 🔨') }}
      >
        조형 시작 ✦
      </button>
    </Sheet>
  )
}
