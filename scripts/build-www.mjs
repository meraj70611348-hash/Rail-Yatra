// Builds ./www for Capacitor: copies the game and swaps the CDN copy of Three.js for the npm one,
// so the APK works offline.
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';

const OUT = 'www';
const THREE = 'node_modules/three/build/three.module.js';
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

if (!existsSync(THREE)) throw new Error('three is not installed. Run "npm install" first.');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/libs`, { recursive: true });
cpSync('css', `${OUT}/css`, { recursive: true });
cpSync('js', `${OUT}/js`, { recursive: true });
cpSync(THREE, `${OUT}/libs/three.module.js`);

let html = readFileSync('index.html', 'utf8');
if (!html.includes(CDN)) throw new Error('Three.js CDN URL not found in index.html (importmap changed?)');
html = html.replace(CDN, './libs/three.module.js');
writeFileSync(`${OUT}/index.html`, html);
console.log('www/ ready');
