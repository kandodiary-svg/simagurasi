// ===================== ver.41: 勝手にできる畑をやめる =====================
// The island used to lay out fields by itself: four rice paddies around the village (countryside.js) and a set of terraced
// paddies with a vegetable plot (nature.js). Out of season they were bare brown boxes that read as "mystery fields", and the
// four paddies moved whenever the ground was reshaped. They are gone; your own garden by the house stays.
CTRY.buildPaddies = function () { CTRY.paddies = []; };
NATURE.makeFarm = function () { NATURE.paddies = []; NATURE.farmAt = null; };
// grass and trees that the old paddies had cleared come back (once per island; only inside where those paddies stood)
const FIX41 = {};
FIX41.restore = function () {
  const p = GAME.p; if (!p || p.fix41veg || !VEG.items || !VEG.removed) return; p.fix41veg = 1; GAME.dirty = true;
  let rects = []; try { rects = FIX41.oldPaddies(); } catch (e) { return; }
  let n = 0, x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
  for (const q of rects) { const c = Math.cos(q.rot), s = Math.sin(q.rot);
    for (const it of VEG.items) { if (!VEG.removed[it.id]) continue; const dx = it.x - q.x, dz = it.z - q.z, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < q.W / 2 + 1.9 && Math.abs(lz) < q.L / 2 + 1.9) { VEG.removed[it.id] = 0; n++; x0 = Math.min(x0, it.x); z0 = Math.min(z0, it.z); x1 = Math.max(x1, it.x); z1 = Math.max(z1, it.z); } } }
  if (n) { VEG.refresh(x0 - 2, z0 - 2, x1 + 2, z1 + 2); try { scheduleSave(); } catch (e) { } } FIX41.restored = n;
};
// where the four paddies would have been (the same search the old code ran)
FIX41.oldPaddies = function () { return CTRY.findPaddies ? CTRY.findPaddies() : []; };
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { FIX41.restore(); } catch (e) { console.warn('fix41', e); } return r; }; }
// Hana used to water the paddies in the afternoon: now she tends her own garden
{ const _pl = LIVE.place; LIVE.place = function (n, key) { if (key === 'farm' && !NATURE.farmAt) return _pl.call(this, n, 'garden'); return _pl.apply(this, arguments); }; }
// the photo spot of the paddies becomes "your field"
{ const i = PHOTO.SPOTS.findIndex(s => s.id === 'paddy'); if (i >= 0) PHOTO.SPOTS[i] = { id: 'myfield', name: '自分の畑', hint: '家のよこの自分の畑を写す', ok: () => { const g = GAME.p && GAME.p.garden; return !!(g && g.x !== undefined && PHOTO.inView(g.x, groundH(g.x, g.z) + 0.3, g.z, 40)); } }; }
