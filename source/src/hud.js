// ===================== 画面表示の整理: 設定は ⚙ にまとめる・左の手帳は小さく・操作説明は慣れたら消える =====================
const HUD2 = { open: false, compact: true };
try { HUD2.open = localStorage.getItem('hoshinami.ctlOpen') === '1'; HUD2.compact = localStorage.getItem('hoshinami.sideFull') !== '1'; } catch (e) { }
HUD2.store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
// ---------- right: time / view / weather / season / sound / quality / data → behind ⚙ ----------
HUD2.setupCtl = function () {
  const card = document.querySelector('#hud .card.ctl'); if (!card || card.querySelector('.ctlBar')) return;
  const bar = document.createElement('div'); bar.className = 'ctlBar';
  bar.innerHTML = `<button class="cg" data-c="set" title="時間・天気・季節・視点・音・画質・データ">⚙ 設定</button>`;
  const more = document.createElement('div'); more.className = 'ctlMore';
  while (card.firstChild) more.appendChild(card.firstChild);
  card.appendChild(bar); card.appendChild(more);
  const ph = more.querySelector('#photoBtn'); if (ph) bar.insertBefore(ph, bar.firstChild);
  const help = document.createElement('div'); help.className = 'row'; help.innerHTML = '<button data-c="help">❔ 操作説明</button>'; more.appendChild(help);
  // rows other modules add later go behind ⚙ as well
  new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.parentNode === card && n !== bar && n !== more) { more.appendChild(n); const p = more.querySelector('#photoBtn'); if (p) bar.insertBefore(p, bar.firstChild); } }).observe(card, { childList: true });
  card.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; e.stopPropagation();
    if (b.dataset.c === 'set') { HUD2.open = !HUD2.open; HUD2.store('hoshinami.ctlOpen', HUD2.open ? '1' : '0'); HUD2.apply(); }
    if (b.dataset.c === 'help') { const h = document.getElementById('help'); if (h) { h.hidden = !h.hidden; h.style.display = ''; } }
    document.getElementById('c').focus(); });
  HUD2.apply();
};
HUD2.apply = function () { const card = document.querySelector('#hud .card.ctl'); if (!card) return; card.classList.toggle('open', HUD2.open); const b = card.querySelector('[data-c="set"]'); if (b) b.textContent = HUD2.open ? '⚙ 設定 ▴' : '⚙ 設定'; };
// ---------- left: the tracker can fold down to money, 元気度 and one summary line ----------
HUD2.side = function () {
  const s = GAME.el && GAME.el.side; if (!s || !GAME.p) return;
  s.classList.toggle('compact', HUD2.compact);
  let t = s.querySelector('.foldBtn'); if (!t) { t = document.createElement('button'); t.className = 'foldBtn'; t.onclick = e => { e.stopPropagation(); HUD2.compact = !HUD2.compact; HUD2.store('hoshinami.sideFull', HUD2.compact ? '0' : '1'); HUD2.side(); document.getElementById('c').focus(); }; s.appendChild(t); }
  t.textContent = HUD2.compact ? '▾ くわしく' : '▴ たたむ'; t.title = HUD2.compact ? 'おねがい・物語・行事をひらく' : '小さくする';
  let sm = s.querySelector('.sum'); if (!sm) { sm = document.createElement('div'); sm.className = 'sum'; const vit = s.querySelector('.vit'); vit && vit.nextSibling ? s.insertBefore(sm, vit.nextSibling) : s.appendChild(sm); }
  if (!HUD2.compact) { sm.hidden = true; return; } sm.hidden = false;
  let done = 0, all = 0; try { const td = GAME.todays(); all = td.length; done = td.filter(m => GAME.p.daily.done[m.id]).length; } catch (e) { }
  const parts = [`📋 おねがい ${done}/${all}`];
  try { if (typeof STORY !== 'undefined' && STORY.st) { const S = STORY.st(), C = CHAPTERS[S.ch]; if (C) { const g = (C.goals || []), gd = g.filter(q => { try { return q.prog() >= q.n; } catch (e) { return false; } }).length; parts.push(`📜 ${C.no || ''} ${C.title || ''} ${g.length ? gd + '/' + g.length : ''}`.trim()); } } } catch (e) { }
  const html = parts.map(esc).join('<br>');
  if (sm._h !== html) { sm.innerHTML = html; sm._h = html; }
};
{ const _rt = GAME.renderTracker; GAME.renderTracker = function () { const r = _rt.apply(this, arguments); try { HUD2.side(); } catch (e) { } return r; }; }
// the tracker sits right under the clock card, whatever height the clock card has (the tide line made it taller)
HUD2.place = function () { const c = document.querySelector('#hud .card.clock'), s = GAME.el && GAME.el.side; if (!c || !s || c.offsetParent === null) return; const b = c.offsetTop + c.offsetHeight + 8; if (Math.abs((parseFloat(s.style.top) || 0) - b) > 1) s.style.top = b + 'px'; };
{ const _c = UI.clock; UI.clock = function () { const r = _c.apply(this, arguments); try { const sig = ['hT', 'hD', 'hTide'].map(id => { const e = document.getElementById(id); return e ? e.textContent : ''; }).join('|') + '|' + innerWidth + 'x' + innerHeight + '|' + (GAME.el && GAME.el.side && GAME.el.side.className); if (sig !== HUD2._clk) { HUD2._clk = sig; HUD2.place(); } } catch (e) { } return r; }; }  // reading offsetTop forces a layout: only when something changed
// ---------- the controls line disappears once you have played a while (⚙ → ❔ brings it back) ----------
HUD2.helpTimer = function () {
  let seen = false; try { seen = localStorage.getItem('hoshinami.helpSeen') === '1'; } catch (e) { }
  const h = document.getElementById('help'); if (!h) return; if (seen) { h.hidden = true; return; }
  clearTimeout(HUD2._ht); HUD2._ht = setTimeout(() => { if (!h.matches(':hover')) h.hidden = true; HUD2.store('hoshinami.helpSeen', '1'); }, 150000);
};
{ const _ui = UI.init; UI.init = function () { const r = _ui.apply(this, arguments); try { HUD2.setupCtl(); } catch (e) { console.warn('hud', e); } return r; }; }
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { HUD2.setupCtl(); HUD2.side(); HUD2.place(); if (!this.p.demo) HUD2.helpTimer(); } catch (e) { } return r; }; }
{ const st = document.createElement('style'); st.textContent = `#hud .card.ctl{padding:8px 10px}#hud .ctlBar{display:flex;gap:6px;justify-content:flex-end}#hud .ctlBar button{border:none;border-radius:12px;padding:6px 12px;font-weight:800;font-size:13px;background:#fff;color:#2f4440;cursor:pointer;box-shadow:0 1px 0 rgba(0,0,0,.06)}#hud .ctlBar button:hover{background:#eef5ee}#hud .ctlMore{display:none;flex-direction:column;gap:6px;margin-top:6px}#hud .card.ctl.open .ctlMore{display:flex}
#hud .gside .foldBtn{display:block;margin:6px 0 0 auto;border:none;background:none;color:#4a6a62;font-size:12px;font-weight:800;cursor:pointer;padding:2px 4px}#hud .gside .sum{font-size:13px;font-weight:800;color:#3a4f4a;margin:6px 0 2px;line-height:1.5}
#hud .gside.compact>*:not(.money):not(.vit):not(.sum):not(.btns):not(.foldBtn){display:none!important}#hud .gside.compact{width:236px}`; document.head.appendChild(st); }
