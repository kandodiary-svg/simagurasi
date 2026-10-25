// ===================== ARCHITECTURE KIT — detailed, cute buildings =====================
// Every building is assembled from these parts in its own local frame (front = +z, ground = y 0).
// Static buildings are merged per material by mergeStatic(); dynamic ones use mergeLocal().
const AM = { ok: false };
const stdM = (c, r = 0.6, m = 0, ex = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, ex));
const SIDING_COLS = ['#f3efe6', '#e4ddcf', '#cfc7b9', '#a99d8a', '#8a8478', '#5e6064', '#ece6da', '#f6f6f2'];
const SHINGLE_COLS = ['#3b3d42', '#4a4f58', '#5a4636', '#6b6f75', '#3a4656', '#6e3a30', '#4f5a4a'];
const CURTAIN_COLS = ['#f2a7b8', '#9fcbe8', '#f6d27a', '#a8d8a0', '#f4f0e6', '#c9b2e6', '#f0b48a'];
const SHUTTER_COLS = ['#5a8fc8', '#4f9a72', '#d86a6a', '#f2f0ea', '#e8a34a', '#7a6ab0'];
const DOOR_COLS = ['#c85a4a', '#3f72b0', '#4f8f62', '#f2efe6', '#7a5238', '#e7b545', '#5e5aa6'];
function txCanvas(w, h, fn, repeat = false) { const [c, x] = cvs(w, h); fn(x, w, h); return toTex(c, repeat); }
function archTextures() {
  // lap siding: horizontal boards with a shadow under each lap (16px per board → ~0.18m)
  TEX.siding = toTex(pixelTex(256, (i, j) => { const b = j % 16, n = pfbm(i / 32, j / 4, 8, 301, 3), gr = (hash2(i >> 3, j >> 4, 7) - 0.5) * 6; let v = 238 + (n - 0.5) * 16 + gr; if (b >= 14) v -= 48 - (15 - b) * 18; else if (b < 2) v += 8; return [v, v, v]; })[0]);
  // 窯業系サイディング (fibre-cement panels, the standard Japanese house wall): faint stone grain, a groove every 455 mm (6 per 2.73 m tile)
  TEX.panelJ = toTex(pixelTex(256, (i, j) => { const u = i / 256 * 6, fr = u - Math.floor(u), n = pfbm(i / 16, j / 16, 16, 401, 3); let v = 230 + (n - 0.5) * 16; if (fr < 0.028 || fr > 0.988) v -= 64; else if (fr < 0.05) v -= 14; else if (fr > 0.97) v += 8; if (j < 2) v -= 26; return [v, v, v]; })[0]);
  // タイル調サイディング: small staggered tiles with light joints
  TEX.tileJ = toTex(pixelTex(256, (i, j) => { const row = Math.floor(j / 8), jj = j % 8, x = (i + (row % 2) * 10.667) % 256, col = Math.floor(x / 21.333), ii = x - col * 21.333; let v = 212 + (hash2(col % 12, row, 23) - 0.5) * 36 + (pfbm(i / 8, j / 8, 32, 409, 2) - 0.5) * 12; if (jj === 7 || ii < 1.3) v = 240; else if (jj === 0) v += 9; return [v, v * 0.985, v * 0.96]; })[0]);
  // vertical boards (yakisugi / board-and-batten)
  TEX.boardV = toTex(pixelTex(256, (i, j) => { const b = i % 21, n = pfbm(i / 6, j / 64, 42.67, 311, 3), plank = Math.floor(i / 21); let v = 200 + (n - 0.5) * 70 + (hash2(plank, 0, 9) - 0.5) * 30; if (b < 2) v *= 0.45; return [v, v * 0.97, v * 0.93]; })[0]);
  // scalloped shingles (roof UVs: u along eave, v up the slope; repeat every 1.35 m → 6 rows)
  TEX.shingle = txCanvas(256, 256, (x, w, h) => {
    x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, w, h); const rh = h / 6, sw = w / 6, R = mulberry(5);
    for (let r = 0; r <= 6; r++) { const y0 = h - (r + 1) * rh, off = (r % 2) * sw / 2; for (let k = -1; k <= 6; k++) { const x0 = k * sw + off, v = 205 + R() * 40;
      const gr = x.createLinearGradient(0, y0, 0, y0 + rh * 1.15); gr.addColorStop(0, `rgb(${v * 0.8},${v * 0.8},${v * 0.8})`); gr.addColorStop(0.75, `rgb(${v},${v},${v})`); gr.addColorStop(1, `rgb(${v * 0.92},${v * 0.92},${v * 0.92})`);
      x.fillStyle = gr; x.beginPath(); x.moveTo(x0 + 1, y0); x.lineTo(x0 + sw - 1, y0); x.lineTo(x0 + sw - 1, y0 + rh * 0.62); x.quadraticCurveTo(x0 + sw - 1, y0 + rh * 1.12, x0 + sw / 2, y0 + rh * 1.12); x.quadraticCurveTo(x0 + 1, y0 + rh * 1.12, x0 + 1, y0 + rh * 0.62); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(40,40,40,0.35)'; x.lineWidth = 2; x.stroke(); } }
  }, true);
  // louvered shutters
  TEX.louver = txCanvas(64, 128, (x, w, h) => { x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, w, h); for (let y = 8; y < h - 6; y += 7) { x.fillStyle = '#a8a8a8'; x.fillRect(6, y + 4, w - 12, 3); x.fillStyle = '#ffffff'; x.fillRect(6, y, w - 12, 2); } x.strokeStyle = '#b8b8b8'; x.lineWidth = 5; x.strokeRect(3, 3, w - 6, h - 6); });
  // raised-panel front door with a small window, tinted by material colour
  TEX.doorPanel = txCanvas(128, 256, (x, w, h) => { x.fillStyle = '#ececec'; x.fillRect(0, 0, w, h);
    const panel = (px, py, pw, ph) => { x.fillStyle = '#c4c4c4'; x.fillRect(px, py, pw, ph); x.fillStyle = '#f8f8f8'; x.fillRect(px + 4, py + 4, pw - 8, ph - 8); x.fillStyle = '#dadada'; x.fillRect(px + 9, py + 9, pw - 18, ph - 18); };
    x.fillStyle = '#4c5a66'; x.fillRect(30, 22, 68, 54); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(36, 26, 10, 46); x.strokeStyle = '#c8c8c8'; x.lineWidth = 6; x.strokeRect(27, 19, 74, 60);
    panel(16, 98, 44, 64); panel(68, 98, 44, 64); panel(16, 172, 44, 66); panel(68, 172, 44, 66); });
  // 格子戸: dark wooden lattice over frosted glass
  const koshi = night => txCanvas(128, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, night ? '#ffe2a8' : '#e9e6dc'); gr.addColorStop(1, night ? '#f0c27a' : '#d6d2c4'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = night ? '#2a1a10' : '#4a3424'; for (let i = 4; i < w; i += 11) x.fillRect(i, 0, 5, h); x.fillRect(0, 0, w, 10); x.fillRect(0, h - 26, w, 26); x.fillRect(0, h * 0.42, w, 7); x.fillRect(0, 0, 8, h); x.fillRect(w - 8, 0, 8, h); });
  TEX.koshi = koshi(false); TEX.koshiN = koshi(true);
  // air-con outdoor unit face
  TEX.acFace = txCanvas(128, 96, (x, w, h) => { x.fillStyle = '#efede7'; x.fillRect(0, 0, w, h); x.fillStyle = '#3c3f42'; x.beginPath(); x.arc(78, 48, 36, 0, 7); x.fill(); x.strokeStyle = '#d6d4ce'; x.lineWidth = 2; for (let r = 8; r < 36; r += 6) { x.beginPath(); x.arc(78, 48, r, 0, 7); x.stroke(); } x.beginPath(); x.moveTo(42, 48); x.lineTo(114, 48); x.moveTo(78, 12); x.lineTo(78, 84); x.stroke(); x.fillStyle = '#c9c7c0'; for (let y = 14; y < 84; y += 7) x.fillRect(10, y, 22, 3); });
  // vending machine face (drinks behind glass, buttons, dispenser)
  const vend = night => txCanvas(128, 256, (x, w, h) => { const R = mulberry(11); x.fillStyle = '#f6f6f2'; x.fillRect(0, 0, w, h);
    x.fillStyle = night ? '#fff8e0' : '#dfeaf0'; x.fillRect(8, 10, w - 16, 120); const cols = ['#e8423a', '#2f7fd8', '#f2c230', '#3faa5a', '#ffffff', '#ff8a2a', '#8a4a2a', '#e86aa0'];
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { x.fillStyle = cols[Math.floor(R() * cols.length)]; x.fillRect(14 + k * 18, 18 + r * 28, 12, 20); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(15 + k * 18, 19 + r * 28, 3, 18); x.fillStyle = '#e04040'; x.fillRect(16 + k * 18, 40 + r * 28, 8, 3); }
    x.fillStyle = '#2a2c30'; x.fillRect(8, 140, w - 16, 26); x.fillStyle = '#7fe08a'; x.font = 'bold 14px sans-serif'; x.fillText('100', 16, 158); x.fillStyle = '#c8c8c8'; x.fillRect(84, 146, 28, 14);
    x.fillStyle = '#1e1f22'; x.fillRect(14, 206, w - 28, 34); x.fillStyle = '#3a3c40'; x.fillRect(18, 210, w - 36, 26); });
  TEX.vend = vend(false); TEX.vendN = vend(true);
  // shop display window: shelves full of goods
  const disp = night => txCanvas(256, 128, (x, w, h) => { const R = mulberry(23); x.fillStyle = night ? '#ffe9b8' : '#c9d6dc'; x.fillRect(0, 0, w, h);
    for (let s = 0; s < 3; s++) { const y = 18 + s * 38; x.fillStyle = '#8a6a4a'; x.fillRect(0, y + 26, w, 5); for (let k = 0; k < 22; k++) { const bw = 6 + R() * 6, bh = 10 + R() * 14; x.fillStyle = ['#e8423a', '#2f7fd8', '#f2c230', '#3faa5a', '#ffffff', '#ff8a2a', '#e86aa0', '#8a4aca'][Math.floor(R() * 8)]; x.fillRect(4 + k * 11.4, y + 26 - bh, bw, bh); } }
    if (!night) { x.fillStyle = 'rgba(255,255,255,0.28)'; x.beginPath(); x.moveTo(30, 0); x.lineTo(70, 0); x.lineTo(20, h); x.lineTo(-20, h); x.fill(); x.beginPath(); x.moveTo(150, 0); x.lineTo(165, 0); x.lineTo(115, h); x.lineTo(100, h); x.fill(); } });
  TEX.disp = disp(false); TEX.dispN = disp(true);
  // awning stripes
  TEX.stripe = txCanvas(128, 16, (x, w, h) => { for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#ffffff' : '#cccccc'; x.fillRect(k * 16, 0, 16, h); } }, true);
}
// window glass with an interior: curtains, sheer lace, sky reflection. night version glows warm.
function winTex(cur, night) {
  return txCanvas(128, 160, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); if (night) { gr.addColorStop(0, '#ffe7b0'); gr.addColorStop(1, '#f2b866'); } else { gr.addColorStop(0, '#3e4f5c'); gr.addColorStop(1, '#5f6a72'); }
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    if (!night) { x.fillStyle = 'rgba(255,240,210,0.18)'; x.beginPath(); x.ellipse(64, 70, 26, 36, 0, 0, 7); x.fill(); }
    x.fillStyle = night ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.22)'; x.fillRect(30, 0, 68, h); // sheer lace
    const c = hex(cur), k = night ? 0.85 : 1;
    for (const side of [0, 1]) { const x0 = side ? w - 34 : 0; for (let i = 0; i < 34; i++) { const f = 0.78 + 0.22 * Math.cos(i / 34 * Math.PI * 4); x.fillStyle = `rgb(${c[0] * f * k},${c[1] * f * k},${c[2] * f * k})`; const pinch = Math.max(0, 1 - Math.abs((side ? 34 - i : i) / 34)); x.fillRect(x0 + i, 0, 1, h * (0.62 + 0.38 * (1 - pinch * 0.0))); }
      x.fillStyle = `rgb(${c[0] * 0.7},${c[1] * 0.7},${c[2] * 0.7})`; x.fillRect(x0 + (side ? 0 : 22), h * 0.58, 12, 6); }
    x.fillStyle = night ? 'rgba(120,80,40,0.5)' : 'rgba(30,30,30,0.5)'; x.fillRect(0, 0, w, 7); // curtain rail shadow
    if (!night) { x.fillStyle = 'rgba(255,255,255,0.3)'; x.beginPath(); x.moveTo(70, 0); x.lineTo(110, 0); x.lineTo(40, h); x.lineTo(0, h); x.fill(); x.fillStyle = 'rgba(200,230,255,0.18)'; x.fillRect(0, 0, w, h); }
  });
}
function archMats() {
  if (AM.ok) return AM; AM.ok = true; archTextures();
  AM.trim = stdM('#fbf8f1', 0.55); AM.trimCream = stdM('#efe2c6', 0.6); AM.trimBrown = stdM('#5b4332', 0.65); AM.fasciaDark = stdM('#45403b', 0.6);
  AM.soffit = stdM('#f3eee3', 0.85); AM.soffitWood = worldMat(TEX.wood, 0.8, '#9a7856', 0.8);
  AM.gutter = stdM('#e9e7e1', 0.4, 0.15); AM.gutterBr = stdM('#6b5444', 0.45, 0.2);
  AM.found = worldMat(TEX.concrete, 0.35, '#bdb8ae', 0.95); AM.dark = stdM('#2e3033', 0.7); AM.vent = stdM('#55585c', 0.5, 0.4);
  AM.siding = SIDING_COLS.map(c => worldMat(TEX.siding, 0.35, c, 0.8));
  AM.plaster = [MAT.plaster, MAT.plasterWarm, worldMat(TEX.plaster, 0.35, '#fbf7ee', 0.92)];
  AM.yakisugi = worldMat(TEX.boardV, 0.45, '#5a4c44', 0.85); AM.boardLight = worldMat(TEX.boardV, 0.45, '#c9a27a', 0.8);
  AM.shingle = SHINGLE_COLS.map(c => new THREE.MeshStandardMaterial({ map: TEX.shingle, color: new THREE.Color(c).multiplyScalar(1.25), roughness: 0.62 }));
  AM.ridgeK = stdM('#4d5258', 0.45, 0.25); AM.ridgeKr = stdM('#8a4a36', 0.5, 0.15);
  AM.win = CURTAIN_COLS.map(c => new THREE.MeshStandardMaterial({ map: winTex(c, false), emissiveMap: winTex(c, true), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.1, metalness: 0.25 }));
  AM.sash = stdM('#c9cdd0', 0.35, 0.6); AM.sashBr = stdM('#5f4f42', 0.45, 0.35);
  AM.louver = SHUTTER_COLS.map(c => new THREE.MeshStandardMaterial({ map: TEX.louver, color: c, roughness: 0.6 }));
  AM.door = DOOR_COLS.map(c => new THREE.MeshStandardMaterial({ map: TEX.doorPanel, color: c, roughness: 0.5 }));
  AM.koshi = new THREE.MeshStandardMaterial({ map: TEX.koshi, emissiveMap: TEX.koshiN, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.6 });
  AM.brass = stdM('#d8b25a', 0.3, 0.8); AM.pot = stdM('#b8653e', 0.85); AM.potW = stdM('#ebe6dc', 0.7); AM.plant = stdM('#3f7a2e', 0.9); AM.plant2 = stdM('#5f9e3c', 0.9);
  AM.hedge = worldMat(TEX.grass, 0.9, '#9ccf72', 0.95); AM.block = worldMat(TEX.concrete, 0.45, '#d9d3c5', 0.9); AM.stone = MAT.stone; AM.brick = worldMat(TEX.brick, 0.6, '#ffffff', 0.9);
  AM.pave = worldMat(TEX.concrete, 0.6, '#e4dfd4', 0.9); AM.flag = worldMat(TEX.rock, 0.5, '#c8c2b6', 0.95);
  AM.cloth = ['#ffffff', '#8fc8f0', '#ff9fb4', '#ffe27a', '#a6e0ae', '#d0b8f0'].map(c => stdM(c, 0.9, 0, { side: THREE.DoubleSide }));
  AM.rail = stdM('#f7f5f0', 0.5); AM.railM = stdM('#b9bdc0', 0.35, 0.65);
  AM.ac = new THREE.MeshStandardMaterial({ map: TEX.acFace, roughness: 0.5 }); AM.acBody = stdM('#eceae4', 0.5);
  AM.gas = stdM('#d4dadf', 0.4, 0.35); AM.gasCap = stdM('#3d6db8', 0.5); AM.meter = stdM('#e9e9e4', 0.5);
  AM.vend = ['#d8282f', '#2f6fd8', '#f4f4f0'].map(c => stdM(c, 0.45)); AM.vendFace = new THREE.MeshStandardMaterial({ map: TEX.vend, emissiveMap: TEX.vendN, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15, roughness: 0.3 });
  AM.disp = new THREE.MeshStandardMaterial({ map: TEX.disp, emissiveMap: TEX.dispN, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.12, metalness: 0.2 });
  AM.awn = ['#d8423a', '#3f8f5a', '#2f6fb8', '#e8902a'].map(c => new THREE.MeshStandardMaterial({ map: TEX.stripe, color: new THREE.Color(c).lerp(new THREE.Color('#ffffff'), 0.05), roughness: 0.7, side: THREE.DoubleSide }));
  AM.awnSolid = ['#d8423a', '#3f8f5a', '#2f6fb8', '#e8902a'].map(c => stdM(c, 0.7, 0, { side: THREE.DoubleSide }));
  AM.bike = [stdM('#3a8ad8', 0.35, 0.5), stdM('#e8504a', 0.35, 0.5), stdM('#f2f0ea', 0.35, 0.4)]; AM.tire = stdM('#202124', 0.8);
  AM.glow = [AM.koshi, AM.disp, ...AM.win];
  return AM;
}
// ---------- primitive helpers (all add to a group in its local frame) ----------
function B(g, w, h, d, m, x, y, z, ry = 0, rx = 0, rz = 0) { const o = box(w, h, d, m, x, y, z, ry); if (rx || rz) { o.rotation.set(rx, ry, rz); } g.add(o); return o; }
function CY(g, r, h, m, x, y, z, seg = 8, rx = 0, rz = 0, ry = 0, rb) { const o = cylM(r, rb === undefined ? r : rb, h, m, x, y, z, seg); o.rotation.set(rx, ry, rz); g.add(o); return o; }
function SP(g, r, m, x, y, z, sy = 1, seg = 8) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), m); o.position.set(x, y, z); o.scale.y = sy; o.castShadow = o.receiveShadow = true; g.add(o); return o; }
function sub(g, x, y, z, ry = 0) { const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = ry; g.add(s); return s; }
// rod between two points
function ROD(g, r, m, a, b, seg = 6) { const v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = v.length(); const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, seg), m); o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; }

// ---------- windows ----------
// style: 'cross' (cute casement, 4 panes) | 'slide' (Japanese aluminium sliding) | 'tall' (full-height balcony door) | 'round'
function winPart(g, x, y, z, ry, w, h, o = {}) {
  const A = archMats(), s = sub(g, x, y, z, ry), st = o.style || 'cross', trim = o.trim || A.trim, glass = A.win[o.cur || 0];
  const sash = st === 'slide' || st === 'tall' ? (o.sash || A.sash) : trim;
  if (st === 'round') { const r = w / 2; const gl = new THREE.Mesh(new THREE.CircleGeometry(r, 20), glass); gl.position.z = 0.03; s.add(gl); const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.04, 0.07, 6, 20), trim); ring.position.z = 0.05; ring.castShadow = true; s.add(ring); B(s, 0.04, w, 0.04, trim, 0, 0, 0.06); B(s, w, 0.04, 0.04, trim, 0, 0, 0.06); return s; }
  B(s, w, h, 0.04, glass, 0, 0, 0.02);
  // frame (protrudes so the glass reads as recessed)
  const t = st === 'slide' || st === 'tall' ? 0.07 : 0.11;
  B(s, w + t * 2, t, 0.12, sash, 0, h / 2 + t / 2, 0.05); B(s, t, h, 0.12, sash, -w / 2 - t / 2, 0, 0.05); B(s, t, h, 0.12, sash, w / 2 + t / 2, 0, 0.05);
  // sill + head trim
  B(s, w + 0.36, 0.07, 0.2, trim, 0, -h / 2 - 0.06, 0.09); if (st !== 'tall') B(s, w + 0.3, 0.1, 0.1, trim, 0, h / 2 + t + 0.06, 0.06);
  if (st === 'cross') { B(s, 0.05, h, 0.06, trim, 0, 0, 0.05); B(s, w, 0.05, 0.06, trim, 0, 0, 0.05); }
  else { B(s, 0.045, h, 0.07, sash, w * 0.02, 0, 0.06); if (st === 'tall') B(s, w, 0.05, 0.06, sash, 0, -h * 0.28, 0.05); }
  if (o.shutter) for (const sx of [-1, 1]) B(s, w * 0.5, h + 0.12, 0.05, o.shutter, sx * (w / 2 + t + w * 0.25 + 0.03), 0, 0.03);
  if (o.box) { // flower box under the sill
    B(s, w + 0.2, 0.24, 0.26, o.boxM || A.trimBrown, 0, -h / 2 - 0.24, 0.15); const R = mulberry(Math.floor((x + 7) * 131 + y * 17));
    for (let k = 0; k < 6; k++) { const fx = -w / 2 + 0.05 + k * (w - 0.1) / 5; SP(s, 0.11, k % 2 ? A.plant : A.plant2, fx, -h / 2 - 0.08, 0.16, 0.8, 6); SP(s, 0.07, MAT.flowers[Math.floor(R() * 5)], fx + 0.04, -h / 2 + 0.0, 0.2, 0.8, 6); }
  }
  if (o.grille) for (let k = 0; k < 6; k++) B(s, 0.025, h + 0.05, 0.025, A.sash, -w / 2 + (k + 0.5) * w / 6, 0, 0.14);
  if (o.hisashi) { const hz = B(s, w + 0.5, 0.06, 0.45, o.hisashi, 0, h / 2 + t + 0.2, 0.22); hz.rotation.x = 0.22; }
  if (o.tobukuro) B(s, w * 0.52, h + 0.14, 0.2, A.yakisugi, (w / 2 + t + w * 0.27) * o.tobukuro, 0, 0.1);
  return s;
}

// ---------- roof with real edges: fascia, verge boards, soffit, ridge, hip ridges, gutters ----------
function roofPart(g, o) {
  const A = archMats(); const { W, D, over, rise, hip, rbase, mat } = o; const EW = W + over * 2, ED = D + over * 2, hw = EW / 2, hd = ED / 2;
  const roof = new THREE.Mesh(roofGeometry(EW, ED, rise, hip), mat); roof.position.y = rbase + 0.03; roof.castShadow = roof.receiveShadow = true; g.add(roof);
  const sof = new THREE.Mesh(roof.geometry, o.soffit || A.soffit); sof.position.y = rbase - 0.13; sof.receiveShadow = true; g.add(sof);
  const fas = o.fascia || A.trim, th = 0.24;
  for (const s of [-1, 1]) B(g, EW + 0.06, th, 0.08, fas, 0, rbase - 0.04, s * (hd + 0.02));
  const rl = hip ? Math.max(0.01, hw - hd) : hw;
  if (hip) for (const s of [-1, 1]) B(g, 0.08, th, ED + 0.06, fas, s * (hw + 0.02), rbase - 0.04, 0);
  else { const L = Math.hypot(hd, rise), a = Math.atan2(rise, hd); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const b = B(g, 0.09, th + 0.04, L + 0.12, fas, sx * (hw + 0.03), rbase + rise / 2 - 0.02, sz * hd / 2); b.rotation.x = sz * a; } }
  const kawara = mat === MAT.kawara || mat === MAT.kawaraRed;
  const rm = o.ridge || (kawara ? (mat === MAT.kawaraRed ? A.ridgeKr : A.ridgeK) : mat);
  if (kawara) {
    CY(g, 0.16, rl * 2 + 0.3, rm, 0, rbase + rise + 0.12, 0, 10, 0, Math.PI / 2); B(g, rl * 2 + 0.2, 0.16, 0.3, rm, 0, rbase + rise + 0.02, 0);
    if (!hip) for (const sx of [-1, 1]) { const oni = sub(g, sx * (rl + 0.18), rbase + rise + 0.1, 0, sx * Math.PI / 2); B(oni, 0.62, 0.42, 0.14, rm, 0, 0.02, 0); SP(oni, 0.16, rm, 0, 0.22, 0, 1, 8); }
    else { for (const sx of [-1, 1]) for (const sz of [-1, 1]) ROD(g, 0.12, rm, [sx * rl, rbase + rise + 0.1, 0], [sx * (hw - 0.1), rbase + 0.12, sz * (hd - 0.1)], 8); for (const sx of [-1, 1]) SP(g, 0.2, rm, sx * rl, rbase + rise + 0.2, 0, 1, 8); }
  } else {
    const r = CY(g, 0.2, rl * 2 + 0.25, rm, 0, rbase + rise + 0.02, 0, 3, 0, Math.PI / 2); r.rotation.set(0, 0, Math.PI / 2); r.rotateY(Math.PI / 2);
    if (hip) for (const sx of [-1, 1]) for (const sz of [-1, 1]) ROD(g, 0.08, rm, [sx * rl, rbase + rise + 0.06, 0], [sx * (hw - 0.05), rbase + 0.08, sz * (hd - 0.05)], 4);
  }
  // gutters + downspouts
  if (o.gutter !== false) { const gm = o.gutterM || A.gutter, gy = rbase - 0.17;
    for (const s of [-1, 1]) { CY(g, 0.075, EW, gm, 0, gy, s * (hd + 0.1), 8, 0, Math.PI / 2); }
    if (hip) for (const s of [-1, 1]) CY(g, 0.075, ED, gm, s * (hw + 0.1), gy, 0, 8, Math.PI / 2, 0);
    const wy = o.wallTop; for (const [sx, sz] of [[-1, 1], [1, -1]]) { const x = sx * (W / 2 - 0.22), z = sz * (D / 2 + 0.09); B(g, 0.09, 0.09, over + 0.12, gm, x, gy - 0.12, sz * (D / 2 + over / 2 + 0.08)); CY(g, 0.05, gy - 0.1, gm, x, (gy - 0.12) / 2 + 0.05, z, 6); B(g, 0.1, 0.1, 0.22, gm, x, 0.12, z + sz * 0.08); for (const yy of [1, (gy - 0.1) * 0.6]) B(g, 0.14, 0.05, 0.08, gm, x, yy, z - sz * 0.03); }
  }
  return { roof, rl };
}
function gableFill(g, W, D, rise, y1, yTop, m) { // triangular gable walls under a gable roof (x = ±W/2)
  for (const sx of [-1, 1]) { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute([sx * W / 2, 0, -D / 2, sx * W / 2, 0, D / 2, sx * W / 2, rise - y1, 0], 3)); gg.setIndex(sx > 0 ? [0, 2, 1] : [0, 1, 2]); gg.computeVertexNormals(); const gm = new THREE.Mesh(gg, m); gm.position.y = yTop; gm.castShadow = gm.receiveShadow = true; g.add(gm); }
}
// ---------- doors ----------
function doorWestern(g, x, z, B0, o) { // panel door + porch + canopy + lamp
  const A = archMats(), s = sub(g, x, 0, z, 0), dm = o.door;
  B(s, 1.1, 2.1, 0.08, dm, 0, B0 + 1.05, 0.03); B(s, 1.32, 0.12, 0.14, A.trim, 0, B0 + 2.16, 0.05); for (const sx of [-1, 1]) B(s, 0.11, 2.2, 0.14, A.trim, sx * 0.61, B0 + 1.08, 0.05);
  SP(s, 0.05, A.brass, 0.4, B0 + 1.0, 0.11, 1, 6); B(s, 0.05, 0.2, 0.04, A.brass, 0.4, B0 + 1.0, 0.08);
  // porch steps
  B(s, 1.9, B0 - 0.05, 1.3, A.pave, 0, (B0 - 0.05) / 2, 0.65); B(s, 1.6, B0 * 0.5, 0.35, A.pave, 0, B0 * 0.25, 1.475);
  // wall lamp
  const L = sub(s, -0.95, B0 + 1.75, 0.08); B(L, 0.12, 0.3, 0.06, AM.dark, 0, 0, 0); const lb = CY(L, 0.09, 0.22, MAT.lamp, 0, -0.02, 0.12, 8); HOUSE_LIGHTS.push(lb); CY(L, 0.13, 0.05, AM.dark, 0, 0.11, 0.12, 8, 0, 0, 0, 0.06);
  // canopy: little gable roof on brackets
  const cw = 2.1, cd = 1.0, cy = B0 + 2.45, cr = new THREE.Mesh(roofGeometry(cw, cd * 2, 0.45, false), o.roofM); cr.position.set(0, cy, 0); cr.castShadow = true; s.add(cr);
  const cs = new THREE.Mesh(roofGeometry(cw - 0.02, cd * 2 - 0.02, 0.45, false), A.soffit); cs.position.set(0, cy - 0.06, 0); s.add(cs);
  B(s, cw + 0.04, 0.12, 0.06, A.trim, 0, cy - 0.02, cd); for (const sx of [-1, 1]) { ROD(s, 0.04, A.trim, [sx * 0.85, cy - 0.5, 0.06], [sx * 0.85, cy - 0.05, cd - 0.15], 5); B(s, 0.08, 0.5, 0.08, A.trim, sx * 0.85, cy - 0.3, 0.06); }
  return s;
}
function doorJapanese(g, x, z, B0, o) { // 格子戸 sliding entrance + 庇 + lamp + 表札
  const A = archMats(), s = sub(g, x, 0, z, 0);
  B(s, 1.9, 2.05, 0.06, A.koshi, 0, B0 + 1.03, 0.03); B(s, 2.15, 0.14, 0.16, MAT.darkwood, 0, B0 + 2.12, 0.06); for (const sx of [-1, 1]) B(s, 0.14, 2.2, 0.16, MAT.darkwood, sx * 1.02, B0 + 1.05, 0.06); B(s, 0.06, 2.0, 0.08, MAT.darkwood, 0, B0 + 1.03, 0.08);
  B(s, 2.4, B0 - 0.04, 1.2, AM.stone, 0, (B0 - 0.04) / 2, 0.6);
  const hz = B(s, 2.8, 0.08, 1.1, o.roofM, 0, B0 + 2.55, 0.5); hz.rotation.x = 0.25; B(s, 2.8, 0.05, 1.0, A.soffitWood, 0, B0 + 2.48, 0.48).rotation.x = 0.25;
  for (const sx of [-1, 1]) ROD(s, 0.035, MAT.darkwood, [sx * 1.25, B0 + 2.1, 0.05], [sx * 1.25, B0 + 2.42, 0.9], 5);
  const L = sub(s, 1.35, B0 + 1.7, 0.06); B(L, 0.18, 0.28, 0.14, MAT.darkwood, 0, 0, 0.05); const lb = B(L, 0.13, 0.2, 0.1, MAT.lamp, 0, 0, 0.1); HOUSE_LIGHTS.push(lb);
  B(s, 0.18, 0.42, 0.04, A.boardLight, -1.3, B0 + 1.5, 0.05);
  return s;
}
// ---------- balcony with railing (+ optional laundry) ----------
function balconyPart(g, x, y, z, w, d, o) {
  const A = archMats(), s = sub(g, x, y, z, 0), rm = o.rail || A.rail;
  B(s, w, 0.18, d, A.trim, 0, -0.09, d / 2); for (const sx of [-1, 1]) { const br = B(s, 0.1, 0.45, 0.1, A.trim, sx * (w / 2 - 0.3), -0.35, d * 0.35); br.rotation.x = -0.6; }
  const H = 1.0; B(s, w + 0.06, 0.07, 0.1, rm, 0, H, d - 0.04); for (const sx of [-1, 1]) B(s, 0.1, 0.07, d, rm, sx * w / 2, H, d / 2);
  for (const sx of [-1, 1]) B(s, 0.1, H, 0.1, rm, sx * w / 2, H / 2, d - 0.04);
  const n = Math.floor(w / 0.16); for (let k = 1; k < n; k++) B(s, 0.04, H - 0.05, 0.04, rm, -w / 2 + k * w / n, H / 2, d - 0.04);
  for (const sx of [-1, 1]) for (let k = 1; k < 6; k++) B(s, 0.04, H - 0.05, 0.04, rm, sx * w / 2, H / 2, k * d / 6);
  B(s, w, 0.06, 0.06, rm, 0, 0.12, d - 0.04);
  if (o.laundry) { const py = 1.75; for (const sx of [-1, 1]) { B(s, 0.04, 0.04, 0.55, A.railM, sx * (w / 2 - 0.15), py, 0.28); B(s, 0.04, 0.4, 0.04, A.railM, sx * (w / 2 - 0.15), py + 0.2, 0.04); }
    CY(s, 0.025, w - 0.2, A.railM, 0, py + 0.02, 0.5, 6, 0, Math.PI / 2); const R = mulberry(o.seed || 1);
    for (let k = 0; k < 5; k++) { if (R() < 0.25) continue; const cx = -w / 2 + 0.45 + k * (w - 0.9) / 4, m = A.cloth[Math.floor(R() * A.cloth.length)], tall = R() < 0.5;
      if (tall) { B(s, 0.42, 0.55, 0.02, m, cx, py - 0.26, 0.5); B(s, 0.68, 0.16, 0.02, m, cx, py - 0.07, 0.5); } else B(s, 0.4, 0.38, 0.02, m, cx, py - 0.18, 0.5); }
  }
  return s;
}
// ---------- exterior equipment ----------
function acUnit(g, x, z, ry) { const A = archMats(), s = sub(g, x, 0, z, ry); B(s, 0.82, 0.58, 0.3, A.acBody, 0, 0.38, 0); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.56), A.ac); f.position.set(0, 0.38, 0.152); s.add(f); for (const sx of [-1, 1]) B(s, 0.08, 0.08, 0.36, AM.dark, sx * 0.3, 0.05, 0); B(s, 0.1, 0.1, 0.3, A.acBody, 0.36, 0.55, -0.2); return s; }
function gasTanks(g, x, z, ry) { const A = archMats(), s = sub(g, x, 0, z, ry); for (const sx of [-0.22, 0.22]) { CY(s, 0.19, 1.05, A.gas, sx, 0.58, 0, 12); SP(s, 0.19, A.gas, sx, 1.1, 0, 0.5, 10); CY(s, 0.07, 0.12, A.gasCap, sx, 1.24, 0, 8); CY(s, 0.17, 0.08, AM.dark, sx, 0.06, 0, 12); } B(s, 0.3, 0.36, 0.14, A.meter, 0, 1.45, -0.12); return s; }
function heatPump(g, x, z, ry) { const A = archMats(), s = sub(g, x, 0, z, ry); B(s, 0.62, 1.75, 0.62, A.acBody, 0, 0.92, 0); B(s, 0.6, 0.05, 0.6, A.trim, 0, 1.82, 0); B(s, 0.2, 0.08, 0.02, AM.dark, 0, 1.4, 0.32); return s; }
function pottedPlant(g, x, z, big, R) { const A = archMats(); const r = big ? 0.24 : 0.16; CY(g, r, r * 1.5, R() < 0.5 ? A.pot : A.potW, x, r * 0.75, z, 10, 0, 0, 0, r * 0.78); if (R() < 0.5) { for (let k = 0; k < 3; k++) SP(g, r * (1.1 - k * 0.2), A.plant, x + (R() - 0.5) * 0.1, r * 1.5 + 0.1 + k * r * 0.7, z + (R() - 0.5) * 0.1, 0.9, 7); } else { SP(g, r * 1.4, A.plant2, x, r * 1.5 + r * 0.9, z, 0.85, 8); for (let k = 0; k < 4; k++) SP(g, 0.06, MAT.flowers[Math.floor(R() * 5)], x + Math.cos(k * 1.6) * r, r * 1.5 + r * 1.3, z + Math.sin(k * 1.6) * r, 1, 5); } }
function shrub(g, x, z, r, R, m) { const A = archMats(); const mm = m || (R() < 0.5 ? A.plant : A.plant2); SP(g, r, mm, x, r * 0.75, z, 0.8, 8); SP(g, r * 0.7, mm, x + r * 0.5, r * 0.6, z + r * 0.3, 0.8, 7); SP(g, r * 0.65, mm, x - r * 0.5, r * 0.55, z - r * 0.2, 0.8, 7); }
function bicycle(g, x, z, ry, m) { const A = archMats(), s = sub(g, x, 0, z, ry); for (const zz of [-0.5, 0.5]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 6, 16), A.tire); t.position.set(0, 0.34, zz); t.rotation.y = Math.PI / 2; s.add(t); }
  ROD(s, 0.025, m, [0, 0.34, -0.5], [0, 0.62, -0.05]); ROD(s, 0.025, m, [0, 0.34, -0.5], [0, 0.34, 0.05]); ROD(s, 0.025, m, [0, 0.34, 0.05], [0, 0.62, -0.05]); ROD(s, 0.025, m, [0, 0.62, -0.05], [0, 0.66, 0.38]); ROD(s, 0.025, m, [0, 0.66, 0.38], [0, 0.34, 0.5]); ROD(s, 0.025, m, [0, 0.66, 0.38], [0, 0.9, 0.42]);
  B(s, 0.5, 0.03, 0.03, AM.dark, 0, 0.92, 0.42); B(s, 0.12, 0.05, 0.24, AM.dark, 0, 0.7, -0.08); B(s, 0.3, 0.2, 0.28, A.railM, 0, 0.82, 0.62); return s; }
function stoneLantern(g, x, z) { const A = archMats(), s = sub(g, x, 0, z, 0), m = AM.block; CY(s, 0.22, 0.12, m, 0, 0.06, 0, 8); CY(s, 0.08, 0.6, m, 0, 0.42, 0, 8); B(s, 0.34, 0.08, 0.34, m, 0, 0.76, 0); B(s, 0.26, 0.26, 0.26, m, 0, 0.93, 0); const r = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.24, 4), m); r.position.y = 1.18; r.rotation.y = Math.PI / 4; r.castShadow = true; s.add(r); SP(s, 0.06, m, 0, 1.33, 0, 1, 6); return s; }
function vendingMachine(g, x, z, ry, k) { const A = archMats(), s = sub(g, x, 0, z, ry); B(s, 0.95, 1.85, 0.72, A.vend[k % A.vend.length], 0, 0.93, 0); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.64), A.vendFace); f.position.set(0, 0.98, 0.362); s.add(f); B(s, 1.0, 0.06, 0.76, AM.dark, 0, 1.88, 0); return s; }
function nobori(g, x, z, ry, text, bg, fg) { const s = sub(g, x, 0, z, ry); CY(s, 0.03, 2.6, MAT.metal, 0, 1.3, 0, 6); B(s, 0.55, 0.03, 0.03, MAT.metal, 0.27, 2.55, 0);
  const [c, cx] = cvs(64, 256); cx.fillStyle = bg; cx.fillRect(0, 0, 64, 256); cx.fillStyle = fg; cx.font = '40px "Mochiy Pop One", "M PLUS Rounded 1c", sans-serif'; cx.textAlign = 'center'; [...text].forEach((ch, i) => cx.fillText(ch, 32, 52 + i * 48)); cx.fillStyle = fg; cx.fillRect(0, 0, 64, 10);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 1.9), new THREE.MeshStandardMaterial({ map: toTex(c, false), roughness: 0.85, side: THREE.DoubleSide })); m.position.set(0.28, 1.6, 0); s.add(m); return s; }
function bench(g, x, z, ry, m) { const A = archMats(), s = sub(g, x, 0, z, ry); for (let k = 0; k < 3; k++) B(s, 1.5, 0.05, 0.12, m || MAT.wood, 0, 0.45, -0.15 + k * 0.15); for (let k = 0; k < 2; k++) B(s, 1.5, 0.1, 0.04, m || MAT.wood, 0, 0.7 + k * 0.16, -0.26); for (const sx of [-0.65, 0.65]) { B(s, 0.06, 0.45, 0.06, AM.dark, sx, 0.22, 0.1); B(s, 0.06, 0.85, 0.06, AM.dark, sx, 0.42, -0.24); B(s, 0.06, 0.05, 0.4, AM.dark, sx, 0.42, -0.05); } return s; }

// ---------- merge a group's static meshes per material (local coords), keeping dynamic parts ----------
function mergeLocal(root) {
  root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), buckets = new Map(), keep = [];
  root.traverse(o => { if (o === root) return; if (o.userData.keep) { keep.push(o); return; } let p = o.parent; while (p && p !== root) { if (p.userData.keep) return; p = p.parent; }
    if (!o.isMesh || o.isInstancedMesh) { if (o.isInstancedMesh || o.isSprite || o.isPoints || o.isLine) keep.push(o); return; }
    const key = o.material.uuid + '|' + (o.castShadow ? 1 : 0); let gg = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); gg.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    for (const k of Object.keys(gg.attributes)) if (!['position', 'normal', 'uv'].includes(k)) gg.deleteAttribute(k);
    if (!gg.attributes.uv) gg.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(gg.attributes.position.count * 2), 2)); if (!gg.attributes.normal) gg.computeVertexNormals();
    if (!buckets.has(key)) buckets.set(key, { mat: o.material, cast: o.castShadow, list: [] }); buckets.get(key).list.push(gg); });
  const out = new THREE.Group(); out.position.copy(root.position); out.quaternion.copy(root.quaternion); out.scale.copy(root.scale); Object.assign(out.userData, root.userData);
  for (const { mat, cast, list } of buckets.values()) { const m = new THREE.Mesh(mergeGeometries(list), mat); m.castShadow = cast; m.receiveShadow = true; out.add(m); }
  for (const o of keep) { const lm = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld); o.parent && o.parent.remove(o); lm.decompose(o.position, o.quaternion, o.scale); out.add(o); }
  return out;
}

// modern Japanese house walls: panels / tile-pattern / mortar, with corner pieces in the wall colour (no white corner boards)
function archJWalls() {
  if (AM.jw) return AM.jw; const L = [];
  const mk = (tex, sc, c, r) => ({ m: worldMat(tex, sc, c, r), corner: stdM('#' + new THREE.Color(c).multiplyScalar(0.84).getHexString(), 0.6) });
  for (const c of ['#f2efe8', '#e3ded3', '#d3cfc6', '#b8b2a7', '#8a8680', '#5d5c5b', '#cdbb9f', '#e9e3d8']) L.push(mk(TEX.panelJ, 0.366, c, 0.7));
  for (const c of ['#dccfb9', '#c3a586', '#b6afa3', '#e2d9c8', '#9a8874']) L.push(mk(TEX.tileJ, 0.366, c, 0.8));
  for (const c of ['#f4efe4', '#ece5d6', '#e2ddd2']) L.push(mk(TEX.plaster, 0.35, c, 0.92));
  L.accent = [stdM('#5a4a3f', 0.6), stdM('#3d4045', 0.55), stdM('#f1eee7', 0.55)];
  return (AM.jw = L);
}
// ===================== houses =====================
function makeHouse(hs) {
  const A = archMats(), R = mulberry(hs.seed), g = new THREE.Group(), W = hs.w, D = hs.d, fh = 2.75, H = hs.floors * fh, B0 = 0.45;
  const kind = hs.kind, minka = kind === 'minka', shop = kind === 'shop', modern = !minka && !shop;
  const pick = a => a[Math.floor(R() * a.length)];
  const cur = Math.floor(R() * A.win.length), cur2 = Math.floor(R() * A.win.length);
  let wallM = hs.wallM, cornerM = null, bandM = null;
  if (!wallM) { if (minka) wallM = pick(AM.plaster); else if (shop) wallM = A.siding[0]; else { R(); const RW = mulberry(hs.seed * 7 + 13), jw = archJWalls(), w = jw[Math.floor(RW() * jw.length)]; wallM = w.m; cornerM = w.corner; bandM = RW() < 0.55 ? w.corner : jw.accent[Math.floor(RW() * jw.accent.length)]; } }
  const trimM = minka ? MAT.darkwood : (A.trimJ || (A.trimJ = stdM('#8c877e', 0.55, 0.2)));
  // ----- foundation, base flashing, walls -----
  B(g, W + 0.14, B0, D + 0.14, A.found, 0, B0 / 2, 0);
  for (const s of [-1, 1]) for (let k = 0; k < Math.floor(W / 2.4); k++) B(g, 0.36, 0.12, 0.03, A.vent, -W / 2 + (k + 0.5) * W / Math.floor(W / 2.4), B0 * 0.5, s * (D / 2 + 0.075));
  B(g, W + 0.12, 0.05, D + 0.12, A.gutter, 0, B0 + 0.02, 0);
  B(g, W, H, D, wallM, 0, B0 + H / 2, 0);
  if (minka) {
    B(g, W + 0.05, 1.0, D + 0.05, A.yakisugi, 0, B0 + 0.5, 0); B(g, W + 0.09, 0.08, D + 0.09, MAT.darkwood, 0, B0 + 1.02, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 0.17, H, 0.17, MAT.darkwood, sx * W / 2, B0 + H / 2, sz * D / 2);
    for (let f = 1; f <= hs.floors; f++) for (const s of [-1, 1]) { B(g, W + 0.08, 0.15, 0.07, MAT.darkwood, 0, B0 + f * fh - 0.1, s * (D / 2 + 0.03)); B(g, 0.07, 0.15, D + 0.08, MAT.darkwood, s * (W / 2 + 0.03), B0 + f * fh - 0.1, 0); }
  } else {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, cornerM ? 0.1 : 0.17, H, cornerM ? 0.1 : 0.17, cornerM || A.trim, sx * W / 2, B0 + H / 2, sz * D / 2);
    if (hs.floors > 1) B(g, W + 0.08, cornerM ? 0.2 : 0.16, D + 0.08, bandM || A.trim, 0, B0 + fh, 0);
    B(g, W + 0.06, 0.2, D + 0.06, cornerM || A.trim, 0, B0 + H - 0.1, 0);
  }
  // ----- balcony (2-storey) -----
  let bal = null;
  if (hs.floors > 1 && !shop && (modern || R() < 0.5)) { const bw = Math.min(W * 0.5, 3.8), side = R() < 0.5 ? -1 : 1; bal = { x: side * (W / 2 - bw / 2 - 0.35), w: bw }; balconyPart(g, bal.x, B0 + fh + 0.05, D / 2, bw, 1.05, { rail: minka ? MAT.darkwood : (A.aluFence || (A.aluFence = stdM('#4a3e36', 0.45, 0.5))), laundry: R() < 0.7, seed: hs.seed }); }
  // ----- windows -----
  const shut = null, boxes = modern ? R() < 0.7 : R() < 0.3;
  const wopt = minka || modern ? { style: 'slide', trim: minka ? MAT.darkwood : (A.trimJ || (A.trimJ = stdM('#8c877e', 0.55, 0.2))), sash: A.sashBr, cur } : { style: 'cross', trim: A.trim, cur, shutter: shut };
  for (let f = 0; f < hs.floors; f++) {
    const y = B0 + f * fh + 1.45, nf = Math.max(1, Math.floor(W / 2.8));
    for (let k = 0; k < nf; k++) { const x = -W / 2 + (k + 0.5) * W / nf;
      // front
      const doorZone = f === 0 && Math.abs(x) < 1.5, balZone = f === 1 && bal && Math.abs(x - bal.x) < bal.w / 2 + 0.6;
      if (!(doorZone || balZone || (shop && f === 0))) winPart(g, x, y, D / 2 + 0.01, 0, minka ? 1.5 : 1.15, minka ? 1.05 : 1.25, Object.assign({}, wopt, { box: f === 0 && boxes, hisashi: minka && f === 0 ? MAT.kawara : null, tobukuro: minka && f === 0 && k === 0 ? -1 : 0, shutter: f === 0 || R() < 0.7 ? wopt.shutter : null }));
      // back
      winPart(g, x, y, -D / 2 - 0.01, Math.PI, minka ? 1.4 : 1.1, minka ? 1.0 : 1.15, Object.assign({}, wopt, { cur: cur2, shutter: null, grille: minka && f === 0 && R() < 0.5 }));
    }
    for (const s of [-1, 1]) winPart(g, s * (W / 2 + 0.01), y, (f % 2 ? -0.6 : 0.6) * (D > 6.6 ? 1 : 0), s * Math.PI / 2, minka ? 1.0 : 0.85, minka ? 0.9 : 1.0, Object.assign({}, wopt, { cur: (cur + 2) % A.win.length, shutter: null, grille: minka && f === 0 }));
  }
  if (bal) winPart(g, bal.x, B0 + fh + 1.12, D / 2 + 0.01, 0, Math.min(1.9, bal.w - 0.6), 1.95, { style: 'tall', trim: minka ? MAT.darkwood : A.trim, sash: minka ? A.sashBr : A.sash, cur });
  // gable round window (cute) for western houses
  // ----- roof -----
  const over = minka ? 0.75 : 0.55, rise = modern ? 1.75 : shop ? 1.6 : (hs.hip ? 2.0 : 2.3);
  const rm = hs.roofM || (modern ? (R() < 0.55 ? MAT.kawara : pick([MAT.metalRoof[4], MAT.metalRoof[0], AM.slateJ || (AM.slateJ = new THREE.MeshStandardMaterial({ map: TEX.kawara, color: '#55585e', roughness: 0.55, metalness: 0.2 }))])) : shop ? MAT.metalRoof[1] : (R() < 0.45 ? MAT.kawaraRed : R() < 0.75 ? MAT.kawara : pick(MAT.metalRoof)));
  const hip = minka && hs.hip, y1 = rise * over / (D / 2 + over), rbase = B0 + H - y1;
  roofPart(g, { W, D, over, rise, hip, rbase, mat: rm, soffit: minka ? A.soffitWood : A.soffit, fascia: minka ? MAT.darkwood : A.trim, gutterM: minka ? A.gutterBr : A.gutter, wallTop: B0 + H });
  if (!hip) { gableFill(g, W, D, rise, y1, B0 + H, minka ? A.yakisugi : wallM);  }
  if (modern && R() < 0.4) { CY(g, 0.09, 1.0, AM.dark, W / 4, rbase + rise * 0.6 + 0.4, -D / 4, 8); CY(g, 0.15, 0.08, AM.dark, W / 4, rbase + rise * 0.6 + 0.92, -D / 4, 8); }
  // ----- entrance -----
  const doorM = pick(A.door);
  if (!shop) doorJapanese(g, 0, D / 2, B0, { roofM: rm === MAT.kawara || rm === MAT.kawaraRed ? rm : minka ? MAT.kawara : rm });
  // ----- side & back equipment -----
  acUnit(g, W / 2 + 0.3, -D / 4, Math.PI / 2); B(g, 0.12, Math.min(H - 0.6, 2.6), 0.12, A.acBody, W / 2 + 0.07, B0 + 1.3, -D / 4 + 0.25);
  if (minka || R() < 0.5) gasTanks(g, -W / 2 + 0.9, -D / 2 - 0.35, Math.PI); else heatPump(g, -W / 2 - 0.42, -D / 2 + 0.8, -Math.PI / 2);
  B(g, 0.3, 0.42, 0.14, A.meter, W / 2 - 0.6, B0 + 1.0, -D / 2 - 0.08);
  // ----- garden -----
  const fz = D / 2 + 2.6, fw = W + 2.4;
  const beds = R() < 0.25;
  if (minka) { // low block wall topped with a clipped hedge, stone gate posts
    for (const sx of [-1, 1]) { const len = fw / 2 - 1.0, cx = sx * (fw / 4 + 0.5); B(g, len, 0.5, 0.2, A.block, cx, 0.25, fz); B(g, len + 0.04, 0.06, 0.26, A.block, cx, 0.53, fz); B(g, len - 0.06, 0.55, 0.5, A.hedge, cx, 0.85, fz - 0.05); B(g, len - 0.2, 0.12, 0.38, A.hedge, cx, 1.16, fz - 0.05);
      B(g, 0.2, 0.5, (fz - D / 2) - 0.2, A.block, sx * fw / 2, 0.25, (D / 2 + fz) / 2); B(g, 0.45, 0.5, (fz - D / 2) - 0.4, A.hedge, sx * fw / 2 - sx * 0.12, 0.78, (D / 2 + fz) / 2);
      B(g, 0.36, 1.25, 0.36, A.stone, sx * 1.05, 0.62, fz); B(g, 0.46, 0.1, 0.46, A.block, sx * 1.05, 1.28, fz); }
    for (let k = 0; k < 3; k++) { const st = CY(g, 0.32 + R() * 0.08, 0.08, A.flag, (R() - 0.5) * 0.3, 0.04, D / 2 + 1.0 + k * 0.62, 7); st.rotation.y = R() * 3; }
    if (!beds) { shrub(g, -W / 2 + 0.9, D / 2 + 1.3, 0.55, R); shrub(g, W / 2 - 1.2, D / 2 + 1.2, 0.45, R); if (R() < 0.6) stoneLantern(g, W / 2 - 2.4, D / 2 + 1.7); }
    for (let k = 0; k < 3; k++) pottedPlant(g, -1.5 - k * 0.45, D / 2 + 0.35, false, R);
  } else { // ブロック塀 + アルミフェンス, 門柱, concrete approach (a Japanese modern house)
    const alu = A.aluFence || (A.aluFence = stdM('#4a3e36', 0.45, 0.5)), cap = A.block;
    for (const sx of [-1, 1]) { const len = fw / 2 - 1.1, cx = sx * (fw / 4 + 0.55); B(g, len, 0.6, 0.15, A.block, cx, 0.3, fz); B(g, len + 0.04, 0.05, 0.19, cap, cx, 0.62, fz);
      for (let k = 0; k <= Math.floor(len / 0.12); k++) B(g, 0.03, 0.6, 0.03, alu, cx - len / 2 + k * 0.12, 0.95, fz); B(g, len, 0.05, 0.05, alu, cx, 1.27, fz);
      B(g, 0.15, 0.6, fz - D / 2 - 0.2, A.block, sx * fw / 2, 0.3, (D / 2 + fz) / 2);
      B(g, 0.42, 1.25, 0.42, A.block, sx * 1.05, 0.62, fz); B(g, 0.48, 0.06, 0.48, cap, sx * 1.05, 1.27, fz); }
    { const np = stdM('#e8e2d2', 0.5); B(g, 0.3, 0.12, 0.02, np, -1.05, 1.02, fz + 0.22); B(g, 0.1, 0.14, 0.03, AM.dark, -1.05, 0.82, fz + 0.22); }
    B(g, 1.9, 0.05, fz - D / 2, A.pave, 0, 0.03, (D / 2 + fz) / 2);
    for (let k = 0; k < 2; k++) pottedPlant(g, W / 2 - 0.5 - k * 0.48, D / 2 + 0.4, k === 0, R);
    if (R() < 0.5) shrub(g, -W / 2 - 0.3, -D / 2 + 0.6, 0.5, R);
  }
  if (beds) for (const sx of [-1, 1]) { const bx = sx * (W / 4 + 0.6), bw = W / 2 - 1.4; B(g, bw + 0.14, 0.2, 0.92, A.block, bx, 0.1, D / 2 + 1.35); B(g, bw, 0.2, 0.78, MAT.soil, bx, 0.11, D / 2 + 1.35);
    for (let k = 0; k < 9; k++) { const fx = bx - (bw - 0.2) / 2 + k * (bw - 0.2) / 8, fzz = D / 2 + 1.2 + (k % 2) * 0.3; SP(g, 0.14, k % 2 ? A.plant : A.plant2, fx, 0.3, fzz, 0.7, 7); SP(g, 0.09, MAT.flowers[(k + Math.floor(R() * 5)) % 5], fx + 0.03, 0.46, fzz + 0.02, 0.8, 6); SP(g, 0.07, MAT.flowers[(k + 2) % 5], fx - 0.06, 0.42, fzz - 0.04, 0.8, 5); } }
  if (R() < 0.35 && !shop) bicycle(g, -W / 2 - 0.55, D / 2 - 0.9, 0.15, pick(A.bike));
  // mailbox (by the gate)
  { const mb = A.mailbox || (A.mailbox = stdM('#3e4246', 0.45, 0.4)); B(g, 0.36, 0.42, 0.14, mb, 1.05, 0.95, fz + 0.29); B(g, 0.26, 0.03, 0.02, AM.dark, 1.05, 1.06, fz + 0.37); }
  // laundry pole in the back yard, a persimmon tree by the side (orange fruit in autumn)
  if (!shop && R() < 0.5) laundryPole(g, (R() - 0.5) * (W - 3), -D / 2 - 1.1, R);
  if (!shop && (minka ? R() < 0.45 : R() < 0.15)) persimmon(g, (R() < 0.5 ? -1 : 1) * (W / 2 + 1.0), -D / 4, R);
  if (shop) shopFront(g, hs, { W, D, B0, H, fh, rm, R });
  // colliders (same footprint as before)
  { const cs = Math.cos(hs.rot), sn = Math.sin(hs.rot);
    for (const sx of [-1, 1]) { const lx = sx * (fw / 4 + 0.5), lz = fz; addCollider({ x: hs.x + lx * cs + lz * sn, z: hs.z - lx * sn + lz * cs, hw: fw / 4 - 0.5, hd: 0.14, rot: hs.rot }); }
    for (const sx of [-1, 1]) { const lx = sx * fw / 2, lz = (D / 2 + fz) / 2; addCollider({ x: hs.x + lx * cs + lz * sn, z: hs.z - lx * sn + lz * cs, hw: 0.14, hd: (fz - D / 2) / 2, rot: hs.rot }); } }
  g.position.set(hs.x, hs.y, hs.z); g.rotation.y = hs.rot;
  addCollider({ x: hs.x, z: hs.z, hw: W / 2 + 0.2, hd: D / 2 + 0.2, rot: hs.rot, kind: 'bld' });
  { const [ax, az] = toWorld(hs, W / 2 + 0.3, -D / 4); addCollider({ x: ax, z: az, hw: 0.2, hd: 0.45, rot: hs.rot, kind: 'bld' }); }
  return g;
}
// corner shop: false-front facade with sign, striped awning with scallops, display windows, vending machines, banners
function shopFront(g, hs, o) {
  const A = archMats(), { W, D, B0, H, R } = o, z = D / 2;
  // 看板建築: a facade wall rising above the roof eave
  const FH = H + 1.5; B(g, W + 0.3, FH, 0.3, A.siding[4], 0, B0 + FH / 2, z + 0.15); B(g, W + 0.5, 0.18, 0.45, A.trim, 0, B0 + FH + 0.05, z + 0.15); B(g, W + 0.4, 0.12, 0.4, A.trim, 0, B0 + H - 0.1, z + 0.17);
  for (const sx of [-1, 1]) B(g, 0.24, FH, 0.42, A.trim, sx * (W / 2 + 0.1), B0 + FH / 2, z + 0.15);
  B(g, W - 1.0, 1.25, 0.06, A.trimBrown, 0, B0 + H + 0.75, z + 0.29);
  // storefront: display windows on both sides of glass sliding doors
  const fz = z + 0.31;
  for (const sx of [-1, 1]) { const dw = W / 2 - 1.5; const dm = new THREE.Mesh(new THREE.PlaneGeometry(dw, 1.7), A.disp); dm.position.set(sx * (1.25 + dw / 2), B0 + 1.35, fz); g.add(dm); B(g, dw + 0.12, 0.1, 0.14, A.sash, sx * (1.25 + dw / 2), B0 + 2.24, fz); B(g, dw + 0.2, 0.5, 0.2, A.brick, sx * (1.25 + dw / 2), B0 + 0.25, fz + 0.02); }
  for (const sx of [-1, 1]) { B(g, 1.1, 2.15, 0.04, A.win[4], sx * 0.56, B0 + 1.08, fz); B(g, 0.08, 2.2, 0.1, A.sash, sx * 1.15, B0 + 1.1, fz); } B(g, 0.06, 2.15, 0.08, A.sash, 0, B0 + 1.08, fz + 0.02); B(g, 2.4, 0.1, 0.12, A.sash, 0, B0 + 2.2, fz);
  B(g, 2.6, B0 - 0.04, 1.2, A.pave, 0, (B0 - 0.04) / 2, fz + 0.6);
  // striped awning with scalloped valance
  const aw = W + 0.2, ad = 1.7, am = pick2(A.awn, R), ay = B0 + 2.75; const a = new THREE.Mesh(new THREE.PlaneGeometry(aw, ad), am); a.rotation.x = -Math.PI / 2 + 0.38; a.position.set(0, ay - Math.sin(0.38) * ad / 2, fz + Math.cos(0.38) * ad / 2); a.castShadow = true; g.add(a);
  const vy = ay - Math.sin(0.38) * ad, vz = fz + Math.cos(0.38) * ad, nS = Math.round(aw / 0.4); const sm = A.awnSolid[A.awn.indexOf(am)];
  B(g, aw, 0.3, 0.03, sm, 0, vy - 0.14, vz); void nS; // a plain straight valance (日よけテント), like a Japanese corner shop
  for (const sx of [-1, 1]) ROD(g, 0.03, A.railM, [sx * (aw / 2 - 0.1), ay, fz], [sx * (aw / 2 - 0.1), vy, vz]);
  // vending machines, banners, bench, red post
  vendingMachine(g, -W / 2 + 0.55, z + 1.0, 0, 0); vendingMachine(g, -W / 2 + 1.6, z + 1.0, 0, 1);
  nobori(g, W / 2 - 0.4, z + 2.0, 0.3, 'アイス', '#ffffff', '#2f6fd8'); nobori(g, W / 2 - 1.3, z + 2.1, -0.2, 'やさい', '#3f8f5a', '#ffffff');
  bench(g, W / 2 - 1.3, z + 0.95, 0, MAT.wood);
  { const p = sub(g, -W / 2 - 0.9, 0, z + 2.0, 0); CY(p, 0.26, 1.15, MAT.red, 0, 0.58, 0, 14); SP(p, 0.26, MAT.red, 0, 1.15, 0, 0.6, 12); B(p, 0.3, 0.05, 0.02, AM.dark, 0, 0.95, 0.26); CY(p, 0.3, 0.08, AM.dark, 0, 0.04, 0, 14); }
  // the old roof-mounted sign position is no longer used; keep the vending machines lit
  HOUSE_LIGHTS.push({ material: A.vendFace });
}
function pick2(a, R) { return a[Math.floor(R() * a.length)]; }
function updateArchLights(night) { if (!AM.ok) return; for (const m of AM.win) m.emissiveIntensity = night * 1.1; AM.koshi.emissiveIntensity = night * 0.9; AM.disp.emissiveIntensity = 0.05 + night * 1.0; AM.vendFace.emissiveIntensity = 0.15 + night * 0.9; }

// 物干し: two T-posts, a pole and a few things drying
function laundryPole(g, x, z, R) { const s = sub(g, x, 0, z), m = stdM('#b8bcc0', 0.4, 0.6); for (const sx of [-1, 1]) { B(s, 0.06, 1.85, 0.06, m, sx * 1.1, 0.92, 0); B(s, 0.06, 0.06, 0.5, m, sx * 1.1, 1.8, 0); } CY(s, 0.02, 2.4, m, 0, 1.84, 0.18, 6, 0, Math.PI / 2); CY(s, 0.02, 2.4, m, 0, 1.84, -0.18, 6, 0, Math.PI / 2);
  const cols = ['#ffffff', '#e8eef6', '#f4d8d8', '#d8e8d8', '#3a4a6a', '#f2e6c8']; let x0 = -0.9; for (let k = 0; k < 4; k++) { const w = 0.35 + R() * 0.3, h = 0.4 + R() * 0.45, c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), stdM(cols[Math.floor(R() * cols.length)], 0.9, 0, { side: THREE.DoubleSide })); c.position.set(x0 + w / 2, 1.82 - h / 2, 0.18); c.castShadow = true; s.add(c); x0 += w + 0.12; if (x0 > 0.9) break; } }
// 柿の木
function persimmon(g, x, z, R) { const s = sub(g, x, 0, z), month = new Date().getMonth() + 1, fruit = month >= 9 || month <= 1, leafCol = month >= 11 || month <= 2 ? '#c8783a' : month >= 10 ? '#8a8a3a' : '#4f7a34';
  const tr = CY(s, 0.11, 1.4, stdM('#5a4636', 0.9), 0, 0.7, 0, 7); const br = CY(s, 0.06, 0.9, stdM('#5a4636', 0.9), 0.25, 1.5, 0, 6); br.rotation.z = -0.6;
  const lm = stdM(leafCol, 0.85); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; SP(s, 0.55 + R() * 0.2, lm, Math.cos(a) * 0.5, 1.9 + R() * 0.4, Math.sin(a) * 0.5, 0.75, 7); } SP(s, 0.6, lm, 0, 2.4, 0, 0.8, 7);
  if (fruit) { const fm = stdM('#f07a1a', 0.45); for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 0.6 + R() * 0.5; SP(s, 0.07, fm, Math.cos(a) * r, 1.6 + R() * 1.0, Math.sin(a) * r, 0.85, 6); } } }
