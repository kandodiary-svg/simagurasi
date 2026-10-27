// ===================== TERRAIN, ROADS, WATER (editable) =====================
let G = null, ROADS = [];
const TERR = { uResort: { value: 0 }, uResortC: { value: new THREE.Vector3(0, 0, 1) }, C: 40, chunks: [], nrm: null, spl: null, mat: null, group: null, hData: null, hTex: null, wchunks: new Map(), wGroup: null, roadGroup: null, decks: [] };
const groundH = (x, z) => hAt(G, x, z);
function groundN(x, z) { const e = 0.8; const dx = groundH(x + e, z) - groundH(x - e, z), dz = groundH(x, z + e) - groundH(x, z - e); return new THREE.Vector3(-dx, 2 * e, -dz).normalize(); }
const CELL = () => WORLD.size / (WORLD.n - 1);
const toIdx = (x, z) => { const { n, size } = WORLD, c = size / (n - 1); return [clamp(Math.round((x + size / 2) / c), 0, n - 1), clamp(Math.round((z + size / 2) / c), 0, n - 1)]; };
function roadDistAt(x, z) { const [i, j] = toIdx(x, z); return G.roadDist[j * WORLD.n + i]; }
function inlandLevel(x, z) { return waterLevelAt(G, x, z); }
function waterDepthAt(x, z) { const L = waterLevelAt(G, x, z); return isNaN(L) ? 0 : Math.max(0, L - groundH(x, z)); }

function initWorldData() {
  G = genHeights(); smoothHeights(G, 2); carveRiver(G);
  ROADS = buildRoads(G); carveRoads(G, ROADS);
  smoothHeights(G, 1);
  placeStructures();
  computeProtect();
  G.H0 = new Float32Array(G.H); G.Wl0 = new Float32Array(G.Wl);
}
// cells that editing must not touch: buildings, harbor, poles, deep sea (road beds are checked live)
function computeProtect() {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2; G.prot = new Uint8Array(n * n);
  const mark = (x, z, hw, hd, rot, pad) => { const R = Math.hypot(hw, hd) + pad, cs = Math.cos(rot), sn = Math.sin(rot);
    for (let j = Math.floor((z - R - h0) / cell); j <= Math.ceil((z + R - h0) / cell); j++) for (let i = Math.floor((x - R - h0) / cell); i <= Math.ceil((x + R - h0) / cell); i++) {
      if (i < 0 || j < 0 || i >= n || j >= n) continue; const px = h0 + i * cell - x, pz = h0 + j * cell - z, lx = px * cs - pz * sn, lz = px * sn + pz * cs;
      if (Math.abs(lx) < hw + pad && Math.abs(lz) < hd + pad) G.prot[j * n + i] = 1; } };
  for (const h of PLACED.houses) mark(h.x, h.z, h.w / 2 + 1.5, h.d / 2 + 3.4, h.rot, 1.5);
  if (PLACED.church) mark(PLACED.church.x, PLACED.church.z, 6, 15, PLACED.church.rot, 3);
  if (PLACED.lighthouse) mark(PLACED.lighthouse.x, PLACED.lighthouse.z, 8, 8, 0, 2);
  if (PLACED.harbor) { const H = PLACED.harbor; mark(H.x - Math.sin(H.dir) * H.len / 2, H.z - Math.cos(H.dir) * H.len / 2, 4, H.len / 2 + 9, H.dir, 3); }
  for (const p of PLACED.poles) mark(p.x, p.z, 0.5, 0.5, 0, 1.2);
  if (PLACED.home) { const P = PLACED.home.pad; mark(P.x, P.z, P.hw, P.hd, P.rot, 1); }
  if (PLACED.hall) mark(PLACED.hall.x, PLACED.hall.z, PLACED.hall.W / 2 + 1, PLACED.hall.D / 2 + 3, PLACED.hall.rot, 2);
}
function editable(k) { return !G.prot[k] && G.roadDist[k] > 4.4 && G.H0[k] > -4; }

// ---------- terrain material & mesh ----------
function terrainMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96, metalness: 0 });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, { tGrass: { value: TEX.grass }, tDirt: { value: TEX.dirt }, tRock: { value: TEX.rock }, tSand: { value: TEX.sand }, tMacro: { value: TEX.macro }, uGrassTint: SEASON.u.grass, uDry: SEASON.u.dry || (SEASON.u.dry = { value: 0.2 }), uSnow: SEASON.u.snow, uResort: TERR.uResort });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 splat; varying vec4 vSplat; varying vec3 vWPos; varying vec3 vWNor;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSplat = splat; vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz; vWNor = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tGrass, tDirt, tRock, tSand, tMacro; uniform vec3 uGrassTint; uniform float uDry, uSnow, uResort; varying vec4 vSplat; varying vec3 vWPos; varying vec3 vWNor;')
      .replace('#include <map_fragment>', `
        vec2 wuv = vWPos.xz;
        vec3 mc = texture2D(tMacro, wuv * 0.0045).rgb; float m2 = texture2D(tMacro, wuv * 0.019).g; float nz = texture2D(tMacro, wuv * 0.07).b;
        vec3 grass = mix(texture2D(tGrass, wuv * 0.21).rgb, texture2D(tGrass, wuv * 0.057 + 0.3).rgb, 0.45);
        grass *= uGrassTint; grass *= 0.68 + 0.55 * mc.r; grass = mix(grass, grass * vec3(0.8, 0.92, 0.85), smoothstep(0.35, 0.15, mc.g)); grass = mix(grass, grass * vec3(1.12, 1.02, 0.7), smoothstep(0.52, 0.78, m2) * 0.8);
        { float gl = dot(grass, vec3(0.3, 0.59, 0.11)); grass = mix(grass, vec3(gl), 0.14);
          float dp = smoothstep(0.42, 0.7, mc.b * 0.6 + m2 * 0.4 + (nz - 0.5) * 0.25);
          vec3 straw = vec3(0.6, 0.53, 0.33) * (gl / 0.5) * (0.92 + 0.22 * nz);
          grass = mix(grass, straw * (0.9 + 0.2 * mc.r), clamp(uDry * (0.12 + 0.95 * dp), 0.0, 0.7)); }
        vec3 dirt = texture2D(tDirt, wuv * 0.23).rgb * (0.85 + 0.3 * mc.g);
        vec3 an = abs(normalize(vWNor)); an = pow(an, vec3(4.0)); an /= (an.x + an.y + an.z);
        vec3 rock = texture2D(tRock, vWPos.zy * 0.11).rgb * an.x + texture2D(tRock, wuv * 0.11).rgb * an.y + texture2D(tRock, vWPos.xy * 0.11).rgb * an.z;
        vec3 sand = texture2D(tSand, wuv * 0.19).rgb * (0.9 + 0.2 * mc.b);
        sand *= mix(0.68, 1.0, smoothstep(-0.05, 0.75, vWPos.y));
        { float sl = dot(sand, vec3(0.3, 0.59, 0.11)); sand = mix(sand, mix(sand, vec3(sl * 1.03, sl * 1.01, sl * 0.95), 0.32), uResort * smoothstep(-0.6, 0.2, vWPos.y)); }
        vec4 w = max(vSplat + (nz - 0.5) * vec4(0.45, 0.45, 0.2, 0.3), 0.0); w = w * w * w; w /= (w.x + w.y + w.z + w.w + 1e-5);
        diffuseColor.rgb *= grass * w.x + dirt * w.y + rock * w.z + sand * w.w;
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.45, 0.74, 0.76), (1.0 - smoothstep(-3.2, -0.4, vWPos.y)) * 0.8);   // ground under a metre or more of water picks up the water's blue-green, so channels and drop-offs read as water, not wet sand
        float snowAmt = uSnow * smoothstep(0.55, 0.85, normalize(vWNor).y) * smoothstep(0.2, 1.2, vWPos.y) * (0.75 + 0.25 * nz);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.84, 0.87, 0.93), clamp(snowAmt * 1.15, 0.0, 0.88));
      `);
  };
  return m;
}
function computeAttrs(i0, j0, i1, j1) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, H = G.H, W = G.Wl, nrm = TERR.nrm, spl = TERR.spl, v = new THREE.Vector3();
  for (let j = Math.max(0, j0); j <= Math.min(n - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(n - 1, i1); i++) {
    const k = j * n + i, l = H[j * n + Math.max(0, i - 1)], r = H[j * n + Math.min(n - 1, i + 1)], u = H[Math.max(0, j - 1) * n + i], d = H[Math.min(n - 1, j + 1) * n + i];
    v.set(l - r, 2 * cell, u - d).normalize(); nrm[k * 3] = v.x; nrm[k * 3 + 1] = v.y; nrm[k * 3 + 2] = v.z;
    const h = H[k], x = h0 + i * cell, z = h0 + j * cell, rd = G.roadDist[k];
    let sand = 1 - sstep(1.3, 2.7, h); if (h < -0.5) sand = 1;
    let rock = sstep(0.74, 0.56, v.y) + (G.cliffMap[k] > 0.5 && h < 4 && h > -6 ? sstep(0.95, 0.8, v.y) : 0);
    let dirt = (rd > 3.3 && rd < 4.6 ? 0.8 : 0);
    const md = Math.hypot(x - MIKAN.x, z - MIKAN.z); if (md < MIKAN.r * 0.8 && h > 5) dirt += 0.45;
    if (Math.hypot(x - VILLAGE.x, z - VILLAGE.z) < VILLAGE.r * 0.6) dirt += 0.15;
    const L = W[k];
    if (!isNaN(L)) { const f = sstep(0.3, 1.5, L); if (h < L - 0.05) { sand = lerp(1, 0.35, f); dirt = 0.3 * f; rock = 0.6 * f; } else if (h < L + 1.2) dirt += 0.6 * f; }   // f: a stony bed upstream, plain sand where the river comes down to the sea
    const edited = Math.abs(h - G.H0[k]) > 0.6; if (edited && h > 2.5 && isNaN(L)) dirt += 0.25 * sstep(0.6, 2.5, Math.abs(h - G.H0[k]));
    let grass = Math.max(0, 1 - sand - rock - dirt * 0.6);
    const s = grass + dirt + rock + sand + 1e-5; spl[k * 4] = grass / s; spl[k * 4 + 1] = dirt / s; spl[k * 4 + 2] = Math.min(1, rock) / s; spl[k * 4 + 3] = sand / s;
  }
}
function buildTerrain(scene) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, C = TERR.C;
  TERR.mat = terrainMaterial(); TERR.group = new THREE.Group(); TERR.nrm = new Float32Array(n * n * 3); TERR.spl = new Float32Array(n * n * 4);
  computeAttrs(0, 0, n - 1, n - 1);
  const NC = (n - 1) / C;
  for (let cz = 0; cz < NC; cz++) for (let cx = 0; cx < NC; cx++) {
    const vn = C + 1, pos = new Float32Array(vn * vn * 3), idxs = [];
    for (let j = 0; j < vn; j++) for (let i = 0; i < vn; i++) { const q = j * vn + i; pos[q * 3] = h0 + (cx * C + i) * cell; pos[q * 3 + 2] = h0 + (cz * C + j) * cell; }
    for (let j = 0; j < C; j++) for (let i = 0; i < C; i++) { const a = j * vn + i, b = a + 1, c = a + vn, d = c + 1; idxs.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(vn * vn * 3), 3)); g.setAttribute('splat', new THREE.BufferAttribute(new Float32Array(vn * vn * 4), 4)); g.setIndex(idxs);
    const m = new THREE.Mesh(g, TERR.mat); m.receiveShadow = true; m.castShadow = true; TERR.group.add(m);
    TERR.chunks.push({ mesh: m, cx, cz }); fillChunk(TERR.chunks[TERR.chunks.length - 1]);
  }
  scene.add(TERR.group);
  TERR.wGroup = new THREE.Group(); scene.add(TERR.wGroup);
  return TERR.group;
}
function fillChunk(ch) {
  const { n } = WORLD, C = TERR.C, vn = C + 1, g = ch.mesh.geometry, pos = g.attributes.position.array, nor = g.attributes.normal.array, sp = g.attributes.splat.array;
  for (let j = 0; j < vn; j++) for (let i = 0; i < vn; i++) {
    const k = (ch.cz * C + j) * n + ch.cx * C + i, q = j * vn + i;
    pos[q * 3 + 1] = G.H[k]; nor[q * 3] = TERR.nrm[k * 3]; nor[q * 3 + 1] = TERR.nrm[k * 3 + 1]; nor[q * 3 + 2] = TERR.nrm[k * 3 + 2];
    sp[q * 4] = TERR.spl[k * 4]; sp[q * 4 + 1] = TERR.spl[k * 4 + 1]; sp[q * 4 + 2] = TERR.spl[k * 4 + 2]; sp[q * 4 + 3] = TERR.spl[k * 4 + 3];
  }
  g.attributes.position.needsUpdate = g.attributes.normal.needsUpdate = g.attributes.splat.needsUpdate = true; g.computeBoundingSphere(); g.computeBoundingBox();
}
// rebuild everything that depends on heights/water inside a vertex-index box
function refreshRegion(i0, j0, i1, j1, opts = {}) {
  const { n } = WORLD, C = TERR.C;
  i0 = Math.max(0, i0 - 1); j0 = Math.max(0, j0 - 1); i1 = Math.min(n - 1, i1 + 1); j1 = Math.min(n - 1, j1 + 1);
  computeAttrs(i0, j0, i1, j1);
  for (const ch of TERR.chunks) { const a0 = ch.cx * C, b0 = ch.cz * C; if (a0 > i1 || a0 + C < i0 || b0 > j1 || b0 + C < j0) continue; fillChunk(ch); }
  updateHeightTex(i0, j0, i1, j1);
  const c0 = Math.floor(Math.max(0, i0 - 2) / C), c1 = Math.floor(Math.min(n - 2, i1 + 1) / C), r0 = Math.floor(Math.max(0, j0 - 2) / C), r1 = Math.floor(Math.min(n - 2, j1 + 1) / C);
  for (let cz = r0; cz <= r1; cz++) for (let cx = c0; cx <= c1; cx++) rebuildWaterChunk(cx, cz);
  if (opts.veg !== false && typeof VEG !== 'undefined' && VEG.refresh) { const { size } = WORLD, cell = size / (n - 1), h0 = -size / 2; VEG.refresh(h0 + i0 * cell, h0 + j0 * cell, h0 + i1 * cell, h0 + j1 * cell); }
}
function refreshAll() { const n = WORLD.n; refreshRegion(0, 0, n - 1, n - 1); }

// ---------- inland water (rivers, ponds, waterfalls) ----------
function cellLevel(i, j) {
  const { n } = WORLD; if (i < 0 || j < 0 || i >= n - 1 || j >= n - 1) return NaN; const W = G.Wl, H = G.H;
  const ks = [j * n + i, j * n + i + 1, (j + 1) * n + i, (j + 1) * n + i + 1]; let L = NaN, mn = Infinity;
  for (const k of ks) { if (!isNaN(W[k]) && !(W[k] <= L)) L = W[k]; mn = Math.min(mn, H[k]); }
  return !isNaN(L) && L > 0.15 && mn < L ? L : NaN;
}
function rebuildWaterChunk(cx, cz) {
  const key = cx + ',' + cz, old = TERR.wchunks.get(key); if (old) { TERR.wGroup.remove(old); old.geometry.dispose(); TERR.wchunks.delete(key); }
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, C = TERR.C, H = G.H;
  const i0 = cx * C, j0 = cz * C, R = C + 2;
  const L = new Float32Array(R * R), foam = new Float32Array(R * R); let any = false;
  for (let b = 0; b < R; b++) for (let a = 0; a < R; a++) { const v = cellLevel(i0 + a - 1, j0 + b - 1); L[b * R + a] = v; if (!isNaN(v) && a > 0 && b > 0 && a <= C && b <= C) any = true; }
  if (!any) return;
  for (let b = 1; b < R - 1; b++) for (let a = 1; a < R - 1; a++) { const v = L[b * R + a]; if (isNaN(v)) continue; let f = 0;
    for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const w = L[(b + db) * R + a + da]; if (!isNaN(w) && w > v + 0.45) f = Math.max(f, clamp((w - v) / 2.5, 0.35, 1)); } foam[b * R + a] = f; }
  const vf = (a, b) => (foam[b * R + a] + foam[b * R + a + 1] + foam[(b + 1) * R + a] + foam[(b + 1) * R + a + 1]) * 0.25; // corner (a,b) in ring coords
  const pos = [], fo = [], idx = [];
  const quad = (p0, p1, p2, p3, f0, f1, f2, f3) => { const o = pos.length / 3; pos.push(...p0, ...p1, ...p2, ...p3); fo.push(f0, f1, f2, f3); idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); };
  const W = G.Wl;
  for (let b = 1; b <= C; b++) for (let a = 1; a <= C; a++) {
    const v = L[b * R + a]; if (isNaN(v)) continue;
    const i = i0 + a - 1, j = j0 + b - 1, x0 = h0 + i * cell, z0 = h0 + j * cell, x1 = x0 + cell, z1 = z0 + cell;
    // per-corner levels: a continuous surface; very steep cells render as falling water in the shader
    const cl = (ci, cj) => { const w = W[cj * n + ci]; return isNaN(w) ? v : w; };
    quad([x0, cl(i, j), z0], [x1, cl(i + 1, j), z0], [x0, cl(i, j + 1), z1], [x1, cl(i + 1, j + 1), z1], vf(a - 1, b - 1), vf(a, b - 1), vf(a - 1, b), vf(a, b));
    // spill faces where the water edge hangs well above lower dry ground
    for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (!isNaN(L[(b + db) * R + a + da])) continue;
      let e0, e1; if (da === 1) { e0 = [i + 1, j]; e1 = [i + 1, j + 1]; } else if (da === -1) { e0 = [i, j + 1]; e1 = [i, j]; } else if (db === 1) { e0 = [i + 1, j + 1]; e1 = [i, j + 1]; } else { e0 = [i, j]; e1 = [i + 1, j]; }
      const y0 = cl(e0[0], e0[1]), y1 = cl(e1[0], e1[1]), gh = Math.max(H[e0[1] * n + e0[0]], H[e1[1] * n + e1[0]]); const bottom = Math.max(gh, 0);
      if (Math.min(y0, y1) - bottom < 0.8) continue;
      const p0 = [h0 + e0[0] * cell, y0, h0 + e0[1] * cell], p1 = [h0 + e1[0] * cell, y1, h0 + e1[1] * cell];
      quad(p0, p1, [p0[0], bottom - 0.05, p0[2]], [p1[0], bottom - 0.05, p1[2]], 0.6, 0.6, 1, 1);
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aFoam', new THREE.Float32BufferAttribute(fo, 1)); g.setIndex(idx); g.computeBoundingSphere();
  const m = new THREE.Mesh(g, waterMat); m.renderOrder = 6; TERR.wGroup.add(m); TERR.wchunks.set(key, m);
}
function buildInlandWater() { const NC = (WORLD.n - 1) / TERR.C; for (let cz = 0; cz < NC; cz++) for (let cx = 0; cx < NC; cx++) rebuildWaterChunk(cx, cz); }
function updateHeightTex(i0, j0, i1, j1) {
  const { n } = WORLD; for (let j = Math.max(0, j0); j <= Math.min(n - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(n - 1, i1); i++) TERR.hData[j * n + i] = THREE.DataUtils.toHalfFloat(G.H[j * n + i]);
  TERR.hTex.needsUpdate = true;
}

// ---------- roads ----------
function roadFrames(r) {
  const out = []; let dist = 0;
  for (let i = 0; i < r.pts.length; i++) {
    const p = r.pts[i], a = r.pts[Math.max(0, i - 1)], b = r.pts[Math.min(r.pts.length - 1, i + 1)];
    let tx = b[0] - a[0], tz = b[1] - a[1]; const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
    if (i > 0) dist += Math.hypot(p[0] - r.pts[i - 1][0], p[1] - r.pts[i - 1][1]);
    out.push({ x: p[0], z: p[1], y: r.h[i], tx, tz, nx: -tz, nz: tx, dist });
  }
  return out;
}
function roadMaterial(lines, prio = 2, J = null) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0, polygonOffset: true, polygonOffsetFactor: -prio, polygonOffsetUnits: -prio * 2 });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, { tAsph: { value: TEX.asphalt }, tMacro: { value: TEX.macro }, uLines: { value: lines ? 1 : 0 }, uJ: { value: J ? new THREE.Vector3(J.x, J.z, 1) : new THREE.Vector3(0, 0, 0) } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 rinfo; varying vec3 vR; varying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvR = rinfo; vWP = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D tAsph, tMacro; uniform float uLines; uniform vec3 uJ; varying vec3 vR; varying vec3 vWP;')
      .replace('#include <map_fragment>', `
        float u = vR.x, d = vR.y, w = vR.z;
        vec3 a = texture2D(tAsph, vWP.xz * 0.25).rgb * (0.85 + 0.3 * texture2D(tMacro, vWP.xz * 0.02).r);
        float wear = texture2D(tMacro, vWP.xz * 0.3).b;
        float edge = (step(0.25, u * w) * step(u * w, 0.4)) + (step(w - 0.4, u * w) * step(u * w, w - 0.25));
        float center = step(abs(u * w - w * 0.5), 0.07) * step(fract(d / 9.0), 0.55);
        float nearJ = uJ.z * (1.0 - smoothstep(5.0, 6.5, distance(vWP.xz, uJ.xy)));
        float line = clamp(edge * (1.0 - nearJ) + center, 0.0, 1.0) * uLines * smoothstep(0.25, 0.45, wear);
        diffuseColor.rgb *= mix(a, vec3(0.88, 0.88, 0.85), line);
      `);
  };
  return m;
}
let BRIDGE_MATS = null;
function makeRoadMesh(r) {
  const group = new THREE.Group(), F = roadFrames(r); r.frames = F;
  const pos = [], info = [], idx = [], half = r.w / 2;
  F.forEach((f, i) => {
    for (const s of [-1, 1]) pos.push(f.x + f.nx * half * s, f.y + 0.04, f.z + f.nz * half * s);
    info.push(0, f.dist, r.w, 1, f.dist, r.w);
    if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('rinfo', new THREE.Float32BufferAttribute(info, 3)); g.setIndex(idx); g.computeVertexNormals();
  const JR = ROADS.find(q => q.junction), J = JR && JR.junction;
  const m = new THREE.Mesh(g, roadMaterial(r.lines, r.user ? 4 : r.junction ? 3 : 2, r.junction || r.user ? null : J)); m.receiveShadow = true; group.add(m);
  const disc = (cx, cz, cy, rad, prio) => { const cg = new THREE.CircleGeometry(rad, 28); cg.rotateX(-Math.PI / 2); const p = cg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, z = p.getZ(i) + cz; p.setXYZ(i, x, (cy === null ? groundH(x, z) + 0.05 : cy + 0.04), z); }
    const inf = []; for (let i = 0; i < p.count; i++) inf.push(0.5, 0, r.w); cg.setAttribute('rinfo', new THREE.Float32BufferAttribute(inf, 3)); cg.computeVertexNormals(); const cm = new THREE.Mesh(cg, roadMaterial(false, prio)); cm.receiveShadow = true; group.add(cm); };
  if (r.junction) { const j = r.junction; disc(j.x + j.nx * 4.0, j.z + j.nz * 4.0, null, r.w / 2 + 2.2, 1); }
  for (const [end, k] of [[F[0], 0], [F[F.length - 1], F.length - 1]]) { if (r.junction && k === 0) continue; if (!r.user && r === ROADS[0] && k === F.length - 1) continue; disc(end.x, end.z, end.y, r.w / 2, r.user ? 3 : 1); }
  if (!r.user) { // curbs
    const cp = [], ci = [], Jc = J; const cmap = [];
    F.forEach((f, i) => { const skip = (Jc && (r.junction ? i < 3 : Math.hypot(f.x - Jc.x, f.z - Jc.z) < 7.5)) || (r.bridge && r.bridge[i]); cmap.push(skip); for (const s of [-1, 1]) { const ox = f.nx * (half + 0.05) * s, oz = f.nz * (half + 0.05) * s; cp.push(f.x + ox, f.y + 0.02, f.z + oz, f.x + ox + f.nx * 0.18 * s, f.y + 0.16, f.z + oz + f.nz * 0.18 * s); } if (i && !skip && !cmap[i - 1]) { const b = (i - 1) * 4; for (const o of [0, 2]) ci.push(b + o, b + o + 4, b + o + 1, b + o + 1, b + o + 4, b + o + 5); } });
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); cg.setIndex(ci); cg.computeVertexNormals();
    const cm = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: '#b9b5ab', roughness: 0.9, side: THREE.DoubleSide })); cm.receiveShadow = true; group.add(cm);
  }
  if (r.bridge && r.bridge.some(Boolean)) group.add(makeBridge(r, F));
  return group;
}
function makeBridge(r, F) {
  if (!BRIDGE_MATS) BRIDGE_MATS = { con: worldMat(TEX.concrete, 0.3, '#e4e0d6', 0.9), rail: new THREE.MeshStandardMaterial({ color: '#c8323a', roughness: 0.45, metalness: 0.3 }) };
  const g = new THREE.Group(), half = r.w / 2 + 0.35;
  let runs = [], cur = null; F.forEach((f, i) => { if (r.bridge[i]) { if (!cur) { cur = [i, i]; runs.push(cur); } else cur[1] = i; } else cur = null; });
  for (const [a, b] of runs) {
    const s0 = Math.max(0, a - 1), s1 = Math.min(F.length - 1, b + 1);
    // deck slab: sides + underside
    const pos = [], idx = [];
    for (let i = s0; i <= s1; i++) { const f = F[i]; for (const s of [-1, 1]) { pos.push(f.x + f.nx * half * s, f.y + 0.03, f.z + f.nz * half * s, f.x + f.nx * half * s, f.y - 0.75, f.z + f.nz * half * s); } }
    for (let i = 1; i <= s1 - s0; i++) { const o = (i - 1) * 4, p = i * 4; idx.push(o, p, o + 1, o + 1, p, p + 1, o + 2, o + 3, p + 2, o + 3, p + 3, p + 2, o + 1, p + 1, o + 3, o + 3, p + 1, p + 3); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); dg.setIndex(idx); dg.computeVertexNormals();
    const dm = new THREE.Mesh(dg, BRIDGE_MATS.con); dm.material.side = THREE.DoubleSide; dm.castShadow = dm.receiveShadow = true; g.add(dm);
    // parapets with a red handrail (a classic island bridge)
    for (const s of [-1, 1]) for (let i = s0 + 1; i <= s1; i++) {
      const p = F[i - 1], q = F[i], ax = p.x + p.nx * (half - 0.15) * s, az = p.z + p.nz * (half - 0.15) * s, bx = q.x + q.nx * (half - 0.15) * s, bz = q.z + q.nz * (half - 0.15) * s;
      const L = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bx - ax, bz - az), my = (p.y + q.y) / 2, slope = Math.atan2(q.y - p.y, L);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.55, L + 0.05), BRIDGE_MATS.con); wall.position.set((ax + bx) / 2, my + 0.3, (az + bz) / 2); wall.rotation.set(-slope, ang, 0, 'YXZ'); wall.castShadow = true; g.add(wall);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, L + 0.05), BRIDGE_MATS.rail); rail.position.set((ax + bx) / 2, my + 0.98, (az + bz) / 2); rail.rotation.copy(wall.rotation); g.add(rail);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), BRIDGE_MATS.rail); post.position.set(ax, p.y + 0.78, az); g.add(post);
      addCollider({ x: (ax + bx) / 2, z: (az + bz) / 2, hw: 0.15, hd: L / 2, rot: ang, kind: 'rail', y: my });
    }
    // piers
    const mid = F[Math.floor((s0 + s1) / 2)]; const gy = groundH(mid.x, mid.z);
    if (s1 - s0 >= 4 && mid.y - gy > 1.5) { const pier = new THREE.Mesh(new THREE.BoxGeometry(r.w * 0.8, mid.y - gy, 0.9), BRIDGE_MATS.con); pier.position.set(mid.x, (mid.y + gy) / 2 - 0.4, mid.z); pier.rotation.y = Math.atan2(mid.tx, mid.tz); pier.castShadow = true; g.add(pier); }
  }
  return g;
}
function buildRoadMeshes(scene) {
  TERR.roadGroup = new THREE.Group();
  for (const r of ROADS) { r.mesh = makeRoadMesh(r); TERR.roadGroup.add(r.mesh); }
  rebuildDecks(); scene.add(TERR.roadGroup); return TERR.roadGroup;
}
function rebuildDecks() {
  TERR.decks = [];
  for (const r of ROADS) { if (!r.bridge) continue; for (let i = 1; i < r.pts.length; i++) if (r.bridge[i] || r.bridge[i - 1]) TERR.decks.push({ ax: r.pts[i - 1][0], az: r.pts[i - 1][1], bx: r.pts[i][0], bz: r.pts[i][1], ya: r.h[i - 1], yb: r.h[i], hw: r.w / 2 + 0.2 }); }
}
function deckY(x, z) {
  for (const d of TERR.decks) { const vx = d.bx - d.ax, vz = d.bz - d.az, t = clamp(((x - d.ax) * vx + (z - d.az) * vz) / (vx * vx + vz * vz), 0, 1); if (Math.hypot(x - d.ax - vx * t, z - d.az - vz * t) < d.hw) return lerp(d.ya, d.yb, t); }
  return null;
}
// distance to the nearest road centreline for every vertex (no carving)
function rasterizeRoadDist() {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, best = new Float32Array(n * n).fill(1e9);
  for (const r of ROADS) { const R = r.w / 2 + 14;
    for (let s = 1; s < r.pts.length; s++) { const a = r.pts[s - 1], b = r.pts[s], vx = b[0] - a[0], vz = b[1] - a[1], ll = vx * vx + vz * vz || 1;
      for (let j = Math.max(0, Math.floor((Math.min(a[1], b[1]) - R - h0) / cell)); j <= Math.min(n - 1, Math.ceil((Math.max(a[1], b[1]) + R - h0) / cell)); j++)
        for (let i = Math.max(0, Math.floor((Math.min(a[0], b[0]) - R - h0) / cell)); i <= Math.min(n - 1, Math.ceil((Math.max(a[0], b[0]) + R - h0) / cell)); i++) {
          const x = h0 + i * cell, z = h0 + j * cell, t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / ll, 0, 1), d = Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t), k = j * n + i; if (d < best[k]) best[k] = d; } } }
  G.roadDist = best;
}
// carve the terrain for one new road; returns the vertex box it touched
function carveSingleRoad(r) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, half = r.w / 2, fall = 7, R = half + 1.2 + fall;
  const best = new Map();
  for (let s = 1; s < r.pts.length; s++) { const a = r.pts[s - 1], b = r.pts[s], vx = b[0] - a[0], vz = b[1] - a[1], ll = vx * vx + vz * vz || 1;
    for (let j = Math.max(0, Math.floor((Math.min(a[1], b[1]) - R - h0) / cell)); j <= Math.min(n - 1, Math.ceil((Math.max(a[1], b[1]) + R - h0) / cell)); j++)
      for (let i = Math.max(0, Math.floor((Math.min(a[0], b[0]) - R - h0) / cell)); i <= Math.min(n - 1, Math.ceil((Math.max(a[0], b[0]) + R - h0) / cell)); i++) {
        const x = h0 + i * cell, z = h0 + j * cell, t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / ll, 0, 1), d = Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t), k = j * n + i;
        const prev = best.get(k); if (!prev || d < prev[0]) best.set(k, [d, lerp(r.h[s - 1], r.h[s], t), r.bridge[s - 1] || r.bridge[s]]); } }
  let i0 = n, j0 = n, i1 = 0, j1 = 0;
  for (const [k, [d, y, br]] of best) {
    if (G.prot[k] || G.roadDist[k] < 4.6) continue; if (br && (!isNaN(G.Wl[k]) || d < half + 1)) continue;
    const tgt = y - 0.08; G.H[k] = d < half + 1.2 ? tgt : lerp(tgt, G.H[k], sstep(half + 1.4, half + 1.4 + fall, d));
    if (!isNaN(G.Wl[k]) && G.H[k] > G.Wl[k] + 0.2) G.Wl[k] = NaN;
    const i = k % n, j = Math.floor(k / n); i0 = Math.min(i0, i); j0 = Math.min(j0, j); i1 = Math.max(i1, i); j1 = Math.max(j1, j);
  }
  return [i0, j0, i1, j1];
}

// ---------- water shader (sea plane + inland water + waterfalls) ----------
let waterMat;
function buildWater(scene) {
  const { n, size } = WORLD; TERR.hData = new Uint16Array(n * n);
  for (let k = 0; k < n * n; k++) TERR.hData[k] = THREE.DataUtils.toHalfFloat(G.H[k]);
  const ht = new THREE.DataTexture(TERR.hData, n, n, THREE.RedFormat, THREE.HalfFloatType); ht.magFilter = ht.minFilter = THREE.LinearFilter; ht.needsUpdate = true; TERR.hTex = ht;
  waterMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { time: { value: 0 }, uTide: { value: 0 }, uStorm: { value: 0 }, uGlow: { value: 0 }, uResort: TERR.uResort, uResortC: TERR.uResortC, sunDir: { value: new THREE.Vector3(0.5, 0.8, 0.3) }, sunCol: { value: new THREE.Color(1, 0.95, 0.85) }, skyCol: { value: new THREE.Color(0.3, 0.55, 0.9) }, horCol: { value: new THREE.Color(0.7, 0.8, 0.9) }, ambient: { value: 1 }, hTex: { value: null }, nTex: { value: null }, mTex: { value: null }, wsize: { value: size } }]),
    vertexShader: `attribute float aFoam; varying float vFoam; varying vec3 vW; #include <fog_pars_vertex>
      void main(){ vFoam = aFoam; vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition; #include <fog_vertex> }`.replace(/#include <(\w+)>/g, '\n#include <$1>\n'),
    fragmentShader: `uniform float time, wsize, ambient, uResort, uTide, uStorm, uGlow; uniform vec3 sunDir, sunCol, skyCol, horCol, uResortC; uniform sampler2D hTex, nTex, mTex; varying vec3 vW; varying float vFoam;
      #include <common>
      #include <fog_pars_fragment>
      void main(){
        vec2 huv = (vW.xz + wsize * 0.5) / wsize; bool outside = huv.x < 0.0 || huv.y < 0.0 || huv.x > 1.0 || huv.y > 1.0;
        float th = outside ? -30.0 : texture2D(hTex, huv).r; float isSea = 1.0 - step(0.02, abs(vW.y - uTide)); float depth = max(0.0, vW.y - th) + step(0.05, vW.y) * 0.45 * (1.0 - isSea);
        vec3 gN = normalize(cross(dFdx(vW), dFdy(vW))); float fall = 1.0 - smoothstep(0.45, 0.75, abs(gN.y));
        vec2 uv = vW.xz * 0.032;
        vec3 n1 = texture2D(nTex, uv + vec2(time * 0.011, time * 0.007)).xyz * 2.0 - 1.0;
        vec3 n2 = texture2D(nTex, uv * 2.3 - vec2(time * 0.009, -time * 0.013)).xyz * 2.0 - 1.0;
        vec3 n3 = texture2D(nTex, vW.xz * 0.004 + time * 0.002).xyz * 2.0 - 1.0;
        float calm = mix(0.55, 1.0, smoothstep(0.0, 3.0, depth));
        float chop = calm * (1.0 + uStorm * 1.8 * isSea); vec3 N = normalize(vec3((n1.x + n2.x * 0.6 + n3.x * 0.8) * chop, 4.5, (n1.y + n2.y * 0.6 + n3.y * 0.8) * chop));
        vec3 V = normalize(cameraPosition - vW);
        float fres = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        float sea = isSea * (outside ? 0.0 : 1.0), rs = uResort * sea;
        vec3 shallow = mix(vec3(0.2, 0.54, 0.48), vec3(0.20, 0.80, 0.76), rs), mid = mix(vec3(0.07, 0.34, 0.39), vec3(0.03, 0.60, 0.72), rs), deep = mix(vec3(0.03, 0.17, 0.25), vec3(0.01, 0.24, 0.52), rs);
        vec3 wc = mix(shallow, mid, smoothstep(0.2, mix(3.5, 5.5, rs), depth)); wc = mix(wc, deep, smoothstep(mix(3.5, 7.0, rs), mix(18.0, 26.0, rs), depth));
        float near = 1.0 - smoothstep(uResortC.z * 0.6, uResortC.z * 1.4, distance(vW.xz, uResortC.xy));
        float rk = texture2D(mTex, vW.xz * 0.018).r * 0.6 + texture2D(mTex, vW.xz * 0.05 + 0.3).g * 0.4;
        float reef = smoothstep(0.55, 0.68, rk) * smoothstep(0.7, 1.6, depth) * (1.0 - smoothstep(5.5, 9.0, depth)) * rs * near;
        wc = mix(wc, vec3(0.03, 0.30, 0.34) + vec3(0.08, 0.06, 0.0) * texture2D(mTex, vW.xz * 0.2).b, reef * 0.75);
        float dif = 0.6 + 0.4 * max(dot(N, sunDir), 0.0);
        vec3 col = wc * dif * mix(vec3(1.0), sunCol, 0.5) * ambient;
        vec3 R = reflect(-V, N); vec3 refl = mix(horCol, skyCol, clamp(R.y * 2.2, 0.0, 1.0));
        col = mix(col, refl, fres * 0.9);
        vec3 Hh = normalize(sunDir + V); float sp = pow(max(dot(N, Hh), 0.0), 420.0) * 5.0 + pow(max(dot(N, Hh), 0.0), 60.0) * 0.12;
        col += sunCol * sp * step(0.0, sunDir.y);
        float fn = texture2D(mTex, vW.xz * 0.11 + vec2(time * 0.015, 0.0)).b;
        float shore = (1.0 - smoothstep(0.08, 0.55, depth)) * smoothstep(0.0, 0.08, depth);
        float bands = smoothstep(0.8, 1.0, sin(depth * 7.0 - time * 1.4 + fn * 5.0) * 0.5 + 0.5) * (1.0 - smoothstep(0.1, 1.4, depth));
        float bub = texture2D(mTex, vW.xz * 0.35 + vec2(time * 0.05, time * 0.08)).b;
        float foam = clamp(shore * smoothstep(0.3, 0.6, fn) * 0.9 + bands * 0.65 + vFoam * smoothstep(0.35, 0.65, bub + vFoam * 0.3), 0.0, 1.0) * (outside ? 0.0 : 1.0);
        float wcap = smoothstep(0.6, 0.82, texture2D(mTex, vW.xz * 0.05 + vec2(time * 0.05, time * 0.02)).b + n1.x * 0.15) * uStorm * isSea * smoothstep(1.5, 5.0, depth); foam = max(foam, wcap * 0.85); // whitecaps in a storm
        col = mix(col, mix(vec3(0.92, 0.96, 0.98) * ambient, vec3(0.04, 0.45, 1.0) * 1.25, uGlow), foam); // at a 夜光虫 night the breaking foam itself glows blue
        float spk = smoothstep(0.74, 0.95, texture2D(mTex, vW.xz * 0.6 + vec2(time * 0.07, -time * 0.05)).b) * smoothstep(0.04, 0.2, depth) * (1.0 - smoothstep(0.5, 3.0, depth)) * (0.5 + 0.5 * sin(time * 3.0 + vW.x * 1.7));
        col += vec3(0.02, 0.38, 1.0) * uGlow * clamp(bands * 0.7 + spk * 0.9, 0.0, 1.0); // and sparkles in the shallows
        float alpha = smoothstep(0.0, 0.45, depth) * mix(mix(0.42, 0.4, rs), 0.97, smoothstep(0.3, mix(6.0, 9.0, rs), depth)); alpha = max(alpha, reef * 0.8); alpha = max(alpha, foam * 0.85 * smoothstep(0.0, 0.12, depth)); alpha = mix(alpha, 1.0, fres * 0.6); if (outside) alpha = 1.0;
        if (fall > 0.0) { // falling water: streaks moving down
          float hc = vW.x * 0.9 + vW.z * 0.9; float st = texture2D(mTex, vec2(hc * 0.35, vW.y * 0.12 + time * 0.9)).b; float st2 = texture2D(mTex, vec2(hc * 0.8, vW.y * 0.3 + time * 1.6)).g;
          vec3 fc = mix(vec3(0.62, 0.84, 0.92), vec3(0.97, 0.99, 1.0), smoothstep(0.35, 0.75, st * 0.6 + st2 * 0.6)) * ambient;
          col = mix(col, fc, fall); alpha = mix(alpha, 0.88 + st * 0.1, fall);
        }
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  waterMat.uniforms.uResort = TERR.uResort; waterMat.uniforms.uResortC = TERR.uResortC;
  waterMat.uniforms.hTex.value = ht; waterMat.uniforms.nTex.value = TEX.waterN; waterMat.uniforms.mTex.value = TEX.macro;
  const pg = new THREE.PlaneGeometry(8000, 8000); pg.setAttribute('aFoam', new THREE.Float32BufferAttribute(new Float32Array(pg.attributes.position.count), 1));
  const w = new THREE.Mesh(pg, waterMat); w.rotation.x = -Math.PI / 2; w.position.y = 0; w.renderOrder = 5; scene.add(w);
  buildInlandWater();
  return w;
}
