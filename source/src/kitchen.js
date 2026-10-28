// ===================== 山の幸ひろい と 料理 =====================
// 山の幸: 季節ごとに林の中や林のふち・竹やぶに、毎日ちがう場所で見つかる（F でひろう）。
//   秋 栗・しいたけ・あけび・山柿 ／ 冬 ゆず ／ 春 たけのこ・わらび・しいたけ ／ 初夏 木いちご
// 料理: 家のキッチン・ちゃぶ台（ローテーブル）・こたつ・ダイニングで Space。魚・野菜・みかん・山の幸から22品。
//   できた料理は住民へのプレゼント（なかよし +3、好物なら +5）、商店で買い取り、料理帳に記録。
const FORAGE_ITEMS = [
  { id: 'kuri', name: '栗', ic: '🌰', win: [[9, 20, 11, 10]], near: 'forest', p: 120, kind: 'kuri', note: 'イガの中に、つやつやの実が3つ。' },
  { id: 'kinoko', name: 'しいたけ', ic: '🍄', win: [[9, 25, 11, 30], [3, 15, 4, 30]], near: 'forest', p: 150, kind: 'kinoko', note: '雨のあとに、ひょっこり顔を出す。' },
  { id: 'akebi', name: 'あけび', ic: '🫐', win: [[9, 10, 10, 31]], near: 'forest', p: 320, kind: 'akebi', rare: true, note: 'むらさきの実がぱっくり。中の白い実があまい。' },
  { id: 'kaki', name: '山柿', ic: '🟠', win: [[10, 1, 11, 30]], near: 'edge', p: 110, kind: 'kaki', note: 'しぶい実も、干せばあまくなる。' },
  { id: 'yuzu', name: 'ゆず', ic: '🍋', win: [[11, 10, 12, 31], [1, 1, 1, 31]], near: 'edge', p: 160, kind: 'yuzu', note: '冬至はゆず湯に。香りがいい。' },
  { id: 'takenoko', name: 'たけのこ', ic: '🎋', win: [[3, 25, 5, 10]], near: 'bamboo', p: 260, kind: 'takenoko', note: '土から頭を出したところが食べごろ。' },
  { id: 'warabi', name: 'わらび', ic: '🌿', win: [[3, 20, 5, 20]], near: 'edge', p: 120, kind: 'warabi', note: 'くるっと巻いた若い芽。あく抜きしてから。' },
  { id: 'kiichigo', name: '木いちご', ic: '🍓', win: [[5, 20, 7, 10]], near: 'edge', p: 140, kind: 'berry', note: 'オレンジ色の小さな実。つまみ食い注意。' },
];
const RECIPES = [
  { id: 'yakizakana', name: '焼き魚', ic: '🐟', need: [{ k: 'fish', n: 1 }], p: 500, note: '塩をふって、じっくり。皮がぱりっとしたら食べごろ。' },
  { id: 'nitsuke', name: '魚の煮つけ', ic: '🍲', need: [{ k: 'fish', n: 1 }, { k: 'vegAny', ids: ['daikon', 'negi', 'tamanegi'], n: 1 }], p: 950, note: 'しょうゆとみりんで甘からく。島のおふくろの味。' },
  { id: 'sashimi', name: 'お刺身', ic: '🍣', need: [{ k: 'fish', n: 1, min: 30 }], p: 1300, note: '30cm 以上の新鮮な魚で。しょうゆとわさびで。' },
  { id: 'arajiru', name: 'あら汁', ic: '🥣', need: [{ k: 'fish', n: 1 }, { k: 'veg', id: 'negi', n: 1 }], p: 800, note: '魚のあらから、いいだしが出る。' },
  { id: 'yosenabe', name: '寄せ鍋', ic: '🍲', need: [{ k: 'fish', n: 1 }, { k: 'veg', id: 'hourensou', n: 1 }, { k: 'veg', id: 'negi', n: 1 }, { k: 'forage', id: 'kinoko', n: 1 }], p: 2200, note: 'みんなでつつく冬のごちそう。' },
  { id: 'kurigohan', name: '栗ごはん', ic: '🍚', need: [{ k: 'forage', id: 'kuri', n: 3 }], p: 1000, note: '秋いちばんのごはん。ほくほく。' },
  { id: 'kinokojiru', name: 'きのこ汁', ic: '🍄', need: [{ k: 'forage', id: 'kinoko', n: 2 }, { k: 'vegAny', ids: ['negi', 'daikon'], n: 1 }], p: 900, note: 'しいたけのだしが、からだにしみる。' },
  { id: 'hoshigaki', name: '干し柿', ic: '🟠', need: [{ k: 'forage', id: 'kaki', n: 3 }], p: 800, note: 'のき下につるして、あまくなるのを待つ。' },
  { id: 'akebi_sweet', name: 'あけびのおやつ', ic: '🫐', need: [{ k: 'forage', id: 'akebi', n: 2 }], p: 900, note: 'そのまま食べても、皮を炒めてもいい。' },
  { id: 'yuzucha', name: 'ゆず茶', ic: '🍵', need: [{ k: 'forage', id: 'yuzu', n: 2 }], p: 700, note: 'はちみつと合わせて、ほっとひと息。' },
  { id: 'takenokogohan', name: 'たけのこごはん', ic: '🍚', need: [{ k: 'forage', id: 'takenoko', n: 2 }], p: 1200, note: '春の香り。おこげがうまい。' },
  { id: 'tempura', name: '山菜の天ぷら', ic: '🍤', need: [{ k: 'forage', id: 'warabi', n: 2 }, { k: 'vegAny', ids: ['tamanegi', 'jagaimo', 'satsumaimo'], n: 1 }], p: 1000, note: 'さくっと揚げて、塩で。' },
  { id: 'berryjam', name: '木いちごジャム', ic: '🍯', need: [{ k: 'forage', id: 'kiichigo', n: 4 }], p: 900, note: 'パンにもヨーグルトにも。' },
  { id: 'mikanjuice', name: 'みかんジュース', ic: '🧃', need: [{ k: 'mikan', n: 3 }], p: 550, note: 'しぼりたて。島の朝の定番。' },
  { id: 'mikanjelly', name: 'みかんゼリー', ic: '🍮', need: [{ k: 'mikan', n: 5 }], p: 1000, note: 'つるんとひんやり。' },
  { id: 'yakiimo', name: '焼きいも', ic: '🍠', need: [{ k: 'veg', id: 'satsumaimo', n: 1 }], p: 650, note: '落ち葉のたき火で、ほっくほく。' },
  { id: 'nikkorogashi', name: 'じゃがいもの煮っころがし', ic: '🥔', need: [{ k: 'veg', id: 'jagaimo', n: 2 }], p: 750, note: '甘からいたれがからんで、ごはんがすすむ。' },
  { id: 'furofuki', name: 'ふろふき大根', ic: '⚪', need: [{ k: 'veg', id: 'daikon', n: 2 }], p: 800, note: 'やわらかく煮て、ゆずみそをのせて。' },
  { id: 'asazuke', name: 'かぶの浅漬け', ic: '🥗', need: [{ k: 'veg', id: 'kabu', n: 2 }], p: 550, note: 'ぱりぱりの歯ごたえ。' },
  { id: 'tomatosalad', name: 'トマトときゅうりのサラダ', ic: '🥗', need: [{ k: 'veg', id: 'tomato', n: 2 }, { k: 'veg', id: 'kyuri', n: 1 }], p: 700, note: '夏の畑の色をそのまま。' },
  { id: 'yakinasu', name: '焼きなす', ic: '🍆', need: [{ k: 'veg', id: 'nasu', n: 2 }], p: 650, note: 'しょうがじょうゆで。' },
  { id: 'edamame', name: '枝豆の塩ゆで', ic: '🫛', need: [{ k: 'veg', id: 'edamame', n: 2 }], p: 550, note: '夏の夕方、縁側で。' },
];
const DISH_LOVE = { v_gen: ['nitsuke', 'arajiru'], v_hana: ['mikanjelly', 'berryjam'], v_mio: ['sashimi', 'yosenabe'], v_sora: ['yakizakana', 'kurigohan'], v_rin: ['kinokojiru', 'hoshigaki'], v_kai: ['mikanjuice', 'tomatosalad'], v_nagi: ['sashimi', 'takenokogohan'], v_takumi: ['yakiimo', 'nikkorogashi'], v_yuki: ['yuzucha', 'tempura'], v_kota: ['yakiimo', 'edamame'] };
STAT_KEYS.push('forageN', 'cookN');
const FORAGE = { items: [], key: '', grp: null, spots: null, t: 0, CAP: 40 };
FORAGE.def = id => FORAGE_ITEMS.find(q => q.id === id);
FORAGE.bag = function () { const b = GAME.bag(); b.forage = b.forage || {}; b.dish = b.dish || {}; return b; };
FORAGE.count = function () { const f = FORAGE.bag().forage; return Object.values(f).reduce((s, v) => s + v, 0); };
FORAGE.inWin = function (D, d = typeof seasonDate === 'function' ? seasonDate() : new Date()) { const v = (d.getMonth() + 1) * 100 + d.getDate(); return D.win.some(([m0, d0, m1, d1]) => v >= m0 * 100 + d0 && v <= m1 * 100 + d1); };
FORAGE.season = () => FORAGE_ITEMS.filter(D => FORAGE.inWin(D));
// ---------- where things grow ----------
FORAGE.scan = function () {
  const trees = (VEG.items || []).filter(it => it.type === 'tree' && (it.kind === 'broad' || it.kind === 'bamboo' || it.kind === 'momiji') && !VEG.removed[it.id]), grid = new Map();
  for (const t of trees) { const k = Math.floor(t.x / 12) + ',' + Math.floor(t.z / 12); (grid.get(k) || grid.set(k, []).get(k)).push(t); }
  const nb = t => { let n = 0; const cx = Math.floor(t.x / 12), cz = Math.floor(t.z / 12); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const q of grid.get((cx + a) + ',' + (cz + b)) || []) if (q !== t && Math.hypot(q.x - t.x, q.z - t.z) < 12) n++; return n; };
  const S = { forest: [], edge: [], bamboo: [] }, R = mulberry(4401);
  for (const t of trees) { const kind = t.kind === 'bamboo' ? 'bamboo' : nb(t) >= 4 ? 'forest' : 'edge';
    for (let k = 0; k < 2; k++) { const a = R() * 6.283, d = 1.4 + R() * 2.2, x = t.x + Math.cos(a) * d, z = t.z + Math.sin(a) * d;
      if (groundH(x, z) < 1.2 || waterDepthAt(x, z) > 0.01 || roadDistAt(x, z) < 2.8 || groundN(x, z).y < 0.8) continue;
      if (collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, 0.35))) continue; S[kind].push([x, z]); } }
  return S;
};
FORAGE.mat = (c, r = 0.6, o = {}) => (FORAGE._m = FORAGE._m || {})[c + r] || (FORAGE._m[c + r] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o)));
FORAGE.mesh = function (D) {
  const g = new THREE.Group(), M = FORAGE.mat, add = (geo, m, x, y, z, s) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (s) o.scale.set(...s); g.add(o); return o; };
  if (D.kind === 'kuri') { add(new THREE.IcosahedronGeometry(0.075, 1), M('#7a8a3a', 0.9, { flatShading: true }), 0, 0.05, 0, [1, 0.7, 1]); for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.032, 10, 8), M('#6a3a1e', 0.35), Math.cos(k * 2.1) * 0.04, 0.085, Math.sin(k * 2.1) * 0.04, [1, 0.9, 1]); }
  else if (D.kind === 'kinoko') { for (let k = 0; k < 3; k++) { const x = (k - 1) * 0.06, z = (k % 2) * 0.04, s = 1 - k * 0.2; add(new THREE.CylinderGeometry(0.014 * s, 0.018 * s, 0.06 * s, 8), M('#efe6d2', 0.8), x, 0.03 * s, z); add(new THREE.SphereGeometry(0.05 * s, 12, 6, 0, 6.283, 0, Math.PI / 2), M('#7a4a2a', 0.7), x, 0.055 * s, z, [1, 0.55, 1]); } }
  else if (D.kind === 'akebi') { add(new THREE.SphereGeometry(0.045, 12, 8), M('#8a4aa8', 0.5), 0, 0.04, 0, [0.85, 0.75, 1.9]); add(new THREE.SphereGeometry(0.03, 10, 6), M('#f2eee6', 0.6), 0, 0.07, 0, [0.6, 0.4, 1.5]); }
  else if (D.kind === 'kaki') { for (let k = 0; k < 2; k++) { add(new THREE.SphereGeometry(0.048, 14, 10), M('#e8702a', 0.4), k * 0.09 - 0.04, 0.04, k * 0.03, [1, 0.8, 1]); add(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 6), M('#4a6a2a', 0.8), k * 0.09 - 0.04, 0.078, k * 0.03); } }
  else if (D.kind === 'yuzu') { for (let k = 0; k < 2; k++) add(new THREE.IcosahedronGeometry(0.045, 2), M('#f2c230', 0.75), k * 0.09 - 0.04, 0.045, k * 0.02); }
  else if (D.kind === 'takenoko') { add(new THREE.ConeGeometry(0.07, 0.24, 9), M('#7a5a32', 0.85), 0, 0.12, 0); add(new THREE.ConeGeometry(0.05, 0.12, 8), M('#9a7a3a', 0.8), 0, 0.2, 0); add(new THREE.ConeGeometry(0.02, 0.06, 6), M('#7a9a3a', 0.7), 0, 0.28, 0); }
  else if (D.kind === 'warabi') { for (let k = 0; k < 4; k++) { const a = k * 1.6, o = add(new THREE.TorusGeometry(0.03, 0.006, 4, 10, 4.2), M('#5f7f2f', 0.8), Math.cos(a) * 0.03, 0.17, Math.sin(a) * 0.03); o.rotation.y = a; add(new THREE.CylinderGeometry(0.005, 0.006, 0.16, 5), M('#6a8a32', 0.8), Math.cos(a) * 0.03, 0.08, Math.sin(a) * 0.03); } }
  else { for (let k = 0; k < 6; k++) add(new THREE.SphereGeometry(0.018, 8, 6), M('#f0802a', 0.35), Math.cos(k) * 0.03, 0.06 + (k % 2) * 0.02, Math.sin(k) * 0.03); add(new THREE.SphereGeometry(0.06, 8, 6), M('#4f7a2f', 0.9), 0, 0.03, 0, [1.4, 0.5, 1.2]); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  if (!FORAGE.glintTex) FORAGE.glintTex = txCanvas(64, 64, x => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,248,220,0.8)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: FORAGE.glintTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); sp.scale.setScalar(0.3); sp.position.y = 0.16; sp.renderOrder = 6; g.add(sp); g.userData.glint = sp;
  return g;
};
FORAGE.daily = function () {
  const p = GAME.p; if (!p || !G || !G.H || !VEG.items) return; const key = todayKey(); p.forage = p.forage || {}; if (p.forage.day !== key) { p.forage.day = key; p.forage.got = []; }
  const sk = key + (p.created || '') + p.name; if (FORAGE.key === sk && FORAGE.grp) return; FORAGE.key = sk;
  if (!FORAGE.spots) FORAGE.spots = FORAGE.scan();
  if (FORAGE.grp) scene.remove(FORAGE.grp); FORAGE.grp = new THREE.Group(); FORAGE.grp.name = 'forage'; scene.add(FORAGE.grp); FORAGE.items = [];
  const defs = FORAGE.season(); if (!defs.length) return;
  const R = mulberry(hashStr(key + p.name + 'forage')), N = 9 + Math.floor(R() * 5), pick = [];
  for (let t = 0; t < 800 && pick.length < N; t++) {
    let D = defs[Math.floor(R() * defs.length)]; if (D.rare && R() < 0.65) D = defs.find(q => !q.rare) || D;
    const S = FORAGE.spots[D.near]; const list = S && S.length ? S : FORAGE.spots.forest.length ? FORAGE.spots.forest : FORAGE.spots.edge; if (!list.length) break;
    const s = list[Math.floor(R() * list.length)]; if (pick.some(q => Math.hypot(q.x - s[0], q.z - s[1]) < 14)) continue; pick.push({ x: s[0], z: s[1], id: D.id, ry: R() * 6.28, i: pick.length });
  }
  for (const it of pick) { if (p.forage.got.includes(it.i)) continue; const y = groundH(it.x, it.z); it.mesh = mergeLocal(FORAGE.mesh(FORAGE.def(it.id))); it.mesh.scale.setScalar(1.7); it.mesh.position.set(it.x, y, it.z); it.mesh.rotation.y = it.ry; it.ph = R() * 10; FORAGE.grp.add(it.mesh); FORAGE.items.push(it); }
};
FORAGE.target = function () { if (PL.veh || !GAME.p || GAME.inside) return null; const fx = Math.sin(PL.rot), fz = Math.cos(PL.rot); let best = null, bs = 1e9; for (const it of FORAGE.items) { const dx = it.x - PL.x, dz = it.z - PL.z, d = Math.hypot(dx, dz); if (d > 1.7) continue; const sc = d - (dx * fx + dz * fz) / (d || 1) * 0.5; if (sc < bs) { bs = sc; best = it; } } return best; };
FORAGE.pick = function (it) {
  const p = GAME.p, D = FORAGE.def(it.id); PL.rot = Math.atan2(it.x - PL.x, it.z - PL.z); if (typeof PLAY !== 'undefined') { PLAY.pose = 0.75; PLAY.poseK = 'pick'; }
  if (FORAGE.count() >= FORAGE.CAP) { UI.toast(`かごがいっぱい（${FORAGE.CAP}こ）。料理するか、商店で売ろう`); return true; }
  setTimeout(() => {
    if (!FORAGE.items.includes(it)) return; FORAGE.grp.remove(it.mesh); FORAGE.items.splice(FORAGE.items.indexOf(it), 1); p.forage.got.push(it.i);
    const b = FORAGE.bag(); b.forage[D.id] = (b.forage[D.id] || 0) + 1; p.foragez = p.foragez || {}; const first = !p.foragez[D.id]; p.foragez[D.id] = (p.foragez[D.id] || 0) + 1; p.stats.forageN = (p.stats.forageN || 0) + 1;
    try { SND.play('rustle', { vol: 0.6 }); } catch (e) { }
    UI.toast(`${D.ic} ${D.name}をひろった！${first ? '（図鑑に登録）' : ''}`); if (first) setTimeout(() => UI.toast(`📖 ${D.note}`), 900);
    GAME.dirty = true; GAME.check && GAME.check(); GAME.renderTracker && GAME.renderTracker();
  }, 420);
  return true;
};
FORAGE.update = function (dt) {
  if (!GAME.p) return; FORAGE.t += dt; if ((FORAGE.chk = (FORAGE.chk || 0) - dt) < 0) { FORAGE.chk = 3; try { FORAGE.daily(); } catch (e) { console.warn('forage', e); } }
  if (!FORAGE.grp) return; FORAGE.grp.visible = !GAME.inside; if (GAME.inside) return;
  const cp = camera.position, night = GAME.night || 0;
  for (const it of FORAGE.items) { const sp = it.mesh.userData.glint; if (!sp) continue; const d = Math.hypot(it.x - cp.x, it.z - cp.z); if (d > 40) { sp.visible = false; continue; } sp.visible = true; const tw = Math.max(0, Math.sin(FORAGE.t * 1.9 + it.ph)) ** 4; sp.material.opacity = Math.max(tw, d < 12 ? 0.2 : 0) * (0.9 - night * 0.5) * Math.min(1, (40 - d) / 10) * sstep(1.5, 4.5, d); sp.scale.setScalar(0.12 + tw * 0.3); }
};
// ---------- cooking ----------
const COOK = {};
COOK.fishFor = (sp) => { const b = GAME.bag(); return b.fish.map((f, i) => ({ f, i })).filter(o => !sp.min || o.f.size >= sp.min).sort((a, c) => a.f.size - c.f.size); };
COOK.have = function (sp) { const b = FORAGE.bag(), gb = typeof GARDEN !== 'undefined' ? GARDEN.bag() : { veg: {} };
  if (sp.k === 'fish') return COOK.fishFor(sp).length; if (sp.k === 'mikan') return b.mikan || 0; if (sp.k === 'veg') return gb.veg[sp.id] || 0; if (sp.k === 'forage') return b.forage[sp.id] || 0;
  if (sp.k === 'vegAny') return sp.ids.reduce((s, id) => s + (gb.veg[id] || 0), 0); return 0; };
COOK.label = function (sp) { if (sp.k === 'fish') return sp.min ? `魚（${sp.min}cm 以上）` : '魚（なんでも）'; if (sp.k === 'mikan') return 'みかん'; if (sp.k === 'veg') { const C = GARDEN.crop(sp.id); return C ? C.name : sp.id; } if (sp.k === 'forage') return FORAGE.def(sp.id).name; if (sp.k === 'vegAny') return sp.ids.map(id => (GARDEN.crop(id) || {}).name).filter(Boolean).join('・') + 'のどれか'; return '?'; };
COOK.can = R => R.need.every(sp => COOK.have(sp) >= sp.n);
COOK.take = function (sp) { const b = FORAGE.bag(), gb = GARDEN.bag();
  if (sp.k === 'fish') { const idx = COOK.fishFor(sp).slice(0, sp.n).map(o => o.i).sort((a, c) => c - a); for (const i of idx) b.fish.splice(i, 1); }
  else if (sp.k === 'mikan') b.mikan -= sp.n; else if (sp.k === 'veg') gb.veg[sp.id] -= sp.n; else if (sp.k === 'forage') b.forage[sp.id] -= sp.n;
  else if (sp.k === 'vegAny') { let n = sp.n; for (const id of [...sp.ids].sort((a, c) => (gb.veg[c] || 0) - (gb.veg[a] || 0))) { const t = Math.min(n, gb.veg[id] || 0); gb.veg[id] = (gb.veg[id] || 0) - t; n -= t; if (!n) break; } } };
COOK.make = function (R) {
  const p = GAME.p; if (!COOK.can(R)) return false; for (const sp of R.need) COOK.take(sp);
  const b = FORAGE.bag(); b.dish[R.id] = (b.dish[R.id] || 0) + 1; p.cooked = p.cooked || {}; const first = !p.cooked[R.id]; p.cooked[R.id] = (p.cooked[R.id] || 0) + 1; p.stats.cookN = (p.stats.cookN || 0) + 1;
  try { SND.play('chop', { vol: 0.5 }); setTimeout(() => SND.play('chop', { vol: 0.45 }), 220); } catch (e) { }
  UI.toast(`🍳 ${R.ic} ${R.name}ができた！${first ? '（料理帳に記録）' : ''}`); GAME.dirty = true; GAME.check && GAME.check(); GAME.renderTracker && GAME.renderTracker(); return true;
};
GAME.openCook = function (tab, where) {
  if (!this.p) return; this.modal = 'cook'; COOK.tab = tab || COOK.tab || 'make'; if (where) COOK.where = where; const p = this.p, C = p.cooked || {}, b = FORAGE.bag();
  const row = R => { const ok = COOK.can(R); return `<li class="${ok ? '' : 'lock'}"><span class="ck">${R.ic}</span><div><b>${esc(R.name)}</b>${C[R.id] ? `　<span class="pr">${C[R.id]}回</span>` : ''}<div class="sub">${R.need.map(sp => { const h = COOK.have(sp); return `<span class="${h >= sp.n ? 'okn' : 'ngn'}">${esc(COOK.label(sp))} ${h}/${sp.n}</span>`; }).join('　')}</div></div><button class="rel" data-cook="${R.id}" ${ok ? '' : 'disabled'}>つくる</button></li>`; };
  const list = COOK.tab === 'make' ? [...RECIPES].sort((a, c) => COOK.can(c) - COOK.can(a)) : RECIPES;
  const body = COOK.tab === 'make' ? `<ul class="list cooklist">${list.map(row).join('')}</ul><p class="small">材料は、魚（クーラーボックス）・畑の野菜・みかん・山の幸。できた料理はバッグに入り、住民へのプレゼント（なかよし +3、好物なら +5）や、商店の買い取りに。</p>`
    : `<ul class="list zukan">${RECIPES.map(R => `<li class="${C[R.id] ? 'done' : 'lock'}"><span class="ck">${C[R.id] ? R.ic : '？'}</span><div><b>${esc(R.name)}</b>　<span class="pr">${yen(R.p)}</span><div class="sub">${C[R.id] ? `${C[R.id]}回つくった　${esc(R.note)}` : R.need.map(sp => esc(COOK.label(sp)) + '×' + sp.n).join('・')}</div></div></li>`).join('')}</ul>`;
  const dishN = Object.values(b.dish).reduce((s, v) => s + v, 0);
  this.el.modal.innerHTML = `<div class="mbox journal cookbox"><div class="mh"><h2>🍳 ${COOK.where === 'kitchen' ? '台所' : 'カセットコンロで料理'}</h2><span class="isl">料理帳 ${Object.keys(C).length}/${RECIPES.length}・持っている料理 ${dishN}</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
    <div class="tabs"><button data-ct="make" class="${COOK.tab === 'make' ? 'on' : ''}">つくる</button><button data-ct="book" class="${COOK.tab === 'book' ? 'on' : ''}">料理帳</button></div><div class="mb">${body}</div></div>`;
  this.el.modal.hidden = false;
  this.el.modal.querySelector('.cookbox').onclick = e => { if (e.target.closest('[data-x="close"]')) return this.closeModal(); const t = e.target.closest('[data-ct]'); if (t) return this.openCook(t.dataset.ct);
    const c = e.target.closest('[data-cook]'); if (c && !c.disabled) { const R = RECIPES.find(q => q.id === c.dataset.cook); if (COOK.make(R)) this.openCook('make'); } };
};
// at home: next to the kitchen, the low table, the kotatsu or the dining set
COOK.FURN = ['kitchen', 'table_low', 'kotatsu', 'dining', 'cafetable'];
COOK.near = function () { if (!GAME.inside || GAME.place || GAME.roomEdit || !GAME.p) return null; let best = null, bd = 1.5; for (const it of GAME.home().items) { if (!COOK.FURN.includes(String(it.id).split('__')[0])) continue; const F = FURN.find(f => f.id === it.id); if (!F) continue; const d = Math.hypot(PL.x - it.x, PL.z - it.z) - Math.max(F.w, F.d) / 2; if (d < bd) { bd = d; best = it; } } return best; };
// the nearer one wins: a table next to a TV still lets you cook when you stand at the table
COOK.dist = it => { const F = FURN.find(f => f.id === it.id) || { w: 1, d: 1 }; return Math.hypot(PL.x - it.x, PL.z - it.z) - Math.max(F.w, F.d) / 2; };
COOK.wins = function (g) { const c = COOK.near(); if (!c) return null; const n = g.roomNear(); return !n || COOK.dist(c) < COOK.dist(n.it) ? c : null; };
{ const _rp = GAME.roomPrompt; GAME.roomPrompt = function () { const S = ROOM.size; if (!this.roomEdit && !this.place && !(PL.z > S.d / 2 - 1.0 && Math.abs(PL.x) < 1) && COOK.wins(this)) return 'Space：料理する'; const r = _rp.apply(this, arguments); if (r) return r; return COOK.near() ? 'Space：料理する' : ''; }; }
{ const _ra = GAME.roomAct; GAME.roomAct = function () { const S = ROOM.size; if (!(PL.z > S.d / 2 - 1.0 && Math.abs(PL.x) < 1)) { const c = COOK.wins(this); if (c) return this.openCook('make', String(c.id).split('__')[0] === 'kitchen' ? 'kitchen' : 'table'); } return _ra.apply(this, arguments); }; }
// ---------- F key / prompt / update ----------
{ const _fk = GAME.fishKey; GAME.fishKey = function () { if (!LIFE.fish && !PL.veh && !EDIT.on && !GAME.inside && GAME.p) { const it = FORAGE.target(); if (it) return FORAGE.pick(it); } return _fk.apply(this, arguments); }; }
{ const _pr = GAME.prompt; GAME.prompt = function () { if (!LIFE.fish && !PL.veh && !EDIT.on && !GAME.inside && GAME.p) { const it = FORAGE.target(); if (it) return `F：${FORAGE.def(it.id).name}をひろう`; } return _pr.apply(this, arguments); }; }
{ const _u = updateStructures; updateStructures = function (t, night) { const r = _u.apply(this, arguments); const now = performance.now(), dt = Math.min(0.1, (now - (FORAGE._l || now)) / 1000); FORAGE._l = now; try { FORAGE.update(dt); } catch (e) { } return r; }; }
// ---------- bag, gifts, selling, zukan, requests ----------
{ const _ob = GAME.openBag; GAME.openBag = function () { _ob.apply(this, arguments); const mb = this.el.modal.querySelector('.mb'); if (!mb) return; const b = FORAGE.bag();
  const fr = FORAGE_ITEMS.filter(D => b.forage[D.id] > 0).map(D => `<li><span class="ic">${D.ic}</span><div><b>${esc(D.name)}</b> ×${b.forage[D.id]}</div></li>`).join('');
  const ds = RECIPES.filter(R => b.dish[R.id] > 0).map(R => `<li><span class="ic">${R.ic}</span><div><b>${esc(R.name)}</b> ×${b.dish[R.id]}<div class="sub">買い取り ${yen(R.p)}</div></div></li>`).join('');
  const h = document.createElement('div'); h.innerHTML = `<h3 class="bh">山の幸（${FORAGE.count()}/${FORAGE.CAP}）</h3><ul class="list">${fr || '<li><div class="sub">持っていません（季節の山の幸は、林の中で F でひろえます）</div></li>'}</ul><h3 class="bh">料理</h3><ul class="list">${ds || '<li><div class="sub">持っていません（家のテーブルやキッチンで Space）</div></li>'}</ul>`;
  const tl = mb.querySelectorAll('h3.bh'); mb.insertBefore(h, tl[tl.length - 1] || null); }; }
{ const _gb = GAME.giftables; GAME.giftables = function () { const b = FORAGE.bag(); return _gb.apply(this, arguments) || Object.values(b.dish).some(v => v > 0) || Object.values(b.forage).some(v => v > 0); }; }
{ const _og = GAME.openGift; GAME.openGift = function (n) { _og.call(this, n); const box = this.el.modal.querySelector('.gifts'); if (!box) return; const b = FORAGE.bag();
  box.insertAdjacentHTML('afterbegin', RECIPES.filter(R => b.dish[R.id] > 0).map(R => `<button class="gi" data-gd="${R.id}"><span>${R.ic}</span><b>${esc(R.name)}</b><small>手料理</small></button>`).join(''));
  box.insertAdjacentHTML('beforeend', FORAGE_ITEMS.filter(D => b.forage[D.id] > 0).map(D => `<button class="gi" data-gfo="${D.id}"><span>${D.ic}</span><b>${esc(D.name)}</b><small>山の幸</small></button>`).join(''));
  const jb = this.el.modal.querySelector('.journal'), prev = jb.onclick; jb.onclick = e => { const a = e.target.closest('[data-gd],[data-gfo]'); if (!a) return prev && prev(e);
    const dish = !!a.dataset.gd, id = a.dataset.gd || a.dataset.gfo, name = dish ? RECIPES.find(R => R.id === id).name : FORAGE.def(id).name; if (dish) b.dish[id]--; else b.forage[id]--;
    const vid = n.def.id, love = dish && (DISH_LOVE[vid] || []).includes(id), pts = love ? 5 : dish ? 3 : 2, p = this.p;
    p.friend[vid] = (p.friend[vid] || 0) + pts; p.daily.gifted = p.daily.gifted || {}; p.daily.gifted[vid] = 1; p.stats.giftN++; if (love) { p.dishKnown = p.dishKnown || {}; p.dishKnown[vid] = 1; } this.modal = null; this.el.modal.hidden = true; this.el.modal.innerHTML = '';
    const t = love ? `${name}！？ これ、わたしの大好物なの…！ ${p.name}さんが作ったの？ すごくおいしい！` : dish ? `${p.name}さんの手料理！ いいにおい〜。あったかいうちにいただくね。` : `${name}！ もうそんな季節なんだね。ありがとう！`;
    DIALOG.npc = n; DIALOG.pages = [t]; DIALOG.i = 0; DIALOG.choices = null; UI.dialog(n.def.name, t); UI.toast(`🎁 ${name}をプレゼントした　なかよし +${pts}${love ? '（大好物！）' : ''}`); this.dirty = true; this.save(); }; }; }
SHOPX.tabs.push({ id: 'dish', label: '料理・山の幸の買い取り', body() { const b = FORAGE.bag();
    const rows = RECIPES.filter(R => b.dish[R.id] > 0).map(R => `<li><div class="th">${R.ic}</div><div class="in"><b>${esc(R.name)} ×${b.dish[R.id]}</b><span class="own">1皿 ${yen(R.p)}</span></div><button class="buy" data-selld="${R.id}">1皿売る</button></li>`)
      .concat(FORAGE_ITEMS.filter(D => b.forage[D.id] > 0).map(D => `<li><div class="th">${D.ic}</div><div class="in"><b>${esc(D.name)} ×${b.forage[D.id]}</b><span class="own">1こ ${yen(D.p)}</span></div><button class="buy" data-sellf="${D.id}">1こ売る</button></li>`));
    return rows.length ? `<ul class="glist">${rows.join('')}</ul>` : '<p>売れるものを持っていません。家で作った料理や、林でひろった山の幸を買い取ります。</p>'; },
  click(e) { const b = FORAGE.bag(); let got = 0;
    const d = e.target.closest('[data-selld]'); if (d) { const R = RECIPES.find(q => q.id === d.dataset.selld); if (b.dish[R.id] > 0) { b.dish[R.id]--; got = R.p; UI.toast(`${R.ic} ${R.name}が ${yen(R.p)} で売れた！`); } }
    const f = e.target.closest('[data-sellf]'); if (f) { const D = FORAGE.def(f.dataset.sellf); if (b.forage[D.id] > 0) { b.forage[D.id]--; got = D.p; UI.toast(`${D.ic} ${D.name}が ${yen(D.p)} で売れた！`); } }
    if (d || f) { if (got) this.addMoney(got); this.dirty = true; this.openShop('dish'); return true; } return false; } });
{ const _zt = GAME.zukanTab; GAME.zukanTab = function () { const p = this.p, Z = p.foragez || {}, C = p.cooked || {};
  return _zt.apply(this, arguments) + `<h3 class="bh" style="margin-top:14px">山の幸 ${Object.keys(Z).length} / ${FORAGE_ITEMS.length}種類　・　ひろった数 ${p.stats.forageN || 0}こ</h3>
    <ul class="list zukan">${FORAGE_ITEMS.map(D => { const r = Z[D.id]; const ss = D.win.map(([m0, , m1]) => m0 === m1 ? `${m0}月` : `${m0}〜${m1}月`).join('・'); return `<li class="${r ? 'done' : 'lock'}"><span class="ck">${r ? D.ic : '？'}</span><div><b>${r ? esc(D.name) : '？？？'}</b><div class="sub">${ss}　${r ? `${r}こ　${esc(D.note)}` : D.near === 'bamboo' ? '竹やぶ' : D.near === 'forest' ? '林のおく' : '林のふち'}</div></div></li>`; }).join('')}</ul>
    <h3 class="bh" style="margin-top:14px">料理帳 ${Object.keys(C).length} / ${RECIPES.length}品</h3><p class="small">家のキッチン・ちゃぶ台・こたつで料理できます。</p>`; }; }
DAILY_POOL.push(
  { id: 'forage2', who: 'v_rin', text: '林で山の幸を2つひろう', n: 2, stat: 'forageN', need: () => FORAGE.season().length > 0, ask: '林のなかに、いまの季節の山の幸がかくれてるよ。2つ見つけてきてくれる？' },
  { id: 'cook1', who: 'v_hana', text: '家で料理を1品つくる', n: 1, stat: 'cookN', ask: 'とれたての魚や野菜で、なにか作ってみたら？ 家のちゃぶ台でも料理できるのよ。' });
GOALS.push({ id: 'cook10', text: '料理を10品つくる', n: 10, stat: 'cookN', pts: 20 }, { id: 'forage15', text: '山の幸を15こひろう', n: 15, stat: 'forageN', pts: 15 });
{ const st = document.createElement('style'); st.textContent = `#game .cookbox{max-width:700px}#game .cookbox .tabs{display:flex;gap:6px;padding:0 16px}#game .cookbox .tabs button{border:none;background:#eee6d6;color:#5a4d3e;border-radius:10px;padding:6px 14px;font-weight:700;cursor:pointer;margin-bottom:6px}#game .cookbox .tabs button.on{background:#2f7a4a;color:#fff}#game .cookbox .mb{max-height:min(70vh,620px);overflow:auto}#game .cooklist li{align-items:center}#game .cooklist li.lock{opacity:.6}#game .cooklist .okn{color:#2f7a4a;font-weight:700}#game .cooklist .ngn{color:#a0643a}#game .cooklist button{white-space:nowrap}`; document.head.appendChild(st); }
