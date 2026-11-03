/**
 * In-game clock. Trains, Tatkal windows, shop timings and NPC schedules read this.
 * Default: 1 real second = 1 game minute (a full day in 24 real minutes).
 */
export class GameClock {
  constructor() {
    this.totalMinutes = 8 * 60; // Day 1, 08:00
    this.minutesPerSecond = 1;
    this.paused = false;
  }

  update(dt) {
    if (!this.paused) this.totalMinutes += dt * this.minutesPerSecond;
  }

  get day() { return Math.floor(this.totalMinutes / 1440) + 1; }
  get hour() { return Math.floor((this.totalMinutes % 1440) / 60); }
  get minute() { return Math.floor(this.totalMinutes % 60); }
  get minuteOfDay() { return Math.floor(this.totalMinutes % 1440); }

  /** 0 (night) .. 1 (full day). Sun rises ~06:00, peaks 12:00, sets ~18:00. */
  get daylight() {
    const h = (this.totalMinutes % 1440) / 60;
    const s = Math.sin(((h - 6) / 24) * Math.PI * 2);
    return Math.min(1, Math.max(0, s * 1.6 + 0.15));
  }

  timeString() {
    return `${String(this.hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`;
  }
}
