import { useState } from 'react'
import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'

const PROMPTS = [
  '오늘 나를 미소 짓게 한 작은 것은?',
  '지금 가까워지고 싶은 마음은?',
  '오늘 내 별에게 한마디',
  '오늘의 노을은 어땠나요?',
]

function fmt(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function Journal() {
  const setPanel = useGame((s) => s.setPanel)
  const journal = useGame((s) => s.journal)
  const addJournal = useGame((s) => s.addJournal)
  const removeJournal = useGame((s) => s.removeJournal)
  const [text, setText] = useState('')

  const save = () => {
    if (!text.trim()) return
    addJournal(text.trim())
    setText('')
  }

  return (
    <Sheet title="별의 일기 📖" sub="이 별에서의 마음을 적어두세요. 기기에만 조용히 저장돼요." onClose={() => setPanel(null)}>
      <textarea className="txt" rows={3} placeholder={PROMPTS[Math.floor(Math.random() * PROMPTS.length)]} value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn full" style={{ margin: '10px 0 18px' }} onClick={save} disabled={!text.trim()}>오늘을 남기기 ✦</button>
      {journal.map((j) => (
        <div className="journal-entry" key={j.id}>
          <div className="date">{fmt(j.createdAt)}</div>
          <button className="del" onClick={() => removeJournal(j.id)}>✕</button>
          {j.text}
        </div>
      ))}
    </Sheet>
  )
}
