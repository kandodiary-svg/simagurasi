// ===================== 建物の中（interiors.js）: すべての建物の内装を作り直す・店内のカメラ =====================
// 道の駅・商店・出荷所・集会所・待合所・水族館・ホテル・旅館・マンション/オフィス・モール・カフェ・チャペル。
// 部屋の広さは本物に近づけ（道の駅 20×14m など）、什器（fixtures.js）と商品（goods.js）で埋める。
// 店内のカメラ: V で「全体」→「ちかく」→「目線」。Q/E（目線は A/D）で向きを変える。
const INT = { mode: 'near', yaw: 0, pitch: 0.6, look: 0, lookP: 0 };
try { const v = localStorage.getItem('hoshinami-inview'); if (v) INT.mode = v; } catch (e) { }
// ---------- bigger rooms ----------
const INT_SIZES = { eki: [20, 14], store: [14, 10], ship2: [12, 9], hall2: [14, 10], wait2: [12, 8], aqua2: [18, 13], hotel2: [16, 11], ryokan2: [16, 11], lobby2: [12, 9], lobbyS: [8, 9], villa2: [12, 9], mall2: [28, 20], cafe2: [11, 8], chapel2: [12, 15] };
for (const [k, [w, d]] of Object.entries(INT_SIZES)) { placeSizeIdx[k] = ROOM_SIZES.length; ROOM_SIZES.push({ w, d, name: k }); }
// floors & walls for shops
{ const _ft = floorTex; floorTex = function (k, W = 8, D = 8) { if (!['vinyl', 'woodfloor', 'terrazzo', 'carpet', 'doma'].includes(k)) return _ft(k, W, D); const key = 'f' + k + W + D; if (_texCache[key]) return _texCache[key]; const [c, x] = cvs(512, 512);
  if (k === 'vinyl') { for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.fillStyle = (i + j) % 2 ? '#e8e6e0' : '#f2f0ea'; x.fillRect(i * 128, j * 128, 128, 128); } for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(120,110,100,${Math.random() * 0.12})`; x.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); } x.strokeStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i <= 512; i += 128) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); } }
  if (k === 'woodfloor') { for (let j = 0; j < 512; j += 32) { let i = -((j * 53) % 160); while (i < 512) { const len = 120 + Math.random() * 100; x.fillStyle = `hsl(32,${38 + Math.random() * 10}%,${58 + Math.random() * 8}%)`; x.fillRect(i, j, len, 31); x.fillStyle = 'rgba(90,60,30,.25)'; x.fillRect(i, j, 2, 31); i += len; } x.fillStyle = 'rgba(90,60,30,.2)'; x.fillRect(0, j + 31, 512, 1); } }
  if (k === 'terrazzo') { x.fillStyle = '#e6e2da'; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 2200; i++) { x.fillStyle = ['#b8b0a2', '#8a8478', '#d8d0c0', '#a89a88', '#f6f2ea'][i % 5]; const s = 1 + Math.random() * 4; x.fillRect(Math.random() * 512, Math.random() * 512, s, s * 0.8); } }
  if (k === 'carpet') { x.fillStyle = '#7a2a34'; x.fillRect(0, 0, 512, 512); x.strokeStyle = 'rgba(232,200,120,.35)'; x.lineWidth = 3; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(64 + i * 128, 64 + j * 128, 40, 0, 7); x.stroke(); x.beginPath(); x.arc(64 + i * 128, 64 + j * 128, 14, 0, 7); x.stroke(); } for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; x.fillRect(Math.random() * 512, Math.random() * 512, 1, 1); } }
  if (k === 'doma') { x.fillStyle = '#a8a094'; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.08})`; x.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); } }
  const t = toTex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 4, D / 4); return (_texCache[key] = t); }; }
{ const _wt = wallTex; wallTex = function (k, w = 8) { if (!['store', 'timber', 'kura'].includes(k)) return _wt(k, w); const key = k + w; if (_texCache[key]) return _texCache[key]; const [c, x] = cvs(512, 256), s = 512 / w;
  if (k === 'store') { x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#d8d4cc'; x.fillRect(0, 226, 512, 30); x.fillStyle = '#2f7a4a'; x.fillRect(0, 222, 512, 4); }
  if (k === 'timber') { x.fillStyle = '#f2ead8'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#8a6440'; for (let i = 0; i < 512; i += s * 1.8) x.fillRect(i, 0, 10, 256); x.fillRect(0, 60, 512, 8); x.fillStyle = '#a8784a'; x.fillRect(0, 196, 512, 60); for (let i = 0; i < 512; i += s * 0.2) { x.fillStyle = 'rgba(60,40,20,.25)'; x.fillRect(i, 196, 2, 60); } }
  if (k === 'kura') { x.fillStyle = '#f6f4ee'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#3a3a3e'; x.fillRect(0, 170, 512, 86); x.strokeStyle = '#f2f2ee'; x.lineWidth = 3; for (let j = 0; j < 3; j++) for (let i = -1; i < 12; i++) { x.save(); x.translate(i * 48 + (j % 2) * 24, 184 + j * 26); x.rotate(Math.PI / 4); x.strokeRect(-9, -9, 18, 18); x.restore(); } }
  const t = toTex(c, false); return (_texCache[key] = t); }; }
// ---------- the room builder context ----------
INT.ctx = function (group, W, D, WH) { const g = new THREE.Group(), dyn = new THREE.Group(); group.add(g); group.add(dyn); return { g, dyn, S: GOODS.stocker(dyn), tags: [], acts: [], blocks: [], secs: [], seats: [], W, D, WH }; };
INT.finish = function (R, P) {
  const pl = GAME.place, key = pl.key + (pl.kind || ''), sold = (GAME.p.shopSold && GAME.p.shopSold.day === todayKey()) ? GAME.p.shopSold.n : {};
  R.S.finish(); FIX.finishTags(R); FIX.merge(R.g);
  // what you bought here today is not on the shelf any more (restocked tomorrow)
  for (const [k2, n] of Object.entries(sold)) { if (!k2.startsWith(key + ':')) continue; const id = k2.slice(key.length + 1); let left = n; for (const sec of R.secs) while (left > 0 && R.S.take(sec, id)) left--; }
  // a showcase of cafe goods (cakes) is ordered and paid for at once, like the menu (there is no shop register at a cafe counter)
  for (const sec of R.secs) { const menu = sec.prods.length && sec.prods.every(id => GOODS.byId[id] && GOODS.byId[id].cat === 'cafe'); const lib = sec.library && sec.prods.filter(id => GOODS.byId[id] && (GOODS.byId[id].use || {}).read); R.acts.push({ x: sec.x, z: sec.z, r: sec.r || 0.75, label: () => lib ? `本を読む（${sec.name}）` : menu ? `注文する（${sec.name.replace(/^.*：/, '')}）` : `棚を見る（${sec.name}）`, fn: () => lib ? (lib.length ? SHOP.read(lib[Math.floor(Math.random() * lib.length)]) : UI.toast('📚 しずかなライブラリー')) : menu ? SHOP.openMenu(sec.name.replace(/^.*：/, ''), sec.prods.slice()) : SHOP.openShelf(sec), sec }); }
  P.blocks = R.blocks; P.acts = R.acts.concat(P.extraActs || []); pl.ctx = R;
  if (R.staffAt && P.staff) { P.staff.x = R.staffAt.x; P.staff.z = R.staffAt.z; P.staff.ry = R.staffAt.ry; }
};
// people: shop staff and other customers (simple figures that look at the shelves and sway)
INT.person = function (R, x, z, ry, shirt, opts = {}) { const src = staffMesh(shirt, opts.apron || shirt, opts.hair || ['#3a2a20', '#1a1410', '#6a4a2a', '#8a8a8a'][Math.floor(Math.abs(x * 7 + z * 3)) % 4]), B = GOODS.bake(src), m = new THREE.Mesh(B.geo, B.mats); m.castShadow = true; m.position.set(x, 0, z); m.rotation.y = ry; if (opts.small) m.scale.setScalar(0.78); R.dyn.add(m); (R.people = R.people || []).push({ m, x, z, ry, ph: Math.random() * 6, walk: opts.walk }); R.blocks.push([x, z, 0.3, 0.3]); if (opts.who) m.userData.who = opts.who; return m; };
// ---------- the eye-level shell: ceiling with lights, the front wall with glass doors (only drawn in 目線) ----------
INT.shell = function (group, W, D, WH, kind) { const M = FIX.mats(), g = new THREE.Group(); g.userData.eyeOnly = true; g.visible = INT.mode === 'eye'; group.add(g);
  const c = new THREE.Mesh(new THREE.PlaneGeometry(W, D), FIX.std(kind === 'wa' ? '#c8a878' : kind === 'dark' ? '#0a1420' : kind === 'down' ? '#efe8dc' : '#f4f2ee', 0.95)); c.rotation.x = Math.PI / 2; c.position.y = WH; g.add(c);
  if (kind === 'down' || kind === 'dark') { const nx = Math.max(1, Math.round(W / 1.8)), nz = Math.max(1, Math.round(D / 1.8)), dl = kind === 'dark' ? FIX.std('#bfe8ff', 0.3, 0, { emissive: new THREE.Color('#5ab8ff'), emissiveIntensity: 1.0 }) : M.ledW; for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 18), dl); p.position.set(-W / 2 + (i + 0.5) * W / nx, WH - 0.01, -D / 2 + (j + 0.5) * D / nz); g.add(p); } }
  else if (kind !== 'plain') { const nx = Math.max(1, Math.round(W / 3.2)), nz = Math.max(1, Math.round(D / 3.2)); for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const p = new THREE.Mesh(new THREE.BoxGeometry(kind === 'wa' ? 0.5 : 1.25, 0.04, kind === 'wa' ? 0.5 : 0.32), kind === 'wa' ? M.ledW : M.led); p.position.set(-W / 2 + (i + 0.5) * W / nx, WH - 0.02, -D / 2 + (j + 0.5) * D / nz); g.add(p); } }
  if (kind === 'plain') { const bm = FIX.std('#e8e2d6', 0.8); for (let i = 1; i < Math.round(D / 2.5); i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(W, 0.18, 0.16), bm); b.position.set(0, WH - 0.09, -D / 2 + i * 2.5); g.add(b); } }
  const wm = FIX.std(kind === 'wa' ? '#f2ead8' : '#f4f2ec', 0.9); for (const sx of [-1, 1]) { const w = W / 2 - 1.1; const p = new THREE.Mesh(new THREE.PlaneGeometry(w, WH), wm); p.position.set(sx * (1.1 + w / 2), WH / 2, D / 2); p.rotation.y = Math.PI; g.add(p); }
  const lin = new THREE.Mesh(new THREE.PlaneGeometry(2.2, WH - 2.3), wm); lin.position.set(0, 2.3 + (WH - 2.3) / 2, D / 2); lin.rotation.y = Math.PI; g.add(lin);
  for (const sx of [-1, 1]) { const dr = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.25, 0.03), M.glass); dr.position.set(sx * 0.6, 1.13, D / 2); g.add(dr); const fr = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.3, 0.05), M.steelD); fr.position.set(sx * 1.1, 1.15, D / 2); g.add(fr); }
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), FIX.m('outside', () => new THREE.MeshBasicMaterial({ map: GOODS.tex('outside', 512, 220, (c, W, H) => { const sky = c.createLinearGradient(0, 0, 0, H * 0.55); sky.addColorStop(0, '#8ec8f2'); sky.addColorStop(1, '#e8f4fa'); c.fillStyle = sky; c.fillRect(0, 0, W, H); c.fillStyle = '#8aa8b8'; c.beginPath(); c.moveTo(0, H * 0.5); c.quadraticCurveTo(W * 0.3, H * 0.36, W * 0.55, H * 0.5); c.fill(); c.fillStyle = '#5a9a4a'; c.fillRect(0, H * 0.5, W, H * 0.12); c.fillStyle = '#a8a49c'; c.fillRect(0, H * 0.62, W, H * 0.38); c.fillStyle = '#f2f2ee'; for (let i = 0; i < W; i += 60) c.fillRect(i, H * 0.8, 30, 4); c.fillStyle = '#3a6a3a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(40 + i * 90, H * 0.46, 22, 0, 7); c.fill(); } }) })));
  bd.position.set(0, 2.2, D / 2 + 2.2); bd.rotation.y = Math.PI; g.add(bd); const fl = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.2), FIX.std('#b0aca4', 0.9)); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.002, D / 2 + 1.1); g.add(fl);
  return g; };
{ const _br = GAME.buildRoom; GAME.buildRoom = function () { const r = _br.apply(this, arguments); try { const H = this.home(), S = ROOM_SIZES[H.size]; ROOM.eye = INT.shell(ROOM.group, S.w, S.d, H.wh || 2.8, H.place ? (H.ceil || (PLACES[H.place] && PLACES[H.place].ceil) || (['ryokan', 'hall'].includes(H.place) ? 'wa' : 'store')) : 'wa'); } catch (e) { console.warn('shell', e); } return r; }; }
// ---------- camera inside: 全体 / ちかく / 目線 ----------
INT.NAMES = { room: '全体', near: 'ちかく', eye: '目線' };
INT.setMode = function (m) { INT.mode = m; try { localStorage.setItem('hoshinami-inview', m); } catch (e) { } if (ROOM.eye) ROOM.eye.visible = m === 'eye'; PL.mesh.visible = m !== 'eye'; if (m === 'eye') { INT.lookP = 0; } UI.toast(`🎥 店内の視点：${INT.NAMES[m]}（V で切りかえ${m === 'near' ? '・Q/E でまわる' : m === 'eye' ? '・A/D で向き・Q/E で横歩き' : ''}）`); GAME.roomUI && GAME.roomUI(); };
INT.toggle = () => INT.setMode(INT.mode === 'room' ? 'near' : INT.mode === 'near' ? 'eye' : 'room');
{ const _ok = GAME.onKey; GAME.onKey = function (e) { if (this.inside && !this.roomEdit && !this.modal && e.code === 'KeyV' && !e.repeat) { INT.toggle(); return true; } return _ok ? _ok.apply(this, arguments) : false; }; }
// movement relative to the camera (ちかく) / your own eyes (目線)
{ const _mi = moveInput; moveInput = function () { const r = _mi.apply(this, arguments); if (!GAME.inside || GAME.roomEdit || INT.mode === 'room') return r; if (INT.mode === 'eye') return [0, 0, 0]; const [ix, iz, l] = r; if (l < 0.01) return r; const a = Math.atan2(ix, -iz) + INT.yaw; return [Math.sin(a), -Math.cos(a), l]; }; }
// drag with the mouse to look around
{ let drag = null; addEventListener('pointerdown', e => { if (!GAME.inside || GAME.roomEdit || GAME.modal || INT.mode === 'room' || e.target.id !== 'c') return; drag = { x: e.clientX, y: e.clientY, k: typeof MOB !== 'undefined' ? MOB.k : 0 }; });
  addEventListener('pointermove', e => { if (!drag) return; if (typeof MOB !== 'undefined' && drag.k !== MOB.k) { drag = { x: e.clientX, y: e.clientY, k: MOB.k }; return; } const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY, k: drag.k }; if (INT.mode === 'near') { INT.yaw -= dx * 0.006; INT.pitch = clamp(INT.pitch + dy * 0.004, 0.25, 1.2); } else if (INT.mode === 'eye') { PL.rot -= dx * 0.005; INT.lookP = clamp(INT.lookP - dy * 0.004, -0.9, 0.8); } });
  addEventListener('pointerup', () => { drag = null; }); }
{ const _ur = GAME.updateRoom; GAME.updateRoom = function (dt) {
  if (SHOP.updateEat(dt)) { INT.cam(dt); return; }
  _ur.apply(this, arguments); if (this.roomEdit || INT.mode === 'room') { if (ROOM.eye) ROOM.eye.visible = false; PL.mesh.visible = true; INT.people(dt); return; }
  const S = ROOM.size; if (ROOM.eye) ROOM.eye.visible = INT.mode === 'eye';
  if (!this.modal && !DIALOG.npc) {
    if (INT.mode === 'near') { if (KEYS.KeyQ) INT.yaw += dt * 1.6; if (KEYS.KeyE) INT.yaw -= dt * 1.6; }
    if (INT.mode === 'eye') { // walk where you look
      if (KEYS.KeyA || KEYS.ArrowLeft) PL.rot += dt * 2.0; if (KEYS.KeyD || KEYS.ArrowRight) PL.rot -= dt * 2.0;
      const f = (KEYS.KeyW || KEYS.ArrowUp ? 1 : 0) - (KEYS.KeyS || KEYS.ArrowDown ? 1 : 0), sd = (KEYS.KeyE ? 1 : 0) - (KEYS.KeyQ ? 1 : 0), run = KEYS.ShiftLeft || KEYS.ShiftRight, sp = (run ? 3.0 : 1.7) * dt;
      if (f || sd) { const dx = (Math.sin(PL.rot) * f - Math.cos(PL.rot) * sd) * sp, dz = (Math.cos(PL.rot) * f + Math.sin(PL.rot) * sd) * sp; let nx = clamp(PL.x + dx, -S.w / 2 + 0.35, S.w / 2 - 0.35), nz = clamp(PL.z + dz, -S.d / 2 + 0.35, S.d / 2 - 0.2);
        if (!this.roomBlocked(nx, PL.z)) PL.x = nx; if (!this.roomBlocked(PL.x, nz)) PL.z = nz; if (PL.z > S.d / 2 - 0.3 && f > 0 && Math.cos(PL.rot) > 0.3 && Math.abs(PL.x) < 0.8) this.exitHome(); PL.speed = 1; animateHero(dt, 1.7); } else animateHero(dt, 0);
      PL.mesh.position.set(PL.x, 0, PL.z); PL.mesh.rotation.y = PL.rot; } }
  PL.mesh.visible = INT.mode !== 'eye'; INT.cam(dt); INT.people(dt); }; }
INT.cam = function (dt) { const S = ROOM.size, H = GAME.home(), WH = (H && H.wh) || 2.8;
  if (INT.mode === 'eye' && !GAME.roomEdit) { const p = INT.lookP; camera.position.set(PL.x, 1.48, PL.z); camera.lookAt(PL.x + Math.sin(PL.rot) * Math.cos(p), 1.48 + Math.sin(p), PL.z + Math.cos(PL.rot) * Math.cos(p)); return; }
  if (INT.mode !== 'near' || GAME.roomEdit) return; const tx = PL.x, tz = PL.z;
  // a shelf or a wall between you and the camera: look from higher up, then come closer, until you can be seen
  INT._occT = (INT._occT || 0) - dt; if (INT._occT <= 0) { INT._occT = 0.2; INT._pUp = 0; INT._dW = 3.4; const R = GAME.place && GAME.place.ctx; if (R) { const rc = INT._rc || (INT._rc = new THREE.Raycaster()), from = new THREE.Vector3(tx, 1.1, tz), objs = R.g.children;
    for (const [dist, up] of [[3.4, 0], [3.4, 0.18], [3.4, 0.36], [3.4, 0.52], [2.5, 0.52], [1.8, 0.52], [1.3, 0.6]]) { const p = Math.min(1.25, INT.pitch + up), cp2 = Math.cos(p), to = new THREE.Vector3(tx + Math.sin(INT.yaw) * dist * cp2, Math.min(1.0 + Math.sin(p) * dist, dist < 3.3 ? WH - 0.15 : WH + 1.2), tz + Math.cos(INT.yaw) * dist * cp2), dir = to.clone().sub(from), L = dir.length(); rc.set(from, dir.normalize()); rc.far = L - 0.1; rc.near = 0.35;
      const hit = rc.intersectObjects(objs, false).find(h => !(h.object.material && h.object.material.transparent)); INT._pUp = up; INT._dW = dist; if (!hit) break; } } }
  INT._pNow = (INT._pNow === undefined ? INT.pitch : INT._pNow) + (Math.min(1.25, INT.pitch + (INT._pUp || 0)) - (INT._pNow === undefined ? INT.pitch : INT._pNow)) * Math.min(1, dt * 4);
  INT._dNow = (INT._dNow || 3.4) + ((INT._dW || 3.4) - (INT._dNow || 3.4)) * Math.min(1, dt * 4); const dist = INT._dNow * (INT.zk || 1);
  const cp = Math.cos(INT._pNow); let cx = tx + Math.sin(INT.yaw) * dist * cp, cz = tz + Math.cos(INT.yaw) * dist * cp, cy = 1.0 + Math.sin(INT._pNow) * dist;
  cx = clamp(cx, -S.w / 2 + 0.3, S.w / 2 - 0.3); cz = clamp(cz, -S.d / 2 + 0.3, S.d / 2 + 2.5); cy = Math.min(cy, dist < 3.3 ? WH - 0.15 : WH + 1.2); const want = new THREE.Vector3(cx, cy, cz);
  if (INT._snap || camera.position.distanceTo(want) > 8) { camera.position.copy(want); INT._snap = false; INT._dNow = INT._dW || 3.4; } else camera.position.lerp(want, Math.min(1, dt * 6)); camera.lookAt(tx, 0.95, tz); };
INT.people = function (dt) { const R = GAME.place && GAME.place.ctx; if (!R || !R.people) return; const t = performance.now() / 1000; for (const q of R.people) { q.m.rotation.y = q.ry + Math.sin(t * 0.4 + q.ph) * 0.25; q.m.position.y = Math.abs(Math.sin(t * 1.3 + q.ph)) * 0.01; } };
// the room panel says which view you are in
{ const _ru = GAME.roomUI; GAME.roomUI = function () { const r = _ru.apply(this, arguments); try { const el = this.el.roomp; if (el && !el.querySelector('[data-r="view"]')) { el.insertAdjacentHTML('beforeend', `<button data-r="view">🎥 視点：${INT.NAMES[INT.mode]}（V）</button>`); el.querySelector('[data-r="view"]').onclick = e => { e.stopPropagation(); INT.toggle(); document.getElementById('c').focus(); }; } } catch (e) { } return r; }; }
// entering: snap the camera, face into the room
{ const _ep = GAME.enterPlace; GAME.enterPlace = function (pl) { INT._snap = true; INT.yaw = 0; SHOP.basket = []; return _ep.apply(this, arguments); }; }
// brighter, shop-like light inside public buildings
{ const _ur = GAME.updateRoom; GAME.updateRoom = function (dt) { _ur.apply(this, arguments); const pl = this.place; if (!ROOM.shopLight) { ROOM.shopLight = new THREE.HemisphereLight('#ffffff', '#c8c0b4', 0); ROOM.scene.add(ROOM.shopLight); } ROOM.shopLight.intensity = pl && !pl.P.dark ? (pl.P.light || 0.75) : 0; }; }
// ---------- ordering at a counter (café, soft cream, lounge): pay right away, then eat here or take out ----------
SHOP.openMenu = function (title, ids) { const g = GAME; g.modal = 'menu'; SHOP.mq = SHOP.mq || {};
  const tot = ids.reduce((s, id) => s + (SHOP.mq[id] || 0) * GOODS.byId[id].price, 0), n = ids.reduce((s, id) => s + (SHOP.mq[id] || 0), 0);
  const cards = ids.filter(id => GOODS.byId[id]).map(id => { const P = GOODS.byId[id], q = SHOP.mq[id] || 0; return `<div class="gcard"><img src="${GOODS.thumb(id)}" alt=""><div class="gi2"><b>${esc(P.name)}</b><span class="pr">${yen(P.price)}</span><span class="nt">${esc(P.note)}</span><span class="us">${SHOP.useText(P)}</span></div><div class="gq"><button data-mq="${id}|-1">−</button><span>${q}</span><button data-mq="${id}|1">＋</button></div></div>`; }).join('');
  g.el.modal.innerHTML = `<div class="mbox shelfbox"><div class="mh"><h2>📋 ${esc(title)}</h2><span class="isl">所持金 ${yen(g.p.money)}</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div class="gcards">${cards}</div></div><div class="mf">ご注文 ${n}点 ${yen(tot)}<button class="primary" data-order="1" ${!n || g.p.money < tot ? 'disabled' : ''}>注文して支払う</button>${g.p.money < tot ? '<small style="color:#c8322a">お金がたりません</small>' : ''}</div></div>`;
  g.el.modal.hidden = false; g.el.modal.querySelector('.shelfbox').onclick = e => { if (e.target.closest('[data-x]')) { SHOP.mq = {}; return g.closeModal(); } const q = e.target.closest('[data-mq]'); if (q) { const [id, d] = q.dataset.mq.split('|'); SHOP.mq[id] = clamp((SHOP.mq[id] || 0) + +d, 0, 5); return SHOP.openMenu(title, ids); }
    if (e.target.closest('[data-order]')) { const list = []; for (const id of ids) for (let k = 0; k < (SHOP.mq[id] || 0); k++) list.push({ id, sec: null }); SHOP.mq = {}; const keep = SHOP.basket; SHOP.basket = list; SHOP.pay(); SHOP.basket = keep; } }; };
// ---------- helpers for layouts ----------
const SEC = (name, ...lv) => ({ name, lv });
INT.seatTable = function (R, x, z, o = {}) { const n = o.n || 2, r = o.r || 0.36; FIX.cafeTable(R, x, z, o); for (let i = 0; i < n; i++) { const a = (o.a0 || 0) + i * Math.PI * 2 / n; R.seats.push({ x: x + Math.sin(a) * (r + 0.3), z: z + Math.cos(a) * (r + 0.3), ry: a + Math.PI, tx: x + Math.sin(a) * r * 0.45, tz: z + Math.cos(a) * r * 0.45 }); } };
INT.def = function (key, o) { const P = PLACES[key]; Object.assign(P, o); };
// ======================= 道の駅 =======================
INT.def('michinoeki', { size: 'eki', wall: 'timber', floor: 'woodfloor', wh: 3.6, light: 0.8,
  staff: { x: 2.6, z: 3.3, ry: 0, shirt: '#e88a2a', apron: '#3a6a3a', who: '道の駅の店員', lines: ['いらっしゃいませ〜！ 島のとれたて野菜、ありますよ。', '名物のみかんソフト、ぜひどうぞ！', 'お会計はこちらでどうぞ〜。'] },
  build(group, W, D) { const R = INT.ctx(group, W, D, 3.6), M = FIX.mats(), P = PLACES.michinoeki;
    // back wall: fish / deli / drinks / bread / soft cream
    FIX.lowCase(R, -7.9, -6.5, 0, { w: 2.6, d: 0.85, ice: true, back: true, head: '鮮魚', headBg: '#1a5a9a', name: '鮮魚（とれたて）', rows: [['sashimi', 'shirasu', 'anago'], ['f_aji', 'f_mebaru', 'tako_b'], ['f_madai', 'f_sawara', 'oyster']] });
    FIX.shelves(R, -4.85, -6.62, 0, { type: 'reefer', head: 'お弁当・おそうざい', headBg: '#c8322a', front: [SEC('お弁当', ['makunouchi', 'karaben'], ['sabazushi', 'inari'], ['oni_ume', 'oni_shake', 'oni_konbu'], ['sandwich', 'korokke']), SEC('おそうざい・とうふ', ['yakisoba', 'tamagoyaki'], ['tofu', 'natto', 'eggs'], ['chikuwa', 'kamaboko'], ['yogurt', 'coffeemilk'])] });
    FIX.shelves(R, -2.15, -6.62, 0, { type: 'reefer', head: '飲み物', headBg: '#2a6ab0', front: [SEC('お茶・水', ['ocha2l', 'water2l'], ['ocha', 'hojicha', 'mugicha'], ['water', 'sports', 'lactic'], ['milk', 'coffeemilk']), SEC('ジュース・島の牛乳', ['mikanjuice', 'juicegift'], ['lemonsq', 'cola', 'coffeecan'], ['ramune', 'mikanjuice'], ['milk', 'yogurt'])] });
    FIX.shelves(R, 1.0, -6.74, 0, { type: 'wood', head: '島のパン', headBg: '#a8682a', d: 0.45, front: [SEC('島のパン', ['shokupan'], ['melonpan', 'anpan'], ['mikanbread']), SEC('パン', ['shokupan'], ['currypan', 'croissant'], ['melonpan'])] });
    { const c = FIX.reception(R, 6.6, -5.35, 0, { w: 2.6, sign: 'みかんソフト・ドリンク', signBg: '#f39a1e', signFg: '#ffffff', top: '#f6f2ea', front: '#e8902a', bell: false }); FIX.softServe(R.g, 6.0, 0, -6.55, 0); FIX.espresso(R.g, 7.3, 0.75, -6.45, 0); FIX.menuBoard(R.g, 6.6, 2.35, -6.97, 0, 'みかんソフト・ドリンク', [['みかんソフト', 380], ['生しぼりみかん', 500], ['テイクアウトコーヒー', 380]], 1.6, 0.9);
      INT.person(R, 6.0, -6.05, 0, '#f39a1e', { apron: '#ffffff' }); R.acts.push({ x: 6.6, z: -4.65, r: 0.95, label: 'ソフトクリーム・ドリンクを注文する', fn: () => SHOP.openMenu('みかんソフト・ドリンク', ['c_softcream', 'c_mikan', 'c_takeout']) }); }
    // centre gondolas
    FIX.shelves(R, 0.4, -3.35, 0, { head: 'お菓子・インスタント', front: [SEC('インスタント', ['rice5'], ['cupnoodle', 'cupudon'], ['cupyakisoba', 'curry'], ['tuna', 'mikancan']), SEC('乾物', ['somen'], ['nori', 'katsuobushi'], ['chirimen', 'salt']), SEC('調味料', ['shoyu', 'miso'], ['ponzu', 'mirin'], ['sugar', 'mayo'])],
      back: [SEC('お菓子', ['senbei', 'karinto'], ['chips', 'chipsnori'], ['biscuit', 'choco'], ['gummy', 'caramel']), SEC('島のおやつ', ['takosenbei'], ['mikanjam', 'lemoncurd'], ['honey', 'gummy']), SEC('お菓子', ['chips', 'senbei'], ['biscuit', 'karinto'], ['caramel', 'choco'])] });
    FIX.shelves(R, 0.4, -0.35, 0, { head: '島の名産', headBg: '#c8322a', front: [SEC('島の名産', ['mikanjam', 'lemoncurd'], ['honey', 'saltgift'], ['chirimen', 'nori']), SEC('みかん加工品', ['juicegift'], ['mikancan', 'gummy'], ['mikanjam', 'honey']), SEC('調味料', ['shoyu', 'ponzu'], ['salt', 'miso'], ['saltgift', 'katsuobushi'])],
      back: [SEC('おみやげ', ['mikanmanju', 'shimanami_manju'], ['lemoncake', 'yokan'], ['takosenbei']), SEC('おみやげ', ['juicegift'], ['mikanmanju', 'lemoncake'], ['yokan', 'saltgift']), SEC('手ぬぐい', ['tenugui_wave', 'tenugui_mikan'], ['tenugui_wave'], ['tenugui_mikan'])] });
    // produce (left)
    FIX.produceTable(R, -7.4, 2.7, 0, { w: 2.2, d: 1.0, name: '島の野菜', rows: [['daikon', 'cabbage', 'hakusai'], ['kabu', 'hourensou', 'negi']] });
    FIX.produceTable(R, -4.5, 2.7, 0, { w: 2.2, d: 1.0, name: '島の野菜', rows: [['tamanegi', 'jagaimo', 'ninjin'], ['tomato', 'kyuri', 'nasu']] });
    FIX.produceTable(R, -7.4, -0.4, 0, { w: 2.2, d: 1.0, name: '野菜・きのこ', rows: [['kabocha', 'satsumaimo', 'edamame'], ['shiitake', 'lemon', 'kaki']] });
    FIX.produceTable(R, -4.5, -0.4, 0, { w: 2.2, d: 1.0, name: 'くだもの', rows: [['mikanbag', 'hassaku', 'dekopon'], ['grape', 'mikanbag', 'lemon']] });
    FIX.produceTable(R, -9.55, -3.6, Math.PI / 2, { w: 2.0, d: 0.7, tilt: 0.3, name: 'みかん（箱）', rows: [['mikanbox', 'mikanbox']] });
    FIX.produceTable(R, -8.0, 5.65, 0, { w: 2.4, d: 0.85, tilt: 0.35, tray: 'wood', name: '花・苗', rows: [['pot_red', 'pot_yellow', 'pot_white'], ['pot_herb', 'bouquet', 'pot_herb']] });
    FIX.pegWall(R, -9.8, 0.9, Math.PI / 2, { w: 1.6, h: 1.4, head: 'たね', headBg: '#3a8a3a', name: '野菜のたね', ids: GOODS.defs.filter(d => d.cat === 'seed').map(d => d.id), cols: 4 });
    // souvenirs (right wall) & soft-cream tables
    FIX.shelves(R, 9.73, -2.6, -Math.PI / 2, { type: 'wood', d: 0.45, head: 'おみやげ', headBg: '#8a3a2a', front: [SEC('おみやげ（お菓子）', ['mikanmanju', 'shimanami_manju'], ['lemoncake', 'takosenbei'], ['yokan', 'a_cookie']), SEC('おみやげ（島の味）', ['juicegift'], ['mikanjam', 'honey'], ['saltgift', 'lemoncurd']), SEC('おみやげ（小物）', ['tenugui_wave', 'tenugui_mikan'], ['ukidama'], ['seaglass_lamp'])] });
    FIX.pegWall(R, 9.8, 0.9, -Math.PI / 2, { w: 1.5, h: 1.4, head: 'キーホルダー・はがき', headBg: '#2a6ab0', name: 'キーホルダー・はがき', ids: ['keyholder', 'magnet', 'postcard', 'a_key', 'letterset', 'keyholder'], cols: 3 });
    FIX.produceTable(R, 6.0, -1.3, 0, { w: 2.0, d: 0.9, tilt: 0.05, tray: 'wood', cloth: '#2a4a8a', name: 'おみやげ（おすすめ）', rows: [['mikanmanju', 'lemoncake'], ['shimanami_manju', 'takosenbei']] });
    INT.seatTable(R, 5.6, 1.6, { n: 2, a0: Math.PI / 2 }); INT.seatTable(R, 7.6, 1.6, { n: 2, a0: Math.PI / 2 });
    // registers, 出荷受付, baskets, info
    FIX.register(R, 2.6, 4.0, 0, {}); FIX.register(R, 5.0, 4.0, 0, { sign: 'レジ 2' }); INT.person(R, 5.0, 3.35, 0, '#e88a2a', { apron: '#3a6a3a' });
    FIX.reception(R, 9.35, 4.4, -Math.PI / 2, { w: 1.8, sign: '出荷受付', signBg: '#2f7a4a', signFg: '#ffffff', top: '#e8e2d6', front: '#8a6440' }); INT.person(R, 9.75, 4.4, -Math.PI / 2, '#2f7a4a', { apron: '#e8e2d6' });
    R.acts.push({ x: 8.55, z: 4.4, r: 0.9, label: 'みかんや魚を出荷する（出荷受付）', fn: () => GAME.openShip() });
    FIX.baskets(R, -1.9, 5.9, 0, 'R'); FIX.cart(R, -2.8, 6.0, 0.1); FIX.pamphlets(R, 2.4, 6.5, Math.PI); FIX.islandMap(R.g, 9.97, 1.75, 6.0, -Math.PI / 2, 1.6, 1.1); FIX.trashBins(R, 7.4, 6.55, Math.PI);
    FIX.window(R.g, -9.98, 1.9, 5.4, Math.PI / 2, 2.4, 1.2, 'land'); FIX.window(R.g, -9.98, 1.9, 2.0, Math.PI / 2, 2.4, 1.2, 'land'); FIX.clock(R.g, -0.6, 2.9, -6.97, 0); FIX.extinguisher(R.g, -9.7, -5.6, Math.PI / 2);
    FIX.travelPoster(R.g, 3.4, 2.4, -6.98, 0, 'みかん狩り', 'mikan', '#ffd28a', '#3a8a3a'); FIX.travelPoster(R.g, 4.1, 2.4, -6.98, 0, '夕日の浜', 'sun', '#ffb07a', '#2a6ab0');
    for (const [t, x, z] of [['島の野菜', -6.0, 1.1], ['くだもの・みかん', -6.0, -1.6], ['鮮魚', -7.9, -5.0], ['お弁当', -4.85, -5.0], ['飲み物', -2.15, -5.0], ['おみやげ', 8.4, -2.6], ['お菓子・名産', 0.4, -1.85]]) FIX.hangSign(R, t, x, z, 0, 2.9, Math.max(1.2, t.length * 0.28));
    // other customers
    INT.person(R, -6.2, 3.9, Math.PI, '#5a8ac8'); INT.person(R, 1.2, -4.6, 0, '#c86a8a'); INT.person(R, -4.0, 0.75, Math.PI, '#8a8a5a', { small: true });
    INT.finish(R, P); } });
