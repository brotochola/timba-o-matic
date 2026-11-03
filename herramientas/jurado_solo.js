/* =====================================================================
   El jurado del solo de trompeta
   uso: node herramientas/jurado_solo.js [--ver modo] [--semillas N] [--compases N]
        node herramientas/jurado_solo.js --cancion canciones/soplando_en_clave.json [--ver]   los solos de una canción, sección por sección
   Mide los mismos rasgos (TM.rasgosSolo) en los solos reales y en los que genera el motor, y los compara:
   - la referencia: los solos de trompeta y corneta de la Weimar Jazz Database (base/base_solos.json) en tramos de 16 compases,
     con tempo de 140 a 280 (la salsa anda por 180-200); el arco (cuánto sube, dónde está la nota más aguda), en los solos enteros
   - la clave: las líneas de vientos de los temas de salsa y timba con la clave segura (base/base_tumbaos.json), medidas con un
     encaje aprendido de la otra mitad de los temas (así la referencia no se mide con lo que aprendió de ella misma)
   - los solos del motor: cada modo sobre varias progresiones, claves y semillas
   - dos solistas tontos, para ver que el jurado distingue: notas al azar de la escala, y arpegios corridos sin respirar
   La nota (0 a 10): cada rasgo dentro de lo que hace la mitad de los trompetistas (percentil 25 a 75, corrido por lo que la
   investigación espera del modo) vale 1; afuera, baja como una campana. Los rasgos van en cinco rubros (armonía, línea, fraseo,
   arco y desarrollo, clave) y la nota es la media geométrica de los rubros: si uno falla, la nota cae. Cada falta (lo que casi
   ningún trompetista hace: notas largas cromáticas, frases sin respirar, frases cruzadas) resta un 15%.
   ===================================================================== */
const path = require('path');
const RUTAS = require('./rutas');
const TM = require(RUTAS.MOTOR);
const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SEMILLAS = +arg('--semillas', 4), NB = +arg('--compases', 16), VER = arg('--ver', null), CANCION = arg('--cancion', null);

const BS = require(path.join(RUTAS.RAIZ, 'base', 'base_solos.json')), BT = RUTAS.leerBase();
const MS = TM.construirSolos(BS, BT.fuentes);
const pc = m => ((m % 12) + 12) % 12;

// ---------- la referencia de los trompetistas
const J = TM.prepararJurado(MS, BT.fuentes), ref = J.ref, refModo = J.refModo, tramos = J.tramos;
const reales = [...new Set(tramos.map(x => x.s))], claveTemas = { length: J.temasClave || (ref.clave && ref.clave.n) || 0 };

// ---------- los solos de una canción: se genera como en la página y se juzga cada sección donde toca la trompeta solista
if (CANCION) {
  const C = require('./comparar.js'), { M } = C.modeloDeEntrada(), Jc = JSON.parse(require('fs').readFileSync(CANCION, 'utf8')), c = Jc.cancion;
  const NOMS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'], prog = x => x.bars.map(b => NOMS[b.a.r] + b.a.q + (b.b ? '+' + NOMS[b.b.r] + b.b.q : '')).join(' ');
  const r = TM.generarCancion({ titulo: c.titulo, clave: c.clave, perillas: Jc.perillas || {}, vientos: c.vientos, secciones: c.secciones.map(x => ({ ...x, prog: prog(x) })) }, M);
  const RU = { armonia: 'armonía', linea: 'línea', fraseo: 'fraseo', arco: 'arco', clave: 'clave' }, nom = m => TM.NOM[pc(m)] + (Math.floor(m / 12) - 1);
  console.log(`«${c.titulo}»: ${r.compases} compases. Los trompetistas reales sacan ${(tramos.reduce((a, x) => a + TM.juzgarSolo(x.r, ref).nota, 0) / tramos.length).toFixed(2)} de media.`);
  r.secciones.forEach((sc, i) => {
    if (!sc.info.solo) return;
    const t0 = sc.inicio * 16, ns = r.solo.filter(e => e.p >= t0 && e.p < t0 + sc.compases * 16).map(e => ({ p: e.p - t0, L: e.L, m: e.ps[0] }));
    const chEn = p => { const b = sc.inicio + Math.floor(p / 16), q = p % 16; if (q >= 14 && r.acordes[b + 1]) return r.acordes[b + 1][0]; const cs = r.acordes[b] || []; return cs.length > 1 && q >= 8 ? cs[1] : cs[0]; };
    const sigEn = p => { const ch = chEn(p), b = sc.inicio + Math.floor(p / 16); for (let x = b; x <= b + 2; x++) for (const cc of r.acordes[x] || []) if (cc && ch && cc.nombre !== ch.nombre) return cc; return null; };
    const j = J.juzgar(ns, { chEn, sigEn, ladoDe: p => r.lados[sc.inicio + Math.floor(p / 16)], huecos: sc.info.solo.huecos, forma: sc.info.solo.forma }, sc.info.solo.modo);
    console.log(`\n${sc.texto} (${sc.compases} compases) · ${TM.MODOS_SOLO[sc.info.solo.modo].n}${sc.info.solo.forma === 'coro' ? ', con el coro' : ''} · aprende de ${sc.info.solo.fuentes.join(', ')}`);
    console.log(`  nota ${j.nota.toFixed(2)} · ${Object.entries(j.rubros).map(([k, v]) => RU[k] + ' ' + v.toFixed(2)).join(' · ')}${j.faltas.length ? ' · faltas: ' + j.faltas.join(', ') : ''}`);
    const flojos = j.detalle.filter(d => d.s < 0.8).sort((a, b) => a.s - b.s);
    if (flojos.length) console.log('  lo raro: ' + flojos.map(d => `${TM.RASGOS_SOLO[d.k]} ${d.x.toFixed(2)} (lo normal ${d.p25.toFixed(2)} a ${d.p75.toFixed(2)})`).join(' · '));
    if (args.includes('--ver')) for (let b = 0; b < sc.compases; b++) {
      const linea = Array(16).fill('  .  '); for (const n of ns.filter(n => Math.floor(n.p / 16) === b)) linea[n.p % 16] = (nom(n.m) + '-'.repeat(Math.min(3, n.L - 1))).padEnd(5).slice(0, 5);
      console.log(`  ${String(b + 1).padStart(2)} ${r.lados[sc.inicio + b] === 'A' ? '3' : '2'} ${r.acordes[sc.inicio + b].map(x => x.nombre).join('+').padEnd(8)} ${linea.join('')}`);
    }
  });
  process.exit(0);
}

// ---------- los solos del motor
const PROGS = { 'C F G7 F': 'son I-IV-V-IV', 'Am Dm E7 Am': 'menor i-iv-V', 'Dm7 G7 Cmaj7 Cmaj7': 'ii-V-I', 'Em C Am B7': 'i-VI-iv-V', 'Gm Cm D7 Gm': 'menor en sol', 'Fmaj7 E7 Am7 Gm7+C7': 'Just the two of us' };
const ESTILO_DE = { son: 'sonmontuno', descarga: 'salsa', brava: 'salsabrava', timba: 'pupy', latinjazz: 'songo' };
function contexto(prog, nb, clave32) {
  const P = TM.leerProgresion(prog), acordesDe = b => P[((b % P.length) + P.length) % P.length];
  return { nb, lado: b => (b % 2 === 0) === (clave32 === '3-2') ? 'A' : 'B', acordesDe, acordeEn: (b, p) => { const c = acordesDe(b); return c.length > 1 && p >= 8 ? c[1] : c[0]; } };
}
const chDe = (cx, posAnt) => p => { const b = Math.floor(p / 16), q = p % 16; if (q >= posAnt) return cx.acordesDe(b + 1)[0]; return cx.acordeEn(b, q); };
function generar(modo, prog, semilla, clave32, forma = 'corrido') {
  const cx = contexto(prog, NB, clave32), posAnt = modo === 'timba' || modo === 'latinjazz' ? 14 : 14;
  const R = (s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; })(semilla * 7919 + 13);
  const r = TM.solear({ ...cx, anticipa: true, posAnt, R, estilo: ESTILO_DE[modo], final: true, k: { s_modo: modo, s_forma: forma } }, MS);
  return { r, cx, posAnt };
}
const sigDe = (cx, posAnt) => p => { const ch = chDe(cx, posAnt)(p); for (let b = Math.floor(p / 16); b <= Math.floor(p / 16) + 2; b++) for (const c of cx.acordesDe(b)) if (c.nombre !== ch.nombre) return c; return null; };
const juzgar = (notas, cx, posAnt, modo) => { const j = J.juzgar(notas.map(n => ({ p: n.p, L: n.L, m: n.ps ? n.ps[0] : n.m })), { chEn: chDe(cx, posAnt), sigEn: sigDe(cx, posAnt), ladoDe: p => cx.lado(Math.floor(p / 16)) }, modo); return { r: j.r, j }; };

// ---------- los tontos
function tonto(tipo, prog, semilla, clave32) {
  const cx = contexto(prog, NB, clave32), R = (s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; })(semilla * 31 + 7), notas = [];
  let m = 70;
  for (let p = 0; p < NB * 16 - 2;) {
    const ch = cx.acordeEn(Math.floor(p / 16), p % 16);
    if (tipo === 'azar') {
      if (R() < 0.15) { p += 2 + Math.floor(R() * 6); continue; }
      const esc = [0, 2, 4, 5, 7, 9, 10].map(i => (i + ch.raiz) % 12); do { m += Math.floor(R() * 9) - 4; } while (!esc.includes(pc(m))); m = Math.max(58, Math.min(82, m));
      const L = [1, 2, 2, 2, 4][Math.floor(R() * 5)]; notas.push({ p, L, m }); p += L;
    } else {
      const ar = ch.pcs, k = Math.floor(p / 2) % 8, oct = k < 4 ? k : 7 - k, base = 60 + ch.raiz;
      notas.push({ p, L: 2, m: base + [0, 12, 24].flatMap(o => [...ar].sort((a, b) => pc(a - ch.raiz) - pc(b - ch.raiz)).map(x => pc(x - ch.raiz) + o))[oct + 2] }); p += 2;
    }
  }
  return juzgar(notas, cx, 14, 'descarga');
}

// ---------- el informe
const fmt = x => x == null ? '—' : Math.abs(x) >= 10 ? x.toFixed(0) : x.toFixed(2);
const nota = js => js.reduce((a, x) => a + x.j.nota, 0) / js.length;
const realesJ = tramos.map(x => TM.juzgarSolo(x.r, ref));
console.log(`Referencia: ${tramos.length} tramos de 16 compases de ${reales.length} solos de trompeta y corneta (tempo 140-280); clave: ${claveTemas.length} temas de salsa y timba\n`);
const res = {};
// cada modo con su solo corrido; el son, además, contestándole al coro (su forma más común)
for (const [col, modo, forma] of [...Object.keys(TM.MODOS_SOLO).map(m => [m, m, 'corrido']), ['son·coro', 'son', 'coro']]) {
  res[col] = [];
  for (const prog of Object.keys(PROGS)) for (let s = 1; s <= SEMILLAS; s++) for (const cl of ['2-3', '3-2']) {
    const g = generar(modo, prog, s, cl, forma);
    const j = J.juzgar(g.r.notas.map(n => ({ p: n.p, L: n.L, m: n.ps[0] })), { chEn: chDe(g.cx, g.posAnt), sigEn: sigDe(g.cx, g.posAnt), ladoDe: p => g.cx.lado(Math.floor(p / 16)), huecos: g.r.info.huecos, forma }, modo);
    res[col].push({ r: j.r, j, prog, s, cl, g });
  }
}
const tontos = { azar: [], arpegios: [] };
for (const t of Object.keys(tontos)) for (const prog of Object.keys(PROGS)) for (let s = 1; s <= 2; s++) tontos[t].push(tonto(t, prog, s, '2-3'));
const cols = ['reales', ...Object.keys(res), 'azar', 'arpegios'];
console.log('rasgo'.padEnd(44) + 'p10   p50   p90 | ' + cols.map(c => c.slice(0, 8).padStart(8)).join(''));
const medianaDe = (lista, k) => { const v = lista.map(x => x.r && x.r[k]).filter(x => x != null).sort((a, b) => a - b); return v.length ? v[v.length >> 1] : null; };
const dentro = (lista, k) => { const v = lista.map(x => x.j.detalle.find(d => d.k === k)).filter(Boolean); return v.length ? Math.round(100 * v.filter(d => d.s >= 0.99).length / v.length) : null; };
for (const k of Object.keys(TM.RASGOS_SOLO)) {
  if (!ref[k]) continue;
  const R_ = ref[k];
  const fila = cols.map(c => { const l = c === 'reales' ? tramos.map((x, i) => ({ r: x.r, j: realesJ[i] })) : res[c] || tontos[c]; const m = medianaDe(l, k), d = dentro(l, k); return (m == null ? '—' : fmt(m) + (d != null && c !== 'reales' ? (d >= 80 ? ' ' : d >= 50 ? '~' : '!') : ' ')).padStart(8); });
  console.log((k + ' · ' + TM.RASGOS_SOLO[k]).slice(0, 43).padEnd(44) + [R_.p10, R_.p50, R_.p90].map(x => fmt(x).padStart(5)).join(' ') + ' | ' + fila.join(''));
}
console.log('\n(«!»: menos de la mitad de los solos de esa columna cae en lo normal, entre p25 y p75, corrido por lo que espera el modo; «~»: entre la mitad y el 80%)');
console.log('\nNOTA del jurado (0-10):');
console.log('  trompetistas reales  ' + nota(realesJ.map(j => ({ j }))).toFixed(2));
for (const m of Object.keys(res)) {
  const fal = {}; for (const x of res[m]) for (const f of x.j.faltas) fal[f] = (fal[f] || 0) + 1;
  console.log('  ' + ('motor · ' + m).padEnd(20) + ' ' + nota(res[m]).toFixed(2) + '   peor ' + Math.min(...res[m].map(x => x.j.nota)).toFixed(1) + (Object.keys(fal).length ? '   faltas: ' + Object.entries(fal).map(([f, n]) => `${f} (${n}/${res[m].length})`).join(', ') : ''));
}
for (const t of Object.keys(tontos)) console.log('  ' + ('tonto · ' + t).padEnd(20) + ' ' + nota(tontos[t]).toFixed(2));
// lo que más le baja la nota al motor: los rasgos con menos solos dentro de lo normal
const flojo = {}; for (const m of Object.keys(res)) for (const x of res[m]) for (const d of x.j.detalle) { flojo[d.k] = flojo[d.k] || []; flojo[d.k].push(d.s); }
const rub = l => Object.keys(TM.RUBROS_SOLO).map(k => { const v = l.map(x => x.j.rubros[k]).filter(x => x != null); return k + ' ' + (v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : '—'); }).join(' · ');
console.log('\nRubros (0 a 1):');
console.log('  reales     ' + rub(realesJ.map(j => ({ j }))));
for (const m of Object.keys(res)) console.log('  ' + m.padEnd(10) + ' ' + rub(res[m]));
for (const t of Object.keys(tontos)) console.log('  ' + t.padEnd(10) + ' ' + rub(tontos[t]));
console.log('\nLo más flojo del motor (rasgo: nota media de 0 a 1): ' + Object.entries(flojo).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length]).sort((a, b) => a[1] - b[1]).slice(0, 6).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(' · '));

// ---------- ver un solo, compás por compás
if (VER) {
  const x = res[VER] && res[VER][0]; if (!x) { console.log('no hay modo ' + VER); process.exit(0); }
  const N = TM.NOM, nom = m => N[pc(m)] + (Math.floor(m / 12) - 1);
  console.log(`\n${VER} · ${x.prog} · clave ${x.cl} · semilla ${x.s} · de: ${x.g.r.info.fuentes.join(', ')} · nota ${x.j.nota}`);
  for (let b = 0; b < NB; b++) {
    const ns = x.g.r.notas.filter(n => Math.floor(n.p / 16) === b), cs = x.g.cx.acordesDe(b).map(c => c.nombre).join('+');
    const linea = Array(16).fill('  .  '); for (const n of ns) linea[n.p % 16] = (nom(n.ps[0]) + '-'.repeat(Math.min(3, n.L - 1))).padEnd(5).slice(0, 5);
    console.log(`${String(b + 1).padStart(2)} ${x.g.cx.lado(b) === 'A' ? '3' : '2'} ${cs.padEnd(9)} ${linea.join('')}`);
  }
}
