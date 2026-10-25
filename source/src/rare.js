// ===================== RARE: めずらしい出来事（記録される） =====================
// 流れ星に願いごと（次の日、浜に「星のかけら」）・スナメリ・夜光虫の青い波・虹・朝霧の海（雲海）・渡り鳥の群れ・満月の「月の道」・台風一過
// 台風（storm）の天気: 横なぐりの雨、強い風、白波、ときどき稲光
const RARE_DEFS = [
  { id: 'wish', name: '流れ星に願いごと', icon: '🌠', hint: '晴れた夜、流れ星が見えたらすぐ F', note: '願いごとをした次の日、浜に何かが流れつくといううわさ。' },
  { id: 'sunameri', name: 'スナメリ', icon: '🐬', hint: 'おだやかな昼、港や浜から沖をながめていると', note: '瀬戸内にすむ、背びれのない小さなイルカのなかま。ほほえんでいるような顔。' },
  { id: 'yakouchu', name: '夜光虫の青い波', icon: '💠', hint: '初夏から夏のおだやかな夜、浜で', note: '波がくだけるたびに、青白く光る。小さなプランクトンのしわざ。' },
  { id: 'niji', name: '虹', icon: '🌈', hint: '雨があがって、お日さまが出たとき', note: '太陽を背にした空に、七色の橋。たまに二重になる。' },
  { id: 'unkai', name: '朝霧の海', icon: '☁️', hint: '霧の濃い朝、見晴らしの丘のてっぺんから', note: '町も海も白い霧の下。丘の上だけが島のように浮かぶ。' },
  { id: 'wataridori', name: '渡り鳥の群れ', icon: '🕊️', hint: '春と秋の昼間、空を見上げて', note: 'V の字にならんで、海の向こうへ。' },
  { id: 'tsukinomichi', name: '月の道', icon: '🌕', hint: '満月のころの晴れた夜、海辺で', note: '月の光が海に一本の道をつくる。' },
  { id: 'taifu', name: '台風一過', icon: '🌀', hint: '台風が通りすぎたあと', note: '嵐のあとの、うそみたいに澄んだ空。' },
];
const RARE = { t: 0, chk: 0, porp: null, birds: null, bow: null, road: null, shootSeen: 0, lastW: '', glow: 0, flash: 0, shower: null, forceGlow: false };
RARE.def = id => RARE_DEFS.find(d => d.id === id);
RARE.count = () => Object.keys((GAME.p && GAME.p.rare) || {}).length;
RARE.luck = () => { const o = GAME.p && GAME.p.omikuji; return o && o.date === todayKey() ? (o.rank === '大吉' ? 2.2 : o.rank === '中吉' ? 1.5 : 1) : 1; };
RARE.seen = function (id, quiet) {
  const p = GAME.p; if (!p) return; p.rare = p.rare || {}; const first = !p.rare[id], D = RARE.def(id); if (!D) return;
  const r = p.rare[id] || (p.rare[id] = { n: 0, first: todayKey() }); if (r.last === todayKey() && !first) return; r.n++; r.last = todayKey(); GAME.dirty = true;
  if (first) { GAME.banner && GAME.banner(`✨ めずらしい出来事　${D.icon} ${D.name}`, `${D.note}（手帳の図鑑に記録しました　${RARE.count()}/${RARE_DEFS.length}）`); try { SND.play('jingle', { vol: 0.5 }); } catch (e) { } }
  else if (!quiet) UI.toast(`${D.icon} ${D.name}！`);
  GAME.check && GAME.check();
};
RARE.coastNear = function (x, z, r = 40) { for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; for (const d of [r * 0.4, r]) if (groundH(x + Math.cos(a) * d, z + Math.sin(a) * d) < -1.5) return [Math.cos(a), Math.sin(a), d]; } return null; };
RARE.month = () => seasonDate().getMonth() + 1;
// ---------- 流れ星に願いごと ----------
RARE.shootOn = function () { const sh = NATURE.shoot; if (sh && sh.userData.on) { RARE.shootSeen = performance.now(); return true; } return performance.now() - RARE.shootSeen < 1400; };
RARE.wish = function () {
  const p = GAME.p; p.wish = p.wish || { n: 0 }; RARE.shootSeen = 0; if (p.wish.day === todayKey()) { UI.toast('🌠 …今夜はもう願いごとをした。また明日の夜に'); return true; }
  p.wish.day = todayKey(); p.wish.n++; p.wish.pend = todayKey(); GAME.dirty = true; RARE.seen('wish', true);
  UI.toast('🌠 流れ星に願いごとをした…。あしたの朝、浜に何か流れつくかも'); try { SND.play('ui_glass1', { vol: 0.5 }); } catch (e) { } return true;
};
SHORE_ITEMS.push({ id: 'hoshikakera', name: '星のかけら', st: 4, p: 2500, kind: 'star', col: '#ffe9a0', w: 0, hint: '流れ星に願いごとをした次の日、浜で', note: '夜空からおちてきた、ほんのり光るかけら。…ほんとうに？' });
{ const _sm = SHORE.mesh; SHORE.mesh = function (it) { const D = SHORE.def(it.id); if (!D || D.kind !== 'star') return _sm.apply(this, arguments);
    const g = new THREE.Group(), m = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshStandardMaterial({ color: '#fff0b8', roughness: 0.2, metalness: 0.1, emissive: new THREE.Color('#ffcc55'), emissiveIntensity: 0.9 })); m.scale.set(1, 1.4, 1); m.position.y = 0.045; m.rotation.z = 0.4; m.castShadow = true; g.add(m);
    const tmp = _sm.call(this, { id: 'glass_w' }); const sp = tmp.userData.glint; tmp.remove(sp); g.add(sp); g.userData.glint = sp; return g; }; }
{ const _sd = SHORE.daily; SHORE.daily = function () { const r = _sd.apply(this, arguments); const p = GAME.p; if (!p || !SHORE.grp || !p.wish || !p.wish.pend || p.wish.pend >= todayKey()) return r;
    if (p.shore.got.includes(900) || SHORE.items.some(q => q.i === 900) || !SHORE.spots || !SHORE.spots.length) return r;
    const R = mulberry(hashStr(todayKey() + 'star')), s = SHORE.spots[Math.floor(R() * SHORE.spots.length)], it = { x: s[0], z: s[1], id: 'hoshikakera', i: 900, ry: 0, ph: 0 }; const y = groundH(it.x, it.z); if (y < -0.05) return r;
    it.mesh = SHORE.mesh(it); it.mesh.scale.setScalar(1.6); it.mesh.position.set(it.x, y, it.z); SHORE.grp.add(it.mesh); SHORE.items.push(it); return r; }; }
{ const _pk = SHORE.pick; SHORE.pick = function (it) { const r = _pk.apply(this, arguments); if (it.id === 'hoshikakera' && GAME.p.wish) { GAME.p.wish.pend = null; setTimeout(() => UI.toast('🌠 願いごと、とどいたのかな…'), 1600); } return r; }; }
// ---------- スナメリ ----------
RARE.spawnPorpoise = function () {
  const c = RARE.coastNear(PL.x, PL.z, 45); if (!c) return false; const [dx, dz] = c; let x = PL.x + dx * 40, z = PL.z + dz * 40; for (let k = 0; k < 20 && groundH(x, z) > -1.8; k++) { x += dx * 6; z += dz * 6; } if (groundH(x, z) > -1.8) return false;
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.28, side: THREE.DoubleSide }), g = new THREE.Group(), list = [];
  // a finless porpoise: round melon head, plump body tapering to the tail stock, flat flukes; dark grey back, pale belly
  const geo = (() => { const prof = [[0, -0.86], [0.06, -0.82], [0.11, -0.6], [0.2, -0.3], [0.29, 0.02], [0.31, 0.28], [0.28, 0.52], [0.22, 0.7], [0.12, 0.82], [0, 0.87]].map(([r, y]) => new THREE.Vector2(r, y));
    const body = new THREE.LatheGeometry(prof, 18); body.rotateX(Math.PI / 2); body.scale(1, 0.88, 1);
    const fluke = new THREE.Shape(); fluke.moveTo(0, 0.04); fluke.quadraticCurveTo(0.18, 0.02, 0.3, -0.16); fluke.quadraticCurveTo(0.12, -0.08, 0, -0.06); fluke.quadraticCurveTo(-0.12, -0.08, -0.3, -0.16); fluke.quadraticCurveTo(-0.18, 0.02, 0, 0.04);
    const fl = new THREE.ExtrudeGeometry(fluke, { depth: 0.025, bevelEnabled: false }); fl.rotateX(-Math.PI / 2); fl.translate(0, 0, -0.84);
    const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.quadraticCurveTo(0.2, -0.02, 0.26, -0.1); fin.quadraticCurveTo(0.12, -0.08, 0, -0.12); const fins = [1, -1].map(s => { const f = new THREE.ExtrudeGeometry(fin, { depth: 0.02, bevelEnabled: false }); f.rotateX(-Math.PI / 2); f.rotateZ(s * 0.45); if (s < 0) f.scale(-1, 1, 1); f.translate(s * 0.22, -0.12, 0.42); return f.toNonIndexed(); });
    const keep = gq => { for (const k of Object.keys(gq.attributes)) if (!['position', 'normal', 'uv'].includes(k)) gq.deleteAttribute(k); return gq; };
    const q = mergeGeometries([keep(body.toNonIndexed()), keep(fl.toNonIndexed()), ...fins.map(keep)]); const P = q.attributes.position, N = q.attributes.normal, C = new Float32Array(P.count * 3), top = new THREE.Color('#5c6a70'), bel = new THREE.Color('#b4bec2'), c = new THREE.Color();
    for (let i = 0; i < P.count; i++) { c.copy(bel).lerp(top, sstep(-0.35, 0.35, N.getY(i))); C.set([c.r, c.g, c.b], i * 3); } q.setAttribute('color', new THREE.BufferAttribute(C, 3)); return q; })();
  const ringG = new THREE.PlaneGeometry(1.6, 1.6); ringG.rotateX(-Math.PI / 2);
  if (!RARE.ripTex) RARE.ripTex = txCanvas(128, 128, (x) => { x.clearRect(0, 0, 128, 128); for (let k = 0; k < 90; k++) { const a = Math.random() * 6.283, r = 40 + Math.random() * 14, w = 0.04 + Math.random() * 0.12; x.strokeStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.45})`; x.lineWidth = 1.5 + Math.random() * 2.5; x.beginPath(); x.arc(64, 64, r, a, a + w * 6.283 * 0.25); x.stroke(); } });
  const ringM = new THREE.MeshBasicMaterial({ map: RARE.ripTex, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false });
  const n = 1 + Math.floor(Math.random() * 3), hd = Math.atan2(-dz, dx); for (let k = 0; k < n; k++) { const m = new THREE.Mesh(geo, mat); g.add(m); const ring = new THREE.Mesh(ringG, ringM.clone()); ring.renderOrder = 7; g.add(ring); list.push({ m, ring, off: k * 1.7, lat: (k - (n - 1) / 2) * 1.6 }); }
  scene.add(g); RARE.porp = { g, list, x, z, hd, t: 0, sp: 1.6, geo, mat, ringG, seen: false }; return true;
};
RARE.updPorpoise = function (dt) {
  const P = RARE.porp; if (!P) return; P.t += dt; const fx = Math.sin(P.hd), fz = Math.cos(P.hd);
  for (const q of P.list) { const tt = P.t - q.off, cyc = ((tt % 3.4) + 3.4) % 3.4, ph = cyc / 1.3; const along = tt * P.sp, x = P.x + fx * along + fz * q.lat, z = P.z + fz * along - fx * q.lat;
    const up = ph < 1 && tt > 0 ? Math.sin(ph * Math.PI) : 0; q.m.position.set(x, SEA.h - 0.5 + up * 0.42, z); q.m.rotation.set(ph < 1 ? (ph - 0.5) * 1.3 : 0, P.hd, 0, 'YXZ'); q.m.visible = up > 0.02;
    const rk = tt > 0 ? Math.min(1, cyc / 1.8) : 1; q.ring.position.set(x, SEA.h + 0.03, z); q.ring.scale.setScalar(0.7 + rk * 2.0); q.ring.material.opacity = (1 - rk) * 0.5; q.ring.visible = rk < 1; }
  if (!P.seen && P.t > 1.2 && Math.hypot(P.x - PL.x, P.z - PL.z) < 110) { P.seen = true; RARE.seen('sunameri'); }
  if (P.t > 15) { scene.remove(P.g); P.geo.dispose(); P.mat.dispose(); P.ringG.dispose(); RARE.porp = null; }
};
// ---------- 夜光虫 ----------
RARE.glowNight = function () { const m = RARE.month(), d = seasonDate(), key = d.getFullYear() * 400 + m * 32 + d.getDate(); if (m < 5 || m > 8) return false; return ((Math.sin(key * 7.77) * 43758.5453) % 1 + 1) % 1 < 0.35; };
// ---------- 虹（主虹と副虹） ----------
RARE.makeBow = function () {
  const mk = (rIn, rOut, a) => { const g = new THREE.RingGeometry(rIn, rOut, 160, 1, 0, Math.PI); const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { op: { value: 0 }, rIn: { value: rIn }, rOut: { value: rOut }, rev: { value: a } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float op, rIn, rOut, rev; varying vec2 vP; vec3 hue(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
      void main(){ float t = (length(vP) - rIn) / (rOut - rIn); if (rev > 0.5) t = 1.0 - t; vec3 c = hue(mix(0.78, 0.0, t)); float edge = smoothstep(0.0, 0.18, t) * smoothstep(1.0, 0.82, t); float ends = smoothstep(0.0, 0.12, vP.y / rOut); gl_FragColor = vec4(c * edge * ends * op, 1.0); }` });
    const o = new THREE.Mesh(g, m); o.renderOrder = -4; o.frustumCulled = false; return o; };
  const g = new THREE.Group(); const D = 1500, a1 = Math.tan(40.5 * Math.PI / 180) * D, a2 = Math.tan(42.5 * Math.PI / 180) * D, b1 = Math.tan(50.5 * Math.PI / 180) * D, b2 = Math.tan(53.5 * Math.PI / 180) * D;
  g.add(mk(a1, a2, 0)); g.add(mk(b1, b2, 1)); g.children[1].material.uniforms.op.value = 0; scene.add(g); return { g, D, t: 0, life: 0 };
};
RARE.updBow = function (dt, st) {
  const B = RARE.bow; if (!B) return; B.t += dt; const sd = st.sunDir, show = B.t < B.life && sd.y > 0.05 && sd.y < 0.75 && TIME.weather !== 'rain' && TIME.weather !== 'storm' && !GAME.inside;
  const k = Math.min(1, B.t / 6) * Math.min(1, Math.max(0, (B.life - B.t) / 30)); const anti = new THREE.Vector3(-sd.x, -sd.y, -sd.z);
  B.g.visible = show; B.g.position.copy(camera.position).addScaledVector(anti, B.D); B.g.lookAt(camera.position); B.g.children[0].material.uniforms.op.value = 0.38 * k; B.g.children[1].material.uniforms.op.value = 0.08 * k;
  if (show && k > 0.5 && !B.rec) { B.rec = true; RARE.seen('niji'); }
  if (B.t > B.life) { scene.remove(B.g); RARE.bow = null; }
};
// ---------- 渡り鳥 ----------
RARE.spawnBirds = function () {
  const m = RARE.month(), south = m >= 8, dir = south ? -0.9 : 2.2, n = 13 + Math.floor(Math.random() * 7), g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: '#2e2e34', roughness: 0.8, side: THREE.DoubleSide }), list = [];
  const wing = new THREE.PlaneGeometry(1.5, 0.42); wing.rotateX(-Math.PI / 2); wing.translate(0.75, 0, 0); const body = new THREE.ConeGeometry(0.17, 1.15, 6); body.rotateX(Math.PI / 2);
  for (let k = 0; k < n; k++) { const b = new THREE.Group(); b.add(new THREE.Mesh(body, mat)); const wl = new THREE.Mesh(wing, mat), wr = new THREE.Mesh(wing, mat); wr.scale.x = -1; b.add(wl, wr); b.userData.w = [wl, wr]; const side = k % 2 ? 1 : -1, rank = Math.ceil(k / 2); b.userData.o = [side * rank * (3.6 + Math.random() * 0.9), -rank * (3.1 + Math.random() * 0.8)]; b.userData.ph = Math.random() * 6; g.add(b); list.push(b); }
  const fx = Math.sin(dir), fz = Math.cos(dir), start = [PL.x - fx * 420 + fz * (Math.random() - 0.5) * 120, PL.z - fz * 420 - fx * (Math.random() - 0.5) * 120];
  g.position.set(start[0], 85 + Math.random() * 30, start[1]); g.rotation.y = dir; scene.add(g); RARE.birds = { g, list, fx, fz, t: 0, seen: false, wing, body, mat };
};
RARE.updBirds = function (dt) {
  const B = RARE.birds; if (!B) return; B.t += dt; B.g.position.x += B.fx * 13 * dt; B.g.position.z += B.fz * 13 * dt;
  for (const b of B.list) { const [ox, oz] = b.userData.o; b.position.set(ox, Math.sin(B.t * 0.7 + ox) * 0.6, oz); const f = Math.sin(B.t * 5 + b.userData.ph) * 0.55; b.userData.w[0].rotation.z = f; b.userData.w[1].rotation.z = -f; }
  if (!B.seen && Math.hypot(B.g.position.x - PL.x, B.g.position.z - PL.z) < 230 && !GAME.inside) { B.seen = true; RARE.seen('wataridori'); }
  if (B.t > 70) { scene.remove(B.g); B.wing.dispose(); B.body.dispose(); B.mat.dispose(); RARE.birds = null; }
};
// ---------- 月の道 ----------
RARE.makeRoad = function () {
  const g = new THREE.PlaneGeometry(1, 1, 1, 1); g.rotateX(-Math.PI / 2); g.translate(0, 0, -0.5);
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { op: { value: 0 }, time: { value: 0 }, col: { value: new THREE.Color('#fff2d0') } },
    vertexShader: 'varying vec2 vU; varying vec3 vW; void main(){ vU = vec2(position.x + 0.5, -position.z); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float op, time; uniform vec3 col; varying vec2 vU; varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){ float across = abs(vU.x - 0.5) * 2.0, w = mix(0.2, 1.0, vU.y); float band = exp(-pow(across / w, 2.0) * 3.0);
        float rip = 0.5 + 0.5 * sin(vW.x * 1.7 + vW.z * 0.9 + time * 2.0) * sin(vW.z * 1.3 - vW.x * 0.6 - time * 1.4);
        vec2 q = floor(vW.xz * vec2(3.0, 1.3) + vec2(0.0, time * 1.2)); float sp = step(0.84, h(q + floor(time * 4.0))) * rip; float fade = smoothstep(0.0, 0.14, vU.y) * smoothstep(1.0, 0.5, vU.y);
        gl_FragColor = vec4(col * band * fade * (0.16 + 0.3 * rip + sp * 1.3) * op, 1.0); }` });
  const o = new THREE.Mesh(g, m); o.renderOrder = 6; o.frustumCulled = false; scene.add(o); return o;
};
RARE.updRoad = function (dt) {
  const M = SEASON.moon, age = SEASON.moonAge, full = age > 0.43 && age < 0.57; let show = !!(M && M.visible && full && TIME.weather === 'clear' && !GAME.inside);
  if (show) { const d = M.position.clone().sub(camera.position); if (d.y / d.length() > 0.55) show = false; }
  if (!show) { if (RARE.road) RARE.road.visible = false; return; } if (!RARE.road) RARE.road = RARE.makeRoad();
  const R = RARE.road, d = M.position.clone().sub(camera.position); d.y = 0; d.normalize(); R.visible = true; R.position.set(camera.position.x + d.x * 20, SEA.h + 0.06, camera.position.z + d.z * 20); R.rotation.y = Math.atan2(-d.x, -d.z); R.scale.set(60, 1, 1300);
  R.material.uniforms.time.value += dt; R.material.uniforms.op.value = 0.55;
  if ((RARE._roadT = (RARE._roadT || 0) - dt) < 0) { RARE._roadT = 3; if (RARE.coastNear(PL.x, PL.z, 60)) RARE.seen('tsukinomichi', true); }
};
// ---------- 流星群（物語の夜） ----------
RARE.startShower = function (sec = 80) {
  if (RARE.shower) return; const list = []; for (let k = 0; k < 7; k++) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, fog: false })); l.frustumCulled = false; l.renderOrder = -3; scene.add(l); list.push({ l, t: -Math.random() * 3 }); }
  RARE.shower = { list, t: 0, sec };
};
RARE.updShower = function (dt) {
  const S = RARE.shower; if (!S) return; S.t += dt; const rad = new THREE.Vector3(0.3, 0.8, -0.5).normalize();
  for (const q of S.list) { q.t += dt; if (q.t > 1.1) { q.t = -Math.random() * 2.2; q.a = rad.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.1, (Math.random() - 0.3) * 0.5, (Math.random() - 0.5) * 1.1)).normalize(); q.d = q.a.clone().sub(rad).add(new THREE.Vector3(0, -0.3, 0)).normalize(); }
    if (q.t < 0 || !q.a) { q.l.material.opacity = 0; continue; } const P = q.l.geometry.attributes.position, p0 = q.a.clone().multiplyScalar(2400).addScaledVector(q.d, q.t * 1100), p1 = p0.clone().addScaledVector(q.d, -220); P.setXYZ(0, p0.x, p0.y, p0.z); P.setXYZ(1, p1.x, p1.y, p1.z); P.needsUpdate = true; q.l.position.copy(camera.position); q.l.material.opacity = Math.sin(Math.min(1, q.t / 1.1) * Math.PI) * (S.t < S.sec ? 1 : 0); }
  if (S.t > S.sec + 1.5) { for (const q of S.list) { scene.remove(q.l); q.l.geometry.dispose(); q.l.material.dispose(); } RARE.shower = null; }
};
// ---------- 台風の天気 ----------
RARE.updStorm = function (dt, st) {
  const storm = TIME.weather === 'storm' && !GAME.inside; RARE.flash = Math.max(0, RARE.flash - dt);
  if (storm && Math.random() < dt / 9) { RARE.flash = 0.35; setTimeout(() => { try { SND.play('fw_bang' + Math.floor(Math.random() * 5), { vol: 0.35, rate: 0.35 }); } catch (e) { } }, 600 + Math.random() * 1800); }
  if (RARE.flash > 0) { const k = RARE.flash > 0.25 || (RARE.flash < 0.15 && RARE.flash > 0.08) ? 1 : 0.2; SKY.hemi.intensity += 2.6 * k; SKY.hemi.color.lerp(new THREE.Color('#dfe8ff'), 0.6 * k); }
  // a storm that blows over leaves a clear sky, a rainbow and a beach full of things
  if (RARE.lastW === 'storm' && TIME.weather !== 'storm') { RARE.seen('taifu'); RARE.bow = RARE.bow || Object.assign(RARE.makeBow(), { life: 600 }); }
  else if ((RARE.lastW === 'rain') && TIME.weather !== 'rain' && TIME.weather !== 'storm' && !RARE.bow && st.sunDir.y > 0.05 && Math.random() < 0.6 * RARE.luck()) RARE.bow = Object.assign(RARE.makeBow(), { life: 420 });
  RARE.lastW = TIME.weather;
};
RARE.update = function (dt, st) {
  if (!GAME.p || !st) return; RARE.t += dt; const hf = TIME.mode === 'real' ? GFX.solarHour(currentHour()) : currentHour(), day = hf > 7 && hf < 17, calm = TIME.weather === 'clear' || TIME.weather === 'cloudy', L = RARE.luck();
  RARE.updStorm(dt, st); RARE.updPorpoise(dt); RARE.updBirds(dt); RARE.updBow(dt, st); RARE.updRoad(dt); RARE.updShower(dt);
  // 夜光虫: glowing surf on some calm early-summer nights (and on the story's night)
  const glowT = (RARE.forceGlow || (RARE.glowNight() && calm)) ? st.night : 0; RARE.glow += (glowT - RARE.glow) * Math.min(1, dt * 0.4); if (waterMat) waterMat.uniforms.uGlow.value = RARE.glow;
  if ((RARE.chk -= dt) > 0) return; RARE.chk = 2;
  if (GAME.inside || PL.veh && PL.veh.kind !== 'boat') return;
  if (RARE.glow > 0.5 && SHORE.spots && SHORE.spots.some(s => Math.hypot(s[0] - PL.x, s[1] - PL.z) < 30)) RARE.seen('yakouchu');
  if (!RARE.porp && day && calm && RARE.coastNear(PL.x, PL.z, 45) && Math.random() < 2 / 420 * L) RARE.spawnPorpoise();
  const m = RARE.month(); if (!RARE.birds && day && TIME.weather !== 'rain' && TIME.weather !== 'storm' && (m >= 3 && m <= 4 || m >= 9 && m <= 11) && Math.random() < 2 / 600 * L) RARE.spawnBirds();
  const pk = GAME.LM && GAME.LM.peak; if (pk && GFX.U.fogX.y > 0.38 && Math.hypot(PL.x - pk.x, PL.z - pk.z) < 26) RARE.seen('unkai');
};
{ const _us = updateSky; updateSky = function () { const r = _us.apply(this, arguments); try { RARE.update(arguments[3] || 0.016, r); } catch (e) { if (!RARE._err) { RARE._err = 1; console.warn('rare', e); } } return r; }; }
// wish key
{ const _pr = GAME.prompt; GAME.prompt = function () { if (GAME.p && !GAME.modal && !GAME.inside && !LIFE.fish && RARE.shootOn()) return 'F：流れ星に願いごとをする！'; return _pr.apply(this, arguments); }; }
{ const _fk = GAME.fishKey; GAME.fishKey = function () { if (GAME.p && !GAME.modal && !GAME.inside && !LIFE.fish && RARE.shootOn()) return RARE.wish(); return _fk.apply(this, arguments); }; }
// a rare stormy day in typhoon season instead of an ordinary rainy one; villagers stay home in a storm
{ const _aw = SEASON.autoWeather; SEASON.autoWeather = function (hf) { if (typeof STORY2 !== 'undefined' && STORY2.forceW) return STORY2.forceW; const w = _aw.apply(this, arguments); const d = seasonDate(), m = d.getMonth() + 1, key = d.getFullYear() * 400 + m * 32 + d.getDate();
    if (w === 'rain' && m >= 8 && m <= 10 && ((Math.sin(key * 3.31) * 43758.5453) % 1 + 1) % 1 < 0.12) return 'storm'; return w; }; }
{ const _le = LIVE.entry; LIVE.entry = function (n, hf) { const E = _le.apply(this, arguments); if (TIME.weather === 'storm' && E && E.act !== 'sleep') return Object.assign({}, E, { place: 'home', act: 'sleep' }); return E; }; }
// zukan
{ const _zt = GAME.zukanTab; GAME.zukanTab = function () { const p = this.p, R = p.rare || {}; return _zt.apply(this, arguments) + `<h3 class="bh" style="margin-top:14px">めずらしい出来事 ${RARE.count()} / ${RARE_DEFS.length}</h3>
    <ul class="list zukan">${RARE_DEFS.map(D => { const r = R[D.id]; return `<li class="${r ? 'done' : 'lock'}"><span class="ck">${r ? D.icon : '？'}</span><div><b>${r ? esc(D.name) : '？？？'}</b><div class="sub">${r ? `${r.first} にはじめて　${r.n}回　${esc(D.note)}` : 'ヒント：' + esc(D.hint)}</div></div></li>`; }).join('')}</ul>`; }; }
