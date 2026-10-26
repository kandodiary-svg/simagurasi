// ===================== 工事現場: 日本の工事現場らしく（仮囲い・足場と養生シート・鉄骨・重機・看板） =====================
// The old site was four cones, a striped bar and a sign; big works added a yellow lattice tower and four flat white boards
// floating round it. Now:
//   大きな工事（開発）: white steel hoarding (万能鋼板) all round with a green foot line and a gate facing the road, the steel
//     frame of the building going up, scaffolding with grey mesh sheets, a mobile crane, a small excavator, a site office and
//     toilet, stacked materials, 安全第一 / 建築計画のお知らせ / お辞儀看板, rotating lights at the gate
//   家の工事（新しい住民）: concrete footing, the timber frame going up, scaffolding with mesh sheet, a mesh fence, a toilet
//   小さな工事（村のおねがい）: A-frame barricades, cones with cone bars, the bowing-worker sign
const KOJI = { M: null };
KOJI.mats = function () {
  if (KOJI.M) return KOJI.M; const M = KOJI.M = {};
  const tex = (w, h, f, rep = true) => { const t = txCanvas(w, h, f, rep); t.anisotropy = 4; return t; };
  // the hoarding panel: ribbed white steel, a green line at the foot (1 m wide repeat)
  M.panel = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.15, map: tex(128, 256, (x, w, h) => { x.fillStyle = '#f2f3f1'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 16) { const g = x.createLinearGradient(i, 0, i + 16, 0); g.addColorStop(0, '#dfe1de'); g.addColorStop(0.35, '#fbfbfa'); g.addColorStop(0.7, '#e9ebe8'); g.addColorStop(1, '#d6d8d5'); x.fillStyle = g; x.fillRect(i, 0, 16, h); }
    x.fillStyle = '#c9ccc8'; x.fillRect(0, 0, 2, h); x.fillStyle = '#2f8a4a'; x.fillRect(0, h - 20, w, 14); x.fillStyle = '#9aa09a'; x.fillRect(0, h - 6, w, 6); x.fillStyle = '#b8bbb7'; x.fillRect(0, 0, w, 3); }) });
  M.pipe = new THREE.MeshStandardMaterial({ color: '#9aa3a8', roughness: 0.35, metalness: 0.7 });
  M.plank = new THREE.MeshStandardMaterial({ color: '#b9a27a', roughness: 0.8 });
  M.sheet = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true, depthWrite: false, roughness: 0.9, map: tex(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(96,110,104,0.78)'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,70,66,0.85)'; for (let i = 0; i < w; i += 4) { x.fillRect(i, 0, 1, h); x.fillRect(0, i, w, 1); } }) });
  M.steel = new THREE.MeshStandardMaterial({ color: '#8a4a3a', roughness: 0.6, metalness: 0.4 });       // primer red-brown
  M.conc = worldMat(TEX.concrete, 0.3, '#cfcbc2', 0.95);
  M.wood = new THREE.MeshStandardMaterial({ color: '#d9bf8f', roughness: 0.75 });
  M.yellow = new THREE.MeshStandardMaterial({ color: '#f2b51e', roughness: 0.5, metalness: 0.1 });
  M.dark = new THREE.MeshStandardMaterial({ color: '#2a2c2e', roughness: 0.6 });
  M.glass = new THREE.MeshStandardMaterial({ color: '#36505e', roughness: 0.15, metalness: 0.3 });
  M.white = new THREE.MeshStandardMaterial({ color: '#f0eee8', roughness: 0.6 });
  M.office = new THREE.MeshStandardMaterial({ color: '#e8e2d2', roughness: 0.7 });
  M.blue = new THREE.MeshStandardMaterial({ color: '#2f6fb8', roughness: 0.5 });
  M.cone = new THREE.MeshStandardMaterial({ color: '#e8402a', roughness: 0.6 }); M.coneW = new THREE.MeshStandardMaterial({ color: '#f4f4f0', roughness: 0.6 });
  M.stripe = new THREE.MeshStandardMaterial({ roughness: 0.6, map: tex(128, 16, (x, w, h) => { for (let i = -2; i < 10; i++) { x.fillStyle = i % 2 ? '#1c1c1c' : '#f2c21a'; x.beginPath(); x.moveTo(i * 16, h); x.lineTo(i * 16 + 16, 0); x.lineTo(i * 16 + 32, 0); x.lineTo(i * 16 + 16, h); x.fill(); } }) });
  M.lamp = new THREE.MeshStandardMaterial({ color: '#ffb020', emissive: new THREE.Color('#ff8a00'), emissiveIntensity: 1.6, roughness: 0.4 });
  M.bag = new THREE.MeshStandardMaterial({ color: '#c8c0a4', roughness: 0.95 });
  M.rebar = new THREE.MeshStandardMaterial({ color: '#6a4a3a', roughness: 0.7, metalness: 0.4 });
  M.mesh = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true, alphaTest: 0.4, roughness: 0.6, map: tex(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#3a3e40'; x.lineWidth = 2; for (let i = 0; i <= w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }) });
  return M;
};
// a box whose texture repeats once per metre along its length (u) and once per its height (v)
KOJI.panelBox = function (len, h, t) { const g = new THREE.BoxGeometry(len, h, t), uv = g.attributes.uv, n = g.attributes.normal; for (let i = 0; i < uv.count; i++) if (Math.abs(n.getZ(i)) > 0.5) uv.setX(i, uv.getX(i) * len); uv.needsUpdate = true; return g; };
KOJI.tc = {};
KOJI.sign = function (w, h, draw, key) { let mat = key && KOJI.tc[key]; if (!mat) { const t = txCanvas(Math.round(256 * w / h), 256, draw, false); t.anisotropy = 4; mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }); if (key) KOJI.tc[key] = mat; } return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); };
KOJI.font = '"Mochiy Pop One","M PLUS Rounded 1c",sans-serif';
KOJI.bowSign = function () { // お辞儀看板: a worker bowing, "ご迷惑をおかけしております"
  return KOJI.sign(1.0, 1.5, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1f5fa8'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
    x.fillStyle = '#1f5fa8'; x.font = `700 ${w * 0.13}px ${KOJI.font}`; x.textAlign = 'center'; x.fillText('ご迷惑を', w / 2, h * 0.66); x.fillText('おかけして', w / 2, h * 0.76); x.fillText('おります', w / 2, h * 0.86);
    // the bowing figure: yellow helmet, blue uniform
    const cx = w * 0.5, cy = h * 0.36; x.fillStyle = '#2f5fa8'; x.save(); x.translate(cx, cy); x.rotate(0.55); x.fillRect(-w * 0.09, -h * 0.02, w * 0.18, h * 0.2); x.restore(); x.fillRect(cx - w * 0.07, cy + h * 0.1, w * 0.06, h * 0.13); x.fillRect(cx + w * 0.01, cy + h * 0.1, w * 0.06, h * 0.13);
    x.fillStyle = '#f2d2b0'; x.beginPath(); x.arc(cx + w * 0.12, cy - h * 0.035, w * 0.06, 0, 6.3); x.fill(); x.fillStyle = '#f2c21a'; x.beginPath(); x.arc(cx + w * 0.125, cy - h * 0.055, w * 0.068, Math.PI * 0.9, Math.PI * 2.05); x.fill(); }, 'bow');
};
KOJI.noticeSign = function (title) { // 建築計画のお知らせ
  return KOJI.sign(1.8, 1.2, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1d3a6a'; x.fillRect(0, 0, w, h * 0.2); x.fillStyle = '#fff'; x.font = `700 ${h * 0.12}px ${KOJI.font}`; x.textAlign = 'center'; x.fillText('建築計画のお知らせ', w / 2, h * 0.14);
    x.fillStyle = '#222'; x.textAlign = 'left'; x.font = `${h * 0.075}px "M PLUS Rounded 1c",sans-serif`; const L = [['名称', title || 'ほしなみ島 開発工事'], ['建築主', 'ほしなみ島 役場'], ['施工者', 'しまなみ建設'], ['工期', 'まもなく完成']];
    L.forEach(([a, b], i) => { const y = h * (0.34 + i * 0.16); x.fillStyle = '#666'; x.fillText(a, w * 0.06, y); x.fillStyle = '#111'; x.fillText(b, w * 0.3, y); x.fillStyle = '#ccc'; x.fillRect(w * 0.05, y + h * 0.04, w * 0.9, 2); }); }, 'notice:' + (title || ''));
};
KOJI.safety = function () { // 安全第一 banner with the green cross
  return KOJI.sign(2.4, 0.8, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2f8a4a'; const s = h * 0.62, cx = h * 0.55, cy = h / 2; x.fillRect(cx - s * 0.16, cy - s / 2, s * 0.32, s); x.fillRect(cx - s / 2, cy - s * 0.16, s, s * 0.32);
    x.fillStyle = '#1a1a1a'; x.font = `700 ${h * 0.5}px ${KOJI.font}`; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('安全第一', h * 1.05, cy + 2); }, 'safety');
};
KOJI.cone = function (g, x, y, z) { const M = KOJI.mats(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.7, 12), M.cone); c.position.set(x, y + 0.37, z); g.add(c); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.11, 0.12, 12), M.coneW); b.position.set(x, y + 0.43, z); g.add(b); B(g, 0.4, 0.04, 0.4, M.cone, x, y + 0.02, z); };
KOJI.coneRow = function (g, pts) { const M = KOJI.mats(); for (const [x, z] of pts) KOJI.cone(g, x, groundH(x, z), z); for (let i = 1; i < pts.length; i++) { const [ax, az] = pts[i - 1], [bx, bz] = pts[i], L = Math.hypot(bx - ax, bz - az), y = (groundH(ax, az) + groundH(bx, bz)) / 2; const bar = new THREE.Mesh(KOJI.panelBox(L, 0.08, 0.05), M.stripe); bar.position.set((ax + bx) / 2, y + 0.6, (az + bz) / 2); bar.rotation.y = Math.atan2(bz - az, -(bx - ax)) + Math.PI; g.add(bar); } };
KOJI.barricade = function (g, x, z, ry) { const M = KOJI.mats(), s = sub(g, x, groundH(x, z), z, ry); for (const sx of [-0.55, 0.55]) for (const sz of [-0.22, 0.22]) ROD(s, 0.025, M.yellow, [sx, 0, sz], [sx, 1.0, 0]); const bar = new THREE.Mesh(KOJI.panelBox(1.3, 0.2, 0.04), M.stripe); bar.position.set(0, 0.85, 0.02); s.add(bar); const bar2 = bar.clone(); bar2.position.y = 0.45; s.add(bar2); };
// scaffolding: posts, ledgers, planks every 1.8 m, mesh sheet on the outside
KOJI.scaffold = function (g, ax, az, bx, bz, h, outX, outZ, sheet = true) {
  const M = KOJI.mats(), L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 1.8)), ux = (bx - ax) / L, uz = (bz - az) / L, y0 = Math.min(groundH(ax, az), groundH(bx, bz)), lv = Math.max(1, Math.floor(h / 1.8)), ry = Math.atan2(uz, -ux) + Math.PI;
  for (let k = 0; k <= n; k++) for (const o of [0, 0.9]) { const x = ax + ux * L * k / n + outX * o, z = az + uz * L * k / n + outZ * o; CY(g, 0.024, h + 0.6, M.pipe, x, y0 + (h + 0.6) / 2, z, 5); }
  for (let j = 1; j <= lv; j++) { const y = y0 + j * 1.8; for (const o of [0, 0.9]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, L, 5), M.pipe); p.rotation.z = Math.PI / 2; p.rotation.y = ry; p.position.set((ax + bx) / 2 + outX * o, y + 0.9, (az + bz) / 2 + outZ * o); g.add(p); }
    const pl = new THREE.Mesh(new THREE.BoxGeometry(L, 0.05, 0.8), M.plank); pl.position.set((ax + bx) / 2 + outX * 0.45, y, (az + bz) / 2 + outZ * 0.45); pl.rotation.y = ry; g.add(pl);
    // diagonal braces on the outer face
    if (j % 2) for (let k = 0; k < n; k += 2) { const x0 = ax + ux * L * k / n + outX * 0.9, z0 = az + uz * L * k / n + outZ * 0.9, x1 = ax + ux * L * Math.min(n, k + 1) / n + outX * 0.9, z1 = az + uz * L * Math.min(n, k + 1) / n + outZ * 0.9; ROD(g, 0.018, M.pipe, [x0, y - 1.8 + 0.1, z0], [x1, y, z1], 4); } }
  if (sheet) { const s = new THREE.Mesh(KOJI.panelBox(L, h + 0.4, 0.02), M.sheet); s.position.set((ax + bx) / 2 + outX * 0.98, y0 + (h + 0.4) / 2 + 0.2, (az + bz) / 2 + outZ * 0.98); s.rotation.y = ry; s.renderOrder = 2; g.add(s); }
};
KOJI.crane = function (g, x, y, z, ry) { // rough-terrain crane, boom up at ~58°
  const M = KOJI.mats(), s = sub(g, x, y, z, ry);
  B(s, 2.5, 0.9, 7.2, M.white, 0, 1.15, 0); B(s, 2.6, 0.22, 7.3, M.yellow, 0, 1.55, 0); for (const zz of [-2.3, 2.3]) for (const sx of [-1, 1]) { CY(s, 0.55, 0.45, M.dark, sx * 1.15, 0.55, zz, 14, 0, Math.PI / 2); }
  for (const zz of [-3, 3]) for (const sx of [-1, 1]) { B(s, 1.4, 0.18, 0.3, M.yellow, sx * 1.9, 0.6, zz); B(s, 0.4, 0.5, 0.4, M.dark, sx * 2.55, 0.3, zz); }
  B(s, 1.0, 1.0, 1.2, M.white, 0.7, 2.2, 2.6); B(s, 0.9, 0.6, 0.02, M.glass, 0.7, 2.35, 3.21);
  const turret = sub(s, 0, 1.7, -0.6, 0.4); B(turret, 2.0, 0.8, 2.6, M.yellow, 0, 0.4, 0);
  const boom = sub(turret, 0, 1.0, -0.4, 0); boom.rotation.x = -1.0; const len = 15; B(boom, 0.7, 0.7, len, M.yellow, 0, 0, len / 2); B(boom, 0.5, 0.5, len * 0.6, M.white, 0, 0, len * 0.95);
  const tip = new THREE.Vector3(0, 0, len * 1.25); boom.updateMatrixWorld(true); s.updateMatrixWorld(true);
  const tw = tip.clone().applyMatrix4(boom.matrix).applyMatrix4(turret.matrix); CY(s, 0.02, tw.y - 4, M.dark, tw.x, (tw.y + 4) / 2, tw.z, 4); B(s, 0.5, 0.6, 0.4, M.dark, tw.x, 3.7, tw.z);
};
KOJI.excavator = function (g, x, y, z, ry) { // small backhoe (ユンボ)
  const M = KOJI.mats(), s = sub(g, x, y, z, ry);
  for (const sx of [-0.75, 0.75]) B(s, 0.45, 0.5, 2.3, M.dark, sx, 0.25, 0);
  const up = sub(s, 0, 0.55, 0, 0.3); B(up, 1.8, 0.7, 2.0, M.yellow, 0, 0.35, -0.2); B(up, 0.9, 1.1, 0.9, M.yellow, -0.45, 1.25, 0.25); B(up, 0.8, 0.7, 0.02, M.glass, -0.45, 1.35, 0.71); B(up, 1.6, 0.5, 0.5, M.dark, 0, 0.45, -1.2);
  const arm = sub(up, 0.45, 0.8, 0.6, 0); arm.rotation.x = -0.5; B(arm, 0.3, 0.3, 2.2, M.yellow, 0, 0, 1.1); const a2 = sub(arm, 0, 0, 2.2, 0); a2.rotation.x = 1.5; B(a2, 0.24, 0.24, 1.6, M.yellow, 0, 0, 0.8); B(a2, 0.6, 0.4, 0.4, M.dark, 0, -0.1, 1.65);
};
KOJI.office = function (g, x, y, z, ry) { // prefab site office + toilet
  const M = KOJI.mats(), s = sub(g, x, y, z, ry); B(s, 5.4, 2.5, 2.4, M.office, 0, 1.35, 0); B(s, 5.6, 0.12, 2.6, M.blue, 0, 2.66, 0); B(s, 5.4, 0.2, 2.4, M.dark, 0, 0.12, 0);
  for (const xx of [-1.6, 0.2]) B(s, 1.2, 0.8, 0.03, M.glass, xx, 1.6, 1.21); B(s, 0.8, 1.9, 0.03, M.white, 1.8, 1.15, 1.21); B(s, 0.9, 0.3, 0.6, M.dark, 1.8, 0.15, 1.6);
  const t = sub(s, 3.6, 0, 0.2, 0); B(t, 1.0, 2.3, 1.0, M.blue, 0, 1.15, 0); B(t, 1.05, 0.12, 1.05, M.white, 0, 2.36, 0); B(t, 0.7, 1.8, 0.02, M.white, 0, 1.05, 0.51);
};
KOJI.stack = function (g, x, y, z, ry) { const M = KOJI.mats(), s = sub(g, x, y, z, ry); for (let k = 0; k < 6; k++) B(s, 0.2, 0.2, 3.2, M.steel, -0.6 + (k % 3) * 0.35, 0.12 + Math.floor(k / 3) * 0.22, 0); for (let k = 0; k < 5; k++) B(s, 1.0, 0.02, 2.0, M.wood, 1.2, 0.05 + k * 0.03, 0); for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), M.bag); b.scale.set(1.3, 0.55, 0.9); b.position.set(-0.5 + (k % 3) * 0.6, 0.15 + Math.floor(k / 3) * 0.28, 1.9); s.add(b); } };
// the main entry point (the same signature as before, plus an optional footprint: rot, w, d, house)
makeConstruction = function (at, big) {
  const g = new THREE.Group(); if (!at) return g; const M = KOJI.mats(), x0 = at.x, z0 = at.z, y0 = groundH(x0, z0);
  let rot = at.rot; if (rot === undefined) { const nr = typeof nearestOnRoads === 'function' && nearestOnRoads(x0, z0, 60, false); rot = nr ? Math.atan2(nr.x - x0, nr.z - z0) : 0; }
  const o = { x: x0, z: z0, rot }, W = (lx, lz) => toWorld(o, lx, lz), GY = (lx, lz) => { const [x, z] = W(lx, lz); return groundH(x, z); };
  if (big) {
    const SW = clamp((at.w || 16) + 3, 12, 30), SD = clamp((at.d || 14) + 3, 10, 28), hw = SW / 2, hd = SD / 2, H = 2.4, gate = Math.min(6, SW * 0.4);
    // hoarding: four sides (front split by the gate), skipping water; posts and stays inside
    const side = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 3.6)); for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n, la = ax + (bx - ax) * t0, lza = az + (bz - az) * t0, lb = ax + (bx - ax) * t1, lzb = az + (bz - az) * t1, [pa, qa] = W(la, lza), [pb, qb] = W(lb, lzb), y = Math.min(groundH(pa, qa), groundH(pb, qb)); if (y < 0.15) continue;
        const seg = Math.hypot(pb - pa, qb - qa), p = new THREE.Mesh(KOJI.panelBox(seg, H, 0.05), M.panel); p.position.set((pa + pb) / 2, y + H / 2 - 0.05, (qa + qb) / 2); p.rotation.y = Math.atan2(qb - qa, -(pb - pa)) + Math.PI; g.add(p);
        const ix = -(lzb - lza) / (seg || 1), iz = (lb - la) / (seg || 1); for (const [lx, lz] of [[la, lza], [lb, lzb]]) { const [px, pz] = W(lx, lz), [sx, sz] = W(lx + ix * 0.9 * Math.sign(-lx * ix - lz * iz || 1), lz + iz * 0.9 * Math.sign(-lx * ix - lz * iz || 1)); CY(g, 0.024, H + 0.1, M.pipe, px, y + H / 2, pz, 5); ROD(g, 0.022, M.pipe, [px, y + H * 0.8, pz], [sx, y, sz], 5); }
        if (COLL.track) addCollider({ x: (pa + pb) / 2, z: (qa + qb) / 2, hw: seg / 2, hd: 0.08, rot: Math.atan2(pb - pa, qb - qa) - Math.PI / 2, kind: 'bld' }); } };
    side(-hw, hd, -gate / 2, hd); side(gate / 2, hd, hw, hd); side(hw, hd, hw, -hd); side(hw, -hd, -hw, -hd); side(-hw, -hd, -hw, hd);
    // the gate: open mesh gate leaves folded back, warning lights, signs
    for (const sx of [-1, 1]) { const [px, pz] = W(sx * gate / 2, hd), y = groundH(px, pz); CY(g, 0.06, 2.7, M.pipe, px, y + 1.35, pz, 8); const L = new THREE.Mesh(new THREE.PlaneGeometry(gate / 2, 2.0), M.mesh); const [qx, qz] = W(sx * (gate / 2 + 0.1), hd - gate / 4); L.position.set(qx, y + 1.05, qz); L.rotation.y = rot + Math.PI / 2; g.add(L);
      const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 10), M.lamp); lp.position.set(px, y + 2.8, pz); g.add(lp); }
    const front = (s, lx, hgt) => { const [px, pz] = W(lx, hd + 0.06); s.position.set(px, GY(lx, hd + 0.06) + hgt, pz); s.rotation.y = rot; g.add(s); };
    front(KOJI.safety(), -hw * 0.55, 1.5); front(KOJI.noticeSign(at.name), hw * 0.55, 1.3); front(KOJI.bowSign(), gate / 2 + 0.75, 0.95);
    // the building going up: a steel frame (2–3 storeys), floors, the lower floors clad in mesh sheet on scaffolding
    const fw = SW - 6, fd = SD - 6.5, floors = SW > 20 ? 3 : 2, fh = 3.4, fy = Math.max(GY(0, -0.5), y0);
    { const s = sub(g, ...W(0, -0.8).slice(0, 1), fy, W(0, -0.8)[1], rot); s.position.x = W(0, -0.8)[0];
      B(s, fw + 0.6, 0.35, fd + 0.6, M.conc, 0, 0.12, 0); const nx = Math.max(2, Math.round(fw / 4)), nz = Math.max(2, Math.round(fd / 4));
      for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) { const px = -fw / 2 + fw * i / nx, pz = -fd / 2 + fd * j / nz; B(s, 0.3, floors * fh, 0.3, M.steel, px, floors * fh / 2 + 0.3, pz); }
      for (let f = 1; f <= floors; f++) { const yy = f * fh + 0.3; for (let i = 0; i <= nx; i++) B(s, 0.25, 0.45, fd, M.steel, -fw / 2 + fw * i / nx, yy, 0); for (let j = 0; j <= nz; j++) B(s, fw, 0.45, 0.25, M.steel, 0, yy, -fd / 2 + fd * j / nz); if (f < floors) B(s, fw, 0.15, fd, M.conc, 0, yy + 0.3, 0); }
      for (let k = 0; k < 4; k++) B(s, 0.04, 1.2, 0.04, M.rebar, -fw / 2 + 0.4 + k * 0.3, floors * fh + 0.9, fd / 2 - 0.4); }
    { const L0 = W(-fw / 2 - 0.7, fd / 2 - 0.8 + 0.7), L1 = W(fw / 2 + 0.7, fd / 2 - 0.8 + 0.7), out = [Math.sin(rot), Math.cos(rot)]; KOJI.scaffold(g, L0[0], L0[1], L1[0], L1[1], fh * (floors - 0.4), out[0], out[1]);
      const S0 = W(fw / 2 + 0.7, fd / 2 - 0.1), S1 = W(fw / 2 + 0.7, -fd / 2 - 1.5), so = [Math.cos(rot), -Math.sin(rot)]; KOJI.scaffold(g, S0[0], S0[1], S1[0], S1[1], fh * (floors - 1), so[0], so[1]); }
    // machines and the yard
    { const [cx, cz] = W(-hw + 3.2, hd - 5.5); KOJI.crane(g, cx, groundH(cx, cz), cz, rot + 0.15); }
    { const [ex, ez] = W(hw - 3, hd - 3.2); KOJI.excavator(g, ex, groundH(ex, ez), ez, rot - 2.4); }
    { const [ox, oz] = W(hw - 3.4, -hd + 1.8); KOJI.office(g, ox, groundH(ox, oz), oz, rot + Math.PI); }
    { const [mx, mz] = W(-hw + 2.4, -hd + 2.4); KOJI.stack(g, mx, groundH(mx, mz), mz, rot); }
    { const pts = [-1.4, 0, 1.4].map(k => W(k * gate / 3, hd + 1.2)); KOJI.coneRow(g, pts); }
  } else if (at.house) {
    const s = sub(g, x0, y0, z0, rot); B(s, 7.4, 0.4, 6.4, M.conc, 0, 0.1, 0); B(s, 7.0, 0.12, 6.0, M.wood, 0, 0.36, 0);
    for (const [px, pz] of [[-3.4, -2.9], [3.4, -2.9], [-3.4, 2.9], [3.4, 2.9], [0, -2.9], [0, 2.9], [-3.4, 0], [3.4, 0]]) B(s, 0.12, 2.8, 0.12, M.wood, px, 1.8, pz);
    for (const pz of [-2.9, 2.9]) B(s, 7.0, 0.18, 0.12, M.wood, 0, 3.2, pz); for (const px of [-3.4, 3.4, 0]) B(s, 0.12, 0.18, 6.0, M.wood, px, 3.2, 0); for (let k = -2; k <= 2; k++) B(s, 0.08, 0.1, 6.0, M.wood, k * 1.6, 3.32, 0);
    const out = [Math.sin(rot), Math.cos(rot)], [ax, az] = W(-4.3, 3.9), [bx, bz] = W(4.3, 3.9); KOJI.scaffold(g, ax, az, bx, bz, 3.4, out[0], out[1]);
    const sd = [Math.cos(rot), -Math.sin(rot)], [cx, cz] = W(4.4, 3.4), [dx, dz] = W(4.4, -3.4); KOJI.scaffold(g, cx, cz, dx, dz, 3.4, sd[0], sd[1], false);
    // a mesh fence along the road side, toilet, sign
    for (let k = -2; k <= 2; k++) { if (k === 0) continue; const [fx, fz] = W(k * 1.9, 6.0), y = groundH(fx, fz); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 1.6), M.mesh); f.position.set(fx, y + 0.85, fz); f.rotation.y = rot; g.add(f); CY(g, 0.03, 1.8, M.pipe, fx + Math.cos(rot) * 0.95, y + 0.9, fz - Math.sin(rot) * 0.95, 5); B(g, 0.5, 0.12, 0.25, M.conc, fx, y + 0.06, fz, rot); }
    { const t = sub(g, ...W(-4.6, -3.6).slice(0, 1), GY(-4.6, -3.6), W(-4.6, -3.6)[1], rot); t.position.x = W(-4.6, -3.6)[0]; B(t, 1.0, 2.3, 1.0, M.blue, 0, 1.15, 0); B(t, 1.05, 0.12, 1.05, M.white, 0, 2.36, 0); }
    { const b = KOJI.bowSign(), [bx2, bz2] = W(0, 6.3); b.position.set(bx2, groundH(bx2, bz2) + 0.95, bz2); b.rotation.y = rot; g.add(b); KOJI.barricade(g, ...W(0, 6.8), rot); }
  } else {
    // small works: barricades, cones with bars, the bowing-worker sign
    KOJI.barricade(g, ...W(0, 1.6), rot); KOJI.barricade(g, ...W(-1.9, 0.4), rot + 1.2);
    KOJI.coneRow(g, [W(1.4, 1.4), W(2.3, 0.2), W(2.0, -1.2)]);
    const b = KOJI.bowSign(), [bx, bz] = W(-0.2, 2.2); b.position.set(bx, groundH(bx, bz) + 0.95, bz); b.rotation.y = rot; g.add(b); CY(g, 0.03, 0.9, M.pipe, bx, groundH(bx, bz) + 0.45, bz, 5);
    KOJI.stack(g, ...W(-2.2, -1.6).slice(0, 1), y0, W(-2.2, -1.6)[1], rot);
  }
  g.traverse(m => { if (m.isMesh) { m.castShadow = m.material !== M.sheet && m.material !== M.mesh; m.receiveShadow = true; } });
  const out = mergeLocal(g); out.userData.cons = { x: x0, z: z0 }; return out;
};
