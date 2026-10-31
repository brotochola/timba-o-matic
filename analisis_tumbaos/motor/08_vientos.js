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
  // el techo de cada familia, aun con el registro corrido o la trompeta al agudo (investigación de timba: el clímax, cerca del La5)
  const TECHO = { trompetas: 85, trombones: 74, saxos: 78 };
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
        // la línea es la del instrumento que más toca en el ciclo: un ataque donde ese no está (el trombón solo, mientras la
        // trompeta descansa) va a la octava más cerca de la nota vecina (la anterior; si el ciclo arranca sin ese instrumento,
        // la siguiente). Así la de arriba no salta de un instrumento a otro (diag: más de una quinta en el 6% de los pasos
        // dentro de un instrumento y en el 19% entre instrumentos distintos)
        const cuantos = {}; for (const e of ev) for (const i of e.ins) cuantos[i] = (cuantos[i] || 0) + 1;
        const lider = Object.keys(cuantos).sort((a, b) => cuantos[b] - cuantos[a])[0];
        const cerca = (e, v) => { while (e.top - v.top > 6) e.top -= 12; while (v.top - e.top > 6) e.top += 12; };
        const k0 = ev.findIndex(e => e.ins.includes(lider));
        for (let i = k0 - 1; i >= 0; i--) cerca(ev[i], ev[i + 1]);
        for (let i = k0 + 1; i < ev.length; i++) if (!ev[i].ins.includes(lider)) cerca(ev[i], ev[i - 1]);
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
  const aRegistro = (m, fam, off = 0) => { const r = REG[fam], c = r.centro + off, lo = r.lo + Math.min(0, off), hi = Math.min(TECHO[fam], r.hi + Math.max(0, off)); let x = m; while (x > hi) x -= 12; while (x < lo) x += 12; while (Math.abs(x - 12 - c) < Math.abs(x - c) && x - 12 >= lo) x -= 12; while (Math.abs(x + 12 - c) < Math.abs(x - c) && x + 12 <= hi) x += 12; return x; };

  // la octava fija de una familia respecto de la que lleva la línea (trombones y saxos, una octava abajo de las trompetas)
  const octavaDe = (fam, cabeza) => Math.round((REG[fam].centro - REG[cabeza].centro) / 12) * 12;
  // dentro del instrumento: una nota que se pasa del techo o del piso va una octava adentro (la que lleva la línea tiene el piso
  // más alto: una línea de trompeta debajo del Fa4 deja las voces de abajo fuera del instrumento)
  const dentro = (m, fam, piso = REG[fam].lo) => { let x = m; while (x > TECHO[fam]) x -= 12; while (x < piso) x += 12; return x; };
  const PISO_LINEA = 8;   // semitonos debajo del centro

  // ---------- la sección
  // opc: { nb, lado(b), acordesDe(b), acordeEn(b, pos), anticipa, posAnt, toca, formato, armonia, entrada ('juntos'|'capas'),
  //        forma, largo (compases de la progresión), estilo ('salsa'|'cubano'|'timba'), campana, R, gancho (de otra sección),
  //        k: las perillas de los vientos (v_*) }
  function soplar(opc, V) {
    const { nb, lado, acordesDe, acordeEn, R } = opc, F = (FORMATOS[opc.formato] || {}).familias || {}, k = opc.k || {};
    const fams = FAMILIAS.filter(f => F[f]);
    const out = { trompetas: [], trombones: [], saxos: [] }, info = { toca: opc.toca, fuentes: [] };
    if (!fams.length || !opc.toca || opc.toca === 'nada') return { ...out, info };
    const kv = (id, d) => k[id] == null || k[id] === 'auto' ? d : k[id];
    const dens = +kv('v_dens', 1), regOff = +kv('v_reg', 0), art = +kv('v_art', 1), crom = +kv('v_crom', 0.9), cresc = +kv('v_cresc', 0.5), agudo = +kv('v_agudo', 0), repite = +kv('v_repite', 0.5);
    let forma = kv('v_forma', opc.forma || 'bloque');
    const total = nb * 16, subir = agudo > 0 && R() < agudo;   // la trompeta al agudo en el último tercio
    // al final: cada familia en orden, sin pisarse consigo misma (una nota termina donde empieza la siguiente) y dentro de la sección
    const listo = () => {
      for (const fam of fams) {
        const a = out[fam].filter(e => e.p >= 0 && e.p < total).sort((x, y) => x.p - y.p).filter((e, i, x) => !i || e.p > x[i - 1].p);
        for (let i = 0; i < a.length; i++) a[i].L = Math.max(1, Math.min(a[i].L, (a[i + 1] ? a[i + 1].p : total + 4) - a[i].p));
        out[fam] = a;
      }
      return { ...out, info };
    };
    const vel = (x, p) => Math.max(36, Math.min(122, Math.round(x * (1 - 0.3 * cresc + 0.4 * cresc * (p / total)))));
    // voces de un ataque repartidas por familia (o solo por las de un grupo): la de arriba para la primera, las de abajo para las demás
    const poner = (p, L, top, ch, modoPedido, debajo, v, art_, solo, fijo, vecino) => {
      // cada golpe va como en el riff del tema de la base: si ahí era unísono u octavas, así; si era armonizado, con la
      // armonía elegida (corpus: 56% de los ataques en unísono u octavas; investigación de salsa, regla 9). Bloques y cierres: acordes
      const unis = debajo && debajo.every(d => d % 12 === 0);
      const modo = modoPedido === 'bloque-fijo' ? 'bloque' : modoPedido !== 'fuente' && unis ? 'unisono' : modoPedido;
      // en los golpes de bloque (los anticipos, los cierres, el remate) la nota de arriba es del acorde: la más cercana
      if (modoPedido === 'bloque-fijo' && !ch.pcs.includes(pc(top))) { for (let d = 1; d <= 6; d++) { if (ch.pcs.includes(pc(top - d))) { top -= d; break; } if (ch.pcs.includes(pc(top + d))) { top += d; break; } } }
      const fs_ = solo || fams, cabeza = fs_[0];
      // en los riffs, no más de 3 notas distintas por golpe; 4 en las notas largas y los cierres (investigación de salsa, regla 10)
      const nTot = Math.min(L >= 6 ? 4 : 3, fs_.reduce((a, f) => a + F[f], 0));
      const alto = subir && p >= total * 2 / 3 && cabeza === 'trompetas' ? 12 : 0;
      const arriba = fijo ? dentro(top + alto, cabeza, REG[cabeza].centro - PISO_LINEA) : aRegistro(top, cabeza, regOff + alto);
      let pila = apilar(arriba, ch, modo, nTot, debajo);
      // una nota de paso armonizada en paralelo: el acorde de la nota del acorde a la que va (o de la que sale), corrido lo
      // mismo que la melodía (la aproximación cromática y diatónica de los arregladores): las voces de abajo se mueven con
      // la de arriba en vez de quedarse quietas en una nota del acorde
      if (vecino && modo !== 'unisono' && pila.length > 1) { const v0 = dentro(vecino.top + alto, cabeza, REG[cabeza].centro - PISO_LINEA), pv = apilar(v0, vecino.ch, modo, nTot, debajo); pila = pv.map(m => m + arriba - v0); }
      const Lf = Math.max(1, Math.round(L * art));
      fs_.forEach((fam, i) => {
        let ps;
        // la que dobla una voz de la familia de arriba va a su octava fija; la que toma una voz de abajo del acorde, donde está
        const llevar = dobla => m => fijo ? dentro(m + (dobla ? octavaDe(fam, cabeza) : 0), fam) : aRegistro(m, fam, regOff);
        if (modo === 'unisono' || pila.length === 1) ps = [i === 0 ? pila[0] : llevar(true)(pila[0])];
        else if (i === 0) ps = pila.slice(0, Math.min(F[fam], pila.length));
        else {
          // el papel de cada familia queda fijo en la sección: si la de arriba ya cubre las tres voces de un golpe corto, las
          // demás la doblan una octava abajo (también en las notas largas, para que su línea no salte); si no, toman las de abajo
          const resto = pila.slice(Math.min(F[cabeza], pila.length));
          const dobla = !resto.length || (fijo && F[cabeza] >= Math.min(3, fs_.reduce((a, f) => a + F[f], 0)));
          ps = dobla ? pila.slice(0, F[fam]).map(llevar(true)) : resto.slice(0, F[fam]).map(llevar(false));
        }
        ps = [...new Set(ps)].sort((a, b) => a - b);
        if (fijo) {
          // una voz de abajo que no le da al instrumento se cae (la de arriba queda)
          const bien = ps.filter(m => m >= REG[fam].lo); ps = bien.length ? bien : [dentro(ps.at(-1), fam)];
          // con líneas distintas por familia (contrapunto, capas, champola): la trompeta siempre arriba; la otra baja una octava
          if (fam !== 'trompetas') { const t = out.trompetas.find(x => x.p === p); if (t && Math.max(...ps) > Math.max(...t.ps) && ps.every(m => m - 12 >= REG[fam].lo)) ps = ps.map(m => m - 12); }
          else for (const g of ['trombones', 'saxos']) { const o = out[g].find(x => x.p === p); if (o && Math.max(...o.ps) > Math.max(...ps) && o.ps.every(m => m - 12 >= REG[g].lo)) o.ps = o.ps.map(m => m - 12); }
        }
        out[fam].push({ p, L: Lf, ps, v: vel(v, p), art: art_ || (v >= 100 ? '->' : ''), ch });
      });
    };
    const modo = opc.armonia || 'unisono';
    const anticipaEn = opc.anticipa ? (opc.posAnt || 14) : null;
    // el remate al final de la sección: un golpe con la banda en el anticipo, contratiempos hasta el golpe, o una nota larga
    const rematar = () => {
      const r = kv('v_remate', 'nada'); if (r === 'nada') return;
      const b = nb - 1, sig = acordesDe(nb)[0], pos = anticipaEn ?? 14, desde = r === 'larga' ? 8 : r === 'pickups' ? 6 : pos;
      for (const fam of fams) out[fam] = out[fam].filter(e => e.p < b * 16 + desde);
      if (r === 'larga') { poner(b * 16 + 8, 8, 76, acordeEn(b, 8), 'bloque-fijo', null, 96, '->'); return; }
      if (r === 'pickups') for (const q of [6, 10]) poner(b * 16 + q, 1, 76, acordeEn(b, q), 'bloque-fijo', null, 92, '-.');
      poner(b * 16 + pos, 16 - pos + 2, 76, sig, 'bloque-fijo', null, 110, '->');
    };

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
      rematar();
      return listo();
    }
    // del corpus: ciclos del tipo pedido, prefiriendo la tradición (salsa o cubano), la campana si la sección la tiene y la densidad pedida
    const cub = e => e === 'cubano' || e === 'timba';
    const fuente = kv('v_fuente', 'estilo'), tradicion = fuente === 'estilo' ? opc.estilo : fuente === 'todo' ? null : fuente;
    const pool = (V.porTipo[opc.toca] || []).filter(x => x.n <= 24);
    if (!pool.length) return listo();
    const nMed = pool.map(x => x.n).sort((a, b) => a - b)[pool.length >> 1], meta = nMed * dens;
    const peso = x => (tradicion ? (cub(tradicion) === cub(x.estilo) ? 1 : 0.25) : 1) * (opc.campana == null || opc.campana === x.campana ? 1 : 0.4)
      * (x.voces >= 2 || modo !== 'fuente' ? 1 : 0.5) * (Math.abs(dens - 1) < 0.02 ? 1 : Math.exp(-(((x.n - meta) / (meta * 0.45 + 1)) ** 2)));
    // un ciclo (dos compases: lado 3 | lado 2) en los compases b0 y b0+1, para todas las familias o un grupo
    const SUBE = 6;        // semitonos que sube la línea en el último tercio con el crescendo al máximo
    let enFinal = false;   // en el último tercio de la sección: el mambo sube (vientos_corpus.js: la nota más aguda pasa de Si♭4 a Re5)
    // la octava de la sección: la de la primera frase, cerca del centro de la familia que lleva la línea; las demás, a su octava fija
    const lider = fams[0];
    let octSec = null;
    const ultimo = {};   // la última nota de arriba de cada familia (para que el ciclo siguiente no salte de octava)
    const tocarCiclo = (cy, b0, solo, unisono, soloCompas) => {
      const cab = (solo || fams)[0], centro = REG[cab].centro + regOff + (enFinal ? Math.round(SUBE * cresc) : 0);
      const media = cy.ev.reduce((a, e) => a + e.top, 0) / cy.ev.length;
      if (octSec == null) octSec = Math.round((REG[lider].centro + regOff - media) / 12) * 12;
      let oct = octSec + (cab !== lider ? octavaDe(cab, lider) : 0);
      while (media + oct - centro > 7) oct -= 12;
      while (centro - (media + oct) > 7) oct += 12;
      // un ciclo que sigue a otro de la misma familia: la octava que deja el primer salto más corto, sin salir de la ventana
      const u = ultimo[cab];
      if (u != null) oct = [oct - 12, oct, oct + 12].filter(o => Math.abs(media + o - centro) <= 7).sort((a, b) => Math.abs(cy.ev[0].top + a - u) - Math.abs(cy.ev[0].top + b - u))[0];
      // con otra familia que ya toca en estos compases (el contrapunto, las capas): la trompeta arriba, las demás abajo
      const desde = Math.max(0, b0) * 16, hasta = (b0 + 2) * 16;
      const mediaDe = g => { const a = out[g].filter(x => x.p >= desde && x.p < hasta); return a.length ? a.reduce((s, x) => s + Math.max(...x.ps), 0) / a.length : null; };
      if (cab !== 'trompetas' && F.trompetas) { const mT = mediaDe('trompetas'); if (mT != null) while (media + oct > mT - 4 && media + oct - 12 >= REG[cab].centro - 12) oct -= 12; }
      if (cab === 'trompetas') for (const g of ['trombones', 'saxos']) { const mB = mediaDe(g); if (mB != null) while (media + oct < mB + 4 && media + oct + 12 <= REG.trompetas.centro + 9) oct += 12; }
      // los ataques que suenan, en orden, con el acorde de acá
      const va = [];
      for (let b = Math.max(0, b0); b < Math.min(nb, b0 + 2); b++) {   // b0 puede ser -1: el ciclo empezó antes de la sección
        if (soloCompas != null && b !== soloCompas) continue;
        const L_ = lado(b);
        for (const e of cy.ev.filter(e => (e.p < 16) === (L_ === 'A'))) {
          const pos = e.p % 16;
          // menos densidad: se caen los golpes cortos que no son ni el 1, ni el anticipo, ni un acento
          if (dens < 1 && e.d <= 1 && pos !== 0 && pos !== 14 && e.v < 110 && R() > dens) continue;
          va.push({ e, b, pos, T: e.antic && opc.anticipa ? (pos >= 12 ? acordesDe(b + 1)[0] : acordeEn(b, pos)) : acordeEn(b, pos) });
        }
      }
      // la línea: las notas del acorde del tema (raíz, 3a, 5a, 7a) van a la misma función del acorde nuevo; las de paso, a la
      // misma distancia de la nota del acorde a la que van o de la que salen (si no, el mapeo las aplasta: los pasos por grado
      // bajan del 36% del corpus al 23% y las notas repetidas suben del 20% al 27%; así quedan en 33% y 20%)
      const ancla = e => ['R', '3', '5', '7'].includes(TM.funcion(e.top, e.ch));
      let antS = null, antT = null;   // la nota anterior, en el tema y acá: cada salto queda lo más parecido al del tema
      const octavar = (m, quiere) => { if (antS == null) return m; while (m - antT - quiere > 6) m -= 12; while (quiere - (m - antT) > 6) m += 12; return m; };
      va.forEach(({ e, b, pos, T }, i) => {
        const sig = va[i + 1], ant = va[i - 1], sola = e.debajo.every(d => d % 12 === 0);
        // de paso: corta (hasta una corchea); una nota larga fuera del acorde va a la nota del acorde más cercana
        const paso = !ancla(e) && sola && e.d <= 2 && R() < crom;
        let top, vecino = null;   // vecino: la nota del acorde a la que va o de la que sale (para armonizarla en paralelo)
        if (paso && sig && ancla(sig.e) && Math.abs(sig.e.top - e.top) <= 2) { const ms = octavar(mapearNota(sig.e.top, sig.e.ch, sig.T, false), sig.e.top - antS); top = ms - (sig.e.top - e.top); vecino = { top: ms, ch: sig.T }; }
        else if (paso && ant && ancla(ant.e) && Math.abs(e.top - antS) <= 2) { top = antT + (e.top - antS); vecino = { top: antT, ch: ant.T }; }
        else top = mapearNota(e.top, e.ch, T, e.d >= 2 || !sola || R() > crom);
        // al cambiar de acorde la nota se corre distinto que la anterior: la octava que deja el salto más parecido al del tema
        const antes = top; top = octavar(top, e.top - antS);
        antS = e.top; antT = top; ultimo[cab] = top + oct;
        const L = Math.max(1, Math.min(e.d, 16 - pos + (e.antic ? 4 : 0)));
        poner(b * 16 + pos, L, top + oct, T, unisono ? 'unisono' : modo, unisono ? [] : e.debajo, e.v, '', solo, true, vecino && { top: vecino.top + top - antes + oct, ch: vecino.ch });
      });
    };
    const desfase = lado(0) === 'B' ? 1 : 0;   // el ciclo arranca en el lado 3
    // el material de una frase: ciclos seguidos de un tema; el material siguiente sigue al anterior (o empieza otro del mismo tema)
    const claves = +kv('v_largo', opc.toca === 'respuesta' ? 1 : 2);
    const seguir = (cy, n) => { const m = [cy]; while (m.length < n) { const u = m[m.length - 1]; m.push(u.siguiente && u.siguiente.tipo !== 'fondo' ? u.siguiente : m[m.length % m.length]); } return m; };
    // la altura de un ciclo dentro de la octava (cada ciclo va a la octava que le queda cerca del centro): en el último tercio,
    // con crescendo, el material que queda más arriba
    const altura = x => plegar(Math.round(x.ev.reduce((a, e) => a + e.top, 0) / x.ev.length) - REG[lider].centro - regOff);
    const pesoSube = alto => x => peso(x) * (alto && cresc > 0 ? Math.exp(cresc * (altura(x) - SUBE) / 2.5) : 1);
    const otroDe = (u, n) => seguir(u.siguiente && u.siguiente.tipo !== 'fondo' && !(enFinal && cresc > 0.5) ? u.siguiente : elegir(R, pool.filter(x => x.f === u.f), pesoSube(enFinal)) || elegir(R, pool, pesoSube(enFinal)), n);
    const huecoCon = m => x => { const a = m.map(c => c.ritmo).join(''), b = seguir(x, m.length).map(c => c.ritmo).join(''); let c = 0; for (let q = 0; q < a.length; q++) if (a[q] === 'x' && b[q] === 'x') c++; return 1 / (1 + c); };
    let mat = opc.gancho && opc.gancho.material || seguir(elegir(R, pool, peso), claves);
    info.fuentes.push(mat[0].f); info.gancho = { material: mat };
    // grupos para la pregunta y respuesta y el contrapunto: trompetas (y saxos) contra trombones
    const A = fams.filter(f => f !== 'trombones'), B = fams.filter(f => f === 'trombones');
    if (fams.length < 2 && ['pregunta', 'contrapunto', 'champola', 'escalonado'].includes(forma)) forma = 'bloque';
    if (opc.toca === 'moña' && opc.entrada !== 'juntos' && fams.length > 1 && forma === 'bloque') forma = 'capas';
    const grupoA = A.length ? A : [fams[0]], grupoB = B.length ? B : fams.filter(f => !grupoA.includes(f));
    let mat2 = null, mat3 = null;
    if (['contrapunto', 'champola', 'capas'].includes(forma)) { mat2 = seguir(elegir(R, pool.filter(x => x !== mat[0]), x => peso(x) * huecoCon(mat)(x)), claves); info.fuentes.push(mat2[0].f); }
    if (forma === 'champola' && fams.length > 2) { mat3 = seguir(elegir(R, pool.filter(x => x !== mat[0] && x !== mat2[0]), x => peso(x) * huecoCon(mat)(x) * huecoCon(mat2)(x)), claves); info.fuentes.push(mat3[0].f); }
    const capasOrden = [...fams.filter(f => f === 'trombones'), ...fams.filter(f => f !== 'trombones')];
    info.forma = forma;
    for (let f0 = -desfase, frase = 0; f0 < nb; f0 += 2 * claves, frase++) {
      // ¿la frase repite la anterior o sigue con material nuevo? (la moña casi siempre repite)
      const entra = !enFinal && f0 + claves >= nb * 2 / 3;
      enFinal = f0 + claves >= nb * 2 / 3;
      if (frase > 0 && ((entra && cresc >= 0.5 && opc.toca !== 'moña') || R() >= (opc.toca === 'moña' ? Math.max(repite, 0.85) : repite))) {
        mat = otroDe(mat[mat.length - 1], claves);
        if (mat2) mat2 = otroDe(mat2[mat2.length - 1], claves);
        if (mat3) mat3 = otroDe(mat3[mat3.length - 1], claves);
      }
      mat.forEach((cy, j) => {
        const b0 = f0 + 2 * j, ultima = j === mat.length - 1;
        if (forma === 'bloque') tocarCiclo(cy, b0, null);
        // pregunta y respuesta: una clave cada grupo (las trompetas preguntan, los trombones contestan con lo que sigue; con
        // frases de una clave, la frase siguiente contesta)
        else if (forma === 'pregunta') tocarCiclo(cy, b0, (frase * mat.length + j) % 2 ? grupoB : grupoA);
        else if (forma === 'contrapunto') { tocarCiclo(cy, b0, grupoA); tocarCiclo(mat2[j], b0, grupoB); }
        else if (forma === 'champola') {
          // tres líneas distintas; en la última clave de la frase, todas juntas en unísono (NG La Banda, «En crisis»)
          if (ultima && mat.length > 1) tocarCiclo(cy, b0, null, true);
          else { tocarCiclo(cy, b0, [fams[0]]); tocarCiclo(mat2[j], b0, [fams[1]]); if (fams[2]) tocarCiclo((mat3 || mat2)[j], b0, [fams[2]]); }
        } else if (forma === 'escalonado') {
          // en la primera frase cada familia entra un compás después; después, todas juntas
          if (frase === 0) for (let b = b0; b < b0 + 2; b++) { const entran = fams.filter((f, i) => b >= i); tocarCiclo(cy, b0, entran.length ? entran : [fams[0]], false, b); }
          else tocarCiclo(cy, b0, null);
        } else if (forma === 'capas') {
          // la moña en capas: arranca el trombón y cada familia entra una frase después con su riff, que llena los huecos del primero
          capasOrden.forEach((fam, i) => { if (frase >= i) tocarCiclo(i % 2 ? mat2[j] : cy, b0, [fam]); });
        }
      });
    }
    rematar();
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
