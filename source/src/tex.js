// ===================== PROCEDURAL TEXTURES =====================
const TEX = {};
function cvs(w, h = w) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function toTex(c, repeat = true, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true; return t;
}
const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
function pixelTex(size, fn) { // fn(u,v) -> [r,g,b,a?]
  const [c, x] = cvs(size); const img = x.createImageData(size, size), d = img.data;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) { const p = fn(i, j), k = (j * size + i) * 4; d[k] = p[0]; d[k + 1] = p[1]; d[k + 2] = p[2]; d[k + 3] = p[3] === undefined ? 255 : p[3]; }
  x.putImageData(img, 0, 0); return [c, x];
}
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function wrapDraw(size, x, y, r, fn) { for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) { const px = x + ox, py = y + oy; if (px > -r && px < size + r && py > -r && py < size + r) fn(px, py); } }

function makeTextures() {
  const R = mulberry(42);
  // ---- grass ground ----
  {
    const S = 512, A = hex('#3f7a26'), B = hex('#6eae38'), Y = hex('#a0b84a');
    const [c, x] = pixelTex(S, (i, j) => { const n = pfbm(i / 64, j / 64, 8, 1, 4), m = pfbm(i / 128, j / 128, 4, 7, 3); let col = mixc(A, B, n); col = mixc(col, Y, Math.max(0, m - 0.55) * 1.6); const f = (hash2(i, j, 3) - 0.5) * 18; return [col[0] + f, col[1] + f, col[2] + f * 0.6]; });
    for (let k = 0; k < 9000; k++) {
      const px = R() * S, py = R() * S, len = 4 + R() * 9, ang = -Math.PI / 2 + (R() - 0.5) * 1.2, g = 90 + R() * 90;
      x.strokeStyle = `rgba(${g * 0.62 | 0},${g * 1.08 | 0},${g * 0.32 | 0},${0.35 + R() * 0.4})`; x.lineWidth = 1 + R() * 0.8;
      wrapDraw(S, px, py, 14, (a, b) => { x.beginPath(); x.moveTo(a, b); x.lineTo(a + Math.cos(ang) * len, b + Math.sin(ang) * len); x.stroke(); });
    }
    TEX.grass = toTex(c);
  }
  // ---- dirt ----
  {
    const S = 512, A = hex('#6b5034'), B = hex('#9a7a52');
    const [c, x] = pixelTex(S, (i, j) => { const n = pfbm(i / 48, j / 48, 10.666, 3, 5); const col = mixc(A, B, n); const f = (hash2(i, j, 5) - 0.5) * 26; return [col[0] + f, col[1] + f, col[2] + f]; });
    for (let k = 0; k < 900; k++) { const px = R() * S, py = R() * S, r = 1 + R() * 3, g = 120 + R() * 80; x.fillStyle = `rgba(${g},${g * 0.92 | 0},${g * 0.82 | 0},0.7)`; wrapDraw(S, px, py, 4, (a, b) => { x.beginPath(); x.ellipse(a, b, r, r * 0.7, R() * 3, 0, 7); x.fill(); }); }
    TEX.dirt = toTex(c);
  }
  // ---- rock ----
  {
    const S = 512, A = hex('#6d665c'), B = hex('#a39c8e'), C = hex('#8a7a62');
    TEX.rock = toTex(pixelTex(S, (i, j) => {
      const n = pfbm(i / 40, j / 22, 12.8, 11, 5), s = pfbm(i / 90, j / 12, 5.69, 19, 3), cr = Math.abs(pnoise(i / 26, j / 26, 19.69, 23) - 0.5);
      let col = mixc(A, B, n); col = mixc(col, C, s * 0.5); if (cr < 0.025) col = mixc(col, [50, 46, 42], 0.6); const f = (hash2(i, j, 9) - 0.5) * 22; return [col[0] + f, col[1] + f, col[2] + f];
    })[0]);
  }
  // ---- sand ----
  {
    const S = 512, A = hex('#d9c38c'), B = hex('#efdfb2');
    const [c, x] = pixelTex(S, (i, j) => { const n = pfbm(i / 32, j / 32, 16, 31, 4), w = Math.sin((i + pfbm(i / 50, j / 50, 10.24, 2, 3) * 60) / 9) * 0.5 + 0.5; let col = mixc(A, B, n * 0.7 + w * 0.3); const f = (hash2(i, j, 13) - 0.5) * 30; const sp = hash2(i, j, 14) > 0.993 ? -60 : 0; return [col[0] + f + sp, col[1] + f + sp, col[2] + f + sp]; });
    TEX.sand = toTex(c);
  }
  // ---- asphalt ----
  {
    const S = 512, A = hex('#34373d'), B = hex('#4b4e55');
    TEX.asphalt = toTex(pixelTex(S, (i, j) => { const n = pfbm(i / 60, j / 60, 8.53, 41, 4); let col = mixc(A, B, n); const f = (hash2(i, j, 17) - 0.5) * 34, sp = hash2(i, j, 18) > 0.985 ? 40 : 0; return [col[0] + f + sp, col[1] + f + sp, col[2] + f + sp]; })[0]);
  }
  // ---- concrete ----
  {
    const S = 512, A = hex('#a9a69e'), B = hex('#c9c5bb');
    TEX.concrete = toTex(pixelTex(S, (i, j) => { const n = pfbm(i / 50, j / 50, 10.24, 51, 5), st = pfbm(i / 20, j / 120, 25.6, 53, 3); let col = mixc(A, B, n); col = mixc(col, [120, 116, 108], Math.max(0, st - 0.6) * 1.5); const f = (hash2(i, j, 19) - 0.5) * 16; return [col[0] + f, col[1] + f, col[2] + f]; })[0]);
  }
  // ---- stone revetment (voronoi stones) ----
  {
    const S = 512, pts = []; const R2 = mulberry(7);
    for (let k = 0; k < 70; k++) pts.push([R2() * S, R2() * S, 0.75 + R2() * 0.3, R2()]);
    TEX.stonewall = toTex(pixelTex(S, (i, j) => {
      let d1 = 1e9, d2 = 1e9, best = null;
      for (const p of pts) for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { const d = Math.hypot(i - p[0] - ox, (j - p[1] - oy) * 1.25); if (d < d1) { d2 = d1; d1 = d; best = p; } else if (d < d2) d2 = d; }
      const edge = d2 - d1; const n = pfbm(i / 30, j / 30, 17.06, 61, 4);
      let col = mixc([125, 120, 108], [178, 170, 152], best[3] * 0.6 + n * 0.4); col = col.map(v => v * best[2]);
      if (edge < 4) col = mixc(col, [70, 66, 60], 1 - edge / 4); else col = col.map(v => v * (1 - Math.max(0, 10 - edge) * 0.012));
      return col;
    })[0]);
  }
  // ---- plaster wall ----
  {
    const S = 512, A = hex('#e6e0d2'), B = hex('#f5f1e8');
    TEX.plaster = toTex(pixelTex(S, (i, j) => { const n = pfbm(i / 40, j / 40, 12.8, 71, 5), st = pfbm(i / 60, j / 25, 8.53, 73, 3); let col = mixc(A, B, n); col = mixc(col, [190, 182, 165], Math.max(0, st - 0.62) * 1.2); const f = (hash2(i, j, 23) - 0.5) * 8; return [col[0] + f, col[1] + f, col[2] + f]; })[0]);
  }
  // ---- red brick ----
  {
    const S = 512;
    TEX.brick = toTex(pixelTex(S, (i, j) => { const bh = 16, bw = 48, row = Math.floor(j / bh), off = row % 2 ? bw / 2 : 0, col = Math.floor((i + off) / bw); const mx = (i + off) % bw, my = j % bh;
      const mortar = mx < 3 || my < 3; const n = pfbm(i / 30, j / 30, 17.06, 131, 3), v = hash2(col, row, 133);
      if (mortar) return [196 + n * 20, 190 + n * 20, 178 + n * 18];
      const base = mixc([150, 62, 44], [182, 92, 64], v); const f = (hash2(i, j, 135) - 0.5) * 18; return [base[0] * (0.85 + n * 0.3) + f, base[1] * (0.85 + n * 0.3) + f, base[2] * (0.85 + n * 0.3) + f]; })[0]);
  }
  // ---- wood planks (horizontal) ----
  {
    const S = 512, A = hex('#5a3d26'), B = hex('#8a6440');
    TEX.wood = toTex(pixelTex(S, (i, j) => { const plank = Math.floor(j / 32), g = pfbm(i / 80, j / 3, 6.4, 81 + plank, 4), seam = j % 32 < 2 ? 0.55 : 1; let col = mixc(A, B, g * 0.8 + hash2(plank, 0, 5) * 0.3); return col.map(v => v * seam); })[0]);
  }
  // ---- kawara roof tiles (U = across slope, V = down slope) ----
  {
    const S = 512, A = hex('#3d4550'), B = hex('#6d7886');
    TEX.kawara = toTex(pixelTex(S, (i, j) => {
      const cw = 32, row = 42, cx = (i % cw) / cw, ry = (j % row) / row, rowi = Math.floor(j / row);
      const cyl = Math.sin(cx * Math.PI); let k = 0.35 + cyl * 0.65; if (ry > 0.88) k *= 0.45; else k *= 0.85 + ry * 0.2;
      const n = pfbm(i / 30, j / 30, 17.06, 91, 3), w = hash2(Math.floor(i / cw), rowi, 93);
      let col = mixc(A, B, k * 0.8 + n * 0.2); col = col.map(v => v * (0.9 + w * 0.15)); return col;
    })[0]);
  }
  // ---- leaves card (alpha) ----
  {
    const S = 512; const [c, x] = cvs(S); const R3 = mulberry(11);
    for (let k = 0; k < 700; k++) {
      const a = R3() * Math.PI * 2, r = Math.sqrt(R3()) * S * 0.44, px = S / 2 + Math.cos(a) * r, py = S / 2 + Math.sin(a) * r * 0.9;
      const lit = 1 - (py / S) * 0.55 + (R3() - 0.5) * 0.25, g = clamp(lit, 0.35, 1.15);
      const gg = 175 * g + R3() * 30; x.fillStyle = `rgb(${gg | 0},${gg | 0},${gg * 0.95 | 0})`;
      x.save(); x.translate(px, py); x.rotate(R3() * Math.PI * 2); x.beginPath(); x.ellipse(0, 0, 9 + R3() * 6, 4 + R3() * 3, 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(30,60,20,.35)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(-8, 0); x.lineTo(8, 0); x.stroke(); x.restore();
    }
    TEX.leaves = toTex(c, false);
  }
  // ---- foliage (neutral, tinted by vertex colors) ----
  {
    const S = 512; const [c, x] = cvs(S); x.fillStyle = '#b8b8b8'; x.fillRect(0, 0, S, S); const R7 = mulberry(21);
    for (let k = 0; k < 2400; k++) {
      const px = R7() * S, py = R7() * S, g = 150 + R7() * 105;
      x.fillStyle = `rgb(${g | 0},${g | 0},${g * 0.96 | 0})`;
      wrapDraw(S, px, py, 16, (a, b) => { x.save(); x.translate(a, b); x.rotate(R7() * 6.28); x.beginPath(); x.ellipse(0, 0, 10 + R7() * 6, 5 + R7() * 2.5, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.ellipse(-2, -1.5, 5, 2, 0, 0, 7); x.fill(); x.restore(); });
    }
    TEX.foliage = toTex(c);
  }
  // ---- bark ----
  TEX.bark = toTex(pixelTex(256, (i, j) => { const n = pfbm(i / 10, j / 60, 25.6, 141, 4), s = pfbm(i / 40, j / 40, 6.4, 143, 3); const v = 120 + n * 90 + s * 30; return [v, v * 0.94, v * 0.86]; })[0]);
  // ---- grass tuft (alpha) ----
  {
    const S = 256; const [c, x] = cvs(S); const R4 = mulberry(13);
    for (let k = 0; k < 90; k++) {
      const bx = S * 0.15 + R4() * S * 0.7, h = S * (0.45 + R4() * 0.5), lean = (R4() - 0.5) * 60, g = 90 + R4() * 90;
      const grd = x.createLinearGradient(0, S, 0, S - h); grd.addColorStop(0, `rgb(${g * 0.35 | 0},${g * 0.62 | 0},${g * 0.2 | 0})`); grd.addColorStop(1, `rgb(${g * 0.6 | 0},${g | 0},${g * 0.35 | 0})`);
      x.fillStyle = grd; x.beginPath(); x.moveTo(bx - 3, S); x.quadraticCurveTo(bx + lean * 0.3, S - h * 0.5, bx + lean, S - h); x.quadraticCurveTo(bx + lean * 0.3 + 2, S - h * 0.5, bx + 3, S); x.fill();
    }
    TEX.tuft = toTex(c, false);
  }
  // ---- flowers (alpha): white umbels and yellow ----
  for (const [name, col, umbel] of [['flowerW', '#f6f3ea', true], ['flowerY', '#f2c230', false]]) {
    const S = 256; const [c, x] = cvs(S); const R5 = mulberry(name.length * 7);
    for (let k = 0; k < 7; k++) {
      const bx = S * 0.2 + R5() * S * 0.6, top = S * (0.15 + R5() * 0.35), lean = (R5() - 0.5) * 40;
      x.strokeStyle = '#4f7a2e'; x.lineWidth = 3; x.beginPath(); x.moveTo(bx, S); x.quadraticCurveTo(bx + lean * 0.4, (S + top) / 2, bx + lean, top); x.stroke();
      for (let l = 0; l < 3; l++) { x.fillStyle = '#5a8a34'; x.beginPath(); x.ellipse(bx + lean * 0.3 + (R5() - 0.5) * 24, S - R5() * S * 0.5, 12, 4, R5() * 3, 0, 7); x.fill(); }
      const fx = bx + lean, fy = top;
      if (umbel) for (let d = 0; d < 26; d++) { const a = R5() * 6.28, r = R5() * 22; x.fillStyle = d % 5 ? col : '#e8e0c8'; x.beginPath(); x.arc(fx + Math.cos(a) * r, fy + Math.sin(a) * r * 0.45, 3.4, 0, 7); x.fill(); }
      else { for (let p = 0; p < 10; p++) { const a = p / 10 * 6.28; x.fillStyle = col; x.beginPath(); x.ellipse(fx + Math.cos(a) * 9, fy + Math.sin(a) * 9 * 0.7, 7, 3.2, a, 0, 7); x.fill(); } x.fillStyle = '#b5781a'; x.beginPath(); x.arc(fx, fy, 5, 0, 7); x.fill(); }
    }
    TEX[name] = toTex(c, false);
  }
  // ---- cloud sprites: soft cumulus — lit domed tops, grey-blue flat bases, wispy eroded edges (3 variants) ----
  {
    const W = 512, H = 256; TEX.clouds = [];
    for (let v = 0; v < 3; v++) {
      const R6 = mulberry(5 + v * 11), bl = [], flat = H * (0.72 + R6() * 0.05), tall = v === 2 ? 0.55 : v === 1 ? 0.8 : 1;
      const nb = 38 + v * 10;
      // 2–3 towers of different height, each a heap of puffs, plus small "cauliflower" puffs on the surface
      const towers = []; const nt = 2 + (R6() < 0.6 ? 1 : 0); for (let q = 0; q < nt; q++) towers.push([0.22 + (q + R6() * 0.6) / nt * 0.6, (0.45 + R6() * 0.55) * tall, 0.12 + R6() * 0.1]);
      for (let k = 0; k < nb; k++) { const T = towers[k % nt], t = T[0] + (R6() - 0.5) * T[2] * 2, hgt = T[1] * (0.3 + 0.7 * Math.pow(R6(), 0.6)), r = 14 + (1 - Math.abs(t - T[0]) / T[2]) * 30 * T[1] + R6() * 12; bl.push([W * t, flat - r * 0.45 - hgt * H * 0.5, r]); }
      for (let k = 0; k < 18; k++) { const t = 0.08 + R6() * 0.84; bl.push([W * t, flat - 6 - R6() * 10, 10 + R6() * 12]); } // ragged skirt along the base
      const nB = bl.length; for (let k = 0; k < nB * 2; k++) { const [bx, by, r] = bl[k % nB], a = -Math.PI * (0.1 + R6() * 0.8); bl.push([bx + Math.cos(a) * r * 0.8, by + Math.sin(a) * r * 0.8, r * (0.3 + R6() * 0.25)]); }
      const den = new Float32Array(W * H), top = Math.max(4, Math.min(...bl.map(([, by, r]) => by - r * 0.9)));
      for (const [bx, by, r] of bl) { const e = r * 2.2, x0 = Math.max(0, bx - e | 0), x1 = Math.min(W - 1, bx + e | 0), y0 = Math.max(0, by - e | 0), y1 = Math.min(H - 1, by + e | 0), ir = 1.4 / (r * r);
        for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const dx = i - bx, dy = j - by; den[j * W + i] += Math.exp(-(dx * dx + dy * dy) * ir); } }
      const [c, x] = cvs(W, H), img = x.createImageData(W, H), D = img.data;
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        const k = j * W + i, nz = pfbm(i / 30, j / 30, 64, 31 + v, 4), nz2 = pfbm(i / 9, j / 9, 64, 37 + v, 3);
        let dn = den[k] * (0.55 + 0.75 * nz) * (0.85 + 0.3 * nz2);
        dn *= 1 - sstep(flat - 10, flat + 8, j + (nz - 0.5) * 10); // flat base, slightly ragged
        const a = sstep(0.3, 0.95, dn);
        if (a <= 0) { D[k * 4 + 3] = 0; continue; }
        // light from above: density stacked above this pixel shades it; the base is in shadow
        let above = 0; for (let q = 4; q <= 28; q += 6) { const jj = j - q; if (jj >= 0) above += den[jj * W + i]; }
        const hy = Math.max(0, Math.min(1, (flat - j) / (flat - top))); // 0 at the flat base, 1 at the highest tower
        const sh = Math.max(0, Math.min(1, Math.pow(1 - hy, 1.6) * 0.62 + Math.min(1, above * 0.05) * 0.25 + (nz2 - 0.5) * 0.14 - 0.04));
        const lit = [255, 254, 248], shade = [146, 158, 178];
        for (let ch = 0; ch < 3; ch++) D[k * 4 + ch] = lit[ch] * (1 - sh) + shade[ch] * sh;
        D[k * 4 + 3] = a * 255;
      }
      x.putImageData(img, 0, 0); TEX.clouds.push(toTex(c, false));
    }
    TEX.cloud = TEX.clouds[0];
  }
  // ---- water normal map ----
  {
    const S = 256, hgt = new Float32Array(S * S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) hgt[j * S + i] = pfbm(i / 32, j / 32, 8, 101, 5) + Math.sin((i + j * 0.3) / S * Math.PI * 12) * 0.05;
    TEX.waterN = toTex(pixelTex(S, (i, j) => { const l = hgt[j * S + ((i - 1 + S) % S)], r = hgt[j * S + (i + 1) % S], u = hgt[((j - 1 + S) % S) * S + i], d = hgt[((j + 1) % S) * S + i]; const nx = (l - r) * 6, ny = (u - d) * 6, nz = 1, L = Math.hypot(nx, ny, nz); return [(nx / L * 0.5 + 0.5) * 255, (ny / L * 0.5 + 0.5) * 255, (nz / L * 0.5 + 0.5) * 255]; })[0], true, false);
  }
  // ---- macro variation noise (non-color) ----
  TEX.macro = toTex(pixelTex(256, (i, j) => { const n = pfbm(i / 64, j / 64, 4, 111, 5) * 255; return [n, pfbm(i / 32, j / 32, 8, 113, 4) * 255, pfbm(i / 16, j / 16, 16, 117, 3) * 255]; })[0], true, false);
}
