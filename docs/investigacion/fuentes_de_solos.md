# Fuentes de solos de trompeta (y vientos) de son, salsa y timba

Búsqueda del 2026-11-03. Pregunta del dueño: ¿hay más partituras o MIDIs de solos de son, salsa y timba? Respuesta corta: **MIDIs con un solo de verdad casi no hay**; lo que sí hay es una tesis con siete solos de trompeta de son transcritos en pentagrama (PDF) y unos pocos MIDIs de karaoke que tienen un tramo de trompeta o sax que no es parte de la melodía.

## Qué se buscó

- **archive.org**: se bajó la lista de archivos de `karaokes-7959-midi-kar-collection` (7959 archivos, ya usada por el proyecto) y se analizaron todos con un detector de solos. Se buscó por título (`midi salsa`, `karaoke salsa`, `midis latinos`, `midi cuba`): no hay colecciones específicas de salsa. De las colecciones generales (`midi-collection_202407`, `song-galaxy-midi-collection`, `sgeos_midi_collection`, `MIDIs_202002`, `RARE-MIDIs`, `massive-midi-collection`) solo `song-galaxy-midi-collection` (38 667 MIDIs de karaoke, zip de 772 MB) tiene salsa y son: se filtraron 180 nombres latinos y se bajaron 60 de a uno (sin bajar el zip). Las demás son pop, videojuegos o clásica.
- **Webs de MIDIs** (midistimberos, bitmidi, freemidi, midiworld): la búsqueda web no devolvió descargas de salsa o timba; mididb ya estaba cargado en `midis/mididb/`. No se insistió.
- **Detector** sobre los 340 MIDIs que ya están en `midis/` (menos toontrack): ver «Ya estaban en el repositorio».
- **Transcripciones simbólicas** (MusicXML, MuseScore, ABC, kern, GitHub) de solos de salsa, son o timba: no apareció nada.
- **PDFs**: tesis y libros, ver más abajo.

## Qué se bajó

Carpeta `midis/solos_salsa/`: **27 archivos, 1,9 MB**, con su `fuentes.json`. Dos orígenes:

- `https://archive.org/download/song-galaxy-midi-collection/SongGalaxyMIDIArchive.zip/download%2F<archivo>` (karaokes con códigos IT/HM/ML/BS; los IT son de un productor italiano).
- `https://archive.org/download/karaokes-7959-midi-kar-collection/Karaokes_7959_MIDI_KAR_Collection.zip/Karaokes_7959_MIDI_KAR_Collection%2F<archivo>`.

Cómo se detectó: canal de trompeta (GM 56, 59), trombón (57) o sax (64-67), tramo de 4 compases o más, casi monofónico, al menos 3-4 notas por compás, sin repetirse en 1-2 compases, con los otros vientos casi callados. Después se descartaron los tramos cuyo dibujo melódico reaparece en otro lugar del tema (eso es melodía o riff, no solo). Los compases se cuentan desde el compás 1 del MIDI. **Ningún tramo se escuchó**: todo es automático y falta confirmarlo de oído, porque en un karaoke el canal «trompeta» puede llevar la melodía cantada.

Los 27 archivos; ninguno era duplicado exacto:

| Archivo | Tramo candidato | Confianza |
|---|---|---|
| Buena Vista Social Club - Pueblo Nuevo | trompeta, canal 4, c. 104-118 (15 compases, 7,7 notas por compás, no se repite) | la mejor |
| Buena Vista Social Club - Chan Chan | trompeta, canal 3, c. 55-63 | buena |
| Buena Vista Social Club - Dos gardenias | trompeta con sordina, canal 3, c. 40-47 | media |
| Willie Colon - Idilio | sax (GM 64), canal 4, c. 11-33 (23 compases, 11 dibujos distintos); trombón, canal 7, c. 4-8 y 37-44 | buena, pero Idilio es un bolero-salsa y el canal puede ser la voz |
| Celia Cruz y Jarabe de palo - A lo loco | sax alto, canal 4, c. 63-78 y 96-126 | media (puede ser la voz) |
| Las Chicas del Can - Juana la cubana | sax, canal 1, c. 22-30 y 53-61 | media |
| Cal Tjader - Soul Sauce | trompeta, canal 5, c. 73-78 y 94-98 | frases de 5-6 compases |
| Eddie Palmieri - Puerto Rico | trompeta, canal 4, c. 53-56, 61-64, 69-72 | frases de 4 compases, 8-11 notas por compás |
| Santana - Guajira | trombón, canal 7, c. 103-108 | corto |
| Mink DeVille - Demasiado corazón (salsa) | trompeta, canal 7, c. 47-52 | corto |
| Gilberto Santa Rosa - Qué manera de quererte | sax alto, canal 4, c. 84-89 | corto |
| Willie Colon - El gran varón | trompeta, canal 13, c. 110-113 y 208-211 | 13 notas por compás en el segundo |
| Bella María de mi corazón (Los reyes del mambo) | trompeta, canal 5, c. 90-93 | corto |
| Gloria Estefan - Always tomorrow / Corazón prohibido / Get on your feet / La parranda | sax o trompeta, tramos de 4-7 compases | corto, pop latino |
| Marc Anthony - Celos | sax, canal 7, c. 39-43, 55-59, 151-156 | corto |
| La Orquesta Mondragón - Chocolate y ron | sax alto, canal 6, c. 7-10, 77-80, 84-87 | corto |
| Buena Vista Social Club - El cuarto de Tula / Orgullecida | trompeta, tramos de 4-7 compases | corto, tal vez riff |
| Buena Vista Social Club - De Camino a La Vereda / El carretero; Havana Mambo - Rico cha cha chá; La India - Déjate amar; Marc Anthony - Vivir mi vida | **sin solo**: lo que parecía solo se repite en el tema | — |

Resumen honesto: tramos de 8 compases o más y sin repetirse hay solo cuatro o cinco (Pueblo Nuevo, Chan Chan, Idilio, A lo loco, Juana la cubana); el resto son frases de 4-6 compases. **No hay ningún solo de trompeta de salsa o timba completo (un coro de 16-32 compases) en estos MIDIs.** Sirven como ejemplos de cómo un secuenciador escribe la línea de un trompetista, pero no para entrenar un solo como el de Weimar.

### Ya estaban en el repositorio (no se copiaron)

El mismo detector, sobre `midis/`, marca tramos más largos que los de arriba:

- `originales/Estarde - Salsa.mid`: trompeta, canal 5, c. 76-89 (14 compases, 14 dibujos distintos). El mejor de todos.
- `originales/Yumbambe - Salsa.mid`: trombón, canal 7, c. 70-77.
- `originales/Ban con san - Salsa.mid` y `originales/Real latin jazz - Salsa.mid` (parecen la misma secuencia): trompeta, canal 5, c. 34-39 y 48-54; trombón, canal 11, c. 41-47.
- `originales/1026.mid`: trombón, canal 7, c. 77-80. `originales/Lloraras.mid`: trompeta, canal 3, c. 60-63.
- `mambos/Dave Sherriff - Red Hot Salsa.mid`: sax tenor, canal 4, c. 2-11.
- `vientos2/Willie Colon - Idilio.kar` (misma canción que la de arriba) y `vientos2/Buena Vista Social Club - Candela.mid` (canal 4 es un oboe, no se contó).

Recomendación: revisar primero `Estarde`, `Yumbambe` y `Pueblo Nuevo` de oído o en partitura.

## PDFs con transcripciones (solo listados; la notación de la primera es legible)

1. **Eric Ferguson, «Afro-Cuban Son Trumpet in the Septeto Period»** (tesis de maestría, Cal State LA, 2009, 91 páginas). `https://bluecupmusic.com/wp-content/uploads/2020/11/son-trumpet-in-the-septeto-period.pdf`. Siete solos de trompeta de son transcritos en pentagrama (notación vectorial de un programa de edición, legible; el texto del PDF no trae las notas), páginas impresas: *La Chambelona* (38), *Coralia* de Félix Chappottín (43), *Lamento esclavo* (54), *Criollo Haragán* (59), *Cómo voy a sufrir* (69), *Qué bonita es* (74), *Échale salsita* (79). Septeto Habanero y Septeto Nacional, años 20 y 30. Es lo más cercano a lo pedido: son tradicional, no salsa. © 2009 Eric Ferguson, todos los derechos reservados.
2. **David Felipe Ortega García, «Propuesta didáctica para la improvisación en el montuno tomando como referente al trompetista Alfredo "Chocolate" Armenteros»** (Universidad Pedagógica Nacional, Colombia, 2014). `https://repositorio.upn.edu.co/bitstreams/0b98155c-b7e5-4108-bc59-e89be8350040/download`. Solo frases sueltas de dos solos «Trompeta en montuno»: ilustración 11 (p. 79, solo 1, cita de *Summertime*) e ilustración 12 (p. 82, solo 2), con análisis en las tablas 23 y 24; más ejemplos de compases en los módulos de nivel 1 a 3. Pocos compases, no solos completos.
3. **Rick Davies, *Trompeta: Chappottín, Chocolate, and the Afro-Cuban Trumpet Style*** (Scarecrow Press, 2003). Libro, no es PDF libre. Según la reseña, incluye 46 páginas de solos de Chocolate Armenteros transcritos (Ferguson dice que las transcripciones de Davies son guías aproximadas en lo rítmico). Para buscar en biblioteca.
4. **Fabio Andrés García Corredor, «Análisis para la interpretación de cinco temas del trombonista cubano Juan Pablo Torres»** (Universidad Distrital, Colombia). `https://repository.udistrital.edu.co/items/1b0d3eb1-9777-4794-9795-e832a6546e57`. Cinco temas de trombón de timba/latin jazz; no se pudo abrir el PDF, así que no sé si trae solos en pentagrama ni en qué páginas.
5. **Tesis PUCP sobre timba: NG La Banda, «No se puede tapar el sol» vs. un grupo peruano** (sección de vientos). `https://repositorio.pucp.edu.pe/index/handle/123456789/179115`. Sin abrir; trae arreglo de vientos, no sabemos si solos.
6. Libros de pago, solo como pista: Gabriel Rosati, *Salsa Trumpet* (solos transcritos nota por nota); William Bay, *Salsa Trumpet* (eBook); Arturo Sandoval, *Trumpet Evolution* (19 solos transcritos, Hal Leonard).

Los PDFs de `repositorio.usfq.edu.ec` que devolvió el buscador (tesis ecuatorianas sobre trompeta/salsa) no se pudieron bajar (acceso denegado) y no se vieron.

## Fuentes simbólicas (MusicXML, MuseScore, ABC, kern)

Nada. No apareció ningún repositorio de GitHub, ni partitura de MuseScore de acceso libre, ni ABC o kern con solos de son, salsa o timba. `timba.com` tiene ejemplos MIDI incrustados en su enciclopedia (clave, bajo, conga de *El pirulero no vuelve más* de Arsenio), pero son fragmentos dentro de artículos, no archivos de solos. No se probó si se pueden bajar.

## Licencias y condiciones

- Los MIDIs vienen de ítems de archive.org sin licencia declarada. Son secuencias de karaoke de canciones con derechos de autor: sirven para estudio local; el `.gitignore` ya deja afuera `*.mid`, `*.kar`, así que no se suben al repositorio.
- La tesis de Ferguson dice «All rights reserved»; la de la UPN está en un repositorio institucional (condiciones no revisadas).

## Qué no se encontró

- Un solo MIDI de salsa o timba con un coro de trompeta de 16 compases o más que sea claramente un solo transcripto (ni Fania All-Stars, ni Sandoval, ni Irakere, ni NG La Banda, ni Van Van, ni Mirabal con solo). Los Van Van, Oscar D'León, El Gran Combo y Celia Cruz de los karaokes tienen vientos de arreglo, sin solo.
- Colecciones de archive.org dedicadas a salsa, son o timba.
- MusicXML, MuseScore, ABC o kern de ese repertorio.
- Un PDF libre con transcripciones de solos de salsa o timba (solo de son: Ferguson).
- Ayuda posible: transcribir de audio con una herramienta automática (tipo basic-pitch) los solos de *Quimbara*, *Pueblo Nuevo* o los que el dueño elija, y revisarlos a mano; o digitalizar los solos de Ferguson a MusicXML (7 solos, ya en pentagrama).
