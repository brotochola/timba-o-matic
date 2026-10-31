/* =====================================================================
   Prueba de la cadena de la página sin navegador
   uso: node analisis_tumbaos/probar_pagina.js
   canción del motor → LilyPond → intérprete de index.html (secciones 1 a 4: tokenizer, parser, evaluador, buildNotes)
   y revisa la percusión que sonaría: aprendida o clásica por compás, pistas apagadas por sección, sin maracas, transiciones
   ===================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const TM = require(path.join(RAIZ, 'analisis_tumbaos/motor'));
const L = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').split('\n');
const i0 = L.findIndex(l => l.includes('1. TOKENIZER')) - 1, i1 = L.findIndex(l => l.includes('5. ENGRAVING WITH VEXFLOW')) - 1;
const codigo = L.slice(i0, i1).join('\n') + '\n;globalThis.__api={parse,evaluate,buildNotes};';
const ctx = { window: {}, TumbaoMotor: TM, console }; ctx.globalThis = ctx; ctx.window = ctx;
vm.createContext(ctx); vm.runInContext(codigo, ctx);
const { parse, evaluate, buildNotes } = ctx.__api;
const base = JSON.parse(fs.readFileSync(path.join(RAIZ, 'analisis_tumbaos/base_tumbaos.json'), 'utf8'));
const M = TM.construirModelo(base.fuentes.filter(f => !f.coleccion));
const cancion = { titulo: 'Cadena', clave: 'son 2-3', perillas: {}, secciones: [
  { id: 'a', nombre: 'Cuerpo', prog: 'Am Dm E7 Am', marcha: 'cuerpo', vueltas: 2, semilla: 5, transicion: 'abanico', pistas: { bateria: false } },
  { id: 'b', nombre: 'Coro', prog: 'Am D7 G E7', marcha: 'marcha', vueltas: 2, semilla: 6, pistas: { bongo: false } },
  { id: 'c', nombre: 'Presión', prog: 'Am Am E7 E7', marcha: 'presion', vueltas: 2, semilla: 7, transicion: 'corte', pistas: { bateria: false } },
  { id: 'd', nombre: 'Muela', prog: 'Am D7 G E7', marcha: 'muela', semilla: 8 } ] };
const r = TM.generarCancion(cancion, M);
ctx.__percMotor = { id: 'motor-1', compases: r.perc, extra: r.extra, mix: r.mixes, estilo: r.estilos };
const ly = TM.aLilyPond(r, { clave: 'son 2-3', bpm: 190, percusionId: 'motor-1' });
const score = evaluate(parse(ly)), notes = buildNotes(score);
const perc = notes.filter(n => n.part === 'perc'), ms = score.measures;
const barOf = t => ms.findIndex(m => t >= m.start && t < m.end);
const porBar = ms.map(() => []); for (const n of perc) porBar[barOf(n.t)].push(n);
let fallas = 0; const ok = (c, m) => { if (!c) { fallas++; console.log('FALLA', m); } };
ok(ms.length === r.compases, `compases ${ms.length} = ${r.compases}`);
ok((score.marks || []).length === 4, 'cuatro marcas: ' + (score.marks || []).map(x => x.text).join(' | '));
ok(!perc.some(n => n.drum === 'maraca'), 'sin maracas');
const fam = d => TM.familiaPerc(d);
for (const s of r.secciones) for (let b = s.inicio; b < s.inicio + s.compases; b++) {
  const off = Object.entries(r.mixes[b]).filter(([, v]) => v <= 0).map(([f]) => f);
  ok(!porBar[b].some(n => off.includes(fam(n.drum))), `${s.nombre} compás ${b + 1}: no suenan ${off.join(',')}`);
  ok(porBar[b].length > 0 || s.marcha === 'muela', `${s.nombre} compás ${b + 1}: hay percusión`);
}
const pres = r.secciones[2];
ok(porBar[pres.inicio].some(n => n.drum === 'clave') && !porBar[pres.inicio].some(n => fam(n.drum) === 'bateria'), 'presión clásica con la batería apagada: queda la clave');
ok(porBar[pres.inicio + pres.compases - 1].every(n => n.t === ms[pres.inicio + pres.compases - 1].start), 'el corte: todo en el 1');
const coro = r.secciones[1];
ok(porBar[coro.inicio].some(n => n.drum === 'timbalH' && n.t === ms[coro.inicio].start), 'el golpe del abanico en el 1 del coro');
// el .mid de la canción (como el botón de la página): la percusión tal como suena, una pista por familia, marcadores
const percBar = ms.map(() => []);
for (const n of perc) { const i = barOf(n.t), m = ms[i]; percBar[i].push({ p: Math.round((n.t - m.start) / ((m.end - m.start) / 16)), d: n.drum, v: n.vel || 1 }); }
const mid = TM.leerMidi(TM.aMidi({ ...r, extra: null }, 190, { porFamilia: true, perc: percBar }));
ok(r.secciones.every(s => mid.textos.includes(s.texto)), 'MIDI: un marcador por sección');
const pistasPerc = mid.pistas.filter(p => p.nombre in TM.FAMILIAS);
ok(pistasPerc.reduce((a, p) => a + p.notas.length, 0) === perc.filter(n => TM.APP_GM[n.drum]).length, 'MIDI: los mismos golpes que suenan, también los de la percusión clásica');
ok(pistasPerc.every(p => p.notas.every(x => TM.familiaPerc(Object.keys(TM.APP_GM).find(d => TM.APP_GM[d] === x.alt && TM.familiaPerc(d) === p.nombre) || '') === p.nombre)), 'MIDI: cada golpe en la pista de su familia');
console.log(`${perc.length} golpes · ${ms.length} compases · marcas: ${(score.marks || []).map(x => x.text).join(' | ')} · MIDI: ${mid.pistas.map(p => p.nombre).join(', ')}`);
console.log(fallas ? fallas + ' fallas' : 'cadena bien');
process.exit(fallas ? 1 : 0);
