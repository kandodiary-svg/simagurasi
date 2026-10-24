// ===================== detailed models for 島の開発, 島モータース, 漁協 出荷所 =====================
const DA = { ok: false };
function devArchMats() {
  if (DA.ok) return DA; DA.ok = true; const A = archMats();
  DA.shoji = new THREE.MeshStandardMaterial({ map: txCanvas(128, 128, (x, w, h) => { x.fillStyle = '#f4efe2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a5a3e'; x.lineWidth = 3; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); } for (let j = 0; j <= 6; j++) { x.beginPath(); x.moveTo(0, j * h / 6); x.lineTo(w, j * h / 6); x.stroke(); } x.lineWidth = 8; x.strokeRect(0, 0, w, h); }), emissiveMap: txCanvas(128, 128, (x, w, h) => { x.fillStyle = '#ffd890'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3a2410'; x.lineWidth = 3; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.stroke(); } for (let j = 0; j <= 6; j++) { x.beginPath(); x.moveTo(0, j * h / 6); x.lineTo(w, j * h / 6); x.stroke(); } }), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.8 });
  DA.rollup = new THREE.MeshStandardMaterial({ map: txCanvas(64, 128, (x, w, h) => { for (let j = 0; j < h; j += 6) { x.fillStyle = '#d6d9dc'; x.fillRect(0, j, w, 4); x.fillStyle = '#9ea3a8'; x.fillRect(0, j + 4, w, 2); } }), roughness: 0.4, metalness: 0.5 });
  DA.chalk = new THREE.MeshStandardMaterial({ map: txCanvas(128, 160, (x, w, h) => { x.fillStyle = '#2f4a3a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#a07a52'; x.lineWidth = 10; x.strokeRect(0, 0, w, h); x.fillStyle = '#f4f0e0'; x.font = '18px "M PLUS Rounded 1c", sans-serif'; ['本日の', 'おすすめ', '〜〜〜〜', '🐟 300円', '🍊 150円', '🦐 500円'].forEach((t, i) => x.fillText(t, 14, 30 + i * 22)); }), roughness: 0.8 });
  DA.tent = ['#e8574e', '#3f8fd8', '#f2c230', '#46a86a', '#f08fb0'].map(c => stdM(c, 0.85, 0, { side: THREE.DoubleSide }));
  DA.tentIn = stdM('#3a3530', 0.9, 0, { side: THREE.DoubleSide });
  DA.ring = stdM('#ff7a2a', 0.5); DA.white = stdM('#f8f8f4', 0.5); DA.water = new THREE.MeshStandardMaterial({ color: '#5fc0e8', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.85 });
  DA.dolphin = stdM('#7fa8c8', 0.35, 0.1); DA.crate = [stdM('#2f78c8', 0.55), stdM('#f4f4f0', 0.55), stdM('#e8b545', 0.55)];
  DA.ice = stdM('#e6f6ff', 0.2, 0.0, { transparent: true, opacity: 0.9 }); DA.fish = stdM('#9fb6c4', 0.3, 0.5);
  DA.mikan = stdM('#ff9a22', 0.6); DA.veg = [stdM('#5fae3a', 0.7), stdM('#d8423a', 0.6), stdM('#f2e6c8', 0.7), stdM('#8a5ab8', 0.6)];
  DA.glassBlue = stdM('#8fc4e0', 0.08, 0.3);
  DA.whiteDS = stdM('#ffffff', 0.6, 0, { side: THREE.DoubleSide }); DA.redDS = stdM('#d8282f', 0.55, 0, { side: THREE.DoubleSide });
  DA.yellow = stdM('#f2c230', 0.5); DA.steel = stdM('#7d8a94', 0.45, 0.6);
  return DA;
}
function devGlowUpdate(night) { if (DA.ok) DA.shoji.emissiveIntensity = night * 1.0; }
const _updArch = updateArchLights; updateArchLights = function (n) { _updArch(n); devGlowUpdate(n); };
// simple wall box with corner trims, base band and top band
function shell(g, W, H, D, wall, trim, y0 = 0) { B(g, W, H, D, wall, 0, y0 + H / 2, 0); if (trim) { for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 0.16, H, 0.16, trim, sx * W / 2, y0 + H / 2, sz * D / 2); B(g, W + 0.06, 0.18, D + 0.06, trim, 0, y0 + H - 0.09, 0); } }
function lifeRing(g, x, y, z, ry) { const D2 = devArchMats(), s = sub(g, x, y, z, ry); B(s, 0.08, 1.3, 0.08, MAT.darkwood, 0, 0.65, 0); B(s, 0.5, 0.06, 0.1, MAT.darkwood, 0, 1.25, 0.04); const t = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 8, 18), D2.ring); t.position.set(0, 0.95, 0.1); t.castShadow = true; s.add(t); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, w = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.085, 8, 3, 0.35), D2.white); w.position.copy(t.position); w.rotation.z = a; s.add(w); } return s; }
function crateStack(g, x, z, n, R, ry = 0) { const D2 = devArchMats(), s = sub(g, x, 0, z, ry); for (let k = 0; k < n; k++) { const m = D2.crate[Math.floor(R() * 2)]; B(s, 0.62, 0.3, 0.42, m, (R() - 0.5) * 0.06, 0.16 + k * 0.31, (R() - 0.5) * 0.06); } return s; }
function produceStand(g, x, z, ry, kind, R) { const D2 = devArchMats(), A = archMats(), s = sub(g, x, 0, z, ry);
  B(s, 1.9, 0.08, 0.9, MAT.wood, 0, 0.82, 0); for (const sx of [-0.85, 0.85]) for (const sz of [-0.38, 0.38]) B(s, 0.07, 0.82, 0.07, MAT.darkwood, sx, 0.41, sz); B(s, 1.8, 0.06, 0.8, MAT.wood, 0, 0.25, 0);
  for (let c = 0; c < 3; c++) { B(s, 0.55, 0.18, 0.62, A.boardLight, -0.6 + c * 0.6, 0.95, 0); for (let k = 0; k < 7; k++) { const m = kind === 'mikan' ? D2.mikan : D2.veg[(c + (k % 2)) % D2.veg.length]; SP(s, kind === 'mikan' ? 0.09 : 0.08 + R() * 0.03, m, -0.75 + c * 0.6 + (k % 3) * 0.12, 1.08 + Math.floor(k / 3) * 0.05, -0.2 + (k % 4) * 0.13, kind === 'mikan' ? 0.9 : 1.2, 7); } }
  const tag = dynSign(0.5, 0.3, kind === 'mikan' ? '100円' : 'とれたて', '#fff8e8', '#c8423a'); tag.userData.keep = false; tag.position.set(0.6, 1.25, 0.42); s.add(tag); return s; }

// ---------- 港の待合所 ----------
DEV_BUILD.waiting = function (s) {
  const g = new THREE.Group(), M = dmat(), A = archMats(), W = 7, D = 4.4, H = 2.9, B0 = 0.25, R = mulberry(41);
  B(g, W + 1.2, B0, D + 1.8, M.conc, 0, B0 / 2, 0.45); shell(g, W, H, D, A.siding[1], A.trim, B0); B(g, W + 0.1, 0.05, D + 0.1, A.gutter, 0, B0 + 0.03, 0);
  for (const sx of [-1, 1]) winPart(g, sx * 2.3, B0 + 1.5, D / 2 + 0.01, 0, 1.5, 1.35, { style: 'cross', cur: 4, shutter: AM.louver[0], box: true });
  // glass sliding doors
  for (const sx of [-1, 1]) B(g, 0.85, 2.1, 0.04, A.win[4], sx * 0.44, B0 + 1.05, D / 2 + 0.02); B(g, 2.0, 0.1, 0.12, A.sash, 0, B0 + 2.15, D / 2 + 0.05); for (const sx of [-1, 0, 1]) B(g, 0.07, 2.1, 0.1, A.sash, sx * 0.9, B0 + 1.05, D / 2 + 0.05);
  for (const sx of [-1, 1]) winPart(g, sx * (W / 2 + 0.01), B0 + 1.5, 0, sx * Math.PI / 2, 1.4, 1.2, { style: 'cross', cur: 2 });
  const over = 0.55, rise = 1.4, y1 = rise * over / (D / 2 + over), rbase = B0 + H - y1;
  roofPart(g, { W, D, over, rise, hip: false, rbase, mat: MAT.kawaraRed, soffit: A.soffit, fascia: A.trim }); gableFill(g, W, D, rise, y1, B0 + H, A.siding[1]);
  // clock on the front + sign
  { const c = sub(g, 0, B0 + H + 0.45, D / 2 + 0.1); const face = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), MAT.white); face.position.z = 0.04; c.add(face); const r = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 6, 24), A.trimBrown); r.position.z = 0.04; c.add(r); B(c, 0.03, 0.22, 0.02, AM.dark, 0, 0.09, 0.06); B(c, 0.17, 0.03, 0.02, AM.dark, 0.07, 0, 0.06); }
  const sg = dynSign(2.6, 0.48, '港の待合所', '#3a2a1e', '#f6efe0'); sg.position.set(0, B0 + 2.5, D / 2 + 0.12); g.add(sg);
  const tt = dynSign(0.9, 0.7, '時刻表', '#ffffff', '#1f4f8a', 'M PLUS Rounded 1c'); tt.position.set(-1.35, B0 + 1.45, D / 2 + 0.05); tt.scale.set(0.8, 0.8, 1); g.add(tt);
  vendingMachine(g, W / 2 + 0.7, D / 2 - 0.2, 0, 1); bench(g, -W / 2 + 1.2, D / 2 + 1.1, 0, MAT.wood); for (let k = 0; k < 2; k++) pottedPlant(g, 1.3 + k * 0.5, D / 2 + 0.45, k === 0, R);
  lifeRing(g, -W / 2 - 0.5, B0, D / 2 - 0.4, 0);
  bldPlace(g, s); coll(s, 0, 0, W / 2 + 0.15, D / 2 + 0.15); coll(s, W / 2 + 0.7, D / 2 - 0.2, 0.5, 0.4); return g;
};
// ---------- 観光桟橋: add life rings, rope rail, a proper ticket booth roof ----------
{ const _pier = DEV_BUILD.pier; DEV_BUILD.pier = function (s) { const g = _pier(s), A = archMats(), L = s.len + 2, y = 1.15;
  for (let k = 1; k * 9 < L - 4; k++) lifeRing(g, -1.75, y, k * 9 - 2, Math.PI / 2);
  for (let k = 0; k * 3 < L - 3; k++) { B(g, 0.08, 0.9, 0.08, MAT.darkwood, 1.75, y + 0.45, k * 3 - 1.5); } CY(g, 0.03, L - 3, stdM('#e8dcc0', 0.9), 1.75, y + 0.82, L / 2 - 3, 6, Math.PI / 2, 0);
  { const b = sub(g, 0.6, y, L - 4); roofPart(b, { W: 1.6, D: 1.4, over: 0.3, rise: 0.5, hip: true, rbase: 2.25, mat: A.shingle[1], soffit: A.soffit, fascia: A.trim, gutter: false }); winPart(b, 0, 1.4, 0.72, 0, 0.9, 0.6, { style: 'cross', cur: 1 }); }
  return g; }; }
// ---------- 海水浴場: beach house, lifeguard tower, showers, buoys ----------
DEV_BUILD.beach = function (s) {
  const g = new THREE.Group(), M = dmat(), A = archMats(), D2 = devArchMats(), o = { x: s.x, z: s.z, rot: s.rot }, R = mulberry(57);
  const P = (lx, lz) => { const [x, z] = toWorld(o, lx, lz); return [x, groundH(x, z), z]; };
  for (let k = 0; k < 6; k++) { const [x, y, z] = P(-14 + k * 5.5, 3 + (k % 2) * 3); const pr = makeDecor('parasol'); pr.position.set(x, y, z); pr.rotation.y = k; g.add(pr); }
  const spot = (lx0) => { for (let lz = -6; lz <= 10; lz += 1) { const [x, , z] = P(lx0, lz); if (groundH(x, z) > 0.35 && groundH(x, z) < 3 && roadDistAt(x, z) > 5.5 && waterDepthAt(x, z) <= 0) return lz; } return 2; };
  { // lifeguard tower
    const [x, y, z] = P(10, spot(10)); const t = sub(g, x, y, z, s.rot);
    for (const [a, b] of [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]]) ROD(t, 0.07, D2.white, [a * 1.25, 0, b * 1.25], [a, 2.9, b], 6);
    for (const yy of [1.0, 2.0]) { B(t, 1.9, 0.07, 0.07, MAT.red, 0, yy, 0.85); B(t, 1.9, 0.07, 0.07, MAT.red, 0, yy, -0.85); }
    B(t, 2.0, 0.12, 2.0, MAT.wood, 0, 2.95, 0); for (const sx of [-1, 1]) B(t, 0.06, 0.8, 2.0, D2.white, sx * 0.98, 3.4, 0); B(t, 2.0, 0.8, 0.06, D2.white, 0, 3.4, -0.98); B(t, 2.0, 0.12, 0.06, MAT.red, 0, 3.75, 0.98);
    for (let k = 0; k < 9; k++) B(t, 0.6, 0.05, 0.08, MAT.wood, 0, 0.3 + k * 0.3, 1.4 + k * 0.0 - 0.0 + (2.7 - k * 0.3) * 0.25);
    ROD(t, 0.03, D2.white, [-0.3, 0, 2.1], [-0.3, 2.95, 1.0]); ROD(t, 0.03, D2.white, [0.3, 0, 2.1], [0.3, 2.95, 1.0]);
    CY(t, 0.04, 2.2, D2.white, 0.6, 4.3, -0.6, 6); const um = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.55, 12, 1, true), DA.redDS); um.position.set(0.6, 5.3, -0.6); um.castShadow = true; t.add(um);
    lifeRing(t, -1.1, 0, 1.2, 0); }
  { // 海の家 on a low deck, open counter, striped awning, menu, benches
    const [x, y, z] = P(-12, spot(-12) + 1); const h = sub(g, x, y, z, s.rot), W = 7.5, D = 4.2;
    B(h, W + 2, 0.3, D + 2.4, MAT.wood, 0, 0.15, 0.6); for (let k = 0; k < 10; k++) B(h, 0.04, 0.02, D + 2.4, MAT.darkwood, -W / 2 - 1 + (k + 0.5) * (W + 2) / 10, 0.31, 0.6);
    B(h, W, 2.5, 0.12, A.boardLight, 0, 1.55, -D / 2); for (const sx of [-1, 1]) B(h, 0.12, 2.5, D, A.boardLight, sx * W / 2, 1.55, 0); B(h, W, 0.95, 0.12, A.boardLight, 0, 0.78, D / 2); B(h, W + 0.2, 0.08, 0.5, MAT.wood, 0, 1.28, D / 2 + 0.1);
    for (const sx of [-1, 1]) B(h, 0.14, 2.5, 0.14, MAT.darkwood, sx * W / 2, 1.55, D / 2);
    roofPart(h, { W, D, over: 0.5, rise: 1.1, hip: false, rbase: 2.8 - 1.1 * 0.5 / (D / 2 + 0.5), mat: MAT.metalRoof[0], soffit: A.soffit, fascia: A.trim, gutter: false }); gableFill(h, W, D, 1.1, 1.1 * 0.5 / (D / 2 + 0.5), 2.8, A.boardLight);
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.4, 1.6), A.awn[0]); aw.rotation.x = -Math.PI / 2 + 0.3; aw.position.set(0, 2.55 - Math.sin(0.3) * 0.8, D / 2 + Math.cos(0.3) * 0.8); h.add(aw);
    for (let k = 0; k < Math.round((W + 0.4) / 0.4); k++) { const sc = new THREE.Mesh(new THREE.CircleGeometry(0.2, 10, Math.PI, Math.PI), k % 2 ? DA.whiteDS : A.awnSolid[0]); sc.position.set(-(W + 0.4) / 2 + (k + 0.5) * 0.4, 2.55 - Math.sin(0.3) * 1.6, D / 2 + Math.cos(0.3) * 1.6); h.add(sc); }
    const sg = dynSign(2.8, 0.6, '海の家', '#ffffff', '#d8423a'); sg.position.set(0, 3.15, D / 2 + 0.55); h.add(sg);
    const mn = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), D2.chalk); mn.position.set(-W / 2 + 0.8, 0.95, D / 2 + 1.0); mn.rotation.x = -0.2; h.add(mn); B(h, 0.05, 1.0, 0.05, MAT.darkwood, -W / 2 + 0.8, 0.6, D / 2 + 0.9);
    for (let k = 0; k < 3; k++) { const q = sub(h, -2 + k * 2.2, 0.3, D / 2 + 1.5, 0); B(q, 1.0, 0.06, 0.7, MAT.wood, 0, 0.72, 0); for (const sx of [-0.4, 0.4]) B(q, 0.06, 0.72, 0.6, MAT.darkwood, sx, 0.36, 0); }
    for (const sx of [-1, 1]) { B(h, 0.04, 0.6, 0.04, AM.dark, sx * 0.5, 2.0, D / 2 + 0.2); } // hanging lantern wires
    for (let k = 0; k < 5; k++) { const l = SP(h, 0.13, MAT.lamp, -W / 2 + 0.8 + k * (W - 1.6) / 4, 2.35, D / 2 + 0.2, 1.2, 8); HOUSE_LIGHTS.push(l); }
    // shower stand
    { const sh = sub(h, W / 2 + 1.6, 0, 0, 0); B(sh, 0.12, 2.4, 0.12, D2.white, 0, 1.2, 0); B(sh, 0.5, 0.06, 0.06, D2.white, 0.22, 2.35, 0); CY(sh, 0.12, 0.05, MAT.metal, 0.45, 2.3, 0, 10); B(sh, 1.0, 0.08, 1.0, MAT.wood, 0.3, 0.04, 0); }
    addCollider({ x, z, hw: W / 2 + 0.1, hd: D / 2 + 0.1, rot: s.rot, kind: 'bld' });
  }
  for (let k = 0; k < 14; k++) { const [x, , z] = P(-26 + k * 4, 34); SP(g, 0.25, k % 2 ? M.orange : MAT.white, x, 0.1, z, 1, 10); }
  return g;
};
// ---------- 道の駅: timber hall with a deep veranda, produce stands, banners ----------
DEV_BUILD.michinoeki = function (s) {
  const g = new THREE.Group(), M = dmat(), A = archMats(), D2 = devArchMats(), W = 15, D = 10, R = mulberry(63), H = 3.6, B0 = 0.25, DI = D - 3;
  B(g, W + 1, B0, D + 1, A.pave, 0, B0 / 2, 0); shell(g, W, H, DI, A.boardLight, MAT.darkwood, B0); // body sits at the back
  g.children.slice(-6).forEach(o => o.position.z -= 1.5);
  B(g, W + 0.05, 0.9, DI + 0.05, A.yakisugi, 0, B0 + 0.45, -1.5);
  // glass storefront with goods
  for (let k = 0; k < 4; k++) { const x = -5.4 + k * 3.6; if (k === 1 || k === 2) { const dm = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.3), k === 1 ? A.win[4] : A.disp); dm.position.set(x + (k === 1 ? 1.8 : -1.8) * 0, B0 + 1.45, -1.5 + DI / 2 + 0.02); g.add(dm); } else { const dm = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.0), A.disp); dm.position.set(x, B0 + 1.6, -1.5 + DI / 2 + 0.02); g.add(dm); } B(g, 0.1, 2.6, 0.12, MAT.darkwood, x + 1.8, B0 + 1.4, -1.5 + DI / 2 + 0.05); }
  B(g, W, 0.12, 0.14, MAT.darkwood, 0, B0 + 2.75, -1.5 + DI / 2 + 0.05);
  // deep gable roof covering a veranda in front
  const over = 0.7, rise = 2.2, RD = D, y1 = rise * over / (RD / 2 + over), rbase = B0 + H - y1 + 0.05;
  const rr = sub(g, 0, 0, 0); roofPart(rr, { W, D: RD, over, rise, hip: false, rbase, mat: MAT.metalRoof[2], soffit: A.soffitWood, fascia: MAT.darkwood, gutterM: A.gutterBr });
  gableFill(g, W, RD, rise, y1, B0 + H, A.boardLight);
  for (let k = 0; k <= 5; k++) { const x = -W / 2 + 0.2 + k * (W - 0.4) / 5; B(g, 0.24, H, 0.24, MAT.darkwood, x, B0 + H / 2, D / 2 - 0.2); }
  B(g, W + 0.2, 0.3, 0.28, MAT.darkwood, 0, B0 + H - 0.15, D / 2 - 0.2);
  const sg = dynSign(6, 1.0, `道の駅 ${GAME.p ? GAME.p.island : ''}島`, '#3a2a1e', '#f6efe0'); sg.position.set(0, B0 + H + 0.7, D / 2 + 0.55); g.add(sg); B(g, 6.3, 1.25, 0.1, MAT.darkwood, 0, B0 + H + 0.7, D / 2 + 0.48);
  for (const x of [-5, -1.5, 5]) winPart(g, x, B0 + 1.8, -1.5 - DI / 2 - 0.01, Math.PI, 1.4, 1.1, { style: 'slide', trim: MAT.darkwood, sash: A.sashBr, cur: 4 }); B(g, 1.0, 2.1, 0.06, A.door[4], 2, B0 + 1.05, -1.5 - DI / 2 - 0.03);
  for (let k = 0; k < 4; k++) produceStand(g, -5.2 + k * 3.4, D / 2 - 1.6, 0, k % 2 ? 'veg' : 'mikan', R);
  nobori(g, -W / 2 - 0.6, D / 2 + 0.8, 0.2, 'みかん', '#ff8a2a', '#ffffff'); nobori(g, -W / 2 + 0.6, D / 2 + 1.0, -0.1, 'とれたて', '#ffffff', '#3f8f5a'); nobori(g, W / 2 + 0.4, D / 2 + 0.9, 0.1, '特産品', '#3f8f5a', '#ffffff');
  vendingMachine(g, W / 2 - 1.0, D / 2 - 0.9, 0, 0); vendingMachine(g, W / 2 - 2.1, D / 2 - 0.9, 0, 2); bench(g, -W / 2 + 1.4, D / 2 + 1.6, 0, MAT.wood); bench(g, 3.6, D / 2 + 1.6, 0, MAT.wood);
  const pole = new THREE.Group(); pole.add(cylM(0.12, 0.15, 7, MAT.metal, 0, 3.5, 0, 8)); const ps = dynSign(2.4, 2.4, '道の駅', '#3f8f5a', '#ffffff'); ps.position.set(0, 6.6, 0.1); pole.add(ps); const ps2 = ps.clone(); ps2.rotation.y = Math.PI; ps2.position.z = -0.1; pole.add(ps2); B(pole, 2.6, 2.6, 0.12, MAT.white, 0, 6.6, 0); pole.position.set(W / 2 + 2, 0, D / 2 + 2); g.add(pole);
  bldPlace(g, s); coll(s, 0, -1.5, W / 2, DI / 2 + 0.1); for (let k = 0; k <= 5; k++) { const [x, z] = toWorld(s, -W / 2 + 0.2 + k * (W - 0.4) / 5, D / 2 - 0.2); addCollider({ x, z, r: 0.2, kind: 'pole' }); }
  for (let k = 0; k < 4; k++) coll(s, -5.2 + k * 3.4, D / 2 - 1.6, 0.95, 0.45); return g;
};
// ---------- キャンプ場: A-frame tents, stone fire ring, picnic tables, lanterns, log cabin kiosk ----------
DEV_BUILD.camp = function (s) {
  const g = new THREE.Group(), M = dmat(), A = archMats(), D2 = devArchMats(), R = mulberry(71);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, x = Math.cos(a) * 4.5, z = Math.sin(a) * 4.5, t = sub(g, x, 0, z, -a + Math.PI / 2), m = DA.tent[k];
    const tr = new THREE.Mesh(roofGeometry(2.4, 2.3, 1.55, false), m); tr.rotation.y = Math.PI / 2; tr.castShadow = true; t.add(tr); // ridge runs front-to-back
    for (const sz of [-1, 1]) { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute([-1.15, 0, sz * 1.2, 1.15, 0, sz * 1.2, 0, 1.55, sz * 1.2], 3)); gg.setIndex(sz > 0 ? [0, 1, 2] : [0, 2, 1]); gg.computeVertexNormals(); const e = new THREE.Mesh(gg, sz > 0 ? DA.tentIn : m); e.castShadow = true; t.add(e); }
    for (const sx of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.3), m); f.position.set(sx * 0.42, 0.62, 1.32); f.rotation.set(-0.1, sx * 0.5, sx * 0.12); t.add(f); }
    CY(t, 0.025, 1.8, MAT.darkwood, 0, 0.9, 1.32, 5); B(t, 2.6, 0.02, 2.8, stdM('#6f8a5a', 0.95), 0, 0.01, 0.1);
    for (const sx of [-1, 1]) ROD(t, 0.01, stdM('#f0e8d0', 0.9), [0, 1.6, 1.25], [sx * 0.3, 0.02, 2.2]); }
  // fire ring
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; SP(g, 0.17, AM.block, Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55, 0.7, 6); }
  for (let k = 0; k < 5; k++) { const lg = cylM(0.06, 0.06, 0.7, MAT.darkwood, Math.cos(k * 1.25) * 0.12, 0.14, Math.sin(k * 1.25) * 0.12, 6); lg.rotation.set(1.1, k * 1.25, 0); g.add(lg); }
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 8), M.fire); fire.position.y = 0.45; g.add(fire); const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 6), MAT.lamp); f2.position.y = 0.35; g.add(f2);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, lg = cylM(0.2, 0.2, 1.3, MAT.wood, Math.cos(a) * 2, 0.2, Math.sin(a) * 2, 12); lg.rotation.set(0, -a, Math.PI / 2); g.add(lg); }
  // picnic tables + lantern posts + firewood
  for (const [x, z, r] of [[6.5, 1, 0.3], [-6.2, -1.5, -0.2]]) { const t = sub(g, x, 0, z, r); B(t, 1.8, 0.07, 0.8, MAT.wood, 0, 0.75, 0); for (const sz of [-1, 1]) B(t, 1.8, 0.06, 0.3, MAT.wood, 0, 0.45, sz * 0.62); for (const sx of [-0.7, 0.7]) { ROD(t, 0.04, MAT.darkwood, [sx, 0, -0.75], [sx, 0.74, 0.1]); ROD(t, 0.04, MAT.darkwood, [sx, 0, 0.75], [sx, 0.74, -0.1]); } }
  for (const [x, z] of [[3, 6], [-3.5, 5.5], [6.8, -3.5], [-6.5, 3.2]]) { const l = sub(g, x, 0, z); B(l, 0.1, 1.9, 0.1, MAT.darkwood, 0, 0.95, 0); B(l, 0.45, 0.06, 0.06, MAT.darkwood, 0.2, 1.85, 0); const lb = B(l, 0.16, 0.24, 0.16, MAT.lamp, 0.38, 1.66, 0); HOUSE_LIGHTS.push(lb); B(l, 0.2, 0.05, 0.2, AM.dark, 0.38, 1.8, 0); }
  { const w = sub(g, -5.5, 0, -5.2, 0.6); for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const lg = cylM(0.13, 0.13, 1.0, MAT.wood, -0.4 + k * 0.27 + r * 0.13, 0.13 + r * 0.24, 0, 8); lg.rotation.x = Math.PI / 2; w.add(lg); } }
  // small log-cabin kiosk
  { const c = sub(g, 0, 0, -8.2, 0), W = 3.6, D = 2.6, H = 2.3; for (let k = 0; k < 9; k++) { for (const sz of [-1, 1]) { const lg = cylM(0.13, 0.13, W + 0.3, MAT.wood, 0, 0.13 + k * 0.26, sz * D / 2, 8); lg.rotation.z = Math.PI / 2; c.add(lg); } for (const sx of [-1, 1]) { const lg = cylM(0.13, 0.13, D + 0.3, MAT.wood, sx * W / 2, 0.26 + k * 0.26, 0, 8); lg.rotation.x = Math.PI / 2; c.add(lg); } }
    B(c, W - 0.1, H, D - 0.1, A.boardLight, 0, H / 2, 0); winPart(c, -0.8, 1.3, D / 2 + 0.14, 0, 0.9, 0.8, { style: 'cross', trim: MAT.darkwood, cur: 6 }); B(c, 0.8, 1.9, 0.06, A.door[4], 0.8, 0.95, D / 2 + 0.14);
    roofPart(c, { W, D, over: 0.45, rise: 1.0, hip: false, rbase: H + 0.1 - 1.0 * 0.45 / (D / 2 + 0.45), mat: A.shingle[2], soffit: A.soffitWood, fascia: MAT.darkwood, gutter: false }); gableFill(c, W, D, 1.0, 1.0 * 0.45 / (D / 2 + 0.45), H + 0.1, A.boardLight);
    const t2 = dynSign(1.8, 0.45, 'かんりとう', '#f6ecd6', '#4a3020'); t2.position.set(0, H + 0.0, D / 2 + 0.6); c.add(t2); }
  const sg = new THREE.Group(); sg.add(box(0.18, 1.9, 0.18, M.dark, -1.1, 0.95, 0)); sg.add(box(0.18, 1.9, 0.18, M.dark, 1.1, 0.95, 0)); const t2 = dynSign(2.4, 0.6, 'キャンプ場', '#f6ecd6', '#4a3020'); t2.position.set(0, 1.6, 0.1); sg.add(t2); sg.add(box(2.6, 0.75, 0.08, M.dark, 0, 1.6, 0.04)); const sr = new THREE.Mesh(roofGeometry(2.9, 0.6, 0.25, false), MAT.kawara); sr.position.y = 2.0; sg.add(sr); sg.position.set(0, 0, 6.5); g.add(sg);
  bldPlace(g, s); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; coll(s, Math.cos(a) * 4.5, Math.sin(a) * 4.5, 1.2, 1.2); } coll(s, 0, -8.2, 1.95, 1.45); return g;
};
// ---------- 旅館: two-storey inn with layered tile roofs, lattice, shoji, entrance gable, garden ----------
DEV_BUILD.ryokan = function (s) {
  const g = new THREE.Group(), M = dmat(), A = archMats(), D2 = devArchMats(), W = 17, D = 11, R = mulberry(83), B0 = 0.4, H1 = 3.0, W2 = W - 4, D2d = D - 3, H2 = 2.6;
  B(g, W + 0.8, B0, D + 0.8, MAT.stone, 0, B0 / 2, 0);
  B(g, W, H1, D, AM.plaster[2], 0, B0 + H1 / 2, 0); B(g, W + 0.05, 1.0, D + 0.05, A.yakisugi, 0, B0 + 0.5, 0);
  for (let k = 0; k <= 8; k++) for (const sz of [-1, 1]) B(g, 0.2, H1, 0.2, MAT.darkwood, -W / 2 + k * W / 8, B0 + H1 / 2, sz * D / 2); for (const sx of [-1, 1]) for (let k = 1; k < 5; k++) B(g, 0.2, H1, 0.2, MAT.darkwood, sx * W / 2, B0 + H1 / 2, -D / 2 + k * D / 5);
  B(g, W + 0.1, 0.18, D + 0.1, MAT.darkwood, 0, B0 + H1 - 0.12, 0);
  // 1F: lattice windows between posts
  for (let k = 0; k < 8; k++) { const x = -W / 2 + (k + 0.5) * W / 8; if (Math.abs(x) < 2) continue; B(g, W / 8 - 0.5, 1.2, 0.05, A.koshi, x, B0 + 1.75, D / 2 + 0.03); B(g, W / 8 - 0.5, 1.2, 0.05, A.koshi, x, B0 + 1.75, -D / 2 - 0.03); }
  for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) { const z = -D / 2 + (k + 0.5) * D / 5; B(g, 0.05, 1.2, D / 5 - 0.5, A.koshi, sx * (W / 2 + 0.03), B0 + 1.75, z); }
  // lower roof (skirt) all around
  { const over = 1.1, rise = 1.3, y1 = rise * over / (D / 2 + over); roofPart(g, { W, D, over, rise, hip: true, rbase: B0 + H1 - y1 + 0.05, mat: MAT.kawara, soffit: A.soffitWood, fascia: MAT.darkwood, gutterM: A.gutterBr }); }
  // 2F with shoji windows and a wooden railing walkway
  const y2 = B0 + H1 + 0.3; B(g, W2, H2, D2d, AM.plaster[2], 0, y2 + H2 / 2, 0); for (let k = 0; k <= 6; k++) for (const sz of [-1, 1]) B(g, 0.18, H2, 0.18, MAT.darkwood, -W2 / 2 + k * W2 / 6, y2 + H2 / 2, sz * D2d / 2); B(g, W2 + 0.1, 0.16, D2d + 0.1, MAT.darkwood, 0, y2 + H2 - 0.1, 0); B(g, W2 + 0.1, 0.16, D2d + 0.1, MAT.darkwood, 0, y2 + 0.08, 0);
  for (let k = 0; k < 6; k++) { const x = -W2 / 2 + (k + 0.5) * W2 / 6; const sj = B(g, W2 / 6 - 0.4, 1.4, 0.05, D2.shoji, x, y2 + 1.25, D2d / 2 + 0.03); B(g, W2 / 6 - 0.4, 1.4, 0.05, D2.shoji, x, y2 + 1.25, -D2d / 2 - 0.03); for (let q = 0; q < 6; q++) B(g, 0.04, 0.6, 0.04, MAT.darkwood, x - (W2 / 6 - 0.6) / 2 + q * (W2 / 6 - 0.6) / 5, y2 + 0.42, D2d / 2 + 0.35); }
  B(g, W2, 0.06, 0.7, MAT.wood, 0, y2 + 0.08, D2d / 2 + 0.35); B(g, W2, 0.06, 0.06, MAT.darkwood, 0, y2 + 0.73, D2d / 2 + 0.68);
  { const over = 0.9, rise = 2.2, y1 = rise * over / (D2d / 2 + over); roofPart(g, { W: W2, D: D2d, over, rise, hip: true, rbase: y2 + H2 - y1 + 0.05, mat: MAT.kawara, soffit: A.soffitWood, fascia: MAT.darkwood, gutterM: A.gutterBr }); }
  // entrance porch with its own gable facing the street
  { const e = sub(g, 0, 0, D / 2); B(e, 3.2, 2.4, 0.08, MAT.darkwood, 0, B0 + 1.2, 0.02); for (const sx of [-1, 1]) B(e, 1.4, 2.2, 0.05, A.koshi, sx * 0.72, B0 + 1.1, 0.07);
    const nr = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.95), DM.noren); nr.position.set(0, B0 + 2.0, 0.6); e.add(nr); for (let k = 1; k < 4; k++) B(e, 0.03, 0.95, 0.02, MAT.white, -1.3 + k * 0.65, B0 + 2.0, 0.61);
    for (const sx of [-1, 1]) B(e, 0.26, 2.9, 0.26, MAT.darkwood, sx * 1.9, B0 + 1.45, 1.4);
    const pr = sub(e, 0, 0, 0.7, Math.PI / 2); roofPart(pr, { W: 2.4, D: 4.0, over: 0.45, rise: 1.2, hip: false, rbase: B0 + 3.0, mat: MAT.kawara, soffit: A.soffitWood, fascia: MAT.darkwood, gutter: false }); gableFill(pr, 2.4, 4.0, 1.2, 1.2 * 0.45 / 2.45, B0 + 3.0 + 1.2 * 0.45 / 2.45, MAT.darkwood);
    B(e, 4.4, 0.16, 2.4, MAT.stone, 0, B0 - 0.08, 1.2); }
  const sg = dynSign(3.2, 0.7, '旅館 しおさい', '#3a2a1e', '#f6efe0'); sg.position.set(0, B0 + H1 + 0.6, D / 2 + 1.25); g.add(sg); B(g, 3.4, 0.85, 0.08, MAT.darkwood, 0, B0 + H1 + 0.6, D / 2 + 1.2);
  // garden: pines, lanterns, bamboo fence, stepping stones
  for (const x of [-3.2, 3.2]) { const l = makeDecor('lantern'); l.position.set(x, 0, D / 2 + 3.2); g.add(l); }
  for (const px of [-W / 2 + 1.4, W / 2 - 1.6]) { const pine = sub(g, px, 0, D / 2 + 2.8); ROD(pine, 0.2, MAT.darkwood, [0, 0, 0], [0.4, 1.6, 0.1], 7); ROD(pine, 0.16, MAT.darkwood, [0.4, 1.6, 0.1], [-0.3, 2.6, 0], 7); for (let k = 0; k < 4; k++) { const c = SP(pine, 0.9 - k * 0.12, A.plant, Math.cos(k * 2.1) * 0.7, 1.7 + k * 0.45, Math.sin(k * 2.1) * 0.5, 0.42, 9); } }
  for (const sx of [-1, 1]) { const f = sub(g, sx * (W / 2 - 3.5), 0, D / 2 + 4.2); for (let k = 0; k < 14; k++) CY(f, 0.04, 1.2, stdM('#c8b47a', 0.6), -2.1 + k * 0.32, 0.6, 0, 6); for (const yy of [0.35, 0.9]) CY(f, 0.03, 4.5, stdM('#8a6a3a', 0.7), 0, yy, 0.05, 5, 0, Math.PI / 2); }
  for (let k = 0; k < 4; k++) CY(g, 0.38, 0.08, A.flag, (k % 2 - 0.5) * 0.4, 0.04, D / 2 + 2.6 + k * 0.7, 7);
  bldPlace(g, s); coll(s, 0, 0, W / 2 + 0.2, D / 2 + 0.2); return g;
};
// ---------- 水族館: white hall, barrel roof with ribs, portholes, canopy entrance, dolphin fountain ----------
DEV_BUILD.aquarium = function (s) {
  const g = new THREE.Group(), M = dmat(), A = archMats(), D2 = devArchMats(), W = 19, D = 13, H = 4.5, B0 = 0.3, R = mulberry(97);
  B(g, W + 1.2, B0, D + 3, A.pave, 0, B0 / 2, 0.8); shell(g, W, H, D, worldMat(TEX.plaster, 0.35, '#fbfbf8', 0.9), MAT.white, B0);
  B(g, W + 0.1, 0.7, D + 0.1, worldMat(TEX.concrete, 0.4, '#5fa8d0', 0.8), 0, B0 + 0.35, 0);
  // wave trim
  for (let k = 0; k < 24; k++) { const w = new THREE.Mesh(new THREE.CircleGeometry(W / 48, 12, 0, Math.PI), M.teal); w.position.set(-W / 2 + (k + 0.5) * W / 24, B0 + H - 0.05, D / 2 + 0.03); g.add(w); }
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(D / 2 + 0.6, D / 2 + 0.6, W + 0.8, 32, 1, false, 0, Math.PI), M.teal); roof.rotation.set(0, 0, Math.PI / 2); roof.scale.set(0.34, 1, 1); roof.position.y = B0 + H + 0.1; roof.castShadow = true; g.add(roof);
  for (let k = 0; k <= 8; k++) { const rb = new THREE.Mesh(new THREE.TorusGeometry(D / 2 + 0.62, 0.07, 6, 24, Math.PI), MAT.white); rb.scale.set(1, 0.34, 1); rb.position.set(-W / 2 - 0.3 + k * (W + 0.6) / 8, B0 + H + 0.1, 0); rb.rotation.y = Math.PI / 2; g.add(rb); }
  const mural = new THREE.Mesh(new THREE.PlaneGeometry(W - 6, 2.2), new THREE.MeshStandardMaterial({ map: (() => { const [c, x] = cvs(512, 96); const gr = x.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#9fe0f8'); gr.addColorStop(1, '#2f80b8'); x.fillStyle = gr; x.fillRect(0, 0, 512, 96); const cols = ['#ffb84a', '#ff6f6f', '#ffffff', '#ffd84a', '#7ff0c0']; for (let k = 0; k < 14; k++) { x.fillStyle = cols[k % 5]; const fx = 20 + k * 35, fy = 30 + (k % 3) * 20; x.beginPath(); x.ellipse(fx, fy, 12, 6, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(fx - 12, fy); x.lineTo(fx - 20, fy - 6); x.lineTo(fx - 20, fy + 6); x.fill(); x.fillStyle = '#222'; x.beginPath(); x.arc(fx + 6, fy - 1, 1.5, 0, 7); x.fill(); } x.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 0; k < 30; k++) { x.beginPath(); x.arc((k * 97) % 512, (k * 37) % 96, 2 + (k % 3), 0, 7); x.fill(); } return toTex(c, false); })(), roughness: 0.6 }));
  mural.position.set(0, B0 + 3.2, D / 2 + 0.02); g.add(mural);
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) winPart(g, sx * (W / 2 + 0.01), B0 + 2.5, -D / 2 + 2 + k * (D - 4) / 3, sx * Math.PI / 2, 1.1, 1.1, { style: 'round', trim: MAT.white, cur: 1 });
  for (let k = 0; k < 6; k++) winPart(g, -W / 2 + 1.6 + k * (W - 3.2) / 5, B0 + 2.5, -D / 2 - 0.01, Math.PI, 1.1, 1.1, { style: 'round', trim: MAT.white, cur: 1 });
  // glass entrance + canopy on round columns
  for (const sx of [-1.5, -0.5, 0.5, 1.5]) B(g, 0.95, 2.4, 0.04, A.win[4], sx, B0 + 1.2, D / 2 + 0.02); B(g, 4.1, 0.12, 0.12, A.sash, 0, B0 + 2.45, D / 2 + 0.05);
  B(g, 6.4, 0.25, 2.6, MAT.white, 0, B0 + 2.95, D / 2 + 1.3); B(g, 6.5, 0.08, 2.7, M.teal, 0, B0 + 3.12, D / 2 + 1.3); for (const sx of [-1, 1]) CY(g, 0.16, 2.85, MAT.white, sx * 2.9, B0 + 1.42, D / 2 + 2.4, 12);
  const sg = dynSign(6, 0.9, `${GAME.p ? GAME.p.island : ''}島水族館`, '#ffffff', '#1f6fa8'); sg.position.set(0, B0 + 3.12, D / 2 + 2.62); g.add(sg);
  // dolphin fountain
  { const f = sub(g, -W / 2 + 3, 0, D / 2 + 4.5); const basin = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.22, 8, 28), MAT.white); basin.rotation.x = Math.PI / 2; basin.position.y = 0.35; f.add(basin); CY(f, 1.6, 0.3, MAT.white, 0, 0.15, 0, 28); const wt = new THREE.Mesh(new THREE.CircleGeometry(1.55, 28), D2.water); wt.rotation.x = -Math.PI / 2; wt.position.y = 0.42; f.add(wt);
    CY(f, 0.25, 0.9, MAT.white, 0, 0.8, 0, 12); for (const ry of [0, Math.PI]) { const d = sub(f, 0.35, 0.95, 0, ry); for (let k = 0; k <= 10; k++) { const t = k / 10, an = Math.PI * (0.18 + 0.64 * t), r = 0.05 + 0.2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7); SP(d, r, D2.dolphin, 0, Math.sin(an) * 0.8, Math.cos(an) * 0.8, 1, 9); }
      const sn = SP(d, 0.07, D2.dolphin, 0, Math.sin(Math.PI * 0.16) * 0.8 - 0.02, Math.cos(Math.PI * 0.16) * 0.8 + 0.1, 1, 7); sn.scale.set(1, 0.8, 1.8); const fin = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), D2.dolphin); fin.position.set(0, 0.98, 0.1); fin.rotation.x = -0.4; d.add(fin);
      for (const sx of [-1, 1]) { const fl = SP(d, 0.16, D2.dolphin, sx * 0.14, Math.sin(Math.PI * 0.84) * 0.8 - 0.08, Math.cos(Math.PI * 0.84) * 0.8 - 0.05, 1, 7); fl.scale.set(1.2, 0.25, 0.7); } } }
  bldPlace(g, s); coll(s, 0, 0, W / 2 + 0.2, D / 2 + 0.2); for (const sx of [-1, 1]) { const [x, z] = toWorld(s, sx * 2.9, D / 2 + 2.4); addCollider({ x, z, r: 0.2, kind: 'pole' }); } coll(s, -W / 2 + 3, D / 2 + 4.5, 1.7, 1.7); return g;
};
// merge static development models (except windfarm, whose blades turn)
for (const k of Object.keys(DEV_BUILD)) { if (k === 'windfarm') continue; const f = DEV_BUILD[k]; DEV_BUILD[k] = function (s) { const g = f(s); return g ? mergeLocal(g) : g; }; }

// ---------- 島モータース: two bays with roll-up shutters, office, tyre stacks, flags ----------
function makeMotors() {
  const g = new THREE.Group(), M = dmat(), A = archMats(), D2 = devArchMats(), R = mulberry(13), W = 10, D = 6, H = 4.0;
  B(g, W + 0.4, 0.25, D + 1, M.conc, 0, 0.12, 0); const pad = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.4), M.conc); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.06, 4.6); pad.receiveShadow = true; g.add(pad);
  for (let k = 0; k < 3; k++) B(g, 0.1, 0.01, 3.0, MAT.white, -3.3 + k * 3.3, 0.07, 4.6);
  shell(g, W, H, D, A.siding[7], A.trim, 0.25); g.children.slice(-6).forEach(o => o.position.z -= 0.5);
  B(g, W + 0.5, 0.6, D + 0.5, M.blue, 0, H + 0.55, -0.5); B(g, W + 0.6, 0.08, D + 0.6, A.trim, 0, H + 0.88, -0.5); B(g, W + 0.2, 0.18, D + 0.2, A.trim, 0, H + 0.2, -0.5);
  const fz = D / 2 - 0.5 + 0.02;
  // bay 1: shutter half-open with a dark interior; bay 2: closed
  B(g, 3.0, 2.9, 0.05, AM.dark, -3.2, 1.7, fz - 0.01); B(g, 3.0, 1.4, 0.05, D2.rollup, -3.2, 2.45, fz + 0.01); B(g, 3.2, 0.3, 0.3, A.trim, -3.2, 3.3, fz + 0.1);
  B(g, 3.0, 2.9, 0.05, D2.rollup, 0.2, 1.7, fz + 0.01); B(g, 3.2, 0.3, 0.3, A.trim, 0.2, 3.3, fz + 0.1);
  for (const x of [-4.8, -1.6, 1.8]) B(g, 0.2, 3.3, 0.14, A.trim, x, 1.9, fz + 0.04);
  // office with glass + blinds
  B(g, 2.6, 2.1, 0.04, A.win[6], 3.5, 1.6, fz); B(g, 2.8, 0.1, 0.12, A.sash, 3.5, 2.7, fz + 0.04); B(g, 0.08, 2.2, 0.1, A.sash, 3.5, 1.6, fz + 0.04); B(g, 2.8, 0.25, 0.25, A.brick, 3.5, 0.37, fz + 0.1);
  const aw = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.0), A.awn[2]); aw.rotation.x = -Math.PI / 2 + 0.45; aw.position.set(3.5, 3.05 - Math.sin(0.45) * 0.5, fz + Math.cos(0.45) * 0.5); g.add(aw);
  const sign = dynSign(6.5, 1.0, '島モータース', '#2f7fc8', '#ffffff'); sign.userData.keep = false; sign.position.set(0, H + 0.55, D / 2 - 0.5 + 0.27); g.add(sign); g.userData.sign = sign;
  // tyre stacks, oil cans, a price board, flags
  for (const [x, n] of [[-5.4, 4], [-5.4, 3]]) { const ts = sub(g, x, 0.25, n === 4 ? 2.4 : 3.3); for (let k = 0; k < n; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.13, 8, 16), A.tire); t.rotation.x = Math.PI / 2; t.position.y = 0.13 + k * 0.26; t.castShadow = true; ts.add(t); } }
  for (let k = 0; k < 3; k++) CY(g, 0.2, 0.55, [MAT.red, DA.yellow, M.blue][k], -4.4 + k * 0.45, 0.52, 3.0, 10);
  { const pb = sub(g, 4.9, 0.25, 3.4, -0.3); B(pb, 0.08, 1.4, 0.08, AM.dark, -0.4, 0.7, 0); B(pb, 0.08, 1.4, 0.08, AM.dark, 0.4, 0.7, 0); const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), D2.chalk); bd.position.set(0, 1.15, 0.05); pb.add(bd); }
  for (const x of [-4.6, 4.6]) { g.add(cylM(0.05, 0.05, 4.2, MAT.metal, x, 2.1, 3.2, 6)); const fl = box(0.05, 1.6, 0.6, x < 0 ? M.red : M.yellow, x, 3.4, 3.5); g.add(fl); }
  return mergeLocal(g);
}
// ---------- 漁協 出荷所: steel shed with a sloped roof, fish crates, ice, scale, price board ----------
function makeShipStation(g) {
  const M = dmat(), A = archMats(), D2 = devArchMats(), R = mulberry(19);
  B(g, 5.8, 0.3, 4.8, MAT.concrete, 0, 0.05, 0);
  for (const a of [-2.6, 2.6]) for (const b of [-2.1, 2.1]) { B(g, 0.18, 2.9 + (b < 0 ? 0.25 : 0), 0.18, D2.steel, a, 1.6 + (b < 0 ? 0.12 : 0), b); }
  for (const a of [-2.6, 2.6]) ROD(g, 0.04, D2.steel, [a, 2.6, -2.1], [a, 1.8, -1.2]);
  const rf = B(g, 6.4, 0.1, 5.4, MAT.metalRoof[0], 0, 3.15, 0); rf.rotation.x = 0.07; B(g, 6.45, 0.22, 0.08, A.trim, 0, 3.0, 2.7); CY(g, 0.07, 6.4, A.gutter, 0, 2.9, 2.8, 8, 0, Math.PI / 2);
  for (let k = 0; k < 6; k++) B(g, 0.06, 0.06, 5.2, D2.steel, -2.6 + k * 1.04, 3.0, 0);
  B(g, 5.4, 2.6, 0.12, A.siding[7], 0, 1.5, -2.2); B(g, 5.5, 0.12, 0.2, A.trim, 0, 2.8, -2.15);
  // fish crates (stacked), ice box, sink, hose, scale, price board
  crateStack(g, -2.0, -1.6, 3, R); crateStack(g, -1.35, -1.6, 2, R); crateStack(g, -2.0, -0.9, 1, R, 0.2);
  for (let k = 0; k < 3; k++) { B(g, 0.6, 0.12, 0.42, DA.crate[1], -0.6 + k * 0.66, 0.26, -1.55); B(g, 0.52, 0.04, 0.34, D2.ice, -0.6 + k * 0.66, 0.33, -1.55); for (let q = 0; q < 3; q++) { const f = SP(g, 0.06, D2.fish, -0.75 + k * 0.66 + q * 0.14, 0.36, -1.55, 1, 6); f.scale.set(0.6, 0.5, 2.2); f.rotation.y = 1.57; } }
  B(g, 1.4, 0.85, 0.7, MAT.metal, 1.4, 0.62, 0.2); B(g, 1.2, 0.05, 0.55, MAT.white, 1.4, 1.07, 0.2);
  { const sc = sub(g, 1.4, 1.08, 0.2); B(sc, 0.5, 0.08, 0.4, MAT.white, 0, 0.04, 0); B(sc, 0.3, 0.2, 0.06, AM.dark, 0, 0.18, -0.17); B(sc, 0.18, 0.06, 0.01, stdM('#7fe08a', 0.4, 0, { emissive: new THREE.Color('#2a8a3a'), emissiveIntensity: 0.6 }), 0, 0.2, -0.135); }
  { const hr = sub(g, 2.45, 1.0, -1.9); const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 16), DA.yellow); t.rotation.y = Math.PI / 2; hr.add(t); B(hr, 0.1, 0.1, 0.1, MAT.metal, 0, 0, 0); }
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), D2.chalk); bd.position.set(-0.6, 1.75, -2.13); g.add(bd);
  for (let k = 0; k < 2; k++) { const b = SP(g, 0.22, k ? MAT.white : DA.ring, 2.75, 2.3 - k * 0.5, 1.6, 1, 10); }
}
// ---------- small community projects: nicer bus shelter, mikan stand, market stalls ----------
{ const _bs = PROJ_BUILD.busstop; PROJ_BUILD.busstop = function () { const r = _bs(); const s = r.g.children[0]; if (!s) return r; const A = archMats(), R = mulberry(5);
    s.remove(s.children[0]); // old flat roof
    roofPart(s, { W: 3.2, D: 1.7, over: 0.3, rise: 0.7, hip: false, rbase: 2.55, mat: MAT.kawaraRed, soffit: A.soffitWood, fascia: A.trim, gutter: false });
    gableFill(s, 3.2, 1.7, 0.7, 0.7 * 0.3 / 1.15, 2.55 + 0.7 * 0.3 / 1.15, A.boardLight);
    B(s, 3.0, 0.9, 0.06, A.boardLight, 0, 0.45, -0.78); for (const a of [-1.4, 1.4]) B(s, 0.1, 0.1, 1.5, MAT.darkwood, a, 2.45, -0.05);
    const tt = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), DA.chalk || devArchMats().chalk); tt.position.set(-0.9, 1.55, -0.72); s.add(tt);
    pottedPlant(s, -1.75, 0.2, true, R); return r; }; }
{ const _ms = PROJ_BUILD.mikanStand; PROJ_BUILD.mikanStand = function () { const r = _ms(); const s = r.g.children[0]; if (!s) return r; const A = archMats(), D2 = devArchMats(), R = mulberry(9);
    const old = s.children.find(o => o.material === MAT.kawara); if (old) s.remove(old);
    roofPart(s, { W: 1.9, D: 1.1, over: 0.3, rise: 0.55, hip: false, rbase: 1.95, mat: MAT.kawara, soffit: A.soffitWood, fascia: MAT.darkwood, gutter: false });
    gableFill(s, 1.9, 1.1, 0.55, 0.55 * 0.3 / 0.85, 1.95 + 0.55 * 0.3 / 0.85, A.boardLight); B(s, 1.9, 1.1, 0.05, A.boardLight, 0, 1.4, -0.5);
    for (let k = 0; k < 3; k++) { CY(s, 0.2, 0.12, stdM('#c8a060', 0.8), -0.6 + k * 0.6, 0.98, 0.15, 10, 0, 0, 0, 0.15); for (let q = 0; q < 4; q++) SP(s, 0.085, D2.mikan, -0.6 + k * 0.6 + (q % 2 - 0.5) * 0.12, 1.08 + Math.floor(q / 2) * 0.07, 0.15 + (q < 2 ? -0.05 : 0.05), 0.9, 7); }
    B(s, 0.22, 0.26, 0.18, MAT.darkwood, 0.75, 1.0, -0.25); B(s, 0.1, 0.01, 0.02, AM.dark, 0.75, 1.135, -0.25);
    nobori(s, 1.25, 0.5, 0.2, 'みかん', '#ff8a2a', '#ffffff'); return r; }; }
{ const _mk = PROJ_BUILD.market; PROJ_BUILD.market = function () { const r = _mk(); const R = mulberry(3); r.g.children.forEach((s, i) => { crateStack(s, -1.0, -0.3, 2, R); crateStack(s, 0.9, -0.4, 1, R); if (i !== 1) nobori(s, 1.6, 0.9, 0.2, i ? 'さかな' : '朝市', i ? '#2f6fd8' : '#e8504a', '#ffffff'); }); return r; }; }
// ---------- church extras: gutters, steps, lamps, flower beds, bench, notice board ----------
function churchExtras(g, NW, NL, NH, tz, TW, C) {
  const A = archMats(), R = mulberry(17), ey = 0.6 + NH - 0.55;
  for (const sx of [-1, 1]) { CY(g, 0.08, NL + 1.2, A.gutter, sx * ((NW + 1.6) / 2 + 0.1), ey - 0.12, -2, 8, Math.PI / 2, 0); CY(g, 0.055, ey - 0.2, A.gutter, sx * ((NW + 1.6) / 2 + 0.1), (ey - 0.2) / 2 + 0.05, -2 - NL / 2 + 0.5, 6); }
  for (let k = 0; k < 3; k++) B(g, 2.8 - k * 0.2, 0.2, 0.5, MAT.concrete, 0, 0.1 + k * 0.2, tz + TW / 2 + 1.25 - k * 0.4);
  for (const sx of [-1, 1]) { const l = sub(g, sx * 3.6, 0, tz + TW / 2 + 3.2); CY(l, 0.06, 3.0, AM.dark, 0, 1.5, 0, 8); CY(l, 0.14, 0.2, AM.dark, 0, 0.1, 0, 8); const lb = SP(l, 0.22, MAT.lamp, 0, 3.2, 0, 1.2, 10); HOUSE_LIGHTS.push(lb); CY(l, 0.26, 0.08, AM.dark, 0, 3.48, 0, 10, 0, 0, 0, 0.1); }
  for (const sx of [-1, 1]) { const bx = sx * (NW / 2 + 1.3); B(g, 0.9, 0.25, NL - 4, A.brick, bx, 0.12, -2); B(g, 0.75, 0.2, NL - 4.2, MAT.soil, bx, 0.18, -2); for (let k = 0; k < 14; k++) { const z = -2 - (NL - 5) / 2 + k * (NL - 5) / 13; SP(g, 0.18, k % 2 ? A.plant : A.plant2, bx, 0.38, z, 0.8, 7); SP(g, 0.1, MAT.flowers[(k * 3) % 5], bx + 0.08, 0.52, z + 0.05, 0.8, 6); } }
  bench(g, -4.2, tz + TW / 2 + 5.4, Math.PI * 0.85, MAT.wood);
  if (C) { const cc = (lx, lz, hw, hd) => { const [x, z] = toWorld(C, lx, lz); addCollider({ x, z, hw, hd, rot: C.rot, kind: 'bld' }); }; for (const sx of [-1, 1]) { cc(sx * (NW / 2 + 1.3), -2, 0.45, (NL - 4) / 2); const [x, z] = toWorld(C, sx * 3.6, tz + TW / 2 + 3.2); addCollider({ x, z, r: 0.15, kind: 'pole' }); } }
  { const nb = sub(g, 4.4, 0, tz + TW / 2 + 5.0, -0.4); B(nb, 0.1, 1.6, 0.1, MAT.darkwood, -0.6, 0.8, 0); B(nb, 0.1, 1.6, 0.1, MAT.darkwood, 0.6, 0.8, 0); B(nb, 1.4, 0.9, 0.06, MAT.darkwood, 0, 1.25, 0); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.78), DA.chalk || devArchMats().chalk); p.position.set(0, 1.25, 0.035); nb.add(p); const rf = new THREE.Mesh(roofGeometry(1.7, 0.5, 0.18, false), MAT.kawara); rf.position.y = 1.72; nb.add(rf); }
}
