// ===================== 写真モード（X）とアルバム・島の名所めぐり =====================
// X で写真モード: 画面の表示が消えて、カメラを自由に動かせる（ドラッグ＝回す、ホイール＝近づく／はなれる、WASD＝移動、R/F＝上下、Q/E＝回す）。
// フィルター（あざやか・フィルム・夕やけ・モノクロ・セピア）、日付の写しこみ、自分を写す／消す、ズーム。Space / Enter / ボタンで撮影。
// 撮った写真はこのブラウザのアルバムに保存（大きく見る・書き出す・消す）。島の名所 10 か所を条件どおりに撮ると、元気度がもらえる。
const PHOTO = { on: false, keys: {}, yaw: 0, pitch: 0.18, dist: 5, piv: new THREE.Vector3(), fov: 55, filter: 0, stamp: false, hideMe: false, lastT: 0, drag: null, db: null };
PHOTO.FILTERS = [
  { name: 'そのまま', css: '', ops: [] },
  { name: 'あざやか', css: 'saturate(1.28) contrast(1.06)', ops: [['saturate', 1.28], ['contrast', 1.06]] },
  { name: 'フィルム', css: 'saturate(0.86) contrast(0.93) sepia(0.14) brightness(1.04)', ops: [['saturate', 0.86], ['contrast', 0.93], ['sepia', 0.14], ['brightness', 1.04]] },
  { name: '夕やけ', css: 'sepia(0.3) saturate(1.35) hue-rotate(-8deg)', ops: [['sepia', 0.3], ['saturate', 1.35], ['hue', -8]] },
  { name: 'モノクロ', css: 'grayscale(1) contrast(1.12)', ops: [['grayscale', 1], ['contrast', 1.12]] },
  { name: 'セピア', css: 'sepia(0.85) contrast(1.03)', ops: [['sepia', 0.85], ['contrast', 1.03]] },
];
// ---------- colour matrices (the CSS filter functions, so the saved photo matches the preview in every browser) ----------
PHOTO.mat = function (ops) {
  let M = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]; // 3x4: rgb rows + offset
  const mul = (A) => { const R = []; for (let r = 0; r < 3; r++) { for (let c = 0; c < 3; c++) R.push(A[r * 4] * M[c] + A[r * 4 + 1] * M[4 + c] + A[r * 4 + 2] * M[8 + c]); R.push(A[r * 4] * M[3] + A[r * 4 + 1] * M[7] + A[r * 4 + 2] * M[11] + A[r * 4 + 3]); } M = R; };
  for (const [k, a] of ops) {
    if (k === 'saturate') { const s = a; mul([0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0, 0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0, 0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0]); }
    if (k === 'grayscale') { const s = 1 - a; mul([0.2126 + 0.7874 * s, 0.7152 - 0.7152 * s, 0.0722 - 0.0722 * s, 0, 0.2126 - 0.2126 * s, 0.7152 + 0.2848 * s, 0.0722 - 0.0722 * s, 0, 0.2126 - 0.2126 * s, 0.7152 - 0.7152 * s, 0.0722 + 0.9278 * s, 0]); }
    if (k === 'sepia') { const s = 1 - a; mul([0.393 + 0.607 * s, 0.769 - 0.769 * s, 0.189 - 0.189 * s, 0, 0.349 - 0.349 * s, 0.686 + 0.314 * s, 0.168 - 0.168 * s, 0, 0.272 - 0.272 * s, 0.534 - 0.534 * s, 0.131 + 0.869 * s, 0]); }
    if (k === 'contrast') { const o = 0.5 * (1 - a); mul([a, 0, 0, o, 0, a, 0, o, 0, 0, a, o]); }
    if (k === 'brightness') mul([a, 0, 0, 0, 0, a, 0, 0, 0, 0, a, 0]);
    if (k === 'hue') { const t = a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); mul([0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0, 0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283, 0, 0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0]); }
  }
  return M;
};
PHOTO.grade = function (ctx, w, h, ops) {
  if (!ops.length) return; const M = PHOTO.mat(ops), im = ctx.getImageData(0, 0, w, h), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    d[i] = 255 * (M[0] * r + M[1] * g + M[2] * b + M[3]); d[i + 1] = 255 * (M[4] * r + M[5] * g + M[6] * b + M[7]); d[i + 2] = 255 * (M[8] * r + M[9] * g + M[10] * b + M[11]); }
  ctx.putImageData(im, 0, 0);
};
// ---------- the album (IndexedDB, this browser only) ----------
PHOTO.idb = function () {
  if (PHOTO._p) return PHOTO._p;
  PHOTO._p = new Promise(res => { try { const rq = indexedDB.open('hoshinami2-photos', 1); rq.onupgradeneeded = () => { try { rq.result.createObjectStore('ph', { keyPath: 'at' }); } catch (e) { } }; rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null); rq.onblocked = () => res(null); } catch (e) { res(null); } });
  return PHOTO._p;
};
PHOTO.tx = (mode, fn) => PHOTO.idb().then(db => db ? new Promise(res => { try { const t = db.transaction('ph', mode), st = t.objectStore('ph'); let out = true; const r = fn(st); if (r) r.onsuccess = () => { out = r.result; }; t.oncomplete = () => res(out); t.onerror = t.onabort = () => res(null); } catch (e) { res(null); } }) : null);
PHOTO.list = async () => { const a = await PHOTO.tx('readonly', st => st.getAll()); return Array.isArray(a) ? a.sort((x, y) => y.at - x.at) : null; };
// ---------- 島の名所 ----------
PHOTO.hour = () => currentHour();
PHOTO.inView = function (x, y, z, maxD, margin = 0.82) {
  const v = new THREE.Vector3(x, y, z), d = v.distanceTo(camera.position); if (d > maxD) return false;
  v.project(camera); return v.z < 1 && Math.abs(v.x) < margin && Math.abs(v.y) < margin;
};
PHOTO.SPOTS = [
  { id: 'torii', name: '神社の鳥居', hint: '神社の赤い鳥居を写す', ok: () => { const S = PLACED.church; return S && PHOTO.inView(S.x, groundH(S.x, S.z) + 3, S.z, 70); } },
  { id: 'lightNight', name: '夜の灯台', hint: '夜（19時〜4時）に灯台を写す', ok: () => { const h = PHOTO.hour(), L = PLACED.lighthouse; return L && (h >= 19 || h < 4) && PHOTO.inView(L.x, groundH(L.x, L.z) + 8, L.z, 260); } },
  { id: 'sunset', name: '夕日の海', hint: '夕方（16時半〜18時半）、太陽のほうの海を写す', ok: () => { const h = PHOTO.hour(); if (h < 16.5 || h > 18.7) return false; const u = SKY.dome && SKY.dome.material && SKY.dome.material.uniforms && SKY.dome.material.uniforms.sunDir; if (!u) return false; const s = u.value, f = new THREE.Vector3(); camera.getWorldDirection(f); const a = Math.hypot(f.x, f.z) * Math.hypot(s.x, s.z); return a > 0 && (f.x * s.x + f.z * s.z) / a > 0.8; } },
  { id: 'harbor', name: '港と漁船', hint: '港に泊まっている船といっしょに', ok: () => { const H = PLACED.harbor; return H && PHOTO.inView(H.x, 1, H.z, 90) && VEH.some(v => v.kind === 'boat' && PHOTO.inView(v.x, 1, v.z, 90)); } },
  { id: 'paddy', name: '田んぼのある風景', hint: '田んぼを写す（季節で色が変わる）', ok: () => (CTRY.paddies || []).some(p => PHOTO.inView(p.x, p.y || groundH(p.x, p.z), p.z, 80)) },
  { id: 'mikan', name: 'みかん畑', hint: '丘のみかん畑を写す', ok: () => { const M = GAME.LM && GAME.LM.mikan; return M && PHOTO.inView(M.x, groundH(M.x, M.z) + 1.5, M.z, 90); } },
  { id: 'falls', name: '滝', hint: '滝を写す', ok: () => { const F = GAME.LM && GAME.LM.falls; return F && PHOTO.inView(F.x, groundH(F.x, F.z) + 2, F.z, 90); } },
  { id: 'vista', name: '島の全景', hint: '高い所から、集落を見おろして写す', ok: () => camera.position.y - Math.max(0, groundH(camera.position.x, camera.position.z)) > -1 && camera.position.y > 26 && PHOTO.inView(VILLAGE.x, groundH(VILLAGE.x, VILLAGE.z), VILLAGE.z, 600, 0.6) },
  { id: 'friend', name: '住民と記念写真', hint: '自分と住民をいっしょに、近くで写す', ok: () => !PHOTO.hideMe && PHOTO.inView(PL.x, PL.y + 1, PL.z, 14) && NPCS.some(n => n.mesh && n.mesh.visible && PHOTO.inView(n.x, (n.y || groundH(n.x, n.z)) + 1, n.z, 14)) },
  { id: 'rain', name: '雨の日の島', hint: '雨か嵐の日に、外で写す', ok: () => (TIME.weather === 'rain' || TIME.weather === 'storm') && !GAME.inside },
];
PHOTO.done = () => { const p = GAME.p; return p ? (p.photoSpots = p.photoSpots || {}) : {}; };
PHOTO.checkSpots = function () {
  const D = PHOTO.done(), got = [];
  for (const s of PHOTO.SPOTS) { if (D[s.id]) continue; let ok = false; try { ok = s.ok(); } catch (e) { ok = false; } if (ok) { D[s.id] = typeof todayKey === 'function' ? todayKey() : 1; got.push(s); } }
  if (got.length && GAME.p) { GAME.p.vit = (GAME.p.vit || 0) + 20 * got.length; GAME.dirty = true; try { GAME.renderTracker(); } catch (e) { } }
  return got;
};
// ---------- camera ----------
PHOTO.open = function () {
  if (PHOTO.on || !GAME.p || GAME.inside || EDIT.on || (typeof DEMO !== 'undefined' && DEMO.on && false)) return false;
  if (GAME.modal) return false;
  PHOTO.on = true; GAME.modal = 'photo'; window.__freecam = true; PHOTO.keys = {};
  const f = PL.veh ? new THREE.Vector3(PL.veh.x, PL.veh.mesh.position.y + 1.2, PL.veh.z) : new THREE.Vector3(PL.x, PL.y + 1.0, PL.z);
  PHOTO.piv.copy(f); PHOTO.home = f.clone(); PHOTO.yaw = CAM.yaw; PHOTO.pitch = Math.max(0.05, CAM.pitch); PHOTO.dist = Math.max(3, CAM.dist || 5); PHOTO.fov = camera.fov; PHOTO.fov0 = camera.fov; PHOTO.camD = CAM.distT;
  PHOTO.hud = [document.getElementById('hud'), document.getElementById('game')].filter(Boolean).map(e => [e, e.style.visibility]); PHOTO.hud.forEach(([e]) => e.style.visibility = 'hidden');
  PHOTO.ui(); PHOTO.applyFilter(); PHOTO.lastT = performance.now(); SEE.on.value = 0;
  return true;
};
PHOTO.close = function () {
  if (!PHOTO.on) return; PHOTO.on = false; GAME.modal = null; window.__freecam = false; PL.mesh.visible = true; if (PL.veh) PL.veh.mesh.visible = true;
  camera.fov = PHOTO.fov0 || camera.fov; camera.updateProjectionMatrix(); if (PHOTO.camD) CAM.distT = PHOTO.camD; renderer.domElement.style.filter = '';
  (PHOTO.hud || []).forEach(([e, v]) => e.style.visibility = v); const u = document.getElementById('photoUI'); if (u) u.remove(); CAM.snap = true; document.getElementById('c').focus();
};
PHOTO.update = function () {
  const now = performance.now(), dt = Math.min(0.05, (now - PHOTO.lastT) / 1000); PHOTO.lastT = now; const K = PHOTO.keys;
  const fw = new THREE.Vector3(-Math.sin(PHOTO.yaw), 0, -Math.cos(PHOTO.yaw)), rt = new THREE.Vector3(-fw.z, 0, fw.x), sp = (K.ShiftLeft || K.ShiftRight ? 14 : 6) * dt;
  if (K.KeyW) PHOTO.piv.addScaledVector(fw, sp); if (K.KeyS) PHOTO.piv.addScaledVector(fw, -sp); if (K.KeyD) PHOTO.piv.addScaledVector(rt, sp); if (K.KeyA) PHOTO.piv.addScaledVector(rt, -sp);
  if (K.KeyR) PHOTO.piv.y += sp; if (K.KeyF) PHOTO.piv.y -= sp; if (K.KeyQ) PHOTO.yaw += dt * 1.4; if (K.KeyE) PHOTO.yaw -= dt * 1.4;
  // stay within 70 m of where you stand, and above the ground / sea
  const off = PHOTO.piv.clone().sub(PHOTO.home); off.y = 0; if (off.length() > 70) PHOTO.piv.copy(PHOTO.home).add(off.setLength(70)).setY(PHOTO.piv.y);
  PHOTO.piv.y = clamp(PHOTO.piv.y, Math.max(0, groundH(PHOTO.piv.x, PHOTO.piv.z)) + 0.3, 90);
  const cp = Math.cos(PHOTO.pitch), pos = new THREE.Vector3(PHOTO.piv.x + Math.sin(PHOTO.yaw) * cp * PHOTO.dist, PHOTO.piv.y + Math.sin(PHOTO.pitch) * PHOTO.dist, PHOTO.piv.z + Math.cos(PHOTO.yaw) * cp * PHOTO.dist);
  const gy = Math.max(groundH(pos.x, pos.z), 0) + 0.25; if (pos.y < gy) pos.y = gy;
  camera.position.copy(pos); camera.lookAt(PHOTO.piv); if (Math.abs(camera.fov - PHOTO.fov) > 0.01) { camera.fov = PHOTO.fov; camera.updateProjectionMatrix(); }
  PL.mesh.visible = !PHOTO.hideMe; if (PL.veh) PL.veh.mesh.visible = true; SEE.on.value = 0;
};
PHOTO.applyFilter = function () { renderer.domElement.style.filter = PHOTO.FILTERS[PHOTO.filter].css; const b = document.querySelector('#photoUI [data-p="filter"]'); if (b) b.textContent = '🎨 ' + PHOTO.FILTERS[PHOTO.filter].name; };
// ---------- shoot ----------
PHOTO.stampText = () => { const d = typeof seasonDate === 'function' ? seasonDate() : new Date(), z = n => String(n).padStart(2, '0'); return `'${z(d.getFullYear() % 100)} ${z(d.getMonth() + 1)} ${z(d.getDate())}`; };
PHOTO.shoot = async function () {
  if (!PHOTO.on || PHOTO.busy) return; PHOTO.busy = true;
  try {
    PHOTO.update(); composer.render(0);
    const src = renderer.domElement, w = src.width, h = src.height, c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0); PHOTO.grade(ctx, w, h, PHOTO.FILTERS[PHOTO.filter].ops);
    if (PHOTO.stamp) { const fs = Math.round(h * 0.045); ctx.font = `700 ${fs}px "DSEG7 Classic", ui-monospace, Menlo, monospace`; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.shadowColor = 'rgba(255,120,30,0.9)'; ctx.shadowBlur = fs * 0.35; ctx.fillStyle = '#ffa33a'; ctx.fillText(PHOTO.stampText(), w - fs * 1.2, h - fs * 0.9); ctx.shadowBlur = 0; }
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
    const tw = 320, th = Math.round(h * tw / w), t = document.createElement('canvas'); t.width = tw; t.height = th; t.getContext('2d').drawImage(c, 0, 0, tw, th);
    const rec = { at: Date.now() + Math.random(), blob, thumb: t.toDataURL('image/jpeg', 0.8), w, h, filter: PHOTO.FILTERS[PHOTO.filter].name, hour: PHOTO.hour(), weather: TIME.weather, island: GAME.p && GAME.p.island };
    const got = PHOTO.checkSpots(); rec.spots = got.map(s => s.id);
    const ok = await PHOTO.tx('readwrite', st => st.put(rec));
    PHOTO.flash(); try { SND.play('latch', { vol: 0.8 }); } catch (e) { }
    const msg = document.querySelector('#photoUI .pmsg');
    if (msg) { const n = PHOTO.SPOTS.length - Object.keys(PHOTO.done()).length; msg.textContent = got.length ? `📸 名所「${got.map(s => s.name).join('」「')}」を撮った！ 元気度 +${20 * got.length}（のこり ${n} か所）` : ok ? '📸 アルバムに保存しました' : '📸 撮りました（このブラウザではアルバムに保存できません）'; msg.classList.remove('go'); void msg.offsetWidth; msg.classList.add('go'); }
    PHOTO.last = rec;
  } catch (e) { console.warn('photo', e); } finally { PHOTO.busy = false; }
};
PHOTO.flash = function () { const f = document.createElement('div'); f.className = 'pflash'; document.body.appendChild(f); setTimeout(() => f.remove(), 450); };
// ---------- UI ----------
PHOTO.ui = function () {
  const u = document.createElement('div'); u.id = 'photoUI';
  u.innerHTML = `<div class="ptop"><b>📷 写真モード</b><span>ドラッグ：回す　ホイール：近づく　WASD：動く　R/F：上下　Q/E：回す　Shift：はやく</span><button data-p="close">もどる（Esc）</button></div>
    <div class="pbot"><button data-p="filter">🎨 そのまま</button><label class="pz">🔍<input type="range" min="18" max="80" step="1" value="${Math.round(PHOTO.fov)}" data-p="fov"></label><button data-p="me">${PHOTO.hideMe ? '🙈 自分：うつさない' : '🙂 自分：うつす'}</button><button data-p="stamp">${PHOTO.stamp ? '📅 日付：あり' : '📅 日付：なし'}</button><button class="shot" data-p="shot" title="撮る（Space）"></button><button data-p="album">📒 アルバム</button></div>
    <div class="pmsg" role="status"></div>`;
  document.body.appendChild(u);
  u.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; const k = b.dataset.p;
    if (k === 'close') PHOTO.close(); if (k === 'shot') PHOTO.shoot(); if (k === 'album') { PHOTO.close(); GAME.openAlbum(); }
    if (k === 'filter') { PHOTO.filter = (PHOTO.filter + 1) % PHOTO.FILTERS.length; PHOTO.applyFilter(); }
    if (k === 'me') { PHOTO.hideMe = !PHOTO.hideMe; b.textContent = PHOTO.hideMe ? '🙈 自分：うつさない' : '🙂 自分：うつす'; }
    if (k === 'stamp') { PHOTO.stamp = !PHOTO.stamp; b.textContent = PHOTO.stamp ? '📅 日付：あり' : '📅 日付：なし'; }
    document.getElementById('c').focus(); });
  u.querySelector('[data-p="fov"]').addEventListener('input', e => { PHOTO.fov = +e.target.value; });
};
// input while the photo mode is open (the game's own movement keys are paused by the modal)
addEventListener('keydown', e => { if (!PHOTO.on || e.target.tagName === 'INPUT' && e.target.type !== 'range') return; PHOTO.keys[e.code] = true;
  if (e.code === 'Escape' || (e.code === 'KeyX' && !e.repeat)) { e.preventDefault(); e.stopImmediatePropagation(); PHOTO.close(); return; }
  if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); PHOTO.shoot(); } }, true);
addEventListener('keyup', e => { if (PHOTO.on) PHOTO.keys[e.code] = false; }, true);
addEventListener('blur', () => { PHOTO.keys = {}; });
{ const cv = () => document.getElementById('c');
  addEventListener('pointerdown', e => { if (!PHOTO.on || e.target !== cv()) return; PHOTO.drag = { x: e.clientX, y: e.clientY }; }, true);
  addEventListener('pointermove', e => { if (!PHOTO.on || !PHOTO.drag) return; const dx = e.clientX - PHOTO.drag.x, dy = e.clientY - PHOTO.drag.y; PHOTO.drag = { x: e.clientX, y: e.clientY }; PHOTO.yaw -= dx * 0.005; PHOTO.pitch = clamp(PHOTO.pitch + dy * 0.004, -0.6, 1.45); }, true);
  addEventListener('pointerup', () => { PHOTO.drag = null; }, true);
  addEventListener('wheel', e => { if (!PHOTO.on || e.target !== cv()) return; PHOTO.dist = clamp(PHOTO.dist * (e.deltaY > 0 ? 1.12 : 0.9), 0.6, 45); }, { capture: true, passive: true }); }
{ const _ok = GAME.onKey; GAME.onKey = function (e) { if (e.code === 'KeyX' && !e.repeat && this.p && !this.modal && !EDIT.on && !this.inside && !PHOTO.on) { if (PHOTO.open()) return true; } return _ok.apply(this, arguments); }; }
{ const _u = updateStructures; updateStructures = function () { const r = _u.apply(this, arguments); if (PHOTO.on) PHOTO.update(); return r; }; }
{ const _c = GAME.closeModal; GAME.closeModal = function () { if (this.modal === 'photo') return PHOTO.close(); return _c.apply(this, arguments); }; }
// ---------- album ----------
GAME.openAlbum = function (tab) {
  if (!this.p) return; this.modal = 'album'; const m = this.el.modal, D = PHOTO.done(), nd = PHOTO.SPOTS.filter(s => D[s.id]).length; PHOTO.atab = tab || PHOTO.atab || 'photos';
  m.innerHTML = `<div class="mbox journal albumbox"><div class="mh"><h2>📒 アルバム</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="tabs"><button data-at="photos" class="${PHOTO.atab === 'photos' ? 'on' : ''}">写真</button><button data-at="spots" class="${PHOTO.atab === 'spots' ? 'on' : ''}">島の名所 ${nd}/${PHOTO.SPOTS.length}</button></div><div class="mb">
    ${PHOTO.atab === 'spots' ? `<ul class="list">${PHOTO.SPOTS.map(s => `<li class="${D[s.id] ? 'done' : ''}"><span class="ck">${D[s.id] ? '✓' : '📷'}</span><div><b>${s.name}</b><div class="sub">${s.hint}</div></div><span class="pts">+20</span></li>`).join('')}</ul><p class="small">写真モード（X）で、条件にあう写真を撮ると記録されます。</p>`
      : `<div class="agrid"><p class="small">読み込んでいます…</p></div><p class="small">写真はこのブラウザに保存されます。残したい写真は「書き出す」で保存してください。写真モードは X キー。</p>`}
  </div></div>`;
  m.hidden = false;
  const box = m.querySelector('.albumbox');
  if (PHOTO.atab === 'photos') PHOTO.list().then(all => { const gEl = box.querySelector('.agrid'); if (!gEl || !box.isConnected) return; if (!all) { gEl.innerHTML = '<p class="small">このブラウザではアルバムが使えません。</p>'; return; } PHOTO.all = all;
    gEl.innerHTML = all.length ? all.map((r, i) => `<button class="ph" data-ph="${i}"><img src="${r.thumb}" alt=""><span>${SAFE.when(r.at)}${r.spots && r.spots.length ? ' ⭐' : ''}</span></button>`).join('') : '<p class="small">まだ写真がありません。X キーで写真モードにして撮ってみよう。</p>'; });
  box.onclick = async e => {
    if (e.target.closest('[data-x="close"]')) return this.closeModal();
    const t = e.target.closest('[data-at]'); if (t) return this.openAlbum(t.dataset.at);
    const ph = e.target.closest('[data-ph]'); if (ph) return PHOTO.view(+ph.dataset.ph);
    const a = e.target.closest('[data-pa]'); if (!a) return; const r = PHOTO.cur; if (!r) return;
    if (a.dataset.pa === 'back') return this.openAlbum('photos');
    if (a.dataset.pa === 'save') { const res = await SAFE.download(`ほしなみ島-写真-${SAFE.fname().replace(/^.*?-(\d{8}-\d{4})\.json$/, '$1')}.jpg`, r.blob); const msg = box.querySelector('.pvmsg'); if (msg) msg.textContent = res === 'saved' || res === 'started' ? '書き出しました' : res === 'declined' ? 'やめました' : '書き出せませんでした'; }
    if (a.dataset.pa === 'del') { if (!a.classList.contains('warn')) { a.classList.add('warn'); a.textContent = '本当に消す'; return; } await PHOTO.tx('readwrite', st => st.delete(r.at)); this.openAlbum('photos'); }
  };
};
PHOTO.view = function (i) {
  const r = PHOTO.all && PHOTO.all[i]; if (!r) return; PHOTO.cur = r; const mb = document.querySelector('#game .albumbox .mb'); if (!mb) return;
  if (PHOTO.url) URL.revokeObjectURL(PHOTO.url); PHOTO.url = URL.createObjectURL(r.blob);
  const sp = (r.spots || []).map(id => (PHOTO.SPOTS.find(s => s.id === id) || {}).name).filter(Boolean);
  mb.innerHTML = `<div class="pview"><img src="${PHOTO.url}" alt=""><div class="pinfo">${SAFE.when(r.at)}　${esc(r.filter || '')}${sp.length ? '　⭐ ' + sp.map(esc).join('・') : ''}</div><div class="btnrow"><button class="rel" data-pa="back">← 一覧</button><button class="rel" data-pa="save">📤 書き出す</button><button class="rel" data-pa="del">🗑 消す</button></div><p class="small pvmsg"></p></div>`;
};
// HUD button
{ const _ui = UI.init; UI.init = function () { const r = _ui.apply(this, arguments);
  const row = document.getElementById('gBtns'); if (row && !document.getElementById('photoBtn')) { const b = document.createElement('button'); b.id = 'photoBtn'; b.textContent = '📷 写真 X'; b.title = '写真モード（X）・アルバム'; b.onclick = e => { e.stopPropagation(); if (!PHOTO.open()) GAME.p && GAME.openAlbum(); }; row.insertBefore(b, row.firstChild); }
  return r; }; }
{ const st = document.createElement('style'); st.textContent = `#photoUI{position:fixed;inset:0;pointer-events:none;z-index:40;font-size:13px;color:#fff}#photoUI button,#photoUI label{pointer-events:auto}#photoUI .ptop{position:absolute;top:10px;left:50%;transform:translateX(-50%);display:flex;gap:12px;align-items:center;background:rgba(15,30,38,.55);padding:6px 10px 6px 14px;border-radius:14px;white-space:nowrap;max-width:calc(100vw - 24px);overflow:hidden}#photoUI .ptop span{opacity:.85;font-size:12px;overflow:hidden;text-overflow:ellipsis}#photoUI button{border:none;border-radius:12px;padding:7px 12px;background:rgba(255,255,255,.92);color:#23343a;font-weight:700;cursor:pointer;font-size:13px}#photoUI .pbot{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;align-items:center;background:rgba(15,30,38,.5);padding:8px 12px;border-radius:40px;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 24px)}#photoUI .shot{width:58px;height:58px;border-radius:50%;background:#fff;border:5px solid rgba(255,255,255,.45);background-clip:padding-box;box-shadow:0 0 0 2px #fff inset;padding:0}#photoUI .shot:active{transform:scale(.94)}#photoUI .pz{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.18);border-radius:12px;padding:4px 8px}#photoUI .pz input{width:110px}#photoUI .pmsg{position:absolute;bottom:96px;left:50%;transform:translateX(-50%);background:rgba(15,30,38,.7);padding:6px 14px;border-radius:12px;opacity:0;white-space:nowrap}#photoUI .pmsg.go{animation:pmsg 3.2s ease-out}@keyframes pmsg{0%{opacity:0}8%{opacity:1}80%{opacity:1}100%{opacity:0}}.pflash{position:fixed;inset:0;background:#fff;z-index:60;pointer-events:none;animation:pflash .45s ease-out forwards}@keyframes pflash{0%{opacity:.85}100%{opacity:0}}#game .albumbox{max-width:760px}#game .albumbox .tabs{display:flex;gap:6px;padding:0 16px}#game .albumbox .tabs button{border:none;background:#eee6d6;color:#5a4d3e;border-radius:10px;padding:6px 14px;font-weight:700;cursor:pointer;margin-bottom:6px}#game .albumbox .tabs button.on{background:#2f7a4a;color:#fff}#game .albumbox .mb{max-height:min(70vh,620px);overflow:auto}#game .agrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}#game .agrid .ph{border:none;padding:0;background:#f3efe4;border-radius:8px;overflow:hidden;cursor:pointer;text-align:left}#game .agrid .ph img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}#game .agrid .ph span{display:block;font-size:11px;padding:3px 6px;color:#556}#game .pview img{width:100%;border-radius:8px;display:block}#game .pview .pinfo{font-size:12px;color:#556;margin:6px 0}#game .pview .btnrow{display:flex;gap:6px;flex-wrap:wrap}#game .pview .warn{background:#c8462f;color:#fff}`; document.head.appendChild(st); }
