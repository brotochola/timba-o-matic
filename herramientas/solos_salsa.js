/* =====================================================================
   Los solos de vientos de los MIDI de son, salsa y timba, a la grilla del motor
   uso: node herramientas/solos_salsa.js [--ver]        busca en todas las carpetas de midis/ y escribe base/base_solos_salsa.json
   Cada MIDI pasa por el análisis del motor (02_analisis: el pulso, los compases, el lado de la clave, los acordes de cada
   compás). Después, canal por canal de viento (trompeta, trombón, saxos), busca los tramos de 4 compases o más donde ese
   instrumento toca solo: una nota por vez, por lo menos 3 notas por compás, los demás vientos callados (o casi) y sin repetir
   un riff de una o dos claves (eso es una moña, no un solo). Solo trompeta y trombón: en los karaokes, la flauta o el saxo suelen
   llevar la melodía del cantante como guía (si el fuentes.json dice que hay un solo de saxo o de flauta, entra). Y que sea una
   línea de solo: 3,5 notas por compás o más, una quinta de ámbito o más, cinco alturas distintas o más y no más de 40% de notas
   repetidas. Si el fuentes.json dice dónde está el solo («solo»: «trompeta, canal 4, compases 65-96»; el canal desde 1), se toma
   ese tramo; lo que dice «posible…» (sin confirmar de oído) no: pasa por el detector como cualquier otro. Lo que sale va con el mismo formato que base/base_solos.json
   (notas [semicorchea, duración, nota, -1], acordes [semicorchea, nombre]) y el lado de la clave de su primer compás; el motor
   (10_solo.js) lo suma a las frases de la trompeta solista y la juzga en su lado de la clave.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const RUTAS = require('./rutas');
const TM = require(RUTAS.MOTOR);
const SALIDA = RUTAS.SOLOS_SALSA, VER = process.argv.includes('--ver');
const pc = m => ((m % 12) + 12) % 12;
const instrumento = (prog, nombre) => prog === 56 || prog === 59 || /tromp|trump|tpt/i.test(nombre) ? 'tp' : prog === 57 || /trombon|trombón|tbn/i.test(nombre) ? 'tb' : prog >= 64 && prog <= 67 || /sax/i.test(nombre) ? 'sax' : prog === 73 || /flaut|flute/i.test(nombre) ? 'fl' : null;

const carpetas = [RUTAS.ORIGINALES, ...RUTAS.colecciones().map(c => path.join(RUTAS.MIDIS, c))].filter(d => !/toontrack|jazz/.test(d));
const solos = [];
let vistos = 0;
for (const dir of carpetas) {
  const meta = RUTAS.leerFuentes(dir);
  for (const f of RUTAS.listarTodo(dir)) {
    const nombre = path.relative(dir, f).split(path.sep).join('/'), m = meta[nombre] || {};
    if (m.excluir || !['salsa', 'cubano', 'timba', undefined].includes(m.estilo)) continue;
    let s, det;
    try { s = TM.leerMidi(new Uint8Array(fs.readFileSync(f))); det = TM.analizarDetalle(s, m); } catch (e) { continue; }
    vistos++;
    if (!['clave', 'declarado'].includes(det.ladoFuente) || det.compases.length < 8) continue;   // sin el lado de la clave seguro, no sirve
    // los canales de viento, con sus notas en semicorcheas desde el 1 del primer compás
    const canales = {};
    for (const t of s.pistas) for (const n of t.notas) { if (n.canal === 9) continue; (canales[n.canal] = canales[n.canal] || { notas: [], nombre: t.nombre, prog: null }).notas.push(n); }
    for (const t of s.pistas) for (const c in t.programas) if (canales[c] && canales[c].prog == null) canales[c].prog = t.programas[c];
    const dicho = /^posible|sin solo/i.test(m.solo || '') ? null : /canals*(d+)[^d]+compases?s*(d+)s*[-–a]s*(d+)/i.exec(m.solo || ''), insDicho = /saxo|sax/i.test(m.solo || '') ? 'sax' : /flaut/i.test(m.solo || '') ? 'fl' : /trombón|trombon/i.test(m.solo || '') ? 'tb' : 'tp';
    const vientos = Object.entries(canales).map(([c, x]) => ({ canal: +c, ins: instrumento(x.prog, x.nombre || '') || (dicho && +c === +dicho[1] - 1 ? insDicho : null), notas: x.notas }))
      .filter(x => x.ins && (x.ins === 'tp' || x.ins === 'tb' || (dicho && x.canal === +dicho[1] - 1)));
    if (!vientos.length) continue;
    const B = det.compases, x0 = B[0].x * 2;
    const compasDe = q => { let lo = 0, hi = B.length - 1; while (lo < hi) { const k = (lo + hi + 1) >> 1; if (B[k].x * 2 <= q) lo = k; else hi = k - 1; } return lo; };
    for (const v of vientos) v.ev = v.notas.map(n => { const q = Math.round(det.U(n.on) * 2); return { q, d: Math.max(1, Math.round((det.U(n.off) - det.U(n.on)) * 2)), m: n.alt }; }).sort((a, b) => a.q - b.q);
    for (const v of vientos) {
      // por compás: cuántas notas, si va de a una, si los otros vientos tocan, y el ritmo (para ver si repite)
      const porB = B.map(() => ({ n: 0, ataques: new Set(), otros: 0, ritmo: '' }));
      for (const e of v.ev) { const b = compasDe(e.q); if (e.q < B[b].x * 2 || e.q >= B[b].x * 2 + 16) continue; porB[b].n++; porB[b].ataques.add(e.q); }
      for (const o of vientos) if (o !== v) for (const e of o.ev) { const b = compasDe(e.q); if (porB[b]) porB[b].otros++; }
      for (let b = 0; b < B.length; b++) porB[b].ritmo = [...porB[b].ataques].map(q => q - B[b].x * 2).sort((a, c) => a - c).join(',');
      let solo = porB.map((x, b) => x.n >= 3 && x.ataques.size >= x.n * 0.9 && x.otros <= 2);
      // el tramo que dice fuentes.json (los compases del MIDI, en 4/4 desde el principio, pasados a los compases del análisis)
      if (dicho) {
        if (v.canal !== +dicho[1] - 1) continue;
        const desde = compasDe(Math.round(det.U((+dicho[2] - 1) * 4 * s.ppq) * 2)), hasta = compasDe(Math.round(det.U(+dicho[3] * 4 * s.ppq) * 2) - 1);
        solo = porB.map((x, b) => b >= desde && b <= hasta);
      }
      // los tramos de 4 compases o más (se perdona un compás suelto en el medio), que no repiten su ritmo clave tras clave
      for (let b = 0; b < B.length;) {
        if (!solo[b]) { b++; continue; }
        let e = b; while (e + 1 < B.length && (solo[e + 1] || (e + 2 < B.length && solo[e + 2] && porB[e + 1].otros <= 2))) e++;
        const largo = e - b + 1;
        if (largo >= 4) {
          let iguales = 0; for (let k = b + 2; k <= e; k++) if (porB[k].ritmo && porB[k].ritmo === porB[k - 2].ritmo) iguales++;
          if (dicho || iguales / Math.max(1, largo - 2) < 0.5) {
            const q0 = B[b].x * 2, q1 = B[e].x * 2 + 16, notas = [];
            for (const n of v.ev) if (n.q >= q0 && n.q < q1 && !(notas.length && notas.at(-1)[0] === n.q - q0)) notas.push([n.q - q0, n.d, n.m, -1]);
            for (let i = 0; i + 1 < notas.length; i++) notas[i][1] = Math.min(notas[i][1], notas[i + 1][0] - notas[i][0]);
            const acordes = []; let ult = null;
            for (let k = b; k <= e; k++) (B[k].acordes || []).forEach((ch, j, arr) => { const p = (k - b) * 16 + (arr.length > 1 && j ? 8 : 0); if (ch && ch.nombre !== ult) { acordes.push([p, ch.nombre]); ult = ch.nombre; } });
            const ms = notas.map(n => n[2]); let rep_ = 0; for (let i = 1; i < ms.length; i++) if (ms[i] === ms[i - 1]) rep_++;
            const linea = notas.length / largo >= 3.5 && Math.max(...ms) - Math.min(...ms) >= 7 && new Set(ms).size >= 5 && rep_ / Math.max(1, ms.length - 1) <= 0.4;
            if (notas.length >= 12 && acordes.length && (linea || dicho)) {
              const id = 'sal:' + path.relative(RUTAS.MIDIS, f).split(path.sep).join('/') + '#' + v.canal + '@' + (b + 1);
              const tit = m.titulo || path.basename(f).replace(/\.\w+$/, '');
              solos.push({ id, ...(dicho ? { curado: true } : {}), interprete: (tit.split(' · ')[0] || tit).trim(), tema: (tit.split(' · ')[1] || tit).trim(), inst: v.ins, estilo: m.estilo || 'salsa', feel: 'SALSA', tempo: Math.round(det.segs[0] ? det.segs[0].bpm : 190),
                lado: B[b].lado, compases: largo, desde: b + 1, acordes, notas, ideas: [] });
              if (VER) console.log(`${tit.padEnd(46).slice(0, 46)} ${v.ins.padEnd(3)} canal ${String(v.canal + 1).padStart(2)} compases ${b + 1}-${e + 1} (${largo}) ${notas.length} notas · lado ${B[b].lado === 'A' ? 3 : 2}`);
            }
          }
        }
        b = e + 1;
      }
    }
  }
}
// el mismo solo en dos colecciones (el mismo tema bajado dos veces): queda uno
const firma = x => x.notas.map(n => n[0] + ":" + n[2]).join(","), vistas = new Set();
for (let i = solos.length - 1; i >= 0; i--) { const k = firma(solos[i]); if (vistas.has(k)) solos.splice(i, 1); else vistas.add(k); }
// ---------- las transcripciones: midis/transcripciones/*.ly (solos pasados a mano de partituras: Ferguson 2009, el son de los
// septetos). LilyPond con una marca por compás: «%% número lado acordes» (lado 3 o 2 de la clave; uno o dos acordes, «-» sigue el de
// antes). Las notas, en altura absoluta; los tresillos pasan a corcheas derechas como en solos_jazz.js (el tresillo entero,
// corchea y dos semicorcheas; sus dos primeras, corcheas; sus dos últimas, el & y la «a»)
const TRANS = path.join(RUTAS.MIDIS, 'transcripciones');
const NOTA = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
function leerCompas(txt) {
  // [{t (semicorcheas, puede ser fracción), d, m (null: silencio), liga}]
  const ev = []; let t = 0, factor = 1, i = 0;
  const toks = txt.replace(/\\grace\s*[a-g][a-z',]*\d*/g, ' ').replace(/[()\[\]]/g, ' ').replace(/-[.>^_!]/g, ' ').match(/\\tuplet\s*3\/2\s*\{|\}|[a-gr](?:is|es|s)*[',]*\d*\.*~?|R1/g) || [];
  for (const k of toks) {
    if (k.startsWith('\\tuplet')) { factor = 2 / 3; continue; }
    if (k === '}') { factor = 1; continue; }
    if (k === 'R1') { t += 16; continue; }
    const m = /^([a-gr])((?:is|es|s)*)([',]*)(\d*)(\.*)(~?)$/.exec(k); if (!m) continue;
    const len = +(m[4] || 4), dots = m[5].length; let d = 16 / len * (dots === 1 ? 1.5 : dots === 2 ? 1.75 : 1) * factor;
    if (m[1] === 'r') { t += d; continue; }
    const acc = (m[2].match(/is/g) || []).length - (m[2].match(/es|(?<![ei])s/g) || []).length;
    const alt = 48 + NOTA[m[1]] + acc + 12 * ((m[3].match(/'/g) || []).length - (m[3].match(/,/g) || []).length);
    const u = ev[ev.length - 1];
    if (u && u.liga && u.m === alt) { u.d += d; u.liga = !!m[6]; t += d; continue; }
    ev.push({ t, d, m: alt, liga: !!m[6] }); t += d;
  }
  return { ev, largo: t };
}
// las semicorcheas de una lista de notas con tiempos en fracciones: por tiempo, las de tresillo a corcheas derechas
function aGrilla(ev) {
  const porTiempo = new Map(); for (const e of ev) { const b = Math.floor(e.t / 4 + 1e-6); (porTiempo.get(b) || porTiempo.set(b, []).get(b)).push(e); }
  for (const [b, es] of porTiempo) {
    if (es.every(e => Math.abs(e.t - Math.round(e.t)) < 1e-6)) { for (const e of es) e.q = Math.round(e.t); continue; }
    const fr = es.map(e => e.t / 4 - b), n = es.length, en0 = fr[0] < 0.17;
    const lug = n === 1 ? [en0 ? 0 : 2] : n === 2 ? (en0 ? [0, 2] : [2, 3]) : n === 3 ? (en0 ? [0, 2, 3] : [1, 2, 3]) : [0, 1, 2, 3];
    es.forEach((e, i) => { e.q = i < lug.length ? b * 4 + lug[i] : null; });
  }
  return ev.filter(e => e.q != null);
}
let transcriptos = 0;
if (fs.existsSync(TRANS)) for (const archivo of fs.readdirSync(TRANS).filter(x => x.endsWith('.ly')).sort()) {
  const txt = fs.readFileSync(path.join(TRANS, archivo), 'utf8'), cab = k => (new RegExp(k + '\\s*=\\s*"([^"]*)"').exec(txt) || [])[1] || '';
  const compases = []; let meta = null, buf = '', ultAc = null;
  const cerrar = () => { if (meta) { const c = leerCompas(buf.split('|')[0]); if (Math.abs(c.largo - 16) > 1e-6) console.warn(`${archivo}, compás ${meta.n}: dura ${c.largo} semicorcheas`); compases.push({ ...meta, ev: c.ev }); } meta = null; buf = ''; };
  for (const linea of txt.split(/\r?\n/)) {
    const mm = /^\s*%%\s*(\d+)\s+([23])\s+(.*)$/.exec(linea);
    if (mm) { cerrar(); const acs = mm[3].trim().split(/\s+/).map(a => a === '-' ? ultAc : a).filter(Boolean); if (acs.length) ultAc = acs[acs.length - 1]; meta = { n: +mm[1], lado: mm[2] === '3' ? 'A' : 'B', acs }; continue; }
    if (meta) { buf += ' ' + linea.replace(/%.*$/, ''); if (linea.includes('|')) cerrar(); }
  }
  cerrar();
  // los tramos de compases seguidos: cada uno, un solo
  const tramos = []; for (const c of compases) { const t = tramos[tramos.length - 1]; if (t && t[t.length - 1].n === c.n - 1) t.push(c); else tramos.push([c]); }
  for (const tr of tramos) {
    const ev = [], acordes = []; let ult = null;
    tr.forEach((c, k) => {
      for (const e of c.ev) ev.push({ ...e, t: e.t + k * 16 });
      c.acs.forEach((a, j) => { const p = k * 16 + (c.acs.length > 1 && j ? 8 : 0); if (a !== ult) { acordes.push([p, a]); ult = a; } });
    });
    // las ligadas de un compás al otro (la nota que sigue igual en el compás de al lado)
    for (let i = ev.length - 1; i > 0; i--) { const a = ev[i - 1], b = ev[i]; if (a.liga && a.m === b.m && Math.abs(a.t + a.d - b.t) < 1e-6) { a.d += b.d; a.liga = b.liga; ev.splice(i, 1); } }
    const q = aGrilla(ev), notas = [];
    for (const e of q) if (!(notas.length && notas.at(-1)[0] === e.q)) notas.push([e.q, Math.max(1, Math.round(e.d)), e.m, -1]);
    for (let i = 0; i + 1 < notas.length; i++) notas[i][1] = Math.min(notas[i][1], notas[i + 1][0] - notas[i][0]);
    if (notas.length < 6) continue;
    solos.push({ id: 'tr:' + archivo + '#' + tr[0].n, curado: true, transcripcion: true, interprete: cab('solista') || cab('grupo'), tema: cab('title'), inst: 'tp', estilo: cab('estilo') || 'cubano', feel: 'SON',
      tempo: +cab('pulso') || 140, lado: tr[0].lado, compases: tr.length, desde: tr[0].n, acordes, notas, ideas: [] });
    transcriptos++;
    if (VER) console.log(`${(cab('title') + ' · ' + cab('solista')).padEnd(46).slice(0, 46)} tp  transcripción, compases ${tr[0].n}-${tr[tr.length - 1].n} (${tr.length}) ${notas.length} notas · lado ${tr[0].lado === 'A' ? 3 : 2}`);
  }
}

const base = { fuente: 'MIDIs de son, salsa y timba de midis/ (no se suben; ver midis/README.md): los tramos donde un viento toca solo', generado: new Date().toISOString().slice(0, 10), solos };
fs.writeFileSync(SALIDA, JSON.stringify(base));
const porIns = {}; for (const x of solos) porIns[x.inst] = (porIns[x.inst] || 0) + 1;
console.log(`${vistos} MIDI y ${transcriptos} tramos transcriptos · ${solos.length} solos (${Object.entries(porIns).map(([k, v]) => k + ' ' + v).join(', ')}) · ${solos.reduce((a, x) => a + x.compases, 0)} compases · ${solos.reduce((a, x) => a + x.notas.length, 0)} notas → ${path.relative(RUTAS.RAIZ, SALIDA)}`);
