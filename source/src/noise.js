// ===================== NOISE & MATH =====================
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function hash2(x, y, s) { let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (s | 0) * 1442695041; h = (h ^ (h >>> 13)) * 1274126177; h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s = 0, o = 5) { let v = 0, a = 0.5, f = 1, t = 0; for (let i = 0; i < o; i++) { v += vnoise(x * f, y * f, s + i * 17) * a; t += a; a *= 0.5; f *= 2.03; } return v / t; }
function ridged(x, y, s = 0, o = 4) { let v = 0, a = 0.5, f = 1, t = 0; for (let i = 0; i < o; i++) { v += (1 - Math.abs(vnoise(x * f, y * f, s + i * 31) * 2 - 1)) * a; t += a; a *= 0.5; f *= 2.1; } return v / t; }
// periodic value noise (for tileable textures)
function pnoise(x, y, p, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const m = k => ((k % p) + p) % p;
  const a = hash2(m(xi), m(yi), s), b = hash2(m(xi + 1), m(yi), s), c = hash2(m(xi), m(yi + 1), s), d = hash2(m(xi + 1), m(yi + 1), s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function pfbm(x, y, p, s = 0, o = 5) { let v = 0, a = 0.5, f = 1, t = 0; for (let i = 0; i < o; i++) { v += pnoise(x * f, y * f, p * f, s + i * 13) * a; t += a; a *= 0.5; f *= 2; } return v / t; }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
