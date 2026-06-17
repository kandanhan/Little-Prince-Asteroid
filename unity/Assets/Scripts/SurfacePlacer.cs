using UnityEngine;
using UnityEngine.Events;

namespace LittlePrince
{
    /// (lat, lon, worldPos) 를 전달하는 배치 이벤트
    [System.Serializable]
    public class SurfaceHitEvent : UnityEvent<float, float, Vector3> { }

    /// <summary>
    /// 화면 탭/클릭 → 행성 표면 레이캐스트 → 위경도 계산 → 배치.
    /// 웹 Planet.tsx 의 handlePointerDown(점 normalize → dirToLatLon) 이식.
    /// 행성 메쉬에 Collider(SphereCollider 권장)가 있어야 한다.
    /// </summary>
    public class SurfacePlacer : MonoBehaviour
    {
        [Tooltip("비우면 Camera.main 사용")]
        public Camera cam;
        [Tooltip("행성 레이어만 지정 권장")]
        public LayerMask planetMask = ~0;
        [Tooltip("배치할 프리팹(선택). 비우면 OnPlaced 이벤트만 발생")]
        public GameObject prefab;
        [Tooltip("배치된 오브젝트의 부모(보통 행성 Transform)")]
        public Transform parent;

        public SurfaceHitEvent OnPlaced;   // (lat, lon, worldPos)

        void Update()
        {
            if (!Input.GetMouseButtonDown(0)) return;   // 터치도 마우스로 매핑됨
            Camera c = cam != null ? cam : Camera.main;
            if (c == null) return;

            Ray ray = c.ScreenPointToRay(Input.mousePosition);
            if (!Physics.Raycast(ray, out RaycastHit hit, 100f, planetMask)) return;

            // 원점 중심 구 가정 → 히트점 방향이 곧 표면 법선
            Vector3 dir = hit.point.normalized;
            SphereMath.DirToLatLon(dir, out float lat, out float lon);
            Vector3 pos = dir * SphereMath.PlanetRadius;

            if (prefab != null)
            {
                GameObject go = Instantiate(prefab, pos, SphereMath.SurfaceRotation(dir, 0f), parent);
                go.name = $"{prefab.name}_{lat:F2}_{lon:F2}";
            }
            OnPlaced?.Invoke(lat, lon, pos);
        }

        /// 저장된 lat/lon 으로 표면에 오브젝트를 배치(클라우드 로드 시 재현용)
        public Transform PlaceAt(GameObject go, float lat, float lon, Transform under = null)
        {
            Vector3 dir = SphereMath.LatLonToDir(lat, lon);
            var t = Instantiate(go, dir * SphereMath.PlanetRadius,
                                SphereMath.SurfaceRotation(dir, 0f), under).transform;
            return t;
        }
    }
}
