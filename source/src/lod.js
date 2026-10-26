// ===================== 軽さ: 木のLOD（近くの木だけ細かく・影も近くだけ） =====================
// Every tree used to be drawn at full detail (a broadleaf is ~3,000–5,000 triangles of leaf puffs) and every tree in a 144 m block
// went into the shadow map too, even far outside the shadow area. On a wooded hill that was ~2 million triangles a frame.
// Now three steps, decided by the distance from you:
//   near  (< ~26 m)  full detail, casts shadows
//   mid   (< ~55 m)  leaf puffs with a quarter of the triangles, casts shadows (the shadow map covers ~45 m around you)
//   far              the same light puffs, a simple trunk without branches, no shadow
const LOD = { on: true, T0: 24, T1: 28, R0: 52, R1: 58, ready: false, near: {}, mid: {}, items: [], cx: 1e9, cz: 1e9, t: 0, zero: new THREE.Matrix4().makeScale(0, 0, 0), sig: 's0', CAP: 420 };
LOD.SEEDS = { broad: [100, 101, 102, 103], pine: [200, 201], mikan: [300], bush: [400, 401] };
LOD.prep = gs => mergeGeometries(gs.map(g => { const c = g.index ? g.toNonIndexed() : g; if (c.attributes.color && !c.userData.keepColor) { } if (!c.attributes.uv) c.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(c.attributes.position.count * 2), 2)); return c; }));
LOD.lowParts = function (kind, vi, detail = 1) {
  const prev = VEG.clumpDetail; VEG.clumpDetail = detail;
  try { const NAT = { sakura: typeof makeSakura === 'function' && makeSakura, momiji: typeof makeMomiji === 'function' && makeMomiji, bamboo: typeof makeBamboo === 'function' && makeBamboo, palm: typeof makePalm === 'function' && makePalm };
    const V = LOD.SEEDS[kind] ? makeTreeVariant(kind, LOD.SEEDS[kind][vi]) : NAT[kind] ? NAT[kind](1000 + vi * 17 + kind.length * 101) : null; if (!V) return {};
    const out = {}; if (V.clumps && V.clumps.length) out.clumps = LOD.prep(V.clumps);
    // far trunk: only the main stem (branches are hidden under the leaves at a distance); bamboo and palms keep all their stems
    if (V.bark && V.bark.length > 1 && kind !== 'bamboo' && kind !== 'palm') { const t = V.bark[0].index ? V.bark[0].toNonIndexed() : V.bark[0]; if (t.attributes.color) t.deleteAttribute('color'); if (!t.attributes.uv) t.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(t.attributes.position.count * 2), 2)); out.bark = mergeGeometries([t]); }
    return out; }
  finally { VEG.clumpDetail = prev; }
};
LOD.init = function () {
  LOD.ready = false; if (!VEG.sets || !VEG.partGeos || !VEG.fmats) return;
  const geoInfo = new Map();
  for (const key in VEG.partGeos) VEG.partGeos[key].forEach(([geo, mat, shadow], j) => geoInfo.set(geo, { key, j, mat, shadow, fol: VEG.fmats[key] && mat === VEG.fmats[key].fol }));
  const low = {};
  for (const key in VEG.partGeos) { const kind = key.replace(/\d+$/, ''), vi = +key.slice(kind.length); if (LOD.SEEDS[kind] && LOD.SEEDS[kind][vi] === undefined) continue; try { low[key] = LOD.lowParts(kind, vi); const l0 = LOD.lowParts(kind, vi, 0); low[key].clumps0 = l0.clumps; } catch (e) { console.warn('lod low', key, e); } }
  const lowFor = (key, j, fol) => { const L = low[key] || {}; return fol ? L.clumps : (j === 0 ? L.bark : null); };
  // far blocks: light puffs and trunk, no shadows; remember where each tree sits in them
  const items = new Set();
  for (const st of VEG.sets) { if (st.kind !== 'tree') continue; const inf = geoInfo.get(st.mesh.geometry) || st.lodInfo; if (!inf) continue; st.lodInfo = inf;
    const lg = lowFor(inf.key, inf.j, inf.fol); if (lg) st.mesh.geometry = lg; st.geo1 = st.mesh.geometry; st.geo0 = inf.fol && low[inf.key] && low[inf.key].clumps0 || null;
    st.mesh.castShadow = false;
    st.items.forEach((it, i) => { if (!it._far || it._farSig !== LOD.sig) { it._far = []; it._farSig = LOD.sig; } it._far.push([st, i]); it._key = inf.key; it._lod = 0; items.add(it); }); }
  LOD.items = [...items]; LOD.farSets = VEG.sets.filter(st => st.kind === 'tree' && st.geo0);
  for (const T of [LOD.near, LOD.mid]) for (const k in T) for (const m of T[k]) { m.parent && m.parent.remove(m); m.dispose && m.dispose(); }
  LOD.near = {}; LOD.mid = {};
  const mk = (geo, mat, shadow, key) => { const m = new THREE.InstancedMesh(geo, mat, LOD.CAP); m.count = 0; m.castShadow = shadow; m.receiveShadow = true; m.frustumCulled = false; m.userData.paint = VEG.fmats[key] && (mat === VEG.fmats[key].fol || mat === VEG.fmats[key].card); (VEG.group || scene).add(m); return m; };
  for (const key in VEG.partGeos) {
    LOD.near[key] = VEG.partGeos[key].map(([geo, mat, shadow]) => mk(geo, mat, shadow, key));
    LOD.mid[key] = VEG.partGeos[key].map(([geo, mat, shadow], j) => { const fol = VEG.fmats[key] && mat === VEG.fmats[key].fol; return mk(fol && low[key] && low[key].clumps ? low[key].clumps : geo, mat, shadow, key); });
  }
  // give every leaf mesh its per-tree colour buffer from the start (adding it later changes the shader and costs a pause)
  for (const st of VEG.sets) if (st.kind === 'tree' && !st.mesh.instanceColor && VEG.fmats[st.lodInfo && st.lodInfo.key] && (st.mesh.material === VEG.fmats[st.lodInfo.key].fol || st.mesh.material === VEG.fmats[st.lodInfo.key].card)) { const w = new THREE.Color('#ffffff'); for (let i = 0; i < st.mesh.instanceMatrix.count; i++) st.mesh.setColorAt(i, w); st.mesh.instanceColor.needsUpdate = true; }
  for (const T of [LOD.near, LOD.mid]) for (const k in T) for (const m of T[k]) if (m.userData.paint && !m.instanceColor) { const w = new THREE.Color('#ffffff'); for (let i = 0; i < LOD.CAP; i++) m.setColorAt(i, w); }
  LOD.cx = LOD.cz = 1e9; LOD.ready = true; LOD.update(true);
};
// a tree drawn by the near/mid meshes is hidden in its far block (VEG.refresh rewrites the far blocks: keep it hidden there)
{ const _vm = vegMatrix; LOD.vm = _vm; vegMatrix = function (it, vis) { if (it && it._lod && LOD.ready) return LOD.zero; return _vm(it, vis); }; }
LOD.update = function (force) {
  if (!LOD.ready || !LOD.on) return; const px = PL.x, pz = PL.z, ksig = typeof KOYO !== 'undefined' ? KOYO.sig : '';
  if (!force && Math.hypot(px - LOD.cx, pz - LOD.cz) < 2 && LOD.colSig === ksig) return;
  LOD.cx = px; LOD.cz = pz; const q = v => v * v, A0 = q(LOD.T0), A1 = q(LOD.T1), B0 = q(LOD.R0), B1 = q(LOD.R1), lists = [{}, {}, {}], dirty = new Set(); let changed = !!force;
  for (const it of LOD.items) {
    const d = (it.x - px) ** 2 + (it.z - pz) ** 2, ok = !VEG.removed[it.id] && vegValid(it);
    let want = !ok ? 0 : d < (it._lod === 2 ? A1 : A0) ? 2 : d < (it._lod >= 1 ? B1 : B0) ? 1 : 0;
    while (want && lists[want][it._key] && lists[want][it._key].length >= LOD.CAP) want--;
    if (want !== it._lod) { const wasFar = !it._lod; it._lod = want; changed = true; if (wasFar !== !want) { for (const [st, i] of it._far) { st.mesh.setMatrixAt(i, want ? LOD.zero : LOD.vm(it, ok)); dirty.add(st); } } }
    if (want) (lists[want][it._key] = lists[want][it._key] || []).push(it);
  }
  for (const st of dirty) st.mesh.instanceMatrix.needsUpdate = true;
  // far blocks wholly beyond ~100 m: the lightest puffs (a block is 144 m wide, so this is decided per block)
  for (const st of LOD.farSets || []) { const dx = Math.max(st.x0 - 8 - px, 0, px - st.x1 - 8), dz = Math.max(st.z0 - 8 - pz, 0, pz - st.z1 - 8), g = Math.hypot(dx, dz) > 100 ? st.geo0 : st.geo1; if (g && st.mesh.geometry !== g) st.mesh.geometry = g; }
  if (!changed && ksig === LOD.colSig) return; LOD.colSig = ksig;
  const c = new THREE.Color(), paintOK = typeof KOYO !== 'undefined' && KOYO.doy >= 0 && typeof KOYO.col === 'function';
  for (const [T, L] of [[LOD.near, lists[2]], [LOD.mid, lists[1]]]) for (const key in T) { const list = L[key] || [];
    for (const m of T[key]) { const n = Math.min(list.length, LOD.CAP);
      for (let i = 0; i < n; i++) { m.setMatrixAt(i, LOD.vm(list[i], true)); if (m.userData.paint) m.setColorAt(i, paintOK ? KOYO.col(list[i], KOYO.doy, c) : c.set('#ffffff')); }
      m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } }
  LOD.nearN = Object.values(lists[2]).reduce((a, l) => a + l.length, 0); LOD.midN = Object.values(lists[1]).reduce((a, l) => a + l.length, 0);
};
{ const _b = buildVegetation; buildVegetation = function () { const r = _b.apply(this, arguments); try { LOD.sig = 's' + Math.random(); LOD.init(); } catch (e) { console.warn('lod', e); } return r; }; }
{ const _u = updateStructures; updateStructures = function (t, night) { const r = _u.apply(this, arguments); try { const now = performance.now(); if (now - LOD.t > 250) { LOD.t = now; LOD.update(); } } catch (e) { if (!LOD._err) { LOD._err = 1; console.warn('lod', e); } } return r; }; }
// cutting / planting refreshes blocks: re-check the near trees there
{ const _r = VEG.refresh; VEG.refresh = function () { const r = _r.apply(this, arguments); try { LOD.update(true); } catch (e) { } return r; }; }
// ---------- 田んぼ・道ばたの小物: ~800 meshes → one mesh per material per 128 m block (they were all separate draw calls) ----------
{ const _cb = CTRY.build; CTRY.build = function () { const r = _cb.apply(this, arguments);
  try { const g = CTRY.group; if (g && g.parent) { g.updateMatrixWorld(true); g.traverse(o => { if (o.isSprite || o.isPoints) o.userData.keep = true; }); const m = mergeStatic(g); m.name = 'ctry'; scene.remove(g); scene.add(m); CTRY.group = m; CTRY.mergedN = m.children.length; } } catch (e) { console.warn('ctry merge', e); }
  return r; }; }
