// ===================== BUG CATCHING: seasonal / time-of-day bugs, net, zukan, selling, gifts =====================
// env: tree (on trunks), flower, grass, water (rivers, ponds, paddies), beach.  kind: fly / dart / hover / glow / hop / crawl / trunk
const BUGS = [
  { id: 'monshiro', name: 'モンシロチョウ', st: 1, p: 80, env: ['flower', 'grass'], kind: 'fly', from: [3, 1], to: [6, 30], h: [6, 17], col: ['#fbfbf4', '#3a3a3a'], note: '春の野原をひらひら。キャベツ畑が大好き。' },
  { id: 'kichou', name: 'キチョウ', st: 1, p: 90, env: ['grass', 'flower'], kind: 'fly', from: [3, 15], to: [11, 15], h: [7, 17], col: ['#ffe03a', '#a08a10'], note: 'あざやかな黄色の小さなチョウ。' },
  { id: 'shijimi', name: 'ヤマトシジミ', st: 1, p: 100, env: ['grass'], kind: 'fly', from: [4, 1], to: [10, 31], h: [8, 16], col: ['#8aa8f0', '#5a6ab0'], small: true, note: '道ばたでよく見る、うす青のチョウ。' },
  { id: 'ageha', name: 'アゲハチョウ', st: 2, p: 260, env: ['flower', 'tree'], kind: 'fly', from: [4, 10], to: [9, 30], h: [7, 16], col: ['#fff2a0', '#2a2a2a'], big: true, note: 'みかんの葉にたまごを産む、島の人気者。' },
  { id: 'kuroageha', name: 'クロアゲハ', st: 3, p: 700, env: ['tree', 'flower'], kind: 'fly', from: [5, 1], to: [9, 15], h: [8, 15], col: ['#2a2a34', '#c83a4a'], big: true, note: 'うす暗い林を、ゆったり飛ぶ大きなチョウ。' },
  { id: 'mitsubachi', name: 'ミツバチ', st: 1, p: 80, env: ['flower'], kind: 'fly', from: [3, 10], to: [10, 20], h: [8, 16], col: ['#e8b020', '#2a2018'], bee: true, note: '花から花へ、せっせとみつ集め。' },
  { id: 'shiokara', name: 'シオカラトンボ', st: 1, p: 130, env: ['water'], kind: 'dart', from: [5, 20], to: [9, 10], h: [7, 17], col: ['#7aa8d8', '#2a3a4a'], note: '水辺のパトロール係。' },
  { id: 'akiakane', name: 'アキアカネ', st: 1, p: 120, env: ['grass', 'water'], kind: 'dart', from: [9, 1], to: [11, 20], h: [8, 17], col: ['#e8402a', '#8a2010'], note: '秋の空をうめつくす赤とんぼ。' },
  { id: 'oniyanma', name: 'オニヤンマ', st: 3, p: 900, env: ['water'], kind: 'dart', from: [7, 1], to: [9, 20], h: [9, 16], col: ['#2a2a20', '#e8d040'], big: true, note: '日本一大きなトンボ。川の上を行ったり来たり。' },
  { id: 'hotaru', name: 'ゲンジボタル', st: 3, p: 1000, env: ['water'], kind: 'glow', from: [5, 28], to: [7, 10], h: [19.3, 23], col: ['#d8ff60', '#2a2a2a'], note: 'きれいな川にしかすめない光の虫。' },
  { id: 'aburazemi', name: 'アブラゼミ', st: 1, p: 150, env: ['tree'], kind: 'trunk', from: [7, 10], to: [9, 15], h: [6, 18], col: ['#6a4a2a', '#3a2a1a'], note: 'ジージー。夏の島のBGM担当。' },
  { id: 'minmin', name: 'ミンミンゼミ', st: 2, p: 230, env: ['tree'], kind: 'trunk', from: [7, 20], to: [9, 10], h: [7, 16], col: ['#3a6a4a', '#1a2a1a'], note: 'ミーンミンミン…と鳴く、すき通った羽のセミ。' },
  { id: 'higurashi', name: 'ヒグラシ', st: 2, p: 320, env: ['tree'], kind: 'trunk', from: [7, 10], to: [9, 15], h: [16.5, 19.5], col: ['#8a6a3a', '#3a2a1a'], note: 'カナカナカナ…夕暮れどきに鳴く。' },
  { id: 'kanabun', name: 'カナブン', st: 1, p: 120, env: ['tree'], kind: 'trunk', from: [6, 10], to: [8, 31], h: [8, 18], col: ['#3a8a3a', '#2a5a2a'], note: '木の汁が大好き。光るみどり色。' },
  { id: 'kabuto', name: 'カブトムシ', st: 3, p: 1300, env: ['tree'], kind: 'trunk', from: [7, 1], to: [8, 31], h: [19, 5], col: ['#4a2a18', '#2a1408'], horn: true, big: true, note: '夜のクヌギの木に集まる、虫の王様。' },
  { id: 'nokogiri', name: 'ノコギリクワガタ', st: 3, p: 1500, env: ['tree'], kind: 'trunk', from: [6, 20], to: [8, 31], h: [19, 5], col: ['#6a2a14', '#2a1008'], jaw: true, note: 'ギザギザの大あごがかっこいい。' },
  { id: 'miyama', name: 'ミヤマクワガタ', st: 4, p: 3600, env: ['tree'], kind: 'trunk', from: [7, 10], to: [8, 25], h: [19, 4], col: ['#5a3a1a', '#2a1a0a'], jaw: true, big: true, note: '山の上のほうにすむ、あこがれのクワガタ。' },
  { id: 'tamamushi', name: 'タマムシ', st: 4, p: 4200, env: ['tree'], kind: 'trunk', from: [7, 15], to: [8, 20], h: [10, 14], col: ['#2ad08a', '#c83af0'], note: '虹色に光る、幸運の虫。' },
  { id: 'tentou', name: 'ナナホシテントウ', st: 1, p: 60, env: ['flower', 'grass'], kind: 'crawl', from: [3, 10], to: [6, 30], h: [7, 17], col: ['#e0201a', '#1a1a1a'], small: true, note: 'てんとう虫のサンバ…ではなく、アブラムシ退治の名人。' },
  { id: 'batta', name: 'トノサマバッタ', st: 1, p: 160, env: ['grass'], kind: 'hop', from: [7, 1], to: [10, 31], h: [8, 17], col: ['#6a9a3a', '#4a6a2a'], note: 'ぴょーんと大ジャンプ。' },
  { id: 'kamakiri', name: 'オオカマキリ', st: 2, p: 380, env: ['grass', 'flower'], kind: 'crawl', from: [8, 10], to: [11, 15], h: [8, 17], col: ['#7ab04a', '#4a7a2a'], big: true, note: 'カマをかまえて、えものを待つ。' },
  { id: 'korogi', name: 'エンマコオロギ', st: 1, p: 110, env: ['grass'], kind: 'hop', from: [8, 10], to: [11, 20], h: [17, 5], col: ['#3a2a1a', '#1a120a'], small: true, note: 'コロコロリー。秋の夜の歌い手。' },
  { id: 'suzumushi', name: 'スズムシ', st: 2, p: 420, env: ['grass'], kind: 'hop', from: [8, 15], to: [10, 20], h: [18, 4], col: ['#2a2418', '#d8c890'], small: true, note: 'リーンリーン。むかしから飼われてきた音色。' },
  { id: 'yadokari', name: 'ヤドカリ', st: 1, p: 100, env: ['beach'], kind: 'crawl', from: [1, 1], to: [12, 31], h: [0, 24], col: ['#d89a6a', '#e05a3a'], shell: true, note: '貝がらをおうちにして、浜をてくてく。' },
  { id: 'funamushi', name: 'フナムシ', st: 1, p: 50, env: ['beach'], kind: 'crawl', from: [4, 1], to: [10, 31], h: [5, 20], col: ['#5a5a5a', '#3a3a3a'], small: true, fast: true, note: '港の岩場をシャカシャカ。すばしっこい。' },
];
const BUG_CAP = 20;
const BUG = { list: [], t: 0, spawnT: 0, swing: 0, cool: 0, mats: {} };
function bugActive(B, doy, hf) { if (!inDoy(doy, md(...B.from), md(...B.to))) return false; const [a, b] = B.h; return a < b ? hf >= a && hf < b : hf >= a || hf < b; }
// ---------- meshes ----------
function bugMat(col, extra = {}) { const k = col + JSON.stringify(extra); return BUG.mats[k] || (BUG.mats[k] = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, ...extra })); }
function wingTex(B) { const k = 'w' + B.id; if (BUG.mats[k]) return BUG.mats[k]; return BUG.mats[k] = txCanvas(64, 64, (x) => { x.clearRect(0, 0, 64, 64); x.fillStyle = B.col[0]; x.beginPath(); x.moveTo(2, 34); x.bezierCurveTo(6, 2, 52, 0, 60, 18); x.bezierCurveTo(62, 30, 40, 34, 30, 36); x.bezierCurveTo(48, 40, 56, 58, 40, 62); x.bezierCurveTo(22, 62, 8, 50, 2, 34); x.fill(); x.fillStyle = B.col[1]; x.beginPath(); x.arc(44, 14, 5, 0, 7); x.fill(); x.fillRect(52, 10, 10, 14); if (B.id === 'ageha') { x.strokeStyle = B.col[1]; x.lineWidth = 3; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(6, 32); x.lineTo(30 + k * 7, 4 + k * 3); x.stroke(); } } if (B.id === 'kuroageha') { x.fillStyle = B.col[1]; x.beginPath(); x.arc(34, 56, 4, 0, 7); x.fill(); } }); }
function makeBugMesh(B) {
  const g = new THREE.Group(), body = bugMat(B.col[1]), s = B.big ? 1.5 : B.small ? 0.7 : 1;
  if (B.kind === 'fly') { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.05, 3, 6), B.bee ? bugMat('#e8b020') : body); b.rotation.x = Math.PI / 2; g.add(b);
    if (B.bee) { const w = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, side: THREE.DoubleSide }); for (const sx of [-1, 1]) { const wg = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.03), w); wg.position.set(sx * 0.03, 0.015, 0); wg.rotation.x = -Math.PI / 2; g.add(wg); g.userData['w' + sx] = wg; } }
    else { const wm = new THREE.MeshStandardMaterial({ map: wingTex(B), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.8 }); for (const sx of [-1, 1]) { const piv = new THREE.Group(); const wg = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), wm); wg.rotation.x = -Math.PI / 2; wg.position.x = sx * 0.055; if (sx < 0) wg.scale.x = -1; piv.add(wg); g.add(piv); g.userData['w' + sx] = piv; } } }
  if (B.kind === 'dart') { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.13, 3, 6), body); b.rotation.x = Math.PI / 2; g.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), bugMat(B.col[0])); hd.position.z = 0.08; g.add(hd); const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.03, 3, 6), bugMat(B.col[0])); t.rotation.x = Math.PI / 2; t.position.z = 0.05; g.add(t);
    const wm = new THREE.MeshBasicMaterial({ color: '#e8f0ff', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }); for (const [sx, z] of [[-1, 0.045], [1, 0.045], [-1, 0.02], [1, 0.02]]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.025), wm); w.rotation.x = -Math.PI / 2; w.position.set(sx * 0.065, 0.008, z); g.add(w); } }
  if (B.kind === 'glow') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), bugMat('#2a2a20')); g.add(b); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: BUG.glowTex || (BUG.glowTex = txCanvas(32, 32, (x) => { const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(240,255,150,1)'); gr.addColorStop(0.3, 'rgba(200,255,90,0.6)'); gr.addColorStop(1, 'rgba(160,255,60,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); })), color: '#d8ff70', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); sp.scale.setScalar(0.35); g.add(sp); g.userData.glow = sp; }
  if (B.kind === 'trunk' || B.kind === 'crawl' || B.kind === 'hop') {
    const shellM = B.id === 'tamamushi' ? new THREE.MeshStandardMaterial({ color: '#2ad08a', metalness: 0.8, roughness: 0.2, emissive: new THREE.Color('#104a30') }) : bugMat(B.col[0], B.id === 'tentou' || B.horn || B.jaw || B.id === 'kanabun' ? { roughness: 0.25, metalness: 0.2 } : {});
    if (B.shell) { const sh = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 8), bugMat('#e8d0b0')); sh.rotation.x = Math.PI / 2 + 0.6; sh.position.set(0, 0.03, -0.01); g.add(sh); const b = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), bugMat(B.col[1])); b.position.set(0, 0.015, 0.03); g.add(b); }
    else { const L = B.kind === 'hop' ? 0.09 : B.id === 'kamakiri' ? 0.1 : 0.05, b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), shellM); b.scale.set(B.kind === 'hop' || B.id === 'kamakiri' ? 0.5 : 0.85, 0.55, L / 0.06); b.position.y = 0.015; g.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), bugMat(B.col[1])); hd.position.set(0, 0.018, L * 0.55); g.add(hd);
      if (B.id === 'tentou') { for (const [x, z] of [[0, 0], [-0.012, 0.01], [0.012, 0.01], [-0.014, -0.012], [0.014, -0.012], [-0.006, -0.022], [0.006, -0.022]]) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.004, 5, 4), bugMat('#111')); d.position.set(x, 0.032, z); g.add(d); } }
      if (B.horn) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.008, 0.06, 5), bugMat(B.col[1])); h.position.set(0, 0.035, L * 0.75); h.rotation.x = 0.9; g.add(h); }
      if (B.jaw) for (const sx of [-1, 1]) { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.005, 0.045, 4), bugMat(B.col[1])); j.position.set(sx * 0.01, 0.018, L * 0.85); j.rotation.set(Math.PI / 2, 0, sx * 0.3); g.add(j); }
      if (B.kind === 'hop') for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.07, 4), bugMat(B.col[1])); l.position.set(sx * 0.017, 0.025, -0.01); l.rotation.set(-1.0, 0, sx * 0.3); g.add(l); }
      if (B.id === 'kamakiri') for (const sx of [-1, 1]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.04, 4), shellM); a.position.set(sx * 0.008, 0.03, L * 0.5); a.rotation.x = -0.6; g.add(a); }
      if (B.kind === 'trunk' && !B.horn && !B.jaw && B.id !== 'kanabun' && B.id !== 'tamamushi') { const wm = new THREE.MeshStandardMaterial({ color: B.id === 'aburazemi' ? '#6a4a2a' : '#d8e8e0', transparent: true, opacity: B.id === 'aburazemi' ? 0.95 : 0.45, roughness: 0.3, side: THREE.DoubleSide }); for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.075), wm); w.rotation.x = -Math.PI / 2; w.rotation.z = sx * 0.2; w.position.set(sx * 0.014, 0.034, -0.012); g.add(w); } } }
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.scale.setScalar(s * 1.6); scene.add(g); return g;
}
// ---------- where bugs can live near the player ----------
function bugEnvAt(x, z) {
  const h = groundH(x, z), env = [];
  if (h < -0.2) return env;
  const LM = GAME.LM || {}; if (h < 1.6 && LM.beach && (Math.hypot(x - LM.beach.x, z - LM.beach.z) < 70 || (PLACED.harbor && Math.hypot(x - PLACED.harbor.x, z - PLACED.harbor.z) < 50))) env.push('beach');
  if (h > 1.2 && roadDistAt(x, z) > 4 && waterDepthAt(x, z) === 0) env.push('grass');
  let wet = false; for (const [dx, dz] of [[4, 0], [-4, 0], [0, 4], [0, -4], [0, 0]]) if (!isNaN(waterLevelAt(G, x + dx, z + dz))) wet = true; if (NATURE.paddies && NATURE.farmAt && Math.hypot(x - NATURE.farmAt.x, z - NATURE.farmAt.z) < 20) wet = true; if (wet) env.push('water');
  return env;
}
function nearTree(x, z, r) { let best = null, bd = r; for (const it of VEG.items) { if (it.type !== 'tree' || VEG.removed[it.id] || it.kind === 'bush' || it.kind === 'bamboo' || it.kind === 'palm') continue; if (Math.abs(it.x - x) > r || Math.abs(it.z - z) > r) continue; const d = Math.hypot(it.x - x, it.z - z); if (d < bd) { bd = d; best = it; } } return best; }
function nearFlower(x, z, r) { for (const it of VEG.items) { if (it.type !== 'flower' || VEG.removed[it.id]) continue; if (Math.abs(it.x - x) < r && Math.abs(it.z - z) < r) return it; } return null; }
BUG.spawn = function () {
  const hf = currentHour(), doy = SEASON.doy, w = TIME.weather; if (w === 'rain' || w === 'storm' || w === 'snow') return;
  const a = Math.random() * 6.283, r = 9 + Math.random() * 16, x = PL.x + Math.cos(a) * r, z = PL.z + Math.sin(a) * r;
  const env = bugEnvAt(x, z); const tr = nearTree(x, z, 7); if (tr) env.push('tree'); const fl = (NATURE.floraMats && nearFlower(x, z, 5)) || (env.includes('grass') && Math.random() < 0.3 ? { x, z } : null); if (fl) env.push('flower');
  if (!env.length) return; const cands = BUGS.filter(B => bugActive(B, doy, hf) && B.env.some(e => env.includes(e))); if (!cands.length) return;
  const wts = cands.map(B => B.st === 1 ? 10 : B.st === 2 ? 4 : B.st === 3 ? 1.4 : 0.45); let t = Math.random() * wts.reduce((s, v) => s + v, 0), B = cands[0]; for (let i = 0; i < cands.length; i++) { t -= wts[i]; if (t <= 0) { B = cands[i]; break; } }
  const o = { B, mesh: makeBugMesh(B), t: Math.random() * 10, life: 70 + Math.random() * 60, state: 'live' };
  if (B.kind === 'trunk') { if (!tr) { scene.remove(o.mesh); return; } const ang = Math.random() * 6.283, sc = tr.kind === 'mikan' ? 0.9 + tr.r * 0.2 : 0.8 + tr.r * 0.45, rad = (tr.collR || 0.35) * sc * 0.75 + 0.02; o.x = tr.x + Math.cos(ang) * rad; o.z = tr.z + Math.sin(ang) * rad; o.y = groundH(tr.x, tr.z) + 0.9 + Math.random() * 0.8; o.face = Math.atan2(Math.cos(ang), Math.sin(ang)); o.mesh.rotation.set(-Math.PI / 2, 0, 0); o.mesh.rotation.order = 'YXZ'; o.mesh.rotation.y = Math.atan2(Math.cos(ang), Math.sin(ang)); }
  else if (B.env.includes('flower') && fl && B.kind !== 'hop') { o.x = fl.x; o.z = fl.z; } else { o.x = x; o.z = z; }
  if (B.kind === 'glow') { const nr = bugEnvAt(o.x, o.z).includes('water'); if (!nr) { scene.remove(o.mesh); return; } }
  o.hx = o.x; o.hz = o.z; if (o.y === undefined) o.y = groundH(o.x, o.z) + (B.kind === 'fly' ? 0.6 : B.kind === 'dart' ? 1.0 : B.kind === 'glow' ? 0.8 : 0.02); o.vx = 0; o.vz = 0; o.vy = 0;
  BUG.list.push(o);
  // a few fireflies come together
  if (B.kind === 'glow' && BUG.list.filter(q => q.B.id === 'hotaru').length < 14) for (let k = 0; k < 5; k++) { const q = { B, mesh: makeBugMesh(B), t: Math.random() * 10, life: o.life, state: 'live', x: o.x + (Math.random() - 0.5) * 6, z: o.z + (Math.random() - 0.5) * 6 }; q.hx = q.x; q.hz = q.z; q.y = groundH(q.x, q.z) + 0.5 + Math.random(); q.vx = q.vz = q.vy = 0; BUG.list.push(q); }
};
BUG.remove = function (o) { scene.remove(o.mesh); const i = BUG.list.indexOf(o); if (i >= 0) BUG.list.splice(i, 1); };
BUG.update = function (dt) {
  BUG.t += dt; if (GAME.inside || !GAME.p) { for (const o of BUG.list) o.mesh.visible = false; return; }
  BUG.spawnT -= dt; const cap = 9; if (BUG.spawnT < 0) { BUG.spawnT = 1.6; if (BUG.list.length < cap) for (let k = 0; k < 3; k++) BUG.spawn(); }
  const runFast = Math.hypot(PL.vx || 0, PL.vz || 0) > 4.5 || (PL.speed || 0) > 4.5;
  for (const o of [...BUG.list]) { const B = o.B, m = o.mesh; o.t += dt; o.life -= dt; const dP = Math.hypot(PL.x - o.x, PL.z - o.z);
    if (o.life < 0 || dP > 45) { BUG.remove(o); continue; } m.visible = true;
    if (o.state === 'flee') { o.vy += (B.kind === 'crawl' || B.kind === 'hop' ? -9 : 0.6) * dt; o.x += o.vx * dt; o.z += o.vz * dt; o.y += o.vy * dt; if (B.kind === 'crawl' || B.kind === 'hop') o.y = Math.max(o.y, groundH(o.x, o.z) + 0.01); if (o.t > 2.5) { BUG.remove(o); continue; } }
    else if (dP < (runFast ? 4 : 1.1) && o.state === 'live' && Math.random() < dt * (runFast ? 6 : 0.4) && !(BUG.swing > 0)) { o.state = 'flee'; o.t = 0; const a = Math.atan2(o.x - PL.x, o.z - PL.z) + (Math.random() - 0.5); const sp = B.kind === 'crawl' ? 1.2 : B.kind === 'hop' ? 3 : 4; o.vx = Math.sin(a) * sp; o.vz = Math.cos(a) * sp; o.vy = B.kind === 'hop' ? 3 : B.kind === 'trunk' ? 1.5 : 1; if (B.kind === 'trunk') { m.rotation.set(0, a, 0); } }
    else if (B.kind === 'fly') { const tt = o.t; o.x = o.hx + Math.sin(tt * 0.7) * 1.4 + Math.sin(tt * 1.9) * 0.4; o.z = o.hz + Math.cos(tt * 0.53) * 1.4; const gy = groundH(o.x, o.z); o.y = gy + 0.45 + Math.abs(Math.sin(tt * 1.3)) * 0.6 + (B.bee ? Math.sin(tt * 9) * 0.05 : 0); if (Math.sin(tt * 0.31) > 0.92) o.y = gy + 0.2; m.rotation.y = Math.atan2(Math.cos(tt * 0.7) * 0.98, -Math.sin(tt * 0.53) * 0.74);
      const f = B.bee ? Math.sin(tt * 80) * 0.5 : Math.sin(tt * 18) * 1.1; if (m.userData['w-1']) { m.userData['w-1'].rotation.z = B.bee ? 0 : -f; m.userData['w1'].rotation.z = B.bee ? 0 : f; if (B.bee) { m.userData['w-1'].rotation.y = f; m.userData['w1'].rotation.y = -f; } } }
    else if (B.kind === 'dart') { if (!o.tgt || o.t > o.tgtT) { o.tgt = { x: o.hx + (Math.random() - 0.5) * 8, z: o.hz + (Math.random() - 0.5) * 8 }; o.tgtT = o.t + 1.2 + Math.random() * 2.5; } const dx = o.tgt.x - o.x, dz = o.tgt.z - o.z, d = Math.hypot(dx, dz); if (d > 0.2) { const v = Math.min(d * 3, 6) * dt; o.x += dx / d * v; o.z += dz / d * v; m.rotation.y = Math.atan2(dx, dz); } o.y = groundH(o.x, o.z) + Math.max(0.5, 0.9 + Math.sin(o.t * 0.8) * 0.3); if (!isNaN(waterLevelAt(G, o.x, o.z))) o.y = Math.max(o.y, waterLevelAt(G, o.x, o.z) + 0.6); }
    else if (B.kind === 'glow') { o.x = o.hx + Math.sin(o.t * 0.3 + o.hx) * 1.5; o.z = o.hz + Math.cos(o.t * 0.27 + o.hz) * 1.5; o.y = groundH(o.x, o.z) + 0.6 + Math.sin(o.t * 0.5) * 0.4; const L = isNaN(waterLevelAt(G, o.x, o.z)) ? -99 : waterLevelAt(G, o.x, o.z); o.y = Math.max(o.y, L + 0.4); const p = (Math.sin(o.t * 2.2 + o.hz) + 1) / 2; m.userData.glow.material.opacity = 0.15 + p * p * 0.85; m.userData.glow.scale.setScalar((0.2 + p * 0.3) / 1.6); }
    else if (B.kind === 'hop') { o.y += o.vy * dt; o.vy -= 9 * dt; const gy = groundH(o.x, o.z) + 0.01; if (o.y <= gy) { o.y = gy; o.vy = 0; o.vx = o.vz = 0; if (Math.random() < dt * 0.25) { const a = Math.random() * 6.283; o.vy = 2.6; o.vx = Math.sin(a) * 1.6; o.vz = Math.cos(a) * 1.6; m.rotation.y = a; } } o.x += o.vx * dt; o.z += o.vz * dt; }
    else if (B.kind === 'crawl') { if (!o.dir || Math.random() < dt * 0.4) o.dir = Math.random() * 6.283; const sp = (B.fast ? 1.4 : 0.15) * (Math.sin(o.t * 1.3) > -0.3 ? 1 : 0); const nx = o.x + Math.sin(o.dir) * sp * dt, nz = o.z + Math.cos(o.dir) * sp * dt; if (Math.hypot(nx - o.hx, nz - o.hz) < 3 && groundH(nx, nz) > -0.1) { o.x = nx; o.z = nz; } else o.dir += Math.PI; o.y = groundH(o.x, o.z) + 0.005; m.rotation.y = o.dir; }
    else if (B.kind === 'trunk') { o.y += Math.sin(o.t * 0.4) * 0.02 * dt; }
    m.position.set(o.x, o.y, o.z);
  }
};
// ---------- catching ----------
BUG.target = function () { if (PL.veh || !GAME.p || GAME.inside) return null; const fx = Math.sin(PL.rot), fz = Math.cos(PL.rot); let best = null, bs = 1e9; for (const o of BUG.list) { if (o.state !== 'live') continue; const dx = o.x - PL.x, dz = o.z - PL.z, d = Math.hypot(dx, dz); if (d > 2.7 || o.y - PL.y > 2.6) continue; const dot = d > 0.01 ? (dx * fx + dz * fz) / d : 1; if (d > 1.1 && dot < 0.35) continue; const s = d - dot; if (s < bs) { bs = s; best = o; } } return best; };
BUG.hasNet = () => !!(GAME.p && GAME.p.items && GAME.p.items.net);
BUG.swingNet = function () {
  if (BUG.swing > 0) return true; const o = BUG.target(); if (!o) return false; if (!BUG.hasNet()) { UI.toast('虫とりあみを持っていません（ハナさんに話しかけてみよう）'); return true; }
  BUG.swing = 0.5; PL.rot = Math.atan2(o.x - PL.x, o.z - PL.z); try { SND.play('rustle', { vol: 0.6, rate: 1.4 }); } catch (e) { }
  const d = Math.hypot(o.x - PL.x, o.z - PL.z), p = Math.max(0.35, 0.95 - d * 0.12 - (o.B.st - 1) * 0.08 - (o.B.fast ? 0.25 : 0));
  setTimeout(() => { if (!BUG.list.includes(o)) return; if (Math.random() < p) BUG.caught(o); else { o.state = 'flee'; o.t = 0; const a = PL.rot + (Math.random() - 0.5) * 2; o.vx = Math.sin(a) * 3; o.vz = Math.cos(a) * 3; o.vy = 1.5; UI.toast(`あっ、${o.B.name}に逃げられた…`); } }, 260);
  return true;
};
BUG.caught = function (o) {
  const p = GAME.p, b = GAME.bag(), B = o.B; BUG.remove(o); b.bugs = b.bugs || []; p.bugz = p.bugz || {}; p.stats.bugN = (p.stats.bugN || 0) + 1;
  const first = !p.bugz[B.id]; p.bugz[B.id] = (p.bugz[B.id] || 0) + 1;
  if (b.bugs.length >= BUG_CAP) UI.toast(`${B.name}をつかまえた！ …でも虫かごがいっぱいなので逃がしてあげた`);
  else { b.bugs.push({ id: B.id }); UI.popup ? UI.popup(`${B.name}をつかまえた！`, `${'★'.repeat(B.st)}　${B.note}${first ? '<br><b>図鑑に登録しました！</b>' : ''}`) : UI.toast(`🦋 ${B.name}をつかまえた！${first ? '（図鑑に登録）' : ''}`); }
  try { SND.play('ui_confirmation2', { vol: 0.7 }); } catch (e) { } GAME.dirty = true; GAME.check && GAME.check(); GAME.renderTracker && GAME.renderTracker();
};
BUG.price = function (id) { const B = BUGS.find(q => q.id === id); return B ? B.p : 0; };
// ---------- hooks: F key, prompt, hero pose with the net, bag, shop, zukan, gifts ----------
{ const _fk = GAME.fishKey; GAME.fishKey = function () { if (!LIFE.fish && !PL.veh && BUG.target() && !EDIT.on) return BUG.swingNet(); return _fk.apply(this, arguments); }; }
{ const _pr = GAME.prompt; GAME.prompt = function () { const r = _pr.apply(this, arguments); if (!r && !LIFE.fish && BUG.target()) return `F：${BUG.hasNet() ? '虫をつかまえる' : '虫がいる！'}`; return r; }; }
{ const _ah = animateHero; animateHero = function (dt) { const r = _ah.apply(this, arguments); const P = PL.parts; if (!BUG.net) { const g = new THREE.Group(), M = propMats(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 5), M.wood); st.position.y = 0.5; g.add(st); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 4, 16), M.dark); ring.position.y = 1.15; g.add(ring); const bag = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#f4f4f0', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })); bag.rotation.x = Math.PI / 2; bag.position.set(0, 1.15, -0.16); g.add(bag); ring.rotation.x = Math.PI / 2; g.visible = false; PL.mesh.add(g); BUG.net = g; }
    if (BUG.swing > 0) { BUG.swing -= dt || 0.016; const k = 1 - Math.max(0, BUG.swing) / 0.5, s = Math.sin(k * Math.PI); BUG.net.visible = true; BUG.net.position.set(-0.16, 0.62, 0.15); BUG.net.rotation.set(-0.3 + k * 1.9, 0, 0); if (P && P.upperArmR) { P.upperArmR.rotation.x = -2.2 + k * 1.6; P.upperArmL.rotation.x = -1.6 + k * 1.2; } } else if (BUG.net.visible) BUG.net.visible = false;
    return r; }; }
{ const _ob = GAME.openBag; GAME.openBag = function () { _ob.apply(this, arguments); const b = this.bag(); if (!b.bugs) b.bugs = []; const mb = this.el.modal.querySelector('.mb'); if (!mb) return; const groups = {}; b.bugs.forEach(q => { groups[q.id] = (groups[q.id] || 0) + 1; });
    const rows = Object.entries(groups).map(([id, n]) => { const B = BUGS.find(q => q.id === id); return `<li><span class="ic">🦋</span><div><b>${esc(B.name)}</b> ×${n}<div class="sub">${'★'.repeat(B.st)}　商店で${yen(B.p)}</div></div><button class="rel" data-relbug="${id}">1匹逃がす</button></li>`; }).join('');
    const h = document.createElement('div'); h.innerHTML = `<h3 class="bh">虫かご（${b.bugs.length}/${BUG_CAP}）</h3><ul class="list">${rows || `<li><div class="sub">${BUG.hasNet() ? '虫は入っていません（虫に近づいて F でつかまえよう）' : '虫とりあみは、ハナさんが持っているかも？'}</div></li>`}</ul>`; const anchor = mb.querySelectorAll('h3.bh')[1]; mb.insertBefore(h, anchor || null);
    const tl = mb.querySelectorAll('ul.list'); const tools = tl[tl.length - 1]; if (tools && BUG.hasNet()) tools.insertAdjacentHTML('beforeend', '<li><span class="ic">🥅</span><div><b>虫とりあみ</b></div></li>');
    const box = this.el.modal.querySelector('.journal'), prev = box.onclick; box.onclick = e => { const r = e.target.closest('[data-relbug]'); if (r) { const i = b.bugs.findIndex(q => q.id === r.dataset.relbug); if (i >= 0) b.bugs.splice(i, 1); UI.toast('虫を逃がしてあげた'); this.dirty = true; return this.openBag(); } prev(e); }; }; }
{ const _os = GAME.openShop; GAME.openShop = function (tab) { if (tab === 'bug') this.shopTab = 'bug'; const wasBug = this.shopTab === 'bug'; if (wasBug) this.shopTab = 'decor'; _os.call(this, wasBug ? 'decor' : tab); const tabs = this.el.modal.querySelector('.tabs'); if (!tabs) return; tabs.insertAdjacentHTML('beforeend', `<button data-st="bug" class="${wasBug ? 'on' : ''}">虫の買い取り</button>`);
    const b = this.bag(); b.bugs = b.bugs || []; const box = this.el.modal.querySelector('.shopbox'), prev = box.onclick;
    if (wasBug) { tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.st === 'bug')); this.shopTab = 'bug'; const total = b.bugs.reduce((s, q) => s + BUG.price(q.id), 0); const groups = {}; b.bugs.forEach(q => { groups[q.id] = (groups[q.id] || 0) + 1; });
      this.el.modal.querySelector('.mb').innerHTML = b.bugs.length ? `<ul class="glist">${Object.entries(groups).map(([id, n]) => { const B = BUGS.find(q => q.id === id); return `<li><div class="th">🦋</div><div class="in"><b>${esc(B.name)} ×${n}</b><span class="own">${'★'.repeat(B.st)}　1匹 ${yen(B.p)}</span></div><button class="buy" data-sellbug="${id}">1匹売る</button></li>`; }).join('')}</ul><p class="small"><button class="primary" data-sellall="1">ぜんぶ売る（${yen(total)}）</button></p>` : '<p class="empty">虫かごはからっぽです。島で虫をつかまえて持ってきてね。めずらしい虫ほど高く買い取ります。</p>'; }
    box.onclick = e => { const t = e.target.closest('[data-st]'); if (t && t.dataset.st === 'bug') return this.openShop('bug'); if (t) this.shopTab = t.dataset.st;
      const sb = e.target.closest('[data-sellbug]'); if (sb) { const i = b.bugs.findIndex(q => q.id === sb.dataset.sellbug); if (i >= 0) { const pr = BUG.price(b.bugs[i].id); b.bugs.splice(i, 1); this.addMoney(pr); UI.toast(`🦋 ${yen(pr)}で売れた！`); this.dirty = true; } return this.openShop('bug'); }
      if (e.target.closest('[data-sellall]')) { const t2 = b.bugs.reduce((s, q) => s + BUG.price(q.id), 0); b.bugs = []; this.addMoney(t2); UI.toast(`🦋 虫をぜんぶ売って ${yen(t2)} もらった！`); this.dirty = true; return this.openShop('bug'); }
      prev(e); }; }; }
{ const _zt = GAME.zukanTab; GAME.zukanTab = function () { const p = this.p, Z = p.bugz || {}, got = Object.keys(Z).length; return _zt.apply(this, arguments) + `<h3 class="bh" style="margin-top:14px">虫図鑑 ${got} / ${BUGS.length}種類　・　つかまえた数 ${p.stats.bugN || 0}匹</h3>
    <ul class="list zukan">${BUGS.map(B => { const r = Z[B.id]; const mon = `${B.from[0]}〜${B.to[0]}月`, hr = B.h[0] === 0 && B.h[1] === 24 ? '一日中' : `${Math.floor(B.h[0])}時〜${Math.floor(B.h[1])}時`; return `<li class="${r ? 'done' : 'lock'}"><span class="ck">${r ? '🦋' : '？'}</span><div><b>${r ? esc(B.name) : '？？？'}</b>　<span class="pr">${'★'.repeat(B.st)}</span><div class="sub">${mon}・${hr}${r ? `　${r}匹　${esc(B.note)}` : ''}</div></div></li>`; }).join('')}</ul>`; }; }
// the net comes from Hana
{ const _st = startTalk; startTalk = function (n) { _st(n); const p = GAME.p; if (!p || n.visitor || n.def.id !== 'v_hana' || (p.items && p.items.net) || !p.talked.v_hana || DIALOG.npc !== n) return; p.items = p.items || {}; p.items.net = true; DIALOG.pages.push(GAME.fill('そうそう、{P}さん。これ、使ってない虫とりあみなの。よかったらどうぞ。'), 'チョウやトンボ、夏の夜には木にカブトムシも来るのよ。そっと近づいて F で、つかまえてみてね。'); setTimeout(() => UI.toast('🥅 虫とりあみをもらった！（虫に近づいて F）'), 500); GAME.dirty = true; }; }
// gifts: bugs can be given; Kotaro loves beetles
{ const _gb = GAME.giftables; GAME.giftables = function () { const b = this.bag(); return _gb.apply(this, arguments) || (b.bugs && b.bugs.length > 0); };
  const _og = GAME.openGift; GAME.openGift = function (n) { _og.call(this, n); const b = this.bag(); if (!b.bugs || !b.bugs.length) return; const box = this.el.modal.querySelector('.gifts'); if (!box) return; box.insertAdjacentHTML('beforeend', b.bugs.map((q, i) => { const B = BUGS.find(x => x.id === q.id); return `<button class="gi" data-gb="${i}"><span>🦋</span><b>${esc(B.name)}</b><small>${'★'.repeat(B.st)}</small></button>`; }).join(''));
    const jb = this.el.modal.querySelector('.journal'), prev = jb.onclick; jb.onclick = e => { const g = e.target.closest('[data-gb]'); if (g) { const q = b.bugs.splice(+g.dataset.gb, 1)[0], B = BUGS.find(x => x.id === q.id); const love = (n.def.id === 'v_kota' && (B.horn || B.jaw)) || (n.def.id === 'v_hana' && B.kind === 'fly') || (n.def.id === 'v_yuki' && (B.id === 'hotaru' || B.id === 'tamamushi')), pts = love ? 3 : B.st >= 3 ? 2 : 1, p = this.p, id = n.def.id;
        p.friend[id] = (p.friend[id] || 0) + pts; p.daily.gifted = p.daily.gifted || {}; p.daily.gifted[id] = 1; p.stats.giftN++; this.modal = null; this.el.modal.hidden = true; this.el.modal.innerHTML = '';
        const t = love ? `わあっ、${B.name}！ ずっとほしかったんだ…！ ありがとう！` : B.st >= 3 ? `${B.name}！？ めずらしい虫、よく見つけたね！` : `${B.name}だね。かわいい、ありがとう！`; DIALOG.npc = n; DIALOG.pages = [t]; DIALOG.i = 0; DIALOG.choices = null; UI.dialog(n.def.name, t); UI.toast(`🎁 ${B.name}をプレゼントした　なかよし +${pts}`); this.dirty = true; this.save(); return; } prev(e); }; }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { BUG.update(dt || 0.016); } catch (e) { if (!BUG._err) { BUG._err = 1; console.warn('bugs', e); } } return r; }; }
