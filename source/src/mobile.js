// ===================== スマホ・タブレット（2）: タッチ操作の画面・軽さ・文字の言いかえ（mobile.js） =====================
// MOB.on（タッチ端末）のときだけ動く。パソコンの見た目・操作・画質はそのまま。
// - 左下: スティック（指を置いた所に出る。大きくたおすと走る）。乗り物ではアクセル・ハンドル
// - 右下: Ⓐボタン（今できること: 話す・入る・乗る…）と、ほかのキー（F・T・N…）のボタン。画面の「Space：…」「F：…」から自動で作る
// - 右上: 🎥 視点 と ☰ メニュー（もちもの・手帳・地図・島だより・開発・しまづくり・写真・設定）
// - 1本指ドラッグ＝カメラを回す、2本指でつまむ＝近づく（mobile0.js）
// - 軽さ: 解像度を少し下げ、影の解像度・ぼかし・光のにじみ（ブルーム）を軽くする。重いときは自動でさらに下げる
MOB.joy = null; MOB.keysDown = {}; MOB.last = null; MOB.lastPrompt = null; MOB.fishT = 0;
// ---------- virtual keys: the same events a keyboard sends, so every part of the game reacts as it does to the keys ----------
MOB.key = function (code, down = true) { const ev = new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code === 'Space' ? ' ' : code === 'Escape' ? 'Escape' : code.replace(/^Key|^Digit/, '').toLowerCase(), bubbles: true, cancelable: true }); (document.getElementById('c') || window).dispatchEvent(ev); if (down) MOB.keysDown[code] = true; else delete MOB.keysDown[code]; };
MOB.tap = function (code) { MOB.key(code, true); setTimeout(() => MOB.key(code, false), 70); };
MOB.hold = (code, on) => { if (on && !MOB.keysDown[code]) MOB.key(code, true); if (!on && MOB.keysDown[code]) MOB.key(code, false); };
// ---------- graphics on a phone: a little lighter (the automatic quality steps down further when it is slow) ----------
if (MOB.on) {
  try { GFX.hq = false; } catch (e) { }
  PERF.basePR = () => Math.min(devicePixelRatio || 1, 1.3);
  PERF.TH = { bad: 34, good: 24 };
  { const _as = PERF.applyScale; PERF.applyScale = function () { const r = _as.apply(this, arguments); const sh = SKY.sun && SKY.sun.shadow; if (sh) { const ms = PERF.level >= 2 ? 512 : 1024; if (sh.mapSize.x !== ms) { sh.mapSize.set(ms, ms); if (sh.map) { sh.map.dispose(); sh.map = null; } } } return r; }; }
}
// a tall screen: keep the side-to-side view wide enough (portrait phones)
MOB.fovFix = function () { if (!MOB.on) { const u = camera.userData; if (u.adjFov !== undefined && u.baseFov && Math.abs(camera.fov - u.adjFov) < 0.001) { camera.fov = u.baseFov; camera.updateProjectionMatrix(); } u.adjFov = undefined; if (CAM.K0 !== undefined) CAM.K = CAM.K0; return; } const a = camera.aspect; const u = camera.userData; if (u.adjFov !== undefined && Math.abs(camera.fov - u.adjFov) < 0.001) { /* still ours */ } else u.baseFov = camera.fov;
  if (CAM.K0 === undefined) CAM.K0 = CAM.K; CAM.K = CAM.K0 * (a < 1 ? 1 + 0.45 * (1 - a) : 1);
  const base = u.baseFov || camera.fov; let f = base; if (a < 1) { const h = Math.min(base, 50) * Math.PI / 180, want = 2 * Math.atan(Math.tan(h / 2) * Math.max(0.78, a * 1.15) / a) * 180 / Math.PI; f = Math.min(80, Math.max(base, want)); }
  if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); } u.adjFov = f; };
{ const _uc = updateCamera; updateCamera = function () { const r = _uc.apply(this, arguments); try { MOB.fovFix(); } catch (e) { } return r; }; }
{ const _ur = GAME.updateRoom; GAME.updateRoom = function () { const r = _ur.apply(this, arguments); try { MOB.fovFix(); MOB.viewShift(); } catch (e) { } return r; }; }
// a tall screen inside a building: the near camera shows the room a little higher (less of the dark outside below the floor, the player sits lower, under the cards)
MOB.viewShift = function () { if (MOB._meetVO) { if (MOB.on && GAME.modal === 'meeting' && innerWidth < innerHeight) return; MOB._meetVO = false; MOB._vs = null; camera.aspect = innerWidth / innerHeight; camera.clearViewOffset(); camera.updateProjectionMatrix(); }
  if (!MOB.on && !MOB._vs) return; let k = 0, kx = 0; try { if (MOB.on && ((GAME.inside && GAME.roomEdit) || (EDIT.on && !GAME.inside)) && camera.aspect > 1) kx = MOB.roomKx || 0; } catch (e) { } try { k = MOB.on && GAME.inside && !GAME.roomEdit && typeof INT !== 'undefined' && INT.mode === 'near' && camera.aspect < 0.85 && !(typeof PHOTO !== 'undefined' && PHOTO.on) ? 0.14 : 0; } catch (e) { }
  const W = innerWidth, H = innerHeight, sig = k || kx ? [W, H, k, kx].join() : ''; if (sig === MOB._vs) return; MOB._vs = sig; if (k || kx) camera.setViewOffset(W, H, -kx, -Math.round(H * k), W, H); else camera.clearViewOffset(); };
// ---------- words: key names in messages become the buttons you have on a phone ----------
MOB.WORDS = [[/（Esc\s?でおりる）/g, '（「✕ もどる」でおりる）'], [/（カタログで買えます）/g, '（☰ の「カタログ」で買えます）'], [/で\s?([FTN])）/g, 'で「$1」ボタン）'], [/Ctrl\+C（⌘\+C）でコピーしてください/g, '長押しして「コピー」をえらんでください'], [/クリックで建てる（/g, '場所をタップ →「✓ ここに建てる」で建てる（'], [/（もう一度 Space で修理）/g, '（「✕ もどる」でおりて、もう一度 Ⓐ で修理）'], [/右上の「📷 写真」/g, '☰ メニューの「📷 写真」'], [/右下の「🧭 ワープ」/g, '☰ メニューの「🧭 ワープ」'], [/(^|[^A-Za-z])T\s?で水揚げ/g, '$1「水揚げ」ボタンで水揚げ'], [/クリックで「([^」]+)」を置く/g, '置く所をタップして「ここに置く」で「$1」を置く'], [/あなたが作った道路をクリックすると消えます/g, 'あなたが作った道路をタップして「この道をけす」で消えます'], [/クリックした所に木を植えます/g, '植えたい所をタップして「ここに植える」で木を植えます'], [/クリックでしまいます/g, 'タップして「これをしまう」でしまいます'], [/(^|[^A-Za-z])L\s?キーで/g, '$1☰ の「島だより」で'], [/(^|[^A-Za-z])X\s?キー/g, '$1☰ の「写真」'], [/、\s?Y\s?キー/g, ''], [/(^|[^A-Za-z])Z：もどす/g, '$1「↶ ひとつもどす」でもどす'], [/(^|[^A-Za-z])([FTN])\s?キーを押すと/g, '$1「$2」ボタンで'], [/(^|[^A-Za-z])([FTN])\s?キー/g, '$1「$2」ボタン'], [/(^|[^A-Za-z])F\s?をはなして/g, '$1ボタンをはなして'], [/(^|[^A-Za-z])S\s?で(バック|ブレーキ)/g, '$1スティックを下にたおして$2'], [/（B\s?で模様がえ、\s?C\s?でカタログ）/g, '（右の「模様がえ」「カタログ」ボタン）'], [/（I\s?でもちもの、\s?J\s?で手帳、\s?M\s?で地図、\s?B\s?でしまづくり）/g, '（もちもの・手帳・地図・しまづくりは右上の ☰ から）'], [/(^|[^A-Za-z])V\s?で/g, '$1🎥で'], [/(^|[^A-Za-z])Z\s?で(も)?/g, '$1「ひとつもどす」で$2'], [/(^|[^A-Za-z])R\s?で/g, '$1↻で'], [/(^|[^A-Za-z])([FTN])\s?で/g, '$1$2ボタンで'], [/A\/D\s?で向き/g, 'スティックの左右で向き'], [/・?Q\/E\s?で横歩き/g, ''], [/（[A-Z]）/g, ''], [/WASD(キー)?/g, 'スティック'], [/Shift(キー)?/g, 'スティックを大きく'], [/F\s?か\s?Space/g, 'Ⓐ'], [/F\/Space/g, 'Ⓐ'], [/Space\s?\/\s?Enter\s?\/\s?ボタン/g, 'ボタン'], [/Space(キー)?/g, 'Ⓐ'], [/Esc(ape)?(キー)?/g, '✕'], [/Q\/E(キー)?/g, '2本指'], [/右ドラッグ/g, '2本指ドラッグ'], [/左ドラッグ/g, 'ドラッグ'], [/ホイール/g, '2本指でつまむ'], [/ダブルクリック/g, 'ダブルタップ'], [/クリック/g, 'タップ'], [/Enter\s?で完成/g, '「完成」ボタンで完成'], [/Enter(キー)?/g, '「完成」'], [/マウス/g, '指']];
MOB.txt = s => { if (!s || typeof s !== 'string') return s; let t = s; const keep = []; try { for (const n of [GAME.p && GAME.p.name, GAME.p && GAME.p.island]) if (n && t.includes(n)) { t = t.split(n).join('\u0001' + keep.length + '\u0002'); keep.push(n); } } catch (e) { }
  for (const [re, w] of MOB.WORDS) t = t.replace(re, w); return keep.length ? t.replace(/\u0001(\d+)\u0002/g, (m, i) => keep[+i]) : t; };
MOB.fixNode = function (root) { if (!MOB.on || !root) return; const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName) || p.id === 'prompt') return NodeFilter.FILTER_REJECT; return (MOB.WRE || (MOB.WRE = new RegExp(MOB.WORDS.map(([re]) => re.source).join('|')))).test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; } });
  const L = []; while (tw.nextNode()) L.push(tw.currentNode); for (const n of L) { const v = MOB.txt(n.nodeValue); if (v !== n.nodeValue) { n.nodeValue = v; MOB.fixN = (MOB.fixN || 0) + 1; } }
  // a key letter in bold of its own (「<b>O</b> で網起こし」「<b>T</b>（「水揚げ」ボタン）」)
  if (root.querySelectorAll) for (const b of [root.nodeName === 'B' ? root : null, ...root.querySelectorAll('b')]) { if (!b || !/^[A-Z]$/.test(b.textContent)) continue; const nx = b.nextSibling, t = nx && nx.nodeType === 3 ? nx.nodeValue : ''; if (b.textContent === 'O' && /^\s*で「網起こし」/.test(t)) { b.textContent = ''; nx.nodeValue = t.replace(/^\s*で「網起こし」/, '「🧺 網起こし」ボタンで網を揚げる'); } else if (/^\s*で/.test(t)) b.textContent = '「' + b.textContent + '」ボタン'; else if (/^\s*（/.test(t)) { b.textContent = ''; const pv = b.previousSibling; if (pv && pv.nodeType === 3) pv.nodeValue = pv.nodeValue.replace(/[\s　]+$/, ''); } } };
MOB.watchText = function () { if (MOB._mo || !MOB.on) return; MOB._mo = new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') MOB.fixNode(m.target.parentNode); else for (const n of m.addedNodes) MOB.fixNode(n.nodeType === 3 ? n.parentNode : n); } });
  MOB._mo.observe(document.body, { childList: true, subtree: true, characterData: true }); MOB.fixNode(document.body); };
// ---------- the controls ----------
MOB.CSS = `
#mCtl{position:fixed;inset:0;pointer-events:none;z-index:15;display:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html.mob #mCtl{display:block} html.mob #mCtl.off{display:none}
#mCtl.setopen #mBtns,#mCtl.setopen #mJoyZone{display:none}
#mCtl button{font-family:inherit;font-weight:800;border:0;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;color:#22323a}
#mJoyZone{position:absolute;left:0;bottom:0;width:48vw;height:52vh;height:52dvh;pointer-events:auto;touch-action:none}
#mCtl.fixedjoy #mJoyZone{width:150px;height:150px;left:calc(env(safe-area-inset-left,0px) + 8px);bottom:calc(env(safe-area-inset-bottom,0px) + 8px)}
#mJoy{position:absolute;width:124px;height:124px;margin:-62px 0 0 -62px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.18),rgba(255,255,255,.32));border:2px solid rgba(255,255,255,.6);box-shadow:0 4px 16px rgba(0,0,0,.18);pointer-events:none;transition:opacity .2s}
#mJoy.idle{opacity:.55;left:calc(env(safe-area-inset-left,0px) + 84px)!important;top:calc(100% - 84px - env(safe-area-inset-bottom,0px))!important}
#mCtl.fixedjoy #mJoy.idle{left:75px!important;top:75px!important}
#mKnob{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 3px 10px rgba(0,0,0,.3);display:grid;place-items:center;font-size:18px}
#mBtns{position:absolute;right:calc(env(safe-area-inset-right,0px) + 14px);bottom:calc(env(safe-area-inset-bottom,0px) + 16px);display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none}
#mBtns>*{pointer-events:auto}
#mA{width:84px;height:84px;border-radius:50%;background:rgba(63,143,90,.94);color:#fff!important;box-shadow:0 5px 16px rgba(0,0,0,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:4px;line-height:1.1}
#mA b{font-size:13px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.3);display:grid;place-items:center}
#mA span{font-size:11.5px;max-width:78px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-break:strict;text-align:center;text-wrap:balance}
#mA.long span{font-size:10px}
#mA.dim{background:rgba(34,50,58,.45)} #mA[hidden]{display:none}
#mPend{position:fixed;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border:3px solid #fff;border-radius:50%;box-sizing:border-box;box-shadow:0 0 0 2px rgba(34,50,58,.6),inset 0 0 0 2px rgba(34,50,58,.35);pointer-events:none;z-index:1;animation:mpend .9s ease-in-out infinite alternate} #mPend[hidden]{display:none} @keyframes mpend{from{transform:scale(.8)}to{transform:scale(1.08)}}
#mAcap{order:-1;width:max-content;max-width:min(56vw,260px);box-sizing:border-box;text-align:right;background:rgba(34,50,58,.82);color:#fff;font-size:12px;font-weight:800;padding:5px 10px;border-radius:12px;pointer-events:none;line-height:1.35} #mAcap[hidden]{display:none}
#mSub{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#mSub button{min-height:44px;border-radius:22px;background:rgba(255,255,255,.94);box-shadow:0 4px 12px rgba(0,0,0,.25);padding:6px 14px 6px 8px;display:flex;align-items:center;gap:6px;font-size:13px;max-width:56vw}
#mSub button b{flex:none;width:28px;height:28px;border-radius:50%;background:#22323a;color:#fff;display:grid;place-items:center;font-size:13px}
#mSub button span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#mSub button.hot{background:#ffe9a8}
#mTop{position:absolute;right:calc(env(safe-area-inset-right,0px) + 12px);top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;gap:8px;pointer-events:auto}
#mTop button{width:44px;height:44px;border-radius:50%;background:rgba(246,248,243,.92);box-shadow:0 3px 10px rgba(0,0,0,.2);font-size:19px;display:grid;place-items:center;position:relative}
#mTop button.dot::after{content:'';position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#e2483d;border:2px solid #fff}
#mEsc{position:absolute;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 10px);pointer-events:auto;min-height:44px;border-radius:22px;background:rgba(34,50,58,.88);color:#fff!important;padding:0 18px;font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,.25)}
#mSheet{position:absolute;inset:0;pointer-events:auto;background:rgba(10,30,40,.35);display:flex;align-items:flex-end;justify-content:center}
#mSheet .in{width:min(560px,100%);box-sizing:border-box;background:#f6f8f3;border-radius:22px 22px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 30px rgba(0,0,0,.25);max-height:86vh;max-height:86dvh;overflow:auto}
#mSheet h3{margin:2px 4px 10px;font-size:15px;display:flex;align-items:center;justify-content:space-between}
#mSheet h3 button{width:40px;height:40px;border-radius:50%;background:#e3ebe0;font-size:18px}
#mSheet .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
#mSheet .grid button{min-height:64px;border-radius:16px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12.5px}
#mSheet .grid button i{font-style:normal;font-size:22px}
#mSheet .grid button.on{background:#22323a;color:#fff!important}
#mSheet .hint{font-size:12px;color:#5d716a;font-weight:700;margin:12px 4px 0;line-height:1.6}
#mRot{position:absolute;right:calc(env(safe-area-inset-right,0px) + 14px);top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;pointer-events:auto}
#mRot button{width:48px;height:48px;border-radius:50%;background:rgba(246,248,243,.92);box-shadow:0 3px 10px rgba(0,0,0,.2);font-size:13px}
/* the page itself does not scroll, zoom or select text while playing */
html.mob,html.mob body{overscroll-behavior:none;-webkit-text-size-adjust:100%}
html.mob body{touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
html.mob #c{touch-action:none}
html.mob input,html.mob textarea{-webkit-user-select:text;user-select:text}
html.mob input[type=text],html.mob input:not([type]),html.mob input[type=number],html.mob input[type=search],html.mob textarea,html.mob select{font-size:16px!important}
/* the HUD on a phone: smaller cards, no keyboard hints */
html.mob #hud .help,html.mob #hud .prompt,html.mob #hud kbd,html.mob #game kbd,html.mob #game .groomp kbd,html.mob #photoBtn,html.mob #hqBtn{display:none!important}
html.mob #hud:not(.editing) .buildBtn{display:none!important}
html.mob #hud.editing .ctl{display:none!important}
html.mob #hud.editing .ctl.open,html.mob #hud.inroom .ctl.open{display:flex!important}
html.mob #hud.editing .ctl.open .ctlBar{display:none!important}
html.mob #hud.editing .buildBtn{top:calc(env(safe-area-inset-top,0px) + 10px);bottom:auto;right:calc(env(safe-area-inset-right,0px) + 116px);padding:10px 14px;font-size:14px;min-height:44px}
html.mob #hud .card{padding:7px 10px;border-radius:13px}
html.mob #hud .clock{min-width:0;top:calc(env(safe-area-inset-top,0px) + 8px);left:calc(env(safe-area-inset-left,0px) + 8px)}
html.mob #hud .clock .t{font-size:19px} html.mob #hud .clock .d{font-size:10px;margin-top:2px}
html.mob #hud .gside,html.mob #hud .gside.compact{top:calc(env(safe-area-inset-top,0px) + 78px);left:calc(env(safe-area-inset-left,0px) + 8px);width:176px;padding:6px 9px}
html.mob #hud .gside .btns,html.mob #hud .gside .foldBtn{display:none!important}
html.mob #hud .gside .money{font-size:12px} html.mob #hud .gside .vit{font-size:10.5px} html.mob #hud .gside .vit b{font-size:12px} html.mob #hud .gside .sum{font-size:10.5px;margin:3px 0 0;line-height:1.4}
html.mob #hud .ctl{top:calc(env(safe-area-inset-top,0px) + 10px);right:calc(env(safe-area-inset-right,0px) + 112px);padding:0;background:none;box-shadow:none}
html.mob #hud .ctl .ctlBar .cg{width:44px;height:44px;border-radius:50%;font-size:0;padding:0;background:rgba(246,248,243,.92);box-shadow:0 3px 10px rgba(0,0,0,.2)}
html.mob #hud .ctl .ctlBar .cg::before{content:'⚙';font-size:19px}
html.mob #hud .ctl .ctlMore{background:#f6f8f3;border-radius:16px;padding:10px;box-shadow:0 6px 18px rgba(0,0,0,.2);max-height:70vh;max-height:calc(100dvh - 76px);overflow:auto;position:fixed;right:calc(env(safe-area-inset-right,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 62px);width:min(330px,calc(100vw - 16px));box-sizing:border-box}
html.mob #hud .ctl .ctlMore button{min-height:40px;min-width:40px}
html.mob #hud .sndp{position:fixed;top:calc(env(safe-area-inset-top,0px) + 62px);right:calc(env(safe-area-inset-right,0px) + 8px);left:auto;width:min(330px,calc(100vw - 16px));min-width:0;box-sizing:border-box;background:#f6f8f3;border-radius:16px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.3);z-index:31;max-height:calc(100vh - 140px);max-height:calc(100dvh - 140px);overflow:auto}
html.mob #hud .sndp button{min-height:40px}
html.mob #hud .minimap{--mmw:92px!important;top:calc(env(safe-area-inset-top,0px) + 62px)!important;right:calc(env(safe-area-inset-right,0px) + 10px)!important;bottom:auto!important}
html.mob #hud .minimap{align-items:flex-end!important}
html.mob #hud .minimap .where{font-size:9.5px;padding:2px 7px;line-height:1.3;max-width:min(150px,42vw)!important;box-sizing:border-box}
html.mob #toasts{position:fixed;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none;z-index:30;top:calc(env(safe-area-inset-top,0px) + 196px);width:min(440px,calc(100vw - 24px))}
html.mob #toasts .toast{background:rgba(34,50,58,.9);color:#fff;font-weight:800;font-size:12.5px;padding:6px 11px;border-radius:12px;text-align:center;white-space:normal;box-shadow:0 3px 10px rgba(0,0,0,.2)}

html.mob #hud .dlg{pointer-events:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);width:calc(100vw - 20px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px));max-width:640px;padding:20px 18px 24px;font-size:15px;line-height:1.6;border-radius:22px;min-height:0}
html.mob #hud .dlg .nm{font-size:14px;left:18px}
html.mob #hud .dlg .nx{font-size:0;bottom:5px} html.mob #hud .dlg .nx::after{content:'▼ タップ';font-size:11px}
html.mob #hud .dlg .chs button{min-height:44px}
@media (min-width:700px){ html.mob #hud .dlg{max-width:min(640px,calc(100vw - 216px))} }
html.mob #game .gbanner{top:max(29%,calc(env(safe-area-inset-top,0px) + 232px));width:max-content;box-sizing:border-box;padding:12px 18px;border-radius:18px;max-width:calc(100vw - 40px)}
html.mob #game .gbanner .t{font-size:20px} html.mob #game .gbanner .s{font-size:12.5px}
html.mob #shopHud,html.mob #buffHud{z-index:14;bottom:auto;top:calc(env(safe-area-inset-top,0px) + 150px);left:calc(env(safe-area-inset-left,0px) + 8px);font-size:11px;gap:4px}
html.mob #shopHud .bf,html.mob #buffHud .bf{padding:3px 8px}
html.mob #hud .editp{width:calc(100vw - 16px);bottom:calc(env(safe-area-inset-bottom,0px) + 8px);max-height:44vh;max-height:44dvh;overflow:auto;padding:8px;gap:6px}
html.mob #hud .editp>*{flex-shrink:0}
html.mob #hud .editp .tools{display:flex;overflow-x:auto;gap:5px;padding-bottom:2px}
html.mob #hud .editp .sub button{white-space:nowrap}
html.mob #hud .editp .sub,html.mob #hud .editp .seg{flex-wrap:wrap}
html.mob #hud .bstops button,html.mob #game .bstops button{min-width:40px;min-height:40px;margin-left:6px}
html.mob #hud .editp.mmini>*:not(.tools):not(.mminiB){display:none!important}
html.mob #hud .editp .tools .mminiB{position:sticky;left:0;z-index:2;flex:none;width:50px;min-height:52px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 2px;border-radius:12px;border:0;background:#22323a;color:#fff;font:inherit;font-weight:800;font-size:11px;line-height:1.2;box-shadow:10px 0 0 rgba(246,248,243,1),16px 0 10px rgba(246,248,243,.9)}
html.mob #hud .editp .tools button{flex:none;width:auto;min-width:62px;min-height:52px;white-space:nowrap;padding-left:6px;padding-right:6px}
html.mob #hud .editp .sub button{min-height:40px}
#mCtl.editing.fixedjoy #mJoyZone{bottom:calc(var(--ep,0px) + 8px);width:120px;height:120px} #mCtl.editing.fixedjoy #mJoy{transform:scale(.8)} #mCtl.editing.fixedjoy #mJoy.idle{left:60px!important;top:60px!important} #mCtl.editing #mBtns{bottom:calc(var(--ep,0px) + 12px)}
html.mob #game .gmodal{padding:calc(env(safe-area-inset-top,0px) + 6px) calc(env(safe-area-inset-right,0px) + 6px) calc(env(safe-area-inset-bottom,0px) + 6px) calc(env(safe-area-inset-left,0px) + 6px)}
html.mob #game .mbox{max-height:calc(100vh - 12px);max-height:calc(100dvh - 12px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));max-width:100%;box-sizing:border-box;border-radius:18px;overflow:auto;-webkit-overflow-scrolling:touch}
html.mob #game .mbox>.mb{min-height:0} html.mob #game .mbox>.haullist,html.mob #game .mbox>.revlist{flex-shrink:1;min-height:110px}
html.mob #game .mapbox canvas{width:min(680px,calc(100vw - 40px),calc(100dvh - 124px))}
html.mob #game .mapbox .mh,html.mob #game .mapbox .legend{max-width:calc(100vw - 40px)}
html.mob #game .gtitle{overflow-y:auto;align-items:flex-start;padding-top:calc(env(safe-area-inset-top,0px) + 12px);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 12px);-webkit-overflow-scrolling:touch}
html.mob #game .tbox{margin:auto 0}
html.mob #game .mh{padding:12px 14px 8px;gap:8px} html.mob #game .mh h2{font-size:18px}
html.mob #game .mh .x{width:42px;height:42px;font-size:20px;flex:none;margin-left:auto}
html.mob #game .mbox>*{flex-shrink:0} html.mob #game .mbox>.mb{flex-shrink:1}
html.mob #hud .ctl .ctlMore,html.mob #game .mbox.welcome{background:linear-gradient(#f6f8f3 30%,rgba(246,248,243,0)) top/100% 28px no-repeat local,linear-gradient(rgba(246,248,243,0),#f6f8f3 70%) bottom/100% 28px no-repeat local,radial-gradient(farthest-side at 50% 0,rgba(0,0,0,.16),rgba(0,0,0,0)) top/100% 12px no-repeat scroll,radial-gradient(farthest-side at 50% 100%,rgba(0,0,0,.16),rgba(0,0,0,0)) bottom/100% 12px no-repeat scroll,#f6f8f3}
html.mob #game .tabs{flex:none;padding:0 12px 8px;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch} html.mob #game .tabs button{flex:none;min-height:36px}
html.mob #game .mb{padding:0 12px 14px;-webkit-overflow-scrolling:touch}
html.mob input[type=range]{min-height:28px}
html.mob #game .mbox button:not(.chip):not(.x){min-height:40px}
html.mob #game .gtitle button{min-height:40px}
html.mob #game .bstops button{min-width:40px;min-height:38px;margin-left:4px}
html.mob #boatPanel button{min-height:40px}
html.mob #shopHud .bf,html.mob #shopHud button{min-height:44px;display:inline-flex;align-items:center}
html.mob #hud .editp input[type=checkbox]{width:24px;height:24px} html.mob #hud .editp label.ck{min-height:40px;display:inline-flex;align-items:center;gap:4px}
html.mob #photoUI button{height:40px} html.mob #hud .sndp input[type=range]{min-height:36px}
html.mob.mmodal #hud .ctl{visibility:hidden}
html.mob.mfish #boatPanel{display:none!important}
#mPulse{position:fixed;left:-99px;top:-99px;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;border:3px solid rgba(255,255,255,.95);box-shadow:0 0 0 2px rgba(34,50,58,.35);background:rgba(34,50,58,.35);color:#fff;font-size:22px;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:60;opacity:0} #mPulse.on{animation:mpulse .5s ease-out} @keyframes mpulse{0%{opacity:.95;transform:scale(.6)}100%{opacity:0;transform:scale(1.15)}}
html.mob #game .marm,html.mob #boatPanel .marm{background:#e8a33a!important;color:#fff!important;box-shadow:0 0 0 3px #e8a33a!important}
html.mob #boatPanel button{min-width:44px}
html.mob #game .glist.wide{grid-template-columns:minmax(0,1fr)} html.mob #game .glist .in{min-width:0} html.mob #game .glist .buy{white-space:normal;max-width:46%;text-align:center;line-height:1.25}
html.mob #sndPanel input[type=range]{min-height:44px} html.mob #game .slist input[type=checkbox]{width:22px;height:22px}
@media (orientation:portrait){ html.mob #hud.editing .buildBtn{top:calc(env(safe-area-inset-top,0px) + 62px);right:calc(env(safe-area-inset-right,0px) + 10px)} html.mob #hud.editing .minimap{display:none!important} }
@media (orientation:portrait){ html.mob #boatPanel:not(.mfull) .bp-t,html.mob #boatPanel:not(.mfull) .bp-hold{display:none} html.mob #boatPanel .bp-h::after{content:' ▾';color:#789} html.mob #boatPanel.mfull .bp-h::after{content:' ▴'} html.mob #boatPanel{padding:6px 8px!important} } html.mob #fishHud .reel{min-height:44px} html.mob #game .tabs button{min-height:40px} html.mob #game [data-col]{min-width:40px;min-height:40px} html.mob #game [data-mt]{min-width:48px;min-height:40px} html.mob input[type=range]{min-height:40px}
html.mob #game .demobox>p,html.mob #game .demobox>.dwarp{padding-left:16px;padding-right:16px}
html.mob #hud .sndp .msndx{position:absolute;top:8px;right:8px;width:40px;height:40px;min-height:0;border-radius:50%;border:0;background:#e3ebe0;color:#22323a;font-size:20px;font-weight:800;padding:0}
#mCtl.viewonly #mJoyZone,#mCtl.viewonly #mBtns,#mCtl.viewonly #mTop{display:none} #mCtl.viewonly #mEsc{left:auto;right:calc(env(safe-area-inset-right,0px) + 12px);transform:none}
html.mob #game .gcard .gq button{min-width:42px;min-height:40px}
html.mob #game .catbox .fcard .chips{gap:10px} html.mob #game .catbox .fcard .chip{width:40px;height:40px;min-height:0}
html.mob #game .mh button,html.mob #game .revlink button{white-space:nowrap;flex:none}
html.mob #game .gcatch{width:min(330px,calc(100vw - 40px));box-sizing:border-box;padding:12px 16px}
html.mob.mtalk #verTag{display:none}
html.mob #boatPanel{top:calc(env(safe-area-inset-top,0px) + 192px)!important;bottom:auto!important;left:50%!important;right:auto!important;transform:translateX(-50%);width:min(300px,calc(100vw - 24px))!important}
html.mob #game .mf{flex-wrap:wrap;padding:10px 12px 14px;row-gap:8px} html.mob #game .mf button{white-space:nowrap;min-height:42px} html.mob #game .mf .tot{white-space:nowrap}
html.mob #game .groomp{bottom:auto!important;top:calc(env(safe-area-inset-top,0px) + 40%);right:calc(env(safe-area-inset-right,0px) + 8px)!important;flex-direction:column;align-items:flex-end}
html.mob #game .groomp button{padding:9px 12px;font-size:12.5px;white-space:nowrap;min-height:40px}
html.mob.msetopen #game .groomp,html.mob.msetopen #game .groome{visibility:hidden}
html.mob.mredit #game .groomp{display:none!important}
html.mob #game .groome .rl button{min-height:40px}
html.mob #game .x{min-width:42px;min-height:42px} html.mob #game .letter .x{width:42px;height:42px}
html.mob #photoUI button{min-height:40px}
html.mob #saveDot{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 6px)}
html.mob .demobtn{display:none!important}
html.mob #verTag{left:50%!important;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 2px)!important;font-size:9px!important;opacity:.55}
html.mob.medit #verTag{display:none}
html.mob #hud .gside .money{white-space:nowrap}
html.mob #game .groomp .vtag,html.mob #game .groomp [data-r="view"]{display:none!important}
html.mob #game .gmodal{z-index:3} html.mob #game .gfade{z-index:5}
html.mob #hud .ctl{z-index:3}
html.mob #game .groome .rb{flex-wrap:wrap} html.mob #game .groome .rb .sp{display:none} html.mob #game .groome .rb button{white-space:nowrap;min-height:42px}
html.mob #game .groome .rl{max-height:84px}
html.mob #photoUI .ptop span{display:none} html.mob #photoUI .ptop{top:calc(env(safe-area-inset-top,0px) + 8px)} html.mob #photoUI .ptop button{min-height:38px}
html.mob #photoUI .shot{display:none}
html.mob #photoUI .pbot{top:calc(env(safe-area-inset-top,0px) + 60px);bottom:auto;left:8px;right:8px;transform:none;max-width:none;flex-wrap:wrap;justify-content:center;border-radius:18px;padding:6px 8px}
html.mob #photoUI .pbot>*{flex:none} html.mob #photoUI .pbot button{min-height:36px} html.mob #photoUI .pz input{width:90px}
html.mob #photoUI .pmsg{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 190px);white-space:normal;max-width:calc(100vw - 32px);text-align:center}
html.mob #game .groome{bottom:calc(env(safe-area-inset-bottom,0px) + 8px);width:calc(100vw - 16px);padding:10px;max-height:calc(100dvh - 190px);overflow:auto}
html.mob.mredit #game .groomp{top:calc(env(safe-area-inset-top,0px) + 190px)}
html.mob #game .groome .rb button{min-height:40px}
html.mob #fishHud{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 150px)} html.mob #fishHud .fc{font-size:10.5px;padding:3px 10px;gap:2px 8px}
html.mob #game .gmeet{width:calc(100vw - 16px);max-height:70vh;max-height:70dvh;overflow:auto;background:linear-gradient(rgba(251,248,238,1) 30%,rgba(251,248,238,0)) top/100% 28px no-repeat local,linear-gradient(rgba(251,248,238,0),rgba(251,248,238,1) 70%) bottom/100% 28px no-repeat local,radial-gradient(farthest-side at 50% 0,rgba(0,0,0,.16),rgba(0,0,0,0)) top/100% 12px no-repeat scroll,radial-gradient(farthest-side at 50% 100%,rgba(0,0,0,.16),rgba(0,0,0,0)) bottom/100% 12px no-repeat scroll,rgba(251,248,238,.98)}
html.mob #game .gmeet button{min-height:40px}
@media (orientation:portrait) and (max-height:740px){ html.mob #fishHud{bottom:calc(env(safe-area-inset-bottom,0px) + 104px)} }
@media (orientation:landscape){
  html.mob #hud .gside,html.mob #hud .gside.compact{top:calc(env(safe-area-inset-top,0px) + 64px);width:168px}
  html.mob #toasts{top:calc(env(safe-area-inset-top,0px) + 12px)}
  html.mob #shopHud,html.mob #buffHud{top:calc(env(safe-area-inset-top,0px) + 132px)}
  html.mob #game .groomp{top:calc(env(safe-area-inset-top,0px) + 62px);right:calc(env(safe-area-inset-right,0px) + 128px)!important}
  html.mob #toasts{width:max(220px,min(400px,calc(100vw - 460px)))}
  html.mob.medit #toasts{top:calc(env(safe-area-inset-top,0px) + 64px);left:calc((100vw + min(320px,44vw) + 8px) / 2);width:min(400px,calc(100vw - min(320px,44vw) - 40px))}
  html.mob #game .groome{left:calc(env(safe-area-inset-left,0px) + 8px);transform:none;width:min(560px,calc(100vw - 240px));max-height:calc(100dvh - 70px)}
  html.mob.mredit #game .groomp{top:calc(env(safe-area-inset-top,0px) + 62px)}
  html.mob #game .gbanner{top:26%;max-width:min(560px,calc(100vw - 400px))}
  html.mob #fishHud{bottom:calc(env(safe-area-inset-bottom,0px) + 8px)}
  #mJoyZone{width:40vw;height:auto;top:calc(env(safe-area-inset-top,0px) + 176px)}
  #mCtl.fixedjoy #mJoyZone{top:auto}
  html.mob #game .gmeet{max-height:calc(100vh - 16px);max-height:calc(100dvh - 16px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))}
  html.mob #hud.editing .editp{left:calc(env(safe-area-inset-left,0px) + 8px)!important;top:calc(env(safe-area-inset-top,0px) + 8px);bottom:auto;width:min(320px,44vw)!important;max-height:calc(100vh - 16px);max-height:calc(100dvh - 16px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));transform:none;overflow:auto}
  html.mob.medit #hud .gside,html.mob.medit #hud .clock,html.mob.medit #buffHud{display:none!important}
  html.mob.mredit #hud .clock,html.mob.mredit #hud .gside,html.mob.mredit #shopHud,html.mob.mredit #hud .minimap{display:none!important}
  html.mob #game .groome{top:calc(env(safe-area-inset-top,0px) + 8px)!important;bottom:calc(env(safe-area-inset-bottom,0px) + 8px)!important;width:min(300px,40vw)!important;max-height:none!important;overflow:auto}
  html.mob #hud .card.ctl.open .ctlMore{display:grid;grid-template-columns:repeat(2,max-content);justify-content:end;align-content:start;column-gap:14px;width:auto;max-width:calc(100vw - 16px)}
  html.mob #game .welcome ul{columns:2;column-gap:22px} html.mob #game .welcome li{break-inside:avoid}
  html.mob #hud .minimap .where{max-width:112px!important;word-break:normal;line-break:strict}
  html.mob #boatPanel{top:auto!important;bottom:calc(env(safe-area-inset-bottom,0px) + 8px)!important;left:calc(40vw + 8px)!important;transform:none;width:min(280px,calc(60vw - 140px))!important}
  html.mob #hud.editing .minimap{display:none!important}
  #mCtl.editing.fixedjoy #mJoyZone{left:auto;right:calc(env(safe-area-inset-right,0px) + 8px);bottom:calc(env(safe-area-inset-bottom,0px) + 8px);top:auto;height:120px;width:120px}
  #mCtl.editing #mBtns{bottom:calc(env(safe-area-inset-bottom,0px) + 136px)}
}
html.mob.mmodal #toasts{top:calc(env(safe-area-inset-top,0px) + 6px);bottom:auto;left:calc(env(safe-area-inset-left,0px) + 10px);transform:none;align-items:flex-start;width:min(420px,calc(100vw - 112px))}
html.mob.mmodal #toasts .toast{font-size:11.5px;padding:5px 10px;text-align:left}
html.mob #boatPanel button.hot{color:#5a4000}
html.mob #game .shelfbox .mf button.primary:not(:disabled){background:#3f8f5a;color:#fff}
html.mob.mtalk #hud .ctl{visibility:hidden}
@media (orientation:portrait){ html.mob #boatPanel .bp-h{min-height:36px;display:flex;align-items:center;cursor:pointer} }
html.mob #hud .editp button{min-width:40px}
html.mob #netBar{left:8px;right:8px;transform:none;margin:0 auto;width:max-content;max-width:calc(100vw - 16px);font-size:12px} html.mob #netBar .nb1,html.mob #netBar .nb2{padding:3px 8px;gap:4px} html.mob #netBar .nt{font-size:11px} html.mob #netBar button{min-height:38px;min-width:38px;padding:0 6px} html.mob #netBar .np{padding:0 2px 0 8px} html.mob #netBar .np button{min-width:34px;min-height:34px;padding:0} html.mob #netBar .nph button{min-height:40px}
html.mob #netAsk{right:auto;left:50%;transform:translateX(-50%);width:min(380px,calc(100vw - 24px));z-index:27} html.mob #netAsk button{min-height:44px}
html.mob #netLog{left:8px;right:8px;transform:none;margin:0 auto;width:max-content;max-width:calc(100vw - 16px);bottom:calc(env(safe-area-inset-bottom,0px) + 200px);align-items:center} html.mob #netLog div{max-width:80vw}
html.mob.mmodal #netBar,html.mob.mmodal #netLog{display:none!important} html.mob #netBar .np button{min-width:40px!important;min-height:40px!important} html.mob #netBar button{min-height:40px!important;min-width:40px!important}
@media (orientation:landscape){ html.mob #netBar{max-width:calc(100vw - 350px);top:calc(env(safe-area-inset-top,0px) + 8px)} }
@media (orientation:landscape){ html.mob #netAsk{width:min(380px,calc(100vw - 360px))} }
@media (orientation:landscape) and (max-width:760px){ html.mob #netBar .nb1,html.mob #netBar .nb2{padding:3px 4px;gap:2px} html.mob #netBar .nt{white-space:normal;max-width:118px;line-height:1.2;text-align:center} html.mob #netBar .np{padding:0 0 0 6px} } html.mob.medit #netBar,html.mob.mredit #netBar{display:none!important}
html.mob #game .gq{flex-wrap:wrap;row-gap:4px}
#mSheet .mmeet{display:block;width:100%;margin:0 0 8px;min-height:48px;border:0;border-radius:14px;background:#2c7a4a;color:#fff;font:inherit;font-weight:800;font-size:15px}
html.mob #lhOv{font-size:12.5px!important;max-width:calc(100vw - 24px);white-space:nowrap}
html.mob.mmodal #netAsk{display:none!important}
@media (orientation:landscape){ html.mob.medit #netAsk,html.mob.mredit #netAsk{left:auto;right:calc(env(safe-area-inset-right,0px) + 8px);transform:none;width:min(320px,48vw)} }
html.mob.msetopen #shopHud,html.mob.msetopen #buffHud{display:none!important}
@media (orientation:portrait) and (max-height:740px){ html.mob.mfight #fishHud .fc{display:none} }
html.mob #hud .editp input[type=text],html.mob #hud .editp input:not([type]){min-height:40px;font-size:16px}
html.mob #game .devbox .isl{word-break:keep-all;overflow-wrap:anywhere}
html.mob #gMeet button:focus{outline:none}
`;
MOB.build = function () { if (document.getElementById('mCtl')) return; const st = document.createElement('style'); st.textContent = MOB.CSS; document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'mCtl';
  el.innerHTML = `<div id="mJoyZone"><div id="mJoy" class="idle"><div id="mKnob"></div></div></div>
    <div id="mBtns"><div id="mAcap" hidden></div><div id="mSub"></div><button id="mA" hidden><b>A</b><span></span></button></div>
    <div id="mTop"><button id="mView" aria-label="視点を切りかえる">🎥</button><button id="mMenu" aria-label="メニュー">☰</button></div>
    <button id="mEsc" hidden>✕ もどる</button><div id="mRot" hidden></div><div id="mPend" hidden></div><div id="mSheet" hidden></div>`;
  document.body.appendChild(el); MOB.el = el; { const ts = document.getElementById('toasts'); if (ts && ts.parentNode !== document.body) document.body.appendChild(ts); }
  // the stick
  const zone = el.querySelector('#mJoyZone'), joy = el.querySelector('#mJoy'), knob = el.querySelector('#mKnob'), R = 52;
  const home = () => { const r = joy.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 84, y: innerHeight - 84 }; };
  const place = (x, y) => { const zr = zone.getBoundingClientRect(); joy.style.left = (x - zr.left) + 'px'; joy.style.top = (y - zr.top) + 'px'; };
  const reset = () => { joy.style.left = joy.style.top = ''; knob.style.transform = ''; knob.textContent = ''; joy.classList.add('idle'); MOB.joy = null; MOB.applyJoy(); };
  let jid = null, c0 = null, jt0 = 0, jmax = 0, jlast = null, js0 = null, jOn = false, jIdle = null;
  // a finger in the stick area and one on the scene that came down at the same moment: a pinch at once when they are close together (< 150 px),
  // or not far apart (< 260 px) with the stick-area finger well away from the stick (toward the middle of the screen); otherwise it starts as
  // walk + turn and becomes a pinch when the two fingers move toward / away from each other (see ambigStart)
  const pinchy = (zx, zy, ox, oy, h) => { const d = Math.hypot(zx - ox, zy - oy); if (d >= 260) return false; if (d < 150) return true; h = h || home(); return Math.hypot(zx - h.x, zy - h.y) > 160; };
  zone.addEventListener('pointerdown', e => { e.preventDefault(); if (jid !== null && performance.now() - jt0 > 300) return; if (jid !== null) { const id = jid; MOB.ptr.set(id, { x: jlast.x, y: jlast.y }); jid = null; reset(); try { zone.setPointerCapture(e.pointerId); } catch (er) { } MOB.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); MOB.cancelPend(); MOB.undoSoon(); MOB.startPinch(); return; }
    // a finger is already on the scene: this one is the second finger of a pinch / two-finger turn, not the stick
    // (only when that finger came down at the same moment: a finger already turning the camera + the stick = walk while looking)
    { const h0 = home(); jIdle = h0; jOn = Math.hypot(e.clientX - h0.x, e.clientY - h0.y) <= 80; }
    if (!jOn && MOB.ptr.size >= 1 && [...MOB.ptr.values()].every(q => performance.now() - (q.t || 0) < 250 && pinchy(e.clientX, e.clientY, q.x, q.y))) { try { zone.setPointerCapture(e.pointerId); } catch (er) { } MOB.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() }); MOB.cancelPend(); MOB.undoSoon(); MOB.startPinch(); return; }
    // (a thumb put on the stick itself (its ring) is the stick, whatever the other finger does)
    MOB.ambig = null; if (MOB.ptr.size === 1) { const [cid, q] = [...MOB.ptr.entries()][0]; if (performance.now() - (q.t || 0) < 250) ambigStart(e.pointerId, e.clientX, e.clientY, cid, q.x, q.y, jOn); }
    jid = e.pointerId; jt0 = performance.now(); jmax = 0; jlast = { x: e.clientX, y: e.clientY }; js0 = jlast; try { zone.setPointerCapture(e.pointerId); } catch (er) { } const zr = zone.getBoundingClientRect(), fixed = el.classList.contains('fixedjoy');
    c0 = fixed ? home() : { x: clamp(e.clientX, zr.left + 64, zr.right - 20), y: clamp(e.clientY, zr.top + 20, zr.bottom - 64) }; place(c0.x, c0.y); joy.classList.remove('idle'); move(e); });
  // the stick finger came first and a scene finger follows at once (both put down for a pinch): the stick finger joins the pinch
  MOB.joyToPinch = (x, y, pid) => { if (jid === null || jOn || performance.now() - jt0 > 250 || jmax > 16) return; if (x !== undefined && !pinchy(js0.x, js0.y, x, y, jIdle)) { ambigStart(jid, jlast.x, jlast.y, pid, x, y, jOn); return; } const id = jid; MOB.ptr.set(id, { x: jlast.x, y: jlast.y }); jid = null; reset(); };
  // (a thumb deep in the lower-left corner: a pinch only when both fingers move straight along the line between them —
  //  the stick pushed sideways while the other thumb turns the camera the other way is walking)
  // two fingers put down together, one in the stick area, that did not look like a pinch (far apart, a thumb low on the left):
  // it is the stick + the camera, unless the two fingers then move toward / away from each other — then it was a pinch after all
  function ambigStart(zid, zx, zy, cid, cx, cy, onStick) { const d0 = Math.hypot(zx - cx, zy - cy), corner = zx < innerWidth * 0.25 && zy > innerHeight * 0.82; MOB.ambig = !onStick && d0 < 520 && cid !== undefined ? { zid, cid, t: performance.now(), z0: { x: zx, y: zy }, c0: { x: cx, y: cy }, d0, corner, yaw: typeof CAM !== 'undefined' ? CAM.yaw : 0, pitch: typeof CAM !== 'undefined' ? CAM.pitch : 0 } : null; }
  MOB.ambigCheck = () => { const A = MOB.ambig; if (!A) return; if (jid !== A.zid || performance.now() - A.t > 500) { MOB.ambig = null; return; } const c = MOB.ptr.get(A.cid); if (!c || MOB.ptr.size !== 1) { MOB.ambig = null; return; }
    const mzx = jlast.x - A.z0.x, mzy = jlast.y - A.z0.y, mcx = c.x - A.c0.x, mcy = c.y - A.c0.y, lz = Math.hypot(mzx, mzy), lc = Math.hypot(mcx, mcy); if (lz < 10 || lc < 10) return;
    const cos = (mzx * mcx + mzy * mcy) / (lz * lc), d = Math.hypot(jlast.x - c.x, jlast.y - c.y); if (!(cos < -0.5 && Math.abs(d - A.d0) > 0.15 * A.d0)) return;
    if (A.corner) { const ux = (A.c0.x - A.z0.x) / A.d0, uy = (A.c0.y - A.z0.y) / A.d0; if (Math.abs(mzx * ux + mzy * uy) < 0.94 * lz || Math.abs(mcx * ux + mcy * uy) < 0.94 * lc) return; }
    MOB.ambig = null; const id = jid; jid = null; reset(); MOB.ptr.set(id, { x: jlast.x, y: jlast.y, t: performance.now() }); MOB.cancelPend(); MOB.startPinch(); if (MOB.pinch) MOB.pinch.d = A.d0;
    try { if (!GAME.inside && !(typeof PHOTO !== 'undefined' && PHOTO.on)) { CAM.yaw = A.yaw; CAM.pitch = A.pitch; } } catch (er) { } };
  const move = e => { if (e.pointerId !== jid) return; jlast = { x: e.clientX, y: e.clientY }; jmax = Math.max(jmax, Math.hypot(e.clientX - js0.x, e.clientY - js0.y)); let dx = e.clientX - c0.x, dy = e.clientY - c0.y; const L = Math.hypot(dx, dy); if (L > R) { dx *= R / L; dy *= R / L; } knob.style.transform = `translate(${dx}px,${dy}px)`; const l = Math.min(1, L / R); MOB.joy = { x: dx / R, z: -dy / R, l: l < 0.12 ? 0 : l }; knob.textContent = MOB.joy.l > 0.92 && !PL.veh ? '🏃' : ''; MOB.applyJoy(); if (MOB.ambig) MOB.ambigCheck(); };
  zone.addEventListener('pointermove', move); const end = e => { if (e.pointerId !== jid) return; jid = null; reset(); }; zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  addEventListener('resize', () => { if (jid === null) setTimeout(reset, 60); }); setTimeout(reset, 50); MOB.resetJoy = () => { jid = null; reset(); };
  // buttons: press = key down, release = key up (holding works: reeling in a fish)
  const A = el.querySelector('#mA'); A.addEventListener('pointerdown', e => { e.preventDefault(); if (A.classList.contains('dim')) { if ((A.dataset.k || 'Space') === 'Space') MOB.lastAPress = performance.now(); return; } MOB.press(e, A.dataset.k || 'Space', A); }); A.addEventListener('contextmenu', e => e.preventDefault());
  el.querySelector('#mView').onclick = () => MOB.tap('KeyV'); el.querySelector('#mMenu').onclick = () => MOB.menu();
  el.querySelector('#mEsc').onclick = () => MOB.tap('Escape');
  el.querySelector('#mSheet').addEventListener('click', e => { if (e.target.id === 'mSheet' && performance.now() - (MOB.menuOpenT || 0) > 450) MOB.menu(false); });
  // the dialog box: a tap goes on
  const dlg = document.getElementById('dlg'); if (dlg) dlg.addEventListener('click', e => { if (e.target.closest('.chs') || UI._choices) return; if (typeof STORY !== 'undefined' && STORY.scene && !UI._choices) { try { advanceTalk(); } catch (er) { MOB.tap('Space'); } return; } if (DIALOG.npc) { MOB.tap('Space'); return; } if (UI.typing && UI._full) { UI._full(); return; } UI.dialog(null); });
  MOB.watchText(); MOB.refresh(true); };
// joystick → the movement keys (vehicles, the photo camera and the room's eye view use the keys; walking uses the stick's exact direction)
MOB.applyJoy = function () { const j = MOB.joy, t = 0.38, live = j && j.l > 0.05 && (!GAME.blocking() || (typeof PHOTO !== 'undefined' && PHOTO.on));
  MOB.hold('KeyW', !!(live && j.z > t)); MOB.hold('KeyS', !!(live && j.z < -t)); MOB.hold('KeyA', !!(live && j.x < -t)); MOB.hold('KeyD', !!(live && j.x > t)); MOB.hold('ShiftLeft', !!(live && j.l > 0.92 && !PL.veh)); };
// ---------- what the buttons say (read from the line the game shows: "Space：家に入る　T：網の魚を水揚げ") ----------
MOB.parse = function (t) { const out = []; if (!t) return out; const re = /(Space|[A-Z])：([^　（(]+)([（(][^）)]*[）)])?/g; let m; while ((m = re.exec(t))) out.push({ k: m[1] === 'Space' ? 'Space' : 'Key' + m[1], key: m[1] === 'Space' ? 'A' : m[1], label: m[2].trim(), full: m[3] ? (m[2].trim() + m[3]) : '' }); return out; };
MOB.canFish = function () { const p = GAME.p; if (!p || !p.items || !p.items.rod || GAME.inside || EDIT.on || LIFE.fish || GAME.modal || (typeof FSH !== 'undefined' && FSH.trawl)) return false; if (PL.veh) return false; // on the boat, the boat panel's 🎣 竿釣り does it
  const fx = Math.sin(PL.rot), fz = Math.cos(PL.rot); for (let d = 2.5; d <= 11; d += 1) { if (GAME.fishEnv(PL.x + fx * d, PL.z + fz * d)) return true; } return false; };
MOB.refresh = function (force) { const el = MOB.el; if (!el) return; const t = MOB.promptNow || '';
  const viewOnly = !!(MOB.on && GAME.modal && !['title', 'photo', 'meeting', 'pray'].includes(GAME.modal) && GAME.el.modal.hidden);
  const off = !MOB.on || GAME.modal === 'title' || (GAME.blocking() && !['photo'].includes(GAME.modal) && !viewOnly);
  document.documentElement.classList.toggle('mredit', !!(GAME.inside && GAME.roomEdit)); document.documentElement.classList.toggle('mmodal', !!(GAME.modal && GAME.el.modal && !GAME.el.modal.hidden)); document.documentElement.classList.toggle('mfish', !!LIFE.fish); document.documentElement.classList.toggle('mfight', !!(LIFE.fish && (LIFE.fish.st === 'fight' || LIFE.fish.st === 'land'))); document.documentElement.classList.toggle('mtalk', !!(DIALOG.npc || !document.getElementById('dlg').hidden)); el.classList.toggle('editing', !!EDIT.on); document.documentElement.classList.toggle('msetopen', !!(typeof HUD2 !== 'undefined' && HUD2.open)); el.classList.toggle('setopen', !!(typeof HUD2 !== 'undefined' && HUD2.open)); el.classList.toggle('off', !!off); if (off) { if (MOB.joy) MOB.resetJoy && MOB.resetJoy(); return; }
  el.classList.toggle('viewonly', viewOnly); if (viewOnly) { const E = el.querySelector('#mEsc'); if (E.hidden) E.hidden = false; if (E.textContent !== '✕ もどる') E.textContent = '✕ もどる'; if (MOB.joy) MOB.resetJoy && MOB.resetJoy(); MOB._sig = null; return; }
  const editing = EDIT.on || (GAME.inside && GAME.roomEdit), photo = typeof PHOTO !== 'undefined' && PHOTO.on, dlgOn = !document.getElementById('dlg').hidden, talk = dlgOn, lost = !!DIALOG.npc && !dlgOn && !(typeof STORY !== 'undefined' && STORY.scene);
  el.classList.toggle('fixedjoy', !!(editing || photo)); { const Z = el.querySelector('#mJoyZone'), h = !!(talk || (GAME.inside && GAME.roomEdit) || LIFE.fish || (PL.veh && PL.veh.kind === 'bus')); if (Z.hidden !== h) Z.hidden = h; if (h && MOB.joy && MOB.resetJoy) MOB.resetJoy(); }
  const escOn = editing || photo || (GAME.camOverride && GAME.camOverride() && !GAME.inside); { const E = el.querySelector('#mEsc'), hid = !escOn || EDIT.on || photo || !!GAME.roomEdit; if (E.hidden !== hid) E.hidden = hid; if (E.textContent !== '✕ もどる') E.textContent = '✕ もどる'; }
  { const T = el.querySelector('#mTop'), h = photo || talk; if (T.hidden !== h) T.hidden = h; }
  // the A button and the others
  const A = el.querySelector('#mA'), S = el.querySelector('#mSub'); let acts = MOB.parse(t), main = null;
  if (talk) { main = null; acts = []; if (!UI._choices && !(GAME.modal && GAME.el.modal && !GAME.el.modal.hidden)) { const d = document.getElementById('dlg').getBoundingClientRect(), ax = innerWidth - 56, ay = innerHeight - 58; if (d.width && !(d.left < ax + 42 && d.right > ax - 42 && d.top < ay + 42 && d.bottom > ay - 42)) main = { k: 'Space', label: 'つぎへ' }; } } else if (lost) { main = { k: 'Space', label: '話のつづき' }; acts = []; }
  else if (LIFE.fish) { const st = LIFE.fish.st; main = st === 'bite' ? { k: 'Space', label: '今だ！ 合わせる' } : st === 'fight' ? { k: 'Space', label: '長押しで巻く' } : st === 'land' ? { k: 'Space', label: '釣り上げ中…' } : { k: 'KeyF', label: 'さおをあげる' }; acts = []; }
  else { let sp = acts.find(a => a.k === 'Space'); if (!sp) { const m2 = /Space\s?で([^　（）()、。]+)/.exec(t); if (m2) sp = { k: 'Space', label: m2[1].trim(), full: '' }; } if (sp) main = { k: 'Space', label: sp.label, full: sp.full }; acts = acts.filter(a => a.k !== 'Space'); if (!acts.some(a => a.k === 'KeyF') && MOB.canFishNow) acts.push({ k: 'KeyF', key: 'F', label: '🎣 釣り' }); if (!main && acts.length) { const i = Math.max(0, acts.findIndex(a => a.k === 'KeyF')); main = acts.splice(i, 1)[0]; } }
  if (photo) { main = { k: 'Space', label: '📷 撮る' }; acts = [{ k: 'KeyR', key: '▲', label: '上へ', hold: 1 }, { k: 'KeyF', key: '▼', label: '下へ', hold: 1 }]; }
  if (editing) { main = null; const rot = EDIT.on && (['decor', 'house', 'build', 'city'].includes(EDIT.tool) || (EDIT.tool === 'move' && typeof HM !== 'undefined' && HM.sel)); acts = rot ? [{ k: 'KeyR', key: '↻', label: '回す' }] : [];
    if (EDIT.on && MOB.ePend && MOB.twoStep()) main = { k: 'MobPlace', label: EDIT.tool === 'unroad' ? 'この道をけす' : EDIT.tool === 'plant' ? 'ここに植える' : EDIT.tool === 'city' ? (typeof CITY !== 'undefined' && CITY.mode === 'remove' ? 'これをこわす' : 'ここに建てる') : EDIT.tool === 'bridge' ? (typeof BRG !== 'undefined' && BRG.mode === 'remove' ? 'この橋をこわす' : typeof BRG !== 'undefined' && BRG.a ? 'ここまでかける' : 'ここからかける') : EDIT.decorRemove ? 'これをしまう' : 'ここに置く' };
    // building a house / a development, moving a house: the panel's "ここに建てる" is also on the big button (the panel may be folded)
    if (EDIT.on && !main && EDIT.tool === 'road' && (EDIT.nodes || []).length >= 2) main = { k: 'MobRoad', label: '道路を完成' };
    if (EDIT.on && !main) { const cb = MOB.okBtn(); if (cb) main = cb.matches('[data-hm]') ? { k: 'MobOk', label: 'ここへ引っこす', full: (cb.textContent || '').replace('🚚', '').trim() } : { k: 'MobOk', label: 'ここに建てる' }; } }
  let bad =!!(main && main.k === 'MobPlace' && /^⚠/.test((EDIT.tool === 'decor' ? EDIT._dh : EDIT.tool === 'city' ? EDIT._ch : EDIT.tool === 'bridge' ? EDIT._bh : '') || ''));
  if (main && main.k === 'MobOk') { const cb = MOB.okBtn(); if (!cb || cb.disabled) bad = true; }
  let plantMsg = ''; if (main && main.k === 'MobPlace' && EDIT.tool === 'plant' && MOB.ePend && MOB.ePend.w) { try { const w = MOB.ePend.w; if (groundH(w.x, w.z) < 0.6 || waterDepthAt(w.x, w.z) > 0 || roadDistAt(w.x, w.z) < 4 || deckY(w.x, w.z) !== null) plantMsg = 'ここには植えられません'; else { const [i, j] = toIdx(w.x, w.z); if (G.prot[j * WORLD.n + i]) plantMsg = 'たてものの近くには植えられません'; } } catch (e) { } if (plantMsg) bad = true; }
  if (main && main.k === 'MobPlace') { try { if ((EDIT.tool === 'decor' && EDIT.decorRemove && !DECO.hover) || (EDIT.tool === 'city' && CITY.mode === 'remove' && !CITY.hl) || (EDIT.tool === 'bridge' && BRG.mode === 'remove' && !BRG.hl) || (EDIT.tool === 'unroad' && !EDIT.uroad) || (EDIT.tool === 'decor' && !EDIT.decorRemove && !EDIT.decorId) || (EDIT.tool === 'city' && CITY.mode !== 'remove' && !CITY.plan)) bad = true; } catch (e) { } }
  if (EDIT.on && EDIT.tool === 'bridge' && typeof BRG !== 'undefined' && BRG.a && BRG.mode !== 'remove') acts.push({ k: 'MobBrgX', key: '✕', label: 'やめる' });
  const now = performance.now(), aSig = main ? main.k + '|' + main.label : ''; if (aSig !== MOB.aSig) { MOB.aPrevSig = MOB.aSig || ''; MOB.aSig = aSig; MOB.aChangeT = now; } if (talk) MOB.talkEnd = now;
  const fresh = !!(main && !/^Mob/.test(main.k) && !LIFE.fish && !photo && ((!talk && now - (MOB.talkEnd || 0) < 800) || now < (MOB.aBlockUntil || 0) || (main.k === 'Space' && MOB.needGap && now < MOB.gapEnd(main.label) && now - (MOB.lastAPress || 0) < 700)));
  const rest = (now / 1000 - (MOB.fishEnd || -9) < 1.5 && main && main.k === 'Space') || bad || fresh || !!(LIFE.fish && LIFE.fish.st === 'land');
  let capT = main && main.full ? main.full : ''; if (bad) capT = (EDIT.tool === 'decor' ? EDIT._dh : EDIT.tool === 'city' ? EDIT._ch : EDIT.tool === 'bridge' ? EDIT._bh : '') || (EDIT.tool === 'decor' && !EDIT.decorId ? '置きたいかざりを下のパネルでえらんでね' : main.k === 'MobOk' ? 'お金が足りません' : plantMsg); if (!main && !acts.length && t && !/：/.test(t) && PL.veh) capT = t;
  { const bp = document.getElementById('boatPanel'); if (bp && !bp.hidden && innerWidth > innerHeight) capT = ''; }
  const sig = JSON.stringify([main, acts, rest, capT]); if (!force && sig === MOB._sig) return; MOB._sig = sig; A.classList.toggle('dim', !!rest);
  const cap = el.querySelector('#mAcap'); cap.hidden = !capT; if (capT) cap.textContent = capT;
  A.hidden = !main; if (main) { A.classList.toggle('long', main.label.length > 6); A.dataset.k = main.k; A.querySelector('span').textContent = main.label; A.querySelector('b').textContent = main.k === 'Space' ? 'A' : /^Mob/.test(main.k) ? '✓' : main.k.replace('Key', ''); }
  S.innerHTML = acts.map(a => `<button data-k="${a.k}"><b>${a.key}</b><span>${esc(a.label)}</span></button>`).join('');
  for (const b of S.querySelectorAll('button')) { b.addEventListener('pointerdown', e => { e.preventDefault(); MOB.press(e, b.dataset.k, b); }); b.addEventListener('contextmenu', e => e.preventDefault()); } };
// a press on an on-screen button: the key goes down now (holding works) and comes up when that finger lifts, wherever it is then —
// the button may have been rebuilt or hidden meanwhile (a window opened, the label changed). The click that the lift makes is eaten,
// so it does not land on the window that the press just opened (closing it again).
MOB.held = new Map(); MOB.eatUntil = 0;
// (Ⓐ whose action changed just under the finger — a shooting star went, a bus came — does not do the new thing with that tap)
MOB.press = function (e, code, btn) { if (!code) return; if (btn && btn.id === 'mA' && MOB.aPrevSig && !LIFE.fish && !MOB.wasFish && MOB.ts(e) - (MOB.aChangeT || 0) < 350) return; const n0 = MOB.ts(e), prevA = MOB.lastAPress || 0; if (code === 'Space') MOB.lastAPress = n0; if (code === 'Space' && UI._choices) return; if (GAME.el && GAME.el.fade && !GAME.el.fade.hidden) return; if (n0 < (MOB.fadeUntil || 0)) return; if (code === 'Space') { if (n0 < (MOB.aBlockUntil || 0)) return; if (MOB.needGap) { if (n0 > MOB.gapEnd() || n0 - prevA >= 700) MOB.needGap = false; else return; } } if (MOB.ACT[code]) { MOB.held.set(e.pointerId, { code: null, btn }); MOB.eatUntil = performance.now() + 10000; MOB.ACT[code](); return; }
  MOB.key(code, true); MOB.held.set(e.pointerId, { code, btn }); MOB.eatUntil = performance.now() + 10000; MOB.eatPos = null; if (btn) btn.classList.add('down'); };
MOB.ACT = {};
// right after going in/out or on/off, Ⓐ waits until the Ⓐ taps pause (0.7 s) — at most 1.6 s, or 3 s when Ⓐ would take you straight out / off again
MOB.gapEnd = function (label) { const l = label !== undefined ? label : ((MOB.aSig || '').split('|')[1] || ''); return (MOB.needGapT0 || 0) + (/外に出る|おりる|降りる|出る$/.test(l) ? 3000 : 1600); };
{ const lift = e => { const h = MOB.held.get(e.pointerId); if (!h) return; MOB.held.delete(e.pointerId); if (h.code) MOB.key(h.code, false); if (h.btn) h.btn.classList.remove('down'); MOB.eatUntil = performance.now() + 450; MOB.eatPos = { x: e.clientX, y: e.clientY }; };
  addEventListener('pointerup', lift, true); addEventListener('pointercancel', lift, true);
  addEventListener('click', e => { if (!MOB.on || performance.now() > MOB.eatUntil) return; const P = MOB.eatPos; if (MOB.held.size && !P) return; if (P && Math.abs(e.clientX - P.x) + Math.abs(e.clientY - P.y) > 60) return; MOB.eatUntil = 0; MOB.eatPos = null; if (e.target.closest && e.target.closest('#mBtns')) return; e.stopImmediatePropagation(); e.preventDefault(); }, true); }
// a talk line is said with the phone's words from its first letter (not 「Spa…」 turning into 「Ⓐ」 while it is typed)
{ const _d = UI.dialog; UI.dialog = function (name, text) { if (MOB.on && typeof text === 'string') { try { text = MOB.txt(text); } catch (e) { } } return _d.apply(this, [name, text].concat([].slice.call(arguments, 2))); }; }
{ const _p = UI.prompt; UI.prompt = function (t) { const r = _p.apply(this, arguments); if (MOB.on) { MOB.promptNow = t; MOB.refresh(); } return r; }; }
// ---------- the menu (the keys that are letters on a keyboard) ----------
MOB.ITEMS = () => { const inHome = GAME.inside && !GAME.place && !GAME.visit, out = !GAME.inside && !EDIT.on;
  let unread = false, meet = false; try { unread = !!GAME.unreadLetter(); meet = !!(PLACED.hall && GAME.meetToday()); } catch (e) { }
  const L = [['🎒', 'もちもの', 'KeyI'], ['📖', '手帳', 'KeyJ'], ['🗺️', '地図', 'KeyM'], ['📮', unread ? '島だより（新着）' : '島だより', 'KeyL']]; if (meet && out) L.push(['🏛️', '今日は島の会議！', 'meet']);
  if (out) L.push(['🏗️', '島の開発', 'KeyP'], ['🛠️', 'しまづくり', 'KeyB'], ['📷', '写真', 'KeyX']);
  if (inHome) L.push(['🛋️', '模様がえ', 'KeyB'], ['📚', 'カタログ', 'KeyC']);
  if (typeof DEMO !== 'undefined' && DEMO.on && out && !EDIT.on) L.push(['🧭', 'ワープ', 'warp']);
  L.push(['🎥', '視点', 'KeyV'], ['⚙️', '設定', 'set'], ['❓', '操作のしかた', 'help']); return L; };
MOB.menu = function (open = true) { const sh = MOB.el.querySelector('#mSheet'); if (!open) { sh.hidden = true; sh.innerHTML = ''; return; } try { const bn = GAME.el.banner; if (bn && !bn.hidden) bn.hidden = true; } catch (e) { } MOB.menuOpenT = performance.now();
  sh.innerHTML = `<div class="in"><h3>メニュー<button data-m="x" aria-label="とじる">×</button></h3>${MOB.ITEMS().filter(q => q[2] === 'meet').map(([i, n, k]) => `<button class="mmeet" data-m="${k}">${i} ${n}</button>`).join('')}<div class="grid">${MOB.ITEMS().filter(q => q[2] !== 'meet').map(([i, n, k]) => `<button data-m="${k}"><i>${i}</i>${n}</button>`).join('')}</div>
    <div class="hint">左下のスティックで歩く（大きくたおすと走る）・右下のボタンで話す／入る／乗る・ドラッグでカメラを回す・2本指でつまむと近づく</div></div>`; sh.hidden = false;
  sh.querySelector('.in').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; const k = b.dataset.m; MOB.menu(false); if (k === 'x') return; MOB.menuT = performance.now(); MOB.tapGuard = { t: MOB.menuT, el: 'menu:' + k, x: e.clientX, y: e.clientY };
    if (k === 'set') { const cg = document.querySelector('#hud .ctl .cg'); if (cg) cg.click(); return; } if (k === 'help') return MOB.help(); if (k === 'warp') { try { GAME.openDemoWarp(false); } catch (e) { } return; } if (k === 'meet') { try { GAME.openMap(PLACED.hall && PLACED.hall.entry); } catch (e) { } return; }
    const direct = { KeyI: 'openBag', KeyJ: 'openJournal', KeyM: 'openMap', KeyL: 'openLetter', KeyP: 'openDev' }[k]; if (direct && typeof GAME[direct] === 'function' && !GAME.modal) { try { GAME[direct](); } catch (e) { MOB.tap(k); } return; } MOB.tap(k); }; };
MOB.help = function () { const g = GAME; if (g.modal) return; g.modal = 'mhelp'; g.el.modal.innerHTML = `<div class="mbox welcome"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h2>📱 スマホでの操作</h2><button class="x" data-x="ok" aria-label="とじる" style="width:42px;height:42px;border-radius:50%;border:0;background:#e3ebe0;font-size:20px;flex:none">×</button></div><ul>
  <li><b>歩く</b>　画面の左下に指を置いて、たおしたほうへ歩きます。大きくたおすと走ります</li><li><b>カメラ</b>　画面をドラッグで回す・2本指でつまむと近づく／はなれる・🎥で視点を切りかえ</li>
  <li><b>Ⓐ</b>　右下の緑のボタン：話す・入る・乗る・買う…（そのとき できることが書いてあります）</li><li><b>ほかのボタン</b>　F（釣り・ひろう）、T（水揚げ）など、できるときだけ出ます</li>
  <li><b>☰</b>　もちもの・手帳・地図・島だより・開発・しまづくり・写真・設定</li><li><b>乗り物</b>　スティックの上でアクセル、下でブレーキ、左右でハンドル。Ⓐでおりる</li>
  <li><b>しまづくり</b>　1本指で道具を使う・2本指で回す／つまむ。おわるときは右上の「✓ おわる」</li><li><b>模様がえ</b>　家具をえらんで、置きたい所をタップ →「✓ ここに置く」</li></ul>
  <p class="small">横向きにすると、景色が広く見えます。音が出ないときは、消音（マナーモード）を解除して、⚙ の「🔊 音」で音量を確かめてね。</p><button class="primary" data-x="ok">わかった</button></div>`; g.el.modal.hidden = false; g.el.modal.querySelectorAll('[data-x="ok"]').forEach(b => b.onclick = () => g.closeModal()); };
// the welcome window explains the touch controls instead of the keys
{ const _sw = GAME.showWelcome; GAME.showWelcome = function () { const r = _sw.apply(this, arguments); if (MOB.on) { try { const wb = this.el.modal.querySelector('.welcome'); if (wb && !wb.querySelector('.mwx')) { const x = document.createElement('button'); x.className = 'mwx'; x.textContent = '×'; x.setAttribute('aria-label', 'とじる'); x.style.cssText = 'position:sticky;top:0;align-self:flex-end;margin:-8px -8px -34px 0;width:42px;height:42px;border-radius:50%;border:0;background:#e3ebe0;font-size:20px;z-index:2;flex:none'; x.onclick = () => this.closeModal(); wb.insertBefore(x, wb.firstChild); } } catch (e) { } try { const ul = this.el.modal.querySelector('.welcome ul'); if (ul) ul.innerHTML = `<li><b>歩く</b>　左下に指を置いてたおす（大きくたおすと走る）</li><li><b>Ⓐ</b>　右下のボタン：住民と話す・家や店に入る・乗り物に乗る</li><li><b>カメラ</b>　画面をドラッグで回す・2本指でつまむと近づく</li><li><b>☰</b>　右上：もちもの・手帳・地図・島だより・開発・しまづくり・写真</li><li><b>左上</b>　今日のおねがい（毎日3つ）と島の元気度</li><li><b>家</b>　ここがあなたの家。駐車場の軽トラに乗れます。毎朝、ポストに島だよりが届きます</li><li><b>釣り</b>　水のほうを向くと「🎣 釣り」ボタン（釣りざおはゲンじいから）。釣った魚やみかんは港の出荷所で売れます</li><li><b>集会所</b>　週に1回、島の会議をひらいて島のことを決めます</li><li><b>開発</b>　☰ →「島の開発」：お金で観光船・バス・道の駅・旅館・埋め立てなど大きな工事</li><li><b>しまづくり</b>　☰ →「しまづくり」：地形・道路・木。家では「模様がえ」とカタログで家具</li>`; } catch (e) { } } return r; }; }
// a story scene or a resident's story does not start under the ☰ menu or the settings (it waits until they are closed)
{ const _r = STORY.ready; STORY.ready = function () { if (MOB.on) { const sp = document.getElementById('sndPanel'); if ((MOB.el && !MOB.el.querySelector('#mSheet').hidden) || (typeof HUD2 !== 'undefined' && HUD2.open) || (sp && !sp.hidden) || (PL.veh && (PL.veh.kind === 'bus' || PL.veh.kind === 'ferry'))) return false; } return _r.apply(this, arguments); }; }
// a story scene that starts anyway (a letter that was just read) closes the ☰ menu / the settings first
{ const _pl = STORY.play; STORY.play = function () { if (MOB.on) { try { if (MOB.el && !MOB.el.querySelector('#mSheet').hidden) MOB.menu(false); if (typeof HUD2 !== 'undefined' && HUD2.open) { HUD2.open = false; HUD2.apply(); } const sp = document.getElementById('sndPanel'); if (sp) sp.hidden = true; } catch (e) { } } return _pl.apply(this, arguments); }; }
// a window that has just opened is not closed by a tap on the dark area around it (a tap that was meant for what was there before)
MOB.winOpenT = 0;
MOB.watchWin = function () { if (MOB._wmo || !GAME.el || !GAME.el.modal) return; const M = GAME.el.modal; MOB._wmo = new MutationObserver(() => { const m = !M.hidden && GAME.modal; if (m && m !== MOB._lastM) MOB.winOpenT = performance.now(); MOB._lastM = m || null; }); MOB._wmo.observe(M, { attributes: true, attributeFilter: ['hidden'], childList: true }); };
addEventListener('click', e => { if (!MOB.on || !GAME.el || e.target !== GAME.el.modal) return; const M = GAME.el.modal; if (performance.now() - MOB.winOpenT < 700 || MOB.downSig !== MOB.winSig() || M.querySelector('[data-eat]')) { e.stopPropagation(); e.preventDefault(); return; } const x = M.querySelector('.mbox .x, .mbox [data-x="close"]'); if (x) { e.stopPropagation(); e.preventDefault(); x.click(); } }, true);
addEventListener('pointerdown', e => { if (MOB.on && GAME.el && GAME.el.fade && !GAME.el.fade.hidden) MOB.lastAPress = MOB.ts(e); }, true);
{ const _ra = NET.renderAsks; NET.renderAsks = function () { const el0 = document.getElementById('netAsk'), h0 = el0 ? el0.innerHTML : ''; const r = _ra.apply(this, arguments); const el = document.getElementById('netAsk'); if (el && el.innerHTML !== h0) MOB.askT = performance.now(); return r; }; }
addEventListener('click', e => { if (!MOB.on || !e.target.closest || !e.target.closest('#netAsk')) return; if (performance.now() - (MOB.askT || 0) < 700) { e.stopPropagation(); e.preventDefault(); } }, true);
// the shop's guide booklet: the phone's way to change the view
{ const _g = SHOP.BOOK && SHOP.BOOK.guide; if (_g) SHOP.BOOK.guide = function () { const r = _g.apply(this, arguments); return MOB.on && Array.isArray(r) ? r.map(t => String(t).replace('<b>V</b> で', '🎥 で').replace('<b>Q・E</b>（目線では A・D）で向きを変えられます', '2本指で横にずらすと向きを変えられます')) : r; }; }
// ---------- each frame ----------
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); if (MOB.on && MOB.el) { try { if (!MOB._wmo) MOB.watchWin(); MOB.fishT -= dt || 0.016; if (MOB.fishT < 0) { MOB.fishT = 0.3; const f = MOB.canFish(); if (f !== MOB.canFishNow) { MOB.canFishNow = f; } }
    if (MOB.joy) MOB.applyJoy(); if (GAME.blocking() && MOB.joy && !(typeof PHOTO !== 'undefined' && PHOTO.on)) MOB.resetJoy();
    // a finger lifted from the screen: keep pointing where it was (the room-edit ghost, the road preview)
    if ((EDIT.on || (GAME.inside && GAME.roomEdit)) && !EDIT.mouse && MOB.last) EDIT.mouse = { x: MOB.last.x, y: MOB.last.y };
    if (MOB.wasFish && !LIFE.fish) MOB.fishEnd = performance.now() / 1000; MOB.wasFish = !!LIFE.fish;
    { const st = (GAME.inside ? 'i' : 'o') + (PL.veh ? 'v' : 'f'); if (MOB.stSig && st !== MOB.stSig) { MOB.aBlockUntil = performance.now() + (st[1] !== MOB.stSig[1] ? 1000 : 700); MOB.needGap = true; MOB.needGapT0 = performance.now(); } MOB.stSig = st; }
    MOB.layT = (MOB.layT || 0) - (dt || 0.016); if (MOB.layT <= 0) { MOB.layT = 0.25; MOB.layout(); }
    if (MOB.ePend && (!EDIT.on || EDIT.tool !== MOB.ePend.tool || !MOB.twoStep())) MOB.ePend = null; if (MOB.ePend) { MOB.pendScreen(); EDIT.mouse = { x: MOB.ePend.x, y: MOB.ePend.y }; } { const pe = MOB.el.querySelector('#mPend'); if (MOB.ePend) { if (pe.hidden) pe.hidden = false; const l = Math.round(MOB.ePend.x) + 'px', t = Math.round(MOB.ePend.y) + 'px'; if (pe.style.left !== l) pe.style.left = l; if (pe.style.top !== t) pe.style.top = t; } else if (!pe.hidden) pe.hidden = true; }
    document.documentElement.classList.toggle('medit', !!EDIT.on);
    MOB.viewShift(); MOB.refresh(); } catch (e) { console.warn('mob', e); } } return r; }; }
MOB.layout = function () { const el = MOB.el; if (!el) return;
  try { const gs = GAME.el.side; let top = gs && gs.offsetParent !== null ? gs.getBoundingClientRect().bottom + 6 : 0; for (const id of ['shopHud', 'buffHud']) { const h = document.getElementById(id); if (!h) continue; if (!top || h.hidden) { if (h.style.top) h.style.top = ''; continue; } const v = Math.round(top) + 'px'; if (h.style.top !== v) h.style.top = v; top = h.getBoundingClientRect().bottom + 4; } } catch (e) { }
  try { const dot = !!((GAME.unreadLetter && GAME.unreadLetter()) || (GAME.meetToday && PLACED.hall && GAME.meetToday())); el.querySelector('#mMenu').classList.toggle('dot', dot); } catch (e) { } try { const g = GAME.inside && GAME.roomEdit ? GAME.el.roome : EDIT.on && !GAME.inside ? document.getElementById('editp') : null; MOB.roomKx = g && !g.hidden && innerWidth > innerHeight ? Math.round((g.getBoundingClientRect().right + 8) / 2) : 0; } catch (e) { }
  if (EDIT.on) { const ep = document.querySelector('#hud .editp'); const h = ep && ep.offsetParent !== null ? Math.round(ep.getBoundingClientRect().height + (innerHeight - ep.getBoundingClientRect().bottom)) : 0; el.style.setProperty('--ep', h + 'px'); }
  try { const nb = document.getElementById('netBar'), on = !!(nb && nb.offsetHeight && getComputedStyle(nb).display !== 'none'), ask = document.getElementById('netAsk');
    const port = innerHeight > innerWidth, bot = s => { const e = typeof s === 'string' ? document.querySelector(s) : s; if (!e) return 0; const r = e.getBoundingClientRect(); return r.height ? r.bottom : 0; }; // (fixed-position parts have no offsetParent: the box size tells if it shows)
    const under = () => { const t = Math.max(bot('#mTop'), bot('#hud .ctl .cg'), bot('#buildBtn')); return port ? Math.max(t, bot(GAME.el.side), bot('#shopHud'), bot('#buffHud'), bot('#hud .minimap')) : t; };
    const askOn = !!(ask && ask.offsetHeight && getComputedStyle(ask).display !== 'none');
    if (on) { const t = port ? under() : 2;
      const v = Math.round(t + 6) + 'px'; if (nb.style.top !== v) nb.style.top = v; const nbB = nb.getBoundingClientRect().bottom; if (ask) { const v2 = Math.round(nbB + 6) + 'px'; if (ask.style.top !== v2) ask.style.top = v2; } MOB.netBottom = Math.max(nbB, ask ? bot(ask) : 0); }
    // the bar is hidden (while editing) but a request came: the card goes under the top buttons (never over ✓ おわる / ☰)
    else if (askOn) { if (nb && nb.style.top) nb.style.top = ''; const v2 = Math.round(under() + 6) + 'px'; if (ask.style.top !== v2) ask.style.top = v2; MOB.netBottom = bot(ask); }
    else if (MOB.netBottom) { MOB.netBottom = 0; if (nb) nb.style.top = ''; if (ask) ask.style.top = ''; } } catch (e) { }
  const ts = document.getElementById('toasts'), bp = document.getElementById('boatPanel'); if (ts) { let top = ''; if (MOB.netBottom && !document.documentElement.classList.contains('mmodal')) top = Math.round(MOB.netBottom + 6) + 'px'; if (bp && !bp.hidden && innerHeight > innerWidth) { const r = bp.getBoundingClientRect(); if (r.height) top = Math.round(r.bottom + 8) + 'px'; } if (ts.style.top !== top) ts.style.top = top; } };
// the island editor: tools that put or take away something on one tap (decorations, trees, removing a road) first show the spot; "✓" does it
MOB.twoStep = () => EDIT.on && ['decor', 'plant', 'unroad', 'city', 'bridge'].includes(EDIT.tool);
MOB.ACT.MobRoad = function () { MOB.placeT = performance.now(); MOB.placeXY = { x: MOB.downX, y: MOB.downY }; try { finishRoad(); } catch (e) { } };
MOB.ACT.MobPlace = function () { const p = MOB.ePend; if (!p) return; MOB.placeT = performance.now(); MOB.placeXY = { x: MOB.downX, y: MOB.downY }; const cv = document.getElementById('c'); MOB.ePend = null; MOB.passing = true;
  try { const o = { pointerId: 9901, pointerType: 'touch', clientX: p.x, clientY: p.y, button: 0, buttons: 1, isPrimary: true, bubbles: true, cancelable: true }; cv.dispatchEvent(new PointerEvent('pointerdown', o)); cv.dispatchEvent(new PointerEvent('pointerup', Object.assign({}, o, { buttons: 0 }))); } finally { MOB.passing = false; } EDIT.mouse = { x: p.x, y: p.y }; MOB.refresh(true); };
{ const _ur = GAME.updateRoom; GAME.updateRoom = function () { const r = _ur.apply(this, arguments); if (MOB.on && MOB.el && GAME.inside) { try { if (GAME.roomEdit && !EDIT.mouse && MOB.last) EDIT.mouse = { x: MOB.last.x, y: MOB.last.y }; } catch (e) { } } return r; }; }
addEventListener('pointerdown', e => { if (MOB.on && e.pointerType === 'touch' && e.target.id === 'c') MOB.last = { x: e.clientX, y: e.clientY }; }, true);
addEventListener('pointermove', e => { if (MOB.on && e.pointerType === 'touch' && e.target.id === 'c' && MOB.ptr.size < 2) { MOB.last = { x: e.clientX, y: e.clientY }; if (MOB.ePend && MOB.ptr.has(e.pointerId)) { MOB.ePend.x = e.clientX; MOB.ePend.y = e.clientY; } } }, true);
// ---------- 模様がえ on a phone: a tap shows where it would go; "✓ ここに置く" puts it there ----------
addEventListener('pointerdown', e => { if (!MOB.on || e.pointerType !== 'touch' || e.target.id !== 'c' || !GAME.inside || !GAME.roomEdit || MOB.ptr.size > 1) return; EDIT.mouse = { x: e.clientX, y: e.clientY };
  e.stopImmediatePropagation(); if (ROOM.pick) return; try { GAME.roomHover(); } catch (er) { } MOB.rt = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, k: MOB.k }; }, true);
// with nothing in hand, a tap (not a slide) on a piece of furniture picks it up
addEventListener('pointermove', e => { const t = MOB.rt; if (t && t.id === e.pointerId && Math.hypot(e.clientX - t.x, e.clientY - t.y) > 12) t.moved = true; }, true);
addEventListener('pointerup', e => { const t = MOB.rt; if (!t || t.id !== e.pointerId) return; MOB.rt = null; if (t.moved || t.k !== MOB.k || MOB.ptr.size > 0 || !GAME.inside || !GAME.roomEdit || ROOM.pick) return; EDIT.mouse = { x: t.x, y: t.y }; try { GAME.roomHover(); if (ROOM.hover) GAME.roomClick(); } catch (er) { } }, true);
{ const _rp = GAME.roomEditPanel; GAME.roomEditPanel = function () { const r = _rp.apply(this, arguments); if (MOB.on && ROOM.pick) { const rb = this.el.roome.querySelector('.rb'); if (rb && !rb.querySelector('[data-mp]')) { rb.insertAdjacentHTML('afterbegin', '<button data-mp="1" class="primary">✓ ここに置く</button>'); rb.querySelector('[data-mp]').addEventListener('click', ev => { ev.stopPropagation(); if (MOB.last) EDIT.mouse = { x: MOB.last.x, y: MOB.last.y }; const pl = GAME.placePlan(); if (!pl) { UI.toast('置きたい場所をタップしてね'); return; } GAME.roomClick(); }); }
      const sub = this.el.roome.querySelector('.rh .sub'); if (sub) sub.textContent = `「${(FURN.find(f => f.id === ROOM.pick.id) || {}).name || ''}」を置きたい所をタップ →「✓ ここに置く」（緑なら置けます）`; } return r; }; }
// ---------- the island editor on a phone: the last tap stays as the pointer (road preview, the house to build) ----------
addEventListener('pointerup', e => { if (MOB.on && e.pointerType === 'touch' && e.target.id === 'c' && MOB.ptr.size === 0 && MOB.last && (EDIT.on || GAME.roomEdit)) setTimeout(() => { if (!EDIT.mouse) EDIT.mouse = { x: MOB.last.x, y: MOB.last.y }; }, 0); }, true);
// ---------- settings: touch controls on/off (for touch laptops), and a lost graphics context ----------
MOB.set = function (on) { MOB.on = !!on; window.__mob = MOB.on; document.documentElement.classList.toggle('mob', MOB.on); { const ts = document.getElementById('toasts'), hud = document.getElementById('hud'); if (ts && hud) { if (!MOB.on && ts.parentNode !== hud) { ts.style.top = ''; hud.appendChild(ts); } else if (MOB.on && ts.parentNode !== document.body) document.body.appendChild(ts); } } try { MOB.viewShift(); MOB.fovFix(); } catch (e) { } try { localStorage.setItem('hoshinami.touch', on ? '1' : '0'); } catch (e) { } if (MOB.on) { MOB.build(); MOB.watchText(); } MOB.refresh(true); UI.toast(on ? '📱 タッチ操作：ON（画質の軽さは次に開いたときから）' : '🖱️ タッチ操作：OFF（キーボードとマウス）。もどすときは建物の外の ⚙ →「📱 タッチ操作」'); };
{ const _ui = UI.init; UI.init = function () { const r = _ui.apply(this, arguments); try { const card = document.querySelector('#hud .card.ctl'); let touchy = MOB.on; try { touchy = touchy || navigator.maxTouchPoints > 0; } catch (e) { } if (card && touchy && !document.getElementById('touchBtn')) { const row = document.createElement('div'); row.className = 'row'; const b = document.createElement('button'); b.id = 'touchBtn'; const lab = () => { b.textContent = MOB.on ? '📱 タッチ操作：ON' : '📱 タッチ操作：OFF'; b.classList.toggle('on', MOB.on); }; lab(); b.onclick = ev => { ev.stopPropagation(); if (MOB.on && !(b._arm && performance.now() - b._arm < 4000)) { b._arm = performance.now(); b.textContent = '📱 もう一度タップでOFF（パソコンの操作に）'; setTimeout(() => { b._arm = 0; lab(); }, 4000); return; } b._arm = 0; MOB.set(!MOB.on); lab(); }; row.appendChild(b); (card.querySelector('.ctlMore') || card).appendChild(row); } } catch (e) { }
  if (MOB.on) MOB.build(); return r; }; }
{ const _i = GAME.init; GAME.init = function () { const r = _i.apply(this, arguments); try { const cv = document.getElementById('c'); cv.addEventListener('webglcontextlost', e => { if (!MOB.on) return; e.preventDefault(); const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;z-index:99;display:grid;place-items:center;background:rgba(10,30,40,.75);color:#fff;font:800 16px "M PLUS Rounded 1c",sans-serif;text-align:center;padding:24px'; d.innerHTML = '<div>画面の描画が止まりました（メモリが足りなくなった可能性があります）。<br>記録は自動でセーブされています。<br><br><button style="font:inherit;padding:12px 22px;border-radius:14px;border:0;background:#3f8f5a;color:#fff" onclick="location.reload()">読みこみなおす</button></div>'; document.body.appendChild(d); }, false); } catch (e) { } return r; }; }
// ---------- a banner that comes while a window is open waits until it closes (it would cover the window on a small screen) ----------
MOB.busyWin = g => !!((g.modal && g.el && g.el.modal && !g.el.modal.hidden) || (typeof EDIT !== 'undefined' && EDIT.on) || g.roomEdit || (typeof PHOTO !== 'undefined' && PHOTO.on) || (typeof LIFE !== 'undefined' && LIFE.fish) || (g.el && g.el.meet && !g.el.meet.hidden) || (typeof HUD2 !== 'undefined' && HUD2.open) || (MOB.el && !MOB.el.querySelector('#mSheet').hidden));
MOB.talkNow = () => !!((DIALOG.npc || !document.getElementById('dlg').hidden) && !(typeof STORY !== 'undefined' && STORY.scene));
{ const _b = GAME.banner; GAME.banner = function (t, sub) { if (MOB.on && (MOB.busyWin(this) || (MOB.talkNow() && !/^\s*(💞|📜|🌊|⛰️|🏮|✨)/.test(String(t || ''))))) { (MOB.bq = MOB.bq || []).push([t, sub]); return; } return _b.apply(this, arguments); }; }
MOB.bqT = 0;
{ const _u = GAME.update; GAME.update = function (dt) { const r = _u.apply(this, arguments); if (MOB.on && MOB.bq && MOB.bq.length) { MOB.bqT -= dt || 0.016; if (MOB.bqT <= 0 && !MOB.busyWin(this) && !MOB.talkNow()) { const [t, sub] = MOB.bq.shift(); MOB.bqT = 4.4; try { this.banner(t, sub); } catch (e) { } } } return r; }; }
// ---------- ⚙ settings on a phone: closed when the game opens, and a tap on the scene closes it ----------
if (MOB.on) { try { HUD2.open = false; } catch (e) { } }
addEventListener('pointerdown', e => { if (!MOB.on || e.target.id !== 'c') return; try { if (HUD2.open) { HUD2.open = false; HUD2.apply(); } } catch (er) { } }, true);
// ⚙ → 「操作説明」 shows the touch controls on a phone (the keyboard line is hidden there)
addEventListener('click', e => { if (!MOB.on || !e.target.closest || !e.target.closest('#hud .ctl [data-c="help"]')) return; e.stopPropagation(); e.preventDefault(); try { HUD2.open = false; HUD2.apply(); } catch (er) { } MOB.help(); }, true);
// a window that opens with its button focused stays scrolled to its top (the title and the first lines come first)
if (MOB.on) { const _f = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function (o) { if (this.closest && this.closest('#game .mbox, #game .gmeet')) return _f.call(this, Object.assign({ preventScroll: true }, o || {})); return _f.apply(this, arguments); }; }
// sound on a phone: the browser lets sound start only when a finger is lifted (touchend / pointerup), not when it touches down
{ const un = () => { try { if (typeof SND !== 'undefined') SND.unlock(); } catch (e) { } }; addEventListener('touchend', un, true); addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') un(); }, true); }
// a page of its own on a phone (not inside another page): the phone's "back" closes the open window / ends editing first, and leaves the game only when nothing is open
// and after the on-screen keyboard closes, the page goes back to where it was
if (MOB.on) {
  addEventListener('focusout', e => { const t = e.target; if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) setTimeout(() => { try { if (!/^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName || '')) window.scrollTo(0, 0); } catch (er) { } }, 60); }, true);
  let top = false; try { top = window.top === window; } catch (e) { }
  // a few steps of "back" belong to the game, so that "back" twice in a row closes a window and then warns (instead of leaving).
  // A step is added at a touch (a browser may skip the steps a page added without one), one per touch, up to 3.
  const depth = () => { try { const st = history.state; return st && st.hoshinami ? (st.d || 1) : 0; } catch (e) { return 0; } };
  if (top && history.pushState) { const push = e => { if (e && e.type === 'keydown' && !e.isTrusted) return; const d = depth(); if (d >= 3) return; try { history.pushState({ hoshinami: 1, d: d + 1 }, ''); } catch (er) { } }; addEventListener('pointerup', push, true); addEventListener('keydown', push, true);
    addEventListener('popstate', () => { const n = performance.now(); let busy = false; try { busy = !!((GAME.modal && GAME.modal !== 'title') || EDIT.on || GAME.roomEdit || (typeof PHOTO !== 'undefined' && PHOTO.on) || (MOB.el && !MOB.el.querySelector('#mSheet').hidden) || DIALOG.npc || !document.getElementById('dlg').hidden || HUD2.open || !document.getElementById('sndPanel').hidden || (LIFE.fish && /^(wait|cast)$/.test(LIFE.fish.st || ''))); } catch (e) { }
      const leaveOrWarn = () => { if (n - (MOB.backT || -9e9) < 3000) { try { history.back(); } catch (e) { } return; } MOB.backT = n; try { UI.toast('もう一度「戻る」でゲームを終わります（記録は保存されています）'); } catch (e) { } };
      if (!busy) return leaveOrWarn();
      const st = () => { try { return [MOB.winSig(), GAME.modal || '', !!EDIT.on, !!GAME.roomEdit, !!(typeof PHOTO !== 'undefined' && PHOTO.on), !!HUD2.open, !document.getElementById('sndPanel').hidden, !!ROOM.pick, EDIT.tool, (EDIT.nodes || []).length, !!(typeof BRG !== 'undefined' && BRG.a), !!(typeof HM !== 'undefined' && (HM.sel || HM.pick)), !!EDIT.housePick, !!EDIT.buildPick, !!MOB.ePend, !!(typeof CITY !== 'undefined' && CITY.plan), EDIT.decorId || '', DIALOG.i, !!DIALOG.npc, typeof STORY !== 'undefined' && STORY.scene ? STORY.scene.i : -1, (document.getElementById('dlgT') || {}).textContent].join('|'); } catch (e) { return ''; } }, s0 = st();
      const sp = document.getElementById('sndPanel'), M = GAME.el.modal; let sure = false;
      if (MOB.el && !MOB.el.querySelector('#mSheet').hidden) MOB.menu(false); else if (sp && !sp.hidden) sp.hidden = true; else if (HUD2.open) { HUD2.open = false; HUD2.apply(); }
      // a question with choices: only a choice that means "no thanks" is taken (never the last one by itself, e.g. 🎁プレゼントする)
      else if (UI._choices) { const c = UI._choices.find(o => /じゃあね|またね|やめ|いいえ|なんでもない|あとで|べつに|ことわる/.test(String(o.t || '').replace(/<[^>]*>/g, ''))); if (c) c.f(); sure = true; }
      else if (LIFE.fish && /^(wait|cast)$/.test(LIFE.fish.st || '') && !(GAME.modal && M && !M.hidden)) { try { GAME.endFish(); } catch (e) { } sure = true; }
      else if (typeof STORY !== 'undefined' && STORY.scene) { try { advanceTalk(); } catch (e) { } } else if (DIALOG.npc) MOB.tap('Space'); else if (!document.getElementById('dlg').hidden) UI.dialog(null);
      // the meeting: one screen back (a proposal → the list; the list or the opening → a break; the last screen → the end)
      else if (GAME.modal === 'meeting') { const stp = GAME.mt && GAME.mt.step, q = k => document.querySelector('#gMeet [data-m="' + k + '"]'), mb = stp === 'detail' ? q('list') : stp === 'done' ? q('end') : q('later'); if (mb) mb.click(); else { try { GAME.endMeeting(); } catch (e) { } } sure = true; }
      // a window closes the way its own button does (a letter goes on with its story; food just paid for is taken away, not lost)
      else if (GAME.modal && M && !M.hidden) { const out = M.querySelector('[data-eat="out"]'), x = M.querySelector('.x,[data-x="close"],[data-x="ok"]'); if (out) out.click(); else if (x) x.click(); else MOB.tap('Escape'); }
      else MOB.tap('Escape');
      // a step of "back" for the next press (a browser may skip it; the first step, which a touch added, is never used up this way)
      setTimeout(() => { if (!sure && st() === s0) { leaveOrWarn(); return; } if (depth() >= 1) { try { history.pushState({ hoshinami: 1, d: depth() + 1 }, ''); } catch (e) { } } else { MOB.backT = performance.now(); try { UI.toast('もう一度「戻る」でゲームを終わります（記録は保存されています）'); } catch (e) { } } }, 60); }); }
}
// the fully built demo island is the heaviest scene: say so on a phone
{ const _t = GAME.showTitle; GAME.showTitle = function () { const r = _t.apply(this, arguments); if (MOB.on) { try { setTimeout(() => { const a = document.activeElement; if (a && a.tagName === 'INPUT' && a.closest('#game')) a.blur(); }, 60); const sm = this.el.title.querySelector('.demoent small'); if (sm && !/スマホ/.test(sm.textContent)) sm.textContent += '・スマホでは重くなることがあります'; } catch (e) { } } return r; }; }
// ⚙ closed → the sound panel that was opened from it closes too (it has no close button of its own)
{ const _ap = HUD2.apply; HUD2.apply = function () { const r = _ap.apply(this, arguments); if (MOB.on && !HUD2.open) { const pn = document.getElementById('sndPanel'); if (pn) pn.hidden = true; } return r; }; }
addEventListener('pointerdown', e => { if (!MOB.on || e.target.id !== 'c') return; const pn = document.getElementById('sndPanel'); if (pn && !pn.hidden) pn.hidden = true; }, true);
// the island editor's tool bar keeps its scroll position when the panel is drawn again (choosing a tool), and the chosen tool stays in view
{ const _ep = UI.editPanel; UI.editPanel = function () { const t0 = document.querySelector('#hud .editp .tools'), sl = t0 ? t0.scrollLeft : 0; const r = _ep.apply(this, arguments);
  if (MOB.on) { try { const t = document.querySelector('#hud .editp .tools'); if (t) { t.scrollLeft = sl; const on = t.querySelector('button.on'); if (on) { const a = on.offsetLeft, b = a + on.offsetWidth; if (a < t.scrollLeft) t.scrollLeft = a - 8; else if (b > t.scrollLeft + t.clientWidth) t.scrollLeft = b - t.clientWidth + 8; } } } catch (e) { } } return r; }; }
// a shelf window drawn again (＋／−／かごに入れる) stays where it was scrolled to
{ const _os = SHOP.openShelf; SHOP.openShelf = function (sec) { const g = GAME, same = g.modal === 'shelf' && SHOP.curSec === sec, mb = same && g.el.modal.querySelector('.mb'), bx = same && g.el.modal.querySelector('.mbox'), st = mb ? mb.scrollTop : 0, sb = bx ? bx.scrollTop : 0;
  const r = _os.apply(this, arguments); if (same && MOB.on) { try { const m2 = g.el.modal.querySelector('.mb'), b2 = g.el.modal.querySelector('.mbox'); if (m2) m2.scrollTop = st; if (b2) b2.scrollTop = sb; } catch (e) { } } return r; }; }
setTimeout(() => { const _om = SHOP.openMenu; if (_om) SHOP.openMenu = function (title) { const g = GAME, same = MOB.on && g.modal === 'menu' && SHOP._mTitle === title, mb = same && g.el.modal.querySelector('.mb'), st = mb ? mb.scrollTop : 0; SHOP._mTitle = title; const r = _om.apply(this, arguments); if (same) { try { const m2 = g.el.modal.querySelector('.mb'); if (m2) m2.scrollTop = st; } catch (e) { } } return r; }; }, 0); // (SHOP.openMenu is made after this file)
// scenes with their own camera (the island meeting, story scenes) on a tall screen: a wider view so the people around are in the picture
{ const _co = GAME.camOverride; GAME.camOverride = function () { const r = _co.apply(this, arguments); if (r && MOB.on) { try { const W = innerWidth, H = innerHeight, a = W / H;
    // the island meeting on a tall screen: the picture a wide screen shows (everyone at the table) is put across the part above the panel
    const mp = this.modal === 'meeting' && a < 1 && this.el.meet && !this.el.meet.hidden ? this.el.meet.getBoundingClientRect() : null;
    if (mp && mp.height) { const Hv = Math.round(Math.max(H * 0.28, Math.min(H * 0.9, mp.top - 4))), fh = Math.round(W / 1.6), oy = -Math.max(0, Math.round(Hv * 0.42 - fh * 0.28)), sig = 'meet' + [W, H, fh, oy].join(); if (MOB._vs !== sig) { MOB._vs = sig; camera.setViewOffset(W, fh, 0, oy, W, H); } camera.aspect = 1.6; camera.updateProjectionMatrix(); MOB._meetVO = true; return r; }
    if (a < 1) { const u = camera.userData, f = Math.min(92, Math.max(camera.fov, 2 * Math.atan(Math.tan(25 * Math.PI / 180) / a) * 180 / Math.PI)); if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); } u.adjFov = f; } } catch (e) { } } return r; }; }
// ⚙ 「⚡ 自動」 is the picture quality (its meaning is only in a mouse-over note on a PC)
{ const _pb = PERF.btn; PERF.btn = function () { const r = _pb.apply(this, arguments); if (MOB.on) { const b = document.getElementById('autoBtn'); if (b && !/画質/.test(b.textContent)) b.textContent = b.textContent.replace('⚡ 自動', '⚡ 画質：自動'); } return r; }; }
try { PERF.btn(); } catch (e) { }
// 「島を最初の形に」→「本当にもどす？」 appears in the same place: a quick second tap (a double tap) does not count
addEventListener('click', e => { if (!MOB.on || !e.target.closest) return; const pa = e.target.closest('#gModal [data-pa="del"]'); if (pa) { const n = performance.now(); if (pa.classList.contains('warn') && (n - (pa._t || 0) < 1000 || MOB.tapGap < 400)) { e.stopPropagation(); e.preventDefault(); return; } if (!pa.classList.contains('warn')) pa._t = n; return; } const b = e.target.closest('#hud .editp [data-a="reset"]'); if (!b) return; const now = performance.now(); if (EDIT.confirmReset && (now - (MOB.resetT || 0) < 1000 || MOB.tapGap < 400)) { e.stopPropagation(); e.preventDefault(); return; } if (!EDIT.confirmReset) MOB.resetT = now; }, true);
// the island editor panel can fold down to the tool row (more of the island to tap on a small screen)
MOB.eMini = false;
{ const _ep = UI.editPanel; UI.editPanel = function () { const r = _ep.apply(this, arguments); if (MOB.on && EDIT.on) { try { const p = document.getElementById('editp'), tl = p && p.querySelector('.tools'); if (p && tl && !p.querySelector('.mminiB')) { p.classList.toggle('mmini', MOB.eMini); const b = document.createElement('button'); b.className = 'mminiB'; b.textContent = MOB.eMini ? '▴ ひらく' : '▾ たたむ'; b.addEventListener('click', ev => { ev.stopPropagation(); MOB.eMini = !MOB.eMini; p.classList.toggle('mmini', MOB.eMini); b.textContent = MOB.eMini ? '▴ ひらく' : '▾ たたむ'; MOB.layout(); }); tl.insertBefore(b, tl.firstChild); } MOB.toolInView(); } catch (e) { } } return r; }; }
MOB.toolInView = function () { const t = document.querySelector('#hud .editp .tools'), on = t && t.querySelector('button.on:not(.mminiB)'); if (!on) return; const f = t.querySelector('.mminiB'), pad = (f ? f.offsetWidth : 0) + 8, tr = t.getBoundingClientRect(), r = on.getBoundingClientRect(), a = r.left - tr.left + t.scrollLeft, b = a + r.width; if (a - pad < t.scrollLeft) t.scrollLeft = Math.max(0, a - pad); else if (b > t.scrollLeft + t.clientWidth) t.scrollLeft = b - t.clientWidth + 8; };
MOB.okBtn = () => document.querySelector('#editp [data-a="bconfirm"],#editp [data-a="hbuild"],#editp [data-hm="go"]');
MOB.ACT.MobOk = function () { MOB.placeT = performance.now(); MOB.placeXY = { x: MOB.downX, y: MOB.downY }; const b = MOB.okBtn(); if (b && !b.disabled) b.click(); MOB.refresh(true); };
MOB.ACT.MobBrgX = function () { try { BRG.clear(); UI.editPanel(); } catch (e) { } MOB.refresh(true); };
// 🔊 音 on a phone: the sound panel opens on its own (the settings panel closes so they do not overlap) and has its own ×
addEventListener('click', e => { if (!MOB.on || !e.target.closest || !e.target.closest('#sndBtn')) return; const pn = document.getElementById('sndPanel'); if (!pn) return; e.stopPropagation(); e.preventDefault(); try { SND.unlock(); } catch (er) { }
  if (!pn.querySelector('.msndx')) { const x = document.createElement('button'); x.className = 'msndx'; x.textContent = '×'; x.setAttribute('aria-label', 'とじる'); x.onclick = ev => { ev.stopPropagation(); pn.hidden = true; }; pn.appendChild(x); }
  pn.hidden = false; MOB.keepSnd = true; try { HUD2.open = false; HUD2.apply(); } finally { MOB.keepSnd = false; } }, true);
{ const _ap = HUD2.apply; HUD2.apply = function () { if (MOB.on && MOB.keepSnd) { const pn = document.getElementById('sndPanel'), was = pn && pn.hidden; const r = _ap.apply(this, arguments); if (pn) pn.hidden = was; return r; } return _ap.apply(this, arguments); }; }
// spending a lot with one tap (島の開発, 島モータース): the first tap asks, the second (within 4 seconds) buys
addEventListener('click', e => { if (!MOB.on || !e.target.closest || e.defaultPrevented) return; const b = e.target.closest('#gModal [data-dev], #gModal [data-buy], #gModal [data-tune], #gModal [data-reform], #gModal [data-wall], #gModal [data-floor], #gModal [data-paint], #gModal [data-rod], #gModal [data-fix], #gModal [data-ok], #gModal [data-care="pull"], #gModal [data-rel], #gModal [data-relbug], #gModal [data-sellall], #gModal [data-sellxall], #gMeet [data-m="decide"], #gModal [data-x="ship"], #gModal [data-sell], #netBar [data-nb^="kick:"], #netBar [data-nb="home"], #boatPanel [data-f="rm"], #gModal .gi:not([data-lt])'); if (!b || b.disabled) return; if (b.matches('[data-paint]')) { try { const gr = GAME.garage(); if (gr.paint && gr.paint[gr.active] === b.dataset.paint) { e.stopPropagation(); e.preventDefault(); UI.toast('いまの色です'); return; } } catch (er) { } }
  if (!b.matches('[data-dev],[data-buy],[data-tune],[data-paint],[data-fix],[data-care="pull"],[data-rel],[data-relbug],[data-sellall],[data-sellxall],[data-m="decide"],[data-x="ship"],[data-sell],[data-nb^="kick:"],[data-nb="home"],[data-f="rm"],.gi') && !/円/.test(b.textContent) && !b._arm) return; const now = performance.now();
  if (b._arm && (now - b._arm < 500 || MOB.tapGap < 350)) { e.stopPropagation(); e.preventDefault(); return; } if (b._arm && now - b._arm < 4000) { b._arm = 0; return; } e.stopPropagation(); e.preventDefault(); b._arm = now; const t = b.innerHTML, w = b.offsetWidth, h = b.offsetHeight; b.style.width = w + 'px'; b.style.height = h + 'px'; b.style.overflow = 'hidden'; if (w >= 72) b.innerHTML = '✓ 決定'; else if (w >= 50) b.innerHTML = '✓決定'; b.classList.add('marm'); UI.toast(b.matches('[data-f="rm"]') ? '定置網を撤去します（もどってきません）。もう一度タップで撤去' : b.matches('[data-care="pull"]') ? 'ひっこぬきます（作物はなくなります）。もう一度タップで決定' : b.matches('[data-rel],[data-relbug]') ? '1匹放します。もう一度タップで決定' : b.matches('[data-m="decide"]') ? 'この案に決めます。もう一度タップで決定' : b.matches('[data-nb^="kick:"]') ? '帰ってもらいます。もう一度タップで決定' : b.matches('[data-nb="home"]') ? '自分の島に帰ります。もう一度タップで決定' : b.matches('.gi') ? 'これをプレゼントします。もう一度タップで決定' : 'もう一度タップで決定します'); setTimeout(() => { if (b._arm === now) { b._arm = 0; b.innerHTML = t; b.style.width = b.style.height = b.style.overflow = ''; b.classList.remove('marm'); } }, 4000); }, true);
// going in / out of a building: no button presses until the screen has come back (a second tap would go in twice or straight out again)
{ const _fd = GAME.fade; GAME.fade = function () { MOB.fadeUntil = performance.now() + 1150; return _fd.apply(this, arguments); }; }
// right after a ☰ menu item, a tap that lands on the scene (the second tap of a double tap) is not used (it would already edit the ground)
// and the choices of a talk that just appeared under the finger, or the next window's button where one was just tapped, ignore that quick second tap
MOB.tapGuard = { t: 0, el: null };
addEventListener('pointerdown', e => { if (!MOB.on || e.pointerType !== 'touch' || e.target.id !== 'c') return; if (performance.now() - (MOB.menuT || 0) < 450) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
// (on a phone a question's 「🎁 プレゼントする」 comes first, not last — the last choice lies where Ⓐ was)
{ const _ch = UI.choices; UI.choices = function (list) { MOB.chT = performance.now(); try { if (MOB.on && Array.isArray(list) && list.length > 2 && /プレゼント/.test(String(list[list.length - 1].t || ''))) { const L = list.slice(); L.unshift(L.pop()); return _ch.call(this, L, ...[].slice.call(arguments, 1)); } } catch (e) { } return _ch.apply(this, arguments); }; }
addEventListener('click', e => { if (!MOB.on || !e.target.closest) return; const now = performance.now(); const b = e.target.closest('button,[data-ch],label,.gcard,.fcard'); if (!b || b.closest('#mCtl')) return;
  // (a choice under Ⓐ while Ⓐ is being pressed again and again without a pause (less than 1.7 s apart) is never picked by those presses)
  if (b.closest('.chs') && (now - (MOB.chT || 0) < (MOB.inAChain ? 1500 : Math.hypot(e.clientX - MOB.prevX, e.clientY - MOB.prevY) < 60 ? 800 : 450) || (MOB.inAChain && MOB.tapGap < 1700))) { e.stopPropagation(); e.preventDefault(); MOB.pulse(e.clientX, e.clientY); if (MOB.inAChain && MOB.chHint !== MOB.chT) { MOB.chHint = MOB.chT; try { UI.toast('⏸ 連打を止めました（少し待ってから選んでね）'); } catch (er) { } } return; }
  const key = [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join('&') || (b.tagName + ':' + (b.textContent || '').trim().slice(0, 24));
  const g = MOB.tapGuard, near = Math.abs(e.clientX - (g.x || -99)) + Math.abs(e.clientY - (g.y || -99)) < 28; if (key !== g.el && near && now - g.t < 400 && b.closest('#game,#hud,#photoUI')) { e.stopPropagation(); e.preventDefault(); return; } if (key === g.el && near && now - g.t < 350 && b.matches('[data-sellf],[data-sells],[data-sellv],[data-sellbug],[data-selld],[data-v],[data-seed],[data-fert],[data-cook]')) { e.stopPropagation(); e.preventDefault(); return; } g.t = now; g.el = key; g.x = e.clientX; g.y = e.clientY; }, true);
MOB._pv = null;
MOB.pendScreen = function () { const P = MOB.ePend; if (!P) return; try { if (!P.w || P.wx !== P.x || P.wy !== P.y) { const w = pickSurface(P.x, P.y); if (w) { P.w = w; P.wx = P.x; P.wy = P.y; } return; }
  const v = MOB._pv || (MOB._pv = new THREE.Vector3()); v.set(P.w.x, P.w.y, P.w.z).project(camera); const r = renderer.domElement.getBoundingClientRect(); const x = r.left + (v.x + 1) / 2 * r.width, y = r.top + (1 - v.y) / 2 * r.height;
  if (v.z < 1 && Math.abs(x - P.x) + Math.abs(y - P.y) > 0.5) { P.x = P.wx = x; P.y = P.wy = y; } } catch (e) { } };
// a finger lifted from the screen is not "the mouse left the page": the editor keeps pointing where it was
addEventListener('pointerleave', e => { if (MOB.on && e.pointerType === 'touch' && e.target && e.target.id === 'c' && (EDIT.on || (GAME.inside && GAME.roomEdit))) e.stopPropagation(); }, true);
// the boat panel's first line folds its details in and out (portrait)
addEventListener('click', e => { if (!MOB.on || !e.target.closest) return; const h = e.target.closest('#boatPanel .bp-h'); if (!h) return; const p = document.getElementById('boatPanel'); p.classList.toggle('mfull'); }, true);
// fingers the browser never reported as lifted (an app switch, a system gesture) are forgotten when no finger is on the screen any more
addEventListener('touchend', e => { if (MOB.on && e.touches && e.touches.length === 0 && MOB.ptr.size) { MOB.ptr.clear(); MOB.pinch = null; MOB.k++; } }, true);
// no finger on the screen any more: the stick and the held buttons let go too, even if the lift of that finger was never reported
// (a control hidden while it was held, an iPhone that drops the pointer events): the player never goes on walking by itself
addEventListener('touchend', e => { if (!MOB.on || !e.touches || e.touches.length) return; setTimeout(() => { try { if (MOB.joy && MOB.resetJoy) MOB.resetJoy(); for (const [id, h] of MOB.held) { if (h.code) MOB.key(h.code, false); if (h.btn) h.btn.classList.remove('down'); } MOB.held.clear(); } catch (er) { } }, 0); }, true);
addEventListener('touchcancel', e => { if (MOB.on && e.touches && e.touches.length === 0 && MOB.ptr.size) { MOB.ptr.clear(); MOB.pinch = null; MOB.k++; } }, true);
for (const ev of ['blur', 'pagehide']) addEventListener(ev, () => { if (!MOB.on) return; MOB.ptr.clear(); MOB.pinch = null; if (MOB.resetJoy) MOB.resetJoy(); for (const [id, h] of MOB.held) { if (h.code) MOB.key(h.code, false); } MOB.held.clear(); });
document.addEventListener('visibilitychange', () => { if (MOB.on && document.hidden) { MOB.ptr.clear(); MOB.pinch = null; if (MOB.resetJoy) MOB.resetJoy(); for (const [id, h] of MOB.held) { if (h.code) MOB.key(h.code, false); } MOB.held.clear(); } });
