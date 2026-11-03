/* =====================================================================
   MOTOR DE TUMBAOS · 1. MIDI
   Lectura y escritura de archivos MIDI estándar, sin dependencias.
   Corre igual en Node y en el navegador: todo cuelga de globalThis.TumbaoMotor.
   ===================================================================== */
(function (TM) {
  'use strict';

  // ---------- lectura: notas por canal, tempos, compases, nombres de pista
  function leerMidi(datos) {
    const b = datos instanceof Uint8Array ? datos : new Uint8Array(datos);
    let p = 0;
    const u32 = () => { const v = ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0; p += 4; return v; };
    const u16 = () => { const v = (b[p] << 8) | b[p + 1]; p += 2; return v; };
    const vlq = () => { let v = 0, c; do { c = b[p++]; v = (v << 7) | (c & 0x7f); } while ((c & 0x80) && p < b.length); return v; };
    const buscar = (s, desde) => {
      fuera: for (let i = desde; i <= b.length - 4; i++) { for (let j = 0; j < 4; j++) if (b[i + j] !== s.charCodeAt(j)) continue fuera; return i; }
      return -1;
    };
    const texto = (a, z) => { let s = ''; for (let i = a; i < z; i++) s += String.fromCharCode(b[i]); return s.trim(); };
    const hdr = buscar('MThd', 0);                       // algunos archivos traen un envoltorio RIFF
    if (hdr < 0) throw new Error('No es un archivo MIDI');
    p = hdr + 4;
    const hlen = u32(), formato = u16(), npistas = u16(), div = u16();
    p = hdr + 8 + hlen;
    const ppq = div & 0x8000 ? 480 : div;
    const pistas = [], tempos = [], compases = [], textos = [];
    for (let t = 0; t < npistas; t++) {
      const at = buscar('MTrk', p); if (at < 0) break;
      p = at + 4; const largo = u32(), fin = Math.min(b.length, p + largo);
      let tick = 0, estado = 0;
      const pista = { i: t, nombre: '', programas: {}, notas: [] };
      const abiertas = {};
      while (p < fin) {
        tick += vlq();
        const c = b[p];
        if (c & 0x80) { estado = c; p++; } else if (!estado) { p++; continue; }
        const tipo = estado & 0xf0, canal = estado & 0x0f;
        if (estado === 0xff) {
          const mt = b[p++], ml = vlq(), a = p; p += ml;
          if (mt === 0x03 && !pista.nombre) pista.nombre = texto(a, a + ml);
          else if (mt === 0x51) tempos.push({ tick, uspq: (b[a] << 16) | (b[a + 1] << 8) | b[a + 2] });
          else if (mt === 0x58) compases.push({ tick, num: b[a], den: 1 << b[a + 1] });
          else if (mt === 0x01 || mt === 0x05 || mt === 0x06) textos.push(texto(a, a + ml));
          else if (mt === 0x2f) break;
          estado = 0;
        } else if (estado === 0xf0 || estado === 0xf7) { const l = vlq(); p += l; estado = 0; }
        else if (tipo === 0x90 || tipo === 0x80) {
          const alt = b[p++], vel = b[p++], k = canal * 128 + alt;
          if (tipo === 0x90 && vel > 0) (abiertas[k] = abiertas[k] || []).push({ tick, vel });
          else { const pila = abiertas[k]; if (pila && pila.length) { const o = pila.shift(); pista.notas.push({ canal, alt, vel: o.vel, on: o.tick, off: tick }); } }
        }
        else if (tipo === 0xa0 || tipo === 0xb0 || tipo === 0xe0) p += 2;
        else if (tipo === 0xc0) { const pr = b[p++]; if (pista.programas[canal] == null) pista.programas[canal] = pr; }
        else p += 1;
      }
      for (const k in abiertas) for (const o of abiertas[k]) pista.notas.push({ canal: Math.floor(k / 128), alt: k % 128, vel: o.vel, on: o.tick, off: tick });
      pista.notas.sort((x, y) => x.on - y.on || x.alt - y.alt);
      pistas.push(pista);
      p = fin;
    }
    tempos.sort((x, y) => x.tick - y.tick);
    return { formato, ppq, pistas, tempos, compases, textos };
  }

  // ---------- escritura: formato 1, una pista por instrumento
  // pistas: [{nombre, canal, programa, notas:[{t, d, m, v}]}]  (t y d en ticks; v 1..127)
  // marcas: [{t, texto}] → marcadores de sección en la pista 0
  function escribirMidi({ ppq = 480, bpm = 190, pistas, marcas }) {
    const bytes = [];
    const u32 = (a, v) => a.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
    const u16 = (a, v) => a.push((v >>> 8) & 255, v & 255);
    const vlq = (a, v) => { const s = [v & 0x7f]; while ((v >>>= 7)) s.unshift((v & 0x7f) | 0x80); a.push(...s); };
    const str = s => Array.from(s).map(c => c.charCodeAt(0) & 255);
    const chunk = (id, cuerpo) => { bytes.push(...str(id)); u32(bytes, cuerpo.length); for (const x of cuerpo) bytes.push(x); };
    const cab = []; u16(cab, 1); u16(cab, pistas.length + 1); u16(cab, ppq); chunk('MThd', cab);
    const t0 = []; const us = Math.round(60e6 / bpm);
    vlq(t0, 0); t0.push(0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255);
    vlq(t0, 0); t0.push(0xff, 0x58, 4, 4, 2, 24, 8);
    let tm = 0;
    for (const mk of (marcas || []).slice().sort((x, y) => x.t - y.t)) { const s = str(mk.texto || ''); vlq(t0, mk.t - tm); tm = mk.t; t0.push(0xff, 0x06); vlq(t0, s.length); t0.push(...s); }
    vlq(t0, 0); t0.push(0xff, 0x2f, 0); chunk('MTrk', t0);
    for (const pi of pistas) {
      const ev = [];
      for (const n of pi.notas) { ev.push([n.t, 1, n.m, n.v]); ev.push([n.t + Math.max(1, n.d), 0, n.m, 0]); }
      ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      const tr = []; const nm = str(pi.nombre || '');
      vlq(tr, 0); tr.push(0xff, 0x03); vlq(tr, nm.length); tr.push(...nm);
      if (pi.programa != null) { vlq(tr, 0); tr.push(0xc0 | pi.canal, pi.programa & 127); }
      let ult = 0;
      for (const [t, on, m, v] of ev) { vlq(tr, t - ult); ult = t; tr.push((on ? 0x90 : 0x80) | pi.canal, m & 127, on ? Math.max(1, Math.min(127, v)) : 0); }
      vlq(tr, 0); tr.push(0xff, 0x2f, 0); chunk('MTrk', tr);
    }
    return new Uint8Array(bytes);
  }

  TM.leerMidi = leerMidi;
  TM.escribirMidi = escribirMidi;
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
