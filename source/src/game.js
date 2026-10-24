// ===================== PROGRESS: 名前・セーブ・おねがい・島の目標・元気度・解放 =====================
const PROFILE_KEY = 'hoshinami2-profile', PROFILE_VER = 1;
const ZONES = [null,
  { num: '①', name: '港町', lv: 1 }, { num: '②', name: '住宅地', lv: 1 }, { num: '③', name: '開拓地', lv: 1 },
  { num: '④', name: '見晴らしの丘', lv: 2 }, { num: '⑤', name: 'みかん段々畑', lv: 3 }, { num: '⑥', name: '夕日の浜', lv: 4 },
  { num: '⑦', name: '北の森', lv: 5 }, { num: '⑧', name: '灯台の岬', lv: 6 }, { num: '⑨', name: 'はなれ小島', lv: 7 }];
const LV_PTS = [0, 30, 80, 150, 240, 350, 480];
const LV_UNLOCK = { 2: ['④見晴らしの丘で島づくり', '「川・池」「うめる」の道具'], 3: ['⑤みかん段々畑で島づくり', '広い道', 'みかんの木'], 4: ['⑥夕日の浜で島づくり', '大きな木'], 5: ['⑦北の森で島づくり', '松の木'], 6: ['⑧灯台の岬で島づくり'], 7: ['⑨はなれ小島で島づくり'] };
const TOOL_LV = { dig: 2, fill: 2 }, ROADW_LV = { wide: 3 }, TREE_LV = { broad0: 1, bush0: 1, mikan0: 3, broad1: 4, pine0: 5 };
const LM_NAMES = { falls: '滝', light: '灯台', church: '神社', peak: '見晴らしの丘のてっぺん', mikan: 'みかん畑', beach: '夕日の浜', islet: 'はなれ小島' };
const MEISHO = ['falls', 'light', 'church', 'peak', 'mikan', 'beach'];
const VNAME = id => (VILLAGER_DEF.find(v => v.id === id) || { name: '?' }).name;
const DAILY_POOL = [
  { id: 'talk3', who: 'v_rin', text: '住民3人とおしゃべりする', n: 3, prog: d => Object.keys(d.talked).length, ask: '今日はみんなとおしゃべりしてみて！ 3人と話せたら、島がもっと明るくなるよ。' },
  { id: 'plant3', who: 'v_hana', text: '木を3本植える', n: 3, stat: 'plant', ask: '島に緑をふやしたいの。しまづくりで木を3本植えてくれないかしら？' },
  { id: 'road20', who: 'v_sora', text: '道路を20m以上つくる', n: 20, stat: 'roadM', unit: 'm', ask: '新しい道があると、軽トラで走れる所がふえるだろ？ 20mくらい作ってくれよ！' },
  { id: 'truck300', who: 'v_sora', text: '軽トラで300m走る', n: 300, stat: 'truckM', unit: 'm', ask: '軽トラ、エンジンかけとかないと調子悪くなるんだ。300mくらい走らせてきて！' },
  { id: 'boat200', who: 'v_gen', text: '漁船で200m進む', n: 200, stat: 'boatM', unit: 'm', ask: 'わしの漁船、たまには若いのが動かしてくれんか。200mほどでええ。' },
  { id: 'falls', who: 'v_mio', text: '滝を見に行く', visit: 'falls', ask: '北の森の滝、今日は水がきれいなんだって。見てきてくれる？' },
  { id: 'light', who: 'v_gen', text: '灯台の岬まで行く', visit: 'light', ask: '岬の灯台がちゃんと立っとるか、見てきてくれんかの。' },
  { id: 'church', who: 'v_rin', text: '神社に行く', visit: 'church', ask: '丘の上の神社の大きな鳥居、まだ見てないなら行ってみて！' },
  { id: 'mikan', who: 'v_kai', text: 'みかん畑のようすを見に行く', visit: 'mikan', ask: 'みかん、そろそろ色づいたかな？ 畑のようすを見てきてほしいな。' },
  { id: 'peak', who: 'v_mio', text: '見晴らしの丘のてっぺんに登る', visit: 'peak', ask: '丘のてっぺんから島ぜんぶが見えるんだよ。登ってみて！' },
  { id: 'beach', who: 'v_hana', text: '夕日の浜に行く', visit: 'beach', ask: '西の浜はね、夕日がとってもきれいなの。行ってみて。' },
  { id: 'walk400', who: 'v_kai', text: '400m散歩する', n: 400, stat: 'walkM', unit: 'm', ask: 'たまには歩いて島をまわるのもいいよ！ 400mくらいお散歩してきて。' },
  { id: 'shape5', who: 'v_gen', text: 'しまづくりで地面を5回ととのえる', n: 5, stat: 'shape', ask: 'でこぼこの地面を、しまづくりで5回ほどととのえてくれんか。' },
  { id: 'water', who: 'v_mio', text: 'しまづくりで池か川をつくる', n: 15, stat: 'water', needLv: 2, ask: '小さな池があったら、魚がすめるかも！ 池か川を作ってくれる？' },
  { id: 'clear10', who: 'v_hana', text: '草や木を10こ片づける', n: 10, stat: 'clear', ask: 'のびすぎた草や木を、10こくらい片づけてほしいの。' },
  { id: 'meet_gen', who: 'v_mio', text: 'ゲンじいに会いに行く', talk: 'v_gen', ask: 'ゲンじい、最近元気かな？ 会いに行ってあげて。' },
  { id: 'meet_hana', who: 'v_sora', text: 'ハナに会いに行く', talk: 'v_hana', ask: 'ハナが新しい花を育ててるらしいぜ。会いに行ってみなよ。' },
  { id: 'meet_kai', who: 'v_gen', text: 'カイに会いに行く', talk: 'v_kai', ask: 'カイのやつ、話し相手をほしがっとったぞ。' },
  { id: 'meet_rin', who: 'v_kai', text: 'リンに会いに行く', talk: 'v_rin', ask: 'リンが{P}さんに用があるって言ってたよ！' },
  { id: 'meet_sora', who: 'v_hana', text: 'ソラに会いに行く', talk: 'v_sora', ask: 'ソラくんがどこにいるか、さがしてみて。' },
  { id: 'meet_mio', who: 'v_rin', text: 'ミオに会いに行く', talk: 'v_mio', ask: 'ミオちゃんに、よろしくって伝えてくれる？' },
];
const GOALS = [
  { id: 'road1', text: 'はじめての道路をつくる', n: 1, stat: 'roadN', pts: 20 },
  { id: 'meet1', text: '集会所ではじめての島の会議をする', n: 1, stat: 'meetN', pts: 20 },
  { id: 'talkall', text: '住民6人みんなと話す', n: 6, prog: () => Object.keys(GAME.p.talked).length, pts: 20 },
  { id: 'plant10', text: '木を10本植える', n: 10, stat: 'plant', pts: 20 },
  { id: 'water30', text: '池か川をつくる（水場30マス）', n: 30, stat: 'water', pts: 20, needLv: 2 },
  { id: 'meisho', text: '名所めぐり（滝・灯台・神社・丘のてっぺん・みかん畑・夕日の浜）', n: 6, prog: () => MEISHO.filter(k => GAME.p.visited[k]).length, pts: 30 },
  { id: 'daily5', text: '住民のおねがいを5こかなえる', n: 5, stat: 'dailyDone', pts: 30 },
  { id: 'truck2k', text: '軽トラで合計2km走る', n: 2000, stat: 'truckM', unit: 'm', pts: 25 },
  { id: 'road100', text: '道路を合計100mつくる', n: 100, stat: 'roadM', unit: 'm', pts: 30 },
  { id: 'islet', text: '漁船ではなれ小島へわたる', n: 1, prog: () => GAME.p.visited.islet ? 1 : 0, pts: 30 },
  { id: 'plant30', text: '木を30本植える', n: 30, stat: 'plant', pts: 30 },
  { id: 'road300', text: '道路を合計300mつくる', n: 300, stat: 'roadM', unit: 'm', pts: 40 },
  { id: 'meet3', text: '島の会議で3つのことを決める', n: 3, stat: 'meetN', pts: 30 },
  { id: 'daily15', text: '住民のおねがいを15こかなえる', n: 15, stat: 'dailyDone', pts: 50 },
];
const STAT_KEYS = ['plant', 'roadM', 'roadN', 'water', 'truckM', 'boatM', 'walkM', 'shape', 'clear', 'dailyDone', 'meetN'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

const GAME = {
  p: null, modal: null, dirty: false, saveT: 0, chkT: 0, lastPos: null, LM: {}, zoneLabel: {},
  newProfile(name, island) { const st = {}; STAT_KEYS.forEach(k => st[k] = 0); return { v: PROFILE_VER, name, island, vit: 0, stats: st, visited: {}, talked: {}, friend: {}, goals: {}, thanked: {}, daily: null, pos: null, created: Date.now() }; },
  // ---------- setup ----------
  init() {
    this.spawn = { x: PL.x, z: PL.z, rot: PL.rot }; this.vehSpawn = VEH.map(v => ({ x: v.x, z: v.z, rot: v.rot }));
    this.initZones(); this.initPlaces(); this.initDevPlaces(); this.buildUI(); this.initMinimap();
    let saved = null; try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.v === PROFILE_VER && saved.name) this.saved = saved;
    this.showTitle();
    addEventListener('pagehide', () => this.save()); document.addEventListener('visibilitychange', () => { if (document.hidden) this.save(); });
  },
  initZones() {
    const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2;
    let peak = { x: PEAK.x, z: PEAK.z, h: -1 }; for (let a = -60; a <= 60; a += 2) for (let b = -60; b <= 60; b += 2) { const h = G.H0[toIdx(PEAK.x + a, PEAK.z + b)[1] * n + toIdx(PEAK.x + a, PEAK.z + b)[0]]; if (h > peak.h) peak = { x: PEAK.x + a, z: PEAK.z + b, h }; }
    let beach = { x: -230, z: 150 }; const rp = G.river && G.river.pts; if (rp) for (const [x, z] of rp) { const [i, j] = toIdx(x, z); if (G.H0[j * n + i] < 0.6 && isNaN(G.Wl0[j * n + i]) || G.H0[j * n + i] < -0.3) { beach = { x, z }; break; } }
    const H = PLACED.harbor || { x: -10, z: 190 };
    this.LM = { falls: { x: FALLS.x, z: FALLS.z, r: 24 }, light: { x: PLACED.lighthouse.x, z: PLACED.lighthouse.z, r: 22 }, church: PLACED.church ? { x: PLACED.church.x, z: PLACED.church.z, r: 20 } : { x: 100, z: 54, r: 20 },
      peak: { x: peak.x, z: peak.z, r: 14 }, mikan: { x: MIKAN.x, z: MIKAN.z, r: 36 }, beach: { x: beach.x, z: beach.z, r: 34 }, islet: { x: -190, z: 175, r: 30 }, harbor: { x: H.x, z: H.z, r: 0 } };
    if (PLACED.home) this.LM.home = { x: PLACED.home.mail.x, z: PLACED.home.mail.z, r: 0 }; if (PLACED.hall) this.LM.hall = { x: PLACED.hall.entry.x, z: PLACED.hall.entry.z, r: 0 };
    const C = [null, [H.x, H.z, 1.0], [VILLAGE.x, VILLAGE.z, 1.15], [OPEN.x, OPEN.z, 1.1], [peak.x, peak.z, 1.0], [MIKAN.x, MIKAN.z, 0.95], [beach.x + 30, beach.z - 30, 0.9], [-70, -150, 1.0], [(CAPE.a[0] + CAPE.b[0]) / 2 + 10, (CAPE.a[1] + CAPE.b[1]) / 2, 1.0]];
    G.zone = new Uint8Array(n * n); const acc = {};
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = h0 + i * cell, z = h0 + j * cell; let best = 1, bd = Infinity;
      if (Math.hypot(x - this.LM.islet.x, z - this.LM.islet.z) < 48) best = 9;
      else for (let c = 1; c <= 8; c++) { const d = Math.hypot(x - C[c][0], z - C[c][1]) / C[c][2]; if (d < bd) { bd = d; best = c; } }
      const k = j * n + i; G.zone[k] = best;
      if (G.H0[k] > 1) { const a = acc[best] || (acc[best] = [0, 0, 0]); a[0] += x; a[1] += z; a[2]++; }
    }
    for (const z in acc) this.zoneLabel[z] = { x: acc[z][0] / acc[z][2], z: acc[z][1] / acc[z][2] };
  },
  // ---------- level / unlocks ----------
  level() { let l = 0; const v = this.p ? this.p.vit : 0; for (let i = 0; i < LV_PTS.length; i++) if (v >= LV_PTS[i]) l = i + 1; return l; },
  openK(k) { if (!this.p) return true; const z = G.zone[k]; return !z || ZONES[z].lv <= this.level(); },
  openAt(x, z) { const [i, j] = toIdx(x, z); return this.openK(j * WORLD.n + i); },
  lockText(x, z) { const [i, j] = toIdx(x, z), zn = ZONES[G.zone[j * WORLD.n + i]]; return `🔒 ${zn.num}${zn.name}は 元気度Lv${zn.lv}で島づくりできるようになります`; },
  toolLv(id) { return this.p ? (TOOL_LV[id] || 1) : 1; },
  canUse(kind, id) { if (kind === 'tool' && id === 'house') return !!(this.p && this.houseFor()); if (!this.p) return true; const t = kind === 'tool' ? TOOL_LV : kind === 'road' ? ROADW_LV : TREE_LV; return (t[id] || 1) <= this.level(); },
  // ---------- events from the game ----------
  ev(type, amount = 1, arg) {
    const p = this.p; if (!p) return; const S = p.stats;
    if (type === 'talk') { p.talked[arg] = 1; if (p.daily) p.daily.talked[arg] = 1; p.friend[arg] = p.friend[arg] || 0; }
    else if (type === 'visit') { const first = !p.visited[arg]; p.visited[arg] = 1; if (p.daily) p.daily.visited[arg] = 1; if (first && arg !== 'harbor') UI.toast(`📍 はじめて来た：${LM_NAMES[arg]}`); }
    else if (S[type] !== undefined) S[type] += amount;
    this.dirty = true; this.check();
  },
  missionProg(m) { const p = this.p, d = p.daily; if (m.prog) return m.prog(d); if (m.visit) return d.visited[m.visit] ? 1 : 0; if (m.talk) return d.talked[m.talk] ? 1 : 0; return p.stats[m.stat] - (d.base[m.stat] || 0); },
  goalProg(g) { return g.prog ? g.prog() : this.p.stats[g.stat]; },
  todays() { return this.p && this.p.daily ? this.p.daily.ids.map(id => DAILY_POOL.find(m => m.id === id)).filter(Boolean) : []; },
  newDay() {
    if (this.p.daily) this.check();
    const p = this.p, lv = this.level(), R = mulberry(hashStr(todayKey() + p.name + p.created)), prev = p.daily;
    const pool = DAILY_POOL.filter(m => (!m.needLv || m.needLv <= lv) && (!m.need || m.need(p))), ids = [], whos = new Set();
    for (let k = 0; k < 60 && ids.length < 3; k++) { const m = pool[Math.floor(R() * pool.length)]; if (ids.includes(m.id) || whos.has(m.who)) continue; ids.push(m.id); whos.add(m.who); }
    p.daily = { date: todayKey(), ids, base: { ...p.stats }, talked: {}, visited: {}, done: {} }; p.thanked = {};
    if (prev) { const inc = this.dailyIncome(); if (inc > 0) { p.money = (p.money || 0) + inc; p.lastIncome = { amount: inc, tour: this.tourism(), date: todayKey() }; } }
    const devDone = this.completeDev(); if (devDone.length) { this.applyLand(); this.refreshDev(); }
    const built = this.completeProjects(); if (built.length) this.refreshProjects(); const moved = this.completeHouses(); if (moved.length) this.syncNewcomers(); this.makeLetter(prev); this.dirty = true;
  },
  addVit(n) { const before = this.level(); this.p.vit += n; const after = this.level(); if (after > before) setTimeout(() => this.levelUp(after), 900); },
  check() {
    const p = this.p; if (!p || !p.daily) return; let changed = false;
    for (const m of this.todays()) { if (p.daily.done[m.id]) continue; if (this.missionProg(m) >= (m.n || 1)) { p.daily.done[m.id] = 1; p.stats.dailyDone++; p.friend[m.who] = (p.friend[m.who] || 0) + 1; this.addVit(10); p.money = (p.money || 0) + 300; UI.toast(`✓ ${VNAME(m.who)}のおねがい「${m.text}」をかなえた！ 元気度 +10・お礼 300円`); changed = true; } }
    for (const g of GOALS) { if (p.goals[g.id]) continue; if (this.goalProg(g) >= g.n) { p.goals[g.id] = 1; this.addVit(g.pts); this.banner('島の目標たっせい！', `${g.text}　元気度 +${g.pts}`); changed = true; } }
    if (changed) { this.dirty = true; this.check(); }
    this.renderTracker();
  },
  levelUp(lv) { this.applyTruck(true); this.checkNewcomers(); this.banner(`島の元気度が Lv${lv} になった！`, (LV_UNLOCK[lv] || []).map(t => '🔓 ' + t).join('　')); if (EDIT.on) UI.editPanel(); this.renderTracker(); },
  // ---------- per-frame ----------
  update(dt) {
    if (!this.p) return; this.updateMinimap(dt); this.updateWorldMarks(); this.updateFishing(dt); this.updateDecor(dt); this.updateDev(dt);
    const v = PL.veh, x = PL.x, z = PL.z;
    if (this.lastPos) { const d = Math.hypot(x - this.lastPos.x, z - this.lastPos.z); if (d > 0.01 && d < 6 && !(v && (v.kind === 'bus' || v.kind === 'ferry'))) { const k = v ? (v.kind === 'truck' ? 'truckM' : 'boatM') : 'walkM'; this.p.stats[k] += d; this._acc = (this._acc || 0) + d; } }
    this.lastPos = { x, z };
    this.chkT -= dt; if (this.chkT < 0) {
      this.chkT = 0.5;
      if (!this.inside) for (const [id, L] of Object.entries(this.LM)) if (L.r && Math.hypot(x - L.x, z - L.z) < L.r && !(this.p.daily && this.p.daily.visited[id] && this.p.visited[id])) this.ev('visit', 1, id);
      if (this._acc > 5) { this._acc = 0; this.dirty = true; this.check(); }
      if (this.p.daily && this.p.daily.date !== todayKey()) { this.newDay(); UI.toast('あたらしい一日。今日のおねがいが3つ届いています'); this.notifyLetter(); this.check(); }
    }
    this.saveT -= dt; if (this.saveT < 0) { this.saveT = 5; if (this.dirty) this.save(); }
  },
  save() {
    const p = this.p; if (!p) return; this.dirty = false;
    const rv = PL.veh && (PL.veh.kind === 'bus' || PL.veh.kind === 'ferry'), rp = rv ? (PL.veh.kind === 'ferry' ? { x: this.devState().pier.ex, z: this.devState().pier.ez } : (PL.veh.stop || PL)) : PL;
    p.pos = { x: rp.x, z: rp.z, rot: PL.rot, veh: PL.veh && !rv ? VEH.indexOf(PL.veh) : -1, vehs: VEH.map(v => ({ x: v.x, z: v.z, rot: v.rot })) };
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) { /* storage unavailable */ }
  },
  restorePos(pos) {
    if (!pos) return;
    (pos.vehs || []).forEach((s, i) => { const v = VEH[i]; if (!v || !isFinite(s.x)) return; v.x = s.x; v.z = s.z; v.rot = s.rot; v.v = 0; placeVehicle(v, 0); });
    if (isFinite(pos.x)) { PL.x = pos.x; PL.z = pos.z; PL.rot = pos.rot || 0; PL.y = standY(PL.x, PL.z); }
    if (pos.veh >= 0 && VEH[pos.veh]) { PL.veh = VEH[pos.veh]; CAM.distT = VSPEC[PL.veh.kind].cam; }
    CAM.yaw = PL.rot + Math.PI; CAM.snap = true; CAM.target.set(PL.x, PL.y + 1.05, PL.z);
  },
  begin(p, isNew) {
    this.p = p; this.lastPos = null; window.__freecam = false; STAT_KEYS.forEach(k => { if (typeof p.stats[k] !== 'number') p.stats[k] = 0; }); p.projects = p.projects || {}; p.items = p.items || {}; this.bag(); p.decor = p.decor || []; this.home();
    if (p.daily && p.daily.date === todayKey()) this.completeProjects();
    if (PLACED.home && PLACED.home.plate) PLACED.home.plate.userData.set(p.name);
    if (PLACED.hall) { PLACED.hall.sign.userData.set(`${p.island}島 集会所`); }
    if (!p.daily || p.daily.date !== todayKey()) this.newDay();
    if (!(p.letters || []).some(l => l.date === todayKey())) this.makeLetter(null);
    this.garage(); if (p.vehVer !== 2) { if (p.pos) p.pos.vehs = null; p.vehVer = 2; }
    this.completeDev(); this.applyLand();
    this.startAtHome();
    this.modal = null; this.el.title.hidden = true; this.el.side.hidden = false; this.el.hud.hidden = false;
    p.items = p.items || {}; this.bag(); p.decor = p.decor || []; if (DECO.shipSign) DECO.shipSign.userData.set(`${p.island}島 漁協 出荷所`); if (DECO.shopSign) DECO.shopSign.userData.set(`${p.island}商店`); this.refreshDecor(); this.refreshDev(); this.completeHouses(); this.mapDirty = true; MINI.builtAt = -99; UI.clock(currentHour()); this.refreshProjects(); this.syncNewcomers(); this.checkNewcomers(); this.applyTruck(); this.check(); this.save();
    if (isNew) this.showWelcome(); else { UI.toast(`おかえりなさい、${p.name}さん`); this.notifyLetter(); }
    document.getElementById('c').focus();
  },
  resetAll() {
    try { localStorage.removeItem(PROFILE_KEY); localStorage.removeItem(SAVE_KEY); } catch (e) { }
    if (EDIT.on) toggleEdit(false);
    restore({ H: G.H0, Wl: G.Wl0, roads: [], removed: new Uint8Array(VEG.removed.length), trees: [] }); EDIT.undo = [];
    PL.veh = null; PL.x = this.spawn.x; PL.z = this.spawn.z; PL.rot = this.spawn.rot; PL.y = standY(PL.x, PL.z);
    VEH.forEach((v, i) => { const s = this.vehSpawn[i]; v.x = s.x; v.z = s.z; v.rot = s.rot; v.v = 0; placeVehicle(v, 0); });
    if (this.inside) { this.inside = false; this.el.hud.classList.remove('inroom'); this.roomEdit = false; if (ROOM.scene) ROOM.scene.remove(PL.mesh); scene.add(PL.mesh); GAME_RP.scene = scene; this.el.roomp.hidden = true; this.el.roome.hidden = true; document.getElementById('buildBtn').hidden = false; }
    this.endFish(); if (PL.veh && (PL.veh.kind === 'bus' || PL.veh.kind === 'ferry')) PL.veh = null; this.saved = null; this.p = null; this.refreshDev(); const tv = VEH.find(v => v.kind === 'truck'), bv = VEH.find(v => v.kind === 'boat'); if (tv) setVehicleModel(tv, 'truck'); if (bv) setVehicleModel(bv, 'boat'); VEH.forEach(v => { v.x = v.home.x; v.z = v.home.z; v.rot = v.home.rot; placeVehicle(v, 0); }); this.refreshProjects(); this.syncNewcomers(); this.refreshDecor(); NPCS.forEach(n => n.seat = null); EDIT.housePick = null;
  },
  // ---------- UI ----------
  buildUI() {
    const root = document.createElement('div'); root.id = 'game'; document.body.appendChild(root);
    root.innerHTML = `<div class="gtitle" id="gTitle" hidden></div><div class="gmodal" id="gModal" hidden></div><div class="gbanner" id="gBanner" hidden></div><div class="gmeet" id="gMeet" hidden></div><div class="gcatch" id="gCatch" hidden></div><div class="groomp" id="gRoomP" hidden></div><div class="groome" id="gRoomE" hidden></div><div class="gfade" id="gFade" hidden></div>`;
    const side = document.createElement('div'); side.className = 'card gside'; side.id = 'gSide'; side.hidden = true; document.getElementById('hud').appendChild(side);
    this.el = { root, title: root.querySelector('#gTitle'), modal: root.querySelector('#gModal'), banner: root.querySelector('#gBanner'), meet: root.querySelector('#gMeet'), catch: root.querySelector('#gCatch'), roomp: root.querySelector('#gRoomP'), roome: root.querySelector('#gRoomE'), fade: root.querySelector('#gFade'), side, hud: document.getElementById('hud') };
    this.el.hud.hidden = true;
    side.onclick = e => { const b = e.target.closest('[data-g]'); if (b) { const k = b.dataset.g; k === 'map' ? this.openMap() : k === 'letter' ? this.openLetter() : k === 'meet' ? this.openMap(PLACED.hall && PLACED.hall.entry) : k === 'dev' ? this.openDev() : this.openJournal(); return; } this.openJournal(); };
    this.el.modal.onclick = e => { if (e.target === this.el.modal) this.closeModal(); };
  },
  renderTracker() {
    const p = this.p, s = this.el && this.el.side; if (!p || !s) return;
    const lv = this.level(), lo = LV_PTS[lv - 1], hi = LV_PTS[lv], frac = hi ? (p.vit - lo) / (hi - lo) : 1;
    const rows = this.todays().map(m => { const done = p.daily.done[m.id], pr = Math.min(m.n || 1, Math.floor(this.missionProg(m))); return `<li class="${done ? 'done' : ''}"><span class="ck">${done ? '✓' : ''}</span><span class="who">${VNAME(m.who)}</span><span class="tx">${esc(m.text)}</span>${!done && (m.n || 1) > 1 ? `<span class="pr">${pr}/${m.n}</span>` : ''}</li>`; }).join('');
    const html = `<div class="money">💰 ${yen(p.money || 0)}<span class="bagn">🐟${(p.bag && p.bag.fish.length) || 0}/${FISH_CAP}　🍊${(p.bag && p.bag.mikan) || 0}</span></div><div class="vit"><span class="lb">島の元気度</span><b>Lv${lv}</b><span class="bar"><i style="width:${Math.round(frac * 100)}%"></i></span><span class="num">${hi ? `${p.vit}/${hi}` : 'MAX'}</span></div>
      <div class="h">今日のおねがい</div><ul class="ms">${rows}</ul>${this.meetLine()}<div class="btns"><button data-g="letter" class="${this.unreadLetter() ? 'new' : ''}">${this.unreadLetter() ? '📮 ポストに手紙' : '📮 島だより'} <kbd>L</kbd></button><button data-g="j">📖 手帳 <kbd>J</kbd></button><button data-g="map">🗺️ 地図 <kbd>M</kbd></button><button data-g="dev">🏗️ 開発 <kbd>P</kbd></button></div>`;
    if (s._h !== html) { s.innerHTML = html; s._h = html; }
  },
  banner(title, sub) {
    const b = this.el.banner; b.innerHTML = `<div class="t">${esc(title)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}`; b.hidden = false; b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
    clearTimeout(this._bt); this._bt = setTimeout(() => b.hidden = true, 4200);
  },
  showTitle() {
    this.modal = 'title'; const t = this.el.title, s = this.saved; t.hidden = false;
    const form = (msg) => `<form class="nameform" id="gForm" autocomplete="off">
        ${msg ? `<p class="lead">${msg}</p>` : ''}
        <label>あなたの名前<input id="gName" maxlength="8" placeholder="例：ユウ" required></label>
        <label>島の名前<span class="isl"><input id="gIsland" maxlength="8" placeholder="例：ほしなみ" required><b>島</b></span></label>
        <p class="note" id="gErr" role="alert"></p>
        <button class="primary" type="submit">この名前ではじめる</button>${s ? '<button type="button" class="ghost" data-x="back">もどる</button>' : ''}
      </form>`;
    const head = `<div class="logo"><div class="l1">瀬戸内の小さな島で</div><div class="l2">島ぐらし</div></div>`;
    const showForm = (msg) => {
      t.innerHTML = `<div class="tbox">${head}${form(msg)}</div>`;
      const f = t.querySelector('#gForm'); setTimeout(() => t.querySelector('#gName')?.focus(), 50);
      f.onsubmit = e => { e.preventDefault(); const nm = t.querySelector('#gName').value.trim(), il = t.querySelector('#gIsland').value.trim().replace(/島$/, '').trim(); const er = t.querySelector('#gErr');
        if (!nm) { er.textContent = '名前を入れてください'; return; } if (!il) { er.textContent = '島の名前を入れてください'; return; }
        if (this.saved) this.resetAll(); this.begin(this.newProfile(nm, il), true); };
      const bk = t.querySelector('[data-x="back"]'); if (bk) bk.onclick = () => this.showTitle();
    };
    if (!s) { showForm('あなたは、この島で暮らす住民のひとり。みんなから頼りにされるリーダー役です。名前と島の名前を決めてください。'); return; }
    const lvl = (() => { let l = 0; for (let i = 0; i < LV_PTS.length; i++) if (s.vit >= LV_PTS[i]) l = i + 1; return l; })();
    t.innerHTML = `<div class="tbox">${head}<div class="cont"><button class="primary big" data-x="cont">つづきから<small>${esc(s.name)}さん ・ ${esc(s.island)}島 ・ 元気度Lv${lvl}</small></button>
      <button class="ghost" data-x="new">はじめから</button><p class="note" id="gWarn"></p></div></div>`;
    t.querySelector('[data-x="cont"]').onclick = () => this.begin(s, false);
    let armed = false; t.querySelector('[data-x="new"]').onclick = (e) => { if (!armed) { armed = true; e.target.textContent = '本当に消してはじめる'; e.target.classList.add('warn'); t.querySelector('#gWarn').textContent = 'いまの島（地形・道路・木）と記録がすべて消えます。'; return; } showForm('新しい島ぐらしをはじめます。名前と島の名前を決めてください。'); };
    setTimeout(() => t.querySelector('[data-x="cont"]')?.focus(), 50);
  },
  showWelcome() {
    const p = this.p; this.modal = 'welcome';
    this.el.modal.innerHTML = `<div class="mbox welcome"><h2>ようこそ、${esc(p.island)}島へ！</h2>
      <p>${esc(p.name)}さんは、島のみんなから頼りにされているリーダー役。住民のおねがいをかなえたり、島づくりをしたりして、島を元気にしていきましょう。</p>
      <ul><li><b>左上</b>　今日のおねがい（毎日3つ）と島の元気度</li><li><b>J</b>　島手帳：おねがい・島の目標・解放・住民</li><li><b>家</b>　ここがあなたの家。駐車場の軽トラに乗れます。毎朝、ポストに島だよりが届きます</li><li><b>集会所</b>　週に1回、島の会議をひらいて島のことを決めます</li><li><b>M</b>　島の地図（🔒の場所は元気度が上がると島づくりできます）</li><li><b>B</b>　しまづくり（地形・道路・木）</li><li><b>Space</b>　住民と話す・乗り物に乗る・みかんをとる</li><li><b>F</b>　釣り（釣りざおはゲンじいから）</li><li><b>家</b>　玄関の前で Space で家に入れます。カタログで家具を買って模様がえ（B）</li><li><b>P</b>　島の開発：お金で観光船・バス・道の駅・旅館・埋め立てなど大きな工事ができます。車は島モータースで</li><li><b>I</b>　バッグ：釣った魚やみかんは港の出荷所で売ったり、住民にプレゼントできます。お金で商店のかざりが買えます</li></ul>
      <p class="small">記録はこのブラウザに自動でセーブされます。</p><button class="primary" data-x="ok">島へ出かける</button></div>`;
    this.el.modal.hidden = false; this.el.modal.querySelector('[data-x="ok"]').onclick = () => this.closeModal(); setTimeout(() => this.el.modal.querySelector('[data-x="ok"]')?.focus(), 30);
  },
  closeModal() { if (this.modal === 'title') return; const was = this.modal; this.modal = null; if (was === 'welcome') setTimeout(() => this.notifyLetter(), 400); this.el.modal.hidden = true; this.el.modal.innerHTML = ''; document.getElementById('c').focus(); },
  openJournal(tab) {
    if (!this.p) return; this.modal = 'journal'; this.jTab = tab || this.jTab || 'daily'; const p = this.p, lv = this.level();
    const tabs = [['daily', '今日のおねがい'], ['goals', '島の目標'], ['unlock', '解放'], ['people', '住民'], ['letters', '島だより'], ['meet', '島の会議'], ['zukan', '図鑑'], ['cal', '行事']];
    let body = '';
    if (this.jTab === 'daily') body = `<ul class="list">${this.todays().map(m => { const done = p.daily.done[m.id], pr = Math.min(m.n || 1, Math.floor(this.missionProg(m))); return `<li class="${done ? 'done' : ''}"><span class="ck">${done ? '✓' : ''}</span><div><b>${VNAME(m.who)}のおねがい</b>　${esc(m.text)}${(m.n || 1) > 1 ? `　<span class="pr">${pr}/${m.n}${m.unit || ''}</span>` : ''}<div class="sub">「${esc(this.fill(m.ask))}」</div></div><span class="pts">+10</span></li>`; }).join('')}</ul><p class="small">おねがいは毎日（現実の日付で）新しく3つ届きます。かなえると元気度が上がり、その住民となかよくなります。</p>`;
    if (this.jTab === 'goals') body = `<ul class="list">${GOALS.map(g => { const done = p.goals[g.id], pr = Math.min(g.n, Math.floor(this.goalProg(g))), lk = g.needLv && g.needLv > lv; return `<li class="${done ? 'done' : ''}"><span class="ck">${done ? '✓' : ''}</span><div>${esc(g.text)}${!done && g.n > 1 ? `　<span class="pr">${pr}/${g.n}${g.unit || ''}</span>` : ''}${lk ? `<div class="sub">🔒 元気度Lv${g.needLv}で道具が使えるようになります</div>` : ''}</div><span class="pts">+${g.pts}</span></li>`; }).join('')}</ul>`;
    if (this.jTab === 'unlock') body = `<ul class="list">${[1, 2, 3, 4, 5, 6, 7].map(l => `<li class="${l <= lv ? 'done' : 'lock'}"><span class="ck">${l <= lv ? '✓' : '🔒'}</span><div><b>Lv${l}</b>（元気度 ${LV_PTS[l - 1]}）<div class="sub">${l === 1 ? '①港町・②住宅地・③開拓地で島づくり／上げる・下げる・平らに・なめらか・道路・木を植える' : LV_UNLOCK[l].join('・')}</div></div></li>`).join('')}</ul>`;
    if (this.jTab === 'people') body = `<ul class="list people">${VILLAGER_DEF.map(v => { const met = p.talked[v.id], f = Math.min(10, p.friend[v.id] || 0); return `<li><span class="ck">${met ? '😊' : '？'}</span><div><b>${met ? v.name : '？？？'}</b><div class="sub">${met ? `なかよし ${'♥'.repeat(Math.min(5, Math.ceil(f / 2)))}${'♡'.repeat(5 - Math.min(5, Math.ceil(f / 2)))}${p.favKnown && p.favKnown[v.id] && GIFT_PREF[v.id] ? '　好きなもの：' + GIFT_PREF[v.id].love.map(id => id === 'mikan' ? 'みかん' : (FISH.find(q => q.id === id) || {}).name).join('・') : ''}${MILESTONE[v.id] && !(p.mile && p.mile[v.id]) ? '　（なかよし5でお礼がもらえるかも）' : ''}` : 'まだ話していません'}</div>${met && typeof LIVE !== 'undefined' ? `<div class="sub">${LIVE.status(v.id)}</div>` : ''}</div></li>`; }).join('')}</ul>`;
    if (this.jTab === 'letters') body = this.lettersTab();
    if (this.jTab === 'meet') body = this.meetTab();
    if (this.jTab === 'zukan') body = this.zukanTab();
    if (this.jTab === 'cal') body = SEASON.calTab();
    this.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>${esc(p.name)}の島手帳</h2><span class="isl">${esc(p.island)}島・元気度 Lv${lv}（${p.vit}）</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
      <div class="tabs">${tabs.map(([k, n]) => `<button data-tab="${k}" class="${k === this.jTab ? 'on' : ''}">${n}</button>`).join('')}</div><div class="mb">${body}</div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.journal').onclick = e => { const tb = e.target.closest('[data-tab]'); if (tb) { this.openJournal(tb.dataset.tab); return; } const lt = e.target.closest('[data-letter]'); if (lt) { this.openLetter(+lt.dataset.letter); return; } const ed = e.target.closest('[data-evday]'); if (ed) { SEASON.setOverride(ed.dataset.evday); this.openJournal('cal'); return; } if (e.target.closest('[data-x="close"]')) this.closeModal(); };
  },
  fill(s) { return String(s).replace(/\{P\}/g, this.p ? this.p.name : '').replace(/\{I\}/g, this.p ? this.p.island : ''); },
  // ---------- map ----------
  openMap(focus) {
    if (!this.p) return; this.modal = 'map'; this.mapFocus = focus || null;
    this.el.modal.innerHTML = `<div class="mbox mapbox"><div class="mh"><h2>${esc(this.p.island)}島の地図</h2><span class="isl">🔒 = 元気度が上がると島づくりできる場所</span><button class="x" data-x="close" aria-label="とじる">×</button></div><canvas id="gMap" width="1080" height="1080"></canvas>
      <div class="legend"><span><i class="me"></i>あなた</span><span><i class="ppl"></i>住民</span><span><i class="star">★</i>今日のおねがいの場所</span><span><i class="rd"></i>道路</span></div></div>`;
    this.el.modal.hidden = false; this.el.modal.querySelector('[data-x="close"]').onclick = () => this.closeModal();
    this.drawMap(this.el.modal.querySelector('#gMap'));
  },
  drawMap(cv, stat) {
    const E = 246, S = cv.width / (2 * E), ctx = cv.getContext('2d'), { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, H = G.H, W = G.Wl, lv = this.level();
    const N = Math.round(2 * E / cell) + 1, img = new ImageData(N, N), D = img.data;
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const wx = -E + x * cell, wz = -E + y * cell, [i, j] = toIdx(wx, wz), k = j * n + i, h = H[k];
      const dx = (H[k + 1] - H[k - 1]) / (2 * cell), dz = (H[k + n] - H[k - n]) / (2 * cell), sl = Math.hypot(dx, dz);
      let c; const L = W[k];
      if (!isNaN(L) && L > h + 0.05) c = mix([118, 200, 236], [62, 150, 210], (L - h) / 2);
      else if (h < 0) c = mix([132, 214, 222], [40, 112, 170], -h / 10);
      else if (h < 1.4) c = [236, 224, 182];
      else { c = mix([160, 212, 120], [96, 160, 84], h / 30); if (sl > 0.75) c = mix(c, [168, 158, 142], (sl - 0.75) * 2); }
      if (h >= 0) { const sh = 1 + (-dx - dz) * 0.35; c = c.map(v => v * Math.max(0.7, Math.min(1.25, sh))); }
      const z = G.zone[k]; if (h > 0.2 && ZONES[z].lv > lv) c = c.map((v, q) => v * 0.68 + [30, 40, 60][q] * 0.12);
      if (h > 0.4 && (G.zone[k + 1] !== z || G.zone[k + n] !== z)) c = [255, 255, 255].map((v, q) => c[q] * 0.45 + v * 0.55);
      const o = (y * N + x) * 4; D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255;
    }
    const tmp = document.createElement('canvas'); tmp.width = tmp.height = N; tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(tmp, 0, 0, cv.width, cv.height);
    const P = (x, z) => [(x + E) * S, (z + E) * S];
    // trees
    ctx.fillStyle = 'rgba(58,118,62,0.55)';
    for (const it of VEG.items) if (it.type === 'tree' && !VEG.removed[it.id]) { const [a, b] = P(it.x, it.z); ctx.beginPath(); ctx.arc(a, b, 2.6, 0, 6.3); ctx.fill(); }
    for (const it of VEG.userTrees) { const [a, b] = P(it.x, it.z); ctx.beginPath(); ctx.arc(a, b, 2.8, 0, 6.3); ctx.fill(); }
    // roads
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const pass of [0, 1]) for (const r of ROADS) { ctx.beginPath(); r.pts.forEach(([x, z], i) => { const [a, b] = P(x, z); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); const ty = typeof rType === 'function' ? rType(r) : 'asphalt', fw = typeof footW === 'function' ? footW(r) : r.w, foot = ty === 'path' || ty === 'trail'; ctx.strokeStyle = pass ? ((typeof RCOL !== 'undefined' && r.user && RCOL[ty]) || (r.user ? '#f6efe0' : '#eef0f2')) : (foot ? 'rgba(120,90,70,0.55)' : 'rgba(60,62,70,0.75)'); ctx.lineWidth = pass ? fw * S * 0.75 : fw * S * 0.75 + (foot ? 1.5 : 3); ctx.stroke(); }
    // buildings
    for (const hs of PLACED.houses) { const [a, b] = P(hs.x, hs.z); ctx.save(); ctx.translate(a, b); ctx.rotate(-hs.rot); ctx.fillStyle = '#e07a52'; ctx.strokeStyle = '#7a3a22'; ctx.lineWidth = 1.5; ctx.fillRect(-hs.w / 2 * S, -hs.d / 2 * S, hs.w * S, hs.d * S); ctx.strokeRect(-hs.w / 2 * S, -hs.d / 2 * S, hs.w * S, hs.d * S); ctx.restore(); }
    for (const c of NEWCOMERS) { const s = this.p.newc && this.p.newc[c.id]; if (!s || !s.house) continue; const hs = s.house; const [a, b] = P(hs.x, hs.z); ctx.save(); ctx.translate(a, b); ctx.rotate(-hs.rot); ctx.fillStyle = s.state === 'moved' ? '#e07a52' : '#f2c21a'; ctx.strokeStyle = '#7a3a22'; ctx.lineWidth = 1.5; ctx.fillRect(-4.1 * S, -3.4 * S, 8.2 * S, 6.8 * S); ctx.strokeRect(-4.1 * S, -3.4 * S, 8.2 * S, 6.8 * S); ctx.restore(); }
    if (this.p.dev) for (const d of DEV) { const s = this.p.dev[d.id]; if (!s || s.x === undefined || s.state === 'site') continue; const [a, b] = P(s.x, s.z); ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.state === 'build' ? '🚧' : d.icon, a, b); }
    // zone labels
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let z = 1; z <= 9; z++) { const L = this.zoneLabel[z]; if (!L) continue; let [a, b] = P(L.x, L.z); const zn = ZONES[z], lk = zn.lv > lv, t = `${zn.num}${zn.name}${lk ? `  🔒Lv${zn.lv}` : ''}`;
      ctx.font = '800 30px "M PLUS Rounded 1c", sans-serif'; const w = ctx.measureText(t).width + 26; a = Math.max(w / 2 + 6, Math.min(cv.width - w / 2 - 6, a)); if (z === 4) b += 46; ctx.fillStyle = lk ? 'rgba(40,50,60,0.8)' : 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.roundRect(a - w / 2, b - 21, w, 42, 21); ctx.fill(); ctx.fillStyle = lk ? '#fff' : '#22323a'; ctx.fillText(t, a, b + 1); }
    // landmarks
    const want = new Set(this.todays().filter(m => m.visit && !this.p.daily.done[m.id]).map(m => m.visit));
    ctx.font = '800 25px "M PLUS Rounded 1c", sans-serif';
    const OFF = { falls: [-34, 0], light: [0, -26], church: [0, -26], peak: [0, -26], harbor: [0, 30], home: [0, 30], hall: [0, -26], ship: [44, 8], shop: [0, -26], motors: [0, 30] };
    for (const [id, nm] of Object.entries({ falls: '滝', light: '灯台', church: '神社', peak: '丘のてっぺん', harbor: '港', home: 'あなたの家', hall: '集会所', ship: '出荷所', shop: '商店', motors: '島モータース' })) { const L = this.LM[id]; if (!L || L.gone) continue; const [a, b] = P(L.x, L.z), [ox, oy] = OFF[id];
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#22323a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a, b, 9, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#22323a'; ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 6; ctx.strokeText(nm, a + ox, b + oy); ctx.fillText(nm, a + ox, b + oy); }
    ctx.font = '900 46px sans-serif';
    if (stat) return;
    for (const id of want) { const L = this.LM[id]; if (!L) continue; const [a, b] = P(L.x, L.z); ctx.fillStyle = '#ffcf3a'; ctx.strokeStyle = '#7a4a00'; ctx.lineWidth = 3; ctx.strokeText('★', a + 22, b + 20); ctx.fillText('★', a + 22, b + 20); }
    if (this.mapFocus) { const [a, b] = P(this.mapFocus.x, this.mapFocus.z); ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 6; ctx.setLineDash([14, 8]); ctx.beginPath(); ctx.arc(a, b, 46, 0, 6.3); ctx.stroke(); ctx.setLineDash([]); ctx.font = '800 26px "M PLUS Rounded 1c", sans-serif'; ctx.fillStyle = '#ff5a3c'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.strokeText('おすすめの場所', a, b - 62); ctx.fillText('おすすめの場所', a, b - 62); }
    // villagers, vehicles, player
    for (const v of NPCS) { const [a, b] = P(v.x, v.z); ctx.fillStyle = '#ff8fb0'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(a, b, 9, 0, 6.3); ctx.fill(); ctx.stroke(); }
    for (const v of VEH) { const [a, b] = P(v.x, v.z); ctx.font = '34px sans-serif'; ctx.fillText(v.kind === 'boat' ? '🚤' : '🛻', a, b); }
    { const [a, b] = P(PL.x, PL.z); ctx.save(); ctx.translate(a, b); ctx.rotate(-PL.rot);
      ctx.fillStyle = '#f2a541'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(16, -14); ctx.lineTo(0, -5); ctx.lineTo(-16, -14); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); }
  },
  // ---------- input ----------
  onKey(e) {
    if (this.modal === 'title') return true;
    if (this.modal === 'meeting') return true;
    if (this.modal) { if (e.code === 'Escape' || (e.code === 'KeyJ' && this.modal === 'journal') || (e.code === 'KeyM' && this.modal === 'map') || (e.code === 'KeyL' && this.modal === 'letter') || (e.code === 'KeyI' && this.modal === 'bag') || (e.code === 'KeyP' && this.modal === 'dev') || (this.modal === 'welcome' && (e.code === 'Enter' || e.code === 'Space'))) { e.preventDefault(); this.closeModal(); } return true; }
    if (!this.p) return false;
    if (e.code === 'KeyJ' && !e.repeat) { this.openJournal(); return true; }
    if (e.code === 'KeyM' && !e.repeat) { this.openMap(); return true; }
    if (e.code === 'KeyL' && !e.repeat) { this.openLetter(); return true; }
    if (e.code === 'KeyI' && !e.repeat) { this.openBag(); return true; }
    if (e.code === 'KeyP' && !e.repeat) { this.openDev(); return true; }
    return false;
  },
  blocking() { return !!this.modal; },
  // ---------- home, mailbox, hall ----------
  applyTruck(announce) {
    const v = VEH.find(q => q.kind === 'truck'); if (!v) return; const tl = truckLvFor(this.p ? this.level() : 1), T = TRUCK_LV[tl];
    if (announce && this.p && (this.p.truckLv || 1) < tl) UI.toast(`🛻 軽トラが「${T.name}」になった！`); if (this.p) this.p.truckLv = tl;
    VSPEC.truck.max = T.max; VSPEC.truck.acc = T.acc; v.lv = tl; v.name = T.name;
    v.mesh.traverse(o => { if (!o.isMesh) return; const nm = o.material.name; if (nm === 'body' || nm === 'bed') { if (!o.userData.own) { o.material = o.material.clone(); o.userData.own = true; } o.material.color.set(nm === 'body' ? T.body : T.bed); o.material.roughness = tl === 1 ? 0.75 : 0.4; } });
  },
  nearMail() { const M = PLACED.home && PLACED.home.mail; return M && !PL.veh && Math.hypot(PL.x - M.x, PL.z - M.z) < 1.9; },
  nearHall() { const H = PLACED.hall; if (!H || PL.veh) return false; return Math.hypot(PL.x - H.entry.x, PL.z - H.entry.z) < 3.6 || Math.hypot(PL.x - H.x, PL.z - H.z) < 5.5; },
  prompt() {
    if (!this.p) return '';
    if (PL.veh && PL.veh.kind === 'bus') return PL.veh.wait > 0 ? `Space：バスをおりる（${(PL.veh.stop || {}).name || ''}）` : `🚌 ${PL.veh.dir > 0 ? '灯台口' : '西の浜口'}方面　次のバス停でおりられます`;
    if (PL.veh && PL.veh.kind === 'ferry') return PL.veh.docked ? (PL.veh.s > 1 ? 'Space：観光船をおりる' : 'まもなく出航（Space でおりる）') : '🛳️ 島めぐり中…　V で目線、ドラッグで見回す';
    { const rt = this.rideTarget(); if (rt) return rt.kind === 'bus' ? `Space：バスに乗る（${rt.dir > 0 ? '灯台口' : '西の浜口'}方面）` : 'Space：観光船に乗る（島を一周）'; }
    if (this.nearDoor()) return 'Space：家に入る';
    if (this.nearGarage()) return 'Space：ガレージ（乗る車をえらぶ・車をもどす）';
    if (this.nearMotors()) return 'Space：島モータースに入る';
    if (this.nearMail()) return this.unreadLetter() ? 'Space：ポストを開ける（島だよりが届いています）' : 'Space：ポストを見る';
    if (this.fishing()) return LIFE.fish.st === 'bite' ? '今だ！ F か Space' : 'F：釣りざおをあげる　（ウキがしずんだら F か Space）';
    if (this.nearHall()) return this.meetToday() ? 'Space：島の会議をはじめる' : `集会所　次の島の会議は ${fmtDay(this.meetState().next)}`;
    if (this.nearShip()) return 'Space：出荷所で魚やみかんを売る';
    if (this.nearShop()) return 'Space：商店で買い物をする';
    { const mk = this.nearMikan(); if (mk) return 'Space：みかんをとる'; }
    return '';
  },
  interact() {
    if (!this.p) return false; if (PL.veh) return (PL.veh.kind === 'bus' || PL.veh.kind === 'ferry') ? this.rideKey() : false;
    if (this.rideTarget()) return this.rideKey();
    if (this.nearDoor()) { this.enterHome(); return true; }
    if (this.nearGarage()) { this.openGarage(); return true; }
    if (this.nearMotors()) { this.openMotors(); return true; }
    if (this.nearMail()) { const L = this.unreadLetter(); if (L) this.openLetter(L.no, true); else UI.toast('ポストはからっぽです（読んだ島だよりは L キーで読めます）'); return true; }
    if (this.nearShip()) { this.openShip(); return true; }
    if (this.nearShop()) { this.openShop(); return true; }
    { const mk = !this.nearHall() && this.nearMikan(); if (mk) { this.pickMikan(mk); return true; } }
    if (this.nearHall()) { if (this.meetToday()) this.startMeeting(); else UI.toast(this.agenda().length ? `次の島の会議は ${fmtDay(this.meetState().next)} です` : '今は話し合う議題がありません'); return true; }
    return false;
  },
  meetLine() {
    if (!this.p || !PLACED.hall) return ''; const m = this.meetState();
    return this.meetToday() ? `<button class="meet on" data-g="meet">🏛️ 今日は島の会議の日！ 集会所へ</button>` : `<div class="meet">🏛️ 次の島の会議：${fmtDay(m.next)}</div>`;
  },
  meetTab() {
    const p = this.p, m = this.meetState(), P = p.projects || {};
    const rows = Object.entries(P).map(([id, pr]) => { const q = PROPOSALS.find(x => x.id === id); return q ? `<li class="${pr.done ? 'done' : ''}"><span class="ck">${pr.done ? '✓' : '🚧'}</span><div><b>${esc(q.title)}</b>（${VNAME(q.who)}の提案）<div class="sub">${pr.done ? '完成：' + esc(q.effect) : '工事中（' + fmtDay(addDays(pr.date, 1)) + 'に完成）'}</div></div></li>` : ''; }).join('');
    return `<p class="small" style="margin:0 0 8px">島の会議は週に1回、集会所でひらかれます。住民の提案から1つをえらぶと、次の日に島にできあがります。</p>
      <ul class="list"><li><span class="ck">🏛️</span><div><b>${this.meetToday() ? '今日は島の会議の日です' : '次の島の会議：' + fmtDay(m.next)}</b><div class="sub">これまでの会議：${m.count}回</div></div></li>${rows || '<li><span class="ck"></span><div class="sub">まだ決まったことはありません</div></li>'}</ul>`;
  },
  updateWorldMarks() {
    const H = PLACED.home; if (!H || !H.flag) return; const un = !!this.unreadLetter();
    H.flag.rotation.set(un ? 0 : -1.5, H.hs.rot, 0, 'YXZ'); H.bubble.visible = un; if (un) H.bubble.position.y = H.hs.y + 2.2 + Math.sin(performance.now() / 300) * 0.08;
    if (PLACED.hall && PLACED.hall.poster) { const t = this.meetToday() ? '今日 島の会議！' : `次の会議 ${fmtDay(this.meetState().next)}`; if (this._poster !== t) { this._poster = t; PLACED.hall.poster.userData.set(t); } }
    PROJ.beams.forEach(m => m.opacity = (this.night || 0) * 0.16);
  },
  titleCam(t) { const a = t * 0.05 + 0.6; camera.position.set(Math.cos(a) * 330, 150, Math.sin(a) * 330); camera.lookAt(-10, 0, 10); },
};
