/* =====================================================================
   Grilla rítmica de un MIDI de salsa/timba
   - pulso = corchea de salsa (16 pulsos por clave), elegido para que la negra real caiga entre 130 y 260
   - fase: sigue la deriva de los archivos grabados en vivo (media circular de los ataques de la batería)
   - compás: dónde cae el 1 (perfil del bajo de tumbao: 2& y 4) y, si hay, la clave de la percusión
   - lado de la clave: con el instrumento de clave (75 claves, 76/77 wood block, 37 rim) cuando existe
   ===================================================================== */
const CLAVES = { son: [0, 3, 6, 10, 12], rumba: [0, 3, 7, 10, 12] };   // 3-2 desde el 1 del lado 3
// perfil del bajo por pulso del compás, medido en los archivos limpios del corpus (2& y 4 mandan)
const BAJO = [12, 1, 3, 35, 9, 1, 34, 2].map(v => Math.log(v + 1));

function pulsos(s) {
  const q = s.ppq, ts = (s.tempos.length ? s.tempos : [{ tick: 0, uspq: 500000 }]).slice().sort((a, b) => a.tick - b.tick);
  const segs = [];
  for (const t of ts) {
    const bpm = 60e6 / t.uspq, real = x => bpm * q / (2 * x), cur = segs[segs.length - 1];
    if (cur && real(cur.P) >= 120 && real(cur.P) <= 270) continue;
    let P = q; while (real(P) < 130) P /= 2; while (real(P) > 260) P *= 2;
    if (cur && cur.P === P) continue;
    segs.push(cur ? { tick: t.tick, P, u: cur.u + (t.tick - cur.tick) / cur.P, bpm: real(P) } : { tick: 0, P, u: 0, bpm: real(P) });
  }
  const toU = tick => { let g = segs[0]; for (const x of segs) if (x.tick <= tick) g = x; return g.u + (tick - g.tick) / g.P; };
  return { segs, toU };
}

// fase local (en pulsos) cada 4 pulsos, con ventanas de ±8 pulsos; desenrollada para que no salte de a un pulso
function fase(ref, total) {
  const W = 8, step = 4, pts = []; let prev = null, j0 = 0;
  for (let c = 0; c <= total + step; c += step) {
    let sx = 0, sy = 0, n = 0;
    while (j0 < ref.length && ref[j0] < c - W) j0++;
    for (let j = j0; j < ref.length && ref[j] < c + W; j++) { const a = 2 * Math.PI * ref[j]; sx += Math.cos(a); sy += Math.sin(a); n++; }
    const R = n ? Math.hypot(sx, sy) / n : 0;
    let ph = R > 0.35 && n >= 6 ? Math.atan2(sy, sx) / (2 * Math.PI) : null;
    if (ph == null) ph = prev ?? 0;
    else if (prev != null) { while (ph - prev > 0.5) ph -= 1; while (ph - prev < -0.5) ph += 1; }
    pts.push({ c, ph, R }); prev = ph;
  }
  // suavizado (media de 5) para no seguir el rubato de un solo golpe
  const sm = pts.map((p, i) => { let a = 0, k = 0; for (let j = i - 2; j <= i + 2; j++) if (pts[j]) { a += pts[j].ph; k++; } return a / k; });
  const at = u => { const i = Math.max(0, Math.min(pts.length - 2, Math.floor(u / step))), f = Math.max(0, Math.min(1, u / step - i)); return sm[i] * (1 - f) + sm[i + 1] * f; };
  return { at, pts, sm };
}

function analizarGrilla(s) {
  const { segs, toU } = pulsos(s);
  const notas = s.tracks.flatMap(t => t.notes);
  const bat = notas.filter(n => n.ch === 9), ton = notas.filter(n => n.ch !== 9);
  const refN = bat.length >= 150 ? bat : ton;
  const ref = refN.map(n => toU(n.on)).sort((a, b) => a - b);
  const total = Math.max(...notas.map(n => toU(n.off)));
  const F = fase(ref, total);
  const U = tick => { const u = toU(tick); return u - F.at(u); };   // tick → pulso corregido

  // calidad de la grilla por compás (8 pulsos): fracción de ataques de batería cerca del pulso
  const nb = Math.ceil(total / 8) + 1;
  const ok = new Array(nb).fill(0), cnt = new Array(nb).fill(0);
  for (const n of refN) { const u = U(n.on), b = Math.floor(Math.round(u) / 8); if (b < 0 || b >= nb) continue; cnt[b]++; const r = Math.abs(u - Math.round(u * 2) / 2); if (r < 0.17) ok[b]++; }
  const calidad = ok.map((v, i) => cnt[i] ? v / cnt[i] : null);

  // ---- instrumento de clave: el golpe de batería que mejor calza en una clave, ventana por ventana
  const porAltura = {};
  for (const n of bat) (porAltura[n.pitch] = porAltura[n.pitch] || []).push(Math.round(U(n.on)));
  let clave = null;
  for (const p in porAltura) {
    const xs = porAltura[p]; if (xs.length < 30) continue;
    const densidad = xs.length / ((xs[xs.length - 1] - xs[0]) / 8 + 1);
    if (densidad > 4.5) continue;                                  // la clave tiene 2,5 golpes por compás
    const vs = []; const tipo = { son: 0, rumba: 0 };
    for (let w0 = Math.floor(xs[0] / 32) * 32; w0 <= xs[xs.length - 1]; w0 += 32) {
      const ws = xs.filter(x => x >= w0 && x < w0 + 32); if (ws.length < 6) continue;
      const h = new Array(16).fill(0); for (const x of ws) h[((x % 16) + 16) % 16]++;
      let best = null;
      for (const [nm, pat] of Object.entries(CLAVES)) for (let r = 0; r < 16; r++) {
        const fit = pat.reduce((a, x) => a + h[(x + r) % 16], 0) / ws.length;
        if (!best || fit > best.fit + 1e-9) best = { nm, r, fit };
      }
      vs.push({ w0, ...best }); tipo[best.nm]++;
    }
    if (vs.length < 3) continue;
    const fits = vs.map(v => v.fit).sort((a, b) => a - b), med = fits[fits.length >> 1];
    if (med >= 0.85 && (!clave || med * vs.length > clave.med * clave.vs.length)) clave = { pitch: +p, med, vs, tipo: tipo.son >= tipo.rumba ? 'son' : 'rumba' };
  }

  // ---- fase del compás por ventana de 4 compases (Viterbi con castigo al cambiar)
  const bajoCh = canalBajo(s);
  const bajoU = bajoCh ? bajoCh.map(n => Math.round(U(n.on))) : [];
  const nw = Math.ceil(nb / 4);
  const score = Array.from({ length: nw }, () => new Array(16).fill(0));   // 16 = fase de la clave (k y k+8)
  for (const x of bajoU) { const w = Math.floor(x / 32); if (w < 0 || w >= nw) continue; for (let c = 0; c < 16; c++) score[w][c] += 0.5 * BAJO[(((x - c) % 8) + 8) % 8]; }
  for (let w = 0; w < nw; w++) score[w][0] += 0.8, score[w][8] += 0.8;     // leve preferencia por las barras del MIDI
  if (clave) for (const v of clave.vs) { const w = Math.floor(v.w0 / 32); if (w < nw) score[w][v.r] += 12 * v.fit; }
  const pen = 6;
  const V = [new Array(16).fill(0).map((_, c) => score[0][c])], B = [];
  for (let w = 1; w < nw; w++) {
    V.push([]); B.push([]);
    for (let c = 0; c < 16; c++) {
      let bv = -1e9, bc = 0;
      for (let d = 0; d < 16; d++) { const v = V[w - 1][d] - (d === c ? 0 : (d % 8 === c % 8 ? pen * 0.5 : pen)); if (v > bv) { bv = v; bc = d; } }
      V[w].push(bv + score[w][c]); B[w - 1].push(bc);
    }
  }
  const fasesW = new Array(nw); let c = V[nw - 1].indexOf(Math.max(...V[nw - 1]));
  for (let w = nw - 1; w >= 0; w--) { fasesW[w] = c; if (w > 0) c = B[w - 1][c]; }
  const ladoSeguro = !!clave;

  return { segs, F, U, nb, calidad, clave, fasesW, ladoSeguro, bajo: bajoCh, refEsBateria: refN === bat };
}

function canalBajo(s) {
  const ch = {};
  for (const t of s.tracks) for (const n of t.notes) if (n.ch !== 9) (ch[n.ch] = ch[n.ch] || []).push(n);
  let best = null, bm = 1e9;
  for (const c in ch) { if (ch[c].length < 20) continue; const m = ch[c].reduce((a, n) => a + n.pitch, 0) / ch[c].length; if (m < bm) { bm = m; best = ch[c]; } }
  return best;
}

module.exports = { analizarGrilla, canalBajo, CLAVES };
