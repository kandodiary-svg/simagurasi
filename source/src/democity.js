// ===================== 体験モード: 島じゅうに道路網と街をつくる（極限開発） =====================
const tick = () => new Promise(r => setTimeout(r, 0));
DEMO.excluded = (x, z) => Math.hypot(x + 15, z + 90) < 62 || Math.hypot(x - PEAK.x, z - PEAK.z) < 40 || (x > 175 && z < -30);
DEMO.nodeOK = (x, z) => { const h = groundH(x, z); if (h < 1.0 || h > 28 || !isNaN(waterLevelAt(G, x, z)) || DEMO.excluded(x, z) || !GAME.openAt(x, z)) return false; const [i, j] = toIdx(x, z); if (G.prot[j * WORLD.n + i]) return false; if (CITY.at({ x, z }, 4)) return false; return !collidersNear(x, z).some(c => !c.off && (c.kind === 'bld' || c.kind === 'farm') && hitsCollider(c, x, z, 1.5)); };
DEMO.road = function (A, B, wide, side) {
  EDIT.rtype = 'asphalt'; EDIT.roadW = wide ? 'wide' : 'narrow'; EDIT.rside = !!side; EDIT.nodes = [snapNode(A, false), snapNode(B, false)];
  if (Math.hypot(EDIT.nodes[0].x - EDIT.nodes[1].x, EDIT.nodes[0].z - EDIT.nodes[1].z) < 8) { EDIT.nodes = []; return false; }
  const pl = planUserRoad(EDIT.nodes); if (!pl || pl.err) { DEMO.rerr = DEMO.rerr || {}; const e = String(pl && pl.err).slice(0, 18); DEMO.rerr[e] = (DEMO.rerr[e] || 0) + 1; EDIT.nodes = []; return false; } finishRoad(); EDIT.nodes = []; return true;
};
// big developments level the hills first (like real hillside new towns)
DEMO.terraform = function () {
  const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, H = G.H, W = G.Wl;
  for (const R of [{ x: 95, z: -80, r: 68 }, { x: -105, z: -75, r: 52 }, { x: 130, z: 0, r: 45 }]) { let sum = 0, cnt = 0; const cells = [];
    for (let j = Math.max(0, Math.floor((R.z - R.r - h0) / cell)); j <= Math.min(n - 1, Math.ceil((R.z + R.r - h0) / cell)); j++) for (let i = Math.max(0, Math.floor((R.x - R.r - h0) / cell)); i <= Math.min(n - 1, Math.ceil((R.x + R.r - h0) / cell)); i++) {
      const x = h0 + i * cell, z = h0 + j * cell, d = Math.hypot(x - R.x, z - R.z), k = j * n + i; if (d > R.r || H[k] < 1 || !isNaN(W[k]) || G.prot[k] || G.roadDist[k] < 7 || DEMO.excluded(x, z)) continue; cells.push([k, d]); if (d < R.r * 0.6) { sum += H[k]; cnt++; } }
    if (!cnt) continue; const tgt = sum / cnt; for (const [k, d] of cells) { const w = 1 - sstep(R.r * 0.62, R.r, d); H[k] = lerp(H[k], tgt, w); }
    const [i0, j0] = toIdx(R.x - R.r - 4, R.z - R.r - 4), [i1, j1] = toIdx(R.x + R.r + 4, R.z + R.r + 4); refreshRegion(i0, j0, i1, j1); }
};
DEMO.roadGrid = async function (say) {
  // long straight avenues on a 60 m grid; each line is cut where it meets buildings, steep hills or the forest, and built in 30 m steps
  const lines = []; for (const z of [-60, 0, 60, 115]) lines.push({ ax: 'x', c: z }); for (const x of [-150, -90, -30, 30, 90, 150]) lines.push({ ax: 'z', c: x });
  const down = (x, z) => Math.hypot(x - OPEN.x, z - OPEN.z) < 120 || (z > -20 && z < 100 && x > -120 && x < 60);
  let made = 0, k = 0;
  for (const L of lines) { const pts = []; for (let t = -300; t <= 300; t += 6) { const x = L.ax === 'x' ? t : L.c, z = L.ax === 'x' ? L.c : t; pts.push({ x, z, ok: DEMO.nodeOK(x, z), wet: !isNaN(waterLevelAt(G, x, z)) }); }
    // runs of usable ground (short wet gaps are bridged by the road itself)
    const runs = []; let cur = [], gap = 0; for (const p of pts) { if (p.ok) { if (gap && cur.length) { /* keep */ } cur.push(p); gap = 0; } else if (p.wet && cur.length && gap < 4) { gap++; } else { if (cur.length) runs.push(cur); cur = []; gap = 0; } } if (cur.length) runs.push(cur);
    for (const run of runs) { if (run.length < 7) continue; const step = 5; for (let i = 0; i + step < run.length; i += step) { const a = run[i], b = run[Math.min(run.length - 1, i + step)], mid = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }, dt = down(mid.x, mid.z); if (DEMO.road(a, b, dt, dt)) made++; }
      if (++k % 2 === 0) { say(`道路を引いています… ${made}本`); await tick(); } } }
  // dead ends: connect to the nearest other road
  for (const r of ROADS.filter(r => r.user && !isFoot(r))) for (const e of [r.pts[0], r.pts[r.pts.length - 1]]) { const near = ROADS.some(q => q !== r && q.pts.some(p => Math.hypot(p[0] - e[0], p[1] - e[1]) < 6)); if (near) continue; let best = null; for (const q of ROADS) { if (q === r || isFoot(q)) continue; for (let s2 = 0; s2 < rLen(q); s2 += 4) { const p = rAt(q, s2), d = Math.hypot(p.x - e[0], p.z - e[1]); if (d > 10 && d < 55 && (!best || d < best.d)) best = { d, x: p.x, z: p.z }; } } if (best && DEMO.road({ x: e[0], z: e[1] }, best, false, false)) made++; }
  return made;
};
DEMO.zone = function (x, z) {
  const L = RS.beach && RS.beach.line; if (L && L.some(c => Math.hypot(c.x - x, c.z - z) < 130)) return 'resort';
  for (let a = 0; a < 6.28; a += 0.8) if (groundH(x + Math.cos(a) * 40, z + Math.sin(a) * 40) < -0.5) return 'coast';
  if (Math.hypot(x - OPEN.x, z - OPEN.z) < 130 || Math.hypot(x - VILLAGE.x, z - VILLAGE.z) < 100) return 'down';
  return 'sub';
};
const DEMO_MIX = { resort: [['hotelL', 4], ['hotelG', 3], ['condo', 3], ['slim', 2], ['villa', 0.4], ['cafe', 0.4]], coast: [['hotelL', 3], ['condo', 3], ['hotelG', 2], ['slim', 2], ['cafe', 0.3]], down: [['office', 4], ['slim', 3], ['condo', 3], ['hotelG', 2], ['midrise', 1], ['cafe', 0.3], ['park', 0.3]], sub: [['slim', 3], ['condo', 3], ['midrise', 2], ['office', 2], ['hotelG', 1], ['cafe', 0.3], ['park', 0.3]] };
DEMO.pick = function (zone, R) { const L = DEMO_MIX[zone], tot = L.reduce((s, q) => s + q[1], 0); let r = R() * tot; for (const [id, w] of L) { r -= w; if (r <= 0) return id; } return L[0][0]; };
DEMO.big = function (only) {
  const plan = [['stadium', { x: 100, z: -88 }], ['coaster', { x: 140, z: 20 }], ['waterpark', { x: 120, z: 62 }], ['ferris', { x: 120, z: -25 }], ['carousel', { x: 150, z: -20 }], ['drop', { x: 105, z: 35 }], ['obs', { x: 0, z: -35 }], ['mall', { x: -60, z: 30 }], ['mall', { x: 60, z: 30 }], ['ferris', { x: -150, z: 20 }]];
  let n = 0; for (const [id, c] of plan) { if (only && !only.includes(id)) continue; if (!only && ['stadium', 'coaster'].includes(id) && CITY.list.some(b => b.t === id)) continue; const pl = DEMO.find(c, 0, 200, p => { if (DEMO.excluded(p.x, p.z)) return null; for (const r of [undefined, 0, Math.PI / 2]) { const q = CITY.planAt(id, p, r); if (q && q.ok) return q; } return null; }, 7); if (pl) { CITY.place(pl, false); n++; } else (DEMO.missBig = DEMO.missBig || []).push(id); } return n;
};
DEMO.fill = async function (say, max = 150, minA = 0, maxA = 1e9) {
  const R = mulberry(2026); let n = 0, k = 0; const roads = ROADS.filter(r => !isFoot(r)).sort((a, b) => (b.user ? 1 : 0) - (a.user ? 1 : 0));
  for (const r of roads) { const len = rLen(r); for (const side of [1, -1]) { let s = 5;
      while (s < len - 5 && CITY.list.length < max) { const a = rAt(r, s), b = rAt(r, Math.min(len, s + 2)); let dx = b.x - a.x, dz = b.z - a.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const nx = dz * side, nz = -dx * side, rot = Math.atan2(-nx, -nz);
        const zone = DEMO.zone(a.x, a.z), sz = id => CITY_TYPES[id].w * CITY_TYPES[id].d, fit = id => sz(id) >= minA && sz(id) <= maxA; let first = DEMO.pick(zone, R); for (let q = 0; q < 6 && !fit(first); q++) first = DEMO.pick(zone, R); const tries = [first, ...DEMO_MIX[zone].map(q => q[0]).filter(q => q !== first)].filter(fit); let ok = false;
        for (const id of tries) { const T = CITY_TYPES[id], off = r.w / 2 + (r.side ? 1.6 : 0) + T.d / 2 + 3.0, c = { x: a.x + nx * off, z: a.z + nz * off }; if (DEMO.excluded(c.x, c.z)) continue; const pl = CITY.planAt(id, c, rot); if (pl && !pl.ok) { DEMO.errs = DEMO.errs || {}; DEMO.errs[id + ':' + pl.err] = (DEMO.errs[id + ':' + pl.err] || 0) + 1; } if (pl && pl.ok) { CITY.place(pl, false); n++; s += T.w + 3; ok = true; break; } }
        if (!ok) s += 5; if (++k % 25 === 0) { say(`街をつくっています… ${CITY.list.length}棟`); await tick(); } } } }
  return n;
};
DEMO.infill = async function (say, max) { const R = mulberry(77); let k = 0;
  for (let it = 0; it < 2500 && CITY.list.length < max; it++) { const x = (R() - 0.5) * 560, z = (R() - 0.5) * 560; if (DEMO.excluded(x, z) || groundH(x, z) < 1) continue; const nr = nearestOnRoads(x, z, 45, false); if (!nr || nr.d < 8) continue; const zone = DEMO.zone(x, z), id = cbPick(R, zone === 'resort' || zone === 'coast' ? ['hotelL', 'hotelG', 'condo', 'slim'] : ['office', 'condo', 'slim', 'slim', 'midrise']), pl = CITY.planAt(id, { x, z }); if (pl && pl.ok) CITY.place(pl, false); if (++k % 60 === 0) { say(`街をつくっています… ${CITY.list.length}棟`); await tick(); } } };
DEMO.city = async function (say) {
  const toast = UI.toast; UI.toast = () => { }; const t0 = performance.now();
  try {
    const roads = DEMO.stats0;
    say('遊園地・展望タワー・モールを建てています…'); await tick(); const big = DEMO.bigN + DEMO.big();
    say('ホテル街とダウンタウンをつくっています…'); await tick(); await DEMO.fill(say, 190, 300); await DEMO.fill(say, 230, 190); await DEMO.infill(say, 250); await DEMO.fill(say, 262, 0);
    say('仕上げています…'); await tick(); refreshAll(); CITY.rebuildAll(); GAME.refreshDev(); GAME.syncNewcomers(); GAME.mapDirty = true; MINI.builtAt = -99; GAME.renderTracker();
    DEMO.stats = { roads, big, total: CITY.list.length, ms: Math.round(performance.now() - t0) };
  } finally { UI.toast = toast; EDIT.nodes = []; EDIT.undo = []; EDIT.rtype = 'asphalt'; EDIT.roadW = 'narrow'; EDIT.rside = false; }
};
GAME.startDemo = function () {
  const t = this.el.title; t.innerHTML = `<div class="tbox" id="demoLoad"><div class="logo"><div class="l1">体験モード</div><div class="l2">島ぐらし</div></div><p class="lead">島を極限まで開発しています…（30秒〜1分ほど）</p></div>`;
  setTimeout(async () => {
    DEMO.on = true; if (EDIT.on) toggleEdit(false);
    restore({ H: G.H0, Wl: G.Wl0, roads: [], removed: new Uint8Array(VEG.removed.length), trees: [], bridges: [] }); EDIT.undo = [];
    const p = this.newProfile('ユウ', 'ほしなみ'); p.vit = 600; p.demo = 1; this.begin(p, false); this.el.title.hidden = false; this.modal = 'title';
    DEMO.say('開発をすすめています…'); await tick(); let skipped = []; try { skipped = DEMO.build(); } catch (e) { console.warn('demo', e); }
    DEMO.say('丘をけずって街の土地をつくっています…'); await tick(); try { DEMO.terraform(); } catch (e) { console.warn('demo terraform', e); }
    DEMO.say('スタジアム・遊園地・展望タワーを建てています…'); await tick(); try { DEMO.bigN = DEMO.big(['stadium', 'coaster']); } catch (e) { console.warn('demo big', e); }
    const toast = UI.toast; UI.toast = () => { }; try { DEMO.say('道路網を引いています…'); await tick(); DEMO.stats0 = await DEMO.roadGrid(DEMO.say); } catch (e) { console.warn('demo roads', e); } UI.toast = toast; EDIT.nodes = []; EDIT.rside = false; EDIT.roadW = 'narrow';
    try { await DEMO.city(DEMO.say); } catch (e) { console.warn('demo city', e); }
    this.el.title.hidden = true; this.modal = null; this.p.money = 50000000; this.startAtHome(); this.dirty = false; EDIT.undo = [];
    DEMO.button(); this.openDemoWarp(true, skipped); DEMO.done = true;
  }, 60);
};
{ const _sp = DEMO.spots; DEMO.spots = function () { const out = _sp(); const seen = new Set(), add = (b, name) => { const T = CITY_TYPES[b.t], [x, z] = toWorld(b, 0, T.d / 2 + 14); out.splice(1 + seen.size, 0, { name, icon: T.icon, x, z, face: [b.x - x, b.z - z] }); seen.add(b.t + name); };
  const first = (t) => CITY.list.find(b => b.t === t); for (const [t, n] of [['ferris', '遊園地（観覧車）'], ['coaster', 'ジェットコースター'], ['waterpark', 'ウォーターパーク'], ['stadium', 'スタジアム'], ['obs', '展望タワー'], ['mall', 'ショッピングモール']]) { const b = first(t); if (b) add(b, n); }
  const office = CITY.list.filter(b => b.t === 'office' || b.t === 'condo'); if (office.length) add(office[Math.floor(office.length / 2)], 'ダウンタウン（高層ビル街）'); const hot = CITY.list.filter(b => b.t === 'hotelL'); if (hot.length) add(hot[0], 'ホテル街'); return out; }; }
// the development panel points to the free-building tool
{ const _od = GAME.openDev; GAME.openDev = function () { const r = _od.apply(this, arguments); try { const mb = this.el.modal.querySelector('.mbox'); if (mb && !mb.querySelector('.citylink')) { const un = CITY.unlocked(); mb.querySelector('.mh') && mb.querySelector('.mh').insertAdjacentHTML('afterend', `<div class="citylink" style="margin:6px 0 10px;padding:10px 12px;border-radius:12px;background:${un ? '#eaf4ff' : '#f2f2ee'};display:flex;gap:10px;align-items:center;justify-content:space-between"><span>🏙️ <b>街づくり</b>　${un ? 'ホテル・タワー・遊園地・スタジアムなどを、お金を払えば何度でも建てられます' : '物語をクリアすると、ホテル・タワー・遊園地などを何度でも建てられるようになります'}</span>${un ? '<button class="primary" data-city="1" style="padding:8px 14px;font-size:14px">ひらく（Y）</button>' : ''}</div>`); const bt = mb.querySelector('[data-city]'); if (bt) bt.onclick = () => { this.closeModal(); toggleEdit(true); setTool('city'); UI.editPanel(); }; } } catch (e) { } return r; }; }
