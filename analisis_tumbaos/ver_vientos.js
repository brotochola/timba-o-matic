/* Visor de vientos: compás por compás, el lado de la clave, el acorde y lo que toca cada pista de viento
   uso: node analisis_tumbaos/ver_vientos.js "tema.mid" [compás inicial] [cantidad]
   Cada ataque: posición en semicorcheas (0 = 1, 4 = 2, 8 = 3, 12 = 4, 14 = 4&), notas y duración (/n semicorcheas). */
const fs = require('fs'), path = require('path');
const TM = require('./motor');
const [archivo, desde = '0', n = '16'] = process.argv.slice(2);
if (!archivo) { console.log('uso: node analisis_tumbaos/ver_vientos.js "tema.mid" [compás inicial] [cantidad]'); process.exit(1); }
const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'base_tumbaos.json'), 'utf8'));
const s = TM.leerMidi(fs.readFileSync(archivo)), det = TM.analizarDetalle(s, {});
if (det.ladoFuente === 'sin') TM.deducirLados(det, base.perfil, true);
const INSTR = (prog, nombre) => prog === 56 || prog === 59 ? 'tpt' : prog === 57 || prog === 58 ? 'tbn' : prog >= 64 && prog <= 67 ? 'sax' : prog === 61 ? 'met' :
  /tromp|trump/i.test(nombre) ? 'tpt' : /trombon|trombón/i.test(nombre) ? 'tbn' : /sax/i.test(nombre) ? 'sax' : /brass|metal/i.test(nombre) ? 'met' : null;
const N = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'], nm = m => N[m % 12] + (Math.floor(m / 12) - 1);
const pistas = [];
for (const p of s.pistas) { const porCanal = {}; for (const x of p.notas) if (x.canal !== 9) (porCanal[x.canal] = porCanal[x.canal] || []).push(x);
  for (const [c, ns] of Object.entries(porCanal)) { const ins = INSTR(+(p.programas[c] ?? Object.values(p.programas)[0]), p.nombre || ''); if (ins && ns.length > 20) pistas.push({ ins: ins + (pistas.filter(x => x.ins.startsWith(ins)).length + 1), ns }); } }
console.log(`${path.basename(archivo)} · clave ${det.clave ? det.clave.tipo : 'deducida'} (${det.ladoFuente}) · vientos: ${pistas.map(p => p.ins).join(', ')}`);
for (const b of det.compases.slice(+desde, +desde + +n)) {
  const filas = pistas.map(p => {
    const at = {}; for (const x of p.ns) { const q = Math.round(det.U(x.on) * 2) - 2 * b.x; if (q < 0 || q >= 16) continue; (at[q] = at[q] || []).push(nm(x.alt) + '/' + Math.max(1, Math.round((det.U(x.off) - det.U(x.on)) * 2))); }
    return Object.keys(at).length ? `${p.ins}: ` + Object.entries(at).map(([q, v]) => q + ':' + v.join('+')).join(' ') : null;
  }).filter(Boolean);
  console.log(`${String(b.i + 1).padStart(4)} ${b.lado === 'A' ? 'lado 3' : 'lado 2'} ${b.acordes.map(a => a.nombre).join('+').padEnd(10)} ${filas.join('  ║  ') || '—'}`);
}
