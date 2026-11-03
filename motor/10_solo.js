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
  const PISO = 55;
  // los golpes de la clave en cada lado (A: el lado 3, B: el lado 2), en semicorcheas: el 1, el bombo (2&) y el ponche (4) del lado
  // 3, el 2 y el 3 del lado 2; en la de rumba, el tercer golpe del lado 3 cae en el 4&
  const GOLPES = { son: { A: [0, 6, 12], B: [4, 8] }, rumba: { A: [0, 6, 14], B: [4, 8] } };   // Sol3 (sonido real): el piso del solo (investigación de salsa, R23)

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
    // los solos de salsa (de los MIDI de la base: solos_salsa.js) van con los de jazz, marcados, con el lado de la clave de su 1er compás
    const todos = [...B.solos, ...(B.salsa || []).map(x => ({ ...x, salsa: true }))];
    todos.forEach((s, si) => {
      const acs = s.acordes.map(([p, n]) => [p, n ? TM.acorde(n) : null]);
      const chEn = p => { let lo = 0, hi = acs.length - 1, r = null; while (lo <= hi) { const m = (lo + hi) >> 1; if (acs[m][0] <= p) { r = acs[m][1]; lo = m + 1; } else hi = m - 1; } return r; };
      const notas = s.notas.map(([p, d, m, f]) => ({ p, d, m, f, ch: chEn(p) }));
      const sigEn = p => { const ch = chEn(p); for (const [q, c] of acs) if (q > p && c && ch && c.nombre !== ch.nombre) return c; return null; };
      const escEn = p => escalaDe(chEn(p), sigEn(p));
      MS.solos.push({ id: s.id, interprete: s.interprete, tema: s.tema, inst: s.inst, feel: s.feel, tempo: s.tempo, notas, chEn, sigEn, ...(s.salsa ? { salsa: true, estilo: s.estilo } : {}) });
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
        // de un solo de salsa: el lado de la clave de su primer compás (el solo dice el de su compás 1; después alternan)
        const ladoF = s.salsa && s.lado ? ((b0 / 16) % 2 === 0 ? s.lado : s.lado === 'A' ? 'B' : 'A') : null;
        MS.frases.push({ s: si, p0: b0, interprete: s.interprete, inst: s.inst, feel: s.feel || '', idea: idea[gr.i[0]], ev, off: ev[0].q, len, n: ev.length, dens: ev.length / Math.max(1, len / 4),
          ...(s.salsa ? { salsa: true, lado: ladoF, estiloS: s.estilo } : {}),
          xr, paso: pasos / (ms.length - 1), raras: (r => r.sueltas + r.corridas * 0.5)(rarezas(ev.map(e => ({ p: e.q, L: e.d })))), baja: ms.at(-1) - ms[0], ancho: Math.max(...ms) - Math.min(...ms), fin: ev.at(-1).d,
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
        // en los golpes de la clave y en el 1, la nota es del acorde que suena (pedido del dueño): ni tensión ni de paso
        if (e.golpe && !e.T.pcs.includes(pc(x)) && !(o.golpes === 'tension' && g === 'T')) h += 30;
        if (e.golpe && e.antes && !e.antes.pcs.includes(pc(x))) h += 3;
        if (e.fin) h += esAc(g) ? (g === 'R' || g === '5' ? -0.6 : 0) : g === 'T' ? 1.5 : 5;
        const r = (x - o.centro) / 7; h += 0.18 * r * r;
        // el lick se transporta con el acorde, como lo hace un músico: cada nota guarda su grado sobre la raíz (el 3 sigue siendo
        // 3, el 9 sigue siendo 9); el Viterbi corrige solo lo que choca con el acorde nuevo
        if (e.ton) { if (o.tonica != null && pc(x - o.tonica) !== pc(e.m - e.ra)) h += 2.5; }
        else if (e.ra != null && pc(x - e.T.raiz) !== pc(e.m - e.ra)) h += 0.8;
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

  // ---------- las rarezas rítmicas de una lista de notas [{p, L}] (para elegir frases y para el jurado). En los vientos de salsa
  // de la base, el 92% de las notas cae en el tiempo o en el &; una semicorchea suelta (en la «e» o la «a», sin otra semicorchea
  // pegada) es el 2,8% de las notas y una nota larga que arranca en semicorchea, el 6%. En el jazz pasado a corcheas derechas son
  // el 8% y el 19%: el swing corre las notas (la corchea de swing escrita con puntillo, el anticipo de semicorchea)
  const suelta = (ns, i) => { const n = ns[i], a = ns[i - 1], b = ns[i + 1]; return ((n.p % 2) + 2) % 2 === 1 && !(a && n.p - a.p === 1) && !(b && b.p - n.p === 1); };
  const rarezas = ns => { let sueltas = 0, largas = 0, corridas = 0; ns.forEach((n, i) => { if (suelta(ns, i)) sueltas++; if (n.L >= 3) { largas++; if (n.p % 2) corridas++; } }); return { sueltas: ns.length ? sueltas / ns.length : 0, corridas: largas ? corridas / largas : 0 }; };

  // ---------- el supervisor rítmico: cada nota del solo en un lugar que tenga sentido en la salsa (en corcheas derechas, con la clave)
  // - una semicorchea suelta va a la corchea de antes (en el swing es la corchea que llegó tarde: la «a» es el & corrido, la «e» el
  //   tiempo); si no hay lugar, a la de después
  // - una nota larga no arranca en semicorchea: al final de una corrida de semicorcheas, la de antes se estira y la larga cae en la
  //   corchea; sola, va a la corchea de antes o de después
  // - adentro de la frase no quedan silencios de semicorchea: la nota dura hasta la siguiente (si sonaba la mitad o menos, picada:
  //   la negra que el trompetista toca corta se escribe negra con punto, no semicorchea y tres silencios)
  // - la última nota de la frase no queda cortada: dura por lo menos una corchea, y si hay lugar una negra; la que entra en el 4&
  //   (o en su «a») se liga al 1 del compás que sigue, como el anticipo de la salsa
  // fin(p): hasta dónde puede sonar una nota que empieza en p (el final de la sección o del hueco que deja el coro)
  function supervisar(out, fin) {
    out.sort((a, b) => a.p - b.p);
    const libre = (p, i) => p >= 0 && !out.some((x, j) => j !== i && x.p === p) && p < fin(out[i].p);
    for (let pasada = 0; pasada < 2; pasada++) for (let i = 0; i < out.length; i++) {
      const n = out[i], a = out[i - 1], b = out[i + 1];
      if (!(n.p % 2)) continue;
      const tras = a && n.p - a.p === 1, ultima = !b || b.p > n.p + 1;
      if (tras) {
        // al final de una corrida de semicorcheas: si termina en la «a» (y después hay lugar) o es larga, cae en la corchea que
        // sigue y la de antes se estira (el anticipo de la salsa es de corchea, no de semicorchea); si no, queda (la semicorchea
        // que lleva a la nota siguiente, o el par de semicorcheas en el tiempo)
        if (ultima && (n.p % 4 === 3 || n.L >= 3) && libre(n.p + 1, i)) { a.L = n.p + 1 - a.p; n.p += 1; n.L = Math.max(1, n.L - 1); }
        continue;
      }
      if (b && b.p - n.p === 1) continue;   // una semicorchea que lleva a la nota siguiente
      // suelta (o larga sola): a la corchea de antes, si no pisa a la anterior; si no, a la de después
      const antes = n.p - 1, despues = n.p + 1;
      if ((!a || a.p < antes) && libre(antes, i)) { if (a && a.p + a.L > antes) a.L = Math.max(1, antes - a.p); n.p = antes; n.L += 1; }
      else if ((!b || b.p > despues) && libre(despues, i)) { n.p = despues; n.L = Math.max(1, n.L - 1); }
    }
    out.sort((a, b) => a.p - b.p);
    for (let i = 0; i < out.length; i++) {
      const n = out[i], a = out[i - 1], b = out[i + 1], fn = fin(n.p), hasta = Math.min(b ? b.p : Infinity, fn), hueco = hasta - (n.p + n.L);
      // la última de la frase: la que sigue está a más de un tiempo de silencio, o entra el coro antes
      const ultima = !b || b.p - (n.p + n.L) >= 4 || fn < b.p;
      if (!ultima && hueco >= 1 && (hueco === 1 || b.p - n.p <= 4 && (hueco % 2 === 1 || n.L === 1)) && !(n.p % 2 && b.p - n.p >= 3)) {
        // un silencio de semicorchea (o una semicorchea y su silencio) adentro de la frase: hasta la siguiente; si sonaba la mitad o
        // menos, picada
        if (n.L * 2 <= b.p - n.p) n.art = n.art || '-.';
        n.L = b.p - n.p;
      } else if (ultima) {
        // la última de la frase no termina en semicorchea: va a la corchea que sigue (la de antes se estira); dura una corchea por lo
        // menos, una negra si hay lugar, y la del 4& (o su «a») se liga al 1 que sigue. Antes de la frase que sigue queda una corchea
        // de aire; antes del coro, hasta que entra
        if (n.p % 2 && n.p + 2 <= hasta) { if (a && a.p + a.L === n.p) a.L++; n.p++; n.L = Math.max(1, n.L - 1); }
        const q = n.p % 16, lugar = hasta - n.p - (b && fn >= b.p ? 2 : 0), quiere = q >= 14 ? 16 - q + 4 : n.L < 4 && lugar >= 6 ? 4 : 2;
        n.L = Math.max(n.L, Math.min(quiere, lugar));
      }
      n.L = Math.max(1, Math.min(n.L, hasta - n.p));
    }
    return out;
  }

  // ---------- las citas: melodías de dominio público que cualquiera reconoce (Chocolate Armenteros citaba boleros y standards en
  // sus descargas: Ortega, investigación de salsa R21). En do mayor o la menor, [semicorchea, duración, nota, el acorde que la
  // armoniza]; se tocan en la tonalidad del solo (la relativa si el modo no coincide), con el ritmo pasado por el supervisor
  const CITAS = [
    { n: 'La cucaracha', modo: 'mayor', ev: [[10, 2, 67, 'C'], [12, 2, 67, 'C'], [14, 2, 67, 'C'], [16, 4, 72, 'C'], [20, 6, 76, 'C'], [26, 2, 67, 'C'], [28, 2, 67, 'C'], [30, 2, 67, 'C'], [32, 4, 72, 'C'], [36, 8, 76, 'C']] },
    { n: 'Jingle Bells', modo: 'mayor', ev: [[0, 4, 76, 'C'], [4, 4, 76, 'C'], [8, 8, 76, 'C'], [16, 4, 76, 'C'], [20, 4, 76, 'C'], [24, 8, 76, 'C'], [32, 4, 76, 'C'], [36, 4, 79, 'C'], [40, 6, 72, 'C'], [46, 2, 74, 'G7'], [48, 12, 76, 'C']] },
    { n: 'Himno de la alegría', modo: 'mayor', ev: [[0, 4, 76, 'C'], [4, 4, 76, 'C'], [8, 4, 77, 'C'], [12, 4, 79, 'C'], [16, 4, 79, 'G7'], [20, 4, 77, 'G7'], [24, 4, 76, 'C'], [28, 4, 74, 'G7'], [32, 4, 72, 'C'], [36, 4, 72, 'C'], [40, 4, 74, 'G7'], [44, 4, 76, 'C'], [48, 6, 76, 'C'], [54, 2, 74, 'G7'], [56, 8, 74, 'G7']] },
    { n: 'Para Elisa', modo: 'menor', ev: [[0, 1, 76, 'E7'], [1, 1, 75, 'E7'], [2, 1, 76, 'E7'], [3, 1, 75, 'E7'], [4, 1, 76, 'E7'], [5, 1, 71, 'E7'], [6, 1, 74, 'E7'], [7, 1, 72, 'E7'], [8, 6, 69, 'Am']] },
    { n: 'When the Saints Go Marching In', modo: 'mayor', ev: [[4, 4, 72, 'C'], [8, 4, 76, 'C'], [12, 4, 77, 'C'], [16, 12, 79, 'C'], [36, 4, 72, 'C'], [40, 4, 76, 'C'], [44, 4, 77, 'C'], [48, 12, 79, 'C']] },
    { n: 'Estrellita (Twinkle, Twinkle)', modo: 'mayor', ev: [[0, 4, 72, 'C'], [4, 4, 72, 'C'], [8, 4, 79, 'C'], [12, 4, 79, 'C'], [16, 4, 81, 'F'], [20, 4, 81, 'F'], [24, 8, 79, 'C']] }
  ];
  // la tónica de una progresión: el acorde que más dura, el primero y el último, y el que tiene su dominante en la progresión
  function tonicaDe(acordes) {
    const pts = new Map(), raices = new Set(acordes.filter(Boolean).map(c => c.raiz)), dom = new Set(acordes.filter(c => c && ['7', '9', '7b9'].includes(c.q)).map(c => c.raiz));
    acordes.forEach((c, i) => { if (!c) return; const k = c.raiz + (/^m(?!aj)/.test(c.q) ? 'm' : ''); pts.set(k, (pts.get(k) || 0) + 1 + (i === 0 ? 1 : 0) + (i === acordes.length - 1 ? 2 : 0) + (dom.has((c.raiz + 7) % 12) ? 2 / Math.max(1, acordes.length / 8) : 0)); });
    let mejor = null; for (const [k, v] of pts) if (!mejor || v > mejor[1]) mejor = [k, v];
    if (!mejor) return { raiz: 0, menor: false };
    return { raiz: parseInt(mejor[0], 10), menor: mejor[0].endsWith('m'), raices };
  }
  // una frase de tema que guarda sus notas en la tonalidad (ton: el grado sobre la tónica, ra), con la categoría de cada nota en su acorde
  const frTonal = (ev, raTon, extra = {}) => {
    const out = ev.map((e, i) => {
      const g = TM.funcion(e.m, e.ch), sig = ev[i + 1];
      const cat = esAc(g) ? 'C' : g === 'T' ? 'T' : sig && Math.abs(sig.m - e.m) <= 2 && sig.m !== e.m && esAc(TM.funcion(sig.m, sig.ch)) ? 'A' : 'X';
      return { q: e.q, d: e.d, m: e.m, cat, ra: raTon, ton: true, fa: familia(e.ch) };
    });
    return { ev: out, off: out[0].q, len: out.at(-1).q + out.at(-1).d - out[0].q, n: out.length, interprete: '', idea: 'tema', ...extra };
  };
  const citaFrase = c => frTonal(c.ev.map(([q, d, m, ch]) => ({ q, d, m, ch: TM.acorde(ch) })), c.modo === 'menor' ? 9 : 0, { cita: c.n, modoTon: c.modo });
  // el tema de la canción: la línea de arriba de la primera clave de los vientos de una sección (el mambo o la moña que ya sonó).
  // evs: [{p, L, ps}] desde el 1 de la sección; acordeEn(p) el acorde que suena; tonica: la de esa sección
  // lo cantable de una línea [{q, d, m}] (0 a 1): de 5 a 12 notas, tres alturas distintas o más, algo de movimiento por grado, un
  // ámbito de una cuarta a una octava, más de una duración y alguna síncopa. Un riff de golpes en negras sobre dos notas no es un tema
  const cantable = ev => {
    const n = ev.length; if (n < 4) return 0;
    const ms = ev.map(e => e.m), dist = new Set(ms.map(pc)).size, amb = Math.max(...ms) - Math.min(...ms);
    let pasos = 0; for (let i = 1; i < n; i++) { const d = Math.abs(ms[i] - ms[i - 1]); if (d >= 1 && d <= 2) pasos++; }
    const iois = new Set(ev.slice(1).map((e, i) => e.q - ev[i].q)), sinc = ev.filter(e => e.q % 4).length / n;
    return (n < 5 ? 0.5 : n > 12 ? Math.exp(-(n - 12) / 4) : 1) * Math.min(1, (dist - 1) / 2) * Math.min(1, 0.4 + 2 * pasos / (n - 1)) * (amb < 4 ? 0.3 : amb > 12 ? 0.6 : 1)
      * (iois.size >= 2 ? 1 : 0.4) * Math.min(1, 0.4 + 2 * sinc);
  };
  // el tema de la canción: de la línea de arriba de los vientos de una sección (evs: [{p, L, ps}] desde su 1; acordeEn(p): el acorde que
  // suena), la clave (dos compases desde un compás par) más cantable. Devuelve la frase con su nota de cantable (canta)
  function temaDeLinea(evs, acordeEn, tonica) {
    const xs = evs.filter(e => e.ps && e.ps.length).sort((a, b) => a.p - b.p); if (xs.length < 4) return null;
    let mejor = null;
    for (let b0 = 0; b0 * 16 <= xs.at(-1).p; b0 += 2) {
      const ev = [];
      for (const e of xs) { if (e.p < b0 * 16) continue; if (e.p - b0 * 16 >= 32) break; const ch = acordeEn(e.p); if (!ch) continue; if (ev.length && ev.at(-1).q === e.p - b0 * 16) continue; ev.push({ q: e.p - b0 * 16, d: Math.max(1, e.L), m: Math.max(...e.ps), ch }); }
      for (let i = 0; i + 1 < ev.length; i++) ev[i].d = Math.min(ev[i].d, ev[i + 1].q - ev[i].q);
      const c = cantable(ev); if (c > (mejor ? mejor.c : 0)) mejor = { ev, c };
    }
    if (!mejor || mejor.c < 0.35) return null;
    return frTonal(mejor.ev, tonica.raiz, { modoTon: tonica.menor ? 'menor' : 'mayor', deCancion: true, canta: mejor.c });
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
    const golpesK = kv('s_golpes', 'acorde'), golpes = GOLPES[opc.clave === 'rumba' ? 'rumba' : 'son'], golpeDe = p => { const b = Math.floor(p / 16), q = ((p % 16) + 16) % 16; return q === 0 || (golpes[ladoDe(b)] || []).includes(q); };
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
    const tradS = { son: 'cubano', timba: 'cubano', descarga: 'salsa', brava: 'salsa' }[modo];
    const pesoBase = f => parejo(f) * (f.salsa ? (modo === 'latinjazz' ? 1.5 : !tradS || (f.estiloS === 'salsa') === (tradS === 'salsa') ? 3 : 2) : quien.has(f.interprete) ? 1 : f.inst === 'tp' || f.inst === 'cor' ? 0.25 : 0.12) * (Mo.ideas[f.idea] ?? 0.5) * (/LATIN|FUNK/.test(f.feel) ? 2 : 1)
      * (f.ancho > 19 ? Math.exp(-(f.ancho - 19) / 4) : 1) * Math.exp(-Math.max(0, f.xr - Mo.cromMeta * +kv('s_crom', 1)) * 8) * (f.baja < -2 ? Mo.baja : 1)
      // la línea como la de sus trompetistas: las frases mucho más saltonas que eso, menos
      * Math.exp(-Math.max(0, Mo.pasoMeta - 0.08 - f.paso) * 6)
      // el ritmo de la salsa: las frases con semicorcheas sueltas o notas largas corridas, menos (el supervisor las acomoda igual)
      * Math.exp(-Math.max(0, f.raras - 0.05) * 8);
    const pool = MS.frases.filter(f => f.len <= Mo.maxFrase + 8 && pesoBase(f) > 0.01);
    const usadas = new Set();
    let prev = null, ultima = null, pedales = 0, pedalEn = -99, grito = false, seguidas = 0;
    // la probabilidad de desarrollar la frase anterior: con el coro, más (las respuestas de la trompeta se contestan entre sí)
    const pDes = forma === 'coro' ? 0.8 : 0.45;   // la última nota tocada y la última frase (para desarrollarla)
    const tocar = (fr, inicio, I, extra = {}) => {
      // fr.ev con q desde el 1 de su primer compás; inicio: dónde cae ese 1
      let ns = [];
      for (const e of fr.ev) {
        const p = inicio + e.q; if (p < 0 || p >= extra.hasta) break;
        ns.push({ p, d: Math.max(1, Math.min(e.d, extra.hasta - p)), m: e.m + (extra.trans || 0), cat: e.cat, ra: e.ra, ton: e.ton, crom: e.crom, fin: false });
      }
      if (ns.length < 2) return null;
      for (let i = 0; i + 1 < ns.length; i++) ns[i].d = Math.min(ns[i].d, ns[i + 1].p - ns[i].p);
      // el ritmo primero: la frase pasa por el supervisor rítmico antes de elegir las alturas, así cada nota tiene el acorde y el golpe
      // de la clave del lugar donde va a sonar
      { const xs = ns.map(n => ({ p: n.p, L: n.d, n })); supervisar(xs, () => extra.hasta); for (const x of xs) { x.n.p = x.p; x.n.d = x.L; if (x.art) x.n.art = x.art; } ns.sort((a, b) => a.p - b.p); }
      for (const n of ns) { n.T = acordeDe(n.p); n.esc = n.T && escalaDe(n.T, sigDe(n.p)); n.fuerte = n.p % 4 === 0; n.golpe = golpeDe(n.p); const q = n.p % 16; if (q >= posAnt && q < 14) n.antes = acordeEn(Math.floor(n.p / 16), q); }
      ns = ns.filter(n => n.T); if (ns.length < 2) return null;
      ns.at(-1).fin = true;
      if (extra.cierra) ns.at(-1).d = Math.max(ns.at(-1).d, Math.min(8, extra.hasta - ns.at(-1).p));
      if (extra.grito) {
        // la nota larga del grito: una corchea después de la frase, arriba de lo más agudo de la frase, del acorde
        const u = ns.at(-1), p0 = u.p + Math.max(2, Math.min(u.d, 4)), p = p0 + (p0 % 2), T = acordeDe(p);
        if (T && p + 8 <= extra.hasta) { u.d = Math.min(u.d, p - u.p); u.fin = false; ns.push({ p, d: Math.min(10, extra.hasta - p), m: Math.max(...ns.map(n => n.m)) + 3, cat: 'C', T, esc: escalaDe(T, sigDe(p)), fuerte: p % 4 === 0, golpe: true, fin: true, grito: true }); }
      }
      const centro = centroDe(I) + (extra.sube || 0), hi = extra.grito ? techo : Math.min(techo, Math.max(centro + 9, Mo.techo - 4 + Math.round(4 * I))), lo = Math.max(PISO, Math.min(centro - 11, hi - 14));
      const tonT = fr.modoTon ? (fr.modoTon === 'menor') === tonica.menor ? tonica.raiz : fr.modoTon === 'mayor' ? tonica.raiz + 3 : tonica.raiz + 9 : null;
      const ms = acomodar(ns, { centro, lo, hi, prev: prev && { m: prev.m, gap: ns[0].p - prev.fin }, crom, blues: modo !== 'timba', forma: 1, golpes: golpesK, tonica: tonT == null ? null : pc(tonT) });
      ns.forEach((n, i) => {
        n.m = ms[i];
        const g = TM.funcion(n.m, n.T);
        let v = 80 + 30 * I + (esAc(g) && n.fuerte ? 5 : 0) + (n.d >= 6 ? 6 : 0) + (i === 0 ? 4 : 0) + Math.round(R() * 8 - 4);
        if (n.d <= 1 && !n.fuerte) v -= 6;
        if (n.grito) v += 10;
        out.push({ p: n.p, L: n.d, ps: [n.m], v: Math.max(50, Math.min(124, Math.round(v))), art: n.grito || (n.d >= 6 && n.m >= centro + 4) ? '->' : n.art || '', ch: n.T });
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
          cand.push({ f, ini, w: w0 * (sh ? 0.7 : 1) * (f.lado ? (ladoDe(b) === f.lado && !sh ? 1.5 : 0.3) : 1) * Math.exp(4 * fit * Math.min(1, f.n / 10)) * Math.exp(-espera / 6) * Math.exp(3 * (parece(ini) - 1)) });
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
    info.golpes = golpesK; info.posAnt = posAnt;
    info.huecos = huecos.map(([a, b]) => [Math.max(0, a), Math.min(total, b + 2)]);
    // ---------- el tema del solo (el leitmotiv): se presenta en la primera frase, vuelve transformado cada tanto (igual en los acordes
    // de ahí, más arriba, su cabeza repetida en secuencia, corrido una corchea o medio compás, aumentado) y cierra el solo. Sale de la
    // canción (el mambo o la moña que ya sonó: la gente ya lo tiene en la oreja), de una frase cantable de un trompetista, o de una cita
    const tonica = tonicaDe(Array.from({ length: nb }, (_, b) => acordesDe(b)).flat());
    const temaK = kv('s_tema', 'auto'), citaK = +kv('s_cita', 0.25);
    const temaPropio = () => {
      const c = pool.filter(f => !usadas.has(f) && f.n >= 4 && f.n <= 9 && f.len >= 8 && f.len <= 30 && f.paso >= 0.45 && f.xr <= 0.12 && f.raras < 0.1 && f.ev.some(e => e.d >= 4));
      const x = c.length ? elegir(R, c, f => pesoBase(f) * Math.exp(4 * Math.max(...f.fit)) * cantable(f.ev) ** 2) : null; if (x) usadas.add(x); return x;
    };
    let tema = null;
    if (temaK !== 'ninguno') {
      if ((temaK === 'cancion' || temaK === 'auto') && opc.temaCancion) tema = opc.temaCancion;
      else if (temaK === 'cita') tema = citaFrase(CITAS[Math.floor(R() * CITAS.length)]);
      if (!tema) tema = temaPropio();
    }
    if (tema) info.tema = { de: tema.deCancion ? 'cancion' : tema.cita ? 'cita' : 'propio', cita: tema.cita || null, de2: tema.interprete || null, seccion: tema.seccion || null, vueltas: 0 };
    let temaEn = -99, temaLado = null, cerrado = false, citado = !!(tema && tema.cita);
    // una vuelta del tema: la transformación y el lugar (en clave: del mismo lado que la primera vez, si encaja)
    const variante = (k) => {
      if (k === 'arriba' || k === 'igual') return tema;
      if (k === 'cabeza') return celula(tema);
      if (k === 'corrido') { const sh = R() < 0.5 ? 2 : 8; return { ...tema, ev: tema.ev.map(e => ({ ...e, q: e.q + sh })), off: tema.off + sh }; }
      if (k === 'aumentado') { const mitad = tema.ev.slice(0, Math.max(3, Math.ceil(tema.ev.length / 2))), q0 = mitad[0].q; const ev = mitad.map(e => ({ ...e, q: q0 + (e.q - q0) * 2, d: e.d * 2 })); return { ...tema, ev, off: q0, len: ev.at(-1).q + ev.at(-1).d - q0 }; }
      return tema;
    };
    const ubicar = (fr, t, hasta, lado) => {
      let mejor = null;
      for (let b = Math.floor((t - fr.off) / 16); b <= Math.floor((t - fr.off) / 16) + 1; b++) {
        const ini = b * 16; if (ini + fr.off < t || ini + fr.off - t > 10 || ini + fr.ev.at(-1).q >= hasta) continue;
        const fit = encaje(fr.ev.map(e => ({ p: e.q, d: e.d })), MS.clave, ladoDe(b)), w = fit + (lado && ladoDe(b) === lado ? 0.1 : 0) - (ini + fr.off - t) / 16;
        if (!mejor || w > mejor.w) mejor = { ini, w };
      }
      return mejor && mejor.ini;
    };
    for (const [h0, h1] of huecos) {
      let t = Math.max(0, h0 + (forma === 'coro' ? 0 : 2 + Math.floor(R() * 4)));
      while (t < h1 - 6) {
        const I = inten(t / total), quiere = Mo.frase[0] + (Mo.frase[1] - Mo.frase[0]) * (0.35 + 0.5 * I) * (0.7 + 0.6 * R());
        let fr = null, ini = null, extra = { hasta: h1 };
        const op = R();
        // el tema: la primera frase; con el coro, casi siempre al empezar la respuesta; si no, cada 4 compases o más, según el desarrollo;
        // y la última frase del solo (cierra)
        const quedan = h1 - t, ultimaFrase = forma !== 'coro' && huecos.at(-1)[1] === h1 && tema && quedan <= tema.len + 14 && quedan >= tema.len + 2;
        // el tema suena por lo menos dos veces: si pasada la mitad del solo todavía no volvió, vuelve; y si no, cierra el solo
        const pocas = tema && info.tema.vueltas < 2, alCierre = ultimaFrase && !cerrado && (R() < 0.6 || pocas); if (ultimaFrase) cerrado = true;
        const toca = tema && (temaEn < -50 || alCierre || (pocas && t >= total * 0.55 && t / 16 - temaEn >= 4) || (forma === 'coro' && t === Math.max(0, h0) && t / 16 - temaEn >= 3 && R() < 0.5) || (forma !== 'coro' && t / 16 - temaEn >= 6 && R() < 0.15 + 0.3 * motivo));
        if (toca) {
          const k = temaEn < -50 ? 'igual' : alCierre ? (I > 0.7 ? 'arriba' : 'igual') : forma === 'coro' ? elegir(R, ['cabeza', 'arriba', 'corrido'], x => ({ cabeza: 2, arriba: 1, corrido: 0.7 })[x])
            : elegir(R, ['igual', 'arriba', 'cabeza', 'corrido', 'aumentado'], x => ({ igual: 0.8, arriba: 1, cabeza: 1.2, corrido: 0.7, aumentado: 0.5 })[x]);
          const v = variante(k), x = ubicar(v, t, h1, temaLado);
          if (x != null) { fr = v; ini = x; if (k === 'arriba') extra.sube = 4; if (temaEn < -50) temaLado = ladoDe(Math.floor(x / 16)); temaEn = x / 16; info.tema.vueltas++; (info.ideas = info.ideas || []).push('tema-' + k); seguidas = 0; }
        }
        // una cita (una por solo, en el medio): la melodía conocida en la tonalidad del solo
        if (!fr && !citado && citaK > 0 && t > total * 0.3 && t < total * 0.7 && R() < citaK * 0.6) {
          const c = citaFrase(CITAS[Math.floor(R() * CITAS.length)]), x = ubicar(c, t, h1, null);
          citado = true; if (x != null) { fr = c; ini = x; info.cita = c.cita; (info.ideas = info.ideas || []).push('cita'); }
        }
        if (fr) { /* el tema o la cita ya están */ }
        else if (ultima && !ultima.pedal && seguidas < (forma === 'coro' ? 2 : 1) && op < motivo * pDes) {
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
    const finDe = p => { for (const [a, b] of info.huecos) if (p >= a && p < b) return Math.min(total, b); return total; };
    supervisar(out, finDe);
    for (let i = 0; i < out.length; i++) out[i].L = Math.max(1, Math.min(out[i].L, (out[i + 1] ? out[i + 1].p : total) - out[i].p));
    // la regla de la clave, garantizada: en cada golpe de la clave (y en el 1) suena una nota del acorde. Si alguna quedó afuera
    // (el supervisor movió una nota de lugar), va a la nota del acorde más cercana, hacia donde iba la línea
    for (let i = 0; i < out.length; i++) {
      const n = out[i], T = acordeDe(n.p); if (!T || !golpeDe(n.p) || T.pcs.includes(pc(n.ps[0])) || (golpesK === 'tension' && TM.funcion(n.ps[0], T) === 'T')) continue;
      const a = out[i - 1], dir = a ? Math.sign(n.ps[0] - a.ps[0]) || 1 : 1;
      let mejor = null; for (let d = 1; d <= 4 && mejor == null; d++) for (const y of [n.ps[0] + d * dir, n.ps[0] - d * dir]) if (T.pcs.includes(pc(y)) && y >= PISO && y <= techo) { mejor = y; break; }
      if (mejor != null) { n.ps = [mejor]; n.ch = T; }
    }
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
    // el ritmo de la salsa (solo con la clave: el jazz no se juzga por esto); y en los golpes de la clave y en el 1, nota del acorde
    if (ctx.ladoDe) {
      const rz = rarezas(ns); r.sueltas = rz.sueltas; r.corridas = rz.corridas;
      const G = GOLPES[ctx.claveTipo === 'rumba' ? 'rumba' : 'son'], enGolpe = ns.filter(n => { const q = ((n.p % 16) + 16) % 16; return q === 0 || (G[ctx.ladoDe(n.p)] || []).includes(q); });
      r.golpes = enGolpe.length ? enGolpe.filter(n => { const ch = ctx.chEn(n.p); return ch && (ch.pcs.includes(pc(n.m)) || (ctx.golpes === 'tension' && TM.funcion(n.m, ch) === 'T')); }).length / enGolpe.length : null;
    }
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
    motivos: 'motivos que vuelven', cierre: 'frases que cierran en nota del acorde', entropia: 'variedad de notas (bits)', linea: 'naturalidad de la línea', ritmo: 'naturalidad del ritmo', sueltas: 'semicorcheas sueltas', golpes: 'notas del acorde en los golpes de la clave', corridas: 'notas largas que arrancan en semicorchea', clave: 'encaje con la clave', cruzadas: 'frases cruzadas'
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
  const RUBROS = { armonia: ['acordeFuerte', 'golpes', 'tension', 'escala', 'fueraLarga', 'resuelve', 'cierre'], linea: ['repite', 'paso', 'salto', 'saltoGrande', 'rellena', 'linea', 'entropia'],
    fraseo: ['notasFrase', 'largoFrase', 'maxFrase', 'aire', 'densidad', 'ritmo', 'semicorcheas', 'contratiempo'], arco: ['registro', 'ambito', 'agudas', 'sube', 'climax', 'motivos'], clave: ['clave', 'cruzadas', 'sueltas', 'corridas'] };
  // la naturalidad del ritmo se mide contra el jazz: tocar más derecho (más corcheas) que el jazz es lo de la salsa, no un defecto
  // las notas del acorde en los tiempos, más que el jazz: lo pide el dueño (en la clave, nota del acorde)
  const UN_LADO = { acordeFuerte: 'bajo', golpes: 'bajo', ritmo: 'bajo', sueltas: 'alto', corridas: 'alto', clave: 'bajo', cierre: 'bajo', resuelve: 'bajo', sube: 'bajo', fueraLarga: 'alto', cruzadas: 'alto', saltoGrande: 'alto', agudas: 'alto' };
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
    if (ref.sueltas && r.sueltas > ref.sueltas.p90 + 0.03) faltas.push('semicorcheas sueltas (notas corridas de lugar)');
    if (r.golpes != null && r.golpes < 0.9) faltas.push('notas fuera del acorde en los golpes de la clave');
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
        const rz = ciclos.map(ev => rarezas(ev.map(e => ({ p: e.p, L: e.d })))), nn = ciclos.reduce((a, ev) => a + ev.length, 0);
        // en los golpes de la clave (son: el ciclo empieza en el lado 3), ¿nota del acorde?
        let gN = 0, gOk = 0;
        for (const c of f.vientos || []) {
          const K = TM.acordesCiclo(c); if (!K.ok) continue;
          const porP = new Map(); for (const [p, d, mm] of c.e) if (!porP.has(p) || porP.get(p).m < mm) porP.set(p, { p, m: mm });
          for (const e of porP.values()) {
            const q = e.p % 16; if (!(q === 0 || GOLPES.son[e.p < 16 ? 'A' : 'B'].includes(q))) continue;
            const ch = q >= 14 ? (e.p < 16 ? K.A[1][0] : K.sig) || K.en(e.p) : K.en(e.p); if (!ch) continue;
            gN++; if (ch.pcs.includes(pc(e.m))) gOk++;
          }
        }
        filas.push({ clave: encaje(ciclos.flat(), L[1 - i], 'A'), cruzadas: ciclos.filter(ev => encaje(ev, L[1 - i], 'A') < -0.25).length / ciclos.length,
          sueltas: rz.reduce((a, x, k) => a + x.sueltas * ciclos[k].length, 0) / nn, corridas: rz.reduce((a, x) => a + x.corridas, 0) / rz.length, ...(gN >= 10 ? { golpes: gOk / gN } : {}) });
      }
    });
    return { ...referenciaSolos(filas), temas: filas.length };
  }

  // ---------- el jurado armado: la referencia de los trompetistas (tramos de 16 compases con tempo de 140 a 280, como la salsa; el
  // arco, de los solos enteros), la de cada modo (sus trompetistas, si hay 30 tramos o más: el son, contra los de la era del swing),
  // la clave (referenciaClave) y la naturalidad (un modelo de la mitad de los solos; cada solo real, medido con el de la otra mitad)
  function prepararJurado(MS, fuentesBase) {
    const notasDe = s => s.notas.map(n => ({ p: n.p, L: n.d, m: n.m }));
    const tps = MS.solos.filter(s => (s.inst === 'tp' || s.inst === 'cor') && !s.salsa);
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
    Object.assign(ref, { sube: refE.sube, climax: refE.climax, clave: rc.clave, cruzadas: rc.cruzadas, sueltas: rc.sueltas, corridas: rc.corridas, golpes: rc.golpes });
    const refModo = {};
    for (const [m, Mo] of Object.entries(MODOS)) { const q = new Set(Mo.quien), l = tramos.filter(x => q.has(x.s.interprete)); refModo[m] = l.length >= 30 ? { ...referenciaSolos(l.map(x => x.r)), sube: ref.sube, climax: ref.climax, clave: ref.clave, cruzadas: ref.cruzadas, sueltas: ref.sueltas, corridas: ref.corridas, golpes: ref.golpes } : ref; }
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
    { g: G, id: 's_tema', l: 'El tema del solo', tipo: 'sel', def: 'auto', ops: [['auto', 'el de la canción, si ya sonó un mambo o una moña; si no, uno propio'], ['cancion', 'el mambo o la moña de la canción'], ['propio', 'una frase cantable de un trompetista'], ['cita', 'una cita conocida'], ['ninguno', 'sin tema (frases sueltas)']], h: 'El motivo que el solo presenta al empezar, retoma transformado (en los acordes nuevos, más arriba, su cabeza en secuencia, corrido, aumentado) y repite para cerrar: lo que hace que el solo se reconozca. El de la canción es la línea de arriba del mambo o la moña de una sección anterior' },
    { g: G, id: 's_cita', l: 'Citas', min: 0, max: 1, st: 0.05, def: 0.25, f: '%', h: 'La probabilidad de que el solo cite, en el medio, una melodía conocida de dominio público (La cucaracha, Jingle Bells, el Himno de la alegría, Para Elisa, When the Saints, Estrellita), en la tonalidad del solo, como Chocolate Armenteros citaba boleros y standards' },
    { g: G, id: 's_golpes', l: 'En los golpes de la clave', tipo: 'sel', def: 'acorde', ops: [['acorde', 'solo notas del acorde'], ['tension', 'del acorde o tensiones (9, 11, 13)']], h: 'Qué nota suena en cada golpe de la clave y en el 1: solo notas del acorde que suena (raíz, 3a, 5a, 7a), o también sus tensiones, como los vientos de la base (ahí el 65% de esas notas es del acorde)' },
    { g: G, id: 's_crom', l: 'Cromatismo', min: 0, max: 2, st: 0.05, def: 1, f: 'x', h: 'Cuántas notas cromáticas (de paso y de aproximación) quedan: 1 es lo del modo (el son casi nada, el latin jazz bastante)' }
  ];
  if (TM.PERILLAS_UI && TM.PERILLAS) for (const p of PERILLAS_SOLO) if (!TM.PERILLAS_UI.some(x => x.id === p.id)) { TM.PERILLAS_UI.push(p); TM.PERILLAS[p.id] = p.def; }

  Object.assign(TM, { CITAS_SOLO: CITAS, tonicaDe, temaDeLinea, supervisarSolo: supervisar, rarezasRitmo: rarezas, referenciaClave, prepararJurado, PERILLAS_SOLO, modeloLinea, escalaSolo: escalaDe, MODOS_SOLO: MODOS, MODO_SOLO_DE_ESTILO: MODO_DE_ESTILO, construirSolos, solear, acomodarSolo: acomodar, rasgosSolo, referenciaSolos, juzgarSolo, RASGOS_SOLO: RASGOS, RUBROS_SOLO: RUBROS, encajeClave: encaje, aprenderClave });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
