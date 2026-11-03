using System;
using System.IO;
using UnityEngine;

namespace RailYatra.Save
{
    /// <summary>Static JSON save/load. File lives in Application.persistentDataPath (works on Android).</summary>
    public static class SaveSystem
    {
        const string FileName = "railyatra_save.json";

        public static string FilePath => Path.Combine(Application.persistentDataPath, FileName);

        public static bool HasSave() => File.Exists(FilePath);

        public static bool Save(SaveData data)
        {
            try
            {
                data.saveTimeUtc = DateTime.UtcNow.ToString("o");
                string json = JsonUtility.ToJson(data, true);

                // Write to a temp file first so a crash mid-write never corrupts the real save.
                string tmp = FilePath + ".tmp";
                File.WriteAllText(tmp, json);
                if (File.Exists(FilePath)) File.Delete(FilePath);
                File.Move(tmp, FilePath);
                return true;
            }
            catch (Exception e)
            {
                Debug.LogError($"[RailYatra] Save failed: {e.Message}");
                return false;
            }
        }

        public static SaveData Load()
        {
            try
            {
                if (!HasSave()) return null;
                string json = File.ReadAllText(FilePath);
                SaveData data = JsonUtility.FromJson<SaveData>(json);
                if (data == null) return null;
                Migrate(data);
                return data;
            }
            catch (Exception e)
            {
                Debug.LogError($"[RailYatra] Load failed: {e.Message}");
                return null;
            }
        }

        public static void Delete()
        {
            if (HasSave()) File.Delete(FilePath);
        }

        static void Migrate(SaveData data)
        {
            // Future phases: upgrade old versions here.
            data.version = SaveData.CurrentVersion;
        }
    }
}
