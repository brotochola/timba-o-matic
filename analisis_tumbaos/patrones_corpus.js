/* =====================================================================
   Patrones del corpus: qué toca cada instrumento de percusión y el bajo en cada lado de la clave
   uso: node analisis_tumbaos/patrones_corpus.js [--todos] > informe
   Solo los temas con la clave tocada en la percusión (el lado es seguro); con --todos, también los de lado deducido.
   Los compases se separan por contexto: «con campana» (cencerro, 56: coro o mambo) y «sin campana» (cuerpo).
   Por tambor y lado: los patrones más comunes (fuerza 1-9 por semicorchea), en cuántos temas aparecen y la fuerza media.
   Lee los .mid y .kar de la carpeta del proyecto y de midis/ (con sus colecciones); salta los repetidos «(1)».
   ===================================================================== */
const fs = require('fs'), path = require('path');
const TM = require('./motor');
const RAIZ = path.join(__dirname, '..'), MIDIS = path.join(RAIZ, 'midis');
const todos = process.argv.includes('--todos');
const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'base_tumbaos.json'), 'utf8'));
const listar = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (d === MIDIS ? listar(path.join(d, e.name)) : []) : /\.(midi?|kar)$/i.test(e.name) && !/\(\d+\)\.\w+$/.test(e.name) && !e.name.startsWith('!!') ? [path.join(d, e.name)] : []) : [];
const archivos = [...listar(RAIZ), ...listar(MIDIS)];
const GM = TM.GM_APP;
const pat = {}, bajo = {}, usados = {};
let nTemas = 0;
for (const f of archivos) {
  let det;
  try { det = TM.analizarDetalle(TM.leerMidi(fs.readFileSync(f)), {}); } catch (e) { continue; }
  if (det.ladoFuente === 'sin') { if (!todos) continue; TM.deducirLados(det, base.perfil, true); }
  if (!['clave', 'declarado'].includes(det.ladoFuente) && !(todos && det.ladoFuente === 'deducido')) continue;
  if (!det.bateria.length) continue;
  nTemas++;
  const claveAlt = det.clave ? det.clave.instrumento : null;
  for (const b of det.compases) {
    if (!b.grillaOK) continue;
    const hits = det.bateria.map(h => ({ pos: Math.round(h.u * 2) - 2 * b.x, alt: h.alt === claveAlt ? 75 : h.alt, v: h.v })).filter(h => h.pos >= 0 && h.pos < 16);
    if (hits.length < 6) continue;
    const ctx = hits.some(h => h.alt === 56) ? 'con campana' : 'sin campana';
    const porAlt = {};
    for (const h of hits) { const g = (porAlt[h.alt] = porAlt[h.alt] || Array(16).fill('.')); const d = String(Math.max(1, Math.min(9, Math.round(h.v / 127 * 9)))); if (g[h.pos] === '.' || g[h.pos] < d) g[h.pos] = d; }
    for (const [alt, g] of Object.entries(porAlt)) {
      const k = `${ctx}|${alt}|${b.lado}`, s = g.join('');
      const o = (pat[k] = pat[k] || { n: 0, p: {}, temas: new Set() }); o.n++; o.temas.add(path.basename(f)); o.p[s] = (o.p[s] || 0) + 1;
    }
    // bajo en el mismo compás
    const ba = det.bajoAt.filter(a => a.q16 >= 2 * b.x && a.q16 < 2 * b.x + 16).map(a => a.q16 - 2 * b.x);
    if (ba.length) { const g = Array(16).fill('.'); for (const q of ba) g[q] = 'x'; const k = `${ctx}|${b.lado}`; const o = (bajo[k] = bajo[k] || { n: 0, p: {} }); o.n++; o.p[g.join('')] = (o.p[g.join('')] || 0) + 1; }
  }
}
const NOM = { 36: 'bombo', 37: 'aro', 38: 'caja', 42: 'charles', 44: 'charles pie', 46: 'charles abierto', 49: 'crash', 51: 'ride', 53: 'ride campana', 56: 'cencerro', 60: 'bongó agudo', 61: 'bongó grave', 62: 'conga apagada (slap/manoteo)', 63: 'conga abierta', 64: 'tumba', 65: 'timbal agudo', 66: 'timbal grave', 67: 'agogó agudo (campana bongó)', 68: 'agogó grave', 69: 'cabasa', 70: 'maracas', 73: 'güiro corto', 74: 'güiro largo', 75: 'clave', 76: 'bloque agudo (palito/clave)', 77: 'bloque grave' };
const fmt = s => s.replace(/(.{4})/g, '|$1') + '|';
console.log(`${nTemas} temas con el lado de la clave seguro${todos ? ' (o deducido)' : ''}\n`);
for (const ctx of ['sin campana', 'con campana']) {
  console.log(`=================== ${ctx.toUpperCase()} ===================`);
  const alts = [...new Set(Object.keys(pat).filter(k => k.startsWith(ctx)).map(k => +k.split('|')[1]))].sort((a, b) => a - b);
  for (const alt of alts) {
    const A = pat[`${ctx}|${alt}|A`], B = pat[`${ctx}|${alt}|B`];
    const temas = new Set([...(A ? A.temas : []), ...(B ? B.temas : [])]);
    if (temas.size < 2) continue;
    console.log(`\n${alt} ${NOM[alt] || ''} · en ${temas.size} temas`);
    for (const [L, o] of [['lado 3', A], ['lado 2', B]]) {
      if (!o) continue;
      const top = Object.entries(o.p).sort((a, b) => b[1] - a[1]).slice(0, 4);
      console.log(`  ${L} (${o.n} compases): ` + top.map(([s, c]) => `${fmt(s)} ${Math.round(100 * c / o.n)}%`).join('   '));
    }
  }
  console.log('\nBAJO');
  for (const L of ['A', 'B']) { const o = bajo[`${ctx}|${L}`]; if (!o) continue; const top = Object.entries(o.p).sort((a, b) => b[1] - a[1]).slice(0, 5); console.log(`  ${L === 'A' ? 'lado 3' : 'lado 2'} (${o.n}): ` + top.map(([s, c]) => `${fmt(s)} ${Math.round(100 * c / o.n)}%`).join('   ')); }
  console.log('');
}
