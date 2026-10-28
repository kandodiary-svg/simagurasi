// ===================== オンライン (ver.48): 大橋の料金所から、ほかの人の島へ行く・自分の島に来てもらう =====================
// - 通信はブラウザどうしの直接通信（WebRTC）。相手を見つけるあいだだけ、公開の中継（Nostr）を使う（Trystero）。サーバーはいらない
// - 島をひらく人（ホスト）は6けたの「島番号」を相手に教える。来たい人が番号を入れると、ホストに「入れる？」と聞く
// - 入れてもらえたら、ホストの島（地形・道路・建物・住民…のセーブ一式）がとどき、その島で目をさます（自分の島はそのまま。保存もしない）
// - おたがいの姿が見えて、スタンプや決まった言葉であいさつできる。自由な文字のチャットはない（知らない人とのトラブルをふせぐため）
// - 料金所は大橋の本土側。大橋がまだなら、港の「連絡船の窓口」から
const NET = { RELAYS: ['nos.lol', 'relay.nostr.dev.br', 'nostr.red5d.dev', 'relay.layer.systems', 'nostr.stakey.net', 'cdn.satellite.earth', 'relay.piazza.today', 'relay.routstr.com', 'nostr.chaima.info', 'relay.degmods.com'].map(h => 'wss://' + h),   // public Nostr relays on port 443, checked 2026-10
  PAGES: 'https://kandodiary-svg.github.io/simagurasi/', APP: 'hoshinami-shimagurashi', room: null, code: '', role: null, A: null, peers: {}, av: {}, hostId: null, sendT: 0, envT: 0, MAX: 4, tok: {}, waitAsk: {}, status: '', ui: null };
const VISIT = { on: false, d: null };
NET.COL = [{ top: '#e85a5a', bottom: '#3a4a7a', acc: '#f2c040', name: 'あか' }, { top: '#4aa0e8', bottom: '#2f3a4a', acc: '#ffffff', name: 'あお' }, { top: '#5ac06a', bottom: '#5a4a3a', acc: '#f0e0a0', name: 'みどり' }, { top: '#f2b632', bottom: '#4a3a6a', acc: '#e85a5a', name: 'きいろ' },
  { top: '#b47ae0', bottom: '#3a3a4a', acc: '#f6d0f0', name: 'むらさき' }, { top: '#f08ab8', bottom: '#4a5a7a', acc: '#ffffff', name: 'ピンク' }, { top: '#f4f2ec', bottom: '#2a5a8a', acc: '#e8484a', name: 'しろ' }, { top: '#3a3a44', bottom: '#8a7a6a', acc: '#f2b632', name: 'くろ' }];
NET.STAMP = { hello: '👋', heart: '❤️', note: '♪', bang: '！', q: '？', zzz: '💤' };
NET.PHRASE = ['こんにちは！', 'ようこそ！', 'こっちに来て！', 'ついてきて！', 'ちょっと待ってね', 'ありがとう！', 'すごい！', 'きれいだね！', '釣りしよう！', '写真とろう！', 'またね！', 'おじゃましました！'];
// ---------- visiting: the host's island replaces yours in this tab only, and nothing is written ----------
try { const s = sessionStorage.getItem('hoshinami-visit'); if (s) { VISIT.d = JSON.parse(s); VISIT.on = !!(VISIT.d && VISIT.d.profile && VISIT.d.world); } } catch (e) { VISIT.on = false; }
if (VISIT.on) { const K = { 'hoshinami2-profile': 'profile', 'hoshinami2-world': 'world' }, P = Storage.prototype, gi = P.getItem, si = P.setItem, ri = P.removeItem; let LS = null; try { LS = window.localStorage; } catch (e) { }
  P.getItem = function (k) { if (this === LS && K[k]) return VISIT.d[K[k]]; return gi.call(this, k); };
  P.setItem = function (k, v) { if (this === LS && (K[k] || k === 'hoshinami2-season')) return; return si.call(this, k, v); };
  P.removeItem = function (k) { if (this === LS && K[k]) return; return ri.call(this, k); }; }
{ const _s = GAME.save; GAME.save = function () { if (VISIT.on) { this.dirty = false; return; } return _s.apply(this, arguments); }; }
{ const _w = saveWorld; saveWorld = function () { if (VISIT.on) return; return _w.apply(this, arguments); }; }
{ const _b = SAFE.backup; SAFE.backup = function () { if (VISIT.on) return Promise.resolve(false); return _b.apply(this, arguments); }; }
{ const _b = SAFE.startBackup; SAFE.startBackup = function () { if (VISIT.on) return Promise.resolve(); return _b.apply(this, arguments); }; }
{ const _f = GAME.fill; GAME.fill = function (s) { if (VISIT.on && VISIT.d.me) s = String(s).replace(/\{P\}/g, VISIT.d.me.name); return _f.call(this, s); }; }
// things that would change someone else's island are not offered while visiting
NET.no = msg => { UI.toast('🌉 ' + (msg || 'ほかの人の島では、これはできません')); return false; };
{ const _t = toggleEdit; toggleEdit = function (on) { if (VISIT.on && (on === true || (on === undefined && !EDIT.on))) return NET.no('ほかの人の島では、しまづくりはできません'); return _t.apply(this, arguments); }; }
for (const k of ['openDev', 'openShop', 'openCatalog', 'startMeeting']) { const _f = GAME[k]; if (typeof _f === 'function') GAME[k] = function () { if (VISIT.on) return NET.no(); return _f.apply(this, arguments); }; }
{ const _r = GAME.toggleRoomEdit; GAME.toggleRoomEdit = function (on) { if (VISIT.on && on !== false) return NET.no('ほかの人の家では、模様がえはできません'); return _r.apply(this, arguments); }; }
{ const _m = GAME.meetToday; GAME.meetToday = function () { return VISIT.on ? false : _m.apply(this, arguments); }; }
{ const _c = STORY.check; STORY.check = function () { if (VISIT.on) return; return _c.apply(this, arguments); }; }
{ const _a = BOND.avail; BOND.avail = function () { return VISIT.on ? null : _a.apply(this, arguments); }; }
{ const _c = GAME.checkNewcomers; GAME.checkNewcomers = function () { if (VISIT.on) return; return _c.apply(this, arguments); }; }
{ const _tv = toggleVehicle; toggleVehicle = function () { if (VISIT.on && !PL.veh) { const v = nearVehicle(); if (v) return NET.no('ほかの人の島の車や船には乗れません（バスや観光船には乗れます）'); } return _tv.apply(this, arguments); }; }
// waking up on the host's island
{ const _i = GAME.init; GAME.init = function () { const r = _i.apply(this, arguments); if (VISIT.on && this.saved) { try { NET.arrive(); } catch (e) { console.warn('visit', e); NET.goHome(); } } return r; }; }
NET.arrive = function () {
  const D = VISIT.d, toast = UI.toast; UI.toast = () => { }; try { GAME.begin(GAME.saved, false); } finally { UI.toast = toast; }
  NET.applyEnv(D.env); const S = NET.gateSpot(); if (S) { PL.x = S.ax; PL.z = S.az; PL.rot = S.arot; PL.y = standY(PL.x, PL.z); PL.veh = null; CAM.yaw = PL.rot + Math.PI; CAM.snap = true; }
  GAME.el.side.hidden = true; document.body.classList.add('netvisit');
  setTimeout(() => UI.toast(`🌉 ${D.host.island}島へようこそ！（${D.host.name}さんの島・ここでのことは保存されません）`), 600);
  NET.myName = D.me.name; NET.myCol = D.me.col; NET.open(D.code, 'guest');
};
NET.goHome = function () { try { NET.leave(); } catch (e) { } try { sessionStorage.removeItem('hoshinami-visit'); } catch (e) { } VISIT.on = false; SAFE.reloading = true; setTimeout(() => location.reload(), 80); };
// ---------- where the window is: the toll plaza on the bridge, or the harbor before the bridge is built ----------
NET.gateSpot = function () {
  if (typeof OHB !== 'undefined' && OHB.s) { const s = OHB.s, u = OHB.gate - 2.8, x = s.x + s.dx * u + s.side[0] * 3.2, z = s.z + s.dz * u + s.side[1] * 3.2, ax = s.x + s.dx * (OHB.gate - 7), az = s.z + s.dz * (OHB.gate - 7);
    return { x, z, ax, az, arot: Math.atan2(-s.dx, -s.dz), r: 3.6, name: '大橋の料金所', bridge: true }; }
  const W = GAME.p && GAME.p.dev && GAME.p.dev.waiting, H = GAME.LM && GAME.LM.harbor; const P = W && W.state === 'done' && isFinite(W.x) ? W : H; if (!P) return null;
  let a = { x: P.x, z: P.z }; for (let r = 3; r < 14 && groundH(a.x, a.z) < 0.6; r += 1.5) for (let k = 0; k < 12; k++) { const x = P.x + Math.cos(k * 0.52) * r, z = P.z + Math.sin(k * 0.52) * r; if (groundH(x, z) > 0.6 && !collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, 0.5))) { a = { x, z }; break; } }
  return { x: P.x, z: P.z, ax: a.x, az: a.z, arot: 0, r: 4.2, name: '港の連絡船の窓口', bridge: false };
};
NET.nearGate = function () { if (!GAME.p || PL.veh || GAME.inside || GAME.modal) return false; const S = NET.gateSpot(); return !!S && Math.hypot(PL.x - S.x, PL.z - S.z) < S.r; };
{ const _pr = GAME.prompt; GAME.prompt = function () { if (NET.nearGate()) return `Space：${NET.gateSpot().name}（🌐 オンライン）`; return _pr.apply(this, arguments); }; }
{ const _it = GAME.interact; GAME.interact = function () { if (NET.nearGate()) { NET.openGate(); return true; } return _it.apply(this, arguments); }; }
// ---------- the connection ----------
NET.turn = async function () { // Open Relay's public TURN (static auth); only used when two browsers cannot reach each other directly
  try { const u = (Math.floor(Date.now() / 1000) + 8 * 3600) + ':hoshinami', enc = new TextEncoder(), k = await crypto.subtle.importKey('raw', enc.encode('openrelayprojectsecret'), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', k, enc.encode(u)), cred = btoa(String.fromCharCode(...new Uint8Array(sig))), h = 'staticauth.openrelay.metered.ca';
    return [{ urls: [`turn:${h}:80`, `turn:${h}:80?transport=tcp`, `turn:${h}:443`, `turns:${h}:443?transport=tcp`], username: u, credential: cred }]; } catch (e) { return undefined; } };
NET.ok = () => typeof Trystero !== 'undefined' && typeof Trystero.joinRoom === 'function' && !!(window.crypto && crypto.subtle) && typeof RTCPeerConnection !== 'undefined';
NET.open = async function (code, role) {
  if (!NET.ok()) { NET.setStatus('⚠ このページではオンライン通信が使えません（ブラウザが対応していないか、ページの安全設定でふさがれています）'); return false; }
  NET.leave(); NET.code = code; NET.role = role; NET.peers = {}; NET.hostId = null; NET.joinT = performance.now();
  const turnConfig = await NET.turn(); let room;
  try { room = Trystero.joinRoom({ appId: NET.APP, password: 'isle-' + code, relayConfig: { urls: NET.RELAYS, warnOnRelayFailure: false }, turnConfig }, 'isle-' + code, { onJoinError: d => { NET.lastErr = String(d && d.error || ''); if (NET.role !== 'host') NET.setStatus('⚠ 相手とつながりませんでした（通信が制限されたネットワークかもしれません）'); } }); }
  catch (e) { NET.setStatus('⚠ 通信をはじめられませんでした'); return false; }
  NET.room = room; const A = NET.A = {}; for (const k of ['hi', 'ask', 'ans', 'isl', 'st', 'say', 'ctl', 'env']) A[k] = room.makeAction(k);
  room.onPeerJoin = id => { A.hi.send(NET.hiMsg(), { target: id }); };
  room.onPeerLeave = id => NET.drop(id);
  A.hi.onMessage = (d, { peerId }) => NET.onHi(peerId, d);
  A.ask.onMessage = (d, { peerId }) => NET.onAsk(peerId, d);
  A.ans.onMessage = (d, { peerId }) => NET.onAns(peerId, d);
  A.isl.onMessage = (d, { peerId }) => NET.onIsland(peerId, d);
  A.isl.onReceiveProgress = (pct) => { if (NET.role === 'seek') NET.setStatus(`🚚 島をはこんでいます… ${Math.round(clamp(+pct || 0, 0, 1) * 100)}%`); };
  A.st.onMessage = (d, { peerId }) => NET.onState(peerId, d);
  A.say.onMessage = (d, { peerId }) => NET.onSay(peerId, d);
  A.ctl.onMessage = (d, { peerId }) => NET.onCtl(peerId, d);
  A.env.onMessage = (d, { peerId }) => { if (peerId === NET.hostId && VISIT.on) NET.applyEnv(d); };
  NET.dressMe(true); NET.renderBar();
  // none of the relays reachable: this page (or this network) does not let the game talk to the internet
  clearTimeout(NET.relT); NET.relT = setTimeout(() => { if (NET.room !== room) return; let open = 0; try { open = Object.values(Trystero.getRelaySockets() || {}).filter(w => w && w.readyState === 1).length; } catch (e) { open = 1; }
    if (!open) { NET.setStatus(`⚠ 通信の中継につながりません。このページ（またはこのネットワーク）では外部との通信がふさがれているかもしれません。GitHub版（${NET.PAGES}）でためしてね`); if (NET.role === 'seek') { NET.leave(); NET.role = null; } } }, 9000);
  return true;
};
NET.leave = function () { if (NET.room) { try { NET.room.leave(); } catch (e) { } } NET.room = null; NET.A = null; NET.dressMe(false); for (const id of Object.keys(NET.av)) NET.dropAv(id); NET.peers = {}; NET.role = VISIT.on ? NET.role : null; NET.renderBar(); NET.renderGate(); };
// while online you look the way the others see you (the chosen colour); back to normal when the room closes
NET.mat0 = new Map();
NET.dressMe = function (on) { if (!PL.mesh) return; const C = on ? (NET.COL[NET.myCol | 0] || NET.COL[0]) : null;
  PL.mesh.traverse(o => { if (!o.isMesh) return; if (!NET.mat0.has(o)) { if (!C) return; const m0 = o.material, names = (Array.isArray(m0) ? m0 : [m0]).map(m => m && m.name); if (!names.some(n => n === 'top' || n === 'bottom' || n === 'acc')) return; NET.mat0.set(o, m0); }
    const base = NET.mat0.get(o); if (!C) { o.material = base; NET.mat0.delete(o); return; }
    const one = mt => { const c = mt && C[mt.name]; if (!c) return mt; const q = mt.clone(); q.color.set(c); return q; }; o.material = Array.isArray(base) ? base.map(one) : one(base); }); };
NET.hiMsg = () => ({ r: NET.role === 'host' ? 'host' : 'guest', n: NET.myName || (GAME.p && GAME.p.name) || '？', c: NET.myCol | 0, v: GAME_VER, k: VISIT.on ? VISIT.d.token : undefined, i: !VISIT.on && GAME.p ? GAME.p.island : undefined });
NET.clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').slice(0, n);
NET.onHi = function (id, d) {
  if (!d || typeof d !== 'object') return; const oc = NET.peers[id] ? NET.peers[id].col : null; const p = NET.peers[id] = Object.assign(NET.peers[id] || {}, { name: NET.clean(d.n, 8) || '？', col: Math.abs(d.c | 0) % NET.COL.length, role: d.r === 'host' ? 'host' : 'guest', ver: NET.clean(d.v, 20), island: NET.clean(d.i, 8) });
  if (oc != null && oc !== p.col && NET.av[id]) { const a0 = NET.av[id]; NET.dropAv(id); const a = NET.avatar(id); if (a) { Object.assign(a, { x: a0.x, y: a0.y, z: a0.z, rot: a0.rot, tx: a0.tx, ty: a0.ty, tz: a0.tz, trot: a0.trot, seen: a0.seen, placed: a0.placed }); } NET.renderBar(); }
  if (NET.role === 'host') { if (d.r === 'host') return; // another host with the same number: ignore
    if (d.k && NET.tok[d.k]) { p.ok = true; NET.tok[d.k].id = id; NET.joined(id); NET.sendEnv(id); }
    else if (d.k) { p.back = true; NET.waitAsk[id] = { name: p.name, t: performance.now(), back: true }; NET.renderAsks(); }   // came back after this page was reloaded: ask again
    return; }
  if (p.role === 'host') { NET.hostId = id; if (NET.role === 'seek') { NET.setStatus(`🌉 ${p.island ? p.island + '島の' : ''}${p.name}さんに「行ってもいい？」と聞いています…`); NET.A.ask.send({ n: NET.myName, c: NET.myCol, v: GAME_VER }, { target: id }); }
    else if (VISIT.on) { p.ok = true; NET.joined(id); } return; }
  if (VISIT.on) { p.ok = true; NET.joined(id); }   // another guest on the same island
};
// host: someone asks to come
NET.onAsk = function (id, d) {
  if (NET.role !== 'host' || !d) return; const p = NET.peers[id] || (NET.peers[id] = {}); p.name = NET.clean(d.n, 8) || '？'; p.col = Math.abs(d.c | 0) % NET.COL.length; p.role = 'guest';
  if (NET.clean(d.v, 20) !== GAME_VER) { NET.A.ans.send({ ok: false, why: 'ver', hv: GAME_VER }, { target: id }); UI.toast(`🌉 ${p.name}さんが来ようとしましたが、ゲームの版がちがいました（相手 ver.${NET.clean(d.v, 20)}）`); return; }
  if (NET.guests().length >= NET.MAX) { NET.A.ans.send({ ok: false, why: 'full' }, { target: id }); return; }
  NET.waitAsk[id] = { name: p.name, t: performance.now() }; NET.renderAsks(); try { SND.play('ui_bong1', { vol: 0.7 }); } catch (e) { }
};
NET.accept = async function (id, yes) {
  const w = NET.waitAsk[id]; delete NET.waitAsk[id]; NET.renderAsks(); if (!NET.A || !NET.peers[id]) return;
  if (!yes) { NET.A.ans.send({ ok: false, why: 'no' }, { target: id }); return; }
  const tok = Math.random().toString(36).slice(2, 12); NET.tok[tok] = { name: w ? w.name : '？', id: null };
  if (w && w.back) { NET.tok[tok].id = id; NET.peers[id].ok = true; NET.A.ans.send({ ok: true, tok }, { target: id }); NET.joined(id); NET.sendEnv(id); return; }   // already has the island
  NET.A.ans.send({ ok: true }, { target: id });
  try { SAFE.flush && SAFE.flush(); } catch (e) { }
  const prof = JSON.stringify(Object.assign({}, GAME.p, { demo: GAME.p.demo })), world = SAFE.encode(snapshot());
  await NET.A.isl.send({ tok, v: GAME_VER, profile: prof, world, env: NET.env(), host: { name: GAME.p.name, island: GAME.p.island } }, { target: id });
  UI.toast(`🌉 ${w ? w.name : ''}さんに島の地図を送っています…`);
};
// guest: the answer, then the island
NET.onAns = function (id, d) { if (VISIT.on && id === NET.hostId && d) { if (d.ok && d.tok) { VISIT.d.token = NET.clean(d.tok, 20); try { sessionStorage.setItem('hoshinami-visit', JSON.stringify(VISIT.d)); } catch (e) { } const p = NET.peers[id]; if (p) { p.ok = true; NET.joined(id); } } else if (!d.ok) { UI.toast('🌉 島の主にことわられました。自分の島に帰ります'); setTimeout(() => NET.goHome(), 2500); } return; }
  if (NET.role !== 'seek' || id !== NET.hostId || !d) return;
  if (d.ok) { NET.setStatus('✅ 入れてもらえた！ 島をはこんでいます…'); return; }
  NET.setStatus(d.why === 'ver' ? `⚠ ゲームの版がちがいます（あなた ver.${GAME_VER}／相手 ver.${NET.clean(d.hv, 20)}）。ページを読みこみなおして、同じ版にしてね` : d.why === 'full' ? '⚠ その島はいま満員です（4人まで）' : '😢 ことわられちゃった…');
  setTimeout(() => NET.leave(), 300); };
NET.onIsland = function (id, d) {
  if (NET.role !== 'seek' || id !== NET.hostId || !d || typeof d.profile !== 'string' || typeof d.world !== 'string') return; if (d.v !== GAME_VER) { NET.setStatus('⚠ ゲームの版がちがいます'); return; }
  const H = NET.peers[id] || {}, data = { code: NET.code, token: NET.clean(d.tok, 20), profile: d.profile, world: d.world, env: d.env || {}, host: { name: NET.clean(d.host && d.host.name, 8) || H.name || '？', island: NET.clean(d.host && d.host.island, 8) || '？' }, me: { name: NET.myName, col: NET.myCol }, at: Date.now() };
  try { GAME.save && GAME.save(); SAFE.flush && SAFE.flush(); } catch (e) { }
  try { sessionStorage.setItem('hoshinami-visit', JSON.stringify(data)); } catch (e) { NET.setStatus('⚠ 島が大きすぎて運べませんでした'); return; }
  NET.setStatus(`⛴ ${data.host.island}島へ出発！`); try { SND.play('horn', { vol: 0.6 }); } catch (e) { } SAFE.reloading = true; NET.leave(); setTimeout(() => location.reload(), 700);
};
NET.guests = () => Object.keys(NET.peers).filter(id => NET.peers[id].ok && NET.peers[id].role === 'guest');
NET.joined = function (id) { const p = NET.peers[id]; if (!p || p.shown) return; p.shown = true; NET.avatar(id); UI.toast(p.role === 'host' ? `🌉 ${p.name}さん（島の主）とつながった！` : `🌉 ${p.name}さんが${NET.role === 'host' ? '島に来ました！' : 'いっしょにいます'}`); try { SND.play('ui_confirmation1', { vol: 0.6 }); } catch (e) { } NET.renderBar(); };
NET.drop = function (id) { const p = NET.peers[id]; delete NET.waitAsk[id]; NET.renderAsks(); NET.dropAv(id); delete NET.peers[id];
  if (p && p.shown) UI.toast(`🌉 ${p.name}さんが${p.role === 'host' ? '島をはなれました' : '帰りました'}`);
  if (VISIT.on && id === NET.hostId) { NET.hostId = null; NET.setStatus('島の主との通信が切れました'); UI.toast('🌉 島の主との通信が切れました。15秒もどらなければ、自分の島に帰ります'); clearTimeout(NET.byeT); NET.byeT = setTimeout(() => { if (!NET.hostId) NET.goHome(); }, 15000); }
  NET.renderBar(); };
NET.onCtl = function (id, d) { if (!d || id !== NET.hostId) return; if (d.t === 'kick' || d.t === 'close') { UI.toast(d.t === 'kick' ? '🌉 島の主に「またね」と言われました。自分の島に帰ります' : '🌉 島の主が島をとじました。自分の島に帰ります'); setTimeout(() => NET.goHome(), 2500); } };
// ---------- what everyone sees of everyone ----------
NET.env = () => ({ m: TIME.mode, hf: +currentHour().toFixed(3), w: TIME.weather, so: (typeof SEASON !== 'undefined' && SEASON.override) || null });
NET.sendEnv = id => { if (NET.A && NET.role === 'host') NET.A.env.send(NET.env(), id ? { target: id } : undefined); };
NET.applyEnv = function (e) { if (!e) return; if (e.m === 'real') TIME.mode = 'real'; else if (isFinite(e.hf)) { TIME.mode = 'fixed'; TIME.hf = +e.hf; } if (['clear', 'cloudy', 'rain', 'storm', 'snow'].includes(e.w)) { TIME.wmode = 'manual'; TIME.weather = e.w; } if (typeof SEASON !== 'undefined' && (e.so === null || typeof e.so === 'string')) { SEASON.override = e.so; try { SEASON.apply && SEASON.apply(); } catch (er) { } } };
NET.myState = function () { const v = PL.veh, x = v ? v.x : PL.x, y = v ? (v.y || PL.y) : PL.y, z = v ? v.z : PL.z; return [+x.toFixed(2), +y.toFixed(2), +z.toFixed(2), +PL.rot.toFixed(3), +Math.min(9, PL.speed || (v ? Math.abs(v.v || 0) : 0)).toFixed(2), v ? (v.model || v.kind) : '', GAME.inside ? 1 : 0, v ? +v.rot.toFixed(3) : 0]; };
NET.onState = function (id, d) { if (!Array.isArray(d) || d.length < 7) return; const p = NET.peers[id]; if (!p || !p.ok) return; const a = NET.av[id] || NET.avatar(id); if (!a) return;
  const n = i => (typeof d[i] === 'number' && isFinite(d[i]) ? d[i] : 0); a.tx = clamp(n(0), -400, 400); a.ty = clamp(n(1), -20, 120); a.tz = clamp(n(2), -400, 400); a.trot = n(3); a.spd = clamp(n(4), 0, 30); a.veh = typeof d[5] === 'string' ? d[5].slice(0, 12) : ''; a.inside = !!d[6]; a.vrot = n(7); a.seen = performance.now(); if (!a.placed) { a.x = a.tx; a.y = a.ty; a.z = a.tz; a.rot = a.trot; a.placed = true; } };
NET.onSay = function (id, d) { const p = NET.peers[id], a = NET.av[id]; if (!p || !p.ok || !a || !d) return;
  if (d.t === 'stamp' && NET.STAMP[d.k]) { if (['heart', 'note', 'bang', 'q', 'zzz'].includes(d.k)) LIVE.emote(a, d.k, 2.6); else LIVE.say(a, NET.STAMP[d.k], 2.6); }
  if (d.t === 'ph' && NET.PHRASE[d.i | 0] && (d.i | 0) >= 0) { LIVE.say(a, NET.PHRASE[d.i | 0], 3.6); NET.log(`${p.name}：${NET.PHRASE[d.i | 0]}`); } };
NET.say = function (msg) { if (!NET.A) return; NET.A.say.send(msg); if (!PL.netMe) { let top = 1.3; try { const hb = new THREE.Box3().setFromObject(PL.parts.head, true); top = hb.max.y - PL.mesh.position.y; } catch (e) { } PL.netMe = { mesh: PL.mesh, top }; } const m = PL.netMe;
  if (msg.t === 'stamp') { if (['heart', 'note', 'bang', 'q', 'zzz'].includes(msg.k)) LIVE.emote(m, msg.k, 2.6); else LIVE.say(m, NET.STAMP[msg.k], 2.6); NET.meT = 2.6; } else { LIVE.say(m, NET.PHRASE[msg.i], 3.6); NET.meT = 3.6; NET.log(`${NET.myName || GAME.p.name}：${NET.PHRASE[msg.i]}`); } };
// ---------- avatars: a copy of the hero in the visitor's colour, with a name tag ----------
{ const _sp = spawnPlayer; spawnPlayer = function () { try { if (MODELS.hero && !NET.proto) NET.proto = MODELS.hero.clone(true); } catch (e) { } return _sp.apply(this, arguments); }; }
NET.avatar = function (id) {
  if (NET.av[id]) return NET.av[id]; const p = NET.peers[id]; if (!p || !NET.proto) return null; const C = NET.COL[p.col] || NET.COL[0], m = NET.proto.clone(true); m.userData = Object.assign({}, m.userData, { chr: null });
  m.traverse(o => { if (!o.isMesh) return; const one = mt => { const c = mt && C[mt.name]; if (!c) return mt; const q = mt.clone(); q.color.set(c); return q; }; o.material = Array.isArray(o.material) ? o.material.map(one) : one(o.material); o.castShadow = true; });
  try { CHR.rig(m); } catch (e) { } const tag = makeNameTag(p.role === 'host' ? `${p.name}（島の主）` : p.name); tag.position.y = 1.5; m.add(tag);
  const parts = partsOf(m, ['pelvis', 'spine', 'head', 'thighL', 'thighR', 'shinL', 'shinR', 'upperArmL', 'upperArmR', 'foreArmL', 'foreArmR']), rest = {}; for (const [k, o] of Object.entries(parts)) if (o) rest[k] = o.position.clone();
  const hb = parts.head ? new THREE.Box3().setFromObject(parts.head, true) : null; scene.add(m); m.visible = false;
  const a = NET.av[id] = { id, mesh: m, tag, parts, rest, top: hb ? hb.max.y - m.position.y : 1.3, x: 0, y: 0, z: 0, rot: 0, tx: 0, ty: 0, tz: 0, trot: 0, spd: 0, ph: 0, placed: false, ghost: null, gkey: '' }; return a;
};
NET.dropAv = function (id) { const a = NET.av[id]; if (!a) return; scene.remove(a.mesh); if (a.ghost) scene.remove(a.ghost); delete NET.av[id]; };
NET.ghostFor = function (a) { const k = a.veh; if (a.gkey === k) return a.ghost; if (a.ghost) { scene.remove(a.ghost); a.ghost = null; } a.gkey = k; if (!k || k === 'bus' || k === 'ferry' || !MODELS[k]) return null; try { const g = MODELS[k].clone(true); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); a.ghost = g; } catch (e) { } return a.ghost; };
NET.update = function (dt) {
  const now = performance.now();
  for (const a of Object.values(NET.av)) {
    const k = Math.min(1, dt * 9); a.x += (a.tx - a.x) * k; a.y += (a.ty - a.y) * k; a.z += (a.tz - a.z) * k; a.rot = angLerp(a.rot, a.trot, k);
    const stale = now - (a.seen || 0) > 6000, inBig = a.veh === 'bus' || a.veh === 'ferry', g = NET.ghostFor(a), show = a.placed && !a.inside && !stale && !GAME.inside;
    if (g) { g.visible = show; g.position.set(a.x, a.y, a.z); g.rotation.y = a.vrot; }
    // riding: the vehicle shows (or, in the bus or the ferry, only the name), the body does not
    const body = !(inBig || g); a.mesh.visible = show; a.tag.visible = show && Math.hypot(PL.x - a.x, PL.z - a.z) < 60; if (a.bodyOn !== body) { a.bodyOn = body; for (const o of a.mesh.children) if (o !== a.tag && o !== a.emo && o !== a.sayS) o.visible = body; }
    a.mesh.position.set(a.x, g ? a.y + 1.2 : inBig ? a.y + 1.6 : a.y, a.z); a.mesh.rotation.y = a.rot; a.ph += dt * (a.spd > 0.15 && !g ? 2.4 + a.spd * 1.6 : 1.8);
    if (!g) animateBody(a.parts, a.rest, a.ph, a.spd > 0.15 ? a.spd : 0, dt, {});
    if (a.emoT > 0) { a.emoT -= dt; if (a.emoT <= 0 && a.emo) a.emo.visible = false; } if (a.sayT > 0) { a.sayT -= dt; if (a.sayT <= 0 && a.sayS) a.sayS.visible = false; }
  }
  const m = PL.netMe; if (m) { if (m.emoT > 0) { m.emoT -= dt; if (m.emoT <= 0 && m.emo) m.emo.visible = false; } if (m.sayT > 0) { m.sayT -= dt; if (m.sayT <= 0 && m.sayS) m.sayS.visible = false; } }
  if (!NET.A) return; NET.sendT += dt; if (NET.sendT > 0.12) { NET.sendT = 0; if (Object.values(NET.peers).some(p => p.ok)) NET.A.st.send(NET.myState()); }
  if (NET.role === 'host') { NET.envT += dt; if (NET.envT > 12) { NET.envT = 0; NET.sendEnv(); } for (const [id, w] of Object.entries(NET.waitAsk)) if (now - w.t > 45000) NET.accept(id, false); }
  if (NET.role === 'seek' && now - NET.joinT > 30000 && !NET.hostId) { NET.setStatus('⚠ その番号の島が見つかりませんでした（番号と、相手が島をひらいているかをたしかめてね）'); NET.leave(); NET.role = null; }
};
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { NET.update(dt || 0.016); } catch (e) { if (!NET._e) { NET._e = 1; console.warn('net', e); } } return r; }; }
// ---------- host ----------
NET.newCode = () => String(100000 + Math.floor(Math.random() * 900000));
NET.host = async function () { if (VISIT.on) return; let code = ''; try { code = localStorage.getItem('hoshinami-net-code') || ''; } catch (e) { } if (!/^\d{6}$/.test(code)) { code = NET.newCode(); try { localStorage.setItem('hoshinami-net-code', code); } catch (e) { } }
  NET.myName = GAME.p.name; const ok = await NET.open(code, 'host'); if (ok) { NET.setStatus(''); UI.toast(`🌉 島をひらきました。島番号は ${code}（友だちに教えてね）`); } NET.renderGate(); };
NET.close = function () { if (NET.A && NET.role === 'host') { try { NET.A.ctl.send({ t: 'close' }); } catch (e) { } } setTimeout(() => { NET.leave(); NET.role = null; NET.renderBar(); NET.renderGate(); }, 300); UI.toast('🌉 島をとじました'); };
NET.kick = id => { if (NET.A && NET.role === 'host') NET.A.ctl.send({ t: 'kick' }, { target: id }); };
// ---------- guest: going ----------
NET.seek = async function (code) { if (!/^\d{6}$/.test(code)) { NET.setStatus('⚠ 島番号は6けたの数字です'); return; } if (VISIT.on) return; NET.lastSeek = code; NET.myName = GAME.p.name; NET.setStatus(`🔎 島番号 ${code} の島をさがしています…`); await NET.open(code, 'seek'); };
// ---------- UI ----------
NET.setStatus = function (t) { NET.status = t; const el = document.getElementById('netStatus'); if (el) el.textContent = t; else if (/^[⚠😢✅⛴]/u.test(t || '')) { try { UI.toast(t.length > 70 ? t.slice(0, 70) + '…' : t); } catch (e) { } } NET.renderBar(); };
NET.openGate = function () {
  GAME.modal = 'netgate'; let pref = 0; try { pref = +(localStorage.getItem('hoshinami-net-col') || 0); } catch (e) { } NET.myCol = NET.myCol || pref || 0; NET.renderGate(); GAME.el.modal.hidden = false; try { SND.play('ui_open1', { vol: 0.5 }); } catch (e) { } };
NET.renderGate = function () {
  if (GAME.modal !== 'netgate') return; const ci = document.getElementById('netCode'), prev = ci ? ci.value : (NET.lastSeek || ''); const S = NET.gateSpot(), host = NET.role === 'host' && NET.room, gs = NET.guests();
  GAME.el.modal.innerHTML = `<div class="mbox journal netbox"><div class="mh"><h2>🌐 ${esc(S ? S.name : '窓口')}　オンライン</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb">
    ${VISIT.on ? `<p>いまは <b>${esc(VISIT.d.host.island)}島</b> におでかけ中です。</p><div class="nrow"><button class="primary" data-n="home">🏠 自分の島に帰る</button></div>` : `
    <div class="ncard"><h3>🏝️ 島をひらく（友だちに来てもらう）</h3>${host ? `<p class="ncode">島番号 <b>${esc(NET.code)}</b></p><p class="small">この番号を友だちに教えてね。来たい人がいると「入れる？」と聞かれます（4人まで）。</p><p class="small">いま来ている人：${gs.length ? gs.map(id => esc(NET.peers[id].name)).join('・') : 'まだいません'}</p><div class="nrow"><button data-n="close">島をとじる</button><button data-n="recode">番号をかえる</button></div>` : `<p class="small">番号を発行して、友だちを待ちます。来ているあいだも、ふつうに遊べます。</p><div class="nrow"><button class="primary" data-n="host">島をひらく</button></div>`}</div>
    <div class="ncard"><h3>⛴ ほかの島へ行く</h3><p class="small">友だちに教えてもらった6けたの島番号を入れてね。</p><div class="nrow"><input id="netCode" inputmode="numeric" maxlength="6" placeholder="例：123456" value="${esc(prev)}"><button class="primary" data-n="go" ${host ? 'disabled title="島をひらいているあいだは行けません"' : ''}>行く</button></div></div>
    <div class="ncard"><h3>👕 服の色（ほかの人から見えるあなた）</h3><div class="ncols">${NET.COL.map((c, i) => `<button class="ncol ${i === (NET.myCol | 0) ? 'on' : ''}" data-col="${i}" title="${c.name}" style="background:${c.top}"></button>`).join('')}</div></div>`}
    <p id="netStatus" class="nstat">${esc(NET.status || '')}</p>
    <p class="small nnote">・通信はインターネットで、ブラウザどうしが直接つながります（相手を見つけるときだけ公開の中継サーバーを使います）。<br>・行った先の島で遊んだことは、どちらの島にも保存されません。<br>・知らない人に島番号を教えないでね。チャットは決まった言葉とスタンプだけです。<br>・ふたりとも同じ版（ver.${esc(GAME_VER)}）のゲームでないと行き来できません。</p></div></div>`;
  const box = GAME.el.modal.querySelector('.netbox'); const inp = box.querySelector('#netCode'); if (inp) { inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') box.querySelector('[data-n="go"]').click(); }; inp.oninput = () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 6); }; }
  box.onclick = e => { const x = e.target.closest('[data-x]'); if (x) { GAME.closeModal(); return; } const c = e.target.closest('[data-col]'); if (c) { NET.myCol = +c.dataset.col; try { localStorage.setItem('hoshinami-net-col', String(NET.myCol)); } catch (er) { } if (NET.room) { NET.dressMe(true); try { NET.A.hi.send(NET.hiMsg()); } catch (er) { } } NET.renderGate(); return; }
    const b = e.target.closest('[data-n]'); if (!b || b.disabled) return; const k = b.dataset.n;
    if (k === 'host') NET.host(); if (k === 'close') NET.close(); if (k === 'recode') { try { localStorage.setItem('hoshinami-net-code', NET.newCode()); } catch (er) { } NET.leave(); NET.role = null; NET.host(); }
    if (k === 'go') NET.seek((inp && inp.value || '').trim()); if (k === 'home') NET.goHome(); };
};
// the bar along the top while online: who is here, stamps, phrases, leave
NET.renderBar = function () {
  let el = document.getElementById('netBar'); const on = !!NET.room || VISIT.on; if (!on) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'netBar'; document.body.appendChild(el);
    el.onclick = e => { const b = e.target.closest('[data-nb]'); if (!b) return; e.stopPropagation(); const k = b.dataset.nb;
      if (k === 'home') NET.goHome(); if (k === 'gate') NET.openGate(); if (k === 'ph') el.classList.toggle('phopen'); if (k.startsWith('s:')) NET.say({ t: 'stamp', k: k.slice(2) }); if (k.startsWith('p:')) { NET.say({ t: 'ph', i: +k.slice(2) }); el.classList.remove('phopen'); }
      if (k.startsWith('kick:')) NET.kick(k.slice(5)); document.getElementById('c').focus(); }; }
  const people = Object.keys(NET.peers).filter(id => NET.peers[id].ok).map(id => `<span class="np" style="--c:${(NET.COL[NET.peers[id].col] || NET.COL[0]).top}">${esc(NET.peers[id].name)}${NET.peers[id].role === 'host' ? '👑' : ''}${NET.role === 'host' ? `<button data-nb="kick:${id}" title="「またね」と帰ってもらう">×</button>` : ''}</span>`).join('');
  const title = VISIT.on ? `🌉 ${esc(VISIT.d.host.island)}島におでかけ中` : NET.role === 'host' ? `🌉 島をひらいています　番号 <b>${esc(NET.code)}</b>` : NET.role === 'seek' ? `🔎 さがしています…` : '🌐 オンライン';
  const html = `<div class="nb1"><span class="nt">${title}</span>${people}${VISIT.on ? '<button data-nb="home" class="nhome">🏠 帰る</button>' : '<button data-nb="gate">⚙</button>'}</div>
    ${VISIT.on || people ? `<div class="nb2">${Object.entries(NET.STAMP).map(([k, v]) => `<button data-nb="s:${k}">${v}</button>`).join('')}<button data-nb="ph">💬</button></div><div class="nph">${NET.PHRASE.map((t, i) => `<button data-nb="p:${i}">${esc(t)}</button>`).join('')}</div>` : ''}`;
  if (el._h !== html) { el.innerHTML = html; el._h = html; }
};
// host: "may I come?" cards
NET.renderAsks = function () { let el = document.getElementById('netAsk'); const ids = Object.keys(NET.waitAsk); if (!ids.length) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'netAsk'; document.body.appendChild(el); el.onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; e.stopPropagation(); const [k, id] = b.dataset.a.split('|'); NET.accept(id, k === 'y'); document.getElementById('c').focus(); }; }
  el.innerHTML = ids.map(id => `<div class="na">🌉 <b>${esc(NET.waitAsk[id].name)}</b>さんが、島に遊びに来たいそうです<div><button data-a="y|${id}" class="primary">入れる</button><button data-a="n|${id}">ことわる</button></div></div>`).join(''); };
NET.log = function (t) { let el = document.getElementById('netLog'); if (!el) { el = document.createElement('div'); el.id = 'netLog'; document.body.appendChild(el); } const d = document.createElement('div'); d.textContent = t; el.appendChild(d); while (el.children.length > 5) el.firstChild.remove(); setTimeout(() => d.remove(), 12000); };
addEventListener('beforeunload', () => { try { if (NET.room) NET.room.leave(); } catch (e) { } });
{ const st = document.createElement('style'); st.textContent = `
#netBar{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:25;display:flex;flex-direction:column;align-items:center;gap:4px;font:600 13px "M PLUS Rounded 1c",sans-serif;pointer-events:none;max-width:calc(100vw - 24px)}
body:has(#gModal:not([hidden])) #netBar{display:none}#netBar>div{pointer-events:auto}#netBar .nb1,#netBar .nb2{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,.92);border-radius:999px;padding:5px 10px;box-shadow:0 2px 10px rgba(0,0,0,.18)}
#netBar button{border:0;background:#eef3f6;border-radius:999px;padding:4px 9px;font:inherit;cursor:pointer}#netBar .nhome{background:#2f7a4a;color:#fff}#netBar .np{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--c) 30%,white);border:2px solid var(--c)}#netBar .np button{padding:0 5px;background:transparent;color:#a33}
#netBar .nph{display:none;flex-wrap:wrap;gap:5px;justify-content:center;background:rgba(255,255,255,.95);border-radius:14px;padding:8px;max-width:520px;box-shadow:0 2px 10px rgba(0,0,0,.18)}#netBar.phopen .nph{display:flex}
#netAsk{position:fixed;right:14px;top:70px;z-index:26;display:flex;flex-direction:column;gap:8px;font:600 14px "M PLUS Rounded 1c",sans-serif}#netAsk .na{background:#fff;border-radius:14px;padding:10px 14px;box-shadow:0 4px 16px rgba(0,0,0,.22);border-left:6px solid #2c7a4a}#netAsk .na div{display:flex;gap:8px;margin-top:8px}#netAsk button{border:0;border-radius:999px;padding:6px 14px;font:inherit;cursor:pointer;background:#eef0f2}#netAsk button.primary{background:#2c7a4a;color:#fff}
#netLog{position:fixed;left:14px;bottom:110px;z-index:24;display:flex;flex-direction:column;gap:4px;font:600 13px "M PLUS Rounded 1c",sans-serif;pointer-events:none}#netLog div{background:rgba(255,255,255,.88);border-radius:10px;padding:3px 10px;width:max-content;max-width:60vw}
.netbox .ncard{background:#f6f8f4;border-radius:14px;padding:10px 14px;margin:0 0 10px}.netbox h3{margin:0 0 6px;font-size:15px}.netbox .nrow{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.netbox input{font:700 20px ui-monospace,monospace;letter-spacing:.2em;width:9em;padding:6px 10px;border-radius:10px;border:2px solid #c8d4cc}
.netbox .ncode{font-size:16px;margin:4px 0}.netbox .ncode b{font:800 30px ui-monospace,monospace;letter-spacing:.18em;color:#2c5a8a}.netbox .ncols{display:flex;gap:8px;flex-wrap:wrap}.netbox .ncol{width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #bbb;cursor:pointer}.netbox .ncol.on{box-shadow:0 0 0 3px #2c7a4a}
.netbox .nstat{min-height:1.3em;font-weight:700;color:#2c5a8a}.netbox .nnote{opacity:.8;line-height:1.6}body.netvisit #hud .money,body.netvisit #hud .gside{display:none!important}`; document.head.appendChild(st); }
