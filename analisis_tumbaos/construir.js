/* =====================================================================
   Construye la base de MIDIs del motor nuevo y la mete en index.html
   uso:
     node analisis_tumbaos/construir.js                    analiza los .mid (carpeta del proyecto y midis/), escribe la base y actualiza index.html
     node analisis_tumbaos/construir.js --sin-html         solo escribe analisis_tumbaos/base_tumbaos.json
     node analisis_tumbaos/construir.js --importar x.json  primero suma a midis/ los MIDI exportados desde la app («Exportar los míos»)
   Los datos de cada archivo (título, estilo, clave, rol, acordes…) van en analisis_tumbaos/fuentes.json.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const TM = require('./motor');
const RAIZ = path.join(__dirname, '..');
const META_F = path.join(__dirname, 'fuentes.json'), BASE_F = path.join(__dirname, 'base_tumbaos.json');
const HTML_F = path.join(RAIZ, 'index.html'), MIDIS = path.join(RAIZ, 'midis');
const args = process.argv.slice(2);
const META = JSON.parse(fs.readFileSync(META_F, 'utf8'));

// ---------- importar lo exportado desde la app
const iImp = args.indexOf('--importar');
if (iImp >= 0) {
  const exp = JSON.parse(fs.readFileSync(args[iImp + 1], 'utf8'));
  if (!fs.existsSync(MIDIS)) fs.mkdirSync(MIDIS);
  for (const f of exp.fuentes || []) {
    if (!f.midi) continue;
    let nombre = (f.archivo || 'importado.mid').replace(/[\\/:*?"<>|]/g, '_'), i = 2;
    while (fs.existsSync(path.join(MIDIS, nombre)) || fs.existsSync(path.join(RAIZ, nombre))) nombre = nombre.replace(/(\.\w+)?$/, m => ` (${i})` + (m || '.mid')), i++;
    fs.writeFileSync(path.join(MIDIS, nombre), Buffer.from(f.midi, 'base64'));
    META[nombre] = Object.fromEntries(Object.entries(f.meta || {}).filter(([, v]) => v !== '' && v != null));
    console.log('importado: midis/' + nombre);
  }
  fs.writeFileSync(META_F, JSON.stringify(META, null, 2) + '\n');
}

// ---------- qué MIDIs: la base original (carpeta del proyecto y midis/) y las colecciones (cada carpeta dentro de midis/,
// con su propio fuentes.json). Las colecciones entran a la base pero la página las deja apagadas hasta que se elijan.
const listar = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => /\.midi?$/i.test(f)).map(f => path.join(d, f)).sort() : [];
const leerMeta = d => fs.existsSync(path.join(d, 'fuentes.json')) ? JSON.parse(fs.readFileSync(path.join(d, 'fuentes.json'), 'utf8')) : {};
const archivos = [...listar(RAIZ), ...listar(MIDIS)].sort().map(f => ({ f, nombre: path.basename(f), meta: META[path.basename(f)] || {} }));
const colecciones = {};
for (const col of fs.existsSync(MIDIS) ? fs.readdirSync(MIDIS, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort() : []) {
  const meta = leerMeta(path.join(MIDIS, col)), lista = listar(path.join(MIDIS, col));
  if (!lista.length) continue;
  colecciones[col] = { titulo: meta._titulo || col };
  for (const f of lista) archivos.push({ f, nombre: path.basename(f), meta: meta[path.basename(f)] || {}, coleccion: col });
}

// ---------- analizar en dos pasadas: la primera aprende el perfil rítmico del piano por lado de clave (solo con la base original)
const datos = archivos.filter(a => !a.meta.excluir).map(a => ({ ...a, bytes: new Uint8Array(fs.readFileSync(a.f)) }));
const primera = datos.map(d => { try { return TM.analizarFuente(d.bytes, d.meta); } catch (e) { console.error(d.nombre + ': ' + e.message); return null; } });
const perfil = TM.perfilLado(primera.filter((f, i) => f && !datos[i].coleccion && ['clave', 'declarado'].includes(f.analisis.ladoFuente)).flatMap(f => f.piano));
const fuentes = [];
datos.forEach((d, i) => {
  if (!primera[i]) return;
  const f = TM.analizarFuente(d.bytes, d.meta, { perfil });
  const id = 'b:' + (d.coleccion ? d.coleccion + '/' : '') + d.nombre;
  if (!f.piano.length && !f.bajo.length && !f.perc.length) { console.log(`${id.slice(2).padEnd(34)} sin compases usables de piano, bajo ni percusión: queda afuera`); return; }
  fuentes.push({ id, archivo: d.nombre, titulo: d.meta.titulo || d.nombre.replace(/\.midi?$/i, ''), estilo: d.meta.estilo || 'salsa', autor: d.meta.autor || '', ...(d.coleccion ? { coleccion: d.coleccion } : {}), ...f });
  const a = f.analisis;
  console.log(`${(d.coleccion ? d.coleccion + '/' : '') + d.nombre.padEnd(34)} ${String(f.piano.length).padStart(4)} ciclos de piano · ${String(f.bajo.length).padStart(4)} de bajo · ${String(f.perc.length).padStart(3)} juegos de percusión · lado: ${a.ladoFuente}${a.conflicto ? ' (' + a.conflicto + ' compases en contra)' : ''}`);
});
const base = { version: 1, generado: new Date().toISOString().slice(0, 10), perfil, colecciones, fuentes };
const json = JSON.stringify(base);
fs.writeFileSync(BASE_F, json);
console.log(`\nbase: ${fuentes.length} fuentes · ${(json.length / 1024).toFixed(0)} kB → ${path.relative(RAIZ, BASE_F)}`);

// ---------- meter el motor y la base en index.html, entre las marcas
if (!args.includes('--sin-html')) {
  if (!fs.existsSync(HTML_F)) { console.error('No encuentro ' + HTML_F); process.exit(1); }
  const html = fs.readFileSync(HTML_F, 'utf8');
  const A = '<!--motor-tumbaos-->', Z = '<!--/motor-tumbaos-->';
  const i0 = html.indexOf(A), i1 = html.indexOf(Z);
  if (i0 < 0 || i1 < i0) { console.error('index.html no tiene las marcas ' + A + ' … ' + Z); process.exit(1); }
  const motorDir = path.join(__dirname, 'motor');
  const codigo = fs.readdirSync(motorDir).filter(f => /^\d\d_.*\.js$/.test(f)).sort().map(f => fs.readFileSync(path.join(motorDir, f), 'utf8')).join('\n');
  const seguro = s => s.replace(/<\/(script)/gi, '<\\/$1');
  const bloque = `${A}\n<script>\n/* Motor de tumbaos: lo genera analisis_tumbaos/construir.js a partir de analisis_tumbaos/motor/. No editar acá. */\n${seguro(codigo)}\n</script>\n<script type="application/json" id="base-tumbaos">${seguro(json)}</script>\n${Z}`;
  const nuevo = html.slice(0, i0) + bloque + html.slice(i1 + Z.length);
  if (nuevo !== html) { fs.writeFileSync(HTML_F, nuevo); console.log(`index.html actualizado (motor ${(codigo.length / 1024).toFixed(0)} kB + base)`); }
  else console.log('index.html ya estaba al día');
}
