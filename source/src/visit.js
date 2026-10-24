// ===================== VISITING VILLAGERS' HOUSES =====================
// each villager has a furnished room; you can drop in when they are at home and you are friends (なかよし3〜)
const VROOM = {
  v_mio: { wall: 'sea', floor: 'wood', gift: 'telescope', items: [['bed_single', -2.4, -1.7, 0], ['desk', 2.3, -2.3, 0], ['telescope', 2.7, 0.6, -0.6], ['rug_round', -0.4, 0.4, 0], ['model_ship', -0.6, -2.6, 0], ['floorlamp', -3.0, 0.9, 0], ['w:painting', 'back', -0.2, 1.6], ['w:clock', 'left', -0.5, 2.0]] },
  v_sora: { wall: 'wood', floor: 'wood', gift: 'guitar', items: [['futon', -2.3, -1.8, 0], ['tv', 2.2, -2.5, 0], ['fishtank', -2.9, 1.0, Math.PI / 2], ['guitar', 2.9, 0.4, -Math.PI / 2], ['rug_stripe', 0.2, 0.0, 0], ['w:gyotaku', 'back', -0.2, 1.7], ['w:calendar', 'right', -1.0, 1.7]] },
  v_hana: { wall: 'dot', floor: 'cherry', gift: 'plant_big', items: [['bed_single', -2.4, -1.7, 0], ['plant_big', 2.9, -2.5, 0], ['plant_big', -2.9, 1.2, 0], ['bonsai', 2.4, -0.4, 0], ['table_low', 0.3, -0.4, 0], ['zabuton', 0.3, 0.4, 0], ['rug_round', 0.3, 0.0, 0], ['floorlamp', 2.9, 1.2, 0], ['w:painting', 'back', 0.6, 1.6]] },
  v_gen: { wall: 'tsuchi', floor: 'tatami', gift: 'model_ship', items: [['futon', -2.3, -1.8, 0], ['kotatsu', 0.4, -0.4, 0], ['tansu', 2.3, -2.6, 0], ['model_ship', 2.8, -0.6, -Math.PI / 2], ['maneki', -2.9, 1.0, Math.PI / 2], ['stove', 2.8, 1.0, 0], ['w:gyotaku', 'back', -0.4, 1.7], ['w:clock', 'right', -1.2, 2.0]] },
  v_rin: { wall: 'plaster', floor: 'carpet', gift: 'bookshelf', items: [['bed_single', -2.4, -1.7, 0], ['bookshelf', 0.4, -2.65, 0], ['desk', 2.3, -2.3, 0], ['piano', 2.5, 0.9, -Math.PI / 2], ['rug_round', -0.4, 0.4, 0], ['plant_big', -3.0, 1.2, 0], ['w:calendar', 'left', -0.4, 1.7]] },
  v_kai: { wall: 'plaster', floor: 'tile', gift: 'maneki', items: [['bed_single', -2.4, -1.7, 0], ['kitchen', 1.9, -2.6, 0], ['fridge', 3.1, -1.2, -Math.PI / 2], ['dining', 0.3, -0.5, 0], ['maneki', -3.0, 1.1, Math.PI / 2], ['mikanbox', 2.9, 1.1, -Math.PI / 2], ['w:clock', 'back', -0.4, 2.0]] },
  v_nagi: { wall: 'sea', floor: 'wood', gift: 'fishtank', items: [['bed_single', -2.4, -1.7, 0], ['fishtank', 2.4, -2.6, 0], ['goldfish', 2.9, 0.6, 0], ['rug_stripe', 0.0, 0.2, 0], ['w:gyotaku', 'back', -0.3, 1.7], ['w:gyotaku', 'left', 0.6, 1.7]] },
  v_takumi: { wall: 'wood', floor: 'tatami', gift: 'tansu', items: [['futon', -2.3, -1.8, 0], ['tansu', 2.3, -2.6, 0], ['table_low', 0.4, -0.4, 0], ['zabuton', 0.4, 0.4, 0], ['stove', 2.8, 0.9, 0], ['shelf', -2.9, 1.0, Math.PI / 2], ['w:calendar', 'back', 0.4, 1.7]] },
  v_yuki: { wall: 'plaster', floor: 'cherry', gift: 'painting', items: [['bed_single', -2.4, -1.7, 0], ['desk', 2.3, -2.3, 0], ['sofa1', 2.6, 0.8, -Math.PI / 2], ['plant_big', -3.0, 1.2, 0], ['floorlamp', 0.8, -2.6, 0], ['w:painting', 'back', -0.3, 1.6], ['w:painting', 'left', 0.8, 1.6]] },
  v_kota: { wall: 'star', floor: 'carpet', gift: 'goldfish', items: [['bed_single', -2.4, -1.7, 0], ['tv', 2.2, -2.5, 0], ['rug_round', 0.0, 0.2, 0], ['telescope', 2.8, 0.8, -0.7], ['goldfish', -2.9, 1.1, 0], ['w:calendar', 'right', -1.0, 1.7]] },
};
const VISIT_LINES = {
  v_mio: ['いらっしゃい！ 散らかっててごめんね〜。', 'その望遠鏡でね、夜は灯台と星を見てるんだ。', '海の色の壁紙、すてきでしょ？ じぶんではったの！'],
  v_sora: ['おっ、{P}！ 上がれ上がれ！', '見ろよ、あの魚拓。オレの自己ベストだぜ！', '水そうの魚、ぜんぶオレが釣ったんだ。'],
  v_hana: ['まあ、{P}さん。ようこそ。お茶をいれるわね。', 'お部屋にもお花がないと落ち着かないの。', 'この盆栽、おじいちゃんから受けついだのよ。'],
  v_gen: ['おう、よう来たのう。こたつに入っていけ。', 'この船の模型はの、わしが若いころ乗っとった船じゃ。', '魚拓はわしの宝物じゃよ。'],
  v_rin: ['{P}さん！ ようこそ、わたしの部屋へ。', '本だな、島の歴史の本でいっぱいなの。', 'ピアノ、ちょっとだけひけるんだ。'],
  v_kai: ['いらっしゃいませ〜！ …って、ここはぼくの家だった！', '料理の練習中なんだ。いつかお店でお弁当を売りたいな。', '招き猫はお店の守り神なんだよ。'],
  _: ['いらっしゃい！ ゆっくりしていってね。', '家に人が来るのって、うれしいな。'],
};
GAME.visit = null;
function villagerHouse(n) { if (n.house) return n.house; const H = n.home0 || { x: n.hx, z: n.hz }; let best = null, bd = 30; for (const h of PLACED.houses) { if (h.home) continue; const d = Math.hypot(h.x - H.x, h.z - H.z); if (d < bd) { bd = d; best = h; } } n.house = best; return best; }
function doorOf(h) { const [x, z] = toWorld(h, 0, h.d / 2 + 0.9); return { x, z }; }
GAME.nearVillaHouse = function () {
  if (!this.p || PL.veh || this.inside) return null;
  for (const n of NPCS) { if (n.visitor || !n.live) continue; const h = villagerHouse(n); if (!h) continue; const d = doorOf(h); if (Math.hypot(PL.x - d.x, PL.z - d.z) < 1.6) return n; }
  return null;
};
{ const _p = GAME.prompt; GAME.prompt = function () { const r = _p.apply(this, arguments); if (r) return r; const n = this.nearVillaHouse(); if (n) return `Space：${n.def.name}の家をたずねる`; return r; }; }
{ const _i = GAME.interact; GAME.interact = function () { const n = !PL.veh && this.p && !this.nearDoor() && this.nearVillaHouse(); if (n) { this.tryVisit(n); return true; } return _i.apply(this, arguments); }; }
GAME.tryVisit = function (n) {
  const p = this.p, f = p.friend[n.def.id] || 0, nm = n.def.name;
  if (n.asleep) { UI.toast(`🌙 ${nm}はもう寝ているみたい…（また明日たずねてね）`); return; }
  const atHome = n.place === 'home' || n.place === 'garden';
  if (!p.talked[n.def.id]) { UI.toast(`ここは${nm}の家みたい。まずは${nm}に話しかけてみよう`); return; }
  if (f < 3) { UI.toast(`🚪 コンコン…　${nm}ともう少しなかよくなったら、遊びに行けそう（なかよし 3〜）`); return; }
  if (!atHome) { UI.toast(`🚪 コンコン…　${nm}は出かけているみたい（${LIVE.status(n.def.id).replace('📍', '')}）`); return; }
  this.enterVisit(n);
};
GAME.enterVisit = function (n) {
  const V = VROOM[n.def.id] || { wall: 'wood', floor: 'wood', items: [['bed_single', -2.4, -1.7, 0], ['table_low', 0.4, -0.4, 0], ['plant_big', 2.9, -2.5, 0]] };
  const room = { size: 1, wall: V.wall, floor: V.floor, store: {}, items: V.items.map(a => a[0].startsWith('w:') ? { id: a[0].slice(2), wall: a[1], x: a[2], y: a[3] } : { id: a[0], x: a[1], z: a[2], rot: a[3] }), visitor: true };
  this.visit = { n, room, house: villagerHouse(n) }; SND && SND.play && (() => { try { SND.play('door_open', { vol: 0.7 }); } catch (e) { } })();
  this.fade(() => {
    this.buildRoom(); this.inside = true; this.outPos = { x: PL.x, z: PL.z, rot: PL.rot };
    scene.remove(PL.mesh); ROOM.scene.add(PL.mesh); const S = ROOM_SIZES[1]; PL.x = 0; PL.z = S.d / 2 - 0.8; PL.rot = Math.PI; PL.y = 0; PL.speed = 0; PL.mesh.visible = true;
    // the host stands in the middle of the room
    n.wx = n.x; n.wz = n.z; n.inRoom = true; scene.remove(n.mesh); ROOM.scene.add(n.mesh); n.x = 0.9; n.z = 0.9; n.y = 0; n.rot = Math.PI * 0.85; n.mesh.position.set(n.x, 0, n.z); n.mesh.visible = true; if (n.props) for (const q of Object.values(n.props)) q.visible = false;
    GAME_RP.scene = ROOM.scene; this.el.hud.classList.add('inroom'); this.el.hud.querySelector('.help').hidden = true; this.roomUI();
    const p = this.p; p.visits = p.visits || {}; p.daily.visitV = p.daily.visitV || {}; const first = !p.visits[n.def.id]; p.visits[n.def.id] = (p.visits[n.def.id] || 0) + 1;
    if (!p.daily.visitV[n.def.id]) { p.daily.visitV[n.def.id] = 1; p.friend[n.def.id] = (p.friend[n.def.id] || 0) + 1; }
    const L = VISIT_LINES[n.def.id] || VISIT_LINES._; DIALOG.npc = n; DIALOG.pages = [this.fill(L[0])]; DIALOG.i = 0; DIALOG.choices = null; UI.dialog(n.def.name, DIALOG.pages[0]); LIVE.emote(n, 'heart', 2.5);
    if (first && V.gift) { const RH = this.realHome(); RH.store[V.gift] = (RH.store[V.gift] || 0) + 1; const F = FURN.find(q => q.id === V.gift); DIALOG.pages.push(this.fill(`はじめて遊びに来てくれた記念に…これ、もらってくれる？`)); setTimeout(() => UI.toast(`🎁 ${n.def.name}から「${F ? F.name : V.gift}」をもらった！（家の模様がえで置けます）`), 900); }
    UI.toast(`🏠 ${n.def.name}の家におじゃましました　なかよし +1`); this.dirty = true;
  });
};
GAME.realHome = function () { const v = this.visit; this.visit = null; const h = this.home(); this.visit = v; return h; };
// while visiting, home() is the host's room and redecorating is not allowed
{ const _h = GAME.home; GAME.home = function () { return this.visit ? this.visit.room : _h.apply(this, arguments); }; }
{ const _t = GAME.toggleRoomEdit; GAME.toggleRoomEdit = function (on) { if (this.visit && on !== false) { UI.toast('ここは住民の家です（模様がえはできません）'); return; } return _t.apply(this, arguments); }; }
{ const _c = GAME.openCatalog; GAME.openCatalog = function () { if (this.visit) { UI.toast('ここは住民の家です'); return; } return _c.apply(this, arguments); }; }
{ const _ru = GAME.roomUI; GAME.roomUI = function () { _ru.apply(this, arguments); if (this.visit) { const el = this.el.roomp; el.innerHTML = `<span class="vtag">🏠 ${esc(this.visit.n.def.name)}の家</span><button data-r="out">🚪 おいとまする</button>`; } }; }
{ const _ex = GAME.exitHome; GAME.exitHome = function () {
    if (!this.visit) return _ex.apply(this, arguments); const V = this.visit, n = V.n; DIALOG.npc = null; UI.dialog(null);
    this.fade(() => { this.inside = false; ROOM.scene.remove(PL.mesh); scene.add(PL.mesh); ROOM.scene.remove(n.mesh); scene.add(n.mesh); n.inRoom = false; n.x = n.wx; n.z = n.wz; n.y = groundH(n.x, n.z);
      GAME_RP.scene = scene; const h = V.house, [x, z] = toWorld(h, 0, h.d / 2 + 1.7); PL.x = x; PL.z = z; PL.rot = h.rot; PL.y = standY(x, z); CAM.yaw = PL.rot + Math.PI; CAM.snap = true;
      this.visit = null; this.el.roomp.hidden = true; this.el.hud.classList.remove('inroom'); this.el.hud.querySelector('.help').hidden = false; document.getElementById('buildBtn').hidden = false; try { SND.play('door_close', { vol: 0.7 }); } catch (e) { } UI.toast(`${n.def.name}「またいつでも来てね！」`); });
  }; }
// talking to the host inside
{ const _rp = GAME.roomPrompt; GAME.roomPrompt = function () { if (this.visit && !this.roomEdit) { const n = this.visit.n; if (Math.hypot(PL.x - n.x, PL.z - n.z) < 1.6) return `Space：${n.def.name}と話す`; } return _rp.apply(this, arguments); }; }
{ const _ra = GAME.roomAct; GAME.roomAct = function () { if (this.visit) { const n = this.visit.n; if (Math.hypot(PL.x - n.x, PL.z - n.z) < 1.6) { if (!DIALOG.npc) { const L = VISIT_LINES[n.def.id] || VISIT_LINES._; n.vl = ((n.vl || 0) + 1) % L.length; const lines = [this.fill(L[n.vl])]; const r = LIVE.talkPages(n); DIALOG.npc = n; DIALOG.pages = lines.concat(r.pages.slice(0, 1)); DIALOG.i = 0; DIALOG.choices = r.choices || null; DIALOG.chose = false; UI.dialog(n.def.name, DIALOG.pages[0]); LIVE.emote(n, 'note', 1.5); } return; } } return _ra.apply(this, arguments); }; }
{ const _nv = nearVillager; nearVillager = function () { if (GAME.inside) return null; return _nv(); }; }
{ const _ur = GAME.updateRoom; GAME.updateRoom = function (dt) { _ur.apply(this, arguments); if (this.visit) { const n = this.visit.n; n.rot = angLerp(n.rot, Math.atan2(PL.x - n.x, PL.z - n.z), Math.min(1, dt * 4)); n.ph += dt * 1.8; n.tag.visible = false; n.mesh.position.set(n.x, 0, n.z); n.mesh.rotation.y = n.rot; animateBody(n.parts, n.rest, n.ph, 0, dt, { nod: DIALOG.npc === n ? performance.now() / 1000 : 0 }); if (n.emoT > 0) { n.emoT -= dt; if (n.emoT <= 0 && n.emo) n.emo.visible = false; } } }; }
// the host is not simulated outdoors while you are inside
{ const _lv = liveVillager; liveVillager = function (n, dt) { if (n.inRoom) return; return _lv(n, dt); }; }
