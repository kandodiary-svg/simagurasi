// ===================== 軽さ: 自動画質（重いときだけ解像度と影の更新をおとす）＋ 遠くの小物を描かない =====================
// The frame interval is watched while you play. If the game runs below ~45fps for a few seconds it steps down one level,
// and when it has been smooth for a while it steps back up. Each step costs very little to look at:
//   L0 as chosen (軽量/高画質)   L1 85% resolution   L2 72% resolution + shadows redrawn every 2nd frame   L3 60% + smaller shadow map
// Separately, small things far away (fences, signs, potted plants, windows of distant houses…) are skipped: at that distance
// they are a pixel or two inside the haze, but each one was still a draw call.
const PERF = { level: 0, auto: true, ema: 16.7, last: 0, frame: 0, goodT: 0, badT: 0, lockUntil: 0, lastDown: 0, cullT: 0, scanT: 0, list: [], culled: 0, SCALE: [1, 0.85, 0.72, 0.6], EVERY: [1, 1, 2, 2] };
try { PERF.auto = localStorage.getItem('hoshinami.auto') !== '0'; } catch (e) { }
PERF.basePR = () => GFX.hq ? Math.min(2, Math.max(1.25, devicePixelRatio)) : Math.min(devicePixelRatio, 1.5);
PERF.applyScale = function () {
  if (!renderer || !composer) return;
  const pr = Math.max(0.5, PERF.basePR() * PERF.SCALE[PERF.level]);
  if (Math.abs(renderer.getPixelRatio() - pr) > 0.01) { renderer.setPixelRatio(pr); composer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); }
  const sh = SKY.sun && SKY.sun.shadow; if (sh) { const ms = PERF.level >= 3 && !GFX.hq ? 1024 : GFX.hq ? 4096 : 2048; if (sh.mapSize.x !== ms) { sh.mapSize.set(ms, ms); if (sh.map) { sh.map.dispose(); sh.map = null; } } }
  if (PERF.EVERY[PERF.level] === 1) renderer.shadowMap.autoUpdate = true;
  PERF.btn();
};
{ const _a = GFX.apply; GFX.apply = function () { const r = _a.apply(this, arguments); PERF.applyScale(); return r; }; }
PERF.setLevel = function (l) { l = Math.max(0, Math.min(3, l)); if (l === PERF.level) return; const down = l > PERF.level; PERF.level = l; PERF.goodT = PERF.badT = 0; PERF.ema = 16.7; if (down) PERF.lastDown = performance.now(); PERF.applyScale(); };
PERF.setAuto = function (on) { PERF.auto = !!on; try { localStorage.setItem('hoshinami.auto', on ? '1' : '0'); } catch (e) { } if (!on) PERF.setLevel(0); PERF.btn(); };
PERF.btn = function () { const b = document.getElementById('autoBtn'); if (!b) return; b.classList.toggle('on', PERF.auto); b.textContent = PERF.auto && PERF.level ? `⚡ 自動（${Math.round(PERF.SCALE[PERF.level] * 100)}%）` : '⚡ 自動'; b.title = PERF.auto ? '自動画質：ON — 重いときだけ解像度と影の更新をおとします（押すと OFF）' : '自動画質：OFF（押すと ON）'; };
// called once per rendered frame
PERF.tick = function () {
  const now = performance.now(), dtm = now - PERF.last; PERF.last = now; PERF.frame++;
  // shadows every Nth frame at the lower levels (the sun moves slowly; people and cars still get a fresh shadow 30 times a second)
  const ev = PERF.EVERY[PERF.level];
  if (ev > 1) { renderer.shadowMap.autoUpdate = false; if (PERF.frame % ev === 0) renderer.shadowMap.needsUpdate = true; }
  if (now > PERF.cullT) { PERF.cullT = now + 250; PERF.cull(now); }
  if (!PERF.auto || document.hidden || dtm > 250 || dtm <= 0 || GAME.modal === 'title' || window.__manual) return;
  PERF.ema += (dtm - PERF.ema) * 0.05; const s = dtm / 1000;
  const TH = PERF.TH || { bad: 22.5, good: 18.2 }; if (PERF.ema > TH.bad) { PERF.badT += s; PERF.goodT = 0; } else if (PERF.ema < TH.good) { PERF.goodT += s; PERF.badT = Math.max(0, PERF.badT - s); } else { PERF.badT = Math.max(0, PERF.badT - s * 0.5); PERF.goodT = 0; }
  if (PERF.badT > 3 && PERF.level < 3) { if (now - PERF.lastUp < 12000) PERF.lockUntil = now + 90000; PERF.setLevel(PERF.level + 1); }
  else if (PERF.goodT > 12 && PERF.level > 0 && now > PERF.lockUntil) { PERF.lastUp = now; PERF.setLevel(PERF.level - 1); }
};
// ---------- far small things ----------
PERF.scan = function () {
  const L = []; const sph = new THREE.Sphere();
  scene.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry || o.frustumCulled === false || o.userData.noCull) return;
    const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (!g.boundingSphere || !isFinite(g.boundingSphere.radius)) return;
    o.updateWorldMatrix(true, false); sph.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
    if (sph.radius > 7) return; // terrain, sea, big buildings, merged house shells stay
    L.push({ o, r: sph.radius, c: g.boundingSphere.center });
  });
  PERF.list = L;
};
PERF.cull = function (now) {
  if (now > PERF.scanT) { PERF.scanT = now + 6000; PERF.scan(); }
  const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z, v = new THREE.Vector3(); let n = 0;
  // far distance grows with size: a 0.3m sign goes at ~95m, a 2m porch at ~170m, a 6m shed at ~320m
  for (const it of PERF.list) {
    const o = it.o; v.copy(it.c).applyMatrix4(o.matrixWorld); const d = Math.hypot(v.x - cx, v.y - cy, v.z - cz), far = 80 + it.r * 40;
    const hide = d > far; if (hide) { if (o.layers.isEnabled(0)) o.layers.disable(0); n++; } else if (!o.layers.isEnabled(0)) o.layers.enable(0);
  }
  PERF.culled = n;
};
{ const _ui = UI.init; UI.init = function () { const r = _ui.apply(this, arguments);
  const row = document.getElementById('gBtns'); if (row && !document.getElementById('autoBtn')) { const b = document.createElement('button'); b.id = 'autoBtn'; b.onclick = e => { e.stopPropagation(); PERF.setAuto(!PERF.auto); UI.toast && UI.toast(PERF.auto ? '⚡ 自動画質：重いときだけ解像度と影の更新をおとします' : '⚡ 自動画質を OFF にしました'); document.getElementById('c').focus(); }; const hq = document.getElementById('hqBtn'); hq && hq.nextSibling ? row.insertBefore(b, hq.nextSibling) : row.appendChild(b); }
  if (composer && !composer._perf) { const _r = composer.render.bind(composer); composer.render = function (dt) { PERF.tick(); return _r(dt); }; composer._perf = true; }
  PERF.btn(); return r; }; }
