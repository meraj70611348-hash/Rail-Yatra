import * as THREE from 'three';

const WALK = 3.5;
const RUN = 6.5;
const RADIUS = 0.35;
const GRAVITY = -20;
const JUMP_V = 5.5;
const WORLD_LIMIT = 180;

function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * Math.min(1, t);
}

export class Player {
  constructor() {
    this.group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 0.9, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0xff9933, roughness: 0.7 }),
    );
    body.position.y = 0.75;
    body.castShadow = true;

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.8 }),
    );
    head.position.y = 1.62;
    head.castShadow = true;

    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x138808 }),
    );
    nose.position.set(0, 1.62, 0.2); // front of the model = +Z

    this.group.add(body, head, nose);

    this.pos = this.group.position; // feet position
    this.yaw = Math.PI;
    this.vy = 0;
    this.grounded = true;
    this.locked = false; // lock input while a menu / ticket counter is open
  }

  teleport(x, y, z, yaw) {
    this.pos.set(x, y, z);
    this.yaw = yaw;
    this.vy = 0;
    this.group.rotation.y = yaw;
  }

  /**
   * @param {number} dt seconds
   * @param {{x:number,y:number,run:boolean}} move
   * @param {number} camYaw camera yaw (moves are camera-relative)
   * @param {boolean} jump
   * @param {Array} colliders world AABBs
   */
  update(dt, move, camYaw, jump, colliders) {
    if (this.locked) { move = { x: 0, y: 0, run: false }; jump = false; }

    const mag = Math.hypot(move.x, move.y);
    if (mag > 0.05) {
      // Camera sits at +yaw behind the player, so "forward" is (-sin, -cos).
      const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw);
      const rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
      const dx = fx * move.y + rx * move.x;
      const dz = fz * move.y + rz * move.x;
      const len = Math.hypot(dx, dz) || 1;
      const speed = (move.run ? RUN : WALK) * Math.min(1, mag);
      this.pos.x += (dx / len) * speed * dt;
      this.pos.z += (dz / len) * speed * dt;
      this.yaw = lerpAngle(this.yaw, Math.atan2(dx, dz), dt * 12);
    }

    if (this.grounded && jump) { this.vy = JUMP_V; this.grounded = false; }
    this.vy += GRAVITY * dt;
    this.pos.y += this.vy * dt;
    if (this.pos.y <= 0) { this.pos.y = 0; this.vy = 0; this.grounded = true; }

    this.collide(colliders);
    this.pos.x = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, this.pos.x));
    this.pos.z = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, this.pos.z));
    this.group.rotation.y = this.yaw;
  }

  /** Circle (player) vs AABB (building) resolution; ignored when standing above the box. */
  collide(colliders) {
    const p = this.pos;
    for (const b of colliders) {
      if (p.y >= b.height - 0.1) continue;
      const cx = Math.max(b.minX, Math.min(p.x, b.maxX));
      const cz = Math.max(b.minZ, Math.min(p.z, b.maxZ));
      const dx = p.x - cx, dz = p.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= RADIUS * RADIUS) continue;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        const push = RADIUS - d;
        p.x += (dx / d) * push;
        p.z += (dz / d) * push;
      } else {
        // Centre is inside the box: push out through the nearest face.
        const l = p.x - b.minX, r = b.maxX - p.x, t = p.z - b.minZ, bt = b.maxZ - p.z;
        const m = Math.min(l, r, t, bt);
        if (m === l) p.x = b.minX - RADIUS;
        else if (m === r) p.x = b.maxX + RADIUS;
        else if (m === t) p.z = b.minZ - RADIUS;
        else p.z = b.maxZ + RADIUS;
      }
    }
  }
}
