// 생성형 그림 엔진 (Canvas 2D, 외부 의존성 0).
// 프롬프트 텍스트 + 시드 → 결정론적 추상화. 같은 입력 = 같은 그림.
// 추후 실제 이미지 생성 API로 교체할 수 있도록 generate() 시그니처를 유지한다.

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type ArtStyle = 'watercolor' | 'starfield' | 'flowfield' | 'rosegarden'

export const ART_STYLES: { key: ArtStyle; name: string; emoji: string }[] = [
  { key: 'watercolor', name: '수채화', emoji: '🎨' },
  { key: 'starfield', name: '별의 바다', emoji: '✨' },
  { key: 'flowfield', name: '바람의 결', emoji: '🌬️' },
  { key: 'rosegarden', name: '장미 정원', emoji: '🌹' },
]

// 프롬프트 단어로 색 팔레트를 살짝 편향
function paletteFor(prompt: string, r: () => number): string[] {
  const p = prompt.toLowerCase()
  const warm = ['#ffb3a7', '#ff8c69', '#ffd6a5', '#f9c74f', '#e76f51']
  const cool = ['#a0c4ff', '#bdb2ff', '#9bf6ff', '#caffbf', '#a3a5ff']
  const night = ['#3a0ca3', '#4361ee', '#7209b7', '#560bad', '#b5179e']
  const rose = ['#ff5d8f', '#ff8fab', '#ffb3c6', '#c9184a', '#ff4d6d']
  let base = r() < 0.5 ? warm : cool
  if (/(밤|별|night|star|꿈|dream)/.test(p)) base = night
  if (/(장미|꽃|rose|flower|사랑|love)/.test(p)) base = rose
  if (/(노을|sunset|따뜻|가을)/.test(p)) base = warm
  if (/(바다|하늘|물|sky|sea|blue|푸른)/.test(p)) base = cool
  return base
}

function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

export interface GenerateOptions {
  prompt: string
  style: ArtStyle
  seed?: number
  size?: number
}

/** 그림을 생성하고 PNG data URL을 반환 */
export async function generate(opts: GenerateOptions): Promise<string> {
  const size = opts.size ?? 768
  const seed = (opts.seed ?? hashString(opts.prompt + '|' + opts.style)) >>> 0
  const r = rng(seed)
  const palette = paletteFor(opts.prompt, r)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 배경 그라데이션
  const g = ctx.createLinearGradient(0, 0, size * r(), size)
  g.addColorStop(0, withAlpha(palette[0], 0.9))
  g.addColorStop(1, withAlpha(palette[palette.length - 1], 0.9))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  switch (opts.style) {
    case 'watercolor': drawWatercolor(ctx, size, r, palette); break
    case 'starfield': drawStarfield(ctx, size, r, palette); break
    case 'flowfield': drawFlowfield(ctx, size, r, palette); break
    case 'rosegarden': drawRoseGarden(ctx, size, r, palette); break
  }

  // 부드러운 비네팅
  const v = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.72)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, size, size)

  return canvas.toDataURL('image/png')
}

function drawWatercolor(ctx: CanvasRenderingContext2D, size: number, r: () => number, pal: string[]) {
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 26; i++) {
    const x = r() * size, y = r() * size
    const rad = size * (0.08 + r() * 0.22)
    const col = pal[Math.floor(r() * pal.length)]
    for (let blob = 0; blob < 5; blob++) {
      ctx.beginPath()
      const pts = 14
      for (let p = 0; p <= pts; p++) {
        const ang = (p / pts) * Math.PI * 2
        const rr = rad * (0.7 + r() * 0.5)
        const px = x + Math.cos(ang) * rr
        const py = y + Math.sin(ang) * rr
        if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = withAlpha(col, 0.05)
      ctx.fill()
    }
  }
  ctx.globalCompositeOperation = 'source-over'
}

function drawStarfield(ctx: CanvasRenderingContext2D, size: number, r: () => number, pal: string[]) {
  // 성운
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 8; i++) {
    const x = r() * size, y = r() * size
    const rad = size * (0.2 + r() * 0.3)
    const grd = ctx.createRadialGradient(x, y, 0, x, y, rad)
    grd.addColorStop(0, withAlpha(pal[Math.floor(r() * pal.length)], 0.4))
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, size, size)
  }
  // 별
  for (let i = 0; i < 420; i++) {
    const x = r() * size, y = r() * size
    const s = r() * 2.2 + 0.3
    ctx.fillStyle = withAlpha('#ffffff', 0.4 + r() * 0.6)
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill()
    if (r() < 0.04) { // 반짝이는 큰 별
      ctx.strokeStyle = withAlpha('#fff7d6', 0.7)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x - s * 4, y); ctx.lineTo(x + s * 4, y)
      ctx.moveTo(x, y - s * 4); ctx.lineTo(x, y + s * 4)
      ctx.stroke()
    }
  }
  ctx.globalCompositeOperation = 'source-over'
}

function drawFlowfield(ctx: CanvasRenderingContext2D, size: number, r: () => number, pal: string[]) {
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineWidth = 1.1
  const off = r() * 1000
  const noise = (x: number, y: number) =>
    Math.sin(x * 0.012 + off) + Math.cos(y * 0.012 - off) + Math.sin((x + y) * 0.008)
  for (let i = 0; i < 900; i++) {
    let x = r() * size, y = r() * size
    const col = pal[Math.floor(r() * pal.length)]
    ctx.strokeStyle = withAlpha(col, 0.16)
    ctx.beginPath(); ctx.moveTo(x, y)
    for (let step = 0; step < 40; step++) {
      const ang = noise(x, y) * Math.PI
      x += Math.cos(ang) * 6
      y += Math.sin(ang) * 6
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalCompositeOperation = 'source-over'
}

function drawRoseGarden(ctx: CanvasRenderingContext2D, size: number, r: () => number, pal: string[]) {
  for (let i = 0; i < 40; i++) {
    const x = r() * size, y = r() * size * 0.9 + size * 0.05
    const rad = size * (0.02 + r() * 0.06)
    const col = pal[Math.floor(r() * pal.length)]
    // 줄기
    ctx.strokeStyle = withAlpha('#2d6a4f', 0.5)
    ctx.lineWidth = rad * 0.25
    ctx.beginPath(); ctx.moveTo(x, y + rad); ctx.lineTo(x, Math.min(size, y + rad * 4)); ctx.stroke()
    // 소용돌이 꽃잎
    for (let p = 0; p < 60; p++) {
      const ang = p * 0.5
      const rr = rad * (p / 60)
      const px = x + Math.cos(ang) * rr
      const py = y + Math.sin(ang) * rr
      ctx.fillStyle = withAlpha(col, 0.5)
      ctx.beginPath(); ctx.arc(px, py, rad * 0.18, 0, Math.PI * 2); ctx.fill()
    }
  }
}
