// ===================== SEA: 潮の満ち引き・干潮の砂の道・干潮だけ入れる洞くつ =====================
// 瀬戸内は潮の干満が大きい。海面がゆっくり上下し（約±0.45m・半日周期＋大潮小潮）、干潮のときだけ
// はなれ小島へ歩いて渡れる砂の道（ほしなみの砂の道）が現れる。小島の岩の洞くつは干潮のときだけ入れる。
const SEA = { h: 0, sea: null, bar: null, cave: null, sign: null, ready: false, chk: 0 };
// uses the same moon-age tide model as fishing (fishing2.js TIDE): 大潮 about ±0.45 m on screen, 小潮 about ±0.2 m
SEA.td = function (ms) { const d = new Date(ms), h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600, a = TIDE.age(d); return TIDE.at(h, a); };
SEA.at = function (ms) { const td = SEA.td(ms); return td.level * td.amp * 0.45; };
SEA.nowMs = function () { if (TIME.mode === 'real') return Date.now(); const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() + TIME.hf * 3600000; };
SEA.events = function (fromMs, hours = 26) { // turning points (満潮 / 干潮) after fromMs
  const out = [], step = 5 * 60000; let prev = SEA.at(fromMs - step), cur = SEA.at(fromMs);
  for (let t = fromMs + step; t < fromMs + hours * 3600000; t += step) { const nx = SEA.at(t); if ((cur - prev) * (nx - cur) < 0) out.push({ type: nx < cur ? '満潮' : '干潮', ms: t - step, h: cur }); prev = cur; cur = nx; } return out;
};
SEA.fmt = ms => { const d = new Date(ms); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
SEA.state = function () { const ms = SEA.nowMs(); return `${TIDE.name(TIDE.age(new Date(ms)))}・${TIDE.stage(SEA.td(ms))}`; };
SEA.walkBar = () => SEA.h < 0.14; // the sand road can be walked (wading at most ankle deep)
// ---------- the sand road to the islet ----------
SEA.barLine = function () {
  const I = GAME.LM && GAME.LM.islet; if (!I) return null; let best = null;
  for (let a = 0; a < 6.283; a += 0.04) { const dx = Math.cos(a), dz = Math.sin(a); let edge = null; for (let r = 8; r < 60; r += 1) { if (groundH(I.x + dx * r, I.z + dz * r) < -0.3) { edge = r; break; } } if (edge === null) continue;
    for (let r = edge + 4; r < 190; r += 2) { const x = I.x + dx * r, z = I.z + dz * r; if (groundH(x, z) > 0.6) { if (r - edge > 12 && (!best || r - edge < best.len)) best = { len: r - edge, a, ax: I.x + dx * (edge - 3), az: I.z + dz * (edge - 3), bx: x + dx * 3, bz: z + dz * 3 }; break; } } }
  return best;
};
// the bar is a gently curving, uneven strip: it bows to one side, narrows in the middle and its edges wander
SEA.barProf = function (B, t) { const tc = Math.max(0, Math.min(1, t)), o = Math.sin(tc * Math.PI) * B.curv + (fbm(tc * 3.1, 1.7, 4, 3) - 0.5) * 3.2, w = B.w * (0.62 + 0.62 * fbm(tc * 4.3 + 2, 3.3, 6, 3)) * (1 - 0.28 * Math.sin(tc * Math.PI)); return [o, w]; };
SEA.barTL = function (B, x, z) { const dx = B.bx - B.ax, dz = B.bz - B.az, L2 = dx * dx + dz * dz, L = Math.sqrt(L2), t = ((x - B.ax) * dx + (z - B.az) * dz) / L2, lat = ((x - B.ax) * dz - (z - B.az) * dx) / L; return [t, lat, L]; };
SEA.barDist = function (B, x, z) { const [t, lat, L] = SEA.barTL(B, x, z), [o, w] = SEA.barProf(B, t), along = t < 0 ? -t * L : t > 1 ? (t - 1) * L : 0; return [Math.hypot(lat - o, along), w]; };
SEA.makeBar = function () {
  const L = SEA.barLine(); if (!L) return null; const { n, size } = WORLD, cell = size / (n - 1), h0 = -size / 2, H = G.H, H0 = G.H0, W = G.Wl; L.w = 3.4; L.curv = (hashStr(String(Math.round(L.ax))) % 2 ? 1 : -1) * Math.min(7, L.len * 0.12);
  const pad = 16, x0 = Math.min(L.ax, L.bx) - pad, x1 = Math.max(L.ax, L.bx) + pad, z0 = Math.min(L.az, L.bz) - pad, z1 = Math.max(L.az, L.bz) + pad; let i0 = 1e9, i1 = -1e9, j0 = 1e9, j1 = -1e9;
  for (let j = Math.max(0, Math.floor((z0 - h0) / cell)); j <= Math.min(n - 1, Math.ceil((z1 - h0) / cell)); j++) for (let i = Math.max(0, Math.floor((x0 - h0) / cell)); i <= Math.min(n - 1, Math.ceil((x1 - h0) / cell)); i++) {
    const x = h0 + i * cell, z = h0 + j * cell, [d, w] = SEA.barDist(L, x, z); if (d > w * 3.4) continue; const k = j * n + i;
    const crest = -0.2 + (fbm(x * 0.08, z * 0.08, 3, 7) - 0.5) * 0.12, tgt = d < w ? crest - (d / w) * (d / w) * 0.12 : lerp(crest - 0.12, -2.6, sstep(w, w * 3.4, d));
    if (tgt > H[k] && isNaN(W[k])) { H[k] = tgt; if (tgt > H0[k]) H0[k] = tgt; i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j); }
  }
  if (i1 >= i0) refreshRegion(i0 - 1, j0 - 1, i1 + 1, j1 + 1);
  return L;
};
SEA.inBar = function (x, z) { const B = SEA.bar; if (!B) return false; const [d, w] = SEA.barDist(B, x, z); return d < w * 1.6; };
SEA.onIslet = function (x, z) { const I = GAME.LM && GAME.LM.islet; return !!I && Math.hypot(x - I.x, z - I.z) < 34; };
// ---------- a rock arch on the islet's shore that floods at high tide ----------
SEA.makeCave = function () {
  const I = GAME.LM.islet, B = SEA.bar; let best = null;
  for (let a = 0; a < 6.283; a += 0.05) { const dx = Math.cos(a), dz = Math.sin(a); if (B) { const ba = Math.atan2(B.bz - I.z, B.bx - I.x); let da = Math.abs(((a - ba) % 6.283 + 9.42) % 6.283 - 3.14); if (da < 1.6) continue; } // on the far side from the sand road
    for (let r = 4; r < 50; r += 0.5) { const x = I.x + dx * r, z = I.z + dz * r, h = groundH(x, z); if (h < 0.1) { const back = groundH(x - dx * 6, z - dz * 6); if (back > 0.6 && !collidersNear(x, z).some(c => hitsCollider(c, x, z, 3)) && (!best || back > best.back)) best = { x: x - dx * 0.8, z: z - dz * 0.8, rot: Math.atan2(dx, dz), back }; break; } } }
  if (!best) return null;
  // one continuous sea arch (a thick, deep tube bent into an arch) with a cliff behind it; layered sedimentary colours, dark and wet at the foot
  const g = new THREE.Group(), rockM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
  const dark = new THREE.Color('#4a453d'), s1 = new THREE.Color('#8a7e6c'), s2 = new THREE.Color('#c2b6a0'), s3 = new THREE.Color('#6f6658'), c = new THREE.Color();
  const paint = (q, ox = 0, oy = 0, oz = 0) => { const P = q.attributes.position, C = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const x = P.getX(i) + ox, y = P.getY(i) + oy, z = P.getZ(i) + oz, band = 0.5 + 0.5 * Math.sin(y * 5.2 + (fbm(x * 0.5 + 3, z * 0.5, 2, 3) - 0.5) * 4);
      c.copy(s1).lerp(s2, band); c.lerp(s3, sstep(0.55, 0.9, fbm(x * 1.3, y * 1.3 + z, 5, 3))); c.lerp(dark, 1 - sstep(0.15, 0.75, y)); const v = 0.92 + (fbm(x * 4 + z * 2, y * 4, 9, 2) - 0.5) * 0.25; C.set([c.r * v, c.g * v, c.b * v], i * 3); } q.setAttribute('color', new THREE.BufferAttribute(C, 3)); return q; };
  const bump = (q, amp, f, seed) => { q.computeVertexNormals(); const P = q.attributes.position, N = q.attributes.normal; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), k = (fbm(x * f + seed, y * f + z * f * 0.7, seed, 4) - 0.5) * amp + (fbm(x * f * 4, z * f * 4 + y * f * 3, seed + 5, 2) - 0.5) * amp * 0.25; P.setXYZ(i, x + N.getX(i) * k, y + N.getY(i) * k, z + N.getZ(i) * k); } q.computeVertexNormals(); return q; };
  const curve = new THREE.Curve(); curve.getPoint = (t, tg = new THREE.Vector3()) => { const th = -0.32 + t * (Math.PI + 0.64); return tg.set(Math.cos(th) * 2.7, Math.sin(th) * 3.1, 0); };
  const arch = new THREE.TubeGeometry(curve, 56, 1.05, 16, false);
  { const P = arch.attributes.position, v = new THREE.Vector3(), cp = new THREE.Vector3(); for (let i = 0; i < P.count; i++) { const t = Math.floor(i / 17) / 56, th = -0.32 + t * (Math.PI + 0.64); curve.getPoint(t, cp); v.fromBufferAttribute(P, i).sub(cp); const k = 0.8 + 0.75 * (1 - Math.sin(Math.max(0, Math.min(Math.PI, th)))) + (fbm(t * 6, 2.5, 4, 2) - 0.5) * 0.5; v.multiplyScalar(k).add(cp); P.setXYZ(i, v.x, v.y, v.z); } } // thick legs, thinner span
  arch.scale(1, 1, 1.9); bump(arch, 1.1, 0.55, 2); bump(arch, 0.45, 1.6, 21); paint(arch);
  const am = new THREE.Mesh(arch, rockM); am.castShadow = am.receiveShadow = true; g.add(am);
  const cliff = mergeVertices(new THREE.IcosahedronGeometry(2.4, 4)); cliff.scale(2.3, 1.45, 1.3); cliff.translate(0, 1.5, -3.6); bump(cliff, 1.1, 0.45, 7); paint(cliff);
  const cm = new THREE.Mesh(cliff, rockM); cm.castShadow = cm.receiveShadow = true; g.add(cm);
  for (const [x, z, r, sd] of [[-3.6, 1.6, 0.55, 11], [3.4, 2.2, 0.45, 12], [-1.6, 2.6, 0.3, 13]]) { const q = mergeVertices(new THREE.IcosahedronGeometry(r, 2)); q.scale(1.3, 0.6, 1.1); bump(q, r * 0.6, 1.4, sd); q.translate(x, r * 0.2, z); paint(q); const m = new THREE.Mesh(q, rockM); m.castShadow = m.receiveShadow = true; g.add(m); }
  // a little sparkle of star sand in a hollow at the back
  const sand = new THREE.Mesh(new THREE.CircleGeometry(0.55, 18), new THREE.MeshStandardMaterial({ color: '#f0e6cc', roughness: 0.6, emissive: new THREE.Color('#5a4a30'), emissiveIntensity: 0.25 })); sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.04, -1.0); g.add(sand); g.userData.sand = sand;
  const y = Math.max(-0.2, groundH(best.x, best.z)); g.position.set(best.x, y, best.z); g.rotation.y = best.rot; scene.add(g);
  const O = { x: best.x, z: best.z, rot: best.rot };
  for (const sx of [-1, 1]) { const [cx, cz] = toWorld(O, sx * 2.75, 0); addCollider({ x: cx, z: cz, hw: 1.15, hd: 2.0, rot: best.rot, kind: 'rock' }); }
  { const [cx, cz] = toWorld(O, 0, -3.9); addCollider({ x: cx, z: cz, r: 2.4, kind: 'rock' }); }
  const [sx, sz] = toWorld(O, 0, -1.0);
  return { g, x: best.x, z: best.z, y, rot: best.rot, spot: { x: sx, z: sz } };
};
SEA.inCave = function (x, z) { const C = SEA.cave; return !!C && Math.hypot(x - C.spot.x, z - C.spot.z) < 2.4; };
SEA.makeSign = function () {
  const B = SEA.bar; if (!B) return null; const dx = B.bx - B.ax, dz = B.bz - B.az, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L; let x = B.bx + ux * 2.5, z = B.bz + uz * 2.5;
  for (let k = 0; k < 12 && (groundH(x, z) < 0.7 || collidersNear(x, z).some(c => hitsCollider(c, x, z, 0.5))); k++) { x += ux; z += uz; }
  const g = new THREE.Group(), wood = new THREE.MeshStandardMaterial({ color: '#8a6a48', roughness: 0.85 }); const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), wood); post.position.y = 0.75; g.add(post);
  const [cv, c] = cvs(512, 256); c.fillStyle = '#f2e8d0'; c.fillRect(0, 0, 512, 256); c.strokeStyle = '#7a5a3a'; c.lineWidth = 12; c.strokeRect(6, 6, 500, 244); c.fillStyle = '#3a2a1a'; c.textAlign = 'center'; c.font = '800 54px "M PLUS Rounded 1c", sans-serif'; c.fillText('ほしなみの砂の道', 256, 92); c.font = '600 32px "M PLUS Rounded 1c", sans-serif'; c.fillText('干潮のときだけ', 256, 152); c.fillText('はなれ小島へ歩いて渡れます', 256, 196);
  const bd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.04), [wood, wood, wood, wood, new THREE.MeshStandardMaterial({ map: toTex(cv, false), roughness: 0.8 }), wood]); bd.position.y = 1.35; g.add(bd);
  g.position.set(x, groundH(x, z), z); g.rotation.y = Math.atan2(-ux, -uz); g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); scene.add(g); addCollider({ x, z, r: 0.25, kind: 'sign' }); return { g, x, z };
};
SEA.init = function () {
  if (SEA.ready || !GAME.p || !GAME.LM || !G || !G.H) return; SEA.ready = true;
  SEA.sea = scene.children.find(o => o.isMesh && o.material === waterMat && o.geometry.parameters && o.geometry.parameters.width === 8000) || null;
  try { SEA.bar = SEA.makeBar(); } catch (e) { console.warn('tide bar', e); }
  try { SEA.cave = SEA.makeCave(); } catch (e) { console.warn('tide cave', e); }
  try { SEA.sign = SEA.makeSign(); } catch (e) { console.warn('tide sign', e); }
};
// keep things that float on the sea in step with the tide (they are positioned for sea level 0 by their own code)
SEA.float = function (o) { if (!o) return; const u = o.userData; if (u.tideY === undefined || Math.abs(o.position.y - u.tideY) > 1e-6) u.tideBase = o.position.y; o.position.y = u.tideBase + SEA.h; u.tideY = o.position.y; };
SEA.update = function (dt) {
  if (!GAME.p) return; SEA.init(); SEA.h = SEA.at(SEA.nowMs());
  if (SEA.sea) SEA.sea.position.y = SEA.h; if (waterMat) waterMat.uniforms.uTide.value = SEA.h;
  for (const v of VEH) if (v.kind === 'boat' && v.mesh) SEA.float(v.mesh);
  if (PL.veh && PL.veh.kind === 'boat' && PL.mesh) SEA.float(PL.mesh);
  const R = typeof LIFE !== 'undefined' && LIFE.rod, F = LIFE.fish; if (R && R.bob && R.bob.visible && F && F.tgt && F.tgt.env !== 'river' && F.tgt.env !== 'pond') SEA.float(R.bob);
  if (SEA.cave) { const s = SEA.cave.g.userData.sand; s.visible = SEA.h < 0.02; s.material.emissiveIntensity = 0.2 + Math.max(0, Math.sin(performance.now() / 400)) * 0.25; }
  // first time the road shows: a hint
  const p = GAME.p; p.tide = p.tide || {}; if (SEA.bar && SEA.walkBar() && !p.tide.seen && Math.hypot(PL.x - SEA.bar.bx, PL.z - SEA.bar.bz) < 40 && !GAME.inside) { p.tide.seen = 1; GAME.dirty = true; UI.toast('🌊 潮が引いて、はなれ小島へつづく砂の道が現れた！（干潮のときだけ歩いて渡れる）'); }
  if (SEA.onIslet(PL.x, PL.z) && !PL.veh && !p.tide.walked) { p.tide.walked = 1; GAME.dirty = true; GAME.ev && GAME.ev('visit', 1, 'islet'); }
};
// walking: at high tide the sea is deeper. Crossing the sand road needs the water to be shallow; elsewhere you can wade up to ~0.7 m
{ const _cw = canWalk; canWalk = function (x0, z0, x1, z1) {
    if (!_cw(x0, z0, x1, z1)) return false; const h = SEA.h; if (h < 0.02 || !SEA.ready) return true;
    if (!isNaN(waterLevelAt(G, x1, z1)) || deckY(x1, z1) !== null || onPierAt(x1, z1) || walkDeckY(x1, z1) !== null) return true;
    const d1 = h - groundH(x1, z1), d0 = h - groundH(x0, z0), lim = SEA.inBar(x1, z1) || SEA.inCave(x1, z1) ? 0.32 : 0.72; return !(d1 > lim && d1 > d0); }; }
// prompts and actions
SEA.near = function () { if (!SEA.ready || PL.veh || GAME.inside) return null; if (SEA.sign && Math.hypot(PL.x - SEA.sign.x, PL.z - SEA.sign.z) < 1.8) return 'sign'; if (SEA.cave && SEA.inCave(PL.x, PL.z) && Math.hypot(PL.x - SEA.cave.spot.x, PL.z - SEA.cave.spot.z) < 1.6) return 'cave'; return null; };
SEA.table = function () { const ev = SEA.events(SEA.nowMs() - 3 * 3600000, 30).filter(e => e.ms > SEA.nowMs() - 3600000).slice(0, 4); return ev.map(e => `${e.type} ${SEA.fmt(e.ms)}`).join('　'); };
SEA.act = function (k) {
  const p = GAME.p; if (k === 'sign') { UI.toast(`🌊 いまは ${SEA.state()}。${SEA.walkBar() ? '砂の道を渡れます！' : '砂の道は海の中…'}　${SEA.table()}`); return true; }
  if (k === 'cave') {
    if (SEA.h > 0.02) { UI.toast('洞くつの奥は海水でいっぱい…。潮が引いたら来てみよう'); return true; }
    if (typeof STORY2 !== 'undefined' && STORY2.caveFind && STORY2.caveFind()) return true;
    p.tide = p.tide || {}; if (p.tide.sand === todayKey()) { UI.toast('きょうの星の砂は、もうひろった。また明日の干潮に'); return true; }
    p.tide.sand = todayKey(); const b = SHORE.bag(); b.hoshizuna = (b.hoshizuna || 0) + 1; p.shorez = p.shorez || {}; const first = !p.shorez.hoshizuna; p.shorez.hoshizuna = (p.shorez.hoshizuna || 0) + 1; p.stats.shoreN = (p.stats.shoreN || 0) + 1;
    PLAY.pose = 0.75; PLAY.poseK = 'pick'; try { SND.play('ui_confirmation2', { vol: 0.6 }); } catch (e) { } UI.toast(`✨ 洞くつの奥で「星の砂」をひとつまみ見つけた！${first ? '（図鑑に登録）' : ''}　干潮の日に1回ひろえる`); GAME.dirty = true; GAME.check && GAME.check(); return true;
  }
  return false;
};
SHORE_ITEMS.push({ id: 'hoshizuna', name: '星の砂', st: 3, p: 700, kind: 'glass', col: '#f4ecd8', w: 0, hint: '干潮のとき、はなれ小島の洞くつの奥で', note: '小さな星の形をした砂。むかしの小さな生きもののから。' });
{ const _pr = GAME.prompt; GAME.prompt = function () { if (GAME.p && !GAME.modal) { const k = SEA.near(); if (k === 'sign') return 'F：看板を読む（潮の時刻）'; if (k === 'cave') return SEA.h > 0.02 ? '洞くつは海水の中（干潮を待とう）' : 'F：洞くつの奥をしらべる'; } return _pr.apply(this, arguments); }; }
{ const _fk = GAME.fishKey; GAME.fishKey = function () { if (!LIFE.fish && GAME.p && !GAME.modal) { const k = SEA.near(); if (k) return SEA.act(k); } return _fk.apply(this, arguments); }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { SEA.update(dt || 0.016); } catch (e) { if (!SEA._err) { SEA._err = 1; console.warn('tide', e); } } return r; }; }
// the clock card shows the next tide turn
{ const _ck = UI.clock; UI.clock = function (hf) { _ck.apply(this, arguments); let el = document.getElementById('hTide'); if (!el) { const d = document.getElementById('hD'); if (!d) return; el = document.createElement('div'); el.id = 'hTide'; el.className = 'd'; d.after(el); }
    if (!GAME.p) { el.textContent = ''; return; } const ev = SEA.events(SEA.nowMs() + 1800000, 14)[0]; el.textContent = `🌊 ${SEA.state()}${ev ? `　${ev.type} ${SEA.fmt(ev.ms)}` : ''}`; }; }
