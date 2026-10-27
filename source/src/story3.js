// ===================== STORY 第三部「海のむこうの友だち」(ver.47)（終章Ⅱのあと） =====================
// 第11章 びんの手紙 → 第12章 おもてなしの島 → 第13章 ようこそ、ミナト → 第14章 十年後の島 → 終章Ⅲ 星のかけ橋
// - 夕日の浜に流れついたびんの手紙（遠い「あおい島」の小学生ミナト。学校は生徒ひとり、春になくなる）
// - 写真をとって返事を出す → ミナトの家族が下見に来る → 見学 → 家を建てて、11人目の住民に
// - タイムカプセル（住民の「十年後の夢」を集めて、見晴らしの丘にうめる）→ 島のみんなからの「ありがとう祭り」
const STORY3 = { bottle: null, t: 0, scene: 0 };
STORY3.st = function () { const p = GAME.p; p.s3 = p.s3 || {}; return p.s3; };
STORY3.active = id => { const s = STORY.st(); return CHAPTERS[s.ch] && CHAPTERS[s.ch].id === id && s.intro[id]; };
// lines by villager id; lines of residents who have not moved in are left out (ミナト is always there in this part)
STORY3.who = w => w === 'v_minato' ? 'ミナト' : BOND.who(w);
STORY3.lines = L => L.filter(([w]) => !w || !w.startsWith('v_') || w === 'v_minato' || BOND.resident(w)).map(([w, t]) => [STORY3.who(w), t]);
const s3 = () => STORY3.st();
// ---------- ミナト: the new resident (a recoloured copy of the boy's model) ----------
NEWCOMERS.push({ id: 'v_minato', name: 'ミナト', lv: 999, style: 'modern', who: 'あおい島から来た男の子',
  hello: 'はじめまして、ミナトです。手紙を読んでくれて、ありがとうございました。', ask: 'お父さんとお母さんも「この島ならいいね」って…。ぼく、この島に住みたいです。{P}さん、家を建ててもらえますか？', wait: '新しい家、楽しみです。コタロウくんが毎日見に来るんです。', thanks: '{P}さん、家をありがとうございます！ 今日から、ぼくも{I}島の子です！',
  lines: ['灯台の光って、遠くの島からも見えるんですよ。', 'あおい島の海は、もっと緑っぽい色でした。', 'コタロウくん、いつも走ってるんです。', '{P}さん、星波の話、もっと聞かせてください。'],
  opin: { like: { sea: '海のことなら、ぼくも賛成です。', community: 'みんなで集まれるの、うれしいです。', culture: '島の自慢がふえますね。' }, dislike: { light: '明るすぎると、星が見えなくなっちゃうかも…。' }, neutral: 'ぼくは、みんなが決めたことに賛成です。' } });
OPIN.v_minato = NEWCOMERS[NEWCOMERS.length - 1].opin;
SCHED.v_minato = [[6.5, 'plaza', 'exercise'], [7.3, 'beach', 'stroll'], [12, 'home', 'stroll'], [13, 'lighthouse', 'look'], [15, 'harbor', 'look'], [17, 'plaza', 'play'], [18.5, 'home', 'stroll'], [20, 'home', 'sleep']];
SCARF_COL.v_minato = '#f2b632'; BEANIE.v_minato = 1;
TALK.v_minato = { morning: ['おはようございます、{P}さん！ 朝の灯台、きれいでした。', 'コタロウくんがむかえに来るまで、待ってるんです。'], noon: ['こんにちは。きょうは、港で船を見てました。', 'この島の給食、おいしいんですよ。'], evening: ['夕方の灯台が、いちばん好きです。', '灯台の光がつく瞬間を、毎日見に行ってます。'], night: ['夜の海で、灯台の光がぐるぐる回ってます。', 'あおい島のおばあちゃんにも、この光、見せたいな。'], rain: ['雨の日は、図書室で灯台の本を読んでます。'], snow: ['雪！ あおい島では、ほとんど降らなかったんです。'],
  look: ['あの光、何秒ごとに回ってるか、数えてるんです。', '船が帰ってくるのを見るの、好きなんです。'], play: ['コタロウくん、まってー！', 'かけっこ、また負けちゃいました。'], exercise: ['ラジオ体操、まだ覚えきれてません…。'],
  hi: ['{P}さんがびんを拾ってくれたから、ぼくはここにいるんです。', '大きくなったら、{P}さんみたいに島の役に立ちたいです。'] };
QUIZ.v_minato = [{ q: '{P}さん、灯台の光って、何のためにあると思いますか？', a: [['船の目じるし', 'そうです！ 帰ってくる船が、まよわないように。', 2], ['夜を明るくするため', 'それもありますね。ぼくは「おかえり」の光だと思ってます。', 1]] }];
MILESTONE.v_minato = { decor: 'lamp', n: 1, t: 'ぼくのおこづかいで…街灯を買いました。灯台みたいに、{P}さんの好きなところを照らしてください。' };
STORY3.makeModel = function () {
  if (MODELS.v_minato || !MODELS.v_kota) return; const m = MODELS.v_kota.clone(true), COL = { top: '#5aa8e0', bottom: '#e6d8b8', acc: '#f2b632', hair: '#1c2028', shoe: '#2f4f7a', sole: '#e8e4dc' };
  m.traverse(o => { if (!o.isMesh) return; const one = mt => { const c = mt && COL[mt.name]; if (!c) return mt; const q = mt.clone(); q.color.set(c); return q; }; o.material = Array.isArray(o.material) ? o.material.map(one) : one(o.material); });
  m.name = 'v_minato'; MODELS.v_minato = m; };
{ const _sv = spawnVillagers; spawnVillagers = function () { try { STORY3.makeModel(); } catch (e) { console.warn('minato model', e); } return _sv.apply(this, arguments); }; }
// he comes to look round only in 第13章 (never through the usual Lv order)
{ const _cn = GAME.checkNewcomers; GAME.checkNewcomers = function () { const r = _cn.apply(this, arguments); try { STORY3.minatoVisit(); } catch (e) { } return r; }; }
STORY3.minatoVisit = function () {
  const p = GAME.p; if (!p || !STORY3.active('c13')) return; const N = GAME.newc(); if (N.v_minato) return;
  if (NEWCOMERS.some(c => N[c.id] && N[c.id].state !== 'moved')) { if (!s3().waitMsg) { s3().waitMsg = 1; UI.toast('（ほかに引っこしを待っている人がいます。その人の家ができたら、ミナトがやってきます）'); } return; }
  STORY3.makeModel(); N.v_minato = { state: 'visit', since: todayKey() }; GAME.dirty = true; GAME.syncNewcomers(); setTimeout(() => UI.toast('👋 ミナトが島にやってきた！（港のあたり）'), 1200);
};
STORY3.mstate = () => { const N = GAME.p && GAME.newc ? GAME.newc() : {}; return N.v_minato || {}; };
// school days: he goes with コタロウ
{ const _e = LIVE.entry; LIVE.entry = function (n, hf) { const E = _e(n, hf); if (n.def.id === 'v_minato' && devDone('school') && hf >= 8 && hf < 15 && E.act !== 'sleep') return { place: 'school', act: TIME.weather === 'rain' ? 'umb' : 'play' }; return E; }; }
// ---------- the chapters ----------
CHAPTERS[10].outro = CHAPTERS[10].outro.map(l => l[1].indexOf('第二部') >= 0 && l[1].indexOf('おしまい') >= 0 ? ['', '～ ほしなみ島ぐらし　第二部「星波の夜」　おしまい ～　（物語は 第三部「海のむこうの友だち」へつづきます）'] : l);
const C3 = (o, intro, outro) => Object.defineProperties(o, { intro: { get: () => STORY3.lines(intro), enumerable: true }, outro: { get: () => STORY3.lines(outro), enumerable: true } });
CHAPTERS.push(
  C3({ id: 'c11', no: '第11章', title: 'びんの手紙', rank: '手紙のとどく島',
    goals: [{ t: '夕日の浜に流れついた、びんを拾う（近くで Space）', n: 1, prog: () => s3().bottle ? 1 : 0 },
      { t: '返事にそえる写真を3まいとる（📷 写真）', n: 3, prog: () => s3().bottle && s3().ph0 !== undefined ? Math.max(0, (GAME.p.stats.photoN || 0) - s3().ph0) : 0 },
      { t: '家の前のポストから、返事を出す', n: 1, prog: () => s3().sent ? 1 : 0 }] },
    [['', '――第三部「海のむこうの友だち」'], ['', '――星波の夜から、しばらくたったある朝。'], ['v_kota', '{P}ー！ 夕日の浜に、なんか光るものが流れついてるよ！'], ['v_rin', '{P}さん、浜にびんが流れついてるんだって。中に、手紙みたいなものが入ってるみたい。'], ['', '🍾 夕日の浜で、びんを拾おう']],
    [['', '――何日かして、定期船で返事がとどいた。'], ['v_rin', 'ミナトくんからだ！ 「写真、ありがとうございました。灯台も、海も、星波の話も、ぜんぶ宝ものです」'], ['v_rin', '「…ぼくも、こんな島に住んでみたいです」って。'], ['v_kota', 'じゃあ来ればいいじゃん！ そしたら学校、オレとふたりになるぞ！'], ['v_gen', '島を出たもんの気持ちも、残ったもんの気持ちも、わしにはようわかる。…来てもらえるよう、島をととのえようかの。']]),
  C3({ id: 'c12', no: '第12章', title: 'おもてなしの島', rank: 'おもてなしの島',
    goals: [{ t: '島めぐりバスに乗って、案内の下見をする（バスがなければ開発（P）で開業）', n: 1, prog: () => s3().b12 ? Math.max(0, (GAME.p.stats.busN || 0) - s3().b12.bus) : 0 },
      { t: '観光船に乗って、海からの案内を下見する（船がなければ開発で）', n: 1, prog: () => s3().b12 ? Math.max(0, (GAME.p.stats.ferryN || 0) - s3().b12.ferry) : 0 },
      { t: 'おもてなしの料理を3品つくる（家のちゃぶ台で）', n: 3, prog: () => s3().b12 ? Math.max(0, (GAME.p.stats.cookN || 0) - s3().b12.cook) : 0 }] },
    [['v_rin', 'ミナトくんの家族が、島を見に来てくれることになったよ！ 橋ができたから、お父さんも本土の仕事に通えるんだって。'], ['v_kai', 'おもてなしだね！ 島めぐりバスと観光船で、島じゅうを案内しようよ！'], ['v_hana', 'それから、島の味でおむかえしましょう。{P}さん、お料理、手伝ってくださる？'], ['', '🚌 島めぐりバスと 🛳️ 観光船に乗って下見をして、料理を3品つくろう']],
    [['v_sora', 'バスも船も、点検ばっちりだぜ！'], ['v_hana', 'ちらし寿司に、タイのお吸いもの…ごちそうの用意もできたわね。'], ['v_kai', 'みかんジュースも冷やしてあるよ！'], ['v_rin', 'あとは、むかえるだけだね。…なんだか、ドキドキしてきた！']]),
  C3({ id: 'c13', no: '第13章', title: 'ようこそ、ミナト', rank: '新しい友だちの島',
    goals: [{ t: '港のあたりにいるミナトと話す', n: 1, prog: () => STORY3.mstate().met ? 1 : 0 },
      { t: 'ミナトの家を建てる（しまづくり「🏠 家を建てる」）', n: 1, prog: () => ['house', 'moved'].includes(STORY3.mstate().state) ? 1 : 0 },
      { t: 'ミナトが引っこしてくる（家ができた次の日）', n: 1, prog: () => STORY3.mstate().state === 'moved' ? 1 : 0 }] },
    [['', '――桟橋に、リュックをせおった男の子が立っていた。'], ['v_minato', 'あ…あの、はじめまして。ミナトです。手紙の…。'], ['v_kota', 'おまえがミナトか！ オレ、コタロウ！ 島を案内してやるよ！'], ['v_rin', 'ようこそ、{I}島へ！ ご家族は、もう少しあとの船で来るって。'], ['', '👋 港のあたりにいるミナトと話そう']],
    [['v_minato', '{P}さん、家をありがとうございました。今日から、ぼくも{I}島の子です！'], ['v_kota', 'これで学校、ふたりだな！ 毎朝むかえに行くからな！'], ['v_yuki', '新しい家の窓に、灯台の光がうつっているわ。…いい絵になりそう。'], ['v_gen', 'ようきたのう、ミナト。この島は、来るもんをこばまん島じゃ。'], ['v_rin', '{P}さんがこの島に来てくれたみたいに…また、ひとり。灯りがふえたね。']]),
  C3({ id: 'c14', no: '第14章', title: '十年後の島', rank: '未来をえがく島',
    goals: [{ t: '住民から「十年後の夢」を聞く（話しかける）', prog: () => Math.min(STORY3.dreamNeed(), Object.keys(s3().dream || {}).length), get n() { return STORY3.dreamNeed(); } },
      { t: '夕方（15時〜19時半）、見晴らしの丘のてっぺんでタイムカプセルをうめる', n: 1, prog: () => s3().capsule ? 1 : 0 }] },
    [['v_minato', '{P}さん、学校で「十年後の島」っていう作文を書くことになったんです。'], ['v_kota', 'それでさ、島のみんなの夢をタイムカプセルに入れて、見晴らしの丘にうめようってことになったんだ！'], ['v_rin', '島のみんなの「十年後の夢」、聞いて回ってくれる？'], ['', '💬 住民に話しかけて、夢を集めよう。集まったら、夕方に見晴らしの丘のてっぺんへ']],
    [['', '――丘のてっぺんに、小さな木の札が立った。「タイムカプセル　十年後にあける」'], ['v_kota', '十年後、ぜったい、ここに集合な！ やくそくだぞ！'], ['v_minato', 'はい！ ……あの、{P}さん。'], ['v_minato', 'ぼく、この島に来てから、毎日がたのしいです。びんを拾ってくれて、ありがとうございました。'], ['v_rin', 'ねえ{P}さん。…島のみんなで、{P}さんにお礼がしたいって、話してるんだ。']]),
  C3({ id: 'c15', no: '終章Ⅲ', title: '星のかけ橋', rank: '星をつなぐ島',
    goals: [{ t: '夜（19時〜23時半）、祭りの広場へ行く（なければ島の広場）', n: 1, prog: () => s3().fin ? 1 : 0 }] },
    [['v_kai', '{P}さん、{P}さん！ 今夜、祭りの広場に来て！ …なにがあるかは、ナイショ！'], ['v_rin', 'ふふ。夜になったら、広場で待ってるね。'], ['', '🏮 夜（19時〜23時半）に、祭りの広場へ']],
    [['', '――花火の光が、{I}島の海に、いくつもの星の波をえがいていた。'], ['', '――手紙で、橋で、船で。島は、海のむこうの人たちとつながっていく。'], ['', '～ ほしなみ島ぐらし　第三部「海のむこうの友だち」　おしまい ～　（島での暮らしは、これからも続きます）']]),
);
// ---------- 第11章: the bottle, the letter, the reply ----------
STORY3.beachSpot = function () {
  const B = GAME.LM && GAME.LM.beach; if (!B) return null; if (s3().bpos) return s3().bpos; let best = null, bd = 1e9;
  const S = (typeof SHORE !== 'undefined' && (SHORE.spots || (SHORE.spots = SHORE.scan()))) || []; for (const [x, z] of S) { const g = groundH(x, z), d = Math.hypot(x - B.x, z - B.z); if (g > 0.15 && g < 1.4 && d < bd) { bd = d; best = { x, z }; } }
  if (!best) for (let r = 0; r < 60 && !best; r += 2) for (let a = 0; a < 6.28; a += 0.3) { const x = B.x + Math.cos(a) * r, z = B.z + Math.sin(a) * r, g = groundH(x, z); if (g > 0.15 && g < 1.2) { best = { x, z }; break; } }
  if (best) s3().bpos = best; return best;
};
STORY3.bottleMesh = function () {
  const g = new THREE.Group(), glass = new THREE.MeshStandardMaterial({ color: '#7fd0c0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55, emissive: new THREE.Color('#2a6a60'), emissiveIntensity: 0.25 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.36, 16), glass); body.rotation.z = Math.PI / 2; g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.09, 0.14, 12), glass); neck.rotation.z = Math.PI / 2; neck.position.x = 0.24; g.add(neck);
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 10), stdM('#a0784a', 0.9)); cork.rotation.z = Math.PI / 2; cork.position.x = 0.33; g.add(cork);
  const paper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 10), stdM('#f4ead0', 0.9)); paper.rotation.z = Math.PI / 2; g.add(paper);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.012, 6, 14), stdM('#c8323a', 0.6)); tie.rotation.y = Math.PI / 2; g.add(tie);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: txCanvas(64, 64, x => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,240,1)'); gr.addColorStop(0.25, 'rgba(255,250,210,0.6)'); gr.addColorStop(1, 'rgba(255,250,210,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.scale.set(0.9, 0.9, 1); sp.position.y = 0.25; g.add(sp); g.userData.spark = sp; g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.scale.setScalar(1.4); return g;
};
STORY3.bottleNear = function () { const b = STORY3.bottle; return b && b.visible && !PL.veh && !GAME.inside && Math.hypot(PL.x - b.position.x, PL.z - b.position.z) < 1.9; };
STORY3.letter = function () {
  const p = GAME.p; GAME.modal = 'mletter';
  GAME.el.modal.innerHTML = `<div class="mbox journal"><div class="mh"><h2>🍾 びんの中の手紙</h2><button class="x" data-x="close" aria-label="とじる">×</button></div><div class="mb"><div style="max-width:420px;margin:4px auto 8px;background:#fbf6e8;background-image:repeating-linear-gradient(0deg,transparent 0 27px,rgba(90,120,170,.18) 27px 28px);padding:14px 22px 16px;box-shadow:0 2px 10px rgba(60,40,20,.18);font:500 15px/28px 'Klee One','M PLUS Rounded 1c',sans-serif;color:#2c2a26;transform:rotate(-0.6deg)">
    この手紙をひろってくれた人へ<br><br>ぼくは、あおい島に住んでいる、ミナトです。小学4年生です。<br>ぼくの島の小学校は、生徒がぼくひとりです。春になったら、学校はなくなるそうです。<br>島の人はみんなやさしいけど、いっしょに遊ぶ友だちがほしいです。<br>あなたの島は、どんな島ですか。もしよかったら、教えてください。<br><br><span style="display:block;text-align:right">あおい島　ミナト</span></div><p class="small">びんの底に、あおい島の住所を書いた紙も入っていた。</p></div></div>`;
  GAME.el.modal.hidden = false; try { SND.play('page', { vol: 0.6 }); } catch (e) { }
  GAME.el.modal.querySelector('.journal').onclick = e => { if (!e.target.closest('[data-x="close"]')) return; GAME.closeModal();
    setTimeout(() => STORY.play(STORY3.lines([['v_rin', 'ミナトくん…。むかしのわたしたちの島と、同じだね。'], ['v_kota', '返事、書こうぜ！ 島の写真もいっしょに送ってやろう！'], ['v_gen', '写真がええ。百の言葉より、一まいの写真じゃ。'], ['', '📷 写真を3まいとって（右上の「📷 写真」）、家の前のポストから返事を出そう']]), () => GAME.renderTracker()), 300); };
};
STORY3.pickBottle = function () { const S = s3(); S.bottle = 1; S.ph0 = GAME.p.stats.photoN || 0; GAME.dirty = true; if (STORY3.bottle) STORY3.bottle.visible = false; PLAY.pose = 0.75; PLAY.poseK = 'pick'; try { SND.play('glass_tap', { vol: 0.6 }); } catch (e) { } setTimeout(() => STORY3.letter(), 600); return true; };
STORY3.mailReady = () => STORY3.active('c11') && s3().bottle && !s3().sent && (GAME.p.stats.photoN || 0) - (s3().ph0 || 0) >= 3;
STORY3.sendReply = function () { s3().sent = 1; GAME.dirty = true; try { SND.play('mailbox', { vol: 0.7 }); } catch (e) { } UI.toast('📮 写真をそえて、ミナトへの返事をポストに入れた。とどくといいな'); GAME.check && GAME.check(); return true; };
// photos count (the album keeps them, the story only needs how many)
STAT_KEYS.push('photoN');
{ const _s = PHOTO.shoot; PHOTO.shoot = async function () { const before = PHOTO.last; const r = await _s.apply(this, arguments); try { if (GAME.p && PHOTO.last && PHOTO.last !== before) { GAME.p.stats.photoN = (GAME.p.stats.photoN || 0) + 1; GAME.dirty = true; GAME.renderTracker(); } } catch (e) { } return r; }; }
// ---------- 第14章: dreams ----------
STORY3.DREAM = {
  v_mio: 'わたしの夢？ 島の絵本を、何冊もつくること！ 十年後には、島の子みんなが読んでくれてたらいいな。',
  v_sora: 'オレは、島めぐりバスの運転手で、島いちばんの安全運転！ …あと、親父と毎年、滝つぼで釣りだな。',
  v_hana: '十年後も、島じゅうにお花が咲いていますように。それを見ながら、みんなでお茶を飲むの。',
  v_gen: 'わしの夢か。十年後も港に船がならんで、若いもんの声がしとることじゃ。…あとは長生きじゃな。わっはっは。',
  v_rin: '十年後のわたしは、島のまちづくりの仕事をしてると思う。島に帰ってきたい人が、帰ってこられる島にしたいな。',
  v_kai: '海の見えるカフェの店長！ 十年後には、島の外からもお客さんが来る、有名なお店にするんだ！',
  v_nagi: '十年後も、島の海と川がきれいなままでありますように。滝つぼのぬしが、ずっとすんでいられるように。',
  v_takumi: '島の古い家を、ひとつずつ直していくっす。十年後には、弟子がいたりして…なんて。',
  v_yuki: '島に、小さな美術館をつくりたいの。島の子どもたちの絵を、いっぱいかざる美術館。',
  v_kota: 'オレは、宇宙飛行士！ 宇宙から、{I}島の灯台が見えるか、たしかめるんだ！',
  v_minato: 'ぼくは…灯台守になりたいです。帰ってくる人に「おかえり」って光をとどける人に。',
};
STORY3.dreamNeed = () => Math.max(2, Math.min(8, VILLAGER_DEF.filter(v => BOND.resident(v.id)).length - 1));
{ const _st = startTalk; startTalk = function (n) { _st(n); try { const id = n.def.id; if (!GAME.p || n.visitor || !STORY3.active('c14') || DIALOG.npc !== n || !DIALOG.pages) return; const S = s3(); S.dream = S.dream || {}; if (S.dream[id]) return;
      S.dream[id] = 1; GAME.dirty = true; DIALOG.pages.push(GAME.fill('十年後の夢？ …' + (STORY3.DREAM[id] || '十年後も、この島で笑っていたいな。')) + '\n（タイムカプセルに入れる夢を聞いた）'); const k = Object.keys(S.dream).length, need = STORY3.dreamNeed(); setTimeout(() => UI.toast(k >= need ? '💬 夢が集まった！ 夕方、見晴らしの丘のてっぺんへ' : `💬 夢を聞いた（${k}/${need}）`), 600); GAME.renderTracker(); } catch (e) { } }; }
// ---------- gatherings: residents step in around you for the big scenes ----------
STORY3.freeSpot = (...a) => BOND.freeSpot(...a);
STORY3.gather = function (ids, cx, cz, r0) { const out = [], taken = [[cx, cz]]; let k = 0; for (const n of NPCS) { if (n.visitor || (ids && !ids.includes(n.def.id))) continue; const s = STORY3.freeSpot(cx, cz, PL.rot + 0.7 + k * 0.75, r0, taken); k++; if (!s) continue; const [x, z] = s; taken.push(s);
    n.x = x; n.z = z; n.y = standY(x, z); BOND.hold(n, 600000); n.mesh.position.set(n.x, n.y, n.z); out.push(n); } return out; };
STORY3.release = list => list.forEach(n => BOND.hold(n, 4000));
STORY3.capsuleStep = function () {
  const S = s3(); if (!STORY3.active('c14') || S.capsule || STORY3.scene || !STORY.ready() || PL.veh || GAME.inside) return; if (Object.keys(S.dream || {}).length < STORY3.dreamNeed()) return;
  const P = GAME.LM && GAME.LM.peak; if (!P || Math.hypot(PL.x - P.x, PL.z - P.z) > 22) return; const hf = currentHour();
  if (hf < 15 || hf >= 19.5) { const key = todayKey() + Math.floor(hf); if (S.warn !== key) { S.warn = key; UI.toast('⏰ タイムカプセルをうめるのは、夕方（15時〜19時半）です'); } return; }
  STORY3.scene = 1; const L = STORY3.gather(['v_rin', 'v_kota', 'v_minato', 'v_gen', 'v_hana', 'v_mio'], PL.x, PL.z, 2.2); GAME.banner('⛰️ タイムカプセル', '十年後の島へ');
  STORY.play(STORY3.lines([['', '――夕日のさす丘のてっぺんに、みんなが集まった。'], ['v_rin', 'みんなの夢、ぜんぶ入れたよ。{P}さんの夢も、ちゃんと書いた？'], ['v_minato', 'ぼくの作文も入れました。…十年後に読むの、ちょっとはずかしいです。'], ['v_kota', 'オレが掘る！ …うわ、かたい！ {P}、手伝って！'], ['', '――ふたつのスコップで、土をかけていく。'], ['v_gen', '十年後か。わしも、それまでは元気でおらんとのう。'], ['v_hana', '十年後に、みんなでまた、ここで会いましょうね。'], ['v_rin', '「十年後の{I}島へ。いまの島も、とってもすてきでした」…って、ふたに書いておいたよ。']]),
    () => { S.capsule = 1; GAME.dirty = true; STORY3.scene = 0; STORY3.release(L); try { SND.play('shovel1', { vol: 0.6 }); } catch (e) { } GAME.check && GAME.check(); });
};
// ---------- 終章Ⅲ: the thank-you festival ----------
STORY3.plaza = function () { const D = GAME.p.dev || {}, M = D.matsuri; if (M && M.state === 'done' && isFinite(M.x)) return { x: M.x, z: M.z }; try { return SEASON.findPlaza(); } catch (e) { return GAME.LM.hall || null; } };
STORY3.finaleStep = function () {
  const S = s3(); if (!STORY3.active('c15') || S.fin || STORY3.scene || !STORY.ready() || PL.veh || GAME.inside) return; const P = STORY3.plaza(); if (!P || Math.hypot(PL.x - P.x, PL.z - P.z) > 28) return; const hf = currentHour();
  if (hf < 19 && hf >= 4) { const key = todayKey() + Math.floor(hf); if (S.warn !== key) { S.warn = key; UI.toast('⏰ みんなが待っているのは、夜（19時〜23時半）です'); } return; }
  STORY3.scene = 1; const D = GAME.devState(); D.fireworks = Object.assign({}, D.fireworks || {}, { id: 'fireworks', state: 'done', date: todayKey() }); STORY2.forceW = 'clear'; if (TIME.wmode !== 'auto') TIME.weather = 'clear';
  const L = STORY3.gather(null, PL.x, PL.z, 2.6); GAME.banner('🏮 ありがとう祭り', '島のみんなから');
  setTimeout(() => { try { RARE.startShower(90); } catch (e) { } }, 9000);
  STORY.play(STORY3.lines([['', '――広場に着くと、ちょうちんの灯りがいっせいにともった。'], ['v_rin', '{P}さん！ これ、島のみんなからの「ありがとう祭り」だよ！'], ['v_gen', 'おまえさんが来てから、港に灯がもどり、祭りがもどり、子どもの声がもどった。'], ['v_hana', 'お花も、人も、ふえたわ。{P}さんが、たくさん水をくれたから。'], ['v_mio', '島に来た人が「もう大丈夫だよ」って思える島。{P}さんが、そういう島にしてくれたんだよ。'], ['v_sora', 'よーし、そろそろだぜ！ みんな、空を見ろ！'], ['', '――ドーン、と大きな音がして、夜空に花火が開いた。'], ['v_minato', 'すごい…！ 花火のむこうに、灯台の光と、大橋の灯りと…星も！'], ['v_kota', '海の上に、星のかけ橋ができてるみたいだ！'], ['v_yuki', '…この景色は、絵にしなくても、ずっとおぼえていられる気がするわ。'], ['v_rin', '{P}さん。これからも、ずっとこの島にいてね。…わたしたちの、島の家族として。']]),
    () => { S.fin = 1; GAME.dirty = true; STORY3.scene = 0; STORY3.release(L); setTimeout(() => { if (STORY2.forceW === 'clear') STORY2.forceW = null; }, 120000); GAME.check && GAME.check(); });
};
// ---------- prompts, keys, update ----------
{ const _pr = GAME.prompt; GAME.prompt = function () { if (GAME.p && !GAME.modal && !PL.veh && !GAME.inside) { if (STORY3.bottleNear()) return 'Space：びんを拾う'; if (STORY3.mailReady() && GAME.nearMail()) return 'Space：ミナトへの返事を出す'; } return _pr.apply(this, arguments); }; }
{ const _it = GAME.interact; GAME.interact = function () { if (GAME.p && !PL.veh && !GAME.inside) { if (STORY3.bottleNear()) return STORY3.pickBottle(); if (STORY3.mailReady() && GAME.nearMail()) return STORY3.sendReply(); } return _it.apply(this, arguments); }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { if (GAME.p) { dt = dt || 0.016; STORY3.t += dt; const S = s3();
      // the bottle lies on the beach until you pick it up
      const want = STORY3.active('c11') && !S.bottle; if (want && !STORY3.bottle) { const sp = STORY3.beachSpot(); if (sp) { STORY3.bottle = STORY3.bottleMesh(); STORY3.bottle.position.set(sp.x, groundH(sp.x, sp.z) + 0.1, sp.z); STORY3.bottle.rotation.y = 0.7; scene.add(STORY3.bottle); } }
      if (STORY3.bottle) { STORY3.bottle.visible = want && !GAME.inside; if (want) { const t = performance.now() / 1000, b = STORY3.bottle; b.rotation.x = Math.sin(t * 1.3) * 0.06; b.userData.spark.material.opacity = 0.45 + Math.sin(t * 3.1) * 0.35; } }
      if (STORY3.active('c12') && !S.b12) { S.b12 = { bus: GAME.p.stats.busN || 0, ferry: GAME.p.stats.ferryN || 0, cook: GAME.p.stats.cookN || 0 }; GAME.dirty = true; }
      if (STORY3.t > 0.5) { STORY3.t = 0; if (STORY3.active('c13')) STORY3.minatoVisit(); STORY3.capsuleStep(); STORY3.finaleStep(); }
    } } catch (e) { if (!STORY3._e) { STORY3._e = 1; console.warn('story3', e); } } return r; }; }
