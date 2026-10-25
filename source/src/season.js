// ===================== SEASONS, WEATHER, MOON, ISLAND EVENTS =====================
const SEASON = { override: null, doy: -1, key: '', snow: 0, built: '', group: null, active: [], u: { grass: { value: new THREE.Color(1, 1, 1) }, snow: { value: 0 } }, f: {}, t: 0, anim: [], glow: [], spots: [], plaza: null, roofBase: null, crowdOn: '' };
try { const o = localStorage.getItem('hoshinami2-season'); if (o) SEASON.override = o; } catch (e) { }

function seasonDate() { const d = new Date(); if (SEASON.override) { const [m, dd] = SEASON.override.split('-').map(Number); d.setMonth(m - 1, dd); } return d; }
function doyOf(m, d) { return Math.round((Date.UTC(2001, m - 1, d) - Date.UTC(2001, 0, 1)) / 864e5); }
const md = doyOf;
function inDoy(x, a, b) { return a <= b ? x >= a && x <= b : x >= a || x <= b; }
function rampDoy(x, a, b, c, d) { const sh = v => (v - a + 365) % 365, X = sh(x), B = sh(b), C = sh(c), D = sh(d); if (X <= B) return B ? X / B : 1; if (X <= C) return 1; if (X <= D) return 1 - (X - C) / Math.max(1, D - C); return 0; }
const SEASON_NAME = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
function seasonKey(doy) { return doy >= md(3, 1) && doy < md(6, 1) ? 'spring' : doy >= md(6, 1) && doy < md(9, 1) ? 'summer' : doy >= md(9, 1) && doy < md(12, 1) ? 'autumn' : 'winter'; }
// ---------- palette keyframes (multipliers on the existing green materials) ----------
const PAL = [
  { d: md(1, 15), grass: [1.45, 0.72, 0.95], tuft: '#f6d48c', broad: [[0.8, 0.92, 0.8], [1, 1, 1], [0.85, 0.92, 0.8], [1, 1, 1]], bush: [0.9, 0.9, 0.78], pine: [0.85, 0.9, 0.85] },
  { d: md(3, 20), grass: [1.18, 0.9, 0.82], tuft: '#e8e4a0', broad: [[0.95, 1.05, 0.85], [1.1, 1.15, 0.8], [0.95, 1.05, 0.85], [1.1, 1.15, 0.8]], bush: [0.98, 1.04, 0.84], pine: [0.92, 0.96, 0.9] },
  { d: md(4, 25), grass: [0.98, 1.08, 0.85], tuft: '#c8f4a0', broad: [[1.08, 1.18, 0.85], [1.12, 1.2, 0.82], [1.02, 1.12, 0.88], [1.1, 1.2, 0.85]], bush: [1.05, 1.12, 0.88], pine: [1, 1, 1] },
  { d: md(7, 20), grass: [0.92, 1.0, 0.86], tuft: '#d8f0a8', broad: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]], bush: [1, 1, 1], pine: [1, 1, 1] },
  { d: md(9, 10), grass: [1.0, 0.98, 0.8], tuft: '#e4eca0', broad: [[1.05, 1.0, 0.85], [1.1, 1.05, 0.8], [1, 1, 0.9], [1.08, 1.0, 0.82]], bush: [1.02, 1, 0.88], pine: [1, 1, 1] },
  { d: md(10, 20), grass: [1.2, 0.92, 0.72], tuft: '#f6dc90', broad: [[1.06, 1.0, 0.84], [1.1, 1.04, 0.8], [1, 1, 0.86], [1.08, 1.0, 0.82]], bush: [1.2, 0.95, 0.6], pine: [0.95, 0.98, 0.92] },
  { d: md(11, 18), grass: [1.45, 0.82, 0.72], tuft: '#ffd080', broad: [[1.1, 0.95, 0.78], [1.12, 1.0, 0.75], [0.95, 0.95, 0.82], [1.1, 0.95, 0.76]], bush: [1.5, 0.8, 0.45], pine: [0.9, 0.95, 0.88] },
  { d: md(12, 10), grass: [1.45, 0.75, 0.9], tuft: '#f6d48c', broad: [[1.05, 0.9, 0.75], [1.05, 0.95, 0.75], [0.85, 0.92, 0.8], [1.05, 0.9, 0.74]], bush: [1.1, 0.85, 0.6], pine: [0.86, 0.9, 0.85] },
];
function palAt(doy) {
  let a = PAL[PAL.length - 1], b = PAL[0];
  for (let i = 0; i < PAL.length; i++) { const n = PAL[(i + 1) % PAL.length]; const s = PAL[i].d, e = n.d <= s ? n.d + 365 : n.d, x = doy < s ? doy + 365 : doy; if (x >= s && x < e) { a = PAL[i]; b = n; break; } }
  const s = a.d, e = b.d <= s ? b.d + 365 : b.d, x = doy < s ? doy + 365 : doy, t = Math.max(0, Math.min(1, (x - s) / (e - s)));
  const L = (p, q) => p.map((v, i) => v + (q[i] - v) * t), C = (p, q) => '#' + new THREE.Color(p).lerp(new THREE.Color(q), t).getHexString();
  return { grass: L(a.grass, b.grass), tuft: C(a.tuft, b.tuft), broad: a.broad.map((v, i) => L(v, b.broad[i])), bush: L(a.bush, b.bush), pine: L(a.pine, b.pine) };
}
const SNOWY = [2.2, 1.35, 3.9], SAKURA = [2.3, 1.0, 3.6];
SEASON.apply = function () {
  const d = seasonDate(), doy = md(d.getMonth() + 1, d.getDate()); SEASON.doy = doy; SEASON.key = seasonKey(doy);
  const P = palAt(doy), sn = SEASON.snow, mixS = (c) => c.map((v, i) => v + (SNOWY[i] - v) * sn * 0.55);
  SEASON.u.grass.value.setRGB(...P.grass); SEASON.u.snow.value = sn;
  { const D = [[md(1, 1), 0.52], [md(3, 1), 0.45], [md(4, 10), 0.16], [md(5, 15), 0.06], [md(7, 25), 0.1], [md(8, 25), 0.18], [md(9, 25), 0.22], [md(10, 25), 0.32], [md(11, 25), 0.46], [md(12, 31), 0.52]]; let dv = 0.6; for (let i = 0; i < D.length - 1; i++) if (doy >= D[i][0] && doy <= D[i + 1][0]) { const t = (doy - D[i][0]) / Math.max(1, D[i + 1][0] - D[i][0]); dv = D[i][1] + (D[i + 1][1] - D[i][1]) * t; } (SEASON.u.dry || (SEASON.u.dry = { value: 0 })).value = dv; }
  try { if (typeof KOYO !== 'undefined') KOYO.apply(doy); } catch (e) { console.warn('koyo', e); }
  const bare = inDoy(doy, md(12, 8), md(3, 15)), sak = rampDoy(doy, md(3, 22), md(3, 31), md(4, 8), md(4, 16));
  const FM = VEG.fmats || {};
  for (const [k, o] of Object.entries(FM)) {
    const kind = k.replace(/\d+$/, ''), vi = +k.match(/\d+$/)[0]; let t = [1, 1, 1], hide = false;
    if (kind === 'broad') { t = P.broad[vi] || t; if (vi === 3 && sak > 0) t = t.map((v, i) => v + (SAKURA[i] - v) * sak); if ((vi === 1 || vi === 3) && bare) hide = true; }
    else if (kind === 'bush') t = P.bush; else if (kind === 'pine') t = P.pine;
    else if ((kind === 'sakura' || kind === 'momiji') && typeof NATURE !== 'undefined') { const r = NATURE.treeColor(kind, doy); const m = new THREE.Color().setRGB(...mixS([1, 1, 1])); o.fol.color.copy(r.c).multiply(m); o.card.color.copy(r.c).multiply(m); o.fol.visible = o.card.visible = !r.hide; continue; }
    else if (kind === 'bamboo') t = P.pine;
    t = mixS(t); o.fol.color.copy(o.tint).multiply(new THREE.Color().setRGB(...t)); o.card.color.copy(o.cardBase).multiply(new THREE.Color().setRGB(...t)); o.fol.visible = o.card.visible = !hide;
  }
  if (VEG.tuftMat) VEG.tuftMat.color.set(P.tuft).lerp(new THREE.Color('#ffffff'), sn * 0.7);
  const flowersOn = inDoy(doy, md(3, 5), md(11, 10)) && sn < 0.4, aut = rampDoy(doy, md(8, 25), md(9, 15), md(11, 10), md(11, 11));
  for (const m of [VEG.fwMat, VEG.fyMat]) if (m) { m.visible = flowersOn; m.color.setRGB(1, 1, 1).lerp(m === VEG.fwMat ? new THREE.Color(1, 0.72, 0.9) : new THREE.Color(1, 0.75, 0.55), aut); }
  // roofs dusted with snow
  if (!SEASON.roofBase && typeof AM !== 'undefined' && AM.ok) { SEASON.roofBase = []; for (const m of [MAT.kawara, MAT.kawaraRed, ...MAT.metalRoof, ...AM.shingle]) SEASON.roofBase.push([m, m.color.clone()]); }
  if (SEASON.roofBase) for (const [m, c] of SEASON.roofBase) m.color.copy(c).lerp(new THREE.Color(1, 1, 1.03).multiplyScalar(m === MAT.kawara ? 2.6 : m === MAT.kawaraRed ? 2.0 : 1.5), sn * 0.75);
  // what the soundscape should do this time of year
  SEASON.f = { cicada: rampDoy(doy, md(7, 8), md(7, 20), md(9, 5), md(9, 20)), higu: rampDoy(doy, md(7, 12), md(7, 25), md(9, 5), md(9, 15)), tsuku: rampDoy(doy, md(8, 5), md(8, 15), md(9, 15), md(9, 30)),
    insects: rampDoy(doy, md(6, 20), md(7, 10), md(10, 25), md(11, 15)), crickets: rampDoy(doy, md(8, 15), md(9, 1), md(11, 1), md(11, 20)), frogs: rampDoy(doy, md(4, 10), md(5, 1), md(7, 25), md(8, 25)),
    uguisu: rampDoy(doy, md(2, 20), md(3, 10), md(6, 20), md(7, 10)), furin: rampDoy(doy, md(6, 15), md(7, 1), md(9, 1), md(9, 15)), birds: SEASON.key === 'winter' ? 0.5 : 1, wind: SEASON.key === 'winter' ? 1.7 : 1, gulls: 1 };
};
// ---------- weather: automatic by season (梅雨, 夕立, 冬の雪) ----------
SEASON.autoWeather = function (hf) {
  const d = seasonDate(), day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5), doy = SEASON.doy, blk = Math.floor(hf / 3);
  const r = hash2(day, blk, 77), bias = hash2(day, 0, 78), x = r * 0.45 + bias * 0.55;
  let pSnow = 0, pRain = 0.12, pCloud = 0.2;
  if (inDoy(doy, md(6, 8), md(7, 18))) { pRain = 0.45; pCloud = 0.3; }
  else if (inDoy(doy, md(7, 19), md(9, 10))) { pRain = hf > 13 && hf < 18 ? 0.2 : 0.05; pCloud = 0.12; }
  else if (inDoy(doy, md(12, 15), md(2, 28))) { pSnow = inDoy(doy, md(1, 5), md(2, 20)) ? 0.24 : 0.1; pRain = 0.04; pCloud = 0.3; }
  return x < pSnow ? 'snow' : x < pSnow + pRain ? 'rain' : x < pSnow + pRain + pCloud ? 'cloudy' : 'clear';
};
// ---------- snowfall particles ----------
SEASON.makeSnow = function () {
  const N = 2600, pos = new Float32Array(N * 3), R = mulberry(12); for (let i = 0; i < N; i++) pos.set([(R() - 0.5) * 60, R() * 30, (R() - 0.5) * 60], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const tex = txCanvas(32, 32, (x) => { const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); });
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.22, map: tex, transparent: true, depthWrite: false, color: '#ffffff', opacity: 0.95 })); p.frustumCulled = false; p.visible = false; scene.add(p); SEASON.snowPts = p;
};
// ---------- moon with the real phase ----------
SEASON.makeMoon = function () {
  const mk = (age) => txCanvas(128, 128, (x) => { const c = 64, r = 52; x.clearRect(0, 0, 128, 128); const gl = x.createRadialGradient(c, c, r * 0.8, c, c, 64); gl.addColorStop(0, 'rgba(255,248,220,0.35)'); gl.addColorStop(1, 'rgba(255,248,220,0)'); x.fillStyle = gl; x.fillRect(0, 0, 128, 128);
    x.save(); x.beginPath(); x.arc(c, c, r, 0, 7); x.clip(); x.fillStyle = '#2a3048'; x.fillRect(0, 0, 128, 128);
    const ph = age * 2 * Math.PI, k = Math.cos(ph); x.fillStyle = '#fff6d8'; x.beginPath(); const waxing = age < 0.5;
    x.arc(c, c, r, -Math.PI / 2, Math.PI / 2, !waxing); x.ellipse(c, c, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing ? true : false); x.fill();
    x.fillStyle = 'rgba(160,150,130,0.25)'; for (const [a, b, rr] of [[50, 48, 10], [72, 66, 7], [60, 80, 8], [80, 44, 5]]) { x.beginPath(); x.arc(a, b, rr, 0, 7); x.fill(); } x.restore(); });
  SEASON.moonTex = mk; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mk(0.5), transparent: true, depthWrite: false, fog: false })); sp.scale.set(70, 70, 1); sp.renderOrder = -1; scene.add(sp); SEASON.moon = sp; SEASON.moonAge = -1;
};
SEASON.updateMoon = function (hf) {
  if (!SEASON.moon) return; const d = seasonDate(), age = (((d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % 29.530588 + 29.530588) % 29.530588 / 29.530588;
  if (Math.abs(age - SEASON.moonAge) > 0.01) { SEASON.moonAge = age; SEASON.moon.material.map = SEASON.moonTex(age); SEASON.moon.material.needsUpdate = true; }
  let mh = hf - age * 24.8; mh = ((mh % 24) + 24) % 24; const ang = (mh - 5.6) / 13 * Math.PI, el = Math.sin(ang) * 0.75 + 0.02;
  const night = hf < 5.2 || hf > 18.8, vis = night && el > 0.03 && TIME.weather !== 'rain' && TIME.weather !== 'snow' && !GAME.inside;
  SEASON.moon.visible = vis; if (!vis) return; const dir = new THREE.Vector3(Math.cos(ang), el, 0.5).normalize(); SEASON.moon.position.copy(camera.position).addScaledVector(dir, 800);
  const big = SEASON.active.some(e => e.id === 'tsukimi') ? 1.45 : 1; SEASON.moon.scale.setScalar(70 * big); SEASON.moon.material.opacity = TIME.weather === 'cloudy' ? 0.45 : 1;
};
// ===================== events =====================
const EVENTS = [
  { id: 'shogatsu', name: 'お正月', icon: '🎍', from: [1, 1], to: [1, 7], note: '家々に門松。住民に新年のあいさつをしてまわろう。', miss: { text: '住民5人に新年のあいさつ', n: 5, kind: 'talk' }, reward: { money: 3000, item: 'ev_kadomatsu', vit: 15 },
    lines: ['あけましておめでとう、{P}！ 今年もよろしくね。', '初日の出、見た？ 灯台のほうから見るときれいなんだって。', 'おもち、何個食べた？ わたしは5個！'] },
  { id: 'hina', name: 'ひな祭り', icon: '🎎', from: [3, 1], to: [3, 3], note: '集会所にひな人形をかざります。', miss: { text: '集会所のひな人形を見に行く', kind: 'visit', at: 'hall' }, reward: { money: 1000, item: 'ev_hina', vit: 10 },
    lines: ['集会所のおひなさま、見た？ 昔から島にあるんだって。', 'ひなあられ、ちょっとだけもらっちゃった。'] },
  { id: 'hanami', name: 'お花見', icon: '🌸', from: [3, 25], to: [4, 12], hours: [10, 17], note: '島じゅうの桜が満開。広場で住民とお花見。', miss: { text: 'お花見の会場で住民と話す', kind: 'talkAt', at: 'plaza' }, reward: { money: 1500, item: 'ev_bonbori', vit: 15 },
    lines: ['桜、満開だね〜！ 島がピンク色になってる！', 'お花見のおだんご、もう食べた？', '{I}島の桜は、海と一緒に見られるのがいいのよ。'] },
  { id: 'kodomo', name: 'こどもの日', icon: '🎏', from: [4, 25], to: [5, 5], note: 'こいのぼりが島の空を泳ぎます。', miss: { text: '集会所の大きなこいのぼりを見に行く', kind: 'visit', at: 'hall' }, reward: { money: 1000, item: 'ev_koinobori', vit: 10 },
    lines: ['こいのぼり、風で元気に泳いでるね！', '柏もち、つぶあん派？ こしあん派？'] },
  { id: 'tanabata', name: '七夕', icon: '🎋', from: [7, 1], to: [7, 7], note: '集会所の笹に短冊をかざろう。', miss: { text: '集会所の笹に短冊（ねがいごと）をかざる', kind: 'spot', at: 'hall' }, reward: { money: 1000, item: 'ev_tanabata', vit: 10 },
    lines: ['短冊にねがいごと書いた？', '晴れたら天の川が見えるかなあ。'] },
  { id: 'matsuri', name: '夏祭り・盆おどり', icon: '🏮', from: [8, 13], to: [8, 16], hours: [17, 23], note: '広場にやぐらと屋台。夜は盆おどりと花火（20時）。', miss: { text: '盆おどりの輪に入っておどる（夜6時〜10時）', kind: 'dance', at: 'plaza' }, reward: { money: 3000, item: 'ev_chochin', vit: 20 },
    lines: ['今夜は盆おどりだよ！ いっしょにおどろう！', '屋台のかき氷、何味にする？ わたしはイチゴ！', '花火は夜8時からだって！', '昔はこのお祭り、島の外からもたくさん人が来てたんじゃ。'] },
  { id: 'tsukimi', name: 'お月見', icon: '🎑', from: [9, 15], to: [9, 30], note: '集会所にすすきとお月見だんご。夜は大きな月。', miss: { text: '集会所でお月見だんごをいただく', kind: 'spot', at: 'hall' }, reward: { money: 1000, item: 'ev_tsukimi', vit: 10 },
    lines: ['今夜は月がきれいだね。', 'お月見だんご、集会所にあるよ。', '月の光が海にうつると、道みたいに見えるんだ。'] },
  { id: 'halloween', name: 'ハロウィン', icon: '🎃', from: [10, 20], to: [10, 31], note: '家の前にかぼちゃのランタン。住民に話しかけるとお菓子がもらえるかも？', miss: { text: '住民3人からお菓子をもらう（話しかける）', n: 3, kind: 'talk' }, reward: { money: 1500, item: 'ev_pumpkin', vit: 10 },
    lines: ['トリック・オア・トリート！ …はい、{P}にもおかしあげる！', 'かぼちゃのランタン、夜になると光るんだよ。', 'ハロウィンって、もとは秋の収穫のお祭りなんだって。'] },
  { id: 'yakiimo', name: '焼き芋大会', icon: '🍠', from: [11, 10], to: [11, 30], hours: [13, 18], note: '広場で落ち葉のたき火。焼き芋をいただこう。', miss: { text: '広場のたき火で焼き芋をもらう', kind: 'spot', at: 'plaza' }, reward: { money: 1000, item: null, vit: 15 },
    lines: ['落ち葉がいっぱい集まったから、焼き芋するよ！', '紅葉、きれいだね。山のほうが真っ赤！'] },
  { id: 'xmas', name: 'クリスマス', icon: '🎄', from: [12, 1], to: [12, 25], note: '広場に大きなツリー。神社もライトアップ。', miss: { text: '広場のクリスマスツリーを見に行く', kind: 'visit', at: 'plaza' }, reward: { money: 2000, item: 'ev_xmas', vit: 15 },
    lines: ['広場のツリー、夜に見ると本当にきれいだよ。', '神社のライトアップ、もう見た？', 'サンタさん、島まで来てくれるかなあ。'] },
  { id: 'omisoka', name: '大みそか', icon: '🔔', from: [12, 31], to: [12, 31], note: '年越し。夜0時に港で花火。', lines: ['今年もおつかれさま、{P}。', '年越しそば、食べた？ 0時になったら港で花火だよ！'] },
];
const EV_FURN_DEF = [
  { id: 'ev_kadomatsu', name: '門松', w: 0.6, d: 0.6, cat: '季節' }, { id: 'ev_hina', name: 'ひな人形', w: 1.0, d: 0.6, cat: '季節' }, { id: 'ev_bonbori', name: 'ぼんぼり', w: 0.4, d: 0.4, cat: '季節' },
  { id: 'ev_koinobori', name: 'こいのぼり（小）', w: 0.6, d: 0.6, cat: '季節' }, { id: 'ev_tanabata', name: '七夕かざり', w: 0.6, d: 0.6, cat: '季節' }, { id: 'ev_chochin', name: 'ちょうちん', w: 0.4, d: 0.4, cat: '季節' },
  { id: 'ev_tsukimi', name: 'お月見セット', w: 0.6, d: 0.5, cat: '季節' }, { id: 'ev_pumpkin', name: 'かぼちゃランタン', w: 0.5, d: 0.5, cat: '季節' }, { id: 'ev_xmas', name: 'クリスマスツリー（小）', w: 0.8, d: 0.8, cat: '季節' },
];
EV_FURN_DEF.forEach(f => FURN.push(Object.assign({ price: 0, ev: true }, f)));
// ---------- decoration parts ----------
function evMats() {
  if (SEASON.M) return SEASON.M; const glow = (c, e) => { const m = stdM(c, 0.6, 0, { emissive: new THREE.Color(e || c), emissiveIntensity: 0.1 }); SEASON.glow.push(m); return m; };
  SEASON.M = { bamboo: stdM('#6fa24a', 0.5), bambooCut: stdM('#d8e8a8', 0.6), straw: stdM('#c8a46a', 0.9), rope: stdM('#8a6a3a', 0.9), pineG: stdM('#2f6a3a', 0.9), red: stdM('#d8342f', 0.6), white: stdM('#f6f4ee', 0.6), gold: stdM('#e8b84a', 0.3, 0.6),
    blue: stdM('#2f6fd8', 0.6), black: stdM('#2a2c30', 0.6), orange: stdM('#ff8a1a', 0.6), purple: stdM('#7a4ab8', 0.6), green: stdM('#2f7a3a', 0.8), leaf: stdM('#4f9a3a', 0.8),
    chochin: glow('#e8483a', '#ff8a3a'), chochinW: glow('#f6efe0', '#ffd890'), bulbs: ['#ff4a4a', '#ffd84a', '#4ab8ff', '#7aff8a', '#ff8ae0'].map(c => glow(c, c)), star: glow('#ffe27a', '#ffd24a'), pumpkin: null,
    kohaku: new THREE.MeshStandardMaterial({ map: txCanvas(128, 16, (x, w, h) => { for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#ffffff' : '#d8342f'; x.fillRect(k * 16, 0, 16, h); } }, true), roughness: 0.8, side: THREE.DoubleSide }),
    sheet: stdM('#3a7ad8', 0.9, 0, { side: THREE.DoubleSide }), wood: MAT.wood, dark: MAT.darkwood, fire: dmat().fire };
  const face = night => txCanvas(256, 128, (x, w, h) => { x.fillStyle = night ? '#000000' : '#ff8a1a'; x.fillRect(0, 0, w, h); x.fillStyle = night ? '#ffc040' : '#3a1a00'; for (const cx of [64, 192]) { x.beginPath(); x.moveTo(cx - 22, 52); x.lineTo(cx - 10, 34); x.lineTo(cx + 2 - 10, 52); x.fill(); x.beginPath(); x.moveTo(cx + 22, 52); x.lineTo(cx + 10, 34); x.lineTo(cx + 10 - 2, 52); x.fill(); x.beginPath(); x.moveTo(cx - 26, 70); x.quadraticCurveTo(cx, 98, cx + 26, 70); x.lineTo(cx + 14, 76); x.lineTo(cx, 72); x.lineTo(cx - 14, 76); x.fill(); } });
  SEASON.M.pumpkin = new THREE.MeshStandardMaterial({ map: face(false), emissiveMap: face(true), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.6 }); SEASON.glow.push(SEASON.M.pumpkin);
  return SEASON.M;
}
function kadomatsu(g, x, y, z, ry) { const M = evMats(), s = sub(g, x, y, z, ry); CY(s, 0.3, 0.45, M.straw, 0, 0.22, 0, 12); for (const yy of [0.12, 0.32]) CY(s, 0.31, 0.05, M.rope, 0, yy, 0, 12);
  [[0, 1.15, 0], [-0.12, 0.95, 0.1], [0.12, 0.85, -0.08]].forEach(([a, h, b]) => { CY(s, 0.07, h, M.bamboo, a, h / 2 + 0.2, b, 8); const cap = CY(s, 0.072, 0.02, M.bambooCut, a, h + 0.2, b, 8); cap.rotation.x = 0.6; });
  for (let k = 0; k < 5; k++) SP(s, 0.16, M.pineG, Math.cos(k * 1.3) * 0.22, 0.55 + (k % 2) * 0.1, Math.sin(k * 1.3) * 0.22, 0.7, 6); for (let k = 0; k < 4; k++) SP(s, 0.04, k % 2 ? M.red : M.white, Math.cos(k * 1.7 + 1) * 0.2, 0.7, Math.sin(k * 1.7 + 1) * 0.2, 1, 5); return s; }
function koinobori(g, x, y, z, ry, H = 7) { const M = evMats(), s = sub(g, x, y, z, ry); CY(s, 0.07, H, M.white, 0, H / 2, 0, 8); const yw = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 4, 12), M.gold); yw.position.y = H + 0.1; s.add(yw); SP(s, 0.08, M.gold, 0, H + 0.12, 0, 1, 6);
  const fly = sub(s, 0, 0, 0); SEASON.anim.push({ o: fly, k: 'koi', ph: x * 0.3 }); const st = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.35), stdM('#ffffff', 0.8, 0, { side: THREE.DoubleSide, map: txCanvas(64, 16, (c, w, h) => { ['#2f6fd8', '#ffffff', '#d8342f', '#f2c230', '#3faa5a'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * h / 5, w, h / 5); }); }) })); st.position.set(0.95, H - 0.3, 0); fly.add(st);
  [[1.7, H - 0.9, M.black], [1.4, H - 1.6, M.red], [1.1, H - 2.25, M.blue]].forEach(([L, yy, m]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * L / 1.7, 0.12 * L / 1.7, L, 10, 1, true), m); c.material.side = THREE.DoubleSide; c.rotation.z = Math.PI / 2 + 0.12; c.position.set(L / 2 + 0.08, yy, 0); fly.add(c); for (const sz of [-1, 1]) SP(fly, 0.06 * L / 1.7, M.white, 0.25, yy + 0.06, sz * 0.2 * L / 1.7, 1, 6); });
  return s; }
function tanabata(g, x, y, z, ry) { const M = evMats(), s = sub(g, x, y, z, ry), R = mulberry(Math.floor(x * 7)); CY(s, 0.06, 4.2, M.bamboo, 0, 2.1, 0, 8); for (let k = 0; k < 6; k++) { const yy = 2.2 + k * 0.35, a = k * 2.1; SP(s, 0.45, M.leaf, Math.cos(a) * 0.4, yy, Math.sin(a) * 0.4, 0.35, 6); }
  const cols = ['#ff6f91', '#ffd84a', '#7fd0ff', '#a6e07a', '#c49aff', '#ffffff']; for (let k = 0; k < 18; k++) { const a = R() * 6.28, r = 0.3 + R() * 0.4, t = B(s, 0.09, 0.26, 0.01, stdM(cols[k % 6], 0.8, 0, { side: THREE.DoubleSide }), Math.cos(a) * r, 2.0 + R() * 1.9, Math.sin(a) * r); t.rotation.y = R() * 3; } return s; }
function chochinString(g, a, b, n, sag = 0.6) { const M = evMats(); for (let k = 1; k < n; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, y = a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * sag; SP(g, 0.17, k % 3 ? M.chochin : M.chochinW, x, y - 0.18, z, 1.25, 8); } ROD(g, 0.008, M.black, a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - sag, (a[2] + b[2]) / 2], 3); ROD(g, 0.008, M.black, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - sag, (a[2] + b[2]) / 2], b, 3); }
function yagura(g, x, y, z) { const M = evMats(), A = archMats(), s = sub(g, x, y, z, 0);
  for (const a of [-1.6, 1.6]) for (const b of [-1.6, 1.6]) { B(s, 0.2, 4.6, 0.2, M.wood, a, 2.3, b); } B(s, 3.6, 0.15, 3.6, M.wood, 0, 2.2, 0); B(s, 3.8, 0.1, 3.8, M.dark, 0, 2.32, 0);
  for (const [w, d, px, pz] of [[3.4, 0.02, 0, 1.62], [3.4, 0.02, 0, -1.62], [0.02, 3.4, 1.62, 0], [0.02, 3.4, -1.62, 0]]) { const c = B(s, w, 1.9, d, M.kohaku, px, 1.1, pz); }
  for (const [w, d, px, pz] of [[3.4, 0.03, 0, 1.62], [3.4, 0.03, 0, -1.62], [0.03, 3.4, 1.62, 0], [0.03, 3.4, -1.62, 0]]) B(s, w, 0.7, d, M.red, px, 2.75, pz);
  const rf = new THREE.Mesh(roofGeometry(4.2, 4.2, 1.0, true), MAT.kawara); rf.position.y = 4.6; rf.castShadow = true; s.add(rf);
  const dr = CY(s, 0.42, 0.6, stdM('#8a4a2a', 0.5), 0, 2.85, 0, 16, Math.PI / 2, 0); for (const sz of [-0.31, 0.31]) { const hd = CY(s, 0.42, 0.02, stdM('#f0e6d0', 0.6), 0, 2.85, sz, 16, Math.PI / 2, 0); }
  for (let k = 0; k < 7; k++) B(s, 0.5, 0.05, 0.08, M.wood, 0, 0.3 + k * 0.3, 1.9 + k * 0.0).position.z = 1.75 + (7 - k) * 0.06;
  for (const [a, b] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) SP(s, 0.2, M.chochin, a, 4.45, b, 1.3, 8);
  return s; }
function yatai(g, x, y, z, ry, name, col) { const M = evMats(), A = archMats(), s = sub(g, x, y, z, ry);
  B(s, 2.2, 0.9, 1.0, M.wood, 0, 0.45, 0); for (const a of [-1.05, 1.05]) for (const b of [-0.45, 0.45]) B(s, 0.08, 2.3, 0.08, M.dark, a, 1.15, b);
  const rf = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), A.awn[col % A.awn.length]); rf.rotation.x = -Math.PI / 2 + 0.25; rf.position.set(0, 2.35, 0.1); s.add(rf);
  const sg = dynSign(1.6, 0.4, name, ['#ffffff', '#fff3d0', '#e8f6ff', '#ffe6ee'][col % 4], ['#d8342f', '#2f6fd8', '#d8342f', '#3f8f5a'][col % 4]); sg.userData.keep = false; sg.position.set(0, 2.0, 0.56); s.add(sg);
  if (name === '金魚すくい') { CY(s, 0.5, 0.25, M.blue, 0, 1.0, 0.1, 14); for (let k = 0; k < 8; k++) SP(s, 0.05, M.orange, Math.cos(k) * 0.3, 1.13, 0.1 + Math.sin(k) * 0.3, 0.6, 5); }
  else if (name === 'かき氷') { for (let k = 0; k < 3; k++) { CY(s, 0.08, 0.1, M.white, -0.5 + k * 0.5, 0.95, 0.1, 8); SP(s, 0.09, [M.red, M.blue, stdM('#7ae07a', 0.6)][k], -0.5 + k * 0.5, 1.05, 0.1, 1, 6); } }
  else for (let k = 0; k < 6; k++) SP(s, 0.07, stdM(['#b8743a', '#f6e0f0'][col % 2], 0.6), -0.6 + k * 0.24, 0.98, 0.1, 1, 6);
  const L = sub(s, 0, 0, 0); for (const a of [-0.9, 0, 0.9]) SP(L, 0.14, M.chochin, a, 2.15, 0.55, 1.25, 8); return s; }
function xmasTree(g, x, y, z, H = 7) { const M = evMats(), s = sub(g, x, y, z, 0), R = mulberry(5); CY(s, 0.25, 1.2, MAT.darkwood, 0, 0.6, 0, 8);
  for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(2.6 - k * 0.55, 2.4, 14), M.green); c.position.y = 1.6 + k * 1.3; c.castShadow = true; s.add(c); }
  for (let k = 0; k < 60; k++) { const t = R(), yy = 1.0 + t * 5.0, r = (2.6 - (yy - 1.0) / 5.0 * 2.2) * 0.86, a = R() * 6.28; SP(s, k % 3 ? 0.07 : 0.12, k % 3 ? M.bulbs[k % 5] : [M.red, M.gold][k % 2], Math.cos(a) * r, yy, Math.sin(a) * r, 1, 6); }
  const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), M.star); st.position.y = 7.0; st.scale.set(1, 1.3, 0.5); s.add(st); for (let k = 0; k < 5; k++) { const b = B(s, 0.5, 0.4, 0.5, [M.red, M.blue, M.gold][k % 3], Math.cos(k * 1.3) * 1.6, 0.2, Math.sin(k * 1.3) * 1.6); b.rotation.y = k; } return s; }
function pumpkin(g, x, y, z, ry, s0 = 1) { const M = evMats(), s = sub(g, x, y, z, ry); const p = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s0, 16, 10), M.pumpkin); p.scale.y = 0.75; p.position.y = 0.2 * s0; p.rotation.y = -Math.PI / 2; p.castShadow = true; s.add(p); CY(s, 0.03 * s0, 0.12 * s0, MAT.darkwood, 0, 0.42 * s0, 0, 5); return s; }
function wreath(g, x, y, z, ry) { const M = evMats(), s = sub(g, x, y, z, ry); const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 6, 16), M.green); s.add(t); for (let k = 0; k < 6; k++) SP(s, 0.035, M.red, Math.cos(k) * 0.22, Math.sin(k) * 0.22, 0.05, 1, 5); B(s, 0.16, 0.1, 0.03, M.red, 0, -0.22, 0.06); return s; }
function tsukimiSet(g, x, y, z, ry) { const M = evMats(), s = sub(g, x, y, z, ry); B(s, 0.5, 0.3, 0.5, M.wood, 0, 0.15, 0); B(s, 0.42, 0.04, 0.42, M.white, 0, 0.32, 0); for (const [n, yy, r] of [[9, 0.38, 0.12], [4, 0.48, 0.06], [1, 0.57, 0]]) for (let k = 0; k < n; k++) SP(s, 0.06, M.white, n === 9 ? ((k % 3) - 1) * 0.12 : n === 4 ? ((k % 2) - 0.5) * 0.12 : 0, yy, n === 9 ? (Math.floor(k / 3) - 1) * 0.12 : n === 4 ? (Math.floor(k / 2) - 0.5) * 0.12 : 0, 1, 6);
  CY(s, 0.1, 0.4, stdM('#7a8a9a', 0.4), 0.45, 0.2, 0, 8); for (let k = 0; k < 7; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.04, 1.2, 4), stdM('#d8c8a0', 0.9)); c.position.set(0.45 + Math.cos(k) * 0.08, 0.9, Math.sin(k) * 0.08); c.rotation.z = (k - 3) * 0.1; s.add(c); } return s; }
function hinaDan(g, x, y, z, ry) { const M = evMats(), s = sub(g, x, y, z, ry); for (let k = 0; k < 3; k++) B(s, 1.4 - k * 0.3, 0.25, 0.4, M.red, 0, 0.12 + k * 0.25, -k * 0.2); const doll = (dx, yy, dz, c) => { const b = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 8), c); b.position.set(dx, yy + 0.08, dz); s.add(b); SP(s, 0.04, M.white, dx, yy + 0.2, dz, 1, 6); };
  doll(-0.12, 0.75, -0.4, M.black); doll(0.12, 0.75, -0.4, M.red); for (let k = 0; k < 3; k++) doll(-0.25 + k * 0.25, 0.5, -0.2, M.white); for (let k = 0; k < 4; k++) doll(-0.45 + k * 0.3, 0.25, 0.0, [M.blue, M.purple][k % 2]); return s; }
function bonbori(g, x, y, z) { const M = evMats(), s = sub(g, x, y, z, 0); CY(s, 0.04, 1.4, M.red, 0, 0.7, 0, 6); const l = CY(s, 0.16, 0.42, M.chochinW, 0, 1.55, 0, 8); CY(s, 0.18, 0.04, M.red, 0, 1.78, 0, 8); return s; }
function leafFire(g, x, y, z) { const M = evMats(), s = sub(g, x, y, z, 0); SP(s, 1.1, stdM('#b8642a', 0.95), 0, 0.15, 0, 0.35, 10); for (let k = 0; k < 18; k++) SP(s, 0.18, stdM(['#d8642a', '#e8a83a', '#a8402a'][k % 3], 0.9), Math.cos(k * 0.9) * (0.4 + (k % 4) * 0.18), 0.32, Math.sin(k * 0.9) * (0.4 + (k % 4) * 0.18), 0.4, 5);
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 8), M.fire); f.position.y = 0.6; s.add(f); for (let k = 0; k < 4; k++) { const p = SP(s, 0.09, M.purple, Math.cos(k * 1.6) * 0.8, 0.12, Math.sin(k * 1.6) * 0.8, 1, 6); p.scale.set(1, 0.8, 2.2); } return s; }
// event furniture for the house (small versions)
const EV_FURN = { ev_kadomatsu: () => { const g = new THREE.Group(); kadomatsu(g, 0, 0, 0, 0); return g; }, ev_hina: () => { const g = new THREE.Group(); hinaDan(g, 0, 0, 0.15, 0); return g; }, ev_bonbori: () => { const g = new THREE.Group(); bonbori(g, 0, 0, 0); return g; },
  ev_koinobori: () => { const g = new THREE.Group(); koinobori(g, 0, 0, 0, 0, 2.2); g.scale.setScalar(0.9); return g; }, ev_tanabata: () => { const g = new THREE.Group(); tanabata(g, 0, 0, 0, 0); g.scale.setScalar(0.5); return g; }, ev_chochin: () => { const g = new THREE.Group(); const M = evMats(); CY(g, 0.03, 1.2, M.dark, 0, 0.6, 0, 6); SP(g, 0.2, M.chochin, 0, 1.35, 0, 1.3, 10); return g; },
  ev_tsukimi: () => { const g = new THREE.Group(); tsukimiSet(g, 0, 0, 0, 0); return g; }, ev_pumpkin: () => { const g = new THREE.Group(); pumpkin(g, 0, 0, 0, 0, 1.2); return g; }, ev_xmas: () => { const g = new THREE.Group(); xmasTree(g, 0, 0, 0); g.scale.setScalar(0.22); return g; } };
{ const _mf = makeFurniture; makeFurniture = function (id) { return EV_FURN[id] ? EV_FURN[id]() : _mf(id); }; }
// ---------- where events happen ----------
SEASON.findPlaza = function () {
  if (SEASON.plaza) return SEASON.plaza; const Hh = PLACED.hall, c0 = Hh || OPEN; let best = null;
  for (let r = 14; r < 90 && !best; r += 4) for (let a = 0; a < 6.28; a += 0.3) { const x = c0.x + Math.cos(a) * r, z = c0.z + Math.sin(a) * r; let ok = true, mn = 1e9, mx = -1e9;
    for (let k = 0; k < 10 && ok; k++) { const aa = k / 10 * 6.283; for (const rr of [0, 7, 13]) { const px = x + Math.cos(aa) * rr, pz = z + Math.sin(aa) * rr, h = groundH(px, pz); mn = Math.min(mn, h); mx = Math.max(mx, h); if (h < 1.5 || waterDepthAt(px, pz) > 0 || roadDistAt(px, pz) < 4.5 || collidersNear(px, pz).some(q => !q.off && q.kind === 'bld' && hitsCollider(q, px, pz, 1.5))) ok = false; } }
    if (ok && mx - mn < 2.4) { best = { x, z, y: (mn + mx) / 2 }; break; } }
  SEASON.plaza = best || { x: OPEN.x, z: OPEN.z, y: groundH(OPEN.x, OPEN.z) }; return SEASON.plaza;
};
SEASON.spotPos = function (at) { if (at === 'hall' && PLACED.hall) { const [x, z] = toWorld(PLACED.hall, 2.6, PLACED.hall.D / 2 + 2.0); return { x, z }; } const P = SEASON.findPlaza(); return { x: P.x, z: P.z }; };
SEASON.activeAt = function (hf) { const doy = SEASON.doy; return EVENTS.filter(e => inDoy(doy, md(...e.from), md(...e.to))); };
SEASON.build = function () {
  const ids = SEASON.active.map(e => e.id).join(','); if (ids === SEASON.built) return; SEASON.built = ids; setTimeout(() => GAME.renderTracker && GAME.renderTracker(), 0);
  if (SEASON.group) { scene.remove(SEASON.group); } for (const c of (SEASON.colls || [])) c.off = true; SEASON.colls = [];
  SEASON.anim = []; SEASON.spots = []; const g = new THREE.Group(); SEASON.group = g; scene.add(g); const has = id => SEASON.active.some(e => e.id === id);
  const H = PLACED.houses || [], gate = (hs, sx) => { const [x, z] = toWorld(hs, sx * 1.35, hs.d / 2 + 2.95); return [x, groundH(x, z), z]; }, door = (hs, sx) => { const [x, z] = toWorld(hs, sx * 0.95, hs.d / 2 + 0.7); return [x, hs.y + 0.45, z]; };
  const Hh = PLACED.hall, hallP = (lx, lz) => { const [x, z] = toWorld(Hh, lx, lz); return [x, Hh.y, z]; }, P = SEASON.findPlaza(), coll = (x, z, r) => { const c = { x, z, r, kind: 'pole' }; addCollider(c); SEASON.colls.push(c); };
  if (has('shogatsu')) { for (const hs of H) for (const sx of [-1, 1]) { const [x, y, z] = gate(hs, sx); kadomatsu(g, x, y, z, hs.rot); } if (Hh) for (const sx of [-1, 1]) { const [x, y, z] = hallP(sx * 3.4, Hh.D / 2 + 1.3); kadomatsu(g, x, y, z, Hh.rot); } }
  if (has('hina') && Hh) { const [x, y, z] = hallP(-2.4, Hh.D / 2 - 1.1); hinaDan(g, x, y + 0.08, z, Hh.rot); }
  if (has('hanami')) { for (let k = 0; k < 3; k++) { const a = k * 2.1, x = P.x + Math.cos(a) * 5, z = P.z + Math.sin(a) * 5; const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.0), evMats().sheet); sh.rotation.x = -Math.PI / 2; sh.rotation.z = a; sh.position.set(x, groundH(x, z) + 0.04, z); g.add(sh); for (let q = 0; q < 3; q++) B(g, 0.35, 0.12, 0.25, [evMats().red, evMats().black][q % 2], x + (q - 1) * 0.5, groundH(x, z) + 0.1, z); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, x = P.x + Math.cos(a) * 10, z = P.z + Math.sin(a) * 10; bonbori(g, x, groundH(x, z), z); coll(x, z, 0.15); } }
  if (has('kodomo')) { H.forEach((hs, i) => { if (i % 3 !== 0) return; const [x, z] = toWorld(hs, -hs.w / 2 - 0.8, hs.d / 2 + 1.4); koinobori(g, x, groundH(x, z), z, hs.rot + 1.2); coll(x, z, 0.15); }); if (Hh) { const [x, y, z] = hallP(-Hh.W / 2 - 2.2, Hh.D / 2 + 1.0); const kb = koinobori(g, x, y, z, Hh.rot + 1.2, 8); kb.scale.setScalar(1.5); coll(x, z, 0.2); } }
  if (has('tanabata')) { if (Hh) { const [x, y, z] = hallP(2.6, Hh.D / 2 + 2.0); tanabata(g, x, y, z, Hh.rot); coll(x, z, 0.3); SEASON.spots.push({ ev: 'tanabata', x, z, prompt: 'Space：短冊にねがいごとを書く' }); } if (PLACED.shop) { const S = PLACED.shop, [x, z] = toWorld(S, S.w / 2 + 0.6, S.d / 2 + 1.0); tanabata(g, x, groundH(x, z), z, S.rot); } }
  if (has('matsuri')) { if (!(typeof devDone === 'function' && devDone('matsuri'))) { yagura(g, P.x, P.y, P.z); coll(P.x, P.z, 2.0); } for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + 0.2, x = P.x + Math.cos(a) * 12.5, z = P.z + Math.sin(a) * 12.5, y = groundH(x, z); CY(g, 0.08, 4.0, MAT.darkwood, x, y + 2, z, 6); coll(x, z, 0.15); chochinString(g, [P.x, P.y + 4.6, P.z], [x, y + 3.9, z], 8, 0.7); }
    ['かき氷', 'たこ焼き', '金魚すくい', 'わたあめ'].forEach((nm, k) => { const a = k / 4 * 6.283 + 0.6, x = P.x + Math.cos(a) * 16.5, z = P.z + Math.sin(a) * 16.5; yatai(g, x, groundH(x, z), z, Math.atan2(P.x - x, P.z - z), nm, k); const c = { x, z, hw: 1.15, hd: 0.55, rot: Math.atan2(P.x - x, P.z - z), kind: 'bld' }; addCollider(c); SEASON.colls.push(c); });
    H.forEach((hs, i) => { const [x, y, z] = door(hs, i % 2 ? 1 : -1); SP(g, 0.17, evMats().chochin, x, y + 2.2, z, 1.25, 8); }); }
  if (has('tsukimi')) { if (Hh) { const [x, y, z] = hallP(2.6, Hh.D / 2 + 2.0); tsukimiSet(g, x, y, z, Hh.rot); coll(x, z, 0.35); SEASON.spots.push({ ev: 'tsukimi', x, z, prompt: 'Space：お月見だんごをいただく' }); } if (PLACED.home) { const [x, y, z] = door(PLACED.home.hs, 1); tsukimiSet(g, x, y, z, PLACED.home.hs.rot); } }
  if (has('halloween')) { [].forEach((hs, i) => { const [x, y, z] = gate(hs, i % 2 ? 1 : -1); pumpkin(g, x, y, z + 0, hs.rot, 1.3); if (i % 2 === 0) { const [x2, y2, z2] = gate(hs, i % 2 ? -1 : 1); pumpkin(g, x2, y2, z2, hs.rot + 0.4, 0.9); } const [x3, y3, z3] = door(hs, 1); pumpkin(g, x3, y3, z3, hs.rot, 0.8); });
    if (PLACED.shop) { const S = PLACED.shop; for (let k = 0; k < 14; k++) { const [x, z] = toWorld(S, -S.w / 2 + 0.3 + k * (S.w - 0.6) / 13, S.d / 2 + 0.55); SP(g, 0.07, k % 2 ? evMats().bulbs[1] : evMats().bulbs[4], x, S.y + 0.45 + 2.7, z, 1, 6); } for (let k = 0; k < 3; k++) { const [x, z] = toWorld(S, S.w / 2 - 0.4 - k * 0.5, S.d / 2 + 1.5); pumpkin(g, x, groundH(x, z), z, S.rot, 1.3 - k * 0.2); } }
    if (false) for (let k = 0; k < 5; k++) { const [x, y, z] = hallP(-2 + k, Hh.D / 2 + 1.2); pumpkin(g, x, y, z, Hh.rot + k, 0.8 + (k % 2) * 0.4); } }
  if (has('yakiimo')) { leafFire(g, P.x, P.y, P.z); coll(P.x, P.z, 1.0); SEASON.spots.push({ ev: 'yakiimo', x: P.x, z: P.z, r: 3.2, prompt: 'Space：焼き芋をもらう' }); }
  if (has('xmas')) { xmasTree(g, P.x, P.y, P.z); coll(P.x, P.z, 1.6); H.forEach(hs => { const [x, z] = toWorld(hs, 0, hs.d / 2 + 0.12); wreath(g, x, hs.y + 0.45 + 1.75, z, hs.rot); });
    const C = PLACED.church; if (C) for (const sx of [-1, 1]) for (let k = 0; k < 22; k++) { const [x, z] = toWorld(C, sx * 5.2, -8.0 + k * 0.4); SP(g, 0.08, evMats().bulbs[k % 5], x, C.y + 3.55, z, 1, 5); } }
  for (const ch of [...g.children]) { if (SEASON.anim.some(a => a.o === ch || a.o.parent === ch)) continue; }
};
// ---------- missions & rewards ----------
SEASON.evState = function (e) { const p = GAME.p; if (!p) return null; p.ev = p.ev || {}; const k = e.id + seasonDate().getFullYear(); return p.ev[k] = p.ev[k] || { n: 0, talked: {}, done: false, seen: false }; };
SEASON.complete = function (e) { const st = SEASON.evState(e); if (!st || st.done) return; st.done = true; const r = e.reward || {}; if (r.money) GAME.addMoney(r.money); if (r.vit) GAME.addVit(r.vit);
  if (r.item) { const H = GAME.home(); H.store[r.item] = (H.store[r.item] || 0) + 1; } GAME.dirty = true; GAME.banner(`${e.icon} ${e.name}のおねがい たっせい！`, `${r.money ? 'お礼 ' + r.money + '円' : ''}${r.item ? '・家具「' + (EV_FURN_DEF.find(f => f.id === r.item) || {}).name + '」' : ''}${r.vit ? '・元気度 +' + r.vit : ''}`); GAME.renderTracker(); };
SEASON.progress = function (e) { const st = SEASON.evState(e); return st ? (e.miss && e.miss.n ? Math.min(e.miss.n, st.n) : st.done ? 1 : 0) : 0; };
SEASON.check = function (dt, hf) {
  if (!GAME.p) return; const pp = { x: PL.x, z: PL.z };
  for (const e of SEASON.active) { if (!e.miss) continue; const st = SEASON.evState(e); if (!st || st.done) continue; const sp = SEASON.spotPos(e.miss.at), d = Math.hypot(pp.x - sp.x, pp.z - sp.z);
    if (e.miss.kind === 'visit' && d < 9 && !GAME.inside) SEASON.complete(e);
    if (e.miss.kind === 'dance') { const P = SEASON.findPlaza(), dd = Math.hypot(pp.x - P.x, pp.z - P.z); if (hf >= 18 && hf < 22 && dd > 3 && dd < 9 && !PL.veh) { st.t = (st.t || 0) + dt; if (st.t > 12) SEASON.complete(e); } } }
  // first time we notice an event this year: a banner
  for (const e of SEASON.active) { const st = SEASON.evState(e); if (st && !st.seen) { st.seen = true; GAME.dirty = true; setTimeout(() => GAME.banner(`${e.icon} ${e.name}`, e.note), 1200); break; } }
};
SEASON.onTalk = function (id) { for (const e of SEASON.active) { const st = SEASON.evState(e); if (!st || st.done || !e.miss) continue; if (e.miss.kind === 'talk' && !st.talked[id]) { st.talked[id] = 1; st.n++; if (st.n >= e.miss.n) SEASON.complete(e); else GAME.renderTracker(); }
  if (e.miss.kind === 'talkAt') { const sp = SEASON.spotPos(e.miss.at); if (Math.hypot(PL.x - sp.x, PL.z - sp.z) < 18) SEASON.complete(e); } } };
SEASON.nearSpot = function () { if (PL.veh || GAME.inside) return null; for (const s of SEASON.spots) { if (Math.hypot(PL.x - s.x, PL.z - s.z) < (s.r || 2.4)) { const e = EVENTS.find(q => q.id === s.ev), st = SEASON.evState(e); return Object.assign({ e, st }, s); } } return null; };
SEASON.useSpot = function (s) {
  const e = s.e; if (e.id === 'tanabata') { const wishes = ['島がもっとにぎやかになりますように', 'みんなが元気でいられますように', '大きな魚が釣れますように', '家がもっとすてきになりますように'];
    UI.dialog('短冊', 'どんなねがいごとを書く？'); UI.choices(wishes.map(w => ({ t: w, f: () => { UI.dialog('短冊', `「${w}」と書いて、笹にかざった。`); setTimeout(() => UI.dialog(null), 2200); SEASON.complete(e); } }))); return true; }
  if (e.id === 'tsukimi') { UI.toast('🎑 お月見だんごをいただいた。もちもち！'); SEASON.complete(e); return true; }
  if (e.id === 'yakiimo') { const hf = currentHour(); if (hf < 13 || hf >= 18) { UI.toast('焼き芋は13時〜18時だよ'); return true; } UI.toast('🍠 あつあつの焼き芋をもらった！'); SEASON.complete(e); return true; }
  return false;
};
// talk lines for the season, the weather and today's event
const SEASON_LINES = {
  spring: ['あたたかくなってきたね。桜、もうすぐかな？', '春の海は、ちょっとかすんで見えるんだ。', 'ウグイスの声、聞こえた？「ホーホケキョ」！'],
  summer: ['あつい〜！ セミがすごく鳴いてるね。', '夏は海がいちばんきれいな季節だよ。', '夕立のあとって、空気がすずしくて気持ちいいね。'],
  autumn: ['すずしくなってきたね。山がだんだん色づいてきたよ。', '秋の夜は虫の声がきれいだね。', '秋はさんまにみかんに…食べ物がおいしい季節！'],
  winter: ['さむ〜い！ 手がつめたいよ。', '冬の海は色がこくて、すんでいるんだ。', '雪がつもったら、雪だるま作ろうね！'],
  rain: ['雨だね。傘、持ってる？', '雨の音って、なんだか落ち着くね。'], snow: ['わあ、雪だよ！ 島に雪がふるなんてめずらしいんだ。', '足もとがすべるから気をつけてね。'],
  morning: ['おはよう！ 朝の空気って気持ちいいね。'], night: ['こんばんは。夜の島は静かだね。', '星がいっぱい見えるよ。'],
};
GAME.extraLine = function (n) {
  const p = this.p; if (!p) return null; const day = todayKey(); p.evTalk = p.evTalk || {};
  for (const e of SEASON.active) { const k = e.id + day + n.def.id; if (!p.evTalk[k] && e.lines) { p.evTalk[k] = 1; return e.lines[Math.floor(Math.random() * e.lines.length)]; } }
  const hf = currentHour(), r = Math.random(); if (r < 0.45) return null;
  const pool = TIME.weather === 'snow' ? SEASON_LINES.snow : TIME.weather === 'rain' ? SEASON_LINES.rain : hf < 9 && hf > 4 ? SEASON_LINES.morning.concat(SEASON_LINES[SEASON.key] || []) : hf >= 19 || hf < 4 ? SEASON_LINES.night.concat(SEASON_LINES[SEASON.key] || []) : SEASON_LINES[SEASON.key];
  return pool ? pool[Math.floor(Math.random() * pool.length)] : null;
};
// ---------- villagers gather for festivals ----------
SEASON.crowdPlan = function (hf) {
  const P = SEASON.findPlaza(), has = id => SEASON.active.some(e => e.id === id); let mode = '';
  if (has('matsuri') && hf >= 18 && hf < 22) mode = 'dance'; else if (has('hanami') && hf >= 11 && hf < 16) mode = 'hanami'; else if (has('yakiimo') && hf >= 14 && hf < 17) mode = 'fire'; else if (has('xmas') && hf >= 18 && hf < 21) mode = 'tree';
  if (mode === SEASON.crowdOn) return; SEASON.crowdOn = mode; const list = NPCS.filter(n => !n.visitor && !n.seat);
  list.forEach((n, i) => { if (!mode) { n.crowd = null; return; } const a = i / list.length * 6.283, r = mode === 'dance' ? 6 : mode === 'hanami' ? 5 + (i % 2) : 3.2 + (i % 2) * 0.8; n.crowd = { cx: P.x, cz: P.z, a, r, mode }; });
};
function crowdVillager(n, dt) {
  const C = n.crowd; if (C.mode === 'dance') C.a += dt * 0.22; const tx = C.cx + Math.cos(C.a) * C.r, tz = C.cz + Math.sin(C.a) * C.r, d = Math.hypot(tx - n.x, tz - n.z);
  let spd = 0; if (d > 60) { n.x = tx + 2; n.z = tz + 2; } else if (d > 0.3) { const sp = Math.min(d / dt, C.mode === 'dance' && d < 2 ? 1.6 : 2.2); n.rot = angLerp(n.rot, Math.atan2(tx - n.x, tz - n.z), Math.min(1, dt * 6)); n.x += (tx - n.x) / d * sp * dt; n.z += (tz - n.z) / d * sp * dt; spd = sp; }
  if (d < 2 && C.mode !== 'dance') { n.rot = angLerp(n.rot, Math.atan2(C.cx - n.x, C.cz - n.z), Math.min(1, dt * 4)); spd = 0; }
  if (C.mode === 'dance' && d < 2) n.rot = angLerp(n.rot, C.a + Math.PI, Math.min(1, dt * 4));
  n.ph += dt * (spd > 0.1 ? 7 : 1.8); n.y = lerp(n.y, groundH(n.x, n.z), Math.min(1, dt * 12)); n.mesh.position.set(n.x, n.y, n.z); n.mesh.rotation.y = n.rot; n.tag.visible = Math.hypot(PL.x - n.x, PL.z - n.z) < 9;
  animateBody(n.parts, n.rest, n.ph, spd, dt, {});
  if (C.mode === 'dance' && n.parts.upperArmL) { const t = performance.now() / 1000 + C.a * 3, b = Math.sin(t * 3.2); n.parts.upperArmL.rotation.z = -1.4 - b * 0.5; n.parts.upperArmR.rotation.z = 1.4 - b * 0.5; n.parts.foreArmL.rotation.x = n.parts.foreArmR.rotation.x = -0.6; n.parts.spine.rotation.y = b * 0.2; }
}
// ---------- per-frame ----------
SEASON.update = function (dt) {
  SEASON.t += dt; const hf = currentHour();
  if (!SEASON.ready && VEG.fmats) { SEASON.ready = true; if (!TIME.wmode) TIME.wmode = 'auto'; SEASON.makeSnow(); SEASON.makeMoon(); SEASON.apply(); }
  if (!SEASON.ready) return;
  const d = seasonDate(), doy = md(d.getMonth() + 1, d.getDate()); if (doy !== SEASON.doy || (SEASON._t1 = (SEASON._t1 || 0) + dt) > 2) { SEASON._t1 = 0; const pd = SEASON.doy; SEASON.apply(); SEASON.active = SEASON.activeAt(hf); if (GAME.p) SEASON.build(); }
  if (TIME.wmode === 'auto') { const w = SEASON.autoWeather(hf); if (w !== TIME.weather) { TIME.weather = w; UI.weatherBtns && UI.weatherBtns(); } }
  // snow cover builds up while it snows, melts slowly after
  const tgt = TIME.weather === 'snow' ? 1 : 0, sn0 = SEASON.snow; SEASON.snow = Math.max(0, Math.min(1, SEASON.snow + (tgt ? dt / 45 : -dt / 160))); if (Math.abs(SEASON.snow - sn0) > 0.002 || (SEASON._sn !== undefined && Math.abs(SEASON._sn - SEASON.snow) > 0.02)) { SEASON._sn = SEASON.snow; SEASON.apply(); }
  const sp = SEASON.snowPts; if (sp) { sp.visible = TIME.weather === 'snow' && !GAME.inside; if (sp.visible) { const P = sp.geometry.attributes.position, t = SEASON.t; for (let i = 0; i < P.count; i++) { let y = P.getY(i) - (1.1 + (i % 7) * 0.08) * dt; if (y < 0) y += 30; P.setY(i, y); P.setX(i, P.getX(i) + Math.sin(t * 0.7 + i) * 0.25 * dt); } P.needsUpdate = true; sp.position.set(camera.position.x, camera.position.y - 12, camera.position.z); } }
  SEASON.updateMoon(hf);
  const night = hf >= 18.3 || hf < 5.5 ? 1 : 0; for (const m of SEASON.glow) m.emissiveIntensity = m === (SEASON.M && SEASON.M.pumpkin) ? 0.05 + night * 3.0 : 0.15 + night * 1.6;
  for (const a of SEASON.anim) if (a.k === 'koi') a.o.rotation.y = Math.sin(SEASON.t * 0.4 + a.ph) * 0.6 - 0.3;
  if (GAME.p) { SEASON.check(dt, hf); SEASON.crowdPlan(hf); }
  // festival fireworks (8/13-16 at 20:00) and the new year (0:00 on 1/1)
  const fw = (SEASON.active.some(e => e.id === 'matsuri') && hf >= 20 && hf < 20.4) || (SEASON.doy === 0 && hf < 0.2);
  if (fw && GAME.burst && GAME.LM) { SEASON.fwT = (SEASON.fwT || 0) - dt; if (SEASON.fwT <= 0) { SEASON.fwT = 0.6 + Math.random() * 1.0; try { GAME.burst(); } catch (e) { } } }
  // taiko rhythm during bon-odori
  if (SEASON.crowdOn === 'dance' && SND.ctx && !GAME.inside) { const P = SEASON.findPlaza(), dd = Math.hypot(PL.x - P.x, PL.z - P.z); if (dd < 90) { SEASON.beatT = (SEASON.beatT || 0) - dt; if (SEASON.beatT <= 0) { SEASON.beat = ((SEASON.beat || 0) + 1) % 8; SEASON.beatT = 0.36; const pat = [1, 0, 1, 0, 1, 1, 0, 2][SEASON.beat]; if (pat) SEASON.taiko(pat, Math.max(0.05, 1 - dd / 90)); } } }
};
SEASON.taiko = function (k, v) { if (SND.prefs.mute) return; const c = SND.ctx, t = c.currentTime, g = c.createGain(); g.connect(SND.bus.sfx);
  if (k === 1) { const o = c.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.25); g.gain.setValueAtTime(0.9 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45); o.connect(g); o.start(t); o.stop(t + 0.5); }
  else { const b = c.createBuffer(1, 2205, 44100), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 300); const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; s.connect(f); f.connect(g); g.gain.value = 0.5 * v; s.start(t); } };
// ---------- calendar tab & UI ----------
SEASON.calTab = function () {
  const doy = SEASON.doy, y = seasonDate().getFullYear();
  const rows = EVENTS.map(e => { const on = inDoy(doy, md(...e.from), md(...e.to)), st = GAME.p && GAME.p.ev && GAME.p.ev[e.id + y], done = st && st.done;
    return `<li class="${on ? 'now' : ''}"><span class="ck">${e.icon}</span><div><b>${e.name}</b>　<span class="pr">${e.from[0]}/${e.from[1]}${e.to[0] !== e.from[0] || e.to[1] !== e.from[1] ? '〜' + e.to[0] + '/' + e.to[1] : ''}</span>${on ? '　<span class="tag">開催中</span>' : ''}${done ? '　✓' : ''}<div class="sub">${esc(e.note)}${e.miss ? `<br>おねがい：${esc(e.miss.text)}` : ''}</div></div><button class="mini" data-evday="${String(e.from[0]).padStart(2, '0')}-${String(e.from[1]).padStart(2, '0')}">この日にしてみる</button></li>`; }).join('');
  return `<p class="small" style="margin:0 0 8px">今日は <b>${seasonDate().getMonth() + 1}月${seasonDate().getDate()}日（${SEASON_NAME[SEASON.key]}）</b>${SEASON.override ? '　<button class="mini" data-evday="auto">本当の日付にもどす</button>' : ''}<br>季節で木の色・草花・虫や鳥の声・天気が変わります。行事の日には島がかざられ、おねがいをかなえると季節の家具がもらえます。</p><ul class="list cal">${rows}</ul>`;
};
SEASON.setOverride = function (v) { SEASON.override = v === 'auto' ? null : v; try { if (SEASON.override) localStorage.setItem('hoshinami2-season', SEASON.override); else localStorage.removeItem('hoshinami2-season'); } catch (e) { } SEASON.doy = -1; SEASON.built = '?'; SEASON.crowdOn = '?'; SEASON.apply(); SEASON.active = SEASON.activeAt(currentHour()); SEASON.build(); UI.clock(currentHour()); UI.seasonBtns && UI.seasonBtns(); };
SEASON.ui = function () {
  const ctl = document.querySelector('#hud .ctl'); if (!ctl || document.getElementById('sBtns')) return; if (!TIME.wmode) TIME.wmode = 'auto';
  const row = document.createElement('div'); row.className = 'row'; row.id = 'sBtns'; row.innerHTML = [['auto', '今日'], ['04-03', '春'], ['08-14', '夏'], ['11-15', '秋'], ['12-24', '冬']].map(([k, n]) => `<button data-s="${k}">${n}</button>`).join(''); ctl.insertBefore(row, document.getElementById('sndRow'));
  row.onclick = e => { const b = e.target.closest('button'); if (!b) return; SEASON.setOverride(b.dataset.s); document.getElementById('c').focus(); };
  UI.seasonBtns = () => row.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.s === 'auto' && !SEASON.override) || b.dataset.s === SEASON.override)); UI.seasonBtns();
  const wb = document.getElementById('wBtns'); if (wb && !wb.querySelector('[data-w="auto"]')) { wb.insertAdjacentHTML('afterbegin', '<button data-w="auto">自動</button>'); wb.insertAdjacentHTML('beforeend', '<button data-w="snow">雪</button>');
    wb.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.w === 'auto') TIME.wmode = 'auto'; else { TIME.wmode = 'manual'; TIME.weather = b.dataset.w; } UI.weatherBtns(); document.getElementById('c').focus(); };
    UI.weatherBtns = () => wb.querySelectorAll('button').forEach(b => b.classList.toggle('on', TIME.wmode === 'auto' ? b.dataset.w === 'auto' : b.dataset.w === TIME.weather)); UI.weatherBtns(); }
};
// hooks
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); if (!SEASON._ui) { SEASON._ui = 1; try { SEASON.ui(); } catch (e) { } } try { SEASON.update(dt || 0.016); } catch (e) { if (!SEASON._err) { SEASON._err = 1; console.warn('season', e); } } return r; }; }
{ const _ev = GAME.ev; GAME.ev = function (type, amount, arg) { const r = _ev.apply(this, arguments); if (type === 'talk') try { SEASON.onTalk(arg); } catch (e) { } return r; }; }
{ const _pr = GAME.prompt; GAME.prompt = function () { const s = this.p && SEASON.nearSpot(); if (s && !(s.st && s.st.done)) return s.prompt; return _pr.apply(this, arguments); }; }
{ const _ia = GAME.interact; GAME.interact = function () { const s = this.p && SEASON.nearSpot(); if (s && !(s.st && s.st.done) && SEASON.useSpot(s)) return true; return _ia.apply(this, arguments); }; }
{ const _ml = GAME.meetLine; GAME.meetLine = function () { const base = _ml.apply(this, arguments); const ev = SEASON.active.filter(e => e.miss); if (!ev.length) return base;
  return base + ev.map(e => { const st = SEASON.evState(e), pr = SEASON.progress(e), done = st && st.done; return `<div class="evl ${done ? 'done' : ''}"><span class="ei">${e.icon}</span><span class="et"><b>${esc(e.name)}</b>（〜${e.to[0]}/${e.to[1]}）${done ? '　✓ たっせい' : '<br>' + esc(e.miss.text)}${!done && e.miss.n ? `　${pr}/${e.miss.n}` : ''}</span></div>`; }).join(''); }; }
{ const _ck = UI.clock.bind(UI); UI.clock = function (hf) { _ck(hf); const el = document.getElementById('hD'); if (el && SEASON.key) { const d = seasonDate(); el.textContent = `${d.getMonth() + 1}月${d.getDate()}日（${SEASON_NAME[SEASON.key]}）　${GAME.p ? GAME.p.island : 'ほしなみ'}島`; } }; }
