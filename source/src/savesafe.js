// ===================== セーブの安全装置: 自動バックアップ（IndexedDB）・書き出し／読み込み・保存失敗の通知 =====================
// Saves live in this browser, per site: the claude.ai page, the page opened on its own, the GitHub Pages copy and each device all keep separate data.
// This file makes losing an island unlikely and recoverable:
//  - every session start, every 10 minutes of editing and before anything destructive, the raw save is copied into IndexedDB (newest kept)
//  - a save that cannot be read is never dropped silently: it is copied aside first, and the player is told
//  - the island can be written to a file / code and read back on another page or device
//  - the 体験モード profile can no longer overwrite the real one when the demo ends
const SAFE = { db: null, warned: false, loadInfo: null, lastBk: 0, reloading: false, fromTitle: false, AUTO_MAX: 10, KEEP_MAX: 8, EVERY: 10 * 60 * 1000 };
SAFE.KINDS = { start: '起動したとき', auto: '自動', rescue: '読み込めなかったデータ', reset: '初期化の前', import: '読み込みの前', restore: 'もどす前', newgame: 'はじめからの前' };
SAFE.lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
SAFE.hash = (s) => { if (!s) return 0; let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) ^ s.length; };
SAFE.summary = (prof, world) => {
  const o = { name: '', island: '', vit: 0, roads: 0, saved: 0, size: (prof ? prof.length : 0) + (world ? world.length : 0) };
  try { const p = prof && JSON.parse(prof); if (p) { o.name = p.name || ''; o.island = p.island || ''; o.vit = p.vit || 0; o.demo = !!p.demo; } } catch (e) { }
  try { const w = world && JSON.parse(world); if (w) { o.roads = (w.roads || []).length; o.saved = w.at || 0; o.bridges = (w.bridges || []).length; o.trees = (w.trees || []).length; } } catch (e) { }
  return o;
};
// ---------- IndexedDB ----------
SAFE.idb = function () {
  if (SAFE._p) return SAFE._p;
  SAFE._p = new Promise(res => { try { const rq = indexedDB.open('hoshinami2-safe', 1); rq.onupgradeneeded = () => { try { rq.result.createObjectStore('bk', { keyPath: 'at' }); } catch (e) { } }; rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null); rq.onblocked = () => res(null); } catch (e) { res(null); } });
  return SAFE._p;
};
SAFE.tx = (db, mode, fn) => new Promise(res => { try { const t = db.transaction('bk', mode), st = t.objectStore('bk'); let out = null; const r = fn(st); if (r) r.onsuccess = () => { out = r.result; }; t.oncomplete = () => res(out === null ? true : out); t.onerror = t.onabort = () => res(null); } catch (e) { res(null); } });
SAFE.list = async function () { const db = await SAFE.idb(); if (!db) return null; const all = await SAFE.tx(db, 'readonly', st => st.getAll()); return Array.isArray(all) ? all.sort((a, b) => b.at - a.at) : []; };
// copy the CURRENT stored strings (read synchronously, so a reset right after cannot get ahead of it)
SAFE.backup = function (kind, prof, world) {
  if (prof === undefined) prof = SAFE.lsGet(PROFILE_KEY);
  if (world === undefined) world = SAFE.lsGet(SAVE_KEY);
  if (!prof && !world) return Promise.resolve(false);
  const s = SAFE.summary(prof, world); if (s.demo && kind !== 'rescue') return Promise.resolve(false);
  const rec = { ...s, at: Date.now() + Math.random(), kind, ver: typeof GAME_VER !== 'undefined' ? GAME_VER : '', profile: prof, world, wh: SAFE.hash(world) };
  return (async () => {
    const db = await SAFE.idb(); if (!db) return false;
    const ok = await SAFE.tx(db, 'readwrite', st => st.put(rec)); if (!ok) return false;
    const all = await SAFE.list(); if (!all) return true;
    const autos = all.filter(r => r.kind === 'auto' || r.kind === 'start'), keeps = all.filter(r => !(r.kind === 'auto' || r.kind === 'start'));
    const drop = autos.slice(SAFE.AUTO_MAX).concat(keeps.slice(SAFE.KEEP_MAX));
    if (drop.length) await SAFE.tx(db, 'readwrite', st => { drop.forEach(r => st.delete(r.at)); return null; });
    return true;
  })();
};
SAFE.startBackup = async function () {
  const prof = SAFE.lsGet(PROFILE_KEY), world = SAFE.lsGet(SAVE_KEY); if (!prof && !world) return;
  const all = await SAFE.list(); if (!all) return;
  const last = all[0], wh = SAFE.hash(world);
  if (last && last.wh === wh && Date.now() - last.at < 24 * 3600 * 1000) { SAFE.lastBk = Date.now(); return; }
  await SAFE.backup('start', prof, world); SAFE.lastBk = Date.now();
};
// ---------- storage notices ----------
SAFE.fail = function (e) {
  console.warn('save failed', e);
  if (SAFE.warned) return; SAFE.warned = true;
  const full = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
  UI.toast(full ? '⚠ ブラウザの保存領域がいっぱいで、島を保存できませんでした。「💾 データ」から書き出しておいてください' : '⚠ このブラウザでは島を保存できませんでした（プライベートモードなど）。「💾 データ」から書き出しておいてください');
};
SAFE.canStore = function () { try { localStorage.setItem('hoshinami2-test', '1'); localStorage.removeItem('hoshinami2-test'); return true; } catch (e) { return false; } };
// ---------- world save / load (replaces the versions in edit.js / bridges.js) ----------
saveWorld = function () {
  if (SAFE.reloading || (typeof DEMO !== 'undefined' && DEMO.on) || (GAME.p && GAME.p.demo)) return;
  let str; try { const s = snapshot(); str = JSON.stringify({ v: GEN_VER, at: Date.now(), H: toB64(s.H), Wl: toB64(s.Wl), roads: s.roads, removed: toB64(s.removed), trees: s.trees, bridges: s.bridges || [] }); } catch (e) { console.warn('saveWorld', e); return; }
  try { localStorage.setItem(SAVE_KEY, str); } catch (e) { SAFE.fail(e); return; }
  if (!SAFE.persistAsked) { SAFE.persistAsked = true; try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => { }); } catch (e) { } }
  if (Date.now() - SAFE.lastBk > SAFE.EVERY) { SAFE.lastBk = Date.now(); SAFE.backup('auto', undefined, str); }
};
loadWorld = function () {
  const raw = SAFE.lsGet(SAVE_KEY); SAFE.loadInfo = { had: !!raw, ok: false, why: '' }; if (!raw) return;
  const rescue = (why) => { SAFE.loadInfo.why = why; SAFE.backup('rescue', undefined, raw); console.warn('loadWorld: kept a copy of the unreadable save:', why); };
  let d = null; try { d = JSON.parse(raw); } catch (e) { return rescue('こわれている'); }
  if (!d || typeof d !== 'object') return rescue('こわれている');
  if (d.v !== GEN_VER) return rescue('ちがう版のデータ');
  try {
    const H = fromB64(d.H, Float32Array), Wl = fromB64(d.Wl, Float32Array); let rm = fromB64(d.removed, Uint8Array);
    if (H.length !== G.H.length || Wl.length !== G.Wl.length) return rescue('島の大きさがちがう');
    // the list of wild plants changed between versions: keep every plant rather than throwing the island away (plants on roads hide themselves)
    if (rm.length !== VEG.removed.length) { const r2 = new Uint8Array(VEG.removed.length); if (rm.length < r2.length) r2.set(rm); rm = r2; SAFE.loadInfo.veg = true; }
    restore({ H, Wl, roads: d.roads || [], removed: rm, trees: d.trees || [], bridges: d.bridges || [] });
    SAFE.loadInfo.ok = true;
  } catch (e) { console.warn('loadWorld', e); rescue('読み込み中のエラー'); }
};
// ---------- profile: never save the demo profile, nor anything while the page is reloading into restored data ----------
{ const _s = GAME.save; GAME.save = function () { if (SAFE.reloading || (this.p && this.p.demo)) { this.dirty = false; return; } return _s.apply(this, arguments); }; }
{ const _r = GAME.resetAll; GAME.resetAll = function () { SAFE.backup('newgame'); return _r.apply(this, arguments); }; }
{ const _r = resetIsland; resetIsland = function () { SAFE.backup('reset'); return _r.apply(this, arguments); }; }
{ const _i = GAME.init; GAME.init = function () { const r = _i.apply(this, arguments); setTimeout(() => SAFE.startBackup(), 1500); return r; }; }
{ const _b = GAME.begin; GAME.begin = function (p, isNew) { const r = _b.apply(this, arguments);
  if (!p.demo) setTimeout(() => {
    if (!SAFE.canStore()) { SAFE.warned = true; UI.toast('⚠ このブラウザでは保存ができない設定です（プライベートモードなど）。「💾 データ」から書き出せます'); return; }
    const L = SAFE.loadInfo; if (L && L.had && !L.ok) UI.toast(`⚠ 前回の島（道路・地形）のデータを読み込めませんでした（${L.why}）。消さずに「💾 データ」のバックアップに残してあります`);
  }, 2600);
  return r; }; }
// ---------- file / code ----------
SAFE.pack = function () {
  if (GAME.p && !GAME.p.demo) { try { GAME.save(); } catch (e) { } if (EDIT.saveT > 0) { EDIT.saveT = 0; saveWorld(); } }
  const prof = SAFE.lsGet(PROFILE_KEY), world = SAFE.lsGet(SAVE_KEY); if (!prof && !world) return null;
  return JSON.stringify({ app: 'hoshinami2-save', v: 1, at: Date.now(), gameVer: typeof GAME_VER !== 'undefined' ? GAME_VER : '', profile: prof, world });
};
SAFE.unpack = function (text) {
  let o = null; try { o = JSON.parse(String(text || '').trim()); } catch (e) { return { err: 'データの形式が読み取れません（ファイルかコードの全体が入っているか確認してください）' }; }
  if (!o || o.app !== 'hoshinami2-save') return { err: 'ほしなみ島ぐらしのデータではありません' };
  let p = null, w = null; try { p = o.profile ? JSON.parse(o.profile) : null; w = o.world ? JSON.parse(o.world) : null; } catch (e) { return { err: 'データがこわれています' }; }
  if (p && !(p.v === PROFILE_VER && p.name)) return { err: '記録（プロフィール）の版がちがいます' };
  if (w && w.v !== GEN_VER) return { err: '島データの版がちがいます（新しい版のゲームで読み込んでください）' };
  if (!p && !w) return { err: '中身が空です' };
  return { profile: o.profile || null, world: o.world || null, s: SAFE.summary(o.profile, o.world) };
};
SAFE.apply = async function (prof, world, kind) {
  await SAFE.backup(kind);
  try { if (prof) localStorage.setItem(PROFILE_KEY, prof); else localStorage.removeItem(PROFILE_KEY); if (world) localStorage.setItem(SAVE_KEY, world); else localStorage.removeItem(SAVE_KEY); }
  catch (e) { SAFE.fail(e); return false; }
  SAFE.reloading = true; if (typeof DEMO !== 'undefined') DEMO.on = false; setTimeout(() => location.reload(), 60); return true;
};
SAFE.dl = (window.claude && typeof window.claude.use === 'function') ? Promise.resolve().then(() => window.claude.use('downloads')).catch(() => null) : Promise.resolve(null);
SAFE.download = async function (name, text) {
  const dl = await Promise.race([SAFE.dl, new Promise(r => setTimeout(() => r(null), 1500))]);
  if (dl) { try { await dl.save({ filename: name, data: new Blob([text], { type: 'application/json' }) }); return 'saved'; } catch (e) { if (e && e.code === 'declined') return 'declined'; } }
  try { const a = document.createElement('a'), u = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.href = u; a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 5000); return 'started'; } catch (e) { return 'fail'; }
};
SAFE.fname = function () { const d = new Date(), z = (n) => String(n).padStart(2, '0'); const isl = (GAME.p && GAME.p.island) || (GAME.saved && GAME.saved.island) || 'ほしなみ'; return `${isl}島-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.json`; };
SAFE.when = (t) => { if (!t) return '—'; const d = new Date(t), z = (n) => String(n).padStart(2, '0'); return `${d.getMonth() + 1}/${d.getDate()} ${z(d.getHours())}:${z(d.getMinutes())}`; };
SAFE.desc = (s) => `${s.name ? esc(s.name) + 'さん・' + esc(s.island) + '島' : '記録なし'}${s.demo ? '（体験モード）' : ''}　道路 ${s.roads} 本${s.bridges ? '・橋 ' + s.bridges : ''}${s.trees ? '・植えた木 ' + s.trees : ''}`;
// ---------- panel ----------
SAFE.close = function () { const m = GAME.el.modal; m.hidden = true; m.innerHTML = ''; GAME.modal = SAFE.fromTitle ? 'title' : null; SAFE.fromTitle = false; if (!GAME.modal) document.getElementById('c').focus(); };
SAFE.open = function (fromTitle) {
  if (typeof DEMO !== 'undefined' && DEMO.on) { UI.toast('体験モードのあいだは使えません'); return; }
  SAFE.fromTitle = !!fromTitle || GAME.modal === 'title'; GAME.modal = 'safe';
  const cur = SAFE.summary(SAFE.lsGet(PROFILE_KEY), SAFE.lsGet(SAVE_KEY)), m = GAME.el.modal;
  m.innerHTML = `<div class="mbox journal safebox"><div class="mh"><h2>💾 島のデータ</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb">
    <p class="small">セーブは<b>このブラウザの、このページごと</b>に保存されます。claude.ai の中で開いたとき・ページ単体で開いたとき・GitHub Pages 版・ほかの端末やブラウザは、それぞれ別のデータです。見あたらない島は、作ったときと同じ場所で開くと残っています。</p>
    <div class="cur"><b>いまのデータ</b>　${SAFE.desc(cur)}　<span class="small">最終保存 ${SAFE.when(cur.saved)}・${(cur.size / 1048576).toFixed(1)}MB</span></div>
    <div class="h">べつの場所へ移す・とっておく</div>
    <div class="btnrow"><button class="rel" data-a="export" ${cur.size ? '' : 'disabled'}>📤 ファイルに書き出す</button><button class="rel" data-a="import">📥 ファイルから読み込む</button><button class="rel" data-a="copy" ${cur.size ? '' : 'disabled'}>📋 コードとしてコピー</button><button class="rel" data-a="paste">📝 コードを貼りつける</button></div>
    <input type="file" accept=".json,application/json,text/plain" data-a="file" hidden>
    <div class="code" hidden><textarea spellcheck="false" placeholder="書き出したコードをここに貼りつけてください"></textarea><div class="btnrow"><button class="rel" data-a="usecode">このコードを読み込む</button></div></div>
    <p class="msg" role="status"></p>
    <div class="h">自動バックアップ（このブラウザ）</div>
    <ul class="list bk"><li class="small">読み込んでいます…</li></ul>
    <p class="small">起動したとき・島づくり中は10分ごと・初期化や読み込みの前に、自動でとっておきます（最新の${SAFE.AUTO_MAX}件＋大事な時点${SAFE.KEEP_MAX}件）。</p>
  </div></div>`;
  m.hidden = false;
  const box = m.querySelector('.safebox'), msg = box.querySelector('.msg'), say = (t, bad) => { msg.textContent = t; msg.classList.toggle('bad', !!bad); };
  const confirmApply = (r, kind, label) => { msg.classList.remove('bad'); msg.innerHTML = `<b>${esc(label)}</b>：${SAFE.desc(r.s)}<br>いまのデータは自動バックアップに残してから入れかえます。<button class="rel warn" data-a="confirm">入れかえてはじめる</button>`; SAFE.pending = { r, kind }; msg.scrollIntoView({ block: 'nearest' }); };
  SAFE.list().then(all => {
    const ul = box.querySelector('.bk'); if (!ul || !box.isConnected) return;
    if (!all) { ul.innerHTML = '<li class="small">このブラウザでは自動バックアップが使えません。ファイルに書き出してとっておいてください。</li>'; return; }
    SAFE.bks = all;
    ul.innerHTML = all.length ? all.map((r, i) => `<li><span class="ck">${r.kind === 'rescue' ? '🛟' : r.kind === 'auto' || r.kind === 'start' ? '🕒' : '📌'}</span><div><b>${SAFE.when(r.at)}</b>　<span class="kd">${SAFE.KINDS[r.kind] || r.kind}</span><div class="sub">${SAFE.desc(r)}${r.ver ? '　ver.' + esc(String(r.ver).replace(/（.*$/, '')) : ''}</div></div><button class="rel" data-bk="${i}">この時点にもどす</button></li>`).join('') : '<li class="small">まだありません</li>';
  });
  const fileIn = box.querySelector('[data-a="file"]');
  fileIn.onchange = async () => { const f = fileIn.files && fileIn.files[0]; if (!f) return; let t = ''; try { t = await f.text(); } catch (e) { return say('ファイルを読めませんでした', true); } const r = SAFE.unpack(t); if (r.err) return say(r.err, true); confirmApply(r, 'import', 'ファイルのデータ'); };
  box.onclick = async (e) => {
    if (e.target.closest('[data-x="close"]')) return SAFE.close();
    const bk = e.target.closest('[data-bk]'); if (bk) { const r = SAFE.bks[+bk.dataset.bk]; if (!r) return; confirmApply({ profile: r.profile, world: r.world, s: r }, 'restore', SAFE.when(r.at) + ' のバックアップ'); return; }
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a;
    if (a === 'export') { const t = SAFE.pack(); if (!t) return say('保存されたデータがありません', true); say('書き出しています…'); const r = await SAFE.download(SAFE.fname(), t); say(r === 'saved' ? '書き出しました。移したい先のページで「📥 ファイルから読み込む」を押してください' : r === 'started' ? 'ダウンロードを始めました（保存されない場合は「📋 コードとしてコピー」を使ってください）' : r === 'declined' ? '書き出しをやめました' : '書き出せませんでした。「📋 コードとしてコピー」を使ってください', r === 'fail'); }
    if (a === 'import') fileIn.click();
    if (a === 'copy') { const t = SAFE.pack(); if (!t) return; const cd = box.querySelector('.code'), ta = cd.querySelector('textarea'); let ok = false; try { await navigator.clipboard.writeText(t); ok = true; } catch (e2) { } if (ok) { cd.hidden = true; say(`コードをコピーしました（${(t.length / 1048576).toFixed(1)}MB）。移したい先で「📝 コードを貼りつける」から貼ってください`); } else { cd.hidden = false; ta.value = t; ta.readOnly = true; ta.focus(); ta.select(); box.querySelector('[data-a="usecode"]').hidden = true; say('自動でコピーできませんでした。下の枠が選ばれた状態なので、Ctrl+C（⌘+C）でコピーしてください'); } }
    if (a === 'paste') { const cd = box.querySelector('.code'), ta = cd.querySelector('textarea'); cd.hidden = false; ta.readOnly = false; ta.value = ''; box.querySelector('[data-a="usecode"]').hidden = false; ta.focus(); say(''); }
    if (a === 'usecode') { const r = SAFE.unpack(box.querySelector('.code textarea').value); if (r.err) return say(r.err, true); confirmApply(r, 'import', '貼りつけたデータ'); }
    if (a === 'confirm') { const P = SAFE.pending; if (!P) return; b.disabled = true; say('入れかえています…'); const ok = await SAFE.apply(P.r.profile, P.r.world, P.kind); if (!ok) say('保存できませんでした（ブラウザの保存領域）', true); }
  };
};
{ const _c = GAME.closeModal; GAME.closeModal = function () { if (this.modal === 'safe') return SAFE.close(); return _c.apply(this, arguments); }; }
// HUD button (next to 高画質) and a link on the title screen
{ const _ui = UI.init; UI.init = function () { const r = _ui.apply(this, arguments);
  const row = document.getElementById('gBtns'); if (row && !document.getElementById('safeBtn')) { const b = document.createElement('button'); b.id = 'safeBtn'; b.textContent = '💾 データ'; b.title = '島のデータの書き出し・読み込み・バックアップ'; b.onclick = e => { e.stopPropagation(); SAFE.open(false); }; row.appendChild(b); }
  return r; }; }
{ const _t = GAME.showTitle; GAME.showTitle = function () { _t.apply(this, arguments); const box = this.el.title.querySelector('.tbox'); if (!box || box.id === 'demoLoad' || box.querySelector('.safeent')) return;
  const s = this.saved ? SAFE.summary(SAFE.lsGet(PROFILE_KEY), SAFE.lsGet(SAVE_KEY)) : null;
  const host = box.querySelector('.cont') || box.querySelector('form') || box; host.insertAdjacentHTML('beforeend', `<div class="safeent">${s ? `<p class="small">このブラウザの島：道路 ${s.roads} 本${s.saved ? '・最終保存 ' + SAFE.when(s.saved) : ''}</p>` : ''}<button type="button" data-x="safe">💾 データの読み込み・バックアップ</button></div>`);
  host.querySelector('[data-x="safe"]').onclick = () => SAFE.open(true); }; }
{ const st = document.createElement('style'); st.textContent = `#game .safebox{max-width:640px}#game .safebox .mb{max-height:min(74vh,640px);overflow:auto}#game .safebox .cur{background:#f3efe4;border-radius:10px;padding:8px 10px;margin:8px 0}#game .safebox .h{font-weight:800;margin:12px 0 6px}#game .safebox .btnrow{display:flex;flex-wrap:wrap;gap:6px}#game .safebox textarea{width:100%;height:90px;margin:8px 0 4px;font:11px/1.3 ui-monospace,monospace;border-radius:8px;border:1px solid #cbbfa5;padding:6px;box-sizing:border-box}#game .safebox .msg{min-height:1.2em;margin:8px 0 0;font-size:13px;color:#2d6a3e}#game .safebox .msg.bad{color:#b0342a}#game .safebox .msg .warn{margin-left:8px;background:#c8462f;color:#fff;border-color:#c8462f}#game .safebox .bk li{align-items:center}#game .safebox .bk .kd{font-size:12px;opacity:.75}#game .safebox .bk button{white-space:nowrap}#game .safeent{margin-top:10px;text-align:center}#game .safeent p{margin:0 0 2px;color:#5d6a6e;font-size:12px}#game .safeent button{background:none;border:none;color:#2a6f8f;text-decoration:underline;font-size:13px;cursor:pointer;padding:4px}`; document.head.appendChild(st); }
