// ===================== 止まらないように: シェーダーの下ごしらえ =====================
// The first time a kind of object is drawn, the browser has to build its shader program and draw state; that took a
// noticeable pause each time you reached a new place (the hill, the waterfall, the beach…). Right after the island is
// built, everything is drawn once into the off-screen buffer — all objects, no culling, the sun's shadow covering the
// whole island — so those pauses happen once while the game starts instead of while you walk.
const WARM = { t: null, n: 0 };
WARM.render = function () {
  if (!renderer || !composer || !scene || !camera || GAME.inside) return;
  try { SEE.patchWorld(); } catch (e) { console.warn('see world', e); }
  const t0 = performance.now(), saved = [], sun = typeof SKY !== 'undefined' && SKY.sun, sc = sun && sun.shadow && sun.shadow.camera;
  scene.traverse(o => { if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite || o.isGroup)) return; const s = [o, o.visible, o.frustumCulled, o.layers.mask, o.isInstancedMesh ? o.count : -1]; saved.push(s);
    o.visible = true; o.frustumCulled = false; o.layers.enable(0); if (o.isInstancedMesh && o.count === 0) o.count = 1; });
  const sv = sc ? [sc.left, sc.right, sc.top, sc.bottom, sc.near, sc.far] : null;
  const prevRT = renderer.getRenderTarget(), au = renderer.shadowMap.autoUpdate;
  try {
    if (sc) { sc.left = -420; sc.right = 420; sc.top = 420; sc.bottom = -420; sc.far = Math.max(sc.far, 900); sc.updateProjectionMatrix(); }
    renderer.shadowMap.autoUpdate = true; renderer.shadowMap.needsUpdate = true;
    renderer.setRenderTarget(composer.readBuffer); renderer.render(scene, camera);
  } catch (e) { console.warn('warm', e); }
  finally {
    renderer.setRenderTarget(prevRT); renderer.shadowMap.autoUpdate = au; renderer.shadowMap.needsUpdate = true;
    if (sc) { [sc.left, sc.right, sc.top, sc.bottom, sc.near, sc.far] = sv; sc.updateProjectionMatrix(); }
    for (const [o, v, f, m, c] of saved) { o.visible = v; o.frustumCulled = f; o.layers.mask = m; if (c >= 0) o.count = c; }
  }
  WARM.n++; WARM.ms = Math.round(performance.now() - t0);
};
WARM.later = function (ms = 400) { clearTimeout(WARM.t); WARM.t = setTimeout(() => { if (window.__manual) return;
  // the first time it takes a moment: say so, let the note paint, then do it
  const first = !WARM.n; let el = null; if (first) { el = document.createElement('div'); el.className = 'warmNote'; el.textContent = '🌱 島のしたく中…'; el.style.cssText = 'position:fixed;left:50%;bottom:22%;transform:translateX(-50%);padding:8px 16px;border-radius:999px;background:rgba(40,52,44,.78);color:#fff;font:600 14px "M PLUS Rounded 1c",sans-serif;z-index:60;pointer-events:none'; document.body.appendChild(el); }
  setTimeout(() => { try { WARM.render(); } catch (e) { } if (el) el.remove(); }, first ? 60 : 0); }, ms); };
{ const _b = GAME.begin; GAME.begin = function () { const r = _b.apply(this, arguments); try { SEE.patchWorld(); } catch (e) { } WARM.later(600); return r; }; }
{ const _rd = GAME.refreshDev; GAME.refreshDev = function () { const r = _rd.apply(this, arguments); if (GAME.p && WARM.n) WARM.later(800); return r; }; }

// indoors, cut-scenes and the title keep the wider lens they were framed for
{ const _ur = GAME.updateRoom; GAME.updateRoom = function () { CAM.fov(55); return _ur.apply(this, arguments); }; }
{ const _co = GAME.camOverride; GAME.camOverride = function () { const r = _co.apply(this, arguments); if (r) CAM.fov(55); return r; }; }
{ const _tc = GAME.titleCam; GAME.titleCam = function () { CAM.fov(55); return _tc.apply(this, arguments); }; }
