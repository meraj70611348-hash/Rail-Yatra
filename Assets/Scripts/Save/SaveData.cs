using System;

namespace RailYatra.Save
{
    /// <summary>Everything that gets written to disk. Add new fields in later phases and bump Version.</summary>
    [Serializable]
    public class SaveData
    {
        public const int CurrentVersion = 1;

        public int version = CurrentVersion;
        public string playerName = "Yatri";
        public string saveTimeUtc;

        // Player
        public float posX, posY, posZ;
        public float yaw;

        // World
        public double gameMinutes = 8 * 60;
        public string cityId = "start_city";

        // Economy (rupees)
        public int money = 5000;

        public static SaveData NewGame(string playerName = "Yatri")
        {
            return new SaveData { playerName = playerName };
        }
    }
}
