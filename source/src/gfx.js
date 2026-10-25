// ===================== GFX: atmosphere (aerial haze, morning mist, sun-side glow) + 高画質モード =====================
// Every material that uses fog gets the same physically-motivated fog:
//  - exponential aerial haze by distance (density per metre, set per weather / time of day)
//  - ground-hugging morning mist that thins with height (strong at dawn, gone by ~9:30)
//  - fog colour brightens toward the sun, using the same glow curve as the sky dome, so far hills melt into the sky
const GFX = { hq: false, gtao: null, aoCam: null, _swS: null, _swT: 0, mistDay: 1,
  wetT: 0, U: { wet: { x: 0, y: 0 }, fogX: { x: 0.00045, y: 0, z: 1.0, w: 0 }, fogSun: { x: 0, y: 1, z: 0 }, fogSunCol: { x: 0, y: 0, z: 0 } } };
try { GFX.hq = localStorage.getItem('hoshinami.hq') === '1'; } catch (e) { }
const SKY_GLOW_GLSL = `float skyGlow(float s, float lowK){ return pow(s, 3.0) * 0.06 + pow(s, 14.0) * 0.18 + pow(s, 5.0) * 0.32 * lowK; }`;
(() => {
  const SC = THREE.ShaderChunk;
  SC.fog_pars_vertex = '#ifdef USE_FOG\n varying float vFogDepth; varying vec3 vFogW;\n#endif';
  // world-space offset camera -> vertex: R^T * mvPosition (rows of the view rotation are the columns of viewMatrix)
  SC.fog_vertex = '#ifdef USE_FOG\n vFogW = vec3(dot(viewMatrix[0].xyz, mvPosition.xyz), dot(viewMatrix[1].xyz, mvPosition.xyz), dot(viewMatrix[2].xyz, mvPosition.xyz)); vFogDepth = length(mvPosition.xyz);\n#endif';
  SC.fog_pars_fragment = `#ifdef USE_FOG
  uniform vec3 fogColor; varying float vFogDepth; varying vec3 vFogW;
  uniform vec4 fogX; uniform vec3 fogSun; uniform vec3 fogSunCol;
  ${SKY_GLOW_GLSL}
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear; uniform float fogFar;
  #endif
#endif`;
  SC.fog_fragment = `#ifdef USE_FOG
  { float fd = length(vFogW); vec3 fdir = vFogW / max(fd, 1e-3); float fh = cameraPosition.y + vFogW.y; // per-pixel distance: big low-poly planes (the sea) interpolate vFogW exactly, but not a per-vertex length
    float haze = 1.0 - exp(-fd * fogX.x);
    float mist = clamp(fogX.y * (1.0 - exp(-fd * 0.022)) * exp(-max(fh - fogX.z, 0.0) * 0.3), 0.0, 0.92); // a low layer: sea and lowland white, hilltops clear
    float sd = max(dot(fdir, fogSun), 0.0);
    vec3 fcol = fogColor + fogSunCol * skyGlow(sd, fogX.w);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fcol, haze);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, min(fcol * 1.1 + 0.025, vec3(1.0)), mist); }
#endif`;
  // wet surfaces after rain: upward-facing surfaces darken and turn glossy (they pick up the sky in the environment map)
  SC.roughnessmap_pars_fragment = SC.roughnessmap_pars_fragment + `
uniform vec2 uWet;
float pudH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float pudN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(pudH(i), pudH(i + vec2(1.0, 0.0)), f.x), mix(pudH(i + vec2(0.0, 1.0)), pudH(i + vec2(1.0, 1.0)), f.x), f.y); }`;
  SC.roughnessmap_fragment = SC.roughnessmap_fragment + `
#ifndef FLAT_SHADED
  if (uWet.x > 0.001) { vec3 upV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz); float up = smoothstep(0.5, 0.92, dot(normalize(vNormal), upV));
    float wm = uWet.x * mix(0.3, 1.0, up); roughnessFactor = mix(roughnessFactor, min(roughnessFactor, 0.2), uWet.x * up * 0.9); diffuseColor.rgb *= 1.0 - 0.32 * wm;
  #ifdef USE_FOG
    { float flt = smoothstep(0.955, 0.985, dot(normalize(vNormal), upV)); vec2 wq = (cameraPosition + vFogW).xz; float pn = pudN(wq * 0.21) * 0.68 + pudN(wq * 0.93) * 0.32;
      float pud = smoothstep(0.64, 0.7, pn) * flt * smoothstep(0.5, 0.9, uWet.x); roughnessFactor = mix(roughnessFactor, 0.03, pud); diffuseColor.rgb *= 1.0 - 0.38 * pud; } // puddles
  #endif
  }
#endif`;
  for (const k of ['standard', 'physical']) THREE.ShaderLib[k].uniforms.uWet = { value: GFX.U.wet };
  // share the extra uniforms with every built-in material and with ShaderMaterials that merge UniformsLib.fog.
  // Plain {x,y,z} objects are passed by reference by UniformsUtils.clone, so updating GFX.U reaches every program.
  const add = u => { u.fogX = { value: GFX.U.fogX }; u.fogSun = { value: GFX.U.fogSun }; u.fogSunCol = { value: GFX.U.fogSunCol }; };
  add(THREE.UniformsLib.fog);
  for (const k in THREE.ShaderLib) { const s = THREE.ShaderLib[k]; if (s && s.uniforms && s.uniforms.fogColor) add(s.uniforms); }
})();
// one mist "mood" per day: some mornings are clear, some are a white sea of mist (more often in autumn)
GFX.dayMist = function () {
  const d = new Date(), key = d.getFullYear() * 400 + (d.getMonth() + 1) * 32 + d.getDate();
  if (GFX._mk === key) return GFX.mistDay; GFX._mk = key;
  const r = ((Math.sin(key * 12.9898) * 43758.5453) % 1 + 1) % 1, m = d.getMonth() + 1, autumn = m >= 9 && m <= 11 ? 1 : m >= 3 && m <= 5 ? 0.7 : 0.45;
  return GFX.mistDay = Math.min(1.25, (0.3 + r * 0.9) * (0.6 + autumn * 0.5));
};
GFX.atmo = function (hf, r, weather) {
  const U = GFX.U, night = r.night, wet = weather === 'rain' || weather === 'storm', snow = weather === 'snow', cloudy = weather === 'cloudy';
  const storm = weather === 'storm'; let d = 0.00042; if (cloudy) d = 0.0007; if (wet) d = storm ? 0.0034 : 0.0026; if (snow) d = 0.0019;
  { const k = Math.min(1, (r.dt || 0.016) * 0.5); VEG.uWind.value += ((storm ? 3.4 : wet ? 1.5 : cloudy ? 1.15 : 1) - VEG.uWind.value) * k; if (waterMat) waterMat.uniforms.uStorm.value += ((storm ? 1 : wet ? 0.3 : 0) - waterMat.uniforms.uStorm.value) * k; } // wind in the trees, choppy sea
  const dawn = sstep(4.6, 5.8, hf) * (1 - sstep(7.4, 9.6, hf)), eve = sstep(16.6, 17.8, hf) * (1 - sstep(19.0, 20.2, hf));
  d *= (1 + eve * 0.45 + dawn * 0.35) * (1 - night * 0.3);
  let m = dawn * 0.78 * GFX.dayMist() * (cloudy ? 1.15 : 1) + eve * 0.05 + (wet ? 0.18 : 0) + (snow ? 0.12 : 0) + night * 0.05;
  if (GFX.force) { if (GFX.force.d !== undefined) d = GFX.force.d; if (GFX.force.m !== undefined) m = GFX.force.m; }
  U.fogX.x = d; U.fogX.y = Math.min(0.95, m); U.fogX.z = 1.4;
  VEG.uDayK.value = (1 - night) * (1 - eve * 0.35) * (wet ? 0.55 : cloudy || snow ? 0.75 : 1); // foliage translucency glow: none at night
  const sd = r.sunDir; U.fogSun.x = sd.x; U.fogSun.y = sd.y; U.fogSun.z = sd.z;
  U.fogX.w = (1 - sstep(0.0, 0.32, sd.y)) * (sd.y > -0.08 ? 1 : 0);
  const sc = SKY.mat.uniforms.sunCol.value, k = wet ? 0.15 : cloudy || snow ? 0.4 : 1;
  U.fogSunCol.x = sc.r * k; U.fogSunCol.y = sc.g * k; U.fogSunCol.z = sc.b * k;
  // wetness: soaks in over ~40 s of rain, dries over ~6 minutes
  const dt = Math.min(0.1, r.dt || 0.016), wt = wet ? 1 : snow ? 0.35 : 0; U.wet.x += (wt - U.wet.x) * Math.min(1, dt / (wt > U.wet.x ? 40 : 360)); if (GFX.force && GFX.force.wet !== undefined) U.wet.x = GFX.force.wet;
  for (const c of SKY.clouds) { c.material.color.multiplyScalar(wet ? 0.78 : cloudy || snow ? 0.9 : 1); c.material.opacity = wet ? 0.38 : cloudy || snow ? 0.72 : 0.95; } // under an overcast deck the puffs melt into it
  const su = SKY.mat.uniforms;
  if (su.fogC) { su.fogC.value.copy(scene.fog.color); su.lowK.value = U.fogX.w * k; su.time.value = performance.now() / 1000; su.cloudC.value.copy(r.sky.cloud).multiplyScalar(storm ? 0.52 : wet ? 0.8 : 1);
    su.cirrus.value = wet ? 0 : cloudy ? 1.1 : snow ? 0.3 : 0.15 + 0.75 * ((GFX.dayMist() * 7.31) % 1); su.ovc.value = wet ? 1 : snow ? 0.85 : cloudy ? 0.55 : 0; }
  // heavy weather on screen: rain sheets (a typhoon's are thick and slanted) and a darker exposure in a storm
  if (typeof gradePass !== 'undefined' && gradePass) { const G = gradePass.uniforms, out = !GAME.inside, rk = out ? (storm ? 1 : weather === 'rain' ? 0.45 : 0) : 0; G.rainK.value += (rk - G.rainK.value) * Math.min(1, dt * 1.5); G.rtime.value += dt; G.slant.value = storm ? 0.42 : 0.06; G.aspect.value = innerWidth / Math.max(1, innerHeight);
    if (RAIN) RAIN.material.opacity = storm ? 0.62 : 0.42; const ex = out ? (storm ? 0.66 : wet ? 0.86 : 1) : 1; renderer.toneMappingExposure += (ex - renderer.toneMappingExposure) * Math.min(1, dt * 1.2); if (GFX.force && GFX.force.storm) { G.rainK.value = rk; renderer.toneMappingExposure = ex; } }
};
// real sunrise / sunset for the Seto Inland Sea (34.35°N 133.5°E) by date; the sky's colour keys assume sunrise 5:36 and sunset 18:36,
// so in real-time mode the clock hour is remapped onto them (late October: sunrise ≈6:20, sunset ≈17:15). Preset times (朝・昼・夕方・夜) stay as they are.
GFX.sunTimes = function (d = new Date()) {
  const key = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate(); if (GFX._stK === key) return GFX._st; GFX._stK = key;
  const N = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5), B = 2 * Math.PI * (N - 81) / 364, eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const R = Math.PI / 180, dec = 23.44 * R * Math.sin(2 * Math.PI * (284 + N) / 365), lat = 34.35 * R, cosH = (Math.sin(-0.833 * R) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec));
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / R / 15, noon = 12 + (135 - 133.5) / 15 - eot / 60; return GFX._st = [noon - H, noon + H];
};
GFX.solarHour = function (h) { const [a, b] = GFX.sunTimes(); return h < a ? h / a * 5.6 : h < b ? 5.6 + (h - a) / (b - a) * 13 : 18.6 + (h - b) / (24 - b) * 5.4; };
{ const _us = updateSky; updateSky = function (hf, focus, cam, dt, weather) { const h = TIME.mode === 'real' ? GFX.solarHour(hf) : hf; const r = _us(h, focus, cam, dt, weather); r.dt = dt; GFX.atmo(h, r, weather); return r; }; }

// ---------- 高画質モード ----------
// light (default): pixel ratio ≤1.5, 2048 shadow map, no AO.  高画質: ≤2× pixels, 4096 shadow map over a wider area,
// ground-truth ambient occlusion (contact shadows under eaves, furniture, cars, people), sharper textures.
GFX.aoSweep = function (sc) {
  const now = performance.now(); if (sc === GFX._swS && now - GFX._swT < 700) return; GFX._swS = sc; GFX._swT = now;
  const okM = m => m && !m.transparent && !(m.alphaTest > 0) && m.depthWrite !== false && m.visible !== false && !(m.userData && m.userData.noAO);
  sc.traverse(o => { if (!o.isMesh) return; const m = o.material, ok = o !== SKY.dome && (Array.isArray(m) ? m.every(okM) : okM(m)); if (ok) o.layers.enable(2); else o.layers.disable(2); });
};
GFX.makeAO = function () {
  const g = new GTAOPass(scene, camera, 64, 64);
  g.updateGtaoMaterial({ radius: 0.8, distanceExponent: 1.3, thickness: 1.4, scale: 1.4, samples: 12, distanceFallOff: 1.0, screenSpaceRadius: false });
  g.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 7, rings: 2, samples: 12 });
  g.blendIntensity = 1.0;
  GFX.aoCam = new THREE.PerspectiveCamera(); g.camera = GFX.aoCam; g.gtaoMaterial.defines.PERSPECTIVE_CAMERA = 1;
  // our own visibility handling: only opaque meshes on layer 2 go into the normal/depth pre-pass (no per-frame scene walk twice)
  g.overrideVisibility = () => { }; g.restoreVisibility = () => { };
  const r0 = g.render.bind(g), s0 = g.setSize.bind(g);
  g.setSize = (w, h) => { const k = Math.min(1, Math.sqrt(2.4e6 / Math.max(1, w * h))); s0(Math.round(w * k), Math.round(h * k)); };
  g.render = function (rd, wb, rb, dt, mask) {
    const cam = GAME_RP.camera, sc = GAME_RP.scene; GFX.aoCam.copy(cam, false); GFX.aoCam.layers.set(2); g.scene = sc; GFX.aoSweep(sc);
    // the beauty pass already rendered the shadow maps and updated world matrices this frame
    const au = rd.shadowMap.autoUpdate, mw = sc.matrixWorldAutoUpdate; rd.shadowMap.autoUpdate = false; sc.matrixWorldAutoUpdate = false;
    try { r0(rd, wb, rb, dt, mask); } finally { rd.shadowMap.autoUpdate = au; sc.matrixWorldAutoUpdate = mw; }
  };
  composer.insertPass(g, 1); return g;
};
GFX.apply = function () {
  if (!renderer || !composer) return; const hq = GFX.hq;
  const pr = hq ? Math.min(2, Math.max(1.25, devicePixelRatio)) : Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(pr); composer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight);
  const sh = SKY.sun.shadow, ms = hq ? 4096 : 2048, ext = hq ? 62 : 45;
  if (sh.mapSize.x !== ms) { sh.mapSize.set(ms, ms); if (sh.map) { sh.map.dispose(); sh.map = null; } }
  const c = sh.camera; c.left = c.bottom = -ext; c.right = c.top = ext; c.updateProjectionMatrix(); sh.normalBias = hq ? 0.03 : 0.04;
  if (hq && !GFX.gtao) { try { GFX.gtao = GFX.makeAO(); } catch (e) { console.warn('GTAO unavailable', e); GFX.gtao = null; } }
  if (GFX.gtao) GFX.gtao.enabled = hq;
  const an = hq ? Math.min(16, renderer.capabilities.getMaxAnisotropy()) : 8;
  for (const k in TEX) { const t = TEX[k]; if (t && t.isTexture && t.generateMipmaps !== false && t.anisotropy !== an && t.minFilter === THREE.LinearMipmapLinearFilter) { t.anisotropy = an; t.needsUpdate = true; } }
  const b = document.getElementById('hqBtn'); if (b) { b.classList.toggle('on', hq); b.title = hq ? '高画質：ON（重いときは OFF に）' : '高画質：OFF（軽量）'; }
};
GFX.set = function (on) { GFX.hq = !!on; try { localStorage.setItem('hoshinami.hq', GFX.hq ? '1' : '0'); } catch (e) { } GFX.apply(); };
{ const _ui = UI.init; UI.init = function () { const r = _ui.apply(this, arguments);
  const card = document.querySelector('#hud .card.ctl'); if (card && !document.getElementById('hqBtn')) { const row = document.createElement('div'); row.className = 'row'; row.id = 'gBtns'; card.appendChild(row); const b = document.createElement('button'); b.id = 'hqBtn'; b.textContent = '✨ 高画質'; b.onclick = e => { e.stopPropagation(); GFX.set(!GFX.hq); UI.toast && UI.toast(GFX.hq ? '✨ 高画質モード：影・陰影・解像度を上げました（重い場合はもう一度押すと軽量に戻ります）' : '軽量モードにもどしました'); document.getElementById('c').focus(); }; row.appendChild(b); }
  GFX.apply(); return r; }; }
