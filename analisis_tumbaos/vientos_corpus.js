/* =====================================================================
   Los vientos del corpus: dónde tocan, qué ritmo, cuánto duran las notas, cómo se armonizan, en qué registro
   uso: node analisis_tumbaos/vientos_corpus.js [--todos] [--json salida.json] > informe
   Lee los MIDI con pistas de trompeta, trombón o saxo (programas General MIDI 56-67, o el nombre de la pista).
   Solo los temas con el lado de la clave seguro (la clave en la percusión); con --todos, también los de lado deducido.
   Cada compás va a su contexto: «con campana» (cencerro: coro o mambo) o «sin campana» (cuerpo).
   ===================================================================== */
const fs = require('fs'), path = require('path');
const TM = require('./motor');
const RAIZ = path.join(__dirname, '..'), MIDIS = path.join(RAIZ, 'midis');
const args = process.argv.slice(2), todos = args.includes('--todos');
const iJ = args.indexOf('--json'), salidaJson = iJ >= 0 ? args[iJ + 1] : null;
const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'base_tumbaos.json'), 'utf8'));
const sirve = f => /\.(midi?|kar)$/i.test(f) && !/\(\d+\)\.\w+$/.test(f) && !f.startsWith('!!');
const listar = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (path.dirname(d) === RAIZ || d === MIDIS ? listar(path.join(d, e.name)) : []) : sirve(e.name) ? [path.join(d, e.name)] : []) : [];
const archivos = [...fs.readdirSync(RAIZ).filter(sirve).map(f => path.join(RAIZ, f)), ...listar(MIDIS)];
// instrumento de viento de un canal: por programa General MIDI o por el nombre de la pista
const INSTR = (prog, nombre) => prog === 56 || prog === 59 ? 'trompeta' : prog === 57 || prog === 58 ? 'trombón' : prog >= 64 && prog <= 67 ? 'saxo' : prog === 61 ? 'metales' :
  /tromp|trump/i.test(nombre) ? 'trompeta' : /trombon|trombón/i.test(nombre) ? 'trombón' : /sax/i.test(nombre) ? 'saxo' : /brass|metal/i.test(nombre) ? 'metales' : null;
const pc = m => ((m % 12) + 12) % 12;

const R = { temas: 0, compases: { 'con campana': 0, 'sin campana': 0 }, activos: { 'con campana': 0, 'sin campana': 0 }, ritmo: {}, celulas: {}, dur: {}, intervalos: {}, unisono: 0, armonizados: 0,
  registro: { trompeta: [], 'trombón': [], saxo: [], metales: [] }, fun: {}, antic: { cambios: 0, en4y: 0, en4: 0, en1: 0, nada: 0 }, frases: {}, arranque: {}, notasPorAtaque: {}, porTema: [], repite: { n: 0, a2: 0, a4: 0, ninguno: 0 } };
const inc = (o, k, v = 1) => { o[k] = (o[k] || 0) + v; };
for (const f of archivos) {
  let s, det;
  try { s = TM.leerMidi(fs.readFileSync(f)); det = TM.analizarDetalle(s, {}); } catch (e) { continue; }
  if (det.ladoFuente === 'sin') { if (!todos) continue; TM.deducirLados(det, base.perfil, true); }
  if (!(['clave', 'declarado'].includes(det.ladoFuente) || (todos && det.ladoFuente === 'deducido'))) continue;
  // las notas de viento, con su instrumento
  const vientos = [];
  for (const p of s.pistas) for (const n of p.notas) {
    if (n.canal === 9) continue;
    const prog = p.programas[n.canal] ?? Object.values(p.programas)[0], ins = INSTR(+prog, p.nombre || '');
    if (ins) vientos.push({ ...n, ins, u: det.U(n.on), uf: det.U(n.off) });
  }
  if (vientos.length < 60) continue;
  R.temas++;
  const C = det.compases, activoDe = [], ritmoDe = [], tema ={ archivo: path.basename(f), activos: 0, compases: 0 };
  C.forEach((b, i) => {
    if (!b.grillaOK) { activoDe.push(null); return; }
    const hits = det.bateria.filter(h => { const q = Math.round(h.u * 2) - 2 * b.x; return q >= 0 && q < 16; });
    const ctx = hits.some(h => h.alt === 56) ? 'con campana' : 'sin campana';
    R.compases[ctx]++; tema.compases++;
    // ataques del compás: notas que empiezan juntas (a la semicorchea), con su duración en semicorcheas
    const ns = vientos.map(n => ({ ...n, q: Math.round(n.u * 2) - 2 * b.x, d: Math.max(1, Math.round((n.uf - n.u) * 2)) })).filter(n => n.q >= 0 && n.q < 16);
    if (!ns.length) { activoDe.push(false); return; }
    R.activos[ctx]++; tema.activos++; activoDe.push(true);
    const porQ = {}; for (const n of ns) (porQ[n.q] = porQ[n.q] || []).push(n);
    const g = Array(16).fill('.'); for (const q in porQ) g[q] = 'x';
    // ¿el riff se repite? el mismo ritmo que 2 compases antes (una clave) o que 4 (dos claves), dentro de una tira de vientos
    ritmoDe[i] = g.join('');
    if (ritmoDe[i - 1] && ritmoDe[i - 2]) { R.repite.n++; if (ritmoDe[i - 2] === ritmoDe[i]) R.repite.a2++; else if (ritmoDe[i - 4] === ritmoDe[i]) R.repite.a4++; else R.repite.ninguno++; }
    inc((R.ritmo[ctx + '|' + b.lado] = R.ritmo[ctx + '|' + b.lado] || {}), 'n'); for (const q in porQ) inc(R.ritmo[ctx + '|' + b.lado], q);
    inc((R.celulas[ctx + '|' + b.lado] = R.celulas[ctx + '|' + b.lado] || {}), g.join(''));
    const ch = b.acordes[0], sig = C[i + 1] && C[i + 1].acordes[0];
    for (const [q, grupo] of Object.entries(porQ)) {
      const d = Math.max(...grupo.map(n => n.d)); inc(R.dur, d >= 8 ? '8+' : d >= 4 ? '4-7' : String(d));
      const alts = [...new Set(grupo.map(n => n.alt))].sort((x, y) => y - x);
      inc(R.notasPorAtaque, Math.min(5, alts.length));
      for (const n of grupo) if (R.registro[n.ins]) R.registro[n.ins].push(n.alt);
      if (alts.length >= 2) {
        if (new Set(alts.map(pc)).size === 1) R.unisono++; else R.armonizados++;
        for (let k = 1; k < alts.length; k++) inc(R.intervalos, Math.min(24, alts[k - 1] - alts[k]));
      } else R.unisono++;
      // función armónica de la nota de arriba (respecto del acorde del compás; en el 4 y el 4&, del que viene si cambia)
      const cur = q >= 8 && b.acordes.length > 1 ? b.acordes[1] : ch, cambia = sig && cur && sig.nombre !== cur.nombre && +q >= 12;
      const ref = cambia && TM.funcion(alts[0], sig) !== 'X' && TM.funcion(alts[0], cur) === 'X' ? sig : cur;
      if (ref) inc(R.fun, (cambia && ref === sig ? 'antic ' : '') + TM.funcion(alts[0], ref));
    }
    // anticipos: si el acorde cambia en el compás que viene, ¿los vientos atacan en el 4&, en el 4, en el 1 que sigue, o nada?
    if (sig && ch && sig.nombre !== (b.acordes.at(-1) || ch).nombre) {
      R.antic.cambios++;
      const sigNs = vientos.filter(n => Math.round(n.u * 2) - 2 * C[i + 1].x === 0);
      if (porQ[14]) R.antic.en4y++; else if (porQ[12]) R.antic.en4++; else if (sigNs.length) R.antic.en1++; else R.antic.nada++;
    }
  });
  // frases: tiras de compases seguidos con vientos, y de qué lado de la clave arrancan
  let largo = 0;
  activoDe.forEach((a, i) => {
    if (a) { if (!largo) inc(R.arranque, C[i].lado === 'A' ? 'lado 3' : 'lado 2'); largo++; }
    else if (largo) { inc(R.frases, largo >= 16 ? '16+' : largo >= 8 ? '8-15' : String(largo)); largo = 0; }
  });
  if (largo) inc(R.frases, largo >= 16 ? '16+' : largo >= 8 ? '8-15' : String(largo));
  R.porTema.push(tema);
}

// ---------- informe
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
const ordenar = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
const tot = o => Object.values(o).reduce((a, b) => a + b, 0);
const fmt = s => s.replace(/(.{4})/g, '|$1') + '|';
const nm = m => m == null ? '-' : ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][pc(m)] + (Math.floor(m / 12) - 1);
const cuantil = (a, q) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(q * (s.length - 1))]; };
console.log(`${R.temas} temas con vientos y el lado de la clave seguro${todos ? ' (o deducido)' : ''}\n`);
console.log('DÓNDE TOCAN');
for (const ctx of ['sin campana', 'con campana']) console.log(`  ${ctx.padEnd(12)} ${pct(R.activos[ctx], R.compases[ctx])} de los compases (${R.activos[ctx]} de ${R.compases[ctx]})`);
console.log(`  frases (compases seguidos con vientos): ${ordenar(R.frases).map(([k, v]) => k + ': ' + v).join(' · ')}`);
console.log(`  la frase arranca en: ${ordenar(R.arranque).map(([k, v]) => k + ' ' + pct(v, tot(R.arranque))).join(' · ')}`);
console.log('\nRITMO (probabilidad de ataque por semicorchea, 0-9, en los compases con vientos)');
for (const ctx of ['sin campana', 'con campana']) for (const L of ['A', 'B']) {
  const o = R.ritmo[ctx + '|' + L]; if (!o) continue;
  const p = Array.from({ length: 16 }, (_, q) => (o[q] || 0) / o.n);
  console.log(`  ${ctx.padEnd(12)} ${L === 'A' ? 'lado 3' : 'lado 2'} ${p.map((x, i) => (i % 4 ? '' : '|') + (x <= 0 ? '.' : Math.min(9, Math.max(1, Math.round(x * 9))))).join('')}|  (${o.n} compases)`);
  const cel = R.celulas[ctx + '|' + L], t = tot(cel);
  console.log(`      células más comunes: ${ordenar(cel).slice(0, 5).map(([s, c]) => fmt(s) + ' ' + pct(c, t)).join('  ')}`);
}
console.log(`  en las tiras de vientos, el ritmo repite el de una clave antes: ${pct(R.repite.a2, R.repite.n)} · el de dos claves antes: ${pct(R.repite.a4, R.repite.n)} · no repite: ${pct(R.repite.ninguno, R.repite.n)}`);
console.log(`\nDURACIÓN DE LAS NOTAS (semicorcheas): ${['1', '2', '3', '4-7', '8+'].map(k => k + ': ' + pct(R.dur[k] || 0, tot(R.dur))).join(' · ')}`);
console.log(`\nARMONÍA: ${pct(R.unisono, R.unisono + R.armonizados)} de los ataques en unísono u octavas; notas distintas por ataque: ${ordenar(R.notasPorAtaque).map(([k, v]) => k + ': ' + pct(v, tot(R.notasPorAtaque))).join(' · ')}`);
const NI = { 0: 'unísono', 1: '2a m', 2: '2a M', 3: '3a m', 4: '3a M', 5: '4a', 6: 'tritono', 7: '5a', 8: '6a m', 9: '6a M', 10: '7a m', 11: '7a M', 12: 'octava' };
console.log(`  intervalos entre voces vecinas: ${ordenar(R.intervalos).slice(0, 12).map(([k, v]) => (NI[k] || k + ' st') + ' ' + pct(v, tot(R.intervalos))).join(' · ')}`);
console.log(`\nFUNCIÓN DE LA NOTA DE ARRIBA: ${ordenar(R.fun).map(([k, v]) => k + ' ' + pct(v, tot(R.fun))).join(' · ')}`);
console.log(`\nANTICIPOS (${R.antic.cambios} cambios de acorde): en el 4& ${pct(R.antic.en4y, R.antic.cambios)} · en el 4 ${pct(R.antic.en4, R.antic.cambios)} · en el 1 ${pct(R.antic.en1, R.antic.cambios)} · callados ${pct(R.antic.nada, R.antic.cambios)}`);
console.log('\nREGISTRO (5% · mediana · 95%)');
for (const [ins, a] of Object.entries(R.registro)) if (a.length) console.log(`  ${ins.padEnd(9)} ${nm(cuantil(a, 0.05))} · ${nm(cuantil(a, 0.5))} · ${nm(cuantil(a, 0.95))}  (${a.length} notas)`);
console.log('\nPOR TEMA (compases con vientos)');
console.log('  ' + R.porTema.sort((a, b) => b.activos / b.compases - a.activos / a.compases).map(t => t.archivo.replace(/\.(mid|kar)$/i, '').slice(0, 26) + ' ' + pct(t.activos, t.compases)).join(' · '));
if (salidaJson) fs.writeFileSync(salidaJson, JSON.stringify(R));
