// ===================== VILLAGERS =====================
const VILLAGER_DEF = [
  { id: 'v_mio', name: 'ミオ', hello: 'はじめまして、{P}さん！ わたしはミオ。海と灯台が大好きなんだ。', thanks: 'ありがとう、{P}さん！ たのんでよかった〜！', lines: ['こんにちは！ きょうも海がキラキラしてるね。', '港の赤い灯台、夕方に見るとすっごくきれいなんだよ。', '{I}島の海って、ほんとに色がきれいだよね。', 'みかん畑のみかん、もうすぐ食べごろかな？'] },
  { id: 'v_sora', name: 'ソラ', hello: 'おっ、{P}か！ オレはソラ。島のことならなんでも聞いてくれよな！', thanks: 'さっすが{P}！ たよりになるぜ！', lines: ['よっ！ 軽トラ運転した？ 海ぞいの道、最高だぜ。', '防波堤で釣りするのが好きなんだ。', '岬の灯台まで競争しようぜ！', '新しい道ができたら、一番に走らせてくれよ！'] },
  { id: 'v_hana', name: 'ハナ', hello: 'あら、{P}さん。ハナです。お花を育てるのが好きなの。よろしくね。', thanks: 'まあ、ありがとう。{P}さんはやさしいのね。', lines: ['あら、いらっしゃい。お花、見ていってね。', '白い小さな花、いっぱい咲いてるでしょう？', '雨の日の島も、しっとりしてすてきなのよ。', '木がふえると、{I}島がもっとやさしい色になるわね。'] },
  { id: 'v_gen', name: 'ゲンじい', hello: 'おお、おまえさんが{P}か。わしはゲン。この島で一番長く漁師をやっとる。', thanks: 'うむ、ようやってくれた。{P}は島の宝じゃ。', lines: ['おお、{P}。島の暮らしにはもう慣れたかの？', 'わしは毎朝、漁船で沖に出とるんじゃ。', '夜の灯台の光はの、船の道しるべなんじゃよ。', '昔はの、{I}島にもっと人がおったんじゃ。'] },
  { id: 'v_rin', name: 'リン', hello: '{P}さん、こんにちは！ リンです。{I}島をにぎやかにしたいって、ずっと思ってたの。', thanks: 'ありがとう！ {I}島、どんどん元気になってるね！', lines: ['あ、こんにちは！ 丘のふもとの神社、行った？', '夜になると窓が光って、もっときれいなの。', '{I}島のこと、いつかみんなに自慢したいな。', '{P}さんがいると、島のみんなが明るくなるね。'] },
  { id: 'v_kai', name: 'カイ', hello: 'いらっしゃいませ〜！ …あ、{P}さんか！ カイだよ、お店の手伝いしてるんだ。', thanks: 'やった〜！ ありがとう、{P}さん！', lines: ['いらっしゃいませ〜！ …あ、お店はあっちだよ。', 'お店の自販機、つめたい飲み物あるよ。', '夕焼けの時間、空がピンク色になるの好き！', '{P}さん、今日はなにするの？'] },
];
const NPCS = [];
function makeNameTag(text) {
  const [c, x] = cvs(256, 64); x.fillStyle = 'rgba(255,255,255,0.92)'; const r = 26; x.beginPath(); x.roundRect(8, 6, 240, 52, r); x.fill();
  x.fillStyle = '#2b3a42'; x.font = '800 32px "M PLUS Rounded 1c", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 34);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: toTex(c, false), transparent: true, depthWrite: false, fog: false })); sp.scale.set(0.9, 0.225, 1); sp.renderOrder = 20; return sp;
}
function spawnVillagers(scene) {
  const R = mulberry(4242); const homes = PLACED.houses.filter(h => !h.home).slice(0, 18);
  VILLAGER_DEF.forEach((d, i) => {
    const m = MODELS[d.id]; if (!m) return;
    const h = homes[(i * 3 + 1) % homes.length];
    const x = h.x + Math.sin(h.rot) * (h.d / 2 + 4.6) + (R() - 0.5) * 2, z = h.z + Math.cos(h.rot) * (h.d / 2 + 4.6) + (R() - 0.5) * 2;
    spawnOneVillager(scene, d, x, z, d.name, R() * 6.28);
  });
}
function spawnOneVillager(scene, d, x, z, label, rot = 0) {
  const m = MODELS[d.id]; if (!m) return null;
  const tag = makeNameTag(label); tag.position.y = 1.5; m.add(tag);
  const npc = { def: d, mesh: m, tag, x, z, y: standY(x, z), rot, hx: x, hz: z, state: 'idle', timer: 1 + Math.random() * 3, tx: x, tz: z, ph: Math.random() * 6, speed: 0, talk: 0, line: 0,
    parts: partsOf(m, ['pelvis', 'spine', 'head', 'thighL', 'thighR', 'shinL', 'shinR', 'upperArmL', 'upperArmR', 'foreArmL', 'foreArmR']) };
  npc.rest = {}; for (const [k, o] of Object.entries(npc.parts)) if (o) npc.rest[k] = o.position.clone();
  scene.add(m); NPCS.push(npc); return npc;
}
function removeVillager(n) { const i = NPCS.indexOf(n); if (i >= 0) NPCS.splice(i, 1); scene.remove(n.mesh); if (n.tag) n.mesh.remove(n.tag); if (n.vote) { n.mesh.remove(n.vote); n.vote = null; } }
function animateBody(P, rest, ph, spd, dt, extra = {}) {
  if (!P.thighL) return;
  const run = spd > 3.6, amp = Math.min(1, spd / 2.0) * (run ? 0.9 : 0.6);
  const s = Math.sin(ph), c = Math.cos(ph);
  P.thighL.rotation.x = s * amp; P.thighR.rotation.x = -s * amp;
  P.shinL.rotation.x = Math.max(0, -c) * amp * 1.4 + (run ? 0.2 : 0.02); P.shinR.rotation.x = Math.max(0, c) * amp * 1.4 + (run ? 0.2 : 0.02);
  P.upperArmL.rotation.x = -s * amp * 1.0; P.upperArmR.rotation.x = s * amp * 1.0; P.upperArmL.rotation.z = -0.12 - (spd < 0.1 ? Math.sin(ph * 0.5) * 0.03 : 0); P.upperArmR.rotation.z = 0.12;
  P.foreArmL.rotation.x = -0.2 - (run ? 0.9 : 0.15); P.foreArmR.rotation.x = -0.2 - (run ? 0.9 : 0.15);
  P.spine.rotation.x = run ? -0.14 : 0; P.spine.rotation.y = s * amp * 0.15;
  P.pelvis.position.y = rest.pelvis.y + (spd > 0.1 ? Math.abs(c) * 0.04 * amp : Math.sin(ph * 0.5) * 0.006);
  P.head.rotation.x = extra.nod ? Math.sin(extra.nod * 8) * 0.12 : 0; P.head.rotation.z = spd < 0.1 ? Math.sin(ph * 0.35) * 0.05 : 0;
  if (extra.wave) { P.upperArmR.rotation.z = 2.5; P.upperArmR.rotation.x = 0; P.foreArmR.rotation.z = Math.sin(extra.wave * 10) * 0.4; } else if (P.foreArmR) P.foreArmR.rotation.z = 0;
}
function updateVillagers(dt, talking) {
  for (const n of NPCS) {
    if (n.inRoom) continue;
    if ((n.seat || n.crowd) && n.live) { if (n.asleep) { n.asleep = false; n.mesh.visible = true; } n.place = null; if (n.props) for (const q of Object.values(n.props)) q.visible = false; outfit(n); }
    if (n.seat) { seatVillager(n, dt); continue; }
    if (n.crowd && typeof crowdVillager === 'function' && !(talking === n)) { crowdVillager(n, dt); continue; }
    if (typeof liveVillager === 'function' && GAME.p && !n.visitor && talking !== n) { liveVillager(n, dt); continue; }
    const dP = Math.hypot(PL.x - n.x, PL.z - n.z); n.tag.visible = dP < 9;
    let spd = 0;
    if (talking === n || (dP < 2.4 && !PL.veh)) { n.rot = angLerp(n.rot, Math.atan2(PL.x - n.x, PL.z - n.z), Math.min(1, dt * 6)); n.state = 'idle'; n.timer = 2; if (dP < 2.4 && !n.greeted) { n.greeted = 1.2; } }
    else if (n.state === 'idle') {
      n.timer -= dt; if (n.timer <= 0) {
        for (let k = 0; k < 8; k++) { const a = Math.random() * 6.28, r = 3 + Math.random() * 16, tx = n.hx + Math.cos(a) * r, tz = n.hz + Math.sin(a) * r; if (groundH(tx, tz) > 1.5 && canWalk(n.x, n.z, n.x + (tx - n.x) * 0.1, n.z + (tz - n.z) * 0.1)) { n.tx = tx; n.tz = tz; n.state = 'walk'; n.timer = 14; break; } }
        if (n.state === 'idle') n.timer = 2 + Math.random() * 4;
      }
    } else {
      const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz); n.timer -= dt;
      if (d < 0.4 || n.timer < 0) { n.state = 'idle'; n.timer = 3 + Math.random() * 6; }
      else {
        n.rot = angLerp(n.rot, Math.atan2(dx, dz), Math.min(1, dt * 5)); spd = 1.5;
        let nx = n.x + Math.sin(n.rot) * spd * dt, nz = n.z + Math.cos(n.rot) * spd * dt; [nx, nz] = pushOut(nx, nz, 0.3);
        if (Math.hypot(PL.x - nx, PL.z - nz) < 0.7) spd = 0; else if (canWalk(n.x, n.z, nx, nz)) { n.x = nx; n.z = nz; } else { n.state = 'idle'; n.timer = 1; spd = 0; }
      }
    }
    if (n.greeted > 0) n.greeted -= dt;
    n.ph += dt * (spd > 0.1 ? 8.5 : 1.8); { const ty = standY(n.x, n.z); n.y = ty > n.y ? ty : lerp(n.y, ty, Math.min(1, dt * 12)); }
    n.mesh.position.set(n.x, n.y, n.z); n.mesh.rotation.y = n.rot;
    animateBody(n.parts, n.rest, n.ph, spd, dt, { wave: n.greeted > 0 && !talking ? n.greeted : 0, nod: talking === n ? performance.now() / 1000 : 0 });
  }
}
function nearVillager() { let best = null, bd = 2.6; const fx = Math.sin(PL.rot), fz = Math.cos(PL.rot); for (const n of NPCS) { const dx = n.x - PL.x, dz = n.z - PL.z, d = Math.hypot(dx, dz); if (d < bd && (d < 1.2 || (dx * fx + dz * fz) / d > -0.2)) { bd = d; best = n; } } return best; }
const DIALOG = { npc: null, i: 0 };
function startTalk(n) {
  const p = GAME.p, id = n.def.id, F = t => GAME.fill(t);
  const np = GAME.newcomerPages(n); if (np && n.visitor) { DIALOG.npc = n; DIALOG.pages = np; DIALOG.i = 0; UI.dialog(n.def.name, np[0]); return; }
  const pages = np || [];
  if (p && !p.talked[id]) pages.push(F(n.def.hello));
  if (p && id === 'v_gen' && !(p.items && p.items.rod)) { pages.push(F('そうじゃ、{P}。これをやろう。わしのお古の釣りざおじゃ。'), '海や川、池のほうを向いて F キーを押すと釣りができるぞ。ウキがしずんだら、すぐに F か Space じゃ！'); p.items = p.items || {}; p.items.rod = true; setTimeout(() => UI.toast('🎣 釣りざおをもらった！（F キーで釣り）'), 400); GAME.dirty = true; }
  if (p) pages.push(...GAME.milestonePages(n));
  const req = GAME.todays().find(m => m.who === id);
  if (req && p && !p.daily.done[req.id]) pages.push(F(req.ask) + '\n（今日のおねがい：' + req.text + '）');
  else if (req && p && !p.thanked[id]) { pages.push(F(n.def.thanks)); p.thanked[id] = 1; }
  if (!pages.length) { const ex = GAME.extraLine && GAME.extraLine(n); if (ex) pages.push(F(ex)); else { n.line = (n.line + 1) % n.def.lines.length; pages.push(F(n.def.lines[n.line])); } }
  DIALOG.npc = n; DIALOG.pages = pages; DIALOG.i = 0; DIALOG.choices = p && GAME.canGift(n) ? [{ t: '🎁 プレゼントする', f: () => { DIALOG.npc = null; UI.dialog(null); GAME.openGift(n); } }, { t: 'じゃあね', f: () => { DIALOG.npc = null; UI.dialog(null); } }] : null; DIALOG.chose = false; UI.dialog(n.def.name, pages[0]);
  GAME.ev('talk', 1, id);
}
function advanceTalk() {
  if (!DIALOG.npc) return false;
  if (UI.typing && UI._full) { UI._full(); return true; }
  if (DIALOG.pages && DIALOG.i < DIALOG.pages.length - 1) { DIALOG.i++; UI.dialog(DIALOG.npc.def.name, DIALOG.pages[DIALOG.i]); return true; }
  if (DIALOG.choices && !DIALOG.chose) { DIALOG.chose = true; UI.choices(DIALOG.choices); return true; }
  DIALOG.npc = null; DIALOG.choices = null; UI.dialog(null); return true;
}
