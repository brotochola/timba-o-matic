/* =====================================================================
   Construye la base de MIDIs del motor nuevo y la mete en index.html
   uso:
     node analisis_tumbaos/construir.js                    analiza los .mid (carpeta del proyecto y midis/), escribe la base y actualiza index.html
     node analisis_tumbaos/construir.js --sin-html         solo escribe analisis_tumbaos/base_tumbaos.json
     node analisis_tumbaos/construir.js --solo-html        no vuelve a analizar: mete el motor y la base que ya está en index.html
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
// el sonido de entrada (GeneralUser GS) como script: abierta como archivo, la página no puede leer el .sf2 pero sí
// cargar un script. No va al repositorio (el .sf2 sí: en un servidor se lee directo)
const SF2_F = path.join(RAIZ, 'GeneralUser-GS.sf2'), SF2_JS = SF2_F + '.js';
if (fs.existsSync(SF2_F) && (!fs.existsSync(SF2_JS) || fs.statSync(SF2_JS).mtimeMs < fs.statSync(SF2_F).mtimeMs)) {
  fs.writeFileSync(SF2_JS, 'window.SF2_GENERALUSER="' + fs.readFileSync(SF2_F).toString('base64') + '";\n');
  console.log('GeneralUser-GS.sf2.js escrito');
}
if (args.includes('--solo-html')) { meterEnHtml(fs.readFileSync(BASE_F, 'utf8')); process.exit(0); }

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
// con su propio fuentes.json). Las colecciones entran a la base pero la página las deja apagadas hasta que se elijan
// (salvo las que dicen _encendida). Una colección puede traer sus .mid de otra carpeta (_carpeta, con subcarpetas: el estilo
// de cada una en _grupos y el tipo de sección según el nombre del archivo en _secciones). Las _local van a base_local.js,
// que no se sube al repositorio: es material comprado.
// los .kar son MIDI con letra; quedan afuera los repetidos al bajarlos («… (1).mid») y lo que exporta la propia app («!!…»)
const sirve = f => /\.(midi?|kar)$/i.test(f) && !/\(\d+\)\.\w+$/.test(f) && !f.startsWith('!!');
const listar = d => fs.existsSync(d) ? fs.readdirSync(d).filter(sirve).map(f => path.join(d, f)).sort() : [];
const listarTodo = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? listarTodo(path.join(d, e.name)) : sirve(e.name) ? [path.join(d, e.name)] : []).sort() : [];
const leerMeta = d => fs.existsSync(path.join(d, 'fuentes.json')) ? JSON.parse(fs.readFileSync(path.join(d, 'fuentes.json'), 'utf8')) : {};
const archivos = [...listar(RAIZ), ...listar(MIDIS)].sort().map(f => ({ f, nombre: path.basename(f), meta: META[path.basename(f)] || {} }));
const colecciones = {}, locales = new Set();
for (const col of fs.existsSync(MIDIS) ? fs.readdirSync(MIDIS, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort() : []) {
  const meta = leerMeta(path.join(MIDIS, col)), dir = path.resolve(MIDIS, col, meta._carpeta || '.');
  const lista = meta._carpeta ? listarTodo(dir) : listar(dir);
  if (!lista.length) continue;
  colecciones[col] = { titulo: meta._titulo || col, ...(meta._encendida ? { encendida: true } : {}) };
  if (meta._local) locales.add(col);
  const secciones = Object.entries(meta._secciones || {}).sort((a, b) => b[0].length - a[0].length);
  for (const f of lista) {
    const nombre = path.relative(dir, f).split(path.sep).join('/'), base = path.basename(f).replace(/\.midi?$/i, '');
    const g = (meta._grupos || {})[nombre.split('/')[0]] || null, s = secciones.find(([p]) => base.startsWith(p));
    const v = /^(.*)_Variation_(\d+)$/.exec(base), parte = v ? `${v[1].replace(/_/g, ' ')} · var. ${+v[2]}` : base.replace(/_/g, ' ');
    const m = { ...(g ? { estilo: g.estilo, grupo: g.grupo, titulo: (g.titulo || '') + ' · ' + parte } : {}), ...(s ? { seccion: s[1] } : {}), ...(meta[nombre] || {}) };
    archivos.push({ f, nombre, meta: m, coleccion: col });
  }
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
  fuentes.push({ id, archivo: d.nombre, titulo: d.meta.titulo || d.nombre.replace(/\.midi?$/i, ''), estilo: d.meta.estilo || 'salsa', autor: d.meta.autor || '', ...(d.coleccion ? { coleccion: d.coleccion } : {}),
    ...(d.meta.grupo ? { grupo: d.meta.grupo } : {}), ...(d.meta.seccion ? { seccion: d.meta.seccion } : {}), ...f });
  const a = f.analisis;
  console.log(`${(d.coleccion ? d.coleccion + '/' : '') + d.nombre.padEnd(34)} ${String(f.piano.length).padStart(4)} ciclos de piano · ${String(f.bajo.length).padStart(4)} de bajo · ${String(f.perc.length).padStart(3)} juegos de percusión · lado: ${a.ladoFuente}${a.conflicto ? ' (' + a.conflicto + ' compases en contra)' : ''}`);
});
const esLocal = f => locales.has(f.coleccion);
const soloDe = (o, sel) => Object.fromEntries(Object.entries(o).filter(([c]) => sel(c)));
const base = { version: 1, generado: new Date().toISOString().slice(0, 10), perfil, colecciones: soloDe(colecciones, c => !locales.has(c)), fuentes: fuentes.filter(f => !esLocal(f)) };
const json = JSON.stringify(base);
fs.writeFileSync(BASE_F, json);
console.log(`\nbase: ${base.fuentes.length} fuentes · ${(json.length / 1024).toFixed(0)} kB → ${path.relative(RAIZ, BASE_F)}`);
// las colecciones locales: un script aparte que index.html carga si existe
const LOCAL_F = path.join(__dirname, 'base_local.js'), loc = fuentes.filter(esLocal);
if (loc.length) {
  const js = `/* Base local de timba-o-matic (colecciones compradas): la escribe analisis_tumbaos/construir.js. No va al repositorio. */\nglobalThis.BASE_TUMBAOS_LOCAL = ${JSON.stringify({ colecciones: soloDe(colecciones, c => locales.has(c)), fuentes: loc })};\n`;
  fs.writeFileSync(LOCAL_F, js);
  console.log(`base local: ${loc.length} fuentes · ${(js.length / 1024).toFixed(0)} kB → ${path.relative(RAIZ, LOCAL_F)}`);
} else if (fs.existsSync(LOCAL_F)) fs.unlinkSync(LOCAL_F);

// ---------- meter el motor y la base en index.html, entre las marcas
if (!args.includes('--sin-html')) meterEnHtml(json);
function meterEnHtml(json) {
  if (!fs.existsSync(HTML_F)) { console.error('No encuentro ' + HTML_F); process.exit(1); }
  const html = fs.readFileSync(HTML_F, 'utf8');
  const A = '<!--motor-tumbaos-->', Z = '<!--/motor-tumbaos-->';
  const i0 = html.indexOf(A), i1 = html.indexOf(Z);
  if (i0 < 0 || i1 < i0) { console.error('index.html no tiene las marcas ' + A + ' … ' + Z); process.exit(1); }
  const motorDir = path.join(__dirname, 'motor');
  const codigo = fs.readdirSync(motorDir).filter(f => /^\d\d_.*\.js$/.test(f)).sort().map(f => fs.readFileSync(path.join(motorDir, f), 'utf8')).join('\n');
  const seguro = s => s.replace(/<\/(script)/gi, '<\\/$1');
  // las demos: las canciones de canciones/ (el formato de «Exportar canción»), en el orden de su campo «orden»
  const DEMOS_D = path.join(RAIZ, 'canciones');
  const demos = fs.existsSync(DEMOS_D) ? fs.readdirSync(DEMOS_D).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(DEMOS_D, f), 'utf8')))
    .filter(j => j.cancion && j.cancion.secciones).sort((a, b) => (a.cancion.orden ?? 99) - (b.cancion.orden ?? 99)) : [];
  // la página aprende el piano, el bajo y la percusión de la base original y de las colecciones encendidas; de las demás solo usa
  // los vientos, así que de esas va nada más eso (el resto queda en base_tumbaos.json, para los análisis)
  const B = JSON.parse(json), encendida = c => !c || !!((B.colecciones || {})[c] || {}).encendida;
  const pagina = JSON.stringify({ ...B, fuentes: B.fuentes.map(f => encendida(f.coleccion) ? f : f.vientos && f.vientos.length ? { id: f.id, archivo: f.archivo, titulo: f.titulo, estilo: f.estilo, coleccion: f.coleccion, vientos: f.vientos } : null).filter(Boolean) });
  const bloque = `${A}\n<script>\n/* Motor de tumbaos: lo genera analisis_tumbaos/construir.js a partir de analisis_tumbaos/motor/. No editar acá. */\n${seguro(codigo)}\n</script>\n<script type="application/json" id="base-tumbaos">${seguro(pagina)}</script>\n<script type="application/json" id="demos">${seguro(JSON.stringify(demos))}</script>\n${Z}`;
  const nuevo = html.slice(0, i0) + bloque + html.slice(i1 + Z.length);
  if (nuevo !== html) { fs.writeFileSync(HTML_F, nuevo); console.log(`index.html actualizado (motor ${(codigo.length / 1024).toFixed(0)} kB + base)`); }
  else console.log('index.html ya estaba al día');
}
