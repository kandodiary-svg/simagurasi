// ===================== BIG CITY-SCALE PROJECTS: マンション・リゾートホテル・タワーマンション =====================
BIG_DEV.push(
  { id: 'mansion', name: 'しおさいマンション', lv: 6, price: 220000, tour: 1, res: 24, place: 'player', w: 20, d: 19, icon: '🏢', note: '6階建てのマンション。島に住む人が24人ふえます（島民の数に入ります）' },
  { id: 'resort', name: 'ほしなみリゾートホテル', lv: 7, price: 500000, tour: 10, place: 'player', w: 36, d: 32, icon: '🏨', note: 'プールつきの9階建てリゾートホテル。観光客が大きくふえ、毎日の観光収入も大きく上がります' },
  { id: 'tower', name: 'ほしなみスカイタワー', lv: 7, price: 800000, tour: 3, res: 60, place: 'player', w: 22, d: 22, icon: '🏙️', note: '島でいちばん高い18階建てのタワーマンション。夜は窓と屋上がかがやきます。島民 +60人' },
);
function extraResidents() { let n = 0; for (const d of BIG_DEV) if (d.res && devDone(d.id)) n += d.res; return n; }
const HR = { win: [] };
function hrGlow(m) { (SEASON.glow = SEASON.glow || []).push(m); return m; }
// facade textures: a grid of windows; the emissive map lights a random share of them at night
function facadeTex(o) {
  const { cols, rows, wall, glass, frame, seed, lit = 0.55, curtain = true, cw = 64, ch = 64 } = o, R = mulberry(seed);
  const W = cols * cw, H = rows * ch; const draw = (x, night) => { x.fillStyle = night ? '#000' : wall; x.fillRect(0, 0, W, H);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const px = i * cw, py = j * ch, gx = px + cw * 0.08, gy = py + ch * 0.12, gw = cw * 0.84, gh = ch * 0.74, on = R() < lit;
      if (night) { if (on) { x.fillStyle = ['#ffd890', '#ffe8b8', '#fff4d8', '#ffc870'][Math.floor(R() * 4)]; x.fillRect(gx, gy, gw, gh); if (curtain) { x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(gx, gy, gw * 0.18, gh); x.fillRect(gx + gw * 0.82, gy, gw * 0.18, gh); } } else R(); continue; }
      R(); const gr = x.createLinearGradient(0, gy, 0, gy + gh); gr.addColorStop(0, glass[0]); gr.addColorStop(1, glass[1]); x.fillStyle = gr; x.fillRect(gx, gy, gw, gh);
      if (curtain) { x.fillStyle = ['#f4ede0', '#e8f0f4', '#f6e6d8'][Math.floor(R() * 3)]; x.fillRect(gx, gy, gw * 0.18, gh); x.fillRect(gx + gw * 0.82, gy, gw * 0.18, gh); }
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.moveTo(gx, gy + gh * 0.6); x.lineTo(gx + gw * 0.4, gy); x.lineTo(gx + gw * 0.55, gy); x.lineTo(gx, gy + gh * 0.85); x.fill();
      x.strokeStyle = frame; x.lineWidth = 3; x.strokeRect(gx, gy, gw, gh); x.beginPath(); x.moveTo(gx + gw / 2, gy); x.lineTo(gx + gw / 2, gy + gh); x.stroke(); } };
  const R0 = mulberry(seed); const [c1, x1] = cvs(W, H); draw(x1, false); const [c2, x2] = cvs(W, H); const s0 = R; draw(x2, true);
  const m = new THREE.MeshStandardMaterial({ map: toTex(c1, false), emissiveMap: toTex(c2, false), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.35, metalness: 0.1 }); HR.win.push(m); return m;
}
function hrPanel(g, w, h, m, x, y, z, ry) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; g.add(p); return p; }
function hrSign(text, w, h, bg, fg) { const t = txCanvas(512, Math.round(512 * h / w), (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = fg; x.font = `900 ${Math.round(H * 0.58)}px "Mochiy Pop One","M PLUS Rounded 1c",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H * 0.54); });
  const m = hrGlow(new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.1, roughness: 0.4 })); return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); }
const _MC = new Map(); function cM(c, r = 0.6, m = 0, ex = {}) { const k = [c, r, m, ex.side || 0].join('|'); if (!_MC.has(k)) _MC.set(k, stdM(c, r, m, ex)); return _MC.get(k); }
function simplePalm(g, x, z, H, R) { const s = sub(g, x, 0, z, R() * 6.28), bark = cM('#8a6a4a', 0.9), leaf = cM('#4f9a3a', 0.8, 0, { side: THREE.DoubleSide }); const lean = 0.3 + R() * 0.4; let px = 0, py = 0;
  for (let k = 0; k < 6; k++) { const ny = py + H / 6, nx = px + lean * (k / 6) * 0.5; ROD(s, 0.2 - k * 0.02, bark, [px, py, 0], [nx, ny, 0], 7); px = nx; py = ny; }
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, f = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 2.6), leaf); f.geometry.translate(0, 1.3, 0); f.position.set(px, py, 0); f.rotation.set(0, a, 0); f.rotateX(1.05 + R() * 0.3); f.castShadow = true; s.add(f); }
  SP(s, 0.3, cM('#6a4a2a', 0.7), px, py - 0.1, 0, 1, 8); return s; }
function parasol(g, x, z, col) { const s = sub(g, x, 0, z, 0); CY(s, 0.03, 2.3, cM('#f4f2ec', 0.4), 0, 1.15, 0, 6); const c = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.45, 10, 1, true), cM(col, 0.7, 0, { side: THREE.DoubleSide })); c.position.y = 2.35; c.castShadow = true; s.add(c);
  for (const sx of [-0.7, 0.7]) { B(s, 0.6, 0.12, 1.8, cM('#f8f8f4', 0.6), sx, 0.35, 0.9); B(s, 0.6, 0.5, 0.12, cM('#f8f8f4', 0.6), sx, 0.55, 0.05).rotation.x = -0.5; } return s; }
// ---------- しおさいマンション (6F apartment) ----------
DEV_BUILD.mansion = function (s) {
  const g = new THREE.Group(), A = archMats(), W = 16, D = 10, F = 6, fh = 3.0, B0 = 0.5, z0 = -3.6, R = mulberry(311);
  const wall = worldMat(TEX.concrete, 0.45, '#efe4d2', 0.9), tile = stdM('#9a7a5a', 0.7), slab = worldMat(TEX.concrete, 0.4, '#f6f2ea', 0.9), frost = stdM('#d8e6ee', 0.25, 0.1, { transparent: true, opacity: 0.82 }), rail = stdM('#7a8088', 0.4, 0.5);
  const b = sub(g, 0, 0, z0); B(b, W + 0.6, B0, D + 0.6, AM.block, 0, B0 / 2, 0); B(b, W, F * fh, D, wall, 0, B0 + F * fh / 2, 0);
  const fac = facadeTex({ cols: 4, rows: F - 1, wall: '#efe4d2', glass: ['#6f9ab8', '#a8cce0'], frame: '#c8ccd2', seed: 41, lit: 0.42 });
  hrPanel(b, W - 0.4, (F - 1) * fh, fac, 0, B0 + fh + (F - 1) * fh / 2, D / 2 + 0.02, 0);
  for (const sx of [-1, 1]) B(b, 0.5, F * fh + 0.2, 0.5, tile, sx * (W / 2 - 0.15), B0 + F * fh / 2, D / 2 - 0.1);
  for (let f = 1; f < F; f++) { const y = B0 + f * fh; B(b, W + 0.2, 0.18, 1.5, slab, 0, y, D / 2 + 0.75); B(b, W + 0.2, 1.0, 0.08, frost, 0, y + 0.55, D / 2 + 1.46); B(b, W + 0.2, 0.06, 0.1, rail, 0, y + 1.08, D / 2 + 1.46);
    for (let u = 1; u < 4; u++) B(b, 0.12, fh - 0.2, 1.4, slab, -W / 2 + u * W / 4, y + fh / 2 - 0.1, D / 2 + 0.75);
    for (let u = 0; u < 4; u++) { const ux = -W / 2 + (u + 0.5) * W / 4; if (R() < 0.45) B(b, 0.7, 0.5, 0.28, A.acBody, ux + 1.1, y + 0.36, D / 2 + 1.2); if (R() < 0.4) { const m = A.cloth[Math.floor(R() * A.cloth.length)]; B(b, 0.5, 0.6, 0.03, m, ux - 0.6, y + 1.5, D / 2 + 1.1); B(b, 0.4, 0.4, 0.03, A.cloth[Math.floor(R() * A.cloth.length)], ux, y + 1.6, D / 2 + 1.1); CY(b, 0.02, 2.2, rail, ux - 0.2, y + 1.85, D / 2 + 1.1, 5, 0, Math.PI / 2); } if (R() < 0.3) SP(b, 0.3, A.plant, ux - 1.2, y + 0.35, D / 2 + 1.2, 0.9, 7); } }
  // ground floor: glass lobby + canopy + sign
  B(b, 5.0, 2.6, 0.06, A.win[0], 0, B0 + 1.4, D / 2 + 0.04); B(b, 0.08, 2.7, 0.1, rail, 0, B0 + 1.4, D / 2 + 0.08); B(b, 6.4, 0.25, 2.6, slab, 0, B0 + 2.9, D / 2 + 1.3); for (const sx of [-2.9, 2.9]) CY(b, 0.12, 2.9, rail, sx, B0 + 1.45, D / 2 + 2.4, 8);
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) winPart(b, sx * (4.6 + k * 2.2), B0 + 1.6, D / 2 + 0.03, 0, 1.6, 1.3, { style: 'slide' });
  const sg = hrSign('しおさいマンション', 5.6, 0.7, '#2f4a5a', '#ffffff'); sg.position.set(0, B0 + 3.4, D / 2 + 0.06); b.add(sg);
  // back: open corridors with doors, stair core and elevator shaft
  for (let f = 1; f < F; f++) { const y = B0 + f * fh; B(b, W, 0.18, 1.5, slab, 0, y, -D / 2 - 0.75); B(b, W, 1.1, 0.14, wall, 0, y + 0.6, -D / 2 - 1.45); for (let u = 0; u < 4; u++) B(b, 0.9, 2.1, 0.06, stdM('#5a4a3e', 0.6), -W / 2 + (u + 0.5) * W / 4, y + 1.15, -D / 2 - 0.03); }
  B(b, 3.0, F * fh + 3.2, 3.0, wall, W / 2 + 1.5, B0 + (F * fh + 3.2) / 2, -D / 2 + 1.0); B(b, 3.2, 0.3, 3.2, slab, W / 2 + 1.5, B0 + F * fh + 3.3, -D / 2 + 1.0);
  // roof: parapet, water tank, antenna
  const ry = B0 + F * fh; B(b, W + 0.3, 0.9, 0.25, wall, 0, ry + 0.45, D / 2); B(b, W + 0.3, 0.9, 0.25, wall, 0, ry + 0.45, -D / 2); for (const sx of [-1, 1]) B(b, 0.25, 0.9, D, wall, sx * W / 2, ry + 0.45, 0);
  CY(b, 1.1, 1.6, stdM('#d8dce0', 0.4, 0.3), -4, ry + 1.5, -1.5, 14); for (const sx of [-0.7, 0.7]) for (const sz of [-0.7, 0.7]) B(b, 0.12, 0.8, 0.12, rail, -4 + sx, ry + 0.4, -1.5 + sz); CY(b, 0.04, 4.0, rail, 5, ry + 2.0, -2.5, 5);
  // parking with white lines, bikes, planters
  const pk = new THREE.Mesh(new THREE.PlaneGeometry(18, 7), worldMat(TEX.asphalt || TEX.concrete, 0.4, '#5a5e64', 0.9)); pk.rotation.x = -Math.PI / 2; pk.position.set(0, 0.05, 5.6); pk.receiveShadow = true; g.add(pk);
  for (let k = 0; k <= 6; k++) B(g, 0.12, 0.02, 4.8, stdM('#f4f4f0', 0.6), -7.5 + k * 2.5, 0.07, 5.0); for (let k = 0; k < 3; k++) bicycle(g, -8.5 + k * 0.8, 1.9, Math.PI / 2);
  for (const sx of [-1, 1]) { B(g, 4.2, 0.6, 1.0, AM.block, sx * 6.2, 0.3, 1.7); shrub(g, sx * 6.2 - 1.2, 1.7, 0.6, R); shrub(g, sx * 6.2 + 1.2, 1.7, 0.55, R); }
  bldPlace(g, s); coll(s, 0, z0, W / 2 + 0.3, D / 2 + 1.6); coll(s, W / 2 + 1.5, z0 - D / 2 + 1.0, 1.6, 1.6); return g;
};
// ---------- ほしなみリゾートホテル ----------
DEV_BUILD.resort = function (s) {
  const g = new THREE.Group(), A = archMats(), R = mulberry(733), W = 28, D = 9, F = 9, fh = 3.1, B0 = 0.5, z0 = -9.5;
  const white = worldMat(TEX.plaster, 0.35, '#f8f4ec', 0.9), sand = stdM('#e8d8b8', 0.8), glassR = stdM('#bfe6f0', 0.1, 0.2, { transparent: true, opacity: 0.45 }), rail = stdM('#e8ecef', 0.3, 0.5), deck = worldMat(TEX.wood, 0.5, '#c89a6a', 0.75);
  const t = sub(g, 0, 0, z0); B(t, W + 0.8, B0, D + 0.8, AM.block, 0, B0 / 2, 0); B(t, W, F * fh, D, white, 0, B0 + F * fh / 2, 0);
  const fac = facadeTex({ cols: 8, rows: F - 2, wall: '#f8f4ec', glass: ['#4f8ab0', '#9fd0e8'], frame: '#f4f4f4', seed: 77, lit: 0.48 });
  hrPanel(t, W - 0.6, (F - 2) * fh, fac, 0, B0 + 2 * fh + (F - 2) * fh / 2, D / 2 + 0.02, 0); hrPanel(t, W - 0.6, (F - 2) * fh, fac, 0, B0 + 2 * fh + (F - 2) * fh / 2, -D / 2 - 0.02, Math.PI);
  for (let f = 2; f < F; f++) { const y = B0 + f * fh; B(t, W + 0.4, 0.16, 1.6, white, 0, y, D / 2 + 0.8); B(t, W + 0.4, 1.0, 0.04, glassR, 0, y + 0.58, D / 2 + 1.58); B(t, W + 0.4, 0.06, 0.08, rail, 0, y + 1.1, D / 2 + 1.58); for (let u = 1; u < 8; u++) B(t, 0.1, 1.0, 1.5, glassR, -W / 2 + u * W / 8, y + 0.58, D / 2 + 0.8); }
  // stepped crown with the hotel name, lit at night
  B(t, W - 4, 2.4, D - 1.5, white, 0, B0 + F * fh + 1.2, -0.3); B(t, W + 0.6, 0.35, D + 0.6, white, 0, B0 + F * fh + 0.17, 0);
  const sg = hrSign('HOSHINAMI RESORT', 12, 1.4, '#103a5a', '#ffffff'); sg.position.set(0, B0 + F * fh + 1.25, (D - 1.5) / 2 - 0.29); t.add(sg);
  // two-storey lobby with a glass front, porte-cochere
  B(t, W, 2 * fh, 0.06, A.win[2], 0, B0 + fh, D / 2 + 0.04); for (let k = 0; k <= 10; k++) B(t, 0.1, 2 * fh, 0.12, rail, -W / 2 + k * W / 10, B0 + fh, D / 2 + 0.08); B(t, W, 0.12, 0.14, rail, 0, B0 + fh, D / 2 + 0.08);
  B(t, 9, 0.4, 5, white, 0, B0 + 4.2, D / 2 + 2.6); for (const sx of [-4, 4]) for (const zz of [D / 2 + 1.0, D / 2 + 4.6]) CY(t, 0.22, 4.0, white, sx, B0 + 2.0, zz, 12);
  const lg = hrSign('ほしなみリゾート', 5.5, 0.8, '#f8f4ec', '#1a4a6a'); lg.position.set(0, B0 + 4.2, D / 2 + 5.12); t.add(lg);
  // pool deck
  const pz = 6.5; B(g, 30, 0.12, 13, deck, 0, 0.06, pz); B(g, 16.4, 0.16, 7.4, stdM('#f4f6f8', 0.3), -3, 0.12, pz); const pool = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 6.6), new THREE.MeshStandardMaterial({ color: '#4fc8e8', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.9 })); pool.rotation.x = -Math.PI / 2; pool.position.set(-3, 0.22, pz); g.add(pool);
  for (let k = 0; k < 7; k++) B(g, 0.08, 0.02, 6.4, stdM('#2a9ac8', 0.3), -10 + k * 2.3, 0.23, pz);
  const cols = ['#e8574e', '#f2c230', '#3f8fd8', '#f08fb0']; for (let k = 0; k < 6; k++) parasol(g, -12 + k * 3.6 + (k > 2 ? 3 : 0), pz + 5.0, cols[k % 4]); for (let k = 0; k < 2; k++) parasol(g, 8 + k * 3.4, pz - 0.5, cols[(k + 1) % 4]);
  B(g, 3.0, 1.1, 1.6, deck, 9.5, 0.55, pz + 3.0); B(g, 3.4, 0.1, 2.0, stdM('#f4f2ec', 0.5), 9.5, 2.6, pz + 3.0); for (const sx of [-1.5, 1.5]) CY(g, 0.06, 2.0, deck, 9.5 + sx, 1.6, pz + 3.0, 6);
  for (const [x, z] of [[-14.5, 1], [14.5, 1], [-14.5, 12], [14.5, 12], [12.5, -2], [-12.5, -2]]) simplePalm(g, x, z, 6 + R() * 2, R);
  for (let k = 0; k < 8; k++) { const l = stdM('#fff4d8', 0.4, 0, { emissive: new THREE.Color('#ffd890'), emissiveIntensity: 0.1 }); hrGlow(l); const x = -14 + k * 4; CY(g, 0.05, 1.0, stdM('#3a3a3a', 0.4), x, 0.5, 13.2, 6); SP(g, 0.14, l, x, 1.05, 13.2, 1, 8); }
  bldPlace(g, s); coll(s, 0, z0, W / 2 + 0.4, D / 2 + 0.4); for (const sx of [-4, 4]) coll(s, sx, z0 + D / 2 + 4.6, 0.3, 0.3); coll(s, 9.5, pz + 3.0, 1.6, 0.9); return g;
};
// ---------- ほしなみスカイタワー (18F) ----------
DEV_BUILD.tower = function (s) {
  const g = new THREE.Group(), A = archMats(), W = 13, D = 13, F = 18, fh = 3.2, B0 = 0.5, R = mulberry(901);
  const frame = stdM('#d8dde2', 0.35, 0.4), dark = stdM('#3a4048', 0.4, 0.4), slab = worldMat(TEX.concrete, 0.4, '#eef0f2', 0.9);
  const fac = facadeTex({ cols: 6, rows: F - 2, wall: '#8aa0b4', glass: ['#3f6a8a', '#8fb8d4'], frame: '#c8d0d8', seed: 5, lit: 0.34, curtain: false });
  B(g, W + 4, B0, D + 4, AM.block, 0, B0 / 2, 0); B(g, W + 2, 2 * fh, D + 2, A.win[1], 0, B0 + fh, 0); for (let k = 0; k <= 6; k++) for (const sz of [-1, 1]) B(g, 0.14, 2 * fh, 0.14, frame, -(W + 2) / 2 + k * (W + 2) / 6, B0 + fh, sz * (D + 2) / 2);
  B(g, W + 2.6, 0.4, D + 2.6, slab, 0, B0 + 2 * fh, 0);
  const body = B(g, W - 0.2, (F - 2) * fh, D - 0.2, stdM('#8aa0b4', 0.4, 0.3), 0, B0 + 2 * fh + (F - 2) * fh / 2, 0);
  const yc = B0 + 2 * fh + (F - 2) * fh / 2; for (const [rx, x, z] of [[0, 0, D / 2], [Math.PI, 0, -D / 2], [Math.PI / 2, W / 2, 0], [-Math.PI / 2, -W / 2, 0]]) hrPanel(g, W - 0.4, (F - 2) * fh, fac, x, yc, z + Math.sign(z) * 0.02, rx).position.x = x + Math.sign(x) * 0.02;
  for (let f = 2; f <= F; f += 1) B(g, W + 0.25, 0.14, D + 0.25, slab, 0, B0 + f * fh, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 0.6, (F - 2) * fh, 0.6, frame, sx * W / 2, yc, sz * D / 2);
  const top = B0 + F * fh; B(g, W - 3, 3.4, D - 3, slab, 0, top + 1.7, 0); const ring = hrGlow(stdM('#bfe8ff', 0.3, 0, { emissive: new THREE.Color('#7fd0ff'), emissiveIntensity: 0.1 })); B(g, W + 0.5, 0.5, D + 0.5, ring, 0, top + 0.3, 0);
  const hp = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), new THREE.MeshStandardMaterial({ map: txCanvas(128, 128, (x) => { x.fillStyle = '#3a4048'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#f2c230'; x.lineWidth = 6; x.beginPath(); x.arc(64, 64, 54, 0, 7); x.stroke(); x.fillStyle = '#ffffff'; x.font = '900 70px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('H', 64, 68); }) })); hp.rotation.x = -Math.PI / 2; hp.position.set(0, top + 3.42, 0); g.add(hp);
  const red = stdM('#ff3a3a', 0.4, 0, { emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 1.6 }); for (const sx of [-1, 1]) for (const sz of [-1, 1]) SP(g, 0.25, red, sx * (W - 3) / 2, top + 3.6, sz * (D - 3) / 2, 1, 8);
  const sg = hrSign('ほしなみスカイタワー', 7.5, 1.0, '#1a2a3a', '#ffffff'); sg.position.set(0, B0 + 2 * fh + 0.8, D / 2 + 1.32); g.add(sg);
  B(g, 6, 0.3, 3, slab, 0, B0 + 3.4, D / 2 + 2.4); for (const sx of [-2.6, 2.6]) CY(g, 0.12, 3.4, frame, sx, B0 + 1.7, D / 2 + 3.6, 8);
  for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + 0.3; shrub(g, Math.cos(a) * (W / 2 + 3.2), Math.sin(a) * (D / 2 + 3.2), 0.7, R); }
  bldPlace(g, s); coll(s, 0, 0, (W + 2) / 2 + 0.2, (D + 2) / 2 + 0.2); return g;
};
// merge all the story/big-project buildings into a few draw calls (moving parts and sprites are kept)
for (const k of ['matsuri', 'school', 'onsen', 'ohashi', 'mansion', 'resort', 'tower']) { const f = DEV_BUILD[k]; if (!f || f._merged) continue; const w = function (s) { const g = f(s); return g ? mergeLocal(g) : g; }; w._merged = true; DEV_BUILD[k] = w; }

{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); if (HR.win.length) { const hf = currentHour(), n = hf >= 19 || hf < 5 ? 1 : hf > 17.6 ? (hf - 17.6) / 1.4 : hf < 6 ? 6 - hf : 0, v = n * 0.95; for (const m of HR.win) m.emissiveIntensity = v; } return r; }; }
