// ===================== SOUND: BGM, ambience, footsteps, vehicles, effects =====================
// Files live next to the page in sfx/ (CC0 from Freesound & Kenney, a few Japanese insects from 効果音ラボ).
const SND = { ctx: null, buf: {}, pend: {}, loops: {}, base: 'sfx/', t: 0, envT: 0, env: { sea: 0, tree: 0, hi: 0 }, next: {}, prefs: { bgm: 0.6, amb: 0.8, sfx: 0.85, mute: false }, lastMoney: null, lastHour: null, bgmSrc: null, treeGrid: null, treeT: -99, consT: -99, cons: [] };
try { Object.assign(SND.prefs, JSON.parse(localStorage.getItem('hoshinami2-audio') || '{}')); } catch (e) { }
const STEP_N = 5;
SND.savePrefs = function () { try { localStorage.setItem('hoshinami2-audio', JSON.stringify(SND.prefs)); } catch (e) { } SND.applyVol(); };
SND.applyVol = function () { if (!SND.ctx) return; const p = SND.prefs, m = p.mute ? 0 : 1, t = SND.ctx.currentTime; SND.bus.bgm.gain.setTargetAtTime(p.bgm * 0.55 * m, t, 0.1); SND.bus.amb.gain.setTargetAtTime(p.amb * m, t, 0.1); SND.bus.sfx.gain.setTargetAtTime(p.sfx * m, t, 0.1); };
SND.init = function () {
  if (SND.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const c = SND.ctx = new AC();
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(c.destination);
  const master = c.createGain(); master.gain.value = 0.9; master.connect(comp); SND.master = master;
  SND.bus = {}; for (const k of ['bgm', 'amb', 'sfx']) { SND.bus[k] = c.createGain(); }
  SND.bgmFilter = c.createBiquadFilter(); SND.bgmFilter.type = 'lowpass'; SND.bgmFilter.frequency.value = 20000; SND.bus.bgm.connect(SND.bgmFilter); SND.bgmFilter.connect(master);
  SND.ambFilter = c.createBiquadFilter(); SND.ambFilter.type = 'lowpass'; SND.ambFilter.frequency.value = 20000; SND.bus.amb.connect(SND.ambFilter); SND.ambFilter.connect(master);
  SND.bus.sfx.connect(master); SND.applyVol();
  // warm the cache with the things you hear first
  ['amb_sea', 'amb_sea_lap', 'amb_cicada', 'amb_birds', 'amb_insects', 'amb_wind', 'ui_click1', 'ui_open1', 'ui_close1'].forEach(n => SND.get(n));
  for (const s of ['grass', 'concrete', 'wood', 'sand']) for (let i = 0; i < STEP_N; i++) SND.get(`step_${s}${i}`);
  SND.startBgm();
};
SND.unlock = function () { SND.init(); if (SND.ctx && SND.ctx.state !== 'running') SND.ctx.resume().catch(() => { }); };
addEventListener('pointerdown', SND.unlock, true); addEventListener('keydown', SND.unlock, true); addEventListener('touchstart', SND.unlock, true);
SND.get = function (n) {
  if (SND.buf[n]) return Promise.resolve(SND.buf[n]); if (SND.pend[n]) return SND.pend[n]; if (!SND.ctx) return Promise.resolve(null);
  return SND.pend[n] = fetch(SND.base + n + '.mp3').then(r => { if (!r.ok) throw new Error(n); return r.arrayBuffer(); }).then(a => new Promise((res, rej) => SND.ctx.decodeAudioData(a, res, rej))).then(b => (SND.buf[n] = b)).catch(() => { SND.buf[n] = null; return null; });
};
// listener-relative gain/pan for a world position
SND.spatial = function (x, z, ref = 12, max = 120) {
  const cp = camera.position, d = Math.hypot(x - cp.x, z - cp.z); if (d > max) return null;
  const g = 1 / (1 + Math.pow(d / ref, 2)) * Math.max(0, 1 - d / max); const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  const rx = -dir.z, rz = dir.x, L = Math.hypot(rx, rz) || 1; const pan = d < 0.5 ? 0 : ((x - cp.x) * rx + (z - cp.z) * rz) / (L * d); return { g, pan: Math.max(-0.9, Math.min(0.9, pan)), d };
};
SND.play = function (n, o = {}) {
  if (!SND.ctx || SND.prefs.mute) return; const t0 = performance.now();
  const go = b => { if (!b || performance.now() - t0 > 600) return; const c = SND.ctx; let vol = o.vol === undefined ? 1 : o.vol, pan = o.pan || 0;
    if (o.pos) { if (GAME.inside && !o.inside) return; const s = SND.spatial(o.pos.x, o.pos.z, o.ref, o.max); if (!s) return; vol *= s.g; pan = s.pan; }
    if (vol < 0.003) return; const src = c.createBufferSource(); src.buffer = b; src.playbackRate.value = o.rate || 1; const g = c.createGain(); g.gain.value = vol; src.connect(g);
    let out = g; if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; } out.connect(SND.bus[o.bus || 'sfx']); src.start(c.currentTime + (o.delay || 0)); return src; };
  if (SND.buf[n]) return go(SND.buf[n]); SND.get(n).then(go);
};
SND.var = (pre, n, o) => SND.play(pre + Math.floor(Math.random() * n), o);
// ambience / engine loops: call loop(name, target) every frame; they fade in/out and stop when silent
SND.loop = function (n, target, o = {}) {
  if (!SND.ctx) return; let L = SND.loops[n];
  if (!L) { if (target < 0.003) return; L = SND.loops[n] = { cur: 0, src: null, gain: SND.ctx.createGain(), pan: SND.ctx.createStereoPanner ? SND.ctx.createStereoPanner() : null, quiet: 0 }; L.gain.gain.value = 0; if (L.pan) { L.gain.connect(L.pan); L.pan.connect(SND.bus[o.bus || 'amb']); } else L.gain.connect(SND.bus[o.bus || 'amb']);
    SND.get(n).then(b => { if (!b || !SND.loops[n] || L.src) return; const s = SND.ctx.createBufferSource(); s.buffer = b; s.loop = true; s.loopStart = 0.03; s.loopEnd = b.duration - 0.03; s.connect(L.gain); s.start(0, Math.random() * (b.duration - 0.1)); L.src = s; }); }
  L.target = target; L.rate = o.rate || 1; L.panT = o.pan || 0;
};
SND.tickLoops = function (dt) {
  const t = SND.ctx.currentTime;
  for (const [n, L] of Object.entries(SND.loops)) {
    const tg = L.target || 0; L.cur += (tg - L.cur) * Math.min(1, dt * (tg > L.cur ? 1.2 : 2.0)); L.target = 0; // must be re-asserted each frame
    L.gain.gain.setTargetAtTime(L.cur, t, 0.05); if (L.src) L.src.playbackRate.setTargetAtTime(L.rate, t, 0.08); if (L.pan) L.pan.pan.setTargetAtTime(L.panT, t, 0.1);
    if (L.cur < 0.002 && tg < 0.002) { L.quiet += dt; if (L.quiet > 4) { try { L.src && L.src.stop(); } catch (e) { } L.gain.disconnect(); delete SND.loops[n]; } } else L.quiet = 0;
  }
};
// ---------- BGM ----------
SND.startBgm = function () { SND.get('bgm_village').then(b => { if (!b || SND.bgmSrc) return; const s = SND.ctx.createBufferSource(); s.buffer = b; s.loop = true; s.loopStart = 0.05; s.loopEnd = b.duration; const g = SND.bgmGain = SND.ctx.createGain(); g.gain.value = 0; s.connect(g); g.connect(SND.bus.bgm); s.start(); SND.bgmSrc = s; }); };
// ---------- environment probe (4 times a second) ----------
SND.treeAt = function (x, z) {
  if (!SND.treeGrid || SND.t - SND.treeT > 20) { const G2 = new Map(); for (const it of (VEG.items || [])) { if (it.type !== 'tree' || (VEG.removed && VEG.removed[it.id])) continue; const k = Math.floor(it.x / 16) + ',' + Math.floor(it.z / 16); G2.set(k, (G2.get(k) || 0) + 1); } for (const t of (VEG.userTrees || [])) { const k = Math.floor(t.x / 16) + ',' + Math.floor(t.z / 16); G2.set(k, (G2.get(k) || 0) + 1); } SND.treeGrid = G2; SND.treeT = SND.t; }
  let n = 0; const ci = Math.floor(x / 16), cj = Math.floor(z / 16); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) n += SND.treeGrid.get((ci + a) + ',' + (cj + b)) || 0; return Math.min(1, n / 14);
};
SND.probe = function () {
  const e = SND.env, x = PL.x, z = PL.z; let sd = 99;
  outer: for (const r of [3, 6, 10, 15, 22, 30, 40, 52, 66]) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; if (groundH(x + Math.cos(a) * r, z + Math.sin(a) * r) < -0.4) { sd = r; break outer; } }
  e.seaD = sd; e.sea = Math.pow(Math.max(0, 1 - sd / 70), 1.4); e.tree = SND.treeAt(x, z); e.hi = Math.max(0, Math.min(1, (groundH(x, z) - 12) / 30));
  const L = GAME.LM || {}; const dd = p => p ? Math.hypot(p.x - x, p.z - z) : 999; e.harbor = Math.max(0, 1 - dd(L.harbor) / 110); e.beach = Math.max(0, 1 - dd(L.beach) / 90); e.falls = L.falls && !L.falls.gone ? Math.max(0, 1 - dd(L.falls) / 70) : 0;
  let rv = 999; if (G.river && G.river.pts) for (let k = 0; k < G.river.pts.length; k += 3) { const p = G.river.pts[k]; rv = Math.min(rv, Math.hypot(p[0] - x, p[1] - z)); } e.river = Math.max(0, 1 - rv / 45);
  const D = GAME.p && GAME.devState ? GAME.devState() : {}; e.camp = D.camp && D.camp.state === 'done' && D.camp.x !== undefined ? Math.max(0, 1 - Math.hypot(D.camp.x - x, D.camp.z - z) / 30) : 0;
  // construction sites nearby
  if (SND.t - SND.consT > 2) { SND.consT = SND.t; SND.cons = []; for (const grp of [typeof DV !== 'undefined' && DV.group, typeof PROJ !== 'undefined' && PROJ.group, typeof LIFE !== 'undefined' && LIFE.group]) if (grp) for (const c of grp.children) if (c.userData.cons) SND.cons.push(c.userData.cons); }
  let cb = 999, cp = null; for (const c of SND.cons) { const d = Math.hypot(c.x - x, c.z - z); if (d < cb) { cb = d; cp = c; } } e.cons = cp ? { x: cp.x, z: cp.z, d: cb } : null;
  let hb = 999; for (const h of (PLACED.houses || [])) { const d = Math.hypot(h.x - x, h.z - z); if (d < hb) hb = d; } e.house = Math.max(0, 1 - hb / 18);
};
// ---------- main update ----------
SND.update = function (dt) {
  if (!SND.ctx || SND.ctx.state !== 'running') return; SND.t += dt;
  const e = SND.env, h = currentHour(), rain = TIME.weather === 'rain', inside = !!GAME.inside, title = GAME.modal === 'title';
  SND.envT -= dt; if (SND.envT <= 0 && !title) { SND.envT = 0.3; try { SND.probe(); } catch (er) { } }
  const ct = SND.ctx.currentTime;
  // BGM: a little quieter at night, a little muffled indoors
  if (SND.bgmGain) { const night = h >= 21 || h < 5 ? 0.6 : 1; SND.bgmGain.gain.setTargetAtTime(title ? 0.9 : night * (GAME.modal === 'meeting' ? 0.75 : 1), ct, 0.5); SND.bgmFilter.frequency.setTargetAtTime(inside ? 5000 : 20000, ct, 0.3); }
  SND.ambFilter.frequency.setTargetAtTime(inside ? 650 : TIME.weather === 'snow' ? 3500 : 20000, ct, 0.3);
  if (title) { SND.tickLoops(dt); return; }
  const SF = (typeof SEASON !== 'undefined' && SEASON.f && SEASON.f.cicada !== undefined) ? SEASON.f : { cicada: 1, higu: 1, tsuku: 1, insects: 1, crickets: 1, frogs: 1, uguisu: 1, furin: 1, birds: 1, wind: 1 }, snowy = TIME.weather === 'snow';
  const din = inside ? 0.45 : 1, w = rain || snowy ? 0.25 : 1;
  const day = h >= 6 && h < 18.3, morning = Math.max(0, 1 - Math.abs(h - 6.8) / 2.2), midday = Math.max(0, 1 - Math.abs(h - 13) / 4.5), evening = Math.max(0, 1 - Math.abs(h - 17.6) / 1.4), night = h >= 19.3 || h < 4.5 ? 1 : h >= 18.3 ? (h - 18.3) : h < 5.5 ? 5.5 - h : 0;
  const land = 1 - e.sea * 0.6;
  // sea
  SND.loop('amb_sea', (0.15 + e.beach * 0.9) * e.sea * 0.9 * din); SND.loop('amb_sea_lap', e.sea * (0.55 + e.harbor * 0.4) * din);
  // insects follow the season: cicadas in summer, higurashi at summer dusk, crickets and bell crickets on autumn nights
  SND.loop('amb_cicada', SF.cicada * midday * (0.25 + e.tree * 0.75) * land * w * 0.8 * din); SND.loop('amb_minmin', SF.cicada * Math.max(0, 1 - Math.abs(h - 11) / 3) * e.tree * land * w * 0.55 * din); SND.loop('amb_abura', SF.cicada * Math.max(0, 1 - Math.abs(h - 14.5) / 2.5) * e.tree * land * w * 0.45 * din);
  SND.loop('amb_insects', SF.insects * night * (0.45 + e.tree * 0.4) * land * (rain ? 0.3 : 1) * din); SND.loop('amb_crickets', Math.max(SF.crickets, SF.insects * 0.5) * night * 0.4 * land * (rain ? 0.2 : 1) * din); SND.loop('amb_frogs', SF.frogs * night * Math.max(e.river, e.falls, 0.25) * 0.7 * din);
  SND.loop('amb_birds', SF.birds * morning * (0.3 + e.tree * 0.6) * w * din); SND.loop('amb_birds_day', SF.birds * (day ? 0.25 : 0) * e.tree * w * din);
  SND.loop('amb_wind', (0.12 + e.hi * 0.6 + e.sea * 0.12 + (rain ? 0.25 : 0) + (snowy ? 0.2 : 0)) * SF.wind * din); SND.loop('amb_rain', rain ? (inside ? 0.55 : 0.9) : 0);
  SND.loop('amb_waterfall', e.falls * e.falls * 1.2 * din); SND.loop('amb_stream', e.river * 0.6 * din); SND.loop('amb_fire', e.camp * e.camp * 1.0 * din);
  if (e.cons && h >= 8 && h < 18 && !inside) { const s = SND.spatial(e.cons.x, e.cons.z, 14, 90); SND.loop('amb_build', s ? s.g * 0.9 : 0, { pan: s ? s.pan : 0 }); }
  // occasional one-shots
  const every = (k, a, b, cond, fn) => { if (!cond) return; if (SND.next[k] === undefined) SND.next[k] = SND.t + a + Math.random() * (b - a); if (SND.t > SND.next[k]) { SND.next[k] = SND.t + a + Math.random() * (b - a); fn(); } };
  const around = (r) => { const a = Math.random() * 6.283; return { x: PL.x + Math.cos(a) * r, z: PL.z + Math.sin(a) * r }; };
  if (!inside) {
    every('gull', 6, 16, day && (e.harbor > 0.2 || e.sea > 0.45) && !rain, () => SND.play(Math.random() < 0.5 ? 'seagulls' : 'seagull', { pos: around(20 + Math.random() * 25), ref: 20, max: 140, vol: 0.55, rate: 0.9 + Math.random() * 0.2, bus: 'amb' }));
    every('crow', 14, 40, h > 15.8 && h < 18.8 && !rain, () => SND.play(Math.random() < 0.6 ? 'crow' : 'crow1', { pos: around(30 + Math.random() * 30), ref: 25, max: 160, vol: 0.5, bus: 'amb' }));
    every('higu', 10, 22, SF.higu > 0.3 && h > 16.3 && h < 19.2 && e.tree > 0.15 && !rain, () => SND.play(Math.random() < 0.5 ? 'higurashi1' : 'higurashi2', { vol: 0.6 * e.tree + 0.15, pan: Math.random() * 1.4 - 0.7, bus: 'amb' }));
    every('tsuku', 40, 90, SF.tsuku > 0.3 && h > 13 && h < 16.5 && e.tree > 0.3 && !rain, () => SND.play('tsukutsuku', { vol: 0.35, pan: Math.random() * 1.2 - 0.6, bus: 'amb' }));
    every('ugu', 12, 40, SF.uguisu > 0.3 && h > 5.5 && h < 12 && e.tree > 0.2 && !rain, () => SND.play('uguisu', { pos: around(18), ref: 18, max: 90, vol: 0.55, bus: 'amb' }));
    every('furin', 7, 18, SF.furin > 0.3 && day && e.house > 0.25, () => SND.play('furin', { vol: 0.28 * e.house, pan: Math.random() * 1.2 - 0.6, rate: 0.95 + Math.random() * 0.1, bus: 'amb' }));
  }
  // church bells at 12:00 and 17:00 (3 strikes)
  const hi = Math.floor(h); if (SND.lastHour !== null && hi !== SND.lastHour && (hi === 12 || hi === 17) && PLACED.church && !inside) for (let k = 0; k < 3; k++) SND.play('bell', { pos: PLACED.church, ref: 60, max: 450, vol: 0.9, delay: k * 2.2, bus: 'amb' }); SND.lastHour = hi;
  // vehicles
  const v = PL.veh;
  if (v && !inside && (v.kind === 'truck' || v.kind === 'boat')) { const mx = (VSPEC[v.kind] && VSPEC[v.kind].max) || 16, sp = Math.min(1.3, Math.abs(v.v) / mx);
    if (v.kind === 'truck') SND.loop('eng_truck', 0.55 + sp * 0.35, { bus: 'sfx', rate: 0.78 + sp * 1.05 }); else SND.loop('eng_boat', 0.5 + sp * 0.4, { bus: 'sfx', rate: 0.8 + sp * 0.6 }); }
  if (typeof DV !== 'undefined' && !inside) {
    const B = DV.bus; if (B && B.x !== undefined) { const s = SND.spatial(B.x, B.z, 10, 90); const ride = PL.veh === B; SND.loop('eng_bus', ride ? 0.5 : (s ? s.g * 0.9 : 0), { bus: 'sfx', pan: ride ? 0 : s ? s.pan : 0, rate: B.wait > 0 ? 0.8 : 1.05 });
      const st = B.wait > 0; if (SND._busSt !== undefined && st !== SND._busSt) SND.play('bus_door', { pos: B, ref: 10, max: 80, vol: 0.8 }); SND._busSt = st; }
    const F = DV.ferry; if (F && F.x !== undefined) { const s = SND.spatial(F.x, F.z, 18, 200); const ride = PL.veh === F; SND.loop('eng_ferry', ride ? 0.55 : (s ? s.g * 0.9 : 0), { bus: 'sfx', pan: ride ? 0 : s ? s.pan : 0 });
      if (SND._fyDock !== undefined && F.docked !== SND._fyDock) SND.play('horn', { pos: F, ref: 60, max: 500, vol: 0.9 }); SND._fyDock = F.docked; }
  }
  if (typeof LIFE !== 'undefined' && LIFE.fish && LIFE.fish.st === 'bite') SND.loop('reel_loop', 0.0); // reel plays on the catch, not while waiting
  // money: a purchase rings the till, income jingles coins
  if (GAME.p) { const m = GAME.p.money || 0; if (SND.lastMoney !== null && m !== SND.lastMoney) { if (m < SND.lastMoney) SND.play('register', { vol: 0.7 }); else SND.play(Math.random() < 0.5 ? 'coins' : 'coins2', { vol: 0.8 }); } SND.lastMoney = m; }
  SND.tickLoops(dt);
};
// ---------- footsteps ----------
SND.surface = function (wade) {
  if (GAME.inside) { const H = GAME.home && GAME.home(); return H && /tatami|carpet/.test(H.floor || '') ? 'carpet' : 'wood'; }
  if (wade > 0.06) return 'water';
  if (walkDeckY(PL.x, PL.z) !== null || (typeof PROJ !== 'undefined' && PROJ.deck && Math.abs(PL.x - PROJ.deck.x) < PROJ.deck.hw && Math.abs(PL.z - PROJ.deck.z) < PROJ.deck.hw)) return 'wood';
  if (onPierAt(PL.x, PL.z)) return 'concrete';
  const rd = roadDistAt(PL.x, PL.z); if (rd < 3.4) return 'concrete';
  if (deckY(PL.x, PL.z) !== null) return 'concrete';
  const g = groundH(PL.x, PL.z); if (g < 2.2 && SND.env.seaD < 26) return 'sand';
  return 'grass';
};
{ const _ah = animateHero; animateHero = function (dt, spd, wade = 0) { const a = Math.floor(PL.ph / Math.PI); _ah(dt, spd, wade); if (spd > 0.4 && Math.floor(PL.ph / Math.PI) !== a && SND.ctx) { const s = SND.surface(wade), run = spd > 3.6, n = s === 'water' ? 'step_water' : 'step_' + s;
  SND.var(n, STEP_N, { vol: (run ? 0.75 : 0.5) * (s === 'grass' ? 0.8 : s === 'water' ? 0.7 : 1), rate: (run ? 1.08 : 1) * (0.94 + Math.random() * 0.12) }); } }; }
// ---------- talking: little voice blips while the text types out ----------
SND.blip = function (base) { if (!SND.ctx || SND.prefs.mute) return; const c = SND.ctx, t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
  const fr = base * (0.85 + Math.random() * 0.45); o.type = 'triangle'; o.frequency.setValueAtTime(fr, t); o.frequency.exponentialRampToValueAtTime(fr * (0.8 + Math.random() * 0.5), t + 0.07);
  f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 900; f.Q.value = 1.2; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.008); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  o.connect(f); f.connect(g); g.connect(SND.bus.sfx); o.start(t); o.stop(t + 0.1); };
{ const _dlg = UI.dialog.bind(UI); UI.dialog = function (name, text) { _dlg(name, text); clearInterval(SND._bt); if (!name || !text) return; let hsh = 0; for (const ch of name) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0; const base = 300 + (hsh % 9) * 45; let i = 0;
  SND._bt = setInterval(() => { if (!UI.typing || i > text.length) return clearInterval(SND._bt); if (i % 2 === 0 && !/[\s、。！？…（）「」]/.test(text[i] || '')) SND.blip(base); i++; }, 35); }; }
// ---------- hooks into the game ----------
{ const _tv = toggleVehicle; toggleVehicle = function () { const before = PL.veh, r = _tv.apply(this, arguments), after = PL.veh;
  if (after && !before) { if (after.kind === 'truck') { SND.play('car_door', { vol: 0.8 }); SND.play('car_start', { vol: 0.7, delay: 0.35 }); } else SND.play('splash', { vol: 0.3 }); }
  else if (before && !after) { if (before.kind === 'truck') SND.play('car_door', { vol: 0.8 }); else SND.var('step_water', STEP_N, { vol: 0.5 }); } return r; }; }
const sndWrap = (obj, fn, pre, post) => { const f = obj[fn]; if (typeof f !== 'function') return; obj[fn] = function () { if (pre) pre.apply(this, arguments); const r = f.apply(this, arguments); if (post) post.apply(this, [r, ...arguments]); return r; }; };
sndWrap(GAME, 'update', null, function (r, dt) { if (!SND._ui) { SND._ui = 1; try { SND.ui(); SND.watchModal(); } catch (e) { } } try { SND.update(dt || 0.016); } catch (e) { if (!SND._err) { SND._err = 1; console.warn('snd', e); } } });
sndWrap(GAME, 'enterHome', () => { const sl = PLACED.home && PLACED.home.hs.kind === 'minka'; SND.play(sl ? 'slide_door0' : 'door_open', { vol: 0.8 }); SND.play(sl ? 'slide_door1' : 'door_close', { vol: 0.6, delay: 0.9 }); });
sndWrap(GAME, 'exitHome', () => { const sl = PLACED.home && PLACED.home.hs.kind === 'minka'; SND.play(sl ? 'slide_door0' : 'door_open', { vol: 0.8 }); SND.play(sl ? 'slide_door1' : 'door_close2', { vol: 0.6, delay: 0.9 }); });
sndWrap(GAME, 'openLetter', (no, fromMail) => { if (fromMail) SND.play('mailbox', { vol: 0.8 }); SND.play('page', { vol: 0.7, delay: fromMail ? 0.25 : 0 }); });
sndWrap(GAME, 'startCast', () => { SND.play('cast', { vol: 0.8 }); });
sndWrap(GAME, 'splash', (t, s) => { if (s >= 1) { SND.play('splash', { vol: 0.8 }); SND.play('plop', { vol: 0.7 }); } else SND.play('plop', { vol: s > 0.5 ? 0.8 : 0.45, rate: s > 0.5 ? 1 : 1.25 }); });
sndWrap(GAME, 'catchFish', () => { SND.play('reel_loop', { vol: 0.6 }); SND.play('splash', { vol: 0.9, delay: 0.25 }); SND.play('congrats', { vol: 0.55, delay: 0.5 }); });
sndWrap(GAME, 'pickMikan', () => { SND.play('rustle2', { vol: 0.7 }); SND.play('ui_pluck1', { vol: 0.6, delay: 0.2 }); });
sndWrap(GAME, 'banner', (title) => { SND.play(/Lv/.test(title || '') ? 'levelup' : 'jingle', { vol: 0.6 }); });
sndWrap(GAME, 'startMeeting', () => { SND.play('bell', { vol: 0.35 }); });
sndWrap(GAME, 'endMeeting', () => { SND.play('applause', { vol: 0.6 }); });
sndWrap(GAME, 'burst', function () { const b = DV.fw[DV.fw.length - 1]; if (!b) return; const P = b.pts.geometry.attributes.position, x = P.getX(0), z = P.getZ(0), d = Math.hypot(x - camera.position.x, z - camera.position.z);
  SND.var('fw_bang', 5, { pos: { x, z }, ref: 120, max: 900, vol: 1.0, delay: d / 340, bus: 'amb' }); if (Math.random() < 0.35) SND.play('fw_crackle', { pos: { x, z }, ref: 120, max: 900, vol: 0.5, delay: d / 340 + 0.6, bus: 'amb' }); });
sndWrap(GAME, 'refreshFurniture', function () { if (this.inside && this.roomEdit) SND.play(Math.random() < 0.5 ? 'place_wood' : 'place_soft', { vol: 0.7 }); });
sndWrap(GAME, 'refreshDecor', function () { if (EDIT.on) SND.play('place_wood', { vol: 0.7 }); });
sndWrap(GAME, 'ev', function (type) { const now = performance.now(); if (now - (SND._evT || 0) < 160) return; SND._evT = now;
  if (type === 'shape') SND.var('shovel', 3, { vol: 0.5, rate: 0.9 + Math.random() * 0.2 }); else if (type === 'water') SND.play('splash', { vol: 0.5 });
  else if (type === 'clear') { SND.play('chop', { vol: 0.8 }); SND.play('tree_fall', { vol: 0.5, delay: 0.25 }); } else if (type === 'roadN' || type === 'roadM') { SND.var('hammer', 4, { vol: 0.6 }); SND.play('rock', { vol: 0.5, delay: 0.2 }); }
  else if (type === 'plant') { SND.play('dig', { vol: 0.8 }); SND.play('rustle', { vol: 0.5, delay: 0.2 }); } });
{ const _te = toggleEdit; toggleEdit = function (on) { const was = EDIT.on, r = _te.apply(this, arguments); if (EDIT.on !== was) SND.play(EDIT.on ? 'ui_maximize1' : 'ui_minimize1', { vol: 0.5 }); return r; }; }
{ const _mc = makeConstruction; makeConstruction = function (at, big) { const g = _mc.apply(this, arguments); if (g && at) g.userData.cons = { x: at.x, z: at.z }; return g; }; }
// UI: button clicks, modal open/close, toasts
addEventListener('click', e => { const b = e.target.closest && e.target.closest('button, .mm, [data-buy], [data-dev], li[data-k]'); if (b && !b.disabled) SND.play('ui_click1', { vol: 0.35, rate: 0.95 + Math.random() * 0.1 }); }, true);
{ const _toast = UI.toast.bind(UI); UI.toast = function (t) { SND.play('ui_pluck2', { vol: 0.25 }); return _toast.apply(UI, arguments); }; }
SND.watchModal = function () { const el = GAME.el && GAME.el.modal; if (!el || SND._mo) return; SND._mo = new MutationObserver(() => { const open = !el.hidden; if (open !== SND._mOpen) { SND._mOpen = open; if (GAME.modal !== 'title') SND.play(open ? 'ui_open1' : 'ui_close1', { vol: 0.45 }); } }); SND._mo.observe(el, { attributes: true, attributeFilter: ['hidden'] }); };
// ---------- sound settings (top-right panel) ----------
SND.ui = function () {
  const ctl = document.querySelector('#hud .ctl'); if (!ctl || document.getElementById('sndRow')) return;
  const row = document.createElement('div'); row.className = 'row'; row.id = 'sndRow'; row.innerHTML = `<button id="sndBtn">${SND.prefs.mute ? '🔇 音なし' : '🔊 音'}</button>`; ctl.appendChild(row);
  const pn = document.createElement('div'); pn.className = 'card sndp'; pn.id = 'sndPanel'; pn.hidden = true;
  const sl = (k, lab) => `<label><span>${lab}</span><input type="range" min="0" max="100" value="${Math.round(SND.prefs[k] * 100)}" data-k="${k}"></label>`;
  pn.innerHTML = `<b>音の設定</b>${sl('bgm', '🎵 音楽')}${sl('amb', '🌊 まわりの音')}${sl('sfx', '👣 効果音')}<button id="sndMute">${SND.prefs.mute ? '🔊 音を出す' : '🔇 音を消す'}</button><span style="font-size:11px;opacity:.7;line-height:1.4">効果音: Freesound・Kenney（CC0）、効果音ラボ</span>`;
  document.getElementById('hud').appendChild(pn);
  row.querySelector('#sndBtn').onclick = () => { SND.unlock(); pn.hidden = !pn.hidden; };
  pn.oninput = e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; SND.prefs[k] = e.target.value / 100; SND.savePrefs(); };
  pn.querySelector('#sndMute').onclick = () => { SND.prefs.mute = !SND.prefs.mute; SND.savePrefs(); pn.querySelector('#sndMute').textContent = SND.prefs.mute ? '🔊 音を出す' : '🔇 音を消す'; row.querySelector('#sndBtn').textContent = SND.prefs.mute ? '🔇 音なし' : '🔊 音'; document.getElementById('c').focus(); };
};
