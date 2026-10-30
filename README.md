# timba-o-matic

Generador de tumbaos de timba y salsa: ponés los acordes y la página arma piano, bajo y percusión, los escribe en partitura (LilyPond) y los toca con una banda de samples. Es una sola página: se abre `index.html` en el navegador y listo.

## Cómo se usa

1. **Acordes.** Un acorde por compás, o dos con «½». Hay progresiones para cargar.
2. **Arreglo.** Algoritmo, onda (Pupy, Melón, Tirso, songo, salsa), marcha (cuerpo, coro, mambo, presión, despelote, muela) y clave. Con el algoritmo nuevo, cada columna trae sus perillas: densidad, octavas, bloques, semicorcheas, tensiones, cromatismo, registro, mano izquierda, anticipos, gancho, estilo del bajo, intensidad y mezcla de la percusión…
3. **Base de MIDIs.** De dónde aprende el algoritmo nuevo. Se pueden marcar o desmarcar temas y sumar MIDIs propios.
   - De entrada aprende de los 18 temas originales (y de los tuyos).
   - «Todos los MIDIs» suma además la colección de mididb.com: 104 temas más, casi todos de salsa (ver [§11 del análisis](Tumbaos_analisis_midis.md)).

«Generar y escuchar» lo toca en loop. «Copiar LilyPond» da la partitura, que compila tal cual en LilyPond 2.24.

En la barra de arriba:
- **Partitura** muestra la partitura y el código LilyPond. Está oculta de entrada.
- **Seguir** baja la página con el compás que suena.
- **Explicaciones** pone debajo de cada control qué hace. Además, cada control tiene su tooltip al pasar el mouse.

## Los dos algoritmos

- **Clásico:** reglas fijas por onda y marcha, escritas a partir de la bibliografía (Kevin Moore, Orlando Fiol).
- **Nuevo:** aprende de una base de MIDIs analizados.
  - Toma células reales de piano (ritmo y textura, lado 3 | lado 2 de la clave).
  - Pone anticipos con las probabilidades medidas.
  - Busca la línea de arriba nota por nota: función armónica, zigzag, enlace entre acordes y un gancho que se repite.
  - Arma bajo y percusión con lo aprendido.

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
```

El motor vive en `analisis_tumbaos/motor/`: MIDI, análisis, modelo, generador y salida. Corre igual en Node y en el navegador. `construir.js` lo copia dentro de `index.html` entre las marcas `<!--motor-tumbaos-->`, así que los cambios se hacen en `motor/` y no en la página.

## Sonidos

- Percusión de mano: Versilian Community Sample Library (VCSL), CC0.
- Slap de conga, timbales, batería y bajo: GeneralUser GS v2.0.3, S. Christian Collins.
- Piano: Salamander Grand Piano, Alexander Holm, CC-BY 3.0.
