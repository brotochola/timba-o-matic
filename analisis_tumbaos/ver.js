/* Visor rápido: acorde, lado de clave y ritmo del piano compás por compás
   uso: node ver.js "archivo.mid" [compás inicial] [cantidad] [parte de piano]
   O = octava (o con notas adentro), x = nota sola, d = díada, A = acorde · | separa los tiempos */
const fs = require('fs'), path = require('path');
const TM = require('./motor'), { nom } = TM;
const META = JSON.parse(fs.readFileSync(path.join(__dirname, 'fuentes.json'), 'utf8'));
const analizarArchivo = f => ({ archivo: path.basename(f), ...TM.analizarDetalle(TM.leerMidi(fs.readFileSync(f)), META[path.basename(f)] || {}) });
const [file, from = '0', n = '24', parte = '0'] = process.argv.slice(2);
if (!file) { console.log('uso: node ver.js "archivo.mid" [compás inicial] [cantidad] [parte]'); process.exit(1); }
const r = analizarArchivo(file);
console.log(`${r.archivo} · tonalidad ${r.tonalidad.raiz} ${r.tonalidad.modo} · clave ${r.clave ? r.clave.tipo + ' (nota ' + r.clave.instrumento + ')' : 'no está en la percusión: el lado A/B es provisorio'} · piano: ${r.partes.map(p => 'canal ' + p.canal + ' (programa ' + p.programa + ')').join(', ')}`);
const pt = r.partes[+parte];
for (const b of r.compases.slice(+from, +from + +n)) {
  const c = pt.compases[b.i], grid = new Array(16).fill('.');
  for (const a of c.as) grid[a.pos] = a.tex.der.startsWith('octava') ? 'O' : a.tex.der === 'sola' ? 'x' : a.tex.der.startsWith('díada') ? 'd' : 'A';
  const lado = b.lado === 'A' ? 'lado 3' : 'lado 2';
  console.log(`${String(b.i).padStart(4)} ${lado}${b.grillaOK ? ' ' : '!'} ${b.acordes.map(a => a.nombre).join('+').padEnd(11)} ${c.tipo.padEnd(8)} ${grid.map((x, i) => (i % 4 === 0 ? '|' : '') + x).join('')}|  ${c.as.map(a => a.ps.map(nom).join('-')).join('  ')}`);
}
