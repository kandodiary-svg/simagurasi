// ===================== スマホ・タブレット（1）: タッチ端末の判定と、2本指の操作（mobile0.js） =====================
// この部分は早めに読みこむ: 写真モードや部屋のカメラ、しまづくりより先に指の動きを受け取って、2本指のときはそちらへ渡さない。
// - 1本指: 今までのマウスのドラッグと同じ（カメラを回す・しまづくりの道具を使う・模様がえで置く場所をえらぶ）
// - 2本指: つまむ／広げる＝近づく・はなれる（マウスのホイールと同じ）、2本指で横にずらす＝回す、縦にずらす＝見おろす角度
// - しまづくり中は、1本目の指を少しだけ待ってから道具に渡す（2本指で回そうとしたのに地面をけずってしまわないように）
// パソコン（マウスとキーボード）では MOB.on が false で、ここは何もしない。
const MOB = { on: false, ptr: new Map(), pinch: null, k: 0, pend: null, passing: false };
MOB.detect = function () {
  try { const q = new URLSearchParams(location.search).get('touch'); if (q === '1' || q === '0') return q === '1'; const s = localStorage.getItem('hoshinami.touch'); if (s === '1' || s === '0') return s === '1'; } catch (e) { }
  try { return !!(matchMedia('(pointer: coarse)').matches && matchMedia('(hover: none)').matches); } catch (e) { return false; }
};
MOB.on = MOB.detect(); window.__mob = MOB.on;
document.documentElement.classList.toggle('mob', MOB.on);
// a tap on the same spot as the tap just before it, right after a window (or a talk) opened or closed there (a double tap, Ⓐ tapped
// again and again, or tapped again because the phone was slow to show the window) belongs to what was there before: it must not press
// what has just appeared under the finger (buy, sell, cook in the window that Ⓐ opened, close that window again, open ☰ after a
// window's ×). Such taps are not used for a moment (a talk: 0.6 s, the ☰ menu or a closed window: 0.45 s, an opened window: 1 s, or longer while they
// keep coming quickly); a tap somewhere else (the player aims at something) always counts.
MOB.winSig = () => { try { const g = GAME; if (!g || !g.el) return ''; if (g.modal && g.el.modal && !g.el.modal.hidden) return 'm:' + g.modal; if (g.el.meet && !g.el.meet.hidden) return 'meet:' + (g.mt ? g.mt.step + ':' + (g.mt.sel || '') : ''); const sh = document.getElementById('mSheet'); if (sh && !sh.hidden) return 'menu'; const d = document.getElementById('dlg'); if (d && !d.hidden) return 'dlg'; } catch (e) { } return ''; };
// when a tap really happened (a tap that waited while the phone was busy building a room arrives late: its own time counts)
MOB.ts = e => { const n = performance.now(), t = e && e.timeStamp; return t > 0 && t <= n + 50 && t > n - 10000 ? t : n; };
MOB.downT = -1e9; MOB.downSig = ''; MOB.downX = -999; MOB.downY = -999; MOB.prevX = -999; MOB.prevY = -999; MOB.anchor = null; MOB.unsure = false; MOB.eatTap = null; MOB.tapGap = 1e9;
MOB.pulse = (x, y) => { try { let d = document.getElementById('mPulse'); if (!d) { d = document.createElement('div'); d.id = 'mPulse'; d.textContent = '⏸'; document.body.appendChild(d); } d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.remove('on'); void d.offsetWidth; d.classList.add('on'); } catch (e) { } };
MOB.quickEat = t => { try { if (!t || !t.closest) return false; if (t.closest('#gModal') || t.closest('.gmeet') || t.closest('#dlg') || (t.closest('#mCtl') && !t.closest('#mJoyZone'))) return true; return t.id === 'c' && typeof EDIT !== 'undefined' && (EDIT.on || (typeof GAME !== 'undefined' && GAME.inside && GAME.roomEdit)); } catch (e) { return false; } };
addEventListener('pointerdown', e => { if (!MOB.on || MOB.passing) return; const sig = MOB.winSig(), now = MOB.ts(e), gap = now - MOB.downT, x = e.clientX, y = e.clientY;
  if (sig !== MOB.downSig) { MOB.anchor = gap < 1000 ? { x: MOB.downX, y: MOB.downY, t: MOB.downT, sig } : null;
    // a window that Ⓐ (or another round button) opened, or that a tap on Ⓐ's spot opened while only that spot was being tapped (e.g. a choice
    // that came under Ⓐ): Ⓐ's spot stays "Ⓐ" — taps there are not used — until the player touches anything else once (at any pace, so
    // pressing Ⓐ again and again, fast or slow, never presses a button of the window that lies under it). A ring and a short note show it.
    const AD = MOB.aDown; if (/^m:|^meet/.test(sig) && AD && AD.on && AD.tl === MOB.downT) MOB.aSpot = { x: AD.x, y: AD.y, t0: MOB.downT, hint: false, free: false }; else if (!/^m:|^meet/.test(sig)) MOB.aSpot = null; }
  const S = MOB.aSpot, nearS = !!(S && Math.hypot(x - S.x, y - S.y) < 60); if (S && !S.free && !nearS) S.free = true;
  const atA = !!(S && !S.free && nearS) && MOB.quickEat(e.target); if (atA) { MOB.pulse(x, y); if (!S.hint && now - S.t0 > 700) { S.hint = true; try { UI.toast('⏸ Ⓐの連打を止めました（画面のほかの所に一度ふれると、ここも押せます）'); } catch (er) { } } }
  const A = MOB.anchor, near = !!(A && Math.hypot(x - A.x, y - A.y) < 60), age = A ? now - A.t : 1e9, lim = !A ? 0 : A.sig === 'dlg' ? 600 : A.sig === 'menu' ? 450 : A.sig === '' ? 300 : 1000;
  MOB.unsure = near && (age < lim || (/^m:|^meet/.test(A.sig) && MOB.unsure && gap < 450 && age < 1600));
  MOB.tapGap = gap; MOB.downT = now; MOB.downSig = sig; MOB.prevX = MOB.downX; MOB.prevY = MOB.downY; MOB.downX = x; MOB.downY = y;
  // Ⓐ pressed again and again: taps on Ⓐ's spot (even when something else is there now) keep the run going until a tap lands elsewhere;
  // inAChain = this tap is on Ⓐ, or on its spot within 2 s of the last one
  { const onA = !!(e.target && e.target.closest && e.target.closest('#mA, #mSub button')), AD = MOB.aDown, nearAD = !!(AD && Math.hypot(x - AD.x, y - AD.y) < 60);
    MOB.inAChain = onA || !!(nearAD && AD.on && now - AD.t < 2000);
    if (onA) MOB.aDown = { x, y, t: now, tl: now, on: true }; else if (nearAD && AD.on) { if (now - AD.t < 2000) AD.t = now; AD.tl = now; } else if (AD) AD.on = false; }
  // right after ✓ (put / plant / build): a quick further tap on the ✓'s spot (the ground under it, or a button that moved into its place) is not used
  const P = MOB.placeXY, afterOk = !!(P && now - (MOB.placeT || -1e9) < 450 && Math.hypot(x - P.x, y - P.y) < 70 && e.target && (e.target.id === 'c' || (e.target.closest && e.target.closest('#mBtns'))));
  if ((MOB.unsure && MOB.quickEat(e.target)) || afterOk || atA) { MOB.eatTap = e.pointerId; e.stopImmediatePropagation(); e.preventDefault(); } else MOB.eatTap = null; }, true);
addEventListener('click', e => { if (!MOB.on || MOB.eatTap === null) return; MOB.eatTap = null; if (MOB.quickEat(e.target)) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
{ const cv = () => document.getElementById('c'), isCv = e => e.target === cv();
  const center = () => { let x = 0, y = 0; for (const p of MOB.ptr.values()) { x += p.x; y += p.y; } const n = MOB.ptr.size || 1; return { x: x / n, y: y / n }; };
  const spread = () => { const a = [...MOB.ptr.values()]; return a.length < 2 ? 0 : Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
  const angle = () => { const a = [...MOB.ptr.values()]; return a.length < 2 ? 0 : Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x); };
  MOB.startPinch = () => { MOB.pinch = { d: spread(), c: center(), a: angle() }; MOB.k++; try { if (MOB.ePend && performance.now() - (MOB.ePend.t || 0) < 900) MOB.ePend = null; if (typeof BUSE !== 'undefined' && BUSE.press) BUSE.press = null; if (typeof EDIT !== 'undefined' && EDIT.down) editPointerUp(); } catch (e) { } if (typeof CAM !== 'undefined') CAM.drag = false; if (typeof PHOTO !== 'undefined') PHOTO.drag = null; };
  // the two fingers' moves arrive one at a time: work them out once per frame, when both have moved (otherwise a pure slide looks like small pinches)
  MOB.pinchMove = () => { if (!MOB.pinch || MOB._praf) return; MOB._praf = setTimeout(() => { MOB._praf = 0; MOB.pinchStep(); }, 12); };
  MOB.pinchStep = () => { const P = MOB.pinch; if (!P) return; const d = spread(), c = center(), dx = c.x - P.c.x, dy = c.y - P.c.y;
    // pinch: the same as the mouse wheel (every system that zooms with the wheel zooms with two fingers)
    if (P.d > 10 && d > 10) { const r = d / P.d; if ((r > 1.08 || r < 1 / 1.08) && typeof GAME !== 'undefined' && GAME.inside && !GAME.roomEdit && typeof INT !== 'undefined' && INT.mode === 'near') INT.zk = clamp((INT.zk || 1) * (r > 1 ? 0.88 : 1 / 0.88), 0.5, 1); if ((r > 1.08 || r < 1 / 1.08) && typeof GAME !== 'undefined' && GAME.inside && GAME.roomEdit && typeof ROOM !== 'undefined') { ROOM.zk = clamp((ROOM.zk || 1) * (r > 1 ? 0.88 : 1 / 0.88), 0.45, 1); if (ROOM.zk >= 1) ROOM.pan = null; } if (r > 1.08 || r < 1 / 1.08) { cv().dispatchEvent(new WheelEvent('wheel', { deltaY: r > 1 ? -100 : 100, bubbles: true, cancelable: true, clientX: c.x, clientY: c.y })); P.d = d; } }
    // two fingers sliding: turn the camera / tilt it
    if (Math.abs(dx) + Math.abs(dy) > 0.5) { const photo = typeof PHOTO !== 'undefined' && PHOTO.on, inside = typeof GAME !== 'undefined' && GAME.inside;
      if (photo) { PHOTO.yaw -= dx * 0.005; PHOTO.pitch = clamp(PHOTO.pitch + dy * 0.004, -0.6, 1.45); }
      else if (inside && typeof INT !== 'undefined') { if (INT.mode === 'near' && !GAME.roomEdit) { INT.yaw -= dx * 0.006; INT.pitch = clamp(INT.pitch + dy * 0.004, 0.25, 1.2); } else if (GAME.roomEdit && typeof ROOM !== 'undefined' && ROOM.zk < 1 && ROOM.size) { const S = ROOM.size, P2 = ROOM.pan || (ROOM.pan = { x: 0, z: 0 }), k = 0.02 * ROOM.zk; P2.x = clamp(P2.x - dx * k, -S.w / 2, S.w / 2); P2.z = clamp(P2.z - dy * k, -S.d / 2, S.d / 2); } }
      else if (typeof CAM !== 'undefined') { CAM.yaw -= dx * 0.005; CAM.pitch = clamp(CAM.pitch + dy * 0.004, -0.15, 1.35); CAM.lastDrag = performance.now() / 1000; } }
    // two fingers twisting: turn the camera the same way (like turning a map)
    { const an = angle(); let da = an - P.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; if (d > 30 && Math.abs(da) > 0.004 && Math.abs(da) < 1) { const photo = typeof PHOTO !== 'undefined' && PHOTO.on, inside = typeof GAME !== 'undefined' && GAME.inside;
        if (photo) PHOTO.yaw += da; else if (inside && typeof INT !== 'undefined') { if (INT.mode === 'near' && !GAME.roomEdit) INT.yaw += da; } else if (typeof CAM !== 'undefined') { CAM.yaw += da; CAM.lastDrag = performance.now() / 1000; } } P.a = an; }
    P.c = c; };
  // the first finger in しまづくり waits a moment (a second finger means "move the camera", not "use the tool")
  MOB.undoSoon = () => { if (typeof EDIT === 'undefined' || !EDIT.on || !MOB.strokeT || performance.now() - MOB.strokeT > 700) return; MOB.strokeT = 0;
    try { if (EDIT.down && EDIT.stroke) { EDIT.down = false; EDIT.stroke = null; const u = EDIT.undo.pop(); if (u) restore(u); } else if (EDIT.tool === 'road' && EDIT.nodes.length) { EDIT.nodes.pop(); updateRoadPreview(null); } } catch (er) { } };
  MOB.cancelPend = () => { if (MOB.pend) { clearTimeout(MOB.pend.t); MOB.pend = null; } };
  MOB.flushPend = () => { const P = MOB.pend; if (!P) return; clearTimeout(P.t); MOB.pend = null;
    if (MOB.twoStep && MOB.twoStep()) { MOB.ePend = { x: P.x, y: P.y, tool: EDIT.tool, t: performance.now() }; EDIT.mouse = { x: P.x, y: P.y }; return; }
    MOB.strokeT = performance.now(); MOB.passing = true; try { cv().dispatchEvent(new PointerEvent('pointerdown', { pointerId: P.id, pointerType: 'touch', clientX: P.x, clientY: P.y, button: 0, buttons: 1, isPrimary: true, bubbles: true, cancelable: true })); } finally { MOB.passing = false; } };
  addEventListener('pointerdown', e => { if (MOB.on && !MOB.passing && isCv(e) && performance.now() - (MOB.menuT || 0) < 450) { e.stopImmediatePropagation(); e.preventDefault(); return; } if (!MOB.on || MOB.passing || e.pointerType !== 'touch' || !isCv(e)) return; if (MOB.joyToPinch) MOB.joyToPinch(e.clientX, e.clientY, e.pointerId); MOB.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() });
    if (MOB.ptr.size >= 2) { e.stopImmediatePropagation(); MOB.cancelPend(); MOB.undoSoon(); MOB.startPinch(); return; }
    if (typeof EDIT !== 'undefined' && EDIT.on) { e.stopImmediatePropagation(); MOB.pend = { id: e.pointerId, x: e.clientX, y: e.clientY, t: setTimeout(() => MOB.flushPend(), 110) }; } }, true);
  addEventListener('pointermove', e => { if (!MOB.on || !MOB.ptr.has(e.pointerId)) return; const p = MOB.ptr.get(e.pointerId); p.x = e.clientX; p.y = e.clientY; if (MOB.pend && MOB.pend.id === e.pointerId) { MOB.pend.x = e.clientX; MOB.pend.y = e.clientY; }
    if (MOB.ptr.size >= 2) { e.stopImmediatePropagation(); MOB.pinchMove(); } else if (MOB.ambig && MOB.ambigCheck) MOB.ambigCheck(); }, true);
  const up = e => { if (!MOB.ptr.has(e.pointerId)) return; if (MOB._praf) { clearTimeout(MOB._praf); MOB._praf = 0; MOB.pinchStep(); } if (MOB.pend && MOB.pend.id === e.pointerId) MOB.flushPend(); const was = MOB.ptr.size; MOB.ptr.delete(e.pointerId); if (was >= 2) { e.stopImmediatePropagation(); if (MOB.ptr.size < 2) { MOB.pinch = null; MOB.k++; } } };
  addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  // a re-sent first touch may arrive after the finger has lifted: capturing it then must not throw
  if (MOB.on) { const sp = Element.prototype.setPointerCapture; Element.prototype.setPointerCapture = function (id) { try { return sp.call(this, id); } catch (e) { } }; }
  // no page zoom / pull-to-refresh / double-tap zoom while playing
  if (MOB.on) { for (const ev of ['gesturestart', 'gesturechange']) addEventListener(ev, e => e.preventDefault(), { passive: false }); addEventListener('touchmove', e => { if (e.touches.length > 1 || e.target === cv() || (e.target.closest && e.target.closest('#mCtl') && !e.target.closest('#mSheet'))) e.preventDefault(); }, { passive: false }); }
}
// the stick walks in its exact direction and strength (the keys W/A/S/D are pressed too, for vehicles and the other cameras)
{ const _mi = moveInput; moveInput = function () { const j = MOB.joy; if (MOB.on && j && j.l > 0.05 && !(typeof GAME !== 'undefined' && GAME.blocking())) return [j.x, j.z, Math.min(1, j.l)]; return _mi.apply(this, arguments); }; }
