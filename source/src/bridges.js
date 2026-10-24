// ===================== しまづくり: 橋をかける（川・池・谷・がけ）／滝をなくす =====================
const BTYPES = {
  wood: { name: '木の橋', icon: '🪵', w: 2.4, minL: 4, maxL: 36, slope: 0.3, car: false, lv: 2, note: '歩いてわたる木の橋' },
  taiko: { name: '赤い太鼓橋', icon: '⛩️', w: 2.6, minL: 4, maxL: 24, slope: 0.12, car: false, lv: 2, note: '弓なりの朱色の橋（池や小川に）' },
  rope: { inset: 0.12, name: '吊り橋', icon: '🪢', w: 1.8, minL: 8, maxL: 90, slope: 0.25, car: false, lv: 3, note: 'がけとがけを結ぶ、長い吊り橋' },
  stone: { inset: 0.42, name: '石のアーチ橋', icon: '🌉', w: 4.6, minL: 6, maxL: 48, slope: 0.1, car: true, lv: 3, note: '軽トラも通れる石づくりの橋' },
  road: { inset: 0.5, name: '車の通れる大橋', icon: '🚗', w: 6.4, minL: 8, maxL: 110, slope: 0.08, car: true, lv: 4, note: 'コンクリートの道路橋。道路のはしにつなげられる' },
};
const BRG = { list: [], group: null, ref: null, a: null, plan: null, mode: 'build', type: 'wood', hl: null, M: null };
TOOLS.push({ id: 'bridge', name: '橋', icon: '🌉', key: 'G', hint: '橋をかけたい所の「こちら側」をクリック → 「むこう側」をクリック。川・池・谷・がけの上にかけられます', brush: false });
TOOL_LV.bridge = 2;
// ---------- shape of a bridge ----------
function brFrame(b) { const dx = b.bx - b.ax, dz = b.bz - b.az, L = Math.hypot(dx, dz) || 1; return { L, dx: dx / L, dz: dz / L, sx: -dz / L, sz: dx / L, ry: Math.atan2(dx, dz) }; }
function brPrep(b) { if (!b._f) b._f = brFrame(b); return b; }
function brBump(type, L) { return type === 'taiko' ? clamp(L * 0.1, 0.6, 2.6) : type === 'rope' ? -Math.min(L * 0.025, 2.0) : type === 'stone' ? Math.min(L * 0.035, 1.2) : type === 'road' ? Math.min(L * 0.012, 0.9) : 0; }
function brY(b, u) { const L = b._f.L, t = clamp(u / L, 0, 1); const sn = Math.sin(Math.PI * t); return lerp(b.ay, b.by, t) + brBump(b.type, L) * (b.type === 'rope' ? sn * sn : sn); }
const brClean = b => ({ type: b.type, ax: +b.ax.toFixed(2), az: +b.az.toFixed(2), ay: +b.ay.toFixed(2), bx: +b.bx.toFixed(2), bz: +b.bz.toFixed(2), by: +b.by.toFixed(2) });
// the deck under (x,z). ref = height of whoever is asking (null: an NPC → only low decks; big number: picking)
function brHit(x, z, ref) {
  let best = null;
  for (const b of BRG.list) { const f = b._f, px = x - b.ax, pz = z - b.az, u = px * f.dx + pz * f.dz; if (u < -0.25 || u > f.L + 0.25) continue; const v = px * f.sx + pz * f.sz; if (Math.abs(v) > BTYPES[b.type].w / 2) continue;
    const y = brY(b, u); if (ref === null || ref === undefined) { if (y - groundH(x, z) > 2.5) continue; } else if (ref < y - 1.3) continue;
    if (!best || (ref !== null && ref !== undefined ? Math.abs(y - ref) < Math.abs(best.y - ref) : y > best.y)) best = { y, b, u, v }; }
  return best;
}
const brAt = (x, z, ref) => { const h = brHit(x, z, ref); return h ? h.y : null; };
// ---------- walking & driving on bridges ----------
{ const _sy = standY; standY = function (x, z) { const base = _sy(x, z); if (!BRG.list.length) return base; const h = brHit(x, z, BRG.ref); return h && h.y > base - 0.4 ? h.y : base; }; }
{ const _cw = canWalk; canWalk = function (x0, z0, x1, z1) {
  if (!BRG.list.length) return _cw(x0, z0, x1, z1);
  const h0 = brHit(x0, z0, BRG.ref), h1 = brHit(x1, z1, BRG.ref);
  if (h1) { if (Math.abs(x1) > 352 || Math.abs(z1) > 352) return false; if (h0 && h0.b === h1.b && Math.abs(h1.v) > BTYPES[h1.b.type].w / 2 - (BTYPES[h1.b.type].inset || 0.15) && Math.abs(h1.v) > Math.abs(h0.v)) return false; if (!h0) { const y0 = standY(x0, z0), d = Math.hypot(x1 - x0, z1 - z0) || 1e-4; if (h1.y - y0 > 0.7 && (h1.y - y0) / d > 1.25) return false; if (Math.abs(h1.v) > BTYPES[h1.b.type].w / 2 - 0.25 && h1.u > 1 && h1.u < h1.b._f.L - 1) return false; } return true; }
  if (h0 && h0.u > 0.9 && h0.u < h0.b._f.L - 0.9) return false; // railings: leave only at the ends
  return _cw(x0, z0, x1, z1); }; }
{ const _up = updatePlayer; updatePlayer = function (dt, locked) { BRG.ref = PL.y; try { return _up(dt, locked); } finally { BRG.ref = null; } }; }
{ const _pv = placeVehicle; placeVehicle = function (v, dt) { if (v.kind === 'truck') BRG.ref = v.y; try { return _pv(v, dt); } finally { BRG.ref = null; } }; }
{ const _vo = vehOK; vehOK = function (v, x, z, rot) {
  if (v.kind !== 'truck' || !BRG.list.length) return _vo(v, x, z, rot);
  const sp = VSPEC.truck, s = Math.sin(rot), c = Math.cos(rot), pts = [[sp.len, 0], [sp.len, sp.wid], [sp.len, -sp.wid], [-sp.len, sp.wid], [-sp.len, -sp.wid], [0, 0]].map(([a, b]) => [x + s * a + c * b, z + c * a - s * b]);
  const hits = pts.map(([px, pz]) => brHit(px, pz, v.y)); const on = hits.find(Boolean); if (!on) return _vo(v, x, z, rot);
  for (let i = 0; i < pts.length; i++) { const h = hits[i]; if (h) { if (!BTYPES[h.b.type].car) return false; continue; }
    const [px, pz] = pts[i], ob = on.b, ou = (px - ob.ax) * ob._f.dx + (pz - ob.az) * ob._f.dz; if (ou > 0.4 && ou < ob._f.L - 0.4) return false; if (deckY(px, pz) === null && (groundH(px, pz) < -0.3 || waterDepthAt(px, pz) > 0.35)) return false; }
  return true; }; }
{ const _tv = toggleVehicle; toggleVehicle = function () { const v = PL.veh; if (v && v.kind === 'truck' && BRG.list.length && Math.abs(v.v) <= 2) { const h = brHit(v.x, v.z, v.y); if (h) { const s = Math.sin(v.rot), c = Math.cos(v.rot);
      for (const [a, bb] of [[0, 1.6], [0, -1.6], [-2.8, 0], [2.8, 0], [0, 1.2], [0, -1.2]]) { const x = v.x + s * a + c * bb, z = v.z + c * a - s * bb, q = brHit(x, z, v.y); if (q && Math.abs(q.v) < BTYPES[q.b.type].w / 2 - 0.35) { PL.x = x; PL.z = z; PL.y = q.y; PL.veh = null; v.v = 0; CAM.distT = 5.2; return; } }
      UI.toast('ここではおりられない'); return; } }
  BRG.ref = v ? v.y : PL.y; try { return _tv.apply(this, arguments); } finally { BRG.ref = null; } }; }
{ const _sf = surfaceY; surfaceY = function (x, z) { const y = _sf(x, z); if (!BRG.list.length) return y; const h = brHit(x, z, 1e6); return h && h.y > y ? h.y : y; }; }
// ---------- materials ----------
function brMats() {
  if (BRG.M) return BRG.M;
  return BRG.M = { plank: worldMat(TEX.wood, 0.45, '#b4885a', 0.8), woodD: worldMat(TEX.wood, 0.5, '#6e4c30', 0.85), taiko: worldMat(TEX.wood, 0.5, '#7a5236', 0.8),
    red: stdM('#d8452c', 0.55), bronze: stdM('#b8923e', 0.35, 0.6), rope: stdM('#c4a676', 0.95),
    stone: worldMat(TEX.stonewall, 0.35, '#e2d8c6', 0.95), pave: worldMat(TEX.concrete, 0.3, '#d6cab2', 0.95), cope: worldMat(TEX.concrete, 0.4, '#efe8da', 0.9),
    conc: worldMat(TEX.concrete, 0.25, '#d6d6ce', 0.9), asph: worldMat(TEX.asphalt || TEX.concrete, 0.3, '#56595f', 0.92), white: stdM('#f4f4ee', 0.6), metal: stdM('#c8d0d6', 0.35, 0.6),
    lamp: hrGlow(stdM('#fff2c8', 0.4, 0, { emissive: new THREE.Color('#ffe2a0'), emissiveIntensity: 0.1 })) };
}
// ---------- geometry helpers (u = metres along the bridge, o = metres to the side, y relative to the deck) ----------
const rectSec = (o0, o1, y0, y1) => [[o1, y1], [o0, y1], [o0, y0], [o1, y0], [o1, y1]];  // counter-clockwise → outward normals
const circSec = (o, y, r, n = 6) => { const s = []; for (let i = 0; i <= n; i++) { const a = i / n * 6.283; s.push([o + Math.cos(a) * r, y + Math.sin(a) * r]); } return s; };
function brSweep(g, b, sec, mat, u0, u1, step, yfn) {
  const f = b._f, n = Math.max(1, Math.ceil((u1 - u0) / step)), pos = [], idx = [];
  for (let e = 0; e < sec.length - 1; e++) { const base = pos.length / 3;
    for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n, y0 = yfn ? yfn(u) : brY(b, u); for (const [o, dy] of [sec[e], sec[e + 1]]) pos.push(b.ax + f.dx * u + f.sx * o, y0 + dy, b.az + f.dz * u + f.sz * o); }
    for (let i = 0; i < n; i++) { const a = base + i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setIndex(idx); ge.computeVertexNormals();
  const m = new THREE.Mesh(ge, mat); m.castShadow = m.receiveShadow = true; g.add(m); return m;
}
// a strip between two height functions at side offset o (side = ±1 → faces outward), or a horizontal strip (soffit) facing down
function brWall(g, b, o, side, u0, u1, topFn, botFn, mat) {
  const f = b._f, n = Math.max(1, Math.ceil((u1 - u0) / 0.8)), pos = [], idx = [];
  for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n, x = b.ax + f.dx * u + f.sx * o, z = b.az + f.dz * u + f.sz * o; pos.push(x, topFn(u), z, x, botFn(u), z); }
  for (let i = 0; i < n; i++) { const a = i * 2; if (side > 0) idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); else idx.push(a, a + 2, a + 1, a + 2, a + 3, a + 1); }
  const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setIndex(idx); ge.computeVertexNormals(); const m = new THREE.Mesh(ge, mat); m.castShadow = m.receiveShadow = true; g.add(m); return m;
}
function brSoffit(g, b, o0, o1, u0, u1, yFn, mat) { brSweep(g, b, [[o0, 0], [o1, 0]], mat, u0, u1, 0.8, yFn); }
const brW = (b, u, o) => [b.ax + b._f.dx * u + b._f.sx * o, b.az + b._f.dz * u + b._f.sz * o];
function brPost(g, b, u, o, y0, y1, s, mat, round) { const [x, z] = brW(b, u, o); if (y1 - y0 < 0.05) return; if (round) CY(g, s / 2, y1 - y0, mat, x, (y0 + y1) / 2, z, 7); else B(g, s, y1 - y0, s, mat, x, (y0 + y1) / 2, z, b._f.ry); }
function brAbut(g, b, M, mat, w, drop) { for (const u of [0, b._f.L]) { const [x, z] = brW(b, u, 0), y = brY(b, u), gy = groundH(x, z); B(g, w + 0.5, Math.max(0.6, y - drop - gy + 1.2), 1.4, mat, x, (y - drop + gy - 1.2) / 2, z, b._f.ry); } }
// ---------- the five kinds ----------
const BR_BUILD = {
  wood(g, b, M) { const T = BTYPES.wood, w = T.w, L = b._f.L;
    brSweep(g, b, rectSec(-w / 2, w / 2, -0.2, 0), M.plank, 0, L, 1);
    for (const sd of [-1, 1]) { const e = sd * w / 2; brSweep(g, b, rectSec(Math.min(e, e - sd * 0.2), Math.max(e, e - sd * 0.2), -0.5, -0.12), M.woodD, 0, L, 1);
      const o = sd * (w / 2 - 0.07), np = Math.max(1, Math.round((L - 0.6) / 1.6)); for (let k = 0; k <= np; k++) { const u = 0.3 + (L - 0.6) * k / np, y = brY(b, u); brPost(g, b, u, o, y - 0.1, y + 1.05, 0.11, M.woodD); }
      brSweep(g, b, rectSec(o - 0.06, o + 0.06, 0.96, 1.07), M.woodD, 0.3, L - 0.3, 1); brSweep(g, b, rectSec(o - 0.035, o + 0.035, 0.5, 0.56), M.woodD, 0.3, L - 0.3, 1); }
    const nP = Math.max(1, Math.round(L / 4)); for (let k = 1; k < nP; k++) { const u = L * k / nP, y = brY(b, u) - 0.22; let any = false; for (const sd of [-1, 1]) { const [x, z] = brW(b, u, sd * (w / 2 - 0.2)), gy = groundH(x, z) - 0.6; if (y - gy < 0.9) continue; any = true; brPost(g, b, u, sd * (w / 2 - 0.2), gy, y, 0.26, M.woodD, true); } if (any) { const [x, z] = brW(b, u, 0); B(g, w + 0.3, 0.18, 0.22, M.woodD, x, y - 0.28, z, b._f.ry); } }
    brAbut(g, b, M, M.stone, w, 0.22); },
  taiko(g, b, M) { const T = BTYPES.taiko, w = T.w, L = b._f.L;
    brSweep(g, b, rectSec(-w / 2, w / 2, -0.25, 0), M.taiko, 0, L, 0.6);
    for (const sd of [-1, 1]) { const e = sd * w / 2; brSweep(g, b, rectSec(Math.min(e, e - sd * 0.16), Math.max(e, e - sd * 0.16) + 0.02 * sd, -0.55, -0.05), M.red, 0, L, 0.6);
      const o = sd * (w / 2 - 0.08), np = Math.max(2, Math.round((L - 0.5) / 1.3)); for (let k = 0; k <= np; k++) { const u = 0.25 + (L - 0.5) * k / np, y = brY(b, u), end = k === 0 || k === np; brPost(g, b, u, o, y - 0.1, y + (end ? 1.15 : 1.0), end ? 0.2 : 0.13, M.red);
        if (end) { const [x, z] = brW(b, u, o); SP(g, 0.15, M.bronze, x, y + 1.27, z, 1.1, 10); const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 8), M.bronze); c.position.set(x, y + 1.45, z); g.add(c); } }
      brSweep(g, b, rectSec(o - 0.08, o + 0.08, 0.92, 1.04), M.red, 0.25, L - 0.25, 0.5); brSweep(g, b, rectSec(o - 0.05, o + 0.05, 0.5, 0.58), M.red, 0.25, L - 0.25, 0.5); brSweep(g, b, rectSec(o - 0.05, o + 0.05, 0.08, 0.16), M.red, 0.25, L - 0.25, 0.5); }
    for (const f of [0.22, 0.5, 0.78]) { const u = L * f, y = brY(b, u) - 0.5; let any = false; for (const sd of [-1, 1]) { const [x, z] = brW(b, u, sd * (w / 2 - 0.3)), gy = groundH(x, z) - 0.6; if (y - gy < 0.6) continue; any = true; brPost(g, b, u, sd * (w / 2 - 0.3), gy, y, 0.24, M.red, true); } if (any) { const [x, z] = brW(b, u, 0); B(g, w + 0.4, 0.16, 0.2, M.red, x, y - 0.35, z, b._f.ry); } }
    brAbut(g, b, M, M.stone, w, 0.25); },
  rope(g, b, M) { const T = BTYPES.rope, w = T.w, L = b._f.L, f = b._f;
    for (let u = 0.25; u <= L - 0.2; u += 0.42) { const [x, z] = brW(b, u, 0), y = brY(b, u); B(g, w, 0.07, 0.3, M.plank, x, y - 0.04, z, f.ry); }
    const yEnd = u => u < L / 2 ? b.ay : b.by, top = u => yEnd(u) + 3.3, cable = u => { const t = clamp(u / L, 0, 1); return brY(b, u) + 1.05 + 2.2 * Math.pow(2 * t - 1, 2); };
    for (const sd of [-1, 1]) { const o = sd * (w / 2 + 0.05);
      brSweep(g, b, circSec(sd * w * 0.42, -0.1, 0.045), M.rope, 0, L, 0.8);
      brSweep(g, b, circSec(o, 0, 0.05), M.rope, 0, L, 0.8, cable); brSweep(g, b, circSec(o, 0.55, 0.035), M.rope, 0, L, 0.8);
      for (let u = 0.8; u < L - 0.5; u += 1.0) { const [x, z] = brW(b, u, o), y = brY(b, u); ROD(g, 0.016, M.rope, [x, y - 0.05, z], [x, cable(u), z], 4); }
      for (const [u, back] of [[-0.6, -3.4], [L + 0.6, L + 3.4]]) { const [x, z] = brW(b, u, o), gy = groundH(x, z), ty = top(u); B(g, 0.3, ty - gy + 0.6, 0.3, M.woodD, x, (ty + gy - 0.6) / 2, z, f.ry); const [ax, az] = brW(b, back, o * 1.4), ay = groundH(ax, az); ROD(g, 0.04, M.rope, [x, ty - 0.1, z], [ax, ay + 0.3, az], 5); B(g, 0.35, 0.8, 0.35, M.woodD, ax, ay + 0.2, az, f.ry); } }
    for (const u of [-0.6, L + 0.6]) { const [x, z] = brW(b, u, 0); B(g, w + 0.9, 0.26, 0.32, M.woodD, x, top(u) - 0.1, z, f.ry); B(g, w + 0.9, 0.16, 0.22, M.woodD, x, yEnd(u) + 1.1, z, f.ry); }
    brAbut(g, b, M, M.stone, w, 0.1); },
  stone(g, b, M) { const T = BTYPES.stone, w = T.w, L = b._f.L, top = u => brY(b, u);
    brSweep(g, b, rectSec(-w / 2 + 0.3, w / 2 - 0.3, -0.02, 0.02), M.pave, 0, L, 1);
    for (const sd of [-1, 1]) { const e = sd * w / 2, i = e - sd * 0.35; brSweep(g, b, rectSec(Math.min(e, i), Math.max(e, i), -0.02, 0.85), M.stone, 0, L, 1); brSweep(g, b, rectSec(Math.min(e, i) - 0.05, Math.max(e, i) + 0.05, 0.85, 0.97), M.cope, 0, L, 1); }
    const nS = Math.max(1, Math.round(L / 8)), springs = [];
    for (let k = 0; k < nS; k++) { const u0 = L * k / nS, u1 = L * (k + 1) / nS, m = (u0 + u1) / 2, h = (u1 - u0) / 2; let gmin = 1e9, dmin = 1e9; for (let u = u0; u <= u1 + 1e-6; u += 1) { const [x, z] = brW(b, u, 0); gmin = Math.min(gmin, groundH(x, z)); dmin = Math.min(dmin, top(u)); }
      const crown = dmin - 0.7, spring = Math.max(gmin - 0.4, crown - h), rise = crown - spring; springs.push(spring);
      const intr = rise > 0.4 ? (u => spring + rise * Math.sqrt(Math.max(0, 1 - Math.pow((u - m) / h, 2)))) : (u => gmin - 1);
      for (const sd of [-1, 1]) brWall(g, b, sd * w / 2, sd, u0, u1, u => top(u) - 0.02, intr, M.stone);
      if (rise > 0.4) brSoffit(g, b, -w / 2, w / 2, u0 + 0.05, u1 - 0.05, intr, M.stone); }
    // deck underside between the walls (covers the top of the soffit band)
    brSweep(g, b, [[-w / 2, -0.3], [w / 2, -0.3]], M.stone, 0, L, 1);
    for (let k = 1; k < nS; k++) { const u = L * k / nS, [x, z] = brW(b, u, 0), gy = groundH(x, z) - 1.2, yt = Math.max(springs[k - 1], springs[k]) + 0.4; if (yt - gy > 0.3) { B(g, 1.6, yt - gy, w + 0.4, M.stone, x, (yt + gy) / 2, z, b._f.ry + Math.PI / 2); } }
    brAbut(g, b, M, M.stone, w + 0.4, 0.3); },
  road(g, b, M) { const T = BTYPES.road, w = T.w, L = b._f.L;
    brSweep(g, b, [[w / 2, 0], [-w / 2, 0], [-w / 2, -0.45], [-w / 2 + 0.9, -1.4], [w / 2 - 0.9, -1.4], [w / 2, -0.45], [w / 2, 0]], M.conc, 0, L, 1);
    brSweep(g, b, rectSec(-w / 2 + 0.45, w / 2 - 0.45, 0, 0.035), M.asph, 0, L, 1);
    for (const sd of [-1, 1]) { const o = sd * (w / 2 - 0.75); brSweep(g, b, rectSec(o - 0.06, o + 0.06, 0.036, 0.042), M.white, 0, L, 1);
      const e = sd * w / 2, i = e - sd * 0.42; brSweep(g, b, rectSec(Math.min(e, i), Math.max(e, i), 0, 0.72), M.conc, 0, L, 1); brSweep(g, b, rectSec(sd * (w / 2 - 0.21) - 0.05, sd * (w / 2 - 0.21) + 0.05, 0.98, 1.06), M.metal, 0, L, 1);
      for (let u = 1; u < L - 0.5; u += 2) { const y = brY(b, u); brPost(g, b, u, sd * (w / 2 - 0.21), y + 0.72, y + 1.0, 0.07, M.metal); } }
    for (let u = 1.5; u < L - 2; u += 4.5) brSweep(g, b, rectSec(-0.06, 0.06, 0.036, 0.042), M.white, u, u + 2.2, 1);
    const nP = Math.max(1, Math.round(L / 20)); for (let k = 1; k < nP; k++) { const u = L * k / nP, [x, z] = brW(b, u, 0), y = brY(b, u) - 1.4, gy = Math.min(groundH(x, z), 0) - 1.5; if (y - gy < 0.6) continue; B(g, 1.5, y - 0.8 - gy, 1.5, M.conc, x, (y - 0.8 + gy) / 2, z, b._f.ry); B(g, w - 1.6, 0.85, 1.9, M.conc, x, y - 0.42, z, b._f.ry); }
    for (let u = 6, k = 0; u < L - 3; u += 18, k++) { const sd = k % 2 ? 1 : -1, o = sd * (w / 2 - 0.2), y = brY(b, u), [x, z] = brW(b, u, o), [lx, lz] = brW(b, u, o - sd * 1.1); CY(g, 0.08, 5.6, M.metal, x, y + 0.72 + 2.8, z, 7); ROD(g, 0.05, M.metal, [x, y + 6.4, z], [lx, y + 6.5, lz], 5); B(g, 0.5, 0.12, 0.28, M.metal, lx, y + 6.42, lz, b._f.ry); SP(g, 0.16, M.lamp, lx, y + 6.3, lz, 0.6, 8); }
    brAbut(g, b, M, M.conc, w, 1.4); },
};
BRG.mesh = function (b) { const g = new THREE.Group(), M = brMats(); brPrep(b); BR_BUILD[b.type](g, b, M); return mergeLocal(g); };
BRG.rebuild = function () {
  if (!BRG.group) { BRG.group = new THREE.Group(); scene.add(BRG.group); }
  while (BRG.group.children.length) { const c = BRG.group.children[0]; BRG.group.remove(c); c.traverse(o => o.geometry && o.geometry.dispose()); }
  for (const b of BRG.list) { brPrep(b); try { BRG.group.add(BRG.mesh(b)); } catch (e) { console.warn('bridge', e); } }
  GAME.mapDirty = true;
};
// ---------- planning ----------
BRG.endAt = function (p) {
  for (const b of BRG.list) for (const [x, z, y] of [[b.ax, b.az, b.ay], [b.bx, b.bz, b.by]]) if (Math.hypot(x - p.x, z - p.z) < 2.5) return { x, z, y, snap: 'bridge' };
  const r = nearestOnRoads(p.x, p.z, 3.2, false); if (r && !(r.road.bridge && r.road.bridge.some(Boolean) && waterDepthAt(r.x, r.z) > 0)) return { x: r.x, z: r.z, y: r.y + 0.02, snap: 'road' };
  return { x: p.x, z: p.z, y: groundH(p.x, p.z) + 0.06, snap: null };
};
BRG.planTo = function (A, p) {
  const T = BTYPES[BRG.type], B0 = BRG.endAt(p), b = { type: BRG.type, ax: A.x, az: A.z, ay: A.y, bx: B0.x, bz: B0.z, by: B0.y }; brPrep(b); const f = b._f, L = f.L, out = { b, ok: false, L };
  const err = e => Object.assign(out, { err: e });
  if (L < T.minL) return err(`短すぎます（${T.minL}m以上にしてね）`);
  if (L > T.maxL) return err(`${T.name}は${T.maxL}mまでです（いま${Math.round(L)}m）${BRG.type !== 'rope' && BRG.type !== 'road' ? '。長い橋は「吊り橋」か「車の通れる大橋」で' : ''}`);
  for (const E of [A, B0]) { if (!GAME.openAt(E.x, E.z)) return err(GAME.lockText(E.x, E.z)); if (E.snap) continue;
    if (groundH(E.x, E.z) < 0.15 || waterDepthAt(E.x, E.z) > 0.05) return err('橋のはしは陸の上にしてね（水の中・海の中はだめ）');
    if (collidersNear(E.x, E.z).some(c => !c.off && c.kind === 'bld' && hitsCollider(c, E.x, E.z, 0.6))) return err('橋のはしが建物にぶつかっています'); }
  const dh = Math.abs(b.by - b.ay); if (dh / L > T.slope) return err(`高さの差が${dh.toFixed(1)}mあって、坂が急すぎます（${T.name}は${Math.round(T.slope * 100)}%まで）。もっと長くするか、地面をならしてね`);
  let gap = 0, wet = false;
  for (let u = 0; u <= L + 1e-6; u += 1) { const y = brY(b, u), inner = u > 1.6 && u < L - 1.6;
    for (const o of [-T.w / 2, 0, T.w / 2]) { const [x, z] = brW(b, u, o), g0 = groundH(x, z);
      if (inner && g0 > y + 0.1 + 0.5 * Math.max(0, 1 - Math.min(u, L - u) / 6)) return err('途中で地面にぶつかります。高い所どうしを結ぶか、じゃまな所を下げてね');
      gap = Math.max(gap, y - g0); if (!isNaN(waterLevelAt(G, x, z)) || g0 < -0.3) wet = true;
      if (inner && y - g0 < 9 && collidersNear(x, z).some(c => !c.off && (c.kind === 'bld' || c.kind === 'pole' || c.kind === 'farm') && hitsCollider(c, x, z, 0.15))) return err('建物・電柱・畑にぶつかります'); }
    if (inner && !(A.snap === 'road' && u < 6) && !(B0.snap === 'road' && u > L - 6)) { const [x, z] = brW(b, u, 0), rr = nearestOnRoads(x, z, T.w / 2 + 2.6, false); if (rr && y - rr.y < 4.6) return err(`道路の上を通るには、道路から4.6m以上の高さが必要です（いま${Math.max(0, y - rr.y).toFixed(1)}m）`); } }
  if (gap < 1.0 && !wet) return err('ここは平らな地面です。橋は川・池・谷・がけの上にかけてね');
  for (const q of BRG.list) { const qf = q._f, den = f.dx * qf.dz - f.dz * qf.dx; if (Math.abs(den) < 1e-6) continue; const wx = q.ax - b.ax, wz = q.az - b.az, u = (wx * qf.dz - wz * qf.dx) / den, uq = (wx * f.dz - wz * f.dx) / den;
    if (u > 1 && u < L - 1 && uq > -1 && uq < qf.L + 1 && Math.abs(brY(b, u) - brY(q, uq)) < 3.4) return err('ほかの橋とぶつかります（上下に3.4m以上はなせば交差できます）'); }
  return Object.assign(out, { ok: true, gap, wet, snapA: A.snap, snapB: B0.snap });
};
BRG.build = function (plan) {
  const T = BTYPES[plan.b.type]; pushUndo(); const b = brPrep(brClean(plan.b)); BRG.list.push(b);
  // trees in the way are cut
  let cut = 0, x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; const nu = VEG.userTrees.length;
  for (let u = 0; u <= b._f.L; u += 1.5) { const [x, z] = brW(b, u, 0); if (brY(b, u) - groundH(x, z) < 14) { cut += VEG.removeAt(x, z, T.w / 2 + 1.4); x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); } }
  if (cut) { if (VEG.userTrees.length !== nu && VEG.rebuildUser) VEG.rebuildUser(); VEG.refresh(x0 - 4, z0 - 4, x1 + 4, z1 + 4); }
  BRG.rebuild(); BRG.a = null; BRG.plan = null; scheduleSave(); GAME.ev('bridgeN', 1); if (EDIT.on) UI.editPanel();
  UI.toast(`🌉 ${T.name}（${Math.round(b._f.L)}m）ができました！${T.car ? ' 軽トラでもわたれます' : ''}`); UI.editHint();
};
BRG.remove = function (b) { pushUndo(); BRG.list = BRG.list.filter(q => q !== b); BRG.rebuild(); scheduleSave(); UI.toast(`${BTYPES[b.type].name}をこわしました（「ひとつもどす」で元にもどせます）`); };
// ---------- edit-mode preview / clicks ----------
BRG.ghost = function () {
  if (BRG.gh) return BRG.gh; const m = new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.55, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const g = new THREE.Mesh(new THREE.BufferGeometry(), m); g.renderOrder = 41; g.frustumCulled = false; scene.add(g);
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.25, 16), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthTest: false })); dot.renderOrder = 51; scene.add(dot);
  return BRG.gh = { g, m, dot };
};
BRG.preview = function (p) {
  const gh = BRG.ghost(); let hint;
  if (BRG.mode === 'remove') { gh.dot.visible = false; const h = p && brHit(p.x, p.z, 1e6); BRG.hl = h ? h.b : null;
    if (h) { const T = BTYPES[h.b.type], pts = []; for (let u = 0; u <= h.b._f.L + 1e-6; u += 1) pts.push([...brW(h.b, u, 0), brY(h.b, u) + 0.15]); gh.g.geometry.dispose(); gh.g.geometry = ribbonGeo(pts.map(([x, z, y]) => [x, z, y]), T.w + 0.6, 0.3); gh.m.color.set('#ff6f6f'); gh.g.visible = true; hint = `${T.name}（${Math.round(h.b._f.L)}m）　クリックでこわす`; }
    else { gh.g.visible = false; hint = BRG.list.length ? 'こわしたい橋をクリックしてね' : 'まだ橋がありません'; } }
  else if (!BRG.a) { gh.g.visible = false; if (p) { const E = BRG.endAt(p); gh.dot.visible = true; gh.dot.position.set(E.x, E.y + 0.15, E.z); gh.dot.material.color.set(E.snap === 'road' ? '#4fd0ff' : E.snap === 'bridge' ? '#c08aff' : '#ffffff'); } else gh.dot.visible = false;
    const T = BTYPES[BRG.type]; hint = `${T.icon} ${T.name}：橋のはしをクリック（${T.minL}〜${T.maxL}m・${T.car ? '軽トラOK' : '歩いてわたる'}）${p ? (BRG.endAt(p).snap === 'road' ? '　青＝道路につなぐ' : BRG.endAt(p).snap === 'bridge' ? '　紫＝橋のはしにつなぐ' : '') : ''}`; }
  else { gh.dot.visible = true; gh.dot.position.set(BRG.a.x, BRG.a.y + 0.15, BRG.a.z); if (!p) { gh.g.visible = false; hint = 'むこう側のはしをクリックしてね'; }
    else { const plan = BRG.planTo(BRG.a, p); BRG.plan = plan; const b = plan.b, T = BTYPES[b.type], pts = []; for (let u = 0; u <= b._f.L + 1e-6; u += Math.max(0.5, b._f.L / 60)) pts.push([...brW(b, u, 0), brY(b, u) + 0.12]);
      if (pts.length >= 2) { gh.g.geometry.dispose(); gh.g.geometry = ribbonGeo(pts, T.w, 0.25); gh.m.color.set(plan.ok ? '#7cf0a0' : '#ff6f6f'); gh.g.visible = true; } else gh.g.visible = false;
      hint = plan.ok ? `${T.name}　長さ${Math.round(plan.L)}m${plan.snapB === 'road' ? '（道路につなぐ）' : ''}　クリックで橋をかける（Esc でやめる）` : '⚠ ' + plan.err; } }
  if (EDIT._bh !== hint) { EDIT._bh = hint; UI.editHint(); }
};
BRG.click = function (p) {
  if (BRG.mode === 'remove') { const h = brHit(p.x, p.z, 1e6); if (h) BRG.remove(h.b); else UI.toast('こわしたい橋をクリックしてね'); return; }
  const T = BTYPES[BRG.type]; if (T.lv > GAME.level()) { UI.toast(`${T.name}は元気度Lv${T.lv}でかけられるようになります`); return; }
  if (!BRG.a) { const E = BRG.endAt(p); if (!E.snap && (groundH(E.x, E.z) < 0.15 || waterDepthAt(E.x, E.z) > 0.05)) { UI.toast('橋のはしは陸の上にしてね'); return; } if (!GAME.openAt(E.x, E.z)) { UI.toast(GAME.lockText(E.x, E.z)); return; } BRG.a = E; BRG.preview(p); UI.editPanel(); return; }
  const plan = BRG.planTo(BRG.a, p); if (!plan.ok) { UI.toast(plan.err); return; } BRG.build(plan);
};
BRG.clear = function () { BRG.a = null; BRG.plan = null; BRG.hl = null; if (BRG.gh) { BRG.gh.g.visible = false; BRG.gh.dot.visible = false; } };
{ const _u = updateEdit; updateEdit = function (dt) { _u(dt); if (EDIT.on && EDIT.tool === 'bridge') BRG.preview(EDIT.hover); else if (BRG.gh && (BRG.gh.g.visible || BRG.gh.dot.visible)) { BRG.gh.g.visible = false; BRG.gh.dot.visible = false; } }; }
{ const _d = editPointerDown; editPointerDown = function (e) { if (EDIT.tool === 'bridge') { const p = pickSurface(e.clientX, e.clientY); if (p) BRG.click(p); return; } return _d(e); }; }
{ const _s = setTool; setTool = function (id) { if (id !== 'bridge') BRG.clear(); return _s(id); }; }
{ const _t = toggleEdit; toggleEdit = function (on) { const r = _t(on); if (!EDIT.on) BRG.clear(); return r; }; }
{ const _h = UI.editHint; UI.editHint = function () { const h = document.getElementById('editHint'); if (h && EDIT.on && EDIT.tool === 'bridge') { h.textContent = EDIT._bh || TOOLS.find(t => t.id === 'bridge').hint; return; } return _h.apply(this, arguments); }; }
{ const _p = UI.editPanel; UI.editPanel = function () { _p.apply(this, arguments); if (!EDIT.on) return; const sb = document.querySelector('#editp .sub'); if (!sb) return;
  if (EDIT.tool === 'bridge') { const lv = GAME.level();
    sb.insertAdjacentHTML('afterbegin', `<div class="seg brseg">${Object.entries(BTYPES).map(([k, T]) => `<button data-bt="${k}" class="${BRG.mode === 'build' && BRG.type === k ? 'on' : ''} ${T.lv <= lv ? '' : 'lk'}" title="${T.note}">${T.lv <= lv ? T.icon : '🔒'}${T.name}</button>`).join('')}<button data-bt="__rm" class="${BRG.mode === 'remove' ? 'on' : ''}">🔨 こわす</button></div>${BRG.a ? '<button data-bt="__cancel">やめる</button>' : ''}`);
    sb.querySelectorAll('[data-bt]').forEach(el => el.onclick = e => { e.stopPropagation(); const k = el.dataset.bt; if (k === '__rm') { BRG.mode = BRG.mode === 'remove' ? 'build' : 'remove'; BRG.a = null; } else if (k === '__cancel') BRG.a = null; else { const T = BTYPES[k]; if (T.lv > GAME.level()) { UI.toast(`${T.name}は元気度Lv${T.lv}でかけられるようになります`); return; } BRG.type = k; BRG.mode = 'build'; } EDIT._bh = null; UI.editPanel(); document.getElementById('c').focus(); }); }
  if (EDIT.tool === 'fill' && NATURE.falls) { const alive = NATURE.falls.alive !== false;
    sb.insertAdjacentHTML('afterbegin', `<button data-fl="${alive ? 'rm' : 'back'}" title="${alive ? '滝の上の川をうめて、滝をなくします' : '滝と滝の上の川を最初の形にもどします'}">${alive ? '🌊 滝をなくす' : '💧 滝をもとにもどす'}</button>`);
    sb.querySelector('[data-fl]').onclick = e => { e.stopPropagation(); if (e.currentTarget.dataset.fl === 'rm') NATURE.removeFalls(); else NATURE.restoreFalls(); UI.editPanel(); document.getElementById('c').focus(); }; } }; }
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' || !EDIT.on || e.repeat) return; if (e.code === 'KeyG') setTool('bridge'); if (e.code === 'Escape' && EDIT.tool === 'bridge' && BRG.a) { BRG.a = null; UI.editPanel(); } });
// ---------- save / undo ----------
{ const _s = snapshot; snapshot = function () { const s = _s(); s.bridges = BRG.list.map(brClean); return s; }; }
{ const _r = restore; restore = function (s) { _r(s); BRG.list = (s.bridges || []).map(q => brPrep(brClean(q))); BRG.a = null; BRG.rebuild(); }; }
saveWorld = function () { try { const s = snapshot(); localStorage.setItem(SAVE_KEY, JSON.stringify({ v: GEN_VER, H: toB64(s.H), Wl: toB64(s.Wl), roads: s.roads, removed: toB64(s.removed), trees: s.trees, bridges: s.bridges })); } catch (e) { } };
loadWorld = function () {
  let d = null; try { d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { d = null; } if (!d || d.v !== GEN_VER) return;
  try { const H = fromB64(d.H, Float32Array), Wl = fromB64(d.Wl, Float32Array), rm = fromB64(d.removed, Uint8Array); if (H.length !== G.H.length || rm.length > VEG.removed.length) return; restore({ H, Wl, roads: d.roads || [], removed: rm, trees: d.trees || [], bridges: d.bridges || [] }); } catch (e) { console.warn('loadWorld', e); }
};
// ---------- maps ----------
{ const _dm = GAME.drawMap; GAME.drawMap = function (cv, stat) { const r = _dm.apply(this, arguments); try { if (!BRG.list.length) return r; const E = 246, S = cv.width / (2 * E), ctx = cv.getContext('2d'), P = (x, z) => [(x + E) * S, (z + E) * S]; ctx.lineCap = 'butt';
  for (const pass of [0, 1]) for (const b of BRG.list) { const T = BTYPES[b.type]; ctx.beginPath(); ctx.moveTo(...P(b.ax, b.az)); ctx.lineTo(...P(b.bx, b.bz)); ctx.lineWidth = Math.max(3, (T.w + (pass ? 0 : 1.2)) * S); ctx.strokeStyle = pass ? ({ wood: '#c8925a', taiko: '#e0482c', rope: '#d8b884', stone: '#d8d0c0', road: '#eef0f2' })[b.type] : 'rgba(40,30,20,0.8)'; ctx.stroke(); } } catch (e) { } return r; }; }
// ---------- 滝をなくす / もどす ----------
// the curtain is built from the island's original shape, then shown only while there is still water above the lip
{ const _mf = NATURE.makeFalls; NATURE.makeFalls = function () { const H = G.H, W = G.Wl; G.H = G.H0; G.Wl = G.Wl0; try { _mf.apply(this, arguments); } finally { G.H = H; G.Wl = W; } NATURE.fallsCheck(true); }; }
NATURE.fallsSeeds = function (W) { const F = NATURE.falls, { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, out = [];
  for (let a = -F.W / 2; a <= F.W / 2 + 1e-6; a += 1) for (const back of [0.5, 2, 4]) { const x = F.top.x - FALLS.tx * back - FALLS.tz * a, z = F.top.z - FALLS.tz * back + FALLS.tx * a, i = Math.round((x - h0) / cell), j = Math.round((z - h0) / cell), k = j * n + i; if (!isNaN(W[k]) && W[k] > F.Lt - 1.0) out.push(k); }
  return out; };
NATURE.fallsCells = function (W) { const F = NATURE.falls, { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, seen = new Set(NATURE.fallsSeeds(W)), q = [...seen];
  while (q.length) { const k = q.pop(), i = k % n, j = (k - i) / n; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue; const kk = jj * n + ii; if (seen.has(kk) || isNaN(W[kk]) || W[kk] < F.Lt - 1.0) continue; if (Math.hypot(h0 + ii * cell - F.top.x, h0 + jj * cell - F.top.z) > 150) continue; seen.add(kk); q.push(kk); } }
  return [...seen]; };
NATURE.fallsAlive = function () { const F = NATURE.falls; if (!F) return false; const H = G.H, W = G.Wl; if (!NATURE.fallsSeeds(W).some(k => W[k] > H[k] + 0.05)) return false;
  const bx = F.top.x + FALLS.tx * 3, bz = F.top.z + FALLS.tz * 3, Lb = waterLevelAt(G, bx, bz), sb = Math.max(groundH(bx, bz), isNaN(Lb) ? -99 : Lb); return sb < F.Lt - 1.0; };
NATURE.fallsCheck = function (quiet) { const F = NATURE.falls; NATURE._fchk = false; if (!F) return; const alive = NATURE.fallsAlive(); if (GAME.LM && GAME.LM.falls) GAME.LM.falls.gone = !alive; if (alive === F.alive) return; const first = F.alive === undefined; F.alive = alive; F.grp.visible = alive;
  if (GAME.LM && GAME.LM.falls) GAME.LM.falls.gone = !alive; GAME.mapDirty = true; if (!first && !quiet && EDIT.on) UI.toast(alive ? '💧 滝がもどりました' : '滝がなくなりました（「ひとつもどす」で元にもどせます）'); if (EDIT.on) UI.editPanel(); };
NATURE.removeFalls = function () { const F = NATURE.falls; if (!F) return; if (!GAME.openAt(F.top.x, F.top.z)) { UI.toast(GAME.lockText(F.top.x, F.top.z)); return; }
  const cells = NATURE.fallsCells(G.Wl); if (!cells.length) { UI.toast('滝の上に水がありません'); return; } pushUndo(); const { n } = WORLD; let i0 = n, j0 = n, i1 = 0, j1 = 0;
  for (const k of cells) { G.H[k] = Math.max(G.H[k], G.Wl[k] + 0.25); G.Wl[k] = NaN; const i = k % n, j = (k - i) / n; i0 = Math.min(i0, i); j0 = Math.min(j0, j); i1 = Math.max(i1, i); j1 = Math.max(j1, j); }
  refreshRegion(i0 - 2, j0 - 2, i1 + 2, j1 + 2); scheduleSave(); NATURE.fallsCheck(true); UI.toast('🌊 滝の上の川をうめて、滝をなくしました（「ひとつもどす」で元にもどせます）'); };
NATURE.restoreFalls = function () { const F = NATURE.falls; if (!F) return; const { n } = WORLD, base = NATURE.fallsCells(G.Wl0), set = new Set(); for (const k of base) { const i = k % n, j = (k - i) / n; for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) { const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < n && jj < n) set.add(jj * n + ii); } }
  { const fx = F.top.x + FALLS.tx * 3, fz = F.top.z + FALLS.tz * 3, [ci, cj] = toIdx(fx, fz); for (let b = -6; b <= 6; b++) for (let a = -6; a <= 6; a++) { const ii = ci + a, jj = cj + b; if (ii >= 0 && jj >= 0 && ii < n && jj < n) set.add(jj * n + ii); } }
  pushUndo(); let i0 = n, j0 = n, i1 = 0, j1 = 0; for (const k of set) { G.H[k] = G.H0[k]; G.Wl[k] = G.Wl0[k]; const i = k % n, j = (k - i) / n; i0 = Math.min(i0, i); j0 = Math.min(j0, j); i1 = Math.max(i1, i); j1 = Math.max(j1, j); }
  refreshRegion(i0 - 2, j0 - 2, i1 + 2, j1 + 2); scheduleSave(); NATURE.fallsCheck(true); UI.toast(NATURE.falls.alive ? '💧 滝をもとにもどしました' : '滝をもどせませんでした（まわりの地形を変えすぎているかも）'); };
{ const _rr = refreshRegion; refreshRegion = function () { const r = _rr.apply(this, arguments); NATURE._fchk = true; return r; }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); if (NATURE._fchk && NATURE.falls) { try { NATURE.fallsCheck(); } catch (e) { } } return r; }; }
// the morning request and the letters skip a waterfall that is gone
{ const m = DAILY_POOL.find(q => q.id === 'falls'); if (m) { const n0 = m.need; m.need = p => !(GAME.LM && GAME.LM.falls && GAME.LM.falls.gone) && (!n0 || n0(p)); } }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); NATURE._fchk = true; return r; }; }
