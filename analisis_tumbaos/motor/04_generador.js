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
    // en el cuerpo el piano acompaña al cantante: más grave (reg, semitonos) y con poca izquierda (izq: chance de tocarla)
    cuerpo: { dens: 0.82, oct: 0.6, blq: 1.2, semi: 0.5, reg: -5, izq: 0.35, perc: 'cuerpo', bajo: 'salsa', marca: 'Cuerpo · tumbao' },
    marcha: { dens: 1, oct: 1, blq: 1, semi: 1, perc: 'marcha', bajo: 'aprendido', marca: 'Coro · marcha' },
    mambo: { dens: 1, oct: 0.8, blq: 1.8, semi: 1, perc: 'mambo', bajo: 'aprendido', marca: 'Mambo · marcha de mambo' },
    presion: { dens: 0.62, oct: 0.4, blq: 2.2, semi: 0.3, perc: 'presion', bajo: 'pedal', marca: 'Presión' },
    // bomba: el otro breakdown de la timba (Kevin Moore, Beyond Salsa Percussion); el bajo se desliza por la cuerda grave
    bomba: { dens: 0.85, oct: 0.7, blq: 1.4, semi: 0.6, perc: 'bomba', bajo: 'deslizado', marca: 'Bomba' },
    despelote: { dens: 1.2, oct: 0.8, blq: 1.6, semi: 2.5, rep: 0.6, perc: 'despelote', bajo: 'deslizado', marca: 'Despelote' },
    muela: { dens: 0.55, oct: 0.15, blq: 0.5, semi: 0, perc: 'muela', bajo: 'muela', marca: 'Muela' }
  };

  // ---------- la colección Toontrack (Latin Cuban EZkeys, tocada por Manuel Valera): estilos (carpetas) y partes (nombres de
  // archivo). Las notas no están acá: vienen de la base local (analisis_tumbaos/base_local.js) si está; sin ella, el piano
  // toca Opus en el estilo más parecido. La carpeta MAMBO_95_BPM (el género) no entra: en la app, mambo es la sección de vientos
  const TOONTRACK = {
    estilos: [['son_montuno', 'Son montuno (91)'], ['salsa_media', 'Salsa media (90)'], ['salsa_rapida', 'Salsa rápida (170)'], ['songo', 'Songo Van Van (105)'], ['funk_cubano', 'Funk cubano (114)']],
    // estilo de la sección → estilo de Toontrack, y al revés (sin la colección, Opus toca en ese estilo)
    deEstilo: { sonmontuno: 'son_montuno', charanga: 'son_montuno', salsabrava: 'salsa_media', salsa: 'salsa_rapida', songo: 'songo', pupy: 'songo', melon: 'funk_cubano', tirso: 'funk_cubano' },
    aEstilo: { son_montuno: 'sonmontuno', salsa_media: 'salsabrava', salsa_rapida: 'salsa', songo: 'songo', funk_cubano: 'tirso' },
    // partes: id, nombre, comienzos de archivo (en orden de preferencia)
    partes: [['intro', 'Intro', ['Intro']], ['intro2', 'Intro 2', ['Intro_2']], ['a', 'A Section (o A 1)', ['A_Section', 'A_Section_1']], ['a2', 'A Section 2', ['A_Section_2']],
      ['b', 'B Section', ['B_Section']], ['coro', 'Coro', ['Coro']], ['montuno', 'Montuno 1', ['Montuno_1']], ['montuno2', 'Montuno 2', ['Montuno_2']], ['soneo', 'Soneo', ['Soneo']],
      ['mambo', 'Mambo (la de los vientos)', ['Mambo']], ['solo', 'Solo', ['Solo']], ['break', 'Break', ['Break']], ['final', 'End Vamp', ['End_Vamp']]],
    // si el estilo no tiene la parte elegida, las parecidas (en orden)
    parecidas: { intro: ['intro2', 'a', 'coro'], intro2: ['intro', 'a'], a: ['a2', 'b', 'coro', 'montuno'], a2: ['a', 'b'], b: ['a', 'a2'], coro: ['montuno', 'soneo', 'montuno2', 'mambo'],
      montuno: ['coro', 'montuno2', 'soneo'], montuno2: ['montuno', 'coro', 'soneo'], soneo: ['coro', 'montuno', 'montuno2'], mambo: ['montuno2', 'coro', 'soneo', 'solo'],
      solo: ['mambo', 'b'], break: ['final', 'coro'], final: ['coro', 'montuno', 'soneo'] },
    // tipo de sección (o marcha) → parte
    deTipo: { intro: 'intro', cuerpo: 'a', coro: 'coro', mambo: 'mambo', mona: 'mambo', presion: 'b', bomba: 'b', despelote: 'mambo', muela: 'b', bloque: 'break', final: 'final', marcha: 'coro' }
  };

  // ---------- perillas: valor por defecto y cómo se muestran. Las del piano valen para Opus y el generado; Toontrack y la
  // frase real tocan lo del pianista y solo les cambian la izquierda, el registro, el legato, los acentos y el cromatismo
  const PERILLAS_UI = [
    { g: 'Piano · qué toca', id: 'frase', l: 'Qué toca el piano', tipo: 'sel', def: 'opus', ops: [['opus', 'Opus: montuno de pianista acomodado a tus acordes'], ['toontrack', 'patrón de Toontrack (colección local)'], ['frase', 'frase real de un tema de la base'], ['celulas', 'células y línea nota por nota']], h: 'Opus: elige el montuno de un pianista para el estilo, el tipo de sección y el ritmo de tus acordes (de Toontrack si está la colección local, y de los temas de la base), lo repite como gancho y conduce sus voces a tus acordes. Toontrack: el patrón que elijas abajo, tal cual. Frase real: la frase entera de un tema de la base, en orden. Células: el ritmo de la base y la línea buscada nota por nota' },
    { g: 'Piano · qué toca', id: 'tt_estilo', l: 'Toontrack: estilo', tipo: 'sel', def: 'auto', ops: [['auto', 'el de la sección'], ...TOONTRACK.estilos], h: 'Solo con «patrón de Toontrack»: de qué carpeta de la colección local sale el patrón. Sin la colección local, el piano toca Opus en el estilo más parecido' },
    { g: 'Piano · qué toca', id: 'tt_parte', l: 'Toontrack: parte', tipo: 'sel', def: 'auto', ops: [['auto', 'según el tipo de sección'], ...TOONTRACK.partes.map(([id, n]) => [id, n])], h: 'Solo con «patrón de Toontrack»: qué parte de la canción de Toontrack (intro en la intro, A o B en el cuerpo, coro o montuno en el coro, mambo en el mambo, End Vamp en el final). Si el estilo no la tiene, toca la más parecida' },
    { g: 'Piano · qué toca', id: 'tt_var', l: 'Toontrack: variación', min: 0, max: 10, st: 1, def: 0, f: 'n', h: 'Solo con «patrón de Toontrack»: cuál de las variaciones de esa parte (1, 2, 3…). En 0, la elige la variante de la sección (🎲)' },
    { g: 'Piano · ritmo y textura', id: 'dens', l: 'Densidad', min: 0.5, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Más o menos ataques por compás que el montuno elegido (saca los golpes débiles o agrega en los lugares de la base)' },
    { g: 'Piano · ritmo y textura', id: 'oct', l: 'Octavas', min: 0, max: 2, st: 0.05, def: 1, f: 'x', h: 'Más o menos ataques en octava: la línea que «habla». En 0, notas sueltas' },
    { g: 'Piano · ritmo y textura', id: 'int', l: 'Octavas rellenas', min: 0, max: 3, st: 0.1, def: 1, f: 'x', h: 'Una 3a o 4a del acorde adentro de la octava, pegada debajo de la nota de arriba (el sonido del tres)' },
    { g: 'Piano · ritmo y textura', id: 'blq', l: 'Bloques', min: 0, max: 2.5, st: 0.05, def: 1, f: 'x', h: 'Díadas y acordes: el golpe armónico que contesta a la línea, sobre todo en el 3& y en el 1& del lado 3' },
    { g: 'Piano · ritmo y textura', id: 'semi', l: 'Semicorcheas', min: 0, max: 3, st: 0.1, def: 1, f: 'x', h: 'Notas picadas de paso antes de los contratiempos (el tumbao «picado» de la timba). En 0, ninguna' },
    { g: 'Piano · ritmo y textura', id: 'leg', l: 'Legato', min: 0, max: 1, st: 0.05, def: 0.5, f: '%', h: 'En 50%, como lo toca el pianista; menos, más picado; más, cada nota ligada hasta el ataque siguiente' },
    { g: 'Piano · ritmo y textura', id: 'acc', l: 'Acentos', min: 0, max: 2, st: 0.05, def: 1, f: 'x', h: 'Contraste entre los golpes fuertes y los suaves (1 = como el pianista o la base; 0 = todo parejo)' },
    { g: 'Piano · línea y armonía', id: 'reg', l: 'Registro', min: -12, max: 12, st: 1, def: 0, f: '±st', h: 'Corre todo el piano hacia el grave o el agudo, en semitonos (0 = el registro del pianista, la línea alrededor de fa5)' },
    { g: 'Piano · línea y armonía', id: 'salto', l: 'Pasos ↔ saltos', min: -1, max: 1, st: 0.05, def: 0, f: '±', h: 'La línea de arriba: negativo, más por grado conjunto; positivo, más saltos de 3a y 4a' },
    { g: 'Piano · línea y armonía', id: 'rep', l: 'Notas repetidas', min: 0, max: 1, st: 0.05, def: 0, f: '%', h: 'Empuje de notas repetidas en la línea (Melón, el despelote)' },
    { g: 'Piano · línea y armonía', id: 'ten', l: 'Tensiones (9, 11, 13)', min: 0, max: 3, st: 0.1, def: 1, f: 'x', h: 'Color en la línea: en 0, solo notas del acorde; más de 1, tensiones también donde el pianista tocaba notas del acorde (nunca en los golpes fuertes)' },
    { g: 'Piano · línea y armonía', id: 'crom', l: 'Cromatismo', min: 0, max: 3, st: 0.1, def: 1, f: 'x', h: 'Notas de paso a medio tono que resuelven en una nota del acorde, siempre cortas y en golpes débiles. En 0, ninguna' },
    { g: 'Piano · línea y armonía', id: 'dim', l: 'Disminuido de paso (Pupy)', min: 0, max: 1, st: 0.05, def: 0, f: '%', h: 'Chance de que el 4 antes de un cambio de acorde sea un °7 medio tono abajo del acorde que viene' },
    { g: 'Piano · línea y armonía', id: 'lh', l: 'Mano izquierda', tipo: 'sel', def: 'auto', ops: [['auto', 'como el pianista'], ['dobla8', 'dobla a la octava'], ['dobla16', 'dobla a dos octavas'], ['decima', 'décimas'], ['contrario', 'movimiento contrario (Pupy)'], ['ancla', 'ancla en el grave (Tirso)'], ['nada', 'sin mano izquierda']], h: 'Qué hace la izquierda debajo de la línea. «Como el pianista» toca lo que tocaba la izquierda del montuno elegido; nunca baja del fa2, donde embarra el bajo' },
    { g: 'Piano · gancho', id: 'largo', l: 'Largo del gancho', tipo: 'sel', def: 'auto', ops: [['auto', 'automático'], ['2', '2 compases (una clave)'], ['4', '4 compases (dos claves)'], ['8', '8 compases (cuatro claves)']], h: 'Cada cuántos compases se repite el gancho. Automático: 4 si la progresión dura 4, 8 o 16 compases; si no, 2' },
    { g: 'Piano · gancho', id: 'gancho', l: 'Gancho fijo', min: 0, max: 1, st: 0.05, def: 0.75, f: '%', h: 'Cuánto repite las mismas notas cuando vuelven los mismos acordes (también de una sección a otra que comparte el gancho)' },
    { g: 'Piano · gancho', id: 'var', l: 'Variación por vuelta', min: 0, max: 1, st: 0.05, def: 0.35, f: '%', h: 'Chance de que el pianista varíe el final del gancho al repetirlo' },
    { g: 'Bajo', id: 'b_estilo', l: 'Qué toca', tipo: 'sel', def: 'auto', ops: [['auto', 'según el estilo y la marcha'], ['aprendido', 'aprendido de la base'], ['salsa', 'tumbao de salsa (2& y 4)'], ['timbero', 'timbero (anticipos)'], ['timba', 'timba (2& y 3 repetidos, la 3a en el 4)'], ['songo', 'songo Van Van'], ['motivo', 'motivo con el piano (Pupy)'], ['pedal', 'nota pedal (una, grave y larga)'], ['largas', 'notas largas (cada 2 compases)'], ['deslizado', 'deslizamientos y golpes'], ['muela', 'de muela'], ['ninguno', 'sin bajo']], h: 'De dónde sale el bajo: aprendido de la base o un patrón de la guía. Nota pedal: una sola nota grave que se sostiene (presión). Notas largas: la raíz cada dos compases, sostenida (el «pedal» de Kevin Moore). Deslizamientos: deja el tumbao, golpes cortos y la mano que se desliza por la cuerda grave (Feliciano Arango). «Según la marcha» elige el que le queda a cada marcha' },
    { g: 'Bajo', id: 'b_aprox', l: 'Aproximaciones cromáticas', min: 0, max: 1, st: 0.05, def: 0.25, f: '%', h: 'Medio tono antes de la raíz que viene' },
    { g: 'Bajo', id: 'b_dens', l: 'Densidad del bajo', min: 0.5, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Más o menos notas por compás en el bajo' },
    { g: 'Bajo', id: 'b_reg', l: 'Registro del bajo', tipo: 'sel', def: 'medio', ops: [['grave', 'grave'], ['medio', 'medio'], ['agudo', 'agudo']], h: 'En qué octava toca el bajo' },
    { g: 'Bajo', id: 'b_gliss', l: 'Deslizamientos', min: 0, max: 1, st: 0.05, def: 0, f: '%', h: 'Glissando hacia abajo en los saltos grandes, en cualquier estilo (el estilo «deslizamientos» ya los trae)' },
    { g: 'Bajo', id: 'b_lado2', l: 'Negras en el lado 2 (timba)', tipo: 'sel', def: 'auto', ops: [['auto', 'según el estilo (en la timba, con su tumbao: al entrar y cada 4 vueltas)'], ['nunca', 'nunca'], ['entrada', 'al entrar la sección'], ['cada4', 'al entrar y cada 4 vueltas'], ['siempre', 'en todos los compases del lado 2']], h: 'El bajo camina el lado 2 de la clave en negras (1, 2, 3 y 4, con la clave en el 2 y el 3) y en el 4 trae el acorde que viene: lo típico del bajo de timba para marcar la entrada de una sección' },
    { g: 'Bajo', id: 'b_lado2_notas', l: 'Negras: qué notas', tipo: 'sel', def: 'caminando', ops: [['caminando', 'caminando: raíz, 3a y 5a'], ['raiz', 'a la raíz: raíz, raíz y 5a']], h: 'Las tres primeras negras del lado 2; la cuarta es la raíz que viene' },
    { g: 'Vientos', id: 'v_forma', l: 'Forma del mambo', tipo: 'sel', def: 'auto', ops: [['auto', 'según el estilo'], ['bloque', 'todos el mismo ritmo'], ['pregunta', 'pregunta y respuesta'], ['contrapunto', 'contrapunto (dos riffs a la vez)'], ['champola', 'champola (tres líneas que terminan juntas)'], ['escalonado', 'entradas escalonadas']], h: 'Todos el mismo ritmo (La Charanga Habanera: las cuatro voces juntas). Pregunta y respuesta: las trompetas tiran una clave y los trombones contestan la otra. Contrapunto: trompetas y trombones con dos riffs distintos a la vez, que se llenan los huecos (Issac Delgado, la salsa). Champola: tres líneas distintas que terminan juntas en unísono al final de la frase (NG La Banda). Escalonadas: cada familia entra un compás después' },
    { g: 'Vientos', id: 'v_largo', l: 'Largo de la frase', tipo: 'sel', def: 'auto', ops: [['auto', 'automático'], ['1', 'una clave (2 compases)'], ['2', 'dos claves (4 compases)'], ['4', 'cuatro claves (8 compases)']], h: 'Cada cuánto se repite (o cambia) el material de los vientos. La moña de salsa es de dos claves' },
    { g: 'Vientos', id: 'v_repite', l: 'Repetición', min: 0, max: 1, st: 0.05, def: 0.5, f: '%', h: 'Cuánto repite su frase: 0 = una línea que cambia siempre (el mambo de big band); 100% = un riff que vuelve igual (la moña). Los vientos repiten su material al menos dos veces' },
    { g: 'Vientos', id: 'v_dens', l: 'Densidad', min: 0.5, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Frases más ralas o más cargadas de notas' },
    { g: 'Vientos', id: 'v_reg', l: 'Registro', min: -12, max: 12, st: 1, def: 0, f: '±st', h: 'Corre todos los vientos hacia el grave o el agudo' },
    { g: 'Vientos', id: 'v_art', l: 'Articulación', min: 0.5, max: 1.5, st: 0.05, def: 1, f: 'x', h: 'Más picado (notas cortas, golpes secos) o más ligado (notas largas que cantan)' },
    { g: 'Vientos', id: 'v_crom', l: 'Cromatismo', min: 0, max: 1, st: 0.05, def: 0.9, f: '%', h: 'Cuántas notas de paso cromáticas (y notas «azules») de los riffs originales quedan, como aproximación a la nota del acorde que sigue; en 0, todo nota del acorde' },
    { g: 'Vientos', id: 'v_cresc', l: 'Crescendo', min: 0, max: 1, st: 0.05, def: 0.5, f: '%', h: 'El mambo crece: arranca más suave y en el último tercio sube (material nuevo, más arriba; en los temas de la base la nota más aguda sube unos 2 semitonos) y llega fuerte' },
    { g: 'Vientos', id: 'v_agudo', l: 'Trompeta al agudo', min: 0, max: 1, st: 0.05, def: 0, f: '%', h: 'En el último tercio de la sección, la trompeta sube una octava (el clímax; la timba lo guarda para el final)' },
    { g: 'Vientos', id: 'v_remate', l: 'Remate', tipo: 'sel', def: 'auto', ops: [['auto', 'según la sección'], ['nada', 'nada'], ['golpe', 'golpe en el anticipo'], ['pickups', 'contratiempos hasta el golpe'], ['larga', 'nota larga']], h: 'Cómo terminan los vientos la sección: un golpe con la banda en el 4& (o el 4), contratiempos que llevan al golpe (los bloques de la timba) o una nota larga' },
    { g: 'Vientos', id: 'v_fuente', l: 'Aprende de', tipo: 'sel', def: 'estilo', ops: [['estilo', 'el estilo de la sección'], ['salsa', 'la salsa'], ['cubano', 'lo cubano y la timba'], ['todo', 'todos los temas']], h: 'De qué temas de la base salen los riffs' },
    { g: 'Percusión', id: 'p_int', l: 'Intensidad', min: 0, max: 1, st: 0.05, def: 0.55, f: '%', h: 'Juegos más ralos o más cargados' },
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
  // los estilos: cómo toca toda la banda en una sección. vientos: el formato de entrada de la canción, la armonía y qué tocan en
  // cada marcha (la timba calla en los coros y toca el mambo después; investigación de vientos de timba y de salsa) piano: sus perillas (el piano puede tocar como otro estilo);
  // piano.como: el estilo en que toca el piano (Opus elige montunos de pianistas de ese estilo; con «Toca como», el de otro);
  // estilo y grupo: de qué temas de la base aprende el piano (grupo: los estilos de Toontrack, si están en la base local);
  // banda: la percusión de entrada (07_percusion.js); cambio: el cambio de acorde; bajo: el tumbao en cuerpo, coro y mambo
  // (en la app, mambo es la sección donde tocan los vientos; el género de los 50 no está)
  const ESTILOS = {
    sonmontuno: { n: 'Son montuno', d: 'El conjunto de los años 40 y 50 (Arsenio, Lilí Martínez): piano en octavas con la nota de adentro, el bajo anticipado en el 4, una conga y bongó, sin timbal.',
      banda: 'son', cambio: '4', bajo: 'salsa', estilo: 'cubano', grupo: ['son_montuno'], vientos: { formato: 'conjunto', armonia: 'terceras', toca: { cuerpo: 'respuesta', marcha: 'respuesta', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, forma: 'bloque', intro: 'mambo' }, piano: { como: 'sonmontuno', int: 1.4, semi: 0.5, crom: 0.6 } },
    charanga: { n: 'Charanga', d: 'La orquesta de flauta y violines (Aragón, «Pare cochero»): el piano de notas sueltas con la izquierda a dos octavas, timbal y conga sin bongó.',
      banda: 'charanga', cambio: '4', bajo: 'salsa', estilo: 'salsa', vientos: { formato: null, armonia: 'unisono', toca: { cuerpo: 'nada', marcha: 'nada', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, intro: 'nada' }, piano: { como: 'charanga', oct: 0.4, blq: 0.6, lh: 'dobla16', semi: 0.6, crom: 0.6 } },
    salsabrava: { n: 'Salsa brava', d: 'Nueva York en los 70 (Palmieri, Fania): montuno en octavas con la izquierda a dos octavas, percusivo; bajo en el 2& y el 4, campanas al frente.',
      banda: 'salsa', cambio: '4', bajo: 'salsa', estilo: 'salsa', grupo: ['salsa_media'], vientos: { formato: 'trombanga', armonia: 'trombanga', toca: { cuerpo: 'respuesta', marcha: 'respuesta', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, forma: 'bloque', intro: 'mambo' }, piano: { como: 'salsabrava', lh: 'dobla16', oct: 1.2, ten: 0.8 } },
    salsa: { n: 'Salsa de los 90', d: 'La salsa romántica (Gilberto, Marc Anthony): más aire, la izquierda a la décima, tensiones; bajo en el 2& y el 4.',
      banda: 'salsa', cambio: '4', bajo: 'salsa', estilo: 'salsa', grupo: ['salsa_rapida', 'salsa_media'], vientos: { formato: 'salsa90', armonia: 'terceras', toca: { cuerpo: 'respuesta', marcha: 'respuesta', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, forma: 'bloque', intro: 'mambo' }, piano: { como: 'salsa', lh: 'decima', ten: 1.2 } },
    songo: { n: 'Songo (Van Van)', d: 'Los 70 y 80: más aire, la derecha en los tiempos y sostenida, la izquierda a la octava; batería de Changuito y el bajo de Formell.',
      banda: 'songo', cambio: '4y', bajo: 'songo', estilo: 'cubano', grupo: ['songo'], vientos: { formato: 'vanvan', armonia: 'terceras', toca: { cuerpo: 'respuesta', marcha: 'nada', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, forma: 'bloque', intro: 'nada' }, piano: { como: 'songo', dens: 0.8, leg: 0.8, semi: 0.4 } },
    pupy: { n: 'Timba · Pupy', d: 'Gancho que se repite igual en cada clave, manos en movimiento contrario y disminuidos de paso; el bajo en motivo con el piano.',
      banda: 'timba', cambio: '4y', bajo: 'motivo', estilo: 'timba', grupo: ['songo'], vientos: { formato: 'timba', armonia: 'unisono', toca: { cuerpo: 'respuesta', marcha: 'nada', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, forma: 'bloque', intro: 'nada' }, piano: { como: 'pupy', gancho: 0.9, var: 0.15, lh: 'contrario', crom: 1.4, dim: 0.35, ten: 1.2, semi: 1.4 } },
    melon: { n: 'Timba · Melón', d: 'Chorro continuo con corridas hacia las notas de referencia y la izquierda a la décima; el bajo de timba.',
      banda: 'timba', cambio: '4y', bajo: 'timba', estilo: 'timba', vientos: { formato: 'timba', armonia: 'terceras', toca: { cuerpo: 'respuesta', marcha: 'nada', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, forma: 'contrapunto', intro: 'nada' }, piano: { como: 'melon', lh: 'decima', semi: 1.8, rep: 0.35, gancho: 0.8 } },
    tirso: { n: 'Timba · Tirso', d: 'Células de 3+4 pulsos, terceras paralelas y saltos de registro; la izquierda ancla en el grave; el bajo timbero.',
      banda: 'timba', cambio: '4y', bajo: 'timbero', estilo: 'timba', grupo: ['funk_cubano'], vientos: { formato: 'timba', armonia: 'cuartas', toca: { cuerpo: 'respuesta', marcha: 'nada', mambo: 'mambo', presion: 'nada', bomba: 'bloques', despelote: 'bloques', muela: 'nada' }, forma: 'escalonado', intro: 'nada' }, piano: { como: 'tirso', blq: 1.8, salto: 0.5, lh: 'ancla', largo: '4' } }
  };
  // tipo de sección de la canción → secciones de la base que le sirven (sin tipo, sale de la marcha)
  const SECCION_BASE = { intro: ['intro'], cuerpo: ['cuerpo'], coro: ['coro'], bloque: ['coro'], mambo: ['mambo'], mona: ['mambo', 'solo'], final: ['final', 'coro'] };
  const TIPO_DE_MARCHA = { cuerpo: 'cuerpo', marcha: 'coro', mambo: 'mambo' };

  // ---------- células de bajo de la guía, con roles: [posición, duración, rol, salto sugerido]
  const BAJO_GUIA = {
    salsa: [[6, 6, '5', null], [12, 8, 'R+', null], [22, 6, '5', null], [28, 8, 'R+', null]],
    timbero: [[0, 4, 'R', null], [6, 4, 'R', 12], [10, 2, '5', null], [14, 4, 'R+', null], [20, 4, '5', null], [24, 4, 'R', 12], [28, 2, 'apB', null], [30, 4, 'R+', null]],
    songo: [[6, 4, 'R', 12], [10, 4, '5', null], [14, 4, 'R+', null], [18, 4, 'R', null], [22, 2, 'R', 12], [24, 4, '5', null], [30, 4, 'R+', null]],
    muela: [[0, 4, 'R', null], [14, 2, '5', null], [16, 4, 'R', null], [24, 2, 'R', null]],
    // timba (el bajo de «Ya empezó la fiesta», 1998): la misma nota en el 2& y el 3, la raíz o la 3a en el 4 y la raíz que viene en el 4&
    timba: [[6, 2, '5', null], [8, 4, '5', null], [12, 2, 'R', null], [14, 4, 'R+', null], [22, 2, 'R', null], [24, 4, 'R', null], [28, 2, '3', null], [30, 4, 'R+', null]]
  };

  // los tumbaos escritos por células que con la clave de son tocan el 4 del lado 3 (el tercer golpe de la clave)
  const CELULA_CON_4 = ['salsa', 'timba', 'timbero', 'motivo', 'aprendido', 'songo'];

  // ---------- percusión: clave y relleno
  const RELLENO = [[10, 'timbalH', 0.55], [11, 'timbalH', 0.45], [12, 'timbalH', 0.75], [13, 'timbalL', 0.6], [14, 'timbalL', 0.9], [15, 'timbalL', 0.7]];

  // opc.contexto (una sección de una canción): { inicio: compás global, siguiente: acordes del compás que sigue (null al final),
  // previo: { linea, bajo, ligaAl1, entraSolo } de la sección anterior, gancho: el de otra sección, transicion }
  function generar(opc, M) {
    const k = Object.assign({}, PERILLAS, opc.perillas || {});
    // las perillas, dentro de su rango (una canción guardada puede traer cualquier cosa: «deslizamientos 3300%»); una lista con un
    // valor que no tiene, a su valor de entrada
    for (const d of PERILLAS_UI) { const v = k[d.id]; if (d.tipo === 'sel') { if (!d.ops.some(([x]) => String(x) === String(v))) k[d.id] = d.def; } else { const n = +v; k[d.id] = Number.isFinite(n) ? Math.max(d.min, Math.min(d.max, n)) : d.def; } }
    const ctx = opc.contexto || null, C = ctx || {}, previo = C.previo || null;
    // cada instrumento puede tener su propia variante (opc.semillas: piano, bajo, perc); si no, la de la sección
    const sem = opc.semillas || {}, sP = sem.piano || opc.semilla || 1, sB = sem.bajo || opc.semilla || 1, sC = sem.perc || opc.semilla || 1;
    const R = rng(sP * 2654435761 + 7);
    // en una canción cada etapa sortea aparte: cambiar el final de una sección no corre los sorteos de lo que viene antes
    const sub = (s, n) => ctx ? rng(s * 2654435761 + 7 + n * 0x9E3779B9) : R;
    const RA = sub(sP, 1), RL = sub(sP, 2), RV = sub(sP, 3), RB = sub(sB, 4), RP = sub(sC, 5);
    const mar = MARCHAS[opc.marcha] || MARCHAS.marcha;
    // cambio de acorde, de toda la sección (también hacia lo que sigue): '4y' piano y bajo traen el acorde nuevo en el 4& y lo
    // ligan al 1; '4' el bajo en el 4 y el piano en el 4& (salsa); '1' sin anticipo: el acorde cambia en el 1
    const cambio = ['4y', '4', '1'].includes(opc.cambio) ? opc.cambio : '4y', anticipa = cambio !== '1', posAnt = cambio === '4' ? 12 : 14;
    // la unión con la sección que sigue (opc.cambioFin, de la canción: dónde entra la que viene) manda en el último compás
    const cambioFin = ['4y', '4', '1'].includes(opc.cambioFin) ? opc.cambioFin : cambio;
    const cambioDe = b => opc.contexto && b === nb - 1 ? cambioFin : cambio;
    const antDe = b => cambioDe(b) !== '1', posDe = b => cambioDe(b) === '4' ? 12 : 14;
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
      const G0 = C.gancho && !C.gancho.frase && !C.gancho.opus && C.gancho.celulas && C.gancho.H <= nb ? C.gancho : null;
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
      // ---------- Opus, Toontrack y la frase real (09_piano.js): lo que tocó un pianista, acomodado a los acordes de la sección.
      // Toontrack sin la colección local toca Opus en el estilo más parecido
      const modo = ['opus', 'toontrack', 'frase'].includes(k.frase) ? k.frase : 'celulas';
      let hecho = null;
      if (modo !== 'celulas' && TM.tocarPiano) {
        const TT = TM.TOONTRACK, ttElegido = k.tt_estilo && k.tt_estilo !== 'auto' ? TT.aEstilo[k.tt_estilo] : null;
        const X = { k, nb, L, lado, acordesDe, acordeEn, antDe, posDe, previo, ctx: !!ctx, C, M, R, RA, RV, info, marP, efect, opc, lineaFin,
          estilo: k.como || ({ salsa: 'salsa', cubano: 'sonmontuno', timba: 'pupy' })[opc.estiloPreferido] || null, centro: P.registro.p50 + (k.reg || 0) + (marP.reg || 0) };
        if (modo === 'toontrack') { hecho = TM.pianoToontrack(X); if (!hecho) { info.sinToontrack = true; if (ttElegido) X.estilo = ttElegido; } }
        if (modo === 'frase') { const n = porF[F].length, desde = C.gancho && C.gancho.frase && C.gancho.F === F ? C.gancho.desde : R() < 0.5 ? 0 : Math.floor(R() * n); hecho = TM.pianoFrase(X, F, desde); }
        if (!hecho) hecho = TM.pianoOpus(X);
      }
      if (hecho) { der.push(...hecho.der); izq.push(...hecho.izq); lineaFin = hecho.lineaFin || lineaFin; ligaFin = hecho.ligaFin; ganchoFin = hecho.ganchoFin; }
      else {
      const meta = (P.densidad.A + P.densidad.B) / 2 * efect.dens;
      const elegirCelula = (parecida) => {
        const pool = R() < (k.mezcla ?? 0.15) ? P.ciclos : porF[F];
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
          // la sección anticipa: el acorde nuevo llega en el 4& (si la célula no ataca ahí, se agrega el golpe) y queda ligado al 1
          if (antDe(b)) {
            if (!cand && !delCompas.some(e => e.pos === 15)) { cand = { pos: 14, d: 2, t: 'o', izq: 'nada', v: 90, inner: null, b, j: b % H, r: Math.floor(b / H), p16: b * 16 + 14, ch: ult }; E.push(cand); }
            if (cand) {
              cand.ch = sigCh; cand.antic = true; cand.liga = true; if (b === nb - 1) ligaFin = true;
              // hacia el lado 3 el anticipo queda ligado (el 1 no se ataca); hacia el lado 2, si la célula ataca el 1, lo vuelve a
              // atacar, como en la base (se liga el 95% hacia el lado 3 y el 55% hacia el lado 2): si no, el lado 2 se queda sin su 1 y el
              // ritmo pierde la clave. Al final de la sección, siempre ligado (la costura con la que sigue)
              const uno = E.find(e => e.b === b + 1 && e.pos === 0); if (uno && (lado(b + 1) === 'A' || b + 1 >= nb)) quitar.add(uno);
            }
          }
          if (k.dim > 0 && RA() < k.dim) {
            const cuatro = delCompas.find(e => e.pos === 12 && !e.antic);
            if (cuatro) { const r0 = (sigCh.raiz + 11) % 12; cuatro.ch = TM.acorde(TM.NOM[r0] + 'dim7'); cuatro.dim = true; }
          }
        }
        if (cs.length > 1 && cs[1].nombre !== cs[0].nombre) {
          const m = delCompas.find(e => e.pos === 6);
          if (m && anticipa) { m.ch = cs[1]; m.antic = true; }
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
      const centro = P.registro.p50 + k.reg + (marP.reg || 0), amb = k.amb ?? 7, lo = Math.round(centro - 12), hi = Math.round(centro + 11);
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
                if (Math.abs(st.pd) >= 3 && mm) s += 0.6 * (k.zig ?? 1) * ZIG(Math.sign(mm) === Math.sign(st.pd) ? 'sigue' : Math.abs(mm) <= 2 ? 'vuelvePaso' : 'vuelveSalto');
                if (st.f === 'X') s += (Math.abs(d) >= 1 && Math.abs(d) <= 2 && TONOS[c.f]) ? 2 : -3;
                if (st.paso) s += (Math.abs(d) >= 1 && Math.abs(d) <= 2) ? 1.2 : -1.8;
                if (st.ch && st.ch !== e.ch.nombre) { const fd = Math.abs(plegar(d)); s += 1.6 * ENL(fd === 0 ? 'comun' : fd <= 2 ? 'paso' : fd <= 4 ? 'tercera' : 'cuarta'); }
                if (ref) {
                  if (ref.ch === e.ch.nombre) s += c.m === ref.top ? (recuerda ? G : 0.3 * G) : 0;
                  else if (ref.dir != null && mm) s += Math.sign(mm) === ref.dir ? 0.9 * k.gancho : -0.3 * k.gancho;
                }
              } else if (recuerda && c.m === ref.top) s += G;
              s += (k.temp ?? 0.6) * 0.8 * gumbel(RL);
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
        // una nota de paso cromática va sola (en octava o en bloque sonaría a acorde equivocado)
        const cromatica = TM.funcion(m, ch) === 'X';
        if (cromatica) ps = [m];
        else if (e.t === 'o') {
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
        // décimas: la izquierda canta la línea una décima abajo de la nota de arriba (si no hay nota del acorde ahí, a la octava)
        else if (modo === 'decima') { const t = debajo(m, ch, 14, 17, 15.5); mi = [t != null ? t : piso - 12]; }
        else if (modo === 'contrario') { const eje = centro - 18, obj = 2 * eje - m + 12; let best = null; for (let x = obj - 6; x <= obj + 6; x++) if (tonos(ch).includes(pc(x)) && (best == null || Math.abs(x - obj) < Math.abs(best - obj))) best = x; if (best != null && best < piso - 4) mi = [best]; }
        mi = mi.map(x => { while (x < 45) x += 12; return x; }).filter(x => x < piso);   // nunca debajo del la2: embarra el bajo
        // marchas livianas: la izquierda solo en los anticipos, en el 1 y el 3, y a veces
        if (mi.length && marP.izq != null && !e.antic && e.pos % 8 !== 0 && RV() > marP.izq) mi = [];
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
      // ancla en el grave: notas propias de la izquierda, en los lugares de la clave: el 1 y el 3 del lado 2, el bombo (2&) y el
      // anticipo (4&) del lado 3 (al revés, el lado 3 atacado en el 1 suena cruzado: en la base, el 1 del lado 3 se liga)
      if (k.lh === 'ancla') {
        izq.length = 0;
        for (let b = 0; b < nb; b++) for (const [pos, L_] of (lado(b) === 'B' ? [[0, 8], [8, 6]] : [[6, 8], [14, 2]])) {
          const ch = pos === 14 ? acordesDe(b + 1)[0] : acordeEn(b, pos);
          let m = 36 + pc(ch.raiz); if (m < 41) m += 12;
          const d = der.find(x => x.p === b * 16 + pos); if (d && m >= Math.min(...d.ps)) m -= 12;   // siempre debajo de la derecha
          izq.push({ p: b * 16 + pos, L: L_, ps: [m], v: 84, art: '->', ch });
        }
      }
      }   // fin del piano generado
    }

    // =========================== BAJO ===========================
    const bajo = [];
    let bajoFin = previo ? previo.bajo : null;
    // «según el estilo y la marcha»: en cuerpo, coro y mambo el tumbao del estilo; en las demás marchas, el de la marcha
    let estiloBajo = k.b_estilo !== 'auto' ? k.b_estilo : ['cuerpo', 'marcha', 'mambo'].includes(opc.marcha || 'marcha') && opc.bajoEstilo ? opc.bajoEstilo : mar.bajo;
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
        const o = b * 16, pA = posDe(b), sig = antDe(b) ? acordesDe(b + 1)[0] : acordeEn(b, 14), fin = { p: o + pA, L: 16 - pA, ps: [grave(sig)], v: 104, art: '->', ch: sig };
        // con el anticipo en el 4 (salsa), el golpe del 4 es el anticipo y el deslizamiento del lado 2 termina antes
        if (lado(b) === 'A') { const ch = acordeEn(b, 0), r = grave(ch); bajo.push({ p: o, L: 1, ps: [r], v: 110, art: '->', ch }, { p: o + 6, L: 6, ps: [r + 12], v: 94, art: '\\glissando', ch }, ...(pA > 12 ? [{ p: o + 12, L: 2, ps: [r], v: 98, art: '', ch }] : []), fin); }
        else { const ch = acordeEn(b, 4), r = grave(ch), c2 = acordeEn(b, 10); bajo.push({ p: o + 4, L: 1, ps: [r], v: 110, art: '->', ch }, { p: o + 8, L: 1, ps: [r], v: 106, art: '->', ch }, { p: o + 10, L: pA - 10, ps: [grave(c2) + 12], v: 92, art: '\\glissando', ch: c2 }, fin); }
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
      // negras en el lado 2 (b_lado2): el bajo de timba camina el lado 2 de la clave en el 1, el 2, el 3 y el 4, y en el 4 trae la
      // raíz que viene. Según el estilo: en la timba, en el primer compás del lado 2 de la sección y cada 4 vueltas (el dueño: «no
      // es para hacer siempre: para las entradas de las secciones»). El último compás de la sección queda para la unión
      // (con el tumbao de salsa elegido a mano, solo si se pide)
      const modoNegras = k.b_lado2 && k.b_lado2 !== 'auto' ? k.b_lado2 : opc.estiloBanda === 'timba' && estiloBajo !== 'salsa' ? 'cada4' : 'nunca';
      const primeraB = v => { for (let b = v * L; b < Math.min(nb, (v + 1) * L); b++) if (lado(b) === 'B') return b; return -1; };
      const negrasEn = b => lado(b) === 'B' && (b < nb - 1 || !ctx) && (modoNegras === 'siempre' || (modoNegras === 'entrada' && b === primeraB(0))
        || (modoNegras === 'cada4' && Math.floor(b / L) % 4 === 0 && b === primeraB(Math.floor(b / L))));
      for (let b = 0; b < nb; b++) {
        let evs = mitadB(lado(b)).map(x => ({ ...x }));
        if (k.b_dens < 1) evs = evs.filter(x => x.rol === 'R+' || x.rol === 'R' || RB() < k.b_dens);
        if (k.b_dens > 1 && !evs.some(x => x.pos === 8) && RB() < k.b_dens - 1) evs.push({ pos: 8, d: 2, rol: '5', dz: null });
        const cs = acordesDe(b), sigCh = acordesDe(b + 1)[0], cambia = sigCh.nombre !== cs[cs.length - 1].nombre;
        // el anticipo del bajo es el cambio de acorde de la sección: la raíz que viene llega en el 4& (timba) o en el 4 (salsa) y
        // queda ligada al 1; sin anticipo, el compás sigue en el acorde de ahora y la raíz nueva entra en el 1. El tumbao de salsa
        // (2& y 4) anticipa en el 4 en cualquier estilo; solo el último compás de la sección sigue la unión con la que viene
        if (antDe(b)) {
          const posAnt = estiloBajo === 'salsa' && (b < nb - 1 || !ctx) ? 12 : posDe(b);
          for (const x of evs) if (x.rol === 'R+' && (x.pos === 12 || x.pos === 14)) x.pos = posAnt;
          if (cambia) {
            let x = evs.find(e => e.rol === 'R+' && e.pos >= 12) || evs.filter(e => e.pos >= 12).pop();
            if (!x) { x = { pos: posAnt, d: 4, rol: 'R+', dz: null }; evs.push(x); }
            Object.assign(x, { rol: 'R+', pos: posAnt });
            evs = evs.filter(e => e === x || e.pos < 12);
          }
        } else for (const x of evs) if (x.rol === 'R+') x.rol = 'R';
        // la raíz en el 1: solo si el compás de antes no la trajo ligada (no anticipó) y el acorde cambió
        if (b > 0 && !antDe(b - 1) && acordesDe(b - 1).at(-1).nombre !== cs[0].nombre && !evs.some(x => x.pos === 0)) evs.push({ pos: 0, d: 4, rol: 'R', dz: null });
        if (sigCh.nombre !== cs[cs.length - 1].nombre && RB() < k.b_aprox) {
          const rp = evs.find(x => x.rol === 'R+'); if (rp && !evs.some(x => x.pos === rp.pos - 2) && rp.pos >= 12) evs.push({ pos: rp.pos - 2, d: 2, rol: 'apB', dz: null });
        }
        // al principio del tema (o después de un corte) el bajo entra con la raíz en el 1; en medio de la canción viene ligado de antes
        if (b === 0 && (!previo || previo.entraSolo) && !evs.some(x => x.pos === 0)) evs.push({ pos: 0, d: 4, rol: 'R', dz: null });
        // con la clave de son, el bajo toca el tercer golpe del lado 3 (el 4): si la célula no lo trae, la raíz de ahora. Y el tumbao
        // de salsa que toca el 1 es el tresillo (1, 2& y 4)
        if (tipoClave === 'son' && lado(b) === 'A' && CELULA_CON_4.includes(estiloBajo) && !evs.some(x => x.pos === 12)) evs.push({ pos: 12, d: 2, rol: 'R', dz: null });
        if (estiloBajo === 'salsa' && evs.some(x => x.pos === 0)) { if (!evs.some(x => x.pos === 6)) evs.push({ pos: 6, d: 6, rol: '5', dz: null }); if (!evs.some(x => x.pos === 12)) evs.push({ pos: 12, d: 4, rol: 'R', dz: null }); }
        // las negras del lado 2: raíz, 3a y 5a («caminando», lo más común en la timba) o raíz, raíz y 5a; el 1 no suena si la nota
        // viene ligada del compás de antes
        if (negrasEn(b)) {
          const ligada = b > 0 ? antDe(b - 1) : !!(previo && !previo.entraSolo), roles = k.b_lado2_notas === 'raiz' ? ['R', 'R', '5'] : ['R', '3', '5'];
          evs = [...(ligada ? [] : [{ pos: 0, d: 4, rol: roles[0], dz: null }]), { pos: 4, d: 4, rol: roles[1], dz: null }, { pos: 8, d: 4, rol: roles[2], dz: null }, { pos: 12, d: 4, rol: antDe(b) ? 'R+' : 'R', dz: null }];
        }
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
    // por instrumento (07_percusion.js): lo de entrada de la marcha de la percusión y del estilo, con lo que elija la sección
    const marchaPerc = MARCHAS[opc.marchaPerc] ? opc.marchaPerc : MARCHAS[opc.marcha] ? opc.marcha : 'marcha';
    const pr = TM.percutir({ nb, lado, tipoClave, marcha: marchaPerc, estilo: opc.estiloBanda || null, eleccion: opc.percusion || null, mix, R: RP, intensidad: k.p_int });
    info.percusion = 'por instrumento'; info.percUsa = pr.usa;
    perc = pr.compases;
    for (let b = 0; b < nb; b++) {
      const out = perc[b];
      // relleno de timbal al final de cada vuelta de la progresión, con el platillo en el 1 que sigue
      if (b % L === L - 1 && (pr.usa.timbal || pr.usa.bateria) && RP() < k.p_relleno && mix.timbales > 0) {
        for (let i = out.length - 1; i >= 0; i--) if (out[i].p >= 10 && ['timbales', 'campanas'].includes(TM.familiaPerc(out[i].d))) out.splice(i, 1);
        for (const [q, d, v] of RELLENO) out.push({ p: q, d, v: v * mix.timbales });
        if ((b + 1 < nb || ctx) && mix.bateria > 0 && pr.usa.bateria) out.push({ p: 16, d: 'crash', v: 0.7 * mix.bateria });
      }
    }
    // el platillo del relleno cae en el 1 del compás siguiente (en una canción, puede ser el de la sección que viene)
    for (let b = 0; b < perc.length; b++) for (let i = perc[b].length - 1; i >= 0; i--) if (perc[b][i].p >= 16) { const e = perc[b].splice(i, 1)[0]; if (perc[b + 1]) perc[b + 1].push({ ...e, p: e.p - 16 }); else if (ctx) desborde.push({ ...e, p: e.p - 16 }); }

    return { compases: nb, prog, acordes: Array.from({ length: nb }, (_, b) => acordesDe(b)), der, izq, bajo, perc, mix, info, marcha: opc.marcha || 'marcha', marca: mar.marca, clave: opc.clave, lados: Array.from({ length: nb }, (_, b) => lado(b)),
      ...(ctx ? { fin: { linea: lineaFin, bajo: bajoFin, ligaAl1: ligaFin, desborde }, gancho: ganchoFin } : {}) };
  }

  Object.assign(TM, { generar, MARCHAS, PERILLAS, PERILLAS_UI, ESTILOS, BAJO_GUIA, TOONTRACK });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
