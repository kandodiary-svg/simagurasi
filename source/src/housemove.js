// ===================== MOVING VILLAGERS' HOUSES (しまづくり「家を動かす」) =====================
const HM = { sel: null, plan: null, pick: null, ghost: null, hl: null, cost: 10000 };
TOOLS.push({ id: 'move', name: '家を動かす', icon: '🚚', key: 'U', hint: '動かしたい住民の家をクリック → 新しい場所をクリック（R で向きを変える）', brush: false });
// every house that belongs to a villager: original houses and newcomers' houses
HM.list = function () {
  const out = []; for (const hs of PLACED.houses) if (hs.vid && hs.grp) { const d = VILLAGER_DEF.find(v => v.id === hs.vid); if (d) out.push({ kind: 'orig', hs, id: hs.vid, name: d.name, x: hs.x, z: hs.z, rot: hs.rot, w: hs.w, d: hs.d }); }
  if (GAME.p) { const N = GAME.newc(); for (const c of NEWCOMERS) { const s = N[c.id]; if (s && s.house && (s.state === 'house' || s.state === 'moved')) out.push({ kind: 'new', s, id: c.id, name: c.name, x: s.house.x, z: s.house.z, rot: s.house.rot, w: 8.2, d: 6.8 }); } }
  return out;
};
HM.at = function (p) { if (!p) return null; for (const h of HM.list()) { const cs = Math.cos(h.rot), sn = Math.sin(h.rot), dx = p.x - h.x, dz = p.z - h.z, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs; if (Math.abs(lx) < h.w / 2 + 0.8 && Math.abs(lz) < h.d / 2 + 0.8) return h; } return null; };
// is (x,z) inside the selected house's own lot? (its own protection and colliders don't block the move)
HM.own = function (h, x, z) { const cs = Math.cos(h.rot), sn = Math.sin(h.rot), dx = x - h.x, dz = z - h.z, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs; return Math.abs(lx) < h.w / 2 + 3.2 && lz > -h.d / 2 - 3.2 && lz < h.d / 2 + 5.5; };
HM.planAt = function (h, p) {
  const nr = nearestOnRoads(p.x, p.z, 45, false); let rot = nr && nr.d > 1 ? Math.atan2(nr.x - p.x, nr.z - p.z) : h.rot; rot += EDIT.mvRot || 0;
  const o = { x: p.x, z: p.z, rot }, W = h.w, D = h.d; let mn = 1e9, mx = -1e9, sum = 0, cnt = 0, err = null;
  if (Math.hypot(p.x - h.x, p.z - h.z) < 2) err = 'いまの場所と同じです';
  for (let a = -W / 2 - 1.3; a <= W / 2 + 1.31 && !err; a += 1.3) for (let b = -D / 2 - 1.3; b <= D / 2 + 3.6 && !err; b += 1.2) {
    const [x, z] = toWorld(o, a, b), [i, j] = toIdx(x, z), k = j * WORLD.n + i, hh = G.H[k], own = HM.own(h, x, z);
    if (Math.abs(x) > 330 || Math.abs(z) > 330) err = '島の外です';
    else if (!GAME.openK(k)) err = GAME.lockText(x, z);
    else if (G.prot[k] && !own) err = 'ほかの建物に近すぎます';
    else if (G.roadDist[k] < 4.3) err = '道路に近すぎます（少しはなしてね）';
    else if (hh < 1.0 || !isNaN(G.Wl[k])) err = '水辺や海の近くには建てられません';
    else if (!own && collidersNear(x, z).some(q => !q.off && (q.kind === 'bld' || q.kind === 'pole') && hitsCollider(q, x, z, 0.4))) err = 'ほかの建物に近すぎます';
    mn = Math.min(mn, hh); mx = Math.max(mx, hh); sum += hh; cnt++;
  }
  if (!err && mx - mn > 3.6) err = '坂が急すぎます（「平らに」でならしてね）';
  return { ok: !err, err, x: p.x, z: p.z, rot, y: sum / cnt };
};
HM.mkGhost = function () {
  const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.45, depthWrite: false, fog: false });
  const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m); g.add(b); const r = new THREE.Mesh(new THREE.ConeGeometry(0.71, 1, 4), m); r.rotation.y = Math.PI / 4; g.add(r);
  const ar = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 12), new THREE.MeshBasicMaterial({ color: '#ffd84a', fog: false })); ar.rotation.x = Math.PI / 2; g.add(ar);
  g.userData = { m, b, r, ar }; scene.add(g); return g;
};
HM.fitGhost = function (G0, w, d, H) { const U = G0.userData; U.b.scale.set(w, H, d); U.b.position.y = H / 2; U.r.scale.set(w, 2.2, d); U.r.position.y = H + 1.1; U.ar.position.set(0, 0.6, d / 2 + 2.8); };
HM.clear = function () { HM.sel = null; HM.plan = null; HM.pick = null; if (HM.ghost) HM.ghost.visible = false; if (HM.hl) HM.hl.visible = false; EDIT._mh = null; };
HM.preview = function (p) {
  if (!HM.ghost) HM.ghost = HM.mkGhost(); if (!HM.hl) { HM.hl = HM.mkGhost(); HM.hl.userData.m.color.set('#ffd84a'); HM.hl.userData.m.opacity = 0.3; HM.hl.userData.ar.visible = false; }
  let hint;
  if (!HM.sel) { HM.ghost.visible = false; const h = HM.at(p); if (h) { HM.hl.visible = true; HM.fitGhost(HM.hl, h.w + 0.6, h.d + 0.6, 6); HM.hl.position.set(h.x, groundH(h.x, h.z), h.z); HM.hl.rotation.y = h.rot; hint = `${h.name}の家　クリックで選ぶ（引っこし代 ${yen(HM.cost)}）`; } else { HM.hl.visible = false; hint = HM.list().length ? '動かしたい住民の家をクリックしてね（あなたの家・お店は動かせません）' : '動かせる住民の家がありません'; } }
  else { const h = HM.sel; HM.hl.visible = true; HM.fitGhost(HM.hl, h.w + 0.6, h.d + 0.6, 6); HM.hl.position.set(h.x, groundH(h.x, h.z), h.z); HM.hl.rotation.y = h.rot;
    const plan = HM.pick || (p ? HM.planAt(h, p) : null); HM.plan = plan; if (!plan) { HM.ghost.visible = false; hint = '新しい場所をクリックしてね'; }
    else { HM.ghost.visible = true; HM.fitGhost(HM.ghost, h.w, h.d, h.kind === 'new' ? 3.2 : 3.2); HM.ghost.position.set(plan.x, plan.y, plan.z); HM.ghost.rotation.y = plan.rot; HM.ghost.userData.m.color.set(plan.ok ? (HM.pick ? '#4fd0ff' : '#7cf0a0') : '#ff6f6f');
      hint = HM.pick ? `ここに${h.name}の家を動かしますか？（${yen(HM.cost)}）` : plan.ok ? `${h.name}の家の新しい場所をクリック（R で向きを変える）` : '⚠ ' + plan.err; } }
  if (EDIT._mh !== hint) { EDIT._mh = hint; UI.editHint(); }
};
HM.click = function (p) {
  if (!HM.sel) { const h = HM.at(p); if (!h) { UI.toast('住民の家をクリックしてね'); return; } HM.sel = h; HM.pick = null; EDIT.mvRot = 0; UI.editPanel(); return; }
  const plan = HM.planAt(HM.sel, p); if (!plan.ok) { UI.toast(plan.err); return; } HM.pick = plan; UI.editPanel();
};
HM.sub = function () {
  if (!HM.sel) return `<span class="sub2">🚚 住民の家を、島の好きな場所へ引っこしできます（${yen(HM.cost)}）</span>`;
  if (!HM.pick) return `<span class="sub2">🏠 ${esc(HM.sel.name)}の家を選びました</span><button data-hm="cancel">えらびなおす</button>`;
  return `<button data-hm="go" class="primary" ${GAME.p && GAME.p.money >= HM.cost ? '' : 'disabled'}>🚚 ここへ引っこす（${yen(HM.cost)}）</button><button data-hm="again">場所をえらびなおす</button><button data-hm="cancel">やめる</button>`;
};
// rebuild one house at a new place. silent: used when loading a save (no cost, no messages)
HM.apply = function (h, plan, silent) {
  const o = { x: plan.x, z: plan.z, rot: plan.rot }, y = plan.y + 0.05;
  if (h.kind === 'orig') { const hs = h.hs; for (const c of hs.coll || []) c.off = true; scene.remove(hs.grp);
    Object.assign(hs, { x: plan.x, z: plan.z, rot: plan.rot, y }); if (!silent) flattenPad(plan.x, plan.z, hs.w / 2 + 1.2, hs.d / 2 + 1.2, plan.rot, y, 5);
    COLL.track = hs.coll = []; hs.grp = mergeLocal(makeHouse(hs)); COLL.track = null; scene.add(hs.grp);
    if (GAME.p) { GAME.p.hmove = GAME.p.hmove || {}; GAME.p.hmove[hs.vid] = { x: hs.x, z: hs.z, rot: hs.rot, y: hs.y }; } }
  else { const s = h.s; if (!silent) { const [cx, cz] = toWorld(o, 0, 1.1); flattenPad(cx, cz, 5.4, 5.9, plan.rot, plan.y, 4); } Object.assign(s.house, { x: plan.x, z: plan.z, rot: plan.rot, y }); }
  if (!silent) { const [i0, j0] = toIdx(plan.x - 16, plan.z - 16), [i1, j1] = toIdx(plan.x + 16, plan.z + 16); refreshRegion(i0, j0, i1, j1); if (VEG.removeAt(plan.x, plan.z, Math.max(h.w, h.d) / 2 + 2.5)) VEG.refresh(plan.x - 12, plan.z - 12, plan.x + 12, plan.z + 12); }
  HM.reprotect(); if (h.kind === 'new') GAME.syncNewcomers();
  // the villager now lives at the new address
  const n = NPCS.find(q => q.def.id === h.id); if (n && h.kind === 'orig') { const hs = h.hs, fx = hs.x + Math.sin(hs.rot) * (hs.d / 2 + 4.6), fz = hs.z + Math.cos(hs.rot) * (hs.d / 2 + 4.6); n.hx = fx; n.hz = fz; n.home0 = { x: fx, z: fz }; n.house = hs; n.place = null; if (silent || n.asleep) { n.x = fx; n.z = fz; n.y = groundH(fx, fz); } }
  if (typeof LIVE !== 'undefined') for (const k of Object.keys(LIVE.spots)) if (k.startsWith(h.id + ':')) delete LIVE.spots[k];
  if (typeof SEASON !== 'undefined') SEASON.built = '?';
};
HM.reprotect = function () { computeProtect(); if (GAME.p) { const N = GAME.newc(); for (const c of NEWCOMERS) { const s = N[c.id]; if (s && s.house) markProt(s.house.x, s.house.z, 4.6, 5.6, s.house.rot); } } };
HM.go = function () {
  const h = HM.sel, plan = HM.pick, p = GAME.p; if (!h || !plan || !p) return; if (p.money < HM.cost) { UI.toast(`お金がたりません（${yen(HM.cost)} 必要）`); return; }
  p.money -= HM.cost; HM.apply(h, plan, false); EDIT.undo = []; scheduleSave(); GAME.dirty = true; GAME.save(); GAME.renderTracker(); GAME.mapDirty = true;
  try { SND.play('hammer1', { vol: 0.6 }); } catch (e) { }
  UI.toast(`🚚 ${h.name}の家を引っこしました！`); setTimeout(() => UI.toast(`${h.name}「新しい家、気に入ったよ！ ありがとう！」`), 1200); HM.clear(); UI.editPanel();
};
// apply saved moves when a profile starts (and put houses back for a profile without moves)
HM.load = function () {
  const mv = (GAME.p && GAME.p.hmove) || {};
  for (const hs of PLACED.houses) { if (!hs.vid || !hs.grp) continue; const t = mv[hs.vid] || hs.orig; if (!t) continue; if (Math.abs(t.x - hs.x) > 0.01 || Math.abs(t.z - hs.z) > 0.01 || Math.abs(t.rot - hs.rot) > 0.001) { const d = VILLAGER_DEF.find(v => v.id === hs.vid); HM.apply({ kind: 'orig', hs, id: hs.vid, name: d ? d.name : '', w: hs.w, d: hs.d }, { x: t.x, z: t.z, rot: t.rot, y: t.y - 0.05 }, true); } }
  if (!GAME.p || !GAME.p.hmove) return; GAME.p.hmove = mv;
};
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { HM.load(); } catch (e) { console.warn('hmove', e); } return r; }; }
// resetting the island's shape keeps the moved houses standing on flat ground
{ const _r = resetIsland; resetIsland = function () { _r(); if (!GAME.p || !GAME.p.hmove) return; for (const hs of PLACED.houses) if (hs.vid && GAME.p.hmove[hs.vid]) flattenPad(hs.x, hs.z, hs.w / 2 + 1.2, hs.d / 2 + 1.2, hs.rot, hs.y, 5); refreshAll(); }; }
// edit-mode hooks
{ const _u = updateEdit; updateEdit = function (dt) { _u(dt); if (EDIT.on && EDIT.tool === 'move') HM.preview(EDIT.hover); else if (HM.ghost && (HM.ghost.visible || HM.hl.visible)) { HM.ghost.visible = false; HM.hl.visible = false; } }; }
{ const _d = editPointerDown; editPointerDown = function (e) { if (EDIT.tool === 'move') { const p = pickSurface(e.clientX, e.clientY); if (p) HM.click(p); return; } return _d(e); }; }
{ const _s = setTool; setTool = function (id) { if (id !== 'move') HM.clear(); return _s(id); }; }
{ const _t = toggleEdit; toggleEdit = function (on) { const r = _t(on); if (!EDIT.on) { HM.clear(); if (EDIT.tool === 'move') EDIT.tool = 'raise'; } return r; }; }
{ const _h = UI.editHint; UI.editHint = function () { const h = document.getElementById('editHint'); if (h && EDIT.on && EDIT.tool === 'move') { h.textContent = EDIT._mh || TOOLS.find(t => t.id === 'move').hint; return; } return _h.apply(this, arguments); }; }
{ const _p = UI.editPanel; UI.editPanel = function () { _p.apply(this, arguments); if (!EDIT.on || EDIT.tool !== 'move') return; const sb = document.querySelector('#editp .sub'); if (!sb) return; sb.insertAdjacentHTML('afterbegin', `<span class="hmsub">${HM.sub()}</span>`);
    sb.querySelectorAll('[data-hm]').forEach(b => b.onclick = (e) => { e.stopPropagation(); const k = b.dataset.hm; if (k === 'go') HM.go(); if (k === 'again') { HM.pick = null; UI.editPanel(); } if (k === 'cancel') { HM.clear(); UI.editPanel(); } document.getElementById('c').focus(); }); }; }
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT' || !EDIT.on || e.repeat) return; if (e.code === 'KeyU') setTool('move'); if (e.code === 'KeyR' && EDIT.tool === 'move' && HM.sel) { EDIT.mvRot = ((EDIT.mvRot || 0) + Math.PI / 2) % (Math.PI * 2); HM.pick = null; UI.editPanel(); } if (e.code === 'Escape' && EDIT.tool === 'move' && HM.sel) { HM.clear(); UI.editPanel(); } });
// the visit feature should find newcomers' houses too
{ const _vh = villagerHouse; villagerHouse = function (n) { if (n.newcomer && GAME.p) { const s = GAME.newc()[n.def.id]; if (s && s.house) return { x: s.house.x, z: s.house.z, rot: s.house.rot, w: 8.2, d: 6.8 }; } const hs = PLACED.houses.find(h => h.vid === n.def.id); if (hs) return hs; return _vh(n); }; }
