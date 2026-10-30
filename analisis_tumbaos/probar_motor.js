/* =====================================================================
   Prueba del motor nuevo sin navegador
   uso: node analisis_tumbaos/probar_motor.js [carpeta de salida] [--todo]
   - muestra un tumbao generado compás por compás
   - genera una tanda de variantes, las guarda como MIDI (con su fuentes.json) y las pasa por el informe:
     comparando ese informe con el del corpus se ve si el motor «suena» como la base
   ===================================================================== */
const fs = require('fs'), path = require('path');
const TM = require('./motor');
const args = process.argv.slice(2);
const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'base_tumbaos.json'), 'utf8'));
// como la página: aprende de la base original; con --todo suma las colecciones (el preset «todos los MIDIs»)
const M = TM.construirModelo(base.fuentes.filter(f => args.includes('--todo') || !f.coleccion));
const titulo = id => (base.fuentes.find(f => f.id === id) || {}).titulo || id;
const salida = args.find(a => !a.startsWith('--'));

function ver(res) {
  const nom = TM.nom;
  console.log(`piano a la manera de: ${titulo(res.info.piano)} · bajo: ${res.info.bajo}${res.info.bajoFuente ? ' (' + titulo(res.info.bajoFuente) + ')' : ''} · percusión: ${res.info.percusion}${res.info.percFuente ? ' (' + titulo(res.info.percFuente) + ')' : ''}`);
  for (let b = 0; b < res.compases; b++) {
    const g = new Array(16).fill('.'), gb = new Array(16).fill('.');
    const evs = res.der.filter(e => e.p >= b * 16 && e.p < b * 16 + 16);
    for (const e of evs) g[e.p % 16] = e.ps.length >= 2 && e.ps[e.ps.length - 1] - e.ps[0] === 12 && e.ps.length === 2 ? 'O' : e.ps.length >= 3 && e.ps.includes(e.ps[e.ps.length - 1] - 12) ? 'Ö' : e.ps.length === 1 ? 'x' : e.ps.length === 2 ? 'd' : 'A';
    for (const e of res.bajo.filter(e => e.p >= b * 16 && e.p < b * 16 + 16)) gb[e.p % 16] = 'b';
    const fmt = a => a.map((x, i) => (i % 4 === 0 ? '|' : '') + x).join('');
    console.log(`${String(b + 1).padStart(3)} ${res.lados[b] === 'A' ? 'lado 3' : 'lado 2'} ${res.acordes[b].map(c => c.nombre).join('+').padEnd(10)} ${fmt(g)}| ${fmt(gb)}|  ${evs.map(e => e.ps.map(nom).join('-') + (e.antic ? '*' : '')).join('  ')}`);
  }
}

const progs = [['Em C Am B7', 'rumba 3-2'], ['Dm7 G7 Cmaj7 Cmaj7', 'son 2-3'], ['Am Dm E7 Am', 'son 3-2'], ['C F G7 F', 'son 2-3'], ['Fmaj7 E7 Am7 Gm7+C7', 'rumba 3-2'], ['Gm Cm D7 Gm', 'son 3-2']];
const r0 = TM.generar({ prog: progs[0][0], clave: progs[0][1], marcha: 'marcha', vueltas: 2, semilla: 7 }, M);
ver(r0);

if (salida) {
  fs.mkdirSync(salida, { recursive: true });
  const meta = {};
  let n = 0;
  for (const [prog, clave] of progs) for (let s = 1; s <= 6; s++) {
    const res = TM.generar({ prog, clave, marcha: 'marcha', vueltas: 4, semilla: s * 31 }, M);
    const nombre = `gen_${n++}.mid`;
    fs.writeFileSync(path.join(salida, nombre), TM.aMidi(res, 190));
    // el MIDI empieza en el compás 1 de la progresión: si es 2-3, ese compás es el lado 2
    meta[nombre] = { titulo: prog + ' · ' + clave + ' · ' + s, estilo: 'salsa', clave, acordes: prog };
  }
  fs.writeFileSync(path.join(salida, 'fuentes.json'), JSON.stringify(meta, null, 1));
  fs.writeFileSync(path.join(salida, 'ejemplo.ly'), TM.aLilyPond(r0, { clave: progs[0][1], semilla: 7, bpm: 190 }));
  console.log(`\n${n} MIDI generados en ${salida}`);
}
