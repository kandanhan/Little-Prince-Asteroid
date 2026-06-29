import { useEffect, useRef, useState } from 'react'
import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'
import {
  PERSONALITY_AXES, personalityCode, nextQuestion, princeReply, greeting,
  type Personality,
} from '../dialogue/innerVoice'

export function InnerVoice() {
  const setPanel = useGame((s) => s.setPanel)
  const personalitySet = useGame((s) => s.personalitySet)
  const [editing, setEditing] = useState(!personalitySet)

  return (
    <Sheet
      title="내 안의 작은 별 🌟"
      sub={editing ? '먼저 내 안의 작은 별을 너와 닮게 빚어볼까요?' : '천천히, 오늘의 너를 들려줘.'}
      onClose={() => setPanel(null)}
    >
      {editing
        ? <Setup onDone={() => setEditing(false)} />
        : <Conversation onEdit={() => setEditing(true)} />}
    </Sheet>
  )
}

function Setup({ onDone }: { onDone: () => void }) {
  const saved = useGame((s) => s.personality)
  const setPersonality = useGame((s) => s.setPersonality)
  const [p, setP] = useState<Personality>(saved)

  return (
    <div>
      <p className="sub">슬라이더를 움직여, 내 안의 작은 별이 나와 얼마나 닮을지 정해요. 언제든 바꿀 수 있어요.</p>
      {PERSONALITY_AXES.map((ax) => (
        <div key={ax.key} style={{ margin: '14px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#7a7790' }}>
            <span>{ax.left}</span>
            <span style={{ color: '#2b2b40' }}>{ax.q}</span>
            <span>{ax.right}</span>
          </div>
          <input
            type="range" min={0} max={1} step={0.01} value={p[ax.key]}
            onChange={(e) => setP({ ...p, [ax.key]: parseFloat(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      ))}
      <div className="badge" style={{ display: 'inline-flex', margin: '8px 0 16px' }}>
        유형: {personalityCode(p)}
      </div>
      <button className="btn full" onClick={() => { setPersonality(p); onDone() }}>이 작은 별과 마주 앉기 ✦</button>
    </div>
  )
}

function Conversation({ onEdit }: { onEdit: () => void }) {
  const personality = useGame((s) => s.personality)
  const princeName = useGame((s) => s.princeName)
  const dialogue = useGame((s) => s.dialogue)
  const pushDialogue = useGame((s) => s.pushDialogue)
  const clearDialogue = useGame((s) => s.clearDialogue)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // 첫 진입 시 인사 + 첫 질문
  useEffect(() => {
    if (dialogue.length === 0) {
      pushDialogue('prince', greeting(personality, princeName))
      setTimeout(() => pushDialogue('prince', nextQuestion(personality, [])), 350)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [dialogue.length, thinking])

  const send = () => {
    const text = input.trim()
    if (!text || thinking) return
    const recentQuestions = dialogue.filter((d) => d.role === 'prince').slice(-4).map((d) => d.text)
    pushDialogue('me', text)
    setInput('')
    setThinking(true)
    setTimeout(() => {
      pushDialogue('prince', princeReply(text, personality))
      setTimeout(() => {
        pushDialogue('prince', nextQuestion(personality, recentQuestions))
        setThinking(false)
      }, 600)
    }, 700)
  }

  return (
    <div>
      <div className="chat">
        {dialogue.map((d) => (
          <div key={d.id} className={`bubble ${d.role}`}>{d.text}</div>
        ))}
        {thinking && <div className="bubble prince typing">…</div>}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <textarea
          className="txt" rows={1} placeholder="마음을 들려주세요…" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        />
        <button className="btn" onClick={send} disabled={!input.trim() || thinking}>전하기</button>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn ghost" onClick={clearDialogue}>대화 비우기</button>
        <button className="btn ghost" onClick={onEdit}>성격 다시 빚기</button>
      </div>
      <p className="sub" style={{ marginTop: 12, opacity: 0.7 }}>
        이 대화는 기기 안에서만 머물러요. 지금은 오프라인 대화이고, 추후 진짜 AI와 이어집니다.
      </p>
    </div>
  )
}
