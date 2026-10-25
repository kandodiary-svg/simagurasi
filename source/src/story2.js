// ===================== STORY 第二部「星波の夜」（終章のあと）＋ 島の仕掛け =====================
// 第7章 干潮の道 → 第8章 灯台の灯 → 第9章 台風の夜 → 終章Ⅱ 星波の夜
// 仕掛け: 灯台にのぼる（展望・夜は光が海を照らす。第8章で修理）、神社でお参り（鈴・二礼二拍手一礼）とおみくじ、台風（第9章）、星波の夜（夜光虫＋流星群）
const STORY2 = { forceW: null, lh: null, shr: null, scene: 0, finT: 0 };
STORY2.st = function () { const p = GAME.p; p.s2 = p.s2 || {}; return p.s2; };
STORY2.active = id => { const s = STORY.st(); return CHAPTERS[s.ch] && CHAPTERS[s.ch].id === id && s.intro[id]; };
STORY2.gen = () => NPCS.find(n => n.def.id === 'v_gen');
CHAPTERS[6].outro = CHAPTERS[6].outro.map(l => l[1].indexOf('おしまい') >= 0 ? ['', '～ ほしなみ島ぐらし　第一部　おしまい ～　（物語は 第二部「星波の夜」へつづきます）'] : l);
CHAPTERS.push(
  { id: 'c7', no: '第7章', title: '干潮の道', rank: '潮のみちる島',
    goals: [{ t: '干潮のとき、砂の道を歩いて はなれ小島へ渡る', n: 1, prog: () => (GAME.p.tide && GAME.p.tide.walked) ? 1 : 0 }, { t: 'はなれ小島の洞くつで「古い手帳」を見つける（干潮のとき）', n: 1, prog: () => STORY2.st().diary ? 1 : 0 }],
    intro: [['', '――第二部「星波の夜」'], ['ゲンじい', '{P}、知っとるか。むかしはのう、潮が大きく引くと、はなれ小島まで砂の道ができたんじゃ。'], ['リン', 'えっ、歩いて行けるの？'], ['ゲンじい', 'うむ。リンのじいさん――灯台守のトシ坊も、よく渡っとった。小島の岩の洞くつに、何やら大事なもんをしまっとったらしい。'], ['ハナ', '潮の時刻は、左上の時計の下に出ているわよ。「干潮」のころに浜へ行ってみて。'], ['リン', 'おじいちゃんの大事なもの…。{P}さん、いっしょにさがしてくれる？']],
    outro: [['', '――洞くつの奥、ブリキの缶の中に、潮のにおいのする手帳があった。'], ['リン', 'これ…おじいちゃんの字だ。「灯台日誌」…。'], ['リン', '「嵐のすぎた、月のない静かな夜。波は星のように光り、空からは星がふる。島の人はそれを星波（ほしなみ）とよぶ。灯台の灯は、その夜に帰る船の目じるしなり」'], ['ゲンじい', '星波…。島の名前のもとじゃ。わしも子どものころ、いちどだけ見た。'], ['カイ', 'ねえ、でも…最近、灯台の灯り、なんだか暗くない？']] },
  { id: 'c8', no: '第8章', title: '灯台の灯', rank: '灯台の見守る島',
    goals: [{ t: '灯台にのぼって、灯りのようすを見る（灯台の前で Space）', n: 1, prog: () => STORY2.st().lhUp ? 1 : 0 }, { t: '灯台の灯りを直す（部品代 30,000円）', n: 1, prog: () => STORY2.st().lamp === 'fixed' ? 1 : 0 }, { t: '夜、灯台の光が海を照らすのを見る', n: 1, prog: () => STORY2.st().beamSeen ? 1 : 0 }],
    intro: [['', '――その夜から、灯台の灯りが消えてしまった。'], ['タクミ', 'レンズを回す歯車がすりへってるっす。部品さえあれば、おれが直せるっす！'], ['ゲンじい', '灯台が消えたままじゃ、夜の漁から帰る船が困る。…たのむぞ、{P}。'], ['', '💡 灯台の前で Space：灯台にのぼれます']],
    outro: [['', '――ゆっくりと光が回りはじめ、夜の海に白い道をえがいた。'], ['ゲンじい', 'おお…。わしの親父の船も、嵐の夜はこの光をたよりに帰ってきたんじゃ。'], ['リン', 'おじいちゃん、見てる？ 灯台、ちゃんと光ってるよ。'], ['', '――ザザ…［島内放送］「台風が島に近づいています。船の点検と、戸じまりをお願いします」'], ['ソラ', 'げっ、台風！？']] },
  { id: 'c9', no: '第9章', title: '台風の夜', rank: '嵐にまけない島',
    goals: [{ t: '港で漁船のロープを結びなおす（船のそばで F）', n: 1, prog: () => STORY2.st().moored ? 1 : 0 }, { t: 'ゲンじいの家のようすを見に行く', n: 1, prog: () => STORY2.st().genOk ? 1 : 0 }, { t: '家に入って、台風が通りすぎるのを待つ', n: 1, prog: () => STORY2.st().waited ? 1 : 0 }, { t: '台風のあと、浜で拾いものを3つひろう', n: 3, prog: () => STORY2.st().shoreBase === undefined ? 0 : (GAME.p.stats.shoreN || 0) - STORY2.st().shoreBase }],
    intro: [['', '――空が暗くなり、強い風が吹きはじめた。'], ['ゲンじい', '{P}！ 港の漁船のロープを見てきてくれ。波にさらわれたら大ごとじゃ。'], ['ミオ', 'みんなは家の中にいるよ。{P}さんも、用がすんだら家に入ってね！'], ['', '🌀 台風です。港 → ゲンじいの家 → 自分の家の順に']],
    outro: [['', '――つぎの朝。うそみたいに澄んだ空に、大きな虹がかかっていた。'], ['ゲンじい', '{P}のおかげで、船も家もぶじじゃった。ありがとうよ。'], ['コタロウ', '浜にいっぱい流れついてるー！ 宝さがしだ！'], ['リン', 'ねえ…嵐のすぎた、静かな夜。おじいちゃんの手帳の「星波の夜」って、きっともうすぐだよ。'], ['ユキ', 'その夜を、絵にかきたいな。…みんなで見に行こうよ。']] },
  { id: 'c10', no: '終章Ⅱ', title: '星波の夜', rank: '星波の島',
    goals: [{ t: '島の「めずらしい出来事」を4つ見る（手帳の図鑑）', n: 4, prog: () => RARE.count() }, { t: '夜、夕日の浜でみんなと星波を待つ', n: 1, prog: () => STORY2.st().finale ? 1 : 0 }],
    intro: [['リン', '星波の夜は、いつ来るかわからない。でも、この島をよく見ている人のところに来る…って、手帳に書いてあった。'], ['ゲンじい', '流れ星、霧の海、虹、スナメリ…。島のめずらしいもんを見て歩けば、きっと出会えるじゃろう。'], ['', '🌠 めずらしい出来事を4つ見たら、夜に「夕日の浜」へ']],
    outro: [['', '――浜に集まったみんなの前で、波が、星になった。'], ['ユキ', '…きれい。絵にかけないくらい。'], ['ゲンじい', 'これじゃ…わしが子どものころに見た、星波じゃ。'], ['リン', 'おじいちゃん。灯台の光も、星も、波も、ぜんぶつながってるね。'], ['ミオ', '{P}さんが来てくれたから、この島にまた星波が来たんだよ。'], ['', '――その夜、{I}島の灯台は、いつもより長く海を照らしていた。'], ['', '～ ほしなみ島ぐらし　第二部「星波の夜」　おしまい ～　（島での暮らしは、まだまだ続きます）']] },
);
// the tower used to unlock after the last chapter: keep it tied to the end of part 1
{ const _sd = STORY.syncDev; STORY.syncDev = function () { _sd.apply(this, arguments); const s = STORY.st(), p = GAME.p; if (s.done && s.done.c6) { const d = BIG_DEV.find(q => q.id === 'tower'); if (d && !DEV.includes(d)) DEV.push(d); if (d && p && p.devSeen) p.devSeen.tower = 1; } }; }

// ---------- 灯台: のぼる（展望）・修理・光 ----------
STORY2.lhNear = function () { const L = PLACED.lighthouse; return L && !PL.veh && !GAME.inside && Math.hypot(PL.x - L.x, PL.z - L.z) < 4.2; };
STORY2.lhView = function () {
  const s2 = STORY2.st(); s2.lhUp = 1; GAME.dirty = true; GAME.modal = 'lhview'; STORY2.lh = { yaw: Math.atan2(PL.x - PLACED.lighthouse.x, PL.z - PLACED.lighthouse.z), t: 0 };
  let ov = document.getElementById('lhOv'); if (!ov) { ov = document.createElement('div'); ov.id = 'lhOv'; ov.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:rgba(20,30,40,.62);color:#fff;padding:8px 16px;border-radius:999px;font:700 14px "M PLUS Rounded 1c",sans-serif;z-index:30;pointer-events:none'; document.body.appendChild(ov); }
  ov.textContent = '🗼 灯台の上から　（Esc でおりる）'; ov.hidden = false; try { SND.play('step_wood0', { vol: 0.4 }); } catch (e) { }
  if (STORY2.active('c8') && s2.lamp !== 'fixed') setTimeout(() => { if (GAME.modal === 'lhview') UI.toast('灯台の灯りが消えている…。タクミさんが言っていた歯車がすりへっているみたい（もう一度 Space で修理）'); }, 1500);
  return true;
};
STORY2.lhFix = function () {
  const s2 = STORY2.st(), p = GAME.p; GAME.modal = 'lhfix';
  GAME.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>🗼 灯台の修理</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><p>レンズを回す歯車がすりへっています。部品代を出せば、タクミさんが直してくれます。</p><p>部品代：<b>${yen(30000)}</b>　（所持金 ${yen(p.money || 0)}）</p><div class="row" style="display:flex;gap:8px"><button class="rel" data-fix="1" ${(p.money || 0) < 30000 ? 'disabled' : ''}>部品代を出して直す</button><button class="rel" data-up="1">灯台にのぼる</button><button class="rel" data-x="close">やめる</button></div></div></div>`;
  GAME.el.modal.hidden = false; GAME.el.modal.querySelector('.journal').onclick = e => { if (e.target.closest('[data-x="close"]')) return GAME.closeModal(); if (e.target.closest('[data-up]')) { GAME.closeModal(); return STORY2.lhView(); }
    const f = e.target.closest('[data-fix]'); if (f && !f.disabled) { p.money -= 30000; s2.lamp = 'fixed'; GAME.dirty = true; GAME.renderTracker(); GAME.closeModal(); try { SND.play('hammer1', { vol: 0.6 }); setTimeout(() => SND.play('hammer2', { vol: 0.6 }), 400); } catch (e) { } UI.toast('🔧 タクミさんが歯車を取りかえてくれた！ 夜になったら灯台の光を見てみよう'); GAME.check && GAME.check(); } };
  return true;
};
{ const _co = GAME.camOverride; GAME.camOverride = function () {
    if (GAME.modal === 'lhview' && STORY2.lh && PLACED.lighthouse) { const L = PLACED.lighthouse, V = STORY2.lh; V.t += 0.016; V.yaw += 0.0035; const a = V.yaw, r = 2.1;
      camera.position.set(L.x + Math.sin(a) * r, L.y + 14.1, L.z + Math.cos(a) * r); camera.lookAt(L.x + Math.sin(a) * 80, L.y + 2, L.z + Math.cos(a) * 80); return true; }
    if (STORY2.lh && GAME.modal !== 'lhview') { STORY2.lh = null; const ov = document.getElementById('lhOv'); if (ov) ov.hidden = true; }
    return _co.apply(this, arguments); }; }
// a soft, volumetric-looking beam (bright near the lamp and along its core, fading out along its length and at its edges)
STORY2.beamMat = function () { if (STORY2.bm) return STORY2.bm; return STORY2.bm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false, uniforms: { op: { value: 0 } },
  vertexShader: 'varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vV = -mv.xyz; gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform float op; varying vec2 vUv; varying vec3 vN, vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float a = pow(f, 2.0) * pow(clamp(vUv.y, 0.0, 1.0), 1.6) * smoothstep(1.0, 0.94, vUv.y); gl_FragColor = vec4(vec3(1.0, 0.95, 0.8) * a * op, 1.0); }' }); };
// the turning beam leaves two glittering paths on the night sea
{ const _us = updateStructures; updateStructures = function (t, night) { const r = _us.apply(this, arguments); const s2 = GAME.p && GAME.p.s2, off = !!(s2 && s2.lamp === 'broken');
    if (BEAM.mesh && !BEAM.mesh.userData.soft) { BEAM.mesh.userData.soft = true; const m = STORY2.beamMat(), bg = new THREE.ConeGeometry(4.5, 60, 64, 1, true); bg.translate(0, -30, 0); bg.rotateZ(Math.PI / 2); BEAM.mesh.children.forEach(c => { if (c.isMesh) { c.material = m; c.geometry = bg; } }); BEAM.mats = []; }
    STORY2.beamMat().uniforms.op.value = off ? 0 : night * 0.55;
    const L = PLACED.lighthouse; if (!L || !BEAM.mesh) return r; const show = !off && night > 0.35 && !GAME.inside;
    if (show && !STORY2.paths) { STORY2.paths = [RARE.makeRoad(), RARE.makeRoad()]; STORY2.paths.forEach(m => m.material.uniforms.col.value.set('#fff0c8')); }
    if (STORY2.paths) STORY2.paths.forEach((m, k) => { m.visible = show; if (!show) return; const a = BEAM.mesh.rotation.y + k * Math.PI, dx = Math.cos(a), dz = -Math.sin(a); m.position.set(L.x + dx * 25, SEA.h + 0.07, L.z + dz * 25); m.rotation.y = Math.atan2(-dx, -dz); m.scale.set(14, 1, 420); m.material.uniforms.time.value = t; m.material.uniforms.op.value = 0.32 * night; });
    return r; }; }

// ---------- 神社: お参り・おみくじ ----------
STORY2.shrSpot = function () { const C = PLACED.church; if (!C) return null; const [x, z] = toWorld(C, 0, 1.25); return { x, z, rot: C.rot + Math.PI }; };
STORY2.shrNear = function () { const S = STORY2.shrSpot(); return S && !PL.veh && !GAME.inside && Math.hypot(PL.x - S.x, PL.z - S.z) < 1.7; };
const OMIKUJI = [
  ['大吉', 12, '願いごと：かなう。待ち人：海の向こうから来る。きょうは、めずらしいものに出会いやすい日。'],
  ['中吉', 18, '失せ物：浜で見つかる。旅：近くの名所によし。空と海をよく見ておくとよいことがある。'],
  ['小吉', 20, '商い：こつこつがよし。畑：水やりをわすれずに。'],
  ['吉', 22, '学問：本を読むによし。釣り：朝まずめに分あり。'],
  ['末吉', 18, '今はつぼみ。あせらず、あしたを待つべし。'],
  ['凶', 10, '雨にぬれやすし。…でも大丈夫。おみくじは境内に結んで帰ろう。'],
];
STORY2.pray = function () {
  const S = STORY2.shrSpot(); PL.x = S.x; PL.z = S.z; PL.rot = S.rot; STORY2.shr = { t: 0 }; GAME.modal = 'pray';
  try { SND.play('coins', { vol: 0.5 }); setTimeout(() => SND.play('jingle', { vol: 0.55, rate: 1.2 }), 500); setTimeout(() => SND.play('place_wood', { vol: 0.5, rate: 1.6 }), 2450); setTimeout(() => SND.play('place_wood', { vol: 0.5, rate: 1.6 }), 2800); } catch (e) { }
  setTimeout(() => { STORY2.shr = null; if (GAME.modal === 'pray') GAME.modal = null; STORY2.omikuji(); }, 4800); return true;
};
STORY2.omikuji = function () {
  const p = GAME.p; p.stats.prayN = (p.stats.prayN || 0) + 1; GAME.dirty = true;
  if (p.omikuji && p.omikuji.date === todayKey()) { UI.toast('🙏 お参りした。（おみくじは1日1回。きょうは「' + p.omikuji.rank + '」）'); return; }
  const R = mulberry(hashStr(todayKey() + p.name + 'kuji')); let t = R() * 100, pick = OMIKUJI[0]; for (const o of OMIKUJI) { t -= o[1]; if (t <= 0) { pick = o; break; } }
  p.omikuji = { date: todayKey(), rank: pick[0] }; GAME.modal = 'kuji';
  GAME.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>⛩️ おみくじ</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div style="max-width:300px;margin:4px auto 10px;background:#fbf7ec;background-image:repeating-linear-gradient(90deg,rgba(150,120,80,.05) 0 2px,transparent 2px 7px);box-shadow:0 2px 10px rgba(60,40,20,.18);padding:0 0 14px;text-align:center;border-top:10px solid #b8322a;border-bottom:10px solid #b8322a"><div style="font:700 13px 'Shippori Mincho','Noto Serif JP',serif;letter-spacing:.4em;color:#7a2a20;padding:8px 0 2px;border-bottom:1px solid #e2cfb4">${esc(p.island)}島神社　御神籤</div><div style="font:900 52px 'Shippori Mincho','Noto Serif JP',serif;color:#b8302a;margin:10px 0 6px">${pick[0]}</div><div style="line-height:1.9;color:#3a2a20;padding:0 18px;font:500 14px 'Shippori Mincho','Noto Serif JP',serif">${esc(pick[2])}</div></div><p class="small">おみくじは1日1回。大吉・中吉の日は、めずらしい出来事に出会いやすくなります。</p></div></div>`;
  GAME.el.modal.hidden = false; GAME.el.modal.querySelector('.journal').onclick = e => { if (e.target.closest('[data-x="close"]')) { GAME.closeModal(); if (pick[0] === '凶') UI.toast('おみくじを境内の木に結んだ。悪い運はここに置いていこう'); } };
  try { SND.play('page', { vol: 0.6 }); } catch (e) { }
};
{ const _ah = animateHero; animateHero = function (dt) { const r = _ah.apply(this, arguments); const S = STORY2.shr; if (!S) return r; S.t += dt || 0.016; const t = S.t, P = PL.parts; if (!P || !P.spine) return r;
    const bow = (a, b, deep) => { if (t < a || t > b) return 0; const k = (t - a) / (b - a); return Math.sin(k * Math.PI) * deep; };
    const bw = bow(0.9, 1.6, 1.15) + bow(1.6, 2.3, 1.15) + bow(4.0, 4.7, 1.15) + (t > 2.9 && t < 3.9 ? 0.18 : 0);
    P.spine.rotation.x = bw * 0.75; P.head.rotation.x = bw * 0.35; P.pelvis.rotation.x = 0;
    const clap = t > 2.3 && t < 3.95; if (clap) { const c = (t > 2.4 && t < 2.5) || (t > 2.75 && t < 2.85) ? 0.12 : 0.22; P.upperArmL.rotation.set(-1.15, 0, -c); P.upperArmR.rotation.set(-1.15, 0, c); P.foreArmL.rotation.set(-0.5, 0, 0.6); P.foreArmR.rotation.set(-0.5, 0, -0.6); }
    else { P.upperArmL.rotation.set(0, 0, -0.1); P.upperArmR.rotation.set(0, 0, 0.1); P.foreArmL.rotation.set(-0.15, 0, 0); P.foreArmR.rotation.set(-0.15, 0, 0); }
    return r; }; }

// ---------- 第7章: 洞くつの手帳 ----------
STORY2.caveFind = function () { const s2 = STORY2.st(); if (!STORY2.active('c7') || s2.diary) return false; s2.diary = 1; GAME.dirty = true; PLAY.pose = 0.75; PLAY.poseK = 'pick'; try { SND.play('book_open', { vol: 0.6 }); } catch (e) { } UI.toast('📔 岩のすきまに、さびたブリキの缶…。中に「古い手帳」が入っていた！'); GAME.check && GAME.check(); return true; };

// ---------- 第9章: 台風 ----------
STORY2.debris = function () {
  if (!SHORE.grp || !SHORE.spots || !SHORE.spots.length) return; const p = GAME.p, R = mulberry(hashStr(todayKey() + 'storm')), ids = ['driftwood', 'driftwood', 'glass_g', 'hamaguri', 'uni', 'kanizume', 'glass_c', 'itaya'];
  ids.forEach((id, k) => { const i = 950 + k; if (p.shore.got.includes(i) || SHORE.items.some(q => q.i === i)) return; const s = SHORE.spots[Math.floor(R() * SHORE.spots.length)], it = { x: s[0] + (R() - 0.5) * 2, z: s[1] + (R() - 0.5) * 2, id, i, ry: R() * 6.28, ph: R() * 6 }, y = groundH(it.x, it.z); if (y < -0.05) return;
    it.mesh = mergeLocal(SHORE.mesh(it)); it.mesh.scale.setScalar(['wood'].includes(SHORE.def(id).kind) ? 1 : 1.6); it.mesh.position.set(it.x, y, it.z); it.mesh.rotation.y = it.ry; SHORE.grp.add(it.mesh); SHORE.items.push(it); });
};
STORY2.stormStep = function (dt) {
  const s2 = STORY2.st(); if (!STORY2.active('c9')) { if (s2.storm === 'on') s2.storm = 'after'; return; }
  if (!s2.storm) { s2.storm = 'on'; GAME.dirty = true; }
  if (s2.storm === 'on') {
    STORY2.forceW = 'storm'; if (TIME.wmode !== 'auto' && TIME.weather !== 'storm') TIME.weather = 'storm';
    const G0 = STORY2.gen(); if (s2.moored && !s2.genOk && G0 && Math.hypot(PL.x - G0.hx, PL.z - G0.hz) < 9 && !GAME.inside && STORY.ready()) { s2.genOk = 1; GAME.dirty = true; STORY.play([['ゲンじい', '（戸のむこうから）おお、{P}か！ わしは大丈夫じゃ。雨戸もしめた。'], ['ゲンじい', '船のロープも結びなおしてくれたか。ありがとうよ。…さ、おまえさんも早く家に入れ！']], () => GAME.check && GAME.check()); }
    if (s2.moored && s2.genOk && GAME.inside) { STORY2.waitT = (STORY2.waitT || 0) + dt; if (STORY2.waitT > 6) { STORY2.waitT = 0; s2.waited = 1; s2.storm = 'after'; s2.calmUntil = Date.now() + 15 * 60000; s2.shoreBase = GAME.p.stats.shoreN || 0; STORY2.forceW = 'clear'; if (TIME.wmode !== 'auto') TIME.weather = 'clear'; GAME.dirty = true;
      UI.toast('🌀 …ゴォォ……。風の音が、だんだん小さくなっていく。'); setTimeout(() => UI.toast('🌈 台風が通りすぎた！ 浜にいろいろ流れついているみたい'), 3500); setTimeout(() => { try { STORY2.debris(); } catch (e) { } }, 400); GAME.check && GAME.check(); } }
  } else if (s2.storm === 'after') { STORY2.forceW = s2.calmUntil && Date.now() < s2.calmUntil ? 'clear' : null; if (s2.calmUntil && Date.now() < s2.calmUntil) STORY2.debris(); }
};
STORY2.boatNear = function () { const b = VEH.find(v => v.kind === 'boat'); return b && !PL.veh && Math.hypot(PL.x - b.x, PL.z - b.z) < 7 ? b : null; };

// ---------- 終章Ⅱ: 星波の夜 ----------
STORY2.finaleStep = function (dt) {
  const s2 = STORY2.st(); if (!STORY2.active('c10') || s2.finale || STORY2.scene) return; if (RARE.count() < 4) return;
  const hf = TIME.mode === 'real' ? GFX.solarHour(currentHour()) : currentHour(), night = hf > 19.4 || hf < 4.4, B = GAME.LM && GAME.LM.beach;
  if (!night || !B || GAME.inside || PL.veh || Math.hypot(PL.x - B.x, PL.z - B.z) > 45 || !STORY.ready()) return;
  STORY2.scene = 1; STORY2.forceW = 'clear'; if (TIME.wmode !== 'auto') TIME.weather = 'clear'; RARE.forceGlow = true; GAME.banner('🌊 星波の夜', 'みんなが浜に集まってきた…');
  setTimeout(() => RARE.startShower(110), 2500);
  STORY.play([['リン', '{P}さん！ みんなも来たよ。…ほら、風がやんだ。'], ['ゲンじい', '月のない、静かな夜じゃ。灯台の光も、ちゃんと回っとる。'], ['コタロウ', 'あっ！ 波が光った！'], ['ユキ', '青い…。波がくだけるたびに、星みたいに光ってる。'], ['ソラ', '上もだ！ 流れ星が、こんなにいっぱい…！'], ['ミオ', '願いごと、願いごと！ えっと…ずっとこの島で暮らせますように！'], ['', '――海の星と、空の星。その真ん中に、{I}島の灯台が立っていた。']],
    () => { s2.finale = 1; GAME.dirty = true; STORY2.scene = 0; RARE.seen('yakouchu', true); setTimeout(() => { RARE.forceGlow = false; STORY2.forceW = null; }, 120000); GAME.check && GAME.check(); });
};

// ---------- prompts, keys, update ----------
{ const _pr = GAME.prompt; GAME.prompt = function () {
    if (GAME.p && !GAME.modal && !PL.veh && !GAME.inside) {
      if (STORY2.lhNear()) return STORY2.active('c8') && STORY2.st().lhUp && STORY2.st().lamp !== 'fixed' ? 'Space：灯台の灯りを直す' : 'Space：灯台にのぼる';
      if (STORY2.shrNear()) return 'Space：お参りする';
      if (STORY2.active('c9') && STORY2.st().storm === 'on' && !STORY2.st().moored && STORY2.boatNear()) return 'F：漁船のロープを結びなおす';
    }
    return _pr.apply(this, arguments); }; }
{ const _it = GAME.interact; GAME.interact = function () {
    if (GAME.p && !PL.veh && !GAME.inside) { if (STORY2.lhNear()) return STORY2.active('c8') && STORY2.st().lhUp && STORY2.st().lamp !== 'fixed' ? STORY2.lhFix() : STORY2.lhView(); if (STORY2.shrNear()) return STORY2.pray(); }
    return _it.apply(this, arguments); }; }
{ const _fk = GAME.fishKey; GAME.fishKey = function () {
    if (GAME.p && !GAME.modal && !LIFE.fish && STORY2.active('c9') && STORY2.st().storm === 'on' && !STORY2.st().moored && STORY2.boatNear()) { STORY2.st().moored = 1; GAME.dirty = true; PLAY.pose = 0.75; PLAY.poseK = 'pick'; try { SND.play('cloth', { vol: 0.6 }); } catch (e) { } UI.toast('⚓ 漁船のロープをしっかり結びなおした！ 次はゲンじいの家へ'); GAME.check && GAME.check(); return true; }
    return _fk.apply(this, arguments); }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { if (GAME.p) {
      const s2 = STORY2.st(); dt = dt || 0.016;
      // 第8章: the lamp goes dark when the chapter starts, and the beam has to be seen at night once fixed
      if (STORY2.active('c8') && !s2.lamp) { s2.lamp = 'broken'; GAME.dirty = true; }
      if (s2.lamp === 'fixed' && !s2.beamSeen && (GAME.night || 0) > 0.6 && !GAME.inside && PLACED.lighthouse && Math.hypot(PL.x - PLACED.lighthouse.x, PL.z - PLACED.lighthouse.z) < 260) { s2.beamSeen = 1; GAME.dirty = true; UI.toast('🗼 灯台の光が、夜の海をゆっくりと照らしている…'); GAME.check && GAME.check(); }
      STORY2.stormStep(dt); STORY2.finaleStep(dt);
      if (!STORY2.active('c9') && !STORY2.scene && STORY2.forceW === 'storm') STORY2.forceW = null;
    } } catch (e) { if (!STORY2._err) { STORY2._err = 1; console.warn('story2', e); } } return r; }; }
