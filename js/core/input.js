const JOY_RADIUS = 60;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/**
 * Unified input: keyboard (WASD/arrows, Shift, Space), mouse drag to look, wheel to zoom,
 * touch: dynamic joystick on the left half, look-drag on the right half, Run/Jump buttons.
 */
export class Input {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui; // { joyBase, joyKnob, run, jump }
    this.enabled = false;

    this.keys = new Set();
    this.joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
    this.lookId = null;
    this.lastX = 0;
    this.lastY = 0;
    this.lookDX = 0;
    this.lookDY = 0;
    this.zoom = 0;
    this.runToggle = false;
    this.jumpQueued = false;

    addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      this.keys.add(e.code);
      if (e.code === 'Space') { this.jumpQueued = true; e.preventDefault(); }
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    canvas.addEventListener('pointermove', (e) => this.onMove(e));
    canvas.addEventListener('pointerup', (e) => this.onUp(e));
    canvas.addEventListener('pointercancel', (e) => this.onUp(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => { this.zoom += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });

    ui.run.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.runToggle = !this.runToggle;
      ui.run.classList.toggle('on', this.runToggle);
    });
    ui.jump.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.jumpQueued = true; });
  }

  onDown(e) {
    if (!this.enabled) return;
    try { this.canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    const isTouch = e.pointerType === 'touch';
    if (isTouch && e.clientX < innerWidth * 0.5 && this.joy.id === null) {
      this.joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0 };
      const { joyBase, joyKnob } = this.ui;
      joyBase.style.left = `${e.clientX - 60}px`;
      joyBase.style.top = `${e.clientY - 60}px`;
      joyKnob.style.transform = 'translate(0px,0px)';
      joyBase.hidden = false;
    } else if (this.lookId === null) {
      this.lookId = e.pointerId;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  }

  onMove(e) {
    if (e.pointerId === this.joy.id) {
      const dx = e.clientX - this.joy.ox;
      const dy = e.clientY - this.joy.oy;
      const len = Math.hypot(dx, dy) || 1;
      const m = Math.min(len, JOY_RADIUS);
      const nx = (dx / len) * m;
      const ny = (dy / len) * m;
      this.joy.x = nx / JOY_RADIUS;
      this.joy.y = -ny / JOY_RADIUS; // screen up = forward
      this.ui.joyKnob.style.transform = `translate(${nx}px,${ny}px)`;
    } else if (e.pointerId === this.lookId) {
      this.lookDX += e.clientX - this.lastX;
      this.lookDY += e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  }

  onUp(e) {
    if (e.pointerId === this.joy.id) {
      this.joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
      this.ui.joyBase.hidden = true;
    }
    if (e.pointerId === this.lookId) this.lookId = null;
  }

  /** @returns {{x:number,y:number,run:boolean}} x: right(+), y: forward(+) */
  getMove() {
    const k = this.keys;
    let x = 0, y = 0;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (k.has('KeyW') || k.has('ArrowUp')) y += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) y -= 1;
    if (this.joy.id !== null) { x += this.joy.x; y += this.joy.y; }
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    const run = k.has('ShiftLeft') || k.has('ShiftRight') || this.runToggle ||
      (this.joy.id !== null && Math.hypot(this.joy.x, this.joy.y) > 0.9);
    return { x: clamp(x, -1, 1), y: clamp(y, -1, 1), run };
  }

  consumeLook() {
    const r = { dx: this.lookDX, dy: this.lookDY, zoom: this.zoom };
    this.lookDX = this.lookDY = this.zoom = 0;
    return r;
  }

  consumeJump() {
    const j = this.jumpQueued;
    this.jumpQueued = false;
    return j;
  }

  reset() {
    this.keys.clear();
    this.joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
    this.lookId = null;
    this.lookDX = this.lookDY = this.zoom = 0;
    this.jumpQueued = false;
    this.ui.joyBase.hidden = true;
  }
}
