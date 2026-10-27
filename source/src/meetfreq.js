// ===================== 島の会議を毎日に (ver.46) =====================
// - 会議は7日に1回 → 毎日1回（現実の日付で1日1回。決めた次の日にはまた集まれる）
// - 工事の提案（10案）だけだと10回で議題が尽きるので、くり返し開ける「行事」の案を足した。
//   行事は決めたその日に起きる（今夜の花火大会・星を見る会で夜は晴れ・大そうじやお茶会で住民と仲よく など）。
//   同じ行事は数日あけないと議題に出ない。議題は「まだの工事案（最大2つ）＋行事」で3つそろえる
const MEET_EV = [
  { id: 'e_fireworks', who: 'v_kai', title: '今夜、港で花火大会', desc: '今夜みんなで花火を見ようよ！ 港の上にドーンって上げたら、ぜったいきれい！', effect: '今夜19時から、港の上に花火が上がる', tags: ['event', 'light', 'sea'], cd: 4, lv: 2,
    run: g => { const D = g.devState(); D.fireworks = Object.assign({}, D.fireworks || {}, { id: 'fireworks', state: 'done', date: todayKey() }); return '今夜19時から、港の上で花火大会！'; } },
  { id: 'e_stars', who: 'v_mio', title: '丘で星を見る会', desc: '今夜は丘のてっぺんで、みんなで星を見ようよ！ てるてる坊主もつくったから、きっと晴れるよ。', effect: '今夜は晴れて、星がよく見える', tags: ['scenery', 'quiet'], cd: 4,
    run: g => { g.p.evDay = Object.assign(g.p.evDay || {}, { stars: todayKey() }); return '今夜は晴れの予報。見晴らしの丘で星を見よう！'; } },
  { id: 'e_cleanup', who: 'v_hana', title: '浜の大そうじ', desc: 'みんなで浜をきれいにしましょう。ゴミ拾いのあとは、きっと海がもっときれいに見えるわ。', effect: '住民みんなと少し仲よくなる・元気度 +8', tags: ['nature', 'sea', 'community'], cd: 3,
    run: g => { MEETF.friends(g, 1); g.addVit(8); return 'みんなで浜をぴかぴかにした！'; } },
  { id: 'e_tea', who: 'v_hana', title: '集会所でお茶会', desc: 'おいしいお茶とお菓子を用意するわ。ゆっくりおしゃべりしましょう。', effect: '住民みんなと仲よくなる（いつもの倍）', tags: ['quiet', 'community'], cd: 3,
    run: g => { MEETF.friends(g, 2); return 'お茶会で、みんなとたくさん話せた！'; } },
  { id: 'e_sports', who: 'v_sora', title: '浜で島の運動会', desc: 'たまには体を動かそうぜ！ 浜でつな引きとかけっこだ！', effect: '元気度 +12', tags: ['event', 'community'], cd: 4,
    run: g => { g.addVit(12); return '運動会でみんなへとへと。でも楽しかった！'; } },
  { id: 'e_story', who: 'v_gen', title: '昔ばなしの会', desc: 'わしが子どものころの島の話を、みんなに聞かせたいんじゃ。', effect: '住民みんなと少し仲よくなる・元気度 +6', tags: ['tradition', 'culture', 'quiet'], cd: 4,
    run: g => { MEETF.friends(g, 1); g.addVit(6); return 'ゲンさんの昔ばなし、島のことがもっと好きになった。'; } },
  { id: 'e_mikan', who: 'v_gen', title: 'みかん畑の手入れの日', desc: 'みかんの木は手をかけてやると、ちゃんと応えてくれるんじゃ。みんなで手入れをせんか。', effect: '元気度 +8・島のお金 +1,500円（みかんのおすそわけ代）', tags: ['tradition', 'nature', 'shop'], cd: 4,
    run: g => { g.addVit(8); g.p.money = (g.p.money || 0) + 1500; return 'みかん畑がぴかぴか。おすそわけのお礼に 1,500円。'; } },
  { id: 'e_market', who: 'v_kai', title: '港で朝市の日', need: 'market', desc: '朝市を特別に大きくやろうよ！ 島の外からもお客さんが来るよ！', effect: '島のお金 +4,000円（朝市の売り上げ）', tags: ['shop', 'event', 'sea'], cd: 3,
    run: g => { g.p.money = (g.p.money || 0) + 4000; return '朝市は大にぎわい！ 売り上げ 4,000円。'; } },
  { id: 'e_concert', who: 'v_rin', title: '広場でミニコンサート', need: 'park', desc: '広場でみんなで歌ったり演奏したりしたいな！', effect: '住民みんなと仲よくなる・元気度 +6', tags: ['culture', 'event', 'community'], cd: 4,
    run: g => { MEETF.friends(g, 1); g.addVit(6); return '広場に歌声がひびいた！'; } },
  { id: 'e_photo', who: 'v_rin', title: '島の写真コンテスト', desc: 'みんなで島のすてきな場所を撮って、いちばんの1枚を決めようよ！', effect: '元気度 +6・島の自慢がふえる', tags: ['culture', 'scenery'], cd: 5,
    run: g => { g.addVit(6); return '写真コンテスト、いい写真がいっぱい！'; } },
].map(e => Object.assign(e, { ev: true }));
const MEETF = { DAYS: 1 };
MEETF.friends = (g, n) => VILLAGER_DEF.forEach(v => { g.p.friend[v.id] = (g.p.friend[v.id] || 0) + n; });
MEETF.isEv = id => MEET_EV.some(e => e.id === id);
// event proposals can be looked up like the building ones (renderMeeting / decide use PROPOSALS.find)
PROPOSALS.find = function (fn) { return Array.prototype.find.call(this, fn) || MEET_EV.find(fn); };
Object.assign(GAME, (() => {
  const _ms = GAME.meetState, _ag = GAME.agenda, _dc = GAME.decide, _rm = GAME.renderMeeting;
  return {
    meetState() { const m = _ms.call(this);
      if (m.v !== 2) { m.v = 2; m.ev = m.ev || {}; const t = todayKey(); if (m.next > t) { const last = addDays(m.next, -7); m.next = last >= t ? addDays(t, MEETF.DAYS) : t; } m.agenda = null; }   // old saves waited 7 days: from now on it is the next day
      m.ev = m.ev || {}; return m; },
    agenda() {
      const m = this.meetState(), t = todayKey(); if (m.agenda && m.agenda.date === t && m.agenda.v === 2) return m.agenda.ids.map(id => PROPOSALS.find(q => q.id === id)).filter(Boolean);
      const lv = this.level(), P = this.p.projects || {}, R = mulberry(hashStr('meet2' + t + this.p.created)), ids = [], who = new Set();
      const build = PROPOSALS.filter(q => !m.held.includes(q.id) && (!q.needLv || q.needLv <= lv));
      const evs = MEET_EV.filter(e => (!e.lv || e.lv <= lv) && (!e.need || (P[e.need] && P[e.need].done)) && (!m.ev[e.id] || addDays(m.ev[e.id], e.cd || 3) <= t));
      const pick = (pool, n) => { for (let k = 0; k < 80 && pool.length && ids.length < n; k++) { const q = pool[Math.floor(R() * pool.length)]; if (ids.includes(q.id) || (who.has(q.who) && k < 40)) continue; ids.push(q.id); who.add(q.who); } };
      pick(build, Math.min(2, build.length)); pick(evs, 3);
      if (ids.length < 3) pick(build, 3);
      m.agenda = { date: t, ids, v: 2 }; return ids.map(id => PROPOSALS.find(q => q.id === id));
    },
    decide(id) {
      const m = this.meetState();
      if (!MEETF.isEv(id)) { const r = _dc.call(this, id); m.next = addDays(todayKey(), MEETF.DAYS); this.renderMeeting(); this.save(); return r; }
      const p = this.p, q = MEET_EV.find(e => e.id === id);
      m.count++; m.next = addDays(todayKey(), MEETF.DAYS); m.agenda = null; m.ev[id] = todayKey();
      VILLAGER_DEF.forEach(v => { if (this.stance(q, v.id).s === 'yes') p.friend[v.id] = (p.friend[v.id] || 0) + 1; });
      let msg = ''; try { msg = q.run(this) || ''; } catch (e) { console.warn('meeting event', id, e); }
      this.mt.evMsg = msg; this.addVit(5); p.stats.meetN = (p.stats.meetN || 0) + 1; this.mt.step = 'done'; this.dirty = true; this.check(); this.renderMeeting(); this.save();
    },
    renderMeeting() { _rm.apply(this, arguments); const mt = this.mt, el = this.el.meet; if (!mt || !el) return; const q = mt.sel && MEET_EV.find(e => e.id === mt.sel);
      el.querySelectorAll('.pcard').forEach(b => { if (MEETF.isEv(b.dataset.p)) b.classList.add('evcard'); });
      if (!q) return;
      if (mt.step === 'detail') { const e2 = el.querySelector('.eff2'); if (e2) e2.textContent = `行事（今日）：${q.effect}`; }
      if (mt.step === 'done') { const e2 = el.querySelector('.eff2'); if (e2) e2.textContent = `決定：「${q.title}」　${mt.evMsg || q.effect}　元気度 +5`; }
    },
  };
})());
// 星を見る会: that night stays clear (only when the weather is on おまかせ)
{ const _w = SEASON.autoWeather; SEASON.autoWeather = function (hf) { const p = GAME.p; if (p && p.evDay && p.evDay.stars === todayKey() && hf >= 15) return 'clear'; return _w.apply(this, arguments); }; }
{ const st = document.createElement('style'); st.textContent = `.pcard.evcard{border-color:#f0b84a !important}.pcard.evcard .who::after{content:'　🎪 行事';color:#c47a10;font-weight:700}`; document.head.appendChild(st); }
