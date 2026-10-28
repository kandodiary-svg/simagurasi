// ===================== 買い物（shopping.js）: 棚から選ぶ → かご → レジ → もちもの =====================
// 棚の前で Space → その棚の商品（3Dの写真・値段・のこりの数）→ かごに入れる（棚から本当になくなる）→ レジで会計。
// 会計前に出ようとすると店員さんに呼びとめられる。買ったものは「もちもの」から 食べる・飲む・あげる・料理に使う・かざる・着る・読む。
const SHOP = { basket: [], buff: {} };
SHOP.ctx = () => (GAME.place && GAME.place.ctx) || null;
SHOP.total = () => SHOP.basket.reduce((s, b) => s + GOODS.byId[b.id].price, 0);
SHOP.groups = list => { const m = new Map(); for (const b of list) m.set(b.id, (m.get(b.id) || 0) + 1); return [...m.entries()]; };
SHOP.bag = () => { const b = GAME.bag(); b.goods = b.goods || {}; return b; };
SHOP.hud = function () {
  let el = document.getElementById('shopHud'); const on = GAME.inside && GAME.place && (SHOP.basket.length || Object.keys(SHOP.buffNow()).length); if (!on) { if (el) el.hidden = true; } else {
    if (!el) { el = document.createElement('div'); el.id = 'shopHud'; document.body.appendChild(el); el.onclick = e => { if (e.target.closest('[data-bk]')) SHOP.openBasket(); }; }
    const bf = Object.entries(SHOP.buffNow()).map(([k, t]) => `<span class="bf">${SHOP.BUFF[k].ic} ${SHOP.BUFF[k].name} ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}</span>`).join('');
    const html = (SHOP.basket.length ? `<button data-bk="1">🧺 かご <b>${SHOP.basket.length}点</b> ${yen(SHOP.total())}</button>` : '') + bf; if (el._h !== html) { el.innerHTML = html; el._h = html; } el.hidden = false; }
  // outdoors the buffs show too
  let ob = document.getElementById('buffHud'); const bn = SHOP.buffNow(), out = !GAME.inside && GAME.p && Object.keys(bn).length; if (!out) { if (ob) ob.hidden = true; return; }
  if (!ob) { ob = document.createElement('div'); ob.id = 'buffHud'; document.body.appendChild(ob); } const h2 = Object.entries(bn).map(([k, t]) => `<span class="bf">${SHOP.BUFF[k].ic} ${SHOP.BUFF[k].name} ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}</span>`).join(''); if (ob._h !== h2) { ob.innerHTML = h2; ob._h = h2; } ob.hidden = false;
};
// ---------- the shelf ----------
SHOP.openShelf = function (sec) {
  const C = SHOP.ctx(); if (!C) return; const g = GAME; g.modal = 'shelf'; SHOP.curSec = sec; SHOP.qty = SHOP.qty || {};
  const cards = sec.prods.filter(id => GOODS.byId[id]).map(id => { const P = GOODS.byId[id], left = C.S.count(sec, id), q = Math.min(SHOP.qty[id] || 1, Math.max(1, left)), use = SHOP.useText(P);
    return `<div class="gcard ${left ? '' : 'out'}"><img src="${GOODS.thumb(id)}" alt=""><div class="gi2"><b>${esc(P.name)}</b><span class="pr">${yen(P.price)}</span><span class="nt">${esc(P.note)}</span><span class="us">${use}</span></div>
      <div class="gq">${left ? `<button data-q="${id}|-1">−</button><span>${q}</span><button data-q="${id}|1">＋</button><button class="primary" data-add="${id}">かごに入れる</button>` : '<span class="soldout">売り切れ</span>'}<small>のこり ${left}</small></div></div>`; }).join('');
  g.el.modal.innerHTML = `<div class="mbox shelfbox"><div class="mh"><h2>🛒 ${esc(sec.name)}</h2><span class="isl">所持金 ${yen(g.p.money)}</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div class="gcards">${cards || '<p>この棚はからっぽです</p>'}</div></div>
    <div class="mf">🧺 かご ${SHOP.basket.length}点 ${yen(SHOP.total())}　<small>買うときはレジで会計してね</small>${SHOP.basket.length ? '<button data-bk="1">かごの中を見る</button>' : ''}</div></div>`;
  g.el.modal.hidden = false; try { SND.play('ui_open1', { vol: 0.4 }); } catch (e) { }
  g.el.modal.querySelector('.shelfbox').onclick = e => { if (e.target.closest('[data-x]')) return g.closeModal(); if (e.target.closest('[data-bk]')) return SHOP.openBasket();
    const q = e.target.closest('[data-q]'); if (q) { const [id, d] = q.dataset.q.split('|'); SHOP.qty[id] = clamp((SHOP.qty[id] || 1) + +d, 1, Math.max(1, C.S.count(sec, id))); return SHOP.openShelf(sec); }
    const a = e.target.closest('[data-add]'); if (a) { const id = a.dataset.add, n = SHOP.qty[id] || 1; let got = 0; for (let k = 0; k < n; k++) { if (!C.S.take(sec, id)) break; SHOP.basket.push({ id, sec }); got++; } SHOP.qty[id] = 1;
      if (got) { try { SND.play('place_soft', { vol: 0.5 }); } catch (er) { } UI.toast(`🧺 ${GOODS.byId[id].name} を${got > 1 ? ` ${got}こ` : ''}かごに入れた`); } else UI.toast('売り切れです'); SHOP.hud(); return SHOP.openShelf(sec); } };
};
SHOP.useText = P => { const u = P.use || {}; if (u.veg || u.forage || u.mikan || u.fish) return '🍳 料理の材料になる'; if (u.cook) return '🍳 料理に使える（なくならない）'; if (u.seed) return '🌱 畑にまける'; if (u.furn) return '🏠 家にかざれる'; if (u.wear) return '👕 着られる'; if (u.read) return '📖 読める'; if (u.drink) return '🥤 飲める' + (u.buff ? `・${SHOP.BUFF[u.buff] ? SHOP.BUFF[u.buff].name : ''}` : ''); if (u.eat) return '🍙 食べられる' + (u.buff ? `・${SHOP.BUFF[u.buff] ? SHOP.BUFF[u.buff].name : ''}` : ''); if (u.buffUse) return `✨ 使うと ${SHOP.BUFF[u.buffUse].name}`; if (u.hanabi) return '🎆 夜、外で遊べる'; if (u.food) return '🍳 料理の材料・プレゼントに'; return '🎁 プレゼントにも'; };
// ---------- the basket ----------
SHOP.openBasket = function () {
  const g = GAME; g.modal = 'basket'; const rows = SHOP.groups(SHOP.basket).map(([id, n]) => { const P = GOODS.byId[id]; return `<li><img src="${GOODS.thumb(id)}" alt=""><div><b>${esc(P.name)}</b> ×${n}<div class="sub">${yen(P.price * n)}</div></div><button data-back="${id}">1こ棚にもどす</button></li>`; }).join('');
  g.el.modal.innerHTML = `<div class="mbox journal basketbox"><div class="mh"><h2>🧺 かごの中</h2><span class="isl">合計 ${yen(SHOP.total())}</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><ul class="list blist">${rows || '<li><div class="sub">からっぽです</div></li>'}</ul><p class="small">レジで会計すると、もちものに入ります。</p></div></div>`;
  g.el.modal.hidden = false; g.el.modal.querySelector('.basketbox').onclick = e => { if (e.target.closest('[data-x]')) return g.closeModal(); const b = e.target.closest('[data-back]'); if (b) { SHOP.putBack(b.dataset.back); return SHOP.basket.length ? SHOP.openBasket() : g.closeModal(); } };
};
SHOP.putBack = function (id) { const i = SHOP.basket.map(b => b.id).lastIndexOf(id); if (i < 0) return; const b = SHOP.basket.splice(i, 1)[0], C = SHOP.ctx(); if (C && b.sec) C.S.putBack(b.sec, id); SHOP.hud(); };
SHOP.putBackAll = function () { while (SHOP.basket.length) SHOP.putBack(SHOP.basket[SHOP.basket.length - 1].id); };
// ---------- the register ----------
SHOP.registerLabel = () => SHOP.basket.length ? `レジで会計する（${SHOP.basket.length}点 ${yen(SHOP.total())}）` : 'レジ（かごに入れてから会計してね）';
SHOP.checkout = function () {
  const g = GAME, p = g.p; if (!SHOP.basket.length) { SHOP.say('いらっしゃいませ。かごに入れてから、こちらでお会計してくださいね。'); return; }
  const tot = SHOP.total(), fishN = SHOP.basket.reduce((s, b) => s + ((GOODS.byId[b.id].use || {}).fish ? ((GOODS.byId[b.id].use.n) || 1) : 0), 0), room = FISH_CAP - g.bag().fish.length;
  g.modal = 'register'; const rows = SHOP.groups(SHOP.basket).map(([id, n]) => { const P = GOODS.byId[id]; return `<tr><td>${esc(P.name)}</td><td>${n}</td><td>${yen(P.price * n)}</td></tr>`; }).join('');
  const mikanN = SHOP.basket.reduce((s, b) => s + ((GOODS.byId[b.id].use || {}).mikan || 0), 0), mRoom = MIKAN_CAP - (g.bag().mikan || 0), forN = SHOP.basket.reduce((s, b) => s + ((GOODS.byId[b.id].use || {}).forage ? 1 : 0), 0), fRoom = typeof FORAGE !== 'undefined' && FORAGE.CAP ? FORAGE.CAP - FORAGE.count() : 99;
  const short = p.money < tot, fishFull = fishN > room || mikanN > mRoom || forN > fRoom;
  g.el.modal.innerHTML = `<div class="mbox regbox"><div class="mh"><h2>🧾 お会計</h2><span class="isl">所持金 ${yen(p.money)}</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb">
    <table class="rcp"><tr><th>商品</th><th>数</th><th>金額</th></tr>${rows}<tr class="tot"><td>合計（税込）</td><td>${SHOP.basket.length}点</td><td>${yen(tot)}</td></tr></table>
    ${short ? `<p class="warn">お金が ${yen(tot - p.money)} たりません。いくつか棚にもどしてね。</p>` : ''}${fishN > room ? `<p class="warn">クーラーボックスに魚が入りきりません（あと ${Math.max(0, room)} 匹）。</p>` : ''}${mikanN > mRoom ? `<p class="warn">みかんがもう持てません（あと ${Math.max(0, mRoom)} こ）。出荷所で売るか、料理に使ってね。</p>` : ''}${forN > fRoom ? `<p class="warn">山の幸のかごがいっぱいです（あと ${Math.max(0, fRoom)} こ）。</p>` : ''}
    <div class="nrow"><button class="primary" data-pay="1" ${short || fishFull ? 'disabled' : ''}>お支払い（${yen(tot)}）</button><button data-bk="1">かごを見る</button></div></div></div>`;
  g.el.modal.hidden = false; try { SND.play('ui_open1', { vol: 0.4 }); } catch (e) { }
  g.el.modal.querySelector('.regbox').onclick = e => { if (e.target.closest('[data-x]')) return g.closeModal(); if (e.target.closest('[data-bk]')) return SHOP.openBasket(); if (e.target.closest('[data-pay]')) SHOP.pay(); };
};
SHOP.pay = function () {
  const g = GAME, p = g.p, tot = SHOP.total(), items = SHOP.basket.slice(); if (p.money < tot) return; p.money -= tot; SHOP.basket = [];
  const day = todayKey(); p.shopSold = p.shopSold && p.shopSold.day === day ? p.shopSold : { day, n: {} }; const key = g.place.key + (g.place.kind || '');
  for (const it of items) { if (GOODS.byId[it.id].cat === 'cafe') continue; p.shopSold.n[key + ':' + it.id] = (p.shopSold.n[key + ':' + it.id] || 0) + 1; } // made to order: not taken from a shelf
  p.stats.shopN = (p.stats.shopN || 0) + items.length; p.stats.shopYen = (p.stats.shopYen || 0) + tot;
  const cafe = items.filter(it => GOODS.byId[it.id].cat === 'cafe'), rest = items.filter(it => GOODS.byId[it.id].cat !== 'cafe');
  for (const it of rest) SHOP.receive(it.id); try { SND.play('register', { vol: 0.7 }); } catch (e) { }
  g.dirty = true; g.renderTracker && g.renderTracker(); SHOP.hud();
  const nm = g.placeName(g.place), now = typeof seasonDate === 'function' ? seasonDate() : new Date(), hf = typeof currentHour === 'function' ? currentHour() : now.getHours() + now.getMinutes() / 60, rows = SHOP.groups(items).map(([id, n]) => `<tr><td>${esc(GOODS.byId[id].name)}</td><td>${n > 1 ? '×' + n : ''}</td><td>${yen(GOODS.byId[id].price * n)}</td></tr>`).join('');
  g.modal = 'receipt'; g.el.modal.innerHTML = `<div class="mbox receipt"><div class="mb"><h3>${esc(nm)}</h3><p class="small">${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${Math.floor(hf)}:${String(Math.floor((hf % 1) * 60)).padStart(2, '0')}</p><p class="small">ご来店ありがとうございます</p>
    <table class="rcp">${rows}<tr class="tot"><td>合計</td><td>${items.length}点</td><td>${yen(tot)}</td></tr><tr><td>お預り</td><td></td><td>${yen(SHOP.tender(tot))}</td></tr><tr><td>おつり</td><td></td><td>${yen(SHOP.tender(tot) - tot)}</td></tr></table>
    <p class="small">${cafe.length ? 'お席でお待ちください' : '買ったものは もちもの（I）に入りました'}</p><div class="nrow">${cafe.length ? '<button class="primary" data-eat="in">店内でめしあがる</button><button data-eat="out">持ち帰る</button>' : '<button class="primary" data-x="ok">OK</button>'}</div></div></div>`;
  g.el.modal.hidden = false; SHOP.say(cafe.length ? 'ありがとうございます。ごゆっくりどうぞ！' : 'ありがとうございました！ またお越しくださいませ。');
  g.el.modal.querySelector('.receipt').onclick = e => { if (e.target.closest('[data-x]')) return g.closeModal(); const ea = e.target.closest('[data-eat]'); if (ea) { g.closeModal(); if (ea.dataset.eat === 'in') SHOP.eatIn(cafe.map(c => c.id)); else { for (const it of cafe) SHOP.receive(it.id); UI.toast('🥡 テイクアウトにした（もちものに入った）'); } } };
  try { g.check(); } catch (e) { } g.save();
};
// how much you hand over: bills (1,000 / 5,000 / 10,000 yen), or the exact coins for a small amount that ends in a round number
SHOP.tender = tot => tot <= 0 ? 0 : (tot < 1000 && tot % 50 === 0) ? tot : tot <= 1000 ? 1000 : tot <= 5000 && tot > 4000 ? 5000 : tot <= 10000 && tot > 9000 ? 10000 : Math.ceil(tot / 1000) * 1000;
SHOP.say = function (t) { const pl = GAME.place, st = pl && (pl.staffDef || pl.P.staff); const who = pl && pl.key === 'mall' ? '店員' : (st && st.who) || '店員'; UI.toast(`${who}「${t}」`); };
// what you bought goes where it is used
SHOP.receive = function (id, n = 1) {
  const P = GOODS.byId[id], u = P.use || {}, b = SHOP.bag();
  if (u.veg && typeof GARDEN !== 'undefined') { const gb = GARDEN.bag(), k = (u.n || 1) * n; gb.veg[u.veg] = (gb.veg[u.veg] || 0) + k; gb.vegB = gb.vegB || {}; gb.vegB[u.veg] = (gb.vegB[u.veg] || 0) + k; return; }
  if (u.mikan) { const before = b.mikan || 0; b.mikan = Math.min(MIKAN_CAP, before + u.mikan * n); b.mikanB = (b.mikanB || 0) + (b.mikan - before); return; }
  if (u.forage && typeof FORAGE !== 'undefined') { const fb = FORAGE.bag(); fb.forage[u.forage] = (fb.forage[u.forage] || 0) + n; return; }
  if (u.fish) { for (let k = 0; k < (u.n || 1) * n; k++) b.fish.push({ id: u.fish, size: Math.round(u.size * (0.92 + Math.random() * 0.16)), shop: 1 }); return; }
  if (u.seed && typeof GARDEN !== 'undefined') { const gb = GARDEN.bag(); gb.seeds[u.seed] = (gb.seeds[u.seed] || 0) + n; return; }
  b.goods[id] = (b.goods[id] || 0) + n;
};
// ---------- leaving without paying: the staff calls you back ----------
SHOP.guardExit = function () { if (!SHOP.basket.length) return false; const g = GAME; g.modal = 'unpaid';
  g.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>🙋 お客さま！</h2></div><div class="mb"><p>「お客さま、お会計がまだですよ〜！」</p><p class="small">かごに ${SHOP.basket.length}点（${yen(SHOP.total())}）入っています。</p><div class="nrow"><button class="primary" data-u="pay">レジで会計する</button><button data-u="back">ぜんぶ棚にもどして出る</button></div></div></div>`;
  g.el.modal.hidden = false; try { SND.play('ui_error4', { vol: 0.5 }); } catch (e) { }
  g.el.modal.querySelector('.journal').onclick = e => { const b = e.target.closest('[data-u]'); if (!b) return; g.closeModal(); if (b.dataset.u === 'pay') SHOP.checkout(); else { SHOP.putBackAll(); g.exitHome(); } }; return true; };
{ const _ex = GAME.exitHome; GAME.exitHome = function () { if (this.place && SHOP.basket.length && SHOP.guardExit()) return; const r = _ex.apply(this, arguments); return r; }; }
{ const _ra = GAME.resetAll; if (_ra) GAME.resetAll = function () { SHOP.basket = []; SHOP.buff = {}; return _ra.apply(this, arguments); }; }
// ---------- café: sit down and eat ----------
SHOP.eatIn = function (ids) {
  const C = SHOP.ctx(), all = (C && C.seats) || [], low = all.filter(s => !s.h), seats = low.length ? low : all; const seat = seats[Math.floor(Math.random() * seats.length)];
  if (!seat) { for (const id of ids) SHOP.receive(id); UI.toast('席がいっぱいだったので、持ち帰りにした'); return; }
  GAME.fade(() => { PL.x = seat.x; PL.z = seat.z; PL.rot = seat.ry; SHOP.eating = { t: 0, ids, seat, objs: [] };
    const grp = new THREE.Group(); ROOM.group.add(grp); ids.slice(0, 3).forEach((id, k) => { const B = GOODS.get(id), m = new THREE.Mesh(B.geo, B.mats); m.position.set(seat.tx + (k - (Math.min(3, ids.length) - 1) / 2) * 0.16, 0.755, seat.tz); grp.add(m); }); SHOP.eating.grp = grp; UI.toast('🍴 いただきます！'); });
};
SHOP.updateEat = function (dt) { const E = SHOP.eating; if (!E) return false; E.t += dt; PL.x = E.seat.x; PL.z = E.seat.z; PL.rot = E.seat.ry; const P = PL.parts; if (P && P.thighL) { P.thighL.rotation.set(-1.45, 0, 0.04); P.thighR.rotation.set(-1.45, 0, -0.04); P.shinL.rotation.set(1.45, 0, 0); P.shinR.rotation.set(1.45, 0, 0); const k = Math.sin(E.t * 6) * 0.25; P.upperArmR.rotation.set(-0.9 + k, 0, 0.1); P.foreArmR.rotation.set(-1.0 - k, 0, 0); P.upperArmL.rotation.set(-0.5, 0, -0.1); }
  if (PL.rest && PL.rest.pelvis) PL.parts.pelvis.position.y = PL.rest.pelvis.y * 0.6; PL.mesh.position.set(PL.x, 0, PL.z); PL.mesh.rotation.y = PL.rot;
  if (E.t > 4.5) { if (E.grp) ROOM.group.remove(E.grp); SHOP.eating = null; for (const id of E.ids) SHOP.consume(id, true); if (PL.rest && PL.rest.pelvis) PL.parts.pelvis.position.y = PL.rest.pelvis.y; SHOP.standUp(); UI.toast('😋 ごちそうさまでした！'); } return true; };
// get up from the seat: step out to the nearest place where you can walk (the seat itself is inside the table's area)
SHOP.standUp = function () { const S = ROOM.size, ok = (x, z) => Math.abs(x) < S.w / 2 - 0.4 && z > -S.d / 2 + 0.4 && z < S.d / 2 - 0.3 && !GAME.roomBlocked(x, z); if (ok(PL.x, PL.z)) return; const a0 = PL.rot;
  for (let r = 0.3; r < 3; r += 0.1) for (let k = 0; k < 24; k++) { const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 12, x = PL.x + Math.sin(a) * r, z = PL.z + Math.cos(a) * r; if (ok(x, z)) { PL.x = x; PL.z = z; PL.mesh.position.set(x, 0, z); return; } } };
// ---------- buffs (a short effect after eating / drinking / using) ----------
SHOP.BUFF = { speed: { ic: '⚡', name: 'はやあし', s: 180, t: '体がかるい！ しばらく走るのが速くなる' }, happy: { ic: '💗', name: 'ごきげん', s: 300, t: 'しあわせな気分。住民にあげるとよろこばれる（なかよし +1）' }, cool: { ic: '🧊', name: 'ひんやり', s: 240, t: 'ひんやり。暑い日でも走るのが速くなる' },
  warm: { ic: '🔥', name: 'ぽかぽか', s: 600, t: 'ぽかぽか。寒い日も平気' }, fish: { ic: '🎣', name: 'つりびより', s: 600, t: 'しばらく魚がよく食いつく' }, bugguard: { ic: '🌀', name: '虫よけ', s: 900, t: 'しばらく蚊に刺されない' } };
SHOP.buffNow = () => { const now = performance.now() / 1000, out = {}; for (const [k, t] of Object.entries(SHOP.buff)) if (t > now) out[k] = t - now; return out; };
SHOP.addBuff = k => { if (!SHOP.BUFF[k]) return; SHOP.buff[k] = performance.now() / 1000 + SHOP.BUFF[k].s; UI.toast(`${SHOP.BUFF[k].ic} ${SHOP.BUFF[k].name}：${SHOP.BUFF[k].t}`); SHOP.hud(); };
{ const _mi = moveInput; moveInput = function () { const r = _mi.apply(this, arguments); if (!GAME.inside && !PL.veh) { const b = SHOP.buffNow(); const f = b.speed ? 1.2 : b.cool && (typeof TIME === 'undefined' || currentHour() > 10) ? 1.1 : 1; if (f > 1) r[2] *= f; } return r; }; }
{ const _uf = GAME.updateFishing; if (_uf) GAME.updateFishing = function (dt) { const F = LIFE.fish; if (F && F.st === 'wait' && SHOP.buffNow().fish) F.t += dt * 0.8; return _uf.apply(this, arguments); }; }
// ---------- using what you have ----------
SHOP.consume = function (id, here) { const P = GOODS.byId[id], u = P.use || {}; const verb = u.drink ? '飲んだ' : '食べた'; if (!here) { const b = SHOP.bag(); if (!(b.goods[id] > 0)) return; b.goods[id]--; if (!b.goods[id]) delete b.goods[id]; }
  try { SND.play(u.drink ? 'glass_tap' : 'ui_pluck1', { vol: 0.5 }); } catch (e) { } UI.toast(`${u.drink ? '🥤' : '😋'} ${P.name}を${verb}。${SHOP.TASTE[P.cat] || 'おいしい！'}`); if (u.buff) setTimeout(() => SHOP.addBuff(u.buff), 900);
  GAME.p.stats.eatN = (GAME.p.stats.eatN || 0) + 1; GAME.dirty = true; SHOP.emote('heart'); };
SHOP.TASTE = { drink: 'ごくごく。', dairy: 'やさしい味。', deli: 'おなかいっぱい！', bread: 'ふわっと香ばしい。', snack: 'ぱりぱり、止まらない。', ice: 'つめた〜い！', fruit: 'あまずっぱい！', souvenir: 'これはおいしい…！', local: '島の味がする。', cafe: 'しあわせ…。', fish: '新鮮でうまい！', instant: 'ほっとする味。' };
SHOP.emote = function (k) { try { if (!PL._emo) { let top = 1.3; try { const hb = new THREE.Box3().setFromObject(PL.parts.head, true); top = hb.max.y - PL.mesh.position.y; } catch (e) { } PL._emo = { mesh: PL.mesh, top }; } LIVE.emote(PL._emo, k, 1.8); } catch (e) { } };
{ const _ur = GAME.update; GAME.update = function (dt) { const r = _ur.apply(this, arguments); const m = PL._emo; if (m && m.emoT > 0) { m.emoT -= dt || 0.016; if (m.emoT <= 0 && m.emo) m.emo.visible = false; } SHOP.hudT = (SHOP.hudT || 0) - (dt || 0.016); if (SHOP.hudT < 0) { SHOP.hudT = 0.5; SHOP.hud(); } return r; }; }
SHOP.use = function (id, how) {
  const g = GAME, P = GOODS.byId[id], u = P.use || {}, b = SHOP.bag(); if (!(b.goods[id] > 0)) return;
  const take = () => { b.goods[id]--; if (!b.goods[id]) delete b.goods[id]; g.dirty = true; };
  if (how === 'eat') return SHOP.consume(id);
  if (how === 'read') return SHOP.read(id);
  if (how === 'wear') { const p = g.p; p.outfit = Object.assign({}, p.outfit || {}, u.wear); SHOP.dress(); UI.toast(`👕 ${P.name}に着がえた`); try { SND.play('cloth', { vol: 0.6 }); } catch (e) { } g.dirty = true; return; }
  if (how === 'furn') { const pl = g.place; g.place = null; let H; try { H = g.home(); } finally { g.place = pl; } const fid = FURN2.idOf(u.furn, u.v || 0); if (!FURN.find(f => f.id === fid)) { UI.toast('この家具はまだかざれません'); return; } H.store[fid] = (H.store[fid] || 0) + 1; take(); UI.toast(`🏠 ${P.name}を家の倉庫に送った（家の模様がえで置けます）`); try { SND.play('place_soft', { vol: 0.6 }); } catch (e) { } return; }
  if (how === 'buff') { take(); SHOP.addBuff(u.buffUse); try { SND.play('ui_pluck2', { vol: 0.5 }); } catch (e) { } return; }
  if (how === 'hanabi') { const hf = currentHour(); if (g.inside) { UI.toast('🎆 花火は外でやろう'); return; } if (hf > 5 && hf < 18.5) { UI.toast('🎆 花火は暗くなってから（夜）やろう'); return; } take(); SHOP.sparkler(); return; }
};
SHOP.ACTS = P => { const u = P.use || {}, a = []; if (u.eat || u.drink) a.push(['eat', u.drink ? '飲む' : '食べる']); if (u.read) a.push(['read', '読む']); if (u.wear) a.push(['wear', '着る']); if (u.furn) a.push(['furn', '家に送る']); if (u.buffUse) a.push(['buff', '使う']); if (u.hanabi) a.push(['hanabi', 'やる']); return a; };
// the bag shows what you bought
{ const _ob = GAME.openBag; GAME.openBag = function () { _ob.apply(this, arguments); const mb = this.el.modal.querySelector('.mb'); if (!mb) return; const b = SHOP.bag(), ids = Object.keys(b.goods).filter(id => b.goods[id] > 0 && GOODS.byId[id]);
  const rows = ids.map(id => { const P = GOODS.byId[id]; return `<li><img class="gth" src="${GOODS.thumb(id)}" alt=""><div><b>${esc(P.name)}</b> ×${b.goods[id]}<div class="sub">${SHOP.useText(P)}</div></div><span class="gbtn">${SHOP.ACTS(P).map(([k, t]) => `<button class="rel" data-gu="${id}|${k}">${t}</button>`).join('')}</span></li>`; }).join('');
  const h = document.createElement('div'); h.innerHTML = `<h3 class="bh">買ったもの（${ids.reduce((s, id) => s + b.goods[id], 0)}こ）</h3><ul class="list goodslist">${rows || '<li><div class="sub">お店で買ったものが入ります</div></li>'}</ul>`; mb.insertBefore(h, mb.firstChild);
  const box = this.el.modal.querySelector('.mbox'), prev = box.onclick; box.onclick = e => { const u = e.target.closest('[data-gu]'); if (u) { const [id, k] = u.dataset.gu.split('|'); SHOP.use(id, k); if (this.modal === 'bag') this.openBag(); return; } prev && prev(e); }; }; }
// ---------- gifts: what each person likes ----------
SHOP.LIKE = { v_gen: { love: ['himono', 'yokan', 'hojicha', 'b_tsuri', 'k_lure', 'chirimen'], like: ['fish', 'tea', 'fishing'] }, v_hana: { love: ['pot_red', 'pot_white', 'bouquet', 'mikanmanju', 'z_vase'], like: ['flower', 'sweet'] },
  v_mio: { love: ['b_ehon', 'crayon', 'a_dolphin', 'letterset', 'sketchbook'], like: ['book', 'cute', 'art'] }, v_sora: { love: ['karaben', 'cola', 'currypan', 'cupyakisoba'], like: ['meal', 'drink'] },
  v_rin: { love: ['b_weekly', 'b_novel', 'c_latte', 'notebook', 'z_frame'], like: ['book', 'coffee', 'stationery'] }, v_kai: { love: ['c_blend', 'coffeecan', 'lemonsq', 'c_takeout', 'z_mug'], like: ['coffee', 'drink', 'cafe'] },
  v_nagi: { love: ['ramune', 'kakigori', 'w_sandal', 'w_hat', 'ice_mikan'], like: ['summer', 'ice', 'fashion'] }, v_takumi: { love: ['onigiri', 'oni_shake', 'k_gunte', 'z_radio', 'cupnoodle'], like: ['meal', 'daily'] },
  v_yuki: { love: ['sketchbook', 'crayon', 'postcard', 'z_candle', 'c_lemontea'], like: ['art', 'cute', 'tea'] }, v_kota: { love: ['t_robot', 't_train', 'b_manga', 'chips', 'gummy', 't_ball'], like: ['toy', 'snack', 'sweet'] },
  v_minato: { love: ['b_guide', 'keyholder', 'b_fishzukan', 'a_whale', 'postcard'], like: ['book', 'souvenir', 'aqua'] } };
{ const _gb = GAME.giftables; GAME.giftables = function () { const b = SHOP.bag(); return _gb.apply(this, arguments) || Object.values(b.goods).some(v => v > 0); }; }
{ const _og = GAME.openGift; GAME.openGift = function (n) { _og.call(this, n); const box = this.el.modal.querySelector('.gifts'); if (!box) return; const b = SHOP.bag(), ids = Object.keys(b.goods).filter(id => b.goods[id] > 0 && GOODS.byId[id]);
  box.insertAdjacentHTML('beforeend', ids.map(id => `<button class="gi" data-ggo="${id}"><img src="${GOODS.thumb(id)}" alt="" style="width:34px;height:34px"><b>${esc(GOODS.byId[id].name)}</b><small>×${b.goods[id]}</small></button>`).join(''));
  const jb = this.el.modal.querySelector('.journal'), prev = jb.onclick; jb.onclick = e => { const a = e.target.closest('[data-ggo]'); if (!a) return prev && prev(e); const id = a.dataset.ggo, P = GOODS.byId[id], vid = n.def.id, L = SHOP.LIKE[vid] || { love: [], like: [] };
    const love = L.love.includes(id), like = !love && (P.tags || []).some(t => L.like.includes(t)), pts = (love ? 4 : like ? 2 : 1) + (SHOP.buffNow().happy ? 1 : 0), p = this.p;
    b.goods[id]--; if (!b.goods[id]) delete b.goods[id]; p.friend[vid] = (p.friend[vid] || 0) + pts; p.daily.gifted = p.daily.gifted || {}; p.daily.gifted[vid] = 1; p.stats.giftN++; if (love) { p.goodsLove = p.goodsLove || {}; (p.goodsLove[vid] = p.goodsLove[vid] || {})[id] = 1; }
    this.modal = null; this.el.modal.hidden = true; this.el.modal.innerHTML = '';
    const t = love ? `${P.name}！？ これ、ずっとほしかったの…！ ありがとう、${p.name}さん！` : like ? `${P.name}だ！ こういうの好きなんだ。ありがとう！` : `${P.name}？ ありがとう、大事にするね。`;
    DIALOG.npc = n; DIALOG.pages = [t]; DIALOG.i = 0; DIALOG.choices = null; UI.dialog(n.def.name, t); UI.toast(`🎁 ${P.name}をプレゼントした　なかよし +${pts}${love ? '（大好き！）' : ''}`); this.dirty = true; this.save(); }; }; }
// ---------- clothes ----------
SHOP.dress = function () { const o = GAME.p && GAME.p.outfit; if (!PL.mesh) return; SHOP.mat0 = SHOP.mat0 || new Map();
  PL.mesh.traverse(m => { if (!m.isMesh) return; const base = SHOP.mat0.get(m) || m.material, names = (Array.isArray(base) ? base : [base]).map(x => x && x.name); if (!names.some(n2 => n2 === 'top' || n2 === 'bottom')) return; if (!SHOP.mat0.has(m)) SHOP.mat0.set(m, base);
    const one = mt => { const c = o && mt && o[mt.name]; if (!c) return mt; const q = mt.clone(); q.color.set(c); return q; }; m.material = Array.isArray(base) ? base.map(one) : one(base); }); };
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { SHOP.dress(); } catch (e) { } return r; }; }
// ---------- a sparkler at night ----------
SHOP.sparkler = function () { const pts = new THREE.BufferGeometry(), N = 60, pos = new Float32Array(N * 3); pts.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.Points(pts, new THREE.PointsMaterial({ color: '#ffd27a', size: 0.06, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(m);
  const V = []; for (let i = 0; i < N; i++) V.push([0, 0, 0, 0]); SHOP.spark = { m, V, t: 0 }; UI.toast('🎆 パチパチ… きれい！'); try { SND.play('fw_crackle', { vol: 0.4 }); } catch (e) { } };
{ const _ur = GAME.update; GAME.update = function (dt) { const r = _ur.apply(this, arguments); const S = SHOP.spark; if (S) { S.t += dt || 0.016; const hx = PL.x + Math.sin(PL.rot) * 0.45, hz = PL.z + Math.cos(PL.rot) * 0.45, hy = PL.y + 1.0, p = S.m.geometry.attributes.position;
  S.V.forEach((v, i) => { if (v[3] <= 0) { v[0] = (Math.random() - 0.5) * 2.4; v[1] = Math.random() * 1.6; v[2] = (Math.random() - 0.5) * 2.4; v[3] = 0.2 + Math.random() * 0.3; p.setXYZ(i, hx, hy, hz); } else { v[3] -= dt; v[1] -= dt * 4; p.setXYZ(i, p.getX(i) + v[0] * dt, p.getY(i) + v[1] * dt, p.getZ(i) + v[2] * dt); } }); p.needsUpdate = true;
  if (S.t > 25 || GAME.inside) { scene.remove(S.m); SHOP.spark = null; } } return r; }; }
// ---------- vending machine ----------
SHOP.openVending = function (ids) { const g = GAME; g.modal = 'vend'; const cards = ids.map(id => { const P = GOODS.byId[id]; return `<button class="vbtn" data-v="${id}" ${g.p.money < P.price ? 'disabled' : ''}><img src="${GOODS.thumb(id)}" alt=""><b>${esc(P.name.replace(/ \d+ml/, ''))}</b><span>${P.price}円</span></button>`; }).join('');
  g.el.modal.innerHTML = `<div class="mbox vendbox"><div class="mh"><h2>🥤 自動販売機</h2><span class="isl">所持金 ${yen(g.p.money)}</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div class="vgrid">${cards}</div><p class="small">ボタンをおすと、ガコン！と出てきます。</p></div></div>`; g.el.modal.hidden = false;
  g.el.modal.querySelector('.vendbox').onclick = e => { if (e.target.closest('[data-x]')) return g.closeModal(); const v = e.target.closest('[data-v]'); if (!v || v.disabled) return; const P = GOODS.byId[v.dataset.v]; g.p.money -= P.price; SHOP.receive(P.id); try { SND.play('coins', { vol: 0.5 }); setTimeout(() => SND.play('vending', { vol: 0.8 }), 350); } catch (er) { } UI.toast(`🥤 ガコン！ ${P.name}を買った`); g.dirty = true; g.renderTracker && g.renderTracker(); SHOP.openVending(ids); };
};
// ---------- reading ----------
SHOP.read = function (id) { const g = GAME, P = GOODS.byId[id], pages = (SHOP.BOOK[P.use.read] || (() => ['（白紙）']))(); SHOP.page = 0;
  const show = () => { g.modal = 'read'; g.el.modal.innerHTML = `<div class="mbox journal readbox"><div class="mh"><h2>📖 ${esc(P.name)}</h2><span class="isl">${SHOP.page + 1} / ${pages.length}</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div class="page">${pages[SHOP.page]}</div><div class="nrow">${SHOP.page > 0 ? '<button data-pg="-1">◀ まえ</button>' : ''}${SHOP.page < pages.length - 1 ? '<button class="primary" data-pg="1">つぎ ▶</button>' : '<button data-x="close">とじる</button>'}</div></div></div>`; g.el.modal.hidden = false;
    g.el.modal.querySelector('.readbox').onclick = e => { if (e.target.closest('[data-x]')) return g.closeModal(); const b = e.target.closest('[data-pg]'); if (b) { SHOP.page = clamp(SHOP.page + +b.dataset.pg, 0, pages.length - 1); try { SND.play('page', { vol: 0.5 }); } catch (er) { } show(); } }; };
  try { SND.play('book_open', { vol: 0.5 }); } catch (e) { } show(); };
const ENV_JA = { sea: '海（沖・堤防）', harbor: '港', beach: '浜', river: '川', pond: '池', rock: '磯', boat: '船の上' };
SHOP.BOOK = {
  fishzukan: () => { const list = FISH.slice(); const per = 8, out = []; for (let i = 0; i < list.length; i += per) out.push(`<ul class="bk">${list.slice(i, i + per).map(F => `<li><b>${esc(F.name)}</b>　${F.sz ? `${F.sz[0]}〜${F.sz[1]}cm` : ''}<br><small>釣れる場所：${(F.env || []).map(e => ENV_JA[e] || e).join('・')}　${'★'.repeat(F.st || 1)}</small><br><small>${esc(F.note || '')}</small></li>`).join('')}</ul>`); return out; },
  bugzukan: () => { const L = typeof BUGS !== 'undefined' ? BUGS : []; const out = []; for (let i = 0; i < L.length; i += 8) out.push(`<ul class="bk">${L.slice(i, i + 8).map(B => `<li><b>${esc(B.name)}</b><br><small>${esc(B.note || '')}</small></li>`).join('')}</ul>`); return out.length ? out : ['<p>虫の図鑑。季節と時間を変えて、林や花畑をさがしてみよう。</p>']; },
  cook: () => { const L = RECIPES.slice(), out = []; for (let i = 0; i < L.length; i += 7) out.push(`<ul class="bk">${L.slice(i, i + 7).map(R => `<li><b>${R.ic} ${esc(R.name)}</b>　<small>${yen(R.p)}</small><br><small>材料：${R.need.map(sp => COOK.label(sp) + (sp.n > 1 ? '×' + sp.n : '')).join('、')}</small></li>`).join('')}</ul>`); return out; },
  guide: () => [`<h3>${esc((GAME.p && GAME.p.island) || '星波')}島へようこそ</h3><p>瀬戸内にうかぶ、小さな島。港町・だんだん畑のみかん・灯台・夕日の浜…。この本では、島の楽しみ方を紹介します。</p><p class="small">（I でもちもの、J で手帳、M で地図、B でしまづくり）</p>`,
    '<h3>お店</h3><p><b>商店</b>：食べもの・日用品・釣り具・家具カタログ。<br><b>道の駅</b>：島の野菜・みかん・魚・おみやげ。ソフトクリームが名物。出荷もここで。<br><b>漁協の出荷所</b>：魚の出荷と、エサや仕掛け。</p><p>棚の前で Space を押すと商品を見られます。かごに入れて、レジで会計。</p>',
    '<h3>料理</h3><p>家のキッチンやちゃぶ台で料理ができます。道の駅や商店で買った野菜・魚・調味料も材料になります。しょうゆ・みそ・塩・お米は、持っていれば何回でも使えます。</p>',
    '<h3>釣りのコツ</h3><p>朝と夕方は魚がよく食べます。オキアミやサビキ仕掛けを使うと、しばらく食いつきがよくなります。大物は船で沖へ。</p>',
    '<h3>店の中の見かた</h3><p>建物の中では <b>V</b> で「全体」「ちかく」「目線」を切りかえ。<b>Q・E</b>（目線では A・D）で向きを変えられます。</p>'],
  tsuri: () => ['<h3>今月の特集：堤防のアジ</h3><p>サビキ仕掛けにオキアミをつめて、足もとに落とすだけ。群れが来たら、いっぺんに何匹も！</p>', '<h3>大物はどこに？</h3><p>マダイ・ハマチ・サワラは沖。船を出して、島の外側をねらおう。夜はタチウオが光る。</p>', '<h3>読者の釣果</h3><p>「港で 42cm のチヌ！」（星波島・Gさん）<br>「浜でキスが10匹」（星波島・Sさん）</p>'],
  weekly: () => { const p = GAME.p || {}; return [`<h3>週刊しまなみ</h3><p>${esc(p.island || '星波')}島のいま。</p><ul class="bk"><li>島民：${typeof CITY !== 'undefined' && CITY.population ? CITY.population() : '—'}人</li><li>島の元気度：Lv${GAME.level()}</li><li>釣った魚：${Object.keys(p.fish || {}).length}種類</li><li>買いもの：${(p.stats && p.stats.shopN) || 0}点</li></ul>`, '<h3>島のうわさ</h3><p>「最近、道の駅のみかんソフトが人気らしい」<br>「灯台の光が、また明るくなったって」</p>']; },
  paper: () => { const hf = currentHour(); return [`<h3>しまなみ新聞 ${new Date().getMonth() + 1}月${new Date().getDate()}日</h3><p><b>天気</b>：${{ clear: '晴れ', cloudy: 'くもり', rain: '雨', storm: '嵐', snow: '雪' }[TIME.weather] || '晴れ'}<br><b>いま</b>：${Math.floor(hf)}時${String(Math.floor((hf % 1) * 60)).padStart(2, '0')}分</p><p>潮の満ち引きは、画面左上の時計の下を見よう。大潮の日は、浜で貝がらが多い。</p>`]; },
  ehon: () => ['<p class="ehon">むかしむかし、ほしが ひとつ、うみに おちました。</p>', '<p class="ehon">なみは ほしを だっこして、しまの はまに とどけました。</p>', '<p class="ehon">しまの こどもたちは ほしを ひろって、とうだいの てっぺんに のせました。</p>', '<p class="ehon">それから まいばん、ほしは うみを てらしています。<br>だから この しまは「ほしなみじま」。</p><p class="small">さく・え ミオ</p>'],
  manga: () => ['<p>【第1話】島っ子ヒーロー参上！<br>「この島の平和は、オレが守る！」…と言った次の瞬間、カニにはさまれる主人公。</p>', '<p>【第2話】ヒーローは虫とりもできる<br>カブトムシを追って林へ。帰り道がわからなくなる。</p>', '<p>【第3話】さいごはみんなで夕日を見た<br>「ヒーローって、ひとりじゃないんだな」<br><small>（つづく）</small></p>'],
  novel: () => ['<p>灯台守の祖父は、毎晩、海に向かって「おかえり」と言った。返事はいつも、波の音だった。</p>', '<p>嵐の夜、灯りが消えた。祖父は暗い階段をのぼりながら言った。「光は、待っている人のためにあるんだ」</p>', '<p>朝、港に一そうの船がもどってきた。私はそのとき、祖父の「おかえり」の意味を知った。</p><p class="small">——了</p>'],
};
// ---------- cooking with what you bought ----------
SHOP.COOK_NAME = { salt: '塩', dashi: 'かつおぶし', ponzu: 'ポン酢', mayo: 'マヨネーズ', mirin: 'みりん', shoyu: 'しょうゆ', miso: 'みそ', sugar: '砂糖', rice: 'お米', nori: 'のり', somen: 'そうめん' };
// a seasoning of a kind (any salt: 瀬戸内の塩 or 藻塩) — it is not used up
SHOP.hasCook = c => Object.entries(SHOP.bag().goods).some(([id, n]) => n > 0 && GOODS.byId[id] && (GOODS.byId[id].use || {}).cook === c);
{ const _hv = COOK.have; COOK.have = function (sp) { if (sp.k === 'cookHave') return SHOP.hasCook(sp.c) ? 99 : 0; if (sp.k === 'goods') return (SHOP.bag().goods[sp.id] || 0); if (sp.k === 'goodsHave') return SHOP.bag().goods[sp.id] > 0 ? 99 : 0; return _hv.apply(this, arguments); };
  const _lb = COOK.label; COOK.label = function (sp) { if (sp.k === 'cookHave') return `${SHOP.COOK_NAME[sp.c] || sp.c}（なくならない）`; if (sp.k === 'goods' || sp.k === 'goodsHave') { const P = GOODS.byId[sp.id]; return (P ? FIX.short(P.name) : sp.id) + (sp.k === 'goodsHave' ? '（なくならない）' : ''); } return _lb.apply(this, arguments); };
  const _tk = COOK.take; COOK.take = function (sp) { if (sp.k === 'goodsHave' || sp.k === 'cookHave') return; if (sp.k === 'goods') { const b = SHOP.bag(); b.goods[sp.id] -= sp.n; if (b.goods[sp.id] <= 0) delete b.goods[sp.id]; return; } return _tk.apply(this, arguments); }; }
RECIPES.push(
  { id: 'tkg', name: '卵かけごはん', ic: '🍚', need: [{ k: 'goods', id: 'eggs', n: 1 }, { k: 'goodsHave', id: 'rice5', n: 1 }, { k: 'goodsHave', id: 'shoyu', n: 1 }], p: 400, note: '島の米と、黄身のこいたまご。しょうゆをひとたらし。' },
  { id: 'okonomi', name: 'お好み焼き', ic: '🥞', need: [{ k: 'goods', id: 'cabbage', n: 1 }, { k: 'goods', id: 'eggs', n: 1 }], p: 900, note: 'キャベツたっぷり。ソースとかつおぶし。' },
  { id: 'yasaiitame', name: '野菜いため', ic: '🥬', need: [{ k: 'goods', id: 'cabbage', n: 1 }, { k: 'goods', id: 'ninjin', n: 1 }], p: 700, note: 'シャキシャキに強火で。' },
  { id: 'kabochani', name: 'かぼちゃの煮物', ic: '🎃', need: [{ k: 'goods', id: 'kabocha', n: 1 }, { k: 'goodsHave', id: 'shoyu', n: 1 }], p: 800, note: 'ほっくり甘からく。' },
  { id: 'misoshiru', name: '豆腐とねぎのみそ汁', ic: '🥣', need: [{ k: 'goods', id: 'tofu', n: 1 }, { k: 'veg', id: 'negi', n: 1 }, { k: 'goodsHave', id: 'miso', n: 1 }], p: 500, note: '毎朝のみそ汁。' },
  { id: 'hakusainabe', name: '白菜と魚の鍋', ic: '🍲', need: [{ k: 'goods', id: 'hakusai', n: 1 }, { k: 'goods', id: 'tofu', n: 1 }, { k: 'fish', n: 1 }], p: 1800, note: 'ポン酢でつつく、冬のごちそう。' },
  { id: 'hiyasomen', name: '冷やしそうめん', ic: '🍜', need: [{ k: 'goods', id: 'somen', n: 1 }, { k: 'veg', id: 'kyuri', n: 1 }], p: 700, note: '氷をうかべて、つるつる。' },
  { id: 'teonigiri', name: '手づくりおにぎり', ic: '🍙', need: [{ k: 'goods', id: 'nori', n: 1 }, { k: 'goodsHave', id: 'rice5', n: 1 }, { k: 'cookHave', c: 'salt', n: 1 }], p: 450, note: '瀬戸内の塩で、きゅっとにぎる。' },
  { id: 'lemonsquash', name: 'レモネード', ic: '🍋', need: [{ k: 'goods', id: 'lemon', n: 1 }, { k: 'goodsHave', id: 'sugar', n: 1 }], p: 500, note: '島のレモンをしぼって。' },
  { id: 'dashimaki', name: 'だし巻き卵', ic: '🍳', need: [{ k: 'goods', id: 'eggs', n: 1 }, { k: 'cookHave', c: 'dashi', n: 1 }, { k: 'cookHave', c: 'mirin', n: 1 }], p: 750, note: 'かつおのだしとみりんで、ふんわり甘く。' },
  { id: 'teriyaki', name: '魚の照り焼き', ic: '🐟', need: [{ k: 'fish', n: 1 }, { k: 'goodsHave', id: 'shoyu', n: 1 }, { k: 'cookHave', c: 'mirin', n: 1 }], p: 1100, note: 'しょうゆとみりんのたれを、こがさないように。' },
  { id: 'potesara', name: 'ポテトサラダ', ic: '🥗', need: [{ k: 'veg', id: 'jagaimo', n: 1 }, { k: 'veg', id: 'kyuri', n: 1 }, { k: 'cookHave', c: 'mayo', n: 1 }], p: 800, note: 'ほくほくのじゃがいもに、マヨネーズ。' },
  { id: 'yudofu', name: '湯豆腐', ic: '🍲', need: [{ k: 'goods', id: 'tofu', n: 1 }, { k: 'veg', id: 'negi', n: 1 }, { k: 'cookHave', c: 'ponzu', n: 1 }], p: 650, note: 'ゆずポン酢でさっぱり。冬の夜に。' },
  { id: 'okaka', name: 'おかかおにぎり', ic: '🍙', need: [{ k: 'goodsHave', id: 'rice5', n: 1 }, { k: 'cookHave', c: 'dashi', n: 1 }, { k: 'goodsHave', id: 'shoyu', n: 1 }], p: 450, note: 'かつおぶしにしょうゆをからめて。' });
// ---------- styles ----------
{ const st = document.createElement('style'); st.textContent = `
#shopHud,#buffHud{position:fixed;left:14px;top:118px;z-index:24;display:flex;flex-direction:column;gap:6px;font:700 14px "M PLUS Rounded 1c",sans-serif}#buffHud{top:auto;bottom:150px}
#shopHud button{border:0;background:#fff;border-radius:12px;padding:8px 14px;box-shadow:0 3px 12px rgba(0,0,0,.2);font:inherit;cursor:pointer;color:#2a3a2a}#shopHud button b{color:#c8322a}
#shopHud .bf,#buffHud .bf{background:rgba(255,255,255,.92);border-radius:10px;padding:4px 10px;box-shadow:0 2px 8px rgba(0,0,0,.15);width:max-content}
#game .shelfbox{max-width:860px;width:min(94vw,860px)}#game .shelfbox .mb{max-height:min(66vh,620px);overflow:auto}#game .shelfbox .mf{padding:10px 18px;border-top:1px solid #e8e0d0;display:flex;gap:10px;align-items:center;flex-wrap:wrap}#game .shelfbox .mf button{border:0;background:#eef0e8;border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit}
#game .gcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}#game .gcard{display:grid;grid-template-columns:84px 1fr;gap:6px 10px;background:#fbf8f2;border-radius:14px;padding:10px;border:1px solid #ece4d4}#game .gcard.out{opacity:.55}
#game .gcard img{width:84px;height:84px;border-radius:10px;background:radial-gradient(#ffffff,#ece6da)}#game .gcard .gi2{display:flex;flex-direction:column;gap:2px;min-width:0}#game .gcard .gi2 b{font-size:14px}#game .gcard .pr{color:#c8322a;font-weight:900}#game .gcard .nt{font-size:11.5px;color:#6a5d4e}#game .gcard .us{font-size:11.5px;color:#2f7a4a;font-weight:700}
#game .gcard .gq{grid-column:1/3;display:flex;align-items:center;gap:6px}#game .gcard .gq button{border:0;background:#eee6d6;border-radius:8px;padding:5px 10px;cursor:pointer;font-weight:800;white-space:nowrap;flex:none}#game .gcard .gq button.primary{background:#2f7a4a;color:#fff;margin-left:auto}#game .gcard .gq small{color:#8a7d6e;white-space:nowrap}#game .gcard .soldout{color:#c8322a;font-weight:900}
#game .blist img,#game .goodslist img.gth{width:44px;height:44px;border-radius:8px;background:#f2ece0}#game .goodslist .gbtn{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}
#game .regbox{max-width:520px}#game table.rcp{width:100%;border-collapse:collapse;font-size:14px}#game table.rcp td,#game table.rcp th{padding:4px 6px;border-bottom:1px dashed #d8d0c0;text-align:left}#game table.rcp td:nth-child(2),#game table.rcp td:nth-child(3){text-align:right;white-space:nowrap}#game table.rcp tr.tot td{font-weight:900;border-bottom:2px solid #3a3a3a}#game .regbox .warn{color:#c8322a;font-weight:800}
#game .receipt{max-width:340px;background:#fffffb;font-family:"M PLUS Rounded 1c",monospace;box-shadow:0 8px 30px rgba(0,0,0,.3)}#game .receipt h3{text-align:center;margin:4px 0}#game .receipt p{text-align:center;margin:2px 0}
#game .vendbox{max-width:620px}#game .vgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}#game .vbtn{border:0;background:#f2f6fa;border-radius:12px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;font:inherit}#game .vbtn img{width:64px;height:64px}#game .vbtn span{color:#c8322a;font-weight:900}#game .vbtn:disabled{opacity:.4}
#game .readbox .page{min-height:220px;font-size:15px;line-height:1.7}#game .readbox ul.bk{list-style:none;padding:0;margin:0}#game .readbox ul.bk li{padding:5px 0;border-bottom:1px dotted #d8d0c0}#game .readbox .ehon{font-size:20px;text-align:center;padding:30px 10px}
`; document.head.appendChild(st); }

// things bought in a shop are for eating and cooking, not for selling back (no buying low and shipping high)
SHOP.normB = function () { const b = GAME.bag(); b.mikanB = Math.max(0, Math.min(b.mikanB || 0, b.mikan || 0)); if (typeof GARDEN !== 'undefined') { const gb = GARDEN.bag(); gb.vegB = gb.vegB || {}; for (const k of Object.keys(gb.vegB)) gb.vegB[k] = Math.max(0, Math.min(gb.vegB[k], gb.veg[k] || 0)); } };
SHOP.sellMikan = () => { SHOP.normB(); const b = GAME.bag(); return Math.max(0, (b.mikan || 0) - (b.mikanB || 0)); };
SHOP.sellVeg = id => { SHOP.normB(); const gb = GARDEN.bag(); return Math.max(0, (gb.veg[id] || 0) - ((gb.vegB || {})[id] || 0)); };
{ const _tk = COOK.take; COOK.take = function (sp) { const b = GAME.bag(), gb = typeof GARDEN !== 'undefined' ? GARDEN.bag() : null, m0 = b.mikan || 0, v0 = gb ? Object.assign({}, gb.veg) : {}; const r = _tk.apply(this, arguments);
  const dm = m0 - (b.mikan || 0); if (dm > 0) b.mikanB = Math.max(0, (b.mikanB || 0) - dm); if (gb && gb.vegB) for (const k of Object.keys(v0)) { const dv = (v0[k] || 0) - (gb.veg[k] || 0); if (dv > 0 && gb.vegB[k]) gb.vegB[k] = Math.max(0, gb.vegB[k] - dv); } return r; }; }
