// ===================== 島だより (morning newsletter from リン) =====================
const LM_DESC = { falls: '北の森の台地から落ちる滝で、しぶきがひんやり気持ちいいですよ。', light: '岬の先に立つ白い灯台です。夜は光がぐるっと回ります。', church: '丘のふもとの小さな神社です。夜は石灯籠に明かりがともります。', peak: '島でいちばん高い場所。島じゅうが見わたせます。', mikan: '西の斜面に段々に広がるみかん畑です。', beach: '川が海に注ぐ西の浜。夕方は空がオレンジ色に染まります。', islet: '港の漁船で行ける、小さなはなれ島です。' };
const MONTH_NOTE = ['1月。冬の海は空気がすんで、遠くの島までくっきり見えます。', '2月。風はまだ冷たいけれど、日ざしは少しずつ春の色です。', '3月。島の木々に新しい芽が出はじめました。', '4月。あたたかくなって、外を歩くのが気持ちいい季節です。', '5月。みかんの白い花がさいて、あまい香りがします。', '6月。雨の日が多くなります。しっとりした島もすてきですよ。', '7月。夏の海がいちばん青い季節。熱中症に気をつけて。', '8月。夕方の浜は、昼の暑さがうそのように涼しいです。', '9月。空が高くなって、夕焼けがきれいな日がふえました。', '10月。みかんが少しずつ色づいてきました。', '11月。木の葉が色づき、灯台の明かりが早くともる季節です。', '12月。今年もあと少し。夜の神社の灯籠があたたかく光ります。'];
const QUOTES = {
  v_mio: ['港の赤い灯台、朝日に照らされるとピンク色に見えるんだよ。', '今日は波がおだやかだから、漁船日和だね！', '滝つぼのまわり、ひんやりしてて大好き。'],
  v_sora: ['海ぞいの道、朝いちばんに軽トラで走ると最高だぜ！', '新しい道ができたら、オレが一番に走るからな！', '岬の灯台まで競争、まだ受けつけてるぜ。'],
  v_hana: ['朝つゆにぬれた花って、宝石みたいなのよ。', '木が育つのはゆっくり。だからこそ楽しみなの。', '雨の音を聞きながら、お茶を飲むのが好きなの。'],
  v_gen: ['今朝は沖でいい風がふいとった。今日はええ日になるぞ。', '島はの、人が手をかけた分だけ元気になるんじゃ。', '若いもんがおると、港がにぎやかでええのう。'],
  v_kai: ['お店の自販機、今日もつめたい飲み物入ってるよ！', '夕焼けの時間、浜まで競争しようよ！', '{P}さん、今日はなに作るの？'],
};
Object.assign(GAME, {
  letterSummary(prev) {
    const p = this.p; if (!prev) return null;
    const d = {}; for (const k of STAT_KEYS) d[k] = Math.round((p.stats[k] || 0) - (prev.base[k] || 0));
    const parts = [];
    if (d.dailyDone > 0) parts.push(`住民のおねがいを${d.dailyDone}こかなえ`);
    if (d.roadM > 0) parts.push(`道路を${d.roadM}m作り`);
    if (d.plant > 0) parts.push(`木を${d.plant}本植え`);
    if (d.water > 0) parts.push('池や川を作り');
    if (d.shape > 0) parts.push(`地面を${d.shape}回ととのえ`);
    if (d.clear > 0) parts.push(`草木を${d.clear}こ片づけ`);
    if (d.truckM > 50) parts.push(`軽トラで${d.truckM}m走り`);
    if (d.boatM > 50) parts.push(`漁船で${d.boatM}m進み`);
    if (d.walkM > 100) parts.push(`${d.walkM}m歩き`);
    return parts.length ? `前回の島ぐらしでは、${parts.slice(0, 4).join('、')}ました。おつかれさまでした！` : '前回はのんびり過ごしましたね。のんびりする日も、島ぐらしには大切です。';
  },
  letterRecs(R) {
    const p = this.p, lv = this.level(), C = [], userRoads = ROADS.filter(r => r.user);
    const zl = z => this.zoneLabel[z] ? { x: this.zoneLabel[z].x, z: this.zoneLabel[z].z } : null;
    const lastLv = p.letterLv || 1;
    for (const id of (p.justBuilt || [])) { const q = PROPOSALS.find(x => x.id === id); if (q) C.push({ pri: 120, icon: '🎉', text: `島の会議で決めた「${q.title}」が完成しました！ 見に行ってみてね。`, at: this.projAt(id) }); }
    p.justBuilt = []; this.lifeRecs(C); this.econRecs(C); this.devRecs(C);
    if (PLACED.hall && this.meetToday()) C.push({ pri: 110, icon: '🏛️', text: `今日は集会所で島の会議の日です。住民のみんなが${p.name}さんを待っています。`, at: { x: PLACED.hall.entry.x, z: PLACED.hall.entry.z } });
    if (lv > lastLv) { const zone = ZONES.findIndex((zz, i) => zz && zz.lv === lv); C.push({ pri: 100, icon: '🔓', text: `元気度がLv${lv}になって、${LV_UNLOCK[lv].join('、')}が解放されました。さっそく行ってみませんか？`, at: zone > 0 ? zl(zone) : null }); }
    if (LV_PTS[lv] !== undefined) { const need = LV_PTS[lv] - p.vit; if (need <= 40) C.push({ pri: 70, icon: '⭐', text: `あと${need}ポイントで元気度Lv${lv + 1}。${LV_UNLOCK[lv + 1][0]}ができるようになります。` }); }
    if (!userRoads.some(r => r.pts.some(([x, z]) => G.zone[toIdx(x, z)[1] * WORLD.n + toIdx(x, z)[0]] === 3)))
      C.push({ pri: 66, icon: '🛣️', text: '③開拓地にはまだ道がありません。しまづくりの「道路」で、海ぞいの県道から道を引いてみませんか？', at: { x: OPEN.x, z: OPEN.z } });
    let best = null; for (const g of GOALS) { if (p.goals[g.id] || (g.needLv && g.needLv > lv)) continue; const pr = this.goalProg(g), f = pr / g.n; if (f > 0 && f < 1 && (!best || f > best.f)) best = { g, f, rem: Math.ceil(g.n - pr) }; }
    if (best) C.push({ pri: 60 + best.f * 20, icon: '🎯', text: `島の目標「${best.g.text}」は、いま${Math.floor(best.g.n - best.rem)}/${best.g.n}${best.g.unit || ''}。もう少しで達成です！` });
    const notMet = VILLAGER_DEF.find(v => !p.talked[v.id]);
    if (notMet) { const n = NPCS.find(q => q.def.id === notMet.id); C.push({ pri: 58, icon: '👋', text: `${notMet.name}さんとまだ話していないようです。家の近くにいることが多いですよ。`, at: n ? { x: n.hx, z: n.hz } : null }); }
    const unv = MEISHO.filter(k => !p.visited[k] && !(this.LM[k] && this.LM[k].gone)); if (unv.length) { const id = unv[Math.floor(R() * unv.length)], L = this.LM[id]; C.push({ pri: 55, icon: '📍', text: `${LM_NAMES[id]}にはまだ行っていませんね。${LM_DESC[id]}`, at: { x: L.x, z: L.z } }); }
    if (p.stats.water < 1 && lv >= 2) C.push({ pri: 52, icon: '💧', text: '「川・池」の道具が使えるようになっています。開拓地に小さな池を作ると、景色ががらっと変わりますよ。', at: { x: OPEN.x, z: OPEN.z } });
    if (VEG.userTrees.length < 5) C.push({ pri: 48, icon: '🌳', text: '開拓地はまだ木が少なくて、ちょっとさびしい感じです。しまづくりの「木を植える」で木かげを作りませんか？', at: { x: OPEN.x, z: OPEN.z } });
    if (p.stats.boatM < 30) { const H = this.LM.harbor; C.push({ pri: 45, icon: '🚤', text: '港の漁船にはまだ乗っていませんね。Spaceで乗って、海から島をながめてみては？', at: { x: H.x, z: H.z } }); }
    else if (!p.visited.islet) C.push({ pri: 44, icon: '🏝️', text: `漁船で南西の${LM_NAMES.islet}まで行けますよ。${LM_DESC.islet}`, at: { x: this.LM.islet.x, z: this.LM.islet.z } });
    if (p.stats.truckM < 50) C.push({ pri: 40, icon: '🛻', text: 'お店の横の軽トラ、海ぞいの県道を走ると気持ちいいですよ。' });
    const met = VILLAGER_DEF.filter(v => p.talked[v.id]); if (met.length >= 3) { const lo = met.reduce((a, b) => (p.friend[a.id] || 0) <= (p.friend[b.id] || 0) ? a : b); C.push({ pri: 30, icon: '💬', text: `${lo.name}さん、${p.name}さんともっと話したそうにしていましたよ。` }); }
    C.forEach(c => c.s = c.pri + R() * 12); C.sort((a, b) => b.s - a.s);
    return C.slice(0, 3).map(({ icon, text, at }) => ({ icon, text, at: at || null }));
  },
  makeLetter(prev) {
    const p = this.p; p.letters = p.letters || [];
    const R = mulberry(hashStr('letter' + todayKey() + p.created)), no = (p.letterNo || 0) + 1;
    const others = VILLAGER_DEF.filter(v => v.id !== 'v_rin'), qv = others[(no - 1) % others.length], qs = QUOTES[qv.id];
    const first = no === 1;
    const L = { no, date: todayKey(), season: MONTH_NOTE[seasonDate().getMonth()],
      sum: first ? `${p.name}さん、はじめまして。島だよりは、毎朝${p.island}島のようすとおすすめをお届けする新聞です。読まなくても大丈夫。気が向いたときにどうぞ。` : this.letterSummary(prev),
      recs: this.letterRecs(R), quote: { who: qv.id, text: qs[Math.floor(R() * qs.length)] }, read: false };
    p.letterNo = no; p.letterLv = this.level(); p.letters.push(L); if (p.letters.length > 14) p.letters.shift();
    this.dirty = true; return L;
  },
  unreadLetter() { const ls = this.p && this.p.letters; return ls && ls.length && !ls[ls.length - 1].read ? ls[ls.length - 1] : null; },
  notifyLetter() { const L = this.unreadLetter(); if (L) UI.toast(`📮 家のポストに島だより 第${L.no}号が届いています`); },
  openLetter(no, fromMail) {
    const p = this.p; if (!p || !p.letters || !p.letters.length) return;
    const un = this.unreadLetter();
    if (un && !fromMail && (no === undefined || no === un.no)) { UI.toast('📮 島だよりは家のポストに届いています。取りに行こう！'); this.openMap(PLACED.home ? PLACED.home.mail : null); return; }
    const L = no !== undefined ? p.letters.find(l => l.no === no) : [...p.letters].reverse().find(l => l.read);
    if (!L) return; L.read = true; this.dirty = true; this.renderTracker();
    this.modal = 'letter'; const [y, m, d] = L.date.split('-').map(Number), F = s => esc(this.fill(s));
    const isToday = L.date === todayKey();
    const reqs = isToday ? this.todays().map(q => `<li class="${p.daily.done[q.id] ? 'done' : ''}"><b>${VNAME(q.who)}</b>${esc(q.text)}</li>`).join('') : '';
    this.el.modal.innerHTML = `<div class="mbox letter"><button class="x" data-x="close" aria-label="とじる">×</button>
      <div class="mast"><div class="nm">${esc(p.island)}島 島だより</div><div class="meta">第${L.no}号　${m}月${d}日　編集：リン</div></div>
      <div class="lb"><p class="season">${esc(L.season)}${isToday && p.lastIncome && p.lastIncome.date === L.date ? `<br>💴 きのうの観光客 約${p.lastIncome.tour * 15}人・島の収入 ${yen(p.lastIncome.amount)}` : ''}${isToday ? `<br>🐟 今日の高値：${esc(FISH.find(f => f.id === this.hotFish()).name)}（出荷所でいつもの2倍）` : ''}</p>${L.sum ? `<p>${F(L.sum)}</p>` : ''}
      <h3>今日のおすすめ</h3><ul class="recs">${L.recs.map((r, i) => `<li><span class="ic">${r.icon}</span><span class="tx">${F(r.text)}</span>${r.at ? `<button data-at="${i}">地図で見る</button>` : ''}</li>`).join('')}</ul>
      ${reqs ? `<h3>今日のおねがい</h3><ul class="reqs">${reqs}</ul>` : ''}
      <div class="quote"><span class="who">${VNAME(L.quote.who)}のひとこと</span>「${F(L.quote.text)}」</div>
      <p class="sign">おすすめは、やってもやらなくても大丈夫。${esc(p.name)}さんのペースで、島ぐらしを楽しんでね。 — リン</p></div>
      <div class="lf">${p.letters.length > 1 ? '<button data-x="back">過去の島だより</button>' : ''}<span class="sp"></span><button class="primary" data-x="close">とじる</button></div></div>`;
    this.el.modal.hidden = false;
    this.el.modal.querySelector('.letter').onclick = e => {
      const a = e.target.closest('[data-at]'); if (a) { this.openMap(L.recs[+a.dataset.at].at); return; }
      const x = e.target.closest('[data-x]'); if (!x) return; if (x.dataset.x === 'close') this.closeModal(); if (x.dataset.x === 'back') this.openJournal('letters');
    };
    setTimeout(() => { const b = this.el.modal.querySelector('.lf .primary'); if (b) b.focus(); }, 30);
  },
  lettersTab() {
    const ls = (this.p.letters || []).slice().reverse();
    return `<ul class="list">${ls.map(l => { const [y, m, d] = l.date.split('-').map(Number); return `<li class="${l.read ? '' : 'unread'}"><span class="ck">${l.read ? '📰' : '📮'}</span><div><b>第${l.no}号</b>　${m}月${d}日<div class="sub">${l.read ? esc(this.fill(l.recs[0] ? l.recs[0].text : l.season)) : '家のポストに届いています'}</div></div>${l.read ? `<button class="open" data-letter="${l.no}">読む</button>` : ''}</li>`; }).join('')}</ul><p class="small">島だよりは毎朝（現実の日付で）1号ずつ届きます。最新の14号まで残ります。</p>`;
  },
});
