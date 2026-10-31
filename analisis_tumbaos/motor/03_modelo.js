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
        const K = acordesCiclo(c); if (!K.ok) continue;
        const ev = c.e.map(([p, d, ps, v]) => { const t = TM.textura(ps); return { p, d, ps, v, top: t.top, t: TM.letraTextura(t), der: t.der, izq: t.izq }; }).sort((a, b) => a.p - b.p);
        // armonía de cada ataque (con anticipos)
        for (const e of ev) {
          const cur = K.en(e.p), sig = K.proximo(e.p);
          e.antic = anticipa(e.ps, e.top, cur, sig); e.ch = e.antic ? sig : cur;
          e.f = TM.funcion(e.top, e.ch);
        }
        const ritmo = new Array(32).fill('.'); for (const e of ev) ritmo[e.p] = e.t;
        P.ciclos.push({ f: f.id, estilo: f.estilo, seccion: f.seccion || null, grupo: f.grupo || null, c: c.c, ev, ritmo: ritmo.join(''), A: K.A, n: ev.length });
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
    M.resumen = {
      fuentes: fuentes.length, ciclosPiano: P.ciclos.length, ciclosBajo: B.ciclos.length, juegosPerc: M.perc.juegos.length,
      compasesPiano: P.ciclos.length * 2
    };
    return M;
  }

  Object.assign(TM, { construirModelo, acordesCiclo, familiaPerc, FAMILIAS });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
