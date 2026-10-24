// ===================== 島の会議 (weekly meeting at the 集会所) + projects it decides =====================
const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number), t = new Date(y, m - 1, d + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
const fmtDay = key => { const [, m, d] = key.split('-').map(Number); return `${m}月${d}日`; };
const TRUCK_LV = [null,
  { name: 'おさがりの軽トラ', max: 11, acc: 4.6, body: '#cbc3a6', bed: '#b5ac92' },
  { name: '整備した軽トラ', max: 14, acc: 5.6, body: '#f3f2ec', bed: '#d8d6cf' },
  { name: 'ピカピカの軽トラ', max: 17.5, acc: 6.8, body: '#7cc2ea', bed: '#5aa2cc' }];
const truckLvFor = lv => lv >= 5 ? 3 : lv >= 3 ? 2 : 1;

// who likes / dislikes what (used for votes at the meeting)
const OPIN = {
  v_mio: { like: { sea: '海がもっと好きになりそう！', scenery: '景色がきれいになるの、大賛成！' }, dislike: {}, neutral: 'どれもいいと思うな。{P}さんにまかせるよ！' },
  v_sora: { like: { road: '道が便利になるなら大賛成！', event: 'にぎやかなの、いいじゃん！', light: '夜も走りやすくなるな！' }, dislike: { quiet: 'うーん、ちょっと地味じゃね？' }, neutral: 'オレはどっちでもいいぜ。' },
  v_hana: { like: { nature: 'お花や木がふえるなら、うれしいわ。', scenery: 'すてきな景色が見られるのね。', quiet: 'のんびりできる場所、いいわね。' }, dislike: { light: '夜が明るすぎると、虫や花がびっくりしちゃうかも…', event: 'にぎやかすぎるのは、ちょっと苦手なの…' }, neutral: 'わたしは、みんなが決めたことに賛成よ。' },
  v_gen: { like: { sea: '港のためになるなら、わしは賛成じゃ。', tradition: '昔からの島らしさが残るのはええのう。', quiet: '静かに海をながめる場所はええもんじゃ。' }, dislike: { event: '人が集まりすぎると、静かな島らしさがのう…', shop: '商売のことは、ようわからんのう…' }, neutral: 'わしはどっちでもかまわんよ。' },
  v_rin: { like: { community: 'みんなが集まれる場所、ほしかったんだ！', culture: '島の自慢がふえるね！', scenery: '島の自慢がふえるね！' }, dislike: {}, neutral: 'いいと思う！ {P}さんはどう思う？' },
  v_kai: { like: { shop: 'お店っぽいの大好き！ ぜったい楽しいよ！', event: 'イベント最高！', light: '夜もキラキラしてたら楽しそう！' }, dislike: { tradition: 'うーん、ちょっと地味じゃない？', quiet: 'えー、もっとにぎやかなのがいいな。' }, neutral: 'うーん、どっちでもいいかな。' },
};
const PROPOSALS = [
  { id: 'lamps', who: 'v_gen', title: '港に街灯をつける', desc: '夜の港は暗くて、船を出すのがあぶないんじゃ。港の道に街灯をつけたい。', effect: '港の道に街灯が立ち、夜に明かりがともる', tags: ['sea', 'light', 'community'] },
  { id: 'flowers', who: 'v_hana', title: '開拓地に花畑をつくる', desc: '開拓地の一角を花畑にしたいの。色とりどりのお花がさいたら、きっとすてきよ。', effect: '③開拓地に花畑ができる', tags: ['nature', 'scenery'] },
  { id: 'benchBeach', who: 'v_mio', title: '夕日の浜にベンチを置く', desc: '夕日の浜で、すわって夕焼けをながめたいな。ベンチがあったらうれしい！', effect: '⑥夕日の浜にベンチが3つ置かれる', tags: ['scenery', 'quiet', 'sea'] },
  { id: 'market', who: 'v_kai', title: '港で朝市をひらく', desc: '港に屋台を出して、魚やみかんを売る朝市をやりたい！ 島の外からもお客さんが来るかも！', effect: '港に朝市の屋台が3つ並ぶ', tags: ['shop', 'event', 'sea'] },
  { id: 'park', who: 'v_rin', title: '開拓地に広場をつくる', desc: 'みんなが集まれる広場がほしいの。ベンチと時計があって、子どもも大人ものんびりできる場所。', effect: '③開拓地に時計とベンチのある広場ができる', tags: ['community', 'nature'] },
  { id: 'signs', who: 'v_sora', title: '名所に案内看板を立てる', desc: '滝とか灯台とか、どこにあるか分かりにくいだろ？ 名所に看板を立てようぜ！', effect: '島の名所6か所に看板が立つ', tags: ['road', 'culture'] },
  { id: 'busstop', who: 'v_sora', title: '県道にバス停をつくる', desc: '海ぞいの県道にバス停があったら、島っぽくていいと思うんだよな！', effect: '家の近くの県道に屋根つきのバス停ができる', tags: ['road', 'community'] },
  { id: 'lightup', who: 'v_rin', title: '教会をライトアップする', desc: '夜の教会を下から照らしたら、きっと島の名物になるよ！', effect: '夜、教会がライトで照らされる', tags: ['light', 'culture', 'scenery'] },
  { id: 'deck', who: 'v_mio', title: '見晴らしの丘に展望デッキ', desc: '丘のてっぺんに木のデッキがあったら、島じゅうをゆっくりながめられるよ！', effect: '④見晴らしの丘のてっぺんに展望デッキと望遠鏡ができる', tags: ['scenery', 'culture'], needLv: 2 },
  { id: 'mikanStand', who: 'v_gen', title: 'みかんの無人販売所', desc: 'みかん畑の道ばたに、昔ながらの無人販売所を置きたいんじゃ。', effect: '⑤みかん段々畑の道ばたに無人販売所ができる', tags: ['tradition', 'shop'], needLv: 3 },
];
const PROJ = { group: null, colls: [], beams: [] };
Object.assign(GAME, {
  // ---------- votes ----------
  stance(prop, vid) {
    if (prop.who === vid) return { s: 'yes', t: '（提案した人）' };
    const O = OPIN[vid], lk = prop.tags.filter(t => O.like[t]), dl = prop.tags.filter(t => O.dislike[t]);
    if (lk.length > dl.length) return { s: 'yes', t: O.like[lk[0]] };
    if (dl.length > lk.length) return { s: 'no', t: O.dislike[dl[0]] };
    if (lk.length) return { s: 'mid', t: `${O.like[lk[0]]}　でも、${O.dislike[dl[0]]}` };
    return { s: 'mid', t: O.neutral };
  },
  tally(prop) { const c = { yes: 0, no: 0, mid: 0 }; VILLAGER_DEF.forEach(v => c[this.stance(prop, v.id).s]++); return c; },
  // ---------- schedule ----------
  meetState() { const p = this.p; if (!p.meet) p.meet = { next: todayKey(), count: 0, held: [] }; return p.meet; },
  meetToday() { const m = this.meetState(); return m.next <= todayKey() && this.agenda().length > 0; },
  agenda() {
    const m = this.meetState(), lv = this.level(); if (m.agenda && m.agenda.date === todayKey()) return m.agenda.ids.map(id => PROPOSALS.find(q => q.id === id));
    const pool = PROPOSALS.filter(q => !m.held.includes(q.id) && (!q.needLv || q.needLv <= lv)), R = mulberry(hashStr('meet' + todayKey() + this.p.created)), ids = [], who = new Set();
    for (let k = 0; k < 80 && ids.length < Math.min(3, pool.length); k++) { const q = pool[Math.floor(R() * pool.length)]; if (ids.includes(q.id) || (who.has(q.who) && k < 40)) continue; ids.push(q.id); who.add(q.who); }
    m.agenda = { date: todayKey(), ids }; return ids.map(id => PROPOSALS.find(q => q.id === id));
  },
  // ---------- projects ----------
  completeProjects() { // called on a new day: yesterday's decisions are built overnight
    const p = this.p, done = []; p.projects = p.projects || {};
    for (const [id, pr] of Object.entries(p.projects)) if (!pr.done && pr.date < todayKey()) { pr.done = true; done.push(id); this.addVit(15); }
    if (done.length) p.justBuilt = done; return done;
  },
  refreshProjects() {
    if (!PROJ.group) { PROJ.group = new THREE.Group(); scene.add(PROJ.group); }
    while (PROJ.group.children.length) PROJ.group.remove(PROJ.group.children[0]);
    PROJ.colls.forEach(c => c.off = true); PROJ.colls = []; PROJ.beams = []; PROJ.deck = null;
    const P = (this.p && this.p.projects) || {};
    for (const [id, pr] of Object.entries(P)) { const b = PROJ_BUILD[id]; if (!b) continue; try { const r = b(); if (pr.done) PROJ.group.add(r.g); else PROJ.group.add(makeConstruction(r.at)); } catch (e) { console.warn('project', id, e); } }
  },
  projAt(id) { try { return PROJ_BUILD[id]().at; } catch (e) { return null; } },
  // ---------- meeting flow ----------
  startMeeting() {
    const H = PLACED.hall, m = this.meetState(); if (!H) return;
    this.modal = 'meeting'; this.mt = { step: 'open', ag: this.agenda(), sel: null, no: m.count + 1 };
    this.fade(() => {
      NPCS.filter(n => !n.visitor).forEach((n, i) => { const st = i >= H.seats.length, s = st ? [-3.75 + (i - H.seats.length) * 2.5, -3.6] : H.seats[i], [x, z] = toWorld(H, s[0], s[1]); n.seat = { x, z, rot: H.rot, stand: st }; n.x = x; n.z = z; n.state = 'idle'; });
      const [px, pz] = toWorld(H, H.chair[0], H.chair[1]); PL.x = px; PL.z = pz; PL.y = groundH(px, pz); PL.rot = H.rot + Math.PI / 2; PL.speed = 0; this.el.hud.hidden = true;
      H.board.userData.set(`第${m.count + 1}回 島の会議`); this.renderMeeting();
    });
  },
  endMeeting() {
    const H = PLACED.hall;
    this.fade(() => {
      NPCS.filter(n => n.seat).forEach(n => { n.seat = null; n.x = n.hx; n.z = n.hz; n.y = groundH(n.x, n.z); if (n.vote) n.vote.visible = false; });
      PL.x = H.entry.x; PL.z = H.entry.z; PL.y = groundH(PL.x, PL.z); PL.rot = H.rot; CAM.yaw = PL.rot + Math.PI; CAM.snap = true;
      H.board.userData.set('島の会議'); this.el.hud.hidden = false; this.mt = null; this.modal = null; this.el.meet.hidden = true; this.renderTracker(); document.getElementById('c').focus();
    });
  },
  fade(fn) { const f = this.el.fade; f.hidden = false; f.classList.add('on'); setTimeout(() => { fn(); setTimeout(() => { f.classList.remove('on'); setTimeout(() => f.hidden = true, 400); }, 120); }, 380); },
  speak(vid) { const n = NPCS.find(q => q.def.id === vid); if (n) n.speakT = 2.2; },
  showVotes(prop) { for (const n of NPCS.filter(q => !q.visitor)) { if (!n.vote) { n.vote = makeVoteSprite(); n.mesh.add(n.vote); n.vote.position.y = 1.95; } const s = prop ? this.stance(prop, n.def.id).s : null; n.vote.visible = !!s; if (s) n.vote.material.map = VOTE_TEX[s]; } },
  renderMeeting() {
    const p = this.p, mt = this.mt, el = this.el.meet, m = this.meetState(); if (!mt) return; el.hidden = false;
    const F = s => esc(this.fill(s)), face = { yes: '⭕', no: '❌', mid: '🔺' }, lbl = { yes: '賛成', no: '反対', mid: 'どちらでも' };
    let h = `<div class="mhd">第${mt.no}回　${esc(p.island)}島　島の会議</div>`;
    if (mt.step === 'open') { this.showVotes(null); this.speak('v_rin');
      h += `<div class="say"><b>リン</b>${F('{P}さん、みんな集まったよ！ 今日の議題は' + mt.ag.length + 'つ。どれを島で進めるか、{P}さんが決めてね。')}</div><div class="row"><span class="sp"></span><button class="primary" data-m="list">議題を見る</button></div>`; }
    if (mt.step === 'list') { this.showVotes(null);
      h += `<div class="say small">気になる案をえらぶと、みんなの意見が聞けます。決めるのは1つだけ。</div><div class="cards">${mt.ag.map(q => { const c = this.tally(q); return `<button class="pcard" data-p="${q.id}"><span class="who">${VNAME(q.who)}の提案</span><b>${esc(q.title)}</b><span class="eff">${esc(q.effect)}</span><span class="vt">⭕${c.yes}　❌${c.no}　🔺${c.mid}</span></button>`; }).join('')}</div>
        <div class="row"><button class="ghost" data-m="later">いったん休けい（あとで続きをする）</button></div>`; }
    if (mt.step === 'detail') { const q = PROPOSALS.find(x => x.id === mt.sel); this.showVotes(q); this.speak(q.who);
      h += `<div class="say"><b>${VNAME(q.who)}</b>「${F(q.desc)}」</div><div class="eff2">完成すると：${esc(q.effect)}</div>
        <ul class="ops">${VILLAGER_DEF.filter(v => v.id !== q.who).map(v => { const st = this.stance(q, v.id); return `<li class="${st.s}"><span class="f">${face[st.s]}</span><b>${v.name}</b><span class="l">${lbl[st.s]}</span><span class="t">${F(st.t)}</span></li>`; }).join('')}</ul>
        <div class="row"><button class="ghost" data-m="list">ほかの案を見る</button><span class="sp"></span><button class="primary" data-m="decide">この案に決める</button></div>`; }
    if (mt.step === 'done') { const q = PROPOSALS.find(x => x.id === mt.sel), nos = VILLAGER_DEF.filter(v => this.stance(q, v.id).s === 'no');
      h += `<div class="say"><b>${VNAME(q.who)}</b>${F('やったー！ {P}さん、ありがとう！ みんなでがんばろう！')}</div>${nos.length ? `<div class="say"><b>${nos.map(v => v.name).join('・')}</b>${F('反対だったけど、決まったからには協力するよ。')}</div>` : ''}
        <div class="eff2">決定：「${esc(q.title)}」　工事は明日完成します。元気度 +15</div><div class="row"><span class="small">次の島の会議は ${fmtDay(m.next)}</span><span class="sp"></span><button class="primary" data-m="end">会議をおわる</button></div>`; }
    el.innerHTML = h;
    el.onclick = e => { const b = e.target.closest('[data-m],[data-p]'); if (!b) return; if (b.dataset.p) { mt.sel = b.dataset.p; mt.step = 'detail'; return this.renderMeeting(); }
      const k = b.dataset.m; if (k === 'list') { mt.step = 'list'; this.renderMeeting(); } if (k === 'decide') this.decide(mt.sel); if (k === 'later' || k === 'end') this.endMeeting(); };
    setTimeout(() => { const b = el.querySelector('.primary'); if (b) b.focus(); }, 30);
  },
  decide(id) {
    const p = this.p, m = this.meetState(), q = PROPOSALS.find(x => x.id === id);
    m.held.push(id); m.count++; m.next = addDays(todayKey(), 7); m.agenda = null; p.projects = p.projects || {}; p.projects[id] = { date: todayKey(), done: false };
    VILLAGER_DEF.forEach(v => { if (this.stance(q, v.id).s === 'yes') p.friend[v.id] = (p.friend[v.id] || 0) + 1; });
    this.addVit(15); p.stats.meetN = (p.stats.meetN || 0) + 1; this.mt.step = 'done'; this.dirty = true; this.check(); this.refreshProjects(); this.renderMeeting(); this.save();
  },
  camOverride() {
    if (this.modal !== 'meeting' || !PLACED.hall) return false; const H = PLACED.hall;
    const [cx, cz] = toWorld(H, 0.7, 3.9), [tx, tz] = toWorld(H, -0.7, 0.4); camera.position.set(cx, H.y + 2.9, cz); camera.lookAt(tx, H.y - 0.25, tz); return true;
  },
});
// seated pose for meeting attendees (called from updateVillagers)
function seatVillager(n, dt) {
  const s = n.seat; n.x = s.x; n.z = s.z; n.rot = s.rot; n.y = PLACED.hall.y; n.mesh.position.set(n.x, n.y, n.z); n.mesh.rotation.y = n.rot; n.tag.visible = true;
  const P = n.parts; if (!P.thighL) return; n.ph += dt; if (s.stand) { animateBody(P, n.rest, n.ph, 0, dt, { nod: (n.speakT = Math.max(0, (n.speakT || 0) - dt)) > 0 ? n.ph : 0 }); return; }
  P.thighL.rotation.x = P.thighR.rotation.x = -1.45; P.shinL.rotation.x = P.shinR.rotation.x = 1.45;
  P.upperArmL.rotation.x = P.upperArmR.rotation.x = -0.5; P.upperArmL.rotation.z = -0.1; P.upperArmR.rotation.z = 0.1; P.foreArmL.rotation.x = P.foreArmR.rotation.x = -0.6; P.foreArmR.rotation.z = 0;
  P.spine.rotation.set(0, 0, 0); P.pelvis.position.y = n.rest.pelvis.y * (n.sitK || 0.62);
  n.speakT = Math.max(0, (n.speakT || 0) - dt); P.head.rotation.x = n.speakT > 0 ? Math.sin(n.ph * 9) * 0.12 : 0; P.head.rotation.z = Math.sin(n.ph * 0.7 + n.hx) * 0.05;
}
const VOTE_TEX = {};
function makeVoteSprite() {
  if (!VOTE_TEX.yes) for (const [k, col, ch] of [['yes', '#3f8f5a', '○'], ['no', '#d0504a', '×'], ['mid', '#e0a030', '△']]) { const [c, x] = cvs(128, 128); x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.strokeStyle = col; x.lineWidth = 10; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke(); x.fillStyle = col; x.font = '900 78px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 64, 70); VOTE_TEX[k] = toTex(c, false); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: VOTE_TEX.yes, depthTest: false, fog: false })); s.scale.set(0.38, 0.38, 1); s.renderOrder = 30; s.visible = false; return s;
}
// ---------- project geometry ----------
function benchGeo(g, x, y, z, rot) {
  const b = new THREE.Group(), wd = MAT.wood; b.add(box(1.6, 0.06, 0.42, wd, 0, 0.46, 0)); b.add(box(1.6, 0.32, 0.05, wd, 0, 0.75, -0.2)); for (const sx of [-0.7, 0.7]) { b.add(box(0.06, 0.46, 0.4, MAT.darkframe, sx, 0.23, 0)); b.add(box(0.06, 0.5, 0.05, MAT.darkframe, sx, 0.7, -0.21)); }
  b.position.set(x, y, z); b.rotation.y = rot; g.add(b); return b;
}
function landOK(x, z, rd = 4.2) { return groundH(x, z) > 0.7 && waterDepthAt(x, z) <= 0 && roadDistAt(x, z) > rd && deckY(x, z) === null; }
function pcoll(c) { addCollider(c); PROJ.colls.push(c); }
function makeConstruction(at) {
  const g = new THREE.Group(); if (!at) return g; const y = groundH(at.x, at.z), cone = new THREE.MeshStandardMaterial({ color: '#ff7a1a', roughness: 0.6 }), stripe = new THREE.MeshStandardMaterial({ map: (() => { const [c, x] = cvs(128, 32); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#222' : '#f2c21a'; x.beginPath(); x.moveTo(i * 20 - 16, 32); x.lineTo(i * 20, 0); x.lineTo(i * 20 + 16, 0); x.lineTo(i * 20, 32); x.fill(); } return toTex(c, false); })() });
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, x = at.x + Math.cos(a) * 2.2, z = at.z + Math.sin(a) * 2.2; const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 12), cone); c.position.set(x, groundH(x, z) + 0.35, z); c.castShadow = true; g.add(c); }
  const bar = box(2.4, 0.22, 0.06, stripe, at.x, y + 0.75, at.z); g.add(bar); for (const s of [-1.1, 1.1]) g.add(box(0.06, 0.8, 0.06, MAT.darkframe, at.x + s, y + 0.4, at.z));
  const sg = dynSign(1.6, 0.5, '工事中・明日完成', '#f2c21a', '#222'); sg.position.set(at.x, y + 1.35, at.z + 0.04); g.add(sg); const sb = sg.clone(); sb.rotation.y = Math.PI; sb.position.z = at.z - 0.04; g.add(sb);
  return g;
}
const PROJ_BUILD = {
  lamps() { const g = new THREE.Group(), Hb = GAME.LM.harbor, r = ROADS[0], F = roadFrames(r); let acc = 99, n = 0, at = null;
    for (let i = 1; i < F.length && n < 9; i++) { const f = F[i]; acc += Math.hypot(F[i].x - F[i - 1].x, F[i].z - F[i - 1].z); if (Math.hypot(f.x - Hb.x, f.z - Hb.z) > 85 || acc < 13) continue;
      const s = (f.nx * -f.x + f.nz * -f.z) > 0 ? -1 : 1, x = f.x + f.nx * (r.w / 2 + 0.9) * s, z = f.z + f.nz * (r.w / 2 + 0.9) * s; if (groundH(x, z) < 0.3 || (r.bridge && r.bridge[i])) continue; acc = 0; n++;
      const y = groundH(x, z), lp = new THREE.Group(); lp.add(cylM(0.07, 0.1, 4.4, MAT.darkframe, 0, 2.2, 0, 8)); lp.add(box(0.9, 0.07, 0.07, MAT.darkframe, 0.42, 4.3, 0)); const hd = cylM(0.22, 0.32, 0.22, MAT.darkframe, 0.82, 4.2, 0, 10); lp.add(hd); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), MAT.lamp); bulb.position.set(0.82, 4.06, 0); lp.add(bulb);
      lp.position.set(x, y, z); lp.rotation.y = Math.atan2(-f.nx * s, -f.nz * s) - Math.PI / 2; g.add(lp); pcoll({ x, z, r: 0.18, kind: 'pole' }); if (!at) at = { x, z }; }
    return { g, at: at || { x: Hb.x, z: Hb.z } }; },
  flowers() { const g = new THREE.Group(), R = mulberry(515), cx = OPEN.x - 14, cz = OPEN.z - 18, cols = ['#ff6f91', '#ffd84a', '#ffffff', '#b07ae8', '#ff9a3a', '#ff4f5a'];
    const geo = (() => { const st = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4); st.translate(0, 0.2, 0); const hd = new THREE.SphereGeometry(0.11, 7, 5); hd.scale(1, 0.6, 1); hd.translate(0, 0.42, 0); [st, hd].forEach(q => { const c = new Float32Array(q.attributes.position.count * 3); for (let i = 0; i < c.length; i += 3) { const v = q === st ? [0.3, 0.6, 0.25] : [1, 1, 1]; c.set(v, i); } q.setAttribute('color', new THREE.BufferAttribute(c, 3)); }); return mergeGeometries([st.toNonIndexed(), hd.toNonIndexed()]); })();
    const pts = []; for (let k = 0; k < 2600 && pts.length < 1400; k++) { const a = R() * 6.28, rr = Math.sqrt(R()) * 13, x = cx + Math.cos(a) * rr * 1.4, z = cz + Math.sin(a) * rr; if (!landOK(x, z, 3.5)) continue; pts.push([x, z, Math.floor((Math.atan2(z - cz, x - cx) + 3.15) / 6.3 * 6 + Math.floor(rr / 5)) % 6]); }
    const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }), pts.length), m4 = new THREE.Matrix4(), col = new THREE.Color();
    pts.forEach(([x, z, ci], i) => { const s = 0.8 + R() * 0.5; m4.makeScale(s, s, s); m4.setPosition(x, groundH(x, z), z); im.setMatrixAt(i, m4); im.setColorAt(i, col.set(cols[ci])); }); im.castShadow = false; im.receiveShadow = true; g.add(im);
    return { g, at: { x: cx, z: cz } }; },
  benchBeach() { const g = new THREE.Group(), L = GAME.LM.beach; let best = null;
    for (let a = 0; a < 6.28; a += 0.2) for (let r = 4; r < 30; r += 2) { const x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r, h = groundH(x, z); if (h < 0.9 || h > 5 || !landOK(x, z, 4.5)) continue; let lo = 0, dir = 0; for (let b = 0; b < 6.28; b += 0.3) { const hh = groundH(x + Math.cos(b) * 14, z + Math.sin(b) * 14); if (hh < lo) { lo = hh; dir = b; } } if (lo < -0.5 && (!best || h < best.h)) best = { x, z, h, dir }; }
    if (!best) best = { x: L.x, z: L.z, dir: Math.PI, h: groundH(L.x, L.z) };
    const fx = Math.cos(best.dir), fz = Math.sin(best.dir), rot = Math.atan2(fx, fz);
    for (const k of [-1, 0, 1]) { const x = best.x - fz * k * 2.6, z = best.z + fx * k * 2.6; benchGeo(g, x, groundH(x, z), z, rot); pcoll({ x, z, hw: 0.8, hd: 0.25, rot }); }
    return { g, at: { x: best.x, z: best.z } }; },
  market() { const g = new THREE.Group(), Hb = GAME.LM.harbor; let best = null;
    for (let a = 0; a < 6.28; a += 0.25) for (let r = 8; r < 40; r += 2) { const x = Hb.x + Math.cos(a) * r, z = Hb.z + Math.sin(a) * r; if (!landOK(x, z, 6.5)) continue; let ok = true; for (const [dx, dz] of [[-5, 0], [5, 0], [0, -3], [0, 3]]) if (!landOK(x + dx, z + dz, 5) || Math.abs(groundH(x + dx, z + dz) - groundH(x, z)) > 1.2) ok = false; if (!ok) continue; if (collidersNear(x, z).some(c => !c.off && (c.kind === 'bld' || c.kind === 'pole') && hitsCollider(c, x, z, 4))) continue; const sc = r; if (!best || sc < best.sc) best = { x, z, sc }; }
    if (!best) best = { x: Hb.x + 10, z: Hb.z - 10 };
    let nr = nearestOnRoads(best.x, best.z, 60, false), rot = nr ? Math.atan2(nr.x - best.x, nr.z - best.z) : 0; const tx = Math.cos(rot), tz = -Math.sin(rot);
    const aw = ['#e8504a', '#3f8fd0', '#3f9a5a'], goods = [['#ff9a2a', 0.13], ['#6aa8d8', 0.1], ['#ffd84a', 0.12]];
    [-1, 0, 1].forEach((k, i) => { const x = best.x + tx * k * 3.4, z = best.z + tz * k * 3.4, y = groundH(x, z), s = new THREE.Group();
      const stripeM = new THREE.MeshStandardMaterial({ map: (() => { const [c, xx] = cvs(128, 32); for (let j = 0; j < 8; j++) { xx.fillStyle = j % 2 ? '#ffffff' : aw[i]; xx.fillRect(j * 16, 0, 16, 32); } return toTex(c, false); })(), roughness: 0.7, side: THREE.DoubleSide });
      for (const [a, b] of [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]]) s.add(cylM(0.05, 0.05, 2.3, MAT.wood, a, 1.15, b, 6));
      const roof = box(3.0, 0.06, 2.0, stripeM, 0, 2.35, 0); roof.rotation.x = -0.18; s.add(roof); s.add(box(2.6, 0.85, 0.7, MAT.wood, 0, 0.43, 0.55));
      for (let q = 0; q < 10; q++) { const ball = new THREE.Mesh(new THREE.SphereGeometry(goods[i][1], 8, 6), new THREE.MeshStandardMaterial({ color: goods[i][0], roughness: 0.6 })); ball.position.set(-1.0 + q * 0.22, 0.95, 0.5 + (q % 2) * 0.15); if (i === 1) ball.scale.set(1.8, 0.6, 0.8); s.add(ball); }
      s.position.set(x, y, z); s.rotation.y = rot; g.add(s); pcoll({ x, z, hw: 1.4, hd: 0.9, rot }); });
    return { g, at: { x: best.x, z: best.z } }; },
  park() { const g = new THREE.Group(), R = mulberry(77); let best = null;
    for (let k = 0; k < 400; k++) { const a = R() * 6.28, r = R() * 34, x = OPEN.x + 10 + Math.cos(a) * r, z = OPEN.z + Math.sin(a) * r; let ok = true; for (let b = 0; b < 6.28; b += 0.7) if (!landOK(x + Math.cos(b) * 8, z + Math.sin(b) * 8, 4)) ok = false; if (!landOK(x, z, 9) || !ok) continue; const sc = Math.abs(r - 14); if (!best || sc < best.sc) best = { x, z, sc }; }
    if (!best) best = { x: OPEN.x, z: OPEN.z };
    const N = 28, pos = [], idx = [], uv = []; pos.push(best.x, groundH(best.x, best.z) + 0.06, best.z); uv.push(0.5, 0.5);
    for (let ring = 1; ring <= 3; ring++) for (let i = 0; i < N; i++) { const a = i / N * 6.283, rr = ring * 2.4, x = best.x + Math.cos(a) * rr, z = best.z + Math.sin(a) * rr; pos.push(x, groundH(x, z) + 0.06, z); uv.push(x * 0.4, z * 0.4); }
    for (let i = 0; i < N; i++) idx.push(0, 1 + (i + 1) % N, 1 + i); for (let ring = 1; ring < 3; ring++) for (let i = 0; i < N; i++) { const a = 1 + (ring - 1) * N + i, b = 1 + (ring - 1) * N + (i + 1) % N, c = a + N, d = b + N; idx.push(a, b, c, b, d, c); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); pg.setIndex(idx); pg.computeVertexNormals();
    const pm = new THREE.Mesh(pg, worldMat(TEX.concrete, 0.35, '#e6dccb', 0.95, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })); pm.receiveShadow = true; g.add(pm);
    const y0 = groundH(best.x, best.z), clk = new THREE.Group(); clk.add(cylM(0.09, 0.12, 3.4, MAT.darkframe, 0, 1.7, 0, 10)); const face = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 24), MAT.white); face.rotation.x = Math.PI / 2; face.position.y = 3.5; clk.add(face);
    const ft = new THREE.Mesh(new THREE.CircleGeometry(0.38, 24), new THREE.MeshStandardMaterial({ map: (() => { const [c, x] = cvs(128, 128); x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#222'; x.lineWidth = 6; for (let h = 0; h < 12; h++) { const a = h / 12 * 6.283; x.beginPath(); x.moveTo(64 + Math.sin(a) * 50, 64 - Math.cos(a) * 50); x.lineTo(64 + Math.sin(a) * 58, 64 - Math.cos(a) * 58); x.stroke(); } x.lineWidth = 7; x.beginPath(); x.moveTo(64, 64); x.lineTo(64, 26); x.stroke(); x.beginPath(); x.moveTo(64, 64); x.lineTo(94, 72); x.stroke(); return toTex(c, false); })() }));
    for (const s of [1, -1]) { const f2 = ft.clone(); f2.position.set(0, 3.5, s * 0.075); f2.rotation.y = s > 0 ? 0 : Math.PI; clk.add(f2); }
    clk.position.set(best.x, y0, best.z); g.add(clk); pcoll({ x: best.x, z: best.z, r: 0.15, kind: 'pole' });
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.785, x = best.x + Math.cos(a) * 6.2, z = best.z + Math.sin(a) * 6.2, rot = Math.atan2(best.x - x, best.z - z); benchGeo(g, x, groundH(x, z), z, rot); pcoll({ x, z, hw: 0.8, hd: 0.25, rot }); }
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, x = best.x + Math.cos(a) * 7.6, z = best.z + Math.sin(a) * 7.6; const pl = box(1.4, 0.4, 0.5, MAT.wood, x, groundH(x, z) + 0.2, z, a); g.add(pl); for (let q = 0; q < 5; q++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), MAT.flowers[(q + k) % 5]); fl.position.set(x + Math.sin(a) * (-0.5 + q * 0.25), groundH(x, z) + 0.5, z + Math.cos(a) * (-0.5 + q * 0.25)); g.add(fl); } }
    return { g, at: { x: best.x, z: best.z } }; },
  signs() { const g = new THREE.Group(); let at = null;
    for (const id of MEISHO) { const L = GAME.LM[id]; let p = null; for (let r = 3; r < 26 && !p; r += 1.5) for (let a = 0; a < 6.28 && !p; a += 0.5) { const x = L.x + Math.cos(a) * r, z = L.z + Math.sin(a) * r; if (landOK(x, z, 3.2) && !collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, 1.2))) p = { x, z }; }
      if (!p) continue; const y = groundH(p.x, p.z), s = new THREE.Group(), rot = Math.atan2(L.x - p.x, L.z - p.z) + Math.PI; s.add(box(0.12, 1.6, 0.12, MAT.darkwood, -0.7, 0.8, 0)); s.add(box(0.12, 1.6, 0.12, MAT.darkwood, 0.7, 0.8, 0)); s.add(box(1.7, 0.6, 0.08, MAT.wood, 0, 1.35, 0));
      const t = dynSign(1.6, 0.5, LM_NAMES[id].replace('見晴らしの丘のてっぺん', '見晴らしの丘'), '#f6ecd6', '#4a3020'); t.userData.keep = false; t.position.set(0, 1.35, 0.05); s.add(t); const t2 = t.clone(); t2.rotation.y = Math.PI; t2.position.z = -0.05; s.add(t2);
      s.position.set(p.x, y, p.z); s.rotation.y = rot; g.add(s); pcoll({ x: p.x, z: p.z, hw: 0.85, hd: 0.12, rot }); if (!at) at = p; }
    return { g, at: at || { x: 0, z: 0 } }; },
  busstop() { const g = new THREE.Group(), r = ROADS[0], F = roadFrames(r), ref = PLACED.home ? PLACED.home.pad : { x: VILLAGE.x, z: VILLAGE.z }; let best = null;
    for (let i = 2; i < F.length - 2; i++) { const f = F[i]; if (r.bridge && r.bridge[i]) continue; for (const s of [-1, 1]) { const x = f.x + f.nx * (r.w / 2 + 1.6) * s, z = f.z + f.nz * (r.w / 2 + 1.6) * s; if (groundH(x, z) < 0.6 || waterDepthAt(x, z) > 0) continue; if (collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, 2.2))) continue; const d = Math.hypot(x - ref.x, z - ref.z); if (d < 14) continue; if (!best || d < best.d) best = { x, z, d, rot: Math.atan2(-f.nx * s, -f.nz * s) }; } }
    if (!best) return { g, at: ref };
    const y = groundH(best.x, best.z), s = new THREE.Group(), roofM = new THREE.MeshStandardMaterial({ color: '#3f7fb8', roughness: 0.5 });
    s.add(box(3.2, 0.1, 1.6, roofM, 0, 2.5, -0.1)); for (const a of [-1.4, 1.4]) s.add(box(0.08, 2.5, 0.08, MAT.metal, a, 1.25, -0.7)); s.add(box(3.0, 1.6, 0.05, new THREE.MeshStandardMaterial({ color: '#cfe0e6', transparent: true, opacity: 0.4, roughness: 0.1 }), 0, 1.4, -0.75));
    benchGeo(s, 0, 0, -0.35, 0); s.add(cylM(0.05, 0.05, 2.4, MAT.metal, 1.9, 1.2, 0.3, 6)); const pl = dynSign(0.7, 0.7, '🚌 バス停', '#ffffff', '#1f4fa8', 'M PLUS Rounded 1c'); pl.userData.keep = false; pl.position.set(1.9, 2.3, 0.34); s.add(pl);
    const nm = dynSign(2.4, 0.36, `${GAME.p ? GAME.p.island : 'ほしなみ'}島 港前`, '#ffffff', '#22323a', 'M PLUS Rounded 1c'); nm.userData.keep = false; nm.position.set(0, 2.2, 0.73); s.add(nm);
    s.position.set(best.x, y, best.z); s.rotation.y = best.rot; g.add(s); pcoll({ x: best.x, z: best.z, hw: 1.6, hd: 0.5, rot: best.rot });
    return { g, at: { x: best.x, z: best.z } }; },
  lightup() { const g = new THREE.Group(), C = PLACED.church; if (!C) return { g, at: { x: 0, z: 0 } };
    for (const [lx, lz] of [[-6, 9], [6, 9], [-6, -10], [6, -10]]) { const [x, z] = toWorld(C, lx, lz), y = C.y; const fl = new THREE.Group(); fl.add(box(0.4, 0.3, 0.3, MAT.darkframe, 0, 0.2, 0)); const lens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), MAT.lamp); lens.position.set(0, 0.25, 0.16); fl.add(lens);
      const bg = new THREE.ConeGeometry(2.6, 13, 20, 1, true); bg.translate(0, -6.5, 0); const beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: '#ffe2a8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      const dir = new THREE.Vector3(C.x - x, 9, C.z - z).normalize(); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); beam.position.set(x, y + 0.25, z); g.add(beam); PROJ.beams.push(beam.material);
      fl.position.set(x, y, z); fl.lookAt(C.x, y, C.z); g.add(fl); }
    return { g, at: { x: C.x, z: C.z } }; },
  deck() { const L0 = GAME.LM.peak; if (VEG.removeAt(L0.x, L0.z, 7)) VEG.refresh(L0.x - 8, L0.z - 8, L0.x + 8, L0.z + 8);
    const g = new THREE.Group(), L = GAME.LM.peak, y = groundH(L.x, L.z) + 0.35, wd = worldMat(TEX.wood, 0.6, '#b98a5a', 0.75);
    g.add(box(6, 0.15, 6, wd, L.x, y, L.z)); for (const a of [-2.8, 2.8]) for (const b of [-2.8, 2.8]) { g.add(box(0.2, 1.4, 0.2, MAT.darkwood, L.x + a, y - 0.75, L.z + b)); g.add(box(0.1, 1.0, 0.1, MAT.darkwood, L.x + a, y + 0.55, L.z + b)); }
    for (const [a, b, w, d] of [[0, -2.95, 6, 0.08], [0, 2.95, 6, 0.08], [-2.95, 0, 0.08, 6], [2.95, 0, 0.08, 6]]) g.add(box(w, 0.08, d, MAT.darkwood, L.x + a, y + 1.0, L.z + b));
    const tel = new THREE.Group(); tel.add(cylM(0.04, 0.06, 1.1, MAT.metal, 0, 0.55, 0, 8)); const tb = cylM(0.09, 0.12, 0.7, MAT.darkframe, 0, 1.15, 0, 12); tb.rotation.x = 1.2; tel.add(tb); tel.position.set(L.x + 1.6, y, L.z + 1.6); g.add(tel);
    benchGeo(g, L.x - 1.5, y, L.z - 1.6, 0); PROJ.deck = { x: L.x, z: L.z, y: y + 0.08, hw: 3 };
    for (const a of [-2.8, 2.8]) for (const b of [-2.8, 2.8]) pcoll({ x: L.x + a, z: L.z + b, r: 0.15, kind: 'pole' });
    return { g, at: { x: L.x, z: L.z } }; },
  mikanStand() { const g = new THREE.Group(), nr = nearestOnRoads(MIKAN.x, MIKAN.z, 120, false); if (!nr) return { g, at: { x: MIKAN.x, z: MIKAN.z } };
    const dx = MIKAN.x - nr.x, dz = MIKAN.z - nr.z, L = Math.hypot(dx, dz) || 1, x = nr.x + dx / L * (nr.road.w / 2 + 2.2), z = nr.z + dz / L * (nr.road.w / 2 + 2.2), y = groundH(x, z), rot = Math.atan2(-dx, -dz);
    const s = new THREE.Group(); for (const a of [-0.9, 0.9]) for (const b of [-0.5, 0.5]) s.add(box(0.08, 1.9, 0.08, MAT.darkwood, a, 0.95, b)); s.add(box(2.1, 0.06, 1.4, MAT.kawara, 0, 1.95, 0)); s.add(box(1.9, 0.08, 0.9, MAT.wood, 0, 0.85, 0)); s.add(box(1.9, 0.08, 0.9, MAT.wood, 0, 0.35, 0));
    for (let q = 0; q < 12; q++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: '#ff9a1a', roughness: 0.6 })); m.position.set(-0.7 + (q % 6) * 0.28, 0.98, -0.15 + Math.floor(q / 6) * 0.25); s.add(m); }
    const sg = dynSign(0.9, 0.3, 'みかん 100円', '#fff8e6', '#c05a10', 'M PLUS Rounded 1c'); sg.userData.keep = false; sg.position.set(0, 1.55, 0.52); s.add(sg);
    s.position.set(x, y, z); s.rotation.y = rot; g.add(s); pcoll({ x, z, hw: 1.0, hd: 0.55, rot });
    return { g, at: { x, z } }; },
};
