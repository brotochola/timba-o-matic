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
  const PISTAS = ['piano', 'bajo', ...PERC];
  // estilo de la percusión clásica (la arma la página) para los compases sin juego aprendido
  const ESTILO = { cuerpo: 'verso', marcha: 'marcha', mambo: 'mambo', presion: 'presion', bomba: 'bomba', despelote: 'despelote', muela: 'muela' };
  const PALABRA = { cuerpo: 'cuerpo', marcha: 'marcha', mambo: 'mambo', presion: 'presión', bomba: 'bomba', despelote: 'despelote', muela: 'muela' };
  // transiciones, en semicorcheas del último compás de la sección.
  // Abanico: golpe de borde en el 4, redoble y golpe de borde en el 1 de lo que viene, que entra recién en el 2.
  // Cierre: toda la banda junta sobre la clave, el último golpe anticipado al acorde que viene. Corte: golpe en el 1 y silencio.
  const ABANICO = [[12, 'timbalH', 1], [13, 'timbalH', 0.45], [14, 'timbalH', 0.5], [15, 'timbalH', 0.6]];
  const CIERRE = { A: [0, 6, 12, 14], B: [4, 8, 14] };
  const GOLPE = [['congaS', 0.9], ['timbalH', 0.95], ['kick', 0.9]];
  const CORTE = [['congaS', 0.95], ['timbalH', 1], ['bongoH', 0.8], ['kick', 0.9], ['crash', 0.8]];

  const pistasDe = s => Object.fromEntries(PISTAS.map(x => [x, !s.pistas || s.pistas[x] !== false]));
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
    return { der: inn != null ? [top - 12, inn, top] : [top - 12, top], izq: [iz] };
  }
  const raizCerca = (ch, ref) => { let best = null; for (let m = 28; m <= 50; m++) if (pc(m) === ch.raiz && (best == null || Math.abs(m - ref) < Math.abs(best - ref))) best = m; return best; };

  function generarCancion(cancion, M) {
    const secs = cancion.secciones || [];
    if (!secs.length) throw new Error('La canción no tiene secciones');
    const progs = secs.map(s => Array.isArray(s.prog) ? s.prog : TM.leerProgresion(s.prog || ''));
    const ons = secs.map(pistasDe);
    const res = { der: [], izq: [], bajo: [], perc: [], extra: [], acordes: [], lados: [], marchas: [], mixes: [], estilos: [], secciones: [] };
    const ganchos = {};
    let previo = null, inicio = 0, pend = [], ligados = null;
    // el loop es un círculo: lo que sigue a su última sección es su primera (cancion.loop = { desde, hasta }, índices de sección)
    const loop = cancion.loop && secs[cancion.loop.desde] && secs[cancion.loop.hasta] && cancion.loop.desde <= cancion.loop.hasta ? cancion.loop : null;
    let costura = null;
    secs.forEach((s, i) => {
      const prog = progs[i]; if (!prog.length) throw new Error(`La sección ${i + 1} no tiene acordes`);
      // el estilo de la sección (toda la banda) y el del piano, que puede ser otro; sus perillas van debajo de las de la sección
      const E = TM.ESTILOS[s.estilo] || TM.ESTILOS.pupy, EP = TM.ESTILOS[s.pianoComo] || E;
      const on = ons[i], perillas = { ...cancion.perillas, ...EP.piano, ...s.perillas };
      for (const f of PERC) if (!on[f]) perillas['m_' + f] = 0;
      const sig = loop && i === loop.hasta ? progs[loop.desde][0] : progs[i + 1] ? progs[i + 1][0] : null, marcha = TM.MARCHAS[s.marcha] ? s.marcha : 'marcha';
      const r = TM.generar({ prog, clave: cancion.clave, marcha, vueltas: s.vueltas || 1, semilla: s.semilla || (i + 1) * 7919, perillas, estiloPreferido: EP.estilo || null, grupo: EP.grupo || null, tipo: s.tipo || null, cambio: s.cambio || E.cambio, estiloBanda: E.banda, bajoEstilo: E.bajo, percusion: s.percusion || null,
        tipoPiano: s.tipoPiano || null, marchaPiano: s.marchaPiano || null, marchaPerc: s.marchaPerc || null, semillas: { piano: s.semillaPiano, bajo: s.semillaBajo, perc: s.semillaPerc },
        contexto: { inicio, siguiente: sig, previo, gancho: s.ganchoDe != null ? ganchos[s.ganchoDe] : null } }, M);
      ganchos[s.id != null ? s.id : i] = r.gancho;
      const nb = r.compases, S = (nb - 1) * 16, fin = { ...r.fin, entraSolo: false };
      if (!on.piano) { r.der.length = 0; r.izq.length = 0; }
      if (!on.bajo) r.bajo.length = 0;
      const perc = r.perc || new Array(nb).fill(null), extra = Array.from({ length: nb }, () => []);
      // lo que dejó la sección anterior en el 1 de esta (platillo del relleno, golpe del abanico) y el plato del timbalero al entrar
      if (s.entrada === 'plato') pend.push({ p: 0, d: 'plato', v: 0.85 });
      // plato en el 4& del último compás de la sección anterior, junto con el anticipo del piano y del bajo (en vez del 1)
      if (s.entrada === 'plato4y' && i > 0) {
        pend = pend.filter(g => g.d !== 'plato');
        const ult = res.perc.length - 1, dst = res.perc[ult] || res.extra[ult];
        if (suena(ons[i - 1], 'plato') && suena(on, 'plato') && !dst.some(e => e.p === 14 && e.d === 'plato')) dst.push({ p: 14, d: 'plato', v: 0.9 });
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
        Object.assign(fin, { ligaAl1: false, entraSolo: true }); pend = [];
      } else if (tr === 'cierre') {
        cortar(r.der, S); cortar(r.izq, S); cortar(r.bajo, S);
        const pos = CIERRE[lado], golpes = [];
        pos.forEach((q, n) => {
          const ultimo = n === pos.length - 1, ch = ultimo && sig ? sig[0] : chEn(q), L = ultimo ? 16 - q : pos[n + 1] - q;
          if (on.piano) { const g = golpePiano(ch, refTop); r.der.push({ p: S + q, L, ps: g.der, v: 108, art: '->', antic: ultimo && !!sig, ch, ...(ultimo && sig ? { liga: true } : {}) }); r.izq.push({ p: S + q, L, ps: g.izq, v: 96, art: '->', ch }); }
          if (on.bajo) r.bajo.push({ p: S + q, L, ps: [raizCerca(ch, refBajo)], v: 106, art: '->', ch, ...(ultimo && sig ? { cola: L + 4 } : {}) });
          for (const [d, v] of GOLPE) if (suena(on, d)) golpes.push({ p: q, d, v });
          if (n === 0 && on.bateria) golpes.push({ p: q, d: 'crash', v: 0.8 });
        });
        perc[nb - 1] = golpes; extra[nb - 1] = [];
        Object.assign(fin, { ligaAl1: !!sig && on.piano }); pend = [];
      } else if (tr === 'abanico' && on.timbales) {
        const ab = ABANICO.map(([p, d, v]) => ({ p, d, v }));
        if (perc[nb - 1]) perc[nb - 1] = perc[nb - 1].filter(e => e.p < 12 || !['timbales', 'campanas'].includes(TM.familiaPerc(e.d))).concat(ab);
        else extra[nb - 1].push(...ab);
        // el abanico termina en el plato del timbalero (en vez del platillo de la batería)
        pend = pend.filter(e => e.d !== 'crash').concat([{ p: 0, d: 'timbalH', v: 1, quitar: true }, { p: 0, d: 'plato', v: 0.8 }]);
      }
      // ---------- concatenar
      const off = inicio * 16;
      const mover = (evs, dst) => { const nuevos = evs.map(e => ({ ...e, p: e.p + off })); dst.push(...nuevos); return nuevos; };
      const nd = mover(r.der, res.der), ni = mover(r.izq, res.izq), nB = mover(r.bajo, res.bajo);
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
      res.secciones.push({ id: s.id != null ? s.id : i, nombre, inicio, largo: prog.length, vueltas: s.vueltas || 1, compases: nb, marcha, marca: r.marca, texto, semilla: s.semilla || (i + 1) * 7919, transicion: tr, info: r.info });
      previo = { linea: on.piano ? fin.linea : null, bajo: on.bajo ? fin.bajo : null, ligaAl1: liga, entraSolo: fin.entraSolo || !on.bajo };
      inicio += nb;
    });
    for (const k of ['der', 'izq', 'bajo']) res[k].sort((a, b) => a.p - b.p);
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
      // el plato del timbalero en el 4& de antes, cuando el principio del loop entra así
      if (secs[loop.desde].entrada === 'plato4y' && suena(onA, 'plato') && suena(ons[loop.hasta], 'plato')) {
        const u = costura.ultimo, dst = res.perc[u] || res.extra[u];
        if (!dst.some(e => e.p === 14 && e.d === 'plato')) dst.push({ p: 14, d: 'plato', v: 0.9 });
      }
      res.costura = { inicio: A.inicio, fin: costura.ultimo + 1, entrada, colas, vuelta };
    }
    for (const e of res.bajo) delete e.cola;
    for (const e of res.der) delete e.liga;
    const s0 = res.secciones[0];
    return { compases: inicio, prog: res.acordes, ...res, mix: res.mixes[0], info: s0.info, marcha: s0.marcha, marca: s0.marca, clave: cancion.clave, titulo: cancion.titulo || '' };
  }

  Object.assign(TM, { generarCancion, PISTAS, PISTAS_PERC: PERC });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
