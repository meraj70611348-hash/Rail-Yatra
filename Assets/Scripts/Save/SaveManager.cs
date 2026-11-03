using UnityEngine;
using RailYatra.Core;
using RailYatra.Player;

namespace RailYatra.Save
{
    /// <summary>
    /// Owns the current SaveData at runtime. Loads on start, autosaves every N seconds,
    /// and saves when the app is paused/closed (important on Android).
    /// Put one in your first scene and assign the Player + GameClock.
    /// </summary>
    public class SaveManager : MonoBehaviour
    {
        public static SaveManager Instance { get; private set; }

        public PlayerController player;
        public GameClock clock;
        public float autosaveSeconds = 60f;
        public bool loadOnStart = true;

        public SaveData Current { get; private set; }

        float _timer;

        void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
        }

        void Start()
        {
            if (loadOnStart && SaveSystem.HasSave())
                LoadGame();
            else
                NewGame();
        }

        void Update()
        {
            _timer += Time.unscaledDeltaTime;
            if (_timer >= autosaveSeconds)
            {
                _timer = 0f;
                SaveGame();
            }
        }

        public void NewGame(string playerName = "Yatri")
        {
            Current = SaveData.NewGame(playerName);
            if (clock != null) clock.SetTime(Current.gameMinutes);
        }

        public void SaveGame()
        {
            if (Current == null) Current = SaveData.NewGame();

            if (player != null)
            {
                Vector3 p = player.transform.position;
                Current.posX = p.x; Current.posY = p.y; Current.posZ = p.z;
                Current.yaw = player.transform.eulerAngles.y;
            }
            if (clock != null) Current.gameMinutes = clock.TotalMinutes;

            if (SaveSystem.Save(Current))
                Debug.Log($"[RailYatra] Saved to {SaveSystem.FilePath}");
        }

        public void LoadGame()
        {
            Current = SaveSystem.Load() ?? SaveData.NewGame();

            if (player != null)
                player.TeleportTo(new Vector3(Current.posX, Current.posY, Current.posZ), Current.yaw);
            if (clock != null) clock.SetTime(Current.gameMinutes);
        }

        // ----- Money helpers (used later by ticket booking, shops, jobs) -----
        public bool TrySpend(int rupees)
        {
            if (Current == null || rupees < 0 || Current.money < rupees) return false;
            Current.money -= rupees;
            return true;
        }

        public void AddMoney(int rupees)
        {
            if (Current != null && rupees > 0) Current.money += rupees;
        }

        void OnApplicationPause(bool paused) { if (paused) SaveGame(); }
        void OnApplicationQuit() { SaveGame(); }
    }
}
