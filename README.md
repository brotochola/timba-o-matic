# timba-o-matic

Para armar maquetas de canciones de timba y salsa: ponés las secciones y sus acordes, y la página arma piano, bajo, vientos y percusión, los muestra como un multipista, los escribe en partitura (LilyPond) y los toca con GeneralUser GS. Es una sola página: se abre `index.html` en el navegador y listo.

## Cómo se usa

La app ocupa toda la ventana, a lo Ableton:
- **Arriba**, la barra: tocar y detener, compás y tiempo, tempo, clave, banda (timba con batería o salsa sin), loop (canción, sección o nada), «Seguir», los paneles y ◐ (la página es oscura; ◐ pasa a clara y queda guardado).
- **En el medio**, las pistas de la canción: cada bloque de color es una sección (el color dice la marcha) y cada fila un instrumento, con M, S y su volumen en esa sección. Un clic en el nombre de una pista la pliega; percusión y vientos también se pliegan como grupo. La regla, las secciones y los acordes quedan fijos arriba al bajar por las pistas: se puede elegir otra sección desde cualquier altura. En cada unión entre dos secciones, una píldora dice dónde entra la que sigue (4&, 4 o 1) y se cambia ahí mismo.
- **Abajo**, la sección elegida en seis bloques plegables: estructura, acordes, piano, bajo, percusión y vientos. Cada bloque tiene una línea de ayuda (el texto entero, al pasar el mouse). El panel se achica o se agranda desde su borde de arriba y se oculta con ▾.
- **Encima**, cuando se abren: «Canción y sonido» y «Partitura» (con el código LilyPond y para abrir archivos .ly o .mid).
- Con **Seguir**, mientras suena, el panel de abajo muestra la sección que suena.

### La sección

Clic en una sección del multipista para editarla. Clic en una pista adentro de una sección: ese instrumento entra o sale ahí.

- **Estructura:** tipo (intro, cuerpo, coro, mambo, moña, presión, bomba, despelote, muela, bloque, final), **estilo**, marcha de la banda, **cambio de acorde** (adentro de la sección), compases, vueltas, **empieza** y **termina** (la unión con la sección de antes y con la que sigue, ver abajo), los golpes al final (ninguno; cierre sobre la clave, parada en clave, bloque de contratiempos, tres contra cuatro o un golpe, que caen donde entra la que sigue; o corte en el 1 y silencio), la variante de toda la sección (🎲 Todo) y qué instrumentos tocan.
- **Acordes:** uno por compás, o dos con «½».
- **Piano:** toca como (el estilo de la sección u otro), marcha propia, gancho, 🎲 otra variante solo del piano, y sus perillas («De dónde sale el piano»: generado nota por nota o frase real).
- **Bajo:** el sonido (eléctrico o baby bass, para toda la canción), 🎲 otra variante solo del bajo, y sus perillas («Qué toca»: según el estilo y la marcha, o un tumbao elegido).
- **Vientos:** el formato de toda la canción (conjunto de trompetas, Sonora Ponceña, Gran Combo, trombanga, Fania, orquesta grande, salsa de los 90, timba, 3 trombones, o sin vientos), qué tocan en la sección (bloques, respuestas, moña, mambo, fondo o nada), la armonía (unísono y octavas, terceras, bloque, cuartas o como el tema de la base), cómo entran (de a una familia o juntos) y 🎲 otra variante solo de los vientos. Sus perillas: forma del mambo (todos el mismo ritmo, pregunta y respuesta entre trompetas y trombones, contrapunto de dos riffs, champola de tres líneas que terminan juntas, entradas escalonadas), largo de la frase (una, dos o cuatro claves), repetición, densidad, registro, articulación, cromatismo, crescendo, trompeta al agudo, remate (golpe en el anticipo, contratiempos hasta el golpe o nota larga) y de qué temas aprende (salsa, cubano y timba, o todos). En el multipista, Trompetas, Trombones y Saxos con M, S y volumen.
- **Percusión:** marcha propia, el plato del timbalero al empezar (con la entrada de la sección o en el 1), el relleno del último compás cuando la banda sigue derecho (abanico, redoble de timbal, floreo del quinto o toms de la batería), 🎲 otra variante solo de la percusión, qué toca cada instrumento (congas, quinto, bongó, timbal, güiro, palitos, batería: según la marcha, un patrón con nombre o nada) y sus perillas.

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
- **Demos:** canciones armadas con la app (timba con presión y despelote, salsa brava, son montuno…), para escuchar y tocar sus perillas. Son las de [canciones/](canciones/): `construir.js` las mete en la página, en el orden de su campo `orden`.
- «★ Guardar canción» la guarda en el navegador; «Exportar canción» la baja como `.json` (el mismo formato de las demos) y «Importar canción…» la abre.
- **Bajar como** tema (con principio y final) o loop (el final anticipa el principio y el primer 1 no se repite, para pegarlo en el DAW sin costura):
  - **Bajar MIDI** (también el botón `.mid` de arriba): piano, bajo, trompetas, trombones, saxos, una pista por instrumento de percusión y un marcador por sección.
  - **Bajar MP3**: la canción grabada con los sonidos elegidos y la mezcla. Se codifica en el navegador con [lamejs](https://github.com/zhuker/lamejs), que se baja la primera vez; sin internet sale en WAV.
- **Copiar LilyPond**: la partitura (con una marca por sección), que compila tal cual en LilyPond 2.24.

## Cómo genera

- **Piano:** aprende de una base de MIDIs analizados. Toma células reales (ritmo y textura, lado 3 | lado 2 de la clave) de los temas del estilo y del tipo de sección; busca la línea de arriba nota por nota (función armónica, zigzag, enlace entre acordes, un gancho que se repite) y la viste según el estilo. En la frase real toca la frase entera de un tema y le acomoda las notas a los acordes (la raíz a la raíz, la tercera a la tercera).
- **Bajo:** tumbaos escritos por rol (raíz, quinta, tercera, la raíz que viene) y medidos en el corpus: el de salsa (la quinta en el 2&, la raíz que viene en el 4), el de timba («Ya empezó la fiesta»: la misma nota en el 2& y el 3, la raíz o la tercera en el 4, la raíz que viene en el 4&), songo, timbero, motivo, pedal, notas largas, deslizamientos, muela.
- **Vientos:** [motor/08_vientos.js](analisis_tumbaos/motor/08_vientos.js) aprende de los ciclos de vientos de todos los temas de la base (los propios, mididb y la colección de mambos) y los clasifica: moña (un riff que se repite), mambo (una línea que cambia), respuesta (corta, en los huecos del cantante) y fondo (notas largas). La sección toca los riffs de un tema acomodados a tus acordes, con cada golpe en unísono o armonizado como en el original; los bloques son golpes con la banda en los anticipos y al final (siempre con la nota de arriba del acorde). La línea es la del instrumento que lleva el riff en el tema; las notas del acorde van a la misma función del acorde nuevo y las de paso, como aproximación a la nota del acorde a la que van. La octava se elige por frase, no nota por nota, así la línea no se rompe; en el contrapunto la trompeta queda arriba. Con crescendo, en el último tercio el mambo trae material nuevo y sube. Las notas de paso van como aproximación a la nota del acorde y se armonizan en paralelo con ella; las de paso rápidas (semicorcheas) van al unísono, y ninguna voz baja de donde su intervalo embarra (reglas de big band: Absil, Rogers, Hoffmann). Con la trompeta arriba del Fa5, una voz la dobla una octava abajo. La armonía **trombanga** (la de la salsa brava) es la de Willie Colón: el riff de los dos trombones al unísono, en registro grave, y una frase de cada dos se abre en terceras y termina raspando en una segunda. Con la orquesta grande, el contrapunto es de metales contra saxos, y la moña en capas entra como las capas de Machito: el guajeo de los trombones, las respuestas de los saxos y la contramelodía de las trompetas. En la timba los metales callan en los coros y tocan el mambo después. Los temas de otros géneros de la base (merengue, cumbia, pop) casi no entran en la salsa y la timba, y los boleros, poco. La investigación (entrevistas y textos de arregladores y vientistas de salsa y timba) está resumida en los comentarios del módulo.

  Medido en el corpus (`vientos_corpus.js`, 90 temas con la clave tocada) y en lo que sale (`jurado.js`, con el mismo modelo de vientos que la página):

  | | Corpus | La app |
  |---|---|---|
  | notas cortas | 65% | 77% |
  | golpes en unísono u octavas | 52% | 68% |
  | la de arriba de la trompeta, por grado / repite / más de una quinta | 40% / 21% / 7% | 33% / 19% / 11% |
  | sección de mambo larga: la nota más aguda de cada compás, del primer tercio al último | +2 semitonos (de Do5 a Re5) | +2 |
  | la de arriba de la trompeta en el mambo, mediana | Si4 | Do#5 |
  | trompetas y trombones en el mismo ritmo / alternando por compás | 33% / 2% | forma «bloque» por defecto |

- **Percusión:** patrones por instrumento con la fuerza de cada golpe ([motor/07_percusion.js](analisis_tumbaos/motor/07_percusion.js), cada uno dice de dónde sale): la cáscara, el campaneo, el contracampaneo y las patadas de timba del cuadro de Kevin Moore (Beyond Salsa Percussion vol. 3); el tumbao de conga con manoteo de Mauleón; el songo de Changuito (timba.com); el güiro, el martillo y la tumba del corpus. No hay maracas: el raspado es el güiro. Las dos campanas suenan distinto (investigación sobre la campana: Moore anota dos timbres por campana): la del bongó es la más grave y la del timbal más aguda, y cada una tiene su boca abierta y su talón seco y brillante; el contracampaneo va abierto en los tiempos y en talón en los contratiempos.

La canción se genera sección por sección, cada una con su semilla, y cada sección recibe la costura de la anterior: el lado de la clave, el acorde que viene, la última nota de la línea y del bajo, y la ligadura al 1. Los finales de sección: los golpes (cierre, parada, contratiempos, tres contra cuatro, un golpe) los tocan piano, bajo, vientos y percusión juntos y caen donde entra la sección que sigue: en el 4& o el 4, el golpe de la llegada ya trae el acorde que viene, ligado al 1; si la que sigue entra en el 1, el último golpe es del acorde de ahora y la banda cae junta en el 1. El tres contra cuatro cuenta de a tres semicorcheas hacia atrás desde la llegada. La parada en clave no anticipa: calla. El corte es golpe en el 1 y silencio. Si la banda sigue derecho, la percusión puede hacer un relleno en el último compás: abanico (redoble de timbal en el 4 y golpe de borde y plato en el 1 que viene), redoble, floreo del quinto o toms.

Cómo se analizó la base y qué hace el piano de verdad: [Tumbaos_analisis_midis.md](Tumbaos_analisis_midis.md). Teoría y contexto: [Tumbaos_de_timba_guia.md](Tumbaos_de_timba_guia.md).

### Cómo se prueba que suena como los temas

[comparar.js](analisis_tumbaos/comparar.js) recrea un pedazo de un tema con el motor (los mismos acordes, la misma clave y el mismo largo) y lo compara con el original, instrumento por instrumento y lado por lado de la clave: en qué semicorcheas ataca, densidad, fuerza de los golpes, textura y registro del piano, anticipos. Por ejemplo:

```
node analisis_tumbaos/comparar.js 1165.mid 160 16 '{"marcha":"marcha","estilo":"salsa","semilla":3}'
```

## La base de MIDIs

La base no se arma desde la página: los MIDIs (`.mid` y `.kar`) van a la carpeta del proyecto o a `midis/`, y `node analisis_tumbaos/construir.js` los analiza y mete la base en `index.html`. Los datos de cada archivo (título, estilo, clave, acordes…) van en `analisis_tumbaos/fuentes.json`. Los `.mid` no se suben al repositorio (ver `.gitignore`); sube la base ya analizada.

**Para grabar MIDIs que sirvan:** con click, en 4/4, que el compás 1 sea el comienzo de la clave; alcanza con un instrumento; la percusión en el canal 10 con el mapa General MIDI (conga 62/63/64, bongó 60/61, campana 56, timbal 65/66, güiro 73/74).

### Colecciones

Cada carpeta dentro de `midis/` es una colección; por ejemplo, `midis/mididb/`.
- Lleva su propio `fuentes.json` con los datos de cada archivo; `_titulo` es su nombre.
- Entra a la base pero el generador no aprende de ella, salvo que diga `_encendida`.
- El perfil de la clave (con qué se adivina el lado en los temas sin clave) se aprende solo de los originales.
- `_local`: material comprado. Su base va a `analisis_tumbaos/base_local.js`, que no se sube al repositorio; `index.html` la carga si está.
- `_carpeta`: los `.mid` están en otra carpeta, con subcarpetas. `_grupos` dice el estilo de cada subcarpeta y `_secciones` el tipo de sección según cómo empieza el nombre del archivo.

**Toontrack.** `midis/toontrack/fuentes.json` apunta a `mg_tt-latcu/` (el paquete *Latin Cuban EZkeys MIDI*, convertido a MIDI): son montuno, mambo, salsa media (la salsa brava) y rápida, songo y funk cubano, 99 archivos con montuno. Los estilos prefieren los suyos (son montuno, salsa brava, salsa de los 90, songo; la carpeta del mambo de los 50 no se usa) y cada tipo de sección aprende de las suyas (un coro de los coros, un mambo de los mambos).

## Para tocar el código

Hace falta Node 18 o más nuevo, sin dependencias.

```
node analisis_tumbaos/construir.js               analiza los MIDI y actualiza la base y index.html (y escribe GeneralUser-GS.sf2.js)
node analisis_tumbaos/construir.js --solo-html   mete en index.html el motor y la base que ya está, sin volver a analizar
node analisis_tumbaos/comparar.js "tema.mid" desde cantidad [sección JSON]   recrea un pedazo de un tema y lo compara
node analisis_tumbaos/patrones_corpus.js         los patrones de percusión y bajo del corpus, por lado de la clave
node analisis_tumbaos/vientos_corpus.js          los vientos del corpus: dónde tocan, ritmo por lado, repetición, duración, armonía, anticipos, registro, las familias entre sí, los saltos de la línea y cómo crecen los mambos largos
node analisis_tumbaos/ver_vientos.js "tema.mid"  visor de los vientos compás por compás
node analisis_tumbaos/jurado.js                  los temas recreados y las reglas (clave, anticipos, costura, cromáticas, registros, vientos, final) en todos los estilos y marchas, y los vientos medidos contra el corpus
node analisis_tumbaos/exportar.js cancion.json salida.mid [--loop] [--muestrario]   la canción en .mid como «Bajar MIDI» (--muestrario: un coro por estilo)
node analisis_tumbaos/informe.js                 estadísticas del corpus (informe.txt)
node analisis_tumbaos/ver.js "tema.mid"          visor compás por compás
node analisis_tumbaos/probar_cancion.js          prueba las canciones: costuras, transiciones, estabilidad (x.ly guarda la partitura)
node analisis_tumbaos/probar_pagina.js           canción → intérprete de la página → lo que sonaría, el .mid y la costura del loop
```

El motor vive en `analisis_tumbaos/motor/`: MIDI, análisis, modelo, generador, salida, canción y percusión. Corre igual en Node y en el navegador. `construir.js` lo copia dentro de `index.html` entre las marcas `<!--motor-tumbaos-->`, así que los cambios se hacen en `motor/` y no en la página.

Abierta como archivo, la página no puede leer `GeneralUser-GS.sf2`: carga `GeneralUser-GS.sf2.js`, que escribe `construir.js` (no va al repositorio). En un servidor lee el `.sf2` directo.

## Sonidos

- GeneralUser GS v2.0.3, S. Christian Collins.
- Banda de samples: percusión de mano de la Versilian Community Sample Library (VCSL), CC0; slap de conga, timbales, batería y bajo de GeneralUser GS; piano Salamander Grand Piano, Alexander Holm, CC-BY 3.0.
