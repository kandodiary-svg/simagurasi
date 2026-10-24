// ===================== 島の収益: 建物ごとに1時間あたりの売上が入りつづける（留守のあいだも最大24時間分） =====================
const REV = { acc: 0, t: 0, shown: 0, lastPay: 0 };
const revDevDone = id => { const s = GAME.p && GAME.devState()[id]; return !!(s && s.state === 'done'); };
// yen per real hour. hotels earn more when the island has more attractions (occupancy)
const REV_DEV = { waiting: [400, '待合所の売店'], pier: [300, '桟橋の利用料'], bus: [800, 'バスの運賃'], ferry: [1500, '観光船の運賃'], beach: [800, '海の家'], michinoeki: [2500, '道の駅'], camp: [1500, 'キャンプ場'], ryokan: [5000, '旅館', 'stay'], aquarium: [9000, '水族館の入館料'], windfarm: [1500, '売電'],
  matsuri: [600, '祭りの屋台'], onsen: [6000, '温泉の入浴料'], ohashi: [8000, '大橋の通行料'], mansion: [4500, 'マンションの家賃'], resort: [15000, 'リゾートホテル', 'stay'], tower: [12000, 'タワーの家賃'],
  r_beach: [8000, 'ビーチの売上'], r_marina: [12000, 'マリーナの係留料'], r_lagoon: [14000, 'ラグーンヴィラ', 'stay'], r_towers: [30000, 'リゾートタワー街', 'stay'], r_final: [10000, 'リゾートのイベント'] };
const REV_CITY = { hotelL: [60000, 'stay'], hotelG: [75000, 'stay'], villa: [15000, 'stay'], condo: [33000], slim: [23000], midrise: [13000], office: [33000], mall: [75000], cafe: [7500], park: [0], chapel: [20000],
  ferris: [100000, 'fun'], coaster: [140000, 'fun'], carousel: [17000, 'fun'], drop: [50000, 'fun'], waterpark: [110000, 'fun'], obs: [150000, 'fun'], stadium: [250000, 'fun'] };
REV.occupancy = function () { const fun = CITY.list.filter(b => CITY_TYPES[b.t] && CITY_TYPES[b.t].cat === 'fun').length + ['aquarium', 'onsen', 'r_marina', 'r_beach', 'ohashi'].filter(id => revDevDone(id)).length; return Math.min(1, 0.55 + fun * 0.035 + GAME.tourism() / 2500); };
REV.items = function () {
  const out = [], D = GAME.p ? GAME.devState() : {}, occ = REV.occupancy();
  for (const [id, [r, name, kind]] of Object.entries(REV_DEV)) { const s = D[id]; if (!s || s.state !== 'done') continue; const d = DEV.find(q => q.id === id); out.push({ key: 'd_' + id, name, icon: d ? d.icon : '🏗️', n: 1, perHour: Math.round(r * (kind === 'stay' ? occ : 1)), stay: kind === 'stay' }); }
  const cnt = {}; for (const b of CITY.list) cnt[b.t] = (cnt[b.t] || 0) + 1;
  for (const [t, n] of Object.entries(cnt)) { const T = CITY_TYPES[t], R = REV_CITY[t]; if (!T || !R || !R[0]) continue; out.push({ key: 'c_' + t, name: T.name, icon: T.icon, n, perHour: Math.round(R[0] * n * (R[1] === 'stay' ? occ : 1)), stay: R[1] === 'stay' }); }
  const base = GAME.p ? GAME.tourism() * 30 : 0; if (base) out.push({ key: 'tour', name: '観光客の買い物（観光ポイント×30円）', icon: '🧳', n: 1, perHour: base });
  return out.sort((a, b) => b.perHour - a.perHour);
};
REV.perHour = function () { return REV.items().reduce((s, q) => s + q.perHour, 0); };
REV.pay = function (amount, quiet) {
  const p = GAME.p; if (!p || amount <= 0) return; p.money = (p.money || 0) + amount; REV.roll(p);
  p.revStat.total += amount; p.revStat.today += amount; if (typeof SND !== 'undefined' && SND.lastMoney !== null && SND.lastMoney !== undefined) SND.lastMoney += amount; GAME.dirty = true; GAME.renderTracker(); if (!quiet) REV.float(amount);
};
REV.float = function (amount) { const el = GAME.el && GAME.el.side && GAME.el.side.querySelector('.money'); if (!el || GAME.el.side.hidden) return; const r = el.getBoundingClientRect(), f = document.createElement('span'); f.className = 'revfloat'; f.textContent = '+' + yen(amount); f.style.left = (r.left + 40) + 'px'; f.style.top = (r.top - 2) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1800); try { SND.play('coins', { vol: 0.25 }); } catch (e) { } };
// pays a little every few seconds while playing; shows the sum once a minute
REV.update = function (dt) {
  const p = GAME.p; if (!p) return; REV.t += dt; if (REV.t < 5) return; const sec = REV.t; REV.t = 0; const ph = REV.perHour(); if (!ph) { p.revAt = Date.now(); return; }
  REV.acc += ph * sec / 3600; const whole = Math.floor(REV.acc); if (whole <= 0) return; REV.acc -= whole; REV.shown += whole; REV.pay(whole, true); p.revAt = Date.now();
  if (performance.now() - REV.lastPay > 30000) { REV.lastPay = performance.now(); REV.float(REV.shown); REV.shown = 0; }
};
// while you were away (up to 24 hours)
REV.offline = function () {
  const p = GAME.p; if (!p) return; const now = Date.now(), last = p.revAt || now; p.revAt = now; const hrs = Math.min(24, Math.max(0, (now - last) / 3600000)); if (hrs < 0.02) return;
  const ph = REV.perHour(), amt = Math.round(ph * hrs); if (amt <= 0) return; REV.pay(amt, true);
  setTimeout(() => GAME.banner(`💴 留守のあいだの島の収益 ${yen(amt)}`, `${hrs >= 1 ? Math.floor(hrs) + '時間' : ''}${Math.round((hrs % 1) * 60)}分ぶん（1時間あたり ${yen(ph)}）`), 1500);
};
// the old once-a-day income is replaced by the hourly revenue (the letter still reports yesterday's total)
GAME.dailyIncome = function () { return 0; };
REV.roll = function (p) { p.revStat = p.revStat || { total: 0, today: 0, day: todayKey() }; const S = p.revStat; if (S.day === todayKey()) return; if (S.today > 0) p.lastIncome = { amount: S.today, tour: GAME.tourism(), date: todayKey() }; S.yday = S.today; S.today = 0; S.day = todayKey(); };
{ const _nd = GAME.newDay; GAME.newDay = function () { if (this.p) REV.roll(this.p); return _nd.apply(this, arguments); }; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { if (!DEMO.on) REV.offline(); else this.p.revAt = Date.now(); } catch (e) { console.warn('rev', e); } return r; }; }
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); try { REV.update(dt || 0.016); } catch (e) { } return r; }; }
// the HUD shows the hourly revenue under the money
{ const _rt = GAME.renderTracker; GAME.renderTracker = function () { const r = _rt.apply(this, arguments); try { const s = this.el.side, m = s && s.querySelector('.money'); if (m && !s.querySelector('.revrate')) { const ph = REV.perHour(); if (ph) m.insertAdjacentHTML('afterend', `<div class="revrate" title="クリックで収益の内訳">💴 島の収益 +${yen(ph)}/時 <u>内訳</u></div>`); const rr = s.querySelector('.revrate'); if (rr) rr.onclick = e => { e.stopPropagation(); GAME.openRevenue(); }; } } catch (e) { } return r; }; }
GAME.openRevenue = function () {
  const p = this.p; if (!p) return; this.modal = 'revenue'; const it = REV.items(), ph = it.reduce((s, q) => s + q.perHour, 0), occ = REV.occupancy(), st = p.revStat || { total: 0, today: 0 };
  this.el.modal.innerHTML = `<div class="mbox revbox"><div class="mh"><h2>💴 島の収益</h2><span class="isl">1時間あたり ${yen(ph)}（1日 ${yen(ph * 24)}）</span><button class="x" data-x="close" aria-label="とじる">×</button></div>
    <p class="small" style="margin:0 0 8px">建物を建てるほど収益がふえます。遊べる場所（遊園地・水族館・温泉・マリーナなど）がふえると、ホテルの客室稼働率が上がります：<b>稼働率 ${Math.round(occ * 100)}%</b>。留守のあいだも最大24時間分たまります。<br>今日の収益 ${yen(st.today || 0)}　・　きのう ${yen(st.yday || 0)}　・　これまでの合計 ${yen(st.total || 0)}</p>
    <ul class="list revlist">${it.map(q => `<li><span class="ck">${q.icon}</span><div><b>${esc(q.name)}</b>${q.n > 1 ? ` ×${q.n}` : ''}${q.stay ? ' <small>（稼働率反映）</small>' : ''}</div><span class="rv">${yen(q.perHour)}/時</span></li>`).join('') || '<li><div class="sub">まだ収益のある建物がありません。開発（P）や街づくりで建てよう</div></li>'}</ul></div>`;
  this.el.modal.hidden = false; this.el.modal.querySelector('[data-x="close"]').onclick = () => this.closeModal();
};
// the development panel shows the revenue too
{ const _od = GAME.openDev; GAME.openDev = function () { const r = _od.apply(this, arguments); try { const mb = this.el.modal.querySelector('.mbox'), mh = mb && mb.querySelector('.mh'); const isl = mh && mh.querySelector('.isl'); if (isl) isl.innerHTML = isl.innerHTML.replace(/（毎日の島の収入[^）]*）/, ''); if (mh && !mb.querySelector('.revlink')) { const ph = REV.perHour(); mh.insertAdjacentHTML('afterend', `<div class="revlink" style="margin:4px 0;padding:8px 12px;border-radius:12px;background:#fff8e0;display:flex;justify-content:space-between;align-items:center;gap:8px"><span>💴 島の収益 <b>${yen(ph)}/時</b>（1日 ${yen(ph * 24)}）・建てるほどふえます</span><button class="ghost" data-rev="1" style="padding:6px 10px">内訳</button></div>`); mb.querySelector('[data-rev]').onclick = () => { this.closeModal(); this.openRevenue(); }; } } catch (e) { } return r; }; }
{ const st = document.createElement('style'); st.textContent = `#hud .revrate,.gside .revrate{font-size:11.5px;font-weight:700;color:#2f7a3a;cursor:pointer;margin:-2px 0 4px}.gside .revrate u{font-weight:400;opacity:.7;margin-left:4px}.revbox>p,.haulbox>p{padding:0 20px}body .revfloat{position:fixed;z-index:60;font-weight:900;color:#2f9a3a;font-size:14px;pointer-events:none;animation:revup 1.8s ease-out forwards;text-shadow:0 1px 0 #fff}
@keyframes revup{0%{opacity:0;transform:translateY(6px)}15%{opacity:1}100%{opacity:0;transform:translateY(-26px)}}.revlist li{display:flex;align-items:center;gap:8px}.revlist .rv{margin-left:auto;font-weight:800;color:#2f7a3a;white-space:nowrap}`; document.head.appendChild(st); }
// show what each building earns where you buy it
{ const _od2 = GAME.openDev; GAME.openDev = function () { const r = _od2.apply(this, arguments); try { this.el.modal.querySelectorAll('[data-dev]').forEach(b => { const R = REV_DEV[b.dataset.dev], li = b.closest('li'), own = li && li.querySelector('.own'); if (R && own && !own.querySelector('.rvh')) own.insertAdjacentHTML('beforeend', `<span class="rvh">　💴 収益 +${yen(R[0])}/時${R[2] === 'stay' ? '（稼働率で変動）' : ''}</span>`); }); } catch (e) { } return r; }; }
{ const _ep = UI.editPanel; UI.editPanel = function () { const r = _ep.apply(this, arguments); try { if (EDIT.on && EDIT.tool === 'city') document.querySelectorAll('#editp [data-ct]').forEach(b => { const R = REV_CITY[b.dataset.ct], i = b.querySelector('i'); if (R && R[0] && i && !i.querySelector('.rvh')) i.insertAdjacentHTML('beforeend', `<span class="rvh"> ・💴${R[0] >= 10000 ? (R[0] / 10000) + '万' : R[0]}円/時</span>`); }); } catch (e) { } return r; }; }
{ const st = document.createElement('style'); st.textContent = `.rvh{color:#2f7a3a;font-weight:700}`; document.head.appendChild(st); }
