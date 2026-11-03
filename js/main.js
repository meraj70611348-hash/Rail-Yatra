import * as THREE from 'three';
import { GameClock } from './core/clock.js';
import { SaveSystem, newSave } from './core/save.js';
import { Input } from './core/input.js';
import { World } from './game/world.js';
import { Player } from './game/player.js';
import { FollowCamera } from './game/camera.js';

const $ = (id) => document.getElementById(id);

const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);

const world = new World();
const player = new Player();
world.scene.add(player.group);
const cam = new FollowCamera(innerWidth / innerHeight);
const clock = new GameClock();
const input = new Input(canvas, {
  joyBase: $('joyBase'), joyKnob: $('joyKnob'), run: $('btnRun'), jump: $('btnJump'),
});

let state = null;      // current save data
let playing = false;

// ---------- Save helpers ----------
function writeStateFromWorld() {
  state.pos = { x: player.pos.x, y: player.pos.y, z: player.pos.z };
  state.yaw = player.yaw;
  state.camYaw = cam.yaw;
  state.gameMinutes = clock.totalMinutes;
}

function saveNow(showToast = false) {
  if (!state) return;
  writeStateFromWorld();
  const ok = SaveSystem.save(state);
  if (showToast) toast(ok ? 'Game saved' : 'Save failed');
}

let toastTimer = 0;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}

// ---------- Start / menu ----------
function startGame(save) {
  state = save;
  player.teleport(state.pos.x, state.pos.y, state.pos.z, state.yaw);
  cam.yaw = state.camYaw;
  clock.totalMinutes = state.gameMinutes;
  cam.update(player.pos, { dx: 0, dy: 0, zoom: 0 }, 0, true);

  $('menu').hidden = true;
  $('hud').hidden = false;
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  $('touchBtns').hidden = !touch;
  input.reset();
  input.enabled = true;
  playing = true;
  saveNow();
}

function showMenu() {
  playing = false;
  input.enabled = false;
  input.reset();
  $('btnContinue').hidden = !SaveSystem.has();
  $('menu').hidden = false;
  $('hud').hidden = true;
  $('touchBtns').hidden = true;
}

$('btnNew').addEventListener('click', () => startGame(newSave()));
$('btnContinue').addEventListener('click', () => {
  const s = SaveSystem.load();
  if (!s) {
    const e = $('loadErr');
    e.textContent = 'Save file nahi mili ya kharab hai. New Game shuru karo.';
    e.hidden = false;
    $('btnContinue').hidden = true;
    return;
  }
  startGame(s);
});
$('btnSave').addEventListener('click', () => saveNow(true));

// Autosave: every 30s, and whenever the tab is hidden / closed (phones kill tabs without warning).
setInterval(() => { if (playing) saveNow(); }, 30000);
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) saveNow(); });
addEventListener('pagehide', () => { if (playing) saveNow(); });

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  cam.resize(innerWidth / innerHeight);
});

// ---------- Main loop ----------
let last = performance.now();
let hudTimer = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (playing) {
    clock.update(dt);
    const look = input.consumeLook();
    player.update(dt, input.getMove(), cam.yaw, input.consumeJump(), world.colliders);
    cam.update(player.pos, look, dt);
    world.updateDaylight(clock.daylight, clock.hour);

    hudTimer += dt;
    if (hudTimer > 0.25) {
      hudTimer = 0;
      $('hudTime').textContent = `Day ${clock.day} · ${clock.timeString()}`;
      $('hudMoney').textContent = `₹${state.money}`;
    }
  }
  renderer.render(world.scene, cam.camera);
}

showMenu();
requestAnimationFrame(frame);
