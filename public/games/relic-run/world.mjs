import * as THREE from './vendor/three.module.js';
import {RUN_LENGTH} from './logic.mjs';

// Original procedural scenery. All measurements are in metres; the playable
// corridor is x = [-3.3, 3.3], y = 0. The camera belongs to the game controller.
const CHUNK = 48;
const CHUNKS = 5;
const LOOP = CHUNK * CHUNKS;
const TAU = Math.PI * 2;
const PRESETS = {
  egypt: {
    fog: {color: '#dec49b', near: 34, far: 172}, sky: '#d8c6aa',
    sunColor: '#fff0cd', sunPosition: [-38, 29, -62], sunIntensity: 3.2,
    ambientColor: '#c5d8e1', groundColor: '#987246', exposure: 1.04,
    stone: '#bfa57b', trim: '#d5c29c', road: '#b69e79', dark: '#635139',
    foliage: '#777f4a', roughness: 0.91,
  },
  khmer: {
    fog: {color: '#7b9690', near: 25, far: 150}, sky: '#b6c5b2',
    sunColor: '#fff1c1', sunPosition: [-22, 38, -51], sunIntensity: 2.8,
    ambientColor: '#b7d0c7', groundColor: '#334b3c', exposure: 1.08,
    stone: '#7d8070', trim: '#93927e', road: '#777c6c', dark: '#333d32',
    foliage: '#325b35', roughness: 0.7,
  },
  maya: {
    fog: {color: '#b09a97', near: 40, far: 175}, sky: '#d3a6a0',
    sunColor: '#ffca92', sunPosition: [44, 23, -55], sunIntensity: 3,
    ambientColor: '#b7c8d3', groundColor: '#414e36', exposure: 1.06,
    stone: '#9a9581', trim: '#c2b59c', road: '#9e9785', dark: '#44473b',
    foliage: '#2e6038', roughness: 0.85,
  },
  wall: {
    fog: {color: '#aebdc4', near: 35, far: 185}, sky: '#c5d4dc',
    sunColor: '#ffefd3', sunPosition: [-48, 24, -70], sunIntensity: 2.8,
    ambientColor: '#c7d9e5', groundColor: '#657a67', exposure: 1.03,
    stone: '#8c8d83', trim: '#b4b1a0', road: '#96968b', dark: '#414a44',
    foliage: '#536c58', roughness: 0.9,
  },
  castle: {
    fog: {color: '#17283e', near: 20, far: 155}, sky: '#111d31',
    sunColor: '#b4d4ff', sunPosition: [-36, 36, -58], sunIntensity: 2.1,
    ambientColor: '#91a9ce', groundColor: '#25334a', exposure: 1.08,
    stone: '#626b79', trim: '#8e98a5', road: '#596474', dark: '#1f2a39',
    foliage: '#253b47', roughness: 0.54,
  },
};

function random(seed) {
  let n = seed >>> 0;
  return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
}
function canvas(size) {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = c.height = size; return c;
  }
  return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(size, size) : null;
}
function colorRGB(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function stoneMaps(base, size, seed, {road = false, moss = false} = {}) {
  const c = canvas(size), h = canvas(size), r = canvas(size);
  if (!c || !h || !r) return {map: null, bumpMap: null, roughnessMap: null};
  const ctx = c.getContext('2d'), ht = h.getContext('2d'), rt = r.getContext('2d');
  const rng = random(seed), rgb = colorRGB(base);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  ht.fillStyle = '#aaa'; ht.fillRect(0, 0, size, size);
  rt.fillStyle = '#d0d0d0'; rt.fillRect(0, 0, size, size);
  const rows = road ? 3 : 4, columns = road ? 2 : 2;
  const dy = size / rows, dx = size / columns;
  for (let row = -1; row <= rows; row++) {
    const shift = row % 2 ? dx / 2 : 0;
    for (let col = -1; col <= columns; col++) {
      const x = col * dx + shift, y = row * dy, v = 0.89 + rng() * 0.19;
      ctx.fillStyle = `rgb(${rgb.map(n => Math.min(255, Math.round(n * v))).join(',')})`;
      ctx.fillRect(x + 2, y + 2, dx - 4, dy - 4);
      ctx.strokeStyle = 'rgba(37,32,26,.36)'; ctx.lineWidth = 3;
      ctx.strokeRect(x + 1.5, y + 1.5, dx - 3, dy - 3);
      ctx.strokeStyle = 'rgba(255,245,217,.19)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 4, y + dy - 4); ctx.lineTo(x + 4, y + 4); ctx.lineTo(x + dx - 4, y + 4); ctx.stroke();
      ht.fillStyle = '#5e5e5e'; ht.fillRect(x, y, dx, dy);
      ht.fillStyle = `rgb(${160 + Math.floor(rng() * 26)},${160 + Math.floor(rng() * 26)},${160 + Math.floor(rng() * 26)})`;
      ht.fillRect(x + 3, y + 3, dx - 6, dy - 6);
      rt.fillStyle = rng() > 0.5 ? '#b5b5b5' : '#ededed'; rt.fillRect(x + 3, y + 3, dx - 6, dy - 6);
      if (rng() < 0.8) {
        let px = x + dx * rng(), py = y + dy * rng();
        ctx.strokeStyle = 'rgba(37,31,25,.3)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(px, py);
        for (let k = 0; k < 5; k++) { px += (rng() - 0.25) * dx * 0.12; py += dy * 0.12; ctx.lineTo(px, py); }
        ctx.stroke();
      }
    }
  }
  const pixels = ctx.getImageData(0, 0, size, size), height = ht.getImageData(0, 0, size, size);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const grain = (rng() - 0.5) * 16, pore = rng() < 0.018 ? -26 : 0;
    for (let ch = 0; ch < 3; ch++) {
      pixels.data[i + ch] = Math.max(0, Math.min(255, pixels.data[i + ch] + grain + pore));
      height.data[i + ch] = Math.max(0, Math.min(255, height.data[i + ch] + grain * 1.3 + pore));
    }
  }
  ctx.putImageData(pixels, 0, 0); ht.putImageData(height, 0, 0);
  if (moss) {
    for (let i = 0; i < 105; i++) {
      const x = rng() * size, y = rng() * size, radius = 3 + rng() * 25;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(49,74,30,.46)'); gradient.addColorStop(1, 'rgba(49,74,30,0)');
      ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  const make = (source, srgb) => {
    const texture = new THREE.CanvasTexture(source);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  };
  return {map: make(c, true), bumpMap: make(h, false), roughnessMap: make(r, false)};
}

// These original geometric ornaments evoke carved stone; they are not copied
// archaeological inscriptions or representations of decipherable text.
function ornamentMap(base, style, size) {
  const c = canvas(size), h = canvas(size);
  if (!c || !h) return {map: null, bumpMap: null};
  const ctx = c.getContext('2d'), ht = h.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  ht.fillStyle = '#b4b4b4'; ht.fillRect(0, 0, size, size);
  for (const [g, shade] of [[ctx, 'rgba(61,45,28,.62)'], [ht, '#656565']]) {
    g.strokeStyle = shade; g.lineWidth = size / 72; g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeRect(size * 0.08, size * 0.025, size * 0.84, size * 0.95);
    for (let row = 0; row < 6; row++) {
      const y = size * (0.1 + row * 0.15), x = size * 0.5, w = size * 0.23;
      g.beginPath();
      if (style === 'egypt') {
        if (row % 3 === 0) {
          g.ellipse(x, y, w * 0.42, w * 0.26, 0, 0, TAU);
          g.moveTo(x - w, y); g.lineTo(x - w * 0.45, y - w * 0.22); g.lineTo(x + w * 0.45, y - w * 0.22); g.lineTo(x + w, y);
          g.moveTo(x, y + w * 0.26); g.lineTo(x - w * 0.23, y + w * 0.5);
        } else if (row % 3 === 1) {
          g.moveTo(x - w, y + w * 0.3); g.quadraticCurveTo(x - w * 0.2, y - w * 0.7, x + w * 0.5, y);
          g.lineTo(x + w, y - w * 0.2); g.lineTo(x + w * 0.55, y + w * 0.3); g.lineTo(x - w, y + w * 0.3);
          g.moveTo(x - w * 0.1, y + w * 0.3); g.lineTo(x - w * 0.1, y + w * 0.6);
        } else {
          for (let k = 0; k < 3; k++) {
            const yy = y + (k - 1) * w * 0.25;
            g.moveTo(x - w, yy); for (let j = 1; j < 6; j++) g.lineTo(x - w + j * w * 0.4, yy + (j % 2 ? -w * 0.16 : 0));
          }
        }
      } else if (style === 'maya') {
        g.moveTo(x - w, y + w * 0.4); g.lineTo(x - w, y - w * 0.35); g.lineTo(x + w, y - w * 0.35);
        g.lineTo(x + w, y + w * 0.4); g.lineTo(x - w * 0.4, y + w * 0.4); g.lineTo(x - w * 0.4, y); g.lineTo(x + w * 0.45, y);
      } else {
        for (let j = 0; j < 5; j++) {
          const a = j / 5 * TAU;
          g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a - 0.4) * w, y + Math.sin(a - 0.4) * w * 0.45,
            x + Math.cos(a) * w, y + Math.sin(a) * w * 0.6);
          g.quadraticCurveTo(x + Math.cos(a + 0.4) * w, y + Math.sin(a + 0.4) * w * 0.45, x, y);
        }
      }
      g.stroke();
    }
  }
  const map = new THREE.CanvasTexture(c), bumpMap = new THREE.CanvasTexture(h);
  map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = bumpMap.anisotropy = 4;
  return {map, bumpMap};
}

function beveledBlock() {
  const s = new THREE.Shape();
  s.moveTo(-0.455, -0.455); s.lineTo(0.455, -0.455); s.lineTo(0.455, 0.455); s.lineTo(-0.455, 0.455); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 0.91, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.045, bevelSegments: 1, steps: 1, curveSegments: 1});
  g.translate(0, 0, -0.455); return g;
}
function archGeometry(width, spring, rise, thickness, depth, pointed = false) {
  const s = new THREE.Shape(), r = width / 2, outer = r + thickness;
  s.moveTo(-outer, spring);
  if (pointed) {
    s.quadraticCurveTo(-outer, spring + rise * 0.63, 0, spring + rise + thickness);
    s.quadraticCurveTo(outer, spring + rise * 0.63, outer, spring);
    s.lineTo(r, spring); s.quadraticCurveTo(r, spring + rise * 0.56, 0, spring + rise);
    s.quadraticCurveTo(-r, spring + rise * 0.56, -r, spring);
  } else {
    for (let i = 1; i <= 24; i++) { const a = Math.PI - i / 24 * Math.PI; s.lineTo(Math.cos(a) * outer, spring + Math.sin(a) * (rise + thickness)); }
    s.lineTo(r, spring);
    for (let i = 1; i <= 24; i++) { const a = i / 24 * Math.PI; s.lineTo(Math.cos(a) * r, spring + Math.sin(a) * rise); }
  }
  s.closePath();
  const geometry = new THREE.ExtrudeGeometry(s, {depth, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.045, bevelSegments: 1, steps: 1, curveSegments: 12});
  geometry.translate(0, 0, -depth / 2); return geometry;
}
function merge(parts) {
  const positions = [], normals = [], uvs = [];
  for (const {geometry, matrix = new THREE.Matrix4()} of parts) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone(); g.applyMatrix4(matrix);
    positions.push(...g.attributes.position.array); normals.push(...g.attributes.normal.array);
    if (g.attributes.uv) uvs.push(...g.attributes.uv.array); else uvs.push(...new Array(g.attributes.position.count * 2).fill(0));
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  out.computeBoundingSphere(); return out;
}
function matrix(position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  return new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(...scale));
}
function rootGeometry() {
  const paths = [
    [[0, 0, 0], [-0.25, 3, -0.15], [0.3, 6, 0.2], [0.1, 11, 0]],
    [[0, 4, 0], [0.6, 2.2, 0.5], [1.1, 0.3, 1.4], [2.4, 0.08, 2]],
    [[0, 3.5, 0], [-0.5, 1.7, 0.1], [-1.8, 0.25, 0.6], [-2.6, 0.06, 1.4]],
    [[0, 4, 0], [0.2, 2.4, -0.6], [1.2, 0.5, -1.5], [1.8, 0.1, -2.6]],
    [[0, 6, 0], [-0.9, 7.5, -0.2], [-2.3, 9.2, -0.3], [-3, 10, -0.6]],
  ];
  const geometries = paths.map((points, i) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v => new THREE.Vector3(...v))), 15, i === 0 ? 0.48 : 0.16 + i * 0.014, 7, false));
  const out = merge(geometries.map(geometry => ({geometry}))); geometries.forEach(g => g.dispose()); return out;
}
function palmGeometry() {
  const curve = new THREE.CatmullRomCurve3([[0, 0, 0], [0.2, 3, 0.2], [0.6, 6, 0.1], [1, 9, 0]].map(v => new THREE.Vector3(...v)));
  return new THREE.TubeGeometry(curve, 12, 0.25, 8, false);
}
function leafGeometry() {
  const p = [], uv = [], index = [], count = 10;
  for (let i = 0; i <= count; i++) {
    const u = i / count, x = u * 4.3, y = Math.sin(u * Math.PI) * 1.05 - u * 0.85, w = Math.sin(u * Math.PI) * 0.7;
    for (let j = 0; j < 3; j++) { p.push(x, y - Math.abs(j - 1) * 0.12, (j - 1) * w); uv.push(u, j / 2); }
    if (i < count) for (let j = 0; j < 2; j++) { const a = i * 3 + j; index.push(a, a + 3, a + 1, a + 1, a + 3, a + 4); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(index); g.computeVertexNormals(); return g;
}

class Batches {
  constructor(group, geometries, materials, rng) { this.group = group; this.geometries = geometries; this.materials = materials; this.rng = rng; this.batches = new Map(); }
  add(geo, mat, position, scale = [1, 1, 1], rotation = [0, 0, 0], tint) {
    const key = `${geo}:${mat}`;
    if (!this.batches.has(key)) this.batches.set(key, {geo, mat, items: []});
    const variation = tint || new THREE.Color().setRGB(0.85 + this.rng() * 0.15, 0.85 + this.rng() * 0.15, 0.85 + this.rng() * 0.15);
    this.batches.get(key).items.push({matrix: matrix(position, scale, rotation), color: variation});
  }
  box(mat, x, y, z, w, h, d, bevel = false, ry = 0) { this.add(bevel ? 'block' : 'box', mat, [x, y, z], [w, h, d], [0, ry, 0]); }
  finish() {
    for (const batch of this.batches.values()) {
      const mesh = new THREE.InstancedMesh(this.geometries[batch.geo], this.materials[batch.mat], batch.items.length);
      mesh.name = batch.geo + '-' + batch.mat;
      batch.items.forEach((item, i) => { mesh.setMatrixAt(i, item.matrix); mesh.setColorAt(i, item.color); });
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      mesh.castShadow = !['flame', 'flameCore', 'glass', 'water'].includes(batch.mat);
      mesh.receiveShadow = !['flame', 'flameCore', 'glass'].includes(batch.mat);
      mesh.computeBoundingSphere(); this.group.add(mesh);
    }
    this.batches.clear();
  }
}

function egyptChunk(b, index) {
  for (const side of [-1, 1]) {
    b.box('trim', side * 4.63, 0.17, -24, 2.2, 0.34, 48);
    for (let n = 0; n < 6; n++) {
      const z = -4 - n * 8, x = side * 4.65;
      b.box('trim', x, 0.42, z, 1.62, 0.5, 1.62, true);
      b.add('cylinder', 'stone', [x, 2.95, z], [0.56, 4.6, 0.56]);
      b.add('bell', 'trim', [x, 5.45, z], [0.89, 0.7, 0.89]);
      b.add('cylinder', 'trim', [x, 0.82, z], [0.7, 0.26, 0.7]);
      b.box('trim', x, 5.96, z, 1.85, 0.34, 1.85, true);
      b.add('plane', 'ornament', [x - side * 0.568, 3.1, z], [0.66, 3.65, 1], [0, -side * Math.PI / 2, 0]);
      for (let row = 0; row < 3; row++) b.box('stone', side * 7.5, 0.5 + row * 1.03, z, 1.65, 0.98, 7.7, false);
      if (n % 2 === 0) {
        b.box('trim', 0, 6.38, z, 12, 0.65, 1.55, true);
        b.box('stone', 0, 6.87, z, 12.4, 0.32, 1.8);
      }
    }
    const oz = -23 + (index % 2) * 4, ox = side * 11.7;
    b.box('stone', ox, 0.45, oz, 2.5, 0.9, 2.5, true);
    b.add('obelisk', 'trim', [ox, 5.3, oz], [1.05, 9, 1.05], [0, Math.PI / 4, 0]);
    b.add('pyramid', 'trim', [ox, 10.4, oz], [0.83, 1.3, 0.83], [0, Math.PI / 4, 0]);
    for (let k = 0; k < 5; k++) b.add('boulder', 'stone', [side * (9 + b.rng() * 8), 0.2, -b.rng() * 48], [0.6 + b.rng() * 0.6, 0.3 + b.rng() * 0.5, 0.7], [0, b.rng() * TAU, 0]);
  }
}

function khmerChunk(b, index) {
  for (const side of [-1, 1]) {
    for (let n = 0; n < 4; n++) {
      const z = -5 - n * 12, x = side * 5.1;
      b.box('stone', x, 1.9, z, 1.4, 3.8, 2.05, true);
      b.box('trim', x, 0.24, z, 2, 0.48, 2.6, true);
      b.box('moss', x, 4.01, z, 1.75, 0.42, 2.4, true);
      b.add('plane', 'ornament', [x - side * 0.71, 2.3, z], [1.15, 2.6, 1], [0, -side * Math.PI / 2, 0]);
      b.box('stone', side * 7.4, 1.35, z - 4.7, 3.5, 2.7, 6.7);
      b.box('moss', side * 7.4, 2.81, z - 4.7, 3.8, 0.24, 6.9);
      if (n % 2 === 0) {
        // Corbelled lintels: every overhead surface stays above 4.4 m.
        b.box('stone', 0, 4.7, z, 11.6, 0.58, 2.05, true);
        b.box('moss', 0, 5.13, z, 12.2, 0.3, 2.5);
      }
      const tx = side * (9.2 + b.rng() * 2), tz = z - 3.5;
      b.add('roots', 'bark', [tx, -0.12, tz], [1, 1.05 + b.rng() * 0.2, 1], [0, b.rng() * 0.7, 0]);
      for (let k = 0; k < 4; k++) b.add('canopy', 'leaves', [tx + (b.rng() - 0.5) * 5, 10.6 + b.rng() * 2.7, tz + (b.rng() - 0.5) * 5], [3.2 + b.rng(), 1.5 + b.rng(), 3.2 + b.rng()], [0, b.rng() * TAU, 0]);
    }
    const tx = side * 9.2, tz = -24 + (index % 2) * 4;
    for (let level = 0; level < 6; level++) {
      const width = 5.7 - level * 0.67;
      b.box(level % 2 ? 'moss' : 'stone', tx, 3 + level * 1.17, tz, width, 1.35, width, true);
      b.box('trim', tx, 3.7 + level * 1.17, tz, width + 0.22, 0.2, width + 0.22);
    }
    b.add('bell', 'moss', [tx, 10.3, tz], [0.8, 1.3, 0.8]);
    // A sculptural, weathered temple face on the tower's road-facing side.
    b.box('trim', side * 6.28, 4.75, tz, 0.36, 2.3, 1.9, true);
    b.box('stone', side * 6.02, 5.06, tz, 0.25, 0.2, 1.8, true);
    b.box('stone', side * 5.93, 4.62, tz, 0.4, 0.8, 0.4, true);
    b.box('dark', side * 6.07, 4.96, tz - 0.48, 0.03, 0.1, 0.5);
    b.box('dark', side * 6.07, 4.96, tz + 0.48, 0.03, 0.1, 0.5);
    b.box('dark', side * 6.02, 4.06, tz, 0.03, 0.1, 0.9);
    for (let k = 0; k < 8; k++) {
      const z = -k * 6 - 1;
      b.box('moss', side * 4.05, 0.13, z, 0.5, 0.28, 5.8, true);
      b.add('boulder', 'moss', [side * (11 + b.rng() * 7), 0.5, z], [1.5, 1.2, 1.7], [0, b.rng() * TAU, 0]);
    }
  }
}

function mayaChunk(b, index) {
  for (const side of [-1, 1]) {
    const tx = side * 15.5, tz = -27 + (index % 2 ? 4 : -2);
    for (let level = 0; level < 7; level++) {
      const width = 15 - level * 1.5;
      b.box('stone', tx, 0.68 + level * 1.3, tz, width, 1.3, width);
      b.box('trim', tx, 1.36 + level * 1.3, tz, width + 0.15, 0.15, width + 0.15);
    }
    for (let i = 0; i < 18; i++) b.box('trim', tx, (i + 1) * 0.25, tz + 7.8 - i * 0.43, 2.5, (i + 1) * 0.5, 0.48);
    b.box('stone', tx - 1.6, 10.65, tz, 1.1, 3, 3.8, true);
    b.box('stone', tx + 1.6, 10.65, tz, 1.1, 3, 3.8, true);
    b.box('stone', tx, 12.25, tz, 4.5, 0.6, 4.4, true);
    b.box('jade', tx, 12.75, tz, 3.5, 0.3, 3.7);
    b.box('stone', tx, 13.45, tz - 0.6, 3.3, 1.2, 0.9);
    for (let k = 0; k < 6; k++) {
      const z = -3 - k * 8, x = side * 4.35;
      b.box('trim', x, 0.25, z, 1.5, 0.5, 1.4, true);
      b.box('stone', x, 1.85, z, 1.05, 2.8, 0.9, true);
      b.box('jade', x, 3.37, z, 1.17, 0.22, 1.05, true);
      b.add('plane', 'ornament', [x, 1.86, z + 0.46], [0.8, 2.4, 1]);
      if (k % 2 === 0) {
        b.box('jade', x, 2.65, z + 0.49, 0.75, 0.16, 0.13, true);
        b.box('jade', x, 1.04, z + 0.49, 0.75, 0.16, 0.13, true);
      }
      const px = side * (7.6 + b.rng() * 2), pz = z + 1;
      const palmHeight = 0.8 + b.rng() * 0.4, palmTurn = side * 0.2;
      b.add('palm', 'bark', [px, -0.2, pz], [1, palmHeight, 1], [0, palmTurn, 0]);
      // The trunk ends at local (1, 9, 0). Attach every frond to that
      // transformed point so random trunk heights never leave floating crowns.
      const crown = [px + Math.cos(palmTurn), -0.2 + 9 * palmHeight, pz - Math.sin(palmTurn)];
      for (let leaf = 0; leaf < 7; leaf++) b.add('leaf', 'leaves', crown, [1.2, 1.1, 1.2], [0, leaf / 7 * TAU + palmTurn, 0.1]);
      b.add('canopy', 'leaves', [side * (24 + b.rng() * 12), 5 + b.rng() * 3, z], [4.5, 3.5, 4.5]);
      for (let j = 0; j < 3; j++) b.add('leaf', 'leaves', [side * 5.8, 0.18, z + j * 1.6], [0.45, 0.6, 0.5], [0, side * 1.1 + j * 0.6, 0.3]);
    }
  }
  b.box('stone', -4.45, 2.4, -12, 1.45, 4.8, 1.6, true);
  b.box('stone', 4.45, 2.4, -12, 1.45, 4.8, 1.6, true);
  b.box('stone', 0, 5.2, -12, 10.3, 0.7, 1.65, true);
  b.box('jade', 0, 5.68, -12, 10.9, 0.25, 1.9);
  b.box('stone', 0, 6.04, -12, 8.8, 0.5, 1.7);
}

function wallChunk(b) {
  for (const side of [-1, 1]) {
    b.box('stone', side * 3.95, -3, -24, 1.2, 8, 48);
    for (let row = 0; row < 4; row++) for (let n = 0; n < 30; n++) {
      const z = -n * 1.6 - 0.8 - (row % 2) * 0.8;
      b.box('stone', side * 3.95, 0.22 + row * 0.38, z, 0.95, 0.35, 1.54, true);
    }
    b.box('trim', side * 3.95, 1.65, -24, 1.15, 0.22, 48);
    for (let n = 0; n < 16; n++) {
      b.box('stone', side * 3.95, 2.16, -n * 3 - 1.2, 1.05, 0.85, 1.42, true);
      b.box('trim', side * 3.95, 2.65, -n * 3 - 1.2, 1.2, 0.15, 1.56);
    }
    b.box('stone', side * 5.25, 3.25, -28, 3.2, 6.5, 8.7);
    for (let n = 0; n < 4; n++) {
      b.box('trim', side * 5.2, n * 1.65 + 0.25, -23.58, 3.1, 0.16, 0.14);
      b.box('trim', side * 5.2, n * 1.65 + 0.25, -32.42, 3.1, 0.16, 0.14);
    }
    b.box('dark', side * 5.24, 4.2, -23.57, 0.65, 1.25, 0.06);
    b.box('trim', side * 5.24, 3.53, -23.48, 0.85, 0.15, 0.25);
    for (let n = 0; n < 5; n++) b.box('stone', side * 6.8, 7.9, -24 - n * 2, 1.05, 1.1, 1.05, true);
  }
  b.add('wallArch', 'trim', [0, 0, -23.3]);
  b.add('wallArch', 'trim', [0, 0, -32.7]);
  b.box('stone', 0, 6.8, -28, 13.5, 0.6, 10);
  b.box('trim', 0, 7.22, -28, 14, 0.22, 10.4);
  for (const z of [-22.9, -33.1]) for (let n = 0; n < 9; n++) b.box('stone', -6.25 + n * 1.56, 7.95, z, 0.92, 1.2, 1.05, true);
}

function castleChunk(b) {
  for (const side of [-1, 1]) {
    for (let n = 0; n < 4; n++) {
      const z = -5 - n * 12, x = side * 4.75;
      b.box('trim', x, 0.25, z, 1.45, 0.5, 1.45, true);
      b.add('cylinder', 'stone', [x, 2.7, z], [0.42, 4.8, 0.42]);
      for (const dx of [-0.38, 0.38]) b.add('cylinder', 'trim', [x + dx, 2.75, z], [0.13, 4.9, 0.13]);
      b.box('trim', x, 5.3, z, 1.2, 0.4, 1.3, true);
      b.box('stone', side * 7.7, 4.25, z, 1.6, 8.5, 1.9);
      b.box('stone', side * 7.7, 1.1, z - 5.4, 1.4, 2.2, 9);
      b.box('stone', side * 7.7, 8.1, z - 5.4, 1.4, 2, 9);
      b.box('stone', side * 7.7, 5.1, z - 8.6, 1.4, 4, 2.3);
      b.box('stone', side * 7.7, 5.1, z - 2.5, 1.4, 4, 2.3);
      b.add('plane', 'glass', [side * 7.71, 5.05, z - 5.55], [3.2, 4, 1], [0, -side * Math.PI / 2, 0]);
      b.box('trim', side * 6.85, 5.05, z - 5.55, 0.2, 4.1, 0.13, true);
      b.box('trim', side * 6.85, 5.05, z - 5.55, 0.2, 0.15, 3.5, true);
      b.box('stone', side * 9.2, 3.3, z, 1.9, 6.6, 2.6, false);
      const fx = side * 3.95, fz = z - 4;
      b.box('stone', fx, 0.4, fz, 0.8, 0.8, 0.8, true);
      b.add('bell', 'metal', [fx, 0.98, fz], [0.48, 0.4, 0.48]);
      b.add('flameCone', 'flame', [fx, 1.6, fz], [0.35, 1.05, 0.35]);
      b.add('flameCone', 'flameCore', [fx, 1.49, fz], [0.21, 0.72, 0.21]);
    }
    const tx = side * 13.9, tz = -29;
    b.add('cylinder', 'stone', [tx, 7.5, tz], [2.55, 15, 2.55]);
    b.add('cone', 'roof', [tx, 18.8, tz], [3, 7.5, 3]);
    b.add('cylinder', 'trim', [tx, 14.7, tz], [2.78, 0.6, 2.78]);
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * TAU;
      b.box('trim', tx + Math.cos(a) * 2.5, 15.4, tz + Math.sin(a) * 2.5, 0.65, 1, 0.7, true, -a);
    }
  }
  for (let n = 0; n < 4; n++) b.add('gothicArch', 'trim', [0, 0, -5 - n * 12]);
  b.box('stone', -5.6, 9.8, -24, 1, 0.75, 48);
  b.box('stone', 5.6, 9.8, -24, 1, 0.75, 48);
}

// A distinct physical destination makes the short expedition legible. The
// portal crosses the camera at RUN_LENGTH; its piers stay outside the playable
// corridor and its lowest overhead surface is above the player's jump arc.
function exitGateway(b, id) {
  b.box('trim', 0, 0.018, 0, 6.6, 0.035, 0.28);
  for (const side of [-1, 1]) {
    const x = side * 4.65;
    b.box('trim', x, 0.22, 0, 2.1, 0.44, 2.5, true);
    if (id === 'egypt') {
      b.add('cylinder', 'stone', [x, 3.85, 0], [0.75, 6.8, 0.75]);
      b.add('bell', 'trim', [x, 7.5, 0], [1.1, 0.65, 1.1]);
      b.box('trim', x, 7.97, 0, 2.3, 0.35, 2.5, true);
      b.box('stone', side * 8.1, 5.25, -1.3, 4.5, 10.5, 5.2, true);
      b.box('trim', side * 8.1, 10.7, -1.3, 4.9, 0.45, 5.6, true);
      b.add('plane', 'ornament', [side * 8.1, 5.8, 1.33], [2.9, 7.5, 1]);
      b.add('obelisk', 'trim', [side * 11.6, 6, 2], [1.12, 12, 1.12], [0, Math.PI / 4, 0]);
      b.add('pyramid', 'trim', [side * 11.6, 12.6, 2], [0.85, 1.2, 0.85], [0, Math.PI / 4, 0]);
    } else if (id === 'khmer') {
      b.box('stone', x, 3.5, 0, 1.6, 7, 2.6, true);
      b.add('plane', 'ornament', [x, 3.8, 1.31], [1.25, 5.3, 1]);
      for (let tier = 0; tier < 6; tier++) {
        const width = 4.2 - tier * 0.48;
        b.box(tier % 2 ? 'moss' : 'stone', side * 7.7, 5.5 + tier * 1.15, -1, width, 1.25, width, true);
        b.box('trim', side * 7.7, 6.17 + tier * 1.15, -1, width + 0.15, 0.16, width + 0.15);
      }
      b.add('bell', 'moss', [side * 7.7, 12.5, -1], [0.65, 1.8, 0.65]);
    } else if (id === 'maya') {
      b.box('stone', x, 3.7, 0, 1.7, 7.4, 2.3, true);
      b.add('plane', 'ornament', [x, 3.7, 1.16], [1.3, 5.8, 1]);
      for (const y of [1.1, 6.5]) b.box('jade', x, y, 0, 1.85, 0.25, 2.5, true);
      for (let tier = 0; tier < 5; tier++) {
        const width = 7.6 - tier * 1.1;
        b.box('stone', side * 9.8, 0.75 + tier * 1.5, -2, width, 1.5, width);
        b.box('trim', side * 9.8, 1.5 + tier * 1.5, -2, width + 0.15, 0.18, width + 0.15);
      }
    } else if (id === 'wall') {
      b.box('stone', side * 5.5, 3.4, -2, 3.8, 6.8, 7);
      b.box('dark', side * 5.5, 4.35, 1.52, 0.7, 1.3, 0.06);
      b.box('trim', side * 5.5, 3.6, 1.6, 0.95, 0.17, 0.23);
      for (let n = 0; n < 4; n++) b.box('trim', side * 5.5, 0.3 + n * 1.65, 1.54, 3.75, 0.14, 0.12);
    } else {
      b.add('cylinder', 'stone', [x, 2.9, 0], [0.6, 5.8, 0.6]);
      for (const dx of [-0.47, 0.47]) b.add('cylinder', 'trim', [x + dx, 2.9, 0], [0.16, 5.8, 0.16]);
      b.add('cylinder', 'stone', [side * 8.2, 7.3, -1.5], [2.1, 14.6, 2.1]);
      b.add('cylinder', 'trim', [side * 8.2, 14.3, -1.5], [2.35, 0.5, 2.35]);
      b.add('cone', 'roof', [side * 8.2, 17.9, -1.5], [2.7, 6.8, 2.7]);
      b.box('stone', side * 3.95, 0.45, 2, 0.7, 0.9, 0.7, true);
      b.add('bell', 'metal', [side * 3.95, 1.05, 2], [0.43, 0.35, 0.43]);
      b.add('flameCone', 'flame', [side * 3.95, 1.65, 2], [0.3, 0.95, 0.3]);
      b.add('flameCone', 'flameCore', [side * 3.95, 1.57, 2], [0.16, 0.65, 0.16]);
    }
  }
  if (id === 'wall') {
    b.add('wallArch', 'trim', [0, 0, 1.5]);
    b.add('wallArch', 'trim', [0, 0, -5.5]);
    b.box('stone', 0, 7, -2, 15.2, 0.55, 8);
    b.box('trim', 0, 7.4, -2, 15.7, 0.24, 8.4);
    for (const z of [2.15, -6.15]) for (let n = 0; n < 10; n++) b.box('stone', -6.75 + n * 1.5, 8.1, z, 0.9, 1.15, 1.05, true);
  } else if (id === 'castle') {
    b.add('gothicArch', 'trim', [0, 0, 0]);
    b.add('gothicArch', 'stone', [0, 0, -2.1]);
    b.box('trim', 0, 10.8, -1, 11.2, 0.5, 3.2, true);
  } else {
    b.box('stone', 0, 8.2, 0, 11.8, 0.65, 2.8, true);
    b.box(id === 'maya' ? 'jade' : 'trim', 0, 8.72, 0, 12.4, 0.35, 3.15, true);
    if (id === 'khmer' || id === 'maya') {
      for (let tier = 0; tier < 3; tier++) b.box(id === 'khmer' && tier % 2 ? 'moss' : 'stone', 0, 9.24 + tier * 0.65, 0, 9.8 - tier * 2, 0.65, 2.7 - tier * 0.4, true);
    }
  }
}

function terrainGeometry(style) {
  const width = style === 'wall' ? 290 : 190, length = 285;
  const g = new THREE.PlaneGeometry(width, length, 48, 64); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, colors = [];
  const low = new THREE.Color(style === 'egypt' ? '#a9926a' : style === 'wall' ? '#66745d' : '#344638');
  const high = new THREE.Color(style === 'egypt' ? '#cdb583' : style === 'wall' ? '#899187' : '#58704a');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), away = Math.max(0, Math.abs(x) - 6);
    const waves = (Math.sin(x * 0.065 + z * 0.032) + Math.sin(x * 0.14 - z * 0.048) * 0.45 + Math.cos(z * 0.12) * 0.16);
    let y;
    if (style === 'wall') y = -17 + Math.min(1, away / 48) * (24 + waves * 15);
    else if (style === 'egypt') y = -0.2 + Math.min(1, away / 18) * Math.max(0, 2.9 + waves * 2.7);
    else y = -0.2 + Math.min(1, away / 17) * (0.5 + waves * 0.8);
    p.setY(i, y);
    const c = low.clone().lerp(high, THREE.MathUtils.clamp(0.4 + waves * 0.2, 0, 1)); colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); g.computeVertexNormals(); return g;
}

function glassTexture(size) {
  const c = canvas(size); if (!c) return null;
  const g = c.getContext('2d'); g.fillStyle = '#283d5c'; g.fillRect(0, 0, size, size);
  const colors = ['#426da4', '#53688c', '#8e5b54', '#779b9e'];
  for (let row = 0; row < 6; row++) for (let col = 0; col < 3; col++) {
    const x = col * size / 3, y = row * size / 6;
    g.fillStyle = colors[(col + row * 3) % colors.length]; g.fillRect(x + 4, y + 4, size / 3 - 8, size / 6 - 8);
    g.strokeStyle = '#172437'; g.lineWidth = 5; g.beginPath(); g.moveTo(x + size / 6, y + 4);
    g.lineTo(x + size / 3 - 4, y + size / 12); g.lineTo(x + size / 6, y + size / 6 - 4); g.lineTo(x + 4, y + size / 12); g.closePath(); g.stroke();
  }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; return map;
}

export function createWorld(sceneId, {quality = 'high'} = {}) {
  const id = Object.hasOwn(PRESETS, sceneId) ? sceneId : 'egypt';
  const settings = structuredClone(PRESETS[id]);
  const high = quality === 'high', size = high ? 512 : 256;
  const group = new THREE.Group(); group.name = `world-${id}`;
  const resources = {geometries: new Set(), materials: new Set(), textures: new Set()};
  let disposed = false;
  const rememberMaps = maps => { for (const value of Object.values(maps)) if (value?.isTexture) resources.textures.add(value); return maps; };
  const stone = rememberMaps(stoneMaps(settings.stone, size, 9182, {moss: id === 'khmer'}));
  const road = rememberMaps(stoneMaps(settings.road, size, 2883, {road: true, moss: id === 'khmer'}));
  const ornament = rememberMaps(ornamentMap(settings.stone, id, size));
  const bark = rememberMaps(stoneMaps('#655e45', 256, 571));
  const materials = {
    stone: new THREE.MeshStandardMaterial({color: '#ffffff', ...stone, bumpScale: 0.075, roughness: settings.roughness}),
    trim: new THREE.MeshStandardMaterial({color: settings.trim, bumpMap: stone.bumpMap, bumpScale: 0.045, roughness: settings.roughness}),
    road: new THREE.MeshStandardMaterial({color: '#ffffff', ...road, bumpScale: 0.075, roughness: id === 'castle' ? 0.36 : settings.roughness, metalness: id === 'castle' ? 0.12 : 0}),
    dark: new THREE.MeshStandardMaterial({color: settings.dark, roughness: 1}),
    moss: new THREE.MeshStandardMaterial({color: '#697a4d', ...stone, bumpScale: 0.1, roughness: 0.93}),
    jade: new THREE.MeshStandardMaterial({color: '#2c7f76', bumpMap: stone.bumpMap, bumpScale: 0.025, roughness: 0.38, metalness: 0.14}),
    bark: new THREE.MeshStandardMaterial({color: '#ffffff', ...bark, bumpScale: 0.13, roughness: 0.95}),
    leaves: new THREE.MeshStandardMaterial({color: settings.foliage, roughness: 0.93, side: THREE.DoubleSide}),
    ornament: new THREE.MeshStandardMaterial({color: '#ffffff', ...ornament, bumpScale: 0.16, roughness: 0.86}),
    metal: new THREE.MeshStandardMaterial({color: '#393630', roughness: 0.55, metalness: 0.72}),
    roof: new THREE.MeshStandardMaterial({color: '#1b2b3b', bumpMap: stone.bumpMap, bumpScale: 0.04, roughness: 0.55}),
    flame: new THREE.MeshBasicMaterial({color: '#ff8b35', transparent: true, opacity: 0.78, depthWrite: false, toneMapped: false}),
    flameCore: new THREE.MeshBasicMaterial({color: '#ffe5a4', toneMapped: false}),
  };
  if (id === 'castle') {
    const map = glassTexture(256); if (map) resources.textures.add(map);
    materials.glass = new THREE.MeshStandardMaterial({map, color: '#b2c5ea', emissiveMap: map, emissive: '#6683b9', emissiveIntensity: 0.65, roughness: 0.4, side: THREE.DoubleSide});
  }
  for (const material of Object.values(materials)) resources.materials.add(material);
  // The generated masonry asset adds irregular erosion to nearby architecture.
  // Procedural maps stay active while loading, and remain a complete fallback.
  if (typeof document !== 'undefined') {
    const loader = new THREE.TextureLoader();
    const asset = loader.load(new URL('./assets/ancient-stone.webp', import.meta.url).href, texture => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = high ? 8 : 4;
      const relief = texture.clone();
      relief.colorSpace = THREE.NoColorSpace; relief.needsUpdate = true;
      resources.textures.add(relief);
      for (const [key, tint] of [['stone', settings.stone], ['trim', settings.trim]]) {
        const material = materials[key];
        material.map = texture; material.bumpMap = relief;
        material.color.set(tint).lerp(new THREE.Color('#ffffff'), 0.1);
        material.bumpScale = key === 'stone' ? 0.07 : 0.045;
        material.needsUpdate = true;
      }
    }, undefined, () => { /* The procedural fallback deliberately stays visible. */ });
    resources.textures.add(asset);
  }
  const geometries = {
    box: new THREE.BoxGeometry(1, 1, 1), block: high ? beveledBlock() : new THREE.BoxGeometry(1, 1, 1),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, high ? 20 : 12),
    cone: new THREE.ConeGeometry(1, 1, high ? 20 : 12),
    pyramid: new THREE.ConeGeometry(1, 1, 4),
    obelisk: new THREE.CylinderGeometry(0.65, 1, 1, 4),
    bell: new THREE.CylinderGeometry(1, 0.6, 1, high ? 20 : 12),
    plane: new THREE.PlaneGeometry(1, 1),
    boulder: new THREE.IcosahedronGeometry(1, 1),
    canopy: new THREE.SphereGeometry(1, high ? 16 : 10, high ? 10 : 7),
    flameCone: new THREE.ConeGeometry(1, 1, 7),
  };
  if (id === 'khmer') geometries.roots = rootGeometry();
  if (id === 'maya') { geometries.palm = palmGeometry(); geometries.leaf = leafGeometry(); }
  if (id === 'wall') geometries.wallArch = archGeometry(6.9, 4.35, 1.25, 0.42, 1.15);
  if (id === 'castle') geometries.gothicArch = archGeometry(9.5, 5.25, 4.8, 0.42, 0.65, true);
  for (const geometry of Object.values(geometries)) resources.geometries.add(geometry);
  const segments = [];
  const builder = {egypt: egyptChunk, khmer: khmerChunk, maya: mayaChunk, wall: wallChunk, castle: castleChunk}[id];
  for (let i = 0; i < CHUNKS; i++) {
    const segment = new THREE.Group(); segment.name = `architecture-${i}`;
    const batches = new Batches(segment, geometries, materials, random(3404 + i * 79));
    builder(batches, i); batches.finish(); group.add(segment); segments.push(segment);
  }
  const roadGeometry = new THREE.PlaneGeometry(6.6, 270); roadGeometry.rotateX(-Math.PI / 2); resources.geometries.add(roadGeometry);
  for (const texture of Object.values(road)) if (texture?.isTexture) texture.repeat.set(2, 270 / 3.4);
  const roadMesh = new THREE.Mesh(roadGeometry, materials.road); roadMesh.position.set(0, 0, -110); roadMesh.receiveShadow = true; roadMesh.name = 'walkable-floor'; group.add(roadMesh);
  const terrainGeo = terrainGeometry(id); resources.geometries.add(terrainGeo);
  const terrainMat = new THREE.MeshStandardMaterial({color: '#ffffff', vertexColors: true, roughness: 0.95, bumpMap: stone.bumpMap, bumpScale: id === 'egypt' ? 0.025 : 0.08}); resources.materials.add(terrainMat);
  const terrain = new THREE.Mesh(terrainGeo, terrainMat); terrain.position.z = -110; terrain.receiveShadow = true; group.add(terrain);
  const background = new THREE.Group(); group.add(background);
  const backdrop = new Batches(background, geometries, materials, random(1501));
  if (id === 'egypt') {
    for (const [x, z, radius, h] of [[-45, -125, 34, 35], [47, -143, 41, 44], [-70, -164, 22, 24]]) {
      backdrop.add('pyramid', 'stone', [x, h / 2 - 1.5, z], [radius, h, radius], [0, Math.PI / 4, 0]);
      backdrop.box('trim', x, -0.1, z, radius * 1.5, 1.4, radius * 1.5);
    }
  } else if (id === 'maya') {
    for (const [x, z, h] of [[-50, -154, 30], [55, -171, 40]]) backdrop.add('pyramid', 'dark', [x, h / 2 - 3, z], [35, h, 35], [0, Math.PI / 4, 0]);
  } else if (id === 'castle') {
    for (const x of [-28, 26]) {
      backdrop.add('cylinder', 'stone', [x, 13, -139], [5, 26, 5]);
      backdrop.add('cone', 'roof', [x, 32, -139], [6, 15, 6]);
    }
    backdrop.box('stone', 0, 6, -162, 70, 12, 5);
  }
  backdrop.finish();
  const exit = new THREE.Group(); exit.name = 'expedition-exit';
  const exitBatches = new Batches(exit, geometries, materials, random(7207));
  exitGateway(exitBatches, id); exitBatches.finish(); group.add(exit);
  const waters = [];
  if (id === 'khmer') {
    const maps = rememberMaps(stoneMaps('#346a5b', 256, 884, {}));
    const mat = new THREE.MeshStandardMaterial({color: '#52796e', roughness: 0.2, metalness: 0.3, bumpMap: maps.bumpMap, bumpScale: 0.025, transparent: true, opacity: 0.86}); resources.materials.add(mat);
    const geo = new THREE.PlaneGeometry(0.75, 270); geo.rotateX(-Math.PI / 2); resources.geometries.add(geo);
    for (const side of [-1, 1]) { const mesh = new THREE.Mesh(geo, mat); mesh.position.set(side * 3.73, -0.045, -110); mesh.receiveShadow = true; group.add(mesh); }
    if (maps.bumpMap) { maps.bumpMap.repeat.set(1, 60); waters.push(maps.bumpMap); }
  }
  const flameLights = [];
  if (id === 'castle') {
    for (const side of [-1, 1]) {
      const light = new THREE.PointLight('#ffae5a', 28, 12, 2); light.position.set(side * 3.95, 1.8, -9); light.castShadow = false; group.add(light); flameLights.push(light);
    }
  }
  function update(distance, time) {
    if (disposed) return;
    const d = Number.isFinite(distance) ? distance : 0, t = Number.isFinite(time) ? time : 0;
    exit.position.z = d - RUN_LENGTH;
    exit.visible = exit.position.z > -settings.fog.far - 24;
    segments.forEach((segment, index) => {
      const far = -192;
      segment.position.z = ((d + 20 - index * CHUNK - far) % LOOP + LOOP) % LOOP + far;
    });
    for (const texture of Object.values(road)) if (texture?.isTexture) texture.offset.y = (d / 3.4) % 1;
    for (const texture of waters) { texture.offset.y = (d / 4.5 + t * 0.025) % 1; texture.offset.x = Math.sin(t * 0.17) * 0.035; }
    if (flameLights.length) {
      const z = ((d + 11) % 12 + 12) % 12 - 12;
      flameLights.forEach((light, i) => { light.position.z = z; light.intensity = 27 + Math.sin(t * 8.7 + i) * 2.5 + Math.sin(t * 13.1) * 1.4; });
      materials.flame.opacity = 0.76 + Math.sin(t * 9) * 0.09;
    }
  }
  function dispose() {
    if (disposed) return; disposed = true;
    group.traverse(child => { if (child.isInstancedMesh) child.dispose(); });
    resources.geometries.forEach(g => g.dispose()); resources.materials.forEach(m => m.dispose()); resources.textures.forEach(t => t.dispose());
    group.clear();
  }
  update(0, 0);
  return {group, update, dispose, settings};
}
