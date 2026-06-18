using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace LittlePrince.Cloud
{
    /// <summary>
    /// 의존성 0 Supabase REST/Auth 클라이언트 (UnityWebRequest).
    /// little_prince 스키마를 Accept-Profile/Content-Profile 헤더로 타깃한다.
    /// 사용: 씬에 빈 GameObject → 이 스크립트 부착 → config 연결. SupabaseClient.I 로 접근.
    /// </summary>
    public class SupabaseClient : MonoBehaviour
    {
        public static SupabaseClient I { get; private set; }
        public SupabaseConfig config;

        public string AccessToken { get; private set; }   // 로그인 후 JWT
        public string UserId { get; private set; }
        public bool IsSignedIn => !string.IsNullOrEmpty(AccessToken);

        string Bearer => IsSignedIn ? AccessToken : config.anonKey;

        void Awake()
        {
            if (I != null && I != this) { Destroy(gameObject); return; }
            I = this;
            DontDestroyOnLoad(gameObject);
        }

        // ───────── Auth (GoTrue) ─────────
        [Serializable] class AuthBody { public string email; public string password; }
        [Serializable] class AuthUser { public string id; }
        [Serializable] class AuthResp { public string access_token; public AuthUser user; }

        public Coroutine SignUp(string email, string password, Action<bool, string> done)
            => StartCoroutine(AuthFlow("/auth/v1/signup", email, password, done));

        public Coroutine SignIn(string email, string password, Action<bool, string> done)
            => StartCoroutine(AuthFlow("/auth/v1/token?grant_type=password", email, password, done));

        public void SignOut() { AccessToken = null; UserId = null; }

        IEnumerator AuthFlow(string path, string email, string password, Action<bool, string> done)
        {
            string body = JsonUtility.ToJson(new AuthBody { email = email, password = password });
            using var req = MakeRequest("POST", config.url + path, body, withProfile: false);
            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success) { done?.Invoke(false, Err(req)); yield break; }

            var resp = JsonUtility.FromJson<AuthResp>(req.downloadHandler.text);
            if (resp != null && !string.IsNullOrEmpty(resp.access_token))
            {
                AccessToken = resp.access_token;
                UserId = resp.user != null ? resp.user.id : null;
                done?.Invoke(true, UserId);
            }
            else
            {
                // signup 시 이메일 확인이 켜져 있으면 세션 없이 성공 (확인 메일 대기)
                done?.Invoke(true, null);
            }
        }

        // ───────── REST (PostgREST) ─────────
        public Coroutine Get(string table, string query, Action<bool, string> done)
            => StartCoroutine(Rest("GET", table, query, null, null, done));

        /// 배열 본문 upsert. conflictCol = PK/유니크 컬럼 (예: "id", "user_id").
        public Coroutine Upsert(string table, string conflictCol, string jsonArray, Action<bool, string> done)
            => StartCoroutine(Rest("POST", table, "?on_conflict=" + conflictCol, jsonArray,
                                    "resolution=merge-duplicates,return=minimal", done));

        public Coroutine Insert(string table, string jsonArray, Action<bool, string> done)
            => StartCoroutine(Rest("POST", table, "", jsonArray, "return=minimal", done));

        /// query 에 필터 필수 (예: "?id=eq.<uuid>"). PostgREST 는 무필터 삭제를 막는다.
        public Coroutine Delete(string table, string query, Action<bool, string> done)
            => StartCoroutine(Rest("DELETE", table, query, null, null, done));

        IEnumerator Rest(string method, string table, string query, string body, string prefer, Action<bool, string> done)
        {
            string url = $"{config.url}/rest/v1/{table}{query}";
            using var req = MakeRequest(method, url, body, withProfile: true);
            if (!string.IsNullOrEmpty(prefer)) req.SetRequestHeader("Prefer", prefer);
            yield return req.SendWebRequest();
            bool ok = req.result == UnityWebRequest.Result.Success;
            done?.Invoke(ok, ok ? req.downloadHandler.text : Err(req));
        }

        // ───────── low-level ─────────
        UnityWebRequest MakeRequest(string method, string url, string body, bool withProfile)
        {
            var req = new UnityWebRequest(url, method) { downloadHandler = new DownloadHandlerBuffer() };
            if (!string.IsNullOrEmpty(body))
            {
                req.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
                req.SetRequestHeader("Content-Type", "application/json");
            }
            req.SetRequestHeader("apikey", config.anonKey);
            req.SetRequestHeader("Authorization", "Bearer " + Bearer);
            if (withProfile)
            {
                req.SetRequestHeader("Accept-Profile", config.schema);   // GET 시 스키마
                req.SetRequestHeader("Content-Profile", config.schema);  // 쓰기 시 스키마
            }
            return req;
        }

        static string Err(UnityWebRequest r)
            => $"{(int)r.responseCode} {r.error} :: {(r.downloadHandler != null ? r.downloadHandler.text : "")}";
    }
}
