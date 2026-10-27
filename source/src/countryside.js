// ===================== 日本の田舎の風景: 田んぼ（季節で変わる・はざかけ）、止まれ・カーブミラー・速度標識、お地蔵さん、自販機 =====================
const CTRY = { group: null, paddies: [] };
CTRY.month = () => (typeof seasonDate === 'function' ? seasonDate() : new Date()).getMonth() + 1;
CTRY.stage = () => { const m = CTRY.month(), d = (typeof seasonDate === 'function' ? seasonDate() : new Date()).getDate(); if (m === 4 || m === 5) return 'water'; if (m >= 6 && m <= 8) return 'green'; if (m === 9 || (m === 10 && d < 10)) return 'gold'; if ((m === 10 && d >= 10) || m === 11) return 'hazakake'; return 'fallow'; };
// find flat open land near the village for a few rice paddies (decoration only, no colliders)
CTRY.findPaddies = function () {
  const out = [], R = mulberry(4242), W = 13, L = 19, blocked = (x, z) => { if (groundH(x, z) < 1.4 || groundH(x, z) > 16 || !isNaN(waterLevelAt(G, x, z)) || waterDepthAt(x, z) > 0 || roadDistAt(x, z) < 5) return true; const [px, pz] = pushOut(x, z, 1.5); if (Math.hypot(px - x, pz - z) > 0.01) return true; for (const h of PLACED.houses) if (Math.hypot(h.x - x, h.z - z) < h.rad + 4) return true; return false; };
  const fits = (cx, cz, rot) => { let mn = 1e9, mx = -1e9; const c = Math.cos(rot), s = Math.sin(rot); for (let a = -W / 2 - 1; a <= W / 2 + 1; a += (W + 2) / 4) for (let b = -L / 2 - 1; b <= L / 2 + 1; b += (L + 2) / 5) { const x = cx + a * c + b * s, z = cz - a * s + b * c; if (blocked(x, z)) return null; const h = groundH(x, z); mn = Math.min(mn, h); mx = Math.max(mx, h); } return mx - mn < 0.55 ? { mn, mx } : null; };
  for (let it = 0; it < 900 && out.length < 4; it++) {
    const a = R() * 6.283, r = 60 + R() * 150, cx = VILLAGE.x + Math.cos(a) * r, cz = VILLAGE.z + Math.sin(a) * r, rot = Math.round(R() * 4) * Math.PI / 4 + (R() - 0.5) * 0.3;
    if (out.some(p => Math.hypot(p.x - cx, p.z - cz) < 22)) continue; const f = fits(cx, cz, rot); if (!f) continue;
    const p = { x: cx, z: cz, rot, W, L, y: f.mx + 0.05, base: f.mn }; out.push(p);
    // terraced neighbours in the same direction (棚田)
    for (const k of [1, -1]) { const nx = cx + Math.sin(rot) * (L + 1.0) * k, nz = cz + Math.cos(rot) * (L + 1.0) * k; if (out.length >= 4 || out.some(q => Math.hypot(q.x - nx, q.z - nz) < 18)) continue; const f2 = fits(nx, nz, rot); if (f2) out.push({ x: nx, z: nz, rot, W, L, y: f2.mx + 0.05, base: f2.mn }); }
  }
  return out;
};
CTRY.paddyMats = function () { if (CTRY.M) return CTRY.M; const M = CTRY.M = {};
  M.mud = stdM('#6a5338', 0.95); M.mudDry = stdM('#8a7050', 0.95); M.ridge = worldMat(TEX.grass || TEX.dirt, 0.45, '#a3a37a', 1);   // 畦: grassy banks (they read as dark mud walls before)
  M.water = new THREE.MeshStandardMaterial({ color: '#7aa8b8', roughness: 0.05, metalness: 0.35, transparent: true, opacity: 0.82 });
  M.rice = { water: stdM('#7ab84a', 0.8, 0, { side: THREE.DoubleSide }), green: stdM('#5f9a32', 0.8, 0, { side: THREE.DoubleSide }), gold: stdM('#d8b040', 0.75, 0, { side: THREE.DoubleSide }), hazakake: stdM('#a8905a', 0.9, 0, { side: THREE.DoubleSide }), fallow: stdM('#8a7a58', 0.9, 0, { side: THREE.DoubleSide }) };
  M.wood = stdM('#7a6248', 0.9); M.straw = stdM('#c8a860', 0.85); return M; };
CTRY.tuft = function (h) { const parts = []; for (let k = 0; k < 5; k++) { const b = new THREE.PlaneGeometry(0.05, h); b.translate(0, h / 2, 0); b.rotateZ((k - 2) * 0.13); b.rotateY(k * 1.26); parts.push(b.toNonIndexed()); } if (h > 0.5) { const e = new THREE.SphereGeometry(0.05, 5, 3); e.scale(0.8, 1.8, 0.8); for (let k = 0; k < 3; k++) { const q = e.clone().translate(Math.cos(k * 2.1) * 0.06, h * 0.9, Math.sin(k * 2.1) * 0.06).toNonIndexed(); q.deleteAttribute('uv'); parts.push(q); } } parts.forEach(p => p.attributes.uv && p.deleteAttribute('uv')); return mergeGeometries(parts); };
CTRY.buildPaddies = function (g) {
  const P = CTRY.paddies = CTRY.findPaddies(), st = CTRY.stage(), M = CTRY.paddyMats(); if (!P.length) return;
  for (const p of P) { const c = Math.cos(p.rot), sn = Math.sin(p.rot); let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (let a = -p.W / 2; a <= p.W / 2 + 0.01; a += 2) for (let b = -p.L / 2; b <= p.L / 2 + 0.01; b += 2) { const x = p.x + a * c + b * sn, z = p.z - a * sn + b * c; VEG.removeAt(x, z, 1.8); x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); } VEG.refresh(x0 - 3, z0 - 3, x1 + 3, z1 + 3); }
  const riceH = { water: 0.18, green: 0.6, gold: 0.85, hazakake: 0.12, fallow: 0.08 }[st], step = st === 'water' ? 0.35 : 0.42, mats = [];
  const D = new THREE.Object3D(); let n = 0; const MAXI = 9000, im = new THREE.InstancedMesh(CTRY.tuft(riceH), M.rice[st], MAXI); im.castShadow = st === 'green' || st === 'gold'; im.receiveShadow = true;
  for (const p of P) {
    const s = sub(g, p.x, 0, p.z, p.rot);
    // the soil / water surface, and the grassy ridges (あぜ) all round
    const top = p.y; B(s, p.W, Math.max(0.2, top - p.base + 0.15), p.L, st === 'water' ? M.mud : M.mudDry, 0, (top + p.base - 0.15) / 2 - 0.02, 0);
    if (st === 'water') { const w = new THREE.Mesh(new THREE.PlaneGeometry(p.W - 0.5, p.L - 0.5), M.water); w.rotation.x = -Math.PI / 2; w.position.set(0, top + 0.03, 0); w.receiveShadow = true; s.add(w); }
    { const rh = top - p.base + 0.2, rc = (top + 0.1 + p.base - 0.1) / 2; for (const sx of [-1, 1]) { B(s, 0.55, rh, p.L + 0.55, M.ridge, sx * (p.W / 2), rc, 0); B(s, p.W + 0.55, rh, 0.55, M.ridge, 0, rc, sx * (p.L / 2)); } }
    // rice in rows
    const c = Math.cos(p.rot), sn = Math.sin(p.rot);
    for (let a = -p.W / 2 + 0.6; a <= p.W / 2 - 0.6 && n < MAXI; a += step) for (let b = -p.L / 2 + 0.6; b <= p.L / 2 - 0.6 && n < MAXI; b += step) { const x = p.x + a * c + b * sn, z = p.z - a * sn + b * c; D.position.set(x + (Math.random() - 0.5) * 0.04, top, z + (Math.random() - 0.5) * 0.04); D.rotation.set(0, Math.random() * 6.28, 0); const k = 0.85 + Math.random() * 0.3; D.scale.set(k, k * (st === 'gold' ? 0.9 + Math.random() * 0.2 : 1), k); D.updateMatrix(); im.setMatrixAt(n++, D.matrix); }
    // はざかけ: rice bundles drying on a wooden rack after the harvest
    if (st === 'hazakake') { const rk = sub(s, -p.W / 2 + 2.2, top, 0); const len = p.L - 4; for (const z of [-len / 2, 0, len / 2]) for (const sx of [-1, 1]) ROD(rk, 0.045, M.wood, [sx * 0.45, 0, z], [-sx * 0.12, 1.9, z]); CY(rk, 0.04, len + 0.6, M.wood, 0, 1.6, 0, 5, Math.PI / 2); for (let z = -len / 2 + 0.2; z <= len / 2 - 0.15; z += 0.24) for (const sx of [-1, 1]) { const b = SP(rk, 0.16, M.straw, sx * 0.12, 1.25, z, 1, 6); b.scale.set(0.55, 2.4, 0.7); b.rotation.z = sx * 0.12; } }
  }
  im.count = n; g.add(im);
};
// ---------- road signs: 止まれ at side roads, curve mirrors, speed limit 40 ----------
CTRY.signTex = function (kind) { const key = 'sg_' + kind; if (CTRY[key]) return CTRY[key]; const [c, x] = cvs(128, 128);
  if (kind === 'tomare') { x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(6, 10); x.lineTo(122, 10); x.lineTo(64, 120); x.closePath(); x.fill(); x.fillStyle = '#d8202a'; x.beginPath(); x.moveTo(14, 15); x.lineTo(114, 15); x.lineTo(64, 110); x.closePath(); x.fill(); x.fillStyle = '#ffffff'; x.font = '900 30px sans-serif'; x.textAlign = 'center'; x.fillText('止まれ', 64, 52); }
  if (kind === 'speed') { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#d8202a'; x.lineWidth = 12; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke(); x.fillStyle = '#1f3fa8'; x.font = '900 54px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('40', 64, 68); }
  return CTRY[key] = toTex(c, false); };
CTRY.signPost = function (g, x, z, ry, kind) { const s = sub(g, x, groundH(x, z), z, ry); s.userData.tag = kind; const _u = 0, pole = stdM('#d8dadc', 0.5, 0.5); CY(s, 0.035, 2.3, pole, 0, 1.15, 0, 6); const f = new THREE.Mesh(new THREE.PlaneGeometry(kind === 'tomare' ? 0.8 : 0.66, kind === 'tomare' ? 0.8 : 0.66), new THREE.MeshStandardMaterial({ map: CTRY.signTex(kind), transparent: true, alphaTest: 0.5, roughness: 0.5 })); f.position.set(0, 2.15, 0.04); s.add(f); if (kind !== 'tomare') { const b = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), stdM('#b8babc', 0.5, 0.5)); b.position.set(0, 2.15, 0.035); b.rotation.y = Math.PI; s.add(b); } else { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshStandardMaterial({ map: CTRY.signTex('tomare'), color: '#9a9ea2', transparent: true, alphaTest: 0.5 })); b.position.set(0, 2.15, 0.035); b.rotation.y = Math.PI; s.add(b); } return s; };
CTRY.mirror = function (g, x, z, ry) { const s = sub(g, x, groundH(x, z), z, ry); s.userData.tag = 'mirror'; const _u = 0, org = stdM('#f08a1a', 0.5, 0.2); CY(s, 0.045, 2.7, org, 0, 1.35, 0, 8); B(s, 0.06, 0.06, 0.3, org, 0, 2.6, 0.15); const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 20), org); ring.rotation.x = Math.PI / 2; ring.position.set(0, 2.55, 0.33); s.add(ring); const m = new THREE.Mesh(new THREE.CircleGeometry(0.35, 20), new THREE.MeshStandardMaterial({ color: '#cfe0ec', roughness: 0.05, metalness: 0.95 })); m.position.set(0, 2.55, 0.37); s.add(m); return s; };
CTRY.jizo = function (g, x, z, ry) { const s = sub(g, x, groundH(x, z), z, ry); s.userData.tag = 'jizo'; const _u = 0, stone = stdM('#9a968c', 0.95), red = stdM('#c8282a', 0.8), wood = stdM('#7a5a3a', 0.85);
  B(s, 1.1, 0.25, 0.8, stone, 0, 0.12, 0); for (const sx of [-1, 1]) B(s, 0.08, 1.2, 0.7, wood, sx * 0.5, 0.85, 0); B(s, 1.1, 1.2, 0.06, wood, 0, 0.85, -0.36); const rf = B(s, 1.4, 0.07, 1.1, MAT.kawara || wood, 0, 1.5, 0.05); rf.rotation.x = -0.1;
  CY(s, 0.16, 0.45, stone, 0, 0.47, 0, 10); SP(s, 0.13, stone, 0, 0.8, 0, 1.05, 10); const bib = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.2, 10, 1, true, -1.2, 2.4), red); bib.position.set(0, 0.6, 0.02); s.add(bib); const cap = SP(s, 0.135, red, 0, 0.86, -0.01, 0.9, 10); cap.scale.set(1, 0.7, 1); cap.position.y = 0.9;
  CY(s, 0.05, 0.12, stdM('#4a6a3a', 0.6), 0.28, 0.31, 0.15, 6); for (let k = 0; k < 3; k++) SP(s, 0.04, stdM(['#f0e040', '#e86a8a', '#ffffff'][k], 0.7), 0.26 + k * 0.03, 0.42, 0.15, 1, 5); return s; };
CTRY.vending = function (g, x, z, ry) { const v = sub(g, x, groundH(x, z), z, ry); B(v, 0.95, 1.85, 0.75, stdM('#e8382a', 0.4), 0, 0.93, 0); B(v, 0.8, 0.9, 0.02, stdM('#e8f4ff', 0.1, 0, { emissive: new THREE.Color('#d0e8ff'), emissiveIntensity: 0.55 }), 0, 1.2, 0.38); for (let i = 0; i < 12; i++) B(v, 0.09, 0.17, 0.03, stdM(['#e83a2a', '#3a8ae8', '#f0c020', '#3ab05a'][i % 4], 0.5), -0.28 + (i % 6) * 0.112, 0.98 + Math.floor(i / 6) * 0.38, 0.4); B(v, 0.5, 0.12, 0.05, AM.dark, 0, 0.35, 0.38); return v; };
CTRY.roadside = function (g) {
  const free = (x, z, r = 0.8) => { if (groundH(x, z) < 0.4 || !isNaN(waterLevelAt(G, x, z)) || waterDepthAt(x, z) > 0 || deckY(x, z) !== null) return false; const [px, pz] = pushOut(x, z, r); return Math.hypot(px - x, pz - z) < 0.01; };
  const RS = ROADS.filter(r => !isFoot(r) && r.w >= 3.4 && rLen(r) > 20); let tom = 0, mir = 0;
  // junctions (roadnode.js): 止まれ on every side road that gives way (its stop line is painted by the road itself),
  // a curve mirror on the kerb corner across the junction, turned to look back down the side road
  const clear = (x, z, r) => free(x, z, r) && !JN.onRoad(x, z, 0.25);
  for (const j of (JN.list || [])) for (const a of (j.minor || [])) { const r = a.r; if (isFoot(r) || r.w < 3.4 || rLen(r) < 20) continue;
    const s = JN.cutStation(a, a.cut + 1.3), p = rAt(r, s), [tx, tz] = rTan(r, s), fx = -a.sgn * tx, fz = -a.sgn * tz; // toward the junction
    const lx = fz, lz = -fx, off = r.w / 2 + (r.side ? 0.45 : 0.7), sx = p.x + lx * off, sz = p.z + lz * off;
    if (clear(sx, sz, 0.3)) { CTRY.signPost(g, sx, sz, Math.atan2(-fx, -fz), 'tomare'); tom++; }
    let best = null; for (const c of j.corners) { if (c.a === a || c.b === a || !c.pts || c.pts.length < 2) continue; const k = Math.floor((c.pts.length - 1) / 2), m0 = c.pts[k], m1 = c.pts[k + 1] || c.pts[k - 1], mx = (m0[0] + m1[0]) / 2, mz = (m0[1] + m1[1]) / 2;
      let nx = m1[1] - m0[1], nz = -(m1[0] - m0[0]); const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl; if ((mx - j.x) * nx + (mz - j.z) * nz < 0) { nx = -nx; nz = -nz; }
      const sw = Math.max(c.a.sw, c.b.sw), qx = mx + nx * (sw + 0.45), qz = mz + nz * (sw + 0.45), dl = Math.hypot(qx - j.x, qz - j.z) || 1, sc = -((qx - j.x) * a.d[0] + (qz - j.z) * a.d[1]) / dl;
      if (!best || sc > best.sc) best = { sc, x: qx, z: qz }; }
    // (mirrors only where narrow country roads meet; town streets with sidewalks don't get them)
    if (!r.side && best && best.sc > 0.2 && clear(best.x, best.z, 0.4)) { const tp = rAt(r, JN.cutStation(a, a.cut + 7)); CTRY.mirror(g, best.x, best.z, Math.atan2(tp.x - best.x, tp.z - best.z)); mir++; } }
  // speed limit signs every ~160 m along the main road, on alternating sides
  const M0 = RS[0]; let spd = 0; if (M0) { const L = rLen(M0); for (let s = 40, k = 0; s < L - 20; s += 160, k++) { const a = rAt(M0, s), t = rTan(M0, s), sd = k % 2 ? 1 : -1, off = M0.w / 2 + 0.9, x = a.x + t[1] * off * sd, z = a.z - t[0] * off * sd; if (!clear(x, z, 0.4)) continue; CTRY.signPost(g, x, z, Math.atan2(-t[0] * sd, -t[1] * sd), 'speed'); spd++; } }
  // お地蔵さん at a couple of quiet roadside spots near the village, a vending machine by the harbour
  let jz = 0; for (const r of RS) { if (jz >= 2) break; const L = rLen(r); for (let s = 30; s < L - 30 && jz < 2; s += 37) { const a = rAt(r, s); if (Math.hypot(a.x - VILLAGE.x, a.z - VILLAGE.z) > 140 || Math.hypot(a.x - VILLAGE.x, a.z - VILLAGE.z) < 40) continue; const t = rTan(r, s), off = r.w / 2 + 2.2, x = a.x - t[1] * off, z = a.z + t[0] * off; if (!clear(x, z, 1.0) || CTRY.paddies.some(p => Math.hypot(p.x - x, p.z - z) < 14)) continue; CTRY.jizo(g, x, z, Math.atan2(a.x - x, a.z - z)); addCollider({ x, z, r: 0.6, kind: 'pole' }); jz++; s += 120; } }
  if (DECO.ship && DECO.ship.at) { const at = DECO.ship.at, [x, z] = toWorld(at, -3.7, 1.2); if (free(x, z, 0.6)) { CTRY.vending(g, x, z, at.rot); addCollider({ x, z, hw: 0.5, hd: 0.4, rot: at.rot, kind: 'pole' }); } }
  CTRY.n = { tom, mir, spd, jz };
};
CTRY.build = function () {
  if (CTRY.group) { scene.remove(CTRY.group); CTRY.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); (CTRY.cols || []).forEach(c => c.off = true); }
  const g = CTRY.group = new THREE.Group(); scene.add(g); const prev = COLL.track; CTRY.cols = []; COLL.track = { push: c => { CTRY.cols.push(c); if (prev) prev.push(c); } };
  try { CTRY.buildPaddies(g); CTRY.roadside(g); } catch (e) { console.warn('countryside', e); } finally { COLL.track = prev; }
};
// stand on the paddy soil / ridges instead of sinking into them
{ const _sy = standY; standY = function (x, z) { const b = _sy(x, z); for (const p of CTRY.paddies) { const c = Math.cos(p.rot), s = Math.sin(p.rot), dx = x - p.x, dz = z - p.z, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < p.W / 2 + 0.3 && Math.abs(lz) < p.L / 2 + 0.3) { const ridge = Math.abs(lx) > p.W / 2 - 0.3 || Math.abs(lz) > p.L / 2 - 0.3; return Math.max(b, p.y + (ridge ? 0.18 : 0)); } } return b; }; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { CTRY.build(); } catch (e) { console.warn('ctry', e); } return r; }; }
{ const _rr = refreshRegion; refreshRegion = function () { const r = _rr.apply(this, arguments); clearTimeout(CTRY._t); CTRY._t = setTimeout(() => { try { if (GAME.p && !EDIT.on) CTRY.build(); } catch (e) { } }, 1500); return r; }; }
{ const _te = toggleEdit; toggleEdit = function (on) { const was = EDIT.on, r = _te.apply(this, arguments); if (was && !EDIT.on && GAME.p) setTimeout(() => { try { CTRY.build(); } catch (e) { } }, 200); return r; }; }
// ---------- 神社 instead of the brick church: 鳥居, 参道, 石灯籠, 狛犬, 手水舎, 拝殿 with しめ縄 and 鈴, 本殿 ----------
makeChurch = function (C) {
  const g = new THREE.Group(), A = archMats(), shu = stdM('#d4452a', 0.55), black = stdM('#2a2422', 0.6), wood = stdM('#8a6644', 0.75), woodD = stdM('#5a4030', 0.8), white = stdM('#f4f0e6', 0.8), stone = stdM('#a8a49a', 0.95), copper = new THREE.MeshStandardMaterial({ map: TEX.kawara, color: '#6a9a88', roughness: 0.6, metalness: 0.25 }), gold = stdM('#d8b050', 0.3, 0.8), rope = stdM('#d8c890', 0.9);
  const glow = new THREE.MeshStandardMaterial({ color: '#fff0c8', roughness: 0.6, emissive: new THREE.Color('#ffc870'), emissiveIntensity: 0 }); HOUSE_LIGHTS.push({ material: glow }); C.stained = glow;
  const add = (lx, lz, o) => { o.position.x += lx; o.position.z += lz; g.add(o); return o; };
  // ground: gravel courtyard and a stone approach
  const grav = new THREE.Mesh(new THREE.PlaneGeometry(13, 27), worldMat(TEX.concrete, 0.5, '#d8d0bc', 0.95)); grav.rotation.x = -Math.PI / 2; grav.position.set(0, 0.03, -1.5); grav.receiveShadow = true; g.add(grav);
  for (let z = 12; z > -1; z -= 0.9) { const st = B(g, 1.6, 0.06, 0.8, stone, 0, 0.06, z); st.rotation.y = (Math.random() - 0.5) * 0.04; }
  // 鳥居
  { const t = sub(g, 0, 0, 12.5); for (const sx of [-1, 1]) { CY(t, 0.24, 4.6, shu, sx * 2.1, 2.3, 0, 12); CY(t, 0.32, 0.3, black, sx * 2.1, 0.15, 0, 12); } B(t, 4.9, 0.28, 0.35, shu, 0, 3.75, 0); const kasagi = B(t, 6.0, 0.34, 0.5, black, 0, 4.45, 0); B(t, 5.6, 0.22, 0.45, shu, 0, 4.2, 0); B(t, 0.3, 0.75, 0.3, shu, 0, 4.0, 0); B(t, 0.8, 0.5, 0.06, black, 0, 4.0, 0.18); }
  // 石灯籠 (glow at night) and 狛犬 pairs
  for (const sx of [-1, 1]) { const l = sub(g, sx * 2.4, 0, 7); B(l, 0.6, 0.25, 0.6, stone, 0, 0.12, 0); CY(l, 0.12, 1.0, stone, 0, 0.75, 0, 8); B(l, 0.55, 0.12, 0.55, stone, 0, 1.3, 0); CY(l, 0.25, 0.42, stone, 0, 1.56, 0, 6); for (const [wx, wz, ry] of [[0, 0.22, 0], [0, -0.22, Math.PI], [0.22, 0, Math.PI / 2], [-0.22, 0, -Math.PI / 2]]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), glow); w.position.set(wx, 1.58, wz); w.rotation.y = ry; l.add(w); } const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.38, 6), stone); cap.position.y = 1.97; l.add(cap); SP(l, 0.08, stone, 0, 2.2, 0, 1, 6);
    const k = sub(g, sx * 2.0, 0, 3.0, sx > 0 ? -Math.PI / 2 - 0.3 : Math.PI / 2 + 0.3); B(k, 0.9, 0.55, 1.1, stone, 0, 0.27, 0); B(k, 0.95, 0.06, 1.15, stone, 0, 0.57, 0);
    const kb = sub(k, 0, 0.6, 0); B(kb, 0.5, 0.42, 0.62, stone, 0, 0.21, -0.12); const chest = B(kb, 0.42, 0.62, 0.32, stone, 0, 0.5, 0.18); chest.rotation.x = -0.25; for (const lx of [-0.12, 0.12]) B(kb, 0.11, 0.55, 0.12, stone, lx, 0.27, 0.32);
    const hd = sub(kb, 0, 0.95, 0.24); B(hd, 0.36, 0.3, 0.32, stone, 0, 0, 0); B(hd, 0.26, 0.14, 0.16, stone, 0, -0.05, 0.2); const mane = SP(hd, 0.25, stone, 0, 0.02, -0.08, 1, 8); mane.scale.set(1, 0.95, 0.7); for (const ex of [-0.17, 0.17]) SP(hd, 0.06, stone, ex, 0.15, -0.02, 1, 5); if (sx > 0) B(hd, 0.18, 0.03, 0.05, AM.dark, 0, -0.08, 0.28); const tail = SP(kb, 0.15, stone, 0, 0.55, -0.42, 1.4, 6); tail.scale.set(0.9, 1.6, 0.6); }
  // 手水舎
  { const t = sub(g, 4.4, 0, 4.5, -Math.PI / 2); for (const sx of [-1, 1]) for (const sz of [-1, 1]) CY(t, 0.08, 2.1, wood, sx * 0.9, 1.05, sz * 0.6, 8); B(t, 1.5, 0.5, 0.8, stone, 0, 0.45, 0); B(t, 1.3, 0.06, 0.6, stdM('#6a9ab0', 0.1, 0.3), 0, 0.71, 0); const r = new THREE.Mesh(roofGeometry(2.6, 2.0, 0.7, false), copper); r.position.y = 2.1; t.add(r); }
  // 拝殿
  { const h = sub(g, 0, 0, -3.8); B(h, 9.0, 0.6, 7.2, stone, 0, 0.3, 0); B(h, 8.2, 0.12, 6.4, wood, 0, 0.66, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) CY(h, 0.16, 3.0, wood, sx * 3.8, 2.1, sz * 2.9, 10); for (const sx of [-1.3, 1.3]) CY(h, 0.14, 2.8, wood, sx, 2.1, 2.9, 10);
    B(h, 7.6, 2.6, 0.12, white, 0, 2.0, -2.9); for (const sx of [-1, 1]) B(h, 0.12, 2.6, 5.8, white, sx * 3.8, 2.0, 0); for (const sx of [-1, 1]) B(h, 2.3, 2.4, 0.08, stdM('#6a4a32', 0.8), sx * 2.55, 1.9, 2.85); B(h, 2.4, 2.4, 0.06, black, 0, 1.9, 2.8);
    for (const y of [0.9, 3.45]) B(h, 8.0, 0.18, 6.2, woodD, 0, y, 0);
    const rf = new THREE.Mesh(roofGeometry(10.6, 8.6, 2.6, true), copper); rf.position.y = 3.5; rf.castShadow = true; h.add(rf); B(h, 3.6, 0.1, 2.2, copper, 0, 3.3, 3.8).rotation.x = 0.28; for (const sx of [-1, 1]) CY(h, 0.12, 2.7, wood, sx * 1.5, 1.9, 4.6, 8);
    // しめ縄 with 紙垂, the bell and the offering box
    const sm = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.13, 8, 20, Math.PI), rope); sm.rotation.z = Math.PI; sm.position.set(0, 3.1, 3.0); sm.scale.set(1, 0.35, 1); h.add(sm); for (const x of [-0.9, 0, 0.9]) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.45), stdM('#ffffff', 0.8, 0, { side: THREE.DoubleSide })); sh.position.set(x, 2.6, 3.05); h.add(sh); }
    SP(h, 0.22, gold, 0, 2.6, 3.4, 1, 10); CY(h, 0.03, 1.8, stdM('#c83a3a', 0.8), 0, 1.6, 3.42, 6); B(h, 1.4, 0.7, 0.7, wood, 0, 1.05, 3.6); for (let k = 0; k < 5; k++) B(h, 1.3, 0.03, 0.06, woodD, 0, 1.41, 3.36 + k * 0.12); }
  // 本殿 (small, raised, behind)
  { const h = sub(g, 0, 0, -10.6); B(h, 4.6, 0.9, 4.4, stone, 0, 0.45, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) CY(h, 0.12, 2.6, wood, sx * 1.7, 2.1, sz * 1.6, 8); B(h, 3.4, 2.0, 3.2, white, 0, 2.0, 0); const rf = new THREE.Mesh(roofGeometry(5.2, 5.0, 1.9, false), copper); rf.position.y = 3.2; h.add(rf); for (const sx of [-1, 1]) { const ch = B(h, 0.12, 1.4, 0.12, woodD, sx * 0.7, 5.3, 2.4); ch.rotation.x = 0.5; const ch2 = B(h, 0.12, 1.4, 0.12, woodD, sx * 0.7, 5.3, -2.4); ch2.rotation.x = -0.5; } B(h, 0.2, 0.2, 5.2, woodD, 0, 5.15, 0); }
  // tall cedars behind
  const cedar = stdM('#2f5a32', 0.9); for (const [x, z, s] of [[-5.2, -9, 1.2], [5.0, -11, 1.0], [-5.5, -2, 0.9], [5.6, -5, 1.1]]) { const t = sub(g, x, 0, z); CY(t, 0.25 * s, 3 * s, woodD, 0, 1.5 * s, 0, 8); for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry((2.0 - k * 0.4) * s, 2.8 * s, 9), cedar); c.position.y = (3.2 + k * 1.6) * s; c.castShadow = true; t.add(c); } }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.position.set(C.x, C.y, C.z); g.rotation.y = C.rot;
  const col = (lx, lz, o) => { const [x, z] = toWorld(C, lx, lz); addCollider(Object.assign({ x, z, rot: C.rot, kind: 'bld' }, o)); };
  col(0, -3.8, { hw: 4.6, hd: 3.7 }); col(0, -10.6, { hw: 2.4, hd: 2.3 }); for (const sx of [-1, 1]) { col(sx * 2.1, 12.5, { r: 0.35 }); col(sx * 2.4, 7, { r: 0.4 }); col(sx * 2.0, 3.0, { r: 0.5 }); } col(4.4, 4.5, { hw: 0.9, hd: 1.2 });
  return mergeLocal(g);
};
// ---------- more village details: 火の見やぐら by the hall, a red post box and a garbage station by the shop, kei trucks parked by the fields ----------
CTRY.fireTower = function (g, x, z, ry) { const s = sub(g, x, groundH(x, z), z, ry); s.userData.tag = 'tower'; const _u = 0, st = stdM('#7a2a22', 0.6, 0.4), H = 9;
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) ROD(s, 0.06, st, [a * 1.2, 0, b * 1.2], [a * 0.45, H, b * 0.45]);
  for (let k = 1; k < 6; k++) { const y = k * H / 6, w = 1.2 - (1.2 - 0.45) * y / H; for (const [a, b, c, d] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) ROD(s, 0.025, st, [a * w, y, b * w], [c * w, y, d * w]); }
  B(s, 1.5, 0.08, 1.5, st, 0, H, 0); for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) B(s, a ? 0.04 : 1.5, 0.6, a ? 1.5 : 0.04, st, a * 0.75, H + 0.3, b * 0.75);
  const rf = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.9, 4), st); rf.position.y = H + 1.6; rf.rotation.y = Math.PI / 4; s.add(rf); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) ROD(s, 0.03, st, [a * 0.7, H, b * 0.7], [a * 0.7, H + 1.2, b * 0.7]);
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.42, 10), stdM('#8a6a3a', 0.4, 0.7)); bell.position.y = H + 0.75; s.add(bell); SP(s, 0.12, stdM('#e8322a', 0.5, 0, { emissive: new THREE.Color('#a01010'), emissiveIntensity: 0.6 }), 0, H + 2.15, 0, 1, 8);
  for (let k = 0; k < 6; k++) { const y0 = k * H / 6, y1 = (k + 1) * H / 6, w0 = 1.2 - 0.75 * y0 / H, w1 = 1.2 - 0.75 * y1 / H; for (const f of [1, -1]) { ROD(s, 0.02, st, [-w0, y0, f * w0], [w1, y1, f * w1]); ROD(s, 0.02, st, [w0, y0, f * w0], [-w1, y1, f * w1]); ROD(s, 0.02, st, [f * w0, y0, -w0], [f * w1, y1, w1]); ROD(s, 0.02, st, [f * w0, y0, w0], [f * w1, y1, -w1]); } }
  for (let k = 0; k < 14; k++) { const y = 0.4 + k * 0.62, w = 1.2 - 0.75 * y / H; B(s, 0.5, 0.03, 0.03, st, 0, y, w + 0.02); } for (const sx of [-0.25, 0.25]) ROD(s, 0.02, st, [sx, 0, 1.22], [sx, H, 0.47]);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) B(s, 0.35, 0.3, 0.35, MAT.concrete, a * 1.2, 0.1, b * 1.2); return s; };
CTRY.post = function (g, x, z, ry) { const s = sub(g, x, groundH(x, z), z, ry), red = stdM('#d8282f', 0.45); CY(s, 0.26, 1.0, red, 0, 0.6, 0, 18); const top = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), red); top.position.y = 1.1; s.add(top); B(s, 0.3, 0.04, 0.05, AM.dark, 0, 0.9, 0.26); B(s, 0.34, 0.2, 0.34, MAT.concrete, 0, 0.1, 0); return s; };
CTRY.garbage = function (g, x, z, ry) { const s = sub(g, x, groundH(x, z), z, ry); s.userData.tag = 'garbage'; const _u = 0, fr = stdM('#8a9096', 0.4, 0.6), net = stdM('#2f7a3e', 0.9);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(s, 0.05, 0.95, 0.05, fr, sx * 0.9, 0.47, sz * 0.5); B(s, 1.8, 0.05, 1.0, fr, 0, 0.95, 0); B(s, 1.9, 0.08, 1.1, MAT.concrete, 0, 0.04, 0);
  for (let k = 0; k <= 12; k++) { B(s, 0.015, 0.9, 1.0, net, -0.9 + k * 0.15, 0.48, 0); } for (let k = 0; k <= 6; k++) { B(s, 1.8, 0.015, 1.0, net, 0, 0.1 + k * 0.14, 0); }
  const bag = [stdM('#f2f2ee', 0.6, 0, { transparent: true, opacity: 0.92 }), stdM('#dfe8f0', 0.6)]; for (let k = 0; k < 5; k++) { const b = SP(s, 0.28, bag[k % 2], -0.6 + k * 0.3, 0.3, (k % 2 - 0.5) * 0.3, 0.85, 8); }
  for (const zz of [0.53, -0.53]) { const sg = dynSign(0.9, 0.42, '燃えるごみ 月・木', '#ffffff', '#2a5a3a'); sg.position.set(0, 1.28, zz); if (zz < 0) sg.rotation.y = Math.PI; s.add(sg); } B(s, 0.04, 0.5, 0.04, fr, 0, 1.05, 0.5); return s; };
CTRY.extras = function (g) {
  const free = (x, z, r = 0.8) => { if (groundH(x, z) < 0.4 || !isNaN(waterLevelAt(G, x, z)) || roadDistAt(x, z) < 3.4) return false; const [px, pz] = pushOut(x, z, r); return Math.hypot(px - x, pz - z) < 0.01; };
  const near = (cx, cz, r0, r1, rad, fn) => { for (let r = r0; r <= r1; r += 1.5) for (let a = 0; a < 6.28; a += 0.35) { const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (free(x, z, rad)) { fn(x, z); return true; } } return false; };
  const H = PLACED.hall; if (H) near(H.x, H.z, 9, 22, 1.6, (x, z) => { CTRY.fireTower(g, x, z, H.rot); addCollider({ x, z, r: 1.3, kind: 'pole' }); });
  if (DECO.shop) { const S = DECO.shop; near(S.x, S.z, 8, 16, 1.1, (x, z) => { const nr = nearestOnRoads(x, z, 30, false), ry = nr ? Math.atan2(nr.x - x, nr.z - z) : 0; CTRY.garbage(g, x, z, ry); addCollider({ x, z, hw: 0.95, hd: 0.55, rot: ry, kind: 'pole' }); }); }
  // a farmer's kei truck parked on the grass beside some of the paddies
  TRF.parked = []; for (const p of CTRY.paddies) { if (TRF.parked.length >= 3 || Math.random() < 0.4) continue; const c = Math.cos(p.rot), s = Math.sin(p.rot); for (const sd of [-1, 1]) { const lx = sd * (p.W / 2 + 2.2), x = p.x + lx * c, z = p.z - lx * s; if (!free(x, z, 1.6)) continue; TRF.parked.push({ type: 'truck', x, z, rot: p.rot + (Math.random() < 0.5 ? 0 : Math.PI), col: new THREE.Color('#f4f4f0'), y: groundH(x, z) }); addCollider({ x, z, hw: 0.8, hd: 1.75, rot: p.rot, kind: 'pole' }); break; } }
  if (DECO.shop && PLACED.shop) { const S = PLACED.shop, [x, z] = toWorld(S, S.w / 2 + 2.6, S.d / 2 + 0.5); if (free(x, z, 1.6)) { TRF.parked.push({ type: 'kei', x, z, rot: S.rot, col: new THREE.Color('#e8d8b8'), y: groundH(x, z) }); addCollider({ x, z, hw: 0.8, hd: 1.75, rot: S.rot, kind: 'pole' }); } }
};
{ const _cb = CTRY.build; CTRY.build = function () { _cb.apply(this, arguments); const prev = COLL.track; COLL.track = { push: c => { CTRY.cols.push(c); if (prev) prev.push(c); } }; try { CTRY.extras(CTRY.group); } catch (e) { console.warn('extras', e); } finally { COLL.track = prev; } }; }

// 秋祭り: banners and lanterns at the shrine in October
CTRY.festival = function (g) {
  const m = CTRY.month(), C = PLACED.church; if (!C || !(m === 10 || (m === 11 && new Date().getDate() <= 5))) return;
  const red = stdM('#c8282a', 0.8, 0, { side: THREE.DoubleSide }), white = stdM('#f4f0e6', 0.8, 0, { side: THREE.DoubleSide }), pole = stdM('#8a6644', 0.8);
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const [x, z] = toWorld(C, sx * 1.6, 11 - k * 2.6), y = C.y; const s = sub(g, x, y, z, C.rot); CY(s, 0.03, 3.4, pole, 0, 1.7, 0, 6); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.0), k % 2 ? white : red); f.position.set(sx * 0.27, 2.25, 0); f.rotation.y = Math.PI / 2; s.add(f); B(s, 0.03, 0.03, 0.6, pole, sx * 0.27, 3.27, 0).rotation.y = Math.PI / 2; }
  const ch = stdM('#f2d090', 0.6, 0, { emissive: new THREE.Color('#ffb050'), emissiveIntensity: 0.4 }), cap = stdM('#2a2422', 0.7); for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const [x, z] = toWorld(C, sx * 2.05, 11 - k * 2.6 - 1.3); const s2 = sub(g, x, C.y, z, C.rot); CY(s2, 0.025, 2.9, pole, 0, 1.45, 0, 6); B(s2, 0.03, 0.03, 0.45, pole, 0, 2.85, 0).rotation.x = 0; SP(s2, 0.17, ch, 0, 2.42, 0.2, 1.35, 10); CY(s2, 0.1, 0.05, cap, 0, 2.66, 0.2, 10); CY(s2, 0.1, 0.05, cap, 0, 2.18, 0.2, 10); }
};
{ const _cb2 = CTRY.build; CTRY.build = function () { _cb2.apply(this, arguments); try { CTRY.festival(CTRY.group); } catch (e) { console.warn('fest', e); } }; }
// keep the shrine grounds free of grass and flowers
{ const _ps = placeStructures; placeStructures = function () { const r = _ps.apply(this, arguments); const C = PLACED.church; if (C) for (let z = -13; z <= 13; z += 4) for (const x of [-4, 0, 4]) { const [wx, wz] = toWorld(C, x, z); PLACED.clear.push({ x: wx, z: wz, r: 3.4 }); } return r; }; }
