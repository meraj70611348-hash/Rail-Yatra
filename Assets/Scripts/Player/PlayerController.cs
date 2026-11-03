using UnityEngine;

namespace RailYatra.Player
{
    /// <summary>
    /// Third-person walk/run controller. Works with keyboard (WASD + Shift + Space)
    /// and the on-screen VirtualJoystick for mobile.
    /// Requires Project Settings > Player > Active Input Handling = "Both" (or old Input Manager).
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        public float walkSpeed = 3.5f;
        public float runSpeed = 6.5f;
        public float turnSmoothTime = 0.1f;
        public float gravity = -20f;
        public float jumpHeight = 1.1f;

        [Header("References")]
        public Transform cameraTransform;
        public VirtualJoystick joystick;   // optional (mobile)

        /// <summary>Lock input while a UI/menu/ticket counter is open.</summary>
        public bool InputLocked { get; set; }

        CharacterController _cc;
        float _turnVelocity;
        float _verticalVelocity;

        void Awake()
        {
            _cc = GetComponent<CharacterController>();
            if (cameraTransform == null && Camera.main != null)
                cameraTransform = Camera.main.transform;
        }

        void Update()
        {
            Vector2 input = InputLocked ? Vector2.zero : ReadMoveInput();
            bool running = !InputLocked &&
                           (Input.GetKey(KeyCode.LeftShift) || (joystick != null && input.magnitude > 0.85f));

            Vector3 move = Vector3.zero;
            if (input.sqrMagnitude > 0.01f)
            {
                float camYaw = cameraTransform != null ? cameraTransform.eulerAngles.y : 0f;
                float targetAngle = Mathf.Atan2(input.x, input.y) * Mathf.Rad2Deg + camYaw;
                float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle,
                                                    ref _turnVelocity, turnSmoothTime);
                transform.rotation = Quaternion.Euler(0f, angle, 0f);

                Vector3 dir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
                float speed = running ? runSpeed : walkSpeed;
                move = dir.normalized * (speed * Mathf.Clamp01(input.magnitude));
            }

            if (_cc.isGrounded && _verticalVelocity < 0f)
            {
                _verticalVelocity = -2f;
                if (!InputLocked && Input.GetKeyDown(KeyCode.Space))
                    _verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);
            }
            _verticalVelocity += gravity * Time.deltaTime;
            move.y = _verticalVelocity;

            _cc.Move(move * Time.deltaTime);
        }

        Vector2 ReadMoveInput()
        {
            Vector2 kb = new Vector2(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
            if (joystick != null && joystick.Value.sqrMagnitude > 0.01f)
                return Vector2.ClampMagnitude(joystick.Value, 1f);
            return Vector2.ClampMagnitude(kb, 1f);
        }

        /// <summary>Teleport safely (CharacterController must be disabled while setting position).</summary>
        public void TeleportTo(Vector3 position, float yaw)
        {
            _cc.enabled = false;
            transform.SetPositionAndRotation(position, Quaternion.Euler(0f, yaw, 0f));
            _cc.enabled = true;
            _verticalVelocity = 0f;
        }
    }
}
