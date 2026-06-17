import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGame } from './store/useGame'
import { Scene } from './game/Scene'
import { HUD } from './ui/HUD'
import { Joystick } from './ui/Joystick'
import { Intro } from './ui/Intro'
import { PlacePanel } from './ui/PlacePanel'
import { ArtStudio } from './ui/ArtStudio'
import { MusicStudio } from './ui/MusicStudio'
import { Gallery } from './ui/Gallery'
import { Journal } from './ui/Journal'
import { Menu } from './ui/Menu'
import { Shop } from './ui/Shop'
import { InnerVoice } from './ui/InnerVoice'
import { BuildPanel } from './ui/BuildPanel'
import { BuildBar } from './ui/BuildBar'
import { StarMap } from './ui/StarMap'
import { WarpOverlay } from './ui/WarpOverlay'
import { AdOverlay } from './ui/AdOverlay'

export default function App() {
  const visited = useGame((s) => s.visited)
  const panel = useGame((s) => s.panel)
  const tool = useGame((s) => s.tool)
  const claimDailyGift = useGame((s) => s.claimDailyGift)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (m: string) => {
    setToast(null)
    requestAnimationFrame(() => setToast(m))
  }

  // 접속하면 하루 한 번 별빛 선물
  useEffect(() => {
    if (!visited) return
    const gift = claimDailyGift()
    if (gift > 0) {
      const id = setTimeout(() => showToast(`오늘의 별빛 선물 🪙 +${gift}`), 1200)
      return () => clearTimeout(id)
    }
  }, [visited, claimDailyGift])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(id)
  }, [toast])

  const hint =
    tool === 'place' ? '행성 표면을 톡 눌러 심어보세요' :
    tool === 'build' ? '바닥을 누르면 놓이고, 블록 위를 누르면 쌓여요' :
    tool === 'remove' ? '치우고 싶은 것을 톡 누르세요' :
    '조이스틱으로 별 위를 거닐어 보세요'

  return (
    <div className="fill">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 4, 8], fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {visited && (
        <>
          <HUD />
          <BuildBar />
          <Joystick />
          <div className="hint-strip">{hint}</div>

          {panel === 'place' && <PlacePanel onToast={showToast} />}
          {panel === 'build' && <BuildPanel onToast={showToast} />}
          {panel === 'shop' && <Shop onToast={showToast} />}
          {panel === 'art' && <ArtStudio onToast={showToast} />}
          {panel === 'music' && <MusicStudio onToast={showToast} />}
          {panel === 'inner' && <InnerVoice />}
          {panel === 'gallery' && <Gallery />}
          {panel === 'journal' && <Journal />}
          {panel === 'menu' && <Menu onToast={showToast} />}
          {panel === 'starmap' && <StarMap onToast={showToast} />}

          <WarpOverlay />
          <AdOverlay onToast={showToast} />
          {toast && <div className="toast" key={toast}>{toast}</div>}
        </>
      )}

      {!visited && <Intro />}
    </div>
  )
}
