// ===================== 秋の道ばた: ススキ・コスモス・彼岸花（季節で出たり消えたり） =====================
// 彼岸花: 田んぼのあぜと道ばたに、お彼岸のころ（9/12〜10/5）だけ真っ赤に。
// コスモス: 集落のはずれの道ばた・あぜに群れて咲く（9/15〜11/10）。
// ススキ: 島の外まわりの道ばたと、丘の草地に株で。夏は葉だけ、9月から穂が出て、11月下旬からは枯れ色に。
const FLORA = { built: false, sets: {}, items: [], dirty: false, chkT: 0, key: '' };
FLORA.when = function () {
  const d = typeof seasonDate === 'function' ? seasonDate() : new Date(), md = (d.getMonth() + 1) * 100 + d.getDate();
  return { higan: md >= 912 && md <= 1005, cosmos: md >= 915 && md <= 1110, susuki: md >= 601 && md <= 1225, plume: md >= 901 && md <= 1225, dry: md >= 1120 || md <= 300, key: String(md) };
};
// ---------- geometry ----------
FLORA.strip = function (pts, w0, w1, c0, c1) { // a thin ribbon through 3D points, width w0→w1, colour c0→c1
  const P = [], C = [], I = [], n = pts.length;
  for (let k = 0; k < n; k++) { const t = k / (n - 1), w = (w0 + (w1 - w0) * t) / 2, p = pts[k], q = pts[Math.min(n - 1, k + 1)], r = pts[Math.max(0, k - 1)];
    const dx = q[0] - r[0], dz = q[2] - r[2], L = Math.hypot(dx, dz) || 1, sx = -dz / L * w || w, sz = dx / L * w; P.push(p[0] - sx, p[1], p[2] - sz, p[0] + sx, p[1], p[2] + sz);
    const c = c0.clone().lerp(c1, t); C.push(c.r, c.g, c.b, c.r, c.g, c.b); if (k < n - 1) { const a = k * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
};
FLORA.blade = function (R, h, ang, lean, c0, c1, w = 0.03) { const pts = []; for (let k = 0; k <= 5; k++) { const t = k / 5, o = t * t * lean * h; pts.push([Math.sin(ang) * o, t * h * (1 - 0.18 * t * t), Math.cos(ang) * o]); } return FLORA.strip(pts, w, 0.004, c0, c1); };
FLORA.geoSusuki = function (seed) {
  const R = mulberry(seed), leaf = [], plume = [], G0 = new THREE.Color('#58763a'), G1 = new THREE.Color('#a9b46c'), S0 = new THREE.Color('#9a8a62'), P0 = new THREE.Color('#cfc2a4'), P1 = new THREE.Color('#f6f0e2');
  for (let k = 0; k < 34; k++) leaf.push(FLORA.blade(R, 0.85 + R() * 0.55, R() * 6.28, 0.35 + R() * 0.4, G0, G1, 0.055));
  for (let k = 0; k < 10; k++) { const a = R() * 6.28, h = 1.35 + R() * 0.55, lean = 0.08 + R() * 0.12, top = [Math.sin(a) * lean * h, h, Math.cos(a) * lean * h];
    plume.push(FLORA.blade(R, h, a, lean, S0, S0, 0.016));
    // the silver ear: a spray of drooping tufts from the top of the stalk
    for (let j = 0; j < 7; j++) { const b = a + (j - 3) * 0.42 + (R() - 0.5) * 0.3, len = 0.3 + R() * 0.16, pts = []; for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push([top[0] + Math.sin(b) * t * len * 0.5, top[1] - 0.03 - t * t * len * 0.8 + (1 - t) * 0.02, top[2] + Math.cos(b) * t * len * 0.5]); } plume.push(FLORA.strip(pts, 0.085, 0.02, P0, P1)); }
  }
  return { leaf: mergeGeometries(leaf), plume: mergeGeometries(plume) };
};
FLORA.flower = function (cx, cy, cz, r, n, col, tilt, R, out) { // a flat flower of n petals facing up-ish
  const P = [], C = [], c = new THREE.Color(col), mid = new THREE.Color('#e6b22a');
  const nx = Math.sin(tilt[0]) * 0.6, nz = Math.sin(tilt[1]) * 0.6; // tilt the disc a little
  for (let k = 0; k < n; k++) { const a0 = k / n * 6.283, a1 = a0 + 6.283 / n * 0.8, am = (a0 + a1) / 2;
    const pt = (a, rr) => [cx + Math.cos(a) * rr, cy + (Math.cos(a) * nx + Math.sin(a) * nz) * rr, cz + Math.sin(a) * rr];
    const p0 = pt(am, r * 0.18), p1 = pt(a0, r), p2 = pt(a1, r); P.push(...p0, ...p1, ...p2); const cc = c.clone().multiplyScalar(0.9 + R() * 0.2); for (let i = 0; i < 3; i++) C.push(cc.r, cc.g, cc.b); }
  for (let k = 0; k < 5; k++) { const a0 = k / 5 * 6.283, a1 = (k + 1) / 5 * 6.283; P.push(cx, cy + 0.006, cz, cx + Math.cos(a0) * r * 0.22, cy + 0.006, cz + Math.sin(a0) * r * 0.22, cx + Math.cos(a1) * r * 0.22, cy + 0.006, cz + Math.sin(a1) * r * 0.22); for (let i = 0; i < 3; i++) C.push(mid.r, mid.g, mid.b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals();
  // flowers read better lit from above: point every normal up
  const nm = g.attributes.normal; for (let i = 0; i < nm.count; i++) nm.setXYZ(i, 0, 1, 0); out.push(g);
};
FLORA.geoCosmos = function (seed) {
  const R = mulberry(seed), parts = [], S0 = new THREE.Color('#4f7a32'), S1 = new THREE.Color('#79a24a'), cols = ['#f29ac0', '#fbf2f5', '#d4417e', '#f6c1d4', '#e870a6'];
  for (let k = 0; k < 15; k++) { const a = R() * 6.28, d = Math.sqrt(R()) * 0.55, h = 0.7 + R() * 0.5, lean = 0.12 + R() * 0.14, x0 = Math.sin(a) * d, z0 = Math.cos(a) * d;
    const st = FLORA.blade(R, h, R() * 6.28, lean, S0, S1, 0.012); st.translate(x0, 0, z0); parts.push(st);
    // feathery leaves: a few short thin blades
    for (let j = 0; j < 2; j++) { const lf = FLORA.blade(R, 0.18 + R() * 0.1, R() * 6.28, 1.2, S0, S1, 0.02); lf.translate(x0, h * (0.25 + j * 0.25), z0); parts.push(lf); }
    const tp = st.attributes.position, ti = tp.count - 1; FLORA.flower((tp.getX(ti) + tp.getX(ti - 1)) / 2, tp.getY(ti), (tp.getZ(ti) + tp.getZ(ti - 1)) / 2, 0.075 + R() * 0.025, 8, cols[Math.floor(R() * cols.length)], [R() - 0.5, R() - 0.5], R, parts);
  }
  return mergeGeometries(parts.map(g => g.index ? g.toNonIndexed() : g));
};
FLORA.geoHigan = function (seed) {
  const R = mulberry(seed), parts = [], S0 = new THREE.Color('#3f6a2a'), S1 = new THREE.Color('#5e8a3a'), RED = new THREE.Color('#d2241c'), RED2 = new THREE.Color('#ee3a26');
  for (let k = 0; k < 9; k++) { const a = R() * 6.28, d = Math.sqrt(R()) * 0.3, h = 0.42 + R() * 0.2, x0 = Math.sin(a) * d, z0 = Math.cos(a) * d;
    const st = FLORA.blade(R, h, R() * 6.28, 0.05, S0, S1, 0.012); st.translate(x0, 0, z0); parts.push(st);
    // the flower: 6 narrow petals curling back, long stamens sweeping up and out
    for (let j = 0; j < 6; j++) { const b = j / 6 * 6.283 + R() * 0.3, pts = [], sp = []; for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push([x0 + Math.cos(b) * t * 0.1, h + Math.sin(t * 3.0) * 0.035 - t * t * 0.012, z0 + Math.sin(b) * t * 0.1]); sp.push([x0 + Math.cos(b + 0.25) * t * 0.15, h + t * 0.1 - t * t * 0.03, z0 + Math.sin(b + 0.25) * t * 0.15]); }
      parts.push(FLORA.strip(pts, 0.022, 0.008, RED, RED2)); parts.push(FLORA.strip(sp, 0.006, 0.003, RED2, RED)); }
  }
  return mergeGeometries(parts.map(g => g.index ? g.toNonIndexed() : g));
};
// ---------- placement ----------
FLORA.okAt = function (x, z, clear = 2.6) {
  if (!isFinite(x) || !isFinite(z) || Math.abs(x) > WORLD.size / 2 - 4 || Math.abs(z) > WORLD.size / 2 - 4) return false;
  const h = groundH(x, z); if (h < 0.9 || waterDepthAt(x, z) > 0.02 || roadDistAt(x, z) < clear) return false;
  const [i, j] = toIdx(x, z); if (G.prot[j * WORLD.n + i]) return false; if (groundN(x, z).y < 0.84) return false;
  for (const c of collidersNear(x, z)) if (!c.off && hitsCollider(c, x, z, 0.5)) return false;
  return true;
};
FLORA.place = function () {
  const R = mulberry(7319), out = [], add = (type, x, z) => { if (!FLORA.okAt(x, z)) return; if (out.some(o => Math.abs(o.x - x) < 0.9 && Math.abs(o.z - z) < 0.9)) return; out.push({ type, x, z, y: groundH(x, z), r: R() * 6.283, s: 0.85 + R() * 0.3, v: Math.floor(R() * 2) }); };
  const P = (typeof CTRY !== 'undefined' && CTRY.paddies) || [];
  const nearPaddy = (x, z) => P.some(p => Math.hypot(p.x - x, p.z - z) < 70);
  // paddy ridges (あぜ): 彼岸花 in rows, some コスモス
  for (const p of P) { const c = Math.cos(p.rot), s = Math.sin(p.rot);
    const edge = (a, b) => [p.x + a * c + b * s, p.z - a * s + b * c];
    for (const side of [-1, 1]) {
      for (let a = -p.W / 2; a <= p.W / 2; a += 0.9) { const [x, z] = edge(a, side * (p.L / 2 + 0.75)); const q = R(); if (q < 0.42) add('higan', x, z); else if (q < 0.56) add('cosmos', x, z); }
      for (let b = -p.L / 2; b <= p.L / 2; b += 0.9) { const [x, z] = edge(side * (p.W / 2 + 0.75), b); const q = R(); if (q < 0.42) add('higan', x, z); else if (q < 0.5) add('cosmos', x, z); }
    }
  }
  // roadsides
  for (const r of ROADS) { if (r.bridge && r.bridge.every(Boolean)) continue; const pts = r.pts, w = r.w || 4.2;
    let acc = 0; for (let k = 1; k < pts.length; k++) { const a = pts[k - 1], b = pts[k], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!L) continue; acc += L; if (acc < 2.4) continue; acc = 0;
      const nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L, vd = Math.hypot(b[0] - VILLAGE.x, b[1] - VILLAGE.z), rural = vd > VILLAGE.r * 0.75, edgeV = vd > VILLAGE.r * 0.35 && vd < VILLAGE.r * 2.0, np = nearPaddy(b[0], b[1]);
      for (const sd of [-1, 1]) { const off = w / 2 + 1.4 + R() * 1.4, x = b[0] + nx * off * sd, z = b[1] + nz * off * sd, q = R();
        if (rural && q < 0.16) add('susuki', x, z); else if (edgeV && q < 0.34) { for (let j = 0; j < 5; j++) add('cosmos', x + (R() - 0.5) * 2.6, z + (R() - 0.5) * 2.6); } else if (np && q < 0.34) add('higan', x, z); }
    }
  }
  // ススキの原: a few patches of open hillside
  for (let k = 0, made = 0; k < 400 && made < 7; k++) { const x = (R() - 0.5) * WORLD.size * 0.8, z = (R() - 0.5) * WORLD.size * 0.8, h = groundH(x, z);
    if (h < 5 || h > 40 || Math.hypot(x - VILLAGE.x, z - VILLAGE.z) < VILLAGE.r * 1.1 || !FLORA.okAt(x, z, 6)) continue; made++;
    for (let j = 0; j < 26; j++) { const a = R() * 6.283, d = Math.sqrt(R()) * 11; add('susuki', x + Math.cos(a) * d, z + Math.sin(a) * d); } }
  return out;
};
// ---------- build / refresh ----------
FLORA.build = function () {
  if (FLORA.built) return; FLORA.built = true;
  const g = FLORA.group = new THREE.Group(); g.name = 'flora'; scene.add(g);
  const mat = (amt) => windify(new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85 }), amt);
  FLORA.mats = { leaf: mat(0.05), plume: mat(0.07), cosmos: mat(0.08), higan: mat(0.04) };
  FLORA.mats.plume.emissive = new THREE.Color('#2a2418');
  FLORA.items = FLORA.place();
  const by = { susuki: [[], []], cosmos: [[], []], higan: [[], []] }; for (const it of FLORA.items) by[it.type][it.v].push(it);
  const mk = (geo, m, list) => { const im = new THREE.InstancedMesh(geo, m, Math.max(1, list.length)); im.receiveShadow = true; im.castShadow = false; im.frustumCulled = false; im.userData.list = list; g.add(im); return im; };
  for (const v of [0, 1]) { const S = FLORA.geoSusuki(101 + v); FLORA.sets['susuki' + v] = [mk(S.leaf, FLORA.mats.leaf, by.susuki[v]), mk(S.plume, FLORA.mats.plume, by.susuki[v])];
    FLORA.sets['cosmos' + v] = [mk(FLORA.geoCosmos(201 + v), FLORA.mats.cosmos, by.cosmos[v])]; FLORA.sets['higan' + v] = [mk(FLORA.geoHigan(301 + v), FLORA.mats.higan, by.higan[v])]; }
  FLORA.refresh(true);
};
FLORA.refresh = function () {
  if (!FLORA.built) return; const W = FLORA.when(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  FLORA.key = W.key; let shown = 0;
  // the season's colours: green leaves in summer, golden in late autumn
  const dry = W.dry; FLORA.mats.leaf.color.set(dry ? '#c9b27a' : '#ffffff'); FLORA.mats.plume.color.set(dry ? '#c7bba0' : '#ffffff');
  for (const k in FLORA.sets) for (const [idx, im] of FLORA.sets[k].entries()) {
    const list = im.userData.list, type = k.replace(/\d$/, ''), on = type === 'susuki' ? (idx === 0 ? W.susuki : W.plume) : W[type];
    let n = 0;
    for (const it of list) {
      const ok = on && roadDistAt(it.x, it.z) >= 2.2 && waterDepthAt(it.x, it.z) <= 0.05 && Math.abs(groundH(it.x, it.z) - it.y) < 0.35;
      if (!ok) continue; e.set(0, it.r, 0); q.setFromEuler(e); v.set(it.x, groundH(it.x, it.z) - 0.03, it.z); sc.setScalar(it.s * (type === 'susuki' ? 1.15 : 1)); m4.compose(v, q, sc); im.setMatrixAt(n++, m4);
    }
    im.count = n; im.instanceMatrix.needsUpdate = true; im.visible = n > 0; shown += n;
  }
  FLORA.shown = shown;
};
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { FLORA.build(); FLORA.refresh(); } catch (e) { console.warn('flora', e); } return r; }; }
{ const _s = scheduleSave; scheduleSave = function () { FLORA.dirty = true; FLORA.chkT = 1.5; return _s.apply(this, arguments); }; }
{ const _u = updateStructures; updateStructures = function (t, night) { const r = _u.apply(this, arguments);
  const now = performance.now(); if (FLORA.built && now - (FLORA._t || 0) > 2000) { FLORA._t = now; if (FLORA.dirty && !EDIT.on) { FLORA.dirty = false; FLORA.refresh(); } else if (FLORA.when().key !== FLORA.key) FLORA.refresh(); }
  return r; }; }
