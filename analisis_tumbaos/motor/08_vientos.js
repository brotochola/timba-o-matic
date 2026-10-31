/* =====================================================================
   MOTOR DE TUMBAOS · 8. VIENTOS (trompetas, trombones, saxos)
   El modelo: los ciclos de vientos del corpus (02_analisis los guarda por ciclo de clave), en ataques, clasificados por lo
   que son: moña (un riff que se repite clave tras clave), mambo (una línea que cambia), respuesta (corta, deja huecos para
   el cantante) o fondo (notas largas). La sección toca uno de esos, o bloques (golpes con la banda en los anticipos y al
   final), y la armonía y el formato de la orquesta deciden las voces.
   Del corpus (vientos_corpus.js, 60 temas con la clave tocada): 71% de notas cortas; 56% de los ataques en unísono u octavas,
   entre voces octavas, terceras y cuartas; en los cambios de acorde atacan en el 4& (48%) o en el 4 (24%); trompeta
   Si♭3-Si♭5 (mediana Do5), trombón Re3-Do5 (Re4), saxo tenor Mi2-Re5 (Si♭3). De la bibliografía (investigación de timba,
   Moore, Páez): en el cuerpo, solo respuestas en los huecos del cantante; en la timba los coros sin metales y un mambo
   después de cada coro; bloques con el último golpe en el 4& y la sección siguiente en el 1.
   ===================================================================== */
(function (TM) {
  'use strict';
  const pc = m => ((m % 12) + 12) % 12;
  const plegar = d => ((d % 12) + 18) % 12 - 6;
  const elegir = (R, items, peso) => { let tot = 0; const w = items.map(x => { const v = Math.max(0, peso(x)); tot += v; return v; }); if (!tot) return items[Math.floor(R() * items.length)]; let r = R() * tot; for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };

  // ---------- los formatos (de toda la canción): cuántos de cada familia
  const FORMATOS = {
    conjunto: { n: 'Conjunto (3 trompetas)', d: 'Arsenio, la Sonora Ponceña: las trompetas solas, en terceras y unísono', familias: { trompetas: 3 } },
    trombanga: { n: 'Trombanga (2 trombones)', d: 'Willie Colón, Barry Rogers: los trombones al frente, la salsa brava', familias: { trombones: 2 } },
    fania: { n: 'Fania (2 trompetas y trombón)', d: 'la orquesta de salsa de los 70', familias: { trompetas: 2, trombones: 1 } },
    bigband: { n: 'Big band de mambo', d: 'Machito, Puente, Pérez Prado: trompetas, trombones y saxos', familias: { trompetas: 3, trombones: 2, saxos: 2 } },
    salsa90: { n: 'Salsa de los 90 (2 trompetas, trombón y tenor)', d: 'la orquesta de la salsa romántica', familias: { trompetas: 2, trombones: 1, saxos: 1 } },
    timba: { n: 'Timba (2 trompetas, trombón y saxo)', d: 'NG La Banda, Issac Delgado: los «metales de terror»', familias: { trompetas: 2, trombones: 1, saxos: 1 } },
    vanvan: { n: 'Van Van (3 trombones)', d: 'los trombones de Los Van Van desde 1980', familias: { trombones: 3 } }
  };
  const FAMILIAS = ['trompetas', 'trombones', 'saxos'];
  // registro de cada familia (del corpus): el centro de la voz de arriba y los bordes
  const REG = { trompetas: { lo: 58, hi: 84, centro: 73 }, trombones: { lo: 45, hi: 72, centro: 62 }, saxos: { lo: 46, hi: 76, centro: 60 } };
  const TOCA = { nada: 'nada', bloques: 'bloques (golpes con la banda)', respuesta: 'respuestas en los huecos', moña: 'moña (un riff que se repite)', mambo: 'mambo (una línea que cambia)', fondo: 'fondo (notas largas)' };
  const ARMONIA = { fuente: 'como en el tema de la base', unisono: 'unísono y octavas', terceras: 'terceras y sextas', bloque: 'bloque (acordes cerrados)', cuartas: 'cuartas (timba)' };

  // ---------- una nota de un acorde a otro: la misma función (raíz, 3a, 5a, 7a); lo que no le queda, a la nota del acorde más cercana
  function mapearNota(m, S, T, larga) {
    if (!S || !T || S.nombre === T.nombre) return m;
    const iv = pc(m - S.raiz), A = S.fun, B = T.fun;
    let nv = iv;
    if (iv === 0) nv = 0;
    else if (iv === A.t) nv = B.t ?? iv;
    else if (iv === A.f) nv = B.f;
    else if (A.s != null && iv === A.s) nv = B.s ?? (iv === 9 ? 9 : 12);
    const x = m + plegar(T.raiz - S.raiz) + plegar(nv - iv);
    if (!larga || TM.funcion(x, T) !== 'X') return x;
    let best = x; for (let d = 1; d <= 2 && best === x; d++) for (const y of [x - d, x + d]) if (T.pcs.includes(pc(y))) { best = y; break; }
    return best;
  }

  // ---------- el modelo
  function construirVientos(fuentes) {
    const V = { ciclos: [] };
    for (const f of fuentes) {
      const lista = (f.vientos || []).slice().sort((a, b) => a.c - b.c), deEste = [];
      for (const c of lista) {
        const K = TM.acordesCiclo(c); if (!K.ok) continue;
        const porP = {};
        for (const [p, d, m, v, ins] of c.e) (porP[p] = porP[p] || []).push({ m, d, v, ins });
        const ev = Object.entries(porP).map(([p, ns]) => {
          p = +p; ns.sort((a, b) => b.m - a.m);
          const alts = [...new Set(ns.map(n => n.m))], top = alts[0], cur = K.en(p), sig = K.proximo(p);
          const antic = !!sig && cur && sig.nombre !== cur.nombre && TM.funcion(top, sig) !== 'X' && TM.funcion(top, cur) === 'X';
          return { p, d: Math.max(...ns.map(n => n.d)), top, debajo: alts.slice(1).map(m => top - m), v: Math.max(...ns.map(n => n.v)), ch: antic ? sig : cur, antic, ins: [...new Set(ns.map(n => n.ins))] };
        }).sort((a, b) => a.p - b.p);
        if (ev.length < 2) continue;
        const ritmo = Array.from({ length: 32 }, (_, q) => ev.some(e => e.p === q) ? 'x' : '.').join('');
        const durMedia = ev.reduce((a, e) => a + e.d, 0) / ev.length;
        const x = { f: f.id, estilo: f.estilo, c: c.c, campana: !!c.campana, ev, ritmo, n: ev.length, durMedia,
          mitades: [ev.some(e => e.p < 16), ev.some(e => e.p >= 16)], voces: Math.max(...ev.map(e => e.debajo.length + 1)) };
        deEste.push(x); V.ciclos.push(x);
      }
      // moña: el mismo ritmo que el ciclo anterior o el siguiente del mismo tema
      for (let i = 0; i < deEste.length; i++) {
        const x = deEste[i], a = deEste[i - 1], b = deEste[i + 1];
        const repite = (a && a.c === x.c - 2 && a.ritmo === x.ritmo) || (b && b.c === x.c + 2 && b.ritmo === x.ritmo);
        x.tipo = x.durMedia >= 6 ? 'fondo' : (!x.mitades[0] || !x.mitades[1] || x.n <= 3) ? 'respuesta' : repite ? 'moña' : 'mambo';
        x.siguiente = b && b.c === x.c + 2 ? b : null;
      }
    }
    V.porTipo = {}; for (const x of V.ciclos) (V.porTipo[x.tipo] = V.porTipo[x.tipo] || []).push(x);
    return V;
  }

  // ---------- las voces de un ataque: la de arriba y las de abajo según la armonía (en semitonos debajo de la de arriba)
  function apilar(top, ch, modo, n, debajoFuente) {
    if (n <= 1 || modo === 'unisono') return [top];
    if (modo === 'fuente' && debajoFuente && debajoFuente.length) {
      // los intervalos del tema de la base, con cada voz llevada a la nota del acorde (o tensión) más cercana
      return [top, ...debajoFuente.slice(0, n - 1).map(d => { const x = top - d; if (TM.funcion(x, ch) !== 'X' || d === 12) return x; for (const k of [1, -1, 2, -2]) if (TM.funcion(x + k, ch) !== 'X') return x + k; return x; })];
    }
    if (modo === 'cuartas') return Array.from({ length: n }, (_, i) => top - 5 * i);
    const notas = [top];
    // terceras: una voz a una tercera o sexta abajo; bloque: notas del acorde cerradas debajo, dentro de la octava
    const cuantas = modo === 'terceras' ? Math.min(n, 2) : n;
    let x = top;
    while (notas.length < cuantas) {
      let y = null; for (let d = 3; d <= (modo === 'terceras' ? 9 : 5); d++) if (ch.pcs.includes(pc(x - d))) { y = x - d; break; }
      if (y == null) y = x - 3;
      notas.push(y); x = y;
    }
    if (modo === 'terceras' && n > 2) notas.push(top - 12);
    return notas;
  }
  // la línea de arriba a un registro: la octava más cerca del centro de la familia
  const aRegistro = (m, fam) => { const r = REG[fam]; let x = m; while (x > r.hi) x -= 12; while (x < r.lo) x += 12; while (Math.abs(x - 12 - r.centro) < Math.abs(x - r.centro) && x - 12 >= r.lo) x -= 12; while (Math.abs(x + 12 - r.centro) < Math.abs(x - r.centro) && x + 12 <= r.hi) x += 12; return x; };

  // ---------- la sección
  // opc: { nb, lado(b), acordesDe(b), acordeEn(b, pos), anticipa, posAnt, toca, formato, armonia, entrada ('juntos'|'capas'),
  //        largo (compases de la progresión), estilo ('salsa'|'cubano'|'timba'), R, gancho (de otra sección) }
  function soplar(opc, V) {
    const { nb, lado, acordesDe, acordeEn, R } = opc, F = (FORMATOS[opc.formato] || {}).familias || {};
    const fams = FAMILIAS.filter(f => F[f]);
    const out = { trompetas: [], trombones: [], saxos: [] }, info = { toca: opc.toca, fuentes: [] };
    if (!fams.length || !opc.toca || opc.toca === 'nada') return { ...out, info };
    // al final: cada familia en orden, sin pisarse consigo misma (una nota termina donde empieza la siguiente) y dentro de la sección
    const listo = () => {
      for (const fam of fams) {
        const a = out[fam].filter(e => e.p >= 0 && e.p < nb * 16).sort((x, y) => x.p - y.p).filter((e, i, x) => !i || e.p > x[i - 1].p);
        for (let i = 0; i < a.length; i++) a[i].L = Math.max(1, Math.min(a[i].L, (a[i + 1] ? a[i + 1].p : nb * 16 + 4) - a[i].p));
        out[fam] = a;
      }
      return { ...out, info };
    };
    const lider = fams[0];   // la familia que lleva la línea de arriba (trompetas si hay)
    const vel = x => Math.max(40, Math.min(120, Math.round(x)));
    // voces de un ataque repartidas por familia: la de arriba para la primera, las de abajo para las demás
    const poner = (p, L, top, ch, modoPedido, debajo, v, art) => {
      // cada golpe va como en el riff del tema de la base: si ahí era unísono u octavas, así; si era armonizado, con la
      // armonía elegida (corpus: 56% de los ataques en unísono u octavas; investigación de salsa, regla 9). Bloques y cierres: acordes
      const unis = debajo && debajo.every(d => d % 12 === 0);
      const modo = modoPedido === 'bloque-fijo' ? 'bloque' : modoPedido !== 'fuente' && unis ? 'unisono' : modoPedido;
      // en los riffs, no más de 3 notas distintas por golpe; 4 en las notas largas y los cierres (investigación de salsa, regla 10)
      const nTot = Math.min(L >= 6 ? 4 : 3, fams.reduce((a, f) => a + F[f], 0));
      const pila = apilar(aRegistro(top, lider), ch, modo, nTot, debajo);
      fams.forEach((fam, i) => {
        let ps;
        if (modo === 'unisono' || pila.length === 1) ps = [aRegistro(pila[0], fam)];
        else if (i === 0) ps = pila.slice(0, Math.min(F[fam], pila.length));
        else { const resto = pila.slice(Math.min(F[fams[0]], pila.length)); ps = (resto.length ? resto : pila).slice(0, F[fam]).map(m => aRegistro(m, fam)); }
        ps = [...new Set(ps)].sort((a, b) => a - b);
        out[fam].push({ p, L, ps, v: vel(v), art: art || (v >= 100 ? '->' : ''), ch });
      });
    };
    const modo = opc.armonia || 'unisono';
    const anticipaEn = opc.anticipa ? (opc.posAnt || 14) : null;

    if (opc.toca === 'bloques') {
      // golpes con la banda: en cada cambio de acorde, en el 4& (o el 4) con el acorde que viene, ligado al 1; al final de la
      // sección, contratiempos que llevan al golpe del 4& (Moore: los bloques de pickups de la timba)
      for (let b = 0; b < nb; b++) {
        const sig = acordesDe(b + 1)[0], cs = acordesDe(b), fin = b === nb - 1;
        if (fin) for (const q of [6, 10]) poner(b * 16 + q, 1, 76, acordeEn(b, q), 'bloque-fijo', null, 92, '-.');
        if ((sig.nombre !== cs.at(-1).nombre || fin) && anticipaEn != null) poner(b * 16 + anticipaEn, 16 - anticipaEn + 2, 76, sig, 'bloque-fijo', null, 108, '->');
        else if (fin) poner(b * 16 + 14, 2, 76, sig, 'bloque-fijo', null, 108, '->');
      }
      return listo();
    }
    if (opc.toca === 'fondo' || !V || !V.ciclos.length) {
      // notas largas: la 3a y la 7a del acorde (las notas guía), un ataque por acorde
      for (let b = 0; b < nb; b++) for (const [q, ch] of acordesDe(b).map((c, i, a) => [a.length > 1 ? i * 8 : 0, c])) {
        const guia = ch.raiz + (ch.fun.s != null ? ch.fun.s : ch.fun.t ?? 4);
        poner(b * 16 + q, acordesDe(b).length > 1 ? 8 : 16, 60 + pc(guia), ch, modo === 'unisono' ? 'terceras' : modo, null, 72, '');
      }
      return listo();
    }
    // del corpus: ciclos del tipo pedido, prefiriendo el estilo y la campana (coro o mambo) si la sección la tiene
    const cub = e => e === 'cubano' || e === 'timba';
    const pool = (V.porTipo[opc.toca] || []).filter(x => x.n <= 24);
    const peso = x => (opc.estilo ? (cub(opc.estilo) === cub(x.estilo) ? 1 : 0.35) : 1) * (opc.campana == null || opc.campana === x.campana ? 1 : 0.4) * (x.voces >= 2 || modo !== 'fuente' ? 1 : 0.5);
    if (!pool.length) return listo();
    const tocarCiclo = (cy, b0, fam) => {
      // el ciclo cubre dos compases (lado 3 | lado 2): cada mitad va al compás de su lado
      for (let b = Math.max(0, b0); b < Math.min(nb, b0 + 2); b++) {   // b0 puede ser -1: el ciclo empezó antes de la sección
        const L_ = lado(b), mitad = cy.ev.filter(e => (e.p < 16) === (L_ === 'A'));
        for (const e of mitad) {
          const pos = e.p % 16;
          const T = e.antic && opc.anticipa ? (pos >= 12 ? acordesDe(b + 1)[0] : acordeEn(b, pos)) : acordeEn(b, pos);
          const top = mapearNota(e.top, e.ch, T, e.d >= 2 || e.debajo.length > 0);
          const L = Math.max(1, Math.min(e.d, 16 - pos + (e.antic ? 4 : 0)));
          if (fam) { out[fam].push({ p: b * 16 + pos, L, ps: [aRegistro(top, fam)], v: vel(e.v * 0.9), art: e.v >= 110 ? '->' : '', ch: T }); }
          else poner(b * 16 + pos, L, top, T, modo, e.debajo, e.v, '');
        }
      }
    };
    const desfase = lado(0) === 'B' ? 1 : 0;   // el ciclo arranca en el lado 3
    if (opc.toca === 'moña') {
      // un riff de dos claves (4 compases) que se repite; en capas lo arranca el trombón y cada familia entra una vuelta
      // después con su riff, que llena los huecos del primero (investigación de salsa: reglas 4 y 5; Guatacando)
      const dos = cy => [cy, cy.siguiente && cy.siguiente.tipo === 'moña' ? cy.siguiente : cy];
      const r1 = opc.gancho && opc.gancho.riff || dos(elegir(R, pool, peso));
      info.fuentes.push(r1[0].f);
      const orden = opc.entrada === 'capas' && fams.length > 1 ? [...fams.filter(f => f === 'trombones'), ...fams.filter(f => f !== 'trombones')] : [null];
      const ritmo4 = r => r[0].ritmo + r[1].ritmo;
      const largo = Math.max(4, opc.largo || 4);
      orden.forEach((fam, i) => {
        const hueco = r => { let c = 0; const a = ritmo4(r), b = ritmo4(r1); for (let q = 0; q < 64; q++) if (a[q] === 'x' && b[q] === 'x') c++; return 1 / (1 + c); };
        const riff = i === 0 ? r1 : dos(elegir(R, pool.filter(x => x !== r1[0]), x => peso(x) * hueco(dos(x))));
        if (i) info.fuentes.push(riff[0].f);
        for (let b = i * largo - desfase; b < nb; b += 4) { tocarCiclo(riff[0], b, fam); tocarCiclo(riff[1], b + 2, fam); }
      });
      info.gancho = { riff: r1 };
      return listo();
    }
    // mambo y respuestas: los ciclos seguidos de un tema de la base (como la frase real del piano)
    let cy = opc.gancho && opc.gancho.inicio || elegir(R, pool, peso);
    info.fuentes.push(cy.f); info.gancho = { inicio: cy };
    for (let b = -desfase; b < nb; b += 2) {
      tocarCiclo(cy, b, null);
      cy = cy.siguiente && (cy.siguiente.tipo === opc.toca || opc.toca === 'mambo') ? cy.siguiente : elegir(R, pool.filter(x => x.f === cy.f), peso) || cy;
    }
    return listo();
  }

  // un golpe de toda la sección de vientos (cierres y cortes): el acorde en bloque, la de arriba cerca del Mi5
  function golpeVientos(formato, p, L, ch, v) {
    const F = (FORMATOS[formato] || {}).familias || {}, fams = FAMILIAS.filter(f => F[f]), out = { trompetas: [], trombones: [], saxos: [] };
    if (!fams.length) return out;
    let top = 76; for (let d = 0; d < 6; d++) { if (ch.pcs.includes(pc(76 - d))) { top = 76 - d; break; } if (ch.pcs.includes(pc(76 + d))) { top = 76 + d; break; } }
    const pila = apilar(aRegistro(top, fams[0]), ch, 'bloque', Math.min(4, fams.reduce((a, f) => a + F[f], 0)), null);
    fams.forEach((fam, i) => {
      const ps = i === 0 ? pila.slice(0, F[fam]) : (pila.slice(F[fams[0]]).length ? pila.slice(F[fams[0]]) : pila).slice(0, F[fam]).map(m => aRegistro(m, fam));
      out[fam].push({ p, L, ps: [...new Set(ps)].sort((a, b) => a - b), v, art: '->', ch });
    });
    return out;
  }

  Object.assign(TM, { golpeVientos, FORMATOS_VIENTOS: FORMATOS, FAMILIAS_VIENTOS: FAMILIAS, TOCA_VIENTOS: TOCA, ARMONIA_VIENTOS: ARMONIA, mapearNota, construirVientos, soplar });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
