using UnityEngine;

namespace LittlePrince
{
    /// <summary>
    /// 어린왕자 뒤·위에서 부드럽게 따라오는 3인칭 카메라. (웹 Prince.tsx 카메라 로직 이식)
    /// 카메라 GameObject 에 붙이고 target 에 PlanetWalker 를 연결한다.
    /// </summary>
    public class ThirdPersonPlanetCamera : MonoBehaviour
    {
        public PlanetWalker target;

        [Header("거리 / 높이")]
        public float distance = 4.2f;
        public float height = 2.6f;
        public float lookHeight = 0.6f;

        [Header("따라오는 부드러움 (작을수록 빠르게 붙음)")]
        [Range(1e-5f, 0.5f)] public float posDamping = 0.001f;
        [Range(1e-5f, 0.5f)] public float lookDamping = 0.0001f;

        Vector3 _camPos;
        Vector3 _lookAt;
        bool _init;

        void LateUpdate()
        {
            if (target == null) return;
            float dt = Time.deltaTime;

            Vector3 dir = target.SurfaceDir;
            Vector3 up = dir;
            Vector3 surfacePos = dir * (SphereMath.PlanetRadius + target.charHeight);
            Vector3 forward = SphereMath.HeadingForward(dir, target.Heading);

            Vector3 desired = surfacePos + up * height - forward * distance;
            Vector3 lookTarget = surfacePos + up * lookHeight;

            if (!_init) { _camPos = desired; _lookAt = lookTarget; _init = true; }

            // 웹과 동일한 지수 보간: t = 1 - damping^dt (프레임레이트 무관)
            _camPos = Vector3.Lerp(_camPos, desired, 1f - Mathf.Pow(posDamping, dt));
            _lookAt = Vector3.Lerp(_lookAt, lookTarget, 1f - Mathf.Pow(lookDamping, dt));

            transform.position = _camPos;
            transform.rotation = Quaternion.LookRotation((_lookAt - _camPos).normalized, up);
        }
    }
}
