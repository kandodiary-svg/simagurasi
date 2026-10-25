// ===================== VEGETATION =====================
const VEG = { uTime: { value: 0 }, uDayK: { value: 1 }, trees: [] }; // uDayK: foliage translucency glow, off at night
function windify(mat, amount, useHeight = true) {
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', '').replace('normal = normal * faceDirection;', ''));
    sh.uniforms.uTime = VEG.uTime;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 ip = instanceMatrix[3].xyz;
      #else
        vec3 ip = vec3(0.0);
      #endif
      float sw = ${useHeight ? 'max(position.y, 0.0)' : '1.0'} * ${amount.toFixed(3)};
      transformed.x += sin(uTime * 1.6 + ip.x * 0.21 + ip.z * 0.13 + position.y * 0.6) * sw;
      transformed.z += cos(uTime * 1.3 + ip.z * 0.19 + position.x * 0.5) * sw * 0.6;`);
  };
  return mat;
}
function limbGeom(points, r0, r1, radial = 7, segs = 6) {
  const curve = new THREE.CatmullRomCurve3(points), fr = curve.computeFrenetFrames(segs, false), len = curve.getLength();
  const pos = [], nor = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, P = curve.getPointAt(t), N = fr.normals[i], B = fr.binormals[i], r = lerp(r0, r1, Math.pow(t, 0.8));
    for (let j = 0; j <= radial; j++) { const a = j / radial * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); const n = new THREE.Vector3().addScaledVector(N, c).addScaledVector(B, s); pos.push(P.x + n.x * r, P.y + n.y * r, P.z + n.z * r); nor.push(n.x, n.y, n.z); uv.push(j / radial * 2, t * len / 1.5); }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
const CANOPY = { top: new THREE.Color('#b6e05a'), mid: new THREE.Color('#6fb23c'), low: new THREE.Color('#2f6a2a') };
function clumpGeom(c, r, seed, flat = 0.78, tint = [1, 1, 1], yRange = null) {
  const g = new THREE.IcosahedronGeometry(r, 2); const p = g.attributes.position, col = [];
  const [y0, y1] = yRange || [c.y - r, c.y + r]; const tc = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)), n = v.clone().normalize();
    const d = 1 + (vnoise(n.x * 3.1 + seed, n.y * 3.1 + n.z * 2.3, seed) - 0.5) * 0.32; v.multiplyScalar(d); v.y *= flat;
    p.setXYZ(i, v.x + c.x, v.y + c.y, v.z + c.z);
    const h = clamp((v.y + c.y - y0) / Math.max(0.1, y1 - y0), 0, 1), up = clamp(n.y * 0.5 + 0.5, 0, 1);
    const t = clamp(h * 0.55 + up * 0.6 - 0.1, 0, 1);
    if (t < 0.5) tc.copy(CANOPY.low).lerp(CANOPY.mid, t * 2); else tc.copy(CANOPY.mid).lerp(CANOPY.top, (t - 0.5) * 2);
    col.push(tc.r * tint[0], tc.g * tint[1], tc.b * tint[2]);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const nn = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i) - c.x, (p.getY(i) - c.y) / flat, p.getZ(i) - c.z).normalize(); nn.set([v.x, v.y, v.z], i * 3); }
  g.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
  return g;
}
function cardsGeom(c, r, n, R, size = 1.7, flat = 0.78) {
  const pos = [], nor = [], uv = [], idx = [];
  for (let k = 0; k < n; k++) {
    const u = R() * 2 - 1, th = R() * Math.PI * 2, s = Math.sqrt(1 - u * u); const dir = new THREE.Vector3(s * Math.cos(th), Math.abs(u) * 0.8 + 0.1, s * Math.sin(th)).normalize();
    const ctr = c.clone().add(new THREE.Vector3(dir.x * r * 0.92, dir.y * r * flat * 0.92, dir.z * r * 0.92));
    const tan = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)); if (tan.lengthSq() < 0.01) tan.set(1, 0, 0); tan.normalize();
    const bit = new THREE.Vector3().crossVectors(dir, tan).normalize(); const rot = R() * 6.28, cs = Math.cos(rot), sn = Math.sin(rot);
    const A = tan.clone().multiplyScalar(cs).addScaledVector(bit, sn).multiplyScalar(size / 2), B = tan.clone().multiplyScalar(-sn).addScaledVector(bit, cs).multiplyScalar(size / 2);
    const o = pos.length / 3;
    for (const [a, b, uu, vv] of [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]]) { const v = ctr.clone().addScaledVector(A, a).addScaledVector(B, b); pos.push(v.x, v.y, v.z); nor.push(dir.x, dir.y, dir.z); uv.push(uu, vv); }
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
function makeTreeVariant(kind, seed) {
  const R = mulberry(seed), bark = [], clumps = [], cards = [], fruit = [];
  if (kind === 'broad') {
    const H = 5.2 + R() * 2.6, lean = new THREE.Vector3((R() - 0.5) * 1.0, 0, (R() - 0.5) * 1.0);
    const top = new THREE.Vector3(lean.x, H * 0.48, lean.z);
    bark.push(limbGeom([new THREE.Vector3(0, -0.4, 0), new THREE.Vector3(lean.x * 0.2, H * 0.22, lean.z * 0.2), new THREE.Vector3(lean.x * 0.6, H * 0.4, lean.z * 0.6), top], 0.36, 0.17, 8, 5));
    const nb = 4 + Math.floor(R() * 3), ends = [];
    for (let b = 0; b < nb; b++) {
      const a = b / nb * Math.PI * 2 + R() * 0.7, st = top.clone().add(new THREE.Vector3(0, -R() * 0.6, 0));
      const L = 2.2 + R() * 1.6, en = st.clone().add(new THREE.Vector3(Math.cos(a) * L, 1.4 + R() * 1.2, Math.sin(a) * L));
      bark.push(limbGeom([st, st.clone().lerp(en, 0.5).add(new THREE.Vector3(0, 0.3, 0)), en], 0.15, 0.05, 6, 4)); ends.push(en);
    }
    // canopy: a cloud of puffs over a dome
    const cy = top.y + 2.6, CR = 3.2 + R() * 0.9, puffs = [];
    puffs.push([new THREE.Vector3(lean.x, cy, lean.z), CR * 0.85]);
    for (const e of ends) puffs.push([e.clone().add(new THREE.Vector3(0, 0.3, 0)), 1.5 + R() * 0.6]);
    for (let k = 0; k < 9; k++) { const a = R() * 6.28, u = 0.2 + R() * 0.8, rr = CR * (0.55 + R() * 0.35); puffs.push([new THREE.Vector3(lean.x + Math.cos(a) * rr * Math.sqrt(1 - u * u * 0.5), cy + u * CR * 0.55 - 0.3, lean.z + Math.sin(a) * rr * Math.sqrt(1 - u * u * 0.5)), 1.1 + R() * 0.7]); }
    const yr = [cy - CR * 0.8, cy + CR * 0.9];
    for (const [p, r] of puffs) { clumps.push(clumpGeom(p, r, R() * 50, 0.8, [1, 1, 1], yr)); cards.push(cardsGeom(p, r, 5, R, 1.5, 0.8)); }
    return { bark, clumps, cards, fruit, collR: 0.42 };
  }
  if (kind === 'pine') {
    const H = 6 + R() * 3, dir = R() * 6.28, bend = 1.2 + R() * 1.8; const pts = [];
    for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push(new THREE.Vector3(Math.cos(dir) * bend * t * t + Math.sin(t * 4) * 0.25, t * H, Math.sin(dir) * bend * t * t)); }
    bark.push(limbGeom(pts, 0.3, 0.1, 7, 8));
    const pads = [];
    for (let i = 2; i <= 5; i++) { const P = pts[i]; const n = i === 5 ? 1 : 2; for (let k = 0; k < n; k++) { const a = R() * 6.28, L = (5.5 - i) * 0.55 + 0.6, e = P.clone().add(new THREE.Vector3(Math.cos(a) * L, 0.35, Math.sin(a) * L)); bark.push(limbGeom([P, e], 0.1, 0.04, 5, 2)); pads.push(e); } }
    for (const e of pads) { const r = 1.3 + R() * 0.6; clumps.push(clumpGeom(e, r, R() * 50, 0.5, [0.7, 0.85, 0.72])); cards.push(cardsGeom(e, r, 6, R, 1.3, 0.38)); }
    return { bark, clumps, cards, fruit, collR: 0.35, pine: true };
  }
  if (kind === 'mikan') {
    const H = 1.2 + R() * 0.4; bark.push(limbGeom([new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(0.1, H * 0.5, 0), new THREE.Vector3(0, H, 0.1)], 0.12, 0.07, 6, 3));
    const c = new THREE.Vector3(0, H + 0.6, 0), r = 1.25 + R() * 0.3; clumps.push(clumpGeom(c, r, R() * 50, 0.85, [0.85, 1, 0.8])); cards.push(cardsGeom(c, r, 8, R, 1.1, 0.85));
    for (let k = 0; k < 22; k++) { const u = R() * 2 - 1, th = R() * 6.28, s = Math.sqrt(1 - u * u); const g = new THREE.SphereGeometry(0.09, 7, 5); g.translate(c.x + s * Math.cos(th) * r * 0.97, c.y + u * r * 0.82, c.z + s * Math.sin(th) * r * 0.97); fruit.push(g); }
    return { bark, clumps, cards, fruit, collR: 0.3 };
  }
  // bush
  const c = new THREE.Vector3(0, 0.45, 0), r = 0.8 + R() * 0.5; clumps.push(clumpGeom(c, r, R() * 50, 0.7, [0.9, 1, 0.85])); cards.push(cardsGeom(c, r, 7, R, 0.9, 0.7));
  return { bark, clumps, cards, fruit, collR: 0 };
}
function buildVegetation(scene) {
  const group = new THREE.Group();
  const barkMat = worldMat(TEX.rock, 0.6, '#7a6656', 0.95);
  const barkMatInst = new THREE.MeshStandardMaterial({ map: TEX.bark, color: '#c8bcae', roughness: 0.95 });
  const fol = (c) => { const m = windify(new THREE.MeshStandardMaterial({ map: TEX.foliage, color: c, vertexColors: true, roughness: 1 }), 0.012); const pv = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { pv(sh, r); sh.uniforms.uDayK = VEG.uDayK; sh.fragmentShader = 'uniform float uDayK;\n' + sh.fragmentShader; sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.32 * uDayK;'); }; return m; };
  const card = (c) => { const m = windify(new THREE.MeshStandardMaterial({ map: TEX.leaves, color: new THREE.Color(c).multiply(new THREE.Color('#a6dc58')), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 1 }), 0.03); const pv = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { pv(sh, r); sh.uniforms.uDayK = VEG.uDayK; sh.fragmentShader = 'uniform float uDayK;\n' + sh.fragmentShader; sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.3 * uDayK;'); }; return m; };
  const fruitMat = new THREE.MeshStandardMaterial({ color: '#f08a1c', roughness: 0.5 });
  const variants = {
    broad: [0, 1, 2, 3].map(s => makeTreeVariant('broad', 100 + s)), pine: [0, 1].map(s => makeTreeVariant('pine', 200 + s)),
    mikan: [makeTreeVariant('mikan', 300)], bush: [0, 1].map(s => makeTreeVariant('bush', 400 + s)),
  };
  const tints = { broad: ['#ffffff', '#f2fff0', '#fff8e0', '#e8f8e0'], pine: ['#9cc0a0', '#a8c8a8'], mikan: ['#e8fcd0'], bush: ['#ffffff', '#ecf8e0'] };
  // ---- placement ----
  const R = mulberry(909), place = { broad: [[], [], [], []], pine: [[], []], mikan: [[]], bush: [[], []] };
  const nearHouse = (x, z, m) => PLACED.houses.some(h => Math.hypot(h.x - x, h.z - z) < h.rad + m) || PLACED.clear.some(c => Math.hypot(c.x - x, c.z - z) < c.r + m * 0.5) || (PLACED.lighthouse && Math.hypot(PLACED.lighthouse.x - x, PLACED.lighthouse.z - z) < 13);
  const step = 5.2;
  for (let z = -340; z < 340; z += step) for (let x = -340; x < 340; x += step) {
    const px = x + (R() - 0.5) * step * 0.9, pz = z + (R() - 0.5) * step * 0.9, h = groundH(px, pz); if (h < 2.6) continue;
    const n = groundN(px, pz); if (n.y < 0.72) continue;
    const rd = roadDistAt(px, pz); if (rd < 5.5) continue;
    if (nearHouse(px, pz, 2.5)) continue;
    if (waterDepthAt(px, pz) > 0 || !isNaN(waterLevelAt(G, px, pz)) && waterLevelAt(G, px, pz) > h - 0.5) continue;
    const md = Math.hypot(px - MIKAN.x, pz - MIKAN.z);
    if (md < MIKAN.r * 0.82 && h > 5) { if ((Math.round(px / 4) + Math.round(pz / 4)) % 1 === 0 && R() < 0.55) place.mikan[0].push([px, pz, R()]); continue; }
    const vd = Math.hypot(px - VILLAGE.x, pz - VILLAGE.z);
    const od = Math.hypot(px - OPEN.x, pz - OPEN.z);
    if (od < OPEN.r * 0.9) { if (od > OPEN.r * 0.55 && R() < 0.035) place.broad[Math.floor(R() * 4)].push([px, pz, R()]); else if (R() < 0.025) place.bush[Math.floor(R() * 2)].push([px, pz, R()]); continue; }
    const forest = fbm(px * 0.012, pz * 0.012, 55, 4) + sstep(10, 60, h) * 0.25 - (vd < VILLAGE.r ? 0.35 : 0) - (1 - sstep(OPEN.r * 0.9, OPEN.r * 1.4, od)) * 0.3;
    const din = dinAt(G, px, pz);
    if (din < 28 && h < 9 && R() < 0.03) { place.pine[Math.floor(R() * 2)].push([px, pz, R()]); continue; }
    if (forest > 0.56 && R() < (forest - 0.5) * 2.4) place.broad[Math.floor(R() * 4)].push([px, pz, R()]);
    else if (R() < 0.04 + (forest > 0.45 ? 0.08 : 0)) place.bush[Math.floor(R() * 2)].push([px, pz, R()]);
  }
  // garden shrubs near houses
  for (const hs of PLACED.houses) for (let k = 0; k < 3; k++) { const a = R() * 6.28, d = hs.rad + 1.2 + R() * 2; const x = hs.x + Math.cos(a) * d, z = hs.z + Math.sin(a) * d; if (roadDistAt(x, z) > 5) place.bush[Math.floor(R() * 2)].push([x, z, R()]); }
  // ---- instancing with editable items ----
  VEG.sets = []; VEG.items = []; VEG.group = group; VEG.variants = variants; VEG.mats = {};
  const newItem = (o) => { o.id = VEG.items.length; VEG.items.push(o); return o; };
  const cellsOf = (list, size) => { const m = new Map(); for (const it of list) { const k = Math.floor(it.x / size) + ',' + Math.floor(it.z / size); if (!m.has(k)) m.set(k, []); m.get(k).push(it); } return [...m.values()]; };
  const addSet = (geo, mat, items, kind, shadow, cap) => {
    const im = new THREE.InstancedMesh(geo, mat, cap || Math.max(1, items.length)); im.castShadow = shadow; im.receiveShadow = true; im.frustumCulled = !cap;
    const set = { mesh: im, items, kind, x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity };
    for (const it of items) { set.x0 = Math.min(set.x0, it.x); set.z0 = Math.min(set.z0, it.z); set.x1 = Math.max(set.x1, it.x); set.z1 = Math.max(set.z1, it.z); }
    VEG.sets.push(set); group.add(im); return set;
  };
  const partGeos = {};
  let total = 0;
  for (const kind of Object.keys(variants)) variants[kind].forEach((V, vi) => {
    const fm = fol(tints[kind][vi]), cm = card(tints[kind][vi]); VEG.fmats = VEG.fmats || {}; VEG.fmats[kind + vi] = { fol: fm, card: cm, tint: fm.color.clone(), cardBase: cm.color.clone() };
    const parts = [[V.bark, barkMatInst, true, 'bark'], [V.clumps, fm, true, 'clumps'], [V.cards, cm, true, 'cards'], [V.fruit, fruitMat, false, 'fruit']];
    const geos = parts.filter(p => p[0].length).map(([gs, mat, shadow, nm]) => [mergeGeometries(gs.map(g => { const c = g.index ? g.toNonIndexed() : g; if (!c.attributes.color && gs === V.clumps) return c; if (c.attributes.color && gs !== V.clumps) c.deleteAttribute('color'); if (!c.attributes.uv) c.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(c.attributes.position.count * 2), 2)); return c; })), mat, shadow]);
    partGeos[kind + vi] = geos;
    const list = place[kind][vi].map(([x, z, r]) => newItem({ x, z, r, type: 'tree', kind, collR: V.collR }));
    total += list.length;
    for (const cl of cellsOf(list, 144)) for (const [geo, mat, shadow] of geos) { const st = addSet(geo, mat, cl, 'tree', shadow); st.boundsPad = 8; }
    if (V.collR) list.forEach(it => { it.coll = { x: it.x, z: it.z, r: V.collR, kind: 'tree' }; addCollider(it.coll); });
  });
  VEG.partGeos = partGeos; VEG.count = total;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), v3 = new THREE.Vector3();
  // ---- boulders on the shore, cliffs and hills ----
  {
    const rg = new THREE.DodecahedronGeometry(1, 1); const rp = rg.attributes.position;
    for (let i = 0; i < rp.count; i++) { const v = new THREE.Vector3(rp.getX(i), rp.getY(i), rp.getZ(i)); const d = 0.8 + vnoise(v.x * 1.7 + 3, v.y * 1.7 + v.z, 5) * 0.45; v.multiplyScalar(d); v.y *= 0.72; rp.setXYZ(i, v.x, v.y, v.z); }
    rg.computeVertexNormals();
    const rocks = [], R3 = mulberry(5150);
    for (let k = 0; k < 9000 && rocks.length < 420; k++) {
      const x = (R3() - 0.5) * 680, z = (R3() - 0.5) * 680, h = groundH(x, z), din = dinAt(G, x, z), cliff = G.cliffMap[Math.round((z + 360) / 2) * WORLD.n + Math.round((x + 360) / 2)] || 0;
      if (roadDistAt(x, z) < 6 || h < -2.5 || waterDepthAt(x, z) > 0.1) continue; const nr = groundN(x, z);
      const p = (din < 10 && din > -14 ? (cliff > 0.4 ? 0.5 : 0.07) : 0) + (nr.y < 0.8 && h > 3 ? 0.08 : 0);
      if (R3() < p && !nearHouse(x, z, 3)) { const s = (cliff > 0.4 ? 1.4 : 0.6) + R3() * (cliff > 0.4 ? 2.4 : 1.1), r = R3(); const it = newItem({ x, z, s, r, type: 'rock' }); if (s > 1.1) { it.coll = { x, z, r: s * 0.85, kind: 'rock' }; addCollider(it.coll); } rocks.push(it); }
    }
    for (const cl of cellsOf(rocks, 96)) addSet(rg, worldMat(TEX.rock, 0.28, '#d8d0c4', 0.95), cl, 'rock', true);
    VEG.rocks = rocks.length;
  }
  // ---- ground cover: grass tufts and wildflowers (chunked for culling) ----
  const tuftGeo = (() => { const gs = []; for (let k = 0; k < 2; k++) { const p = new THREE.PlaneGeometry(1, 0.75); p.translate(0, 0.375, 0); p.rotateY(k * Math.PI / 2); gs.push(p); } const g = mergeGeometries(gs); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); return g; })();
  const tuftMat = (() => { const m = windify(new THREE.MeshStandardMaterial({ map: TEX.tuft, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1, color: '#d8f0a8' }), 0.09); const pv = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { pv(sh, r); sh.uniforms.uDayK = VEG.uDayK; sh.fragmentShader = 'uniform float uDayK;\n' + sh.fragmentShader; sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.35 * uDayK;'); }; return m; })();
  const fwMat = windify(new THREE.MeshStandardMaterial({ map: TEX.flowerW, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1 }), 0.08);
  const fyMat = windify(new THREE.MeshStandardMaterial({ map: TEX.flowerY, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 1 }), 0.08);
  VEG.tuftMat = tuftMat; VEG.fwMat = fwMat; VEG.fyMat = fyMat;
  const CH = 120, chunks = new Map(), R2 = mulberry(31);
  const add = (type, x, z, s, rot) => { const k = type + Math.floor(x / CH) + ',' + Math.floor(z / CH); if (!chunks.has(k)) chunks.set(k, { type, list: [] }); chunks.get(k).list.push(newItem({ x, z, s, rot, type: 'tuft' })); };
  for (let z = -330; z < 330; z += 1.15) for (let x = -330; x < 330; x += 1.15) {
    const px = x + (R2() - 0.5) * 1.1, pz = z + (R2() - 0.5) * 1.1, h = groundH(px, pz); if (h < 2.3) continue;
    const n = groundN(px, pz); if (n.y < 0.78) continue; const rd = roadDistAt(px, pz); if (rd < 4.0) continue;
    if (waterDepthAt(px, pz) > 0) continue;
    const dens = fbm(px * 0.05, pz * 0.05, 66, 3);
    if (dens < 0.42) continue;
    if (PLACED.houses.some(hh => Math.abs(hh.x - px) < hh.rad && Math.abs(hh.z - pz) < hh.rad) || PLACED.clear.some(c => Math.hypot(c.x - px, c.z - pz) < c.r)) continue;
    const fl = fbm(px * 0.03 + 9, pz * 0.03, 88, 3);
    if (fl > 0.64 && R2() < 0.45) add(R2() < 0.6 ? 'fw' : 'fy', px, pz, 0.7 + R2() * 0.5, R2() * 6.28);
    else if (R2() < (dens - 0.38) * 1.6) add('tuft', px, pz, 0.55 + R2() * 0.6, R2() * 6.28);
  }
  let tuftN = 0;
  for (const { type, list } of chunks.values()) { addSet(tuftGeo, type === 'tuft' ? tuftMat : type === 'fw' ? fwMat : fyMat, list, 'tuft', false); tuftN += list.length; }
  try { buildFlora({ newItem, addSet, cellsOf, partGeos, fol, card, barkMatInst }); } catch (e) { console.warn('flora', e); window.__floraErr = String(e.stack); }
  VEG.removed = new Uint8Array(VEG.items.length);
  // ---- user-planted trees: one capacity-limited set per variant ----
  VEG.userTrees = []; VEG.userSets = {}; VEG.userColls = [];
  for (const key of ['broad0', 'broad1', 'pine0', 'mikan0', 'bush0', ...(VEG.extraUserKeys || [])]) if (partGeos[key]) VEG.userSets[key] = partGeos[key].map(([geo, mat, shadow]) => { const st = addSet(geo, mat, [], 'user', shadow, 300); st.mesh.count = 0; return st; });
  VEG.tufts = tuftN;
  scene.add(group); VEG.refresh(-400, -400, 400, 400); return group;
}
// ---- live updates after terrain edits ----
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _v = new THREE.Vector3();
function vegValid(it) {
  const h = groundH(it.x, it.z);
  if (it.type === 'rock') return h > -3;
  if (h < 0.3 || waterDepthAt(it.x, it.z) > 0.02) return false;
  const rd = roadDistAt(it.x, it.z); if (rd < (it.type === 'tuft' ? 2.9 : 3.8)) return false;
  if (deckY(it.x, it.z) !== null) return false;
  return true;
}
function vegMatrix(it, vis) {
  if (!vis) return _m4.makeScale(0, 0, 0);
  const y = groundH(it.x, it.z);
  if (it.type === 'tree') { const s = it.kind === 'mikan' ? 0.9 + it.r * 0.2 : it.kind === 'sakura' ? 1.15 + it.r * 0.35 : it.kind === 'bamboo' || it.kind === 'palm' ? 0.9 + it.r * 0.25 : 0.8 + it.r * 0.45; _q.setFromEuler(_e.set(0, it.r * 40, 0)); return _m4.compose(_v.set(it.x, y - 0.05, it.z), _q, _s.set(s, s * (0.9 + it.r * 0.2), s)); }
  if (it.type === 'rock') { _q.setFromEuler(_e.set(it.r * 3, it.r * 17, it.r * 5)); return _m4.compose(_v.set(it.x, y - it.s * 0.25, it.z), _q, _s.set(it.s, it.s * (0.7 + it.r * 0.5), it.s * (0.8 + it.r * 0.4))); }
  _q.setFromEuler(_e.set(0, it.rot, 0)); return _m4.compose(_v.set(it.x, y - 0.04, it.z), _q, _s.set(it.s, it.s, it.s));
}
VEG.refresh = function (x0, z0, x1, z1) {
  const seen = new Set();
  for (const st of VEG.sets) {
    if (st.kind === 'user') continue; const pad = st.boundsPad || 2;
    if (st.x1 + pad < x0 || st.x0 - pad > x1 || st.z1 + pad < z0 || st.z0 - pad > z1) continue;
    let dirty = false;
    st.items.forEach((it, i) => { if (it.x < x0 || it.x > x1 || it.z < z0 || it.z > z1) return; const vis = !VEG.removed[it.id] && vegValid(it); st.mesh.setMatrixAt(i, vegMatrix(it, vis)); dirty = true; if (it.coll && !seen.has(it.id)) { it.coll.off = !vis; seen.add(it.id); } });
    if (dirty) st.mesh.instanceMatrix.needsUpdate = true;
  }
  VEG.rebuildUser();
};
VEG.rebuildUser = function () {
  for (const c of VEG.userColls) c.off = true; VEG.userColls = [];
  const byKey = {}; for (const t of VEG.userTrees) { (byKey[t.key] = byKey[t.key] || []).push(t); }
  for (const [key, sets] of Object.entries(VEG.userSets)) { const list = (byKey[key] || []).slice(0, 300);
    for (const st of sets) { list.forEach((t, i) => st.mesh.setMatrixAt(i, vegMatrix({ type: 'tree', kind: t.kind, x: t.x, z: t.z, r: t.r }, true))); st.mesh.count = list.length; st.mesh.instanceMatrix.needsUpdate = true; } }
  for (const t of VEG.userTrees) { const c = { x: t.x, z: t.z, r: t.kind === 'bush' ? 0 : t.kind === 'bamboo' ? 0.6 : 0.4, kind: 'tree' }; if (c.r) { addCollider(c); VEG.userColls.push(c); } }
};
// remove (hide) trees, grass, rocks and planted trees within a radius; returns how many
VEG.removeAt = function (x, z, rad) {
  let n = 0;
  for (const it of VEG.items) { if (VEG.removed[it.id]) continue; if (Math.abs(it.x - x) > rad || Math.abs(it.z - z) > rad) continue; if (Math.hypot(it.x - x, it.z - z) < rad) { VEG.removed[it.id] = 1; n++; } }
  const before = VEG.userTrees.length; VEG.userTrees = VEG.userTrees.filter(t => Math.hypot(t.x - x, t.z - z) >= rad); n += before - VEG.userTrees.length;
  return n;
};
