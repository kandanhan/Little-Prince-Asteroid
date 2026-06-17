import { useState } from 'react'
import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'
import { composer, moodForSeed, randomSongTitle, MOODS } from '../audio/composer'

export function MusicStudio({ onToast }: { onToast: (m: string) => void }) {
  const setPanel = useGame((s) => s.setPanel)
  const addSong = useGame((s) => s.addSong)
  const setActiveSong = useGame((s) => s.setActiveSong)
  const songs = useGame((s) => s.songs)
  const activeSongSeed = useGame((s) => s.activeSongSeed)

  const [preview, setPreview] = useState<{ seed: number; title: string; mood: string } | null>(null)

  const compose = () => {
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0
    const mood = moodForSeed(seed)
    const title = randomSongTitle(seed)
    setPreview({ seed, title, mood: mood.name })
    composer.play(seed)
    setActiveSong(seed)
  }

  const save = () => {
    if (!preview) return
    addSong({ seed: preview.seed, title: preview.title, mood: preview.mood })
    onToast('곡이 저장되어 행성에 흘러요 🎶')
  }

  const toggle = (seed: number) => {
    if (activeSongSeed === seed && composer.playing) {
      composer.stop(); setActiveSong(null)
    } else {
      composer.play(seed); setActiveSong(seed)
    }
  }

  return (
    <Sheet
      title="AI 작곡하기 🎵"
      sub="버튼을 누를 때마다 새로운 앰비언트 선율이 즉흥으로 태어나요. 마음에 들면 저장하세요."
      onClose={() => setPanel(null)}
    >
      <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0 16px' }}>
        <button
          className="btn rose"
          style={{ width: 160, height: 160, borderRadius: '50%', fontSize: 17 }}
          onClick={compose}
        >
          {preview ? '다른 곡 만들기 ↻' : '작곡하기 ♪'}
        </button>
      </div>

      {preview && (
        <div className="song-row">
          <button className={`play ${composer.playing && activeSongSeed === preview.seed ? 'on' : ''}`} onClick={() => toggle(preview.seed)}>
            {composer.playing && activeSongSeed === preview.seed ? '❚❚' : '▶'}
          </button>
          <div className="song-meta">
            <div className="t">{preview.title}</div>
            <div className="m">{preview.mood} · 즉흥곡</div>
          </div>
          <button className="btn" onClick={save}>저장</button>
        </div>
      )}

      <p className="sub" style={{ margin: '16px 0 8px' }}>분위기는 시드에 따라 자동으로 정해져요: {MOODS.map((m) => m.name).join(' · ')}</p>

      {songs.length > 0 && <h2 style={{ fontSize: 16, marginTop: 8 }}>내 음악 서랍</h2>}
      {songs.map((s) => (
        <div className="song-row" key={s.id}>
          <button className={`play ${composer.playing && activeSongSeed === s.seed ? 'on' : ''}`} onClick={() => toggle(s.seed)}>
            {composer.playing && activeSongSeed === s.seed ? '❚❚' : '▶'}
          </button>
          <div className="song-meta">
            <div className="t">{s.title}</div>
            <div className="m">{s.mood}</div>
          </div>
        </div>
      ))}
    </Sheet>
  )
}
