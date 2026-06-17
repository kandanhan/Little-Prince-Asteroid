import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'

export function Gallery() {
  const setPanel = useGame((s) => s.setPanel)
  const paintings = useGame((s) => s.paintings)
  const removePainting = useGame((s) => s.removePainting)

  const download = (url: string, title: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'b612-art'}.png`
    a.click()
  }

  return (
    <Sheet title="나의 갤러리 🖼️" sub={`${paintings.length}점의 그림을 모았어요.`} onClose={() => setPanel(null)}>
      {paintings.length === 0 ? (
        <p className="sub">아직 그림이 없어요. ‘그림’에서 첫 작품을 그려보세요.</p>
      ) : (
        <div className="gallery-grid">
          {paintings.map((p) => (
            <div key={p.id}>
              <img src={p.dataUrl} alt={p.title} onClick={() => download(p.dataUrl, p.title)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                <button className="journal-entry-del" style={{ background: 'none', border: 'none', color: '#c8c0ae' }} onClick={() => removePainting(p.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="sub" style={{ marginTop: 12 }}>그림을 누르면 기기에 저장돼요.</p>
    </Sheet>
  )
}
