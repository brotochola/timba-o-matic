/* =====================================================================
   MOTOR DE TUMBAOS · 2. ANÁLISIS
   De un MIDI a una «fuente»: los ciclos de clave (lado 3 | lado 2) del piano, del bajo y de la percusión.
   - pulso = corchea de salsa (16 por clave), elegido para que la negra real quede entre 130 y 260
   - fase: sigue la deriva de los archivos grabados en vivo (media circular de los ataques)
   - compás y lado de la clave: declarados, o por la clave de la percusión, o por el bajo + el ritmo del piano
   - acordes: declarados, o detectados por compás (o por mitad) con piano y bajo
   ===================================================================== */
(function (TM) {
  'use strict';
  const NOM = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const nom = m => NOM[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const pc = m => ((m % 12) + 12) % 12;
  const GRADO = ['1', 'b9', '9', 'b3', '3', '11', '#11', '5', 'b13', '13', 'b7', '7'];
  const CLAVES = { son: [0, 3, 6, 10, 12], rumba: [0, 3, 7, 10, 12] };   // en pulsos, desde el 1 del lado 3
  const BAJO = [12, 1, 3, 35, 9, 1, 34, 2].map(v => Math.log(v + 1));   // perfil del bajo de tumbao (2& y 4)

  // ---------- acordes: nombre → raíz, notas y función de cada grado
  const INTERVALOS = {
    '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], M7: [0, 4, 7, 11], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9],
    9: [0, 4, 7, 10, 2], m9: [0, 3, 7, 10, 2], '7b9': [0, 4, 7, 10, 1], dim7: [0, 3, 6, 9], '°7': [0, 3, 6, 9], dim: [0, 3, 6], '°': [0, 3, 6],
    m7b5: [0, 3, 6, 10], 'ø': [0, 3, 6, 10], sus4: [0, 5, 7], '7sus4': [0, 5, 7, 10], aug: [0, 4, 8], '+': [0, 4, 8], 5: [0, 7]
  };
  // t = 3a, f = 5a, s = 7a (o 6a), T = tensiones que suenan bien sobre ese acorde
  const FUNCIONES = {
    '': { t: 4, f: 7, s: null, T: [2, 9, 11] }, m: { t: 3, f: 7, s: null, T: [2, 5, 10] }, 7: { t: 4, f: 7, s: 10, T: [2, 9] },
    m7: { t: 3, f: 7, s: 10, T: [2, 5] }, maj7: { t: 4, f: 7, s: 11, T: [2, 9] }, 6: { t: 4, f: 7, s: 9, T: [2] }, m6: { t: 3, f: 7, s: 9, T: [2, 5] },
    9: { t: 4, f: 7, s: 10, T: [2, 9] }, m9: { t: 3, f: 7, s: 10, T: [2, 5] }, '7b9': { t: 4, f: 7, s: 10, T: [1, 9] },
    dim7: { t: 3, f: 6, s: 9, T: [] }, dim: { t: 3, f: 6, s: null, T: [] }, m7b5: { t: 3, f: 6, s: 10, T: [5, 8] },
    sus4: { t: 5, f: 7, s: null, T: [2, 9, 10] }, '7sus4': { t: 5, f: 7, s: 10, T: [2, 9] }, aug: { t: 4, f: 8, s: null, T: [2, 10] }, 5: { t: null, f: 7, s: null, T: [2, 5] }
  };
  const ALIAS_Q = { M7: 'maj7', '°7': 'dim7', '°': 'dim', 'ø': 'm7b5', '+': 'aug', min: 'm', '-': 'm' };
  const RAIZ = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const cacheAcordes = new Map();
  function acorde(nombre) {
    if (!nombre) return null;
    if (cacheAcordes.has(nombre)) return cacheAcordes.get(nombre);
    const m = /^([A-G])([#b]?)(.*)$/.exec(String(nombre).trim());
    if (!m) return null;
    let q = m[3].replace(/^:/, ''); q = ALIAS_Q[q] ?? q;
    if (!(q in INTERVALOS)) return null;
    const raiz = (RAIZ[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
    const ch = { nombre: NOM[raiz] + q, raiz, q, pcs: [...new Set(INTERVALOS[q].map(i => (i + raiz) % 12))], fun: FUNCIONES[q] };
    cacheAcordes.set(nombre, ch);
    return ch;
  }
  // función de una nota dentro del acorde: R, 3, 5, 7, T (tensión) o X (cromática / alterada)
  function funcion(nota, ch) {
    const iv = (pc(nota) - ch.raiz + 12) % 12, F = ch.fun;
    if (iv === 0) return 'R'; if (iv === F.t) return '3'; if (iv === F.f) return '5';
    if (F.s != null && iv === F.s) return '7'; if (F.T.includes(iv)) return 'T'; return 'X';
  }
  // progresión escrita: "Am7 D7 | Gmaj7 C+B7" → un compás por ficha, "+" = dos acordes en el compás
  function leerProgresion(s) {
    return String(s || '').trim().split(/[\s|]+/).filter(Boolean).map(f => f.split('+').map(t => {
      const c = acorde(t); if (!c) throw new Error('Acorde no reconocido: «' + t + '»'); return c;
    }));
  }

  // ---------- pulso y fase
  function pulsos(s) {
    const q = s.ppq, ts = s.tempos.length ? s.tempos : [{ tick: 0, uspq: 500000 }];
    const segs = [];
    for (const t of ts) {
      const bpm = 60e6 / t.uspq, real = x => bpm * q / (2 * x), cur = segs[segs.length - 1];
      if (cur && real(cur.P) >= 120 && real(cur.P) <= 270) continue;
      let P = q; while (real(P) < 130) P /= 2; while (real(P) > 260) P *= 2;
      if (cur && cur.P === P) continue;
      segs.push(cur ? { tick: t.tick, P, u: cur.u + (t.tick - cur.tick) / cur.P, bpm: real(P) } : { tick: 0, P, u: 0, bpm: real(P) });
    }
    const aU = tick => { let g = segs[0]; for (const x of segs) if (x.tick <= tick) g = x; return g.u + (tick - g.tick) / g.P; };
    return { segs, aU };
  }
  // fase local (en pulsos) cada 4 pulsos, con ventanas de ±8; desenrollada para no saltar de a un pulso
  function fase(ref, total) {
    const W = 8, paso = 4, pts = []; let prev = null, j0 = 0;
    for (let c = 0; c <= total + paso; c += paso) {
      let sx = 0, sy = 0, n = 0;
      while (j0 < ref.length && ref[j0] < c - W) j0++;
      for (let j = j0; j < ref.length && ref[j] < c + W; j++) { const a = 2 * Math.PI * ref[j]; sx += Math.cos(a); sy += Math.sin(a); n++; }
      const R = n ? Math.hypot(sx, sy) / n : 0;
      let ph = R > 0.35 && n >= 6 ? Math.atan2(sy, sx) / (2 * Math.PI) : null;
      if (ph == null) ph = prev ?? 0;
      else if (prev != null) { while (ph - prev > 0.5) ph -= 1; while (ph - prev < -0.5) ph += 1; }
      pts.push(ph); prev = ph;
    }
    const sm = pts.map((_, i) => { let a = 0, k = 0; for (let j = i - 2; j <= i + 2; j++) if (j >= 0 && j < pts.length) { a += pts[j]; k++; } return a / k; });
    const en = u => { const i = Math.max(0, Math.min(sm.length - 2, Math.floor(u / paso))), f = Math.max(0, Math.min(1, u / paso - i)); return sm[i] * (1 - f) + sm[i + 1] * f; };
    return { en, deriva: sm.length ? Math.max(...sm) - Math.min(...sm) : 0 };
  }

  // ---------- qué canal es qué
  function roles(s, meta) {
    const ch = {};
    for (const t of s.pistas) for (const n of t.notas) (ch[n.canal] = ch[n.canal] || { canal: n.canal, notas: [], prog: null, nombre: t.nombre }).notas.push(n);
    for (const t of s.pistas) for (const c in t.programas) if (ch[c] && ch[c].prog == null) ch[c].prog = t.programas[c];
    const bateria = ch[9] ? ch[9].notas : [];
    const tonales = Object.values(ch).filter(x => x.canal !== 9 && x.notas.length >= 8).sort((a, b) => b.notas.length - a.notas.length);
    const media = x => x.notas.reduce((a, n) => a + n.alt, 0) / x.notas.length;
    const poli = x => { const on = new Map(); for (const n of x.notas) on.set(n.on, (on.get(n.on) || 0) + 1); return x.notas.length / on.size; };
    const esBajo = x => (x.prog != null && x.prog >= 32 && x.prog <= 39) || /baj|bass/i.test(x.nombre) || (x.prog == null && media(x) < 50 && poli(x) < 1.15);
    const esPiano = x => (x.prog != null && x.prog <= 7) || /piano|keys|teclad|tumbao/i.test(x.nombre);
    const rol = (meta && meta.rol) || 'auto';
    let bajo = null, pianos = [];
    if (rol === 'bajo') bajo = tonales[0] || null;
    else if (rol === 'piano') pianos = tonales.filter((x, i) => i === 0 || x.notas.length >= 0.25 * tonales[0].notas.length);
    else if (rol !== 'percusion') {
      bajo = tonales.filter(esBajo).sort((a, b) => media(a) - media(b))[0] || null;
      let ps = tonales.filter(x => x !== bajo && esPiano(x));
      if (!ps.length) ps = tonales.filter(x => x !== bajo && (x.prog == null || x.prog < 24 || x.prog > 79));
      pianos = ps.filter((x, i) => i === 0 || x.notas.length >= 0.25 * ps[0].notas.length);
    }
    return { pianos, bajo, bateria: rol === 'piano' || rol === 'bajo' ? [] : bateria };
  }

  // ---------- grilla: pulso, deriva, compases y lado de la clave
  function grilla(s, R, meta) {
    const { segs, aU } = pulsos(s);
    const ton = [...R.pianos.flatMap(x => x.notas), ...(R.bajo ? R.bajo.notas : [])];
    const refN = R.bateria.length >= 150 ? R.bateria : ton.length ? ton : R.bateria;
    const ref = refN.map(n => aU(n.on)).sort((a, b) => a - b);
    const todas = [...ton, ...R.bateria];
    const total = todas.length ? Math.max(...todas.map(n => aU(n.off))) : 0;
    const F = fase(ref, total);
    const U = tick => { const u = aU(tick); return u - F.en(u); };
    const nb = Math.ceil(total / 8) + 1;
    const ok = new Array(nb).fill(0), cnt = new Array(nb).fill(0);
    for (const n of refN) { const u = U(n.on), b = Math.floor(Math.round(u) / 8); if (b < 0 || b >= nb) continue; cnt[b]++; if (Math.abs(u - Math.round(u * 2) / 2) < 0.17) ok[b]++; }
    const calidad = ok.map((v, i) => cnt[i] ? v / cnt[i] : null);

    // instrumento de clave: el golpe que mejor calza en una clave, ventana por ventana
    const porAlt = {};
    for (const n of R.bateria) (porAlt[n.alt] = porAlt[n.alt] || []).push(Math.round(U(n.on)));
    let clave = null;
    for (const a in porAlt) {
      const xs = porAlt[a]; if (xs.length < 30) continue;
      if (xs.length / ((xs[xs.length - 1] - xs[0]) / 8 + 1) > 4.5) continue;   // la clave tiene 2,5 golpes por compás
      const vs = [], tipo = { son: 0, rumba: 0 };
      for (let w0 = Math.floor(xs[0] / 32) * 32; w0 <= xs[xs.length - 1]; w0 += 32) {
        const ws = xs.filter(x => x >= w0 && x < w0 + 32); if (ws.length < 6) continue;
        const h = new Array(16).fill(0); for (const x of ws) h[((x % 16) + 16) % 16]++;
        let best = null;
        for (const [nm, pat] of Object.entries(CLAVES)) for (let r = 0; r < 16; r++) {
          const fit = pat.reduce((acc, x) => acc + h[(x + r) % 16], 0) / ws.length;
          if (!best || fit > best.fit + 1e-9) best = { nm, r, fit };
        }
        vs.push({ w0, ...best }); tipo[best.nm]++;
      }
      if (vs.length < 3) continue;
      const fits = vs.map(v => v.fit).sort((x, y) => x - y), med = fits[fits.length >> 1];
      if (med >= 0.85 && (!clave || med * vs.length > clave.med * clave.vs.length)) clave = { alt: +a, med, vs, tipo: tipo.son >= tipo.rumba ? 'son' : 'rumba' };
    }

    // fase del compás por ventana de 4 compases (Viterbi con castigo al cambiar)
    const nw = Math.max(1, Math.ceil(nb / 4));
    const decl = meta && /([23])-([23])/.exec(meta.clave || '');
    let fasesW, ladoFuente;
    if (decl) {
      const c0 = ((decl[1] === '3' ? 0 : 8) + 8 * (+(meta.inicio || 0))) % 16;
      fasesW = new Array(nw).fill(c0); ladoFuente = 'declarado';
    } else {
      const score = Array.from({ length: nw }, () => new Array(16).fill(0));
      if (R.bajo) for (const n of R.bajo.notas) { const x = Math.round(U(n.on)), w = Math.floor(x / 32); if (w < 0 || w >= nw) continue; for (let c = 0; c < 16; c++) score[w][c] += 0.5 * BAJO[(((x - c) % 8) + 8) % 8]; }
      for (let w = 0; w < nw; w++) { score[w][0] += 0.8; score[w][8] += 0.8; }   // leve preferencia por las barras del MIDI
      if (clave) for (const v of clave.vs) { const w = Math.floor(v.w0 / 32); if (w < nw) score[w][v.r] += 12 * v.fit; }
      const pen = 6, V = [score[0].slice()], B = [];
      for (let w = 1; w < nw; w++) {
        V.push([]); B.push([]);
        for (let c = 0; c < 16; c++) {
          let bv = -1e9, bc = 0;
          for (let d = 0; d < 16; d++) { const v = V[w - 1][d] - (d === c ? 0 : (d % 8 === c % 8 ? pen * 0.5 : pen)); if (v > bv) { bv = v; bc = d; } }
          V[w].push(bv + score[w][c]); B[w - 1].push(bc);
        }
      }
      fasesW = new Array(nw); let c = V[nw - 1].indexOf(Math.max(...V[nw - 1]));
      for (let w = nw - 1; w >= 0; w--) { fasesW[w] = c; if (w > 0) c = B[w - 1][c]; }
      ladoFuente = clave ? 'clave' : 'sin';
    }
    return { segs, U, nb, total, calidad, clave, fasesW, ladoFuente, deriva: F.deriva };
  }

  // ---------- acordes por compás
  const CAL = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], sus4: [0, 5, 7], aug: [0, 4, 8] };
  const PESOS = { 0: 1.25, 3: 1, 4: 1, 7: 0.75, 10: 0.9, 11: 0.9, 6: 1, 9: 0.9, 5: 0.9, 8: 0.9 };
  const PLANT = {};
  for (const q in CAL) { const v = new Array(12).fill(0); for (const i of CAL[q]) v[i] = PESOS[i] ?? 1; const n = Math.hypot(...v); PLANT[q] = v.map(x => x / n); }
  const KMAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], KMIN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  function corr(a, b) { const ma = a.reduce((x, y) => x + y) / 12, mb = b.reduce((x, y) => x + y) / 12; let n = 0, da = 0, db = 0; for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return n / Math.sqrt(da * db || 1); }
  function tonalidad(ch) { let best = null; for (let r = 0; r < 12; r++) for (const [m, prof] of [['mayor', KMAJ], ['menor', KMIN]]) { const c = corr(ch, prof.map((_, i) => prof[(i - r + 12) % 12])); if (!best || c > best.c) best = { raiz: r, modo: m, c }; } return best; }
  function croma(notas, a, b, bonus = 0.5) {
    const v = new Array(12).fill(0);
    for (const n of notas) { if (n.off <= a || n.on >= b) continue; v[pc(n.p)] += Math.min(n.off, b) - Math.max(n.on, a) + (n.on >= a ? bonus : 0); }
    return v;
  }
  function norm(v) { const n = Math.hypot(...v); return n ? v.map(x => x / n) : v; }
  function mejorAcorde(cp, cb, grave) {
    const np = Math.hypot(...cp), nbj = Math.hypot(...cb);
    const c = norm(cp.map((x, i) => x + 0.8 * cb[i] * (np ? np / (nbj || 1) : 1)));
    if (!c.some(x => x)) return null;
    let best = null;
    for (let r = 0; r < 12; r++) for (const q in PLANT) {
      const t = PLANT[q]; let s = 0; for (let i = 0; i < 12; i++) s += c[(i + r) % 12] * t[i];
      if (grave === r) s += 0.12;
      s -= 0.015 * (CAL[q].length - 3) + (q === 'aug' || q === 'sus4' ? 0.04 : 0);
      if (!best || s > best.s) best = { raiz: r, q, s };
    }
    return { ...acorde(NOM[best.raiz] + best.q), s: best.s };
  }
  function graveDe(notas, a, b) {
    const w = {}; for (const n of notas) { if (n.off <= a || n.on >= b) continue; const k = pc(n.p); w[k] = (w[k] || 0) + Math.min(n.off, b) - Math.max(n.on, a); }
    let best = null; for (const k in w) if (best == null || w[k] > w[best]) best = k; return best == null ? null : +best;
  }

  // ---------- ataques: notas casi simultáneas juntas, cuantizadas a la corchea salvo semicorchea clara
  function ataques(notas) {
    const ns = notas.slice().sort((a, b) => a.on - b.on), out = [];
    let g = [];
    const cerrar = () => {
      if (!g.length) return;
      const ons = g.map(n => n.on).sort((a, b) => a - b), med = ons[ons.length >> 1];
      const q16 = Math.abs(med - Math.round(med)) <= 0.3 ? Math.round(med) * 2 : Math.round(med * 2);
      out.push({ q16, ps: [...new Set(g.map(n => n.p))].sort((a, b) => a - b), dur: Math.max(...g.map(n => n.off)) - med, vel: g.reduce((a, n) => a + n.v, 0) / g.length });
      g = [];
    };
    for (const n of ns) { if (g.length && n.on - g[0].on > 0.2) cerrar(); g.push(n); }
    cerrar();
    const m = [];
    for (const a of out) { const l = m[m.length - 1]; if (l && l.q16 === a.q16) { l.ps = [...new Set([...l.ps, ...a.ps])].sort((x, y) => x - y); l.dur = Math.max(l.dur, a.dur); } else m.push(a); }
    return m;
  }
  // textura: derecha = notas dentro de la octava de arriba; izquierda = lo que queda abajo
  function textura(ps) {
    const top = ps[ps.length - 1], der = ps.filter(x => x >= top - 12), izq = ps.filter(x => x < top - 12);
    let d;
    if (der.length === 1) d = 'sola';
    else if (der.includes(top - 12)) { const inn = der.filter(x => x > top - 12 && x < top).length; d = inn === 0 ? 'octava' : inn === 1 ? 'octava+1' : 'octava+2'; }
    else if (der.length === 2) d = 'díada ' + ({ 1: '2a', 2: '2a', 3: '3a', 4: '3a', 5: '4a', 6: 'trítono', 7: '5a', 8: '6a', 9: '6a', 10: '7a', 11: '7a' }[top - der[0]]);
    else d = 'acorde';
    let i = 'nada';
    if (izq.length) {
      const it = izq[izq.length - 1], db = der[0], dif = db - it;
      const dobla = izq.every(x => pc(x) === pc(db) || pc(x) === pc(top));
      if (dobla && izq.length <= 2) i = dif === 12 ? 'dobla 8va' : dif === 24 ? 'dobla 2 8vas' : 'dobla lejos';
      else if (izq.length === 1 && (top - it === 27 || top - it === 28 || dif === 15 || dif === 16)) i = 'décima';
      else if (izq.length === 1) i = 'nota suelta';
      else i = 'acorde/octava propia';
    }
    return { der: d, izq: i, top, nDer: der.length, nIzq: izq.length };
  }
  const letraTextura = t => t.der.startsWith('octava') ? 'o' : t.der === 'sola' ? 'x' : t.der.startsWith('díada') ? 'd' : 'a';

  // ---------- análisis completo de un MIDI (lo usan el informe, el visor y la extracción de fuentes)
  function analizarDetalle(s, meta) {
    meta = meta || {};
    const R = roles(s, meta), g = grilla(s, R, meta), U = g.U;
    const conv = n => ({ p: n.alt, on: U(n.on), off: U(n.off), v: n.vel });
    const bajo = R.bajo ? R.bajo.notas.map(conv) : [];
    const compases = []; let prevX = -1e9;
    for (let w = 0; w < g.fasesW.length; w++) {
      const c = g.fasesW[w];
      for (let x = 32 * w + ((((c - 32 * w) % 8) + 8) % 8); x < 32 * w + 32; x += 8) {
        if (x < prevX + 8 || x > g.total) continue;
        const cal = g.calidad[Math.floor(x / 8)];
        compases.push({ i: compases.length, x, lado: ((((x - c) % 16) + 16) % 16) === 0 ? 'A' : 'B', fase: c % 8, grillaOK: cal == null || cal >= 0.8 });
        prevX = x;
      }
    }
    const partes = R.pianos.map(pn => { const notas = pn.notas.map(conv); return { canal: pn.canal + 1, programa: pn.prog, notas, ataques: ataques(notas) }; });
    const pPrincipal = partes.flatMap(p => p.notas);
    const ton = tonalidad(croma(pPrincipal.concat(bajo), -1e9, 1e9, 0));
    // acordes: declarados o detectados con ventanas corridas para que entren los anticipos
    let declarados = null;
    if (meta.acordes) { try { declarados = leerProgresion(meta.acordes); } catch (e) { declarados = null; } }
    for (const b of compases) {
      if (declarados && declarados.length) { b.acordes = declarados[b.i % declarados.length]; continue; }
      if (!pPrincipal.length && !bajo.length) { b.acordes = []; continue; }
      const x = b.x;
      const ent = mejorAcorde(croma(pPrincipal, x - 1, x + 7), croma(bajo, x - 2, x + 6), graveDe(bajo, x - 2, x + 6));
      const m1 = mejorAcorde(croma(pPrincipal, x - 1, x + 3), croma(bajo, x - 2, x + 2), graveDe(bajo, x - 2, x + 2));
      const m2 = mejorAcorde(croma(pPrincipal, x + 3, x + 7), croma(bajo, x + 2, x + 6), graveDe(bajo, x + 2, x + 6));
      if (ent && m1 && m2 && m1.nombre !== m2.nombre && (m1.s + m2.s) / 2 > ent.s + 0.06) b.acordes = [m1, m2];
      else b.acordes = ent ? [ent] : [];
    }
    for (const pt of partes) {
      pt.compases = compases.map(b => {
        const as = pt.ataques.filter(a => a.q16 >= 2 * b.x && a.q16 < 2 * b.x + 16).map(a => ({ ...a, pos: a.q16 - 2 * b.x, tex: textura(a.ps) }));
        const n = as.length, off = as.filter(a => a.pos % 4 === 2).length, durMed = n ? as.reduce((acc, a) => acc + a.dur, 0) / n : 0;
        return { i: b.i, tipo: !n ? 'silencio' : (n >= 4 && durMed <= 2.5 && off >= 2) ? 'montuno' : 'otro', as };
      });
    }
    const bajoAt = ataques(bajo).map(a => ({ ...a, p: a.ps[0] }));
    const bateria = R.bateria.map(n => ({ alt: n.alt, u: U(n.on), v: n.vel }));
    return {
      ppq: s.ppq, segs: g.segs, deriva: g.deriva, clave: g.clave ? { instrumento: g.clave.alt, tipo: g.clave.tipo } : null,
      ladoFuente: g.ladoFuente, tonalidad: { raiz: NOM[ton.raiz], modo: ton.modo, pc: ton.raiz },
      compases, partes, bajo, bajoAt, bateria, roles: { piano: partes.length, bajo: !!R.bajo, percusion: R.bateria.length > 0 }
    };
  }

  // ---------- lado de la clave a partir del ritmo del piano
  const vecCompas = c => { const v = new Array(16).fill(0); for (const a of c.as) v[a.pos] = 1; return v; };
  const LL = (v, p) => v.reduce((s, h, k) => s + (h ? Math.log(p[k]) : Math.log(1 - p[k])), 0);
  const usable = (det, pt, i) => pt.compases[i].tipo === 'montuno' && det.compases[i].grillaOK && det.compases[i].acordes.length > 0;
  // por segmento de fase: si el piano dice lo contrario, da vuelta los lados (aplicar) o marca el conflicto
  function deducirLados(det, perfil, aplicar) {
    const pt = det.partes[0]; if (!pt || !perfil) return null;
    const segs = []; let seg = [];
    for (const b of det.compases) { if (seg.length && seg[seg.length - 1].fase !== b.fase) { segs.push(seg); seg = []; } seg.push(b); }
    if (seg.length) segs.push(seg);
    let acierto = 0, total = 0, llr = 0;
    for (const sg of segs) {
      let d = 0, n = 0;
      for (const b of sg) { if (!usable(det, pt, b.i)) continue; const v = vecCompas(pt.compases[b.i]); d += b.lado === 'A' ? LL(v, perfil.A) - LL(v, perfil.B) : LL(v, perfil.B) - LL(v, perfil.A); n++; }
      if (n) { total += n; if (d >= 0) acierto += n; llr += Math.abs(d); }
      if (aplicar && d < 0) for (const b of sg) b.lado = b.lado === 'A' ? 'B' : 'A';
      if (!aplicar && d < 0 && n >= 4) for (const b of sg) b.conflicto = true;
    }
    return { acierto: total ? acierto / total : null, llrPorCompas: total ? llr / total : 0, compases: total };
  }

  // ---------- percusión General MIDI → nombres de la app
  const GM_APP = {
    35: 'kick', 36: 'kick', 37: 'rim', 38: 'snare', 40: 'snare', 39: 'palito', 41: 'tomL', 43: 'tomL', 45: 'tomL', 47: 'tomH', 48: 'tomH', 50: 'tomH',
    42: 'hhC', 44: 'hhP', 46: 'hhO', 49: 'crash', 52: 'crash', 55: 'crash', 57: 'crash', 51: 'ride', 59: 'ride', 53: 'rideBell', 54: 'maraca',
    56: 'bell', 60: 'bongoH', 61: 'bongoL', 62: 'congaS', 63: 'congaO', 64: 'salidor', 65: 'timbalH', 66: 'timbalL', 67: 'bongoBell', 68: 'bell',
    69: 'maraca', 70: 'maraca', 73: 'guiroS', 74: 'guiroL', 75: 'clave', 76: 'palito', 77: 'block', 82: 'maraca'
  };
  const digito = v => String(Math.max(1, Math.min(9, Math.round(v / 127 * 9))));

  // ---------- fuente: lo que se guarda en la base (compacto) para aprender
  function extraerFuente(det, meta) {
    const C = det.compases, pt = det.partes[0];
    const nombres = cs => cs.map(a => a.nombre);
    const sigDe = i => (C[i] && C[i].acordes[0]) ? C[i].acordes[0].nombre : null;
    const par = i => C[i] && C[i + 1] && C[i].lado === 'A' && C[i + 1].lado === 'B' && C[i + 1].x === C[i].x + 8;
    const piano = [], bajo = [], juegos = new Map();
    for (let i = 0; i + 1 < C.length; i++) {
      if (!par(i)) continue;
      if (pt && usable(det, pt, i) && usable(det, pt, i + 1) && !C[i].conflicto) {
        const e = [];
        for (const k of [0, 1]) for (const a of pt.compases[i + k].as) e.push([a.pos + 16 * k, Math.max(1, Math.round(a.dur * 2)), a.ps, Math.round(a.vel)]);
        piano.push({ c: i, a: [nombres(C[i].acordes), nombres(C[i + 1].acordes)], s: sigDe(i + 2), e });
      }
      if (det.bajoAt.length && C[i].grillaOK && C[i + 1].grillaOK && C[i].acordes.length && C[i + 1].acordes.length) {
        const e = [];
        for (const a of det.bajoAt) { const p = a.q16 - 2 * C[i].x; if (p >= 0 && p < 32) e.push([p, Math.max(1, Math.round(a.dur * 2)), a.p, Math.round(a.vel)]); }
        const nA = e.filter(x => x[0] < 16).length, nB = e.length - nA;
        if (nA >= 2 && nB >= 2) bajo.push({ c: i, a: [nombres(C[i].acordes), nombres(C[i + 1].acordes)], s: sigDe(i + 2), e });
      }
      if (det.bateria.length && C[i].grillaOK && C[i + 1].grillaOK) {
        const pats = {}; let n = 0;
        for (const h of det.bateria) {
          if (det.clave && h.alt === det.clave.instrumento) continue;      // la clave la escribe el generador
          const nm = GM_APP[h.alt]; if (!nm) continue;
          const p = Math.round(h.u * 2) - 2 * C[i].x; if (p < 0 || p >= 32) continue;
          const s = (pats[nm] = pats[nm] || '.'.repeat(32).split(''));
          const d = digito(h.v); if (s[p] === '.' || s[p] < d) s[p] = d; n++;
        }
        if (n >= 8) {
          const k = Object.keys(pats).sort().map(nm => nm + ':' + pats[nm].join('')).join(' ');
          juegos.set(k, (juegos.get(k) || 0) + 1);
        }
      }
    }
    const perc = [...juegos].map(([k, n]) => ({ n, k: Object.fromEntries(k.split(' ').map(x => x.split(':'))) }));
    return {
      version: 1,
      analisis: {
        ladoFuente: det.ladoFuente, clave: det.clave ? det.clave.tipo : (meta && meta.clave) || null, tonalidad: det.tonalidad.raiz + ' ' + det.tonalidad.modo,
        bpm: Math.round(det.segs[0].bpm), compases: C.length, roles: det.roles,
        montuno: pt ? pt.compases.filter((c, i) => usable(det, pt, i)).length : 0
      },
      piano, bajo, perc
    };
  }

  // perfil rítmico del piano por lado (16 semicorcheas) a partir de ciclos de piano
  function perfilLado(ciclosPiano) {
    const prof = { A: new Array(16).fill(1), B: new Array(16).fill(1) }, nn = { A: 2, B: 2 };
    for (const c of ciclosPiano) {
      const v = { A: new Array(16).fill(0), B: new Array(16).fill(0) };
      for (const e of c.e) v[e[0] < 16 ? 'A' : 'B'][e[0] % 16] = 1;
      for (const L of ['A', 'B']) { for (let k = 0; k < 16; k++) prof[L][k] += v[L][k]; nn[L]++; }
    }
    return { A: prof.A.map(x => x / nn.A), B: prof.B.map(x => x / nn.B) };
  }

  // ---------- de bytes a fuente, con el lado deducido si hace falta
  function analizarFuente(datos, meta, opciones) {
    meta = meta || {};
    const s = TM.leerMidi(datos);
    const det = analizarDetalle(s, meta);
    const perfil = opciones && opciones.perfil;
    let deduccion = null;
    if (det.ladoFuente === 'sin' && perfil) { deduccion = deducirLados(det, perfil, true); if (deduccion && deduccion.compases) det.ladoFuente = 'deducido'; }
    else if (det.ladoFuente === 'clave' && perfil) deducirLados(det, perfil, false);
    const f = extraerFuente(det, meta);
    if (deduccion) f.analisis.deduccion = { llr: +deduccion.llrPorCompas.toFixed(2), compases: deduccion.compases };
    f.analisis.conflicto = det.compases.filter(b => b.conflicto).length;
    return f;
  }

  Object.assign(TM, {
    NOM, nom, pc, GRADO, CLAVES, INTERVALOS, acorde, funcion, leerProgresion, textura, letraTextura, ataques,
    analizarDetalle, deducirLados, extraerFuente, analizarFuente, perfilLado, GM_APP
  });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
