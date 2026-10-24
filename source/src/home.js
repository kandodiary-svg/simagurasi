// ===================== 自分の家の中: 部屋・家具・模様がえ・カタログ・リフォーム =====================
const ROOM_SIZES = [null, { w: 7, d: 6, name: 'ふつうの部屋' }, { w: 9, d: 8, name: '広い部屋', price: 40000, lv: 2 }, { w: 11, d: 9, name: 'とても広い部屋', price: 120000, lv: 4 }];
const FURN = [
  // id, name, price, footprint w×d (m), cat, opts
  { id: 'bed_single', name: 'シングルベッド', price: 3000, w: 1.0, d: 2.0, cat: '寝る', act: 'bed' },
  { id: 'bed_double', name: 'ダブルベッド', price: 8000, w: 1.6, d: 2.0, cat: '寝る', act: 'bed' },
  { id: 'futon', name: 'ふとん', price: 1500, w: 1.0, d: 2.0, cat: '寝る', act: 'bed', low: true },
  { id: 'sofa', name: 'ソファ', price: 6000, w: 2.0, d: 0.9, cat: 'くつろぐ' },
  { id: 'sofa1', name: 'ひとりがけソファ', price: 3500, w: 0.9, d: 0.9, cat: 'くつろぐ' },
  { id: 'table_low', name: 'ローテーブル', price: 2000, w: 1.2, d: 0.7, cat: 'くつろぐ' },
  { id: 'kotatsu', name: 'こたつ', price: 5000, w: 1.1, d: 1.1, cat: 'くつろぐ' },
  { id: 'zabuton', name: '座布団', price: 400, w: 0.6, d: 0.6, cat: 'くつろぐ', low: true },
  { id: 'tv', name: 'テレビ台とテレビ', price: 7000, w: 1.4, d: 0.5, cat: 'くつろぐ', act: 'tv' },
  { id: 'rug_round', name: '丸いラグ', price: 1200, w: 2.0, d: 2.0, cat: 'しきもの', flat: true },
  { id: 'rug_tatami', name: '畳マット', price: 2500, w: 2.0, d: 2.0, cat: 'しきもの', flat: true },
  { id: 'rug_stripe', name: 'しましまラグ', price: 1500, w: 2.4, d: 1.6, cat: 'しきもの', flat: true },
  { id: 'dining', name: 'ダイニングセット', price: 7500, w: 1.7, d: 1.7, cat: 'キッチン' },
  { id: 'kitchen', name: 'キッチン', price: 12000, w: 2.4, d: 0.65, cat: 'キッチン' },
  { id: 'fridge', name: '冷蔵庫', price: 6000, w: 0.7, d: 0.7, cat: 'キッチン' },
  { id: 'bookshelf', name: '本棚', price: 3000, w: 1.0, d: 0.35, cat: 'しまう' },
  { id: 'tansu', name: 'タンス', price: 4500, w: 1.0, d: 0.5, cat: 'しまう' },
  { id: 'desk', name: '机といす', price: 4000, w: 1.2, d: 1.0, cat: 'しまう' },
  { id: 'plant_big', name: '観葉植物', price: 1500, w: 0.5, d: 0.5, cat: 'かざる' },
  { id: 'bonsai', name: '盆栽', price: 2500, w: 0.5, d: 0.5, cat: 'かざる' },
  { id: 'floorlamp', name: 'スタンドライト', price: 1800, w: 0.45, d: 0.45, cat: 'かざる' },
  { id: 'fishtank', name: '水槽（釣った魚が泳ぐ）', price: 9000, w: 1.0, d: 0.45, cat: 'かざる', act: 'tank' },
  { id: 'goldfish', name: '金魚鉢', price: 1200, w: 0.4, d: 0.4, cat: 'かざる' },
  { id: 'maneki', name: '招き猫', price: 1000, w: 0.35, d: 0.35, cat: 'かざる' },
  { id: 'mikanbox', name: 'みかん箱', price: 300, w: 0.5, d: 0.35, cat: 'かざる' },
  { id: 'model_ship', name: '漁船の模型', price: 3500, w: 0.7, d: 0.35, cat: 'かざる' },
  { id: 'telescope', name: '望遠鏡', price: 6000, w: 0.6, d: 0.6, cat: 'かざる' },
  { id: 'fan', name: '扇風機', price: 1500, w: 0.45, d: 0.45, cat: 'かざる' },
  { id: 'stove', name: 'ストーブ', price: 3000, w: 0.5, d: 0.5, cat: 'かざる' },
  { id: 'piano', name: 'ピアノ', price: 30000, w: 1.5, d: 0.65, cat: '楽器', act: 'piano' },
  { id: 'guitar', name: 'ギター', price: 4000, w: 0.45, d: 0.4, cat: '楽器', act: 'guitar' },
  { id: 'clock', name: '壁かけ時計', price: 1500, w: 0.5, wall: true, cat: '壁' },
  { id: 'painting', name: 'ユキの絵（島の風景）', price: 4000, w: 1.2, wall: true, cat: '壁' },
  { id: 'gyotaku', name: '魚拓（いちばんの大物）', price: 2000, w: 0.9, wall: true, cat: '壁' },
  { id: 'calendar', name: 'カレンダー', price: 300, w: 0.45, wall: true, cat: '壁' },
  { id: 'shelf', name: 'かざり棚', price: 1800, w: 1.0, wall: true, cat: '壁' },
  { id: 'window2', name: '丸窓', price: 5000, w: 1.0, wall: true, cat: '壁' },
];
const WALLS = [['plaster', '白いしっくい', 0], ['wood', '木の板', 1500], ['tsuchi', '和室の土かべ', 2000], ['dot', '水玉ピンク', 2000], ['sea', '海のしましま', 2000], ['star', '星空', 3500]];
const FLOORS = [['wood', 'フローリング', 0], ['tatami', '畳', 2500], ['tile', '白黒タイル', 2000], ['carpet', '青いカーペット', 2000], ['ichimatsu', '市松もよう', 2500], ['cherry', '明るい木', 3000]];
const STARTER = [{ id: 'futon', x: -2.2, z: -1.6, rot: 0 }, { id: 'table_low', x: 0.6, z: -0.2, rot: 0 }, { id: 'zabuton', x: 0.6, z: 0.6, rot: 0 }, { id: 'tansu', x: 2.2, z: -2.6, rot: 0 }, { id: 'mikanbox', x: 2.9, z: 0.4, rot: -Math.PI / 2 }, { id: 'calendar', wall: 'back', x: 0.3, y: 1.7 }];
const ROOM = { scene: null, group: null, meshes: [], built: false, mouse: null, ghost: null, spin: [], tank: [] };

Object.assign(GAME, {
  home() { const p = this.p; if (!p.home) p.home = { size: 1, wall: 'plaster', floor: 'wood', items: STARTER.map(q => ({ ...q })), store: {}, wallsOwned: { plaster: 1 }, floorsOwned: { wood: 1 } }; return p.home; },
  nearDoor() { const H = PLACED.home; if (!H || PL.veh || this.inside) return false; const [x, z] = toWorld(H.hs, 0, H.hs.d / 2 + 0.9); const dd = Math.hypot(PL.x - x, PL.z - z), dm = Math.hypot(PL.x - H.mail.x, PL.z - H.mail.z); return dd < 1.5 && dd < dm; },
  // ---------- enter / exit ----------
  enterHome() {
    const H = this.home(); this.fade(() => {
      this.buildRoom(); this.inside = true; this.outPos = { x: PL.x, z: PL.z, rot: PL.rot };
      scene.remove(PL.mesh); ROOM.scene.add(PL.mesh); const S = ROOM_SIZES[H.size];
      PL.x = 0; PL.z = S.d / 2 - 0.8; PL.rot = Math.PI; PL.y = 0; PL.speed = 0; PL.mesh.visible = true;
      GAME_RP.scene = ROOM.scene; this.el.hud.classList.add('inroom'); this.el.hud.querySelector('.help').hidden = true; this.roomUI(); UI.toast('🏠 ただいま！（B で模様がえ、C でカタログ）');
    });
  },
  exitHome() {
    if (this.roomEdit) this.toggleRoomEdit(false);
    this.fade(() => { this.inside = false; ROOM.scene.remove(PL.mesh); scene.add(PL.mesh); GAME_RP.scene = scene; const H = PLACED.home, [x, z] = toWorld(H.hs, 0, H.hs.d / 2 + 1.6);
      PL.x = x; PL.z = z; PL.rot = H.hs.rot; PL.y = standY(x, z); CAM.yaw = PL.rot + Math.PI; CAM.snap = true; this.el.roomp.hidden = true; this.el.hud.classList.remove('inroom'); this.el.hud.querySelector('.help').hidden = false; document.getElementById('buildBtn').hidden = false; });
  },
  // ---------- room construction ----------
  buildRoom() {
    if (!ROOM.scene) {
      ROOM.scene = new THREE.Scene(); ROOM.scene.background = new THREE.Color('#2a2420');
      ROOM.scene.add(new THREE.HemisphereLight('#fff6e6', '#8a7a68', 0.9));
      const sun = new THREE.DirectionalLight('#fff1d8', 1.6); sun.position.set(4, 9, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 30; sun.shadow.bias = -0.0005; ROOM.scene.add(sun); ROOM.sun = sun;
      ROOM.lamp = new THREE.PointLight('#ffd9a0', 0, 12, 1.5); ROOM.lamp.position.set(0, 2.6, 0); ROOM.scene.add(ROOM.lamp);
      ROOM.env = new THREE.AmbientLight('#ffffff', 0.15); ROOM.scene.add(ROOM.env);
    }
    if (ROOM.group) ROOM.scene.remove(ROOM.group); ROOM.group = new THREE.Group(); ROOM.scene.add(ROOM.group);
    const H = this.home(), S = ROOM_SIZES[H.size], W = S.w, D = S.d, WH = H.wh || 2.8, g = ROOM.group;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex(H.floor, W, D), roughness: 0.75 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
    const wm = new THREE.MeshStandardMaterial({ map: wallTex(H.wall), roughness: 0.9 }), base = new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: 0.7 });
    const wall = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, WH), wm.clone()); m.material.map = wallTex(H.wall, w); m.position.set(x, WH / 2, z); m.rotation.y = ry; m.receiveShadow = true; g.add(m); const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.04), base); b.position.set(x, 0.06, z); b.rotation.y = ry; g.add(b); };
    wall(W, 0, -D / 2, 0); wall(D, -W / 2, 0, Math.PI / 2); wall(D, W / 2, 0, -Math.PI / 2);
    // windows (sky colour follows the time of day)
    ROOM.winMat = new THREE.MeshBasicMaterial({ color: '#bfe4ff', map: ROOM.viewTex || (ROOM.viewTex = txCanvas(128, 100, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd2ff'); gr.addColorStop(0.62, '#e8f6ff'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#9ab8c8'; x.beginPath(); x.moveTo(0, 64); x.quadraticCurveTo(30, 50, 62, 62); x.lineTo(62, 66); x.lineTo(0, 66); x.fill(); x.fillStyle = '#4f9cc8'; x.fillRect(0, 64, w, h - 64); x.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 0; k < 6; k++) x.fillRect(10 + k * 19, 72 + (k % 3) * 8, 12, 2); x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(90, 22, 18, 7, 0, 0, 7); x.ellipse(78, 25, 12, 6, 0, 0, 7); x.fill(); x.fillStyle = '#6fae4a'; x.fillRect(0, h - 10, w, 10); })) }); const frame = new THREE.MeshStandardMaterial({ color: '#f4f2ec', roughness: 0.5 });
    const win = (x, z, ry) => { const gg = new THREE.Group(); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), ROOM.winMat); gg.add(p); for (const [w, h, px, py] of [[1.4, 0.07, 0, 0.53], [1.4, 0.07, 0, -0.53], [0.07, 1.1, 0.67, 0], [0.07, 1.1, -0.67, 0], [0.05, 1.0, 0, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), frame); f.position.set(px, py, 0.02); gg.add(f); } gg.position.set(x, 1.55, z); gg.rotation.y = ry; g.add(gg); };
    if (!H.plain) { win(-W / 4, -D / 2 + 0.01, 0); win(W / 4, -D / 2 + 0.01, 0); win(-W / 2 + 0.01, 0, Math.PI / 2); }
    // front edge: low sill + door mat to show the exit
    const sill = new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, 0.15), base); sill.position.set(0, 0.05, D / 2); g.add(sill);
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshStandardMaterial({ color: '#8a5a3a', roughness: 1 })); mat.rotation.x = -Math.PI / 2; mat.position.set(0, 0.01, D / 2 - 0.4); g.add(mat);
    if (!H.plain) { const ceil = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.12, 20), new THREE.MeshStandardMaterial({ color: '#fff4dc', emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 0.6 })); ceil.position.set(0, WH - 0.1, 0); g.add(ceil); }
    // details: curtains with rods, crown moulding, wall air-con, outlets
    if (!H.plain) { const A = archMats(), cm = ROOM.curM || (ROOM.curM = new THREE.MeshStandardMaterial({ map: txCanvas(64, 128, (x, w, h) => { for (let i = 0; i < w; i++) { const f = 0.8 + 0.2 * Math.cos(i / w * Math.PI * 6); x.fillStyle = `rgb(${244 * f},${206 * f},${170 * f})`; x.fillRect(i, 0, 1, h); } }), roughness: 0.9, side: THREE.DoubleSide }));
      const cur = (x, z, ry) => { const c = sub(g, x, 1.55, z, ry); for (const sx of [-1, 1]) B(c, 0.34, 1.45, 0.05, cm, sx * 0.88, -0.08, 0.09); CY(c, 0.018, 2.2, A.brass, 0, 0.72, 0.1, 6, 0, Math.PI / 2); for (const sx of [-1, 1]) SP(c, 0.035, A.brass, sx * 1.1, 0.72, 0.1, 1, 6); B(c, 1.5, 0.05, 0.14, frame, 0, -0.58, 0.07); };
      cur(-W / 4, -D / 2 + 0.01, 0); cur(W / 4, -D / 2 + 0.01, 0); cur(-W / 2 + 0.01, 0, Math.PI / 2);
      const crown = new THREE.MeshStandardMaterial({ color: '#f6f2ea', roughness: 0.6 }); B(g, W, 0.1, 0.08, crown, 0, WH - 0.05, -D / 2 + 0.04); for (const sx of [-1, 1]) B(g, 0.08, 0.1, D, crown, sx * (W / 2 - 0.04), WH - 0.05, 0);
      const ac = sub(g, W / 2 - 0.02, WH - 0.42, -D / 4, -Math.PI / 2); B(ac, 0.95, 0.3, 0.24, A.acBody, 0, 0, 0.12); B(ac, 0.85, 0.03, 0.02, AM.dark, 0, -0.1, 0.245); B(ac, 0.1, 0.03, 0.01, stdM('#7fe08a', 0.4, 0, { emissive: new THREE.Color('#3aa04a'), emissiveIntensity: 0.8 }), 0.35, 0.08, 0.245);
      for (const [x, z, ry] of [[-W / 2 + 0.01, D / 4, Math.PI / 2], [W / 2 - 0.01, D / 5, -Math.PI / 2], [0, -D / 2 + 0.01, 0]]) { const o = sub(g, x, 0.3, z, ry); B(o, 0.08, 0.12, 0.01, crown, 0, 0, 0.005); B(o, 0.08, 0.1, 0.01, crown, 0, 0.9, 0.005); } }
    ROOM.size = S; this.refreshFurniture();
  },
  refreshFurniture() {
    const H = this.home(); if (ROOM.fg) ROOM.group.remove(ROOM.fg); ROOM.fg = new THREE.Group(); ROOM.group.add(ROOM.fg); ROOM.spin = []; ROOM.tank = []; ROOM.clocks = [];
    for (const it of H.items) { const m = this.furnMesh(it); ROOM.fg.add(m); }
  },
  furnMesh(it) {
    const F = FURN.find(f => f.id === it.id), S = ROOM.size, m = makeFurniture(it.id); m.userData.it = it;
    if (F.wall) { const W = S.w, D = S.d, y = it.y || 1.6; if (it.wall === 'left') { m.position.set(-W / 2 + 0.03, y, it.x); m.rotation.y = Math.PI / 2; } else if (it.wall === 'right') { m.position.set(W / 2 - 0.03, y, it.x); m.rotation.y = -Math.PI / 2; } else m.position.set(it.x, y, -D / 2 + 0.03); }
    else { m.position.set(it.x, 0, it.z); m.rotation.y = it.rot || 0; }
    m.traverse(o => { if (o.isMesh) { o.castShadow = !F.flat; o.receiveShadow = true; } }); return m;
  },
  // ---------- per frame inside ----------
  updateRoom(dt) {
    const S = ROOM.size, H = this.home();
    if (!this.roomEdit && !this.modal && !DIALOG.npc) {
      const [ix, iz, l] = moveInput(); let spd = 0;
      if (l > 0.05) { const run = KEYS.ShiftLeft || KEYS.ShiftRight; spd = (run ? 3.6 : 2.0) * l; const a = Math.atan2(ix, -iz); PL.rot = angLerp(PL.rot, a, Math.min(1, dt * 12));
        let nx = PL.x + Math.sin(PL.rot) * spd * dt, nz = PL.z + Math.cos(PL.rot) * spd * dt; nx = clamp(nx, -S.w / 2 + 0.35, S.w / 2 - 0.35); nz = clamp(nz, -S.d / 2 + 0.35, S.d / 2 - 0.2);
        if (!this.roomBlocked(nx, PL.z)) PL.x = nx; if (!this.roomBlocked(PL.x, nz)) PL.z = nz;
        if (PL.z > S.d / 2 - 0.3 && iz < -0.1 && Math.abs(PL.x) < 0.8) this.exitHome(); }
      PL.speed = spd; animateHero(dt, spd);
    } else animateHero(dt, 0);
    PL.mesh.position.set(PL.x, 0, PL.z); PL.mesh.rotation.y = PL.rot; PL.mesh.scale.setScalar(1);
    // light by time of day
    const hf = currentHour(), day = clamp(1 - Math.abs(hf - 13) / 7, 0, 1); ROOM.sun.intensity = 0.3 + day * 1.4; ROOM.lamp.intensity = 2.2 * (1 - day) + 0.3; ROOM.env.intensity = 0.15 + day * 0.15;
    ROOM.winMat.color.set(day > 0.3 ? '#bfe4ff' : day > 0.05 ? '#f6b98a' : '#1d2a4a');
    for (const s of ROOM.spin) s.rotation.z += dt * 6; const t = performance.now() / 1000;
    for (const f of ROOM.tank) { f.userData.a += dt * f.userData.sp; f.position.x = Math.sin(f.userData.a) * f.userData.r; f.rotation.y = Math.cos(f.userData.a) > 0 ? 0 : Math.PI; f.position.y = f.userData.y + Math.sin(t * 1.3 + f.userData.a) * 0.03; }
    if (!ROOM._ct || t - ROOM._ct > 20) { ROOM._ct = t; ROOM.clocks.forEach(c => c()); }
    // camera
    const back = S.d / 2 + 3.6 + S.w * 0.18, hgt = 4.4 + S.w * 0.22; const tx = this.roomEdit ? 0 : PL.x * 0.35, tz = this.roomEdit ? 0 : PL.z * 0.25;
    camera.position.lerp(new THREE.Vector3(tx, hgt + (this.roomEdit ? 3.2 : 0), back + tz * 0.5 + (this.roomEdit ? 1.2 : 0)), Math.min(1, dt * 4)); camera.lookAt(tx, this.roomEdit ? -1.2 : 0.4, tz - 0.6 + (this.roomEdit ? 1.6 : 0));
    if (this.roomEdit) this.roomEditUpdate();
  },
  roomBlocked(x, z) { for (const it of this.home().items) { const F = FURN.find(f => f.id === it.id); if (F.wall || F.flat || F.low) continue; const c = Math.cos(it.rot || 0), s = Math.sin(it.rot || 0), dx = x - it.x, dz = z - it.z, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < F.w / 2 + 0.22 && Math.abs(lz) < F.d / 2 + 0.22) return true; } return false; },
  roomNear() { // furniture the player is facing/near
    let best = null, bd = 1.6; for (const it of this.home().items) { const F = FURN.find(f => f.id === it.id); if (!F.act || F.wall) continue; const d = Math.hypot(PL.x - it.x, PL.z - it.z) - Math.max(F.w, F.d) / 2; if (d < bd) { bd = d; best = { it, F }; } } return best; },
  roomPrompt() {
    if (this.roomEdit) return ''; const S = ROOM.size; if (PL.z > S.d / 2 - 1.0 && Math.abs(PL.x) < 1) return 'Space：外に出る';
    const n = this.roomNear(); if (!n) return ''; return { bed: 'Space：ひと休みする', tv: 'Space：テレビを見る（島だより）', tank: 'Space：水槽をながめる', piano: 'Space：ピアノをひく', guitar: 'Space：ギターをひく' }[n.F.act] || '';
  },
  roomAct() {
    const S = ROOM.size; if (PL.z > S.d / 2 - 1.0 && Math.abs(PL.x) < 1) { this.exitHome(); return; }
    const n = this.roomNear(); if (!n) return;
    if (n.F.act === 'bed') this.fade(() => UI.toast('💤 ぐっすり休んだ。元気いっぱい！'));
    if (n.F.act === 'tv') { const ls = this.p.letters || [], L = [...ls].reverse().find(l => l.read); if (L) this.openLetter(L.no); else UI.toast('📺 島のニュース：きょうも島はおだやかです'); }
    if (n.F.act === 'tank') { const ids = Object.keys(this.p.fish || {}); UI.toast(ids.length ? `🐟 ${ids.slice(0, 4).map(id => FISH.find(f => f.id === id).name).join('・')} が泳いでいる` : '🐟 まだ魚がいません。釣りをしてみよう'); }
    if (n.F.act === 'piano' || n.F.act === 'guitar') playTune(n.F.act);
  },
  // ---------- room UI ----------
  roomUI() {
    const el = this.el.roomp; el.hidden = false; document.getElementById('buildBtn').hidden = true;
    el.innerHTML = `<button data-r="edit" class="${this.roomEdit ? 'on' : ''}">🛋️ 模様がえ <kbd>B</kbd></button><button data-r="cat">📖 カタログ <kbd>C</kbd></button><button data-r="out">🚪 外に出る</button>`;
    el.onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; const k = b.dataset.r; if (k === 'edit') this.toggleRoomEdit(); if (k === 'cat') this.openCatalog(); if (k === 'out') this.exitHome(); document.getElementById('c').focus(); };
    if (this.roomEdit) this.roomEditPanel(); else this.el.roome.hidden = true;
  },
  toggleRoomEdit(on) { this.roomEdit = on === undefined ? !this.roomEdit : on; ROOM.pick = null; ROOM.sel = null; if (ROOM.ghost) { ROOM.scene.remove(ROOM.ghost); ROOM.ghost = null; } this.roomUI(); },
  roomEditPanel() {
    const H = this.home(), el = this.el.roome; el.hidden = false; const own = FURN.filter(f => (H.store[f.id] || 0) > 0);
    el.innerHTML = `<div class="rh"><b>模様がえ</b><span class="sub">${ROOM.pick ? `「${FURN.find(f => f.id === ROOM.pick.id).name}」を置く場所をクリック（R で回す）` : '置いてある家具をクリックすると動かせます。下の家具をえらぶと置けます'}</span></div>
      <div class="rl">${own.map(f => `<button data-f="${f.id}" class="${ROOM.sel === f.id ? 'on' : ''}">${FURN_ICON[f.cat] || '🪑'} ${f.name} ×${H.store[f.id]}</button>`).join('') || '<span class="sub">しまってある家具はありません（カタログで買えます）</span>'}</div>
      <div class="rb">${ROOM.pick ? `<button data-e="store">しまう</button><button data-e="rot">回す <kbd>R</kbd></button>` : ''}<span class="sp"></span><button data-e="done" class="primary">おわる</button></div>`;
    el.onclick = e => { const f = e.target.closest('[data-f]'); if (f) { ROOM.pick = { id: f.dataset.f, rot: 0, fromStore: true }; ROOM.sel = f.dataset.f; this.makeGhost(); this.roomEditPanel(); return; }
      const b = e.target.closest('[data-e]'); if (!b) return; const k = b.dataset.e;
      if (k === 'done') this.toggleRoomEdit(false);
      if (k === 'rot' && ROOM.pick) { ROOM.pick.rot = ((ROOM.pick.rot || 0) + Math.PI / 2) % (Math.PI * 2); }
      if (k === 'store' && ROOM.pick) { H.store[ROOM.pick.id] = (H.store[ROOM.pick.id] || 0) + (ROOM.pick.fromStore ? 0 : 1); ROOM.pick = null; ROOM.sel = null; if (ROOM.ghost) { ROOM.scene.remove(ROOM.ghost); ROOM.ghost = null; } this.dirty = true; this.roomEditPanel(); }
      document.getElementById('c').focus(); };
  },
  makeGhost() { if (ROOM.ghost) ROOM.scene.remove(ROOM.ghost); const g = makeFurniture(ROOM.pick.id); g.traverse(o => { if (o.isMesh) { o.material = ROOM_GHOST; o.castShadow = false; } }); ROOM.ghost = g; ROOM.scene.add(g); },
  roomRay() { const m = EDIT.mouse; if (!m) return null; const r = renderer.domElement.getBoundingClientRect(); _ndc.set((m.x - r.left) / r.width * 2 - 1, -(m.y - r.top) / r.height * 2 + 1); _ray.setFromCamera(_ndc, camera); return _ray.ray; },
  roomTarget() { // where the mouse points: floor point or wall spot
    const ray = this.roomRay(); if (!ray) return null; const S = ROOM.size, o = ray.origin, d = ray.direction, out = {};
    if (d.y < 0) { const t = -o.y / d.y; out.floor = { x: o.x + d.x * t, z: o.z + d.z * t }; }
    for (const [name, axis, val] of [['back', 'z', -S.d / 2], ['left', 'x', -S.w / 2], ['right', 'x', S.w / 2]]) { const t = (val - o[axis]) / d[axis]; if (t <= 0) continue; const p = { x: o.x + d.x * t, y: o.y + d.y * t, z: o.z + d.z * t }; if (p.y < 0.4 || p.y > 2.6) continue; const u = name === 'back' ? p.x : p.z, lim = name === 'back' ? S.w / 2 : S.d / 2; if (Math.abs(u) > lim - 0.3) continue; if (!out.wall || t < out.wall.t) out.wall = { name, u, y: p.y, t }; }
    return out;
  },
  placePlan() {
    const P = ROOM.pick; if (!P) return null; const F = FURN.find(f => f.id === P.id), S = ROOM.size, tg = this.roomTarget(); if (!tg) return null; const snap = v => Math.round(v * 4) / 4;
    if (F.wall) { if (!tg.wall) return null; const w = tg.wall; return { wall: w.name, x: snap(w.u), y: clamp(snap(w.y), 0.9, 2.2), ok: true }; }
    if (!tg.floor) return null; const rot = P.rot || 0, sw = Math.abs(Math.cos(rot)) > 0.5 ? F.w : F.d, sd = Math.abs(Math.cos(rot)) > 0.5 ? F.d : F.w;
    const x = clamp(snap(tg.floor.x), -S.w / 2 + sw / 2 + 0.02, S.w / 2 - sw / 2 - 0.02), z = clamp(snap(tg.floor.z), -S.d / 2 + sd / 2 + 0.02, S.d / 2 - sd / 2 - 0.02);
    let ok = true; if (!F.flat) for (const it of this.home().items) { if (it === P.item) continue; const G = FURN.find(f => f.id === it.id); if (G.wall || G.flat) continue; const gr = it.rot || 0, gw = Math.abs(Math.cos(gr)) > 0.5 ? G.w : G.d, gd = Math.abs(Math.cos(gr)) > 0.5 ? G.d : G.w; if (Math.abs(x - it.x) < (sw + gw) / 2 - 0.02 && Math.abs(z - it.z) < (sd + gd) / 2 - 0.02) ok = false; }
    if (!F.flat && Math.abs(x) < 0.9 + sw / 2 && z + sd / 2 > S.d / 2 - 1.0) ok = false; // keep the doorway clear
    return { x, z, rot, ok };
  },
  roomEditUpdate() {
    if (!ROOM.pick || !ROOM.ghost) { this.roomHover(); return; } const pl = this.placePlan(); if (!pl) { ROOM.ghost.visible = false; return; } ROOM.ghost.visible = true; const S = ROOM.size;
    if (pl.wall) { const y = pl.y; if (pl.wall === 'left') { ROOM.ghost.position.set(-S.w / 2 + 0.03, y, pl.x); ROOM.ghost.rotation.y = Math.PI / 2; } else if (pl.wall === 'right') { ROOM.ghost.position.set(S.w / 2 - 0.03, y, pl.x); ROOM.ghost.rotation.y = -Math.PI / 2; } else { ROOM.ghost.position.set(pl.x, y, -S.d / 2 + 0.03); ROOM.ghost.rotation.y = 0; } }
    else { ROOM.ghost.position.set(pl.x, 0.01, pl.z); ROOM.ghost.rotation.y = pl.rot; } ROOM_GHOST.color.set(pl.ok ? '#7cf0a0' : '#ff6f6f');
  },
  roomHover() { const tg = this.roomTarget(); let hit = null; if (tg) { const H = this.home(); let bd = 0.9;
      for (const it of H.items) { const F = FURN.find(f => f.id === it.id); let d; if (F.wall) { if (!tg.wall || tg.wall.name !== (it.wall || 'back')) continue; d = Math.hypot(tg.wall.u - it.x, tg.wall.y - (it.y || 1.6)); } else { if (!tg.floor) continue; d = Math.hypot(tg.floor.x - it.x, tg.floor.z - it.z) - Math.min(F.w, F.d) * 0.3; } if (d < bd) { bd = d; hit = it; } } }
    ROOM.hover = hit; ROOM.fg.children.forEach(m => m.traverse(o => { if (!o.isMesh) return; if (o.userData.base === undefined) o.userData.base = o.material; o.material = m.userData.it === hit ? ROOM_HOVER : o.userData.base; })); },
  roomClick() {
    if (!this.roomEdit) return; const H = this.home();
    if (ROOM.pick) { const pl = this.placePlan(); if (!pl || !pl.ok) { UI.toast('ここには置けません'); return; } const P = ROOM.pick;
      const it = P.item || { id: P.id }; if (pl.wall) Object.assign(it, { wall: pl.wall, x: pl.x, y: pl.y }); else Object.assign(it, { x: pl.x, z: pl.z, rot: pl.rot }); if (!P.item) { H.items.push(it); H.store[P.id]--; }
      ROOM.pick = null; ROOM.sel = null; if (ROOM.ghost) { ROOM.scene.remove(ROOM.ghost); ROOM.ghost = null; } this.refreshFurniture(); this.dirty = true; this.roomEditPanel(); return; }
    const it = ROOM.hover; if (!it) return; H.items.splice(H.items.indexOf(it), 1); ROOM.pick = { id: it.id, rot: it.rot || 0, item: null, fromStore: false }; H.store[it.id] = (H.store[it.id] || 0) + 1; ROOM.pick.fromStore = true; ROOM.sel = it.id; this.refreshFurniture(); this.makeGhost(); this.dirty = true; this.roomEditPanel();
  },
  // ---------- catalog ----------
  openCatalog(tab) {
    const p = this.p, H = this.home(), lv = this.level(); this.modal = 'catalog'; this.cTab = tab || this.cTab || 'furn';
    let body = '';
    if (this.cTab === 'furn' || this.cTab === 'wall') { const list = FURN.filter(f => !f.ev && (this.cTab === 'wall' ? f.wall : !f.wall)); const cats = [...new Set(list.map(f => f.cat))];
      body = cats.map(c => `<h3 class="bh">${FURN_ICON[c] || ''} ${c}</h3><ul class="glist">${list.filter(f => f.cat === c).map(f => { const n = (H.store[f.id] || 0) + H.items.filter(i => i.id === f.id).length; return `<li><div class="th">${furnThumb(f.id)}</div><div class="in"><b>${esc(f.name)}</b><span class="own">${n ? `持っている ${n}` : '　'}</span></div><button class="buy" data-buy="${f.id}" ${p.money < f.price ? 'disabled' : ''}>${yen(f.price)}</button></li>`; }).join('')}</ul>`).join(''); }
    if (this.cTab === 'deco') body = `<h3 class="bh">かべがみ</h3><div class="paints">${WALLS.map(([k, n, pr]) => `<button class="pt ${H.wall === k ? 'on' : ''}" data-wall="${k}" ${!H.wallsOwned[k] && p.money < pr ? 'disabled' : ''}><i style="background:${WALL_SW[k]}"></i>${n} ${H.wallsOwned[k] ? '' : yen(pr)}</button>`).join('')}</div>
      <h3 class="bh">ゆか</h3><div class="paints">${FLOORS.map(([k, n, pr]) => `<button class="pt ${H.floor === k ? 'on' : ''}" data-floor="${k}" ${!H.floorsOwned[k] && p.money < pr ? 'disabled' : ''}><i style="background:${FLOOR_SW[k]}"></i>${n} ${H.floorsOwned[k] ? '' : yen(pr)}</button>`).join('')}</div><p class="small">一度買ったかべがみ・ゆかは、いつでもただで切りかえられます。</p>`;
    if (this.cTab === 'reform') body = `<ul class="glist wide">${[2, 3].map(l => { const R = ROOM_SIZES[l], own = H.size >= l, can = H.size === l - 1 && R.lv <= lv; return `<li class="${R.lv > lv ? 'lk' : ''}"><div class="th">🏗️</div><div class="in"><b>${R.name}（${R.w}m×${R.d}m）</b><span class="own">タクミが部屋を広げてくれます。家具はそのまま</span></div><button class="buy" data-reform="${l}" ${own || !can || p.money < R.price ? 'disabled' : ''}>${own ? '済み' : R.lv > lv ? `🔒Lv${R.lv}` : yen(R.price)}</button></li>`; }).join('')}</ul><p class="small">いまの部屋：${ROOM_SIZES[H.size].name}（${ROOM_SIZES[H.size].w}m×${ROOM_SIZES[H.size].d}m）</p>`;
    this.el.modal.innerHTML = `<div class="mbox shopbox catbox"><div class="mh"><h2>家具カタログ</h2><span class="isl">所持金 ${yen(p.money)}　・　買った家具は家にとどきます（模様がえで置けます）</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
      <div class="tabs">${[['furn', '家具'], ['wall', '壁にかける'], ['deco', 'かべがみ・ゆか'], ['reform', 'リフォーム']].map(([k, n]) => `<button data-ct="${k}" class="${this.cTab === k ? 'on' : ''}">${n}</button>`).join('')}</div><div class="mb">${body}</div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.catbox').onclick = e => { const t = e.target.closest('[data-ct]'); if (t) return this.openCatalog(t.dataset.ct); if (e.target.closest('[data-x="close"]')) return this.closeModal();
      const b = e.target.closest('[data-buy]'); if (b && !b.disabled) { const f = FURN.find(q => q.id === b.dataset.buy); p.money -= f.price; H.store[f.id] = (H.store[f.id] || 0) + 1; p.stats.furnN = (p.stats.furnN || 0) + 1; UI.toast(`📦 ${f.name}を買った！ 家の「模様がえ」で置けます`); this.dirty = true; this.check(); this.renderTracker(); if (this.inside && this.roomEdit) this.roomEditPanel(); return this.openCatalog(); }
      const wl = e.target.closest('[data-wall]'); if (wl && !wl.disabled) { const k = wl.dataset.wall, pr = WALLS.find(w => w[0] === k)[2]; if (!H.wallsOwned[k]) { p.money -= pr; H.wallsOwned[k] = 1; } H.wall = k; this.dirty = true; if (this.inside) this.buildRoom(); this.renderTracker(); return this.openCatalog(); }
      const fl = e.target.closest('[data-floor]'); if (fl && !fl.disabled) { const k = fl.dataset.floor, pr = FLOORS.find(w => w[0] === k)[2]; if (!H.floorsOwned[k]) { p.money -= pr; H.floorsOwned[k] = 1; } H.floor = k; this.dirty = true; if (this.inside) this.buildRoom(); this.renderTracker(); return this.openCatalog(); }
      const rf = e.target.closest('[data-reform]'); if (rf && !rf.disabled) { const l = +rf.dataset.reform; p.money -= ROOM_SIZES[l].price; H.size = l; UI.toast(`🏗️ 部屋が「${ROOM_SIZES[l].name}」になった！`); this.dirty = true; this.check(); if (this.inside) { this.buildRoom(); PL.x = 0; PL.z = ROOM_SIZES[l].d / 2 - 0.8; } this.renderTracker(); return this.openCatalog(); } };
  },
});
const FURN_ICON = { '寝る': '🛏️', 'くつろぐ': '🛋️', 'しきもの': '🟫', 'キッチン': '🍳', 'しまう': '🗄️', 'かざる': '🪴', '楽器': '🎹', '壁': '🖼️' };
const FURN_EMOJI = { bed_single: '🛏️', bed_double: '🛏️', futon: '🛌', sofa: '🛋️', sofa1: '💺', table_low: '🪵', kotatsu: '🍊', zabuton: '🟧', tv: '📺', rug_round: '⭕', rug_tatami: '🟩', rug_stripe: '🟦', dining: '🍽️', kitchen: '🍳', fridge: '🧊', bookshelf: '📚', tansu: '🗄️', desk: '✏️', plant_big: '🪴', bonsai: '🌳', floorlamp: '💡', fishtank: '🐠', goldfish: '🐟', maneki: '🐱', mikanbox: '🍊', model_ship: '🚢', telescope: '🔭', fan: '🌀', stove: '🔥', piano: '🎹', guitar: '🎸', clock: '🕰️', painting: '🖼️', gyotaku: '🐟', calendar: '📅', shelf: '🧸', window2: '⭕' };
const furnThumb = id => FURN_EMOJI[id] || '🪑';
const ROOM_GHOST = new THREE.MeshBasicMaterial({ color: '#7cf0a0', transparent: true, opacity: 0.5, depthWrite: false });
const ROOM_HOVER = new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0.8 });
const WALL_SW = { plaster: '#f4f0e6', wood: '#c69a6a', tsuchi: '#c8a878', dot: '#ffd0dc', sea: '#8ccbe8', star: '#1f2a5a' };
const FLOOR_SW = { wood: '#a87a4a', tatami: '#c8c87a', tile: '#e8e8e8', carpet: '#4a6ab0', ichimatsu: '#7a8a4a', cherry: '#e0b07a' };
const _texCache = {};
function wallTex(k, w = 8) {
  const key = k + w; if (_texCache[key]) return _texCache[key]; const [c, x] = cvs(512, 256); const s = 512 / w;
  if (k === 'plaster') { x.fillStyle = '#f4f0e6'; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 2000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`; x.fillRect(Math.random() * 512, Math.random() * 256, 2, 2); } }
  if (k === 'wood') { for (let i = 0; i < 512; i += s * 0.18) { x.fillStyle = `hsl(28,${40 + Math.random() * 10}%,${46 + Math.random() * 8}%)`; x.fillRect(i, 0, s * 0.18, 256); x.fillStyle = 'rgba(60,30,10,.35)'; x.fillRect(i, 0, 1.5, 256); } }
  if (k === 'tsuchi') { x.fillStyle = '#c8a878'; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,210' : '90,60,30'},0.08)`; x.fillRect(Math.random() * 512, Math.random() * 256, 2, 2); } x.fillStyle = '#5a3a20'; x.fillRect(0, 150, 512, 8); }
  if (k === 'dot') { x.fillStyle = '#ffe0e8'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#ffffff'; for (let j = 0; j < 256; j += 24) for (let i = (j / 24 % 2) * 12; i < 512; i += 24) { x.beginPath(); x.arc(i, j, 5, 0, 7); x.fill(); } }
  if (k === 'sea') { for (let j = 0; j < 256; j += 32) { x.fillStyle = (j / 32) % 2 ? '#ffffff' : '#8ccbe8'; x.fillRect(0, j, 512, 32); } }
  if (k === 'star') { x.fillStyle = '#1f2a5a'; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 160; i++) { x.fillStyle = Math.random() < 0.2 ? '#ffe9a8' : '#ffffff'; const r = Math.random() * 1.8 + 0.4; x.beginPath(); x.arc(Math.random() * 512, Math.random() * 256, r, 0, 7); x.fill(); } }
  const t = toTex(c, false); return (_texCache[key] = t);
}
function floorTex(k, W = 8, D = 8) {
  const key = 'f' + k + W + D; if (_texCache[key]) return _texCache[key]; const [c, x] = cvs(512, 512);
  if (k === 'wood' || k === 'cherry') { const L = k === 'wood' ? 38 : 60; for (let j = 0; j < 512; j += 20) { let i = -(j * 37 % 100); while (i < 512) { const len = 80 + Math.random() * 80; x.fillStyle = `hsl(30,${45 + Math.random() * 10}%,${L + Math.random() * 8}%)`; x.fillRect(i, j, len, 20); x.fillStyle = 'rgba(40,20,5,.35)'; x.fillRect(i, j, 1.5, 20); i += len; } x.fillStyle = 'rgba(40,20,5,.3)'; x.fillRect(0, j, 512, 1.5); } }
  if (k === 'tatami') { for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) { const vert = (i + j) % 2; x.fillStyle = '#c8c87a'; x.fillRect(i * 256, j * 128, 256, 128); x.strokeStyle = 'rgba(80,90,30,.25)'; for (let q = 0; q < 40; q++) { x.beginPath(); if (vert) { x.moveTo(i * 256 + q * 6.4, j * 128); x.lineTo(i * 256 + q * 6.4, j * 128 + 128); } else { x.moveTo(i * 256, j * 128 + q * 3.2); x.lineTo(i * 256 + 256, j * 128 + q * 3.2); } x.stroke(); } x.fillStyle = '#3a4a2a'; x.fillRect(i * 256, j * 128, 256, 5); x.fillRect(i * 256, j * 128, 5, 128); } }
  if (k === 'tile' || k === 'ichimatsu') { const n = k === 'tile' ? 8 : 6; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = (i + j) % 2 ? (k === 'tile' ? '#2a2a2e' : '#7a8a4a') : (k === 'tile' ? '#f2f2ee' : '#e8e0c8'); x.fillRect(i * 512 / n, j * 512 / n, 512 / n, 512 / n); } }
  if (k === 'carpet') { x.fillStyle = '#4a6ab0'; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`; x.fillRect(Math.random() * 512, Math.random() * 512, 1, 1); } }
  const t = toTex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / (k === 'tatami' ? 3.6 : 4), D / (k === 'tatami' ? 3.6 : 4)); return (_texCache[key] = t);
}
let _actx = null;
function playTune(kind) {
  try { _actx = _actx || new (window.AudioContext || window.webkitAudioContext)(); const a = _actx, now = a.currentTime, notes = kind === 'piano' ? [523, 659, 784, 1047, 784, 659, 523, 587, 698, 880] : [196, 247, 294, 392, 294, 247, 330, 392];
    notes.forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = kind === 'piano' ? 'triangle' : 'sawtooth'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, now + i * 0.22); g.gain.exponentialRampToValueAtTime(kind === 'piano' ? 0.18 : 0.08, now + i * 0.22 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.5); o.connect(g).connect(a.destination); o.start(now + i * 0.22); o.stop(now + i * 0.22 + 0.55); });
    UI.toast(kind === 'piano' ? '🎹 ♪ ポロロン…' : '🎸 ♪ ジャラーン'); } catch (e) { UI.toast('🎵 ♪'); }
}
STAT_KEYS.push('furnN');
DAILY_POOL.push({ id: 'furn1', who: 'v_hana', text: '家具を1つ買う', n: 1, stat: 'furnN', need: p => (p.money || 0) >= 400, ask: 'お部屋に新しい家具を置いてみたら？ 商店のカタログで買えるわよ。' });
GOALS.push({ id: 'furn5', text: '家具を5つ買う', n: 5, stat: 'furnN', pts: 20 }, { id: 'reform', text: '部屋を広くする', n: 1, prog: () => (GAME.p.home && GAME.p.home.size > 1) ? 1 : 0, pts: 30 });
const _econRecs0 = GAME.econRecs;
GAME.econRecs = function (C) { _econRecs0.call(this, C); const p = this.p; if (!p.stats.furnN && p.money >= 1500) C.push({ pri: 53, icon: '🛋️', text: '家の中で模様がえができます。玄関の前で Space で入って、カタログ（C）で家具を買ってみてね。', at: PLACED.home ? { x: PLACED.home.mail.x, z: PLACED.home.mail.z } : null }); };
