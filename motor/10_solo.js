/* =====================================================================
   MOTOR DE TUMBAOS · 10. SOLO DE TROMPETA
   El solista aprende de frases reales: los solos de trompeta y corneta de la Weimar Jazz Database (más los de cualquier
   instrumento con toque latino o funk), transcriptos nota por nota con sus acordes y sus frases (base/base_solos.json, la
   arma herramientas/solos_jazz.js). Cada frase guarda su ritmo, su contorno y la función de cada nota en su acorde (nota del
   acorde, tensión, aproximación que resuelve por grado, otra).
   Cómo arma un solo (docs/investigacion/solo_trompeta_salsa.md, solo_trompeta_jazz.md, latin_jazz.md):
   - un plan de frases por clave: frases de una clave (a veces dos), aire entre frases, y una intensidad que sube hasta el
     clímax (registro, densidad y menos aire); con «coro», la trompeta contesta en los huecos del coro (el solo de son)
   - cada frase es una frase real elegida por el modo (los trompetistas y el tipo de idea que se parecen al son, la descarga,
     la salsa brava, la timba o el latin jazz), por su largo y su densidad, y puesta del lado de la clave donde encaja (el
     encaje se aprende de los vientos de la base: qué posiciones atacan en el lado 3 y en el lado 2)
   - el desarrollo: repetir la frase anterior en los acordes nuevos (secuencia), subirla, armar una frase con una célula de
     3 a 5 notas que se repite corrida, o una nota pedal que se estira sobre la clave (Chappottín, Ferguson)
   - las alturas, con Viterbi: el contorno de la frase original (los mismos intervalos), las notas del acorde en las notas
     del acorde, las tensiones en tensiones, las aproximaciones resolviendo por grado, nada largo fuera del acorde, el final
     de frase en la quinta o la raíz, y el registro del plan
   El jurado (rasgosSolo, juzgarSolo) mide lo mismo en los solos reales y en los generados.
   ===================================================================== */
(function (TM) {
  'use strict';
  const pc = m => ((m % 12) + 12) % 12;
  const elegir = (R, items, peso) => { let tot = 0; const w = items.map(x => { const v = Math.max(0, peso(x)); tot += v; return v; }); if (!tot) return items[Math.floor(R() * items.length)]; let r = R() * tot; for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };
  const esAc = g => g === 'R' || g === '3' || g === '5' || g === '7';

  // ---------- los modos del solista. pasoMeta: la parte de pasos de grado de la línea en sus trompetistas (la selección de frases
  // tira hacia lo saltón: las que encajan en la clave y las ralas suelen ser arpegios); centro: la nota media al empezar; sube: cuánto sube el centro en el clímax; techo: la más
  // aguda; dens: notas por tiempo; frase y aire: en semicorcheas; crom: cuánto cromatismo; quien e ideas: de quién y qué
  // tipo de frase aprende (las unidades de nivel medio de Frieler: lick, line, melody, rhythm, expressive, quote)
  const SWING = ['Louis Armstrong', 'Roy Eldridge', 'Buck Clayton', 'Harry Edison', 'Henry Allen', 'Rex Stewart', 'Charlie Shavers', 'Bix Beiderbecke'];
  const HARDBOP = ['Clifford Brown', 'Lee Morgan', 'Kenny Dorham', 'Fats Navarro', 'Dizzy Gillespie', 'Nat Adderley', 'Freddie Hubbard'];
  const MODERNO = ['Freddie Hubbard', 'Woody Shaw', 'Wynton Marsalis', 'Clifford Brown', 'Dizzy Gillespie', 'Don Ellis', 'Kenny Wheeler'];
  const MODOS = {
    son: { n: 'Son (septeto, Chappottín)', d: 'frases de una clave que bajan a la nota del acorde, una célula que se repite, diatónico, registro medio',
      pasoMeta: 0.55, centro: 67, sube: 5, techo: 79, dens: 1.6, frase: [24, 40], maxFrase: 48, aire: [4, 10], crom: 0.5, cromMeta: 0.06, jurado: { escala: 0.13, repite: 0.05 }, quien: SWING, ideas: { melody: 1.6, rhythm: 1.8, lick: 1, expressive: 1.2, quote: 1, line: 0.7, fragment: 0.7, theme: 1 }, baja: 1.6, celula: 0.3, pedal: 0.18 },
    descarga: { n: 'Descarga (Chocolate Armenteros)', d: 'frases más largas, arpegios y escalas, alguna cita, sube hasta el Do6',
      pasoMeta: 0.63, centro: 68, sube: 8, techo: 84, dens: 2, frase: [28, 56], maxFrase: 68, aire: [4, 10], crom: 0.8, cromMeta: 0.12, jurado: { escala: 0.08 }, quien: [...HARDBOP, 'Chet Baker', 'Roy Eldridge'], ideas: { melody: 1.2, rhythm: 1.2, lick: 1, expressive: 1, quote: 1.2, line: 1.1, fragment: 0.6, theme: 1 }, baja: 1.2, celula: 0.12, pedal: 0.12 },
    brava: { n: 'Salsa brava (Nueva York)', d: 'agudo y fuerte, notas largas que cantan, pentatónica y blues',
      pasoMeta: 0.63, centro: 68, sube: 9, techo: 86, dens: 1.9, frase: [24, 52], maxFrase: 64, aire: [4, 10], crom: 0.65, cromMeta: 0.1, jurado: { escala: 0.08, registro: 2 }, quien: ['Lee Morgan', 'Freddie Hubbard', 'Clifford Brown', 'Dizzy Gillespie', 'Fats Navarro', 'Woody Shaw', 'Roy Eldridge'], ideas: { melody: 1.2, rhythm: 1.5, lick: 1.1, expressive: 1.6, quote: 0.8, line: 0.9, fragment: 0.6, theme: 0.8 }, baja: 1.2, celula: 0.14, pedal: 0.2 },
    timba: { n: 'Timba (vocabulario de jazz, agudo)', d: 'líneas de bebop, cromatismo y arpegios de tensiones, registro agudo sostenido',
      pasoMeta: 0.61, centro: 69, sube: 10, techo: 87, dens: 2.5, frase: [32, 68], maxFrase: 80, aire: [2, 8], crom: 1.1, cromMeta: 0.2, jurado: { escala: 0.04, registro: 2 }, quien: MODERNO, ideas: { melody: 0.7, rhythm: 1.2, lick: 1, expressive: 1, quote: 0.5, line: 1.3, fragment: 0.6, theme: 0.6 }, baja: 1, celula: 0.1, pedal: 0.15 },
    latinjazz: { n: 'Latin jazz', d: 'bebop sobre el montuno: líneas y licks, espacio, sube con la banda',
      pasoMeta: 0.63, centro: 68, sube: 8, techo: 84, dens: 2.2, frase: [32, 64], maxFrase: 80, aire: [4, 10], crom: 1, cromMeta: 0.18, jurado: { escala: 0.04 }, quien: [...HARDBOP, 'Woody Shaw', 'Miles Davis', 'Kenny Wheeler'], ideas: { melody: 1, rhythm: 1, lick: 1, expressive: 1, quote: 0.8, line: 1, fragment: 0.6, theme: 0.8 }, baja: 1, celula: 0.1, pedal: 0.1 }
  };
  const MODO_DE_ESTILO = { sonmontuno: 'son', charanga: 'descarga', salsabrava: 'brava', salsa: 'descarga', songo: 'latinjazz', pupy: 'timba', melon: 'timba', tirso: 'timba' };
  const PISO = 55;   // Sol3 (sonido real): el piso del solo (investigación de salsa, R23)

  // ---------- la escala de cada acorde (intervalos desde la raíz) y las notas de blues que pasan sobre él
  const ESCALA = { '': [0, 2, 4, 5, 7, 9, 11], 6: [0, 2, 4, 5, 7, 9, 11], maj7: [0, 2, 4, 5, 7, 9, 11], 7: [0, 2, 4, 5, 7, 9, 10], 9: [0, 2, 4, 5, 7, 9, 10], '7b9': [0, 1, 3, 4, 7, 8, 10],
    m: [0, 2, 3, 5, 7, 8, 10], m7: [0, 2, 3, 5, 7, 9, 10], m9: [0, 2, 3, 5, 7, 9, 10], m6: [0, 2, 3, 5, 7, 9, 11], m7b5: [0, 2, 3, 5, 6, 8, 10], dim7: [0, 2, 3, 5, 6, 8, 9, 11], dim: [0, 2, 3, 5, 6, 8, 9, 11],
    sus4: [0, 2, 5, 7, 9, 10], '7sus4': [0, 2, 5, 7, 9, 10], aug: [0, 2, 4, 6, 8, 10], 5: [0, 2, 3, 4, 5, 7, 9, 10] };
  // la dominante que va a un menor una cuarta arriba (el V7 de la salsa en menor): frigio dominante, con la novena menor y la 13 menor
  const FRIGIO = [0, 1, 4, 5, 7, 8, 10];
  const escalaDe = (ch, sig) => {
    if (!ch) return null;
    const dom = ['7', '9', '7b9'].includes(ch.q), aMenor = sig && /^m(?!aj)/.test(sig.q) && pc(sig.raiz - ch.raiz) === 5;
    return new Set((dom && aMenor ? FRIGIO : ESCALA[ch.q] || ESCALA['']).map(i => (i + ch.raiz) % 12));
  };
  const BLUES = { mayor: [3, 6, 10], menor: [6] };
  const azul = (m, ch) => !!ch && BLUES[/^m(?!aj)/.test(ch.q) || ch.q.startsWith('dim') ? 'menor' : 'mayor'].includes(pc(m - ch.raiz));

  // ---------- el encaje con la clave: cuánto más común es cada posición de ataque en el lado 3 que en el lado 2 (log de la razón),
  // medido en las líneas de vientos de los temas con la clave segura (02_analisis: e = [pos 0-31, duración, nota, fuerza, instrumento]).
  // Separa los ataques que se ligan al compás siguiente (el bombo del lado 3 ligado, el anticipo del 4& del lado 2).
  // Probado con la mitad de los temas contra la otra mitad: la línea real encaja mejor que la misma línea cruzada en el 70% de
  // los ciclos de dos compases (lo que dicen Hernández, Washburne y Peñalosa vía Ferguson: más tiempos en el lado 2, más
  // contratiempos y anticipos en el lado 3; el anticipo que entra desde un contratiempo anuncia el lado 3)
  function aprenderClave(fuentes) {
    const C = [new Array(32).fill(4), new Array(32).fill(4)];
    for (const f of fuentes || []) {
      if (!['salsa', 'cubano', 'timba'].includes(f.estilo) || !f.analisis || !['clave', 'declarado'].includes(f.analisis.ladoFuente)) continue;
      for (const c of f.vientos || []) {
        const porP = new Map(); for (const [p, d, m] of c.e) if (!porP.has(p) || porP.get(p).m < m) porP.set(p, { p, d, m });
        const ev = [...porP.values()].sort((a, b) => a.p - b.p); if (ev.length < 4) continue;
        for (const e of ev) { const q = e.p % 16; C[e.p < 16 ? 0 : 1][q + e.d > 16 ? 16 + q : q]++; }
      }
    }
    const t = C.map(a => a.reduce((x, y) => x + y, 0));
    return C[0].map((_, k) => +(Math.log(C[0][k] / t[0]) - Math.log(C[1][k] / t[1])).toFixed(3));
  }
  // el encaje de una lista de notas [{p, d}] (p desde el 1 de un compás de lado lado0): positivo, en clave; negativo, cruzada
  const encaje = (ns, L, lado0) => { if (!L || !ns.length) return 0; let s = 0; for (const n of ns) { const b = Math.floor(n.p / 16), q = ((n.p % 16) + 16) % 16, tres = ((b % 2) + 2) % 2 === 0 ? lado0 === 'A' : lado0 !== 'A', v = L[q + n.d > 16 ? 16 + q : q]; s += tres ? v : -v; } return s / ns.length; };

  // la familia de un acorde: mayor, dominante, menor, semidisminuido, disminuido; y cuánto se parecen dos familias
  const familia = ch => !ch ? '?' : ['7', '9', '7b9', '7sus4', 'aug'].includes(ch.q) ? 'D' : ch.q === 'm7b5' ? 'h' : ch.q.startsWith('dim') ? 'o' : /^m(?!aj)/.test(ch.q) ? 'm' : 'M';
  const PARECE = { MM: 1, DD: 1, mm: 1, hh: 1, oo: 1, MD: 0.55, DM: 0.45, mh: 0.6, hm: 0.6, ho: 0.6, oh: 0.6, Do: 0.5, oD: 0.5, mD: 0.15, Dm: 0.25, Mm: 0.1, mM: 0.1 };

  // ---------- la base de frases
  const IDEA = v => { const m = /(lick|line|melody|rhythm|expressive|quote|fragment|theme|void)/.exec(v || ''); return m ? m[1] : 'lick'; };
  function construirSolos(B, fuentesBase) {
    const MS = { frases: [], solos: [], clave: (B && B.clave) || aprenderClave(fuentesBase), refClave: (B && B.refClave) || null };
    if (!B || !B.solos) return MS;
    B.solos.forEach((s, si) => {
      const acs = s.acordes.map(([p, n]) => [p, n ? TM.acorde(n) : null]);
      const chEn = p => { let lo = 0, hi = acs.length - 1, r = null; while (lo <= hi) { const m = (lo + hi) >> 1; if (acs[m][0] <= p) { r = acs[m][1]; lo = m + 1; } else hi = m - 1; } return r; };
      const notas = s.notas.map(([p, d, m, f]) => ({ p, d, m, f, ch: chEn(p) }));
      const sigEn = p => { const ch = chEn(p); for (const [q, c] of acs) if (q > p && c && ch && c.nombre !== ch.nombre) return c; return null; };
      const escEn = p => escalaDe(chEn(p), sigEn(p));
      MS.solos.push({ id: s.id, interprete: s.interprete, tema: s.tema, inst: s.inst, feel: s.feel, tempo: s.tempo, notas, chEn, sigEn });
      // las ideas (unidad de nivel medio que empieza en cada nota)
      const idea = new Array(notas.length).fill(null); let cur = 'lick', k = 0; const ideas = (s.ideas || []).slice().sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < notas.length; i++) { while (k < ideas.length && ideas[k][0] <= i) cur = IDEA(ideas[k++][1]); idea[i] = cur; }
      // frases: las de la base; las notas fuera de frase, cortadas por los silencios de un tiempo
      const grupos = []; let g = null;
      notas.forEach((n, i) => { const ant = notas[i - 1]; const corta = !g || n.f !== g.f || (n.f < 0 && ant && n.p - (ant.p + ant.d) >= 4); if (corta) { g = { f: n.f, i: [] }; grupos.push(g); } g.i.push(i); });
      for (const gr of grupos) {
        const ns = gr.i.map(i => notas[i]); if (ns.length < 3 || ns.some(n => !n.ch)) continue;
        const b0 = Math.floor(ns[0].p / 16) * 16, len = ns.at(-1).p + ns.at(-1).d - ns[0].p;
        if (len > 80 || len < 4) continue;
        const ev = ns.map((n, i) => {
          const g_ = TM.funcion(n.m, n.ch), sig = ns[i + 1], crom = g_ === 'X' && !escEn(n.p).has(pc(n.m));
          const cat = esAc(g_) ? 'C' : g_ === 'T' ? 'T' : sig && Math.abs(sig.m - n.m) <= 2 && sig.m !== n.m && esAc(TM.funcion(sig.m, sig.ch)) ? 'A' : crom ? 'K' : 'X';
          return { q: n.p - b0, d: Math.max(1, Math.min(n.d, sig ? sig.p - n.p : 16)), m: n.m, cat, fa: familia(n.ch), ra: n.ch.raiz, ...(crom ? { crom: true } : {}) };
        });
        const ms = ev.map(e => e.m), xr = ev.filter(e => e.crom).length / ev.length;
        let pasos = 0; for (let i = 1; i < ms.length; i++) { const d = Math.abs(ms[i] - ms[i - 1]); if (d >= 1 && d <= 2) pasos++; }
        MS.frases.push({ s: si, p0: b0, interprete: s.interprete, inst: s.inst, feel: s.feel || '', idea: idea[gr.i[0]], ev, off: ev[0].q, len, n: ev.length, dens: ev.length / Math.max(1, len / 4),
          xr, paso: pasos / (ms.length - 1), baja: ms.at(-1) - ms[0], ancho: Math.max(...ms) - Math.min(...ms), fin: ev.at(-1).d,
          fit: [encaje(ev.map(e => ({ p: e.q, d: e.d })), MS.clave, 'A'), encaje(ev.map(e => ({ p: e.q, d: e.d })), MS.clave, 'B')] });
      }
    });
    return MS;
  }

  // ---------- las alturas de una frase (Viterbi): ns = [{p, d, m (la de la frase original), cat, T (acorde de acá), esc, fuerte, fin}]
  // o: { centro, lo, hi, prev (la nota anterior y cuánto antes), crom, blues, forma (peso del contorno original) }
  function acomodar(ns, o) {
    const lo = o.lo, hi = o.hi, K = hi - lo + 1, n = ns.length;
    if (!n || K <= 0) return [];
    const un = ns.map((e, i) => {
      const w = (e.fuerte ? 1.6 : 1) * (1 + Math.min(e.d, 8) / 4), c = new Float64Array(K);
      for (let k = 0; k < K; k++) {
        const x = lo + k, g = TM.funcion(x, e.T), sc = e.esc.has(pc(x)), bl = o.blues && azul(x, e.T);
        // cada nota hace en el acorde nuevo lo que hacía en el original: la nota del acorde, nota del acorde; la tensión, tensión;
        // la de paso o de aproximación, de paso (de la escala, o cromática si el modo deja), sin volverse nota del acorde
        let h;
        if (e.cat === 'C') h = (esAc(g) ? 0 : g === 'T' ? 1.2 : sc ? 2.5 : 6) * w;
        else if (e.cat === 'T') h = (g === 'T' ? 0 : esAc(g) ? 0.8 : sc ? 1.2 : 5) * w;
        else if (e.cat === 'A' || e.cat === 'K') {
          // la aproximación y la cromática: si en el original era cromática, acá también (con el cromatismo del modo); si no, de la escala
          const cr = !sc && !esAc(g) && g !== 'T';
          h = (e.crom ? (cr ? Math.max(0, 0.9 - 0.7 * o.crom) : esAc(g) ? 0.9 : 0.25 + 0.35 * o.crom) : (cr ? 0.5 / Math.max(0.2, o.crom) : esAc(g) ? 0.6 : 0)) * (e.fuerte ? 1.6 : 1);
          if (bl && e.crom) h = Math.min(h, 0.1);
        } else h = (sc && !esAc(g) ? 0 : esAc(g) || g === 'T' ? 0.4 : bl ? 0.4 : 1.6 / Math.max(0.2, o.crom)) * (e.fuerte ? 1.6 : 1);
        // nada largo fuera del acorde; el final de la frase en una nota del acorde (la quinta y la raíz, las de reposo: Ortega)
        if (e.d >= 4 && !esAc(g) && g !== 'T') h += 6;
        if (e.fin) h += esAc(g) ? (g === 'R' || g === '5' ? -0.6 : 0) : g === 'T' ? 1.5 : 5;
        const r = (x - o.centro) / 7; h += 0.18 * r * r;
        // el lick se transporta con el acorde, como lo hace un músico: cada nota guarda su grado sobre la raíz (el 3 sigue siendo
        // 3, el 9 sigue siendo 9); el Viterbi corrige solo lo que choca con el acorde nuevo
        if (e.ra != null && pc(x - e.T.raiz) !== pc(e.m - e.ra)) h += 0.8;
        if (i === 0 && o.prev) { const dd = Math.abs(x - o.prev.m); if (dd > 7) h += ((dd - 7) / 2) ** 2 * (o.prev.gap < 8 ? 0.6 : 0.2); }
        c[k] = h;
      }
      return c;
    });
    const forma = o.forma ?? 1;
    const par = (i, a, b) => {
      const d = b - a, oi = ns[i].m - ns[i - 1].m;
      // el contorno de la frase original: cada intervalo, lo más parecido posible (un semitono de diferencia cuesta casi como una
      // nota de la escala en lugar de una del acorde: la línea manda, la armonía corrige)
      let c = forma * 0.7 * (d - oi) * (d - oi);
      if (oi !== 0 && Math.sign(d) !== Math.sign(oi)) c += 3;
      if (oi === 0 && d !== 0) c += 2.5;
      if (Math.abs(d) > 12) c += 8;
      if (ns[i - 1].cat === 'A') { const g = TM.funcion(b, ns[i].T); if (!(Math.abs(d) >= 1 && Math.abs(d) <= 2 && (esAc(g) || g === 'T'))) c += 5; }
      return c;
    };
    let D = Float64Array.from(un[0]); const back = [];
    for (let i = 1; i < n; i++) {
      const N = new Float64Array(K).fill(Infinity), bk = new Int16Array(K);
      for (let b = 0; b < K; b++) { for (let a = 0; a < K; a++) { const v = D[a] + par(i, lo + a, lo + b); if (v < N[b]) { N[b] = v; bk[b] = a; } } N[b] += un[i][b]; }
      back.push(bk); D = N;
    }
    let k = 0; for (let j = 1; j < K; j++) if (D[j] < D[k]) k = j;
    const out = new Array(n); out[n - 1] = lo + k;
    for (let i = n - 1; i > 0; i--) { k = back[i - 1][k]; out[i - 1] = lo + k; }
    return out;
  }

  // ---------- el solo de una sección
  // opc: { nb, lado(b) ('A' lado 3 | 'B' lado 2), acordesDe(b), acordeEn(b, pos), anticipa, posAnt, R, estilo (de la sección),
  //        final (la sección que sigue entra con la banda: el solo cierra), k: las perillas (s_*) }
  function solear(opc, MS) {
    const { nb, lado, acordesDe, acordeEn, R } = opc, k = opc.k || {}, total = nb * 16;
    const kv = (id, d) => k[id] == null || k[id] === 'auto' || k[id] === '' ? d : k[id];
    const modo = MODOS[kv('s_modo', MODO_DE_ESTILO[opc.estilo] || 'descarga')] ? kv('s_modo', MODO_DE_ESTILO[opc.estilo] || 'descarga') : 'descarga', Mo = MODOS[modo];
    const forma = kv('s_forma', 'corrido'), dens = +kv('s_dens', 1), aireK = +kv('s_aire', 1), regOff = +kv('s_reg', 0), sube = +kv('s_sube', 0.8), motivo = +kv('s_motivo', 0.5), crom = Mo.crom * +kv('s_crom', 1);
    const techo = Math.min(88, +kv('s_techo', Mo.techo) + Math.max(0, regOff));
    const info = { modo, forma, fuentes: [] }, out = [];
    if (!MS || !MS.frases.length || nb < 1) return { notas: out, info };
    // el acorde de una nota: el de su lugar; en la zona del anticipo (el 4& del compás antes de un cambio), el que viene
    const posAnt = opc.anticipa ? (opc.posAnt || 14) : 99;
    const acordeDe = p => { const b = Math.floor(p / 16), q = p % 16; if (q >= posAnt) { const s = acordesDe(b + 1); if (s && s[0]) return s[0]; } return acordeEn(b, q); };
    const sigDe = p => { const b = Math.floor(p / 16), ch = acordeDe(p); for (let x = b; x <= b + 2; x++) for (const c of acordesDe(x) || []) if (c && ch && c.nombre !== ch.nombre) return c; return null; };
    const ladoDe = b => lado(((b % nb) + nb) % nb);
    const famEn = p => familia(acordeDe(p));
    // la intensidad a lo largo de la sección: sube hasta el clímax (el 85%) y ahí queda
    const inten = x => (1 - sube) * 0.45 + sube * (0.12 + 0.88 * Math.pow(Math.min(1, x / 0.85), 1.3));
    const centroDe = I => Mo.centro + regOff + Math.round(Mo.sube * I * (0.4 + 0.6 * sube));
    // los huecos de la trompeta: todo el solo, o (con coro) las claves que deja el coro
    const huecos = [];
    if (forma === 'coro') { const C = Math.max(1, +kv('s_coro', 1)) * 32; for (let t = 0; t < total; t += 2 * C) if (t + C < total) huecos.push([t + C - 2, Math.min(total, t + 2 * C) - 2]); }
    else huecos.push([0, total - (opc.final ? 4 : 2)]);
    // las frases candidatas del modo: por intérprete, por tipo de idea, por el toque (latino y funk, en corcheas derechas) y que
    // la frase quepa en el instrumento (el ancho)
    const quien = new Set(Mo.quien);
    // cada intérprete pesa parejo: el que tiene más frases transcriptas no se queda con el solo (Armstrong tiene 83 de las 297
    // del swing, y es el que más salta)
    const cuantas = {}; for (const f of MS.frases) cuantas[f.interprete] = (cuantas[f.interprete] || 0) + 1;
    const parejo = f => 1 / Math.sqrt(Math.max(1, (cuantas[f.interprete] || 1) / 25));
    const pesoBase = f => parejo(f) * (quien.has(f.interprete) ? 1 : f.inst === 'tp' || f.inst === 'cor' ? 0.25 : 0.12) * (Mo.ideas[f.idea] ?? 0.5) * (/LATIN|FUNK/.test(f.feel) ? 2 : 1)
      * (f.ancho > 19 ? Math.exp(-(f.ancho - 19) / 4) : 1) * Math.exp(-Math.max(0, f.xr - Mo.cromMeta * +kv('s_crom', 1)) * 8) * (f.baja < -2 ? Mo.baja : 1)
      // la línea como la de sus trompetistas: las frases mucho más saltonas que eso, menos
      * Math.exp(-Math.max(0, Mo.pasoMeta - 0.08 - f.paso) * 6);
    const pool = MS.frases.filter(f => f.len <= Mo.maxFrase + 8 && pesoBase(f) > 0.01);
    const usadas = new Set();
    let prev = null, ultima = null, pedales = 0, pedalEn = -99, grito = false, seguidas = 0;
    // la probabilidad de desarrollar la frase anterior: con el coro, más (las respuestas de la trompeta se contestan entre sí)
    const pDes = forma === 'coro' ? 0.8 : 0.45;   // la última nota tocada y la última frase (para desarrollarla)
    const tocar = (fr, inicio, I, extra = {}) => {
      // fr.ev con q desde el 1 de su primer compás; inicio: dónde cae ese 1
      const ns = [];
      for (const e of fr.ev) {
        const p = inicio + e.q; if (p < 0 || p >= extra.hasta) break;
        const T = acordeDe(p), q = p % 16; if (!T) continue;
        ns.push({ p, d: Math.max(1, Math.min(e.d, extra.hasta - p)), m: e.m + (extra.trans || 0), cat: e.cat, ra: e.ra, T, esc: escalaDe(T, sigDe(p)), fuerte: q % 4 === 0, fin: false });
      }
      if (ns.length < 2) return null;
      for (let i = 0; i + 1 < ns.length; i++) ns[i].d = Math.min(ns[i].d, ns[i + 1].p - ns[i].p);
      ns.at(-1).fin = true;
      if (extra.cierra) ns.at(-1).d = Math.max(ns.at(-1).d, Math.min(8, extra.hasta - ns.at(-1).p));
      if (extra.grito) {
        // la nota larga del grito: una corchea después de la frase, arriba de lo más agudo de la frase, del acorde
        const u = ns.at(-1), p = u.p + Math.max(2, Math.min(u.d, 4)), T = acordeDe(p);
        if (T && p + 8 <= extra.hasta) { u.d = Math.min(u.d, p - u.p); u.fin = false; ns.push({ p, d: Math.min(10, extra.hasta - p), m: Math.max(...ns.map(n => n.m)) + 3, cat: 'C', T, esc: escalaDe(T, sigDe(p)), fuerte: p % 4 === 0, fin: true, grito: true }); }
      }
      const centro = centroDe(I) + (extra.sube || 0), hi = extra.grito ? techo : Math.min(techo, Math.max(centro + 9, Mo.techo - 4 + Math.round(4 * I))), lo = Math.max(PISO, Math.min(centro - 11, hi - 14));
      const ms = acomodar(ns, { centro, lo, hi, prev: prev && { m: prev.m, gap: ns[0].p - prev.fin }, crom, blues: modo !== 'timba', forma: 1 });
      ns.forEach((n, i) => {
        n.m = ms[i];
        const g = TM.funcion(n.m, n.T);
        let v = 80 + 30 * I + (esAc(g) && n.fuerte ? 5 : 0) + (n.d >= 6 ? 6 : 0) + (i === 0 ? 4 : 0) + Math.round(R() * 8 - 4);
        if (n.d <= 1 && !n.fuerte) v -= 6;
        if (n.grito) v += 10;
        out.push({ p: n.p, L: n.d, ps: [n.m], v: Math.max(50, Math.min(124, Math.round(v))), art: n.grito || (n.d >= 6 && n.m >= centro + 4) ? '->' : '', ch: n.T });
      });
      const u = ns.at(-1); prev = { m: u.m, fin: u.p + u.d };
      return { fin: u.p + u.d, primera: ns[0].p };
    };
    // una frase nueva para el hueco [t, hasta): la del pool que mejor encaja en largo, densidad y clave, en el compás de t o el siguiente
    const nueva = (t, hasta, I, quiere) => {
      const dQ = Mo.dens * dens * (0.75 + 0.5 * I), cand = [];
      for (const f of pool) {
        if (usadas.has(f) || f.len > hasta - t + 2) continue;
        const wL = Math.exp(-(((f.len - quiere) / (quiere * 0.45)) ** 2)), wD = Math.exp(-(((f.dens - dQ) / (dQ * 0.4)) ** 2));
        const w0 = pesoBase(f) * wL * wD; if (w0 < 1e-4) continue;
        const parece = ini => { let a = 0; for (const e of f.ev) a += PARECE[e.fa + famEn(ini + e.q)] ?? 0.2; return a / f.ev.length; };
        // el primer compás de la frase cae en el compás de t o en el siguiente, en su lugar del compás o corrida medio compás (el
        // músico desplaza el lick: el 1 y el 3 son los dos tiempos fuertes); el lado de la clave de cada lugar y la espera
        const b0 = Math.floor((t - f.off) / 16);
        for (let b = b0 - 1; b <= b0 + 1; b++) for (const sh of [0, 8]) {
          const ini = b * 16 + sh, p0 = ini + f.off; if (p0 < t || p0 - t > 20 || ini + f.ev.at(-1).q >= hasta) continue;
          const fit = sh ? encaje(f.ev.map(e => ({ p: e.q + sh, d: e.d })), MS.clave, ladoDe(b)) : f.fit[ladoDe(b) === 'A' ? 0 : 1], espera = p0 - t;
          cand.push({ f, ini, w: w0 * (sh ? 0.7 : 1) * Math.exp(4 * fit * Math.min(1, f.n / 10)) * Math.exp(-espera / 6) * Math.exp(3 * (parece(ini) - 1)) });
        }
      }
      if (!cand.length) return null;
      cand.sort((a, b) => b.w - a.w);
      return elegir(R, cand.slice(0, 24), c => c.w);
    };
    // una célula de 3 a 5 notas, corrida 2 o 3 veces (con el ritmo corrido una corchea, o igual): la frase que se arma
    // la célula sigue el rumbo de su contorno (una secuencia: la que baja vuelve a empezar un poco más abajo, no salta arriba),
    // pegada a la anterior (sin un tiempo de silencio en el medio, que la cortaría en dos frases) y cierra en una nota larga
    const celula = fr => {
      const n = Math.min(fr.ev.length, 4 + Math.floor(R() * 2)), c = fr.ev.slice(0, n), span = c.at(-1).q + Math.max(2, Math.min(4, c.at(-1).d)) - c[0].q;
      const veces = span <= 10 ? 3 : 2, per = span + (span % 2), mov = c.at(-1).m - c[0].m, paso = mov ? Math.max(-4, Math.min(4, Math.round(mov / 2))) : (R() < 0.5 ? 2 : -2), ev = [];
      let corre = 0;
      for (let r = 0; r < veces; r++) { if (r && R() < 0.35) corre += 2; for (const e of c) ev.push({ ...e, q: e.q - c[0].q + r * per + corre + c[0].q, m: e.m + r * paso }); }
      for (let i = 0; i + 1 < ev.length; i++) ev[i].d = Math.max(1, Math.min(ev[i].d, ev[i + 1].q - ev[i].q));
      const u = ev.at(-1); u.cat = 'C'; u.d = Math.max(u.d, 4);
      return { ...fr, ev, len: u.q + u.d - ev[0].q, celula: true };
    };
    // la nota pedal que se estira sobre una clave (Chappottín en «Coralia», Ferguson c. 89-91): corcheas, después de a tres
    // corcheas (el tresillo en el lado 3), después en los tiempos del lado 2, y una nota larga
    // empezando en el lado 3: dos corcheas, el bombo y el ponche del tresillo, los tiempos del lado 2 y el anticipo del 4& ligado
    // (el anticipo desde un contratiempo anuncia el lado 3); empezando en el lado 2: sus tiempos, el tresillo y el ponche ligado
    const pedal = (b0) => {
      const qs = ladoDe(b0) === 'A' ? [0, 2, 6, 12, 20, 24, 30] : [4, 8, 16, 22, 28];
      const ev = qs.map((q, i) => ({ q, d: i + 1 < qs.length ? Math.max(2, qs[i + 1] - q - (qs[i + 1] - q > 3 ? 1 : 0)) : 8, m: 72, cat: 'C' }));
      return { ev, off: ev[0].q, len: ev.at(-1).q + 8 - ev[0].q, pedal: true, interprete: '', idea: 'rhythm' };
    };
    info.huecos = huecos.map(([a, b]) => [Math.max(0, a), Math.min(total, b + 2)]);
    for (const [h0, h1] of huecos) {
      let t = Math.max(0, h0 + (forma === 'coro' ? 0 : 2 + Math.floor(R() * 4)));
      while (t < h1 - 6) {
        const I = inten(t / total), quiere = Mo.frase[0] + (Mo.frase[1] - Mo.frase[0]) * (0.35 + 0.5 * I) * (0.7 + 0.6 * R());
        let fr = null, ini = null, extra = { hasta: h1 };
        const op = R();
        if (ultima && !ultima.pedal && seguidas < (forma === 'coro' ? 2 : 1) && op < motivo * pDes) {
          // desarrollo: la misma frase en la clave siguiente (secuencia en los acordes de acá), a veces más arriba o como célula
          fr = R() < Mo.celula * 2 && !ultima.celula ? celula(ultima) : ultima;
          if (fr.ev.length > 10 && !fr.celula && !fr.pedal) { const cut = Math.ceil(fr.ev.length * (0.4 + 0.25 * R())); fr = { ...fr, ev: fr.ev.slice(0, cut), len: fr.ev[cut - 1].q + fr.ev[cut - 1].d - fr.ev[0].q }; }
          let b = Math.floor(t / 16); while (b * 16 + fr.off < t || (ladoDe(b) !== ultima.lado && R() < 0.85)) b++;
          ini = b * 16; if (R() < 0.5) extra.sube = 2 + Math.floor(R() * 3);
          // lo desarrollado también tiene que estar en clave: si cruza, del otro lado; si tampoco, una frase nueva
          const enc = x => encaje(fr.ev.map(e => ({ p: e.q, d: e.d })), MS.clave, ladoDe(x / 16));
          if (enc(ini) < -0.12) ini = enc(ini + 16) > enc(ini) && ini + 16 + fr.ev.at(-1).q < h1 ? ini + 16 : -1;
          // si para desarrollar hay que esperar más de medio compás, mejor una frase nueva (no compases vacíos)
          if (ini < 0 || enc(ini) < -0.12 || ini + fr.ev.at(-1).q >= h1 || ini + fr.off - t > 8) fr = null; else { seguidas++; (info.ideas = info.ideas || []).push(fr.celula ? 'celula-desarrollo' : 'repite'); }
        } else if (pedales < Math.max(1, Math.floor(nb / 16)) && t / 16 - pedalEn >= 8 && op < motivo * pDes + Mo.pedal * (0.4 + I) && I > 0.45 && h1 - t >= 34) {
          // la nota pedal: una o dos por solo (investigación de salsa, R15)
          let b = Math.floor(t / 16); if (b * 16 < t) b++;
          fr = pedal(b); ini = b * 16; extra.sube = 3; pedales++; pedalEn = b; (info.ideas = info.ideas || []).push("pedal");
          if (ini + fr.ev.at(-1).q >= h1) fr = null;
        }
        if (!fr) {
          const c = nueva(t, h1, I, quiere); if (!c) { t += 4; continue; }
          fr = R() < Mo.celula * (1 - I * 0.5) ? celula(c.f) : c.f; ini = c.ini; usadas.add(c.f); seguidas = 0;
          if (c.f.interprete) info.fuentes.push(c.f.interprete);
          (info.ideas = info.ideas || []).push(fr.celula ? "celula" : c.f.idea);
        }
        // ¿es la última frase del hueco? cierra en una nota larga del acorde
        extra.cierra = forma !== 'coro' && ini + fr.len >= h1 - 10;
        // el clímax: la primera frase pasado el 72% del solo sube y remata con una nota larga y aguda (el «grito» de la trompeta
        // de salsa: Juancito Torres, la salsa brava; investigación de salsa, R23-R25 y R29)
        if (!grito && sube > 0.3 && ini >= 0.72 * total && !fr.pedal && ini + fr.len + 12 < h1) { grito = true; extra.sube = (extra.sube || 0) + 4; extra.grito = true; }
        const r = tocar(fr, ini, I, extra);
        if (!r) { t += 4; continue; }
        ultima = { ...fr, lado: ladoDe(Math.floor(ini / 16)) };
        // el aire: más al principio, menos en el clímax; con frase larga, un poco más (la trompeta respira)
        const aire = (Mo.aire[0] + (Mo.aire[1] - Mo.aire[0]) * R()) * aireK * (1.25 - 0.6 * I) + (r.fin - r.primera > 24 ? 3 : 0);
        t = r.fin + Math.max(2, Math.round(aire));
      }
    }
    out.sort((a, b) => a.p - b.p);
    for (let i = 0; i < out.length; i++) out[i].L = Math.max(1, Math.min(out[i].L, (out[i + 1] ? out[i + 1].p : total) - out[i].p));
    info.fuentes = [...new Set(info.fuentes)];
    return { notas: out.filter(e => e.p >= 0 && e.p < total), info };
  }

  // ---------- el jurado: los rasgos de un solo. notas: [{p, L, m}] en semicorcheas; ctx: { chEn(p) → acorde, ladoDe(p) → 'A'|'B'|null, clave }
  function rasgosSolo(notas, ctx) {
    const ns = notas.filter(n => n.m != null).slice().sort((a, b) => a.p - b.p), N = ns.length;
    if (N < 8) return null;
    const fn = ns.map(n => { const ch = ctx.chEn(n.p); return ch ? TM.funcion(n.m, ch) : null; });
    // dentro de la escala del acorde (o nota del acorde, o tensión); las demás son cromáticas
    const enEsc = ns.map((n, i) => { if (!fn[i]) return null; if (fn[i] !== 'X') return true; const ch = ctx.chEn(n.p); return escalaDe(ch, ctx.sigEn ? ctx.sigEn(n.p) : null).has(pc(n.m)); });
    const r = {};
    const prop = (xs, f) => xs.length ? xs.filter(f).length / xs.length : null;
    const idx = ns.map((_, i) => i).filter(i => fn[i]);
    r.acordeFuerte = prop(idx.filter(i => ns[i].p % 4 === 0), i => esAc(fn[i]));
    r.tension = prop(idx, i => fn[i] === 'T');
    r.escala = prop(idx, i => enEsc[i]);
    r.fueraLarga = prop(idx.filter(i => ns[i].L >= 4), i => !enEsc[i]);
    r.resuelve = prop(idx.filter(i => !enEsc[i] && ns[i + 1] && ns[i + 1].p - (ns[i].p + ns[i].L) < 4), i => Math.abs(ns[i + 1].m - ns[i].m) <= 2);
    // frases: un silencio de un tiempo corta
    const frases = []; let f = [];
    ns.forEach((n, i) => { if (f.length && n.p - (ns[i - 1].p + ns[i - 1].L) >= 4) { frases.push(f); f = []; } f.push(n); }); if (f.length) frases.push(f);
    const iv = []; for (const fr of frases) for (let i = 1; i < fr.length; i++) iv.push(fr[i].m - fr[i - 1].m);
    r.repite = prop(iv, d => d === 0); r.paso = prop(iv, d => Math.abs(d) >= 1 && Math.abs(d) <= 2); r.salto = prop(iv, d => Math.abs(d) >= 5); r.saltoGrande = prop(iv, d => Math.abs(d) > 9);
    const g = []; for (const fr of frases) for (let i = 2; i < fr.length; i++) { const a = fr[i - 1].m - fr[i - 2].m, b = fr[i].m - fr[i - 1].m; if (Math.abs(a) >= 5) g.push(Math.sign(b) === -Math.sign(a)); }
    r.rellena = prop(g, x => x);
    const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; }, pct = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
    const largoF = frases.map(fr => (fr.at(-1).p + fr.at(-1).L - fr[0].p) / 4);
    r.notasFrase = med(frases.map(fr => fr.length)); r.largoFrase = med(largoF); r.maxFrase = Math.max(...largoF);
    const span = ns.at(-1).p + ns.at(-1).L - ns[0].p, suena = ns.reduce((a, n) => a + n.L, 0);
    // con el coro, solo cuenta el tiempo de la trompeta (los huecos que deja el coro)
    const activo = ctx.huecos && ctx.huecos.length ? ctx.huecos.reduce((a, [x, y]) => a + Math.max(0, Math.min(y, ns.at(-1).p + ns.at(-1).L) - Math.max(x, ns[0].p)), 0) : span;
    r.aire = 1 - Math.min(1, suena / Math.max(1, activo));
    r.densidad = N / (Math.max(1, activo) / 4);
    if (ctx.forma === 'coro') { r.largoFrase = null; r.maxFrase = null; }
    const ioi = []; for (let i = 1; i < N; i++) ioi.push(ns[i].p - ns[i - 1].p);
    r.semicorcheas = prop(ioi, d => d === 1);
    r.contratiempo = prop(ns, n => n.p % 4 !== 0);
    const ms = ns.map(n => n.m);
    r.registro = med(ms); r.ambito = pct(ms, 0.95) - pct(ms, 0.05); r.agudas = prop(ms, m => m >= 84);
    const tercio = Math.floor(N / 3); r.sube = med(ms.slice(N - tercio)) - med(ms.slice(0, tercio));
    const mx = Math.max(...ms); r.climax = (ns.find(n => n.m === mx).p - ns[0].p) / span;
    // motivos: cuántos grupos de 3 intervalos seguidos (dentro de una frase) vuelven a aparecer en el solo
    const grams = new Map(); for (const fr of frases) for (let i = 3; i < fr.length; i++) { const key = [fr[i - 2].m - fr[i - 3].m, fr[i - 1].m - fr[i - 2].m, fr[i].m - fr[i - 1].m].join(','); grams.set(key, (grams.get(key) || 0) + 1); }
    const tg = [...grams.values()].reduce((a, b) => a + b, 0); r.motivos = tg ? [...grams.values()].filter(v => v > 1).reduce((a, b) => a + b, 0) / tg : null;
    r.cierre = prop(frases.filter(fr => ctx.chEn(fr.at(-1).p)), fr => { const x = TM.funcion(fr.at(-1).m, ctx.chEn(fr.at(-1).p)); return esAc(x) || x === 'T'; });
    const h = new Array(12).fill(0); for (const m of ms) h[pc(m)]++; r.entropia = -h.filter(Boolean).reduce((a, c) => a + (c / N) * Math.log2(c / N), 0);
    // la clave (solo con el lado de la clave): el encaje de todo el solo y las frases cruzadas
    if (ctx.ladoDe && ctx.clave) {
      const lado0 = ctx.ladoDe(0);
      r.clave = encaje(ns.map(n => ({ p: n.p, d: n.L })), ctx.clave, lado0);
      r.cruzadas = prop(frases.filter(fr => fr.length >= 3), fr => encaje(fr.map(n => ({ p: n.p, d: n.L })), ctx.clave, lado0) < -0.25);
    }
    // la naturalidad: qué tan probable es cada intervalo después del anterior, y cada duración después de la anterior en su lugar
    // del tiempo, según un modelo de los solos reales (modeloLinea): el promedio del logaritmo de la probabilidad
    if (ctx.modelo) { const M = ctx.modelo, a = [], b = [];
      for (const fr of frases) for (let i = 2; i < fr.length; i++) { a.push(M.iv(fr[i - 1].m - fr[i - 2].m, fr[i].m - fr[i - 1].m)); b.push(M.io(fr[i - 1].p - fr[i - 2].p, fr[i].p - fr[i - 1].p, fr[i - 1].p % 4)); }
      r.linea = a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; r.ritmo = b.length ? b.reduce((x, y) => x + y, 0) / b.length : null; }
    r.frases = frases.length; r.notas = N;
    return r;
  }
  // el modelo de la naturalidad: intervalos seguidos (de -12 a 12) y duraciones seguidas (de 1 a 8 semicorcheas, según dónde
  // cae la nota en el tiempo), contados en frases reales (cortadas por un silencio de un tiempo), con suavizado
  function modeloLinea(listas) {
    const CI = new Map(), CO = new Map(), ki = x => Math.max(-12, Math.min(12, x)), ko = x => Math.max(1, Math.min(8, x));
    const inc = (M, k) => M.set(k, (M.get(k) || 0) + 1);
    for (const ns of listas) for (let i = 2; i < ns.length; i++) {
      if (ns[i].p - (ns[i - 1].p + ns[i - 1].L) >= 4 || ns[i - 1].p - (ns[i - 2].p + ns[i - 2].L) >= 4) continue;
      const a = ki(ns[i - 1].m - ns[i - 2].m), b = ki(ns[i].m - ns[i - 1].m); inc(CI, a + ',' + b); inc(CI, a + ',*');
      const c = ko(ns[i - 1].p - ns[i - 2].p), d = ko(ns[i].p - ns[i - 1].p), q = ns[i - 1].p % 4; inc(CO, c + ',' + q + ',' + d); inc(CO, c + ',' + q + ',*');
    }
    return { iv: (a, b) => { a = ki(a); b = ki(b); return Math.log(((CI.get(a + ',' + b) || 0) + 0.5) / ((CI.get(a + ',*') || 0) + 12.5)); },
      io: (c, d, q) => { c = ko(c); d = ko(d); return Math.log(((CO.get(c + ',' + q + ',' + d) || 0) + 0.5) / ((CO.get(c + ',' + q + ',*') || 0) + 4)); } };
  }
  // qué mide cada rasgo, para el informe
  const RASGOS = {
    acordeFuerte: 'notas del acorde en los tiempos', tension: 'tensiones (9, 11, 13)', escala: 'notas de la escala del acorde', fueraLarga: 'notas largas cromáticas', resuelve: 'las cromáticas que resuelven por grado',
    repite: 'notas repetidas', paso: 'pasos de grado', salto: 'saltos de cuarta o más', saltoGrande: 'saltos de más de una sexta', rellena: 'después de un salto, vuelve',
    notasFrase: 'notas por frase', largoFrase: 'largo de frase (tiempos)', maxFrase: 'la frase más larga (tiempos)', aire: 'silencio', densidad: 'notas por tiempo', semicorcheas: 'semicorcheas seguidas',
    contratiempo: 'ataques fuera del tiempo', registro: 'nota media', ambito: 'ámbito (semitonos)', agudas: 'notas desde el Do6', sube: 'cuánto sube del primer tercio al último', climax: 'dónde está la nota más aguda',
    motivos: 'motivos que vuelven', cierre: 'frases que cierran en nota del acorde', entropia: 'variedad de notas (bits)', linea: 'naturalidad de la línea', ritmo: 'naturalidad del ritmo', clave: 'encaje con la clave', cruzadas: 'frases cruzadas'
  };
  // la referencia: el percentil 10, 50 y 90 de cada rasgo en un grupo de solos (rasgos ya medidos)
  function referenciaSolos(lista) {
    const ref = {};
    for (const k of Object.keys(RASGOS)) {
      const v = lista.map(r => r && r[k]).filter(x => x != null && isFinite(x)).sort((a, b) => a - b);
      if (v.length < 5) continue;
      const q = x => v[Math.min(v.length - 1, Math.floor(x * v.length))];
      ref[k] = { p10: q(0.1), p25: q(0.25), p50: q(0.5), p75: q(0.75), p90: q(0.9), n: v.length };
    }
    return ref;
  }
  // la nota de un solo: cada rasgo dentro de lo que hacen la mitad de los solistas reales (entre el percentil 25 y el 75) vale 1;
  // afuera, baja como una campana (la desviación, la de una normal con ese percentil 10 y 90). Más las reglas que no admiten discusión (investigación de salsa, R31): nada largo fuera del acorde,
  // respirar, no pasar el techo, no cruzar la clave
  // los rubros: la nota es la media geométrica de los cinco (si uno falla, la nota cae); cada rasgo vale por su distancia a lo
  // normal. Los de un solo lado: estar más en clave, cerrar más en nota del acorde o resolver más no es malo
  const RUBROS = { armonia: ['acordeFuerte', 'tension', 'escala', 'fueraLarga', 'resuelve', 'cierre'], linea: ['repite', 'paso', 'salto', 'saltoGrande', 'rellena', 'linea', 'entropia'],
    fraseo: ['notasFrase', 'largoFrase', 'maxFrase', 'aire', 'densidad', 'ritmo', 'semicorcheas', 'contratiempo'], arco: ['registro', 'ambito', 'agudas', 'sube', 'climax', 'motivos'], clave: ['clave', 'cruzadas'] };
  const UN_LADO = { clave: 'bajo', cierre: 'bajo', resuelve: 'bajo', sube: 'bajo', fueraLarga: 'alto', cruzadas: 'alto', saltoGrande: 'alto', agudas: 'alto' };
  function juzgarSolo(r, ref, o = {}) {
    if (!r) return { nota: 0, detalle: [], faltas: ['menos de 8 notas'], rubros: {} };
    const det = [];
    for (const [k, R0] of Object.entries(ref)) {
      if (r[k] == null) continue;
      const aj = (o.ajuste || {})[k] || 0, R_ = aj ? { ...R0, p10: R0.p10 + aj, p25: R0.p25 + aj, p50: R0.p50 + aj, p75: R0.p75 + aj, p90: R0.p90 + aj } : R0;
      const sigma = Math.max(1e-6, (R_.p90 - R_.p10) / 2.56), x = r[k];
      let fuera = x < R_.p25 ? R_.p25 - x : x > R_.p75 ? x - R_.p75 : 0;
      if ((UN_LADO[k] === 'bajo' && x > R_.p75) || (UN_LADO[k] === 'alto' && x < R_.p25)) fuera = 0;
      det.push({ k, x, s: Math.exp(-0.5 * (fuera / sigma) ** 2), ...R_ });
    }
    const rubros = {};
    for (const [ru, ks] of Object.entries(RUBROS)) { const v = det.filter(d => ks.includes(d.k)); if (v.length) rubros[ru] = v.reduce((a, d) => a + d.s, 0) / v.length; }
    const faltas = [];
    if (r.fueraLarga > 0.4) faltas.push('notas largas fuera del acorde');
    if (r.maxFrase > (o.maxFrase || 32)) faltas.push('una frase de más de ' + (o.maxFrase || 32) + ' tiempos sin respirar');
    if (o.techo && r.agudas > 0 && o.techo < 84) faltas.push('pasa el techo');
    if (r.cruzadas != null && r.cruzadas > 0.34) faltas.push('muchas frases cruzadas');
    const vs = Object.values(rubros), geo = vs.length ? Math.exp(vs.reduce((a, v) => a + Math.log(Math.max(1e-3, v)), 0) / vs.length) : 0;
    return { nota: +(10 * geo * Math.pow(0.85, faltas.length)).toFixed(2), detalle: det, faltas, rubros };
  }

  // ---------- la clave de los vientos reales, para el jurado: el encaje de cada tema de salsa y timba con la clave segura, y la
  // parte de sus ciclos cruzados, medidos con lo que se aprendió de la otra mitad de los temas (así no se mide con lo que aprendió
  // de sí mismo)
  function referenciaClave(fuentes) {
    const conLado = (fuentes || []).filter(f => ['salsa', 'cubano', 'timba'].includes(f.estilo) && f.analisis && ['clave', 'declarado'].includes(f.analisis.ladoFuente) && (f.vientos || []).length);
    const mitad = [conLado.filter((_, i) => i % 2 === 0), conLado.filter((_, i) => i % 2 === 1)], L = mitad.map(m => aprenderClave(m)), filas = [];
    mitad.forEach((m, i) => {
      for (const f of m) {
        const ciclos = (f.vientos || []).map(c => { const porP = new Map(); for (const [p, d, mm] of c.e) if (!porP.has(p) || porP.get(p).m < mm) porP.set(p, { p, d, m: mm }); return [...porP.values()].sort((a, b) => a.p - b.p); }).filter(ev => ev.length >= 3);
        if (ciclos.length < 4) continue;
        filas.push({ clave: encaje(ciclos.flat(), L[1 - i], 'A'), cruzadas: ciclos.filter(ev => encaje(ev, L[1 - i], 'A') < -0.25).length / ciclos.length });
      }
    });
    return { ...referenciaSolos(filas), temas: filas.length };
  }

  // ---------- el jurado armado: la referencia de los trompetistas (tramos de 16 compases con tempo de 140 a 280, como la salsa; el
  // arco, de los solos enteros), la de cada modo (sus trompetistas, si hay 30 tramos o más: el son, contra los de la era del swing),
  // la clave (referenciaClave) y la naturalidad (un modelo de la mitad de los solos; cada solo real, medido con el de la otra mitad)
  function prepararJurado(MS, fuentesBase) {
    const notasDe = s => s.notas.map(n => ({ p: n.p, L: n.d, m: n.m }));
    const tps = MS.solos.filter(s => s.inst === 'tp' || s.inst === 'cor');
    const modelos = [0, 1].map(par => modeloLinea(tps.filter((_, i) => i % 2 === par).map(notasDe)));
    const tramos = [], enteros = [];
    tps.forEach((s, i) => {
      if (s.tempo < 140 || s.tempo > 280) return;
      const ns = notasDe(s), fin = ns.length ? ns[ns.length - 1].p : 0, modelo = modelos[1 - i % 2];
      const e = rasgosSolo(ns, { chEn: s.chEn, sigEn: s.sigEn, modelo }); if (e) enteros.push(e);
      for (let t = 0; t + 256 <= fin + 16; t += 256) {
        const w = ns.filter(n => n.p >= t && n.p < t + 256).map(n => ({ ...n, p: n.p - t }));
        const r = rasgosSolo(w, { chEn: p => s.chEn(p + t), sigEn: p => s.sigEn(p + t), modelo }); if (r) tramos.push({ r, s });
      }
    });
    const ref = referenciaSolos(tramos.map(x => x.r)), refE = referenciaSolos(enteros), rc = MS.refClave || referenciaClave(fuentesBase);
    Object.assign(ref, { sube: refE.sube, climax: refE.climax, clave: rc.clave, cruzadas: rc.cruzadas });
    const refModo = {};
    for (const [m, Mo] of Object.entries(MODOS)) { const q = new Set(Mo.quien), l = tramos.filter(x => q.has(x.s.interprete)); refModo[m] = l.length >= 30 ? { ...referenciaSolos(l.map(x => x.r)), sube: ref.sube, climax: ref.climax, clave: ref.clave, cruzadas: ref.cruzadas } : ref; }
    // ctx: { chEn, sigEn, ladoDe }; notas: [{p, L, m}]
    const juzgar = (notas, ctx, modo) => { const r = rasgosSolo(notas, { ...ctx, clave: MS.clave, modelo: modelos[0] }); return { r, ...juzgarSolo(r, refModo[modo] || ref, { techo: (MODOS[modo] || {}).techo, ajuste: (MODOS[modo] || {}).jurado }) }; };
    return { ref, refModo, modelos, tramos, juzgar, temasClave: rc.temas || null };
  }

  // ---------- las perillas del solo (van con las del motor: TM.PERILLAS_UI y TM.PERILLAS)
  const G = 'Solo de trompeta';
  const PERILLAS_SOLO = [
    { g: G, id: 's_modo', l: 'Cómo sopla', tipo: 'sel', def: 'auto', ops: [['auto', 'según el estilo de la sección'], ...Object.entries(MODOS).map(([k, m]) => [k, m.n])], h: 'El modo del solista: de quién aprende, el largo de las frases, el registro y el cromatismo. Son: Chappottín y el septeto; descarga: Chocolate Armenteros; salsa brava: Nueva York; timba: el vocabulario de jazz en el agudo; latin jazz: bebop sobre el montuno' },
    { g: G, id: 's_forma', l: 'Forma', tipo: 'sel', def: 'corrido', ops: [['corrido', 'solo corrido'], ['coro', 'alterna con el coro (la trompeta en los huecos)']], h: 'Corrido: la trompeta sola toda la sección. Con el coro: el coro canta una clave (o dos) y la trompeta contesta en la siguiente, como en el son (Ferguson: «llamada y respuesta»)' },
    { g: G, id: 's_coro', l: 'Largo del coro', tipo: 'sel', def: '1', ops: [['1', 'una clave de coro, una de trompeta'], ['2', 'dos claves de coro, dos de trompeta']], h: 'Con la forma «alterna con el coro»: cuánto dura cada coro (y cada respuesta de la trompeta)' },
    { g: G, id: 's_detras', l: 'Detrás del solo', tipo: 'sel', def: 'auto', ops: [['auto', 'según el modo'], ['nada', 'nada: los vientos callan'], ['fondo', 'fondo (notas largas)'], ['moña', 'moña en la segunda mitad']], h: 'Qué hacen los demás vientos mientras sopla la trompeta: callan (el son), notas largas suaves, o una moña que entra en la segunda mitad y empuja el clímax' },
    { g: G, id: 's_dens', l: 'Densidad', min: 0.6, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Frases con menos notas (más aire adentro) o más cargadas' },
    { g: G, id: 's_aire', l: 'Aire entre frases', min: 0.4, max: 2, st: 0.05, def: 1, f: 'x', h: 'El silencio entre una frase y la siguiente (la trompeta respira)' },
    { g: G, id: 's_reg', l: 'Registro', min: -7, max: 7, st: 1, def: 0, f: '±st', h: 'Corre todo el solo hacia el grave o el agudo' },
    { g: G, id: 's_techo', l: 'Techo', tipo: 'sel', def: 'auto', ops: [['auto', 'según el modo'], ['77', 'Fa5 (el septeto)'], ['79', 'Sol5'], ['82', 'La♯5'], ['84', 'Do6'], ['86', 'Re6'], ['88', 'Mi6 (el agudo de la timba)']], h: 'La nota más aguda del solo (sonido real). El cuerpo del solo va de Sol3 a Sol5 y el clímax sube hasta el techo' },
    { g: G, id: 's_sube', l: 'Construcción', min: 0, max: 1, st: 0.05, def: 0.8, f: '%', h: 'Cuánto crece el solo: arranca en el medio y con aire, y hacia el clímax (al 85% de la sección) sube de registro, carga más notas y respira menos' },
    { g: G, id: 's_motivo', l: 'Desarrollo', min: 0, max: 1, st: 0.05, def: 0.5, f: '%', h: 'Cuánto retoma lo que ya tocó: la frase anterior en los acordes nuevos (secuencia), más arriba, o una célula de 3 a 5 notas que se repite corrida' },
    { g: G, id: 's_crom', l: 'Cromatismo', min: 0, max: 2, st: 0.05, def: 1, f: 'x', h: 'Cuántas notas cromáticas (de paso y de aproximación) quedan: 1 es lo del modo (el son casi nada, el latin jazz bastante)' }
  ];
  if (TM.PERILLAS_UI && TM.PERILLAS) for (const p of PERILLAS_SOLO) if (!TM.PERILLAS_UI.some(x => x.id === p.id)) { TM.PERILLAS_UI.push(p); TM.PERILLAS[p.id] = p.def; }

  Object.assign(TM, { referenciaClave, prepararJurado, PERILLAS_SOLO, modeloLinea, escalaSolo: escalaDe, MODOS_SOLO: MODOS, MODO_SOLO_DE_ESTILO: MODO_DE_ESTILO, construirSolos, solear, acomodarSolo: acomodar, rasgosSolo, referenciaSolos, juzgarSolo, RASGOS_SOLO: RASGOS, RUBROS_SOLO: RUBROS, encajeClave: encaje, aprenderClave });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
