import * as THREE from 'three';

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY_SKY = new THREE.Color(0x87ceeb);
const NIGHT_SKY = new THREE.Color(0x050a18);
const DUSK_SKY = new THREE.Color(0xff9a5c);

/**
 * P1 test world: ground, two roads and a seeded block of buildings so movement,
 * collisions and the day/night cycle can be tested. Replaced by the real city in P2.
 */
export class World {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = DAY_SKY.clone();
    this.scene.fog = new THREE.Fog(0x87ceeb, 60, 260);
    this.colliders = [];

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 0.9);
    this.sun = new THREE.DirectionalLight(0xfff2d6, 1.1);
    this.sun.position.set(60, 100, 40);
    this.scene.add(this.hemi, this.sun);

    this.buildGround();
    this.buildBuildings();
  }

  buildGround() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#3f7d3a'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#3a7435'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(90, 90);
    tex.colorSpace = THREE.SRGBColorSpace;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2e, roughness: 0.95 });
    const roadA = new THREE.Mesh(new THREE.PlaneGeometry(400, 10), roadMat);
    const roadB = new THREE.Mesh(new THREE.PlaneGeometry(10, 400), roadMat);
    roadA.rotation.x = roadB.rotation.x = -Math.PI / 2;
    roadA.position.y = roadB.position.y = 0.02;
    this.scene.add(roadA, roadB);
  }

  buildBuildings() {
    const rand = mulberry32(2026);
    const palette = [0xd9c8a9, 0xc7b299, 0xe3d5b8, 0xb8c4cf, 0xd8a7a0, 0xa9c4a0, 0xe0cda8];
    const step = 26;
    for (let gx = -150; gx <= 150; gx += step) {
      for (let gz = -150; gz <= 150; gz += step) {
        if (Math.abs(gx) < 14 || Math.abs(gz) < 14) continue; // keep roads clear
        if (rand() < 0.2) continue;
        const w = 9 + rand() * 8;
        const d = 9 + rand() * 8;
        const h = 6 + rand() * 26;
        const x = gx + (rand() - 0.5) * 4;
        const z = gz + (rand() - 0.5) * 4;

        const m = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color: palette[Math.floor(rand() * palette.length)], roughness: 0.9 }),
        );
        m.position.set(x, h / 2, z);
        this.scene.add(m);
        this.colliders.push({
          minX: x - w / 2, maxX: x + w / 2,
          minZ: z - d / 2, maxZ: z + d / 2,
          height: h,
        });
      }
    }
  }

  /** Day/night: sky, fog and light follow the in-game clock. */
  updateDaylight(daylight, hour) {
    const sky = NIGHT_SKY.clone().lerp(DAY_SKY, daylight);
    const nearDusk = (hour >= 5 && hour < 8) || (hour >= 17 && hour < 20);
    if (nearDusk) sky.lerp(DUSK_SKY, 0.35 * (1 - Math.abs(daylight - 0.5) * 2));
    this.scene.background.copy(sky);
    this.scene.fog.color.copy(sky);
    this.hemi.intensity = 0.25 + 0.65 * daylight;
    this.sun.intensity = 0.1 + 1.0 * daylight;
  }
}
