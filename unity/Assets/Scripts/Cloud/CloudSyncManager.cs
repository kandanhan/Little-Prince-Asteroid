using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using LittlePrince;   // GameData DTO

namespace LittlePrince.Cloud
{
    /// <summary>
    /// 클라우드 세이브를 게임 흐름에 잇는 예제 글루:
    ///   로그인 → 전체 로드(profile/planets/현재 행성 items·blocks) → 변경마다 저장.
    /// CloudSave 와 같은 GameObject 에 둔다(SupabaseClient 는 별도 싱글턴).
    /// OnLoaded 에서 실제 씬 재구성(행성·장식·블록 생성)을 연결하면 된다.
    /// </summary>
    [RequireComponent(typeof(CloudSave))]
    public class CloudSyncManager : MonoBehaviour
    {
        CloudSave cloud;

        // 메모리 상태 (실제 게임 상태와 연결/대체 가능)
        public Profile profile;
        public List<PlanetRow> planets = new();
        public string currentPlanetId;
        public List<PlacedItem> items = new();
        public List<BuildBlock> blocks = new();

        /// 로드 완료 후 호출 — 여기서 씬에 행성/장식/블록을 생성한다
        /// (예: items 를 돌며 SurfacePlacer.PlaceAt(prefab, (float)it.lat, (float)it.lon)).
        public event Action OnLoaded;

        void Awake() { cloud = GetComponent<CloudSave>(); }

        // ── 로그인 → 전체 로드 ──
        public void LoginAndPull(string email, string pw)
            => SupabaseClient.I.SignIn(email, pw, (ok, uid) =>
            {
                if (ok && !string.IsNullOrEmpty(uid)) PullAll();
                else Debug.LogWarning("[Cloud] 로그인 실패/대기: " + uid);
            });

        public void PullAll()
        {
            cloud.LoadProfile(p =>
            {
                profile = p ?? new Profile { coins = 60, style_level = 0.35f };
                cloud.LoadPlanets(pls =>
                {
                    planets = new List<PlanetRow>(pls);
                    if (planets.Count == 0) { CreateFirstPlanet(); return; }
                    currentPlanetId = !string.IsNullOrEmpty(profile.current_planet_id)
                        ? profile.current_planet_id : planets[0].id;
                    LoadCurrentPlanet();
                });
            });
        }

        void LoadCurrentPlanet()
        {
            cloud.LoadItems(currentPlanetId, its =>
            {
                items = new List<PlacedItem>(its);
                cloud.LoadBlocks(currentPlanetId, bls =>
                {
                    blocks = new List<BuildBlock>(bls);
                    OnLoaded?.Invoke();   // ← 씬 재구성 지점
                });
            });
        }

        // ── 게임 액션 훅 (gameplay 에서 호출; 웹 useGame.ts 와 1:1) ──
        public void PlaceItem(PlacedItem it)
        {
            if (string.IsNullOrEmpty(it.id)) it.id = Guid.NewGuid().ToString();
            items.Add(it);
            cloud.UpsertItem(it, currentPlanetId, (ok, m) => Warn(ok, "심기", m));
            MarkProfileDirty();   // 행복도/코인 등 갱신 시
        }

        public void RemoveItem(string id)
        {
            items.RemoveAll(x => x.id == id);
            cloud.DeleteItem(id, (ok, m) => Warn(ok, "치우기", m));
        }

        public void PlaceBlock(BuildBlock bl)
        {
            if (string.IsNullOrEmpty(bl.id)) bl.id = Guid.NewGuid().ToString();
            blocks.Add(bl);
            cloud.UpsertBlock(bl, currentPlanetId, (ok, m) => Warn(ok, "블록", m));
        }

        public void RemoveBlock(string id)
        {
            blocks.RemoveAll(x => x.id == id);
            cloud.DeleteBlock(id, (ok, m) => Warn(ok, "블록삭제", m));
        }

        public void SwitchPlanet(string planetId)
        {
            currentPlanetId = planetId;
            profile.current_planet_id = planetId;
            MarkProfileDirty();
            LoadCurrentPlanet();
        }

        // ── 프로필 저장 (디바운스: 코인/행복도 등 잦은 변경 묶기) ──
        Coroutine _pending;
        public void MarkProfileDirty()
        {
            if (_pending != null) StopCoroutine(_pending);
            _pending = StartCoroutine(SaveProfileSoon());
        }

        IEnumerator SaveProfileSoon()
        {
            yield return new WaitForSeconds(1.5f);
            _pending = null;
            cloud.SaveProfile(profile, (ok, m) => Warn(ok, "프로필", m));
        }

        // ── 헬퍼 ──
        void CreateFirstPlanet()
        {
            var pl = new PlanetRow { id = Guid.NewGuid().ToString(), name = "B-612", theme = "meadow" };
            cloud.SavePlanet(pl, (ok, m) =>
            {
                if (!ok) { Warn(false, "행성생성", m); return; }
                planets.Add(pl);
                currentPlanetId = pl.id;
                profile.current_planet_id = pl.id;
                MarkProfileDirty();
                items = new List<PlacedItem>();
                blocks = new List<BuildBlock>();
                OnLoaded?.Invoke();
            });
        }

        static void Warn(bool ok, string what, string msg)
        { if (!ok) Debug.LogWarning($"[Cloud] {what} 저장 실패: {msg}"); }
    }
}
