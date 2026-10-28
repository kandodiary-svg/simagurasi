// ===================== 商品（goods.js）: 島のお店にならぶもの =====================
// 形（shape）ごとに本物らしいモデルを作り（ペットボトル・缶・紙パック・箱・袋・トレー・弁当・野菜・魚…）、
// ラベルは canvas で描く（ブランドはすべて架空）。棚には InstancedMesh で並べ、1つずつ取れる（在庫が減る）。
// lighter shapes for products that are shown by the thousand: fewer segments on round things (small counts stay as they are)
const GSEG = n => (n === undefined ? n : (typeof GOODS !== 'undefined' && GOODS._lite) ? (n <= 6 ? n : Math.max(6, Math.round(n * 0.32))) : n <= 8 ? n : Math.max(8, Math.round(n * 0.6)));
class GCylG extends THREE.CylinderGeometry { constructor(rt, rb, h, rs = 32, hs, op, ts, tl) { super(rt, rb, h, GSEG(rs), hs, op, ts, tl); } }
class GSphG extends THREE.SphereGeometry { constructor(r, ws = 32, hs = 16, a, b, c, d) { super(r, GSEG(ws), GSEG(hs), a, b, c, d); } }
class GConeG extends THREE.ConeGeometry { constructor(r, h, rs = 32, hs, op, ts, tl) { super(r, h, GSEG(rs), hs, op, ts, tl); } }
class GLatheG extends THREE.LatheGeometry { constructor(pts, seg = 12, ps, pl) { super(pts, GSEG(seg), ps, pl); } }
class GTorusG extends THREE.TorusGeometry { constructor(r, t, rs = 12, ts = 48, arc) { super(r, t, GSEG(rs), GSEG(ts), arc); } }
const GOODS = { defs: [], byId: {}, built: {}, texC: {}, matC: {} };
GOODS.FONT = '"M PLUS Rounded 1c","Hiragino Maru Gothic ProN","Yu Gothic",sans-serif';
// ---------- canvas helpers ----------
GOODS.tex = function (key, w, h, draw) { if (GOODS.texC[key]) return GOODS.texC[key]; const [c, x] = cvs(w, h); draw(x, w, h); const t = toTex(c, false); t.anisotropy = 4; return (GOODS.texC[key] = t); };
GOODS.m = function (key, make) { return GOODS.matC[key] || (GOODS.matC[key] = make()); };
GOODS.std = (c, r = 0.55, m = 0, ex = {}) => GOODS.m('s' + c + r + m + JSON.stringify(ex), () => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, ex)));
GOODS.mapM = (tex, r = 0.5, m = 0, ex = {}) => new THREE.MeshStandardMaterial(Object.assign({ map: tex, roughness: r, metalness: m }, ex));
function gFit(x, txt, maxW, size, weight = 800) { let s = size; x.font = `${weight} ${s}px ${GOODS.FONT}`; while (s > 6 && x.measureText(txt).width > maxW) { s -= 1; x.font = `${weight} ${s}px ${GOODS.FONT}`; } return s; }
function gText(x, txt, cx, cy, maxW, size, col, weight = 800, stroke) { if (!txt) return; gFit(x, txt, maxW, size, weight); x.textAlign = 'center'; x.textBaseline = 'middle'; if (stroke) { x.lineWidth = Math.max(2, size / 7); x.strokeStyle = stroke; x.lineJoin = 'round'; x.strokeText(txt, cx, cy); } x.fillStyle = col; x.fillText(txt, cx, cy); }
function gVText(x, txt, cx, y0, y1, size, col, weight = 800, stroke) { const n = [...txt].length; if (!n) return; const step = Math.min(size * 1.05, (y1 - y0) / n), s = Math.min(size, step / 1.02); x.font = `${weight} ${s}px ${GOODS.FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; [...txt].forEach((ch, i) => { const y = y0 + step * (i + 0.5); if (stroke) { x.lineWidth = Math.max(2, s / 7); x.strokeStyle = stroke; x.strokeText(ch, cx, y); } x.fillStyle = col; x.fillText(ch, cx, y); }); }
function gRR(x, X, Y, W, H, r) { x.beginPath(); x.roundRect(X, Y, W, H, r); }
// small pictures used on packages (all drawn, nothing copied)
GOODS.emblem = function (x, k, cx, cy, s, c1 = '#3a8a3a', c2 = '#ffffff') {
  x.save(); x.translate(cx, cy); x.lineJoin = 'round'; x.lineCap = 'round';
  const leaf = (a, l, col) => { x.save(); x.rotate(a); x.fillStyle = col; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(l * 0.5, -l * 0.35, l, 0); x.quadraticCurveTo(l * 0.5, l * 0.35, 0, 0); x.fill(); x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = s * 0.03; x.beginPath(); x.moveTo(l * 0.1, 0); x.lineTo(l * 0.85, 0); x.stroke(); x.restore(); };
  const fruit = (col, r, hi = '#ffffff') => { const gr = x.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r); gr.addColorStop(0, hi); gr.addColorStop(0.25, col); gr.addColorStop(1, col); x.fillStyle = gr; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill(); };
  switch (k) {
    case 'leaf': leaf(-0.9, s * 0.9, c1); leaf(-0.2, s * 0.75, c1); break;
    case 'mikan': fruit('#f39a1e', s * 0.42, '#ffd27a'); leaf(-2.2, s * 0.4, '#3a8a3a'); x.fillStyle = '#5a7a2a'; x.beginPath(); x.arc(0, -s * 0.4, s * 0.05, 0, 7); x.fill(); break;
    case 'lemon': x.save(); x.scale(1.25, 1); fruit('#f2d630', s * 0.36, '#fff6a0'); x.restore(); leaf(-2.4, s * 0.34, '#3a8a3a'); break;
    case 'tomato': fruit('#e0342a', s * 0.4, '#ff9a80'); for (let i = 0; i < 5; i++) leaf(i * 1.256 - 1.57, s * 0.18, '#3a8a2a'); break;
    case 'drop': x.fillStyle = c1; x.beginPath(); x.moveTo(0, -s * 0.5); x.bezierCurveTo(s * 0.45, -s * 0.05, s * 0.32, s * 0.42, 0, s * 0.42); x.bezierCurveTo(-s * 0.32, s * 0.42, -s * 0.45, -s * 0.05, 0, -s * 0.5); x.fill(); x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.ellipse(-s * 0.1, s * 0.05, s * 0.06, s * 0.12, -0.4, 0, 7); x.fill(); break;
    case 'wave': x.strokeStyle = c1; x.lineWidth = s * 0.09; for (let k2 = 0; k2 < 3; k2++) { x.beginPath(); for (let i = 0; i <= 20; i++) { const px = -s * 0.5 + i * s / 20, py = s * (-0.2 + k2 * 0.22) + Math.sin(i / 20 * Math.PI * 2.5) * s * 0.07; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); } break;
    case 'fish': x.fillStyle = c1; x.beginPath(); x.ellipse(0, 0, s * 0.38, s * 0.17, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(s * 0.32, 0); x.lineTo(s * 0.55, -s * 0.16); x.lineTo(s * 0.55, s * 0.16); x.fill(); x.fillStyle = c2; x.beginPath(); x.arc(-s * 0.24, -s * 0.03, s * 0.04, 0, 7); x.fill(); break;
    case 'sun': x.fillStyle = c1; x.beginPath(); x.arc(0, 0, s * 0.24, 0, 7); x.fill(); x.strokeStyle = c1; x.lineWidth = s * 0.06; for (let i = 0; i < 10; i++) { const a = i * 0.628; x.beginPath(); x.moveTo(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32); x.lineTo(Math.cos(a) * s * 0.46, Math.sin(a) * s * 0.46); x.stroke(); } break;
    case 'star': x.fillStyle = c1; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.2 : s * 0.48, a = i * 0.628 - 1.57; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); break;
    case 'burst': x.fillStyle = c1; x.beginPath(); for (let i = 0; i < 24; i++) { const r = i % 2 ? s * 0.38 : s * 0.5, a = i * 0.2618; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); break;
    case 'heart': x.fillStyle = c1; x.beginPath(); x.moveTo(0, s * 0.38); x.bezierCurveTo(-s * 0.6, -s * 0.05, -s * 0.25, -s * 0.5, 0, -s * 0.18); x.bezierCurveTo(s * 0.25, -s * 0.5, s * 0.6, -s * 0.05, 0, s * 0.38); x.fill(); break;
    case 'flower': for (let i = 0; i < 5; i++) { x.fillStyle = c1; x.beginPath(); x.ellipse(Math.cos(i * 1.256) * s * 0.2, Math.sin(i * 1.256) * s * 0.2, s * 0.17, s * 0.12, i * 1.256, 0, 7); x.fill(); } x.fillStyle = '#f6d23a'; x.beginPath(); x.arc(0, 0, s * 0.1, 0, 7); x.fill(); break;
    case 'cup': x.fillStyle = c1; x.beginPath(); x.moveTo(-s * 0.3, -s * 0.15); x.lineTo(s * 0.25, -s * 0.15); x.lineTo(s * 0.2, s * 0.32); x.lineTo(-s * 0.25, s * 0.32); x.fill(); x.strokeStyle = c1; x.lineWidth = s * 0.07; x.beginPath(); x.arc(s * 0.3, s * 0.05, s * 0.12, -1.3, 1.3); x.stroke(); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = s * 0.04; for (const dx of [-0.12, 0.02]) { x.beginPath(); x.moveTo(s * dx, -s * 0.22); x.quadraticCurveTo(s * (dx + 0.08), -s * 0.32, s * dx, -s * 0.44); x.stroke(); } break;
    case 'cow': x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(0, 0, s * 0.42, s * 0.3, 0, 0, 7); x.fill(); x.fillStyle = '#222'; for (const [a, b, r] of [[-0.18, -0.08, 0.1], [0.16, 0.1, 0.12], [0.05, -0.18, 0.06]]) { x.beginPath(); x.arc(s * a, s * b, s * r, 0, 7); x.fill(); } break;
    case 'lighthouse': x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(-s * 0.12, s * 0.45); x.lineTo(-s * 0.07, -s * 0.25); x.lineTo(s * 0.07, -s * 0.25); x.lineTo(s * 0.12, s * 0.45); x.fill(); x.fillStyle = '#d83a3a'; x.fillRect(-s * 0.1, s * 0.05, s * 0.2, s * 0.1); x.fillRect(-s * 0.08, -s * 0.3, s * 0.16, s * 0.08); x.fillStyle = '#f6d23a'; x.fillRect(-s * 0.05, -s * 0.38, s * 0.1, s * 0.08); x.strokeStyle = 'rgba(246,210,58,.7)'; x.lineWidth = s * 0.03; x.beginPath(); x.moveTo(s * 0.06, -s * 0.34); x.lineTo(s * 0.45, -s * 0.45); x.moveTo(s * 0.06, -s * 0.34); x.lineTo(s * 0.45, -s * 0.22); x.stroke(); break;
    case 'tako': x.fillStyle = c1; x.beginPath(); x.ellipse(0, -s * 0.12, s * 0.26, s * 0.24, 0, 0, 7); x.fill(); x.lineWidth = s * 0.08; x.strokeStyle = c1; for (let i = 0; i < 5; i++) { const a = -0.5 + i * 0.25; x.beginPath(); x.moveTo(Math.sin(a) * s * 0.2, s * 0.05); x.quadraticCurveTo(Math.sin(a) * s * 0.45, s * 0.3, Math.sin(a) * s * 0.3 + (i - 2) * s * 0.05, s * 0.42); x.stroke(); } x.fillStyle = '#fff'; for (const sx of [-1, 1]) { x.beginPath(); x.arc(sx * s * 0.09, -s * 0.12, s * 0.05, 0, 7); x.fill(); } break;
    case 'rice': x.fillStyle = c1; for (let i = 0; i < 7; i++) { x.save(); x.rotate(-0.6 + i * 0.2); x.beginPath(); x.ellipse(0, -s * 0.28, s * 0.05, s * 0.09, 0, 0, 7); x.fill(); x.restore(); } x.strokeStyle = c1; x.lineWidth = s * 0.04; x.beginPath(); x.moveTo(0, -s * 0.2); x.quadraticCurveTo(s * 0.05, s * 0.2, -s * 0.05, s * 0.45); x.stroke(); break;
    case 'mountain': x.fillStyle = c1; x.beginPath(); x.moveTo(-s * 0.5, s * 0.3); x.lineTo(-s * 0.12, -s * 0.3); x.lineTo(s * 0.08, 0); x.lineTo(s * 0.22, -s * 0.15); x.lineTo(s * 0.5, s * 0.3); x.fill(); x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(-s * 0.21, -s * 0.15); x.lineTo(-s * 0.12, -s * 0.3); x.lineTo(-s * 0.03, -s * 0.15); x.fill(); break;
    case 'bubble': for (const [a, b, r] of [[-0.2, 0.15, 0.16], [0.15, -0.05, 0.12], [0.02, -0.3, 0.08], [0.25, 0.25, 0.07]]) { x.strokeStyle = c1; x.lineWidth = s * 0.04; x.beginPath(); x.arc(s * a, s * b, s * r, 0, 7); x.stroke(); } break;
    case 'bean': x.fillStyle = c1; for (const [a, b] of [[-0.18, 0.05], [0.02, -0.08], [0.2, 0.06]]) { x.beginPath(); x.ellipse(s * a, s * b, s * 0.15, s * 0.11, a * 2, 0, 7); x.fill(); } x.fillStyle = 'rgba(255,255,255,.5)'; for (const [a, b] of [[-0.2, 0.02], [0, -0.11], [0.18, 0.03]]) { x.beginPath(); x.ellipse(s * a, s * b, s * 0.04, s * 0.02, 0, 0, 7); x.fill(); } break;
    case 'grape': x.fillStyle = c1; for (const [a, b] of [[-0.15, -0.2], [0, -0.2], [0.15, -0.2], [-0.08, -0.05], [0.08, -0.05], [-0.15, 0.1], [0, 0.1], [0.15, 0.1], [0, 0.25]]) { x.beginPath(); x.arc(s * a, s * b, s * 0.08, 0, 7); x.fill(); } leaf(-1.2, s * 0.3, '#3a8a3a'); break;
    case 'bear': x.fillStyle = c1; for (const sx of [-1, 1]) { x.beginPath(); x.arc(sx * s * 0.2, -s * 0.22, s * 0.1, 0, 7); x.fill(); } x.beginPath(); x.arc(0, 0, s * 0.3, 0, 7); x.fill(); x.fillStyle = '#f6e2c8'; x.beginPath(); x.ellipse(0, s * 0.08, s * 0.12, s * 0.09, 0, 0, 7); x.fill(); x.fillStyle = '#222'; for (const sx of [-1, 1]) { x.beginPath(); x.arc(sx * s * 0.1, -s * 0.05, s * 0.03, 0, 7); x.fill(); } x.beginPath(); x.arc(0, s * 0.05, s * 0.035, 0, 7); x.fill(); break;
    default: break;
  }
  x.restore();
};
// one function draws every kind of package face
// A: { bg, bg2, fg, band, t (title), s (sub), em (emblem), ec (emblem colour), st (style), v (vertical title), price }
GOODS.drawLabel = function (x, W, H, A) {
  const st = A.st || 'band', fg = A.fg || '#ffffff';
  if (W / H > 1.7 && !A.noWrap && ['clean', 'jp', 'kraft', 'book', 'mag', 'pop', 'tile'].includes(st)) { // a wrap-around label: two panels, one centred on the front (u = .5)
    const B = Object.assign({}, A, { noWrap: true }); for (const [ox, cx0, cw] of [[W / 4, W / 4, W / 2], [-W / 4, 0, W / 4], [W * 3 / 4, W * 3 / 4, W / 4]]) { x.save(); x.beginPath(); x.rect(cx0, 0, cw, H); x.clip(); x.translate(ox, 0); GOODS.drawLabel(x, W / 2, H, B); x.restore(); } return; }
  const fill = (c1, c2) => { if (c2) { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c1); gr.addColorStop(1, c2); x.fillStyle = gr; } else x.fillStyle = c1; x.fillRect(0, 0, W, H); };
  fill(A.bg || '#ffffff', A.bg2);
  const cx = W / 2, cy = H / 2;
  if (st === 'band') { // a colour band across the middle with the name (drinks, cans)
    x.fillStyle = A.band || 'rgba(255,255,255,.88)'; x.fillRect(0, H * 0.3, W, H * 0.4);
    // the front of a bottle is the middle of the label (u = .5): name there, pictures to the sides, a small name on the back
    if (A.em) { for (const px of [W * 0.2, W * 0.8]) GOODS.emblem(x, A.em, px, cy, H * 0.34, A.ec || '#3a8a3a'); }
    gText(x, A.t, W * 0.5, cy - H * 0.04, W * 0.34, H * 0.2, A.tc || '#1a3a2a'); for (const bx of [0, W]) gText(x, A.t, bx, cy - H * 0.02, W * 0.22, H * 0.11, A.tc || '#1a3a2a');
    gText(x, A.s, W * 0.5, cy + H * 0.13, W * 0.34, H * 0.08, A.tc || '#1a3a2a', 700);
    gText(x, A.brand || '', W * 0.5, H * 0.17, W * 0.34, H * 0.09, fg, 700);
  } else if (st === 'can') { // metallic can wrap: big title twice
    x.fillStyle = A.band || 'rgba(255,255,255,.2)'; x.fillRect(0, H * 0.08, W, H * 0.06); x.fillRect(0, H * 0.86, W, H * 0.06);
    for (const px of [W * 0.5, 0, W]) { if (A.em) GOODS.emblem(x, A.em, px, cy + H * 0.14, H * 0.4, A.ec || fg); gText(x, A.t, px, H * 0.32, W * 0.44, H * 0.2, fg, 900, A.stroke); }
    for (const px of [W * 0.25, W * 0.75]) gText(x, A.s, px, H * 0.62, W * 0.22, H * 0.08, fg, 700);
  } else if (st === 'pop') { // bright snack bag / toy box: burst, big title
    x.fillStyle = A.band || 'rgba(255,255,255,.25)'; for (let i = -H; i < W; i += H * 0.22) { x.beginPath(); x.moveTo(i, H); x.lineTo(i + H * 0.11, H); x.lineTo(i + H * 0.11 + H, 0); x.lineTo(i + H, 0); x.fill(); }
    GOODS.emblem(x, 'burst', W * 0.5, H * 0.62, Math.min(W, H) * 0.62, A.ec || '#ffd23a');
    if (A.em) GOODS.emblem(x, A.em, W * 0.5, H * 0.64, Math.min(W, H) * 0.42, A.ec2 || '#e84a2a');
    gText(x, A.brand || '', cx, H * 0.1, W * 0.8, H * 0.07, fg, 700);
    gText(x, A.t, cx, H * 0.27, W * 0.9, Math.min(W * 0.2, H * 0.16), fg, 900, A.stroke || 'rgba(0,0,0,.35)');
    gText(x, A.s, cx, H * 0.91, W * 0.85, H * 0.07, fg, 800, 'rgba(0,0,0,.3)');
  } else if (st === 'clean') { // white with a colour stripe (dairy, daily goods)
    x.fillStyle = A.band || '#2a7ad0'; x.fillRect(0, H * 0.68, W, H * 0.32); x.fillRect(0, 0, W, H * 0.06);
    if (A.em) GOODS.emblem(x, A.em, cx, H * 0.48, Math.min(W, H) * 0.28, A.ec || A.band || '#2a7ad0');
    gText(x, A.brand || '', cx, H * 0.13, W * 0.8, H * 0.06, A.band || '#2a7ad0', 700);
    gText(x, A.t, cx, H * 0.26, W * 0.9, Math.min(W * 0.17, H * 0.12), A.tc || '#1a2a3a', 900);
    gText(x, A.s, cx, H * 0.84, W * 0.85, H * 0.08, '#ffffff', 800);
  } else if (st === 'jp') { // washi paper, vertical title, red seal (soy sauce, sweets, souvenirs)
    x.fillStyle = 'rgba(0,0,0,.035)'; for (let i = 0; i < 400; i++) x.fillRect((i * 97) % W, (i * 61) % H, 1 + (i % 3), 1);
    x.strokeStyle = A.band || '#a8322a'; x.lineWidth = Math.max(2, W * 0.02); x.strokeRect(W * 0.06, H * 0.04, W * 0.88, H * 0.92);
    gVText(x, A.t, cx, H * 0.1, H * 0.78, Math.min(W * 0.36, H * 0.16), A.tc || '#1a1a1a', 900);
    x.fillStyle = A.band || '#c8322a'; gRR(x, W * 0.62, H * 0.76, W * 0.26, W * 0.26, 3); x.fill(); gText(x, A.seal || '島', W * 0.75, H * 0.76 + W * 0.13, W * 0.22, W * 0.18, '#ffffff', 900);
    gText(x, A.s, cx, H * 0.9, W * 0.82, H * 0.05, A.tc || '#3a3a3a', 700);
    if (A.em) GOODS.emblem(x, A.em, W * 0.24, H * 0.82, W * 0.24, A.ec || '#c8322a');
  } else if (st === 'kraft') { // brown paper with a stamped label (farm goods, bakery)
    x.fillStyle = 'rgba(80,50,20,.08)'; for (let i = 0; i < 600; i++) x.fillRect((i * 53) % W, (i * 89) % H, 2, 1);
    x.fillStyle = A.band || '#f6efe0'; gRR(x, W * 0.12, H * 0.22, W * 0.76, H * 0.56, 6); x.fill(); x.strokeStyle = A.tc || '#5a3a1a'; x.lineWidth = 2; gRR(x, W * 0.15, H * 0.25, W * 0.7, H * 0.5, 4); x.stroke();
    if (A.em) GOODS.emblem(x, A.em, cx, H * 0.4, Math.min(W, H) * 0.22, A.ec || '#3a8a3a');
    gText(x, A.t, cx, H * 0.58, W * 0.64, Math.min(W * 0.14, H * 0.1), A.tc || '#4a2a10', 900);
    gText(x, A.s, cx, H * 0.69, W * 0.6, H * 0.05, A.tc || '#4a2a10', 700);
  } else if (st === 'book') { // cover: picture area + title block
    const sky = x.createLinearGradient(0, 0, 0, H * 0.7); sky.addColorStop(0, A.bg2 || '#9fd2ff'); sky.addColorStop(1, A.bg || '#f6e6c8'); x.fillStyle = sky; x.fillRect(0, 0, W, H);
    if (A.em) GOODS.emblem(x, A.em, cx, H * 0.55, Math.min(W, H) * 0.5, A.ec || '#2a6ab0');
    x.fillStyle = A.band || 'rgba(255,255,255,.85)'; x.fillRect(0, H * 0.08, W, H * 0.22); gText(x, A.t, cx, H * 0.19, W * 0.9, H * 0.12, A.tc || '#1a2a3a', 900);
    gText(x, A.s, cx, H * 0.9, W * 0.85, H * 0.05, A.fg || '#1a2a3a', 700);
  } else if (st === 'mag') { // magazine: logo on top, photo, cover lines
    const gr = x.createLinearGradient(0, H * 0.2, 0, H); gr.addColorStop(0, A.bg2 || '#7ab8e0'); gr.addColorStop(1, A.bg || '#2a5a8a'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    if (A.em) GOODS.emblem(x, A.em, cx, H * 0.6, Math.min(W, H) * 0.6, A.ec || '#ffffff');
    gText(x, A.t, cx, H * 0.11, W * 0.94, H * 0.13, A.tc || '#ffffff', 900, 'rgba(0,0,0,.4)');
    for (let i = 0; i < 3; i++) { x.fillStyle = ['#ffd23a', '#ffffff', '#ff7a6a'][i]; x.fillRect(W * 0.06, H * (0.3 + i * 0.08), W * (0.3 + (i % 2) * 0.15), H * 0.035); }
    gText(x, A.s, cx, H * 0.92, W * 0.9, H * 0.05, '#ffffff', 800, 'rgba(0,0,0,.4)');
  } else if (st === 'tile') { // repeating pattern (tenugui, towels, wrapping paper)
    x.fillStyle = A.fg || '#ffffff'; const n = A.n || 4; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) GOODS.emblem(x, A.em || 'wave', (i + 0.5) * W / n + (j % 2) * W / n / 2, (j + 0.5) * H / n, Math.min(W, H) / n * 0.8, A.ec || '#ffffff');
    if (A.t) { x.fillStyle = A.band || 'rgba(255,255,255,.85)'; x.fillRect(W * 0.2, H * 0.4, W * 0.6, H * 0.2); gText(x, A.t, cx, cy, W * 0.55, H * 0.12, A.tc || '#1a1a1a', 900); }
  } else if (st === 'plain') { /* only the colour */ }
  if (A.price) { x.fillStyle = '#e8322a'; gRR(x, W * 0.66, H * 0.02, W * 0.32, H * 0.12, 4); x.fill(); gText(x, A.price, W * 0.82, H * 0.08, W * 0.3, H * 0.08, '#ffffff', 900); }
};
GOODS.label = (P, w = 256, h = 128, key = '') => GOODS.tex('L' + P.id + key + w + 'x' + h, w, h, (x, W, H) => GOODS.drawLabel(x, W, H, P.art || {}));
// a picture painted on the top of a container (bento, sashimi, cake…) — kinds of food, seen from above
GOODS.foodTop = function (k, w = 160, h = 120) {
  return GOODS.tex('F' + k + w + 'x' + h, w, h, (x, W, H) => {
    const R = mulberry(hashStr(k)), blob = (cx, cy, rx, ry, col, a = 0) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, a, 0, 7); x.fill(); };
    const rice = (X, Y, Ww, Hh) => { x.fillStyle = '#f8f6ee'; x.fillRect(X, Y, Ww, Hh); for (let i = 0; i < Ww * Hh / 18; i++) { x.fillStyle = `rgba(200,195,180,${0.3 + R() * 0.3})`; x.fillRect(X + R() * Ww, Y + R() * Hh, 2, 1); } };
    switch (k) {
      case 'makunouchi': x.fillStyle = '#1a1a1c'; x.fillRect(0, 0, W, H); rice(W * 0.04, H * 0.06, W * 0.46, H * 0.88); blob(W * 0.27, H * 0.5, W * 0.05, W * 0.05, '#c8322a'); x.fillStyle = '#e8d8c0'; x.fillRect(W * 0.52, H * 0.06, W * 0.44, H * 0.4); blob(W * 0.62, H * 0.2, W * 0.08, H * 0.1, '#e8b05a'); blob(W * 0.82, H * 0.22, W * 0.08, H * 0.1, '#f2d24a'); blob(W * 0.62, H * 0.66, W * 0.09, H * 0.12, '#b0603a'); blob(W * 0.84, H * 0.66, W * 0.08, H * 0.12, '#5a9a3a'); blob(W * 0.74, H * 0.86, W * 0.12, H * 0.07, '#e88a8a'); break;
      case 'karaage': x.fillStyle = '#1a1a1c'; x.fillRect(0, 0, W, H); rice(W * 0.04, H * 0.06, W * 0.5, H * 0.88); for (let i = 0; i < 5; i++) blob(W * (0.66 + (i % 2) * 0.16), H * (0.22 + Math.floor(i / 2) * 0.28), W * 0.09, H * 0.12, i % 2 ? '#b8702a' : '#c8803a', R()); blob(W * 0.78, H * 0.88, W * 0.12, H * 0.06, '#7ac04a'); blob(W * 0.2, H * 0.5, W * 0.04, W * 0.04, '#d84a3a'); break;
      case 'sabazushi': x.fillStyle = '#2a2a2a'; x.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#c8d4dc' : '#b8c8d0'; x.fillRect(W * (0.04 + i * 0.155), H * 0.25, W * 0.15, H * 0.5); x.fillStyle = '#5a6a7a'; x.fillRect(W * (0.04 + i * 0.155), H * 0.25, W * 0.15, H * 0.08); } break;
      case 'inari': x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, W, H); for (let i = 0; i < 4; i++) blob(W * (0.2 + (i % 2) * 0.55), H * (0.3 + Math.floor(i / 2) * 0.42), W * 0.2, H * 0.18, '#c8883a'); blob(W * 0.5, H * 0.5, W * 0.05, H * 0.08, '#e86a8a'); break;
      case 'korokke': x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, W, H); for (let i = 0; i < 2; i++) { blob(W * (0.3 + i * 0.4), H * 0.5, W * 0.18, H * 0.3, '#c88a3a'); for (let k2 = 0; k2 < 40; k2++) blob(W * (0.3 + i * 0.4) + (R() - 0.5) * W * 0.3, H * 0.5 + (R() - 0.5) * H * 0.5, 2, 2, '#e8b05a'); } break;
      case 'yakisoba': x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, W, H); x.strokeStyle = '#a86a2a'; x.lineWidth = 3; for (let i = 0; i < 70; i++) { x.beginPath(); const a = R() * W, b = R() * H; x.moveTo(a, b); x.quadraticCurveTo(a + 10, b + R() * 20 - 10, a + R() * 30 - 15, b + R() * 30 - 15); x.stroke(); } for (let i = 0; i < 10; i++) blob(R() * W, R() * H, 6, 3, '#3a8a3a', R() * 3); blob(W * 0.7, H * 0.3, 10, 8, '#e84a6a'); break;
      case 'tamagoyaki': x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, W, H); for (let i = 0; i < 5; i++) { x.fillStyle = '#f2d24a'; x.fillRect(W * (0.08 + i * 0.17), H * 0.25, W * 0.15, H * 0.5); x.strokeStyle = '#e0b030'; x.lineWidth = 2; for (let k2 = 1; k2 < 4; k2++) { x.beginPath(); x.arc(W * (0.155 + i * 0.17), H * 0.5, k2 * 6, 0, 7); x.stroke(); } } break;
      case 'sashimi': x.fillStyle = '#1a1a1c'; x.fillRect(0, 0, W, H); blob(W * 0.5, H * 0.5, W * 0.46, H * 0.42, '#e8ece0'); for (let i = 0; i < 5; i++) { x.fillStyle = '#f08a6a'; x.save(); x.translate(W * (0.22 + i * 0.05), H * 0.4); x.rotate(-0.3); x.fillRect(0, 0, W * 0.12, H * 0.2); x.restore(); } for (let i = 0; i < 4; i++) { x.fillStyle = '#f4ece8'; x.save(); x.translate(W * (0.55 + i * 0.05), H * 0.32); x.rotate(0.2); x.fillRect(0, 0, W * 0.1, H * 0.22); x.restore(); } for (let i = 0; i < 3; i++) { x.fillStyle = '#c83a3a'; x.fillRect(W * (0.4 + i * 0.08), H * 0.68, W * 0.07, H * 0.14); } blob(W * 0.82, H * 0.7, W * 0.05, H * 0.05, '#7ac04a'); break;
      case 'shirasu': x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, W, H); for (let i = 0; i < 400; i++) { x.strokeStyle = `rgba(220,215,200,${0.6 + R() * 0.4})`; x.lineWidth = 1.5; const a = R() * W, b = R() * H, an = R() * 6; x.beginPath(); x.moveTo(a, b); x.lineTo(a + Math.cos(an) * 7, b + Math.sin(an) * 7); x.stroke(); } break;
      case 'kaki_oyster': x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { blob(W * (0.15 + (i % 4) * 0.23), H * (0.3 + Math.floor(i / 4) * 0.4), W * 0.1, H * 0.14, '#d8d0c0'); blob(W * (0.15 + (i % 4) * 0.23), H * (0.3 + Math.floor(i / 4) * 0.4), W * 0.06, H * 0.09, '#8a8a80'); } break;
      case 'anago': x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) { x.fillStyle = '#8a4a1a'; gRR(x, W * 0.08, H * (0.12 + i * 0.28), W * 0.84, H * 0.22, 8); x.fill(); x.strokeStyle = '#5a2a0a'; for (let k2 = 0; k2 < 10; k2++) { x.beginPath(); x.moveTo(W * (0.12 + k2 * 0.08), H * (0.14 + i * 0.28)); x.lineTo(W * (0.14 + k2 * 0.08), H * (0.32 + i * 0.28)); x.stroke(); } } break;
      case 'shiitake': x.fillStyle = '#f4f4f0'; x.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { const cx = W * (0.2 + (i % 3) * 0.3), cy = H * (0.3 + Math.floor(i / 3) * 0.4); blob(cx, cy, W * 0.13, H * 0.17, '#7a4a2a'); x.strokeStyle = 'rgba(255,240,220,.6)'; x.lineWidth = 2; for (let k2 = 0; k2 < 4; k2++) { x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(k2 * 1.6) * 12, cy + Math.sin(k2 * 1.6) * 12); x.stroke(); } } break;
      case 'cake_short': x.fillStyle = '#fbf6ee'; x.fillRect(0, 0, W, H); blob(W * 0.5, H * 0.5, W * 0.12, H * 0.14, '#e83a4a'); break;
      case 'cheese': x.fillStyle = '#f0d890'; x.fillRect(0, 0, W, H); x.fillStyle = '#c8903a'; x.fillRect(0, 0, W, H * 0.1); break;
      case 'choco': x.fillStyle = '#5a321a'; x.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { x.strokeStyle = '#7a4a2a'; x.beginPath(); x.moveTo(0, H * i / 6); x.lineTo(W, H * i / 6 + 8); x.stroke(); } break;
      case 'pudding': x.fillStyle = '#f2c860'; x.fillRect(0, 0, W, H); blob(W * 0.5, H * 0.5, W * 0.3, H * 0.3, '#8a4a1a'); break;
      case 'curry': x.fillStyle = '#f8f6f0'; x.fillRect(0, 0, W, H); blob(W * 0.5, H * 0.5, W * 0.46, H * 0.44, '#ffffff'); rice(W * 0.12, H * 0.2, W * 0.36, H * 0.6); blob(W * 0.66, H * 0.5, W * 0.26, H * 0.36, '#a8681a'); for (let i = 0; i < 6; i++) blob(W * (0.58 + R() * 0.18), H * (0.3 + R() * 0.4), 6, 5, ['#e88a3a', '#f2d29a', '#8a5a2a'][i % 3]); break;
      case 'napolitan': x.fillStyle = '#f8f6f0'; x.fillRect(0, 0, W, H); blob(W * 0.5, H * 0.5, W * 0.46, H * 0.44, '#ffffff'); x.strokeStyle = '#d8582a'; x.lineWidth = 3; for (let i = 0; i < 80; i++) { x.beginPath(); const a = W * 0.2 + R() * W * 0.6, b = H * 0.2 + R() * H * 0.6; x.moveTo(a, b); x.quadraticCurveTo(a + 12, b + R() * 16 - 8, a + R() * 24 - 12, b + R() * 24 - 12); x.stroke(); } for (let i = 0; i < 6; i++) blob(W * (0.3 + R() * 0.4), H * (0.3 + R() * 0.4), 5, 4, '#3a9a3a'); break;
      case 'sand': x.fillStyle = '#f6eed6'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2d24a'; x.fillRect(0, H * 0.4, W, H * 0.25); break;
      default: x.fillStyle = '#e8e0d0'; x.fillRect(0, 0, W, H);
    }
  });
};
// ---------- geometry helpers (all add a mesh to a group; origin = bottom centre, front = +z) ----------
const GX = {};
GX.add = (g, geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); g.add(o); return o; };
GX.box = (g, w, h, d, m, x = 0, y = 0, z = 0, ry = 0) => GX.add(g, new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z, 0, ry);
GX.rbox = (g, w, h, d, r, m, x = 0, y = 0, z = 0, ry = 0, seg = 1) => GX.add(g, new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)), m, x, y + h / 2, z, 0, ry);
GX.cyl = (g, rt, rb, h, m, x = 0, y = 0, z = 0, seg = 20, open = false, ts = Math.PI) => GX.add(g, new GCylG(rt, rb, h, seg, 1, open, ts), m, x, y + h / 2, z);
GX.sph = (g, r, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, seg = 14) => GX.add(g, new GSphG(r, seg, Math.max(6, Math.round(seg * 0.7))), m, x, y, z, 0, 0, 0, sx, sy, sz);
GX.lathe = (g, pts, m, x = 0, y = 0, z = 0, seg = 24) => GX.add(g, new GLatheG(pts.map(p => new THREE.Vector2(p[0], p[1])), seg, Math.PI, Math.PI * 2), m, x, y, z);
GX.cap = (g, r, l, m, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => GX.add(g, new THREE.CapsuleGeometry(r, l, 3, 8), m, x, y, z, rx, ry, rz, sx, sy, sz);
GX.ext = (g, shape, depth, m, bev = 0.002) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 10 }); geo.translate(0, 0, -depth / 2); // caps get 0..1 UVs from the shape's bounds
  geo.computeBoundingBox(); const bb = geo.boundingBox, uv = geo.attributes.uv, pos = geo.attributes.position, nrm = geo.attributes.normal; for (let i = 0; i < uv.count; i++) { if (Math.abs(nrm.getZ(i)) > 0.7) uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y)); }
  return GX.add(g, geo, m); };
// ---------- turn a built group into one geometry with material groups (for instancing & thumbnails) ----------
GOODS.bake = function (grp) {
  grp.updateMatrixWorld(true); const byMat = new Map(), add = (m, geo) => { if (!byMat.has(m)) byMat.set(m, []); byMat.get(m).push(geo); };
  grp.traverseVisible(o => { if (!o.isMesh) return; let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); // hidden parts (a hat taken off) are left out
    for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
    if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    if (!geo.attributes.normal) geo.computeVertexNormals();
    if (Array.isArray(o.material)) { const grs = geo.groups.length ? geo.groups : [{ start: 0, count: geo.attributes.position.count, materialIndex: 0 }];
      for (const gr of grs) { const part = new THREE.BufferGeometry(); for (const k of ['position', 'normal', 'uv']) { const a = geo.attributes[k]; part.setAttribute(k, new THREE.Float32BufferAttribute(a.array.slice(gr.start * a.itemSize, (gr.start + gr.count) * a.itemSize), a.itemSize)); } add(o.material[gr.materialIndex], part); } }
    else { geo.clearGroups(); add(o.material, geo); } });
  const mats = [], parts = []; for (const [m, list] of byMat) { for (const g2 of list) for (const k of ['position', 'normal', 'uv']) { const a = g2.attributes[k]; if (!(a.array instanceof Float32Array) || a.normalized) g2.setAttribute(k, new THREE.Float32BufferAttribute(Array.from(a.array), a.itemSize)); }
    const mg = list.length > 1 ? mergeGeometries(list, false) : list[0]; if (!mg) { console.warn('goods bake: merge failed', list.map(g2 => Object.keys(g2.attributes).join('/') + (g2.index ? 'I' : ''))); continue; } mats.push(m); parts.push(mg); }
  if (!parts.length) { parts.push(new THREE.BoxGeometry(0.08, 0.08, 0.08).toNonIndexed().translate(0, 0.04, 0)); mats.push(GOODS.mats().card); }
  const geo = mergeGeometries(parts, true); geo.computeBoundingBox(); const bb = geo.boundingBox;
  return { geo, mats, w: bb.max.x - bb.min.x, h: bb.max.y - bb.min.y, d: bb.max.z - bb.min.z, bb };
};
// ---------- shared materials ----------
GOODS.M = {};
GOODS.mats = function () { if (GOODS.M.ok) return GOODS.M; const S = GOODS.std; Object.assign(GOODS.M, { ok: true,
  white: S('#f6f6f2', 0.5), foam: S('#f4f4ee', 0.85), black: S('#1c1c1e', 0.35), capW: S('#f8f8f4', 0.35), capR: S('#d8322a', 0.35), capB: S('#2a5ab0', 0.35), capG: S('#2f8a4a', 0.35), capY: S('#f2c230', 0.35), capO: S('#f08a1a', 0.35), capK: S('#2a2a2a', 0.35),
  silver: S('#d0d4d8', 0.25, 0.85), gold: S('#d8b060', 0.3, 0.8), alu: S('#c8ccd0', 0.35, 0.7), kraft: S('#c8a070', 0.85), card: S('#f2ecdf', 0.8), wood: S('#b88a5a', 0.6), clearPlastic: S('#e8f2f6', 0.08, 0, { transparent: true, opacity: 0.28, depthWrite: false }),
  ice: S('#eef6fa', 0.25), leaf: S('#4f9a3a', 0.6), leafD: S('#2f6a2a', 0.6), straw: S('#e8cf8a', 0.85), terracotta: S('#c0683a', 0.85), soil: S('#4a3424', 1), rice: S('#f8f6ee', 0.7), nori: S('#1f2a1e', 0.5) }); return GOODS.M; };
// a material for a product's printed face (label), cached per product
GOODS.lab = (P, w = 256, h = 128, ex = {}, key = '') => GOODS.m('lab' + P.id + key + w + h, () => GOODS.mapM(GOODS.label(P, w, h, key), ex.r !== undefined ? ex.r : 0.45, ex.m || 0));
GOODS.col = (c, r = 0.55, m = 0) => GOODS.std(c, r, m);
// ---------- shapes ----------
GOODS.SH = {};
const GS = GOODS.SH;
// drinks
GS.pet = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), h = o.h || 0.205, r = o.r || 0.033, k = h / 0.205;
  const liq = GOODS.col(o.liq || '#c8a050', 0.12), body = [[0, 0.002], [r * 0.7, 0], [r * 0.96, 0.006], [r, 0.02], [r * 0.985, 0.04 * k], [r, 0.047 * k], [r * 0.95, 0.05 * k], [r * 0.95, 0.138 * k], [r, 0.141 * k], [r, 0.15 * k], [r * 0.93, 0.168 * k], [r * 0.62, 0.184 * k], [0.0135, h - 0.022], [0.0135, h - 0.018]];   // thinner under the label so it never pokes through
  GX.lathe(g, body, liq); GX.cyl(g, r * 1.012, r * 1.012, 0.088 * k, GOODS.lab(P, 256, 128), 0, 0.05 * k, 0, 28, true);
  GX.cyl(g, 0.0148, 0.0148, 0.019, M[o.cap || 'capW'], 0, h - 0.019, 0, 16); GX.cyl(g, 0.0165, 0.0165, 0.003, M[o.cap || 'capW'], 0, h - 0.022, 0, 16); return g; };
GS.pet2l = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), h = o.h || 0.31, r = o.r || 0.052; const liq = GOODS.col(o.liq || '#c8a050', 0.12);
  GX.lathe(g, [[0, 0.002], [r * 0.75, 0], [r, 0.015], [r, 0.04], [r * 0.95, 0.06], [r, 0.085], [r * 0.94, 0.09], [r * 0.94, 0.21], [r, 0.215], [r, 0.22], [r * 0.9, 0.245], [r * 0.5, 0.275], [0.016, h - 0.022], [0.016, h - 0.02]], liq, 0, 0, 0, 12);
  GX.cyl(g, r * 1.01, r * 1.01, 0.12, GOODS.lab(P, 256, 128), 0, 0.09, 0, 12, true); GX.cyl(g, 0.0175, 0.0175, 0.022, M[o.cap || 'capW'], 0, h - 0.022, 0, 16); return g; };
GS.can = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), h = o.h || 0.122, r = o.r || 0.033;
  GX.lathe(g, [[0, 0.004], [r * 0.82, 0], [r * 0.95, 0.004], [r, 0.012], [r * 0.95, 0.014], [r * 0.95, h - 0.016], [r, h - 0.013], [r * 0.9, h - 0.004], [r * 0.86, h - 0.001], [0, h - 0.002]], M.alu, 0, 0, 0, 24);
  GX.cyl(g, r * 1.004, r * 1.004, h - 0.026, GOODS.lab(P, 256, 128, { r: 0.3, m: 0.45 }), 0, 0.012, 0, 28, true);
  GX.cyl(g, 0.008, 0.008, 0.002, M.alu, 0.012, h - 0.003, 0, 10); return g; };
GS.glass = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), h = o.h || 0.24, r = o.r || 0.035, nk = o.neck || 0.4;
  const gl = GOODS.col(o.glass || '#3a5a2a', 0.08), y0 = h * (1 - nk) * 0.12, y1 = y0 + (h * (1 - nk)) * 0.62; GX.lathe(g, [[0, 0.003], [r * 0.85, 0], [r, 0.01], [r, y0 - 0.002], [r * 0.95, y0], [r * 0.95, y1], [r, y1 + 0.002], [r, h * (1 - nk) - 0.02], [r * 0.9, h * (1 - nk)], [r * 0.4, h * (1 - nk * 0.55)], [0.012, h - 0.02], [0.012, h - 0.015]], gl, 0, 0, 0, 22);
  GX.cyl(g, r * 1.01, r * 1.01, (h * (1 - nk)) * 0.62, GOODS.lab(P, 256, 128), 0, h * (1 - nk) * 0.12, 0, 24, true); GX.cyl(g, 0.0135, 0.0135, 0.02, M[o.cap || 'capR'], 0, h - 0.02, 0, 14);
  if (o.ramune) { GX.sph(g, 0.009, GOODS.col('#bfe8ff', 0.05), 0, h - 0.045, 0); } return g; };
GS.carton = (P, o) => { const g = new THREE.Group(), w = o.w || 0.07, h = o.h || 0.195, d = o.d || w, L = GOODS.lab(P, 128, 256, {}, 'v'), side = GOODS.col((P.art && P.art.bg) || '#ffffff', 0.6); const bh = h - w * 0.36;
  GX.add(g, new THREE.BoxGeometry(w, bh, d), [L, L, side, side, L, L], 0, bh / 2, 0);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(0, w * 0.3); sh.lineTo(w / 2, 0); sh.closePath(); const roof = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }); roof.translate(0, 0, -d / 2); roof.rotateY(Math.PI / 2); GX.add(g, roof, side, 0, bh, 0);
  GX.box(g, 0.006, w * 0.06, d, side, 0, bh + w * 0.29, 0); return g; };
GS.cartonS = (P, o) => { const g = new THREE.Group(), w = o.w || 0.052, h = o.h || 0.1, d = o.d || 0.035, L = GOODS.lab(P, 128, 256, {}, 'v'), side = GOODS.col((P.art && P.art.bg) || '#ffffff', 0.6);
  GX.add(g, new THREE.BoxGeometry(w, h, d), [side, side, side, side, L, L], 0, h / 2, 0); const st = GX.cyl(g, 0.0025, 0.0025, 0.1, GOODS.mats().white, -w * 0.3, h * 0.2, d / 2 + 0.003, 6); st.rotation.z = 0.12; return g; };
// dry goods
GS.box = (P, o) => { const g = new THREE.Group(), w = o.w || 0.12, h = o.h || 0.16, d = o.d || 0.05, L = GOODS.lab(P, 128, Math.round(128 * h / w), {}, 'f'), side = GOODS.col(o.side || (P.art && (P.art.band || P.art.bg)) || '#e8e0d0', 0.6), top = GOODS.col(o.top || (P.art && P.art.bg) || '#e8e0d0', 0.6);
  GX.add(g, new RoundedBoxGeometry(w, h, d, 1, Math.min(o.rad || 0.003, w / 3, d / 3)), [side, side, top, top, L, side], 0, h / 2, 0); return g; };
GS.bag = (P, o) => { const g = new THREE.Group(), w = o.w || 0.16, h = o.h || 0.22, d = o.d || 0.06, L = GOODS.lab(P, 128, Math.round(128 * h / w), {}, 'f'), side = GOODS.col((P.art && P.art.bg) || '#e8c040', 0.35);
  const geo = new THREE.BoxGeometry(w, h, d, 10, 14, 2), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2), f = Math.max(0.06, (1 - Math.pow(Math.abs(y), 4)) * (1 - Math.pow(Math.abs(x), 6))); p.setZ(i, p.getZ(i) * f); p.setX(i, p.getX(i) * (1 - 0.04 * (1 - Math.abs(y)))); }
  geo.computeVertexNormals(); GX.add(g, geo, [side, side, side, side, L, L], 0, h / 2, 0);
  for (const sy of [0, 1]) GX.box(g, w * 1.0, 0.012, 0.004, side, 0, sy ? h - 0.006 : -0.006 + 0.006, 0); return g; };
GS.pouch = (P, o) => { const g = new THREE.Group(), w = o.w || 0.13, h = o.h || 0.19, d = o.d || 0.05, L = GOODS.lab(P, 128, Math.round(128 * h / w), {}, 'f'), side = GOODS.col((P.art && P.art.bg) || '#d8c8a0', 0.45);
  const geo = new THREE.BoxGeometry(w, h, d, 6, 10, 2), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / h + 0.5; p.setZ(i, p.getZ(i) * Math.max(0.05, 1 - y * y * 0.95)); } geo.computeVertexNormals(); GX.add(g, geo, [side, side, side, side, L, L], 0, h / 2, 0);
  GX.box(g, w, 0.014, 0.003, side, 0, h - 0.014, 0); return g; };
GS.cup = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), h = o.h || 0.104, rt = o.rt || 0.048, rb = o.rb || 0.037, L = GOODS.lab(P, 256, 128), lid = GOODS.m('lid' + P.id, () => GOODS.mapM(GOODS.tex('lid' + P.id, 128, 128, (x, W, H) => { x.fillStyle = '#f6f2ea'; x.fillRect(0, 0, W, H); x.fillStyle = (P.art && (P.art.band || P.art.bg)) || '#d8322a'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.fill(); gText(x, (P.art && P.art.t) || '', 64, 64, 90, 22, '#ffffff', 900); }), 0.6));
  GX.add(g, new GCylG(rt, rb, h, 28, 1, false, Math.PI), [L, lid, M.white], 0, h / 2, 0); GX.cyl(g, rt + 0.003, rt + 0.003, 0.003, M.white, 0, h - 0.003, 0, 28); return g; };
GS.cupsq = (P, o) => { const g = new THREE.Group(), w = o.w || 0.14, h = o.h || 0.06, d = o.d || 0.12, L = GOODS.lab(P, 128, 128, {}, 'f'), side = GOODS.col((P.art && P.art.bg) || '#f2f2ee', 0.5);
  const geo = new THREE.BoxGeometry(w, h, d), p = geo.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) { p.setX(i, p.getX(i) * 0.85); p.setZ(i, p.getZ(i) * 0.85); } geo.computeVertexNormals(); GX.add(g, geo, [side, side, L, side, side, side], 0, h / 2, 0); return g; };
GS.tub = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), r = o.r || 0.055, h = o.h || 0.075, L = GOODS.lab(P, 256, 128), lidT = GOODS.m('tl' + P.id, () => GOODS.mapM(GOODS.label(P, 128, 128, 'top'), 0.5));
  GX.add(g, new GCylG(r, r * 0.88, h, 28, 1, false, Math.PI), [L, M.white, M.white], 0, h / 2, 0); GX.add(g, new GCylG(r * 1.03, r * 1.03, 0.012, 28), [GOODS.col((P.art && P.art.band) || '#2a7ad0', 0.4), lidT, M.white], 0, h + 0.006, 0); return g; };
GS.tin = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), r = o.r || 0.042, h = o.h || 0.036; GX.add(g, new GCylG(r, r, h, 24, 1, false, Math.PI), [GOODS.lab(P, 256, 64), M.alu, M.alu], 0, h / 2, 0); for (const y of [0.002, h - 0.002]) GX.add(g, new GTorusG(r, 0.0018, 4, 24), M.alu, 0, y, 0, Math.PI / 2); return g; };
GS.jar = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), r = o.r || 0.036, h = o.h || 0.1; GX.lathe(g, [[0, 0.002], [r * 0.9, 0], [r, 0.008], [r, h * 0.14], [r * 0.95, h * 0.15], [r * 0.95, h * 0.6], [r, h * 0.61], [r, h - 0.022], [r * 0.85, h - 0.012], [r * 0.82, h - 0.01]], GOODS.col(o.fill || '#c8322a', 0.15), 0, 0, 0, 22);
  GX.cyl(g, r * 1.01, r * 1.01, h * 0.45, GOODS.lab(P, 256, 128), 0, h * 0.15, 0, 22, true); GX.cyl(g, r * 0.86, r * 0.86, 0.016, M[o.cap || 'gold'], 0, h - 0.012, 0, 20); return g; };
GS.mayo = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), h = o.h || 0.2; GX.lathe(g, [[0, 0], [0.026, 0.002], [0.032, 0.03], [0.032, 0.038], [0.0315, 0.04], [0.0315, 0.13], [0.033, 0.135], [0.03, 0.17], [0.012, h - 0.03], [0.011, h - 0.025]], GOODS.col(o.fill || '#f6eebc', 0.2), 0, 0, 0, 20);
  GX.cyl(g, 0.0335, 0.0335, 0.09, GOODS.lab(P, 256, 128), 0, 0.04, 0, 20, true); GX.cyl(g, 0.014, 0.012, 0.028, M[o.cap || 'capR'], 0, h - 0.028, 0, 14); return g; };
GS.jug = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), w = o.w || 0.16, h = o.h || 0.24, d = o.d || 0.085; GX.rbox(g, w, h * 0.82, d, 0.025, GOODS.col(o.body || '#f6f6f2', 0.4), 0, 0, 0);
  GX.add(g, new THREE.PlaneGeometry(w * 0.8, h * 0.55), GOODS.lab(P, 128, 128, {}, 'f'), 0, h * 0.4, d / 2 + 0.001); GX.add(g, new GTorusG(0.03, 0.012, 6, 12, Math.PI), GOODS.col(o.body || '#f6f6f2', 0.4), w * 0.18, h * 0.82, 0); GX.cyl(g, 0.022, 0.022, 0.035, M[o.cap || 'capB'], -w * 0.25, h * 0.8, 0, 14); return g; };
GS.pump = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), r = o.r || 0.038, h = o.h || 0.2; GX.rbox(g, r * 2, h * 0.8, r * 1.4, 0.02, GOODS.col(o.body || '#f2f2ee', 0.25), 0, 0, 0); GX.add(g, new THREE.PlaneGeometry(r * 1.7, h * 0.5), GOODS.lab(P, 128, 128, {}, 'f'), 0, h * 0.38, r * 0.7 + 0.001);
  GX.cyl(g, 0.01, 0.01, h * 0.16, M.capK, 0, h * 0.8, 0, 10); GX.box(g, 0.02, 0.012, 0.05, M.capK, 0, h * 0.95, 0.015); return g; };
// chilled & deli
GOODS.topTex = (P, food, w = 160, h = 120, sticker = true) => GOODS.tex('TT' + P.id + w, w, h, (x, W, H) => { const ft = GOODS.foodTop(food, w, h); x.drawImage(ft.image, 0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(W * 0.1, 0); x.lineTo(W * 0.35, 0); x.lineTo(W * 0.05, H); x.lineTo(0, H); x.lineTo(0, H * 0.6); x.fill(); // the shine of the clear lid
  if (sticker) { x.fillStyle = '#ffffff'; gRR(x, W * 0.58, H * 0.66, W * 0.38, H * 0.3, 3); x.fill(); x.fillStyle = (P.art && P.art.band) || '#e8322a'; x.fillRect(W * 0.58, H * 0.66, W * 0.38, H * 0.09); gText(x, P.name.slice(0, 8), W * 0.77, H * 0.8, W * 0.34, H * 0.08, '#1a1a1a', 800); gText(x, (P.price || 0) + '円', W * 0.77, H * 0.9, W * 0.34, H * 0.09, '#d8322a', 900); } });
GS.tray = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), w = o.w || 0.2, d = o.d || 0.15, h = o.h || 0.03; const top = GOODS.m('tt' + P.id, () => GOODS.mapM(GOODS.topTex(P, o.food || P.id), 0.25));
  GX.rbox(g, w, h * 0.7, d, 0.006, o.dark ? M.black : M.foam, 0, 0, 0); GX.add(g, new THREE.BoxGeometry(w * 0.96, h * 0.32, d * 0.96), [M.clearPlastic, M.clearPlastic, top, M.white, M.clearPlastic, M.clearPlastic], 0, h * 0.86, 0); return g; };
GS.bento = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), w = o.w || 0.21, d = o.d || 0.155, h = o.h || 0.05, top = GOODS.m('tt' + P.id, () => GOODS.mapM(GOODS.topTex(P, o.food || P.id), 0.2));
  GX.rbox(g, w, h * 0.55, d, 0.008, M.black, 0, 0, 0); GX.add(g, new RoundedBoxGeometry(w * 1.01, h * 0.5, d * 1.01, 1, 0.008), [M.clearPlastic, M.clearPlastic, top, M.clearPlastic, M.clearPlastic, M.clearPlastic], 0, h * 0.72, 0); return g; };
GS.onigiri = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), s = o.s || 0.1, sh = new THREE.Shape(); const R = s * 0.12; // rounded triangle
  const pts = [[0, s * 0.88], [-s * 0.5, 0], [s * 0.5, 0]]; sh.moveTo(pts[0][0], pts[0][1] - R); sh.quadraticCurveTo(pts[0][0], pts[0][1], pts[0][0] - R * 0.6, pts[0][1] - R * 1.2); sh.lineTo(pts[1][0] + R * 0.6, pts[1][1] + R); sh.quadraticCurveTo(pts[1][0], pts[1][1], pts[1][0] + R * 1.2, pts[1][1]); sh.lineTo(pts[2][0] - R * 1.2, pts[2][1]); sh.quadraticCurveTo(pts[2][0], pts[2][1], pts[2][0] - R * 0.6, pts[2][1] + R); sh.closePath();
  const face = GOODS.m('oni' + P.id, () => GOODS.mapM(GOODS.tex('oni' + P.id, 128, 128, (x, W, H) => { x.fillStyle = '#f6f4ec'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(200,195,180,.5)'; for (let i = 0; i < 300; i++) x.fillRect((i * 37) % W, (i * 53) % H, 2, 1); x.fillStyle = '#1f2a1e'; x.fillRect(W * 0.3, H * 0.62, W * 0.4, H * 0.38);
    x.fillStyle = (P.art && P.art.band) || '#c8322a'; x.fillRect(W * 0.46, 0, W * 0.08, H); x.fillStyle = '#ffffff'; gRR(x, W * 0.25, H * 0.28, W * 0.5, H * 0.24, 4); x.fill(); gText(x, (P.art && P.art.t) || '', W * 0.5, H * 0.4, W * 0.46, H * 0.15, '#1a1a1a', 900); }), 0.35));
  const m = GX.ext(g, sh, o.d || 0.036, [face, GOODS.col('#f2f0e8', 0.35)], 0.003); m.position.y = 0; return g; };
GS.sandwich = (P, o) => { const g = new THREE.Group(), s = o.s || 0.12, sh = new THREE.Shape(); sh.moveTo(-s / 2, 0); sh.lineTo(s / 2, 0); sh.lineTo(-s / 2, s * 0.95); sh.closePath();
  const face = GOODS.m('sw' + P.id, () => GOODS.mapM(GOODS.tex('sw' + P.id, 128, 128, (x, W, H) => { x.fillStyle = '#f2e6c8'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2d24a'; x.fillRect(0, H * 0.3, W, H * 0.4); x.fillStyle = '#d8b880'; x.fillRect(0, 0, W, H * 0.06); x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(W * 0.05, H * 0.75, W * 0.6, H * 0.18); gText(x, (P.art && P.art.t) || '', W * 0.35, H * 0.84, W * 0.56, H * 0.12, '#c8322a', 900); }), 0.3));
  GX.ext(g, sh, 0.06, [face, GOODS.mats().clearPlastic], 0.002); g.children[0].position.y = 0.003; return g; };
GS.eggs = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(); GX.box(g, 0.27, 0.03, 0.105, M.clearPlastic, 0, 0, 0); const egg = GOODS.col('#f2e4cc', 0.5); for (let i = 0; i < 5; i++) for (const z of [-0.026, 0.026]) GX.sph(g, 0.022, egg, -0.104 + i * 0.052, 0.03, z, 1, 1.25, 1, 10);
  GX.add(g, new THREE.PlaneGeometry(0.12, 0.045), GOODS.lab(P, 128, 48, {}, 's'), 0, 0.064, 0, -Math.PI / 2); return g; };
GS.tofu = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), w = o.w || 0.12, h = o.h || 0.045, d = o.d || 0.09; GX.add(g, new THREE.BoxGeometry(w, h, d), [M.white, M.white, GOODS.lab(P, 128, 96, {}, 't'), M.white, M.white, M.white], 0, h / 2, 0); return g; };
GS.natto = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(); for (let i = 0; i < 3; i++) GX.add(g, new THREE.BoxGeometry(0.09, 0.024, 0.09), [M.white, M.white, GOODS.lab(P, 96, 96, {}, 't'), M.white, M.white, M.white], 0, 0.012 + i * 0.025, 0); GX.box(g, 0.012, 0.075, 0.092, GOODS.col((P.art && P.art.band) || '#c8322a', 0.5), 0, 0, 0); return g; };
GS.kamaboko = (P, o) => { const g = new THREE.Group(); GX.box(g, 0.13, 0.012, 0.055, GOODS.mats().wood, 0, 0, 0); const k = new GCylG(0.03, 0.03, 0.12, 16, 1, false, -Math.PI / 2, Math.PI); GX.add(g, k, [GOODS.col(o.col || '#f2a8b0', 0.5), GOODS.col('#f8f2ec', 0.5), GOODS.col('#f8f2ec', 0.5)], 0, 0.012, 0, 0, 0, Math.PI / 2); return g; };
// bakery
GS.loaf = (P, o) => { const g = new THREE.Group(), w = o.w || 0.2, h = o.h || 0.12, d = o.d || 0.12; GX.rbox(g, w, h, d, Math.min(w, h, d) * 0.38, GOODS.col(o.crust || '#c8883a', 0.75), 0, 0, 0); GX.rbox(g, w * 1.04, h * 1.02, d * 1.04, 0.03, GOODS.mats().clearPlastic, 0, 0, 0);
  GX.add(g, new THREE.PlaneGeometry(w * 0.6, h * 0.5), GOODS.lab(P, 128, 96, {}, 'f'), 0, h * 0.5, d * 0.52 + 0.002); return g; };
GS.bun = (P, o) => { const g = new THREE.Group(), r = o.r || 0.055; GX.box(g, r * 2.1, 0.002, r * 2.1, GOODS.col('#f4ecd8', 0.9), 0, 0, 0);
  const top = o.melon ? GOODS.m('melon', () => GOODS.mapM(GOODS.tex('melon', 64, 64, (x, W, H) => { x.fillStyle = '#e8c070'; x.fillRect(0, 0, W, H); x.strokeStyle = '#c89a50'; x.lineWidth = 2; for (let i = -W; i < W * 2; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H, H); x.stroke(); x.beginPath(); x.moveTo(i, H); x.lineTo(i + H, 0); x.stroke(); } }), 0.8)) : GOODS.col(o.crust || '#b8702a', 0.6);
  GX.sph(g, r, top, 0, 0.002, 0, 1, o.flat || 0.55, 1, 18); if (o.dot) GX.sph(g, r * 0.12, GOODS.col('#2a1a10', 0.5), 0, r * (o.flat || 0.55), 0); return g; };
GS.croissant = (P, o) => { const g = new THREE.Group(), m = GOODS.col('#c8883a', 0.55), m2 = GOODS.col('#a8662a', 0.5); GX.box(g, 0.15, 0.002, 0.11, GOODS.col('#f4ecd8', 0.9), 0, 0, 0);
  for (let i = 0; i < 7; i++) { const t = (i - 3) / 3, a = t * 1.05, r = 0.045, s = 1 - Math.abs(t) * 0.55; GX.sph(g, 0.024 * s, i % 2 ? m : m2, Math.sin(a) * r, 0.02 * s + 0.002, -Math.cos(a) * r * 0.7 + 0.03, 1.15, 0.85, 0.9, 12).rotation.y = -a; } return g; };
// produce (lying on the table / standing in crates)
GOODS.noise = (geo, amt, seed = 1) => { const p = geo.attributes.position, R = mulberry(seed); for (let i = 0; i < p.count; i++) { const f = 1 + (R() - 0.5) * amt; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); } geo.computeVertexNormals(); return geo; };
GS.daikon = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), L = 0.38; const geo = new GLatheG([[0, 0], [0.012, 0.02], [0.026, 0.1], [0.034, 0.22], [0.036, 0.33], [0.032, L - 0.01], [0, L]].map(p => new THREE.Vector2(p[0], p[1])), 16); geo.rotateZ(Math.PI / 2); geo.translate(L / 2 - 0.02, 0.036, 0);   // tip → +x, top (leaves) → −x
  GX.add(g, geo, GOODS.col('#f4f2ea', 0.55)); GX.add(g, new GCylG(0.0335, 0.0355, 0.07, 16), GOODS.col('#cfe0a8', 0.55), -L / 2 + 0.05, 0.036, 0, 0, 0, Math.PI / 2);
  for (let i = 0; i < 5; i++) GX.add(g, new GSphG(0.06, 8, 6), M.leaf, -L / 2 - 0.05 - i * 0.03, 0.04 + (i % 2) * 0.012, (i - 2) * 0.016, 0, (i - 2) * 0.22, 0, 1.6, 0.2, 0.45); return g; };
GS.cabbage = (P, o) => { const g = new THREE.Group(), r = o.r || 0.085; GX.add(g, GOODS.noise(new GSphG(r, 18, 14), 0.08, hashStr(P.id)), GOODS.col(o.col || '#a8cc68', 0.65), 0, r * 0.85, 0, 0, 0, 0, 1, 0.88, 1);
  for (let i = 0; i < 4; i++) { const lf = GX.add(g, new GSphG(r * 0.75, 12, 8, 0, Math.PI), GOODS.col(o.col2 || '#8cbc50', 0.7), Math.cos(i * 1.57) * r * 0.45, r * 0.55, Math.sin(i * 1.57) * r * 0.45, -0.3, i * 1.57, 0, 1, 1, 0.5); lf.material.side = THREE.DoubleSide; } return g; };
GS.hakusai = (P, o) => { const g = new THREE.Group(); GX.sph(g, 0.065, GOODS.col('#f2f0dc', 0.6), -0.05, 0.065, 0, 1.6, 1, 1, 16); GX.sph(g, 0.068, GOODS.col('#a8c870', 0.65), 0.07, 0.066, 0, 1.3, 1, 1.02, 16); return g; };
GS.kabocha = (P, o) => { const g = new THREE.Group(), r = 0.08, geo = new GSphG(r, 24, 14), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), f = 1 - 0.06 * Math.pow(Math.abs(Math.cos(a * 5)), 0.6); p.setX(i, x * f); p.setZ(i, z * f); p.setY(i, p.getY(i) * 0.72); } geo.computeVertexNormals();
  GX.add(g, geo, GOODS.col('#2f4a2a', 0.55), 0, r * 0.72, 0); GX.cyl(g, 0.008, 0.012, 0.03, GOODS.col('#8a7a4a', 0.8), 0, r * 1.4, 0, 8); return g; };
GS.cluster = (P, o) => { // several of one vegetable / fruit, with a tape or a tag (o.kind)
  const g = new THREE.Group(), M = GOODS.mats(), k = o.kind, n = o.n || 3, R = mulberry(hashStr(P.id));
  const tape = (w, y = 0.02) => GX.add(g, new THREE.BoxGeometry(0.02, y * 2 + 0.01, w), GOODS.lab(P, 64, 128, {}, 'tape'), 0, y, 0);
  if (k === 'kyuri') { for (let i = 0; i < n; i++) GX.cap(g, 0.016, 0.17, GOODS.col('#2f5a22', 0.55), 0, 0.016 + (i === n - 1 ? 0.028 : 0), (i - (n - 2) / 2) * 0.034 * (i < n - 1 ? 1 : 0), 0, 0, Math.PI / 2); tape(0.1, 0.022); }
  else if (k === 'nasu') { for (let i = 0; i < n; i++) { const z = (i - (n - 1) / 2) * 0.05; GX.cap(g, 0.025, 0.07, GOODS.col('#2a1a3a', 0.3), 0.01, 0.025, z, 0, 0, Math.PI / 2); GX.add(g, new GConeG(0.02, 0.03, 8), M.leafD, -0.06, 0.025, z, 0, 0, Math.PI / 2); } tape(0.16, 0.026); }
  else if (k === 'ninjin') { for (let i = 0; i < n; i++) { const z = (i - (n - 1) / 2) * 0.04; GX.add(g, new GConeG(0.02, 0.16, 12), GOODS.col('#ee7a22', 0.6), 0.02, 0.02, z, 0, 0, -Math.PI / 2); GX.add(g, new GConeG(0.012, 0.05, 6), M.leaf, -0.085, 0.02, z, 0, 0, Math.PI / 2); } tape(0.14, 0.022); }
  else if (k === 'imo') { for (let i = 0; i < n; i++) GX.cap(g, 0.03, 0.08, GOODS.col('#9a3a4a', 0.65), 0, 0.03, (i - (n - 1) / 2) * 0.06, 0, R() * 0.6, Math.PI / 2, 1, 1, 0.9); tape(0.15, 0.03); }
  else if (k === 'negi') { for (let i = 0; i < n; i++) { const z = (i - (n - 1) / 2) * 0.024; GX.cyl(g, 0.011, 0.011, 0.2, GOODS.col('#f2f2e4', 0.5), 0.12, 0.011, z, 10).rotation.z = Math.PI / 2; GX.cyl(g, 0.011, 0.012, 0.24, GOODS.col('#3f8a2a', 0.5), -0.1, 0.011, z, 10).rotation.z = Math.PI / 2; } g.children.forEach(c => { if (c.rotation.z) c.position.y = 0.011; }); tape(0.08, 0.016); }
  else if (k === 'leafy') { for (let i = 0; i < 6; i++) GX.add(g, new GSphG(0.05, 10, 6), GOODS.col(i % 2 ? '#2f7a2a' : '#3f8a32', 0.6), -0.04 - (i % 3) * 0.03, 0.02 + (i % 2) * 0.012, (i % 3 - 1) * 0.03, 0, (i - 3) * 0.2, 0, 1.6, 0.25, 0.6); for (let i = 0; i < 5; i++) GX.cyl(g, 0.005, 0.005, 0.1, GOODS.col('#9ac870', 0.6), 0.09, 0.012, (i - 2) * 0.012, 6).rotation.z = Math.PI / 2; GX.cyl(g, 0.02, 0.02, 0.012, GOODS.col('#d86a8a', 0.7), 0.15, 0.0, 0, 8).rotation.z = Math.PI / 2; tape(0.08, 0.018); }
  else if (k === 'kabu') { for (let i = 0; i < 3; i++) { const z = (i - 1) * 0.06; GX.sph(g, 0.03, GOODS.col('#f6f4ee', 0.5), 0.04, 0.03, z, 1, 0.9, 1, 14); for (let q = 0; q < 3; q++) GX.add(g, new GSphG(0.035, 8, 6), M.leaf, -0.04 - q * 0.025, 0.03, z, 0, (q - 1) * 0.3, 0, 1.6, 0.25, 0.5); } }
  else if (k === 'edamame') { for (let i = 0; i < 14; i++) GX.cap(g, 0.009, 0.035, GOODS.col('#6aa83a', 0.6), (R() - 0.5) * 0.14, 0.012 + R() * 0.02, (R() - 0.5) * 0.08, R(), R() * 3, R()); GX.box(g, 0.18, 0.004, 0.11, M.clearPlastic, 0, 0, 0); }
  else if (k === 'tomato' || k === 'lemon' || k === 'hassaku' || k === 'dekopon' || k === 'kaki' || k === 'jagaimo' || k === 'tamanegi' || k === 'mikan' || k === 'ume') {
    const C = { tomato: ['#d8282a', 0.034, 1, 0.85], lemon: ['#f0d22a', 0.032, 1.3, 1], hassaku: ['#f2b23a', 0.05, 1, 0.9], dekopon: ['#f4962a', 0.045, 1, 0.95], kaki: ['#e8722a', 0.04, 1, 0.75], jagaimo: ['#c8a46a', 0.03, 1.3, 0.85], tamanegi: ['#c08a48', 0.035, 1, 0.95], mikan: ['#f39a1e', 0.03, 1, 0.82], ume: ['#c8d84a', 0.016, 1, 1] }[k];
    const tray = o.net ? null : GX.rbox(g, Math.max(0.12, C[1] * n * 1.1), 0.012, 0.1, 0.004, o.basket ? GOODS.col('#8a6a3a', 0.8) : M.foam, 0, 0, 0);
    const net = !!o.net, cols = Math.min(n, o.cols || 3), perLay = net ? Math.min(n, cols * 2) : n, rows = Math.ceil(Math.min(n, perLay) / cols); let i = 0;
    for (; i < n;) for (let r = 0; r < rows && i < n; r++) for (let c = 0; c < cols && i < n; c++, i++) { const lay = Math.floor(i / perLay), sh = lay ? C[1] * 0.5 : 0; const x = (c - (cols - 1) / 2) * C[1] * 2.02 + sh, z = (r - (rows - 1) / 2) * C[1] * 2.0 + sh * 0.6, y = (net ? 0 : 0.012) + C[1] * C[3] + lay * C[1] * C[3] * 1.7;
      const f = GX.sph(g, C[1], GOODS.col(C[0], k === 'jagaimo' ? 0.85 : 0.45), x, y, z, C[2], C[3], 1, 14); if (k === 'jagaimo') f.rotation.y = R() * 3; if (k === 'tomato' || k === 'kaki') GX.add(g, new GConeG(C[1] * 0.45, C[1] * 0.2, 5), M.leafD, x, y + C[1] * C[3] * 0.98, z); if (k === 'dekopon') GX.sph(g, C[1] * 0.35, GOODS.col(C[0], 0.45), x, y + C[1] * C[3], z); if (k === 'mikan') GX.sph(g, C[1] * 0.12, GOODS.col('#5a7a2a', 0.6), x, y + C[1] * C[3] * 0.96, z, 1, 0.4, 1, 6); }
    if (net) { // a real mesh bag around the pile (diamond net texture, see-through), knotted at the top with a paper tag
      const nm = GOODS.m('net' + (o.netCol || '#e8402a'), () => new THREE.MeshStandardMaterial({ map: GOODS.tex('net' + (o.netCol || '#e8402a'), 64, 64, (x, W, H) => { x.clearRect(0, 0, W, H); x.strokeStyle = o.netCol || '#e8402a'; x.lineWidth = 3; for (let k = -W; k < W * 2; k += 16) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + H, H); x.stroke(); x.beginPath(); x.moveTo(k, H); x.lineTo(k + H, 0); x.stroke(); } }), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 }));
      nm.map.wrapS = nm.map.wrapT = THREE.RepeatWrapping; nm.map.repeat.set(6, 3); g.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(g); const sx = (bb.max.x - bb.min.x) / 2 + 0.006, sy = (bb.max.y - bb.min.y) / 2 + 0.006, sz = (bb.max.z - bb.min.z) / 2 + 0.006;
      GX.add(g, new GSphG(1, 20, 12), nm, (bb.min.x + bb.max.x) / 2, sy, (bb.min.z + bb.max.z) / 2, 0, 0, 0, sx * 1.08, sy * 1.02, sz * 1.08); GX.cyl(g, 0.006, 0.012, 0.03, GOODS.col(o.netCol || '#e8402a', 0.7), (bb.min.x + bb.max.x) / 2, sy * 2, 0, 8);
      GX.add(g, new THREE.PlaneGeometry(0.06, 0.035), GOODS.lab(P, 96, 56, {}, 'tag'), (bb.min.x + bb.max.x) / 2 + 0.02, sy * 2 + 0.01, 0.012).rotation.x = -0.3; }
    else if (tray) GX.add(g, new THREE.PlaneGeometry(0.05, 0.03), GOODS.lab(P, 96, 56, {}, 'tag'), 0, 0.0125, 0.045).rotation.x = -Math.PI / 2 + 0.0; }
  else if (k === 'grape') { GX.rbox(g, 0.16, 0.01, 0.12, 0.004, M.foam, 0, 0, 0); const gr = GOODS.col('#4a2a5a', 0.3); for (let i = 0; i < 26; i++) { const a = R() * 6.28, r = R() * 0.035 * (1 - i / 30); GX.sph(g, 0.012, gr, Math.cos(a) * r + (i / 26 - 0.5) * 0.09, 0.022 + R() * 0.02, Math.sin(a) * r, 1, 1.1, 1, 6); } GX.cyl(g, 0.003, 0.003, 0.05, GOODS.col('#6a5a3a', 0.8), -0.07, 0.03, 0, 5).rotation.z = 1.2; }
  return g; };
GS.mikanbox = (P, o) => { const g = new THREE.Group(), w = 0.36, h = 0.16, d = 0.27; const L = GOODS.lab(P, 128, 64, {}, 'f'), kr = GOODS.mats().kraft; GX.add(g, new THREE.BoxGeometry(w, h, d), [kr, kr, kr, kr, L, kr], 0, h / 2, 0);
  const R = mulberry(5), m = GOODS.col('#f39a1e', 0.45); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) GX.sph(g, 0.03, m, -0.13 + i * 0.065 + (j % 2) * 0.015, h + 0.012 + R() * 0.01, -0.09 + j * 0.06, 1, 0.82, 1, 10); return g; };
GS.shiitake = (P, o) => GS.tray(P, Object.assign({ food: 'shiitake', w: 0.16, d: 0.12 }, o));
// fish counter
GOODS.fishTex = (c1, c2) => GOODS.tex('fish' + c1 + c2, 32, 64, (x, W, H) => { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c2); gr.addColorStop(0.45, c1); gr.addColorStop(1, '#f4f2ee'); x.fillStyle = gr; x.fillRect(0, 0, W, H); });
GOODS.fishBody = (g, L, c1, c2, x = 0, y = 0, z = 0, ry = 0, flatHt = 0.28) => { const s = new THREE.Group(); const body = GX.sph(s, L / 2, GOODS.mapM(GOODS.fishTex(c1, c2), 0.35, 0.15), 0, 0, 0, 1, flatHt, 0.11, 16); const tail = new THREE.Shape(); tail.moveTo(0, 0); tail.lineTo(L * 0.2, L * 0.11); tail.lineTo(L * 0.17, 0); tail.lineTo(L * 0.2, -L * 0.11); tail.closePath();
  const t = new THREE.Mesh(new THREE.ShapeGeometry(tail), GOODS.col(c2, 0.5)); t.material.side = THREE.DoubleSide; t.position.x = L * 0.44; s.add(t); GX.sph(s, L * 0.035, GOODS.col('#111111', 0.2), -L * 0.36, L * 0.03, L * 0.045, 1, 1, 0.5, 8);
  s.rotation.set(-Math.PI / 2, 0, 0); const w = new THREE.Group(); w.add(s); w.position.set(x, y, z); w.rotation.y = ry; g.add(w); return w; };
GS.fish = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), C = (typeof FISH_COL !== 'undefined' && FISH_COL[o.fid]) || ['#c0ccd4', '#4a5a66'], L = o.L || 0.3, n = o.n || 1;
  GX.rbox(g, L * 1.25, 0.018, 0.08 + n * 0.06, 0.005, o.dark ? M.black : M.foam, 0, 0, 0); for (let i = 0; i < 14; i++) GX.sph(g, 0.012, M.ice, (i / 13 - 0.5) * L, 0.02, ((i * 7) % 5 - 2) * 0.012, 1, 0.5, 1, 6);
  GX.box(g, L * 0.4, 0.002, 0.06, M.leaf, -L * 0.25, 0.02, 0);
  for (let i = 0; i < n; i++) GOODS.fishBody(g, L * (1 - i * 0.05), o.c1 || C[0], o.c2 || C[1], 0, 0.03 + i * 0.012, (i - (n - 1) / 2) * 0.06, 0, o.ht || 0.28);
  GX.add(g, new THREE.PlaneGeometry(0.06, 0.035), GOODS.lab(P, 96, 56, {}, 'tag'), L * 0.45, 0.024, 0.03 + n * 0.02, -Math.PI / 2); return g; };
GS.himono = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(); GX.rbox(g, 0.26, 0.012, 0.16, 0.004, M.foam, 0, 0, 0); const dry = GOODS.col('#c89a5a', 0.45); for (const z of [-0.035, 0.035]) { const f = GX.sph(g, 0.1, dry, 0, 0.018, z, 1.1, 0.08, 0.38, 14); GX.sph(g, 0.06, GOODS.col('#e8c890', 0.4), 0.01, 0.02, z, 1.2, 0.06, 0.3, 10); }
  GX.box(g, 0.27, 0.025, 0.17, M.clearPlastic, 0, 0, 0); GX.add(g, new THREE.PlaneGeometry(0.08, 0.04), GOODS.lab(P, 96, 56, {}, 'tag'), 0.07, 0.026, 0.05, -Math.PI / 2); return g; };
GS.tako = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), red = GOODS.col('#b8322a', 0.45); GX.rbox(g, 0.24, 0.015, 0.16, 0.004, M.foam, 0, 0, 0); GX.sph(g, 0.04, red, -0.06, 0.05, 0, 1.2, 0.9, 1, 14);
  for (let i = 0; i < 8; i++) { const a = -1.3 + i * 0.37, pts = []; for (let k = 0; k <= 10; k++) { const t = k / 10, rr = 0.03 + t * 0.075, cu = t * t * (i % 2 ? 1.6 : -1.4); pts.push(new THREE.Vector3(-0.04 + Math.cos(a + cu) * rr, 0.02 + (1 - t) * 0.012, Math.sin(a + cu) * rr * 0.8)); } GX.add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.008, 6), red).scale.set(1, 1, 1); }
  GX.add(g, new THREE.PlaneGeometry(0.07, 0.035), GOODS.lab(P, 96, 56, {}, 'tag'), 0.07, 0.017, 0.05, -Math.PI / 2); return g; };
// flowers & plants
GS.pot = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), r = o.r || 0.07, h = o.h || 0.11, R = mulberry(hashStr(P.id)); GX.lathe(g, [[0, 0], [r * 0.72, 0], [r, h * 0.92], [r * 1.08, h * 0.95], [r * 1.08, h], [r * 0.96, h]], o.black ? M.black : M.terracotta, 0, 0, 0, 18); GX.cyl(g, r * 0.95, r * 0.95, 0.004, M.soil, 0, h - 0.012, 0, 18);
  const fl = GOODS.col(o.flower || '#e8406a', 0.6), ht = o.tall || 0.12; for (let i = 0; i < 9; i++) { const a = R() * 6.28, rr = R() * r * 0.8; GX.add(g, new GSphG(0.03, 6, 4), M.leaf, Math.cos(a) * rr, h + 0.02 + R() * ht * 0.4, Math.sin(a) * rr, R(), a, 0, 1.4, 0.35, 0.8); }
  if (!o.green) for (let i = 0; i < (o.nf || 6); i++) { const a = R() * 6.28, rr = R() * r * 0.7, y = h + ht * (0.5 + R() * 0.5); GX.cyl(g, 0.002, 0.002, y - h, M.leafD, Math.cos(a) * rr, h, Math.sin(a) * rr, 4); for (let q = 0; q < 5; q++) GX.sph(g, 0.011, fl, Math.cos(a) * rr + Math.cos(q * 1.256) * 0.011, y, Math.sin(a) * rr + Math.sin(q * 1.256) * 0.011, 1, 0.6, 1, 5); GX.sph(g, 0.006, GOODS.col('#f6d23a', 0.6), Math.cos(a) * rr, y + 0.004, Math.sin(a) * rr, 1, 1, 1, 6); }
  GX.add(g, new THREE.PlaneGeometry(0.045, 0.03), GOODS.lab(P, 96, 64, {}, 'tag'), 0, h * 0.55, r * 0.95).rotation.x = -0.1; return g; };
GS.bouquet = (P, o) => { const g = new THREE.Group(), R = mulberry(hashStr(P.id)); const wrap = GX.add(g, new GConeG(0.07, 0.28, 12, 1, true), GOODS.col(o.wrap || '#f2e6d0', 0.8), 0, 0.14, 0, Math.PI); wrap.material.side = THREE.DoubleSide;
  const cs = o.cols || ['#e8406a', '#f2c230', '#ffffff', '#c86ad8']; for (let i = 0; i < 9; i++) { const a = R() * 6.28, rr = R() * 0.05; GX.sph(g, 0.022, GOODS.col(cs[i % cs.length], 0.6), Math.cos(a) * rr, 0.29 + R() * 0.04, Math.sin(a) * rr, 1, 0.7, 1, 8); } for (let i = 0; i < 5; i++) GX.add(g, new GSphG(0.03, 8, 6), GOODS.mats().leaf, (R() - 0.5) * 0.08, 0.27, (R() - 0.5) * 0.08, R(), R() * 3, 0, 1.4, 0.3, 0.7);
  GX.add(g, new GTorusG(0.03, 0.006, 6, 14), GOODS.col(o.ribbon || '#d8322a', 0.5), 0, 0.12, 0, Math.PI / 2); return g; };
// cards on peg hooks (seed packets, key holders, batteries…) — the hole is at the top
GS.card = (P, o) => { const g = new THREE.Group(), w = o.w || 0.09, h = o.h || 0.13, L = GOODS.lab(P, 96, Math.round(96 * h / w), {}, 'f'), back = GOODS.col('#f2eee4', 0.7);
  GX.add(g, new THREE.BoxGeometry(w, h, 0.003), [back, back, back, back, L, back], 0, h / 2, 0); if (o.blister) GX.rbox(g, w * 0.7, h * 0.5, 0.025, 0.006, GOODS.mats().clearPlastic, 0, h * 0.1, 0.014);
  if (o.charm === 'lighthouse') { const m = GOODS.col('#ffffff', 0.4); GX.cyl(g, 0.006, 0.009, 0.04, m, 0, h * 0.25, 0.012, 10); GX.cyl(g, 0.0095, 0.0095, 0.008, GOODS.col('#d83a3a', 0.4), 0, h * 0.25 + 0.012, 0.012, 10); }
  if (o.charm === 'fish') GOODS.fishBody(g, 0.05, '#4aa0e8', '#2a5a9a', 0, h * 0.35, 0.012, 0, 0.35).rotation.x = Math.PI / 2;
  if (o.charm === 'lure') GOODS.fishBody(g, 0.06, o.lc || '#f2c230', o.lc2 || '#e8402a', 0, h * 0.4, 0.014, 0, 0.3).rotation.x = Math.PI / 2;
  if (o.charm === 'battery') for (let i = 0; i < 4; i++) GX.cyl(g, 0.007, 0.007, 0.05, GOODS.col(i % 2 ? '#2a2a2a' : '#c8322a', 0.4, 0.3), -0.022 + i * 0.015, h * 0.12, 0.012, 10);
  return g; };
// souvenirs & sweets
GS.giftbox = (P, o) => { const g = GS.box(P, Object.assign({ w: 0.22, h: 0.05, d: 0.16 }, o)); const f = g.children[0]; f.material = [f.material[0], f.material[1], GOODS.lab(P, 160, 120, {}, 'top'), f.material[3], f.material[4], f.material[5]];
  if (o.ribbon) { const rb = GOODS.col(o.ribbon, 0.5); GX.box(g, (o.w || 0.22) + 0.002, (o.h || 0.05) + 0.002, 0.014, rb, 0, -0.001, 0); } return g; };
GS.tenugui = (P, o) => { const g = new THREE.Group(), w = 0.2, d = 0.09, h = 0.012, top = GOODS.m('tg' + P.id, () => GOODS.mapM(GOODS.label(P, 160, 72, 'top'), 0.85)); GX.add(g, new THREE.BoxGeometry(w, h, d), [top, top, top, top, top, top], 0, h / 2, 0); GX.add(g, new THREE.BoxGeometry(0.03, h + 0.004, d + 0.002), GOODS.col('#f2eee0', 0.7), -0.05, h / 2, 0); return g; };
GS.plush = (P, o) => { const g = new THREE.Group(), k = o.kind, c = GOODS.col(o.col || '#8ab8e8', 0.95), c2 = GOODS.col(o.col2 || '#f6f6f2', 0.95), eye = GOODS.col('#1a1a1a', 0.3), s = o.s || 1;
  if (k === 'dolphin') { GX.sph(g, 0.06 * s, c, 0, 0.06 * s, 0, 1.8, 0.85, 0.85, 14); GX.sph(g, 0.045 * s, c2, 0.02 * s, 0.045 * s, 0.01, 1.6, 0.6, 0.7, 12); GX.add(g, new GConeG(0.03 * s, 0.05 * s, 8), c, 0, 0.11 * s, -0.01, -0.3); GX.cap(g, 0.012 * s, 0.03 * s, c, 0.115 * s, 0.07 * s, 0, 0, 0, Math.PI / 2); for (const sz of [-1, 1]) GX.sph(g, 0.006 * s, eye, 0.07 * s, 0.08 * s, sz * 0.03 * s, 1, 1, 1, 6); GX.add(g, new GConeG(0.035 * s, 0.03 * s, 3), c, -0.11 * s, 0.06 * s, 0, 0, 0, Math.PI / 2, 1, 1, 0.3); }
  else if (k === 'tako') { GX.sph(g, 0.06 * s, c, 0, 0.1 * s, 0, 1, 1.05, 1, 14); for (let i = 0; i < 8; i++) { const a = i * 0.785; GX.cap(g, 0.014 * s, 0.05 * s, c, Math.cos(a) * 0.045 * s, 0.03 * s, Math.sin(a) * 0.045 * s, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); } for (const sx of [-1, 1]) GX.sph(g, 0.009 * s, eye, sx * 0.022 * s, 0.1 * s, 0.055 * s, 1, 1, 0.5, 6); }
  else if (k === 'bear') { GX.sph(g, 0.065 * s, c, 0, 0.065 * s, 0, 1, 1.05, 0.9, 14); GX.sph(g, 0.05 * s, c, 0, 0.16 * s, 0.005, 1, 1, 1, 14); for (const sx of [-1, 1]) { GX.sph(g, 0.018 * s, c, sx * 0.04 * s, 0.205 * s, 0, 1, 1, 0.6, 8); GX.sph(g, 0.022 * s, c, sx * 0.07 * s, 0.08 * s, 0.02, 1, 1.4, 1, 10); GX.sph(g, 0.024 * s, c, sx * 0.035 * s, 0.02 * s, 0.05 * s, 1, 1, 1.2, 10); GX.sph(g, 0.006 * s, eye, sx * 0.017 * s, 0.17 * s, 0.045 * s, 1, 1, 0.5, 6); } GX.sph(g, 0.02 * s, c2, 0, 0.15 * s, 0.045 * s, 1.2, 0.9, 0.7, 10); GX.sph(g, 0.006 * s, eye, 0, 0.155 * s, 0.06 * s, 1, 1, 1, 6); GX.add(g, new GTorusG(0.03 * s, 0.006 * s, 6, 16), GOODS.col(o.ribbon || '#d8322a', 0.6), 0, 0.12 * s, 0.005, Math.PI / 2 - 0.2); }
  else if (k === 'whale') { GX.sph(g, 0.07 * s, c, 0, 0.06 * s, 0, 1.9, 0.85, 0.95, 16); for (let i = 0; i < 12; i++) GX.sph(g, 0.006 * s, c2, -0.08 * s + (i % 6) * 0.03 * s, 0.1 * s + Math.floor(i / 6) * 0.012 * s, (Math.floor(i / 6) - 0.5) * 0.05 * s, 1, 1, 1, 6); GX.add(g, new GConeG(0.05 * s, 0.05 * s, 3), c, -0.14 * s, 0.06 * s, 0, 0, 0, Math.PI / 2, 1, 1, 0.3); for (const sz of [-1, 1]) GX.sph(g, 0.006 * s, eye, 0.1 * s, 0.065 * s, sz * 0.055 * s, 1, 1, 1, 6); }
  else if (k === 'penguin') { GX.sph(g, 0.055 * s, c, 0, 0.07 * s, 0, 1, 1.35, 0.95, 14); GX.sph(g, 0.045 * s, c2, 0, 0.065 * s, 0.018 * s, 1, 1.3, 0.85, 12); GX.add(g, new GConeG(0.012 * s, 0.025 * s, 6), GOODS.col('#f2a02a', 0.5), 0, 0.11 * s, 0.055 * s, Math.PI / 2); for (const sx of [-1, 1]) { GX.sph(g, 0.006 * s, eye, sx * 0.02 * s, 0.125 * s, 0.045 * s, 1, 1, 0.6, 6); GX.sph(g, 0.02 * s, c, sx * 0.055 * s, 0.07 * s, 0, 0.5, 1.6, 1, 8); } }
  else { GOODS.fishBody(g, 0.16 * s, o.col || '#f2a03a', o.col2 || '#e8602a', 0, 0.04 * s, 0, 0, 0.45).rotation.x = Math.PI / 2; }
  return g; };
// paper
GS.book = (P, o) => { const g = new THREE.Group(), w = o.w || 0.13, h = o.h || 0.19, d = o.d || 0.02, cov = GOODS.lab(P, 128, Math.round(128 * h / w), {}, 'f'), sp = GOODS.col(o.spine || (P.art && (P.art.band && P.art.band[0] === '#' ? P.art.band : P.art.bg)) || '#3a5a8a', 0.6), pg = GOODS.col('#f6f2e6', 0.9);
  GX.add(g, new THREE.BoxGeometry(w, h, d), [pg, sp, pg, pg, cov, cov], 0, h / 2, 0); return g; };
GS.mag = (P, o) => GS.book(P, Object.assign({ w: 0.21, h: 0.28, d: 0.008 }, o));
GS.paper = (P, o) => { const g = new THREE.Group(), t = GOODS.m('np', () => GOODS.mapM(GOODS.tex('np', 128, 160, (x, W, H) => { x.fillStyle = '#ece8de'; x.fillRect(0, 0, W, H); gText(x, 'しまなみ新聞', W / 2, H * 0.08, W * 0.9, 16, '#1a1a1a', 900); x.fillStyle = '#9a9890'; for (let i = 0; i < 40; i++) x.fillRect(W * 0.06 + (i % 4) * W * 0.23, H * 0.16 + Math.floor(i / 4) * H * 0.08, W * 0.2, 3); x.fillStyle = '#8a9aa8'; x.fillRect(W * 0.52, H * 0.18, W * 0.42, H * 0.3); }), 0.9));
  GX.add(g, new THREE.BoxGeometry(0.2, 0.012, 0.27), [t, t, t, t, t, t], 0, 0.006, 0); return g; };
// clothes & toys & daily goods
GS.shirt = (P, o) => { const g = new THREE.Group(), w = 0.26, d = 0.3, h = 0.03, top = GOODS.m('sh' + P.id, () => GOODS.mapM(GOODS.tex('sh' + P.id, 128, 148, (x, W, H) => { x.fillStyle = o.col || '#ffffff'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 2; x.beginPath(); x.arc(W / 2, 0, W * 0.16, 0, Math.PI); x.stroke(); if (o.em) GOODS.emblem(x, o.em, W / 2, H * 0.45, W * 0.45, o.ec || '#2a6ab0'); if (o.t) gText(x, o.t, W / 2, H * 0.75, W * 0.8, 14, o.ec || '#2a6ab0', 900); }), 0.9)), side = GOODS.col(o.col || '#ffffff', 0.9);
  GX.add(g, new RoundedBoxGeometry(w, h, d, 1, 0.008), [side, side, top, side, side, side], 0, h / 2, 0); return g; };
GS.hanger = (P, o) => { const g = new THREE.Group(), sh = new THREE.Shape(); const W = 0.46, H = 0.62; sh.moveTo(-0.08, H); sh.quadraticCurveTo(0, H - 0.05, 0.08, H); sh.lineTo(W / 2, H - 0.06); sh.lineTo(W / 2 + 0.04, H - 0.24); sh.lineTo(0.17, H - 0.22); sh.lineTo(0.17, 0); sh.lineTo(-0.17, 0); sh.lineTo(-0.17, H - 0.22); sh.lineTo(-W / 2 - 0.04, H - 0.24); sh.lineTo(-W / 2, H - 0.06); sh.closePath();
  const face = GOODS.m('hg' + P.id, () => GOODS.mapM(GOODS.tex('hg' + P.id, 128, 160, (x, W2, H2) => { x.fillStyle = o.col || '#ffffff'; x.fillRect(0, 0, W2, H2); if (o.stripe) { x.fillStyle = o.stripe; for (let i = 0; i < H2; i += 16) x.fillRect(0, i, W2, 7); } if (o.em) GOODS.emblem(x, o.em, W2 / 2, H2 * 0.45, W2 * 0.35, o.ec || '#2a6ab0'); }), 0.9));
  GX.ext(g, sh, 0.012, [face, GOODS.col(o.col || '#ffffff', 0.9)], 0.003); g.children[0].position.y = -0.04; const hk = GX.add(g, new GTorusG(0.03, 0.003, 4, 12, Math.PI * 1.4), GOODS.mats().silver, 0, H + 0.0, 0); hk.rotation.z = -0.3; GX.box(g, 0.4, 0.008, 0.008, GOODS.mats().wood, 0, H - 0.07, 0); return g; };
// a garment hanging on a wire hanger (clothes racks): T-shirt or trousers seen flat, hook on top
GS.hang = (P, o) => { const g = new THREE.Group(), sh = new THREE.Shape(), bot = !!(P.use && P.use.wear && P.use.wear.bottom), col = o.col || '#ffffff';
  const H = bot ? 0.74 : 0.6; if (bot) { sh.moveTo(-0.17, H); sh.lineTo(0.17, H); sh.lineTo(0.19, 0); sh.lineTo(0.035, 0); sh.lineTo(0.004, H - 0.27); sh.lineTo(-0.004, H - 0.27); sh.lineTo(-0.035, 0); sh.lineTo(-0.19, 0); sh.closePath(); }
  else { sh.moveTo(-0.075, H); sh.quadraticCurveTo(0, H - 0.07, 0.075, H); sh.lineTo(0.2, H - 0.035); sh.lineTo(0.315, H - 0.17); sh.lineTo(0.255, H - 0.235); sh.lineTo(0.205, H - 0.18); sh.lineTo(0.215, 0); sh.lineTo(-0.215, 0); sh.lineTo(-0.205, H - 0.18); sh.lineTo(-0.255, H - 0.235); sh.lineTo(-0.315, H - 0.17); sh.lineTo(-0.2, H - 0.035); sh.closePath(); }
  const face = GOODS.m('hgf' + P.id, () => GOODS.mapM(GOODS.tex('hgf' + P.id, 128, 160, (x, W2, H2) => { x.fillStyle = col; x.fillRect(0, 0, W2, H2);
    if (bot) { x.strokeStyle = 'rgba(0,0,0,.22)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, H2 * 0.09); x.lineTo(W2, H2 * 0.09); x.moveTo(W2 * 0.5, H2 * 0.09); x.lineTo(W2 * 0.5, H2 * 0.3); x.moveTo(W2 * 0.18, H2 * 0.1); x.quadraticCurveTo(W2 * 0.3, H2 * 0.2, W2 * 0.35, H2 * 0.1); x.moveTo(W2 * 0.82, H2 * 0.1); x.quadraticCurveTo(W2 * 0.7, H2 * 0.2, W2 * 0.65, H2 * 0.1); x.stroke(); x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 40; i++) x.fillRect(Math.random() * W2, Math.random() * H2, 1, 6); }
    else { x.strokeStyle = 'rgba(0,0,0,.14)'; x.lineWidth = 3; x.beginPath(); x.arc(W2 / 2, 0, W2 * 0.13, 0, Math.PI); x.stroke(); if (o.em) GOODS.emblem(x, o.em, W2 / 2, H2 * 0.42, W2 * 0.3, o.ec || '#2a6ab0'); if (o.t) gText(x, o.t, W2 / 2, H2 * 0.62, W2 * 0.5, 11, o.ec || '#2a6ab0', 900); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, H2 - 5, W2, 5); } }), 0.95));
  GX.ext(g, sh, 0.012, [face, GOODS.col(col, 0.95)], 0.003); const M = GOODS.mats();
  if (bot) { GX.box(g, 0.4, 0.012, 0.012, M.silver, 0, H - 0.01, 0); for (const sx of [-1, 1]) GX.box(g, 0.025, 0.035, 0.03, GOODS.col('#2a2a2e', 0.5), sx * 0.15, H - 0.025, 0); }
  else { GX.box(g, 0.03, 0.006, 0.02, GOODS.col('#e8e2d2', 0.8), 0, H - 0.05, 0.004); }
  GX.cyl(g, 0.0025, 0.0025, 0.03, M.silver, 0, H - 0.01, 0, 6); const hk = GX.add(g, new GTorusG(0.02, 0.0025, 4, 12, Math.PI * 1.5), M.silver, 0, H + 0.04, 0); hk.rotation.z = -Math.PI * 0.25; return g; };
GS.hat = (P, o) => { const g = new THREE.Group(), st = GOODS.mats().straw; GX.lathe(g, [[0.001, 0.085], [0.06, 0.082], [0.075, 0.03], [0.08, 0.008], [0.16, 0.003], [0.165, 0], [0.16, -0.002], [0.08, 0.002], [0.074, 0.028], [0.058, 0.078], [0.001, 0.08]], st, 0, 0.004, 0, 28); GX.cyl(g, 0.0765, 0.08, 0.022, GOODS.col(o.ribbon || '#2a3a6a', 0.6), 0, 0.012, 0, 28, true); return g; };
GS.tote = (P, o) => { const g = new THREE.Group(), w = 0.3, h = 0.32, d = 0.08, c = GOODS.col(o.col || '#efe6d2', 0.95); GX.add(g, new THREE.BoxGeometry(w, h, d), [c, c, c, c, GOODS.lab(P, 128, 136, {}, 'f'), c], 0, h / 2, 0); for (const sx of [-1, 1]) GX.add(g, new GTorusG(0.06, 0.008, 6, 14, Math.PI), c, sx * 0.07, h, 0, 0, 0, 0, 1, 1.3, 1); return g; };
GS.sandals = (P, o) => { const g = new THREE.Group(), c = GOODS.col(o.col || '#2a6ab0', 0.6), s = GOODS.col('#f6f2e8', 0.7); for (const sx of [-1, 1]) { GX.rbox(g, 0.09, 0.02, 0.24, 0.02, s, sx * 0.055, 0, 0); GX.add(g, new GTorusG(0.035, 0.008, 6, 14, Math.PI), c, sx * 0.055, 0.02, 0.02, 0, 0, 0); } return g; };
GS.ball = (P, o) => { const g = new THREE.Group(), t = GOODS.m('bb' + P.id, () => GOODS.mapM(GOODS.tex('bb' + P.id, 128, 64, (x, W, H) => { const cs = o.cols || ['#e8322a', '#ffffff', '#2a7ad0', '#ffffff', '#f2c230', '#ffffff']; cs.forEach((c, i) => { x.fillStyle = c; x.fillRect(i * W / cs.length, 0, W / cs.length + 1, H); }); }), 0.35)); GX.sph(g, o.r || 0.11, t, 0, o.r || 0.11, 0, 1, 1, 1, 20); return g; };
GS.tp = (P, o) => { const g = new THREE.Group(); const L = GOODS.lab(P, 160, 112, {}, 'f'), s = GOODS.col('#f8f8f4', 0.7); GX.add(g, new RoundedBoxGeometry(0.34, 0.23, 0.23, 1, 0.03), [L, L, s, s, L, L], 0, 0.115, 0); return g; };
GS.umbrella = (P, o) => { const g = new THREE.Group(), cl = GOODS.col('#e8f0f4', 0.2, 0, { transparent: true, opacity: 0.55 }); GX.cyl(g, 0.006, 0.006, 0.82, GOODS.mats().silver, 0, 0.04, 0, 6); GX.add(g, new GConeG(0.035, 0.62, 10, 1, true), cl, 0, 0.5, 0, Math.PI); GX.add(g, new GTorusG(0.035, 0.008, 6, 12, Math.PI), GOODS.col('#e8e8e4', 0.4), 0.035, 0.86, 0, 0, 0, Math.PI); return g; };
GS.icecup = (P, o) => { const g = new THREE.Group(), M = GOODS.mats(), r = o.r || 0.045, h = o.h || 0.045; GX.add(g, new GCylG(r, r * 0.85, h, 24), [GOODS.lab(P, 256, 64), GOODS.lab(P, 128, 128, {}, 'top'), M.white], 0, h / 2, 0); return g; };
// café: plates and cakes
GS.cakeSlice = (P, o) => { const g = new THREE.Group(), r = 0.08, h = o.h || 0.065, a = 0.78, kind = o.kind || 'short';
  const side = GOODS.m('cs' + kind, () => GOODS.mapM(GOODS.tex('cs' + kind, 64, 64, (x, W, H) => { const L = { short: ['#f6e6b0', '#ffffff', '#f6e6b0', '#ffffff', '#f6e6b0'], choco: ['#5a321a', '#8a5a3a', '#5a321a', '#8a5a3a', '#5a321a'], cheese: ['#c8903a', '#f0d890', '#f0d890', '#f0d890', '#f0d890'], lemon: ['#f6e6b0', '#f8f0a0', '#f6e6b0', '#f8f0a0', '#fff6c8'] }[kind];
    L.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, H - (i + 1) * H / 5, W, H / 5 + 1); }); if (kind === 'short') { x.fillStyle = '#e83a4a'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(8 + i * 16, H * 0.5, 4, 0, 7); x.fill(); } } }), 0.6));
  const top = GOODS.col({ short: '#fbf6ee', choco: '#4a2a14', cheese: '#e8c070', lemon: '#f8ee90' }[kind], 0.5);
  // a real wedge (with the cut faces showing the layers): a pie slice extruded upward
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.absarc(0, 0, r, Math.PI / 2 - a / 2, Math.PI / 2 + a / 2, false); sh.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 8 }); const pos = geo.attributes.position, uv = geo.attributes.uv, nr = geo.attributes.normal;
  for (let i = 0; i < uv.count; i++) { if (Math.abs(nr.getZ(i)) < 0.5) uv.setXY(i, (pos.getX(i) + pos.getY(i)) * 6, pos.getZ(i) / h); }
  geo.rotateX(-Math.PI / 2); geo.translate(0, 0.006, r * 0.45); GX.add(g, geo, [top, side]);
  GX.cyl(g, 0.07, 0.07, 0.006, GOODS.mats().white, 0, 0, 0, 20); if (kind === 'short') { GX.sph(g, 0.013, GOODS.col('#e0283a', 0.4), 0, h + 0.018, -r * 0.2, 1, 1.2, 1, 8); GX.sph(g, 0.012, GOODS.col('#fbf6ee', 0.5), 0, h + 0.012, -r * 0.42, 1, 0.7, 1, 8); } if (kind === 'choco') GX.box(g, 0.03, 0.002, 0.03, GOODS.col('#f2eee8', 0.6), 0, h + 0.006, -r * 0.2); return g; };
GS.cake = (P, o) => { const g = new THREE.Group(), r = 0.09, h = 0.07; GX.cyl(g, r, r, h, GOODS.col('#fbf6ee', 0.5), 0, 0, 0, 28); for (let i = 0; i < 8; i++) { const a = i * 0.785; GX.sph(g, 0.011, GOODS.col('#fbf6ee', 0.5), Math.cos(a) * r * 0.8, h + 0.005, Math.sin(a) * r * 0.8, 1, 0.8, 1, 6); GX.sph(g, 0.011, GOODS.col('#e0283a', 0.4), Math.cos(a) * r * 0.55, h + 0.012, Math.sin(a) * r * 0.55, 1, 1.2, 1, 8); } return g; };
GS.pudding = (P, o) => { const g = new THREE.Group(); GX.cyl(g, 0.05, 0.05, 0.005, GOODS.mats().white, 0, 0, 0, 20); GX.cyl(g, 0.028, 0.034, 0.045, GOODS.col('#f2cc6a', 0.35), 0, 0.005, 0, 18); GX.cyl(g, 0.0285, 0.0285, 0.006, GOODS.col('#7a3a12', 0.3), 0, 0.048, 0, 18); GX.sph(g, 0.01, GOODS.col('#ffffff', 0.5), 0, 0.058, 0, 1, 0.7, 1, 8); GX.sph(g, 0.006, GOODS.col('#d8283a', 0.4), 0, 0.066, 0, 1, 1, 1, 6); return g; };
GS.parfait = (P, o) => { const g = new THREE.Group(), gl = GOODS.col('#e8f4f8', 0.05, 0, { transparent: true, opacity: 0.35, depthWrite: false }); GX.cyl(g, 0.03, 0.03, 0.006, gl, 0, 0, 0, 16); GX.cyl(g, 0.006, 0.006, 0.05, gl, 0, 0.006, 0, 8); const ls = o.layers || ['#f6eede', '#f2a03a', '#ffffff', '#c8322a'];
  ls.forEach((c, i) => GX.cyl(g, 0.026 + i * 0.006, 0.024 + i * 0.006, 0.035, GOODS.col(c, 0.5), 0, 0.056 + i * 0.035, 0, 16)); GX.sph(g, 0.03, GOODS.col('#fff8f0', 0.5), 0, 0.2, 0, 1, 0.8, 1, 12); GX.sph(g, 0.012, GOODS.col(o.fruit || '#f39a1e', 0.4), 0.012, 0.225, 0.01, 1, 1, 1, 8); GX.cyl(g, 0.045, 0.034, 0.14, gl, 0, 0.056, 0, 18, true); return g; };
GS.drinkcup = (P, o) => { const g = new THREE.Group(), L = GOODS.lab(P, 256, 128); GX.add(g, new GCylG(0.042, 0.032, 0.12, 22, 1, true, Math.PI), L, 0, 0.06, 0); GX.cyl(g, 0.032, 0.032, 0.002, GOODS.mats().white, 0, 0, 0, 16); GX.cyl(g, 0.044, 0.044, 0.012, GOODS.col(o.lid || '#ffffff', 0.4), 0, 0.12, 0, 22); GX.cyl(g, 0.03, 0.04, 0.008, GOODS.col(o.lid || '#ffffff', 0.4), 0, 0.132, 0, 22); return g; };
GS.mug = (P, o) => { const g = new THREE.Group(), c = GOODS.col(o.col || '#f6f2ea', 0.3); GX.cyl(g, 0.065, 0.065, 0.006, GOODS.mats().white, 0, 0, 0, 22); GX.lathe(g, [[0, 0.006], [0.036, 0.006], [0.04, 0.012], [0.042, 0.09], [0.038, 0.09], [0.036, 0.016], [0, 0.016]], c, 0, 0, 0, 22); GX.cyl(g, 0.037, 0.037, 0.002, GOODS.col(o.liq || '#4a2a14', 0.15), 0, 0.078, 0, 22); GX.add(g, new GTorusG(0.022, 0.006, 6, 12, Math.PI), c, 0.042, 0.05, 0, 0, 0, -Math.PI / 2); return g; };
GS.plate = (P, o) => { const g = new THREE.Group(), top = GOODS.m('pl' + P.id, () => GOODS.mapM(GOODS.foodTop(o.food || P.id, 128, 128), 0.45)); GX.lathe(g, [[0, 0], [0.09, 0], [0.13, 0.016], [0.135, 0.02], [0.12, 0.012], [0, 0.008]], GOODS.mats().white, 0, 0, 0, 28); const f = GX.add(g, new GCylG(0.105, 0.105, 0.02, 28), [GOODS.col(o.side || '#c8803a', 0.5), top, top], 0, 0.02, 0); return g; };
GS.softcream = (P, o) => { const g = new THREE.Group(); GX.add(g, new GConeG(0.025, 0.09, 16), GOODS.col('#d8a050', 0.8), 0, 0.045, 0, Math.PI); const c = GOODS.col(o.col || '#fbf6ec', 0.45); for (let i = 0; i < 4; i++) GX.sph(g, 0.03 - i * 0.006, c, 0, 0.1 + i * 0.022, 0, 1, 0.7, 1, 12); GX.add(g, new GConeG(0.008, 0.02, 8), c, 0, 0.19, 0); return g; };
// a furniture model scaled down for display (zakka goods are small furniture you can place at home)
GS.furn = (P, o) => { const g = new THREE.Group(); try { const m = (typeof makeFurniture2 === 'function' ? makeFurniture2 : makeFurniture)(o.furn || P.use.furn, o.v || 0); m.scale.setScalar(o.sc || 1); g.add(m); } catch (e) { GX.box(g, 0.1, 0.1, 0.1, GOODS.mats().card); } return g; };
// ---------- the catalogue (all brands are made up) ----------
GOODS.CATS = { drink: '飲み物', dairy: '牛乳・たまご・とうふ', deli: 'お弁当・おそうざい', bread: 'パン', snack: 'お菓子', instant: 'インスタント・乾物', season: '調味料', ice: 'アイス', veg: '野菜', fruit: 'くだもの', fish: '鮮魚', flower: '花・苗', seed: 'たね', local: '島の名産', souvenir: 'おみやげ', daily: '日用品', stationery: '文具', book: '本・雑誌', toy: 'おもちゃ', fashion: '服・小物', zakka: '雑貨・インテリア', fishing: '釣り具', cafe: 'カフェメニュー', aqua: '水族館グッズ' };
GOODS.def = function (id, name, cat, price, sh, o, art, use, note, tags) { const P = { id, name, cat, price, sh, o: o || {}, art: Object.assign({ t: name }, art || {}), use: use || {}, note: note || '', tags: tags || [] }; GOODS.defs.push(P); GOODS.byId[id] = P; return P; };
{ const D = GOODS.def, drink = (b) => ({ drink: true, buff: b }), eat = (b) => ({ eat: true, buff: b });
  // --- drinks (cold case) ---
  D('ocha', 'しまなみ緑茶 500ml', 'drink', 140, 'pet', { liq: '#a8b84a', cap: 'capG' }, { st: 'band', bg: '#e8f2d8', band: '#ffffff', em: 'leaf', ec: '#3a8a3a', tc: '#1f5a2a', brand: '島のお茶', s: '香り高い一番茶' }, drink(), 'すっきり飲みやすい緑茶。', ['drink', 'tea']);
  D('hojicha', '香ばしほうじ茶 500ml', 'drink', 140, 'pet', { liq: '#8a4a1a', cap: 'capK' }, { st: 'band', bg: '#c89a6a', band: '#f6ead6', em: 'leaf', ec: '#7a4a1a', tc: '#5a2a0a', brand: '島のお茶', s: '焙じたての香り' }, drink(), 'ほっとする香ばしさ。', ['drink', 'tea']);
  D('mugicha', 'むぎ茶 500ml', 'drink', 120, 'pet', { liq: '#a8601a', cap: 'capO' }, { st: 'band', bg: '#f2c870', band: '#ffffff', em: 'rice', ec: '#c8802a', tc: '#7a3a0a', brand: 'なつのむぎ', s: 'カフェインゼロ' }, drink('cool'), '夏の定番。冷えたのがいちばん。', ['drink', 'tea']);
  D('water', 'せとうちの天然水 500ml', 'drink', 110, 'pet', { liq: '#dcecf4', cap: 'capB' }, { st: 'band', bg: '#bfe0f4', band: '#ffffff', em: 'drop', ec: '#2a7ad0', tc: '#1a4a8a', brand: '島の山の水', s: '軟水' }, drink(), '島の山でくんだ、やわらかい水。', ['drink']);
  D('mikanjuice', 'ほしなみ みかん100%', 'drink', 160, 'pet', { liq: '#f2a020', cap: 'capO' }, { st: 'band', bg: '#ffe6a8', band: '#f39a1e', em: 'mikan', tc: '#ffffff', brand: '島のくだもの', s: '果汁100%' }, drink('speed'), '島のみかんをぎゅっとしぼったジュース。', ['drink', 'mikan', 'local']);
  D('sports', 'アクアチャージ 500ml', 'drink', 150, 'pet', { liq: '#e8f2f6', cap: 'capB' }, { st: 'band', bg: '#2a6ad0', band: '#ffffff', em: 'bubble', ec: '#2a6ad0', tc: '#1a3a8a', brand: 'AQUA CHARGE', s: '水分・塩分補給に' }, drink('speed'), '走りまわる日に。', ['drink']);
  D('lactic', 'にゅうさんウォーター 500ml', 'drink', 150, 'pet', { liq: '#f6f6f2', cap: 'capB' }, { st: 'band', bg: '#ffffff', band: '#2a7ad0', em: 'drop', ec: '#ffffff', tc: '#ffffff', brand: 'にゅうさんきん', s: 'やさしい甘ずっぱさ' }, drink(), 'カラダにやさしい乳酸菌飲料。', ['drink', 'sweet']);
  D('ocha2l', 'しまなみ緑茶 2L', 'drink', 260, 'pet2l', { liq: '#a8b84a', cap: 'capG' }, { st: 'band', bg: '#e8f2d8', band: '#ffffff', em: 'leaf', ec: '#3a8a3a', tc: '#1f5a2a', brand: '島のお茶', s: '家族みんなで' }, drink(), '大きいボトル。', ['drink', 'tea']);
  D('water2l', 'せとうちの天然水 2L', 'drink', 160, 'pet2l', { liq: '#dcecf4', cap: 'capB' }, { st: 'band', bg: '#bfe0f4', band: '#ffffff', em: 'drop', ec: '#2a7ad0', tc: '#1a4a8a', brand: '島の山の水', s: '軟水' }, drink(), '料理にも使える大きいボトル。', ['drink']);
  D('lemonsq', '瀬戸内レモンスカッシュ', 'drink', 150, 'can', {}, { st: 'can', bg: '#f6e04a', bg2: '#f2c230', fg: '#2a6a2a', em: 'lemon', t: 'レモンスカッシュ', s: '瀬戸内産レモン果汁' }, drink('speed'), 'しゅわっとすっぱい、夏の味。', ['drink', 'local']);
  D('cola', 'ほしなみコーラ', 'drink', 130, 'can', {}, { st: 'can', bg: '#c8222a', bg2: '#8a1218', fg: '#ffffff', em: 'star', ec: '#ffffff', t: 'ほしなみコーラ', s: 'ZERO SUGAR' }, drink('speed'), '島の小さな工場でつくる、すっきりしたコーラ。', ['drink', 'sweet']);
  D('coffeecan', 'うみかぜ珈琲 微糖', 'drink', 130, 'can', { h: 0.105, r: 0.026 }, { st: 'can', bg: '#3a2a1e', bg2: '#1a120c', fg: '#e8c890', em: 'cup', ec: '#e8c890', t: 'うみかぜ珈琲', s: '微糖' }, drink('speed'), '港ではたらく人の味方。', ['drink', 'coffee']);
  D('ramune', 'ラムネ', 'drink', 150, 'glass', { h: 0.2, r: 0.03, glass: '#7ad0c8', cap: 'capB', ramune: true, neck: 0.42 }, { st: 'band', bg: '#bfe8f4', band: '#2a7ad0', em: 'wave', ec: '#ffffff', tc: '#ffffff', brand: 'しまのラムネ', s: 'ビー玉入り' }, drink('cool'), 'ビー玉をポンと落としてから飲む。', ['drink', 'sweet', 'summer']);
  D('milk', '島の牛乳 1000ml', 'dairy', 230, 'carton', {}, { st: 'clean', bg: '#ffffff', band: '#2a7ad0', em: 'cow', t: '島の牛乳', s: '成分無調整', brand: 'ほしなみ牧場' }, drink(), 'ふもとの牧場のしぼりたて。', ['drink', 'milk']);
  D('coffeemilk', 'コーヒー牛乳 200ml', 'dairy', 120, 'cartonS', {}, { st: 'clean', bg: '#f2e6d0', band: '#8a5a2a', em: 'cup', t: 'コーヒー牛乳', s: '200ml', brand: 'ほしなみ牧場' }, drink(), 'お風呂あがりに腰に手をあてて。', ['drink', 'milk', 'sweet']);
  D('eggs', 'たまご 10個', 'dairy', 260, 'eggs', {}, { st: 'clean', bg: '#ffffff', band: '#e8902a', t: '島のたまご', s: '10個入', brand: 'にわとり小屋' }, eat(), '黄身の色がこい、平飼いのたまご。', ['egg']);
  D('tofu', 'もめん豆腐', 'dairy', 98, 'tofu', {}, { st: 'clean', bg: '#ffffff', band: '#2a6ab0', em: 'bean', t: 'もめん豆腐', s: '国産大豆', brand: '島のとうふ屋' }, eat(), 'みそ汁にも冷ややっこにも。', []);
  D('natto', 'なっとう 3パック', 'dairy', 98, 'natto', {}, { st: 'clean', bg: '#ffffff', band: '#c8322a', t: 'なっとう', s: 'たれ・からし付', brand: 'つぶつぶ' }, eat(), '朝ごはんの定番。', []);
  D('yogurt', 'ほしなみヨーグルト 400g', 'dairy', 180, 'tub', { r: 0.058, h: 0.07 }, { st: 'clean', bg: '#ffffff', band: '#2a8ad0', em: 'cow', t: 'ヨーグルト', s: 'プレーン', brand: 'ほしなみ牧場' }, eat(), 'はちみつをかけても。', ['sweet', 'milk']);
  D('chikuwa', 'ちくわ 4本', 'dairy', 120, 'pouch', { w: 0.13, h: 0.18, d: 0.04 }, { st: 'clean', bg: '#ffffff', band: '#c8822a', em: 'fish', ec: '#c8822a', t: 'ちくわ', s: '島の魚で作りました', brand: 'かまぼこ屋' }, eat(), 'そのままでも、天ぷらにしても。', ['fish']);
  D('kamaboko', '紅白かまぼこ', 'dairy', 280, 'kamaboko', { col: '#f2a0aa' }, { t: 'かまぼこ' }, eat(), '板にのった、ぷりぷりのかまぼこ。', ['fish', 'local']);
  // --- bento & deli ---
  D('makunouchi', '幕の内弁当', 'deli', 550, 'bento', { food: 'makunouchi' }, { band: '#2a5a3a' }, eat('happy'), '焼き魚・卵焼き・煮物…ぜんぶ入り。', ['meal']);
  D('karaben', 'からあげ弁当', 'deli', 480, 'bento', { food: 'karaage' }, { band: '#c8322a' }, eat('speed'), 'からあげ5個。ごはん大盛り。', ['meal']);
  D('sabazushi', 'さば寿司', 'deli', 680, 'bento', { food: 'sabazushi', w: 0.24, d: 0.1 }, { band: '#2a4a6a' }, eat('happy'), 'しめさばを棒ずしに。', ['meal', 'fish', 'local']);
  D('oni_ume', 'おにぎり 梅', 'deli', 130, 'onigiri', {}, { t: '梅', band: '#c8322a' }, eat(), '島の梅干し入り。', ['meal']);
  D('oni_shake', 'おにぎり 鮭', 'deli', 150, 'onigiri', {}, { t: '鮭', band: '#e8803a' }, eat(), '焼き鮭をたっぷり。', ['meal', 'fish']);
  D('oni_konbu', 'おにぎり 昆布', 'deli', 130, 'onigiri', {}, { t: '昆布', band: '#2a5a2a' }, eat(), 'つくだ煮の昆布。', ['meal']);
  D('inari', 'いなり寿司 4個', 'deli', 350, 'tray', { food: 'inari', w: 0.17, d: 0.12 }, { band: '#c8822a' }, eat(), 'あまからいおあげ。', ['meal']);
  D('sandwich', 'たまごサンド', 'deli', 290, 'sandwich', {}, { t: 'たまご' }, eat(), 'ふわふわたまご。', ['meal']);
  D('korokke', 'コロッケ 2個', 'deli', 200, 'tray', { food: 'korokke', w: 0.17, d: 0.12 }, { band: '#e8902a' }, eat('speed'), 'じゃがいもほくほく。', ['meal']);
  D('yakisoba', 'ソース焼きそば', 'deli', 380, 'tray', { food: 'yakisoba', w: 0.19, d: 0.15, h: 0.04 }, { band: '#c8322a' }, eat('speed'), '青のりと紅しょうが。', ['meal']);
  D('tamagoyaki', 'だし巻き卵', 'deli', 250, 'tray', { food: 'tamagoyaki', w: 0.16, d: 0.1 }, { band: '#e8b02a' }, eat(), 'だしがじゅわっと。', ['meal']);
  // --- bread ---
  D('shokupan', '島の食パン 6枚', 'bread', 180, 'loaf', { crust: '#c8883a' }, { st: 'kraft', bg: '#e8d0a8', em: 'sun', ec: '#e8902a', t: '食パン', s: '6枚切' }, eat(), 'もちもちの角食。', ['bread']);
  D('melonpan', 'メロンパン', 'bread', 130, 'bun', { melon: true }, { t: 'メロンパン' }, eat('happy'), 'さくさくの皮。', ['bread', 'sweet']);
  D('anpan', 'あんぱん', 'bread', 120, 'bun', { crust: '#9a5a22', dot: true }, { t: 'あんぱん' }, eat(), 'こしあん。おへそにけし粒。', ['bread', 'sweet']);
  D('currypan', 'カレーパン', 'bread', 150, 'bun', { crust: '#c8822a', flat: 0.5 }, { t: 'カレーパン' }, eat('speed'), 'からっと揚げたて。', ['bread']);
  D('croissant', 'クロワッサン', 'bread', 160, 'croissant', {}, { t: 'クロワッサン' }, eat(), 'バターの香り。', ['bread']);
  D('mikanbread', 'みかん蒸しパン', 'bread', 180, 'bun', { crust: '#f2c040', flat: 0.7 }, { t: 'みかん蒸しパン' }, eat('happy'), '島のみかんピール入り。', ['bread', 'sweet', 'local', 'mikan']);
  // --- snacks ---
  D('chips', 'うすぎりポテト しお', 'snack', 150, 'bag', {}, { st: 'pop', bg: '#f2c230', bg2: '#e8902a', fg: '#ffffff', em: 'sun', ec: '#ffffff', ec2: '#e8902a', brand: 'POTATO CHIPS', t: 'ポテトチップス', s: 'しお味' }, eat(), 'うすくてパリッ。', ['snack']);
  D('chipsnori', 'うすぎりポテト のりしお', 'snack', 150, 'bag', {}, { st: 'pop', bg: '#3a9a4a', bg2: '#1f6a2a', fg: '#ffffff', em: 'leaf', ec: '#f2e04a', ec2: '#1f5a2a', brand: 'POTATO CHIPS', t: 'ポテトチップス', s: 'のりしお' }, eat(), '青のりの香り。', ['snack']);
  D('senbei', '島のしょうゆせんべい', 'snack', 250, 'bag', { w: 0.15, h: 0.22, d: 0.05 }, { st: 'jp', bg: '#f6eed8', band: '#8a3a1a', t: 'しょうゆせんべい', s: '手焼き 8枚', seal: '焼' }, eat(), 'ばりっと固い手焼き。', ['snack', 'local']);
  D('choco', 'ミルクチョコレート', 'snack', 120, 'box', { w: 0.15, h: 0.075, d: 0.012 }, { st: 'pop', bg: '#5a2a14', bg2: '#3a1a0a', fg: '#f6e0b8', em: 'heart', ec: '#f6e0b8', ec2: '#c8322a', brand: 'CHOCOLATE', t: 'ミルクチョコ', s: '板チョコ' }, eat('happy'), 'あまくてとろける。', ['snack', 'sweet']);
  D('biscuit', 'さくさくビスケット', 'snack', 180, 'box', { w: 0.12, h: 0.17, d: 0.05 }, { st: 'pop', bg: '#2a6ad0', bg2: '#1a4aa0', fg: '#ffffff', em: 'star', ec: '#f2d23a', ec2: '#e8902a', brand: 'BISCUIT', t: 'ビスケット', s: '12枚入' }, eat(), '牛乳といっしょに。', ['snack', 'sweet']);
  D('gummy', 'みかんグミ', 'snack', 120, 'pouch', { w: 0.1, h: 0.15, d: 0.03 }, { st: 'pop', bg: '#f39a1e', bg2: '#e8602a', fg: '#ffffff', em: 'mikan', ec: '#ffd23a', brand: 'GUMMY', t: 'みかんグミ', s: 'かむほどジューシー' }, eat(), 'みかんの形のグミ。', ['snack', 'sweet', 'mikan']);
  D('karinto', '黒糖かりんとう', 'snack', 200, 'bag', { w: 0.14, h: 0.2, d: 0.05 }, { st: 'jp', bg: '#3a2414', band: '#c8a050', tc: '#f6e6c8', t: 'かりんとう', s: '黒糖', seal: '糖' }, eat(), 'ぽりぽり止まらない。', ['snack', 'sweet']);
  D('caramel', 'ミルクキャラメル', 'snack', 100, 'box', { w: 0.05, h: 0.09, d: 0.02 }, { st: 'clean', bg: '#f6ead0', band: '#c8322a', t: 'キャラメル', s: '12粒', brand: 'ミルク' }, eat(), 'なつかしい箱。', ['snack', 'sweet']);
  // --- instant & dry ---
  D('cupnoodle', 'カップラーメン しょうゆ', 'instant', 180, 'cup', {}, { st: 'band', bg: '#ffffff', band: '#d8322a', fg: '#d8322a', tc: '#ffffff', em: 'star', ec: '#f2c230', brand: 'しまラーメン', s: 'お湯3分' }, eat('happy'), 'お湯を入れて3分。', ['meal']);
  D('cupudon', 'きつねうどん', 'instant', 190, 'cup', { h: 0.08, rt: 0.06, rb: 0.048 }, { st: 'band', bg: '#ffffff', band: '#2a6a3a', tc: '#ffffff', em: 'leaf', ec: '#e8b02a', brand: 'しまのうどん', s: 'お湯5分' }, eat(), 'おあげがふっくら。', ['meal']);
  D('cupyakisoba', 'カップ焼きそば', 'instant', 200, 'cupsq', {}, { st: 'pop', bg: '#f2f2ee', bg2: '#e8e4dc', fg: '#d8322a', em: 'burst', ec: '#f2c230', ec2: '#d8322a', t: '焼きそば', s: 'ソース味' }, eat('speed'), 'お湯をすてるとき、ちょっとどきどき。', ['meal']);
  D('somen', '島の手延べそうめん', 'instant', 380, 'box', { w: 0.24, h: 0.05, d: 0.09 }, { st: 'jp', bg: '#f6f2e8', band: '#2a4a8a', t: '手延べそうめん', s: '300g', seal: '麺' }, { cook: 'somen' }, '夏はこれ。つるつる。', ['local', 'meal']);
  D('rice5', 'ほしなみ米 5kg', 'instant', 2400, 'box', { w: 0.28, h: 0.4, d: 0.1, rad: 0.03 }, { st: 'kraft', bg: '#e8d8b0', em: 'rice', ec: '#c8902a', t: 'ほしなみ米', s: '5kg 島のだんだん田んぼ' }, { cook: 'rice' }, '島の棚田のお米。', ['local']);
  D('nori', '焼きのり 10枚', 'instant', 400, 'pouch', { w: 0.21, h: 0.24, d: 0.02 }, { st: 'jp', bg: '#1f2a1e', band: '#c8a050', tc: '#f6e6c8', t: '焼きのり', s: '瀬戸内産', seal: '海' }, { cook: 'nori' }, 'パリッと香ばしい。', ['local']);
  D('katsuobushi', 'かつおぶし', 'instant', 300, 'pouch', {}, { st: 'jp', bg: '#f6eed8', band: '#8a3a1a', t: 'かつおぶし', s: '花かつお', seal: '節' }, { cook: 'dashi' }, 'おかかごはんに。', []);
  D('curry', '島カレー（レトルト）', 'instant', 220, 'box', { w: 0.13, h: 0.17, d: 0.03 }, { st: 'pop', bg: '#e8902a', bg2: '#c8602a', fg: '#ffffff', em: 'sun', ec: '#ffd23a', ec2: '#8a3a1a', t: '島カレー', s: '中辛' }, eat('speed'), 'あたためるだけ。', ['meal']);
  D('tuna', 'ツナ缶', 'instant', 150, 'tin', {}, { st: 'band', bg: '#2a6ab0', band: '#ffffff', em: 'fish', ec: '#2a6ab0', tc: '#1a3a6a', brand: 'SEA', s: '油漬' }, eat(), 'サラダにも。', ['fish']);
  D('mikancan', 'みかん缶', 'instant', 180, 'tin', { r: 0.04, h: 0.06 }, { st: 'band', bg: '#f39a1e', band: '#ffffff', em: 'mikan', tc: '#c86a1a', brand: '島のくだもの', s: 'シロップ漬' }, eat('happy'), '冷やして食べる。', ['sweet', 'mikan']);
  // --- seasonings ---
  D('shoyu', 'こいくちしょうゆ 1L', 'season', 260, 'pet', { h: 0.25, r: 0.04, liq: '#3a1a0a', cap: 'capR' }, { st: 'band', bg: '#c8322a', band: '#f6eed8', tc: '#5a1a0a', em: 'bean', brand: '島のしょうゆ蔵', s: '本醸造' }, { cook: 'shoyu' }, '島の蔵でつくったしょうゆ。', ['local']);
  D('ponzu', 'ゆずポン酢', 'season', 380, 'glass', { h: 0.22, r: 0.035, glass: '#5a3a1a', cap: 'capY' }, { st: 'band', bg: '#f2d23a', band: '#ffffff', em: 'lemon', tc: '#5a3a0a', brand: '島の果実', s: 'ゆず果汁入' }, { cook: 'ponzu' }, '鍋にも、焼き魚にも。', ['local']);
  D('salt', '瀬戸内の塩', 'season', 320, 'pouch', { w: 0.12, h: 0.17 }, { st: 'jp', bg: '#ffffff', band: '#2a6ab0', t: '瀬戸内の塩', s: '海水100%', seal: '塩' }, { cook: 'salt' }, '島の浜で炊いた塩。', ['local']);
  D('sugar', '上白糖 1kg', 'season', 200, 'pouch', { w: 0.14, h: 0.2, d: 0.06 }, { st: 'clean', bg: '#ffffff', band: '#2a7ad0', t: '上白糖', s: '1kg' }, { cook: 'sugar' }, '料理にもお菓子にも。', []);
  D('mayo', 'マヨネーズ', 'season', 260, 'mayo', {}, { st: 'clean', bg: '#ffffff', band: '#c8322a', t: 'マヨネーズ', s: '450g' }, { cook: 'mayo' }, 'なんにでも合う。', []);
  D('miso', '島みそ（米みそ）', 'season', 380, 'tub', { r: 0.065, h: 0.08 }, { st: 'jp', bg: '#c8902a', band: '#8a3a1a', t: 'みそ', s: '750g', seal: '味' }, { cook: 'miso' }, 'あわせみそ。', ['local']);
  D('mirin', '本みりん', 'season', 330, 'glass', { h: 0.26, r: 0.034, glass: '#c8902a', cap: 'capK' }, { st: 'jp', bg: '#f6eed8', band: '#2a2a2a', t: '本みりん', s: '500ml', seal: '味' }, { cook: 'mirin' }, '煮物にてりを。', []);
  // --- ice ---
  D('ice_vanilla', 'バニラカップ', 'ice', 140, 'icecup', {}, { st: 'clean', bg: '#fbf6e8', band: '#c8a050', em: 'cow', t: 'バニラ', s: 'ICE CREAM' }, eat('cool'), '冷凍ケースのいちばん人気。', ['sweet', 'ice']);
  D('ice_mikan', 'みかんシャーベット', 'ice', 150, 'icecup', {}, { st: 'clean', bg: '#fff0d0', band: '#f39a1e', em: 'mikan', t: 'みかん', s: 'SHERBET' }, eat('cool'), 'しゃりしゃり。', ['sweet', 'ice', 'mikan']);
  D('ice_bar', 'アイスバー 6本', 'ice', 380, 'box', { w: 0.2, h: 0.04, d: 0.13 }, { st: 'pop', bg: '#2a8ad0', bg2: '#1a5aa0', fg: '#ffffff', em: 'star', ec: '#ffffff', ec2: '#f2c230', t: 'アイスバー', s: 'ソーダ味 6本' }, eat('cool'), '家族で分けて。', ['sweet', 'ice']);
  D('kakigori', 'かき氷 いちご', 'ice', 180, 'icecup', { r: 0.05, h: 0.06 }, { st: 'clean', bg: '#ffffff', band: '#e83a5a', em: 'heart', t: 'いちご', s: 'かき氷' }, eat('cool'), '夏まつりの味。', ['sweet', 'ice', 'summer']);
}
{ const D = GOODS.def, eat = (b) => ({ eat: true, buff: b }), drink = (b) => ({ drink: true, buff: b });
  const farm = (t, s, em, ec) => ({ st: 'kraft', bg: '#e8d4a8', band: '#fffaf0', t, s: s || '島の畑から', em, ec });
  // --- vegetables (道の駅の産直) ---
  D('daikon', 'だいこん 1本', 'veg', 150, 'daikon', {}, farm('だいこん', '生産者：ゲン'), { veg: 'daikon' }, 'みずみずしい青首だいこん。', ['veg']);
  D('kabu', 'かぶ 3こ', 'veg', 160, 'cluster', { kind: 'kabu' }, farm('かぶ'), { veg: 'kabu' }, 'まるくて白いかぶ。', ['veg']);
  D('hourensou', 'ほうれんそう 1束', 'veg', 150, 'cluster', { kind: 'leafy' }, farm('ほうれんそう', '', 'leaf'), { veg: 'hourensou' }, '根もとが赤くてあまい。', ['veg']);
  D('negi', 'ねぎ 3本', 'veg', 130, 'cluster', { kind: 'negi', n: 3 }, farm('ねぎ', '', 'leaf'), { veg: 'negi' }, '白いところがあまい。', ['veg']);
  D('tamanegi', 'たまねぎ 4こ', 'veg', 198, 'cluster', { kind: 'tamanegi', n: 4, net: true, netCol: '#e87a2a', cols: 2 }, farm('たまねぎ'), { veg: 'tamanegi', n: 2 }, '島の新たまねぎ。', ['veg']);
  D('jagaimo', 'じゃがいも 5こ', 'veg', 198, 'cluster', { kind: 'jagaimo', n: 5, net: true, netCol: '#c8322a', cols: 3 }, farm('じゃがいも'), { veg: 'jagaimo', n: 2 }, 'ほくほくのだんしゃく。', ['veg']);
  D('tomato', 'トマト 3こ', 'veg', 280, 'cluster', { kind: 'tomato', n: 3 }, farm('トマト', '', 'tomato'), { veg: 'tomato', n: 2 }, '完熟で甘い。', ['veg']);
  D('kyuri', 'きゅうり 3本', 'veg', 150, 'cluster', { kind: 'kyuri', n: 3 }, farm('きゅうり', '', 'leaf'), { veg: 'kyuri' }, 'イボイボが新鮮なしるし。', ['veg']);
  D('nasu', 'なす 3本', 'veg', 180, 'cluster', { kind: 'nasu', n: 3 }, farm('なす'), { veg: 'nasu' }, 'つやつやの紫。', ['veg']);
  D('edamame', 'えだまめ 1袋', 'veg', 250, 'cluster', { kind: 'edamame' }, farm('えだまめ', '', 'leaf'), { veg: 'edamame' }, 'ゆでたてが最高。', ['veg']);
  D('satsumaimo', 'さつまいも 2本', 'veg', 250, 'cluster', { kind: 'imo', n: 2 }, farm('さつまいも'), { veg: 'satsumaimo' }, '焼きいもにすると、ねっとり。', ['veg']);
  D('cabbage', 'キャベツ 1玉', 'veg', 180, 'cabbage', {}, farm('キャベツ'), { food: 1 }, 'ずっしり重い春キャベツ。', ['veg']);
  D('hakusai', '白菜 1/2', 'veg', 150, 'hakusai', {}, farm('白菜'), { food: 1 }, '鍋の主役。', ['veg']);
  D('kabocha', 'かぼちゃ 1玉', 'veg', 300, 'kabocha', {}, farm('かぼちゃ'), { food: 1 }, 'ほっくりあまい。', ['veg']);
  D('ninjin', 'にんじん 3本', 'veg', 160, 'cluster', { kind: 'ninjin', n: 3 }, farm('にんじん'), { food: 1 }, '葉つきのにんじん。', ['veg']);
  D('shiitake', '原木しいたけ', 'veg', 300, 'shiitake', {}, { band: '#7a4a2a' }, { forage: 'kinoko' }, '島の林で育てた原木しいたけ。', ['veg']);
  // --- fruit ---
  D('mikanbag', '温州みかん 1袋（8こ）', 'fruit', 300, 'cluster', { kind: 'mikan', n: 8, net: true, cols: 4 }, farm('みかん', '島のだんだん畑', 'mikan'), { mikan: 8 }, '甘さと酸っぱさがちょうどいい。', ['fruit', 'mikan', 'local']);
  D('mikanbox', 'みかん 箱（40こ）', 'fruit', 1800, 'mikanbox', {}, { st: 'kraft', bg: '#d8b07a', band: '#fffaf0', em: 'mikan', t: 'ほしなみみかん', s: '5kg 秀' }, { mikan: 40 }, '親せきに送る人も多い、島の名物。', ['fruit', 'mikan', 'local']);
  D('lemon', '瀬戸内レモン 3こ', 'fruit', 250, 'cluster', { kind: 'lemon', n: 3 }, farm('レモン', '防腐剤不使用', 'lemon'), { food: 1 }, '皮まで使える国産レモン。', ['fruit', 'local']);
  D('hassaku', 'はっさく 2こ', 'fruit', 250, 'cluster', { kind: 'hassaku', n: 2, cols: 2 }, farm('はっさく', '', 'mikan'), eat(), 'ほろにがくて、さわやか。', ['fruit', 'local']);
  D('dekopon', 'でこぽん 2こ', 'fruit', 380, 'cluster', { kind: 'dekopon', n: 2, cols: 2 }, farm('でこぽん', '', 'mikan'), eat('happy'), 'おでこがぽこっ。とても甘い。', ['fruit', 'local']);
  D('kaki', '柿 3こ', 'fruit', 300, 'cluster', { kind: 'kaki', n: 3 }, farm('柿'), { forage: 'kaki' }, '秋のおやつ。', ['fruit']);
  D('grape', 'ぶどう 1房', 'fruit', 680, 'cluster', { kind: 'grape' }, farm('ぶどう', '', 'grape', '#5a2a6a'), eat('happy'), 'あまい黒ぶどう。', ['fruit']);
  // --- fish counter ---
  D('f_madai', '天然まだい 1尾', 'fish', 1280, 'fish', { fid: 'madai', L: 0.34 }, { t: 'まだい', band: '#d8322a' }, { fish: 'madai', size: 34 }, '島の沖でとれた桜色の鯛。', ['fish', 'local']);
  D('f_aji', 'まあじ 3尾', 'fish', 380, 'fish', { fid: 'aji', L: 0.22, n: 3 }, { t: 'あじ', band: '#2a6ab0' }, { fish: 'aji', size: 22, n: 3 }, '刺身でも塩焼きでも。', ['fish']);
  D('f_mebaru', 'めばる 2尾', 'fish', 560, 'fish', { fid: 'mebaru', L: 0.22, n: 2 }, { t: 'めばる', band: '#5a3a2a' }, { fish: 'mebaru', size: 22, n: 2 }, '煮つけにぴったり。', ['fish']);
  D('f_sawara', 'さわら 1尾', 'fish', 980, 'fish', { fid: 'sawara', L: 0.42, ht: 0.18 }, { t: 'さわら', band: '#2a4a6a' }, { fish: 'sawara', size: 50 }, '春をつげる魚。', ['fish']);
  D('tako_b', 'ゆでだこ', 'fish', 680, 'tako', {}, { t: 'ゆでだこ', band: '#c8322a' }, eat('happy'), '島のマダコをゆでました。', ['fish', 'local']);
  D('sashimi', '刺身盛り合わせ', 'fish', 980, 'tray', { food: 'sashimi', w: 0.2, d: 0.15, dark: true }, { band: '#2a4a6a' }, eat('happy'), 'たい・はまち・まぐろ。', ['fish', 'meal']);
  D('shirasu', '釜あげしらす', 'fish', 480, 'tray', { food: 'shirasu', w: 0.15, d: 0.11 }, { band: '#2a6ab0' }, eat(), 'ごはんにのせて、しょうゆをちょっと。', ['fish', 'local']);
  D('himono', 'あじの干物 2枚', 'fish', 450, 'himono', {}, { t: 'あじの干物', band: '#c8822a' }, eat(), '浜風で干しました。', ['fish', 'local']);
  D('oyster', '殻むき かき', 'fish', 680, 'tray', { food: 'kaki_oyster', w: 0.16, d: 0.12 }, { band: '#2a5a8a' }, eat(), '加熱用。フライにどうぞ。', ['fish', 'local']);
  D('anago', '焼きあなご', 'fish', 900, 'tray', { food: 'anago', w: 0.2, d: 0.13 }, { band: '#5a2a0a' }, eat('happy'), '瀬戸内の名物。あなごめしに。', ['fish', 'local']);
  D('chirimen', 'ちりめんじゃこ', 'fish', 380, 'pouch', { w: 0.13, h: 0.17 }, { st: 'jp', bg: '#ffffff', band: '#2a6ab0', t: 'ちりめんじゃこ', s: '瀬戸内産', seal: '海' }, eat(), 'カルシウムたっぷり。', ['fish', 'local']);
  // --- flowers & plants (→ かざれる) ---
  D('pot_red', 'ゼラニウムの鉢', 'flower', 680, 'pot', { flower: '#e8324a' }, { st: 'clean', bg: '#ffffff', band: '#3a8a3a', em: 'flower', ec: '#e8324a', t: 'ゼラニウム' }, { furn: 'pot_flower', v: 0 }, '赤い花が長く咲きます。家にかざれます。', ['flower']);
  D('pot_yellow', 'マリーゴールドの鉢', 'flower', 580, 'pot', { flower: '#f2b020' }, { st: 'clean', bg: '#ffffff', band: '#3a8a3a', em: 'flower', ec: '#f2b020', t: 'マリーゴールド' }, { furn: 'pot_flower', v: 1 }, '元気なオレンジ。家にかざれます。', ['flower']);
  D('pot_white', 'マーガレットの鉢', 'flower', 680, 'pot', { flower: '#ffffff' }, { st: 'clean', bg: '#ffffff', band: '#3a8a3a', em: 'flower', ec: '#e8e8e8', t: 'マーガレット' }, { furn: 'pot_flower', v: 2 }, '白い花びら。家にかざれます。', ['flower']);
  D('pot_herb', 'バジルの苗', 'flower', 320, 'pot', { green: true, black: true, r: 0.05, h: 0.08 }, { st: 'clean', bg: '#ffffff', band: '#3a8a3a', em: 'leaf', t: 'バジル' }, { furn: 'pot_herb' }, '窓辺で育つハーブ。家にかざれます。', ['flower']);
  D('bouquet', '小さな花束', 'flower', 550, 'bouquet', {}, {}, { furn: 'vase_flower' }, 'プレゼントにどうぞ。かざると花びんにいけた花になります。', ['flower', 'cute']);
}
{ const D = GOODS.def, eat = (b) => ({ eat: true, buff: b }), drink = (b) => ({ drink: true, buff: b });
  // --- seed packets (the garden's seeds, same price as at the counter) ---
  const SEED_EM = { daikon: 'leaf', kabu: 'leaf', hourensou: 'leaf', negi: 'leaf', tamanegi: 'leaf', ichigo: 'heart', jagaimo: 'leaf', tomato: 'tomato', kyuri: 'leaf', nasu: 'grape', edamame: 'leaf', satsumaimo: 'leaf' };
  if (typeof CROPS !== 'undefined') for (const C of CROPS) D('seed_' + C.id, `${C.name}のたね`, 'seed', C.seed, 'card', { w: 0.085, h: 0.12 }, { st: 'book', bg: '#f6eed8', bg2: '#bfe0a8', band: 'rgba(255,255,255,.9)', em: SEED_EM[C.id] || 'leaf', ec: C.id === 'tomato' ? '#d8322a' : '#3a8a3a', t: C.name, s: `${C.days}日でとれる` }, { seed: C.id }, `家のよこの畑にまけます。${C.note || ''}`, ['seed']);
  // --- island specialities / souvenirs ---
  const jp = (t, s, band = '#c8322a', bg = '#f6eed8', seal = '島', em) => ({ st: 'jp', bg, band, t, s, seal, em });
  D('mikanmanju', 'みかんまんじゅう 10個', 'souvenir', 1080, 'giftbox', { w: 0.24, h: 0.05, d: 0.17, ribbon: '#f39a1e' }, jp('みかんまんじゅう', '島の銘菓', '#f39a1e', '#fff6e0', '菓', 'mikan'), eat('happy'), '白あんにみかんの皮をねりこんだ島の銘菓。', ['sweet', 'local', 'souvenir']);
  D('shimanami_manju', '星波まんじゅう 12個', 'souvenir', 1200, 'giftbox', { w: 0.26, h: 0.05, d: 0.18 }, jp('星波まんじゅう', 'こしあん', '#2a3a6a', '#eef0f6', '星'), eat('happy'), '星の焼き印のおまんじゅう。', ['sweet', 'local', 'souvenir']);
  D('lemoncake', '瀬戸内レモンケーキ 6個', 'souvenir', 980, 'giftbox', { w: 0.22, h: 0.06, d: 0.15, ribbon: '#f2d23a' }, { st: 'clean', bg: '#fffbe0', band: '#e8c020', em: 'lemon', t: 'レモンケーキ', s: '瀬戸内レモン使用' }, eat('happy'), 'レモンの形のしっとりケーキ。', ['sweet', 'local', 'souvenir']);
  D('takosenbei', 'たこせんべい', 'souvenir', 700, 'giftbox', { w: 0.24, h: 0.06, d: 0.16 }, jp('たこせんべい', 'まるごとプレス', '#c8322a', '#f6eed8', '蛸', 'tako'), eat(), 'たこをまるごとぎゅっと焼いたおせんべい。', ['snack', 'local', 'souvenir']);
  D('yokan', '島ようかん', 'souvenir', 850, 'box', { w: 0.24, h: 0.04, d: 0.06 }, jp('島ようかん', '本練', '#3a1a2a', '#f2eade', '羊'), eat(), 'どっしり甘いおやつ。', ['sweet', 'local', 'souvenir']);
  D('mikanjam', 'みかんジャム', 'local', 650, 'jar', { fill: '#f39a1e' }, { st: 'kraft', bg: '#fff0d0', band: '#fffaf0', em: 'mikan', t: 'みかんジャム', s: '手づくり 140g' }, eat('happy'), 'パンにぬって。', ['sweet', 'local', 'mikan']);
  D('lemoncurd', 'レモンカード', 'local', 750, 'jar', { fill: '#f2e060' }, { st: 'kraft', bg: '#fffbd8', band: '#fffaf0', em: 'lemon', t: 'レモンカード', s: '瀬戸内レモン' }, eat('happy'), 'とろりと甘ずっぱい。', ['sweet', 'local']);
  D('honey', 'みかんのはちみつ', 'local', 1200, 'jar', { fill: '#e8a020', r: 0.04, h: 0.11 }, { st: 'kraft', bg: '#fff0c8', band: '#fffaf0', em: 'flower', ec: '#e8a020', t: 'みかんの花のはちみつ', s: '島の養蜂場' }, eat('happy'), 'みかんの花の香り。', ['sweet', 'local']);
  D('juicegift', 'みかんジュース ギフト 3本', 'souvenir', 1800, 'box', { w: 0.24, h: 0.12, d: 0.09 }, { st: 'pop', bg: '#f39a1e', bg2: '#e8702a', fg: '#ffffff', em: 'mikan', ec: '#ffd23a', t: 'みかんジュース', s: 'ギフト3本入' }, drink('speed'), '贈りものに人気。', ['drink', 'local', 'souvenir', 'mikan']);
  D('saltgift', '藻塩ギフト', 'souvenir', 500, 'pouch', { w: 0.11, h: 0.15, d: 0.04 }, jp('藻塩', '海藻のうまみ', '#2a6ab0', '#eef4fa', '塩'), { cook: 'salt' }, 'ほんのり海藻の香り。', ['local', 'souvenir']);
  D('tenugui_wave', '手ぬぐい（波）', 'souvenir', 980, 'tenugui', {}, { st: 'tile', bg: '#2a4a8a', em: 'wave', ec: '#ffffff', n: 4 }, { furn: 'tenugui_frame', v: 0 }, '青海波の手ぬぐい。額に入れてかざれます。', ['souvenir', 'fashion']);
  D('tenugui_mikan', '手ぬぐい（みかん）', 'souvenir', 980, 'tenugui', {}, { st: 'tile', bg: '#fff6e0', em: 'mikan', n: 4 }, { furn: 'tenugui_frame', v: 1 }, 'みかん柄。額に入れてかざれます。', ['souvenir', 'fashion', 'mikan']);
  D('keyholder', '灯台キーホルダー', 'souvenir', 600, 'card', { w: 0.07, h: 0.12, charm: 'lighthouse', blister: true }, { st: 'book', bg: '#2a4a8a', bg2: '#5a8ad0', em: 'lighthouse', t: '島の灯台', s: 'KEY HOLDER' }, { keep: 1 }, '島の灯台のミニチュア。', ['souvenir', 'cute']);
  D('magnet', 'みかんマグネット', 'souvenir', 450, 'card', { w: 0.07, h: 0.1 }, { st: 'book', bg: '#fff6e0', bg2: '#ffe0a0', em: 'mikan', t: 'マグネット', s: '島みやげ' }, { keep: 1 }, '冷蔵庫にぺたり。', ['souvenir', 'cute', 'mikan']);
  D('postcard', '島の絵はがき 5枚', 'souvenir', 500, 'card', { w: 0.1, h: 0.15 }, { st: 'book', bg: '#f6d8a8', bg2: '#ffb07a', em: 'lighthouse', t: '絵はがき', s: 'ユキ 画' }, { keep: 1 }, 'ユキさんの水彩画のはがき。', ['souvenir', 'book']);
  D('ukidama', 'ガラスの浮き玉', 'souvenir', 1500, 'furn', { furn: 'ukidama', sc: 1 }, {}, { furn: 'ukidama' }, '昔の漁で使ったガラスの浮き。家にかざれます。', ['souvenir', 'cute']);
  D('seaglass_lamp', 'シーグラスのランプ', 'souvenir', 3800, 'furn', { furn: 'seaglass_lamp' }, {}, { furn: 'seaglass_lamp' }, '浜のシーグラスをはりつけたランプ。家にかざれます。', ['souvenir', 'cute']);
  // --- daily goods ---
  const clean = (t, s, band, em, brand) => ({ st: 'clean', bg: '#ffffff', band, em, t, s, brand });
  D('tp12', 'トイレットペーパー 12ロール', 'daily', 398, 'tp', {}, { st: 'clean', bg: '#ffffff', band: '#6ab0e0', em: 'flower', ec: '#e88aa8', t: 'やわらか', s: '12ロール ダブル' }, { keep: 1 }, '家にあると安心。', ['daily']);
  D('tissue', 'ボックスティッシュ 5箱', 'daily', 298, 'box', { w: 0.24, h: 0.25, d: 0.115 }, { st: 'clean', bg: '#ffffff', band: '#8ac86a', em: 'leaf', t: 'ティッシュ', s: '5箱パック' }, { keep: 1 }, 'ふんわり。', ['daily']);
  D('detergent', '洗たく洗剤', 'daily', 398, 'jug', { body: '#f6f6f2', cap: 'capB' }, clean('せんたく洗剤', '部屋干しOK', '#2a6ad0', 'bubble', 'さっぱり'), { keep: 1 }, 'お日さまのにおい。', ['daily']);
  D('dishsoap', '台所用洗剤', 'daily', 168, 'pump', { body: '#f2e060', r: 0.03, h: 0.18 }, clean('台所洗剤', 'レモンの香り', '#e8c020', 'lemon', 'ピカッと'), { keep: 1 }, 'レモンの香り。', ['daily']);
  D('shampoo', 'シャンプー', 'daily', 498, 'pump', { body: '#d8e8f4' }, clean('シャンプー', 'うみかぜの香り', '#2a8ad0', 'wave', 'しまなみ'), { keep: 1 }, '潮風でごわついた髪に。', ['daily']);
  D('battery', '乾電池 単3形 4本', 'daily', 398, 'card', { w: 0.1, h: 0.14, charm: 'battery', blister: true }, clean('単3形', 'アルカリ 4本', '#c8322a', 'star', 'パワー'), { keep: 1 }, '懐中電灯に。', ['daily']);
  D('sponge', 'キッチンスポンジ 3個', 'daily', 198, 'card', { w: 0.1, h: 0.15 }, clean('スポンジ', '3個入', '#3a9a4a', 'bubble', 'あわあわ'), { keep: 1 }, '泡立ちがいい。', ['daily']);
  D('umbrella', 'ビニール傘', 'daily', 550, 'umbrella', {}, {}, { keep: 1 }, '急な雨に。', ['daily']);
  D('kairo', 'カイロ 10個', 'daily', 398, 'bag', { w: 0.15, h: 0.2, d: 0.04 }, { st: 'pop', bg: '#e8502a', bg2: '#c8322a', fg: '#ffffff', em: 'sun', ec: '#ffd23a', ec2: '#ffffff', t: 'カイロ', s: '貼らないタイプ' }, { buffUse: 'warm' }, '冬の釣りのおともに。', ['daily', 'winter']);
  D('katori', 'かとりせんこう', 'daily', 398, 'box', { w: 0.16, h: 0.05, d: 0.16 }, { st: 'jp', bg: '#2a6a3a', band: '#e8c020', tc: '#ffffff', t: 'かとりせんこう', s: '10巻', seal: '夏' }, { buffUse: 'bugguard' }, '夏の夜の、なつかしいにおい。', ['daily', 'summer']);
  // --- stationery ---
  D('notebook', 'ノート 5冊', 'stationery', 498, 'book', { w: 0.18, h: 0.25, d: 0.02, spine: '#2a6ab0' }, { st: 'clean', bg: '#ffffff', band: '#2a6ab0', t: 'ノート', s: 'B5 5冊' }, { keep: 1 }, '学校で使うノート。', ['stationery']);
  D('pencils', 'えんぴつ 12本', 'stationery', 380, 'box', { w: 0.19, h: 0.03, d: 0.1 }, { st: 'clean', bg: '#ffffff', band: '#3a8a3a', em: 'star', t: 'えんぴつ', s: 'HB 12本' }, { keep: 1 }, 'けずりたての木の香り。', ['stationery']);
  D('crayon', 'クレヨン 16色', 'stationery', 480, 'box', { w: 0.2, h: 0.025, d: 0.14 }, { st: 'pop', bg: '#f2c230', bg2: '#e8902a', fg: '#ffffff', em: 'sun', ec: '#ffffff', ec2: '#e8402a', t: 'クレヨン', s: '16色' }, { keep: 1 }, '絵をかく人へのプレゼントに。', ['stationery', 'art']);
  D('sketchbook', 'スケッチブック', 'stationery', 550, 'book', { w: 0.26, h: 0.36, d: 0.012, spine: '#2a2a2a' }, { st: 'book', bg: '#f6f2e6', bg2: '#e8d8b8', em: 'mountain', ec: '#5a8ab0', t: 'SKETCH BOOK', s: 'F4' }, { keep: 1 }, '画用紙20枚。', ['stationery', 'art']);
  D('letterset', 'レターセット', 'stationery', 350, 'card', { w: 0.12, h: 0.17 }, { st: 'book', bg: '#fff0f2', bg2: '#ffd0d8', em: 'flower', ec: '#e8708a', t: 'レターセット', s: 'びんせん・ふうとう' }, { keep: 1 }, 'だれかに手紙を書きたくなる。', ['stationery', 'cute']);
}
{ const D = GOODS.def, eat = (b) => ({ eat: true, buff: b }), drink = (b) => ({ drink: true, buff: b });
  // --- books & magazines (you can read them: some are real guides to the island) ---
  const bk = (t, s, bg, bg2, em, ec, band) => ({ st: 'book', bg, bg2, em, ec, t, s, band });
  D('b_fishzukan', '瀬戸内の魚図鑑', 'book', 2200, 'book', { w: 0.15, h: 0.21, d: 0.025, spine: '#1a4a7a' }, bk('瀬戸内の魚図鑑', '釣り場・大きさ・季節', '#cfe8f6', '#3a8ad0', 'fish', '#1a4a7a'), { read: 'fishzukan' }, '島で釣れる魚がぜんぶのっている。どこで釣れるかもわかる。', ['book']);
  D('b_guide', '島のガイドブック', 'book', 900, 'book', { w: 0.13, h: 0.19, d: 0.015, spine: '#e8902a' }, bk('島ガイド', '名所・お店・遊び方', '#fff0d0', '#9fd2ff', 'lighthouse', '#2a6ab0'), { read: 'guide' }, '島の名所と、知っておくと便利なこと。', ['book', 'local']);
  D('b_cook', '島のおかず帖', 'book', 1500, 'book', { w: 0.18, h: 0.24, d: 0.015, spine: '#c8322a' }, bk('島のおかず帖', '魚・野菜・山の幸のレシピ', '#fff6e8', '#f6c8a0', 'cup', '#c8322a'), { read: 'cook' }, '家で作れる料理と材料が全部わかる。', ['book']);
  D('b_tsuri', '月刊 瀬戸内つり', 'book', 850, 'mag', {}, { st: 'mag', bg: '#1a4a7a', bg2: '#7ac0e8', em: 'fish', ec: '#ffffff', t: '瀬戸内つり', s: '今月の大物はここで釣れる！' }, { read: 'tsuri' }, '釣りのコツがのっている。', ['book', 'fishing']);
  D('b_weekly', '週刊しまなみ', 'book', 380, 'mag', {}, { st: 'mag', bg: '#c8322a', bg2: '#f6a07a', em: 'star', ec: '#ffd23a', t: '週刊しまなみ', s: '島のいまがわかる' }, { read: 'weekly' }, '島のニュース。', ['book']);
  D('b_paper', 'しまなみ新聞', 'book', 150, 'paper', {}, {}, { read: 'paper' }, '今日の天気と潮がのっている。', ['book']);
  D('b_ehon', '絵本「星波のうた」', 'book', 1200, 'book', { w: 0.22, h: 0.22, d: 0.012, spine: '#2a3a6a' }, bk('星波のうた', 'さく・え ミオ', '#2a3a6a', '#7a6ad0', 'star', '#ffd23a', 'rgba(255,255,255,.9)'), { read: 'ehon' }, 'ミオが作った絵本。', ['book', 'cute']);
  D('b_manga', 'まんが「島っ子ヒーロー」1巻', 'book', 520, 'book', { w: 0.11, h: 0.17, d: 0.015, spine: '#e8402a' }, bk('島っ子ヒーロー', 'ぜんぶで1巻', '#ffe0a0', '#ff8a6a', 'burst', '#e8402a'), { read: 'manga' }, 'コタロウのお気に入り。', ['book', 'toy']);
  D('b_novel', '小説「灯台守の夜」', 'book', 700, 'book', { w: 0.105, h: 0.15, d: 0.016, spine: '#1a2a3a' }, bk('灯台守の夜', '文庫', '#1a2a4a', '#3a5a8a', 'lighthouse', '#f6d23a', 'rgba(255,255,255,.85)'), { read: 'novel' }, '静かな夜に読みたい一冊。', ['book']);
  D('b_bugzukan', '島の虫図鑑', 'book', 1800, 'book', { w: 0.15, h: 0.21, d: 0.022, spine: '#3a7a2a' }, bk('島の虫図鑑', '季節と時間がわかる', '#e8f6d8', '#9ad07a', 'leaf', '#2a6a2a'), { read: 'bugzukan' }, '虫がいる季節と時間がわかる。', ['book']);
  // --- toys (→ かざれる) ---
  D('t_teddy', 'くまのぬいぐるみ', 'toy', 2500, 'plush', { kind: 'bear', col: '#c89a6a', col2: '#f6e2c8', s: 1.2 }, {}, { furn: 'plush', v: 0 }, 'ふかふか。家にかざれます。', ['toy', 'cute']);
  D('t_puzzle', 'ジグソーパズル「灯台のある島」', 'toy', 1500, 'box', { w: 0.28, h: 0.2, d: 0.05 }, { st: 'book', bg: '#f6d8a8', bg2: '#5ab0e8', em: 'lighthouse', t: 'ジグソーパズル', s: '500ピース' }, { furn: 'puzzle_frame' }, '完成したら額に入れてかざれます。', ['toy']);
  D('t_blocks', '木のつみき', 'toy', 2200, 'box', { w: 0.22, h: 0.16, d: 0.12 }, { st: 'kraft', bg: '#e8c890', em: 'star', ec: '#e8402a', t: 'つみき', s: '島の木で作りました' }, { furn: 'blocks' }, '家にかざれます。', ['toy', 'cute']);
  D('t_ball', 'ビーチボール', 'toy', 600, 'ball', { r: 0.1 }, {}, { furn: 'beachball' }, '夏の浜で。家にかざれます。', ['toy', 'summer']);
  D('t_train', '鉄道のおもちゃ', 'toy', 3800, 'box', { w: 0.32, h: 0.2, d: 0.08 }, { st: 'pop', bg: '#2a6ad0', bg2: '#1a4aa0', fg: '#ffffff', em: 'star', ec: '#f2d23a', ec2: '#e8402a', t: 'まちの鉄道', s: 'レールつき' }, { furn: 'trainset' }, '床に線路をしける。家にかざれます。', ['toy']);
  D('t_robot', 'ブリキのロボット', 'toy', 2800, 'box', { w: 0.15, h: 0.22, d: 0.1 }, { st: 'pop', bg: '#8a9aa8', bg2: '#4a5a68', fg: '#ffffff', em: 'star', ec: '#e8402a', ec2: '#f2d23a', t: 'ロボット', s: 'ゼンマイで歩く' }, { furn: 'toyrobot' }, '家にかざれます。', ['toy']);
  D('t_kite', '和だこ', 'toy', 900, 'card', { w: 0.2, h: 0.26 }, { st: 'jp', bg: '#f6eed8', band: '#c8322a', t: '和だこ', s: '正月あそび', seal: '凧' }, { furn: 'kite_wall' }, '壁にかざれます。', ['toy', 'local']);
  D('t_hanabi', '手持ち花火セット', 'toy', 680, 'card', { w: 0.24, h: 0.32 }, { st: 'pop', bg: '#1a2a5a', bg2: '#3a1a5a', fg: '#ffffff', em: 'star', ec: '#ffd23a', ec2: '#ff6a8a', t: '手持ち花火', s: '夜に外で遊ぼう' }, { hanabi: 1 }, '夜、外で使うと花火ができる。', ['toy', 'summer']);
  // --- clothes (you can wear them) ---
  const tee = (id, name, col, em, ec, t) => D(id, name, 'fashion', 1980, 'shirt', { col, em, ec, t }, {}, { wear: { top: col } }, '着るとシャツの色が変わります。', ['fashion']);
  tee('w_tee_white', '島Tシャツ（白）', '#f6f6f2', 'lighthouse', '#2a6ab0', 'HOSHINAMI'); tee('w_tee_navy', '島Tシャツ（紺）', '#2a3a6a', 'wave', '#ffffff', 'SETOUCHI'); tee('w_tee_mikan', 'みかんTシャツ', '#f39a1e', 'mikan', '#ffffff', 'MIKAN');
  tee('w_tee_green', 'Tシャツ（緑）', '#3f8a52', 'leaf', '#ffffff', 'ISLAND'); tee('w_tee_pink', 'Tシャツ（さくら）', '#f2a8c0', 'flower', '#ffffff', 'SAKURA'); tee('w_tee_yellow', 'Tシャツ（レモン）', '#f2d84a', 'lemon', '#2a6a2a', 'LEMON');
  const pants = (id, name, col) => D(id, name, 'fashion', 2980, 'shirt', { col, t: '' }, {}, { wear: { bottom: col } }, '着るとズボンの色が変わります。', ['fashion']);
  pants('w_pants_denim', 'デニムのズボン', '#3a5a8a'); pants('w_pants_beige', 'チノパン（ベージュ）', '#c8b48a'); pants('w_pants_black', 'ズボン（黒）', '#2a2a2e');
  D('w_hat', '麦わら帽子', 'fashion', 1500, 'hat', {}, {}, { furn: 'hat_wall' }, '夏の日ざしに。壁にかけてかざれます。', ['fashion', 'summer']);
  D('w_tote', '帆布のトートバッグ', 'fashion', 1200, 'tote', {}, { st: 'tile', bg: '#efe6d2', em: 'wave', ec: '#2a4a8a', n: 2, t: 'HOSHINAMI', band: 'rgba(255,255,255,0)', tc: '#2a4a8a' }, { keep: 1 }, '買いものに。', ['fashion']);
  D('w_sandal', 'ビーチサンダル', 'fashion', 980, 'sandals', { col: '#2a6ab0' }, {}, { keep: 1 }, '浜あるきに。', ['fashion', 'summer']);
  // --- zakka (interior goods → かざれる) ---
  const zk = (id, name, price, furn, v, note, tags = []) => D(id, name, 'zakka', price, 'furn', { furn, v }, {}, { furn, v }, note + '家にかざれます。', ['cute'].concat(tags));
  zk('z_mug', 'マグカップ 2個セット', 1200, 'mug_set', 0, 'ペアのマグ。'); zk('z_candle', 'アロマキャンドル', 1500, 'candle', 0, 'みかんの香り。'); zk('z_frame', 'フォトフレーム', 1800, 'photo_frame', 0, '島の写真入り。');
  zk('z_cushion_b', 'クッション（青）', 1600, 'cushion', 0, 'ふかふか。'); zk('z_cushion_y', 'クッション（からし）', 1600, 'cushion', 1, 'ふかふか。'); zk('z_cushion_r', 'クッション（赤）', 1600, 'cushion', 2, 'ふかふか。');
  zk('z_cactus', 'サボテンの鉢', 900, 'cactus', 0, '水やりはときどきでいい。', ['flower']); zk('z_globe', '地球儀', 4800, 'globe', 0, '島は…ちいさすぎてのってない。'); zk('z_lantern', '行灯', 5800, 'andon', 0, '和紙ごしのやわらかい光。');
  zk('z_furin', '江戸風鈴', 1800, 'furin', 0, 'ちりん。夏の音。', ['summer']); zk('z_daruma', 'だるま', 1500, 'daruma', 0, '願いがかなったら、もう片方の目を。'); zk('z_kokeshi', 'こけし', 2200, 'kokeshi', 0, 'やさしい顔。');
  zk('z_clock', '置き時計', 2800, 'clock_table', 0, '目覚ましつき。'); zk('z_radio', 'ラジオ', 3800, 'radio', 0, '漁師さんは天気予報をこれで聞く。'); zk('z_mirror', '卓上ミラー', 1500, 'mirror_stand', 0, '木のわくの鏡。');
  zk('z_diffuser', 'ルームフレグランス', 2400, 'diffuser', 0, 'レモングラスの香り。'); zk('z_vase', '一輪ざし', 1200, 'vase_flower', 1, '小さな花びん。', ['flower']); zk('z_books', '洋書のかざり本', 2000, 'books_stack', 0, '本棚の上に。');
  // --- fishing goods ---
  D('k_okiami', 'オキアミ（冷凍エサ）', 'fishing', 300, 'box', { w: 0.2, h: 0.05, d: 0.14 }, { st: 'pop', bg: '#e86a6a', bg2: '#c83a3a', fg: '#ffffff', em: 'fish', ec: '#ffd23a', ec2: '#ffffff', t: 'オキアミ', s: 'まきエサ・さしエサ' }, { buffUse: 'fish' }, '使うとしばらく魚がよく食いつく（10分）。', ['fishing']);
  D('k_shikake', 'サビキ仕掛け', 'fishing', 450, 'card', { w: 0.1, h: 0.18, blister: true }, { st: 'clean', bg: '#ffffff', band: '#2a6ab0', em: 'fish', t: 'サビキ仕掛け', s: 'アジ・サバに' }, { buffUse: 'fish' }, '使うとしばらく魚がよく食いつく（10分）。', ['fishing']);
  D('k_lure', 'ミノー（ルアー）', 'fishing', 980, 'card', { w: 0.09, h: 0.16, charm: 'lure', blister: true }, { st: 'clean', bg: '#ffffff', band: '#e8402a', t: 'ミノー', s: 'シーバス・メバルに' }, { keep: 1 }, 'ゲンじいが「最近のは本物みたいじゃのう」とうなる。', ['fishing']);
  D('k_gunte', '軍手', 'fishing', 150, 'card', { w: 0.09, h: 0.17 }, { st: 'clean', bg: '#ffffff', band: '#3a3a3a', t: '軍手', s: '1双' }, { keep: 1 }, '魚をつかむときに。', ['fishing', 'daily']);
  // --- café menu (eat in or take out) ---
  const cafe = (id, name, price, sh, o, use, note, tags) => D(id, name, 'cafe', price, sh, o, {}, use, note, ['cafe'].concat(tags || []));
  cafe('c_blend', 'ブレンドコーヒー', 420, 'mug', { liq: '#3a1a0a' }, drink('speed'), '深いりの香り。', ['coffee', 'drink']); cafe('c_latte', 'カフェラテ', 480, 'mug', { liq: '#b8865a' }, drink('happy'), 'ミルクたっぷり。', ['coffee', 'drink']);
  cafe('c_lemontea', 'レモンティー', 450, 'mug', { liq: '#c8701a', col: '#ffffff' }, drink('happy'), '瀬戸内レモンをうかべて。', ['tea', 'drink']); cafe('c_mikan', '生しぼりみかんジュース', 500, 'mug', { liq: '#f39a1e', col: '#e8f6fa' }, drink('speed'), 'その場でしぼります。', ['drink', 'mikan']);
  cafe('c_short', 'いちごのショートケーキ', 480, 'cakeSlice', { kind: 'short' }, eat('happy'), 'いちごがまるごと。', ['sweet']); cafe('c_cheese', 'ベイクドチーズケーキ', 450, 'cakeSlice', { kind: 'cheese' }, eat('happy'), 'こんがり、こっくり。', ['sweet']);
  cafe('c_choco', 'ガトーショコラ', 480, 'cakeSlice', { kind: 'choco' }, eat('happy'), 'しっとり濃厚。', ['sweet']); cafe('c_lemoncake', 'レモンのケーキ', 420, 'cakeSlice', { kind: 'lemon' }, eat('happy'), '島のレモンで。', ['sweet', 'local']);
  cafe('c_pudding', '昔ながらのプリン', 350, 'pudding', {}, eat('happy'), 'かためでほろにが。', ['sweet']); cafe('c_parfait', 'みかんパフェ', 780, 'parfait', {}, eat('happy'), 'みかんとソフトクリーム。', ['sweet', 'mikan']);
  cafe('c_curry', '島カレー', 850, 'plate', { food: 'curry', side: '#a8681a' }, eat('speed'), '魚介のだしのカレー。', ['meal']); cafe('c_napolitan', 'ナポリタン', 800, 'plate', { food: 'napolitan', side: '#d8582a' }, eat('speed'), 'ケチャップの、なつかしい味。', ['meal']);
  cafe('c_softcream', 'みかんソフト', 380, 'softcream', { col: '#f8d48a' }, eat('cool'), '道の駅の名物ソフトクリーム。', ['sweet', 'ice', 'mikan']); cafe('c_takeout', 'テイクアウトコーヒー', 380, 'drinkcup', { lid: '#3a2a1e' }, drink('speed'), '歩きながら。', ['coffee', 'drink']);
  // --- aquarium shop ---
  const aq = (id, name, price, kind, col, col2, v) => D(id, name, 'aqua', price, 'plush', { kind, col, col2 }, {}, { furn: 'plush', v }, 'ふわふわのぬいぐるみ。家にかざれます。', ['toy', 'cute', 'aqua']);
  aq('a_dolphin', 'イルカのぬいぐるみ', 1800, 'dolphin', '#6aa8e0', '#f2f6fa', 1); aq('a_tako', 'タコのぬいぐるみ', 1500, 'tako', '#e8604a', '#ffffff', 2); aq('a_whale', 'ジンベエザメのぬいぐるみ', 2400, 'whale', '#3a5a7a', '#f2f6fa', 3); aq('a_penguin', 'ペンギンのぬいぐるみ', 1800, 'penguin', '#2a2e3a', '#f6f6f2', 4);
  D('a_cookie', 'おさかなクッキー', 'aqua', 800, 'giftbox', { w: 0.2, h: 0.05, d: 0.14, ribbon: '#2a8ad0' }, { st: 'tile', bg: '#cfe8f6', em: 'fish', ec: '#2a6ab0', n: 3, t: 'おさかなクッキー' }, eat('happy'), '魚の形のクッキー。', ['sweet', 'aqua', 'souvenir']);
  D('a_key', 'ミニ水そうキーホルダー', 'aqua', 700, 'card', { w: 0.07, h: 0.12, charm: 'fish', blister: true }, { st: 'book', bg: '#cfe8f6', bg2: '#3a8ad0', em: 'fish', ec: '#ffffff', t: 'ミニ水そう', s: 'KEY HOLDER' }, { keep: 1 }, '小さな魚がゆれる。', ['aqua', 'cute', 'souvenir']);
}
// in-season / not: some goods only appear at some times of the year
GOODS.season = { kakigori: [6, 9], t_hanabi: [6, 9], ramune: [5, 9], kairo: [11, 3], katori: [6, 9], hakusai: [11, 3], kabocha: [8, 11], kaki: [9, 12], dekopon: [1, 4], hassaku: [1, 4], mikanbag: [10, 3], mikanbox: [10, 3], f_sawara: [3, 6], edamame: [6, 9], grape: [8, 10], oyster: [11, 3] };
GOODS.inSeason = id => { const s = GOODS.season[id]; if (!s) return true; const m = (typeof seasonDate === 'function' ? seasonDate() : new Date()).getMonth() + 1; return s[0] <= s[1] ? m >= s[0] && m <= s[1] : m >= s[0] || m <= s[1]; };
// ---------- building, placing on shelves, thumbnails ----------
GOODS.get = function (id) {
  if (GOODS.built[id]) return GOODS.built[id]; const [bid, vk] = String(id).split('@'), P = GOODS.byId[bid]; let grp; // 'id@hang' = the same product shown another way
  try { grp = GS[vk || P.sh](P, P.o || {}); } catch (e) { console.warn('goods build', id, e); grp = new THREE.Group(); GX.box(grp, 0.1, 0.1, 0.1, GOODS.mats().card); }
  const B = GOODS.bake(grp), bb = B.bb; grp.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
  B.geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); B.geo.computeBoundingBox(); B.geo.computeBoundingSphere(); try { GOODS.atlasize(B); } catch (e) { console.warn('atlas', id, e); } return (GOODS.built[id] = B);
};
// ---------- one product = one material: plain colours and printed labels go into one small picture (atlas); roughness/metalness into a second one ----------
// (glass, clear plastic, glowing or two-sided parts keep their own material). Fewer materials → far fewer draw calls on a full shelf.
GOODS.atlasC = {};
GOODS.atlasize = function (B) {
  let geo = B.geo; const mats = B.mats; if (!geo || !mats || mats.length < 2 || !geo.groups.length) return B; if (geo.index) { const gs = geo.groups.slice(); geo = geo.toNonIndexed(); geo.clearGroups(); for (const g of gs) geo.addGroup(g.start, g.count, g.materialIndex); } const uv = geo.attributes.uv; if (!uv) return B;
  const okMat = m => m && m.isMeshStandardMaterial && !m.transparent && m.side === THREE.FrontSide && !(m.emissive && m.emissive.getHex() !== 0 && m.emissiveIntensity > 0.01) && !m.normalMap && !m.alphaMap && (!m.map || (m.map.image && m.map.image.width && m.map.repeat.x === 1 && m.map.repeat.y === 1 && !m.map.offset.x && !m.map.offset.y && !m.map.rotation));
  const merge = new Set(); mats.forEach((m, i) => { if (okMat(m)) merge.add(i); });
  for (const g of geo.groups) { if (!merge.has(g.materialIndex) || !mats[g.materialIndex].map) continue; for (let k = g.start; k < g.start + g.count; k++) { const u = uv.getX(k), v = uv.getY(k); if (u < -0.002 || u > 1.002 || v < -0.002 || v > 1.002) { merge.delete(g.materialIndex); break; } } }
  if (merge.size < 2) return B; const mi = [...merge], key = mi.map(i => mats[i].uuid).join('|');
  let A = GOODS.atlasC[key];
  if (!A) { const SW = 16, PAD = 4, cols = mi.filter(i => !mats[i].map), texs = mi.filter(i => mats[i].map); let W = 64; for (const i of texs) W = Math.max(W, Math.min(256, mats[i].map.image.width)); W = Math.min(256, W);
    const slot = {}; let y = 0, x = 0; for (const i of cols) { if (x + SW + PAD * 2 > W) { x = 0; y += SW + PAD * 2; } slot[i] = { x: x + PAD, y: y + PAD, w: SW, h: SW, col: 1 }; x += SW + PAD * 2; } if (cols.length) y += SW + PAD * 2;
    for (const i of texs) { const im = mats[i].map.image, w = Math.min(W - PAD * 2, im.width), h = Math.max(4, Math.round(im.height * w / im.width)); slot[i] = { x: PAD, y: y + PAD, w, h }; y += h + PAD * 2; }
    const H = Math.max(16, y), [cv, c] = cvs(W, H), [cv2, c2] = cvs(W, H);
    for (const i of mi) { const m = mats[i], S2 = slot[i], col = m.color.getStyle(); const ex = S2.col ? PAD : 2; c2.fillStyle = `rgb(0,${Math.round(clamp(m.roughness, 0, 1) * 255)},${Math.round(clamp(m.metalness, 0, 1) * 255)})`; c2.fillRect(S2.x - ex, S2.y - ex, S2.w + ex * 2, S2.h + ex * 2);
      if (S2.col) { c.fillStyle = col; c.fillRect(S2.x - PAD, S2.y - PAD, S2.w + PAD * 2, S2.h + PAD * 2); }
      else { const im = m.map.image; c.drawImage(im, S2.x - 2, S2.y - 2, S2.w + 4, S2.h + 4); c.drawImage(im, S2.x, S2.y, S2.w, S2.h); if (m.color.getHex() !== 0xffffff) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = col; c.fillRect(S2.x - 2, S2.y - 2, S2.w + 4, S2.h + 4); c.restore(); } } }
    const t = toTex(cv, false); t.anisotropy = 4; const t2 = new THREE.CanvasTexture(cv2); t2.colorSpace = THREE.NoColorSpace;
    A = GOODS.atlasC[key] = { W, H, slot, mat: new THREE.MeshStandardMaterial({ map: t, roughnessMap: t2, metalnessMap: t2, roughness: 1, metalness: 1 }) }; }
  // rebuild the geometry: every merged part first (one group), then the parts that keep their own material
  const pos = geo.attributes.position, nrm = geo.attributes.normal, parts = [{ list: geo.groups.filter(g => merge.has(g.materialIndex)), mat: A.mat }].concat(geo.groups.filter(g => !merge.has(g.materialIndex)).map(g => ({ list: [g], mat: mats[g.materialIndex] })));
  const n = geo.groups.reduce((s2, g) => s2 + g.count, 0), P2 = new Float32Array(n * 3), N2 = new Float32Array(n * 3), U2 = new Float32Array(n * 2), groups = [], outM = []; let o = 0;
  for (const pt of parts) { const st = o; for (const g of pt.list) { const S2 = A.slot[g.materialIndex], tx = merge.has(g.materialIndex); for (let k = g.start; k < g.start + g.count; k++, o++) { P2[o * 3] = pos.getX(k); P2[o * 3 + 1] = pos.getY(k); P2[o * 3 + 2] = pos.getZ(k); N2[o * 3] = nrm.getX(k); N2[o * 3 + 1] = nrm.getY(k); N2[o * 3 + 2] = nrm.getZ(k);
        if (!tx) { U2[o * 2] = uv.getX(k); U2[o * 2 + 1] = uv.getY(k); } else if (S2.col) { U2[o * 2] = (S2.x + S2.w / 2) / A.W; U2[o * 2 + 1] = 1 - (S2.y + S2.h / 2) / A.H; } else { U2[o * 2] = (S2.x + clamp(uv.getX(k), 0, 1) * S2.w) / A.W; U2[o * 2 + 1] = 1 - (S2.y + (1 - clamp(uv.getY(k), 0, 1)) * S2.h) / A.H; } } }
    if (o > st) { groups.push({ start: st, count: o - st, materialIndex: outM.length }); outM.push(pt.mat); } }
  const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.BufferAttribute(P2, 3)); g2.setAttribute('normal', new THREE.BufferAttribute(N2, 3)); g2.setAttribute('uv', new THREE.BufferAttribute(U2, 2)); for (const g of groups) g2.addGroup(g.start, g.count, g.materialIndex);
  g2.computeBoundingBox(); g2.computeBoundingSphere(); geo.dispose(); B.geo = g2; B.mats = outM; return B; };
GOODS.size = id => { const B = GOODS.get(id); return [B.w, B.h, B.d]; };
// a stocker collects where each product goes, then makes one InstancedMesh per product; every placement can be hidden (taken) or shown (put back)
GOODS.stocker = function (group) {
  // products in the back rows are drawn with a lighter model (fewer segments); when the one in front is taken, the nearest one behind it gets the full model
  const S = { g: group, pend: {}, mesh: {}, sec: [] }, Z = new THREE.Matrix4().makeScale(0, 0, 0);
  S.section = (info) => { const sc = Object.assign({ stock: {}, prods: [] }, info); S.sec.push(sc); return sc; };
  S.keyOf = {}; S.put = (id, x, y, z, ry = 0, sc = null, s = 1, front = 0, rx = 0, key = null) => { if (!GOODS.byId[id]) return; if (key) S.keyOf[id] = key; (S.pend[id] = S.pend[id] || []).push({ x, y, z, ry, sc, s, front, rx }); if (sc && !sc.prods.includes(id)) sc.prods.push(id); };
  // every InstancedMesh draws only its first .count instances: a placement owns a slot while it is shown, taking one out moves the last slot into its place
  // (nothing is drawn twice and nothing is drawn as a zero-size copy)
  const T4 = new THREE.Matrix4(), add = (m, p, mat) => { const k = m.count; m.setMatrixAt(k, mat); m.userData.at[k] = p; p.slot = k; m.count = k + 1; m.instanceMatrix.needsUpdate = true; m.visible = true; },
    del = (m, p) => { const k = p.slot, last = m.count - 1; if (k === undefined || k < 0 || k > last) return; if (k !== last) { m.getMatrixAt(last, T4); m.setMatrixAt(k, T4); const q = m.userData.at[last]; m.userData.at[k] = q; q.slot = k; } m.userData.at[last] = null; p.slot = -1; m.count = last; m.instanceMatrix.needsUpdate = true; m.visible = m.count > 0; };
  S.finish = () => { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sv = new THREE.Vector3();
    for (const [id, list] of Object.entries(S.pend)) { const key = S.keyOf[id] || id, B = GOODS.get(key), triN = (B.geo.index ? B.geo.index.count : B.geo.attributes.position.count) / 3, back = triN > 260 ? list.filter(p => !p.front) : [], L = back.length ? GOODS.getLite(key) : null, im = new THREE.InstancedMesh(B.geo, B.mats, list.length), il = L ? new THREE.InstancedMesh(L.geo, L.mats, back.length) : null;
      for (const m of il ? [im, il] : [im]) { m.castShadow = false; m.receiveShadow = true; m.userData.goods = id; m.userData.at = []; m.count = 0; }
      list.forEach((p, i) => { q.setFromEuler(new THREE.Euler(p.rx || 0, p.ry, 0, 'YXZ')); m4.compose(v.set(p.x, p.y, p.z), q, sv.setScalar(p.s)); p.m = m4.clone(); p.i = i; if (!p.front && il) { p.lite = true; add(il, p, p.m); } else { p.lite = false; add(im, p, p.m); } if (p.sc) (p.sc.stock[id] = p.sc.stock[id] || []).push(i); });
      // the bounding sphere covers every place an item may be shown, so a promoted item is never culled by mistake
      const pts = list.map(p => new THREE.Vector3().setFromMatrixPosition(p.m)); for (const [m, G] of il ? [[im, B], [il, L]] : [[im, B]]) { m.boundingSphere = new THREE.Sphere().setFromPoints(pts); m.boundingSphere.radius += G.geo.boundingSphere.radius; m.frustumCulled = true; S.g.add(m); }
      S.mesh[id] = { im, il, list }; }
    S.pend = {}; return S; };
  S.hide = (M, i) => { const p = M.list[i]; if (p.lite) { del(M.il, p); p.lite = false; } else del(M.im, p); };
  S.full = (M, i) => { const p = M.list[i]; if (p.lite) { del(M.il, p); p.lite = false; } if (!(p.slot >= 0) || M.im.userData.at[p.slot] !== p) add(M.im, p, p.m); };
  S.count = (sc, id) => (sc.stock[id] || []).filter(i => !S.mesh[id].list[i].gone).length;
  S.take = (sc, id) => { const M = S.mesh[id]; if (!M) return null; const idx = (sc.stock[id] || []).filter(i => !M.list[i].gone); if (!idx.length) return null; // the one nearest the front edge goes first
    const i = idx.sort((a, b) => (M.list[b].front || 0) - (M.list[a].front || 0))[0], P = M.list[i]; P.gone = true; S.hide(M, i);
    if (P.front) { let bj = -1, bd = 1e9; for (const j of idx) { const Q = M.list[j]; if (j === i || Q.gone || !Q.lite) continue; const d = (Q.x - P.x) ** 2 + (Q.y - P.y) ** 2 + (Q.z - P.z) ** 2; if (d < bd) { bd = d; bj = j; } } if (bj >= 0) S.full(M, bj); }
    return P; };
  S.putBack = (sc, id) => { const M = S.mesh[id]; if (!M) return; const i = (sc.stock[id] || []).find(k => M.list[k].gone); if (i === undefined) return; M.list[i].gone = false; S.full(M, i); };
  return S;
};
// the same product with fewer segments (for the rows behind the front one)
GOODS.getLite = function (id) { const k = id + '#lite'; if (GOODS.built[k]) return GOODS.built[k]; const [bid, vk] = String(id).split('@'), P = GOODS.byId[bid]; if (!P || P.sh === 'furn' || P.sh === 'plush') return (GOODS.built[k] = GOODS.get(id)); let grp; GOODS._lite = true;
  try { grp = GS[vk || P.sh](P, P.o || {}); } catch (e) { GOODS._lite = false; return (GOODS.built[k] = GOODS.get(id)); } GOODS._lite = false;
  const B = GOODS.bake(grp), bb = B.bb; grp.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); B.geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); B.geo.computeBoundingBox(); B.geo.computeBoundingSphere(); try { GOODS.atlasize(B); } catch (e) { } return (GOODS.built[k] = B); };
// a 3D picture of the product for menus (its own little renderer, cached as an image)
GOODS.thumbC = {};
// one small renderer for every picture in the menus (goods and furniture share it: fewer WebGL contexts)
GOODS.thumbR = function () { return GOODS._tr || (GOODS._tr = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 144; const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.setClearColor(0x000000, 0);
      const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight('#ffffff', '#b8b0a8', 1.5)); const dl = new THREE.DirectionalLight('#fff8f0', 2.0); dl.position.set(2, 4, 3); sc.add(dl); const dl2 = new THREE.DirectionalLight('#dfe8ff', 0.6); dl2.position.set(-3, 1, -1); sc.add(dl2); return { cv, r, sc, cam: new THREE.PerspectiveCamera(26, 1, 0.005, 30) }; })()); };
GOODS.thumb = function (id) {
  if (GOODS.thumbC[id]) return GOODS.thumbC[id];
  try {
    const T = GOODS.thumbR(); T.r.setSize(144, 144, false);
    const B = GOODS.get(id), m = new THREE.Mesh(B.geo, B.mats); T.sc.add(m); const bs = B.geo.boundingSphere, rad = bs.radius, c = bs.center;
    const dist = rad / Math.sin(THREE.MathUtils.degToRad(13)) * 1.05, dir = new THREE.Vector3(0.45, 0.42, 1).normalize(); T.cam.position.copy(c).addScaledVector(dir, dist); T.cam.lookAt(c); T.cam.near = dist * 0.05; T.cam.far = dist * 4; T.cam.updateProjectionMatrix();
    T.r.render(T.sc, T.cam); const url = T.cv.toDataURL('image/png'); T.sc.remove(m); return (GOODS.thumbC[id] = url);
  } catch (e) { console.warn('thumb', id, e); return (GOODS.thumbC[id] = ''); }
};
