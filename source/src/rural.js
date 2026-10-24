// ===================== 日本の田舎: 漁協の建物、車（軽自動車・軽トラ・コンパクトカー）と交通（左側通行・車間距離・追突しない） =====================
// ---------- 漁協 出荷所: a real building you can see from outside (the counter is inside now) ----------
function makeShipHouse(g) {
  const A = archMats(), D2 = devArchMats(), R = mulberry(19), W = 5.6, Dp = 4.4, H = 3.1;
  B(g, 6.4, 0.3, 5.6, MAT.concrete, 0, 0.05, 0.3);
  // walls: corrugated metal siding over a concrete base, with corner trims
  const wall = worldMat(TEX.siding, 0.35, '#c9cdd0', 0.8);
  B(g, W, 0.5, Dp, MAT.concrete, 0, 0.45, 0); B(g, W, H - 0.5, Dp, wall, 0, 0.45 + (H - 0.5) / 2 + 0.25, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 0.14, H, 0.14, A.trim, sx * W / 2, 0.2 + H / 2, sz * Dp / 2);
  // gable roof (galvanised metal), ridge along the width
  const y1 = 1.0 * 0.4 / (Dp / 2 + 0.4); const rf = new THREE.Mesh(roofGeometry(W + 0.8, Dp + 0.8, 1.0, false), MAT.metalRoof[1]); rf.position.set(0, 0.2 + H - y1, 0); rf.castShadow = true; g.add(rf);
  gableFill(g, W, Dp, 1.0, y1, 0.2 + H, wall);
  // front: a roll-up shutter half open (dark inside), a glass entrance door with a small canopy
  const fz = Dp / 2 + 0.02;
  B(g, 2.2, 2.4, 0.04, AM.dark, -1.3, 1.5, fz - 0.01); const sh = B(g, 2.2, 1.1, 0.06, D2.rollup, -1.3, 2.15, fz + 0.02); B(g, 2.4, 0.22, 0.2, A.trim, -1.3, 2.78, fz + 0.06);
  B(g, 1.05, 2.15, 0.05, stdM('#2a3036', 0.4, 0.6), 1.3, 1.37, fz); B(g, 0.9, 1.95, 0.06, stdM('#9cc4dc', 0.1, 0.3, { transparent: true, opacity: 0.55 }), 1.3, 1.37, fz + 0.01); B(g, 0.03, 1.95, 0.07, AM.dark, 1.3, 1.37, fz + 0.02);
  const can = B(g, 1.6, 0.08, 0.8, MAT.metalRoof[1], 1.3, 2.65, fz + 0.4); can.rotation.x = -0.08; for (const sx of [-1, 1]) ROD(g, 0.025, D2.steel, [1.3 + sx * 0.7, 2.62, fz + 0.75], [1.3 + sx * 0.7, 2.95, fz]);
  // windows on the sides, a price board and a hose reel on the front wall
  for (const sx of [-1, 1]) for (const z of [-1.2, 0.6]) winPart(g, sx * (W / 2 + 0.01), 1.8, z, sx * Math.PI / 2, 1.0, 0.8, { style: 'slide', trim: A.trim, sash: A.sash, cur: 0 });
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), D2.chalk); bd.position.set(2.45, 1.55, fz + 0.03); bd.scale.set(0.7, 0.7, 1); g.add(bd);
  { const hr = sub(g, -2.55, 1.0, fz + 0.08); const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 16), DA.yellow); hr.add(t); }
  // outside: stacked fish crates, blue drums, a fork pallet and a life ring
  crateStack(g, -2.9, fz + 0.9, 3, R); crateStack(g, -2.25, fz + 0.9, 2, R); crateStack(g, -2.9, fz + 1.5, 1, R, 0.2);
  for (const [x, z] of [[3.1, -1.2], [3.1, -0.5]]) { CY(g, 0.3, 0.9, D2.crate[0], x, 0.5, z, 12); CY(g, 0.31, 0.04, AM.dark, x, 0.96, z, 12); }
  B(g, 1.1, 0.12, 1.1, MAT.darkwood, 2.1, 0.12, fz + 1.4);
  lifeRing(g, -0.25, 1.1, fz + 0.06, 0);
}
GAME.initPlaces = function () {
  const Hb = this.LM.harbor; let best = null;
  for (let r = 6; r < 70 && !best; r += 1.5) for (let a = 0; a < 6.28; a += 0.2) {
    const x = Hb.x + Math.cos(a) * r, z = Hb.z + Math.sin(a) * r; if (!landOK(x, z, 6)) continue;
    const nr = nearestOnRoads(x, z, 30, false); if (!nr) continue; const rot = Math.atan2(nr.x - x, nr.z - z), o = { x, z, rot };
    let mn = 1e9, mx = -1e9, ok = true; for (const [a2, b2] of [[-3, -2.4], [3, -2.4], [-3, 2.8], [3, 2.8], [0, 0]]) { const [px, pz] = toWorld(o, a2, b2); if (!landOK(px, pz, 4.6)) ok = false; const h = groundH(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h); if (collidersNear(px, pz).some(c => !c.off && hitsCollider(c, px, pz, 1.2))) ok = false; }
    if (ok && mx - mn < 1.1) { best = { x, z, rot, y: mx }; break; }
  }
  if (best) {
    const g = new THREE.Group(); makeShipHouse(g);
    const sign = dynSign(3.6, 0.62, '漁協 出荷所', '#ffffff', '#1f4f8a'); sign.userData.keep = false; sign.position.set(0, 2.95, 2.27); g.add(sign); DECO.shipSign = sign;
    g.position.set(best.x, best.y - 0.1, best.z); g.rotation.y = best.rot; scene.add(mergeLocal(g));
    addCollider({ x: best.x, z: best.z, hw: 2.95, hd: 2.35, rot: best.rot, kind: 'bld' });
    { const [x, z] = toWorld(best, -2.6, 3.0); addCollider({ x, z, hw: 0.7, hd: 0.5, rot: best.rot, kind: 'bld' }); }
    const [ex, ez] = toWorld(best, 1.3, 3.0); DECO.ship = { x: ex, z: ez, at: best }; this.LM.ship = { x: ex, z: ez, r: 0 };
  }
  const S = PLACED.shop; if (S) { const [ex, ez] = toWorld(S, 0, S.d / 2 + 1.7); DECO.shop = { x: ex, z: ez }; this.LM.shop = { x: ex, z: ez, r: 0 };
    const sg = dynSign(S.w - 1.3, 1.0, 'ほしなみ商店', '#fff9ec', '#2f5a3f'); sg.userData.keep = false; const [sx, sz] = toWorld(S, 0, S.d / 2 + 0.33); sg.position.set(sx, S.y + 0.45 + S.floors * 2.75 + 0.75, sz); sg.rotation.y = S.rot; scene.add(sg); DECO.shopSign = sg; }
};
// ---------- car models (instanced): extruded side profiles so they look like real Japanese cars ----------
const CARX = {};
function carProfile(pts, width, bev = 0.06) {
  const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))), d = Math.max(0.02, width - bev * 2);
  const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev < 0.03 ? 0.016 : 0.008, bevelSegments: 2, steps: 1, curveSegments: 4 }); g.translate(0, 0, -d / 2); g.rotateY(-Math.PI / 2); g.deleteAttribute('uv'); return g.toNonIndexed ? (g.index ? g.toNonIndexed() : g) : g;
}
function cbox(w, h, d, x, y, z, col) { const g = new THREE.BoxGeometry(w, h, d).translate(x, y, z).toNonIndexed(); g.deleteAttribute('uv'); if (col) { const c = new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); } return g; }
function cwheel(x, y, z, r, w) { const g = new THREE.CylinderGeometry(r, r, w, 14).rotateZ(Math.PI / 2).translate(x, y, z).toNonIndexed(); g.deleteAttribute('uv'); return g; }
const CAR_TYPES = {
  kei: { L: 3.39, W: 1.47, vmax: [8, 10.5], cols: ['#f4f4f0', '#f4f4f0', '#e8e4dc', '#c8ccd2', '#2a2a2e', '#e8d8b8', '#b8d0e0', '#e8c8c8', '#5a6a5a', '#8a2a2a'],
    body: [[-1.69, 0.22], [1.69, 0.22], [1.71, 0.55], [1.64, 0.86], [1.2, 1.0], [0.78, 1.74], [-1.55, 1.77], [-1.69, 1.66], [-1.71, 0.3]],
    glass: [[1.235, 0.99], [0.815, 1.7], [-1.575, 1.715], [-1.74, 1.03]], wb: [1.17, -1.17], wr: 0.29, wx: 0.64,
    dark: () => [cbox(1.5, 0.24, 0.14, 0, 0.36, 1.69), cbox(1.5, 0.24, 0.14, 0, 0.36, -1.69), cbox(0.08, 0.12, 0.2, 0.8, 1.05, 0.95), cbox(0.08, 0.12, 0.2, -0.8, 1.05, 0.95), cbox(0.05, 0.68, 0.08, 0.745, 1.36, -0.25), cbox(0.05, 0.68, 0.08, -0.745, 1.36, -0.25)],
    lights: () => [cbox(0.34, 0.15, 0.05, 0.5, 0.8, 1.68, '#fff8e0'), cbox(0.34, 0.15, 0.05, -0.5, 0.8, 1.68, '#fff8e0'), cbox(0.12, 0.38, 0.05, 0.62, 1.0, -1.7, '#d02020'), cbox(0.12, 0.38, 0.05, -0.62, 1.0, -1.7, '#d02020'), cbox(0.4, 0.1, 0.03, 0, 0.6, 1.76, '#f0f0f0')] },
  truck: { L: 3.39, W: 1.47, vmax: [7, 9.5], cols: ['#f4f4f0', '#f4f4f0', '#f4f4f0', '#e8e8e4', '#c8ccd2', '#2a5a8a'],
    body: [[0.3, 0.42], [1.69, 0.42], [1.71, 0.68], [1.62, 0.98], [1.4, 1.06], [1.22, 1.78], [0.42, 1.8], [0.3, 1.7]],
    glass: [[1.428, 1.05], [1.245, 1.735], [0.44, 1.755], [0.27, 1.1]], wb: [1.1, -1.05], wr: 0.28, wx: 0.64,
    extra: () => [cbox(1.47, 0.08, 1.95, 0, 0.74, -0.68), cbox(0.05, 0.3, 1.95, 0.71, 0.92, -0.68), cbox(0.05, 0.3, 1.95, -0.71, 0.92, -0.68), cbox(1.47, 0.3, 0.05, 0, 0.92, -1.66)],
    dark: () => [cbox(1.2, 0.26, 2.1, 0, 0.5, -0.62), cbox(1.5, 0.2, 0.14, 0, 0.52, 1.7), cbox(1.4, 0.5, 0.05, 0, 1.25, 0.26), cbox(0.08, 0.12, 0.2, 0.8, 1.12, 1.25), cbox(0.08, 0.12, 0.2, -0.8, 1.12, 1.25)],
    lights: () => [cbox(0.3, 0.16, 0.05, 0.5, 0.82, 1.7, '#fff8e0'), cbox(0.3, 0.16, 0.05, -0.5, 0.82, 1.7, '#fff8e0'), cbox(0.14, 0.12, 0.05, 0.62, 0.62, -1.7, '#d02020'), cbox(0.14, 0.12, 0.05, -0.62, 0.62, -1.7, '#d02020')] },
  compact: { L: 3.99, W: 1.69, vmax: [9, 11.5], cols: ['#f4f4f0', '#c8ccd2', '#2a2a2e', '#8a8e94', '#2a3a5a', '#7a1e24', '#e8e4dc'],
    body: [[-1.97, 0.25], [1.97, 0.25], [1.99, 0.58], [1.85, 0.78], [1.0, 0.95], [0.35, 1.47], [-1.1, 1.49], [-1.75, 1.12], [-1.98, 1.0], [-1.99, 0.32]],
    glass: [[1.035, 0.95], [0.375, 1.445], [-1.12, 1.46], [-1.785, 1.11], [-1.72, 0.97]], wb: [1.25, -1.25], wr: 0.31, wx: 0.72,
    dark: () => [cbox(1.72, 0.24, 0.14, 0, 0.38, 1.98), cbox(1.72, 0.24, 0.14, 0, 0.38, -1.98), cbox(0.08, 0.12, 0.2, 0.9, 1.0, 0.85), cbox(0.08, 0.12, 0.2, -0.9, 1.0, 0.85)],
    lights: () => [cbox(0.4, 0.13, 0.05, 0.56, 0.74, 1.94, '#fff8e0'), cbox(0.4, 0.13, 0.05, -0.56, 0.74, 1.94, '#fff8e0'), cbox(0.36, 0.14, 0.05, 0.6, 0.9, -1.98, '#d02020'), cbox(0.36, 0.14, 0.05, -0.6, 0.9, -1.98, '#d02020')] },
};
CARX.init = function () {
  if (CARX.ok) return CARX; CARX.ok = true; CARX.N = 28; CARX.types = {};
  const bodyM = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.3 }), darkM = new THREE.MeshStandardMaterial({ color: '#15191d', roughness: 0.25, metalness: 0.3 }), lightM = new THREE.MeshBasicMaterial({ vertexColors: true });
  for (const [k, T] of Object.entries(CAR_TYPES)) {
    const bodyG = mergeGeometries([carProfile(T.body, T.W)].concat(T.extra ? T.extra() : [])), dk = [carProfile(T.glass, T.W + 0.03, 0.02)].concat(T.dark());
    for (const z of T.wb) for (const sx of [-1, 1]) { dk.push(cwheel(sx * T.wx, T.wr, z, T.wr, 0.2)); }
    const darkG = mergeGeometries(dk), hubs = []; for (const z of T.wb) for (const sx of [-1, 1]) hubs.push(cwheel(sx * (T.wx + 0.105), T.wr, z, T.wr * 0.55, 0.02));
    hubs.forEach(h => { const n = h.attributes.position.count, a = new Float32Array(n * 3).fill(0.75); h.setAttribute('color', new THREE.BufferAttribute(a, 3)); });
    const lightG = mergeGeometries(T.lights().concat(hubs));
    const mk = (geo, mat, shadow) => { const m = new THREE.InstancedMesh(geo, mat, CARX.N); m.count = 0; m.frustumCulled = false; m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m; };
    CARX.types[k] = { T, body: mk(bodyG, bodyM, true), dark: mk(darkG, darkM, false), light: mk(lightG, lightM, false) };
    CARX.types[k].body.setColorAt(0, new THREE.Color('#ffffff'));
  }
  return CARX;
};
// ---------- traffic: few cars, left lane, keep distance, stop for you and anything in the way ----------
const TRF = { cars: [], conn: new Map(), t: 0 };
TRF.roads = () => ROADS.filter(r => !isFoot(r) && r.pts.length > 3 && r.w >= 3.4 && rLen(r) > 25);
TRF.want = () => { const len = TRF.roads().reduce((s, r) => s + rLen(r), 0); return Math.max(len > 0 ? 2 : 0, Math.min(20, Math.round(1 + len / 300 + (typeof CITY !== 'undefined' ? CITY.list.length * 0.2 : 0)))); };
// where each road end connects to another road (for turning at junctions instead of bouncing)
TRF.link = function () {
  const RS = TRF.roads(); TRF.conn = new Map();
  for (const r of RS) { const L = rLen(r), ends = [[], []];
    for (const [e, s] of [[0, 0], [1, L]]) { const p = rAt(r, s); for (const q of RS) { if (q === r) continue; const b = rBox(q); if (p.x < b[0] - 8 || p.x > b[2] + 8 || p.z < b[1] - 8 || p.z > b[3] + 8) continue; const pr = rProject(q, p.x, p.z); if (!pr || pr.d > q.w / 2 + r.w / 2 + 2.5) continue; const QL = rLen(q); const dirs = pr.s < 3 ? [1] : pr.s > QL - 3 ? [-1] : [1, -1]; for (const d of dirs) ends[e].push({ q, s: clamp(pr.s, 2, QL - 2), dir: d }); } }
    TRF.conn.set(r, ends); }
};
TRF.spawn = function (c, far) {
  const RS = TRF.roads(); if (!RS.length) return false; const tot = RS.reduce((s, r) => s + rLen(r), 0);
  for (let k = 0; k < 30; k++) { let u = Math.random() * tot, r = RS[0]; for (const q of RS) { u -= rLen(q); if (u <= 0) { r = q; break; } } const L = rLen(r), s = 3 + Math.random() * (L - 6), p = rAt(r, s);
    if (far && Math.hypot(p.x - PL.x, p.z - PL.z) < 90) continue; if (TRF.cars.some(o => o !== c && o.r === r && Math.abs(o.s - s) < 18)) continue;
    Object.assign(c, { r, s, L, dir: Math.random() < 0.5 ? 1 : -1, v: 0, block: 0 }); return true; }
  return false;
};
TRF.plan = function () {
  CARX.init(); TRF.link(); const want = TRF.want(), keys = Object.keys(CAR_TYPES);
  TRF.cars = TRF.cars.filter(c => ROADS.includes(c.r)).slice(0, want);
  while (TRF.cars.length < want) { const R = Math.random(), type = R < 0.5 ? 'kei' : R < 0.75 ? 'truck' : 'compact', T = CAR_TYPES[type], c = { type, col: new THREE.Color(T.cols[Math.floor(Math.random() * T.cols.length)]), vmax: T.vmax[0] + Math.random() * (T.vmax[1] - T.vmax[0]) }; if (!TRF.spawn(c, false)) break; TRF.cars.push(c); }
  for (const c of TRF.cars) c.L = rLen(c.r);
};
TRF.pose = function (c) { const a = rAt(c.r, c.s), t = rTan(c.r, c.s), fx = t[0] * c.dir, fz = t[1] * c.dir, off = Math.min(c.r.w * 0.26, 1.7); c.x = a.x + fz * off; c.z = a.z - fx * off; c.y = a.y; c.fx = fx; c.fz = fz; c.rot = Math.atan2(fx, fz); };
TRF.obstacles = function () {
  const O = []; for (const c of TRF.cars) if (c.x !== undefined) O.push({ x: c.x, z: c.z, car: c });
  if (!PL.veh && !GAME.inside) O.push({ x: PL.x, z: PL.z, pl: 1 }); for (const v of VEH) if (v.kind === 'truck') O.push({ x: v.x, z: v.z, veh: v });
  if (typeof DV !== 'undefined' && DV.bus && DV.bus.x !== undefined) O.push({ x: DV.bus.x, z: DV.bus.z, big: 1 }); if (typeof BUSX !== 'undefined' && BUSX.extra) for (const b of BUSX.extra) O.push({ x: b.x, z: b.z, big: 1 });
  for (const n of (typeof NPCS !== 'undefined' ? NPCS : [])) if (n.mesh && n.mesh.visible && !n.inRoom) O.push({ x: n.x, z: n.z, ped: 1 }); return O;
};
TRF.update = function (dt) {
  if (!CARX.ok || !GAME.p) return; TRF.t += dt; const O = TRF.obstacles();
  for (const c of TRF.cars) {
    if (!ROADS.includes(c.r)) { TRF.spawn(c, true); continue; } c.L = rLen(c.r); TRF.pose(c);
    // the nearest thing ahead in my lane
    let gap = 99; for (const o of O) { if (o.car === c) continue; const dx = o.x - c.x, dz = o.z - c.z, al = dx * c.fx + dz * c.fz; if (al < 0.5 || al > 22) continue; const lat = Math.abs(dx * c.fz - dz * c.fx); if (lat > (o.big ? 2.4 : o.ped || o.pl ? 1.9 : 1.6)) continue; if (o.car && o.car.fx * c.fx + o.car.fz * c.fz < -0.3) continue; gap = Math.min(gap, al - (o.big ? 5 : o.car ? 3.6 : 1.2)); }
    // slow for bends
    const a0 = rTan(c.r, c.s), a1 = rTan(c.r, clamp(c.s + 12 * c.dir, 0, c.L)), bend = Math.acos(clamp(a0[0] * a1[0] + a0[1] * a1[1], -1, 1));
    let tgt = c.vmax * (1 - Math.min(0.55, bend * 1.2)); if (gap < 99) tgt = Math.min(tgt, Math.max(0, (gap - 2.5) * 1.1));
    // near the end of the road: turn onto a connecting road, or slow to a stop and turn round
    const left = c.dir > 0 ? c.L - c.s : c.s; if (left < 10) tgt = Math.min(tgt, 3 + left * 0.4);
    c.v += clamp(tgt - c.v, -9 * dt, 2.2 * dt); if (c.v < 0) c.v = 0;
    c.s += c.v * dt * c.dir;
    if (c.dir > 0 ? c.s >= c.L - 2 : c.s <= 2) { const ends = (TRF.conn.get(c.r) || [[], []])[c.dir > 0 ? 1 : 0].filter(e => e.q !== c.r && ROADS.includes(e.q));
      if (ends.length) { const e = ends[Math.floor(Math.random() * ends.length)]; c.r = e.q; c.s = e.s; c.dir = e.dir; c.L = rLen(c.r); c.v *= 0.5; }
      else if (Math.hypot(c.x - PL.x, c.z - PL.z) > 80) TRF.spawn(c, true); else { c.dir = -c.dir; c.s = clamp(c.s, 2.2, c.L - 2.2); c.v = 0; } }
    // stuck behind something for a long time (a parked car): go another way
    if (c.v < 0.3 && gap < 6) { c.block += dt; if (c.block > 7) { c.block = 0; if (Math.hypot(c.x - PL.x, c.z - PL.z) > 70) TRF.spawn(c, true); else c.dir = -c.dir; } } else c.block = 0;
  }
  // draw
  const show = !GAME.inside, cnt = {}, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
  for (const k of Object.keys(CARX.types)) cnt[k] = 0;
  if (show) for (const c of TRF.cars.concat(TRF.parked || [])) { if (c.x === undefined) continue; const M = CARX.types[c.type], i = cnt[c.type]++; const ty = c.r ? standY(c.x, c.z) : c.y; q.setFromAxisAngle(Y, c.rot); m4.compose(v.set(c.x, Math.max(ty, c.y) + 0.02, c.z), q, sc); M.body.setMatrixAt(i, m4); M.dark.setMatrixAt(i, m4); M.light.setMatrixAt(i, m4); M.body.setColorAt(i, c.col); }
  for (const [k, M] of Object.entries(CARX.types)) { for (const m of [M.body, M.dark, M.light]) { m.count = cnt[k]; m.instanceMatrix.needsUpdate = true; } if (M.body.instanceColor) M.body.instanceColor.needsUpdate = true; }
};
// replace the old box-car traffic
CITY.trafficInit = function () { CARX.init(); return CITY.cars = { list: TRF.cars, N: CARX.N }; };
CITY.trafficPlan = function () { TRF.plan(); CITY.cars = { list: TRF.cars, N: CARX.N }; };
CITY.trafficUpdate = function (dt) { TRF.update(dt); };
// your own car can't drive through other cars
{ const _ok = vehOK; vehOK = function (v, x, z) { if (v && v.kind === 'truck' && v === PL.veh) for (const c of TRF.cars) if (c.x !== undefined && Math.hypot(c.x - x, c.z - z) < 2.3) return false; return _ok.apply(this, arguments); }; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { TRF.cars = []; TRF.plan(); } catch (e) { console.warn('traffic', e); } return r; }; }
