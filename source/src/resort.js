// ===================== RESORT ISLAND: the final stage of development (リゾート島計画) =====================
// 1) 白い砂浜とサンゴの海  2) ヨットハーバー  3) ラグーンプールとヴィラ  4) リゾートタワー街  5) グランドオープン
const RESORT_DEV = [
  { id: 'r_beach', name: 'リゾート計画① 白い砂浜とサンゴの海', lv: 7, price: 300000, tour: 6, place: 'auto', icon: '🏝️', note: '浜を白い砂にして、海をエメラルドグリーンに。サンゴ礁・パラソルの列・ヤシ並木・ビーチバーをそろえます' },
  { id: 'r_marina', name: 'リゾート計画② ヨットハーバー', lv: 7, price: 400000, tour: 6, place: 'auto', need: 'r_beach', icon: '⛵', note: '浮き桟橋にヨットやクルーザーがずらり。沖にはヨットが行き交い、大きなメガヨットが停泊します' },
  { id: 'r_lagoon', name: 'リゾート計画③ ラグーンプールとヴィラ', lv: 7, price: 450000, tour: 8, place: 'player', w: 52, d: 40, need: 'r_marina', icon: '🌴', note: '島の形の大きなプール、ヤシの小島、スイムアップバー、カバナ、ヴィラ。場所をえらんで建てます' },
  { id: 'r_towers', name: 'リゾート計画④ リゾートタワー街', lv: 7, price: 1000000, tour: 12, res: 120, place: 'auto', need: 'r_lagoon', icon: '🏙️', note: '海ぞいに高層のリゾートホテルとコンドミニアムが立ちならびます。島民 +120人' },
  { id: 'r_final', name: 'リゾート計画⑤ グランドオープン', lv: 7, price: 200000, tour: 10, place: 'auto', need: 'r_towers', icon: '🎉', note: 'リゾート島として世界にお披露目！ 観光客でにぎわい、今夜は記念の花火が上がります' },
];
BIG_DEV.push(...RESORT_DEV);
const RS = { beach: null, tourists: null, boats: [], t: 0, lvl: 0 };
const rDone = id => devDone(id);
function resortCount() { return RESORT_DEV.filter(d => rDone(d.id)).length; }
// ---------- shared materials & small props ----------
function rsMats() {
  if (RS.M) return RS.M; const glow = c => hrGlow(stdM(c, 0.4, 0, { emissive: new THREE.Color(c), emissiveIntensity: 0.1 }));
  return RS.M = { white: stdM('#f8f6f0', 0.45), cream: stdM('#efe4cc', 0.7), deck: worldMat(TEX.wood, 0.5, '#c8925a', 0.7), teak: stdM('#a0703e', 0.6), stone: worldMat(TEX.concrete, 0.5, '#e8dcc4', 0.85), coping: stdM('#f4efe4', 0.6),
    pool: new THREE.MeshStandardMaterial({ color: '#36c8e0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.88 }), poolDeep: new THREE.MeshStandardMaterial({ color: '#1aa0c8', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.9 }),
    thatch: stdM('#b08a54', 0.95), terra: stdM('#c86a40', 0.75), navy: stdM('#1f3a6a', 0.5), hullW: stdM('#fbfbf8', 0.25, 0.05), glassD: stdM('#1c2a36', 0.15, 0.4), sail: stdM('#fbfaf4', 0.7, 0, { side: THREE.DoubleSide }), wood: stdM('#9a7048', 0.7),
    rock: worldMat(TEX.rock, 0.3, '#8a857a', 0.7), canvas: stdM('#f4f0e6', 0.8, 0, { side: THREE.DoubleSide }), lamp: glow('#ffe8b0'), chrome: stdM('#cfd6dc', 0.25, 0.8), red: stdM('#d8343a', 0.5), blue: stdM('#2a7ad8', 0.5) };
}
function lounger(g, x, y, z, ry, M) { const s = sub(g, x, y, z, ry); B(s, 0.62, 0.08, 1.8, M.white, 0, 0.32, 0); const bk = B(s, 0.62, 0.08, 0.7, M.white, 0, 0.55, -0.7); bk.rotation.x = -0.75; for (const sx of [-0.25, 0.25]) for (const sz of [-0.7, 0.7]) B(s, 0.05, 0.3, 0.05, M.chrome, sx, 0.15, sz); B(s, 0.6, 0.04, 1.4, [M.blue, M.white, RS.M.red][Math.floor(Math.abs(x * 7 + z * 3)) % 3], 0, 0.38, 0.15); return s; }
function cabana(g, x, y, z, ry, M, roofM) { const s = sub(g, x, y, z, ry); B(s, 3.2, 0.25, 3.2, M.deck, 0, 0.12, 0); for (const a of [-1.45, 1.45]) for (const b of [-1.45, 1.45]) CY(s, 0.08, 2.6, M.teak, a, 1.5, b, 8); const rf = new THREE.Mesh(roofGeometry(3.6, 3.6, 1.4, true), roofM || M.thatch); rf.position.y = 2.8; rf.castShadow = true; s.add(rf); B(s, 2.2, 0.35, 1.9, M.white, 0, 0.42, 0.2); for (const sx of [-1, 1]) { const c = B(s, 0.04, 2.3, 0.9, M.canvas, sx * 1.5, 1.55, -1.0); c.rotation.y = sx * 0.2; } return s; }
function beachBar(g, x, y, z, ry, M) { const s = sub(g, x, y, z, ry); const ctr = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 1.1, 20, 1, true, 0, Math.PI * 1.4), M.teak); ctr.material.side = THREE.DoubleSide; ctr.position.y = 0.55; s.add(ctr); CY(s, 2.3, 0.08, M.deck, 0, 1.12, 0, 20); CY(s, 0.18, 3.2, M.teak, 0, 1.6, 0, 8); const rf = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 14), M.thatch); rf.position.y = 3.6; rf.castShadow = true; s.add(rf); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; CY(s, 0.25, 0.08, M.white, Math.cos(a) * 3.0, 0.75, Math.sin(a) * 3.0, 10); CY(s, 0.04, 0.75, M.chrome, Math.cos(a) * 3.0, 0.37, Math.sin(a) * 3.0, 6); } for (let k = 0; k < 8; k++) SP(s, 0.08, [M.red, M.blue, RS.M.lamp][k % 3], Math.cos(k) * 1.6, 1.25, Math.sin(k) * 1.6, 1.3, 6); return s; }
// a yacht with its bow toward +z. kind: 'sail' | 'motor' | 'mega'
function makeYacht(kind, L, R, furled) {
  const M = rsMats(), g = new THREE.Group(), W = L * (kind === 'mega' ? 0.19 : 0.3), H = L * 0.09;
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, -L / 2); sh.lineTo(W / 2, -L / 2); sh.quadraticCurveTo(W * 0.55, L * 0.15, 0, L / 2); sh.quadraticCurveTo(-W * 0.55, L * 0.15, -W / 2, -L / 2);
  const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false }), M.hullW); hull.rotation.x = -Math.PI / 2; hull.position.y = -H * 0.35; g.add(hull);
  const st = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: H * 0.16, bevelEnabled: false }), R() < 0.5 ? M.navy : M.glassD); st.rotation.x = -Math.PI / 2; st.scale.set(1.01, 1.01, 1); st.position.y = H * 0.2; g.add(st);
  const deckG = new THREE.Mesh(new THREE.ShapeGeometry(sh), M.deck); deckG.rotation.x = -Math.PI / 2; deckG.scale.set(0.94, 0.94, 1); deckG.position.y = H * 0.66; g.add(deckG);
  if (kind === 'sail') { B(g, W * 0.5, H * 0.7, L * 0.3, M.hullW, 0, H * 0.95, -L * 0.08); B(g, W * 0.52, H * 0.18, L * 0.24, M.glassD, 0, H * 1.0, -L * 0.06); const mh = L * 1.25; CY(g, 0.06 * L / 10, mh, M.chrome, 0, mh / 2 + H * 0.6, L * 0.08, 6);
    if (furled) { const bm = CY(g, 0.09 * L / 10, L * 0.42, M.navy, 0, H * 0.6 + mh * 0.12, L * -0.12, 6); bm.rotation.x = Math.PI / 2; } else {
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute([0, H * 0.9, L * 0.08, 0, mh * 0.96 + H * 0.6, L * 0.08, 0, H * 0.95, -L * 0.42, 0, H * 0.9, L * 0.12, 0, mh * 0.8, L * 0.1, 0, H * 0.7, L * 0.48], 3)); sg.computeVertexNormals(); const sl = new THREE.Mesh(sg, M.sail); g.add(sl); g.userData.sail = sl; } }
  else { const lv = kind === 'mega' ? 3 : 2; for (let k = 0; k < lv; k++) { const lw = W * (0.78 - k * 0.14), ll = L * (0.55 - k * 0.12), y = H * 0.7 + k * H * 0.9; B(g, lw, H * 0.9, ll, M.hullW, 0, y + H * 0.45, -L * 0.05 - k * L * 0.02); B(g, lw * 1.01, H * 0.32, ll * 0.96, M.glassD, 0, y + H * 0.55, -L * 0.04 - k * L * 0.02); }
    if (kind === 'mega') { CY(g, W * 0.06, H * 1.4, M.white, 0, H * 4.2, -L * 0.12, 8); SP(g, W * 0.12, M.white, 0, H * 5.0, -L * 0.12, 1, 10); } }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
// ---------- the main beach line ----------
// The resort beach: a contiguous stretch of solid shore near the sunset beach, widened seaward (人工ビーチ造成)
function resortBeachLine() {
  const B0 = GAME.LM.beach, Hb = GAME.LM.harbor; if (!B0) return [];
  const solid = c => { for (const d of [3, 6, 10]) { const x = c.x - c.nx * d, z = c.z - c.nz * d; if (groundH(x, z) < 0.7 || !isNaN(waterLevelAt(G, x, z))) return false; } return true; };
  const ok = c => solid(c) && (!Hb || Math.hypot(c.x - Hb.x, c.z - Hb.z) > 80) && !onPierAt(c.x + c.nx * 8, c.z + c.nz * 8) && Math.hypot(c.x - B0.x, c.z - B0.z) < 190;
  const start = coastPoints(B0.x, B0.z, 0, 120).filter(ok).sort((a, b) => Math.hypot(a.x - B0.x, a.z - B0.z) - Math.hypot(b.x - B0.x, b.z - B0.z))[0]; if (!start) return [];
  const down = (x, z) => { const e = 3, gx = groundH(x + e, z) - groundH(x - e, z), gz = groundH(x, z + e) - groundH(x, z - e), l = Math.hypot(gx, gz) || 1; return [-gx / l, -gz / l]; };
  const trace = dir => { const out = []; let cx = start.x, cz = start.z, nx = start.nx, nz = start.nz, run = 0;
    for (let k = 0; k < 40 && run < 110; k++) { const tx = -nz * dir, tz = nx * dir, gx = cx + tx * 6, gz = cz + tz * 6; let hit = null;
      for (let sd = -14; sd <= 14; sd += 0.5) { const x = gx + nx * sd, z = gz + nz * sd; if (groundH(x, z) < 0.6) { hit = [x - nx * 0.5, z - nz * 0.5]; break; } }
      if (!hit) break; const [dx, dz] = down(hit[0], hit[1]); let mx = nx * 0.6 + dx * 0.4, mz = nz * 0.6 + dz * 0.4; const ml = Math.hypot(mx, mz) || 1; mx /= ml; mz /= ml;
      const c = { x: hit[0], z: hit[1], nx: mx, nz: mz }; if (!ok(c)) break; const step = Math.hypot(c.x - cx, c.z - cz); if (step < 2) break; run += step; out.push(c); cx = c.x; cz = c.z; nx = mx; nz = mz; }
    return out; };
  let best = [...trace(-1).reverse(), start, ...trace(1)];
  // smooth the positions, resample every 6m and take normals from the tangent (oriented seaward)
  let P = best.map(p => ({ x: p.x, z: p.z })); for (let it = 0; it < 4; it++) P = P.map((p, i) => i === 0 || i === P.length - 1 ? p : { x: (P[i - 1].x + p.x * 2 + P[i + 1].x) / 4, z: (P[i - 1].z + p.z * 2 + P[i + 1].z) / 4 });
  const sx = best.reduce((s, p) => s + p.nx, 0), sz = best.reduce((s, p) => s + p.nz, 0); const res = [P[0]]; let carry = 0;
  for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], L = Math.hypot(b.x - a.x, b.z - a.z); let t = 6 - carry; while (t <= L) { res.push({ x: a.x + (b.x - a.x) * t / L, z: a.z + (b.z - a.z) * t / L }); t += 6; } carry = L - (t - 6); }
  res.forEach((p, i) => { const a = res[Math.max(0, i - 1)], b = res[Math.min(res.length - 1, i + 1)], L = Math.hypot(b.x - a.x, b.z - a.z) || 1; let nx = -(b.z - a.z) / L, nz = (b.x - a.x) / L; if (nx * sx + nz * sz < 0) { nx = -nx; nz = -nz; } p.nx = nx; p.nz = nz; });
  best = res; if (best.length < 6) return [];
  return best.map(p => [+p.x.toFixed(2), +p.z.toFixed(2), +p.nx.toFixed(3), +p.nz.toFixed(3)]);
}
const lineObj = arr => (arr || []).map(([x, z, nx, nz]) => ({ x, z, nx, nz }));
// beach profile, s = metres seaward from the old shoreline: dry sand to ~20m, then a gentle shallow shelf
const beachProfile = s => s < 24 ? 1.45 - 0.072 * s : -0.28 - 0.17 * (s - 24);
RS.nourish = function (line) {
  if (line.length < 2) return; const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, H = G.H, H0 = G.H0, W = G.Wl;
  let bx0 = 1e9, bx1 = -1e9, bz0 = 1e9, bz1 = -1e9; for (const c of line) { bx0 = Math.min(bx0, c.x - 50); bx1 = Math.max(bx1, c.x + 50); bz0 = Math.min(bz0, c.z - 50); bz1 = Math.max(bz1, c.z + 50); }
  let total = 0; const segs = []; for (let i = 1; i < line.length; i++) { const a = line[i - 1], b = line[i], L = Math.hypot(b.x - a.x, b.z - a.z); if (L < 0.5) continue; const tx = (b.x - a.x) / L, tz = (b.z - a.z) / L; let nx = -tz, nz = tx; if (nx * (a.nx + b.nx) + nz * (a.nz + b.nz) < 0) { nx = -nx; nz = -nz; } segs.push({ a, L, tx, tz, nx, nz, s0: total }); total += L; }
  let i0 = 1e9, i1 = -1, j0 = 1e9, j1 = -1;
  for (let j = Math.max(0, Math.floor((bz0 - h0) / cell)); j <= Math.min(n - 1, Math.ceil((bz1 - h0) / cell)); j++) for (let i = Math.max(0, Math.floor((bx0 - h0) / cell)); i <= Math.min(n - 1, Math.ceil((bx1 - h0) / cell)); i++) {
    const k = j * n + i; if (!isNaN(W[k]) && W[k] > 0.15) continue; const x = h0 + i * cell, z = h0 + j * cell; let tgt = -1e9;
    for (const g of segs) { const dx = x - g.a.x, dz = z - g.a.z, u = dx * g.tx + dz * g.tz; if (u < -5 || u > g.L + 5) continue; const s = dx * g.nx + dz * g.nz; if (s < -4 || s > 48) continue; const along = g.s0 + Math.max(0, Math.min(g.L, u)), taper = Math.min(1, along / 18, (total - along) / 18); const t = beachProfile(Math.max(0, s)) - (1 - Math.max(0, taper)) * 3.2 + (fbm(x * 0.06, z * 0.06, 3, 2) - 0.5) * 0.18; if (t > tgt) tgt = t; }
    if (tgt > H[k] + 0.01) { H[k] = tgt; if (tgt > H0[k]) H0[k] = tgt; if (!isNaN(W[k]) && tgt > W[k]) W[k] = NaN; i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j); }
  }
  if (i1 >= i0) { refreshRegion(i0 - 1, j0 - 1, i1 + 1, j1 + 1); return true; } return false;
};
function freeSpot(x, z, r, opt = {}) { const h = groundH(x, z); if (h < (opt.minH ?? 0.25) || h > (opt.maxH ?? 3.4) || waterDepthAt(x, z) > 0 || !isNaN(waterLevelAt(G, x, z))) return false; if (roadDistAt(x, z) < (opt.road ?? 4.2)) return false; const [i, j] = toIdx(x, z); if (G.prot[j * WORLD.n + i] && !opt.prot) return false; return !collidersNear(x, z).some(c => !c.off && (c.kind === 'bld' || c.kind === 'pole' || c.kind === 'farm') && hitsCollider(c, x, z, r)); }
DEV_LOC.r_beach = function () { const line = resortBeachLine(); if (line.length < 6) return null; const m = line[Math.floor(line.length / 2)]; return { x: m[0] + m[2] * 10, z: m[1] + m[3] * 10, line }; }; DEV_LOC.r_final = function () { return {}; };
DEV_BUILD.r_beach = function (s) {
  const g = new THREE.Group(), M = rsMats(), R = mulberry(4401), line = lineObj(s.line); RS.beach = { line, loungers: [], bar: null }; if (line.length < 4) return g;
  RS.nourish(line);
  const cols = ['#2a7ad8', '#16a0b8', '#f2c230', '#e8574e', '#f8f6f0', '#1f9a6a'], at = (c, sw) => [c.x + c.nx * sw, c.z + c.nz * sw], N = line.length;
  const mid = Math.floor(N * 0.5), net = Math.floor(N * 0.3);
  line.forEach((c, i) => { const ry = Math.atan2(c.nx, c.nz); if (i < 2 || i > N - 3) return;
    for (const [row, sw] of [[0, 7], [1, 11], [2, 15]]) { if ((row === 2 && i % 2) || Math.abs(i - mid) < 2 || Math.abs(i - net) < 2) continue; const [x0, z0] = at(c, sw), x = x0 - c.nz * (row === 1 ? 3 : 0), z = z0 + c.nx * (row === 1 ? 3 : 0); if (!freeSpot(x, z, 1.4, { road: 3, minH: 0.35 })) continue; const y = groundH(x, z);
      const p = parasol(g, x, z, cols[(i + row) % cols.length]); p.position.y = y; p.rotation.y = ry;
      for (const sd of [0.7, -0.7]) { const lx = x + Math.cos(ry) * sd + Math.sin(ry) * 0.9, lz = z - Math.sin(ry) * sd + Math.cos(ry) * 0.9; RS.beach.loungers.push({ x: lx, z: lz, y: y + 0.38, ry }); } }
    if (i % 3 === 1) { const [x, z] = at(c, 2 + R() * 2); if (freeSpot(x, z, 1.0, { road: 2.6, maxH: 6 })) { const pm = simplePalm(g, x, z, 6 + R() * 3, R); pm.position.y = groundH(x, z); } }
    if (i % 9 === 4 && Math.abs(i - mid) > 3) { const [x, z] = at(c, 16); if (freeSpot(x, z, 1, { road: 3, minH: 0.1 })) { const s2 = sub(g, x, groundH(x, z) + 0.05, z, ry + Math.PI / 2); for (let k = 0; k < 3; k++) B(s2, 0.75, 0.12, 3.6, [M.red, M.blue, M.white][k], k * 0.95, 0, 0); } }
  });
  { const c = line[mid], [x, z] = at(c, 6); if (freeSpot(x, z, 3.6, { road: 3 })) { beachBar(g, x, groundH(x, z), z, 0, M); addCollider({ x, z, r: 2.4, kind: 'bld' }); RS.beach.bar = { x, z }; } }
  for (const f of [0.18, 0.82]) { const c = line[Math.floor(N * f)], [x, z] = at(c, 15); if (!freeSpot(x, z, 1.2, { road: 3, minH: 0.1 })) continue; const t = sub(g, x, groundH(x, z), z, Math.atan2(c.nx, c.nz) + Math.PI); for (const a of [-0.6, 0.6]) for (const b of [-0.6, 0.6]) ROD(t, 0.06, M.white, [a * 1.2, 0, b * 1.2], [a, 2.6, b], 6); B(t, 1.5, 0.1, 1.5, M.deck, 0, 2.6, 0); B(t, 1.5, 0.9, 0.06, M.red, 0, 3.05, 0.72); const rf = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.6, 4), M.red); rf.rotation.y = Math.PI / 4; rf.position.y = 3.9; t.add(rf); CY(t, 0.04, 1.1, M.chrome, 0.6, 3.6, 0.6, 5); }
  { const c = line[net], [x, z] = at(c, 10); if (freeSpot(x, z, 4, { road: 3 })) { const t = sub(g, x, groundH(x, z), z, Math.atan2(c.nx, c.nz) + Math.PI / 2); for (const sx of [-4, 4]) CY(t, 0.05, 2.5, M.white, sx, 1.25, 0, 6); B(t, 8, 0.9, 0.02, M.canvas, 0, 2.0, 0); SP(t, 0.12, M.white, 1.2, 0.12, 2, 1, 8); } }
  // buoy line marking the swimming area
  for (let i = 2; i < N - 2; i += 2) { const [x, z] = at(line[i], 40); if (groundH(x, z) > -0.6) continue; SP(g, 0.28, i % 4 ? M.white : M.red, x, 0.05, z, 1, 8); }
  return g;
};

// ---------- marina ----------
DEV_LOC.r_marina = function () {
  const B0 = GAME.LM.beach, Hb = GAME.LM.harbor; let best = null; const bl = lineObj(GAME.p.dev.r_beach && GAME.p.dev.r_beach.line);
  for (const c of coastPoints(B0.x, B0.z, 25, 330)) { if (bl.some(q => Math.hypot(q.x - c.x, q.z - c.z) < 70)) continue; if (Hb && Math.hypot(c.x - Hb.x, c.z - Hb.z) < 85) continue; if (Math.hypot(c.x - B0.x, c.z - B0.z) < 40) continue; if (PLACED.lighthouse && Math.hypot(c.x - PLACED.lighthouse.x, c.z - PLACED.lighthouse.z) < 60) continue;
    const sw = seaward(c.x, c.z); if (!sw) continue; const px = -sw[1], pz = sw[0]; let ok = true;
    for (let d = 5; d <= 54 && ok; d += 4) for (const o of [-14, -6, 0, 6, 14, 22]) { const x = c.x + sw[0] * d + px * o, z = c.z + sw[1] * d + pz * o; if (groundH(x, z) > -0.8 || onPierAt(x, z) || collidersNear(x, z).some(q => !q.off && hitsCollider(q, x, z, 3))) { ok = false; break; } }
    if (!ok) continue; const back = [c.x - sw[0] * 9, c.z - sw[1] * 9]; if (groundH(back[0], back[1]) < 0.6 || groundH(back[0], back[1]) > 8) continue; const sc = Math.hypot(c.x - B0.x, c.z - B0.z); if (!best || sc < best.sc) best = { sc, c, sw };
  }
  if (!best) return null; const { c, sw } = best; return { x: c.x, z: c.z, rot: Math.atan2(sw[0], sw[1]) };
};
DEV_BUILD.r_marina = function (s) {
  const g = new THREE.Group(), M = rsMats(), R = mulberry(8123), o = { x: s.x, z: s.z, rot: s.rot }, y = 1.0, W = (lx, lz) => toWorld(o, lx, lz);
  const deckAt = (lx, lz, w, l) => { const [x, z] = W(lx, lz); const b = B(g, w, 0.18, l, M.deck, x, y, z, s.rot); b.castShadow = false; WALKDECKS.push({ x, z, rot: s.rot, hw: w / 2, hd: l / 2, y: y + 0.1 }); return b; };
  deckAt(0, 24, 3.0, 50); for (const zz of [12, 22, 32, 42]) for (const sd of [-1, 1]) deckAt(sd * 7.5, zz, 12, 1.4);
  for (let lz = 2; lz <= 48; lz += 6) for (const sd of [-1.5, 1.5]) { const [x, z] = W(sd, lz); CY(g, 0.14, 2.6, M.wood, x, y - 0.9, z, 8); }
  for (let lz = 6; lz <= 48; lz += 10) { const [x, z] = W(1.4, lz); CY(g, 0.05, 2.4, M.chrome, x, y + 1.2, z, 6); SP(g, 0.16, M.lamp, x, y + 2.45, z, 1, 8); }
  // moored yachts in the slips
  RS.moored = []; let k = 0; for (const zz of [17, 27, 37]) for (const sd of [-1, 1]) for (const lx of [4.2, 10]) { if (R() < 0.15) continue; const kind = R() < 0.45 ? 'sail' : 'motor', L = 9 + R() * 5, yt = makeYacht(kind, L, R, true); const [x, z] = W(sd * lx, zz); yt.position.set(x, 0.15, z); yt.rotation.y = s.rot + (sd > 0 ? Math.PI / 2 : -Math.PI / 2) + (R() - 0.5) * 0.06; g.add(yt); RS.moored.push(yt); k++; }
  // breakwater
  const rg = new THREE.DodecahedronGeometry(1, 0); for (let i = 0; i < 26; i++) { const t = i / 25, lx = 19, lz = 6 + t * 46; const [x, z] = W(lx + (R() - 0.5) * 2, lz); const m = new THREE.Mesh(rg, M.rock); m.position.set(x, -0.3 + R() * 0.6, z); m.scale.set(1.6 + R(), 1.2 + R() * 0.8, 1.6 + R()); m.rotation.set(R(), R() * 6, R()); m.castShadow = true; g.add(m); }
  for (let i = 0; i < 12; i++) { const lx = 19 - i * 1.9, lz = 53; const [x, z] = W(lx, lz + (R() - 0.5) * 2); const m = new THREE.Mesh(rg, M.rock); m.position.set(x, -0.3 + R() * 0.6, z); m.scale.set(1.6 + R(), 1.2 + R() * 0.8, 1.6 + R()); m.rotation.set(R(), R() * 6, R()); g.add(m); }
  // clubhouse on shore
  { const [x, z] = W(0, -10); const gy = groundH(x, z); const c = sub(g, x, gy, z, s.rot); B(c, 13, 0.4, 8, AM.block, 0, -0.2, 0); B(c, 12, 3.2, 7, M.white, 0, 1.6, 0); B(c, 12.04, 2.2, 0.06, AM.win[2], 0, 1.5, 3.53); B(c, 13.5, 0.3, 9, M.white, 0, 3.35, 0.4); B(c, 12, 0.5, 0.2, M.navy, 0, 3.0, 4.6);
    const sg = hrSign('HOSHINAMI MARINA', 6, 0.7, '#1f3a6a', '#ffffff'); sg.position.set(0, 4.0, 3.6); c.add(sg); CY(c, 0.06, 8, M.white, 7.5, 4, 3, 6); for (const [yy, mm] of [[7.5, M.red], [6.8, M.blue]]) B(c, 0.02, 0.5, 1.0, mm, 7.5, yy, 3.5);
    const [ax, az] = W(0, -10); addCollider({ x: ax, z: az, hw: 6.5, hd: 4, rot: s.rot, kind: 'bld' }); }
  RS.marina = { o, g }; return g;
};
// ---------- lagoon pools & villas ----------
function blob(cx, cz, rx, rz, seed, n = 40) { const R = mulberry(seed), p1 = R() * 6, p2 = R() * 6, pts = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283, k = 1 + 0.13 * Math.sin(3 * a + p1) + 0.08 * Math.sin(5 * a + p2); pts.push(new THREE.Vector2(cx + Math.cos(a) * rx * k, cz + Math.sin(a) * rz * k)); } return pts; }
function flatShape(pts, holes, mat, y) { const sh = new THREE.Shape(pts); for (const h of holes || []) sh.holes.push(new THREE.Path(h)); const ge = new THREE.ShapeGeometry(sh, 2); ge.rotateX(-Math.PI / 2); const m = new THREE.Mesh(ge, mat); m.position.y = y; m.receiveShadow = true; return m; }
DEV_BUILD.r_lagoon = function (s) {
  const g = new THREE.Group(), M = rsMats(), R = mulberry(5511), gy = s.y !== undefined ? s.y : groundH(s.x, s.z); RS.lagoon = { loungers: [], water: [] };
  // ShapeGeometry lies in the x/y plane; rotateX(-90°) maps y → -z, so feed shapes with (x, -z)
  const flip = pts => pts.map(p => new THREE.Vector2(p.x, -p.y));
  const deck = blob(0, 0, 19, 13.5, 11), pools = [blob(-5, 1, 9.5, 6.3, 21), blob(7.5, -1.5, 6.5, 5.0, 31)], isl = [blob(-6, 1.5, 2.3, 1.9, 41, 18), blob(8.2, -2, 1.6, 1.4, 51, 16)];
  const sub0 = new THREE.Group(); g.add(sub0);
  sub0.add(flatShape(flip(deck), pools.map(flip), M.stone, 0.12));
  for (const p of pools) sub0.add(flatShape(flip(p), [], M.poolDeep, 0.0));
  for (const p of pools) { const c = p.reduce((a, v) => a.add(v), new THREE.Vector2()).multiplyScalar(1 / p.length); const outer = p.map(v => c.clone().add(v.clone().sub(c).multiplyScalar(1.05))); sub0.add(flatShape(flip(outer), [flip(p)], M.coping, 0.16)); }
  const water = []; pools.forEach((p, i) => { const w = flatShape(flip(p), [flip(isl[i])], M.pool, 0.1); g.add(w); water.push(w); });
  for (const q of isl) { sub0.add(flatShape(flip(q), [], M.cream, 0.18)); const c = q.reduce((a, v) => a.add(v), new THREE.Vector2()).multiplyScalar(1 / q.length); for (let k = 0; k < 2; k++) simplePalm(sub0, c.x + (k - 0.5) * 1.2, c.y + (R() - 0.5), 5 + R() * 2.5, R); }
  // swim-up bar at the edge of the big pool
  beachBar(g, -14.2, 0.1, 1.5, 0, M);
  // cabanas, loungers, villas
  const cab = [[-3, -10], [4, -10.5], [13, 6], [-11.5, 8.8], [2.5, 9.6]]; cab.forEach(([x, z], i) => cabana(g, x, 0.14, z, Math.atan2(-x, -z), M, i % 2 ? M.canvas : M.thatch));
  for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + 0.3, x = Math.cos(a) * 16, z = Math.sin(a) * 11.4; if (cab.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 3.5) || Math.hypot(x + 14.2, z - 1.5) < 4.5) continue; lounger(g, x, 0.12, z, Math.atan2(-x, -z), M); RS.lagoon.loungers.push({ lx: x, lz: z, ry: Math.atan2(-x, -z) }); }
  for (let k = 0; k < 4; k++) { const a = Math.PI + k / 3 * Math.PI * 0.9 + 0.15, x = Math.cos(a) * 23.5, z = Math.sin(a) * 17; const v = sub(g, x, 0, z, Math.atan2(-x, -z)); B(v, 6, 3, 5, M.stone, 0, -1.25, 0); B(v, 5.4, 2.8, 4.4, M.white, 0, 1.6, 0); B(v, 3.0, 2.0, 0.06, AM.win[1], 0, 1.4, 2.23); B(v, 5.8, 0.18, 1.4, M.deck, 0, 0.3, 2.9); const rf = new THREE.Mesh(roofGeometry(6.4, 5.4, 1.6, true), M.terra); rf.position.y = 3.0; rf.castShadow = true; v.add(rf); CY(v, 1.1, 0.5, M.pool, 1.6, 0.3, 3.9, 16); }
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + 0.6, x = Math.cos(a) * 20.2, z = Math.sin(a) * 14.6; simplePalm(g, x, z, 6 + R() * 3, R); }
  bldPlace(g, s); g.position.y = gy;
  cab.forEach(([x, z]) => coll(s, x, z, 1.7, 1.7)); coll(s, -14.2, 1.5, 2.3, 2.3); for (let k = 0; k < 4; k++) { const a = Math.PI + k / 3 * Math.PI * 0.9 + 0.15; coll(s, Math.cos(a) * 23.5, Math.sin(a) * 17, 2.9, 2.9); }
  RS.lagoon.s = s; RS.lagoon.water = water; return g;
};
// ---------- the tower district ----------
DEV_LOC.r_towers = function () {
  const B0 = GAME.LM.beach, spots = [], R = mulberry(77);
  const coast = coastPoints(B0.x, B0.z, 0, 330); const styles = ['curve', 'hotel', 'slab', 'curve', 'slab', 'curve', 'hotel', 'slab'];
  const ok = (x, z, hw) => { let mn = 1e9, mx = -1e9; for (let a = -hw; a <= hw; a += hw / 2) for (let b = -hw; b <= hw; b += hw / 2) { const px = x + a, pz = z + b, h = groundH(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h); if (!freeSpot(px, pz, 1.5, { minH: 1.2, maxH: 40, road: 6.5 })) return null; } if (mx - mn > 5) return null; return { mn, mx }; };
  const cand = []; for (const c of coast) { if (R() < 0.6) continue; for (const d of [26, 36, 48, 62]) { const x = c.x - c.nx * d, z = c.z - c.nz * d; cand.push({ x, z, c, d, sc: Math.hypot(x - B0.x, z - B0.z) * 0.8 + Math.abs(d - 36) * 2 }); } }
  cand.sort((a, b) => a.sc - b.sc);
  for (const q of cand) { if (spots.length >= 8) break; const st = styles[spots.length], hw = st === 'hotel' ? 17 : 11; if (spots.some(p => Math.hypot(p.x - q.x, p.z - q.z) < (p.hw + hw + 8))) continue; if (PLACED.home && Math.hypot(PLACED.home.hs.x - q.x, PLACED.home.hs.z - q.z) < 45) continue; if (RS.lagoon && RS.lagoon.s && Math.hypot(RS.lagoon.s.x - q.x, RS.lagoon.s.z - q.z) < 38) continue;
    const r = ok(q.x, q.z, hw); if (!r) continue; spots.push({ x: q.x, z: q.z, rot: Math.atan2(q.c.nx, q.c.nz), y0: r.mn, y1: r.mx, style: st, hw, floors: st === 'hotel' ? 9 + Math.floor(R() * 3) : st === 'curve' ? 18 + Math.floor(R() * 12) : 15 + Math.floor(R() * 10) }); }
  return spots.length ? { x: spots[0].x, z: spots[0].z, spots } : null;
};
function roundRect(w, d, r) { const s = new THREE.Shape(), x = -w / 2, y = -d / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function towerAt(g, sp, R) {
  const M = rsMats(), A = archMats(), t = new THREE.Group(); t.position.set(sp.x, 0, sp.z); t.rotation.y = sp.rot; g.add(t);
  const base = sp.y1 + 0.3, F = sp.floors, fh = 3.15, podH = 4.2; B(t, sp.hw * 2, base - sp.y0 + 1.5 + podH, sp.hw * 2 * (sp.style === 'hotel' ? 0.62 : 1), M.stone, 0, (sp.y0 - 1.5 + base + podH) / 2, 0);
  B(t, sp.hw * 2 + 0.05, podH - 1.2, 0.08, AM.win[2], 0, base + podH / 2 - 0.2, sp.hw * (sp.style === 'hotel' ? 0.62 : 1) + 0.01);
  const y0 = base + podH;
  if (sp.style === 'curve') { const W = 17, D = 12, glassM = facadeTex({ cols: 6, rows: F, wall: '#e8eef2', glass: ['#5a9ac0', '#a8d8ec'], frame: '#f4f6f8', seed: Math.floor(R() * 999), lit: 0.42 });
    const core = new THREE.Mesh(new THREE.BoxGeometry(W - 6, F * fh, D - 1), glassM); core.position.y = y0 + F * fh / 2; t.add(core); for (const sx of [-1, 1]) { const cy = new THREE.Mesh(new THREE.CylinderGeometry((D - 1) / 2, (D - 1) / 2, F * fh, 18, 1, false, sx > 0 ? 0 : Math.PI, Math.PI), glassM); cy.position.set(sx * (W - 6) / 2, y0 + F * fh / 2, 0); t.add(cy); }
    const slabS = roundRect(W + 3.2, D + 3.2, 6.6), slabG = new THREE.ExtrudeGeometry(slabS, { depth: 0.24, bevelEnabled: false, curveSegments: 6 }); slabG.rotateX(-Math.PI / 2);
    const railS = roundRect(W + 3.0, D + 3.0, 6.5); railS.holes.push(new THREE.Path(roundRect(W + 2.8, D + 2.8, 6.4).getPoints(8))); const railG = new THREE.ExtrudeGeometry(railS, { depth: 1.0, bevelEnabled: false, curveSegments: 6 }); railG.rotateX(-Math.PI / 2);
    const railM = RS.railM || (RS.railM = stdM('#bfe6f2', 0.08, 0.2, { transparent: true, opacity: 0.4 }));
    for (let f = 1; f <= F; f++) { const sl = new THREE.Mesh(slabG, M.white); sl.position.y = y0 + f * fh - 0.05; t.add(sl); if (f < F) { const rl = new THREE.Mesh(railG, railM); rl.position.y = y0 + f * fh + 0.19; t.add(rl); } }
    const top = y0 + F * fh; B(t, W - 4, 2.6, D - 3, M.white, 0, top + 1.3, 0); B(t, 5, 0.5, 4, M.pool, -3, top + 0.35, 0); }
  else if (sp.style === 'slab') { const W = 15, D = 13, glassM = facadeTex({ cols: 7, rows: F, wall: '#dfe6ea', glass: ['#3f7aa0', '#8ec2dc'], frame: '#e8eef2', seed: Math.floor(R() * 999), lit: 0.38, curtain: false });
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, F * fh, D), glassM); body.position.y = y0 + F * fh / 2; t.add(body);
    for (let k = 0; k <= 6; k++) for (const sz of [-1, 1]) B(t, 0.25, F * fh, 0.5, M.white, -W / 2 + k * W / 6, y0 + F * fh / 2, sz * (D / 2 + 0.2));
    for (let f = 2; f <= F; f += 2) B(t, W + 0.3, 0.2, D + 0.6, M.white, 0, y0 + f * fh, 0);
    const top = y0 + F * fh; B(t, W - 3, 3.5, D - 3, M.white, 0, top + 1.75, 0); const ring = hrGlow(stdM('#bfe8ff', 0.3, 0, { emissive: new THREE.Color('#7fd0ff'), emissiveIntensity: 0.1 })); B(t, W + 0.4, 0.4, D + 0.4, ring, 0, top + 0.2, 0); }
  else { const W = 30, D = 13, H = F * fh, wallM = stdM('#f6efe2', 0.7); B(t, W, H, D, wallM, 0, y0 + H / 2, 0);
    const fac = facadeTex({ cols: 10, rows: F, wall: '#f6efe2', glass: ['#4f8ab0', '#9fd0e8'], frame: '#ffffff', seed: Math.floor(R() * 999), lit: 0.5 }); for (const sz of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.6, H - 0.4), fac); p.position.set(0, y0 + H / 2, sz * (D / 2 + 0.02)); p.rotation.y = sz > 0 ? 0 : Math.PI; t.add(p); }
    for (let f = 1; f < F; f++) { const y = y0 + f * fh; for (const sz of [-1, 1]) { B(t, W + 0.2, 0.16, 1.3, M.white, 0, y, sz * (D / 2 + 0.65)); B(t, W + 0.2, 0.06, 0.08, A.railM || M.chrome, 0, y + 1.0, sz * (D / 2 + 1.28)); } }
    const top = y0 + H; for (const [x, w, rise] of [[-W / 3, W / 3 + 0.6, 2.4], [0, W / 3 + 0.6, 3.4], [W / 3, W / 3 + 0.6, 2.4]]) { const rf = new THREE.Mesh(roofGeometry(w + 1.2, D + 1.2, rise, true), M.terra); rf.position.set(x, top + (rise > 3 ? 1.2 : 0), 0); rf.castShadow = true; t.add(rf); if (rise > 3) B(t, w, 1.2, D, wallM, x, top + 0.6, 0); }
    for (let k = 0; k < 7; k++) { const x = -W / 2 + 2 + k * (W - 4) / 6; const a = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.18, 6, 12, Math.PI), M.white); a.position.set(x, base + 2.6, sp.hw * 0.62 + 0.15); t.add(a); } }
  const [cx, cz] = toWorld({ x: sp.x, z: sp.z, rot: sp.rot }, 0, 0); addCollider({ x: cx, z: cz, hw: sp.hw, hd: sp.hw * (sp.style === 'hotel' ? 0.62 : 1), rot: sp.rot, kind: 'bld' });
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + 0.5, x = Math.cos(a) * (sp.hw + 3), z = Math.sin(a) * (sp.hw + 3); const [wx, wz] = toWorld({ x: sp.x, z: sp.z, rot: sp.rot }, x, z); if (freeSpot(wx, wz, 0.8, { maxH: 40 })) { const pm = simplePalm(g, wx, wz, 6 + R() * 3, R); pm.position.y = groundH(wx, wz); } }
}
DEV_BUILD.r_towers = function (s) { const g = new THREE.Group(), R = mulberry(9911); for (const sp of s.spots || []) towerAt(g, sp, R); RS.towers = s.spots || []; return g; };
DEV_BUILD.r_final = function () { const g = new THREE.Group(), M = rsMats(), line = (RS.beach && RS.beach.line) || []; if (line.length > 4) { const c = line[Math.floor(line.length * 0.62)], x = c.x - c.nx * 26, z = c.z - c.nz * 26; if (freeSpot(x, z, 2, { maxH: 8 })) { const t = sub(g, x, groundH(x, z), z, Math.atan2(c.nx, c.nz)); for (const sx of [-2.2, 2.2]) CY(t, 0.12, 4.4, M.white, sx, 2.2, 0, 8); const sg = hrSign('WELCOME TO HOSHINAMI RESORT', 5.6, 0.9, '#16a0b8', '#ffffff'); sg.position.set(0, 4.0, 0.08); t.add(sg); const sg2 = sg.clone(); sg2.rotation.y = Math.PI; sg2.position.z = -0.08; t.add(sg2); } } return g; };
for (const k of ['r_beach', 'r_marina', 'r_lagoon', 'r_towers', 'r_final']) { const f = DEV_BUILD[k]; const w = function (s) { const g = f(s); return g ? mergeLocal(g) : g; }; DEV_BUILD[k] = w; }
// ---------- unlocking after the story ----------
{ const _sd = STORY.syncDev; STORY.syncDev = function () { _sd.apply(this, arguments); const st = STORY.st(), p = GAME.p; if (st.ch < 7) return; p.devSeen = p.devSeen || {}; const fresh = []; for (const d of RESORT_DEV) { if (!DEV.includes(d)) DEV.push(d); if (!p.devSeen[d.id]) { p.devSeen[d.id] = 1; fresh.push(d); } } if (fresh.length && p.storyDev) setTimeout(() => UI.toast('🏝️ 開発に「リゾート島計画」が追加されました（P）'), 3200); }; }
{ const _rk = STORY.rank; STORY.rank = function () { if (rDone('r_final')) return '世界があこがれるリゾート島'; const n = resortCount(); if (n >= 3) return '人気のリゾート島'; if (n >= 1) return 'リゾート開発中の島'; return _rk.apply(this, arguments); }; }
// ---------- living resort: colour change, tourists, boats ----------
const TOUR_COL = ['#e8574e', '#3f8fd8', '#f2c230', '#46a86a', '#f08fb0', '#ffffff', '#7a4ab8', '#ff8a2a', '#16a0b8', '#1f3a6a'], SKIN = ['#f2cfb0', '#e0b090', '#c8946a', '#a87050', '#f6dcc4'];
function makeTourists() {
  const N = 140, body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.62, 3, 8), new THREE.MeshStandardMaterial({ roughness: 0.7 }), N), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.6 }), N), hat = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12), new THREE.MeshStandardMaterial({ color: '#f0dca0', roughness: 0.8 }), N);
  for (const m of [body, head, hat]) { m.castShadow = true; m.frustumCulled = false; m.count = 0; scene.add(m); }
  const R = mulberry(31); for (let i = 0; i < N; i++) { body.setColorAt(i, new THREE.Color(TOUR_COL[Math.floor(R() * TOUR_COL.length)])); head.setColorAt(i, new THREE.Color(SKIN[Math.floor(R() * SKIN.length)])); }
  return RS.tourists = { body, head, hat, list: [], N };
}
RS.plan = function () {
  const T = RS.tourists || makeTourists(), R = mulberry(77), L = []; const line = (RS.beach && RS.beach.line) || []; const n = resortCount(); if (!line.length || !n) { T.list = []; return; }
  const scale = rDone('r_final') ? 1 : 0.35 + n * 0.12;
  (RS.beach.loungers || []).forEach((l, i) => { if (R() < 0.62 * scale) L.push({ m: 'lie', x: l.x, z: l.z, y: l.y, ry: l.ry, hat: R() < 0.4 }); });
  for (let k = 0; k < Math.round(34 * scale); k++) { const i = Math.floor(R() * line.length), c = line[i]; const sw = R() < 0.45; L.push(sw ? { m: 'swim', i, off: 23 + R() * 12, ph: R() * 6 } : { m: 'walk', i, d: -(15 + R() * 4), sp: (R() < 0.5 ? -1 : 1) * (0.25 + R() * 0.3), ph: R() * 6, hat: R() < 0.5 }); }
  if (RS.beach.bar) for (let k = 0; k < Math.round(8 * scale); k++) { const a = R() * 6.28; L.push({ m: 'stand', x: RS.beach.bar.x + Math.cos(a) * 3.3, z: RS.beach.bar.z + Math.sin(a) * 3.3, ry: a + Math.PI, ph: R() * 6 }); }
  if (rDone('r_lagoon') && RS.lagoon && RS.lagoon.s) { const s = RS.lagoon.s, gy = s.y !== undefined ? s.y : groundH(s.x, s.z); for (const l of RS.lagoon.loungers) if (R() < 0.7 * scale) { const [x, z] = toWorld(s, l.lx, l.lz); L.push({ m: 'lie', x, z, y: gy + 0.5, ry: (s.rot || 0) + l.ry, hat: R() < 0.4 }); }
    for (let k = 0; k < Math.round(14 * scale); k++) { const a = R() * 6.28, rx = -5 + Math.cos(a) * 6, rz = 1 + Math.sin(a) * 3.8; const [x, z] = toWorld(s, rx, rz); L.push({ m: 'pool', x, z, y: gy + 0.1, ph: R() * 6 }); } }
  T.list = L.slice(0, T.N);
};
RS.update = function (dt) {
  RS.t += dt; const t = RS.t, want = rDone('r_beach') ? 1 : 0; TERR.uResort.value += (want - TERR.uResort.value) * Math.min(1, dt * 0.6); if (Math.abs(TERR.uResort.value - want) < 0.002) TERR.uResort.value = want;
  const B0 = GAME.LM && GAME.LM.beach; if (B0) TERR.uResortC.value.set(B0.x, B0.z, 260);
  const sig = resortCount() + (RS.beach ? RS.beach.line.length : 0) * 0.001 + (RS.lagoon && RS.lagoon.s ? 0.5 : 0); if (sig !== RS._sig) { RS._sig = sig; RS.plan(); RS.boatsPlan(); }
  const T = RS.tourists; if (T) { const show = !GAME.inside && T.list.length && B0 && Math.hypot(PL.x - B0.x, PL.z - B0.z) < 520; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3(); let k = 0, kh = 0;
    if (show) { const line = RS.beach.line; for (const p of T.list) { let x, y, z, ry = 0, lie = false, sink = 0;
        if (p.m === 'lie') { x = p.x; z = p.z; y = p.y; ry = p.ry; lie = true; }
        else if (p.m === 'walk') { p.i = (p.i + p.sp * dt * 0.2 + line.length) % line.length; const i0 = Math.floor(p.i), i1 = (i0 + 1) % line.length, f = p.i - i0, a = line[i0], b = line[i1]; x = lerp(a.x, b.x, f) - lerp(a.nx, b.nx, f) * p.d; z = lerp(a.z, b.z, f) - lerp(a.nz, b.nz, f) * p.d; y = Math.max(0, groundH(x, z)) + Math.abs(Math.sin(t * 6 + p.ph)) * 0.04; ry = Math.atan2(b.x - a.x, b.z - a.z) + (p.sp < 0 ? Math.PI : 0); }
        else if (p.m === 'swim') { const c = line[p.i]; x = c.x + c.nx * p.off + Math.sin(t * 0.2 + p.ph) * 2; z = c.z + c.nz * p.off + Math.cos(t * 0.17 + p.ph) * 2; y = -0.62 + Math.sin(t * 1.5 + p.ph) * 0.05; ry = t * 0.1 + p.ph; }
        else if (p.m === 'pool') { x = p.x + Math.sin(t * 0.25 + p.ph) * 1.2; z = p.z + Math.cos(t * 0.21 + p.ph) * 1.2; y = p.y - 0.55 + Math.sin(t * 1.7 + p.ph) * 0.04; ry = p.ph; }
        else { x = p.x; z = p.z; y = groundH(x, z); ry = p.ry + Math.sin(t * 0.5 + p.ph) * 0.3; }
        if (lie) { q.setFromEuler(e.set(-(Math.PI / 2 - 0.25), ry, 0, 'YXZ')); m4.compose(v.set(x, y + 0.22, z), q, sc); T.body.setMatrixAt(k, m4); m4.compose(v.set(x - Math.sin(ry) * 0.62, y + 0.42, z - Math.cos(ry) * 0.62), q, sc); T.head.setMatrixAt(k, m4); }
        else { q.setFromEuler(e.set(0, ry, 0)); m4.compose(v.set(x, y + 0.5, z), q, sc); T.body.setMatrixAt(k, m4); m4.compose(v.set(x, y + 1.13, z), q, sc); T.head.setMatrixAt(k, m4); if (p.hat) { m4.compose(v.set(x, y + 1.26, z), q, sc); T.hat.setMatrixAt(kh++, m4); } }
        k++; } }
    for (const m of [T.body, T.head]) { m.count = k; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } T.hat.count = kh; T.hat.instanceMatrix.needsUpdate = true; }
  for (const b of RS.boats) { if (b.anchor) { b.g.position.y = 0.2 + Math.sin(t * 0.6 + b.ph) * 0.12; b.g.rotation.z = Math.sin(t * 0.5 + b.ph) * 0.02; continue; } b.a += b.sp * dt; const x = b.cx + Math.cos(b.a) * b.rx, z = b.cz + Math.sin(b.a) * b.rz; b.g.position.set(x, 0.15 + Math.sin(t * 1.2 + b.ph) * 0.08, z); b.g.rotation.y = Math.atan2(-Math.sin(b.a) * b.rx * Math.sign(b.sp), Math.cos(b.a) * b.rz * Math.sign(b.sp)); b.g.rotation.z = (b.kind === 'sail' ? 0.12 : 0.02) * Math.sign(b.sp); b.g.visible = !GAME.inside; }
  for (const y of RS.moored || []) y.position.y = 0.15 + Math.sin(t * 0.9 + y.position.x) * 0.05;
};
RS.boatsPlan = function () {
  for (const b of RS.boats) scene.remove(b.g); RS.boats = []; const B0 = GAME.LM && GAME.LM.beach; if (!B0 || !rDone('r_marina')) return; const R = mulberry(606), sw = seaward(B0.x, B0.z) || [1, 0];
  const water = (x, z, r) => { for (let a = 0; a < 6.28; a += 0.5) if (groundH(x + Math.cos(a) * r, z + Math.sin(a) * r) > -2.5) return false; return groundH(x, z) < -2.5; };
  const list = [['sail', 13], ['sail', 11], ['sail', 15], ['motor', 16], ['motor', 12]]; if (rDone('r_final')) list.push(['sail', 12], ['motor', 18], ['sail', 10]);
  list.forEach(([kind, L], i) => { for (let tries = 0; tries < 30; tries++) { const d = 110 + R() * 160, side = (R() - 0.5) * 220, cx = B0.x + sw[0] * d - sw[1] * side, cz = B0.z + sw[1] * d + sw[0] * side, rx = 25 + R() * 35, rz = 18 + R() * 30;
      let ok = true; for (let a = 0; a < 6.28 && ok; a += 0.4) if (groundH(cx + Math.cos(a) * rx, cz + Math.sin(a) * rz) > -2.0) ok = false; if (!ok) continue;
      const g = mergeLocal(makeYacht(kind, L, R)); scene.add(g); RS.boats.push({ g, kind, cx, cz, rx, rz, a: R() * 6.28, sp: (R() < 0.5 ? -1 : 1) * (kind === 'sail' ? 0.06 : 0.11) * (30 / (rx + rz) * 1.5), ph: R() * 6 }); break; } });
  // a mega yacht at anchor off the beach
  for (let tries = 0; tries < 20; tries++) { const d = 90 + tries * 8, x = B0.x + sw[0] * d, z = B0.z + sw[1] * d; if (!water(x, z, 22)) continue; const g = mergeLocal(makeYacht('mega', 42, R)); g.position.set(x, 0.2, z); g.rotation.y = Math.atan2(sw[1], -sw[0]); scene.add(g); RS.boats.push({ g, anchor: true, ph: 1 }); break; }
};
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { if (GAME.p) RS.update(dt || 0.016); } catch (e) { if (!RS._e) { RS._e = 1; console.warn('resort', e); } } return r; }; }
{ const _rd = GAME.refreshDev; GAME.refreshDev = function () { RS.beach = null; RS.lagoon = null; RS.moored = []; const r = _rd.apply(this, arguments); RS._sig = null; return r; }; }
// the grand opening: fireworks tonight and an epilogue with everyone
{ const _c = GAME.completeDev; GAME.completeDev = function () { const done = _c.apply(this, arguments); if (done && done.includes('r_final')) { const D = this.devState(); D.fireworks = { id: 'fireworks', state: 'done', date: todayKey() }; } return done; }; }
{ const _u = GAME.update; let tt = 0; GAME.update = function (dt) { const r = _u.apply(this, arguments); tt += dt || 0; if (tt > 2) { tt = 0; try { const p = GAME.p; if (p && rDone('r_final') && !p.resortScene && STORY.ready()) { p.resortScene = 1; GAME.dirty = true; STORY.play([['', '――エメラルドの海、白い砂浜、ずらりと並ぶヨット。'], ['カイ', 'お店、毎日観光客でいっぱいだよ！ 英語の練習しなきゃ！'], ['ミオ', '灯台から見る海、前よりもっとキラキラしてる…！'], ['ゲンじい', 'ほっほ。こんな日が来るとはのう。じゃが、港の朝の静けさは変わらんぞ。'], ['リン', '{P}さん。{I}島は、世界中の人があこがれるリゾート島になったよ。ありがとう！'], ['', '🏝️ 島のランク「世界があこがれるリゾート島」']], () => { GAME.banner('🎉 リゾート島 グランドオープン！', '今夜は記念の花火が上がります'); GAME.renderTracker(); }); } } catch (e) { } } return r; }; }
