// ===================== リアルな釣り: 潮（月齢）・時合い（マズメ）・天気 → 魚の活性、前アタリ→本アタリ→合わせ→やりとり（テンション・ドラグ・魚の体力） =====================
const TIDE = {
  ref: Date.UTC(2000, 0, 6, 18, 14) / 86400000, syn: 29.530588,
  NAMES: ['大潮', '大潮', '大潮', '中潮', '中潮', '中潮', '中潮', '小潮', '小潮', '小潮', '長潮', '若潮', '中潮', '中潮', '大潮', '大潮', '大潮', '大潮', '中潮', '中潮', '中潮', '中潮', '小潮', '小潮', '小潮', '長潮', '若潮', '中潮', '中潮', '大潮'],
  AMP: { 大潮: 1, 中潮: 0.75, 小潮: 0.45, 長潮: 0.35, 若潮: 0.45 },
  age(d) { const t = (d || new Date()).getTime() / 86400000 - this.ref; return ((t % this.syn) + this.syn) % this.syn; },
  name(a) { return this.NAMES[Math.min(29, Math.floor(a + 0.5) % 30)]; },
  moon(a) { return ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][Math.floor(((a / this.syn) * 8 + 0.5)) % 8]; },
  // semi-diurnal tide (12h25m), high water shifts ~49 minutes a day with the moon. level -1 (low) .. 1 (high)
  at(h, a) { const ph = ((h - (a * 0.8167 + 5.4)) / 12.42) * Math.PI * 2, amp = this.AMP[this.name(a)]; return { level: Math.cos(ph), flow: -Math.sin(ph), amp, ph }; },
  stage(td) { const l = (td.level + 1) / 2; if (l > 0.94) return '満潮（潮止まり）'; if (l < 0.06) return '干潮（潮止まり）'; return td.flow > 0 ? `上げ${Math.max(1, Math.round(l * 10))}分` : `下げ${Math.max(1, Math.round((1 - l) * 10))}分`; },
  // height in cm for the Seto Inland Sea (spring tide range about 3m)
  cm(td) { return Math.round(td.level * td.amp * 150); },
};
const FISHX = { hold: false, ptr: false };
// weight: kg = wf * L^3 / 80000 (L in cm). fight strength by species
const FISH_WF = { sayori: 0.2, tachiuo: 0.1, unagi: 0.25, dojo: 0.35, haze: 0.8, karei: 1.5, hirame: 1.3, akaei: 2.4, tako: 0.5, mokuzu: 28, fugu: 1.6, kue: 1.5, koi: 1.3, madai: 1.35, ika: 1.2, kawahagi: 1.6, buri: 1.1, namazu: 0.9 };
const FISH_STR = { buri: 1.35, hamachi: 1.3, sawara: 1.2, suzuki: 1.15, madai: 1.2, kue: 1.45, chinu: 1.15, koi: 1.1, akaei: 0.95, hirame: 0.9, karei: 0.75, tako: 0.75, ika: 0.8, unagi: 1.0, namazu: 0.9, aji_big: 1.1, tachiuo: 0.9 };
const FISH_REEF = { kue: 1, kasago: 1, mebaru: 1, kawahagi: 1, tako: 1, chinu: 1 }; // dives into rocks: force it out
const FISH_JUMP = { suzuki: 'エラ洗い！ 頭をふってハリを外そうとしている', sawara: '水面を走った！', hamachi: '横に走った！', buri: '強烈な突っ込み！', madai: '三段引き！', ika: 'ジェット噴射でにげる！', aji_big: '首をふっている', tachiuo: 'ギラッと光った！', akaei: '底にはりついた！' };
FISHX.kg = function (f, L) { return Math.max(0.005, (FISH_WF[f.id] || 1.0) * L * L * L / 80000); };
FISHX.fmtKg = kg => kg >= 1 ? `${kg.toFixed(2)}kg` : `${Math.round(kg * 1000)}g`;
FISHX.ROD = { 1: { max: 1.0, reel: 1.6 }, 2: { max: 1.35, reel: 2.0 }, 3: { max: 1.8, reel: 2.6 } };
// how hungry the fish are right now
FISHX.cond = function (env) {
  const h = currentHour(), a = TIDE.age(), tn = TIDE.name(a), td = TIDE.at(h, a), salt = !(env === 'river' || env === 'pond'), tags = []; let act = 1;
  if (salt) { const fl = Math.abs(td.flow); act *= 0.55 + fl * (0.45 + td.amp * 0.55); if (fl < 0.25) tags.push('潮止まり…'); else if (fl > 0.8 && td.amp >= 0.75) tags.push('潮がよく動いている'); }
  if (h >= 4.5 && h < 7) { act *= 1.45; tags.push('朝マズメ'); } else if (h >= 16.5 && h < 19) { act *= 1.45; tags.push('夕マズメ'); }
  else if (h >= 11 && h < 14 && TIME.weather === 'clear') { act *= 0.85; tags.push('日中で魚が警戒'); }
  const w = TIME.weather; if (w === 'cloudy') { act *= 1.1; tags.push('くもりで警戒心がゆるむ'); } else if (w === 'rain') { act *= salt ? 1.1 : 1.35; tags.push(salt ? '雨' : '雨で川がにごって活性アップ'); } else if (w === 'storm') { act *= 0.7; tags.push('荒天でしぶい'); } else if (w === 'snow') { act *= 0.8; tags.push('水温が低い'); }
  return { act: Math.max(0.35, Math.min(2.2, act)), tn, td, a, salt, tags, stars: Math.max(1, Math.min(5, Math.round(act * 2.6))) };
};
// ---------- the rod: a segmented blank that bends with tension ----------
FISHX.rig = function () {
  const R = LIFE.rod; if (!R || R.segs) return; const rod = R.rod; for (const c of [...rod.children]) if (c.geometry && c.geometry.type === 'CylinderGeometry' && c.geometry.parameters.height > 1) rod.remove(c);
  const rm = new THREE.MeshStandardMaterial({ color: '#2a2622', roughness: 0.35, metalness: 0.2 }), segs = []; let parent = rod; const base = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.021, 0.7, 6), rm); base.position.y = 0.35; rod.add(base);
  let y0 = 0.7; for (let k = 0; k < 5; k++) { const len = 0.26, r0 = 0.015 - k * 0.0025, g = new THREE.Group(); g.position.y = k === 0 ? y0 : len; const m = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.003, r0 - 0.0025), r0, len, 5), rm); m.position.y = len / 2; g.add(m); if (k < 4) { const gd = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.002, 4, 8), MAT.metal); gd.position.set(0, len, 0.012); g.add(gd); } parent.add(g); segs.push(g); parent = g; }
  const tip = new THREE.Object3D(); tip.position.y = 0.26; parent.add(tip); R.segs = segs; R.tip = tip;
  // a fish model that shows when it jumps or when you lift it out
  const fg = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), new THREE.MeshStandardMaterial({ color: '#b8c4cc', roughness: 0.25, metalness: 0.55 })); body.scale.set(0.32, 0.42, 1); fg.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 4), body.material); tail.rotation.x = -Math.PI / 2; tail.scale.set(0.25, 1, 1); tail.position.z = -0.62; fg.add(tail); const back = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, 1.0), new THREE.MeshStandardMaterial({ color: '#4a5a66', roughness: 0.4 })); back.scale.set(0.33, 0.44, 1.01); fg.add(back);
  fg.visible = false; scene.add(fg); R.fishM = fg; R.fishMat = body.material; R.fishBack = back.material;
};
FISHX.fishLook = function (f) { const R = LIFE.rod; if (!R || !R.fishM) return; const col = { madai: ['#e8706a', '#c84a48'], kasago: ['#c45a3a', '#8a3a22'], mebaru: ['#8a6a50', '#5a4030'], kue: ['#6a5a48', '#3a3026'], chinu: ['#606a70', '#30363a'], hirame: ['#8a7a60', '#5a4a36'], karei: ['#8a7a60', '#5a4a36'], tako: ['#a85a4a', '#7a3a2e'], ika: ['#e8e0d8', '#c8b8b0'], akaei: ['#9a7a5a', '#6a5038'], koi: ['#d88a3a', '#a85a1a'], unagi: ['#4a5038', '#2a2e20'], namazu: ['#5a5440', '#3a3628'], buri: ['#c8d4dc', '#3a5a8a'], hamachi: ['#c8d4dc', '#3a6a9a'], sawara: ['#c8d4dc', '#4a6a8a'], aji: ['#c8d0d0', '#5a7a7a'], aji_big: ['#c8d0d0', '#5a7a7a'], fugu: ['#e8e0c8', '#7a7a50'] }[f.id] || ['#c0ccd4', '#4a5a66']; R.fishMat.color.set(col[0]); R.fishBack.color.set(col[1]); };
// ---------- casting ----------
{ const _sc = GAME.startCast; GAME.startCast = function (t) {
  _sc.apply(this, arguments); FISHX.rig(); const F = LIFE.fish, c = FISHX.cond(t.env); F.cond = c;
  F.wait = Math.max(2.2, Math.min(22, (2.5 + Math.random() * 9) / c.act)); F.nibT = []; const nn = 1 + Math.floor(Math.random() * 3.4); for (let k = 0; k < nn; k++) F.nibT.push(Math.max(0.8, F.wait - 0.6 - k * (0.7 + Math.random() * 1.6))); F.nibT.sort((a, b) => a - b);
  F.nibN = 0; F.bend = 0; FISHX.hud(); return F;
}; }
GAME.pickFish = function (env, boat = 0) {
  const hf = currentHour(), night = hf >= 19 || hf < 5, F = LIFE.fish, act = F && F.cond ? F.cond.act : 1, pool = FISH.filter(f => f.env && (f.env.includes(env) || (boat && env !== 'offshore' && f.env.includes('offshore') && f.st >= 3 && Math.random() < 0.5)) && (!f.time || (f.time === 'night') === night) && !f.net);
  const rr = RODS[this.rodLv()].rare * (0.6 + 0.4 * act), W = boat === 2 ? { 1: 14, 2: 22, 3: 17 * rr, 4: 5 * rr } : boat === 1 ? { 1: 26, 2: 22, 3: 11 * rr, 4: 4 * rr } : { 1: 40, 2: 18, 3: 7 * rr, 4: 2.5 * rr }; let tot = 0; pool.forEach(f => tot += W[f.st]); let r = Math.random() * tot; for (const f of pool) { r -= W[f.st]; if (r <= 0) return f; } return pool[0];
};
// ---------- key: early strike / hook set / reel ----------
GAME.fishKey = (function (prev) { return function () {
  const F = LIFE.fish; if (!F) return prev.apply(this, arguments);
  if (F.st === 'fight') { FISHX.hold = true; return true; }
  if (F.st === 'land') return true;
  if (F.st === 'bite') { // 合わせ
    const late = F.t / F.win; if (late > 0.9 && Math.random() < 0.25) { R_ex(false); return this.endFish('すっぽぬけ…（合わせがおそかった）'), true; }
    this.hookSet(); return true;
  }
  if (F.st === 'wait' && F.nibT.some(nt => F.t > nt - 0.1 && F.t < nt + 0.9)) { UI.toast('まだ！ 前アタリ。ウキがしずむまで待とう'); F.wait = Math.max(F.wait, F.t + 1.2); return true; }
  if (F.st === 'wait' || F.st === 'cast') { this.endFish(); return true; }
  return true;
}; })(GAME.fishKey);
function R_ex(v) { const R = LIFE.rod; if (R && R.ex) R.ex.visible = v; }
GAME.hookSet = function () {
  const F = LIFE.fish, t0 = F.tgt, f = F.fish; R_ex(false);
  const u = Math.pow(Math.random(), (this.rodLv() >= 3 ? 1.1 : 1.8) * (t0.boat ? (t0.far ? 0.5 : 0.7) : 1) / (0.75 + 0.25 * (F.cond ? F.cond.act : 1))), size = Math.round(f.sz[0] + (f.sz[1] - f.sz[0]) * u), kg = FISHX.kg(f, size);
  const rod = FISHX.ROD[this.rodLv()] || FISHX.ROD[1], horiz = Math.max(3, Math.hypot(t0.x - PL.x, t0.z - PL.z)), depth = t0.boat ? Math.min(25, Math.max(4, -groundH(t0.x, t0.z))) : 0;
  Object.assign(F, { st: 'fight', t: 0, size, kg, rod, power: (0.3 + Math.pow(kg, 0.55) * 0.55) * (FISH_STR[f.id] || 1), dist: horiz + depth * 0.6, d0: horiz + depth * 0.6, horiz, depth, S: 1, T: 0.3, run: false, runT: 0.4 + Math.random() * 0.5, slackT: 0, overT: 0, small: kg < 0.2, ang: 0, angV: 0, a0: Math.atan2(t0.x - PL.x, t0.z - PL.z), msg: 'かかった！', msgT: 1.2, jump: 0, fightT: 0 });
  FISHX.fishLook(f); this.splash({ x: t0.x, y: t0.y, z: t0.z }, 1); try { SND.play('splash', { vol: 0.5, rate: 1.2 }); } catch (e) { }
};
// ---------- per-frame ----------
GAME.updateFishing = function (dt) {
  const F = LIFE.fish; if (!F) { FISHX.hud(); return; } const R = LIFE.rod, t0 = F.tgt; if (!R.segs) FISHX.rig();
  const BV = t0.boat && PL.veh && PL.veh.kind === 'boat' ? PL.veh : null;
  if ((PL.veh && !BV) || (t0.boat && !BV) || EDIT.on || DIALOG.npc || (this.modal && this.modal !== 'fishhud')) return this.endFish();
  if (BV) { BV.v *= Math.max(0, 1 - dt * 3); const s = Math.sin(BV.rot), c = Math.cos(BV.rot), side = Math.sin((t0.a !== undefined ? t0.a : 0) - BV.rot) >= 0 ? 1 : -1, lx = side * 0.6, lz = 1.3; PL.x = BV.x + c * lx + s * lz; PL.z = BV.z - s * lx + c * lz; PL.y = BV.mesh.position.y + 0.86; PL.mesh.visible = CAM.mode !== 'first'; PL.mesh.position.set(PL.x, PL.y, PL.z); }
  const moving = KEYS.KeyW || KEYS.KeyA || KEYS.KeyS || KEYS.KeyD || KEYS.ArrowUp || KEYS.ArrowDown || KEYS.ArrowLeft || KEYS.ArrowRight;
  if (moving && F.st !== 'fight' && F.st !== 'land') return this.endFish('釣りざおをしまった');
  FISHX.hold = !!(KEYS.KeyF || KEYS.Space || FISHX.ptr);
  F.t += dt;
  // where the hook is
  let hx = t0.x, hz = t0.z;
  if (F.st === 'fight' || F.st === 'land') { const a = F.a0 + F.ang, hd = Math.max(0.6, F.st === 'land' ? 0.6 : Math.min(F.horiz * F.dist / F.d0 + 0.6, F.dist)); hx = PL.x + Math.sin(a) * hd; hz = PL.z + Math.cos(a) * hd; }
  const face = Math.atan2(hx - PL.x, hz - PL.z); F.rot = angLerp(F.rot === undefined ? PL.rot : F.rot, face, Math.min(1, dt * (F.st === 'fight' ? 3 : 8))); PL.rot = F.rot; if (BV) PL.mesh.rotation.y = PL.rot;
  // arms
  const P = PL.parts, pump = F.st === 'fight' ? (FISHX.hold ? Math.sin(F.t * 9) * 0.12 : 0) - F.T * 0.25 : 0; if (P.upperArmR) { P.upperArmR.rotation.x = P.upperArmL.rotation.x = -1.1 + (F.st === 'bite' ? Math.sin(F.t * 30) * 0.08 : 0) + pump; P.upperArmR.rotation.z = 0.25; P.upperArmL.rotation.z = -0.25; P.foreArmR.rotation.x = P.foreArmL.rotation.x = -0.3 - (F.st === 'fight' ? F.T * 0.3 : 0); }
  // rod bend
  const bendT = F.st === 'fight' ? 0.12 + F.T * 0.95 : F.st === 'bite' ? 0.25 : F.st === 'land' ? 0.55 : 0.05; F.bend += (bendT - F.bend) * Math.min(1, dt * 10); const shake = F.st === 'fight' && F.T > 0.85 ? Math.sin(F.t * 50) * 0.03 : 0;
  R.segs.forEach((g, k) => { g.rotation.x = (F.bend + shake) * (0.08 + k * 0.07); });
  PL.mesh.updateMatrixWorld(true); const tip = R.tip.getWorldPosition(new THREE.Vector3());
  let bp; const wy = t0.y;
  if (F.st === 'cast') { const k = Math.min(1, F.t / 0.6); bp = new THREE.Vector3().lerpVectors(tip, new THREE.Vector3(t0.x, wy, t0.z), k); bp.y += Math.sin(k * Math.PI) * 2.0; if (k >= 1) { F.st = 'wait'; F.t = 0; this.splash(t0, 0.6); } }
  else if (F.st === 'wait' || F.st === 'bite') {
    bp = new THREE.Vector3(t0.x, wy + Math.sin(F.t * 2.2) * 0.02, t0.z);
    if (F.st === 'wait') { F.nib = 0; for (const nt of F.nibT) if (F.t > nt && F.t < nt + 0.3) { F.nib = 1; bp.y -= 0.035 + 0.03 * Math.sin((F.t - nt) * 20); if (!F['s' + nt]) { F['s' + nt] = 1; F.nibN++; this.splash(t0, 0.25); } }
      if (F.t > F.wait) { F.st = 'bite'; F.t = 0; F.fish = this.pickFish(t0.env, t0.boat ? (t0.far ? 2 : 1) : 0); F.win = (F.fish.st >= 3 ? 1.4 : 1.8) * RODS[this.rodLv()].win; this.splash(t0, 1); } }
    else { bp.y -= 0.22; R.ex.visible = true; R.ex.position.set(PL.x, PL.y + 1.9 + Math.abs(Math.sin(F.t * 12)) * 0.08, PL.z); if (F.t > F.win) { R.ex.visible = false; return this.endFish('にげられた…（ウキが消しこんだら、すぐ F か Space で合わせる）'); } }
  } else if (F.st === 'fight') { if (this.fightStep(dt, F) === false) return; bp = new THREE.Vector3(hx, wy - (F.run ? 0.12 : 0.05), hz); }
  else if (F.st === 'land') { // lift the fish out
    const k = Math.min(1, F.t / 0.9); bp = new THREE.Vector3().lerpVectors(new THREE.Vector3(hx, wy, hz), tip.clone().add(new THREE.Vector3(0, -0.5, 0)), k);
    const fm = R.fishM, L = Math.max(0.12, F.size / 100); fm.visible = true; fm.scale.setScalar(L); fm.position.copy(bp).add(new THREE.Vector3(0, -L * 0.3, 0)); fm.rotation.set(-1.3 + Math.sin(F.t * 18) * 0.15, F.rot, Math.sin(F.t * 14) * 0.4);
    if (k >= 1 && F.t > 1.15) { fm.visible = false; return this.catchFish(); }
  }
  // the fish jumping
  if (R.fishM && F.st === 'fight') { if (F.jump > 0) { F.jump -= dt; const k = 1 - F.jump / 0.7, L = Math.max(0.15, F.size / 100); R.fishM.visible = true; R.fishM.scale.setScalar(L); R.fishM.position.set(hx, wy + Math.sin(k * Math.PI) * (0.5 + L * 0.8), hz); R.fishM.rotation.set(-0.6 + k * 1.6, F.a0 + F.ang + 1.2, Math.sin(F.t * 20) * 0.3); if (F.jump <= 0) { R.fishM.visible = false; this.splash({ x: hx, y: wy, z: hz }, 0.9); } } }
  R.bob.position.copy(bp); R.bob.visible = F.st !== 'land';
  const sag = F.st === 'cast' ? 0.1 : F.st === 'fight' ? Math.max(0, 0.45 * (1 - F.T * 1.4)) : F.st === 'land' ? 0 : 0.5;
  const pos = R.line.geometry.attributes.position; for (let i = 0; i < 10; i++) { const k = i / 9; const v = new THREE.Vector3().lerpVectors(tip, bp, k); v.y -= Math.sin(k * Math.PI) * sag; pos.setXYZ(i, v.x, v.y, v.z); } pos.needsUpdate = true;
  const ring = R.ring; if (ring.material.opacity > 0) { ring.scale.multiplyScalar(1 + dt * 2.2); ring.material.opacity = Math.max(0, ring.material.opacity - dt * 1.2); }
  FISHX.hud();
};
// one frame of the fight. returns false when it ended
GAME.fightStep = function (dt, F) {
  const hold = FISHX.hold, rod = F.rod, f = F.fish; F.fightT += dt;
  F.runT -= dt; if (F.runT <= 0) { F.run = !F.run && Math.random() < 0.35 + 0.6 * F.S; F.runT = F.run ? 0.6 + Math.random() * (0.6 + 1.8 * F.S) : 0.7 + Math.random() * (0.6 + 1.6 * (1.15 - F.S)); if (F.run) { F.angV = (Math.random() - 0.5) * 1.2; const jm = FISH_JUMP[f.id]; if (jm && Math.random() < 0.45) { F.msg = jm; F.msgT = 1.6; if (/エラ洗い|水面|ギラッ|首/.test(jm)) F.jump = 0.7; } else if (FISH_REEF[f.id]) { F.msg = '根にもぐろうとしている！ 巻いてうかせろ'; F.msgT = 1.6; } else { F.msg = F.kg > 1.2 ? 'ググッと引きこんだ！ 糸を出してしのげ' : '走った！'; F.msgT = 1.2; } } }
  const pull = F.power * (F.run ? 1 : 0.28) * (0.3 + 0.7 * F.S), pr = pull / rod.max;
  let Tt; if (hold) Tt = F.small ? 0.35 : pr * 0.7 + 0.22; else Tt = Math.min(0.88, pr * 0.85) + 0.04; F.T += (Tt - F.T) * Math.min(1, dt * 7);
  // line in/out
  if (F.small) { F.run = false; F.dist = Math.max(0, F.dist - rod.reel * (hold ? 1.6 : 0.9) * dt); }
  let dd; if (F.small) dd = 0; else if (hold) dd = -rod.reel * Math.max(0.04, Math.min(1, 1.2 - pr)); else dd = F.run ? Math.max(0, pr * 0.9 - 0.25) * 4 : 0; if (F.run && !hold) F.lineOut = true; else F.lineOut = false;
  F.dist = Math.max(0, F.dist + dd * dt); F.ang = Math.max(-0.6, Math.min(0.6, F.ang + F.angV * dt * (F.run ? 1 : 0.2))); if (Math.abs(F.ang) >= 0.6) F.angV *= -0.5;
  // fish tires
  F.S = Math.max(0, F.S - dt * (F.run ? 0.1 : 0.045) * (0.6 + F.T * 1.6) / (0.55 + Math.sqrt(F.kg) * 0.55));
  // sounds
  try { if (hold) SND.loop('reel_loop', 0.55, { bus: 'sfx', rate: 0.8 + (1 - F.T) * 0.6 }); else if (F.lineOut) SND.loop('reel_loop', 0.35, { bus: 'sfx', rate: 1.9 }); if (F.run && Math.random() < dt * 2) this.splash({ x: PL.x + Math.sin(F.a0 + F.ang) * F.horiz * F.dist / F.d0, y: F.tgt.y, z: PL.z + Math.cos(F.a0 + F.ang) * F.horiz * F.dist / F.d0 }, 0.4); } catch (e) { }
  // failure
  if (F.T > 1 && !F.small) { F.overT += dt; if (F.overT > 1.0) { this.endFish(`ブチッ！ 糸が切れた…（${f.name}・推定${FISHX.fmtKg(F.kg)}）　引きが強いときは F をはなしてドラグで糸を出そう`); try { SND.play('plop', { vol: 0.6, rate: 0.6 }); } catch (e) { } return false; } } else F.overT = Math.max(0, F.overT - dt);
  if (FISH_REEF[f.id] && F.dist > F.d0 + 12) { this.endFish(`根ずれで糸が切れた…（${f.name}は岩にもぐる魚。走ったら巻いてうかせよう）`); return false; }
  if (F.dist > F.d0 + 60) { this.endFish('糸を全部出されてしまった…'); return false; }
  if (!hold && !F.run && F.S > 0.15) { F.slackT += dt; F.S = Math.min(1, F.S + dt * 0.012); } else F.slackT = Math.max(0, F.slackT - dt * 2);
  if (F.msgT > 0) F.msgT -= dt;
  if (F.dist <= 1.3) { F.st = 'land'; F.t = 0; F.netted = F.kg >= 1.2; return true; }
  return true;
};
// ---------- landing ----------
GAME.catchFish = function () {
  const F = LIFE.fish, f = F.fish, p = this.p; const size = F.size || Math.round((f.sz[0] + f.sz[1]) / 2), kg = F.kg || FISHX.kg(f, size), fightT = F.fightT || 0, netted = F.netted, boat = F.tgt.boat;
  p.fish = p.fish || {}; const rec = p.fish[f.id], first = !rec; p.fish[f.id] = { n: (rec ? rec.n : 0) + 1, max: Math.max(rec ? rec.max : 0, size), kg: Math.max((rec && rec.kg) || 0, Math.round(kg * 100) / 100) };
  p.stats.fishN++; if (F.tgt.env === 'river' || F.tgt.env === 'pond') p.stats.fishFresh++;
  const b = this.bag(), full = b.fish.length >= FISH_CAP; if (!full) b.fish.push({ id: f.id, size, kg: Math.round(kg * 100) / 100 });
  this.endFish(); this.showCatch(f, size, first, rec && size > rec.max, full, { kg, fightT, netted, boat }); this.dirty = true; this.check();
  try { SND.play('splash', { vol: 0.7 }); SND.play('congrats', { vol: 0.55, delay: 0.3 }); } catch (e) { }
};
{ const _sh = GAME.showCatch; GAME.showCatch = function (f, size, first, best, full, x) {
  _sh.apply(this, arguments); if (!x) return; const el = this.el.catch, cs = el.querySelector('.cs');
  if (cs) cs.innerHTML = `${size}cm・${FISHX.fmtKg(x.kg)}　${'★'.repeat(f.st)}<span class="dim">${'★'.repeat(4 - f.st)}</span>`;
  const ct = el.querySelector('.ct'); if (ct && x.netted) ct.insertAdjacentHTML('beforeend', `<div class="small" style="font-size:12px;opacity:.8">${x.boat ? 'タモですくい上げた' : 'タモ網ですくった'}（やりとり ${Math.round(x.fightT)}秒）</div>`); else if (ct && x.fightT > 4) ct.insertAdjacentHTML('beforeend', `<div class="small" style="font-size:12px;opacity:.8">やりとり ${Math.round(x.fightT)}秒</div>`);
  clearTimeout(this._ct); this._ct = setTimeout(() => el.hidden = true, 4200);
}; }
{ const _ef = GAME.endFish; GAME.endFish = function () { const R = LIFE.rod; if (R && R.fishM) R.fishM.visible = false; if (R && R.segs) R.segs.forEach(g => g.rotation.x = 0); FISHX.hold = FISHX.ptr = false; const r = _ef.apply(this, arguments); FISHX.hud(); return r; }; }
// ---------- prompt ----------
{ const _pr = GAME.prompt; GAME.prompt = function () { const F = LIFE.fish; if (this.p && F) { if (F.st === 'fight') return 'F/Space 長押しで巻く　走ったら、はなしてドラグ'; if (F.st === 'land') return ''; if (F.st === 'bite') return '消しこんだ！ 今だ F か Space で合わせる！'; if (F.st === 'wait') return F.nib ? '前アタリ…まだ合わせない（ウキが消しこむまで待つ）' : 'F：釣りざおをあげる　（ウキが消しこんだら F か Space で合わせる）'; } return _pr.apply(this, arguments); }; }
// ---------- HUD ----------
FISHX.el = null;
FISHX.hud = function () {
  const F = LIFE.fish; let el = FISHX.el;
  if (!F || !GAME.p) { if (el) el.hidden = true; return; }
  if (!el) {
    el = FISHX.el = document.createElement('div'); el.id = 'fishHud'; document.getElementById('game').appendChild(el);
    el.innerHTML = `<div class="fc"></div><div class="ff" hidden><div class="fmsg"></div><div class="row"><span class="lb">テンション</span><span class="bar ten"><i></i><b class="lim"></b></span></div><div class="row"><span class="lb">魚の体力</span><span class="bar sta"><i></i></span></div><div class="row dist"><span class="lb">距離</span><span class="dv"></span><span class="kg"></span></div><button class="reel">長押しで巻く</button></div>`;
    const btn = el.querySelector('.reel'), on = e => { e.preventDefault(); FISHX.ptr = true; }, off = () => { FISHX.ptr = false; };
    btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointerleave', off); btn.addEventListener('pointercancel', off);
  }
  el.hidden = false; const c = F.cond || FISHX.cond(F.tgt.env), now = performance.now();
  if (!el._ct || now - el._ct > 1000) { el._ct = now; const td = TIDE.at(currentHour(), c.a); el.querySelector('.fc').innerHTML = `<span>${TIDE.moon(c.a)} 月齢${c.a.toFixed(1)}</span>${c.salt ? `<span><b>${c.tn}</b>・${TIDE.stage(td)}（潮位 ${TIDE.cm(td) >= 0 ? '+' : ''}${TIDE.cm(td)}cm）</span>` : '<span>淡水（潮の影響なし）</span>'}<span>活性 <b class="st">${'★'.repeat(c.stars)}<i>${'★'.repeat(5 - c.stars)}</i></b></span>${c.tags.length ? `<span class="tg">${c.tags.join('・')}</span>` : ''}${F.st === 'wait' && F.nibN ? `<span class="tg">前アタリ ${F.nibN}回</span>` : ''}`; }
  const ff = el.querySelector('.ff'); ff.hidden = F.st !== 'fight';
  if (F.st === 'fight') {
    const T = Math.min(1.2, F.T), ti = ff.querySelector('.ten i'); ti.style.width = `${Math.min(100, T / 1.0 * 100)}%`; ti.style.background = T > 0.85 ? '#e0402a' : T > 0.6 ? '#f0b02a' : T < 0.12 ? '#9ab' : '#3aa85a';
    ff.querySelector('.sta i').style.width = `${Math.round(F.S * 100)}%`; ff.querySelector('.dv').textContent = `あと ${F.dist.toFixed(1)}m`; ff.querySelector('.kg').textContent = F.fightT > 2.5 ? `重さの感じ：${F.kg > 3 ? 'かなり重い！' : F.kg > 1 ? '重い' : F.kg > 0.3 ? 'ふつう' : '軽い'}` : '';
    const m = F.overT > 0 ? '⚠️ 糸が切れそう！ はなして！' : F.slackT > 1.6 ? '⚠️ 糸がたるんでいる！ 巻いて！' : F.msgT > 0 ? F.msg : F.lineOut ? 'ジーッ…ドラグが鳴って糸が出ている' : FISHX.hold ? '巻いている…' : F.S < 0.2 ? '魚が弱ってきた！ 一気に巻こう' : '魚が止まった。今のうちに巻こう';
    ff.querySelector('.fmsg').textContent = m; ff.querySelector('.fmsg').className = 'fmsg' + (F.overT > 0 || F.slackT > 1.6 ? ' warn' : ''); ff.querySelector('.reel').classList.toggle('on', FISHX.hold);
  }
};
{ const st = document.createElement('style'); st.textContent = `#fishHud{position:absolute;left:50%;top:58px;transform:translateX(-50%);z-index:12;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;max-width:calc(100vw - 32px)}
#fishHud .fc{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 10px;background:rgba(20,40,60,.72);color:#fff;font-size:12px;padding:5px 12px;border-radius:14px;line-height:1.4}#fishHud .fc .st{color:#ffd24a;letter-spacing:-1px}#fishHud .fc .st i{color:rgba(255,255,255,.25);font-style:normal}#fishHud .fc .tg{color:#bfe8ff}
#fishHud .ff{background:rgba(255,255,255,.94);border-radius:14px;padding:8px 12px;width:min(320px,calc(100vw - 32px));box-shadow:0 4px 14px rgba(0,0,0,.18);pointer-events:auto}#fishHud .fmsg{font-weight:800;font-size:13px;text-align:center;margin-bottom:5px;min-height:18px;color:#24425a}#fishHud .fmsg.warn{color:#d0301a}
#fishHud .row{display:flex;align-items:center;gap:8px;font-size:12px;margin:3px 0}#fishHud .lb{width:64px;color:#567;white-space:nowrap}#fishHud .bar{flex:1;height:10px;border-radius:6px;background:#e4e8ec;position:relative;overflow:hidden}#fishHud .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:#3aa85a;transition:width .08s}#fishHud .sta i{background:#4a8ad8}#fishHud .lim{position:absolute;left:85%;top:0;bottom:0;width:2px;background:#e0402a}
#fishHud .dist .dv{font-weight:800}#fishHud .dist .kg{margin-left:auto;color:#789}#fishHud .reel{margin-top:6px;width:100%;padding:9px;border-radius:10px;border:0;background:#2a6a9a;color:#fff;font-weight:800;font-size:14px;touch-action:none;user-select:none}#fishHud .reel.on{background:#e07a2a}`; document.head.appendChild(st); }
// keep the reel held while the key is down
addEventListener('keyup', e => { if (e.code === 'KeyF' || e.code === 'Space') FISHX.hold = false; });
