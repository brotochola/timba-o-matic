/* =====================================================================
   Comparar: recrea un pedazo de un tema con el motor y lo compara con el original, instrumento por instrumento
   uso: node analisis_tumbaos/comparar.js "tema.mid" desde cantidad [opciones JSON de la sección] [--ver piano,bajo,perc] [--detalle]
     desde, cantidad: compases del tema (los del analizador: un compás = un lado de la clave)
     opciones: lo que va en la sección de la canción, p. ej. '{"marcha":"marcha","estilo":"salsabrava","semilla":3,"pianoComo":"pupy"}'
   Para cada instrumento y cada lado de la clave: en qué semicorcheas ataca (probabilidad 0-9 por posición), densidad,
   fuerza de los golpes; en el piano además textura, mano izquierda, registro y anticipos; en el bajo, anticipos y registro.
   Parecido = 1 − diferencia de las probabilidades por posición / su suma (1 = igual, 0 = nada que ver).
   La percusión se compara en notas General MIDI (como queda en el .mid), con la que de verdad suena (aprendida o clásica).
   ===================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const TM = require('./motor');

function cadenaPagina() {
  // el intérprete de la página (secciones 1 a 4), para la percusión clásica que arma la página
  const L = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').split('\n');
  const i0 = L.findIndex(l => l.includes('1. TOKENIZER')) - 1, i1 = L.findIndex(l => l.includes('5. ENGRAVING WITH VEXFLOW')) - 1;
  const ctx = { window: {}, TumbaoMotor: TM, console }; ctx.globalThis = ctx; ctx.window = ctx;
  vm.createContext(ctx); vm.runInContext(L.slice(i0, i1).join('\n') + '\n;globalThis.__api={parse,evaluate,buildNotes};', ctx);
  return ctx;
}
function modeloDeEntrada() {
  const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'base_tumbaos.json'), 'utf8'));
  const LOCAL = path.join(__dirname, 'base_local.js');
  let loc = []; if (fs.existsSync(LOCAL)) { require(LOCAL); loc = (globalThis.BASE_TUMBAOS_LOCAL || {}).fuentes || []; }
  return { base, M: TM.construirModelo(base.fuentes.filter(f => !f.coleccion).concat(loc)) };
}

// ---------- el original: compás por compás, lo de cada instrumento en semicorcheas desde el 1
function original(archivo, desde, n, perfil, meta = {}) {
  const det = TM.analizarDetalle(TM.leerMidi(fs.readFileSync(archivo)), meta);
  if (det.ladoFuente === 'sin' && perfil) TM.deducirLados(det, perfil, true);
  const C = det.compases.slice(desde, desde + n), pt = det.partes[0];
  const bares = C.map(b => ({
    lado: b.lado, acordes: b.acordes.map(a => a.nombre),
    piano: pt ? pt.compases[b.i].as.map(a => ({ pos: a.pos, ps: a.ps.slice().sort((x, y) => x - y), v: a.vel })) : [],
    bajo: det.bajoAt.filter(a => a.q16 >= 2 * b.x && a.q16 < 2 * b.x + 16).map(a => ({ pos: a.q16 - 2 * b.x, ps: [a.p], v: a.vel })),
    // la clave del original (si la tocó otro instrumento, p. ej. un bloque) cuenta como clave
    perc: det.bateria.map(h => ({ pos: Math.round(h.u * 2) - 2 * b.x, gm: det.clave && h.alt === det.clave.instrumento ? 75 : h.alt, v: h.v })).filter(h => h.pos >= 0 && h.pos < 16)
  }));
  return { det, bares, clave: det.clave ? det.clave.tipo : null };
}

// ---------- la app: una sección con los acordes del original, en la misma clave y del mismo largo
function recrear(ref, opciones, M, ctx) {
  let ult = 'C';
  const prog = ref.bares.map(b => { const a = b.acordes.length ? b.acordes : [ult]; ult = a[a.length - 1]; return a.slice(0, 2).join('+'); }).join(' ');
  const tipo = /rumba/.test(ref.clave || '') ? 'rumba' : 'son', clave = `${tipo} ${ref.bares[0].lado === 'A' ? '3-2' : '2-3'}`;
  const sec = { id: 's', nombre: '', prog, vueltas: 1, marcha: 'marcha', estilo: 'pupy', semilla: 1, perillas: {}, ...opciones };
  const r = TM.generarCancion({ titulo: '', clave, perillas: {}, secciones: [sec] }, M);
  ctx.__percMotor = { id: 'motor-c', compases: r.perc, extra: r.extra, mix: r.mixes, estilo: r.estilos };
  const { parse, evaluate, buildNotes } = ctx.__api;
  const score = evaluate(parse(TM.aLilyPond(r, { clave, bpm: 190, percusionId: 'motor-c' }))), notas = buildNotes(score);
  const ms = score.measures, barOf = t => ms.findIndex(m => t >= m.start && t < m.end);
  const bares = r.lados.map((lado, b) => ({ lado, acordes: r.acordes[b].map(c => c.nombre), piano: [], bajo: [], perc: [] }));
  const mano = {};
  for (const e of r.der.concat(r.izq)) { const k = e.p; (mano[k] = mano[k] || { pos: e.p % 16, b: Math.floor(e.p / 16), ps: [], v: 0 }); mano[k].ps.push(...e.ps); mano[k].v = Math.max(mano[k].v, e.v); }
  for (const a of Object.values(mano)) if (bares[a.b]) bares[a.b].piano.push({ pos: a.pos, ps: a.ps.sort((x, y) => x - y), v: a.v });
  for (const e of r.bajo) { const b = Math.floor(e.p / 16); if (bares[b]) bares[b].bajo.push({ pos: e.p % 16, ps: e.ps, v: e.v }); }
  for (const n of notas.filter(n => n.drum)) {
    const i = barOf(n.t), m = ms[i]; if (!bares[i] || !TM.APP_GM[n.drum]) continue;
    bares[i].perc.push({ pos: Math.round((n.t - m.start) / ((m.end - m.start) / 16)) % 16, gm: TM.APP_GM[n.drum], v: Math.round(Math.min(127, 100 * (n.vel || 1))), d: n.drum });
  }
  return { r, bares, clave, sec };
}

// ---------- medidas
const GM_NOM = { 35: 'bombo2', 36: 'bombo', 37: 'aro', 38: 'caja', 39: 'palmas', 40: 'caja2', 41: 'tom grave', 42: 'charles', 44: 'charles pie', 45: 'tom', 46: 'charles ab.', 47: 'tom medio', 48: 'tom ag.', 49: 'crash', 51: 'ride', 52: 'china', 53: 'ride bell',
  56: 'cencerro', 57: 'crash2', 59: 'ride2', 60: 'bongó ag.', 61: 'bongó gr.', 62: 'conga apag.', 63: 'conga abierta', 64: 'tumba', 65: 'timbal ag.', 66: 'timbal gr.', 67: 'agogó ag.', 68: 'agogó gr.', 69: 'cabasa', 70: 'maracas',
  73: 'güiro corto', 74: 'güiro largo', 75: 'clave', 76: 'bloque ag.', 77: 'bloque gr.', 79: 'cuíca ab.', 80: 'triáng. apag.' };
const SIN_PUNTAJE = [69, 70, 82];   // cabasa, maracas, shaker
const prob = (bares, lado, f) => { const bs = bares.filter(b => b.lado === lado), p = Array(16).fill(0); for (const b of bs) for (const q of new Set(f(b))) if (q >= 0 && q < 16) p[q]++; return { p: p.map(x => bs.length ? x / bs.length : 0), n: bs.length }; };
const parecido = (a, b) => { let d = 0, s = 0; for (let i = 0; i < 16; i++) { d += Math.abs(a[i] - b[i]); s += a[i] + b[i]; } return s ? 1 - d / s : 1; };
const dig = p => p.map((x, i) => (i % 4 ? '' : '|') + (x <= 0 ? '.' : String(Math.min(9, Math.max(1, Math.round(x * 9)))))).join('') + '|';
const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const mediana = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const nm = m => m == null ? '-' : ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const textura = ps => { const top = ps[ps.length - 1], der = ps.filter(x => x >= top - 12); return der.length === 1 ? 'sola' : der.includes(top - 12) ? 'octava' : der.length === 2 ? 'díada' : 'acorde'; };
const suaves = vs => { if (vs.length < 4) return null; const mx = Math.max(...vs); return vs.filter(v => v < 0.7 * mx).length / vs.length; };
// anticipos: en los cambios de acorde, ¿hay ataque en el 4& (o en el 4) y el 1 que sigue queda sin atacar?
function anticipos(bares) {
  let cambios = 0, en4y = 0, en4 = 0, ligados = 0;
  for (let i = 0; i + 1 < bares.length; i++) {
    const a = bares[i], b = bares[i + 1], ult = a.acordes[a.acordes.length - 1], sig = b.acordes[0];
    if (!ult || !sig || ult === sig) continue;
    cambios++;
    const k = x => x.some(e => e.pos === 14), c = x => x.some(e => e.pos === 12);
    if (k(a.instr)) en4y++; else if (c(a.instr)) en4++;
    if ((k(a.instr) || c(a.instr)) && !b.instr.some(e => e.pos === 0)) ligados++;
  }
  return { cambios, en4y, en4, ligados };
}

function comparar(ref, app, ver, detalle) {
  const out = [], notas = {};
  const filas = (titulo, fR, fA) => {
    let suma = 0, peso = 0;
    for (const lado of ['A', 'B']) {
      const R = prob(ref.bares, lado, fR), A = prob(app.bares, lado, fA);
      if (!R.n && !A.n) continue;
      const s = parecido(R.p, A.p), w = R.p.reduce((x, y) => x + y, 0) + A.p.reduce((x, y) => x + y, 0);
      suma += s * w; peso += w;
      if (detalle || titulo.length < 30) out.push(`  ${titulo.padEnd(26)} ${lado === 'A' ? 'lado 3' : 'lado 2'}  orig ${dig(R.p)}  app ${dig(A.p)}  parecido ${s.toFixed(2)}`);
    }
    return peso ? suma / peso : 1;
  };
  if (ver.includes('piano')) {
    out.push('PIANO');
    const s = filas('ataques', b => b.piano.map(a => a.pos), b => b.piano.map(a => a.pos));
    const tex = bs => { const t = {}; let n = 0; for (const b of bs) for (const a of b.piano) { t[textura(a.ps)] = (t[textura(a.ps)] || 0) + 1; n++; } return Object.entries(t).map(([k, v]) => k + ' ' + Math.round(100 * v / n) + '%').join(', '); };
    const izq = bs => { let n = 0, c = 0; for (const b of bs) for (const a of b.piano) { n++; if (a.ps.some(x => x < a.ps[a.ps.length - 1] - 12)) c++; } return n ? Math.round(100 * c / n) + '%' : '-'; };
    const top = bs => nm(mediana(bs.flatMap(b => b.piano.map(a => a.ps[a.ps.length - 1]))));
    const dens = bs => media(bs.map(b => b.piano.length)).toFixed(1);
    const ant = bs => { const x = anticipos(bs.map(b => ({ ...b, instr: b.piano }))); return `${x.en4y}/${x.cambios} en el 4&, ${x.en4} en el 4, ${x.ligados} ligados`; };
    out.push(`  densidad ${dens(ref.bares)} → ${dens(app.bares)} ataques por compás · textura: ${tex(ref.bares)} → ${tex(app.bares)}`);
    out.push(`  mano izquierda debajo de la octava: ${izq(ref.bares)} → ${izq(app.bares)} · nota de arriba (mediana) ${top(ref.bares)} → ${top(app.bares)} · anticipos: ${ant(ref.bares)} → ${ant(app.bares)}`);
    notas.piano = s;
  }
  if (ver.includes('bajo')) {
    out.push('BAJO');
    const s = filas('ataques', b => b.bajo.map(a => a.pos), b => b.bajo.map(a => a.pos));
    const ant = bs => { const x = anticipos(bs.map(b => ({ ...b, instr: b.bajo }))); return `${x.en4y}/${x.cambios} en el 4&, ${x.en4} en el 4, ${x.ligados} ligados`; };
    const reg = bs => nm(mediana(bs.flatMap(b => b.bajo.map(a => a.ps[0]))));
    out.push(`  densidad ${media(ref.bares.map(b => b.bajo.length)).toFixed(1)} → ${media(app.bares.map(b => b.bajo.length)).toFixed(1)} · registro ${reg(ref.bares)} → ${reg(app.bares)} · anticipos: ${ant(ref.bares)} → ${ant(app.bares)}`);
    notas.bajo = s;
  }
  if (ver.includes('perc')) {
    out.push('PERCUSIÓN (notas General MIDI)');
    const gms = [...new Set(ref.bares.concat(app.bares).flatMap(b => b.perc.map(h => h.gm)))].sort((a, b) => a - b);
    let suma = 0, peso = 0;
    for (const gm of gms) {
      const nR = ref.bares.reduce((a, b) => a + b.perc.filter(h => h.gm === gm).length, 0), nA = app.bares.reduce((a, b) => a + b.perc.filter(h => h.gm === gm).length, 0);
      const s = filas(`${gm} ${GM_NOM[gm] || ''}`, b => b.perc.filter(h => h.gm === gm).map(h => h.pos), b => b.perc.filter(h => h.gm === gm).map(h => h.pos));
      const vR = ref.bares.flatMap(b => b.perc.filter(h => h.gm === gm).map(h => h.v)), vA = app.bares.flatMap(b => b.perc.filter(h => h.gm === gm).map(h => h.v));
      const sR = suaves(vR), sA = suaves(vA);
      out.push(`    ${String(nR).padStart(3)} → ${String(nA).padStart(3)} golpes · fuerza media ${Math.round(media(vR))} → ${Math.round(media(vA))} · suaves ${sR == null ? '-' : Math.round(100 * sR) + '%'} → ${sA == null ? '-' : Math.round(100 * sA) + '%'}`);
      if (SIN_PUNTAJE.includes(gm)) out.push('    (no cuenta: la app no toca maracas; el raspado es el güiro)'); else { suma += s * (nR + nA); peso += nR + nA; }
    }
    notas.perc = peso ? suma / peso : 1;
  }
  return { texto: out.join('\n'), notas };
}

module.exports = { original, recrear, comparar, cadenaPagina, modeloDeEntrada };

if (require.main === module) {
  const args = process.argv.slice(2), sueltos = args.filter(a => !a.startsWith('--'));
  const [archivo, desde = '0', n = '8', opc = '{}'] = sueltos;
  if (!archivo) { console.log('uso: node analisis_tumbaos/comparar.js "tema.mid" desde cantidad [opciones JSON] [--ver piano,bajo,perc] [--detalle]'); process.exit(1); }
  const iv = args.indexOf('--ver'), ver = iv >= 0 ? args[iv + 1].split(',') : ['piano', 'bajo', 'perc'];
  const { base, M } = modeloDeEntrada(), ctx = cadenaPagina();
  const ref = original(archivo, +desde, +n, base.perfil);
  const app = recrear(ref, JSON.parse(opc), M, ctx);
  console.log(`${path.basename(archivo)} compases ${+desde + 1}-${+desde + +n} · clave ${app.clave} · ${app.sec.prog}`);
  console.log(`original: lados ${ref.bares.map(b => b.lado === 'A' ? '3' : '2').join('')}`);
  const c = comparar(ref, app, ver, args.includes('--detalle'));
  console.log(c.texto);
  console.log('PARECIDO: ' + Object.entries(c.notas).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(' · '));
}
