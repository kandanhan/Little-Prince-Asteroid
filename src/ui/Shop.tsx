import { useState } from 'react'
import { Sheet } from './Sheet'
import { useGame } from '../store/useGame'
import { SHOP_CATALOG, type ShopCategory } from '../game/shop'
import { IAP_PRODUCTS, purchaseProduct } from '../monetization/ads'

const CATEGORIES: (ShopCategory | '전체')[] = ['전체', '식물', '동물', '구조물', '특별']

export function Shop({ onToast }: { onToast: (m: string) => void }) {
  const setPanel = useGame((s) => s.setPanel)
  const coins = useGame((s) => s.coins)
  const buy = useGame((s) => s.buy)
  const deliveries = useGame((s) => s.deliveries)
  const requestRewardedAd = useGame((s) => s.requestRewardedAd)
  const removeAds = useGame((s) => s.removeAds)
  const addCoins = useGame((s) => s.addCoins)
  const setRemoveAds = useGame((s) => s.setRemoveAds)
  const [cat, setCat] = useState<ShopCategory | '전체'>('전체')

  const items = SHOP_CATALOG.filter((s) => cat === '전체' || s.category === cat)

  const onIap = async (id: string) => {
    const ok = await purchaseProduct(id)
    if (!ok) { onToast('결제가 취소되었어요'); return }
    const p = IAP_PRODUCTS.find((x) => x.id === id)!
    if (p.coins) { addCoins(p.coins); onToast(`별빛 +${p.coins} 충전됐어요 (체험)`) }
    if (p.removesAds) { setRemoveAds(true); onToast('광고 비행선이 떠났어요 (체험)') }
  }

  return (
    <Sheet
      title="별빛 상점 🛍️"
      sub="구매하면 별빛 배달부가 우주에서 날아와 별에 내려놓아 줘요."
      onClose={() => setPanel(null)}
    >
      <div className="badge" style={{ display: 'inline-flex', marginBottom: 12 }}>🪙 {coins} 별빛</div>
      {deliveries.length > 0 && (
        <span className="badge" style={{ marginLeft: 8, background: '#fff8e6' }}>🚀 배달 중 {deliveries.length}</span>
      )}

      {!removeAds && (
        <button className="btn full ghost" style={{ margin: '4px 0 4px' }} onClick={requestRewardedAd}>
          🎬 광고 보고 별빛 받기 (+15)
        </button>
      )}

      <div className="chips" style={{ margin: '12px 0' }}>
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="shop-grid">
        {items.map((it) => {
          const afford = coins >= it.price
          return (
            <div className={`shop-cell ${it.rare ? 'rare' : ''}`} key={it.kind + it.name}>
              <div className="emoji">{it.emoji}</div>
              <div className="nm">{it.name}</div>
              <div className="hint">{it.hint}</div>
              <button
                className="btn buy"
                disabled={!afford}
                onClick={() => {
                  if (buy(it.kind, it.price)) {
                    onToast(`${it.name} 주문 완료! 배달부가 오는 중 🚀`)
                    setPanel(null)
                  }
                }}
              >
                🪙 {it.price}
              </button>
            </div>
          )
        })}
      </div>

      <h2 style={{ fontSize: 16, margin: '20px 0 4px' }}>별빛 충전 · 후원 💛</h2>
      <p className="sub" style={{ margin: '0 0 10px' }}>체험용입니다. 실제 출시 버전에서 스토어 결제로 연결됩니다.</p>
      <div className="iap-list">
        {IAP_PRODUCTS.map((p) => (
          <button key={p.id} className="iap-row" onClick={() => onIap(p.id)} disabled={p.removesAds && removeAds}>
            <span className="iap-emoji">{p.emoji}</span>
            <span className="iap-meta">
              <span className="iap-name">{p.name}</span>
              <span className="iap-desc">{p.desc}</span>
            </span>
            <span className="iap-price">{p.removesAds && removeAds ? '구매함' : p.priceLabel}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
