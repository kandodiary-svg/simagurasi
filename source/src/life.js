// ===================== 島の暮らし: 新しい住民と家づくり・釣り・みかん収穫 =====================
const NEWCOMERS = [
  { id: 'v_nagi', name: 'ナギ', lv: 2, style: 'modern', who: '釣りが大好きな女の子',
    hello: 'こんにちは！ ナギです。この島の海、すっごく魚がいそう！', ask: '{I}島、気に入っちゃった。家があったら、ここに住みたいな…。{P}さん、しまづくりで家を建ててくれない？', wait: '家、楽しみにしてるね！ 釣りざおの手入れしておかなきゃ。', thanks: '{P}さん、家をありがとう！ 今日から{I}島の住民です！',
    lines: ['港の防波堤、夕方はよく釣れるんだよ！', '川ではアユが釣れるんだって。', '大物を釣ったら、いちばんに{P}さんに見せるね！', '夜の海はメバルやイカがねらい目！'],
    opin: { like: { sea: '海のことなら大賛成！', quiet: 'のんびり釣りができそう！' }, dislike: { light: '明るすぎると魚がにげちゃうかも…' }, neutral: 'わたしはどっちでもいいよ！' } },
  { id: 'v_takumi', name: 'タクミ', lv: 3, style: 'minka', who: '大工の見習い',
    hello: 'どうも、タクミっす。大工の見習いをしてます。', ask: 'この島、古い家がいい感じで…住んでみたいんすよね。{P}さん、家を建ててもらえませんか？', wait: '家ができたら、まわりの柵とか直しますよ！', thanks: '家、最高っす！ これから島のこと、なんでも手伝いますよ！',
    lines: ['瓦屋根っていいっすよね。', '集会所の柱、いい木を使ってるんすよ。', '道を作るなら、ゆるい坂がいいっす。', '{P}さんの家も、いつか手入れさせてください！'],
    opin: { like: { road: '道づくりなら手伝います！', tradition: '昔ながらのものはいいっすね！', community: 'みんなの場所、作りがいがあるっす！' }, dislike: { event: 'にぎやかすぎるのは、ちょっと…' }, neutral: 'どれでも、作るのは手伝いますよ。' } },
  { id: 'v_yuki', name: 'ユキ', lv: 4, style: 'modern', who: '絵をかくお姉さん',
    hello: 'はじめまして、ユキといいます。島の景色を絵にかいて回っているの。', ask: 'こんなにきれいな島、はじめて。ここに住んで、毎日絵をかきたいわ。家を建ててもらえるかしら？', wait: '新しい家の窓から見える景色、楽しみ。', thanks: 'すてきな家をありがとう。{I}島の絵、たくさんかくわね。',
    lines: ['夕日の浜の色、絵の具じゃなかなか出せないの。', '灯台と海の組み合わせ、大好き。', '{P}さんの作った道も、絵にかいたのよ。', '雨の日の島は、水彩画みたい。'],
    opin: { like: { scenery: 'きっと絵になる景色ね。', culture: '島の文化が育つのはすてき。', nature: '花や木がふえるのはうれしいわ。' }, dislike: { shop: 'お店ばかりになるのは、少しさびしいかも。' }, neutral: 'どちらもいいと思うわ。' } },
  { id: 'v_kota', name: 'コタロウ', lv: 6, style: 'modern', who: '元気いっぱいの男の子',
    hello: 'オレ、コタロウ！ 家族で島に引っこしてきたいんだ！', ask: 'この島、探検するところがいっぱい！ {P}にいちゃん（ねえちゃん）、家をつくってよ！', wait: 'まだかなー、新しい家！', thanks: 'やったー！ 今日からここがオレの家だ！',
    lines: ['はなれ小島まで泳いでいけるかな？', '展望台からぜんぶ見えるかな？', '虫とりもしたいなー！', '{P}にいちゃん（ねえちゃん）、競争しよ！'],
    opin: { like: { event: 'おまつりみたいで楽しそう！', fun: 'おもしろそう！', community: 'みんなで遊べる！' }, dislike: { quiet: 'えー、たいくつそう…' }, neutral: 'どっちでもいいよ！' } },
];
NEWCOMERS.forEach(c => { OPIN[c.id] = c.opin; });
const HOUSE_STYLES = { minka: '和風の家', modern: '洋風の家' };
const ROOF_OPTS = [['いぶし瓦', () => MAT.kawara], ['赤い瓦', () => MAT.kawaraRed], ['青い屋根', () => MAT.metalRoof[0]], ['緑の屋根', () => MAT.metalRoof[2]]];
const WALL_OPTS = [['白', () => MAT.plaster], ['クリーム', () => MAT.pButter], ['水色', () => MAT.plasterBlue], ['ピンク', () => MAT.pPink]];
// ---------- fish ----------
const FISH = [
  { id: 'aji', name: 'アジ', env: ['sea', 'harbor'], st: 1, sz: [15, 30], note: '群れで泳ぐ、島の定番の魚。' },
  { id: 'kasago', name: 'カサゴ', env: ['sea', 'harbor'], st: 1, sz: [12, 28], note: '岩のすきまにかくれている、トゲのある魚。' },
  { id: 'fugu', name: 'クサフグ', env: ['sea', 'harbor', 'beach'], st: 1, sz: [8, 15], note: 'つり上げるとプクッとふくらむ。食べちゃだめ！' },
  { id: 'kisu', name: 'キス', env: ['beach'], st: 1, sz: [12, 25], time: 'day', note: '砂浜の近くにいる、きれいな魚。' },
  { id: 'haze', name: 'ハゼ', env: ['beach', 'river'], st: 1, sz: [8, 18], note: '川が海に注ぐあたりにいる。' },
  { id: 'mebaru', name: 'メバル', env: ['sea', 'harbor', 'offshore'], st: 2, sz: [15, 28], time: 'night', note: '目が大きい。夜によく釣れる。' },
  { id: 'sayori', name: 'サヨリ', env: ['sea', 'harbor'], st: 2, sz: [20, 35], time: 'day', note: '下あごが長い、細長い魚。' },
  { id: 'karei', name: 'メイタガレイ', env: ['sea', 'beach', 'offshore'], st: 2, sz: [15, 30], note: '瀬戸内の名物。平べったい。' },
  { id: 'tako', name: 'マダコ', env: ['harbor'], st: 2, sz: [20, 60], note: '港の岸壁にひそんでいる。' },
  { id: 'chinu', name: 'クロダイ（チヌ）', env: ['harbor'], st: 3, sz: [25, 50], note: '用心深い港の主。' },
  { id: 'suzuki', name: 'スズキ', env: ['harbor', 'beach'], st: 3, sz: [35, 80], note: '大きくなると名前が変わる出世魚。' },
  { id: 'ika', name: 'アオリイカ', env: ['sea', 'harbor', 'offshore'], st: 3, sz: [20, 45], time: 'night', note: '夜の海で光るように泳ぐ。' },
  { id: 'madai', name: 'マダイ', env: ['sea', 'offshore'], st: 4, sz: [30, 70], note: '海の女王。沖のほうにいる。' },
  { id: 'sawara', name: 'サワラ', env: ['sea', 'offshore'], st: 4, sz: [50, 100], note: '春をつげる魚。とても速い。' },
  { id: 'kawahagi', name: 'カワハギ', env: ['offshore'], st: 2, sz: [15, 30], note: 'おちょぼ口でエサをとるのが上手。沖の岩場にいる。' },
  { id: 'aji_big', name: 'マアジ（尺アジ）', env: ['offshore'], st: 2, sz: [30, 45], note: '沖でそだった大きなアジ。30cmをこえると「尺アジ」。' },
  { id: 'hirame', name: 'ヒラメ', env: ['offshore'], st: 3, sz: [40, 85], note: '砂の海底にかくれる大きな平たい魚。カレイとは顔の向きが逆。' },
  { id: 'hamachi', name: 'ハマチ', env: ['offshore'], st: 3, sz: [40, 75], note: 'ブリの若い魚。群れで沖を走る。' },
  { id: 'tachiuo', name: 'タチウオ', env: ['offshore'], st: 3, sz: [70, 130], time: 'night', note: '刀のように銀色に光る、とても長い魚。夜に釣れる。' },
  { id: 'akaei', name: 'アカエイ', env: ['offshore'], st: 3, sz: [40, 100], note: 'ひらひら泳ぐ大きなエイ。しっぽのトゲに注意。' },
  { id: 'buri', name: 'ブリ', env: ['offshore'], st: 4, sz: [75, 110], note: '出世魚の最後の名前。沖の大物の代表。' },
  { id: 'kue', name: 'クエ', env: ['offshore'], st: 4, sz: [60, 120], note: '岩かげにひそむ、まぼろしの大魚。めったに釣れない。' },
  { id: 'oikawa', name: 'オイカワ', env: ['river'], st: 1, sz: [8, 15], time: 'day', note: '川の浅瀬でキラキラ光る。' },
  { id: 'ayu', name: 'アユ', env: ['river'], st: 2, sz: [15, 25], time: 'day', note: 'すいかのような香りがする川の魚。' },
  { id: 'mokuzu', name: 'モクズガニ', env: ['river'], st: 2, sz: [5, 9], note: 'はさみに毛が生えたカニ。（大きさは甲羅）' },
  { id: 'unagi', name: 'ウナギ', env: ['river'], st: 4, sz: [40, 90], time: 'night', note: '夜の川にあらわれる、なぞの多い魚。' },
  { id: 'medaka', name: 'メダカ', env: ['pond'], st: 1, sz: [3, 4], note: '小さな池にすむ、小さな魚。' },
  { id: 'funa', name: 'フナ', env: ['pond', 'river'], st: 1, sz: [10, 30], note: '池や川ののんびり屋。' },
  { id: 'dojo', name: 'ドジョウ', env: ['pond'], st: 1, sz: [8, 15], note: 'にょろにょろ。ひげがある。' },
  { id: 'koi', name: 'コイ', env: ['pond', 'river'], st: 3, sz: [30, 80], note: '大きくて力が強い。' },
  { id: 'namazu', name: 'ナマズ', env: ['pond'], st: 3, sz: [30, 70], time: 'night', note: '夜の池の主。' },
];
const ENV_NAME = { sea: '海', harbor: '港', beach: '浜辺', river: '川', pond: '池', offshore: '沖（船から）' };
const LIFE = { group: null, track: [], fish: null, rod: null, ghost: null };
DAILY_POOL.push(
  { id: 'fish3', who: 'v_gen', text: '魚を3匹釣る', n: 3, stat: 'fishN', need: p => p.items && p.items.rod, ask: 'わしのやった釣りざおで、魚を3匹ほど釣ってみんか。' },
  { id: 'mikan5', who: 'v_kai', text: 'みかんを5こ収穫する', n: 5, stat: 'mikanN', ask: 'みかん畑のみかん、5こくらいとってきてくれない？' },
  { id: 'fishRiver', who: 'v_mio', text: '川か池で魚を1匹釣る', n: 1, stat: 'fishFresh', need: p => p.items && p.items.rod, ask: '川の魚って見たことないんだ。1匹釣って見せて！' });
GOALS.push(
  { id: 'fish1', text: 'はじめて魚を釣る', n: 1, stat: 'fishN', pts: 20 },
  { id: 'zukan10', text: '魚図鑑に10種類のせる', n: 10, prog: () => Object.keys(GAME.p.fish || {}).length, pts: 30 },
  { id: 'bigfish', text: '50cm以上の大物を釣る', n: 1, prog: () => Object.values(GAME.p.fish || {}).some(f => f.max >= 50) ? 1 : 0, pts: 25 },
  { id: 'mikan30', text: 'みかんを30こ収穫する', n: 30, stat: 'mikanN', pts: 20 },
  { id: 'move1', text: '新しい住民をむかえる', n: 1, stat: 'movedN', pts: 30 },
  { id: 'move4', text: '新しい住民を4人むかえる', n: 4, stat: 'movedN', pts: 50 });
STAT_KEYS.push('fishN', 'fishFresh', 'mikanN', 'movedN');
TOOLS.push({ id: 'house', name: '家を建てる', icon: '🏠', hint: '島に住みたい人のために家を建てます。場所をクリックして「建てる」', brush: false });

Object.assign(GAME, {
  // =============== newcomers ===============
  newc() { const p = this.p; p.newc = p.newc || {}; return p.newc; },
  houseFor() { const N = this.p ? this.newc() : {}; const c = NEWCOMERS.find(c => N[c.id] && N[c.id].state === 'visit'); return c || null; },
  checkNewcomers() {
    const p = this.p; if (!p) return; const N = this.newc(), lv = this.level();
    if (NEWCOMERS.some(c => N[c.id] && N[c.id].state !== 'moved')) return;
    const c = NEWCOMERS.find(c => !N[c.id] && c.lv <= lv); if (!c) return;
    N[c.id] = { state: 'visit', since: todayKey() }; this.dirty = true; this.syncNewcomers();
    setTimeout(() => UI.toast(`👋 ${c.name}さんが島に見学に来ています（港のあたり）`), 1500);
  },
  completeHouses() {
    const N = this.newc(), moved = [];
    for (const c of NEWCOMERS) { const s = N[c.id]; if (s && s.state === 'house' && s.house.date < todayKey()) { s.state = 'moved'; this.p.stats.movedN++; this.addVit(20); moved.push(c.id); } }
    if (moved.length) this.p.justMoved = (this.p.justMoved || []).concat(moved); return moved;
  },
  syncNewcomers() {
    if (!LIFE.group) { LIFE.group = new THREE.Group(); scene.add(LIFE.group); }
    while (LIFE.group.children.length) LIFE.group.remove(LIFE.group.children[0]);
    LIFE.track.forEach(c => c.off = true); LIFE.track = [];
    for (const n of NPCS.filter(n => n.newcomer)) removeVillager(n);
    for (let i = VILLAGER_DEF.length - 1; i >= 0; i--) if (NEWCOMERS.some(c => c.id === VILLAGER_DEF[i].id)) VILLAGER_DEF.splice(i, 1);
    if (!this.p) return; const N = this.newc();
    for (const c of NEWCOMERS) {
      const s = N[c.id]; if (!s) continue;
      if (s.house) { const H = s.house; markProt(H.x, H.z, 4.6, 5.6, H.rot);
        if (s.state === 'moved') { COLL.track = LIFE.track; const g = mergeLocal(makeHouse(this.houseObj(H))); COLL.track = null; LIFE.group.add(g); }
        else LIFE.group.add(makeConstruction({ x: H.x, z: H.z })); }
      if (s.state === 'visit') { const sp = this.visitSpot(); const n = spawnOneVillager(scene, c, sp.x, sp.z, `${c.name}（見学中）`); if (n) { n.newcomer = true; n.visitor = true; } }
      else if (s.state === 'house') { const sp = this.visitSpot(); const n = spawnOneVillager(scene, c, sp.x, sp.z, `${c.name}（引っこし前）`); if (n) { n.newcomer = true; n.visitor = true; } }
      else if (s.state === 'moved') { VILLAGER_DEF.push(c); const H = s.house, fx = H.x + Math.sin(H.rot) * 7.6, fz = H.z + Math.cos(H.rot) * 7.6; const n = spawnOneVillager(scene, c, fx, fz, c.name); if (n) n.newcomer = true; }
    }
  },
  houseObj(H) { return { kind: H.style, x: H.x, z: H.z, rot: H.rot, w: 8.2, d: 6.8, y: H.y, rad: 5.2, floors: H.style === 'modern' ? 2 : 1, seed: H.seed, hip: H.style === 'minka', wallM: WALL_OPTS[H.wall][1](), roofM: ROOF_OPTS[H.roof][1]() }; },
  visitSpot() { if (this._vs) return this._vs; const Hb = this.LM.harbor; let best = { x: Hb.x, z: Hb.z };
    for (let r = 8; r < 50; r += 2) { let ok = false; for (let a = 0; a < 6.28; a += 0.4) { const x = Hb.x + Math.cos(a) * r, z = Hb.z + Math.sin(a) * r; if (groundH(x, z) > 1 && waterDepthAt(x, z) <= 0 && roadDistAt(x, z) > 5 && !collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, 1))) { best = { x, z }; ok = true; break; } } if (ok) break; }
    return (this._vs = best); },
  // talk hooks: returns pages for newcomer NPCs, or null
  newcomerPages(n) {
    if (!n.newcomer || !this.p) return null; const c = n.def, s = this.newc()[c.id], F = t => this.fill(t); if (!s) return null;
    if (s.state === 'visit') { const pg = []; if (!s.met) { pg.push(F(c.hello)); s.met = 1; this.dirty = true; } pg.push(F(c.ask) + '\n（しまづくり「🏠 家を建てる」で家を建てられます）'); return pg; }
    if (s.state === 'house') return [F(c.wait)];
    if (s.state === 'moved' && !s.thanked) { s.thanked = 1; this.dirty = true; return [F(c.thanks)]; }
    return null;
  },
  // =============== house tool ===============
  housePlan(p) {
    const c = this.houseFor(); if (!c) return { ok: false, err: '島に住みたい人が来たら、家を建てられます' };
    const nr = nearestOnRoads(p.x, p.z, 45, false); let rot = nr && nr.d > 1 ? Math.atan2(nr.x - p.x, nr.z - p.z) : (EDIT.hRot || 0); rot += (EDIT.hRotOff || 0);
    const o = { x: p.x, z: p.z, rot }, W = 8.2, D = 6.8; let mn = 1e9, mx = -1e9, sum = 0, cnt = 0, err = null;
    for (let a = -W / 2 - 1.3; a <= W / 2 + 1.31 && !err; a += 1.3) for (let b = -D / 2 - 1.3; b <= D / 2 + 3.6 && !err; b += 1.2) {
      const [x, z] = toWorld(o, a, b), [i, j] = toIdx(x, z), k = j * WORLD.n + i, h = G.H[k];
      if (Math.abs(x) > 330 || Math.abs(z) > 330) err = '島の外です';
      else if (!GAME.openK(k)) err = GAME.lockText(x, z);
      else if (G.prot[k]) err = 'ほかの建物に近すぎます';
      else if (G.roadDist[k] < 4.3) err = '道路に近すぎます（少しはなしてね）';
      else if (h < 1.0 || !isNaN(G.Wl[k])) err = '水辺や海の近くには建てられません';
      else if (collidersNear(x, z).some(q => !q.off && (q.kind === 'bld' || q.kind === 'pole') && hitsCollider(q, x, z, 0.4))) err = 'ほかの建物に近すぎます';
      mn = Math.min(mn, h); mx = Math.max(mx, h); sum += h; cnt++;
    }
    if (!err && mx - mn > 3.6) err = '坂が急すぎます（「平らに」でならしてね）';
    return { ok: !err, err, x: p.x, z: p.z, rot, y: sum / cnt, c };
  },
  housePreview(p) {
    if (!LIFE.ghost) { const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.45, depthWrite: false, fog: false });
      const b = new THREE.Mesh(new THREE.BoxGeometry(8.2, 3.2, 6.8), m); b.position.y = 1.6; g.add(b); const r = new THREE.Mesh(new THREE.ConeGeometry(4.9, 2.2, 4), m); r.rotation.y = Math.PI / 4; r.scale.z = 0.8; r.position.y = 4.3; g.add(r);
      const ar = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 12), new THREE.MeshBasicMaterial({ color: '#ffd84a', fog: false })); ar.rotation.x = Math.PI / 2; ar.position.set(0, 0.6, 6.4); g.add(ar);
      g.userData.mat = m; LIFE.ghost = g; scene.add(g); }
    const G0 = LIFE.ghost, pick = EDIT.housePick;
    const plan = pick || (p ? this.housePlan(p) : null); EDIT.housePlanNow = plan;
    if (!plan || !plan.c) { G0.visible = false; return; }
    G0.visible = true; G0.position.set(plan.x, plan.y, plan.z); G0.rotation.y = plan.rot; G0.userData.mat.color.set(plan.ok ? (pick ? '#4fd0ff' : '#7cf0a0') : '#ff6f6f');
    const hint = pick ? `ここに${plan.c.name}さんの家を建てますか？` : plan.ok ? `クリックで場所を決めます（R で向きを変える）` : '⚠ ' + plan.err;
    if (EDIT._hh !== hint) { EDIT._hh = hint; UI.editHint(); }
  },
  housePick(p) { const plan = this.housePlan(p); if (!plan.c) { UI.toast(plan.err); return; } if (!plan.ok) { UI.toast(plan.err); return; } EDIT.housePick = plan; UI.editPanel(); },
  houseBuild() {
    const pl = EDIT.housePick; if (!pl || !pl.ok) return; const c = pl.c, s = this.newc()[c.id], o = { x: pl.x, z: pl.z, rot: pl.rot };
    const [cx, cz] = toWorld(o, 0, 1.1); flattenPad(cx, cz, 5.4, 5.9, pl.rot, pl.y, 4);
    const [i0, j0] = toIdx(pl.x - 16, pl.z - 16), [i1, j1] = toIdx(pl.x + 16, pl.z + 16); refreshRegion(i0, j0, i1, j1);
    if (VEG.removeAt(cx, cz, 8)) VEG.refresh(cx - 9, cz - 9, cx + 9, cz + 9);
    s.state = 'house'; s.house = { x: pl.x, z: pl.z, rot: pl.rot, y: pl.y + 0.05, style: EDIT.hStyle || c.style, roof: EDIT.hRoof || 0, wall: EDIT.hWall || 0, seed: Math.floor(Math.random() * 1e6), date: todayKey() };
    EDIT.undo = []; EDIT.housePick = null; scheduleSave(); this.dirty = true; this.save(); this.syncNewcomers(); this.renderTracker();
    UI.toast(`🏠 ${c.name}さんの家の工事がはじまりました。明日完成して引っこしてきます！`); setTool('raise');
  },
  houseSub() {
    const pk = EDIT.housePick, st = EDIT.hStyle || (this.houseFor() || {}).style || 'minka';
    const seg = (key, opts, cur) => `<div class="seg">${opts.map(([v, n]) => `<button data-hs="${key}:${v}" class="${String(cur) === String(v) ? 'on' : ''}">${n}</button>`).join('')}</div>`;
    return seg('style', Object.entries(HOUSE_STYLES), st) + seg('roof', ROOF_OPTS.map((r, i) => [i, r[0]]), EDIT.hRoof || 0) + seg('wall', WALL_OPTS.map((r, i) => [i, r[0]]), EDIT.hWall || 0) +
      (pk ? `<button class="act" data-a="hbuild">ここに建てる</button><button data-a="hcancel">えらびなおす</button>` : '');
  },
  // =============== fishing ===============
  fishing() { return !!LIFE.fish; },
  fishEnv(x, z) {
    const g = groundH(x, z), L = waterLevelAt(G, x, z);
    if (!isNaN(L) && L > g + 0.2) { const rp = G.river && G.river.pts; let near = false; if (rp) for (let k = 0; k < rp.length; k += 2) if (Math.hypot(rp[k][0] - x, rp[k][1] - z) < 14) { near = true; break; } return { env: near ? 'river' : 'pond', y: L }; }
    if (g < -0.3) { const H = this.LM.harbor, B = this.LM.beach; if (Math.hypot(x - H.x, z - H.z) < 75) return { env: 'harbor', y: 0 }; if (B && Math.hypot(x - B.x, z - B.z) < 60) return { env: 'beach', y: 0 }; if (G.river && Math.hypot(x - B.x, z - B.z) < 30) return { env: 'beach', y: 0 }; return { env: g < -4 ? 'sea' : (Math.random() < 0.5 ? 'beach' : 'sea'), y: 0 }; }
    return null;
  },
  fishKey() {
    const F = LIFE.fish;
    if (!F) {
      if (!this.p || EDIT.on) return false;
      if (PL.veh) { if (PL.veh.kind !== 'boat') return false; if (!this.p.items || !this.p.items.rod) { UI.toast('釣りざおを持っていません（ゲンじいに話しかけてみよう）'); return true; } return this.boatCast(PL.veh); }
      if (!this.p.items || !this.p.items.rod) { UI.toast('釣りざおを持っていません（ゲンじいに話しかけてみよう）'); return true; }
      const fx = Math.sin(PL.rot), fz = Math.cos(PL.rot); let t = null;
      for (let d = 2.5; d <= 11; d += 0.5) { const x = PL.x + fx * d, z = PL.z + fz * d, e = this.fishEnv(x, z); if (e) { const d2 = Math.min(d + 2, 11), x2 = PL.x + fx * d2, z2 = PL.z + fz * d2, e2 = this.fishEnv(x2, z2) || e; t = { x: e2 === e ? x : x2, z: e2 === e ? z : z2, y: e2.y, env: e2.env }; break; } }
      if (!t) { UI.toast('水のほうを向いて F キーで釣りができます'); return true; }
      this.startCast(t); return true;
    }
    if (F.st === 'bite') { this.catchFish(); return true; }
    if (F.st === 'wait' && F.nib > 0) { this.endFish('早すぎた！ 魚がにげちゃった…'); return true; }
    if (F.st === 'wait' || F.st === 'cast') { this.endFish(); return true; }
    return true;
  },
  boatCast(v) {
    if (Math.abs(v.v) > 1.2) { UI.toast('船を止めてから釣ろう（S でブレーキ）'); return true; }
    v.v = 0; const dir = new THREE.Vector3(); camera.getWorldDirection(dir); let a0 = Math.atan2(dir.x, dir.z); let t = null;
    for (const da of [0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6, 2.4, -2.4, Math.PI]) { const a = a0 + da; for (const d of [8, 6.5, 5]) { const x = v.x + Math.sin(a) * d, z = v.z + Math.cos(a) * d; if (groundH(x, z) < -0.6 && waterDepthAt(x, z) <= 0.01 || groundH(x, z) < -0.6) { t = { x, z, y: 0, a }; break; } } if (t) break; }
    if (!t) { UI.toast('ここでは糸をたらせないよ'); return true; }
    let land = 99; for (const r of [10, 18, 26, 34]) { for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; if (groundH(v.x + Math.cos(a) * r, v.z + Math.sin(a) * r) > -0.2) { land = r; break; } } if (land < 99) break; }
    const e = land >= 34 ? { env: 'offshore' } : (this.fishEnv(t.x, t.z) || { env: 'sea' }); t.env = e.env === 'river' || e.env === 'pond' ? 'sea' : e.env; t.boat = true; t.far = land >= 34;
    this.startCast(t); LIFE.fish.rot = v.rot; UI.toast(t.far ? '🎣 沖で釣りスタート！ 大物のチャンス' : '🎣 船から釣りスタート'); return true;
  },
  startCast(t) {
    if (!LIFE.rod) {
      const rod = new THREE.Group(), rm = new THREE.MeshStandardMaterial({ color: '#3a2a1e', roughness: 0.5 }); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.02, 1.9, 6), rm); pole.position.y = 0.95; rod.add(pole);
      const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 10), MAT.metal); reel.rotation.z = Math.PI / 2; reel.position.y = 0.25; rod.add(reel); rod.rotation.x = 0.95; rod.position.set(-0.2, 0.5, 0.18); rod.userData.tip = new THREE.Vector3(0, 1.9, 0);
      const bob = new THREE.Group(); const top = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8, 0, 6.3, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e8302a', roughness: 0.4 })); const bot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8, 0, 6.3, Math.PI / 2, Math.PI / 2), MAT.white); bob.add(top, bot);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 10 }, () => new THREE.Vector3())), new THREE.LineBasicMaterial({ color: '#f4f4f0', transparent: true, opacity: 0.8 })); line.frustumCulled = false;
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 24), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2;
      const ex = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const [c, x] = cvs(64, 64); x.fillStyle = '#ff4f3a'; x.font = '900 56px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('!', 32, 34); return toTex(c, false); })(), depthTest: false, fog: false })); ex.scale.set(0.5, 0.5, 1); ex.renderOrder = 40;
      LIFE.rod = { rod, bob, line, ring, ex }; scene.add(bob, line, ring, ex);
    }
    const R = LIFE.rod; PL.mesh.add(R.rod); R.rod.visible = R.bob.visible = R.line.visible = true; R.ex.visible = false;
    LIFE.fish = { st: 'cast', t: 0, tgt: t, wait: 3 + Math.random() * 7, nibT: [], nib: 0 };
    const nn = Math.floor(Math.random() * 3); for (let k = 0; k < nn; k++) LIFE.fish.nibT.push(1 + Math.random() * (LIFE.fish.wait - 1.5));
  },
  endFish(msg) { const F0 = LIFE.fish; if (F0 && F0.tgt && F0.tgt.boat && PL.veh) { PL.x = PL.veh.x; PL.z = PL.veh.z; PL.rot = PL.veh.rot; } const R = LIFE.rod; if (R) { PL.mesh.remove(R.rod); R.bob.visible = R.line.visible = R.ex.visible = false; R.ring.material.opacity = 0; } LIFE.fish = null; if (msg) UI.toast(msg); },
  pickFish(env, boat = 0) {
    const hf = currentHour(), night = hf >= 19 || hf < 5, pool = FISH.filter(f => (f.env.includes(env) || (boat && env !== 'offshore' && f.env.includes('offshore') && f.st >= 3 && Math.random() < 0.5)) && (!f.time || (f.time === 'night') === night));
    const rr = RODS[this.rodLv()].rare, W = boat === 2 ? { 1: 14, 2: 22, 3: 17 * rr, 4: 5 * rr } : boat === 1 ? { 1: 26, 2: 22, 3: 11 * rr, 4: 4 * rr } : { 1: 40, 2: 18, 3: 7 * rr, 4: 2.5 * rr }; let tot = 0; pool.forEach(f => tot += W[f.st]); let r = Math.random() * tot; for (const f of pool) { r -= W[f.st]; if (r <= 0) return f; } return pool[0];
  },
  catchFish() {
    const F = LIFE.fish, f = F.fish, p = this.p; const u = Math.pow(Math.random(), (this.rodLv() >= 3 ? 1.1 : 1.8) * (F.tgt.boat ? (F.tgt.far ? 0.5 : 0.7) : 1)), size = Math.round(f.sz[0] + (f.sz[1] - f.sz[0]) * u);
    p.fish = p.fish || {}; const rec = p.fish[f.id], first = !rec; p.fish[f.id] = { n: (rec ? rec.n : 0) + 1, max: Math.max(rec ? rec.max : 0, size) };
    p.stats.fishN++; if (F.tgt.env === 'river' || F.tgt.env === 'pond') p.stats.fishFresh++;
    const b = this.bag(), full = b.fish.length >= FISH_CAP; if (!full) b.fish.push({ id: f.id, size });
    this.endFish(); this.showCatch(f, size, first, rec && size > rec.max, full); this.dirty = true; this.check();
  },
  showCatch(f, size, first, best, full) {
    const el = this.el.catch; el.innerHTML = `<div class="ct">${first ? '<span class="new">はじめて！</span>' : best ? '<span class="new">自己ベスト！</span>' : ''}<b>${esc(f.name)}</b>を釣った！</div><div class="cs">${size}cm　${'★'.repeat(f.st)}<span class="dim">${'★'.repeat(4 - f.st)}</span></div><div class="cn">${esc(f.note)}</div><div class="cp">${full ? 'クーラーボックスがいっぱいなので放した（出荷所で売ろう）' : `クーラーボックスへ（出荷すると ${yen(this.fishPrice(f.id, size))}）`}</div>`;
    el.hidden = false; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); clearTimeout(this._ct); this._ct = setTimeout(() => el.hidden = true, 3200);
  },
  updateFishing(dt) {
    const F = LIFE.fish; if (!F) return; const R = LIFE.rod, t0 = F.tgt;
    const BV = t0.boat && PL.veh && PL.veh.kind === 'boat' ? PL.veh : null;
    if ((PL.veh && !BV) || (t0.boat && !BV) || EDIT.on || DIALOG.npc || this.modal) return this.endFish();
    if (BV) { const s = Math.sin(BV.rot), c = Math.cos(BV.rot), side = Math.sin(t0.a - BV.rot) >= 0 ? 1 : -1, lx = side * 0.6, lz = 1.3; PL.x = BV.x + c * lx + s * lz; PL.z = BV.z - s * lx + c * lz; PL.y = BV.mesh.position.y + 0.86; F.rot = angLerp(F.rot === undefined ? BV.rot : F.rot, Math.atan2(t0.x - PL.x, t0.z - PL.z), Math.min(1, dt * 6)); PL.rot = F.rot; PL.mesh.visible = CAM.mode !== 'first'; PL.mesh.position.set(PL.x, PL.y, PL.z); PL.mesh.rotation.y = PL.rot; }
    if (KEYS.KeyW || KEYS.KeyA || KEYS.KeyS || KEYS.KeyD || KEYS.ArrowUp || KEYS.ArrowDown || KEYS.ArrowLeft || KEYS.ArrowRight) return this.endFish('釣りざおをしまった');
    F.t += dt; if (!BV) PL.rot = angLerp(PL.rot, Math.atan2(t0.x - PL.x, t0.z - PL.z), Math.min(1, dt * 8));
    const P = PL.parts; if (P.upperArmR) { P.upperArmR.rotation.x = P.upperArmL.rotation.x = -1.1 + (F.st === 'bite' ? Math.sin(F.t * 30) * 0.08 : 0); P.upperArmR.rotation.z = 0.25; P.upperArmL.rotation.z = -0.25; P.foreArmR.rotation.x = P.foreArmL.rotation.x = -0.3; }
    PL.mesh.updateMatrixWorld(true); const tip = R.rod.localToWorld(R.rod.userData.tip.clone());
    let bp;
    if (F.st === 'cast') { const k = Math.min(1, F.t / 0.6); bp = new THREE.Vector3().lerpVectors(tip, new THREE.Vector3(t0.x, t0.y, t0.z), k); bp.y += Math.sin(k * Math.PI) * 2.0; if (k >= 1) { F.st = 'wait'; F.t = 0; this.splash(t0, 0.6); } }
    else {
      bp = new THREE.Vector3(t0.x, t0.y + Math.sin(F.t * 2.2) * 0.02, t0.z);
      if (F.st === 'wait') { F.nib = 0; for (const nt of F.nibT) if (F.t > nt && F.t < nt + 0.35) { F.nib = 1; bp.y -= 0.06; if (!F['s' + nt]) { F['s' + nt] = 1; this.splash(t0, 0.3); } }
        if (F.t > F.wait) { F.st = 'bite'; F.t = 0; F.fish = this.pickFish(t0.env, t0.boat ? (t0.far ? 2 : 1) : 0); F.win = (F.fish.st >= 3 ? 0.75 : 1.05) * RODS[this.rodLv()].win; this.splash(t0, 1); } }
      else if (F.st === 'bite') { bp.y -= 0.16; R.ex.visible = true; R.ex.position.set(PL.x, PL.y + 1.9 + Math.abs(Math.sin(F.t * 12)) * 0.08, PL.z); if (F.t > F.win) { R.ex.visible = false; return this.endFish('にげられた…（ウキがしずんだら、すぐ F か Space）'); } }
    }
    R.bob.position.copy(bp);
    const pos = R.line.geometry.attributes.position; for (let i = 0; i < 10; i++) { const k = i / 9; const v = new THREE.Vector3().lerpVectors(tip, bp, k); v.y -= Math.sin(k * Math.PI) * (F.st === 'cast' ? 0.1 : 0.5); pos.setXYZ(i, v.x, v.y, v.z); } pos.needsUpdate = true;
    const ring = R.ring; if (ring.material.opacity > 0) { ring.scale.multiplyScalar(1 + dt * 2.2); ring.material.opacity = Math.max(0, ring.material.opacity - dt * 1.2); }
  },
  splash(t, s) { const r = LIFE.rod.ring; r.position.set(t.x, t.y + 0.02, t.z); r.scale.setScalar(s); r.material.opacity = 0.9; },
  // =============== mikan ===============
  nearMikan() {
    if (!this.p || PL.veh || Math.hypot(PL.x - MIKAN.x, PL.z - MIKAN.z) > MIKAN.r + 20 && !VEG.userTrees.some(t => t.kind === 'mikan')) return null;
    let best = null, bd = 2.6;
    for (const it of VEG.items) { if (it.type !== 'tree' || it.kind !== 'mikan' || VEG.removed[it.id]) continue; const d = Math.hypot(it.x - PL.x, it.z - PL.z); if (d < bd) { bd = d; best = { key: 'm' + it.id, x: it.x, z: it.z }; } }
    VEG.userTrees.forEach((t, i) => { if (t.kind !== 'mikan') return; const d = Math.hypot(t.x - PL.x, t.z - PL.z); if (d < bd) { bd = d; best = { key: 'u' + Math.round(t.x) + ',' + Math.round(t.z), x: t.x, z: t.z }; } });
    return best;
  },
  pickMikan(m) {
    const d = this.p.daily; d.picked = d.picked || {}; if (d.picked[m.key]) { UI.toast('この木のみかんは、今日はもうとったよ（また明日）'); return; }
    const b = this.bag(); if (b.mikan >= MIKAN_CAP) { UI.toast('みかんがいっぱい！ 出荷所で売るか、プレゼントしよう'); return; }
    d.picked[m.key] = 1; const n = Math.min(MIKAN_CAP - b.mikan, 1 + Math.floor(Math.random() * 3)); b.mikan += n; this.p.stats.mikanN += n; PL.rot = Math.atan2(m.x - PL.x, m.z - PL.z); UI.toast(`🍊 みかんを${n}こ とった！（バッグに ${b.mikan}こ）`); this.dirty = true; this.check();
  },
  // =============== zukan tab ===============
  zukanTab() {
    const p = this.p, R = p.fish || {}, got = Object.keys(R).length;
    return `<p class="small" style="margin:0 0 8px">魚図鑑 ${got} / ${FISH.length}種類　・　釣った数 ${p.stats.fishN}匹　・　みかん収穫 ${p.stats.mikanN}こ${p.items && p.items.rod ? '' : '<br>※釣りざおはゲンじいがくれるかも？'}</p>
      <ul class="list zukan">${FISH.map(f => { const r = R[f.id]; return `<li class="${r ? 'done' : 'lock'}"><span class="ck">${r ? '🐟' : '？'}</span><div><b>${r ? esc(f.name) : '？？？'}</b>　<span class="pr">${'★'.repeat(f.st)}</span><div class="sub">${f.env.map(e => ENV_NAME[e]).join('・')}${f.time ? (f.time === 'night' ? '（夜）' : '（昼）') : ''}${r ? `　最大 ${r.max}cm・${r.n}匹　${esc(f.note)}` : ''}</div></div></li>`; }).join('')}</ul>`;
  },
});
function markProt(x, z, hw, hd, rot) {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, R = Math.hypot(hw, hd) + 1, cs = Math.cos(rot), sn = Math.sin(rot);
  for (let j = Math.floor((z - R - h0) / cell); j <= Math.ceil((z + R - h0) / cell); j++) for (let i = Math.floor((x - R - h0) / cell); i <= Math.ceil((x + R - h0) / cell); i++) {
    if (i < 0 || j < 0 || i >= n || j >= n) continue; const px = h0 + i * cell - x, pz = h0 + j * cell - z, lx = px * cs - pz * sn, lz = px * sn + pz * cs;
    if (Math.abs(lx) < hw && Math.abs(lz - 1) < hd) G.prot[j * n + i] = 1; }
}
GAME.lifeRecs = function (C) {
  const p = this.p, N = this.newc();
  for (const id of (p.justMoved || [])) { const c = NEWCOMERS.find(q => q.id === id), s = N[id]; if (c) C.push({ pri: 119, icon: '🏡', text: `${c.name}さん（${c.who}）が引っこしてきました！ あいさつに行ってみてね。`, at: s.house ? { x: s.house.x, z: s.house.z } : null }); }
  p.justMoved = [];
  const v = NEWCOMERS.find(c => N[c.id] && N[c.id].state === 'visit'); if (v) { const sp = this.visitSpot(); C.push({ pri: 100, icon: '👋', text: `${v.name}さん（${v.who}）が島を見学に来ています。島に住みたいそうなので、港のあたりで話しかけてみてね。`, at: sp }); }
  const hv = NEWCOMERS.find(c => N[c.id] && N[c.id].state === 'house'); if (hv) C.push({ pri: 96, icon: '🚧', text: `${hv.name}さんの家は、明日完成する予定です。`, at: { x: N[hv.id].house.x, z: N[hv.id].house.z } });
  if (!(p.items && p.items.rod)) { const g = NPCS.find(n => n.def.id === 'v_gen'); C.push({ pri: 88, icon: '🎣', text: 'ゲンじいが、{P}さんにわたしたい物があるそうです。会いに行ってみては？', at: g ? { x: g.hx, z: g.hz } : null }); }
  else if (!p.stats.fishN) C.push({ pri: 62, icon: '🐟', text: '港の防波堤から釣りをしてみませんか？ 海のほうを向いて F キーです。', at: this.LM.harbor });
  if (!p.stats.mikanN) C.push({ pri: 42, icon: '🍊', text: 'みかん畑の木に近づくと、Space でみかんがとれます。1本の木から1日1回とれますよ。', at: { x: MIKAN.x, z: MIKAN.z } });
};
