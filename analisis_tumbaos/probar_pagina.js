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

// percusión clásica con los patrones de las fuentes (Kevin Moore, Beyond Salsa Percussion, tabla p. 22; James Dreier, «Timba Groove #1»)
const clasica = { titulo: 'Clásica', clave: 'son 2-3', perillas: { p_fuente: 'clasica' }, secciones: [
  { id: 'c', nombre: 'Cuerpo', prog: 'Am Dm E7 Am', marcha: 'cuerpo', semilla: 1 },
  { id: 'k', nombre: 'Coro', prog: 'Am D7 G E7', marcha: 'marcha', semilla: 2 },
  { id: 'b', nombre: 'Bomba', prog: 'Am Am E7 E7', marcha: 'bomba', semilla: 3 },
  { id: 'p', nombre: 'Presión', prog: 'Am Am E7 E7', marcha: 'presion', semilla: 4 }] };
const rc = TM.generarCancion(clasica, M);
ctx.__percMotor = { id: 'motor-2', compases: rc.perc, extra: rc.extra, mix: rc.mixes, estilo: rc.estilos };
const sc = evaluate(parse(TM.aLilyPond(rc, { clave: 'son 2-3', bpm: 190, percusionId: 'motor-2' }))), notas2 = buildNotes(sc).filter(n => n.part === 'perc');
const msc = sc.measures, en = (b, d) => notas2.filter(n => n.drum === d && n.t >= msc[b].start && n.t < msc[b].end).map(n => Math.round((n.t - msc[b].start) / ((msc[b].end - msc[b].start) / 16))).sort((a, b) => a - b).join(',');
const sec = id => rc.secciones.find(s => s.id === id), lado = b => rc.lados[b];
const k0 = sec('k').inicio;
ok([0, 1, 2, 3].every(i => en(k0 + i, 'kick') === (lado(k0 + i) === 'B' ? '0,6' : '2,8,12')), 'coro: el bombo de la marcha de timba (lado 2: 1 y 2&; lado 3: 1&, 3 y 4)');
ok(en(k0, 'bell') && !en(k0, 'cascara') && en(k0, 'bongoBell'), 'coro: el timbalero pasa de la cáscara a la campana, con la campana del bongó');
ok([0, 1].every(i => en(k0 + i, 'bongoBellC').split(',').includes('6') === (lado(k0 + i) === 'A')), 'campana del bongó: sin el talón del 2& en el lado 2');
const c0 = sec('c').inicio;
ok(en(c0, 'cascara') && en(c0, 'guiroL') && en(c0, 'timbalL') === '6,12', 'cuerpo: cáscara, güiro y la izquierda en el timbal grave (6 y 12)');
const b0 = sec('b').inicio, bajoB = rc.bajo.filter(e => e.p >= b0 * 16 && e.p < (b0 + sec('b').compases) * 16);
ok(en(b0, 'ride') && bajoB.some(e => /glissando/.test(e.art)), 'bomba: ride en la batería y el bajo deslizándose');
const p0 = sec('p').inicio, kp = [0, 1, 2, 3].map(i => en(p0 + i, 'kick'));
ok(kp.slice(0, 3).every(x => !x.split(',').includes('2')), 'presión: el bombo del 2 no va en cada lado 3, solo al final de la frase');
console.log(fallas ? fallas + ' fallas' : 'cadena bien');
process.exit(fallas ? 1 : 0);
