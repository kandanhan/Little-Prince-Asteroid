// "내 안의 어린왕자"와의 셀프 리플렉션 대화 엔진.
// 100% 오프라인 규칙기반. 성격(MBTI 유사 4축)에 따라 질문과 말투가 달라진다.
// 추후 실제 AI로 교체하려면 princeReply()의 내부만 바꾸면 UI는 그대로 동작한다.

export interface Personality {
  ei: number // 0 내향(I) .. 1 외향(E)
  sn: number // 0 감각(S) .. 1 직관(N)
  tf: number // 0 사고(T) .. 1 감정(F)
  jp: number // 0 계획(J) .. 1 인식(P)
}

export const PERSONALITY_AXES: { key: keyof Personality; left: string; right: string; q: string }[] = [
  { key: 'ei', left: '혼자가 편안', right: '함께가 즐거움', q: '에너지를 얻는 곳' },
  { key: 'sn', left: '지금 이 순간', right: '상상과 의미', q: '마음이 머무는 곳' },
  { key: 'tf', left: '냉정한 이성', right: '따뜻한 마음', q: '결정을 내리는 방식' },
  { key: 'jp', left: '계획과 정돈', right: '흐름에 맡김', q: '하루를 대하는 태도' },
]

// 어린왕자의 4글자 유형 표기 (재미 요소)
export function personalityCode(p: Personality): string {
  return (
    (p.ei < 0.5 ? 'I' : 'E') +
    (p.sn < 0.5 ? 'S' : 'N') +
    (p.tf < 0.5 ? 'T' : 'F') +
    (p.jp < 0.5 ? 'J' : 'P')
  )
}

const QUOTES = [
  '가장 중요한 것은 눈에 보이지 않아.',
  '네가 길들인 것에 너는 언제까지나 책임이 있어.',
  '사막이 아름다운 건 어딘가 우물을 숨기고 있기 때문이야.',
  '별들이 아름다운 건 보이지 않는 한 송이 꽃 때문이야.',
  '오로지 마음으로 보아야 잘 보인다는 거야.',
  '네 장미를 그토록 소중하게 만든 건, 네가 그 장미에게 쏟은 시간이야.',
]

// 질문 은행 — 축 성향에 가중치를 둔다.
interface Q { text: string; pick: (p: Personality) => number }
const QUESTIONS: Q[] = [
  { text: '오늘 너를 가장 작게 미소 짓게 한 건 뭐였어?', pick: () => 1 },
  { text: '요즘 마음 한구석이 무거운 일이 있니?', pick: (p) => 0.6 + p.tf * 0.6 },
  { text: '지금 가장 길들이고 싶은 마음은 어떤 거야?', pick: (p) => 0.5 + p.sn * 0.7 },
  { text: '오늘 하루, 너 자신에게 해주고 싶은 말이 있다면?', pick: (p) => 0.6 + p.tf * 0.5 },
  { text: '혼자 있는 시간에 너는 주로 무슨 생각을 해?', pick: (p) => 0.5 + (1 - p.ei) * 0.8 },
  { text: '누군가와 더 가까워지고 싶은 사람이 있어?', pick: (p) => 0.5 + p.ei * 0.7 },
  { text: '네가 요즘 미루고 있는, 마음 쓰이는 일이 있을까?', pick: (p) => 0.5 + (1 - p.jp) * 0.6 },
  { text: '만약 작은 별 하나를 가질 수 있다면, 거기엔 무엇을 두고 싶어?', pick: (p) => 0.5 + p.sn * 0.8 },
  { text: '오늘 네가 고마웠던 아주 사소한 것은?', pick: () => 0.9 },
  { text: '지금의 너에게 가장 필요한 건 휴식일까, 용기일까, 아니면 다른 무엇일까?', pick: (p) => 0.6 + p.sn * 0.4 },
  { text: '최근에 마음이 환해졌던 순간을 떠올려볼래?', pick: () => 0.8 },
  { text: '네가 스스로에게 너무 엄격했던 순간은 없었어?', pick: (p) => 0.5 + p.tf * 0.6 },
]

// 사용자 답변에서 감정 키워드 감지
type Mood = 'tired' | 'sad' | 'lonely' | 'anxious' | 'happy' | 'grateful' | 'love' | 'angry' | 'neutral'
function detectMood(text: string): Mood {
  const t = text.toLowerCase()
  if (/(지치|힘들|피곤|지침|버겁|소진|지쳐)/.test(t)) return 'tired'
  if (/(슬프|슬퍼|울|눈물|우울|허전|공허|상실)/.test(t)) return 'sad'
  if (/(외로|혼자|고독|쓸쓸|그리워|보고\s*싶)/.test(t)) return 'lonely'
  if (/(불안|걱정|두려|무서|초조|긴장|막막)/.test(t)) return 'anxious'
  if (/(행복|기쁘|즐거|좋았|신나|설레|뿌듯)/.test(t)) return 'happy'
  if (/(고마|감사|다행|덕분)/.test(t)) return 'grateful'
  if (/(사랑|좋아해|아끼|소중)/.test(t)) return 'love'
  if (/(화나|짜증|분하|억울|미워|싫)/.test(t)) return 'angry'
  return 'neutral'
}

// 감정별 공감 문장 (T/F 말투 두 갈래)
const EMPATHY: Record<Mood, { f: string; t: string }> = {
  tired:   { f: '많이 지쳤구나. 오늘은 아무것도 더 하지 않아도 괜찮아. 네가 여기 있는 것만으로 충분해.', t: '지칠 만했네. 쉬는 것도 해야 할 일의 하나야. 잠시 멈춰도 돼.' },
  sad:     { f: '그 마음, 가만히 곁에 있어줄게. 슬픔도 네 일부니까 억지로 밀어내지 않아도 돼.', t: '슬픔은 지나가는 날씨 같은 거야. 지금은 그냥 흐르게 두자.' },
  lonely:  { f: '외로웠구나. 그래도 봐, 우리가 이렇게 마주 앉아 있잖아. 너는 혼자가 아니야.', t: '관계는 길들이는 데서 시작돼. 한 사람에게 천천히 다가가 보는 건 어때?' },
  anxious: { f: '걱정이 많았구나. 아직 오지 않은 내일을 미리 살지 않아도 돼. 지금 숨 한 번 천천히 쉬어보자.', t: '불안은 대개 통제할 수 없는 걸 통제하려 할 때 와. 네가 할 수 있는 한 가지만 골라보자.' },
  happy:   { f: '네가 웃고 있어서 나도 별처럼 환해져. 이 순간을 마음에 꼭 담아두자.', t: '좋은 순간이네. 무엇이 그렇게 만들었는지 기억해두면 다음에 또 찾아갈 수 있어.' },
  grateful:{ f: '고마움을 느낄 줄 아는 마음이 너를 아름답게 해. 그 작은 것들이 사실은 가장 큰 거야.', t: '감사할 거리를 발견했다는 건 네가 잘 보고 있다는 뜻이야.' },
  love:    { f: '누군가를 소중히 여기는 그 마음이 바로 너의 장미야. 그 시간이 너를 특별하게 만들어.', t: '소중한 걸 소중하다고 말할 수 있는 건 용기야.' },
  angry:   { f: '화가 났구나. 그럴 만했어. 그 감정을 미워하지 말고, 무엇이 너를 지키고 싶었는지 들어주자.', t: '화는 경계가 침범당했다는 신호야. 무엇이 선을 넘었는지 보면 답이 보여.' },
  neutral: { f: '그렇구나. 네 이야기를 들려줘서 고마워. 천천히, 더 들어볼게.', t: '그렇군. 솔직하게 말해줘서 고마워.' },
}

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

/** 다음 질문을 성격 가중치로 고른다 (최근 질문은 피함) */
export function nextQuestion(p: Personality, recent: string[]): string {
  const pool = QUESTIONS.filter((q) => !recent.includes(q.text))
  const list = pool.length ? pool : QUESTIONS
  const weights = list.map((q) => Math.max(0.05, q.pick(p)))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < list.length; i++) { r -= weights[i]; if (r <= 0) return list[i].text }
  return list[0].text
}

/**
 * 내 안의 어린왕자의 답. 현재는 규칙기반.
 * 실제 AI 연동 시: 이 함수를 async로 바꾸고 Claude API 호출 결과를 반환하면 된다.
 */
export function princeReply(userText: string, p: Personality): string {
  const mood = detectMood(userText)
  const warm = p.tf >= 0.5
  const empathy = warm ? EMPATHY[mood].f : EMPATHY[mood].t
  // 가끔 명언을 덧붙임
  const addQuote = Math.random() < 0.45
  const tail = addQuote ? ` — ${rand(QUOTES)}` : ''
  // 성격 색채가 들어간 짧은 여운
  const echo = p.sn >= 0.5
    ? rand(['', ' 네 마음속 어딘가에 분명 우물이 있을 거야.', ' 보이지 않는 것에 더 귀 기울여 보자.'])
    : rand(['', ' 지금 여기, 네 발밑의 작은 별부터 천천히.', ' 오늘 할 수 있는 한 가지면 충분해.'])
  return empathy + echo + tail
}

/** 첫 인사 (성격 반영) */
export function greeting(p: Personality, name: string): string {
  const code = personalityCode(p)
  const who = name ? `${name}의 별` : '이 별'
  return `안녕, 나는 네 안의 어린왕자야. ${who}에 온 걸 환영해. (${code})\n편하게 앉아서, 오늘의 너를 들려줄래?`
}
