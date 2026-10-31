/* =====================================================================
   MOTOR DE TUMBAOS · 7. PERCUSIÓN POR INSTRUMENTO
   Cada instrumento tiene sus patrones con nombre; la marcha y el estilo eligen uno de entrada y la sección puede cambiarlo.
   Un patrón es una línea de 16 semicorcheas por tambor y por lado de la clave (A = lado 3, B = lado 2); cada dígito es la
   fuerza del golpe (1 = fantasma … 9 = acento). Fuentes (ver Tumbaos_de_timba_guia.md):
   - Kevin Moore, Beyond Salsa Percussion vol. 3, cuadro de terminología (escrito en 2-3: la primera mitad es el lado 2):
     cáscara, campaneo (campana del bongó), contracampaneo (campana del timbal), bombo y ponche, patadas de timba.
   - Mauleón (Salsa Guidebook p. 63, vía Wikipedia «Tumbao»): conga H T S T H T O O.
   - timba.com, Roots of Timba (Changuito): songo de Van Van.
   - El corpus (patrones_corpus.js, 57 temas con la clave tocada): güiro largo en 1 y 3, cortos en el resto; bongó martillo
     con el abierto grave en el 4; tumba en el 2& y el 3; campana del bongó en 1 y 3.
   ===================================================================== */
(function (TM) {
  'use strict';
  const L = (A, B) => ({ A, B: B || A });
  // ---------- los patrones de cada instrumento
  const PATRONES = {
    congas: {
      tumbao1: { n: 'tumbao de una conga', f: 'Mauleón: talón, punta, slap en el 2, punta, talón, punta, abiertos en el 4 y el 4&',
        ...L({ congaH: '3.2...2.3.2.....', congaS: '....8...........', congaO: '............7.8.' }) },
      tumbao2: { n: 'tumbao de dos congas', f: 'el de una conga con la tumba en el bombo (2&) y el 3 (corpus: 27% de los compases de coro)',
        ...L({ congaH: '3.2.......2.....', congaS: '....8...........', salidor: '......8.5.......', congaO: '............7.8.' }) },
      marcha3: { n: 'marcha de tres congas (timba)', f: 'la conga «bota» de la timba (Van Van, Paulito, Manolito): manoteo en todo el compás, slaps y abiertos que cambian de tambor según el lado',
        A: { congaH: '4...4...4...4...', muff: '..3...3.........', congaS: '....8.....7...8.' },
        B: { congaH: '4...4...4...4...', muff: '..3...3.........', congaS: '....8...........', congaO: '..............8.', salidor: '............7...' } },
      guaguanco: { n: 'guaguancó (salidor y tres-dos)', f: 'la percusión clásica de la página: el tres-dos y el salidor conversan, tapados y talones en el medio',
        A: { congaH: '5.3.....4.......', congaS: '....8...........', muff: '......4.......4.', tresdos: '..........9.8...' },
        B: { congaH: '5.3.....4.3.....', congaS: '....8...........', muff: '......4.........', salidor: '............9.8.' } },
      songo: { n: 'songo (Van Van)', f: 'timba.com, Changuito: lado 2 agudos en el 2& y el 3, graves en el 4 y el 4&; lado 3 graves en 1, 1&, 2, 2&, agudos en el 4 y el 4&',
        A: { salidor: '6.5.6.7.........', congaO: '............7.8.', congaH: '........3.3.....' },
        B: { congaH: '3.3.3...........', congaO: '......7.6.......', salidor: '............7.8.' } },
      tapado: { n: 'tapado suave (muela)', f: 'el guaguancó a media fuerza, casi todo tapado',
        A: { congaH: '3.2.....3.......', muff: '....4.3.......3.', tresdos: '..........5.....' },
        B: { congaH: '3.2.....3.2.....', muff: '....4.3.........', salidor: '............5.4.' } }
    },
    quinto: {
      frases: { n: 'frases al final de la frase', f: 'la percusión clásica de la página: el quinto improvisa en el 4.º compás de cada frase' },
      seguido: { n: 'improvisando siempre', f: 'el quinto en todos los compases (bomba, despelote, rumba)' }
    },
    bongo: {
      martillo: { n: 'martillo', f: 'corcheas con el abierto grave en el 4 (corpus: 17%) y los toques del medio suaves',
        ...L({ bongoH: '6...5...6.......', bongoM: '..3...3...3...4.', bongoL: '............7...' }) },
      campana: { n: 'campana', f: 'Moore, campaneo: boca en 1 y 3; lado 2 talón en el 2, el 4 y el 4&; lado 3 también en el 2&',
        A: { bongoBell: '9.......8.......', bongoBellC: '....6.4.....6.4.' },
        B: { bongoBell: '9.......8.......', bongoBellC: '....6.......6.4.' } }
    },
    timbal: {
      cascara: { n: 'cáscara', f: 'Moore: lado 2 en 1, 2, 3, 3& y 4&; lado 3 en 1, 2, 2&, 3& y 4&; la izquierda en el timbal grave hace el bombo (2&) y el ponche (4)',
        A: { cascara: '7...5.7...6...5.', timbalL: '......4.....7...' },
        B: { cascara: '7...7...5.6...5.', timbalL: '......4.....7...' } },
      campana: { n: 'campana de mambo', f: 'Moore, contracampaneo: lado 2 en 1, 2, 3, 3&, 4, 4&; lado 3 en 1&, 2, 2&, 3, 4, 4&',
        A: { bell: '..6.9.6.9...9.6.' },
        B: { bell: '9...9...9.6.9.6.' } },
      negras: { n: 'campana en negras (despelote)', f: 'la percusión clásica de la página: campana en los cuatro tiempos, el 1 del lado 2 marcado',
        A: { bell: '9...7...9...7...' }, B: { bell: '9...7...9...7...' } },
      songo: { n: 'guagua de songo', f: 'timba.com, Changuito: la guagua (campana o bloque) en 1 y 3, en los dos lados', ...L({ block: '8.......7.......' }) }
    },
    guiro: {
      salsa: { n: 'largo-corto-corto', f: 'corpus: largo en 1 y 3, cortos en el 2, 2&, 4 y 4&', ...L({ guiroL: '6.......6.......', guiroS: '....5.4.....5.4.' }) },
      corcheas: { n: 'cortos en corcheas (despelote)', f: 'la percusión clásica de la página', ...L({ guiroS: '5.3.5.3.5.3.5.3.' }) }
    },
    palitos: {
      clave: { n: 'palitos (catá)', f: 'los palitos tocan todos los golpes de la clave (cáscara), los de la clave más fuerte',
        A: { palito: '7...5.7...5...5.' }, B: { palito: '5...7...7.5...5.' } }
    },
    bateria: {
      cuerpo: { n: 'cuerpo (suave)', f: 'la percusión clásica de la página: charles con el pie en el 2 y el 4, bombo suave en el 2& del lado 3',
        A: { hhP: '....3.......3...', kick: '......4.........' }, B: { hhP: '....3.......3...' } },
      marcha: { n: 'marcha de timba', f: 'Moore, patada estándar: lado 2 en el 1 y el 2&, lado 3 en el 1&, el 3 y el 4; charles con el pie en el 2 y el 4',
        A: { kick: '..6.....7...7...', hhP: '....4.......4...' }, B: { kick: '7.....7.........', hhP: '....4.......4...' } },
      charanga: { n: 'marcha de La Charanga Habanera', f: 'Moore: lado 2 en el 1, el 2 y el 3; lado 3 en el 2& y el 3',
        A: { kick: '......6.7.......', hhP: '....4.......4...' }, B: { kick: '7...6...7.......', hhP: '....4.......4...' } },
      mambo: { n: 'marcha de mambo', f: 'la patada estándar con el ride en el 1 y el 2 y el crash al entrar',
        A: { kick: '..6.....7...7...', ride: '5...5...5...5...' }, B: { kick: '7.....7.........', ride: '5...5...5...5...' } },
      presion: { n: 'presión', f: 'Moore, patada de presión en el 3 y el 4 de los dos lados; charles en corcheas; crece hasta el final',
        ...L({ kick: '........8...8...', hhC: '6.4.6.4.6.4.6.4.' }) },
      bomba: { n: 'bomba', f: 'bombo y caja «funk», ride en corcheas (la percusión clásica de la página)',
        A: { kick: '7.....7...7.....', ride: '7.4.7.4.7.4.7.4.' }, B: { kick: '7.....7.........', snare: '....9...........', ride: '7.4.7.4.7.4.7.4.' } },
      despelote: { n: 'despelote', f: 'caja en el 2 y el 4; el bombo y la campana marcan el 1 del lado 2',
        A: { kick: '......7.......7.', snare: '....7.......7...' }, B: { kick: '9.....7...7.....', snare: '....7.......7...' } },
      songo: { n: 'songo (Changuito)', f: 'timba.com: patada en el bombo (2&), aro en el 1&, el 2, el 3& y el 4& del lado 2 y en el 1& y el 2 del lado 3',
        A: { kick: '......7.........', rim: '..5.6...........', hhC: '4...4...4...4...' }, B: { kick: '......7.........', rim: '..5.6.....5...6.', hhC: '4...4...4...4...' } },
      muela: { n: 'muela', f: 'casi nada: charles suave y un bombo de vez en cuando', A: { hhC: '....3.......3...', kick: '......4.........' }, B: { hhC: '....3.......3...' } }
    }
  };
  // ---------- de entrada: qué toca cada instrumento en cada marcha (null = no toca), y lo que cambia según el estilo
  const DE_MARCHA = {
    cuerpo: { congas: 'tumbao2', quinto: 'frases', bongo: 'martillo', timbal: 'cascara', guiro: 'salsa', palitos: null, bateria: 'cuerpo' },
    marcha: { congas: 'tumbao2', quinto: 'frases', bongo: 'campana', timbal: 'campana', guiro: 'salsa', palitos: null, bateria: 'marcha' },
    mambo: { congas: 'tumbao2', quinto: 'frases', bongo: 'campana', timbal: 'campana', guiro: 'salsa', palitos: null, bateria: 'mambo' },
    presion: { congas: null, quinto: null, bongo: null, timbal: null, guiro: null, palitos: null, bateria: 'presion' },
    bomba: { congas: 'guaguanco', quinto: 'seguido', bongo: null, timbal: null, guiro: null, palitos: null, bateria: 'bomba' },
    despelote: { congas: 'guaguanco', quinto: 'seguido', bongo: null, timbal: 'negras', guiro: 'corcheas', palitos: 'clave', bateria: 'despelote' },
    muela: { congas: 'tapado', quinto: null, bongo: null, timbal: null, guiro: null, palitos: 'clave', bateria: 'muela' }
  };
  const DE_ESTILO = {
    son: { congas: { cuerpo: 'tumbao1', marcha: 'tumbao1', mambo: 'tumbao1' }, timbal: { cuerpo: null, marcha: null, mambo: null }, bateria: null },
    mambo: { congas: { cuerpo: 'tumbao2' }, bateria: null },
    salsa: { bateria: null },
    songo: { congas: { cuerpo: 'songo', marcha: 'songo', mambo: 'songo' }, timbal: { cuerpo: 'songo', marcha: 'songo' }, bateria: { cuerpo: 'songo', marcha: 'songo', mambo: 'songo' } },
    timba: { congas: { marcha: 'marcha3', mambo: 'marcha3' } }
  };
  const INSTRUMENTOS = ['congas', 'quinto', 'bongo', 'timbal', 'guiro', 'palitos', 'bateria'];
  // lo de entrada para una marcha y un estilo
  function deEntrada(marcha, estilo) {
    const m = DE_MARCHA[marcha] || DE_MARCHA.marcha, e = DE_ESTILO[estilo] || {}, out = {};
    for (const i of INSTRUMENTOS) {
      let v = m[i];
      if (i in e) { const x = e[i]; if (x === null) v = null; else if (typeof x === 'object' && marcha in x) v = x[marcha]; }
      out[i] = v;
    }
    return out;
  }
  // el quinto: frases que varían de compás en compás (la percusión clásica de la página)
  const QUINTO = [[[10, 'quintoS'], [12, 'quintoO'], [14, 'quintoO']], [[6, 'quintoS'], [8, 'quintoO'], [12, 'quintoS'], [14, 'quintoO']],
    [[2, 'quintoO'], [4, 'quintoS'], [10, 'quintoO'], [14, 'quintoS']], [[0, 'quintoS'], [6, 'quintoO'], [8, 'quintoO'], [12, 'quintoS']],
    [[4, 'quintoS'], [6, 'quintoS'], [10, 'quintoO'], [12, 'quintoO'], [14, 'quintoS']]];
  const CLAVE = { son: { A: [0, 6, 12], B: [4, 8] }, rumba: { A: [0, 6, 14], B: [4, 8] } };

  // opc: { nb, lado(b), tipoClave, marcha, estilo, eleccion: {instrumento: patrón | null}, mix, R, intensidad (0-1), largo (compases de la progresión), relleno }
  function percutir(opc) {
    const { nb, lado, R } = opc, mix = opc.mix || {}, k = 0.75 + 0.5 * (opc.intensidad ?? 0.55);
    const usa = { ...deEntrada(opc.marcha, opc.estilo), ...(opc.eleccion || {}) };
    const fuerza = d => Math.min(1.25, (+d * 0.12) * k * (0.94 + 0.12 * R()));
    const out = [];
    for (let b = 0; b < nb; b++) {
      const L_ = lado(b), evs = [], fin = b % 4 === 3;
      const poner = (p, d, v) => { const mx = mix[TM.familiaPerc(d)] ?? 1; if (mx > 0) evs.push({ p, d, v: +(v * mx).toFixed(3) }); };
      for (const ins of ['congas', 'bongo', 'timbal', 'guiro', 'palitos', 'bateria']) {
        const pt = usa[ins] && PATRONES[ins][usa[ins]]; if (!pt) continue;
        const lineas = pt[L_] || pt.A;
        for (const d in lineas) for (let q = 0; q < 16; q++) { const c = lineas[d][q]; if (c !== '.') poner(q, d, fuerza(c)); }
      }
      // el quinto improvisa al final de cada frase de cuatro compases (o siempre)
      if (usa.quinto && (usa.quinto === 'seguido' || fin)) {
        const fr = QUINTO[Math.floor(R() * QUINTO.length)];
        for (const [q, d] of (usa.quinto === 'seguido' && !fin ? fr.slice(-2) : fr)) poner(q, d, fuerza(d === 'quintoS' ? 7 : 6));
      }
      if (mix.clave > 0) for (const q of CLAVE[opc.tipoClave][L_]) poner(q, 'clave', 0.95);
      out.push(evs);
    }
    return { compases: out, usa };
  }

  Object.assign(TM, { PERCUSION: PATRONES, PERC_INSTRUMENTOS: INSTRUMENTOS, percusionDeEntrada: deEntrada, percutir });
})(globalThis.TumbaoMotor = globalThis.TumbaoMotor || {});
