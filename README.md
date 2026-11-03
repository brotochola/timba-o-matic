# timba-o-matic

Para armar maquetas de canciones de timba y salsa: ponés las secciones y sus acordes, y la página arma piano, bajo, vientos y percusión, los muestra como un multipista, los escribe en partitura (LilyPond) y los toca con GeneralUser GS. Es una sola página: se abre `index.html` en el navegador y listo, o en línea en [brotochola.github.io/timba-o-matic](https://brotochola.github.io/timba-o-matic/).

Cómo está armado el repositorio y cómo se trabaja en el código: [más abajo](#qué-hay-en-el-repo).

## Cómo se usa

La app ocupa toda la ventana, a lo Ableton:
- **Arriba**, la barra: tocar y detener, compás y tiempo, tempo, clave, banda (timba con batería o salsa sin), loop (canción, sección o nada), «Seguir», los paneles y ◐ (la página es oscura; ◐ pasa a clara y queda guardado).
- **En el medio**, las pistas de la canción: cada bloque de color es una sección (el color dice la marcha) y cada fila un instrumento, con M, S y su volumen en esa sección. Un clic en el nombre de una pista la pliega; percusión y vientos también se pliegan como grupo. La regla, las secciones y los acordes quedan fijos arriba al bajar por las pistas: se puede elegir otra sección desde cualquier altura. En cada unión entre dos secciones, una píldora dice dónde entra la que sigue (4&, 4 o 1) y se cambia ahí mismo.
- **Abajo**, la sección elegida en siete bloques plegables: estructura, acordes, piano, bajo, percusión, vientos y solo. Cada bloque tiene una línea de ayuda (el texto entero, al pasar el mouse). El panel se achica o se agranda desde su borde de arriba y se oculta con ▾.
- **Encima**, cuando se abren: «Canción y sonido» y «Partitura» (con el código LilyPond y para abrir archivos .ly o .mid).
- Con **Seguir**, mientras suena, el panel de abajo muestra la sección que suena.
- **En el celular** (o acostado, en una pantalla táctil baja), la barra queda arriba con tocar, detener, dónde va y **Más**, que despliega tempo, clave, banda, loop y los paneles. Tocar una sección en las pistas baja hasta su panel, que va en pestañas (Estructura, Acordes, Piano, Bajo, Percusión, Vientos) fijas arriba al bajar por las perillas.

### La sección

Clic en una sección del multipista para editarla. Clic en una pista adentro de una sección: ese instrumento entra o sale ahí.

- **Estructura:** tipo (intro, cuerpo, coro, mambo, moña, solo de trompeta, presión, bomba, despelote, muela, bloque, final), **estilo**, marcha de la banda, **cambio de acorde** (adentro de la sección), compases, vueltas, **empieza** y **termina** (la unión con la sección de antes y con la que sigue, ver abajo), los golpes al final (ninguno; cierre sobre la clave, parada en clave, bloque de contratiempos, tres contra cuatro o un golpe, que caen donde entra la que sigue; o corte en el 1 y silencio), la variante de toda la sección (🎲 Todo) y qué instrumentos tocan.
- **Acordes:** uno por compás, o dos con «½».
- **Piano:** qué toca (**Opus**, de entrada; un patrón de Toontrack, de la colección local, con su estilo, su parte y su variación; la frase real de un tema; o las células), toca como (el estilo de la sección u otro), marcha propia, gancho, 🎲 otra variante solo del piano, y sus perillas.
- **Bajo:** el sonido (eléctrico o baby bass, para toda la canción), 🎲 otra variante solo del bajo, y sus perillas («Qué toca»: según el estilo y la marcha, o un tumbao elegido; «Negras en el lado 2»: el bajo de timba camina el lado 2 de la clave en el 1, el 2, el 3 y el 4, con la raíz que viene en el 4, al entrar la sección y cada 4 vueltas).
- **Vientos:** el formato de toda la canción (conjunto de trompetas, Sonora Ponceña, Gran Combo, trombanga, Fania, orquesta grande, salsa de los 90, timba, 3 trombones, o sin vientos), qué tocan en la sección (bloques, respuestas, moña, mambo, fondo o nada), la armonía (unísono y octavas, terceras, bloque, cuartas o como el tema de la base), cómo entran (de a una familia o juntos) y 🎲 otra variante solo de los vientos. Sus perillas: forma del mambo (todos el mismo ritmo, pregunta y respuesta entre trompetas y trombones, contrapunto de dos riffs, champola de tres líneas que terminan juntas, entradas escalonadas), largo de la frase (una, dos o cuatro claves), repetición, densidad, registro, articulación, cromatismo, crescendo, trompeta al agudo, remate (golpe en el anticipo, contratiempos hasta el golpe o nota larga) y de qué temas aprende (salsa, cubano y timba, o todos). En el multipista, Trompetas, Trombones y Saxos con M, S y volumen.
- **Percusión:** marcha propia, el plato del timbalero al empezar (con la entrada de la sección o en el 1), el relleno del último compás cuando la banda sigue derecho (abanico, redoble de timbal, floreo del quinto o toms de la batería), 🎲 otra variante solo de la percusión, qué toca cada instrumento (congas, quinto, bongó, timbal, güiro, palitos, batería: según la marcha, un patrón con nombre o nada) y sus perillas.
- **Solo:** la trompeta solista. Toca de entrada en las secciones de tipo «Solo de trompeta» (sobre el montuno, con las campanas arriba); en cualquier otra se pone desde acá o desde su pista en el multipista. 🎲 otro solo, y sus perillas: **cómo sopla** (son, a lo Chappottín; descarga, a lo Chocolate Armenteros; salsa brava; timba; latin jazz; de entrada, según el estilo), **forma** (solo corrido, o alterna con el coro: el coro canta una clave, o dos, y la trompeta contesta en la siguiente), **detrás del solo** (los vientos callan, notas largas, o una moña que entra en la segunda mitad), densidad, aire entre frases, registro, techo (la nota más aguda), construcción (cuánto crece hacia el clímax), desarrollo (cuánto retoma lo que ya tocó) y cromatismo. Debajo, lo que dice el **jurado** del solo que armó: su nota y la de cada rubro.

**Estilos.** El estilo dice cómo toca toda la banda en la sección: el piano, el tumbao del bajo, la percusión de entrada y el cambio de acorde.

| Estilo | Piano | Bajo | Percusión | Cambio |
|---|---|---|---|---|
| Son montuno | octavas, la izquierda doblando | salsa (2& y 4) | una conga, bongó, sin timbal | bajo en el 4 |
| Charanga | notas sueltas, la izquierda a dos octavas | salsa | una conga y timbal (campana de chachá), sin bongó | bajo en el 4 |
| Salsa brava | octavas, la izquierda a dos octavas | salsa | dos congas, bongó y timbal, sin batería | bajo en el 4 |
| Salsa de los 90 | la izquierda a la décima, tensiones | salsa | como la salsa brava | bajo en el 4 |
| Songo (Van Van) | más aire, sostenido | songo | congas, guagua y batería de Changuito | en el 4& |
| Timba · Pupy | gancho, movimiento contrario, disminuidos | en motivo con el piano | tres congas, campanas, batería de timba | en el 4& |
| Timba · Melón | corridas, notas repetidas | timba | como Pupy | en el 4& |
| Timba · Tirso | 3+4, terceras, saltos | timbero | como Pupy | en el 4& |

En las marchas fuertes (presión, bomba, despelote, muela) el bajo toca lo de la marcha: nota pedal, deslizamientos, muela.

**Mambo**, en la app, es siempre la sección donde tocan los vientos (el tipo de sección «Mambo», la marcha de mambo de la banda y lo que tocan los vientos ahí), no el género de los años 50.

**Cambio de acorde** (adentro de la sección): en el 4& (piano y bajo traen el acorde nuevo en el 4& y lo ligan al 1, la timba), bajo en el 4 y piano en el 4& (la salsa), o en el 1 (sin anticipo). De entrada, el del estilo. En el multipista, el acorde anticipado arranca antes de la raya del compás, con una marca roja donde llega (↺ en la vuelta del loop); la leyenda está al lado del zoom.

**La unión entre secciones:** cada sección **empieza** en el 4& del último compás de la de antes (anticipada), en el 4 (el bajo; el piano en el 4&) o en su 1. Ahí caen el acorde nuevo del piano, del bajo y de los vientos, los golpes del final de la sección de antes y el plato del timbalero. **Termina** es lo mismo visto desde la sección de antes: dónde entra la que sigue. Si no se elige, la sección entra como cambia el acorde la de antes. Se cambia en Estructura o en la píldora de la unión, en el multipista.

**El loop es un círculo:** lo que sigue a la última sección del loop es la primera (o la misma, si el loop es la sección). El final anticipa el principio (↺ en el multipista), lo ligado sigue sonando del otro lado y el 1 del principio suena solo al arrancar: una sección sola anticipada loopea sin costura.

**Perillas:** lo que se mueve queda en la sección elegida. En rojo, lo que la sección cambia respecto de su estilo; ↺ lo vuelve al estilo y «a todas» lo pasa a todas las secciones. M y S valen para toda la canción; el volumen de cada pista es de cada sección (moviéndolo con Shift, de todas).

### Canción y sonido

- El sonido de entrada es **GeneralUser GS**: se carga solo la primera vez que tocás. También están la banda de samples (3 MB), el sintetizador y un dispositivo MIDI externo.
- **Demos:** canciones armadas con la app (timba con presión y despelote, salsa brava, son montuno…), para escuchar y tocar sus perillas. Son las de [canciones/](canciones/) que tienen `orden`: `herramientas/construir.js` las mete en la página en ese orden. La primera vez que alguien abre la app (sin canción guardada) se abre la marcada `portada`.
- «★ Guardar canción» la guarda en el navegador; «Exportar canción» la baja como `.json` (el mismo formato de las demos) y «Importar canción…» la abre.
- **Bajar como** tema (con principio y final) o loop (el final anticipa el principio y el primer 1 no se repite, para pegarlo en el DAW sin costura):
  - **Bajar MIDI** (también el botón `.mid` de arriba): piano, bajo, trompetas, trombones, saxos, una pista por instrumento de percusión y un marcador por sección.
  - **Bajar MP3**: la canción grabada con los sonidos elegidos y la mezcla. Se codifica en el navegador con [lamejs](https://github.com/zhuker/lamejs), que se baja la primera vez; sin internet sale en WAV.
- **Copiar LilyPond**: la partitura (con una marca por sección), que compila tal cual en LilyPond 2.24.

## Cómo genera

- **Piano:** de entrada, **Opus** ([motor/09_piano.js](motor/09_piano.js)): elige un tema y uno de sus montunos de 2 o 4 compases, por el estilo, el tipo de sección y el ritmo armónico de tus acordes; lo repite como gancho con las perillas y la marcha, y lo lleva a tus acordes conduciendo las voces (la 3a a la 3a, el contorno y el registro; nada fuera del acorde queda largo ni en el 2& o el 4&). Aprende de la base, de Toontrack y de una biblioteca de montunos (`b:opus`, 1013 ciclos de 93 temas). Las células (el piano de antes) aprenden de una base de MIDIs analizados. Toman células reales (ritmo y textura, lado 3 | lado 2 de la clave) de los temas del estilo y del tipo de sección; busca la línea de arriba nota por nota (función armónica, zigzag, enlace entre acordes, un gancho que se repite) y la viste según el estilo. En la frase real toca la frase entera de un tema y le acomoda las notas a los acordes (la raíz a la raíz, la tercera a la tercera).
- **Bajo:** tumbaos escritos por rol (raíz, quinta, tercera, la raíz que viene) y medidos en el corpus: el de salsa (la quinta en el 2&, la raíz que viene en el 4), el de timba («Ya empezó la fiesta»: la misma nota en el 2& y el 3, la raíz o la tercera en el 4, la raíz que viene en el 4&), songo, timbero, motivo, pedal, notas largas, deslizamientos, muela.
- **Vientos:** [motor/08_vientos.js](motor/08_vientos.js) aprende de los ciclos de vientos de todos los temas de la base (los propios, mididb y la colección de mambos) y los clasifica: moña (un riff que se repite), mambo (una línea que cambia), respuesta (corta, en los huecos del cantante) y fondo (notas largas). La sección toca los riffs de un tema acomodados a tus acordes, con cada golpe en unísono o armonizado como en el original; los bloques son golpes con la banda en los anticipos y al final (siempre con la nota de arriba del acorde). La línea es la del instrumento que lleva el riff en el tema; las notas del acorde van a la misma función del acorde nuevo y las de paso, como aproximación a la nota del acorde a la que van. La octava se elige por frase, no nota por nota, así la línea no se rompe; en el contrapunto la trompeta queda arriba. Con crescendo, en el último tercio el mambo trae material nuevo y sube. Las notas de paso van como aproximación a la nota del acorde y se armonizan en paralelo con ella; las de paso rápidas (semicorcheas) van al unísono, y ninguna voz baja de donde su intervalo embarra (reglas de big band: Absil, Rogers, Hoffmann). Con la trompeta arriba del Fa5, una voz la dobla una octava abajo. La armonía **trombanga** (la de la salsa brava) es la de Willie Colón: el riff de los dos trombones al unísono, en registro grave, y una frase de cada dos se abre en terceras y termina raspando en una segunda. Con la orquesta grande, el contrapunto es de metales contra saxos, y la moña en capas entra como las capas de Machito: el guajeo de los trombones, las respuestas de los saxos y la contramelodía de las trompetas. En la timba los metales callan en los coros y tocan el mambo después. Los temas de otros géneros de la base (merengue, cumbia, pop) casi no entran en la salsa y la timba, y los boleros, poco. La investigación (entrevistas y textos de arregladores y vientistas de salsa y timba) está resumida en los comentarios del módulo y completa en [docs/investigacion/](docs/investigacion/).

  Medido en el corpus (`vientos_corpus.js`, 90 temas con la clave tocada) y en lo que sale (`jurado.js`, con el mismo modelo de vientos que la página):

  | | Corpus | La app |
  |---|---|---|
  | notas cortas | 65% | 77% |
  | golpes en unísono u octavas | 52% | 68% |
  | la de arriba de la trompeta, por grado / repite / más de una quinta | 40% / 21% / 7% | 33% / 19% / 11% |
  | sección de mambo larga: la nota más aguda de cada compás, del primer tercio al último | +2 semitonos (de Do5 a Re5) | +2 |
  | la de arriba de la trompeta en el mambo, mediana | Si4 | Do#5 |
  | trompetas y trombones en el mismo ritmo / alternando por compás | 33% / 2% | forma «bloque» por defecto |

- **Percusión:** patrones por instrumento con la fuerza de cada golpe ([motor/07_percusion.js](motor/07_percusion.js), cada uno dice de dónde sale): la cáscara, el campaneo, el contracampaneo y las patadas de timba del cuadro de Kevin Moore (Beyond Salsa Percussion vol. 3); el tumbao de conga con manoteo de Mauleón; el songo de Changuito (timba.com); el güiro, el martillo y la tumba del corpus. No hay maracas: el raspado es el güiro. Las dos campanas suenan distinto ([investigación sobre la campana](docs/investigacion/campana.md): Moore anota dos timbres por campana): la del bongó es la más grave y la del timbal más aguda, y cada una tiene su boca abierta y su talón seco y brillante; el contracampaneo va abierto en los tiempos y en talón en los contratiempos.
- **Trompeta solista:** [motor/10_solo.js](motor/10_solo.js) aprende de frases reales: los solos de trompeta y corneta de la [Weimar Jazz Database](https://jazzomat.hfm-weimar.de) (101 y 15, transcriptos nota por nota con sus acordes y sus frases) y los de cualquier instrumento con toque latino o funk. Cada modo aprende de sus trompetistas: el son, de los de la era del swing (Armstrong, Eldridge, Buck Clayton: a Chappottín le decían «el Armstrong cubano»); la descarga y la salsa brava, del hard bop (Clifford Brown, Lee Morgan, Kenny Dorham, Freddie Hubbard); la timba, de Hubbard, Woody Shaw y Wynton Marsalis. El solo es un plan de frases de una clave (a veces dos), con aire entre frases y una intensidad que sube hasta el clímax (al 85%): registro, densidad, menos aire y un «grito», una nota larga y aguda. Cada frase es una frase real, elegida por su largo, su densidad, la armonía de donde viene (un lick de ii–V va a un ii–V) y por cómo encaja en la clave: el encaje se aprende de los vientos de la base (qué posiciones atacan en el lado 3 y en el lado 2) y coincide con lo que dicen los libros (el bombo del lado 3 ligado, el anticipo del 4& en el lado 2). La frase se lleva a tus acordes con Viterbi: los mismos intervalos que la original, cada nota con su grado sobre la raíz (el 3 sigue siendo 3), las notas del acorde en notas del acorde, las de paso de paso (cromáticas si eran cromáticas y el modo lo deja), nada largo fuera del acorde y el final de frase en la quinta o la raíz; la frase real en sus propios acordes vuelve igual (96%). El desarrollo: la frase anterior en los acordes nuevos (una secuencia), más arriba, una célula de 3 a 5 notas que se repite corrida, y una nota pedal que se estira sobre la clave (Chappottín en «Coralia»). La investigación (Ferguson y Ortega sobre la trompeta de son y Chocolate Armenteros, el análisis de la Weimar Jazz Database, el latin jazz) está en [docs/investigacion/](docs/investigacion/).

  [jurado_solo.js](herramientas/jurado_solo.js) mide 26 rasgos del solo en cinco rubros (armonía, línea, fraseo, arco y desarrollo, clave) y los compara con los trompetistas reales (tramos de 16 compases con tempo de salsa; cada modo, contra sus trompetistas, corrido por lo que la investigación espera del modo: el son casi sin cromáticas). Cada rasgo dentro de lo que hace la mitad de los trompetistas vale 1 y afuera baja como una campana; la nota es la media geométrica de los rubros. La naturalidad de la línea y del ritmo se mide con un modelo de la otra mitad de los solos, y la clave contra los vientos de los temas de salsa y timba. Para ver que el jurado distingue, juzga también a dos solistas tontos:

  | | Nota (0 a 10) |
  |---|---|
  | trompetistas reales | 8,8 |
  | la app: descarga, timba, latin jazz | 9,4 · 9,3 · 9,6 |
  | la app: son, salsa brava, son contestándole al coro | 9,2 · 9,1 · 8,8 |
  | notas al azar de la escala | 6,8 |
  | arpegios corridos sin respirar | 3,9 |

  Con otras progresiones y otras semillas (`--otras`, que no se usaron para afinar el motor) da lo mismo. Que la app saque más que los trompetistas reales no quiere decir que toque mejor: el jurado premia estar dentro de lo normal en cada medida, y los reales son más variados (cada uno se sale de lo normal en alguna). Lo que el jurado no oye (el sonido, el swing, si el solo emociona) se juzga escuchando.

La canción se genera sección por sección, cada una con su semilla, y cada sección recibe la costura de la anterior: el lado de la clave, el acorde que viene, la última nota de la línea y del bajo, y la ligadura al 1. Los finales de sección: los golpes (cierre, parada, contratiempos, tres contra cuatro, un golpe) los tocan piano, bajo, vientos y percusión juntos y caen donde entra la sección que sigue: en el 4& o el 4, el golpe de la llegada ya trae el acorde que viene, ligado al 1; si la que sigue entra en el 1, el último golpe es del acorde de ahora y la banda cae junta en el 1. El tres contra cuatro cuenta de a tres semicorcheas hacia atrás desde la llegada. La parada en clave no anticipa: calla. El corte es golpe en el 1 y silencio. Si la banda sigue derecho, la percusión puede hacer un relleno en el último compás: abanico (redoble de timbal en el 4 y golpe de borde y plato en el 1 que viene), redoble, floreo del quinto o toms.

**Toontrack.** En el bloque Piano, «Qué toca el piano: patrón de Toontrack» elige el estilo (son montuno, salsa media y rápida, songo, funk cubano), la parte (según el tipo de sección, o una fija: intro, A, B, coro, montuno, soneo, mambo, solo, break, final) y la variación, del paquete *Latin Cuban EZkeys MIDI*. Es material comprado: está solo en la compu donde se armó la base; sin él (por ejemplo, en GitHub Pages), toca Opus en el estilo más parecido. Opus también aprende de esos patrones.

Más para leer, en [docs/](docs/):
- [analisis_de_los_midis.md](docs/analisis_de_los_midis.md): cómo se analizó la base y qué hace el piano de verdad, medido en los MIDI.
- [guia_de_tumbaos.md](docs/guia_de_tumbaos.md): teoría y contexto (la clave, el tumbao, el bajo, la percusión, las marchas, la timba en la Cuba de los 90).
- [investigacion/](docs/investigacion/): lo que dicen músicos, libros y métodos sobre cada instrumento, con fuentes; de ahí salen las reglas del motor.

### Cómo se prueba que suena como los temas

[comparar.js](herramientas/comparar.js) recrea un pedazo de un tema con el motor (los mismos acordes, la misma clave y el mismo largo) y lo compara con el original, instrumento por instrumento y lado por lado de la clave: en qué semicorcheas ataca, densidad, fuerza de los golpes, textura y registro del piano, anticipos. Por ejemplo:

```
node herramientas/comparar.js 1165.mid 160 16 '{"marcha":"marcha","estilo":"salsa","semilla":3}'
```

[jurado_solo.js](herramientas/jurado_solo.js) juzga el solo de trompeta (ver arriba); con `--cancion` juzga los solos de una canción, sección por sección, y con `--ver` los muestra compás por compás.

[jurado.js](herramientas/jurado.js) hace lo mismo con varios temas de referencia («1165», «Pare cochero», «Ya empezó la fiesta») y revisa las reglas en todos los estilos y marchas. Los cambios musicales se juzgan así, contra los temas, no a gusto.

## Qué hay en el repo

```
index.html      la app entera, en un archivo
motor/          el motor: lee y analiza MIDI y genera piano, bajo, vientos y percusión (Node y navegador)
herramientas/   scripts de Node: armar la base, comparar con los temas, el jurado, exportar, visores
base/           la base de MIDIs ya analizada
midis/          los MIDI de referencia (no se suben) y los datos de cada uno
canciones/      las demos
sonidos/        GeneralUser GS, el .sf2 que toca la app
docs/           análisis de la base, teoría y las investigaciones detrás del motor
salidas/        lo que escriben las herramientas (no se sube)
```

**`index.html`** tiene la interfaz, el intérprete de LilyPond, el reproductor y la banda de samples, escritos ahí mismo. Entre las marcas `<!--motor-tumbaos-->` y `<!--/motor-tumbaos-->` lleva una copia del motor, de la base y de las demos, que mete `herramientas/construir.js`: eso no se edita a mano.

**`motor/`** corre igual en Node y en el navegador (todo cuelga de `globalThis.TumbaoMotor`; en Node se carga con `require('./motor')`). Va en orden:

| Archivo | Qué hace |
|---|---|
| `01_midi.js` | Lee y escribe MIDI |
| `02_analisis.js` | De un MIDI a una «fuente»: pulso, deriva, compás, lado de la clave, acordes y los ciclos de piano, bajo, percusión y vientos |
| `03_modelo.js` | Junta las fuentes elegidas en las tablas del generador |
| `04_generador.js` | Piano (las células), bajo y percusión de una sección, con sus perillas |
| `05_salida.js` | LilyPond (con la ortografía de cada acorde) y MIDI |
| `06_cancion.js` | La canción, sección por sección, con la costura entre secciones y los finales |
| `07_percusion.js` | Los patrones con nombre de cada instrumento de percusión |
| `08_vientos.js` | Los vientos: el modelo del corpus, los formatos de orquesta, la armonía y las formas del mambo |
| `09_piano.js` | Opus, Toontrack y la frase real |
| `10_solo.js` | La trompeta solista: las frases de la Weimar Jazz Database, el plan del solo, el encaje con la clave, el acomodo a los acordes y el jurado |

**`base/`**: `base_tumbaos.json` es lo que sale de analizar `midis/` (se sube: sin los MIDI no se puede volver a armar). `base_local.js` es lo de Toontrack: solo en esta compu; `index.html` lo carga si está. `base_solos.json` son los solos de la Weimar Jazz Database pasados a la grilla del motor (los arma `herramientas/solos_jazz.js` desde `midis/jazz/wjazzd.db`, que se baja de su página y no se sube); va al repositorio con la licencia de la base (ODbL).

**`midis/`**: `originales/` (de donde aprende el generador) y una carpeta por colección (`mididb/`, `mambos/`, `vientos2/`, `toontrack/`), cada una con su `fuentes.json`. Cómo sumar un MIDI y qué va en `fuentes.json`: [midis/README.md](midis/README.md).

**`canciones/`**: las demos, en el formato de «Exportar canción». Entran a la página las que tienen `orden`; la marcada `portada` es la que se abre la primera vez.

## Para tocar el código

Hace falta Node 18 o más nuevo, sin dependencias. Todo se corre desde la carpeta del proyecto.

- **Un cambio en el motor o en una demo:** se edita `motor/` o `canciones/` y se corre `node herramientas/construir.js --solo-html`, que copia el motor, la base y las demos en `index.html`.
- **Un MIDI nuevo, o un cambio en el análisis** (`motor/02_analisis.js`): `node herramientas/construir.js` vuelve a analizar todo (unos 20 segundos) y actualiza `base/` e `index.html`.
- **Un cambio musical:** se juzga con `comparar.js` y `jurado.js` contra los temas de referencia, antes y después.
- **Abierta como archivo**, la página no puede leer `sonidos/GeneralUser-GS.sf2`: carga `sonidos/GeneralUser-GS.sf2.js`, que escribe `construir.js` (no va al repositorio). En un servidor, o en GitHub Pages, lee el `.sf2` directo.

Las herramientas (los temas se nombran por su archivo: `1165.mid` se busca en `midis/originales/` y después en las colecciones):

```
node herramientas/construir.js                analiza los MIDI, actualiza base/ e index.html (y escribe sonidos/GeneralUser-GS.sf2.js)
node herramientas/construir.js --solo-html    mete en index.html el motor, la base que ya está y las demos, sin volver a analizar
node herramientas/comparar.js "tema.mid" desde cantidad [sección JSON]   recrea un pedazo de un tema y lo compara
node herramientas/jurado.js --solo piano      el piano de cada modo (Opus, Toontrack, frase real, células) en todos los estilos, al lado de los pianistas reales
node herramientas/jurado.js                   los temas recreados y las reglas (clave, anticipos, costura, cromáticas, registros, vientos, final) en todos los estilos y marchas, y los vientos medidos contra el corpus
node herramientas/patrones_corpus.js          los patrones de percusión y bajo del corpus, por lado de la clave
node herramientas/solos_jazz.js              los solos de la Weimar Jazz Database (midis/jazz/wjazzd.db) a base/base_solos.json
node herramientas/jurado_solo.js [--ver modo] [--cancion x.json [--ver]]   el jurado del solo de trompeta: los reales, cada modo y dos solistas tontos; o los solos de una canción
node herramientas/vientos_corpus.js           los vientos del corpus: dónde tocan, ritmo por lado, repetición, duración, armonía, anticipos, registro, las familias entre sí, los saltos de la línea y cómo crecen los mambos largos
node herramientas/exportar.js canciones/esto_recien_empieza.json salidas/portada.mid [--loop] [--muestrario]   la canción en .mid como «Bajar MIDI» (--muestrario: un coro por estilo)
node herramientas/probar_cancion.js [salidas/x.ly]   prueba las canciones: costuras, transiciones, estabilidad (y guarda la partitura)
node herramientas/probar_pagina.js            canción → intérprete de la página → lo que sonaría, el .mid y la costura del loop
node herramientas/probar_motor.js salidas/prueba    genera 36 tumbaos de prueba como MIDI, para pasarlos por el informe
node herramientas/informe.js [carpeta] [salida]     estadísticas del piano en el corpus (de entrada, midis/originales → salidas/informe.txt)
node herramientas/ver.js "tema.mid" [desde] [cantidad]          visor del piano compás por compás
node herramientas/ver_vientos.js "tema.mid" [desde] [cantidad]  visor de los vientos compás por compás
```

`herramientas/rutas.js` dice dónde está cada carpeta: si alguna se mueve, se cambia ahí.

## Sonidos y datos

- GeneralUser GS v2.0.3, S. Christian Collins.
- Banda de samples: percusión de mano de la Versilian Community Sample Library (VCSL), CC0; slap de conga, timbales, batería y bajo de GeneralUser GS; piano Salamander Grand Piano, Alexander Holm, CC-BY 3.0.
- Los solos de la trompeta solista salen de la Weimar Jazz Database v2.1 (Jazzomat Research Project, HfM Franz Liszt Weimar; Pfleiderer, Frieler, Abeßer, Zaddach y Burkhart, *Inside the Jazzomat*, 2017), con la licencia Open Data Commons Open Database License (ODbL) v1.0; `base/base_solos.json` es un derivado de esa base y va con la misma licencia.
