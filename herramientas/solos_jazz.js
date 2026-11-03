/* =====================================================================
   Los solos de la Weimar Jazz Database (Jazzomat, HfM Weimar; ODbL) a la grilla del motor
   uso: node herramientas/solos_jazz.js            lee midis/jazz/wjazzd.db y escribe base/base_solos.json
   La base se baja de https://jazzomat.hfm-weimar.de/download/downloads/wjazzd.db (42 MB) a midis/jazz/ (no va al repositorio).
   Entran los solos de trompeta y corneta, y los de cualquier instrumento con toque latino o funk (en corcheas derechas, como la
   salsa), todos en 4/4. Cada nota va a la grilla de semicorcheas en corcheas derechas: las corcheas de swing (anotadas como
   corcheas o como 1a y 3a de tresillo) quedan en el tiempo y el &, y los tresillos pasan a corchea y dos semicorcheas (abajo);
   dos notas en la misma semicorchea, queda la primera.
   Lo que sale (base/base_solos.json) es un derivado de la Weimar Jazz Database: va con su licencia (ODbL) y su cita.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const RUTAS = require('./rutas');
const DB = RUTAS.JAZZ, SALIDA = RUTAS.SOLOS;
if (!fs.existsSync(DB)) { console.error('Falta ' + path.relative(RUTAS.RAIZ, DB) + ': bajala de https://jazzomat.hfm-weimar.de/download/downloads/wjazzd.db'); process.exit(1); }
process.removeAllListeners('warning');   // node:sqlite avisa que es experimental
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(DB, { readOnly: true });
const q = (s, ...a) => db.prepare(s).all(...a);

// ---------- los acordes de la base a los nombres del motor (02_analisis: '', m, 7, m7, maj7, 6, m6, 9, 7b9, dim7, m7b5, sus4, 7sus4, aug)
const CALIDAD = q => {
  if (q === 'NC') return null;
  if (/^-j7/.test(q)) return 'm';
  if (/^-7b5|^m7b5/.test(q)) return 'm7b5';
  if (/^-6|^-69/.test(q)) return 'm6';
  if (/^-7|^-79/.test(q)) return 'm7';
  if (q === '-') return 'm';
  if (/^\+?j7|^j/.test(q)) return 'maj7';
  if (/^69|^6/.test(q)) return '6';
  if (/^o/.test(q)) return 'dim7';
  if (/^sus7|^sus79/.test(q)) return '7sus4';
  if (/^sus/.test(q)) return 'sus4';
  if (/^\+7|^\+79/.test(q)) return '7';
  if (q === '+') return 'aug';
  if (/^79b|^7alt|^79#/.test(q)) return '7b9';
  if (/^79$/.test(q)) return '9';
  if (/^7/.test(q)) return '7';
  if (q === '') return '';
  return undefined;
};
const acordeDe = s => { const m = /^([A-G][#b]?)([^/]*)(\/.*)?$/.exec(s || ''); if (!m) return null; const c = CALIDAD(m[2]); return c === undefined ? undefined : c === null ? null : m[1] + c; };

const solos = q(`select s.melid, s.performer, s.title, s.instrument, s.style, s.avgtempo, s.rhythmfeel, s.key, s.signature from solo_info s
  where s.instrument in ('tp','cor') or s.rhythmfeel like '%LATIN%' or s.rhythmfeel like '%FUNK%' order by s.melid`);
const salida = [], raros = new Set();
let notasTot = 0, chocan = 0;
for (const s of solos) {
  const ms = q('select onset, pitch, duration, bar, beat, tatum, division, beatdur, num, denom from melody where melid = ? order by onset', s.melid);
  if (!ms.length || ms.some(m => m.num !== 4 || m.denom !== 4)) continue;   // solo 4/4
  const bt = q('select bar, beat, chord from beats where melid = ? order by onset', s.melid);
  const b0 = Math.min(...ms.map(m => m.bar), ...bt.map(b => b.bar));
  // los acordes, de a cambios: [semicorchea, nombre] (sin acorde: null)
  const acordes = []; let ult;
  for (const b of bt) { if (!b.chord) continue; const a = acordeDe(b.chord); if (a === undefined) { raros.add(b.chord); continue; } if (a === ult) continue; acordes.push([(b.bar - b0) * 16 + (b.beat - 1) * 4, a]); ult = a; }
  // las frases (PHRASE) y las ideas (IDEA, las unidades de nivel medio de Frieler: lick, line, melody, rhythm, expressive, quote…)
  const frases = q("select start, end from sections where melid = ? and type = 'PHRASE' order by start", s.melid);
  const ideas = q("select start, value from sections where melid = ? and type = 'IDEA' order by start", s.melid);
  const fraseDe = new Int32Array(ms.length).fill(-1); frases.forEach((f, i) => { for (let k = f.start; k <= f.end && k < ms.length; k++) fraseDe[k] = i; });
  // la semicorchea de cada nota, tiempo por tiempo, en corcheas derechas (la salsa no swinguea). Las divisiones binarias (corcheas,
  // semicorcheas) van a la más cercana. Las ternarias no: redondear manda la corchea de swing anotada como tresillo (1a y 3a) a la
  // última semicorchea del tiempo (un puntillo que nadie tocó) y la 2a y 3a del tresillo a la «e» y la «a». Así: la 1a y la 3a, a
  // corcheas; la 2a y la 3a, al & y la «a» (lleva al tiempo que sigue); la 2a o la 3a solas, al &; el tresillo entero, corchea y
  // dos semicorcheas; cuatro o más (seisillos), semicorcheas seguidas, las que entren
  const sub16 = new Array(ms.length).fill(0), porTiempo = new Map();
  ms.forEach((m, k) => { const key = m.bar + ':' + m.beat; (porTiempo.get(key) || porTiempo.set(key, []).get(key)).push(k); });
  for (const ks of porTiempo.values()) {
    const fr = ks.map(k => (ms[k].tatum - 1) / Math.max(1, ms[k].division));
    if (!ks.every(k => ms[k].division % 3 === 0)) { ks.forEach((k, i) => { sub16[k] = Math.round(4 * fr[i]); }); continue; }
    const n = ks.length, en0 = fr[0] < 0.17;
    const lug = n === 1 ? [en0 ? 0 : 2] : n === 2 ? (en0 ? [0, 2] : [2, 3]) : n === 3 ? (en0 ? [0, 2, 3] : [1, 2, 3]) : [0, 1, 2, 3];
    ks.forEach((k, i) => { sub16[k] = i < lug.length ? lug[i] : -1; });   // -1: no entra
  }
  const notas = [], usada = new Set(), idx = new Map();
  ms.forEach((m, k) => {
    if (sub16[k] < 0) { notasTot++; chocan++; return; }
    let sub = sub16[k], beat = m.beat, bar = m.bar;
    if (sub >= 4) { sub -= 4; beat++; if (beat > 4) { beat = 1; bar++; } }
    const p = (bar - b0) * 16 + (beat - 1) * 4 + sub;
    notasTot++;
    if (usada.has(p)) { chocan++; return; }
    usada.add(p);
    const d = Math.max(1, Math.min(32, Math.round(m.duration / (m.beatdur || 0.3) * 4)));
    idx.set(k, notas.length);
    notas.push([p, d, m.pitch, fraseDe[k]]);
  });
  notas.sort((a, b) => a[0] - b[0]);
  // la duración no pasa el ataque siguiente
  for (let i = 0; i + 1 < notas.length; i++) notas[i][1] = Math.min(notas[i][1], notas[i + 1][0] - notas[i][0]);
  const ideasN = ideas.map(x => [idx.has(x.start) ? idx.get(x.start) : null, x.value]).filter(x => x[0] != null);
  salida.push({ id: 'wjd:' + s.melid, interprete: s.performer, tema: s.title, inst: s.instrument, estilo: s.style, feel: s.rhythmfeel, tempo: Math.round(s.avgtempo), tono: s.key,
    compases: Math.ceil((notas.length ? notas[notas.length - 1][0] + 1 : 0) / 16), acordes, notas, ideas: ideasN });
}
const base = {
  fuente: 'Weimar Jazz Database v2.1 (Jazzomat Research Project, HfM Franz Liszt Weimar), https://jazzomat.hfm-weimar.de — Open Data Commons Open Database License (ODbL) v1.0',
  cita: 'Pfleiderer, M., Frieler, K., Abeßer, J., Zaddach, W.-G., Burkhart, B. (eds.) (2017). Inside the Jazzomat. Mainz: Schott.',
  grilla: 'notas: [semicorchea desde el primer compás, duración en semicorcheas, altura MIDI (concierto), frase (-1: fuera de frase)]; acordes: [semicorchea, nombre del motor o null]; ideas: [nota, unidad de nivel medio]',
  generado: new Date().toISOString().slice(0, 10),
  solos: salida
};
const json = JSON.stringify(base);
fs.writeFileSync(SALIDA, json);
const porInst = {}; for (const x of salida) porInst[x.inst] = (porInst[x.inst] || 0) + 1;
console.log(`${salida.length} solos (${Object.entries(porInst).map(([k, v]) => k + ' ' + v).join(', ')}) · ${salida.reduce((a, x) => a + x.notas.length, 0)} notas · ${chocan} de ${notasTot} chocaban en la grilla · ${(json.length / 1024).toFixed(0)} kB → ${path.relative(RUTAS.RAIZ, SALIDA)}`);
if (raros.size) console.log('acordes sin traducir:', [...raros].join(' '));
