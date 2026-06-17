import { useState } from 'react'
import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'
import { generate, ART_STYLES, type ArtStyle } from '../art/generativeArt'

const SUGGEST = ['별이 쏟아지는 밤', '노을 지는 사막', '나의 장미', '푸른 바다와 바람', '꿈 속의 정원']

export function ArtStudio({ onToast }: { onToast: (m: string) => void }) {
  const setPanel = useGame((s) => s.setPanel)
  const addPainting = useGame((s) => s.addPainting)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<ArtStyle>('watercolor')
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    // 시드를 매번 살짝 바꿔 변주 (프롬프트는 색·구도에 반영)
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0
    const url = await generate({ prompt: prompt || '작은 행성의 꿈', style, seed, size: 768 })
    setPreview(url)
    setBusy(false)
  }

  const save = () => {
    if (!preview) return
    addPainting({ dataUrl: preview, title: prompt || '제목 없는 그림' })
    onToast('그림이 갤러리에 저장됐어요 🖼️')
    setPanel('gallery')
  }

  return (
    <Sheet
      title="AI 그림 그리기 🎨"
      sub="마음에 떠오르는 풍경을 적으면, 세상에 하나뿐인 그림이 태어나요."
      onClose={() => setPanel(null)}
    >
      <textarea
        className="txt"
        rows={2}
        placeholder="예: 별이 쏟아지는 밤의 사막"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="chips" style={{ margin: '10px 0' }}>
        {SUGGEST.map((s) => (
          <button key={s} className="chip" onClick={() => setPrompt(s)}>{s}</button>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 6 }}>
        {ART_STYLES.map((s) => (
          <button
            key={s.key}
            className={`chip ${style === s.key ? 'active' : ''}`}
            onClick={() => setStyle(s.key)}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      <div className="art-preview">
        {preview ? <img src={preview} alt="생성된 그림" /> : <span style={{ color: '#a59f8e' }}>그림을 그려보세요</span>}
      </div>

      <div className="row">
        <button className="btn ghost" onClick={run} disabled={busy}>
          {busy ? '그리는 중…' : preview ? '다시 그리기 ↻' : '그리기 ✦'}
        </button>
        <button className="btn" onClick={save} disabled={!preview}>갤러리에 담기</button>
      </div>
    </Sheet>
  )
}
