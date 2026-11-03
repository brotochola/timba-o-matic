/* =====================================================================
   Informe de tumbaos: analiza todos los MIDI de una carpeta y junta las estadísticas del piano
   uso: node herramientas/informe.js [carpeta con .mid] [carpeta de salida]
   lee los .mid de la carpeta (de entrada, midis/originales/) con los datos de su fuentes.json y los de los originales
   salida (de entrada, salidas/): informe.txt (números) y corpus_tumbaos.json (las mismas estadísticas en JSON);
   los ciclos reales que usa el generador los arma construir.js en base_tumbaos.json
   ===================================================================== */
const fs = require('fs'), path = require('path');
const TM = require('../motor');
const { nom, pc, GRADO } = TM;
const RUTAS = require('./rutas');

const dir = process.argv[2] || RUTAS.ORIGINALES;
const outDir = process.argv[3] || RUTAS.SALIDAS;
const META = Object.assign(RUTAS.leerFuentes(RUTAS.ORIGINALES), RUTAS.leerFuentes(dir));
// el informe agrupa en salsa y cubano (la timba cuenta como cubana)
const TITULOS = Object.fromEntries(Object.entries(META).filter(([k]) => !k.startsWith('_')).map(([k, m]) => [k, [m.titulo || k, m.estilo === 'salsa' ? 'salsa' : m.estilo === 'cubano' || m.estilo === 'timba' ? 'cubano' : 'otro']]));
function analizarArchivo(ruta) {
  const det = TM.analizarDetalle(TM.leerMidi(fs.readFileSync(ruta)), META[path.basename(ruta)] || {});
  return { archivo: path.basename(ruta), ...det, ladoSeguro: det.ladoFuente === 'clave' || det.ladoFuente === 'declarado' };
}
const listar = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => /\.midi?$/i.test(f)).map(f => path.join(d, f)) : [];
const archivos = listar(dir).sort();
const TODOS = archivos.map(f => { try { return analizarArchivo(f); } catch (e) { console.error(path.basename(f), e.message); return null; } }).filter(Boolean);
// el informe es del piano: los archivos sin canal de piano se listan aparte
const SIN_PIANO = TODOS.filter(r => !r.partes.length).map(r => r.archivo);
const R = TODOS.filter(r => r.partes.length);

const usable = (r, pt, i) => pt.compases[i].tipo === 'montuno' && r.compases[i].grillaOK && r.compases[i].acordes.length > 0;
const vec = c => { const v = new Array(16).fill(0); for (const a of c.as) v[a.pos] = 1; return v; };
const LL = (v, p) => v.reduce((s, h, k) => s + (h ? Math.log(p[k]) : Math.log(1 - p[k])), 0);

// ---------- perfil rítmico por lado de clave (archivos con clave en la percusión) y lado deducido para el resto
function perfil(excluir, sinConflictos) {
  const prof = { A: new Array(16).fill(1), B: new Array(16).fill(1) }, nn = { A: 2, B: 2 };
  for (const r of R) {
    if (!r.ladoSeguro || r === excluir) continue;
    const pt = r.partes[0];
    pt.compases.forEach((c, i) => { if (!usable(r, pt, i) || (sinConflictos && r.compases[i].conflicto)) return; const v = vec(c), l = r.compases[i].lado; for (let k = 0; k < 16; k++) prof[l][k] += v[k]; nn[l]++; });
  }
  return { A: prof.A.map(x => x / nn.A), B: prof.B.map(x => x / nn.B) };
}
function deducirLados(r, pf, aplicar) {
  const segs = []; let seg = [];
  for (const b of r.compases) { if (seg.length && seg[seg.length - 1].fase !== b.fase) { segs.push(seg); seg = []; } seg.push(b); }
  if (seg.length) segs.push(seg);
  const pt = r.partes[0]; let acierto = 0, total = 0, llr = 0, nb = 0;
  for (const sg of segs) {
    let d = 0, n = 0;
    for (const b of sg) { if (!usable(r, pt, b.i)) continue; const v = vec(pt.compases[b.i]); d += b.lado === 'A' ? LL(v, pf.A) - LL(v, pf.B) : LL(v, pf.B) - LL(v, pf.A); n++; }
    if (n) { total += n; if (d >= 0) acierto += n; llr += Math.abs(d); nb += n; }
    if (aplicar && d < 0) for (const b of sg) b.lado = b.lado === 'A' ? 'B' : 'A';
    if (!aplicar && d < 0 && n >= 4) for (const b of sg) b.conflicto = true;   // el piano va en contra de la clave de la percusión
  }
  return { acierto: total ? acierto / total : null, llrPorCompas: nb ? llr / nb : 0, compases: total };
}
const validacion = [];
for (const r of R) if (r.ladoSeguro) { const v = deducirLados(r, perfil(r), false); if (v.compases) validacion.push({ archivo: r.archivo, ...v }); }
const PF = perfil(null, true);
for (const r of R) if (!r.ladoSeguro) r.deduccion = deducirLados(r, PF, true);


// ---------- estadísticas
const z16 = () => new Array(16).fill(0);
const inc = (o, k, v = 1) => { o[k] = (o[k] || 0) + v; };
const POS = ['1', '1e', '1&', '1a', '2', '2e', '2&', '2a', '3', '3e', '3&', '3a', '4', '4e', '4&', '4a'];
function nuevo() {
  return { compases: 0, montuno: 0, nLado: { A: 0, B: 0 }, perfil: { A: z16(), B: z16() }, ciclos: {}, ciclosRitmo: {}, ejemplos: {},
    ataques: 0, semis: 0, corridas: 0, der: {}, izq: {}, interior: {}, texPos: { A: Array.from({ length: 16 }, () => ({})), B: Array.from({ length: 16 }, () => ({})) },
    bloquePos: { A: Array.from({ length: 16 }, () => ({})), B: Array.from({ length: 16 }, () => ({})) },
    grados: { tiempo: {}, contra: {}, semi: {} }, gradoOct: {}, gradoSola: {}, clase: { acorde: 0, tension: 0, cromatica: 0 }, ncts: {},
    intervalos: {}, plegados: {}, nInt: 0, sube: 0, baja: 0, cambiosDir: 0, nDir: 0, salto: {},
    anticipo: { cambios: 0, anticipados: 0, pos: {}, sinReataque: 0, alLado: { A: [0, 0], B: [0, 0] }, mitad: 0, mitadAnt: 0 },
    enlace: {}, llegada: {}, parecido: { 1: [0, 0], 2: [0, 0], 4: [0, 0] }, forma: { 2: [0, 0, 0], 4: [0, 0, 0] }, periodos: {},
    tops: [], vel: { A: z16(), B: z16() }, nvel: { A: z16(), B: z16() }, densidad: { A: [], B: [] }, bajo: { A: z16(), B: z16(), n: { A: 0, B: 0 } }, voces: {}, ambito: [] };
}
const acordeEn = (b, pos) => b.acordes.length > 1 && pos >= 8 ? b.acordes[1] : b.acordes[0];
const fit = (ps, ch) => ch ? ps.filter(p => ch.pcs.includes(pc(p))).length / ps.length : 0;
function acordeDeAtaque(r, i, a) {
  const b = r.compases[i], cur = acordeEn(b, a.pos); let sig = null;
  if (a.pos >= 12 && r.compases[i + 1] && r.compases[i + 1].acordes.length) sig = r.compases[i + 1].acordes[0];
  else if (b.acordes.length > 1 && a.pos >= 4 && a.pos < 8) sig = b.acordes[1];
  if (sig && cur && sig.nombre !== cur.nombre) {
    const fc = fit(a.ps, cur), fn = fit(a.ps, sig), t = pc(a.tex.top);
    if (fn > fc || (fn === fc && sig.pcs.includes(t) && !cur.pcs.includes(t))) return { ch: sig, antic: true };
  }
  return { ch: cur, antic: false };
}
const plegar = d => ((d % 12) + 18) % 12 - 6;                         // intervalo «a la octava»: -6..+5
const claseDe = (top, ch) => { const iv = (pc(top) - ch.raiz + 12) % 12; return ch.pcs.includes(pc(top)) ? 'acorde' : [2, 5, 9].includes(iv) ? 'tension' : 'cromatica'; };
const sigRitmo = c => { const g = new Array(16).fill('.'); for (const a of c.as) { const d = a.tex.der; g[a.pos] = d.startsWith('octava') ? 'o' : d === 'sola' ? 'x' : d.startsWith('díada') ? 'd' : 'a'; } return g.join(''); };
const soloRitmo = s => s.replace(/[oxda]/g, 'x');
const jaccard = (a, b) => { const A = new Set(a.as.map(x => x.pos)), B = new Set(b.as.map(x => x.pos)); let i = 0; for (const x of A) if (B.has(x)) i++; const u = A.size + B.size - i; return u ? i / u : 1; };
const nombreNotas = ps => ps.map(nom).join('-');
function verCiclo(r, pt, i) {
  const out = [];
  for (const k of [0, 1]) {
    const b = r.compases[i + k], c = pt.compases[i + k];
    out.push(`${k ? 'lado 2' : 'lado 3'} [${b.acordes.map(a => a.nombre).join('+')}] ` + c.as.map(a => `${POS[a.pos]}:${nombreNotas(a.ps)}`).join(' '));
  }
  return out;
}

function acumular(S, r, pt, esPrincipal) {
  const C = r.compases;
  S.compases += C.length;
  const runs = []; let run = [];
  for (let i = 0; i < C.length; i++) { if (usable(r, pt, i)) run.push(i); else { if (run.length) runs.push(run); run = []; } }
  if (run.length) runs.push(run);
  for (const rn of runs) {
    let prevTop = null, prevD = 0, linea = [];
    for (const i of rn) {
      const b = C[i], c = pt.compases[i], L = b.lado, porLado = !b.conflicto;
      S.montuno++;
      if (porLado) {
        S.nLado[L]++; const v = vec(c); for (let k = 0; k < 16; k++) S.perfil[L][k] += v[k];
        S.densidad[L].push(c.as.length);
        for (const a of c.as) {
          inc(S.texPos[L][a.pos], a.tex.der.startsWith('octava') ? 'octava' : a.tex.der); S.vel[L][a.pos] += a.vel; S.nvel[L][a.pos]++;
          const npc = new Set(a.ps.map(pc)).size; inc(S.bloquePos[L][a.pos], npc === 1 ? 'linea' : npc === 2 ? 'diada' : 'acorde');
        }
      }
      const ps = c.as.map(a => a.tex.top); if (ps.length) S.ambito.push(Math.max(...ps) - Math.min(...ps));
      let primeroNuevo = null;
      for (const a of c.as) {
        S.ataques++; if (a.pos % 2) { S.semis++; if (c.as.some(x => x.pos === a.pos - 1 || x.pos === a.pos + 1)) S.corridas++; }
        inc(S.der, a.tex.der); inc(S.izq, a.tex.izq); inc(S.voces, a.ps.length);
        if (a.tex.der === 'octava+1') { const t = a.tex.top, inn = a.ps.find(x => x > t - 12 && x < t); inc(S.interior, t - inn); }
        S.tops.push(a.tex.top);
        const { ch } = acordeDeAtaque(r, i, a);
        if (ch) {
          const g = GRADO[(pc(a.tex.top) - ch.raiz + 12) % 12];
          inc(a.pos % 2 ? S.grados.semi : a.pos % 4 === 0 ? S.grados.tiempo : S.grados.contra, g);
          inc(a.tex.der.startsWith('octava') ? S.gradoOct : S.gradoSola, g);
          S.clase[claseDe(a.tex.top, ch)]++;
          linea.push({ top: a.tex.top, clase: claseDe(a.tex.top, ch), ch: ch.nombre });
        }
        if (prevTop != null) {
          // sentido con el intervalo real; un salto de octava justa es cambio de registro, no movimiento
          const d = a.tex.top - prevTop, f = plegar(d), m = d % 12 === 0 ? 0 : d;
          inc(S.intervalos, Math.max(-12, Math.min(12, d))); inc(S.plegados, f); S.nInt++;
          if (m > 0) S.sube++; else if (m < 0) S.baja++;
          if (m && prevD) { S.nDir++; if (Math.sign(m) !== Math.sign(prevD)) S.cambiosDir++; }
          if (Math.abs(prevD) >= 3 && m) inc(S.salto, Math.sign(m) === Math.sign(prevD) ? 'sigue para el mismo lado' : Math.abs(m) <= 2 ? 'vuelve por paso' : 'vuelve con otro salto');
          if (m) prevD = m;
        }
        prevTop = a.tex.top;
      }
      // anticipo en los cambios de acorde de compás a compás
      const nx = C[i + 1];
      if (nx && rn.includes(i + 1) && nx.acordes[0].nombre !== b.acordes[b.acordes.length - 1].nombre) {
        S.anticipo.cambios++; const ld = nx.lado; if (!nx.conflicto) S.anticipo.alLado[ld][1]++;
        const fin = c.as.filter(a => a.pos >= 12), ult = fin[fin.length - 1];
        if (ult && acordeDeAtaque(r, i, ult).antic) {
          S.anticipo.anticipados++; inc(S.anticipo.pos, ult.pos); if (!nx.conflicto) S.anticipo.alLado[ld][0]++;
          if (!pt.compases[i + 1].as.some(a => a.pos === 0)) S.anticipo.sinReataque++;
        }
      }
      if (b.acordes.length > 1) { S.anticipo.mitad++; const m = c.as.filter(a => a.pos >= 4 && a.pos < 8).pop(); if (m && acordeDeAtaque(r, i, m).antic) S.anticipo.mitadAnt++; }
      if (esPrincipal && porLado) { S.bajo.n[L]++; const seen = new Set(); for (const n of r.bajo) { if (n.on < b.x - 0.25 || n.on >= b.x + 7.75) continue; const p16 = Math.round((n.on - b.x) * 2); if (p16 >= 0 && p16 < 16 && !seen.has(p16)) { seen.add(p16); S.bajo[L][p16]++; } } }
    }
    // la línea: notas fuera del acorde y enlace de un acorde al siguiente
    for (let j = 1; j < linea.length; j++) {
      const d1 = plegar(linea[j].top - linea[j - 1].top);
      if (linea[j].ch !== linea[j - 1].ch) {
        inc(S.enlace, d1 === 0 ? 'nota común' : Math.abs(d1) <= 2 ? 'paso (1-2 st)' : Math.abs(d1) <= 4 ? 'tercera' : 'cuarta o más');
      }
      if (j < linea.length - 1 && linea[j].clase !== 'acorde') {
        const d2 = plegar(linea[j + 1].top - linea[j].top);
        const k = Math.abs(d1) <= 2 && Math.abs(d2) <= 2 && d1 && d2 ? (Math.sign(d1) === Math.sign(d2) ? 'de paso' : 'bordadura') : Math.abs(d2) <= 2 && d2 ? 'apoyatura (llega saltando, resuelve por paso)' : d2 === 0 ? 'se repite' : 'escapada (sale saltando)';
        inc(S.ncts, k);
      }
    }
    // parecido entre compases separados por 1, 2 y 4 compases, y si la forma se repite transportada con el acorde
    for (const lag of [1, 2, 4]) for (let j = 0; j + lag < rn.length; j++) {
      if (rn[j + lag] !== rn[j] + lag) continue;
      const a = pt.compases[rn[j]], bb = pt.compases[rn[j + lag]];
      S.parecido[lag][0] += jaccard(a, bb); S.parecido[lag][1]++;
      if (lag >= 2) {
        const ca = C[rn[j]], cb = C[rn[j + lag]];
        for (const x of a.as) {
          const y = bb.as.find(z => z.pos === x.pos); if (!y) continue;
          S.forma[lag][2]++;
          if (y.tex.top === x.tex.top) S.forma[lag][0]++;
          const ra = acordeEn(ca, x.pos), rb = acordeEn(cb, y.pos);
          if (ra && rb && ra.nombre !== rb.nombre && plegar(y.tex.top - rb.raiz) === plegar(x.tex.top - ra.raiz)) S.forma[lag][1]++;
        }
      }
    }
    // ciclos lado 3 | lado 2
    for (let j = 0; j + 1 < rn.length; j++) {
      const a = C[rn[j]], bb = C[rn[j + 1]];
      if (a.lado === 'A' && bb.lado === 'B' && rn[j + 1] === rn[j] + 1 && !a.conflicto) {
        const k = sigRitmo(pt.compases[rn[j]]) + '|' + sigRitmo(pt.compases[rn[j + 1]]);
        inc(S.ciclos, k); inc(S.ciclosRitmo, soloRitmo(k));
        if (!S.ejemplos[k]) S.ejemplos[k] = verCiclo(r, pt, rn[j]);
      }
    }
    if (rn.length >= 8) {
      let per = 'sin repetición clara';
      for (const p of [1, 2, 4, 8]) { let s = 0, n = 0; for (let j = 0; j + p < rn.length; j++) { s += jaccard(pt.compases[rn[j]], pt.compases[rn[j + p]]); n++; } if (n && s / n >= 0.85) { per = p + (p === 1 ? ' compás' : ' compases'); break; } }
      inc(S.periodos, per, rn.length);
    }
  }
}

const porArchivo = {}, global = { salsa: nuevo(), cubano: nuevo(), otro: nuevo(), todo: nuevo() };
for (const r of R) {
  const [titulo, grupo] = TITULOS[r.archivo] || [r.archivo, 'salsa'];
  const S = nuevo();
  r.partes.forEach((pt, pi) => {
    const n = pt.compases.filter((c, i) => usable(r, pt, i)).length;
    if (pi > 0 && n < 8) return;
    acumular(S, r, pt, pi === 0); acumular(global[grupo], r, pt, pi === 0); acumular(global.todo, r, pt, pi === 0);
  });
  porArchivo[r.archivo] = { titulo, grupo, S, r };
}

// ---------- texto
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
const top = (o, n = 8) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
const tot = o => Object.values(o).reduce((a, b) => a + b, 0);
const lineas = [];
const P = (...x) => lineas.push(x.join(''));
function grilla(v, n) { return v.map((x, k) => (k % 4 === 0 ? '|' : '') + String(Math.round(100 * x / (n || 1))).padStart(3)).join('') + '|'; }
function bloque(nombre, S, detalle) {
  P(`\n=== ${nombre}`);
  P(`compases de montuno usados: ${S.montuno} (con lado de clave confiable: lado 3 ${S.nLado.A}, lado 2 ${S.nLado.B}) · ataques: ${S.ataques}`);
  if (!S.montuno) return;
  P(`posición →        1   e   &   a   2   e   &   a   3   e   &   a   4   e   &   a`);
  P(`ataques lado 3  ${grilla(S.perfil.A, S.nLado.A)}`);
  P(`ataques lado 2  ${grilla(S.perfil.B, S.nLado.B)}`);
  const ov = L => S.texPos[L].map(o => { const t = tot(o); return t ? (o.octava || 0) / t : 0; });
  P(`octavas lado 3  ${grilla(ov('A'), 1)}   (% de los ataques de esa posición que son octava)`);
  P(`octavas lado 2  ${grilla(ov('B'), 1)}`);
  const bl = (L, k) => S.bloquePos[L].map(o => { const t = tot(o); return t ? (o[k] || 0) / t : 0; });
  P(`una sola nota 3 ${grilla(bl('A', 'linea'), 1)}   (% de ataques con una sola clase de nota: nota suelta u octava)`);
  P(`una sola nota 2 ${grilla(bl('B', 'linea'), 1)}`);
  P(`bloque 2+ lado 3${grilla(bl('A', 'linea').map(x => x ? 1 - x : 0), 1)}   (% de ataques con 2 o más notas distintas del acorde)`);
  P(`bloque 2+ lado 2${grilla(bl('B', 'linea').map(x => x ? 1 - x : 0), 1)}`);
  const vm = L => { const all = S.vel[L].reduce((a, b) => a + b, 0) / (S.nvel[L].reduce((a, b) => a + b, 0) || 1); return S.vel[L].map((v, k) => S.nvel[L][k] >= 5 ? v / S.nvel[L][k] / all : 0); };
  P(`velocidad lado 3${grilla(vm('A'), 1)}   (100 = velocidad media; muestra los acentos si el MIDI los tiene)`);
  P(`velocidad lado 2${grilla(vm('B'), 1)}`);
  if (S.bajo.n.A + S.bajo.n.B) { P(`bajo lado 3     ${grilla(S.bajo.A, S.bajo.n.A)}`); P(`bajo lado 2     ${grilla(S.bajo.B, S.bajo.n.B)}`); }
  const dm = L => S.densidad[L].length ? (S.densidad[L].reduce((a, b) => a + b, 0) / S.densidad[L].length).toFixed(1) : '-';
  P(`ataques por compás: lado 3 ${dm('A')}, lado 2 ${dm('B')} · semicorcheas: ${pct(S.semis, S.ataques)} de los ataques (en corrida: ${pct(S.corridas, S.ataques)})`);
  P(`mano derecha: ${top(S.der).map(([k, v]) => `${k} ${pct(v, S.ataques)}`).join(' · ')}`);
  if (tot(S.interior)) P(`nota interna de la octava+1, en semitonos debajo de la nota de arriba: ${top(S.interior).map(([k, v]) => `${k}→${pct(v, tot(S.interior))}`).join(' ')}`);
  P(`mano izquierda: ${top(S.izq).map(([k, v]) => `${k} ${pct(v, S.ataques)}`).join(' · ')}`);
  P(`notas por ataque: ${top(S.voces).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${pct(v, S.ataques)}`).join(' ')}`);
  const tp = S.tops.slice().sort((a, b) => a - b), q = f => nom(tp[Math.floor(f * (tp.length - 1))]);
  P(`registro de la voz de arriba: ${q(0.1)}–${q(0.9)} (mediana ${q(0.5)}) · ámbito por compás (mediana): ${S.ambito.sort((a, b) => a - b)[S.ambito.length >> 1]} semitonos`);
  const gt = o => top(o, 7).map(([k, v]) => `${k} ${pct(v, tot(o))}`).join(' · ');
  P(`grado de la nota de arriba · en el tiempo: ${gt(S.grados.tiempo)}`);
  P(`                           · a contratiempo: ${gt(S.grados.contra)}`);
  if (tot(S.grados.semi) >= 20) P(`                           · semicorcheas: ${gt(S.grados.semi)}`);
  P(`                           · en las octavas: ${gt(S.gradoOct)}`);
  P(`                           · en notas sueltas/díadas: ${gt(S.gradoSola)}`);
  const ct = tot(S.clase); P(`nota de arriba: del acorde ${pct(S.clase.acorde, ct)} · tensión (9, 11, 13) ${pct(S.clase.tension, ct)} · cromática/alterada ${pct(S.clase.cromatica, ct)}`);
  if (tot(S.ncts)) P(`notas fuera del acorde: ${top(S.ncts).map(([k, v]) => `${k} ${pct(v, tot(S.ncts))}`).join(' · ')}`);
  const fp = S.plegados, fr = k => fp[k] || 0;
  P(`línea (intervalos a la octava): repite ${pct(fr(0), S.nInt)} · semitono ${pct(fr(1) + fr(-1), S.nInt)} · tono ${pct(fr(2) + fr(-2), S.nInt)} · 3a ${pct(fr(3) + fr(-3) + fr(4) + fr(-4), S.nInt)} · 4a ${pct(fr(5) + fr(-5), S.nInt)} · trítono ${pct(fr(-6), S.nInt)} · sube ${pct(S.sube, S.nInt)} / baja ${pct(S.baja, S.nInt)} · cambia de dirección en ${pct(S.cambiosDir, S.nDir)}`);
  P(`intervalos reales más usados (semitonos, + sube): ${top(S.intervalos, 10).map(([k, v]) => `${k}:${pct(v, S.nInt)}`).join(' ')}`);
  if (tot(S.salto)) P(`después de un salto (3a o más, a la octava): ${top(S.salto).map(([k, v]) => `${k} ${pct(v, tot(S.salto))}`).join(' · ')}`);
  if (tot(S.enlace)) P(`de un acorde al siguiente, la voz de arriba: ${top(S.enlace).map(([k, v]) => `${k} ${pct(v, tot(S.enlace))}`).join(' · ')}`);
  const A = S.anticipo;
  P(`cambios de acorde: ${A.cambios} · el piano anticipa en ${pct(A.anticipados, A.cambios)} (posición: ${top(A.pos).map(([k, v]) => `${POS[k]} ${pct(v, A.anticipados)}`).join(', ')}) · sin volver a atacar el 1: ${pct(A.sinReataque, A.anticipados)}`);
  P(`   anticipa hacia el lado 3: ${pct(A.alLado.A[0], A.alLado.A[1])} de ${A.alLado.A[1]} · hacia el lado 2: ${pct(A.alLado.B[0], A.alLado.B[1])} de ${A.alLado.B[1]}`);
  if (A.mitad) P(`compases con dos acordes: ${A.mitad} · el segundo se anticipa (en el 2&) en ${pct(A.mitadAnt, A.mitad)}`);
  const pr = k => S.parecido[k][1] ? Math.round(100 * S.parecido[k][0] / S.parecido[k][1]) + '%' : '-';
  P(`parecido rítmico entre compases (ataques en común): al siguiente ${pr(1)} · a 2 compases ${pr(2)} · a 4 compases ${pr(4)}`);
  for (const lag of [2, 4]) { const f = S.forma[lag]; if (f[2]) P(`   a ${lag} compases, en la misma posición: misma nota ${pct(f[0], f[2])} · misma forma transportada al acorde nuevo ${pct(f[1], f[2])}`); }
  if (tot(S.periodos)) P(`el ritmo se repite cada (pesado por largo de la sección): ${top(S.periodos).map(([k, v]) => `${k} → ${pct(v, tot(S.periodos))}`).join(' · ')}`);
  if (detalle) {
    P(`ciclos lado 3 | lado 2 más comunes (o = octava, x = nota sola, d = díada, a = acorde; cada carácter = semicorchea):`);
    for (const [k, v] of top(S.ciclos, detalle)) P(`   ${k.slice(0, 16).match(/.{4}/g).join(' ')} | ${k.slice(17).match(/.{4}/g).join(' ')}   ×${v}`);
    P(`los mismos, solo ritmo (x = ataque):`);
    for (const [k, v] of top(S.ciclosRitmo, detalle)) P(`   ${k.slice(0, 16).match(/.{4}/g).join(' ')} | ${k.slice(17).match(/.{4}/g).join(' ')}   ×${v}`);
    const [k1] = top(S.ciclos, 1)[0] || [];
    if (k1) { P(`ejemplo real del ciclo más común:`); for (const l of S.ejemplos[k1]) P(`   ${l}`); }
  }
}

P('INFORME DE TUMBAOS · generado por herramientas/informe.js');
P('Lado 3 = compás con tres golpes de clave; lado 2 = el otro. Las grillas dan el % de compases con ataque en cada semicorchea.');
P('\nValidación: lado de la clave deducido solo con el ritmo del piano, en los archivos con clave en la percusión (perfil armado sin ese archivo):');
for (const v of validacion) P(`   ${v.archivo.padEnd(34)} acierto ${pct(v.acierto, 1)} en ${v.compases} compases (LLR medio ${v.llrPorCompas.toFixed(2)})`);
const conf = R.filter(r => r.compases.some(b => b.conflicto)).map(r => `${r.archivo} (${r.compases.filter(b => b.conflicto).length} compases)`);
P(`Secciones donde el piano va en contra de la clave de la percusión (quedan fuera de las grillas por lado): ${conf.join(', ') || 'ninguna'}`);
if (SIN_PIANO.length) P('Sin canal de piano (quedan afuera): ' + SIN_PIANO.join(', '));
P('Lado deducido en los archivos sin clave en la percusión:');
for (const r of R) if (r.deduccion) P(`   ${r.archivo.padEnd(34)} ${r.deduccion.compases} compases, LLR medio por compás ${r.deduccion.llrPorCompas.toFixed(2)}`);

bloque('TODO EL CORPUS', global.todo, 12);
bloque('SALSA', global.salsa, 8);
bloque('CUBANO Y TIMBA', global.cubano, 8);
if (global.otro.montuno) bloque('OTROS (pop latino, folclore)', global.otro, 4);
for (const f of Object.keys(porArchivo)) {
  const { titulo, grupo, S, r } = porArchivo[f];
  const clave = r.clave ? `clave de ${r.clave.tipo} en la percusión (nota ${r.clave.instrumento})` : 'sin clave en la percusión: lado deducido del piano';
  bloque(`${f} · ${titulo} · ${grupo} · tonalidad ${r.tonalidad.raiz} ${r.tonalidad.modo} · ${clave} · piano: ${r.partes.map(p => 'canal ' + p.canal + ' (programa ' + p.programa + ')').join(', ')}`, S, 3);
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'informe.txt'), lineas.join('\n') + '\n');

const limpio = S => ({ ...S, tops: undefined, ambito: undefined, ejemplos: undefined, densidad: { A: S.densidad.A.length, B: S.densidad.B.length } });
fs.writeFileSync(path.join(outDir, 'corpus_tumbaos.json'), JSON.stringify({
  generado: new Date().toISOString().slice(0, 10),
  perfilLado: PF, validacion,
  archivos: Object.fromEntries(Object.entries(porArchivo).map(([f, x]) => [f, { titulo: x.titulo, grupo: x.grupo, tonalidad: x.r.tonalidad, clave: x.r.clave, deduccion: x.r.deduccion || null, montuno: x.S.montuno }])),
  global: { todo: limpio(global.todo), salsa: limpio(global.salsa), cubano: limpio(global.cubano), otro: limpio(global.otro) }
}));
console.log(lineas.join('\n'));
console.error(`\n${R.length} archivos analizados`);
