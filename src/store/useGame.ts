import { create } from 'zustand'
import type { ItemKind } from '../game/items'
import type { Personality } from '../dialogue/innerVoice'
import { NEW_PLANET_COST, type PlanetTheme } from '../game/planets'

export interface PlanetData {
  id: string
  name: string
  theme: PlanetTheme
  items: PlacedItem[]
  blocks: BuildBlock[]
}

export interface DialogueLine {
  id: string
  role: 'prince' | 'me'
  text: string
  at: number
}

export interface PlacedItem {
  id: string
  kind: ItemKind
  lat: number
  lon: number
  scale: number
  hue: number      // 색조 변화 (0..1)
  bornAt: number   // 심은 시각 (성장 애니메이션용)
}

export interface Painting {
  id: string
  dataUrl: string  // 생성된 그림 (PNG data URL)
  title: string
  createdAt: number
}

export interface Song {
  id: string
  seed: number
  title: string
  mood: string
  createdAt: number
}

export interface JournalEntry {
  id: string
  text: string
  createdAt: number
}

export interface PendingDelivery {
  id: string
  kind: ItemKind
  lat: number
  lon: number
  scale: number
  hue: number
}

export type BuildShape = 'cube' | 'slab' | 'pillar' | 'roof' | 'fence' | 'window'

export interface BuildBlock {
  id: string
  shape: BuildShape
  lat: number
  lon: number
  height: number   // 표면에서 몇 칸 위인지 (0부터 쌓임)
  color: string
  rot: number      // 0..3 (90° 단위 yaw)
}

export type ToolMode = 'walk' | 'place' | 'remove' | 'build'
export type Panel = null | 'place' | 'art' | 'music' | 'journal' | 'gallery' | 'menu' | 'shop' | 'inner' | 'build' | 'starmap'

interface GameState {
  // 진행/감성 수치
  princeName: string
  happiness: number          // 0..100 — 행성을 가꿀수록 상승
  visited: boolean

  // 경제
  coins: number
  lastDailyGift: string      // 'YYYY-MM-DD' — 하루 한 번 별빛 선물
  deliveries: PendingDelivery[]

  // 내면 대화
  personality: Personality
  personalitySet: boolean
  dialogue: DialogueLine[]

  // 조형/빌드
  blocks: BuildBlock[]
  buildShape: BuildShape
  buildColor: string
  buildRot: number

  // 여러 행성 (items/blocks 는 현재 행성의 라이브 데이터)
  planets: PlanetData[]
  currentPlanetId: string
  traveling: boolean

  // 수익화(광고/IAP) — 현재는 시뮬레이션, 실제 SDK 연결용 토대
  adPlaying: boolean
  removeAds: boolean

  // 시간
  dayPhase: number           // 0..1 (0=자정, 0.5=정오)
  autoTime: boolean

  // 그래픽 스타일 (0=만화 · 1=사실)
  styleLevel: number         // 0..1 — 머티리얼/조명/후처리 연속 보간
  lowSpec: boolean           // 저사양폰용 품질 토글 (후처리 끔)

  // 배치
  items: PlacedItem[]
  selectedKind: ItemKind
  tool: ToolMode

  // 콘텐츠
  paintings: Painting[]
  songs: Song[]
  activeSongSeed: number | null
  journal: JournalEntry[]

  // UI
  panel: Panel

  // actions
  setName: (n: string) => void
  setVisited: (v: boolean) => void
  setPanel: (p: Panel) => void
  setTool: (t: ToolMode) => void
  setSelectedKind: (k: ItemKind) => void
  setDayPhase: (p: number) => void
  setAutoTime: (v: boolean) => void
  setStyleLevel: (v: number) => void
  setLowSpec: (v: boolean) => void
  addItem: (it: Omit<PlacedItem, 'id' | 'bornAt'>) => void
  removeItem: (id: string) => void
  // 경제 액션
  claimDailyGift: () => number       // 받은 코인 수 (0이면 이미 받음)
  buy: (kind: ItemKind, price: number) => boolean   // 구매 → 배달 큐에 등록
  completeDelivery: (deliveryId: string) => void
  // 내면 대화 액션
  setPersonality: (p: Personality) => void
  pushDialogue: (role: 'prince' | 'me', text: string) => void
  clearDialogue: () => void
  // 조형 액션
  setBuildShape: (s: BuildShape) => void
  setBuildColor: (c: string) => void
  rotateBuild: () => void
  addBlock: (b: Omit<BuildBlock, 'id'>) => void
  removeBlock: (id: string) => void
  // 행성 여행
  travelTo: (planetId: string) => void
  createPlanet: (theme: PlanetTheme, name: string) => string | null  // 실패(코인부족) 시 null
  renameCurrentPlanet: (name: string) => void
  // 수익화 액션
  addCoins: (n: number) => void
  requestRewardedAd: () => void
  finishRewardedAd: (rewarded: boolean) => number   // 지급된 코인
  setRemoveAds: (v: boolean) => void
  addPainting: (p: Omit<Painting, 'id' | 'createdAt'>) => void
  removePainting: (id: string) => void
  addSong: (s: Omit<Song, 'id' | 'createdAt'>) => void
  setActiveSong: (seed: number | null) => void
  addJournal: (text: string) => void
  removeJournal: (id: string) => void
  reset: () => void
}

const STORAGE_KEY = 'b612.save.v1'

interface Persisted {
  princeName: string
  visited: boolean
  paintings: Painting[]
  songs: Song[]
  journal: JournalEntry[]
  happiness: number
  coins: number
  lastDailyGift: string
  personality: Personality
  personalitySet: boolean
  removeAds: boolean
  styleLevel: number
  lowSpec: boolean
  // 다중 행성
  planets: PlanetData[]
  currentPlanetId: string
  // 레거시(단일 행성) — 마이그레이션용
  items?: PlacedItem[]
  blocks?: BuildBlock[]
}

const todayKey = () => new Date().toISOString().slice(0, 10)
const DEFAULT_PERSONALITY: Personality = { ei: 0.5, sn: 0.5, tf: 0.5, jp: 0.5 }
const REWARD_COINS = 15

// 현재 행성의 라이브 items/blocks 를 planets 레지스트리에 반영
function syncPlanets(s: GameState): PlanetData[] {
  return s.planets.map((p) =>
    p.id === s.currentPlanetId ? { ...p, items: s.items, blocks: s.blocks } : p,
  )
}

function load(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function persist(s: GameState) {
  const data: Persisted = {
    princeName: s.princeName,
    visited: s.visited,
    paintings: s.paintings,
    songs: s.songs,
    journal: s.journal,
    happiness: s.happiness,
    coins: s.coins,
    lastDailyGift: s.lastDailyGift,
    personality: s.personality,
    personalitySet: s.personalitySet,
    removeAds: s.removeAds,
    styleLevel: s.styleLevel,
    lowSpec: s.lowSpec,
    planets: syncPlanets(s),
    currentPlanetId: s.currentPlanetId,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* 저장 실패는 조용히 무시 (용량 초과 등) */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10)

// 행복도: 장식 다양성 + 개수 + 콘텐츠로 산출
function computeHappiness(items: PlacedItem[], paintings: number, songs: number): number {
  const kinds = new Set(items.map((i) => i.kind)).size
  const base = Math.min(items.length * 3, 45) + kinds * 3 + paintings * 4 + songs * 4
  return Math.max(0, Math.min(100, Math.round(base)))
}

const saved = load()

// --- 행성 초기화 (레거시 단일 행성 마이그레이션 포함) ---
function initPlanets(s: Partial<Persisted>): { planets: PlanetData[]; currentPlanetId: string } {
  if (s.planets && s.planets.length) {
    const cur = s.planets.find((p) => p.id === s.currentPlanetId) ?? s.planets[0]
    return { planets: s.planets, currentPlanetId: cur.id }
  }
  // 구버전: 단일 행성으로 모은다
  const home: PlanetData = {
    id: 'home',
    name: s.princeName ? `${s.princeName}의 별` : 'B-612',
    theme: 'meadow',
    items: s.items ?? [],
    blocks: s.blocks ?? [],
  }
  return { planets: [home], currentPlanetId: 'home' }
}

const initial = initPlanets(saved)
const initialPlanet = initial.planets.find((p) => p.id === initial.currentPlanetId)!

export const useGame = create<GameState>((set, get) => ({
  princeName: saved.princeName ?? '',
  happiness: saved.happiness ?? computeHappiness(initialPlanet.items, saved.paintings?.length ?? 0, saved.songs?.length ?? 0),
  visited: saved.visited ?? false,

  coins: saved.coins ?? 60,
  lastDailyGift: saved.lastDailyGift ?? '',
  deliveries: [],

  personality: saved.personality ?? DEFAULT_PERSONALITY,
  personalitySet: saved.personalitySet ?? false,
  dialogue: [],

  blocks: initialPlanet.blocks,
  buildShape: 'cube',
  buildColor: '#e9c46a',
  buildRot: 0,

  planets: initial.planets,
  currentPlanetId: initial.currentPlanetId,
  traveling: false,

  adPlaying: false,
  removeAds: saved.removeAds ?? false,

  dayPhase: 0.32,
  autoTime: true,

  styleLevel: saved.styleLevel ?? 0.35,
  lowSpec: saved.lowSpec ?? false,

  items: initialPlanet.items,
  selectedKind: 'rose',
  tool: 'walk',

  paintings: saved.paintings ?? [],
  songs: saved.songs ?? [],
  activeSongSeed: null,
  journal: saved.journal ?? [],

  panel: null,

  setName: (n) => { set({ princeName: n }); persist(get()) },
  setVisited: (v) => { set({ visited: v }); persist(get()) },
  setPanel: (p) => set({ panel: p }),
  setTool: (t) => set({ tool: t }),
  setSelectedKind: (k) => set({ selectedKind: k, tool: 'place' }),
  setDayPhase: (p) => set({ dayPhase: ((p % 1) + 1) % 1 }),
  setAutoTime: (v) => set({ autoTime: v }),
  setStyleLevel: (v) => { set({ styleLevel: Math.max(0, Math.min(1, v)) }); persist(get()) },
  setLowSpec: (v) => { set({ lowSpec: v }); persist(get()) },

  addItem: (it) => {
    const items = [...get().items, { ...it, id: uid(), bornAt: Date.now() }]
    set({ items, happiness: computeHappiness(items, get().paintings.length, get().songs.length) })
    persist(get())
  },
  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id)
    set({ items, happiness: computeHappiness(items, get().paintings.length, get().songs.length) })
    persist(get())
  },

  claimDailyGift: () => {
    const today = todayKey()
    if (get().lastDailyGift === today) return 0
    // 행복도가 높을수록 선물도 풍성하게
    const gift = 20 + Math.round(get().happiness / 5)
    set({ coins: get().coins + gift, lastDailyGift: today })
    persist(get())
    return gift
  },

  buy: (kind, price) => {
    if (get().coins < price) return false
    // 배달 도착 지점: 현재 별 표면 임의 위치 (배달부가 떨어뜨림)
    const lat = (Math.random() - 0.5) * Math.PI * 0.9
    const lon = (Math.random() - 0.5) * Math.PI * 2
    const delivery: PendingDelivery = {
      id: uid(), kind, lat, lon,
      scale: 0.85 + Math.random() * 0.3,
      hue: Math.random(),
    }
    set({ coins: get().coins - price, deliveries: [...get().deliveries, delivery] })
    persist(get())
    return true
  },

  setPersonality: (p) => { set({ personality: p, personalitySet: true }); persist(get()) },
  pushDialogue: (role, text) => {
    set({ dialogue: [...get().dialogue, { id: uid(), role, text, at: Date.now() }].slice(-60) })
  },
  clearDialogue: () => set({ dialogue: [] }),

  setBuildShape: (sh) => set({ buildShape: sh, tool: 'build' }),
  setBuildColor: (c) => set({ buildColor: c }),
  rotateBuild: () => set({ buildRot: (get().buildRot + 1) % 4 }),
  addBlock: (b) => { set({ blocks: [...get().blocks, { ...b, id: uid() }] }); persist(get()) },
  removeBlock: (id) => { set({ blocks: get().blocks.filter((x) => x.id !== id) }); persist(get()) },

  travelTo: (planetId) => {
    const s = get()
    if (planetId === s.currentPlanetId) { set({ panel: null }); return }
    const planets = syncPlanets(s)              // 현재 행성 저장
    const target = planets.find((p) => p.id === planetId)
    if (!target) return
    set({ traveling: true, panel: null })
    // 워프 연출 중간에 데이터 교체
    setTimeout(() => {
      set({
        planets,
        currentPlanetId: planetId,
        items: target.items,
        blocks: target.blocks,
        tool: 'walk',
        happiness: computeHappiness(target.items, get().paintings.length, get().songs.length),
      })
      persist(get())
    }, 650)
    setTimeout(() => set({ traveling: false }), 1300)
  },

  createPlanet: (theme, name) => {
    const s = get()
    if (s.coins < NEW_PLANET_COST) return null
    const planets = syncPlanets(s)
    const np: PlanetData = { id: uid(), name: name.trim() || '이름 없는 별', theme, items: [], blocks: [] }
    set({ coins: s.coins - NEW_PLANET_COST, planets: [...planets, np] })
    persist(get())
    return np.id
  },

  renameCurrentPlanet: (name) => {
    const planets = get().planets.map((p) =>
      p.id === get().currentPlanetId ? { ...p, name: name.trim() || p.name } : p,
    )
    set({ planets })
    persist(get())
  },

  addCoins: (n) => { set({ coins: get().coins + n }); persist(get()) },
  requestRewardedAd: () => { if (!get().adPlaying) set({ adPlaying: true, panel: null }) },
  finishRewardedAd: (rewarded) => {
    const gain = rewarded ? REWARD_COINS : 0
    set({ adPlaying: false, coins: get().coins + gain })
    if (gain) persist(get())
    return gain
  },
  setRemoveAds: (v) => { set({ removeAds: v }); persist(get()) },

  completeDelivery: (deliveryId) => {
    const d = get().deliveries.find((x) => x.id === deliveryId)
    if (!d) return
    const items = [...get().items, {
      id: uid(), kind: d.kind, lat: d.lat, lon: d.lon,
      scale: d.scale, hue: d.hue, bornAt: Date.now(),
    }]
    set({
      items,
      deliveries: get().deliveries.filter((x) => x.id !== deliveryId),
      happiness: computeHappiness(items, get().paintings.length, get().songs.length),
    })
    persist(get())
  },

  addPainting: (p) => {
    const paintings = [{ ...p, id: uid(), createdAt: Date.now() }, ...get().paintings].slice(0, 30)
    set({ paintings, happiness: computeHappiness(get().items, paintings.length, get().songs.length) })
    persist(get())
  },
  removePainting: (id) => {
    const paintings = get().paintings.filter((p) => p.id !== id)
    set({ paintings })
    persist(get())
  },

  addSong: (s) => {
    const songs = [{ ...s, id: uid(), createdAt: Date.now() }, ...get().songs].slice(0, 30)
    set({ songs, happiness: computeHappiness(get().items, get().paintings.length, songs.length) })
    persist(get())
  },
  setActiveSong: (seed) => set({ activeSongSeed: seed }),

  addJournal: (text) => {
    const journal = [{ id: uid(), text, createdAt: Date.now() }, ...get().journal].slice(0, 100)
    set({ journal })
    persist(get())
  },
  removeJournal: (id) => {
    const journal = get().journal.filter((j) => j.id !== id)
    set({ journal })
    persist(get())
  },

  reset: () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    set({
      princeName: '', visited: false, items: [], paintings: [], songs: [],
      journal: [], happiness: 0, panel: null, tool: 'walk', activeSongSeed: null,
      coins: 60, lastDailyGift: '', deliveries: [],
      personality: DEFAULT_PERSONALITY, personalitySet: false, dialogue: [],
      blocks: [], buildShape: 'cube', buildColor: '#e9c46a', buildRot: 0,
      planets: [{ id: 'home', name: 'B-612', theme: 'meadow', items: [], blocks: [] }],
      currentPlanetId: 'home', traveling: false,
      adPlaying: false, removeAds: false,
      styleLevel: 0.35, lowSpec: false,
    })
  },
}))
