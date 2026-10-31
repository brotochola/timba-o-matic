# timba-o-matic

Para armar maquetas de canciones de timba y salsa: ponés las secciones y sus acordes, y la página arma piano, bajo y percusión, los muestra como un multipista, los escribe en partitura (LilyPond) y los toca con GeneralUser GS. Es una sola página: se abre `index.html` en el navegador y listo.

## Cómo se usa

La app ocupa toda la ventana, a lo Ableton:
- **Arriba**, la barra: tocar y detener, compás y tiempo, tempo, clave, banda (timba con batería o salsa sin), loop (canción, sección o nada), «Seguir» y los paneles.
- **En el medio**, las pistas de la canción: cada bloque de color es una sección (el color dice la marcha) y cada fila un instrumento, con M, S y su volumen en esa sección.
- **Abajo**, la sección elegida en cinco bloques plegables: estructura, acordes, piano, bajo y percusión. El panel se achica o se agranda desde su borde de arriba y se oculta con ▾.
- **Encima**, cuando se abren: «Canción y sonido» y «Partitura» (con el código LilyPond y para abrir archivos .ly o .mid).
- Con **Seguir**, mientras suena, el panel de abajo muestra la sección que suena.

### La sección

Clic en una sección del multipista para editarla. Clic en una pista adentro de una sección: ese instrumento entra o sale ahí.

- **Estructura:** tipo (intro, cuerpo, coro, mambo, moña, presión, bomba, despelote, muela, bloque, final), **estilo**, marcha de la banda, **cambio de acorde**, compases, vueltas, cómo termina (abanico, cierre o corte), la variante de toda la sección (🎲 Todo) y qué instrumentos tocan.
- **Acordes:** uno por compás, o dos con «½».
- **Piano:** toca como (el estilo de la sección u otro), marcha propia, gancho, 🎲 otra variante solo del piano, y sus perillas («De dónde sale el piano»: generado nota por nota o frase real).
- **Bajo:** el sonido (eléctrico o baby bass, para toda la canción), 🎲 otra variante solo del bajo, y sus perillas («Qué toca»: según el estilo y la marcha, o un tumbao elegido).
- **Percusión:** marcha propia, cómo entra (directo, plato del timbalero en el 4& del último compás de antes o en el 1), 🎲 otra variante solo de la percusión, qué toca cada instrumento (congas, quinto, bongó, timbal, güiro, palitos, batería: según la marcha, un patrón con nombre o nada) y sus perillas.

**Estilos.** El estilo dice cómo toca toda la banda en la sección: el piano, el tumbao del bajo, la percusión de entrada y el cambio de acorde.

| Estilo | Piano | Bajo | Percusión | Cambio |
|---|---|---|---|---|
| Son montuno | octavas, la izquierda doblando | salsa (2& y 4) | una conga, bongó, sin timbal | bajo en el 4 |
| Mambo | más bloques | salsa | dos congas, campanas | bajo en el 4 |
| Charanga | notas sueltas, la izquierda a dos octavas | salsa | una conga y timbal (campana de chachá), sin bongó | bajo en el 4 |
| Salsa brava | octavas, la izquierda a dos octavas | salsa | dos congas, bongó y timbal, sin batería | bajo en el 4 |
| Salsa de los 90 | la izquierda a la décima, tensiones | salsa | como la salsa brava | bajo en el 4 |
| Songo (Van Van) | más aire, sostenido | songo | congas, guagua y batería de Changuito | en el 4& |
| Timba · Pupy | gancho, movimiento contrario, disminuidos | en motivo con el piano | tres congas, campanas, batería de timba | en el 4& |
| Timba · Melón | corridas, notas repetidas | timba | como Pupy | en el 4& |
| Timba · Tirso | 3+4, terceras, saltos | timbero | como Pupy | en el 4& |

En las marchas fuertes (presión, bomba, despelote, muela) el bajo toca lo de la marcha: nota pedal, deslizamientos, muela.

**Cambio de acorde** (de toda la sección, también hacia lo que sigue): en el 4& (piano y bajo traen el acorde nuevo en el 4& y lo ligan al 1, la timba), bajo en el 4 y piano en el 4& (la salsa), o en el 1 (sin anticipo). De entrada, el del estilo. En el multipista, ↱ marca cada cambio anticipado.

**El loop es un círculo:** lo que sigue a la última sección del loop es la primera (o la misma, si el loop es la sección). El final anticipa el principio (↺ en el multipista), lo ligado sigue sonando del otro lado y el 1 del principio suena solo al arrancar: una sección sola anticipada loopea sin costura.

**Perillas:** lo que se mueve queda en la sección elegida. En rojo, lo que la sección cambia respecto de su estilo; ↺ lo vuelve al estilo y «a todas» lo pasa a todas las secciones. M y S valen para toda la canción; el volumen de cada pista es de cada sección (moviéndolo con Shift, de todas).

### Canción y sonido

- El sonido de entrada es **GeneralUser GS**: se carga solo la primera vez que tocás. También están la banda de samples (3 MB), el sintetizador y un dispositivo MIDI externo.
- «★ Guardar canción» la guarda en el navegador; «Exportar canción» la baja como `.json` y «Importar canción…» la abre. Hay una de ejemplo: [canciones/la_guagua_de_las_tres.json](canciones/la_guagua_de_las_tres.json).
- **Bajar como** tema (con principio y final) o loop (el final anticipa el principio y el primer 1 no se repite, para pegarlo en el DAW sin costura):
  - **Bajar MIDI** (también el botón `.mid` de arriba): piano, bajo, una pista por instrumento de percusión y un marcador por sección.
  - **Bajar MP3**: la canción grabada con los sonidos elegidos y la mezcla. Se codifica en el navegador con [lamejs](https://github.com/zhuker/lamejs), que se baja la primera vez; sin internet sale en WAV.
- **Copiar LilyPond**: la partitura (con una marca por sección), que compila tal cual en LilyPond 2.24.

## Cómo genera

- **Piano:** aprende de una base de MIDIs analizados. Toma células reales (ritmo y textura, lado 3 | lado 2 de la clave) de los temas del estilo y del tipo de sección; busca la línea de arriba nota por nota (función armónica, zigzag, enlace entre acordes, un gancho que se repite) y la viste según el estilo. En la frase real toca la frase entera de un tema y le acomoda las notas a los acordes (la raíz a la raíz, la tercera a la tercera).
- **Bajo:** tumbaos escritos por rol (raíz, quinta, tercera, la raíz que viene) y medidos en el corpus: el de salsa (la quinta en el 2&, la raíz que viene en el 4), el de timba («Ya empezó la fiesta»: la misma nota en el 2& y el 3, la raíz o la tercera en el 4, la raíz que viene en el 4&), songo, timbero, motivo, pedal, notas largas, deslizamientos, muela.
- **Percusión:** patrones por instrumento con la fuerza de cada golpe ([motor/07_percusion.js](analisis_tumbaos/motor/07_percusion.js), cada uno dice de dónde sale): la cáscara, el campaneo, el contracampaneo y las patadas de timba del cuadro de Kevin Moore (Beyond Salsa Percussion vol. 3); el tumbao de conga con manoteo de Mauleón; el songo de Changuito (timba.com); el güiro, el martillo y la tumba del corpus. No hay maracas: el raspado es el güiro.

La canción se genera sección por sección, cada una con su semilla, y cada sección recibe la costura de la anterior: el lado de la clave, el acorde que viene, la última nota de la línea y del bajo, y la ligadura al 1. Las transiciones: el abanico es un golpe de borde en el 4, redoble y golpe de borde en el 1 de lo que viene, que entra en el 2; el cierre, toda la banda junta sobre la clave; el corte, golpe en el 1 y silencio.

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

**Toontrack.** `midis/toontrack/fuentes.json` apunta a `mg_tt-latcu/` (el paquete *Latin Cuban EZkeys MIDI*, convertido a MIDI): son montuno, mambo, salsa media (la salsa brava) y rápida, songo y funk cubano, 99 archivos con montuno. Los estilos prefieren los suyos (son montuno, mambo, salsa brava, salsa de los 90, songo) y cada tipo de sección aprende de las suyas (un coro de los coros, un mambo de los mambos).

## Para tocar el código

Hace falta Node 18 o más nuevo, sin dependencias.

```
node analisis_tumbaos/construir.js               analiza los MIDI y actualiza la base y index.html (y escribe GeneralUser-GS.sf2.js)
node analisis_tumbaos/construir.js --solo-html   mete en index.html el motor y la base que ya está, sin volver a analizar
node analisis_tumbaos/comparar.js "tema.mid" desde cantidad [sección JSON]   recrea un pedazo de un tema y lo compara
node analisis_tumbaos/patrones_corpus.js         los patrones de percusión y bajo del corpus, por lado de la clave
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
