/* =====================================================================
   MOTOR DE TUMBAOS · 6. CANCIÓN
   Una canción es una lista de secciones (intro, cuerpo, coro, mambo…), cada una con sus acordes, marcha, perillas,
   pistas que tocan y transición al final. Se genera sección por sección con generar() y su propia semilla
   (editar una sección no vuelve a sortear las otras), pasándole la costura con la anterior: lado de la clave,
   acorde que sigue, última nota de la línea y del bajo, ligadura al 1.
   ===================================================================== */
(function (TM) {
  'use strict';
  const pc = m => ((m % 12) + 12) % 12;
  const PERC = ['clave', 'congas', 'bongo', 'campanas', 'timbales', 'guiro', 'bateria'];
  const VIENTOS = ['trompetas', 'trombones', 'saxos'];
  // la trompeta solista: una pista aparte (motor/10_solo.js); de entrada toca solo en las secciones de tipo «solo»
  const PISTAS = ['piano', 'bajo', ...PERC, ...VIENTOS, 'solo'];
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // estilo de la percusión clásica (la arma la página) para los compases sin juego aprendido
  const ESTILO = { cuerpo: 'verso', marcha: 'marcha', mambo: 'mambo', presion: 'presion', bomba: 'bomba', despelote: 'despelote', muela: 'muela' };
  const PALABRA = { cuerpo: 'cuerpo', marcha: 'marcha', mambo: 'mambo', presion: 'presión', bomba: 'bomba', despelote: 'despelote', muela: 'muela' };
  // la unión entre dos secciones: dónde llega la que viene, en semicorcheas del último compás de la anterior (16: en el 1 que viene)
  const LLEGA = { '4y': 14, '4': 12, '1': 16 };
  // finales con golpes de toda la banda en el último compás, en semicorcheas. Caen en la llegada de lo que sigue (L): el golpe
  // que cae ahí antes del 1 ya trae el acorde que viene y queda ligado; si lo que sigue entra en el 1, el último golpe es del
  // acorde de ahora y la banda cae junta en el 1. Cierre: toda la banda sobre la clave y el golpe de la llegada (en el 4 si lo
  // que sigue entra en el 1). Parada en clave: los golpes de la clave del lado y silencio (John Santos): la banda no anticipa
  // nada, solo si un golpe de la clave cae justo en la llegada. Contratiempos: 1&, 2&, 3& y el golpe de la llegada (Moore: los
  // «pickups» de la timba). Tres contra cuatro: un golpe cada tres semicorcheas que termina en la llegada (la cruz de la
  // timba). Golpe: todos juntos en la llegada. Corte: golpe en el 1 y silencio. Los rellenos de percusión (el abanico: golpe de
  // borde en el 4, redoble y golpe de borde en el 1 de lo que viene, que entra recién en el 2), abajo
  const GOLPES_FIN = {
    cierre: (lado, tipo, L) => { const c = lado === 'B' ? [4, 8] : tipo === 'rumba' ? [0, 6, 14] : [0, 6, 12];
      return [...new Set([...c.filter(q => q < L), L < 16 ? L : lado === 'B' ? 12 : c[c.length - 1]])].sort((a, b) => a - b); },
    parada: (lado, tipo) => lado === 'B' ? [4, 8] : tipo === 'rumba' ? [0, 6, 14] : [0, 6, 12],
    contratiempos: (lado, tipo, L) => [2, 6, 10, Math.min(L, 14)],
    tresxcuatro: (lado, tipo, L) => { const p = []; for (let q = L === 16 ? 13 : L; q >= 0; q -= 3) p.unshift(q); return p; },
    golpe: (lado, tipo, L) => L < 16 ? [L] : []
  };
  // rellenos de percusión en el último compás (con la banda que sigue): qué familia se corre, desde dónde, los golpes y lo que cae en el 1 que viene
  const RELLENOS = {
    abanico: { fam: ['timbales', 'campanas'], desde: 12, golpes: [[12, 'timbalH', 1], [13, 'timbalH', 0.45], [14, 'timbalH', 0.5], [15, 'timbalH', 0.6]], siguiente: [{ p: 0, d: 'timbalH', v: 1, quitar: true }, { p: 0, d: 'plato', v: 0.8 }], toca: 'timbales' },
    redoble: { fam: ['timbales', 'campanas'], desde: 8, golpes: [[8, 'timbalH', 0.5], [9, 'timbalH', 0.42], [10, 'timbalL', 0.58], [11, 'timbalL', 0.5], [12, 'timbalH', 0.68], [13, 'timbalH', 0.6], [14, 'timbalL', 0.85], [15, 'timbalL', 0.8]], siguiente: [{ p: 0, d: 'plato', v: 0.85 }], toca: 'timbales' },
    floreo: { fam: ['congas'], desde: 8, golpes: [[8, 'quintoS', 0.7], [9, 'quintoO', 0.5], [10, 'quintoO', 0.62], [11, 'quintoS', 0.6], [12, 'quintoS', 0.8], [13, 'quintoO', 0.62], [14, 'congaO', 0.9], [15, 'salidor', 0.85]], siguiente: [{ p: 0, d: 'salidor', v: 1 }], toca: 'congas' },
    toms: { fam: ['bateria'], desde: 8, golpes: [[8, 'snare', 0.55], [9, 'snare', 0.45], [10, 'tomH', 0.7], [11, 'tomH', 0.6], [12, 'tomH', 0.75], [13, 'tomL', 0.7], [14, 'tomL', 0.85], [15, 'tomL', 0.8]], siguiente: [{ p: 0, d: 'crash', v: 0.85 }, { p: 0, d: 'kick', v: 1 }], toca: 'bateria' }
  };
  const GOLPE = [['congaS', 0.9], ['timbalH', 0.95], ['kick', 0.9]];
  const CORTE = [['congaS', 0.95], ['timbalH', 1], ['bongoH', 0.8], ['kick', 0.9], ['crash', 0.8]];

  const soloEn = s => s.pistas && s.pistas.solo != null ? s.pistas.solo !== false : s.tipo === 'solo';
  const pistasDe = s => Object.fromEntries(PISTAS.map(x => [x, x === 'solo' ? soloEn(s) : !s.pistas || s.pistas[x] !== false]));
  const suena = (on, d) => on[TM.familiaPerc(d)] !== false;
  // termina todo lo que suena en t (sin ligaduras ni colas hacia afuera)
  function cortar(evs, t, hasta) {
    for (let i = evs.length - 1; i >= 0; i--) {
      const e = evs[i];
      if (e.p >= t) { if (e.p > t || hasta == null) evs.splice(i, 1); else e.L = Math.min(e.L, hasta - t); continue; }
      if (e.p + e.L > t) { e.L = (hasta == null ? t : hasta) - e.p; delete e.liga; delete e.cola; }
    }
  }
  // voicing de un golpe: octava con una nota adentro, la de arriba cerca de la referencia
  function golpePiano(ch, ref) {
    let top = null; for (let m = ref - 6; m <= ref + 6; m++) if ([ch.raiz, (ch.raiz + ch.fun.f) % 12, ch.fun.t != null ? (ch.raiz + ch.fun.t) % 12 : -1].includes(pc(m)) && (top == null || Math.abs(m - ref) < Math.abs(top - ref))) top = m;
    if (top == null) top = ref;
    let inn = null; for (let m = top - 5; m <= top - 3; m++) if (ch.pcs.includes(pc(m))) inn = m;
    let iz = 36 + pc(ch.raiz); if (iz < 41) iz += 12;
    while (iz >= top - 12 && iz - 12 >= 28) iz -= 12;   // la izquierda debajo de la derecha (no la misma nota en las dos manos)
    return { der: inn != null ? [top - 12, inn, top] : [top - 12, top], izq: [iz] };
  }
  const raizCerca = (ch, ref) => { let best = null; for (let m = 28; m <= 50; m++) if (pc(m) === ch.raiz && (best == null || Math.abs(m - ref) < Math.abs(best - ref))) best = m; return best; };

  function generarCancion(cancion, M) {
    const secs = cancion.secciones || [];
    if (!secs.length) throw new Error('La canción no tiene secciones');
    const progs = secs.map(s => Array.isArray(s.prog) ? s.prog : TM.leerProgresion(s.prog || ''));
    const ons = secs.map(pistasDe);
    const res = { der: [], izq: [], bajo: [], vientos: { trompetas: [], trombones: [], saxos: [] }, solo: [], perc: [], extra: [], acordes: [], lados: [], marchas: [], mixes: [], estilos: [], secciones: [] };
    const ganchos = {}, ganchosV = {};
    let temaCancion = null;   // para la trompeta solista: la línea de arriba del último mambo o moña de los vientos
    // los vientos: el formato es de toda la canción (de entrada, el del estilo de la primera sección); qué tocan, de cada sección
    const V = M.vientos || null;
    const formatoV = cancion.vientos && 'formato' in cancion.vientos ? cancion.vientos.formato : ((TM.ESTILOS[secs[0].estilo] || TM.ESTILOS.pupy).vientos || {}).formato || null;
    let previo = null, inicio = 0, pend = [], ligados = null;
    // el loop es un círculo: lo que sigue a su última sección es su primera (cancion.loop = { desde, hasta }, índices de sección)
    const loop = cancion.loop && secs[cancion.loop.desde] && secs[cancion.loop.hasta] && cancion.loop.desde <= cancion.loop.hasta ? cancion.loop : null;
    let costura = null;
    // la unión: la sección de antes y la de después (en el loop, la primera viene de la última); dónde entra cada una
    const antes = i => i > 0 ? i - 1 : loop && i === loop.desde ? loop.hasta : null;
    const despues = i => loop && i === loop.hasta ? loop.desde : i + 1 < secs.length ? i + 1 : null;
    const cambioDe = i => secs[i].cambio || (TM.ESTILOS[secs[i].estilo] || TM.ESTILOS.pupy).cambio || '4y';
    // sin elegir, entra como cambia el acorde la de antes; después de un corte (golpe en el 1 y silencio), en el 1
    const entraDe = i => ['4y', '4', '1'].includes(secs[i].entra) ? secs[i].entra : antes(i) == null || secs[antes(i)].transicion === 'corte' ? '1' : cambioDe(antes(i));
    secs.forEach((s, i) => {
      const prog = progs[i]; if (!prog.length) throw new Error(`La sección ${i + 1} no tiene acordes`);
      // el estilo de la sección (toda la banda) y el del piano, que puede ser otro; sus perillas van debajo de las de la sección
      const E = TM.ESTILOS[s.estilo] || TM.ESTILOS.pupy, EP = TM.ESTILOS[s.pianoComo] || E;
      const on = ons[i], perillas = { ...cancion.perillas, ...EP.piano, ...s.perillas };
      for (const f of PERC) if (!on[f]) perillas['m_' + f] = 0;
      const sig = loop && i === loop.hasta ? progs[loop.desde][0] : progs[i + 1] ? progs[i + 1][0] : null, marcha = TM.MARCHAS[s.marcha] ? s.marcha : 'marcha';
      // la llegada de lo que sigue (en el último compás de esta)
      const llegaSig = despues(i) != null ? entraDe(despues(i)) : '1', L = LLEGA[llegaSig];
      const r = TM.generar({ prog, clave: cancion.clave, marcha, vueltas: s.vueltas || 1, semilla: s.semilla || (i + 1) * 7919, perillas, estiloPreferido: EP.estilo || null, grupo: EP.grupo || null, tipo: s.tipo || null, cambio: s.cambio || E.cambio, cambioFin: llegaSig, estiloBanda: E.banda, bajoEstilo: E.bajo, percusion: s.percusion || null,
        tipoPiano: s.tipoPiano || null, marchaPiano: s.marchaPiano || null, marchaPerc: s.marchaPerc || null, semillas: { piano: s.semillaPiano, bajo: s.semillaBajo, perc: s.semillaPerc },
        contexto: { inicio, siguiente: sig, previo, gancho: s.ganchoDe != null ? ganchos[s.ganchoDe] : null } }, M);
      ganchos[s.id != null ? s.id : i] = r.gancho;
      // ---------- vientos de la sección: lo que pide la sección, o lo del tipo (intro, final, moña, bloque), o lo de la marcha en su estilo
      const EVi = E.vientos || {}, sv = s.vientos || {}, cambioS = s.cambio || E.cambio;
      // con la trompeta solista, los demás vientos: lo que diga la perilla «Detrás del solo» (de entrada, según el modo: en el son
      // callan, en los demás una moña que entra en la segunda mitad); en una sección de tipo solo sin trompeta, lo de la marcha
      const modoS = on.solo ? (TM.MODOS_SOLO && TM.MODOS_SOLO[perillas.s_modo] ? perillas.s_modo : (TM.MODO_SOLO_DE_ESTILO || {})[s.estilo] || 'descarga') : null;
      const detras = on.solo && !sv.toca ? (perillas.s_detras && perillas.s_detras !== 'auto' ? perillas.s_detras : modoS === 'son' ? 'nada' : 'moña') : null;
      const tocaV = sv.toca || (detras ? (detras === 'moña' ? 'moña' : detras) : null) || { intro: EVi.intro, final: 'bloques', mona: 'moña', bloque: 'bloques' }[s.tipo] || (EVi.toca || {})[marcha] || 'nada';
      const vientos = { trompetas: [], trombones: [], saxos: [] };
      let infoV = { toca: 'nada' };
      if (formatoV) {
        const acDe = b => b < r.compases ? r.acordes[b] : sig || [r.acordes[r.compases - 1].at(-1)];
        const vs = TM.soplar({ nb: r.compases, lado: b => r.lados[((b % r.compases) + r.compases) % r.compases], acordesDe: acDe, acordeEn: (b, p) => { const c = acDe(b); return c.length > 1 && p >= 8 ? c[1] : c[0]; },
          anticipa: cambioS !== '1', posAnt: cambioS === '4' ? 12 : 14, anticipaFin: llegaSig !== '1', posAntFin: L, toca: tocaV, formato: formatoV, armonia: sv.armonia || EVi.armonia || 'unisono', entrada: sv.entrada || 'capas',
          largo: prog.length, estilo: EP.estilo, campana: ['marcha', 'mambo'].includes(marcha), R: rng((s.semillaVientos || (s.semilla || (i + 1) * 7919) * 31 + 5) >>> 0),
          gancho: s.ganchoDe != null ? ganchosV[s.ganchoDe] : null, forma: EVi.forma, k: perillas }, V);
        for (const f of VIENTOS) if (on[f]) vientos[f] = vs[f];
        // detrás del solo: la moña entra en la segunda mitad (en el comienzo de una clave) y todo va más suave que la trompeta
        if (detras && detras !== 'nada') { const mitad = Math.floor(r.compases / 4) * 32; for (const f of VIENTOS) vientos[f] = vientos[f].filter(e => detras !== 'moña' || e.p >= mitad).map(e => ({ ...e, v: Math.round((e.v || 90) * 0.78) })); }
        ganchosV[s.id != null ? s.id : i] = vs.info.gancho; infoV = vs.info;
        if ((tocaV === 'mambo' || tocaV === 'moña') && !detras && TM.temaDeLinea) {
          const fam = ['trompetas', 'saxos', 'trombones'].find(f => on[f] && vientos[f].length >= 4);
          const acEn = p => { const b = Math.floor(p / 16), q = p % 16; return q >= 14 && b + 1 < r.compases ? r.acordes[b + 1][0] : (r.acordes[b] || [])[r.acordes[b] && r.acordes[b].length > 1 && q >= 8 ? 1 : 0]; };
          const tm = fam && TM.temaDeLinea(vientos[fam], acEn, TM.tonicaDe(r.acordes.flat()));
          if (tm && (!temaCancion || tm.canta >= temaCancion.canta)) temaCancion = { ...tm, seccion: s.nombre || s.tipo || '' };
        }
      }
      // ---------- la trompeta solista (motor/10_solo.js): su semilla, los acordes con el anticipo de la sección y la clave
      let solo = [], infoS = null;
      if (on.solo && M.solos && TM.solear) {
        const acDe = b => b < r.compases ? r.acordes[b] : sig || [r.acordes[r.compases - 1].at(-1)];
        const so = TM.solear({ nb: r.compases, lado: b => r.lados[((b % r.compases) + r.compases) % r.compases], acordesDe: acDe, acordeEn: (b, p) => { const c = acDe(b); return c.length > 1 && p >= 8 ? c[1] : c[0]; },
          anticipa: cambioS !== '1', posAnt: cambioS === '4' ? 12 : 14, clave: /rumba/.test(cancion.clave || '') ? 'rumba' : 'son', estilo: s.estilo, final: (s.transicion || 'ninguna') !== 'ninguna' || !(despues(i) != null && ons[despues(i)].solo),
          R: rng((s.semillaSolo || (s.semilla || (i + 1) * 7919) * 53 + 11) >>> 0), k: perillas, temaCancion }, M.solos);
        solo = so.notas; infoS = so.info;
      }
      const nb = r.compases, S = (nb - 1) * 16, fin = { ...r.fin, entraSolo: false };
      if (!on.piano) { r.der.length = 0; r.izq.length = 0; }
      if (!on.bajo) r.bajo.length = 0;
      const perc = r.perc || new Array(nb).fill(null), extra = Array.from({ length: nb }, () => []);
      // lo que dejó la sección anterior en el 1 de esta (platillo del relleno, golpe del abanico) y el plato del timbalero al
      // entrar: en el 1, o con la entrada (en el 4& o el 4 del último compás de la anterior, junto con el anticipo)
      // (la primera sección de un loop que entra anticipada: el plato lo pone la costura del loop, al volver)
      const Le = LLEGA[entraDe(i)], platoEn = s.plato === '1' || (s.plato === 'entra' && Le === 16) ? 0 : s.plato === 'entra' && i > 0 ? Le : null;
      if (platoEn === 0) pend.push({ p: 0, d: 'plato', v: 0.85 });
      if (platoEn > 0) {
        pend = pend.filter(g => g.d !== 'plato');
        const ult = res.perc.length - 1, dst = res.perc[ult] || res.extra[ult];
        if (suena(ons[i - 1], 'plato') && suena(on, 'plato') && !dst.some(e => e.p === platoEn && e.d === 'plato')) dst.push({ p: platoEn, d: 'plato', v: 0.9 });
      }
      for (const g of pend) {
        if (g.quitar && perc[0]) perc[0] = perc[0].filter(e => e.p >= 4 || !['timbales', 'campanas'].includes(TM.familiaPerc(e.d)));
        const dst = perc[0] || extra[0];
        if (suena(on, g.d) && (r.mix[TM.familiaPerc(g.d)] ?? 1) > 0 && !dst.some(e => e.p === g.p && e.d === g.d)) dst.push({ p: g.p, d: g.d, v: g.v });
      }
      pend = r.fin.desborde.map(e => ({ ...e }));
      // costura: lo que la sección anterior dejó ligado (piano) o sonando (bajo) llega hasta el primer ataque de esta
      if (ligados) {
        const d0 = r.der.length ? r.der[0].p + inicio * 16 : null, b0 = r.bajo.length ? r.bajo[0].p + inicio * 16 : null;
        for (const e of ligados.der) if (d0 != null) e.L = d0 - e.p;
        for (const e of ligados.bajo) if (b0 != null) e.L = Math.min(e.cola, b0 - e.p);
      }
      // ---------- la sección entra en el 4& o en el 4 del compás de antes: todo lo de esta sección arranca ahí. El bajo (aunque
      // sea un pedal) y el piano entran en la llegada y siguen sonando, sin volver a atacar el 1; la percusión toca lo de esta
      // sección desde ahí; lo de la sección de antes que no sigue se calla ahí. Si la de antes termina con golpes o con un
      // relleno, esos mandan en su último compás (el golpe de la llegada ya es la entrada)
      if (i > 0 && Le < 16) {
        const t0 = inicio * 16, tL = t0 - 16 + Le, sa = secs[i - 1], libre = (sa.transicion || 'ninguna') === 'ninguna' && !RELLENOS[sa.relleno];
        const callar = (evs, desde, salvo = []) => { for (let k = evs.length - 1; k >= 0; k--) { const e = evs[k]; if (salvo.includes(e)) continue;
          if (e.p >= desde && e.p < t0) evs.splice(k, 1); else if (e.p < desde && e.p + e.L > desde) { e.L = desde - e.p; delete e.liga; delete e.cola; } } };
        // el bajo: su primera nota, si cae en el 1, arranca en la llegada (fundida con la que dejó ahí la sección de antes)
        const b1 = r.bajo.find(e => e.p === 0), enL = res.bajo.find(e => e.p === tL);
        if (!on.bajo) callar(res.bajo, tL);
        else if (b1) {
          callar(res.bajo, tL, enL ? [enL] : []);
          if (enL) { Object.assign(enL, { ps: b1.ps, L: t0 - tL + b1.L, ch: b1.ch }); delete enL.cola; r.bajo.splice(r.bajo.indexOf(b1), 1); }
          else { b1.p = tL - t0; b1.L += t0 - tL; }
        }
        // el piano: el acorde de esta sección entra en la llegada, ligado al 1 (con la entrada en el 4, también el piano en el 4)
        if (!on.piano) { callar(res.der, tL); callar(res.izq, tL); }
        else {
          const ant = res.der.filter(e => e.p >= tL && e.p < t0 && e.antic && e.liga);   // el anticipo del generador (en el 4&)
          if (ant.length) {
            const pA = ant[0].p, mueven = [...ant, ...res.izq.filter(e => e.p === pA)];
            callar(res.der, tL, mueven); callar(res.izq, tL, mueven);
            for (const e of mueven) { e.L += pA - tL; e.p = tL; }
          } else {
            // sin cambio de acorde no hay anticipo: el primer ataque de esta sección (o un golpe con su acorde) pasa a la llegada
            const d1 = r.der.filter(e => e.p === 0), i1 = r.izq.filter(e => e.p === 0), ref = res.der.filter(e => e.p < tL).pop();
            callar(res.der, tL); callar(res.izq, tL);
            if (d1.length) for (const e of [...d1, ...i1]) { e.p = tL - t0; e.L += t0 - tL; }
            else { const ch = r.acordes[0][0], g = golpePiano(ch, ref ? ref.ps[ref.ps.length - 1] : 74);
              r.der.push({ p: tL - t0, L: t0 - tL, ps: g.der, v: 100, art: '->', antic: true, ch }); r.izq.push({ p: tL - t0, L: t0 - tL, ps: g.izq, v: 92, ch }); }
          }
        }
        // la percusión: desde la llegada, lo de esta sección (su compás del mismo lado de la clave); el plato de la entrada queda
        if (libre) {
          const u = inicio - 1, q = nb >= 2 ? 1 : 0, queda = e => e.p < Le || e.d === 'plato' || e.d === 'crash';
          res.perc[u] = (res.perc[u] || []).filter(queda); res.extra[u] = (res.extra[u] || []).filter(queda);
          for (const e of (perc[q] || []).concat(extra[q] || [])) if (e.p >= Le && e.d !== 'plato' && e.d !== 'crash') res.perc[u].push({ ...e });
          // las familias de esta sección suenan en ese compás con su volumen de acá
          res.mixes[u] = { ...res.mixes[u] }; for (const f of PERC) if (on[f]) res.mixes[u][f] = r.mix[f] ?? 1;
        }
        // los vientos de la de antes que no siguen en esta, callados desde la llegada (con golpes al final, el de la llegada queda)
        if (libre) for (const f of VIENTOS) if (!vientos[f].length) callar(res.vientos[f], tL);
        if (!solo.length) callar(res.solo, tL);
      }
      // ---------- transición al final de la sección
      const lado = r.lados[nb - 1], chs = r.acordes[nb - 1], chEn = q => chs.length > 1 && q >= 8 ? chs[1] : chs[0];
      const refTop = (() => { const e = r.der.filter(x => x.p < S).pop(); return e ? e.ps[e.ps.length - 1] : (M.piano.registro || {}).p50 || 74; })();
      const refBajo = (() => { const e = r.bajo.filter(x => x.p < S).pop(); return e ? e.ps[0] : 38; })();
      const tr = s.transicion || 'ninguna';
      if (tr === 'corte') {
        cortar(r.der, S, S + 4); cortar(r.izq, S, S + 4); cortar(r.bajo, S, S + 4);
        const tapa = evs => evs.some(e => e.p <= S && e.p + e.L > S);
        if (on.piano && tapa(r.der)) {
          // el anticipo ligado es el golpe del final: se completa con el acorde (octava con la nota de adentro y la izquierda)
          const g = golpePiano(chs[0], refTop);
          for (const e of r.der) if (e.p <= S && e.p + e.L > S) { e.ps = g.der; e.v = Math.max(e.v || 90, 100); e.art = '->'; r.izq = r.izq.filter(x => x.p !== e.p); r.izq.push({ p: e.p, L: e.L, ps: g.izq, v: 94, art: '->', ch: chs[0] }); }
        }
        if (on.piano && !tapa(r.der)) { const g = golpePiano(chs[0], refTop); r.der.push({ p: S, L: 4, ps: g.der, v: 104, art: '->', antic: false, ch: chs[0] }); r.izq.push({ p: S, L: 4, ps: g.izq, v: 94, art: '->', ch: chs[0] }); }
        if (on.bajo && !tapa(r.bajo)) r.bajo.push({ p: S, L: 4, ps: [raizCerca(chs[0], refBajo)], v: 104, art: '->', ch: chs[0] });
        perc[nb - 1] = CORTE.filter(([d]) => suena(on, d)).map(([d, v]) => ({ p: 0, d, v })); extra[nb - 1] = [];
        cortar(solo, S);
        if (formatoV) { const g = TM.golpeVientos(formatoV, S, 4, chs[0], 108); for (const f of VIENTOS) { cortar(vientos[f], S, S + 4); if (on[f] && !vientos[f].some(e => e.p <= S && e.p + e.L > S)) vientos[f].push(...g[f]); } }
        Object.assign(fin, { ligaAl1: false, entraSolo: true }); pend = [];
      } else if (GOLPES_FIN[tr]) {
        // golpes de toda la banda: el resto del compás se calla (en el golpe solo, desde la llegada; si lo que sigue entra en el 1,
        // desde el 4&: la banda respira y cae junta en el 1); el golpe que cae en la llegada antes del 1 trae el acorde que viene
        const pos = GOLPES_FIN[tr](lado, /rumba/.test(cancion.clave || '') ? 'rumba' : 'son', L), desde = tr === 'golpe' ? Math.min(L, 14) : 0, golpes = (perc[nb - 1] || []).filter(e => e.p < desde);
        cortar(r.der, S + desde); cortar(r.izq, S + desde); cortar(r.bajo, S + desde);
        for (const f of VIENTOS) cortar(vientos[f], S + desde);
        cortar(solo, S + desde);
        const anticipaFin = !!sig && L < 16 && pos[pos.length - 1] === L;
        pos.forEach((q, n) => {
          const ultimo = n === pos.length - 1, antic = ultimo && anticipaFin, ch = antic ? sig[0] : chEn(q), L = ultimo ? 16 - q : pos[n + 1] - q;
          if (on.piano) { const g = golpePiano(ch, refTop); r.der.push({ p: S + q, L, ps: g.der, v: 108, art: '->', antic, ch, ...(antic ? { liga: true } : {}) }); r.izq.push({ p: S + q, L, ps: g.izq, v: 96, art: '->', ch }); }
          if (on.bajo) r.bajo.push({ p: S + q, L, ps: [raizCerca(ch, refBajo)], v: 106, art: '->', ch, ...(antic ? { cola: L + 4 } : {}) });
          if (formatoV) { const gv = TM.golpeVientos(formatoV, S + q, L, ch, 110); for (const f of VIENTOS) if (on[f]) vientos[f].push(...gv[f]); }
          for (const [d, v] of GOLPE) if (suena(on, d) && (r.mix[TM.familiaPerc(d)] ?? 1) > 0) golpes.push({ p: q, d, v });
          if (n === 0 && on.bateria && tr !== 'golpe') golpes.push({ p: q, d: 'crash', v: 0.8 });
        });
        for (const e of perc[nb - 1] || []) if (e.d === 'clave' && e.p >= desde && suena(on, 'clave') && !golpes.some(g => g.p === e.p && g.d === 'clave')) golpes.push(e);
        perc[nb - 1] = golpes; extra[nb - 1] = (extra[nb - 1] || []).filter(e => e.p < desde);
        // sin golpe anticipado, el bajo de lo que sigue entra con la raíz en el 1; el golpe solo hacia el 1 cae en el 1 que viene
        Object.assign(fin, { ligaAl1: anticipaFin && on.piano, entraSolo: !anticipaFin }); pend = [];
        if (tr === 'golpe' && L === 16) pend = [...GOLPE, ['crash', 0.85]].map(([d, v]) => ({ p: 0, d, v }));
      }
      // ---------- un corte de toda la banda se anuncia con un redoble de timbal en el compás de antes (Cárdenas 2008, en
      // docs/investigacion/vientos_generos.md: «el compás anterior a todo corte en tutti contiene un relleno de timbal»)
      if ((tr === 'corte' || GOLPES_FIN[tr]) && nb >= 2 && on.timbales && (r.mix.timbales ?? 1) > 0) {
        const RD = RELLENOS.redoble, quita = e => e.p >= RD.desde && RD.fam.includes(TM.familiaPerc(e.d));
        perc[nb - 2] = (perc[nb - 2] || []).filter(e => !quita(e)); extra[nb - 2] = (extra[nb - 2] || []).filter(e => !quita(e));
        for (const [p, d, v] of RD.golpes) perc[nb - 2].push({ p, d, v: +(0.85 * v * (r.mix.timbales ?? 1)).toFixed(3) });
      }
      // ---------- relleno de percusión en el último compás (si la banda sigue derecho)
      const RL = RELLENOS[s.relleno];
      if (RL && tr === 'ninguna' && on[RL.toca] && (r.mix[RL.toca] ?? 1) > 0) {
        const quita = e => e.p >= RL.desde && (RL.fam.includes(TM.familiaPerc(e.d)) || e.d === 'timbalH' || e.d === 'timbalL');
        perc[nb - 1] = (perc[nb - 1] || []).filter(e => !quita(e)); extra[nb - 1] = (extra[nb - 1] || []).filter(e => !quita(e));
        for (const [p, d, v] of RL.golpes) perc[nb - 1].push({ p, d, v: +(v * (r.mix[TM.familiaPerc(d)] ?? 1)).toFixed(3) });
        pend = pend.filter(e => !RL.siguiente.some(x => x.d === e.d) && e.d !== 'crash').concat(RL.siguiente.map(x => ({ ...x })));
      }
      // ---------- concatenar
      const off = inicio * 16;
      const mover = (evs, dst) => { const nuevos = evs.map(e => ({ ...e, p: e.p + off })); dst.push(...nuevos); return nuevos; };
      const nd = mover(r.der, res.der), ni = mover(r.izq, res.izq), nB = mover(r.bajo, res.bajo);
      for (const f of VIENTOS) mover(vientos[f], res.vientos[f]);
      mover(solo, res.solo);
      const pasa = i + 1 < secs.length;
      const liga = pasa && fin.ligaAl1 && on.piano && ons[i + 1].piano;
      const fd = nd.filter(e => e.liga && e.p >= off + S), ligDer = liga ? fd.concat(ni.filter(e => fd.some(x => x.p === e.p))) : [];
      ligados = { der: ligDer, bajo: pasa && ons[i + 1].bajo ? nB.filter(e => e.cola) : [] };
      // la última sección del loop: qué queda ligado hacia el principio y qué golpes caen en su 1 (solo al volver)
      if (loop && i === loop.hasta) costura = { liga: !!fin.ligaAl1 && on.piano, der: fd.concat(ni.filter(e => fd.some(x => x.p === e.p))), bajo: nB.filter(e => e.cola), pend: pend.map(e => ({ ...e })), ultimo: inicio + nb - 1 };
      for (let b = 0; b < nb; b++) {
        res.perc.push(perc[b]); res.extra.push(extra[b]); res.acordes.push(r.acordes[b]); res.lados.push(r.lados[b]);
        res.marchas.push(marcha); res.mixes.push(r.mix); res.estilos.push(ESTILO[TM.MARCHAS[s.marchaPerc] ? s.marchaPerc : marcha]);
      }
      const nombre = String(s.nombre || '').replace(/["\\]/g, '').trim(), palabra = PALABRA[marcha];
      const texto = !nombre ? r.marca : nombre.toLowerCase().includes(palabra) ? nombre : `${nombre} · ${palabra}`;
      res.secciones.push({ id: s.id != null ? s.id : i, nombre, inicio, largo: prog.length, vueltas: s.vueltas || 1, compases: nb, marcha, marca: r.marca, texto, semilla: s.semilla || (i + 1) * 7919, transicion: tr, entra: entraDe(i), llegaSig, info: { ...r.info, vientos: infoV, ...(infoS ? { solo: infoS } : {}) } });
      previo = { linea: on.piano ? fin.linea : null, bajo: on.bajo ? fin.bajo : null, ligaAl1: liga, entraSolo: fin.entraSolo || !on.bajo || llegaSig === '1' };
      inicio += nb;
    });
    for (const k of ['der', 'izq', 'bajo']) res[k].sort((a, b) => a.p - b.p);
    // vientos: cada familia sin pisarse de una sección a la otra, y hasta el final de la canción
    for (const f of VIENTOS) { const a = res.vientos[f].sort((x, y) => x.p - y.p).filter((e, i, x) => !i || e.p > x[i - 1].p); a.forEach((e, i) => { e.L = Math.max(1, Math.min(e.L, (a[i + 1] ? a[i + 1].p : inicio * 16) - e.p)); }); res.vientos[f] = a; }
    { const a = res.solo.sort((x, y) => x.p - y.p).filter((e, i, x) => !i || e.p > x[i - 1].p); a.forEach((e, i) => { e.L = Math.max(1, Math.min(e.L, (a[i + 1] ? a[i + 1].p : inicio * 16) - e.p)); }); res.solo = a; }
    // ---------- la costura del loop, para el reproductor: la primera vez que se toca el principio suena su 1 (entrada); al
    // volver por el loop, lo ligado desde el final sigue sonando (colas) y en el 1 caen los golpes que dejó el final (vuelta)
    if (loop && costura) {
      const A = res.secciones[loop.desde], t0 = A.inicio * 16, onA = ons[loop.desde];
      const primero = (evs, desde) => { const e = evs.find(x => x.p > desde); return e ? e.p : t0 + A.compases * 16; };
      const entrada = [], colas = [];
      if (costura.liga && onA.piano) {
        for (const e of res.der.concat(res.izq)) if (e.p === t0) entrada.push({ parte: 'piano', p: e.p, ps: e.ps });
        const hasta = primero(res.der, t0);
        for (const e of costura.der) colas.push({ parte: 'piano', p: e.p, ps: e.ps, extra: hasta - t0 });
      }
      if (costura.bajo.length && onA.bajo) {
        for (const e of res.bajo) if (e.p === t0) entrada.push({ parte: 'bajo', p: e.p, ps: e.ps });
        const hasta = primero(res.bajo, t0);
        for (const e of costura.bajo) colas.push({ parte: 'bajo', p: e.p, ps: e.ps, extra: Math.min(e.cola - (costura.ultimo * 16 + 16 - e.p), hasta - t0) });
      }
      const vuelta = costura.pend.filter(g => suena(onA, g.d)).map(g => ({ p: g.p, d: g.d, v: g.v }));
      // el plato del timbalero con la entrada del principio del loop (en el 4& o el 4 del último compás)
      const Lp = LLEGA[entraDe(loop.desde)];
      if (secs[loop.desde].plato === 'entra' && Lp < 16 && suena(onA, 'plato') && suena(ons[loop.hasta], 'plato')) {
        const u = costura.ultimo, dst = res.perc[u] || res.extra[u];
        if (!dst.some(e => e.p === Lp && e.d === 'plato')) dst.push({ p: Lp, d: 'plato', v: 0.9 });
      }
      res.costura = { inicio: A.inicio, fin: costura.ultimo + 1, entrada, colas, vuelta };
    }
    for (const e of res.bajo) delete e.cola;
    for (const e of res.der) delete e.liga;
    const s0 = res.secciones[0];
    return { compases: inicio, prog: res.acordes, ...res, mix: res.mixes[0], info: s0.info, marcha: s0.marcha, marca: s0.marca, clave: cancion.clave, titulo: cancion.titulo || '' };
  }

  Object.assign(TM, { generarCancion, soloEn, PISTAS, PISTAS_PERC: PERC, PISTAS_VIENTOS: VIENTOS, GOLPES_FIN, LLEGA });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
