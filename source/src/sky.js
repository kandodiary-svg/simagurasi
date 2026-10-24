// ===================== SKY, CLOUDS, DISTANT ISLANDS, LIGHT =====================
const SKY = { dome: null, mat: null, clouds: [], sun: null, hemi: null, isl: null };
// key colors over the day (sRGB hex), hour -> [zenith, horizon, sunColor, sunIntensity, hemiIntensity, cloudTint]
const SKYKEYS = [
  [0, '#0f1a40', '#26355e', '#8fa3e8', 0.45, 0.42, '#3a4668'],
  [4.5, '#16224e', '#3a4570', '#8fa0e0', 0.45, 0.42, '#4a5578'],
  [5.6, '#3a5a9a', '#f0a58a', '#ffb37a', 0.9, 0.5, '#ffc6a8'],
  [7.0, '#4a98e8', '#c6e8f8', '#ffe8c4', 2.6, 0.95, '#ffffff'],
  [12, '#2a8cf0', '#bfe6fa', '#fff8ec', 3.1, 1.1, '#ffffff'],
  [16, '#3a92ec', '#cceaf8', '#fff0d4', 2.9, 1.05, '#ffffff'],
  [17.6, '#6a8ad8', '#f9c0a0', '#ffc488', 2.2, 0.85, '#ffd8b8'],
  [18.4, '#d88a9a', '#f8a8a0', '#ffa878', 2.1, 0.8, '#ffc0a0'],
  [19.2, '#2c2f6a', '#6a5a8a', '#b090c0', 0.35, 0.35, '#8a7aa8'],
  [20.5, '#111c42', '#2a3862', '#8fa3e8', 0.45, 0.42, '#3a4668'],
  [24, '#0f1a40', '#26355e', '#8fa3e8', 0.45, 0.42, '#3a4668'],
];
function buildSky(scene) {
  SKY.mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, night: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float night; varying vec3 vD;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }
      void main(){ vec3 d = normalize(vD); float y = d.y;
        vec3 c = mix(hor, top, pow(clamp(y, 0.0, 1.0), 0.5)); if (y < 0.0) c = hor * 0.92;
        float s = max(dot(d, normalize(sunDir)), 0.0); c += sunCol * (pow(s, 900.0) * 6.0 + pow(s, 14.0) * 0.18 + pow(s, 3.0) * 0.06);
        vec3 q = floor(d * 420.0); float st = step(0.9975, h(q)) * night * smoothstep(0.05, 0.3, y); c += vec3(st);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  SKY.dome = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 16), SKY.mat); SKY.dome.renderOrder = -10; SKY.dome.frustumCulled = false; scene.add(SKY.dome);
  // clouds
  const R = mulberry(3);
  for (let k = 0; k < 34; k++) {
    const m = new THREE.SpriteMaterial({ map: TEX.cloud, transparent: true, depthWrite: false, fog: false, color: 0xffffff });
    const s = new THREE.Sprite(m); const a = R() * Math.PI * 2, r = 800 + R() * 1700, sc = 260 + R() * 420;
    s.position.set(Math.cos(a) * r, 180 + R() * 380, Math.sin(a) * r); s.scale.set(sc, sc * 0.5, 1); s.userData.speed = 2 + R() * 3; s.renderOrder = -5;
    scene.add(s); SKY.clouds.push(s);
  }
  // distant islands around the horizon (Seto Inland Sea)
  const isl = new THREE.Group(); const im = new THREE.MeshLambertMaterial({ color: '#6c8a8f' });
  const spots = [[0.3, 1700, 520, 90], [0.9, 2300, 800, 130], [1.7, 1500, 380, 60], [2.4, 2600, 900, 150], [2.9, 1900, 600, 110], [3.6, 2200, 700, 95], [4.3, 1600, 420, 70], [5.0, 2500, 1000, 160], [5.6, 1800, 500, 85]];
  spots.forEach(([a, r, w, h], q) => {
    const g = new THREE.PlaneGeometry(w, w * 0.55, 48, 24); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), z = p.getZ(i) / (w * 0.275); const d = Math.max(0, 1 - (x * x + z * z)); p.setY(i, d > 0 ? (Math.pow(d, 0.8) * h * (0.6 + fbm(x * 2 + q, z * 2, q, 4) * 0.8)) - 4 : -20); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, im); m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); m.rotation.y = -a + Math.PI / 2; isl.add(m);
  });
  scene.add(isl); SKY.isl = isl;
  // lights
  SKY.hemi = new THREE.HemisphereLight('#cfe6ff', '#5a6a40', 1.0); scene.add(SKY.hemi);
  SKY.sun = new THREE.DirectionalLight('#fff4e0', 3); SKY.sun.castShadow = true;
  SKY.sun.shadow.mapSize.set(2048, 2048); const sc = SKY.sun.shadow.camera; sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 260;
  SKY.sun.shadow.bias = -0.0004; SKY.sun.shadow.normalBias = 0.04; scene.add(SKY.sun); scene.add(SKY.sun.target);
  scene.fog = new THREE.Fog('#cfe8f7', 260, 3200);
}
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
const ENV = { scene: null, mesh: null, pmrem: null, rt: null, key: '' };
function updateEnv(s, sunDir, night, weather) {
  const key = s.top.getHexString() + s.hor.getHexString() + weather; if (key === ENV.key) return; ENV.key = key;
  if (!ENV.scene) {
    ENV.scene = new THREE.Scene(); ENV.pmrem = new THREE.PMREMGenerator(renderer);
    const g = new THREE.SphereGeometry(10, 32, 16); g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    ENV.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })); ENV.scene.add(ENV.mesh);
    ENV.sun = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); ENV.scene.add(ENV.sun);
  }
  const p = ENV.mesh.geometry.attributes.position, c = ENV.mesh.geometry.attributes.color, top = s.top.clone().lerp(new THREE.Color('#fff4e4'), night > 0.5 ? 0.1 : 0.55).convertSRGBToLinear(), hor = s.hor.clone().lerp(new THREE.Color('#fff0dc'), night > 0.5 ? 0.1 : 0.45).convertSRGBToLinear(), gnd = new THREE.Color(night > 0.5 ? '#141a24' : '#8a9a5a').convertSRGBToLinear(), tc = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 10; if (y >= 0) tc.copy(hor).lerp(top, Math.pow(y, 0.6)); else tc.copy(hor).lerp(gnd, Math.min(1, -y * 3)); c.setXYZ(i, tc.r, tc.g, tc.b); }
  c.needsUpdate = true;
  ENV.sun.position.copy(sunDir).multiplyScalar(8); ENV.sun.material.color.copy(s.sunCol).convertSRGBToLinear().multiplyScalar(sunDir.y > 0 ? 6 : 0);
  if (ENV.rt) ENV.rt.dispose(); ENV.rt = ENV.pmrem.fromScene(ENV.scene, 0.02); scene.environment = ENV.rt.texture;
}
function skyAt(hf) {
  let a = SKYKEYS[0], b = SKYKEYS[1];
  for (let i = 0; i < SKYKEYS.length - 1; i++) if (hf >= SKYKEYS[i][0] && hf < SKYKEYS[i + 1][0]) { a = SKYKEYS[i]; b = SKYKEYS[i + 1]; }
  const t = (hf - a[0]) / (b[0] - a[0]);
  const col = i => new THREE.Color(a[i]).lerp(new THREE.Color(b[i]), t);
  return { top: col(1), hor: col(2), sunCol: col(3), sunI: lerp(a[4], b[4], t), hemiI: lerp(a[5], b[5], t), cloud: col(6) };
}
function updateSky(hf, focus, cam, dt, weather) {
  const s = skyAt(hf);
  const wet = weather === 'rain', cloudy = weather === 'cloudy' || wet || weather === 'snow';
  if (cloudy) { const gray = new THREE.Color(wet ? '#7d8a95' : '#a9b6c2'); s.top.lerp(gray, wet ? 0.75 : 0.5); s.hor.lerp(gray, wet ? 0.7 : 0.45); s.sunI *= wet ? 0.35 : 0.6; s.cloud.lerp(new THREE.Color('#b8c2cc'), 0.5); }
  // sun path: rises in the east (+x), sets in the west, tilted to the south (+z)
  const ang = (hf - 5.6) / 13 * Math.PI;
  const sunDir = new THREE.Vector3(Math.cos(ang), Math.sin(ang) * 0.85 + 0.02, 0.45).normalize();
  const night = hf < 5 || hf > 19.6 ? 1 : hf < 6.2 ? 1 - (hf - 5) / 1.2 : hf > 18.6 ? (hf - 18.6) : 0;
  const day = hf > 5.2 && hf < 19.2;
  const lightDir = day ? new THREE.Vector3(sunDir.x, Math.max(sunDir.y, 0.16), sunDir.z).normalize() : new THREE.Vector3(-0.4, 0.75, -0.35).normalize(); // moonlight when the sun is down
  SKY.sun.position.copy(focus).addScaledVector(lightDir, 140); SKY.sun.target.position.copy(focus);
  SKY.sun.color.copy(s.sunCol); SKY.sun.intensity = s.sunI;
  SKY.hemi.color.copy(s.top).lerp(new THREE.Color('#ffffff'), 0.35); SKY.hemi.groundColor.set(night > 0.5 ? '#283048' : '#5a6440'); SKY.hemi.intensity = s.hemiI * 0.55 + 0.35 * sstep(16.8, 17.8, hf) * (1 - sstep(19.0, 19.8, hf));
  SKY.mat.uniforms.top.value.copy(s.top).convertSRGBToLinear(); SKY.mat.uniforms.hor.value.copy(s.hor).convertSRGBToLinear();
  SKY.mat.uniforms.sunDir.value.copy(sunDir); SKY.mat.uniforms.sunCol.value.copy(s.sunCol).convertSRGBToLinear().multiplyScalar(sunDir.y > -0.05 ? 1 : 0); SKY.mat.uniforms.night.value = night * (cloudy ? 0.2 : 1);
  SKY.dome.position.copy(cam.position);
  updateEnv(s, sunDir, night, weather);
  scene.fog.color.copy(s.hor); scene.fog.near = wet ? 120 : 260; scene.fog.far = wet ? 1400 : 3200;
  for (const c of SKY.clouds) { c.material.color.copy(s.cloud); c.material.opacity = cloudy ? 1 : 0.92; c.position.x += c.userData.speed * dt; if (c.position.x > 2600) c.position.x = -2600; }
  SKY.isl.children.forEach(m => m.material.color.copy(s.hor).lerp(new THREE.Color('#4f6a70'), 0.45));
  if (waterMat) { const u = waterMat.uniforms; u.sunDir.value.copy(sunDir); u.sunCol.value.copy(s.sunCol).convertSRGBToLinear().multiplyScalar(Math.min(1.4, s.sunI / 2)); u.skyCol.value.copy(s.top).convertSRGBToLinear(); u.horCol.value.copy(s.hor).convertSRGBToLinear(); u.ambient.value = 0.25 + Math.min(1, s.hemiI) * 0.8; }
  return { night, sunDir, sky: s };
}
