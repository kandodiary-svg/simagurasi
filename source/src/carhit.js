// ===== ver.43: cars never sink into each other =====
// Your car, the island bus, traffic and parked cars are oriented boxes (separating-axis test).
// - your car may not make an overlap deeper (so it can always back out / drive away)
// - anything still overlapping is pushed apart every frame
// - the bus and traffic brake for your car and never push into it
const CARHIT = { pad: 0.04 };
CARHIT.box = (x, z, rot, hl, hw) => ({ x, z, s: Math.sin(rot), c: Math.cos(rot), hl, hw });
// smallest push that moves A out of B → { d, nx, nz } (n points from B towards A), or null when apart
CARHIT.sat = function (A, B) {
  const dx = A.x - B.x, dz = A.z - B.z; let best = null;
  for (const [ax, az] of [[A.s, A.c], [A.c, -A.s], [B.s, B.c], [B.c, -B.s]]) {
    const ra = A.hl * Math.abs(A.s * ax + A.c * az) + A.hw * Math.abs(A.c * ax - A.s * az);
    const rb = B.hl * Math.abs(B.s * ax + B.c * az) + B.hw * Math.abs(B.c * ax - B.s * az);
    const p = dx * ax + dz * az, o = ra + rb - Math.abs(p);
    if (o <= 0) return null;
    if (!best || o < best.d) { const g = p >= 0 ? 1 : -1; best = { d: o, nx: ax * g, nz: az * g }; }
  }
  return best;
};
CARHIT.mine = (v, x, z, rot) => CARHIT.box(x, z, rot, (VSPEC.truck.len || 1.65) + CARHIT.pad, (VSPEC.truck.wid || 0.74) + CARHIT.pad);
CARHIT.BUS = [4.62, 1.2];
// every other car-like thing near (x,z)
CARHIT.others = function (self, x, z, y) {
  const O = [], add = (o, ox, oz, oy, rot, hl, hw) => {
    if (o === self || !isFinite(ox) || !isFinite(oz)) return; if (Math.hypot(ox - x, oz - z) > hl + 4) return;
    if (isFinite(y) && isFinite(oy) && Math.abs(oy - y) > 2.6) return; // under / over a bridge
    O.push({ o, y: oy, b: CARHIT.box(ox, oz, rot || 0, hl, hw) });
  };
  if (typeof DV !== 'undefined' && DV.bus) add(DV.bus, DV.bus.x, DV.bus.z, DV.bus.y, DV.bus.rot, CARHIT.BUS[0], CARHIT.BUS[1]);
  if (typeof BUSX !== 'undefined' && BUSX.extra) for (const b of BUSX.extra) add(b, b.x, b.z, b.y, b.rot, CARHIT.BUS[0], CARHIT.BUS[1]);
  if (typeof TRF !== 'undefined') for (const c of (TRF.cars || []).concat(TRF.parked || [])) { const T = CAR_TYPES[c.type] || CAR_TYPES.kei; add(c, c.x, c.z, c.y, c.rot, T.L / 2 + 0.02, T.W / 2 + 0.02); }
  for (const v of VEH) if (v.kind === 'truck' && v !== self) add(v, v.x, v.z, v.y, v.rot, VSPEC.truck.len, VSPEC.truck.wid);
  return O;
};
// how deep your car would be inside other cars at this pose (sum of overlaps)
CARHIT.pen = function (v, x, z, rot) {
  if (!isFinite(x) || !isFinite(z)) return 0; const A = CARHIT.mine(v, x, z, rot); let d = 0;
  for (const q of CARHIT.others(v, x, z, v.y)) { const h = CARHIT.sat(A, q.b); if (h) d += h.d; }
  for (const q of CARHIT.people(v)) { if (Math.abs(q.x - x) > 6 || Math.abs(q.z - z) > 6 || (isFinite(v.y) && Math.abs(q.y - v.y) > 2.6)) continue; const h = CARHIT.circ(A, q.x, q.z, CARHIT.PR); if (h) d += h.d; }
  return d;
};
// replaces the old "2.6 m from the bus centre / 2.3 m from a traffic car centre" checks
{ const _ok = vehOK; CARHIT.ground = _ok; vehOK = function (v, x, z, rot) {
  if (!v || v.kind !== 'truck') return _ok.apply(this, arguments);
  if (!_ok.apply(this, arguments)) return false;
  if (rot === undefined) rot = v.rot;
  const pn = CARHIT.pen(v, x, z, rot); if (pn <= 0.002) return true;
  const cur = isFinite(v.x) ? CARHIT.pen(v, v.x, v.z, v.rot) : 0;
  return pn < cur - 0.002; // already touching: only moves that get you out
}; }
// push your car out of anything it is still inside (spawned on top of it, the bus turned into it, …)
CARHIT.resolve = function (v) {
  if (!v || v.kind !== 'truck' || !isFinite(v.x)) return;
  for (let it = 0; it < 4; it++) {
    const A = CARHIT.mine(v, v.x, v.z, v.rot); let hit = null;
    for (const q of CARHIT.others(v, v.x, v.z, v.y)) { const h = CARHIT.sat(A, q.b); if (h && (!hit || h.d > hit.d)) hit = h; }
    if (!hit) return;
    const k = hit.d + 0.03; let moved = false;
    for (const f of [1, 0.5]) { const nx = v.x + hit.nx * k * f, nz = v.z + hit.nz * k * f; if (CARHIT.ground(v, nx, nz, v.rot)) { v.x = nx; v.z = nz; moved = true; break; } }
    const fx = Math.sin(v.rot), fz = Math.cos(v.rot); if ((fx * hit.nx + fz * hit.nz) * v.v < 0) v.v = 0; // no speed into the obstacle
    if (!moved) return;
    if (PL.veh === v) { PL.x = v.x; PL.z = v.z; }
  }
};
{ const _pv = placeVehicle; placeVehicle = function (v, dt) { try { CARHIT.resolve(v); } catch (e) { } return _pv.apply(this, arguments); }; }

// ---- the others give way ----
// your car(s) as boxes
CARHIT.mineAll = function (bus) { const R = []; for (const v of VEH) if (v.kind === 'truck' && isFinite(v.x)) R.push({ v, b: CARHIT.mine(v, v.x, v.z, v.rot) });
  for (const q of CARHIT.people(bus)) R.push({ v: { y: q.y, x: q.x, z: q.z }, b: CARHIT.box(q.x, q.z, 0, CARHIT.PR, CARHIT.PR), person: 1 }); return R; };
// overlap of a box with your car(s)
CARHIT.vsMine = function (B, y, M) { let d = 0; for (const m of M) { if (isFinite(y) && isFinite(m.v.y) && Math.abs(m.v.y - y) > 2.6) continue; const h = CARHIT.sat(B, m.b); if (h) d += h.d; } return d; };
// a box stretched ahead of a vehicle by `ahead` metres
CARHIT.ahead = function (x, z, rot, hl, hw, ahead, dir) { const g = dir < 0 ? -1 : 1, s = Math.sin(rot), c = Math.cos(rot), h = ahead / 2; return CARHIT.box(x + s * h * g, z + c * h * g, rot, hl + h, hw + 0.15); };

// island bus: brake when your car is in its path, never drive deeper into it
{ const _ub = GAME.updateBus; GAME.updateBus = function (dt) {
  const B = DV.bus; if (!B || B.x === undefined || !B.mesh) return _ub.apply(this, arguments);
  const M = CARHIT.mineAll(B).filter(m => PL.veh !== B || m.v !== PL.veh); if (!M.length) return _ub.apply(this, arguments);
  const d = dt || 0.016, [hl, hw] = CARHIT.BUS;
  if (!(B.wait > 0)) { const look = 1.2 + (B.v || 0) * (B.v || 0) / 9; if (CARHIT.vsMine(CARHIT.ahead(B.x, B.z, B.rot, hl, hw, look, 1), B.y, M) > 0) B.v = Math.max(0, (B.v || 0) - 7 * d); }
  const before = CARHIT.vsMine(CARHIT.box(B.x, B.z, B.rot, hl, hw), B.y, M);
  const sv = { s: B.s, v: B.v, dir: B.dir, at: B.at, wait: B.wait, stop: B.stop, x: B.x, z: B.z, y: B.y, rot: B.rot };
  const r = _ub.apply(this, arguments);
  const after = CARHIT.vsMine(CARHIT.box(B.x, B.z, B.rot, hl, hw), B.y, M);
  if (after > before + 0.002) { // would push into your car: stay put
    Object.assign(B, sv); B.v = 0; B.mesh.position.set(B.x, B.y, B.z); B.mesh.rotation.set(0, B.rot, 0);
    if (PL.veh === B) { PL.x = B.x; PL.z = B.z; PL.rot = B.rot; }
    B._yieldT = (B._yieldT || 0) + d; if (B._yieldT > 4 && !B._honk) { B._honk = 1; try { SND.play('ui_confirmation2', { vol: 0.3, rate: 0.6 }); } catch (e) { } }
  } else { B._yieldT = 0; B._honk = 0; }
  return r;
}; }

// traffic: same rule
{ const _tu = TRF.update; TRF.update = function (dt) {
  const M = CARHIT.mineAll(); if (!M.length || !TRF.cars || !TRF.cars.length || !CARX.ok || !GAME.p) return _tu.apply(this, arguments);
  const d = dt || 0.016, near = TRF.cars.filter(c => c.x !== undefined && M.some(m => Math.hypot(m.v.x - c.x, m.v.z - c.z) < 14)), sv = new Map();
  for (const c of near) {
    const T = CAR_TYPES[c.type] || CAR_TYPES.kei, look = 1.0 + (c.v || 0) * (c.v || 0) / 12;
    if (CARHIT.vsMine(CARHIT.ahead(c.x, c.z, c.rot, T.L / 2, T.W / 2, look, 1), c.y, M) > 0) c.v = Math.max(0, (c.v || 0) - 9 * d);
    sv.set(c, { s: c.s, r: c.r, L: c.L, dir: c.dir, v: c.v, block: c.block, pre: CARHIT.vsMine(CARHIT.box(c.x, c.z, c.rot, T.L / 2, T.W / 2), c.y, M) });
  }
  const r = _tu.apply(this, arguments);
  for (const [c, o] of sv) {
    if (!ROADS.includes(c.r)) continue; TRF.pose(c); const T = CAR_TYPES[c.type] || CAR_TYPES.kei;
    if (CARHIT.vsMine(CARHIT.box(c.x, c.z, c.rot, T.L / 2, T.W / 2), c.y, M) > o.pre + 0.002) {
      Object.assign(c, { s: o.s, r: o.r, L: o.L, dir: o.dir, v: 0 }); TRF.pose(c);
      c._yieldT = (c._yieldT || 0) + d;
      if (c._yieldT > 6) { c._yieldT = 0; // waited long enough: turn round (if that lane is clear of your car)
        if (Math.hypot(c.x - PL.x, c.z - PL.z) > 70) TRF.spawn(c, true);
        else { const s0 = c.s; c.dir = -c.dir; c.s = clamp(c.s, 2.2, c.L - 2.2); TRF.pose(c); if (CARHIT.vsMine(CARHIT.box(c.x, c.z, c.rot, T.L / 2, T.W / 2), c.y, M) > o.pre + 0.002) { c.dir = -c.dir; c.s = s0; TRF.pose(c); } } }
    } else c._yieldT = 0;
  }
  return r;
}; }

// ===== ver.44: people never sink into cars =====
// you (on foot) and the villagers are circles; cars are the same boxes as above (your own car, the bus, traffic, parked cars)
CARHIT.PR = 0.32;
// circle (x,z,r) against box B → push for the circle { d, nx, nz } or null
CARHIT.circ = function (B, x, z, r) {
  const dx = x - B.x, dz = z - B.z, a = dx * B.s + dz * B.c, b = dx * B.c - dz * B.s, ca = clamp(a, -B.hl, B.hl), cb = clamp(b, -B.hw, B.hw), ea = a - ca, eb = b - cb, d = Math.hypot(ea, eb);
  if (d > 1e-6) { if (d >= r) return null; const na = ea / d, nb = eb / d; return { d: r - d, nx: na * B.s + nb * B.c, nz: na * B.c - nb * B.s }; }
  const pa = B.hl - Math.abs(a), pb = B.hw - Math.abs(b);
  if (pa < pb) { const g = Math.sign(a) || 1; return { d: pa + r, nx: g * B.s, nz: g * B.c }; }
  const g = Math.sign(b) || 1; return { d: pb + r, nx: g * B.c, nz: -g * B.s };
};
// who is walking around (not riding, not indoors)
CARHIT.walking = () => !PL.veh && !GAME.inside && !(typeof BUS2 !== 'undefined' && BUS2.anim);
CARHIT.people = function (bus) {
  const P = []; if (!GAME.p) return P;
  if (CARHIT.walking() && !(bus && typeof BUS2 !== 'undefined' && BUS2.anim)) P.push({ x: PL.x, z: PL.z, y: PL.y, pl: 1 });
  for (const n of NPCS) if (!n.inRoom && !n.seat && n.mesh && n.mesh.visible && isFinite(n.x)) P.push({ x: n.x, z: n.z, y: n.y, n });
  return P;
};
// how deep a person standing at (x,z) would be inside cars
CARHIT.cars = function (x, z) { const O = CARHIT.others(null, x, z); if (!O.length) return O; const y = standY(x, z); return O.filter(q => !isFinite(q.y) || Math.abs(q.y - y) < 2.6); };
CARHIT.ppen = function (x, z) { let d = 0; for (const q of CARHIT.cars(x, z)) { const h = CARHIT.circ(q.b, x, z, CARHIT.PR); if (h) d += h.d; } return d; };
// walking into a car is like walking into a wall (people slide along it; villagers walk round it)
{ const _cw = canWalk; CARHIT.walk0 = _cw; canWalk = function (x0, z0, x1, z1) {
  if (!_cw.apply(this, arguments)) return false;
  try { const p1 = CARHIT.ppen(x1, z1); if (p1 <= 0.002) return true; return p1 < CARHIT.ppen(x0, z0) - 0.002; } catch (e) { return true; } }; }
// still inside one (a car stopped on you, you got out between two cars…): step out of it
CARHIT.unstick = function (x, z) {
  for (let it = 0; it < 3; it++) { let hit = null; for (const q of CARHIT.cars(x, z)) { const h = CARHIT.circ(q.b, x, z, CARHIT.PR); if (h && (!hit || h.d > hit.d)) hit = h; } if (!hit) break;
    const k = Math.min(1.2, hit.d + 0.02); let moved = false;
    for (const f of [1, 0.6, 0.3]) { const nx = x + hit.nx * k * f, nz = z + hit.nz * k * f, [qx, qz] = pushOut(nx, nz, 0.3); if (Math.hypot(qx - nx, qz - nz) < 0.01 && CARHIT.walk0(x, z, nx, nz)) { x = nx; z = nz; moved = true; break; } }
    if (!moved) { x += hit.nx * k; z += hit.nz * k; break; } }   // nowhere better: out of the car anyway
  return [x, z];
};
{ const _up = updatePlayer; updatePlayer = function () { const r = _up.apply(this, arguments);
  try { if (CARHIT.walking() && GAME.p) { const [x, z] = CARHIT.unstick(PL.x, PL.z); if (x !== PL.x || z !== PL.z) { PL.x = x; PL.z = z; PL.y = Math.max(PL.y, standY(x, z)); PL.mesh.position.x = x; PL.mesh.position.z = z; } } } catch (e) { }
  return r; }; }
{ const _uv = updateVillagers; updateVillagers = function () { const r = _uv.apply(this, arguments);
  try { if (GAME.p && !GAME.inside) for (const n of NPCS) { if (n.inRoom || n.seat || !n.mesh || !n.mesh.visible || !isFinite(n.x)) continue; const [x, z] = CARHIT.unstick(n.x, n.z); if (x !== n.x || z !== n.z) { n.x = x; n.z = z; n.mesh.position.x = x; n.mesh.position.z = z; } } } catch (e) { }
  return r; }; }
