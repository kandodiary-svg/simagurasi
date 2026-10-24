// ===================== STORY: chapters of the island's revival, big late-game projects, island rank =====================
const resN = () => NPCS.filter(n => !n.visitor).length + 1 + (typeof extraResidents === 'function' ? extraResidents() : 0);
const devDone = id => { const D = GAME.p && GAME.p.dev; return !!(D && D[id] && D[id].state === 'done'); };
const talkedN = () => ['v_mio', 'v_sora', 'v_hana', 'v_gen', 'v_rin', 'v_kai'].filter(id => GAME.p.talked[id]).length;
const CHAPTERS = [
  { id: 'c0', no: '序章', title: 'ほしなみ島へようこそ', rank: 'さびれた島',
    goals: [{ t: '島の住民6人とあいさつする', n: 6, prog: talkedN }, { t: '島の元気度を Lv2 にする', n: 2, prog: () => GAME.level() }],
    intro: [['', '――瀬戸内海にうかぶ、小さな島。'], ['リン', '{P}さん、{I}島へようこそ！ …あのね、じつはこの島、ちょっとさびしくなっちゃってるの。'], ['ゲンじい', 'わしが若いころはの、港は漁船でいっぱい、夏には祭りの太鼓がひびいとった。'], ['リン', '小学校も何年も前に閉まって…。でも、{P}さんが来てくれたから、なんだか変われる気がするんだ。'], ['', 'まずは島のみんなにあいさつして、島を元気にしていこう。']],
    outro: [['リン', 'みんなとなかよくなれたみたいだね！ 島の空気が、ちょっと明るくなった気がする。'], ['ゲンじい', 'ふむ。次は港じゃな。港が元気になれば、島に人が来る。']] },
  { id: 'c1', no: '第1章', title: '港に灯を', rank: 'ちいさな港の島',
    goals: [{ t: '開発「港の待合所」を完成させる', n: 1, prog: () => devDone('waiting') ? 1 : 0 }, { t: '魚を5匹釣る', n: 5, prog: () => GAME.p.stats.fishN || 0 }],
    intro: [['ゲンじい', '{P}よ、港を見てみい。船を待つ人が雨やどりする場所もない。'], ['カイ', '待合所があれば、お客さんも来やすくなるよね！ 開発（P）からたのめるよ。'], ['ゲンじい', 'それと、島の魚の味も知っておくとええ。釣りをしてみるんじゃ。']],
    outro: [['ゲンじい', '待合所ができて、港に人の声がもどってきたのう。'], ['ミオ', '夜になると待合所に灯りがともって、港が明るいんだ！'], ['リン', 'ねえ、本土の人が「引っこしてみたい」って言ってるんだって！']] },
  { id: 'c2', no: '第2章', title: '新しい仲間', rank: 'にぎわいはじめた島',
    goals: [{ t: '新しい住民をむかえる（島民 8人）', n: 8, prog: resN }, { t: '観光ポイントを 5 にする', n: 5, prog: () => GAME.tourism() }],
    intro: [['リン', '島に住みたいって人が見学に来るようになったよ！ 港のあたりで案内してあげてね。'], ['ハナ', '新しいご近所さん…ふふ、楽しみね。'], ['ソラ', 'バスや桟橋ができれば、観光客ももっと来るぜ！']],
    outro: [['ナギ', 'この島に来てよかった！ 毎日が釣りざんまいだよ。'], ['ゲンじい', 'にぎやかになってきたのう。…そうじゃ、むかしの「ほしなみ夏祭り」を知っとるか？'], ['ゲンじい', '島の広場にやぐらを組んで、みんなで盆おどりをしたもんじゃ。もう一度、見てみたいのう。']] },
  { id: 'c3', no: '第3章', title: '夏祭りをもう一度', rank: 'お祭りの島',
    goals: [{ t: '開発「祭りの広場」を完成させる', n: 1, prog: () => devDone('matsuri') ? 1 : 0 }],
    unlock: ['matsuri'],
    intro: [['リン', 'ゲンじいの話、ずっと考えてたの。祭りの広場を作って、夏祭りを復活させようよ！'], ['カイ', '屋台はぼくにまかせて！'], ['', '🔓 開発に「祭りの広場」が追加された']],
    outro: [['', '――広場にやぐらが立ち、ちょうちんに灯がともった。'], ['ゲンじい', '…ああ、この景色じゃ。わしが子どものころに見た、ほしなみの夏じゃ。'], ['ミオ', 'みんなの顔がちょうちんの灯りで赤くて、なんだかうれしいね。'], ['リン', 'ねえ、子どもの声がもっと聞こえる島にしたいな。…閉まった小学校、もう一度開けられないかな。']] },
  { id: 'c4', no: '第4章', title: '子どもの声がする島', rank: '子どもの声がする島',
    goals: [{ t: '島民を 9人にする', n: 9, prog: resN }, { t: '開発「ほしなみ小学校」を完成させる', n: 1, prog: () => devDone('school') ? 1 : 0 }],
    unlock: ['school'],
    intro: [['リン', '島の人がふえてきた今なら、学校を開けられるかもしれない！'], ['タクミ', '校舎のことなら、おれにまかせてほしいっす！'], ['', '🔓 開発に「ほしなみ小学校」が追加された']],
    outro: [['', '――キーンコーンカーンコーン…。何年ぶりかのチャイムが、島にひびいた。'], ['コタロウ', 'やったー！ 学校だ！ 毎日みんなと遊べるぞー！'], ['ハナ', '子どもの笑い声って、花が咲くみたいね。'], ['ユキ', 'ねえ、観光の人がもっとくつろげる場所があったらいいと思わない？ 山のほうに、むかし温泉がわいてたらしいの。']] },
  { id: 'c5', no: '第5章', title: '湯けむりの島', rank: '湯けむりの島',
    goals: [{ t: '観光ポイントを 12 にする', n: 12, prog: () => GAME.tourism() }, { t: '開発「しおかぜ温泉」を完成させる', n: 1, prog: () => devDone('onsen') ? 1 : 0 }],
    unlock: ['onsen', 'mansion'],
    intro: [['ユキ', '海が見える露天風呂…絵にかきたくなる景色になると思うんだ。'], ['ゲンじい', '温泉か。漁のあとの一っぷろは格別じゃぞ。'], ['', '🔓 開発に「しおかぜ温泉」と「しおさいマンション」が追加された']],
    outro: [['', '――湯けむりの向こうに、夕日の海がきらめいている。'], ['ソラ', 'ふぃ〜…極楽だぜ……。'], ['リン', '{P}さん。ここまで来たら、最後の夢、聞いてくれる？'], ['リン', '本土と島をつなぐ、大きな橋。いつでもだれでも、この島に来られるように。']] },
  { id: 'c6', no: '終章', title: '海をこえて', rank: '瀬戸内一のあこがれの島',
    goals: [{ t: '島の元気度を Lv7 にする', n: 7, prog: () => GAME.level() }, { t: '開発「ほしなみ大橋」を完成させる', n: 1, prog: () => devDone('ohashi') ? 1 : 0 }],
    unlock: ['ohashi', 'resort'],
    intro: [['リン', '大橋ができたら、島はもう「遠い島」じゃなくなる。'], ['ゲンじい', 'じゃが、島らしさは忘れちゃいかんぞ。海と、祭りと、人のあたたかさじゃ。'], ['', '🔓 開発に「ほしなみ大橋」と「ほしなみリゾートホテル」が追加された']],
    outro: [['', '――夜の海に、大橋の灯りが一本の光の道をえがいた。'], ['ゲンじい', '{P}…おまえさんが来てくれて、ほんとうによかった。'], ['リン', '{I}島は、もう「さびれた島」じゃない。みんなの、あこがれの島だよ！'], ['ミオ', 'これからも、ずっと一緒に島ぐらししようね！'], ['', '～ ほしなみ島ぐらし　おしまい ～　（このあとも島での暮らしは続きます）']] },
];
const STORY = { scene: null, t: 0 };
STORY.st = function () { const p = GAME.p; p.story = p.story || { ch: 0, intro: {}, done: {} }; return p.story; };
STORY.cur = function () { const s = STORY.st(); return CHAPTERS[Math.min(s.ch, CHAPTERS.length - 1)]; };
STORY.rank = function () { const s = STORY.st(); const done = Object.keys(s.done).length; return done >= CHAPTERS.length ? CHAPTERS[CHAPTERS.length - 1].rank : CHAPTERS[Math.max(0, s.ch)].rank; };
STORY.ready = function () { return GAME.p && !GAME.modal && !DIALOG.npc && !STORY.scene && !GAME.inside && !EDIT.on && !(LIFE.fish) && !GAME.placing && (!PL.veh || Math.abs(PL.veh.v || 0) < 0.5); };
STORY.play = function (lines, done) { STORY.scene = { lines: lines.map(([w, t]) => [w, GAME.fill(t)]), i: 0, done }; const [w, t] = STORY.scene.lines[0]; UI.dialog(w || '　', t); };
STORY.next = function () { const S = STORY.scene; if (!S) return false; if (UI.typing && UI._full) { UI._full(); return true; } S.i++; if (S.i >= S.lines.length) { STORY.scene = null; UI.dialog(null); if (S.done) S.done(); return true; } const [w, t] = S.lines[S.i]; UI.dialog(w || '　', t); return true; };
{ const _at = advanceTalk; advanceTalk = function () { if (STORY.scene) return STORY.next(); return _at(); }; }
STORY.syncDev = function () { const s = STORY.st(), p = GAME.p; p.devSeen = p.devSeen || {}; const ids = [];
  for (let i = 0; i < CHAPTERS.length; i++) { const C = CHAPTERS[i]; if (!C.unlock || i > s.ch) continue; ids.push(...C.unlock); } if (s.ch >= CHAPTERS.length) ids.push('tower');
  const fresh = []; for (const id of ids) { const d = BIG_DEV.find(q => q.id === id); if (d && !DEV.includes(d)) DEV.push(d); if (d && !p.devSeen[id]) { p.devSeen[id] = 1; fresh.push(d); } }
  if (fresh.length && p.storyDev) setTimeout(() => UI.toast(`🔓 開発に${fresh.map(d => `「${d.name}」`).join('')}が追加されました（P）`), 2500); };
STORY.check = function () {
  if (window.__nostory || !STORY.ready()) return; const s = STORY.st(); if (s.ch >= CHAPTERS.length) return; const C = CHAPTERS[s.ch];
  if (!s.intro[C.id]) { s.intro[C.id] = 1; STORY.syncDev(); GAME.dirty = true; GAME.banner(`📜 ${C.no}　${C.title}`, C.goals.map(g => g.t).join('　/　')); setTimeout(() => { if (STORY.ready()) STORY.play(C.intro); else s.intro[C.id] = 0; }, 1200); return; }
  if (C.goals.every(g => g.prog() >= g.n)) { s.done[C.id] = 1; s.ch++; GAME.dirty = true; GAME.addVit(20); GAME.addMoney && GAME.addMoney(5000 * (s.ch)); try { SND.play('levelup', { vol: 0.8 }); } catch (e) { }
    STORY.play(C.outro, () => { STORY.syncDev(); GAME.banner(`✨ ${C.no}「${C.title}」クリア！`, `島のランクが「${STORY.rank()}」になった　お祝い ${yen(5000 * s.ch)}`); GAME.renderTracker(); }); GAME.renderTracker(); }
};
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); STORY.t += dt || 0; if (STORY.t > 1.5) { STORY.t = 0; try { if (GAME.p && !GAME.p.storyDev) { GAME.p.storyDev = 1; STORY.syncDev(); GAME.refreshDev && GAME.refreshDev(); } STORY.check(); } catch (e) { if (!STORY._e) { STORY._e = 1; console.warn('story', e); } } } return r; }; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { if (GAME.p) { STORY.syncDev(); GAME.p.storyDev = 1; this.refreshDev && this.refreshDev(); } } catch (e) { console.warn(e); } return r; }; }
// ---------- tracker line, journal tab ----------
{ const _rt = GAME.renderTracker; GAME.renderTracker = function () { _rt.apply(this, arguments); const p = this.p, s = this.el && this.el.side; if (!p || !s) return; const st = STORY.st(), C = CHAPTERS[st.ch];
    const html = `<div class="rank">🏝️ ${esc(p.island)}島「${STORY.rank()}」<span>島民 ${resN()}人・観光客 ${GAME.tourism() * 15}人/日</span></div>` + (C ? `<div class="story" data-g="story">📜 <b>${C.no}　${esc(C.title)}</b><br>${C.goals.map(g => { const v = Math.min(g.n, Math.floor(g.prog())); return `<div class="sg ${v >= g.n ? 'ok' : ''}">${v >= g.n ? '✓' : '・'} ${esc(g.t)}${g.n > 1 ? ` <i>${v}/${g.n}</i>` : ''}</div>`; }).join('')}</div>` : '<div class="story">📜 物語クリア！ これからも島ぐらしを楽しもう</div>');
    let el = s.querySelector('.storybox'); if (!el) { el = document.createElement('div'); el.className = 'storybox'; const v = s.querySelector('.vit'); if (v) v.after(el); else s.prepend(el); } if (el._h !== html) { el.innerHTML = html; el._h = html; }
    el.onclick = e => { e.stopPropagation(); this.openJournal('story'); }; }; }
{ const _oj = GAME.openJournal; GAME.openJournal = function (tab) { _oj.call(this, tab === 'story' ? 'daily' : tab); const tabs = this.el.modal.querySelector('.tabs'); if (!tabs) return; tabs.insertAdjacentHTML('afterbegin', `<button data-tab="story" class="${tab === 'story' ? 'on' : ''}">物語</button>`);
    if (tab === 'story') { this.jTab = 'story'; tabs.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === 'story')); const st = STORY.st();
      this.el.modal.querySelector('.mb').innerHTML = `<p class="small" style="margin:0 0 8px">島のランク：<b>${STORY.rank()}</b>　・　島民 ${resN()}人　・　観光客 1日 ${GAME.tourism() * 15}人　・　観光ポイント ${GAME.tourism()}</p><ul class="list">${CHAPTERS.map((C, i) => { const done = st.done[C.id], cur = i === st.ch, lock = i > st.ch;
        return `<li class="${done ? 'done' : lock ? 'lock' : ''}"><span class="ck">${done ? '✓' : lock ? '🔒' : '📜'}</span><div><b>${C.no}　${lock ? '？？？' : esc(C.title)}</b>${cur || done ? `<div class="sub">${C.goals.map(g => { const v = Math.min(g.n, Math.floor(g.prog())); return `${v >= g.n || done ? '✓' : '・'}${esc(g.t)}${g.n > 1 && !done ? ` ${v}/${g.n}` : ''}`; }).join('<br>')}</div>` : ''}${done ? `<div class="sub">島のランク「${C.rank}」　<button class="mini" data-replay="${i}">もう一度見る</button></div>` : ''}</div></li>`; }).join('')}</ul>`;
      const jb = this.el.modal.querySelector('.journal'), prev = jb.onclick; jb.onclick = e => { const rp = e.target.closest('[data-replay]'); if (rp) { const C = CHAPTERS[+rp.dataset.replay]; this.closeModal(); STORY.play(C.intro.concat(C.outro)); return; } prev(e); }; } }; }
// ---------- big late-game projects ----------
const BIG_DEV = [
  { id: 'matsuri', name: '祭りの広場', lv: 3, price: 50000, tour: 2, place: 'auto', icon: '🏮', note: '広場にやぐらとちょうちんを常設。夏祭りがもっと盛り上がり、毎晩ちょうちんに灯がともります' },
  { id: 'school', name: 'ほしなみ小学校', lv: 4, price: 120000, tour: 1, place: 'player', w: 24, d: 20, icon: '🏫', note: '閉校していた小学校を再開。朝と夕方にチャイムが鳴り、子どもたちが通います' },
  { id: 'onsen', name: 'しおかぜ温泉', lv: 5, price: 160000, tour: 5, place: 'player', w: 18, d: 14, icon: '♨️', note: '海の見える露天風呂つきの温泉。入ると元気度が上がります（1日1回）' },
  { id: 'ohashi', name: 'ほしなみ大橋', lv: 7, price: 400000, tour: 8, place: 'auto', icon: '🌉', note: '本土と島をむすぶ大きなつり橋。夜はライトアップされます' },
];
DEV_LOC.matsuri = function () { const P = SEASON.findPlaza(); return { x: P.x, z: P.z, y: P.y, rot: 0 }; };
DEV_LOC.ohashi = function () {
  let best = null; for (let a = 0; a < 6.283; a += 0.04) { const dx = Math.cos(a), dz = Math.sin(a); let cx = null, cz = null; for (let r = 330; r > 40; r -= 2) { if (groundH(dx * r, dz * r) > 1.5) { cx = dx * r; cz = dz * r; break; } } if (cx === null) continue;
    let open = true; for (let d = 12; d <= 300 && open; d += 6) if (groundH(cx + dx * d, cz + dz * d) > -1.5) open = false; if (!open) continue;
    const LM = GAME.LM || {}, far = (q, r) => !q || Math.hypot(q.x - cx, q.z - cz) > r; if (!far(LM.harbor, 90) || !far(LM.beach, 70) || !far(PLACED.lighthouse, 60) || !far(LM.islet, 140)) continue;
    const sc = Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))); if (!best || sc < best.sc) best = { sc, x: cx - dx * 6, z: cz - dz * 6, dx, dz }; }
  if (!best) return null; return { x: best.x, z: best.z, rot: Math.atan2(best.dx, best.dz), dx: best.dx, dz: best.dz };
};
// 祭りの広場: stone paving, permanent yagura, lantern poles with strings of chochin, taiko, notice board, benches, a small shrine
DEV_BUILD.matsuri = function (s) {
  const g = new THREE.Group(), M = evMats(), A = archMats(), y = s.y !== undefined ? s.y : groundH(s.x, s.z); g.position.set(s.x, y, s.z);
  const pave = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 10.8, 0.2, 40), worldMat(TEX.concrete, 0.5, '#d8cfbe', 0.85)); pave.position.y = -0.02; pave.receiveShadow = true; g.add(pave);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(10.6, 0.14, 6, 48), AM.block); ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; g.add(ring);
  yagura(g, 0, 0.08, 0); addCollider({ x: s.x, z: s.z, r: 2.1, kind: 'bld' });
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + 0.2, x = Math.cos(a) * 9.6, z = Math.sin(a) * 9.6; CY(g, 0.09, 4.2, M.wood || MAT.wood, x, 2.1, z, 6); chochinString(g, [x, 4.1, z], [0, 4.4, 0], 6, 0.5); addCollider({ x: s.x + x, z: s.z + z, r: 0.15, kind: 'pole' }); }
  for (let k = 0; k < 8; k++) { const a0 = k / 8 * 6.283 + 0.2, a1 = (k + 1) / 8 * 6.283 + 0.2; chochinString(g, [Math.cos(a0) * 9.6, 3.9, Math.sin(a0) * 9.6], [Math.cos(a1) * 9.6, 3.9, Math.sin(a1) * 9.6], 4, 0.4); }
  { const t = sub(g, -6.2, 0, -3.2, 0.9); B(t, 0.8, 0.6, 0.8, M.wood || MAT.wood, 0, 0.3, 0); CY(t, 0.5, 0.7, stdM('#8a4a2a', 0.5), 0, 0.95, 0, 16, Math.PI / 2, 0); for (const sz of [-0.36, 0.36]) CY(t, 0.5, 0.02, stdM('#f0e6d0', 0.6), 0, 0.95, sz, 16, Math.PI / 2, 0); }
  { const b = sub(g, 6.6, 0, -4.2, -0.9); for (const sx of [-0.8, 0.8]) B(b, 0.1, 1.8, 0.1, MAT.darkwood, sx, 0.9, 0); B(b, 1.9, 1.0, 0.06, MAT.wood, 0, 1.35, 0.02); const sg = dynSign(1.7, 0.8, 'ほしなみ夏祭り', '#fff6e0', '#c8342f'); sg.userData.keep = false; sg.position.set(0, 1.35, 0.07); b.add(sg); B(b, 2.1, 0.08, 0.3, MAT.kawara, 0, 1.92, 0); }
  for (const [x, z, r] of [[-3, 7.5, 0.4], [3, 7.5, -0.4], [7.8, 2.5, -1.4]]) bench(g, x, z, Math.PI + r);
  { const h = sub(g, -7.4, 0, 3.6, 2.2); B(h, 0.9, 0.5, 0.7, AM.block, 0, 0.25, 0); B(h, 0.7, 0.7, 0.55, MAT.wood, 0, 0.85, 0); const rf = new THREE.Mesh(roofGeometry(1.0, 0.9, 0.35, false), MAT.kawara); rf.position.y = 1.2; h.add(rf); B(h, 0.3, 0.3, 0.02, stdM('#f6f0e0', 0.6), 0, 0.85, 0.29);
    const t = sub(g, -5.6, 0, 5.6, 2.2); for (const sx of [-0.9, 0.9]) CY(t, 0.08, 2.2, M.red, sx, 1.1, 0, 8); B(t, 2.4, 0.12, 0.16, M.red, 0, 2.2, 0); B(t, 2.0, 0.1, 0.12, M.red, 0, 1.85, 0); }
  return g;
};
// ほしなみ小学校: two-storey school, clock, shoe-box entrance, schoolyard with goals and bars, flagpole, sakura
DEV_BUILD.school = function (s) {
  const g = new THREE.Group(), A = archMats(), W = 20, D = 8, H1 = 3.4, wall = worldMat(TEX.concrete, 0.4, '#f2ece0', 0.9), trim = stdM('#b8a890', 0.6), z0 = -5;
  const yard = new THREE.Mesh(new THREE.PlaneGeometry(22, 11), worldMat(TEX.dirt, 0.3, '#d8c09a', 1)); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.04, 4.4); yard.receiveShadow = true; g.add(yard);
  const bd = sub(g, 0, 0, z0); B(bd, W + 0.6, 0.4, D + 0.6, AM.block, 0, 0.2, 0); B(bd, W, H1 * 2, D, wall, 0, 0.4 + H1, 0); B(bd, W + 0.2, 0.25, D + 0.2, trim, 0, 0.4 + H1, 0); B(bd, W + 0.3, 0.35, D + 0.3, trim, 0, 0.4 + H1 * 2 + 0.1, 0);
  for (let f = 0; f < 2; f++) for (let k = 0; k < 7; k++) { const x = -W / 2 + 1.6 + k * 2.8; if (f === 0 && Math.abs(x) < 1.6) continue; winPart(bd, x, 0.4 + 1.75 + f * H1, D / 2 + 0.02, 0, 2.0, 1.5, { style: 'slide', cur: (k + f) % 3 }); winPart(bd, x, 0.4 + 1.75 + f * H1, -D / 2 - 0.02, Math.PI, 2.0, 1.5, { style: 'slide' }); }
  { const ct = sub(bd, 0, 0.4 + H1 * 2, 0); B(ct, 3.2, 1.8, 2.4, wall, 0, 0.9, 0); B(ct, 3.4, 0.2, 2.6, trim, 0, 1.85, 0); const face = new THREE.Mesh(new THREE.CircleGeometry(0.62, 24), stdM('#fbfaf4', 0.4)); face.position.set(0, 0.95, 1.22); ct.add(face); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.06, 6, 24), stdM('#3a3a3a', 0.4)); rim.position.set(0, 0.95, 1.23); ct.add(rim);
    const hm = B(ct, 0.06, 0.38, 0.03, stdM('#2a2a2a', 0.4), 0, 1.1, 1.26); const mm = B(ct, 0.04, 0.52, 0.03, stdM('#2a2a2a', 0.4), 0.18, 1.08, 1.27); hm.rotation.z = -0.8; mm.rotation.z = 0.3; hm.userData.keep = mm.userData.keep = true; g.userData.clock = [hm, mm]; }
  { const e = sub(bd, 0, 0, D / 2); B(e, 3.0, 2.5, 0.06, A.sash || MAT.metal, 0, 1.65, 0.05); for (const sx of [-0.75, 0.75]) B(e, 1.3, 2.2, 0.03, A.win[0], sx, 1.55, 0.09); B(e, 4.0, 0.2, 2.4, trim, 0, 3.0, 1.1); for (const sx of [-1.8, 1.8]) CY(e, 0.1, 2.9, trim, sx, 1.45, 2.1, 8); B(e, 4.4, 0.16, 2.6, AM.block, 0, 0.08, 1.2); }
  const sg = dynSign(5.4, 0.8, 'ほしなみ小学校', '#fbfaf4', '#2f4a3a'); sg.userData.keep = false; sg.position.set(0, 0.4 + H1 * 2 - 0.55, z0 + D / 2 + 0.06); g.add(sg);
  // yard: goals, iron bars, flagpole, sakura row, sandbox
  for (const sx of [-1, 1]) { const gl = sub(g, sx * 9.6, 0, 4.4, sx * Math.PI / 2); for (const zz of [-1.6, 1.6]) CY(gl, 0.05, 2.0, MAT.white || stdM('#f8f8f8', 0.5), zz, 1.0, 0, 6); CY(gl, 0.05, 3.2, MAT.white || stdM('#f8f8f8', 0.5), 0, 2.0, 0, 6, 0, Math.PI / 2); const net = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, side: THREE.DoubleSide })); net.position.set(0, 1.0, -0.8); net.rotation.x = 0.4; gl.add(net); }
  { const tb = sub(g, -7.5, 0, 9.5, 0); for (let k = 0; k < 4; k++) { CY(tb, 0.05, 1.0 + k * 0.25, stdM('#3a8ad0', 0.4, 0.3), -1.5 + k, 0.5 + k * 0.125, 0, 6); if (k) CY(tb, 0.025, 1.0, stdM('#d8d8d0', 0.3, 0.6), -2 + k, 0.9 + k * 0.25, 0, 6, 0, Math.PI / 2); } }
  { const fp = sub(g, 7.6, 0, 9.4, 0); CY(fp, 0.06, 7.0, stdM('#d8d8d0', 0.3, 0.6), 0, 3.5, 0, 8); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshStandardMaterial({ map: txCanvas(96, 64, (x) => { x.fillStyle = '#fbfaf4'; x.fillRect(0, 0, 96, 64); x.fillStyle = '#d8283a'; x.beginPath(); x.arc(48, 32, 19, 0, 7); x.fill(); }), side: THREE.DoubleSide })); fl.position.set(0.62, 6.5, 0); fp.add(fl); }
  { const sb = sub(g, 6.5, 0, 0.8, 0); B(sb, 3.0, 0.25, 2.2, MAT.wood, 0, 0.12, 0); B(sb, 2.7, 0.06, 1.9, worldMat(TEX.sand, 0.4, '#f0e2c0', 1), 0, 0.22, 0); }
  bldPlace(g, s); coll(s, 0, z0, W / 2 + 0.3, D / 2 + 0.3); for (const sx of [-1, 1]) coll(s, sx * 9.6, 4.4, 0.3, 1.8); coll(s, -7.5, 9.5, 2.2, 0.3);
  DV.school = { g, s }; return g;
};
// しおかぜ温泉: wooden bathhouse with noren, chimney, and an outdoor rock bath with steam
DEV_BUILD.onsen = function (s) {
  const g = new THREE.Group(), A = archMats(), D2 = devArchMats(), W = 11, D = 7, H = 3.2, B0 = 0.4;
  const bh = sub(g, -2.5, 0, -2.5); B(bh, W + 0.8, B0, D + 0.8, MAT.stone, 0, B0 / 2, 0); B(bh, W, H, D, A.yakisugi, 0, B0 + H / 2, 0); B(bh, W + 0.05, 1.2, D + 0.05, AM.plaster[2], 0, B0 + H - 0.6, 0);
  for (let k = 0; k <= 6; k++) for (const sz of [-1, 1]) B(bh, 0.2, H, 0.2, MAT.darkwood, -W / 2 + k * W / 6, B0 + H / 2, sz * D / 2);
  { const over = 1.0, rise = 2.0, y1 = rise * over / (D / 2 + over); roofPart(bh, { W, D, over, rise, hip: false, rbase: B0 + H - y1 + 0.05, mat: MAT.kawara, soffit: A.soffitWood, fascia: MAT.darkwood, gutterM: A.gutterBr }); gableFill(bh, W, D, rise, y1, B0 + H - y1 + 0.05, MAT.darkwood); }
  { const e = sub(bh, 0, 0, D / 2); B(e, 2.6, 2.4, 0.08, MAT.darkwood, 0, B0 + 1.2, 0.02); const nr = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.0), new THREE.MeshStandardMaterial({ map: txCanvas(128, 64, (x) => { x.fillStyle = '#2a4a8a'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#ffffff'; x.font = '900 40px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ゆ', 64, 34); x.fillStyle = '#1a2a5a'; for (let k = 1; k < 3; k++) x.fillRect(k * 42, 0, 2, 64); }), side: THREE.DoubleSide })); nr.position.set(0, B0 + 2.0, 0.5); e.add(nr); B(e, 3.4, 0.14, 1.2, MAT.kawara, 0, B0 + 2.75, 0.55); }
  const sg = dynSign(3.2, 0.7, 'しおかぜ温泉', '#3a2a1e', '#f6efe0'); sg.userData.keep = false; sg.position.set(-2.5, B0 + H + 0.2, -2.5 + D / 2 + 0.95); g.add(sg);
  CY(g, 0.35, 7.5, AM.brick, -6.5, 3.75, -5.0, 10); CY(g, 0.42, 0.3, AM.block, -6.5, 7.5, -5.0, 10);
  // outdoor rock bath
  const pool = sub(g, 5.2, 0, 1.6); const rk = worldMat(TEX.rock, 0.3, '#8a857c', 0.7), R = mulberry(17);
  for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283, r = 3.0 + R() * 0.25, m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + R() * 0.25, 0), rk); m.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r * 0.8); m.rotation.set(R(), R() * 6, R()); m.castShadow = true; pool.add(m); }
  const wtr = new THREE.Mesh(new THREE.CircleGeometry(3.0, 28), new THREE.MeshStandardMaterial({ color: '#8fd0d8', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.85 })); wtr.rotation.x = -Math.PI / 2; wtr.scale.y = 0.8; wtr.position.y = 0.32; pool.add(wtr);
  { const f = sub(g, 5.2, 0, -2.2); for (let k = 0; k < 22; k++) CY(f, 0.045, 1.9, stdM('#c8b47a', 0.6), -3.3 + k * 0.32, 0.95, 0, 6); for (const yy of [0.5, 1.4]) CY(f, 0.035, 7.2, stdM('#8a6a3a', 0.7), 0, yy, 0.06, 5, 0, Math.PI / 2); }
  const steamT = txCanvas(64, 64, (x) => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
  const steam = [], steamG = sub(g, 5.2, 0, 1.6); steamG.userData.keep = true; for (let k = 0; k < 14; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false, opacity: 0 })); sp.userData.t = k / 14 * 4; sp.userData.x = (R() - 0.5) * 4; sp.userData.z = (R() - 0.5) * 3; steamG.add(sp); steam.push(sp); }
  for (let k = 0; k < 6; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false, opacity: 0 })); sp.userData.t = k / 6 * 4; sp.userData.x = 0; sp.userData.z = 0; sp.userData.chim = true; sp.position.set(-6.5, 7.6, -5); g.add(sp); steam.push(sp); }
  stoneLantern(g, 1.4, 4.2); stoneLantern(g, 8.6, 4.4); bench(g, 0.5, 5.6, Math.PI);
  bldPlace(g, s); coll(s, -2.5, -2.5, W / 2 + 0.3, D / 2 + 0.3); coll(s, 5.2, -2.2, 3.6, 0.2); coll(s, -6.5, -5.0, 0.5, 0.5);
  const [ex, ez] = toWorld(s, -2.5, -2.5 + D / 2 + 1.4); DV.onsen = { g, steam, door: { x: ex, z: ez } }; return g;
};
// ほしなみ大橋: a suspension bridge reaching out toward the mainland, lit up at night
DEV_BUILD.ohashi = function (s) {
  const g = new THREE.Group(), L = 300, dx = s.dx, dz = s.dz, side = [dz, -dx], yd = 16, Wd = 12; const P = (d, o = 0, y = 0) => new THREE.Vector3(s.x + dx * d + side[0] * o, y, s.z + dz * d + side[1] * o);
  const deckM = stdM('#d8d4cc', 0.5), towerM = stdM('#e8e4dc', 0.45), cableM = stdM('#c83a3a', 0.4, 0.3), glow = evMats().chochinW;
  const yAt = d => d < 50 ? groundH(s.x, s.z) + (yd - groundH(s.x, s.z)) * Math.sin(Math.min(1, d / 50) * Math.PI / 2) : yd;
  for (let d = 0; d < L; d += 10) { const a = P(d, 0, yAt(d)), b = P(d + 10, 0, yAt(d + 10)); const seg = new THREE.Mesh(new THREE.BoxGeometry(Wd, 0.9, a.distanceTo(b) + 0.05), deckM); seg.position.copy(a).add(b).multiplyScalar(0.5); seg.lookAt(b.x, b.y, b.z); seg.castShadow = seg.receiveShadow = true; g.add(seg);
    for (const o of [-Wd / 2 + 0.2, Wd / 2 - 0.2]) { const rl = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.0, a.distanceTo(b)), stdM('#f4f2ec', 0.5)); rl.position.copy(P(d + 5, o, (a.y + b.y) / 2 + 0.9)); rl.lookAt(P(d + 10, o, b.y + 0.9)); g.add(rl); if (d % 20 === 0) { const lp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), glow); lp.position.copy(P(d, o, yAt(d) + 2.2)); g.add(lp); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 5), stdM('#f4f2ec', 0.5)); pole.position.copy(P(d, o, yAt(d) + 1.3)); g.add(pole); } } }
  const towers = [90, 230], TH = 62;
  for (const td of towers) for (const o of [-Wd / 2 - 0.8, Wd / 2 + 0.8]) { const t = new THREE.Mesh(new THREE.BoxGeometry(2.2, TH, 2.2), towerM); t.position.copy(P(td, o, TH / 2 - 4)); t.castShadow = true; g.add(t); for (const yy of [yd - 2, 38, TH - 6]) { const bm = new THREE.Mesh(new THREE.BoxGeometry(Wd + 3.6, 1.6, 1.6), towerM); bm.position.copy(P(td, 0, yy)); bm.lookAt(P(td + 1, 0, yy)); g.add(bm); } const top = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), stdM('#ff3a3a', 0.4, 0, { emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 1.5 })); top.position.copy(P(td, o, TH - 3.6)); g.add(top); }
  for (const o of [-Wd / 2 - 0.8, Wd / 2 + 0.8]) { const pts = []; for (let d = 30; d <= L; d += 5) { let y; if (d < towers[0]) y = yd + 2 + (TH - 6 - yd - 2) * Math.pow((d - 30) / (towers[0] - 30), 1.6); else if (d < towers[1]) { const t = (d - towers[0]) / (towers[1] - towers[0]); y = TH - 6 - (TH - 6 - yd - 3) * Math.sin(t * Math.PI) * 1.0 + 0; y = yd + 3 + (TH - 9 - yd) * (Math.pow(2 * t - 1, 2)); } else y = TH - 6 - (TH - 6 - yd - 2) * Math.min(1, (d - towers[1]) / 70); pts.push(P(d, o, y));
      if (d % 10 === 0 && d > 32) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, y - yd, 4), cableM); h.position.copy(P(d, o, (y + yd) / 2)); g.add(h); } }
    const cv = new THREE.CatmullRomCurve3(pts), tb = new THREE.Mesh(new THREE.TubeGeometry(cv, 120, 0.35, 6, false), cableM); g.add(tb);
    for (let i = 0; i < pts.length; i += 3) { const lp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), glow); lp.position.copy(pts[i]).add(new THREE.Vector3(0, 0.4, 0)); g.add(lp); } }
  for (let d = 50; d < L; d += 40) { if (towers.some(t => Math.abs(t - d) < 15)) continue; const pr = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, yd + 6, 10), towerM); pr.position.copy(P(d, 0, (yd + 6) / 2 - 6)); g.add(pr); }
  const sg = dynSign(6, 1.0, 'ほしなみ大橋', '#2a3a5a', '#ffffff'); sg.userData.keep = false; sg.position.copy(P(towers[0], 0, yd + 6.5)); sg.rotation.y = Math.atan2(-dx, -dz); g.add(sg);
  addCollider({ x: P(towers[0], -Wd / 2 - 0.8).x, z: P(towers[0], -Wd / 2 - 0.8).z, r: 1.4, kind: 'bld' }); addCollider({ x: P(towers[0], Wd / 2 + 0.8).x, z: P(towers[0], Wd / 2 + 0.8).z, r: 1.4, kind: 'bld' });
  return g;
};
// festival yagura is permanent on the plaza once built, so the seasonal one is skipped there
// school chime (Westminster quarters) and Kotaro going to school
STORY.chime = function () { try { const C = SND.ctx; if (!C) return; const notes = [659.3, 523.3, 587.3, 392.0, 392.0, 587.3, 659.3, 523.3], t0 = C.currentTime + 0.05; const P = DV.school && DV.school.s; const d = P ? Math.hypot(PL.x - P.x, PL.z - P.z) : 999; const vol = Math.max(0, 0.22 * (1 - d / 260)); if (vol <= 0.005 || GAME.inside) return;
    notes.forEach((f, i) => { const o = C.createOscillator(), gn = C.createGain(); o.type = 'sine'; o.frequency.value = f; const t = t0 + i * 0.85 + (i >= 4 ? 0.6 : 0); gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + 0.02); gn.gain.exponentialRampToValueAtTime(0.001, t + 2.2); o.connect(gn); gn.connect(SND.bus && SND.bus.sfx ? SND.bus.sfx : C.destination); o.start(t); o.stop(t + 2.3); }); } catch (e) { } };
{ const _u = GAME.update; let lastQ = null; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { const hf = currentHour();
    if (DV.school && DV.school.g.userData.clock) { const [hm, mm] = DV.school.g.userData.clock; hm.rotation.z = -(hf % 12) / 12 * 6.283; mm.rotation.z = -(hf % 1) * 6.283; }
    const q = Math.floor(hf * 4); if (lastQ !== null && q !== lastQ && devDone('school') && [34, 61].includes(q)) STORY.chime(); lastQ = q;
    if (DV.onsen) { for (const sp of DV.onsen.steam) { sp.userData.t += dt || 0.016; const k = (sp.userData.t % 4) / 4; if (sp.userData.chim) { sp.position.y = 7.6 + k * 4; sp.scale.setScalar(1 + k * 3); sp.material.opacity = Math.sin(k * Math.PI) * 0.4; } else { sp.position.set(sp.userData.x + Math.sin(k * 6 + sp.userData.z) * 0.3, 0.4 + k * 2.4, sp.userData.z); sp.scale.setScalar(0.8 + k * 1.8); sp.material.opacity = Math.sin(k * Math.PI) * (SEASON.key === 'winter' ? 0.55 : 0.32); } } }
  } catch (e) { } return r; }; }
{ const _e = LIVE.entry; LIVE.entry = function (n, hf) { const E = _e(n, hf); if (devDone('school') && (n.def.id === 'v_kota') && hf >= 8 && hf < 15 && E.act !== 'sleep') return { place: 'school', act: TIME.weather === 'rain' ? 'umb' : 'play' }; if (devDone('onsen') && hf >= 18 && hf < 19.3 && (n.def.id === 'v_gen' || n.def.id === 'v_sora')) return { place: 'onsen', act: 'look' }; if (devDone('matsuri') && hf >= 18.5 && hf < 20 && E.act === 'chat') return { place: 'matsuri', act: 'chat' }; return E; }; }
{ const _pl = LIVE.place; LIVE.place = function (n, key) { if (key === 'school' && DV.school) { const S = DV.school.s, [x, z] = toWorld(S, (VILLAGER_DEF.findIndex(v => v.id === n.def.id) % 5 - 2) * 2, 5); return spotNear(x, z, 4, 7) || null; } if (key === 'onsen' && DV.onsen) return spotNear(DV.onsen.door.x, DV.onsen.door.z, 3.5, n.def.id.length * 13); if (key === 'matsuri' && GAME.p.dev.matsuri) { const M = GAME.p.dev.matsuri, i = VILLAGER_DEF.findIndex(v => v.id === n.def.id), a = i * 0.9; return spotNear(M.x + Math.cos(a) * 6, M.z + Math.sin(a) * 6, 2, i + 3); } return _pl(n, key); }; }
// bathing at the onsen
GAME.nearOnsen = function () { return DV.onsen && !PL.veh && Math.hypot(PL.x - DV.onsen.door.x, PL.z - DV.onsen.door.z) < 2.2; };
{ const _p = GAME.prompt; GAME.prompt = function () { const r = _p.apply(this, arguments); if (!r && this.p && this.nearOnsen()) return 'Space：温泉に入る ♨'; return r; }; }
{ const _i = GAME.interact; GAME.interact = function () { if (this.p && !PL.veh && this.nearOnsen()) { const p = this.p; p.daily.onsen = p.daily.onsen || 0; this.fade(() => { if (!p.daily.onsen) { p.daily.onsen = 1; this.addVit(3); UI.toast('♨ いいお湯だった〜。体がぽかぽか！（元気度 +3）'); } else UI.toast('♨ いいお湯だった〜（元気度アップは1日1回）'); this.dirty = true; this.renderTracker(); }); return true; } return _i.apply(this, arguments); }; }
