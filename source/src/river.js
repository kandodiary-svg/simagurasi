// ===================== 川の表現: 流れる向き・速さのある水面（フローマップ）、白波・岸の泡、澄んだ浅瀬、川岸のヨシと石 =====================
let riverMat = null;
const RIV = { pts: null, sp: null, reeds: null };
// downstream direction and speed along the river (pts go from the spring to the sea)
RIV.prep = function () {
  const R = G.river; if (!R || !R.pts) return; const P = R.pts, lv = R.lv, N = P.length; RIV.pts = P; RIV.sp = new Float32Array(N); RIV.dir = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) { const a = P[Math.max(0, i - 3)], b = P[Math.min(N - 1, i + 3)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; RIV.dir[i * 2] = dx / l; RIV.dir[i * 2 + 1] = dz / l;
    const la = lv ? lv[Math.max(0, i - 3)] : 0, lb = lv ? lv[Math.min(N - 1, i + 3)] : 0, drop = Math.max(0, la - lb) / l; RIV.sp[i] = clamp(0.35 + drop * 9, 0.35, 1.7); }
};
RIV.flowAt = function (x, z) {
  if (!RIV.pts) RIV.prep(); const P = RIV.pts; if (!P) return [0, 0]; let bi = -1, bd = 1e9;
  for (let i = 0; i < P.length; i += 2) { const d = (P[i][0] - x) * (P[i][0] - x) + (P[i][1] - z) * (P[i][1] - z); if (d < bd) { bd = d; bi = i; } }
  const d = Math.sqrt(bd), hw = (G.river.hw && G.river.hw[bi]) || 4; if (d > hw + 12) return [0.03, 0.02]; // ponds: barely moving
  const k = 1 - clamp((d - hw * 0.6) / (hw + 10), 0, 0.85), s = RIV.sp[bi] * k; return [RIV.dir[bi * 2] * s, RIV.dir[bi * 2 + 1] * s];
};
function makeRiverMat() {
  const U = waterMat.uniforms; // shared, so time / sun / sky updates reach the rivers too
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: true, side: THREE.DoubleSide, uniforms: U,
    vertexShader: `attribute float aFoam; attribute vec2 aFlow; varying float vFoam; varying vec2 vFlow; varying vec3 vW; #include <fog_pars_vertex>
      void main(){ vFoam = aFoam; vFlow = aFlow; vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition; #include <fog_vertex> }`.replace(/#include <(\w+)>/g, '\n#include <$1>\n'),
    fragmentShader: `uniform float time, wsize, ambient; uniform vec3 sunDir, sunCol, skyCol, horCol; uniform sampler2D hTex, nTex, mTex; varying vec3 vW; varying float vFoam; varying vec2 vFlow;
      #include <common>
      #include <fog_pars_fragment>
      void main(){
        vec2 huv = (vW.xz + wsize * 0.5) / wsize; float th = texture2D(hTex, huv).r; float depth = max(0.0, vW.y - th);
        vec3 gN = normalize(cross(dFdx(vW), dFdy(vW))); float fall = 1.0 - smoothstep(0.45, 0.75, abs(gN.y));
        float sp = length(vFlow); vec2 dir = sp > 0.001 ? vFlow / sp : vec2(1.0, 0.0); vec2 perp = vec2(-dir.y, dir.x);
        // flow map: two phases of the ripple texture slide downstream and cross-fade, so the surface really moves with the current
        float ph0 = fract(time * 0.22), ph1 = fract(time * 0.22 + 0.5), wgt = abs(ph0 - 0.5) * 2.0;
        vec2 uvb = vW.xz * 0.11;
        vec3 na = texture2D(nTex, uvb - vFlow * ph0 * 1.4).xyz * 2.0 - 1.0, nb = texture2D(nTex, uvb - vFlow * ph1 * 1.4 + 0.37).xyz * 2.0 - 1.0;
        vec3 nf = mix(na, nb, wgt);
        vec3 n2 = texture2D(nTex, vW.xz * 0.31 - vFlow * time * 0.5).xyz * 2.0 - 1.0;
        float rough = 0.25 + sp * 0.6;
        vec3 N = normalize(vec3((nf.x + n2.x * 0.45) * rough, 4.0, (nf.y + n2.y * 0.45) * rough));
        vec3 V = normalize(cameraPosition - vW); float fres = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        // clear fresh water: you can see the stones in the shallows, deep pools turn green-blue
        vec3 shallow = vec3(0.22, 0.46, 0.33), mid = vec3(0.07, 0.30, 0.28), deep = vec3(0.02, 0.13, 0.14);
        vec3 wc = mix(shallow, mid, smoothstep(0.15, 1.2, depth)); wc = mix(wc, deep, smoothstep(1.2, 4.5, depth));
        float dif = 0.62 + 0.38 * max(dot(N, sunDir), 0.0); vec3 col = wc * dif * mix(vec3(1.0), sunCol, 0.5) * ambient;
        // light ripples (caustics) dancing on the bed of the shallows
        float cs = texture2D(mTex, vW.xz * 0.42 - vFlow * time * 0.25).b * texture2D(mTex, vW.xz * 0.29 + vec2(time * 0.03, -time * 0.02)).g;
        col += vec3(0.9, 0.95, 0.8) * smoothstep(0.32, 0.6, cs) * (1.0 - smoothstep(0.2, 1.4, depth)) * 0.35 * max(sunDir.y, 0.0) * ambient;
        vec3 R = reflect(-V, N); vec3 refl = mix(horCol, skyCol, clamp(R.y * 2.2, 0.0, 1.0)); col = mix(col, refl * 0.85, fres * 0.55);
        vec3 Hh = normalize(sunDir + V); float spc = pow(max(dot(N, Hh), 0.0), 300.0) * 2.0 + pow(max(dot(N, Hh), 0.0), 40.0) * 0.1; col += sunCol * spc * step(0.0, sunDir.y);
        // white water: streaks along the current, rapids where it runs fast, bubbles below steps, a thin foam line on the banks
        float st = texture2D(mTex, vec2(dot(vW.xz, perp) * 0.45, dot(vW.xz, dir) * 0.06 - time * sp * 0.35)).b;
        float streak = smoothstep(0.8, 0.95, st) * smoothstep(0.5, 1.2, sp) * 0.35;
        float rap = smoothstep(1.2, 1.7, sp) * smoothstep(0.55, 0.8, texture2D(mTex, vW.xz * 0.2 - vFlow * time * 0.6).b);
        float bub = texture2D(mTex, vW.xz * 0.35 - vFlow * time * 0.3).b;
        float bank = (1.0 - smoothstep(0.03, 0.18, depth)) * smoothstep(0.0, 0.03, depth) * smoothstep(0.5, 0.75, texture2D(mTex, vW.xz * 0.6 - vFlow * time * 0.2).g);
        float foam = clamp(streak + rap * 0.8 + bank * 0.7 + vFoam * smoothstep(0.3, 0.6, bub + vFoam * 0.3), 0.0, 1.0);
        col = mix(col, vec3(0.93, 0.97, 0.98) * ambient, foam);
        float alpha = smoothstep(0.0, 0.15, depth) * mix(0.5, 0.95, smoothstep(0.25, 2.5, depth)); alpha = max(alpha, foam * 0.85 * smoothstep(0.0, 0.08, depth)); alpha = mix(alpha, 1.0, fres * 0.55);
        if (fall > 0.0) { float hc = vW.x * 0.9 + vW.z * 0.9; float s1 = texture2D(mTex, vec2(hc * 0.35, vW.y * 0.12 + time * 0.9)).b; float s2 = texture2D(mTex, vec2(hc * 0.8, vW.y * 0.3 + time * 1.6)).g;
          vec3 fc = mix(vec3(0.62, 0.84, 0.92), vec3(0.97, 0.99, 1.0), smoothstep(0.35, 0.75, s1 * 0.6 + s2 * 0.6)) * ambient; col = mix(col, fc, fall); alpha = mix(alpha, 0.88 + s1 * 0.1, fall); }
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
}
// inland water chunks get a flow attribute and the river material
{ const _rw = rebuildWaterChunk; rebuildWaterChunk = function (cx, cz) {
  _rw(cx, cz); const m = TERR.wchunks.get(cx + ',' + cz); if (!m) return;
  if (!riverMat && waterMat) riverMat = makeRiverMat(); if (!riverMat) return;
  const pos = m.geometry.attributes.position, fl = new Float32Array(pos.count * 2), cache = new Map();
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), k = Math.round(x * 2) + ',' + Math.round(z * 2); let f = cache.get(k); if (!f) { f = RIV.flowAt(x, z); cache.set(k, f); } fl[i * 2] = f[0]; fl[i * 2 + 1] = f[1]; }
  m.geometry.setAttribute('aFlow', new THREE.BufferAttribute(fl, 2)); m.material = riverMat;
}; }
// reeds on the banks and rocks in the stream
RIV.decor = function () {
  if (RIV.group) { scene.remove(RIV.group); RIV.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  const R = G.river; if (!R || !R.pts) return; const g = RIV.group = new THREE.Group(); scene.add(g); const rnd = mulberry(9137), reeds = [], rocks = [];
  const P = R.pts;
  for (let i = 2; i < P.length - 2; i++) { const a = P[i - 1], b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, [cx, cz] = P[i];
    for (const sd of [-1, 1]) { // walk out from the middle to the bank
      let bank = null; for (let d = 1; d < 22; d += 0.5) { const x = cx + nx * d * sd, z = cz + nz * d * sd; if (isNaN(waterLevelAt(G, x, z)) || waterDepthAt(x, z) < 0.05) { bank = d; break; } }
      if (bank === null) continue;
      if (rnd() < 0.55) for (let k = 0; k < 3; k++) { const d = bank + rnd() * 2.2 - 0.6, x = cx + nx * d * sd + (rnd() - 0.5) * 1.5, z = cz + nz * d * sd + (rnd() - 0.5) * 1.5, h = groundH(x, z), L = waterLevelAt(G, x, z); if (h < 0.2 || (!isNaN(L) && L - h > 0.35) || roadDistAt(x, z) < R_HALF_ROAD() + 1.5) continue; if (collidersNear(x, z).some(c => c.r !== undefined ? Math.hypot(c.x - x, c.z - z) < c.r + 0.6 : false)) continue; reeds.push([x, Math.max(h, isNaN(L) ? h : L - 0.1), z, 0.7 + rnd() * 0.7, rnd() * 6.28]); }
      if (rnd() < 0.12) { const d = rnd() * bank * 0.8, x = cx + nx * d * sd, z = cz + nz * d * sd, L = waterLevelAt(G, x, z), h = groundH(x, z); if (!isNaN(L) && L - h < 1.1 && L - h > 0.1) rocks.push([x, h, z, 0.4 + rnd() * 0.6, L]); }
    } }
  // reed tuft: a few thin tapered blades with a brown head
  const blade = new THREE.ConeGeometry(0.035, 1.6, 3, 1, true); blade.translate(0, 0.8, 0); const parts = []; for (let k = 0; k < 6; k++) { const b = blade.clone(); b.rotateZ((rnd() - 0.5) * 0.35); b.rotateY(k / 6 * 6.28); b.translate(Math.cos(k) * 0.12, 0, Math.sin(k) * 0.12); b.scale(1, 0.75 + rnd() * 0.5, 1); parts.push(b); }
  const tg = mergeGeometries(parts.map(p => p.toNonIndexed ? p.toNonIndexed() : p)); const rm = new THREE.MeshStandardMaterial({ color: '#7f9a4a', roughness: 0.9, side: THREE.DoubleSide });
  const im = new THREE.InstancedMesh(tg, rm, Math.max(1, reeds.length)); const D = new THREE.Object3D(); reeds.forEach((r, i) => { D.position.set(r[0], r[1], r[2]); D.rotation.set(0, r[4], 0); D.scale.setScalar(r[3]); D.updateMatrix(); im.setMatrixAt(i, D.matrix); }); im.count = reeds.length; im.castShadow = true; im.receiveShadow = true; g.add(im);
  const head = new THREE.CylinderGeometry(0.05, 0.05, 0.26, 5); head.translate(0, 1.45, 0); const hm = new THREE.InstancedMesh(head, new THREE.MeshStandardMaterial({ color: '#6a4a2a', roughness: 1 }), Math.max(1, reeds.length)); let hn = 0; reeds.forEach(r => { if (r[3] < 1.0) return; D.position.set(r[0], r[1], r[2]); D.rotation.set(0, r[4], 0); D.scale.setScalar(r[3]); D.updateMatrix(); hm.setMatrixAt(hn++, D.matrix); }); hm.count = hn; g.add(hm);
  const rg = new THREE.DodecahedronGeometry(1, 0); rg.scale(1, 0.55, 0.85); const km = new THREE.InstancedMesh(rg, new THREE.MeshStandardMaterial({ color: '#8a8478', roughness: 0.95 }), Math.max(1, rocks.length)); rocks.forEach((r, i) => { D.position.set(r[0], Math.min(r[1] + r[3] * 0.35, r[4] + 0.08), r[2]); D.rotation.set(rnd(), rnd() * 6, 0); D.scale.setScalar(r[3]); D.updateMatrix(); km.setMatrixAt(i, D.matrix); }); km.count = rocks.length; km.castShadow = true; km.receiveShadow = true; g.add(km);
  RIV.n = { reeds: reeds.length, rocks: rocks.length };
};
function R_HALF_ROAD() { return 3.5; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { RIV.decor(); } catch (e) { console.warn('river decor', e); } return r; }; }
{ const _rr = refreshRegion; refreshRegion = function () { const r = _rr.apply(this, arguments); clearTimeout(RIV._t); RIV._t = setTimeout(() => { try { if (GAME.p) RIV.decor(); } catch (e) { } }, 800); return r; }; }
