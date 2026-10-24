// ===================== models for 島の開発 (procedural) =====================
const DM = {};
function dmat() {
  if (DM.ok) return DM; DM.ok = true;
  DM.white = worldMat(TEX.plaster, 0.35, '#f6f4ee', 0.9); DM.cream = worldMat(TEX.plaster, 0.35, '#f3e6cf', 0.9); DM.wood = worldMat(TEX.wood, 0.5, '#b98a5a', 0.75); DM.dark = worldMat(TEX.wood, 0.5, '#4a3628', 0.8);
  DM.blue = new THREE.MeshStandardMaterial({ color: '#2f7fc8', roughness: 0.5 }); DM.teal = new THREE.MeshStandardMaterial({ color: '#2aa0a8', roughness: 0.5 }); DM.red = new THREE.MeshStandardMaterial({ color: '#d8423a', roughness: 0.55 });
  DM.yellow = new THREE.MeshStandardMaterial({ color: '#f2c230', roughness: 0.5 }); DM.orange = new THREE.MeshStandardMaterial({ color: '#ff8a2a', roughness: 0.55 }); DM.green = new THREE.MeshStandardMaterial({ color: '#3f8f5a', roughness: 0.6 });
  DM.conc = worldMat(TEX.concrete, 0.3, '#d8d4cc', 0.95); DM.metal = MAT.metal; DM.glass = MAT.glass; DM.noren = new THREE.MeshStandardMaterial({ color: '#2f3f6a', roughness: 0.8, side: THREE.DoubleSide });
  DM.fire = new THREE.MeshStandardMaterial({ color: '#ff9a3a', emissive: new THREE.Color('#ff7a1a'), emissiveIntensity: 2.2, roughness: 0.8 });
  return DM;
}
// construction site: cones + barrier + sign (+ crane for big works)
const _mcOld = makeConstruction;
makeConstruction = function (at, big) {
  const g = _mcOld(at); if (!big || !at) return g; const M = dmat(), y = groundH(at.x, at.z);
  const cr = new THREE.Group(); for (const [a, b] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) cr.add(box(0.12, 16, 0.12, M.yellow, a, 8, b));
  for (let k = 1; k < 8; k++) cr.add(box(1.3, 0.08, 1.3, M.yellow, 0, k * 2, 0));
  cr.add(box(14, 0.6, 0.6, M.yellow, 4, 16.2, 0)); cr.add(box(2.2, 1.6, 1.6, M.dark, -2.4, 15.4, 0)); cr.add(box(1.6, 1.4, 1.4, MAT.white, 0.4, 15.0, 0));
  cr.add(cylM(0.02, 0.02, 7, MAT.darkframe, 9.5, 12.6, 0, 4)); cr.add(box(0.8, 0.5, 0.8, M.orange, 9.5, 9, 0));
  cr.position.set(at.x + 6, y, at.z - 4); cr.rotation.y = 0.6; g.add(cr);
  const fence = new THREE.MeshStandardMaterial({ color: '#e8eef2', roughness: 0.7 });
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, x = at.x + Math.cos(a) * 9, z = at.z + Math.sin(a) * 9; const f = box(12, 1.8, 0.06, fence, x, groundH(x, z) + 0.9, z, a + Math.PI / 2); g.add(f); }
  return g;
};
function makeMotorsOld() {
  const g = new THREE.Group(), M = dmat();
  g.add(box(10.4, 0.25, 7, M.conc, 0, 0.12, 0)); g.add(box(10, 4.2, 6, M.white, 0, 2.3, -0.5)); g.add(box(10.4, 0.4, 6.6, M.blue, 0, 4.55, -0.5));
  for (let k = 0; k < 4; k++) g.add(box(2.1, 3.0, 0.06, M.glass, -3.4 + k * 2.27, 1.8, 2.52)); g.add(box(10, 0.15, 0.1, MAT.frame, 0, 3.35, 2.53));
  const sign = dynSign(6.5, 1.0, '島モータース', '#2f7fc8', '#ffffff'); sign.userData.keep = false; sign.position.set(0, 3.95, 2.56); g.add(sign); g.userData.sign = sign;
  for (const x of [-4.6, 4.6]) { g.add(cylM(0.05, 0.05, 4.2, MAT.metal, x, 2.1, 3.2, 6)); const fl = box(0.05, 1.6, 0.6, x < 0 ? M.red : M.yellow, x, 3.4, 3.5); g.add(fl); }
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.4), M.conc); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.06, 4.6); pad.receiveShadow = true; g.add(pad);
  return g;
}
function bldPlace(g, s) { g.position.set(s.x, s.y !== undefined ? s.y : groundH(s.x, s.z), s.z); g.rotation.y = s.rot || 0; return g; }
function coll(s, lx, lz, hw, hd) { const [x, z] = toWorld(s, lx, lz); addCollider({ x, z, hw, hd, rot: s.rot || 0, kind: 'bld' }); }
const DEV_BUILD = {
  waiting(s) { const g = new THREE.Group(), M = dmat();
    g.add(box(7.4, 0.2, 4.8, M.conc, 0, 0.1, 0)); g.add(box(7, 2.8, 0.2, M.cream, 0, 1.6, -2.1)); for (const x of [-3.4, 3.4]) g.add(box(0.2, 2.8, 4.2, M.cream, x, 1.6, 0));
    for (let k = 0; k < 3; k++) g.add(box(1.8, 1.4, 0.05, M.glass, -2.2 + k * 2.2, 1.9, 2.05)); g.add(box(7, 0.6, 0.2, M.cream, 0, 2.7, 2.05)); g.add(box(7, 0.9, 0.2, M.cream, 0, 0.55, 2.05));
    const rf = new THREE.Mesh(roofGeometry(8.2, 5.6, 1.4, true), MAT.kawaraRed); rf.position.y = 3.0; rf.castShadow = true; g.add(rf);
    for (const x of [-2, 0.6]) benchGeo(g, x, 0.2, -1.4, 0);
    const sg = dynSign(2.4, 0.5, '港の待合所', '#3a2a1e', '#f6efe0'); sg.position.set(0, 3.25, 2.17); g.add(sg);
    const tt = dynSign(1.2, 0.8, '時刻表', '#ffffff', '#1f4f8a', 'M PLUS Rounded 1c'); tt.position.set(2.4, 1.6, -1.98); g.add(tt);
    bldPlace(g, s); coll(s, 0, -2.1, 3.6, 0.2); coll(s, -3.4, 0, 0.2, 2.2); coll(s, 3.4, 0, 0.2, 2.2); coll(s, 0, 2.05, 3.5, 0.15); return g; },
  pier(s) { const g = new THREE.Group(), M = dmat(), w = 3.6, y = 1.15, L = s.len + 2;
    const deck = box(w, 0.35, L, M.conc, 0, y - 0.18, L / 2 - 2); g.add(deck);
    for (let k = 0; k * 4 < L; k++) for (const x of [-1.5, 1.5]) g.add(cylM(0.18, 0.18, 6, M.conc, x, y - 3.2, k * 4, 10));
    for (let k = 1; k * 5 < L; k++) g.add(cylM(0.15, 0.18, 0.45, MAT.black, -1.6, y + 0.2, k * 5, 10));
    for (let k = 0; k * 6 < L - 2; k++) { g.add(cylM(0.04, 0.05, 3.2, MAT.metal, 1.6, y + 1.6, 2 + k * 6, 6)); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), MAT.lamp); b.position.set(1.6, y + 3.25, 2 + k * 6); g.add(b); }
    const booth = new THREE.Group(); booth.add(box(1.6, 2.2, 1.4, M.white, 0, 1.1, 0)); booth.add(box(1.9, 0.12, 1.7, M.teal, 0, 2.3, 0)); booth.add(box(1.0, 0.7, 0.04, M.glass, 0, 1.4, 0.72));
    const bs = dynSign(1.7, 0.4, '観光船のりば', '#2aa0a8', '#ffffff'); bs.position.set(0, 2.55, 0.8); booth.add(bs); booth.position.set(0.6, y, L - 4); g.add(booth);
    g.position.set(s.x, 0, s.z); g.rotation.y = s.rot;
    const mid = toWorld(s, 0, L / 2 - 2); WALKDECKS.push({ x: mid[0], z: mid[1], rot: s.rot, hw: w / 2, hd: L / 2 + 0.2, y }); { const [bx, bz] = toWorld(s, 0.6, L - 4); addCollider({ x: bx, z: bz, hw: 0.8, hd: 0.7, rot: s.rot, kind: 'bld' }); }
    return g; },
  beach(s) { const g = new THREE.Group(), M = dmat(), o = { x: s.x, z: s.z, rot: s.rot };
    const P = (lx, lz) => { const [x, z] = toWorld(o, lx, lz); return [x, groundH(x, z), z]; };
    for (let k = 0; k < 6; k++) { const [x, y, z] = P(-14 + k * 5.5, 3 + (k % 2) * 3); const pr = makeDecor('parasol'); pr.position.set(x, y, z); pr.rotation.y = k; g.add(pr); }
    const spot = (lx0) => { for (let lz = -6; lz <= 10; lz += 1) { const [x, , z] = P(lx0, lz); if (groundH(x, z) > 0.35 && groundH(x, z) < 3 && roadDistAt(x, z) > 5.5 && waterDepthAt(x, z) <= 0) return lz; } return 2; };
    { const [x, y, z] = P(10, spot(10)); const t = new THREE.Group(); for (const [a, b] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) t.add(box(0.12, 3, 0.12, M.wood, a, 1.5, b)); t.add(box(1.8, 0.12, 1.8, M.wood, 0, 3, 0)); t.add(box(1.6, 1, 0.08, M.red, 0, 3.6, 0.8)); t.add(box(0.08, 1.4, 1.4, M.wood, 0.85, 3.7, 0)); const um = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.6, 10), M.red); um.position.y = 4.6; t.add(um); t.position.set(x, y, z); g.add(t); }
    { const [x, y, z] = P(-12, spot(-12) + 1); const h = new THREE.Group(); h.add(box(7, 2.6, 4, M.wood, 0, 1.3, 0)); const rf = new THREE.Mesh(roofGeometry(8, 5.2, 1.2, false), M.teal); rf.position.y = 2.6; h.add(rf); h.add(box(5, 1.2, 0.06, M.glass, 0, 1.6, 2.02)); const sg = dynSign(2.6, 0.55, '海の家', '#ffffff', '#d8423a'); sg.position.set(0, 3.2, 2.2); h.add(sg); h.position.set(x, y, z); h.rotation.y = s.rot; g.add(h); addCollider({ x, z, hw: 3.5, hd: 2, rot: s.rot, kind: 'bld' }); }
    for (let k = 0; k < 14; k++) { const [x, , z] = P(-26 + k * 4, 34); const b = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), M.orange); b.position.set(x, 0.1, z); g.add(b); }
    return g; },
  michinoeki(s) { const g = new THREE.Group(), M = dmat(), W = 15, D = 10;
    g.add(box(W + 0.6, 0.25, D + 0.6, M.conc, 0, 0.12, 0)); g.add(box(W, 3.6, D - 2, M.wood, 0, 2, -1)); for (let k = 0; k < 5; k++) g.add(box(2.4, 2.6, 0.06, M.glass, -5.6 + k * 2.8, 1.6, 3.03));
    const rf = new THREE.Mesh(roofGeometry(W + 2, D + 1, 1.4, false), MAT.metalRoof[2]); rf.position.set(0, 3.8, 0); rf.castShadow = true; g.add(rf); for (const x of [-W / 2 + 0.3, W / 2 - 0.3]) for (const z of [3.8]) g.add(box(0.25, 3.8, 0.25, M.dark, x, 1.9, z));
    const sg = dynSign(6, 1.0, `道の駅 ${GAME.p ? GAME.p.island : ''}島`, '#3a2a1e', '#f6efe0'); sg.position.set(0, 4.15, 4.6); g.add(sg);
    for (let k = 0; k < 3; k++) { const st = new THREE.Group(); st.add(box(1.8, 0.8, 0.8, M.wood, 0, 0.4, 0)); for (let q = 0; q < 10; q++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), k === 1 ? M.green : M.orange); m.position.set(-0.7 + (q % 5) * 0.35, 0.92, -0.15 + Math.floor(q / 5) * 0.3); st.add(m); } st.position.set(-4 + k * 4, 0.25, 5.2); g.add(st); }
    const pole = new THREE.Group(); pole.add(cylM(0.12, 0.15, 7, MAT.metal, 0, 3.5, 0, 8)); const ps = dynSign(2.4, 2.4, '道の駅', '#3f8f5a', '#ffffff'); ps.position.set(0, 6.6, 0.1); pole.add(ps); const ps2 = ps.clone(); ps2.rotation.y = Math.PI; ps2.position.z = -0.1; pole.add(ps2); pole.position.set(W / 2 + 2, 0, D / 2 + 2); g.add(pole);
    bldPlace(g, s); coll(s, 0, -1, W / 2, D / 2 - 1); return g; },
  camp(s) { const g = new THREE.Group(), M = dmat(), cols = ['#e8504a', '#3a8ad8', '#f2c230', '#3f9a5a'];
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4, x = Math.cos(a) * 4.5, z = Math.sin(a) * 4.5, t = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 4), new THREE.MeshStandardMaterial({ color: cols[k], roughness: 0.8 })); t.position.set(x, 1.1, z); t.rotation.y = a; t.castShadow = true; g.add(t); }
    for (let k = 0; k < 6; k++) { const lg = cylM(0.08, 0.08, 0.9, M.dark, Math.cos(k) * 0.2, 0.12, Math.sin(k) * 0.2, 6); lg.rotation.set(Math.PI / 2, k, 0); g.add(lg); } const fire = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 8), M.fire); fire.position.y = 0.5; g.add(fire);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, lg = cylM(0.22, 0.22, 1.4, M.dark, Math.cos(a) * 2, 0.22, Math.sin(a) * 2, 10); lg.rotation.set(0, -a, Math.PI / 2); g.add(lg); }
    const sg = new THREE.Group(); sg.add(box(0.15, 1.8, 0.15, M.dark, -1, 0.9, 0)); sg.add(box(0.15, 1.8, 0.15, M.dark, 1, 0.9, 0)); const t2 = dynSign(2.4, 0.6, 'キャンプ場', '#f6ecd6', '#4a3020'); t2.position.set(0, 1.6, 0.1); sg.add(t2); sg.position.set(0, 0, 6.5); g.add(sg);
    bldPlace(g, s); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; coll(s, Math.cos(a) * 4.5, Math.sin(a) * 4.5, 1.1, 1.1); } return g; },
  ryokan(s) { const g = new THREE.Group(), M = dmat(), W = 17, D = 11;
    g.add(box(W + 0.6, 0.4, D + 0.6, MAT.stone, 0, 0.2, 0)); g.add(box(W, 3, D, M.white, 0, 1.9, 0)); g.add(box(W + 0.05, 1.0, D + 0.05, M.dark, 0, 0.9, 0));
    const r1 = new THREE.Mesh(roofGeometry(W + 2.2, D + 2.2, 1.2, true), MAT.kawara); r1.position.y = 3.35; g.add(r1);
    g.add(box(W - 4, 2.6, D - 3, M.white, 0, 5.0, 0)); const r2 = new THREE.Mesh(roofGeometry(W - 1.6, D - 0.6, 2.2, true), MAT.kawara); r2.position.y = 6.25; g.add(r2);
    for (let f = 0; f < 2; f++) for (let k = 0; k < (f ? 5 : 7); k++) { const x = -(f ? 5 : 7) + 0.5 + k * 2.2, wn = box(1.4, 1.0, 0.05, M.glass, x, f ? 5.1 : 2.2, (f ? (D - 3) : D) / 2 + 0.03); g.add(wn); HOUSE_LIGHTS.push(wn); g.add(box(1.5, 0.06, 0.08, M.dark, x, f ? 5.65 : 2.75, (f ? (D - 3) : D) / 2 + 0.05)); }
    g.add(box(3.2, 2.4, 0.1, M.dark, 0, 1.6, D / 2 + 0.05)); const nr = box(2.6, 1.0, 0.03, M.noren, 0, 2.2, D / 2 + 0.15); g.add(nr);
    const sg = dynSign(3.2, 0.7, '旅館 しおさい', '#3a2a1e', '#f6efe0'); sg.position.set(0, 3.0, D / 2 + 0.2); g.add(sg);
    for (const x of [-2.4, 2.4]) { const l = makeDecor('lantern'); l.position.set(x, 0.4, D / 2 + 2); g.add(l); }
    const pine = new THREE.Group(); pine.add(cylM(0.18, 0.25, 2.6, M.dark, 0, 1.3, 0, 8)); for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.SphereGeometry(1.1 - k * 0.2, 10, 8), new THREE.MeshStandardMaterial({ color: '#2f6a3a', roughness: 0.9 })); c.scale.y = 0.45; c.position.set(Math.cos(k * 2) * 0.6, 2.4 + k * 0.6, Math.sin(k * 2) * 0.6); pine.add(c); } pine.position.set(-W / 2 + 1.2, 0.4, D / 2 + 2.6); g.add(pine);
    bldPlace(g, s); coll(s, 0, 0, W / 2 + 0.2, D / 2 + 0.2); return g; },
  aquarium(s) { const g = new THREE.Group(), M = dmat(), W = 19, D = 13;
    g.add(box(W + 0.6, 0.3, D + 0.6, M.conc, 0, 0.15, 0)); g.add(box(W, 4.5, D, M.white, 0, 2.5, 0));
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(D / 2 + 0.6, D / 2 + 0.6, W + 0.8, 24, 1, false, 0, Math.PI), M.teal); roof.rotation.z = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.scale.set(1, 1, 0.42); roof.position.y = 4.7; g.add(roof);
    const mural = new THREE.Mesh(new THREE.PlaneGeometry(W - 2, 3), new THREE.MeshStandardMaterial({ map: (() => { const [c, x] = cvs(512, 96); const gr = x.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#7fd0f0'); gr.addColorStop(1, '#1f6fa8'); x.fillStyle = gr; x.fillRect(0, 0, 512, 96); const cols = ['#ffb84a', '#ff6f6f', '#ffffff', '#ffd84a']; for (let k = 0; k < 14; k++) { x.fillStyle = cols[k % 4]; const fx = 20 + k * 35, fy = 30 + (k % 3) * 20; x.beginPath(); x.ellipse(fx, fy, 12, 6, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(fx - 12, fy); x.lineTo(fx - 20, fy - 6); x.lineTo(fx - 20, fy + 6); x.fill(); } return toTex(c, false); })(), roughness: 0.6 }));
    mural.position.set(0, 3.0, D / 2 + 0.03); g.add(mural); g.add(box(4, 2.6, 0.06, M.glass, 0, 1.4, D / 2 + 0.04));
    const sg = dynSign(6, 0.9, `${GAME.p ? GAME.p.island : ''}島水族館`, '#ffffff', '#1f6fa8'); sg.position.set(0, 4.9, D / 2 + 0.1); g.add(sg);
    bldPlace(g, s); coll(s, 0, 0, W / 2 + 0.2, D / 2 + 0.2); return g; },
  windfarm(s) { const g = new THREE.Group(), white = new THREE.MeshStandardMaterial({ color: '#f4f6f6', roughness: 0.45 });
    for (const [x, z] of s.list) { const y = groundH(x, z), t = new THREE.Group(); const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 34, 14), white); tw.position.y = 17; tw.castShadow = true; t.add(tw); const nac = box(1.6, 1.5, 4, white, 0, 34.5, 0.4); t.add(nac);
      const hub = new THREE.Group(); hub.position.set(0, 34.5, 2.6); for (let k = 0; k < 3; k++) { const arm = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.9, 15, 0.25), white); bl.position.y = 7.6; bl.castShadow = true; arm.add(bl); arm.rotation.z = k * 2.094; hub.add(arm); } hub.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 8), white)); t.add(hub); DV.turbines.push(hub);
      t.position.set(x, y, z); t.rotation.y = -0.6; g.add(t); addCollider({ x, z, r: 1.5, kind: 'bld' }); }
    return g; },
};
