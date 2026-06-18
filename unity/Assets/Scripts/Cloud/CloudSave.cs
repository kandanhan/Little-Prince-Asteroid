using System;
using UnityEngine;
using LittlePrince;   // GameData DTO

namespace LittlePrince.Cloud
{
    /// <summary>
    /// GameData DTO ↔ little_prince 테이블 저장/로드. SupabaseClient.I 로그인 후 사용.
    /// id 는 uuid (신규 생성 시 System.Guid.NewGuid().ToString()). user_id 는 저장 시 자동 주입.
    /// 게임 액션 매핑(웹 useGame.ts 와 1:1): addItem→UpsertItem, removeItem→DeleteItem.
    /// 모든 메서드는 코루틴 + 콜백(success, payload/error) 비동기.
    /// </summary>
    public class CloudSave : MonoBehaviour
    {
        SupabaseClient Db => SupabaseClient.I;

        // JsonUtility 는 최상위 배열을 직접 못 다룬다 → 래퍼로 우회
        [Serializable] class Box<T> { public T[] items; }
        static T[] ParseArray<T>(string json)
        {
            if (string.IsNullOrEmpty(json) || json == "[]") return Array.Empty<T>();
            var b = JsonUtility.FromJson<Box<T>>("{\"items\":" + json + "}");
            return b != null && b.items != null ? b.items : Array.Empty<T>();
        }
        static string One<T>(T row) => "[" + JsonUtility.ToJson(row) + "]";

        // ───────── Profile (사용자당 1행) ─────────
        public Coroutine SaveProfile(Profile p, Action<bool, string> done)
        {
            p.user_id = Db.UserId;
            return Db.Upsert("profiles", "user_id", One(p), done);
        }

        public Coroutine LoadProfile(Action<Profile> done)
            => Db.Get("profiles", "?select=*&limit=1", (ok, body) =>
            {
                var a = ok ? ParseArray<Profile>(body) : null;
                done?.Invoke(a != null && a.Length > 0 ? a[0] : null);
            });

        // ───────── Planets ─────────
        public Coroutine SavePlanet(PlanetRow pl, Action<bool, string> done)
        {
            pl.user_id = Db.UserId;
            return Db.Upsert("planets", "id", One(pl), done);
        }

        public Coroutine LoadPlanets(Action<PlanetRow[]> done)
            => Db.Get("planets", "?select=*&order=created_at", (ok, b) =>
                done?.Invoke(ok ? ParseArray<PlanetRow>(b) : Array.Empty<PlanetRow>()));

        public Coroutine DeletePlanet(string id, Action<bool, string> done)
            => Db.Delete("planets", "?id=eq." + id, done);   // items/blocks 는 FK cascade 동반 삭제

        // ───────── Items (장식) ─────────
        public Coroutine UpsertItem(PlacedItem it, string planetId, Action<bool, string> done)
        {
            it.user_id = Db.UserId; it.planet_id = planetId;
            return Db.Upsert("items", "id", One(it), done);
        }

        public Coroutine DeleteItem(string id, Action<bool, string> done)
            => Db.Delete("items", "?id=eq." + id, done);

        public Coroutine LoadItems(string planetId, Action<PlacedItem[]> done)
            => Db.Get("items", "?planet_id=eq." + planetId + "&select=*", (ok, b) =>
                done?.Invoke(ok ? ParseArray<PlacedItem>(b) : Array.Empty<PlacedItem>()));

        // ───────── Blocks (조형) ─────────
        public Coroutine UpsertBlock(BuildBlock bl, string planetId, Action<bool, string> done)
        {
            bl.user_id = Db.UserId; bl.planet_id = planetId;
            return Db.Upsert("blocks", "id", One(bl), done);
        }

        public Coroutine DeleteBlock(string id, Action<bool, string> done)
            => Db.Delete("blocks", "?id=eq." + id, done);

        public Coroutine LoadBlocks(string planetId, Action<BuildBlock[]> done)
            => Db.Get("blocks", "?planet_id=eq." + planetId + "&select=*", (ok, b) =>
                done?.Invoke(ok ? ParseArray<BuildBlock>(b) : Array.Empty<BuildBlock>()));

        // ───────── Songs ─────────
        public Coroutine UpsertSong(Song s, Action<bool, string> done)
        { s.user_id = Db.UserId; return Db.Upsert("songs", "id", One(s), done); }

        public Coroutine DeleteSong(string id, Action<bool, string> done)
            => Db.Delete("songs", "?id=eq." + id, done);

        public Coroutine LoadSongs(Action<Song[]> done)
            => Db.Get("songs", "?select=*&order=created_at.desc", (ok, b) =>
                done?.Invoke(ok ? ParseArray<Song>(b) : Array.Empty<Song>()));

        // ───────── Journal ─────────
        public Coroutine UpsertJournal(JournalEntry j, Action<bool, string> done)
        { j.user_id = Db.UserId; return Db.Upsert("journal", "id", One(j), done); }

        public Coroutine DeleteJournal(string id, Action<bool, string> done)
            => Db.Delete("journal", "?id=eq." + id, done);

        public Coroutine LoadJournal(Action<JournalEntry[]> done)
            => Db.Get("journal", "?select=*&order=created_at.desc", (ok, b) =>
                done?.Invoke(ok ? ParseArray<JournalEntry>(b) : Array.Empty<JournalEntry>()));

        // ───────── Paintings (메타 + Storage PNG) ─────────
        /// 그림 저장: lp-paintings/<uid>/<id>.png 업로드 후 paintings 행 upsert.
        public Coroutine SavePainting(string id, string title, byte[] png, Action<bool, string> done)
            => StartCoroutine(SavePaintingFlow(id, title, png, done));

        System.Collections.IEnumerator SavePaintingFlow(string id, string title, byte[] png, Action<bool, string> done)
        {
            string path = Db.UserId + "/" + id + ".png";
            bool upOk = false; string upMsg = null; bool upDone = false;
            Db.UploadPng(Db.config.paintingsBucket, path, png, (ok, m) => { upOk = ok; upMsg = m; upDone = true; });
            while (!upDone) yield return null;
            if (!upOk) { done?.Invoke(false, "upload: " + upMsg); yield break; }

            var row = new Painting { id = id, user_id = Db.UserId, title = title, image_path = path };
            Db.Upsert("paintings", "id", One(row), done);
        }

        public Coroutine LoadPaintings(Action<Painting[]> done)
            => Db.Get("paintings", "?select=*&order=created_at.desc", (ok, b) =>
                done?.Invoke(ok ? ParseArray<Painting>(b) : Array.Empty<Painting>()));

        public Coroutine DeletePainting(string id, Action<bool, string> done)
            => Db.Delete("paintings", "?id=eq." + id, done);   // 주의: Storage 파일은 별도 삭제 필요

        /// 그림 이미지 바이트 로드 → new Texture2D(2,2); tex.LoadImage(bytes);
        public Coroutine LoadPaintingImage(string imagePath, Action<bool, byte[]> done)
            => Db.Download(Db.config.paintingsBucket, imagePath, done);
    }
}
