// ===================== CHARACTERS: livelier bodies and faces =====================
// - a fuller walk / run cycle: knee flex at heel strike, hip drop + twist, counter-rotating torso, forward lean when running,
//   elbows that bend on the forward swing, a level head; breathing and weight shift when standing
// - faces: blinking (sometimes double), smiling eyes when greeting, a mouth that moves while talking
// - heads turn toward whoever is near (villagers look at you, you look at the villager you are next to)
// - the player leans into turns
const CHR = { list: [] };
animateBody = function (P, rest, ph, spd, dt, extra = {}) {
  if (!P.thighL) return;
  const run = spd > 3.6, wk = Math.min(1, spd / 2.0), amp = wk * (run ? 0.95 : 0.62), mv = spd > 0.1;
  const s = Math.sin(ph), c = Math.cos(ph);
  // legs: thigh swing; the knee folds through the swing phase and flexes a little on landing
  P.thighL.rotation.x = s * amp; P.thighR.rotation.x = -s * amp;
  const kn = run ? 2.25 : 1.35, flex = run ? 0.28 : 0.07;
  P.shinL.rotation.x = Math.max(0, -c) * amp * kn + flex * wk; P.shinR.rotation.x = Math.max(0, c) * amp * kn + flex * wk;
  // pelvis: walking is highest at mid-stance, running is highest in the flight phase; hip drops and twists with the stride
  const bob = run ? (1 - Math.abs(c)) * 0.06 : Math.abs(c) * 0.034;
  P.pelvis.position.y = rest.pelvis.y + (mv ? bob * Math.min(1, amp / 0.6) - (run ? 0.035 : 0.008) * wk : Math.sin(ph * 0.5) * 0.004);
  P.pelvis.rotation.z = mv ? s * 0.05 * amp : Math.sin(ph * 0.21) * 0.014;
  P.pelvis.rotation.y = mv ? s * 0.11 * amp : 0;
  // torso: counter-twist against the hips, lean into speed, breathe when standing still
  const lean = mv ? (run ? 0.2 : 0.045) * wk : 0;
  P.spine.rotation.x = lean + (mv ? Math.abs(c) * 0.03 * amp : Math.sin(ph * 0.95) * 0.014);
  P.spine.rotation.y = mv ? -s * 0.2 * amp : 0;
  P.spine.rotation.z = -P.pelvis.rotation.z * 0.7;
  // arms swing against the legs; elbows bend more on the forward swing, wider and bent when running
  P.upperArmL.rotation.x = -s * amp; P.upperArmR.rotation.x = s * amp;
  const br = mv ? 0 : Math.sin(ph * 0.95) * 0.02, out = run ? 0.24 : 0.12;
  P.upperArmL.rotation.z = -out - br; P.upperArmR.rotation.z = out + br;
  const eb = run ? 1.3 : 0.22 + (mv ? 0 : 0.05);
  P.foreArmL.rotation.x = -eb - Math.max(0, s) * amp * 0.55; P.foreArmR.rotation.x = -eb - Math.max(0, -s) * amp * 0.55;
  // head stays level and looking where we go
  P.head.rotation.x = -lean * 0.7 - (mv ? Math.abs(c) * 0.02 * amp : 0) + (extra.nod ? Math.sin(extra.nod * 8) * 0.12 : 0);
  P.head.rotation.y = -(P.spine.rotation.y + P.pelvis.rotation.y) * 0.85;
  P.head.rotation.z = mv ? 0 : Math.sin(ph * 0.35) * 0.04;
  P.head.userData.fresh = true; P.pelvis.userData.fresh = true;
  if (extra.wave) { P.upperArmR.rotation.z = 2.5; P.upperArmR.rotation.x = 0; P.foreArmR.rotation.z = Math.sin(extra.wave * 10) * 0.4; } else if (P.foreArmR) P.foreArmR.rotation.z = 0;
};
// ---------- face rig (done once per model, right after loading, before anything clones a model) ----------
CHR.repivot = function (o) { const g = o.geometry; g.computeBoundingBox(); const c = g.boundingBox.getCenter(new THREE.Vector3()); g.translate(-c.x, -c.y, -c.z); g.computeBoundingSphere(); o.position.add(c); return o; };
CHR.mouthMat = null;
CHR.rig = function (root) {
  if (!root || root.userData.chr) return root && root.userData.chr; const head = root.getObjectByName('head'); if (!head || !root.getObjectByName('thighL')) return null;
  const R = { eyes: [], mouth: null, mouthIn: null, blinkT: 0.5 + Math.random() * 3, blinkPh: -1, dbl: false, mo: 0, ly: 0, lp: 0, lyA: 0, lpA: 0, bank: 0, seed: Math.random() * 10, idleT: 0, happy: 0 };
  const ms = []; head.traverse(o => { if (o.isMesh) ms.push(o); });
  for (const o of ms) { const nm = (o.material && o.material.name) || ''; if (/^eyeTex/.test(nm)) R.eyes.push(CHR.repivot(o)); else if (/^mouth/.test(nm)) R.mouth = CHR.repivot(o); }
  if (R.mouth) {
    if (!CHR.mouthMat) CHR.mouthMat = new THREE.MeshStandardMaterial({ color: '#5a1c22', roughness: 0.7 });
    const bb = R.mouth.geometry.boundingBox, w = (bb.max.x - bb.min.x) * 0.36, g = new THREE.CircleGeometry(1, 18); g.scale(w, w * 0.75, 1);
    const mi = new THREE.Mesh(g, CHR.mouthMat); mi.position.copy(R.mouth.position); mi.position.y += (bb.max.y - bb.min.y) * 0.05; mi.position.z += 0.004; mi.rotation.x = 0.36; mi.visible = false; mi.castShadow = false;
    R.mouth.parent.add(mi); R.mouthIn = mi;
  }
  root.userData.chr = R; return R;
};
{ const _lm = loadModels; loadModels = async function () { const r = await _lm.apply(this, arguments); for (const k in MODELS) { try { CHR.rig(MODELS[k]); } catch (e) { console.warn('rig', k, e); } } return r; }; }
CHR.wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
CHR.nearNPC = function () { let best = null, bd = 16; for (const n of NPCS) { if (!n.mesh || !n.mesh.visible || n.asleep || (n.mesh.parent !== PL.mesh.parent)) continue; const d = (n.x - PL.x) ** 2 + (n.z - PL.z) ** 2; if (d < bd) { bd = d; best = n; } } return best; };
CHR.face = function (n, R, dt, t, isPL) {
  // blink: every 2–6 s, sometimes twice
  R.blinkT -= dt; if (R.blinkT <= 0 && R.blinkPh < 0) { R.blinkPh = 0; R.blinkT = 1.8 + Math.random() * 4.4; R.dbl = Math.random() < 0.18; }
  let close = 0; if (R.blinkPh >= 0) { R.blinkPh += dt; const b = R.blinkPh; close = b < 0.055 ? b / 0.055 : b < 0.085 ? 1 : b < 0.17 ? 1 - (b - 0.085) / 0.085 : 0; if (b >= 0.17) { R.blinkPh = -1; if (R.dbl) { R.dbl = false; R.blinkT = 0.1; } } }
  const talking = isPL ? false : (DIALOG.npc === n && UI.typing) || n.sayT > 0 || n.speakT > 0 || (n.mode === 'act' && n.act0 === 'chat' && Math.sin(t * 0.9 + n.hx) > 0.25);
  const happyT = isPL ? 0 : n.greeted > 0 || (DIALOG.npc === n && DIALOG.i === 0) ? 1 : 0; R.happy += (happyT - R.happy) * Math.min(1, dt * 6);
  const sleepy = (GAME.night || 0) > 0.8 && !GAME.inside ? 0.25 : 0;
  const open = Math.max(0.08, (1 - close * 0.92) * (1 - R.happy * 0.42) * (1 - sleepy));
  for (const e of R.eyes) e.scale.y = open;
  const mo = talking ? 0.3 + 0.7 * Math.abs(Math.sin(t * 12.5 + R.seed) * Math.sin(t * 7.1 + R.seed * 2.3)) : 0; R.mo += (mo - R.mo) * Math.min(1, dt * 20);
  if (R.mouth) R.mouth.scale.set(1 + R.mo * 0.12 + R.happy * 0.18, 1 + R.mo * 0.9 + R.happy * 0.35, 1);
  if (R.mouthIn) { R.mouthIn.visible = R.mo > 0.06; R.mouthIn.scale.set(1, Math.max(0.1, R.mo), 1); }
};
CHR.look = function (n, R, dt, t, isPL) {
  const P = n.parts || PL.parts, head = P && P.head; if (!head) return; const m = n.mesh, wx = isPL ? PL.x : n.x, wz = isPL ? PL.z : n.z, wy = isPL ? PL.y : n.y;
  let tx = null, ty = 0, tz = 0;
  if (isPL) { const nn = DIALOG.npc || (!PL.veh && R.mvT < 0.5 ? CHR.nearNPC() : null); if (nn) { tx = nn.x; tz = nn.z; ty = nn.y + 1.0; } }
  else if (!n.asleep && !PL.veh && m.parent === PL.mesh.parent && n.act0 !== 'look') { const d2 = (PL.x - wx) ** 2 + (PL.z - wz) ** 2; if (DIALOG.npc === n || d2 < 26) { tx = PL.x; tz = PL.z; ty = PL.y + 1.0; } }
  let yaw = 0, pit = 0;
  if (tx !== null) { const rel = CHR.wrap(Math.atan2(tx - wx, tz - wz) - m.rotation.y), d = Math.hypot(tx - wx, tz - wz); if (Math.abs(rel) < 2.0) { yaw = Math.max(-1.0, Math.min(1.0, rel)); pit = Math.max(-0.35, Math.min(0.3, -Math.atan2(ty - (wy + 1.0), Math.max(0.6, d)))); } }
  else if (isPL && R.idleT > 5 && !PL.veh) { yaw = Math.sin(t * 0.37) * 0.55 * Math.min(1, (R.idleT - 5) / 2); pit = Math.sin(t * 0.23) * 0.08; } // idle: look around
  R.ly += (yaw - R.ly) * Math.min(1, dt * 4.5); R.lp += (pit - R.lp) * Math.min(1, dt * 4.5);
  if (head.userData.fresh) { head.rotation.y += R.ly; head.rotation.x += R.lp; } else { head.rotation.y += R.ly - R.lyA; head.rotation.x += R.lp - R.lpA; }
  R.lyA = R.ly; R.lpA = R.lp; head.userData.fresh = false;
};
CHR.update = function (dt) {
  const t = performance.now() / 1000, cp = camera.position;
  // player: turn lean + idle timer
  const RP = PL.mesh && PL.mesh.userData.chr;
  if (RP) {
    const sp = PL.veh ? 0 : Math.abs(PL.speed || 0); RP.mvT = sp > 0.2 ? 0 : (RP.mvT || 0) + dt; RP.idleT = sp > 0.2 || DIALOG.npc ? 0 : RP.idleT + dt;
    const dr = CHR.wrap(PL.rot - (RP.prevRot === undefined ? PL.rot : RP.prevRot)); RP.prevRot = PL.rot;
    const w = dr / Math.max(dt, 1e-3), tgt = PL.veh ? 0 : Math.max(-0.16, Math.min(0.16, -w * sp * 0.014)); RP.bank += (tgt - RP.bank) * Math.min(1, dt * 6);
    const pel = PL.parts && PL.parts.pelvis; if (pel && pel.userData.fresh) { pel.rotation.z += RP.bank; pel.userData.fresh = false; }
    if (PL.mesh.visible) { CHR.face(PL, RP, dt, t, true); CHR.look(PL, RP, dt, t, true); }
  }
  for (const n of NPCS) {
    const m = n.mesh; if (!m || !m.visible || !m.parent) continue; const R = m.userData.chr; if (!R) continue;
    if (!GAME.inside && (n.x - cp.x) ** 2 + (n.z - cp.z) ** 2 > 2500) continue;
    const pel = n.parts && n.parts.pelvis; if (pel) { if (!pel.userData.fresh) { pel.rotation.z *= 0.9; pel.rotation.y *= 0.9; } pel.userData.fresh = false; } // seated / posed: ease the stride twist out
    CHR.face(n, R, dt, t, false); CHR.look(n, R, dt, t, false);
  }
};
{ const _uv = updateVillagers; updateVillagers = function (dt) { const r = _uv.apply(this, arguments); try { CHR.update(dt); } catch (e) { if (!CHR._warned) { CHR._warned = true; console.warn('CHR', e); } } return r; }; }
// ---------- footprints in the sand, dust when running ----------
CHR.fp = { list: [], i: 0, acc: 0, side: 1, dust: [], di: 0, dacc: 0, lx: null, lz: null };
CHR.groundKind = function (x, z) { if (!TERR.spl || GAME.inside) return ''; const [i, j] = toIdx(x, z), k = j * WORLD.n + i, h = groundH(x, z); if (roadDistAt(x, z) < 3.2 || (typeof deckY === 'function' && deckY(x, z) !== null)) return ''; if (TERR.spl[k * 4 + 3] > 0.5 && h > -0.1 && h < 2.6) return 'sand'; if (TERR.spl[k * 4 + 1] > 0.45) return 'dirt'; return ''; };
CHR.print = function (x, z, rot) {
  const F = CHR.fp; if (!F.tex) { F.tex = txCanvas(64, 128, (x) => { x.clearRect(0, 0, 64, 128); x.fillStyle = 'rgba(88,66,44,0.72)'; x.beginPath(); x.ellipse(32, 42, 15, 30, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(32, 102, 12, 17, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(60,44,28,0.35)'; for (let k = 0; k < 5; k++) { x.fillRect(20, 22 + k * 9, 24, 3); } }); F.geo = new THREE.PlaneGeometry(0.12, 0.24); F.geo.rotateX(-Math.PI / 2); }
  let m = F.list[F.i]; if (!m) { m = new THREE.Mesh(F.geo, new THREE.MeshStandardMaterial({ map: F.tex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.renderOrder = 2; m.receiveShadow = true; scene.add(m); F.list[F.i] = m; }
  F.i = (F.i + 1) % 60; m.visible = true; m.position.set(x, groundH(x, z) + 0.012, z); m.rotation.y = rot; m.userData.age = 0; m.material.opacity = 1;
};
CHR.puff = function (x, z, col) {
  const F = CHR.fp; if (!F.dtex) F.dtex = txCanvas(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
  let s = F.dust[F.di]; if (!s) { s = new THREE.Sprite(new THREE.SpriteMaterial({ map: F.dtex, transparent: true, depthWrite: false })); scene.add(s); F.dust[F.di] = s; }
  F.di = (F.di + 1) % 24; s.visible = true; s.material.color.set(col); s.position.set(x, groundH(x, z) + 0.08, z); s.userData.age = 0; s.userData.vx = (Math.random() - 0.5) * 0.4; s.userData.vz = (Math.random() - 0.5) * 0.4; s.scale.setScalar(0.18);
};
CHR.steps = function (dt) {
  const F = CHR.fp;
  for (const m of F.list) { if (!m || !m.visible) continue; m.userData.age += dt; const a = m.userData.age; m.material.opacity = Math.max(0, 1 - a / 40); if (a > 40) m.visible = false; }
  for (const s of F.dust) { if (!s || !s.visible) continue; const u = s.userData; u.age += dt; s.position.x += u.vx * dt; s.position.z += u.vz * dt; s.position.y += 0.25 * dt; s.scale.setScalar(0.18 + u.age * 0.9); s.material.opacity = Math.max(0, 0.55 * (1 - u.age / 0.7)); if (u.age > 0.7) s.visible = false; }
  if (PL.veh || GAME.inside || !PL.mesh || !PL.mesh.visible) { F.lx = null; return; }
  if (F.lx === null) { F.lx = PL.x; F.lz = PL.z; return; }
  const d = Math.hypot(PL.x - F.lx, PL.z - F.lz); F.lx = PL.x; F.lz = PL.z; if (d > 2) return; // teleport
  const sp = Math.abs(PL.speed || 0); if (sp < 0.3) return;
  F.acc += d; const stride = sp > 3.6 ? 0.62 : 0.42;
  if (F.acc >= stride) { F.acc = 0; F.side = -F.side; const kind = CHR.groundKind(PL.x, PL.z); const rx = Math.cos(PL.rot) * 0.085 * F.side, rz = -Math.sin(PL.rot) * 0.085 * F.side;
    if (kind === 'sand') CHR.print(PL.x + rx, PL.z + rz, PL.rot);
    if (sp > 3.6 && kind) CHR.puff(PL.x + rx - Math.sin(PL.rot) * 0.1, PL.z + rz - Math.cos(PL.rot) * 0.1, kind === 'sand' ? '#e8dcc0' : '#c8b49a'); }
};
{ const _cu = CHR.update; CHR.update = function (dt) { _cu.call(this, dt); CHR.steps(dt); }; }
