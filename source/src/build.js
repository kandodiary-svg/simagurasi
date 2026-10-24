// ===================== BUILDINGS, HARBOR, LIGHTHOUSE, ROADSIDE =====================
const COLL = { cell: 8, map: new Map() }; // colliders: circles {x,z,r} and oriented boxes {x,z,hw,hd,rot}
function addCollider(c) {
  if (COLL.track) COLL.track.push(c);
  const r = c.r || Math.hypot(c.hw, c.hd); c.br = r;
  for (let gx = Math.floor((c.x - r) / COLL.cell); gx <= Math.floor((c.x + r) / COLL.cell); gx++)
    for (let gz = Math.floor((c.z - r) / COLL.cell); gz <= Math.floor((c.z + r) / COLL.cell); gz++) { const k = gx + ',' + gz; if (!COLL.map.has(k)) COLL.map.set(k, []); COLL.map.get(k).push(c); }
}
function collidersNear(x, z) { return COLL.map.get(Math.floor(x / COLL.cell) + ',' + Math.floor(z / COLL.cell)) || []; }
function pushOut(x, z, r) { // resolves a circle of radius r against colliders, returns [x,z]
  for (let it = 0; it < 2; it++) for (const c of collidersNear(x, z)) {
    if (c.off) continue;
    if (c.r !== undefined) { const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = c.r + r; if (d < m && d > 1e-4) { x = c.x + dx / d * m; z = c.z + dz / d * m; } }
    else { const cs = Math.cos(c.rot), sn = Math.sin(c.rot); let lx = (x - c.x) * cs - (z - c.z) * sn, lz = (x - c.x) * sn + (z - c.z) * cs;
      const px = clamp(lx, -c.hw, c.hw), pz = clamp(lz, -c.hd, c.hd), dx = lx - px, dz = lz - pz, d = Math.hypot(dx, dz);
      if (d < r) { if (d > 1e-4) { lx = px + dx / d * r; lz = pz + dz / d * r; } else { const ex = c.hw - Math.abs(lx), ez = c.hd - Math.abs(lz); if (ex < ez) lx = Math.sign(lx || 1) * (c.hw + r); else lz = Math.sign(lz || 1) * (c.hd + r); }
        x = c.x + lx * cs + lz * sn; z = c.z - lx * sn + lz * cs; } }
  }
  return [x, z];
}
const PLACED = { houses: [], shop: null, harbor: null, lighthouse: null, redlight: null, poles: [], spots: {}, clear: [], home: null, hall: null };
const toWorld = (o, lx, lz) => { const cs = Math.cos(o.rot), sn = Math.sin(o.rot); return [o.x + lx * cs + lz * sn, o.z - lx * sn + lz * cs]; };

// ---------- placement (runs before the terrain mesh is built so pads can be leveled) ----------
function flattenPad(x, z, hw, hd, rot, y, margin = 4) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, cs = Math.cos(rot), sn = Math.sin(rot), R = Math.hypot(hw, hd) + margin;
  for (let j = Math.floor((z - R - h0) / cell); j <= Math.ceil((z + R - h0) / cell); j++) for (let i = Math.floor((x - R - h0) / cell); i <= Math.ceil((x + R - h0) / cell); i++) {
    if (i < 0 || j < 0 || i >= n || j >= n) continue; const px = h0 + i * cell - x, pz = h0 + j * cell - z;
    const lx = px * cs - pz * sn, lz = px * sn + pz * cs, dx = Math.max(0, Math.abs(lx) - hw), dz = Math.max(0, Math.abs(lz) - hd), d = Math.hypot(dx, dz);
    const k = j * n + i; if (G.roadDist[k] < 4.5) continue; const w = sstep(0, margin, d); G.H[k] = lerp(y, G.H[k], w);
  }
}
function placeStructures() {
  const R = mulberry(77);
  // houses along roads near the village
  const cands = [];
  for (const r of ROADS) {
    const F = roadFrames(r);
    for (let i = 4; i < F.length - 4; i += 1) {
      const f = F[i]; for (const s of [-1, 1]) {
        const off = r.w / 2 + 8.5, x = f.x + f.nx * off * s, z = f.z + f.nz * off * s;
        const vd = Math.hypot(x - VILLAGE.x, z - VILLAGE.z); if (vd > VILLAGE.r * 1.25) continue;
        cands.push({ x, z, rot: Math.atan2(-f.nx * s, -f.nz * s), d: vd + R() * 25 });
      }
    }
  }
  cands.sort((a, b) => a.d - b.d);
  const okSpot = (x, z, rad) => {
    if (groundH(x, z) < 2.2) return false;
    for (const r of ROADS) for (const p of r.pts) if (Math.hypot(p[0] - x, p[1] - z) < r.w / 2 + rad - 1.5) return false;
    for (const h of PLACED.houses) if (Math.hypot(h.x - x, h.z - z) < h.rad + rad + 2.5) return false;
    let mn = 1e9, mx = -1e9; for (const [dx, dz] of [[-rad, -rad], [rad, -rad], [-rad, rad], [rad, rad], [0, 0]]) { const h = groundH(x + dx, z + dz); mn = Math.min(mn, h); mx = Math.max(mx, h); }
    return mx - mn < 3.2;
  };
  let shopDone = false;
  for (const c of cands) {
    if (PLACED.houses.length >= 26) break;
    const kind = !shopDone ? 'shop' : R() < 0.62 ? 'minka' : 'modern';
    const w = kind === 'shop' ? 9 : kind === 'minka' ? 7.5 + R() * 2.5 : 7 + R() * 1.5, d = kind === 'shop' ? 7 : 6 + R() * 1.6, rad = Math.max(w, d) / 2 + 0.6;
    if (!okSpot(c.x, c.z, rad)) continue;
    const y = groundH(c.x, c.z) + 0.05;
    const hs = { kind, x: c.x, z: c.z, rot: c.rot, w, d, y, rad, floors: kind === 'modern' ? 2 : R() < 0.3 ? 2 : 1, seed: Math.floor(R() * 1e6), hip: R() < 0.55 };
    PLACED.houses.push(hs); if (kind === 'shop') { shopDone = true; PLACED.shop = hs; }
    flattenPad(c.x, c.z, w / 2 + 1.2, d / 2 + 1.2, c.rot, y, 5);
  }
  // church: flattest open spot near the village, 9-22 m from a road, facing the road
  { let best = null;
    for (let z = VILLAGE.z - 110; z < VILLAGE.z + 60; z += 4) for (let x = VILLAGE.x - 90; x < VILLAGE.x + 90; x += 4) {
      const h0 = groundH(x, z); if (h0 < 3) continue;
      let near = null, nd = 1e9; for (const r of ROADS) for (const p of r.pts) { const d = Math.hypot(p[0] - x, p[1] - z) - r.w / 2; if (d < nd) { nd = d; near = p; } }
      if (nd < 10 || nd > 24) continue;
      if (PLACED.houses.some(h => Math.hypot(h.x - x, h.z - z) < h.rad + 14)) continue;
      let mn = 1e9, mx = -1e9; for (const [dx, dz] of [[-8, -12], [8, -12], [-8, 12], [8, 12], [0, 0], [0, 16], [0, -16], [-8, 0], [8, 0]]) { const hh = groundH(x + dx, z + dz); mn = Math.min(mn, hh); mx = Math.max(mx, hh); }
      const score = (mx - mn) + Math.hypot(x - VILLAGE.x, z - VILLAGE.z) * 0.02;
      if (!best || score < best.score) best = { x, z, score, mn, mx, rot: Math.atan2(near[0] - x, near[1] - z) };
    }
    if (best) { const y = (best.mn + best.mx) / 2 + 0.05; PLACED.church = { x: best.x, z: best.z, y, rot: best.rot }; flattenPad(best.x, best.z, 7, 15, best.rot, y, 14); }
  }
  // player's home: an ordinary house near the harbor whose flank has room for a one-car parking pad
  { const ref = { x: BAY.x + 10, z: BAY.z - 74 }; let best = null;
    for (const hs of PLACED.houses) { if (hs.kind === 'shop') continue;
      for (const side of [1, -1]) {
        const o = { x: hs.x, z: hs.z, rot: hs.rot }, px = side * (hs.w / 2 + 3.4), pz = hs.d / 2 + 1.4; let ok = true, mn = 1e9, mx = -1e9;
        for (let a = -1.8; a <= 1.8 && ok; a += 0.9) for (let b = -3.3; b <= 3.3 && ok; b += 0.825) {
          const [x, z] = toWorld(o, px + a, pz + b), h = groundH(x, z), [i, j] = toIdx(x, z), rd = G.roadDist[j * WORLD.n + i]; mn = Math.min(mn, h); mx = Math.max(mx, h);
          if (h < 1.5 || !isNaN(waterLevelAt(G, x, z)) || rd < (b > 2.4 ? 3.2 : 4.6)) ok = false;
          for (const h2 of PLACED.houses) if (h2 !== hs && Math.hypot(h2.x - x, h2.z - z) < h2.rad + 1.5) ok = false;
          if (PLACED.church && Math.hypot(PLACED.church.x - x, PLACED.church.z - z) < 18) ok = false;
        }
        if (!ok || mx - mn > 2.6) continue; const sc = Math.hypot(hs.x - ref.x, hs.z - ref.z) + (mx - mn) * 6;
        if (!best || sc < best.sc) best = { hs, side, px, pz, sc };
      } }
    if (best) { const hs = best.hs; hs.home = true; hs.kind = 'minka'; hs.floors = 2; hs.hip = false;
      const [cx, cz] = toWorld(hs, best.px, best.pz); PLACED.home = { hs, pad: { x: cx, z: cz, rot: hs.rot, hw: 1.8, hd: 3.3, lx: best.px, lz: best.pz } };
      flattenPad(cx, cz, 2.0, 3.4, hs.rot, hs.y - 0.02, 3); PLACED.clear.push({ x: cx, z: cz, r: 4.6 });
      const fz = hs.d / 2 + 2.6, [mx2, mz2] = toWorld(hs, 1.4, fz + 0.25); PLACED.home.mail = { x: mx2, z: mz2 };
      const [dx, dz] = toWorld(hs, 0, hs.d / 2 + 1.6); PLACED.home.door = { x: dx, z: dz }; } }
  // 集会所 (meeting hall): flat open spot near the village, 9-20 m from a road, facing it
  { let best = null; const HW = 7.5, HD = 7;
    for (let z = VILLAGE.z - 90; z < VILLAGE.z + 70; z += 3) for (let x = VILLAGE.x - 100; x < VILLAGE.x + 80; x += 3) {
      if (groundH(x, z) < 3) continue;
      let near = null, nd = 1e9; for (const r of ROADS) for (const p of r.pts) { const d = Math.hypot(p[0] - x, p[1] - z) - r.w / 2; if (d < nd) { nd = d; near = p; } }
      if (nd < 9 || nd > 20) continue;
      if (PLACED.houses.some(h => Math.hypot(h.x - x, h.z - z) < h.rad + 11)) continue;
      if (PLACED.church && Math.hypot(PLACED.church.x - x, PLACED.church.z - z) < 26) continue;
      if (PLACED.home && Math.hypot(PLACED.home.pad.x - x, PLACED.home.pad.z - z) < 14) continue;
      let mn = 1e9, mx = -1e9; for (const [a, b] of [[-HW, -HD], [HW, -HD], [-HW, HD], [HW, HD], [0, 0], [0, HD + 3], [-HW, 0], [HW, 0]]) { const h = groundH(x + a, z + b); if (!isNaN(waterLevelAt(G, x + a, z + b))) mx = 1e9; mn = Math.min(mn, h); mx = Math.max(mx, h); }
      const sc = (mx - mn) + Math.hypot(x - VILLAGE.x, z - VILLAGE.z) * 0.03;
      if (!best || sc < best.sc) best = { x, z, sc, mn, mx, rot: Math.atan2(near[0] - x, near[1] - z) };
    }
    if (best) { const y = (best.mn + best.mx) / 2 + 0.05; PLACED.hall = { x: best.x, z: best.z, y, rot: best.rot, W: 12, D: 9 }; flattenPad(best.x, best.z, 7, 7.5, best.rot, y, 8); PLACED.clear.push({ x: best.x, z: best.z, r: 11 });
      const [ex, ez] = toWorld(PLACED.hall, 0, 9 / 2 + 2.2); PLACED.hall.entry = { x: ex, z: ez }; } }
  // harbor breakwater: from the bay's east shore heading west across the cove mouth
  { const sx = 18, sz = 300, L = Math.hypot(sx, sz), ox = sx / L, oz = sz / L;
    for (let r = 0; r < 300; r += 1) { const x = sx - ox * r, z = sz - oz * r; if (groundH(x, z) > 0.5) { const bx = -0.5, bz = 0.86; PLACED.harbor = { x: x + ox * 3, z: z + oz * 3, len: 64, dir: Math.atan2(-(ox * 0.6 + bx * 0.4), -(oz * 0.6 + bz * 0.4)) }; break; } } }
  // quay along the inner bay shore near the harbor link road
  // lighthouse on the cape tip (end of the cape road)
  const capeRoad = ROADS[0], end = capeRoad.pts[capeRoad.pts.length - 1];
  const lx = end[0] + (CAPE.b[0] - CAPE.a[0]) * 0.07, lz = end[1] + (CAPE.b[1] - CAPE.a[1]) * 0.07;
  PLACED.lighthouse = { x: lx, z: lz, y: groundH(lx, lz) };
  flattenPad(lx, lz, 7, 7, 0, PLACED.lighthouse.y, 6);
  // utility poles along the main coastal roads (inland side)
  for (const ri of [0]) {
    const r = ROADS[ri], F = roadFrames(r); let acc = 0;
    for (let i = 1; i < F.length; i++) {
      acc += Math.hypot(F[i].x - F[i - 1].x, F[i].z - F[i - 1].z); if (acc < 32) continue; acc = 0;
      const f = F[i], s = (f.nx * -f.x + f.nz * -f.z) > 0 ? 1 : -1; // inland side = toward island centre
      if (r.bridge && (r.bridge[i] || r.bridge[i - 1] || r.bridge[i + 1])) { acc = 20; continue; }
      const x = f.x + f.nx * (r.w / 2 + 1.4) * s, z = f.z + f.nz * (r.w / 2 + 1.4) * s;
      if (!isNaN(waterLevelAt(G, x, z))) { acc = 20; continue; }
      PLACED.poles.push({ x, z, y: groundH(x, z), rot: Math.atan2(f.tx, f.tz) });
    }
  }
  // spawn & notable spots
  const hf = roadFrames(ROADS[0]); let mid = hf[0], md = 1e9; for (const f of hf) { const d = Math.hypot(f.x - (BAY.x + 10), f.z - (BAY.z - 74)); if (d < md) { md = d; mid = f; } }
  PLACED.spots.spawn = PLACED.home ? { x: PLACED.home.door.x, z: PLACED.home.door.z, rot: PLACED.home.hs.rot } : { x: mid.x + mid.nx * 2, z: mid.z + mid.nz * 2 };
}

// ---------- shared materials (world-space UVs, so no UV unwrapping needed) ----------
function worldMat(map, scale, color = '#ffffff', rough = 0.85, extra = {}) {
  const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0 }, extra));
  m.onBeforeCompile = sh => {
    sh.uniforms.tMap = { value: map }; sh.uniforms.uScale = { value: scale };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP2; varying vec3 vWN2;').replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
      #ifdef USE_INSTANCING
        vec4 wp2 = modelMatrix * instanceMatrix * vec4(transformed, 1.0); vWN2 = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
      #else
        vec4 wp2 = modelMatrix * vec4(transformed, 1.0); vWN2 = normalize(mat3(modelMatrix) * objectNormal);
      #endif
      vWP2 = wp2.xyz;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tMap; uniform float uScale; varying vec3 vWP2; varying vec3 vWN2;').replace('#include <map_fragment>', `
      vec3 bn = abs(normalize(vWN2)); bn = pow(bn, vec3(6.0)); bn /= (bn.x + bn.y + bn.z);
      vec3 tc = texture2D(tMap, vWP2.zy * uScale).rgb * bn.x + texture2D(tMap, vWP2.xz * uScale).rgb * bn.y + texture2D(tMap, vWP2.xy * uScale).rgb * bn.z;
      diffuseColor.rgb *= tc;`);
  };
  return m;
}
let MAT = null;
function makeMaterials() {
  MAT = {
    plaster: worldMat(TEX.plaster, 0.35, '#ffffff', 0.92), plasterWarm: worldMat(TEX.plaster, 0.35, '#f3e6cf', 0.92), plasterBlue: worldMat(TEX.plaster, 0.35, '#d6ecf6', 0.9), pMint: worldMat(TEX.plaster, 0.35, '#d8f0dc', 0.9), pPeach: worldMat(TEX.plaster, 0.35, '#ffe2cc', 0.9), pButter: worldMat(TEX.plaster, 0.35, '#fff0c0', 0.9), pPink: worldMat(TEX.plaster, 0.35, '#ffe0e4', 0.9),
    darkwood: worldMat(TEX.wood, 0.5, '#5a4232', 0.8), wood: worldMat(TEX.wood, 0.5, '#c69a6a', 0.75), sugi: worldMat(TEX.wood, 0.6, '#3a3330', 0.85),
    concrete: worldMat(TEX.concrete, 0.18, '#ffffff', 0.95), stone: worldMat(TEX.stonewall, 0.2, '#ffffff', 0.95), rock: worldMat(TEX.rock, 0.15, '#ffffff', 0.95),
    glass: new THREE.MeshStandardMaterial({ color: '#9fc4d8', roughness: 0.05, metalness: 0.35, emissive: new THREE.Color('#ffc46a'), emissiveIntensity: 0 }),
    frame: new THREE.MeshStandardMaterial({ color: '#f4f2ec', roughness: 0.45, metalness: 0.1 }), darkframe: new THREE.MeshStandardMaterial({ color: '#4a4c50', roughness: 0.5, metalness: 0.5 }),
    white: new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6 }), red: new THREE.MeshStandardMaterial({ color: '#c8242b', roughness: 0.5 }), black: new THREE.MeshStandardMaterial({ color: '#2a2b2e', roughness: 0.7 }),
    metal: new THREE.MeshStandardMaterial({ color: '#8d9399', roughness: 0.45, metalness: 0.8 }), pole: worldMat(TEX.concrete, 0.4, '#d8d6cf', 0.85),
    lamp: new THREE.MeshStandardMaterial({ color: '#fff6dc', emissive: new THREE.Color('#ffd27a'), emissiveIntensity: 0 }),
  };
  MAT.kawara = new THREE.MeshStandardMaterial({ map: TEX.kawara, roughness: 0.55, metalness: 0.15, color: '#ffffff' });
  MAT.kawaraRed = new THREE.MeshStandardMaterial({ map: TEX.kawara, roughness: 0.55, metalness: 0.1, color: '#c87a62' });
  MAT.metalRoof = ['#4a6a88', '#8a4038', '#4f6e58', '#9a7450', '#5c5e66'].map(c => new THREE.MeshStandardMaterial({ map: TEX.kawara, color: new THREE.Color(c).multiplyScalar(1.3), roughness: 0.5, metalness: 0.15 }));
  MAT.fence = new THREE.MeshStandardMaterial({ color: '#fbf6ec', roughness: 0.7 }); MAT.soil = worldMat(TEX.dirt, 0.4, '#8a6a4a', 1);
  MAT.flowers = ['#ff6f91', '#ffd84a', '#ffffff', '#b07ae8', '#ff9a3a'].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })); MAT.leafy = new THREE.MeshStandardMaterial({ color: '#5aa040', roughness: 0.9 });
  MAT.glowWin = [MAT.glass];
}
// ---------- geometry helpers ----------
const box = (w, h, d, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; return m; };
const cylM = (rt, rb, h, mat, x, y, z, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
function roofGeometry(W, D, rise, hip) {
  // eave rectangle W x D at y=0, ridge at y=rise. UV: u along eave (m), v up the slope (m) – scaled for the tile texture
  const pos = [], uv = [], idx = [];
  const hw = W / 2, hd = D / 2, rl = hip ? Math.max(0.01, hw - hd) : hw; // ridge half length
  const slopeLen = Math.hypot(hd, rise), sideLen = Math.hypot(hw - rl, rise);
  const quad = (a, b, c, d, ua, ub, uc, ud) => { const o = pos.length / 3; pos.push(...a, ...b, ...c, ...d); uv.push(...ua, ...ub, ...uc, ...ud); idx.push(o, o + 1, o + 2, o, o + 2, o + 3); };
  const k = 1 / 1.35; // texture metres per repeat
  // front (+z) and back (-z) planes
  quad([-hw, 0, hd], [hw, 0, hd], [rl, rise, 0], [-rl, rise, 0], [-hw * k, 0], [hw * k, 0], [rl * k, slopeLen * k], [-rl * k, slopeLen * k]);
  quad([hw, 0, -hd], [-hw, 0, -hd], [-rl, rise, 0], [rl, rise, 0], [-hw * k, 0], [hw * k, 0], [rl * k, slopeLen * k], [-rl * k, slopeLen * k]);
  if (hip) {
    const tri = (a, b, c, ua, ub, uc) => { const o = pos.length / 3; pos.push(...a, ...b, ...c); uv.push(...ua, ...ub, ...uc); idx.push(o, o + 1, o + 2); };
    tri([hw, 0, hd], [hw, 0, -hd], [rl, rise, 0], [-hd * k, 0], [hd * k, 0], [0, sideLen * k]);
    tri([-hw, 0, -hd], [-hw, 0, hd], [-rl, rise, 0], [-hd * k, 0], [hd * k, 0], [0, sideLen * k]);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function gableWalls(W, D, rise, mat) { // triangular gable ends
  const pos = [], idx = [];
  for (const s of [1, -1]) { const o = pos.length / 3; pos.push(-W / 2, 0, s * D / 2, W / 2, 0, s * D / 2, 0, rise, s * D / 2); idx.push(...(s > 0 ? [o, o + 1, o + 2] : [o, o + 2, o + 1])); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
function windowUnit(w, h, lights) { // aluminium sash window with glass and sill
  const g = new THREE.Group();
  g.add(box(w + 0.12, h + 0.12, 0.08, MAT.frame, 0, 0, 0));
  const gl = box(w, h, 0.04, MAT.glass, 0, 0, 0.03); gl.castShadow = false; g.add(gl); if (lights) lights.push(gl);
  g.add(box(0.05, h, 0.06, MAT.frame, 0, 0, 0.05));
  g.add(box(w + 0.25, 0.06, 0.18, MAT.frame, 0, -h / 2 - 0.08, 0.06));
  return g;
}
function signTex(text, bg, fg, w = 512, h = 128, font = 'Mochiy Pop One') {
  const [c, x] = cvs(w, h); x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = `${h * 0.55}px "${font}", "M PLUS Rounded 1c", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h * 0.55);
  return toTex(c, false);
}
// ---------- houses ----------
const HOUSE_LIGHTS = [];
// ---------- the player's home: parking pad, nameplate, mailbox flag ----------
function dynSign(w, h, text, bg, fg, font = 'Mochiy Pop One') { // a plane whose canvas text can be rewritten later
  const [c, x] = cvs(512, Math.round(512 * h / w)); const tex = toTex(c, false);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
  m.userData.keep = true; m.userData.set = (t) => { x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height); x.fillStyle = fg; let fs = c.height * 0.56; x.font = `${fs}px "${font}", "M PLUS Rounded 1c", sans-serif`; while (x.measureText(t).width > c.width * 0.9 && fs > 10) { fs -= 2; x.font = `${fs}px "${font}", "M PLUS Rounded 1c", sans-serif`; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, c.width / 2, c.height * 0.54); tex.needsUpdate = true; };
  m.userData.set(text); return m;
}
function makeHomeExtras(H) {
  const g = new THREE.Group(), hs = H.hs, P = H.pad;
  // parking pad with white lines
  const pt = (() => { const [c, x] = cvs(128, 256); x.fillStyle = '#9a9a96'; x.fillRect(0, 0, 128, 256); for (let k = 0; k < 900; k++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '40,40,40'},0.08)`; x.fillRect(Math.random() * 128, Math.random() * 256, 2, 2); } x.fillStyle = '#f4f4ee'; x.fillRect(4, 0, 7, 256); x.fillRect(117, 0, 7, 256); x.fillRect(4, 4, 120, 7); return toTex(c, false); })();
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(P.hw * 2, P.hd * 2), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(P.x, groundH(P.x, P.z) + 0.05, P.z); pad.rotation.z = P.rot + Math.PI; pad.receiveShadow = true; g.add(pad);
  // wheel stop
  const [wx, wz] = toWorld(hs, P.lx, P.lz - P.hd + 0.5); const ws = box(1.4, 0.12, 0.18, MAT.concrete, wx, groundH(wx, wz) + 0.1, wz, hs.rot); g.add(ws);
  // nameplate on the gate post + mailbox flag (both kept as separate objects so they can change)
  const fz = hs.d / 2 + 2.6, [gx, gz] = toWorld(hs, -1.0, fz + 0.02);
  if (hs.kind !== 'minka') { const post = box(0.2, 1.3, 0.2, MAT.darkwood, gx, hs.y + 0.65, gz, hs.rot); g.add(post); }
  const plate = dynSign(0.8, 0.26, '', '#fbf6ea', '#3a2a1e'); const [px, pz] = toWorld(hs, -1.0, fz + (hs.kind === 'minka' ? 0.2 : 0.13)); plate.position.set(px, hs.y + 1.05, pz); plate.rotation.y = hs.rot; g.add(plate); H.plate = plate;
  const flag = new THREE.Group(); flag.userData.keep = true;
  flag.add(box(0.03, 0.34, 0.03, MAT.darkframe, 0, 0.17, 0)); const fl = box(0.02, 0.14, 0.2, MAT.red, 0, 0.27, 0.1); flag.add(fl);
  flag.position.set(H.mail.x, hs.y + 1.0, H.mail.z); flag.rotation.y = hs.rot; const [fx, fz2] = toWorld(hs, 1.4 + 0.2, fz + 0.25); flag.position.set(fx, hs.y + 1.05, fz2); g.add(flag); H.flag = flag;
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const [c, x] = cvs(128, 128); x.fillStyle = '#ff8fb0'; x.beginPath(); x.arc(64, 58, 50, 0, 7); x.fill(); x.beginPath(); x.moveTo(50, 100); x.lineTo(64, 124); x.lineTo(78, 100); x.fill(); x.font = '56px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✉️', 64, 60); return toTex(c, false); })(), depthTest: true, fog: false }));
  bub.scale.set(0.9, 0.9, 1); bub.position.set(H.mail.x, hs.y + 2.2, H.mail.z); bub.userData.keep = true; bub.visible = false; g.add(bub); H.bubble = bub;
  return g;
}
// ---------- 集会所 (community hall where the island meeting happens) ----------
function makeHall(Hh) {
  const g = new THREE.Group(), W = Hh.W, D = Hh.D, WH = 3.2, wallM = MAT.plasterWarm;
  g.add(box(W + 0.6, 0.12, D + 0.6, MAT.concrete, 0, 0.0, 0));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), worldMat(TEX.wood, 0.6, '#d9b88a', 0.7)); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.075; floor.receiveShadow = true; g.add(floor);
  g.add(box(W, WH, 0.25, wallM, 0, WH / 2, -D / 2));
  for (const s of [-1, 1]) g.add(box(0.25, WH, D, wallM, s * W / 2, WH / 2, 0));
  g.add(box(W + 0.05, 0.9, 0.3, MAT.sugi, 0, 0.45, -D / 2)); for (const s of [-1, 1]) g.add(box(0.3, 0.9, D + 0.05, MAT.sugi, s * W / 2, 0.45, 0));
  for (let k = 0; k <= 4; k++) g.add(box(0.24, WH, 0.24, MAT.darkwood, -W / 2 + k * W / 4, WH / 2, D / 2));
  g.add(box(W + 0.3, 0.35, 0.3, MAT.darkwood, 0, WH - 0.17, D / 2));
  const A = archMats();
  for (const s of [-1, 1]) { B(g, 1.5, 2.3, 0.06, A.koshi, s * (W / 2 - 1.0), 1.2, D / 2 - 0.15); B(g, 1.62, 0.1, 0.12, MAT.darkwood, s * (W / 2 - 1.0), 2.38, D / 2 - 0.15); }
  for (const s of [-1, 1]) for (const z of [-1.6, 1.6]) winPart(g, s * (W / 2 + 0.13), 1.85, z, s * Math.PI / 2, 1.5, 1.0, { style: 'slide', trim: MAT.darkwood, sash: A.sashBr, cur: z > 0 ? 4 : 2, hisashi: MAT.kawara });
  // lattice transom (欄間) across the open front
  { const y0 = WH - 0.62; B(g, W, 0.08, 0.12, MAT.darkwood, 0, y0, D / 2); const n = Math.floor(W / 0.22); for (let k = 0; k <= n; k++) B(g, 0.04, 0.42, 0.05, MAT.darkwood, -W / 2 + k * W / n, y0 + 0.24, D / 2); }
  // roof with wooden soffit, fascia, hip ridges, gutters
  { const over = 0.9, rise = 2.6, y1 = rise * over / (D / 2 + over), rbase = WH - y1 + 0.02;
    roofPart(g, { W, D, over, rise, hip: true, rbase, mat: MAT.kawara, soffit: A.soffitWood, fascia: MAT.darkwood, gutterM: A.gutterBr });
    for (let k = 0; k <= 4; k++) B(g, 0.2, 0.2, over + 0.1, MAT.darkwood, -W / 2 + k * W / 4, rbase - 0.25, D / 2 + over / 2); }
  // front: long stone step, planters, bench, bicycles, flag pole
  B(g, W + 0.4, 0.14, 0.9, A.stone, 0, 0.07, D / 2 + 0.75);
  { const R = mulberry(31); for (const sx of [-1, 1]) { const px = sx * (W / 2 + 0.6), pl = sub(g, px, 0.5, D / 2 + 0.9); CY(g, 0.42, 0.55, A.potW, px, 0.28, D / 2 + 0.9, 12, 0, 0, 0, 0.34); shrub(pl, 0, 0, 0.5, R); }
    bench(g, -W / 2 + 2.2, D / 2 + 2.0, Math.PI, MAT.wood); bicycle(g, W / 2 + 1.2, -D / 2 + 1.0, 0.1, A.bike[0]); bicycle(g, W / 2 + 1.2, -D / 2 + 2.0, -0.1, A.bike[2]); }
  { const fp = sub(g, -W / 2 - 1.4, 0, D / 2 + 1.4, 0); CY(fp, 0.25, 0.3, A.stone, 0, 0.15, 0, 10); CY(fp, 0.05, 6.5, A.railM, 0, 3.3, 0, 8); SP(fp, 0.09, A.brass, 0, 6.6, 0, 1, 8); B(fp, 0.02, 0.8, 1.2, MAT.white, 0, 5.9, 0.62); for (const sx of [-1, 1]) { const dot = new THREE.Mesh(new THREE.CircleGeometry(0.24, 18), MAT.red); dot.position.set(sx * 0.012, 5.9, 0.62); dot.rotation.y = sx * Math.PI / 2; fp.add(dot); } }
  // inside: long table, chairs for six, whiteboard, lamps
  const tableM = worldMat(TEX.wood, 0.7, '#a8784a', 0.6);
  g.add(box(9.4, 0.07, 1.1, tableM, 0, 0.6, -1.0)); for (const sx of [-4.4, 4.4]) for (const sz of [-1.4, -0.6]) g.add(box(0.08, 0.56, 0.08, MAT.darkframe, sx, 0.31, sz));
  Hh.seats = [];
  for (let i = 0; i < 6; i++) { const x = -3.75 + i * 1.5, z = -2.1; g.add(box(0.5, 0.06, 0.48, tableM, x, 0.34, z)); g.add(box(0.5, 0.5, 0.06, tableM, x, 0.6, z - 0.24)); for (const a of [-0.21, 0.21]) for (const b of [-0.2, 0.2]) g.add(box(0.04, 0.32, 0.04, MAT.darkframe, x + a, 0.16, z + b)); Hh.seats.push([x, z + 0.05]); }
  const wb = dynSign(3.2, 1.3, '島の会議', '#f8f8f4', '#2f5a3f'); wb.position.set(0, 2.05, -D / 2 + 0.14); g.add(wb); Hh.board = wb; g.add(box(3.4, 1.5, 0.05, MAT.darkframe, 0, 2.05, -D / 2 + 0.12));
  for (const x of [-3, 0, 3]) { const l = cylM(0.35, 0.45, 0.25, MAT.lamp, x, WH - 0.35, 0, 16); HOUSE_LIGHTS.push(l); g.add(l); }
  // sign above the entrance + notice board
  const sign = dynSign(3.6, 0.7, '集会所', '#3a2a1e', '#f6efe0'); sign.position.set(0, WH + 0.25, D / 2 + 0.17); g.add(sign); Hh.sign = sign;
  const nb = new THREE.Group(); nb.add(box(0.1, 1.6, 0.1, MAT.darkwood, -0.8, 0.8, 0)); nb.add(box(0.1, 1.6, 0.1, MAT.darkwood, 0.8, 0.8, 0)); nb.add(box(1.8, 1.0, 0.08, MAT.darkwood, 0, 1.3, 0));
  const poster = dynSign(1.6, 0.85, '島の会議', '#fff8e6', '#b4446a'); poster.position.set(0, 1.3, 0.05); nb.add(poster); Hh.poster = poster;
  nb.position.set(W / 2 - 0.5, 0, D / 2 + 2.6); g.add(nb);
  g.position.set(Hh.x, Hh.y, Hh.z); g.rotation.y = Hh.rot;
  const C = (lx, lz, hw, hd) => { const [x, z] = toWorld(Hh, lx, lz); addCollider({ x, z, hw, hd, rot: Hh.rot, kind: 'bld' }); };
  C(0, -D / 2, W / 2 + 0.2, 0.25); C(-W / 2, 0, 0.25, D / 2 + 0.2); C(W / 2, 0, 0.25, D / 2 + 0.2); C(0, -1.4, 4.8, 1.05); Hh.chair = [-5.3, -1.0];
  for (let k = 0; k <= 4; k++) { const [x, z] = toWorld(Hh, -W / 2 + k * W / 4, D / 2); addCollider({ x, z, r: 0.2, kind: 'pole' }); }
  { const [x, z] = toWorld(Hh, W / 2 - 0.5, D / 2 + 2.6); addCollider({ x, z, hw: 1.0, hd: 0.15, rot: Hh.rot }); }
  return g;
}
// ---------- lighthouse (white, on the cape) ----------
const BEAM = { mesh: null, light: null };
function makeLighthouse(L) {
  const g = new THREE.Group(), white = worldMat(TEX.plaster, 0.4, '#f4f2ea', 0.85), stoneW = worldMat(TEX.concrete, 0.3, '#d8d4c8', 0.9);
  // circular low wall and gravel ground
  const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.35, 8, 48), stoneW); ring.rotation.x = Math.PI / 2; ring.position.y = 0.35; ring.scale.z = 1.4; ring.castShadow = ring.receiveShadow = true; g.add(ring);
  const gr = new THREE.Mesh(new THREE.CircleGeometry(6.4, 40), worldMat(TEX.dirt, 0.3, '#a59a8c', 1)); gr.rotation.x = -Math.PI / 2; gr.position.y = 0.06; gr.receiveShadow = true; g.add(gr);
  // base hut
  g.add(box(3.6, 2.6, 3.0, white, 0, 1.3, 1.2)); g.add(box(3.9, 0.25, 3.3, stoneW, 0, 2.7, 1.2));
  const tdoor = box(0.9, 1.9, 0.08, MAT.frame, 0, 1.0, 2.73); g.add(tdoor);
  // tapered tower via lathe
  const prof = []; for (let i = 0; i <= 10; i++) { const t = i / 10; prof.push(new THREE.Vector2(1.9 - t * 0.55, t * 13)); }
  const tower = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), white); tower.castShadow = tower.receiveShadow = true; g.add(tower);
  g.add(cylM(1.85, 1.6, 0.35, stoneW, 0, 13.1, 0, 28));
  // gallery + railing
  g.add(cylM(2.1, 2.1, 0.18, stoneW, 0, 13.35, 0, 32));
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; g.add(cylM(0.03, 0.03, 1.0, MAT.darkframe, Math.cos(a) * 2.0, 13.95, Math.sin(a) * 2.0, 5)); }
  const rail = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.04, 6, 48), MAT.darkframe); rail.rotation.x = Math.PI / 2; rail.position.y = 14.45; g.add(rail);
  // lantern room
  g.add(cylM(1.15, 1.15, 0.5, white, 0, 13.7, 0, 24));
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.5, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#cfe0e6', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.35, side: THREE.DoubleSide })); lamp.position.y = 14.7; g.add(lamp);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.add(cylM(0.04, 0.04, 1.5, white, Math.cos(a) * 1.07, 14.7, Math.sin(a) * 1.07, 5)); }
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), MAT.lamp); bulb.position.y = 14.7; g.add(bulb); HOUSE_LIGHTS.push(bulb);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), white); dome.position.y = 15.45; dome.castShadow = true; g.add(dome);
  g.add(cylM(0.06, 0.06, 0.8, MAT.darkframe, 0, 16.9, 0, 6)); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), white); ball.position.y = 16.65; g.add(ball);
  // rotating beam (visible at night)
  const beamG = new THREE.ConeGeometry(4.5, 60, 24, 1, true); beamG.translate(0, -30, 0); beamG.rotateZ(Math.PI / 2);
  const beam = new THREE.Mesh(beamG, new THREE.MeshBasicMaterial({ color: '#fff3c0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  const bp = new THREE.Group(); bp.userData.keep = true; bp.position.y = 14.7; bp.add(beam); const beam2 = beam.clone(); beam2.rotation.y = Math.PI; bp.add(beam2); g.add(bp); BEAM.mesh = bp; BEAM.mats = [beam.material];
  g.position.set(L.x, L.y, L.z);
  addCollider({ x: L.x, z: L.z, r: 2.1, kind: 'bld' }); addCollider({ x: L.x, z: L.z + 1.2, hw: 1.9, hd: 1.6, rot: 0, kind: 'bld' });
  return g;
}
// ---------- brick church ----------
function makeChurch(C) {
  const g = new THREE.Group(), brick = worldMat(TEX.brick, 0.42, '#ffffff', 0.9), trimW = MAT.white, slate = new THREE.MeshStandardMaterial({ map: TEX.kawara, color: '#7a8696', roughness: 0.5, metalness: 0.2 });
  const spireM = new THREE.MeshStandardMaterial({ color: '#4f6a70', roughness: 0.45, metalness: 0.45 });
  const stained = new THREE.MeshStandardMaterial({ map: (() => { const [c, x] = cvs(128, 256); const cols = ['#2f5fa8', '#c8323a', '#e8b830', '#3a8a4a', '#6a3a9a']; for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) { x.fillStyle = cols[(i + j * 3) % 5]; x.fillRect(i * 32, j * 32, 32, 32); } x.strokeStyle = '#222'; x.lineWidth = 4; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, 256); x.stroke(); } for (let j = 0; j <= 8; j++) { x.beginPath(); x.moveTo(0, j * 32); x.lineTo(128, j * 32); x.stroke(); } return toTex(c, false); })(), roughness: 0.2, emissive: new THREE.Color('#ffd8a0'), emissiveIntensity: 0 });
  HOUSE_LIGHTS.push({ material: stained }); C.stained = stained;
  const NW = 9, NL = 20, NH = 6.5;
  g.add(box(NW + 1.2, 0.6, NL + 7, MAT.concrete, 0, 0.3, -1.5));
  g.add(box(NW, NH, NL, brick, 0, 0.6 + NH / 2, -2));
  for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) { // buttresses + arched windows
    const z = -2 - NL / 2 + 1.8 + k * (NL - 3.6) / 5;
    g.add(box(0.5, NH * 0.8, 0.6, brick, sx * (NW / 2 + 0.2), 0.6 + NH * 0.4, z + 1.6 > NL / 2 - 2 ? z : z + 1.6));
    const w = box(0.08, 2.6, 1.0, stained, sx * (NW / 2 + 0.03), 0.6 + 3.4, z); g.add(w);
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.09, 16, 1, false, 0, Math.PI), stained); arch.rotation.set(0, 0, sx * Math.PI / 2); arch.rotation.order = 'ZYX'; arch.rotateY(Math.PI / 2); arch.position.set(sx * (NW / 2 + 0.03), 0.6 + 4.7, z); g.add(arch);
    g.add(box(0.12, 0.12, 1.3, trimW, sx * (NW / 2 + 0.06), 0.6 + 2.05, z));
  }
  const rise = 4.4, roof = new THREE.Mesh(roofGeometry(NL + 1.2, NW + 1.6, rise, false), slate); roof.rotation.y = Math.PI / 2; roof.position.set(0, 0.6 + NH - 0.55, -2); roof.castShadow = roof.receiveShadow = true; g.add(roof);
  for (const sz of [-1]) { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute([-NW / 2, 0, 0, NW / 2, 0, 0, 0, rise - 0.5, 0], 3)); gg.setIndex([0, 2, 1]); gg.computeVertexNormals(); const gm = new THREE.Mesh(gg, brick); gm.position.set(0, 0.6 + NH, -2 - NL / 2); g.add(gm); }
  // bell tower in front (+z)
  const TW = 4.4, TH = 15, tz = -2 + NL / 2 + TW / 2 - 0.6;
  g.add(box(TW, TH, TW, brick, 0, 0.6 + TH / 2, tz));
  for (const y of [5.2, 10.4]) g.add(box(TW + 0.2, 0.25, TW + 0.2, trimW, 0, 0.6 + y, tz));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.3, TH, 0.3, trimW, sx * TW / 2, 0.6 + TH / 2, tz + sz * TW / 2));
  // portal, rose window, belfry louvres
  g.add(box(1.8, 3.2, 0.2, MAT.darkwood, 0, 0.6 + 1.6, tz + TW / 2 + 0.02));
  const parch = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.22, 20, 1, false, -Math.PI / 2, Math.PI), MAT.darkwood); parch.rotation.x = Math.PI / 2; parch.position.set(0, 0.6 + 3.2, tz + TW / 2 + 0.02); g.add(parch);
  g.add(box(2.4, 0.25, 0.3, trimW, 0, 0.6 + 4.25, tz + TW / 2 + 0.05));
  const rose = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), stained); rose.position.set(0, 0.6 + 7.6, tz + TW / 2 + 0.03); g.add(rose);
  const rr = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.12, 8, 32), trimW); rr.position.copy(rose.position); g.add(rr);
  for (const [sx, sz, ry] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) for (const ox of [-0.6, 0.6]) {
    const l = new THREE.Group(); l.add(box(0.8, 2.2, 0.08, MAT.white, 0, 0, 0)); for (let k = 0; k < 7; k++) l.add(box(0.7, 0.06, 0.12, MAT.darkframe, 0, -0.9 + k * 0.3, 0.05));
    const a = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16, 0, Math.PI), MAT.white); a.position.y = 1.1; l.add(a);
    l.position.set(sx * (TW / 2 + 0.03) + (sz ? ox : 0), 0.6 + 12.2, tz + sz * (TW / 2 + 0.03) + (sx ? ox : 0)); l.rotation.y = ry; g.add(l);
  }
  const spire = new THREE.Mesh(new THREE.ConeGeometry(TW * 0.78, 6.5, 4), spireM); spire.rotation.y = Math.PI / 4; spire.position.set(0, 0.6 + TH + 3.25, tz); spire.castShadow = true; g.add(spire);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const pin = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 6), trimW); pin.position.set(sx * TW / 2, 0.6 + TH + 0.7, tz + sz * TW / 2); g.add(pin); }
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), trimW); ball.position.set(0, 0.6 + TH + 6.6, tz); g.add(ball);
  g.add(box(0.22, 2.4, 0.22, trimW, 0, 0.6 + TH + 7.9, tz)); g.add(box(1.2, 0.22, 0.22, trimW, 0, 0.6 + TH + 8.4, tz));
  // forecourt paving
  const pave = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), worldMat(TEX.concrete, 0.5, '#cfcac0', 0.95)); pave.rotation.x = -Math.PI / 2; pave.position.set(0, 0.04, tz + TW / 2 + 3.5); pave.receiveShadow = true; g.add(pave);
  churchExtras(g, NW, NL, NH, tz, TW, C);
  g.position.set(C.x, C.y, C.z); g.rotation.y = C.rot;
  addCollider({ x: C.x - Math.sin(C.rot) * 2, z: C.z - Math.cos(C.rot) * 2, hw: NW / 2 + 0.3, hd: NL / 2 + 0.3, rot: C.rot, kind: 'bld' });
  addCollider({ x: C.x + Math.sin(C.rot) * tz, z: C.z + Math.cos(C.rot) * tz, hw: TW / 2 + 0.2, hd: TW / 2 + 0.2, rot: C.rot, kind: 'bld' });
  return g;
}
// ---------- harbor: breakwater + red light + moored area ----------
function makeHarbor(Hb) {
  const g = new THREE.Group(); const len = Hb.len, w = 4.5;
  const body = box(w, 5, len + 14, MAT.concrete, 0, -1.5 + 0, -len / 2 + 7); g.add(body);
  g.add(box(w + 0.8, 0.6, len + 14, MAT.concrete, 0, 0.85, -len / 2 + 7));
  g.add(box(1.0, 1.4, len, MAT.concrete, -w / 2 + 0.2, 1.6, -len / 2));
  // tetrapod-like rubble on the sea side
  const rk = MAT.rock;
  for (let k = 0; k < 40; k++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 + Math.random() * 0.6, 0), rk); m.position.set(-w / 2 - 1.2 - Math.random() * 1.5, -0.6 + Math.random() * 0.8, -2 - Math.random() * (len - 4)); m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); m.castShadow = m.receiveShadow = true; g.add(m); }
  // bollards
  for (let k = 0; k < 6; k++) g.add(cylM(0.18, 0.22, 0.45, MAT.black, w / 2 - 0.4, 1.35, -6 - k * 8, 10));
  // red lighthouse at the tip
  const t = new THREE.Group(); const prof = []; for (let i = 0; i <= 6; i++) prof.push(new THREE.Vector2(1.0 - i * 0.04, i * 1.1));
  const tw = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), MAT.red); tw.castShadow = true; t.add(tw);
  t.add(cylM(0.9, 0.9, 0.15, MAT.white, 0, 6.7, 0, 20));
  const lm = cylM(0.5, 0.5, 0.8, MAT.lamp, 0, 7.2, 0, 16); HOUSE_LIGHTS.push(lm); t.add(lm);
  t.add(cylM(0.6, 0.3, 0.4, MAT.red, 0, 7.8, 0, 16));
  t.position.set(0, 1.15, -len + 2.5); g.add(t);
  g.position.set(Hb.x, 0, Hb.z); g.rotation.y = Hb.dir;
  // colliders along the breakwater
  for (let s = 0; s < len; s += 3) { const x = Hb.x - Math.sin(Hb.dir) * s, z = Hb.z - Math.cos(Hb.dir) * s; }
  Hb.walk = { x: Hb.x, z: Hb.z, len, w, dir: Hb.dir, top: 1.15 };
  return g;
}
// concrete path draped over the ground from the breakwater root to the coastal road
function makeQuayPath(Hb) {
  const sx = Hb.x + Math.sin(Hb.dir) * 1.0, sz = Hb.z + Math.cos(Hb.dir) * 1.0; let best = null, bd = 1e9;
  for (const p of ROADS[0].pts) { const d = Math.hypot(p[0] - sx, p[1] - sz); if (d < bd) { bd = d; best = p; } }
  const ex = best[0], ez = best[1], L = Math.hypot(ex - sx, ez - sz), tx = (ex - sx) / L, tz = (ez - sz) / L, nx = -tz, nz = tx, W = 2.4, N = Math.max(4, Math.ceil(L / 1));
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) { const t = i / N, x = sx + (ex - sx) * t, z = sz + (ez - sz) * t; for (const s of [-1, 1]) { const px = x + nx * W * s, pz = z + nz * W * s; pos.push(px, Math.max(groundH(px, pz), i === 0 ? 1.12 : -9) + 0.06, pz); } if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, worldMat(TEX.concrete, 0.3, '#e0dbd0', 0.95, { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 })); m.receiveShadow = true; return m;
}
// ---------- roadside: poles + wires, guardrails, signs ----------
function makePoles() {
  const g = new THREE.Group(), P = PLACED.poles;
  const poleG = new THREE.CylinderGeometry(0.14, 0.2, 10, 10); poleG.translate(0, 5, 0);
  const inst = new THREE.InstancedMesh(poleG, MAT.pole, P.length); inst.castShadow = true; inst.receiveShadow = true;
  const armG = new THREE.BoxGeometry(1.8, 0.12, 0.12); armG.translate(0, 8.9, 0);
  const arms = new THREE.InstancedMesh(armG, MAT.darkframe, P.length * 2); arms.castShadow = true;
  const tr = new THREE.BoxGeometry(0.55, 0.75, 0.5); tr.translate(0.42, 7.6, 0);
  const trans = new THREE.InstancedMesh(tr, MAT.metal, P.length); trans.castShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  P.forEach((p, i) => {
    q.setFromEuler(e.set(0, p.rot + Math.PI / 2, 0)); m.compose(new THREE.Vector3(p.x, p.y - 0.3, p.z), q, new THREE.Vector3(1, 1, 1)); inst.setMatrixAt(i, m); arms.setMatrixAt(i * 2, m);
    const m2 = m.clone().multiply(new THREE.Matrix4().makeTranslation(0, -0.9, 0)); arms.setMatrixAt(i * 2 + 1, m2);
    trans.setMatrixAt(i, i % 3 === 0 ? m : new THREE.Matrix4().makeScale(0, 0, 0));
    addCollider({ x: p.x, z: p.z, r: 0.3, kind: 'pole' });
  });
  g.add(inst, arms, trans);
  // wires: catenaries between consecutive poles (if close)
  const pts = [];
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i]; const d = Math.hypot(a.x - b.x, a.z - b.z); if (d > 45) continue;
    for (const [off, hgt] of [[-0.75, 8.95], [0.75, 8.95], [0, 8.0]]) {
      const ca = Math.cos(a.rot + Math.PI / 2), sa = Math.sin(a.rot + Math.PI / 2), cb = Math.cos(b.rot + Math.PI / 2), sb = Math.sin(b.rot + Math.PI / 2);
      const A = new THREE.Vector3(a.x + ca * off, a.y - 0.3 + hgt, a.z - sa * off), B = new THREE.Vector3(b.x + cb * off, b.y - 0.3 + hgt, b.z - sb * off);
      for (let s = 0; s < 12; s++) { const t0 = s / 12, t1 = (s + 1) / 12; const P0 = A.clone().lerp(B, t0), P1 = A.clone().lerp(B, t1); P0.y -= Math.sin(t0 * Math.PI) * d * 0.025; P1.y -= Math.sin(t1 * Math.PI) * d * 0.025; pts.push(P0, P1); }
    }
  }
  const wg = new THREE.BufferGeometry().setFromPoints(pts); g.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: '#2a2c30' })));
  return g;
}
function makeGuardrails() {
  const g = new THREE.Group(); const postG = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8); postG.translate(0, 0.5, 0);
  const posts = [], railPos = [], railIdx = [];
  for (const r of ROADS) {
    if (!r.guard) continue; const F = r.frames || roadFrames(r); let run = [];
    const flush = () => { if (run.length > 3) { const base = railPos.length / 3; run.forEach((p, i) => { railPos.push(p.x, p.y + 0.62, p.z, p.x, p.y + 0.9, p.z); if (i) { const a = base + (i - 1) * 2; railIdx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }); } run = []; };
    F.forEach((f, i) => {
      // seaward side: away from the island centre
      const s = (f.nx * f.x + f.nz * f.z) > 0 ? 1 : -1, off = r.w / 2 + 0.6, x = f.x + f.nx * off * s, z = f.z + f.nz * off * s;
      const drop = f.y - groundH(f.x + f.nx * (off + 4) * s, f.z + f.nz * (off + 4) * s);
      if (drop > 1.6 && !(r.bridge && (r.bridge[i] || r.bridge[i - 1] || r.bridge[i + 1] || r.bridge[i + 2] || r.bridge[i - 2]))) { run.push({ x, y: f.y, z }); if (i % 1 === 0) posts.push([x, f.y, z]); addCollider({ x, z, r: 0.25 }); } else flush();
    });
    flush();
  }
  const inst = new THREE.InstancedMesh(postG, MAT.white, posts.length); const m = new THREE.Matrix4(); posts.forEach((p, i) => { m.makeTranslation(p[0], p[1], p[2]); inst.setMatrixAt(i, m); }); inst.castShadow = true; g.add(inst);
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(railPos, 3)); rg.setIndex(railIdx); rg.computeVertexNormals();
  const rail = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: '#eef0f0', roughness: 0.35, metalness: 0.4, side: THREE.DoubleSide })); rail.castShadow = true; g.add(rail);
  return g;
}
function makeSigns() {
  const g = new THREE.Group(); const r = ROADS[0], F = r.frames || roadFrames(r);
  const spdTex = (() => { const [c, x] = cvs(256); x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.strokeStyle = '#d8282f'; x.lineWidth = 26; x.beginPath(); x.arc(128, 128, 108, 0, 7); x.stroke(); x.fillStyle = '#1f4fa8'; x.font = 'bold 120px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('30', 128, 136); return toTex(c, false); })();
  for (const i of [12, Math.floor(F.length * 0.45), Math.floor(F.length * 0.8)]) {
    const f = F[i]; if (!f) continue; const s = (f.nx * -f.x + f.nz * -f.z) > 0 ? 1 : -1, x = f.x + f.nx * (r.w / 2 + 0.9) * s, z = f.z + f.nz * (r.w / 2 + 0.9) * s;
    const sg = new THREE.Group(); sg.add(cylM(0.04, 0.04, 2.4, MAT.metal, 0, 1.2, 0, 6));
    const plate = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshStandardMaterial({ map: spdTex, roughness: 0.5 })); plate.position.set(0, 2.3, 0.03); sg.add(plate);
    sg.position.set(x, groundH(x, z), z); sg.rotation.y = Math.atan2(f.tx, f.tz) + (s > 0 ? 0 : Math.PI); g.add(sg);
  }
  return g;
}
function buildStructures(scene) {
  makeMaterials();
  const g = new THREE.Group();
  // villagers' houses stay separate (not merged into the static chunks) so they can be moved later
  { const homes = PLACED.houses.filter(h => !h.home).slice(0, 18); VILLAGER_DEF.forEach((d, i) => { const h = homes[(i * 3 + 1) % homes.length]; if (h && h.kind !== 'shop') h.vid = d.id; }); }
  for (const hs of PLACED.houses) { if (hs.vid) { hs.orig = { x: hs.x, z: hs.z, rot: hs.rot, y: hs.y }; COLL.track = hs.coll = []; hs.grp = mergeLocal(makeHouse(hs)); COLL.track = null; scene.add(hs.grp); } else g.add(makeHouse(hs)); }
  if (PLACED.home) g.add(makeHomeExtras(PLACED.home));
  if (PLACED.hall) g.add(makeHall(PLACED.hall));
  if (PLACED.lighthouse) g.add(makeLighthouse(PLACED.lighthouse));
  if (PLACED.church) g.add(makeChurch(PLACED.church));
  if (PLACED.harbor) { g.add(makeHarbor(PLACED.harbor)); g.add(makeQuayPath(PLACED.harbor)); }
  g.add(makePoles()); g.add(makeGuardrails()); g.add(makeSigns());
  scene.add(g); g.updateMatrixWorld(true);
  const merged = mergeStatic(g); scene.remove(g); scene.add(merged); return merged;
}
function updateStructures(t, night) {
  for (const l of HOUSE_LIGHTS) { if (l.material === MAT.glass) continue; }
  MAT.glass.emissiveIntensity = night * 0.9; updateArchLights(night); if (PLACED.church) PLACED.church.stained.emissiveIntensity = night * 1.2; MAT.lamp.emissiveIntensity = 0.2 + night * 2.5;
  if (BEAM.mesh) { BEAM.mesh.rotation.y = t * 0.6; BEAM.mats.forEach(m => m.opacity = night * 0.18); }
}

// bake static meshes into one merged mesh per (material, 64m cell) to cut draw calls and allow culling
function mergeStatic(root) {
  const out = new THREE.Group(), buckets = new Map(), keep = [];
  root.traverse(o => {
    if (o.userData.keep) { keep.push(o); return; }
    let p = o.parent; while (p) { if (p.userData.keep) return; p = p.parent; }
    if (!o.isMesh || o.isInstancedMesh) { if (o.isInstancedMesh || o.isLineSegments || o.isLine) keep.push(o); return; }
    const wp = new THREE.Vector3(); o.getWorldPosition(wp);
    const key = o.material.uuid + '|' + Math.floor(wp.x / 128) + ',' + Math.floor(wp.z / 128) + '|' + (o.castShadow ? 1 : 0);
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!buckets.has(key)) buckets.set(key, { mat: o.material, cast: o.castShadow, list: [] }); buckets.get(key).list.push(g);
  });
  for (const { mat, cast, list } of buckets.values()) { const m = new THREE.Mesh(mergeGeometries(list), mat); m.castShadow = cast; m.receiveShadow = true; out.add(m); }
  for (const o of keep) { const wm = o.matrixWorld.clone(); o.parent && o.parent.remove(o); o.matrix.copy(wm); o.matrix.decompose(o.position, o.quaternion, o.scale); out.add(o); }
  return out;
}
