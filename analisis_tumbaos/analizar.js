/* =====================================================================
   Análisis del piano de un MIDI de salsa/timba
   uso como módulo: analizarArchivo(ruta) → compases con acorde, lado de clave y ataques del piano
   ===================================================================== */
const path = require('path');
const { load, gmName } = require('./smf.js');
const { analizarGrilla } = require('./grilla.js');

const NOM = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const nom = m => NOM[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const pc = m => ((m % 12) + 12) % 12;
// grado de una nota respecto de la fundamental del acorde
const GRADO = ['1', 'b9', '9', 'b3', '3', '11', '#11', '5', 'b13', '13', 'b7', '7'];
const CAL = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], sus4: [0, 5, 7], aug: [0, 4, 8] };
const PESOS = { 0: 1.25, 3: 1, 4: 1, 7: 0.75, 10: 0.9, 11: 0.9, 6: 1, 9: 0.9, 5: 0.9, 8: 0.9 };
const PLANT = {};
for (const q in CAL) { const v = new Array(12).fill(0); for (const i of CAL[q]) v[i] = PESOS[i] ?? 1; const n = Math.hypot(...v); PLANT[q] = v.map(x => x / n); }

// perfiles de Krumhansl para la tonalidad
const KMAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], KMIN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
function corr(a, b) { const ma = a.reduce((x, y) => x + y) / 12, mb = b.reduce((x, y) => x + y) / 12; let n = 0, da = 0, db = 0; for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return n / Math.sqrt(da * db || 1); }
function tonalidad(ch) { let best = null; for (let r = 0; r < 12; r++) for (const [m, prof] of [['mayor', KMAJ], ['menor', KMIN]]) { const c = corr(ch, prof.map((_, i) => prof[(i - r + 12) % 12])); if (!best || c > best.c) best = { raiz: r, modo: m, c }; } return best; }

function croma(notas, a, b, bonus = 0.5) {
  const v = new Array(12).fill(0);
  for (const n of notas) { if (n.off <= a || n.on >= b) continue; const o = Math.min(n.off, b) - Math.max(n.on, a); v[pc(n.p)] += o + (n.on >= a ? bonus : 0); }
  return v;
}
function norm(v) { const n = Math.hypot(...v); return n ? v.map(x => x / n) : v; }
function mejorAcorde(cp, cb, graveRaiz) {
  const c = norm(cp.map((x, i) => x + 0.8 * cb[i] * (Math.hypot(...cp) / (Math.hypot(...cb) || 1))));
  if (!c.some(x => x)) return null;
  let best = null;
  for (let r = 0; r < 12; r++) for (const q in PLANT) {
    const t = PLANT[q]; let s = 0; for (let i = 0; i < 12; i++) s += c[(i + r) % 12] * t[i];
    if (graveRaiz === r) s += 0.12;
    s -= 0.015 * (CAL[q].length - 3) + (q === 'aug' || q === 'sus4' ? 0.04 : 0);
    if (!best || s > best.s) best = { raiz: r, q, s };
  }
  best.nombre = NOM[best.raiz] + best.q; best.pcs = CAL[best.q].map(i => (i + best.raiz) % 12);
  return best;
}
function graveDe(notas, a, b) { // la nota del bajo con más presencia en la ventana
  const w = {}; for (const n of notas) { if (n.off <= a || n.on >= b) continue; const k = pc(n.p); w[k] = (w[k] || 0) + Math.min(n.off, b) - Math.max(n.on, a); }
  let best = null; for (const k in w) if (best == null || w[k] > w[best]) best = k; return best == null ? null : +best;
}

function canalesPiano(s) {
  const ch = {};
  for (const t of s.tracks) for (const n of t.notes) if (n.ch !== 9) (ch[n.ch] = ch[n.ch] || { notas: [], prog: null, nombre: t.name }).notas.push(n);
  for (const t of s.tracks) for (const c in t.programs) if (ch[c] && ch[c].prog == null) ch[c].prog = t.programs[c];
  const ps = Object.entries(ch).filter(([c, x]) => (x.prog != null && x.prog <= 7) || /piano/i.test(x.nombre)).map(([c, x]) => ({ ch: +c, ...x })).sort((a, b) => b.notas.length - a.notas.length);
  return ps.filter((x, i) => i === 0 || x.notas.length >= 0.25 * ps[0].notas.length);
}

// agrupa notas casi simultáneas en ataques y los cuantiza: corchea salvo que la semicorchea sea clara
function ataques(notas) {
  const ns = notas.slice().sort((a, b) => a.on - b.on), out = [];
  let g = [];
  const cerrar = () => {
    if (!g.length) return;
    const ons = g.map(n => n.on).sort((a, b) => a - b), med = ons[ons.length >> 1];
    const q16 = Math.abs(med - Math.round(med)) <= 0.3 ? Math.round(med) * 2 : Math.round(med * 2);
    const ps = [...new Set(g.map(n => n.p))].sort((a, b) => a - b);
    out.push({ q16, ps, dur: Math.max(...g.map(n => n.off)) - med, vel: g.reduce((a, n) => a + n.v, 0) / g.length });
    g = [];
  };
  for (const n of ns) { if (g.length && n.on - g[0].on > 0.2) cerrar(); g.push(n); }
  cerrar();
  // dos grupos que cayeron en la misma semicorchea se funden
  const m = [];
  for (const a of out) { const l = m[m.length - 1]; if (l && l.q16 === a.q16) { l.ps = [...new Set([...l.ps, ...a.ps])].sort((x, y) => x - y); l.dur = Math.max(l.dur, a.dur); } else m.push(a); }
  return m;
}

// textura de un ataque: derecha = notas dentro de la octava de arriba; izquierda = lo que queda abajo
function textura(ps) {
  const top = ps[ps.length - 1], der = ps.filter(x => x >= top - 12), izq = ps.filter(x => x < top - 12);
  let d;
  if (der.length === 1) d = 'sola';
  else if (der.includes(top - 12)) { const inn = der.filter(x => x > top - 12 && x < top).length; d = inn === 0 ? 'octava' : inn === 1 ? 'octava+1' : 'octava+2'; }
  else if (der.length === 2) { const iv = top - der[0]; d = 'díada ' + ({ 1: '2a', 2: '2a', 3: '3a', 4: '3a', 5: '4a', 6: 'trítono', 7: '5a', 8: '6a', 9: '6a', 10: '7a', 11: '7a' }[iv]); }
  else d = 'acorde';
  let i = 'nada';
  if (izq.length) {
    const it = izq[izq.length - 1], db = der[0], dif = db - it;
    const dobla = izq.every(x => pc(x) === pc(db) || pc(x) === pc(top));
    if (dobla && izq.length <= 2) i = dif === 12 ? 'dobla 8va' : dif === 24 ? 'dobla 2 8vas' : 'dobla lejos';
    else if (izq.length === 1 && (top - it === 27 || top - it === 28 || dif === 15 || dif === 16)) i = 'décima';
    else if (izq.length === 1) i = 'nota suelta';
    else i = 'acorde/octava propia';
  }
  return { der: d, izq: i, top, nDer: der.length, nIzq: izq.length };
}

function analizarArchivo(ruta) {
  const s = load(ruta), g = analizarGrilla(s), U = g.U;
  const pianos = canalesPiano(s);
  const bajo = (g.bajo || []).map(n => ({ p: n.pitch, on: U(n.on), off: U(n.off), v: n.vel }));
  const total = Math.max(...s.tracks.flatMap(t => t.notes.map(n => U(n.off))));
  // compases según la fase de cada ventana de 4 compases
  const compases = []; let prevX = -1e9;
  for (let w = 0; w < g.fasesW.length; w++) {
    const c = g.fasesW[w];
    for (let x = 32 * w + ((((c - 32 * w) % 8) + 8) % 8); x < 32 * w + 32; x += 8) {
      if (x < prevX + 8 || x > total) continue;
      const lado = ((((x - c) % 16) + 16) % 16) === 0 ? 'A' : 'B';
      const cal = g.calidad[Math.floor(x / 8)];
      compases.push({ i: compases.length, x, lado, fase: c % 8, grillaOK: cal == null || cal >= 0.8 }); prevX = x;
    }
  }
  const partes = pianos.map(pn => {
    const notas = pn.notas.map(n => ({ p: n.pitch, on: U(n.on), off: U(n.off), v: n.vel }));
    return { canal: pn.ch + 1, programa: gmName(pn.prog), notas, ataques: ataques(notas) };
  });
  const pPrincipal = partes[0].notas;
  // tonalidad del tema
  const chTot = croma(pPrincipal.concat(bajo), -1e9, 1e9, 0);
  const ton = tonalidad(chTot);
  // acorde por compás (o por mitad), con ventanas corridas para que entren los anticipos
  for (const b of compases) {
    const x = b.x;
    const ent = mejorAcorde(croma(pPrincipal, x - 1, x + 7), croma(bajo, x - 2, x + 6), graveDe(bajo, x - 2, x + 6));
    const m1 = mejorAcorde(croma(pPrincipal, x - 1, x + 3), croma(bajo, x - 2, x + 2), graveDe(bajo, x - 2, x + 2));
    const m2 = mejorAcorde(croma(pPrincipal, x + 3, x + 7), croma(bajo, x + 2, x + 6), graveDe(bajo, x + 2, x + 6));
    if (ent && m1 && m2 && m1.nombre !== m2.nombre && (m1.s + m2.s) / 2 > ent.s + 0.06) b.acordes = [m1, m2];
    else b.acordes = ent ? [ent] : [];
  }
  // ataques de cada parte, repartidos por compás (posición en semicorcheas 0..15)
  for (const pt of partes) {
    pt.compases = compases.map(b => {
      const as = pt.ataques.filter(a => a.q16 >= 2 * b.x && a.q16 < 2 * b.x + 16).map(a => ({ ...a, pos: a.q16 - 2 * b.x, tex: textura(a.ps) }));
      const n = as.length, off = as.filter(a => a.pos % 4 === 2).length, durMed = n ? as.reduce((s_, a) => s_ + a.dur, 0) / n : 0;
      const tipo = !n ? 'silencio' : (n >= 4 && durMed <= 2.5 && off >= 2) ? 'montuno' : 'otro';
      return { i: b.i, tipo, as };
    });
  }
  return { archivo: path.basename(ruta), ppq: s.ppq, segs: g.segs, clave: g.clave ? { instrumento: g.clave.pitch, tipo: g.clave.tipo } : null, ladoSeguro: g.ladoSeguro, tonalidad: { raiz: NOM[ton.raiz], modo: ton.modo, pc: ton.raiz }, compases, partes, bajo };
}

module.exports = { analizarArchivo, nom, pc, NOM, GRADO, CAL, textura };
