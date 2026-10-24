// ===================== いつも右下に出る小さな地図（現在地・場所の名前） =====================
const MINI = { base: null, t: 0, builtAt: -99, view: 170 };
const LM_LABEL = { falls: '滝', light: '灯台', church: '神社', peak: '見晴らしの丘のてっぺん', mikan: 'みかん畑', beach: '夕日の浜', islet: 'はなれ小島', harbor: '港', home: 'あなたの家', hall: '集会所', ship: '漁協 出荷所', shop: '商店', motors: '島モータース' };
Object.assign(GAME, {
  startAtHome() { // つづきから: always wake up in front of your own house, vehicles parked at home / harbor
    PL.veh = null; PL.x = this.spawn.x; PL.z = this.spawn.z; PL.rot = this.spawn.rot; PL.y = standY(PL.x, PL.z); PL.mesh.visible = true;
    VEH.forEach(v => { v.x = v.home.x; v.z = v.home.z; v.rot = v.home.rot; v.v = 0; placeVehicle(v, 0); });
    CAM.mode = 'third'; UI.viewMode && UI.viewMode('third'); CAM.yaw = PL.rot + Math.PI + 1.05; CAM.pitch = 0.42; CAM.dist = 7; CAM.distT = 5.2; CAM.len = 7; CAM.lastDrag = performance.now() / 1000; CAM.snap = true; CAM.target.set(PL.x, PL.y + 1.05, PL.z);
  },
  initMinimap() {
    const w = document.createElement('div'); w.className = 'minimap'; w.id = 'miniMap'; w.title = 'クリックで大きな地図'; w.setAttribute('role', 'button'); w.setAttribute('aria-label', '島の地図（クリックで大きく表示）');
    w.innerHTML = `<canvas width="360" height="360"></canvas><span class="n">N</span><div class="where" id="miniWhere"></div>`;
    document.getElementById('hud').appendChild(w); MINI.el = w; MINI.cv = w.querySelector('canvas'); MINI.where = w.querySelector('#miniWhere');
    w.onclick = () => { if (this.p && !this.modal) this.openMap(); };
    MINI.base = document.createElement('canvas'); MINI.base.width = MINI.base.height = 1080; this.mapDirty = true;
  },
  rebuildMiniBase() { if (!this.p) return; try { this.drawMap(MINI.base, true); } catch (e) { console.warn('minimap', e); } MINI.builtAt = performance.now() / 1000; this.mapDirty = false; },
  whereText() {
    if (this.inside) return this.place ? `🏢 ${this.placeName(this.place)}（中）` : this.visit ? `🏠 ${this.visit.n.def.name}の家（おじゃま中）` : '🏠 あなたの家（家の中）';
    const x = PL.x, z = PL.z, [i, j] = toIdx(x, z), zn = ZONES[G.zone[j * WORLD.n + i]];
    let lm = null, bd = 45; for (const [id, L] of Object.entries(this.LM)) { if (!LM_LABEL[id] || L.gone) continue; const d = Math.hypot(L.x - x, L.z - z); if (d < bd) { bd = d; lm = id; } }
    const sea = groundH(x, z) < -0.5 && !PL.veh ? false : groundH(x, z) < -0.5;
    const base = sea ? '🌊 海の上' : `${zn ? zn.num + zn.name : ''}`;
    return lm ? `${base}　📍${LM_LABEL[lm]}${bd < 15 ? '' : 'の近く'}` : base;
  },
  updateMinimap(dt) {
    if (!MINI.el || !this.p) return; MINI.t -= dt; if (MINI.t > 0) return; MINI.t = 0.15;
    const now = performance.now() / 1000; if (this.mapDirty && now - MINI.builtAt > 2) this.rebuildMiniBase(); if (!MINI.builtAt || MINI.builtAt < 0) this.rebuildMiniBase();
    const cv = MINI.cv, ctx = cv.getContext('2d'), W = cv.width, E = 246, S = MINI.base.width / (2 * E);
    let px = PL.x, pz = PL.z, rot = PL.rot; if (this.inside && this.outPos) { px = this.outPos.x; pz = this.outPos.z; rot = this.outPos.rot; }
    const view = PL.veh ? 260 : MINI.view, sw = view * S, sx = (px + E) * S - sw / 2, sy = (pz + E) * S - sw / 2, k = W / sw;
    ctx.save(); ctx.clearRect(0, 0, W, W); ctx.beginPath(); ctx.arc(W / 2, W / 2, W / 2 - 2, 0, 6.2832); ctx.clip();
    ctx.fillStyle = '#3f8fc0'; ctx.fillRect(0, 0, W, W); ctx.drawImage(MINI.base, sx, sy, sw, sw, 0, 0, W, W);
    const P = (x, z) => [((x + E) * S - sx) * k, ((z + E) * S - sy) * k];
    // today's visit targets
    const want = new Set(this.todays().filter(m => m.visit && !this.p.daily.done[m.id]).map(m => m.visit));
    ctx.font = '900 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const id of want) { const L = this.LM[id]; if (!L) continue; let [a, b] = P(L.x, L.z); const dx = a - W / 2, dy = b - W / 2, d = Math.hypot(dx, dy), R = W / 2 - 22; if (d > R) { a = W / 2 + dx / d * R; b = W / 2 + dy / d * R; } ctx.fillStyle = '#ffcf3a'; ctx.strokeStyle = '#7a4a00'; ctx.lineWidth = 3; ctx.strokeText('★', a, b); ctx.fillText('★', a, b); }
    for (const n of NPCS) { const [a, b] = P(n.x, n.z); if (a < 0 || b < 0 || a > W || b > W) continue; ctx.fillStyle = '#ff8fb0'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(a, b, 7, 0, 6.3); ctx.fill(); ctx.stroke(); }
    ctx.font = '26px sans-serif';
    for (const v of VEH) { if (v === PL.veh) continue; const [a, b] = P(v.x, v.z); ctx.fillText(v.kind === 'boat' ? '🚤' : '🚗', a, b); }
    if (typeof DV !== 'undefined') { if (DV.bus && DV.bus !== PL.veh) { const [a, b] = P(DV.bus.x, DV.bus.z); ctx.fillText('🚌', a, b); } if (DV.ferry && DV.ferry !== PL.veh) { const [a, b] = P(DV.ferry.x, DV.ferry.z); ctx.fillText('🛳️', a, b); } }
    // player arrow in the centre
    ctx.translate(W / 2, W / 2); ctx.rotate(-rot); ctx.fillStyle = '#f2a541'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(15, -13); ctx.lineTo(0, -5); ctx.lineTo(-15, -13); ctx.closePath(); ctx.stroke(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W / 2, W / 2, W / 2 - 4, 0, 6.2832); ctx.stroke();
    const t = this.whereText(); if (MINI.whereT !== t) { MINI.whereT = t; MINI.where.innerHTML = t.split('　').map(x => '<span style="white-space:nowrap">' + x.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]) + '</span>').join(' '); }
  },
});
// hook: rebuild the base map when the island changes
for (const fn of ['refreshDev', 'refreshProjects', 'syncNewcomers', 'refreshDecor', 'newDay', 'applyLand']) { const f0 = GAME[fn]; if (!f0) continue; GAME[fn] = function (...a) { const r = f0.apply(this, a); this.mapDirty = true; return r; }; }
{ const fr = finishRoad, rr = removeUserRoad; finishRoad = function (...a) { const r = fr.apply(this, a); GAME.mapDirty = true; return r; }; removeUserRoad = function (...a) { const r = rr.apply(this, a); GAME.mapDirty = true; return r; }; }
