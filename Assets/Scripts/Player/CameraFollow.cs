using UnityEngine;
using UnityEngine.EventSystems;

namespace RailYatra.Player
{
    /// <summary>
    /// Third-person orbit camera. Desktop: hold right mouse button and move to look around,
    /// scroll to zoom. Mobile: drag a finger on the right half of the screen.
    /// </summary>
    public class CameraFollow : MonoBehaviour
    {
        public Transform target;
        public Vector3 targetOffset = new Vector3(0f, 1.6f, 0f);

        [Header("Distance")]
        public float distance = 5f;
        public float minDistance = 2f;
        public float maxDistance = 9f;

        [Header("Look")]
        public float mouseSensitivity = 3f;
        public float touchSensitivity = 0.15f;
        public float minPitch = -10f;
        public float maxPitch = 60f;
        public float smoothing = 12f;

        [Header("Collision")]
        public LayerMask collisionMask = ~0;
        public float collisionRadius = 0.25f;

        float _yaw;
        float _pitch = 20f;
        int _lookFingerId = -1;

        void Start()
        {
            if (target != null) _yaw = target.eulerAngles.y;
        }

        void LateUpdate()
        {
            if (target == null) return;

            ReadLookInput();

            Quaternion rot = Quaternion.Euler(_pitch, _yaw, 0f);
            Vector3 focus = target.position + targetOffset;
            Vector3 desired = focus - rot * Vector3.forward * distance;

            // Pull the camera in if something (a wall, a pillar) is in the way.
            Vector3 dir = desired - focus;
            if (Physics.SphereCast(focus, collisionRadius, dir.normalized, out RaycastHit hit,
                                   dir.magnitude, collisionMask, QueryTriggerInteraction.Ignore))
            {
                desired = focus + dir.normalized * Mathf.Max(0.5f, hit.distance - 0.1f);
            }

            transform.position = Vector3.Lerp(transform.position, desired, 1f - Mathf.Exp(-smoothing * Time.deltaTime));
            transform.rotation = Quaternion.LookRotation(focus - transform.position);
        }

        void ReadLookInput()
        {
            // Desktop
            if (Input.GetMouseButton(1))
            {
                _yaw += Input.GetAxis("Mouse X") * mouseSensitivity;
                _pitch -= Input.GetAxis("Mouse Y") * mouseSensitivity;
            }
            distance = Mathf.Clamp(distance - Input.mouseScrollDelta.y * 0.5f, minDistance, maxDistance);

            // Mobile: right half of the screen, ignoring touches that start on UI (joystick, buttons)
            for (int i = 0; i < Input.touchCount; i++)
            {
                Touch t = Input.GetTouch(i);
                if (t.phase == TouchPhase.Began)
                {
                    bool onUi = EventSystem.current != null && EventSystem.current.IsPointerOverGameObject(t.fingerId);
                    if (!onUi && t.position.x > Screen.width * 0.5f && _lookFingerId == -1)
                        _lookFingerId = t.fingerId;
                }
                else if (t.fingerId == _lookFingerId)
                {
                    if (t.phase == TouchPhase.Moved)
                    {
                        _yaw += t.deltaPosition.x * touchSensitivity;
                        _pitch -= t.deltaPosition.y * touchSensitivity;
                    }
                    else if (t.phase == TouchPhase.Ended || t.phase == TouchPhase.Canceled)
                    {
                        _lookFingerId = -1;
                    }
                }
            }

            _pitch = Mathf.Clamp(_pitch, minPitch, maxPitch);
        }
    }
}
