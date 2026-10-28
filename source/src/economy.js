// ===================== お金・バッグ・出荷・商店・プレゼント・かざり =====================
const DECOR = [
  { id: 'pot', name: '植木鉢', price: 300, r: 0.35 },
  { id: 'flowerbed', name: '花壇', price: 600, box: [1.0, 0.45] },
  { id: 'bench', name: 'ベンチ', price: 800, box: [0.85, 0.28] },
  { id: 'postbox', name: '赤いポスト', price: 1000, r: 0.32 },
  { id: 'lamp', name: '街灯', price: 1200, r: 0.18 },
  { id: 'parasol', name: 'パラソルとテーブル', price: 1500, r: 0.75 },
  { id: 'lantern', name: '石灯籠', price: 1800, r: 0.42 },
  { id: 'vending', name: '自販機', price: 2000, box: [0.5, 0.42] },
  { id: 'swing', name: 'ブランコ', price: 2500, box: [1.35, 0.6] },
  { id: 'slide', name: 'すべり台', price: 3000, box: [0.55, 1.7] },
  { id: 'windmill', name: '風車', price: 3500, r: 0.65 },
  { id: 'fountain', name: '噴水', price: 5000, r: 1.5 },
];
const RODS = [null, { name: 'お古の釣りざお', win: 1, rare: 1 }, { name: '上等な釣りざお', price: 3000, win: 1.35, rare: 1.7, note: '魚がかかってから合わせるまでの時間が長く、めずらしい魚がかかりやすい' }, { name: '名人の釣りざお', price: 12000, win: 1.7, rare: 2.8, note: 'さらに合わせやすく、大物がよくかかる' }];
const FISH_CAP = 20, MIKAN_CAP = 99;
const GIFT_PREF = {
  v_mio: { love: ['tako', 'ika'], like: ['sea'], loveT: 'えっ、{X}！？ わたしの大好物だよ！ ありがとう〜！', likeT: '海の魚だ！ うれしいな、ありがとう！', normT: 'ありがとう、{P}さん！ 大事にするね。' },
  v_sora: { love: ['aji', 'sayori'], like: ['big'], loveT: 'うおっ、{X}じゃん！ これ食べたかったんだよ！', likeT: 'でっけー！ すげーな{P}！', normT: 'お、サンキュー！' },
  v_hana: { love: ['mikan'], like: ['pond'], loveT: 'まあ、{X}！ あまずっぱくて大好きなの。ありがとう。', likeT: 'かわいい魚ね。うちの水そうに入れようかしら。', normT: 'あら、ありがとう。うれしいわ。' },
  v_gen: { love: ['madai', 'chinu'], like: ['rare'], loveT: 'こりゃ見事な{X}じゃ！ わしの若いころを思い出すのう。', likeT: 'ほう、なかなかの魚じゃな。腕を上げたのう。', normT: 'おお、ありがとうよ。' },
  v_rin: { love: ['ayu', 'karei'], like: ['mikan'], loveT: '{X}！ 島の味だね、すっごくうれしい！', likeT: 'わあ、ありがとう！ みんなで分けようかな。', normT: 'ありがとう、{P}さん！' },
  v_kai: { love: ['mikan'], like: ['fugu'], loveT: '{X}だ〜！ お店で人気なんだよ、ありがとう！', likeT: 'あはは、ふくらんでる！ おもしろい！', normT: 'ありがとう！ 大事にするね〜。' },
  v_nagi: { love: ['sawara', 'suzuki'], like: ['sea', 'rare'], loveT: 'す、すごい！ {X}だ…！ 釣った{P}さん、天才！', likeT: 'いい魚！ どこで釣ったの？', normT: 'ありがとう！ 魚のことなら任せて！' },
  v_takumi: { love: ['unagi'], like: ['big'], loveT: '{X}っすか！ 大好物っす、力が出るっす！', likeT: '立派っすね！ ありがたくいただきます。', normT: 'あざっす！' },
  v_yuki: { love: ['medaka', 'koi'], like: ['pond', 'river'], loveT: '{X}…！ なんてきれいな色。絵にかかせてね。', likeT: '水辺の魚ね。すてき、ありがとう。', normT: 'ありがとう。大切にするわ。' },
  v_kota: { love: ['mokuzu', 'namazu'], like: ['river'], loveT: 'すっげー！ {X}だ！ 宝物にする！', likeT: '川の魚だ！ かっこいい！', normT: 'ありがとー！' },
};
const MILESTONE = {
  v_gen: { rod: 2, t: 'いつも島のためにありがとうよ。これはわしの上等な釣りざおじゃ。{P}が使ってくれ。' },
  v_hana: { decor: 'flowerbed', n: 2, t: 'いつもありがとう。お礼に花壇を2つ作ったの。好きな所に置いてね。' },
  v_sora: { decor: 'lamp', n: 1, t: 'これ、使ってない街灯なんだけど、{P}にやるよ！' },
  v_mio: { decor: 'parasol', n: 1, t: '{P}さん、これプレゼント！ パラソルとテーブルだよ。浜に置いたらすてきかも！' },
  v_rin: { decor: 'lantern', n: 1, t: 'いつも島のことを考えてくれてありがとう。石灯籠、もらってくれる？' },
  v_kai: { decor: 'vending', n: 1, t: 'お店で使わなくなった自販機、あげる！ 好きな所に置いてね〜。' },
  v_nagi: { decor: 'pot', n: 3, t: 'これ、植木鉢！ 家のまわりがかわいくなるよ。' },
  v_takumi: { decor: 'swing', n: 1, t: 'ブランコ作ったんすけど、置く場所を{P}さんに決めてほしいっす！' },
  v_yuki: { decor: 'windmill', n: 1, t: '小さな風車を作ったの。風が見えるって、すてきでしょう？' },
  v_kota: { decor: 'slide', n: 1, t: 'すべり台、作ってもらったんだ！ {P}にいちゃん（ねえちゃん）の好きな所に置いて！' },
};
DAILY_POOL.push(
  { id: 'ship2', who: 'v_gen', text: '魚を2匹出荷する', n: 2, stat: 'shipFish', need: p => p.items && p.items.rod, ask: '港の出荷所に、魚を2匹ほど出してくれんか。' },
  { id: 'gift1', who: 'v_rin', text: 'だれかにプレゼントをする', n: 1, stat: 'giftN', ask: 'だれかに魚やみかんをプレゼントしてみて。きっと喜ぶよ！' },
  { id: 'decor1', who: 'v_sora', text: 'しまづくりでかざりを1つ置く', n: 1, stat: 'decorN', need: p => p.money >= 300 || Object.values((p.bag && p.bag.decor) || {}).some(n => n > 0), ask: '商店でかざりを買って、どこかに置いてみようぜ！' });
GOALS.push(
  { id: 'ship10k', text: '出荷で合計1万円かせぐ', n: 10000, stat: 'shipped', unit: '円', pts: 25 },
  { id: 'gift5', text: '住民に5回プレゼントする', n: 5, stat: 'giftN', pts: 20 },
  { id: 'decor5', text: 'かざりを5つ置く', n: 5, prog: () => (GAME.p.decor || []).length, pts: 25 },
  { id: 'rod3', text: '名人の釣りざおを手に入れる', n: 1, prog: () => GAME.rodLv() >= 3 ? 1 : 0, pts: 30 },
  { id: 'ship100k', text: '出荷で合計10万円かせぐ', n: 100000, stat: 'shipped', unit: '円', pts: 50 });
STAT_KEYS.push('shipped', 'shipFish', 'giftN', 'decorN');
TOOLS.push({ id: 'decor', name: 'かざる', icon: '🪑', hint: '買ったかざりを置きます（R で回す）。「しまう」で置いたかざりを片づけます', brush: false });
const DECO = { group: null, track: [], spin: [], ghost: null, ghostId: null, ship: null };
const yen = n => `${Math.round(n).toLocaleString('ja-JP')}円`;

Object.assign(GAME, {
  // =============== bag & money ===============
  bag() { const p = this.p; p.bag = p.bag || { fish: [], mikan: 0, decor: {} }; p.bag.decor = p.bag.decor || {}; p.money = p.money || 0; return p.bag; },
  rodLv() { return (this.p && this.p.items && this.p.items.rodLv) || 1; },
  addMoney(n) { this.p.money = (this.p.money || 0) + n; this.dirty = true; this.renderTracker(); },
  hotFish() { const ids = FISH.filter(f => f.st <= 3).map(f => f.id); return ids[hashStr('hot' + todayKey()) % ids.length]; },
  fishPrice(id, size) { const f = FISH.find(q => q.id === id); const base = { 1: 120, 2: 450, 3: 1500, 4: 5000 }[f.st], frac = (size - f.sz[0]) / Math.max(1, f.sz[1] - f.sz[0]); return Math.round(base * (0.7 + 0.6 * frac) * (this.hotFish() === id ? 2 : 1) / 10) * 10; },
  mikanPrice() { return this.p.projects && this.p.projects.market && this.p.projects.market.done ? 60 : 40; },
  // =============== places: 出荷所 & 商店 ===============
  initPlaces() {
    // 漁協の出荷所: a small open shed near the harbor (placed at runtime on flat land, no terrain change)
    const Hb = this.LM.harbor; let best = null;
    for (let r = 6; r < 70 && !best; r += 1.5) for (let a = 0; a < 6.28; a += 0.2) {
      const x = Hb.x + Math.cos(a) * r, z = Hb.z + Math.sin(a) * r; if (!landOK(x, z, 6)) continue;
      const nr = nearestOnRoads(x, z, 30, false); if (!nr) continue; const rot = Math.atan2(nr.x - x, nr.z - z), o = { x, z, rot };
      let mn = 1e9, mx = -1e9, ok = true; for (const [a2, b2] of [[-2.6, -2], [2.6, -2], [-2.6, 2.4], [2.6, 2.4], [0, 0]]) { const [px, pz] = toWorld(o, a2, b2); if (!landOK(px, pz, 4.6)) ok = false; const h = groundH(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h); if (collidersNear(px, pz).some(c => !c.off && hitsCollider(c, px, pz, 1.2))) ok = false; }
      if (ok && mx - mn < 1.1) { best = { x, z, rot, y: mx }; break; }
    }
    if (best) {
      const g = new THREE.Group(); makeShipStation(g);
      const sign = dynSign(3.4, 0.6, '漁協 出荷所', '#ffffff', '#1f4f8a'); sign.userData.keep = false; sign.position.set(0, 2.62, 2.76); g.add(sign); DECO.shipSign = sign;
      g.position.set(best.x, best.y - 0.1, best.z); g.rotation.y = best.rot; scene.add(mergeLocal(g));
      const C = (lx, lz, hw, hd) => { const [x, z] = toWorld(best, lx, lz); addCollider({ x, z, hw, hd, rot: best.rot, kind: 'bld' }); };
      C(0, -2.2, 2.8, 0.15); C(-1.4, -1.6, 0.95, 0.4); C(1.4, 0.2, 0.75, 0.4); for (const a of [-2.6, 2.6]) for (const b of [-2.1, 2.1]) { const [x, z] = toWorld(best, a, b); addCollider({ x, z, r: 0.12, kind: 'pole' }); }
      const [ex, ez] = toWorld(best, 0, 1.0); DECO.ship = { x: ex, z: ez, at: best }; this.LM.ship = { x: ex, z: ez, r: 0 };
    }
    const S = PLACED.shop; if (S) { const [ex, ez] = toWorld(S, 0, S.d / 2 + 1.7); DECO.shop = { x: ex, z: ez }; this.LM.shop = { x: ex, z: ez, r: 0 };
      const sg = dynSign(S.w - 1.3, 1.0, 'ほしなみ商店', '#fff9ec', '#2f5a3f'); sg.userData.keep = false; const [sx, sz] = toWorld(S, 0, S.d / 2 + 0.33); sg.position.set(sx, S.y + 0.45 + S.floors * 2.75 + 0.75, sz); sg.rotation.y = S.rot; scene.add(sg); DECO.shopSign = sg; }
  },
  nearShip() { return DECO.ship && !PL.veh && Math.hypot(PL.x - DECO.ship.x, PL.z - DECO.ship.z) < 2.6; },
  nearShop() { return DECO.shop && !PL.veh && Math.hypot(PL.x - DECO.shop.x, PL.z - DECO.shop.z) < 2.4; },
  // =============== 出荷 ===============
  openShip() {
    const p = this.p, b = this.bag(), hot = FISH.find(f => f.id === this.hotFish()); this.modal = 'ship';
    const sm = typeof SHOP !== 'undefined' && SHOP.sellMikan ? SHOP.sellMikan() : b.mikan; const rows = b.fish.map((f, i) => { const F = FISH.find(q => q.id === f.id); if (f.shop) return `<li class="lock"><label><span class="nm">${esc(F.name)} <small>${f.size}cm・お店で買った魚は出荷できません（料理に使えます）</small></span></label></li>`; return `<li><label><input type="checkbox" data-i="${i}" checked><span class="nm">${esc(F.name)} <small>${f.size}cm ${'★'.repeat(F.st)}</small>${f.id === hot.id ? '<span class="hot">高値</span>' : ''}</span><span class="pr">${yen(this.fishPrice(f.id, f.size))}</span></label></li>`; }).join('');
    this.el.modal.innerHTML = `<div class="mbox shopbox"><div class="mh"><h2>漁協 出荷所</h2><span class="isl">今日の高値：${esc(hot.name)}（いつもの2倍）</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb">
      ${b.fish.length || sm ? `<ul class="slist">${rows}${sm ? `<li><label><input type="checkbox" data-m="1" checked><span class="nm">みかん <small>×${sm}${sm < b.mikan ? `（お店で買った${b.mikan - sm}こはのぞく）` : ''}</small></span><span class="pr">${yen(sm * this.mikanPrice())}</span></label></li>` : ''}</ul>` : '<p class="empty">出荷できるものがありません。魚を釣ったり、みかんをとったりしてから来てね。</p>'}
      </div><div class="mf"><span class="tot" id="shipTot"></span><span class="sp"></span><button class="ghost" data-x="none">ぜんぶ外す</button><button class="primary" data-x="ship">選んだものを出荷</button></div></div>`;
    this.el.modal.hidden = false; const box2 = this.el.modal.querySelector('.shopbox');
    const total = () => { let t = 0; box2.querySelectorAll('input[data-i]:checked').forEach(c => { const f = b.fish[+c.dataset.i]; t += this.fishPrice(f.id, f.size); }); if (box2.querySelector('input[data-m]:checked')) t += sm * this.mikanPrice(); box2.querySelector('#shipTot').textContent = `合計 ${yen(t)}`; return t; };
    total(); box2.onchange = total;
    box2.onclick = e => { const x = e.target.closest('[data-x]'); if (!x) return; const k = x.dataset.x; if (k === 'close') return this.closeModal();
      if (k === 'none') { const cs = box2.querySelectorAll('input[type=checkbox]'), any = [...cs].some(c => c.checked); cs.forEach(c => c.checked = !any); x.textContent = any ? 'ぜんぶ選ぶ' : 'ぜんぶ外す'; total(); }
      if (k === 'ship') { const t = total(); if (!t) { UI.toast('出荷するものを選んでね'); return; } const idx = [...box2.querySelectorAll('input[data-i]:checked')].map(c => +c.dataset.i); const nf = idx.length;
        b.fish = b.fish.filter((_, i) => !idx.includes(i)); const mk = box2.querySelector('input[data-m]:checked'); if (mk) b.mikan -= sm;
        p.stats.shipped += t; p.stats.shipFish += nf; this.addMoney(t); this.closeModal(); UI.toast(`📦 出荷しました！ ${yen(t)} もらった（所持金 ${yen(p.money)}）`); this.check(); this.save(); } };
  },
  // =============== 商店 ===============
  openShop(tab) {
    const p = this.p, b = this.bag(); this.modal = 'shop'; this.shopTab = tab || this.shopTab || 'decor';
    let body = '';
    if (this.shopTab === 'decor') body = `<ul class="glist">${DECOR.map(d => `<li><div class="th">${DECO_ICON[d.id] || '🪑'}</div><div class="in"><b>${esc(d.name)}</b><span class="own">持っている ${b.decor[d.id] || 0}　置いた ${(p.decor || []).filter(q => q.id === d.id).length}</span></div><button class="buy" data-buy="${d.id}" ${p.money < d.price ? 'disabled' : ''}>${yen(d.price)}</button></li>`).join('')}</ul><p class="small">買ったかざりは、しまづくり（B）の「🪑 かざる」で島に置けます。</p>`;
    if (this.shopTab === 'tool') { const lv = this.rodLv(); body = `<ul class="glist">${[2, 3].map(l => { const R = RODS[l], own = lv >= l, can = lv === l - 1 && p.items.rod; return `<li><div class="th">🎣</div><div class="in"><b>${R.name}</b><span class="own">${own ? 'もっている' : esc(R.note)}</span></div><button class="buy" data-rod="${l}" ${own || !can || p.money < R.price ? 'disabled' : ''}>${own ? '購入ずみ' : yen(R.price)}</button></li>`; }).join('')}</ul><p class="small">${p.items.rod ? `いまの釣りざお：${RODS[lv].name}` : '釣りざおは、まずゲンじいからもらおう。'}</p>`; }
    this.el.modal.innerHTML = `<div class="mbox shopbox"><div class="mh"><h2>${esc(p.island)}商店</h2><span class="isl">所持金 ${yen(p.money)}</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
      <div class="tabs"><button data-st="decor" class="${this.shopTab === 'decor' ? 'on' : ''}">かざり</button><button data-st="tool" class="${this.shopTab === 'tool' ? 'on' : ''}">道具</button><button data-st="furn">家具カタログ</button></div><div class="mb">${body}</div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.shopbox').onclick = e => { const t = e.target.closest('[data-st]'); if (t) return t.dataset.st === 'furn' ? this.openCatalog() : this.openShop(t.dataset.st); if (e.target.closest('[data-x="close"]')) return this.closeModal();
      const by = e.target.closest('[data-buy]'); if (by && !by.disabled) { const d = DECOR.find(q => q.id === by.dataset.buy); p.money -= d.price; b.decor[d.id] = (b.decor[d.id] || 0) + 1; UI.toast(`🛍️ ${d.name}を買った！（しまづくりの「かざる」で置けます）`); this.dirty = true; this.renderTracker(); return this.openShop(); }
      const rd = e.target.closest('[data-rod]'); if (rd && !rd.disabled) { const l = +rd.dataset.rod; p.money -= RODS[l].price; p.items.rodLv = l; UI.toast(`🎣 ${RODS[l].name}を買った！`); this.dirty = true; this.check(); this.renderTracker(); return this.openShop(); } };
  },
  // =============== バッグ ===============
  openBag() {
    if (!this.p) return; const p = this.p, b = this.bag(); this.modal = 'bag';
    const groups = {}; b.fish.forEach((f, i) => { (groups[f.id] = groups[f.id] || []).push({ ...f, i }); });
    const fishRows = Object.entries(groups).map(([id, arr]) => { const F = FISH.find(q => q.id === id); return `<li><span class="ic">🐟</span><div><b>${esc(F.name)}</b> ×${arr.length}<div class="sub">${arr.map(a => `${a.size}cm`).join('・')}</div></div><button class="rel" data-rel="${id}">1匹放す</button></li>`; }).join('');
    const dec = DECOR.filter(d => b.decor[d.id] > 0).map(d => `<li><span class="ic">${DECO_ICON[d.id]}</span><div><b>${esc(d.name)}</b> ×${b.decor[d.id]}</div></li>`).join('');
    this.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>バッグ</h2><span class="isl">所持金 ${yen(p.money)}</span><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb">
      <h3 class="bh">クーラーボックス（${b.fish.length}/${FISH_CAP}）</h3><ul class="list">${fishRows || '<li><div class="sub">魚は入っていません</div></li>'}</ul>
      <h3 class="bh">みかん</h3><ul class="list"><li><span class="ic">🍊</span><div><b>みかん</b> ×${b.mikan}<div class="sub">出荷すると1こ${yen(this.mikanPrice())}</div></div></li></ul>
      <h3 class="bh">かざり</h3><ul class="list">${dec || '<li><div class="sub">持っていません（商店で買えます）</div></li>'}</ul>
      <h3 class="bh">道具</h3><ul class="list"><li><span class="ic">🎣</span><div><b>${p.items.rod ? RODS[this.rodLv()].name : '釣りざおなし'}</b></div></li></ul>
      <p class="small">魚とみかんは、港の「漁協 出荷所」で売ったり、住民にプレゼントしたりできます。</p></div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.journal').onclick = e => { if (e.target.closest('[data-x="close"]')) return this.closeModal(); const r = e.target.closest('[data-rel]'); if (r) { const i = b.fish.findIndex(f => f.id === r.dataset.rel); if (i >= 0) b.fish.splice(i, 1); UI.toast('魚を海に放した'); this.dirty = true; this.openBag(); } };
  },
  // =============== プレゼント ===============
  giftables() { const b = this.bag(); return b.fish.length + b.mikan > 0; },
  canGift(n) { const p = this.p; return p && !n.visitor && this.giftables() && !(p.daily.gifted && p.daily.gifted[n.def.id]); },
  openGift(n) {
    const b = this.bag(); this.modal = 'gift'; this.giftTo = n;
    const items = b.fish.map((f, i) => { const F = FISH.find(q => q.id === f.id); return `<button class="gi" data-gf="${i}"><span>🐟</span><b>${esc(F.name)}</b><small>${f.size}cm</small></button>`; }).join('') + (b.mikan ? `<button class="gi" data-gm="1"><span>🍊</span><b>みかん</b><small>×${b.mikan}</small></button>` : '');
    const fav = this.p.favKnown && this.p.favKnown[n.def.id] ? `<span class="isl">好きなもの：${GIFT_PREF[n.def.id].love.map(id => id === 'mikan' ? 'みかん' : (FISH.find(f => f.id === id) || {}).name).join('・')}</span>` : '<span class="isl">何が好きかな？</span>';
    this.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>${esc(n.def.name)}にプレゼント</h2>${fav}<button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div class="gifts">${items}</div></div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.journal').onclick = e => { if (e.target.closest('[data-x="close"]')) return this.closeModal(); const f = e.target.closest('[data-gf]'), m = e.target.closest('[data-gm]'); if (f) this.giveGift(n, { fish: +f.dataset.gf }); if (m) this.giveGift(n, { mikan: 1 }); };
  },
  giveGift(n, it) {
    const p = this.p, b = this.bag(), id = n.def.id, P = GIFT_PREF[id] || { love: [], like: [], loveT: 'ありがとう！', likeT: 'ありがとう！', normT: 'ありがとう！' };
    let key, name, tags = [];
    if (it.mikan) { key = 'mikan'; name = 'みかん'; tags = ['mikan']; b.mikan--; }
    else { const f = b.fish.splice(it.fish, 1)[0], F = FISH.find(q => q.id === f.id); key = f.id; name = F.name; if (F.env.some(e => e === 'sea' || e === 'harbor' || e === 'beach')) tags.push('sea'); F.env.forEach(e => tags.push(e)); if (F.st >= 3) tags.push('rare'); if (f.size >= 40) tags.push('big'); }
    const love = P.love.includes(key), like = !love && P.like.some(t => tags.includes(t)), pts = love ? 3 : like ? 2 : 1;
    p.friend[id] = (p.friend[id] || 0) + pts; p.stats.giftN++; p.daily.gifted = p.daily.gifted || {}; p.daily.gifted[id] = 1; if (love) { p.favKnown = p.favKnown || {}; p.favKnown[id] = 1; }
    this.modal = null; this.el.modal.hidden = true; this.el.modal.innerHTML = '';
    const t = this.fill((love ? P.loveT : like ? P.likeT : P.normT).replace('{X}', name));
    DIALOG.npc = n; DIALOG.pages = [t]; DIALOG.i = 0; DIALOG.choices = null; UI.dialog(n.def.name, t); n.greeted = 1.2;
    UI.toast(`🎁 ${name}をプレゼントした　なかよし +${pts}${love ? '（大好物！）' : ''}`); this.dirty = true; this.check(); this.save();
  },
  milestonePages(n) {
    const p = this.p, id = n.def.id, M = MILESTONE[id]; if (!p || !M || n.visitor) return []; p.mile = p.mile || {};
    if (p.mile[id] || (p.friend[id] || 0) < 5) return []; p.mile[id] = 1; const b = this.bag();
    if (M.rod) { if (this.rodLv() < M.rod) { p.items.rodLv = M.rod; setTimeout(() => UI.toast(`🎣 ${RODS[M.rod].name}をもらった！`), 500); } else { p.money += 3000; setTimeout(() => UI.toast('💰 お礼に3,000円もらった！'), 500); } }
    else { b.decor[M.decor] = (b.decor[M.decor] || 0) + M.n; const d = DECOR.find(q => q.id === M.decor); setTimeout(() => UI.toast(`🎁 ${d.name}${M.n > 1 ? '×' + M.n : ''}をもらった！（しまづくりの「かざる」で置けます）`), 500); }
    this.dirty = true; return [this.fill(M.t)];
  },
  // =============== かざり (decor placement) ===============
  refreshDecor() {
    if (!DECO.group) { DECO.group = new THREE.Group(); scene.add(DECO.group); }
    while (DECO.group.children.length) DECO.group.remove(DECO.group.children[0]);
    DECO.track.forEach(c => c.off = true); DECO.track = []; DECO.spin = [];
    for (const d of ((this.p && this.p.decor) || [])) this.addDecorMesh(d);
  },
  addDecorMesh(d) {
    const g = makeDecor(d.id); g.position.set(d.x, groundH(d.x, d.z), d.z); g.rotation.y = d.rot; g.userData.d = d; DECO.group.add(g);
    const D = DECOR.find(q => q.id === d.id); const c = D.r ? { x: d.x, z: d.z, r: D.r, kind: 'pole' } : { x: d.x, z: d.z, hw: D.box[0], hd: D.box[1], rot: d.rot, kind: 'pole' }; addCollider(c); DECO.track.push(c); g.userData.c = c;
  },
  decorPlanAt(p) {
    const id = EDIT.decorId, D = DECOR.find(q => q.id === id); if (!D || !p) return null; const rot = EDIT.dRot || 0, R = D.r || Math.max(D.box[0], D.box[1]);
    let err = null;
    if (!GAME.openAt(p.x, p.z)) err = GAME.lockText(p.x, p.z);
    else if (groundH(p.x, p.z) < 0.4 || waterDepthAt(p.x, p.z) > 0) err = '水の上には置けません';
    else if (roadDistAt(p.x, p.z) < 3.0 + R * 0.5) err = '道路の上には置けません';
    else if (deckY(p.x, p.z) !== null) err = '橋の上には置けません';
    else if (collidersNear(p.x, p.z).some(c => !c.off && c.kind !== 'tree' && hitsCollider(c, p.x, p.z, R * 0.9))) err = 'ほかの物に近すぎます';
    return { id, x: p.x, z: p.z, rot, ok: !err, err };
  },
  decorPreview(p) {
    const id = EDIT.decorId;
    if (EDIT.decorRemove) { if (DECO.ghost) DECO.ghost.visible = false; const hit = p && this.decorAt(p); DECO.hover = hit; DECO.group && DECO.group.children.forEach(g => g.traverse(o => { if (o.isMesh && o.userData.base === undefined) o.userData.base = o.material; if (o.isMesh) o.material = g === hit ? DECO_RED : o.userData.base; })); this.setHint(hit ? 'クリックでしまいます' : '片づけたいかざりをクリック'); return; }
    if (DECO.group) DECO.group.children.forEach(g => g.traverse(o => { if (o.isMesh && o.userData.base) o.material = o.userData.base; }));
    if (!id) { if (DECO.ghost) DECO.ghost.visible = false; this.setHint('置きたいかざりをえらんでね（商店で買えます）'); return; }
    if (DECO.ghostId !== id) { if (DECO.ghost) scene.remove(DECO.ghost); DECO.ghost = makeDecor(id); DECO.ghost.traverse(o => { if (o.isMesh) { o.material = DECO_GHOST; o.castShadow = false; } }); DECO.ghostId = id; scene.add(DECO.ghost); }
    const plan = this.decorPlanAt(p); if (!plan) { DECO.ghost.visible = false; return; }
    DECO.ghost.visible = true; DECO.ghost.position.set(plan.x, groundH(plan.x, plan.z) + 0.02, plan.z); DECO.ghost.rotation.y = plan.rot; DECO_GHOST.color.set(plan.ok ? '#7cf0a0' : '#ff6f6f');
    this.setHint(plan.ok ? `クリックで「${DECOR.find(q => q.id === id).name}」を置く（R で回す）` : '⚠ ' + plan.err);
  },
  setHint(t) { if (EDIT._dh !== t) { EDIT._dh = t; UI.editHint(); } },
  decorAt(p) { let best = null, bd = 1.8; for (const g of (DECO.group ? DECO.group.children : [])) { const d = g.userData.d, dd = Math.hypot(d.x - p.x, d.z - p.z); if (dd < bd) { bd = dd; best = g; } } return best; },
  decorClick(p) {
    const b = this.bag();
    if (EDIT.decorRemove) { const g = this.decorAt(p); if (!g) { UI.toast('かざりの近くをクリックしてね'); return; } const d = g.userData.d; this.p.decor.splice(this.p.decor.indexOf(d), 1); b.decor[d.id] = (b.decor[d.id] || 0) + 1; g.userData.c.off = true; DECO.group.remove(g); UI.toast(`${DECOR.find(q => q.id === d.id).name}をしまった`); this.dirty = true; UI.editPanel(); return; }
    const plan = this.decorPlanAt(p); if (!plan) { UI.toast('置きたいかざりをえらんでね'); return; } if (!plan.ok) { UI.toast(plan.err); return; }
    if (!(b.decor[plan.id] > 0)) { UI.toast('このかざりはもう持っていません（商店で買えます）'); return; }
    b.decor[plan.id]--; const d = { id: plan.id, x: plan.x, z: plan.z, rot: plan.rot }; this.p.decor = this.p.decor || []; this.p.decor.push(d); this.addDecorMesh(d);
    if (VEG.removeAt(d.x, d.z, 1.6)) VEG.refresh(d.x - 2, d.z - 2, d.x + 2, d.z + 2);
    this.p.stats.decorN++; this.dirty = true; this.check(); if (!(b.decor[plan.id] > 0)) EDIT.decorId = null; UI.editPanel();
  },
  decorSub() {
    const b = this.bag(), own = DECOR.filter(d => b.decor[d.id] > 0);
    return `<div class="seg">${own.map(d => `<button data-dc="${d.id}" class="${EDIT.decorId === d.id && !EDIT.decorRemove ? 'on' : ''}">${DECO_ICON[d.id]} ${d.name} ×${b.decor[d.id]}</button>`).join('') || '<span class="small">かざりを持っていません（商店で買えます）</span>'}</div><button data-dc="__rm" class="${EDIT.decorRemove ? 'on' : ''}">しまう</button>`;
  },
  updateDecor(dt) { for (const s of DECO.spin) s.rotation.z += dt * 1.6; },
});
const DECO_ICON = { pot: '🪴', flowerbed: '🌷', bench: '🪑', postbox: '📮', lamp: '💡', parasol: '⛱️', lantern: '🏮', vending: '🥤', swing: '🎠', slide: '🛝', windmill: '🌬️', fountain: '⛲' };
const DECO_GHOST = new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.5, depthWrite: false, fog: false });
const DECO_RED = new THREE.MeshBasicMaterial({ color: '#ff6f6f', transparent: true, opacity: 0.75, depthWrite: false, fog: false });
function makeDecor(id) {
  const g = new THREE.Group(), add = m => { g.add(m); return m; }, M = (c, r = 0.6, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, extra));
  if (id === 'pot') { add(cylM(0.26, 0.2, 0.42, M('#b8643a', 0.85), 0, 0.21, 0, 14)); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), M('#4f8f3a', 0.9)); b.position.y = 0.66; b.scale.y = 0.9; b.castShadow = true; add(b); for (let k = 0; k < 5; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), MAT.flowers[k % 5]); f.position.set(Math.cos(k * 1.3) * 0.26, 0.78 + (k % 2) * 0.1, Math.sin(k * 1.3) * 0.26); add(f); } }
  if (id === 'flowerbed') { add(box(2.0, 0.3, 0.9, MAT.stone, 0, 0.15, 0)); add(box(1.84, 0.06, 0.74, MAT.soil, 0, 0.31, 0)); for (let k = 0; k < 14; k++) { const x = -0.8 + (k % 7) * 0.27, z = -0.2 + Math.floor(k / 7) * 0.4; add(box(0.03, 0.32, 0.03, MAT.leafy, x, 0.48, z)); const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), MAT.flowers[(k * 3) % 5]); f.position.set(x, 0.66, z); add(f); } }
  if (id === 'bench') benchGeo(g, 0, 0, 0, 0);
  if (id === 'postbox') { const red = M('#d8282f', 0.45); add(cylM(0.26, 0.26, 1.0, red, 0, 0.6, 0, 18)); const top = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 8, 0, 6.3, 0, Math.PI / 2), red); top.position.y = 1.1; add(top); add(box(0.3, 0.04, 0.06, MAT.black, 0, 0.95, 0.25)); add(cylM(0.3, 0.3, 0.1, MAT.concrete, 0, 0.05, 0, 18)); }
  if (id === 'lamp') { add(cylM(0.06, 0.09, 3.4, MAT.darkframe, 0, 1.7, 0, 8)); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.4, 8), MAT.darkframe); hd.position.y = 3.55; add(hd); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), MAT.lamp); bulb.position.y = 3.35; add(bulb); }
  if (id === 'parasol') { add(cylM(0.03, 0.03, 2.3, MAT.metal, 0, 1.15, 0, 8)); const top = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.5, 12, 1, true), new THREE.MeshStandardMaterial({ map: (() => { const [c, x] = cvs(128, 32); for (let j = 0; j < 12; j++) { x.fillStyle = j % 2 ? '#ffffff' : '#ff7a5a'; x.fillRect(j * 128 / 12, 0, 128 / 12 + 1, 32); } return toTex(c, false); })(), side: THREE.DoubleSide, roughness: 0.7 })); top.position.y = 2.3; top.castShadow = true; add(top);
    add(cylM(0.5, 0.5, 0.05, MAT.white, 0, 0.72, 0, 20)); add(cylM(0.04, 0.04, 0.7, MAT.metal, 0, 0.36, 0, 6)); for (const a of [0, Math.PI]) { const ch = new THREE.Group(); ch.add(box(0.42, 0.05, 0.42, MAT.white, 0, 0.44, 0)); ch.add(box(0.42, 0.45, 0.05, MAT.white, 0, 0.68, -0.2)); ch.position.set(Math.sin(a) * 0.85, 0, Math.cos(a) * 0.85); ch.rotation.y = a + Math.PI; g.add(ch); } }
  if (id === 'lantern') { const st = MAT.stone; add(box(0.6, 0.2, 0.6, st, 0, 0.1, 0)); add(cylM(0.12, 0.15, 0.7, st, 0, 0.55, 0, 8)); add(box(0.55, 0.12, 0.55, st, 0, 0.96, 0)); const fire = box(0.4, 0.38, 0.4, st, 0, 1.21, 0); add(fire); const lt = box(0.24, 0.22, 0.42, MAT.lamp, 0, 1.21, 0); add(lt); const roof = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.34, 4), st); roof.rotation.y = Math.PI / 4; roof.position.y = 1.57; roof.castShadow = true; add(roof); const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), st); tip.position.y = 1.78; add(tip); }
  if (id === 'vending') { add(box(0.95, 1.85, 0.75, M('#d8282f', 0.45), 0, 0.93, 0)); add(box(0.75, 0.9, 0.02, MAT.lamp, 0, 1.25, 0.38)); for (let k = 0; k < 6; k++) add(box(0.08, 0.06, 0.03, MAT.white, -0.28 + k * 0.11, 0.7, 0.39)); add(box(0.4, 0.16, 0.05, MAT.black, 0, 0.3, 0.38)); }
  if (id === 'swing') { const fr = M('#e8a03a', 0.5); for (const s of [-1, 1]) { const a = box(0.08, 2.3, 0.08, fr, s * 1.25, 1.1, 0.4); a.rotation.x = 0.22; add(a); const b = box(0.08, 2.3, 0.08, fr, s * 1.25, 1.1, -0.4); b.rotation.x = -0.22; add(b); } add(cylM(0.05, 0.05, 2.6, fr, 0, 2.2, 0, 8)).rotation.z = Math.PI / 2;
    for (const x of [-0.55, 0.55]) { for (const s of [-0.22, 0.22]) add(cylM(0.012, 0.012, 1.7, MAT.darkframe, x + s, 1.35, 0, 4)); add(box(0.55, 0.05, 0.25, M('#3a7ad0', 0.5), x, 0.5, 0)); } }
  if (id === 'slide') { const fr = M('#3a9a5a', 0.5), sl = M('#f2c230', 0.35); add(box(1.0, 0.08, 1.0, fr, 0, 1.5, -1.0)); for (const a of [-0.45, 0.45]) for (const b of [-1.45, -0.55]) add(box(0.08, 1.55, 0.08, fr, a, 0.77, b)); for (let k = 0; k < 5; k++) add(box(0.7, 0.05, 0.12, fr, 0, 0.3 * (k + 1), -1.55 - k * 0.0)); const s = box(0.7, 0.06, 2.4, sl, 0, 0.8, 0.55); s.rotation.x = 0.62; add(s); for (const a of [-0.36, 0.36]) { const r = box(0.05, 0.16, 2.4, sl, a, 0.9, 0.55); r.rotation.x = 0.62; add(r); } }
  if (id === 'windmill') { const wd = M('#f4efe2', 0.7); const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, 2.6, 8), wd); tw.position.y = 1.3; tw.castShadow = true; add(tw); const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.6, 8), M('#c8503a', 0.6)); cap.position.y = 2.9; add(cap); add(box(0.3, 0.5, 0.05, MAT.darkwood, 0, 0.3, 0.47));
    const hub = new THREE.Group(); hub.position.set(0, 2.45, 0.42); for (let k = 0; k < 4; k++) { const bl = box(0.26, 1.15, 0.03, M('#ffffff', 0.6), 0, 0.62, 0); const arm = new THREE.Group(); arm.add(bl); arm.rotation.z = k * Math.PI / 2; hub.add(arm); } hub.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), MAT.darkframe)); g.add(hub); g.userData.spin = hub; }
  if (id === 'fountain') { const st = MAT.stone; const base = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.55, 0.45, 28), st); base.position.y = 0.22; base.castShadow = base.receiveShadow = true; add(base); const wat = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.04, 28), new THREE.MeshStandardMaterial({ color: '#6ec8e8', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.85 })); wat.position.y = 0.4; add(wat);
    add(cylM(0.18, 0.26, 1.1, st, 0, 0.9, 0, 12)); const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.3, 0.2, 18), st); bowl.position.y = 1.45; add(bowl); const jet = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#dff4ff', transparent: true, opacity: 0.45, side: THREE.DoubleSide, roughness: 0.1 })); jet.position.y = 1.5; jet.rotation.x = Math.PI; add(jet); const top = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.7 })); top.position.y = 1.95; add(top); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  if (g.userData.spin) DECO.spin.push(g.userData.spin);
  return g;
}
GAME.econRecs = function (C) {
  const p = this.p, b = this.bag();
  if (!p.stats.shipped && (b.fish.length || b.mikan)) C.push({ pri: 72, icon: '📦', text: '釣った魚やとったみかんは、港の「漁協 出荷所」で売るとお金になります。', at: DECO.ship ? { x: DECO.ship.x, z: DECO.ship.z } : null });
  if (p.money >= 300 && !(p.decor || []).length && !Object.values(b.decor).some(n => n > 0)) C.push({ pri: 60, icon: '🛍️', text: `お金が${yen(p.money)}たまっています。商店で、島に置けるかざり（ベンチや花壇）が買えますよ。`, at: DECO.shop ? { x: DECO.shop.x, z: DECO.shop.z } : null });
  if (Object.values(b.decor).some(n => n > 0)) C.push({ pri: 58, icon: '🪑', text: 'まだ置いていないかざりがあります。しまづくり（B）の「🪑 かざる」で好きな所に置いてね。' });
  const near = VILLAGER_DEF.find(v => MILESTONE[v.id] && !(p.mile && p.mile[v.id]) && (p.friend[v.id] || 0) >= 3 && (p.friend[v.id] || 0) < 5);
  if (near) C.push({ pri: 46, icon: '💝', text: `${near.name}さんが、{P}さんにお礼をしたいと話していました。もう少しなかよくなると…？（魚やみかんのプレゼントがおすすめ）` });
  if (!p.stats.giftN && this.giftables()) C.push({ pri: 50, icon: '🎁', text: '住民に話しかけると、魚やみかんをプレゼントできます。好きなものをあげると、とても喜びますよ。' });
};
