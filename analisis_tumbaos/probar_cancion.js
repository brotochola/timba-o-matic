/* =====================================================================
   Prueba de las canciones (secciones) del motor, sin navegador
   uso: node analisis_tumbaos/probar_cancion.js [archivo.ly]
   - arma una canción de prueba (intro, cuerpo, una sección de 3 compases, coro, mambo con el gancho del coro, presión, final)
   - revisa las costuras: lado de la clave, anticipos al acorde que viene, ligaduras, bajo, transiciones, estabilidad
   - con un archivo, guarda ahí el LilyPond de la canción (para compilarlo con LilyPond)
   ===================================================================== */
const fs = require('fs'), path = require('path');
const TM = require('./motor');
const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'base_tumbaos.json'), 'utf8'));
const M = TM.construirModelo(base.fuentes.filter(f => !f.coleccion));
let fallas = 0, pruebas = 0;
const ok = (c, msg) => { pruebas++; if (!c) { fallas++; console.log('  FALLA: ' + msg); } };

const SECCIONES = [
  { id: 'intro', nombre: 'Intro', prog: 'Am Dm E7 Am', marcha: 'cuerpo', semilla: 11, transicion: 'abanico' },
  { id: 'cuerpo', nombre: 'Cuerpo', prog: 'Am Dm G C F Dm E7 E7', marcha: 'cuerpo', vueltas: 2, semilla: 22, perillas: { b_estilo: 'salsa' } },
  { id: 'puente', nombre: 'Puente', prog: 'F G Am', marcha: 'marcha', semilla: 33, transicion: 'cierre' },
  { id: 'coro', nombre: 'Coro', prog: 'Am D7 G E7', marcha: 'marcha', vueltas: 4, semilla: 44, transicion: 'abanico' },
  { id: 'mambo', nombre: 'Mambo', prog: 'Am D7 G E7', marcha: 'mambo', vueltas: 2, semilla: 55, ganchoDe: 'coro', entrada: 'plato' },
  { id: 'presion', nombre: 'Presión', prog: 'Am Am E7 E7', marcha: 'presion', vueltas: 2, semilla: 66, transicion: 'corte' },
  { id: 'final', nombre: 'Coro final', prog: 'Am D7 G E7', marcha: 'marcha', vueltas: 2, semilla: 77, transicion: 'corte', perillas: { b_estilo: 'salsa' } }
];
const cancion = (cambios = {}, perillas = {}) => ({ titulo: 'Prueba', clave: 'son 2-3', perillas, secciones: SECCIONES.map(s => ({ ...s, ...(cambios[s.id] || {}) })) });
const gen = (c, p) => TM.generarCancion(cancion(c, p), M);
const r = gen();
const secs = r.secciones, nTot = r.compases, fam = d => TM.familiaPerc(d);
const ini = id => secs.find(s => s.id === id).inicio;
const desc = s => `${s.nombre} (compás ${s.inicio + 1})`;

console.log('1. largo');
ok(nTot === SECCIONES.reduce((a, s) => a + TM.leerProgresion(s.prog).length * (s.vueltas || 1), 0), 'total de compases');
for (const k of ['acordes', 'lados', 'perc', 'extra', 'marchas', 'mixes', 'estilos']) ok(r[k].length === nTot, k + ' tiene un elemento por compás');
for (const k of ['der', 'izq', 'bajo']) ok(r[k].every(e => e.p >= 0 && e.p < nTot * 16 && e.L >= 1 && e.p + e.L <= nTot * 16), k + ': todo adentro de la canción');
ok(secs.every((s, i) => s.inicio === (i ? secs[i - 1].inicio + secs[i - 1].compases : 0)), 'las secciones se suceden');

console.log('2. lado de la clave (son 2-3: el compás 1 es lado 2)');
ok(r.lados.every((l, b) => l === ((b + 1) % 2 === 0 ? 'A' : 'B')), 'lado de cada compás, también después de la sección de 3 compases');

console.log('3. anticipos al acorde de la sección siguiente');
let antic = 0;
for (let sem = 1; sem <= 10; sem++) {
  const x = gen(Object.fromEntries(SECCIONES.map((s, i) => [s.id, { semilla: sem * 100 + i }])), { ant: 1.5, liga: 1 });
  x.secciones.forEach((s, i) => {
    const S = (s.inicio + s.compases - 1) * 16, sig = x.secciones[i + 1];
    const sigAc = sig ? x.acordes[sig.inicio][0].nombre : null, propio = x.acordes[s.inicio + s.compases - 1];
    for (const e of x.der.filter(e => e.p >= S && e.p < S + 16 && e.antic && e.p % 16 >= 12)) {
      antic++;
      ok(sig && e.ch.nombre === sigAc, `${desc(s)}: el anticipo del piano va a ${sigAc}, no a ${e.ch.nombre}`);
    }
    if (s.transicion !== 'corte') for (const e of x.bajo.filter(e => e.p >= S + 12 && e.p < S + 16 && !propio.some(c => c.nombre === e.ch.nombre)))
      ok(sig && e.ch.nombre === sigAc, `${desc(s)}: el bajo anticipa ${sigAc}, no ${e.ch.nombre}`);
  });
}
ok(antic > 20, `hubo anticipos para revisar (${antic})`);

console.log('4. ligaduras entre secciones');
let ligas = 0;
for (const s of secs.slice(1)) {
  const t = s.inicio * 16, cruza = r.der.find(e => e.p < t && e.p + e.L > t);
  if (cruza) { ligas++; ok(!r.der.some(e => e.p === t), `${desc(s)}: viene ligado y no vuelve a atacar el 1`); }
}
console.log(`   (${ligas} costuras ligadas)`);

console.log('5. bajo');
ok(!r.bajo.some(e => e.p === ini('cuerpo') * 16), 'el tumbao de salsa no ataca el 1 al entrar al cuerpo (viene de antes)');
ok(r.bajo.some(e => e.p === ini('final') * 16), 'después del corte el bajo entra con la raíz en el 1');
ok(r.bajo.some(e => e.p === 0), 'el bajo arranca el tema en el 1');

console.log('6. estabilidad: cambiar el coro no toca lo anterior');
const antesDe = (x, id) => { const t = x.secciones.find(s => s.id === id).inicio, T = (t - 1) * 16;
  const ev = k => x[k].filter(e => e.p < t * 16).map(e => JSON.stringify({ ...e, L: e.p >= T ? 0 : e.L }));
  return JSON.stringify([ev('der'), ev('izq'), ev('bajo'), x.perc.slice(0, t), x.extra.slice(0, t)]); };
const ref = antesDe(r, 'coro');
for (const [qué, c] of [['marcha', { coro: { marcha: 'mambo' } }], ['semilla', { coro: { semilla: 999 } }], ['perillas', { coro: { perillas: { dens: 1.4, b_estilo: 'timbero' } } }], ['vueltas', { coro: { vueltas: 2 } }], ['pistas', { coro: { pistas: { bongo: false, piano: false } } }], ['acordes después', { mambo: { prog: 'Dm G C A7' } }]])
  ok(antesDe(gen(c), 'coro') === ref, 'cambiar ' + qué + ' del coro');
const sinBongo = gen({ coro: { pistas: { bongo: false } } }), c0 = ini('coro'), c1 = c0 + secs.find(s => s.id === 'coro').compases;
ok(sinBongo.perc.slice(c0, c1).every((bar, i) => JSON.stringify((bar || []).filter(e => fam(e.d) !== 'bongo')) === JSON.stringify((r.perc[c0 + i] || []).filter(e => fam(e.d) !== 'bongo')) && !(bar || []).some(e => fam(e.d) === 'bongo')), 'apagar el bongó en el coro cambia solo el bongó');

console.log('7. percusión por instrumento y sin maracas');
const pres = secs.find(s => s.id === 'presion');
// la presión (07_percusion): se caen congas, bongó y campanas; queda el bombo de presión (el 3 y el 4) y la clave
ok(r.perc.slice(pres.inicio, pres.inicio + pres.compases - 1).every(x => x && x.some(e => e.d === 'kick' && e.p === 8) && x.some(e => e.d === 'kick' && e.p === 12) && !x.some(e => ['congas', 'bongo', 'campanas'].includes(fam(e.d)))), 'la presión: bombo en el 3 y el 4, sin congas, bongó ni campanas');
ok(Array.isArray(r.perc[pres.inicio + pres.compases - 1]), 'el compás del corte de la presión trae sus golpes');
ok(r.estilos[pres.inicio] === 'presion' && r.estilos[0] === 'verso', 'estilo clásico por compás');
ok(![...r.perc, ...r.extra].some(bar => (bar || []).some(e => e.d === 'maraca')), 'no hay maracas');
ok(r.mixes[pres.inicio].bongo === 1 && gen({ presion: { pistas: { bongo: false } } }).mixes[pres.inicio].bongo === 0, 'la mezcla por compás apaga el bongó también en la percusión clásica');

console.log('8. transiciones');
const ib = ini('cuerpo') - 1, cuerpo0 = ini('cuerpo');
const abBar = [...(r.perc[ib] || []), ...r.extra[ib]];
ok([12, 13, 14, 15].every(q => abBar.some(e => e.p === q && e.d === 'timbalH')), 'abanico: redoble de timbal del 4 al final');
const entra = [...(r.perc[cuerpo0] || []), ...r.extra[cuerpo0]];
ok(entra.some(e => e.p === 0 && e.d === 'timbalH'), 'abanico: golpe de borde en el 1 de lo que viene');
ok(!entra.some(e => e.p > 0 && e.p < 4 && ['timbales', 'campanas'].includes(fam(e.d))), 'abanico: la campana y la cáscara entran recién en el 2');
const pu = secs.find(s => s.id === 'puente'), cb = pu.inicio + pu.compases - 1, CI = { A: [0, 6, 12, 14], B: [4, 8, 14] }[r.lados[cb]];
ok(r.perc[cb].every(e => CI.includes(e.p)), 'cierre: los golpes caen en la figura del lado ' + r.lados[cb]);
ok(r.der.filter(e => e.p >= cb * 16 && e.p < cb * 16 + 16).every(e => CI.includes(e.p - cb * 16)), 'cierre: el piano toca la misma figura');
const fb = nTot - 1;
ok(r.perc[fb].every(e => e.p === 0) && r.der.filter(e => e.p + e.L > fb * 16).every(e => e.p + e.L <= fb * 16 + 4), 'corte final: todo en el 1 y después silencio');

console.log('9. mismo gancho');
const co = secs.find(s => s.id === 'coro'), mb = secs.find(s => s.id === 'mambo');
ok(mb.info.piano === co.info.piano && JSON.stringify(mb.info.celulas) === JSON.stringify(co.info.celulas), 'el mambo usa la fuente y las células del coro');

console.log('10. salidas');
const ly = TM.aLilyPond(r, { clave: 'son 2-3', bpm: 190 });
ok((ly.match(/\\mark "/g) || []).length === secs.length, 'una marca por sección');
const pentagramas = 3 + TM.PISTAS_VIENTOS.filter(f => r.vientos[f].length).length;   // piano (dos), bajo y los vientos que tocan
ok((ly.match(/\\bar "\|\|"/g) || []).length === pentagramas * (secs.length - 1), 'doble barra en todos los pentagramas');
const mid = TM.leerMidi(TM.aMidi(r, 190, { porFamilia: true }));
ok(secs.every(s => mid.textos.includes(s.texto)), 'marcadores de sección en el MIDI');
ok(mid.pistas.some(p => p.nombre === 'congas') && !mid.pistas.some(p => p.nombre === 'percusión'), 'una pista de percusión por familia');

console.log('11. bajo y plato');
const enSec = (x, s, evs) => evs.filter(e => e.p >= s.inicio * 16 && e.p < (s.inicio + s.compases) * 16);
const bPres = enSec(r, pres, r.bajo);
ok(bPres.length && new Set(bPres.map(e => e.ps[0])).size === 1 && bPres.every(e => e.ps[0] < 40 && e.L >= 32), 'presión: una sola nota grave y larga (nota pedal)');
const desp = TM.generarCancion({ clave: 'son 2-3', perillas: {}, secciones: [{ prog: 'Am Dm E7 Am', marcha: 'despelote', semilla: 9 }] }, M);
ok(desp.bajo.filter(e => /glissando/.test(e.art)).length >= 4, 'despelote: el bajo trae deslizamientos');
ok(!/\\glissando~/.test(TM.aLilyPond(desp, { clave: 'son 2-3', bpm: 190 })), 'el glissando sale del último pedazo de la nota, no hacia su propia ligadura');
const larg = TM.generarCancion({ clave: 'son 2-3', perillas: {}, secciones: [{ prog: 'Am Dm E7 Am', marcha: 'presion', vueltas: 2, semilla: 9, perillas: { b_estilo: 'largas' } }] }, M);
ok(larg.bajo.every(e => e.p % 32 === 0 && e.L >= 32), 'notas largas: cambian cada 2 compases como mucho');
const mam = secs.find(s => s.id === 'mambo'), uno = (x, b) => [...(x.perc[b] || []), ...x.extra[b]];
ok(uno(r, mam.inicio).some(e => e.p === 0 && e.d === 'plato') && fam('plato') === 'timbales', 'plato del timbalero al entrar al mambo (pista de timbales)');
ok(uno(r, cuerpo0).some(e => e.p === 0 && e.d === 'plato') && !uno(r, cuerpo0).some(e => e.d === 'crash'), 'el abanico termina en el plato del timbalero, no en el de la batería');
ok(!uno(gen({ mambo: { pistas: { timbales: false } } }), mam.inicio).some(e => e.d === 'plato'), 'sin timbales en el mambo, no hay plato');

console.log('12. velocidad');
const larga = { titulo: 'Larga', clave: 'son 3-2', perillas: {}, secciones: Array.from({ length: 8 }, (_, i) => ({ id: i, nombre: 'S' + i, prog: 'Am D7 G E7 Am D7 G E7 Dm G C A7', marcha: ['cuerpo', 'marcha', 'mambo', 'presion'][i % 4], semilla: i + 1, transicion: ['abanico', 'cierre', 'ninguna', 'corte'][i % 4] })) };
const t0 = Date.now(), rl = TM.generarCancion(larga, M), ms = Date.now() - t0;
console.log(`   ${rl.compases} compases en ${ms} ms`);
ok(ms < 1000, 'una canción de ~100 compases en menos de 1 s');

if (process.argv[2]) { fs.writeFileSync(process.argv[2], ly); console.log('LilyPond → ' + process.argv[2]); }
console.log(`\n${pruebas - fallas}/${pruebas} bien`);
process.exit(fallas ? 1 : 0);
