// 구글 플레이 스토어용 마케팅 그래픽(SVG) 자동 생성.
// SVG라 시스템 한글 폰트로 렌더되고, 브라우저/디자인툴에서 PNG로 내보낼 수 있음.
// 사용: node scripts/gen-marketing.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'marketing')
mkdirSync(OUT, { recursive: true })

// 시드 난수로 별 흩뿌리기
function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
function stars(w, h, n, seed) {
  const r = rng(seed)
  let s = ''
  for (let i = 0; i < n; i++) {
    const x = (r() * w).toFixed(1), y = (r() * h).toFixed(1)
    const rad = (r() * 1.6 + 0.3).toFixed(2), o = (0.3 + r() * 0.7).toFixed(2)
    s += `<circle cx="${x}" cy="${y}" r="${rad}" fill="#fff" opacity="${o}"/>`
  }
  return s
}

const defs = `
  <defs>
    <radialGradient id="sky" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#2c2866"/>
      <stop offset="55%" stop-color="#181538"/>
      <stop offset="100%" stop-color="#0b0a1e"/>
    </radialGradient>
    <radialGradient id="planet" cx="38%" cy="32%" r="80%">
      <stop offset="0%" stop-color="#8fe39a"/>
      <stop offset="60%" stop-color="#52b06a"/>
      <stop offset="100%" stop-color="#2f7d49"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffcf56" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ffcf56" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="title" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff7e0"/>
      <stop offset="100%" stop-color="#ffcf56"/>
    </linearGradient>
  </defs>`

// 마스코트(별솜이)가 앉은 작은 별 일러스트 (cx,cy,r)
function planet(cx, cy, r) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r * 1.7}" fill="url(#glow)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#planet)"/>
    <ellipse cx="${cx - r * 0.35}" cy="${cy - r * 0.3}" rx="${r * 0.3}" ry="${r * 0.18}" fill="#a7ecb0" opacity="0.5"/>
    <!-- 장미 -->
    <g transform="translate(${cx - r * 0.5},${cy - r * 0.92})">
      <rect x="-2" y="0" width="4" height="${r * 0.4}" fill="#2d6a4f"/>
      <circle cx="0" cy="-2" r="${r * 0.14}" fill="#ff4d6d"/>
    </g>
    <!-- 가로등 -->
    <g transform="translate(${cx + r * 0.55},${cy - r * 0.85})">
      <rect x="-1.5" y="0" width="3" height="${r * 0.5}" fill="#3d3d52"/>
      <circle cx="0" cy="-2" r="${r * 0.1}" fill="#ffd60a"/>
    </g>
    <!-- 별솜이(Som) -->
    <g transform="translate(${cx},${cy - r - 2})">
      <circle cx="${-r * 0.12}" cy="${-6 - r * 0.3}" r="${r * 0.07}" fill="#FBF6EC"/>
      <circle cx="${r * 0.12}" cy="${-6 - r * 0.3}" r="${r * 0.07}" fill="#FBF6EC"/>
      <ellipse cx="0" cy="${-6 - r * 0.12}" rx="${r * 0.2}" ry="${r * 0.17}" fill="#FBF6EC" stroke="#EADFCB" stroke-width="1.5"/>
      <circle cx="${-r * 0.07}" cy="${-6 - r * 0.13}" r="${r * 0.022}" fill="#4A4660"/>
      <circle cx="${r * 0.07}" cy="${-6 - r * 0.13}" r="${r * 0.022}" fill="#4A4660"/>
      <path d="M ${r * 0.16} ${-6 - r * 0.18} l ${r * 0.05} ${-r * 0.05} l ${r * 0.05} ${r * 0.05} l ${-r * 0.05} ${r * 0.05} z" fill="#FFD66B"/>
    </g>`
}

// 1) 피처 그래픽 1024 x 500
const feature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  ${defs}
  <rect width="1024" height="500" fill="url(#sky)"/>
  ${stars(1024, 500, 120, 7)}
  ${planet(760, 270, 150)}
  <text x="70" y="190" font-family="'Baloo 2','Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="80" font-weight="800" fill="url(#title)">Orblet</text>
  <text x="72" y="262" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="50" font-weight="800" fill="url(#title)">별마실</text>
  <text x="72" y="318" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="26" fill="#cfc9ec">거닐고 · 꾸미고 · 그리고 · 작곡하는 힐링 게임</text>
  <text x="72" y="372" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="20" fill="#ffcf56">✦ 광고 없음 · 오프라인 · 작지만 완벽한 행복</text>
</svg>`

// 2) 소셜/프로모 1200 x 630
const promo = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  ${defs}
  <rect width="1200" height="630" fill="url(#sky)"/>
  ${stars(1200, 630, 160, 21)}
  ${planet(600, 400, 175)}
  <text x="600" y="150" text-anchor="middle" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="64" font-weight="800" fill="url(#title)">나만의 작은 별, Orblet</text>
  <text x="600" y="200" text-anchor="middle" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="26" fill="#cfc9ec">별에서 별로 마실 다니며 천천히 쉬어가요</text>
</svg>`

// 3) 폰 스토어 스크린샷 목업 1080 x 1920 (실기기 스크린샷 보완용 프레임)
const screenshot = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  ${defs}
  <rect width="1080" height="1920" fill="url(#sky)"/>
  ${stars(1080, 1920, 200, 42)}
  ${planet(540, 1050, 360)}
  <text x="540" y="240" text-anchor="middle" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="76" font-weight="800" fill="url(#title)">꽃을 심고</text>
  <text x="540" y="340" text-anchor="middle" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="76" font-weight="800" fill="url(#title)">별을 가꿔요</text>
  <rect x="120" y="1560" width="840" height="150" rx="40" fill="#fdf6ec" opacity="0.95"/>
  <text x="540" y="1655" text-anchor="middle" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="42" font-weight="700" fill="#2b2b40">AI로 그림 그리고 · 음악도 짓는 힐링 게임</text>
</svg>`

writeFileSync(join(OUT, 'feature-graphic-1024x500.svg'), feature)
writeFileSync(join(OUT, 'promo-1200x630.svg'), promo)
writeFileSync(join(OUT, 'screenshot-mockup-1080x1920.svg'), screenshot)
console.log('marketing assets written to', OUT)
