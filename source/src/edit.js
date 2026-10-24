// ===================== ISLAND BUILDING (しまづくり) =====================
const TOOLS = [
  { id: 'raise', name: '上げる', icon: '⛰️', hint: 'ドラッグした所の地面が高くなります', brush: true },
  { id: 'lower', name: '下げる', icon: '⬇️', hint: 'ドラッグした所の地面が低くなります', brush: true },
  { id: 'flatten', name: '平らに', icon: '▭', hint: '最初にクリックした高さにそろえます', brush: true },
  { id: 'smooth', name: 'なめらか', icon: '〰️', hint: 'でこぼこをなだらかにします', brush: true },
  { id: 'dig', name: '川・池', icon: '💧', hint: 'ほった所に水がたまります。川や池の近くからほると、つながります', brush: true },
  { id: 'fill', name: 'うめる', icon: '🟫', hint: '川・池・浅い海をうめて陸にします', brush: true },
  { id: 'road', name: '道路', icon: '🛣️', hint: '地面をクリックして道の点を置き、「完成」で道路になります（既存の道の近くは自動でつながります）', brush: false },
  { id: 'unroad', name: '道をけす', icon: '✖️', hint: 'あなたが作った道路をクリックすると消えます', brush: false },
  { id: 'plant', name: '木を植える', icon: '🌳', hint: 'クリックした所に木を植えます', brush: false },
  { id: 'clear', name: '木・草をとる', icon: '🪓', hint: 'ドラッグした所の木・草・岩をとりのぞきます', brush: true },
];
const EDIT = { on: false, tool: 'raise', r: 5, mouse: null, down: false, stroke: null, nodes: [], roadW: 'narrow', treeKind: 'broad0', undo: [], hover: null, saveT: 0, confirmReset: 0, uroad: null };
let BRUSH = null, PREVIEW = null, MARKERS = null;
function initEdit(scene) {
  // brush ring
  const N = 72, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 2 * 3), 3));
  const idx = []; for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } g.setIndex(idx);
  BRUSH = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, depthTest: false, fog: false, side: THREE.DoubleSide }));
  BRUSH.renderOrder = 50; BRUSH.frustumCulled = false; BRUSH.visible = false; scene.add(BRUSH);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), BRUSH.material); dot.renderOrder = 50; BRUSH.userData.dot = dot; scene.add(dot); dot.visible = false;
  PREVIEW = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.55, depthWrite: false, fog: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 }));
  PREVIEW.renderOrder = 40; PREVIEW.frustumCulled = false; PREVIEW.visible = false; scene.add(PREVIEW);
  MARKERS = new THREE.Group(); scene.add(MARKERS);
  loadWorld();
}
// ---------- picking ----------
const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2();
function surfaceY(x, z) { const g = groundH(x, z), L = waterLevelAt(G, x, z), d = deckY(x, z); let y = g; if (!isNaN(L) && L > y) y = L; if (d !== null && d > y) y = d; return y; }
function pickSurface(cx, cy) {
  const r = renderer.domElement.getBoundingClientRect(); _ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1); _ray.setFromCamera(_ndc, camera);
  const o = _ray.ray.origin, d = _ray.ray.direction; let tPrev = 0, t = 0.5;
  const f = t => { const x = o.x + d.x * t, z = o.z + d.z * t; return o.y + d.y * t - Math.max(surfaceY(x, z), Math.abs(x) > 358 || Math.abs(z) > 358 ? 0 : -50); };
  if (f(0.01) < 0) return null;
  while (t < 900) { if (f(t) < 0) break; tPrev = t; t += Math.max(0.4, t * 0.015); }
  if (t >= 900) return null;
  for (let k = 0; k < 14; k++) { const m = (tPrev + t) / 2; if (f(m) < 0) t = m; else tPrev = m; }
  const x = o.x + d.x * t, z = o.z + d.z * t; if (Math.abs(x) > 356 || Math.abs(z) > 356) return null; return { x, z, y: surfaceY(x, z) };
}
// ---------- brush ----------
function brushVerts(p, r, fn) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2;
  const i0 = Math.max(0, Math.floor((p.x - r - h0) / cell)), i1 = Math.min(n - 1, Math.ceil((p.x + r - h0) / cell)), j0 = Math.max(0, Math.floor((p.z - r - h0) / cell)), j1 = Math.min(n - 1, Math.ceil((p.z + r - h0) / cell));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const x = h0 + i * cell, z = h0 + j * cell, dd = Math.hypot(x - p.x, z - p.z); if (dd > r) continue; const k = j * n + i; if (!editable(k) || !GAME.openK(k)) continue; const t = dd / r, w = (1 - t * t) * (1 - t * t); fn(k, w, i, j); }
  return [i0, j0, i1, j1];
}
function nearestWaterLevel(p, rad) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2; let best = NaN, bd = Infinity;
  for (let j = Math.max(0, Math.floor((p.z - rad - h0) / cell)); j <= Math.min(n - 1, Math.ceil((p.z + rad - h0) / cell)); j++) for (let i = Math.max(0, Math.floor((p.x - rad - h0) / cell)); i <= Math.min(n - 1, Math.ceil((p.x + rad - h0) / cell)); i++) {
    const k = j * n + i, L = G.Wl[k]; if (isNaN(L) || L <= G.H[k]) continue; const d = Math.hypot(h0 + i * cell - p.x, h0 + j * cell - p.z); if (d < bd) { bd = d; best = L; } }
  return best;
}
function strokeStart(p) {
  const t = EDIT.tool; pushUndo();
  const st = { p, start: p };
  if (t === 'flatten') st.level = groundH(p.x, p.z);
  if (t === 'dig') { const L = nearestWaterLevel(p, EDIT.r + 4); if (!isNaN(L)) st.level = L; else { const g = groundH(p.x, p.z); st.level = g < 1.0 ? 0 : Math.round((g - 0.6) * 2) / 2; if (st.level < 0.4) st.level = 0; } }
  EDIT.stroke = st;
}
function strokeApply(p, dt) {
  const t = EDIT.tool, st = EDIT.stroke, H = G.H, W = G.Wl, r = EDIT.r; let box; if (!st) return; if (GAME.openAt(p.x, p.z)) st.moved = true;
  if (t === 'raise') { box = brushVerts(p, r, (k, w) => { H[k] = Math.min(42, H[k] + 2.6 * dt * w); if (!isNaN(W[k]) && H[k] > W[k] + 0.25) W[k] = NaN; }); relaxSlope(p, r + 2, dt); }
  else if (t === 'lower') { box = brushVerts(p, r, (k, w) => { const floor = isNaN(W[k]) ? -1.5 : W[k] - 3; H[k] = Math.max(floor, H[k] - 2.6 * dt * w); }); relaxSlope(p, r + 2, dt); }
  else if (t === 'flatten') box = brushVerts(p, r, (k, w) => { H[k] += (st.level - H[k]) * Math.min(1, 7 * dt * w); if (!isNaN(W[k]) && H[k] > W[k] + 0.25) W[k] = NaN; });
  else if (t === 'smooth') { const { n } = WORLD, T = new Map(); box = brushVerts(p, r, (k, w, i, j) => { let s = 0, c = 0; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const q = (j + b) * n + i + a; if (i + a < 0 || j + b < 0 || i + a >= n || j + b >= n) continue; s += H[q]; c++; } T.set(k, [s / c, w]); }); for (const [k, [avg, w]] of T) H[k] += (avg - H[k]) * Math.min(1, 6 * dt * w); }
  else if (t === 'dig') { const L = st.level, bed = L - 1.4; box = brushVerts(p, r, (k, w) => { if (H[k] > bed) H[k] = Math.max(bed + (1 - w) * 1.2, H[k] - 7 * dt * Math.max(0.15, w)); if (L > 0.2 && w > 0.04) { if (isNaN(W[k])) st.newW = (st.newW || 0) + 1; W[k] = isNaN(W[k]) ? L : Math.max(W[k], L); } }); }
  else if (t === 'fill') box = brushVerts(p, r, (k, w) => { if (!isNaN(W[k])) { H[k] = Math.max(H[k], W[k] + 0.3 - (1 - w) * 0.4); if (w > 0.25) W[k] = NaN; } else if (H[k] < 0.6) H[k] += (0.6 - H[k]) * Math.min(1, 6 * dt * w); });
  else if (t === 'clear') { const n = VEG.removeAt(p.x, p.z, r); if (n) { st.cleared = (st.cleared || 0) + n; const { size } = WORLD, cell = size / (WORLD.n - 1), h0 = -size / 2; box = [Math.floor((p.x - r - h0) / cell), Math.floor((p.z - r - h0) / cell), Math.ceil((p.x + r - h0) / cell), Math.ceil((p.z + r - h0) / cell)]; VEG.refresh(p.x - r - 1, p.z - r - 1, p.x + r + 1, p.z + r + 1); } return; }
  if (box) refreshRegion(box[0] - 1, box[1] - 1, box[2] + 1, box[3] + 1);
}
// keep raised/lowered ground from turning into spikes: pull vertices that stick out
// more than ~1.5 m from their neighbours' average back toward it (angle of repose ~37°)
function relaxSlope(p, r, dt) {
  const { n } = WORLD, H = G.H, T = [];
  brushVerts(p, r, (k, w, i, j) => { if (i < 1 || j < 1 || i >= n - 1 || j >= n - 1) return; const avg = (H[k - 1] + H[k + 1] + H[k - n] + H[k + n]) / 4, d = H[k] - avg; if (Math.abs(d) > 1.5) T.push([k, avg + Math.sign(d) * 1.5]); else T.push([k, H[k] + (avg - H[k]) * Math.min(1, 1.2 * dt)]); });
  for (const [k, v] of T) H[k] = v;
}
function strokeEnd() {
  const st = EDIT.stroke; if (!st) return; EDIT.stroke = null; scheduleSave();
  if (['raise', 'lower', 'flatten', 'smooth'].includes(EDIT.tool) && st.moved) GAME.ev('shape', 1);
  if (st.newW) GAME.ev('water', st.newW); if (st.cleared) GAME.ev('clear', st.cleared);
}

// ---------- roads ----------
function hitsCollider(c, x, z, r) { if (c.r !== undefined) return Math.hypot(x - c.x, z - c.z) < c.r + r; const cs = Math.cos(c.rot), sn = Math.sin(c.rot), lx = (x - c.x) * cs - (z - c.z) * sn, lz = (x - c.x) * sn + (z - c.z) * cs; return Math.abs(lx) < c.hw + r && Math.abs(lz) < c.hd + r; }
function nearestOnRoads(x, z, maxD, onlyUser) {
  let best = null;
  for (const r of ROADS) { if (onlyUser && !r.user) continue; for (let s = 1; s < r.pts.length; s++) { const a = r.pts[s - 1], b = r.pts[s], vx = b[0] - a[0], vz = b[1] - a[1], t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / (vx * vx + vz * vz || 1), 0, 1);
    const px = a[0] + vx * t, pz = a[1] + vz * t, d = Math.hypot(x - px, z - pz); if (d < maxD && (!best || d < best.d)) best = { d, x: px, z: pz, y: lerp(r.h[s - 1], r.h[s], t), road: r }; } }
  return best;
}
function roadPathFrom(nodes) {
  if (nodes.length < 2) return null;
  const pts = nodes.map(n => new THREE.Vector3(n.x, 0, n.z)); const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  const L = curve.getLength(); if (L < 3) return null; const sp = curve.getSpacedPoints(Math.max(2, Math.ceil(L / 2)));
  return sp.map(v => [v.x, v.z]);
}
function planUserRoad(nodes) {
  const pts = roadPathFrom(nodes); if (!pts) return { err: '点をもう1つ置いてください' };
  if (!GAME.canUse('road', EDIT.roadW)) EDIT.roadW = 'narrow';
  const w = EDIT.roadW === 'wide' ? 6.2 : 4.2, r = { pts, w, lines: EDIT.roadW === 'wide', user: true };
  // heights: follow smoothed terrain, keep snapped ends exact, max 12% grade
  let hs = pts.map(([x, z]) => { const d = deckY(x, z); return d !== null ? d : Math.max(0.6, groundH(x, z)); });
  const fix = [nodes[0].snap ? nodes[0].snap.y : null, nodes[nodes.length - 1].snap ? nodes[nodes.length - 1].snap.y : null];
  if (fix[0] !== null) hs[0] = fix[0]; if (fix[1] !== null) hs[hs.length - 1] = fix[1];
  for (let k = 0; k < 24; k++) hs = hs.map((h, i) => i === 0 || i === hs.length - 1 ? h : (hs[i - 1] + h * 2 + hs[i + 1]) / 4);
  for (let k = 1; k < hs.length; k++) hs[k] = clamp(hs[k], hs[k - 1] - 0.26, hs[k - 1] + 0.26);
  for (let k = hs.length - 2; k >= 0; k--) hs[k] = clamp(hs[k], hs[k + 1] - 0.26, hs[k + 1] + 0.26);
  r.h = hs; markBridges(G, r);
  // checks
  let run = 0, maxRun = 0; r.bridge.forEach(b => { run = b ? run + 1 : 0; maxRun = Math.max(maxRun, run); });
  if (maxRun * 2 > 50) return { r, err: '橋が長すぎます（50mまで）' };
  for (let i = 0; i < pts.length; i++) {
    const [x, z] = pts[i];
    if (Math.abs(x) > 340 || Math.abs(z) > 340) return { r, err: '島の外です' };
    if (!r.bridge[i] && groundH(x, z) < -0.4) return { r, err: '海の上には道をつくれません（うめてから作ってね）' };
    for (const c of collidersNear(x, z)) { if (c.off || !(c.kind === 'bld' || c.kind === 'pole')) continue; if (hitsCollider(c, x, z, w / 2)) return { r, err: c.kind === 'pole' ? '電柱にぶつかります' : 'たてものにぶつかります' }; }
    if (!GAME.openAt(x, z) && !(nodes[0].snap && i < 6) && !(nodes[nodes.length - 1].snap && i > pts.length - 7)) return { r, err: GAME.lockText(x, z) };
    const [i2, j2] = toIdx(x, z); if (G.prot[j2 * WORLD.n + i2] && !(nodes[0].snap && i < 6) && !(nodes[nodes.length - 1].snap && i > pts.length - 7)) return { r, err: 'たてもの・港の近くには道をつくれません' };
  }
  return { r, err: null };
}
function addRoadNode(p) {
  const snap = nearestOnRoads(p.x, p.z, 5.5, false); const node = snap ? { x: snap.x, z: snap.z, snap } : { x: p.x, z: p.z, snap: null };
  const last = EDIT.nodes[EDIT.nodes.length - 1];
  if (last && Math.hypot(last.x - node.x, last.z - node.z) < 1.5) { finishRoad(); return; }
  EDIT.nodes.push(node); updateRoadPreview(null); UI.editHint();
}
function finishRoad() {
  if (EDIT.nodes.length < 2) { UI.toast('道の点を2つ以上置いてください'); return; }
  const plan = planUserRoad(EDIT.nodes); if (plan.err) { UI.toast(plan.err); return; }
  pushUndo();
  const r = plan.r, box = carveSingleRoad(r); ROADS.push(r); rasterizeRoadDist(); rebuildDecks();
  r.mesh = makeRoadMesh(r); TERR.roadGroup.add(r.mesh);
  refreshRegion(box[0] - 2, box[1] - 2, box[2] + 2, box[3] + 2);
  EDIT.nodes = []; updateRoadPreview(null); UI.toast('道路ができました！'); scheduleSave(); UI.editHint();
  let len = 0; for (let k = 1; k < r.pts.length; k++) len += Math.hypot(r.pts[k][0] - r.pts[k - 1][0], r.pts[k][1] - r.pts[k - 1][1]); GAME.ev('roadN', 1); GAME.ev('roadM', Math.round(len));
}
function removeUserRoad(r) {
  pushUndo(); ROADS.splice(ROADS.indexOf(r), 1); TERR.roadGroup.remove(r.mesh); r.mesh.traverse(o => o.geometry && o.geometry.dispose());
  rasterizeRoadDist(); rebuildDecks(); const xs = r.pts.map(p => p[0]), zs = r.pts.map(p => p[1]); const a = toIdx(Math.min(...xs) - 10, Math.min(...zs) - 10), b = toIdx(Math.max(...xs) + 10, Math.max(...zs) + 10);
  refreshRegion(a[0], a[1], b[0], b[1]); UI.toast('道路を消しました'); scheduleSave();
}
function ribbonGeo(pts, w, lift) {
  const pos = [], idx = [];
  pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let tx = b[0] - a[0], tz = b[1] - a[1]; const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
    for (const s of [-1, 1]) { const x = p[0] - tz * w / 2 * s, z = p[1] + tx * w / 2 * s; pos.push(x, (p[2] !== undefined ? p[2] : surfaceY(x, z)) + lift, z); } if (i) { const o = (i - 1) * 2; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
}
function updateRoadPreview(hover) {
  while (MARKERS.children.length) MARKERS.remove(MARKERS.children[0]);
  const nodes = EDIT.nodes.slice(); if (hover && EDIT.tool === 'road') { const snap = nearestOnRoads(hover.x, hover.z, 5.5, false); nodes.push(snap ? { x: snap.x, z: snap.z, snap } : { x: hover.x, z: hover.z, snap: null }); }
  for (const nd of EDIT.nodes) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.6, 10), new THREE.MeshBasicMaterial({ color: nd.snap ? '#3aa7c9' : '#f2a541' })); m.position.set(nd.x, surfaceY(nd.x, nd.z) + 0.8, nd.z); MARKERS.add(m); }
  if (nodes.length < 2) { PREVIEW.visible = false; EDIT.plan = null; return; }
  const plan = planUserRoad(nodes); EDIT.plan = plan;
  if (!plan.r) { PREVIEW.visible = false; return; }
  PREVIEW.geometry.dispose(); PREVIEW.geometry = ribbonGeo(plan.r.pts.map((p, i) => [p[0], p[1], plan.r.h[i]]), plan.r.w, 0.25);
  PREVIEW.material.color.set(plan.err ? '#ff6f6f' : '#7cf0a0'); PREVIEW.visible = true;
}
// ---------- trees ----------
function plantTree(p) {
  if (!GAME.openAt(p.x, p.z)) { UI.toast(GAME.lockText(p.x, p.z)); return; }
  if (!GAME.canUse('tree', EDIT.treeKind)) { UI.toast(`この木は元気度Lv${TREE_LV[EDIT.treeKind]}で植えられるようになります`); return; }
  if (groundH(p.x, p.z) < 0.6 || waterDepthAt(p.x, p.z) > 0 || roadDistAt(p.x, p.z) < 4 || deckY(p.x, p.z) !== null) { UI.toast('ここには植えられません'); return; }
  const [i, j] = toIdx(p.x, p.z); if (G.prot[j * WORLD.n + i]) { UI.toast('たてものの近くには植えられません'); return; }
  if (VEG.userTrees.some(t => Math.hypot(t.x - p.x, t.z - p.z) < 2.5)) { UI.toast('近すぎます'); return; }
  const cnt = VEG.userTrees.filter(t => t.key === EDIT.treeKind).length; if (cnt >= 300) { UI.toast('この木はもう植えられません'); return; }
  pushUndo(); const kind = EDIT.treeKind.replace(/\d+$/, ''); VEG.userTrees.push({ x: p.x, z: p.z, r: Math.random(), kind, key: EDIT.treeKind }); VEG.rebuildUser(); scheduleSave(); GAME.ev('plant', 1);
}
// ---------- undo / save ----------
function snapshot() { return { H: new Float32Array(G.H), Wl: new Float32Array(G.Wl), roads: ROADS.filter(r => r.user).map(r => ({ pts: r.pts, w: r.w, lines: r.lines, h: r.h, bridge: r.bridge })), removed: new Uint8Array(VEG.removed), trees: VEG.userTrees.map(t => ({ ...t })) }; }
function pushUndo() { EDIT.undo.push(snapshot()); if (EDIT.undo.length > 12) EDIT.undo.shift(); UI.editHint(); }
function restore(s) {
  G.H.set(s.H); G.Wl.set(s.Wl);
  for (const r of ROADS.filter(r => r.user)) { TERR.roadGroup.remove(r.mesh); r.mesh.traverse(o => o.geometry && o.geometry.dispose()); }
  ROADS = ROADS.filter(r => !r.user);
  for (const q of s.roads) { const r = { pts: q.pts, w: q.w, lines: q.lines, h: q.h, bridge: q.bridge, user: true }; ROADS.push(r); r.mesh = makeRoadMesh(r); TERR.roadGroup.add(r.mesh); }
  rasterizeRoadDist(); rebuildDecks();
  VEG.removed.set(s.removed); VEG.userTrees = s.trees.map(t => ({ ...t }));
  refreshAll();
}
function undoEdit() { const s = EDIT.undo.pop(); if (!s) { UI.toast('もどせる操作がありません'); return; } restore(s); EDIT.nodes = []; updateRoadPreview(null); UI.toast('ひとつもどしました'); scheduleSave(); UI.editHint(); }
function resetIsland() { pushUndo(); restore({ H: G.H0, Wl: G.Wl0, roads: [], removed: new Uint8Array(VEG.removed.length), trees: [] }); UI.toast('島を最初の形にもどしました（「ひとつもどす」で取り消せます）'); scheduleSave(); }
const SAVE_KEY = 'hoshinami2-world', GEN_VER = 'g5';
const toB64 = arr => { const u = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = (str, T) => { const s = atob(str), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new T(u.buffer); };
function scheduleSave() { EDIT.saveT = 1.2; }
function saveWorld() {
  try { const s = snapshot(); localStorage.setItem(SAVE_KEY, JSON.stringify({ v: GEN_VER, H: toB64(s.H), Wl: toB64(s.Wl), roads: s.roads, removed: toB64(s.removed), trees: s.trees })); } catch (e) { /* storage unavailable: edits stay for this visit */ }
}
function loadWorld() {
  let d = null; try { d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { d = null; }
  if (!d || d.v !== GEN_VER) return;
  try { const H = fromB64(d.H, Float32Array), Wl = fromB64(d.Wl, Float32Array), rm = fromB64(d.removed, Uint8Array); if (H.length !== G.H.length || rm.length > VEG.removed.length) return; restore({ H, Wl, roads: d.roads || [], removed: rm, trees: d.trees || [] }); } catch (e) { }
}
function updateEdit(dt) {
  if (EDIT.saveT > 0) { EDIT.saveT -= dt; if (EDIT.saveT <= 0) saveWorld(); }
  if (!EDIT.on) { BRUSH.visible = false; BRUSH.userData.dot.visible = false; if (LIFE.ghost) LIFE.ghost.visible = false; if (DECO.ghost) DECO.ghost.visible = false; return; }
  const tool = TOOLS.find(t => t.id === EDIT.tool);
  const p = EDIT.mouse ? pickSurface(EDIT.mouse.x, EDIT.mouse.y) : null; EDIT.hover = p;
  if (p && tool.brush) {
    const pos = BRUSH.geometry.attributes.position, N = pos.count / 2 - 1, r = EDIT.r;
    for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); for (const [q, rr] of [[0, r - 0.22], [1, r]]) { const x = p.x + c * rr, z = p.z + s * rr; pos.setXYZ(i * 2 + q, x, surfaceY(x, z) + 0.15, z); } }
    pos.needsUpdate = true; BRUSH.visible = true; const [i, j] = toIdx(p.x, p.z); BRUSH.material.color.set(editable(j * WORLD.n + i) && GAME.openK(j * WORLD.n + i) ? ({ dig: '#6fd0ff', fill: '#e8c08a', clear: '#ffb36b' }[EDIT.tool] || '#ffffff') : '#ff6f6f');
    BRUSH.userData.dot.visible = true; BRUSH.userData.dot.position.set(p.x, p.y + 0.15, p.z);
  } else { BRUSH.visible = false; BRUSH.userData.dot.visible = !!p && !tool.brush; if (p) BRUSH.userData.dot.position.set(p.x, p.y + 0.2, p.z); }
  const lk = p && !GAME.openAt(p.x, p.z) ? GAME.lockText(p.x, p.z) : ''; if (lk !== EDIT.lockMsg) { EDIT.lockMsg = lk; UI.editHint(); }
  if (EDIT.down && EDIT.stroke && p && tool.brush) strokeApply(p, dt);
  if (EDIT.tool === 'road') { if (p && (!EDIT._lp || Math.hypot(EDIT._lp.x - p.x, EDIT._lp.z - p.z) > 0.6)) { EDIT._lp = p; updateRoadPreview(p); } }
  else if (EDIT.tool === 'house') GAME.housePreview(p);
  else if (EDIT.tool === 'decor') GAME.decorPreview(p);
  else if (EDIT.tool === 'build') GAME.buildPreview(p);
  else if (EDIT.tool === 'unroad') { const hit = p && nearestOnRoads(p.x, p.z, 4, true); EDIT.uroad = hit ? hit.road : null;
    if (EDIT.uroad) { PREVIEW.geometry.dispose(); PREVIEW.geometry = ribbonGeo(EDIT.uroad.pts.map((q, i) => [q[0], q[1], EDIT.uroad.h[i]]), EDIT.uroad.w + 0.6, 0.3); PREVIEW.material.color.set('#ff6f6f'); PREVIEW.visible = true; } else PREVIEW.visible = false; }
  else if (PREVIEW.visible) PREVIEW.visible = false;
}
function editPointerDown(e) {
  const p = pickSurface(e.clientX, e.clientY); if (!p) return;
  const tool = TOOLS.find(t => t.id === EDIT.tool);
  if (tool.brush) { if (!GAME.openAt(p.x, p.z) && EDIT.tool !== 'clear') UI.toast(GAME.lockText(p.x, p.z)); EDIT.down = true; strokeStart(p); strokeApply(p, 0.016); }
  else if (EDIT.tool === 'road') addRoadNode(p);
  else if (EDIT.tool === 'unroad') { if (EDIT.uroad) removeUserRoad(EDIT.uroad); else UI.toast('あなたが作った道路をクリックしてね'); }
  else if (EDIT.tool === 'plant') plantTree(p);
  else if (EDIT.tool === 'house') GAME.housePick(p);
  else if (EDIT.tool === 'decor') GAME.decorClick(p);
  else if (EDIT.tool === 'build') GAME.buildPick(p);
}
function editPointerUp() { if (EDIT.down) { EDIT.down = false; strokeEnd(); } }
function setTool(id) { if (id === 'house' && !GAME.canUse('tool', id)) { UI.toast('家を建てられるのは、島に住みたい人が見学に来ているときです'); return; } if (id !== 'house') { EDIT.housePick = null; if (LIFE.ghost) LIFE.ghost.visible = false; } if (id !== 'build') { EDIT.buildPick = null; if (typeof DV !== 'undefined' && DV.ghost) DV.ghost.visible = false; if (GAME.placing && id !== 'build') GAME.placing = null; } if (id !== 'decor') { if (DECO.ghost) DECO.ghost.visible = false; if (EDIT.decorRemove) { EDIT.decorRemove = false; GAME.decorPreview(null); } } if (!GAME.canUse('tool', id)) { UI.toast(`「${TOOLS.find(t => t.id === id).name}」は元気度Lv${TOOL_LV[id]}で使えるようになります`); return; } EDIT.tool = id; if (id !== 'road') { EDIT.nodes = []; updateRoadPreview(null); } UI.editPanel(); }
function toggleEdit(on) {
  EDIT.on = on === undefined ? !EDIT.on : on;
  if (EDIT.on) { if (PL.veh) { EDIT.on = false; UI.toast('乗り物をおりてから使ってね'); return; } GAME.endFish && GAME.endFish(); if (CAM.mode === 'first') setViewMode('third'); CAM.distT = 26; CAM.pitch = 0.85; UI.toast('しまづくり：左ドラッグで編集、右ドラッグで見回す'); }
  else { CAM.distT = 5.2; CAM.pitch = 0.24; EDIT.nodes = []; updateRoadPreview(null); editPointerUp(); EDIT.housePick = null; if (EDIT.tool === 'house' || EDIT.tool === 'build') EDIT.tool = 'raise'; EDIT.buildPick = null; if (GAME.placing) { GAME.placing = null; UI.toast('場所はあとで「島の開発」（P）から決められます'); } if (typeof DV !== 'undefined' && DV.ghost) DV.ghost.visible = false; if (EDIT.decorRemove) { EDIT.decorRemove = false; GAME.decorPreview(null); } }
  UI.editPanel();
}
