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
        public static readonly List<ItemDef> Items = new List<ItemDef>
        {
            new ItemDef(ItemKind.rose,     "장미",         "🌹", "세상에 단 하나뿐인 나의 장미.",            1.0f),
            new ItemDef(ItemKind.baobab,   "바오바브 새싹", "🌱", "작을 때 돌봐주면 친구가 돼요.",            0.9f),
            new ItemDef(ItemKind.tree,     "나무",         "🌳", "그늘을 만들어 주는 친구.",                1.1f),
            new ItemDef(ItemKind.lamp,     "가로등",       "🏮", "밤이 오면 스스로 불을 밝혀요.",            1.0f),
            new ItemDef(ItemKind.bench,    "벤치",         "🪑", "노을을 마흔네 번 바라보던 자리.",          1.0f),
            new ItemDef(ItemKind.fox,      "여우",         "🦊", "길들인다는 건 관계를 맺는 것.",            0.9f),
            new ItemDef(ItemKind.sheep,    "양",           "🐑", "상자 속에 잠든 나의 양.",                 0.9f),
            new ItemDef(ItemKind.star,     "별",           "⭐", "웃을 줄 아는 별 하나.",                   0.8f),
            new ItemDef(ItemKind.crystal,  "수정",         "💎", "빛을 머금은 작은 결정.",                  0.8f),
            new ItemDef(ItemKind.mushroom, "버섯",         "🍄", "비 온 뒤 돋아난 작은 우산.",              0.8f),
            new ItemDef(ItemKind.flower,   "들꽃",         "🌼", "바람에 흔들리는 들꽃 무리.",              0.8f),
            new ItemDef(ItemKind.well,     "우물",         "⛲", "사막을 아름답게 하는 건 어딘가 숨은 우물.", 1.0f),
            new ItemDef(ItemKind.volcano,  "화산",         "🌋", "매일 청소하면 따뜻한 아침밥을 지어줘요.",   1.0f),
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
