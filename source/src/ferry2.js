// ===================== フェリー: 船内を歩ける (ver.42) =====================
// The ship is no longer a fixed spot you are pinned to. Aboard you walk with WASD:
//   main deck (stern deck, side walkways under the upper deck, foredeck) — 客室 (doors at the back and both sides) — the stairs at
//   the stern — the open upper deck round the funnel. The cabin has real windows (you see the sea from inside and the seats from
//   outside), seat rows, a carpeted 桟敷 area, tables, a kiosk and vending machines. Inside, the camera stays in the room.
// Your position is kept in the ship's own frame, so you move with her as she sails and turns.
const FW = { on: false, lx: 0, lz: 0, ly: 0, lrot: 0, R: 0.28 };
FERRY.C1 = { z0: -10.5, z1: 6.5, w: FERRY.B - 2.3, h: 2.5 };   // the passenger cabin (deck 1)
FERRY.DOORZ = -1.0;                                             // the side doors
FERRY.ST = { x0: 2.2, x1: 3.2, z0: -14.0, z1: -10.8 };          // the stern stairs (both sides, mirrored)
FERRY.UW = 3.8; FERRY.BOLL = [[1.6, 11.5], [-1.6, 11.5], [0.8, -14.75], [-0.8, -14.75]]; FERRY.BENCH = [-8.0, -5.8, -3.6];                                                 // half width of the upper deck
FERRY.hb = t => FERRY.B / 2 * (t < 0.08 ? 0.9 + t / 0.08 * 0.1 : t < 0.6 ? 1 : Math.pow(Math.max(0, 1 - ((t - 0.6) / 0.4) ** 2), 0.62));
FERRY.deckH = z => { const t = (z + FERRY.L / 2) / FERRY.L; return FERRY.D + 0.7 * Math.max(0, (t - 0.68) / 0.32) ** 2; };
FERRY.U2 = () => FERRY.D + FERRY.C1.h + 0.14;
FERRY.make = function () {
  if (FERRY.made) return FERRY.made;
  const L = FERRY.L, B = FERRY.B, D = FERRY.D, g = new THREE.Group(), std = (c, r = 0.5, m = 0, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, o));
  const W = std('#f4f5f6', 0.45), BLUE = std('#1f62b8', 0.4), NAVY = std('#1d2a44', 0.5), DECK = std('#4f8a64', 0.8), RAIL = std('#e8ecef', 0.35, 0.3), BLACK = std('#23262a', 0.6), ORANGE = std('#f06a1e', 0.5), GREY = std('#8a9096', 0.5, 0.4);
  const CAB = std('#f2f0ea', 0.6, 0, { emissive: new THREE.Color('#3a3832'), emissiveIntensity: 0.5 });
  const hull = new THREE.Mesh(FERRY.hullGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide })); g.add(hull);
  const bx = (w, h, d, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.x = rx; g.add(o); return o; };
  const cy = (r, h, m, x, y, z, rz = 0, rx = 0, seg = 10) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); g.add(o); return o; };
  const winD = new THREE.MeshStandardMaterial({ map: FERRY.winTex(false), emissiveMap: FERRY.winTex(true), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0, roughness: 0.25, metalness: 0.2 }); FERRY.winMat = winD;
  const winPlane = (len, h, x, y, z, ry, rep) => { const m = winD.clone(); m.map = winD.map.clone(); m.map.repeat.set(rep, 1); m.map.needsUpdate = true; m.emissiveMap = winD.emissiveMap.clone(); m.emissiveMap.repeat.set(rep, 1); m.emissiveMap.needsUpdate = true; (FERRY.wins = FERRY.wins || []).push(m); const o = new THREE.Mesh(new THREE.PlaneGeometry(len, h), m); o.position.set(x, y, z); o.rotation.y = ry; g.add(o); };
  const glass = std('#3d6f8f', 0.08, 0.2, { transparent: true, opacity: 0.42, depthWrite: false });
  // ----- the passenger cabin: walls with real windows and doors -----
  const c1 = FERRY.C1, c1z = (c1.z0 + c1.z1) / 2, c1l = c1.z1 - c1.z0, hw = c1.w / 2, Dz = FERRY.DOORZ, wt = 0.1, y0 = D, y1 = D + 0.95, y2 = D + 1.95, y3 = D + c1.h, yd = D + 2.1;
  // a wall run along one axis between a and b, with a window band and optional door gaps; `at(u)` gives [x,z] for position u along it
  const wallRun = (a, b, doors, along, at, panesEvery) => {
    const cuts = [a, ...doors.flatMap(d => [d[0], d[1]]), b], segs = []; for (let i = 0; i < cuts.length; i += 2) segs.push([cuts[i], cuts[i + 1]]);
    const box = (u0, u1, ya, yb, m, th = wt) => { const len = u1 - u0; if (len <= 0.01) return; const [x, z] = at((u0 + u1) / 2); bx(along === 'z' ? th : len, yb - ya, along === 'z' ? len : th, m, x, (ya + yb) / 2, z); };
    for (const [u0, u1] of segs) { box(u0, u1, y0, y1, CAB); box(u0, u1, y2, y3, CAB); box(u0 + 0.1, u1 - 0.1, y1, y2, glass, 0.03);
      const n = Math.max(1, Math.round((u1 - u0) / panesEvery)); for (let k = 0; k <= n; k++) box(u0 + (u1 - u0) * k / n - 0.06, u0 + (u1 - u0) * k / n + 0.06, y1, y2, CAB, wt + 0.02); }
    for (const [d0, d1] of doors) { box(d0, d1, yd, y3, CAB); for (const u of [d0, d1]) box(u - 0.06, u + 0.06, y0, yd, NAVY, wt + 0.04);
      // the sliding glass doors stand open beside the doorway
      for (const [u, s] of [[d0, -1], [d1, 1]]) { const [x, z] = at(u + s * 0.32); bx(along === 'z' ? 0.04 : 0.62, yd - y0 - 0.05, along === 'z' ? 0.62 : 0.04, glass, x + (along === 'z' ? Math.sign(x) * 0.09 : 0), (y0 + yd) / 2, z + (along === 'x' ? Math.sign(z) * 0.09 : 0)); } } };
  for (const sx of [-1, 1]) wallRun(c1.z0, c1.z1, [[Dz - 0.6, Dz + 0.6]], 'z', u => [sx * (hw - wt / 2), u], 1.5);
  wallRun(-hw, hw, [[-0.7, 0.7]], 'x', u => [u, c1.z0 + wt / 2], 1.4);
  wallRun(-hw, hw, [], 'x', u => [u, c1.z1 - wt / 2], 1.3);
  for (const sx of [-1, 1]) for (const z of [c1.z0, c1.z1]) bx(0.16, c1.h, 0.16, W, sx * hw, D + c1.h / 2, z);
  // blue band under the upper deck, on the outside only
  for (const sx of [-1, 1]) bx(0.04, 0.22, c1l + 0.12, BLUE, sx * (hw + 0.02), D + c1.h - 0.25, c1z);
  for (const z of [c1.z0 - 0.02, c1.z1 + 0.02]) bx(c1.w + 0.08, 0.22, 0.04, BLUE, 0, D + c1.h - 0.25, z);
  // ----- inside: carpet, ceiling with lights, seats, the 桟敷 (carpeted area), tables, kiosk, vending machines -----
  const carpet = std('#3c5a7a', 0.95, 0, { emissive: new THREE.Color('#1a2838'), emissiveIntensity: 0.4 }), ceil = std('#f4f2ec', 0.6, 0, { emissive: new THREE.Color('#6a665e'), emissiveIntensity: 0.6 });
  const lightM = std('#ffffff', 0.4, 0, { emissive: new THREE.Color('#fff4dc'), emissiveIntensity: 0.9 }); FERRY.cabLight = lightM;
  bx(c1.w - 0.2, 0.02, c1l - 0.2, carpet, 0, D + 0.01, c1z); bx(c1.w - 0.2, 0.04, c1l - 0.2, ceil, 0, D + c1.h - 0.04, c1z);
  for (const sx of [-1, 1]) bx(0.35, 0.02, c1l - 1.2, lightM, sx * 1.2, D + c1.h - 0.07, c1z);
  const seatM = std('#22406e', 0.9, 0, { emissive: new THREE.Color('#0c1830'), emissiveIntensity: 0.4 }), seatF = std('#9aa0a6', 0.4, 0.5), wood = std('#a07850', 0.7, 0, { emissive: new THREE.Color('#302010'), emissiveIntensity: 0.3 });
  const OB = []; FERRY.OB = OB;   // obstacles on the cabin floor: [x0, z0, x1, z1]
  for (let k = 0; k < 5; k++) { const z = 1.0 + k * 1.05; for (const sx of [-1, 1]) { const xc = sx * 1.85;
    bx(1.9, 0.12, 0.5, seatM, xc, D + 0.45, z); bx(1.9, 0.62, 0.1, seatM, xc, D + 0.8, z - 0.27, -0.12); bx(1.9, 0.04, 0.04, seatF, xc, D + 1.13, z - 0.3);
    for (const e of [-0.95, 0.95]) bx(0.06, 0.3, 0.5, seatF, xc + e, D + 0.55, z); bx(0.06, 0.4, 0.4, seatF, xc, D + 0.2, z);
    OB.push([Math.min(xc - 0.98, xc + 0.98), z - 0.34, Math.max(xc - 0.98, xc + 0.98), z + 0.26]); } }
  // 桟敷 (carpeted raised area) on the port side, with low tables and cushions
  const tatami = std('#b8b07a', 0.9, 0, { emissive: new THREE.Color('#2a2814'), emissiveIntensity: 0.4 }), zab = std('#b84a3a', 0.9);
  tatami.map = txCanvas(128, 256, (x, w, h) => { x.fillStyle = '#c9c48c'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(90,80,40,0.35)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(0, i * 6.4); x.lineTo(w, i * 6.4); x.lineWidth = 0.6; x.stroke(); } x.fillStyle = '#4a5a3a'; x.fillRect(0, 0, w, 5); x.fillRect(0, h - 5, w, 5); x.fillRect(0, h / 2 - 2, w, 4); }, true); tatami.map.repeat.set(2, 3.5);
  bx(2.0, 0.3, 6.4, tatami, -2.0, D + 0.15, -6.2); for (const z of [-9.4, -3.0]) bx(2.06, 0.06, 0.06, wood, -2.0, D + 0.3, z); for (const x of [-3.0, -1.0]) bx(0.06, 0.06, 6.46, wood, x, D + 0.3, -6.2); FERRY.TAT = [-3.0, -9.4, -1.0, -3.0];
  for (const z of [-8.3, -6.2, -4.1]) { bx(0.7, 0.28, 0.9, wood, -2.1, D + 0.44, z); OB.push([-2.5, z - 0.5, -1.7, z + 0.5]); for (const s of [-1, 1]) bx(0.42, 0.06, 0.42, zab, -2.1 + s * 0.62, D + 0.33, z); }
  // tables with benches on the starboard side
  for (const z of [-8.4, -6.2, -4.0]) { bx(1.2, 0.05, 0.75, wood, 2.3, D + 0.72, z); bx(0.1, 0.7, 0.1, seatF, 2.3, D + 0.36, z); for (const s of [-1, 1]) bx(1.2, 0.08, 0.36, seatM, 2.3, D + 0.42, z + s * 0.62); OB.push([1.55, z - 0.85, 3.05, z + 0.85]); }
  // kiosk (売店) at the back on the starboard side, vending machines on the port side
  bx(1.4, 1.0, 0.5, wood, 2.25, D + 0.5, -9.75); bx(1.5, 0.05, 0.6, std('#e8e2d4', 0.5), 2.25, D + 1.02, -9.75); OB.push([1.5, -10.4, 3.05, -9.45]);
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.32), new THREE.MeshBasicMaterial({ map: txCanvas(256, 76, (x, w, h) => { x.fillStyle = '#c8462e'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '700 46px "M PLUS Rounded 1c",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('売　店', w / 2, h / 2 + 2); }) })); sg.position.set(2.25, D + 1.75, -10.33); g.add(sg); }
  for (let k = 0; k < 3; k++) bx(0.36, 0.3, 0.3, std(['#e8b030', '#4aa860', '#d85a40'][k], 0.6), 1.85 + k * 0.4, D + 1.2, -9.75);
  for (const [x, c] of [[-2.55, '#d23a30'], [-1.85, '#2a6ac8']]) { bx(0.66, 1.8, 0.62, std(c, 0.4), x, D + 0.9, -10.0); bx(0.5, 0.9, 0.02, std('#f0f4f8', 0.3, 0, { emissive: new THREE.Color('#d8e8f8'), emissiveIntensity: 0.5 }), x, D + 1.2, -9.68); }
  OB.push([-2.95, -10.4, -1.5, -9.62]);
  // ----- upper deck (deck 2): the bridge in front, an open observation deck behind with benches -----
  const U = D + c1.h, UW = FERRY.UW; bx(UW * 2 + 0.1, 0.14, c1l + 0.6, DECK, 0, U + 0.07, c1z);
  const br = { z0: 1.5, z1: 6.3, w: B - 3.0, h: 2.1 }; bx(br.w, br.h, br.z1 - br.z0, W, 0, U + br.h / 2 + 0.14, (br.z0 + br.z1) / 2);
  winPlane(br.w - 0.4, 0.8, 0, U + 1.55, br.z1 + 0.01, 0, 4); for (const s of [1, -1]) winPlane(br.z1 - br.z0 - 0.8, 0.8, s * (br.w / 2 + 0.01), U + 1.55, (br.z0 + br.z1) / 2, s * Math.PI / 2, 3);
  winPlane(br.w - 1.2, 0.7, 0, U + 1.5, br.z0 - 0.01, Math.PI, 3);
  bx(br.w + 2.4, 0.16, 1.4, W, 0, U + br.h + 0.2, br.z1 - 0.7); bx(br.w + 0.3, 0.2, br.z1 - br.z0 + 0.4, BLUE, 0, U + br.h + 0.36, (br.z0 + br.z1) / 2);
  cy(0.09, 3.2, RAIL, 0, U + br.h + 1.9, br.z0 + 1.6); const rb = bx(2.2, 0.12, 0.25, GREY, 0, U + br.h + 2.9, br.z0 + 1.6); FERRY.radar = rb;
  const lamp = (c, x, y, z) => { const m = new THREE.MeshStandardMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: 0.2 }); (FERRY.lamps = FERRY.lamps || []).push(m); const o = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), m); o.position.set(x, y, z); g.add(o); };
  lamp('#ffffff', 0, U + br.h + 3.5, br.z0 + 1.6); lamp('#ff3a2a', -(br.w / 2 + 1.2), U + br.h + 0.45, br.z1 - 0.7); lamp('#2aff6a', br.w / 2 + 1.2, U + br.h + 0.45, br.z1 - 0.7);
  { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 2.8, 16), BLUE); f.scale.z = 1.6; f.position.set(0, U + 1.55, -3.2); g.add(f); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.97, 0.99, 0.35, 16), W); band.scale.z = 1.6; band.position.set(0, U + 2.25, -3.2); g.add(band);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.95, 0.3, 16), BLACK); top.scale.z = 1.6; top.position.set(0, U + 3.0, -3.2); g.add(top);
    const st = txCanvas(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 22 : 54, a = -Math.PI / 2 + k * Math.PI / 5; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.closePath(); x.fill(); });
    for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshStandardMaterial({ map: st, transparent: true, roughness: 0.5 })); m.position.set(s * 1.07, U + 1.45, -3.2); m.rotation.y = s * Math.PI / 2; g.add(m); } }
  // ----- railings (3D runs: [x, y, z] points; top rail, mid rail, posts) -----
  const rail = (pts, h = 1.0) => { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); if (len < 0.05) continue;
      for (const f of [1, 0.5]) ROD(g, f === 1 ? 0.035 : 0.028, RAIL, [a[0], a[1] + h * f, a[2]], [b[0], b[1] + h * f, b[2]], 5);
      const n = Math.max(1, Math.round(len / 1.6)); for (let k = i === 0 ? 0 : 1; k <= n; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, z = a[2] + (b[2] - a[2]) * t; ROD(g, 0.03, RAIL, [x, y, z], [x, y + h, z], 5); } } };
  const U2 = U + 0.14, ST = FERRY.ST;
  // main deck: all round the hull edge, following the sheer up to the bow
  { const side = []; for (let k = 0; k <= 26; k++) { const t = 0.025 + k / 26 * 0.94, z = -L / 2 + t * L; side.push([FERRY.hb(t) - 0.25, FERRY.deckH(z) + 0.02, z]); }
    const bow = side[side.length - 1]; rail([...side.map(p => [-p[0], p[1], p[2]]).reverse(), ...side, [-bow[0], bow[1], bow[2]]], 0.95); }
  // upper deck: round the edge, open at the top of each stair
  rail([[ST.x1, U2, c1.z0 - 0.3], [UW, U2, c1.z0 - 0.3], [UW, U2, c1.z1 + 0.3], [-UW, U2, c1.z1 + 0.3], [-UW, U2, c1.z0 - 0.3], [-ST.x1, U2, c1.z0 - 0.3]]);
  rail([[-ST.x0, U2, c1.z0 - 0.3], [ST.x0, U2, c1.z0 - 0.3]]);
  // the stern stairs: treads, stringers, handrails
  { const n = 14, run = (ST.z1 - ST.z0) / n, rise = (U2 - D) / n, ang = Math.atan2(U2 - D, ST.z1 - ST.z0), slen = Math.hypot(U2 - D, ST.z1 - ST.z0), tread = std('#7d858c', 0.6, 0.3), yel = std('#e8b320', 0.5);
    for (const sx of [-1, 1]) { const xc = sx * (ST.x0 + ST.x1) / 2, wdt = ST.x1 - ST.x0;
      for (let k = 0; k < n; k++) { bx(wdt - 0.08, 0.05, run + 0.04, tread, xc, D + (k + 1) * rise - 0.025, ST.z0 + (k + 0.5) * run); bx(wdt - 0.08, 0.012, 0.05, yel, xc, D + (k + 1) * rise + 0.002, ST.z0 + (k + 1) * run - 0.03); }
      for (const ex of [ST.x0, ST.x1]) { bx(0.06, 0.24, slen, GREY, sx * ex, (D + U2) / 2 - 0.12, (ST.z0 + ST.z1) / 2, -ang); rail([[sx * ex, D, ST.z0], [sx * ex, U2, ST.z1]], 0.95); } } }
  // benches on the upper deck (facing out to sea) and life rafts by the rail
  for (const z of FERRY.BENCH) { for (const s of [1, -1]) { bx(0.45, 0.42, 1.6, std('#7a5a3c', 0.8), s * 2.2, U2 + 0.21, z); bx(0.08, 0.45, 1.6, std('#7a5a3c', 0.8), s * 1.98, U2 + 0.6, z); } }
  for (const s of [1, -1]) for (const z of [-0.1, -1.4]) cy(0.42, 1.3, W, s * (UW - 0.75), U2 + 0.45, z, Math.PI / 2, 0, 12);
  for (const [x, y, z] of [[UW + 0.02, U2 + 0.75, 0.6], [-UW - 0.02, U2 + 0.75, 0.6], [FERRY.hb(0.15) - 0.23, D + 0.65, -L / 2 + 3.5], [-FERRY.hb(0.15) + 0.23, D + 0.65, -L / 2 + 3.5]]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 14), ORANGE); r.position.set(x, y, z); r.rotation.y = Math.PI / 2; g.add(r); }
  // foredeck fittings and the name
  for (const [x, z] of FERRY.BOLL) cy(0.16, 0.45, BLACK, x, FERRY.deckH(z) + 0.22, z);
  bx(1.4, 0.6, 1.0, NAVY, 0, FERRY.deckH(L / 2 - 6.5) + 0.3, L / 2 - 6.5);
  const name = txCanvas(512, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1d2a44'; x.font = '700 64px "Mochiy Pop One","M PLUS Rounded 1c",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ほしなみ丸', w / 2, h / 2 + 2); });
  for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.56), new THREE.MeshStandardMaterial({ map: name, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.set(s * (B / 2 + 0.03), 1.72, -L / 2 + 0.58 * L); m.rotation.y = s * Math.PI / 2; g.add(m); }
  { const r = new THREE.Group(); r.position.set(0, 0, -L / 2 - 0.06); g.add(r); const rp = std('#8d9399', 0.55, 0.35), yb = std('#e8b320', 0.5);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.75, 0.12), rp); pl.position.set(0, 1.2, 0); r.add(pl);
    for (let k = 0; k < 6; k++) { const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.06), GREY); rib.position.set(-1.9 + k * 0.76, 1.2, -0.08); r.add(rib); }
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.8, 10), BLACK); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, 0.32, -0.04); r.add(hinge);
    for (const x of [-2.36, 2.36]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.75, 0.14), yb); e.position.set(x, 1.2, -0.02); r.add(e); }
    for (const x of [-2.9, 2.9]) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), GREY); ch.position.set(x * 0.9, 2.6, 0.3); ch.rotation.x = 0.5; r.add(ch); const pv = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.8, 0.25), W); pv.position.set(x, 2.9, 0.55); r.add(pv); } }
  g.traverse(o => { if (o.isMesh) { o.castShadow = o.material !== glass; o.receiveShadow = true; } });
  hull.userData.keep = true; rb.userData.keep = true; let out = g;
  try { if (typeof mergeLocal === 'function') { FERRY.parts = 0; g.traverse(o => { if (o.isMesh) FERRY.parts++; }); out = mergeLocal(g); } } catch (e) { console.warn('ferry merge', e); out = g; }
  out.userData.ferry = true; FERRY.made = out; return out;
};
{ const _n = FERRY.night; FERRY.night = function (k) { _n.apply(this, arguments); if (FERRY.cabLight) FERRY.cabLight.emissiveIntensity = 0.9 + k * 0.8; }; }
// ---------- where you can stand aboard (ship frame: x across, z toward the bow) ----------
FW.inR = (r, x, z, m = 0) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m;
FW.stair = function (x, z) { const S = FERRY.ST, R = FW.R, ax = Math.abs(x); if (ax < S.x0 + R - 0.12 || ax > S.x1 - R + 0.12 || z < S.z0 - 0.35 || z > S.z1 + 0.4) return null; return FERRY.D + (FERRY.U2() - FERRY.D) * clamp((z - S.z0) / (S.z1 - S.z0), 0, 1); };
FW.level0 = function (x, z) {
  const R = FW.R, L = FERRY.L, t = (z + L / 2) / L, c1 = FERRY.C1, hw = c1.w / 2, ax = Math.abs(x), S = FERRY.ST; if (t < 0.03 || t > 0.95 || ax > FERRY.hb(t) - 0.25 - R) return null;
  if (ax > S.x0 - R && ax < S.x1 + R && z > S.z0 - 0.1 && z < S.z1 + 0.5) return null;   // under / beside the stairs
  const outer = ax < hw + R && z > c1.z0 - R && z < c1.z1 + R, inner = ax < hw - 0.1 - R && z > c1.z0 + 0.1 + R && z < c1.z1 - 0.1 - R;
  const door = (ax < 0.7 - R && z > c1.z0 - 0.6 && z < c1.z0 + 0.6) || (Math.abs(z - FERRY.DOORZ) < 0.6 - R && ax > hw - 0.6 && ax < hw + 0.6);
  if (outer && !inner && !door) return null;
  if (inner) { for (const o of FERRY.OB || []) if (FW.inR(o, x, z, R * 0.8)) return null; if (FW.inR(FERRY.TAT, x, z, 0.02)) return FERRY.D + 0.32; return FERRY.D + 0.02; }
  for (const [bx, bz] of FERRY.BOLL) if (Math.hypot(x - bx, z - bz) < 0.18 + R) return null;
  if (ax < 0.7 + R && Math.abs(z - (L / 2 - 6.5)) < 0.5 + R) return null;
  return FERRY.deckH(z);
};
FW.level1 = function (x, z) {
  const R = FW.R, c1 = FERRY.C1, ax = Math.abs(x), UW = FERRY.UW; if (ax > UW - 0.08 - R || z < c1.z0 - 0.3 + R || z > c1.z1 + 0.3 - R) return null;
  if (ax < (FERRY.B - 3.0) / 2 + R && z > 1.5 - R && z < 6.3 + R) return null;                       // the bridge
  if ((x / (1.2 + R)) ** 2 + ((z + 3.2) / (1.85 + R)) ** 2 < 1) return null;                          // the funnel
  if (ax > 1.98 - 0.06 - R && ax < 2.2 + 0.25 + R) for (const bz of FERRY.BENCH) if (Math.abs(z - bz) < 0.8 + R) return null;   // benches
  if (ax > UW - 0.75 - 0.42 - R && Math.abs(z + 0.75) < 1.1 + R) return null;                          // life rafts
  return FERRY.U2();
};
FW.surf = function (x, z, cur) { let best = null, bd = 0.5; for (const h of [FW.stair(x, z), FW.level0(x, z), FW.level1(x, z)]) { if (h === null) continue; const d = Math.abs(h - cur); if (d <= bd) { bd = d; best = h; } } return best; };
// the nearest place you can stand (spiral search), at the height you are at
FW.nearest = function (x, z) { for (let r = 0; r <= 5; r += 0.15) { const n = Math.max(1, Math.round(r * 12)); for (let k = 0; k < n; k++) { const a = k / n * 6.2832, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, h = FW.surf(px, pz, FW.ly); if (h !== null) return [px, pz, h]; } } return [0, -12.5, FERRY.D]; };
FW.inCabin = (x, z) => { const c1 = FERRY.C1; return Math.abs(x) < c1.w / 2 - 0.05 && z > c1.z0 + 0.05 && z < c1.z1 - 0.05 && FW.ly < FERRY.D + 1.0; };
// ---------- ship frame ⇄ world ----------
FW.L = function (Fy, x, z) { const c = Math.cos(Fy.rot), s = Math.sin(Fy.rot), dx = x - Fy.x, dz = z - Fy.z; return [c * dx - s * dz, s * dx + c * dz]; };
FW.W = function (Fy, lx, lz) { const c = Math.cos(Fy.rot), s = Math.sin(Fy.rot); return [Fy.x + c * lx + s * lz, Fy.z - s * lx + c * lz]; };
FW.toWorld = function (Fy) { const [x, z] = FW.W(Fy, FW.lx, FW.lz); PL.x = x; PL.z = z; PL.y = Fy.mesh.position.y + FW.ly; PL.rot = FW.lrot + Fy.rot; PL.mesh.position.set(PL.x, PL.y, PL.z); PL.mesh.rotation.y = PL.rot; };
FW.fromWorld = function (Fy) { const [lx, lz] = FW.L(Fy, PL.x, PL.z); FW.lx = lx; FW.lz = lz; FW.ly = PL.y - Fy.mesh.position.y; FW.lrot = PL.rot - Fy.rot; };
// the walking code (updatePlayer) runs unchanged; while it runs, the ground, the walls and the push-out are the ship's
FW.env = function (Fy) {
  const y0 = Fy.mesh.position.y;
  return {
    standY: (x, z) => { const [lx, lz] = FW.L(Fy, x, z), h = FW.surf(lx, lz, FW.ly); return y0 + (h === null ? FW.ly : h); },
    canWalk: (x0, z0, x1, z1) => { const [lx, lz] = FW.L(Fy, x1, z1); return FW.surf(lx, lz, FW.ly) !== null; },
    pushOut: (x, z) => [x, z],
  };
};
FW.board = function (Fy) {
  const [gx, gz] = FERRY.gw ? FW.L(Fy, FERRY.gw.x, FERRY.gw.z) : [FERRY.C1.w / 2 + 1, -4]; const sx = gx >= 0 ? 1 : -1, hw = FERRY.C1.w / 2;
  FW.ly = FERRY.D; const p = FW.nearest(sx * (hw + 0.5), clamp(gz, FERRY.C1.z0 + 0.5, FERRY.C1.z1 - 0.5)); FW.lx = p[0]; FW.lz = p[1]; FW.ly = p[2]; FW.lrot = sx > 0 ? -Math.PI / 2 : Math.PI / 2; FW.on = true; CAM.distT = 5.2; PL.speed = 0; FW.toWorld(Fy);
  CAM.yaw = PL.rot + Math.PI; CAM.snap = true;
};
// ---------- hooks ----------
{ const _up = updatePlayer; updatePlayer = function (dt, locked) {
  const Fy = PL.veh; if (!(FW.on && Fy && Fy.kind === 'ferry' && Fy.mesh === FERRY.made)) return _up.apply(this, arguments);
  FW.toWorld(Fy); const sv = [standY, canWalk, pushOut], E = FW.env(Fy); standY = E.standY; canWalk = E.canWalk; pushOut = E.pushOut; PL.veh = null;
  try { _up.call(this, dt, locked); } catch (e) { console.warn('ferry walk', e); } finally { [standY, canWalk, pushOut] = sv; PL.veh = Fy; }
  FW.fromWorld(Fy); if (FW.surf(FW.lx, FW.lz, FW.ly) === null) { const p = FW.nearest(FW.lx, FW.lz); FW.lx = p[0]; FW.lz = p[1]; FW.ly = p[2]; }   // never off the ship
}; }
{ const _uc = updateCamera; updateCamera = function (dt) {
  const Fy = PL.veh; if (!(FW.on && Fy && Fy.mesh === FERRY.made)) return _uc.apply(this, arguments);
  PL.veh = null; let r; try { r = _uc.apply(this, arguments); } finally { PL.veh = Fy; }
  if (CAM.mode !== 'first' && !window.__freecam && !(GAME.camOverride && GAME.camOverride()) && FW.inCabin(FW.lx, FW.lz)) FW.camIn(Fy);
  return r; }; }
// in the cabin the camera stays in the room (closer and a little wider)
FW.camIn = function (Fy) {
  const c1 = FERRY.C1, y0 = Fy.mesh.position.y, T = new THREE.Vector3(PL.x, PL.y + 1.0, PL.z), P = camera.position.clone();
  const [tx, tz] = FW.L(Fy, T.x, T.z), [px, pz] = FW.L(Fy, P.x, P.z), ty = T.y - y0, py = P.y - y0, d = [px - tx, py - ty, pz - tz];
  const lo = [-c1.w / 2 + 0.3, FERRY.D + 0.35, c1.z0 + 0.3], hi = [c1.w / 2 - 0.3, FERRY.D + c1.h - 0.3, c1.z1 - 0.3], o = [tx, ty, tz]; let tm = 1;
  for (let k = 0; k < 3; k++) { if (d[k] > 1e-6) tm = Math.min(tm, (hi[k] - o[k]) / d[k]); else if (d[k] < -1e-6) tm = Math.min(tm, (lo[k] - o[k]) / d[k]); }
  tm = Math.max(0.15, tm); const [wx, wz] = FW.W(Fy, tx + d[0] * tm, tz + d[2] * tm); camera.position.set(wx, y0 + ty + d[1] * tm, wz); camera.lookAt(T); CAM.fov(55);
};
// every frame after the ship has moved: you move with her
{ const _uf = GAME.updateFerry; GAME.updateFerry = function (dt) { const r = _uf.apply(this, arguments); const Fy = DV.ferry;
  if (FW.on && !(PL.veh && PL.veh === Fy && Fy && Fy.mesh === FERRY.made)) FW.on = false;
  if (FW.on) { FW.toWorld(Fy); PL.mesh.visible = CAM.mode !== 'first'; } return r; }; }
{ const _rk = GAME.rideKey; GAME.rideKey = function () { const was = PL.veh; const r = _rk.apply(this, arguments); const Fy = DV.ferry;
  if (!was && Fy && PL.veh === Fy && Fy.mesh === FERRY.made) { FW.board(Fy); UI.toast('🛳️ 乗船しました。WASD で船内を歩けます（客室・うしろの階段から上の展望デッキへ）'); }
  if (!PL.veh) FW.on = false; return r; }; }
{ const _p = GAME.prompt; GAME.prompt = function () { const v = PL.veh; if (this.p && v && v.kind === 'ferry' && FW.on && !v.docked) return FW.inCabin(FW.lx, FW.lz) ? '🛳️ 客室　WASD で歩く・うしろの扉から甲板へ' : '🛳️ 島めぐり中…　WASD で船内を歩く・V で目線'; return _p.apply(this, arguments); }; }
