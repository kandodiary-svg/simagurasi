// ===================== 体験モード ver.42: 計画してつくった「最高の島」 =====================
// The old demo pulled a grid of straight lines over the island, cut them wherever something was in the way and then threw
// buildings at whatever land was left: short broken roads, dead ends, towers at every angle. This one follows a plan:
//   - 島一周道路: the coast road plus a new wide road round the north coast (sidewalks, past the foot of the big bridge)
//   - 中心街: a grid of wide avenues and streets between the river and the old village, a stone-paved shopping street
//   - 旧市街: the old village keeps its houses and lanes; a stone-paved approach to the shrine
//   - 東の遊びの街: an avenue across the island to the east coast, the amusement park beside it, the stadium on the levelled hill
//   - 丘の公園: the central hill stays green, with an earth path up to the top
// Buildings stand along the roads in rows, facing the street, each district with its own kind of building.
const DEMO2 = { log: [], PLAN: null, ferr: {} };
DEMO2.PLAN = /*PLAN*/{
 "terra": [{"x": 78, "z": -85, "r": 80, "h": 14}, {"x": -110, "z": -82, "r": 50, "h": 9}, {"x": 145, "z": -15, "r": 65, "h": 6.5}],
 "roads": [
  {"n": "北の環状線", "t": "A", "tree": "pine0", "p": [[-189,-43],[-186,-62],[-176,-84],[-160,-104],[-140,-122],[-118,-138],[-92,-150],[-60,-157],[-25,-158],[5,-156],[35,-153],[62,-146],[88,-138],[115,-136],[140,-137],[160,-139],[178,-131]]},
  {"n": "ほしなみ大通り", "t": "A", "tree": "broad0", "p": [[-38,147],[-38,120],[-38,100],[-38,55],[-38,12]]},
  {"n": "中央通り", "t": "A", "tree": "broad0", "p": [[-170,48],[-150,44],[-118,62],[-100,57],[-85,55],[-38,55],[12,55]]},
  {"n": "南通り", "t": "A", "tree": "palm0", "p": [[-120,117],[-110,104],[-85,100],[-38,100],[12,100]]},
  {"n": "西通り", "t": "n", "p": [[-88,140],[-85,120],[-85,100],[-85,55],[-85,12]]},
  {"n": "東通り", "t": "n", "p": [[12,100],[12,55],[12,28]]},
  {"n": "北通り", "t": "n", "p": [[-85,12],[-38,12],[-8,14],[12,28],[30,27],[46,19]]},
  {"n": "港の石畳", "t": "s", "tree": "sakura0", "p": [[21,149],[21.5,125],[18,105],[12,100]]},
  {"n": "東西通り", "t": "A", "tree": "broad0", "p": [[46,19],[75,12],[110,5],[150,-1],[189,-4]]},
  {"n": "スタジアム通り", "t": "A", "tree": "momiji0", "p": [[100,-137],[100,-110],[100,-60],[104,-25],[110,5]]},
  {"n": "みかん台南通り", "t": "n", "tree": "sakura0", "p": [[-188,-50],[-145,-50],[-95,-50],[-82,-50]]},
  {"n": "みかん台北通り", "t": "n", "p": [[-160,-104],[-145,-104],[-95,-104],[-82,-104]]},
  {"n": "みかん台西通り", "t": "n", "p": [[-145,-50],[-145,-104]]},
  {"n": "みかん台東通り", "t": "n", "tree": "sakura0", "p": [[-95,-50],[-95,-104],[-95,-148]]},
  {"n": "みかん台の小径", "t": "s", "tree": "sakura0", "p": [[-82,-50],[-82,-104]]},
  {"n": "神社の参道", "t": "s", "tree": "momiji0", "p": [[74,58],[84,58]]},
  {"n": "浜の遊歩道", "t": "p", "tree": "palm0", "p": [[-193,4],[-201,22],[-197,40]]},
  {"n": "丘の散策路", "t": "t", "p": [[-38,12],[-30,-4],[-12,-14],[-22,-32],[-6,-46],[-8,-62]]}
 ],
 "devlot": {"tower": [-62,78], "onsen": [-42,-140], "ryokan": [-120,-124], "camp": [-55,-28], "aquarium": [-12,114], "michinoeki": [35,-136], "school": [38,88], "mansion": [100,118], "resort": [-120,-77], "r_lagoon": [-155,8]},
 "land": [["stadium", 55, -85, 1.5708], ["coaster", 141, 45, 1.5708], ["waterpark", 140, -32, 0], ["carousel", 124, -62, 0], ["drop", 172, -22, 0], ["ferris", -20, -138, 3.1416], ["obs", -20.8, 33, 3.1416], ["mall", 72, -22, 0]],
 "blocks": [
  {"x0": -85, "z0": 12, "x1": -38, "z1": 55, "w": 3.7, "e": 4.7, "n": 3.7, "s": 4.7, "mix": "cbd"},
  {"x0": -38, "z0": 12, "x1": 12, "z1": 55, "w": 4.7, "e": 3.7, "n": 3.7, "s": 4.7, "mix": "cbd"},
  {"x0": -38, "z0": 55, "x1": 12, "z1": 100, "w": 4.7, "e": 3.7, "n": 4.7, "s": 4.7, "mix": "cbd"},
  {"x0": -85, "z0": 100, "x1": -38, "z1": 146, "w": 3.7, "e": 4.7, "n": 4.7, "s": 3.2, "mix": "bay"},
  {"x0": -128, "z0": 58, "x1": -85, "z1": 100, "w": 2, "e": 3.7, "n": 4.7, "s": 4.7, "mix": "bay"}
 ],
 "towers": {"from": [-148, 82], "to": [-60, 147]},
 "front": ["東西通り", "スタジアム通り", "北の環状線", "みかん台南通り", "みかん台北通り", "みかん台西通り", "みかん台東通り", "みかん台の小径"]
}/*END*/;
// road kinds: [type, width, sidewalks]
DEMO2.TYPES = { A: ['asphalt', 'wide', true], n: ['asphalt', 'narrow', true], a: ['asphalt', 'narrow', false], S: ['stone', 'wide', true], s: ['stone', 'narrow', false], t: ['trail', 'narrow', false], p: ['path', 'narrow', false], g: ['gravel', 'narrow', false] };
// what stands where
DEMO2.MIX = {
  cbd: [['office', 4], ['hotelG', 2], ['condo', 2], ['slim', 3], ['cafe', 0.6]],
  bay: [['hotelG', 3], ['condo', 3], ['hotelL', 1.5], ['slim', 1]],
  shop: [['cafe', 4], ['slim', 1], ['park', 0.4]],
  resort: [['hotelL', 4], ['hotelG', 2], ['villa', 1], ['cafe', 1], ['chapel', 0.3]],
  east: [['slim', 3], ['office', 2], ['midrise', 2], ['condo', 1], ['cafe', 0.5]],
  home: [['midrise', 3], ['slim', 2], ['condo', 1], ['villa', 1], ['cafe', 0.4]],
  north: [['villa', 2], ['cafe', 1.5], ['hotelL', 1.5], ['midrise', 1], ['slim', 1], ['chapel', 0.4]],
  hill: [['park', 1], ['cafe', 1], ['midrise', 1]],
};
DEMO2.zone = function (x, z, road) {
  if (x > 15 && x < 135 && z > 25 && z < 172) return null;                 // the old village keeps its low houses
  if (x > -92 && x < 18 && z > 5 && z < 150) return z > 92 ? 'bay' : 'cbd';
  if (road && road.startsWith('みかん台')) return 'home';
  if (z < -110) return 'north';
  if (x < -110 && z > -45) return 'resort';
  if (x > 90) return 'east';
  return 'hill';
};
// ---------- the land: lower the north-east hill to a broad terrace, level the east flats ----------
DEMO2.terraform = function () {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, H = G.H, W = G.Wl;
  for (const R of DEMO2.PLAN.terra) {
    for (let j = Math.max(0, Math.floor((R.z - R.r - h0) / cell)); j <= Math.min(n - 1, Math.ceil((R.z + R.r - h0) / cell)); j++) for (let i = Math.max(0, Math.floor((R.x - R.r - h0) / cell)); i <= Math.min(n - 1, Math.ceil((R.x + R.r - h0) / cell)); i++) {
      const x = h0 + i * cell, z = h0 + j * cell, d = Math.hypot(x - R.x, z - R.z), k = j * n + i; if (d > R.r || H[k] < 0.5 || !isNaN(W[k]) || G.prot[k] || G.roadDist[k] < 7) continue;
      H[k] = lerp(H[k], R.h, 1 - sstep(R.r * 0.6, R.r, d)); }
    const [i0, j0] = toIdx(R.x - R.r - 4, R.z - R.r - 4), [i1, j1] = toIdx(R.x + R.r + 4, R.z + R.r + 4); refreshRegion(i0, j0, i1, j1); }
};
// ---------- roads: the planned line in one go; if something is in the way, piece by piece (and it is written down) ----------
DEMO2.nodes = (spec, pts) => { const foot = RTYPES[DEMO2.TYPES[spec.t][0]].foot; return pts.map(([x, z], i) => i === 0 || i === pts.length - 1 ? snapNode({ x, z }, foot) : { x, z, snap: null }); };
DEMO2.road = function (spec) {
  const [type, wd, side] = DEMO2.TYPES[spec.t]; EDIT.rtype = type; EDIT.roadW = wd; EDIT.rside = side;
  let nodes = DEMO2.nodes(spec, spec.p), plan = planUserRoad(nodes);
  if (!plan.err) { EDIT.nodes = nodes; finishRoad(); EDIT.nodes = []; return 0; }
  DEMO2.log.push(`${spec.n}: ${plan.err}`); let fails = 0;
  for (let i = 0; i < spec.p.length - 1; i++) { const nd = DEMO2.nodes(spec, [spec.p[i], spec.p[i + 1]]), pl = planUserRoad(nd); if (pl.err) { fails++; DEMO2.log.push(`  ${spec.n} ${i}: ${pl.err}`); continue; } EDIT.nodes = nd; finishRoad(); EDIT.nodes = []; }
  return fails;
};
// 大橋通り: once the big bridge stands, a wide road from the ring road straight onto its deck (the bridge's place is chosen by the game, so this comes after it)
DEMO2.bridgeRoad = function () {
  if (!OHB.s) return; const S = OHB.s, mx = S.x - S.dx * 0.8, mz = S.z - S.dz * 0.8;
  let best = null; for (const r of ROADS) { if (isFoot(r)) continue; const pr = rProject(r, mx, mz); if (pr && pr.d < 45 && (!best || pr.d < best.d)) best = { r, ...pr }; } if (!best) { DEMO2.log.push('大橋通り: no road near'); return; }
  const n = Math.max(2, Math.round(best.d / 6)), pts = []; for (let i = 0; i <= n; i++) pts.push([lerp(best.x, mx, i / n), lerp(best.z, mz, i / n)]);
  EDIT.rtype = 'asphalt'; EDIT.roadW = 'wide'; EDIT.rside = true;
  const nodes = pts.map(([x, z], i) => i === 0 ? snapNode({ x, z }, false) : { x, z, snap: null }); nodes[n].snap = { y: OHB.top(0) - 0.25 };   // meet the deck's height
  const pl = planUserRoad(nodes); if (pl.err) { DEMO2.log.push('大橋通り: ' + pl.err); return; } EDIT.nodes = nodes; finishRoad(); EDIT.nodes = []; OHB.reApron();
};
// ---------- everything the story unlocks (as before), money, cars ----------
DEMO2.base = function () {
  const g = GAME, p = g.p;
  const st = STORY.st(); st.ch = CHAPTERS.length; for (const C of CHAPTERS) { st.done[C.id] = 1; st.intro[C.id] = 1; } p.storyDev = 1; p.resortScene = 1; p.devSeen = p.devSeen || {}; STORY.syncDev(); for (const d of DEV) p.devSeen[d.id] = 1;
  p.projects = p.projects || {}; for (const q of PROPOSALS) p.projects[q.id] = { date: '2000-01-01', done: true };
  p.money = 5000000; p.items = Object.assign(p.items || {}, { rod: 1, rodLv: 3, net: 1 }); const gar = g.garage(); for (const c of CAR_SHOP) gar.cars[c.id] = 1; for (const b of BOAT_SHOP) gar.boats[b.id] = 1; gar.tune = TUNES.length - 1;
};
DEMO2.commitDev = function (d, pl) {
  flattenPad(pl.x, pl.z, d.w / 2 + 1.2, d.d / 2 + 1.6, pl.rot, pl.y, 5); const [i0, j0] = toIdx(pl.x - 30, pl.z - 30), [i1, j1] = toIdx(pl.x + 30, pl.z + 30); refreshRegion(i0, j0, i1, j1, { veg: false });
  VEG.removeAt(pl.x, pl.z, Math.max(d.w, d.d) / 2 + 3); GAME.devState()[d.id] = { id: d.id, state: 'done', date: '2000-01-01', x: pl.x, z: pl.z, rot: pl.rot, y: pl.y + 0.05 }; GAME.refreshDev(); return true;
};
DEMO2.devAt = function (d) {
  const L = DEMO2.PLAN.devlot[d.id]; if (!L) return DEMO.placeDev(d, VILLAGE); GAME.placing = d; let pl = null;
  for (let r = 0; r <= 30 && !pl; r += 3) { const n = Math.max(1, Math.round(r * 2)); for (let k = 0; k < n; k++) { const a = k / n * 6.283, q = GAME.buildPlan({ x: L[0] + Math.cos(a) * r, z: L[1] + Math.sin(a) * r }); if (q && q.ok) { pl = q; break; } } }
  const why = GAME.buildPlan({ x: L[0], z: L[1] }); GAME.placing = null; if (!pl) { DEMO2.log.push(`dev ${d.id}: no lot near ${L} (${why && why.err})`); return DEMO.placeDev(d, { x: L[0], z: L[1] }); }
  return DEMO2.commitDev(d, pl);
};
DEMO2.devs = function () {
  const g = GAME, D = g.devState(), skipped = [];
  for (const d of DEV.slice()) { if (D[d.id]) continue;
    try {
      if (d.place === 'player') { if (!DEMO2.devAt(d)) skipped.push(d.name); continue; }
      if (d.id === 'r_towers') g.refreshDev();
      const loc = DEV_LOC[d.id] ? DEV_LOC[d.id]() : {}; if (!loc) { skipped.push(d.name); continue; }
      D[d.id] = Object.assign({ id: d.id, state: 'done', date: d.id === 'fireworks' ? todayKey() : '2000-01-01' }, loc);
      if (d.id.startsWith('reclaim') || d.id === 'causeway') g.applyLand();
      if (d.id === 'r_beach' || d.id === 'r_marina') g.refreshDev();
    } catch (e) { console.warn('demo dev', d.id, e); skipped.push(d.name); } }
  return skipped;
};
// newcomers build in the quiet streets east of the village
DEMO2.newcomers = function () {
  const g = GAME, p = g.p, N = g.newc(), _hf = g.houseFor, C = { x: 110, z: 95 };
  for (const c of NEWCOMERS) { N[c.id] = { state: 'visit' }; g.houseFor = () => c;
    const pl = DEMO.find(C, 0, 160, q => { const r = g.housePlan(q); return r.ok ? r : null; }, 5);
    if (pl) { const o = { x: pl.x, z: pl.z, rot: pl.rot }, [cx, cz] = toWorld(o, 0, 1.1); flattenPad(cx, cz, 5.4, 5.9, pl.rot, pl.y, 4); const [i0, j0] = toIdx(pl.x - 16, pl.z - 16), [i1, j1] = toIdx(pl.x + 16, pl.z + 16); refreshRegion(i0, j0, i1, j1, { veg: false }); VEG.removeAt(cx, cz, 6.5);
      N[c.id] = { state: 'moved', thanked: 1, house: { x: pl.x, z: pl.z, rot: pl.rot, y: pl.y + 0.05, style: c.style, roof: 0, wall: 0, seed: 1000 + NEWCOMERS.indexOf(c), date: '2000-01-01' } }; p.stats.movedN++; }
    else delete N[c.id];
    g.houseFor = _hf; g.syncNewcomers(); }
};
// bridges over the river (stone / arched / wooden), as before
DEMO2.bridges = function () {
  try { const R = G.river; if (R) for (const [i, type] of [[100, 'stone'], [36, 'taiko'], [72, 'wood']]) { const P = R.pts; if (!P[i + 2]) continue; let tx = P[i + 2][0] - P[i - 2][0], tz = P[i + 2][1] - P[i - 2][1]; const l = Math.hypot(tx, tz); tx /= l; tz /= l;
      for (let d = R.hw[i] + 3; d < R.hw[i] + 16; d += 1) { try { BRG.type = type; const A = BRG.endAt({ x: P[i][0] - tz * d, z: P[i][1] + tx * d }); const pl = BRG.planTo(A, { x: P[i][0] + tz * d, z: P[i][1] - tx * d }); if (pl.ok) { BRG.list.push(brPrep(brClean(pl.b))); break; } } catch (e) { } } }   // one awkward spot must not stop the others
    BRG.type = 'wood'; BRG.rebuild(); } catch (e) { console.warn('demo bridges', e); }
};
// ---------- buildings ----------
DEMO2.put = function (id, x, z, rot) { const pl = CITY.planAt(id, { x, z }, rot); if (!pl || !pl.ok) return pl; CITY.place(pl, false); return pl; };
DEMO2.landmarks = function () {
  let n = 0; for (const [id, x0, z0, rot] of DEMO2.PLAN.land) { let done = null, first = null;
    for (let r = 0; r <= 40 && !done; r += 3) { const k = Math.max(1, Math.round(r * 1.5)); for (let q = 0; q < k && !done; q++) for (const rr of rot === undefined ? [undefined] : [rot, rot + Math.PI]) { if (done) break; const a = q / k * 6.283; const pl = CITY.planAt(id, { x: x0 + Math.cos(a) * r, z: z0 + Math.sin(a) * r }, rr); if (!first) first = pl; if (pl && pl.ok) { CITY.place(pl, false); done = pl; n++; } } }
    if (!done) DEMO2.log.push(`land ${id} @${x0},${z0}: ${first && first.err}`); }
  return n;
};
DEMO2.pick = function (zone, R) { const L = DEMO2.MIX[zone] || DEMO2.MIX.hill, tot = L.reduce((s, q) => s + q[1], 0); let r = R() * tot, first = L[0][0]; for (const [id, w] of L) { r -= w; if (r <= 0) { first = id; break; } }
  return [first, ...L.map(q => q[0]).filter(id => id !== first).sort((a, b) => CITY_TYPES[b].w * CITY_TYPES[b].d - CITY_TYPES[a].w * CITY_TYPES[a].d)]; };
DEMO2.SET = 3; DEMO2.GAP = 3; DEMO2.DEEP = ['home', 'east', 'north', 'hill'];
// walk along one side of a planned road and stand buildings in a row, all facing the street
DEMO2.front = function (spec, side, R, deep = true) {
  const [type, wd, sw] = DEMO2.TYPES[spec.t], half = RTYPES[type].w[wd] / 2 + (sw ? SIDEW : 0), pts = roadPathFrom(spec.p.map(([x, z]) => ({ x, z }))); if (!pts) return 0;
  const tmp = { pts, h: pts.map(() => 0) }, L = rLen(tmp); let s = 8, n = 0;
  while (s < L - 8) {
    const a = rAt(tmp, s), [tx, tz] = rTan(tmp, s), nx = tz * side, nz = -tx * side, zone = DEMO2.zone(a.x + nx * 18, a.z + nz * 18, spec.n); let ok = false; if (!zone) { s += 6; continue; }
    const small = !['cbd', 'bay'].includes(zone), tries = DEMO2.pick(zone, R).filter((id, k) => k === 0 || small || CITY_TYPES[id].w * CITY_TYPES[id].d >= 190);   // small shops only where they belong
    for (const id of tries) { const T = CITY_TYPES[id], c0 = s + T.w / 2; if (c0 + T.w / 2 > L - 6) continue;
      const b = rAt(tmp, c0), [ux, uz] = rTan(tmp, c0), mx = uz * side, mz = -ux * side, off = half + DEMO2.SET + T.d / 2, rot = Math.atan2(-mx, -mz), pl = CITY.planAt(id, { x: b.x + mx * off, z: b.z + mz * off }, rot);
      if (pl && pl.ok) { CITY.place(pl, false); s += T.w + DEMO2.GAP; n++; ok = true;
        // a second row behind it, where the land goes on (the town gets depth instead of a single line)
        if (deep && DEMO2.DEEP.includes(zone)) for (const id2 of [id, ...tries.filter(q => q !== id && CITY_TYPES[q].w <= T.w)]) { const T2 = CITY_TYPES[id2], o2 = off + T.d / 2 + 4 + T2.d / 2, p2 = CITY.planAt(id2, { x: b.x + mx * o2, z: b.z + mz * o2 }, rot); if (p2 && p2.ok) { CITY.place(p2, false); n++; break; } }
        break; } else if (pl) { const E = (DEMO2.ferr[spec.n] = DEMO2.ferr[spec.n] || {}); E[pl.err] = (E[pl.err] || 0) + 1; } }
    if (!ok) s += 5; }
  return n;
};
// a city block between four streets: up to 2 x 2 buildings, each flush with the street it faces (fronts in a straight line)
DEMO2.block = function (B, R) {
  const S = 1.5, X0 = B.x0 + B.w + S, X1 = B.x1 - B.e - S, Z0 = B.z0 + B.n + S, Z1 = B.z1 - B.s - S, W = X1 - X0, D = Z1 - Z0, g = 3; if (W < 10 || D < 10) return 0;
  const mix = DEMO2.MIX[B.mix], ids = mix.map(q => q[0]), byW = new Map(mix);
  // faces: [rot, outward normal]; a building facing west has its front on X0
  const F = { w: -Math.PI / 2, e: Math.PI / 2, n: Math.PI, s: 0 }, wide = k => B[k] >= 4.5;
  const layouts = [[2, 2], [2, 1], [1, 2], [1, 1]]; let best = null;
  for (const [cx, cz] of layouts) { const cw = (W - g * (cx - 1)) / cx, cd = (D - g * (cz - 1)) / cz, cells = [];
    for (let i = 0; i < cx; i++) for (let j = 0; j < cz; j++) {
      const sides = [i === 0 ? 'w' : null, i === cx - 1 ? 'e' : null, j === 0 ? 'n' : null, j === cz - 1 ? 's' : null].filter(Boolean).sort((a, b) => (wide(b) - wide(a)) || ('nswe'.indexOf(a) - 'nswe'.indexOf(b)));
      let pick = null;
      for (const side of sides) { const along = side === 'w' || side === 'e' ? cd : cw, deep = side === 'w' || side === 'e' ? cw : cd;
        const fit = ids.filter(id => CITY_TYPES[id].w <= along && CITY_TYPES[id].d <= deep); if (!fit.length) continue;
        fit.sort((a, b) => (CITY_TYPES[b].w * CITY_TYPES[b].d * (byW.get(b) + R())) - (CITY_TYPES[a].w * CITY_TYPES[a].d * (byW.get(a) + R())));
        pick = { id: fit[0], side }; break; }
      if (!pick) { cells.length = 0; break; }
      const T = CITY_TYPES[pick.id], cX0 = X0 + i * (cw + g), cZ0 = Z0 + j * (cd + g), ew = pick.side === 'w' || pick.side === 'e';
      const fx = ew ? T.d : T.w, fz = ew ? T.w : T.d;   // footprint in world x / z
      const x = pick.side === 'e' || (!ew && i === cx - 1 && cx > 1) ? cX0 + cw - fx / 2 : cX0 + (ew || cx > 1 ? fx / 2 : cw / 2);
      const z = pick.side === 's' || (ew && j === cz - 1 && cz > 1) ? cZ0 + cd - fz / 2 : cZ0 + (!ew || cz > 1 ? fz / 2 : cd / 2);
      cells.push({ id: pick.id, x, z, rot: F[pick.side] }); }
    if (cells.length) { const area = cells.reduce((s, c) => s + CITY_TYPES[c.id].w * CITY_TYPES[c.id].d, 0) * (0.75 + R() * 0.5); if (!best || area > best.area) best = { cells, area }; } }
  if (!best) return 0; let n = 0;
  for (const c of best.cells) { let pl = CITY.planAt(c.id, { x: c.x, z: c.z }, c.rot);
    if (!pl.ok) { for (const id of ids) { if (CITY_TYPES[id].w > CITY_TYPES[c.id].w) continue; pl = CITY.planAt(id, { x: c.x, z: c.z }, c.rot); if (pl.ok) break; } }
    if (pl.ok) { CITY.place(pl, false); n++; } else DEMO2.log.push(`block ${B.x0},${B.z0} ${c.id}: ${pl.err}`); }
  return n;
};
// the resort towers (リゾート計画④) stand in a row along the coast road, facing the sea
DEMO2.towerSpots = function () {
  const P = DEMO2.PLAN.towers, coast = ROADS.find(r => !r.user && rLen(r) > 500); if (!P || !coast) return null;
  const a = rProject(coast, P.from[0], P.from[1]), b = rProject(coast, P.to[0], P.to[1]), out = [], styles = ['curve', 'slab', 'curve', 'slab', 'curve', 'slab', 'curve', 'slab'];
  for (let s = Math.min(a.s, b.s) + 12; s < Math.max(a.s, b.s) - 12 && out.length < 8; s += 4) {
    const p = rAt(coast, s), [tx, tz] = rTan(coast, s); let best = null;
    for (const side of [1, -1]) { const nx = tz * side, nz = -tx * side, c = { x: p.x + nx * (coast.w / 2 + 16), z: p.z + nz * (coast.w / 2 + 16) }; if (groundH(c.x + nx * 20, c.z + nz * 20) < 0.5) continue; const pl = CITY.planAt('condo', c, Math.atan2(-nx, -nz)); if (pl.ok) { best = { c, nx, nz }; break; } }
    if (!best || out.some(q => Math.hypot(q.x - best.c.x, q.z - best.c.z) < 32)) continue;
    let mn = 1e9, mx = -1e9; for (const da of [-11, 0, 11]) for (const db of [-11, 0, 11]) { const h = groundH(best.c.x + da, best.c.z + db); mn = Math.min(mn, h); mx = Math.max(mx, h); }
    out.push({ x: best.c.x, z: best.c.z, rot: Math.atan2(-best.nx, -best.nz), y0: mn, y1: mx, style: styles[out.length], hw: 11, floors: 16 + (out.length * 5) % 12 }); }
  return out.length ? { x: out[0].x, z: out[0].z, spots: out } : null;
};
{ const _lt = DEV_LOC.r_towers; DEV_LOC.r_towers = function () { if (DEMO.on && DEMO2.building) { const t = DEMO2.towerSpots(); if (t) return t; } return _lt.apply(this, arguments); }; }
DEMO2.fill = async function (say) {
  const R = mulberry(4242); let n = 0;
  for (const B of DEMO2.PLAN.blocks || []) n += DEMO2.block(B, R); say(`中心街をつくっています… ${CITY.list.length}棟`); await tick();
  for (const name of DEMO2.PLAN.front) { const spec = DEMO2.PLAN.roads.find(r => r.n === name); if (!spec) continue; for (const side of [1, -1]) n += DEMO2.front(spec, side, R); say(`街並みをととのえています… ${CITY.list.length}棟`); await tick(); }
  // the coast road: hotels facing the sea in the south-west, a row along the east coast
  const coast = ROADS.find(r => !r.user && rLen(r) > 500); if (coast) { const spec = { n: '海岸通り', t: 'A', p: [] }, L = rLen(coast); for (let s = 0; s <= L; s += 12) { const a = rAt(coast, s); spec.p.push([a.x, a.z]); }
    for (const side of [1, -1]) n += DEMO2.front(spec, side, R, false); }
  return n;
};
// ---------- street trees: an avenue of trees along the main roads (pines by the sea, palms by the beach, cherries in the lanes) ----------
DEMO2.trees = function () {
  let n = 0; const add = (x, z, key) => { if (groundH(x, z) < 0.6 || waterDepthAt(x, z) > 0 || roadDistAt(x, z) < 3.4 || deckY(x, z) !== null) return;
    if ([[0, 0], [1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2]].some(([a, b]) => JN.walkY(x + a, z + b) !== null) || JN.onRoad(x, z, 1.2)) return; // not on a junction or its corner sidewalk const [i, j] = toIdx(x, z); if (G.prot[j * WORLD.n + i] || CITY.at({ x, z }, 0.8)) return;
    if (collidersNear(x, z).some(c => !c.off && (c.kind === 'bld' || c.kind === 'pole') && hitsCollider(c, x, z, 1.2))) return; if (VEG.userTrees.some(t => Math.hypot(t.x - x, t.z - z) < 5)) return;
    VEG.userTrees.push({ x, z, r: Math.random(), kind: key.replace(/\d+$/, ''), key }); n++; };
  for (const spec of DEMO2.PLAN.roads) { if (!spec.tree) continue; const [type, wd, sw] = DEMO2.TYPES[spec.t], off = RTYPES[type].w[wd] / 2 + (sw ? SIDEW : 0) + 0.9, pts = roadPathFrom(spec.p.map(([x, z]) => ({ x, z }))); if (!pts) continue;
    const tmp = { pts, h: pts.map(() => 0) }, L = rLen(tmp), step = spec.tree === 'palm0' ? 11 : 15;
    for (let s = 6; s < L - 6; s += step) { const a = rAt(tmp, s), [tx, tz] = rTan(tmp, s); for (const side of [1, -1]) add(a.x + tz * side * off, a.z - tx * side * off, spec.tree); } }
  VEG.rebuildUser(); return n;
};
// ---------- how well it hangs together: dead ends and separate pieces ----------
DEMO2.netCheck = function () {
  const rs = ROADS.filter(r => !isFoot(r)), dead = [], par = rs.map((_, i) => i), f = i => par[i] === i ? i : (par[i] = f(par[i]));
  const touch = (r, x, z) => { const pr = rProject(r, x, z); return pr.d < r.w / 2 + 1.6; };
  rs.forEach((r, i) => { for (const e of [0, 1]) { const P = e ? r.pts[r.pts.length - 1] : r.pts[0]; let any = false; rs.forEach((q, j) => { if (j !== i && touch(q, P[0], P[1])) { any = true; par[f(i)] = f(j); } }); if (!any) dead.push([Math.round(P[0]), Math.round(P[1])]); }
    rs.forEach((q, j) => { if (j > i && rCross(r, q).length) par[f(i)] = f(j); }); });
  const comps = new Set(rs.map((_, i) => f(i))).size; let len = 0; for (const r of rs) len += rLen(r);
  return { roads: rs.length, km: +(len / 1000).toFixed(2), dead, comps };
};
// ---------- the new start ----------
GAME.startDemo = function () {
  const t = this.el.title; t.innerHTML = `<div class="tbox" id="demoLoad"><div class="logo"><div class="l1">体験モード</div><div class="l2">島ぐらし</div></div><p class="lead">計画にそって、島を最大まで開発しています…（30秒〜1分ほど）</p></div>`;
  setTimeout(async () => {
    const t0 = performance.now(); DEMO.on = true; if (EDIT.on) toggleEdit(false); DEMO2.log = [];
    restore({ H: G.H0, Wl: G.Wl0, roads: [], removed: new Uint8Array(VEG.removed.length), trees: [], bridges: [] }); EDIT.undo = [];
    const p = this.newProfile('ユウ', 'ほしなみ'); p.vit = 600; p.demo = 1; this.begin(p, false); this.el.title.hidden = false; this.modal = 'title';
    const toast = UI.toast; UI.toast = () => { }; let skipped = [];
    DEMO2.building = true;
    try {
      DEMO.say('島の計画図をひろげています…'); await tick(); DEMO2.base();
      DEMO.say('丘をならして街の土地をつくっています…'); await tick(); DEMO2.terraform();
      for (const r of DEMO2.PLAN.roads) { DEMO.say(`道路をひいています…（${r.n}）`); await tick(); try { DEMO2.road(r); } catch (e) { DEMO2.log.push(`${r.n}: ${e}`); } }
      DEMO.say('施設を建てています…'); await tick(); skipped = DEMO2.devs(); try { DEMO2.bridgeRoad(); } catch (e) { DEMO2.log.push('大橋通り: ' + e); } DEMO2.newcomers(); DEMO2.bridges();
      DEMO.say('スタジアム・遊園地・タワーを建てています…'); await tick(); DEMO2.bigN = DEMO2.landmarks();
      await DEMO2.fill(DEMO.say);
      DEMO.say('並木を植えています…'); await tick(); DEMO2.treeN = DEMO2.trees();
      DEMO.say('仕上げています…'); await tick();
      try { rebuildRoadMeshes(); JN.carve(); } catch (e) { DEMO2.log.push('carve ' + e); }
      refreshAll(); VEG.refresh(-400, -400, 400, 400); CITY.rebuildAll(); this.refreshDev(); this.refreshProjects(); this.syncNewcomers(); this.applyTruck && this.applyTruck(); this.mapDirty = true; MINI.builtAt = -99; this.renderTracker();
    } catch (e) { console.warn('demo2', e); DEMO2.log.push('error ' + e); }
    finally { DEMO2.building = false; UI.toast = toast; EDIT.nodes = []; EDIT.undo = []; EDIT.rtype = 'asphalt'; EDIT.roadW = 'narrow'; EDIT.rside = false; }
    try { DEMO2.net = DEMO2.netCheck(); } catch (e) { }
    DEMO.stats = DEMO2.stats = { total: CITY.list.length, big: DEMO2.bigN, trees: DEMO2.treeN, ms: Math.round(performance.now() - t0), net: DEMO2.net };
    this.el.title.hidden = true; this.modal = null; this.p.money = 50000000; this.startAtHome(); this.dirty = false; EDIT.undo = [];
    DEMO.button(); this.openDemoWarp(true, skipped); DEMO.done = true;
  }, 60);
};
