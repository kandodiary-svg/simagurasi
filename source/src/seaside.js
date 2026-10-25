// ===================== 瀬戸内の海辺: 牡蠣いかだ と 消波ブロック =====================
// 牡蠣いかだ: bamboo rafts on black and white floats, moored in groups off a quiet shore; they rise and fall with the tide.
// 消波ブロック: tetrapods piled at the waterline where a coast road runs right above the sea (not on the swimming beaches).
const SEASIDE = { built: false, rafts: [], grp: null, t: 0 };
SEASIDE.tetraGeo = function () {
  const parts = [], dirs = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  for (const d of dirs) { const v = new THREE.Vector3(...d).normalize(), g = new THREE.CylinderGeometry(0.2, 0.4, 1.05, 8); g.translate(0, 0.52, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v)); parts.push(g.toNonIndexed()); }
  const c = new THREE.IcosahedronGeometry(0.42, 0); parts.push(c.toNonIndexed());
  for (const p of parts) { if (p.attributes.uv) p.deleteAttribute('uv'); }
  const g = mergeGeometries(parts); g.computeVertexNormals(); return g;
};
SEASIDE.raftGeo = function () {
  const bam = [], flo = [], L = 16, W = 8;
  for (let i = 0; i < 6; i++) { const g = new THREE.CylinderGeometry(0.06, 0.06, L, 6); g.rotateX(Math.PI / 2); g.translate(-W / 2 + i * W / 5, 0.32, 0); bam.push(g.toNonIndexed()); }
  for (let j = 0; j < 9; j++) { const g = new THREE.CylinderGeometry(0.055, 0.055, W + 0.6, 6); g.rotateZ(Math.PI / 2); g.translate(0, 0.42, -L / 2 + j * L / 8); bam.push(g.toNonIndexed()); }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const g = new THREE.CylinderGeometry(0.36, 0.36, 1.1, 10); g.rotateZ(Math.PI / 2); g.translate(-W / 2 + 0.6 + i * (W - 1.2) / 2, 0.05, -L / 2 + 1.5 + j * (L - 3) / 2); flo.push(g.toNonIndexed()); }
  for (const a of [...bam, ...flo]) if (a.attributes.uv) a.deleteAttribute('uv');
  return { bam: mergeGeometries(bam), flo: mergeGeometries(flo) };
};
SEASIDE.okSea = (x, z, d0, d1) => { const h = groundH(x, z); return h < -d0 && h > -d1; };
SEASIDE.place = function () {
  const R = mulberry(5150), H = PLACED.harbor, B = GAME.LM && GAME.LM.beach, I = GAME.LM && GAME.LM.islet, far = (x, z) => (!H || Math.hypot(x - H.x, z - H.z) > 70) && (!I || Math.hypot(x - I.x, z - I.z) > 60);
  const half = WORLD.size / 2 - 20, rafts = [], tetras = [];
  // rafts: a calm shelf 4–14 m deep, 30–110 m off the shore, in two groups
  for (let g = 0, tries = 0; g < 2 && tries < 4000; tries++) {
    const x = (R() - 0.5) * 2 * half, z = (R() - 0.5) * 2 * half; if (!SEASIDE.okSea(x, z, 4, 14) || !far(x, z)) continue;
    let shore = 1e9; for (let a = 0; a < 6.28; a += 0.4) for (let r = 10; r < 120; r += 10) if (groundH(x + Math.cos(a) * r, z + Math.sin(a) * r) > 0.2) { shore = Math.min(shore, r); break; }
    if (shore < 30 || shore > 110 || rafts.some(q => Math.hypot(q.x - x, q.z - z) < 140)) continue;
    const rot = R() * 3.14; let n = 0;
    for (let k = 0; k < 3; k++) { const ox = x + Math.cos(rot) * k * 11, oz = z - Math.sin(rot) * k * 11; if (SEASIDE.okSea(ox, oz, 3.5, 16) && far(ox, oz)) { rafts.push({ x: ox, z: oz, rot: rot + (R() - 0.5) * 0.12, ph: R() * 6 }); n++; } }
    if (n) g++;
  }
  // tetrapods: shore cells with a road just above and deep water just below
  const { n, size } = WORLD, cs = size / (n - 1), h0 = -size / 2, spots = [];
  for (let j = 4; j < n - 4; j += 3) for (let i = 4; i < n - 4; i += 3) {
    const x = h0 + i * cs, z = h0 + j * cs, h = groundH(x, z); if (h < 0.3 || h > 2.6) continue; const rd = roadDistAt(x, z); if (rd > 12 || rd < 3) continue;
    if (B && Math.hypot(x - B.x, z - B.z) < 60) continue; if (!far(x, z)) continue; if (typeof RS !== 'undefined' && RS.beach && RS.beach.line && RS.beach.line.some(c => Math.hypot(c.x - x, c.z - z) < 40)) continue;
    let sea = null; for (const d of [8, 12, 16]) { for (let a = 0; a < 6.28; a += 0.4) { if (groundH(x + Math.cos(a) * d, z + Math.sin(a) * d) < -0.9) { sea = [Math.cos(a), Math.sin(a)]; break; } } if (sea) break; } if (!sea) continue;
    // walk out to the waterline: the blocks sit where land meets sea
    let wx = x, wz = z; for (let k = 0; k < 40 && groundH(wx, wz) > 0.15; k++) { wx += sea[0] * 0.5; wz += sea[1] * 0.5; }
    if (groundH(wx, wz) > 0.4) continue;
    // not on sand: tetrapods armour rocky / concrete shores below a road, never a swimming beach
    { let sandy = 0; for (const [dx, dz] of [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3]]) { const [ii, jj] = toIdx(wx + dx, wz + dz), kk = jj * WORLD.n + ii; if (TERR.spl && TERR.spl[kk * 4 + 3] > 0.3) sandy++; } if (sandy >= 2) continue; }
    spots.push({ x: wx, z: wz, sea });
  }
  const used = [];
  for (let t = 0; t < spots.length * 2 && used.length < 7; t++) { const s = spots[Math.floor(R() * spots.length)]; if (!s || used.some(u => Math.hypot(u.x - s.x, u.z - s.z) < 45)) continue; used.push(s);
    const tx = -s.sea[1], tz = s.sea[0], cnt = 8 + Math.floor(R() * 5);
    for (let k = 0; k < cnt; k++) { const along = (k - cnt / 2) * 1.6 + (R() - 0.5) * 0.6, out = -0.5 + R() * 2.6, x = s.x + s.sea[0] * out + tx * along, z = s.z + s.sea[1] * out + tz * along, gh = groundH(x, z);
      if (gh > 0.8 || gh < -3) continue; tetras.push({ x, z, y: Math.max(gh, -1.6) + 0.35 + (k % 3 === 0 ? 0.7 : 0), r: [R() * 6.28, R() * 6.28, R() * 6.28], s: 0.9 + R() * 0.25 }); }
  }
  return { rafts, tetras };
};
SEASIDE.build = function () {
  if (SEASIDE.built || !GAME.LM) return; SEASIDE.built = true;
  const { rafts, tetras } = SEASIDE.place(), g = SEASIDE.grp = new THREE.Group(); g.name = 'seaside'; scene.add(g);
  if (tetras.length) {
    const im = new THREE.InstancedMesh(SEASIDE.tetraGeo(), new THREE.MeshStandardMaterial({ color: '#a8a59c', roughness: 1 }), tetras.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    tetras.forEach((t, i) => { q.setFromEuler(new THREE.Euler(...t.r)); m4.compose(new THREE.Vector3(t.x, t.y, t.z), q, new THREE.Vector3(t.s, t.s, t.s)); im.setMatrixAt(i, m4); const v = 0.82 + KOYO.h(i + 3) * 0.22; im.setColorAt(i, c.setRGB(v, v * 0.99, v * 0.95)); });
    im.castShadow = true; im.receiveShadow = true; g.add(im); SEASIDE.tetra = im;
  }
  if (rafts.length) {
    const G2 = SEASIDE.raftGeo(), bm = new THREE.MeshStandardMaterial({ color: '#c9b588', roughness: 0.85 }), fm = new THREE.MeshStandardMaterial({ color: '#2b2d30', roughness: 0.5 }), fw = new THREE.MeshStandardMaterial({ color: '#e8e6e0', roughness: 0.5 });
    for (const r of rafts) { const o = new THREE.Group(); o.add(new THREE.Mesh(G2.bam, bm)); const fl = new THREE.Mesh(G2.flo, KOYO.h(Math.round(r.x)) < 0.5 ? fm : fw); o.add(fl); o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); o.position.set(r.x, 0, r.z); o.rotation.y = r.rot; g.add(o); r.o = o; }
  }
  SEASIDE.rafts = rafts; SEASIDE.n = { rafts: rafts.length, tetras: tetras.length };
};
SEASIDE.update = function (dt) {
  if (!SEASIDE.grp) return; SEASIDE.t += dt; const tide = typeof SEA !== 'undefined' && SEA.h !== undefined ? SEA.h : 0, st = TIME.weather === 'storm' ? 3 : 1;
  for (const r of SEASIDE.rafts) { r.o.position.y = tide - 0.05 + Math.sin(SEASIDE.t * 0.9 + r.ph) * 0.05 * st; r.o.rotation.x = Math.sin(SEASIDE.t * 0.7 + r.ph) * 0.012 * st; r.o.rotation.z = Math.cos(SEASIDE.t * 0.6 + r.ph) * 0.012 * st; }
};
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); setTimeout(() => { try { SEASIDE.build(); } catch (e) { console.warn('seaside', e); } }, 0); return r; }; }
{ const _u = updateStructures; updateStructures = function (t, night) { const r = _u.apply(this, arguments); const now = performance.now(), dt = Math.min(0.1, (now - (SEASIDE._l || now)) / 1000); SEASIDE._l = now; SEASIDE.update(dt); return r; }; }
