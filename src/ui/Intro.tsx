import { useState } from 'react'
import { useGame } from '../store/useGame'

export function Intro() {
  const setName = useGame((s) => s.setName)
  const setVisited = useGame((s) => s.setVisited)
  const [name, setLocal] = useState('')

  const enter = () => {
    if (name.trim()) setName(name.trim())
    setVisited(true)
  }

  return (
    <div className="intro">
      <div className="planet-emoji">🪐</div>
      <h1>어린왕자의 작은 소행성</h1>
      <p>
        오직 당신만을 위한 작은 별, B-612.<br />
        자유롭게 거닐며 꽃을 심고, 그림을 그리고,<br />
        나만의 음악을 지으며 천천히 쉬어가요.
      </p>
      <input
        className="txt"
        placeholder="이 별의 이름을 지어주세요"
        value={name}
        maxLength={12}
        onChange={(e) => setLocal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') enter() }}
      />
      <button className="btn" style={{ minWidth: 200 }} onClick={enter}>나의 별로 떠나기 ✦</button>
      <p style={{ marginTop: 22, fontSize: 12, opacity: 0.6 }}>
        “가장 중요한 것은 눈에 보이지 않아.”
      </p>
    </div>
  )
}
