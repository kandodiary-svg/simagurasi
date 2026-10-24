// ===================== NATURE: more trees, seasonal flowers, rice paddies & fields, waterfall, night sky, birds =====================
const NATURE = { paddies: [], fields: [], t: 0, flora: {}, birds: [], ready: false };
// ---------- tree shapes ----------
// clumps of the seasonal trees are shaded in grey so the material colour alone decides the hue (pink blossom, green, red leaves)
function greyClumps(list) { for (const g of list) { const c = g.attributes.color; if (!c) continue; for (let i = 0; i < c.count; i++) { const l = Math.min(1.1, (0.3 * c.getX(i) + 0.6 * c.getY(i) + 0.1 * c.getZ(i)) * 1.7); c.setXYZ(i, l, l, l); } } return list; }
const TREE_COL = {
  sakura: [[md(1, 1), '#5e8e40'], [md(3, 18), '#7a9a52'], [md(3, 24), '#ffd6e4'], [md(4, 10), '#ffe2ec'], [md(4, 18), '#a8cc78'], [md(5, 10), '#6aa848'], [md(9, 25), '#5e9a3e'], [md(10, 20), '#8aa448'], [md(11, 8), '#d0a040'], [md(11, 20), '#d2783a'], [md(12, 5), '#b8603a']],
  momiji: [[md(1, 1), '#4e8e36'], [md(3, 26), '#c0d070'], [md(4, 25), '#9cc85a'], [md(5, 25), '#4e8e36'], [md(10, 8), '#5a9038'], [md(10, 28), '#e8b030'], [md(11, 10), '#e05a24'], [md(11, 25), '#d8301c'], [md(12, 8), '#b02818']],
};
NATURE.treeColor = function (kind, doy) {
  const K = TREE_COL[kind]; let i = K.length - 1; while (i > 0 && K[i][0] > doy) i--; const a = K[i], b = K[(i + 1) % K.length], span = ((b[0] - a[0]) + 365) % 365 || 365, t = Math.min(1, (((doy - a[0]) + 365) % 365) / span);
  const c = new THREE.Color(a[1]).lerp(new THREE.Color(b[1]), t * t * (3 - 2 * t));
  const hide = kind === 'sakura' ? inDoy(doy, md(12, 8), md(3, 17)) : inDoy(doy, md(12, 12), md(3, 22));
  if (kind === 'sakura') { const bl = rampDoy(doy, md(3, 22), md(3, 28), md(4, 10), md(4, 18)); c.multiplyScalar(1 + bl * 0.45); }
  return { c, hide };
};
function makeSakura(seed) {
  const R = mulberry(seed), bark = [], clumps = [], cards = [];
  const H = 3.0 + R() * 0.9, lean = new THREE.Vector3((R() - 0.5) * 0.8, 0, (R() - 0.5) * 0.8), top = new THREE.Vector3(lean.x, H, lean.z);
  bark.push(limbGeom([new THREE.Vector3(0, -0.4, 0), new THREE.Vector3(lean.x * 0.3, H * 0.45, lean.z * 0.3), top], 0.42, 0.22, 8, 5));
  const ends = [], nb = 5 + Math.floor(R() * 2);
  for (let b = 0; b < nb; b++) { const a = b / nb * 6.283 + R() * 0.5, L = 2.8 + R() * 1.2, e = top.clone().add(new THREE.Vector3(Math.cos(a) * L, 0.9 + R() * 0.9, Math.sin(a) * L)); bark.push(limbGeom([top, top.clone().lerp(e, 0.5).add(new THREE.Vector3(0, 0.5, 0)), e], 0.17, 0.05, 6, 4)); ends.push(e); }
  const yr = [H, H + 3.4];
  clumps.push(clumpGeom(new THREE.Vector3(lean.x, H + 1.7, lean.z), 2.5, R() * 50, 0.55, [1, 1, 1], yr)); cards.push(cardsGeom(new THREE.Vector3(lean.x, H + 1.7, lean.z), 2.5, 8, R, 1.3, 0.55));
  for (const e of ends) { const c = e.clone().add(new THREE.Vector3(0, 0.25, 0)), r = 1.5 + R() * 0.5; clumps.push(clumpGeom(c, r, R() * 50, 0.6, [1, 1, 1], yr)); cards.push(cardsGeom(c, r, 5, R, 1.2, 0.6)); }
  for (let k = 0; k < 8; k++) { const a = R() * 6.28, rr = 2.4 + R() * 1.4, c = new THREE.Vector3(lean.x + Math.cos(a) * rr, H + 1.2 + R() * 1.0, lean.z + Math.sin(a) * rr), r = 1.0 + R() * 0.5; clumps.push(clumpGeom(c, r, R() * 50, 0.6, [1, 1, 1], yr)); cards.push(cardsGeom(c, r, 4, R, 1.0, 0.6)); }
  return { bark, clumps: greyClumps(clumps), cards, fruit: [], collR: 0.45 };
}
function makeMomiji(seed) {
  const R = mulberry(seed), bark = [], clumps = [], cards = [], H = 2.4 + R() * 0.8;
  for (let t = 0; t < 2; t++) { const a = R() * 6.28, top = new THREE.Vector3(Math.cos(a) * 0.5, H, Math.sin(a) * 0.5); bark.push(limbGeom([new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(top.x * 0.4, H * 0.5, top.z * 0.4), top], 0.2, 0.09, 6, 4));
    for (let b = 0; b < 3; b++) { const aa = a + (b - 1) * 1.2, e = top.clone().add(new THREE.Vector3(Math.cos(aa) * 1.6, 0.8 + R() * 0.6, Math.sin(aa) * 1.6)); bark.push(limbGeom([top, e], 0.08, 0.03, 5, 2)); } }
  const yr = [H - 0.3, H + 2.8];
  for (let k = 0; k < 13; k++) { const a = R() * 6.283, u = Math.sqrt(R()), c = new THREE.Vector3(Math.cos(a) * u * 2.1, H + 0.5 + (1 - u) * 1.5 + R() * 0.5, Math.sin(a) * u * 2.1), r = 0.75 + R() * 0.4; clumps.push(clumpGeom(c, r, R() * 50, 0.6, [1, 1, 1], yr)); cards.push(cardsGeom(c, r, 4, R, 0.9, 0.5)); }
  return { bark, clumps: greyClumps(clumps), cards, fruit: [], collR: 0.3 };
}
function makeBamboo(seed) {
  const R = mulberry(seed), bark = [], cards = [], n = 9 + Math.floor(R() * 5);
  for (let k = 0; k < n; k++) { const a = R() * 6.28, r = R() * 1.1, x = Math.cos(a) * r, z = Math.sin(a) * r, H = 7 + R() * 3.5, lx = x + (R() - 0.5) * 1.6 + x * 0.4, lz = z + (R() - 0.5) * 1.6 + z * 0.4;
    bark.push(limbGeom([new THREE.Vector3(x, -0.2, z), new THREE.Vector3((x + lx) / 2, H * 0.55, (z + lz) / 2), new THREE.Vector3(lx, H, lz)], 0.07, 0.035, 6, 4));
    for (let q = 0; q < 6; q++) { const t = 0.55 + q * 0.08, c = new THREE.Vector3(x + (lx - x) * t, H * t + 0.3, z + (lz - z) * t); cards.push(cardsGeom(c, 0.55, 3, R, 0.8, 0.5)); } }
  return { bark, clumps: [], cards, fruit: [], collR: 0.6 };
}
function makePalm(seed) {
  const R = mulberry(seed), bark = [], fr = [], H = 5 + R() * 2, bend = 0.8 + R() * 1.2, dir = R() * 6.28, pts = [];
  for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push(new THREE.Vector3(Math.cos(dir) * bend * t * t, t * H, Math.sin(dir) * bend * t * t)); }
  bark.push(limbGeom(pts, 0.3, 0.2, 8, 8)); const top = pts[5];
  const pos = [], nor = [], uv = [], idx = [];
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + R() * 0.3, L = 2.4 + R() * 0.8, segs = 6, w = 0.55, droop = 0.35 + R() * 0.25;
    const d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), side = new THREE.Vector3(-d.z, 0, d.x), o = pos.length / 3;
    for (let s = 0; s <= segs; s++) { const t = s / segs, p = top.clone().addScaledVector(d, t * L); p.y += 0.3 * t - droop * L * t * t; const ww = w * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.08)) * 0.5;
      for (const sg of [-1, 1]) { const q = p.clone().addScaledVector(side, ww * sg); q.y -= ww * 0.25; pos.push(q.x, q.y, q.z); nor.push(0, 1, 0); uv.push(sg < 0 ? 0 : 1, t); } }
    for (let s = 0; s < segs; s++) { const b = o + s * 2; idx.push(b, b + 1, b + 3, b, b + 3, b + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); fr.push(g);
  return { bark, clumps: [], cards: fr, fruit: [], collR: 0.3, palm: true };
}
// ---------- flower geometries (cross cards with canvas textures) ----------
function flowerTex(kind) {
  return txCanvas(128, 128, (x, w, h) => { const R = mulberry(kind.length * 31 + 7); x.clearRect(0, 0, w, h);
    const stems = kind === 'sunflower' ? 0 : 7; for (let k = 0; k < stems; k++) { const sx = 10 + k * 17 + R() * 6; x.strokeStyle = '#4f8a2e'; x.lineWidth = kind === 'cosmos' ? 2 : 3; x.beginPath(); x.moveTo(sx, h); x.quadraticCurveTo(sx + (R() - 0.5) * 20, h * 0.5, sx + (R() - 0.5) * 16, 28 + R() * 30); x.stroke(); }
    if (kind === 'nanohana') { for (let k = 0; k < 7; k++) { const cx = 12 + k * 17, cy = 26 + R() * 28; for (let q = 0; q < 14; q++) { x.fillStyle = q % 3 ? '#ffe23a' : '#f4c814'; x.beginPath(); x.arc(cx + (R() - 0.5) * 16, cy + (R() - 0.5) * 18, 3.5, 0, 7); x.fill(); } } x.fillStyle = '#6aa83a'; for (let k = 0; k < 10; k++) { x.beginPath(); x.ellipse(R() * w, 80 + R() * 40, 9, 4, R() * 3, 0, 7); x.fill(); } }
    if (kind === 'cosmos') { const cols = ['#ff7ab0', '#ffffff', '#e0408a', '#ffb0d0']; for (let k = 0; k < 7; k++) { const cx = 12 + k * 17 + (R() - 0.5) * 8, cy = 24 + R() * 34, c = cols[k % 4]; for (let p = 0; p < 8; p++) { const a = p / 8 * 6.283; x.fillStyle = c; x.beginPath(); x.ellipse(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, 5, 2.6, a, 0, 7); x.fill(); } x.fillStyle = '#f2c230'; x.beginPath(); x.arc(cx, cy, 2.5, 0, 7); x.fill(); } }
    if (kind === 'sunflower') { x.strokeStyle = '#4f8a2e'; x.lineWidth = 7; x.beginPath(); x.moveTo(64, h); x.lineTo(64, 40); x.stroke(); x.fillStyle = '#5a9a34'; for (const [lx, ly, s] of [[46, 90, -1], [82, 72, 1], [44, 60, -1]]) { x.beginPath(); x.ellipse(lx, ly, 16, 7, s * 0.5, 0, 7); x.fill(); }
      for (let p = 0; p < 20; p++) { const a = p / 20 * 6.283; x.fillStyle = p % 2 ? '#ffd21a' : '#ffbf0a'; x.beginPath(); x.ellipse(64 + Math.cos(a) * 20, 30 + Math.sin(a) * 20, 10, 4.5, a, 0, 7); x.fill(); } x.fillStyle = '#6a3a1a'; x.beginPath(); x.arc(64, 30, 13, 0, 7); x.fill(); x.fillStyle = '#4a2a10'; for (let k = 0; k < 20; k++) { x.beginPath(); x.arc(64 + (R() - 0.5) * 18, 30 + (R() - 0.5) * 18, 1.5, 0, 7); x.fill(); } }
  });
}
function crossGeo(wd, ht, n = 2) { const gs = []; for (let k = 0; k < n; k++) { const p = new THREE.PlaneGeometry(wd, ht); p.translate(0, ht / 2, 0); p.rotateY(k * Math.PI / n); gs.push(p); } const g = mergeGeometries(gs); const nn = g.attributes.normal; for (let i = 0; i < nn.count; i++) nn.setXYZ(i, 0, 1, 0); return g; }
function puffGeo(r, n, seed) { const R = mulberry(seed), gs = []; for (let k = 0; k < n; k++) { const g = new THREE.IcosahedronGeometry(r * (0.6 + R() * 0.5), 1); g.translate((R() - 0.5) * r * 1.6, r * (0.6 + R() * 0.5), (R() - 0.5) * r * 1.6); gs.push(g.index ? g.toNonIndexed() : g); } return mergeGeometries(gs); }
// ---------- placement helpers ----------
function floraOK(x, z, o = {}) {
  const h = groundH(x, z); if (h < (o.minH || 2.4) || h > (o.maxH || 60)) return false; const n = groundN(x, z); if (n.y < (o.flat || 0.8)) return false;
  if (roadDistAt(x, z) < (o.road || 5)) return false; if (waterDepthAt(x, z) > 0 || !isNaN(waterLevelAt(G, x, z))) return false;
  if (Math.hypot(x - OPEN.x, z - OPEN.z) < OPEN.r * 0.95 && !o.open) return false; if (Math.hypot(x - MIKAN.x, z - MIKAN.z) < MIKAN.r) return false;
  if (PLACED.houses.some(hs => Math.hypot(hs.x - x, hs.z - z) < hs.rad + (o.house || 4))) return false; if (PLACED.clear.some(c => Math.hypot(c.x - x, c.z - z) < c.r)) return false;
  if (PLACED.church && Math.hypot(PLACED.church.x - x, PLACED.church.z - z) < 18) return false; if (PLACED.lighthouse && Math.hypot(PLACED.lighthouse.x - x, PLACED.lighthouse.z - z) < 13) return false;
  return true;
}
// called from buildVegetation (after the original items, so saved removals keep their indices)
function natLM() {
  if (GAME.LM && GAME.LM.peak) return GAME.LM; let beach = null; const rp = G.river && G.river.pts; if (rp) for (const [x, z] of rp) { const h = groundH(x, z); if (h < 0.6 && isNaN(waterLevelAt(G, x, z)) || h < -0.3) { beach = { x, z }; break; } }
  return { peak: { x: PEAK.x, z: PEAK.z }, beach: beach || { x: -230, z: 150 } };
}
function buildFlora(V) {
  const LMx = natLM();
  const { newItem, addSet, cellsOf, partGeos, fol, card, barkMatInst } = V;
  const prep = (gs, isClump) => mergeGeometries(gs.map(g => { const c = g.index ? g.toNonIndexed() : g.clone(); if (!isClump && c.attributes.color) c.deleteAttribute('color'); if (!c.attributes.uv) c.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(c.attributes.position.count * 2), 2)); return c; }));
  const near = new Map(); for (const it of VEG.items) if (it.type === 'tree') { const k = Math.floor(it.x / 8) + ',' + Math.floor(it.z / 8); near.set(k, (near.get(k) || 0) + 1); }
  const busy = (x, z) => { const k = Math.floor(x / 8) + ',' + Math.floor(z / 8); return (near.get(k) || 0) > 0; }, mark = (x, z) => { const k = Math.floor(x / 8) + ',' + Math.floor(z / 8); near.set(k, (near.get(k) || 0) + 1); };
  const bambooBark = new THREE.MeshStandardMaterial({ map: txCanvas(32, 128, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#5f9a3a'); gr.addColorStop(0.5, '#8cc45a'); gr.addColorStop(1, '#5a8a34'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#d8e8a8'; for (let y = 10; y < h; y += 42) x.fillRect(0, y, w, 3); }, true), roughness: 0.5 });
  const frondMat = windify(new THREE.MeshStandardMaterial({ map: txCanvas(64, 128, (x, w, h) => { x.clearRect(0, 0, w, h); for (let y = 2; y < h; y += 6) { for (const sd of [-1, 1]) { x.fillStyle = y % 12 ? '#5a9a38' : '#4c8c30'; x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w / 2 + sd * w * 0.3, y + 2, w / 2 + sd * (w / 2 - 1), y + 12); x.lineTo(w / 2 + sd * (w / 2 - 4), y + 15); x.quadraticCurveTo(w / 2 + sd * w * 0.2, y + 8, w / 2, y + 6); x.fill(); } } x.fillStyle = '#3f6a26'; x.fillRect(w / 2 - 2, 0, 4, h); }), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 }), 0.03);
  const KINDS = { sakura: { make: makeSakura, n: 1, tint: '#ffffff' }, momiji: { make: makeMomiji, n: 1, tint: '#f0ffe0' }, bamboo: { make: makeBamboo, n: 1, tint: '#e8ffc0' }, palm: { make: makePalm, n: 1, tint: '#ffffff' } };
  const place = { sakura: [], momiji: [], bamboo: [], palm: [] }, R = mulberry(7311);
  // sakura: avenues along the main road through the village, around the hall and the festival plaza
  { const r0 = ROADS[0], F = r0 && (r0.frames || roadFrames(r0)); let acc = 0;
    if (F) for (let i = 1; i < F.length; i++) { const f = F[i]; acc += Math.hypot(F[i].x - F[i - 1].x, F[i].z - F[i - 1].z); if (acc < 10) continue; if (Math.hypot(f.x - VILLAGE.x, f.z - VILLAGE.z) > VILLAGE.r * 1.9) continue; acc = 0;
      for (const s of [-1, 1]) { const off = r0.w / 2 + 4.2, x = f.x + f.nx * off * s, z = f.z + f.nz * off * s; if (floraOK(x, z, { road: r0.w / 2 + 3.2, house: 3.5 }) && place.sakura.every(q => Math.hypot(q[0] - x, q[1] - z) > 7)) { place.sakura.push([x, z, R()]); mark(x, z); } } }
    const Hh = PLACED.hall; if (Hh) for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28, x = Hh.x + Math.cos(a) * 17, z = Hh.z + Math.sin(a) * 17; if (floraOK(x, z, { house: 3 }) && !busy(x, z)) { place.sakura.push([x, z, R()]); mark(x, z); } } }
  // momiji around the waterfall and on the north slopes; bamboo groves on village hillsides; palms by the beach and harbor
  for (let k = 0; k < 1200 && place.momiji.length < 34; k++) { const a = R() * 6.28, r = 8 + R() * 70, x = FALLS.x + Math.cos(a) * r, z = FALLS.z + Math.sin(a) * r; if (floraOK(x, z, { flat: 0.7 }) && !busy(x, z)) { place.momiji.push([x, z, R()]); mark(x, z); } }
  for (let k = 0; k < 900 && place.momiji.length < 50; k++) { const P = LMx.peak, cx = P.x, cz = P.z, a = R() * 6.28, r = 15 + R() * 50, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (floraOK(x, z, { flat: 0.72 }) && !busy(x, z)) { place.momiji.push([x, z, R()]); mark(x, z); } }
  for (let g = 0; g < 4; g++) { let c = null; for (let k = 0; k < 300 && !c; k++) { const a = R() * 6.28, r = VILLAGE.r * (1.0 + R() * 0.8), x = VILLAGE.x + Math.cos(a) * r, z = VILLAGE.z + Math.sin(a) * r; if (floraOK(x, z, { flat: 0.75, house: 8 })) c = [x, z]; }
    if (c) for (let k = 0; k < 40 && place.bamboo.filter(b => Math.hypot(b[0] - c[0], b[1] - c[1]) < 14).length < 11; k++) { const x = c[0] + (R() - 0.5) * 22, z = c[1] + (R() - 0.5) * 22; if (floraOK(x, z, { flat: 0.72, house: 6 }) && place.bamboo.every(b => Math.hypot(b[0] - x, b[1] - z) > 3.2)) place.bamboo.push([x, z, R()]); } }
  { const anchors = [LMx.beach].filter(Boolean); for (const A of anchors) for (let k = 0; k < 400 && place.palm.filter(p => Math.hypot(p[0] - A.x, p[1] - A.z) < 80).length < 2; k++) { const a = R() * 6.28, r = 10 + R() * 60, x = A.x + Math.cos(a) * r, z = A.z + Math.sin(a) * r; const h = groundH(x, z); if (h > 1.2 && h < 5 && floraOK(x, z, { minH: 1.2, road: 5, flat: 0.75 }) && place.palm.every(p => Math.hypot(p[0] - x, p[1] - z) > 7)) place.palm.push([x, z, R()]); } }
  const extraKeys = [];
  for (const [kind, K] of Object.entries(KINDS)) for (let vi = 0; vi < K.n; vi++) {
    const Vv = K.make(1000 + vi * 17 + kind.length * 101), fm = fol(K.tint), cm = kind === 'palm' ? frondMat : card(K.tint); VEG.fmats[kind + vi] = { fol: fm, card: cm, tint: fm.color.clone(), cardBase: cm.color.clone() };
    const geos = []; if (Vv.bark.length) geos.push([prep(Vv.bark), kind === 'bamboo' ? bambooBark : barkMatInst, true]); if (Vv.clumps.length) geos.push([prep(Vv.clumps, true), fm, true]); if (Vv.cards.length) geos.push([prep(Vv.cards), cm, true]);
    partGeos[kind + vi] = geos; if (vi === 0) extraKeys.push(kind + '0');
    const list = place[kind].filter((_, i) => i % K.n === vi).map(([x, z, r]) => newItem({ x, z, r, type: 'tree', kind, collR: Vv.collR }));
    for (const cl of cellsOf(list, 150)) for (const [geo, mat, shadow] of geos) { const st = addSet(geo, mat, cl, 'tree', shadow); st.boundsPad = 8; }
    if (Vv.collR) list.forEach(it => { it.coll = { x: it.x, z: it.z, r: Vv.collR, kind: 'tree' }; addCollider(it.coll); });
  }
  VEG.extraUserKeys = extraKeys;
  // ---- seasonal flower patches (VEG items so the island tools can clear them) ----
  const FL = {
    nanohana: { geo: crossGeo(0.75, 0.7), from: md(3, 1), to: md(4, 30), color: '#ffffff' }, cosmos: { geo: crossGeo(0.85, 0.95), from: md(9, 1), to: md(10, 31), color: '#ffffff' },
    sunflower: { geo: (() => { const a = new THREE.PlaneGeometry(1.0, 1.9); a.translate(0, 0.95, 0); const n = a.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 0.3, 1); return a; })(), from: md(7, 10), to: md(8, 31), color: '#ffffff' },
  };
  const flMat = (kind) => windify(new THREE.MeshStandardMaterial({ map: flowerTex(kind), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1 }), 0.06);
  const patches = { nanohana: [], cosmos: [], sunflower: [] }, R2 = mulberry(4321);
  const patchAt = (kind, n, rad, near, nearR, opts) => { for (let t = 0; t < 400; t++) { const a = R2() * 6.28, r = R2() * nearR, cx = near.x + Math.cos(a) * r, cz = near.z + Math.sin(a) * r; if (!floraOK(cx, cz, opts)) continue; let ok = 0; for (let k = 0; k < 8; k++) if (floraOK(cx + Math.cos(k) * rad, cz + Math.sin(k) * rad, opts)) ok++; if (ok < 7) continue;
      for (let k = 0; k < n; k++) { const aa = R2() * 6.28, rr = Math.sqrt(R2()) * rad, x = cx + Math.cos(aa) * rr, z = cz + Math.sin(aa) * rr; if (floraOK(x, z, opts)) patches[kind].push([x, z]); } return { x: cx, z: cz }; } return null; };
  const rv = G.river && G.river.pts;
  for (let k = 0; k < 3; k++) patchAt('nanohana', 260, 9, rv ? { x: rv[Math.floor(rv.length * (0.3 + k * 0.2))][0], z: rv[Math.floor(rv.length * (0.3 + k * 0.2))][1] } : VILLAGE, 30, { road: 4, house: 3, flat: 0.75 });
  patchAt('nanohana', 300, 11, VILLAGE, VILLAGE.r * 1.6, { road: 5, house: 5 });
  NATURE.sunflowerField = patchAt('sunflower', 260, 10, VILLAGE, VILLAGE.r * 1.8, { road: 5, house: 6, flat: 0.85 });
  for (let k = 0; k < 2; k++) patchAt('cosmos', 320, 10, k ? LMx.peak : VILLAGE, VILLAGE.r * 1.7, { road: 4, house: 4 });
  NATURE.floraMats = {};
  for (const [kind, F] of Object.entries(FL)) { const m = flMat(kind); NATURE.floraMats[kind] = { m, from: F.from, to: F.to }; const list = patches[kind].map(([x, z]) => newItem({ x, z, s: kind === 'sunflower' ? 0.85 + R2() * 0.3 : 0.7 + R2() * 0.5, rot: kind === 'sunflower' ? (R2() - 0.5) * 0.5 : R2() * 6.28, type: 'flower' })); for (const cl of cellsOf(list, 60)) addSet(F.geo, m, cl, 'tuft', false); }
  // hydrangea (梅雨) and camellia (冬) bushes along village lanes: leaves all year, flowers in their season
  const bushLeaf = new THREE.MeshStandardMaterial({ color: '#3f7a32', roughness: 0.85 }), ajiLeaf = puffGeo(0.42, 5, 3), tsubLeaf = puffGeo(0.45, 6, 5);
  const shell = (n, r0, r1, rad, y0, y1, seed, detail) => { const gs = [], R3 = mulberry(seed); for (let k = 0; k < n; k++) { const g = new THREE.IcosahedronGeometry(r0 + R3() * (r1 - r0), detail); const a = k / n * 6.283 + R3() * 0.6, u = R3(); g.translate(Math.cos(a) * rad * (0.55 + u * 0.45), y0 + (1 - u) * (y1 - y0), Math.sin(a) * rad * (0.55 + u * 0.45)); gs.push(g.index ? g.toNonIndexed() : g); } return mergeGeometries(gs); };
  const ajiFl = shell(13, 0.11, 0.15, 0.5, 0.45, 0.85, 4, 1), tsubFl = shell(16, 0.065, 0.08, 0.58, 0.35, 0.95, 9, 0);
  const ajis = [], tsubs = [], R4 = mulberry(77);
  { const r0 = ROADS[0], F = r0 && (r0.frames || roadFrames(r0)); let acc = 0; if (F) for (let i = 1; i < F.length; i++) { const f = F[i]; acc += Math.hypot(F[i].x - F[i - 1].x, F[i].z - F[i - 1].z); if (acc < 5) continue; acc = 0; const vd = Math.hypot(f.x - VILLAGE.x, f.z - VILLAGE.z); if (vd > VILLAGE.r * 1.5) continue;
      const s = R4() < 0.5 ? -1 : 1, off = r0.w / 2 + 2.6, x = f.x + f.nx * off * s, z = f.z + f.nz * off * s; if (!floraOK(x, z, { road: r0.w / 2 + 1.8, house: 2.5, minH: 1.5 })) continue; (R4() < 0.65 ? ajis : tsubs).push([x, z]); } }
  const mkBush = (pts, leafGeo, flGeo, flMat, cols) => { const leafItems = pts.map(([x, z]) => newItem({ x, z, s: 1.0 + R4() * 0.45, rot: R4() * 6.28, type: 'flower' })); for (const cl of cellsOf(leafItems, 150)) addSet(leafGeo, bushLeaf, cl, 'tuft', true);
    const flItems = pts.map(([x, z], i) => newItem({ x, z, s: leafItems[i].s, rot: leafItems[i].rot, type: 'flower' })); const sets = []; for (const cl of cellsOf(flItems, 150)) { const st = addSet(flGeo, flMat, cl, 'tuft', false); cl.forEach((it, i) => st.mesh.setColorAt(i, new THREE.Color(cols[Math.floor(R4() * cols.length)]))); sets.push(st); } return sets; };
  const ajiMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 }), tsubMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
  mkBush(ajis, ajiLeaf, ajiFl, ajiMat, ['#7fa8f0', '#a88ae8', '#c8a0e8', '#6f9ae0', '#f0a8c8']); mkBush(tsubs, tsubLeaf, tsubFl, tsubMat, ['#d8283a', '#e8384a', '#f8f0f0', '#e85a8a']);
  NATURE.floraMats.ajisai = { m: ajiMat, from: md(6, 1), to: md(7, 20) }; NATURE.floraMats.tsubaki = { m: tsubMat, from: md(12, 1), to: md(3, 31) };
}
// ---------- rice paddies and a vegetable field ----------
NATURE.findRect = function (w, d, near, minR, maxR, R) {
  for (let t = 0; t < 1400; t++) { const a = R() * 6.28, r = minR + R() * (maxR - minR), x = near.x + Math.cos(a) * r, z = near.z + Math.sin(a) * r; const nr = nearestOnRoads(x, z, 40, false); const rot = nr ? Math.atan2(nr.x - x, nr.z - z) : R() * 6.28, o = { x, z, rot };
    let ok = true, mn = 1e9, mx = -1e9; for (let i = -w / 2; i <= w / 2 + 0.01 && ok; i += 2) for (let j = -d / 2; j <= d / 2 + 0.01 && ok; j += 2) { const [px, pz] = toWorld(o, i, j), h = groundH(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h);
      if (!floraOK(px, pz, { road: 4.2, house: 4, flat: 0.86, minH: 2.2 }) || collidersNear(px, pz).some(c => !c.off && hitsCollider(c, px, pz, 0.8))) ok = false; }
    if (ok && mx - mn < 1.6) return { x, z, rot, mn, mx }; }
  return null;
};
NATURE.makeFarm = function () {
  const R = mulberry(2468), g = new THREE.Group(); NATURE.farm = g; scene.add(g); const M = NATURE.fm = {
    bund: worldMat(TEX.dirt, 0.5, '#8a7a5a', 1), soil: worldMat(TEX.dirt, 0.35, '#7a5a3a', 1), mud: worldMat(TEX.dirt, 0.4, '#5a4a36', 1), water: new THREE.MeshStandardMaterial({ color: '#7fa8c0', roughness: 0.06, metalness: 0.4, transparent: true, opacity: 0.88 }),
    rice: windify(new THREE.MeshStandardMaterial({ map: TEX.tuft, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1, color: '#c8f090' }), 0.05), wood: MAT.wood, straw: new THREE.MeshStandardMaterial({ color: '#d8b860', roughness: 0.9 }), cabbage: new THREE.MeshStandardMaterial({ color: '#9ad070', roughness: 0.7 }), leaf: new THREE.MeshStandardMaterial({ color: '#4f9a3a', roughness: 0.8 }), red: new THREE.MeshStandardMaterial({ color: '#e0302a', roughness: 0.5 }), white: new THREE.MeshStandardMaterial({ color: '#f4f0e6', roughness: 0.6 }) };
  const rect = NATURE.findRect(28, 20, VILLAGE, VILLAGE.r * 0.9, VILLAGE.r * 2.2, R); if (!rect) return; NATURE.farmAt = rect;
  const o = { x: rect.x, z: rect.z, rot: rect.rot }, W = (x, z) => toWorld(o, x, z);
  // 2 x 2 terraced paddies, each at its own level
  for (let pi = 0; pi < 2; pi++) for (let pj = 0; pj < 2; pj++) {
    const cx = -7 + pi * 14, cz = -5 + pj * 10, pw = 13, pd = 9; let mn = 1e9, mx = -1e9; for (let i = -pw / 2; i <= pw / 2; i += 1.5) for (let j = -pd / 2; j <= pd / 2; j += 1.5) { const [px, pz] = W(cx + i, cz + j), h = groundH(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h); }
    const lvl = mx + 0.12, pg = new THREE.Group(); const [wx, wz] = W(cx, cz); pg.position.set(wx, lvl, wz); pg.rotation.y = rect.rot; g.add(pg);
    const solid = new THREE.Group(); pg.add(solid); const soil = box(pw, 0.1, pd, M.mud, 0, -0.06, 0); solid.add(soil); const water = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), M.water); water.rotation.x = -Math.PI / 2; water.position.y = 0.02; pg.add(water);
    const bh = lvl - mn + 0.35; for (const [bw, bd, bx, bz] of [[pw + 0.7, 0.5, 0, pd / 2 + 0.1], [pw + 0.7, 0.5, 0, -pd / 2 - 0.1], [0.5, pd, pw / 2 + 0.1, 0], [0.5, pd, -pw / 2 - 0.1, 0]]) solid.add(box(bw, bh, bd, M.bund, bx, 0.18 - bh / 2, bz)); { const ms = mergeLocal(solid); pg.remove(solid); pg.add(ms); }
    const N = Math.floor(pw / 0.55) * Math.floor(pd / 0.5), im = new THREE.InstancedMesh(crossGeo(0.45, 0.62), M.rice, N); let k = 0; const m4 = new THREE.Matrix4();
    for (let i = 0; i < Math.floor(pw / 0.55); i++) for (let j = 0; j < Math.floor(pd / 0.5); j++) { m4.makeRotationY((i * 7 + j * 3) % 6); m4.setPosition(-pw / 2 + 0.35 + i * 0.55 + (j % 2) * 0.05, 0, -pd / 2 + 0.3 + j * 0.5); im.setMatrixAt(k++, m4); }
    im.castShadow = false; im.receiveShadow = true; const rg = new THREE.Group(); rg.add(im); pg.add(rg);
    NATURE.paddies.push({ g: pg, water, rice: rg, soil, w: pw, d: pd });
    const C = (lx, lz, hw, hd) => { const [x, z] = W(lx, lz); addCollider({ x, z, hw, hd, rot: rect.rot, kind: 'farm' }); };
  }
  // scarecrow, hasa-gake drying racks with sheaves
  { const [x, z] = W(0.5, 0.2); const s = new THREE.Group(); s.position.set(x, groundH(x, z), z); s.rotation.y = rect.rot; g.add(s); s.add(box(0.08, 1.8, 0.08, M.wood, 0, 0.9, 0)); s.add(box(1.3, 0.07, 0.07, M.wood, 0, 1.35, 0)); s.add(box(0.5, 0.6, 0.2, new THREE.MeshStandardMaterial({ color: '#4a7ab8', roughness: 0.9 }), 0, 1.3, 0)); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), M.white); hd.position.y = 1.78; s.add(hd); const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 12), M.straw); hat.position.y = 1.98; s.add(hat); NATURE.scarecrow = s; }
  { const hs = new THREE.Group(); g.add(hs); NATURE.hasa = hs; for (let r = 0; r < 2; r++) { const [x, z] = W(-7 + r * 14, 10.5); const y = groundH(x, z), rk = new THREE.Group(); rk.position.set(x, y, z); rk.rotation.y = rect.rot; hs.add(rk); for (const a of [-5, 0, 5]) { rk.add(box(0.09, 1.9, 0.09, M.wood, a, 0.95, 0)); } rk.add(box(10.4, 0.06, 0.06, M.wood, 0, 1.6, 0));
      for (let k = 0; k < 26; k++) { const sh = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 6), M.straw); sh.position.set(-5 + k * 0.4, 1.25, (k % 2 - 0.5) * 0.18); sh.rotation.z = Math.PI; rk.add(sh); } } }
  // vegetable field next to the paddies: ridges with summer and winter crops
  const fr = NATURE.findRect(12, 9, rect, 18, 40, R); if (fr) { const of = { x: fr.x, z: fr.z, rot: fr.rot }, fg = new THREE.Group(); g.add(fg); const sum = new THREE.Group(), win = new THREE.Group(); fg.add(sum, win); NATURE.crops = { sum, win };
    for (let k = 0; k < 7; k++) { const [x, z] = toWorld(of, -4.5 + k * 1.5, 0), y = groundH(x, z); const rd = box(0.8, 0.28, 8.4, M.soil, x, y + 0.1, z, fr.rot); fg.add(rd);
      for (let q = 0; q < 10; q++) { const [px, pz] = toWorld(of, -4.5 + k * 1.5, -3.8 + q * 0.85), py = groundH(px, pz) + 0.25;
        if (k % 2) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), M.cabbage); c.position.set(px, py + 0.12, pz); c.scale.y = 0.75; win.add(c); } else { for (let l = 0; l < 4; l++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 4), M.leaf); lf.position.set(px + Math.cos(l * 1.6) * 0.06, py + 0.2, pz + Math.sin(l * 1.6) * 0.06); lf.rotation.set(Math.cos(l * 1.6) * 0.5, 0, Math.sin(l * 1.6) * 0.5); win.add(lf); } const dk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 6), M.white); dk.position.set(px, py + 0.02, pz); win.add(dk); }
        if (q % 2 === 0) { sum.add(box(0.03, 1.2, 0.03, M.wood, px, py + 0.55, pz)); const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), M.leaf); pl.position.set(px, py + 0.6, pz); pl.scale.set(0.8, 1.4, 0.8); sum.add(pl); for (let t = 0; t < 4; t++) { const tm = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), M.red); tm.position.set(px + Math.cos(t * 1.7) * 0.2, py + 0.4 + t * 0.15, pz + Math.sin(t * 1.7) * 0.2); sum.add(tm); } } } }
    { const [x, z] = toWorld(of, 6.5, 3.5); addCollider({ x: fr.x, z: fr.z, hw: 6, hd: 4.5, rot: fr.rot, kind: 'farm' }); } }
  // merge the many small farm meshes into a few draw calls (groups that toggle by season are merged separately)
  const mg = (o) => { const par = o.parent, m = mergeLocal(o); par.remove(o); par.add(m); return m; };
  if (NATURE.crops) { NATURE.crops.sum = mg(NATURE.crops.sum); NATURE.crops.win = mg(NATURE.crops.win); }
  if (NATURE.hasa) NATURE.hasa = mg(NATURE.hasa); if (NATURE.scarecrow) NATURE.scarecrow = mg(NATURE.scarecrow);
  NATURE.farmMerged = true;
};
NATURE.applySeason = function (doy, sn) {
  if (NATURE.floraMats) for (const F of Object.values(NATURE.floraMats)) F.m.visible = inDoy(doy, F.from, F.to) && sn < 0.5;
  if (NATURE.floraMats && NATURE.floraMats.ajisai) { /* leaves stay */ }
  const ph = (a, b) => inDoy(doy, a, b);
  const flooded = ph(md(4, 20), md(8, 25)), riceOn = ph(md(5, 20), md(9, 28)), stub = ph(md(9, 28), md(2, 28)), hasa = ph(md(9, 25), md(11, 10));
  let h = 0.3, col = new THREE.Color('#c8f090');
  if (ph(md(5, 20), md(6, 20))) { h = 0.35; col.set('#b8f088'); } else if (ph(md(6, 21), md(8, 10))) { h = 0.35 + 0.65 * ((doy - md(6, 21)) / (md(8, 10) - md(6, 21))); col.set('#a8e070'); } else if (ph(md(8, 11), md(9, 28))) { h = 1.0; const t = Math.min(1, Math.max(0, (doy - md(8, 20)) / 30)); col.set('#a8e070').lerp(new THREE.Color('#ffd860'), t); } else if (stub) { h = 0.22; col.set('#c8a868'); }
  if (sn > 0.4 && stub) col.lerp(new THREE.Color('#ffffff'), 0.6);
  for (const P of NATURE.paddies) { P.water.visible = flooded; P.rice.visible = riceOn || stub; P.rice.scale.y = h; }
  if (NATURE.fm) { NATURE.fm.rice.color.copy(col); NATURE.fm.mud.color.set(flooded ? '#5a4a36' : sn > 0.4 ? '#e8e8ee' : '#8a6a48'); }
  if (NATURE.scarecrow) NATURE.scarecrow.visible = ph(md(6, 1), md(9, 28)); if (NATURE.hasa) NATURE.hasa.visible = hasa;
  if (NATURE.crops) { const s = ph(md(5, 1), md(9, 15)); NATURE.crops.sum.visible = s; NATURE.crops.win.visible = !s; }
};
// ---------- waterfall: falling curtain, foam, mist, rocks ----------
NATURE.makeFalls = function () {
  const F = FALLS, along = [], dir = new THREE.Vector2(F.tx, F.tz);
  for (let s = -14; s <= 18; s += 0.5) { const x = F.x + F.tx * s, z = F.z + F.tz * s, L = waterLevelAt(G, x, z); along.push({ s, x, z, L: isNaN(L) ? null : L, h: groundH(x, z) }); }
  let best = null; for (let i = 1; i < along.length; i++) { const a = along[i - 1], b = along[i]; const la = a.L !== null ? a.L : a.h, lb = b.L !== null ? b.L : b.h; const dr = la - lb; if (!best || dr > best.dr) best = { dr, i }; }
  if (!best || best.dr < 0.8) return; let top = null, bot = null; for (let i = best.i - 1; i >= 0; i--) if (along[i].L !== null) { top = along[i]; break; } for (let i = best.i; i < along.length; i++) if (along[i].L !== null && along[i].L < (top ? top.L - 2 : 1e9)) { bot = along[i]; break; }
  if (!top) top = along[best.i - 1]; if (!bot) bot = along[Math.min(along.length - 1, best.i + 6)]; const Lt = top.L !== null ? top.L : top.h, Lb = bot.L !== null ? bot.L : bot.h;
  let wid = 3; for (let w = 1; w < 12; w += 0.5) { const x = top.x - F.tz * w, z = top.z + F.tx * w; if (isNaN(waterLevelAt(G, x, z))) { wid = Math.max(wid, w); break; } wid = w; }
  const W = Math.min(10, wid * 2 + 1), H = Lt - Lb, segW = 12, segH = 16, pos = [], uv = [], idx = [];
  for (let j = 0; j <= segH; j++) { const v = j / segH, out = 0.4 + v * v * 2.2, y = Lt + 0.05 - v * H; for (let i = 0; i <= segW; i++) { const u = i / segW - 0.5, x = top.x + F.tx * out - F.tz * u * W * (1 + v * 0.15), z = top.z + F.tz * out + F.tx * u * W * (1 + v * 0.15); pos.push(x, y, z); uv.push(u + 0.5, v * H / 3); } }
  for (let j = 0; j < segH; j++) for (let i = 0; i < segW; i++) { const a = j * (segW + 1) + i, b = a + segW + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const streak = (seed) => txCanvas(128, 256, (x, w, h) => { const R = mulberry(seed); x.clearRect(0, 0, w, h); for (let k = 0; k < 90; k++) { const sx = R() * w, len = 30 + R() * 120, sy = R() * h, a = 0.25 + R() * 0.6; const gr = x.createLinearGradient(0, sy, 0, sy + len); gr.addColorStop(0, `rgba(255,255,255,0)`); gr.addColorStop(0.5, `rgba(240,250,255,${a})`); gr.addColorStop(1, `rgba(255,255,255,0)`); x.fillStyle = gr; x.fillRect(sx, sy, 2 + R() * 4, len); x.fillRect(sx, sy - h, 2 + R() * 4, len); } }, true);
  const mk = (seed, op) => { const t = streak(seed); t.wrapS = t.wrapT = THREE.RepeatWrapping; const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, color: '#e8f6ff', fog: true }); return m; };
  const base = new THREE.MeshStandardMaterial({ color: '#9fd0e0', transparent: true, opacity: 0.55, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const grp = new THREE.Group(); scene.add(grp); NATURE.falls = { grp, mats: [], bot, top, Lb, Lt, W };
  const m0 = new THREE.Mesh(g, base); m0.renderOrder = 7; grp.add(m0);
  for (const [seed, op, sp] of [[11, 0.9, 1.6], [23, 0.7, 2.3]]) { const m = mk(seed, op); const ms = new THREE.Mesh(g, m); ms.renderOrder = 8; grp.add(ms); NATURE.falls.mats.push([m, sp]); }
  // foam pool + mist
  const foamT = txCanvas(128, 128, (x, w, h) => { const R = mulberry(5); x.clearRect(0, 0, w, h); for (let k = 0; k < 160; k++) { const a = R() * 6.28, r = R() * 60; x.fillStyle = `rgba(255,255,255,${0.15 + R() * 0.5})`; x.beginPath(); x.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 2 + R() * 6, 0, 7); x.fill(); } });
  const bx = top.x + F.tx * 2.6, bz = top.z + F.tz * 2.6;
  for (let k = 0; k < 2; k++) { const fm = new THREE.Mesh(new THREE.CircleGeometry(W * 0.75 + k * 1.5, 24), new THREE.MeshBasicMaterial({ map: foamT, transparent: true, opacity: 0.85 - k * 0.3, depthWrite: false })); fm.rotation.x = -Math.PI / 2; fm.position.set(bx, Lb + 0.06 + k * 0.01, bz); fm.renderOrder = 9; grp.add(fm); NATURE.falls['foam' + k] = fm; }
  const mistT = txCanvas(64, 64, (x) => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
  NATURE.falls.mist = []; for (let k = 0; k < 8; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistT, transparent: true, depthWrite: false, opacity: 0 })); sp.userData = { t: k / 8 * 3, x: bx, z: bz }; grp.add(sp); NATURE.falls.mist.push(sp); }
  // wet rocks around the pool and on the lip
  const rg = new THREE.DodecahedronGeometry(1, 1), rm = worldMat(TEX.rock, 0.3, '#9a958c', 0.6), R = mulberry(31), rocks = new THREE.Group(); grp.add(rocks);
  for (let k = 0; k < 9; k++) { const a = R() * 6.28, r = W * 0.7 + R() * 2.5, x = bx + Math.cos(a) * r, z = bz + Math.sin(a) * r, s = 0.6 + R() * 1.1; if (groundH(x, z) > Lb + 0.6) continue; const m = new THREE.Mesh(rg, rm); m.position.set(x, Math.max(groundH(x, z), Lb - 0.3) + s * 0.2, z); m.scale.set(s, s * 0.65, s * (0.8 + R() * 0.4)); m.rotation.set(R(), R() * 6, R()); m.castShadow = m.receiveShadow = true; rocks.add(m); }
  for (const sx of [-1, 1]) { const x = top.x - F.tz * sx * (W / 2 + 0.6), z = top.z + F.tx * sx * (W / 2 + 0.6), s = 1.2 + R() * 0.6, gy = groundH(x, z); if (gy < Lt - 0.8) continue; const m = new THREE.Mesh(rg, rm); m.position.set(x, Math.min(gy, Lt + 0.3) + s * 0.15, z); m.scale.set(s, s * 0.7, s); m.castShadow = true; rocks.add(m); }
  { const mr = mergeLocal(rocks); grp.remove(rocks); grp.add(mr); }
};
// ---------- night sky ----------
NATURE.makeSky = function () {
  const mk = (n, size, op, band) => { const pos = new Float32Array(n * 3), R = mulberry(n + (band ? 7 : 3)); for (let i = 0; i < n; i++) { let v; if (band) { const a = R() * 6.283, b = (R() - 0.5) * 0.28 * (R() < 0.5 ? 1 : 0.5); v = new THREE.Vector3(Math.cos(a), Math.sin(b) + Math.sin(a) * 0.55, Math.sin(a) * 0.8 + 0.3).normalize(); } else { const u = R() * 0.95 + 0.05, t = R() * 6.283, s = Math.sqrt(1 - u * u); v = new THREE.Vector3(s * Math.cos(t), u, s * Math.sin(t)); } if (v.y < 0.02) v.y = Math.abs(v.y) + 0.02; pos.set([v.x * 3000, v.y * 3000, v.z * 3000], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, color: band ? '#cfd8ff' : '#ffffff', transparent: true, opacity: 0, depthWrite: false, fog: false })); p.frustumCulled = false; p.renderOrder = -5; scene.add(p); p.userData.op = op; return p; };
  NATURE.stars = [mk(900, 1.6, 0.9), mk(260, 2.6, 1.0), mk(2600, 1.1, 0.45, true)];
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3)); NATURE.shoot = new THREE.Line(sg, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, fog: false })); NATURE.shoot.frustumCulled = false; scene.add(NATURE.shoot); NATURE.shootT = 10;
};
// ---------- birds ----------
NATURE.makeBirds = function () {
  const mkBird = (col, sc) => { const b = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, side: THREE.DoubleSide }); const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), m); body.scale.set(0.7, 0.6, 1.6); b.add(body);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.12, s * 0.75, 0.05, 0.05, 0, 0, 0.22], 3)), m); w.geometry.computeVertexNormals(); b.add(w); b.userData['w' + s] = w; } b.scale.setScalar(sc); scene.add(b); return b; };
  const H = PLACED.harbor || { x: 0, z: 0 };
  for (let k = 0; k < 7; k++) NATURE.birds.push({ o: mkBird('#f4f4f0', 1.3), kind: 'gull', c: { x: H.x + 20, z: H.z + 30 }, r: 25 + k * 4, a: k * 0.9, sp: 0.18 + k * 0.02, y: 14 + k * 1.5, ph: k });
  for (let k = 0; k < 6; k++) NATURE.birds.push({ o: mkBird('#1e2024', 1.4), kind: 'crow', c: { x: VILLAGE.x, z: VILLAGE.z }, r: 60 + k * 3, a: k * 0.15, sp: 0.12, y: 26 + k, ph: k * 1.3 });
};
NATURE.update = function (dt) {
  NATURE.t += dt; const t = NATURE.t, hf = currentHour(), clear = TIME.weather === 'clear', night = hf >= 19.3 || hf < 4.6 ? 1 : hf > 18.6 ? (hf - 18.6) / 0.7 : hf < 5.3 ? (5.3 - hf) / 0.7 : 0;
  if (NATURE.falls) { for (const [m, sp] of NATURE.falls.mats) m.map.offset.y = -t * sp * 0.6; const F = NATURE.falls; if (F.foam0) { F.foam0.rotation.z = t * 0.2; F.foam1.rotation.z = -t * 0.13; F.foam1.scale.setScalar(1 + Math.sin(t * 2) * 0.05); }
    for (const s of F.mist) { s.userData.t += dt; const k = (s.userData.t % 3) / 3, a = s.userData.t * 1.7; s.position.set(F.top.x + FALLS.tx * 2.6 + Math.cos(a) * (F.W * 0.3 + k * 2), F.Lb + 0.3 + k * 3.2, F.top.z + FALLS.tz * 2.6 + Math.sin(a) * (F.W * 0.3 + k * 2)); s.scale.setScalar(1.5 + k * 3); s.material.opacity = Math.sin(k * Math.PI) * 0.45; } }
  if (NATURE.stars) { const cp = camera.position, vis = !GAME.inside && (clear || TIME.weather === 'cloudy'); for (const s of NATURE.stars) { s.position.copy(cp); s.material.opacity = vis ? night * s.userData.op * (TIME.weather === 'cloudy' ? 0.3 : 1) * (s === NATURE.stars[2] ? (SEASON.key === 'summer' ? 1 : 0.35) : 1) : 0; s.visible = s.material.opacity > 0.01; }
    const sh = NATURE.shoot; NATURE.shootT -= dt; if (night > 0.8 && clear && !GAME.inside && NATURE.shootT < 0 && !sh.userData.on) { sh.userData = { on: true, t: 0, a: new THREE.Vector3((Math.random() - 0.5) * 2, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 2).normalize(), d: new THREE.Vector3((Math.random() - 0.5), -0.35, (Math.random() - 0.5)).normalize() }; NATURE.shootT = 18 + Math.random() * 30; }
    if (sh.userData.on) { const u = sh.userData; u.t += dt; const P = sh.geometry.attributes.position, p0 = u.a.clone().multiplyScalar(2500).addScaledVector(u.d, u.t * 900), p1 = p0.clone().addScaledVector(u.d, -160); P.setXYZ(0, p0.x, p0.y, p0.z); P.setXYZ(1, p1.x, p1.y, p1.z); P.needsUpdate = true; sh.position.copy(camera.position); sh.material.opacity = Math.sin(Math.min(1, u.t / 0.8) * Math.PI); if (u.t > 0.8) { u.on = false; sh.material.opacity = 0; } } }
  for (const b of NATURE.birds) { const vis = !GAME.inside && (b.kind === 'gull' ? hf > 6 && hf < 18 && TIME.weather !== 'rain' : hf > 15.8 && hf < 18.6); b.o.visible = vis; if (!vis) continue; b.a += b.sp * dt; const x = b.c.x + Math.cos(b.a) * b.r, z = b.c.z + Math.sin(b.a) * b.r * 0.7, y = b.y + Math.sin(t * 0.5 + b.ph) * 2;
    b.o.position.set(x, y, z); b.o.rotation.y = Math.atan2(-Math.sin(b.a) * b.r, Math.cos(b.a) * b.r * 0.7); b.o.rotation.z = -0.25; const f = Math.sin(t * (b.kind === 'gull' ? 4 : 7) + b.ph) * (b.kind === 'gull' && Math.sin(t * 0.7 + b.ph) > 0.3 ? 0.15 : 0.6); b.o.userData['w-1'].rotation.z = -f; b.o.userData['w1'].rotation.z = f; }
};
// hooks: flora into the vegetation build; extras once the world is built; seasons drive the farm & flowers
{ const _ap = SEASON.apply; SEASON.apply = function () { _ap.apply(this, arguments); try { NATURE.applySeason(SEASON.doy, SEASON.snow); } catch (e) { } }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); if (!NATURE.ready && VEG.fmats && PLACED.houses) { NATURE.ready = true; try { NATURE.makeFarm(); } catch (e) { console.warn('farm', e); } try { NATURE.makeFalls(); } catch (e) { console.warn('falls', e); } try { NATURE.makeSky(); NATURE.makeBirds(); } catch (e) { console.warn('sky', e); } SEASON.doy = -1; }
  try { NATURE.update(dt || 0.016); } catch (e) { if (!NATURE._err) { NATURE._err = 1; console.warn('nature', e); } } return r; }; }
TREE_LV.sakura0 = 2; TREE_LV.momiji0 = 3; TREE_LV.palm0 = 3; TREE_LV.bamboo0 = 4;
