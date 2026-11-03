/* =====================================================================
   MOTOR DE TUMBAOS · 3. MODELO
   Junta las fuentes elegidas y arma las tablas que usa el generador:
   - piano: células lado 3 | lado 2 reales, probabilidad de ataque y textura por posición, función armónica
     de la nota de arriba, intervalos, zigzag, enlace entre acordes, anticipos, registro, acentos
   - bajo: células con el rol de cada nota (raíz, quinta, anticipo de la raíz que viene, aproximación…)
   - percusión: juegos completos (un patrón por instrumento) clasificados por marcha
   ===================================================================== */
(function (TM) {
  'use strict';
  const pc = m => ((m % 12) + 12) % 12;
  const inc = (o, k, v = 1) => { o[k] = (o[k] || 0) + v; };
  const z16 = () => new Array(16).fill(0);
  const FAMILIAS = {
    clave: ['clave'], congas: ['congaO', 'congaS', 'congaH', 'muff', 'salidor', 'tresdos', 'quintoO', 'quintoS'],
    bongo: ['bongoH', 'bongoL', 'bongoM'], campanas: ['bell', 'bellC', 'bongoBell', 'bongoBellC', 'campana'],
    timbales: ['timbalH', 'timbalL', 'cascara', 'palito', 'block', 'plato'], guiro: ['guiroS', 'guiroL', 'maraca'],
    bateria: ['kick', 'bombo', 'snare', 'rim', 'hhC', 'hhO', 'hhP', 'ride', 'rideBell', 'crash', 'tomH', 'tomL']
  };
  const FAM_DE = {}; for (const f in FAMILIAS) for (const d of FAMILIAS[f]) FAM_DE[d] = f;
  const familiaPerc = d => FAM_DE[d] || 'timbales';

  // acorde que suena en una posición de un ciclo (0..31), y el siguiente (para los anticipos)
  function acordesCiclo(c) {
    const A = c.a.map(cs => cs.map(n => TM.acorde(n)).filter(Boolean));
    const sig = c.s ? TM.acorde(c.s) : null;
    const en = p => { const cs = A[p < 16 ? 0 : 1]; return cs.length > 1 && (p % 16) >= 8 ? cs[1] : cs[0]; };
    const proximo = p => {
      const k = p < 16 ? 0 : 1, cs = A[k], q = p % 16;
      if (q >= 12) return k === 0 ? A[1][0] : sig;
      if (cs.length > 1 && q >= 4 && q < 8) return cs[1];
      return null;
    };
    return { A, sig, en, proximo, ok: A[0].length > 0 && A[1].length > 0 };
  }
  const encaje = (ps, ch) => ch ? ps.filter(p => ch.pcs.includes(pc(p))).length / ps.length : 0;
  // el ataque ¿ya trae el acorde que viene?
  function anticipa(ps, top, cur, sig) {
    if (!sig || !cur || sig.nombre === cur.nombre) return false;
    const fc = encaje(ps, cur), fn = encaje(ps, sig), t = pc(top);
    return fn > fc || (fn === fc && sig.pcs.includes(t) && !cur.pcs.includes(t));
  }
  const plegar = d => ((d % 12) + 18) % 12 - 6;
  // un ciclo de piano de la base, leído: el acorde de cada ataque (con su anticipo), la textura y la nota de arriba
  function leerCiclo(c) {
    const K = acordesCiclo(c); if (!K.ok) return null;
    const ev = c.e.map(([p, d, ps, v]) => { const t = TM.textura(ps); return { p, d, ps, v, top: t.top, t: TM.letraTextura(t), der: t.der, izq: t.izq }; }).sort((a, b) => a.p - b.p);
    for (const e of ev) {
      const cur = K.en(e.p), sig = K.proximo(e.p);
      e.antic = anticipa(e.ps, e.top, cur, sig); e.ch = e.antic ? sig : cur;
      e.f = TM.funcion(e.top, e.ch);
    }
    return { K, ev };
  }

  // ---------- a qué estilos de la app se parece el piano de una fuente (para Opus): por el grupo de Toontrack, el género o el
  // estilo, y en la salsa por el artista: la brava (Nueva York y Puerto Rico, de los 60 a los 80) o la romántica de los 90.
  // Los géneros que no son salsa ni música cubana (merengue, cumbia, pop, bolero…) no entran, y el mambo de big band (el
  // género de los 50) tampoco: en la app, mambo es solo la sección donde tocan los vientos
  const ROMANTICA = /gilberto|marc anthony|frankie ruiz|jerry rivera|rey ruiz|cartagena|ana[ií]s|v[ií]ctor manuelle|tito rojas|eddie santiago|lalo rodr|huey dunbar|dark latin|\bdlg\b|\bindia\b|willie gonz|tito nieves|luis enrique|maelo|nino segarra|tony vega|jos[eé] alberto|charlie cruz|domingo qui|manny manuel|son by four|puro dolor|despacito|vivir mi vida|vivir lo nuestro|ricky martin|gloria estefan|jennifer lopez|chayanne|grupo niche|guayac[aá]n|orquesta de la luz/i;
  const BRAVA = /lavoe|willie col[oó]n|bl[aá]des|ismael rivera|gran combo|palmieri|fania|barretto|pacheco|celia|cheo|bobby valent|dimensi[oó]n latina|oscar d.?le[oó]n|richie ray|bobby cruz|roena|sonora ponce|joe arroyo|tito puente|larry harlow|ray sep|johnny colon|apollo|conjunto cl[aá]sico|sonora matancera|la rebeli/i;
  function estilosPiano(f) {
    const G = { son_montuno: ['sonmontuno', 'charanga'], salsa_media: ['salsabrava'], salsa_rapida: ['salsa', 'salsabrava'], songo: ['songo', 'pupy'], funk_cubano: ['tirso'] };
    if (f.grupo) return G[f.grupo] || [];
    const g = String(f.genero || '').toLowerCase(), t = String(f.titulo || f.archivo || '');
    if (/mambo|big band/.test(g) || /p[eé]rez prado|mambo n|mambo jambo|mambo!/i.test(t)) return [];
    if (g && !/salsa|son|guaracha|guajira|chachach|danz|charanga|timba|songo/.test(g)) return [];
    if (/chachach|danz|charanga/.test(g)) return ['charanga'];
    if (/^son|guaracha|guajira/.test(g)) return ['sonmontuno'];
    if (/rom[aá]ntica/.test(g)) return ['salsa'];
    // la timba de la base (secuencias de 1998): notas sueltas y díadas con la izquierda en décimas, la textura de Melón (Fiol)
    if (f.estilo === 'timba') return ['melon', 'pupy', 'tirso', 'songo'];
    if (f.estilo === 'otro') return [];
    if (f.estilo === 'cubano') return /mambo/i.test(t) ? [] : ['sonmontuno'];
    if (/pare cochero|aragón|charanga/i.test(t)) return ['charanga'];
    if (ROMANTICA.test(t)) return ['salsa'];
    if (BRAVA.test(t)) return ['salsabrava'];
    return ['salsabrava', 'salsa'];
  }
  // qué tan buen montuno es un ciclo para copiarlo: en su lado de la clave (no cruzado), con las notas largas en el acorde
  // que se detectó (si no, el acorde está mal leído) y una densidad de montuno
  const LLc = (v, p) => v.reduce((s, h, k) => s + (h ? Math.log(p[k]) : Math.log(1 - p[k])), 0);
  function calidadCiclo(ev, perfil) {
    const v = { A: new Array(16).fill(0), B: new Array(16).fill(0) };
    for (const e of ev) v[e.p < 16 ? 'A' : 'B'][e.p % 16] = 1;
    const clave = LLc(v.A, perfil.A) - LLc(v.A, perfil.B) + LLc(v.B, perfil.B) - LLc(v.B, perfil.A);
    const largas = ev.filter(e => e.d >= 2), bien = largas.filter(e => TM.funcion(e.top, e.ch) !== 'X').length;
    const nA = ev.filter(e => e.p < 16).length, nB = ev.length - nA;
    const dens = nA >= 3 && nB >= 3 && nA <= 10 && nB <= 10 ? 1 : 0.3;
    // un piano que hace también de bajo (notas debajo del mi2) no sirve para tocar con la banda
    const grave = ev.some(e => e.ps[0] < 40) ? 0.3 : 1;
    return { clave, acorde: largas.length ? bien / largas.length : 0.5, q: dens * grave * (1 / (1 + Math.exp(-clave))) * Math.pow(largas.length ? bien / largas.length : 0.5, 2) };
  }

  function construirModelo(fuentes) {
    const M = {
      fuentes: fuentes.map(f => f.id),
      piano: { ciclos: [], perfil: { A: z16(), B: z16() }, n: { A: 0, B: 0 }, tex: { A: Array.from({ length: 16 }, () => ({})), B: Array.from({ length: 16 }, () => ({})) },
        interior: {}, izq: {}, fun: { tiempo: {}, contra: {}, semi: {}, oct: {}, sola: {}, antic: {} }, intervalos: {}, salto: {}, enlace: {},
        anticipo: { A: [0, 0], B: [0, 0], liga: [0, 0], mitad: [0, 0] }, tops: [], vel: { A: z16(), B: z16() }, nvel: { A: z16(), B: z16() },
        ataques: 0, semis: 0, inner: [0, 0], legato: [0, 0] },
      bajo: { ciclos: [], perfil: { A: z16(), B: z16() }, n: { A: 0, B: 0 }, anticipo: {}, roles: {}, tops: [] },
      perc: { juegos: [] }
    };
    const P = M.piano;
    // ---------- piano
    for (const f of fuentes) {
      const porC = new Map((f.piano || []).map(c => [c.c, c]));
      const velVaria = (() => { const vs = (f.piano || []).flatMap(c => c.e.map(e => e[3])); if (vs.length < 20) return false; const m = vs.reduce((a, b) => a + b, 0) / vs.length; return Math.sqrt(vs.reduce((a, v) => a + (v - m) ** 2, 0) / vs.length) > 4; })();
      for (const c of f.piano || []) {
        const L0 = leerCiclo(c); if (!L0) continue;
        const { K, ev } = L0;
        const ritmo = new Array(32).fill('.'); for (const e of ev) ritmo[e.p] = e.t;
        P.ciclos.push({ f: f.id, estilo: f.estilo, seccion: f.seccion || null, grupo: f.grupo || null, c: c.c, ev, ritmo: ritmo.join(''), A: K.A, s: c.s || null, k: c.k || null, n: ev.length, velVaria });
        for (const L of ['A', 'B']) {
          P.n[L]++;
          for (const e of ev) {
            if ((e.p < 16) !== (L === 'A')) continue;
            const q = e.p % 16; P.perfil[L][q]++; inc(P.tex[L][q], e.t);
            if (velVaria) { P.vel[L][q] += e.v; P.nvel[L][q]++; }
          }
        }
        let prev = null, prevD = 0;
        for (let i = 0; i < ev.length; i++) {
          const e = ev[i];
          P.ataques++; if (e.p % 2) P.semis++;
          if (e.t === 'o') { P.inner[1]++; if (e.der === 'octava+1' || e.der === 'octava+2') { P.inner[0]++; const inn = e.ps.filter(x => x > e.top - 12 && x < e.top); if (inn.length) inc(P.interior, e.top - inn[inn.length - 1]); } }
          inc(P.izq, e.izq);
          inc(P.fun[e.p % 2 ? 'semi' : e.p % 4 === 0 ? 'tiempo' : 'contra'], e.f);
          inc(P.fun[e.t === 'o' ? 'oct' : 'sola'], e.f);
          if (e.antic) inc(P.fun.antic, e.f);
          P.tops.push(e.top);
          const nx = ev[i + 1], gap = (nx ? nx.p : 32) - e.p;
          P.legato[0] += Math.min(e.d, gap) / gap; P.legato[1]++;
          if (prev) {
            const d = e.top - prev.top, m = d % 12 === 0 ? 0 : d;
            inc(P.intervalos, Math.max(-12, Math.min(12, d)));
            if (Math.abs(prevD) >= 3 && m) inc(P.salto, Math.sign(m) === Math.sign(prevD) ? 'sigue' : Math.abs(m) <= 2 ? 'vuelvePaso' : 'vuelveSalto');
            if (m) prevD = m;
            if (prev.ch.nombre !== e.ch.nombre) { const fd = Math.abs(plegar(d)); inc(P.enlace, fd === 0 ? 'comun' : fd <= 2 ? 'paso' : fd <= 4 ? 'tercera' : 'cuarta'); }
          }
          prev = e;
        }
        // anticipos en el paso lado 3 → lado 2 y lado 2 → ciclo siguiente
        const pasos = [[0, K.A[0][K.A[0].length - 1], K.A[1][0], 'B', 16], [16, K.A[1][K.A[1].length - 1], K.sig, 'A', 32]];
        for (const [base, cur, sig, lado, fin] of pasos) {
          if (!sig || !cur || sig.nombre === cur.nombre) continue;
          P.anticipo[lado][1]++;
          const ult = ev.filter(e => e.p >= base + 12 && e.p < base + 16).pop();
          if (ult && ult.antic) {
            P.anticipo[lado][0]++;
            const sigEv = fin === 16 ? ev.filter(e => e.p >= 16) : ((porC.get(c.c + 2) || { e: [] }).e.map(x => ({ p: x[0] + 32 })));
            if (fin === 16 || porC.has(c.c + 2)) { P.anticipo.liga[1]++; if (!sigEv.some(e => e.p === fin)) P.anticipo.liga[0]++; }
          }
        }
        for (const k of [0, 1]) if (K.A[k].length > 1) { P.anticipo.mitad[1]++; const m = ev.filter(e => e.p >= 16 * k + 4 && e.p < 16 * k + 8).pop(); if (m && m.antic) P.anticipo.mitad[0]++; }
      }
    }
    const tp = P.tops.slice().sort((a, b) => a - b), q = x => tp.length ? tp[Math.floor(x * (tp.length - 1))] : 77;
    P.registro = { p10: q(0.1), p50: q(0.5), p90: q(0.9) };
    delete P.tops;
    for (const L of ['A', 'B']) {
      P.perfil[L] = P.perfil[L].map(x => (x + 0.5) / (P.n[L] + 1));
      const tot = P.vel[L].reduce((a, b) => a + b, 0) / (P.nvel[L].reduce((a, b) => a + b, 0) || 1);
      P.vel[L] = P.vel[L].map((v, k) => P.nvel[L][k] >= 5 ? v / P.nvel[L][k] / tot : 1);
    }
    delete P.nvel;
    P.densidad = { A: P.perfil.A.reduce((a, b) => a + b, 0), B: P.perfil.B.reduce((a, b) => a + b, 0) };
    P.tasaSemis = P.ataques ? P.semis / P.ataques : 0.02;
    P.tasaInterior = P.inner[1] ? P.inner[0] / P.inner[1] : 0.15;
    P.tasaLegato = P.legato[1] ? P.legato[0] / P.legato[1] : 0.8;
    const pr = (a, def) => a[1] >= 5 ? a[0] / a[1] : def;
    P.pAnticipo = { A: pr(P.anticipo.A, 0.72), B: pr(P.anticipo.B, 0.44), liga: pr(P.anticipo.liga, 0.79), mitad: pr(P.anticipo.mitad, 0.63) };

    // ---------- las frases enteras (Toontrack, _frases): para tocar un patrón tal cual
    P.frases = fuentes.filter(f => f.frase && f.frase.a && f.frase.a.length).map(f => ({ id: f.id, titulo: f.titulo, coleccion: f.coleccion || null, grupo: f.grupo || null, parte: f.parte || null, var: f.var || 0, seccion: f.seccion || null, frase: f.frase }));
    // ---------- Opus: montunos de pianista de dos o cuatro compases (uno o dos ciclos seguidos de un mismo tema), con a qué
    // estilos de la app se parecen, de qué parte del tema son (la de Toontrack, o la campana y los vientos del tema) y qué tan
    // buenos son para copiarlos. Salen de los ciclos de la base y de la biblioteca: los temas de las colecciones que la página no
    // carga enteros (f.opus, que arma construir.js)
    const meta = {}, porF = {};
    for (const f of fuentes) meta[f.id] = f;
    for (const c of P.ciclos) (porF[c.f] = porF[c.f] || []).push(c);
    for (const f of fuentes) if (f.opus) {
      for (const g of f.opus.fuentes || []) meta[g.id] = g;
      for (const c of f.opus.ciclos || []) {
        const L0 = leerCiclo(c); if (!L0) continue;
        const g = meta[c.f] || {};
        (porF[c.f] = porF[c.f] || []).push({ f: c.f, estilo: g.estilo, seccion: g.seccion || null, grupo: g.grupo || null, c: c.c, ev: L0.ev, A: L0.K.A, s: c.s || null, k: c.k || null, n: L0.ev.length, velVaria: !!g.velVaria });
      }
    }
    P.plantillas = [];
    for (const [fid, cs] of Object.entries(porF)) {
      const g = meta[fid] || {}, estilos = estilosPiano(g); if (!estilos.length) continue;
      cs.sort((a, b) => a.c - b.c);
      for (const c of cs) c.cal = calidadCiclo(c.ev, P.perfil);
      const buenos = cs.filter(c => c.cal.clave > -0.5 && c.cal.acorde >= 0.6);
      for (let i = 0; i < buenos.length; i++) {
        const c = buenos[i], n = buenos[i + 1], sec = g.seccion || ({ v: 'cuerpo', c: 'coro', m: 'mambo' })[c.k] || null, tt = g.coleccion === 'toontrack';
        P.plantillas.push({ id: fid + '#' + c.c, f: fid, titulo: g.titulo || fid, estilos, seccion: sec, tt, ciclos: [c], q: c.cal.q });
        if (n && n.c === c.c + 2) P.plantillas.push({ id: fid + '#' + c.c + '+', f: fid, titulo: g.titulo || fid, estilos, seccion: sec, tt, ciclos: [c, n], q: (c.cal.q + n.cal.q) / 2 });
      }
    }

    // ---------- bajo: rol de cada nota respecto del acorde (y del que viene)
    const B = M.bajo;
    for (const f of fuentes) for (const c of f.bajo || []) {
      const K = acordesCiclo(c); if (!K.ok) continue;
      const ev = []; let prev = null;
      for (const [p, d, alt, v] of c.e.slice().sort((a, b) => a[0] - b[0])) {
        const cur = K.en(p), q = p % 16, k = p < 16 ? 0 : 1, cs = K.A[k];
        const sig = q >= 10 ? (k === 0 ? K.A[1][0] : K.sig) : (cs.length > 1 && q >= 2 && q < 8 ? cs[1] : null);
        const x = pc(alt); let rol;
        if (sig && sig.raiz !== cur.raiz && x === sig.raiz) rol = 'R+';
        else if (x === cur.raiz) rol = 'R';
        else if (x === (cur.raiz + cur.fun.f) % 12) rol = '5';
        else if (cur.fun.t != null && x === (cur.raiz + cur.fun.t) % 12) rol = '3';
        else if (cur.fun.s != null && x === (cur.raiz + cur.fun.s) % 12) rol = '7';
        else if (sig && x === (sig.raiz + 11) % 12) rol = 'apB';
        else if (sig && x === (sig.raiz + 1) % 12) rol = 'apA';
        else if (sig && x === (sig.raiz + sig.fun.f) % 12) rol = '5+';
        else rol = 'i' + ((x - cur.raiz + 12) % 12);
        ev.push({ p, d, rol, dz: prev ? alt - prev : null, alt, v });
        inc(B.roles, rol); B.tops.push(alt);
        prev = alt;
      }
      // calidad: qué parte de las notas tiene un rol claro (si el acorde se detectó mal, quedan intervalos sueltos)
      const claros = ev.filter(e => /^(R|R\+|5|3|7|apB|apA|5\+)$/.test(e.rol)).length;
      B.ciclos.push({ f: f.id, estilo: f.estilo, ev, n: ev.length, calidad: ev.length ? claros / ev.length : 0, ritmo: ev.map(e => e.p).join(',') });
      for (const L of ['A', 'B']) { B.n[L]++; for (const e of ev) if ((e.p < 16) === (L === 'A')) B.perfil[L][e.p % 16]++; }
      for (const e of ev) if (e.rol === 'R+' && e.p % 16 >= 10) inc(B.anticipo, e.p % 16);
    }
    B.popularidad = {}; for (const c of B.ciclos) inc(B.popularidad, c.ritmo);
    for (const L of ['A', 'B']) B.perfil[L] = B.perfil[L].map(x => (x + 0.5) / (B.n[L] + 1));
    const bt = B.tops.sort((a, b) => a - b); B.registro = bt.length ? { p10: bt[Math.floor(0.1 * (bt.length - 1))], p50: bt[bt.length >> 1], p90: bt[Math.floor(0.9 * (bt.length - 1))] } : { p10: 31, p50: 38, p90: 45 };
    delete B.tops;

    // ---------- percusión: juegos con su marcha (por los instrumentos que suenan)
    for (const f of fuentes) for (const j of f.perc || []) {
      const hits = {}; let tot = 0;
      for (const d in j.k) { const n = (j.k[d].match(/\d/g) || []).length; hits[familiaPerc(d)] = (hits[familiaPerc(d)] || 0) + n; hits[d] = n; tot += n; }
      const h = k => hits[k] || 0;
      const tipo = (h('ride') + h('crash') >= 4 || (h('bell') >= 8 && h('bongoBell') >= 4)) ? 'mambo'
        : h('campanas') >= 4 ? 'marcha' : h('bongo') >= 8 ? 'cuerpo' : h('congas') >= 6 ? 'marcha' : 'otro';
      M.perc.juegos.push({ f: f.id, n: j.n, k: j.k, densidad: tot, tipo, lado: (f.analisis || {}).ladoFuente || 'sin' });
    }
    // los vientos (08_vientos.js), de las mismas fuentes; quien llama puede darle más (todos los temas con vientos)
    if (TM.construirVientos) M.vientos = TM.construirVientos(fuentes);
    M.resumen = {
      fuentes: fuentes.length, ciclosPiano: P.ciclos.length, ciclosBajo: B.ciclos.length, juegosPerc: M.perc.juegos.length,
      compasesPiano: P.ciclos.length * 2
    };
    return M;
  }

  Object.assign(TM, { construirModelo, acordesCiclo, familiaPerc, FAMILIAS, anticipaAtaque: anticipa, estilosPiano, calidadCiclo, leerCiclo });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
