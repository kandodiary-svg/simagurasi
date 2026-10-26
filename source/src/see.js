// ===================== カメラ: 木の葉や幹・建物・車でキャラが隠れないように =====================
// 1) the camera never sits inside a tree crown: it drops under the crown (still behind you) or, if that would be too low, moves closer
// 2) when a building or a parked car is in the way it rises over it instead of collapsing onto the back of your head
// 3) whatever still crosses the line of sight (a trunk, a crown edge) is cut out in a narrow tube around that line:
//    clear in the middle, a thin dithered rim. Shadows are untouched (they use their own depth material).
const SEE = { p: { value: new THREE.Vector3() }, on: { value: 0 }, crC: { value: [new THREE.Vector4(0, -999, 0, 0), new THREE.Vector4(0, -999, 0, 0)] }, crV: { value: [1, 1] }, mats: new Set(), adj: new THREE.Vector3(), grid: null, sig: '' };
SEE.patch = function (m, near = 2.6, crown = false) {
  if (!m || SEE.mats.has(m) || !m.isMeshStandardMaterial) return; SEE.mats.add(m);
  const prev = m.onBeforeCompile, base = THREE.Material.prototype.customProgramCacheKey, own = m.customProgramCacheKey !== base ? m.customProgramCacheKey.bind(m) : null, prevSrc = prev ? prev.toString() : '';
  // the program cache key must still tell materials with different shader tweaks apart (three.js keys custom shaders by the
  // source of onBeforeCompile, and this wrapper's source is the same for every material it wraps)
  m.customProgramCacheKey = () => 'see|' + (crown ? 'cr|' : '') + prevSrc + '|' + (own ? own() : '');
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.uniforms.uSeeP = SEE.p; sh.uniforms.uSeeOn = SEE.on; sh.uniforms.uSeeNear = { value: near }; if (crown) { sh.uniforms.uCrC = SEE.crC; sh.uniforms.uCrV = SEE.crV; }
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSeeW;').replace('#include <project_vertex>', `#include <project_vertex>
      #ifdef USE_INSTANCING
        vSeeW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
      #else
        vSeeW = (modelMatrix * vec4(transformed, 1.0)).xyz;
      #endif`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vSeeW; uniform vec3 uSeeP; uniform float uSeeOn; uniform float uSeeNear;' + (crown ? ' uniform vec4 uCrC[2]; uniform float uCrV[2];' : '')).replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      if (uSeeOn > 0.5) {
        vec3 ab = uSeeP - cameraPosition; float L2 = max(dot(ab, ab), 1e-4);
        float t = clamp(dot(vSeeW - cameraPosition, ab) / L2, 0.0, 1.0);
        float pd = length(vSeeW - (cameraPosition + ab * t)), rr = mix(0.55, 1.25, t);
        float k = smoothstep(rr, rr * 0.72, pd) * smoothstep(0.97, 0.86, t);
        k = max(k, smoothstep(uSeeNear, uSeeNear * 0.46, length(vSeeW - cameraPosition)));   // things right around the camera fade out (trees: 2.6 m, the camera no longer dodges crowns; buildings: 1 m)
        ${crown ? `// the crown the camera is in disappears (instead of the camera dodging it)
        for (int i = 0; i < 2; i++) { vec4 c = uCrC[i]; if (c.w > 0.0) { vec3 d = vSeeW - c.xyz; float q = (d.x * d.x + d.z * d.z) / (c.w * c.w) + d.y * d.y / (uCrV[i] * uCrV[i]); k = max(k, smoothstep(1.0, 0.82, q)); } }` : ''}
        float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        if (ign < k) discard;
      }`);
  };
  m.needsUpdate = true;
};
SEE.patchTrees = function () {
  for (const st of VEG.sets || []) if (st.kind === 'tree') SEE.patch(st.mesh.material, 2.6, true);
  for (const k in VEG.userSets || {}) for (const st of VEG.userSets[k] || []) st && st.mesh && SEE.patch(st.mesh.material, 2.6, true);
};
{ const _b = buildVegetation; buildVegetation = function () { const r = _b.apply(this, arguments); try { SEE.patchTrees(); } catch (e) { console.warn('see', e); } return r; }; }
// ---------- tree crowns (rough ellipsoids per kind, scaled like the instances) ----------
SEE.CROWN = { momiji: [4.4, 3.2, 2.3], broad: [6.5, 3.9, 3.0], pine: [6.2, 2.7, 2.6], sakura: [4.6, 3.6, 2.4], palm: [6.6, 2.8, 1.5], bamboo: [5.2, 1.6, 4.0], mikan: [1.9, 1.5, 1.3] };
SEE.scaleOf = (it) => it.kind === 'mikan' ? 0.9 + it.r * 0.2 : it.kind === 'sakura' ? 1.15 + it.r * 0.35 : it.kind === 'bamboo' || it.kind === 'palm' ? 0.9 + it.r * 0.25 : 0.8 + it.r * 0.45;
SEE.buildGrid = function () {
  const g = new Map(), add = (it) => { if (!SEE.CROWN[it.kind]) return; const k = Math.floor(it.x / 8) + ',' + Math.floor(it.z / 8); (g.get(k) || g.set(k, []).get(k)).push(it); };
  for (const it of VEG.items || []) if (it.type === 'tree' && !(VEG.removed && VEG.removed[it.id])) add(it);
  for (const it of VEG.userTrees || []) add(it);
  SEE.grid = g;
};
SEE.inCrown = function (x, y, z, pad = 1) {
  if (!SEE.grid) return null; const cx = Math.floor(x / 8), cz = Math.floor(z / 8); let hit = null;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const it of SEE.grid.get((cx + a) + ',' + (cz + b)) || []) {
    const C = SEE.CROWN[it.kind], s = SEE.scaleOf(it), g = groundH(it.x, it.z), rh = C[1] * s * pad, rv = C[2] * s * pad, cy = g + C[0] * s;
    const q = ((x - it.x) ** 2 + (z - it.z) ** 2) / (rh * rh) + ((y - cy) ** 2) / (rv * rv);
    if (q < 1 && (!hit || cy - rv < hit.bottom)) hit = { bottom: cy - rv, it };
  }
  return hit;
};
// buildings (footprint colliders up to ~9 m) and parked cars
SEE.blocked = function (p) {
  const gy = groundH(p.x, p.z);
  // garden walls and fences (thin footprints) are low: the camera may look over them; houses and sheds block up to ~9 m
  const hy = p.y - gy;
  if (hy < 9) for (const c of collidersNear(p.x, p.z)) { if (c.r !== undefined || c.off) continue; const thin = Math.min(c.hw || 0, c.hd || 0) < 0.2; if (thin && hy > 1.5) continue; if (hitsCollider(c, p.x, p.z, 0.05)) return true; }
  if (p.y - gy < 2.0) for (const v of VEH) { if (v === PL.veh || !v.mesh || !v.mesh.visible) continue; if (Math.hypot(v.x - p.x, v.z - p.z) < (v.kind === 'bus' || v.kind === 'ferry' || v.kind === 'boat' ? 3.2 : 1.7)) return true; }
  return false;
};
SEE.freeLen = function (from, dir, full) { for (let t = 0.8; t < full; t += 0.35) { const p = from.clone().addScaledVector(dir, t); if (SEE.blocked(p)) return Math.max(0.8, t - 0.35); } return full; };
SEE.fix = function (dt) {
  const T = CAM.target, cam = camera.position.clone(), want = cam.clone();
  // a. something solid behind you squeezed the camera: rise over it instead
  const full = CAM.dist, d0 = cam.distanceTo(T);
  if (d0 < full * 0.62 && full > 2.5) {
    // try a little higher first; never steeper than ~55° (a straight-down view hides the scene), as far back as is free
    let best = null;
    for (const dp of [0, 0.3, 0.55, 0.8]) { const pt = Math.min(0.95, CAM.pitch + dp), cp = Math.cos(pt), dir = new THREE.Vector3(Math.sin(CAM.yaw) * cp, Math.sin(pt), Math.cos(CAM.yaw) * cp);
      const L = SEE.freeLen(T, dir, full); if (!best || L > best.L + 0.3) best = { L, dir }; if (L >= full * 0.82) break; }
    if (best && best.L > d0 + 0.4) want.copy(T).addScaledVector(best.dir, Math.min(best.L, full));
  }
  // (tree crowns: the camera used to drop under them or jump closer, which shook the view in every wood; now the leaves
  //  around the camera simply fade out in the shader, so the camera stays where it is)
  const delta = want.sub(cam), k = Math.min(1, dt * 3);
  SEE.adj.lerp(delta, delta.lengthSq() > SEE.adj.lengthSq() ? Math.min(1, dt * 6) : k);
  if (SEE.adj.lengthSq() > 1e-6) { camera.position.add(SEE.adj); camera.lookAt(T); }
};
// rising over buildings now happens in updateCamera itself (tilt up first, smoothly); SEE.fix stays for debugging only
SEE.noFix = true;
SEE.crownsAt = function (x, y, z, pad = 1.12) {
  const out = []; if (!SEE.grid) return out; const cx = Math.floor(x / 8), cz = Math.floor(z / 8);
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const it of SEE.grid.get((cx + a) + ',' + (cz + b)) || []) {
    const C = SEE.CROWN[it.kind], s = SEE.scaleOf(it), g = groundH(it.x, it.z), rh = C[1] * s * pad, rv = C[2] * s * pad, cy = g + C[0] * s;
    const q = ((x - it.x) ** 2 + (z - it.z) ** 2) / (rh * rh) + ((y - cy) ** 2) / (rv * rv); if (q < 1) out.push({ x: it.x, y: cy, z: it.z, rh: rh * 1.08, rv: rv * 1.08, q }); }
  return out.sort((a, b) => a.q - b.q);
};
SEE.crownUpdate = function () {
  const now = performance.now();
  if (!SEE.grid || now - (SEE.sigT || 0) > 1500) { SEE.sigT = now; const sig = ((VEG.items || []).length) + ':' + (VEG.removed ? VEG.removed.reduce((a, b) => a + b, 0) : 0) + ':' + (VEG.userTrees || []).length; if (sig !== SEE.sig) { SEE.sig = sig; SEE.buildGrid(); } }
  const cp = camera.position, L = SEE.crownsAt(cp.x, cp.y, cp.z);
  for (let i = 0; i < 2; i++) { const c = L[i], v = SEE.crC.value[i]; if (c) { v.set(c.x, c.y, c.z, c.rh); SEE.crV.value[i] = c.rv; } else v.w = 0; }
};
{ const _u = updateCamera; updateCamera = function (dt) { const r = _u.apply(this, arguments);
  const on = !SEE.disabled && CAM.mode === 'third' && !GAME.inside && !window.__freecam && GAME.modal !== 'title' && !(GAME.camOverride && GAME.camOverride());
  if (on) {
    if (!SEE.noFix) try { SEE.fix(dt || 0.016); } catch (e) { }
    try { SEE.crownUpdate(); } catch (e) { }
  } else SEE.adj.set(0, 0, 0);
  SEE.on.value = on ? 1 : 0; if (on) SEE.p.value.copy(CAM.target); return r; }; }

// ---------- walls, eaves, fences, cars… between the camera and you are cut out the same way (the camera no longer hugs walls) ----------
SEE.skip = new Set();
SEE.patchWorld = function () {
  const skip = new Set(); if (typeof TERR !== 'undefined') { if (TERR.mat) skip.add(TERR.mat); } if (typeof waterMat !== 'undefined' && waterMat) skip.add(waterMat);
  const noRoot = []; if (typeof TERR !== 'undefined' && TERR.roadGroup) noRoot.push(TERR.roadGroup); if (PL.mesh) noRoot.push(PL.mesh); if (typeof FLORA !== 'undefined' && FLORA.group) noRoot.push(FLORA.group);
  // not the ground, roads, small plants, and no people (their materials are shared with you: you must never fade)
  const isUnder = o => { for (let p = o; p; p = p.parent) if (noRoot.includes(p) || (p.userData && p.userData.chr)) return true; return false; };
  let n = 0; scene.traverse(o => { if (!o.isMesh || !o.material) return; const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) { if (!m.isMeshStandardMaterial || SEE.mats.has(m) || skip.has(m) || SEE.skip.has(m)) continue; if (isUnder(o)) { SEE.skip.add(m); continue; } SEE.patch(m, 1.0); n++; } });
  SEE.worldN = (SEE.worldN || 0) + n; return n;
};
