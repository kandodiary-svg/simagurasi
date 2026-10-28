// ===================== 路線バス: 本物らしい中型バス、バス停（標識・時刻表・待合小屋）、しまづくりで停留所と経路を自分で決める =====================
const BUSX = { mesh: null, stopsG: null, edit: { prev: null, hover: null }, extra: [] };
// ---------- the bus (forward +z, curb side / doors on +x, right-hand drive) ----------
BUSX.signTex = function (text) { const [c, x] = cvs(512, 96); x.fillStyle = '#0c0c0c'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#ffa020'; x.shadowColor = '#ff8a00'; x.shadowBlur = 8; x.font = '900 60px "M PLUS Rounded 1c", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 52, 490); const t = toTex(c, false); return t; };
BUSX.model = function () {
  const g = new THREE.Group(), white = stdM('#f4f4f0', 0.35, 0.1), green = stdM('#1f7a52', 0.45), orange = stdM('#e88a1a', 0.45), dark = stdM('#22262a', 0.5, 0.2), grey = stdM('#8a9096', 0.45, 0.4), black = stdM('#111417', 0.4);
  const glass = new THREE.MeshStandardMaterial({ color: '#0f1a22', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.72, depthWrite: false });
  // body shell from a side profile
  const prof = [[-4.5, 0.32], [4.46, 0.32], [4.55, 0.62], [4.56, 2.78], [4.44, 3.02], [-4.42, 3.04], [-4.53, 2.88], [-4.55, 0.4]];
  const sh = new THREE.Shape(prof.map(p => new THREE.Vector2(p[0], p[1]))), bg = new THREE.ExtrudeGeometry(sh, { depth: 2.16, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 2 }); bg.translate(0, 0, -1.08); bg.rotateY(-Math.PI / 2);
  const body = new THREE.Mesh(bg, white); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // windows: side bands, windscreen, rear window (see-through, with seats inside)
  for (const sx of [-1, 1]) { const z0 = -4.25, z1 = sx > 0 ? 2.95 : 4.15; B(g, 0.04, 1.2, z1 - z0, glass, sx * 1.165, 1.95, (z0 + z1) / 2); for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 6) B(g, 0.06, 1.22, 0.1, white, sx * 1.17, 1.95, z); }
  B(g, 2.1, 1.78, 0.04, glass, 0, 1.84, 4.575); B(g, 2.14, 0.08, 0.06, black, 0, 0.94, 4.58); B(g, 0.06, 1.78, 0.06, black, 0, 1.84, 4.59);
  B(g, 1.9, 0.95, 0.04, glass, 0, 2.15, -4.575);
  // front door and middle door on the curb side (+x): glass leaves in dark frames
  for (const [zc, w] of [[3.7, 0.95], [0.3, 1.05]]) { B(g, 0.05, 2.28, w + 0.08, dark, 1.16, 1.5, zc); for (const k of [-1, 1]) B(g, 0.06, 2.1, w / 2 - 0.06, glass, 1.175, 1.52, zc + k * w / 4); B(g, 0.07, 2.1, 0.04, dark, 1.18, 1.52, zc); }
  // livery: green band and a thin orange line, wrapping round the front
  for (const sx of [-1, 1]) { B(g, 0.03, 0.22, 8.9, green, sx * 1.172, 0.82, 0); B(g, 0.03, 0.07, 8.9, orange, sx * 1.172, 1.0, 0); }
  B(g, 2.2, 0.22, 0.03, green, 0, 0.82, 4.585); B(g, 2.2, 0.07, 0.03, orange, 0, 1.0, 4.585); B(g, 2.2, 0.22, 0.03, green, 0, 0.82, -4.585);
  // destination signs (LED): front, curb side, rear
  const tex = BUSX.signTex('島めぐり'), sm = new THREE.MeshBasicMaterial({ map: tex }); const fs = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.3), sm); fs.position.set(0, 2.86, 4.6); g.add(fs);
  const ss = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.2), sm); ss.position.set(1.19, 2.72, 2.4); ss.rotation.y = Math.PI / 2; g.add(ss); const rs = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.18), sm); rs.position.set(0, 2.82, -4.6); rs.rotation.y = Math.PI; g.add(rs);
  for (const m of [fs, ss, rs]) m.userData.keep = true; g.userData.signMat = sm;
  // lights, bumpers, grille, number plate
  for (const sx of [-1, 1]) { B(g, 0.32, 0.16, 0.05, stdM('#fffbe8', 0.2, 0, { emissive: new THREE.Color('#fff2c0'), emissiveIntensity: 0.8 }), sx * 0.82, 0.72, 4.58); B(g, 0.12, 0.1, 0.05, stdM('#ffaa30', 0.3, 0, { emissive: new THREE.Color('#ff8a00'), emissiveIntensity: 0.4 }), sx * 1.04, 0.72, 4.58); B(g, 0.14, 0.42, 0.05, stdM('#d02a2a', 0.3, 0, { emissive: new THREE.Color('#a01010'), emissiveIntensity: 0.6 }), sx * 1.0, 0.85, -4.58); }
  B(g, 2.34, 0.26, 0.16, dark, 0, 0.44, 4.6); B(g, 2.34, 0.26, 0.16, dark, 0, 0.44, -4.6); B(g, 0.5, 0.18, 0.02, stdM('#e8f0e0', 0.4), 0, 0.5, 4.69); B(g, 1.2, 0.5, 0.03, black, 0, 1.4, -4.585);
  // big "rabbit-ear" mirrors at the front
  for (const sx of [-1, 1]) { ROD(g, 0.025, black, [sx * 1.05, 2.7, 4.45], [sx * 1.22, 2.55, 4.95]); ROD(g, 0.025, black, [sx * 1.22, 2.55, 4.95], [sx * 1.22, 2.1, 4.98]); B(g, 0.06, 0.38, 0.24, black, sx * 1.22, 2.0, 4.98); }
  // wheels with silver hubs and dark arches
  for (const z of [2.95, -2.0]) for (const sx of [-1, 1]) { CY(g, 0.47, 0.28, black, sx * 1.04, 0.47, z, 18, 0, Math.PI / 2); CY(g, 0.26, 0.04, grey, sx * 1.19, 0.47, z, 14, 0, Math.PI / 2); const arch = new THREE.Mesh(new THREE.CircleGeometry(0.58, 18, 0, Math.PI), stdM('#0c0e10', 0.9)); arch.position.set(sx * 1.161, 0.47, z); arch.rotation.y = sx * Math.PI / 2; g.add(arch); }
  // the bevelled body sticks out ~6cm: bring front / rear fittings to its surface
  g.children.forEach(o => { if (o === body) return; if (o.position.z > 4.5) o.position.z += 0.075; else if (o.position.z < -4.5) o.position.z -= 0.075; });
  // roof: air-con unit and a little vent
  B(g, 1.5, 0.26, 2.4, stdM('#e2e4e2', 0.5), 0, 3.15, 0.6); B(g, 0.6, 0.12, 0.6, stdM('#d0d2d0', 0.5), 0, 3.09, -3.2);
  // inside: seats, hand-rails, driver seat and steering wheel
  const seat = stdM('#2f5a8a', 0.8), rail = stdM('#f2c230', 0.4, 0.3), floor = stdM('#5a5a5a', 0.9); B(g, 2.1, 0.06, 8.6, floor, 0, 0.62, 0);
  for (let z = -3.9; z < 2.6; z += 0.82) for (const sx of [-1, 1]) { if (sx > 0 && z > -0.4 && z < 1.0) continue; B(g, 0.85, 0.12, 0.45, seat, sx * 0.62, 1.05, z); B(g, 0.85, 0.6, 0.1, seat, sx * 0.62, 1.38, z - 0.22); }
  for (const z of [-2.5, -0.9, 1.4, 2.9]) for (const sx of [-1, 1]) CY(g, 0.025, 2.2, rail, sx * 0.25, 1.7, z, 6);
  B(g, 0.55, 0.12, 0.5, black, -0.62, 1.05, 3.7); B(g, 0.55, 0.6, 0.1, black, -0.62, 1.38, 3.45); const sw = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 16), black); sw.position.set(-0.62, 1.55, 4.1); sw.rotation.x = -1.0; g.add(sw);
  g.traverse(o => { if (o.isMesh && o.material !== glass) o.castShadow = true; });
  const m = mergeLocal(g); m.userData.signMat = sm; return m;
};
BUSX.setSign = function (text) { if (!BUSX.mesh || BUSX._sign === text) return; BUSX._sign = text; const sm = BUSX.mesh.userData.signMat; if (!sm) return; if (sm.map) sm.map.dispose(); sm.map = BUSX.signTex(text); sm.needsUpdate = true; };
// ---------- road graph for routing ----------
BUSX.graph = function () {
  const RS = ROADS.filter(r => !isFoot(r) && r.w >= 3.4 && r.pts.length > 1), N = [], cell = 6, hash = new Map(), key = (x, z) => Math.floor(x / cell) + ',' + Math.floor(z / cell);
  for (const r of RS) { const L = rLen(r), n = Math.max(1, Math.ceil(L / 4)); let prev = -1; for (let k = 0; k <= n; k++) { const p = rAt(r, L * k / n), i = N.length; N.push({ x: p.x, y: TRF.surf(r, L * k / n, p.x, p.z) - 0.04, z: p.z, w: r.w, r, e: [] }); if (prev >= 0) { const d = Math.hypot(N[prev].x - p.x, N[prev].z - p.z); N[prev].e.push([i, d]); N[i].e.push([prev, d]); } prev = i; const kk = key(p.x, p.z); if (!hash.has(kk)) hash.set(kk, []); hash.get(kk).push(i); } }
  // junctions: join nodes of different roads that touch
  for (let i = 0; i < N.length; i++) { const a = N[i], cx = Math.floor(a.x / cell), cz = Math.floor(a.z / cell); for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const j of hash.get((cx + dx) + ',' + (cz + dz)) || []) { if (j <= i) continue; const b = N[j]; if (b.r === a.r) continue; const d = Math.hypot(a.x - b.x, a.z - b.z); if (d < Math.min(a.w, b.w) / 2 + 2.6) { a.e.push([j, d]); b.e.push([i, d]); } } }
  BUSX.G = { N, hash, cell }; return BUSX.G;
};
BUSX.nearestNode = function (x, z, maxD = 14) { const G = BUSX.G || BUSX.graph(); let bi = -1, bd = maxD; const cx = Math.floor(x / G.cell), cz = Math.floor(z / G.cell), R = Math.ceil(maxD / G.cell); for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) for (const j of G.hash.get((cx + dx) + ',' + (cz + dz)) || []) { const n = G.N[j], d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; bi = j; } } return bi; };
BUSX.path = function (a, b) { // Dijkstra with a small binary heap
  const G = BUSX.G, n = G.N.length, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), H = []; const push = (d, i) => { H.push([d, i]); let k = H.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (H[p][0] <= H[k][0]) break; [H[p], H[k]] = [H[k], H[p]]; k = p; } }, pop = () => { const top = H[0], last = H.pop(); if (H.length) { H[0] = last; let k = 0; for (;;) { const l = k * 2 + 1, r = l + 1; let m = k; if (l < H.length && H[l][0] < H[m][0]) m = l; if (r < H.length && H[r][0] < H[m][0]) m = r; if (m === k) break; [H[m], H[k]] = [H[k], H[m]]; k = m; } } return top; };
  dist[a] = 0; push(0, a); while (H.length) { const [d, i] = pop(); if (d > dist[i]) continue; if (i === b) break; for (const [j, w] of G.N[i].e) { const nd = d + w; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; push(nd, j); } } }
  if (!isFinite(dist[b])) return null; const out = []; for (let i = b; i >= 0; i = prev[i]) { out.push(i); if (i === a) break; } return out.reverse();
};
// ---------- route: stops chosen by you, or the island's first route ----------
BUSX.placeName = function (x, z) {
  const L = GAME.LM, nm = { harbor: '港前', shop: '商店前', hall: '集会所前', home: '住宅地', beach: '夕日の浜', light: '灯台口', church: '神社前', peak: '展望台口', mikan: 'みかん畑前', ship: '漁協前', falls: '滝口', motors: 'モータース前' };
  let best = null, bd = 60; for (const [k, v] of Object.entries(L)) { if (!nm[k] || !v) continue; const d = Math.hypot(v.x - x, v.z - z); if (d < bd) { bd = d; best = nm[k]; } }
  const D = GAME.devState(); for (const d of DEV) { const s = D[d.id]; if (!s || s.state !== 'done' || !isFinite(s.x)) continue; const dd = Math.hypot(s.x - x, s.z - z); if (dd < Math.min(bd, 45)) { bd = dd; best = d.name.replace(/^(港の|島の|岬の)/, '').replace(/リゾート計画[①-⑤] /, '') + '前'; } }
  return best;
};
BUSX.defaultStops = function () { const r = ROADS[0]; if (!r) return []; const L = rLen(r), H = GAME.LM.harbor, out = []; const add = (s, name) => { const p = rAt(r, s); if (!out.some(o => Math.hypot(o.x - p.x, o.z - p.z) < 30)) out.push({ x: p.x, z: p.z, name }); };
  add(6, '西の浜口'); const pr = rProject(r, H.x, H.z); if (pr) add(pr.s, '港前'); const pv = rProject(r, VILLAGE.x, VILLAGE.z); if (pv) add(pv.s, '住宅地'); add(L - 8, '灯台口'); return out.sort((a, b) => rProject(r, a.x, a.z).s - rProject(r, b.x, b.z).s); };
BUSX.route = function () { const p = GAME.p, R = p && p.busRoute; return R && R.stops && R.stops.length >= 2 ? R : { stops: BUSX.defaultStops(), mode: 'back', def: true }; };
BUSX.build = function (R) { // → { pts:[[x,y,z,w]], cum, stops:[{i,name}], loop } or { err }
  BUSX.graph(); const S = R.stops, ids = S.map(s => BUSX.nearestNode(s.x, s.z)); if (ids.some(i => i < 0)) return { err: '道路から離れた停留所があります' };
  const seq = [], stopIdx = []; const legs = S.length - 1 + (R.mode === 'loop' ? 1 : 0);
  for (let k = 0; k < legs; k++) { const a = ids[k], b = ids[(k + 1) % S.length], P = BUSX.path(a, b); if (!P) return { err: `「${S[k].name}」から「${S[(k + 1) % S.length].name}」へ道がつながっていません` }; stopIdx[k] = seq.length ? seq.length - 1 : 0; for (let q = seq.length ? 1 : 0; q < P.length; q++) seq.push(P[q]); }
  if (R.mode !== 'loop') stopIdx[S.length - 1] = seq.length - 1;
  const G = BUSX.G, pts = seq.map(i => [G.N[i].x, G.N[i].y, G.N[i].z, G.N[i].w]), cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
  if (pts.length < 2 || cum[cum.length - 1] < 10) return { err: '停留所が近すぎます' };
  return { pts, cum, stops: S.map((s, k) => ({ i: stopIdx[k], name: s.name })), loop: R.mode === 'loop' };
};
// ---------- the bus stop: round sign on a pole, timetable, bench, and sometimes a small wooden shelter ----------
BUSX.stopModel = function (name, shelter) {
  const g = new THREE.Group(), A = archMats(), pole = stdM('#e8e8e4', 0.5, 0.3), blue = stdM('#1f5fb8', 0.5), wood = stdM('#8a6a48', 0.85), tin = MAT.metalRoof ? MAT.metalRoof[1] : stdM('#7a2a22', 0.6);
  CY(g, 0.28, 0.12, MAT.concrete, 0, 0.06, 0, 14); CY(g, 0.045, 2.5, pole, 0, 1.3, 0, 8);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24), blue); disc.rotation.x = Math.PI / 2; disc.position.set(0, 2.45, 0); g.add(disc);
  const [c, x] = cvs(256, 256); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(128, 128, 104, 0, 7); x.fill(); x.fillStyle = '#1f5fb8'; x.font = '900 120px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🚌', 128, 112); x.font = '700 30px sans-serif'; x.fillText('バス停', 128, 196);
  for (const z of [0.025, -0.025]) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.29, 24), new THREE.MeshBasicMaterial({ map: toTex(c, false) })); f.position.set(0, 2.45, z); if (z < 0) f.rotation.y = Math.PI; f.userData.keep = true; g.add(f); }
  const nm = dynSign(0.9, 0.24, name, '#ffffff', '#1a2a4a'); nm.position.set(0, 2.0, 0.03); nm.userData.keep = true; g.add(nm);
  B(g, 0.42, 0.55, 0.04, stdM('#f8f8f4', 0.6), 0, 1.45, 0.03); for (let k = 0; k < 5; k++) B(g, 0.32, 0.03, 0.01, stdM('#3a3a3a', 0.6), 0, 1.62 - k * 0.08, 0.052);
  if (shelter) { const s = sub(g, -1.2, 0, -1.3); B(s, 2.6, 0.08, 1.4, MAT.concrete, 0, 0.04, 0); B(s, 2.6, 2.1, 0.08, wood, 0, 1.1, -0.66); for (const sx of [-1, 1]) B(s, 0.08, 2.1, 1.3, wood, sx * 1.26, 1.1, 0); const rf = B(s, 2.9, 0.06, 1.8, tin, 0, 2.25, 0.05); rf.rotation.x = -0.12; B(s, 2.2, 0.06, 0.4, wood, 0, 0.45, -0.4); for (const sx of [-0.9, 0.9]) B(s, 0.06, 0.42, 0.06, wood, sx, 0.22, -0.4); const ad = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), stdM('#f2e8c8', 0.8)); ad.position.set(0.6, 1.5, -0.61); s.add(ad); }
  else { const b = sub(g, -1.0, 0, -0.5); B(b, 1.5, 0.06, 0.4, wood, 0, 0.45, 0); for (const sx of [-0.6, 0.6]) B(b, 0.06, 0.45, 0.35, stdM('#6a6a6a', 0.5, 0.5), sx, 0.22, 0); }
  return mergeLocal(g);
};
// ---------- driving ----------
GAME.startBus = function () {
  const D = this.devState(); if (BUSX.mesh) scene.remove(BUSX.mesh); if (MODELS.bus) scene.remove(MODELS.bus); if (BUSX.stopsG) { scene.remove(BUSX.stopsG); BUSX.stopsG = null; }
  if (!(D.bus && D.bus.state === 'done')) { DV.bus = null; return; }
  let R = BUSX.route(), P = BUSX.build(R); if (P.err && !R.def) { UI.toast('🚌 ' + P.err + '（最初の路線で走ります）'); R = { stops: BUSX.defaultStops(), mode: 'back', def: true }; P = BUSX.build(R); } if (P.err) { DV.bus = null; return; }
  if (!BUSX.mesh) BUSX.mesh = BUSX.model(); scene.add(BUSX.mesh);
  const freeAt = (x, z) => { if (groundH(x, z) < 0.3 || !isNaN(waterLevelAt(G, x, z))) return false; const [px, pz] = pushOut(x, z, 1.0); return Math.hypot(px - x, pz - z) < 0.01; };
  const stops = P.stops.map(st => { let i = Math.min(st.i, P.pts.length - 1); const off0 = P.pts[i][3] / 2 + 1.3; let best = null;
    for (const di of [0, 1, -1, 2, -2, 3, -3, 4, -4]) { const j = clamp(i + di, 0, P.pts.length - 1), a = P.pts[j], b = P.pts[Math.min(P.pts.length - 1, j + 1)], c = P.pts[Math.max(0, j - 1)]; let fx = b[0] - c[0], fz = b[2] - c[2]; const l = Math.hypot(fx, fz) || 1; fx /= l; fz /= l; const off = a[3] / 2 + 1.3, x = a[0] + fz * off, z = a[2] - fx * off; if (freeAt(x, z) || di === 0 && !best) { best = { i: j, name: st.name, x, z, fx, fz }; if (freeAt(x, z)) break; } }
    if (P.loop && st.i === 0) best.i = 0; VEG.removeAt(best.x, best.z, 1.6); VEG.refresh(best.x - 3, best.z - 3, best.x + 3, best.z + 3); return best; });
  DV.bus = { kind: 'bus', model: 'bus', mesh: BUSX.mesh, pts: P.pts, cum: P.cum, stops, loop: P.loop, s: P.cum[stops[0].i], dir: 1, v: 0, wait: 6, at: stops[0].i, stop: stops[0], x: P.pts[0][0], z: P.pts[0][2], rot: 0, y: P.pts[0][1] };
  BUSX.stopsG = new THREE.Group(); scene.add(BUSX.stopsG);
  stops.forEach((st, k) => { const m = BUSX.stopModel(st.name, k % 2 === 0); m.position.set(st.x, standY(st.x, st.z), st.z); m.rotation.y = Math.atan2(-st.fz, st.fx); BUSX.stopsG.add(m);
    // a round-trip route stops on both sides of the road
    if (!P.loop) { const a = P.pts[st.i], off = a[3] / 2 + 1.3; st.x2 = a[0] - st.fz * off; st.z2 = a[2] + st.fx * off; const m2 = BUSX.stopModel(st.name, false); m2.position.set(st.x2, standY(st.x2, st.z2), st.z2); m2.rotation.y = Math.atan2(st.fz, -st.fx); BUSX.stopsG.add(m2); } });
  this.placeBus(0); BUSX.updateSign();
};
BUSX.dest = function () { const B = DV.bus; if (!B) return ''; if (B.loop) { const k = B.stops.findIndex(s => s === B.stop); return '循環 ' + (B.stops[(k + 1) % B.stops.length] || B.stops[0]).name + ' 方面'; } return (B.dir > 0 ? B.stops[B.stops.length - 1] : B.stops[0]).name + ' 行'; };
BUSX.updateSign = function () { if (DV.bus) BUSX.setSign(BUSX.dest()); };
GAME.placeBus = function (dt) {
  const B = DV.bus; if (!B) return; const { pts, cum } = B, Lt = cum[cum.length - 1]; let i = 1; while (i < cum.length - 1 && cum[i] < B.s) i++;
  const t = clamp((B.s - cum[i - 1]) / Math.max(1e-3, cum[i] - cum[i - 1]), 0, 1), p0 = pts[i - 1], p1 = pts[i];
  const cx = p0[0] + (p1[0] - p0[0]) * t, cz = p0[2] + (p1[2] - p0[2]) * t, w = p0[3] + (p1[3] - p0[3]) * t;
  // heading from a point a little ahead (smooth turns at junctions)
  const ah = (s) => { let k = 1; while (k < cum.length - 1 && cum[k] < s) k++; const tt = clamp((s - cum[k - 1]) / Math.max(1e-3, cum[k] - cum[k - 1]), 0, 1); return [pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * tt, pts[k - 1][2] + (pts[k][2] - pts[k - 1][2]) * tt]; };
  const fa = ah(clamp(B.s + 3 * B.dir, 0, Lt)), ba = ah(clamp(B.s - 2 * B.dir, 0, Lt)); const tr = Math.atan2(fa[0] - ba[0], fa[1] - ba[1]); B.rot = dt ? angLerp(B.rot, tr, Math.min(1, dt * 5)) : tr;
  const lane = Math.min(w / 4, 1.6); B.x = cx + Math.cos(B.rot) * lane; B.z = cz - Math.sin(B.rot) * lane;
  // ver.49: every wheel (axles 2.95 m ahead / 2.0 m behind, ±1.04 m) on the road you see; the body tilts and leans (was: flat, at the higher of the walk height and the route)
  const P = RIDE.pose(B.ride || (B.ride = { y: p0[1] + (p1[1] - p0[1]) * t }), B.x, B.z, B.rot, 2.95, -2.0, 1.04, null, 0, 1, dt, B.v); B.y = P.y;
  B.mesh.position.set(P.x, P.y, P.z); B.mesh.rotation.set(0, 0, 0); B.mesh.rotateY(P.yaw); B.mesh.rotateX(-P.pitch); B.mesh.rotateZ(P.roll); B.mesh.updateMatrixWorld(true); B.shown = P;
};
GAME.updateBus = function (dt) {
  const B = DV.bus; if (!B) return; const Lt = B.cum[B.cum.length - 1];
  if (B.wait > 0) { B.wait -= dt; B.v = 0; if (B.wait <= 0) BUSX.updateSign(); }
  else {
    const fx = Math.sin(B.rot), fz = Math.cos(B.rot); let gap = 99; const obs = [PL.veh && PL.veh !== B ? PL.veh : PL].concat(VEH.filter(v => v.kind === 'truck'), typeof TRF !== 'undefined' ? TRF.cars : []);
    for (const o of obs) { if (!o || o === B || o.x === undefined) continue; const dx = o.x - B.x, dz = o.z - B.z, al = dx * fx + dz * fz; if (al < 2 || al > 20) continue; if (Math.abs(dx * fz - dz * fx) > 2.0) continue; if (o.fx !== undefined && o.fx * fx + o.fz * fz < -0.3) continue; gap = Math.min(gap, al - 5.5); }
    let tgt = 9; if (gap < 99) tgt = Math.min(tgt, Math.max(0, (gap - 1.5) * 1.1));
    for (const st of B.stops) { const cs = B.loop && st.i === 0 ? Lt : B.cum[st.i], d = (cs - B.s) * B.dir; if (B.at !== st.i && d > 0 && d < 25) tgt = Math.min(tgt, 1.5 + d * 0.35); }
    B.v += clamp(tgt - B.v, -7 * dt, 1.6 * dt); if (B.v < 0) B.v = 0; B.s += B.v * dt * B.dir;
    for (const st of B.stops) { const cs = B.cum[st.i]; if (B.at !== st.i && Math.abs(B.s - cs) < 0.7) { B.s = cs; B.wait = 9; B.at = st.i; B.stop = B.dir < 0 && st.x2 !== undefined ? { ...st, x: st.x2, z: st.z2 } : st; if (PL.veh === B) UI.toast(`🚌 「${st.name}」に着きました（Space でおりる）`); } }
    if (B.loop) { if (B.s >= Lt - 0.5) { B.s = 0; const st = B.stops[0]; if (B.at !== st.i) { B.wait = 9; B.at = st.i; B.stop = st; if (PL.veh === B) UI.toast(`🚌 「${st.name}」に着きました（Space でおりる）`); } } }
    else { if (B.dir > 0 && B.s >= Lt - 0.3) { B.s = Lt - 0.3; B.dir = -1; BUSX.updateSign(); } else if (B.dir < 0 && B.s <= 0.3) { B.s = 0.3; B.dir = 1; BUSX.updateSign(); } }
  }
  this.placeBus(dt);
  if (PL.veh === B) { PL.x = B.x; PL.z = B.z; PL.rot = B.rot; }
};
// riding texts use the real destination
{ const _p = GAME.prompt; GAME.prompt = function () { const v = PL.veh; if (this.p && v && v.kind === 'bus') return v.wait > 0 ? `Space：バスをおりる（${(v.stop || {}).name || ''}）` : `🚌 ${BUSX.dest()}　次のバス停でおりられます`; if (this.p && !PL.veh) { const rt = this.rideTarget && this.rideTarget(); if (rt && rt.kind === 'bus') return `Space：バスに乗る（${BUSX.dest()}）`; } return _p.apply(this, arguments); }; }
{ const _rk = GAME.rideKey; GAME.rideKey = function () { const t = !PL.veh && this.rideTarget(); const r = _rk.apply(this, arguments); if (t && t.kind === 'bus' && PL.veh === t) { UI.toast(`🚌 バスに乗った（${BUSX.dest()}）。着いたら Space でおりる`); } return r; }; }
// ---------- しまづくり: 🚏 バス路線 tool ----------
TOOLS.push({ id: 'busroute', name: 'バス路線', icon: '🚏', key: 'X', hint: '道路をクリックして停留所をふやす（順番どおりに走ります）。停留所をクリックすると消せます', brush: false });
TOOL_LV.busroute = 1;
BUSX.editRoute = function () { const p = GAME.p; if (!p.busRoute) { const d = BUSX.route(); p.busRoute = { stops: d.stops.map(s => ({ ...s })), mode: d.mode }; } return p.busRoute; };
BUSX.apply = function () { GAME.dirty = true; GAME.save(); BUSX.preview(); if (DV.bus || (GAME.devState().bus || {}).state === 'done') GAME.startBus(); UI.editPanel(); };
BUSX.click = function (p) {
  if (!(GAME.devState().bus && GAME.devState().bus.state === 'done')) { UI.toast('🔒 開発（P）で「島めぐりバス」を開業すると、路線を決められます'); return; }
  const R = BUSX.editRoute(), hit = R.stops.findIndex(s => Math.hypot(s.x - p.x, s.z - p.z) < 6);
  if (hit >= 0) { if (R.stops.length <= 2) { UI.toast('停留所は2つ以上必要です'); return; } const s = R.stops.splice(hit, 1)[0]; UI.toast(`🚏 「${s.name}」を消した`); BUSX.apply(); return; }
  BUSX.graph(); const ni = BUSX.nearestNode(p.x, p.z, 8); if (ni < 0) { UI.toast('停留所は道路の上をクリックして置きます'); return; }
  const n = BUSX.G.N[ni], used = new Set(R.stops.map(s => s.name)); let name = BUSX.placeName(n.x, n.z) || ''; if (!name || used.has(name)) { let k = 1; while (used.has(`第${k}停留所`)) k++; name = name && !used.has(name) ? name : (name ? name.replace(/前$/, '') + `${k}丁目` : `第${k}停留所`); }
  if (R.stops.some(s => Math.hypot(s.x - n.x, s.z - n.z) < 25)) { UI.toast('ほかの停留所に近すぎます（25m 以上はなす）'); return; }
  const test = { stops: R.stops.concat([{ x: n.x, z: n.z, name }]), mode: R.mode }, P = BUSX.build(test); if (P.err) { UI.toast('🚫 ' + P.err); return; }
  R.stops.push({ x: n.x, z: n.z, name }); UI.toast(`🚏 停留所「${name}」をつくった（${R.stops.length}番目）`); BUSX.apply();
};
BUSX.preview = function () {
  if (BUSX.pv) { scene.remove(BUSX.pv); BUSX.pv.traverse(o => { if (o.geometry) o.geometry.dispose(); }); BUSX.pv = null; }
  if (!EDIT.on || EDIT.tool !== 'busroute' || !GAME.p) return; const R = BUSX.route(), P = BUSX.build(R), g = BUSX.pv = new THREE.Group(); scene.add(g);
  if (!P.err) { const v = P.pts.map(q => new THREE.Vector3(q[0], q[1] + 0.35, q[2])); const geo = new THREE.BufferGeometry().setFromPoints(v); g.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#ff8a1a', depthTest: false, transparent: true }))); g.children[0].renderOrder = 50;
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v), Math.min(600, v.length * 2), 0.35, 5), new THREE.MeshBasicMaterial({ color: '#ff9a2a', transparent: true, opacity: 0.55, depthWrite: false })); g.add(tube); }
  R.stops.forEach((s, k) => { const y = standY(s.x, s.z), c = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3, 16), new THREE.MeshBasicMaterial({ color: '#1f5fb8', transparent: true, opacity: 0.6 })); c.position.set(s.x, y + 1.5, s.z); g.add(c); const lb = dynSign(3.2, 0.7, `${k + 1}. ${s.name}`, '#ffffff', '#1f5fb8'); lb.position.set(s.x, y + 4, s.z); lb.material.depthTest = false; lb.renderOrder = 60; lb.onBeforeRender = (r, sc, cam) => { lb.quaternion.copy(cam.quaternion); }; g.add(lb); });
};
{ const _u = updateEdit; updateEdit = function (dt) { _u(dt); if (EDIT.on && EDIT.tool === 'busroute') { if (!BUSX.pv) BUSX.preview(); } else if (BUSX.pv) BUSX.preview(); }; }
{ const _d = editPointerDown; editPointerDown = function (e) { if (EDIT.tool === 'busroute') { if (e.button !== 0) return _d(e); const p = pickSurface(e.clientX, e.clientY); if (p) BUSX.click(p); return; } return _d(e); }; }
{ const _h = UI.editHint; UI.editHint = function () { const h = document.getElementById('editHint'); if (h && EDIT.on && EDIT.tool === 'busroute') { h.textContent = TOOLS.find(t => t.id === 'busroute').hint; return; } return _h.apply(this, arguments); }; }
{ const _p = UI.editPanel; UI.editPanel = function () { _p.apply(this, arguments); if (!EDIT.on || EDIT.tool !== 'busroute' || !GAME.p) return; const sb = document.querySelector('#editp .sub'); if (!sb) return;
  const open = GAME.devState().bus && GAME.devState().bus.state === 'done';
  if (!open) { sb.insertAdjacentHTML('afterbegin', '<span class="small">🔒 開発（P）で「島めぐりバス」を開業すると、停留所と経路を自由に決められます</span>'); return; }
  const R = BUSX.route(), P = BUSX.build(R), len = P.err ? 0 : P.cum[P.cum.length - 1];
  sb.insertAdjacentHTML('afterbegin', `<div class="bussub"><div class="seg"><button data-bm="back" class="${R.mode !== 'loop' ? 'on' : ''}">↔ 往復</button><button data-bm="loop" class="${R.mode === 'loop' ? 'on' : ''}">🔁 循環</button><button data-bx="rev">⇅ 逆順</button><button data-bx="reset">↩ 最初の路線</button></div>
    <ol class="bstops">${R.stops.map((s, k) => `<li><input data-bn="${k}" value="${esc(s.name)}" maxlength="12"><button data-bdel="${k}" title="消す">×</button></li>`).join('')}</ol>
    <span class="small">${P.err ? '⚠ ' + esc(P.err) : `路線の長さ ${Math.round(len)}m・停留所 ${R.stops.length}か所（${R.mode === 'loop' ? '最後の停留所から最初にもどる循環' : '終点で折り返す往復'}）`}${R.def ? '　※いまは最初の路線（道路をクリックすると自分の路線になります）' : ''}</span></div>`);
  const q = s => sb.querySelectorAll(s);
  q('[data-bm]').forEach(b => b.onclick = e => { e.stopPropagation(); BUSX.editRoute().mode = b.dataset.bm; BUSX.apply(); });
  q('[data-bx]').forEach(b => b.onclick = e => { e.stopPropagation(); if (b.dataset.bx === 'rev') BUSX.editRoute().stops.reverse(); else GAME.p.busRoute = null; BUSX.apply(); });
  q('[data-bdel]').forEach(b => b.onclick = e => { e.stopPropagation(); const Rr = BUSX.editRoute(); if (Rr.stops.length <= 2) { UI.toast('停留所は2つ以上必要です'); return; } Rr.stops.splice(+b.dataset.bdel, 1); BUSX.apply(); });
  q('[data-bn]').forEach(inp => { inp.onkeydown = e => e.stopPropagation(); inp.onchange = e => { const Rr = BUSX.editRoute(), v = inp.value.trim().slice(0, 12); if (v) { Rr.stops[+inp.dataset.bn].name = v; BUSX.apply(); } }; inp.onclick = e => e.stopPropagation(); }); }; }
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' || !EDIT.on || e.repeat) return; if (e.code === 'KeyX') setTool('busroute'); });
{ const st = document.createElement('style'); st.textContent = `#game .bussub{display:flex;flex-direction:column;gap:6px;width:100%}#game .bstops{display:flex;flex-wrap:wrap;gap:4px 10px;margin:0;padding-left:20px;max-height:92px;overflow:auto}#game .bstops li{font-size:12px}#game .bstops input{width:96px;font:inherit;font-size:12px;padding:3px 6px;border-radius:8px;border:1px solid #c8d4cc}#game .bstops button{padding:2px 7px;margin-left:2px;border-radius:8px;background:#f2e2e0}`; document.head.appendChild(st); }
// roads changed → rebuild the graph next time; refresh the bus
{ const _f = finishRoad; finishRoad = function () { const r = _f.apply(this, arguments); BUSX.G = null; if (DV.bus) setTimeout(() => GAME.startBus(), 50); if (typeof TRF !== 'undefined') TRF.link(); return r; }; }
{ const _r = removeUserRoad; removeUserRoad = function () { const r = _r.apply(this, arguments); BUSX.G = null; if (DV.bus) setTimeout(() => GAME.startBus(), 50); if (typeof TRF !== 'undefined') TRF.link(); return r; }; }

{ const _rd = GAME.refreshDev; GAME.refreshDev = function () { const r = _rd.apply(this, arguments); const D = this.p ? this.devState() : {}; if (!(D.bus && D.bus.state === 'done')) { if (BUSX.mesh) scene.remove(BUSX.mesh); if (BUSX.stopsG) { scene.remove(BUSX.stopsG); BUSX.stopsG = null; } } return r; }; }
