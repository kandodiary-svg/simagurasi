// ===================== 島の開発: 島モータース・ガレージ・大規模工事・バス・観光船・埋め立て・観光収入 =====================
const CAR_SHOP = [
  { id: 'van', price: 18000, lv: 2, note: '荷物がたくさん積める箱型の車。軽トラより少し速い' },
  { id: 'kcar', price: 35000, lv: 3, note: 'かわいい小さな車。道路ではキビキビ走る' },
  { id: 'wagon', price: 60000, lv: 4, note: '大きくて安定したワゴン車。家族で島めぐり' },
  { id: 'suv', price: 120000, lv: 5, note: '道路の外（草地や砂浜）でも速く走れるオフロード車' },
  { id: 'convert', price: 250000, lv: 6, note: '屋根のないオープンカー。島でいちばん速い' },
];
const BOAT_SHOP = [{ id: 'motorboat', price: 40000, lv: 3, note: '漁船よりずっと速い小型ボート。はなれ小島へもすぐ' }];
const TUNES = [null, null, { price: 6000, lv: 2, k: 1.15, name: 'エンジン整備' }, { price: 18000, lv: 4, k: 1.3, name: 'エンジン強化' }];
const PAINTS = [['white', '白', '#f6f6f2'], ['silver', 'シルバー', '#c8ccd2'], ['sky', '水色', '#8cc8ea'], ['mint', 'ミント', '#9ad8b8'], ['cream', 'クリーム', '#f2e2b0'], ['red', '赤', '#d8383a'], ['navy', '紺', '#2f4a7a']];
CARSPEC.bus = { name: '島めぐりバス', cam: 14, eye: [-0.6, 2.3, 2.8] };
CARSPEC.ferry = { name: '観光船', cam: 22, eye: [0, 4.6, -1.5] };
// development projects (大規模な工事). place: 'auto' | 'player' | 'none'
const DEV = [
  { id: 'waiting', name: '港の待合所', lv: 1, price: 8000, tour: 1, place: 'auto', icon: '🏠', note: '港に、船やバスを待つための小さな待合所を建てます' },
  { id: 'pier', name: '観光桟橋', lv: 2, price: 20000, tour: 0, place: 'auto', icon: '⚓', note: '港の近くに、観光船がとまれる桟橋を作ります（観光船に必要）' },
  { id: 'bus', name: '島めぐりバス', lv: 2, price: 30000, tour: 2, place: 'none', icon: '🚌', note: '海ぞいの県道を走るバスを運行します。バス停で Space で乗れます' },
  { id: 'ferry', name: '観光船の運航', lv: 3, price: 60000, tour: 4, place: 'none', need: 'pier', icon: '🛳️', note: '島のまわりを一周する観光船。桟橋から乗れます' },
  { id: 'reclaim1', name: '港の東の埋め立て', lv: 3, price: 50000, tour: 0, place: 'none', icon: '🏗️', note: '海を埋め立てて、新しい土地を作ります（島が広くなります）' },
  { id: 'beach', name: '海水浴場', lv: 4, price: 40000, tour: 2, place: 'auto', icon: '🏖️', note: '夕日の浜に、パラソル・監視台・海の家をそろえます' },
  { id: 'michinoeki', name: '道の駅', lv: 4, price: 80000, tour: 3, place: 'player', w: 15, d: 10, icon: '🏪', note: '島の名物を売る道の駅。みかんの出荷値段が1こ+20円になります' },
  { id: 'fireworks', name: '花火大会', lv: 4, price: 30000, tour: 0, place: 'none', repeat: 7, icon: '🎆', note: 'その日の夜（19時〜）、港の上に花火が上がります（7日に1回）' },
  { id: 'camp', name: 'キャンプ場', lv: 5, price: 60000, tour: 2, place: 'player', w: 14, d: 12, icon: '⛺', note: 'テントとたき火のあるキャンプ場を作ります' },
  { id: 'ryokan', name: '旅館', lv: 5, price: 150000, tour: 5, place: 'player', w: 17, d: 11, icon: '🏯', note: '島に泊まりに来る人のための、2階建ての旅館です' },
  { id: 'reclaim2', name: '東の海の埋め立て', lv: 5, price: 120000, tour: 0, place: 'none', icon: '🏗️', note: 'さらに大きく海を埋め立てます' },
  { id: 'aquarium', name: '島の水族館', lv: 6, price: 250000, tour: 6, place: 'player', w: 19, d: 13, icon: '🐠', note: '瀬戸内の魚を見られる水族館。図鑑にのせた魚がふえるほど人気に' },
  { id: 'windfarm', name: '岬の風力発電', lv: 6, price: 200000, tour: 1, place: 'auto', icon: '🌬️', note: '岬に大きな風車を3基。毎日3,000円の電気代収入' },
  { id: 'causeway', name: 'はなれ小島への海の道', lv: 7, price: 300000, tour: 3, place: 'none', icon: '🌉', note: '海を埋め立てて、はなれ小島まで車で行ける道を作ります' },
];
LV_UNLOCK[2].push('島モータース：軽バン', '開発：観光桟橋・島めぐりバス・エンジン整備');
LV_UNLOCK[3].push('島モータース：軽自動車・モーターボート', '開発：観光船・港の東の埋め立て');
LV_UNLOCK[4].push('島モータース：ワゴン車・エンジン強化', '開発：海水浴場・道の駅・花火大会');
LV_UNLOCK[5].push('島モータース：オフロード車', '開発：キャンプ場・旅館・西の海の埋め立て');
LV_UNLOCK[6].push('島モータース：オープンカー', '開発：水族館・風力発電');
LV_UNLOCK[7].push('開発：はなれ小島への海の道');
GOALS.push(
  { id: 'car2', text: '島モータースで車を買う', n: 1, prog: () => Object.keys((GAME.p.garage || {}).cars || {}).length > 1 ? 1 : 0, pts: 20 },
  { id: 'dev3', text: '島の開発を3つ完成させる', n: 3, prog: () => Object.values(GAME.p.dev || {}).filter(d => d.state === 'done' && d.id !== 'fireworks').length, pts: 40 },
  { id: 'tour10', text: '観光ポイントを10にする', n: 10, prog: () => GAME.tourism(), pts: 50 });
STAT_KEYS.push('busN', 'ferryN');
DAILY_POOL.push(
  { id: 'rideBus', who: 'v_sora', text: '島めぐりバスに乗る', n: 1, stat: 'busN', need: p => p.dev && p.dev.bus && p.dev.bus.state === 'done', ask: 'バス、乗ってみた？ 窓から見る海がいいんだよ！' },
  { id: 'rideFerry', who: 'v_mio', text: '観光船で島を一周する', n: 1, stat: 'ferryN', need: p => p.dev && p.dev.ferry && p.dev.ferry.state === 'done', ask: '観光船から見る島、きっときれいだよ。一周してきて！' });
const DV = { group: null, track: [], bus: null, ferry: null, fw: [], fwT: 0, turbines: [], decks: [] };
const WALKDECKS = DV.decks;

Object.assign(GAME, {
  // =============== garage ===============
  garage() { const p = this.p; p.garage = p.garage || { cars: { truck: 1 }, boats: { boat: 1 }, active: 'truck', boat: 'boat', tune: 1, paint: {} }; p.garage.paint = p.garage.paint || {}; return p.garage; },
  applyTruck() { // (name kept for older calls) apply active car/boat, tune and paint
    if (!this.p) return; const gr = this.garage(), car = VEH.find(v => v.kind === 'truck'), boat = VEH.find(v => v.kind === 'boat');
    if (car) { setVehicleModel(car, gr.active); Object.assign(VSPEC.truck, CARSPEC[gr.active]); const T = TUNES[gr.tune]; if (T) VSPEC.truck.max = CARSPEC[gr.active].max * T.k; this.paintCar(car, gr.paint[gr.active]); }
    if (boat) { setVehicleModel(boat, gr.boat); Object.assign(VSPEC.boat, CARSPEC[gr.boat]); }
  },
  paintCar(v, key) {
    const col = (PAINTS.find(p => p[0] === key) || [0, 0, null])[2]; if (!v.mesh.userData.orig) { v.mesh.userData.orig = {}; }
    v.mesh.traverse(o => { if (!o.isMesh || o.material.name !== 'body') return; if (!o.userData.own) { o.material = o.material.clone(); o.userData.own = true; o.userData.c0 = o.material.color.clone(); } if (col) o.material.color.set(col); else o.material.color.copy(o.userData.c0); });
  },
  carHome(kind) { const v = VEH.find(q => q.kind === kind); if (!v || PL.veh === v) return; v.x = v.home.x; v.z = v.home.z; v.rot = v.home.rot; v.v = 0; placeVehicle(v, 0); this.dirty = true; },
  // =============== places: 島モータース & garage sign ===============
  initDevPlaces() {
    const near = VILLAGE; let best = null;
    for (let r = 10; r < 120 && !best; r += 2) for (let a = 0; a < 6.28; a += 0.15) {
      const x = near.x + Math.cos(a) * r, z = near.z + Math.sin(a) * r; if (!landOK(x, z, 7)) continue;
      const nr = nearestOnRoads(x, z, 16, false); if (!nr || nr.road !== ROADS[0]) continue; const rot = Math.atan2(nr.x - x, nr.z - z), o = { x, z, rot }; let mn = 1e9, mx = -1e9, ok = true;
      for (const [a2, b2] of [[-5, -3.5], [5, -3.5], [-5, 3.5], [5, 3.5], [0, 0], [0, 5]]) { const [px, pz] = toWorld(o, a2, b2); if (!landOK(px, pz, 4.5)) ok = false; const h = groundH(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h); if (collidersNear(px, pz).some(c => !c.off && hitsCollider(c, px, pz, 1.5))) ok = false; }
      if (ok && mx - mn < 1.2) { best = { x, z, rot, y: mx }; break; }
    }
    if (best) { const g = makeMotors(); g.position.set(best.x, best.y - 0.12, best.z); g.rotation.y = best.rot; scene.add(g);
      const C = (lx, lz, hw, hd) => { const [x, z] = toWorld(best, lx, lz); addCollider({ x, z, hw, hd, rot: best.rot, kind: 'bld' }); }; C(0, -0.5, 5.1, 3.1);
      const [ex, ez] = toWorld(best, 0, 3.6); DV.motors = { x: ex, z: ez, at: best }; this.LM.motors = { x: ex, z: ez, r: 0 }; DV.motorsSign = g.userData.sign; }
    const H = PLACED.home; if (H) { const P = H.pad, [sx, sz] = toWorld(H.hs, P.lx + (P.lx > 0 ? 2.15 : -2.15), P.lz - 2.2); const g = new THREE.Group(); g.add(box(0.1, 1.3, 0.1, MAT.darkwood, 0, 0.65, 0)); const s = dynSign(0.9, 0.45, '🚗 ガレージ', '#ffffff', '#1f4f8a', 'M PLUS Rounded 1c'); s.userData.keep = false; s.position.set(0, 1.25, 0.06); g.add(s); g.position.set(sx, groundH(sx, sz), sz); g.rotation.y = H.hs.rot; scene.add(g); addCollider({ x: sx, z: sz, r: 0.12, kind: 'pole' }); DV.garageSign = { x: sx, z: sz }; }
  },
  nearMotors() { return DV.motors && !PL.veh && Math.hypot(PL.x - DV.motors.x, PL.z - DV.motors.z) < 2.8; },
  nearGarage() { return DV.garageSign && !PL.veh && Math.hypot(PL.x - DV.garageSign.x, PL.z - DV.garageSign.z) < 1.8; },
  // =============== 島モータース ===============
  openMotors(tab) {
    const p = this.p, gr = this.garage(), lv = this.level(); this.modal = 'motors'; this.mTab = tab || this.mTab || 'car';
    const row = (it, owned, kind) => { const S = CARSPEC[it.id], lk = it.lv > lv; return `<li class="${lk ? 'lk' : ''}"><div class="th">${kind === 'car' ? '🚗' : '🚤'}</div><div class="in"><b>${S.name}</b><span class="own">最高速度 ${Math.round(S.max * 3.6)}km/h　${esc(it.note)}</span></div><button class="buy" data-buy="${kind}:${it.id}" ${owned || lk || p.money < it.price ? 'disabled' : ''}>${owned ? '持っている' : lk ? `🔒Lv${it.lv}` : yen(it.price)}</button></li>`; };
    let body = '';
    if (this.mTab === 'car') body = `<ul class="glist wide">${CAR_SHOP.map(it => row(it, gr.cars[it.id], 'car')).join('')}</ul>`;
    if (this.mTab === 'boat') body = `<ul class="glist wide">${BOAT_SHOP.map(it => row(it, gr.boats[it.id], 'boat')).join('')}</ul>`;
    if (this.mTab === 'tune') body = `<ul class="glist wide">${[2, 3].map(l => { const T = TUNES[l], own = gr.tune >= l, can = gr.tune === l - 1 && T.lv <= lv; return `<li class="${T.lv > lv ? 'lk' : ''}"><div class="th">🔧</div><div class="in"><b>${T.name}</b><span class="own">すべての車の最高速度が${Math.round((T.k - 1) * 100)}%アップ</span></div><button class="buy" data-tune="${l}" ${own || !can || p.money < T.price ? 'disabled' : ''}>${own ? '済み' : T.lv > lv ? `🔒Lv${T.lv}` : yen(T.price)}</button></li>`; }).join('')}</ul>
      <h3 class="bh">${CARSPEC[gr.active].name}の色をぬりかえる（2,000円）</h3><div class="paints">${PAINTS.map(([k, n, c]) => `<button class="pt ${gr.paint[gr.active] === k || (!gr.paint[gr.active] && k === 'white' && gr.active === 'truck') ? 'on' : ''}" data-paint="${k}" ${p.money < 2000 ? 'disabled' : ''}><i style="background:${c}"></i>${n}</button>`).join('')}</div>`;
    this.el.modal.innerHTML = `<div class="mbox shopbox"><div class="mh"><h2>島モータース</h2><span class="isl">所持金 ${yen(p.money)}　・　買った車は家の駐車場にとどきます</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
      <div class="tabs"><button data-mt="car" class="${this.mTab === 'car' ? 'on' : ''}">車</button><button data-mt="boat" class="${this.mTab === 'boat' ? 'on' : ''}">船</button><button data-mt="tune" class="${this.mTab === 'tune' ? 'on' : ''}">整備・色</button></div><div class="mb">${body}</div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.shopbox').onclick = e => {
      const t = e.target.closest('[data-mt]'); if (t) return this.openMotors(t.dataset.mt); if (e.target.closest('[data-x="close"]')) return this.closeModal();
      const b = e.target.closest('[data-buy]'); if (b && !b.disabled) { const [kind, id] = b.dataset.buy.split(':'), it = (kind === 'car' ? CAR_SHOP : BOAT_SHOP).find(q => q.id === id); p.money -= it.price;
        if (kind === 'car') { gr.cars[id] = 1; gr.active = id; this.applyTruck(); this.carHome('truck'); UI.toast(`🚗 ${CARSPEC[id].name}を買った！ 家の駐車場にとどきました`); }
        else { gr.boats[id] = 1; gr.boat = id; this.applyTruck(); this.carHome('boat'); UI.toast(`🚤 ${CARSPEC[id].name}を買った！ 港にとどきました`); }
        this.dirty = true; this.check(); this.renderTracker(); this.save(); return this.openMotors(); }
      const tn = e.target.closest('[data-tune]'); if (tn && !tn.disabled) { const l = +tn.dataset.tune; p.money -= TUNES[l].price; gr.tune = l; this.applyTruck(); UI.toast(`🔧 ${TUNES[l].name}をした！`); this.dirty = true; this.renderTracker(); return this.openMotors(); }
      const pt = e.target.closest('[data-paint]'); if (pt && !pt.disabled) { p.money -= 2000; gr.paint[gr.active] = pt.dataset.paint; this.applyTruck(); UI.toast('🎨 色をぬりかえた！'); this.dirty = true; this.renderTracker(); return this.openMotors(); }
    };
  },
  openGarage() {
    const gr = this.garage(); this.modal = 'garage';
    const cars = Object.keys(gr.cars).map(id => `<li><div class="th">🚗</div><div class="in"><b>${CARSPEC[id].name}</b><span class="own">${gr.active === id ? '駐車場に置いている' : 'ガレージにしまっている'}</span></div><button class="buy" data-use="car:${id}" ${gr.active === id ? 'disabled' : ''}>${gr.active === id ? '使用中' : '駐車場に出す'}</button></li>`).join('');
    const boats = Object.keys(gr.boats).map(id => `<li><div class="th">🚤</div><div class="in"><b>${CARSPEC[id].name}</b><span class="own">${gr.boat === id ? '港に置いている' : 'しまっている'}</span></div><button class="buy" data-use="boat:${id}" ${gr.boat === id ? 'disabled' : ''}>${gr.boat === id ? '使用中' : '港に出す'}</button></li>`).join('');
    this.el.modal.innerHTML = `<div class="mbox shopbox"><div class="mh"><h2>ガレージ</h2><span class="isl">乗る車をえらべます</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb">
      <h3 class="bh">車</h3><ul class="glist wide">${cars}</ul><h3 class="bh">船</h3><ul class="glist wide">${boats}</ul></div>
      <div class="mf"><button data-x="home">🚗 車を家の駐車場にもどす</button><button data-x="harbor">🚤 船を港にもどす</button><span class="sp"></span><button class="primary" data-x="close">とじる</button></div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.shopbox').onclick = e => { const x = e.target.closest('[data-x]'); if (x) { if (x.dataset.x === 'close') return this.closeModal(); if (x.dataset.x === 'home') { this.carHome('truck'); UI.toast('車を駐車場にもどしました'); } if (x.dataset.x === 'harbor') { this.carHome('boat'); UI.toast('船を港にもどしました'); } return; }
      const u = e.target.closest('[data-use]'); if (u && !u.disabled) { const [k, id] = u.dataset.use.split(':'); if (k === 'car') { gr.active = id; this.applyTruck(); this.carHome('truck'); } else { gr.boat = id; this.applyTruck(); this.carHome('boat'); } this.dirty = true; this.openGarage(); } };
  },
  // =============== development projects ===============
  devState() { const p = this.p; p.dev = p.dev || {}; return p.dev; },
  tourism() { const D = this.devState(); let t = 0; for (const d of DEV) if (D[d.id] && D[d.id].state === 'done') t += d.tour; const P = this.p.projects || {}; for (const k of ['market', 'deck', 'lightup', 'benchBeach', 'signs']) if (P[k] && P[k].done) t += 1; if (D.aquarium && D.aquarium.state === 'done') t += Math.floor(Object.keys(this.p.fish || {}).length / 6); return t; },
  dailyIncome() { const D = this.devState(); return this.tourism() * 1200 + (D.windfarm && D.windfarm.state === 'done' ? 3000 : 0); },
  devAvail(d) { const D = this.devState(), s = D[d.id]; if (d.repeat) return !s || addDays(s.date, d.repeat) <= todayKey(); return !s; },
  openDev() {
    if (!this.p) return; const p = this.p, D = this.devState(), lv = this.level(); this.modal = 'dev';
    const rows = DEV.map(d => { const s = D[d.id], lk = d.lv > lv, needOk = !d.need || (D[d.need] && D[d.need].state === 'done');
      const st = s ? (s.state === 'done' ? (d.repeat && this.devAvail(d) ? '' : (d.repeat ? `次は ${fmtDay(addDays(s.date, d.repeat))}` : '✓ 完成')) : s.state === 'site' ? '場所を決めてください' : `🚧 工事中（${fmtDay(addDays(s.date, 1))}完成）`) : '';
      const can = !lk && needOk && this.devAvail(d) && p.money >= d.price;
      const btn = s && s.state === 'site' ? `<button class="buy" data-dplace="${d.id}">場所を決める</button>` : (st && !(d.repeat && this.devAvail(d))) ? `<span class="done">${st}</span>` : `<button class="buy" data-dev="${d.id}" ${can ? '' : 'disabled'}>${lk ? `🔒Lv${d.lv}` : !needOk ? `${DEV.find(q => q.id === d.need).name}が必要` : yen(d.price)}</button>`;
      return `<li class="${lk ? 'lk' : ''}"><div class="th">${d.icon}</div><div class="in"><b>${esc(d.name)}</b><span class="own">${esc(d.note)}${d.tour ? `　観光＋${d.tour}` : ''}</span></div>${btn}</li>`; }).join('');
    this.el.modal.innerHTML = `<div class="mbox shopbox devbox"><div class="mh"><h2>${esc(p.island)}島の開発</h2><span class="isl">所持金 ${yen(p.money)}　・　観光ポイント ${this.tourism()}（毎日の島の収入 ${yen(this.dailyIncome())}）</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><ul class="glist wide">${rows}</ul><p class="small">工事は次の日（現実の日付）に完成します。観光ポイントが多いほど観光客がふえ、毎朝島の収入が入ります。</p></div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.devbox').onclick = e => { if (e.target.closest('[data-x="close"]')) return this.closeModal();
      const b = e.target.closest('[data-dev]'); if (b && !b.disabled) return this.buyDev(DEV.find(q => q.id === b.dataset.dev));
      const pl = e.target.closest('[data-dplace]'); if (pl) { this.closeModal(); this.startPlace(DEV.find(q => q.id === pl.dataset.dplace)); } };
  },
  buyDev(d) {
    const p = this.p, D = this.devState();
    if (d.place === 'player') { if (p.money < d.price) return; p.money -= d.price; D[d.id] = { id: d.id, state: 'site', date: todayKey() }; this.dirty = true; this.save(); this.closeModal(); this.startPlace(d); return; }
    let loc = null;
    try { loc = DEV_LOC[d.id] ? DEV_LOC[d.id]() : {}; } catch (e) { console.warn(e); }
    if (!loc) { UI.toast('ちょうどいい場所が見つかりませんでした'); return; }
    p.money -= d.price; D[d.id] = Object.assign({ id: d.id, state: d.id === 'fireworks' ? 'done' : 'build', date: todayKey() }, loc);
    this.dirty = true; this.closeModal(); this.refreshDev(); this.save(); this.renderTracker();
    UI.toast(d.id === 'fireworks' ? '🎆 今夜19時から、港の上で花火大会！' : `🏗️ 「${d.name}」の工事がはじまりました。明日完成します`);
  },
  completeDev() { const D = this.devState(), done = []; for (const d of DEV) { const s = D[d.id]; if (s && s.state === 'build' && s.date < todayKey()) { s.state = 'done'; done.push(d.id); this.addVit(15); } } if (done.length) this.p.justDev = done; return done; },
  // ----- player placement (道の駅・旅館・キャンプ場・水族館) -----
  startPlace(d) { if (PL.veh) { UI.toast('乗り物をおりてから場所を決めてね'); return; } this.placing = d; if (!EDIT.on) toggleEdit(true); setTool('build'); UI.toast(`「${d.name}」を建てる場所をクリックしてね（R で回す）`); },
  buildPlan(p) {
    const d = this.placing; if (!d || !p) return null; const nr = nearestOnRoads(p.x, p.z, 50, false); let rot = nr && nr.d > 1 ? Math.atan2(nr.x - p.x, nr.z - p.z) : 0; rot += EDIT.hRotOff || 0;
    const o = { x: p.x, z: p.z, rot }, W = d.w, Dp = d.d; let mn = 1e9, mx = -1e9, sum = 0, cnt = 0, err = null;
    for (let a = -W / 2 - 1; a <= W / 2 + 1.01 && !err; a += 1.5) for (let b = -Dp / 2 - 1; b <= Dp / 2 + 2.01 && !err; b += 1.5) {
      const [x, z] = toWorld(o, a, b), [i, j] = toIdx(x, z), k = j * WORLD.n + i, h = G.H[k];
      if (Math.abs(x) > 330 || Math.abs(z) > 330) err = '島の外です'; else if (!GAME.openK(k)) err = GAME.lockText(x, z); else if (G.prot[k]) err = 'ほかの建物に近すぎます'; else if (G.roadDist[k] < 4.3) err = '道路に近すぎます';
      else if (h < 0.8 || !isNaN(G.Wl[k])) err = '水辺や海の上には建てられません'; else if (collidersNear(x, z).some(q => !q.off && (q.kind === 'bld' || q.kind === 'pole') && hitsCollider(q, x, z, 0.4))) err = 'ほかの物に近すぎます';
      mn = Math.min(mn, h); mx = Math.max(mx, h); sum += h; cnt++; }
    if (!err && mx - mn > 4.5) err = '坂が急すぎます（「平らに」でならしてね）';
    return { ok: !err, err, x: p.x, z: p.z, rot, y: sum / cnt };
  },
  buildPreview(p) {
    const d = this.placing; if (!d) return; if (!DV.ghost || DV.ghostId !== d.id) { if (DV.ghost) scene.remove(DV.ghost); const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.4, depthWrite: false, fog: false }); const b = new THREE.Mesh(new THREE.BoxGeometry(d.w, 4, d.d), m); b.position.y = 2; g.add(b); const ar = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 12), new THREE.MeshBasicMaterial({ color: '#ffd84a', fog: false })); ar.rotation.x = Math.PI / 2; ar.position.set(0, 0.8, d.d / 2 + 2); g.add(ar); g.userData.m = m; DV.ghost = g; DV.ghostId = d.id; scene.add(g); }
    const pl = EDIT.buildPick || this.buildPlan(p); if (!pl) { DV.ghost.visible = false; return; } DV.ghost.visible = true; DV.ghost.position.set(pl.x, pl.y, pl.z); DV.ghost.rotation.y = pl.rot; DV.ghost.userData.m.color.set(pl.ok ? (EDIT.buildPick ? '#4fd0ff' : '#7cf0a0') : '#ff6f6f');
    this.setHint(EDIT.buildPick ? `ここに「${d.name}」を建てますか？` : pl.ok ? 'クリックで場所を決めます（R で向きを変える）' : '⚠ ' + pl.err); EDIT._dh2 = EDIT._dh;
  },
  buildPick(p) { const pl = this.buildPlan(p); if (!pl) return; if (!pl.ok) { UI.toast(pl.err); return; } EDIT.buildPick = pl; UI.editPanel(); },
  buildConfirm() {
    const pl = EDIT.buildPick, d = this.placing; if (!pl || !d) return; const D = this.devState(), s = D[d.id];
    flattenPad(pl.x, pl.z, d.w / 2 + 1.2, d.d / 2 + 1.6, pl.rot, pl.y, 5); const [i0, j0] = toIdx(pl.x - 24, pl.z - 24), [i1, j1] = toIdx(pl.x + 24, pl.z + 24); refreshRegion(i0, j0, i1, j1);
    if (VEG.removeAt(pl.x, pl.z, Math.max(d.w, d.d) / 2 + 3)) VEG.refresh(pl.x - 16, pl.z - 16, pl.x + 16, pl.z + 16);
    Object.assign(s, { state: 'build', date: todayKey(), x: pl.x, z: pl.z, rot: pl.rot, y: pl.y + 0.05 }); EDIT.undo = []; EDIT.buildPick = null; this.placing = null; scheduleSave();
    if (DV.ghost) DV.ghost.visible = false; toggleEdit(false); this.dirty = true; this.save(); this.refreshDev(); UI.toast(`🏗️ 「${d.name}」の工事がはじまりました。明日完成します`);
  },
  buildSub() { return EDIT.buildPick ? `<button class="act" data-a="bconfirm">ここに建てる</button><button data-a="bcancel">えらびなおす</button>` : `<span class="small">${esc((this.placing || {}).name || '')}を建てる場所をクリック（R で回す）</span>`; },
  // ----- world objects for development -----
  refreshDev() {
    if (!DV.group) { DV.group = new THREE.Group(); scene.add(DV.group); }
    while (DV.group.children.length) DV.group.remove(DV.group.children[0]);
    DV.track.forEach(c => c.off = true); DV.track = []; DV.decks.length = 0; DV.turbines = []; DV.bus = null; DV.ferry = null;
    if (!this.p) { for (const k of ['bus', 'ferry']) if (MODELS[k]) scene.remove(MODELS[k]); return; }
    const D = this.devState(); COLL.track = DV.track;
    for (const d of DEV) { const s = D[d.id]; if (!s || s.state === 'site') continue; try {
      if (s.state === 'build') { if (DEV_BUILD[d.id] && s.x !== undefined) DV.group.add(makeConstruction({ x: s.x, z: s.z }, true)); }
      else if (DEV_BUILD[d.id]) { const g = DEV_BUILD[d.id](s); if (g) DV.group.add(g); }
    } catch (e) { console.warn('dev', d.id, e); } }
    COLL.track = null;
    if (D.bus && D.bus.state === 'done') this.startBus(); else if (MODELS.bus) scene.remove(MODELS.bus);
    if (D.ferry && D.ferry.state === 'done' && D.pier && D.pier.state === 'done') this.startFerry(); else if (MODELS.ferry) scene.remove(MODELS.ferry);
  },
  // =============== bus ===============
  startBus() {
    const r = ROADS[0], F = roadFrames(r), pts = F.map(f => [f.x, f.y, f.z]); const m = MODELS.bus; if (!m) return; scene.add(m);
    const nearIdx = (x, z) => { let bi = 0, bd = 1e9; pts.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[2] - z); if (d < bd) { bd = d; bi = i; } }); return bi; };
    const H = this.LM.harbor, stops = [{ i: 3, name: '西の浜口' }, { i: nearIdx(H.x, H.z), name: '港前' }, { i: nearIdx(VILLAGE.x, VILLAGE.z), name: '住宅地' }, { i: pts.length - 4, name: '灯台口' }].sort((a, b) => a.i - b.i).filter((s, k, A) => k === 0 || s.i - A[k - 1].i > 8);
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
    DV.bus = { kind: 'bus', model: 'bus', mesh: m, pts, cum, stops, s: cum[stops[0].i], dir: 1, v: 0, wait: 5, at: stops[0].i, stop: stops[0], x: pts[0][0], z: pts[0][2], rot: 0, y: pts[0][1] };
    if (!DV.busSigns) { DV.busSigns = new THREE.Group(); scene.add(DV.busSigns); }
    while (DV.busSigns.children.length) DV.busSigns.remove(DV.busSigns.children[0]);
    for (const st of stops) { const f = F[st.i], sd = (f.nx * -f.x + f.nz * -f.z) > 0 ? 1 : -1, x = f.x + f.nx * (r.w / 2 + 1.2) * sd, z = f.z + f.nz * (r.w / 2 + 1.2) * sd; const g = new THREE.Group(); g.add(cylM(0.05, 0.05, 2.3, MAT.metal, 0, 1.15, 0, 6)); const sg = dynSign(0.8, 0.8, '🚌', '#ffffff', '#1f4fa8', 'M PLUS Rounded 1c'); sg.position.set(0, 2.2, 0.03); g.add(sg); const nm = dynSign(1.3, 0.3, st.name, '#1f4fa8', '#ffffff', 'M PLUS Rounded 1c'); nm.position.set(0, 1.6, 0.03); g.add(nm); g.position.set(x, groundH(x, z), z); g.rotation.y = Math.atan2(-f.nx * sd, -f.nz * sd); DV.busSigns.add(g); st.x = x; st.z = z; }
    this.placeBus(0);
  },
  placeBus(dt) {
    const B = DV.bus; if (!B) return; const { pts, cum } = B; let i = 1; while (i < cum.length - 1 && cum[i] < B.s) i++;
    const t = (B.s - cum[i - 1]) / Math.max(1e-3, cum[i] - cum[i - 1]), p0 = pts[i - 1], p1 = pts[i];
    B.x = p0[0] + (p1[0] - p0[0]) * t; B.z = p0[2] + (p1[2] - p0[2]) * t; B.y = p0[1] + (p1[1] - p0[1]) * t + 0.05;
    const tr = Math.atan2((p1[0] - p0[0]) * B.dir, (p1[2] - p0[2]) * B.dir); B.rot = dt ? angLerp(B.rot, tr, Math.min(1, dt * 3)) : tr;
    const lane = ROADS[0].w / 4; B.x += Math.cos(B.rot) * lane; B.z -= Math.sin(B.rot) * lane;
    B.mesh.position.set(B.x, B.y, B.z); B.mesh.rotation.set(0, B.rot, 0);
  },
  updateBus(dt) {
    const B = DV.bus; if (!B) return;
    if (B.wait > 0) { B.wait -= dt; B.v = 0; }
    else {
      const ahead = [PL.veh || PL].concat(VEH.filter(v => v.kind === 'truck')).some(o => o !== B && Math.hypot(o.x - (B.x + Math.sin(B.rot) * 5), o.z - (B.z + Math.cos(B.rot) * 5)) < 3.5);
      B.v = lerp(B.v, ahead ? 0 : 9, Math.min(1, dt * (ahead ? 4 : 0.8))); B.s += B.v * dt * B.dir;
      for (const st of B.stops) { const cs = B.cum[st.i]; if (B.at !== st.i && Math.abs(B.s - cs) < 0.6) { B.s = cs; B.wait = 9; B.at = st.i; B.stop = st; if (PL.veh === B) UI.toast(`🚌 「${st.name}」に着きました（Space でおりる）`); } }
      if (B.s >= B.cum[B.cum.length - 1] - 1) { B.s = B.cum[B.cum.length - 1] - 1; B.dir = -1; B.at = -1; } if (B.s <= 1) { B.s = 1; B.dir = 1; B.at = -1; }
    }
    this.placeBus(dt);
    if (PL.veh === B) { PL.x = B.x; PL.z = B.z; PL.rot = B.rot; }
  },
  // =============== ferry (観光船) ===============
  startFerry() {
    const P = this.devState().pier, m = MODELS.ferry; if (!m || !P) return; scene.add(m);
    const loop = []; for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a); let rc = 60; for (let r = 60; r < 330; r += 4) if (groundH(dx * r, dz * r) > -1.5) rc = r; loop.push([dx * Math.min(330, rc + 55), dz * Math.min(330, rc + 55)]); }
    for (let it = 0; it < 3; it++) for (let k = 0; k < loop.length; k++) { const a = loop[(k + 71) % 72], b = loop[(k + 1) % 72]; const r0 = Math.hypot(...loop[k]), r1 = Math.hypot((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); const rr = Math.max(r0, r1); const ang = Math.atan2(loop[k][1], loop[k][0]); loop[k] = [Math.cos(ang) * rr, Math.sin(ang) * rr]; }
    const dock = [P.dx, P.dz]; let j = 0, bd = 1e9; loop.forEach((q, k) => { const d = Math.hypot(q[0] - dock[0], q[1] - dock[1]); if (d < bd) { bd = d; j = k; } });
    const route = [dock, [P.ox, P.oz]]; for (let k = 0; k <= 72; k++) route.push(loop[(j + k) % 72]); route.push([P.ox, P.oz], dock);
    const cum = [0]; for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
    DV.ferry = { kind: 'ferry', model: 'ferry', mesh: m, route, cum, s: 0, v: 0, wait: 12, x: dock[0], z: dock[1], rot: P.frot, docked: true };
    this.placeFerry(0);
  },
  placeFerry(dt) {
    const Fy = DV.ferry; const { route, cum } = Fy; let i = 1; while (i < cum.length - 1 && cum[i] < Fy.s) i++;
    const t = (Fy.s - cum[i - 1]) / Math.max(1e-3, cum[i] - cum[i - 1]), p0 = route[i - 1], p1 = route[i];
    Fy.x = p0[0] + (p1[0] - p0[0]) * t; Fy.z = p0[1] + (p1[1] - p0[1]) * t; const tr = Fy.docked ? this.devState().pier.frot : Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
    Fy.rot = dt ? angLerp(Fy.rot, tr, Math.min(1, dt * 0.8)) : tr; const tt = performance.now() / 1000;
    Fy.mesh.position.set(Fy.x, Math.sin(tt * 0.9) * 0.08 - 0.25, Fy.z); Fy.mesh.rotation.set(Math.sin(tt * 0.7) * 0.012, Fy.rot, Math.sin(tt * 0.8) * 0.015);
  },
  updateFerry(dt) {
    const Fy = DV.ferry; if (!Fy) return;
    if (Fy.wait > 0) { Fy.wait -= dt; Fy.docked = true; if (Fy.wait <= 0) { Fy.docked = false; Fy.s = 0.5; if (PL.veh === Fy) UI.toast('🛳️ 出航！ 島を一周します'); } }
    else { Fy.v = lerp(Fy.v, 8.5, Math.min(1, dt * 0.4)); Fy.s += Fy.v * dt; if (Math.random() < dt * 20) FX.wake(Fy);
      if (Fy.s >= Fy.cum[Fy.cum.length - 1]) { Fy.s = Fy.cum[Fy.cum.length - 1]; Fy.v = 0; Fy.wait = 25; Fy.docked = true; if (PL.veh === Fy) { UI.toast('🛳️ 桟橋に着きました（Space でおりる）'); this.p.stats.ferryN++; this.dirty = true; this.check(); } } }
    this.placeFerry(dt);
    if (PL.veh === Fy) { PL.x = Fy.x; PL.z = Fy.z; PL.rot = Fy.rot; const s = Math.sin(Fy.rot), c = Math.cos(Fy.rot); PL.mesh.visible = CAM.mode !== 'first'; PL.mesh.position.set(Fy.x + c * 0.8 - s * 1.0, Fy.mesh.position.y + 3.45, Fy.z - s * 0.8 - c * 1.0); PL.mesh.rotation.y = Fy.rot + Math.PI / 2; }
  },
  // =============== riding bus / ferry ===============
  rideTarget() {
    if (PL.veh) return null; const B = DV.bus, Fy = DV.ferry;
    if (B && B.wait > 0.5 && Math.hypot(PL.x - B.x, PL.z - B.z) < 5.5) return B;
    const P = this.devState().pier; if (Fy && Fy.docked && Fy.wait > 1 && P && Math.hypot(PL.x - P.ex, PL.z - P.ez) < 6) return Fy;
    return null;
  },
  rideKey() {
    const v = PL.veh;
    if (v && (v.kind === 'bus' || v.kind === 'ferry')) {
      if (v.kind === 'bus' && v.wait > 0) { const st = v.stop || {}; PL.veh = null; PL.x = st.x !== undefined ? st.x : v.x + 3; PL.z = st.z !== undefined ? st.z : v.z; PL.y = standY(PL.x, PL.z); PL.mesh.visible = true; CAM.distT = 5.2; UI.toast('バスをおりた'); return true; }
      if (v.kind === 'ferry' && v.docked) { const P = this.devState().pier; PL.veh = null; PL.x = P.ex; PL.z = P.ez; PL.y = standY(PL.x, PL.z); PL.mesh.visible = true; CAM.distT = 5.2; UI.toast('観光船をおりた'); return true; }
      UI.toast(v.kind === 'bus' ? '次のバス停でおりられます' : '桟橋に着いたらおりられます'); return true;
    }
    const t = this.rideTarget(); if (!t) return false;
    PL.veh = t; CAM.distT = CARSPEC[t.kind].cam; PL.mesh.visible = t.kind === 'ferry';
    if (t.kind === 'bus') { this.p.stats.busN++; this.dirty = true; this.check(); }
    UI.toast(t.kind === 'bus' ? `🚌 バスに乗った（${t.dir > 0 ? '灯台口' : '西の浜口'}方面）。着いたら Space でおりる` : '🛳️ 観光船に乗った。もうすぐ出航です'); return true;
  },
  // =============== reclamation ===============
  reclaim(shape) { // raise sea to land inside an ellipse or a strip; idempotent (max with current height)
    const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, H = G.H, H0 = G.H0, W = G.Wl; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    const tAt = (x, z) => { if (shape.type === 'ellipse') { const dx = x - shape.cx, dz = z - shape.cz, out = dx * shape.ux + dz * shape.uz, along = dx * shape.uz - dz * shape.ux; return Math.hypot(along / shape.ax, out / shape.az); } const d = segDist(x, z, [shape.ax, shape.az], [shape.bx, shape.bz]); return d / shape.w; };
    const R = shape.type === 'ellipse' ? Math.max(shape.ax, shape.az) * 1.4 + 4 : 0, bx = shape.type === 'ellipse' ? [shape.cx - R, shape.cx + R, shape.cz - R, shape.cz + R] : [Math.min(shape.ax, shape.bx) - shape.w * 1.5, Math.max(shape.ax, shape.bx) + shape.w * 1.5, Math.min(shape.az, shape.bz) - shape.w * 1.5, Math.max(shape.az, shape.bz) + shape.w * 1.5];
    for (let j = Math.max(0, Math.floor((bx[2] - h0) / cell)); j <= Math.min(n - 1, Math.ceil((bx[3] - h0) / cell)); j++) for (let i = Math.max(0, Math.floor((bx[0] - h0) / cell)); i <= Math.min(n - 1, Math.ceil((bx[1] - h0) / cell)); i++) {
      const x = h0 + i * cell, z = h0 + j * cell, t = tAt(x, z); if (t > 1.45) continue; const k = j * n + i;
      const tgt = t < 0.82 ? (shape.h || 1.8) + (fbm(x * 0.05, z * 0.05, 4, 2) - 0.5) * 0.4 : lerp(shape.h || 1.8, -3.5, sstep(0.82, 1.45, t));
      if (tgt > H[k]) { H[k] = tgt; if (!isNaN(W[k]) && tgt > W[k]) W[k] = NaN; } if (tgt > H0[k]) H0[k] = tgt;
      x0 = Math.min(x0, i); x1 = Math.max(x1, i); z0 = Math.min(z0, j); z1 = Math.max(z1, j);
    }
    if (x1 >= x0) refreshRegion(x0 - 1, z0 - 1, x1 + 1, z1 + 1);
  },
  devRoad(nodes) {
    const pts = roadPathFrom(nodes); if (!pts) return; const r = { pts, w: 4.6, lines: false, user: false, dev: true };
    let hs = pts.map(([x, z]) => Math.max(0.9, groundH(x, z))); for (let k = 0; k < 20; k++) hs = hs.map((h, i) => i === 0 || i === hs.length - 1 ? h : (hs[i - 1] + h * 2 + hs[i + 1]) / 4);
    if (nodes[0].snap) hs[0] = nodes[0].snap.y; r.h = hs; markBridges(G, r);
    const box2 = carveSingleRoad(r); ROADS.push(r); rasterizeRoadDist(); rebuildDecks(); r.mesh = makeRoadMesh(r); TERR.roadGroup.add(r.mesh); refreshRegion(box2[0] - 2, box2[1] - 2, box2[2] + 2, box2[3] + 2);
  },
  applyLand() { // (re)apply finished reclamations and the causeway road on load / completion
    const D = this.devState();
    for (const id of ['reclaim1', 'reclaim2']) if (D[id] && D[id].state === 'done' && D[id].shape) this.reclaim(D[id].shape);
    if (D.causeway && D.causeway.state === 'done' && D.causeway.shape) { this.reclaim(D.causeway.shape); if (!ROADS.some(r => r.dev)) { const s = D.causeway.shape, sn = nearestOnRoads(s.ax, s.az, 250, false); const nodes = []; if (sn) nodes.push({ x: sn.x, z: sn.z, snap: sn }); nodes.push({ x: s.ax, z: s.az }, { x: (s.ax + s.bx) / 2, z: (s.az + s.bz) / 2 }, { x: s.bx, z: s.bz }); this.devRoad(nodes); } }
  },
  // =============== fireworks ===============
  updateFireworks(dt) {
    const D = this.devState(), f = D.fireworks, hf = currentHour(), on = f && f.date === todayKey() && hf >= 19 && hf < 23.5;
    if (on) { DV.fwT -= dt; if (DV.fwT <= 0) { DV.fwT = 0.7 + Math.random() * 1.1; this.burst(); } }
    for (let k = DV.fw.length - 1; k >= 0; k--) { const b = DV.fw[k]; b.t += dt; const P = b.pts.geometry.attributes.position; for (let i = 0; i < b.vel.length; i++) { b.vel[i][1] -= 4 * dt; P.setXYZ(i, P.getX(i) + b.vel[i][0] * dt, P.getY(i) + b.vel[i][1] * dt, P.getZ(i) + b.vel[i][2] * dt); b.vel[i][0] *= 0.985; b.vel[i][2] *= 0.985; } P.needsUpdate = true; b.pts.material.opacity = Math.max(0, 1 - b.t / 2.4); if (b.t > 2.4) { scene.remove(b.pts); b.pts.geometry.dispose(); DV.fw.splice(k, 1); } }
  },
  burst() {
    const H = this.LM.harbor, c = new THREE.Color().setHSL(Math.random(), 0.9, 0.6), N = 160, pos = new Float32Array(N * 3), vel = [], x = H.x + (Math.random() - 0.5) * 80, y = 55 + Math.random() * 35, z = H.z + 40 + (Math.random() - 0.5) * 60;
    for (let i = 0; i < N; i++) { pos.set([x, y, z], i * 3); const u = Math.random() * 2 - 1, a = Math.random() * 6.283, s = Math.sqrt(1 - u * u), sp = 14 + Math.random() * 3; vel.push([Math.cos(a) * s * sp, u * sp, Math.sin(a) * s * sp]); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: c, size: 1.6, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); pts.frustumCulled = false; scene.add(pts); DV.fw.push({ pts, vel, t: 0 });
  },
  updateDev(dt) { this.updateBus(dt); this.updateFerry(dt); this.updateFireworks(dt); for (const t of DV.turbines) t.rotation.z += dt * 0.9; },
});

// ---------- automatic locations ----------
function coastPoints(cx, cz, rMin, rMax) { // land vertices that touch the sea, within a ring around (cx,cz)
  const out = []; for (let z = cz - rMax; z <= cz + rMax; z += 3) for (let x = cx - rMax; x <= cx + rMax; x += 3) { const r = Math.hypot(x - cx, z - cz); if (r < rMin || r > rMax || groundH(x, z) < 0.4) continue; let hit = null; for (const pr of [4, 8, 12]) { for (let a = 0; a < 6.28; a += 0.4) { const dx = Math.cos(a), dz = Math.sin(a); if (groundH(x + dx * pr, z + dz * pr) < -0.3) { hit = { x, z, nx: dx, nz: dz }; break; } } if (hit) break; } if (hit) out.push(hit); } return out;
}
function seaward(x, z) { let best = null, lo = 1e9; for (let a = 0; a < 6.28; a += 0.2) { const h = groundH(x + Math.cos(a) * 18, z + Math.sin(a) * 18); if (h < lo) { lo = h; best = [Math.cos(a), Math.sin(a)]; } } return best; }
const DEV_LOC = {
  waiting() { const Hb = GAME.LM.harbor; for (let r = 8; r < 70; r += 1.5) for (let a = 0; a < 6.28; a += 0.25) { const x = Hb.x + Math.cos(a) * r, z = Hb.z + Math.sin(a) * r; if (!landOK(x, z, 5.5)) continue; const nr = nearestOnRoads(x, z, 25, false); const rot = nr ? Math.atan2(nr.x - x, nr.z - z) : 0, o = { x, z, rot }; let ok = true; for (const [a2, b2] of [[-3.5, -2.3], [3.5, -2.3], [-3.5, 2.3], [3.5, 2.3]]) { const [px, pz] = toWorld(o, a2, b2); if (!landOK(px, pz, 4.2) || collidersNear(px, pz).some(c => !c.off && hitsCollider(c, px, pz, 0.8))) ok = false; } if (ok) return { x, z, rot, y: groundH(x, z) }; } return null; },
  pier() { const Hb = GAME.LM.harbor; let best = null;
    for (const c of coastPoints(Hb.x, Hb.z, 25, 140)) { const sw = seaward(c.x, c.z); if (!sw) continue; const len = 22; let ok = true; for (let d = 2; d <= len + 10; d += 2) { const x = c.x + sw[0] * d, z = c.z + sw[1] * d; if (onPierAt(x, z) || collidersNear(x, z).some(q => !q.off && hitsCollider(q, x, z, 2))) ok = false; }
      const deep = groundH(c.x + sw[0] * (len + 6), c.z + sw[1] * (len + 6)); if (!ok || deep > -1.4) continue; const dh = Math.hypot(c.x - Hb.x, c.z - Hb.z), sc = Math.abs(dh - 55) + (deep > -4 ? 10 : 0); if (!best || sc < best.sc) best = { sc, c, sw, len }; }
    if (!best) return null; const { c, sw, len } = best, rot = Math.atan2(sw[0], sw[1]), ex = c.x + sw[0] * len, ez = c.z + sw[1] * len, side = [sw[1], -sw[0]];
    return { x: c.x, z: c.z, rot, len, ex, ez, dx: ex + side[0] * 5.5 - sw[0] * 4, dz: ez + side[1] * 5.5 - sw[1] * 4, ox: ex + side[0] * 5.5 + sw[0] * 40, oz: ez + side[1] * 5.5 + sw[1] * 40, frot: rot + Math.PI }; },
  bus() { return {}; }, ferry() { return {}; }, fireworks() { return {}; },
  beach() { const B = GAME.LM.beach; let best = null; for (const c of coastPoints(B.x, B.z, 10, 90)) { const d = Math.hypot(c.x - B.x, c.z - B.z); if (d < 25) continue; if (roadDistAt(c.x - c.nx * 4, c.z - c.nz * 4) < 3.6) continue; const sc = Math.abs(d - 45); if (!best || sc < best.sc) best = { sc, c }; } if (!best) return null; const c = best.c; return { x: c.x - c.nx * 4, z: c.z - c.nz * 4, rot: Math.atan2(c.nx, c.nz) }; },
  windfarm() { const a = CAPE.a, b = CAPE.b, pts = []; for (let k = 0; k < 40 && pts.length < 3; k++) { const t = 0.25 + k * 0.016, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; for (const off of [-14, 14, 0]) { const nx = -(b[1] - a[1]), nz = b[0] - a[0], L = Math.hypot(nx, nz), px = x + nx / L * off, pz = z + nz / L * off; if (groundH(px, pz) > 3 && roadDistAt(px, pz) > 8 && !collidersNear(px, pz).some(q => !q.off && hitsCollider(q, px, pz, 4)) && pts.every(q => Math.hypot(q[0] - px, q[1] - pz) > 26)) { pts.push([px, pz]); break; } } } return pts.length ? { x: pts[0][0], z: pts[0][1], list: pts } : null; },
  reclaim1() { const H = GAME.LM.harbor; return reclaimSpot({ x: H.x + 110, z: H.z - 20 }, 0, 120, 'h'); },
  reclaim2() { return reclaimSpot({ x: 175, z: 40 }, 0, 140, 'b'); },
  causeway() { const I = GAME.LM.islet; let best = null; for (let a = 0; a < 6.28; a += 0.05) for (let r = 30; r < 160; r += 2) { const x = I.x + Math.cos(a) * r, z = I.z + Math.sin(a) * r; if (groundH(x, z) > 1.2 && Math.hypot(x - I.x, z - I.z) > 40) { if (!best || r < best.r) best = { r, x, z }; break; } }
    if (!best) return null; const dx = best.x - I.x, dz = best.z - I.z, L = Math.hypot(dx, dz); return { x: (best.x + I.x) / 2, z: (best.z + I.z) / 2, shape: { type: 'strip', ax: best.x - dx / L * 2, az: best.z - dz / L * 2, bx: I.x + dx / L * 8, bz: I.z + dz / L * 8, w: 7, h: 1.4 } }; },
};
function reclaimSpot(anchor, rMin, rMax, tag) {
  const Hb = GAME.LM.harbor, P = GAME.devState().pier, bm = PLACED.harbor; let best = null;
  for (const c of coastPoints(anchor.x, anchor.z, rMin, rMax)) {
    const sw = seaward(c.x, c.z); if (!sw) continue; const cx = c.x + sw[0] * 20, cz = c.z + sw[1] * 20;
    if (Math.hypot(cx - Hb.x, cz - Hb.z) < 75 || (P && Math.hypot(cx - P.ex, cz - P.ez) < 60) || Math.hypot(cx - GAME.LM.islet.x, cz - GAME.LM.islet.z) < 70) continue;
    if (bm && Math.hypot(cx - bm.x, cz - bm.z) < 90) continue; if (GAME.LM.beach && Math.hypot(c.x - GAME.LM.beach.x, c.z - GAME.LM.beach.z) < 60) continue; if (PLACED.lighthouse && Math.hypot(cx - PLACED.lighthouse.x, cz - PLACED.lighthouse.z) < 50) continue; if (GAME.p && GAME.p.dev && GAME.p.dev.reclaim1 && GAME.p.dev.reclaim1.x !== undefined && Math.hypot(cx - GAME.p.dev.reclaim1.x, cz - GAME.p.dev.reclaim1.z) < 80) continue;
    if (Math.abs(cx) > 300 || Math.abs(cz) > 300) continue; let sea = 0; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; if (groundH(cx + Math.cos(a) * 18, cz + Math.sin(a) * 18) < -0.3) sea++; }
    const sc = Math.hypot(c.x - anchor.x, c.z - anchor.z) - sea * 3; if (!best || sc < best.sc) best = { sc, cx, cz, sw };
  }
  if (!best) return null; return { x: best.cx, z: best.cz, shape: { type: 'ellipse', cx: best.cx, cz: best.cz, ax: tag === 'b' ? 42 : 32, az: tag === 'b' ? 24 : 19, ux: best.sw[0], uz: best.sw[1], h: 2.6 } };
}
TOOLS.push({ id: 'build', name: '建てる', icon: '🏗️', hint: '開発の建物を建てる場所をクリック', brush: false, hidden: true });
GAME.devRecs = function (C) {
  const p = this.p, D = this.devState(), lv = this.level();
  for (const id of (p.justDev || [])) { const d = DEV.find(q => q.id === id), s = D[id]; if (d) C.push({ pri: 121, icon: '🎉', text: `「${d.name}」が完成しました！${d.tour ? `観光ポイント+${d.tour}。` : ''}見に行ってみてね。`, at: s && s.x !== undefined ? { x: s.x, z: s.z } : null }); }
  p.justDev = [];
  for (const d of DEV) { const s = D[d.id]; if (s && s.state === 'site') C.push({ pri: 95, icon: '📍', text: `「${d.name}」を建てる場所がまだ決まっていません。島の開発（P）から決めてね。` }); }
  const nxt = DEV.find(d => d.lv <= lv && this.devAvail(d) && !D[d.id] && (!d.need || (D[d.need] && D[d.need].state === 'done')) && d.id !== 'fireworks');
  if (nxt && p.money >= nxt.price * 0.6) C.push({ pri: 57, icon: '🏗️', text: `島の開発で「${nxt.name}」（${yen(nxt.price)}）ができます。${nxt.note}` });
  const car = CAR_SHOP.find(c => c.lv <= lv && !this.garage().cars[c.id]); if (car && p.money >= car.price * 0.7 && DV.motors) C.push({ pri: 47, icon: '🚗', text: `島モータースに「${CARSPEC[car.id].name}」（${yen(car.price)}）が入っています。`, at: { x: DV.motors.x, z: DV.motors.z } });
  if (D.ferry && D.ferry.state === 'done' && D.pier) C.push({ pri: 35, icon: '🛳️', text: '観光船は桟橋から出ています。Space で乗ると島を一周できます。', at: { x: D.pier.ex, z: D.pier.ez } });
};
