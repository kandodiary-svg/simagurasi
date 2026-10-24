// ===================== 街づくり: 建物の形（何度でも建てられる建物） =====================
// every builder draws in local space: centre (0,0), ground y = 0, front = +z (faces the road)
const CB = { M: null };
function cbM() {
  if (CB.M) return CB.M;
  const glow = (c, i = 0.1) => hrGlow(stdM(c, 0.4, 0, { emissive: new THREE.Color(c), emissiveIntensity: i }));
  return CB.M = { white: worldMat(TEX.plaster, 0.35, '#f8f4ec', 0.9), cream: worldMat(TEX.plaster, 0.35, '#f2e6d0', 0.9), conc: worldMat(TEX.concrete, 0.4, '#e4e2dc', 0.9), slab: worldMat(TEX.concrete, 0.4, '#f6f4ee', 0.9), dark: stdM('#3a4048', 0.4, 0.4),
    frame: stdM('#d8dde2', 0.35, 0.4), metal: stdM('#c8d0d6', 0.3, 0.6), glassR: stdM('#bfe6f0', 0.1, 0.2, { transparent: true, opacity: 0.45 }), terra: stdM('#c86a40', 0.75), deck: worldMat(TEX.wood, 0.5, '#c89a6a', 0.75), pave: worldMat(TEX.concrete, 0.3, '#d8d0c0', 0.95),
    asph: worldMat(TEX.asphalt || TEX.concrete, 0.4, '#5a5e64', 0.9), line: stdM('#f4f4f0', 0.6), grass: stdM('#5fa04a', 0.95), pool: new THREE.MeshStandardMaterial({ color: '#3fc4e4', roughness: 0.05, metalness: 0.15, transparent: true, opacity: 0.9 }),
    red: stdM('#d8343a', 0.5), blue: stdM('#2a7ad8', 0.5), yellow: stdM('#f2c230', 0.5), green: stdM('#2fa868', 0.5), pink: stdM('#f08fb0', 0.5), orange: stdM('#ff8a2a', 0.5), purple: stdM('#8a5ad0', 0.5), navy: stdM('#1f3a6a', 0.5),
    lampW: glow('#fff2c8'), lampR: glow('#ff3a3a', 0.6), lampB: glow('#7fd0ff'), lampP: glow('#ff7ad8'), lampY: glow('#ffd84a'), trunk: stdM('#7a5a3a', 0.9), leaf: stdM('#4f9a3a', 0.85), leaf2: stdM('#6ab04a', 0.85), seat: stdM('#2a5ab8', 0.6) };
}
const CB_COLS = () => { const M = cbM(); return [M.red, M.blue, M.yellow, M.green, M.pink, M.orange, M.purple]; };
const cbPick = (R, a) => a[Math.floor(R() * a.length)];
// facades: one small repeating window texture per style (so many buildings share one material); planes get their UVs scaled to the real number of windows
const CB_FAC = new Map();
function cbFac(o) { const k = JSON.stringify(o); if (CB_FAC.has(k)) return CB_FAC.get(k); const m = facadeTex(Object.assign({ cols: 4, rows: 4, seed: 7 }, o)); for (const t of [m.map, m.emissiveMap]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; } CB_FAC.set(k, m); return m; }
function uvScale(geo, su, sv) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; }
function cbPanel(g, w, h, m, x, y, z, ry, cols, rows) { const p = new THREE.Mesh(uvScale(new THREE.PlaneGeometry(w, h), cols / 4, rows / 4), m); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; g.add(p); return p; }
function cbFacade(g, w, h, d, y0, fac, back = true, sides = true, cols = 4, rows = 4) { const yc = y0 + h / 2, sc = Math.max(1, Math.round(cols * d / w)); cbPanel(g, w - 0.3, h, fac, 0, yc, d / 2 + 0.03, 0, cols, rows); if (back) cbPanel(g, w - 0.3, h, fac, 0, yc, -d / 2 - 0.03, Math.PI, cols, rows); if (sides) { cbPanel(g, d - 0.3, h, fac, w / 2 + 0.03, yc, 0, Math.PI / 2, sc, rows); cbPanel(g, d - 0.3, h, fac, -w / 2 - 0.03, yc, 0, -Math.PI / 2, sc, rows); } }
function cbTree(g, x, z, h, R) { const M = cbM(); CY(g, 0.18, h * 0.5, M.trunk, x, h * 0.25, z, 6); SP(g, h * 0.32, R() < 0.5 ? M.leaf : M.leaf2, x, h * 0.62, z, 0.9, 9); }
function cbLamp(g, x, z, h = 4) { const M = cbM(); CY(g, 0.06, h, M.dark, x, h / 2, z, 6); SP(g, 0.2, M.lampW, x, h + 0.1, z, 1, 8); }
function cbBase(g, w, d, m) { B(g, w, 3.6, d, m || AM.block, 0, -1.55, 0); }
function cbCar(g, x, z, ry, R) { const M = cbM(), s = sub(g, x, 0, z, ry), c = cbPick(R, [M.red, M.blue, M.white, M.dark, M.yellow, M.metal]); B(s, 1.7, 0.7, 4.0, c, 0, 0.55, 0); B(s, 1.5, 0.55, 2.0, M.dark, 0, 1.15, -0.2); }
const CB_NAMES = { hotel: ['GRAND HOSHINAMI', 'SETO BLUE HOTEL', 'HOTEL AZURE', 'OCEAN PALACE', 'CORAL BAY RESORT', 'SUNSET TERRACE', 'MARINE GARDEN'], glass: ['SKY HOTEL', 'THE HOSHINAMI', 'HARBOR TOWER', 'BLUE HORIZON', 'STAR PEARL'], office: ['HOSHINAMI BANK', 'SETO TRADING', 'ISLAND TECH', 'MARINE CORP', 'HOSHI SOFT'] };
// ---------- the catalog ----------
const CITY_TYPES = {
  hotelL: { cat: 'stay', name: '大型リゾートホテル', icon: '🏨', w: 40, d: 32, h: 46, price: 1200000, tour: 8, note: '赤い屋根の段々ホテル。プールつき（10〜14階）' },
  hotelG: { cat: 'stay', name: 'ガラスのタワーホテル', icon: '🌆', w: 24, d: 24, h: 95, price: 1500000, tour: 7, note: '20〜30階のガラス張り高層ホテル' },
  villa: { cat: 'stay', name: 'プールつきヴィラ', icon: '🏡', w: 16, d: 14, h: 6, price: 300000, tour: 2, note: '一棟貸しの小さなヴィラ' },
  condo: { cat: 'home', name: '高級コンドミニアム', icon: '🏙️', w: 24, d: 24, h: 90, price: 1000000, res: 80, note: '曲線バルコニーのタワー住宅（16〜28階）。島民 +80人' },
  midrise: { cat: 'home', name: 'マンション', icon: '🏢', w: 22, d: 20, h: 32, price: 400000, res: 30, note: '6〜10階のマンション。島民 +30人' },
  slim: { cat: 'home', name: 'スリムタワー', icon: '🗼', w: 14, d: 14, h: 80, price: 700000, res: 40, note: 'せまい土地にも建つ細長い高層住宅（16〜26階）。島民 +40人' },
  office: { cat: 'town', name: 'オフィスビル', icon: '🏦', w: 18, d: 18, h: 85, price: 800000, tour: 2, res: 10, note: '12〜26階のガラスのオフィス' },
  mall: { cat: 'town', name: 'ショッピングモール', icon: '🛍️', w: 46, d: 36, h: 16, price: 1500000, tour: 8, note: '大きなモールと駐車場' },
  cafe: { cat: 'town', name: 'カフェ・レストラン', icon: '☕', w: 12, d: 11, h: 5, price: 120000, tour: 1, note: 'テラス席のある小さなお店' },
  park: { cat: 'town', name: '噴水公園', icon: '⛲', w: 20, d: 20, h: 4, price: 80000, tour: 1, note: '噴水とベンチと木の広場' },
  chapel: { cat: 'town', name: 'ウェディングチャペル', icon: '💒', w: 14, d: 20, h: 18, price: 400000, tour: 3, note: '白い鐘楼のチャペル' },
  ferris: { cat: 'fun', name: '大観覧車', icon: '🎡', w: 32, d: 20, h: 44, price: 1800000, tour: 10, note: 'ゆっくり回る観覧車。夜はライトアップ' },
  coaster: { cat: 'fun', name: 'ジェットコースター', icon: '🎢', w: 72, d: 42, h: 30, price: 2500000, tour: 12, note: '本当に走るジェットコースター' },
  carousel: { cat: 'fun', name: 'メリーゴーラウンド', icon: '🎠', w: 18, d: 18, h: 9, price: 300000, tour: 3, note: '回る木馬' },
  drop: { cat: 'fun', name: 'フリーフォール', icon: '🗼', w: 12, d: 12, h: 58, price: 900000, tour: 5, note: '上まで上がって一気に落ちる' },
  waterpark: { cat: 'fun', name: 'ウォーターパーク', icon: '🌊', w: 46, d: 36, h: 14, price: 2000000, tour: 10, note: 'スライダーと流れるプール' },
  obs: { cat: 'fun', name: '展望タワー', icon: '📡', w: 22, d: 22, h: 100, price: 3000000, tour: 12, note: '高さ100mの赤白のタワー' },
  stadium: { cat: 'fun', name: 'スタジアム', icon: '🏟️', w: 86, d: 66, h: 26, price: 5000000, tour: 15, note: '照明つきの大きなスタジアム' },
};
const CITY_CATS = [['stay', '🏨 ホテル'], ['home', '🏢 住まい'], ['town', '🏙️ 街'], ['fun', '🎡 遊び']];
// ---------- builders ----------
const CB_BUILD = {
  hotelL(g, s, R) { const M = cbM(), W = 34, D = 13, F = 10 + Math.floor(R() * 5), fh = 3.1, z0 = -6, B0 = 0.5, H = F * fh; cbBase(g, 40, 32);
    const t = sub(g, 0, 0, z0); B(t, W + 1, B0, D + 1, AM.block, 0, B0 / 2, 0); B(t, W, H, D, M.cream, 0, B0 + H / 2, 0);
    const fac = cbFac({ wall: '#f2e6d0', glass: ['#4f8ab0', '#9fd0e8'], frame: '#ffffff', lit: 0.5 }); cbFacade(t, W, H, D, B0, fac, true, false, 11, F);
    for (let f = 1; f < F; f++) { const y = B0 + f * fh; for (const sz of [-1, 1]) { B(t, W + 0.2, 0.16, 1.3, M.white, 0, y, sz * (D / 2 + 0.65)); B(t, W + 0.2, 1.0, 0.04, M.glassR, 0, y + 0.55, sz * (D / 2 + 1.28)); } }
    const top = B0 + H; for (const [x, w, rise] of [[-W / 3, W / 3 + 0.6, 2.6], [0, W / 3 + 0.6, 3.6], [W / 3, W / 3 + 0.6, 2.6]]) { if (rise > 3) B(t, w, 2.4, D, M.cream, x, top + 1.2, 0); const rf = new THREE.Mesh(roofGeometry(w + 1.2, D + 1.2, rise, true), M.terra); rf.position.set(x, top + (rise > 3 ? 2.4 : 0), 0); rf.castShadow = true; t.add(rf); }
    for (let k = 0; k < 9; k++) { const a = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.2, 6, 12, Math.PI), M.white); a.position.set(-W / 2 + 2 + k * (W - 4) / 8, B0 + 2.6, D / 2 + 0.1); t.add(a); }
    const sg = hrSign(cbPick(R, CB_NAMES.hotel), 11, 1.3, '#103a5a', '#ffffff'); sg.position.set(0, top + 1.3, D / 2 + 0.02); t.add(sg);
    B(g, 36, 0.12, 12, M.deck, 0, 0.06, 8.5); B(g, 18, 0.16, 6.6, stdM('#f4f6f8', 0.3), -4, 0.12, 8.5); const pool = new THREE.Mesh(new THREE.PlaneGeometry(17, 5.8), M.pool); pool.rotation.x = -Math.PI / 2; pool.position.set(-4, 0.22, 8.5); g.add(pool);
    const pc = ['#e8574e', '#f2c230', '#3f8fd8', '#f08fb0']; for (let k = 0; k < 7; k++) parasol(g, -15 + k * 4.4, 13.2, pc[k % 4]); for (const [x, z] of [[-17, 4], [17, 4], [-17, 14], [17, 14], [10, 6], [14, 11]]) simplePalm(g, x, z, 6 + R() * 2, R);
    coll(s, 0, z0, W / 2 + 0.5, D / 2 + 1.4); },
  hotelG(g, s, R) { const M = cbM(), F = 20 + Math.floor(R() * 11), fh = 3.1, W = 15, D = 13, B0 = 0.5, P = 6, H = F * fh; cbBase(g, 24, 24);
    B(g, 22, P, 20, AM.win[1], 0, B0 + P / 2, 0); B(g, 22.6, 0.5, 20.6, M.slab, 0, B0 + P, 0); for (let k = 0; k <= 8; k++) for (const sz of [-1, 1]) B(g, 0.14, P, 0.14, M.frame, -11 + k * 2.75, B0 + P / 2, sz * 10);
    const y0 = B0 + P; B(g, W, H, D, stdM('#5a7a94', 0.3, 0.4), 0, y0 + H / 2, 0); const fac = cbFac({ wall: '#5a7a94', glass: ['#2f5a7a', '#7fb0d0'], frame: '#c8d4dc', lit: 0.4, curtain: false }); cbFacade(g, W, H, D, y0, fac, true, true, 7, F);
    for (let k = 0; k <= 6; k++) for (const sz of [-1, 1]) B(g, 0.25, H, 0.5, M.white, -W / 2 + k * W / 6, y0 + H / 2, sz * (D / 2 + 0.2));
    const top = y0 + H; B(g, W - 3, 4, D - 3, M.white, 0, top + 2, 0); B(g, W + 0.5, 0.45, D + 0.5, M.lampB, 0, top + 0.2, 0); CY(g, 0.08, 8, M.metal, 0, top + 8, 0, 6); SP(g, 0.3, M.lampR, 0, top + 12.2, 0, 1, 8);
    const sg = hrSign(cbPick(R, CB_NAMES.glass), 10, 1.4, '#0a1a2a', '#ffffff'); sg.position.set(0, top + 2.2, (D - 3) / 2 + 0.02); g.add(sg);
    B(g, 8, 0.35, 4, M.slab, 0, B0 + 3.6, 11.5); for (const sx of [-3.6, 3.6]) CY(g, 0.14, 3.6, M.metal, sx, B0 + 1.8, 13.2, 8); for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) cbTree(g, sx * (6 + k * 2.4), 11.2, 4.5, R);
    coll(s, 0, 0, 11.3, 10.3); },
  villa(g, s, R) { const M = cbM(); cbBase(g, 16, 14, M.pave); B(g, 15, 0.3, 13, M.pave, 0, 0.15, 0); const v = sub(g, 0, 0.3, -2.5); B(v, 9, 3, 6, M.white, 0, 1.5, 0); B(v, 4, 2.2, 0.06, AM.win[1], -1.5, 1.3, 3.03); const rf = new THREE.Mesh(roofGeometry(10, 7, 1.8, true), M.terra); rf.position.y = 3; rf.castShadow = true; v.add(rf);
    B(g, 9, 0.14, 4, M.deck, 0, 0.36, 2.8); const pool = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), M.pool); pool.rotation.x = -Math.PI / 2; pool.position.set(1.5, 0.38, 4.6); g.add(pool); B(g, 6.4, 0.12, 3.4, stdM('#f4f6f8', 0.3), 1.5, 0.32, 4.6);
    for (const sx of [-6.5, 6.5]) simplePalm(g, sx, 4, 5 + R() * 2, R); parasol(g, -3, 4.5, '#f2c230'); B(g, 15, 1.0, 0.2, M.white, 0, 0.8, -6.4); coll(s, 0, -2.5, 4.8, 3.3); },
  condo(g, s, R) { const M = cbM(), F = 16 + Math.floor(R() * 13), fh = 3.15, W = 17, D = 12, B0 = 0.5, P = 4.2, H = F * fh; cbBase(g, 24, 24); B(g, 23, P, 22, M.pave, 0, B0 + P / 2, 0); B(g, 23.05, P - 1.2, 0.08, AM.win[2], 0, B0 + P / 2 - 0.2, 11.01);
    const y0 = B0 + P, fac = cbFac({ wall: '#e8eef2', glass: ['#5a9ac0', '#a8d8ec'], frame: '#f4f6f8', lit: 0.42 });
    const core = new THREE.Mesh(uvScale(new THREE.BoxGeometry(W - 6, H, D - 1), 1.5, F / 4), fac); core.position.y = y0 + H / 2; g.add(core); for (const sx of [-1, 1]) { const cy = new THREE.Mesh(uvScale(new THREE.CylinderGeometry((D - 1) / 2, (D - 1) / 2, H, 18, 1, false, sx > 0 ? 0 : Math.PI, Math.PI), 1.5, F / 4), fac); cy.position.set(sx * (W - 6) / 2, y0 + H / 2, 0); g.add(cy); }
    const slabG = new THREE.ExtrudeGeometry(roundRect(W + 3.2, D + 3.2, 6.6), { depth: 0.24, bevelEnabled: false, curveSegments: 5 }); slabG.rotateX(-Math.PI / 2);
    const rs = roundRect(W + 3.0, D + 3.0, 6.5); rs.holes.push(new THREE.Path(roundRect(W + 2.8, D + 2.8, 6.4).getPoints(6))); const railG = new THREE.ExtrudeGeometry(rs, { depth: 1.0, bevelEnabled: false, curveSegments: 5 }); railG.rotateX(-Math.PI / 2);
    for (let f = 1; f <= F; f++) { const sl = new THREE.Mesh(slabG, M.white); sl.position.y = y0 + f * fh - 0.05; g.add(sl); if (f < F) { const rl = new THREE.Mesh(railG, M.glassR); rl.position.y = y0 + f * fh + 0.19; g.add(rl); } }
    const top = y0 + H; B(g, W - 4, 2.6, D - 3, M.white, 0, top + 1.3, 0); B(g, 5, 0.4, 4, M.pool, -3, top + 0.35, 0); for (let k = 0; k < 4; k++) simplePalm(g, -10 + (k % 2) * 20, 9 + Math.floor(k / 2) * -18, 6, R);
    coll(s, 0, 0, 11.5, 11); },
  midrise(g, s, R) { const M = cbM(), F = 6 + Math.floor(R() * 5), fh = 3, W = 18, D = 10, B0 = 0.5, z0 = -3.5, H = F * fh, col = cbPick(R, ['#efe4d2', '#e6ecf0', '#f0e0d8', '#e8e8dc']); cbBase(g, 22, 20);
    const wall = worldMat(TEX.concrete, 0.45, col, 0.9), b = sub(g, 0, 0, z0); B(b, W + 0.6, B0, D + 0.6, AM.block, 0, B0 / 2, 0); B(b, W, H, D, wall, 0, B0 + H / 2, 0);
    const fac = cbFac({ wall: col, glass: ['#6f9ab8', '#a8cce0'], frame: '#c8ccd2', lit: 0.45 }); cbFacade(b, W, H, D, B0, fac, false, false, 5, F);
    for (let f = 1; f < F; f++) { const y = B0 + f * fh; B(b, W + 0.2, 0.18, 1.4, M.slab, 0, y, D / 2 + 0.7); B(b, W + 0.2, 1.0, 0.08, M.glassR, 0, y + 0.55, D / 2 + 1.36); }
    for (let f = 1; f < F; f++) B(b, W, 0.18, 1.4, M.slab, 0, B0 + f * fh, -D / 2 - 0.7); B(b, 3, H + 3, 3, wall, W / 2 + 1.5, B0 + (H + 3) / 2, -D / 2 + 1); B(b, W + 0.3, 0.9, 0.25, wall, 0, B0 + H + 0.45, D / 2);
    const pk = new THREE.Mesh(new THREE.PlaneGeometry(20, 7), M.asph); pk.rotation.x = -Math.PI / 2; pk.position.set(0, 0.05, 6); pk.receiveShadow = true; g.add(pk); for (let k = 0; k <= 7; k++) B(g, 0.12, 0.02, 4.6, M.line, -8.75 + k * 2.5, 0.07, 5.4); for (let k = 0; k < 4; k++) if (R() < 0.7) cbCar(g, -7.5 + k * 5, 5.4, 0, R);
    coll(s, 0, z0, W / 2 + 0.3, D / 2 + 1.5); coll(s, W / 2 + 1.5, z0 - D / 2 + 1, 1.6, 1.6); },
  slim(g, s, R) { const M = cbM(), F = 16 + Math.floor(R() * 11), fh = 3.2, W = 10, D = 10, B0 = 0.5, H = F * fh, sty = cbPick(R, [['#e8eef2', '#5a9ac0', '#a8d8ec', '#ffffff'], ['#2a3a44', '#1f4a5a', '#5aa8b8', '#9ad0d8'], ['#d8c8a8', '#6a5a3a', '#c8a868', '#f2e6c8'], ['#f4f4f0', '#3f6a8a', '#8fb8d4', '#e0e4e8']]); cbBase(g, 14, 14);
    B(g, 13, 0.5, 13, AM.block, 0, 0.25, 0); B(g, W + 1.5, 5, D + 1.5, AM.win[2], 0, B0 + 2.5, 0); const y0 = B0 + 5; B(g, W, H, D, stdM(sty[0], 0.4, 0.2), 0, y0 + H / 2, 0);
    const fac = cbFac({ wall: sty[0], glass: [sty[1], sty[2]], frame: sty[3], lit: 0.45, curtain: false }); cbFacade(g, W, H, D, y0, fac, true, true, 4, F);
    for (let f = 2; f <= F; f += 2) B(g, W + 0.5, 0.18, D + 0.5, stdM(sty[3], 0.5), 0, y0 + f * fh, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 0.4, H, 0.4, stdM(sty[3], 0.5), sx * W / 2, y0 + H / 2, sz * D / 2);
    const top = y0 + H; B(g, W - 2, 2.5, D - 2, stdM(sty[3], 0.5), 0, top + 1.25, 0); const sp = new THREE.Mesh(new THREE.ConeGeometry(2.2, 7, 4), stdM(sty[3], 0.4, 0.4)); sp.rotation.y = Math.PI / 4; sp.position.y = top + 6; g.add(sp); SP(g, 0.3, M.lampR, 0, top + 9.8, 0, 1, 8);
    coll(s, 0, 0, W / 2 + 1, D / 2 + 1); },
  office(g, s, R) { const M = cbM(), F = 12 + Math.floor(R() * 15), fh = 3.3, W = 13, D = 13, B0 = 0.5, H = F * fh, tint = cbPick(R, [['#1f3a52', '#4a7a9a'], ['#2a3a3a', '#5a8a8a'], ['#3a3020', '#8a7a5a'], ['#20304a', '#6080b0']]); cbBase(g, 18, 18);
    B(g, W + 2, 0.5, D + 2, AM.block, 0, 0.25, 0); B(g, W, H, D, stdM(tint[0], 0.3, 0.5), 0, B0 + H / 2, 0); const fac = cbFac({ wall: tint[0], glass: [tint[0], tint[1]], frame: '#9aa4ae', lit: 0.55, curtain: false }); cbFacade(g, W, H, D, B0, fac, true, true, 6, F);
    for (let f = 1; f <= F; f++) if (f % 3 === 0) B(g, W + 0.3, 0.25, D + 0.3, M.frame, 0, B0 + f * fh, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(g, 0.5, H, 0.5, M.frame, sx * W / 2, B0 + H / 2, sz * D / 2);
    const top = B0 + H; B(g, W - 4, 3, D - 4, M.frame, 0, top + 1.5, 0); const sg = hrSign(cbPick(R, CB_NAMES.office), 9, 1.2, '#ffffff', '#1a3a5a'); sg.position.set(0, top + 1.6, (D - 4) / 2 + 0.02); g.add(sg); SP(g, 0.25, M.lampR, 0, top + 3.3, 0, 1, 8);
    B(g, 6, 3.2, 0.08, AM.win[0], 0, B0 + 1.6, D / 2 + 0.05); for (const sx of [-1, 1]) cbTree(g, sx * 6.5, 7.5, 4, R); coll(s, 0, 0, W / 2 + 0.6, D / 2 + 0.6); },
  mall(g, s, R) { const M = cbM(), W = 42, D = 20, H = 12, z0 = -7; cbBase(g, 46, 36);
    B(g, W, H, D, M.cream, 0, H / 2, z0); B(g, W + 0.6, 0.6, D + 0.6, M.white, 0, H, z0); const at = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, H + 3, 20, 1, false, -Math.PI / 2, Math.PI), AM.win[2]); at.position.set(0, (H + 3) / 2, z0 + D / 2); g.add(at); SP(g, 6.2, M.glassR, 0, H + 3, z0 + D / 2, 0.35, 16);
    for (const sx of [-1, 1]) { B(g, 12, 6, 0.1, AM.win[1], sx * 13, 3.2, z0 + D / 2 + 0.05); for (let k = 0; k < 3; k++) { const c = cbPick(R, CB_COLS()); B(g, 3.6, 2.4, 0.15, c, sx * (8.5 + k * 4.5), 8.4, z0 + D / 2 + 0.1); } }
    const sg = hrSign('HOSHINAMI MALL', 16, 2.2, '#c8343a', '#ffffff'); sg.position.set(0, H + 1.5, z0 + D / 2 + 0.4); g.add(sg); for (let k = 0; k < 6; k++) B(g, 2, 1.2, 1.4, M.metal, -15 + k * 6, H + 0.9, z0 - 3);
    const pk = new THREE.Mesh(new THREE.PlaneGeometry(42, 13), M.asph); pk.rotation.x = -Math.PI / 2; pk.position.set(0, 0.05, 10.5); pk.receiveShadow = true; g.add(pk);
    for (let row = 0; row < 2; row++) for (let k = 0; k < 14; k++) { const x = -19.5 + k * 3; B(g, 0.12, 0.02, 4.8, M.line, x - 1.5, 0.07, 7.5 + row * 6); if (R() < 0.6) cbCar(g, x, 7.5 + row * 6, 0, R); }
    for (let k = 0; k < 5; k++) { const x = -16 + k * 8; CY(g, 0.06, 8, M.metal, x, 4, 3.4, 6); B(g, 0.04, 1.6, 1.0, cbPick(R, CB_COLS()), x, 7.2, 3.9); } coll(s, 0, z0, W / 2 + 0.4, D / 2 + 1.2); },
  cafe(g, s, R) { const M = cbM(), col = cbPick(R, ['#f6efe2', '#e8f2ec', '#f8e8e0', '#2f4a5a']); B(g, 11, 0.2, 10, M.pave, 0, 0.1, 0); const b = sub(g, 0, 0.2, -2); B(b, 8, 3.6, 5.5, worldMat(TEX.plaster, 0.35, col, 0.9), 0, 1.8, 0); B(b, 6, 2.4, 0.06, AM.win[0], 0, 1.4, 2.78);
    const aw = cbPick(R, [M.red, M.green, M.blue, M.orange]); const a = B(b, 8.4, 0.08, 1.8, aw, 0, 3.1, 3.5); a.rotation.x = 0.3; B(b, 8.6, 0.5, 6, M.white, 0, 3.85, 0); const sg = hrSign(cbPick(R, ['CAFE', 'BAKERY', 'DINER', 'GELATO', 'SUSHI', 'PIZZA']), 3.4, 0.7, '#ffffff', '#5a3a2a'); sg.position.set(0, 3.85, 3.02); b.add(sg);
    for (let k = 0; k < 3; k++) { const x = -3.3 + k * 3.3; parasol(g, x, 3.4, cbPick(R, ['#ffffff', '#e8574e', '#2a7ad8', '#2fa868'])); } cbLamp(g, 5, 4.5, 3.2); coll(s, 0, -2, 4.2, 2.9); },
  park(g, s, R) { const M = cbM(); B(g, 20, 0.2, 20, M.grass, 0, 0.1, 0); const pl = new THREE.Mesh(new THREE.CircleGeometry(7, 28), M.pave); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.22; g.add(pl);
    CY(g, 3.2, 0.7, M.conc, 0, 0.55, 0, 24); CY(g, 2.9, 0.1, M.pool, 0, 0.86, 0, 24); CY(g, 0.5, 1.6, M.conc, 0, 1.4, 0, 12); CY(g, 1.3, 0.3, M.conc, 0, 2.2, 0, 16); CY(g, 1.1, 0.06, M.pool, 0, 2.36, 0, 16);
    const jet = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.4, 10, 1, true), new THREE.MeshStandardMaterial({ color: '#cfefff', transparent: true, opacity: 0.55, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false })); jet.position.y = 3.6; jet.rotation.x = Math.PI; jet.userData.keep = true; g.add(jet); CITY.addAnim({ kind: 'jet', o: jet });
    for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + 0.785; bench(g, Math.cos(a) * 5.4, Math.sin(a) * 5.4, -a - Math.PI / 2); cbLamp(g, Math.cos(a + 0.4) * 7.5, Math.sin(a + 0.4) * 7.5, 3.6); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, r = 8.6; cbTree(g, Math.cos(a) * r, Math.sin(a) * r, 4 + R() * 2, R); } for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283; for (let q = 0; q < 6; q++) SP(g, 0.25, cbPick(R, [M.pink, M.yellow, M.red, M.purple]), Math.cos(a) * 4.4 + (R() - 0.5) * 1.5, 0.3, Math.sin(a) * 4.4 + (R() - 0.5) * 1.5, 0.8, 6); }
    coll(s, 0, 0, 3.3, 3.3); },
  chapel(g, s, R) { const M = cbM(); B(g, 14, 0.3, 20, M.pave, 0, 0.15, 0); const c = sub(g, 0, 0.3, -2); B(c, 8, 5, 12, M.white, 0, 2.5, 0); const rf = new THREE.Mesh(roofGeometry(9, 13, 3.2, false), stdM('#5a6a7a', 0.6)); rf.rotation.y = Math.PI / 2; rf.position.y = 5; rf.castShadow = true; c.add(rf);
    for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) B(c, 0.06, 2.4, 1.0, cbPick(R, [M.lampB, M.lampP, M.lampY]), sx * 4.03, 2.8, -4 + k * 2.6);
    const t = sub(c, 0, 0, 7); B(t, 3.6, 10, 3.6, M.white, 0, 5, 0); B(t, 2.6, 2.2, 2.6, M.white, 0, 11.1, 0); const sp = new THREE.Mesh(new THREE.ConeGeometry(2.0, 4.5, 4), stdM('#5a6a7a', 0.6)); sp.rotation.y = Math.PI / 4; sp.position.y = 14.5; t.add(sp); B(t, 0.2, 1.6, 0.2, M.yellow, 0, 17.4, 0); B(t, 1.0, 0.2, 0.2, M.yellow, 0, 17.6, 0); SP(t, 0.5, M.yellow, 0, 11.2, 1.35, 1, 8);
    B(t, 1.8, 2.8, 0.1, stdM('#6a4a2a', 0.6), 0, 1.4, 1.82); for (let k = 0; k < 3; k++) B(g, 4 - k * 0.6, 0.18, 1, M.white, 0, 0.36 + k * 0.18, 9.5 - k * 0.6); for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) cbTree(g, sx * 5.5, -8 + k * 6, 4, R); coll(s, 0, -2, 4.3, 6.3); coll(s, 0, 5, 1.9, 1.9); },
  ferris(g, s, R) { const M = cbM(), Rw = 17, ay = Rw + 4, n = 24; B(g, 32, 0.3, 20, M.pave, 0, 0.15, 0);
    for (const sz of [-1.6, 1.6]) for (const sx of [-1, 1]) ROD(g, 0.45, M.white, [sx * 9, 0, sz * 2.2], [0, ay, sz], 8); CY(g, 0.6, 4.2, M.metal, 0, ay, 0, 12, Math.PI / 2);
    const wheel = new THREE.Group(); wheel.position.set(0, ay, 0); for (const z of [-1.2, 1.2]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(Rw, 0.22, 6, 64), M.white); rim.position.z = z; wheel.add(rim); const rim2 = new THREE.Mesh(new THREE.TorusGeometry(Rw * 0.55, 0.15, 6, 40), M.white); rim2.position.z = z; wheel.add(rim2); }
    for (let k = 0; k < n; k++) { const a = k / n * 6.283; for (const z of [-1.2, 1.2]) ROD(wheel, 0.08, M.white, [0, 0, z], [Math.cos(a) * Rw, Math.sin(a) * Rw, z], 4); const l = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 4), cbPick(R, [M.lampP, M.lampY, M.lampB, M.lampW])); l.position.set(Math.cos(a) * (Rw + 0.3), Math.sin(a) * (Rw + 0.3), 1.3); wheel.add(l); }
    const wm = mergeLocal(wheel); wm.userData.keep = true; g.add(wm);
    const cab = new THREE.BoxGeometry(1.8, 2.0, 1.8); cab.translate(0, -1.6, 0); const gond = new THREE.InstancedMesh(cab, new THREE.MeshStandardMaterial({ roughness: 0.5 }), n); gond.userData.keep = true; gond.castShadow = true; gond.frustumCulled = false; const cols = ['#e8574e', '#f2c230', '#3f8fd8', '#46a86a', '#f08fb0', '#ff8a2a']; for (let k = 0; k < n; k++) gond.setColorAt(k, new THREE.Color(cols[k % cols.length])); g.add(gond);
    CITY.addAnim({ kind: 'ferris', wheel: wm, gond, n, Rw, ay, ph: R() * 6 });
    const st = sub(g, 0, 0, 6.5); B(st, 10, 3, 4, M.white, 0, 1.5, 0); B(st, 11, 0.3, 5, M.red, 0, 3.15, 0); const sg = hrSign('SKY WHEEL', 5, 0.8, '#d8343a', '#ffffff'); sg.position.set(0, 3.9, 2.0); st.add(sg); coll(s, 0, 6.5, 5.2, 2.2); coll(s, -9, 0, 1, 3); coll(s, 9, 0, 1, 3); },
  coaster(g, s, R) { const M = cbM(); B(g, 72, 0.25, 42, M.pave, 0, 0.12, 0);
    const P = [[-28, 4, 14], [-10, 4, 15], [6, 4, 15], [22, 26, 15], [30, 22, 6], [30, 3, -4], [22, 12, -14], [8, 16, -16], [-6, 6, -16], [-18, 13, -12], [-30, 9, -6], [-33, 5, 4]].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const curve = new THREE.CatmullRomCurve3(P, true, 'catmullrom', 0.5), L = curve.getLength(), red = M.red;
    const up = new THREE.Vector3(0, 1, 0), N = Math.ceil(L / 1.0), pts = curve.getSpacedPoints(N); const left = [], right = [];
    for (let i = 0; i <= N; i++) { const t = curve.getTangentAt(i / N), sd = new THREE.Vector3().crossVectors(t, up).normalize(); left.push(pts[i].clone().addScaledVector(sd, 0.6)); right.push(pts[i].clone().addScaledVector(sd, -0.6)); }
    for (const arr of [left, right]) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arr, true), N, 0.16, 6, true), red));
    const sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => p.clone().add(new THREE.Vector3(0, -0.45, 0))), true), N, 0.3, 6, true), red); sp.castShadow = true; g.add(sp);
    for (let i = 0; i < N; i += 2) { const p = pts[i], t = curve.getTangentAt(i / N); const tie = B(g, 1.5, 0.12, 0.3, M.dark, p.x, p.y - 0.15, p.z); tie.rotation.y = Math.atan2(t.x, t.z); }
    for (let i = 0; i < N; i += 4) { const p = pts[i]; if (p.y > 1.4) CY(g, 0.22, p.y - 0.5, M.white, p.x, (p.y - 0.5) / 2, p.z, 6); }
    const st = sub(g, -18, 0, 14); B(st, 16, 1.4, 5, M.white, 0, 0.7, 2.5); B(st, 17, 0.3, 7, M.blue, 0, 5.4, 1.5); for (const sx of [-7.5, 7.5]) for (const sz of [-1, 4]) CY(st, 0.15, 5.4, M.white, sx, 2.7, sz, 6); const sg = hrSign('THUNDER COASTER', 8, 1.0, '#1f3a6a', '#f2c230'); sg.position.set(0, 6.1, 5.0); st.add(sg);
    const cg = mergeGeometries([new THREE.BoxGeometry(1.5, 0.8, 2.0).translate(0, 0.5, 0).toNonIndexed(), new THREE.BoxGeometry(1.3, 0.5, 0.3).translate(0, 1.1, -0.6).toNonIndexed(), new THREE.BoxGeometry(1.3, 0.5, 0.3).translate(0, 1.1, 0.5).toNonIndexed()]); const im = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.2 }), 5); im.userData.keep = true; im.castShadow = true; im.frustumCulled = false; for (let k = 0; k < 5; k++) im.setColorAt(k, new THREE.Color(k === 0 ? '#f2c230' : '#2a7ad8')); g.add(im);
    CITY.addAnim({ kind: 'coaster', curve, L, im, n: 5, u: R(), v: 4 }); coll(s, -18, 16.5, 8, 2.5); },
  carousel(g, s, R) { const M = cbM(); CY(g, 8, 0.4, M.pave, 0, 0.2, 0, 32); const rot = new THREE.Group(); rot.position.y = 0.4; CY(rot, 7, 0.3, stdM('#c8925a', 0.6), 0, 0.15, 0, 32); CY(rot, 0.6, 6, M.yellow, 0, 3, 0, 12);
    const stripe = txCanvas(256, 64, (x, W, H) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#e8574e' : '#fff6e0'; x.fillRect(i * W / 16, 0, W / 16, H); } }); const roof = new THREE.Mesh(new THREE.ConeGeometry(7.6, 3.2, 32, 1), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.6 })); roof.position.y = 7.6; rot.add(roof); CY(rot, 7.6, 0.8, M.yellow, 0, 5.8, 0, 32); SP(rot, 0.5, M.yellow, 0, 9.4, 0, 1, 10);
    for (let k = 0; k < 32; k++) { const a = k / 32 * 6.283; SP(rot, 0.12, k % 2 ? M.lampY : M.lampW, Math.cos(a) * 7.65, 5.4, Math.sin(a) * 7.65, 1, 6); }
    const horses = []; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, r = k % 2 ? 5.2 : 3.6; horses.push({ a, r }); CY(rot, 0.04, 4.8, M.yellow, Math.cos(a) * r, 3.0, -Math.sin(a) * r, 6); }
    const rm = mergeLocal(rot); rm.userData.keep = true; g.add(rm);
    const hp = []; { const body = new THREE.SphereGeometry(0.45, 8, 6); body.scale(0.75, 0.75, 1.5); hp.push(body.toNonIndexed()); const nk = new THREE.BoxGeometry(0.3, 0.7, 0.35); nk.rotateX(-0.4); nk.translate(0, 0.45, 0.6); hp.push(nk.toNonIndexed()); hp.push(new THREE.BoxGeometry(0.28, 0.3, 0.6).translate(0, 0.8, 0.85).toNonIndexed()); for (const [lx, lz] of [[-0.2, 0.4], [0.2, 0.4], [-0.2, -0.4], [0.2, -0.4]]) hp.push(new THREE.BoxGeometry(0.1, 0.6, 0.1).translate(lx, -0.5, lz).toNonIndexed()); }
    const im = new THREE.InstancedMesh(mergeGeometries(hp), new THREE.MeshStandardMaterial({ roughness: 0.6 }), 12); im.userData.keep = true; im.castShadow = true; im.frustumCulled = false; for (let k = 0; k < 12; k++) im.setColorAt(k, new THREE.Color(cbPick(R, ['#ffffff', '#f2e6d0', '#a0703e', '#f08fb0', '#8a5ad0']))); g.add(im);
    CITY.addAnim({ kind: 'carousel', rot: rm, im, horses, ph: R() * 6 }); coll(s, 0, 0, 7.6, 7.6); },
  drop(g, s, R) { const M = cbM(), H = 52; B(g, 12, 0.3, 12, M.pave, 0, 0.15, 0); B(g, 2.4, H, 2.4, M.white, 0, H / 2, 0); for (let y = 4; y < H; y += 6) B(g, 2.6, 0.5, 2.6, M.red, 0, y, 0); B(g, 4, 2.4, 4, M.blue, 0, H + 1.2, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) SP(g, 0.3, M.lampR, sx * 2, H + 2.6, sz * 2, 1, 8);
    const ring = new THREE.Group(); const tr = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.4, 8, 20), M.yellow); tr.rotation.x = Math.PI / 2; ring.add(tr); for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; B(ring, 0.7, 1.0, 0.6, M.seat, Math.cos(a) * 3.0, -0.4, Math.sin(a) * 3.0).rotation.y = -a; }
    const rm = mergeLocal(ring); rm.userData.keep = true; rm.position.y = 2; g.add(rm); CITY.addAnim({ kind: 'drop', o: rm, H, ph: R() * 30 }); const sg = hrSign('SKY DROP', 4, 0.8, '#1f3a6a', '#ffffff'); sg.position.set(0, 3, 1.25); g.add(sg); coll(s, 0, 0, 3.6, 3.6); },
  waterpark(g, s, R) { const M = cbM(); B(g, 46, 0.25, 36, M.pave, 0, 0.12, 0); const flip = pts => pts.map(p => new THREE.Vector2(p.x, -p.y));
    const shape = (pts, mat, y) => { const ge = new THREE.ShapeGeometry(new THREE.Shape(flip(pts)), 2); ge.rotateX(-Math.PI / 2); const m = new THREE.Mesh(ge, mat); m.position.y = y; g.add(m); };
    shape(blob(-8, 4, 12, 7, 61), M.pool, 0.3); shape(blob(-8, 4, 12.8, 7.8, 61).map(v => v.clone()), M.white, 0.27);
    const ring = new THREE.Mesh(new THREE.RingGeometry(10, 12.5, 40), M.pool); ring.rotation.x = -Math.PI / 2; ring.scale.set(1.25, 0.95, 1); ring.position.set(0, 0.29, 0); g.add(ring);
    const tw = sub(g, 14, 0, -8); B(tw, 6, 12, 6, M.blue, 0, 6, 0); B(tw, 7, 0.4, 7, M.yellow, 0, 12.2, 0); const rf = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.4, 4), M.red); rf.rotation.y = Math.PI / 4; rf.position.y = 13.6; tw.add(rf);
    const slide = (pts, mat) => { const c = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x + 14, y, z - 8))); g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.75, 8, false), mat)); };
    slide([[2, 11.5, 2], [6, 10, 6], [3, 8, 11], [-3, 6, 9], [-4, 4, 4], [0, 2.5, 1], [4, 1.5, 4], [5, 0.6, 10]], M.yellow);
    slide([[-2, 11.5, 2], [-7, 9, 3], [-10, 6, 0], [-8, 3.5, -4], [-12, 1.2, -6], [-16, 0.6, -5]], M.red);
    { const pts = []; for (let k = 0; k <= 28; k++) { const a = k / 28 * 6.283 * 1.6; pts.push([Math.cos(a) * 5, 11.5 - k * 0.38, Math.sin(a) * 5]); } slide(pts, M.green); }
    shape(blob(18, 10, 4, 3, 71, 18), M.pool, 0.3);
    for (let k = 0; k < 9; k++) parasol(g, -20 + k * 4.2, 15.5, cbPick(R, ['#e8574e', '#f2c230', '#3f8fd8', '#f08fb0'])); for (const [x, z] of [[-21, -14], [-21, 0], [21, 16], [-3, 15], [8, 14]]) simplePalm(g, x, z, 6, R);
    const sg = hrSign('SPLASH LAGOON', 8, 1.2, '#16a0b8', '#ffffff'); sg.position.set(14, 10, -4.9); g.add(sg); coll(s, 14, -8, 3.2, 3.2); },
  obs(g, s, R) { const M = cbM(), H = 70; B(g, 22, 0.3, 22, M.pave, 0, 0.15, 0); const b0 = 8, b1 = 2.2; const lv = []; for (let y = 0; y <= H; y += 7) lv.push([y, lerp(b0, b1, Math.pow(y / H, 0.8))]);
    for (let i = 1; i < lv.length; i++) { const [y0, w0] = lv[i - 1], [y1, w1] = lv[i], m = i % 2 ? M.red : M.white; for (const sx of [-1, 1]) for (const sz of [-1, 1]) ROD(g, 0.35, m, [sx * w0, y0, sz * w0], [sx * w1, y1, sz * w1], 6);
      for (const [ax, az, bx, bz] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) { ROD(g, 0.12, m, [ax * w0, y0, az * w0], [bx * w1, y1, bz * w1], 4); ROD(g, 0.12, m, [bx * w0, y0, bz * w0], [ax * w1, y1, az * w1], 4); } }
    CY(g, 6, 1, M.white, 0, H, 0, 24); CY(g, 5.8, 3.2, AM.win[2], 0, H + 2.1, 0, 24); CY(g, 6.3, 0.8, M.white, 0, H + 4.1, 0, 24); for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; SP(g, 0.18, M.lampW, Math.cos(a) * 6.35, H + 4.6, Math.sin(a) * 6.35, 1, 6); }
    for (let y = H + 4.5; y < H + 26; y += 6) { const i = (y - H) / 6 | 0; B(g, 1.6 - i * 0.3, 6, 1.6 - i * 0.3, i % 2 ? M.white : M.red, 0, y + 3, 0); } SP(g, 0.5, M.lampR, 0, H + 28.5, 0, 1, 8);
    B(g, 12, 4, 6, M.white, 0, 2, 8); const sg = hrSign('HOSHINAMI TOWER', 9, 1.1, '#d8343a', '#ffffff'); sg.position.set(0, 4.8, 11.05); g.add(sg); for (const sx of [-1, 1]) for (const sz of [-1, 1]) coll(s, sx * 7.5, sz * 7.5, 0.6, 0.6); coll(s, 0, 8, 6, 3); },
  stadium(g, s, R) { const M = cbM(), a0 = 30, b0 = 21; B(g, 86, 0.25, 66, M.pave, 0, 0.12, 0);
    const field = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({ map: txCanvas(512, 512, (x, W, H) => { for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#4f9a3a' : '#5aa846'; x.fillRect(i * W / 12, 0, W / 12, H); } x.strokeStyle = '#ffffff'; x.lineWidth = 6; x.strokeRect(60, 110, W - 120, H - 220); x.beginPath(); x.moveTo(W / 2, 110); x.lineTo(W / 2, H - 110); x.stroke(); x.beginPath(); x.arc(W / 2, H / 2, 50, 0, 7); x.stroke(); }), roughness: 0.95 }));
    field.rotation.x = -Math.PI / 2; field.scale.set(a0, b0, 1); field.position.y = 0.3; g.add(field); const track = new THREE.Mesh(new THREE.RingGeometry(1, 1.12, 64), stdM('#c8584a', 0.9)); track.rotation.x = -Math.PI / 2; track.scale.set(a0, b0, 1); track.position.y = 0.28; g.add(track);
    const ov = (sec, mat, n = 72) => { const pos = [], idx = []; for (let e = 0; e < sec.length - 1; e++) { const base = pos.length / 3; for (let i = 0; i <= n; i++) { const t = i / n * 6.283, c = Math.cos(t), sn = Math.sin(t); for (const [o, y] of [sec[e], sec[e + 1]]) pos.push(c * (a0 * 1.12 + o), y, sn * (b0 * 1.12 + o)); } for (let i = 0; i < n; i++) { const a = base + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setIndex(idx); ge.computeVertexNormals(); const m = new THREE.Mesh(ge, mat); m.castShadow = m.receiveShadow = true; m.material.side = THREE.DoubleSide; g.add(m); };
    const sec = [[0, 1.2]]; for (let k = 0; k < 8; k++) { sec.push([1 + k * 1.5, 1.2 + k * 1.4]); sec.push([1 + k * 1.5 + 1.5, 1.2 + k * 1.4]); } ov(sec, stdM('#2a5ab8', 0.6, 0, { side: THREE.DoubleSide })); ov([[13.5, 12.4], [14, 13], [14, 0], [0, 0], [0, 1.2]], stdM('#e4e2dc', 0.8, 0, { side: THREE.DoubleSide })); ov([[6, 17], [16, 15.5]], stdM('#f4f6f8', 0.4, 0.2, { side: THREE.DoubleSide }));
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const x = sx * (a0 * 1.12 + 17), z = sz * (b0 * 1.12 + 10); CY(g, 0.5, 30, M.metal, x, 15, z, 8); B(g, 5, 3, 0.6, M.lampW, x, 31, z, Math.atan2(-x, -z)); coll(s, x, z, 1, 1); }
    const sg = hrSign('HOSHINAMI STADIUM', 14, 1.8, '#1f3a6a', '#ffffff'); sg.position.set(0, 15, b0 * 1.12 + 14.2); g.add(sg); coll(s, 0, b0 * 1.12 + 7, a0 * 0.9, 6); coll(s, 0, -b0 * 1.12 - 7, a0 * 0.9, 6); coll(s, a0 * 1.12 + 7, 0, 6, b0 * 0.9); coll(s, -a0 * 1.12 - 7, 0, 6, b0 * 0.9); },
};
