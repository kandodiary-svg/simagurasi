// ===================== バス路線を決めやすく (ver.46) =====================
// - 道路をクリックすると、遠回りがいちばん少ない順番に停留所が入る（いままでは必ず最後に足されたので、途中に足せなかった）
// - 停留所はドラッグで動かせる。クリックで消す。まちがえても「↶ もどす」（Z）で戻せる
// - カーソルの下に「ここに置くと◯番目」と、置いたあとの経路が先に見える（置けないところは赤）
// - 一覧の▲▼で順番を入れかえ、🪄おまかせで島の名所をむすぶ路線を自動で作れる。ひとまわりの時間も出る
const BUSE = { hist: [], last: null, press: null, gh: null, key: '', lineKey: '', MIN: 25 };
// shortest road distance from node a to every node (the same graph BUSX.path uses)
BUSX.distFrom = function (a) {
  const G = BUSX.G || BUSX.graph(), n = G.N.length, dist = new Float64Array(n).fill(Infinity), H = [];
  const push = (d, i) => { H.push([d, i]); let k = H.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (H[p][0] <= H[k][0]) break; [H[p], H[k]] = [H[k], H[p]]; k = p; } };
  const pop = () => { const top = H[0], last = H.pop(); if (H.length) { H[0] = last; let k = 0; for (;;) { const l = k * 2 + 1, r = l + 1; let m = k; if (l < H.length && H[l][0] < H[m][0]) m = l; if (r < H.length && H[r][0] < H[m][0]) m = r; if (m === k) break; [H[m], H[k]] = [H[k], H[m]]; k = m; } } return top; };
  dist[a] = 0; push(0, a); while (H.length) { const [d, i] = pop(); if (d > dist[i]) continue; for (const [j, w] of G.N[i].e) { const nd = d + w; if (nd < dist[j]) { dist[j] = nd; push(nd, j); } } }
  return dist;
};
BUSE.open = () => { const D = GAME.p && GAME.devState(); return !!(D && D.bus && D.bus.state === 'done'); };
BUSE.snap = function (p, maxD = 8) { if (!p) return null; if (!BUSX.G) BUSX.graph(); const ni = BUSX.nearestNode(p.x, p.z, maxD); if (ni < 0) return null; const n = BUSX.G.N[ni]; return { ni, x: n.x, z: n.z, y: n.y }; };
BUSE.hitStop = function (p, R) { if (!p) return -1; let bi = -1, bd = 6; R.stops.forEach((s, k) => { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; bi = k; } }); return bi; };
BUSE.nameFor = function (x, z, used) { let name = BUSX.placeName(x, z) || ''; if (name && !used.has(name)) return name; let k = 1; if (name) { const b = name.replace(/前$/, ''); while (used.has(`${b}${k}丁目`)) k++; return `${b}${k}丁目`; } while (used.has(`第${k}停留所`)) k++; return `第${k}停留所`; };
// where a new stop on node ni fits best: the place in the order that adds the least driving (cheapest insertion)
BUSE.bestSlot = function (R, ni, skip = -1) {
  const S = R.stops.filter((_, k) => k !== skip), loop = R.mode === 'loop', n = S.length; if (!n) return { k: 0 };
  const d = BUSX.distFrom(ni), ids = S.map(s => BUSX.nearestNode(s.x, s.z)); if (ids.some(i => i < 0)) return { k: n };
  const dn = ids.map(i => d[i]); if (dn.some(v => !isFinite(v))) return { err: 'この道路はバスの路線とつながっていません' };
  const P = BUSX.build({ stops: S, mode: R.mode }); if (P.err) return { k: n };
  const leg = k => { const a = P.cum[P.stops[k].i], b = k + 1 < n ? P.cum[P.stops[k + 1].i] : P.cum[P.cum.length - 1]; return Math.max(0, b - a); };
  let best = { k: n, cost: Infinity };
  if (!loop) { const c0 = dn[0], cN = dn[n - 1]; if (c0 < best.cost) best = { k: 0, cost: c0 }; if (cN < best.cost) best = { k: n, cost: cN }; }
  for (let k = 1; k <= (loop ? n : n - 1); k++) { const a = k - 1, b = k % n; const c = dn[a] + dn[b] - leg(a); if (c < best.cost - 0.01) best = { k, cost: c }; }
  return best;
};
// what a click / drop at p would do → { kind: 'add'|'move'|'del'|'bad', ok, text, route }
BUSE.plan = function (p, drag) {
  const R = BUSX.route(), hit = drag ? drag.k : BUSE.hitStop(p, R);
  if (!drag && hit >= 0) return { kind: 'del', ok: R.stops.length > 2, at: R.stops[hit], text: R.stops.length > 2 ? `× 「${R.stops[hit].name}」を消す（ドラッグで移動）` : '停留所は2つ以上必要です（ドラッグで移動）' };
  const n = BUSE.snap(p); if (!n) return { kind: 'bad', ok: false, at: p, text: '道路の上に置けます' };
  const near = R.stops.findIndex((s, k) => k !== hit && Math.hypot(s.x - n.x, s.z - n.z) < BUSE.MIN); if (near >= 0) return { kind: 'bad', ok: false, at: n, text: `「${R.stops[near].name}」に近すぎます（${BUSE.MIN}m 以上はなす）` };
  const slot = BUSE.bestSlot(R, n.ni, drag ? hit : -1); if (slot.err) return { kind: 'bad', ok: false, at: n, text: slot.err };
  const S = R.stops.map(s => ({ ...s })), used = new Set(S.filter((_, k) => k !== hit).map(s => s.name));
  let st; if (drag) { st = S.splice(hit, 1)[0]; st.x = n.x; st.z = n.z; if (st.auto !== false && BUSX.placeName(n.x, n.z) !== st.name) st.name = BUSE.nameFor(n.x, n.z, used); } else st = { x: n.x, z: n.z, name: BUSE.nameFor(n.x, n.z, used) };
  S.splice(slot.k, 0, st); const route = { stops: S, mode: R.mode }, P = BUSX.build(route); if (P.err) return { kind: 'bad', ok: false, at: n, text: P.err };
  return { kind: drag ? 'move' : 'add', ok: true, at: n, route, P, k: slot.k, text: drag ? `✋ 「${st.name}」をここへ（${slot.k + 1}番目）` : `＋ 「${st.name}」（${slot.k + 1}番目に入ります）` };
};
// ---------- history: every change can be undone (Z or ↶) ----------
BUSE.snapNow = () => JSON.stringify(GAME.p && GAME.p.busRoute || null);
BUSE.mark = function () { const now = BUSE.snapNow(); if (BUSE.last !== null && now !== BUSE.last) { BUSE.hist.push(BUSE.last); if (BUSE.hist.length > 30) BUSE.hist.shift(); } BUSE.last = now; };
BUSE.undo = function () { const s = BUSE.hist.pop(); if (s === undefined) { UI.toast('もどせる路線の操作がありません'); return; } GAME.p.busRoute = JSON.parse(s); BUSE.last = s; BUSX.apply(); UI.toast('↶ 路線をひとつもどしました'); };
{ const _a = BUSX.apply; BUSX.apply = function () { if (BUSE.last === null) BUSE.last = BUSE.snapNow(); BUSE.mark(); BUSE.key = ''; return _a.apply(this, arguments); }; }
{ const _e = BUSX.editRoute; BUSX.editRoute = function () { if (BUSE.last === null) BUSE.last = BUSE.snapNow(); return _e.apply(this, arguments); }; }
{ const _u = undoEdit; undoEdit = function () { if (EDIT.on && EDIT.tool === 'busroute' && GAME.p) { BUSE.undo(); return; } return _u.apply(this, arguments); }; }
// ---------- click / drag on the map ----------
BUSE.commit = function (pl) {
  if (!pl.ok) { UI.toast('🚫 ' + pl.text.replace(/^[×＋✋] /, '')); return; }
  const R = BUSX.editRoute();
  if (pl.kind === 'del') { const k = R.stops.indexOf(R.stops.find(s => s.x === pl.at.x && s.z === pl.at.z)); if (k < 0) return; const s = R.stops.splice(k, 1)[0]; UI.toast(`🚏 「${s.name}」を消した（Z でもどせます）`); BUSX.apply(); return; }
  R.stops = pl.route.stops; const st = R.stops[pl.k]; UI.toast(pl.kind === 'move' ? `🚏 「${st.name}」を動かした（${pl.k + 1}番目）` : `🚏 停留所「${st.name}」をつくった（${pl.k + 1}番目・全${R.stops.length}か所）`); BUSX.apply();
};
{ const _d = editPointerDown; editPointerDown = function (e) {
  if (EDIT.tool !== 'busroute' || e.button !== 0) return _d(e);
  if (!BUSE.open()) { UI.toast('🔒 開発（P）で「島めぐりバス」を開業すると、路線を決められます'); return; }
  const p = pickSurface(e.clientX, e.clientY); if (!p) return; const R = BUSX.route(); BUSE.press = { x: p.x, z: p.z, k: BUSE.hitStop(p, R), moved: false }; BUSE.key = ''; }; }
{ const _up = editPointerUp; editPointerUp = function () {
  const pr = BUSE.press; BUSE.press = null; if (!pr || EDIT.tool !== 'busroute') return _up.apply(this, arguments);
  const p = EDIT.hover || pr; BUSE.key = '';
  if (pr.k >= 0 && pr.moved) BUSE.commit(BUSE.plan(p, { k: pr.k })); else BUSE.commit(BUSE.plan(pr));
  return _up.apply(this, arguments); }; }
// ---------- what you'd get, under the cursor ----------
BUSE.ghost = function () {
  if (BUSE.gh) return BUSE.gh; const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 3.4, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#3fbf6a', transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide })); ring.position.y = 1.7; ring.renderOrder = 61; g.add(ring);
  const line = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: '#2fd06a', transparent: true, opacity: 0.85, depthWrite: false })); line.renderOrder = 56; line.frustumCulled = false;
  const tip = document.createElement('div'); tip.id = 'busTip'; tip.style.cssText = 'position:fixed;z-index:30;pointer-events:none;padding:5px 10px;border-radius:10px;background:rgba(255,255,255,.95);box-shadow:0 2px 8px rgba(0,0,0,.25);font:600 13px "M PLUS Rounded 1c",sans-serif;color:#234;border-left:5px solid #2fb85a;display:none;white-space:nowrap';
  document.body.appendChild(tip); scene.add(g); scene.add(line); BUSE.gh = { g, ring, line, tip, text: '' }; return BUSE.gh;
};
BUSE.hide = function () { if (BUSE.gh) { BUSE.gh.g.visible = false; BUSE.gh.line.visible = false; BUSE.gh.tip.style.display = 'none'; } BUSE.key = ''; };
BUSE.hover = function (p) {
  if (!p || !BUSE.open() || !EDIT.mouse) { BUSE.hide(); return; }
  const pr = BUSE.press; if (pr && pr.k >= 0 && !pr.moved && Math.hypot(p.x - pr.x, p.z - pr.z) > 3) pr.moved = true;
  const drag = pr && pr.k >= 0 && pr.moved ? { k: pr.k } : null, R = BUSX.route();
  // only re-plan when the snapped road point (or the stop under the cursor) changes: the plan runs a shortest-path search
  const sn = BUSE.snap(p), hk = drag ? -1 : BUSE.hitStop(p, R), key = (drag ? 'd' + drag.k : 'h' + hk) + ':' + (sn ? sn.ni : 'x') + ':' + R.stops.length + R.mode;
  const G = BUSE.ghost(); if (key !== BUSE.key) { BUSE.key = key; const pl = BUSE.plan(p, drag); BUSE.cur = pl;
    const col = pl.ok ? (pl.kind === 'del' ? '#d9534f' : pl.kind === 'move' ? '#e08a1a' : '#2fb85a') : '#c0392b';
    G.ring.material.color.set(col); G.tip.style.borderLeftColor = col; if (pl.text !== G.text) { G.text = pl.text; G.tip.textContent = pl.text; }
    const at = pl.at || p; G.g.position.set(at.x, standY(at.x, at.z), at.z); G.g.visible = true;
    G.line.geometry.dispose(); if (pl.P && !pl.P.err && pl.P.pts.length > 1) { const v = pl.P.pts.map(q => new THREE.Vector3(q[0], q[1] + 0.75, q[2])); G.line.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v), Math.min(600, v.length * 2), 0.22, 5); G.line.material.color.set(pl.kind === 'move' ? '#ffb02a' : '#2fd06a'); G.line.visible = true; } else { G.line.geometry = new THREE.BufferGeometry(); G.line.visible = false; } }
  G.g.visible = true; G.tip.style.display = 'block'; G.tip.style.left = (EDIT.mouse.x + 16) + 'px'; G.tip.style.top = (EDIT.mouse.y + 14) + 'px';
};
{ const _u = updateEdit; updateEdit = function (dt) { _u(dt); if (EDIT.on && EDIT.tool === 'busroute' && GAME.p) BUSE.hover(EDIT.hover); else if (BUSE.gh && (BUSE.gh.g.visible || BUSE.gh.line.visible)) BUSE.hide(); }; }
// ---------- おまかせ: link the island's places that a road reaches, in a sensible order ----------
BUSE.auto = function () {
  if (!BUSX.G) BUSX.graph(); const L = GAME.LM || {}, pri = ['harbor', 'shop', 'hall', 'home', 'ship', 'motors', 'beach', 'light', 'church', 'peak', 'mikan', 'falls'];
  const cand = []; for (const k of pri) { const v = L[k]; if (v && isFinite(v.x)) cand.push({ x: v.x, z: v.z }); }
  const D = GAME.devState(); for (const d of DEV) { const s = D[d.id]; if (s && s.state === 'done' && isFinite(s.x)) cand.push({ x: s.x, z: s.z }); }
  const picked = []; for (const c of cand) { const ni = BUSX.nearestNode(c.x, c.z, 40); if (ni < 0) continue; const n = BUSX.G.N[ni]; if (picked.some(q => Math.hypot(q.x - n.x, q.z - n.z) < 60)) continue; picked.push({ ni, x: n.x, z: n.z }); if (picked.length >= 9) break; }
  if (picked.length < 2) { UI.toast('道路ぞいの名所が足りません。道路をのばしてから試してね'); return; }
  const dm = picked.map(q => BUSX.distFrom(q.ni)), reach = picked.map((q, i) => isFinite(dm[0][q.ni]));
  const S = picked.filter((_, i) => reach[i]), M = S.map(a => S.map(b => dm[picked.indexOf(a)][b.ni])); if (S.length < 2) { UI.toast('つながった道路の上に、名所が2つ以上ありません'); return; }
  const loop = BUSX.route().mode === 'loop', n = S.length;
  const len = o => { let t = 0; for (let i = 0; i + 1 < o.length; i++) t += M[o[i]][o[i + 1]]; if (loop) t += M[o[o.length - 1]][o[0]]; return t; };
  let best = null; for (let s0 = 0; s0 < (loop ? 1 : n); s0++) { const o = [s0], left = new Set([...Array(n).keys()].filter(i => i !== s0)); while (left.size) { const c = o[o.length - 1]; let bj = -1, bd = Infinity; for (const j of left) if (M[c][j] < bd) { bd = M[c][j]; bj = j; } o.push(bj); left.delete(bj); }
    for (let imp = true, it = 0; imp && it < 40; it++) { imp = false; for (let i = 1; i < n - 1; i++) for (let j = i + 1; j < n; j++) { const t = o.slice(); t.splice(i, j - i + 1, ...o.slice(i, j + 1).reverse()); if (len(t) < len(o) - 0.5) { o.splice(0, n, ...t); imp = true; } } }
    if (!best || len(o) < len(best)) best = o.slice(); }
  const used = new Set(), stops = best.map(i => { const q = S[i], name = BUSE.nameFor(q.x, q.z, used); used.add(name); return { x: q.x, z: q.z, name }; });
  const R = BUSX.editRoute(); R.stops = stops; const P = BUSX.build(R); if (P.err) { UI.toast('🚫 ' + P.err); BUSE.undo(); return; }
  UI.toast(`🪄 名所をむすぶ路線を作りました（停留所${stops.length}か所・${Math.round(P.cum[P.cum.length - 1])}m）`); BUSX.apply();
};
// ---------- the side panel: reorder, undo, おまかせ, how long one trip takes ----------
BUSE.tripText = function (R, P) { if (!P || P.err) return ''; const L = P.cum[P.cum.length - 1], n = R.stops.length, sec = R.mode === 'loop' ? L / 7.5 + n * 9 : 2 * L / 7.5 + (2 * n - 2) * 9; return `ひとまわり 約${Math.max(1, Math.round(sec / 60))}分`; };
{ const _p = UI.editPanel; UI.editPanel = function () { _p.apply(this, arguments); if (!EDIT.on || EDIT.tool !== 'busroute' || !GAME.p) return; const box = document.querySelector('#editp .bussub'); if (!box) return;
  if (BUSE.last === null) BUSE.last = BUSE.snapNow();
  const seg = box.querySelector('.seg'); if (seg) seg.insertAdjacentHTML('beforeend', `<button data-be="auto" title="道路ぞいの名所をむすぶ路線を自動で作る">🪄 おまかせ</button><button data-be="undo" title="Z でも戻せます" ${BUSE.hist.length ? '' : 'disabled'}>↶ もどす</button>`);
  box.querySelectorAll('.bstops li').forEach((li, k, all) => { const del = li.querySelector('[data-bdel]'); li.insertAdjacentHTML('afterbegin', `<b class="bnum">${k + 1}</b>`); if (del) del.insertAdjacentHTML('beforebegin', `<button data-bmv="${k}:-1" title="ひとつ前へ" ${k ? '' : 'disabled'}>▲</button><button data-bmv="${k}:1" title="ひとつ後へ" ${k < all.length - 1 ? '' : 'disabled'}>▼</button>`); });
  const R = BUSX.route(), P = BUSX.build(R), info = box.querySelector(':scope > .small'); if (info && !P.err) info.insertAdjacentHTML('afterend', `<span class="small">⏱ ${BUSE.tripText(R, P).replace(/^・/, '')}（バス1台・停留所で9秒ずつ止まります）</span>`);
  box.querySelectorAll('[data-be]').forEach(b => b.onclick = e => { e.stopPropagation(); if (b.dataset.be === 'auto') BUSE.auto(); else BUSE.undo(); });
  box.querySelectorAll('[data-bmv]').forEach(b => b.onclick = e => { e.stopPropagation(); const [k, d] = b.dataset.bmv.split(':').map(Number), Rr = BUSX.editRoute(), j = k + d; if (j < 0 || j >= Rr.stops.length) return; [Rr.stops[k], Rr.stops[j]] = [Rr.stops[j], Rr.stops[k]]; const P2 = BUSX.build(Rr); if (P2.err) { [Rr.stops[k], Rr.stops[j]] = [Rr.stops[j], Rr.stops[k]]; UI.toast('🚫 ' + P2.err); return; } BUSX.apply(); });
  box.querySelectorAll('[data-bn]').forEach(inp => { const _c = inp.onchange; inp.onchange = e => { const Rr = BUSX.editRoute(), s = Rr.stops[+inp.dataset.bn]; if (s) s.auto = false; return _c && _c(e); }; }); }; }
{ const T = TOOLS.find(t => t.id === 'busroute'); if (T) T.hint = '道路をクリック：停留所を追加（遠回りしない順番に入ります）／停留所をドラッグ：移動／クリック：消す／Z：もどす'; }
{ const st = document.createElement('style'); st.textContent = `#editp .bussub{display:flex;flex-direction:column;gap:6px;width:100%}#editp .bstops{display:flex;flex-wrap:wrap;gap:5px 14px;margin:0;padding:0;list-style:none;max-height:124px;overflow:auto}#editp .bstops li{display:flex;align-items:center;gap:2px;font-size:12px}#editp .bstops input{width:104px;font:inherit;font-size:12px;padding:3px 6px;border-radius:8px;border:1px solid #c8d4cc}#editp .bstops button{padding:2px 6px;margin-left:1px;border-radius:8px;background:#f2e2e0;font-size:11px}#editp .bstops .bnum{display:inline-block;min-width:18px;height:18px;line-height:18px;border-radius:9px;background:#1f5fb8;color:#fff;font-size:11px;text-align:center;margin-right:3px}#editp .bstops button[data-bmv]{background:#e4ecf4}#editp .bstops button:disabled,#editp .bussub .seg button:disabled{opacity:.35}`; document.head.appendChild(st); }
{ const _b = GAME.begin; GAME.begin = function () { BUSE.hist = []; BUSE.last = null; BUSE.press = null; return _b.apply(this, arguments); }; }
