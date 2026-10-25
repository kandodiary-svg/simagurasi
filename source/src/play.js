// ===================== PLAY: 浜辺の拾いもの（ビーチコーミング）と 家庭菜園 =====================
// 浜：毎日、砂浜の波打ちぎわに貝がら・シーグラス・流木などが打ち上がる（日ごとに場所と中身が変わる）。F でひろう → 図鑑・売る・プレゼント。
//     まれに「手紙入りのびん」。中の手紙はバッグからいつでも読み返せる。
// 畑：家のよこの小さな畑（8マス）。商店で季節のたねを買って、F でまく → 毎日水やりすると1日1段階育つ（雨の日は水やり不要）→ 収穫。
//     トマトなどは何回か実る。ひりょうで1日分早く育つ。野菜は売ったり、住民にプレゼントしたり。
const PLAY = { pose: 0, poseK: '', can: null };
// ---------- shop: extra tabs (buy seeds / sell finds & vegetables) ----------
const SHOPX = { tabs: [] };
{ const _os = GAME.openShop; GAME.openShop = function (tab) {
    const want = tab || this.shopTab, mine = SHOPX.tabs.find(t => t.id === want);
    if (mine) this.shopTab = 'decor';
    _os.call(this, mine ? 'decor' : tab);
    const tabs = this.el.modal.querySelector('.tabs'); if (!tabs) return;
    tabs.insertAdjacentHTML('beforeend', SHOPX.tabs.map(t => `<button data-st="${t.id}">${t.label}</button>`).join(''));
    if (mine) { this.shopTab = mine.id; tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.st === mine.id)); this.el.modal.querySelector('.mb').innerHTML = mine.body.call(this); }
    const box = this.el.modal.querySelector('.shopbox'), prev = box.onclick;
    box.onclick = e => { const t = e.target.closest('[data-st]'); if (t && SHOPX.tabs.some(q => q.id === t.dataset.st)) return this.openShop(t.dataset.st); if (mine && mine.click.call(this, e)) return; prev && prev(e); };
  }; }

// =============== 浜辺の拾いもの ===============
const SHORE_ITEMS = [
  { id: 'asari', name: 'アサリの貝がら', st: 1, p: 30, kind: 'clam', col: '#c9b9a0', col2: '#7a6a5a', w: 10, note: 'しま模様がひとつずつちがう。みそ汁の味方。' },
  { id: 'hamaguri', name: 'ハマグリの貝がら', st: 1, p: 60, kind: 'clam', col: '#ddd0b8', col2: '#9a8468', w: 6, big: true, note: 'ぴったり合うのは、もとの相方だけ。だから縁起物。' },
  { id: 'kanizume', name: 'カニのはさみ', st: 1, p: 20, kind: 'claw', col: '#d8643a', w: 4, note: 'だれのはさみだろう。' },
  { id: 'glass_w', name: 'シーグラス（白）', st: 1, p: 50, kind: 'glass', col: '#e4eee8', w: 7, note: '波にみがかれて、すりガラスみたいになったガラスのかけら。' },
  { id: 'glass_g', name: 'シーグラス（緑）', st: 1, p: 70, kind: 'glass', col: '#76bf8c', w: 5, note: 'もとはラムネのびんかな？' },
  { id: 'glass_c', name: 'シーグラス（茶）', st: 1, p: 60, kind: 'glass', col: '#a8703a', w: 5, note: 'しょうゆびんのかけらかも。' },
  { id: 'driftwood', name: '流木', st: 1, p: 40, kind: 'wood', col: '#b3a691', w: 6, note: '白っぽく乾いた木。かざりにも、たき火にも。' },
  { id: 'tsumeta', name: 'ツメタガイ', st: 2, p: 150, kind: 'snail', col: '#b8987a', w: 4, note: 'まん丸の巻き貝。じつはアサリの天敵。' },
  { id: 'itaya', name: 'イタヤガイ', st: 2, p: 200, kind: 'fan', col: '#e0905c', w: 2.5, note: '扇形のうね模様。瀬戸内の浜でときどき見つかる。' },
  { id: 'uni', name: 'ウニのから', st: 2, p: 180, kind: 'urchin', col: '#c4a6bc', w: 2, note: 'トゲがとれると、こんなにきれいな模様。' },
  { id: 'sakura', name: 'サクラガイ', st: 3, p: 600, kind: 'clam', col: '#f6c3cb', col2: '#f9dde2', w: 0.7, thin: true, note: '花びらみたいな、うすいピンクの貝がら。見つけたら、いいことがあるかも。' },
  { id: 'takara', name: 'タカラガイ', st: 3, p: 800, kind: 'cowrie', col: '#e6cc98', col2: '#7a5030', w: 0.8, note: 'つやつやの宝物。むかしはお金として使われた。' },
  { id: 'glass_blue', name: 'シーグラス（青）', st: 3, p: 900, kind: 'glass', col: '#3f86d6', w: 0.5, note: 'めったに見つからない青。ずっとむかしのガラスだそう。' },
  { id: 'uki', name: 'ガラスの浮き玉', st: 4, p: 2500, kind: 'float', col: '#78b8a6', w: 0.25, note: 'むかしの漁で使われた浮き。遠い海から流れてきた。' },
  { id: 'bottle', name: '手紙入りのびん', st: 4, p: 0, kind: 'bottle', col: '#86c4ae', w: 0.35, note: '中に手紙が入っている…！' },
];
const SHORE_LETTERS = [
  ['小豆島の小学5年生より', 'この手紙をひろってくれた人へ。\nわたしは小豆島にすんでいる、小学5年生です。夏休みの自由研究で、びんに手紙を入れて海に流しました。\nもしよかったら、あなたの島のことを教えてください。わたしの島は、オリーブとそうめんが有名です。\nいつか、あなたの島にも行ってみたいな。'],
  ['ある漁師より', '今朝は凪で、海が鏡みたいだった。\n若いころは、こんな朝が来るたびに、どこまでも船を出したくなったもんだ。\nこれを読んでいるあんた、朝の海を見に行ってごらん。きっと、いいことがある。'],
  ['なつより', 'ことしの夏、はじめて一人で船に乗って、おばあちゃんの島へ行きました。\nおばあちゃんの家の前の浜で、このびんを流します。\n来年の夏も、きっとこの海に来ます。だれかに届きますように。'],
  ['灯台守の孫より', 'おじいちゃんは、むかし灯台守をしていました。\n「海は全部つながっとる。さみしいときは、海に話しかけたらええ」が口ぐせでした。\nだから、これはおじいちゃんへの手紙です。…ひろった人、読んじゃってもいいよ。'],
  ['3年2組 たいちより', 'ぼくのしゅみは、貝がらあつめです。\nいちばんの宝物は、青いシーグラスです。\nあなたも何かあつめていますか？　もし青いのを見つけたら、それはとってもラッキーです。'],
  ['ちいさな喫茶店の店主より', '島の坂の上で、小さな喫茶店をやっています。\nお客さんの来ない雨の日に、この手紙を書きました。\n雨の日の海もいいものです。窓から見ると、島がぜんぶ水彩画みたいになるんです。'],
  ['とおくの港町より', 'この手紙が、どこの浜に着くのかわかりません。\nでも、ひろってくれたあなたが、今日いい一日をすごせますように。\nそれだけを願って、流します。'],
];
const SHORE = { spots: null, items: [], key: '', grp: null, mats: {}, geo: {}, glintTex: null, t: 0 };
SHORE.def = id => SHORE_ITEMS.find(q => q.id === id);
SHORE.bag = function () { const b = GAME.bag(); b.shoreBag = b.shoreBag || {}; return b.shoreBag; };
SHORE.count = function () { return Object.values(SHORE.bag()).reduce((s, v) => s + v, 0); };
SHORE.CAP = 40;
// sandy shoreline points (computed once): low sand next to the sea, away from roads, inland water and buildings
SHORE.scan = function () {
  const { n, size } = WORLD, cs = size / (n - 1), h0 = -size / 2, out = [];
  for (let j = 2; j < n - 2; j += 2) for (let i = 2; i < n - 2; i += 2) {
    const k = j * n + i, h = G.H[k]; if (h < 0.02 || h > 1.0) continue; if (TERR.spl && TERR.spl[k * 4 + 3] < 0.5) continue;
    const x = h0 + i * cs, z = h0 + j * cs;
    let sea = false; for (const [dx, dz] of [[5, 0], [-5, 0], [0, 5], [0, -5], [4, 4], [-4, -4], [4, -4], [-4, 4]]) if (groundH(x + dx, z + dz) < -0.4) { sea = true; break; }
    if (!sea || roadDistAt(x, z) < 3.5 || !isNaN(waterLevelAt(G, x, z))) continue;
    if (collidersNear(x, z).some(c => hitsCollider(c, x, z, 0.8))) continue;
    if (PLACED.harbor && Math.hypot(x - PLACED.harbor.x, z - PLACED.harbor.z) < 28) continue;
    out.push([x, z]);
  }
  return out;
};
SHORE.roll = function (R) { const tot = SHORE_ITEMS.reduce((s, q) => s + q.w, 0); let t = R() * tot; for (const q of SHORE_ITEMS) { t -= q.w; if (t <= 0) return q.id; } return 'asari'; };
SHORE.mat = function (key, f) { return SHORE.mats[key] || (SHORE.mats[key] = f()); };
SHORE.mesh = function (it) {
  const D = SHORE.def(it.id), g = new THREE.Group(), std = (c, r = 0.6, o = {}) => SHORE.mat(c + r + JSON.stringify(o), () => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o)));
  if (D.kind === 'clam') { const s = D.big ? 1.25 : D.thin ? 0.75 : 1; const m = new THREE.Mesh(SHORE.geo.clam || (SHORE.geo.clam = (() => { const q = new THREE.SphereGeometry(0.045, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2); q.scale(1, 0.32, 0.82); return q; })()), std(D.col, D.thin ? 0.35 : 0.55, D.thin ? { transparent: true, opacity: 0.88 } : {})); m.scale.setScalar(s); m.position.y = 0.002; g.add(m);
    const r = new THREE.Mesh(SHORE.geo.ring || (SHORE.geo.ring = (() => { const q = new THREE.TorusGeometry(0.03, 0.0035, 4, 18, Math.PI); q.rotateX(-Math.PI / 2); q.scale(1, 1, 0.8); return q; })()), std(D.col2 || '#8a7a66', 0.7)); r.scale.setScalar(s); r.position.y = 0.006 * s; g.add(r); }
  else if (D.kind === 'fan') { const q = SHORE.geo.fan || (SHORE.geo.fan = (() => { const a = new THREE.CircleGeometry(0.065, 12, Math.PI * 0.22, Math.PI * 0.56); const p = a.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), r = Math.hypot(x, y), an = Math.atan2(y, x); p.setZ(i, Math.abs(Math.sin(an * 22)) * 0.004 + r * 0.25); } a.rotateX(-Math.PI / 2); a.computeVertexNormals(); return a; })());
    const m = new THREE.Mesh(q, std(D.col, 0.6, { side: THREE.DoubleSide })); m.position.set(0, 0.004, 0.03); g.add(m); }
  else if (D.kind === 'snail') { const m = new THREE.Mesh(SHORE.geo.snail || (SHORE.geo.snail = new THREE.SphereGeometry(0.032, 12, 9)), std(D.col, 0.45)); m.scale.set(1, 0.75, 1); m.position.y = 0.022; g.add(m); const a = new THREE.Mesh(SHORE.geo.ap || (SHORE.geo.ap = new THREE.CircleGeometry(0.016, 10)), std('#f2e8dc', 0.5)); a.position.set(0, 0.016, 0.031); g.add(a); }
  else if (D.kind === 'cowrie') { const m = new THREE.Mesh(SHORE.geo.snail || (SHORE.geo.snail = new THREE.SphereGeometry(0.032, 12, 9)), std(D.col, 0.12, { metalness: 0.05 })); m.scale.set(0.75, 0.55, 1.05); m.position.y = 0.016; g.add(m); for (let k = 0; k < 7; k++) { const d = new THREE.Mesh(SHORE.geo.dot || (SHORE.geo.dot = new THREE.SphereGeometry(0.006, 5, 4)), std(D.col2, 0.2)); const a = k * 0.9; d.position.set(Math.cos(a) * 0.014, 0.031, Math.sin(a) * 0.022 - 0.002); d.scale.y = 0.4; g.add(d); } }
  else if (D.kind === 'glass') { const m = new THREE.Mesh(SHORE.geo.glass || (SHORE.geo.glass = (() => { const q = new THREE.SphereGeometry(0.022, 8, 5); q.scale(1.2, 0.38, 0.85); return q; })()), std(D.col, 0.55, { transparent: true, opacity: 0.82 })); m.position.y = 0.006; g.add(m); }
  else if (D.kind === 'wood') { const m = new THREE.Mesh(SHORE.geo.wood || (SHORE.geo.wood = (() => { const q = new THREE.CylinderGeometry(0.03, 0.045, 0.8, 7); q.rotateZ(Math.PI / 2); return q; })()), std(D.col, 0.95)); m.position.y = 0.03; g.add(m); const b = new THREE.Mesh(SHORE.geo.br || (SHORE.geo.br = (() => { const q = new THREE.CylinderGeometry(0.012, 0.022, 0.32, 6); q.rotateZ(Math.PI / 2); return q; })()), std(D.col, 0.95)); b.position.set(0.12, 0.03, 0.09); b.rotation.y = -0.7; g.add(b); }
  else if (D.kind === 'float') { const m = new THREE.Mesh(SHORE.geo.flt || (SHORE.geo.flt = new THREE.SphereGeometry(0.12, 18, 12)), std(D.col, 0.08, { transparent: true, opacity: 0.6 })); m.position.y = 0.1; g.add(m); for (let k = 0; k < 3; k++) { const r = new THREE.Mesh(SHORE.geo.net || (SHORE.geo.net = new THREE.TorusGeometry(0.122, 0.004, 4, 24)), std('#8a7a5a', 0.9)); r.position.y = 0.1; r.rotation.set(k === 0 ? Math.PI / 2 : 0, k * 1.05, 0); g.add(r); } }
  else if (D.kind === 'bottle') { const m = new THREE.Mesh(SHORE.geo.bot || (SHORE.geo.bot = (() => { const pts = [[0, 0], [0.034, 0], [0.036, 0.004], [0.036, 0.12], [0.03, 0.15], [0.013, 0.17], [0.013, 0.2], [0, 0.2]].map(([r, y]) => new THREE.Vector2(r, y)); const q = new THREE.LatheGeometry(pts, 14); q.rotateZ(Math.PI / 2 - 0.1); q.translate(0.09, 0.03, 0); return q; })()), std(D.col, 0.1, { transparent: true, opacity: 0.55 })); g.add(m);
    const cork = new THREE.Mesh(SHORE.geo.cork || (SHORE.geo.cork = new THREE.CylinderGeometry(0.011, 0.011, 0.025, 8)), std('#b8875a', 0.9)); cork.rotation.z = Math.PI / 2 - 0.1; cork.position.set(-0.115, 0.05, 0); g.add(cork); const pap = new THREE.Mesh(SHORE.geo.pap || (SHORE.geo.pap = new THREE.CylinderGeometry(0.018, 0.018, 0.08, 8)), std('#f2ead6', 0.8)); pap.rotation.z = Math.PI / 2 - 0.1; pap.position.set(0.02, 0.035, 0); g.add(pap); }
  else if (D.kind === 'urchin') { const m = new THREE.Mesh(SHORE.geo.urc || (SHORE.geo.urc = (() => { const q = new THREE.SphereGeometry(0.035, 14, 10); const p = q.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setY(i, y > 0 ? y * 0.62 : y * 0.25); } q.computeVertexNormals(); return q; })()), std(D.col, 0.7)); m.position.y = 0.008; g.add(m); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, d = new THREE.Mesh(SHORE.geo.dot || (SHORE.geo.dot = new THREE.SphereGeometry(0.006, 5, 4)), std('#8a6a86', 0.6)); d.scale.set(0.6, 0.6, 2.4); d.position.set(Math.cos(a) * 0.017, 0.026, Math.sin(a) * 0.017); d.lookAt(d.position.x * 3, 0.026, d.position.z * 3); g.add(d); } }
  else if (D.kind === 'claw') { for (const s of [-1, 1]) { const c = new THREE.Mesh(SHORE.geo.claw || (SHORE.geo.claw = (() => { const q = new THREE.ConeGeometry(0.012, 0.06, 6); q.rotateZ(-Math.PI / 2); return q; })()), std(D.col, 0.45)); c.position.set(0.03, 0.01, s * 0.008); c.rotation.y = s * 0.18; g.add(c); } const b = new THREE.Mesh(SHORE.geo.snail || (SHORE.geo.snail = new THREE.SphereGeometry(0.032, 12, 9)), std(D.col, 0.45)); b.scale.set(0.7, 0.45, 0.55); b.position.y = 0.012; g.add(b); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // a soft glint so finds can be spotted from a few metres away
  if (!SHORE.glintTex) SHORE.glintTex = txCanvas(64, 64, x => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,250,230,0.85)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(31, 4, 2, 56); x.fillRect(4, 31, 56, 2); });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SHORE.glintTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); sp.scale.setScalar(0.32); sp.position.y = 0.09; sp.renderOrder = 6; g.add(sp); g.userData.glint = sp;
  return g;
};
SHORE.daily = function () {
  const p = GAME.p; if (!p || !G || !G.H) return; const key = todayKey(); p.shore = p.shore || {}; if (p.shore.day !== key) { p.shore.day = key; p.shore.got = []; }
  const sk = key + (p.created || '') + p.name; if (SHORE.key === sk && SHORE.grp) return; SHORE.key = sk;
  if (!SHORE.spots) SHORE.spots = SHORE.scan();
  if (SHORE.grp) { scene.remove(SHORE.grp); } SHORE.grp = new THREE.Group(); SHORE.grp.name = 'shoreFinds'; scene.add(SHORE.grp); SHORE.items = [];
  const S = SHORE.spots; if (!S.length) return;
  const R = mulberry(hashStr(key + p.name + 'shore')), N = Math.min(S.length, 10 + Math.floor(R() * 5)), pick = [];
  for (let t = 0; t < 600 && pick.length < N; t++) { const s = S[Math.floor(R() * S.length)], x = s[0] + (R() - 0.5) * 1.6, z = s[1] + (R() - 0.5) * 1.6; if (pick.some(q => Math.hypot(q.x - x, q.z - z) < 8)) continue; let id = SHORE.roll(R); if (SHORE.def(id).st >= 4 && pick.some(q => SHORE.def(q.id).st >= 4)) id = R() < 0.5 ? 'asari' : 'glass_w'; pick.push({ x, z, id, ry: R() * 6.28, i: pick.length }); }
  for (const it of pick) { if (p.shore.got.includes(it.i)) continue; const y = groundH(it.x, it.z); if (y < -0.05) continue; it.mesh = mergeLocal(SHORE.mesh(it)); it.mesh.scale.setScalar(['float', 'wood', 'bottle'].includes(SHORE.def(it.id).kind) ? 1 : 1.6); it.mesh.position.set(it.x, y, it.z); it.mesh.rotation.y = it.ry; it.ph = R() * 10; SHORE.grp.add(it.mesh); SHORE.items.push(it); }
};
SHORE.target = function () { if (PL.veh || !GAME.p || GAME.inside) return null; const fx = Math.sin(PL.rot), fz = Math.cos(PL.rot); let best = null, bs = 1e9; for (const it of SHORE.items) { const dx = it.x - PL.x, dz = it.z - PL.z, d = Math.hypot(dx, dz); if (d > 1.7) continue; const sc = d - (dx * fx + dz * fz) / (d || 1) * 0.5; if (sc < bs) { bs = sc; best = it; } } return best; };
SHORE.pick = function (it) {
  const p = GAME.p, D = SHORE.def(it.id); PL.rot = Math.atan2(it.x - PL.x, it.z - PL.z); PLAY.pose = 0.75; PLAY.poseK = 'pick';
  if (D.id !== 'bottle' && SHORE.count() >= SHORE.CAP) { UI.toast(`ポケットがいっぱい（${SHORE.CAP}こ）。商店で売るか、プレゼントしよう`); return true; }
  setTimeout(() => {
    if (!SHORE.items.includes(it)) return; SHORE.grp.remove(it.mesh); SHORE.items.splice(SHORE.items.indexOf(it), 1); p.shore.got.push(it.i);
    p.shorez = p.shorez || {}; const first = !p.shorez[D.id]; p.shorez[D.id] = (p.shorez[D.id] || 0) + 1; p.stats.shoreN = (p.stats.shoreN || 0) + 1;
    try { SND.play('ui_confirmation2', { vol: 0.6 }); } catch (e) { }
    if (D.id === 'bottle') { p.bottles = p.bottles || []; const used = p.bottles.map(q => q.i), free = SHORE_LETTERS.map((_, i) => i).filter(i => !used.includes(i)), li = free.length ? free[hashStr(todayKey()) % free.length] : hashStr(todayKey()) % SHORE_LETTERS.length; p.bottles.push({ i: li, date: todayKey() }); GAME.dirty = true; SHORE.readLetter(li, true); return; }
    const bag = SHORE.bag(); bag[D.id] = (bag[D.id] || 0) + 1;
    UI.toast(`${D.st >= 3 ? '✨ ' : '🐚 '}${D.name}をひろった！　${'★'.repeat(D.st)}${first ? '（図鑑に登録）' : ''}`);
    if (first && D.st >= 2) setTimeout(() => UI.toast(`📖 ${D.note}`), 900);
    GAME.dirty = true; GAME.check && GAME.check(); GAME.renderTracker && GAME.renderTracker();
  }, 420);
  return true;
};
SHORE.readLetter = function (i, isNew) {
  const L = SHORE_LETTERS[i]; if (!L) return; GAME.modal = 'letter';
  GAME.el.modal.innerHTML = `<div class="mbox journal bottleL"><div class="mh"><h2>${isNew ? '🍾 びんの中に手紙が入っていた' : '🍾 びんの手紙'}</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div class="paper" style="background:#fbf6e8;border-radius:10px;padding:16px 18px;line-height:1.9;white-space:pre-wrap;color:#3a3226;box-shadow:inset 0 0 0 1px #e6dcc2">${esc(L[1])}<div style="text-align:right;margin-top:10px">― ${esc(L[0])}</div></div><p class="small">びんの手紙は、バッグ（I）からいつでも読み返せます。</p></div></div>`;
  GAME.el.modal.hidden = false; GAME.el.modal.querySelector('.journal').onclick = e => { if (e.target.closest('[data-x="close"]')) GAME.closeModal(); };
};
SHORE.update = function (dt) {
  if (!GAME.p) return; SHORE.t += dt; if ((SHORE.chk = (SHORE.chk || 0) - dt) < 0) { SHORE.chk = 3; SHORE.daily(); }
  if (!SHORE.grp) return; SHORE.grp.visible = !GAME.inside; if (GAME.inside) return;
  const cp = camera.position, night = GAME.night || 0;
  for (const it of SHORE.items) { const sp = it.mesh.userData.glint; if (!sp) continue; const d = Math.hypot(it.x - cp.x, it.z - cp.z); if (d > 45) { sp.visible = false; continue; } sp.visible = true; const tw = Math.max(0, Math.sin(SHORE.t * 2.1 + it.ph)) ** 4; sp.material.opacity = Math.max(tw, d < 14 ? 0.22 : 0) * (0.95 - night * 0.5) * Math.min(1, (45 - d) / 10) * sstep(1.5, 4.5, d); sp.scale.setScalar(0.12 + tw * 0.16); }
};

// =============== 家庭菜園 ===============
// sow: [[fromMonth, fromDay, toMonth, toDay], ...]   days: watered days to the first harvest   multi: harvests per planting
const CROPS = [
  { id: 'daikon', name: 'だいこん', ic: '🥬', seed: 180, sell: 380, days: 3, sow: [[8, 15, 10, 31]], kind: 'root', note: '冬のおでんの主役。葉っぱもおいしい。' },
  { id: 'kabu', name: 'かぶ', ic: '⚪', seed: 120, sell: 220, days: 2, sow: [[3, 1, 4, 30], [9, 1, 11, 15]], kind: 'turnip', note: 'まるくて白い、やさしい味。' },
  { id: 'hourensou', name: 'ほうれんそう', ic: '🌿', seed: 120, sell: 200, days: 2, sow: [[2, 15, 4, 30], [9, 1, 11, 30]], kind: 'leafy', note: 'さむくなるほど、あまくなる。' },
  { id: 'negi', name: 'ねぎ', ic: '🌱', seed: 140, sell: 240, days: 3, sow: [[3, 1, 6, 30], [9, 1, 11, 30]], kind: 'negi', note: 'うどんにも、なべにも。' },
  { id: 'tamanegi', name: 'たまねぎ', ic: '🧅', seed: 160, sell: 280, days: 4, sow: [[9, 1, 11, 30]], kind: 'bulb', note: '島のたまねぎは、あまくて生でもいける。' },
  { id: 'ichigo', name: 'いちご', ic: '🍓', seed: 300, sell: 150, days: 4, multi: 3, sow: [[10, 1, 11, 30], [2, 1, 3, 31]], kind: 'berry', note: '何回も実る。真っ赤になったら食べごろ。' },
  { id: 'jagaimo', name: 'じゃがいも', ic: '🥔', seed: 180, sell: 320, days: 3, sow: [[2, 15, 3, 31], [8, 15, 9, 30]], kind: 'potato', note: 'ほりあげるときが、いちばん楽しい。' },
  { id: 'tomato', name: 'トマト', ic: '🍅', seed: 240, sell: 140, days: 4, multi: 4, sow: [[4, 1, 6, 30]], kind: 'vine', fruit: 'tomato', note: '夏の畑の赤い宝石。何回も実る。' },
  { id: 'kyuri', name: 'きゅうり', ic: '🥒', seed: 180, sell: 110, days: 3, multi: 4, sow: [[4, 15, 7, 31]], kind: 'vine', fruit: 'kyuri', note: 'とれたては、トゲがちくちく。' },
  { id: 'nasu', name: 'なす', ic: '🍆', seed: 200, sell: 130, days: 4, multi: 4, sow: [[4, 15, 6, 30]], kind: 'vine', fruit: 'nasu', note: '焼きなすに、みそ汁に。' },
  { id: 'edamame', name: 'えだまめ', ic: '🫛', seed: 150, sell: 260, days: 3, sow: [[4, 15, 7, 15]], kind: 'bush', note: 'ゆでたてに塩をぱらり。' },
  { id: 'satsumaimo', name: 'さつまいも', ic: '🍠', seed: 220, sell: 450, days: 5, sow: [[5, 1, 6, 30]], kind: 'potato', note: '秋の焼きいもを夢見て。' },
];
const GARDEN = { grp: null, sig: '', cellsG: [], soilM: null, wetM: null, chk: 0 };
GARDEN.crop = id => CROPS.find(c => c.id === id);
GARDEN.inSeason = function (c, d = new Date()) { const v = (d.getMonth() + 1) * 100 + d.getDate(); return c.sow.some(([m0, d0, m1, d1]) => v >= m0 * 100 + d0 && v <= m1 * 100 + d1); };
GARDEN.bag = function () { const b = GAME.bag(); b.seeds = b.seeds || {}; b.veg = b.veg || {}; b.fert = b.fert || 0; return b; };
GARDEN.cellPos = function (gd, i) { const r = Math.floor(i / 4), c = i % 4; return toWorld(gd, (c - 1.5) * 0.95, (r - 0.5) * 1.15); };
// a flat, free spot beside or behind the player's house
GARDEN.site = function () {
  const H = PLACED.home && PLACED.home.hs; if (!H) return null;
  const tries = []; for (const dist of [2.6, 3.6, 4.8, 6.2]) { tries.push([H.w / 2 + dist, 0, Math.PI / 2], [-(H.w / 2 + dist), 0, Math.PI / 2], [0, -(H.d / 2 + dist), 0], [H.w / 2 + dist, -H.d / 3, Math.PI / 2], [-(H.w / 2 + dist), -H.d / 3, Math.PI / 2]); }
  for (const [lx, lz, dr] of tries) {
    const [x, z] = toWorld(H, lx, lz), rot = H.rot + dr, o = { x, z, rot }; let ok = true, lo = 99, hi = -99;
    for (let i = -2; i <= 2 && ok; i++) for (let j = -1; j <= 1 && ok; j++) { const [px, pz] = toWorld(o, i * 1.1, j * 0.75), h = groundH(px, pz); lo = Math.min(lo, h); hi = Math.max(hi, h); if (h < 1.0 || roadDistAt(px, pz) < 3.2 || !isNaN(waterLevelAt(G, px, pz)) || collidersNear(px, pz).some(c => hitsCollider(c, px, pz, 0.45))) ok = false; }
    if (ok && hi - lo < 0.55) return { x: +x.toFixed(2), z: +z.toFixed(2), rot: +rot.toFixed(4) };
  }
  return null;
};
GARDEN.init = function () {
  const p = GAME.p; if (!p) return null; if (p.garden && p.garden.x !== undefined) return p.garden; if (performance.now() < (GARDEN.retryAt || 0)) return null;
  const s = GARDEN.site(); if (!s) { GARDEN.retryAt = performance.now() + 60000; return null; } // no room next to the house (yet): try again later
  p.garden = Object.assign(s, { cells: Array(8).fill(null), tick: todayKey() });
  const b = GARDEN.bag(); b.seeds.daikon = (b.seeds.daikon || 0) + 2; b.seeds.kabu = (b.seeds.kabu || 0) + 2; GAME.dirty = true;
  setTimeout(() => UI.toast('🌱 家のよこに小さな畑ができました。だいこんとかぶのたねを2つずつもらった！（畑で F）'), 1500);
  return p.garden;
};
// one growth step per new day if the cell was watered (or it rained) on the last day it was checked
GARDEN.newDay = function (gd) {
  const t = todayKey(); if (gd.tick === t) return; for (const c of gd.cells) { if (!c) continue; if (c.water === gd.tick) c.g = (c.g || 0) + 1; c.fert = null; }
  gd.tick = t; GAME.dirty = true;
};
GARDEN.state = function (c) { if (!c) return 'empty'; const C = GARDEN.crop(c.id); if (!C) return 'empty'; return c.g >= C.days ? 'ready' : c.g <= 0 ? 'seed' : c.g < C.days - 1 ? 'sprout' : 'young'; };
GARDEN.mats = function () {
  if (GARDEN.M) return GARDEN.M; const S = (c, r = 0.85, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
  const dirt = TEX.dirt ? TEX.dirt.clone() : null; if (dirt) { dirt.repeat.set(3, 1); dirt.needsUpdate = true; }
  return GARDEN.M = { soil: S('#f4e2cc', 1, Object.assign({ envMapIntensity: 0.35 }, dirt ? { map: dirt } : {})), wet: S('#a08268', 0.72, Object.assign({ envMapIntensity: 0.5, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }, dirt ? { map: dirt } : {})), wood: S('#9a7a52', 0.9), leaf: S('#4f8f3a', 0.75, { side: THREE.DoubleSide }), leafD: S('#3a6e2c', 0.8, { side: THREE.DoubleSide }), leafY: S('#9aa84a', 0.85, { side: THREE.DoubleSide }), white: S('#eef0e2', 0.55), stake: S('#c8b07a', 0.8), red: S('#d8302a', 0.35), straw: S('#d6bf7a', 0.95), purple: S('#3e2448', 0.3), cuke: S('#3a6a2a', 0.5), gold: S('#c89a4a', 0.6), flower: S('#fff6d0', 0.6), pod: S('#7aac4a', 0.7), negi: S('#6aa84a', 0.6) };
};
GARDEN.geo = {};
GARDEN.leaf = function (len, wid) { const k = len.toFixed(2) + wid.toFixed(2); return GARDEN.geo[k] || (GARDEN.geo[k] = (() => { const q = new THREE.SphereGeometry(1, 8, 5); q.scale(wid, 0.12 * wid, len); q.translate(0, 0, len * 0.9); return q; })()); };
GARDEN.plant = function (c, i) {
  const M = GARDEN.mats(), C = GARDEN.crop(c.id), st = GARDEN.state(c), g = new THREE.Group(), R = mulberry(i * 31 + 7);
  const ros = (n, len, wid, lift, mat) => { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + R() * 0.4, l = new THREE.Mesh(GARDEN.leaf(len * (0.8 + R() * 0.4), wid), mat); l.rotation.set(-lift - R() * 0.2, a, 0, 'YXZ'); l.position.y = 0.02; g.add(l); } };
  if (st === 'seed') { const m = new THREE.Mesh(GARDEN.geo.mound || (GARDEN.geo.mound = (() => { const q = new THREE.SphereGeometry(0.11, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2); q.scale(1, 0.35, 1); return q; })()), M.soil); g.add(m); return g; }
  if (st === 'sprout') { ros(2, 0.05, 0.025, 0.5, M.leaf); const s = new THREE.Mesh(GARDEN.geo.stem || (GARDEN.geo.stem = new THREE.CylinderGeometry(0.004, 0.005, 0.05, 4)), M.leaf); s.position.y = 0.025; g.add(s); g.children.forEach(o => { if (o !== s) o.position.y = 0.05; }); return g; }
  const big = st === 'ready' ? 1 : 0.55, ready = st === 'ready';
  if (C.kind === 'root' || C.kind === 'turnip') { ros(9, 0.26 * big, 0.06 * big, 0.75, M.leaf); if (ready) { const r = new THREE.Mesh(C.kind === 'root' ? (GARDEN.geo.dk || (GARDEN.geo.dk = new THREE.CylinderGeometry(0.042, 0.046, 0.08, 12))) : (GARDEN.geo.kb || (GARDEN.geo.kb = new THREE.SphereGeometry(0.07, 12, 9))), M.white); r.position.y = C.kind === 'root' ? 0.015 : 0.0; g.add(r); } }
  else if (C.kind === 'leafy') ros(10, 0.18 * big, 0.07 * big, 0.6, M.leafD);
  else if (C.kind === 'negi') { for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(GARDEN.geo.ng || (GARDEN.geo.ng = (() => { const q = new THREE.CylinderGeometry(0.008, 0.013, 1, 6); q.translate(0, 0.5, 0); return q; })()), M.negi); s.scale.y = (0.3 + R() * 0.15) * (ready ? 1.4 : big * 1.2); s.position.set((R() - 0.5) * 0.08, 0, (R() - 0.5) * 0.08); s.rotation.set((R() - 0.5) * 0.25, 0, (R() - 0.5) * 0.25); g.add(s); } }
  else if (C.kind === 'bulb') { ros(6, 0.24 * big, 0.02, ready ? -0.2 : 1.0, ready ? M.leafY : M.negi); if (ready) { const b = new THREE.Mesh(GARDEN.geo.kb || (GARDEN.geo.kb = new THREE.SphereGeometry(0.07, 12, 9)), M.gold); b.scale.set(1, 0.85, 1); b.position.y = 0.03; g.add(b); } }
  else if (C.kind === 'berry') { ros(7, 0.12 * big, 0.06 * big, 0.45, M.leafD); for (let k = 0; k < (ready ? 5 : 2); k++) { const a = R() * 6.28, f = new THREE.Mesh(ready ? (GARDEN.geo.sb || (GARDEN.geo.sb = (() => { const q = new THREE.ConeGeometry(0.025, 0.045, 8); q.rotateX(Math.PI); return q; })())) : (GARDEN.geo.fl || (GARDEN.geo.fl = new THREE.SphereGeometry(0.014, 6, 4))), ready ? M.red : M.flower); f.position.set(Math.cos(a) * 0.12, 0.03, Math.sin(a) * 0.12); g.add(f); } }
  else if (C.kind === 'potato' || C.kind === 'bush') { for (let k = 0; k < (C.kind === 'bush' ? 14 : 12); k++) { const a = R() * 6.28, h = 0.05 + R() * 0.3 * big, l = new THREE.Mesh(GARDEN.leaf(0.08 * (0.6 + big * 0.5), 0.045), ready && C.kind === 'potato' ? M.leafY : M.leaf); l.position.set(Math.cos(a) * 0.08 * big, h, Math.sin(a) * 0.08 * big); l.rotation.set(-0.3 - R() * 0.6, a, 0, 'YXZ'); g.add(l); }
    if (C.kind === 'bush' && ready) for (let k = 0; k < 8; k++) { const a = R() * 6.28, pd = new THREE.Mesh(GARDEN.geo.pod || (GARDEN.geo.pod = (() => { const q = new THREE.CapsuleGeometry(0.012, 0.04, 3, 6); return q; })()), M.pod); pd.position.set(Math.cos(a) * 0.07, 0.1 + R() * 0.15, Math.sin(a) * 0.07); pd.rotation.z = 0.6; g.add(pd); } }
  else if (C.kind === 'vine') { const s = new THREE.Mesh(GARDEN.geo.stk || (GARDEN.geo.stk = (() => { const q = new THREE.CylinderGeometry(0.008, 0.01, 1.0, 5); q.translate(0, 0.5, 0); return q; })()), M.stake); s.scale.y = 0.4 + big * 0.6; g.add(s);
    const hh = (0.25 + big * 0.6); for (let k = 0; k < 16; k++) { const a = R() * 6.28, y = 0.06 + (k / 16) * hh, l = new THREE.Mesh(GARDEN.leaf(0.07 + R() * 0.05, 0.05), M.leaf); l.position.set(Math.cos(a) * 0.05, y, Math.sin(a) * 0.05); l.rotation.set(-0.2 - R() * 0.5, a, 0, 'YXZ'); g.add(l); }
    if (ready) for (let k = 0; k < 5; k++) { const a = R() * 6.28, y = 0.2 + R() * (hh - 0.25); let f; if (C.fruit === 'tomato') { f = new THREE.Mesh(GARDEN.geo.tm || (GARDEN.geo.tm = new THREE.SphereGeometry(0.035, 10, 8)), M.red); f.scale.y = 0.85; } else if (C.fruit === 'kyuri') { f = new THREE.Mesh(GARDEN.geo.ky || (GARDEN.geo.ky = new THREE.CapsuleGeometry(0.014, 0.12, 3, 6)), M.cuke); f.rotation.z = 0.15; } else { f = new THREE.Mesh(GARDEN.geo.ns || (GARDEN.geo.ns = (() => { const q = new THREE.SphereGeometry(0.03, 10, 8); q.scale(1, 1.9, 1); return q; })()), M.purple); } f.position.set(Math.cos(a) * 0.08, y, Math.sin(a) * 0.08); g.add(f); } }
  g.scale.setScalar(1.45); return g;
};
GARDEN.build = function () {
  const gd = GAME.p && GAME.p.garden; if (!gd || gd.x === undefined) { if (GARDEN.grp) { scene.remove(GARDEN.grp); GARDEN.grp = null; } return; }
  const t = todayKey(), sig = JSON.stringify([gd.x, gd.z, gd.cells.map(c => c ? [c.id, GARDEN.state(c), c.water === t] : 0)]); if (sig === GARDEN.sig && GARDEN.grp) return; GARDEN.sig = sig;
  if (GARDEN.grp) { scene.remove(GARDEN.grp); GARDEN.grp.traverse(o => { if (o.isMesh && !o.userData.keep) o.geometry.dispose(); }); } const M = GARDEN.mats(), grp = new THREE.Group(); grp.name = 'garden'; GARDEN.grp = grp; scene.add(grp);
  if (!GARDEN.cleared) { GARDEN.cleared = true; const n = VEG.removeAt(gd.x, gd.z, 3.2); if (n) VEG.refresh(gd.x - 4, gd.z - 4, gd.x + 4, gd.z + 4); }
  const y0 = Math.max(...[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const [x, z] = GARDEN.cellPos(gd, i); return groundH(x, z); }));
  // two raised beds (畝) with a low board edge
  for (let r = 0; r < 2; r++) {
    const [bx, bz] = toWorld(gd, 0, (r - 0.5) * 1.15), bed = new THREE.Group(); bed.position.set(bx, y0, bz); bed.rotation.y = gd.rot; grp.add(bed);
    const prof = (len) => { const sh = new THREE.Shape(); sh.moveTo(-0.42, 0); sh.lineTo(0.42, 0); sh.lineTo(0.33, 0.16); sh.quadraticCurveTo(0, 0.2, -0.33, 0.16); sh.closePath(); const q = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false, curveSegments: 6 }); q.translate(0, 0, -len / 2); q.rotateY(Math.PI / 2); return q; };
    const soil = new THREE.Mesh(GARDEN.geo.bed || (GARDEN.geo.bed = prof(3.9)), M.soil); soil.receiveShadow = true; bed.add(soil); soil.position.y = -0.01;
    for (let c = 0; c < 4; c++) { const i = r * 4 + c, cl = gd.cells[i]; if (cl && cl.water === t) { const w = new THREE.Mesh(GARDEN.geo.wet || (GARDEN.geo.wet = (() => { const q = prof(0.9); q.scale(1, 1.02, 1.015); return q; })()), M.wet); w.position.set((c - 1.5) * 0.95, -0.011, 0); bed.add(w); } }
  }
  const [fx, fz] = toWorld(gd, 0, 0), frame = new THREE.Group(); frame.position.set(fx, y0, fz); frame.rotation.y = gd.rot; grp.add(frame);
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.14, 0.04), M.wood); a.position.set(0, 0.0, s * 1.2); frame.add(a); const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 2.44), M.wood); b.position.set(s * 2.05, 0.0, 0); frame.add(b); }
  // a little sign
  const sg = new THREE.Group(); sg.position.set(2.25, 0, -1.25); frame.add(sg); const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), M.wood); post.position.y = 0.35; sg.add(post);
  const nm = `${(GAME.p.name || '').slice(0, 4)}の畑`; if (!GARDEN.signM || GARDEN.signN !== nm) { const [cv, x] = cvs(256, 128); x.fillStyle = '#f2e6c8'; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#8a6a42'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 120); x.fillStyle = '#4a3622'; x.font = '800 44px "M PLUS Rounded 1c", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(nm, 128, 66); if (GARDEN.signM) { GARDEN.signM.map.dispose(); GARDEN.signM.dispose(); } GARDEN.signM = new THREE.MeshStandardMaterial({ map: toTex(cv, false), roughness: 0.8 }); GARDEN.signN = nm; }
  const bd = new THREE.Mesh(GARDEN.geo.board || (GARDEN.geo.board = new THREE.BoxGeometry(0.46, 0.23, 0.02)), [M.wood, M.wood, M.wood, M.wood, GARDEN.signM, M.wood]); bd.userData.keep = true; bd.position.set(0, 0.68, 0.03); sg.add(bd);
  for (let i = 0; i < 8; i++) { const c = gd.cells[i]; if (!c) continue; const [px, pz] = GARDEN.cellPos(gd, i), pl = GARDEN.plant(c, i); pl.position.set(px, y0 + 0.185, pz); pl.rotation.y = gd.rot + (i % 3) * 0.7; grp.add(pl); }
  grp.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const mg = mergeLocal(grp); mg.name = 'garden'; scene.remove(grp); scene.add(mg); GARDEN.grp = mg; // a handful of draw calls instead of hundreds of leaves
};
GARDEN.target = function () { const gd = GAME.p && GAME.p.garden; if (!gd || gd.x === undefined || PL.veh || GAME.inside) return -1; if (Math.hypot(PL.x - gd.x, PL.z - gd.z) > 4.2) return -1; const fx = Math.sin(PL.rot), fz = Math.cos(PL.rot); let bi = -1, bs = 1e9; for (let i = 0; i < 8; i++) { const [x, z] = GARDEN.cellPos(gd, i), dx = x - PL.x, dz = z - PL.z, d = Math.hypot(dx, dz); if (d > 1.35) continue; const sc = d - (dx * fx + dz * fz) / (d || 1) * 0.45; if (sc < bs) { bs = sc; bi = i; } } return bi; };
GARDEN.promptFor = function (i) { const gd = GAME.p.garden, c = gd.cells[i], st = GARDEN.state(c), C = c && GARDEN.crop(c.id); if (st === 'empty') return 'F：たねをまく'; if (st === 'ready') return `F：収穫する（${C.name}）`; if (c.water !== todayKey()) return `F：水やり（${C.name}）`; return `F：${C.name}のようす（あと${Math.max(1, C.days - c.g)}日）`; };
GARDEN.act = function (i) {
  const p = GAME.p, gd = p.garden, c = gd.cells[i], st = GARDEN.state(c), b = GARDEN.bag(), t = todayKey(), [cx, cz] = GARDEN.cellPos(gd, i); PL.rot = Math.atan2(cx - PL.x, cz - PL.z);
  if (st === 'empty') return GARDEN.sowMenu(i);
  const C = GARDEN.crop(c.id);
  if (st === 'ready') {
    PLAY.pose = 0.75; PLAY.poseK = 'pick'; const n = C.multi ? 1 + (hashStr(t + i) % 2) : 1; b.veg[C.id] = (b.veg[C.id] || 0) + n; p.vegz = p.vegz || {}; const first = !p.vegz[C.id]; p.vegz[C.id] = (p.vegz[C.id] || 0) + n; p.stats.vegN = (p.stats.vegN || 0) + n;
    c.h = (c.h || 0) + 1; if (C.multi && c.h < C.multi) c.g = C.days - 2; else gd.cells[i] = null;
    UI.toast(`${C.ic} ${C.name}を${n}こ収穫した！${first ? '（はじめての収穫！）' : ''}${C.multi && gd.cells[i] ? `　また実るよ（あと${C.multi - c.h}回）` : ''}`); try { SND.play('ui_confirmation2', { vol: 0.6 }); } catch (e) { }
    GAME.dirty = true; GAME.check && GAME.check(); GARDEN.build(); return true;
  }
  if (c.water !== t) { c.water = t; p.stats.waterN = (p.stats.waterN || 0) + 1; GAME.check && GAME.check(); PLAY.pose = 1.1; PLAY.poseK = 'water'; GARDEN.splash(cx, cz); UI.toast(`💧 ${C.name}に水をやった（あしたには育つよ）`); try { SND.play('splash', { vol: 0.25, rate: 1.6 }); } catch (e) { } GAME.dirty = true; setTimeout(() => GARDEN.build(), 300); return true; }
  return GARDEN.careMenu(i);
};
GARDEN.sowMenu = function (i) {
  const b = GARDEN.bag(), have = CROPS.filter(c => b.seeds[c.id] > 0); GAME.modal = 'sow';
  GAME.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>🌱 たねをまく</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb">${have.length ? `<ul class="list">${have.map(c => `<li><span class="ic">${c.ic}</span><div><b>${esc(c.name)}</b> のたね ×${b.seeds[c.id]}<div class="sub">${c.days}日で収穫${c.multi ? `・${c.multi}回実る` : ''}　${esc(c.note)}</div></div><button class="rel" data-sow="${c.id}">まく</button></li>`).join('')}</ul>` : '<p>たねを持っていません。商店の「たね」で季節のたねが買えます。</p>'}<p class="small">毎日1回水やりすると、次の日に1段階育ちます。雨の日は水やりしなくても大丈夫。</p></div></div>`;
  GAME.el.modal.hidden = false;
  GAME.el.modal.querySelector('.journal').onclick = e => { if (e.target.closest('[data-x="close"]')) return GAME.closeModal(); const s = e.target.closest('[data-sow]'); if (!s) return; const id = s.dataset.sow; if (!(b.seeds[id] > 0)) return; b.seeds[id]--; GAME.p.garden.cells[i] = { id, g: 0, water: TIME.weather === 'rain' ? todayKey() : null, planted: todayKey() }; GAME.closeModal(); PLAY.pose = 0.75; PLAY.poseK = 'pick'; UI.toast(`🌱 ${GARDEN.crop(id).name}のたねをまいた。水やりもわすれずに！`); GAME.dirty = true; GARDEN.build(); };
  return true;
};
GARDEN.careMenu = function (i) {
  const gd = GAME.p.garden, c = gd.cells[i], C = GARDEN.crop(c.id), b = GARDEN.bag(); GAME.modal = 'care';
  GAME.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>${C.ic} ${esc(C.name)}</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><p>今日はもう水やりしました。あと <b>${Math.max(1, C.days - c.g)}日</b> で収穫できそう。</p>
    <div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="rel" data-care="fert" ${b.fert > 0 && c.fert !== todayKey() ? '' : 'disabled'}>🧪 ひりょうをあげる（${b.fert}こ）</button><button class="rel" data-care="pull">ひっこぬく</button><button class="rel" data-x="close">そのままにする</button></div>
    <p class="small">ひりょうは商店の「たね」で買えます。あげると1日分はやく育ちます（1マス1日1回）。</p></div></div>`;
  GAME.el.modal.hidden = false;
  GAME.el.modal.querySelector('.journal').onclick = e => { if (e.target.closest('[data-x="close"]')) return GAME.closeModal(); const a = e.target.closest('[data-care]'); if (!a || a.disabled) return;
    if (a.dataset.care === 'fert' && b.fert > 0) { b.fert--; c.fert = todayKey(); c.g = (c.g || 0) + 1; UI.toast(`🧪 ひりょうをあげた。${C.name}がぐんと育った！`); }
    if (a.dataset.care === 'pull') { gd.cells[i] = null; UI.toast(`${C.name}をひっこぬいた`); }
    GAME.dirty = true; GAME.closeModal(); GARDEN.build(); };
  return true;
};
GARDEN.splash = function (x, z) {
  const n = 40, pos = new Float32Array(n * 3), vel = []; const y = groundH(x, z) + 0.9; for (let k = 0; k < n; k++) { pos.set([x + (Math.random() - 0.5) * 0.1, y, z + (Math.random() - 0.5) * 0.1], k * 3); vel.push([(Math.random() - 0.5) * 0.8, Math.random() * 0.6, (Math.random() - 0.5) * 0.8]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfe8ff', size: 0.05, transparent: true, opacity: 0.85, depthWrite: false })); scene.add(pts);
  const t0 = performance.now(), step = () => { const t = (performance.now() - t0) / 1000; if (t > 1.1) { scene.remove(pts); g.dispose(); return; } const P = g.attributes.position; for (let k = 0; k < n; k++) { const v = vel[k]; v[1] -= 9.8 * 0.016; P.setXYZ(k, P.getX(k) + v[0] * 0.016, Math.max(y - 0.85, P.getY(k) + v[1] * 0.016), P.getZ(k) + v[2] * 0.016); } P.needsUpdate = true; pts.material.opacity = 0.85 * (1 - t / 1.1); requestAnimationFrame(step); }; step();
};
GARDEN.update = function (dt) {
  if (!GAME.p) return; if ((GARDEN.chk -= dt) > 0) return; GARDEN.chk = 2;
  const gd = GARDEN.init(); if (!gd) return; GARDEN.newDay(gd);
  const H = PLACED.home && PLACED.home.hs; if (H && Math.hypot(gd.x - H.x, gd.z - H.z) > 18) { const s2 = GARDEN.site(); if (s2) { Object.assign(gd, s2); GARDEN.cleared = false; GARDEN.sig = ''; GAME.dirty = true; } } // the house was moved: the garden follows
  if (TIME.weather === 'rain' && !GAME.inside) { const t = todayKey(); let ch = false; for (const c of gd.cells) if (c && c.water !== t) { c.water = t; ch = true; } if (ch) GAME.dirty = true; }
  GARDEN.build(); if (GARDEN.grp) GARDEN.grp.visible = !GAME.inside;
};

// ---------- hooks: F key, prompt, hero poses, update ----------
{ const _fk = GAME.fishKey; GAME.fishKey = function () {
    if (!LIFE.fish && !PL.veh && !EDIT.on && !GAME.inside) { const gi = GARDEN.target(); if (gi >= 0) return GARDEN.act(gi); const it = SHORE.target(); if (it) return SHORE.pick(it); }
    return _fk.apply(this, arguments); }; }
{ const _pr = GAME.prompt; GAME.prompt = function () {
    if (!LIFE.fish && !PL.veh && !EDIT.on && !GAME.inside && GAME.p) { const gi = GARDEN.target(); if (gi >= 0) return GARDEN.promptFor(gi); const it = SHORE.target(); if (it) return 'F：ひろう'; }
    return _pr.apply(this, arguments); }; }
{ const _ah = animateHero; animateHero = function (dt) { const r = _ah.apply(this, arguments);
    if (PLAY.pose > 0) { const tot = PLAY.poseK === 'water' ? 1.1 : 0.75; PLAY.pose -= dt || 0.016; const k = 1 - Math.max(0, PLAY.pose) / tot, s = Math.sin(Math.min(1, k * 1.25) * Math.PI), P = PL.parts;
      if (P && P.spine) {
        if (PLAY.poseK === 'pick') { P.spine.rotation.x = 0.85 * s; P.pelvis.position.y = PL.rest.pelvis.y - 0.1 * s; P.thighL.rotation.x = P.thighR.rotation.x = -0.75 * s; P.shinL.rotation.x = P.shinR.rotation.x = 1.15 * s; P.upperArmL.rotation.x = P.upperArmR.rotation.x = -0.6 * s; P.foreArmR.rotation.x = P.foreArmL.rotation.x = -0.3 * s; P.head.rotation.x = 0.2 * s; }
        else { if (!PLAY.can) { const M = propMats(), g = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 12), new THREE.MeshStandardMaterial({ color: '#4a9ad0', roughness: 0.4, metalness: 0.2 })); g.add(body); const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.016, 0.2, 6), body.material); sp.rotation.x = Math.PI / 2 - 0.6; sp.position.set(0, 0.03, 0.13); g.add(sp); PLAY.can = g; }
          const hand = P.foreArmR; if (PLAY.can.parent !== hand) hand.add(PLAY.can); PLAY.can.visible = true; PLAY.can.position.set(-0.19, -0.16, 0.05); PLAY.can.rotation.set(0.4 * s, 0, 0);
          P.upperArmR.rotation.x = -1.0 * Math.min(1, s * 1.5); P.foreArmR.rotation.x = -0.3; P.spine.rotation.x = 0.2 * s; P.head.rotation.x = 0.25 * s; }
      }
    } else if (PLAY.can && PLAY.can.visible) PLAY.can.visible = false;
    return r; }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { SHORE.update(dt || 0.016); GARDEN.update(dt || 0.016); } catch (e) { if (!PLAY._err) { PLAY._err = 1; console.warn('play', e); } } return r; }; }

// ---------- bag, zukan, shop, gifts ----------
{ const _ob = GAME.openBag; GAME.openBag = function () { _ob.apply(this, arguments); const mb = this.el.modal.querySelector('.mb'); if (!mb) return; const sb = SHORE.bag(), gb = GARDEN.bag(), p = this.p;
    const sh = SHORE_ITEMS.filter(D => sb[D.id] > 0).map(D => `<li><span class="ic">${D.kind === 'glass' ? '🔹' : D.kind === 'wood' ? '🪵' : D.kind === 'float' ? '🫧' : '🐚'}</span><div><b>${esc(D.name)}</b> ×${sb[D.id]}<div class="sub">${'★'.repeat(D.st)}　商店で${yen(D.p)}</div></div></li>`).join('');
    const vg = CROPS.filter(C => gb.veg[C.id] > 0).map(C => `<li><span class="ic">${C.ic}</span><div><b>${esc(C.name)}</b> ×${gb.veg[C.id]}<div class="sub">商店で${yen(C.sell)}</div></div></li>`).join('');
    const sd = CROPS.filter(C => gb.seeds[C.id] > 0).map(C => `${C.name}×${gb.seeds[C.id]}`).join('・');
    const bt = (p.bottles || []).map((q, k) => `<li><span class="ic">🍾</span><div><b>${esc(SHORE_LETTERS[q.i][0])}</b><div class="sub">${q.date} にひろった</div></div><button class="rel" data-letter="${q.i}">読む</button></li>`).join('');
    const h = document.createElement('div'); h.innerHTML = `<h3 class="bh">浜の拾いもの（${SHORE.count()}/${SHORE.CAP}）</h3><ul class="list">${sh || '<li><div class="sub">まだ何もありません（砂浜で、きらっと光るものを F でひろおう）</div></li>'}</ul>
      <h3 class="bh">畑</h3><ul class="list">${vg || ''}<li><span class="ic">🌱</span><div><b>たね</b><div class="sub">${sd || 'なし（商店の「たね」で買えます）'}${gb.fert ? `　ひりょう×${gb.fert}` : ''}</div></div></li></ul>${bt ? `<h3 class="bh">びんの手紙</h3><ul class="list">${bt}</ul>` : ''}`;
    const tl = mb.querySelectorAll('h3.bh'); const tools = tl[tl.length - 1]; mb.insertBefore(h, tools || null);
    const box = this.el.modal.querySelector('.journal'), prev = box.onclick; box.onclick = e => { const l = e.target.closest('[data-letter]'); if (l) return SHORE.readLetter(+l.dataset.letter, false); prev && prev(e); }; }; }
{ const _zt = GAME.zukanTab; GAME.zukanTab = function () { const p = this.p, Z = p.shorez || {}, V = p.vegz || {}, got = Object.keys(Z).length;
    return _zt.apply(this, arguments) + `<h3 class="bh" style="margin-top:14px">浜辺のたからもの ${got} / ${SHORE_ITEMS.length}種類　・　ひろった数 ${p.stats.shoreN || 0}こ</h3>
    <ul class="list zukan">${SHORE_ITEMS.map(D => { const r = Z[D.id]; return `<li class="${r ? 'done' : 'lock'}"><span class="ck">${r ? '🐚' : '？'}</span><div><b>${r ? esc(D.name) : '？？？'}</b>　<span class="pr">${'★'.repeat(D.st)}</span><div class="sub">${r ? `${r}こ　${esc(D.note)}` : '砂浜の波打ちぎわ'}</div></div></li>`; }).join('')}</ul>
    <h3 class="bh" style="margin-top:14px">畑の収穫 ${Object.keys(V).length} / ${CROPS.length}種類　・　収穫した数 ${p.stats.vegN || 0}こ</h3>
    <ul class="list zukan">${CROPS.map(C => { const r = V[C.id]; const ss = C.sow.map(([m0, , m1]) => `${m0}〜${m1}月`).join('・'); return `<li class="${r ? 'done' : 'lock'}"><span class="ck">${r ? C.ic : '？'}</span><div><b>${esc(C.name)}</b><div class="sub">たねまき ${ss}${r ? `　${r}こ収穫` : ''}</div></div></li>`; }).join('')}</ul>`; }; }
SHOPX.tabs.push({ id: 'seed', label: 'たね', body() { const b = GARDEN.bag(), now = CROPS.filter(c => GARDEN.inSeason(c)), later = CROPS.filter(c => !GARDEN.inSeason(c));
    return `<ul class="glist">${now.map(c => `<li><div class="th">${c.ic}</div><div class="in"><b>${esc(c.name)}のたね</b><span class="own">3つぶ入り・持っている ${b.seeds[c.id] || 0}<br>${c.days}日で収穫${c.multi ? `・${c.multi}回実る` : ''}・1こ${yen(c.sell)}</span></div><button class="buy" data-seed="${c.id}" ${this.p.money < c.seed ? 'disabled' : ''}>${yen(c.seed)}</button></li>`).join('')}
      <li><div class="th">🧪</div><div class="in"><b>ひりょう</b><span class="own">持っている ${b.fert}　1マスが1日分はやく育つ</span></div><button class="buy" data-fert="1" ${this.p.money < 150 ? 'disabled' : ''}>${yen(150)}</button></li></ul>
      <p class="small">いまの季節にまけるたねだけ並んでいます。${later.length ? `ほかの季節：${later.map(c => c.name).join('・')}` : ''}<br>畑は家のよこ。たねをまいて、毎日水やりしよう。</p>`; },
  click(e) { const b = GARDEN.bag(); const s = e.target.closest('[data-seed]'); if (s && !s.disabled) { const c = GARDEN.crop(s.dataset.seed); this.p.money -= c.seed; b.seeds[c.id] = (b.seeds[c.id] || 0) + 3; UI.toast(`🌱 ${c.name}のたねを買った（3つぶ）`); this.dirty = true; this.renderTracker(); this.openShop('seed'); return true; }
    const f = e.target.closest('[data-fert]'); if (f && !f.disabled) { this.p.money -= 150; b.fert++; UI.toast('🧪 ひりょうを買った'); this.dirty = true; this.renderTracker(); this.openShop('seed'); return true; } return false; } });
SHOPX.tabs.push({ id: 'sellx', label: '拾いもの・野菜の買い取り', body() { const sb = SHORE.bag(), gb = GARDEN.bag();
    const rows = SHORE_ITEMS.filter(D => sb[D.id] > 0 && D.p > 0).map(D => `<li><div class="th">🐚</div><div class="in"><b>${esc(D.name)} ×${sb[D.id]}</b><span class="own">${'★'.repeat(D.st)}　1こ ${yen(D.p)}</span></div><button class="buy" data-sells="${D.id}">1こ売る</button></li>`)
      .concat(CROPS.filter(C => gb.veg[C.id] > 0).map(C => `<li><div class="th">${C.ic}</div><div class="in"><b>${esc(C.name)} ×${gb.veg[C.id]}</b><span class="own">1こ ${yen(C.sell)}</span></div><button class="buy" data-sellv="${C.id}">1こ売る</button></li>`));
    const tot = SHORE_ITEMS.reduce((s, D) => s + (sb[D.id] || 0) * D.p, 0) + CROPS.reduce((s, C) => s + (gb.veg[C.id] || 0) * C.sell, 0);
    return rows.length ? `<ul class="glist">${rows.join('')}</ul><button class="buy" data-sellxall="1" style="margin-top:10px;width:100%">ぜんぶ売る（${yen(tot)}）</button>` : '<p>売れるものを持っていません。砂浜の拾いものや、畑の野菜を買い取ります。</p>'; },
  click(e) { const sb = SHORE.bag(), gb = GARDEN.bag(); let got = 0;
    const s = e.target.closest('[data-sells]'); if (s) { const D = SHORE.def(s.dataset.sells); if (sb[D.id] > 0) { sb[D.id]--; got = D.p; UI.toast(`🐚 ${D.name}が ${yen(D.p)} で売れた！`); } }
    const v = e.target.closest('[data-sellv]'); if (v) { const C = GARDEN.crop(v.dataset.sellv); if (gb.veg[C.id] > 0) { gb.veg[C.id]--; got = C.sell; UI.toast(`${C.ic} ${C.name}が ${yen(C.sell)} で売れた！`); } }
    if (e.target.closest('[data-sellxall]')) { for (const D of SHORE_ITEMS) if (D.p > 0 && sb[D.id] > 0) { got += sb[D.id] * D.p; sb[D.id] = 0; } for (const C of CROPS) if (gb.veg[C.id] > 0) { got += gb.veg[C.id] * C.sell; gb.veg[C.id] = 0; } UI.toast(`💰 ぜんぶ売って ${yen(got)} もらった！`); }
    if (s || v || e.target.closest('[data-sellxall]')) { if (got) this.addMoney(got); this.dirty = true; this.openShop('sellx'); return true; } return false; } });
// gifts: finds and vegetables
const GIFT_LOVE = { v_gen: ['daikon', 'negi', 'satsumaimo', 'driftwood'], v_hana: ['tomato', 'ichigo', 'edamame', 'sakura'], v_mio: ['sakura', 'takara', 'ichigo'], v_yuki: ['glass_blue', 'glass_g', 'uki'], v_kai: ['tamanegi', 'nasu', 'kyuri'], v_rin: ['itaya', 'takara'], v_kota: ['kanizume', 'uni', 'satsumaimo'], v_sora: ['jagaimo', 'kyuri'], v_takumi: ['driftwood', 'uki'], v_nagi: ['glass_w', 'hamaguri'] };
{ const _gb = GAME.giftables; GAME.giftables = function () { return _gb.apply(this, arguments) || SHORE.count() > 0 || Object.values(GARDEN.bag().veg).some(v => v > 0); };
  const _og = GAME.openGift; GAME.openGift = function (n) { _og.call(this, n); const box = this.el.modal.querySelector('.gifts'); if (!box) return; const sb = SHORE.bag(), gb = GARDEN.bag();
    box.insertAdjacentHTML('beforeend', SHORE_ITEMS.filter(D => sb[D.id] > 0).map(D => `<button class="gi" data-gs="${D.id}"><span>🐚</span><b>${esc(D.name)}</b><small>${'★'.repeat(D.st)}</small></button>`).join('') + CROPS.filter(C => gb.veg[C.id] > 0).map(C => `<button class="gi" data-gv="${C.id}"><span>${C.ic}</span><b>${esc(C.name)}</b><small>とれたて</small></button>`).join(''));
    const jb = this.el.modal.querySelector('.journal'), prev = jb.onclick; jb.onclick = e => { const a = e.target.closest('[data-gs],[data-gv]'); if (!a) return prev && prev(e);
      const isS = !!a.dataset.gs, id = a.dataset.gs || a.dataset.gv, name = isS ? SHORE.def(id).name : GARDEN.crop(id).name; if (isS) sb[id]--; else gb.veg[id]--;
      const love = (GIFT_LOVE[n.def.id] || []).includes(id), rare = isS && SHORE.def(id).st >= 3, pts = love ? 3 : rare || !isS ? 2 : 1, p = this.p, vid = n.def.id;
      p.friend[vid] = (p.friend[vid] || 0) + pts; p.daily.gifted = p.daily.gifted || {}; p.daily.gifted[vid] = 1; p.stats.giftN++; this.modal = null; this.el.modal.hidden = true; this.el.modal.innerHTML = '';
      const t = love ? `えっ、${name}！？ これ、大好きなの…！ ほんとにありがとう！` : !isS ? `とれたての${name}！ ${p.name}さんが育てたの？ 今夜さっそくいただくね。` : rare ? `${name}…！ こんなにきれいなの、はじめて見た。宝物にするね。` : `${name}だね。浜でひろったの？ ありがとう！`;
      DIALOG.npc = n; DIALOG.pages = [t]; DIALOG.i = 0; DIALOG.choices = null; UI.dialog(n.def.name, t); UI.toast(`🎁 ${name}をプレゼントした　なかよし +${pts}`); this.dirty = true; this.save(); }; }; }

// ---------- daily requests and island goals that use the beach and the garden ----------
DAILY_POOL.push(
  { id: 'shore2', who: 'v_mio', text: '浜で拾いものを2つひろう', n: 2, stat: 'shoreN', ask: '砂浜って、毎朝いろんなものが流れつくんだよ。きらっと光るのを2つ見つけてきて！' },
  { id: 'water1', who: 'v_gen', text: '家の畑に水やりをする', n: 1, stat: 'waterN', need: p => !!(p.garden && p.garden.x !== undefined && p.garden.cells.some(c => c)), ask: '畑の野菜、ちゃんと水をやっとるか？ 野菜は毎日の世話がいちばん大事じゃ。' });
GOALS.push(
  { id: 'shore10', text: '浜で拾いものを10こひろう', n: 10, stat: 'shoreN', pts: 15 },
  { id: 'shorez8', text: '浜辺のたからもの図鑑を8種類うめる', n: 8, prog: () => Object.keys(GAME.p.shorez || {}).length, pts: 25 },
  { id: 'veg10', text: '畑で野菜を10こ収穫する', n: 10, stat: 'vegN', pts: 20 });
STAT_KEYS.push('shoreN', 'vegN', 'waterN');
