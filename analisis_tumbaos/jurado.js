/* =====================================================================
   Jurado: todo lo que se puede medir de una vez, para ajustar el motor sin romper otra cosa
   uso: node analisis_tumbaos/jurado.js [--solo reglas|temas]
   1. Temas: recrea pedazos de temas de la base (comparar.js) con el estilo que corresponde y da el parecido por instrumento.
   2. Reglas: genera cada estilo en cada marcha (una sección en loop y una canción con final) y revisa
      la clave, los anticipos según el cambio de acorde, la costura del loop, las notas cromáticas, los registros,
      las manos que se pisan y el final.
   ===================================================================== */
const path = require('path');
const TM = require('./motor');
const C = require('./comparar.js');
const solo = (process.argv.indexOf('--solo') >= 0 && process.argv[process.argv.indexOf('--solo') + 1]) || null;
const { base, M } = C.modeloDeEntrada();
const RAIZ = path.join(__dirname, '..');

// ---------- 1. temas
const TEMAS = [
  { t: '1165.mid', desde: 48, n: 16, sec: { marcha: 'cuerpo', estilo: 'salsa' }, nota: 'Despacito en salsa: cuerpo' },
  { t: '1165.mid', desde: 160, n: 16, sec: { marcha: 'marcha', estilo: 'salsa' }, nota: 'Despacito en salsa: coro' },
  { t: 'Pare cochero - Salsa.mid', desde: 40, n: 16, sec: { marcha: 'marcha', estilo: 'charanga' }, nota: 'Pare cochero: montuno (charanga)' },
  { t: 'ya empezo la fiesta.mid', desde: 12, n: 16, sec: { marcha: 'marcha', estilo: 'melon' }, nota: 'Ya empezó la fiesta (timba)', sinPerc: 'la clave del original es dudosa' }
];
if (solo !== 'reglas') {
  const ctx = C.cadenaPagina();
  console.log('TEMAS (parecido 0-1 por instrumento; promedio de 3 semillas)');
  for (const x of TEMAS) {
    const ref = C.original(path.join(RAIZ, x.t), x.desde, x.n, base.perfil), suma = {};
    for (const semilla of [3, 11, 29]) {
      const app = C.recrear(ref, { ...x.sec, semilla }, M, ctx), c = C.comparar(ref, app, ['piano', 'bajo', 'perc', 'vientos'], false);
      for (const [k, v] of Object.entries(c.notas)) suma[k] = (suma[k] || 0) + v / 3;
    }
    if (x.sinPerc) suma.perc = null;
    console.log(`  ${x.nota.padEnd(36)} ${x.sec.estilo.padEnd(9)} piano ${suma.piano.toFixed(2)} · bajo ${suma.bajo.toFixed(2)} · percusión ${suma.perc == null ? ' -- (' + x.sinPerc + ')' : suma.perc.toFixed(2)} · vientos ${suma.vientos.toFixed(2)}`);
  }
}

// ---------- 2. reglas
if (solo !== 'temas') {
  const PROG = 'Am D7 G E7', MARCHAS = ['cuerpo', 'marcha', 'mambo', 'presion', 'bomba', 'despelote', 'muela'];
  const fallas = {}, n = { casos: 0 }, stats = { notas: 0, cortas: 0, golpes: 0, distintas: 0, unisono: 0, saltos: {}, sube: { n: 0, a: 0, z: 0 } };
  const falla = (regla, caso) => { (fallas[regla] = fallas[regla] || []).push(caso); };
  const CLAVE = { son: { A: [0, 6, 12], B: [4, 8] }, rumba: { A: [0, 6, 14], B: [4, 8] } };
  for (const estilo of Object.keys(TM.ESTILOS)) for (const marcha of MARCHAS) for (const clave of ['son 2-3', 'rumba 3-2']) {
    n.casos++;
    const caso = `${estilo}/${marcha}/${clave}`, E = TM.ESTILOS[estilo];
    const r = TM.generarCancion({ titulo: '', clave, perillas: {}, loop: { desde: 0, hasta: 0 }, secciones: [{ id: 'a', prog: PROG, marcha, estilo, vueltas: 2, semilla: 7 }] }, M);
    const nb = r.compases, tipo = /rumba/.test(clave) ? 'rumba' : 'son';
    // la clave, en su lado, en todos los compases
    for (let b = 0; b < nb; b++) { const q = (r.perc[b] || []).filter(e => e.d === 'clave').map(e => e.p).sort((x, y) => x - y).join(); if (q !== CLAVE[tipo][r.lados[b]].join()) { falla('clave fuera de lugar', `${caso} c${b + 1}: ${q}`); break; } }
    // anticipos: en cada cambio de acorde (también el del loop), piano en el 4& con el acorde nuevo; el bajo en el 4& o en el 4
    const cambio = E.cambio;
    if (['cuerpo', 'marcha', 'mambo'].includes(marcha)) for (let b = 0; b < nb; b++) {
      const sig = r.acordes[(b + 1) % nb][0], ult = r.acordes[b].at(-1); if (sig.nombre === ult.nombre) continue;
      const p14 = r.der.find(e => e.p === b * 16 + 14);
      if (!p14 || p14.ch.nombre !== sig.nombre) falla('el piano no anticipa en el 4&', `${caso} c${b + 1}`);
      const pb = r.bajo.find(e => e.p === b * 16 + (cambio === '4' ? 12 : 14));
      if (!pb || ((pb.ps[0] - sig.raiz) % 12 + 12) % 12) falla(`el bajo no anticipa en el ${cambio === '4' ? '4' : '4&'}`, `${caso} c${b + 1}`);
    }
    // la costura del loop: el final trae el acorde del principio y avisa qué golpes van solo al arrancar
    if (['cuerpo', 'marcha', 'mambo'].includes(marcha) && (!r.costura || !r.costura.entrada.length)) falla('costura del loop sin datos', caso);
    // notas cromáticas: siempre solas
    for (const e of r.der) if (e.ps.length > 1 && TM.funcion(e.ps.at(-1), e.ch) === 'X') { falla('cromática doblada (octava o bloque)', `${caso} c${Math.floor(e.p / 16) + 1}.${e.p % 16}`); break; }
    // la frase real (los pianistas de la base): sus notas, acomodadas a los acordes, no quedan cromáticas dobladas que duren;
    // una nota de paso de una semicorchea en octavas sí (las líneas en octavas del montuno)
    const rf = TM.generarCancion({ titulo: '', clave, perillas: {}, secciones: [{ id: 'a', prog: PROG, marcha, estilo, vueltas: 2, semilla: 7, perillas: { frase: 'frase' } }] }, M);
    for (const e of rf.der) if (e.ps.length > 1 && e.L >= 2 && TM.funcion(e.ps.at(-1), e.ch) === 'X') { falla('frase real: cromática doblada', `${caso} c${Math.floor(e.p / 16) + 1}.${e.p % 16}`); break; }
    for (const hs of [rf.der, rf.izq]) for (let i = 1; i < hs.length; i++) if (hs[i - 1].p + hs[i - 1].L > hs[i].p) { falla('frase real: notas que se pisan', `${caso} ${hs[i].p}`); break; }
    // las manos no se pisan; la izquierda debajo de la derecha
    for (const [nom, hs] of [['derecha', r.der], ['izquierda', r.izq], ['bajo', r.bajo]]) for (let i = 1; i < hs.length; i++) if (hs[i - 1].p + hs[i - 1].L > hs[i].p) { falla(`${nom}: notas que se pisan`, `${caso} ${hs[i].p}`); break; }
    for (const e of r.izq) { const d = r.der.find(x => x.p === e.p); if (d && Math.max(...e.ps) >= Math.min(...d.ps)) { falla('la izquierda por encima de la derecha', `${caso} ${e.p}`); break; } }
    // vientos: cada familia en su registro y sin pisarse; las trompetas arriba de los trombones; en los golpes cortos, no más de
    // 3 notas distintas; la timba calla en los coros; los bloques caen en el anticipo con el acorde que viene
    const RV = { trompetas: [55, 86], trombones: [40, 74], saxos: [44, 78] };
    for (const f of TM.PISTAS_VIENTOS) {
      const a = r.vientos[f];
      if (a.some(e => e.ps.some(m => m < RV[f][0] || m > RV[f][1]))) falla(`${f} fuera de registro`, `${caso}: ${a.flatMap(e => e.ps).filter(m => m < RV[f][0] || m > RV[f][1]).slice(0, 3).join(',')}`);
      for (let i = 1; i < a.length; i++) if (a[i - 1].p + a[i - 1].L > a[i].p) { falla(`${f}: notas que se pisan`, `${caso} ${a[i].p}`); break; }
    }
    for (const t of r.vientos.trompetas) { const b = r.vientos.trombones.find(x => x.p === t.p); if (b && Math.max(...b.ps) > Math.max(...t.ps)) { falla('trombones por encima de las trompetas', `${caso} ${t.p}`); break; } }
    const golpes = {}; for (const f of TM.PISTAS_VIENTOS) for (const e of r.vientos[f]) if (e.L <= 2) (golpes[e.p] = golpes[e.p] || new Set()), e.ps.forEach(m => golpes[e.p].add(m % 12));
    if (Object.values(golpes).some(s => s.size > 3)) falla('golpe corto con más de 3 notas distintas', caso);
    for (const f of TM.PISTAS_VIENTOS) if (['bomba', 'despelote'].includes(marcha) && r.vientos[f].some(e => e.ps.some(m => TM.funcion(m, e.ch) === 'X'))) { falla('bloques con notas fuera del acorde', `${caso} ${f}`); break; }
    if (E.banda === 'timba' && marcha === 'marcha' && TM.PISTAS_VIENTOS.some(f => r.vientos[f].length)) falla('la timba con vientos en el coro', caso);
    if (['bomba', 'despelote'].includes(marcha) && (E.vientos || {}).formato) for (let b = 0; b < nb; b++) {
      const sig = r.acordes[(b + 1) % nb][0]; if (sig.nombre === r.acordes[b].at(-1).nombre) continue;
      const pos = cambio === '4' ? 12 : 14, hay = TM.PISTAS_VIENTOS.some(f => r.vientos[f].some(e => e.p === b * 16 + pos));
      if (!hay) { falla('bloque sin golpe en el anticipo', `${caso} c${b + 1}`); break; }
    }
    // para las medidas contra el corpus: cada sección toma los riffs de un tema, así que se promedian 8 variantes
    if (['marcha', 'mambo', 'cuerpo'].includes(marcha) && clave === 'son 2-3') for (let sem = 1; sem <= 8; sem++) {
      const rs = TM.generarCancion({ titulo: '', clave, perillas: {}, secciones: [{ id: 'a', prog: PROG, marcha, estilo, vueltas: 2, semilla: sem }] }, M), g = {};
      for (const f of TM.PISTAS_VIENTOS) for (const e of rs.vientos[f]) { stats.notas++; if (e.L <= 2) stats.cortas++; (g[e.p] = g[e.p] || new Set()); e.ps.forEach(m => g[e.p].add(m % 12)); }
      for (const s of Object.values(g)) { stats.golpes++; stats.distintas += s.size; if (s.size === 1) stats.unisono++; }
      // la línea de arriba de las trompetas, de una nota a la siguiente
      const tp = rs.vientos.trompetas;
      for (let i = 1; i < tp.length; i++) { const d = Math.abs(Math.max(...tp[i].ps) - Math.max(...tp[i - 1].ps)), k = d === 0 ? 'repite' : d <= 2 ? 'grado' : d <= 4 ? 'tercera' : d <= 7 ? '4a-5a' : 'más de 5a'; stats.saltos[k] = (stats.saltos[k] || 0) + 1; }
    }
    // un mambo largo (24 compases): la nota más aguda de cada compás, del primer tercio al último (como en vientos_corpus.js)
    if (marcha === 'mambo' && clave === 'son 2-3') for (let sem = 1; sem <= 8; sem++) {
      const rs = TM.generarCancion({ titulo: '', clave, perillas: {}, secciones: [{ id: 'a', prog: PROG, marcha, estilo, vueltas: 6, semilla: sem }] }, M), nb = rs.compases, t = Math.floor(nb / 3);
      const porC = Array.from({ length: nb }, (_, b) => { const e = TM.PISTAS_VIENTOS.flatMap(f => rs.vientos[f]).filter(x => x.p >= b * 16 && x.p < b * 16 + 16); return e.length ? Math.max(...e.flatMap(x => x.ps)) : null; });
      const med = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : null; }, A = med(porC.slice(0, t)), Z = med(porC.slice(nb - t));
      if (A != null && Z != null) { stats.sube.n++; stats.sube.a += A; stats.sube.z += Z; }
    }
    // registros
    const tops = r.der.map(e => e.ps.at(-1)), bajos = r.bajo.flatMap(e => e.ps);
    if (tops.length && (Math.min(...tops) < 55 || Math.max(...tops) > 88)) falla('piano fuera de registro (sol3 a mi6)', `${caso}: ${Math.min(...tops)}-${Math.max(...tops)}`);
    if (bajos.length && (Math.min(...bajos) < 28 || Math.max(...bajos) > 55)) falla('bajo fuera de registro (mi1 a sol3)', `${caso}: ${Math.min(...bajos)}-${Math.max(...bajos)}`);
    // el final: una canción que termina en corte cae en un acorde
    const f = TM.generarCancion({ titulo: '', clave, perillas: {}, secciones: [{ id: 'a', prog: PROG, marcha, estilo, vueltas: 1, semilla: 7, transicion: 'corte' }] }, M);
    const S = (f.compases - 1) * 16, golpe = f.der.filter(e => e.p <= S && e.p + e.L > S).concat(f.der.filter(e => e.p === S)), notas = new Set(golpe.concat(f.izq.filter(e => e.p <= S && e.p + e.L > S)).flatMap(e => e.ps.map(m => m % 12)));
    if (!['presion', 'muela'].includes(marcha) && notas.size < 2) falla('el final no cae en un acorde', `${caso}: ${golpe.map(e => e.ps.join('-')).join(' ') || 'nada'}`);
  }
  console.log(`\nREGLAS (${n.casos} casos: ${Object.keys(TM.ESTILOS).length} estilos × ${MARCHAS.length} marchas × 2 claves)`);
  if (!Object.keys(fallas).length) console.log('  todo bien');
  const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
  console.log(`  vientos (cuerpo, coro y mambo) contra el corpus: notas cortas ${pc(stats.cortas, stats.notas)} (corpus 65%) · golpes en unísono u octavas ${pc(stats.unisono, stats.golpes)} (corpus 52%) · notas distintas por golpe ${(stats.distintas / Math.max(1, stats.golpes)).toFixed(1)} (corpus 1.8)`);
  const ts = Object.values(stats.saltos).reduce((a, b) => a + b, 0), sb = stats.sube;
  console.log(`  la de arriba de las trompetas, de una nota a la siguiente: por grado ${pc(stats.saltos.grado || 0, ts)} (corpus 40%) · tercera ${pc(stats.saltos.tercera || 0, ts)} (20%) · repite ${pc(stats.saltos.repite || 0, ts)} (21%) · 4a-5a ${pc(stats.saltos['4a-5a'] || 0, ts)} (11%) · más de una quinta ${pc(stats.saltos['más de 5a'] || 0, ts)} (7%)`);
  if (sb.n) console.log(`  los mambos largos suben: la nota más aguda de cada compás, del primer tercio al último, ${((sb.z - sb.a) / sb.n >= 0 ? '+' : '') + ((sb.z - sb.a) / sb.n).toFixed(1)} semitonos (corpus +2: de Do5 a Re5)`);
  for (const [k, v] of Object.entries(fallas)) console.log(`  ${k}: ${v.length} — ${v.slice(0, 4).join(' | ')}`);
  process.exitCode = Object.keys(fallas).length ? 1 : 0;
}
