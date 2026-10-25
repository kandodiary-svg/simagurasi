// ===================== カメラ: 木の葉や幹・建物・車でキャラが隠れないように =====================
// 1) the camera never sits inside a tree crown: it drops under the crown (still behind you) or, if that would be too low, moves closer
// 2) when a building or a parked car is in the way it rises over it instead of collapsing onto the back of your head
// 3) whatever still crosses the line of sight (a trunk, a crown edge) is cut out in a narrow tube around that line:
//    clear in the middle, a thin dithered rim. Shadows are untouched (they use their own depth material).
const SEE = { p: { value: new THREE.Vector3() }, on: { value: 0 }, mats: new Set(), adj: new THREE.Vector3(), grid: null, sig: '' };
SEE.patch = function (m) {
  if (!m || SEE.mats.has(m) || !m.isMeshStandardMaterial) return; SEE.mats.add(m);
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.uniforms.uSeeP = SEE.p; sh.uniforms.uSeeOn = SEE.on;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSeeW;').replace('#include <project_vertex>', `#include <project_vertex>
      #ifdef USE_INSTANCING
        vSeeW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
      #else
        vSeeW = (modelMatrix * vec4(transformed, 1.0)).xyz;
      #endif`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vSeeW; uniform vec3 uSeeP; uniform float uSeeOn;').replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      if (uSeeOn > 0.5) {
        vec3 ab = uSeeP - cameraPosition; float L2 = max(dot(ab, ab), 1e-4);
        float t = clamp(dot(vSeeW - cameraPosition, ab) / L2, 0.0, 1.0);
        float pd = length(vSeeW - (cameraPosition + ab * t)), rr = mix(0.55, 1.25, t);
        float k = smoothstep(rr, rr * 0.72, pd) * smoothstep(0.97, 0.86, t);
        k = max(k, smoothstep(0.9, 0.45, length(vSeeW - cameraPosition)));
        float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        if (ign < k) discard;
      }`);
  };
  m.needsUpdate = true;
};
SEE.patchTrees = function () {
  for (const st of VEG.sets || []) if (st.kind === 'tree') SEE.patch(st.mesh.material);
  for (const k in VEG.userSets || {}) for (const st of VEG.userSets[k] || []) st && st.mesh && SEE.patch(st.mesh.material);
};
{ const _b = buildVegetation; buildVegetation = function () { const r = _b.apply(this, arguments); try { SEE.patchTrees(); } catch (e) { console.warn('see', e); } return r; }; }
// ---------- tree crowns (rough ellipsoids per kind, scaled like the instances) ----------
SEE.CROWN = { broad: [5.7, 3.9, 3.0], pine: [6.2, 2.7, 2.6], sakura: [4.6, 3.6, 2.4], palm: [6.6, 2.8, 1.5], bamboo: [5.2, 1.6, 4.0], mikan: [1.9, 1.5, 1.3] };
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
  // b. out of tree crowns: under the crown if there is room, otherwise closer
  const hit = SEE.inCrown(want.x, want.y, want.z, 1.05);
  if (hit) {
    const low = hit.bottom - 0.35, gy = Math.max(groundH(want.x, want.z), 0) + 0.6;
    if (low > Math.max(gy, T.y - 0.25)) want.y = low;
    else { const dir = want.clone().sub(T), L = dir.length(); dir.normalize(); let lo = 1.3, hi = L; for (let k = 0; k < 7; k++) { const m = (lo + hi) / 2, p = T.clone().addScaledVector(dir, m); if (SEE.inCrown(p.x, p.y, p.z, 1.05)) hi = m; else lo = m; } want.copy(T).addScaledVector(dir, lo); }
  }
  const delta = want.sub(cam), k = Math.min(1, dt * 7);
  SEE.adj.lerp(delta, delta.lengthSq() > SEE.adj.lengthSq() ? Math.min(1, dt * 12) : k);
  if (SEE.adj.lengthSq() > 1e-6) { camera.position.add(SEE.adj); camera.lookAt(T); }
};
{ const _u = updateCamera; updateCamera = function (dt) { const r = _u.apply(this, arguments);
  const on = !SEE.disabled && CAM.mode === 'third' && !GAME.inside && !window.__freecam && GAME.modal !== 'title' && !(GAME.camOverride && GAME.camOverride());
  if (on) {
    const now = performance.now();
    if (!SEE.grid || now - (SEE.sigT || 0) > 1500) { SEE.sigT = now; const sig = ((VEG.items || []).length) + ':' + (VEG.removed ? VEG.removed.reduce((a, b) => a + b, 0) : 0) + ':' + (VEG.userTrees || []).length; if (sig !== SEE.sig) { SEE.sig = sig; SEE.buildGrid(); } }
    if (!SEE.noFix) try { SEE.fix(dt || 0.016); } catch (e) { }
  } else SEE.adj.set(0, 0, 0);
  SEE.on.value = on ? 1 : 0; if (on) SEE.p.value.copy(CAM.target); return r; }; }
