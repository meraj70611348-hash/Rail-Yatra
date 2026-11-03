const KEY = 'railyatra_save_v1';
export const SAVE_VERSION = 1;

export function newSave(playerName = 'Yatri') {
  return {
    version: SAVE_VERSION,
    playerName,
    pos: { x: 0, y: 0, z: 14 },
    yaw: Math.PI,       // player facing
    camYaw: 0,
    gameMinutes: 8 * 60,
    money: 5000,        // rupees
    cityId: 'start_city',
    savedAt: null,
  };
}

/** localStorage JSON save. Every call is wrapped: private mode / full storage must never crash the game. */
export const SaveSystem = {
  has() {
    try { return localStorage.getItem(KEY) !== null; } catch { return false; }
  },

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return null;
      return migrate({ ...newSave(), ...data });
    } catch (e) {
      console.error('[RailYatra] load failed', e);
      return null;
    }
  },

  save(data) {
    try {
      data.savedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[RailYatra] save failed', e);
      return false;
    }
  },

  delete() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  },
};

function migrate(data) {
  // Future phases: upgrade older save versions here.
  data.version = SAVE_VERSION;
  return data;
}
