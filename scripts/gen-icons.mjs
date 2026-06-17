// 의존성 없이 PWA 아이콘(PNG)을 생성한다. zlib(내장)만 사용.
// 어두운 밤하늘 + 초록 행성 + 금빛 별 디자인.
import zlib from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

function draw(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4)
  const cx = size / 2, cy = size / 2
  const set = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (y * size + x) * 4
    const ia = a / 255
    rgba[i] = rgba[i] * (1 - ia) + r * ia
    rgba[i + 1] = rgba[i + 1] * (1 - ia) + g * ia
    rgba[i + 2] = rgba[i + 2] * (1 - ia) + b * ia
    rgba[i + 3] = Math.max(rgba[i + 3], a)
  }
  const radius = maskable ? size * 0.5 : size * 0.22 // 모서리 둥글기 (maskable은 꽉 채움)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // 라운드 사각 마스크
      if (!maskable) {
        const rx = Math.min(x, size - 1 - x), ry = Math.min(y, size - 1 - y)
        if (rx < radius && ry < radius) {
          const dx = radius - rx, dy = radius - ry
          if (dx * dx + dy * dy > radius * radius) continue
        }
      }
      // 밤하늘 그라데이션 (중앙 밝음)
      const d = Math.hypot(x - cx, y - cy) / (size * 0.7)
      const r = 13 + (42 - 13) * (1 - d)
      const g = 12 + (38 - 12) * (1 - d)
      const b = 36 + (88 - 36) * (1 - d)
      set(x, y, r, g, b, 255)
    }
  }
  // 별 점들
  const stars = [[0.2, 0.22], [0.8, 0.18], [0.75, 0.78], [0.18, 0.72], [0.5, 0.12], [0.88, 0.5]]
  for (const [sx, sy] of stars) {
    const px = Math.round(sx * size), py = Math.round(sy * size)
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) set(px + dx, py + dy, 255, 255, 255, 200)
  }
  // 초록 행성
  const pr = size * 0.27
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dd = Math.hypot(x - cx, y - cy + size * 0.02)
      if (dd <= pr) {
        const sh = 1 - (Math.hypot(x - (cx - pr * 0.3), y - (cy - pr * 0.3))) / (pr * 2)
        const t = Math.max(0, Math.min(1, sh))
        set(x, y, 58 + 70 * t, 125 + 80 * t, 68 + 50 * t, 255)
      }
    }
  }
  // 금빛 별 (5각)
  const starR = size * 0.1, starCx = cx, starCy = cy - size * 0.02
  const pts = []
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? starR : starR * 0.42
    pts.push([starCx + Math.cos(ang) * rr, starCy + Math.sin(ang) * rr])
  }
  const inStar = (x, y) => {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j]
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }
  for (let y = Math.floor(starCy - starR); y <= starCy + starR; y++)
    for (let x = Math.floor(starCx - starR); x <= starCx + starR; x++)
      if (inStar(x, y)) set(x, y, 255, 207, 86, 255)

  return encodePNG(size, size, rgba)
}

writeFileSync(join(OUT, 'icon-192.png'), draw(192, false))
writeFileSync(join(OUT, 'icon-512.png'), draw(512, false))
writeFileSync(join(OUT, 'icon-512-maskable.png'), draw(512, true))
console.log('icons written to', OUT)
