// ===================== 足もとの高さを、見えている地面（歩道・道路の段差）に合わせる =====================
// sidewalks are drawn 0.16m above the road; the walk height used to ignore them, so feet sank into the paving
const SIDEWALK_H = 0.16;
{ const _mk = makeRoadMesh; makeRoadMesh = function (r) {
  const g = _mk.apply(this, arguments);
  try { r._sw = null; if (r.frames) { const L = rLen(r), s0 = r.trim ? r.trim[0] : 0, s1 = L - (r.trim ? r.trim[1] : 0); if (s1 - s0 > 0.3) { const F = stripFrames(r, s0, s1, 1.0); let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const f of F) { x0 = Math.min(x0, f.x); x1 = Math.max(x1, f.x); z0 = Math.min(z0, f.z); z1 = Math.max(z1, f.z); } const pad = r.w / 2 + (r.side ? SIDEW : 0) + 1; r._sw = { F, bb: [x0 - pad, z0 - pad, x1 + pad, z1 + pad] }; } } } catch (e) { r._sw = null; }
  return g;
}; }
function sidewalkY(x, z) {
  if (typeof ROADS === 'undefined') return null; let out = null; const top = y => { if (out === null || y > out) out = y; };
  for (const r of ROADS) {
    const S = r._sw; if (!S || x < S.bb[0] || x > S.bb[2] || z < S.bb[1] || z > S.bb[3]) continue;
    const F = S.F, half = r.w / 2; let best = -1, bd = 1e9;
    for (let i = 0; i < F.length; i++) { const f = F[i], d = (x - f.x) * (x - f.x) + (z - f.z) * (z - f.z); if (d < bd) { bd = d; best = i; } }
    const rr = half + (r.side ? SIDEW : 0) + 1; if (best < 0 || bd > rr * rr + 4) continue;
    const f = F[best], lat = (x - f.x) * f.nx + (z - f.z) * f.nz, al = Math.abs(lat);
    const alg = (x - f.x) * f.tx + (z - f.z) * f.tz, g2 = alg >= 0 ? F[best + 1] : F[best - 1]; let fy = f.y; if (g2) { const seg = Math.hypot(g2.x - f.x, g2.z - f.z) || 1; fy = f.y + (g2.y - f.y) * Math.min(1, Math.abs(alg) / seg); }   // between frames: a smooth slope, not 1 m stairs
    if ((r.cuts || []).some(([a, b]) => f.dist > a - 0.3 && f.dist < b + 0.3)) continue; // a junction plate (JN.walkY)
    if (best === 0 || best === F.length - 1) { const tx = -f.nz, tz = f.nx, along = (x - f.x) * tx + (z - f.z) * tz; if (Math.abs(along) > 0.9) continue; }
    if (al <= half) { const ty = rType(r), yl = ty === 'dirt' || ty === 'trail' || ty === 'gravel' ? 0.03 : 0.04; top(fy + yl); continue; }
    if (!r.side || al > half + SIDEW + 0.02) continue;
    const sd = lat < 0 ? -1 : 1; if ((r.gaps || []).some(g => !g.foot && g.side === sd && f.dist > g.s0 - 0.6 && f.dist < g.s1 + 0.6)) continue;
    top(fy + SIDEWALK_H);
  }
  return out;
}
{ const _sy = standY; standY = function (x, z) { const b = _sy(x, z); let s = sidewalkY(x, z); const j = typeof JN !== 'undefined' && JN.walk.length ? JN.walkY(x, z) : null; if (j !== null && (s === null || j > s)) s = j; return s !== null && s > b - 0.3 && s < b + 0.5 ? Math.max(b, s) : b; }; }
