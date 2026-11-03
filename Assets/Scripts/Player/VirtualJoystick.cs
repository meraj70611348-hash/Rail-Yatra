using UnityEngine;
using UnityEngine.EventSystems;

namespace RailYatra.Player
{
    /// <summary>On-screen joystick for mobile. Attach to the joystick background Image;
    /// assign the child "handle" RectTransform.</summary>
    public class VirtualJoystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        public RectTransform background;
        public RectTransform handle;
        public float radius = 90f;

        public Vector2 Value { get; private set; }
        public bool IsHeld { get; private set; }

        void Reset()
        {
            background = transform as RectTransform;
        }

        public void OnPointerDown(PointerEventData e)
        {
            IsHeld = true;
            OnDrag(e);
        }

        public void OnDrag(PointerEventData e)
        {
            if (background == null) return;
            RectTransformUtility.ScreenPointToLocalPointInRectangle(
                background, e.position, e.pressEventCamera, out Vector2 local);
            Vector2 clamped = Vector2.ClampMagnitude(local, radius);
            Value = clamped / radius;
            if (handle != null) handle.anchoredPosition = clamped;
        }

        public void OnPointerUp(PointerEventData e)
        {
            IsHeld = false;
            Value = Vector2.zero;
            if (handle != null) handle.anchoredPosition = Vector2.zero;
        }
    }
}
