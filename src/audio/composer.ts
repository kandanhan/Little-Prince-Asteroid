// 생성형 앰비언트 작곡 엔진 (Web Audio API, 외부 의존성 0).
// 시드(seed)로부터 결정론적으로 화음 진행 + 느린 멜로디 + 패드 + 종소리를 생성한다.
// 같은 시드 = 같은 곡. 행성의 BGM으로 재생된다.

export interface Mood {
  key: string
  name: string
  scale: number[]   // 반음 간격
  root: number      // MIDI
  tempo: number     // 한 스텝(8분음표) 밀리초
  reverb: number
}

export const MOODS: Mood[] = [
  { key: 'dawn',   name: '새벽의 평온', scale: [0, 2, 4, 7, 9],     root: 60, tempo: 620, reverb: 0.35 },
  { key: 'sunset', name: '노을의 따뜻함', scale: [0, 3, 5, 7, 10],    root: 57, tempo: 700, reverb: 0.4 },
  { key: 'night',  name: '별밤의 고요', scale: [0, 2, 3, 7, 8],     root: 55, tempo: 820, reverb: 0.5 },
  { key: 'dream',  name: '꿈의 부유',   scale: [0, 2, 4, 6, 9, 11], root: 62, tempo: 560, reverb: 0.45 },
]

export function moodForSeed(seed: number): Mood {
  return MOODS[Math.abs(Math.floor(seed)) % MOODS.length]
}

// 시드 기반 의사난수 (mulberry32)
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

export class Composer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer: number | null = null
  private step = 0
  private seed = 1
  private mood: Mood = MOODS[0]
  private rand: () => number = rng(1)
  private chordIdx = 0
  private _playing = false

  get playing() { return this._playing }
  get currentSeed() { return this.seed }

  private ensureCtx() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.0
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setVolume(v: number) {
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.6)
    }
  }

  play(seed: number) {
    this.ensureCtx()
    if (!this.ctx || !this.master) return
    this.seed = seed
    this.mood = moodForSeed(seed)
    this.rand = rng(seed)
    this.step = 0
    this.chordIdx = 0
    this._playing = true
    this.master.gain.cancelScheduledValues(this.ctx.currentTime)
    this.master.gain.setValueAtTime(this.master.gain.value, this.ctx.currentTime)
    this.master.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 1.5)
    if (this.timer) clearInterval(this.timer)
    this.timer = window.setInterval(() => this.tick(), this.mood.tempo)
    this.tick()
  }

  stop() {
    this._playing = false
    if (this.timer) { clearInterval(this.timer); this.timer = null }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime)
      this.master.gain.setValueAtTime(this.master.gain.value, this.ctx.currentTime)
      this.master.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.2)
    }
  }

  // I–vi–IV–V 류의 부드러운 진행 (스케일 도수 기준)
  private chordRoots = [0, 5, 3, 4]

  private tick() {
    if (!this.ctx || !this.master || !this._playing) return
    const t = this.ctx.currentTime
    const { scale, root } = this.mood

    // 8스텝마다 코드 전환 + 패드
    if (this.step % 8 === 0) {
      this.chordIdx = (this.chordIdx + 1) % this.chordRoots.length
      const deg = this.chordRoots[this.chordIdx]
      const chordNotes = [0, 2, 4].map((i) => root - 12 + scale[(deg + i) % scale.length] + 12 * Math.floor((deg + i) / scale.length))
      chordNotes.forEach((n, i) => this.pad(midiToFreq(n), t, 8 * this.mood.tempo / 1000, 0.06 - i * 0.01))
    }

    // 멜로디: 확률적으로 음 트리거
    if (this.rand() < 0.72) {
      const deg = this.chordRoots[this.chordIdx]
      const oct = this.rand() < 0.3 ? 12 : 0
      const note = root + 12 + scale[(deg + Math.floor(this.rand() * scale.length)) % scale.length] + oct
      this.pluck(midiToFreq(note), t, 0.08 + this.rand() * 0.06)
    }

    // 가끔 종소리 (반짝임)
    if (this.rand() < 0.12) {
      const note = root + 24 + scale[Math.floor(this.rand() * scale.length)]
      this.bell(midiToFreq(note), t)
    }

    this.step++
  }

  private pluck(freq: number, t: number, vel: number) {
    if (!this.ctx || !this.master) return
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = 'triangle'
    o.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vel, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
    o.connect(g); g.connect(this.master)
    o.start(t); o.stop(t + 1.7)
  }

  private pad(freq: number, t: number, dur: number, vel: number) {
    if (!this.ctx || !this.master) return
    const o = this.ctx.createOscillator()
    const o2 = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    const f = this.ctx.createBiquadFilter()
    f.type = 'lowpass'; f.frequency.value = 900
    o.type = 'sine'; o.frequency.value = freq
    o2.type = 'sine'; o2.frequency.value = freq * 1.005 // 살짝 디튠 → 따뜻함
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vel, t + 1.2)
    g.gain.linearRampToValueAtTime(0.0001, t + dur)
    o.connect(f); o2.connect(f); f.connect(g); g.connect(this.master)
    o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1)
  }

  private bell(freq: number, t: number) {
    if (!this.ctx || !this.master) return
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = 'sine'; o.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.07, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4)
    o.connect(g); g.connect(this.master)
    o.start(t); o.stop(t + 2.5)
  }
}

// 앱 전역 단일 인스턴스
export const composer = new Composer()

export function randomSongTitle(seed: number): string {
  const a = ['고요한', '반짝이는', '따뜻한', '작은', '느린', '푸른', '먼', '포근한']
  const b = ['오후', '별', '바람', '노을', '꿈', '강', '정원', '약속']
  const r = rng(seed)
  return `${a[Math.floor(r() * a.length)]} ${b[Math.floor(r() * b.length)]}`
}
