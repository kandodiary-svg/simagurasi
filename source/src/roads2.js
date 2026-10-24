// ===================== ROADS v2: road types, footpaths & sidewalks, terrain-following profiles, merged extensions, proper junctions =====================
// type: asphalt / stone (石畳) / gravel (砂利道) / dirt (土の山道) / path (歩道タイル) / trail (土の小道).  side: sidewalks on both sides (asphalt・stone)
const RTYPES = {
  asphalt: { name: 'アスファルト', icon: '🛣️', w: { narrow: 4.2, wide: 6.2 }, grade: 0.12, cut: 10, side: true, id: 0 },
  stone: { name: '石畳', icon: '🧱', w: { narrow: 4.0, wide: 5.6 }, grade: 0.12, cut: 9, side: true, id: 1 },
  gravel: { name: '砂利道', icon: '🪨', w: 3.8, grade: 0.15, cut: 11, id: 2 },
  dirt: { name: '土の山道', icon: '⛰️', w: 3.4, grade: 0.2, cut: 12, id: 3 },
  path: { name: '歩道（タイル）', icon: '🚶', w: 2.0, grade: 0.25, cut: 6, foot: true, id: 4 },
  trail: { name: '土の小道', icon: '🌿', w: 1.8, grade: 0.3, cut: 8, foot: true, id: 5 },
};
const SIDEW = 1.6;
const rType = r => (r && r.type && RTYPES[r.type]) ? r.type : 'asphalt';
const isFoot = r => !!RTYPES[rType(r)].foot;
const footW = r => r.w + (r.side ? SIDEW * 2 : 0);
EDIT.rtype = EDIT.rtype || 'asphalt'; EDIT.rside = false; EDIT.roadMode = 'draw';
// ---------- polyline helpers ----------
function rCum(r) { if (r._cum && r._cumP === r.pts) return r._cum; const c = [0]; for (let i = 1; i < r.pts.length; i++) c.push(c[i - 1] + Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1])); r._cum = c; r._cumP = r.pts; return c; }
function rLen(r) { const c = rCum(r); return c[c.length - 1]; }
function rAt(r, s) { const c = rCum(r), n = c.length; s = clamp(s, 0, c[n - 1]); let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; } const seg = c[hi] - c[lo] || 1, t = (s - c[lo]) / seg, a = r.pts[lo], b = r.pts[hi]; return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, y: r.h[lo] + (r.h[hi] - r.h[lo]) * t, i: lo, t }; }
function rTan(r, s) { const L = rLen(r), a = rAt(r, Math.max(0, s - 0.9)), b = rAt(r, Math.min(L, s + 0.9)); const tx = b.x - a.x, tz = b.z - a.z, l = Math.hypot(tx, tz) || 1; return [tx / l, tz / l]; }
function rProject(r, x, z) { const c = rCum(r); let best = null; for (let i = 1; i < r.pts.length; i++) { const a = r.pts[i - 1], b = r.pts[i], vx = b[0] - a[0], vz = b[1] - a[1], ll = vx * vx + vz * vz || 1, t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / ll, 0, 1), px = a[0] + vx * t, pz = a[1] + vz * t, d = Math.hypot(x - px, z - pz); if (!best || d < best.d) best = { d, s: c[i - 1] + (c[i] - c[i - 1]) * t, x: px, z: pz, y: r.h[i - 1] + (r.h[i] - r.h[i - 1]) * t, i }; } return best; }
function rBox(r) { if (r._box && r._boxP === r.pts) return r._box; let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of r.pts) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); } r._box = [x0, z0, x1, z1]; r._boxP = r.pts; return r._box; }
function rSlice(r, s0, s1) { // a new road covering [s0,s1] of r (same attributes)
  const c = rCum(r), a = rAt(r, s0), b = rAt(r, s1), pts = [[a.x, a.z]], h = [a.y], br = [!!(r.bridge && r.bridge[a.i])];
  for (let i = 0; i < r.pts.length; i++) if (c[i] > s0 + 0.4 && c[i] < s1 - 0.4) { pts.push(r.pts[i].slice()); h.push(r.h[i]); br.push(!!(r.bridge && r.bridge[i])); }
  pts.push([b.x, b.z]); h.push(b.y); br.push(!!(r.bridge && r.bridge[Math.min(r.pts.length - 1, b.i + 1)]));
  const o = Object.assign({}, r, { pts, h, bridge: br }); delete o.mesh; delete o.frames; delete o._cum; delete o._box; return o;
}
function segX(a, b, c, d) { const rx = b[0] - a[0], rz = b[1] - a[1], sx = d[0] - c[0], sz = d[1] - c[1], den = rx * sz - rz * sx; if (Math.abs(den) < 1e-9) return null; const t = ((c[0] - a[0]) * sz - (c[1] - a[1]) * sx) / den, u = ((c[0] - a[0]) * rz - (c[1] - a[1]) * rx) / den; if (t < 0 || t > 1 || u < 0 || u > 1) return null; return { t, u }; }
function rCross(r, q) { const A = rBox(r), Bq = rBox(q); if (A[2] < Bq[0] - 1 || Bq[2] < A[0] - 1 || A[3] < Bq[1] - 1 || Bq[3] < A[1] - 1) return []; const cr = rCum(r), cq = rCum(q), out = [];
  for (let i = 1; i < r.pts.length; i++) for (let j = 1; j < q.pts.length; j++) { const h = segX(r.pts[i - 1], r.pts[i], q.pts[j - 1], q.pts[j]); if (h) out.push({ s: cr[i - 1] + (cr[i] - cr[i - 1]) * h.t, sq: cq[j - 1] + (cq[j] - cq[j - 1]) * h.u, x: r.pts[i - 1][0] + (r.pts[i][0] - r.pts[i - 1][0]) * h.t, z: r.pts[i - 1][1] + (r.pts[i][1] - r.pts[i - 1][1]) * h.t }); }
  return out.sort((a, b) => a.s - b.s); }
// ---------- height profile: follow the terrain closely, smooth, respect the max grade, pinned junction heights ----------
function roadProfile(pts, w, type, fixes) {
  const T = RTYPES[type], n = pts.length, sp = n > 1 ? Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) : 2, g = T.grade * sp;
  const terr = pts.map(([x, z], i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; const nx = -tz / l, nz = tx / l; let s = 0;
    for (const o of [-0.45, 0, 0.45]) { const px = x + nx * w * o, pz = z + nz * w * o, d = deckY(px, pz); s += d !== null ? d : groundH(px, pz); } return Math.max(0.6, s / 3); });
  // smoothed target (≈5m), pins: {i, y}
  let tg = terr.slice(); for (let k = 0; k < 10; k++) tg = tg.map((h, i) => i === 0 || i === n - 1 ? h : (tg[i - 1] + h * 2 + tg[i + 1]) / 4);
  const pin = new Map(); for (const f of fixes) if (f && f.y !== undefined && f.y !== null) pin.set(f.i, f.y);
  // pull pinned heights into the target smoothly (±14m)
  for (const [i0, y] of pin) { const R = Math.max(3, Math.round(14 / sp)); for (let i = Math.max(0, i0 - R); i <= Math.min(n - 1, i0 + R); i++) { const k = 1 - Math.abs(i - i0) / (R + 1), wgt = k * k * (3 - 2 * k); tg[i] = lerp(tg[i], y, wgt); } }
  // tension iterations: stay near the target but never steeper than the grade
  let h = tg.slice(); for (const [i, y] of pin) h[i] = y;
  for (let it = 0; it < 80; it++) { for (let i = 0; i < n; i++) { if (pin.has(i)) continue; let lo = -1e9, hi = 1e9; if (i > 0) { lo = Math.max(lo, h[i - 1] - g); hi = Math.min(hi, h[i - 1] + g); } if (i < n - 1) { lo = Math.max(lo, h[i + 1] - g); hi = Math.min(hi, h[i + 1] + g); } h[i] = lo <= hi ? clamp(lerp(h[i], tg[i], 0.5), lo, hi) : (lo + hi) / 2; } }
  for (let i = 1; i < n; i++) if (!pin.has(i)) h[i] = clamp(h[i], h[i - 1] - g, h[i - 1] + g);
  for (let i = n - 2; i >= 0; i--) if (!pin.has(i)) h[i] = clamp(h[i], h[i + 1] - g, h[i + 1] + g);
  for (let k = 0; k < 2; k++) h = h.map((v, i) => i === 0 || i === n - 1 || pin.has(i) ? v : (h[i - 1] + v * 2 + h[i + 1]) / 4);
  let worst = 0, wi = 0; for (let i = 0; i < n; i++) { const dd = Math.abs(h[i] - terr[i]); if (dd > worst) { worst = dd; wi = i; } }
  let steep = false; for (let i = 1; i < n; i++) if (Math.abs(h[i] - h[i - 1]) > g * 1.35) steep = true;
  return { h, worst, wi, steep, terr };
}
// ---------- junction network ----------
const RN = { T: [] };
function buildNet() {
  RN.T = []; for (const r of ROADS) { r.gaps = []; r.trim = [0, 0]; r.stop = [null, null]; r.xw = []; r.tAt = [null, null]; }
  for (const r of ROADS) { const L = rLen(r); if (L < 2) continue;
    for (const e of [0, 1]) { const P = e ? r.pts[r.pts.length - 1] : r.pts[0]; let best = null;
      for (const q of ROADS) { if (q === r || (!isFoot(r) && isFoot(q))) continue; const bx = rBox(q); if (P[0] < bx[0] - 8 || P[0] > bx[2] + 8 || P[1] < bx[1] - 8 || P[1] > bx[3] + 8) continue;
        const pr = rProject(q, P[0], P[1]), Lq = rLen(q); if (pr.d > q.w / 2 + 0.9 || pr.s < 1.0 || pr.s > Lq - 1.0) continue; if (!best || pr.d < best.pr.d) best = { q, pr }; }
      if (!best) continue; const { q, pr } = best;
      const [mtx, mtz] = rTan(q, pr.s), [btx, btz] = rTan(r, e ? L - 0.8 : 0.8), bdx = e ? -btx : btx, bdz = e ? -btz : btz;
      const sin = Math.abs(mtx * bdz - mtz * bdx); if (sin < 0.28) continue;
      const nqx = -mtz, nqz = mtx, sg = (bdx * nqx + bdz * nqz) > 0 ? 1 : -1, foot = isFoot(r), ty = rType(r);
      const Rf = foot ? 0 : (ty === 'dirt' || ty === 'gravel' ? 1.6 : 2.6), mainHalf = foot ? footW(q) / 2 : q.w / 2;
      let trim = 0; for (let d = 0; d < Math.min(L * 0.48, 34); d += 0.2) { const p = rAt(r, e ? L - d : d); trim = d; if (rProject(q, p.x, p.z).d >= mainHalf + Rf * sin + 0.02) break; }
      r.trim[e] = trim; r.tAt[e] = q;
      const half = (r.w / 2) / sin + Rf + 0.25; q.gaps.push({ s0: pr.s - half, s1: pr.s + half, side: sg, foot });
      if (!foot && (ty === 'asphalt')) r.stop[e] = { lane: r.lines ? (e ? 1 : 2) : 0 };
      RN.T.push({ q, r, e, s: pr.s, P: [pr.x, pr.z], y: pr.y, sg, sin, foot, Rf, trim, mt: [mtx, mtz], bd: [bdx, bdz] });
    } }
  for (const q of ROADS) { if (isFoot(q)) continue; const fs = RN.T.filter(t => t.q === q && t.foot); const used = new Set(); for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) if (fs[i].sg !== fs[j].sg && Math.abs(fs[i].s - fs[j].s) < 3.5 && !used.has(i) && !used.has(j)) { q.xw.push((fs[i].s + fs[j].s) / 2); used.add(i); used.add(j); } }
}
// ---------- materials ----------
const RMAT = { cache: [] };
function roadMat2(type, o = {}) {
  const T = RTYPES[type] || RTYPES.asphalt, prio = o.prio || 3;
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: type === 'asphalt' ? 0.88 : type === 'stone' ? 0.8 : 0.95, metalness: 0, polygonOffset: true, polygonOffsetFactor: -prio, polygonOffsetUnits: -prio * 2 });
  const GL = Array.from({ length: 16 }, () => new THREE.Vector2(-1e5, -1e5)), GR = Array.from({ length: 16 }, () => new THREE.Vector2(-1e5, -1e5)), XW = new Array(6).fill(-1e5);
  (o.gapsL || []).slice(0, 16).forEach((g, i) => GL[i].set(g[0], g[1])); (o.gapsR || []).slice(0, 16).forEach((g, i) => GR[i].set(g[0], g[1])); (o.xw || []).slice(0, 6).forEach((v, i) => XW[i] = v);
  const U = { tAsph: { value: TEX.asphalt }, tMacro: { value: TEX.macro }, tDirt: { value: TEX.dirt }, tGrass: { value: TEX.grass }, uType: { value: T.id }, uLines: { value: o.lines ? 1 : 0 }, uCenter: { value: o.center ? 1 : 0 }, uFill: { value: o.fill ? 1 : 0 }, uSide: { value: o.side ? 1 : 0 },
    uGL: { value: GL }, uGR: { value: GR }, uXW: { value: XW }, uStop: { value: new THREE.Vector4(o.stop0 ? 1 : 0, o.stop0 ? o.stop0.d : 0, o.stop1 ? 1 : 0, o.stop1 ? o.stop1.d : 0) }, uStopLane: { value: new THREE.Vector2(o.stop0 ? o.stop0.lane : 0, o.stop1 ? o.stop1.lane : 0) } };
  m.userData.U = U;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 rinfo; varying vec3 vR; varying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvR = rinfo; vWP = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform sampler2D tAsph, tMacro, tDirt, tGrass; uniform float uType, uLines, uCenter, uFill, uSide; uniform vec2 uGL[16]; uniform vec2 uGR[16]; uniform float uXW[6]; uniform vec4 uStop; uniform vec2 uStopLane; varying vec3 vR; varying vec3 vWP;
float h21(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float gapL(float d) { float g = 0.0; for (int i = 0; i < 16; i++) { if (d > uGL[i].x && d < uGL[i].y) g = 1.0; } return g; }
float gapR(float d) { float g = 0.0; for (int i = 0; i < 16; i++) { if (d > uGR[i].x && d < uGR[i].y) g = 1.0; } return g; }
float laneSel(float u, float s) { if (s < 0.5) return step(0.06, u) * step(u, 0.94); if (s < 1.5) return step(0.06, u) * step(u, 0.5); return step(0.5, u) * step(u, 0.94); }
float grid(vec2 q, float t) { vec2 f = fract(q), aa = fwidth(q); float m = (1.0 - smoothstep(t, t + aa.x * 1.5 + 0.02, min(f.x, 1.0 - f.x))) + (1.0 - smoothstep(t, t + aa.y * 1.5 + 0.02, min(f.y, 1.0 - f.y))); return clamp(m, 0.0, 1.0) * clamp(1.0 - max(aa.x, aa.y) * 2.2, 0.0, 1.0); }`)
      .replace('#include <map_fragment>', `
        float u = vR.x, d = vR.y, w = vR.z, uw = u * w;
        vec2 P = uFill > 0.5 ? vWP.xz : vec2(uw, d);
        float mac = texture2D(tMacro, vWP.xz * 0.02).r;
        vec3 col;
        if (uSide > 0.5) {
          vec2 q = P / 0.3; vec2 id = floor(q); vec3 c1 = mix(vec3(0.58, 0.56, 0.54), vec3(0.67, 0.63, 0.59), h21(id));
          col = mix(c1, c1 * 0.7, grid(q, 0.04)); float tac = (1.0 - step(0.18, abs(uw - 0.62))) * (1.0 - uFill); vec2 tq = fract(vec2(uw, d) / 0.09);
          col = mix(col, mix(vec3(0.95, 0.80, 0.18), vec3(0.85, 0.70, 0.12), step(length(tq - 0.5), 0.28)), tac);
          float curb = step(uw, 0.16) * (1.0 - uFill); col = mix(col, vec3(0.74, 0.73, 0.70), curb);
        } else if (uType < 0.5) {
          vec3 a = texture2D(tAsph, vWP.xz * 0.25).rgb * (0.85 + 0.3 * mac);
          float wear = texture2D(tMacro, vWP.xz * 0.3).b;
          float eL = step(0.25, uw) * step(uw, 0.40) * (1.0 - gapL(d)), eR = step(w - 0.40, uw) * step(uw, w - 0.25) * (1.0 - gapR(d));
          float cen = uCenter * step(abs(uw - w * 0.5), 0.07) * step(fract(d / 9.0), 0.55);
          float xw = 0.0; for (int i = 0; i < 6; i++) { if (abs(d - uXW[i]) < 1.6) { xw = step(0.5, fract(uw / 0.9 + 0.25)) * step(0.4, uw) * step(uw, w - 0.4); cen = 0.0; } }
          float sl = 0.0; if (uStop.x > 0.5 && d > uStop.y && d < uStop.y + 0.45) sl = laneSel(u, uStopLane.x); if (uStop.z > 0.5 && d < uStop.w && d > uStop.w - 0.45) sl = max(sl, laneSel(u, uStopLane.y));
          float line = clamp((eL + eR) * uLines + cen + xw + sl, 0.0, 1.0) * smoothstep(0.12, 0.28, wear) * (1.0 - uFill);
          col = mix(a, vec3(0.9, 0.9, 0.87), line);
        } else if (uType < 1.5) {
          vec2 q = vec2(P.x / 0.55 + floor(P.y / 0.42) * 0.5, P.y / 0.42); vec2 id = floor(q);
          float hv = h21(id); vec3 st = mix(mix(vec3(0.33, 0.32, 0.30), vec3(0.47, 0.44, 0.40), hv), vec3(0.45, 0.40, 0.34), step(0.8, hv)) * (0.8 + 0.4 * texture2D(tAsph, vWP.xz * 0.6).r);
          vec2 aq = fwidth(q); float gm = grid(q, 0.07); col = mix(st, vec3(0.17, 0.16, 0.15), max(gm, 0.35 * clamp(max(aq.x, aq.y) * 1.5, 0.0, 1.0)));
          float xs = 0.0; for (int i = 0; i < 6; i++) { if (abs(d - uXW[i]) < 1.6) xs = step(0.5, fract(uw / 0.9 + 0.25)) * step(0.4, uw) * step(uw, w - 0.4); } col = mix(col, vec3(0.86, 0.85, 0.82), xs * (1.0 - uFill));
          float kerb = (step(uw, 0.3) + step(w - 0.3, uw)) * (1.0 - uFill); col = mix(col, vec3(0.70, 0.69, 0.66) * (0.9 + 0.2 * h21(floor(vec2(d / 0.9, uw)))), kerb);
        } else if (uType > 3.5 && uType < 4.5) {
          vec2 q = P / 0.3; vec2 id = floor(q);
          vec3 c1 = mix(vec3(0.66, 0.43, 0.38), vec3(0.74, 0.66, 0.54), step(0.5, h21(id)));
          col = mix(c1, c1 * 0.68, grid(q, 0.05));
          float kerb = (step(uw, 0.12) + step(w - 0.12, uw)) * (1.0 - uFill); col = mix(col, vec3(0.72, 0.71, 0.68), kerb);
        } else {
          float e = abs(u - 0.5) * 2.0, nz = texture2D(tMacro, vWP.xz * 0.35).r, nz2 = texture2D(tMacro, vWP.xz * 0.9).g;
          if (uFill < 0.5 && e > 0.8 + (nz - 0.5) * 0.4) discard;
          vec3 dirt = texture2D(tDirt, vWP.xz * 0.22).rgb, grass = texture2D(tGrass, vWP.xz * 0.18).rgb * vec3(0.92, 1.0, 0.72);
          if (uType < 2.5) {
            col = vec3(0.80, 0.76, 0.68) * (0.68 + 0.6 * texture2D(tAsph, vWP.xz * 1.3).r);
            float rut = clamp((1.0 - smoothstep(0.1, 0.3, abs(uw - w * 0.28))) + (1.0 - smoothstep(0.1, 0.3, abs(uw - w * 0.72))), 0.0, 1.0); col = mix(col, col * 0.8, rut * 0.55 * (1.0 - uFill));
          } else if (uType < 3.5) {
            col = dirt * 1.18 + vec3(0.04, 0.02, 0.0); float rut = clamp((1.0 - smoothstep(0.12, 0.34, abs(uw - w * 0.27))) + (1.0 - smoothstep(0.12, 0.34, abs(uw - w * 0.73))), 0.0, 1.0); col = mix(col, dirt * 0.74, rut * 0.65 * (1.0 - uFill));
            float mid = (1.0 - smoothstep(0.15, 0.42, abs(uw - w * 0.5))) * smoothstep(0.5, 0.7, nz2); col = mix(col, grass, mid * 0.8 * (1.0 - uFill));
          } else { col = dirt * 1.2 + vec3(0.05, 0.03, 0.0); }
          col = mix(col, grass, smoothstep(0.62, 0.98, e) * 0.5 * (1.0 - uFill));
        }
        diffuseColor.rgb *= col;
      `);
  };
  return m;
}
// ---------- geometry builders ----------
function stripFrames(r, s0, s1, step) { const out = [], n = Math.max(1, Math.ceil((s1 - s0) / step)); for (let k = 0; k <= n; k++) { const s = s0 + (s1 - s0) * k / n, p = rAt(r, s), [tx, tz] = rTan(r, s); out.push({ x: p.x, z: p.z, y: p.y, tx, tz, nx: -tz, nz: tx, dist: s }); } return out; }
function ribbonMesh(F, o0, o1, y0, y1, w, mat, uSpan) { // band between lateral offsets o0..o1 (metres from centre along +n)
  const pos = [], info = [], idx = [];
  F.forEach((f, i) => { pos.push(f.x + f.nx * o0, f.y + y0, f.z + f.nz * o0, f.x + f.nx * o1, f.y + y1, f.z + f.nz * o1); info.push(uSpan[0], f.dist, w, uSpan[1], f.dist, w); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('rinfo', new THREE.Float32BufferAttribute(info, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; return m;
}
function runs(F, skip) { const out = []; let cur = null; F.forEach((f, i) => { if (skip(f, i)) { cur = null; return; } if (!cur) { cur = []; out.push(cur); } cur.push(f); }); return out.filter(r => r.length > 1); }
function capDisc(x, z, y, rad, mat, w) { const cg = new THREE.CircleGeometry(rad, 22); cg.rotateX(-Math.PI / 2); const p = cg.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + x, y, p.getZ(i) + z); const inf = []; for (let i = 0; i < p.count; i++) inf.push(0.5, 0, w); cg.setAttribute('rinfo', new THREE.Float32BufferAttribute(inf, 3)); cg.computeVertexNormals(); const m = new THREE.Mesh(cg, mat); m.receiveShadow = true; return m; }
function filletMesh(T) {
  const { q, r, e, sg, Rf, trim } = T, L = rLen(r); if (trim < 0.3) return null;
  const bs = e ? L - trim : trim, bp = rAt(r, bs), [btx, btz] = rTan(r, bs), bdx = e ? -btx : btx, bdz = e ? -btz : btz, nbx = -bdz, nbz = bdx, hw = r.w / 2;
  const [mtx, mtz] = T.mt, eh = q.w / 2 - 0.35; const edge = s => { const p = rAt(q, s), [tx, tz] = rTan(q, s); return [p.x + (-tz) * sg * eh, p.z + tx * sg * eh]; };
  const E0 = edge(T.s), inter = (A, dx, dz) => { const den = dx * mtz - dz * mtx; if (Math.abs(den) < 1e-4) return null; const t = ((E0[0] - A[0]) * mtz - (E0[1] - A[1]) * mtx) / den; return [A[0] + dx * t, A[1] + dz * t]; };
  const A1 = [bp.x + nbx * hw, bp.z + nbz * hw], A2 = [bp.x - nbx * hw, bp.z - nbz * hw], K1 = inter(A1, -bdx, -bdz), K2 = inter(A2, -bdx, -bdz); if (!K1 || !K2) return null;
  const u1 = (K1[0] - E0[0]) * mtx + (K1[1] - E0[1]) * mtz, u2 = (K2[0] - E0[0]) * mtx + (K2[1] - E0[1]) * mtz, s1 = Math.sign(u1 - u2) || 1;
  const sM1 = T.s + u1 + s1 * Rf, sM2 = T.s + u2 - s1 * Rf, M1 = edge(sM1), M2 = edge(sM2), poly = [];
  const bez = (P0, C, P1, n, out) => { for (let k = 0; k <= n; k++) { const t = k / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; out.push([a * P0[0] + b * C[0] + c * P1[0], a * P0[1] + b * C[1] + c * P1[1]]); } };
  bez(A1, K1, M1, 7, poly); const nE = Math.max(2, Math.ceil(Math.abs(sM2 - sM1) / 1.0)); for (let k = 1; k < nE; k++) poly.push(edge(sM1 + (sM2 - sM1) * k / nE)); bez(M2, K2, A2, 7, poly);
  const shape = poly.map(p => new THREE.Vector2(p[0], p[1])); let area = 0; for (let i = 0; i < shape.length; i++) { const a = shape[i], b = shape[(i + 1) % shape.length]; area += a.x * b.y - b.x * a.y; } if (Math.abs(area) < 0.5) return null;
  const tris = THREE.ShapeUtils.triangulateShape(shape, []); if (!tris.length) return null;
  const dB = rProject(q, bp.x, bp.z).d, pos = [], info = [], idx = [];
  for (const p of poly) { const pq = rProject(q, p[0], p[1]), a = clamp((pq.d - q.w / 2) / Math.max(0.6, dB - q.w / 2), 0, 1), y = lerp(pq.y, bp.y, a); pos.push(p[0], y + 0.035, p[1]); info.push(0.5, 0, r.w); }
  for (const t of tris) idx.push(t[0], t[2], t[1]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('rinfo', new THREE.Float32BufferAttribute(info, 3)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getY(0) < 0) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g.computeVertexNormals(); }
  const mt = rType(q) === 'path' || rType(q) === 'trail' ? rType(r) : rType(q); const m = new THREE.Mesh(g, roadMat2(mt, { fill: true, prio: 1 })); m.receiveShadow = true; return m;
}
const CURB_M = () => RMAT.curb || (RMAT.curb = new THREE.MeshStandardMaterial({ color: '#b9b5ab', roughness: 0.9, side: THREE.DoubleSide }));
makeRoadMesh = function (r) {
  const group = new THREE.Group(), type = rType(r); r.frames = roadFrames(r); const L = rLen(r); if (!r.gaps) { r.gaps = []; r.trim = [0, 0]; r.stop = [null, null]; r.xw = []; r.tAt = [null, null]; }
  const s0 = r.trim[0], s1 = L - r.trim[1]; if (s1 - s0 < 0.3) return group;
  const F = stripFrames(r, s0, s1, r.user || r.dev ? 1.0 : 2.0), half = r.w / 2, prio = r.user ? 3 : 2;
  const gL = r.gaps.filter(g => !g.foot && g.side < 0).map(g => [g.s0, g.s1]), gR = r.gaps.filter(g => !g.foot && g.side > 0).map(g => [g.s0, g.s1]);
  const mat = roadMat2(type, { prio, lines: r.lines, center: r.lines && type === 'asphalt', gapsL: gL, gapsR: gR, xw: r.xw, stop0: r.stop[0] ? { d: s0 + 0.15, lane: r.stop[0].lane } : null, stop1: r.stop[1] ? { d: s1 - 0.15, lane: r.stop[1].lane } : null });
  const yl = type === 'dirt' || type === 'trail' || type === 'gravel' ? 0.03 : 0.04;
  group.add(ribbonMesh(F, -half, half, yl, yl, r.w, mat, [0, 1]));
  // rounded caps at free ends
  const ragged = type === 'dirt' || type === 'trail' || type === 'gravel';
  if (!ragged) { const capM = roadMat2(type, { fill: true, prio: prio - 1 });
    if (!r.tAt[0]) { const p = rAt(r, 0); group.add(capDisc(p.x, p.z, p.y + yl - 0.004, half, capM, r.w)); }
    if (!r.tAt[1] && !(r === ROADS[0] && !r.user)) { const p = rAt(r, L); group.add(capDisc(p.x, p.z, p.y + yl - 0.004, half, capM, r.w)); } }
  // fillets where this road joins another
  for (const T of RN.T) if (T.r === r && !T.foot) { const fm = filletMesh(T); if (fm) group.add(fm); }
  // sidewalks: paver strip + curb face + outer face, broken where other roads join
  if (r.side) { const sm = roadMat2('path', { side: true, prio }), H = 0.16;
    for (const sd of [-1, 1]) { const gaps = r.gaps.filter(g => !g.foot && g.side === sd); const inGap = f => gaps.some(g => f.dist > g.s0 - 0.6 && f.dist < g.s1 + 0.6);
      for (const run of runs(F, inGap)) { const a = sd * half, b = sd * (half + SIDEW); group.add(ribbonMesh(run, sd < 0 ? b : a, sd < 0 ? a : b, H, H, SIDEW, sm, sd < 0 ? [1, 0] : [0, 1]));
        const cm = CURB_M(); group.add(ribbonMesh(run, a, a, yl, H, 0.2, cm, [0, 1])); group.add(ribbonMesh(run, b, b, H, -0.12, 0.2, cm, [0, 1])); } } }
  // curbs on the island's original roads
  if (!r.user && !r.dev) { const cp = [], ci = []; let vi = 0;
    for (const sd of [-1, 1]) { const gaps = r.gaps.filter(g => g.side === sd); const skip = (f, i) => gaps.some(g => f.dist > g.s0 && f.dist < g.s1) || (r.bridge && r.bridge[rAt(r, f.dist).i]);
      for (const run of runs(F, skip)) { run.forEach((f, k) => { const ox = f.nx * (half + 0.05) * sd, oz = f.nz * (half + 0.05) * sd; cp.push(f.x + ox, f.y + 0.02, f.z + oz, f.x + ox + f.nx * 0.18 * sd, f.y + 0.16, f.z + oz + f.nz * 0.18 * sd); if (k) { const b = vi + (k - 1) * 2; ci.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); } }); vi += run.length * 2; } }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); cg.setIndex(ci); cg.computeVertexNormals(); const cm = new THREE.Mesh(cg, CURB_M()); cm.receiveShadow = true; group.add(cm); }
  if (r.bridge && r.bridge.some(Boolean)) group.add(makeBridge(r, r.frames));
  return group;
};
function rebuildRoadMeshes() { buildNet(); for (const r of ROADS) { if (r.mesh) { TERR.roadGroup.remove(r.mesh); r.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } r.mesh = makeRoadMesh(r); TERR.roadGroup.add(r.mesh); } }
buildRoadMeshes = function (scene) { TERR.roadGroup = new THREE.Group(); scene.add(TERR.roadGroup); rebuildRoadMeshes(); rebuildDecks(); return TERR.roadGroup; };
// roadDist stores the distance to the road's outer edge as if it were a standard road (centreline distance minus any extra width)
rasterizeRoadDist = function () {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, best = new Float32Array(n * n).fill(1e9), bed = new Uint8Array(n * n);
  for (const r of ROADS) { const extra = Math.max(0, footW(r) / 2 - 3.1), R = footW(r) / 2 + 14, bedR = footW(r) / 2 + 0.6;
    for (let s = 1; s < r.pts.length; s++) { const a = r.pts[s - 1], b = r.pts[s], vx = b[0] - a[0], vz = b[1] - a[1], ll = vx * vx + vz * vz || 1;
      for (let j = Math.max(0, Math.floor((Math.min(a[1], b[1]) - R - h0) / cell)); j <= Math.min(n - 1, Math.ceil((Math.max(a[1], b[1]) + R - h0) / cell)); j++)
        for (let i = Math.max(0, Math.floor((Math.min(a[0], b[0]) - R - h0) / cell)); i <= Math.min(n - 1, Math.ceil((Math.max(a[0], b[0]) + R - h0) / cell)); i++) {
          const x = h0 + i * cell, z = h0 + j * cell, t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / ll, 0, 1), dc = Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t), d = Math.max(0, dc - extra), k = j * n + i; if (d < best[k]) best[k] = d; if (dc < bedR) bed[k] = 1; } } }
  G.roadDist = best; G.roadBed = bed;
};
// cut & fill: flat bed under the road (and sidewalks), side slopes whose length grows with the height difference
carveSingleRoad = function (r) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, half = r.w / 2, fh = footW(r) / 2, sh = isFoot(r) ? 0.35 : 0.9, maxB = 16, R = fh + sh + maxB, best = new Map();
  for (let s = 1; s < r.pts.length; s++) { const a = r.pts[s - 1], b = r.pts[s], vx = b[0] - a[0], vz = b[1] - a[1], ll = vx * vx + vz * vz || 1;
    for (let j = Math.max(0, Math.floor((Math.min(a[1], b[1]) - R - h0) / cell)); j <= Math.min(n - 1, Math.ceil((Math.max(a[1], b[1]) + R - h0) / cell)); j++)
      for (let i = Math.max(0, Math.floor((Math.min(a[0], b[0]) - R - h0) / cell)); i <= Math.min(n - 1, Math.ceil((Math.max(a[0], b[0]) + R - h0) / cell)); i++) {
        const x = h0 + i * cell, z = h0 + j * cell, t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / ll, 0, 1), d = Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t), k = j * n + i;
        const prev = best.get(k); if (!prev || d < prev[0]) best.set(k, [d, lerp(r.h[s - 1], r.h[s], t), (r.bridge && (r.bridge[s - 1] || r.bridge[s]))]); } }
  let i0 = n, j0 = n, i1 = 0, j1 = 0;
  for (const [k, [d, y, br]] of best) {
    if (G.prot[k] || (G.roadBed ? G.roadBed[k] : G.roadDist[k] < 4.6)) continue; if (br && (!isNaN(G.Wl[k]) || d < half + 1)) continue;
    const tgt = r.side && d > half + 0.1 && d < fh + 0.2 ? y + 0.03 : y - (isFoot(r) ? 0.06 : 0.08), H = G.H[k];
    if (d < fh + sh) G.H[k] = tgt; else { const L = clamp(Math.abs(tgt - H) * 1.7, 1.2, maxB), t = (d - fh - sh) / L; if (t < 1) G.H[k] = lerp(tgt, H, t * t * (3 - 2 * t)); else continue; }
    if (!isNaN(G.Wl[k]) && G.H[k] > G.Wl[k] + 0.2) G.Wl[k] = NaN;
    const i = k % n, j = Math.floor(k / n); i0 = Math.min(i0, i); j0 = Math.min(j0, j); i1 = Math.max(i1, i); j1 = Math.max(j1, j);
  }
  return [i0, j0, i1, j1];
};
// ---------- planning a new road ----------
function snapNode(p, foot) {
  const sn = nearestOnRoads(p.x, p.z, foot ? 4 : 5.5, false); if (!sn) return { x: p.x, z: p.z, snap: null };
  const r = sn.road, L = rLen(r), pr = rProject(r, sn.x, sn.z);
  if (pr.s < 3.5 || pr.s > L - 3.5) { const atEnd = pr.s > L / 2, P = atEnd ? r.pts[r.pts.length - 1] : r.pts[0]; return { x: P[0], z: P[1], snap: { x: P[0], z: P[1], y: atEnd ? r.h[r.h.length - 1] : r.h[0], road: r, end: atEnd ? 1 : 0 } }; }
  return { x: sn.x, z: sn.z, snap: sn };
}
function curTypeW() { const T = RTYPES[EDIT.rtype] || RTYPES.asphalt; if (typeof T.w === 'number') return T.w; if (EDIT.roadW === 'wide' && !GAME.canUse('road', 'wide')) EDIT.roadW = 'narrow'; return T.w[EDIT.roadW] || T.w.narrow; }
planUserRoad = function (nodes) {
  const pts = roadPathFrom(nodes); if (!pts) return { err: '点をもう1つ置いてください' };
  const type = EDIT.rtype, T = RTYPES[type], w = curTypeW(), side = !!(EDIT.rside && T.side), r = { pts, w, lines: type === 'asphalt' && w >= 6, user: true, type, side };
  const fixes = [nodes[0].snap ? { i: 0, y: nodes[0].snap.y } : null, nodes[nodes.length - 1].snap ? { i: pts.length - 1, y: nodes[nodes.length - 1].snap.y } : null];
  // crossing existing roads: this road gives way, so it takes their height there
  const tmp = { pts, h: pts.map(() => 0) }; const crossFix = [];
  for (const q of ROADS) { for (const c of rCross(tmp, q)) { if (c.s < 2.5 || c.s > rLen(tmp) - 2.5) continue; const qa = rAt(q, c.sq); if (q.bridge && q.bridge[qa.i]) return { r: Object.assign(r, { h: pts.map(() => 0), bridge: pts.map(() => false) }), err: '橋とは交差できません' }; const i = Math.round(c.s / (rLen(tmp) / (pts.length - 1))); if (!isFoot(r) && isFoot(q)) continue; crossFix.push({ i: clamp(i, 1, pts.length - 2), y: qa.y }); } }
  // bridges: decks over inland water are pinned into the same profile (no long ramps pushing the road up)
  const wet = pts.map(([x, z]) => { const L = waterLevelAt(G, x, z); return !isNaN(L) && L > groundH(x, z) + 0.1; }); r.bridge = wet.map((b, i) => b || wet[i - 1] || wet[i + 1] || false);
  const deckFix = []; r.bridge.forEach((b, i) => { if (!b || crossFix.some(f => f.i === i) || (fixes[0] && i === 0) || (fixes[1] && i === pts.length - 1)) return; const [x, z] = pts[i], L = waterLevelAt(G, x, z); deckFix.push({ i, y: (isNaN(L) ? groundH(x, z) : L) + 1.9 }); });
  const pf = roadProfile(pts, w, type, fixes.concat(crossFix, deckFix)); r.h = pf.h;
  if (fixes[0] && fixes[1] && Math.abs(fixes[1].y - fixes[0].y) > T.grade * rLen(r) * 1.05) return { r, err: `つなぐ先との高さの差が大きすぎます（坂は${Math.round(T.grade * 100)}%まで）。遠回りに引いてね` };
  if (pf.steep) return { r, err: `坂が急すぎます（${T.name}は${Math.round(T.grade * 100)}%まで）。ジグザグに引くか、地形をならしてね` };
  if (pf.worst > T.cut && !r.bridge[pf.wi]) return { r, err: `地形との高さの差が${pf.worst.toFixed(1)}mあります（${T.cut}mまで）。もっと地面にそって引くか、地形をならしてね` };
  for (let i = 0; i < pts.length; i++) if (r.bridge[i]) { const L = waterLevelAt(G, pts[i][0], pts[i][1]), base = isNaN(L) ? groundH(pts[i][0], pts[i][1]) : L; if (r.h[i] - base > 7) return { r, err: '谷が深すぎて橋をかけられません（川の近くでは低いところを通してね）' }; }
  let run = 0, maxRun = 0; r.bridge.forEach(b => { run = b ? run + 1 : 0; maxRun = Math.max(maxRun, run); });
  if (maxRun * 2 > 50) return { r, err: '橋が長すぎます（50mまで）' }; if (isFoot(r) && maxRun) return { r, err: '歩道では川や池をわたれません' };
  const fw = footW(r);
  for (let i = 0; i < pts.length; i++) { const [x, z] = pts[i];
    if (Math.abs(x) > 340 || Math.abs(z) > 340) return { r, err: '島の外です' };
    if (!r.bridge[i] && groundH(x, z) < -0.4) return { r, err: '海の上には道をつくれません（うめてから作ってね）' };
    for (const c of collidersNear(x, z)) { if (c.off || !(c.kind === 'bld' || c.kind === 'pole' || c.kind === 'farm')) continue; if (hitsCollider(c, x, z, fw / 2)) return { r, err: c.kind === 'pole' ? '電柱にぶつかります' : c.kind === 'farm' ? '田んぼや畑にぶつかります' : 'たてものにぶつかります' }; }
    const nearEnd = (nodes[0].snap && i < 6) || (nodes[nodes.length - 1].snap && i > pts.length - 7);
    if (!GAME.openAt(x, z) && !nearEnd) return { r, err: GAME.lockText(x, z) };
    const [i2, j2] = toIdx(x, z); if (G.prot[j2 * WORLD.n + i2] && !nearEnd && !crossFix.some(f => Math.abs(f.i - i) < 4)) return { r, err: 'たてもの・港の近くには道をつくれません' };
  }
  return { r, err: null };
};
addRoadNode = function (p) {
  const node = snapNode(p, RTYPES[EDIT.rtype] && RTYPES[EDIT.rtype].foot); const last = EDIT.nodes[EDIT.nodes.length - 1];
  if (last && Math.hypot(last.x - node.x, last.z - node.z) < 1.5) { finishRoad(); return; }
  EDIT.nodes.push(node); updateRoadPreview(null); UI.editHint();
};
updateRoadPreview = function (hover) {
  while (MARKERS.children.length) MARKERS.remove(MARKERS.children[0]);
  if (EDIT.roadMode === 'side') { PREVIEW.visible = false; const hit = hover && nearestOnRoads(hover.x, hover.z, 4, true); if (hit && RTYPES[rType(hit.road)].side) { const r = hit.road, w = r.w + SIDEW * 2; PREVIEW.geometry.dispose(); PREVIEW.geometry = ribbonGeo(r.pts.map((p, i) => [p[0], p[1], r.h[i]]), w, 0.3); PREVIEW.material.color.set(r.side ? '#ffb36b' : '#7cf0a0'); PREVIEW.visible = true; } return; }
  const foot = RTYPES[EDIT.rtype] && RTYPES[EDIT.rtype].foot, nodes = EDIT.nodes.slice(); if (hover && EDIT.tool === 'road') nodes.push(snapNode(hover, foot));
  for (const nd of nodes) { const m = new THREE.Mesh(new THREE.CylinderGeometry(nd.snap ? 0.35 : 0.25, nd.snap ? 0.35 : 0.25, 1.6, 10), new THREE.MeshBasicMaterial({ color: nd.snap ? (nd.snap.end !== undefined ? '#b06cf0' : '#3aa7c9') : '#f2a541' })); m.position.set(nd.x, surfaceY(nd.x, nd.z) + 0.8, nd.z); MARKERS.add(m); }
  if (nodes.length < 2) { PREVIEW.visible = false; EDIT.plan = null; return; }
  const plan = planUserRoad(nodes); EDIT.plan = plan; if (!plan.r) { PREVIEW.visible = false; return; }
  PREVIEW.geometry.dispose(); PREVIEW.geometry = ribbonGeo(plan.r.pts.map((p, i) => [p[0], p[1], plan.r.h[i]]), footW(plan.r), 0.25);
  PREVIEW.material.color.set(plan.err ? '#ff6f6f' : '#7cf0a0'); PREVIEW.visible = true;
};
// ---------- committing: split at crossings, merge extensions, carve, rebuild ----------
function blendEnd(pc, atEnd, y, R = 9) { const L = rLen(pc), c = rCum(pc); pc.h = pc.h.map((hh, i) => { const dd = atEnd ? L - c[i] : c[i]; if (dd >= R) return hh; const k = dd / R; return lerp(y, hh, k * k * (3 - 2 * k)); }); }
function sameKind(a, b) { return a && b && a.user && rType(a) === rType(b) && Math.abs(a.w - b.w) < 0.05 && !!a.side === !!b.side; }
function smoothJoint(pts, j, R = 4) { for (let it = 0; it < 3; it++) { const c = pts.map(p => p.slice()); for (let i = Math.max(1, j - R); i <= Math.min(pts.length - 2, j + R); i++) { pts[i][0] = (c[i - 1][0] + c[i][0] * 2 + c[i + 1][0]) / 4; pts[i][1] = (c[i - 1][1] + c[i][1] * 2 + c[i + 1][1]) / 4; } } }
function mergeRoads(a, aEnd, b, bEnd) { // join a's end aEnd (0/1) to b's end bEnd
  const ap = aEnd ? a.pts.slice() : a.pts.slice().reverse(), ah = aEnd ? a.h.slice() : a.h.slice().reverse(), ab = aEnd ? (a.bridge || []).slice() : (a.bridge || []).slice().reverse();
  const bp = bEnd ? b.pts.slice().reverse() : b.pts.slice(), bh = bEnd ? b.h.slice().reverse() : b.h.slice(), bb = bEnd ? (b.bridge || []).slice().reverse() : (b.bridge || []).slice();
  const pts = ap.concat(bp.slice(1)).map(p => p.slice()), h = ah.concat(bh.slice(1)), br = ab.concat(bb.slice(1)); smoothJoint(pts, ap.length - 1);
  return Object.assign({}, a, { pts, h, bridge: br, lines: a.lines || b.lines });
}
finishRoad = function () {
  if (EDIT.nodes.length < 2) { UI.toast('道の点を2つ以上置いてください'); return; }
  const plan = planUserRoad(EDIT.nodes); if (plan.err) { UI.toast(plan.err); return; }
  pushUndo(); const nodes = EDIT.nodes, r = plan.r, foot = isFoot(r);
  // 1) the new road gives way at crossings: split it there (a road crossing a footpath splits the footpath instead)
  let pieces = [r]; const others = ROADS.slice();
  for (const q of others) { const next = []; for (const pc of pieces) { const cs = rCross(pc, q).filter(c => c.s > 1.2 && c.s < rLen(pc) - 1.2);
      if (!cs.length) { next.push(pc); continue; }
      if (!foot && isFoot(q) && q.user) { // split the footpath
        let qs = [q]; for (const c of rCross(q, pc)) { const tgt = qs.find(x => rProject(x, c.x, c.z).d < 0.5); if (!tgt) continue; const pr = rProject(tgt, c.x, c.z), L = rLen(tgt); if (pr.s < 1 || pr.s > L - 1) continue; const A = rSlice(tgt, 0, pr.s), B = rSlice(tgt, pr.s, L); const y = rAt(pc, rProject(pc, c.x, c.z).s).y; blendEnd(A, true, y, 7); blendEnd(B, false, y, 7); qs.splice(qs.indexOf(tgt), 1, A, B); }
        const i = ROADS.indexOf(q); ROADS.splice(i, 1, ...qs); TERR.roadGroup.remove(q.mesh); next.push(pc); continue; }
      let s0 = 0, y0 = null; for (const c of cs) { const yq = rAt(q, c.sq).y; if (c.s - s0 > 1.5) { const A = rSlice(pc, s0, c.s); if (y0 !== null) A.h[0] = y0; A.h[A.h.length - 1] = yq; next.push(A); } s0 = c.s; y0 = yq; } if (rLen(pc) - s0 > 1.5) { const B = rSlice(pc, s0, rLen(pc)); if (y0 !== null) B.h[0] = y0; next.push(B); } }
    pieces = next; }
  // 2) extensions: continue an existing road of the same kind instead of overlapping it
  const n0 = nodes[0].snap, n1 = nodes[nodes.length - 1].snap; let first = pieces[0], last = pieces[pieces.length - 1];
  if (n0 && n0.end !== undefined && sameKind(n0.road, first)) { const q = n0.road; const m = mergeRoads(q, n0.end, first, 0); ROADS.splice(ROADS.indexOf(q), 1); TERR.roadGroup.remove(q.mesh); pieces[0] = m; if (last === first) last = m; first = m; }
  if (n1 && n1.end !== undefined && sameKind(n1.road, last) && n1.road !== (n0 && n0.road)) { const q = n1.road; const m = mergeRoads(last, 1, q, n1.end); ROADS.splice(ROADS.indexOf(q), 1); TERR.roadGroup.remove(q.mesh); pieces[pieces.length - 1] = m; }
  let i0 = 1e9, j0 = 1e9, i1 = -1e9, j1 = -1e9;
  for (const pc of pieces) { const box = carveSingleRoad(pc); i0 = Math.min(i0, box[0]); j0 = Math.min(j0, box[1]); i1 = Math.max(i1, box[2]); j1 = Math.max(j1, box[3]); ROADS.push(pc); }
  rasterizeRoadDist(); rebuildDecks(); rebuildRoadMeshes();
  if (i1 >= i0) refreshRegion(i0 - 2, j0 - 2, i1 + 2, j1 + 2);
  EDIT.nodes = []; updateRoadPreview(null); UI.toast(foot ? '歩道ができました！' : `${RTYPES[r.type].name}の道ができました！`); scheduleSave(); UI.editHint();
  let len = 0; for (let k = 1; k < r.pts.length; k++) len += Math.hypot(r.pts[k][0] - r.pts[k - 1][0], r.pts[k][1] - r.pts[k - 1][1]); GAME.ev('roadN', 1); GAME.ev('roadM', Math.round(len));
};
removeUserRoad = function (r) {
  pushUndo(); ROADS.splice(ROADS.indexOf(r), 1); if (r.mesh) { TERR.roadGroup.remove(r.mesh); r.mesh.traverse(o => o.geometry && o.geometry.dispose()); }
  rasterizeRoadDist(); rebuildDecks(); rebuildRoadMeshes(); const xs = r.pts.map(p => p[0]), zs = r.pts.map(p => p[1]); const a = toIdx(Math.min(...xs) - 10, Math.min(...zs) - 10), b = toIdx(Math.max(...xs) + 10, Math.max(...zs) + 10);
  refreshRegion(a[0], a[1], b[0], b[1]); UI.toast('道路を消しました'); scheduleSave();
};
// add / remove sidewalks on an existing road
function toggleSidewalk(p) {
  const hit = nearestOnRoads(p.x, p.z, 4, true); if (!hit) { UI.toast('あなたが作った道路をクリックしてね'); return; } const r = hit.road;
  if (!RTYPES[rType(r)].side) { UI.toast('歩道をつけられるのはアスファルトと石畳の道です'); return; }
  if (!r.side) { const fw = r.w / 2 + SIDEW; for (const [x, z] of r.pts) for (const c of collidersNear(x, z)) { if (c.off || !(c.kind === 'bld' || c.kind === 'pole')) continue; if (hitsCollider(c, x, z, fw)) { UI.toast('歩道をつけると、たてものや電柱にぶつかります'); return; } } }
  pushUndo(); r.side = !r.side; let box = [0, 0, -1, -1]; if (r.side) { const d0 = G.roadDist; rasterizeRoadDistExcept(r); box = carveSingleRoad(r); G.roadDist = d0; }
  rasterizeRoadDist(); rebuildRoadMeshes(); if (box[2] >= box[0]) refreshRegion(box[0] - 2, box[1] - 2, box[2] + 2, box[3] + 2); else { const xs = r.pts.map(p => p[0]), zs = r.pts.map(p => p[1]); const a = toIdx(Math.min(...xs) - 10, Math.min(...zs) - 10), b = toIdx(Math.max(...xs) + 10, Math.max(...zs) + 10); refreshRegion(a[0], a[1], b[0], b[1]); }
  UI.toast(r.side ? '🚶 歩道をつけました' : '歩道を外しました'); scheduleSave(); updateRoadPreview(EDIT.hover);
}
function rasterizeRoadDistExcept(r) { const keep = ROADS; ROADS = ROADS.filter(q => q !== r); rasterizeRoadDist(); ROADS = keep; }
// ---------- save / undo ----------
snapshot = function () { return { H: new Float32Array(G.H), Wl: new Float32Array(G.Wl), roads: ROADS.filter(r => r.user).map(r => ({ pts: r.pts.map(p => p.slice()), w: r.w, lines: r.lines, h: r.h.slice(), bridge: (r.bridge || []).slice(), type: rType(r), side: !!r.side })), removed: new Uint8Array(VEG.removed), trees: VEG.userTrees.map(t => ({ ...t })) }; };
restore = function (s) {
  G.H.set(s.H); G.Wl.set(s.Wl);
  for (const r of ROADS.filter(r => r.user)) { TERR.roadGroup.remove(r.mesh); r.mesh && r.mesh.traverse(o => o.geometry && o.geometry.dispose()); }
  ROADS = ROADS.filter(r => !r.user);
  for (const q of s.roads) ROADS.push({ pts: q.pts.map(p => p.slice()), w: q.w, lines: q.lines, h: q.h.slice(), bridge: (q.bridge || q.pts.map(() => false)).slice(), user: true, type: q.type || 'asphalt', side: !!q.side });
  normalizeCrossings(); rasterizeRoadDist(); rebuildDecks(); rebuildRoadMeshes();
  VEG.removed.set(s.removed); VEG.userTrees = s.trees.map(t => ({ ...t }));
  refreshAll();
};
// older islands may have user roads drawn across each other: split the later one so every meeting point becomes a proper junction
function normalizeCrossings() {
  const made = [];
  for (let guard = 0; guard < 60; guard++) { let did = false;
    outer: for (let a = 0; a < ROADS.length; a++) for (let b = 0; b < ROADS.length; b++) { const r = ROADS[b], q = ROADS[a]; if (a === b || !r.user) continue; const fr = isFoot(r), fq = isFoot(q); if (!fr && fq) continue; if (fr === fq && a > b && q.user) continue;
      const cs = rCross(r, q).filter(c => c.s > 1.2 && c.s < rLen(r) - 1.2 && c.sq > 1.2 && c.sq < rLen(q) - 1.2); if (!cs.length) continue;
      const c = cs[0], y = rAt(q, c.sq).y, A = rSlice(r, 0, c.s), B = rSlice(r, c.s, rLen(r)); blendEnd(A, true, y, 10); blendEnd(B, false, y, 10);
      ROADS.splice(b, 1, A, B); const mi = made.indexOf(r); if (mi >= 0) made.splice(mi, 1); made.push(A, B); did = true; break outer; }
    if (!did) break; }
  // re-seat the split pieces on the ground (their ends now meet the other road's height)
  if (made.length) { const keep = ROADS; ROADS = ROADS.filter(q => !made.includes(q)); rasterizeRoadDist(); ROADS = keep; for (const pc of made) carveSingleRoad(pc); }
  return made;
}
// ---------- minimap & edit panel ----------
const RCOL = { asphalt: '#eef0f2', stone: '#d8d2c4', gravel: '#e2d8c0', dirt: '#c8a87a', path: '#f2c8b8', trail: '#d8b88a' };
{ const _ep = UI.editPanel; UI.editPanel = function () { _ep.apply(this, arguments); if (!EDIT.on || EDIT.tool !== 'road') return; const sb = document.querySelector('#editp .sub'); if (!sb) return; const seg = sb.querySelector('.seg'); if (seg) seg.remove();
    const T = RTYPES[EDIT.rtype], canW = GAME.canUse('road', 'wide'), mode = EDIT.roadMode;
    const html = `<div class="rtypes">${Object.entries(RTYPES).map(([k, t]) => `<button data-rt="${k}" class="${EDIT.rtype === k && mode === 'draw' ? 'on' : ''}">${t.icon} ${t.name}</button>`).join('')}<button data-rm="side" class="${mode === 'side' ? 'on' : ''}">🚶 歩道をつける/外す</button></div>
      ${mode === 'draw' && typeof T.w === 'object' ? `<div class="seg"><button data-rw2="narrow" class="${EDIT.roadW !== 'wide' ? 'on' : ''}">細い</button><button data-rw2="wide" class="${EDIT.roadW === 'wide' ? 'on' : ''} ${canW ? '' : 'lk'}">${canW ? '' : '🔒'}広い${EDIT.rtype === 'asphalt' ? '（白線）' : ''}</button><label class="ck"><input type="checkbox" id="rside" ${EDIT.rside ? 'checked' : ''}> 歩道つき</label></div>` : ''}`;
    sb.insertAdjacentHTML('afterbegin', html);
    sb.querySelectorAll('[data-rt]').forEach(b => b.onclick = e => { e.stopPropagation(); EDIT.rtype = b.dataset.rt; EDIT.roadMode = 'draw'; updateRoadPreview(EDIT.hover); UI.editPanel(); document.getElementById('c').focus(); });
    sb.querySelectorAll('[data-rm]').forEach(b => b.onclick = e => { e.stopPropagation(); EDIT.roadMode = EDIT.roadMode === 'side' ? 'draw' : 'side'; EDIT.nodes = []; updateRoadPreview(EDIT.hover); UI.editPanel(); document.getElementById('c').focus(); });
    sb.querySelectorAll('[data-rw2]').forEach(b => b.onclick = e => { e.stopPropagation(); if (!GAME.canUse('road', b.dataset.rw2)) { UI.toast(`広い道は元気度Lv${ROADW_LV.wide}で作れるようになります`); return; } EDIT.roadW = b.dataset.rw2; updateRoadPreview(EDIT.hover); UI.editPanel(); document.getElementById('c').focus(); });
    const ck = sb.querySelector('#rside'); if (ck) ck.onchange = () => { EDIT.rside = ck.checked; updateRoadPreview(EDIT.hover); document.getElementById('c').focus(); };
    if (mode === 'side') sb.querySelectorAll('[data-a="finish"],[data-a="back"]').forEach(b => b.hidden = true); }; }
{ const _eh = UI.editHint; UI.editHint = function () { const h = document.getElementById('editHint'); if (h && EDIT.on && EDIT.tool === 'road' && EDIT.roadMode === 'side') { h.textContent = 'あなたが作ったアスファルト・石畳の道をクリックすると、両側に歩道がつきます（もう一度クリックで外す）'; return; } return _eh.apply(this, arguments); }; }
{ const _pd = editPointerDown; editPointerDown = function (e) { if (EDIT.tool === 'road' && EDIT.roadMode === 'side') { const p = pickSurface(e.clientX, e.clientY); if (p) toggleSidewalk(p); return; } return _pd(e); }; }
{ const _st = setTool; setTool = function (id) { if (id !== 'road') EDIT.roadMode = 'draw'; return _st(id); }; }

queueMicrotask(() => { const _dr = GAME.devRoad; GAME.devRoad = function () { const r = _dr.apply(this, arguments); try { rebuildRoadMeshes(); } catch (e) { console.warn(e); } return r; }; });
