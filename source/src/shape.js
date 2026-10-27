// ===================== ISLAND SHAPE (heightfield generation, also used for previews) =====================
const WORLD = { size: 720, res: 2, n: 361, sea: 0 };
const VILLAGE = { x: 58, z: 112, r: 72 };
const MIKAN = { x: -150, z: -55, r: 46 };
const PEAK = { x: 10, z: -70 };
const OPEN = { x: -40, z: 30, r: 62 };
// river: spring on a plateau in the north forest -> waterfall -> west coast (夕日の浜)
const RIVER_CTRL = [[-12, -96], [-26, -84], [-44, -70], [-60, -52], [-76, -30], [-92, -2], [-110, 28], [-132, 62], [-156, 92], [-182, 118], [-212, 144], [-240, 166]];
const FALLS = { x: -44, z: -70, tx: -0.727, tz: 0.686 };
const CAPE = { a: [105, -80], b: [228, -168], r: 34 };
const BAY = { x: -22, z: 218, r: 58 };
function segDist(px, pz, a, b) { const vx = b[0] - a[0], vz = b[1] - a[1], t = clamp(((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(px - a[0] - vx * t, pz - a[1] - vz * t); }
function landMask(x, z) {
  const ang = Math.atan2(z, x), c = Math.cos(ang), s = Math.sin(ang);
  let R = 198 + 20 * Math.sin(ang * 2 + 0.7) + (fbm(c * 1.6 + 5, s * 1.6 + 5, 3, 4) - 0.5) * 60 + (fbm(c * 6 + 2, s * 6 + 2, 8, 3) - 0.5) * 22;
  let inside = Math.hypot(x, z) < R;
  if (segDist(x, z, CAPE.a, CAPE.b) < CAPE.r * (0.75 + fbm(x * 0.04, z * 0.04, 6, 3) * 0.5)) inside = true;
  if (Math.hypot(x - BAY.x, z - BAY.z) < BAY.r + (fbm(x * 0.05, z * 0.05, 7, 3) - 0.5) * 16) inside = false;
  // small islet south-west
  if (Math.hypot(x + 190, z - 175) < 22 + (fbm(x * 0.08, z * 0.08, 2, 3) - 0.5) * 14) inside = true;
  return inside;
}
function chamfer(mask, n, want) { // distance (in cells) to nearest cell where mask !== want
  const INF = 1e9, d = new Float32Array(n * n);
  for (let k = 0; k < n * n; k++) d[k] = mask[k] === want ? INF : 0;
  const a = 1, b = 1.4142;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const k = j * n + i; let v = d[k]; if (!v) continue;
    if (i > 0) v = Math.min(v, d[k - 1] + a); if (j > 0) v = Math.min(v, d[k - n] + a); if (i > 0 && j > 0) v = Math.min(v, d[k - n - 1] + b); if (i < n - 1 && j > 0) v = Math.min(v, d[k - n + 1] + b); d[k] = v; }
  for (let j = n - 1; j >= 0; j--) for (let i = n - 1; i >= 0; i--) { const k = j * n + i; let v = d[k]; if (!v) continue;
    if (i < n - 1) v = Math.min(v, d[k + 1] + a); if (j < n - 1) v = Math.min(v, d[k + n] + a); if (i < n - 1 && j < n - 1) v = Math.min(v, d[k + n + 1] + b); if (i > 0 && j < n - 1) v = Math.min(v, d[k + n - 1] + b); d[k] = v; }
  return d;
}
function genHeights() {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2;
  const mask = new Uint8Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) mask[j * n + i] = landMask(h0 + i * cell, h0 + j * cell) ? 1 : 0;
  const din = chamfer(mask, n, 1), dout = chamfer(mask, n, 0);
  const H = new Float32Array(n * n), cliffMap = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i, x = h0 + i * cell, z = h0 + j * cell;
    const capeK = 1 - sstep(10, 60, segDist(x, z, CAPE.a, CAPE.b));
    const northK = sstep(-110, -170, z) * (1 - sstep(60, 160, Math.abs(x + 20)));
    const cliffK = clamp(Math.max(capeK, northK * 0.9) * (0.6 + fbm(x * 0.03, z * 0.03, 12, 3) * 0.8), 0, 1);
    cliffMap[k] = cliffK;
    let h;
    if (!mask[k]) {
      const ds = dout[k] * cell;
      h = -0.8 - ds * lerp(0.16, 0.6, cliffK) - Math.max(0, ds - 18) * 0.45 + (fbm(x * 0.03, z * 0.03, 9, 3) - 0.5) * 1.5;
      if (Math.hypot(x - BAY.x, z - BAY.z) < BAY.r) h = Math.min(h, -3.5 - ds * 0.05);
      h = Math.max(-30, h);
    } else {
      const t = din[k] * cell;
      const beachH = lerp(-0.6, 2.4, sstep(0, 24, t));
      const cliffH = lerp(-4, 13 + fbm(x * 0.05, z * 0.05, 3, 3) * 6, sstep(0, 6, t));
      h = lerp(beachH, cliffH, cliffK);
      const inland = sstep(8, 85, t);
      let hills = (fbm(x * 0.0062, z * 0.0062, 21, 5) - 0.36) * 22 + ridged(x * 0.012, z * 0.012, 4, 4) * 4 - 2;
      hills = Math.max(0, hills) * inland;
      const peak = 24 * Math.exp(-(Math.pow(x - PEAK.x, 2) + Math.pow(z - PEAK.z, 2)) / (2 * 70 * 70));
      h += hills + peak * inland + capeK * sstep(4, 22, t) * 5;
      // open land for free building, nearly flat
      { const od = Math.hypot(x - OPEN.x, z - OPEN.z), ok = 1 - sstep(OPEN.r * 0.6, OPEN.r, od); if (ok > 0) h = lerp(h, 5.5 + (fbm(x * 0.02, z * 0.02, 5, 2) - 0.5) * 1.2, ok); }
      // village: gentle slope rising inland
      const vd = Math.hypot(x - VILLAGE.x, z - VILLAGE.z), vk = 1 - sstep(VILLAGE.r * 0.5, VILLAGE.r, vd);
      if (vk > 0) h = lerp(h, Math.max(2.4, Math.min(h, 2.8 + Math.max(0, VILLAGE.z + 20 - z) * 0.1)), vk);
      // mikan terraces
      const md = Math.hypot(x - MIKAN.x, z - MIKAN.z), mk = 1 - sstep(MIKAN.r * 0.6, MIKAN.r, md);
      if (mk > 0 && h > 5) { const st = 2.6, f = (h % st) / st, q = Math.floor(h / st) * st + sstep(0.78, 1, f) * st; h = lerp(h, q, mk * 0.9); }
    }
    H[k] = h;
  }
  const Wl = new Float32Array(n * n).fill(NaN);
  return { H, mask, din, dout, cliffMap, Wl };
}
// ---------- river ----------
function carveRiver(G) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2;
  // forest plateau whose sharp edge forms the waterfall cliff (added after smoothing so it stays crisp)
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const k = j * n + i; if (!G.mask[k]) continue; const x = h0 + i * cell, z = h0 + j * cell;
    const sd = (x - FALLS.x) * FALLS.tx + (z - FALLS.z) * FALLS.tz, pd = Math.abs((x - FALLS.x) * FALLS.tz - (z - FALLS.z) * FALLS.tx);
    const edge = pd + (fbm(x * 0.08, z * 0.08, 3, 2) - 0.5) * 3;
    G.H[k] += 8 * (1 - sstep(-1.0, 1.0, sd + (fbm(x * 0.1, z * 0.1, 9, 2) - 0.5) * 2)) * (1 - sstep(24, 40, edge)) * (1 - sstep(40, 75, -sd)) * sstep(8, 30, G.din[k] * cell); }
  let pts = resample(smoothPath(resample(RIVER_CTRL, 6), 6), 2);
  // gentle meanders (none near the falls)
  pts = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    const off = (Math.sin(i * 0.09) * 7 + (fbm(i * 0.05, 3, 17, 3) - 0.5) * 10) * sstep(10, 30, Math.hypot(p[0] - FALLS.x, p[1] - FALLS.z)) * sstep(0, 12, i);
    return [p[0] - tz * off, p[1] + tx * off]; });
  pts = resample(smoothPath(pts, 4), 2);
  // levels: running minimum of the bed, smoothed into a gently sloping surface; the falls stay a sharp drop
  const lv = [], gs = []; let prev = Infinity, end = pts.length;
  for (let i = 0; i < pts.length; i++) {
    let g = Infinity; for (const [ox, oz] of [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) g = Math.min(g, hAt(G, pts[i][0] + ox, pts[i][1] + oz));
    const L = Math.min(prev, g - 0.9); gs.push(g);
    if (L < 0.25) { end = i; gs.pop(); break; }
    lv.push(L); prev = L;
  }
  // the mouth (ver.46): the river used to stop in a pool ~20 m short of the sea, behind a strip of beach. Now it carries on
  // across the beach until it reaches open water; its surface sinks to sea level and the channel is cut below the sea,
  // so the sea flows in and the two waters meet without a step (the river surface fades out there, see river.js)
  let mouth = end, shore = end; { const L0 = lv.length ? lv[lv.length - 1] : 0.3, M = []; for (let i = end; i < pts.length && M.length < 34; i++) { const g = hAt(G, pts[i][0], pts[i][1]); M.push(i); if (g < 0.05 && shore === end) shore = i; if (g < -2.4 && M.length > 3) break; }
    M.forEach((i, k) => { const t = (k + 1) / M.length; lv.push(Math.max(0.0, L0 * (1 - t * t * (3 - 2 * t)))); gs.push(hAt(G, pts[i][0], pts[i][1])); }); end = end + M.length; if (shore === mouth) shore = end - 1; }
  pts = pts.slice(0, end);
  const N = pts.length, hw = pts.map((_, i) => lerp(3.0, 6.5, Math.min(i, mouth) / Math.max(1, mouth)) * (i > mouth ? 1 + 0.6 * Math.min(1, (i - mouth) / 10) : 1));
  // plunge pool below the biggest drop
  let fi = 1, fd = 0; for (let i = 1; i < N; i++) if (lv[i - 1] - lv[i] > fd) { fd = lv[i - 1] - lv[i]; fi = i; }
  { const sm = lv.slice(); for (let i = 0; i < N; i++) { if (Math.abs(i - fi) <= 1 || i >= mouth) continue; let a = 0, c = 0; for (let k = -6; k <= 6; k++) { const q = i + k; if (q < 0 || q >= N || (q < fi) !== (i < fi)) continue; a += lv[q]; c++; } sm[i] = c ? a / c : lv[i]; }   // the window runs into the mouth, so the surface eases down onto the beach instead of dropping off a step
    for (let i = 0; i < N; i++) { if (i < mouth) sm[i] = Math.min(sm[i], gs[i] - 0.4); if (i > 0) sm[i] = Math.min(sm[i], sm[i - 1]); } for (let i = 0; i < N; i++) lv[i] = sm[i]; }
  for (let i = fi; i < Math.min(N, fi + 6); i++) hw[i] += 3.5 * (1 - (i - fi) / 6);
  const best = new Float32Array(n * n).fill(1e9), bi = new Int32Array(n * n).fill(-1);
  for (let s = 1; s < N; s++) {
    const a = pts[s - 1], b = pts[s], R = Math.max(hw[s], hw[s - 1]) + 7;
    for (let j = Math.max(0, Math.floor((Math.min(a[1], b[1]) - R - h0) / cell)); j <= Math.min(n - 1, Math.ceil((Math.max(a[1], b[1]) + R - h0) / cell)); j++)
      for (let i = Math.max(0, Math.floor((Math.min(a[0], b[0]) - R - h0) / cell)); i <= Math.min(n - 1, Math.ceil((Math.max(a[0], b[0]) + R - h0) / cell)); i++) {
        const x = h0 + i * cell, z = h0 + j * cell, vx = b[0] - a[0], vz = b[1] - a[1];
        const t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / (vx * vx + vz * vz), 0, 1), d = Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t), k = j * n + i;
        if (d < best[k]) { best[k] = d; bi[k] = t < 0.5 ? s - 1 : s; }
      }
  }
  for (let k = 0; k < n * n; k++) {
    if (bi[k] < 0) continue; const s = bi[k], d = best[k], w = hw[s], L = lv[s];
    if (d < w + 7) G.H[k] = Math.min(G.H[k], lerp(L + 0.35, G.H[k], sstep(w, w + 7, d)));
    if (d < w) { const deep = (s >= fi && s < fi + 5) ? 2.8 : 1.8; G.H[k] = Math.min(G.H[k], L - deep * (1 - Math.pow(d / w, 2) * 0.65)); }
    if (s >= mouth && d < w + 1.5) G.H[k] = Math.min(G.H[k], lerp(-2.4, -0.7, sstep(0, w + 1.5, d)));   // the mouth: cut below the sea so the sea comes in (only where the river is already down at sea level, so its banks still hold it upstream)
    if (d < w + 2.5 && s <= shore + 1) { if (s >= mouth) G.Wl[k] = Math.max(L, 0.16); else if (L > 0.06) G.Wl[k] = L; }   // the river's own surface runs to the shoreline; river.js lays it onto the sea (tide) there, and past it the cut channel is the sea's
  }
  G.river = { pts, lv, hw, mouth, shore, falls: { x: pts[fi][0], z: pts[fi][1], top: lv[fi - 1], bottom: lv[fi] } };
}
function waterLevelAt(G, x, z) { // level of the inland water cell under (x,z), NaN if none
  const { n, size } = WORLD, cell = size / (n - 1); const i = clamp(Math.floor((x + size / 2) / cell), 0, n - 2), j = clamp(Math.floor((z + size / 2) / cell), 0, n - 2), W = G.Wl;
  let L = NaN; for (const k of [j * n + i, j * n + i + 1, (j + 1) * n + i, (j + 1) * n + i + 1]) if (!(W[k] <= L)) L = isNaN(L) ? W[k] : Math.max(L, W[k]);
  return L;
}

// ===================== ROADS =====================
function markBridges(G, r) { // raise the road over inland water and flag those samples
  r.bridge = r.pts.map(([x, z]) => { const L = waterLevelAt(G, x, z); return !isNaN(L) && L > hAt(G, x, z) + 0.1; });
  // widen flags by one sample each side so abutments sit on land
  const b0 = r.bridge.slice(); for (let i = 0; i < b0.length; i++) if (b0[i]) { if (i > 0) r.bridge[i - 1] = true; if (i < b0.length - 1) r.bridge[i + 1] = true; }
  let any = false;
  for (let i = 0; i < r.pts.length; i++) if (r.bridge[i]) { any = true; const L = waterLevelAt(G, r.pts[i][0], r.pts[i][1]); const deck = (isNaN(L) ? hAt(G, r.pts[i][0], r.pts[i][1]) : L) + 1.9;
    for (let k = 0; k < r.pts.length; k++) { const ramp = deck - Math.abs(k - i) * Math.hypot(r.pts[1][0] - r.pts[0][0], r.pts[1][1] - r.pts[0][1]) * 0.1; if (ramp > r.h[k]) r.h[k] = ramp; } }
  return any;
}
function smoothHeights(G, passes = 2) {
  const { n } = WORLD, H = G.H, T = new Float32Array(H);
  for (let p = 0; p < passes; p++) {
    for (let j = 1; j < n - 1; j++) for (let i = 1; i < n - 1; i++) { const k = j * n + i; T[k] = (H[k] * 4 + H[k - 1] + H[k + 1] + H[k - n] + H[k + n]) / 8; }
    H.set(T);
  }
}
function hAt(G, x, z) { // bilinear
  const { n, size } = WORLD, cell = size / (n - 1); const fx = (x + size / 2) / cell, fz = (z + size / 2) / cell;
  const i = clamp(Math.floor(fx), 0, n - 2), j = clamp(Math.floor(fz), 0, n - 2), u = clamp(fx - i, 0, 1), v = clamp(fz - j, 0, 1), H = G.H;
  const a = H[j * n + i], b = H[j * n + i + 1], c = H[(j + 1) * n + i], d = H[(j + 1) * n + i + 1];
  // same triangles as the terrain mesh (diagonal from (i+1,j) to (i,j+1)) so feet sit exactly on the drawn ground
  return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v);
}
function dinAt(G, x, z) { const { n, size } = WORLD, cell = size / (n - 1); const i = clamp(Math.round((x + size / 2) / cell), 0, n - 1), j = clamp(Math.round((z + size / 2) / cell), 0, n - 1); return G.mask[j * n + i] ? G.din[j * n + i] * cell : -G.dout[j * n + i] * cell; }
function coastPath(G, a0, a1, inset, step = 0.035) {
  const pts = [];
  for (let a = a0; a1 > a0 ? a <= a1 : a >= a1; a += (a1 > a0 ? step : -step)) {
    let best = null;
    for (let r = 20; r < 330; r += 1.5) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (dinAt(G, x, z) >= inset) best = [x, z]; }
    if (best) pts.push(best);
  }
  return pts;
}
function smoothPath(pts, it = 6) { let p = pts.map(q => q.slice()); for (let k = 0; k < it; k++) p = p.map((q, i) => i === 0 || i === p.length - 1 ? q : [(p[i - 1][0] + q[0] * 2 + p[i + 1][0]) / 4, (p[i - 1][1] + q[1] * 2 + p[i + 1][1]) / 4]); return p; }
function resample(pts, spacing) {
  const out = [pts[0]]; let carry = 0;
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); let t = spacing - carry; while (t <= L) { out.push([a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]); t += spacing; } carry = L - (t - spacing); }
  return out;
}
function buildRoads(G) {
  const roads = [];
  // main coastal road: from the harbor eastwards round to the cape junction
  let east = coastPath(G, 1.5, -0.4, 24);
  east = resample(smoothPath(east, 10), 4);
  // cape spur to the lighthouse
  const j0 = east[east.length - 1];
  let cape = [j0];
  for (let t = 0.05; t <= 0.84; t += 0.04) cape.push([CAPE.a[0] + (CAPE.b[0] - CAPE.a[0]) * t, CAPE.a[1] + (CAPE.b[1] - CAPE.a[1]) * t]);
  cape = resample(smoothPath(cape, 6), 4);
  // west road from the harbor along the south-west coast
  let west = coastPath(G, 2.02, 3.4, 22);
  west = resample(smoothPath(west, 10), 4);
  // one continuous coastal road: far west -> harbor -> east coast -> lighthouse cape
  const hl = [[BAY.x - 30, BAY.z - 72], [BAY.x + 20, BAY.z - 74]];
  let coast = [...west.slice().reverse(), ...hl, ...east, ...cape.slice(1)];
  coast = resample(smoothPath(resample(coast, 4), 8), 4);
  // village lane: starts at the edge of the coastal road and climbs the hill
  let lane = [[VILLAGE.x - 5, VILLAGE.z + 40], [VILLAGE.x + 2, VILLAGE.z + 5], [VILLAGE.x + 20, VILLAGE.z - 30], [VILLAGE.x + 15, VILLAGE.z - 70], [VILLAGE.x - 20, VILLAGE.z - 100]];
  lane = resample(smoothPath(resample(lane, 6), 8), 4);
  // snap lane start onto the coastal road edge
  let bi = 0, bd = 1e9; coast.forEach((p, i) => { const d = Math.hypot(p[0] - lane[0][0], p[1] - lane[0][1]); if (d < bd) { bd = d; bi = i; } });
  const cp = coast[bi], ca = coast[Math.max(0, bi - 1)], cb = coast[Math.min(coast.length - 1, bi + 1)];
  let tx = cb[0] - ca[0], tz = cb[1] - ca[1]; const tl = Math.hypot(tx, tz); tx /= tl; tz /= tl; let nx = -tz, nz = tx;
  if ((lane[2][0] - cp[0]) * nx + (lane[2][1] - cp[1]) * nz < 0) { nx = -nx; nz = -nz; }
  const start = [cp[0] + nx * 3.0, cp[1] + nz * 3.0], s2 = [cp[0] + nx * 9, cp[1] + nz * 9];
  lane = lane.filter(p => Math.hypot(p[0] - cp[0], p[1] - cp[1]) > 14);
  lane = resample(smoothPath(resample([start, s2, ...lane], 4), 4), 4); lane[0] = start;
  roads.push({ pts: coast, w: 6.4, lines: true, guard: true }, { pts: lane, w: 4.2, lines: false, junction: { x: cp[0], z: cp[1], nx, nz, i: bi } });
  for (const r of roads) {
    let hs = r.pts.map(([x, z]) => Math.max(2.2, hAt(G, x, z)));
    for (let k = 0; k < 30; k++) hs = hs.map((h, i) => i === 0 || i === hs.length - 1 ? h : (hs[i - 1] + h * 2 + hs[i + 1]) / 4);
    for (let k = 1; k < hs.length; k++) hs[k] = clamp(hs[k], hs[k - 1] - 0.4, hs[k - 1] + 0.4); // max ~10% grade
    r.h = hs;
  }
  for (const r of roads) markBridges(G, r);
  for (const r of roads) if (r.junction) { const base = roads[0].h[r.junction.i]; const d0 = r.h[0] - base; for (let k = 0; k < Math.min(6, r.h.length); k++) r.h[k] -= d0 * (1 - k / 6); }
  return roads;
}
function carveRoads(G, roads) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2;
  const best = new Float32Array(n * n).fill(1e9), target = new Float32Array(n * n), onBridge = new Uint8Array(n * n);
  for (const r of roads) {
    const half = r.w / 2 + 1.2, fall = 9;
    for (let s = 1; s < r.pts.length; s++) {
      const a = r.pts[s - 1], b = r.pts[s], ha = r.h[s - 1], hb = r.h[s];
      const minx = Math.min(a[0], b[0]) - half - fall, maxx = Math.max(a[0], b[0]) + half + fall, minz = Math.min(a[1], b[1]) - half - fall, maxz = Math.max(a[1], b[1]) + half + fall;
      for (let j = Math.max(0, Math.floor((minz - h0) / cell)); j <= Math.min(n - 1, Math.ceil((maxz - h0) / cell)); j++)
        for (let i = Math.max(0, Math.floor((minx - h0) / cell)); i <= Math.min(n - 1, Math.ceil((maxx - h0) / cell)); i++) {
          const x = h0 + i * cell, z = h0 + j * cell, vx = b[0] - a[0], vz = b[1] - a[1];
          const t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / (vx * vx + vz * vz), 0, 1), d = Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t);
          const k = j * n + i; if (d < best[k]) { best[k] = d; target[k] = lerp(ha, hb, t); onBridge[k] = r.bridge && (r.bridge[s - 1] || r.bridge[s]) ? 1 : 0; }
        }
    }
    r.half = half;
  }
  for (let k = 0; k < n * n; k++) {
    if (best[k] > 30) continue;
    if (onBridge[k] && !isNaN(G.Wl[k])) continue;
    const r = roads[0], w = sstep(4.6, 4.6 + 9, best[k]);
    const tgt = target[k] - 0.08;
    G.H[k] = best[k] < 4.4 ? tgt : lerp(tgt, G.H[k], w);
  }
  G.roadDist = best;
}
