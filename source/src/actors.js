// ===================== PLAYER, CAMERA, VEHICLES =====================
const KEYS = {};
const VEHICLE_MODELS = ['truck', 'boat', 'van', 'kcar', 'wagon', 'suv', 'convert', 'bus', 'motorboat', 'ferry'];
// land / sea vehicle specs (len/wid = half extents for collision, eye = first-person seat offset [right, up, forward])
const CARSPEC = {
  truck: { name: '軽トラ', max: 12, acc: 5.2, brake: 12, turn: 0.95, len: 1.65, wid: 0.74, cam: 9, eye: [-0.36, 1.5, 1.05] },
  van: { name: '軽バン', max: 14.5, acc: 5.8, brake: 12, turn: 0.95, len: 1.65, wid: 0.74, cam: 9, eye: [-0.36, 1.5, 1.0] },
  kcar: { name: '軽自動車', max: 17, acc: 7, brake: 13, turn: 1.0, len: 1.65, wid: 0.74, cam: 8.5, eye: [-0.33, 1.32, 0.55] },
  wagon: { name: 'ワゴン車', max: 18, acc: 6.6, brake: 13, turn: 0.85, len: 2.3, wid: 0.86, cam: 10, eye: [-0.42, 1.42, 0.85] },
  suv: { name: 'オフロード車', max: 19, acc: 7.6, brake: 13, turn: 0.9, len: 2.05, wid: 0.9, cam: 10, eye: [-0.42, 1.62, 0.6], offroad: true },
  convert: { name: 'オープンカー', max: 24, acc: 9.5, brake: 15, turn: 0.95, len: 1.95, wid: 0.87, cam: 9, eye: [-0.38, 1.25, -0.1] },
  boat: { name: '漁船', max: 10, acc: 3.2, brake: 4, turn: 0.55, len: 4.2, wid: 1.4, cam: 15, eye: [0, 2.15, -1.2] },
  motorboat: { name: 'モーターボート', max: 17, acc: 5.5, brake: 6, turn: 0.85, len: 2.8, wid: 1.0, cam: 12, eye: [0.35, 1.45, 0.2] },
};
const MODELS = {};
function loadModels() {
  const loader = new GLTFLoader();
  const b64 = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
  return Promise.all(Object.entries(MODEL_DATA).map(([k, s]) => (/\.glb$/.test(s) ? fetch(s).then(r => { if (!r.ok) throw new Error('model ' + s + ' ' + r.status); return r.arrayBuffer(); }) : Promise.resolve(b64(s))).then(buf => new Promise((res, rej) => loader.parse(buf, '', g => { g.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (VEHICLE_MODELS.includes(k)) { o.material.side = THREE.FrontSide; if (o.material.name === 'glass') { o.material.transparent = true; o.material.opacity = 0.35; o.material.depthWrite = false; } } } }); MODELS[k] = g.scene; res(); }, rej)))));
}
const PL = { x: 0, z: 0, y: 0, rot: 0, speed: 0, mesh: null, parts: {}, ph: 0, veh: null, onPier: false };
const CAM = { mode: 'third', fpPitch: 0, fpLook: 0, lastDrag: -9, yaw: 0, pitch: 0.34, dist: 5.2, distT: 5.2, target: new THREE.Vector3(), drag: false,
  FOV: 42, FOV1: 62, K: 1.35 };   // a longer lens from further back (diorama-like, less distortion); K keeps every old distance's framing
CAM.fov = function (f) { if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); } };
function wheelsOf(m) { const w = partsOf(m, ['wheelFL', 'wheelFR', 'wheelRL', 'wheelRR']); for (const k in w) if (w[k]) { w[k].rotation.order = 'YXZ'; w[k].userData.r = Math.max(0.2, w[k].position.y); } return w; }
function partsOf(root, names) { const p = {}; names.forEach(n => p[n] = root.getObjectByName(n)); return p; }
function spawnPlayer(scene) {
  PL.mesh = MODELS.hero; scene.add(PL.mesh);
  PL.parts = partsOf(PL.mesh, ['pelvis', 'spine', 'head', 'thighL', 'thighR', 'shinL', 'shinR', 'upperArmL', 'upperArmR', 'foreArmL', 'foreArmR']);
  PL.rest = {}; for (const [k, o] of Object.entries(PL.parts)) if (o) PL.rest[k] = o.position.clone();
  const s = PLACED.spots.spawn; PL.x = s.x; PL.z = s.z; PL.y = groundH(PL.x, PL.z); PL.rot = s.rot !== undefined ? s.rot : Math.PI;
  CAM.yaw = PL.rot + Math.PI; CAM.target.set(PL.x, PL.y + 1.4, PL.z);
}
function onPierAt(x, z) {
  const H = PLACED.harbor && PLACED.harbor.walk; if (!H) return false;
  const dx = x - H.x, dz = z - H.z, c = Math.cos(H.dir), s = Math.sin(H.dir);
  const lx = dx * c - dz * s, lz = dx * s + dz * c; // into breakwater local space
  return Math.abs(lx) < H.w / 2 + 0.3 && lz < 14 && lz > -H.len; // the concrete body runs 14 m inland (you used to sink into it there)
}
function walkDeckY(x, z) { if (typeof WALKDECKS === 'undefined') return null; for (const d of WALKDECKS) { const cs = Math.cos(d.rot), sn = Math.sin(d.rot), dx = x - d.x, dz = z - d.z, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs; if (Math.abs(lx) < d.hw && Math.abs(lz) < d.hd) return d.y; } return null; }
function standY(x, z) { const wd = walkDeckY(x, z); if (wd !== null) return Math.max(groundH(x, z), wd); const DK = typeof PROJ !== 'undefined' && PROJ.deck; if (DK && Math.abs(x - DK.x) < DK.hw && Math.abs(z - DK.z) < DK.hw) return Math.max(groundH(x, z), DK.y); if (onPierAt(x, z)) return Math.max(groundH(x, z), PLACED.harbor.walk.top); const d = deckY(x, z); if (d !== null) return d; return groundH(x, z); }
function canWalk(x0, z0, x1, z1) {
  const y0 = standY(x0, z0), y1 = standY(x1, z1); const d = Math.hypot(x1 - x0, z1 - z0) || 1e-4;
  if (y1 < -0.85 && !onPierAt(x1, z1) && walkDeckY(x1, z1) === null) return false;      // too deep
  const ontoDeck = walkDeckY(x1, z1) !== null || onPierAt(x1, z1) || (typeof PROJ !== 'undefined' && PROJ.deck && Math.abs(x1 - PROJ.deck.x) < PROJ.deck.hw && Math.abs(z1 - PROJ.deck.z) < PROJ.deck.hw);
  if (deckY(x1, z1) === null && !ontoDeck) { const w1 = waterDepthAt(x1, z1); if (w1 > 0.75 && w1 > waterDepthAt(x0, z0)) return false; }
  if ((y1 - y0) / d > 1.25 && !(ontoDeck && y1 - y0 < 2.4)) return false;   // too steep to climb (pier/deck edges can be stepped onto)
  if (Math.abs(x1) > 352 || Math.abs(z1) > 352) return false;
  return true;
}
function moveInput() {
  let ix = 0, iz = 0;
  if (KEYS.KeyW || KEYS.ArrowUp) iz += 1; if (KEYS.KeyS || KEYS.ArrowDown) iz -= 1; if (KEYS.KeyA || KEYS.ArrowLeft) ix -= 1; if (KEYS.KeyD || KEYS.ArrowRight) ix += 1;
  const l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; } return [ix, iz, Math.min(1, l)];
}
const angLerp = (a, b, t) => a + angDiff(b, a) * t;
function updatePlayer(dt, locked) {
  if (PL.veh) return;
  const [ix, iz, l] = locked ? [0, 0, 0] : moveInput();
  let spd = 0;
  if (l > 0.05) {
    const run = KEYS.ShiftLeft || KEYS.ShiftRight; const target = (run ? 5.2 : 2.2) * l;
    PL.speed = lerp(PL.speed, target, Math.min(1, dt * 8));
    let mx, mz;
    if (CAM.mode === 'first') {
      PL.rot -= ix * dt * 2.0; const dir = iz < -0.1 ? -1 : 1; mx = Math.sin(PL.rot) * dir; mz = Math.cos(PL.rot) * dir;
      if (Math.abs(iz) < 0.1) { mx = 0; mz = 0; PL.speed = 0; }
      if (iz < -0.1) PL.speed = Math.min(PL.speed, 1.6);
    } else {
      // the keys mean "away from / beside the camera as it was when you pressed them": while you hold the same keys the walk
      // keeps its direction even as the camera swings round behind you (that is what used to send you round in circles)
      const kk = (ix > 0.1 ? 'R' : ix < -0.1 ? 'L' : '') + (iz > 0.1 ? 'F' : iz < -0.1 ? 'B' : ''), nowS = performance.now() / 1000;
      if (kk !== CAM.inKey || CAM.inYaw === undefined || nowS - CAM.lastDrag < 0.1 || CAM.drag) { CAM.inKey = kk; CAM.inYaw = CAM.yaw; }
      const yw = CAM.inYaw, fx = -Math.sin(yw), fz = -Math.cos(yw), rx = Math.cos(yw), rz = -Math.sin(yw);
      mx = fx * iz + rx * ix; mz = fz * iz + rz * ix; const ml = Math.hypot(mx, mz); mx /= ml; mz /= ml;
      PL.rot = angLerp(PL.rot, Math.atan2(mx, mz), Math.min(1, dt * 10));
    }
    let nx = PL.x + mx * PL.speed * dt, nz = PL.z + mz * PL.speed * dt;
    [nx, nz] = pushOut(nx, nz, 0.3);
    if (canWalk(PL.x, PL.z, nx, nz)) { PL.x = nx; PL.z = nz; } else if (canWalk(PL.x, PL.z, nx, PL.z)) PL.x = nx; else if (canWalk(PL.x, PL.z, PL.x, nz)) PL.z = nz;
    spd = PL.speed;
  } else PL.speed = lerp(PL.speed, 0, Math.min(1, dt * 10));
  const gy = standY(PL.x, PL.z), wade = Math.max(0, -gy - 0.0);
  // feet: highest of the centre and 4 points around it (no sinking on slopes); go up at once, come down smoothly
  let fy = gy; if (gy > 0) for (const [ox, oz] of [[0.2, 0], [-0.2, 0], [0, 0.2], [0, -0.2]]) fy = Math.max(fy, standY(PL.x + ox, PL.z + oz) - 0.04);
  const ty = Math.max(fy, -0.85); PL.y = ty > PL.y ? ty : lerp(PL.y, ty, Math.min(1, dt * 14));
  PL.mesh.position.set(PL.x, PL.y, PL.z); PL.mesh.rotation.y = PL.rot; PL.mesh.visible = CAM.mode !== 'first';
  animateHero(dt, spd, wade);
}
function animateHero(dt, spd, wade = 0) {
  const run = spd > 3.6; PL.ph += dt * (spd > 0.1 ? (run ? 10.5 : 8.2) * Math.min(1.3, spd / (run ? 5.6 : 2.3)) : 1.8);
  animateBody(PL.parts, PL.rest, PL.ph, spd, dt);
}
// ---------- vehicles ----------
const VEH = [];
function spawnVehicles(scene) {
  // kei truck parked by the shop
  const shop = PLACED.shop || PLACED.houses[0];
  const fx = Math.sin(shop.rot), fz = Math.cos(shop.rot), rx = Math.cos(shop.rot), rz = -Math.sin(shop.rot);
  const tx = shop.x + fx * (shop.d / 2 + 3.2) + rx * (shop.w / 2 + 2.5), tz = shop.z + fz * (shop.d / 2 + 3.2) + rz * (shop.w / 2 + 2.5);
  const HP = PLACED.home && PLACED.home.pad, truck = { kind: 'truck', model: 'truck', name: '軽トラ', mesh: MODELS.truck, x: HP ? HP.x : tx, z: HP ? HP.z : tz, rot: HP ? HP.rot : shop.rot + Math.PI / 2, y: groundH(tx, tz), v: 0, wheels: wheelsOf(MODELS.truck), steer: 0, pitch: 0, roll: 0 };
  scene.add(truck.mesh); VEH.push(truck);
  // fishing boat moored inside the breakwater
  const H = PLACED.harbor; let bx = H.x - 10, bz = H.z + 10;
  if (H) { const s = Math.sin(H.dir), c = Math.cos(H.dir); for (let k = 0; k < 40; k++) { const x = H.x - s * 18 + c * (6 + k), z = H.z - c * 18 - s * (6 + k); if (groundH(x, z) < -1.6) { bx = x; bz = z; break; } } }
  const boat = { kind: 'boat', model: 'boat', name: '漁船', mesh: MODELS.boat, x: bx, z: bz, rot: H ? H.dir : 0, y: 0, v: 0, steer: 0, bob: 0 };
  scene.add(boat.mesh); VEH.push(boat);
  for (const v of VEH) { v.home = { x: v.x, z: v.z, rot: v.rot }; placeVehicle(v, 0); }
  Object.assign(VSPEC.truck, CARSPEC.truck);
}
// swap the model used by a vehicle slot (land car or boat)
function setVehicleModel(v, id) {
  if (!MODELS[id] || v.model === id) return; scene.remove(v.mesh); v.mesh = MODELS[id]; v.model = id; v.name = CARSPEC[id].name; scene.add(v.mesh);
  v.wheels = wheelsOf(v.mesh); v.steerWheel = null; Object.assign(VSPEC[v.kind], CARSPEC[id]); v.v = 0; placeVehicle(v, 0);
}
const VSPEC = { truck: { max: 17, acc: 6.5, brake: 12, turn: 0.9, len: 1.6, wid: 0.8, cam: 9 }, boat: { max: 10, acc: 3.2, brake: 4, turn: 0.55, len: 4.2, wid: 1.4, cam: 15 } };
function vehOK(v, x, z, rot) {
  const sp = VSPEC[v.kind], s = Math.sin(rot), c = Math.cos(rot);
  for (const [a, b] of [[sp.len, 0], [sp.len, sp.wid], [sp.len, -sp.wid], [-sp.len, sp.wid], [-sp.len, -sp.wid], [0, 0]]) {
    const px = x + s * a + c * b, pz = z + c * a - s * b, h = groundH(px, pz);
    if (Math.abs(px) > 360 || Math.abs(pz) > 360) return v.kind !== 'boat' ? false : Math.abs(px) < 900 && Math.abs(pz) < 900;
    if (v.kind === 'truck') { const B = typeof DV !== 'undefined' && DV.bus; if (B && Math.hypot(B.x - px, B.z - pz) < 2.6) return false; const dk = deckY(px, pz); if (dk === null && (h < -0.3 || waterDepthAt(px, pz) > 0.35)) return false; for (const cc of collidersNear(px, pz)) { const [qx, qz] = pushOut(px, pz, 0.2); if (Math.hypot(qx - px, qz - pz) > 0.01) return false; } }
    else { if (h > -0.55) return false; if (onPierAt(px, pz) || walkDeckY(px, pz) !== null) return false; }
  }
  return true;
}
function placeVehicle(v, dt) {
  if (v.kind === 'truck') {
    // the 4 wheels follow this car's real size (bigger cars used to sink at the ends)
    const sp = VSPEC.truck, fl = Math.max(1.1, (sp.len || 1.6) * 0.72), wl = Math.max(0.6, (sp.wid || 0.8) * 0.85), s = Math.sin(v.rot), c = Math.cos(v.rot);
    const W = (a, b) => standY(v.x + s * a + c * b, v.z + c * a - s * b), fL = W(fl, wl), fR = W(fl, -wl), bL = W(-fl, wl), bR = W(-fl, -wl), hf = (fL + fR) / 2, hb = (bL + bR) / 2, hl = (fL + bL) / 2, hr = (fR + bR) / 2;
    const ty = Math.max((hf + hb + hl + hr) / 4, Math.max(fL, fR, bL, bR) - 0.12); v.y = !dt || ty > v.y ? ty : lerp(v.y, ty, Math.min(1, dt * 12)); v.pitch = lerp(v.pitch, Math.atan2(hb - hf, fl * 2), dt ? Math.min(1, dt * 14) : 1); v.roll = lerp(v.roll, Math.atan2(hr - hl, wl * 2), dt ? Math.min(1, dt * 14) : 1);
    v.mesh.position.set(v.x, v.y, v.z); v.mesh.rotation.set(0, 0, 0); v.mesh.rotateY(v.rot); v.mesh.rotateX(v.pitch); v.mesh.rotateZ(v.roll);
  } else {
    v.bob += dt; const t = performance.now() / 1000;
    v.mesh.position.set(v.x, Math.sin(t * 1.1 + v.x) * 0.06 - 0.05, v.z); v.mesh.rotation.set(0, 0, 0); v.mesh.rotateY(v.rot); v.mesh.rotateX(Math.sin(t * 0.9) * 0.025 - v.v * 0.004); v.mesh.rotateZ(Math.sin(t * 1.3) * 0.03 + v.steer * v.v * 0.01);
  }
}
function updateVehicles(dt, locked) {
  for (const v of VEH) {
    if (PL.veh === v) {
      const sp = VSPEC[v.kind]; const [ix, iz] = locked ? [0, 0] : moveInput();
      const onRoad = v.kind !== 'truck' || sp.offroad || roadDistAt(v.x, v.z) < 3.7 || deckY(v.x, v.z) !== null || (typeof brAt === 'function' && brAt(v.x, v.z, v.y) !== null), vmax = onRoad ? sp.max : sp.max * 0.55;
      if (iz > 0.1) v.v = v.v > vmax ? Math.max(vmax, v.v - sp.brake * 0.5 * dt) : Math.min(vmax, v.v + sp.acc * dt * iz); else if (iz < -0.1) v.v = Math.max(-sp.max * 0.35, v.v - sp.brake * dt * -iz); else v.v *= Math.pow(v.kind === 'boat' ? 0.55 : 0.4, dt);
      v.steer = lerp(v.steer, -ix, Math.min(1, dt * 5));
      const turn = v.steer * sp.turn * dt * (v.kind === 'boat' ? Math.min(1, Math.abs(v.v) / 2 + 0.25) : Math.min(1, Math.abs(v.v) / 3)) * Math.sign(v.v || 1);
      const nr = v.rot + turn, nx = v.x + Math.sin(nr) * v.v * dt, nz = v.z + Math.cos(nr) * v.v * dt;
      if (vehOK(v, nx, nz, nr)) { v.x = nx; v.z = nz; v.rot = nr; }
      else if (vehOK(v, nx, v.z, nr)) { v.x = nx; v.rot = nr; v.v *= 0.9; }
      else if (vehOK(v, v.x, nz, nr)) { v.z = nz; v.rot = nr; v.v *= 0.9; }
      else if (vehOK(v, v.x, v.z, nr)) { v.rot = nr; v.v *= 0.3; if (Math.abs(v.v) < 0.5 && !v._bumpT) { v._bumpT = 1; UI.toast('ぶつかった！ S でバックできます'); setTimeout(() => v._bumpT = 0, 4000); } }
      else { v.v = -Math.sign(v.v) * 0.6; }
      if (v.wheels) { for (const k of ['wheelFL', 'wheelFR', 'wheelRL', 'wheelRR']) if (v.wheels[k]) { const w = v.wheels[k]; w.rotation.x = (w.rotation.x + v.v * dt / w.userData.r) % 6.2832; } for (const k of ['wheelFL', 'wheelFR']) if (v.wheels[k]) v.wheels[k].rotation.y = v.steer * 0.42; if (v.steerWheel) v.steerWheel.rotation.z = -v.steer * 1.6; }
      if (v.kind === 'boat' && Math.abs(v.v) > 1.5 && Math.random() < dt * 25) FX.wake(v);
      PL.x = v.x; PL.z = v.z; PL.rot = v.rot;
    }
    placeVehicle(v, dt);
  }
  if (PL.veh && (PL.veh.kind === 'bus' || PL.veh.kind === 'ferry')) { if (PL.veh.kind === 'bus') PL.mesh.visible = false; }
  else if (PL.veh) {
    const v = PL.veh, s = Math.sin(v.rot), c = Math.cos(v.rot);
    if (v.kind === 'truck' || CAM.mode === 'first') PL.mesh.visible = false;
    else { PL.mesh.visible = true; PL.mesh.position.set(v.x + s * 0.4 + c * 0.0, v.mesh.position.y + 0.85, v.z + c * 0.4); PL.mesh.scale.setScalar(1); PL.mesh.rotation.y = v.rot; animateHero(dt, 0); PL.parts.upperArmL.rotation.x = PL.parts.upperArmR.rotation.x = -0.9; }
  }
}
function setViewMode(m) { CAM.mode = m; CAM.snap = true; CAM.fpPitch = 0; CAM.fpLook = 0; if (m === 'third') { CAM.yaw = (PL.veh ? PL.veh.rot : PL.rot) + Math.PI; CAM.pitch = 0.34; CAM.target.set(PL.x, PL.y + 1.05, PL.z); } UI.viewMode(m); }
function hitsAnyBld(x, z) { return collidersNear(x, z).some(c => !c.off && c.kind === 'bld' && hitsCollider(c, x, z, 0.3)); }
function nearVehicle() { let best = null, bd = 4.2; for (const v of VEH) { const d = Math.hypot(v.x - PL.x, v.z - PL.z) - (v.kind === 'boat' ? 2.5 : 0); if (d < bd) { bd = d; best = v; } } return best; }
function toggleVehicle() {
  if (PL.veh) {
    const v = PL.veh; if (Math.abs(v.v) > 2) { UI.toast('止まってからおりよう'); return; }
    const s = Math.sin(v.rot), c = Math.cos(v.rot);
    if (v.kind === 'truck') for (const [a, b] of [[0, 1.6], [0, -1.6], [-2.6, 0], [2.6, 0]]) {
      const x = v.x + s * a + c * b, z = v.z + c * a - s * b; const y = standY(x, z);
      if (y > -0.6) { const [qx, qz] = pushOut(x, z, 0.3); PL.x = qx; PL.z = qz; PL.y = standY(qx, qz); PL.veh = null; v.v = 0; CAM.distT = 5.2; return; }
    }
    else { // boat: nearest place within ~9 m where you can stand (dry land first, then knee-deep water near a beach)
      let best = null;
      for (let r = 2.2; r <= 9.01 && !best; r += 0.6) for (let k = 0; k < 20; k++) { const a = k / 20 * 6.2832, x = v.x + Math.sin(a) * r, z = v.z + Math.cos(a) * r, y = standY(x, z);
        if (y < -0.55 || hitsAnyBld(x, z)) continue; const sc = r + (y < 0 ? 1.2 - y : 0); if (!best || sc < best.sc) best = { x, z, sc }; }
      if (best) { const [qx, qz] = pushOut(best.x, best.z, 0.3); PL.x = qx; PL.z = qz; PL.y = standY(qx, qz); PL.rot = Math.atan2(qx - v.x, qz - v.z); PL.veh = null; v.v = 0; CAM.distT = 5.2; if (GAME.fishing && GAME.fishing()) GAME.endFish(); return; }
    }
    UI.toast(v.kind === 'boat' ? '岸・浜・防波堤にもっと近づいてね' : 'ここではおりられない'); return;
  }
  const v = nearVehicle(); if (!v) return false;
  PL.veh = v; v.v = 0; CAM.distT = VSPEC[v.kind].cam; return true;
}
function updateCamera(dt) {
  const now = performance.now() / 1000; CAM.fov(CAM.mode === 'first' ? CAM.FOV1 : CAM.FOV);
  if (CAM.mode === 'first') {
    let eye, yaw;
    if (PL.veh) {
      const v = PL.veh, s = Math.sin(v.rot), c = Math.cos(v.rot), off = (CARSPEC[v.model] || {}).eye || (v.kind === 'truck' ? [-0.36, 1.42, 0.95] : [0.0, 2.15, -1.2]);
      eye = new THREE.Vector3(v.x + c * off[0] + s * off[2], v.mesh.position.y + off[1], v.z - s * off[0] + c * off[2]); yaw = v.rot + CAM.fpLook;
      CAM.fpLook = CAM.drag ? CAM.fpLook : lerp(CAM.fpLook, 0, Math.min(1, dt * 1.5));
    } else { eye = new THREE.Vector3(PL.x + Math.sin(PL.rot) * 0.12, PL.mesh.position.y + 0.98 + Math.abs(Math.cos(PL.ph)) * 0.02 * Math.min(1, PL.speed), PL.z + Math.cos(PL.rot) * 0.12); yaw = PL.rot; }
    camera.position.lerp(eye, CAM.snap ? 1 : Math.min(1, dt * 18)); CAM.snap = false;
    const cp = Math.cos(CAM.fpPitch); camera.lookAt(camera.position.x + Math.sin(yaw) * cp, camera.position.y + Math.sin(CAM.fpPitch), camera.position.z + Math.cos(yaw) * cp);
    PL.mesh.visible = false; if (PL.veh) PL.veh.mesh.visible = PL.veh.kind === 'boat' || true;
    CAM.yaw = (PL.veh ? PL.veh.rot : PL.rot) + Math.PI; CAM.target.set(PL.x, PL.y + 1.05, PL.z);
    return;
  }
  const focus = PL.veh ? new THREE.Vector3(PL.veh.x, PL.veh.mesh.position.y + (PL.veh.kind === 'boat' ? 2.4 : 1.6), PL.veh.z) : new THREE.Vector3(PL.x, PL.y + 1.05, PL.z);
  const free = now - CAM.lastDrag > 1.5 && !CAM.drag && !(typeof EDIT !== 'undefined' && EDIT.on);
  if (PL.veh && free) CAM.yaw = angLerp(CAM.yaw, PL.veh.rot + Math.PI, Math.min(1, dt * 2.2));
  else if (!PL.veh && free && PL.speed > 0.6) {
    // on foot the camera comes round behind the way you are walking, gently (it eases in over ~0.8 s and never flips round
    // when you walk towards it). The walk itself keeps its direction (see updatePlayer), so this no longer makes circles.
    CAM.followT = Math.min(1, (CAM.followT || 0) + dt / 0.8);
    const d = angDiff(PL.rot + Math.PI, CAM.yaw);
    if (Math.abs(d) < 2.1) CAM.yaw += d * Math.min(1, dt * 1.15 * CAM.followT * Math.min(1, PL.speed / 2.2));
    CAM.pitch = lerp(CAM.pitch, 0.34, Math.min(1, dt * 0.5));
  } else if (!PL.veh) CAM.followT = Math.max(0, (CAM.followT || 0) - dt * 2);
  if (KEYS.KeyQ) { CAM.yaw += dt * 1.8; CAM.lastDrag = now; } if (KEYS.KeyE && !PL.veh) { CAM.yaw -= dt * 1.8; CAM.lastDrag = now; }
  CAM.dist = lerp(CAM.dist, CAM.distT, Math.min(1, dt * 4));
  // follow: close behind sideways, softly up and down (steps and rough ground no longer bob the whole view)
  if (CAM.snap || CAM.target.distanceToSquared(focus) > 400) { CAM.target.copy(focus); CAM.lift = 0; CAM.len = 0; CAM.snap = false; }
  else { const kx = Math.min(1, dt * 12), dy = focus.y - CAM.target.y, ky = Math.min(1, dt * (Math.abs(dy) > 1.5 ? 9 : PL.veh ? 6 : 3.5));
    CAM.target.x += (focus.x - CAM.target.x) * kx; CAM.target.z += (focus.z - CAM.target.z) * kx; CAM.target.y += dy * ky; }
  const T = CAM.target, full = CAM.dist * CAM.K, minL = Math.min(full, 2.6);
  // walls of buildings: tilt up a little to look over them (smoothly, let go after a moment) and pull in, but never closer than
  // 2.6 m: what is still in the way (a wall, an eave, leaves) is cut out around you in the shader instead (see.js).
  // Low walls and fences only count near the ground; trees and posts don't count.
  const crowns = typeof SEE !== 'undefined' && SEE.crownsAt && SEE.grid && !PL.veh;
  const freeLen = (pitch, trees) => { const cp = Math.cos(pitch), dx = Math.sin(CAM.yaw) * cp, dy = Math.sin(pitch), dz = Math.cos(CAM.yaw) * cp;
    for (let t = 0.8; t < full; t += 0.4) { const px = T.x + dx * t, py = T.y + dy * t, pz = T.z + dz * t, hy = py - groundH(px, pz); if (hy > 9) continue;
      for (const c of collidersNear(px, pz)) { if (c.off || c.r !== undefined) continue; if (hy > 1.4 && Math.min(c.hw || 0, c.hd || 0) < 0.25) continue;
        const cs = Math.cos(c.rot || 0), sn = Math.sin(c.rot || 0), lx = (px - c.x) * cs - (pz - c.z) * sn, lz = (px - c.x) * sn + (pz - c.z) * cs; if (Math.abs(lx) < c.hw + 0.05 && Math.abs(lz) < c.hd + 0.05) return Math.max(minL, t - 0.4); }
      // in a wood: stop short of the leaf crowns overhead (the crown you are still in is cut out in the shader)
      if (trees && t > 2.2 && SEE.crownsAt(px, py, pz, 0.95).length) return Math.max(minL, t - 0.4); }
    return full; };
  CAM.pb = CAM.pb || 0; CAM.pbHold = Math.max(0, (CAM.pbHold || 0) - dt); let pbT = 0;
  if (!PL.veh && full > 2.5 && freeLen(CAM.pitch) < full * 0.9) { pbT = 0.35; for (const b of [0.15, 0.25]) if (freeLen(Math.min(0.85, CAM.pitch + b)) >= full * 0.85) { pbT = b; break; } pbT = Math.min(pbT, Math.max(0, 0.85 - CAM.pitch)); CAM.pbHold = 0.8; }
  else if (CAM.pbHold > 0) pbT = CAM.pb;
  CAM.pb = lerp(CAM.pb, pbT, Math.min(1, dt * (pbT > CAM.pb ? 3.5 : 1.2)));
  const pitch = CAM.pitch + CAM.pb, cp = Math.cos(pitch), dir = new THREE.Vector3(Math.sin(CAM.yaw) * cp, Math.sin(pitch), Math.cos(CAM.yaw) * cp);
  let L = freeLen(pitch, crowns);
  // come back out only once it has stayed clear for a moment (walking under trees made the distance breathe)
  if (CAM.len && L > CAM.len + 0.3) { CAM.outT = (CAM.outT || 0) + dt; if (CAM.outT < 0.9) L = CAM.len; } else CAM.outT = 0;
  CAM.len = !CAM.len ? L : lerp(CAM.len, L, Math.min(1, dt * (L < CAM.len ? 6 : 1.6)));
  const pos = T.clone().addScaledVector(dir, CAM.len);
  // ground behind you (a slope, a bank): lift the camera smoothly instead of jumping to the ground every frame
  const sea = typeof SEA !== 'undefined' && SEA.h !== undefined ? SEA.h : 0; let need = 0;
  for (const f of [0.5, 0.75, 1, 1.2]) { const t = CAM.len * f, px = T.x + dir.x * t, pz = T.z + dir.z * t; need = Math.max(need, Math.max(groundH(px, pz), sea) + 0.75 - (T.y + dir.y * t)); }
  CAM.lift = CAM.lift || 0; CAM.lift = lerp(CAM.lift, need, Math.min(1, dt * (need > CAM.lift ? 5 : 1.4)));
  pos.y += Math.max(0, CAM.lift);
  const gy = Math.max(groundH(pos.x, pos.z), sea) + 0.35; if (pos.y < gy) pos.y = gy;
  camera.position.copy(pos); camera.lookAt(CAM.target);
}
// ---------- effects ----------
const FX = {
  list: [], scene: null,
  wake(v) {
    const s = Math.sin(v.rot), c = Math.cos(v.rot);
    for (const side of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.5, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(v.x - s * 4.2 + c * side * 0.9, 0.04, v.z - c * 4.2 - s * side * 0.9); this.scene.add(m); this.list.push({ m, t: 0, life: 2.2, vx: c * side * 0.8, vz: -s * side * 0.8 });
    }
  },
  update(dt) { for (let i = this.list.length - 1; i >= 0; i--) { const f = this.list[i]; f.t += dt; const k = f.t / f.life; if (k >= 1) { this.scene.remove(f.m); f.m.geometry.dispose(); this.list.splice(i, 1); continue; } f.m.scale.setScalar(1 + k * 3); f.m.material.opacity = 0.55 * (1 - k); f.m.position.x += f.vx * dt; f.m.position.z += f.vz * dt; } },
};
