using UnityEngine;

namespace LittlePrince.Cloud
{
    /// <summary>
    /// Supabase 연결 설정 에셋.
    /// 만들기: Project 창 → Create → Little Prince → Supabase Config →
    ///         Inspector 에서 anonKey 입력(빈 채로 커밋됨 — 시크릿 보호).
    /// 메모: anon key 는 '공개용(publishable)'이라 클라이언트에 둬도 안전하다.
    ///       데이터는 RLS 가 보호한다. service key 는 절대 클라이언트/깃에 넣지 말 것.
    /// </summary>
    [CreateAssetMenu(fileName = "SupabaseConfig", menuName = "Little Prince/Supabase Config")]
    public class SupabaseConfig : ScriptableObject
    {
        [Tooltip("https://<project-ref>.supabase.co")]
        public string url = "https://tokqxnivbwxlpmunzgyg.supabase.co";

        [Tooltip("Settings → API → Project API keys → anon public")]
        public string anonKey = "";

        [Tooltip("PostgREST 노출 스키마 (Settings → API → Exposed schemas 에 추가 필요)")]
        public string schema = "little_prince";

        [Tooltip("그림 PNG 저장 Storage 버킷")]
        public string paintingsBucket = "lp-paintings";
    }
}
