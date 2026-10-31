/* =====================================================================
   MOTOR DE TUMBAOS · 5. SALIDA
   El resultado del generador como LilyPond (lo que dibuja y toca la app) y como MIDI (para analizarlo).
   ===================================================================== */
(function (TM) {
  'use strict';
  const pc = m => ((m % 12) + 12) % 12;
  const SH = ['c', 'cis', 'd', 'dis', 'e', 'f', 'fis', 'g', 'gis', 'a', 'ais', 'b'], FL = ['c', 'des', 'd', 'ees', 'e', 'f', 'ges', 'g', 'aes', 'a', 'bes', 'b'];
  const RAICES = ['c', 'cis', 'd', 'ees', 'e', 'f', 'fis', 'g', 'aes', 'a', 'bes', 'b'];
  const LYQ = { '': '', m: ':m', 7: ':7', m7: ':m7', maj7: ':maj7', 6: ':6', m6: ':m6', 9: ':9', m9: ':m9', '7b9': ':7.9-', dim7: ':dim7', dim: ':dim', m7b5: ':m7.5-', sus4: ':sus4', '7sus4': ':7sus4', aug: ':aug', 5: ':5' };
  const MAJ_NAME = ['c', 'des', 'd', 'ees', 'e', 'f', 'fis', 'g', 'aes', 'a', 'bes', 'b'], MAJ_SF = [0, -5, 2, -3, 4, -1, 6, 1, -4, 3, -2, 5];
  const MIN_NAME = ['c', 'cis', 'd', 'ees', 'e', 'f', 'fis', 'g', 'gis', 'a', 'bes', 'b'], MIN_SF = [-3, 4, -1, -6, 1, -4, 3, -2, 5, 0, -5, 2];

  // ---------- rejilla en semicorcheas → compases de LilyPond (con ligaduras al cruzar los tiempos que corresponde)
  const D16 = { 16: '1', 12: '2.', 8: '2', 6: '4.', 4: '4', 3: '8.', 2: '8', 1: '16' };
  const ok = (p, d) => d === 16 || d === 12 ? p === 0 : d === 8 ? (p === 0 || p === 8) : p % 2 === 1 ? ([1, 2, 3].includes(d) && (p >> 2) === ((p + d - 1) >> 2)) :
    (d === 6 || d === 4) ? (p % 2 === 0 && (p + d <= 8 || p >= 8)) : d === 3 ? p % 4 === 0 : true;
  function partir(p, L) { const o = []; while (L > 0) { for (const d of [16, 12, 8, 6, 4, 3, 2, 1]) if (d <= L && ok(p, d)) { o.push(d); p += d; L -= d; break; } } return o; }
  // ortografía: las notas del acorde se escriben desde su raíz (Sol# en E7, no Lab); el resto, según la armadura
  const LETRAS = 'cdefgab', NAT = [0, 2, 4, 5, 7, 9, 11];
  const RAIZ_LETRA = { C: [0, 0], 'C#': [0, 1], D: [1, 0], Eb: [2, -1], E: [2, 0], F: [3, 0], 'F#': [3, 1], G: [4, 0], Ab: [5, -1], A: [5, 0], Bb: [6, -1], B: [6, 0] };
  const salto = (iv, ch) => ({ 0: 0, 1: 1, 2: 1, 3: ch.fun.t === 3 ? 2 : 1, 4: 2, 5: 3, 6: ch.fun.f === 6 ? 4 : 3, 7: 4, 8: ch.fun.f === 8 ? 4 : 5, 9: ch.q === 'dim7' ? 6 : 5, 10: 6, 11: 6 })[iv];
  function deletrear(m, ch) {
    if (!ch) return null;
    const r = RAIZ_LETRA[TM.NOM[ch.raiz]]; if (!r) return null;
    const p = pc(m), l = (r[0] + salto((p - ch.raiz + 12) % 12, ch)) % 7;
    let alt = p - NAT[l]; if (alt > 6) alt -= 12; if (alt < -6) alt += 12;
    return Math.abs(alt) <= 1 ? { l, alt } : null;
  }
  function compases(evs, nb, ly) {
    const tk = (ps, d, art, liga) => (ps.length ? (ps.length === 1 ? ps[0] : '<' + ps.join(' ') + '>') : 'r') + D16[d] + (ps.length ? (art || '') + (liga ? '~' : '') : '');
    const res = [];
    // el glissando sale del último pedazo de la nota (si no, se deslizaría hacia su propia ligadura); los acentos, del primero
    const gl = a => /glissando/.test(a || '');
    for (let b = 0; b < nb; b++) {
      const lo = b * 16, hi = lo + 16, cur = [];
      for (const e of evs) { const s = Math.max(e.p, lo), f = Math.min(e.p + e.L, hi); if (f <= s) continue; cur.push({ p: s - lo, L: f - s, ps: e.ps.map(m => ly(m, e.ch)), art: gl(e.art) ? (e.p + e.L <= hi ? e.art : '') : e.p >= lo ? e.art : '', liga: e.p + e.L > hi }); }
      cur.sort((a, b2) => a.p - b2.p);
      const out = []; let t = 0;
      for (const e of cur) {
        if (e.p < t) continue;   // seguridad: nunca superponer dentro de una voz
        if (e.p > t) for (const d of partir(t, e.p - t)) { out.push(tk([], d)); t += d; }
        const ds = partir(e.p, e.L); ds.forEach((d, i) => out.push(tk(e.ps, d, gl(e.art) ? (i === ds.length - 1 ? e.art : '') : i ? '' : e.art, i < ds.length - 1 || e.liga))); t = e.p + e.L;
      }
      if (t < 16) for (const d of partir(t, 16 - t)) { out.push(tk([], d)); t += d; }
      res.push(out.join(' '));
    }
    return res;
  }

  function aLilyPond(res, o) {
    const ch0 = res.acordes[0][0];
    const menor = /^m(?!aj)/.test(ch0.q) || ch0.q === 'dim' || ch0.q === 'm7b5' || ch0.q === 'dim7';
    const nombre = menor ? MIN_NAME[ch0.raiz] : MAJ_NAME[ch0.raiz], sf = menor ? MIN_SF[ch0.raiz] : MAJ_SF[ch0.raiz];
    const NOMBRES = sf < 0 ? FL : SH;
    const octava = oc => oc > 0 ? "'".repeat(oc) : oc < 0 ? ','.repeat(-oc) : '';
    const ly = (m, ch) => {
      const d = deletrear(m, ch);
      if (d) return LETRAS[d.l] + (d.alt === 1 ? 'is' : d.alt === -1 ? 'es' : '') + octava(Math.floor((m - d.alt) / 12) - 4);
      return NOMBRES[pc(m)] + octava(Math.floor(m / 12) - 4);
    };
    const nb = res.compases;
    const cif = res.acordes.map(cs => cs.map(c => RAICES[c.raiz] + (cs.length > 1 ? '2' : '1') + (LYQ[c.q] ?? '')).join(' ')).join(' | ');
    const DIN = { cuerpo: '\\mp', marcha: '\\mf', mambo: '\\f', presion: '\\f', bomba: '\\f', despelote: '\\ff', muela: '\\p' };
    // secciones de una canción: cada una con su marca, su doble barra y su dinámica (si cambia)
    const secs = res.secciones || [{ inicio: 0, compases: nb, marcha: res.marcha, texto: res.marca }];
    const conDin = a => {
      let antes = null;
      for (const s of secs) {
        const dyn = DIN[s.marcha] || '\\mf'; if (dyn === antes) continue; antes = dyn;
        for (let i = s.inicio; i < s.inicio + s.compases; i++) if (/[a-g][a-z]*[',]*\d|<[^>]+>\d/.test(a[i])) { a[i] = a[i].replace(/((?:<[^>]+>|[a-g](?:is|es)?[',]*)\d+\.*)/, '$1' + dyn); break; }
      }
      return a;
    };
    const marcar = (a, conMarca) => { for (const s of secs.slice(1)) a[s.inicio] = `\\bar "||" ${conMarca ? `\\mark "${s.texto}" ` : ''}` + a[s.inicio]; return a; };
    const lineas = a => { const out = []; for (let i = 0; i < a.length; i += 4) out.push('  ' + a.slice(i, i + 4).join(' | ') + ' |'); return out.join('\n'); };
    const D = compases(res.der, nb, ly), I = compases(res.izq, nb, ly), B = compases(res.bajo, nb, ly);
    // vientos: un pentagrama por familia que toca algo (trompetas y saxos en clave de sol, trombones en clave de fa)
    const VI = [['trompetas', 'Trompetas', 'trumpet', 'treble'], ['trombones', 'Trombones', 'trombone', 'bass'], ['saxos', 'Saxos', 'tenor sax', 'treble']]
      .filter(([k]) => res.vientos && res.vientos[k] && res.vientos[k].length).map(([k, nom, midi, clef]) => ({ k, nom, midi, clef, a: compases(res.vientos[k], nb, ly) }));
    const vientosDef = VI.map(v => `${v.k} = {\n  \\global \\clef ${v.clef}\n${lineas(marcar(conDin(v.a)))}\n}\n`).join('');
    const vientosStaff = VI.map(v => `    \\new Staff \\with { instrumentName = "${v.nom}" midiInstrument = "${v.midi}" } \\${v.k}\n`).join('');
    const progTxt = res.secciones ? res.secciones.map(s => (s.nombre || s.marca) + (s.vueltas > 1 ? ' ×' + s.vueltas : '')).join(' · ') : res.prog.map(cs => cs.map(c => c.nombre).join('+')).join(' | ');
    const fuentes = o.fuentesTxt ? ` · ${o.fuentesTxt}` : '';
    const titulo = res.secciones ? (res.titulo || 'Canción').replace(/["\\]/g, '') : `Tumbao ${o.etiqueta ? o.etiqueta + " " : ""}(nuevo) · ${res.marca}`;
    return `\\version "2.24.0"
\\header {
  title    = "${titulo}"
  subtitle = "${progTxt} · clave de ${o.clave}${res.secciones ? '' : ' · variante ' + o.semilla}${fuentes}"
  clave    = "${o.clave}"
  percusion = "${o.percusionId || 'clasica'}"
}
global = { \\key ${nombre} ${menor ? '\\minor' : '\\major'} \\time 4/4 \\tempo 4 = ${o.bpm || 190} }
cifrado = \\chordmode { ${cif} }
pianoDer = {
  \\global \\clef treble \\mark "${secs[0].texto}"
${lineas(marcar(conDin(D), true))}
  \\bar "|."
}
pianoIzq = {
  \\global \\clef bass
${lineas(marcar(res.izq.length ? conDin(I) : I.map(() => 'R1')))}
}
bajo = {
  \\global \\clef bass
${lineas(marcar(res.bajo.length ? conDin(B) : B.map(() => 'R1')))}
}
${vientosDef}\\score {
  <<
    \\new ChordNames \\cifrado
${vientosStaff}    \\new PianoStaff <<
      \\new Staff \\with { instrumentName = "Piano" midiInstrument = "acoustic grand" } \\pianoDer
      \\new Staff \\with { midiInstrument = "acoustic grand" } \\pianoIzq
    >>
    \\new Staff \\with { instrumentName = "Bajo" midiInstrument = "acoustic bass" } \\bajo
  >>
  \\layout { }
  \\midi { }
}
`;
  }

  // ---------- MIDI del resultado (piano, bajo, percusión General MIDI)
  const APP_GM = { clave: 75, palito: 76, block: 77, cascara: 37, congaO: 63, congaS: 62, congaH: 62, muff: 62, salidor: 64, tresdos: 63, quintoO: 63, quintoS: 62,
    bongoH: 60, bongoL: 61, bongoM: 60, bell: 56, bellC: 56, bongoBell: 67, bongoBellC: 67, campana: 56, maraca: 70, guiroS: 73, guiroL: 74, timbalH: 65, timbalL: 66, plato: 57,
    kick: 36, bombo: 36, snare: 38, rim: 37, hhC: 42, hhP: 44, hhO: 46, ride: 51, rideBell: 53, crash: 49, tomH: 50, tomL: 45 };
  // o.porFamilia: una pista de percusión por familia (para el DAW); o.perc: golpes por compás que reemplazan a res.perc
  // (por ejemplo, los que tocó la página). Las secciones de una canción van como marcadores.
  function aMidi(res, bpm, o = {}) {
    const T = 120;   // ticks por semicorchea (480 por negra)
    const notas = evs => evs.flatMap(e => e.ps.map(m => ({ t: e.p * T, d: e.L * T - 6, m, v: e.v || 90 })));
    const pistas = [
      { nombre: 'piano', canal: 0, programa: 0, notas: [...notas(res.der), ...notas(res.izq)] },
      { nombre: 'bajo', canal: 1, programa: 32, notas: notas(res.bajo) },
      // vientos: una pista por familia (trompeta 56, trombón 57, saxo tenor 66)
      ...[['trompetas', 2, 56], ['trombones', 3, 57], ['saxos', 4, 66]].filter(([k]) => res.vientos && res.vientos[k] && res.vientos[k].length).map(([k, canal, programa]) => ({ nombre: k, canal, programa, notas: notas(res.vientos[k]) }))
    ];
    const golpes = (o.perc || res.perc || []).flatMap((evs, b) => (evs || []).concat((res.extra || [])[b] || []).filter(e => APP_GM[e.d]).map(e => ({ t: (b * 16 + e.p) * T, d: T, m: APP_GM[e.d], v: Math.round(Math.min(127, 100 * e.v)), d0: e.d })));
    if (golpes.length && o.porFamilia) {
      for (const f of Object.keys(TM.FAMILIAS)) { const n = golpes.filter(g => TM.familiaPerc(g.d0) === f); if (n.length) pistas.push({ nombre: f, canal: 9, programa: null, notas: n }); }
    } else if (golpes.length) pistas.push({ nombre: 'percusión', canal: 9, programa: null, notas: golpes });
    const marcas = res.secciones && res.secciones.length > 1 ? res.secciones.map(s => ({ t: s.inicio * 16 * T, texto: s.texto })) : null;
    return TM.escribirMidi({ ppq: 480, bpm: bpm || 190, pistas, marcas });
  }

  Object.assign(TM, { aLilyPond, aMidi, APP_GM });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
