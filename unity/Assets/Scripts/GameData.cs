using System;
using System.Collections.Generic;

namespace LittlePrince
{
    // 웹 useGame.ts 의 데이터 모델 ↔ Supabase 테이블 1:1 대응 DTO.
    // 필드명은 Supabase 컬럼(snake_case)에 맞춰 직렬화/매핑이 쉽도록 함.

    public enum ItemKind
    {
        rose, baobab, lamp, bench, fox, sheep, star, mushroom, flower, well,
        volcano, tree, crystal,            // 기본 13종
        cat, bird, fountain, house, rainbow // 상점 전용 특별 아이템
    }

    public enum BuildShape { cube, slab, pillar, roof, fence, window }

    public enum PlanetTheme { meadow, desert, ocean, snow, rose, night }

    [Serializable]
    public class Personality
    {
        public float ei = 0.5f, sn = 0.5f, tf = 0.5f, jp = 0.5f; // MBTI 4축 (0..1)
    }

    [Serializable]
    public class Profile        // public.profiles
    {
        public string user_id;
        public string prince_name = "";
        public int happiness;
        public bool visited;
        public int coins = 60;
        public string last_daily_gift;          // 'YYYY-MM-DD'
        public Personality personality = new Personality();
        public bool personality_set;
        public bool remove_ads;
        public float style_level = 0.35f;
        public bool low_spec;
        public string current_planet_id;
    }

    [Serializable]
    public class PlacedItem     // little_prince.items
    {
        public string id;         // uuid (신규 생성 시 System.Guid)
        public string user_id;    // 소유자(RLS) — 저장 시 자동 주입
        public string planet_id;
        public string kind;       // ItemKind 의 문자열
        public double lat, lon;
        public float scale = 1f;
        public float hue;         // 0..1 색조 변화
    }

    [Serializable]
    public class BuildBlock     // little_prince.blocks
    {
        public string id;         // uuid (신규 생성 시 System.Guid)
        public string user_id;    // 소유자(RLS) — 저장 시 자동 주입
        public string planet_id;
        public string shape;      // BuildShape 의 문자열
        public double lat, lon;
        public int height;        // 표면에서 몇 칸 위
        public string color = "#e9c46a";
        public int rot;           // 0..3 (90° 단위 yaw)
    }

    [Serializable]
    public class PlanetData     // little_prince.planets (+ 자식 items/blocks, 클라 메모리용)
    {
        public string id;
        public string name = "이름 없는 별";
        public string theme = "meadow";   // PlanetTheme 의 문자열
        public List<PlacedItem> items = new List<PlacedItem>();
        public List<BuildBlock> blocks = new List<BuildBlock>();
    }

    [Serializable]
    public class PlanetRow      // little_prince.planets (DB 행 — 자식 제외)
    {
        public string id;       // uuid (신규 생성 시 System.Guid)
        public string user_id;
        public string name = "이름 없는 별";
        public string theme = "meadow";
    }

    [Serializable]
    public class Painting       // little_prince.paintings (이미지는 Storage 'lp-paintings')
    {
        public string id;
        public string user_id;
        public string title = "";
        public string image_path;   // <uid>/<id>.png
    }

    [Serializable]
    public class Song           // little_prince.songs
    {
        public string id;
        public string user_id;
        public long seed;
        public string title = "";
        public string mood = "";
    }

    [Serializable]
    public class JournalEntry   // little_prince.journal
    {
        public string id;
        public string user_id;
        public string text = "";
    }
}
