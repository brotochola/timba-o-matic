/* =====================================================================
   MOTOR DE TUMBAOS · 9. PIANO: OPUS, TOONTRACK Y LA FRASE REAL
   Tres pianos que tocan lo que tocó un pianista y se lo acomodan a los acordes de la sección:
   - Toontrack: el patrón elegido de la colección local (estilo, parte y variación), compás por compás, tal cual.
   - Frase real: la frase entera de un tema de la base, en orden.
   - Opus: el montuno de un pianista elegido para el estilo, el tipo de sección y el ritmo armónico de los acordes, repetido
     como gancho (2 o 4 compases), con sus variaciones al final de la frase, las perillas y la marcha encima.
   Lo común es acomodar(): conduce las voces del pianista a los acordes nuevos con una búsqueda de Viterbi (la línea de arriba
   y la de la izquierda), en vez de transportar el voicing entero, que suena a máquina (docs/analisis_de_los_midis.md §6: el
   pianista mantiene el ritmo y el contorno y elige las notas del acorde nuevo más cercanas). Las notas de paso siguen
   resolviendo igual y nada fuera del acorde queda largo o en un golpe que habla.
   Todo en semicorcheas: p = compás*16 + posición.
   ===================================================================== */
(function (TM) {
  'use strict';
  const pc = m => ((m % 12) + 12) % 12;
  const DEL = { R: true, 3: true, 5: true, 7: true };
  const elegir = (R, items, peso) => { let tot = 0; const w = items.map(x => { const v = Math.max(0, peso(x)); tot += v; return v; }); if (!tot) return items[Math.floor(R() * items.length)]; let r = R() * tot; for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };

  // ---------- Viterbi: n pasos, candidatos por paso, puntaje de cada candidato y de cada paso entre dos candidatos
  function viterbi(n, cand, unaria, binaria) {
    const hist = []; let prev = null;
    for (let i = 0; i < n; i++) {
      const cur = cand(i).map(m => ({ m, s: unaria(i, m), b: -1 }));
      if (prev && prev.length) for (const c of cur) { let best = -1e9, bi = 0; for (let j = 0; j < prev.length; j++) { const v = prev[j].s + binaria(i, prev[j].m, c.m); if (v > best) { best = v; bi = j; } } c.s += best; c.b = bi; }
      hist.push(cur); prev = cur;
    }
    const out = new Array(n); if (!n) return out;
    let j = 0; for (let i = 1; i < prev.length; i++) if (prev[i].s > prev[j].s) j = i;
    for (let i = n - 1; i >= 0; i--) { out[i] = hist[i][j].m; j = hist[i][j].b; }
    return out;
  }

  // ---------- acomodar: las notas de la fuente (acorde S) a los acordes de la sección (T), conduciendo las voces
  // evs: [{ p, d, der: [notas de la derecha], izq: [notas de la izquierda], S, T, fuerte }] en orden de tiempo
  // o: { reg (corre el registro), salto (−1 pasos … 1 saltos), ten, crom (0: las cromáticas pasan a notas del acorde),
  //      rep (empuje de notas repetidas), memoria (Map de la vuelta anterior: clave → nota de arriba) }
  // devuelve evs con der2 e izq2 (las notas nuevas)
  function acomodar(evs, o = {}) {
    const reg = o.reg || 0, salto = o.salto || 0, ten = o.ten ?? 1, crom = o.crom ?? 1, rep = o.rep || 0;
    // la función que busca la nota en el acorde nuevo, según la que tenía en el de la fuente
    const objetivo = (m, S, T) => { const f = TM.funcion(m, S); if (f === '7' && T.fun.s == null) return 'R'; if (f === '3' && T.fun.t == null) return '5'; return f; };
    const mismaTension = (m, S, x, T) => pc(m - S.raiz) === pc(x - T.raiz);
    const puntaje = (e, src, m) => {
      const f = TM.funcion(src, e.S), g = TM.funcion(m, e.T), peso = e.fuerte ? 1.6 : 1;
      let s = 0;
      if (f === 'X') { if (g === 'X') s -= crom <= 0 ? 4 : e.fuerte ? 3 : 0.2; }
      else if (f === 'T') s += g === 'T' ? (mismaTension(src, e.S, m, e.T) ? 1.6 * Math.min(1.5, ten) : 0.3) - (ten <= 0 ? 3 : 0) : DEL[g] ? 0.6 : -3.5 * peso;
      else { const obj = objetivo(src, e.S, e.T); s += g === obj ? 2 : DEL[g] ? 0.8 : g === 'T' ? (ten > 1 && !e.fuerte ? 0.2 : -0.8 * peso) : -4 * peso; }
      return s;
    };
    const paso = (a, b, ya, yb, ma, mb) => {
      const ds = yb - ya, dt = mb - ma;
      let s = 0;
      if (ds === 0) s += dt === 0 ? 0.8 + rep : -0.6 - 0.1 * Math.abs(dt);
      else {
        if (dt === 0) s -= 0.9 - rep; else if (Math.sign(dt) !== Math.sign(ds)) s -= 1.4;
        s -= 0.22 * Math.min(12, Math.abs(dt - ds));
        if (dt === ds && a.S.nombre === b.S.nombre && a.T.nombre === b.T.nombre) s += 1;
        if (salto) s += Math.abs(dt) >= 3 ? 0.4 * salto : -0.4 * salto;
      }
      // lo que en la fuente era nota de paso (o tensión) y resolvía por grado, acá resuelve igual
      const fa = TM.funcion(ya, a.S);
      if ((fa === 'X' || fa === 'T') && Math.abs(ds) >= 1 && Math.abs(ds) <= 2 && b.p - a.p <= 4) s += dt === ds ? (fa === 'X' ? 2.5 : 1) : (fa === 'X' ? -3 : 0);
      // en el cambio de acorde, la voz se mueve poco (paso o nota común)
      if (a.T.nombre !== b.T.nombre) s += Math.abs(dt) <= 2 ? 0.4 : Math.abs(dt) <= 4 ? 0.1 : -0.2;
      return s;
    };
    // arriba del mi6 (el techo del piano en la app), la octava de arriba se deja: la línea sigue en la nota de abajo, como haría el
    // pianista (si no, la línea entera se correría a otras notas para no pasarse)
    const ideal = (y, S, T) => { const obj = objetivo(y, S, T); let best = null; for (let m = y + reg - 6; m <= y + reg + 6; m++) if (TM.funcion(m, T) === obj && (best == null || Math.abs(m - y - reg) < Math.abs(best - y - reg))) best = m; return best ?? y + reg; };
    for (const e of evs) { const top = e.der[e.der.length - 1]; if (e.der.length > 1 && e.der.includes(top - 12) && ideal(top, e.S, e.T) > 88) e.der = e.der.filter(x => x !== top); }
    // 1. la línea de arriba (los ataques con derecha)
    const D = evs.filter(e => e.der.length);
    const topF = D.map(e => e.der[e.der.length - 1]);
    const tops = viterbi(D.length, i => { const y = topF[i] + reg, c = []; for (let m = Math.max(55, y - 6); m <= Math.min(88, y + 6); m++) c.push(m); return c.length ? c : [Math.max(55, Math.min(88, y))]; },
      (i, m) => {
        let s = puntaje(D[i], topF[i], m) - 0.5 * ((m - topF[i] - reg) / 5) ** 2;
        const mem = o.memoria && D[i].clave != null ? o.memoria.get(D[i].clave) : null;
        if (mem != null && mem.T === D[i].T.nombre) s += m === mem.m ? 3 * (o.gancho ?? 0.75) : 0;
        return s;
      },
      (i, ma, mb) => paso(D[i - 1], D[i], topF[i - 1], topF[i], ma, mb));
    D.forEach((e, i) => { e.top2 = tops[i]; if (o.memoria && e.clave != null) o.memoria.set(e.clave, { m: tops[i], T: e.T.nombre }); });
    // 2. las notas de adentro de la derecha: a la misma distancia de la de arriba, en la nota del acorde con la misma función
    const adentro = (e, x, ancla, ancla2, techo) => {
      const d = ancla - x, ideal = ancla2 - d;
      if (d % 12 === 0) return ideal;
      const f = TM.funcion(x, e.S);
      let best = null, bs = -1e9;
      for (let z = ideal - 2; z <= ideal + 2; z++) {
        if (z >= techo) continue;
        const g = TM.funcion(z, e.T);
        let s = -0.45 * Math.abs(z - ideal);
        if (f === 'X') s += g === 'X' && !e.fuerte && crom > 0 ? 0.3 : DEL[g] ? 0.2 : -1;
        else s += g === objetivo(x, e.S, e.T) ? 2 : DEL[g] ? 1 : g === 'T' && ten > 0 ? -0.4 : -3;
        if (s > bs) { bs = s; best = z; }
      }
      return best;
    };
    for (const e of D) {
      const y = e.der[e.der.length - 1];
      e.der2 = [e.top2];
      for (const x of e.der.slice(0, -1).reverse()) { const z = adentro(e, x, y, e.top2, e.der2[e.der2.length - 1]); if (z != null && !e.der2.includes(z)) e.der2.push(z); }
      e.der2.sort((a, b) => a - b);
    }
    // 3. la izquierda: su nota más grave como otra línea, siempre debajo de la derecha (y no más abajo del la2: en la base, la
    // izquierda baja del sib2 en menos del 2% de los ataques)
    const I = evs.filter(e => e.izq.length);
    const bajos = I.map(e => e.izq[0]);
    const techoI = e => e.der2 && e.der2.length ? e.der2[0] - 1 : 84;   // la izquierda sola, sin la derecha encima
    const izqs = viterbi(I.length, i => { const z = bajos[i] + reg, c = []; for (let m = Math.max(43, z - 6); m <= Math.min(techoI(I[i]), z + 6); m++) c.push(m); return c.length ? c : [Math.min(techoI(I[i]), Math.max(45, z))]; },
      (i, m) => puntaje(I[i], bajos[i], m) - 0.5 * ((m - bajos[i] - reg) / 5) ** 2 - (m < 46 ? 2 : 0),
      (i, ma, mb) => paso(I[i - 1], I[i], bajos[i - 1], bajos[i], ma, mb));
    I.forEach((e, i) => {
      // las demás notas de la izquierda, a la misma distancia hacia arriba de la más grave
      e.izq2 = [izqs[i]];
      const techo = techoI(e);
      for (const x of e.izq.slice(1)) { const z = adentro(e, x, e.izq[0], izqs[i], techo + 1); if (z != null && z <= techo && !e.izq2.includes(z)) e.izq2.push(z); }
      e.izq2.sort((a, b) => a - b);
    });
    for (const e of evs) { if (!e.der2) e.der2 = []; if (!e.izq2) e.izq2 = []; }
    // 4. las notas de paso cromáticas: a la misma distancia de la nota a la que resuelven (en el ataque que sigue)
    const mapa = e => { const m = new Map(); e.der.forEach((x, i) => { if (e.der2[i] != null) m.set(x, e.der2[i]); }); e.izq.forEach((x, i) => { if (e.izq2[i] != null) m.set(x, e.izq2[i]); }); return m; };
    for (let i = 0; i + 1 < evs.length; i++) {
      const e = evs[i], n = evs[i + 1]; if (n.p - e.p > 4) continue;
      const mn = mapa(n);
      const resolver = (lista, lista2, techo) => lista.forEach((x, k) => {
        if (TM.funcion(x, e.S) !== 'X' || crom <= 0) return;
        const r = [...mn.keys()].find(y => Math.abs(y - x) >= 1 && Math.abs(y - x) <= 2 && DEL[TM.funcion(y, n.S)]);
        if (r == null) return;
        const z = mn.get(r) - (r - x);
        if (z != null && z < techo && !lista2.includes(z)) lista2[k] = z;
      });
      resolver(e.der, e.der2, 128); resolver(e.izq, e.izq2, e.der2.length ? e.der2[0] : 128);
      e.der2.sort((a, b) => a - b); e.izq2.sort((a, b) => a - b);
    }
    // 5. cuidado final: una nota fuera del acorde (ni del acorde ni tensión) solo queda si es de paso: corta, en un golpe débil y
    // resolviendo por grado (medio tono o un tono) en una nota del acorde del ataque que sigue; si no, va a la nota del acorde más
    // cercana. Doblada (en octava o bloque) solo dura una semicorchea, y en Opus va sola. Y nunca dos notas a medio tono que el
    // acorde no explica
    const resuelve = (z, ns) => ns.some(n => [...n.der2, ...n.izq2].some(w => Math.abs(w - z) >= 1 && Math.abs(w - z) <= 2 && DEL[TM.funcion(w, n.T)]));
    evs.forEach((e, i) => {
      // (resuelve en algún ataque de la negra que sigue: también después de un salto del arpegio, do# fa# re)
      const ns = evs.slice(i + 1).filter(x => x.p - e.p <= 4);
      const dePaso = z => crom > 0 && !e.fuerte && e.d <= 2 && resuelve(z, ns);
      const arreglar = (lista, techo, derecha) => {
        for (let k = 0; k < lista.length; k++) {
          const z = lista[k], g = TM.funcion(z, e.T);
          if (g !== 'X' || dePaso(z)) continue;
          let best = null; for (let d = 1; d <= 2 && best == null; d++) for (const w of [z - d, z + d]) if (w < techo && w <= 88 && DEL[TM.funcion(w, e.T)] && !lista.includes(w)) { best = w; break; }
          if (best != null) lista[k] = best;
        }
        const sin = [...new Set(lista)].sort((a, b) => a - b);
        // medio tono entre dos notas que el acorde no explica: se va la que no es del acorde (la de arriba de la derecha se queda)
        for (let otra = true; otra;) {
          otra = false;
          for (let a = 0; a < sin.length && !otra; a++) for (let c = a + 1; c < sin.length && !otra; c++) {
            const ic = pc(sin[c] - sin[a]); if (ic !== 1 && ic !== 11) continue;
            const fa = DEL[TM.funcion(sin[a], e.T)], fc = DEL[TM.funcion(sin[c], e.T)]; if (fa && fc) continue;
            let quita = fa ? c : a; if (derecha && quita === sin.length - 1) quita = quita === c ? a : c;
            if (derecha && quita === sin.length - 1) continue;
            sin.splice(quita, 1); otra = true;
          }
        }
        return sin;
      };
      e.der2 = arreglar(e.der2, 128, true);
      e.izq2 = arreglar(e.izq2, e.der2.length ? e.der2[0] : 128, false).filter(z => !e.der2.length || z < e.der2[0]);
      // la nota de paso de arriba, doblada: sola (en Opus siempre; en la frase del pianista, si dura más de una semicorchea)
      const top = e.der2[e.der2.length - 1];
      if (top != null && TM.funcion(top, e.T) === 'X' && (e.der2.length > 1 || e.izq2.length) && (o.cromSola || e.d >= 2)) { e.der2 = [top]; e.izq2 = []; }
      for (const lista of [e.der2, e.izq2]) for (let k = lista.length - 1; k >= 0; k--) if (TM.funcion(lista[k], e.T) === 'X' && lista[k] !== top && (o.cromSola || e.d >= 2)) lista.splice(k, 1);
    });
    return evs;
  }

  // ---------- la izquierda según el modo (cuando no es la de la fuente): dobla, décimas, movimiento contrario, ancla
  // piso: la nota más grave de la derecha; top: la de arriba. Nunca más abajo del la2 (embarra el bajo; en la base, casi nunca)
  function izquierdaDe(modo, top, piso, ch, centro) {
    const tonos = ch.pcs, cerca = (obj, a, z) => { let best = null; for (let x = obj - z; x <= obj + z; x++) if (tonos.includes(pc(x)) && (best == null || Math.abs(x - obj) < Math.abs(best - obj))) best = x; return best; };
    let mi = [];
    if (modo === 'dobla8') mi = [piso - 12];
    else if (modo === 'dobla16') mi = [piso - 24];
    // décimas: la izquierda canta la línea una décima abajo de la nota de arriba (el «tres armonizado» de Melón)
    else if (modo === 'decima') { let t = null; for (let x = top - 17; x <= top - 14; x++) if (tonos.includes(pc(x)) && (t == null || Math.abs(top - x - 15.5) < Math.abs(top - t - 15.5))) t = x; mi = [t != null ? t : piso - 12]; }
    else if (modo === 'contrario') { const eje = centro - 18, obj = 2 * eje - top + 12, b = cerca(obj, 0, 6); if (b != null && b < piso - 4) mi = [b]; }
    return mi.map(x => { while (x < 45) x += 12; return x; }).filter(x => x < piso);
  }

  // ---------- las barras de la fuente: { lado, acordes: [ch], sig: el primer acorde de la que sigue, ev: [{ q, d, ps, v }] }
  // de la frase entera de un patrón de Toontrack (todos sus compases, en orden; la última anticipa la primera: el patrón es un loop)
  function barrasDeFrase(f) {
    const F = f.frase, n = F.a.length, out = [];
    for (let i = 0; i < n; i++) out.push({ lado: F.l[i], acordes: F.a[i].map(TM.acorde).filter(Boolean), ev: [] });
    for (const [b, q, d, ps, v] of F.e) if (out[b]) out[b].ev.push({ q, d, ps: ps.slice().sort((x, y) => x - y), v });
    out.forEach((x, i) => { if (!x.acordes.length) x.acordes = (out[i - 1] || out[0]).acordes; x.sig = out[(i + 1) % n].acordes[0]; });
    return out.filter(x => x.acordes.length);
  }
  // de ciclos de la base (de a dos compases), en el orden dado
  function barrasDeCiclos(ciclos) {
    const out = [];
    for (const c of ciclos) {
      const A = c.A || TM.acordesCiclo(c).A, sig = c.s ? TM.acorde(c.s) : null;
      for (const k of [0, 1]) out.push({ lado: k ? 'B' : 'A', acordes: A[k], sig: k ? sig || A[0][0] : A[1][0], ev: (c.ev || c.e.map(([p, d, ps, v]) => ({ p, d, ps, v }))).filter(e => (e.p < 16) === !k).map(e => ({ q: e.p % 16, d: e.d, ps: e.ps.slice().sort((x, y) => x - y), v: e.v })), c });
    }
    return out;
  }

  // ---------- tocar: las barras de la fuente sobre los compases de la sección y acomodadas a sus acordes
  // plan(b) → la barra de la fuente para el compás b (del mismo lado de la clave). o: { fiel (la fuerza tal cual), memoria, … }
  function tocar(X, plan, o = {}) {
    const { k, nb, lado, acordesDe, acordeEn, antDe, previo } = X;
    const evs = [];
    // el registro de la fuente: lo que está muy por debajo de la línea es de la izquierda sola
    const todasTops = [];
    for (let b = 0; b < nb; b++) for (const e of plan(b).ev) todasTops.push(e.ps[e.ps.length - 1]);
    todasTops.sort((a, b) => a - b);
    const medTop = todasTops.length ? todasTops[todasTops.length >> 1] : 76;
    for (let b = 0; b < nb; b++) {
      const br = plan(b), cs = acordesDe(b), sigT = acordesDe(b + 1)[0], ultT = cs[cs.length - 1], cambia = sigT.nombre !== ultT.nombre;
      for (const e of br.ev) {
        if (b === 0 && e.q === 0 && previo && previo.ligaAl1) continue;   // la sección anterior llega ligada al 1
        const q = e.q, top = e.ps[e.ps.length - 1];
        // el acorde de la fuente en ese ataque (con su anticipo)
        const cur = br.acordes.length > 1 && q >= 8 ? br.acordes[1] : br.acordes[0];
        const prox = q >= 12 ? br.sig : br.acordes.length > 1 && q >= 4 && q < 8 ? br.acordes[1] : null;
        const anticF = TM.anticipaAtaque(e.ps, top, cur, prox), S = anticF ? prox : cur;
        // el acorde de la sección: el anticipo de la fuente va al acorde que viene; el 4& anticipa siempre que la sección cambie
        let T = acordeEn(b, q), antic = false;
        // (el anticipo de la fuente en el 4 solo vale donde el bajo ya trae la raíz nueva en el 4: el cambio de la salsa, o una sección
        // que sigue y entra en el 4)
        if (antDe(b) && cambia && (q >= 14 || (anticF && q >= X.posDe(b)))) { T = sigT; antic = true; }
        else if (cs.length > 1 && cs[1].nombre !== cs[0].nombre && q >= 4 && q < 8 && (anticF || q === 6) && antDe(b)) { T = cs[1]; antic = true; }
        // el disminuido de paso (Pupy): en el 4 antes del cambio, un °7 medio tono abajo del acorde que viene
        else if (o.dim && cambia && q === 12 && X.RA() < o.dim) T = TM.acorde(TM.NOM[(sigT.raiz + 11) % 12] + 'dim7');
        const solaIzq = top < medTop - 9;
        const der = solaIzq ? [] : e.ps.filter(x => x >= top - 12), izq = solaIzq ? e.ps.slice() : e.ps.filter(x => x < top - 12);
        evs.push({ p: b * 16 + q, b, q, d: e.d, v: e.v, der, izq, S, T, antic, anticF, fuerte: q === 6 || q === 14 || (lado(b) === 'B' && q === 0) || e.d >= 3, clave: o.clave ? o.clave(b, q) : null });
      }
      // el anticipo de la sección cae en el 4&. Si ahí no ataca nadie con el acorde nuevo, se agrega el golpe (con el voicing del
      // último ataque): siempre (Opus, como pide el cambio de acorde de la sección) o solo si lo que suena de antes lo taparía
      // con el acorde viejo (Toontrack y la frase real: un silencio no choca con el bajo)
      if (antDe(b) && cambia && o.anticipoForzado && !evs.some(e => e.b === b && e.q >= 14 && e.T.nombre === sigT.nombre && e.der.length)) {
        const antes = evs.filter(e => e.p < b * 16 + 14 && e.der.length).pop();
        const tapa = antes && antes.p + antes.d > b * 16 + 14;
        if (antes && (o.anticipoForzado === 'siempre' || tapa)) {
          for (const e of evs) if (e.b === b && e.q > 14) e.q = -1;   // un ataque en la última semicorchea queda adentro del anticipo
          for (let i = evs.length - 1; i >= 0; i--) if (evs[i].q === -1) evs.splice(i, 1);
          evs.push({ ...antes, der: antes.der.slice(), izq: antes.izq.slice(), p: b * 16 + 14, b, q: 14, d: 2, T: sigT, antic: true, fuerte: true, clave: o.clave ? o.clave(b, 14) : null, agregado: true });
        }
      }
    }
    evs.sort((a, b) => a.p - b.p);
    // el anticipo queda ligado al 1: si el acorde nuevo llega en el 4& porque lo pide la sección (el pianista de la fuente no
    // anticipaba ahí), el 1 que él atacaba se liga siempre hacia el lado 3 y la mitad de las veces hacia el lado 2, como en la base
    // (95% y 55%). Se decide por lugar del gancho, así las vueltas quedan iguales
    if (o.ligar) {
      const dec = new Map();
      for (const a of evs.filter(e => e.antic && e.q >= 14 && !e.anticF)) {
        const uno = evs.find(e => e.b === a.b + 1 && e.q === 0); if (!uno) continue;
        const key = o.clave ? o.clave(a.b + 1, 0) : a.b + 1;
        if (!dec.has(key)) dec.set(key, lado(a.b + 1) === 'A' || X.RA() < 0.5);
        if (dec.get(key)) evs.splice(evs.indexOf(uno), 1);
      }
    }
    // el registro: el del pianista (más la perilla). Opus solo corre la plantilla de a octavas si quedó lejos (más de una sexta) del
    // centro de la base: un pianista que toca grave en el soneo no tiene por qué tocar grave el coro
    const lejos = X.M.piano.registro.p50 - medTop, reg = (k.reg || 0) + (o.centrar && Math.abs(lejos) > 8 ? 12 * Math.round(lejos / 12) : 0);
    acomodar(evs, { reg, salto: k.salto || 0, ten: k.ten, crom: k.crom, rep: X.efect ? X.efect.rep : 0, memoria: o.memoria, gancho: k.gancho, cromSola: !!o.cromSola });
    // el gancho fijo (Opus): cada vuelta repite las notas de la primera donde la plantilla y los acordes son los mismos; con la
    // perilla del gancho, a veces el pianista la toca un poco distinta
    if (o.clave && o.H) {
      const primera = new Map(), copia = {};
      for (const e of evs) {
        const r = Math.floor(e.b / o.H), key = o.clave(e.b, e.q) + '|' + e.T.nombre + '|' + e.der.join() + '/' + e.izq.join();
        if (!primera.has(key)) { primera.set(key, e); continue; }
        if (r === 0) continue;
        if (copia[r] == null) copia[r] = X.RA() < (k.gancho ?? 0.75);
        if (copia[r]) { const f = primera.get(key); e.der2 = f.der2.slice(); e.izq2 = f.izq2.slice(); }
      }
    }
    // la izquierda: la de la fuente o la del modo elegido (Toontrack y la frase real la tocan como el pianista, salvo «sin izquierda»)
    const modo = o.izquierdaPropia && k.lh !== 'nada' ? 'auto' : k.lh || 'auto';
    for (const e of evs) {
      if (modo === 'nada') e.izq2 = [];
      // debajo de una nota de paso, nada (la izquierda la haría chocar)
      else if (modo !== 'auto' && e.der2.length && TM.funcion(e.der2[e.der2.length - 1], e.T) === 'X') e.izq2 = [];
      else if (modo !== 'auto' && modo !== 'ancla' && e.der2.length) e.izq2 = izquierdaDe(modo, e.der2[e.der2.length - 1], e.der2[0], e.T, X.centro || 76);
      else if (modo !== 'auto' && modo !== 'ancla') e.izq2 = [];
      // marchas livianas (cuerpo): la izquierda solo en los anticipos, en el 1 y el 3, y a veces
      if (e.izq2.length && X.marP.izq != null && !e.antic && e.q % 8 !== 0 && X.RV() > X.marP.izq) e.izq2 = [];
    }
    // fuerza: la del pianista (con las perillas de acentos) o, si la fuente no tiene dinámica, la de la base por posición
    const vs = evs.map(e => e.v), mv = vs.reduce((a, b) => a + b, 0) / Math.max(1, vs.length), sd = Math.sqrt(vs.reduce((a, v) => a + (v - mv) ** 2, 0) / Math.max(1, vs.length));
    const P = X.M.piano, acc = k.acc ?? 1;
    for (const e of evs) {
      let v;
      if (sd > 3) v = 84 + (e.v - mv) * acc;
      else { const fv = (P.vel[lado(e.b)] || [])[e.q] || 1; v = 86 * (e.q % 2 ? 0.8 : e.q % 4 === 0 ? 0.95 : 1) * Math.pow(fv, 2 * acc); }
      if (e.antic) v += 4 * acc;
      e.vel = Math.round(Math.max(30, Math.min(127, v)));
    }
    // duraciones: legato 0,5 = como la fuente; menos, más picado; más, hasta el ataque siguiente de la misma mano
    const der = [], izq = [], leg = k.leg ?? 0.5;
    const durar = (lista, conNotas, out, mano) => {
      const xs = lista.filter(conNotas);
      xs.forEach((e, i) => {
        const gap = (xs[i + 1] ? xs[i + 1].p : nb * 16) - e.p;
        let L = Math.min(e.d, gap);
        if (leg >= 0.5) L = Math.round(L + (gap - L) * (leg - 0.5) * 2); else L = Math.max(1, Math.round(L * (0.4 + leg * 1.2)));
        // el anticipo queda ligado al ataque que sigue (y el del final, hasta el final de la sección)
        if (e.antic && e.q >= 12) L = gap;
        L = Math.max(1, Math.min(L, gap));
        const ps = mano === 'der' ? e.der2 : e.izq2;
        const media = mano === 'der' ? e.vel : Math.round(e.vel * 0.9);
        out.push({ p: e.p, L, ps, v: media, art: e.vel >= 100 && mano === 'der' ? '->' : '', antic: !!e.antic, ch: e.T, ...(mano === 'der' && e.antic && e.q >= 12 ? { liga: true } : {}) });
      });
    };
    durar(evs, e => e.der2.length, der, 'der'); durar(evs, e => e.izq2.length, izq, 'izq');
    // el ancla en el grave: notas propias de la izquierda en los lugares de la clave (1 y 3 del lado 2; 2& y 4& del lado 3)
    if (modo === 'ancla') {
      izq.length = 0;
      for (let b = 0; b < nb; b++) for (const [q, L] of (lado(b) === 'B' ? [[0, 8], [8, 6]] : [[6, 8], [14, 2]])) {
        const ch = q === 14 && antDe(b) ? acordesDe(b + 1)[0] : acordeEn(b, q);
        let m = 36 + pc(ch.raiz); if (m < 41) m += 12;
        const d = der.find(x => x.p === b * 16 + q); if (d && m >= Math.min(...d.ps)) m -= 12;
        if (m >= 41) izq.push({ p: b * 16 + q, L, ps: [m], v: 84, art: '->', ch });
      }
    }
    const ult = der[der.length - 1];
    const ligaFin = !!(ult && ult.antic && ult.p >= (nb - 1) * 16 + 12 && X.ctx);
    return { der, izq, ligaFin, lineaFin: ult ? { m: ult.ps[ult.ps.length - 1], pd: 0, ch: ult.ch.nombre, f: null } : X.lineaFin, evs };
  }

  // la barra de la fuente para cada compás: en orden desde «desde», corrida una si hace falta para que coincida el lado
  function planSeguido(X, barras, desde) {
    const n = barras.length, d0 = ((desde % n) + n) % n;
    const ajuste = barras[d0].lado === X.lado(0) ? 0 : 1;
    return b => barras[(d0 + ajuste + b) % n];
  }

  // ---------- Toontrack: el estilo, la parte y la variación elegidos (o los de la sección y la variante)
  function elegirToontrack(X) {
    const { k, R } = X, TT = TM.TOONTRACK;
    const todas = (X.M.piano.frases || []).filter(f => f.coleccion === 'toontrack' || f.grupo);
    if (!todas.length) return null;
    const estilo = k.tt_estilo && k.tt_estilo !== 'auto' ? k.tt_estilo : TT.deEstilo[X.estilo] || (X.opc.grupo && [].concat(X.opc.grupo)[0]) || 'salsa_media';
    const delEstilo = todas.filter(f => f.grupo === estilo);
    const pool = delEstilo.length ? delEstilo : todas;
    const tipo = X.opc.tipoPiano || X.opc.tipo || ({ cuerpo: 'cuerpo', marcha: 'coro', mambo: 'mambo' })[X.opc.marchaPiano || X.opc.marcha] || 'coro';
    const quiero = k.tt_parte && k.tt_parte !== 'auto' ? k.tt_parte : TT.deTipo[tipo] || TT.deTipo[X.opc.marcha] || 'coro';
    const partes = new Map(TT.partes.map(([id, , prefijos]) => [id, prefijos]));
    let elegidas = [];
    for (const id of [quiero, ...(TT.parecidas[quiero] || [])]) { elegidas = pool.filter(f => (partes.get(id) || []).includes(f.parte)); if (elegidas.length) break; }
    if (!elegidas.length) elegidas = pool;
    elegidas.sort((a, b) => (a.parte < b.parte ? -1 : a.parte > b.parte ? 1 : a.var - b.var));
    const v = +k.tt_var || 0;
    return v > 0 ? elegidas[(v - 1) % elegidas.length] : elegidas[Math.floor(R() * elegidas.length)];
  }
  function pianoToontrack(X) {
    const f = elegirToontrack(X);
    if (!f) return null;   // sin la colección local: quien llama toca Opus en su lugar
    const barras = barrasDeFrase(f);
    if (!barras.length) return null;
    X.info.piano = f.id; X.info.toontrack = true;
    const r = tocar(X, planSeguido(X, barras, 0), { anticipoForzado: 'si-tapa', izquierdaPropia: true });
    return { ...r, ganchoFin: X.ctx ? { frase: true, F: f.id, desde: 0, H: 2 } : null };
  }

  // ---------- la frase real: la frase de un tema de la base (sus ciclos en orden)
  function pianoFrase(X, F, desde) {
    const ciclos = X.M.piano.ciclos.filter(c => c.f === F).sort((a, b) => a.c - b.c);
    if (!ciclos.length) return null;
    const barras = barrasDeCiclos(ciclos);
    X.info.piano = F; X.info.frase = true;
    const r = tocar(X, planSeguido(X, barras, 2 * desde), { anticipoForzado: 'si-tapa', izquierdaPropia: true });
    return { ...r, ganchoFin: X.ctx ? { frase: true, F, desde, H: 2 } : null };
  }

  // ---------- Opus
  // qué partes de los temas le sirven a cada tipo de sección (la primera es la que más)
  const PARTE_OPUS = { intro: ['intro', 'coro', 'cuerpo'], cuerpo: ['cuerpo', 'coro'], coro: ['coro', 'mambo'], mambo: ['mambo', 'coro'], mona: ['mambo', 'solo', 'coro'],
    final: ['final', 'coro'], bloque: ['coro', 'bloque'], presion: ['cuerpo', 'coro'], bomba: ['coro', 'cuerpo'], despelote: ['mambo', 'coro'], muela: ['cuerpo'] };
  const FAMILIA = { sonmontuno: 'cubano', charanga: 'cubano', salsabrava: 'salsa', salsa: 'salsa', songo: 'timba', pupy: 'timba', melon: 'timba', tirso: 'timba' };
  // el ritmo armónico compás por compás: «1» o «2» acordes, y «c» si cambia al que sigue (ahí van los anticipos)
  const ritmoArmonico = (acordes, sig) => acordes.map((cs, j) => (cs.length > 1 && cs[1].nombre !== cs[0].nombre ? '2' : '1') + ((j + 1 < acordes.length ? acordes[j + 1][0] : sig) && (j + 1 < acordes.length ? acordes[j + 1][0] : sig).nombre !== cs[cs.length - 1].nombre ? 'c' : '-')).join('');
  // lo típico de cada estilo: el ritmo promedio (por lado) de sus plantillas. Una plantilla parecida al promedio es un montuno
  // típico del estilo; una muy rara (un solo, un pasaje de un arreglo) pesa menos
  const ritmoDe = t => { const v = new Array(32).fill(0); for (const c of t.ciclos) for (const e of c.ev) v[e.p] = 1; return v; };
  function tipicos(P) {
    if (P._tipicos) return P._tipicos;
    // un voto por tema (el promedio de sus ciclos), y solo de los temas que son de ese estilo antes que de otro
    const porF = {};
    for (const t of P.plantillas) if (t.ciclos.length === 1) { const x = (porF[t.f] = porF[t.f] || { e: t.estilos[0], v: new Array(32).fill(0), n: 0 }); ritmoDe(t).forEach((y, i) => { x.v[i] += y; }); x.n++; }
    const suma = {}, n = {};
    for (const x of Object.values(porF)) { suma[x.e] = suma[x.e] || new Array(32).fill(0); x.v.forEach((y, i) => { suma[x.e][i] += y / x.n; }); n[x.e] = (n[x.e] || 0) + 1; }
    P._tipicos = Object.fromEntries(Object.keys(suma).map(e => [e, suma[e].map(x => x / n[e])]));
    return P._tipicos;
  }
  const parecidoRitmo = (a, b) => { let d = 0, s = 0; for (let i = 0; i < 32; i++) { d += Math.abs(a[i] - b[i]); s += a[i] + b[i]; } return s ? 1 - d / s : 1; };
  function elegirPlantilla(X, H, des) {
    const PL = X.M.piano.plantillas || [];
    const est = X.estilo, fam = FAMILIA[est], tip = est ? tipicos(X.M.piano)[est] : null;
    const tipo = X.opc.tipoPiano || X.opc.tipo || ({ cuerpo: 'cuerpo', marcha: 'coro', mambo: 'mambo' })[X.opc.marchaPiano || X.opc.marcha] || X.opc.marchaPiano || X.opc.marcha || 'coro';
    const partes = PARTE_OPUS[tipo] || ['coro'];
    const quiero = ritmoArmonico(Array.from({ length: H }, (_, j) => X.acordesDe(j)), X.acordesDe(H)[0]);
    const puntaje = t => {
      const we = !est ? (t.estilos.some(e => FAMILIA[e] === FAMILIA[X.estiloFamilia] || !X.estiloFamilia) ? 1 : 0.2) : t.estilos.includes(est) ? (t.estilos[0] === est ? 1 : 0.45) : t.estilos.some(e => FAMILIA[e] === fam) ? 0.2 : 0.03;
      const ws = !t.seccion ? 0.55 : t.seccion === partes[0] ? 1 : partes.includes(t.seccion) ? 0.6 : 0.3;
      // el ritmo armónico de la plantilla, repetida a lo largo del gancho y corrida como la sección (lado de la clave)
      const nT = t.ciclos.length * 2, accs = []; for (const c of t.ciclos) accs.push(c.A[0], c.A[1]);
      const tiene = ritmoArmonico(accs, t.ciclos[t.ciclos.length - 1].s ? TM.acorde(t.ciclos[t.ciclos.length - 1].s) : accs[0][0]);
      let igual = 0; for (let j = 0; j < H; j++) { const a = quiero.substr(2 * j, 2), b = tiene.substr(2 * ((j + des) % nT), 2); igual += (a[0] === b[0] ? 0.4 : 0) + (a[1] === b[1] ? 0.6 : 0); }
      const wa = 0.2 + 0.8 * (igual / H) ** 2;
      const wl = nT >= 4 ? (H >= 4 ? 1.4 : 1) : (H >= 4 ? 0.8 : 1.1);
      const wt = tip ? Math.pow(parecidoRitmo(ritmoDe({ ciclos: [t.ciclos[0]] }), tip), 3) : 1;
      // Toontrack (un pianista de verdad, lo mejor que hay) pesa más, sobre todo en el estilo que es suyo
      return we * ws * wa * wl * wt * (t.tt ? (t.estilos[0] === est ? 2.5 : 1.2) : 1) * (0.15 + t.q);
    };
    // primero el pianista (el tema), por lo mejor que tiene para esta sección; después uno de sus montunos. Así un tema con muchos
    // ciclos no se queda con todo
    const porF = new Map();
    for (const t of PL) { const p = puntaje(t); if (p <= 0) continue; const x = porF.get(t.f) || { mejor: 0, ts: [] }; x.ts.push([t, p]); x.mejor = Math.max(x.mejor, p); porF.set(t.f, x); }
    const temas = [...porF.values()].sort((a, b) => b.mejor - a.mejor).slice(0, 12);
    if (!temas.length) return null;
    const tema = elegir(X.R, temas, x => x.mejor ** 2);
    return elegir(X.R, tema.ts.sort((a, b) => b[1] - a[1]).slice(0, 8), x => x[1] ** 2)[0];
  }
  // densidad, texturas y semicorcheas de las perillas (y de la marcha) sobre una barra de la plantilla
  function ajustarBarra(br, X, R) {
    const { k, efect } = X, P = X.M.piano, L = br.lado, perf = P.perfil[L];
    let ev = br.ev.map(e => ({ ...e, ps: e.ps.slice() }));
    const objetivo = Math.round(ev.length * efect.dens);
    while (ev.length > Math.max(2, objetivo)) { const cand = ev.filter(e => e.q !== 14 && e.q !== 6); if (!cand.length) break; const x = elegir(R, cand, e => 1.05 - perf[e.q]); ev.splice(ev.indexOf(x), 1); }
    while (ev.length < Math.min(9, objetivo)) {
      const libres = [0, 2, 4, 6, 8, 10, 12, 14].filter(q => !ev.some(e => e.q === q) && (q !== 0 || L === 'B')); if (!libres.length) break;
      const q = elegir(R, libres, x => perf[x]), vec = ev.reduce((a, e) => !a || Math.abs(e.q - q) < Math.abs(a.q - q) ? e : a, null); if (!vec) break;
      ev.push({ ...vec, q, d: 2, ps: vec.ps.slice(), v: vec.v * 0.94 }); ev.sort((a, b) => a.q - b.q);
    }
    // texturas: cada ataque se queda con la suya o pasa a octava, nota sola, díada o acorde, con las proporciones de la base
    if (Math.abs(efect.oct - 1) > 0.02 || Math.abs(efect.blq - 1) > 0.02) for (const e of ev) {
      const top = e.ps[e.ps.length - 1], izq = e.ps.filter(x => x < top - 12), der = e.ps.filter(x => x >= top - 12);
      const actual = der.includes(top - 12) ? 'o' : der.length === 1 ? 'x' : der.length === 2 ? 'd' : 'a';
      const base = P.tex[L][e.q] || {}, tot = Object.values(base).reduce((a, b) => a + b, 0) || 1, mult = { o: efect.oct, x: 1, d: efect.blq, a: efect.blq };
      // (al cuadrado: con la marcha que pide terceras o notas sueltas, la textura de la plantilla cede de verdad)
      const t = elegir(R, ['o', 'x', 'd', 'a'], x => ((actual === x ? 0.7 : 0) + 0.3 * (base[x] || 0) / tot) * mult[x] ** 2);
      if (t === actual && t !== 'o') continue;
      const ch = br.acordes.length > 1 && e.q >= 8 ? br.acordes[1] : br.acordes[0];
      const debajo = (m, a, z) => { for (let x = m - a; x >= m - z; x--) if (ch.pcs.includes(pc(x))) return x; return null; };
      let nd = [top];
      if (t === 'o') { nd = [top - 12, top]; const inn = der.filter(x => x > top - 12 && x < top); const pInt = Math.min(0.95, P.tasaInterior * (k.int ?? 1) * 1.6); if (inn.length && R() < pInt) nd.splice(1, 0, inn[inn.length - 1]); else if (!inn.length && R() < pInt * 0.6) { const z = debajo(top, 3, 5); if (z != null) nd.splice(1, 0, z); } }
      else if (t === 'd') { const z = debajo(top, 3, 5) ?? debajo(top, 8, 9); if (z != null) nd = [z, top]; }
      else if (t === 'a') { const z1 = debajo(top, 3, 5), z2 = z1 != null ? debajo(z1, 3, 5) : null; nd = [z2, z1, top].filter(x => x != null); }
      e.ps = [...izq, ...nd].sort((a, b) => a - b);
    }
    // octavas rellenas: la nota de adentro (una 3a o 4a del acorde debajo de la de arriba) se agrega o se saca, sin tocar el resto
    const int = k.int ?? 1;
    if (Math.abs(int - 1) > 0.02) for (const e of ev) {
      const top = e.ps[e.ps.length - 1]; if (!e.ps.includes(top - 12)) continue;
      const adentro = e.ps.filter(x => x > top - 12 && x < top);
      if (int < 1 && adentro.length && R() < 1 - int) e.ps = e.ps.filter(x => !adentro.includes(x));
      else if (int > 1 && !adentro.length && R() < Math.min(0.9, (int - 1) * 0.5)) {
        const ch = br.acordes.length > 1 && e.q >= 8 ? br.acordes[1] : br.acordes[0];
        for (let x = top - 3; x >= top - 5; x--) if (ch.pcs.includes(pc(x))) { e.ps = [...e.ps, x].sort((a, b) => a - b); break; }
      }
    }
    // semicorcheas: más (notas de paso picadas antes de los contratiempos) o menos que la plantilla
    if (efect.semi < 0.98) ev = ev.filter(e => e.q % 2 === 0 || R() < efect.semi);
    else if (efect.semi > 1.02) {
      const pSemi = Math.min(0.85, (P.tasaSemis || 0.02) * (efect.semi - 1) * 12);
      for (const e of ev.slice()) if (e.q % 4 === 2 && !ev.some(x => x.q === e.q - 1) && R() < pSemi) { const top = e.ps[e.ps.length - 1]; ev.push({ q: e.q - 1, d: 1, ps: [top + (R() < 0.6 ? -1 : 2)], v: e.v * 0.8 }); }
      ev.sort((a, b) => a.q - b.q);
    }
    // cromatismo arriba de 1: apoyaturas de una semicorchea, medio tono abajo de la nota de arriba de los golpes que hablan (2& y 4&)
    if ((k.crom ?? 1) > 1.02) {
      for (const e of ev.slice()) if ((e.q === 6 || e.q === 14) && !ev.some(x => x.q === e.q - 1) && R() < Math.min(0.6, ((k.crom ?? 1) - 1) * 0.3)) ev.push({ q: e.q - 1, d: 1, ps: [e.ps[e.ps.length - 1] - 1], v: e.v * 0.8 });
      ev.sort((a, b) => a.q - b.q);
    }
    return { ...br, ev };
  }
  function pianoOpus(X) {
    const { k, nb, L } = X, P = X.M.piano;
    if (!(P.plantillas || []).length) return null;
    // largo del gancho: el de la progresión (2 o 4 compases) o el de la perilla; el de otra sección si comparte gancho
    let H = k.largo === 'auto' ? (L % 4 === 0 ? 4 : 2) : +k.largo;
    if (H > nb) H = nb % 2 === 0 ? nb : 2;
    const G0 = X.C.gancho && X.C.gancho.opus && X.C.gancho.H <= nb ? X.C.gancho : null;
    if (G0) H = G0.H;
    const des = X.lado(0) === 'B' ? 1 : 0;
    const pl = (G0 && P.plantillas.find(t => t.id === G0.id)) || elegirPlantilla(X, H, des);
    if (!pl) return null;
    X.info.piano = pl.f; X.info.opus = pl.id; X.info.celulas = pl.ciclos.map(c => c.ritmo || '');
    const barrasT = barrasDeCiclos(pl.ciclos), nT = barrasT.length;
    // las variantes del mismo pianista (los otros ciclos de su tema): para variar el gancho al final de la frase
    const otros = P.plantillas.filter(t => t.f === pl.f && t.ciclos.length === 1 && t.ciclos[0] !== pl.ciclos[0]).map(t => t.ciclos[0]);
    const variantes = otros.length ? barrasDeCiclos(otros) : [];
    const RV2 = X.RA, ajustadas = new Map();
    const ajustada = br => { if (!ajustadas.has(br)) ajustadas.set(br, ajustarBarra(br, X, RV2)); return ajustadas.get(br); };
    const barraDe = [];
    for (let b = 0; b < nb; b++) {
      const j = b % H, r = Math.floor(b / H);
      let br = barrasT[(j + des) % nT];
      // variación por vuelta: el último compás del gancho, otra barra del mismo pianista (mismo lado)
      if (r > 0 && j === H - 1 && variantes.length && RV2() < (k.var ?? 0.35) * 0.6) { const vs = variantes.filter(x => x.lado === br.lado); if (vs.length) br = vs[Math.floor(RV2() * vs.length)]; }
      barraDe.push(ajustada(br));
    }
    const memoria = new Map(G0 ? G0.memoria : []);
    const res = tocar(X, b => barraDe[b], { anticipoForzado: 'siempre', ligar: true, centrar: true, cromSola: true, memoria, clave: (b, q) => (b % H) + ':' + q, H, dim: k.dim });
    return { ...res, ganchoFin: X.ctx ? { opus: true, id: pl.id, H, memoria } : null };
  }

  Object.assign(TM, { acomodar, izquierdaDe, barrasDeFrase, barrasDeCiclos, tocarPiano: tocar, planSeguido, pianoToontrack, pianoFrase, pianoOpus, elegirToontrack, elegirPlantilla, viterbiPiano: viterbi });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
