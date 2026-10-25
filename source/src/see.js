// ===================== カメラ: 木の葉や幹でキャラが隠れないように（カメラとキャラの間だけ、葉を透かす） =====================
// Only the leaves/trunks on the line between the camera and you are dissolved (screen-door dither), plus anything the camera
// is right inside of. Shadows are untouched (they use their own depth material), so the forest still looks like a forest.
const SEE = { p: { value: new THREE.Vector3() }, on: { value: 0 }, mats: new Set() };
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
        float pd = length(vSeeW - (cameraPosition + ab * t)), rr = mix(1.0, 1.8, t);
        float k = smoothstep(rr, rr * 0.45, pd) * smoothstep(0.985, 0.88, t);
        k = max(k, smoothstep(2.6, 1.2, length(vSeeW - cameraPosition)));
        float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        if (ign < k * 0.9) discard;
      }`);
  };
  m.needsUpdate = true;
};
SEE.patchTrees = function () {
  for (const st of VEG.sets || []) if (st.kind === 'tree') SEE.patch(st.mesh.material);
  for (const k in VEG.userSets || {}) for (const st of VEG.userSets[k] || []) st && st.mesh && SEE.patch(st.mesh.material);
};
{ const _b = buildVegetation; buildVegetation = function () { const r = _b.apply(this, arguments); try { SEE.patchTrees(); } catch (e) { console.warn('see', e); } return r; }; }
{ const _u = updateCamera; updateCamera = function (dt) { const r = _u.apply(this, arguments);
  const on = !SEE.disabled && CAM.mode === 'third' && !GAME.inside && !window.__freecam && GAME.modal !== 'title' && !(GAME.camOverride && GAME.camOverride());
  SEE.on.value = on ? 1 : 0; if (on) SEE.p.value.copy(CAM.target); return r; }; }
