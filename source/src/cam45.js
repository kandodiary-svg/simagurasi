// ===================== ver.45: buildings tell the camera how tall they are =====================
// (the camera used to treat every building as ~9 m tall: next to the high-rises it ended up inside them)
queueMicrotask(() => {
  const topOf = (g, base) => { g.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(g); return isFinite(box.max.y) ? base + box.max.y : null; };
  for (const k of Object.keys(CB_BUILD)) { const f = CB_BUILD[k]; CB_BUILD[k] = function (g, b) { const C = CITY.curChunk, n0 = C ? C.colls.length : 0, r = f.apply(this, arguments);
    try { if (C && g) { const top = topOf(g, b.y || 0); if (top !== null) for (const c of C.colls.slice(n0)) if (c.top === undefined) c.top = top; } } catch (e) { } return r; }; }
  for (const k of Object.keys(DEV_BUILD)) { const f = DEV_BUILD[k]; DEV_BUILD[k] = function () { const n0 = DV.track.length, g = f.apply(this, arguments);
    try { if (g && g.isObject3D) { const top = topOf(g, 0); if (top !== null) for (const c of DV.track.slice(n0)) if (c.top === undefined) c.top = top; } } catch (e) { } return g; }; }
});
// the view you chose last time (うしろから / 見おろし / 目線) comes back when you open the island
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { const v = localStorage.getItem('hoshinami_view'); if (v === 'top' || v === 'first') setViewMode(v); else CAM.style = 'back'; } catch (e) { } return r; }; }
