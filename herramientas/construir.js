/* =====================================================================
   Construye la base de MIDIs del motor y la mete en index.html
   uso:
     node herramientas/construir.js                    analiza los MIDI de midis/, escribe base/ y actualiza index.html
     node herramientas/construir.js --sin-html         solo escribe base/base_tumbaos.json (y base/base_local.js)
     node herramientas/construir.js --solo-html        no vuelve a analizar: mete el motor, la base que ya está y las demos en index.html
   Los datos de cada archivo (título, estilo, clave, rol, acordes…) van en el fuentes.json de su carpeta de midis/ (ver midis/README.md).
   ===================================================================== */
const fs = require('fs'), path = require('path');
const RUTAS = require('./rutas');
const TM = require(RUTAS.MOTOR);
const RAIZ = RUTAS.RAIZ, MIDIS = RUTAS.MIDIS, ORIG = RUTAS.ORIGINALES;
const BASE_F = RUTAS.BASE, HTML_F = RUTAS.HTML;
const args = process.argv.slice(2);
const META = RUTAS.leerFuentes(ORIG);
// el sonido de entrada (GeneralUser GS) como script: abierta como archivo, la página no puede leer el .sf2 pero sí
// cargar un script. No va al repositorio (el .sf2 sí: en un servidor se lee directo)
const SF2_F = RUTAS.SF2, SF2_JS = SF2_F + '.js';
if (fs.existsSync(SF2_F) && (!fs.existsSync(SF2_JS) || fs.statSync(SF2_JS).mtimeMs < fs.statSync(SF2_F).mtimeMs)) {
  fs.writeFileSync(SF2_JS, 'window.SF2_GENERALUSER="' + fs.readFileSync(SF2_F).toString('base64') + '";\n');
  console.log('GeneralUser-GS.sf2.js escrito');
}
if (args.includes('--solo-html')) { meterEnHtml(fs.readFileSync(BASE_F, 'utf8')); process.exit(0); }

// ---------- qué MIDIs: la base original (midis/originales/) y las colecciones (cada otra carpeta de midis/, con su propio
// fuentes.json y subcarpetas si hacen falta). Las colecciones entran a la base pero la página las deja apagadas hasta que se
// elijan (salvo las que dicen _encendida). Con subcarpetas, _grupos dice el estilo de cada una y _secciones el tipo de sección
// según cómo empieza el nombre del archivo. Las _local van a base/base_local.js, que no se sube al repositorio: es material comprado.
const archivos = fs.readdirSync(ORIG).filter(RUTAS.sirve).map(f => path.join(ORIG, f)).sort().map(f => ({ f, nombre: path.basename(f), meta: META[path.basename(f)] || {} }));
const colecciones = {}, locales = new Set();
for (const col of RUTAS.colecciones()) {
  const dir = path.join(MIDIS, col), meta = RUTAS.leerFuentes(dir);
  const lista = RUTAS.listarTodo(dir);
  if (!lista.length) continue;
  colecciones[col] = { titulo: meta._titulo || col, ...(meta._encendida ? { encendida: true } : {}) };
  if (meta._local) locales.add(col);
  const secciones = Object.entries(meta._secciones || {}).sort((a, b) => b[0].length - a[0].length);
  for (const f of lista) {
    const nombre = path.relative(dir, f).split(path.sep).join('/'), base = path.basename(f).replace(/\.midi?$/i, '');
    const g = (meta._grupos || {})[nombre.split('/')[0]] || null, s = secciones.find(([p]) => base.startsWith(p));
    const v = /^(.*)_Variation_(\d+)$/.exec(base), parte = v ? `${v[1].replace(/_/g, ' ')} · var. ${+v[2]}` : base.replace(/_/g, ' ');
    // la clave del grupo (o la del archivo) y la parte y la variación según el nombre («A_Section_1_Variation_02»): para elegir el patrón
    const m = { ...(g ? { estilo: g.estilo, grupo: g.grupo, titulo: (g.titulo || '') + ' · ' + parte, ...(g.clave ? { clave: g.clave } : {}), ...(g.excluir ? { excluir: true } : {}) } : {}), ...(s ? { seccion: s[1] } : {}),
      ...(v ? { parte: v[1], var: +v[2] } : {}), ...(meta[nombre] || {}) };
    archivos.push({ f, nombre, meta: m, coleccion: col, ...(meta._frases ? { frase: true } : {}) });
  }
}

// ---------- analizar en dos pasadas: la primera aprende el perfil rítmico del piano por lado de clave (solo con la base original)
const datos = archivos.filter(a => !a.meta.excluir).map(a => ({ ...a, bytes: new Uint8Array(fs.readFileSync(a.f)) }));
const primera = datos.map(d => { try { return TM.analizarFuente(d.bytes, d.meta); } catch (e) { console.error(d.nombre + ': ' + e.message); return null; } });
const perfil = TM.perfilLado(primera.filter((f, i) => f && !datos[i].coleccion && ['clave', 'declarado'].includes(f.analisis.ladoFuente)).flatMap(f => f.piano));
const fuentes = [];
datos.forEach((d, i) => {
  if (!primera[i]) return;
  const f = TM.analizarFuente(d.bytes, d.meta, { perfil, frase: !!d.frase });
  const id = 'b:' + (d.coleccion ? d.coleccion + '/' : '') + d.nombre;
  if (!f.piano.length && !f.bajo.length && !f.perc.length && !f.frase) { console.log(`${id.slice(2).padEnd(34)} sin compases usables de piano, bajo ni percusión: queda afuera`); return; }
  fuentes.push({ id, archivo: d.nombre, titulo: d.meta.titulo || d.nombre.replace(/\.midi?$/i, ''), estilo: d.meta.estilo || 'salsa', autor: d.meta.autor || '', ...(d.coleccion ? { coleccion: d.coleccion } : {}),
    ...(d.meta.grupo ? { grupo: d.meta.grupo } : {}), ...(d.meta.seccion ? { seccion: d.meta.seccion } : {}), ...(d.meta.genero ? { genero: d.meta.genero } : {}),
    ...(d.meta.parte ? { parte: d.meta.parte, var: d.meta.var } : {}), ...f });
  const a = f.analisis;
  console.log(`${(d.coleccion ? d.coleccion + '/' : '') + d.nombre.padEnd(34)} ${String(f.piano.length).padStart(4)} ciclos de piano · ${String(f.bajo.length).padStart(4)} de bajo · ${String(f.perc.length).padStart(3)} juegos de percusión · lado: ${a.ladoFuente}${a.conflicto ? ' (' + a.conflicto + ' compases en contra)' : ''}`);
});
const esLocal = f => locales.has(f.coleccion);
const soloDe = (o, sel) => Object.fromEntries(Object.entries(o).filter(([c]) => sel(c)));
// ---------- la biblioteca de Opus: los montunos de los temas de las colecciones que la página no carga enteras (de mididb,
// mambos y vientos2 solo van los vientos). De los temas de salsa y de música cubana (TM.estilosPiano: ni merengue, ni cumbia, ni
// el mambo de big band), los ciclos de piano que sirven para copiar: en su lado de la clave y con el acorde bien leído; hasta 24
// por tema, de a tramos seguidos (para los ganchos de cuatro compases). Va en la base como una fuente más («b:opus»)
const biblioteca = (() => {
  const P0 = TM.construirModelo(fuentes.filter(f => !f.coleccion)).piano.perfil, bib = { fuentes: [], ciclos: [] };
  for (const f of fuentes) {
    if (!f.coleccion || esLocal(f) || (colecciones[f.coleccion] || {}).encendida || !f.piano.length || !TM.estilosPiano(f).length) continue;
    const buenos = f.piano.map(c => ({ c, L: TM.leerCiclo(c) })).filter(x => x.L).map(x => ({ ...x, q: TM.calidadCiclo(x.L.ev, P0) })).filter(x => x.q.clave > 0 && x.q.acorde >= 0.7 && x.q.q >= 0.3).sort((a, b) => a.c.c - b.c.c);
    if (buenos.length < 2) continue;
    // tramos seguidos, los mejores primero, hasta 24 ciclos
    const tramos = []; for (const x of buenos) { const t = tramos[tramos.length - 1]; if (t && t[t.length - 1].c.c === x.c.c - 2) t.push(x); else tramos.push([x]); }
    tramos.sort((a, b) => b.reduce((s, x) => s + x.q.q, 0) / b.length - a.reduce((s, x) => s + x.q.q, 0) / a.length);
    const elegidos = []; for (const t of tramos) { if (elegidos.length >= 24) break; elegidos.push(...t.slice(0, 24 - elegidos.length)); }
    const vs = f.piano.flatMap(c => c.e.map(e => e[3])), mv = vs.reduce((a, b) => a + b, 0) / vs.length, velVaria = Math.sqrt(vs.reduce((a, v) => a + (v - mv) ** 2, 0) / vs.length) > 4;
    bib.fuentes.push({ id: f.id, titulo: f.titulo, estilo: f.estilo, coleccion: f.coleccion, ...(f.genero ? { genero: f.genero } : {}), ...(velVaria ? { velVaria } : {}) });
    for (const x of elegidos.sort((a, b) => a.c.c - b.c.c)) bib.ciclos.push({ f: f.id, c: x.c.c, a: x.c.a, s: x.c.s, e: x.c.e, ...(x.c.k ? { k: x.c.k } : {}) });
  }
  return bib;
})();
console.log(`biblioteca de Opus: ${biblioteca.ciclos.length} ciclos de piano de ${biblioteca.fuentes.length} temas de las colecciones`);
const libro = { id: 'b:opus', archivo: '', titulo: 'Opus · montunos de las colecciones', estilo: 'salsa', autor: '', analisis: {}, piano: [], bajo: [], perc: [], vientos: [], opus: biblioteca };
const base = { version: 1, generado: new Date().toISOString().slice(0, 10), perfil, colecciones: soloDe(colecciones, c => !locales.has(c)), fuentes: [...fuentes.filter(f => !esLocal(f)), libro] };
const json = JSON.stringify(base);
fs.writeFileSync(BASE_F, json);
console.log(`\nbase: ${base.fuentes.length} fuentes · ${(json.length / 1024).toFixed(0)} kB → ${path.relative(RAIZ, BASE_F)}`);
// las colecciones locales: un script aparte que index.html carga si existe
const LOCAL_F = RUTAS.LOCAL, loc = fuentes.filter(esLocal);
if (loc.length) {
  const js = `/* Base local de timba-o-matic (colecciones compradas): la escribe herramientas/construir.js. No va al repositorio. */\nglobalThis.BASE_TUMBAOS_LOCAL = ${JSON.stringify({ colecciones: soloDe(colecciones, c => locales.has(c)), fuentes: loc })};\n`;
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
  const motorDir = RUTAS.MOTOR;
  const codigo = fs.readdirSync(motorDir).filter(f => /^\d\d_.*\.js$/.test(f)).sort().map(f => fs.readFileSync(path.join(motorDir, f), 'utf8')).join('\n');
  const seguro = s => s.replace(/<\/(script)/gi, '<\\/$1');
  // las demos: las canciones de canciones/ (el formato de «Exportar canción»), en el orden de su campo «orden»
  const DEMOS_D = RUTAS.CANCIONES;
  const demos = fs.existsSync(DEMOS_D) ? fs.readdirSync(DEMOS_D).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(DEMOS_D, f), 'utf8')))
    .filter(j => j.cancion && j.cancion.secciones && j.cancion.orden != null).sort((a, b) => (a.cancion.orden ?? 99) - (b.cancion.orden ?? 99)) : [];
  // la página aprende el piano, el bajo y la percusión de la base original y de las colecciones encendidas; de las demás solo usa
  // los vientos, así que de esas va nada más eso (el resto queda en base_tumbaos.json, para los análisis)
  const B = JSON.parse(json), encendida = c => !c || !!((B.colecciones || {})[c] || {}).encendida;
  const pagina = JSON.stringify({ ...B, fuentes: B.fuentes.map(f => encendida(f.coleccion) ? f : f.vientos && f.vientos.length ? { id: f.id, archivo: f.archivo, titulo: f.titulo, estilo: f.estilo, ...(f.genero ? { genero: f.genero } : {}), coleccion: f.coleccion, vientos: f.vientos } : null).filter(Boolean) });
  // los solos de la Weimar Jazz Database para la trompeta solista (base/base_solos.json, de herramientas/solos_jazz.js), con el
  // encaje de la clave y la referencia de la clave del jurado ya medidos en los vientos de la base (la página no trae el análisis
  // de las colecciones)
  const SOL = RUTAS.leerSolos();
  if (SOL) { SOL.clave = TM.aprenderClave(B.fuentes); const rc = TM.referenciaClave(B.fuentes); SOL.refClave = { clave: rc.clave, cruzadas: rc.cruzadas, temas: rc.temas }; }
  const solosHtml = SOL ? '<script type="application/json" id="base-solos">' + seguro(JSON.stringify(SOL)) + '</script>\n' : '';
  const bloque = `${A}\n<script>\n/* Motor de tumbaos: lo genera herramientas/construir.js a partir de motor/. No editar acá. */\n${seguro(codigo)}\n</script>\n<script type="application/json" id="base-tumbaos">${seguro(pagina)}</script>\n<script type="application/json" id="demos">${seguro(JSON.stringify(demos))}</script>\n${solosHtml}${Z}`;
  const nuevo = html.slice(0, i0) + bloque + html.slice(i1 + Z.length);
  if (nuevo !== html) { fs.writeFileSync(HTML_F, nuevo); console.log(`index.html actualizado (motor ${(codigo.length / 1024).toFixed(0)} kB + base)`); }
  else console.log('index.html ya estaba al día');
}
