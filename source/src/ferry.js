// ===================== 観光船「ほしなみ丸」: 瀬戸内のフェリーのような、大きな船 =====================
// 全長32m・幅8.6m。白い船体に青いライン、喫水線の紺と船底の赤、2層の客室（窓が並ぶ）、操舵室、青いファンネル（星のマーク）、
// マストとレーダー、手すりつきの展望デッキ、救命いかだ・浮き輪。夜は窓と航海灯（赤・緑）が光る。
// 桟橋の先に横づけし、乗ると展望デッキに立つ。潮の満ち引きで船も上下する。
const FERRY = { L: 32, B: 8.6, D: 2.0, made: null };
FERRY.hullGeo = function () {
  const L = FERRY.L, B = FERRY.B, D = FERRY.D, N = 44, pos = [], col = [];
  const hb = t => B / 2 * (t < 0.08 ? 0.9 + t / 0.08 * 0.1 : t < 0.6 ? 1 : Math.pow(Math.max(0, 1 - ((t - 0.6) / 0.4) ** 2), 0.62));
  const deckY = t => D + 0.7 * Math.max(0, (t - 0.68) / 0.32) ** 2, botY = t => -1.25 + 1.15 * Math.max(0, (t - 0.78) / 0.22) ** 1.6;
  const zAt = (t, y) => -L / 2 + t * L + (t > 0.85 ? (y - botY(t)) * 0.55 * (t - 0.85) / 0.15 : 0); // a raked stem
  // side heights from the deck edge down to the keel, with the paint bands between them
  const lv = (t) => { const d = deckY(t), b = botY(t); return [[d, 1], [1.45, 1], [1.12, 2], [0.32, 1], [0.0, 3], [Math.max(b + 0.3, -0.9), 4], [b, 4]]; };
  const C = { 1: [0.95, 0.96, 0.97], 2: [0.12, 0.38, 0.72], 3: [0.1, 0.16, 0.3], 4: [0.55, 0.16, 0.12] };
  const P = (t, k, side) => { const L2 = lv(t), y = Math.max(L2[k][0], L2[6][0]), w = hb(t) * (k <= 3 ? 1 : k === 4 ? 0.985 : k === 5 ? 0.86 : 0) * side; return [w, y, zAt(t, y)]; };
  const tri = (a, b, c, cc) => { pos.push(...a, ...b, ...c); for (let i = 0; i < 3; i++) col.push(...cc); };
  for (let i = 0; i < N; i++) { const t0 = i / N, t1 = (i + 1) / N;
    for (const side of [1, -1]) for (let k = 0; k < 6; k++) { const band = lv(t0)[k + 1][1] === lv(t0)[k][1] ? lv(t0)[k][1] : lv(t0)[k + 1][1] === 2 || lv(t0)[k][1] === 2 ? (k === 1 ? 2 : 1) : lv(t0)[k + 1][1], cc = C[k === 1 ? 2 : k === 3 ? 3 : k >= 4 ? 4 : 1];
      const a = P(t0, k, side), b = P(t1, k, side), c = P(t1, k + 1, side), d = P(t0, k + 1, side); void band;
      if (side > 0) { tri(a, b, c, cc); tri(a, c, d, cc); } else { tri(a, c, b, cc); tri(a, d, c, cc); } }
    // the deck
    const l0 = P(t0, 0, -1), r0 = P(t0, 0, 1), l1 = P(t1, 0, -1), r1 = P(t1, 0, 1), dk = [0.34, 0.5, 0.4]; tri(l0, r1, r0, dk); tri(l0, l1, r1, dk);
  }
  // the transom
  for (let k = 0; k < 6; k++) { const a = P(0, k, -1), b = P(0, k, 1), c = P(0, k + 1, 1), d = P(0, k + 1, -1), cc = C[k === 1 ? 2 : k === 3 ? 3 : k >= 4 ? 4 : 1]; tri(a, c, b, cc); tri(a, d, c, cc); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
};
FERRY.winTex = function (night) {
  return txCanvas(512, 64, (x, w, h) => { x.fillStyle = '#f2f3f4'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 8; k++) { const x0 = 8 + k * 63; const gr = x.createLinearGradient(0, 8, 0, 56); if (night) { gr.addColorStop(0, '#ffe7a8'); gr.addColorStop(1, '#f2b860'); } else { gr.addColorStop(0, '#9cc4dc'); gr.addColorStop(0.5, '#3d6f8f'); gr.addColorStop(1, '#22465e'); }
      x.fillStyle = '#2b3a46'; x.fillRect(x0 - 2, 6, 52, 52); x.fillStyle = gr; x.fillRect(x0, 8, 48, 48); if (!night) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.moveTo(x0 + 6, 8); x.lineTo(x0 + 16, 8); x.lineTo(x0 + 4, 56); x.lineTo(x0, 56); x.fill(); } } }, true);
};
FERRY.make = function () {
  if (FERRY.made) return FERRY.made;
  const L = FERRY.L, B = FERRY.B, D = FERRY.D, g = new THREE.Group(), std = (c, r = 0.5, m = 0, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, o));
  const W = std('#f4f5f6', 0.45), BLUE = std('#1f62b8', 0.4), NAVY = std('#1d2a44', 0.5), DECK = std('#4f8a64', 0.8), RAIL = std('#e8ecef', 0.35, 0.3), BLACK = std('#23262a', 0.6), ORANGE = std('#f06a1e', 0.5), GREY = std('#8a9096', 0.5, 0.4);
  const hull = new THREE.Mesh(FERRY.hullGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide })); g.add(hull);
  const bx = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
  const cy = (r, h, m, x, y, z, rz = 0, rx = 0, seg = 10) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); g.add(o); return o; };
  const winD = new THREE.MeshStandardMaterial({ map: FERRY.winTex(false), emissiveMap: FERRY.winTex(true), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.25, metalness: 0.2 }); FERRY.winMat = winD;
  const winPlane = (len, h, x, y, z, ry, rep) => { const m = winD.clone(); m.map = winD.map.clone(); m.map.repeat.set(rep, 1); m.map.needsUpdate = true; m.emissiveMap = winD.emissiveMap.clone(); m.emissiveMap.repeat.set(rep, 1); m.emissiveMap.needsUpdate = true; (FERRY.wins = FERRY.wins || []).push(m); const o = new THREE.Mesh(new THREE.PlaneGeometry(len, h), m); o.position.set(x, y, z); o.rotation.y = ry; g.add(o); return o; };
  // main cabin (deck 1) and its windows
  const c1 = { z0: -10.5, z1: 6.5, w: B - 1.5, h: 2.5 }, c1z = (c1.z0 + c1.z1) / 2, c1l = c1.z1 - c1.z0;
  bx(c1.w, c1.h, c1l, W, 0, D + c1.h / 2, c1z); bx(c1.w + 0.08, 0.22, c1l + 0.08, BLUE, 0, D + c1.h - 0.25, c1z);
  for (const s of [1, -1]) winPlane(c1l - 1.4, 1.05, s * (c1.w / 2 + 0.01), D + 1.45, c1z, s * Math.PI / 2, 9);
  winPlane(c1.w - 1.6, 1.05, 0, D + 1.45, c1.z1 + 0.01, 0, 4); winPlane(c1.w - 1.6, 1.05, 0, D + 1.45, c1.z0 - 0.01, Math.PI, 4);
  // upper deck (deck 2): the bridge in front, an open observation deck behind with benches
  const U = D + c1.h; bx(c1.w + 0.5, 0.14, c1l + 0.6, DECK, 0, U + 0.07, c1z);
  const br = { z0: 1.5, z1: 6.3, w: B - 3.0, h: 2.1 }; bx(br.w, br.h, br.z1 - br.z0, W, 0, U + br.h / 2 + 0.14, (br.z0 + br.z1) / 2);
  winPlane(br.w - 0.4, 0.8, 0, U + 1.55, br.z1 + 0.01, 0, 4); for (const s of [1, -1]) winPlane(br.z1 - br.z0 - 0.8, 0.8, s * (br.w / 2 + 0.01), U + 1.55, (br.z0 + br.z1) / 2, s * Math.PI / 2, 3);
  bx(br.w + 2.4, 0.16, 1.4, W, 0, U + br.h + 0.2, br.z1 - 0.7); // bridge roof with wings
  bx(br.w + 0.3, 0.2, br.z1 - br.z0 + 0.4, BLUE, 0, U + br.h + 0.36, (br.z0 + br.z1) / 2);
  // mast, radar, lights
  cy(0.09, 3.2, RAIL, 0, U + br.h + 1.9, br.z0 + 1.6); const rb = bx(2.2, 0.12, 0.25, GREY, 0, U + br.h + 2.9, br.z0 + 1.6); FERRY.radar = rb;
  const lamp = (c, x, y, z) => { const m = new THREE.MeshStandardMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: 0.2 }); (FERRY.lamps = FERRY.lamps || []).push(m); const o = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), m); o.position.set(x, y, z); g.add(o); };
  lamp('#ffffff', 0, U + br.h + 3.5, br.z0 + 1.6); lamp('#ff3a2a', -(br.w / 2 + 1.2), U + br.h + 0.45, br.z1 - 0.7); lamp('#2aff6a', br.w / 2 + 1.2, U + br.h + 0.45, br.z1 - 0.7);
  // funnel with the island's star
  { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 2.8, 16), BLUE); f.scale.z = 1.6; f.position.set(0, U + 1.55, -3.2); g.add(f); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.97, 0.99, 0.35, 16), W); band.scale.z = 1.6; band.position.set(0, U + 2.25, -3.2); g.add(band);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.95, 0.3, 16), BLACK); top.scale.z = 1.6; top.position.set(0, U + 3.0, -3.2); g.add(top);
    const st = txCanvas(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 22 : 54, a = -Math.PI / 2 + k * Math.PI / 5; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.closePath(); x.fill(); });
    for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshStandardMaterial({ map: st, transparent: true, roughness: 0.5 })); m.position.set(s * 1.07, U + 1.45, -3.2); m.rotation.y = s * Math.PI / 2; g.add(m); } }
  // railings around both decks, benches, life rafts and rings
  const railRun = (pts, y, h = 1.0) => { for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx2, bz] = pts[i + 1], len = Math.hypot(bx2 - ax, bz - az), n = Math.max(1, Math.round(len / 1.6));
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 6), RAIL); top.rotation.set(Math.PI / 2, 0, 0); top.lookAt(new THREE.Vector3(bx2 - ax, 0, bz - az)); top.rotateX(Math.PI / 2); top.position.set((ax + bx2) / 2, y + h, (az + bz) / 2); g.add(top);
      const mid = top.clone(); mid.position.y = y + h * 0.5; g.add(mid);
      for (let k = 0; k <= n; k++) { const t = k / n; cy(0.03, h, RAIL, ax + (bx2 - ax) * t, y + h / 2, az + (bz - az) * t, 0, 0, 5); } } };
  const ow = (c1.w + 0.5) / 2 - 0.1; railRun([[ow, br.z0 - 0.2], [ow, c1.z0 - 0.2], [-ow, c1.z0 - 0.2], [-ow, br.z0 - 0.2]], U + 0.14);
  const hw = (t) => B / 2 * (t < 0.6 ? 1 : Math.pow(Math.max(0, 1 - ((t - 0.6) / 0.4) ** 2), 0.62)) - 0.25;
  { const pts = []; for (let k = 0; k <= 12; k++) { const t = 0.02 + k / 12 * 0.94, z = -L / 2 + t * L; if (z > c1.z0 - 0.5 && z < c1.z1 + 0.5) continue; pts.push([hw(t), z]); } const aft = pts.filter(p => p[1] < 0), fore = pts.filter(p => p[1] > 0);
    railRun([[aft[aft.length - 1][0], c1.z0 - 0.3], ...[...aft].reverse(), [-hw(0.02), -L / 2 + 0.02 * L], ...aft.map(p => [-p[0], p[1]]), [-aft[aft.length - 1][0], c1.z0 - 0.3]], D + 0.02, 0.95);
    railRun([[fore[0][0], c1.z1 + 0.3], ...fore, ...[...fore].reverse().map(p => [-p[0], p[1]]), [-fore[0][0], c1.z1 + 0.3]], D + 0.02 + 0.15, 0.95); }
  for (let k = 0; k < 4; k++) { const z = c1.z0 + 1.4 + k * 2.2; for (const s of [1, -1]) { bx(0.45, 0.42, 1.6, std('#7a5a3c', 0.8), s * (ow - 1.4), U + 0.35, z); } }
  for (const s of [1, -1]) for (let k = 0; k < 2; k++) { cy(0.42, 1.3, W, s * (ow - 0.55), U + 0.62, -6.0 - k * 1.5, Math.PI / 2, 0, 12); }
  for (const [x, y, z] of [[ow + 0.02, U + 0.75, -1.0], [-ow - 0.02, U + 0.75, -1.0], [hw(0.15) + 0.02, D + 0.65, -L / 2 + 3.5], [-hw(0.15) - 0.02, D + 0.65, -L / 2 + 3.5]]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 14), ORANGE); r.position.set(x, y, z); r.rotation.y = Math.PI / 2; g.add(r); }
  // foredeck fittings and the name
  for (const z of [L / 2 - 4.5, -L / 2 + 1.6]) for (const s of [1, -1]) cy(0.16, 0.45, BLACK, s * 1.6, D + 0.25 + (z > 0 ? 0.25 : 0), z);
  bx(1.4, 0.6, 1.0, NAVY, 0, D + 0.55, L / 2 - 6.5);
  const name = txCanvas(512, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1d2a44'; x.font = '700 64px "Mochiy Pop One","M PLUS Rounded 1c",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ほしなみ丸', w / 2, h / 2 + 2); });
  for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.56), new THREE.MeshStandardMaterial({ map: name, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.set(s * (B / 2 + 0.03), 1.72, -L / 2 + 0.58 * L); m.rotation.y = s * Math.PI / 2; g.add(m); }
  // the stern car ramp (folded up): what makes her read as a ferry
  { const r = new THREE.Group(); r.position.set(0, 0, -L / 2 - 0.06); g.add(r); const rp = std('#8d9399', 0.55, 0.35), yb = std('#e8b320', 0.5);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.75, 0.12), rp); pl.position.set(0, 1.2, 0); r.add(pl);
    for (let k = 0; k < 6; k++) { const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.06), GREY); rib.position.set(-1.9 + k * 0.76, 1.2, -0.08); r.add(rib); }
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.8, 10), BLACK); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, 0.32, -0.04); r.add(hinge);
    for (const x of [-2.36, 2.36]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.75, 0.14), yb); e.position.set(x, 1.2, -0.02); r.add(e); }
    for (const x of [-2.9, 2.9]) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), GREY); ch.position.set(x * 0.9, 2.6, 0.3); ch.rotation.x = 0.5; r.add(ch); const pv = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.8, 0.25), W); pv.position.set(x, 2.9, 0.55); r.add(pv); } }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // ~300 small parts → one mesh per material (the hull keeps its vertex colours, the radar keeps turning)
  hull.userData.keep = true; rb.userData.keep = true; let out = g;
  try { if (typeof mergeLocal === 'function') { FERRY.parts = 0; g.traverse(o => { if (o.isMesh) FERRY.parts++; }); out = mergeLocal(g); } } catch (e) { console.warn('ferry merge', e); out = g; }
  out.userData.ferry = true; FERRY.made = out; return out;
};
FERRY.night = function (k) { for (const m of FERRY.wins || []) m.emissiveIntensity = k * 0.9; for (const m of FERRY.lamps || []) m.emissiveIntensity = 0.2 + k * 2.2; };
// ---------- dock alongside the end of the pier, a little out to sea so the hull never sits over the beach ----------
// she comes in bow-first, lies alongside the pier, then backs out ~40 m before turning for the trip around the island
FERRY.off = 1.8 + 4.3 + 0.6;
// how far out along the pier the ship lies: as close to the pier tip as the water is deep enough for her keel (even at low tide)
FERRY.alongFor = function (s) { const sw = [Math.sin(s.rot), Math.cos(s.rot)], side = [sw[1], -sw[0]]; let best = null;
  for (let a = s.len + 2; a <= s.len + 16; a += 1) { let mn = 1e9;
    for (let z = -14; z <= 14; z += 2) for (const x of [-3.6, 0, 3.6]) { const along = a - z, lat = FERRY.off + x * (z < -9 ? 0.55 : 1), px = s.x + sw[0] * along + side[0] * lat, pz = s.z + sw[1] * along + side[1] * lat; mn = Math.min(mn, -groundH(px, pz)); }
    if (mn >= 1.8) return a; if (!best || mn > best.mn + 0.05) best = { a, mn }; }
  return best.a; };
// the ship's gangway on the pier (local lz along the pier), kept clear of the lamp posts
FERRY.gwLz = function (s) { let lz = Math.min(s.len - 0.9, Math.max(2, FERRY.alongFor(s) - 4)); for (let k = 0; k < 8; k++) { const post = Math.round((lz - 2) / 6) * 6 + 2; if (Math.abs(lz - post) > 0.9) break; lz -= 0.6; } return lz; };
FERRY.dock = function (P) { const sw = [Math.sin(P.rot), Math.cos(P.rot)], side = [sw[1], -sw[0]], along = FERRY.alongFor(P);
  P.dx = P.x + sw[0] * along + side[0] * FERRY.off; P.dz = P.z + sw[1] * along + side[1] * FERRY.off; P.ox = P.dx + sw[0] * 46; P.oz = P.dz + sw[1] * 46; P.frot = P.rot + Math.PI;
  const lz = FERRY.gwLz(P); FERRY.gw = { x: P.x + sw[0] * lz + side[0] * 1.0, z: P.z + sw[1] * lz + side[1] * 1.0 }; };
CARSPEC.ferry.cam = 30; CARSPEC.ferry.eye = [2.6, 6.3, -7];
{ const _sf = GAME.startFerry; GAME.startFerry = function () { const P = this.devState().pier; if (P) { try { if (MODELS.ferry && MODELS.ferry !== FERRY.made) scene.remove(MODELS.ferry); MODELS.ferry = FERRY.make(); FERRY.dock(P); } catch (e) { console.warn('ferry', e); } } return _sf.apply(this, arguments); }; }
{ const _pf = GAME.placeFerry; GAME.placeFerry = function (dt) { const Fy = DV.ferry; if (!Fy || Fy.mesh !== FERRY.made) return _pf.apply(this, arguments);
  const { route, cum } = Fy; let i = 1; while (i < cum.length - 1 && cum[i] < Fy.s) i++;
  const t = (Fy.s - cum[i - 1]) / Math.max(1e-3, cum[i] - cum[i - 1]), p0 = route[i - 1], p1 = route[i];
  Fy.x = p0[0] + (p1[0] - p0[0]) * t; Fy.z = p0[1] + (p1[1] - p0[1]) * t; const P = this.devState().pier;
  const backing = !Fy.docked && Fy.s < cum[1] - 2, tr = Fy.docked || backing ? P.frot : Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
  Fy.rot = dt ? angLerp(Fy.rot, tr, Math.min(1, dt * (backing || Fy.docked ? 2 : 0.45))) : tr;
  const tide = typeof SEA !== 'undefined' && SEA.h !== undefined ? SEA.h : 0, tt = performance.now() / 1000;
  Fy.mesh.position.set(Fy.x, tide + Math.sin(tt * 0.7) * 0.06 - 0.02, Fy.z); Fy.mesh.rotation.set(Math.sin(tt * 0.5) * 0.006, Fy.rot, Math.sin(tt * 0.6) * 0.01);
  if (FERRY.radar) FERRY.radar.rotation.y = tt * 1.6; FERRY.night(GAME.night || 0); }; }
// slow when backing out and when coming alongside; ride on the open upper deck, on the side facing the island
{ const _uf = GAME.updateFerry; GAME.updateFerry = function (dt) { const Fy = DV.ferry;
  if (Fy && Fy.mesh === FERRY.made && !(Fy.wait > 0)) { const end = Fy.cum[Fy.cum.length - 1], left = end - Fy.s, cap = Fy.s < Fy.cum[1] ? 3.2 : Math.max(1.4, left * 0.16); if (Fy.v > cap) Fy.v = cap; }
  const r = _uf.apply(this, arguments);
  if (Fy && PL.veh === Fy && Fy.mesh === FERRY.made) { const s = Math.sin(Fy.rot), c = Math.cos(Fy.rot), toC = (-Fy.x) * c - (-Fy.z) * s, sd = toC >= 0 ? 1 : -1, lx = sd * 2.6, lz = -7, U = FERRY.D + 2.5 + 0.14;
    PL.mesh.position.set(Fy.x + c * lx + s * lz, Fy.mesh.position.y + U, Fy.z - s * lx + c * lz); PL.mesh.rotation.y = Fy.rot + sd * Math.PI / 2; CARSPEC.ferry.eye[0] = lx; }
  return r; }; }
// a bigger wake behind the stern (or under the bow while she backs out)
{ const _w = FX.wake; FX.wake = function (v) { if (v && v.kind === 'ferry' && v.mesh === FERRY.made) { const s = Math.sin(v.rot), c = Math.cos(v.rot), b = v.s < v.cum[1] ? -1 : 1; for (const o of [0, 3]) _w.call(this, { x: v.x - s * (12.5 + o) * b, z: v.z - c * (12.5 + o) * b, rot: v.rot }); return; } return _w.apply(this, arguments); }; }
// the camera looks at the upper deck, not the waterline
{ const _uc = updateCamera; updateCamera = function (dt) { const F = PL.veh && PL.veh.mesh === FERRY.made && CAM.mode !== 'first' ? PL.veh : null; if (!F) return _uc.apply(this, arguments); const m = F.mesh, y0 = m.position.y; m.position.y = y0 + 3.4; try { return _uc.apply(this, arguments); } finally { m.position.y = y0; } }; }

// ---------- the pier: a landing stage beside the walkway (ticket booth moved there), a gangway to the ship ----------
{ const _pier = DEV_BUILD.pier; DEV_BUILD.pier = function (s) {
  const g = _pier(s); if (!g) return g; const L = s.len + 2, y = 1.15, M = dmat(), A = typeof archMats === 'function' ? archMats() : null, D2 = typeof devArchMats === 'function' ? devArchMats() : null;
  // the booth stood in the middle of the walkway at the end of the pier: you bumped into it on the way to the boat
  const [bx0, bz0] = toWorld(s, 0.6, L - 4);
  for (const c of collidersNear(bx0, bz0)) if (!c.off && c.kind === 'bld' && Math.abs(c.hw - 0.8) < 0.01 && Math.abs(c.hd - 0.7) < 0.01 && Math.hypot(c.x - bx0, c.z - bz0) < 0.05) c.off = true;
  const W2 = 3.6, cx = -1.8 - W2 / 2, len2 = 11, cz = L - 2 - len2 / 2; let room = true;
  for (const [a, b] of [[-1.8 - W2, L - 2], [-1.8 - W2, L - 2 - len2], [-1.8 - W2 / 2, cz]]) { const [x, z] = toWorld(s, a, b); if (groundH(x, z) > 0.9 || onPierAt(x, z) || collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, 0.5))) room = false; }
  let boothX = -3.4;
  if (room) {
    g.add(box(W2, 0.35, len2, M.conc, cx, y - 0.18, cz));
    for (let k = 0; k * 3.6 <= len2; k++) for (const x of [cx - W2 / 2 + 0.3, cx + W2 / 2 - 0.3]) g.add(cylM(0.17, 0.17, 6, M.conc, x, y - 3.2, L - 2 - k * 3.6, 10));
    for (let k = 0; k * 1.8 <= len2; k++) g.add(box(0.08, 0.9, 0.08, MAT.darkwood, cx - W2 / 2 + 0.1, y + 0.45, L - 2 - k * 1.8));
    { const r = box(0.06, 0.06, len2, MAT.darkwood, cx - W2 / 2 + 0.1, y + 0.88, cz); g.add(r); const r2 = r.clone(); r2.position.y = y + 0.5; g.add(r2); }
    { const bb = new THREE.Group(); bb.position.set(cx + 0.9, y, L - 8.5); for (const zz of [-0.6, 0.6]) bb.add(box(0.1, 0.42, 0.1, MAT.darkwood, 0, 0.21, zz)); bb.add(box(0.45, 0.06, 1.6, M.wood || MAT.darkwood, 0, 0.45, 0)); g.add(bb); }
    const [wx, wz] = toWorld(s, cx, cz); WALKDECKS.push({ x: wx, z: wz, rot: s.rot, hw: W2 / 2 + 0.05, hd: len2 / 2, y });
  } else boothX = 1.0;
  for (const ch of g.children) if (Math.abs(ch.position.x - 0.6) < 0.01 && Math.abs(ch.position.z - (L - 4)) < 0.01) ch.position.x = boothX;
  { const [x, z] = toWorld(s, boothX, L - 4); addCollider({ x, z, hw: room ? 0.8 : 0.4, hd: 0.7, rot: s.rot, kind: 'bld' }); }
  // gangway: a short ramp with handrails from the pier edge to where the ship's side lies, and a gap in the rope rail there
  const gz = FERRY.gwLz(s);
  { const gw = new THREE.Group(); gw.position.set(1.8, y + 0.02, gz); gw.rotation.z = 0.3; const plate = box(1.25, 0.08, 1.2, MAT.metal || M.conc, 0.62, 0, 0); gw.add(plate);
    for (const zz of [-0.58, 0.58]) { for (const xx of [0.1, 1.15]) gw.add(box(0.04, 0.95, 0.04, M.white || MAT.metal, xx, 0.48, zz)); gw.add(box(1.25, 0.05, 0.05, M.white || MAT.metal, 0.62, 0.95, zz)); }
    g.add(gw); const sg = dynSign(1.5, 0.36, 'ほしなみ丸 のりば', '#1f62b8', '#ffffff'); sg.position.set(1.55, y + 2.0, gz + 1.1); sg.rotation.y = Math.PI / 2; g.add(sg); g.add(cylM(0.04, 0.04, 1.9, MAT.metal || M.conc, 1.55, y + 0.95, gz + 1.1, 6)); }
  for (const ch of [...g.children]) if (ch.isMesh && Math.abs(ch.position.x - 1.75) < 0.01 && Math.abs(ch.position.y - (y + 0.82)) < 0.01 && ch.geometry.parameters && ch.geometry.parameters.height > L - 4) {
    g.remove(ch); const z0 = -1.5, z1 = L - 4.5, a = gz - 0.8, b = gz + 0.8;
    for (const [p, q] of [[z0, Math.min(a, z1)], [Math.max(b, z0), z1]]) if (q - p > 0.4) { const r = ch.clone(); r.geometry = new THREE.CylinderGeometry(0.03, 0.03, q - p, 6); r.position.z = (p + q) / 2; g.add(r); } }
  return g; }; }
// board from the gangway, step off onto the pier beside it
{ const _rt = GAME.rideTarget; GAME.rideTarget = function () { const r = _rt.apply(this, arguments); if (r) return r; const Fy = DV.ferry; if (!PL.veh && Fy && Fy.mesh === FERRY.made && Fy.docked && Fy.wait > 1 && FERRY.gw && Math.hypot(PL.x - FERRY.gw.x, PL.z - FERRY.gw.z) < 4.5) return Fy; return null; }; }
{ const _rk = GAME.rideKey; GAME.rideKey = function () { const v = PL.veh, wasF = v && v.kind === 'ferry' && v.docked && v.mesh === FERRY.made; const r = _rk.apply(this, arguments); if (wasF && !PL.veh && FERRY.gw) { PL.x = FERRY.gw.x; PL.z = FERRY.gw.z; PL.y = standY(PL.x, PL.z); } return r; }; }
