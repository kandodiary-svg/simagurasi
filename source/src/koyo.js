// ===================== 紅葉: 木ごとに色がちがう（常緑樹は緑のまま、落葉樹が少しずつ色づく） =====================
// Seto Inland Sea islands are mostly evergreen broadleaf (シイ・カシ・クスノキ), so most trees stay green all year.
// About 4 in 10 broadleaf trees are deciduous (ハゼ・コナラ・ヤマザクラ…): each turns on its own day between late October and
// late November — yellow, orange or red — then browns before winter. Every tree also gets a slight colour of its own.
const KOYO = { doy: -1 };
KOYO.h = (n) => { let x = (n * 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
KOYO.col = function (it, doy, out) {
  const id = it.id !== undefined ? it.id : Math.floor((it.x * 73.1 + it.z * 19.7) * 10), a = KOYO.h(id + 1), b = KOYO.h(id + 7), c = KOYO.h(id + 13);
  // everyone: a little brighter / darker, a little yellower / bluer
  out.setRGB(0.9 + a * 0.16, 0.9 + b * 0.14, 0.86 + c * 0.16);
  if (it.kind === 'momiji') { if (doy >= 288 && doy <= 350) out.g *= 0.72 + b * 0.42; return out; } // maples: some redder, some more orange than their neighbours
  if (it.kind !== 'broad' || a > 0.4) return out;
  const start = 293 + Math.floor(b * 26), peak = start + 16 + Math.floor(c * 8), brown = peak + 18; // day-of-year: from ~10/20
  const d = doy < 90 ? doy + 365 : doy;
  let k = d < start ? 0 : d < peak ? (d - start) / (peak - start) : 1; k = k * k * (3 - 2 * k);
  const T = c < 0.4 ? [1.55, 1.08, 0.32] : c < 0.75 ? [1.6, 0.78, 0.3] : [1.62, 0.45, 0.3];
  let r = out.r + (T[0] - out.r) * k, g = out.g + (T[1] - out.g) * k, bl = out.b + (T[2] - out.b) * k;
  if (d > brown) { const q = Math.min(1, (d - brown) / 20); r += (0.95 - r) * q; g += (0.62 - g) * q; bl += (0.4 - bl) * q; }
  return out.setRGB(r, g, bl);
};
KOYO.apply = function (doy) {
  if (!VEG.sets || !VEG.fmats) return; const sig = doy + ':' + VEG.sets.length + ':' + (VEG.userTrees || []).length; if (sig === KOYO.sig) return; KOYO.sig = sig; KOYO.doy = doy;
  const fol = new Set(); for (const k in VEG.fmats) { fol.add(VEG.fmats[k].fol); fol.add(VEG.fmats[k].card); }
  const c = new THREE.Color();
  const paint = (mesh, list) => { if (!mesh || !fol.has(mesh.material) || !list || !list.length) return; for (let i = 0; i < list.length && i < mesh.count; i++) mesh.setColorAt(i, KOYO.col(list[i], doy, c)); if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  for (const st of VEG.sets) if (st.kind === 'tree') paint(st.mesh, st.items);
  for (const key in VEG.userSets || {}) { const list = (VEG.userTrees || []).filter(t => t.key === key); for (const st of VEG.userSets[key] || []) if (st && st.mesh) paint(st.mesh, list); }
};
// planted trees get their colours too
{ const _r = VEG.rebuildUser; if (_r) VEG.rebuildUser = function () { const r = _r.apply(this, arguments); try { if (KOYO.doy >= 0) { KOYO.sig = ''; KOYO.apply(KOYO.doy); } } catch (e) { } return r; }; }
