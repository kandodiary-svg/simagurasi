// ===================== 船の漁: 底引き網（えい網）・定置網・魚倉・水揚げ（せり） =====================
// new species that only come up in nets (rods never catch them)
FISH.push(
  { id: 'shitabirame', name: 'シタビラメ（ゲタ）', env: ['trawl'], st: 2, sz: [15, 30], net: 1, note: '瀬戸内では「ゲタ」とよばれる。煮つけが絶品。' },
  { id: 'kuruma', name: 'クルマエビ', env: ['trawl'], st: 3, sz: [10, 22], net: 1, note: '夜に砂から出てくる高級エビ。曲げるとしま模様が車輪みたい。' },
  { id: 'shako', name: 'シャコ', env: ['trawl'], st: 2, sz: [10, 18], net: 1, note: '泥の海底に穴をほってすむ。春から初夏の子持ちが人気。' },
  { id: 'gazami', name: 'ガザミ（ワタリガニ）', env: ['trawl'], st: 3, sz: [12, 25], net: 1, note: '後ろ足がオールの形で、泳げるカニ。（大きさは甲羅の幅）' },
  { id: 'iidako', name: 'イイダコ', env: ['trawl'], st: 2, sz: [10, 25], net: 1, note: '冬〜春、胴にご飯つぶのような卵をもつ小さなタコ。' },
  { id: 'hamo', name: 'ハモ', env: ['trawl'], st: 3, sz: [50, 100], net: 1, note: '夏の京都・大阪へ出荷される。するどい歯に注意。' },
  { id: 'anago', name: 'マアナゴ', env: ['trawl'], st: 2, sz: [30, 70], net: 1, note: '夜行性。瀬戸内の焼きあなごの材料。' },
  { id: 'kouika', name: 'コウイカ（スミイカ）', env: ['trawl', 'setnet'], st: 2, sz: [15, 30], net: 1, note: '体の中にかたい甲（こう）がある。墨をたくさんはく。' },
  { id: 'eso', name: 'エソ', env: ['trawl'], st: 1, sz: [20, 40], net: 1, note: '小骨が多いので、かまぼこの材料になる。' },
  { id: 'bera', name: 'キュウセン（ベラ）', env: ['trawl'], st: 1, sz: [12, 25], net: 1, note: '夜は砂にもぐってねむる。瀬戸内では塩焼きで食べる。' },
  { id: 'iwashi', name: 'カタクチイワシ', env: ['setnet'], st: 1, sz: [8, 15], net: 1, note: '大群で回ってくる。ちりめんじゃこやいりこになる。' },
  { id: 'saba', name: 'マサバ', env: ['setnet'], st: 2, sz: [25, 45], net: 1, note: '夏〜秋に群れで入る。足が早い（いたみやすい）。' },
  { id: 'manbou', name: 'マンボウ', env: ['setnet'], st: 4, sz: [80, 200], net: 1, note: '夏の定置網にまれに入る、ふしぎな形の大きな魚。' },
  { id: 'umigame', name: 'アカウミガメ', env: ['setnet'], st: 4, sz: [60, 95], net: 1, note: '定置網に迷いこむことがある。見つけたら海へ放す（甲羅の長さ）。' },
);
ENV_NAME.trawl = '底引き網（漁船）'; ENV_NAME.setnet = '定置網';
[['karei', 'trawl'], ['hirame', 'trawl'], ['tako', 'trawl'], ['madai', 'trawl'], ['madai', 'setnet'], ['sawara', 'setnet'], ['buri', 'setnet'], ['hamachi', 'setnet'], ['aji', 'setnet'], ['tachiuo', 'setnet'], ['suzuki', 'setnet'], ['ika', 'setnet'], ['mebaru', 'setnet']].forEach(([id, e]) => { const f = FISH.find(q => q.id === id); if (f && !f.env.includes(e)) f.env.push(e); });
Object.assign(FISH_WF, { kuruma: 0.9, shako: 0.9, gazami: 4, iidako: 0.6, hamo: 0.25, anago: 0.15, kouika: 4, eso: 0.6, bera: 0.9, shitabirame: 0.7, iwashi: 0.9, saba: 1.0, manbou: 4, umigame: 10 });
// hama-ne (price at the fish market) yen per kg
const NET_PRICE = { karei: 1200, hirame: 2500, shitabirame: 1500, kuruma: 8000, shako: 2500, gazami: 3000, tako: 1500, iidako: 1500, hamo: 2000, anago: 1800, kouika: 1500, eso: 300, bera: 600, madai: 1500, sawara: 1500, buri: 900, hamachi: 800, aji: 700, saba: 400, iwashi: 150, tachiuo: 1200, suzuki: 800, ika: 3000, mebaru: 1500, manbou: 500 };
const BYCATCH = { hitode: ['ヒトデ', '⭐'], kurage: ['ミズクラゲ', '🪼'], gomi: ['海底ごみ（ポリ袋・空き缶など）', '🗑️'] };
// ---------- species mix ----------
const FSH = { trawl: null, nets: [], netGroup: null, hold: null, panel: null };
FSH.season = () => { const m = seasonDate().getMonth() + 1; return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter'; };
FSH.trawlMix = function (depth) {
  const s = FSH.season(), h = currentHour(), night = h >= 19 || h < 5, deep = depth > 14, W = {};
  const add = (id, w) => { W[id] = (W[id] || 0) + w; };
  add('karei', s === 'winter' || s === 'spring' ? 14 : 6); add('shitabirame', deep ? 9 : 5); add('hirame', deep ? 4 : 2); add('eso', 7); add('bera', deep ? 3 : 8); add('tako', s === 'summer' ? 7 : 3);
  add('kouika', s === 'spring' ? 9 : 3); add('iidako', s === 'winter' || s === 'spring' ? 8 : 1); add('shako', s === 'spring' || s === 'summer' ? 9 : 3); add('gazami', s === 'summer' || s === 'autumn' ? 5 : 1.5);
  add('hamo', s === 'summer' ? (deep ? 6 : 3) : 0.8); add('anago', night ? 9 : 4); add('kuruma', (s === 'summer' || s === 'autumn' ? 4 : 1) * (night ? 2.2 : 1)); add('madai', deep ? 2 : 0.6);
  return W;
};
FSH.setMix = function () {
  const s = FSH.season(), W = {}, add = (id, w) => { W[id] = (W[id] || 0) + w; };
  if (s === 'spring') { add('sawara', 16); add('madai', 10); add('iwashi', 12); add('aji', 8); add('kouika', 8); add('suzuki', 4); add('mebaru', 5); }
  else if (s === 'summer') { add('aji', 16); add('saba', 12); add('iwashi', 14); add('tachiuo', 6); add('hamachi', 6); add('suzuki', 6); add('ika', 3); }
  else if (s === 'autumn') { add('hamachi', 16); add('buri', 5); add('sawara', 10); add('tachiuo', 10); add('aji', 10); add('saba', 10); add('madai', 5); add('ika', 5); }
  else { add('buri', 10); add('hamachi', 8); add('mebaru', 10); add('suzuki', 8); add('kouika', 4); add('aji', 4); }
  return W;
};
// split a total weight into individuals of real-looking sizes
FSH.compose = function (W, totalKg, opts = {}) {
  const ids = Object.keys(W).filter(k => W[k] > 0), sum = ids.reduce((s, k) => s + W[k], 0), out = {};
  for (const id of ids) { const f = FISH.find(q => q.id === id); if (!f) continue; let share = totalKg * W[id] / sum * (0.5 + Math.random()); let n = 0, kg = 0, max = 0;
    while (kg < share && n < 4000) { const u = Math.pow(Math.random(), 1.6), L = Math.round(f.sz[0] + (f.sz[1] - f.sz[0]) * u), w = FISHX.kg(f, L); if (kg > 0 && kg + w > share * 1.15) break; kg += w; n++; max = Math.max(max, L); }
    if (n) out[id] = { n, kg, max }; }
  if (opts.rare) for (const [id, pr] of opts.rare) if (Math.random() < pr) { const f = FISH.find(q => q.id === id), L = Math.round(f.sz[0] + (f.sz[1] - f.sz[0]) * Math.random()); out[id] = { n: 1, kg: FISHX.kg(f, L), max: L }; }
  return out;
};
// ---------- the hold (魚倉) ----------
const HOLD_CAP = 400;
const hid = (o, k, v) => Object.defineProperty(o, k, { value: v, writable: true, enumerable: false, configurable: true }); // not saved
FSH.hold = () => { const p = GAME.p; p.hold = p.hold || { fish: {}, by: {} }; return p.hold; };
FSH.holdKg = () => { const H = FSH.hold(); return Object.values(H.fish).reduce((s, q) => s + q.kg, 0); };
FSH.isFishingBoat = v => v && v.kind === 'boat' && (v.model || 'boat') === 'boat';
// put a haul into the hold; returns lines for the result card
FSH.store = function (catchObj, by) {
  const p = GAME.p, H = FSH.hold(), room = Math.max(0, HOLD_CAP - FSH.holdKg()), tot = Object.values(catchObj).reduce((s, q) => s + q.kg, 0), k = tot > room ? room / tot : 1, rows = []; let newZ = [];
  p.fish = p.fish || {};
  for (const [id, q] of Object.entries(catchObj).sort((a, b) => b[1].kg - a[1].kg)) {
    const f = FISH.find(z => z.id === id); if (id === 'umigame') { rows.push({ id, name: f.name, n: q.n, kg: q.kg, note: '海へ放した 🐢（元気度 +5）', rel: 1 }); GAME.addVit(5); const r = p.fish[id]; if (!r) newZ.push(f.name); p.fish[id] = { n: (r ? r.n : 0) + 1, max: Math.max(r ? r.max : 0, q.max) }; continue; }
    const kg = q.kg * k, n = Math.max(1, Math.round(q.n * k)); const cur = H.fish[id] || { n: 0, kg: 0, max: 0 }; H.fish[id] = { n: cur.n + n, kg: cur.kg + kg, max: Math.max(cur.max, q.max) };
    const r = p.fish[id]; if (!r) newZ.push(f.name); p.fish[id] = { n: (r ? r.n : 0) + n, max: Math.max(r ? r.max : 0, q.max) };
    rows.push({ id, name: f.name, n, kg, max: q.max, ppk: NET_PRICE[id] || 500 });
  }
  for (const [b, kg] of Object.entries(by || {})) if (kg > 0.05) { if (b === 'gomi') H.by.gomi = (H.by.gomi || 0) + kg; rows.push({ id: b, name: BYCATCH[b][0], kg, by: 1, note: b === 'gomi' ? '持ち帰って港で処分' : '海へもどした' }); }
  p.stats.fishN += rows.filter(r => !r.by && !r.rel).reduce((s, r) => s + r.n, 0); GAME.dirty = true; GAME.check();
  return { rows, full: k < 1, newZ };
};
FSH.showHaul = function (title, sub, res) {
  const g = GAME; g.modal = 'haul'; const tot = res.rows.filter(r => !r.by && !r.rel).reduce((s, r) => s + r.kg, 0), val = res.rows.filter(r => r.ppk).reduce((s, r) => s + r.kg * r.ppk, 0);
  g.el.modal.innerHTML = `<div class="mbox haulbox"><div class="mh"><h2>${title}</h2><span class="isl">${sub}</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
    <p class="small" style="margin:0 0 6px">漁獲 <b>${tot.toFixed(1)}kg</b>（浜値の目安 ${yen(val)}）　魚倉 ${FSH.holdKg().toFixed(0)} / ${HOLD_CAP}kg${res.full ? '　<b style="color:#c33">魚倉がいっぱいで一部を海へもどした</b>' : ''}${res.newZ.length ? `<br>📖 図鑑にのった：${res.newZ.map(esc).join('・')}` : ''}</p>
    <ul class="list haullist">${res.rows.map(r => `<li><span class="ck">${r.by ? BYCATCH[r.id][1] : r.rel ? '🐢' : '🐟'}</span><div><b>${esc(r.name)}</b>${r.n ? ` ×${r.n}` : ''}<div class="sub">${r.note ? esc(r.note) : `最大 ${r.max}cm　${yen(r.ppk)}/kg`}</div></div><span class="rv">${r.kg.toFixed(1)}kg</span></li>`).join('')}</ul>
    <p class="small" style="margin:6px 0 0">港の近くで船をとめて <b>T</b>（「水揚げ」ボタン）か、陸の「漁協 出荷所」で売れます。</p></div>`;
  g.el.modal.hidden = false; g.el.modal.querySelector('[data-x="close"]').onclick = () => g.closeModal();
};
// ---------- zones ----------
FSH.depth = (x, z) => Math.max(0, -groundH(x, z));
FSH.shore = function (x, z) { for (let r = 6; r <= 170; r += 6) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, px = x + Math.sin(a) * r, pz = z + Math.cos(a) * r; if (groundH(px, pz) > -0.3) return { d: r, a, x: px, z: pz }; } return { d: 999, a: 0 }; };
FSH.noFishing = function (x, z) {
  const L = GAME.LM, D = GAME.devState(); if (L.harbor && Math.hypot(x - L.harbor.x, z - L.harbor.z) < 85) return '港の中は漁ができません';
  if (L.beach && Math.hypot(x - L.beach.x, z - L.beach.z) < 70) return '海水浴場の近くは漁ができません';
  for (const id of ['r_marina', 'r_lagoon', 'pier']) { const s = D[id]; if (s && s.state === 'done' && isFinite(s.x) && Math.hypot(x - s.x, z - s.z) < (id === 'pier' ? 40 : 70)) return id === 'pier' ? '観光船の桟橋の近くは漁ができません' : 'マリーナの近くは漁ができません'; }
  return null;
};
// =================== 底引き網 (small trawl, えびこぎ網) ===================
const TRAWL_LEN = 34, TRAWL_MAX = 260;
FSH.trawlKey = function () {
  const v = PL.veh, T = FSH.trawl; if (!FSH.isFishingBoat(v)) return UI.toast('底引き網は漁船でできます（ガレージで漁船に乗りかえよう）');
  if (T && T.phase === 'tow') return FSH.haulTrawl();
  if (T) return;
  const why = FSH.noFishing(v.x, v.z); if (why) return UI.toast('🚫 ' + why);
  const dp = FSH.depth(v.x, v.z); if (dp < 5) return UI.toast(`水深 ${dp.toFixed(1)}m。底引き網は水深5m以上の砂地で（もっと沖へ）`);
  if (FSH.holdKg() >= HOLD_CAP - 5) return UI.toast('魚倉がいっぱい。港で水揚げしよう');
  FSH.trawl = { v, phase: 'shoot', t: 0, trail: [{ x: v.x, z: v.z }], dist: 0, meters: 0, kg: 0, mix: {}, by: { hitode: 0, gomi: 0 }, snagT: 0, depthSum: 0 };
  FSH.trawlMesh(true); UI.toast('🕸️ 網を入れる…（ゆっくり 1〜2ノットで引こう）'); try { SND.play('splash', { vol: 0.7 }); } catch (e) { }
};
FSH.trawlMesh = function (on) {
  let M = FSH.tm; if (!M) {
    M = FSH.tm = new THREE.Group(); const lm = new THREE.LineBasicMaterial({ color: '#2a2a26' }); M.warps = [0, 1].map(() => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]), lm); l.frustumCulled = false; M.add(l); return l; });
    const [c, x] = cvs(64, 64); x.clearRect(0, 0, 64, 64); x.strokeStyle = '#e8e0c8'; x.lineWidth = 2; for (let k = 0; k <= 64; k += 8) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 32, 64); x.stroke(); x.beginPath(); x.moveTo(k, 0); x.lineTo(k - 32, 64); x.stroke(); } const tx = toTex(c, false); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(5, 3);
    const nm = new THREE.MeshStandardMaterial({ map: tx, color: '#c86a3a', transparent: true, opacity: 0.85, alphaTest: 0.2, side: THREE.DoubleSide, roughness: 0.9 });
    M.net = new THREE.Mesh(new THREE.ConeGeometry(1.6, 7, 10, 1, true), nm); M.net.rotation.x = -Math.PI / 2; const ng = new THREE.Group(); ng.add(M.net); M.netG = ng; M.add(ng);
    M.bag = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), nm); M.bag.scale.set(0.9, 0.75, 1.5); M.bag.visible = false; M.add(M.bag);
    const fishy = new THREE.Mesh(new THREE.SphereGeometry(0.92, 10, 6), new THREE.MeshStandardMaterial({ color: '#9aa6a0', roughness: 0.3, metalness: 0.4 })); fishy.scale.set(0.85, 0.7, 1.4); M.bag.add(fishy); M.fishy = fishy;
    // mud plumes stirred up behind the net
    M.mud = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14), new THREE.MeshBasicMaterial({ color: '#8a7a54', transparent: true, opacity: 0.33, depthWrite: false }), 60); M.mud.frustumCulled = false; M.mud.count = 0; M.mudL = []; M.add(M.mud);
    scene.add(M);
  }
  M.visible = on; if (!on) { M.mudL = []; M.mud.count = 0; M.bag.visible = false; }
};
FSH.trailAt = function (T, back) { // point `back` meters behind the boat along the path it took
  const tr = T.trail; let rem = back; for (let i = tr.length - 1; i > 0; i--) { const a = tr[i], b = tr[i - 1], d = Math.hypot(a.x - b.x, a.z - b.z); if (d >= rem) { const k = rem / Math.max(1e-6, d); return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, ax: b.x - a.x, az: b.z - a.z }; } rem -= d; } const b = tr[0]; return { x: b.x, z: b.z, ax: 0, az: -1, short: true };
};
FSH.updateTrawl = function (dt) {
  const T = FSH.trawl; if (!T) return; const v = T.v, M = FSH.tm; T.t += dt;
  if (PL.veh !== v) { FSH.trawl = null; FSH.trawlMesh(false); return UI.toast('網を回収した（船をおりたので漁を中止）'); }
  const last = T.trail[T.trail.length - 1]; const step = Math.hypot(v.x - last.x, v.z - last.z); if (step > 0.5) { T.trail.push({ x: v.x, z: v.z }); if (T.trail.length > 400) T.trail.shift(); T.dist += step; }
  const s = Math.sin(v.rot), c = Math.cos(v.rot), len = (VSPEC.boat.len || 4.2), sy = v.mesh.position.y + 0.6;
  if (T.phase === 'shoot' || T.phase === 'tow') {
    const back = T.phase === 'shoot' ? Math.min(TRAWL_LEN, 4 + T.t * 8) : TRAWL_LEN, np = FSH.trailAt(T, back), dp = FSH.depth(np.x, np.z), ny = -Math.min(dp - 0.6, 3.2) - 0.3;
    if (T.phase === 'shoot' && T.t > 4) { T.phase = 'tow'; UI.toast('網が海底についた。ゆっくり引いて、もう一度 N で網を揚げる'); }
    // warps from the stern corners into the water
    [-1, 1].forEach((sd, k) => { const ex = v.x - s * len * 0.48 + c * sd * 0.45, ez = v.z - c * len * 0.48 - s * sd * 0.45, pos = M.warps[k].geometry.attributes.position, mx = ex + (np.x - ex) * 0.22, mz = ez + (np.z - ez) * 0.22; pos.setXYZ(0, ex, sy, ez); pos.setXYZ(1, mx + c * sd * 0.8, -0.05, mz - s * sd * 0.8); pos.setXYZ(2, np.x + c * sd * 1.4, ny + 0.6, np.z - s * sd * 1.4); pos.needsUpdate = true; });
    M.netG.position.set(np.x, ny, np.z); M.netG.rotation.y = Math.atan2(np.ax, np.az); M.net.position.z = 2.8;
    // speed limit while towing (the gear is heavy)
    const lim = T.phase === 'tow' ? 2.4 : 1.6; if (v.v > lim) v.v = Math.max(lim, v.v - dt * 6); if (v.v < -0.4) v.v = -0.4;
    if (T.phase === 'tow') {
      const sp = Math.abs(v.v), mv = sp * dt; T.meters += mv; T.depthSum += dp * mv;
      if (dp < 3) { T.snagT += dt; if (T.snagT > 1.2) { T.torn = true; FSH.msg('⚠️ 網が海底の岩にひっかかって破れた！ 揚げよう（N）'); T.kg *= 0.5; for (const k in T.mix) T.mix[k] *= 0.5; T.phase = 'tow'; T.snagT = -999; } else FSH.msg('⚠️ 浅い！ 網が海底にひっかかりそう'); }
      else if (dp > 45) FSH.msg('深すぎて網が底にとどかない');
      else if (!T.torn && T.kg < TRAWL_MAX && sp > 0.4) { const rate = (dp > 12 ? 0.16 : 0.12) * (sp > 2.0 ? 0.85 : 1) * (FSH.noFishing(np.x, np.z) ? 0 : 1) * (0.6 + 0.4 * FISHX.cond('sea').act); const add = rate * mv; T.kg = Math.min(TRAWL_MAX, T.kg + add); const W = FSH.trawlMix(dp); for (const k in W) T.mix[k] = (T.mix[k] || 0) + W[k] * add; T.by.hitode += add * 0.05; T.by.gomi += add * 0.035; if (T.kg >= TRAWL_MAX) FSH.msg('網がいっぱいになった。揚げよう（N）'); }
      if (sp > 0.3 && Math.random() < dt * 4 * Math.min(1, sp)) { M.mudL.push({ x: np.x + (Math.random() - 0.5) * 3, z: np.z + (Math.random() - 0.5) * 3, t: 0, s: 1.5 + Math.random() * 2 }); if (M.mudL.length > 60) M.mudL.shift(); }
    }
  } else if (T.phase === 'haul') {
    v.v *= Math.max(0, 1 - dt * 3); const k = Math.min(1, T.t / 5), back = TRAWL_LEN * (1 - k) + 3, np = FSH.trailAt(T, back), ny = -2.5 * (1 - k) + k * 1.6;
    [-1, 1].forEach((sd, j) => { const ex = v.x - s * len * 0.48 + c * sd * 0.45, ez = v.z - c * len * 0.48 - s * sd * 0.45, pos = M.warps[j].geometry.attributes.position; pos.setXYZ(0, ex, sy + 1.2, ez); pos.setXYZ(1, (ex + np.x) / 2, Math.max(-0.05, ny * 0.5), (ez + np.z) / 2); pos.setXYZ(2, np.x, ny + 0.4, np.z); pos.needsUpdate = true; });
    M.netG.position.set(np.x, ny - 0.5, np.z); M.netG.visible = k < 0.75; M.bag.visible = k > 0.55; const bx = v.x - s * (len * 0.55 + 1.2), bz = v.z - c * (len * 0.55 + 1.2); M.bag.position.set(bx, sy + 0.4 + Math.sin(T.t * 3) * 0.05 + (1 - Math.min(1, (k - 0.55) * 4)) * -1.5, bz); const fill = Math.max(0.35, Math.min(1.3, Math.sqrt(T.kg / 80))); M.bag.scale.set(0.9 * fill, 0.75 * fill, 1.5 * fill); M.fishy.material.color.set(T.kg > 1 ? '#a8b0a6' : '#7a7a6a');
    if (Math.random() < dt * 6 && k > 0.5) FSH.drip(M.bag.position);
    if (T.t > 6.2) FSH.finishTrawl();
  }
  // mud fades
  const D = new THREE.Object3D(); let n = 0; for (const m of M.mudL) { m.t += dt; const a = 1 - m.t / 40; if (a <= 0) continue; D.position.set(m.x, 0.04, m.z); D.rotation.set(-Math.PI / 2, 0, 0); D.scale.setScalar(m.s * (1 + m.t * 0.12) * a); D.updateMatrix(); M.mud.setMatrixAt(n++, D.matrix); } M.mud.count = n; M.mud.instanceMatrix.needsUpdate = true; M.mudL = M.mudL.filter(m => m.t < 40);
};
FSH.drip = function (p) { const R = LIFE.rod; if (R && R.ring) { GAME.splash({ x: p.x + (Math.random() - 0.5), y: 0, z: p.z + (Math.random() - 0.5) }, 0.3); } };
FSH.haulTrawl = function () { const T = FSH.trawl; if (!T || T.phase !== 'tow') return; T.phase = 'haul'; T.t = 0; UI.toast('⚙️ ネットローラーで網を巻き上げている…'); try { SND.play('reel_loop', { vol: 0.5 }); SND.play('splash', { vol: 0.6, delay: 4 }); } catch (e) { } };
FSH.finishTrawl = function () {
  const T = FSH.trawl; FSH.trawl = null; FSH.trawlMesh(false); FSH.tm.netG.visible = true;
  const tow = Math.round(T.meters); if (T.kg < 0.5) return UI.toast(`網を揚げた。…何も入っていない（引いた距離 ${tow}m）。もっと長く、水深のある砂地を引こう`);
  const sum = Object.values(T.mix).reduce((s, q) => s + q, 0), W = {}; for (const k in T.mix) W[k] = T.mix[k] / sum; const avgD = T.depthSum / Math.max(1, T.meters);
  const res = FSH.store(FSH.compose(W, T.kg), T.by); const p = GAME.p; p.fishery = p.fishery || { trawl: 0, set: 0, landKg: 0, landYen: 0 }; p.fishery.trawl++;
  FSH.showHaul('🕸️ 底引き網の水揚げ', `引いた距離 ${tow}m・平均水深 ${avgD.toFixed(0)}m${T.torn ? '・網が破れた' : ''}`, res); try { SND.play('splash', { vol: 0.8 }); SND.play('congrats', { vol: 0.4, delay: 0.3 }); } catch (e) { }
};
FSH.msg = function (t) { const now = performance.now(); if (FSH._mt && now - FSH._mt < 2500 && FSH._ms === t) return; FSH._mt = now; FSH._ms = t; UI.toast(t); };
// =================== 定置網 (set net: a trap the fish swim into along a leader net) ===================
const SETNET_PRICE = 300000, SETNET_MAX = 3, SETNET_RATE = 55, SETNET_CAP = 220; // kg per real hour, cap kg
FSH.setnets = () => { const p = GAME.p; p.setnets = p.setnets || []; return p.setnets; };
FSH.nearNet = function (x, z, r = 26) { let best = null, bd = r; for (const n of FSH.setnets()) { const d = Math.hypot(x - n.x, z - n.z); if (d < bd) { bd = d; best = n; } } return best; };
FSH.netKg = function (n) { const hrs = (Date.now() - (n.at || Date.now())) / 3600000, s = FSH.season(), sf = s === 'winter' ? 0.55 : s === 'autumn' ? 1.25 : 1; return Math.min(SETNET_CAP, SETNET_RATE * sf * hrs); };
FSH.setCheck = function (v) {
  const why = FSH.noFishing(v.x, v.z); if (why) return why; const dp = FSH.depth(v.x, v.z); if (dp < 6) return `水深 ${dp.toFixed(1)}m。定置網は水深6〜25mに`; if (dp > 25) return `水深 ${dp.toFixed(0)}m。深すぎます（6〜25m）`;
  const sh = FSH.shore(v.x, v.z); if (sh.d < 30) return '岸に近すぎます（30m以上はなす）'; if (sh.d > 150) return '岸から遠すぎます（垣網がとどかない：150m以内）';
  if (FSH.setnets().some(n => Math.hypot(n.x - v.x, n.z - v.z) < 70)) return 'ほかの定置網に近すぎます'; if (FSH.setnets().length >= SETNET_MAX) return `定置網は ${SETNET_MAX} か所まで`; return null;
};
FSH.setKey = function () {
  const v = PL.veh; if (!FSH.isFishingBoat(v)) return UI.toast('定置網は漁船で');
  const n = FSH.nearNet(v.x, v.z); if (n) return FSH.haulSet(n);
  const why = FSH.setCheck(v); if (why) return UI.toast('🚫 ' + why);
  const g = GAME, p = g.p; if ((p.money || 0) < SETNET_PRICE) return UI.toast(`定置網の設置には ${yen(SETNET_PRICE)} かかります`);
  g.modal = 'setnet';
  const sh = FSH.shore(v.x, v.z), dp = FSH.depth(v.x, v.z);
  g.el.modal.innerHTML = `<div class="mbox"><div class="mh"><h2>🧺 定置網を設置する</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><p>ここ（水深 ${dp.toFixed(0)}m・岸から ${sh.d}m）に定置網を張ります。岸からの「垣網」で魚の通り道をさえぎり、沖の「箱網」に魚を集めるしかけです。</p>
    <ul class="small" style="margin:4px 0 10px;padding-left:18px"><li>時間がたつほど魚がたまる（1時間に約${SETNET_RATE}kg・最大${SETNET_CAP}kg、季節で変わる）</li><li>船で近づいて <b>O</b> で「網起こし」。とれる魚は季節で変わる（春サワラ・夏アジサバ・秋ハマチ・冬ブリ…）</li><li>設置費 ${yen(SETNET_PRICE)}（あと ${SETNET_MAX - FSH.setnets().length} か所）。撤去はいつでも（費用は戻りません）</li></ul>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="ghost" data-x="close">やめる</button><button class="act" data-ok="1">${yen(SETNET_PRICE)} で設置</button></div></div>`;
  g.el.modal.hidden = false; g.el.modal.querySelectorAll('[data-x="close"]').forEach(b => b.onclick = () => g.closeModal());
  g.el.modal.querySelector('[data-ok]').onclick = () => { if ((p.money || 0) < SETNET_PRICE) return; p.money -= SETNET_PRICE; const rot = Math.atan2(sh.x - v.x, sh.z - v.z); FSH.setnets().push({ x: Math.round(v.x * 10) / 10, z: Math.round(v.z * 10) / 10, rot, at: Date.now(), lx: sh.x, lz: sh.z }); g.dirty = true; g.closeModal(); FSH.buildNets(); g.renderTracker(); UI.toast('🧺 定置網を設置した！ 時間がたったら網起こしに来よう'); try { SND.play('splash', { vol: 0.8 }); } catch (e) { } };
};
FSH.haulSet = function (n) {
  const v = PL.veh; if (Math.abs(v.v) > 1.2) return UI.toast('船をとめてから網起こし（S でブレーキ）'); if (FSH.lift) return;
  const mins = (Date.now() - n.at) / 60000; if (mins < 5) return UI.toast(`さっき起こしたばかり。魚が入るまで待とう（あと${Math.ceil(5 - mins)}分）`);
  if (FSH.holdKg() >= HOLD_CAP - 5) return UI.toast('魚倉がいっぱい。港で水揚げしよう');
  FSH.lift = { n, t: 0, kg: FSH.netKg(n) }; UI.toast('🧺 網起こし！ 箱網をしぼって魚を寄せる…');
};
FSH.updateLift = function (dt) {
  const L = FSH.lift; if (!L) return; L.t += dt; const v = PL.veh; if (v) v.v *= Math.max(0, 1 - dt * 3);
  const n = L.n, G = n._g; if (G && G.userData.bag) { const k = Math.min(1, L.t / 4); G.userData.bag.position.y = -2.6 + k * 2.4; G.userData.bag.scale.y = 1 - k * 0.7; }
  if (L.t > 1 && Math.random() < dt * (6 + L.kg / 20)) { const c = Math.cos(n.rot), s = Math.sin(n.rot), bx = n.x - Math.sin(n.rot) * 16, bz = n.z - Math.cos(n.rot) * 16; GAME.splash({ x: bx + (Math.random() - 0.5) * 8 * c, y: 0, z: bz + (Math.random() - 0.5) * 8 * s }, 0.5 + Math.random() * 0.5); }
  if (L.t > 5.5) {
    FSH.lift = null; const kg = L.kg; n.at = Date.now(); GAME.dirty = true; if (G && G.userData.bag) { G.userData.bag.position.y = -2.6; G.userData.bag.scale.y = 1; }
    const p = GAME.p; p.fishery = p.fishery || { trawl: 0, set: 0, landKg: 0, landYen: 0 }; p.fishery.set++;
    if (kg < 1) return UI.toast('網起こし…まだ魚が入っていない');
    const s = FSH.season(), res = FSH.store(FSH.compose(FSH.setMix(), kg, { rare: [['manbou', s === 'summer' ? 0.08 : 0.01], ['umigame', s === 'summer' ? 0.05 : 0.01]] }), { kurage: kg * (s === 'summer' ? 0.18 : 0.04) * Math.random(), gomi: kg * 0.01 });
    FSH.showHaul('🧺 定置網の網起こし', `季節：${{ spring: '春', summer: '夏', autumn: '秋', winter: '冬' }[s]}`, res); try { SND.play('splash', { vol: 0.9 }); SND.play('congrats', { vol: 0.4, delay: 0.3 }); } catch (e) { }
    FSH.buildNets();
  }
};
FSH.removeNet = function (n) { const a = FSH.setnets(), i = a.indexOf(n); if (i >= 0) a.splice(i, 1); GAME.dirty = true; FSH.buildNets(); UI.toast('定置網を撤去した'); };
// visuals: float lines, poles with flags, net walls hanging into the water, fish milling in the bag
FSH.buildNets = function () {
  if (FSH.netGroup) { scene.remove(FSH.netGroup); FSH.netGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  const G = FSH.netGroup = new THREE.Group(); scene.add(G); if (!GAME.p) return; const nets = FSH.setnets(); if (!nets.length) return;
  const floats = [], wallPos = [], ropePos = [], poleM = [];
  const fm = FSH._fm || (FSH._fm = { float: new THREE.MeshStandardMaterial({ color: '#f07a2a', roughness: 0.5 }), float2: new THREE.MeshStandardMaterial({ color: '#f4f2ea', roughness: 0.5 }), wall: new THREE.MeshStandardMaterial({ color: '#2a4a3a', transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide, roughness: 1 }), rope: new THREE.LineBasicMaterial({ color: '#d8d0b8' }), pole: new THREE.MeshStandardMaterial({ color: '#c8b070', roughness: 0.8 }), flag: new THREE.MeshStandardMaterial({ color: '#e83a2a', side: THREE.DoubleSide }), fish: new THREE.MeshStandardMaterial({ color: '#8a9aa6', roughness: 0.3, metalness: 0.4 }) });
  const rectLoop = (cx, cz, rot, hw, hd) => { const s = Math.sin(rot), c = Math.cos(rot), P = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([a, b]) => [cx + c * a + s * b, cz - s * a + c * b]); return P; };
  const seg = (a, b, step, drop) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(d / step)); for (let k = 0; k <= n; k++) { const t = k / n; floats.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, k % 4 === 0]); } ropePos.push(a[0], 0.06, a[1], b[0], 0.06, b[1]); if (drop) { const y1 = 0.08, y0 = -drop; wallPos.push(a[0], y1, a[1], b[0], y1, b[1], b[0], y0, b[1], a[0], y1, a[1], b[0], y0, b[1], a[0], y0, a[1]); } };
  for (const n of nets) {
    const fx = Math.sin(n.rot), fz = Math.cos(n.rot); // toward shore
    // 運動場 (playground) 26x14, then 箱網 (bag) further offshore 12x10
    const P = rectLoop(n.x, n.z, n.rot, 7, 13), bx = n.x - fx * 18, bz = n.z - fz * 18, B = rectLoop(bx, bz, n.rot, 5, 5), dp = Math.min(6, FSH.depth(n.x, n.z) - 0.5);
    for (let k = 0; k < 4; k++) { if (k === 2) { const a = P[2], b = P[3], m1 = [a[0] + (b[0] - a[0]) * 0.38, a[1] + (b[1] - a[1]) * 0.38], m2 = [a[0] + (b[0] - a[0]) * 0.62, a[1] + (b[1] - a[1]) * 0.62]; seg(a, m1, 1.6, dp); seg(m2, b, 1.6, dp); continue; } seg(P[k], P[(k + 1) % 4], 1.6, dp); }
    for (let k = 0; k < 4; k++) seg(B[k], B[(k + 1) % 4], 1.2, Math.min(7, FSH.depth(bx, bz) - 0.5));
    // leader net (垣網) to the shore, stopping where it gets shallow
    const lx = n.lx !== undefined ? n.lx : n.x + fx * 80, lz = n.lz !== undefined ? n.lz : n.z + fz * 80, a0 = [(P[2][0] + P[3][0]) / 2, (P[2][1] + P[3][1]) / 2]; let end = a0; const L = Math.hypot(lx - a0[0], lz - a0[1]); for (let d = 4; d < L; d += 3) { const px = a0[0] + (lx - a0[0]) * d / L, pz = a0[1] + (lz - a0[1]) * d / L; if (FSH.depth(px, pz) < 1.2) break; end = [px, pz]; } seg(a0, end, 2.2, 2.5);
    for (const q of [P[0], P[1], B[0], B[1], B[2], B[3]]) poleM.push(q);
    // the bag bottom that rises during 網起こし
    const g = new THREE.Group(); g.position.set(bx, 0, bz); g.rotation.y = n.rot; const bag = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), fm.wall); bag.rotation.x = -Math.PI / 2; bag.position.y = -2.6; g.add(bag); g.userData.bag = bag; G.add(g); hid(n, '_g', g);
    // fish milling inside (more when the net is full)
    const nf = Math.min(40, 4 + Math.round(FSH.netKg(n) / 6)), fi = new THREE.InstancedMesh(FSH._fg || (FSH._fg = new THREE.SphereGeometry(0.3, 6, 4).scale(0.35, 0.3, 1)), fm.fish, nf); fi.userData.ph = Array.from({ length: nf }, () => [Math.random() * 6.28, 1.5 + Math.random() * 3, 0.4 + Math.random() * 0.8, 0.3 + Math.random() * 1.5]); fi.position.set(bx, 0, bz); fi.frustumCulled = false; G.add(fi); hid(n, '_fi', fi);
  }
  const fg = new THREE.SphereGeometry(0.22, 8, 6), fl = floats.filter(f => !f[2]), fl2 = floats.filter(f => f[2]), D = new THREE.Object3D();
  [[fl, fm.float2], [fl2, fm.float]].forEach(([arr, mat]) => { if (!arr.length) return; const im = new THREE.InstancedMesh(fg, mat, arr.length); arr.forEach((f, i) => { D.position.set(f[0], 0.05, f[1]); D.scale.set(1, 0.8, 1); D.updateMatrix(); im.setMatrixAt(i, D.matrix); }); G.add(im); });
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(ropePos, 3)); G.add(new THREE.LineSegments(rg, fm.rope));
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wallPos, 3)); wg.computeVertexNormals(); G.add(new THREE.Mesh(wg, fm.wall));
  const pg = new THREE.CylinderGeometry(0.05, 0.06, 3.2, 5), flg = new THREE.PlaneGeometry(0.7, 0.45), pim = new THREE.InstancedMesh(pg, fm.pole, poleM.length), fim = new THREE.InstancedMesh(flg, fm.flag, poleM.length);
  poleM.forEach((q, i) => { D.position.set(q[0], 1.2, q[1]); D.scale.set(1, 1, 1); D.rotation.set(0, 0, 0); D.updateMatrix(); pim.setMatrixAt(i, D.matrix); D.position.set(q[0] + 0.36, 2.5, q[1]); D.updateMatrix(); fim.setMatrixAt(i, D.matrix); }); G.add(pim, fim);
};
FSH.animNets = function (dt) {
  if (!FSH.netGroup || !GAME.p) return; FSH._at = (FSH._at || 0) + dt; const t = FSH._at, D = new THREE.Object3D();
  for (const n of FSH.setnets()) { const fi = n._fi; if (!fi || Math.hypot(PL.x - n.x, PL.z - n.z) > 200) continue; const lift = FSH.lift && FSH.lift.n === n ? Math.min(1, FSH.lift.t / 4) : 0;
    fi.userData.ph.forEach((q, i) => { const a = q[0] + t * q[2] * (1 + lift * 3); D.position.set(Math.cos(a) * q[1], -0.35 - q[3] * (1 - lift) + lift * 0.25 + (lift > 0.5 && Math.sin(t * 9 + i) > 0.7 ? 0.35 : 0), Math.sin(a) * q[1]); D.rotation.set(0, -a, 0); D.updateMatrix(); fi.setMatrixAt(i, D.matrix); }); fi.instanceMatrix.needsUpdate = true; fi.rotation.y = n.rot; }
};
// =================== 水揚げ (landing at the fish market) ===================
FSH.atHarbor = v => { const H = GAME.LM.harbor, S = DECO.ship; return !!(v && ((H && Math.hypot(v.x - H.x, v.z - H.z) < 130) || (S && Math.hypot(v.x - S.x, v.z - S.z) < 130))); };
FSH.market = id => { const R = mulberry(hashStr(todayKey() + id)); return 0.8 + R() * 0.4; };
FSH.landKey = function () {
  return FSH.openLanding(false);
};
// fromShop: opened from the 出荷所 on land (no boat checks)
FSH.openLanding = function (fromShop) {
  const v = PL.veh, H = FSH.hold(), g = GAME; if (!fromShop) { if (!FSH.atHarbor(v)) return UI.toast('水揚げは港で（港の近くまで船をもどすか、陸の「漁協 出荷所」で売れます）'); if (Math.abs(v.v) > 3) return UI.toast('船をとめてから水揚げ'); }
  const ids = Object.keys(H.fish); if (!ids.length && !(H.by.gomi > 0)) return UI.toast('魚倉はからっぽ');
  const rows = ids.map(id => { const f = FISH.find(q => q.id === id), q = H.fish[id], m = FSH.market(id), ppk = Math.round((NET_PRICE[id] || 500) * m / 10) * 10; return { id, name: f.name, n: q.n, kg: q.kg, ppk, m, val: Math.round(q.kg * ppk) }; }).sort((a, b) => b.val - a.val), tot = rows.reduce((s, r) => s + r.val, 0), kg = rows.reduce((s, r) => s + r.kg, 0);
  g.modal = 'landing'; g.el.modal.innerHTML = `<div class="mbox haulbox"><div class="mh"><h2>⚖️ 水揚げ・せり</h2><span class="isl">${esc(g.p.island)}島 漁協市場</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
    <p class="small" style="margin:0 0 6px">今日の相場で買いとります（相場は毎日かわる）。魚倉 ${kg.toFixed(1)}kg</p>
    <ul class="list haullist">${rows.map(r => `<li><span class="ck">🐟</span><div><b>${esc(r.name)}</b> ×${r.n}<div class="sub">${r.kg.toFixed(1)}kg × ${yen(r.ppk)}/kg ${r.m > 1.08 ? '<b style="color:#c33">高値</b>' : r.m < 0.9 ? '<span style="color:#68a">安値</span>' : ''}</div></div><span class="rv">${yen(r.val)}</span></li>`).join('')}${H.by.gomi > 0 ? `<li><span class="ck">🗑️</span><div><b>海底ごみの処分</b><div class="sub">${H.by.gomi.toFixed(1)}kg　海がきれいになった（元気度 +${Math.max(1, Math.round(H.by.gomi / 2))}）</div></div><span class="rv">0円</span></li>` : ''}</ul>
    <div class="sellbar"><b>合計 ${yen(tot)}</b><button class="primary" data-sell="1">💴 せりに出して売る</button></div></div>`;
  g.el.modal.hidden = false; g.el.modal.querySelector('[data-x="close"]').onclick = () => g.closeModal();
  g.el.modal.querySelector('[data-sell]').onclick = () => { const p = g.p; p.money = (p.money || 0) + tot; if (H.by.gomi > 0) g.addVit(Math.max(1, Math.round(H.by.gomi / 2))); p.fishery = p.fishery || { trawl: 0, set: 0, landKg: 0, landYen: 0 }; p.fishery.landKg += kg; p.fishery.landYen += tot; p.hold = { fish: {}, by: {} }; p.stats.shipped = (p.stats.shipped || 0) + 1; g.dirty = true; g.closeModal(); g.renderTracker(); g.banner(`水揚げ ${yen(tot)}`, `${kg.toFixed(0)}kg をせりに出した`); try { SND.play('register', { vol: 0.8 }); } catch (e) { } };
};
// =================== boat panel ===================
FSH.panelEl = null;
FSH.updatePanel = function () {
  const v = PL.veh, show = GAME.p && !GAME.modal && v && v.kind === 'boat' && !EDIT.on && !GAME.inside; let el = FSH.panelEl;
  if (!show) { if (el) el.hidden = true; return; }
  if (!el) { el = FSH.panelEl = document.createElement('div'); el.id = 'boatPanel'; document.getElementById('game').appendChild(el); el.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b || b.disabled) return; e.stopPropagation(); const f = b.dataset.f; if (f === 'trawl') FSH.trawlKey(); else if (f === 'set') FSH.setKey(); else if (f === 'land') FSH.landKey(); else if (f === 'rm') { const n = FSH.nearNet(PL.veh.x, PL.veh.z); if (n) FSH.removeNet(n); } else if (f === 'fish') GAME.fishKey(); const bb = el.querySelector('.bp-btns'); if (bb) bb._h = ''; document.getElementById('c').focus(); }); }
  el.hidden = false; const fb = FSH.isFishingBoat(v), T = FSH.trawl, dp = FSH.depth(v.x, v.z), hk = FSH.holdKg(), near = fb && FSH.nearNet(v.x, v.z), harbor = FSH.atHarbor(v), c = FISHX.cond('sea'), td = TIDE.at(currentHour(), c.a);
  const kmh = Math.abs(v.v) * 1.944; // knots
  const rows = [];
  rows.push(`<div class="bp-h">${fb ? '🚢 漁船' : '🚤 ボート'}　<span>水深 <b>${dp.toFixed(1)}m</b></span><span>${kmh.toFixed(1)}ノット</span></div>`);
  rows.push(`<div class="bp-t">${TIDE.moon(c.a)} ${c.tn}・${TIDE.stage(td)}　活性${'★'.repeat(c.stars)}</div>`);
  if (fb) {
    rows.push(`<div class="bp-hold"><span>魚倉</span><span class="bar"><i style="width:${Math.min(100, hk / HOLD_CAP * 100)}%"></i></span><b>${hk.toFixed(0)}/${HOLD_CAP}kg</b></div>`);
    if (T) rows.push(`<div class="bp-tr">${T.phase === 'shoot' ? '網を入れている…' : T.phase === 'haul' ? '網を巻き上げ中…' : `曳網中 ${Math.round(T.meters)}m・入網 約${Math.round(T.kg)}kg${T.torn ? '（破網）' : ''}`}</div>`);
    if (FSH.lift) rows.push(`<div class="bp-tr">網起こし中…</div>`);
    rows.push(`<div class="bp-b"><button data-f="trawl" ${T && T.phase !== 'tow' ? 'disabled' : ''}>${T ? '🕸️ 網を揚げる' : '🕸️ 底引き網'} <kbd>N</kbd></button>`
      + (near ? `<button data-f="set">🧺 網起こし（約${Math.round(FSH.netKg(near))}kg） <kbd>O</kbd></button>` : `<button data-f="set" ${T ? 'disabled' : ''}>🧺 定置網を設置 <kbd>O</kbd></button>`)
      + (harbor ? `<button data-f="land" class="hot">⚖️ 水揚げ <kbd>T</kbd></button>` : '') + `<button data-f="fish">🎣 竿釣り <kbd>F</kbd></button>` + (near ? `<button data-f="rm" class="sm">撤去</button>` : '') + `</div>`);
  } else rows.push(`<div class="bp-tr">網の漁は漁船で（ガレージで乗りかえ）。🎣 F で竿釣りはできます</div>`);
  // info and buttons are kept in separate boxes so the buttons are not rebuilt while you click them
  if (!el.querySelector('.bp-info')) el.innerHTML = '<div class="bp-info"></div><div class="bp-btns"></div>';
  const btnI = rows.findIndex(r => r.startsWith('<div class="bp-b">')), info = rows.filter((r, i) => i !== btnI).join(''), btns = btnI >= 0 ? rows[btnI] : '';
  const bi = el.querySelector('.bp-info'), bb = el.querySelector('.bp-btns'); if (bi._h !== info) { bi.innerHTML = info; bi._h = info; } if (bb._h !== btns) { bb.innerHTML = btns; bb._h = btns; }
};
{ const st = document.createElement('style'); st.textContent = `#boatPanel{pointer-events:auto;position:absolute;right:196px;bottom:112px;z-index:11;background:rgba(255,255,255,.93);border-radius:14px;padding:8px 10px;width:250px;max-width:calc(100vw - 32px);box-shadow:0 4px 14px rgba(0,0,0,.16);font-size:12px;color:#234}
#boatPanel .bp-h{display:flex;gap:8px;align-items:baseline;font-weight:800}#boatPanel .bp-h span{font-weight:400;color:#456}#boatPanel .bp-t{color:#567;margin:2px 0 4px}#boatPanel .bp-hold{display:flex;align-items:center;gap:6px}#boatPanel .bp-hold .bar{flex:1;height:8px;background:#e2e8ec;border-radius:5px;overflow:hidden}#boatPanel .bp-hold i{display:block;height:100%;background:#3a8ad0}
#boatPanel .bp-tr{margin-top:4px;font-weight:700;color:#a0502a}#boatPanel .bp-b{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}#boatPanel button{flex:1 1 46%;padding:6px 6px;border-radius:9px;border:1px solid #c8d4dc;background:#f6f9fb;font-size:12px;font-weight:700;color:#234;cursor:pointer}#boatPanel button:disabled{opacity:.45}#boatPanel button.hot{background:#ffe9a8;border-color:#e8c050}#boatPanel button.sm{flex:0 0 auto;font-weight:400}#boatPanel kbd{font-size:10px;opacity:.6}
@media (max-width:600px){#boatPanel{bottom:auto;top:58px;right:8px;width:220px}}.haulbox .haullist,.revbox .revlist{flex:1 1 auto;min-height:0;overflow-y:auto;margin:0 0 4px}.haulbox .sellbar{flex:0 0 auto;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 20px 16px;border-top:1px solid #e2e8dc;background:#f6f8f3}.haulbox .sellbar b{font-size:18px}.haulbox>p{flex:0 0 auto}.haullist li{display:flex;align-items:center;gap:8px}.haullist .rv{margin-left:auto;font-weight:800;white-space:nowrap}`; document.head.appendChild(st); }
// =================== hooks ===================
{ const _ok = GAME.onKey; GAME.onKey = function (e) { if (!e.repeat && this.p && !this.modal && !EDIT.on && PL.veh && PL.veh.kind === 'boat' && !LIFE.fish) { if (e.code === 'KeyN') { FSH.trawlKey(); return true; } if (e.code === 'KeyO') { FSH.setKey(); return true; } if (e.code === 'KeyT') { FSH.landKey(); return true; } } return _ok.apply(this, arguments); }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { FSH.updateTrawl(dt); FSH.updateLift(dt); FSH.animNets(dt); FSH.panelT = (FSH.panelT || 0) - dt; if (FSH.panelT < 0) { FSH.panelT = 0.25; FSH.updatePanel(); } } catch (e) { console.warn('fishery', e); } return r; }; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { FSH.buildNets(); } catch (e) { console.warn('nets', e); } return r; }; }
// can't get off the boat in the middle of a tow without losing the net; leave warning via toast in updateTrawl
{ const _p = GAME.prompt; GAME.prompt = function () { const v = PL.veh; if (this.p && v && v.kind === 'boat' && !LIFE.fish && !this.modal) { if (FSH.trawl) return FSH.trawl.phase === 'tow' ? 'N：網を揚げる　（ゆっくり引く：最大2.4m/s）' : ''; if (FSH.lift) return ''; } return _p.apply(this, arguments); }; }

// the 出荷所 on land also buys what is in the boat's hold
{ const _os = GAME.openShip; GAME.openShip = function () { const r = _os.apply(this, arguments); try { const kg = FSH.holdKg(), H = FSH.hold(); if (kg > 0.05 || H.by.gomi > 0) { const mb = this.el.modal.querySelector('.mb'); if (mb) { const emp = mb.querySelector('.empty'); if (emp) emp.remove(); mb.insertAdjacentHTML('afterbegin', `<div class="holdsell" style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin:0 0 10px;border-radius:12px;background:#e8f3ff"><span style="font-size:22px">🚢</span><div style="flex:1"><b>漁船の魚倉 ${kg.toFixed(1)}kg</b><div class="small">網でとった魚は kg ごとに、今日の相場で買いとります</div></div><button class="primary" data-hold="1" style="padding:8px 14px">水揚げする</button></div>`); mb.querySelector('[data-hold]').onclick = e => { e.stopPropagation(); FSH.openLanding(true); }; } } } catch (e) { console.warn('holdsell', e); } return r; }; }
// remind the player where to sell when coming back to the harbor with a full hold
{ const _u2 = GAME.update; GAME.update = function (dt) { const r = _u2.apply(this, arguments); try { const v = PL.veh; if (this.p && v && v.kind === 'boat' && !this.modal) { const at = FSH.atHarbor(v); if (at && !FSH._wasAt && FSH.holdKg() > 1) UI.toast(`⚖️ 港に着いた。T で水揚げ（魚倉 ${FSH.holdKg().toFixed(0)}kg）`); FSH._wasAt = at; } } catch (e) { } return r; }; }
// on foot: T at the 出荷所 also opens the fish market, and the prompt says the hold can be sold here
{ const _ok2 = GAME.onKey; GAME.onKey = function (e) { if (!e.repeat && e.code === 'KeyT' && this.p && !this.modal && !EDIT.on && !PL.veh && !LIFE.fish && FSH.holdKg() > 0.05) { const S = DECO.ship, H = this.LM.harbor; if ((S && Math.hypot(PL.x - S.x, PL.z - S.z) < 12) || (H && Math.hypot(PL.x - H.x, PL.z - H.z) < 60)) { FSH.openLanding(true); return true; } } return _ok2.apply(this, arguments); }; }
{ const _p2 = GAME.prompt; GAME.prompt = function () { if (this.p && !PL.veh && !this.modal && this.nearShip && this.nearShip() && FSH.holdKg() > 0.05) return `Space：出荷所　T：網の魚を水揚げ（魚倉 ${FSH.holdKg().toFixed(0)}kg）`; return _p2.apply(this, arguments); }; }
// version label so you can tell whether the page has updated
const GAME_VER = '46（10/27）';
{ const v = document.createElement('div'); v.id = 'verTag'; v.textContent = 'ver.' + GAME_VER; v.style.cssText = 'position:fixed;left:6px;bottom:4px;z-index:5;font-size:10px;color:rgba(255,255,255,.75);text-shadow:0 1px 2px rgba(0,0,0,.6);pointer-events:none;font-family:sans-serif'; document.body.appendChild(v); }
