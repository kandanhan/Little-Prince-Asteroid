import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'

export function Menu({ onToast }: { onToast: (m: string) => void }) {
  const setPanel = useGame((s) => s.setPanel)
  const autoTime = useGame((s) => s.autoTime)
  const setAutoTime = useGame((s) => s.setAutoTime)
  const dayPhase = useGame((s) => s.dayPhase)
  const setDayPhase = useGame((s) => s.setDayPhase)
  const items = useGame((s) => s.items)
  const reset = useGame((s) => s.reset)

  const timeLabel =
    dayPhase < 0.22 || dayPhase >= 0.8 ? '🌙 밤' :
    dayPhase < 0.32 ? '🌅 새벽' :
    dayPhase < 0.68 ? '☀️ 낮' : '🌇 노을'

  return (
    <Sheet title="더보기" onClose={() => setPanel(null)}>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn ghost" onClick={() => setPanel('gallery')}>🖼️ 갤러리</button>
        <button className="btn ghost" onClick={() => setPanel('journal')}>📖 일기</button>
      </div>

      <h2 style={{ fontSize: 16 }}>시간 {timeLabel}</h2>
      <p className="sub">자동으로 하루가 흐르게 하거나, 직접 노을·밤을 골라보세요.</p>
      <div className="chips" style={{ marginBottom: 10 }}>
        <button className={`chip ${autoTime ? 'active' : ''}`} onClick={() => setAutoTime(true)}>자동 흐름</button>
        <button className={`chip ${!autoTime ? 'active' : ''}`} onClick={() => setAutoTime(false)}>직접 고르기</button>
      </div>
      {!autoTime && (
        <input
          type="range" min={0} max={1} step={0.01} value={dayPhase}
          onChange={(e) => setDayPhase(parseFloat(e.target.value))}
          style={{ width: '100%', marginBottom: 16 }}
        />
      )}

      <h2 style={{ fontSize: 16 }}>나의 별</h2>
      <p className="sub">심은 것 {items.length}개. 천천히, 마음 가는 대로 가꿔보세요.</p>

      <button
        className="btn ghost full"
        style={{ marginTop: 12, color: '#c1121f' }}
        onClick={() => {
          if (confirm('정말 이 별을 처음으로 되돌릴까요? 모든 기록이 사라져요.')) {
            reset(); onToast('별이 처음으로 돌아갔어요')
          }
        }}
      >
        별 처음으로 되돌리기
      </button>
      <p className="sub" style={{ marginTop: 16, textAlign: 'center', opacity: 0.7 }}>
        어린왕자의 작은 소행성 · B-612<br />작지만 완벽한 행복을 담아.
      </p>
    </Sheet>
  )
}
