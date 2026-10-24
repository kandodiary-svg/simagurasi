// ===================== LIVELY VILLAGERS: daily schedules, activities & props, emotes, seasonal outfits, richer talk, friendship =====================
const LIVE = { spots: {}, t: 0, chatCd: 0 };
// [from hour, place, activity] — each entry lasts until the next one
const SCHED = {
  v_mio: [[5.5, 'home', 'stroll'], [6.5, 'plaza', 'exercise'], [7.2, 'beach', 'stroll'], [10, 'lighthouse', 'sketch'], [12, 'shop', 'stroll'], [13.5, 'harbor', 'look'], [16.5, 'beach', 'look'], [18.6, 'plaza', 'chat'], [21.5, 'home', 'sleep']],
  v_sora: [[6, 'plaza', 'exercise'], [7, 'harbor', 'fish'], [11, 'shop', 'chat'], [12.5, 'river', 'fish'], [15, 'beach', 'play'], [17.5, 'harbor', 'fish'], [20, 'home', 'stroll'], [22.5, 'home', 'sleep']],
  v_hana: [[5.8, 'garden', 'water'], [6.5, 'plaza', 'exercise'], [7.2, 'garden', 'water'], [9, 'flowers', 'stroll'], [12, 'home', 'stroll'], [14, 'farm', 'water'], [16.5, 'church', 'look'], [18, 'garden', 'water'], [20.5, 'home', 'sleep']],
  v_gen: [[4.5, 'harbor', 'fish'], [9, 'harbor', 'look'], [12, 'home', 'stroll'], [14, 'harbor', 'fish'], [17, 'plaza', 'chat'], [19.5, 'home', 'sleep']],
  v_rin: [[6, 'plaza', 'exercise'], [7, 'church', 'sweep'], [9, 'hall', 'sweep'], [12, 'shop', 'chat'], [13.5, 'church', 'look'], [16, 'hall', 'look'], [18, 'plaza', 'chat'], [20.5, 'peak', 'look'], [22, 'home', 'sleep']],
  v_kai: [[6.5, 'plaza', 'exercise'], [7.3, 'shop', 'shop'], [12, 'shop', 'sweep'], [13, 'shop', 'shop'], [18.5, 'harbor', 'look'], [20, 'home', 'stroll'], [21.5, 'home', 'sleep']],
  v_nagi: [[5, 'harbor', 'fish'], [9, 'river', 'fish'], [12, 'home', 'stroll'], [14, 'falls', 'fish'], [17, 'harbor', 'fish'], [20, 'home', 'sleep']],
  v_takumi: [[6, 'plaza', 'exercise'], [7, 'hall', 'carry'], [12, 'shop', 'chat'], [13, 'farm', 'carry'], [17, 'plaza', 'chat'], [19, 'home', 'stroll'], [21, 'home', 'sleep']],
  v_yuki: [[8, 'home', 'stroll'], [9, 'falls', 'sketch'], [12, 'shop', 'stroll'], [13.5, 'peak', 'sketch'], [16.5, 'beach', 'sketch'], [19, 'home', 'stroll'], [23, 'home', 'sleep']],
  v_kota: [[6.5, 'plaza', 'exercise'], [7.3, 'beach', 'play'], [12, 'home', 'stroll'], [13, 'plaza', 'play'], [15, 'river', 'fish'], [17, 'plaza', 'play'], [18.5, 'home', 'stroll'], [20, 'home', 'sleep']],
  _: [[6.5, 'home', 'stroll'], [9, 'plaza', 'stroll'], [12, 'shop', 'stroll'], [14, 'beach', 'look'], [17, 'plaza', 'chat'], [19, 'home', 'stroll'], [21.5, 'home', 'sleep']],
};
const ACT_NAME = { fish: '釣り', sketch: 'スケッチ', sweep: 'そうじ', water: '水やり', exercise: 'ラジオ体操', shop: '店番', carry: '材木はこび', play: 'かけっこ', look: 'ながめ', chat: 'おしゃべり', stroll: 'さんぽ', umb: 'さんぽ', snowman: '雪だるまづくり', sleep: 'おやすみ中' };
const WET_ACTS = { fish: 1, sketch: 1, exercise: 1, play: 1, water: 1, carry: 1, sweep: 1 };
const SUMMER_HAT = { v_gen: 1, v_sora: 1, v_kota: 1, v_nagi: 1, v_hana: 1, v_takumi: 1 }, BEANIE = { v_sora: 1, v_kota: 1, v_mio: 1, v_nagi: 1, v_takumi: 1 };
const SCARF_COL = { v_mio: '#e84a5a', v_sora: '#2a6ad8', v_hana: '#f0a8c8', v_gen: '#6a5a3a', v_rin: '#8a5ad0', v_kai: '#f0a020', v_nagi: '#30a0a0', v_takumi: '#3a8a3a', v_yuki: '#f4f4f4', v_kota: '#e8402a' };
// ---------- places ----------
function walkableAt(x, z, r = 0.5) { const h = groundH(x, z); if (h < 0.5 || waterDepthAt(x, z) > 0 || !isNaN(waterLevelAt(G, x, z))) return false; return !collidersNear(x, z).some(c => !c.off && hitsCollider(c, x, z, r)); }
function spotNear(x, z, rad, seed, test) { const R = mulberry(seed | 0); for (let k = 0; k < 90; k++) { const a = R() * 6.283, r = 1.2 + R() * rad * Math.min(1, k / 30 + 0.35), px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (walkableAt(px, pz) && (!test || test(px, pz))) return { x: px, z: pz }; } return null; }
function waterFacing(x, z) { let best = null; for (let a = 0; a < 6.283; a += 0.2) for (const r of [2.5, 4, 6]) { const px = x + Math.sin(a) * r, pz = z + Math.cos(a) * r; if (groundH(px, pz) < -0.2 || waterDepthAt(px, pz) > 0.3) { if (!best || r < best.r) best = { a, r }; break; } } return best; }
function nearWater(x, z) { const w = waterFacing(x, z); return w && w.r <= 4; }
LIVE.place = function (n, key) {
  const id = n.def.id, ck = id + ':' + key; if (LIVE.spots[ck] !== undefined) return LIVE.spots[ck];
  const seed = [...ck].reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7), LM = GAME.LM || {}, H = n.home0; let s = null;
  const at = (x, z, r, test) => spotNear(x, z, r, seed, test);
  if (key === 'home') s = { x: H.x, z: H.z };
  else if (key === 'garden') s = at(H.x, H.z, 5);
  else if (key === 'plaza') { const P = SEASON.findPlaza(), i = Math.max(0, VILLAGER_DEF.findIndex(v => v.id === id)), a = i * 2.39996; s = spotNear(P.x + Math.cos(a) * (2.6 + (i % 3) * 1.2), P.z + Math.sin(a) * (2.6 + (i % 3) * 1.2), 2.5, seed) || at(P.x, P.z, 8); }
  else if (key === 'shop' && PLACED.shop) { const h = PLACED.shop, f = h.d / 2 + 4.2; s = at(h.x + Math.sin(h.rot) * f, h.z + Math.cos(h.rot) * f, 5); }
  else if (key === 'hall' && PLACED.hall && PLACED.hall.entry) s = at(PLACED.hall.entry.x, PLACED.hall.entry.z, 6);
  else if (key === 'church' && PLACED.church) { const [x, z] = toWorld(PLACED.church, 0, 16); s = at(x, z, 7); }
  else if (key === 'lighthouse' && PLACED.lighthouse) s = at(PLACED.lighthouse.x, PLACED.lighthouse.z, 16, (x, z) => Math.hypot(x - PLACED.lighthouse.x, z - PLACED.lighthouse.z) > 7);
  else if (key === 'peak' && LM.peak) s = at(LM.peak.x, LM.peak.z, 8);
  else if (key === 'beach' && LM.beach) s = at(LM.beach.x, LM.beach.z, 26, (x, z) => groundH(x, z) < 2.2);
  else if (key === 'flowers') { const F = NATURE.sunflowerField || H; s = at(F.x, F.z, 12); }
  else if (key === 'farm' && NATURE.farmAt) { const [x, z] = toWorld(NATURE.farmAt, 0, 12.5); s = at(x, z, 5); }
  else if (key === 'falls') { const F = NATURE.falls ? { x: NATURE.falls.top.x + FALLS.tx * 9, z: NATURE.falls.top.z + FALLS.tz * 9 } : FALLS; s = at(F.x, F.z, 14, nearWater); }
  else if (key === 'river' && G.river) { const p = G.river.pts[Math.floor(G.river.pts.length * (0.45 + (seed & 7) * 0.03))]; s = at(p[0], p[1], 14, nearWater); }
  else if (key === 'harbor' && PLACED.harbor) { const h = PLACED.harbor; s = at(h.x, h.z, 30, nearWater) || at(h.x, h.z, 20); }
  if (s) { const w = waterFacing(s.x, s.z); s.face = w ? w.a : null; }
  LIVE.spots[ck] = s; return s;
};
LIVE.entry = function (n, hf) {
  const S = SCHED[n.def.id] || SCHED._; let e = S[S.length - 1]; for (const q of S) if (hf >= q[0]) e = q; if (hf < S[0][0]) e = S[S.length - 1];
  let [, place, act] = e; const w = TIME.weather;
  if (act !== 'sleep' && (w === 'rain' || w === 'storm') && WET_ACTS[act]) act = 'umb';
  if (act !== 'sleep' && w === 'snow') { if (n.def.id === 'v_kota' || n.def.id === 'v_sora' && act === 'play') { act = 'snowman'; place = 'plaza'; } else if (WET_ACTS[act]) act = 'stroll'; }
  // festival nights override (handled by the crowd system); keep night owls awake during events
  return { place, act };
};
// ---------- props ----------
const PROP = {};
function propMats() { if (PROP.m) return PROP.m; return PROP.m = { wood: new THREE.MeshStandardMaterial({ color: '#a87a4a', roughness: 0.7 }), dark: new THREE.MeshStandardMaterial({ color: '#3a3430', roughness: 0.6 }), line: new THREE.LineBasicMaterial({ color: '#f4f4f4', transparent: true, opacity: 0.7 }), straw: new THREE.MeshStandardMaterial({ color: '#e8cf8a', roughness: 0.9 }), red: new THREE.MeshStandardMaterial({ color: '#d8343a', roughness: 0.6 }), tin: new THREE.MeshStandardMaterial({ color: '#7ab0c8', roughness: 0.35, metalness: 0.5 }), paper: new THREE.MeshStandardMaterial({ color: '#fbf8ee', roughness: 0.9 }), green: new THREE.MeshStandardMaterial({ color: '#3a8a4a', roughness: 0.8 }), snow: new THREE.MeshStandardMaterial({ color: '#f4f8ff', roughness: 0.9 }) }; }
function mkProp(kind, n) {
  const M = propMats(), g = new THREE.Group(), S = n.sz;
  const cyl = (r1, r2, h, m, seg = 8) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);
  if (kind === 'rod') { const r = cyl(0.008, 0.016, 2.4, M.dark, 5); r.position.set(0, 1.2, 0); g.add(r); g.rotation.x = 0.9; const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2.4, 0), new THREE.Vector3(0, 0, 0)]), M.line); g.add(ln); g.userData.line = ln; const fl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), M.red); g.add(fl); g.userData.float = fl; }
  if (kind === 'broom') { const s = cyl(0.014, 0.014, 1.1, M.wood, 5); s.position.y = 0.55; g.add(s); const b = cyl(0.03, 0.12, 0.3, M.straw, 8); b.position.y = -0.1; g.add(b); }
  if (kind === 'can') { const b = cyl(0.08, 0.09, 0.16, M.tin, 10); g.add(b); const sp = cyl(0.012, 0.018, 0.22, M.tin, 5); sp.rotation.z = -1.0; sp.position.set(0.13, 0.04, 0); g.add(sp); const hd = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 4, 10, Math.PI), M.tin); hd.position.y = 0.08; g.add(hd); }
  if (kind === 'book') { const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.2), M.paper); g.add(b); const c = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.012, 0.21), M.green); c.position.y = -0.016; g.add(c); }
  if (kind === 'plank') { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 1.8), M.wood); g.add(p); }
  if (kind === 'umb') { const col = new THREE.Color(SCARF_COL[n.def.id] || '#4a8ad0'); const c = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.22, 8, 1, true), new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, side: THREE.DoubleSide })); c.position.y = 0.9; g.add(c); const s = cyl(0.01, 0.01, 0.9, M.dark, 4); s.position.y = 0.45; g.add(s); }
  if (kind === 'uchiwa') { const f = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), new THREE.MeshStandardMaterial({ color: '#f6f0e0', side: THREE.DoubleSide, map: txCanvas(64, 64, (x) => { x.fillStyle = '#f6f0e0'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#3a6ad8'; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(20 + k * 8, 40 - k * 6, 6, 0, 7); x.fill(); } x.fillStyle = '#e04050'; x.beginPath(); x.arc(42, 22, 8, 0, 7); x.fill(); }) })); f.position.y = 0.14; g.add(f); const h = cyl(0.008, 0.008, 0.12, M.wood, 4); h.position.y = 0.0; g.add(h); }
  g.scale.setScalar(S); g.visible = false; n.mesh.add(g); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g;
}
function propOf(n, kind) { n.props = n.props || {}; return n.props[kind] || (n.props[kind] = mkProp(kind, n)); }
function showProp(n, kind) { if (n.props) for (const [k, p] of Object.entries(n.props)) p.visible = k === kind || (Array.isArray(kind) && kind.includes(k)); if (kind) for (const k of [].concat(kind)) propOf(n, k).visible = true; }
// ---------- outfits (hats, beanies, scarves, festival fans) ----------
const YUKATA = ['#2a3a7a', '#f4e8f0', '#e86a8a', '#3a6a5a', '#f0d080', '#5a4a8a'];
function yukataTex(i) { const base = YUKATA[i % YUKATA.length]; return txCanvas(128, 128, (x) => { x.fillStyle = base; x.fillRect(0, 0, 128, 128); const R = mulberry(i + 3), dark = i % 2 === 0; for (let k = 0; k < 14; k++) { const cx = R() * 128, cy = R() * 128; x.fillStyle = dark ? (k % 2 ? '#f4f0e8' : '#f0a0c0') : (k % 2 ? '#3a5ab0' : '#e04a5a'); for (let q = 0; q < 5; q++) { const a = q / 5 * 6.283; x.beginPath(); x.ellipse(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, 4.5, 2.6, a, 0, 7); x.fill(); } x.fillStyle = '#f2c230'; x.beginPath(); x.arc(cx, cy, 2, 0, 7); x.fill(); } }, true); }
function wearYukata(n, on) {
  if (!n.cloth) { n.cloth = []; n.mesh.traverse(o => { if (o.isMesh && o.material && (o.material.name === 'top' || o.material.name === 'top2' || o.material.name === 'bottom') && !n.cloth.some(c => c.m === o.material)) n.cloth.push({ m: o.material, map: o.material.map, col: o.material.color.clone() }); }); }
  if (n._yu === on) return; n._yu = on; const idx = NPCS.indexOf(n); if (on && !n.yTex) n.yTex = yukataTex(idx < 0 ? 0 : idx);
  for (const c of n.cloth) { const had = !!c.m.map; c.m.map = on ? n.yTex : c.map; c.m.color.copy(on ? new THREE.Color('#ffffff') : c.col); if (had !== !!c.m.map) c.m.needsUpdate = true; }
}
function outfit(n) {
  const hf0 = currentHour(), fest = SEASON.active && SEASON.active.some(e => e.id === 'matsuri' || e.id === 'tanabata') && hf0 > 15.5; wearYukata(n, !!fest);
  const key = SEASON.key + (TIME.weather === 'snow' ? 's' : ''), id = n.def.id; if (n._fit === key) return; n._fit = key; const M = propMats();
  if (!n.fit) { const g = new THREE.Group(); n.mesh.add(g); n.fit = { g, hat: null, beanie: null, scarf: null };
    const S = n.headW, top = n.top; const cyl = (r1, r2, h, m, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);
    const hat = new THREE.Group(); const br = cyl(S * 0.85, S * 0.85, 0.018, M.straw, 20); hat.add(br); const cr = cyl(S * 0.42, S * 0.48, S * 0.34, M.straw); cr.position.y = S * 0.17; hat.add(cr); const rb = cyl(S * 0.49, S * 0.49, S * 0.09, M.red); rb.position.y = S * 0.06; hat.add(rb); hat.position.set(0, top - S * 0.22, 0.01); hat.rotation.x = -0.08; g.add(hat); n.fit.hat = hat;
    const bcol = new THREE.MeshStandardMaterial({ color: SCARF_COL[id] || '#888', roughness: 0.95 }); const bn = new THREE.Mesh(new THREE.SphereGeometry(S * 0.56, 14, 8, 0, 6.283, 0, 1.45), bcol); bn.position.set(0, top - S * 0.38, 0); const pom = new THREE.Mesh(new THREE.SphereGeometry(S * 0.13, 8, 6), M.snow); pom.position.y = S * 0.56; bn.add(pom); g.add(bn); n.fit.beanie = bn;
    const sc = new THREE.Mesh(new THREE.TorusGeometry(S * 0.34, S * 0.075, 6, 16), bcol); sc.rotation.x = Math.PI / 2; sc.position.set(0, n.neck, 0.0); const tail = new THREE.Mesh(new THREE.BoxGeometry(S * 0.14, S * 0.42, S * 0.04), bcol); tail.position.set(S * 0.14, n.neck - S * 0.2, S * 0.3); tail.rotation.z = 0.15; g.add(sc, tail); n.fit.scarf = [sc, tail];
    g.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
  const F = n.fit, sum = SEASON.key === 'summer' || (SEASON.key === 'spring' && SEASON.doy > md(5, 20)), win = SEASON.key === 'winter' || TIME.weather === 'snow' || SEASON.doy > md(11, 25);
  F.hat.visible = sum && !!SUMMER_HAT[id]; F.beanie.visible = win && !!BEANIE[id]; for (const s of F.scarf) s.visible = win;
}
// ---------- emote bubbles ----------
const EMO = {};
function emoTex(kind) {
  if (EMO[kind]) return EMO[kind];
  const t = txCanvas(128, 128, (x) => { x.clearRect(0, 0, 128, 128); x.fillStyle = 'rgba(255,255,255,0.95)'; x.strokeStyle = 'rgba(40,50,60,0.25)'; x.lineWidth = 3; x.beginPath(); x.roundRect(14, 10, 100, 84, 34); x.fill(); x.stroke(); x.beginPath(); x.moveTo(52, 92); x.lineTo(64, 112); x.lineTo(74, 92); x.fill();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (kind === 'note') { x.fillStyle = '#f07a2a'; x.font = '900 64px sans-serif'; x.fillText('♪', 62, 54); }
    if (kind === 'bang') { x.fillStyle = '#e0303a'; x.font = '900 70px sans-serif'; x.fillText('!', 64, 54); }
    if (kind === 'q') { x.fillStyle = '#3a7ad8'; x.font = '900 62px sans-serif'; x.fillText('?', 64, 54); }
    if (kind === 'dots') { x.fillStyle = '#5a6670'; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(40 + k * 24, 54, 8, 0, 7); x.fill(); } }
    if (kind === 'heart') { x.fillStyle = '#ef4a7a'; x.beginPath(); x.moveTo(64, 80); x.bezierCurveTo(20, 50, 34, 18, 64, 38); x.bezierCurveTo(94, 18, 108, 50, 64, 80); x.fill(); }
    if (kind === 'zzz') { x.fillStyle = '#5a6ad0'; x.font = '900 40px sans-serif'; x.fillText('Z', 46, 64); x.font = '900 30px sans-serif'; x.fillText('z', 72, 44); x.font = '900 22px sans-serif'; x.fillText('z', 90, 30); }
    if (kind === 'drop') { x.fillStyle = '#4aa0e0'; x.beginPath(); x.moveTo(64, 22); x.bezierCurveTo(90, 56, 86, 82, 64, 82); x.bezierCurveTo(42, 82, 38, 56, 64, 22); x.fill(); }
    if (kind === 'star') { x.fillStyle = '#f2b81a'; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 14 : 32; x.lineTo(64 + Math.cos(a) * r, 54 + Math.sin(a) * r); } x.fill(); }
    if (kind === 'fish') { x.fillStyle = '#3a8ad0'; x.beginPath(); x.ellipse(58, 54, 28, 14, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(82, 54); x.lineTo(100, 40); x.lineTo(100, 68); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(44, 50, 4, 0, 7); x.fill(); }
  });
  return EMO[kind] = t;
}
LIVE.emote = function (n, kind, dur = 2.4) {
  if (!n.emo) { n.emo = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false })); n.emo.renderOrder = 21; n.emo.scale.set(0.42, 0.42, 1); n.mesh.add(n.emo); }
  n.emo.material.map = emoTex(kind); n.emo.material.needsUpdate = true; n.emo.visible = true; n.emoT = dur; n.emoK = kind; n.emo.position.y = n.top + 0.5;
};
// floating speech line (overheard chats)
LIVE.say = function (n, text, dur = 3.2) {
  if (!n.sayS) { n.sayS = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false })); n.sayS.renderOrder = 22; n.mesh.add(n.sayS); }
  const [c, x] = cvs(512, 96); x.font = '800 30px "M PLUS Rounded 1c", sans-serif'; const w = Math.min(500, x.measureText(text).width + 44); x.fillStyle = 'rgba(255,255,255,0.94)'; x.beginPath(); x.roundRect((512 - w) / 2, 8, w, 64, 30); x.fill(); x.beginPath(); x.moveTo(246, 70); x.lineTo(256, 90); x.lineTo(268, 70); x.fill(); x.fillStyle = '#2b3a42'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 41);
  if (n.sayS.material.map) n.sayS.material.map.dispose(); n.sayS.material.map = toTex(c, false); n.sayS.material.needsUpdate = true; n.sayS.scale.set(2.2, 0.41, 1); n.sayS.position.y = n.top + 0.62; n.sayS.visible = true; n.sayT = dur; if (n.emo) n.emo.visible = false;
};
// ---------- per-villager behaviour ----------
function liveInit(n) {
  n.home0 = { x: n.hx, z: n.hz }; const vis0 = n.tag.visible; n.tag.visible = false; const hb = n.parts.head ? new THREE.Box3().setFromObject(n.parts.head, true) : null; const b = new THREE.Box3(); n.mesh.traverse(o => { if (o.isMesh && o.visible) b.expandByObject(o, true); }); n.tag.visible = vis0; n.top = (hb ? hb.max.y : b.max.y) - n.mesh.position.y;
  n.headW = hb ? Math.max(0.18, Math.min(0.5, (hb.max.x - hb.min.x) * 0.5)) : 0.25; n.neck = hb ? hb.min.y - n.mesh.position.y + 0.02 : n.top * 0.62; n.sz = Math.max(0.6, n.top / 1.25);
  const sh = n.parts.upperArmR ? new THREE.Vector3() : null; if (sh) { n.parts.upperArmR.getWorldPosition(sh); n.shoulder = { x: sh.x - n.mesh.position.x, y: sh.y - n.mesh.position.y }; } else n.shoulder = { x: 0.2, y: n.top * 0.55 };
  n.live = true; n.mode = 'idle'; n.actT = 0; n.stuck = 0;
}
function livePose(n, act, t) {
  const P = n.parts, rs = n.mesh.rotation.y, sx = Math.abs(n.shoulder.x), sy = n.shoulder.y, S = n.sz;
  if (!P.upperArmL) return;
  if (act === 'fish') { P.upperArmL.rotation.x = P.upperArmR.rotation.x = -1.0; P.upperArmL.rotation.z = 0.25; P.upperArmR.rotation.z = -0.25; P.foreArmL.rotation.x = P.foreArmR.rotation.x = -0.35; const rod = propOf(n, 'rod'); rod.position.set(0, sy - 0.12 * S, 0.32 * S); rod.rotation.set(0.95 + Math.sin(t * 1.3) * 0.03 + (n.bite > 0 ? -0.35 : 0), 0, 0);
    const ln = rod.userData.line, tipY = 2.4, depth = sy + 2.2; const L = ln.geometry.attributes.position; const fy = -(depth) / S; L.setXYZ(1, 0, tipY * 0.2 + fy * 0.2, 0.9 + (n.bite > 0 ? 0 : Math.sin(t) * 0.05)); L.needsUpdate = true; }
  if (act === 'sweep') { const s = Math.sin(t * 3.2); P.upperArmL.rotation.x = -0.5; P.upperArmR.rotation.x = -0.7; P.foreArmL.rotation.x = P.foreArmR.rotation.x = -0.6; P.spine.rotation.y = s * 0.35; const b = propOf(n, 'broom'); b.position.set(s * 0.12 * S, sy * 0.45, 0.34 * S); b.rotation.set(0.5, 0, s * 0.5); }
  if (act === 'water') { const tilt = (Math.sin(t * 0.8) > 0.2 ? 0.9 : 0.1); P.upperArmR.rotation.x = -0.9; P.foreArmR.rotation.x = -0.3; const c = propOf(n, 'can'); c.position.set(-sx, sy - 0.24 * S, 0.34 * S); c.rotation.set(0, Math.PI / 2, -tilt); P.head.rotation.x = 0.25; if (tilt > 0.5 && Math.random() < 0.08 && FX && FX.splash) { } }
  if (act === 'sketch') { P.upperArmL.rotation.x = -1.15; P.upperArmR.rotation.x = -0.95; P.foreArmL.rotation.x = -0.5; P.foreArmR.rotation.x = -0.6; P.foreArmR.rotation.z = Math.sin(t * 6) * 0.15; P.head.rotation.x = Math.sin(t * 0.4) > 0.5 ? -0.05 : 0.35; const bk = propOf(n, 'book'); bk.position.set(0, sy - 0.08 * S, 0.3 * S); bk.rotation.set(-0.7, 0, 0); }
  if (act === 'exercise') { const ph = (t * 0.55) % 4, k = Math.floor(ph), f = Math.sin((ph - k) * Math.PI); P.upperArmL.rotation.set(0, 0, 0); P.upperArmR.rotation.set(0, 0, 0);
    if (k === 0) { P.upperArmL.rotation.z = -2.9 * f; P.upperArmR.rotation.z = 2.9 * f; } else if (k === 1) { P.upperArmL.rotation.z = -1.5 * f; P.upperArmR.rotation.z = 1.5 * f; P.pelvis.position.y = n.rest.pelvis.y - 0.05 * f; } else if (k === 2) { P.upperArmL.rotation.x = P.upperArmR.rotation.x = -1.5 * f; } else { P.spine.rotation.z = Math.sin((ph - k) * 6.283) * 0.3; P.upperArmL.rotation.z = -2.6 * f; P.upperArmR.rotation.z = 0.3; } }
  if (act === 'look') { P.upperArmL.rotation.x = P.upperArmR.rotation.x = 0.35; P.foreArmL.rotation.x = P.foreArmR.rotation.x = -0.4; P.head.rotation.x = -0.12; P.head.rotation.y = Math.sin(t * 0.3) * 0.4; }
  if (act === 'carry') { P.upperArmR.rotation.z = 2.4; P.foreArmR.rotation.z = -1.2; const p = propOf(n, 'plank'); p.position.set(n.shoulder.x < 0 ? -sx * 0.7 : sx * 0.7, sy + 0.1 * S, 0); p.rotation.set(0, 0, 0); }
  if (act === 'umb' || n.rainy) { P.upperArmR.rotation.x = -0.75; P.upperArmR.rotation.z = 0.15; P.foreArmR.rotation.x = -0.9; const u = propOf(n, 'umb'); u.position.set(-sx * 0.4, sy - 0.15 * S, 0.18 * S); u.rotation.set(-0.08, 0, 0.05); }
  if (act === 'shop') { if (Math.sin(t * 0.7) > 0.85) { P.upperArmR.rotation.z = 2.5; P.foreArmR.rotation.z = Math.sin(t * 9) * 0.4; } }
  if (act === 'chat') { P.head.rotation.x = Math.max(0, Math.sin(t * 2.3)) * 0.12; if (Math.sin(t * 0.9) > 0.6) { P.upperArmL.rotation.x = -0.7; P.foreArmL.rotation.x = -0.9 - Math.sin(t * 5) * 0.2; } }
  if (act === 'snowman') { P.spine.rotation.x = 0.45; P.upperArmL.rotation.x = P.upperArmR.rotation.x = -1.2; P.foreArmL.rotation.x = P.foreArmR.rotation.x = -0.2 + Math.sin(t * 4) * 0.2; }
  if (act === 'festival') { P.upperArmR.rotation.x = -0.9; P.foreArmR.rotation.x = -1.1; P.foreArmR.rotation.z = Math.sin(t * 7) * 0.5; const u = propOf(n, 'uchiwa'); u.position.set(-sx * 0.6, sy + 0.05 * S, 0.22 * S); u.rotation.set(0, Math.sin(t * 7) * 0.5, 0); }
}
const PROP_OF = { fish: 'rod', sweep: 'broom', water: 'can', sketch: 'book', carry: 'plank', umb: 'umb' };
LIVE.snowmen = {};
function makeSnowman(x, z) { const M = propMats(), g = new THREE.Group(), y = groundH(x, z); for (const [r, h] of [[0.42, 0.36], [0.3, 0.92]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), M.snow); s.position.y = h; s.castShadow = true; g.add(s); } const e = new THREE.MeshStandardMaterial({ color: '#202020' }); for (const sx of [-0.09, 0.09]) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), e); d.position.set(sx, 1.0, 0.27); g.add(d); } const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 6), new THREE.MeshStandardMaterial({ color: '#f07a20' })); nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.94, 0.33); g.add(nose); const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.2, 10), M.red); bucket.position.y = 1.27; g.add(bucket); g.position.set(x, y, z); scene.add(g); g.scale.setScalar(0.05); return g; }
function liveVillager(n, dt) {
  if (!n.live) liveInit(n); const t = LIVE.t + n.ph * 3, hf = currentHour(); outfit(n);
  if (n.emoT > 0) { n.emoT -= dt; if (n.emoT <= 0 && n.emo) n.emo.visible = false; } if (n.sayT > 0) { n.sayT -= dt; if (n.sayT <= 0 && n.sayS) n.sayS.visible = false; }
  const E = LIVE.entry(n, hf); if (E.place !== n.place || E.act !== n.act0) { n.place = E.place; n.act0 = E.act; n.goal = LIVE.place(n, E.place) || LIVE.place(n, 'home'); n.mode = 'travel'; n.stuck = 0; n.wander = null; if (E.act !== 'sleep' && n.asleep) { n.asleep = false; n.mesh.visible = true; } }
  const act = E.act, dP = Math.hypot(PL.x - n.x, PL.z - n.z), G0 = n.goal; n.tag.visible = dP < 9 && !n.asleep; n.rainy = (TIME.weather === 'rain' || TIME.weather === 'storm') && !GAME.inside;
  if (n.asleep) { if (dP < 6 && Math.random() < dt * 0.2) LIVE.emote(n, 'zzz', 2); return; }
  let spd = 0; const walkTo = (tx, tz, v) => { const dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz); if (d < 0.35) return true; const want = Math.atan2(dx, dz);
    for (const off of [0, 0.6, -0.6, 1.2, -1.2, 1.9, -1.9]) { const a = want + off, nx = n.x + Math.sin(a) * v * dt, nz = n.z + Math.cos(a) * v * dt; if (Math.hypot(PL.x - nx, PL.z - nz) < 0.7) return false; if (canWalk(n.x, n.z, nx, nz) && !hitsAnyBld(nx, nz)) { n.rot = angLerp(n.rot, a, Math.min(1, dt * 6)); n.x = nx; n.z = nz; spd = v; if (off) n.stuck += dt * 0.5; else n.stuck = Math.max(0, n.stuck - dt); return false; } }
    n.stuck += dt; return false; };
  const tele = (x, z) => { n.x = x; n.z = z; n.y = groundH(x, z); n.stuck = 0; };
  if (dP < 2.3 && !PL.veh && n.mode !== 'travel' && act !== 'fish' && act !== 'exercise') { n.rot = angLerp(n.rot, Math.atan2(PL.x - n.x, PL.z - n.z), Math.min(1, dt * 6)); if (!n.greeted0) { n.greeted0 = true; n.greeted = 1.2; const f = GAME.p ? GAME.p.friend[n.def.id] || 0 : 0; LIVE.emote(n, f >= 8 ? 'heart' : f >= 3 ? 'note' : 'bang', 1.8); } }
  else if (dP > 4) n.greeted0 = false;
  if (n.mode === 'travel' && G0) {
    const d = Math.hypot(G0.x - n.x, G0.z - n.z), far = dP > 45;
    if (d > 70 && far) tele(G0.x + (Math.random() - 0.5) * 2, G0.z + (Math.random() - 0.5) * 2);
    else if (walkTo(G0.x, G0.z, d > 20 ? 2.4 : 1.6) || d < 0.5) { n.mode = 'act'; n.actT = 0; }
    if (n.stuck > 1.6 && (far || n.stuck > 9)) tele(G0.x, G0.z);
  } else if (G0) {
    n.actT += dt; const a = act;
    if (a === 'sleep') { n.asleep = true; n.mesh.visible = false; if (n.emo) n.emo.visible = false; return; }
    if (a === 'stroll' || a === 'umb' || a === 'play' || a === 'carry' || a === 'water') {
      const R = a === 'play' ? 4 : a === 'carry' ? 5 : a === 'water' ? 2.5 : 7;
      if (!n.wander || n.wanderT < 0) { if (a === 'play') { n.wa = (n.wa || 0) + 0.9; n.wander = { x: G0.x + Math.cos(n.wa) * R, z: G0.z + Math.sin(n.wa) * R }; n.wanderT = 6; } else if (a === 'carry') { n.cflip = !n.cflip; n.wander = { x: G0.x + (n.cflip ? R : -R) * 0.7, z: G0.z + (n.cflip ? 2 : -2) }; n.wanderT = 12; } else { const s = spotNear(G0.x, G0.z, R, Math.random() * 1e6); n.wander = s || G0; n.wanderT = a === 'water' ? 4 + Math.random() * 3 : 6 + Math.random() * 10; } }
      n.wanderT -= dt; if (n.wander && !walkTo(n.wander.x, n.wander.z, a === 'play' ? 4.2 : 1.4)) { if (n.stuck > 2) { n.wander = null; n.stuck = 0; } } else if (n.wander && a !== 'play') { n.wanderT = Math.min(n.wanderT, a === 'water' ? n.wanderT : 3 + Math.random() * 4); if (a === 'water') spd = 0; }
      if (a === 'play' && Math.random() < dt * 0.15) LIVE.emote(n, 'note', 1.6);
    } else {
      if (G0.face !== null && G0.face !== undefined && (a === 'fish' || a === 'look' || a === 'sketch')) n.rot = angLerp(n.rot, G0.face, Math.min(1, dt * 3)); else if (a === 'shop' && PLACED.shop) n.rot = angLerp(n.rot, PLACED.shop.rot, Math.min(1, dt * 3));
      if (a === 'exercise') { const P = SEASON.findPlaza(); n.rot = angLerp(n.rot, Math.atan2(P.x - n.x, P.z - n.z), Math.min(1, dt * 3)); }
      if (a === 'fish') { n.fishT = (n.fishT === undefined ? 8 + Math.random() * 20 : n.fishT) - dt; if (n.fishT < 0 && !(n.bite > 0)) { n.bite = 1.6; LIVE.emote(n, 'bang', 1.2); } if (n.bite > 0) { n.bite -= dt; if (n.bite <= 0) { n.fishT = 15 + Math.random() * 35; const got = Math.random() < 0.55; LIVE.emote(n, got ? 'fish' : 'drop', 2.2); if (got && dP < 16 && Math.random() < 0.5) LIVE.say(n, CATCH_SAY[Math.floor(Math.random() * CATCH_SAY.length)]); } } }
      if (a === 'snowman') { const k = n.def.id + SEASON.doy; let sm = LIVE.snowmen[k]; if (!sm) { sm = LIVE.snowmen[k] = makeSnowman(G0.x + Math.sin(n.rot) * 0.9, G0.z + Math.cos(n.rot) * 0.9); } sm.scale.setScalar(Math.min(1, 0.05 + n.actT / 40)); n.rot = angLerp(n.rot, Math.atan2(sm.position.x - n.x, sm.position.z - n.z), Math.min(1, dt * 3)); }
    }
  }
  const pa = SEASON.active && SEASON.active.some(e => e.id === 'matsuri' || e.id === 'tanabata') && hf > 17 && hf < 22 && act !== 'sleep' && n.mode === 'act' && (act === 'chat' || act === 'look' || act === 'stroll');
  const shown = n.mode === 'travel' ? (n.rainy ? 'umb' : act === 'carry' ? 'plank' : null) : pa ? 'uchiwa' : act === 'umb' || (n.rainy && act !== 'sleep') ? 'umb' : PROP_OF[act] || null; showProp(n, shown);
  if (n.greeted > 0) n.greeted -= dt;
  n.ph += dt * (spd > 0.1 ? (spd > 3 ? 11 : 8.5) : 1.8); n.y = lerp(n.y, groundH(n.x, n.z), Math.min(1, dt * 12)); n.mesh.position.set(n.x, n.y, n.z); n.mesh.rotation.y = n.rot;
  animateBody(n.parts, n.rest, n.ph, spd, dt, { wave: n.greeted > 0 ? n.greeted : 0, nod: 0 }); if (n.parts.head) n.parts.head.rotation.y = 0; if (n.parts.spine) n.parts.spine.rotation.z = 0;
  if (spd < 0.1 && n.mode === 'act') livePose(n, pa ? 'festival' : n.rainy && act !== 'umb' ? 'umb' : act, t); else if (n.rainy || shown === 'plank') livePose(n, shown === 'plank' ? 'carry' : 'umb', t);
}
const CATCH_SAY = ['おっ、釣れた！', 'やった〜！ いい型だ！', 'きょうは食いがいいね', 'あ〜、逃げられた…', 'ふふ、晩ごはんゲット！'];
// overheard chats between villagers standing together
const CHATS = [['きょうもいい天気だね', 'ほんと、洗たく物がよくかわくよ'], ['港に新しい船が来てたよ', 'へえ、見に行ってみようかな'], ['{P}さん、がんばってるよね', 'うん、島がどんどん元気になってる！'], ['夕焼け、見た？', '見た見た！ ピンク色だったね'], ['お店に新しいの入ったって', 'あとでのぞいてみる！'], ['みかん、ことしは甘いらしいよ', 'たのしみだな〜'], ['おなかすいたね', 'お昼、なににしようか'], ['昨日の夜、流れ星見えたんだ', 'え、いいなあ！ おねがいした？'], ['雨のあとは虫の声がよくひびくね', 'ね、なんだか落ち着くよね'], ['また島のお祭りやりたいな', 'みんなで準備しようよ！']];
function liveChats(dt) {
  LIVE.chatCd -= dt; if (LIVE.chatCd > 0) return; LIVE.chatCd = 2;
  const idle = NPCS.filter(n => n.live && n.mode === 'act' && !n.asleep && (n.act0 === 'chat' || n.act0 === 'look' || n.act0 === 'stroll' || n.act0 === 'shop') && Math.hypot(PL.x - n.x, PL.z - n.z) < 16 && !(n.sayT > 0));
  for (let i = 0; i < idle.length; i++) for (let j = i + 1; j < idle.length; j++) { const a = idle[i], b = idle[j]; if (Math.hypot(a.x - b.x, a.z - b.z) > 6 || (a.chatCd > LIVE.t) || (b.chatCd > LIVE.t)) continue;
    const L = CHATS[Math.floor(Math.random() * CHATS.length)], F = s => GAME.fill(s); a.chatCd = b.chatCd = LIVE.t + 40 + Math.random() * 30; a.rot = Math.atan2(b.x - a.x, b.z - a.z); b.rot = Math.atan2(a.x - b.x, a.z - b.z);
    LIVE.say(a, F(L[0])); setTimeout(() => LIVE.say(b, F(L[1])), 2600); return; }
}
// ---------- richer talk ----------
const TALK = {
  v_mio: { morning: ['おはよう、{P}さん！ 朝の海って、キラキラしててねむけがとぶよね。', '朝ごはん食べた？ わたしはパンとみかん！'], noon: ['お昼の海、色がいちばん青いんだ。見てて〜。', 'おなかすいたね。港の食堂、ちょっと気になってるんだ。'], evening: ['夕方の灯台、オレンジ色にそまってて好きなんだ。', 'もうすぐ灯台に灯がともるよ。'], night: ['夜の海って、ちょっとこわいけど…灯台があるから安心。', '星、よく見えるね。{I}島の夜空は自まんなの。'], rain: ['雨の海もいいけど、灯台がかすんで見えるとちょっとさみしいな。', 'カサ、かわいいでしょ？ お気に入りなんだ。'], snow: ['雪の灯台…絵はがきみたい！', 'さむいね〜！ マフラー、あったかいよ。'],
    sketch: ['灯台をかいてるの。…あんまり見ないで、はずかしい！', 'この角度の灯台がいちばんかっこいいんだよ。'], exercise: ['いち、に、さん、し！ …ラジオ体操、毎朝の日課なんだ。'], look: ['船が出ていくの、ずっと見ちゃうんだよね。'],
    hi: ['{P}さんと話してると、なんだか元気が出るんだ。ほんとだよ？', 'ねえ、こんど一緒に灯台までおさんぽしよ！'] },
  v_sora: { morning: ['よっ、{P}！ 朝イチの釣りは最高だぜ！', '早起きは三文の得ってな！'], noon: ['昼は暑いな〜。日かげで休もうぜ。', '腹へった〜！'], evening: ['夕まずめってのは魚がよく釣れる時間なんだぜ。', 'きょうも一日おつかれ！'], night: ['夜ふかしはほどほどにな！ …オレもだけど。', '夜の港、ちょっと冒険っぽくてワクワクする！'], rain: ['雨か〜。釣りはおあずけだな。', '雨の日は、家でルアーの手入れしてるんだ。'], snow: ['雪だー！ 雪合戦しようぜ！', 'さみぃ〜！ でもテンション上がるな！'],
    fish: ['シーッ、いま魚がよってきてるとこ！', 'ここ、アジの通り道なんだぜ。ナイショな！'], play: ['砂浜ダッシュ！ {P}もやるか？', '負けないぜー！'], exercise: ['体操で目をさますのが、オレ流！'],
    hi: ['{P}、おまえ最高の相棒だぜ！', 'こんどオレのひみつの釣り場、教えてやるよ。'] },
  v_hana: { morning: ['おはようございます、{P}さん。朝つゆの花、きれいでしょう？', '朝のうちに水やりをすませるの。お花も涼しいほうがうれしいから。'], noon: ['お日さまをいっぱい浴びて、花がのびのびしてるわ。', 'お茶でもいかが？ …なんて、ここ外だったわね。'], evening: ['夕方の風は、花の香りをはこんでくれるの。', 'きょうも一日、おつかれさまでした。'], night: ['夜に咲く花もあるのよ。月見草っていうの。', 'もう遅いから、気をつけて帰ってね。'], rain: ['雨は花にとってのごちそうなのよ。', 'あじさいは雨の日がいちばんきれい。'], snow: ['雪の下でも、球根はちゃんと春を待っているの。', '椿の赤が、雪によくはえるわね。'],
    water: ['たっぷりお水をあげると、ちゃんと応えてくれるの。', 'この子たち、{P}さんにあいさつしてるみたい。'], look: ['教会の花だんもお手入れしてるの。'],
    hi: ['{P}さんがいると、島がもっと好きになるわ。', 'こんど、{P}さんの家にもお花を持っていくわね。'] },
  v_gen: { morning: ['おう{P}、早いのう。わしはもう一仕事してきたぞ。', '朝の海は正直じゃ。風と潮を読むんじゃよ。'], noon: ['昼は網の手入れじゃ。漁師は陸でも忙しいんじゃよ。', '若いもんはええのう、元気があって。'], evening: ['夕焼けの次の日は晴れる、むかしからそう言うての。', 'きょうの海もおだやかじゃった。'], night: ['わしはもう寝るぞ。漁師の朝は早いからの。'], rain: ['雨の日は無理をせん。海をなめたらいかん。', '雨音を聞きながら一杯…いや、お茶じゃよ。'], snow: ['雪か…わしの若いころはもっと積もったもんじゃ。'],
    fish: ['しっ…あたりを待っとるところじゃ。', '釣りはの、待つのも楽しみのうちじゃ。'], look: ['あの船も、もう何十年もの付き合いじゃ。'],
    hi: ['{P}、おまえさんが来てから島が明るうなった。礼を言うぞ。', 'わしの漁師の技、少しずつおまえさんに教えてやろう。'] },
  v_rin: { morning: ['おはよう！ 教会の前、きれいにしておいたよ。', '朝の島って、空気がすんでて大好き。'], noon: ['{I}島の人口、少しずつ増えてるんだって！', '集会所の掲示板、新しいお知らせはってきたよ。'], evening: ['ステンドグラスに夕日がさしこむ時間、見てほしいな。', 'きょうもいい一日だったね。'], night: ['見晴らしの丘から星を見るのが好きなの。', '夜の教会、窓が光ってきれいでしょ。'], rain: ['雨の日は、集会所で本を読んでるの。'], snow: ['雪の教会、まるでクリスマスカードみたい。'],
    sweep: ['ほうきでサッサッ。きれいになると気持ちいいよね。', 'みんなが使う場所だから、大事にしたいんだ。'], look: ['この島、もっともっとにぎやかにしたいな。'],
    hi: ['{P}さんが来てくれて、ほんとうによかった。島のみんなもそう言ってるよ。', 'いつか{I}島を、日本一すてきな島にしようね。'] },
  v_kai: { morning: ['いらっしゃいませ〜！ …あ、まだ開店前だった！', 'きょうの目玉商品はね…ヒミツ！'], noon: ['お昼どきはお客さんが多くて大いそがし！', '自販機の補充、ぼくの担当なんだ。'], evening: ['そろそろ閉店準備だ〜。', 'きょうの売り上げ、まあまあかな！'], night: ['夜は帳簿づけ。数字はちょっと苦手…'], rain: ['雨の日はカサがよく売れるんだよ！', 'お客さん少なくてひまだな〜。'], snow: ['雪の日は肉まんが売れるんだ！'],
    shop: ['いらっしゃいませ〜！ ゆっくり見ていってね！', 'お店でなにか買っていく？'], sweep: ['店の前はお店の顔だからね！'],
    hi: ['{P}さんは常連さんだから、こっそりおまけしちゃうよ。', '将来はもっと大きなお店にしたいんだ！'] },
  _: { morning: ['おはようございます、{P}さん！', '朝の島はすがすがしいね。'], noon: ['こんにちは、{P}さん。', 'いい日だね。'], evening: ['夕焼けがきれいだね。', 'きょうもおつかれさま！'], night: ['こんばんは。夜の島もいいね。'], rain: ['雨だね〜。'], snow: ['雪だ！ さむいね。'], fish: ['いま、いいところなの！', '大物の予感…！'], sketch: ['この景色、絵にしたくなるでしょ？'], carry: ['よいしょ、よいしょっす！ 材木運びは修行っす！'], play: ['まてまて〜！'], hi: ['{P}さん、いつもありがとう！'] },
};
const QUIZ = {
  v_mio: [{ q: 'ねえ{P}さん、海と山、どっちが好き？', a: [['海！', 'だよね！ さすが{P}さん、わかってる〜！', 2], ['山かな', 'そっか〜、山もいいよね。見晴らしの丘とか！', 1]] }, { q: '灯台の光って、何色に見える？', a: [['白', 'うんうん、まっ白でまぶしいよね。', 1], ['オレンジ', '夕方はたしかにオレンジっぽいかも！ よく見てるね〜。', 2]] }],
  v_sora: [{ q: '{P}、釣りでいちばん大事なのはなんだと思う？', a: [['根気', 'わかってるじゃん！ 待つのも腕のうちだぜ。', 2], ['道具', 'まあな、いいサオは大事だ！', 1], ['運', 'はは、たしかに運もあるな！', 1]] }],
  v_hana: [{ q: '{P}さんは、どんなお花が好き？', a: [['ひまわり', '元気が出るお花ね。{P}さんらしいわ。', 1], ['さくら', '春がまちどおしくなるわね。', 1], ['どれも好き', 'うふふ、わたしもよ。うれしいわ。', 2]] }],
  v_gen: [{ q: '{P}よ、海でいちばんこわいものはなんじゃと思う？', a: [['大きな波', 'うむ。じゃが一番こわいのは、海をなめる心じゃ。', 1], ['油断', 'ほう…ようわかっとるのう。その通りじゃ。', 2]] }],
  v_rin: [{ q: '島にあったらいいなって思う場所、ある？', a: [['学校', 'わたしもそう思う！ 子どもの声がする島っていいよね。', 2], ['温泉', '温泉！ のんびりできそう〜。', 1], ['大きな橋', '本土とつながったら、便利になるね！', 1]] }],
  v_kai: [{ q: 'お店で売れたらいいなって思うもの、なにかある？', a: [['みかんジュース', 'それいい！ 島のみかんでつくろう！', 2], ['釣りえさ', 'たしかに！ 釣り人が多い島だもんね。', 1]] }],
  _: [{ q: '{I}島での暮らし、どう？', a: [['最高！', 'よかった！ わたしも毎日たのしいよ。', 2], ['まだ慣れない', 'ゆっくりでいいんだよ。', 1]] }],
};
function tierOf(f) { return f >= 12 ? 3 : f >= 7 ? 2 : f >= 3 ? 1 : 0; }
LIVE.talkPages = function (n) {
  const p = GAME.p, id = n.def.id, T = TALK[id] || TALK._, hf = currentHour(), F = s => GAME.fill(s), pick = a => a[Math.floor(Math.random() * a.length)];
  const f = p.friend[id] || 0, act = n.mode === 'act' ? n.act0 : null, pages = [];
  const ctx = TIME.weather === 'snow' ? 'snow' : TIME.weather === 'rain' || TIME.weather === 'storm' ? 'rain' : hf < 10 && hf >= 4 ? 'morning' : hf < 16 ? 'noon' : hf < 19 ? 'evening' : 'night';
  const pool = []; if (act && T[act]) pool.push(...T[act], ...T[act]); if (T[ctx]) pool.push(...T[ctx]); else if (TALK._[ctx]) pool.push(...TALK._[ctx]); if (f >= 7 && T.hi) pool.push(...T.hi);
  if (pool.length) pages.push(F(pick(pool)));
  // once a day: a question with choices
  p.daily.qa = p.daily.qa || {}; const Q = QUIZ[id] || QUIZ._;
  if (!p.daily.qa[id] && Math.random() < 0.45) { p.daily.qa[id] = 1; p.qaN = p.qaN || {}; const q = Q[(p.qaN[id] = (p.qaN[id] || 0) + 1) % Q.length]; pages.push(F(q.q)); return { pages, choices: q.a.map(([t, r, pts]) => ({ t, f: () => { p.friend[id] = (p.friend[id] || 0) + pts; GAME.dirty = true; DIALOG.chose = true; DIALOG.choices = null; DIALOG.pages = [F(r)]; DIALOG.i = 0; UI.dialog(n.def.name, DIALOG.pages[0]); LIVE.emote(n, pts > 1 ? 'heart' : 'note', 2); if (pts > 1) UI.toast(`💗 ${n.def.name}となかよし +${pts}`); } })) }; }
  // good friends sometimes share something
  p.daily.share = p.daily.share || {};
  if (f >= 6 && !p.daily.share[id] && Math.random() < 0.3) { p.daily.share[id] = 1; const b = GAME.bag(); const r = Math.random();
    if (r < 0.5) { b.mikan += 3; pages.push(F('そうだ、これ、おすそわけ！ みかん3つ、もらってくれる？')); setTimeout(() => UI.toast('🍊 みかんを3つもらった'), 300); } else { p.money += 500; pages.push(F('いつもありがとう。これ、ほんの気持ち。…おこづかいだよ！')); setTimeout(() => UI.toast('💰 500円もらった'), 300); }
    LIVE.emote(n, 'heart', 2.5); GAME.dirty = true; }
  return { pages };
};
// ---------- hooks ----------
{ const _sv = startTalk; startTalk = function (n) {
    _sv(n); if (!GAME.p || n.visitor || DIALOG.npc !== n || !DIALOG.pages) return;
    // only the plain filler line is replaced — story, requests, milestones and event lines stay as they are
    const fillerIdx = DIALOG.pages.findIndex(pg => n.def.lines.some(l => GAME.fill(l) === pg));
    if (fillerIdx >= 0) { const r = LIVE.talkPages(n); DIALOG.pages.splice(fillerIdx, 1, ...r.pages); DIALOG.i = 0; UI.dialog(n.def.name, DIALOG.pages[0]); if (r.choices) DIALOG.choices = r.choices.concat(DIALOG.choices && DIALOG.choices[0] && DIALOG.choices[0].t.includes('プレゼント') ? [DIALOG.choices[0]] : []); }
    if (n.live) LIVE.emote(n, tierOf(GAME.p.friend[n.def.id] || 0) >= 2 ? 'heart' : 'note', 1.4);
  }; }
{ const _nv = nearVillager; nearVillager = function () { const n = _nv(); return n && n.asleep ? null : n; }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); LIVE.t += dt || 0; try { if (GAME.p) liveChats(dt || 0.016); for (const k of Object.keys(LIVE.snowmen)) { const s = LIVE.snowmen[k]; if (TIME.weather !== 'snow' && SEASON.snow < 0.2) { s.scale.multiplyScalar(Math.pow(0.2, dt || 0.016)); if (s.scale.x < 0.06) { scene.remove(s); delete LIVE.snowmen[k]; } } } } catch (e) { if (!LIVE._err) { LIVE._err = 1; console.warn('lively', e); } } return r; }; }
// what each villager is up to (for the people tab)
LIVE.status = function (id) { const n = NPCS.find(q => q.def.id === id); if (!n || !n.live) return ''; if (n.asleep) return '💤 おやすみ中'; const pl = { home: '家のあたり', garden: '家の庭', plaza: '広場', shop: 'お店', hall: '集会所', church: '教会', lighthouse: '灯台', peak: '見晴らしの丘', beach: '浜', flowers: '花畑', farm: '田んぼ', falls: '滝', river: '川', harbor: '港' }[n.place] || ''; const a = n.mode === 'travel' ? '移動中' : ACT_NAME[n.act0 === 'umb' ? 'umb' : (n.rainy && WET_ACTS[n.act0]) ? 'umb' : n.act0] || ''; return `📍${pl}で${a}`; };
