// ===================== 街づくり: 物語クリア後、お金を払えば何度でも建てられる =====================
const CITY = { list: [], chunks: new Map(), anims: [], curB: null, rotOff: 0, type: 'hotelL', cat: 'stay', mode: 'build', CH: 160, t: 0 };
TOOLS.push({ id: 'city', name: '街づくり', icon: '🏙️', key: 'Y', hint: '建てたい建物をえらんで、場所をクリック（R で向きを変える）。物語クリア後、お金を払えば何度でも建てられます', brush: false });
TOOL_LV.city = 7;
CITY.unlocked = () => !!(GAME.p && STORY.st().ch >= 7); // after part 1 (第一部) of the story
CITY.addAnim = a => { a.b = CITY.curB; CITY.anims.push(a); if (CITY.curChunk) CITY.curChunk.anims.push(a); return a; };
// ---------- shared materials / textures so that many buildings cost few draw calls ----------
{ const _wm = worldMat; worldMat = function (map, scale) { const m = _wm.apply(this, arguments); m.userData.wm = (map ? map.uuid : '-') + ':' + scale; return m; }; }
{ const _hg = hrGlow; hrGlow = function (m) { m.userData.glow = 1; return _hg(m); }; }
{ const cache = new Map(), _ft = facadeTex; facadeTex = function (o) { if (!CITY.building) return _ft(o); const k = JSON.stringify(Object.assign({}, o, { seed: (o.seed || 0) % 3 })); if (!cache.has(k)) cache.set(k, _ft(o)); return cache.get(k); }; }
{ const cache = new Map(), _hs = hrSign; hrSign = function (text, w, h, bg, fg) { if (!CITY.building) return _hs(text, w, h, bg, fg); const k = [text, w, h, bg, fg].join('|'); let m = cache.get(k); if (!m) { m = _hs(text, w, h, bg, fg); cache.set(k, m); } return new THREE.Mesh(m.geometry, m.material); }; }
const CMAT = new Map();
function cityMatKey(m) {
  if (!m || !m.isMaterial || (!m.isMeshStandardMaterial && !m.isMeshBasicMaterial)) return null; if (Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile') && !m.userData.wm) return null;
  return [m.type, m.color.getHex(), m.roughness, m.metalness, m.emissive ? m.emissive.getHex() : 0, m.emissiveIntensity, m.map ? m.map.uuid : '', m.emissiveMap ? m.emissiveMap.uuid : '', m.transparent ? 1 : 0, m.opacity, m.side, m.userData.wm || '', m.userData.glow ? 1 : 0, m.depthWrite ? 1 : 0].join('|');
}
function cityDedupe(root) { root.traverse(o => { if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || (o.material.transparent && !CITY.building)) return; const k = cityMatKey(o.material); if (!k) return; const c = CMAT.get(k); if (c) o.material = c; else CMAT.set(k, o.material); }); }
// ---------- building & drawing by area (one merged mesh set per 160 m square) ----------
const cityKey = b => Math.floor(b.x / CITY.CH) + ',' + Math.floor(b.z / CITY.CH);
CITY.buildChunk = function (key) {
  const old = CITY.chunks.get(key); if (old) { scene.remove(old.group); old.group.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose(); }); old.colls.forEach(c => c.off = true); CITY.anims = CITY.anims.filter(a => !old.anims.includes(a)); CITY.chunks.delete(key); }
  const items = CITY.list.filter(b => cityKey(b) === key); if (!items.length) return;
  const root = new THREE.Group(), ch = { colls: [], anims: [], group: null }; CITY.curChunk = ch; COLL.track = ch.colls; CITY.building = true;
  for (const b of items) { const T = CITY_TYPES[b.t], f = CB_BUILD[b.t]; if (!T || !f) continue; const g = new THREE.Group(); CITY.curB = b; try { f(g, b, mulberry(b.seed || 1)); } catch (e) { console.warn('city', b.t, e); } bldPlace(g, b); root.add(g); }
  CITY.building = false; COLL.track = null; CITY.curB = null; CITY.curChunk = null; root.updateMatrixWorld(true); cityDedupe(root);
  const merged = mergeLocal(root); scene.add(merged); ch.group = merged; CITY.chunks.set(key, ch);
};
CITY.rebuildAll = function () { for (const k of [...CITY.chunks.keys()]) CITY.buildChunk(k); CITY.anims = []; const keys = new Set(CITY.list.map(cityKey)); for (const k of keys) CITY.buildChunk(k); CITY.crowdPlan(); CITY.trafficPlan(); GAME.mapDirty = true; };
CITY.load = function () { CITY.list = (GAME.p && GAME.p.city) || []; for (const k of [...CITY.chunks.keys()]) { const c = CITY.chunks.get(k); scene.remove(c.group); c.colls.forEach(q => q.off = true); } CITY.chunks.clear(); CITY.anims = []; CITY.rebuildAll(); };
// ---------- placing ----------
CITY.planAt = function (id, p, rot) {
  const T = CITY_TYPES[id]; if (!T || !p) return null; let r = rot;
  if (r === undefined || r === null) { const nr = nearestOnRoads(p.x, p.z, 70, false); r = (nr && nr.d > 1 ? Math.atan2(nr.x - p.x, nr.z - p.z) : 0) + CITY.rotOff; }
  const o = { x: p.x, z: p.z, rot: r }; let mn = 1e9, mx = -1e9, sum = 0, cnt = 0, err = null;
  for (let a = -T.w / 2; a <= T.w / 2 + 0.01 && !err; a += 2) for (let b = -T.d / 2; b <= T.d / 2 + 0.01 && !err; b += 2) {
    const [x, z] = toWorld(o, a, b), [i, j] = toIdx(x, z), k = j * WORLD.n + i, h = G.H[k];
    if (Math.abs(x) > 330 || Math.abs(z) > 330) err = '島の外です'; else if (!GAME.openK(k)) err = GAME.lockText(x, z); else if (G.prot[k]) err = 'ほかの建物に近すぎます'; else if (G.roadDist[k] < 3.6) err = '道路にかかっています';
    else if (h < 0.8 || !isNaN(G.Wl[k])) err = '水辺や海の上には建てられません'; else if (typeof brHit === 'function' && brHit(x, z, 1e6)) err = '橋にかかっています';
    else if (collidersNear(x, z).some(q => !q.off && (q.kind === 'bld' || q.kind === 'pole' || q.kind === 'farm') && hitsCollider(q, x, z, 0.3))) err = 'ほかの建物にぶつかります';
    else if (CITY.at({ x, z }, 1.5)) err = 'ほかの建物にぶつかります（街）';
    mn = Math.min(mn, h); mx = Math.max(mx, h); sum += h; cnt++; }
  if (!err && mx - mn > (T.w * T.d > 1500 ? 10 : 7)) err = '坂が急すぎます（「平らに」でならしてね）';
  return { ok: !err, err, x: p.x, z: p.z, rot: r, y: Math.max(0.9, sum / cnt), id };
};
CITY.place = function (pl, pay = true) {
  const T = CITY_TYPES[pl.id], p = GAME.p; if (!T || !p) return false; if (pay) { if (p.money < T.price) { UI.toast(`お金がたりません（${yen(T.price)} 必要）`); return false; } p.money -= T.price; }
  flattenPad(pl.x, pl.z, T.w / 2 + 1.0, T.d / 2 + 1.0, pl.rot, pl.y, 6); const R = Math.max(T.w, T.d) / 2 + 10, [i0, j0] = toIdx(pl.x - R, pl.z - R), [i1, j1] = toIdx(pl.x + R, pl.z + R); refreshRegion(i0, j0, i1, j1, { veg: false });
  if (VEG.removeAt(pl.x, pl.z, Math.hypot(T.w, T.d) / 2 + 1)) VEG.refresh(pl.x - R, pl.z - R, pl.x + R, pl.z + R);
  const b = { t: pl.id, x: +pl.x.toFixed(2), z: +pl.z.toFixed(2), rot: +pl.rot.toFixed(4), y: +(pl.y + 0.05).toFixed(2), seed: Math.floor(Math.random() * 1e6) }; CITY.list.push(b); p.city = CITY.list;
  if (pay) { CITY.buildChunk(cityKey(b)); CITY.crowdPlan(); CITY.trafficPlan(); EDIT.undo = []; scheduleSave(); GAME.dirty = true; GAME.save(); GAME.renderTracker(); GAME.mapDirty = true; UI.toast(`${T.icon} ${T.name}ができました！${T.tour ? ` 観光 +${T.tour}` : ''}${T.res ? ` 島民 +${T.res}人` : ''}`); }
  return b;
};
CITY.at = function (p, m = 0) { if (!p) return null; for (let i = CITY.list.length - 1; i >= 0; i--) { const b = CITY.list[i], T = CITY_TYPES[b.t], dx = p.x - b.x, dz = p.z - b.z, c = Math.cos(b.rot), s = Math.sin(b.rot), lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < T.w / 2 + m && Math.abs(lz) < T.d / 2 + m) return b; } return null; };
CITY.remove = function (b) { const T = CITY_TYPES[b.t], p = GAME.p; CITY.list = CITY.list.filter(q => q !== b); p.city = CITY.list; p.money += Math.floor(T.price / 2); CITY.buildChunk(cityKey(b)); CITY.crowdPlan(); CITY.trafficPlan(); GAME.dirty = true; GAME.save(); GAME.renderTracker(); GAME.mapDirty = true; UI.toast(`${T.name}をこわしました（${yen(Math.floor(T.price / 2))} もどりました）`); };
// ---------- effects on the island ----------
{ const _t = GAME.tourism; GAME.tourism = function () { let n = _t.apply(this, arguments); for (const b of CITY.list) n += (CITY_TYPES[b.t] && CITY_TYPES[b.t].tour) || 0; return n; }; }
{ const _e = extraResidents; extraResidents = function () { let n = _e(); for (const b of CITY.list) n += (CITY_TYPES[b.t] && CITY_TYPES[b.t].res) || 0; return n; }; }
{ const _rk = STORY.rank; STORY.rank = function () { const n = CITY.list.length; if (n >= 80) return '世界一の観光都市'; if (n >= 40) return 'アジア有数のリゾート都市'; if (n >= 15) return 'にぎわうリゾート都市'; return _rk.apply(this, arguments); }; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { CITY.load(); } catch (e) { console.warn('city load', e); } return r; }; }
{ const _ra = GAME.resetAll; GAME.resetAll = function () { const r = _ra.apply(this, arguments); CITY.list = []; CITY.load(); return r; }; }
// ---------- edit-mode tool ----------
CITY.ghost = function () { if (CITY.gh) return CITY.gh; const m = new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.38, depthWrite: false, fog: false }); const g = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m); g.geometry.translate(0, 0.5, 0); g.renderOrder = 41; scene.add(g);
  const ar = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.6, 12), new THREE.MeshBasicMaterial({ color: '#ffd84a', fog: false })); ar.rotation.x = Math.PI / 2; scene.add(ar); return CITY.gh = { g, m, ar }; };
CITY.preview = function (p) {
  const gh = CITY.ghost(), T = CITY_TYPES[CITY.type]; let hint;
  if (!CITY.unlocked()) { gh.g.visible = gh.ar.visible = false; hint = '🔒 街づくりは、物語をクリア（島のランク「瀬戸内一のあこがれの島」）すると使えるようになります'; }
  else if (CITY.mode === 'remove') { gh.ar.visible = false; const b = CITY.at(p); CITY.hl = b; if (b) { const Tb = CITY_TYPES[b.t]; gh.g.visible = true; gh.g.scale.set(Tb.w, Math.min(Tb.h, 40), Tb.d); gh.g.position.set(b.x, b.y, b.z); gh.g.rotation.y = b.rot; gh.m.color.set('#ff6f6f'); hint = `${Tb.icon} ${Tb.name}　クリックでこわす（${yen(Math.floor(Tb.price / 2))} もどる）`; } else { gh.g.visible = false; hint = 'こわしたい建物をクリックしてね'; } }
  else { const pl = p ? CITY.planAt(CITY.type, p) : null; CITY.plan = pl; if (!pl) { gh.g.visible = gh.ar.visible = false; hint = `${T.icon} ${T.name}（${yen(T.price)}）：建てる場所をクリック`; }
    else { gh.g.visible = gh.ar.visible = true; gh.g.scale.set(T.w, Math.min(T.h, 40), T.d); gh.g.position.set(pl.x, pl.y, pl.z); gh.g.rotation.y = pl.rot; const [ax, az] = toWorld(pl, 0, T.d / 2 + 2); gh.ar.position.set(ax, pl.y + 1.5, az); gh.ar.rotation.set(Math.PI / 2, 0, -pl.rot); gh.ar.rotation.order = 'YXZ'; gh.ar.rotation.y = pl.rot;
      const rich = GAME.p.money >= T.price; gh.m.color.set(pl.ok && rich ? '#7cf0a0' : '#ff6f6f'); hint = !pl.ok ? '⚠ ' + pl.err : !rich ? `⚠ お金がたりません（${yen(T.price)}）` : `${T.icon} ${T.name}　${yen(T.price)}　クリックで建てる（R で向きを変える・黄色の矢印が正面）`; } }
  if (EDIT._ch !== hint) { EDIT._ch = hint; UI.editHint(); }
};
CITY.click = function (p) {
  if (!CITY.unlocked()) { UI.toast('街づくりは、物語をクリアすると使えるようになります'); return; }
  if (CITY.mode === 'remove') { const b = CITY.at(p); if (b) CITY.remove(b); return; }
  const pl = CITY.planAt(CITY.type, p); if (!pl) return; if (!pl.ok) { UI.toast(pl.err); return; } CITY.place(pl, true); UI.editPanel();
};
CITY.hideGhost = () => { if (CITY.gh) { CITY.gh.g.visible = false; CITY.gh.ar.visible = false; } };
{ const _u = updateEdit; updateEdit = function (dt) { _u(dt); if (EDIT.on && EDIT.tool === 'city') CITY.preview(EDIT.hover); else CITY.hideGhost(); }; }
{ const _d = editPointerDown; editPointerDown = function (e) { if (EDIT.tool === 'city') { const p = pickSurface(e.clientX, e.clientY); if (p) CITY.click(p); return; } return _d(e); }; }
{ const _h = UI.editHint; UI.editHint = function () { const h = document.getElementById('editHint'); if (h && EDIT.on && EDIT.tool === 'city') { h.textContent = EDIT._ch || TOOLS.find(t => t.id === 'city').hint; return; } return _h.apply(this, arguments); }; }
{ const _p = UI.editPanel; UI.editPanel = function () { _p.apply(this, arguments); if (!EDIT.on || EDIT.tool !== 'city') return; const sb = document.querySelector('#editp .sub'); if (!sb) return;
  if (!CITY.unlocked()) { sb.insertAdjacentHTML('afterbegin', '<span class="small">🔒 物語をクリアすると、ホテル・タワー・遊園地などを何度でも建てられるようになります</span>'); return; }
  const items = Object.entries(CITY_TYPES).filter(([, T]) => T.cat === CITY.cat), money = GAME.p.money;
  sb.insertAdjacentHTML('afterbegin', `<div class="citysub"><div class="seg">${CITY_CATS.map(([k, n]) => `<button data-cc="${k}" class="${CITY.mode === 'build' && CITY.cat === k ? 'on' : ''}">${n}</button>`).join('')}<button data-cc="__rm" class="${CITY.mode === 'remove' ? 'on' : ''}">🔨 こわす</button></div>
    <div class="citems">${items.map(([k, T]) => `<button data-ct="${k}" class="${CITY.mode === 'build' && CITY.type === k ? 'on' : ''} ${money >= T.price ? '' : 'poor'}" title="${T.note}"><span class="ci">${T.icon}</span><b>${T.name}</b><i>${yen(T.price)}${T.tour ? ` ・観光+${T.tour}` : ''}${T.res ? ` ・島民+${T.res}` : ''}</i></button>`).join('')}</div><span class="small">建てた数 ${CITY.list.length}　所持金 ${yen(money)}</span></div>`);
  sb.querySelectorAll('[data-cc]').forEach(el => el.onclick = e => { e.stopPropagation(); const k = el.dataset.cc; if (k === '__rm') CITY.mode = CITY.mode === 'remove' ? 'build' : 'remove'; else { CITY.cat = k; CITY.mode = 'build'; const f = Object.entries(CITY_TYPES).find(([, T]) => T.cat === k); if (f && CITY_TYPES[CITY.type].cat !== k) CITY.type = f[0]; } EDIT._ch = null; UI.editPanel(); document.getElementById('c').focus(); });
  sb.querySelectorAll('[data-ct]').forEach(el => el.onclick = e => { e.stopPropagation(); CITY.type = el.dataset.ct; CITY.mode = 'build'; EDIT._ch = null; UI.editPanel(); document.getElementById('c').focus(); }); }; }
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' || !EDIT.on || e.repeat) return; if (e.code === 'KeyY') setTool('city'); if (e.code === 'KeyR' && EDIT.tool === 'city') { CITY.rotOff = (CITY.rotOff + Math.PI / 2) % (Math.PI * 2); EDIT._ch = null; } });
{ const st = document.createElement('style'); st.textContent = `#game .citysub{display:flex;flex-direction:column;gap:6px;width:100%}#game .citems{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
#game .citems button{flex:0 0 auto;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:6px;align-items:center;text-align:left;padding:6px 10px;border-radius:12px;background:#fff;border:2px solid transparent;font-size:12px;min-width:150px}
#game .citems button .ci{grid-row:1/3;font-size:22px}#game .citems button b{font-size:12.5px}#game .citems button i{font-style:normal;font-size:11px;color:#5a6a72}#game .citems button.on{border-color:#3f8f5a;background:#eaf7ee}#game .citems button.poor{opacity:.55}`; document.head.appendChild(st); }
// ---------- moving rides ----------
const _ce = new THREE.Euler(), _cq = new THREE.Quaternion(), _cq2 = new THREE.Quaternion(), _cm = new THREE.Matrix4(), _cv = new THREE.Vector3(), _cs = new THREE.Vector3(1, 1, 1), _cY = new THREE.Vector3(0, 1, 0), _cZ = new THREE.Vector3(0, 0, 1);
const cityW = (b, lx, ly, lz) => { const c = Math.cos(b.rot), s = Math.sin(b.rot); return _cv.set(b.x + lx * c + lz * s, b.y + ly, b.z - lx * s + lz * c); };
CITY.update = function (dt) {
  CITY.t += dt; const t = CITY.t, cp = camera.position;
  for (const a of CITY.anims) { const b = a.b; if (!b) continue; if (Math.abs(cp.x - b.x) > 650 || Math.abs(cp.z - b.z) > 650) continue; const qB = _cq.setFromAxisAngle(_cY, b.rot);
    if (a.kind === 'ferris') { const ang = t * 0.07 + a.ph; a.wheel.quaternion.copy(qB).multiply(_cq2.setFromAxisAngle(_cZ, ang)); for (let k = 0; k < a.n; k++) { const q = ang + k / a.n * 6.283; _cm.makeTranslation(Math.cos(q) * a.Rw, a.ay + Math.sin(q) * a.Rw, 0); a.gond.setMatrixAt(k, _cm); } a.gond.instanceMatrix.needsUpdate = true; }
    else if (a.kind === 'carousel') { const ang = t * 0.5 + a.ph; a.rot.quaternion.copy(qB).multiply(_cq2.setFromAxisAngle(_cY, ang)); a.horses.forEach((h, k) => { const q = h.a + ang; _cq2.setFromAxisAngle(_cY, Math.atan2(-Math.sin(q), -Math.cos(q))); _cm.compose(_cv.set(Math.cos(q) * h.r, 1.6 + Math.sin(t * 2.2 + h.a * 3) * 0.35, -Math.sin(q) * h.r), _cq2, _cs); a.im.setMatrixAt(k, _cm); }); a.im.instanceMatrix.needsUpdate = true; }
    else if (a.kind === 'drop') { const c = (t + a.ph) % 26, y = c < 16 ? 2 + (a.H - 6) * c / 16 : c < 19 ? a.H - 4 : c < 20.4 ? Math.max(2, a.H - 4 - 0.5 * 9.8 * Math.pow(c - 19, 2) * 2.4) : 2; if (a.y0 === undefined) a.y0 = a.o.position.y - 2; a.o.position.y = a.y0 + y; }
    else if (a.kind === 'jet') { a.o.scale.y = 1 + Math.sin(t * 7) * 0.08; a.o.scale.x = a.o.scale.z = 1 + Math.sin(t * 5 + 1) * 0.06; }
    else if (a.kind === 'coaster') { const P = a.curve.getPointAt(a.u), hTop = 26; a.v = a.u > 0.12 && a.u < 0.3 ? 3.2 : Math.max(5, Math.sqrt(Math.max(0, 2 * 9.8 * (hTop + 2 - P.y)))); a.u = (a.u + a.v * dt / a.L) % 1;
      for (let k = 0; k < a.n; k++) { const u = (a.u - k * 2.3 / a.L + 1) % 1, p = a.curve.getPointAt(u), tg = a.curve.getTangentAt(u); _ce.set(-Math.asin(Math.max(-1, Math.min(1, tg.y))), Math.atan2(tg.x, tg.z), 0, 'YXZ'); _cq2.setFromEuler(_ce); _cm.compose(_cv.set(p.x, p.y + 0.15, p.z), _cq2, _cs); a.im.setMatrixAt(k, _cm); } a.im.instanceMatrix.needsUpdate = true; } }
};
// ---------- people and cars that make the town lively ----------
CITY.crowdInit = function () { if (CITY.crowd) return CITY.crowd; const N = 420, body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.18, 0.62, 3, 6), new THREE.MeshStandardMaterial({ roughness: 0.7 }), N), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.6 }), N);
  for (const m of [body, head]) { m.castShadow = false; m.frustumCulled = false; m.count = 0; scene.add(m); } const R = mulberry(77); for (let i = 0; i < N; i++) { body.setColorAt(i, new THREE.Color(cbPick(R, ['#e8574e', '#3f8fd8', '#f2c230', '#46a86a', '#f08fb0', '#ffffff', '#7a4ab8', '#ff8a2a', '#16a0b8', '#1f3a6a', '#3a3a3a']))); head.setColorAt(i, new THREE.Color(cbPick(R, ['#f2cfb0', '#e0b090', '#c8946a', '#a87050', '#f6dcc4']))); }
  return CITY.crowd = { body, head, N, list: [] }; };
CITY.crowdPlan = function () { const C = CITY.crowdInit(), R = mulberry(5), L = []; for (const b of CITY.list) { const T = CITY_TYPES[b.t]; const n = Math.min(10, Math.max(1, Math.round(T.w * T.d / (T.cat === 'fun' ? 140 : 260)))); for (let k = 0; k < n && L.length < C.N; k++) L.push({ b, hw: T.w / 2 + 1.6, hd: T.d / 2 + 1.6, u: R(), sp: (R() < 0.5 ? -1 : 1) * (0.012 + R() * 0.01) * 30 / (T.w + T.d), ph: R() * 6, inner: T.cat === 'fun' && R() < 0.6, ix: (R() - 0.5) * T.w * 0.7, iz: (R() - 0.5) * T.d * 0.7 }); } C.list = L; };
CITY.crowdUpdate = function (dt) { const C = CITY.crowd; if (!C) return; const show = !GAME.inside && C.list.length, t = CITY.t, q = new THREE.Quaternion(), m4 = new THREE.Matrix4(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1); let k = 0;
  if (show) for (const p of C.list) { const b = p.b; let lx, lz, ry; if (p.inner) { lx = p.ix + Math.sin(t * 0.13 + p.ph) * 4; lz = p.iz + Math.cos(t * 0.11 + p.ph) * 4; ry = t * 0.12 + p.ph; } else { p.u = (p.u + p.sp * dt + 1) % 1; const per = 2 * (p.hw + p.hd), s = p.u * 2 * per % (2 * per) / 2; let x, z, d; if (s < 2 * p.hw) { x = -p.hw + s; z = p.hd; d = [1, 0]; } else if (s < 2 * p.hw + 2 * p.hd) { x = p.hw; z = p.hd - (s - 2 * p.hw); d = [0, -1]; } else if (s < 4 * p.hw + 2 * p.hd) { x = p.hw - (s - 2 * p.hw - 2 * p.hd); z = -p.hd; d = [-1, 0]; } else { x = -p.hw; z = -p.hd + (s - 4 * p.hw - 2 * p.hd); d = [0, 1]; } lx = x; lz = z; if (p.sp < 0) { d[0] = -d[0]; d[1] = -d[1]; } ry = Math.atan2(d[0], d[1]); }
    const w = cityW(b, lx, 0, lz), y = b.y + Math.abs(Math.sin(t * 6 + p.ph)) * 0.04; q.setFromAxisAngle(_cY, ry + b.rot); m4.compose(v.set(w.x, y + 0.5, w.z), q, sc); C.body.setMatrixAt(k, m4); m4.compose(v.set(w.x, y + 1.14, w.z), q, sc); C.head.setMatrixAt(k, m4); k++; }
  for (const m of [C.body, C.head]) { m.count = k; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } };
CITY.trafficInit = function () { if (CITY.cars) return CITY.cars; const N = 160, bx = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z).toNonIndexed();
  const ge = mergeGeometries([bx(1.76, 0.62, 4.1, 0, 0.62, 0), bx(1.6, 0.1, 1.9, 0, 1.47, -0.25)]); const car = new THREE.InstancedMesh(ge, new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.35 }), N); car.castShadow = true; car.frustumCulled = false; car.count = 0; scene.add(car);
  const wg = [bx(1.64, 0.52, 1.95, 0, 1.18, -0.25), bx(1.8, 0.16, 0.5, 0, 0.62, 2.03), bx(1.8, 0.16, 0.5, 0, 0.62, -2.03)]; for (const x of [-0.82, 0.82]) for (const z of [-1.3, 1.3]) { const c = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10); c.rotateZ(Math.PI / 2); c.translate(x, 0.34, z); wg.push(c.toNonIndexed()); }
  const glass = new THREE.InstancedMesh(mergeGeometries(wg), new THREE.MeshStandardMaterial({ color: '#1c2630', roughness: 0.2, metalness: 0.4 }), N); glass.frustumCulled = false; glass.count = 0; scene.add(glass); car.userData.glass = glass;
  const R = mulberry(9); for (let i = 0; i < N; i++) car.setColorAt(i, new THREE.Color(cbPick(R, ['#f4f4f0', '#c8ccd2', '#2a2a2e', '#d8343a', '#2a7ad8', '#f2c230', '#46a86a', '#8a5ad0', '#e8e0d0']))); return CITY.cars = { car, N, list: [] }; };
CITY.trafficPlan = function () { const C = CITY.trafficInit(), R = mulberry(11), L = []; const want = Math.min(C.N, Math.round(6 + CITY.list.length * 1.6)); const roads = ROADS.filter(r => !isFoot(r) && r.pts.length > 3).map(r => ({ r, len: rLen(r) })).filter(o => o.len > 25); const tot = roads.reduce((s, o) => s + o.len, 0); if (!tot || !want) { C.list = []; return; }
  for (const o of roads) { const n = Math.round(want * o.len / tot); for (let k = 0; k < n && L.length < C.N; k++) L.push({ r: o.r, len: o.len, s: R() * o.len, dir: R() < 0.5 ? 1 : -1, v: 7 + R() * 6 }); } C.list = L; };
CITY.trafficUpdate = function (dt) { const C = CITY.cars; if (!C) return; const show = !GAME.inside && C.list.length, q = new THREE.Quaternion(), m4 = new THREE.Matrix4(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1); let k = 0;
  if (show) for (const c of C.list) { if (!ROADS.includes(c.r)) continue; c.s += c.dir * c.v * dt; if (c.s > c.len - 2) { c.s = c.len - 2; c.dir = -1; } if (c.s < 2) { c.s = 2; c.dir = 1; } const a = rAt(c.r, c.s), b = rAt(c.r, Math.min(c.len, c.s + 1)); let dx = b.x - a.x, dz = b.z - a.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const off = c.r.w * 0.24 * c.dir;
    const x = a.x + dz * off, z = a.z - dx * off; if (Math.hypot(x - PL.x, z - PL.z) < 2.2) c.s -= c.dir * c.v * dt; q.setFromAxisAngle(_cY, Math.atan2(dx * c.dir, dz * c.dir)); m4.compose(v.set(x, a.y + 0.02, z), q, sc); C.car.setMatrixAt(k++, m4); }
  C.car.count = k; C.car.instanceMatrix.needsUpdate = true; if (C.car.instanceColor) C.car.instanceColor.needsUpdate = true; const gl = C.car.userData.glass; if (gl) { gl.count = k; for (let i = 0; i < k; i++) { C.car.getMatrixAt(i, m4); gl.setMatrixAt(i, m4); } gl.instanceMatrix.needsUpdate = true; } };
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { const d = dt || 0.016; CITY.update(d); CITY.crowdUpdate(d); CITY.trafficUpdate(d); } catch (e) { if (!CITY._e) { CITY._e = 1; console.warn('city', e); } } return r; }; }
// roads change → cars follow the new network
{ const _f = finishRoad; finishRoad = function () { const r = _f.apply(this, arguments); if (CITY.cars) CITY.trafficPlan(); return r; }; }
{ const _r = removeUserRoad; removeUserRoad = function () { const r = _r.apply(this, arguments); if (CITY.cars) CITY.trafficPlan(); return r; }; }
// ---------- maps ----------
{ const _dm = GAME.drawMap; GAME.drawMap = function (cv) { const r = _dm.apply(this, arguments); try { if (!CITY.list.length) return r; const E = 246, S = cv.width / (2 * E), ctx = cv.getContext('2d'); const col = { stay: '#f08a5a', home: '#e0b04a', town: '#8aa0c8', fun: '#e05ab0' };
  for (const b of CITY.list) { const T = CITY_TYPES[b.t]; ctx.save(); ctx.translate((b.x + E) * S, (b.z + E) * S); ctx.rotate(-b.rot); ctx.fillStyle = col[T.cat]; ctx.strokeStyle = 'rgba(40,30,30,0.8)'; ctx.lineWidth = 1.5; ctx.fillRect(-T.w / 2 * S * 0.8, -T.d / 2 * S * 0.8, T.w * S * 0.8, T.d * S * 0.8); ctx.strokeRect(-T.w / 2 * S * 0.8, -T.d / 2 * S * 0.8, T.w * S * 0.8, T.d * S * 0.8); ctx.restore(); } } catch (e) { } return r; }; }
// ---------- the development buildings are merged by area too (fewer draw calls on a fully built island) ----------
CITY.mergeDev = function () {
  const G0 = DV.group; if (!G0) return; const skip = new Set([...(DV.turbines || []), ...(RS.moored || []), ...((DV.onsen && DV.onsen.steam) || []), DV.onsen && DV.onsen.g, DV.school && DV.school.g].filter(Boolean)), buckets = new Map(), box = new THREE.Box3(), c = new THREE.Vector3();
  for (const ch of [...G0.children]) { let ok = true; ch.traverse(o => { if (skip.has(o)) ok = false; }); if (!ok) continue;
    box.setFromObject(ch); if (box.isEmpty()) continue; box.getCenter(c); const k = Math.floor(c.x / 200) + ',' + Math.floor(c.z / 200); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(ch); }
  for (const list of buckets.values()) { if (list.length < 2) continue; const root = new THREE.Group(); for (const ch of list) { G0.remove(ch); root.add(ch); } root.updateMatrixWorld(true); cityDedupe(root); G0.add(mergeLocal(root)); }
};
CITY.mergeGroup = function (G0, cell, skip = new Set()) {
  if (!G0) return; const buckets = new Map(), box = new THREE.Box3(), c = new THREE.Vector3();
  for (const ch of [...G0.children]) { let ok = true; ch.traverse(o => { if (o.isSprite || o.isPoints || o.isLine || o.isInstancedMesh || skip.has(o) || (o !== ch && o.userData.keep)) ok = false; }); if (!ok) continue;
    box.setFromObject(ch); if (box.isEmpty()) continue; box.getCenter(c); const k = Math.floor(c.x / cell) + ',' + Math.floor(c.z / cell); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(ch); }
  for (const list of buckets.values()) { if (list.length < 2) continue; const root = new THREE.Group(); for (const ch of list) { G0.remove(ch); root.add(ch); } root.updateMatrixWorld(true); cityDedupe(root); G0.add(mergeLocal(root)); }
};
{ const _rd = GAME.refreshDev; GAME.refreshDev = function () { const r = _rd.apply(this, arguments); try { CITY.mergeDev(); } catch (e) { console.warn('mergeDev', e); } return r; }; }
{ const _rp = GAME.refreshProjects; GAME.refreshProjects = function () { const r = _rp.apply(this, arguments); try { if (PROJ.group && PROJ.group.children.length > 4) { PROJ.group.updateMatrixWorld(true); const g = new THREE.Group(); for (const ch of [...PROJ.group.children]) g.add(ch); cityDedupe(g); PROJ.group.add(mergeLocal(g)); } } catch (e) { console.warn('mergeProj', e); } return r; }; }
{ const _sn = GAME.syncNewcomers; GAME.syncNewcomers = function () { const r = _sn.apply(this, arguments); try { CITY.mergeGroup(LIFE.group, 200); } catch (e) { console.warn('mergeLife', e); } return r; }; }
