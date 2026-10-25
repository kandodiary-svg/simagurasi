// ===================== MAIN =====================
let renderer, scene, camera;
const TIME = { mode: 'real', hf: 12, weather: 'clear' };
let RAIN = null, composer = null, gradePass = null, GAME_RP = null;
async function init() {
  const ld = document.getElementById('loading'); const step = t => new Promise(r => { ld.textContent = t; setTimeout(r, 16); });
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(55, 1, 0.1, 9000);
  const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt); GAME_RP = new RenderPass(scene, camera); composer.addPass(GAME_RP);
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.32, 0.6, 0.86); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // display grade (after tone mapping, sRGB): near-neutral saturation with the lime greens tamed, gentle filmic contrast,
  // warm highlights / cool shadows, soft vignette
  gradePass = new ShaderPass({ uniforms: { tDiffuse: { value: null }, sat: { value: 1.05 }, gsat: { value: 0.8 }, warm: { value: 0.022 }, con: { value: 0.16 }, vig: { value: 0.2 }, rainK: { value: 0 }, rtime: { value: 0 }, slant: { value: 0 }, aspect: { value: 1.7 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float sat, gsat, warm, con, vig, rainK, rtime, slant, aspect; varying vec2 vUv;
      float rh(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
      vec3 rainLayer(vec2 uv, float cols, float sp, float len, float seed){ float u = (uv.x + (uv.y - 0.5) * slant / aspect) * cols; float cx = floor(u), fx = fract(u); float r1 = rh(cx + seed), r2 = rh(cx * 1.7 + seed + 3.1);
        float y = fract(uv.y * (1.2 + r2) + rtime * sp * (0.8 + r1 * 0.5) + r1 * 9.0); float seg = smoothstep(0.0, 0.015, y) * (1.0 - smoothstep(0.015, len, y)); float w = 1.0 - smoothstep(0.08, 0.45, abs(fx - 0.5)); return vec3(seg * w * step(0.45, r2)); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(0.2126,0.7152,0.0722));
        float gw = clamp((c.g - max(c.r, c.b)) * 5.0, 0.0, 1.0) * smoothstep(0.05, 0.25, c.g);
        c.rgb = mix(vec3(l), c.rgb, sat * mix(1.0, gsat, gw)); c.r += 0.025 * gw * c.g;
        c.rgb += vec3(warm, warm * 0.45, -warm * 0.8) * smoothstep(0.35, 0.95, l) + vec3(-0.008, 0.0, 0.012) * (1.0 - smoothstep(0.0, 0.3, l));
        c.rgb = clamp(c.rgb, 0.0, 1.0); c.rgb = mix(c.rgb, c.rgb * c.rgb * (3.0 - 2.0 * c.rgb), con);
        if (rainK > 0.001) { // rain sheets in screen space (near streaks long and faint, far ones short and fine) + a grey, damp cast
          vec3 rn = rainLayer(vUv, 260.0, 2.6, 0.22, 0.0) * 0.55 + rainLayer(vUv, 120.0, 3.4, 0.38, 7.0) * 0.45; c.rgb = mix(c.rgb, vec3(dot(c.rgb, vec3(0.333))) * vec3(0.93, 0.96, 1.0), rainK * 0.22); c.rgb += vec3(0.78, 0.82, 0.88) * rn * rainK * 0.2; }
        float d = distance(vUv, vec2(0.5)); c.rgb *= 1.0 - vig * smoothstep(0.38, 0.88, d); gl_FragColor = c; }` });
  composer.addPass(gradePass);
  const rs = () => { renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }; addEventListener('resize', rs); rs();
  const t0 = performance.now();
  await step('景色の質感をつくっています…'); makeTextures();
  await step('島の地形をつくっています…'); initWorldData();
  await step('海と空を広げています…'); buildSky(scene); buildTerrain(scene); buildRoadMeshes(scene); buildWater(scene);
  await step('家と港を建てています…'); buildStructures(scene);
  await step('木と草花を植えています…'); buildVegetation(scene);
  await step('人と乗り物を準備しています…'); await loadModels(); spawnPlayer(scene); spawnVehicles(scene); spawnVillagers(scene); initEdit(scene); FX.scene = scene; buildRain();
  UI.init(); initInput(); GAME.init();
  window.__loadMs = performance.now() - t0; window.__stats = { trees: VEG.count, tufts: VEG.tufts };
  ld.hidden = true; document.getElementById('c').focus();
  requestAnimationFrame(loop);
}
function buildRain() {
  const n = 1600, p = new Float32Array(n * 6), len = new Float32Array(n); for (let k = 0; k < n; k++) { const x = (Math.random() - 0.5) * 60, y = Math.random() * 30, z = (Math.random() - 0.5) * 60, L = 0.45 + Math.random() * 0.75; len[k] = L; p.set([x, y, z, x - 0.1 * L, y - L, z - 0.03 * L], k * 6); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  RAIN = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#c8d8e4', transparent: true, opacity: 0.42 })); RAIN.userData.len = len; RAIN.frustumCulled = false; RAIN.visible = false; scene.add(RAIN);
}
function initInput() {
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return; if (GAME.onKey(e)) return; KEYS[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (GAME.inside) {
      if (e.code === 'KeyB' && !e.repeat) { GAME.toggleRoomEdit(); return; }
      if (e.code === 'KeyC' && !e.repeat) { GAME.openCatalog(); return; }
      if (e.code === 'KeyR' && !e.repeat && GAME.roomEdit && ROOM.pick) { ROOM.pick.rot = ((ROOM.pick.rot || 0) + Math.PI / 2) % (Math.PI * 2); return; }
      if (e.code === 'Escape' && GAME.roomEdit) { if (ROOM.pick) { const H = GAME.home(); ROOM.pick = null; ROOM.sel = null; if (ROOM.ghost) { ROOM.scene.remove(ROOM.ghost); ROOM.ghost = null; } GAME.roomEditPanel(); } else GAME.toggleRoomEdit(false); return; }
      if (e.code === 'Space' && !e.repeat) { e.preventDefault(); if (UI._choices) { UI._choices[UI._choices.length - 1].f(); return; } if (advanceTalk()) return; if (!GAME.roomEdit) GAME.roomAct(); return; }
      if (['KeyV', 'KeyF'].includes(e.code)) return;
    }
    if (e.code === 'KeyB' && !e.repeat) { toggleEdit(); return; }
    if (EDIT.on) {
      if (e.code === 'BracketRight' || e.code === 'Equal') { EDIT.r = Math.min(14, EDIT.r + 1); UI.editPanel(); }
      if (e.code === 'BracketLeft' || e.code === 'Minus') { EDIT.r = Math.max(2, EDIT.r - 1); UI.editPanel(); }
      if (e.code === 'KeyZ' && !e.repeat) undoEdit();
      if (e.code === 'Enter' && EDIT.tool === 'road') finishRoad();
      if (e.code === 'Backspace' && EDIT.tool === 'road') { EDIT.nodes.pop(); updateRoadPreview(EDIT.hover); }
      if (e.code === 'Escape') { if (EDIT.nodes.length) { EDIT.nodes = []; updateRoadPreview(null); } else toggleEdit(false); }
      const dm = e.code.match(/^Digit(\d)$/); if (dm && !e.repeat) { const t = TOOLS[(+dm[1] + 9) % 10]; if (t) setTool(t.id); }
      if (e.code === 'KeyH' && !e.repeat) setTool('house');
      if (e.code === 'KeyK' && !e.repeat) setTool('decor');
      if (e.code === 'KeyR' && !e.repeat && EDIT.tool === 'decor') EDIT.dRot = ((EDIT.dRot || 0) + Math.PI / 4) % (Math.PI * 2);
      if (e.code === 'KeyR' && !e.repeat && EDIT.tool === 'house') { EDIT.hRotOff = ((EDIT.hRotOff || 0) + Math.PI / 2) % (Math.PI * 2); EDIT.housePick = null; UI.editPanel(); }
      if (e.code === 'Space') return;
    }
    if (e.code === 'KeyV' && !e.repeat) { setViewMode(CAM.mode === 'first' ? 'third' : 'first'); return; }
    if (e.code === 'KeyF' && !e.repeat) { GAME.fishKey(); return; }
    if (UI._choices && /^Digit[1-9]$/.test(e.code)) { const o = UI._choices[+e.code.slice(5) - 1]; if (o) { o.f(); return; } }
    if (e.code === 'Space' && !e.repeat) { if (GAME.fishing()) { GAME.fishKey(); return; } if (UI._choices) { UI._choices[UI._choices.length - 1].f(); return; } if (PL.veh && (PL.veh.kind === 'bus' || PL.veh.kind === 'ferry')) { GAME.rideKey(); return; } if (advanceTalk()) return; const n = !PL.veh && nearVillager(); if (n) { startTalk(n); return; } if (GAME.interact()) return; toggleVehicle(); }
  });
  addEventListener('keyup', e => KEYS[e.code] = false); addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = false; });
  const cv = document.getElementById('c'); let lx = 0, ly = 0;
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerdown', e => { if (GAME.blocking()) return; cv.setPointerCapture(e.pointerId); cv.focus(); lx = e.clientX; ly = e.clientY; EDIT.mouse = { x: e.clientX, y: e.clientY };
    if (GAME.inside) { if (GAME.roomEdit && e.button === 0) GAME.roomClick(); return; }
    if (EDIT.on && e.button === 0) { editPointerDown(e); return; } CAM.drag = true; });
  cv.addEventListener('pointermove', e => { EDIT.mouse = { x: e.clientX, y: e.clientY }; if (!CAM.drag) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; CAM.lastDrag = performance.now() / 1000;
    if (CAM.mode === 'first') { if (PL.veh) CAM.fpLook = clamp(CAM.fpLook - dx * 0.004, -1.6, 1.6); else PL.rot -= dx * 0.004; CAM.fpPitch = clamp(CAM.fpPitch - dy * 0.003, -0.9, 0.9); }
    else { CAM.yaw -= dx * 0.005; CAM.pitch = clamp(CAM.pitch + dy * 0.004, -0.15, 1.35); } });
  cv.addEventListener('pointerup', () => { CAM.drag = false; editPointerUp(); });
  cv.addEventListener('pointerleave', () => { EDIT.mouse = null; });
  cv.addEventListener('dblclick', () => { if (EDIT.on && EDIT.tool === 'road') finishRoad(); });
  cv.addEventListener('wheel', e => { e.preventDefault(); if (CAM.mode === 'first') return; CAM.distT = clamp(CAM.distT * (e.deltaY > 0 ? 1.12 : 0.9), 2.5, EDIT.on ? 90 : PL.veh ? 30 : 18); }, { passive: false });
}
function currentHour() { if (TIME.mode === 'real') { const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; } return TIME.hf; }
let last = performance.now(), T = 0, hudT = 0;
function loop(now) {
  requestAnimationFrame(loop); const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  const lockIn = !!DIALOG.npc || GAME.blocking() || GAME.fishing(); if (GAME.blocking()) for (const k in KEYS) KEYS[k] = false;
  if (GAME.inside) GAME.updateRoom(dt); else updatePlayer(dt, lockIn); updateVehicles(dt, lockIn); updateVillagers(dt, DIALOG.npc); if (DIALOG.npc && Math.hypot(DIALOG.npc.x - PL.x, DIALOG.npc.z - PL.z) > 4) advanceTalk(); if (GAME.modal === 'title') GAME.titleCam(T); else if (GAME.inside || GAME.camOverride()) { } else if (!window.__freecam) updateCamera(dt); FX.update(dt); updateEdit(dt); GAME.update(dt);
  const hf = currentHour(), focus = new THREE.Vector3(PL.x, PL.y, PL.z);
  const st = updateSky(hf, focus, camera, dt, TIME.weather); updateStructures(T, st.night); GAME.night = st.night;
  if (waterMat) waterMat.uniforms.time.value = T; VEG.uTime.value = T;
  if (RAIN) { RAIN.visible = TIME.weather === 'rain' || TIME.weather === 'storm'; RAIN.rotation.z = TIME.weather === 'storm' ? 0.35 : 0; if (RAIN.visible) { const p = RAIN.geometry.attributes.position; for (let k = 0; k < p.count; k += 2) { const L = RAIN.userData.len[k >> 1]; let y = p.getY(k) - (20 + L * 12) * dt; if (y < 0) y += 30; p.setY(k, y); p.setY(k + 1, y - L); } p.needsUpdate = true; RAIN.position.set(camera.position.x, camera.position.y - 12, camera.position.z); } }
  hudT -= dt; if (hudT < 0) { hudT = 0.5; UI.clock(hf); }
  const v = !PL.veh && nearVehicle(), nv = !PL.veh && !DIALOG.npc && nearVillager();
  const gp = GAME.inside ? GAME.roomPrompt() : GAME.prompt();
  UI.prompt(EDIT.on || DIALOG.npc || GAME.blocking() ? '' : GAME.inside ? gp : nv ? `Space：${nv.def.name}と話す` : gp ? gp : PL.veh ? (PL.veh.kind === 'boat' ? (GAME.p && GAME.p.items && GAME.p.items.rod ? 'F：釣り（船を止めて）　' : '') + 'Space：おりる（岸・浜の近くで）　W/S 前進・後退　A/D かじ' : 'Space：おりる　W/S アクセル・ブレーキ　A/D ハンドル') : v ? `Space：${v.kind === 'boat' ? '漁船' : (v.name || '軽トラ')}に乗る` : '');
  if (!window.__manual) composer.render(dt);
}
window.DBG = {
  snap() { const t = performance.now(); if (GAME.modal === 'title') GAME.titleCam(T); else if (GAME.inside) GAME.updateRoom(0.5); else if (GAME.camOverride()) { } else if (!window.__freecam) updateCamera(0.016); const st = updateSky(currentHour(), new THREE.Vector3(PL.x, PL.y, PL.z), camera, 0.016, TIME.weather); updateStructures(T, st.night); composer.render(0.016); renderer.getContext().finish(); return performance.now() - t; },
  cam(px, py, pz, tx, ty, tz) { window.__freecam = true; camera.position.set(px, py, pz); camera.lookAt(tx, ty, tz); },
  time(h) { TIME.mode = 'fixed'; TIME.hf = h; }, P: () => PLACED, gh: (x, z) => groundH(x, z), PL: () => PL, VEH: () => VEH.map(v => ({ kind: v.kind, x: v.x, z: v.z })),
  step(n, dt = 0.05) { for (let i = 0; i < n; i++) { updatePlayer(dt, false); updateVehicles(dt, false); updateVillagers(dt, DIALOG.npc); if (!window.__freecam) updateCamera(dt); FX.update(dt); } },
  key(code, on) { KEYS[code] = on; }, act() { return toggleVehicle(); }, run(code) { return eval(code); },
};
init();
