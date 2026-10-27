// ===================== ver.43: road junctions done properly =====================
// Every place where car roads meet becomes one junction: a T (a road ending on another road's side),
// a node (several road ends at one point: corners, width changes, Y / crossroads), or a crossroads (two T's facing each other).
// Each junction: the roads are cut back, one paved "plate" fills the middle with rounded kerbs (curb returns),
// and the sidewalks wrap round the corners instead of running across the mouths of other roads.
const JN = { list: [], walk: [], group: null };
JN.R = { asphalt: 3.0, stone: 2.6, gravel: 1.8, dirt: 1.6 };   // kerb radius at corners
JN.H = 0.16;                                                     // sidewalk height
const jnYl = r => { const t = rType(r); return t === 'dirt' || t === 'trail' || t === 'gravel' ? 0.03 : 0.04; };
// what runs along the road edge: a sidewalk, the small kerb of the island's original roads, or nothing
const jnEdge = r => r.side ? SIDEW : (!r.user && !r.dev && !isFoot(r) && rType(r) === 'asphalt' ? 0.25 : 0);
const jnWrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a <= -Math.PI) a += 2 * Math.PI; return a; };
// 2 lines A + dA·t = B + dB·u → { t, u } (null when parallel)
function jnCross(A, dA, B, dB) { const det = -dA[0] * dB[1] + dA[1] * dB[0]; if (Math.abs(det) < 1e-4) return null; const ex = B[0] - A[0], ez = B[1] - A[1]; return { t: (-ex * dB[1] + ez * dB[0]) / det, u: (dA[0] * ez - dA[1] * ex) / det }; }

// ---------- finding the junctions ----------
JN.find = function () {
  const car = ROADS.filter(r => !isFoot(r) && rLen(r) >= 2), ends = [], J = [];
  for (const r of car) { const n = r.pts.length; ends.push({ r, e: 0, x: r.pts[0][0], z: r.pts[0][1], y: r.h[0] }, { r, e: 1, x: r.pts[n - 1][0], z: r.pts[n - 1][1], y: r.h[n - 1] }); }
  // road ends at (almost) the same point
  const used = new Set(), groups = [];
  for (let a = 0; a < ends.length; a++) { if (used.has(a)) continue; const g = [ends[a]]; used.add(a);
    for (let grow = true; grow;) { grow = false; for (let b = 0; b < ends.length; b++) if (!used.has(b) && g.some(o => Math.hypot(o.x - ends[b].x, o.z - ends[b].z) < 2.6)) { g.push(ends[b]); used.add(b); grow = true; } }
    groups.push(g); }
  for (const g of groups) {
    const cx = g.reduce((s, o) => s + o.x, 0) / g.length, cz = g.reduce((s, o) => s + o.z, 0) / g.length;
    // ... lying on the side of another road?
    let body = null; for (const q of car) { if (g.some(o => o.r === q)) continue; const bx = rBox(q); if (cx < bx[0] - 8 || cx > bx[2] + 8 || cz < bx[1] - 8 || cz > bx[3] + 8) continue;
      const pr = rProject(q, cx, cz), Lq = rLen(q); if (pr.d > q.w / 2 + 0.9 || pr.s < 1.0 || pr.s > Lq - 1.0) continue; if (!body || pr.d < body.pr.d) body = { q, pr }; }
    if (g.length < 2 && !body) continue;
    J.push({ ends: g, body, x: body ? body.pr.x : cx, z: body ? body.pr.z : cz });
  }
  // two T's on opposite sides of one road, close together → one crossroads
  for (let i = 0; i < J.length; i++) for (let k = i + 1; k < J.length; k++) { const a = J[i], b = J[k]; if (!a || !b || !a.body || !b.body || a.body.q !== b.body.q) continue;
    const ha = Math.max(...a.ends.map(o => o.r.w / 2)), hb = Math.max(...b.ends.map(o => o.r.w / 2)); if (Math.abs(a.body.pr.s - b.body.pr.s) > ha + hb + 1.5) continue;
    const q = a.body.q, [tx, tz] = rTan(q, a.body.pr.s), side = o => Math.sign((o.x - a.body.pr.x) * -tz + (o.z - a.body.pr.z) * tx) || 1;
    if (a.ends.some(o => b.ends.some(p => side(o) === side(p)))) continue;
    const s = (a.body.pr.s + b.body.pr.s) / 2, p = rAt(q, s); J[i] = { ends: a.ends.concat(b.ends), body: { q, pr: { s, x: p.x, z: p.z, y: p.y, d: 0 } }, x: p.x, z: p.z }; J[k] = null; }
  return J.filter(Boolean);
};
// ---------- arms, cut-backs, plate & kerb outline ----------
JN.arms = function (j) {
  const A = [];
  const mk = (r, sgn, s0, O, end) => { const L = rLen(r), sa = clamp(s0 + sgn * 3, 0, L), [tx, tz] = rTan(r, sa), d = [tx * sgn, tz * sgn]; return { r, sgn, s0, O, end, d, th: Math.atan2(d[0], d[1]), h: r.w / 2, sw: jnEdge(r), type: rType(r), need: 0.6, L }; };
  for (const o of j.ends) A.push(mk(o.r, o.e ? -1 : 1, o.e ? rLen(o.r) : 0, [o.x, o.z], o.e));
  if (j.body) { const { q, pr } = j.body; A.push(mk(q, 1, pr.s, [pr.x, pr.z], null), mk(q, -1, pr.s, [pr.x, pr.z], null)); }
  A.sort((a, b) => a.th - b.th); return A;
};
JN.layout = function (j) {
  const A = j.arms = JN.arms(j), m = A.length, P = [j.x, j.z]; if (m < 2) return false;
  // arms must leave the centre in clearly different directions
  for (let k = 0; k < m; k++) { const a = A[k], b = A[(k + 1) % m]; let ph = b.th - a.th; if (k === m - 1) ph += 2 * Math.PI; if (ph < 0.33) return false; }
  // an arm's own start: road ends that stop short of the centre count from where they are
  // cut-backs are measured along each arm from its own origin O (the road end, or the centre for a road passing through)
  // hard = what the corners need without their kerb radius; need = with it
  for (const a of A) { a.off = (a.O[0] - P[0]) * a.d[0] + (a.O[1] - P[1]) * a.d[1]; a.need = a.hard = a.end === null ? 0.6 : Math.max(0, -a.off) + 0.6; }
  j.corners = [];
  for (let k = 0; k < m; k++) {
    const a = A[k], b = A[(k + 1) % m]; let ph = b.th - a.th; if (k === m - 1) ph += 2 * Math.PI;
    const na = [a.d[1], -a.d[0]], nb = [b.d[1], -b.d[0]];   // toward increasing angle
    const EA = [a.O[0] + na[0] * a.h, a.O[1] + na[1] * a.h], EB = [b.O[0] - nb[0] * b.h, b.O[1] - nb[1] * b.h];
    const c = { a, b, ph, kind: 'straight' };
    if (ph < Math.PI - 0.3) { const X = jnCross(EA, a.d, EB, b.d);
      if (X) { let R = Math.min(JN.R[a.type] || 2.6, JN.R[b.type] || 2.6), lam = R / Math.tan(ph / 2); if (lam > 9) { lam = 9; R = lam * Math.tan(ph / 2); }
        const K = [EA[0] + a.d[0] * X.t, EA[1] + a.d[1] * X.t];
        Object.assign(c, { kind: 'in', R, lam, lam0: lam, K, xt: X.t, xu: X.u, tA: X.t + lam, tB: X.u + lam });
        a.hard = Math.max(a.hard, X.t + 0.15); b.hard = Math.max(b.hard, X.u + 0.15); a.need = Math.max(a.need, X.t + lam); b.need = Math.max(b.need, X.u + lam); } }
    else if (ph > Math.PI + 0.3) c.kind = 'out';
    else { const taper = Math.max(1.0, 2.6 * Math.abs(a.h - b.h) + 1.2 * Math.abs(a.sw - b.sw)); a.need = Math.max(a.need, taper - a.off); b.need = Math.max(b.need, taper - b.off); }
    j.corners.push(c);
  }
  return true;
};
// where each arm's road strip now starts/ends (station on its road)
JN.cutStation = (a, t) => a.s0 + a.sgn * Math.max(0, t);
// a point on an arm's edge at distance t from its origin; side +1 = toward the next arm (increasing angle), -1 = toward the previous one
JN.edge = function (a, side, t) {
  const s = JN.cutStation(a, t), p = rAt(a.r, s), [tx, tz] = rTan(a.r, s), d = [tx * a.sgn, tz * a.sgn], n = [d[1] * side, -d[0] * side];
  return { p: [p.x + n[0] * a.h, p.z + n[1] * a.h], N: n, y: p.y, c: [p.x, p.z], d, h: a.h };
};
JN.edgeRun = function (a, side, t0, t1) { if (Math.abs(t1 - t0) < 0.05) return [JN.edge(a, side, t0)]; const n = Math.max(1, Math.ceil(Math.abs(t1 - t0) / 0.9)), out = []; for (let i = 0; i <= n; i++) out.push(JN.edge(a, side, t0 + (t1 - t0) * i / n)); return out; };
// a smooth curve between two edge points (pts get an outward normal pointing away from the centre)
JN.curve = function (A, B, P, ctrl) {
  const out = [], N = ctrl.length === 2 ? 10 : 8;
  for (let i = 1; i < N; i++) { const t = i / N, u = 1 - t; let x, z;
    if (ctrl.length === 2) { const [C1, C2] = ctrl; x = u * u * u * A.p[0] + 3 * u * u * t * C1[0] + 3 * u * t * t * C2[0] + t * t * t * B.p[0]; z = u * u * u * A.p[1] + 3 * u * u * t * C1[1] + 3 * u * t * t * C2[1] + t * t * t * B.p[1]; }
    else if (ctrl.length === 1) { const C = ctrl[0]; x = u * u * A.p[0] + 2 * u * t * C[0] + t * t * B.p[0]; z = u * u * A.p[1] + 2 * u * t * C[1] + t * t * B.p[1]; }
    else { x = lerp(A.p[0], B.p[0], t); z = lerp(A.p[1], B.p[1], t); }
    out.push({ p: [x, z], y: lerp(A.y, B.y, t), N: null }); }
  return out;
};
// the outline of a junction: per corner a kerb path from one arm's mouth to the next arm's mouth, following the real road edges
JN.outline = function (j) {
  const P = [j.x, j.z];
  for (const a of j.arms) { a.s = JN.cutStation(a, a.cut); const L = JN.edge(a, 1, a.cut), R = JN.edge(a, -1, a.cut); a.Lm = L.p; a.Rm = R.p; a.y = L.y; a.nn = L.N; a.c = L.c; }
  for (const c of j.corners) {
    const a = c.a, b = c.b; let path;
    if (c.kind === 'in') {
      const tA = clamp(c.tA, 0, a.cut), tB = clamp(c.tB, 0, b.cut), r1 = JN.edgeRun(a, 1, a.cut, tA), r2 = JN.edgeRun(b, -1, tB, b.cut), A = r1[r1.length - 1], B = r2[0];
      const turn = Math.PI - c.ph, k = 4 / 3 * Math.tan(turn / 4) * c.R;
      path = r1.concat(JN.curve(A, B, P, [[A.p[0] - A.d[0] * k, A.p[1] - A.d[1] * k], [B.p[0] - B.d[0] * k, B.p[1] - B.d[1] * k]]), r2);
    } else if (c.kind === 'straight') {
      const r1 = JN.edgeRun(a, 1, a.cut, 0), r2 = JN.edgeRun(b, -1, 0, b.cut).slice(a.r === b.r ? 1 : 0); path = r1.concat(r2);
      if (Math.abs(a.h - b.h) > 0.05) { // width change: taper smoothly from one road's edge to the other's
        const cum = [0]; for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i].c[0] - path[i - 1].c[0], path[i].c[1] - path[i - 1].c[1])); const T = cum[cum.length - 1] || 1;
        path.forEach((q, i) => { const u = cum[i] / T, sm = u * u * (3 - 2 * u), h = lerp(a.h, b.h, sm); q.p = [q.c[0] + q.N[0] * h, q.c[1] + q.N[1] * h]; }); }
    } else {
      const tA = Math.min(a.cut, 0.5), tB = Math.min(b.cut, 0.5), r1 = JN.edgeRun(a, 1, a.cut, tA), r2 = JN.edgeRun(b, -1, tB, b.cut), A = r1[r1.length - 1], B = r2[0];
      const X = jnCross(A.p, [-A.d[0], -A.d[1]], B.p, [-B.d[0], -B.d[1]]), mh = Math.max(a.h, b.h); let ctrl = [];
      if (X && X.t > 0 && X.u > 0) { const Kb = [A.p[0] - A.d[0] * X.t, A.p[1] - A.d[1] * X.t]; if (Math.hypot(Kb[0] - P[0], Kb[1] - P[1]) < 2.5 * mh + 2) ctrl = [Kb]; }
      path = r1.concat(JN.curve(A, B, P, ctrl), r2);
    }
    // outward normals for the curve points (away from the plate)
    for (let i = 0; i < path.length; i++) { const q = path[i]; if (q.N) continue; const q0 = path[Math.max(0, i - 1)].p, q1 = path[Math.min(path.length - 1, i + 1)].p; let nx = q1[1] - q0[1], nz = -(q1[0] - q0[0]); const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l; if ((q.p[0] - P[0]) * nx + (q.p[1] - P[1]) * nz < 0) { nx = -nx; nz = -nz; } q.N = [nx, nz]; }
    c.path = path; c.pts = path.map(q => q.p);
  }
  // plate outline: each arm's mouth (right → left), then the corner path to the next arm
  const out = []; for (let k = 0; k < j.arms.length; k++) { const a = j.arms[k], c = j.corners[k]; out.push({ p: a.Rm, y: a.y }, { p: a.Lm, y: a.y }); for (let i = 1; i < c.path.length - 1; i++) out.push(c.path[i]); }
  j.poly = out.map(q => q.p); j.polyY = out.map(q => q.y);
  j.y = j.arms.reduce((s, a) => s + rAt(a.r, a.s0).y, 0) / j.arms.length;
};
// ---------- building the network (replaces the old T-only buildNet for car roads) ----------
JN.build = function () {
  JN.list = [];
  for (const j of JN.find()) {
    try {
      if (!JN.layout(j)) continue;
      for (const a of j.arms) a.cut = a.need;
      JN.list.push(j);
    } catch (e) { console.warn('junction', e); }
  }
  // cut-backs must fit on each road: two junctions facing each other along a short stretch share it
  // (the kerb radius shrinks first; only then the junction itself)
  const fit = (as, avail) => { const hard = as.reduce((s, a) => s + a.hard, 0), need = as.reduce((s, a) => s + a.cut, 0); if (need <= avail) return;
    if (hard < avail) { const k = (avail - hard) / Math.max(1e-6, need - hard); for (const a of as) a.cut = a.hard + Math.max(0, a.cut - a.hard) * k; }
    else { const k = Math.max(0.05, avail / Math.max(1e-6, need)); for (const a of as) a.cut *= k; } };
  for (const r of ROADS) { const L = rLen(r), its = []; for (const j of JN.list) for (const a of j.arms) if (a.r === r) its.push(a); if (!its.length) continue;
    its.sort((x, y) => x.s0 - y.s0 || x.sgn - y.sgn);
    for (let i = 0; i < its.length; i++) { const a = its[i];
      if (a.sgn > 0) { const b = its.slice(i + 1).find(o => o.s0 > a.s0 + 1e-6 || o.sgn < 0 && o !== a); if (b && b.sgn < 0) fit([a, b], b.s0 - a.s0 - 0.6); else fit([a], (b ? b.s0 : L) - a.s0 - 0.5); }
      else { const b = its.slice(0, i).reverse().find(o => o.s0 < a.s0 - 1e-6); if (!b) fit([a], a.s0 - 0.5); } } }
  for (const j of JN.list) {
    // kerb radius that fits the final cut-backs
    for (const c of j.corners) if (c.kind === 'in') { const lam = Math.max(0.05, Math.min(c.lam0, c.a.cut - c.xt, c.b.cut - c.xu)); c.lam = lam; c.R = lam * Math.tan(c.ph / 2); c.tA = c.xt + lam; c.tB = c.xu + lam; }
    JN.outline(j);
    for (const a of j.arms) { if (a.end !== null) { a.r.trim[a.end] = a.cut; a.r.tAt[a.end] = j; } }
    if (j.body) { const q = j.body.q, as = j.arms.filter(a => a.end === null), lo = Math.min(...as.map(a => a.s)), hi = Math.max(...as.map(a => a.s)); q.cuts.push([lo, hi]); }
    // which arms give way: everything except the straightest pair of the widest roads
    j.minor = [];
    if (j.arms.length >= 3) { let best = null;
      if (j.body) best = j.arms.filter(a => a.end === null);
      else for (let i = 0; i < j.arms.length; i++) for (let k = i + 1; k < j.arms.length; k++) { const a = j.arms[i], b = j.arms[k], dot = a.d[0] * b.d[0] + a.d[1] * b.d[1]; if (dot > -0.6) continue; const sc = -dot + (a.h + b.h) * 0.4; if (!best || sc > best.sc) best = Object.assign([a, b], { sc }); }
      j.minor = j.arms.filter(a => !best || !best.includes(a));
      for (const a of j.minor) if (a.end !== null && rType(a.r) === 'asphalt') a.r.stop[a.end] = { lane: a.r.lines ? (a.end ? 1 : 2) : 0 }; }
  }
};
// ---------- meshes ----------
JN.meshes = function () {
  if (JN.group) { TERR.roadGroup.remove(JN.group); JN.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  const g = JN.group = new THREE.Group(); TERR.roadGroup.add(g); JN.walk = [];
  for (const j of JN.list) { try { JN.meshOne(j, g); } catch (e) { console.warn('junction mesh', e); } }
  for (const r of ROADS) for (const e of [0, 1]) if (!r.tAt[e] && r.side && !isFoot(r) && !(r === ROADS[0] && !r.user && e === 1)) { const P = e ? r.pts[r.pts.length - 1] : r.pts[0]; if (typeof OHB !== 'undefined' && OHB.roadEnd && OHB.roadEnd(P[0], P[1])) continue; try { JN.cul(r, e, g); } catch (e2) { } }
};
JN.tri = function (pos, idx, mat, g) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos.p, 3)); if (pos.i) geo.setAttribute('rinfo', new THREE.Float32BufferAttribute(pos.i, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  let up = 0; if (pos.up) { const P = pos.p, I = idx; for (let i = 0; i < I.length; i += 3) { const a = I[i] * 3, b = I[i + 1] * 3, c = I[i + 2] * 3; up += (P[b + 2] - P[a + 2]) * (P[c] - P[a]) - (P[b] - P[a]) * (P[c + 2] - P[a + 2]); } }
  if (pos.up && up < 0) { const ix = geo.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } geo.computeVertexNormals(); }
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; g.add(m); return m; };
JN.meshOne = function (j, g) {
  const P = j.poly, Y = j.polyY, type = j.arms.some(a => a.type === 'asphalt') ? 'asphalt' : j.arms.slice().sort((a, b) => b.h - a.h)[0].type;
  const yl = Math.min(...j.arms.map(a => jnYl(a.r))), prio = j.arms.some(a => a.r.user) ? 3 : 2;
  // plate: a fan from the centre (the centre sits at the roads' meeting height)
  const pos = [j.x, j.y + yl, j.z], info = [0.5, 0, 6], idx = [], n = P.length; P.forEach((p, i) => { pos.push(p[0], Y[i] + yl, p[1]); info.push(0.5, 0, 6); });
  // winding: make the fan face up
  let area = 0; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
  for (let i = 0; i < n; i++) { const a = 1 + i, b = 1 + (i + 1) % n; if (area > 0) idx.push(0, b, a); else idx.push(0, a, b); }
  const pm = JN.tri({ p: pos, i: info, up: true }, idx, roadMat2(type, { fill: true, prio }), g), nm = pm.geometry.attributes.normal; for (let i = 0; i < nm.count; i++) nm.setXYZ(i, 0, 1, 0); // even shading across the long fan triangles
  const T = []; for (let i = 0; i < idx.length; i += 3) T.push([idx[i], idx[i + 1], idx[i + 2]].map(v => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]])); JN.addWalk(T);
  j.tris = T.map(t => ({ t, dy: 0.12 })); for (const c of j.corners) JN.kerb(j, c, g, yl, prio);
};
// a sidewalk band (or the small kerb) along a corner's kerb path, widths blending from one arm to the next
JN.kerb = function (j, c, g, yl, prio) {
  const a = c.a, b = c.b, wa = a.sw, wb = b.sw; if (wa <= 0 && wb <= 0) return;
  const path = c.path, n = path.length, H = JN.H; if (n < 2) return;
  const cum = [0]; for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(path[i].p[0] - path[i - 1].p[0], path[i].p[1] - path[i - 1].p[1])); const Lt = cum[n - 1] || 1;
  const W = cum.map(s => lerp(wa, wb, s / Lt)), pts = path.map(q => q.p), Yc = path.map(q => q.y); let O = path.map((q, i) => [q.p[0] + q.N[0] * W[i], q.p[1] + q.N[1] * W[i]]);
  // a sharp corner (kerb radius smaller than the sidewalk): the sidewalk fills the gore up to where the two outer edges meet
  if (c.kind === 'in' && c.R < Math.max(wa, wb) * 1.1 && path[0].d && path[n - 1].d) {
    const A = path[0], B = path[n - 1], Oa = [A.p[0] + A.N[0] * wa, A.p[1] + A.N[1] * wa], Ob = [B.p[0] + B.N[0] * wb, B.p[1] + B.N[1] * wb], X = jnCross(Oa, [-A.d[0], -A.d[1]], Ob, [-B.d[0], -B.d[1]]);
    if (X && X.t > 0 && X.u > 0) { const Q = [Oa[0] - A.d[0] * X.t, Oa[1] - A.d[1] * X.t], l1 = X.t, l2 = X.u, LL = l1 + l2;
      O = cum.map(s => { const f = s / Lt * LL; if (f <= l1) { const t = f / l1; return [lerp(Oa[0], Q[0], t), lerp(Oa[1], Q[1], t)]; } const t = (f - l1) / l2; return [lerp(Q[0], Ob[0], t), lerp(Q[1], Ob[1], t)]; }); }
    else O = path.map((q, i) => { const w = Math.min(W[i], c.R * 0.9); return [q.p[0] + q.N[0] * w, q.p[1] + q.N[1] * w]; }); }
  const side = Math.max(wa, wb) > 0.5, pos = [], info = [], idx = [];
  for (let i = 0; i < n; i++) { pos.push(pts[i][0], Yc[i] + H, pts[i][1], O[i][0], Yc[i] + H, O[i][1]); const wi = Math.max(0.2, Math.hypot(O[i][0] - pts[i][0], O[i][1] - pts[i][1])); info.push(0, cum[i], wi, 1, cum[i], wi); if (i) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
  JN.tri({ p: pos, i: info, up: true }, idx, side ? roadMat2('path', { side: true, prio }) : CURB_M(), g);
  const T = []; for (let i = 0; i < idx.length; i += 3) T.push([idx[i], idx[i + 1], idx[i + 2]].map(v => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]])); JN.addWalk(T);
  if (j.tris) for (const t of T) j.tris.push({ t, dy: H - 0.03 });
  const face = (L, y0, y1) => { const ps = [], ix = []; for (let i = 0; i < n; i++) { ps.push(L[i][0], Yc[i] + y0, L[i][1], L[i][0], Yc[i] + y1, L[i][1]); if (i) { const k = (i - 1) * 2; ix.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } } JN.tri({ p: ps }, ix, CURB_M(), g); };
  face(pts, yl - 0.01, H); face(O, H, -0.12);
};
// the sidewalk wraps round a dead end (cul-de-sac)
JN.cul = function (r, e, g) {
  const L = rLen(r), p = rAt(r, e ? L : 0), [tx, tz] = rTan(r, e ? L - 0.5 : 0.5), d = e ? [tx, tz] : [-tx, -tz], h = r.w / 2, H = JN.H, yl = jnYl(r), prio = r.user ? 3 : 2;
  const a0 = Math.atan2(d[1], d[0]), N = 18, inner = [], outer = [];
  for (let i = 0; i <= N; i++) { const t = a0 - Math.PI / 2 + Math.PI * i / N; inner.push([p.x + Math.cos(t) * h, p.z + Math.sin(t) * h]); outer.push([p.x + Math.cos(t) * (h + SIDEW), p.z + Math.sin(t) * (h + SIDEW)]); }
  const pos = [], info = [], idx = []; let s = 0; for (let i = 0; i <= N; i++) { if (i) s += Math.hypot(inner[i][0] - inner[i - 1][0], inner[i][1] - inner[i - 1][1]); pos.push(inner[i][0], p.y + H, inner[i][1], outer[i][0], p.y + H, outer[i][1]); info.push(0, s, SIDEW, 1, s, SIDEW); if (i) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('rinfo', new THREE.Float32BufferAttribute(info, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  if (geo.attributes.normal.getY(0) < 0) { const ix = geo.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } geo.computeVertexNormals(); }
  const m = new THREE.Mesh(geo, roadMat2('path', { side: true, prio })); m.receiveShadow = true; g.add(m);
  const T = []; for (let i = 0; i < idx.length; i += 3) T.push([idx[i], idx[i + 1], idx[i + 2]].map(v => [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]])); JN.addWalk(T);
  const face = (Lp, y0, y1) => { const ps = [], ix = []; for (let i = 0; i <= N; i++) { ps.push(Lp[i][0], p.y + y0, Lp[i][1], Lp[i][0], p.y + y1, Lp[i][1]); if (i) { const k = (i - 1) * 2; ix.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } } const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); gg.setIndex(ix); gg.computeVertexNormals(); const mm = new THREE.Mesh(gg, CURB_M()); mm.receiveShadow = true; g.add(mm); };
  face(inner, yl - 0.01, H); face(outer, H, -0.12);
};
// ---------- walking on plates & corner sidewalks ----------
JN.addWalk = function (T) { if (!T.length) return; let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const t of T) for (const v of t) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); z0 = Math.min(z0, v[2]); z1 = Math.max(z1, v[2]); } JN.walk.push({ bb: [x0, z0, x1, z1], T }); };
JN.walkY = function (x, z) {
  let out = null;
  for (const W of JN.walk) { if (x < W.bb[0] || x > W.bb[2] || z < W.bb[1] || z > W.bb[3]) continue;
    for (const [A, B, C] of W.T) { const d = (B[2] - C[2]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[2] - C[2]); if (Math.abs(d) < 1e-9) continue; const l1 = ((B[2] - C[2]) * (x - C[0]) + (C[0] - B[0]) * (z - C[2])) / d, l2 = ((C[2] - A[2]) * (x - C[0]) + (A[0] - C[0]) * (z - C[2])) / d, l3 = 1 - l1 - l2;
      if (l1 < -1e-4 || l2 < -1e-4 || l3 < -1e-4) continue; const y = l1 * A[1] + l2 * B[1] + l3 * C[1]; if (out === null || y > out) out = y; } }
  return out;
};
// is (x,z) on any paved road surface (strips or junction plates)? — for placing signs, poles, trees
JN.onRoad = function (x, z, m = 0.3) {
  for (const r of ROADS) { const bx = rBox(r), R = r.w / 2 + m + (r.side ? SIDEW : 0); if (x < bx[0] - R || x > bx[2] + R || z < bx[1] - R || z > bx[3] + R) continue; const pr = rProject(r, x, z); if (pr && pr.d < r.w / 2 + m) return true; }
  for (const j of JN.list) { const P = j.poly; if (!P) continue; let inside = false; for (let i = 0, k = P.length - 1; i < P.length; k = i++) { const a = P[i], b = P[k]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; } if (inside) return true; }
  return false;
};

// ---------- terrain under junctions: flat under the plate and the corner sidewalks, a soft slope around ----------
JN.triY = function (T, x, z) { for (const o of T) { const [A, B, C] = o.t, d = (B[2] - C[2]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[2] - C[2]); if (Math.abs(d) < 1e-9) continue; const l1 = ((B[2] - C[2]) * (x - C[0]) + (C[0] - B[0]) * (z - C[2])) / d, l2 = ((C[2] - A[2]) * (x - C[0]) + (A[0] - C[0]) * (z - C[2])) / d, l3 = 1 - l1 - l2; if (l1 < -1e-3 || l2 < -1e-3 || l3 < -1e-3) continue; return l1 * A[1] + l2 * B[1] + l3 * C[1] - o.dy; } return null; };
JN.carve = function () {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, RING = 3.0; let i0 = n, j0 = n, i1 = -1, j1 = -1;
  const set = (ii, jj, k, nh) => { if (Math.abs(nh - G.H[k]) < 0.02) return; G.H[k] = nh; i0 = Math.min(i0, ii); j0 = Math.min(j0, jj); i1 = Math.max(i1, ii); j1 = Math.max(j1, jj); };
  const box = J => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const o of J.tris) for (const v of o.t) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); z0 = Math.min(z0, v[2]); z1 = Math.max(z1, v[2]); } return [Math.max(0, Math.floor((x0 - RING - h0) / cell)), Math.max(0, Math.floor((z0 - RING - h0) / cell)), Math.min(n - 1, Math.ceil((x1 + RING - h0) / cell)), Math.min(n - 1, Math.ceil((z1 + RING - h0) / cell))]; };
  const Js = JN.list.filter(J => J.tris && J.tris.length), covered = new Set();
  // 0) nothing may stick up through a road or its sidewalks (later edits such as building pads can raise a road's bed) — only ever lowers
  for (const r of ROADS) { const L = rLen(r), half = r.w / 2, fw = footW(r) / 2, W = Math.ceil((fw + 1) / cell); if (L < 1) continue;
    for (let s = 0; s <= L; s += 1.0) { const p = rAt(r, s); if (r.bridge && (r.bridge[p.i] || r.bridge[p.i + 1])) continue; const [tx, tz] = rTan(r, s), ci = Math.round((p.x - h0) / cell), cj = Math.round((p.z - h0) / cell);
      for (let jj = Math.max(0, cj - W); jj <= Math.min(n - 1, cj + W); jj++) for (let ii = Math.max(0, ci - W); ii <= Math.min(n - 1, ci + W); ii++) {
        const x = h0 + ii * cell, z = h0 + jj * cell, a = (x - p.x) * tx + (z - p.z) * tz, o = Math.abs((x - p.x) * -tz + (z - p.z) * tx); if (Math.abs(a) > 0.5 || o > fw) continue;
        const k = jj * n + ii; if (G.prot[k] || !isNaN(G.Wl[k])) continue; const top = o <= half ? p.y - 0.05 : p.y + 0.12; if (G.H[k] > top) set(ii, jj, k, o <= half ? p.y - 0.08 : p.y + 0.03); } } }
  // 1) flat under every plate and corner sidewalk
  for (const J of Js) { const [a, b, c, d] = box(J); for (let jj = b; jj <= d; jj++) for (let ii = a; ii <= c; ii++) { const k = jj * n + ii; if (G.prot[k] || !isNaN(G.Wl[k])) continue; const y = JN.triY(J.tris, h0 + ii * cell, h0 + jj * cell); if (y === null) continue; covered.add(k); set(ii, jj, k, y); } }
  // 2) a soft slope around them (never under a road or another junction)
  for (const J of Js) { const [a, b, c, d] = box(J), V = []; for (const o of J.tris) for (const v of o.t) V.push([v[0], v[1] - o.dy, v[2]]);
    for (let jj = b; jj <= d; jj++) for (let ii = a; ii <= c; ii++) { const k = jj * n + ii; if (covered.has(k) || G.prot[k] || !isNaN(G.Wl[k])) continue; const x = h0 + ii * cell, z = h0 + jj * cell, bed = G.roadBed && G.roadBed[k];
      let bd = 1e9, by = 0; for (const v of V) { const dd = Math.hypot(v[0] - x, v[2] - z); if (dd < bd) { bd = dd; by = v[1]; } } if (bd > RING + 0.5) continue; const t = clamp((bd - 0.5) / RING, 0, 1), nh = lerp(by, G.H[k], t * t * (3 - 2 * t));
      if (!bed || nh < G.H[k]) set(ii, jj, k, nh); } } // under another road only ever lower
  return i1 >= i0 ? [i0, j0, i1, j1] : null;
};

// run the clean-up after development roads and when an island is opened (older saves had no junction plates)
queueMicrotask(() => {
  const refresh = b => { if (b) refreshRegion(b[0] - 2, b[1] - 2, b[2] + 2, b[3] + 2); };
  const _dr = GAME.devRoad; if (_dr) GAME.devRoad = function () { const r = _dr.apply(this, arguments); try { refresh(JN.carve()); } catch (e) { console.warn('junction carve', e); } return r; };
  const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { if (!DEMO2.building) refresh(JN.carve()); } catch (e) { console.warn('junction carve', e); } return r; };
});
// junction plates and corner sidewalks count as road for everything that keeps off roads (grass, flowers, trees, buildings…)
{ const _rd = roadDistAt; roadDistAt = function (x, z) { const d = _rd(x, z); if (d > 1 && JN.walk.length && JN.walkY(x, z) !== null) return 0; return d; }; }
