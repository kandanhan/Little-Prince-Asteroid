using System.Collections.Generic;

namespace LittlePrince
{
    // 웹 items.ts / planets.ts 의 카탈로그 이식 (UI·배치 기본값용).

    public struct ItemDef
    {
        public ItemKind kind; public string name; public string emoji; public string hint; public float scale;
        public ItemDef(ItemKind k, string n, string e, string h, float s) { kind = k; name = n; emoji = e; hint = h; scale = s; }
    }

    public struct ThemeDef
    {
        public PlanetTheme theme; public string name; public string ground; public string accent; public string skyTint;
        public ThemeDef(PlanetTheme t, string n, string g, string a, string s) { theme = t; name = n; ground = g; accent = a; skyTint = s; }
    }

    public static class PlanetItemCatalog
    {
        public const int NewPlanetCost = 200;
        public const float RewardCoins = 15;

        // 기본 13종 장식 (상점 전용 5종은 ItemKind 에만 정의)
        // 힌트 문구는 Orblet 오리지널 카피(어린왕자 인용 미사용) — BRAND.md §5
        public static readonly List<ItemDef> Items = new List<ItemDef>
        {
            new ItemDef(ItemKind.rose,     "장미",         "🌹", "오늘도 한 송이, 별이 환해졌어요",   1.0f),
            new ItemDef(ItemKind.baobab,   "새싹",         "🌱", "작은 떡잎, 내일이 기대돼요",        0.9f),
            new ItemDef(ItemKind.tree,     "나무",         "🌳", "그늘 아래 잠깐 쉬어가요",           1.1f),
            new ItemDef(ItemKind.lamp,     "가로등",       "🏮", "밤이 오면 깜빡, 스스로 불을 켜요",   1.0f),
            new ItemDef(ItemKind.bench,    "벤치",         "🪑", "나란히 앉아 노을을 봐요",           1.0f),
            new ItemDef(ItemKind.fox,      "여우",         "🦊", "천천히 다가가면, 어느새 친구",      0.9f),
            new ItemDef(ItemKind.sheep,    "양",           "🐑", "포근한 털뭉치가 데구르르",          0.9f),
            new ItemDef(ItemKind.star,     "별",           "⭐", "콕 놓으면 반짝, 웃는 별",           0.8f),
            new ItemDef(ItemKind.crystal,  "수정",         "💎", "빛을 머금은 작은 결정",             0.8f),
            new ItemDef(ItemKind.mushroom, "버섯",         "🍄", "비 온 뒤 쏙 돋은 우산",             0.8f),
            new ItemDef(ItemKind.flower,   "들꽃",         "🌼", "바람에 살랑이는 들꽃 무리",         0.8f),
            new ItemDef(ItemKind.well,     "우물",         "⛲", "별 어딘가 숨어 있는 시원한 우물",   1.0f),
            new ItemDef(ItemKind.volcano,  "화산",         "🌋", "아침마다 보글보글, 따뜻한 김",      1.0f),
        };

        public static readonly List<ThemeDef> Themes = new List<ThemeDef>
        {
            new ThemeDef(PlanetTheme.meadow, "초원의 별", "#5fa86b", "#a7ecb0", "#8fd3ff"),
            new ThemeDef(PlanetTheme.desert, "사막의 별", "#e9c46a", "#f4d58d", "#ffd6a5"),
            new ThemeDef(PlanetTheme.ocean,  "바다의 별", "#4aa3c7", "#90e0ef", "#caf0f8"),
            new ThemeDef(PlanetTheme.snow,   "눈의 별",   "#e8eef2", "#ffffff", "#cde7ff"),
            new ThemeDef(PlanetTheme.rose,   "장미의 별", "#c97b97", "#ffb3c6", "#ffc8dd"),
            new ThemeDef(PlanetTheme.night,  "밤의 별",   "#5a5378", "#b8b3d9", "#3a2a5a"),
        };

        public static readonly BuildShape[] Shapes =
        {
            BuildShape.cube, BuildShape.slab, BuildShape.pillar,
            BuildShape.roof, BuildShape.fence, BuildShape.window
        };
    }
}
