using UnityEngine;

namespace LittlePrince
{
    /// <summary>
    /// 빈 씬에 이 스크립트 하나만 두고 ▶ 누르면 행성·어린왕자·3인칭 카메라·표면배치를
    /// 코드로 자동 생성한다. Phase 1 빠른 확인용(수동 씬 세팅 생략).
    ///   · 이동: 키보드 WASD/화살표 (레거시 Input). 좌우·앞뒤 반대면 PlanetWalker 토글.
    ///   · 배치: 행성 표면 클릭 → 그 자리에 작은 마커 생성.
    /// ※ 입력이 안 먹으면 Project Settings → Player → Active Input Handling = Both 권장.
    /// </summary>
    public class B612Bootstrap : MonoBehaviour
    {
        [Header("색")]
        public Color groundColor = new Color(0.37f, 0.66f, 0.42f);  // 초원
        public Color princeColor = new Color(0.23f, 0.49f, 0.27f);  // 외투 초록
        public Color markerColor = new Color(0.91f, 0.30f, 0.24f);  // 장미 빨강

        void Start()
        {
            EnsureLight();
            var planet = BuildPlanet();
            var walker = BuildPrince();
            BuildCamera(walker);
            BuildPlacer(planet.transform);
        }

        void EnsureLight()
        {
            if (FindFirstObjectByType<Light>() != null) return;
            var go = new GameObject("Sun");
            var l = go.AddComponent<Light>();
            l.type = LightType.Directional;
            l.intensity = 1.1f;
            go.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
        }

        GameObject BuildPlanet()
        {
            var planet = GameObject.CreatePrimitive(PrimitiveType.Sphere);  // SphereCollider 포함
            planet.name = "Planet";
            planet.transform.position = Vector3.zero;
            planet.transform.localScale = Vector3.one * (SphereMath.PlanetRadius * 2f); // 반지름 3 → scale 6
            Paint(planet, groundColor);
            return planet;
        }

        PlanetWalker BuildPrince()
        {
            var prince = new GameObject("Prince");
            var walker = prince.AddComponent<PlanetWalker>();

            // 보이는 임시 몸체(캡슐) — 발이 표면에 닿도록 로컬 +Y 로 띄움
            var body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Body(temp)";
            Destroy(body.GetComponent<Collider>());     // 물리 불필요
            body.transform.SetParent(prince.transform, false);
            body.transform.localScale = Vector3.one * 0.35f;
            body.transform.localPosition = new Vector3(0f, 0.35f, 0f);
            Paint(body, princeColor);
            return walker;
        }

        void BuildCamera(PlanetWalker target)
        {
            var cam = Camera.main;
            if (cam == null)
            {
                var go = new GameObject("Main Camera") { tag = "MainCamera" };
                cam = go.AddComponent<Camera>();
                go.AddComponent<AudioListener>();
            }
            var follow = cam.GetComponent<ThirdPersonPlanetCamera>()
                         ?? cam.gameObject.AddComponent<ThirdPersonPlanetCamera>();
            follow.target = target;
        }

        void BuildPlacer(Transform planet)
        {
            var go = new GameObject("SurfacePlacer");
            var placer = go.AddComponent<SurfacePlacer>();
            placer.parent = planet;
            placer.prefab = null;                       // 마커는 아래 리스너가 직접 생성
            if (placer.OnPlaced == null) placer.OnPlaced = new SurfaceHitEvent();
            placer.OnPlaced.AddListener((lat, lon, pos) =>
            {
                var m = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                m.name = $"mark_{lat:F2}_{lon:F2}";
                Destroy(m.GetComponent<Collider>());
                m.transform.SetParent(planet, true);
                m.transform.position = pos;
                m.transform.localScale = Vector3.one * 0.18f;
                Paint(m, markerColor);
            });
        }

        static void Paint(GameObject go, Color c)
        {
            var r = go.GetComponent<Renderer>();
            if (r == null) return;
            var m = r.material;                                            // 인스턴스화
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", c);  // URP Lit
            if (m.HasProperty("_Color")) m.SetColor("_Color", c);          // Built-in 등
        }
    }
}
