// ===================== 体験モード: 最大まで発展した島（保存しない） =====================
const DEMO = { on: false };
// nothing is written to this browser while the demo runs (your own island stays as it was)
{ const _s = GAME.save; GAME.save = function () { if (DEMO.on) { this.dirty = false; return; } return _s.apply(this, arguments); }; }
{ const _w = saveWorld; saveWorld = function () { if (DEMO.on) return; return _w.apply(this, arguments); }; }
DEMO.say = function (t) { const el = document.getElementById('demoLoad'); if (el) el.querySelector('p').textContent = t; };
DEMO.find = function (center, rMin, rMax, test, step = 6) {
  for (let r = rMin; r <= rMax; r += step) { const n = Math.max(8, Math.round(r * 6.283 / step)); for (let k = 0; k < n; k++) { const a = k / n * 6.283 + r * 0.37, p = { x: center.x + Math.cos(a) * r, z: center.z + Math.sin(a) * r }; const q = test(p); if (q) return q; } }
  return null;
};
DEMO.placeDev = function (d, center) {
  GAME.placing = d; const pl = DEMO.find(center, 14, 300, p => { const q = GAME.buildPlan(p); return q && q.ok ? q : null; }); GAME.placing = null; if (!pl) return false;
  flattenPad(pl.x, pl.z, d.w / 2 + 1.2, d.d / 2 + 1.6, pl.rot, pl.y, 5); const [i0, j0] = toIdx(pl.x - 30, pl.z - 30), [i1, j1] = toIdx(pl.x + 30, pl.z + 30); refreshRegion(i0, j0, i1, j1, { veg: false });
  VEG.removeAt(pl.x, pl.z, Math.max(d.w, d.d) / 2 + 3);
  GAME.devState()[d.id] = { id: d.id, state: 'done', date: '2000-01-01', x: pl.x, z: pl.z, rot: pl.rot, y: pl.y + 0.05 }; GAME.refreshDev(); return true;
};
DEMO.build = function () {
  const g = GAME, p = g.p, D = g.devState(), V = { x: VILLAGE.x, z: VILLAGE.z }, LM = g.LM;
  // story finished, everything unlocked
  const st = STORY.st(); st.ch = CHAPTERS.length; for (const C of CHAPTERS) { st.done[C.id] = 1; st.intro[C.id] = 1; } p.storyDev = 1; p.resortScene = 1; p.devSeen = p.devSeen || {}; STORY.syncDev(); for (const d of DEV) p.devSeen[d.id] = 1;
  // developments: automatic ones where the game would put them, the rest at good spots
  const centers = { michinoeki: V, school: V, onsen: OPEN, ryokan: OPEN, camp: { x: OPEN.x - 60, z: OPEN.z - 40 }, aquarium: LM.harbor, mansion: V, resort: LM.beach, tower: OPEN, r_lagoon: LM.beach };
  const skipped = [];
  for (const d of DEV.slice()) { if (D[d.id]) continue;
    try {
      if (d.place === 'player') { if (!DEMO.placeDev(d, centers[d.id] || V)) skipped.push(d.name); continue; }
      if (d.id === 'r_towers') g.refreshDev();
      const loc = DEV_LOC[d.id] ? DEV_LOC[d.id]() : {}; if (!loc) { skipped.push(d.name); continue; }
      D[d.id] = Object.assign({ id: d.id, state: 'done', date: d.id === 'fireworks' ? todayKey() : '2000-01-01' }, loc);
      if (d.id.startsWith('reclaim') || d.id === 'causeway') g.applyLand();
      if (d.id === 'r_beach' || d.id === 'r_marina') g.refreshDev();
    } catch (e) { console.warn('demo dev', d.id, e); skipped.push(d.name); } }
  // town-meeting projects
  p.projects = p.projects || {}; for (const q of PROPOSALS) p.projects[q.id] = { date: '2000-01-01', done: true };
  // every newcomer has moved in
  const N = g.newc(), _hf = g.houseFor;
  for (const c of NEWCOMERS) { N[c.id] = { state: 'visit' }; g.houseFor = () => c;
    const pl = DEMO.find(V, 30, 220, q => { const r = g.housePlan(q); return r.ok ? r : null; }, 5);
    if (pl) { const o = { x: pl.x, z: pl.z, rot: pl.rot }, [cx, cz] = toWorld(o, 0, 1.1); flattenPad(cx, cz, 5.4, 5.9, pl.rot, pl.y, 4); const [i0, j0] = toIdx(pl.x - 16, pl.z - 16), [i1, j1] = toIdx(pl.x + 16, pl.z + 16); refreshRegion(i0, j0, i1, j1, { veg: false }); VEG.removeAt(cx, cz, 8);
      N[c.id] = { state: 'moved', thanked: 1, house: { x: pl.x, z: pl.z, rot: pl.rot, y: pl.y + 0.05, style: c.style, roof: 0, wall: 0, seed: 1000 + NEWCOMERS.indexOf(c), date: '2000-01-01' } }; p.stats.movedN++; }
    else delete N[c.id];
    g.houseFor = _hf; g.syncNewcomers(); }
  // a couple of bridges over the river
  try { const R = G.river; if (R) for (const [i, type] of [[100, 'stone'], [36, 'taiko'], [72, 'wood']]) { const P = R.pts; if (!P[i + 2]) continue; let tx = P[i + 2][0] - P[i - 2][0], tz = P[i + 2][1] - P[i - 2][1]; const l = Math.hypot(tx, tz); tx /= l; tz /= l;
      for (let d = R.hw[i] + 3; d < R.hw[i] + 16; d += 1) { BRG.type = type; const A = BRG.endAt({ x: P[i][0] - tz * d, z: P[i][1] + tx * d }); const pl = BRG.planTo(A, { x: P[i][0] + tz * d, z: P[i][1] - tx * d }); if (pl.ok) { BRG.list.push(brPrep(brClean(pl.b))); break; } } }
    BRG.type = 'wood'; BRG.rebuild(); } catch (e) { console.warn('demo bridges', e); }
  // money, tools, cars
  p.money = 5000000; p.items = Object.assign(p.items || {}, { rod: 1, rodLv: 3, net: 1 }); const gar = g.garage(); for (const c of CAR_SHOP) gar.cars[c.id] = 1; for (const b of BOAT_SHOP) gar.boats[b.id] = 1; gar.tune = TUNES.length - 1;
  // rebuild the world with everything in place
  refreshAll(); VEG.refresh(-400, -400, 400, 400); g.refreshDev(); g.refreshProjects(); g.syncNewcomers(); g.applyTruck && g.applyTruck(); g.mapDirty = true; MINI.builtAt = -99; g.renderTracker();
  return skipped;
};
GAME.startDemo = function () {
  const t = this.el.title; t.innerHTML = `<div class="tbox" id="demoLoad"><div class="logo"><div class="l1">体験モード</div><div class="l2">島ぐらし</div></div><p class="lead">島を最大まで発展させています…（10〜30秒ほど）</p></div>`;
  setTimeout(() => {
    DEMO.on = true; if (EDIT.on) toggleEdit(false);
    restore({ H: G.H0, Wl: G.Wl0, roads: [], removed: new Uint8Array(VEG.removed.length), trees: [], bridges: [] }); EDIT.undo = [];
    const p = this.newProfile('ユウ', 'ほしなみ'); p.vit = 600; p.demo = 1; this.begin(p, false);
    let skipped = []; try { skipped = DEMO.build(); } catch (e) { console.warn('demo', e); }
    this.startAtHome(); this.dirty = false; EDIT.undo = [];
    DEMO.button(); this.openDemoWarp(true, skipped);
  }, 60);
};
// ---------- warp menu ----------
DEMO.spots = function () {
  const g = GAME, D = g.devState(), L = g.LM, out = [], at = (name, icon, x, z, face) => { if (isFinite(x) && isFinite(z)) out.push({ name, icon, x, z, face }); };
  at('あなたの家', '🏠', g.spawn.x, g.spawn.z);
  if (RS.beach && RS.beach.line && RS.beach.line.length) { const c = RS.beach.line[Math.floor(RS.beach.line.length / 2)]; at('リゾートビーチ', '🏝️', c.x + c.nx * 9, c.z + c.nz * 9, [c.nx, c.nz]); }
  if (D.r_marina) { const [x, z] = toWorld(D.r_marina, 0, 4); at('ヨットハーバー', '⛵', x, z); }
  if (D.r_lagoon) { const [x, z] = toWorld(D.r_lagoon, 0, 20); at('ラグーンプールとヴィラ', '🌴', x, z, [D.r_lagoon.x - x, D.r_lagoon.z - z]); }
  if (D.r_towers && D.r_towers.spots) { const s = D.r_towers.spots[0]; const [x, z] = toWorld(s, 0, s.hw + 30); at('リゾートタワー街', '🏙️', x, z, [s.x - x, s.z - z]); }
  for (const [id, name, icon, dz] of [['resort', 'ほしなみリゾートホテル', '🏨', 24], ['tower', 'ほしなみスカイタワー', '🏢', 18], ['mansion', 'しおさいマンション', '🏬', 16], ['onsen', 'しおかぜ温泉', '♨️', 12], ['ryokan', '旅館', '🏯', 10], ['aquarium', '島の水族館', '🐠', 12], ['school', 'ほしなみ小学校', '🏫', 16], ['michinoeki', '道の駅', '🏪', 9], ['camp', 'キャンプ場', '⛺', 10]]) { const s = D[id]; if (s && s.x !== undefined) { const [x, z] = toWorld(s, 0, dz); at(name, icon, x, z, [s.x - x, s.z - z]); } }
  if (D.matsuri) at('祭りの広場', '🏮', D.matsuri.x + 8, D.matsuri.z + 8, [-1, -1]);
  if (D.ohashi && D.ohashi.x !== undefined) at('ほしなみ大橋のたもと', '🌉', D.ohashi.x, D.ohashi.z);
  if (L.harbor) at('港', '⚓', L.harbor.x, L.harbor.z);
  if (L.light) at('灯台', '🗼', L.light.x + 6, L.light.z + 6);
  if (L.peak) at('見晴らしの丘', '⛰️', L.peak.x, L.peak.z);
  if (NATURE.falls) at('滝', '💧', NATURE.falls.top.x + FALLS.tx * 16, NATURE.falls.top.z + FALLS.tz * 16, [-FALLS.tx, -FALLS.tz]);
  for (const b of BRG.list) { const [x, z] = brW(b, -3, 0); at(BTYPES[b.type].name, BTYPES[b.type].icon, x, z, [b._f.dx, b._f.dz]); }
  return out;
};
DEMO.warp = function (s) {
  if (PL.veh) PL.veh = null; let best = null;
  for (let r = 0; r <= 14 && !best; r += 1) for (let k = 0; k < Math.max(1, r * 4); k++) { const a = k / Math.max(1, r * 4) * 6.283, x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r, y = standY(x, z);
    if (y < 0.15 || waterDepthAt(x, z) > 0.2 || (r < 10 && roadDistAt(x, z) < 3.2)) continue; const [qx, qz] = pushOut(x, z, 0.4); if (Math.hypot(qx - x, qz - z) > 0.01) continue; best = { x, z }; break; }
  if (!best) best = { x: s.x, z: s.z }; PL.x = best.x; PL.z = best.z; PL.y = standY(PL.x, PL.z); PL.rot = s.face ? Math.atan2(s.face[0], s.face[1]) : PL.rot;
  CAM.mode = 'third'; CAM.yaw = PL.rot + Math.PI; CAM.pitch = 0.32; CAM.distT = 8; CAM.snap = true; CAM.target.set(PL.x, PL.y + 1.05, PL.z); GAME.closeModal(); UI.toast(`${s.icon} ${s.name}に来ました`);
};
GAME.openDemoWarp = function (first, skipped) {
  this.modal = 'demo'; const sp = DEMO.spots();
  this.el.modal.innerHTML = `<div class="mbox demobox"><div class="mh"><h2>✨ 体験モード：最大まで発展した島</h2><button class="x" data-x="close" aria-label="とじる">×</button></div>
    ${first ? `<p>物語クリア・元気度Lv7・開発とリゾート計画すべて完成・島じゅうに道路網とホテル・タワー・遊園地・スタジアムが建ちならぶ「極限開発」の島です。街づくり（しまづくり → 🏙️ 街づくり、Y キー）でさらに好きなだけ建てられます。所持金5000万円、車とボートもぜんぶ持っています。</p>` : ''}
    <p class="small">体験モードは<b>保存されません</b>。あなたの島と記録はそのまま残っています。名所へワープできます（右下の「🧭 ワープ」でいつでも開けます）。</p>
    <div class="dwarp">${sp.map((s, i) => `<button data-w="${i}"><span>${s.icon}</span>${esc(s.name)}</button>`).join('')}</div>
    ${skipped && skipped.length ? `<p class="small">場所が見つからず建てなかったもの：${skipped.map(esc).join('・')}</p>` : ''}
    <div class="dfoot"><button class="primary" data-x="close">島を歩く</button><button class="ghost" data-x="end">体験をおわってタイトルへ</button></div></div>`;
  this.el.modal.hidden = false;
  this.el.modal.querySelector('.demobox').onclick = e => { const w = e.target.closest('[data-w]'); if (w) { DEMO.warp(sp[+w.dataset.w]); return; } const x = e.target.closest('[data-x]'); if (!x) return; if (x.dataset.x === 'close') this.closeModal(); if (x.dataset.x === 'end') { DEMO.on = false; location.reload(); } };
};
DEMO.button = function () { if (document.getElementById('demoBtn')) return; const b = document.createElement('button'); b.id = 'demoBtn'; b.className = 'demobtn'; b.innerHTML = '🧭 ワープ<small>体験モード</small>'; b.onclick = () => GAME.openDemoWarp(false); (document.getElementById('game') || document.body).appendChild(b); DEMO.btnSync(); };
DEMO.btnSync = function () { const b = document.getElementById('demoBtn'); if (b) b.style.display = DEMO.on && !EDIT.on && !GAME.inside ? '' : 'none'; };
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); if (DEMO.on) DEMO.btnSync(); return r; }; }
// ---------- title screen button ----------
{ const _t = GAME.showTitle; GAME.showTitle = function () { _t.apply(this, arguments); const box = this.el.title.querySelector('.tbox'); if (!box || box.id === 'demoLoad') return;
  const host = box.querySelector('.cont') || box.querySelector('form') || box; host.insertAdjacentHTML('beforeend', `<div class="demoent"><button type="button" data-x="demo">✨ 最大まで発展した島を体験する<small>保存されません・いまの島はそのまま</small></button></div>`);
  host.querySelector('[data-x="demo"]').onclick = () => this.startDemo(); }; }
{ const st = document.createElement('style'); st.textContent = `#game .demoent{margin-top:14px;text-align:center}#game .demoent button{width:100%;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 14px;border-radius:14px;border:2px solid #2a7ad8;background:#eef6ff;color:#1d5aa8;font-weight:800;font-size:15px;cursor:pointer}#game .demoent button:hover{background:#dcecff}#game .demoent small{font-size:11px;font-weight:600;opacity:.8}#game .demobox{max-width:640px}#game .demobox .dwarp{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin:10px 0;max-height:46vh;overflow:auto}#game .demobox .dwarp button{display:flex;align-items:center;gap:6px;text-align:left;padding:8px 10px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:#fff;cursor:pointer;font:inherit;font-size:13px}#game .demobox .dwarp button:hover{background:#eef8ff}#game .demobox .dwarp span{font-size:18px}#game .demobox .dfoot{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}#game .demobtn{position:absolute;left:50%;transform:translateX(-50%);top:10px;z-index:6;display:flex;flex-direction:column;align-items:center;padding:8px 14px;border-radius:14px;border:0;background:#2a7ad8;color:#fff;font-family:inherit;font-weight:800;font-size:14px;line-height:1.2;box-shadow:0 4px 12px rgba(0,0,0,.25);cursor:pointer;pointer-events:auto}#game .demobtn small{font-size:10px;font-weight:600;opacity:.85}#game #hud.editing .demobtn{display:none}`; document.head.appendChild(st); }
