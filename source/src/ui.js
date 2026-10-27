// ===================== HUD =====================
const UI = {
  init() {
    const el = document.createElement('div'); el.id = 'hud';
    el.innerHTML = `<div class="card clock"><div class="t" id="hT">--:--</div><div class="d" id="hD"></div></div>
      <div class="card ctl"><div class="row" id="tBtns"><button data-t="real" class="on">リアル時間</button><button data-t="7">朝</button><button data-t="12">昼</button><button data-t="18">夕方</button><button data-t="21">夜</button></div>
      <div class="row" id="vBtns"><button data-v="third" class="on">うしろから</button><button data-v="top">見おろし</button><button data-v="first">目線</button></div>
      <div class="row" id="wBtns"><button data-w="clear" class="on">晴れ</button><button data-w="cloudy">くもり</button><button data-w="rain">雨</button></div></div>
      <div class="prompt" id="prompt"></div><div class="dlg" id="dlg" hidden><div class="nm" id="dlgN"></div><div class="tx" id="dlgT"></div><div class="nx">▼ Space</div></div><div class="toasts" id="toasts"></div>
      <button class="buildBtn" id="buildBtn">🛠️ しまづくり <kbd>B</kbd></button>
      <div class="card editp" id="editp" hidden></div>
      <div class="card help" id="help"><b>操作</b> WASD 移動・Shift 走る・Space 話す/乗る・V 視点・B しまづくり・F 釣り・I バッグ・P 開発・L 島だより・J 手帳・M 地図<button id="hideHelp" aria-label="操作説明をとじる">×</button></div>`;
    document.body.appendChild(el);
    el.querySelector('#tBtns').onclick = e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('#tBtns button').forEach(x => x.classList.toggle('on', x === b)); TIME.mode = b.dataset.t === 'real' ? 'real' : 'fixed'; if (TIME.mode === 'fixed') TIME.hf = +b.dataset.t; };
    el.querySelector('#wBtns').onclick = e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('#wBtns button').forEach(x => x.classList.toggle('on', x === b)); TIME.weather = b.dataset.w; };
    el.querySelector('#vBtns').onclick = e => { const b = e.target.closest('button'); if (b) setViewMode(b.dataset.v); document.getElementById('c').focus(); };
    el.querySelector('#buildBtn').onclick = () => { toggleEdit(); document.getElementById('c').focus(); };
    el.querySelector('#hideHelp').onclick = () => el.querySelector('#help').hidden = true;
  },
  clock(hf) { const h = Math.floor(hf), m = Math.floor((hf - h) * 60); document.getElementById('hT').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; const d = new Date(); document.getElementById('hD').textContent = `${d.getMonth() + 1}月${d.getDate()}日　${GAME.p ? GAME.p.island : 'ほしなみ'}島`; },
  editPanel() {
    const p = document.getElementById('editp'), b = document.getElementById('buildBtn'); p.hidden = !EDIT.on; document.getElementById('hud').classList.toggle('editing', EDIT.on); if (!EDIT.on && typeof GAME !== 'undefined') GAME.mapDirty = true; b.classList.toggle('on', EDIT.on); b.innerHTML = EDIT.on ? '✓ おわる <kbd>B</kbd>' : '🛠️ しまづくり <kbd>B</kbd>';
    document.getElementById('help').style.display = EDIT.on ? 'none' : '';
    if (!EDIT.on) return; const t = TOOLS.find(x => x.id === EDIT.tool);
    let sub = '';
    if (t.brush) sub = `<label class="sz">大きさ <input type="range" id="brushR" min="2" max="14" step="1" value="${EDIT.r}"> <b>${EDIT.r}m</b></label>`;
    if (t.id === 'road') sub = `<div class="seg"><button data-rw="narrow" class="${EDIT.roadW === 'narrow' ? 'on' : ''}">細い道</button><button data-rw="wide" class="${EDIT.roadW === 'wide' ? 'on' : ''} ${GAME.canUse('road', 'wide') ? '' : 'lk'}">${GAME.canUse('road', 'wide') ? '' : '🔒'}広い道</button></div><button class="act" data-a="finish">完成 <kbd>Enter</kbd></button><button data-a="back">点を1つけす</button><button data-a="cancel">やめる</button>`;
    if (t.id === 'house') sub = GAME.houseSub();
    if (t.id === 'decor') sub = GAME.decorSub();
    if (t.id === 'build') sub = GAME.buildSub();
    if (t.id === 'plant') sub = `<div class="seg">${[['broad0', '広葉樹'], ['broad1', '大きな木'], ['pine0', '松'], ['mikan0', 'みかん'], ['bush0', '低木'], ['sakura0', '桜'], ['momiji0', 'もみじ'], ['palm0', 'ヤシ'], ['bamboo0', '竹']].map(([k, n]) => `<button data-tk="${k}" class="${EDIT.treeKind === k ? 'on' : ''} ${GAME.canUse('tree', k) ? '' : 'lk'}">${GAME.canUse('tree', k) ? '' : '🔒'}${n}</button>`).join('')}</div>`;
    p.innerHTML = `<div class="tools">${TOOLS.map((x, i) => x.hidden && x.id !== EDIT.tool ? '' : `<button data-t="${x.id}" class="${x.id === EDIT.tool ? 'on' : ''} ${GAME.canUse('tool', x.id) ? '' : 'lk'}" title="${x.hint}"><span class="ic">${GAME.canUse('tool', x.id) ? x.icon : '🔒'}</span><span>${x.name}</span><kbd>${x.key || (i < 10 ? (i + 1) % 10 : i === 10 ? 'H' : 'K')}</kbd></button>`).join('')}</div>
      <div class="sub">${sub}<span class="sp"></span><button data-a="undo">↶ ひとつもどす <kbd>Z</kbd></button><button data-a="reset" class="${EDIT.confirmReset ? 'warn' : ''}">${EDIT.confirmReset ? '本当にもどす？' : '島を最初の形に'}</button></div>
      <div class="hint" id="editHint"></div>`;
    p.onclick = e => { const tb = e.target.closest('[data-t]'); if (tb) { setTool(tb.dataset.t); return; } const rw = e.target.closest('[data-rw]'); if (rw) { if (!GAME.canUse('road', rw.dataset.rw)) { UI.toast(`広い道は元気度Lv${ROADW_LV.wide}で作れるようになります`); return; } EDIT.roadW = rw.dataset.rw; updateRoadPreview(EDIT.hover); this.editPanel(); return; }
      const dc = e.target.closest('[data-dc]'); if (dc) { if (dc.dataset.dc === '__rm') { EDIT.decorRemove = !EDIT.decorRemove; } else { EDIT.decorId = dc.dataset.dc; EDIT.decorRemove = false; } this.editPanel(); return; }
      const hs = e.target.closest('[data-hs]'); if (hs) { const [k, v] = hs.dataset.hs.split(':'); if (k === 'style') EDIT.hStyle = v; if (k === 'roof') EDIT.hRoof = +v; if (k === 'wall') EDIT.hWall = +v; this.editPanel(); return; }
      const tk = e.target.closest('[data-tk]'); if (tk) { if (!GAME.canUse('tree', tk.dataset.tk)) { UI.toast(`この木は元気度Lv${TREE_LV[tk.dataset.tk]}で植えられるようになります`); return; } EDIT.treeKind = tk.dataset.tk; this.editPanel(); return; }
      const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a;
      if (k === 'bconfirm') GAME.buildConfirm(); if (k === 'bcancel') { EDIT.buildPick = null; this.editPanel(); }
      if (k === 'hbuild') GAME.houseBuild(); if (k === 'hcancel') { EDIT.housePick = null; this.editPanel(); }
      if (k === 'undo') undoEdit(); if (k === 'finish') finishRoad(); if (k === 'back') { EDIT.nodes.pop(); updateRoadPreview(EDIT.hover); this.editHint(); } if (k === 'cancel') { EDIT.nodes = []; updateRoadPreview(null); this.editHint(); }
      if (k === 'reset') { if (EDIT.confirmReset) { EDIT.confirmReset = 0; resetIsland(); } else { EDIT.confirmReset = 1; setTimeout(() => { EDIT.confirmReset = 0; if (EDIT.on) this.editPanel(); }, 4000); } this.editPanel(); }
      document.getElementById('c').focus(); };
    const br = p.querySelector('#brushR'); if (br) br.oninput = () => { EDIT.r = +br.value; br.nextElementSibling.textContent = EDIT.r + 'm'; };
    this.editHint();
  },
  editHint() { const h = document.getElementById('editHint'); if (!h || !EDIT.on) return; const t = TOOLS.find(x => x.id === EDIT.tool);
    if (t.id === 'house') { h.textContent = EDIT._hh || t.hint; return; }
    if (t.id === 'decor' || t.id === 'build') { h.textContent = EDIT._dh || t.hint; return; }
    if (EDIT.lockMsg && t.id !== 'road' && t.id !== 'house') { h.textContent = EDIT.lockMsg; return; }
    h.textContent = t.id === 'road' ? (EDIT.nodes.length ? `点 ${EDIT.nodes.length}個。続けてクリック、最後の点をもう一度クリックか Enter で完成` : t.hint) + (EDIT.plan && EDIT.plan.err && EDIT.nodes.length ? '　⚠ ' + EDIT.plan.err : '') : t.hint; },
  viewMode(m) { document.querySelectorAll('#vBtns button').forEach(b => b.classList.toggle('on', b.dataset.v === m)); },
  prompt(t) { const e = document.getElementById('prompt'); if (e.textContent !== t) e.textContent = t; },
  choices(list) { const d = document.getElementById('dlg'); let c = d.querySelector('.chs'); if (!c) { c = document.createElement('div'); c.className = 'chs'; d.appendChild(c); } c.innerHTML = list.map((o, i) => `<button data-ch="${i}"><kbd>${i + 1}</kbd>${o.t}</button>`).join(''); c.hidden = false; d.classList.add('ask'); c.onclick = e => { const b = e.target.closest('[data-ch]'); if (b) list[+b.dataset.ch].f(); }; this._choices = list; },
  dialog(name, text) { const d = document.getElementById('dlg'); clearInterval(this._ti); this.typing = false; const cc = d.querySelector('.chs'); if (cc) cc.hidden = true; d.classList.remove('ask'); this._choices = null; if (!name) { d.hidden = true; return; } d.hidden = false; document.getElementById('dlgN').textContent = name; const el = document.getElementById('dlgT'); el.textContent = ''; let i = 0; this.typing = true; this._full = () => { clearInterval(this._ti); el.textContent = text; this.typing = false; }; this._ti = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(this._ti); this.typing = false; } }, 35); },
  toast(t) { const e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.getElementById('toasts').appendChild(e); setTimeout(() => e.remove(), 2600); },
};
