import { useGame } from '../store/useGame'
import { BUILD_PALETTE } from '../game/build'

// 조형 모드일 때만 보이는 상단 컨트롤 바.
export function BuildBar() {
  const tool = useGame((s) => s.tool)
  const buildShape = useGame((s) => s.buildShape)
  const buildColor = useGame((s) => s.buildColor)
  const buildRot = useGame((s) => s.buildRot)
  const rotateBuild = useGame((s) => s.rotateBuild)
  const setTool = useGame((s) => s.setTool)
  const setPanel = useGame((s) => s.setPanel)

  if (tool !== 'build') return null
  const def = BUILD_PALETTE.find((b) => b.shape === buildShape)

  return (
    <div className="build-bar">
      <button className="bb" onClick={() => setPanel('build')}>{def?.emoji} {def?.name}</button>
      <span className="bb swatch-mini" style={{ background: buildColor }} />
      <button className="bb" onClick={rotateBuild}>↻ {buildRot * 90}°</button>
      <button className="bb exit" onClick={() => setTool('walk')}>그만</button>
    </div>
  )
}
