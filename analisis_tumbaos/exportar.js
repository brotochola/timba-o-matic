/* =====================================================================
   Exportar: una canción (.json de «Exportar canción») a .mid, como el botón «Bajar MIDI» de la página
   uso: node analisis_tumbaos/exportar.js cancion.json salida.mid [--loop] [--muestrario]
     --loop: como loop (el final anticipa el principio y no va el primer 1)
     --muestrario: en vez de la canción, una sección de coro por estilo con los acordes de su primera sección
   Piano y bajo del motor; la percusión tal como suena (por la cadena de la página), una pista por familia.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const TM = require('./motor');
const C = require('./comparar.js');
const args = process.argv.slice(2), [entrada, salida] = args.filter(a => !a.startsWith('--'));
if (!entrada || !salida) { console.log('uso: node analisis_tumbaos/exportar.js cancion.json salida.mid [--loop] [--muestrario]'); process.exit(1); }
const loop = args.includes('--loop');
const J = JSON.parse(fs.readFileSync(entrada, 'utf8')), c = J.cancion;
const R = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const prog = s => s.bars.map(b => R[b.a.r] + b.a.q + (b.b ? '+' + R[b.b.r] + b.b.q : '')).join(' ');
let secs = c.secciones.map(s => ({ ...s, prog: prog(s) }));
if (args.includes('--muestrario')) {
  const coro = secs.find(s => s.tipo === 'coro') || secs[0];
  secs = Object.entries(TM.ESTILOS).map(([e, E], i) => ({ id: 'm' + i, nombre: E.n, tipo: 'coro', marcha: 'marcha', estilo: e, prog: coro.prog, vueltas: 2, semilla: 7 + i, plato: 'entra', perillas: {} }));
}
const { M } = C.modeloDeEntrada(), ctx = C.cadenaPagina(), { parse, evaluate, buildNotes } = ctx.__api;
const r = TM.generarCancion({ titulo: c.titulo, clave: c.clave, perillas: J.perillas || {}, vientos: c.vientos, loop: loop ? { desde: 0, hasta: secs.length - 1 } : null, secciones: secs }, M);
ctx.__percMotor = { id: 'motor-x', compases: r.perc, extra: r.extra, mix: r.mixes, estilo: r.estilos };
const score = evaluate(parse(TM.aLilyPond(r, { clave: c.clave, bpm: c.bpm || 190, percusionId: 'motor-x' }))), notas = buildNotes(score), ms = score.measures;
const barOf = t => ms.findIndex(m => t >= m.start && t < m.end), perc = ms.map(() => []);
for (const n of notas.filter(n => n.drum)) { const i = barOf(n.t), m = ms[i]; perc[i].push({ p: Math.round((n.t - m.start) / ((m.end - m.start) / 16)), d: n.drum, v: n.vel || 1 }); }
// como loop: sin el 1 del principio (llega ligado desde el final) y con los golpes que el final deja en el 1
const cs = r.costura, fuera = (e, parte) => loop && cs && cs.entrada.some(x => x.parte === parte && x.p === e.p && x.ps.join() === e.ps.join());
if (loop && cs) for (const g of cs.vuelta) perc[cs.inicio].push(g);
const midi = TM.aMidi({ ...r, der: r.der.filter(e => !fuera(e, 'piano')), izq: r.izq.filter(e => !fuera(e, 'piano')), bajo: r.bajo.filter(e => !fuera(e, 'bajo')), extra: null }, c.bpm || 190, { porFamilia: true, perc });
fs.mkdirSync(path.dirname(path.resolve(salida)), { recursive: true });
fs.writeFileSync(salida, Buffer.from(midi));
console.log(`${salida}: ${r.compases} compases a ${c.bpm || 190} · ${r.secciones.map(s => s.texto).join(' | ')}`);
