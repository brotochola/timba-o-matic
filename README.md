# timba-o-matic

Para armar maquetas de canciones de timba y salsa: ponés las secciones y sus acordes, y la página arma piano, bajo y percusión, los muestra como un multipista, los escribe en partitura (LilyPond) y los toca con una banda de samples. Es una sola página: se abre `index.html` en el navegador y listo.

## Cómo se usa

La app ocupa toda la ventana, a lo Ableton:
- **Arriba**, la barra: tocar y detener, compás y tiempo, tempo, clave, banda (timba con batería o salsa sin), loop (canción o sección), «Seguir» y los paneles.
- **En el medio**, las pistas de la canción: cada bloque de color es una sección (el color dice la marcha) y cada fila un instrumento, con M, S y su volumen en esa sección.
- **Abajo**, la sección elegida en cinco bloques plegables: estructura, acordes, piano, bajo y percusión. El panel se achica o se agranda desde su borde de arriba y se oculta con ▾.
- **Encima**, cuando se abren: «Canción y sonido», «Base de MIDIs» y «Partitura» (con el código LilyPond y para abrir archivos .ly o .mid).
- Con **Seguir**, mientras suena, el panel de abajo muestra la sección que suena: se ven cambiar sus perillas y volúmenes.

1. **Canción.** Arriba, el multipista: la regla (con el lado 3 de la clave sombreado), las secciones, los acordes y una pista por instrumento (piano, bajo, clave, congas, bongó, campana, timbales, güiro, batería).
   - Clic en una sección para editarla: tipo (intro, cuerpo, coro, mambo, moña, presión, despelote, muela, bloque, final), marcha, onda del piano, compases, vueltas, cómo entra (directo o con el plato del timbalero), cómo termina (abanico, cierre o corte), gancho, variante, sus acordes (uno por compás, o dos con «½») y cómo toca la banda: las perillas de piano, bajo y percusión de esa sección.
   - Clic en una pista adentro de una sección: ese instrumento entra o sale ahí.
   - M y S valen para toda la canción; el volumen de cada pista es de cada sección (o de todas, si las perillas valen para toda la canción). Todo se aplica al tocar, sin cambiar las notas.
   - Loop de toda la canción o de la sección que estás editando.
   - Cada sección tiene su variante: cambiar una no cambia las otras. «Fijar» la deja como está aunque cambies las perillas de la canción.
   - Las perillas (densidad, octavas, bloques, semicorcheas, tensiones, cromatismo, registro, mano izquierda, anticipos, gancho, estilo del bajo, intensidad y mezcla de la percusión…) valen para esa sección o, si se elige, para toda la canción.
   - El bajo puede tocar su tumbao (aprendido, de salsa, timbero, songo, en motivo con el piano), una nota pedal grave y larga (la presión), notas largas que cambian cada dos compases (el «pedal» de Kevin Moore) o deslizamientos por la cuerda grave con golpes cortos (Feliciano Arango; el despelote).
2. **Canción y sonido** (panel): timbre del bajo, el sonido, generar, guardar y exportar.
3. **Base de MIDIs.** De dónde aprende el generador. Se pueden marcar o desmarcar temas y sumar MIDIs propios.
   - De entrada aprende de los 18 temas originales (y de los tuyos).
   - «Todos los MIDIs» suma además la colección de mididb.com: 104 temas más, casi todos de salsa (ver [§11 del análisis](Tumbaos_analisis_midis.md)).

«Generar y escuchar» arma la canción y la toca. «★ Guardar canción» la guarda en el navegador; «Exportar canción» la baja como `.json` para abrirla en otro lado.
- **Bajar MIDI** (también el botón `.mid` de arriba): para el DAW, con piano, bajo, una pista por instrumento de percusión y un marcador por sección.
- **Bajar MP3**: la canción grabada con los sonidos elegidos y la mezcla de las pistas. Se arma sin tocarla en tiempo real (unos segundos) y se codifica en el navegador con [lamejs](https://github.com/zhuker/lamejs), que se baja la primera vez; sin internet sale en WAV. Con un dispositivo MIDI externo no se puede grabar.
- **Copiar LilyPond**: la partitura (con una marca por sección), que compila tal cual en LilyPond 2.24.

En la barra de arriba:
- **Partitura** muestra la partitura y el código LilyPond. Está oculta de entrada.
- **Seguir** baja la página con el compás que suena.
- **Explicaciones** pone debajo de cada control qué hace. Además, cada control tiene su tooltip al pasar el mouse.

## Cómo genera

Aprende de una base de MIDIs analizados.
- Toma células reales de piano (ritmo y textura, lado 3 | lado 2 de la clave).
- Pone anticipos con las probabilidades medidas.
- Busca la línea de arriba nota por nota: función armónica, zigzag, enlace entre acordes y un gancho que se repite.
- Arma bajo y percusión con lo aprendido. En las marchas sin juegos aprendidos (presión, despelote, muela) la percusión sale de reglas escritas a partir de la bibliografía (Kevin Moore, Orlando Fiol). No hay maracas: el raspado es el güiro.

La canción se genera sección por sección, cada una con su semilla, y cada sección recibe la costura de la anterior: el lado de la clave, el acorde que viene (para el anticipo del 4& y el bajo), la última nota de la línea y del bajo, y la ligadura al 1. Las transiciones: el abanico es un golpe de borde en el 4, redoble y golpe de borde en el 1 de lo que viene, que entra en el 2; el cierre, toda la banda junta sobre la clave; el corte, golpe en el 1 y silencio.

Cómo se analizó la base y qué hace el piano de verdad: [Tumbaos_analisis_midis.md](Tumbaos_analisis_midis.md). Teoría y contexto: [Tumbaos_de_timba_guia.md](Tumbaos_de_timba_guia.md).

## Sumar MIDIs a la base

Si tocás piano, bajo o percusión, tus grabaciones mejoran el algoritmo, sobre todo si son de timba.

**Cómo grabar:**
- Con click, en 4/4, y que el compás 1 del MIDI sea el comienzo de la clave.
- Alcanza con un solo instrumento.
- La percusión va en el canal 10 con el mapa General MIDI: conga 62/63/64, bongó 60/61, campana 56, timbal 65/66, güiro 73/74.

**En la página:**
1. En «3 Base de MIDIs», «Agregar MIDIs…» (o arrastrá los archivos).
2. En la fila de cada uno, elegí la clave (por ejemplo «son 2-3»), el rol y, si querés, los acordes.
3. Queda guardado en ese navegador y se usa al toque.

**Para que entre al repositorio:**
1. «Exportar los míos» baja un `.json`.
2. Con ese archivo:

   ```
   node analisis_tumbaos/construir.js --importar mis-midis-tumbaos.json
   ```

   Copia los MIDI a `midis/`, guarda sus datos en `analisis_tumbaos/fuentes.json`, vuelve a analizar todo y actualiza `index.html`.

Los `.mid` no se suben al repositorio (ver `.gitignore`); sube la base ya analizada.

### Colecciones

Cada carpeta dentro de `midis/` es una colección; por ejemplo, `midis/mididb/`.
- Lleva su propio `fuentes.json` con los datos de cada archivo; `_titulo` es el nombre que muestra la página.
- Entra a la base, pero la página la deja apagada. Se prende con «todos los MIDIs» o con la casilla de la colección.
- El perfil de la clave (con qué se adivina el lado en los temas sin clave) se aprende solo de los originales.
- Los archivos que no dejan nada usable (ni piano, ni bajo, ni percusión) quedan afuera.

## Para tocar el código

Hace falta Node 18 o más nuevo, sin dependencias.

```
node analisis_tumbaos/construir.js          analiza los MIDI (carpeta del proyecto, midis/ y sus colecciones) y actualiza la base y index.html
node analisis_tumbaos/informe.js            estadísticas del corpus (informe.txt)
node analisis_tumbaos/ver.js "tema.mid"     visor compás por compás
node analisis_tumbaos/probar_motor.js out   genera tumbaos de prueba para compararlos con el corpus (--todo: con las colecciones)
node analisis_tumbaos/probar_cancion.js     prueba las canciones: costuras, transiciones, estabilidad (x.ly guarda la partitura)
node analisis_tumbaos/probar_pagina.js      canción → intérprete de la página → lo que sonaría y el .mid
```

El motor vive en `analisis_tumbaos/motor/`: MIDI, análisis, modelo, generador, salida y canción. Corre igual en Node y en el navegador. `construir.js` lo copia dentro de `index.html` entre las marcas `<!--motor-tumbaos-->`, así que los cambios se hacen en `motor/` y no en la página.

## Sonidos

- Percusión de mano: Versilian Community Sample Library (VCSL), CC0.
- Slap de conga, timbales, batería y bajo: GeneralUser GS v2.0.3, S. Christian Collins.
- Piano: Salamander Grand Piano, Alexander Holm, CC-BY 3.0.
