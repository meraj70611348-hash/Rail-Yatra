using UnityEngine;

namespace RailYatra.Core
{
    /// <summary>
    /// In-game clock. Trains, Tatkal windows, shop timings and NPC schedules will all read this.
    /// Default: 1 real second = 1 game minute (a full day in 24 real minutes).
    /// </summary>
    public class GameClock : MonoBehaviour
    {
        public static GameClock Instance { get; private set; }

        [Tooltip("Game minutes that pass per real second.")]
        public float minutesPerRealSecond = 1f;

        /// <summary>Total game minutes since Day 1, 00:00.</summary>
        public double TotalMinutes { get; private set; }

        public int Day => (int)(TotalMinutes / 1440.0) + 1;
        public int Hour => (int)(TotalMinutes % 1440.0 / 60.0);
        public int Minute => (int)(TotalMinutes % 60.0);
        public int MinuteOfDay => (int)(TotalMinutes % 1440.0);

        public bool Paused { get; set; }

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            if (TotalMinutes <= 0) TotalMinutes = 8 * 60; // new game starts Day 1, 08:00
        }

        void Update()
        {
            if (!Paused) TotalMinutes += Time.deltaTime * minutesPerRealSecond;
        }

        public void SetTime(double totalMinutes) => TotalMinutes = totalMinutes;

        public string TimeString() => $"{Hour:00}:{Minute:00}";
    }
}
