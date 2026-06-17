using UnityEngine;

namespace LittlePrince
{
    /// <summary>
    /// 어린왕자 캐릭터: 구 표면을 중력 정렬로 걷는다. (웹 Prince.tsx 이동 로직 이식)
    /// 입력은 MoveInput/TurnInput(-1..1)으로 주입한다.
    ///   · UI 조이스틱이 매 프레임 이 값을 세팅하거나,
    ///   · useLegacyInput 이 켜져 있으면 키보드(WASD/화살표)가 더해진다.
    /// 캐릭터 모델은 +Z 를 전방, +Y 를 위로 보도록 자식에 둔다.
    /// </summary>
    public class PlanetWalker : MonoBehaviour
    {
        [Header("이동 속도")]
        [Tooltip("걷기 속도 (라디안/초)")] public float walkSpeed = 0.9f;
        [Tooltip("회전 속도 (라디안/초)")] public float turnSpeed = 1.8f;
        [Tooltip("발이 표면에 닿는 높이 오프셋")] public float charHeight = 0f;

        [Header("통통 튀는 느낌(bob)")]
        public float bobAmount = 0.04f;
        public float bobSpeed = 9f;

        [Header("입력")]
        public bool useLegacyInput = true;
        [Tooltip("좌우가 반대로 느껴지면 체크")] public bool invertTurn = false;
        [Tooltip("앞뒤가 반대로 느껴지면 체크")] public bool invertWalk = false;

        [Range(-1f, 1f)] public float MoveInput;  // 앞(+)/뒤(-)
        [Range(-1f, 1f)] public float TurnInput;   // 좌(-)/우(+)

        // 카메라/배치 등 외부에서 읽는 상태
        public Vector3 SurfaceDir { get; private set; } = Vector3.up;
        public float Heading { get; private set; }

        float _bob;

        void Update()
        {
            float dt = Mathf.Min(Time.deltaTime, 0.05f);

            float move = MoveInput;
            float turn = TurnInput;
            if (useLegacyInput)
            {
                move += Input.GetAxis("Vertical");
                turn += Input.GetAxis("Horizontal");
            }
            move = Mathf.Clamp(move, -1f, 1f) * (invertWalk ? -1f : 1f);
            turn = Mathf.Clamp(turn, -1f, 1f) * (invertTurn ? -1f : 1f);

            // 회전
            Heading += turn * turnSpeed * dt;

            // 이동
            bool moving = Mathf.Abs(move) > 0.05f;
            if (moving)
            {
                SurfaceDir = SphereMath.MoveOnSphere(SurfaceDir, Heading, move * walkSpeed * dt);
                _bob += dt * bobSpeed;
            }

            // 배치 + 자세 (+ 걸을 때 살짝 통통)
            Vector3 up = SurfaceDir;
            Vector3 surfacePos = SurfaceDir * (SphereMath.PlanetRadius + charHeight);
            float bob = moving ? Mathf.Abs(Mathf.Sin(_bob)) * bobAmount : 0f;

            transform.SetPositionAndRotation(
                surfacePos + up * bob,
                SphereMath.SurfaceRotation(SurfaceDir, Heading));
        }
    }
}
