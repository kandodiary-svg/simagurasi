// ===================== ほしなみ大橋: 歩いても車でも渡れる大橋（本土側に料金所） =====================
// The bridge used to be scenery only: you walked and drove straight through it. Now its deck is a real surface
// (the same rule as the island's own bridges: you are on it when you come from its end, you can pass beneath it),
// the railings keep you on it, it counts as a road for cars, and on the mainland side a toll plaza with a barrier ends the trip.
const OHB = { s: null, L: 300, Wd: 12, yd: 16, end: 0, gate: 0, warned: 0 };
OHB.top = function (u) { const s = OHB.s, d0 = Math.max(0, Math.min(OHB.L - 10, Math.floor(u / 10) * 10)), t = clamp((u - d0) / 10, 0, 1); return lerp(s.yAt(d0), s.yAt(d0 + 10), t) + 0.45; };
OHB.ramp = (x, z, u) => Math.max(groundH(x, z), OHB.top(0) + u * 0.11);   // the short paved approach on the island side
OHB.local = function (x, z) { const s = OHB.s, px = x - s.x, pz = z - s.z; return { u: px * s.dx + pz * s.dz, v: px * s.side[0] + pz * s.side[1] }; };
// the deck under (x,z) for something at height ref (null → only when the deck is close to the ground, as for villagers)
OHB.hit = function (x, z, ref) {
  if (!OHB.s) return null; const { u, v } = OHB.local(x, z); if (u < -4.6 || u > OHB.end || Math.abs(v) > OHB.Wd / 2 - 0.25) return null;
  const y = u >= 0 ? OHB.top(u) : OHB.ramp(x, z, u); if (u < 0 && y <= groundH(x, z) + 0.03) return null; if (ref === null || ref === undefined) { if (y - groundH(x, z) > 2.5) return null; } else if (ref < y - 1.3) return null;
  return { y, u, v };
};
OHB.ref = () => typeof BRG !== 'undefined' && BRG.ref !== null && BRG.ref !== undefined ? BRG.ref : PL.veh && PL.veh.kind === 'truck' ? PL.veh.y : PL.y;
{ const _dk = deckY; deckY = function (x, z) { const d = _dk(x, z); if (d !== null || !OHB.s) return d; const h = OHB.hit(x, z, OHB.ref()); return h ? h.y : null; }; }
{ const _sy = standY; standY = function (x, z) { const base = _sy(x, z); if (!OHB.s) return base; const h = OHB.hit(x, z, OHB.ref()); return h && h.y > base - 0.4 ? h.y : base; }; }
OHB.blockedAhead = function (u, v) { if (u <= OHB.gate) return false; const now = performance.now();
  if (v && !v._bumpT) { v._bumpT = 1; setTimeout(() => v._bumpT = 0, 4000); }   // a car at the barrier: this message instead of 「ぶつかった！」
  if (now - OHB.warned > 6000) { OHB.warned = now; UI.toast(v ? '🚧 ここから先は本土。料金所で折り返そう（S でバック）' : '🚧 ここから先は本土。大橋の料金所で折り返そう'); } return true; };
{ const _cw = canWalk; canWalk = function (x0, z0, x1, z1) {
  if (!OHB.s) return _cw(x0, z0, x1, z1);
  const ref = OHB.ref(), h0 = OHB.hit(x0, z0, ref), h1 = OHB.hit(x1, z1, ref);
  if (h1) { if (OHB.blockedAhead(h1.u) && (!h0 || h1.u > h0.u)) return false;
    if (h0 && Math.abs(h1.v) > OHB.Wd / 2 - 0.75 && Math.abs(h1.v) > Math.abs(h0.v)) return false;       // railings
    if (!h0) { if (h1.u > 4) return false; const y0 = standY(x0, z0); if (h1.y - y0 > 1.2) return false; }  // step on only at the island end
    return true; }
  if (h0 && h0.u > 4) return false;   // no stepping off the side
  return _cw(x0, z0, x1, z1); }; }
{ const _vo = vehOK; vehOK = function (v, x, z, rot) {
  if (v.kind !== 'truck' || !OHB.s) return _vo(v, x, z, rot);
  const sp = VSPEC.truck, s = Math.sin(rot), c = Math.cos(rot), pts = [[sp.len, 0], [sp.len, sp.wid], [sp.len, -sp.wid], [-sp.len, sp.wid], [-sp.len, -sp.wid], [0, 0]].map(([a, b]) => [x + s * a + c * b, z + c * a - s * b]);
  const hits = pts.map(([px, pz]) => OHB.hit(px, pz, v.y)); const on = hits.find(Boolean); if (!on) { if (pts.some(([px, pz]) => { const q = OHB.local(px, pz); return q.u > 4 && q.u < OHB.end && Math.abs(q.v) < OHB.Wd / 2 && v.y > OHB.top(q.u) - 1.3; })) return false; return _vo(v, x, z, rot); }
  for (let i = 0; i < pts.length; i++) { const h = hits[i]; if (h) { if (h.u > OHB.gate) { OHB.blockedAhead(h.u, v); return false; } if (Math.abs(h.v) > OHB.Wd / 2 - 0.9) return false; continue; }
    const q = OHB.local(...pts[i]); if (q.u > 3) return false; const [px, pz] = pts[i]; if (groundH(px, pz) < -0.3) return false; }
  return true; }; }
{ const _sf = surfaceY; surfaceY = function (x, z) { const y = _sf(x, z); if (!OHB.s) return y; const h = OHB.hit(x, z, 1e6); return h && h.y > y ? h.y : y; }; }
// getting out of the car on the bridge: step out beside it on the deck
{ const _tv = toggleVehicle; toggleVehicle = function () { const v = PL.veh; if (v && v.kind === 'truck' && OHB.s && Math.abs(v.v) <= 2) { const h = OHB.hit(v.x, v.z, v.y); if (h && h.u > 3) { const s = Math.sin(v.rot), c = Math.cos(v.rot);
      for (const [a, bb] of [[0, 1.8], [0, -1.8], [-3, 0], [3, 0]]) { const x = v.x + s * a + c * bb, z = v.z + c * a - s * bb, q = OHB.hit(x, z, v.y); if (q && Math.abs(q.v) < OHB.Wd / 2 - 0.9 && q.u < OHB.gate) { PL.x = x; PL.z = z; PL.y = q.y; PL.veh = null; v.v = 0; CAM.distT = 5.2; if (PL.mesh) PL.mesh.visible = true; return; } }
      UI.toast('ここではおりられない'); return; } }
  return _tv.apply(this, arguments); }; }
// ---------- the build: remember the deck, pave it, put a toll plaza on the mainland side ----------
{ const _ob = DEV_BUILD.ohashi; DEV_BUILD.ohashi = function (s) {
  const g = _ob(s); const g0 = groundH(s.x, s.z), yd = OHB.yd, dx = s.dx, dz = s.dz, side = [dz, -dx];
  OHB.s = { x: s.x, z: s.z, dx, dz, side, yAt: d => d < 50 ? g0 + (yd - g0) * Math.sin(Math.min(1, Math.max(0, d) / 50) * Math.PI / 2) : yd };
  let end = OHB.L; for (let u = 20; u <= OHB.L; u += 1) { const x = s.x + dx * u, z = s.z + dz * u; if (Math.abs(x) > 343 || Math.abs(z) > 343) { end = u - 1; break; } }
  OHB.end = end; OHB.gate = Math.max(60, end - 14);
  try { if (g) g.add(OHB.dress(OHB.s)); } catch (e) { console.warn('ohashi dress', e); }
  try { OHB.clearVeg(); } catch (e) { console.warn('ohashi veg', e); }
  return g; }; }
// grass, flowers and trees don't grow through the paved approach and the foot of the bridge (only hidden, not saved as cut)
OHB.inApron = (x, z) => { if (!OHB.s) return false; const { u, v } = OHB.local(x, z); return u > -17 && u < 4 && Math.abs(v) < OHB.Wd / 2 + 0.4; };
{ const _vv = vegValid; vegValid = function (it) { if (it.type !== 'rock' && OHB.inApron(it.x, it.z)) return false; return _vv(it); }; }
OHB.clearVeg = function () { if (!OHB.s || !VEG.sets || !VEG.sets.length || !VEG.removed) return; const S = OHB.s, xs = [], zs = [];
  for (const u of [-17, 4]) for (const o of [-OHB.Wd / 2 - 0.4, OHB.Wd / 2 + 0.4]) { xs.push(S.x + S.dx * u + S.side[0] * o); zs.push(S.z + S.dz * u + S.side[1] * o); }
  OHB.box = [Math.min(...xs) - 1, Math.min(...zs) - 1, Math.max(...xs) + 1, Math.max(...zs) + 1]; VEG.refresh(...OHB.box); };
{ const _rd = GAME.refreshDev; GAME.refreshDev = function () { const had = OHB.box; OHB.s = null; OHB.box = null; const r = _rd.apply(this, arguments); if (had && !OHB.s) { try { VEG.refresh(...had); } catch (e) { } } return r; }; }
OHB.dress = function (s) {
  const g = new THREE.Group(), P = (u, o = 0, y = 0) => new THREE.Vector3(s.x + s.dx * u + s.side[0] * o, y, s.z + s.dz * u + s.side[1] * o), Wd = OHB.Wd;
  const asph = worldMat(TEX.asphalt || TEX.concrete, 0.3, '#e6e6e2', 0.92), line = stdM('#f2f0e8', 0.6), yel = stdM('#e8b320', 0.55), curb = stdM('#cfcac0', 0.7);
  const strip = (u0, u1, o, w, h, m, th = 0.04) => { const a = P(u0, o, OHB.top(u0) + h), b = P(u1, o, OHB.top(u1) + h), seg = new THREE.Mesh(new THREE.BoxGeometry(w, th, a.distanceTo(b)), m); seg.position.copy(a).add(b).multiplyScalar(0.5); seg.lookAt(b.x, b.y, b.z); seg.receiveShadow = true; g.add(seg); return seg; };
  for (let u = 0; u < OHB.end; u += 10) { const u1 = Math.min(OHB.end, u + 10);
    strip(u, u1, 0, Wd - 2.6, 0.01, asph);                       // asphalt between the walkways
    strip(u, u1, 0.12, 0.1, 0.035, yel); strip(u, u1, -0.12, 0.1, 0.035, yel);   // double yellow centre line
    for (const o of [-(Wd / 2 - 1.35), Wd / 2 - 1.35]) strip(u, u1, o, 0.12, 0.035, line);
    for (const o of [-(Wd / 2 - 1.3), Wd / 2 - 1.3]) strip(u, u1, o + Math.sign(o) * 0.12, 0.2, 0.08, curb, 0.16); }
  // the paved approach on the island side, draped over the ground and rising to the deck
  { const pos = [], col = [], idx = [], N = 16, U0 = -16, hw = (Wd - 2.6) / 2, M = 4, dark = new THREE.Color('#6c6e70'), yl = new THREE.Color('#e8b320');
    for (let i = 0; i <= N; i++) { const u = U0 + (0 - U0) * i / N; for (let k = 0; k <= M; k++) { const o = -hw - 0.6 + (2 * hw + 1.2) * k / M, p = P(u, o), y = Math.max(groundH(p.x, p.z) + 0.05, OHB.top(0) + u * 0.11 + 0.02) + (k === 0 || k === M ? -0.08 : 0); pos.push(p.x, y, p.z); const c = dark; col.push(c.r, c.g, c.b); }
      if (i) for (let k = 0; k < M; k++) { const a = (i - 1) * (M + 1) + k, b = a + M + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); } }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); ge.setIndex(idx); ge.computeVertexNormals();
    const ap = new THREE.Mesh(ge, worldMat(TEX.asphalt || TEX.concrete, 0.3, '#e6e6e2', 0.92, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 })); ap.receiveShadow = true; ap.userData.keep = true; g.add(ap); }
  // the toll plaza: a canopy over the lanes, two booths, barriers down, a sign
  const gu = OHB.gate + 2.5, gy = OHB.top(gu), rot = Math.atan2(s.dx, s.dz), pl = new THREE.Group(); pl.position.copy(P(gu, 0, gy)); pl.rotation.y = rot; g.add(pl);
  const wh = stdM('#f4f2ec', 0.5), gr = stdM('#2c7a4a', 0.5), rd = stdM('#d8423a', 0.5), gl = stdM('#9fc6dc', 0.15, 0.3, { transparent: true, opacity: 0.6 });
  for (const x of [-Wd / 2 + 0.6, Wd / 2 - 0.6]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.2, 0.5), wh); c.position.set(x, 2.6, 0); pl.add(c); }
  { const roof = new THREE.Mesh(new THREE.BoxGeometry(Wd + 1.2, 0.7, 4.2), gr); roof.position.set(0, 5.4, 0); roof.castShadow = true; pl.add(roof); const fr = new THREE.Mesh(new THREE.BoxGeometry(Wd + 1.25, 0.18, 4.25), wh); fr.position.set(0, 5.0, 0); pl.add(fr); }
  for (const x of [-2.2, 2.2]) { const b = new THREE.Group(); b.position.set(x, 0, 0); pl.add(b); const isl = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 4.0), curb); isl.position.y = 0.12; b.add(isl);
    const bo = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.6), wh); bo.position.y = 1.35; bo.castShadow = true; b.add(bo); for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), gl); w.position.set(sx * 0.505, 1.7, 0); w.rotation.y = sx * Math.PI / 2; b.add(w); }
    const arm = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 0.1), rd); arm.position.set(x < 0 ? 2.2 : -2.2, 1.0, -1.6); pl.add(arm); const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), stdM('#e8b320', 0.5)); post.position.set(x < 0 ? x + 0.55 : x - 0.55, 0.5, -1.6); pl.add(post);
    for (let k = 0; k < 4; k++) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.11, 0.12), wh); st.position.set((x < 0 ? 2.2 : -2.2) - 1.3 + k * 0.85, 1.0, -1.6); pl.add(st); } }
  { const sg = dynSign(6.2, 0.9, 'ほしなみ大橋 料金所　この先 本土', '#2c7a4a', '#ffffff'); sg.position.set(0, 5.4, -2.13); sg.rotation.y = Math.PI; pl.add(sg); }
  { const sg = dynSign(3.6, 0.9, 'ほしなみ島 →', '#1f4f8a', '#ffffff'); const p = P(14, -Wd / 2 + 0.4, OHB.top(14) + 2.6); sg.position.copy(p); sg.rotation.y = rot; g.add(sg); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), wh); pole.position.copy(p).add(new THREE.Vector3(0, -1.4, 0)); g.add(pole); }
  return typeof mergeLocal === 'function' ? mergeLocal(g) : g;
};
