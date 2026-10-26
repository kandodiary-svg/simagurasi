// ===================== 路線バス: 乗り降りの動き・車内・運転席からの見え方 (ver.41) =====================
// - the body now has real openings: side windows, doors, windscreen and rear window are cut out, so the glass is see-through
//   from both sides (before, a solid white shell sat behind dark glass and you could not see in or out)
// - the inside: ceiling with light strips, moquette seats with grab handles, poles, hand straps, stop buttons, the fare box,
//   the fare display over the windscreen, the numbered-ticket machine, a dashboard with meters, and a driver in uniform
// - doors open at a stop (front: swing-out, middle: sliding) and shut before the bus pulls away
// - you walk to the middle door, step up, take a ticket and sit by a window; you get off by the front door, paying on the way
// - V while riding: 外から → 運転席の目線 → 座席の目線 → 外から
const BUS2 = { view: 'driver', doorK: 0, anim: null, SEAT: [0.83, -1.46] };
BUS2.texSeat = function () { return txCanvas(64, 64, (x, w, h) => { x.fillStyle = '#2d4f86'; x.fillRect(0, 0, w, h); for (let i = 0; i < 46; i++) { x.fillStyle = ['#e2b23a', '#c8462e', '#3fa0a8'][i % 3]; x.fillRect((i * 37) % w, (i * 23 + (i >> 2) * 7) % h, 3, 3); } x.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < h; y += 4) x.fillRect(0, y, w, 1); }, true); };
BUS2.fareTex = function () { return txCanvas(512, 96, (x, w, h) => { x.fillStyle = '#0a0a0a'; x.fillRect(0, 0, w, h); x.textAlign = 'center'; for (let k = 0; k < 8; k++) { const cx = 32 + k * 64; x.font = '700 28px "M PLUS Rounded 1c",sans-serif'; x.fillStyle = '#d8d8d8'; x.fillText(String(k + 1), cx, 34); x.font = '700 30px "M PLUS Rounded 1c",sans-serif'; x.fillStyle = '#ffa020'; x.fillText(String(160 + k * 20), cx, 80); x.fillStyle = '#333'; x.fillRect(cx + 31, 6, 2, 84); } }, false); };
BUS2.rect = function (a, b, y0, y1) { const p = new THREE.Path(); p.moveTo(a, y0); p.lineTo(b, y0); p.lineTo(b, y1); p.lineTo(a, y1); p.lineTo(a, y0); return p; };
BUSX.model = function () {
  const g = new THREE.Group(), white = stdM('#f4f4f0', 0.35, 0.1), green = stdM('#1f7a52', 0.45), orange = stdM('#e88a1a', 0.45), dark = stdM('#22262a', 0.5, 0.2), grey = stdM('#8a9096', 0.45, 0.4), black = stdM('#111417', 0.4);
  // lighter tint than before, and nothing solid behind it: you see the seats and people inside, and the road from inside
  const glass = new THREE.MeshStandardMaterial({ color: '#2c4250', roughness: 0.06, metalness: 0.15, transparent: true, opacity: 0.4, depthWrite: false });
  // ----- outside fittings (the ones at the very front/back sit on the body surface) -----
  for (const sx of [-1, 1]) { const segs = sx > 0 ? [[-4.25, -0.3], [0.9, 2.95]] : [[-4.25, 4.45]]; for (const [z0, z1] of segs) B(g, 0.04, 1.2, z1 - z0, glass, sx * 1.165, 1.95, (z0 + z1) / 2);
    for (let z = -4.25; z <= 2.96; z += 1.2) { if (sx > 0 && z > -0.31 && z < 0.9) continue; B(g, 0.06, 1.22, 0.1, white, sx * 1.17, 1.95, z); } if (sx > 0) for (const z of [-0.25, 0.85, 3.2]) B(g, 0.06, 1.22, 0.1, white, 1.17, 1.95, z); else B(g, 0.06, 1.22, 0.08, black, -1.17, 1.95, 4.46); }
  for (const sx of [-1, 1]) B(g, 0.05, 1.8, 0.18, black, sx * 1.055, 1.84, 4.53);   // the corner pillars are black from inside (they read as frames, not walls)
  B(g, 2.1, 1.78, 0.04, glass, 0, 1.84, 4.575); B(g, 2.14, 0.08, 0.06, black, 0, 0.94, 4.58); B(g, 2.14, 0.06, 0.06, black, 0, 2.74, 4.58);
  B(g, 1.9, 0.95, 0.04, glass, 0, 2.15, -4.575); B(g, 1.94, 0.05, 0.06, black, 0, 1.66, -4.58); B(g, 1.94, 0.05, 0.06, black, 0, 2.64, -4.58);
  for (const sx of [-1, 1]) { B(g, 0.03, 0.22, 8.9, green, sx * 1.172, 0.82, 0); B(g, 0.03, 0.07, 8.9, orange, sx * 1.172, 1.0, 0); }
  B(g, 2.2, 0.22, 0.03, green, 0, 0.82, 4.585); B(g, 2.2, 0.07, 0.03, orange, 0, 1.0, 4.585); B(g, 2.2, 0.22, 0.03, green, 0, 0.82, -4.585);
  const tex = BUSX.signTex('島めぐり'), sm = new THREE.MeshBasicMaterial({ map: tex }); const fs = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.3), sm); fs.position.set(0, 2.86, 4.6); g.add(fs);
  const ss = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.2), sm); ss.position.set(1.19, 2.72, 2.4); ss.rotation.y = Math.PI / 2; g.add(ss); const rs = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.18), sm); rs.position.set(0, 2.82, -4.6); rs.rotation.y = Math.PI; g.add(rs);
  for (const m of [fs, ss, rs]) m.userData.keep = true;
  for (const sx of [-1, 1]) { B(g, 0.32, 0.16, 0.05, stdM('#fffbe8', 0.2, 0, { emissive: new THREE.Color('#fff2c0'), emissiveIntensity: 0.8 }), sx * 0.82, 0.72, 4.58); B(g, 0.12, 0.1, 0.05, stdM('#ffaa30', 0.3, 0, { emissive: new THREE.Color('#ff8a00'), emissiveIntensity: 0.4 }), sx * 1.04, 0.72, 4.58); B(g, 0.14, 0.42, 0.05, stdM('#d02a2a', 0.3, 0, { emissive: new THREE.Color('#a01010'), emissiveIntensity: 0.6 }), sx * 1.0, 0.85, -4.58); }
  B(g, 2.34, 0.26, 0.16, dark, 0, 0.44, 4.6); B(g, 2.34, 0.26, 0.16, dark, 0, 0.44, -4.6); B(g, 0.5, 0.18, 0.02, stdM('#e8f0e0', 0.4), 0, 0.5, 4.69); B(g, 1.2, 0.5, 0.03, black, 0, 1.15, -4.585);
  for (const sx of [-1, 1]) { ROD(g, 0.025, black, [sx * 1.05, 2.7, 4.45], [sx * 1.22, 2.55, 4.95]); ROD(g, 0.025, black, [sx * 1.22, 2.55, 4.95], [sx * 1.22, 2.1, 4.98]); B(g, 0.06, 0.38, 0.24, black, sx * 1.22, 2.0, 4.98); }
  for (const z of [2.95, -2.0]) for (const sx of [-1, 1]) { CY(g, 0.47, 0.28, black, sx * 1.04, 0.47, z, 18, 0, Math.PI / 2); CY(g, 0.26, 0.04, grey, sx * 1.19, 0.47, z, 14, 0, Math.PI / 2); const arch = new THREE.Mesh(new THREE.CircleGeometry(0.58, 18, 0, Math.PI), stdM('#0c0e10', 0.9)); arch.position.set(sx * 1.161, 0.47, z); arch.rotation.y = sx * Math.PI / 2; g.add(arch); }
  g.children.forEach(o => { if (o.position.z > 4.5) o.position.z += 0.04; else if (o.position.z < -4.5) o.position.z -= 0.04; });
  // ----- body: side walls with the windows and doors cut out, front / rear faces with the windscreens cut out, roof, floor pan -----
  const prof = [[-4.56, 0.32], [4.52, 0.32], [4.61, 0.62], [4.62, 2.78], [4.5, 3.02], [-4.48, 3.04], [-4.59, 2.88], [-4.61, 0.4]], R = BUS2.rect;
  for (const sx of [-1, 1]) { const sh = new THREE.Shape(prof.map(p => new THREE.Vector2(p[0], p[1])));
    if (sx > 0) sh.holes.push(R(-4.25, -0.3, 1.35, 2.55), R(-0.2, 0.8, 0.42, 2.58), R(0.9, 2.95, 1.35, 2.55), R(3.25, 4.15, 0.42, 2.58)); else sh.holes.push(R(-4.25, 4.45, 1.35, 2.55));   // the driver's side window runs right up to a thin corner pillar
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false, curveSegments: 2 }); geo.rotateY(-Math.PI / 2); const w = new THREE.Mesh(geo, white); w.position.x = sx > 0 ? 1.14 : -1.08; g.add(w); }
  for (const [zf, hole] of [[4.56, R(-1.05, 1.05, 0.95, 2.73)], [-4.62, R(-0.95, 0.95, 1.675, 2.625)]]) { const sh = new THREE.Shape([new THREE.Vector2(-1.08, 0.32), new THREE.Vector2(1.08, 0.32), new THREE.Vector2(1.08, 2.98), new THREE.Vector2(-1.08, 2.98)]); sh.holes.push(hole); const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false }); const f = new THREE.Mesh(geo, white); f.position.z = zf; g.add(f); }
  B(g, 2.28, 0.08, 9.0, white, 0, 3.0, 0); for (const sx of [-1, 1]) CY(g, 0.05, 9.0, white, sx * 1.1, 2.98, 0, 8, Math.PI / 2);
  B(g, 2.16, 0.06, 9.1, dark, 0, 0.35, 0);
  B(g, 1.5, 0.26, 2.4, stdM('#e2e4e2', 0.5), 0, 3.17, 0.6); B(g, 0.6, 0.12, 0.6, stdM('#d0d2d0', 0.5), 0, 3.1, -3.2);
  // ----- doors: frames stay with the body; the glass leaves are separate so they can open -----
  const doors = [];
  for (const [zc, w, kind] of [[3.7, 0.9, 'swing'], [0.3, 1.0, 'slide']]) { B(g, 0.07, 0.08, w + 0.1, dark, 1.17, 2.6, zc); B(g, 0.07, 0.06, w + 0.1, dark, 1.17, 0.42, zc); for (const k of [-1, 1]) B(g, 0.07, 2.2, 0.05, dark, 1.17, 1.5, zc + k * (w / 2 + 0.03));
    for (const k of [-1, 1]) { const hz = zc + k * w / 2, leaf = new THREE.Group(); leaf.position.set(1.18, 1.5, kind === 'swing' ? hz : zc + k * w / 4); const c = kind === 'swing' ? -k * w / 4 : 0;
      B(leaf, 0.04, 2.08, w / 2 - 0.03, glass, 0, 0, c); B(leaf, 0.06, 2.1, 0.04, dark, 0, 0, c - (w / 4 - 0.02)); B(leaf, 0.06, 2.1, 0.04, dark, 0, 0, c + (w / 4 - 0.02)); B(leaf, 0.06, 0.05, w / 2 - 0.04, dark, 0, 1.03, c); B(leaf, 0.06, 0.05, w / 2 - 0.04, dark, 0, -1.03, c); B(leaf, 0.07, 0.04, w / 2 - 0.08, stdM('#c8ccd0', 0.3, 0.6), 0.01, 0.0, c);
      leaf.userData.keep = true; const lm = mergeLocal(leaf); g.add(lm); doors.push({ leaf: lm, k, zc, w, kind, x0: 1.18 }); } }
  // ----- inside: floor (lowered at the doors with a step), ceiling with light strips -----
  const ceil = stdM('#f2f0ea', 0.6, 0, { emissive: new THREE.Color('#6a665e'), emissiveIntensity: 0.6 }), floor = stdM('#5e6466', 0.9), yel = stdM('#f2c230', 0.6), rail = stdM('#f2c230', 0.35, 0.3), wallIn = stdM('#e6e2d6', 0.7), lightM = stdM('#ffffff', 0.4, 0, { emissive: new THREE.Color('#fff6e0'), emissiveIntensity: 0.9 });
  B(g, 1.92, 0.06, 8.95, floor, -0.12, 0.62, 0); for (const [z0, z1] of [[-4.45, -0.2], [0.8, 3.25], [4.15, 4.45]]) B(g, 0.24, 0.06, z1 - z0, floor, 0.96, 0.62, (z0 + z1) / 2);
  for (const [zc, w] of [[3.7, 0.9], [0.3, 1.0]]) { B(g, 0.3, 0.1, w, floor, 0.96, 0.37, zc); B(g, 0.03, 0.2, w, dark, 0.835, 0.52, zc); B(g, 0.06, 0.012, w, yel, 0.81, 0.656, zc); B(g, 0.05, 0.012, w, yel, 1.08, 0.426, zc); }
  B(g, 2.16, 0.03, 8.95, ceil, 0, 2.93, 0); for (const sx of [-1, 1]) B(g, 0.3, 0.03, 8.0, lightM, sx * 0.5, 2.905, -0.1);
  B(g, 0.66, 0.36, 1.0, wallIn, -0.75, 0.83, 2.75); B(g, 0.26, 0.36, 0.3, wallIn, 0.95, 0.83, 3.05);   // wheel houses at the front
  // seats: moquette cushions and backs with a grab handle on top; the front ones on the driver side are priority seats
  const moq = new THREE.MeshStandardMaterial({ map: BUS2.texSeat(), roughness: 0.95 }), prio = stdM('#c8506a', 0.9), frame = stdM('#9aa0a4', 0.4, 0.5);
  for (let z = -3.9; z < 2.6; z += 0.82) for (const sx of [-1, 1]) { if (sx > 0 && z > -0.4 && z < 1.0) continue; const m = z > 1.0 && sx < 0 ? prio : moq;
    B(g, 0.84, 0.12, 0.44, m, sx * 0.62, 1.06, z); B(g, 0.84, 0.58, 0.1, m, sx * 0.62, 1.37, z - 0.22, 0, -0.08); B(g, 0.05, 0.4, 0.36, frame, sx * 0.21, 0.82, z);
    CY(g, 0.018, 0.78, rail, sx * 0.62, 1.71, z - 0.25, 6, 0, Math.PI / 2); }
  // poles, ceiling rails with hand straps (つり革), stop buttons on the walls
  for (const z of [-2.5, -0.9, 1.4]) for (const sx of [-1, 1]) CY(g, 0.022, 2.3, rail, sx * 0.22, 1.77, z, 6); CY(g, 0.022, 2.3, rail, -0.22, 1.77, 2.9, 6);
  const strap = stdM('#f4f4f0', 0.6), btn = stdM('#7a3fb0', 0.4), btnTop = stdM('#ffd84a', 0.4, 0, { emissive: new THREE.Color('#ffb020'), emissiveIntensity: 0.25 });
  for (const sx of [-1, 1]) { CY(g, 0.018, 8.0, rail, sx * 0.4, 2.62, -0.3, 6, Math.PI / 2); for (let z = -3.9; z < 3.0; z += 0.42) { B(g, 0.025, 0.2, 0.02, strap, sx * 0.4, 2.5, z); const r = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.011, 5, 12), strap); r.position.set(sx * 0.4, 2.35, z); r.rotation.y = Math.PI / 2; g.add(r); } }
  for (let z = -3.7; z < 2.4; z += 0.82) for (const sx of [-1, 1]) { if (sx > 0 && z > -0.4 && z < 1.0) continue; B(g, 0.04, 0.1, 0.08, btn, sx * 1.06, 1.5, z); B(g, 0.02, 0.05, 0.05, btnTop, sx * 1.045, 1.51, z); }
  // the front: dashboard with meters, fare box next to the driver, fare display over the windscreen; ticket machine by the middle door
  const dash = stdM('#2a2d30', 0.6), meter = stdM('#d8f0e0', 0.3, 0, { emissive: new THREE.Color('#9ae0b0'), emissiveIntensity: 0.5 });
  B(g, 1.4, 0.44, 0.44, dash, -0.36, 1.16, 4.3); B(g, 1.36, 0.02, 0.4, stdM('#3c4044', 0.55), -0.36, 1.39, 4.3); for (let i = 0; i < 6; i++) B(g, 0.03, 0.012, 0.025, stdM(['#a84a40', '#4a8a5a', '#b09a50'][i % 3], 0.5), -0.16 + i * 0.05, 1.402, 4.2); B(g, 0.7, 0.3, 0.32, dash, 0.7, 0.8, 4.34); B(g, 0.62, 0.22, 0.05, black, -0.62, 1.44, 4.1, 0, -0.35);
  for (const xx of [-0.78, -0.47]) { const mt = new THREE.Mesh(new THREE.CircleGeometry(0.075, 18), meter); mt.position.set(xx, 1.45, 4.07); mt.rotation.set(0.35, Math.PI, 0); mt.userData.keep = true; g.add(mt); }
  B(g, 0.32, 0.9, 0.3, stdM('#3a3f44', 0.5, 0.4), -0.18, 1.1, 3.25); B(g, 0.24, 0.08, 0.02, meter, -0.18, 1.48, 3.095); B(g, 0.2, 0.03, 0.12, stdM('#c0c4c8', 0.3, 0.6), -0.18, 1.56, 3.25);
  { const fm = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.3), new THREE.MeshBasicMaterial({ map: BUS2.fareTex() })); fm.position.set(0, 2.6, 4.44); fm.rotation.y = Math.PI; fm.userData.keep = true; g.add(fm); B(g, 1.8, 0.38, 0.05, black, 0, 2.6, 4.48); }
  B(g, 0.18, 0.36, 0.2, grey, 0.98, 1.5, -0.42); B(g, 0.1, 0.03, 0.08, stdM('#f4f4f0', 0.6), 0.88, 1.42, -0.42);
  // driver seat and steering wheel; the driver in uniform and cap
  B(g, 0.52, 0.12, 0.5, black, -0.62, 1.05, 3.7); B(g, 0.52, 0.7, 0.1, black, -0.62, 1.42, 3.43, 0, -0.12);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.022, 6, 20), black); sw.position.set(-0.62, 1.5, 4.0); sw.rotation.x = -0.95; g.add(sw); CY(g, 0.03, 0.42, black, -0.62, 1.35, 4.12, 6, -0.95);
  const driver = new THREE.Group(); driver.position.set(-0.62, 1.19, 3.66);
  { const uni = stdM('#26365c', 0.7), skin = stdM('#f0c8a4', 0.6), cap = stdM('#1c2844', 0.6), gold = stdM('#d8b040', 0.4, 0.5), shirt = stdM('#eef2f6', 0.6), glove = stdM('#ffffff', 0.6);
    B(driver, 0.38, 0.52, 0.24, uni, 0, 0.32, -0.05); B(driver, 0.1, 0.3, 0.02, shirt, 0, 0.42, 0.075);
    for (const sx of [-1, 1]) { B(driver, 0.14, 0.14, 0.46, uni, sx * 0.1, 0.0, 0.18); B(driver, 0.13, 0.44, 0.14, uni, sx * 0.1, -0.24, 0.4); ROD(driver, 0.05, uni, [sx * 0.2, 0.52, 0], [sx * 0.17, 0.36, 0.22]); ROD(driver, 0.045, uni, [sx * 0.17, 0.36, 0.22], [sx * 0.15, 0.42, 0.36]); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 6), glove); gl.position.set(sx * 0.15, 0.43, 0.38); driver.add(gl); }
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), skin); head.position.set(0, 0.72, 0); driver.add(head); CY(driver, 0.13, 0.08, cap, 0, 0.83, 0, 14); B(driver, 0.2, 0.02, 0.12, black, 0, 0.79, 0.12); B(driver, 0.06, 0.03, 0.01, gold, 0, 0.85, 0.13); }
  driver.traverse(o => { if (o.isMesh) o.castShadow = true; }); driver.userData.keep = true; const dm = mergeLocal(driver); g.add(dm);
  g.traverse(o => { if (o.isMesh && o.material !== glass) o.castShadow = true; });
  const m = mergeLocal(g); m.userData.signMat = sm; m.userData.doors = doors; m.userData.driver = dm; m.userData.glass = glass;
  // the line-of-sight cut-out (see.js) must never punch a hole in the bus you are looking at or riding
  m.traverse(o => { if (o.material) for (const mm of [].concat(o.material)) SEE.skip.add(mm); });
  return m;
};
// ---------- doors: open while the bus stands at a stop, shut a moment before it leaves ----------
BUS2.doors = function (B, dt) { const D = B.mesh && B.mesh.userData.doors; if (!D) return; const want = B.wait > 1.3 || (BUS2.anim && BUS2.anim.B === B) ? 1 : 0;
  const was = BUS2.doorK; BUS2.doorK = clamp(BUS2.doorK + clamp(want - BUS2.doorK, -dt * 1.5, dt * 1.5), 0, 1); if (was === BUS2.doorK && BUS2._doorsSet) return; BUS2._doorsSet = 1;
  const k = BUS2.doorK * BUS2.doorK * (3 - 2 * BUS2.doorK);
  for (const d of D) { if (d.kind === 'swing') { d.leaf.position.x = d.x0 + 0.03 * Math.min(1, k * 4); d.leaf.rotation.y = -d.k * 1.45 * k; }
    else { const out = Math.min(1, k * 3); d.leaf.position.set(d.x0 + 0.08 * out, 1.5, d.zc + d.k * (d.w / 4 + (d.w / 2 - 0.04) * Math.max(0, (k - 0.25) / 0.75))); } } };
// ---------- the bus's own frame (x: curb side, z: forward) to the world ----------
BUS2.W = function (B, lx, lz) { const c = Math.cos(B.rot), s = Math.sin(B.rot); return [B.x + c * lx + s * lz, B.z - s * lx + c * lz]; };
BUS2.L = function (B, x, z) { const c = Math.cos(B.rot), s = Math.sin(B.rot), dx = x - B.x, dz = z - B.z; return [c * dx - s * dz, s * dx + c * dz]; };
BUS2.FLOOR = 0.65; BUS2.SITK = 0.62; BUS2.dy = 0.28;   // the hero is small: sitting on the cushion (0.47 m above the floor) the feet dangle a little
// ---------- you, sitting by the window while riding ----------
BUS2.sit = function (B) {
  const [x, z] = BUS2.W(B, BUS2.SEAT[0], BUS2.SEAT[1]); PL.mesh.position.set(x, B.mesh.position.y + BUS2.FLOOR + (BUS2.dy || 0), z); PL.mesh.rotation.y = B.rot;
  const P = PL.parts, R0 = PL.rest; if (!P || !P.thighL) return;
  P.thighL.rotation.set(-1.45, 0, 0.04); P.thighR.rotation.set(-1.45, 0, -0.04); P.shinL.rotation.set(1.45, 0, 0); P.shinR.rotation.set(1.45, 0, 0);
  P.upperArmL.rotation.set(-0.42, 0, -0.12); P.upperArmR.rotation.set(-0.42, 0, 0.12); P.foreArmL.rotation.set(-0.75, 0, 0); P.foreArmR.rotation.set(-0.75, 0, 0); P.spine.rotation.set(0, 0, 0);
  if (R0 && R0.pelvis) P.pelvis.position.y = R0.pelvis.y * BUS2.SITK; const t = performance.now() / 1000; P.head.rotation.set(0, 0.55 + Math.sin(t / 2.6) * 0.3, 0);   // looking out of the window
};
// ---------- the view from inside: 運転席 / 座席 ----------
BUS2.fp = function (B) {
  const c = Math.cos(B.rot), s = Math.sin(B.rot); let x, y, z, yaw = B.rot + (CAM.fpLook || 0), pitch = CAM.fpPitch || 0;
  const e = BUS2.eye(); x = B.x + c * e[0] + s * e[2]; y = B.mesh.position.y + e[1]; z = B.z - s * e[0] + c * e[2];
  if (BUS2.view === 'driver') pitch -= 0.17;   // the top of the wheel and the dashboard show at the bottom
  else { yaw += 0.32; pitch -= 0.06; }          // a passenger's eye height, turned a little to the window
  camera.position.set(x, y, z); const cp = Math.cos(pitch); camera.lookAt(x + Math.sin(yaw) * cp, y + Math.sin(pitch), z + Math.cos(yaw) * cp);
};
BUS2.eye = function () { return BUS2.view === 'driver' ? [-0.62, 1.92, 3.52] : [BUS2.SEAT[0] - 0.19, 1.86, BUS2.SEAT[1] + 0.08]; };
{ const _sv = setViewMode; setViewMode = function (m) { const v = PL.veh;
  if (v && v.kind === 'bus') {
    if (CAM.mode === 'third' && m === 'first') BUS2.view = 'driver';
    else if (CAM.mode === 'first' && m === 'third' && BUS2.view === 'driver') { BUS2.view = 'seat'; CAM.fpLook = 0; CARSPEC.bus.eye = BUS2.eye(); UI.toast('🪑 座席の目線（V で外から）'); return; }
    CARSPEC.bus.eye = BUS2.eye(); const r = _sv.apply(this, arguments); if (CAM.mode === 'first') UI.toast('🚌 運転席の目線（V で座席の目線）'); return r; }
  return _sv.apply(this, arguments); }; }
// ---------- getting on and off: walk to the door, step up, sit / walk to the front, pay, step down ----------
BUS2.start = function (type, B) {
  const pts = [], add = (lx, lz, up) => { const [x, z] = BUS2.W(B, lx, lz); pts.push({ x, z, up }); }, S = BUS2.SEAT, F = BUS2.FLOOR;
  if (type === 'board') {
    pts.push({ x: PL.x, z: PL.z, up: 0 }); const [lx, lz] = BUS2.L(B, PL.x, PL.z);
    if (lx < 1.4) { const cz = lz > 0.3 ? 5.6 : -5.6; if (lx < -1.3) add(Math.min(lx, -1.9), cz, 0); add(2.3, cz, 0); }   // on the road side: round the front or the back
    add(2.1, 0.3, 0); add(1.0, 0.3, 0.42); add(0.55, 0.3, F); add(0.0, -0.1, F); add(0.0, S[1] + 0.05, F); add(S[0], S[1], F);
  } else {
    add(S[0], S[1], F); add(0.0, S[1] + 0.2, F); add(0.05, 2.55, F); add(0.5, 3.45, F); add(1.0, 3.7, 0.42); add(2.1, 3.75, 0);
    const st = B.stop || {}, last = pts[pts.length - 1]; if (st.x !== undefined && Math.hypot(st.x - last.x, st.z - last.z) < 7) { const [sl, sz] = BUS2.L(B, st.x, st.z); add(Math.max(2.6, sl + 0.9), sz - 1.0, 0); } else add(2.9, 2.6, 0);   // next to the bus-stop sign, not on its pole
  }
  B.wait = Math.max(B.wait, 3.4); BUS2.anim = { type, B, pts, i: 1, t: 0 };
  PL.veh = null; PL.mesh.visible = true; if (CAM.mode === 'first') setViewMode('third'); CAM.distT = 5.2; PL.speed = 0;
  if (type === 'off') { PL.x = pts[0].x; PL.z = pts[0].z; PL.y = B.mesh.position.y + F; PL.rot = B.rot; }
  UI.toast(type === 'board' ? '🎫 整理券をとって、バスに乗った' : '💴 運賃をはらって「ありがとうございました」');
};
BUS2.step = function (dt) {
  const A = BUS2.anim; if (!A) return; const B = A.B; A.t += dt; B.wait = Math.max(B.wait, 1.6); const p = A.pts[A.i]; if (!p || A.t > 14) return BUS2.finish();
  const dx = p.x - PL.x, dz = p.z - PL.z, d = Math.hypot(dx, dz), sp = (p.up > 0 || A.pts[A.i - 1].up > 0 ? 1.5 : 2.2) * dt;
  if (d <= sp) { PL.x = p.x; PL.z = p.z; A.i++; } else { PL.x += dx / d * sp; PL.z += dz / d * sp; }
  if (d > 0.05) PL.rot = angLerp(PL.rot, Math.atan2(dx, dz), Math.min(1, dt * 10));
  const floorY = B.mesh.position.y + (p.up || 0); PL.y = p.up ? lerp(PL.y, floorY, Math.min(1, dt * 9)) : lerp(PL.y, standY(PL.x, PL.z), Math.min(1, dt * 9));
  PL.mesh.position.set(PL.x, PL.y, PL.z); PL.mesh.rotation.y = PL.rot; PL.speed = 1.8; animateHero(dt, 1.8, 0);
  // the camera watches from the curb side, a little ahead of the doors
  CAM.lastDrag = performance.now() / 1000 - 0.6; CAM.yaw = angLerp(CAM.yaw, B.rot + Math.PI / 2 - 0.45, Math.min(1, dt * 2.5)); CAM.pitch = lerp(CAM.pitch, 0.3, Math.min(1, dt * 2));
  if (A.i >= A.pts.length) BUS2.finish();
};
BUS2.finish = function () {
  const A = BUS2.anim; BUS2.anim = null; if (!A) return; const B = A.B; PL.speed = 0;
  if (A.type === 'board' && B !== DV.bus) { PL.y = standY(PL.x, PL.z); return; }   // the route was changed meanwhile: that bus is gone
  if (A.type === 'board') { PL.veh = B; CAM.distT = CARSPEC.bus.cam; if (GAME.p) { GAME.p.stats.busN = (GAME.p.stats.busN || 0) + 1; GAME.dirty = true; try { GAME.check(); } catch (e) { } } B.wait = Math.max(B.wait, 2.2); UI.toast(`🚌 ${BUSX.dest()}。着いたら Space でおりる（V で運転席の目線）`); }
  else { PL.y = standY(PL.x, PL.z); B.wait = Math.max(B.wait, 1.8); }
};
{ const _up = updatePlayer; updatePlayer = function (dt, locked) { if (BUS2.anim) { try { BUS2.step(dt); } catch (e) { console.warn('bus2', e); BUS2.anim = null; } return; } return _up.apply(this, arguments); }; }
{ const _tv = toggleVehicle; toggleVehicle = function () { if (BUS2.anim) return true; return _tv.apply(this, arguments); }; }
{ const _rk = GAME.rideKey; GAME.rideKey = function () {
  if (BUS2.anim) return true; const v = PL.veh;
  if (v && v.kind === 'bus') { if (v.wait > 0.6 && v.mesh && v.mesh.userData.doors) { BUS2.start('off', v); return true; } return _rk.apply(this, arguments); }
  const t = !v && this.rideTarget && this.rideTarget(); if (t && t.kind === 'bus' && t.mesh && t.mesh.userData.doors) { BUS2.start('board', t); return true; }
  return _rk.apply(this, arguments); }; }
{ const _p = GAME.prompt; GAME.prompt = function () { if (BUS2.anim) return ''; return _p.apply(this, arguments); }; }
// every frame (after the bus has moved): doors, glass, you in your seat, the driver, and the view from inside
{ const _ub = GAME.updateBus; GAME.updateBus = function (dt) { const r = _ub.apply(this, arguments); const B = DV.bus; if (!B || !B.mesh || !B.mesh.userData.doors) return r;
  try { BUS2.doors(B, dt || 0.016); const riding = PL.veh === B, fp = riding && CAM.mode === 'first';
    if (riding) { BUS2.sit(B); PL.mesh.visible = !(fp && BUS2.view === 'seat'); }
    const dr = B.mesh.userData.driver; if (dr) dr.visible = !(fp && BUS2.view === 'driver');
    const gm = B.mesh.userData.glass; if (gm) gm.opacity = fp ? 0.1 : 0.4;
    if (fp && !window.__freecam && !(GAME.camOverride && GAME.camOverride()) && GAME.modal !== 'title') BUS2.fp(B);
  } catch (e) { console.warn('bus2', e); }
  return r; }; }
CARSPEC.bus.cam = 11.5; CARSPEC.bus.eye = BUS2.eye();
