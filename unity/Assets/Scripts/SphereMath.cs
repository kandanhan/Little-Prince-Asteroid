using UnityEngine;

namespace LittlePrince
{
    /// <summary>
    /// 구형 행성 위의 좌표/자세 수학. 웹 버전(src/game/sphereMath.ts)을
    /// Unity 좌표계(+Z 전방, +Y 위)로 이식.
    /// 행성은 원점 중심, 반지름 PlanetRadius 의 구. 표면 법선 = 위쪽.
    /// </summary>
    public static class SphereMath
    {
        public const float PlanetRadius = 3f;

        /// 위도(lat)·경도(lon, 라디안) → 단위 방향 벡터
        public static Vector3 LatLonToDir(float lat, float lon)
        {
            float cosLat = Mathf.Cos(lat);
            return new Vector3(cosLat * Mathf.Sin(lon), Mathf.Sin(lat), cosLat * Mathf.Cos(lon));
        }

        /// 단위 방향 벡터 → 위도·경도(라디안)
        public static void DirToLatLon(Vector3 dir, out float lat, out float lon)
        {
            Vector3 v = dir.normalized;
            lat = Mathf.Asin(Mathf.Clamp(v.y, -1f, 1f));
            lon = Mathf.Atan2(v.x, v.z);
        }

        /// 표면 한 점의 접선 기준틀: up(법선) / north(+Y극 방향 투영) / east
        public static void TangentBasis(Vector3 dir, out Vector3 up, out Vector3 north, out Vector3 east)
        {
            up = dir.normalized;
            Vector3 worldUp = Vector3.up;
            north = worldUp - up * Vector3.Dot(worldUp, up);
            if (north.sqrMagnitude < 1e-6f) north = Vector3.forward; // 극점 예외
            north.Normalize();
            east = Vector3.Cross(up, north).normalized;
        }

        /// heading(라디안, 0 = 북) 방향의 표면 접선 전방 벡터
        public static Vector3 HeadingForward(Vector3 dir, float heading)
        {
            TangentBasis(dir, out _, out Vector3 north, out Vector3 east);
            return (north * Mathf.Cos(heading) + east * Mathf.Sin(heading)).normalized;
        }

        /// 표면에 정렬되고 heading 을 바라보는 회전 (+Z 전방, +Y 위)
        public static Quaternion SurfaceRotation(Vector3 dir, float heading)
        {
            TangentBasis(dir, out Vector3 up, out _, out _);
            Vector3 forward = HeadingForward(dir, heading);
            return Quaternion.LookRotation(forward, up);
        }

        /// 현재 dir 에서 heading 방향으로 각거리 angle(라디안)만큼 표면 이동한 새 dir.
        /// up 과 forward 는 직교 → 두 벡터가 이루는 평면 내 회전으로 안전하게 계산
        /// (좌표계 손방향과 무관하게 항상 forward 쪽으로 이동).
        public static Vector3 MoveOnSphere(Vector3 dir, float heading, float angle)
        {
            Vector3 up = dir.normalized;
            Vector3 forward = HeadingForward(up, heading);
            return (up * Mathf.Cos(angle) + forward * Mathf.Sin(angle)).normalized;
        }
    }
}
