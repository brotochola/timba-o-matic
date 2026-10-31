/* =====================================================================
   MOTOR DE TUMBAOS · 4. GENERADOR
   Piano, bajo y percusión a partir de los acordes, aprendiendo del modelo:
   1. gancho: células reales (lado 3 | lado 2) de una misma fuente, ajustadas por las perillas y repetidas con variación
   2. armonía: cada ataque con su acorde; anticipo en el 4& cuando el acorde cambia y ligadura al 1
   3. línea: búsqueda en haz sobre la nota de arriba (función armónica, intervalo, zigzag, enlace, registro, gancho)
   4. voicing: octava, octava con la nota de adentro, díada o acorde debajo de la línea; mano izquierda según el modo
   5. bajo: células aprendidas por rol (raíz, quinta, anticipo…) o patrones de la guía; percusión: juegos aprendidos
   Todo en semicorcheas: el compás tiene 16; p = compás*16 + posición.
   ===================================================================== */
(function (TM) {
  'use strict';
  const pc = m => ((m % 12) + 12) % 12;
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const elegir = (R, items, peso) => { let tot = 0; const w = items.map(x => { const v = Math.max(0, peso(x)); tot += v; return v; }); if (!tot) return items[Math.floor(R() * items.length)]; let r = R() * tot; for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };
  const gumbel = R => -Math.log(-Math.log(Math.min(0.999999, Math.max(1e-7, R()))));
  const plegar = d => ((d % 12) + 18) % 12 - 6;
  const LN = x => Math.log(Math.max(1e-6, x));

  // ---------- marchas: cómo cambian el piano, el bajo y la percusión
  const MARCHAS = {
    cuerpo: { dens: 0.82, oct: 0.6, blq: 1.2, semi: 0.5, perc: 'cuerpo', bajo: 'salsa', marca: 'Cuerpo · tumbao' },
    marcha: { dens: 1, oct: 1, blq: 1, semi: 1, perc: 'marcha', bajo: 'aprendido', marca: 'Coro · marcha' },
    mambo: { dens: 1, oct: 0.8, blq: 1.8, semi: 1, perc: 'mambo', bajo: 'aprendido', marca: 'Mambo · marcha de mambo' },
    presion: { dens: 0.62, oct: 0.4, blq: 2.2, semi: 0.3, perc: 'presion', bajo: 'pedal', marca: 'Presión' },
    // bomba: el otro breakdown de la timba (Kevin Moore, Beyond Salsa Percussion); el bajo se desliza por la cuerda grave
    bomba: { dens: 0.85, oct: 0.7, blq: 1.4, semi: 0.6, perc: 'bomba', bajo: 'deslizado', marca: 'Bomba' },
    despelote: { dens: 1.2, oct: 0.8, blq: 1.6, semi: 2.5, rep: 0.6, perc: 'despelote', bajo: 'deslizado', marca: 'Despelote' },
    muela: { dens: 0.55, oct: 0.15, blq: 0.5, semi: 0, perc: 'muela', bajo: 'muela', marca: 'Muela' }
  };

  // ---------- perillas: valor por defecto y cómo se muestran
  const PERILLAS_UI = [
    { g: 'Piano · ritmo y textura', id: 'frase', l: 'De dónde sale el piano', tipo: 'sel', def: 'generado', ops: [['generado', 'generado nota por nota'], ['frase', 'frase real de la base']], h: 'Generado: células reales de la base y la línea buscada nota por nota, con todas las perillas. Frase real: toca tal cual lo que tocó el pianista de un tema de la base (ritmo, voces, mano izquierda y fuerza de cada golpe) y le acomoda las notas a tus acordes; las perillas del piano no la cambian, salvo «sin mano izquierda». Suena mejor con la colección Toontrack' },
    { g: 'Piano · ritmo y textura', id: 'dens', l: 'Densidad', min: 0.5, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Cuántos ataques por compás, respecto de la célula elegida' },
    { g: 'Piano · ritmo y textura', id: 'oct', l: 'Octavas', min: 0, max: 2, st: 0.05, def: 1, f: 'x', h: 'Más o menos ataques en octava (la línea que «habla»)' },
    { g: 'Piano · ritmo y textura', id: 'blq', l: 'Bloques (díadas y acordes)', min: 0, max: 2.5, st: 0.05, def: 1, f: 'x', h: 'El golpe armónico, sobre todo en el 3& y el 1& del lado 3' },
    { g: 'Piano · ritmo y textura', id: 'int', l: 'Nota adentro de la octava', min: 0, max: 3, st: 0.1, def: 1, f: 'x', h: 'Una 3a o 4a pegada debajo de la nota de arriba' },
    { g: 'Piano · ritmo y textura', id: 'semi', l: 'Semicorcheas', min: 0, max: 6, st: 0.25, def: 1, f: 'x', h: 'Notas de paso picadas antes de los contratiempos' },
    { g: 'Piano · ritmo y textura', id: 'leg', l: 'Legato', min: 0, max: 1, st: 0.05, def: 0.6, f: '%', h: 'De picado (0) a ligado hasta el ataque siguiente (100%)' },
    { g: 'Piano · línea', id: 'ten', l: 'Tensiones (9, 11, 13)', min: 0, max: 3, st: 0.1, def: 1, f: 'x', h: 'Color en la nota de arriba' },
    { g: 'Piano · línea', id: 'crom', l: 'Cromatismo', min: 0, max: 3, st: 0.1, def: 1, f: 'x', h: 'Apoyaturas a medio tono que resuelven en una nota del acorde' },
    { g: 'Piano · línea', id: 'salto', l: 'Pasos ↔ saltos', min: -1, max: 1, st: 0.05, def: 0, f: '±', h: 'Negativo: más por grado conjunto; positivo: más saltos de 3a y 4a' },
    { g: 'Piano · línea', id: 'zig', l: 'Zigzag', min: 0, max: 2, st: 0.05, def: 1, f: 'x', h: 'Después de un salto, volver para el otro lado' },
    { g: 'Piano · línea', id: 'rep', l: 'Notas repetidas', min: 0, max: 1, st: 0.05, def: 0, f: '%', h: 'Empuje de notas repetidas (despelote, Melón)' },
    { g: 'Piano · línea', id: 'reg', l: 'Registro', min: -12, max: 12, st: 1, def: 0, f: '±st', h: 'Corre la línea hacia el grave o el agudo (0 = como la base, alrededor de F5)' },
    { g: 'Piano · línea', id: 'amb', l: 'Ámbito', min: 2, max: 12, st: 0.5, def: 7, f: 'st', h: 'Cuánto se aleja la línea del centro' },
    { g: 'Piano · línea', id: 'lh', l: 'Mano izquierda', tipo: 'sel', def: 'auto', ops: [['auto', 'como la fuente'], ['dobla8', 'dobla a la octava'], ['dobla16', 'dobla a dos octavas'], ['decima', 'décimas'], ['contrario', 'movimiento contrario'], ['ancla', 'ancla en el grave'], ['nada', 'sin mano izquierda']], h: 'Qué hace la izquierda debajo de la línea. «Como la fuente» copia lo que hacía el pianista del tema elegido de la base' },
    { g: 'Piano · armonía y forma', id: 'ant', l: 'Anticipos en el 4&', min: 0, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Probabilidad de traer el acorde nuevo una corchea antes (la base: 72% hacia el lado 3, 44% hacia el lado 2)' },
    { g: 'Piano · armonía y forma', id: 'liga', l: 'Ligar el anticipo al 1', min: 0, max: 1.25, st: 0.05, def: 1, f: 'x', h: 'No volver a atacar el 1 después del anticipo' },
    { g: 'Piano · armonía y forma', id: 'dim', l: 'Disminuido de paso', min: 0, max: 1, st: 0.05, def: 0, f: '%', h: 'En el 4, un °7 medio tono abajo del acorde que viene (Pupy)' },
    { g: 'Piano · armonía y forma', id: 'gancho', l: 'Gancho fijo', min: 0, max: 1, st: 0.05, def: 0.75, f: '%', h: 'Cuánto repite las mismas notas cuando vuelven los mismos acordes' },
    { g: 'Piano · armonía y forma', id: 'var', l: 'Variación por vuelta', min: 0, max: 1, st: 0.05, def: 0.35, f: '%', h: 'Chance de cambiarle algo al ritmo en cada repetición' },
    { g: 'Piano · armonía y forma', id: 'largo', l: 'Largo del gancho', tipo: 'sel', def: 'auto', ops: [['auto', 'automático'], ['2', '2 compases (una clave)'], ['4', '4 compases (dos claves)'], ['8', '8 compases (cuatro claves)']], h: 'Cada cuántos compases se repite el gancho. Automático: 4 si la progresión dura 4, 8 o 16 compases; si no, 2' },
    { g: 'Piano · armonía y forma', id: 'mezcla', l: 'Mezclar fuentes', min: 0, max: 1, st: 0.05, def: 0.15, f: '%', h: '0 = todas las células de un mismo tema de la base; 100% = de cualquiera' },
    { g: 'Piano · armonía y forma', id: 'temp', l: 'Libertad', min: 0, max: 2, st: 0.05, def: 0.6, f: 'x', h: 'Cuánto se permite salir de lo más probable' },
    { g: 'Piano · armonía y forma', id: 'acc', l: 'Acentos', min: 0, max: 2, st: 0.05, def: 1, f: 'x', h: 'Contraste entre los golpes fuertes y los suaves' },
    { g: 'Bajo', id: 'b_estilo', l: 'Qué toca', tipo: 'sel', def: 'auto', ops: [['auto', 'según la marcha de la sección'], ['aprendido', 'aprendido de la base'], ['salsa', 'tumbao de salsa (2& y 4)'], ['timbero', 'timbero (anticipos)'], ['songo', 'songo Van Van'], ['motivo', 'motivo con el piano (Pupy)'], ['pedal', 'nota pedal (una, grave y larga)'], ['largas', 'notas largas (cada 2 compases)'], ['deslizado', 'deslizamientos y golpes'], ['muela', 'de muela'], ['ninguno', 'sin bajo']], h: 'De dónde sale el bajo: aprendido de la base o un patrón de la guía. Nota pedal: una sola nota grave que se sostiene (presión). Notas largas: la raíz cada dos compases, sostenida (el «pedal» de Kevin Moore). Deslizamientos: deja el tumbao, golpes cortos y la mano que se desliza por la cuerda grave (Feliciano Arango). «Según la marcha» elige el que le queda a cada marcha' },
    { g: 'Bajo', id: 'b_ant', l: 'Anticipo del bajo', tipo: 'sel', def: 'auto', ops: [['auto', 'como la célula'], ['12', 'en el 4'], ['14', 'en el 4&']], h: 'En qué momento el bajo trae la raíz del acorde que viene: en el 4 (salsa) o en el 4& (timba)' },
    { g: 'Bajo', id: 'b_aprox', l: 'Aproximaciones cromáticas', min: 0, max: 1, st: 0.05, def: 0.25, f: '%', h: 'Medio tono antes de la raíz que viene' },
    { g: 'Bajo', id: 'b_dens', l: 'Densidad del bajo', min: 0.5, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Más o menos notas por compás en el bajo' },
    { g: 'Bajo', id: 'b_reg', l: 'Registro del bajo', tipo: 'sel', def: 'medio', ops: [['grave', 'grave'], ['medio', 'medio'], ['agudo', 'agudo']], h: 'En qué octava toca el bajo' },
    { g: 'Bajo', id: 'b_gliss', l: 'Deslizamientos', min: 0, max: 1, st: 0.05, def: 0, f: '%', h: 'Glissando hacia abajo en los saltos grandes, en cualquier estilo (el estilo «deslizamientos» ya los trae)' },
    { g: 'Percusión', id: 'p_fuente', l: 'Percusión', tipo: 'sel', def: 'aprendida', ops: [['aprendida', 'aprendida de la base'], ['clasica', 'clásica por marcha (la de antes)']], h: 'Aprendida: juegos reales de la base (en cuerpo, coro y mambo). Clásica: los patrones de la guía para cada marcha' },
    { g: 'Percusión', id: 'p_int', l: 'Intensidad', min: 0, max: 1, st: 0.05, def: 0.55, f: '%', h: 'Juegos más ralos o más cargados' },
    { g: 'Percusión', id: 'p_cambio', l: 'Cambiar el patrón', tipo: 'sel', def: '8', ops: [['0', 'nunca'], ['8', 'cada 8 compases'], ['4', 'cada 4 compases']], h: 'Cada cuánto puede pasar a otro juego de percusión parecido, para que no sea un loop idéntico' },
    { g: 'Percusión', id: 'p_relleno', l: 'Rellenos al final de la vuelta', min: 0, max: 1, st: 0.05, def: 0.6, f: '%', h: 'Chance de un repique de timbal en el último compás de cada vuelta, con platillo en el 1 que sigue' },
    { g: 'Mezcla de percusión', id: 'm_clave', l: 'Clave', min: 0, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Volumen de la clave (0 = no suena)' },
    { g: 'Mezcla de percusión', id: 'm_congas', l: 'Congas', min: 0, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Volumen de las congas: tumba, conga y quinto (0 = no suenan)' },
    { g: 'Mezcla de percusión', id: 'm_bongo', l: 'Bongó', min: 0, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Volumen del bongó (0 = no suena)' },
    { g: 'Mezcla de percusión', id: 'm_campanas', l: 'Campanas', min: 0, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Volumen de las campanas: la del bongó y la del timbal (0 = no suenan)' },
    { g: 'Mezcla de percusión', id: 'm_timbales', l: 'Timbales y palitos', min: 0, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Volumen de timbales, cáscara y palitos (0 = no suenan)' },
    { g: 'Mezcla de percusión', id: 'm_guiro', l: 'Güiro', min: 0, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Volumen del güiro (0 = no suena)' },
    { g: 'Mezcla de percusión', id: 'm_bateria', l: 'Batería', min: 0, max: 1.5, st: 0.05, def: 0.8, f: 'x', h: 'Volumen de la batería: bombo, caja, charles y platillos (0 = no suena)' }
  ];
  const PERILLAS = Object.fromEntries(PERILLAS_UI.map(k => [k.id, k.def]));
  // las ondas de la app como ajustes de perillas (y de qué estilo de la base aprender; grupo: los estilos de una colección,
  // como los de Toontrack, que la onda prefiere cuando están en la base)
  const ONDAS = {
    pupy: { gancho: 0.9, var: 0.15, lh: 'contrario', crom: 1.6, dim: 0.35, ten: 1.2, semi: 1.5, b_estilo: 'motivo', estilo: 'timba' },
    melon: { lh: 'decima', semi: 3, oct: 0.6, rep: 0.35, gancho: 0.8, b_estilo: 'timbero', estilo: 'timba' },
    tirso: { blq: 1.8, salto: 0.5, zig: 1.4, lh: 'ancla', largo: '4', b_estilo: 'timbero', estilo: 'timba' },
    songo: { dens: 0.75, oct: 1.2, leg: 0.85, semi: 0.3, lh: 'dobla8', b_estilo: 'songo', estilo: 'cubano', grupo: ['songo'] },
    sonmontuno: { lh: 'auto', b_estilo: 'salsa', estilo: 'cubano', grupo: ['son_montuno'] },
    mambo: { lh: 'auto', blq: 1.3, b_estilo: 'aprendido', estilo: 'cubano', grupo: ['mambo'] },
    funk: { lh: 'auto', b_estilo: 'timbero', estilo: 'cubano', grupo: ['funk_cubano'] },
    salsa: { lh: 'auto', b_estilo: 'aprendido', estilo: 'salsa', grupo: ['salsa_media', 'salsa_rapida'] },
    libre: {}
  };
  // tipo de sección de la canción → secciones de la base que le sirven (sin tipo, sale de la marcha)
  const SECCION_BASE = { intro: ['intro'], cuerpo: ['cuerpo'], coro: ['coro'], bloque: ['coro'], mambo: ['mambo'], mona: ['mambo', 'solo'], final: ['final', 'coro'] };
  const TIPO_DE_MARCHA = { cuerpo: 'cuerpo', marcha: 'coro', mambo: 'mambo' };

  // ---------- células de bajo de la guía, con roles: [posición, duración, rol, salto sugerido]
  const BAJO_GUIA = {
    salsa: [[6, 6, '5', null], [12, 8, 'R+', null], [22, 6, '5', null], [28, 8, 'R+', null]],
    timbero: [[0, 4, 'R', null], [6, 4, 'R', 12], [10, 2, '5', null], [14, 4, 'R+', null], [20, 4, '5', null], [24, 4, 'R', 12], [28, 2, 'apB', null], [30, 4, 'R+', null]],
    songo: [[6, 4, 'R', 12], [10, 4, '5', null], [14, 4, 'R+', null], [18, 4, 'R', null], [22, 2, 'R', 12], [24, 4, '5', null], [30, 4, 'R+', null]],
    muela: [[0, 4, 'R', null], [14, 2, '5', null], [16, 4, 'R', null], [24, 2, 'R', null]]
  };

  // ---------- percusión: clave y relleno
  const CLAVE16 = { son: { A: [0, 6, 12], B: [4, 8] }, rumba: { A: [0, 6, 14], B: [4, 8] } };
  const RELLENO = [[10, 'timbalH', 0.55], [11, 'timbalH', 0.45], [12, 'timbalH', 0.75], [13, 'timbalL', 0.6], [14, 'timbalL', 0.9], [15, 'timbalL', 0.7]];

  // opc.contexto (una sección de una canción): { inicio: compás global, siguiente: acordes del compás que sigue (null al final),
  // previo: { linea, bajo, ligaAl1, entraSolo } de la sección anterior, gancho: el de otra sección, transicion }
  function generar(opc, M) {
    const k = Object.assign({}, PERILLAS, opc.perillas || {});
    const ctx = opc.contexto || null, C = ctx || {}, previo = C.previo || null;
    // cada instrumento puede tener su propia variante (opc.semillas: piano, bajo, perc); si no, la de la sección
    const sem = opc.semillas || {}, sP = sem.piano || opc.semilla || 1, sB = sem.bajo || opc.semilla || 1, sC = sem.perc || opc.semilla || 1;
    const R = rng(sP * 2654435761 + 7);
    // en una canción cada etapa sortea aparte: cambiar el final de una sección no corre los sorteos de lo que viene antes
    const sub = (s, n) => ctx ? rng(s * 2654435761 + 7 + n * 0x9E3779B9) : R;
    const RA = sub(sP, 1), RL = sub(sP, 2), RV = sub(sP, 3), RB = sub(sB, 4), RP = sub(sC, 5);
    const mar = MARCHAS[opc.marcha] || MARCHAS.marcha;
    // el piano y la percusión pueden ir en otra marcha que la sección (el bajo la sigue con su estilo «según la marcha»)
    const marP = MARCHAS[opc.marchaPiano] || mar, marC = MARCHAS[opc.marchaPerc] || mar;
    const prog = Array.isArray(opc.prog) ? opc.prog : TM.leerProgresion(opc.prog);
    if (!prog.length) throw new Error('Escribí una progresión, por ejemplo: Em C Am B7');
    const L = prog.length, nb = L * (opc.vueltas || 1);
    const tresPrimero = /3-2/.test(opc.clave || 'son 3-2'), tipoClave = /rumba/.test(opc.clave || '') ? 'rumba' : 'son';
    const lado = b => ((b + (C.inicio || 0) + (tresPrimero ? 0 : 1)) % 2 === 0 ? 'A' : 'B');
    const ultimo = () => { const cs = prog[(nb - 1) % L]; return [cs[cs.length - 1]]; };
    const acordesDe = b => ctx && b >= nb ? (C.siguiente || ultimo()) : prog[((b % L) + L) % L];
    const acordeEn = (b, pos) => { const cs = acordesDe(b); return cs.length > 1 && pos >= 8 ? cs[1] : cs[0]; };
    const P = M.piano;
    const info = {};

    // =========================== PIANO ===========================
    const der = [], izq = [];
    const efect = { dens: k.dens * marP.dens, oct: k.oct * marP.oct, blq: k.blq * marP.blq, semi: k.semi * marP.semi, rep: Math.max(k.rep, marP.rep || 0) };
    let pianoOK = P.ciclos.length > 0;
    let ganchoFin = null, ligaFin = false, lineaFin = previo ? previo.linea : null;
    if (pianoOK) {
      // gancho de otra sección: misma fuente, mismas células y la memoria de sus notas
      const G0 = C.gancho && !C.gancho.frase && C.gancho.H <= nb ? C.gancho : null;
      // fuente principal (un tema de la base), con peso por raíz del número de ciclos. Las fuentes que dicen de qué sección
      // son (Toontrack: intro, A, coro, mambo…) pesan más en una sección de ese tipo, y las del grupo de la onda, más todavía
      const porF = {}; for (const c of P.ciclos) (porF[c.f] = porF[c.f] || []).push(c);
      const fs = Object.keys(porF);
      const pref = opc.estiloPreferido, cubano = e => e === 'cubano' || e === 'timba';
      const coincide = e => !pref || (pref === 'salsa' ? e === 'salsa' : cubano(pref) ? cubano(e) : e === pref);
      const secOK = SECCION_BASE[opc.tipoPiano || opc.tipo || TIPO_DE_MARCHA[opc.marchaPiano || opc.marcha]] || null;
      const grupos = opc.grupo ? [].concat(opc.grupo) : null;
      const pesoSec = c => !c.seccion || !secOK ? 1 : secOK.includes(c.seccion) ? 4 : 0.3;
      const pesoGrupo = c => !grupos ? 1 : grupos.includes(c.grupo) ? 6 : c.grupo ? 0.3 : 0.5;
      const pesoF = f => { const c = porF[f][0]; return Math.sqrt(porF[f].length) * (coincide(c.estilo) ? 1 : 0.15) * pesoSec(c) * pesoGrupo(c); };
      const Fprev = G0 ? G0.F : C.gancho && C.gancho.frase ? C.gancho.F : null;
      const F = Fprev && porF[Fprev] ? Fprev : elegir(R, fs, pesoF);
      info.piano = F;
      if (k.frase === 'frase') {
        // ---------- frase real: los ciclos de la fuente en orden, con las notas acomodadas a los acordes de la sección
        info.frase = true;
        const cic = porF[F].slice().sort((a, b) => a.c - b.c), n = cic.length;
        const desde = C.gancho && C.gancho.frase && C.gancho.F === F ? C.gancho.desde : R() < 0.5 ? 0 : Math.floor(R() * n);
        const desfase = lado(0) === 'B' ? 1 : 0;
        // una nota del acorde S (el de la fuente) al acorde T: la misma función (raíz, 3a, 5a, 7a) y, si es tensión o cromática,
        // el mismo intervalo; las largas que no le quedan al acorde nuevo van a la nota del acorde más cercana
        const mapear = (m, S, T, larga) => {
          if (!S || !T || S.nombre === T.nombre) return m;
          const iv = pc(m - S.raiz), A = S.fun, B = T.fun;
          let nv = iv;
          if (iv === 0) nv = 0;
          else if (iv === A.t) nv = B.t ?? iv;
          else if (iv === A.f) nv = B.f;
          else if (A.s != null && iv === A.s) nv = B.s ?? (iv === 9 ? 9 : 12);
          else if (larga && !B.T.includes(iv) && !T.pcs.includes((iv + T.raiz) % 12)) { let best = null; for (const x of T.pcs) { const d = plegar(x - T.raiz - iv); if (best == null || Math.abs(d) < Math.abs(best)) best = d; } nv = iv + best; }
          return m + plegar(T.raiz - S.raiz) + plegar(nv - iv);
        };
        const evs = [];
        for (let b = 0; b < nb; b++) {
          const cy = cic[(desde + Math.floor((b + desfase) / 2)) % n], L_ = lado(b), cs = acordesDe(b);
          for (const e of cy.ev) {
            if ((e.p < 16) !== (L_ === 'A')) continue;
            const pos = e.p % 16;
            const T = !e.antic ? acordeEn(b, pos) : pos >= 12 ? acordesDe(b + 1)[0] : cs.length > 1 && pos >= 4 && pos < 8 ? cs[1] : acordeEn(b, pos);
            const ps = [...new Set(e.ps.map(m => mapear(m, e.ch, T, e.d >= 3)))].sort((x, y) => x - y);
            evs.push({ p: b * 16 + pos, d: e.d, ps, v: e.v, ch: T, antic: !!e.antic && T.nombre !== acordeEn(b, pos).nombre });
          }
        }
        // las dos manos por registro (debajo del sol de la clave de fa, la izquierda); cada mano sin pisarse con su ataque siguiente
        const manos = { der: [], izq: [] };
        for (const e of evs) {
          const d = e.ps.filter(m => m >= 55), i = k.lh === 'nada' ? [] : e.ps.filter(m => m < 55);
          if (d.length) manos.der.push({ ...e, ps: d });
          if (i.length) manos.izq.push({ ...e, ps: i });
        }
        for (const [mano, out] of [[manos.der, der], [manos.izq, izq]]) mano.forEach((e, i) => {
          const gap = (mano[i + 1] ? mano[i + 1].p : nb * 16) - e.p;
          out.push({ p: e.p, L: Math.max(1, Math.min(e.d, gap)), ps: e.ps, v: Math.max(30, Math.min(127, e.v)), art: e.v >= 100 ? '->' : '', antic: e.antic, ch: e.ch });
        });
        const ult = der[der.length - 1];
        lineaFin = ult ? { m: ult.ps[ult.ps.length - 1], pd: 0, ch: ult.ch.nombre, f: null } : lineaFin;
        if (ctx) ganchoFin = { frase: true, F, desde, H: 2 };
      } else {
      const meta = (P.densidad.A + P.densidad.B) / 2 * efect.dens;
      const elegirCelula = (parecida) => {
        const pool = R() < k.mezcla ? P.ciclos : porF[F];
        return elegir(R, pool, c => {
          // cada ciclo es una muestra real: sin perilla de densidad, todos pesan igual
          let w = Math.abs(efect.dens - 1) < 0.02 ? 1 : Math.exp(-((((c.n / 2) - meta) / 2.2) ** 2));
          if (parecida) { const a = new Set(parecida.ev.map(e => e.p)), b = c.ev.map(e => e.p); const inter = b.filter(x => a.has(x)).length; w *= 0.2 + inter / Math.max(a.size, b.length); }
          return w;
        });
      };
      // largo del gancho (en compases)
      let H = k.largo === 'auto' ? (L % 4 === 0 ? 4 : 2) : +k.largo;
      if (H > nb) H = nb % 2 === 0 ? nb : 2;
      if (G0) H = G0.H;
      const nCel = Math.max(1, H / 2);
      const celulas = G0 ? G0.celulas : [elegirCelula(null)];
      if (!G0) for (let i = 1; i < nCel; i++) celulas.push(R() < 0.4 ? celulas[0] : elegirCelula(celulas[0]));
      const desfase = lado(0) === 'B' ? 1 : 0;
      // mitades del gancho: compás j del gancho → la mitad de su lado de la célula que le toca
      const mitad = (cel, L_) => cel.ev.filter(e => (L_ === 'A') === (e.p < 16)).map(e => ({
        pos: e.p % 16, d: e.d, t: e.t, izq: e.izq, v: e.v, srcF: e.f,
        inner: (e.der === 'octava+1' || e.der === 'octava+2') ? (() => { const inn = e.ps.filter(x => x > e.top - 12 && x < e.top); return inn.length ? e.top - inn[inn.length - 1] : null; })() : null
      }));
      const tex = (L_, pos) => P.tex[L_][pos] || {};
      const muestraTextura = (L_, pos, actual) => {
        const base = tex(L_, pos), tot = Object.values(base).reduce((a, b) => a + b, 0) || 1;
        const mult = { o: efect.oct, x: 1, d: efect.blq, a: efect.blq };
        const ops = ['o', 'x', 'd', 'a'];
        return elegir(R, ops, t => ((actual === t ? 0.7 : 0) + 0.3 * (base[t] || 0) / tot) * mult[t]);
      };
      const ajustar = (evs, L_) => {   // perillas de densidad, semicorcheas y textura (una vez por compás del gancho)
        evs = evs.map(e => ({ ...e }));
        const perf = P.perfil[L_];
        const objetivo = Math.round(evs.length * efect.dens);
        while (evs.length > Math.max(2, objetivo)) {
          const cand = evs.filter(e => e.pos !== 14 && e.pos !== 6); if (!cand.length) break;
          const x = elegir(R, cand, e => 1.05 - perf[e.pos]); evs.splice(evs.indexOf(x), 1);
        }
        while (evs.length < Math.min(8, objetivo)) {
          const libres = [0, 2, 4, 6, 8, 10, 12, 14].filter(p => !evs.some(e => e.pos === p)); if (!libres.length) break;
          const p = elegir(R, libres, q => perf[q]);
          evs.push({ pos: p, d: 2, t: muestraTextura(L_, p, null), izq: 'nada', v: 80, inner: null });
        }
        const pSemi = Math.min(0.9, P.tasaSemis * efect.semi * 2.5);
        for (const e of evs.slice()) if (e.pos % 4 === 2 && e.pos > 0 && !evs.some(x => x.pos === e.pos - 1) && R() < pSemi) evs.push({ pos: e.pos - 1, d: 1, t: 'x', izq: 'nada', v: 70, inner: null, paso: true });
        if (efect.oct !== 1 || efect.blq !== 1) for (const e of evs) if (!e.paso) e.t = muestraTextura(L_, e.pos, e.t);
        return evs.sort((a, b) => a.pos - b.pos);
      };
      const ef = JSON.stringify(efect);
      const gancho = G0 && G0.lado0 === lado(0) && G0.ef === ef ? G0.gancho : [];
      if (!gancho.length) for (let j = 0; j < H; j++) { const L_ = lado(j), cel = celulas[Math.floor((j + desfase) / 2) % nCel]; gancho.push(ajustar(mitad(cel, L_), L_)); }
      info.celulas = celulas.map(c => c.ritmo);
      // variación por vuelta
      const variar = (evs, L_) => {
        evs = evs.map(e => ({ ...e }));
        const perf = P.perfil[L_], op = Math.floor(R() * 4);
        if (op === 0) { const c = evs.filter(e => e.pos % 4 === 0); if (c.length && evs.length > 3) evs.splice(evs.indexOf(elegir(R, c, e => 1.05 - perf[e.pos])), 1); }
        else if (op === 1) { const lib = [0, 2, 4, 6, 8, 10, 12, 14].filter(p => !evs.some(e => e.pos === p)); if (lib.length) { const p = elegir(R, lib, q => perf[q]); evs.push({ pos: p, d: 2, t: muestraTextura(L_, p, null), izq: 'nada', v: 80 }); } }
        else if (op === 2) { const c = evs.filter(e => e.pos % 4 === 2 && e.pos > 0 && !evs.some(x => x.pos === e.pos - 1)); if (c.length) { const e = c[Math.floor(R() * c.length)]; evs.push({ pos: e.pos - 1, d: 1, t: 'x', izq: 'nada', v: 70, paso: true }); } }
        else { const c = evs.filter(e => !e.paso); if (c.length) { const e = c[Math.floor(R() * c.length)]; e.t = e.t === 'o' ? 'x' : 'o'; } }
        return evs.sort((a, b) => a.pos - b.pos);
      };
      // eventos de toda la pieza
      const E = [];
      for (let b = 0; b < nb; b++) {
        const j = b % H, r = Math.floor(b / H);
        const evs = r > 0 && R() < k.var ? variar(gancho[j], lado(b)) : gancho[j];
        for (const e of evs) E.push({ ...e, b, j, r, p16: b * 16 + e.pos, ch: acordeEn(b, e.pos) });
      }
      // anticipos, ligaduras, segundo acorde en el 2& y disminuido de paso
      const quitar = new Set();
      for (let b = 0; b < nb; b++) {
        const cs = acordesDe(b), sigCh = acordesDe(b + 1)[0], ult = cs[cs.length - 1];
        const delCompas = E.filter(e => e.b === b);
        if (sigCh.nombre !== ult.nombre) {
          let cand = delCompas.find(e => e.pos === 14);
          const pA = Math.min(0.97, P.pAnticipo[lado(b + 1)] * k.ant);
          // sin 4& en la célula: la mitad de las veces se agrega el ataque para anticipar (el 4& se toca en el 84% de los compases)
          if (!cand && RA() < pA * 0.5 && !delCompas.some(e => e.pos === 15)) { cand = { pos: 14, d: 2, t: 'o', izq: 'nada', v: 90, inner: null, b, j: b % H, r: Math.floor(b / H), p16: b * 16 + 14, ch: ult }; E.push(cand); }
          if (cand && RA() < pA) {
            cand.ch = sigCh; cand.antic = true;
            if (RA() < Math.min(1, P.pAnticipo.liga * k.liga)) { const uno = E.find(e => e.b === b + 1 && e.pos === 0); if (uno) quitar.add(uno); cand.liga = true; if (b === nb - 1) ligaFin = true; }
          }
          if (k.dim > 0 && RA() < k.dim) {
            const cuatro = delCompas.find(e => e.pos === 12 && !e.antic);
            if (cuatro) { const r0 = (sigCh.raiz + 11) % 12; cuatro.ch = TM.acorde(TM.NOM[r0] + 'dim7'); cuatro.dim = true; }
          }
        }
        if (cs.length > 1 && cs[1].nombre !== cs[0].nombre) {
          const m = delCompas.find(e => e.pos === 6);
          if (m && RA() < Math.min(0.97, P.pAnticipo.mitad * k.ant)) { m.ch = cs[1]; m.antic = true; }
        }
      }
      // la sección anterior terminó anticipando ligado: no se vuelve a atacar el 1
      if (previo && previo.ligaAl1) { const uno = E.find(e => e.b === 0 && e.pos === 0); if (uno) quitar.add(uno); }
      const EV = E.filter(e => !quitar.has(e)).sort((a, b) => a.p16 - b.p16);
      EV.forEach((e, i) => { e.metrica = e.pos % 2 ? 'semi' : e.pos % 4 === 0 ? 'tiempo' : 'contra'; e.gap = (EV[i + 1] ? EV[i + 1].p16 : nb * 16) - e.p16; });

      // ---------- la línea, por tramos del largo del gancho (para recordar la vuelta anterior)
      // la búsqueda en haz se queda con lo más probable; para no perder el color, cada ataque sortea antes
      // qué función va a tener (R, 3, 5, 7, tensión, cromática) con las proporciones de la base
      const totI = Object.values(P.intervalos).reduce((a, b) => a + b, 0) || 1;
      const INT = d => LN(((P.intervalos[d] || 0) * (d === 0 ? 0.55 : Math.abs(d) >= 12 ? 0.15 : 1) + 0.3) / totI);
      const totS = Object.values(P.salto).reduce((a, b) => a + b, 0) || 1, ZIG = s => LN(((P.salto[s] || 0) + 1) / (totS + 3)) - LN(1 / 3);
      const totE = Object.values(P.enlace).reduce((a, b) => a + b, 0) || 1, ENL = s => LN(((P.enlace[s] || 0) + 1) / (totE + 4)) - LN(1 / 4);
      const centro = P.registro.p50 + k.reg, amb = k.amb, lo = Math.round(centro - 12), hi = Math.round(centro + 11);
      const TONOS = { R: 1, 3: 1, 5: 1, 7: 1 };
      const FUNS = ['R', '3', '5', '7', 'T', 'X'];
      const sortearFuncion = e => {
        const a = P.fun[e.metrica], b = P.fun[e.t === 'o' ? 'oct' : 'sola'];
        const ta = Object.values(a).reduce((x, y) => x + y, 0) || 1, tb = Object.values(b).reduce((x, y) => x + y, 0) || 1;
        const tiene = { R: true, 3: e.ch.fun.t != null, 5: true, 7: e.ch.fun.s != null, T: e.ch.fun.T.length > 0, X: true };
        return elegir(RL, FUNS, f => {
          if (!tiene[f]) return 0;
          if ((e.antic || e.dim) && (f === 'T' || f === 'X')) return 0;
          if (f === 'X' && (e.pos % 8 === 0 || e.gap > 4)) return 0;   // el cromatismo es corto y de paso: nunca en el 1 ni en el 3
          if (e.paso && f !== 'X' && f !== 'T') return Math.sqrt(((a[f] || 0) / ta) * ((b[f] || 0) / tb)) * 0.7;
          const mult = f === 'T' ? k.ten : f === 'X' ? 0.6 * k.crom : 1;
          return Math.sqrt(((a[f] || 0) / ta) * ((b[f] || 0) / tb)) * mult;
        });
      };
      const G = 6 * k.gancho;
      const anterior = new Map(G0 ? G0.anterior : []);   // compás del gancho + posición → {top, ch, dir}
      let estado = lineaFin;
      const tops = new Map();
      const W = 20;
      for (let r0 = 0; r0 * H < nb; r0++) {
        const tramo = EV.filter(e => e.r === r0);
        if (!tramo.length) continue;
        let haz = [{ m: estado ? estado.m : null, pd: estado ? estado.pd : 0, ch: estado ? estado.ch : null, f: estado ? estado.f : null, paso: false, rep: 0, s: 0, atras: -1 }];
        const historia = [];
        for (const e of tramo) {
          const ref = anterior.get(e.j + ':' + e.pos);
          const recuerda = ref && ref.ch === e.ch.nombre && RL() < 0.5 + 0.5 * k.gancho;
          const objetivo = recuerda ? null : sortearFuncion(e);
          const cands = [];
          for (let m = lo; m <= hi; m++) {
            const f = TM.funcion(m, e.ch);
            if (e.antic && (f === 'X' || f === 'T')) continue;
            if (e.dim && f !== 'R' && f !== '3' && f !== '5' && f !== '7') continue;
            if ((f === 'T' && k.ten <= 0) || (f === 'X' && k.crom <= 0)) continue;
            let s = (objetivo ? (f === objetivo ? 2.4 : f === 'X' || f === 'T' ? -2.5 : 0) : (TONOS[f] ? 0 : -2));
            s -= 0.5 * ((m - centro) / amb) ** 2;
            cands.push({ m, f, s });
          }
          const sig = [];
          haz.forEach((st, si) => {
            for (const c of cands) {
              let s = st.s + c.s;
              if (st.m != null) {
                const d = c.m - st.m, mm = d % 12 === 0 ? 0 : d;
                s += INT(Math.max(-12, Math.min(12, d)));
                if (Math.abs(d) >= 3) s += 0.7 * k.salto; else if (d !== 0) s -= 0.7 * k.salto;
                if (d === 0) s += 2 * efect.rep - (st.rep >= 1 ? 1.5 : 0);
                if (Math.abs(st.pd) >= 3 && mm) s += 0.6 * k.zig * ZIG(Math.sign(mm) === Math.sign(st.pd) ? 'sigue' : Math.abs(mm) <= 2 ? 'vuelvePaso' : 'vuelveSalto');
                if (st.f === 'X') s += (Math.abs(d) >= 1 && Math.abs(d) <= 2 && TONOS[c.f]) ? 2 : -3;
                if (st.paso) s += (Math.abs(d) >= 1 && Math.abs(d) <= 2) ? 1.2 : -1.8;
                if (st.ch && st.ch !== e.ch.nombre) { const fd = Math.abs(plegar(d)); s += 1.6 * ENL(fd === 0 ? 'comun' : fd <= 2 ? 'paso' : fd <= 4 ? 'tercera' : 'cuarta'); }
                if (ref) {
                  if (ref.ch === e.ch.nombre) s += c.m === ref.top ? (recuerda ? G : 0.3 * G) : 0;
                  else if (ref.dir != null && mm) s += Math.sign(mm) === ref.dir ? 0.9 * k.gancho : -0.3 * k.gancho;
                }
              } else if (recuerda && c.m === ref.top) s += G;
              s += k.temp * 0.8 * gumbel(RL);
              const d = st.m != null ? c.m - st.m : 0, mm = d % 12 === 0 ? 0 : d;
              sig.push({ m: c.m, pd: mm ? mm : st.pd, ch: e.ch.nombre, f: c.f, paso: !!e.paso, rep: d === 0 ? st.rep + 1 : 0, s, atras: si });
            }
          });
          sig.sort((a, b) => b.s - a.s);
          haz = sig.slice(0, W);
          historia.push(haz);
        }
        // reconstruir el mejor camino del tramo
        let idx = 0;
        const elegidos = new Array(tramo.length);
        for (let i = tramo.length - 1; i >= 0; i--) { const st = historia[i][idx]; elegidos[i] = st; idx = st.atras; }
        let prevM = estado ? estado.m : null;
        tramo.forEach((e, i) => {
          const st = elegidos[i]; tops.set(e, st.m);
          anterior.set(e.j + ':' + e.pos, { top: st.m, ch: e.ch.nombre, dir: prevM != null && st.m !== prevM ? Math.sign(st.m - prevM) : null });
          prevM = st.m;
        });
        const u = elegidos[elegidos.length - 1]; estado = { m: u.m, pd: u.pd, ch: u.ch, f: u.f };
      }
      lineaFin = estado;
      if (ctx) ganchoFin = { F, H, celulas, gancho, lado0: lado(0), ef, anterior };

      // ---------- voicing y duraciones
      const tonos = ch => ch.pcs;
      const debajo = (m, ch, a, z, pref) => { let best = null; for (let x = m - z; x <= m - a; x++) if (tonos(ch).includes(pc(x)) && (best == null || Math.abs((m - x) - pref) < Math.abs((m - best) - pref))) best = x; return best; };
      const velMedia = { tiempo: 0.95, contra: 1, semi: 0.8 };
      EV.forEach((e, i) => {
        const m = tops.get(e), ch = e.ch, nx = EV[i + 1];
        const gap = (nx ? nx.p16 : nb * 16) - e.p16;
        let ps;
        if (e.t === 'o') {
          ps = [m - 12, m];
          const pInt = Math.min(0.95, P.tasaInterior * k.int * (e.inner != null ? 2.2 : 0.7));
          if (RV() < pInt) { const inn = debajo(m, ch, 2, 5, e.inner || 3.5); if (inn != null && inn > m - 12) ps.splice(1, 0, inn); }
        } else if (e.t === 'd') { const s = debajo(m, ch, 3, 5, 3.5) ?? debajo(m, ch, 8, 9, 8.5); ps = s != null ? [s, m] : [m]; }
        else if (e.t === 'a') { const s1 = debajo(m, ch, 3, 5, 3.5), s2 = s1 != null ? debajo(s1, ch, 3, 5, 3.5) : null; ps = [s2, s1, m].filter(x => x != null); }
        else ps = [m];
        // mano izquierda
        let mi = [];
        const modo = k.lh === 'auto' ? ({ 'dobla 8va': 'dobla8', 'dobla 2 8vas': 'dobla16', 'décima': 'decima', 'nota suelta': 'decima', 'acorde/octava propia': 'dobla8' }[e.izq] || 'nada') : k.lh;
        const piso = ps[0];
        if (modo === 'dobla8') mi = [piso - 12];
        else if (modo === 'dobla16') mi = [piso - 24];
        else if (modo === 'decima') { const t = debajo(piso, ch, 14, 17, 15.5); if (t != null) mi = [t]; }
        else if (modo === 'contrario') { const eje = centro - 18, obj = 2 * eje - m + 12; let best = null; for (let x = obj - 6; x <= obj + 6; x++) if (tonos(ch).includes(pc(x)) && (best == null || Math.abs(x - obj) < Math.abs(best - obj))) best = x; if (best != null && best < piso - 4) mi = [best]; }
        mi = mi.map(x => { while (x < 36) x += 12; return x; }).filter(x => x < piso);
        // duración: de picado a ligado hasta el ataque siguiente
        let L_ = Math.min(e.d, gap);
        if (k.leg >= 0.5) L_ = Math.round(L_ + (gap - L_) * (k.leg - 0.5) * 2); else L_ = Math.max(1, Math.round(L_ * (0.4 + k.leg * 1.2)));
        if (e.liga) L_ = gap;
        L_ = Math.max(1, Math.min(L_, gap));
        const fv = (P.vel[lado(e.b)] || [])[e.pos] || 1;
        const vel = Math.round(Math.max(30, Math.min(127, 86 * velMedia[e.metrica] * Math.pow(fv, 2 * k.acc) * (e.paso ? 0.85 : 1) * (e.t === 'o' ? 1.04 : 1))));
        const acento = k.acc > 0.3 && !e.paso && (e.antic || fv >= 1.03 || e.t === 'o' && e.metrica === 'contra');
        der.push({ p: e.p16, L: L_, ps, v: vel, art: acento ? '->' : '', antic: !!e.antic, ch, ...(e.liga ? { liga: true } : {}) });
        if (mi.length) izq.push({ p: e.p16, L: L_, ps: mi, v: Math.round(vel * 0.9), art: acento ? '->' : '', ch });
      });
      // ancla en el grave: notas propias de la izquierda
      if (k.lh === 'ancla') {
        izq.length = 0;
        for (let b = 0; b < nb; b++) for (const [pos, L_] of (lado(b) === 'A' ? [[0, 8], [8, 6]] : [[6, 8], [14, 2]])) {
          const ch = pos === 14 ? acordesDe(b + 1)[0] : acordeEn(b, pos);
          let m = 36 + pc(ch.raiz); if (m < 41) m += 12;
          izq.push({ p: b * 16 + pos, L: L_, ps: [m], v: 84, art: '->', ch });
        }
      }
      }   // fin del piano generado
    }

    // =========================== BAJO ===========================
    const bajo = [];
    let bajoFin = previo ? previo.bajo : null;
    let estiloBajo = k.b_estilo === 'auto' ? mar.bajo : k.b_estilo;
    if (estiloBajo === 'aprendido' && !M.bajo.ciclos.length) estiloBajo = 'salsa';
    info.bajo = estiloBajo;
    const regB = { grave: [28, 43], medio: [31, 47], agudo: [36, 52] }[k.b_reg] || [31, 47];
    const raizEn = (ch, prev) => { const objetivo = prev != null ? prev : (regB[0] + regB[1]) / 2; let best = null; for (let m = regB[0]; m <= regB[1]; m++) if (pc(m) === ch.raiz && (best == null || Math.abs(m - objetivo) < Math.abs(best - objetivo))) best = m; return best; };
    const grave = ch => 28 + ((ch.raiz - 4 + 12) % 12);   // la raíz en la octava más grave del bajo (mi a re#)
    if (estiloBajo === 'pedal' || estiloBajo === 'largas') {
      // nota pedal: una sola nota grave (la raíz del primer acorde) sostenida; se vuelve a tocar cada 4 compases para que no se apague.
      // notas largas (el «pedal» de Kevin Moore en timba.com, «Gears in Action» 1: «notas largas y sostenidas, que cambian a lo
      // sumo cada uno o dos pasos básicos»): la raíz cada dos compases, sostenida mientras no cambia
      let ultima = null, desde = 0;
      for (let b = 0; b < nb; b += 2) {
        const ch = estiloBajo === 'pedal' ? acordesDe(0)[0] : acordesDe(b)[0], m = grave(ch), L_ = Math.min(2, nb - b) * 16;
        if (ultima && ultima.ps[0] === m && b - desde < 4) { ultima.L += L_; continue; }
        ultima = { p: b * 16, L: L_, ps: [m], v: 100, art: '->', ch }; bajo.push(ultima); desde = b;
      }
    } else if (estiloBajo === 'deslizado') {
      // deslizamientos (Feliciano Arango, NG La Banda): deja el tumbao. Golpes cortos y acentuados, como de tambor, y la mano que
      // se desliza por la cuerda grave desde la octava hasta la raíz; en el 4& llega la raíz que viene
      for (let b = 0; b < nb; b++) {
        const o = b * 16, sig = acordesDe(b + 1)[0], fin = { p: o + 14, L: 2, ps: [grave(sig)], v: 104, art: '->', ch: sig };
        if (lado(b) === 'A') { const ch = acordeEn(b, 0), r = grave(ch); bajo.push({ p: o, L: 1, ps: [r], v: 110, art: '->', ch }, { p: o + 6, L: 6, ps: [r + 12], v: 94, art: '\\glissando', ch }, { p: o + 12, L: 2, ps: [r], v: 98, art: '', ch }, fin); }
        else { const ch = acordeEn(b, 4), r = grave(ch), c2 = acordeEn(b, 10); bajo.push({ p: o + 4, L: 1, ps: [r], v: 110, art: '->', ch }, { p: o + 8, L: 1, ps: [r], v: 106, art: '->', ch }, { p: o + 10, L: 4, ps: [grave(c2) + 12], v: 92, art: '\\glissando', ch: c2 }, fin); }
      }
    } else if (estiloBajo !== 'ninguno') {
      let celula;
      if (estiloBajo === 'aprendido') {
        // ciclos con roles claros; el ritmo pesa por cuántas veces aparece en toda la base (el tumbao común manda, sin borrar las variantes)
        const claros = M.bajo.ciclos.filter(c => c.calidad >= 0.85);
        const pool = claros.filter(c => c.f === info.piano); const usar = pool.length >= 6 ? pool : (claros.length ? claros : M.bajo.ciclos);
        const nMedio = usar.reduce((a, c) => a + c.n, 0) / usar.length;
        const c = elegir(RB, usar, c => Math.pow(M.bajo.popularidad[c.ritmo] || 1, 0.5) * (Math.abs(k.b_dens - 1) < 0.02 ? 1 : Math.exp(-(((c.n - nMedio * k.b_dens) / 2) ** 2))));
        celula = c.ev.map(e => [e.p, e.d, e.rol, e.dz]); info.bajoFuente = c.f;
      } else if (estiloBajo === 'motivo') {
        celula = [];
        const acc = der.filter(e => e.p < 32 && e.ps.length >= 2).map(e => e.p);
        const roles = ['R', '5', 'R', '3'];
        acc.forEach((p, i) => celula.push([p, 3, (p % 16) >= 12 && der.find(x => x.p === p && x.antic) ? 'R+' : roles[i % roles.length], i % 3 === 2 ? 12 : null]));
        if (!celula.length) celula = BAJO_GUIA.salsa;
      } else celula = BAJO_GUIA[estiloBajo] || BAJO_GUIA.salsa;
      // la célula de bajo está escrita como lado 3 | lado 2: se reparte por el lado de cada compás
      const mitadB = L_ => celula.filter(x => (L_ === 'A') === (x[0] < 16)).map(([p, d, rol, dz]) => ({ pos: p % 16, d, rol, dz }));
      let prev = bajoFin;
      for (let b = 0; b < nb; b++) {
        let evs = mitadB(lado(b)).map(x => ({ ...x }));
        if (k.b_ant !== 'auto') for (const x of evs) if (x.rol === 'R+' && (x.pos === 12 || x.pos === 14)) x.pos = +k.b_ant;
        if (k.b_dens < 1) evs = evs.filter(x => x.rol === 'R+' || x.rol === 'R' || RB() < k.b_dens);
        if (k.b_dens > 1 && !evs.some(x => x.pos === 8) && RB() < k.b_dens - 1) evs.push({ pos: 8, d: 2, rol: '5', dz: null });
        const cs = acordesDe(b), sigCh = acordesDe(b + 1)[0];
        // si el acorde cambia y la célula termina en la raíz o la quinta de ahora, el bajo anticipa la raíz que viene
        if (sigCh.nombre !== cs[cs.length - 1].nombre) { const ult = evs.filter(x => x.pos >= 12).pop(); if (ult && ['R', '5', '3', '7'].includes(ult.rol) && RB() < 0.8) ult.rol = 'R+'; }
        if (sigCh.nombre !== cs[cs.length - 1].nombre && RB() < k.b_aprox) {
          const rp = evs.find(x => x.rol === 'R+'); if (rp && !evs.some(x => x.pos === rp.pos - 2) && rp.pos >= 12) evs.push({ pos: rp.pos - 2, d: 2, rol: 'apB', dz: null });
        }
        // al principio del tema (o después de un corte) el bajo entra con la raíz en el 1; en medio de la canción viene ligado de antes
        if (b === 0 && (!previo || previo.entraSolo) && !evs.some(x => x.pos === 0)) evs.push({ pos: 0, d: 4, rol: 'R', dz: null });
        evs.sort((a, b2) => a.pos - b2.pos);
        for (const x of evs) {
          const cur = acordeEn(b, x.pos), q = x.pos;
          const sig = q >= 10 ? sigCh : (cs.length > 1 && q >= 2 && q < 8 ? cs[1] : sigCh);
          let objPc;
          switch (x.rol) {
            case 'R+': objPc = sig.raiz; break; case 'R': objPc = cur.raiz; break; case '5': objPc = (cur.raiz + cur.fun.f) % 12; break;
            case '3': objPc = (cur.raiz + (cur.fun.t ?? 4)) % 12; break; case '7': objPc = (cur.raiz + (cur.fun.s ?? 10)) % 12; break;
            case 'apB': objPc = (sig.raiz + 11) % 12; break; case 'apA': objPc = (sig.raiz + 1) % 12; break; case '5+': objPc = (sig.raiz + sig.fun.f) % 12; break;
            default: objPc = (cur.raiz + (+String(x.rol).slice(1) || 0)) % 12;
          }
          const objetivo = prev != null ? prev + (x.dz != null && Math.abs(x.dz) <= 12 ? x.dz : 0) : (regB[0] + regB[1]) / 2;
          let best = null; for (let m = regB[0] - 2; m <= regB[1] + 2; m++) if (pc(m) === objPc && (best == null || Math.abs(m - objetivo) < Math.abs(best - objetivo))) best = m;
          bajo.push({ p: b * 16 + x.pos, L: x.d, ps: [best], v: x.rol === 'R+' ? 100 : 90, art: x.rol === 'R+' || x.rol === 'R' ? '->' : '', ch: (x.rol === 'R+' || x.rol === '5+' || x.rol.startsWith('ap')) ? sig : cur });
          prev = best;
        }
      }
      bajo.sort((a, b) => a.p - b.p);
      for (let i = 0; i < bajo.length; i++) {
        const nx = bajo[i + 1], gap = (nx ? nx.p : nb * 16) - bajo[i].p, L0 = bajo[i].L;
        bajo[i].L = Math.max(1, Math.min(bajo[i].L, gap));
        if (ctx && !nx && L0 > bajo[i].L) bajo[i].cola = L0;   // la última nota sigue sonando en la sección que viene
        if (k.b_gliss > 0 && nx && nx.ps[0] <= bajo[i].ps[0] - 5 && bajo[i].L >= 3 && RB() < k.b_gliss) bajo[i].art = '\\glissando';
      }
      bajoFin = prev;
    }
    if (['pedal', 'largas', 'deslizado'].includes(estiloBajo) && bajo.length) bajoFin = bajo[bajo.length - 1].ps[0];

    // =========================== PERCUSIÓN ===========================
    let perc = null;
    const desborde = [];
    const mix = { clave: k.m_clave, congas: k.m_congas, bongo: k.m_bongo, campanas: k.m_campanas, timbales: k.m_timbales, guiro: k.m_guiro, bateria: k.m_bateria };
    const usarAprendida = k.p_fuente === 'aprendida' && ['cuerpo', 'marcha', 'mambo'].includes(marC.perc) && M.perc.juegos.length;
    info.percusion = usarAprendida ? 'aprendida' : 'clásica';
    if (usarAprendida) {
      let pool = M.perc.juegos.filter(j => j.tipo === marC.perc);
      if (pool.length < 3) pool = M.perc.juegos.filter(j => j.tipo === 'marcha' || j.tipo === marC.perc);
      if (!pool.length) pool = M.perc.juegos;
      const orden = pool.slice().sort((a, b) => a.densidad - b.densidad);
      const rango = new Map(orden.map((j, i) => [j, orden.length > 1 ? i / (orden.length - 1) : 0.5]));
      const peso = j => Math.sqrt(j.n) * Math.exp(-((rango.get(j) - k.p_int) ** 2) / 0.04) * (j.f === info.piano ? 3 : 1) * (j.lado === 'sin' ? 0.5 : 1);
      let juego = elegir(RP, pool, peso);
      info.percFuente = juego.f;
      perc = [];
      const cada = +k.p_cambio;
      for (let b = 0; b < nb; b++) {
        if (cada && b > 0 && b % cada === 0 && RP() < 0.6) { const actual = juego; juego = elegir(RP, pool, j => peso(j) * (j.f === actual.f ? 3 : 1) * Math.exp(-((rango.get(j) - rango.get(actual)) ** 2) / 0.02)); }
        const L_ = lado(b), base = L_ === 'A' ? 0 : 16, out = [];
        for (const d in juego.k) {
          if (d === 'maraca') continue;   // sin maracas: el raspado es solo el güiro
          const pat = juego.k[d], fam = TM.familiaPerc(d), mx = mix[fam] ?? 1; if (mx <= 0) continue;
          for (let q = 0; q < 16; q++) { const c = pat[base + q]; if (c && c !== '.') out.push({ p: q, d, v: +(0.25 + 0.1 * +c).toFixed(2) * mx }); }
        }
        if (mix.clave > 0) for (const q of CLAVE16[tipoClave][L_]) out.push({ p: q, d: 'clave', v: 0.95 * mix.clave });
        // relleno de timbal al final de cada vuelta de la progresión
        const finVuelta = b % L === L - 1;
        if (finVuelta && RP() < k.p_relleno && mix.timbales > 0) {
          for (let i = out.length - 1; i >= 0; i--) if (out[i].p >= 10 && ['timbales', 'campanas'].includes(TM.familiaPerc(out[i].d))) out.splice(i, 1);
          for (const [q, d, v] of RELLENO) out.push({ p: q, d, v: v * mix.timbales });
          if ((b + 1 < nb || ctx) && mix.bateria > 0) out.push({ p: 16, d: 'crash', v: 0.7 * mix.bateria });
        }
        perc.push(out);
      }
      // el platillo del relleno cae en el 1 del compás siguiente (en una canción, puede ser el de la sección que viene)
      for (let b = 0; b < perc.length; b++) for (let i = perc[b].length - 1; i >= 0; i--) if (perc[b][i].p >= 16) { const e = perc[b].splice(i, 1)[0]; if (perc[b + 1]) perc[b + 1].push({ ...e, p: e.p - 16 }); else if (ctx) desborde.push({ ...e, p: e.p - 16 }); }
    }

    return { compases: nb, prog, acordes: Array.from({ length: nb }, (_, b) => acordesDe(b)), der, izq, bajo, perc, mix, info, marcha: opc.marcha || 'marcha', marca: mar.marca, clave: opc.clave, lados: Array.from({ length: nb }, (_, b) => lado(b)),
      ...(ctx ? { fin: { linea: lineaFin, bajo: bajoFin, ligaAl1: ligaFin, desborde }, gancho: ganchoFin } : {}) };
  }

  Object.assign(TM, { generar, MARCHAS, PERILLAS, PERILLAS_UI, ONDAS_MOTOR: ONDAS, BAJO_GUIA });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
