import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Third-person orbit camera. yaw/pitch are driven by drag; zoom by wheel. */
export class FollowCamera {
  constructor(aspect) {
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 700);
    this.yaw = 0;
    this.pitch = 0.35;   // radians above the horizon
    this.dist = 6;
    this._focus = new THREE.Vector3();
    this._desired = new THREE.Vector3();
    this.camera.position.set(0, 4, 20);
  }

  resize(aspect) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(target, look, dt, snap = false) {
    this.yaw -= look.dx * 0.005;
    this.pitch = clamp(this.pitch + look.dy * 0.005, -0.05, 1.25);
    this.dist = clamp(this.dist + look.zoom * 0.6, 3, 12);

    this._focus.set(target.x, target.y + 1.5, target.z);
    const cp = Math.cos(this.pitch);
    this._desired.set(
      this._focus.x + Math.sin(this.yaw) * cp * this.dist,
      this._focus.y + Math.sin(this.pitch) * this.dist,
      this._focus.z + Math.cos(this.yaw) * cp * this.dist,
    );
    this._desired.y = Math.max(this._desired.y, 0.5);

    if (snap) this.camera.position.copy(this._desired);
    else this.camera.position.lerp(this._desired, 1 - Math.exp(-14 * dt));
    this.camera.lookAt(this._focus);
  }
}
