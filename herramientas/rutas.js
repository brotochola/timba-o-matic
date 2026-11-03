/* =====================================================================
   Dónde está cada cosa del proyecto. Las herramientas toman las rutas de acá,
   así una carpeta se mueve cambiando una sola línea.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const MIDIS = path.join(RAIZ, 'midis');

const R = {
  RAIZ,
  HTML: path.join(RAIZ, 'index.html'),             // la app: construir.js le mete el motor, la base y las demos
  MOTOR: path.join(RAIZ, 'motor'),                 // el motor (corre igual en Node y en el navegador)
  BASE: path.join(RAIZ, 'base', 'base_tumbaos.json'), // la base de MIDIs analizados (va al repositorio)
  LOCAL: path.join(RAIZ, 'base', 'base_local.js'), // la base de las colecciones compradas (no va al repositorio)
  MIDIS,                                           // una carpeta por colección, cada una con su fuentes.json
  ORIGINALES: path.join(MIDIS, 'originales'),      // la base original: de acá aprende el generador
  CANCIONES: path.join(RAIZ, 'canciones'),         // las demos (el formato de «Exportar canción»)
  SF2: path.join(RAIZ, 'sonidos', 'GeneralUser-GS.sf2'),
  SALIDAS: path.join(RAIZ, 'salidas'),             // lo que escriben las herramientas (no va al repositorio)
};

// los MIDI que sirven (.kar es MIDI con letra): sin los repetidos al bajarlos («… (1).mid») ni lo que exporta la app («!!…»)
R.sirve = f => /\.(midi?|kar)$/i.test(f) && !/\(\d+\)\.\w+$/.test(f) && !f.startsWith('!!');
// los MIDI de una carpeta, con sus subcarpetas
R.listarTodo = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? R.listarTodo(path.join(d, e.name)) : R.sirve(e.name) ? [path.join(d, e.name)] : []).sort() : [];
// las colecciones: cada carpeta de midis/ menos la de los originales
R.colecciones = () => fs.existsSync(MIDIS) ? fs.readdirSync(MIDIS, { withFileTypes: true }).filter(e => e.isDirectory() && e.name !== 'originales').map(e => e.name).sort() : [];
// los datos de cada archivo de una carpeta de midis/ (su fuentes.json)
R.leerFuentes = d => { const f = path.join(d, 'fuentes.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
R.leerBase = () => JSON.parse(fs.readFileSync(R.BASE, 'utf8'));
// un tema por su ruta o por su nombre solo: «1165.mid» se busca en los originales y después en las colecciones
R.midi = nombre => {
  if (fs.existsSync(nombre)) return nombre;
  for (const d of [R.ORIGINALES, ...R.colecciones().map(c => path.join(MIDIS, c))]) { const f = path.join(d, nombre); if (fs.existsSync(f)) return f; }
  return nombre;
};

module.exports = R;
