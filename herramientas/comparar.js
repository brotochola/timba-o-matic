/* =====================================================================
   Comparar: recrea un pedazo de un tema con el motor y lo compara con el original, instrumento por instrumento
   uso: node herramientas/comparar.js "tema.mid" desde cantidad [opciones JSON de la sección] [--ver piano,bajo,perc] [--detalle]
     desde, cantidad: compases del tema (los del analizador: un compás = un lado de la clave)
     opciones: lo que va en la sección de la canción, p. ej. '{"marcha":"marcha","estilo":"salsabrava","semilla":3,"pianoComo":"pupy"}'
   Para cada instrumento y cada lado de la clave: en qué semicorcheas ataca (probabilidad 0-9 por posición), densidad,
   fuerza de los golpes; en el piano además textura, mano izquierda, registro y anticipos; en el bajo, anticipos y registro.
   Parecido = 1 − diferencia de las probabilidades por posición / su suma (1 = igual, 0 = nada que ver).
   La percusión se compara en notas General MIDI (como queda en el .mid), con la que de verdad suena (aprendida o clásica).
   ===================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const RUTAS = require('./rutas');
const TM = require('../motor');

function cadenaPagina() {
  // el intérprete de la página (secciones 1 a 4), para la percusión clásica que arma la página
  const L = fs.readFileSync(RUTAS.HTML, 'utf8').split('\n');
  const i0 = L.findIndex(l => l.includes('1. TOKENIZER')) - 1, i1 = L.findIndex(l => l.includes('5. ENGRAVING WITH VEXFLOW')) - 1;
  const ctx = { window: {}, TumbaoMotor: TM, console }; ctx.globalThis = ctx; ctx.window = ctx;
  vm.createContext(ctx); vm.runInContext(L.slice(i0, i1).join('\n') + '\n;globalThis.__api={parse,evaluate,buildNotes};', ctx);
  return ctx;
}
// o.sinLocal: sin las colecciones compradas (lo que oye quien abre la página sin base_local.js)
function modeloDeEntrada(o = {}) {
  const base = RUTAS.leerBase();
  const LOCAL = RUTAS.LOCAL;
  let loc = []; if (!o.sinLocal && fs.existsSync(LOCAL)) { require(LOCAL); loc = (globalThis.BASE_TUMBAOS_LOCAL || {}).fuentes || []; }
  // como la página: el modelo aprende de la base original y de las colecciones encendidas; los vientos, de todos los temas
  const todas = base.fuentes.concat(loc), cols = { ...base.colecciones, ...(o.sinLocal ? {} : (globalThis.BASE_TUMBAOS_LOCAL || {}).colecciones || {}) };
  const M = TM.construirModelo(todas.filter(f => !f.coleccion || !!(cols[f.coleccion] || {}).encendida));
  M.vientos = TM.construirVientos(todas);
  // la trompeta solista: los solos de la Weimar Jazz Database (si está la base)
  const solos = RUTAS.leerSolos(); if (solos) M.solos = TM.construirSolos(solos, todas);
  return { base, M };
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
    // vientos: cada nota con su posición, duración, altura e instrumento (tpt, tbn, sax, met)
    vientos: (det.vientosAt || []).filter(a => a.q16 >= 2 * b.x && a.q16 < 2 * b.x + 16).map(a => ({ pos: a.q16 - 2 * b.x, d: a.d, m: a.p, ins: a.ins })),
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
  const bares = r.lados.map((lado, b) => ({ lado, acordes: r.acordes[b].map(c => c.nombre), piano: [], bajo: [], perc: [], vientos: [] }));
  const INS = { trompetas: 'tpt', trombones: 'tbn', saxos: 'sax' };
  for (const [fam, evs] of Object.entries(r.vientos || {})) for (const e of evs) { const b = Math.floor(e.p / 16); if (bares[b]) for (const m of e.ps) bares[b].vientos.push({ pos: e.p % 16, d: e.L, m, ins: INS[fam] }); }
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
  if (ver.includes('vientos')) {
    out.push('VIENTOS');
    const s = filas('ataques', b => b.vientos.map(a => a.pos), b => b.vientos.map(a => a.pos));
    const con = bs => bs.filter(b => b.vientos.length).length + '/' + bs.length;
    const ataques = bs => bs.flatMap(b => Object.values(b.vientos.reduce((o, a) => ((o[a.pos] = o[a.pos] || []).push(a), o), {})));
    const notasPor = bs => { const a = ataques(bs); return a.length ? (media(a.map(x => new Set(x.map(n => n.m % 12)).size))).toFixed(1) : '-'; };
    const cortas = bs => { const a = bs.flatMap(b => b.vientos); return a.length ? Math.round(100 * a.filter(x => x.d <= 2).length / a.length) + '%' : '-'; };
    const reg = (bs, ins) => nm(mediana(bs.flatMap(b => b.vientos.filter(a => a.ins === ins).map(a => a.m))));
    out.push(`  compases con vientos ${con(ref.bares)} → ${con(app.bares)} · notas distintas por golpe ${notasPor(ref.bares)} → ${notasPor(app.bares)} · cortas ${cortas(ref.bares)} → ${cortas(app.bares)}`);
    out.push(`  registro (mediana): trompetas ${reg(ref.bares, 'tpt')} → ${reg(app.bares, 'tpt')} · trombones ${reg(ref.bares, 'tbn')} → ${reg(app.bares, 'tbn')} · saxos ${reg(ref.bares, 'sax')} → ${reg(app.bares, 'sax')}`);
    notas.vientos = s;
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

// ---------- el oído del piano: cuánto suena a montuno y cuánto desafina, medido igual en lo que sale y en los temas de la base
// tocado: { lados: ['A'|'B'], acordes: [[ch]] por compás, ev: [{ p, L, ps (derecha), izq (izquierda), v, ch }], bajo: [{ p, L, ps }] | null }
// - clave: log-verosimilitud del ritmo de cada compás en su lado contra el otro lado (perfil de la base); claveOK: compases a favor
// - anticipa: cambios de acorde con el acorde nuevo en el 4&; liga: de esos, sin volver a atacar el 1
// - repite2 / repite4: ataques compartidos con el compás de dos (cuatro) más adelante: el gancho
// - acentos: correlación de la fuerza por posición con la de los pianistas de la base
// - falsas: notas fuera del acorde (ni del acorde ni tensión) largas (desde una corchea con puntillo) o en el 2& y el 4&, los golpes que hablan
// - semitono: ataques con dos notas a medio tono (o a 7a mayor / 9a menor) que el acorde no explica
// - choqueBajo: ataques con una nota a medio tono del bajo que suena, que el acorde no explica
// - izqGrave: notas de la izquierda debajo del fa2, donde embarran el bajo
const LLv = (v, p) => v.reduce((s, h, k) => s + (h ? Math.log(p[k]) : Math.log(1 - p[k])), 0);
const DEL_ACORDE = new Set(['R', '3', '5', '7']);
function correlAcentos(cel, velRef) {
  if (!velRef) return null;
  const xs = [], ys = []; for (const [k, [s, n]] of Object.entries(cel)) if (n >= 3) { xs.push(s / n); ys.push(velRef[k[0]][+k.slice(1)]); }
  if (xs.length < 6) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let n = 0, dx = 0, dy = 0; for (let i = 0; i < xs.length; i++) { n += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
  return dx && dy ? n / Math.sqrt(dx * dy) : null;
}
function oidoPiano(t, perfil, velRef) {
  const nb = t.lados.length, porC = Array.from({ length: nb }, () => []);
  for (const e of t.ev) { const b = Math.floor(e.p / 16); if (b >= 0 && b < nb) porC[b].push(e); }
  const res = {}, pct = (a, b) => b ? a / b : null;
  // clave
  let llr = 0, nC = 0, aFavor = 0;
  porC.forEach((evs, b) => { if (evs.length < 2) return; const v = new Array(16).fill(0); for (const e of evs) v[e.p % 16] = 1; const L = t.lados[b], x = LLv(v, perfil[L]) - LLv(v, perfil[L === 'A' ? 'B' : 'A']); llr += x; nC++; if (x > 0) aFavor++; });
  res.clave = nC ? llr / nC : null; res.claveOK = pct(aFavor, nC);
  // anticipos en los cambios de acorde
  // (t.acordes puede traer uno más: el acorde que sigue al último compás; t.uno: si ese compás que sigue ataca el 1)
  // (por lado: hacia el lado 3 y hacia el lado 2, el que sigue)
  let cambios = 0, ant = 0, liga = 0, nLiga = 0; const lado = { A: [0, 0, 0, 0], B: [0, 0, 0, 0] };
  for (let b = 0; b < nb; b++) {
    if (!t.acordes[b + 1]) continue;
    const ult = t.acordes[b][t.acordes[b].length - 1], sig = t.acordes[b + 1][0]; if (!ult || !sig || ult.nombre === sig.nombre) continue;
    const L = t.lados[b] === 'A' ? 'B' : 'A', x = lado[L];
    cambios++; x[0]++;
    const e14 = porC[b].find(e => e.p % 16 === 14);
    if (e14 && e14.ch && e14.ch.nombre === sig.nombre) {
      ant++; x[1]++;
      const uno = b + 1 < nb ? porC[b + 1].some(e => e.p % 16 === 0) : t.uno;
      if (uno != null) { nLiga++; x[2]++; if (!uno) { liga++; x[3]++; } }
    }
  }
  res.anticipa = pct(ant, cambios); res.liga = pct(liga, nLiga);
  res.antA = pct(lado.A[1], lado.A[0]); res.antB = pct(lado.B[1], lado.B[0]); res.ligaA = pct(lado.A[3], lado.A[2]); res.ligaB = pct(lado.B[3], lado.B[2]);
  // ritmo
  const todos = t.ev.length;
  res.densidad = nb ? todos / nb : 0; res.contra = pct(t.ev.filter(e => e.p % 4 === 2).length, todos); res.semis = pct(t.ev.filter(e => e.p % 2 === 1).length, todos);
  const jac = (a, b) => { const A = new Set(a.map(e => e.p % 16)), B = new Set(b.map(e => e.p % 16)); const u = new Set([...A, ...B]).size; return u ? [...A].filter(x => B.has(x)).length / u : null; };
  for (const k of [2, 4]) { const xs = []; for (let b = 0; b + k < nb; b++) { const j = jac(porC[b], porC[b + k]); if (j != null) xs.push(j); } res['repite' + k] = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }
  // acentos (solo si la fuerza varía): la fuerza relativa por lado y posición, que juntarOidos suma entre tocados
  const vs = t.ev.map(e => e.v), mv = vs.reduce((a, b) => a + b, 0) / Math.max(1, vs.length), sd = Math.sqrt(vs.reduce((a, v) => a + (v - mv) ** 2, 0) / Math.max(1, vs.length));
  res.velCel = {};
  if (sd > 2) for (const e of t.ev) { const k = t.lados[Math.floor(e.p / 16)] + (e.p % 16), c = (res.velCel[k] = res.velCel[k] || [0, 0]); c[0] += e.v / mv; c[1]++; }
  res.acentos = correlAcentos(res.velCel, velRef);
  // disonancias
  const bajoEn = new Map(); if (t.bajo) for (const e of t.bajo) for (let q = e.p; q < e.p + e.L; q++) bajoEn.set(q, e.ps[0]);
  let notas = 0, falsas = 0, crom = 0, semi = 0, choque = 0, conBajo = 0, izq = 0, izqG = 0;
  for (const e of t.ev) {
    if (!e.ch) continue;
    const todas = e.ps.concat(e.izq || []), acento = e.p % 16 === 6 || e.p % 16 === 14;
    for (const m of todas) { notas++; const f = TM.funcion(m, e.ch); if (f === 'X') { crom++; if (e.L >= 3 || acento) falsas++; } }
    for (const m of e.izq || []) { izq++; if (m < 41) izqG++; }
    const tono = m => DEL_ACORDE.has(TM.funcion(m, e.ch));
    let s = false; for (let i = 0; i < todas.length && !s; i++) for (let j = i + 1; j < todas.length; j++) { const ic = TM.pc(todas[j] - todas[i]); if ((ic === 1 || ic === 11) && !(tono(todas[i]) && tono(todas[j]))) { s = true; break; } }
    if (s) semi++;
    const bj = bajoEn.get(e.p);
    if (bj != null) { conBajo++; if (todas.some(m => { const ic = TM.pc(m - bj); return (ic === 1 || ic === 11) && !(tono(m) && tono(bj)); })) choque++; }
  }
  Object.assign(res, { falsas: pct(falsas, notas), cromaticas: pct(crom, notas), semitono: pct(semi, todos), choqueBajo: t.bajo ? pct(choque, conBajo) : null, izqGrave: pct(izqG, izq) });
  // textura y línea (la nota de arriba)
  let oct = 0, sola = 0, blq = 0, del = 0, iv = 0, ter = 0, cua = 0, paso = 0, rep = 0, giros = 0, mov = 0, prevD = 0, prev = null;
  for (const e of t.ev) {
    if (!e.ps.length) continue;
    const top = e.ps[e.ps.length - 1], der = e.ps.filter(x => x >= top - 12);
    if (der.includes(top - 12)) oct++; else if (new Set(der.map(TM.pc)).size === 1) sola++; else blq++;
    if (e.ch && DEL_ACORDE.has(TM.funcion(top, e.ch))) del++;
    if (prev != null) { const d = top - prev, a = Math.abs(d) % 12 === 0 && d ? 0 : Math.abs(d); iv++; if (a === 0) rep++; else if (a <= 2) paso++; else if (a <= 4) ter++; else if (a === 5) cua++; if (d && d % 12) { if (prevD && Math.sign(d) !== Math.sign(prevD)) giros++; if (prevD) mov++; prevD = d; } }
    prev = top;
  }
  const conDer = t.ev.filter(e => e.ps.length).length;
  Object.assign(res, { octavas: pct(oct, conDer), sueltas: pct(sola, conDer), bloques: pct(blq, conDer), delAcorde: pct(del, conDer), repetidas: pct(rep, iv), pasos: pct(paso, iv), terceras: pct(ter, iv), cuartas: pct(cua, iv), cambiaDir: pct(giros, mov) });
  // perfil de ataques por lado (para ver a qué estilo se parece)
  const perf = { A: new Array(16).fill(0), B: new Array(16).fill(0) }, nL = { A: 0, B: 0 };
  porC.forEach((evs, b) => { const L = t.lados[b]; nL[L]++; for (const q of new Set(evs.map(e => e.p % 16))) perf[L][q]++; });
  res.perfil = { A: perf.A.map(x => nL.A ? x / nL.A : 0), B: perf.B.map(x => nL.B ? x / nL.B : 0) };
  return res;
}
// lo que sale del motor (una canción o una sección), como lo toca la página: derecha e izquierda juntas por ataque
function tocadoDe(r) {
  const porP = new Map();
  for (const e of r.der) porP.set(e.p, { p: e.p, L: e.L, ps: e.ps.slice().sort((a, b) => a - b), izq: [], v: e.v, ch: e.ch });
  for (const e of r.izq) { const x = porP.get(e.p); if (x) x.izq = e.ps.slice(); else porP.set(e.p, { p: e.p, L: e.L, ps: [], izq: e.ps.slice(), v: e.v, ch: e.ch }); }
  return { lados: r.lados, acordes: r.acordes, ev: [...porP.values()].sort((a, b) => a.p - b.p), bajo: r.bajo };
}
// una fuente de la base (sus ciclos de piano, de a dos compases): el acorde de cada ataque con su anticipo, como lo ve el modelo
// los ciclos seguidos (c, c+2, c+4…) van juntos, para medir el gancho y las ligaduras de un ciclo al otro
function tocadoDeFuente(f) {
  const out = [], ciclos = (f.piano || []).filter(c => TM.acordesCiclo(c).ok).sort((a, b) => a.c - b.c);
  let tramo = null;
  for (const c of ciclos) {
    const K = TM.acordesCiclo(c);
    if (!tramo || tramo.ult !== c.c - 2) { tramo = { lados: [], acordes: [], ev: [], bajo: null, uno: null, ult: null }; out.push(tramo); }
    const o = tramo.lados.length * 16;
    for (const [p, d, ps, v] of c.e) {
      const ord = ps.slice().sort((a, b) => a - b), top = ord[ord.length - 1], cur = K.en(p), sig = K.proximo(p);
      const ch = TM.anticipaAtaque(ord, top, cur, sig) ? sig : cur;
      tramo.ev.push({ p: o + p, L: d, ps: ord.filter(x => x >= top - 12), izq: ord.filter(x => x < top - 12), v, ch });
    }
    // el acorde que sigue al tramo (por si el último compás anticipa); se corrige si viene otro ciclo seguido
    if (tramo.acordes.length > tramo.lados.length) tramo.acordes.pop();
    tramo.lados.push('A', 'B'); tramo.acordes.push(K.A[0], K.A[1]); if (K.sig) tramo.acordes.push([K.sig]);
    tramo.ult = c.c;
  }
  return out;
}
// junta las medidas de varios tocados (promedio pesado por la cantidad de compases)
function juntarOidos(lista, velRef) {
  const acc = {}, peso = {}, cel = {};
  for (const { o, n } of lista) for (const [k, v] of Object.entries(o)) {
    if (k === 'perfil') { acc.perfil = acc.perfil || { A: new Array(16).fill(0), B: new Array(16).fill(0) }; for (const L of ['A', 'B']) v[L].forEach((x, i) => { acc.perfil[L][i] += x * n; }); peso.perfil = (peso.perfil || 0) + n; continue; }
    if (k === 'velCel') { for (const [c, [s, m]] of Object.entries(v)) { const x = (cel[c] = cel[c] || [0, 0]); x[0] += s; x[1] += m; } continue; }
    if (k === 'acentos' || v == null || Number.isNaN(v)) continue; acc[k] = (acc[k] || 0) + v * n; peso[k] = (peso[k] || 0) + n;
  }
  const res = {}; for (const k of Object.keys(acc)) res[k] = k === 'perfil' ? { A: acc.perfil.A.map(x => x / peso.perfil), B: acc.perfil.B.map(x => x / peso.perfil) } : acc[k] / peso[k];
  res.acentos = correlAcentos(cel, velRef);
  return res;
}
const parecidoPerfil = (a, b) => parecido(a.A.concat(a.B), b.A.concat(b.B));

module.exports = { original, recrear, comparar, cadenaPagina, modeloDeEntrada, oidoPiano, tocadoDe, tocadoDeFuente, juntarOidos, parecidoPerfil, parecido };

if (require.main === module) {
  const args = process.argv.slice(2), sueltos = args.filter(a => !a.startsWith('--'));
  const [archivo, desde = '0', n = '8', opc = '{}'] = sueltos;
  if (!archivo) { console.log('uso: node herramientas/comparar.js "tema.mid" desde cantidad [opciones JSON] [--ver piano,bajo,perc] [--detalle]'); process.exit(1); }
  const iv = args.indexOf('--ver'), ver = iv >= 0 ? args[iv + 1].split(',') : ['piano', 'bajo', 'perc'];
  const { base, M } = modeloDeEntrada(), ctx = cadenaPagina();
  const ref = original(RUTAS.midi(archivo), +desde, +n, base.perfil);
  const app = recrear(ref, JSON.parse(opc), M, ctx);
  console.log(`${path.basename(archivo)} compases ${+desde + 1}-${+desde + +n} · clave ${app.clave} · ${app.sec.prog}`);
  console.log(`original: lados ${ref.bares.map(b => b.lado === 'A' ? '3' : '2').join('')}`);
  const c = comparar(ref, app, ver, args.includes('--detalle'));
  console.log(c.texto);
  console.log('PARECIDO: ' + Object.entries(c.notas).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(' · '));
}
