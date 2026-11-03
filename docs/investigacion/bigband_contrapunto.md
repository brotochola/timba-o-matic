# Oficio de arreglo para vientos: big band, big band latina y contrapunto de secciones

Fecha de la investigación: 2026-10-31. Idioma: español. Las citas entre comillas en español son **traducción mía** del original (casi siempre inglés); las que dejé en inglés son literales. Todas las alturas están en **sonido real (concert pitch)** salvo que diga "escrito". Número MIDI con do central = C4 = 60.

Complementa `vientos_salsa.md` e `vientos_timba.md` (misma carpeta): aquellos cubren la práctica salsera; este cubre el oficio de big band que la app todavía no tiene (voicing, conducción de voces, contrapunto, clímax, rangos, big bands latinas).

---

## Resumen ejecutivo

1. **Voicing base**: cerrado de 4 voces colgado bajo la melodía (exteriores 6.ª o 7.ª); **drop 2** cuando el rango o la claridad lo piden; 5 saxos = cerrado/drop 2 con **sólo la melodía duplicada** una octava abajo; abiertos (drop 2+4, drop 3) raros; spreads sin duplicar para colchones (secc. 1).
2. **Intervalos graves**: tabla de Hoffmann (decodificada) + "debajo de D3 sólo octavas, quintas y décimas" + 3.ª del acorde ≥ C3 y 7.ª ≥ Eb3 (1.3, R05-R07).
3. **Tutti**: trombones superpuestos a las trompetas (Tbn1 = Tpt3, Tbn2 = Tpt4), AS1 = Tpt2, BS = Tbn4 (Absil), o trombones una octava abajo; líder de trompeta ≥ F5 (77) exige doblaje una octava abajo (1.4, R15-R16).
4. **Armonizar**: objetivos primero y aproximaciones hacia atrás con cinco métodos (cromático, diatónico, dominante, disminuido, paralelo); ornamentos de semicorchea no se armonizan (secc. 2, R19-R24).
5. **Conducción**: nada de notas repetidas en voces internas, ni 2.ª menor arriba, ni relación cruzada de novena menor; conservar notas comunes; el movimiento paralelo es válido en bloque (secc. 3, R25-R26).
6. **Contrapunto**: tope de ~3 capas (hasta 4-5 elementos sólo con timbres distintos y ataques complementarios); fondos más quietos que el solista (secc. 4, R27-R32).
7. **Shout/clímax**: alrededor de 2/3 a 90% de la forma, tensión rítmica, voicing percusivo; el **mambo es un shout en bucles** hecho de capas clave-alineadas (secc. 5, R33-R35).
8. **Rangos y sweet spot**: tabla por instrumento en MIDI (secc. 6, R01-R04).
9. **Machito/Bauzá**: sección de 5 saxos "gruesa", capas trombón-guajeo → saxos-respuesta corta → trompeta-contramelodía, "contrapunto de claves"; no hay análisis de intervalos accesible (secc. 7).
10. Faltan los libros de texto pedidos (sólo fichas); ver secc. 10.

---

## 0. Cómo leer este archivo

**Marcas.** **[F]** = lo dice la fuente que leí (texto, o figura que decodifiqué y lo aclaro). **[I]** = inferido por mí (combinación de fuentes, aritmética o criterio de diseño). **[S]** = fuente débil (foro, aficionado, resumen de buscador). "**no encontrado**" = no apareció en nada accesible.

**Honestidad sobre las fuentes.**

- Los libros que pedías (Lowell y Pullig, Nestico, Sebesky, Wright, Mancini, Dobbins, Pease) **no pude leerlos**: sólo hay fichas de catálogo y contraportadas. No cito ninguna regla "de Nestico" o "de Lowell" como si la hubiera leído. Lo que sí hay en línea y es sustancioso: el libro de **Absil** (demo gratuita de 248 pp., con huecos), el avance del libro de **Herborn** (Alfred), dos hojas de repaso de **UNT** (examen de arreglo), la serie del orquestador **Evan Rogers**, la tesis-exposición de **van der Lei**, y las **notas de ensayo de Bobby Sanabria** para las transcripciones de Machito del Jazz at Lincoln Center.
- La cuota de búsquedas web de la sesión (200) se agotó antes de cerrar tres huecos: "guide-tone lines" como fondo, el término "pyramid" para fondos, y técnica de Tito Rodríguez/Puente. Los marco "no encontrado" más abajo.
- Páginas bloqueadas o ilegibles: tesis de Miller sobre Bauzá (Missouri), tesis de Thad Jones (UNCO, 403), Sweetwater (403), Gearspace (403), Schott y varias fichas de ejazzlines.
- Absil es una **demo**: sus secciones de saxos y metales de la parte 2.3 están en blanco y varias páginas de ejemplos también. Lo que cito de él está en el texto visible.

### Fuentes (claves usadas en todo el archivo)

| Clave | Fuente | URL | Qué leí |
|---|---|---|---|
| ABS | Frans Absil, *Arranging by Examples: the Practical Guide to Jazz and Pop Orchestra Arranging*, 3.ª ed. (demo gratuita del autor) | https://fransabsil.nl/archpdf/arrbook.pdf | cap. 3, 4, 5, 6.1-6.8 y 11.1-11.2 (texto); ejemplos en notación no legibles por texto |
| HER | Peter Herborn, *Jazz Arranging / Jazz Arrangement* (Advance Music/Alfred, 2010, bilingüe; avance) | https://content.alfred.com/catpages/01-ADV11301.pdf | pp. 14, 21, 25 (rangos), 38-60 (armonización en bloque), 169-172 (backgrounds, interludios, clímax) |
| UNT3 | UNT Jazz Studies, "ACE Review 3: Saxes and Density" | https://music.unt.edu/sites/default/files/ace_review_3-saxes_and_density.pdf | completo (6 pp.) |
| UNT4 | UNT, "ACE Review 4: Scoring Brass" (General Guidelines for Voicing the Brass Section) | https://music.unt.edu/sites/default/files/ace_review_4-scoring_brass.pdf | completo (5 pp., casi todo notación; el texto está en cuadros) |
| ROG | Evan Rogers (orquestador), serie "Big Band Arranging": Getting Started, Instrumentation, Voicings 1 y 2, Unisons & Octaves, Soli Writing, Open Voicings, Shout Chorus, Solos & Backgrounds | https://www.evanrogersmusic.com/blog-contents/big-band-arranging/ + `getting-started`, `instrumentation`, `voicings-part1`, `voicings-part2`, `unisons-and-octaves`, `soli-writing`, `open-voicings`, `the-shout-chorus`, `solos-and-backgrounds` | todas, completas; las figuras de rangos las descargué y las leí a ojo |
| VDL | Marit Eline van der Lei, *The instrumental section singer* (2020), Research Catalogue, parte 2 "Voicings" | https://researchcatalogue.net/view/527091/728669 | texto |
| HOF | Robin Hoffmann, "Low Interval Limits" (Daily Film Scoring Bits) | https://www.robin-hoffmann.com/dfsb/low-interval-limits | la tabla es una imagen; la **decodifiqué yo** (ver 1.3) |
| BUS | scoredchanges.com: "Big Band Writing" (autor sin nombre; dice "no soy un experto", unas 200 charts propias), "Planning an arrangement" y "Arranging" (hojas de consejos) | https://www.scoredchanges.com/ensemblewriting.htm ; https://www.scoredchanges.com/how-to/planninganarrangement.pdf ; https://www.scoredchanges.com/how-to/arranging.pdf | completas. **[S]**: aficionado, útil como lista de convenciones |
| JAL | Jazz at Lincoln Center, *Essentially Ellington* 2022-23, transcripciones de Machito and His Afro-Cubans (álbum *Kenya*, 1957), notas de ensayo de Bobby Sanabria: *Oyeme*, *Congo Mulence*, *Blues a la Machito*, *Kenya* | https://www.ejazzlines.com/wp-files/2/jlc5126.pdf ; .../jlc5122.pdf ; .../jlc5120.pdf ; .../jlc5125.pdf | notas de ensayo completas; de las partituras sólo 1-3 páginas de avance (no las analicé) |
| SAN | Ray Santos, entrevista de Marc Myers (JazzWax, 2009), partes 1 y 2 | https://news.allaboutjazz.com/interview-ray-santos-part-1.php ; .../interview-ray-santos-part-2.php | completas |
| SIE | Siedenburg, Goldmann y van de Par (2021), *Frontiers in Psychology* (resume Huron 1989/2016 y mide el efecto del timbre) | https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.608684/full | texto |
| FER | Eric Ferguson, tesis de maestría sobre trompeta de son (Cal State LA) | https://bluecupmusic.com/wp-content/uploads/2020/11/son-trumpet-in-the-septeto-period.pdf | pp. 49-50 (copia local ya extraída) |
| LOP | Victor López, glosario, Midwest Clinic 2005 | https://www.midwestclinic.org/user_files_1/pdfs/clinicianmaterials/2005/victor_lopez.pdf | glosario y consejos de clave (copia local ya extraída) |
| CAP | Capilano University, JAZZ 172 Arranging I (temario) | https://www.CapilanoU.ca/media/capilanouca/programs-amp-courses/course-outlines/pdfs/JAZZ-172-2016-04-05.pdf | temario (evidencia de lo que se enseña como estándar) |
| WK | Wikipedia: Shout chorus, Mambo section, Mambo (music), Machito, Mario Bauzá, Chico O'Farrill, Trombone, Trumpet, Saxophone | https://en.wikipedia.org/wiki/... | páginas citadas; ojo, varias sin referencias en línea |
| ECU | EcuRed, René Hernández | https://www.ecured.cu/René_Hernández | completa |
| EBS | EBSCO Research Starters, Tito Puente | https://ebsco.com/research-starters/biography/tito-puente | completa |
| MWI | MusicWeb, reseña de Machito (*Mambo*) | https://www.musicweb-international.com/jazz/2002/Aug02/Machito_Mambo.htm | completa |
| CER | "A Look at the Music of Chico O'Farrill" (Substack "cerra"; cita liner notes de Blumenthal, Cook, Sublette) | https://cerra.substack.com/p/a-look-at-the-music-of-chico-ofarrill | completa; **[S]** |

---

## 1. Técnicas de voicing para metales y saxos

### 1.1 Catálogo: qué es, cuándo se usa

| Técnica | Definición y reglas | Cuándo | Fuente |
|---|---|---|---|
| **Unísono** | Todos la misma nota. Da peso; con más de ~4 instrumentos "el sonido empieza a perder foco y ajuste". Un unísono real de todos los cornos sólo cabe en pocas notas ("say Bb3 to about G4"). Mezclar caña y metal ablanda el filo del metal: trompetas con altos, trombones con tenores, trombón bajo con barítono. | Declaración temática ("para una declaración temática impresionante, tocarla en unísono"), riffs, ornamentos rápidos, contraste con acordes. | ROG unisons-and-octaves; BUS [S] (el rango de unísono no aclara si es escrito o real); ABS p.197 |
| **Octavas** | Suman volumen y proyección; que el conjunto no pase de 3 octavas ni baje a zona turbia ni choque con la sección rítmica. Con jugadores pares se "espeja" (uno arriba, uno abajo). Con 4 trompetas, por defecto 1-2 una octava sobre 3-4. La 4.ª trompeta suele hacer octavas con la líder; el barítono toca una octava bajo el alto 1 en solis. | Riffs, líneas de bajo (bari con trombón 4), clímax. | ROG unisons, getting-started |
| **2 voces** | Terceras o sextas; cuartas y quintas sólo en modal y con cuidado; segundas y séptimas sólo como efecto (p.ej. 2 trompetas con sordina en 2das mayores paralelas bajo la melodía). Máximo 2 jugadores por voz (4 en total). Melodía arriba. | Adelgazar la textura. | ROG unisons; ROG voicings-part2 |
| **3 voces** | Rara en big band; "la más difícil en jazz". Drop 2, drop 3 y drop 2+4 **no sirven** para 3 voces (son técnicas de 4). | Secciones de 3 cornos (pop/funk: trompeta + sax + trombón; el autor suele añadir un cuarto). | ROG voicings-part2; VDL |
| **Triádico** | Trompetas en tríadas en registro alto, con la 4.ª duplicando a la líder una octava abajo. En fortissimo, tríadas (incluso bitonales) en trompetas sobre trombones que llevan 3.ª y 7.ª. | Clímax, tutti con líder alta. | ABS 5.3.1 pp.99-100; ROG shout; BUS [S] |
| **Cerrado de 4 voces (four-way close, "block")** | Acorde de 4 notas dentro de una octava, "colgado" bajo cada nota de la melodía. En jazz las voces exteriores forman 6.ª o 7.ª. Con sólo 4 voces, las tensiones **reemplazan** notas del acorde (raíz→9/#9/b9; 7.ª→6; 5.ª→11/#11/13/b13; 3.ª→4). | Soli de saxos (por defecto), trompetas en tutti, notas objetivo. | ABS 3.1 pp.39-40; ROG voicings-part1 |
| **Block de 5 saxos** | Cerrado de 4 con la melodía duplicada una octava abajo. "Un poco viejo, pero imprescindible para aprender"; mueve rápido. | Sección de 5 saxos, tempos medios/rápidos. | UNT3 pp.2, 4; ABS 4.1 p.75 |
| **Drop 2** | La 2.ª voz desde arriba baja una octava. Se usa cuando la voz grave o la 2.ª están demasiado agudas o la melodía quedaría tapada. Las exteriores deben seguir consonantes; mezclar con cerrado en notas importantes. En el shout, "drop-2 en los saxos crea un sonido grande y abierto" que da claridad. | Saxos y mixtos (trompeta+alto+tenor+trombón), tutti. | ABS 3.4.3 p.60; UNT3 p.4; ROG voicings-part1, shout, soli |
| **Drop 3** | La 3.ª voz baja una octava; genera segundas inversiones, es más difícil de tocar y afinar. | Sólo si lo pide el rango o la conducción. | ROG voicings-part1 |
| **Drop 2+4 / abierto** | "Sonido abierto y poderoso", quita el problema de la melodía disonante arriba, pone las notas en registros cómodos; **menos fusionado y se afina peor**. Opinión opuesta: "casi nunca se usa", no sirve para metales homogéneos (las trompetas viven en una octava), en saxos roza el límite de rango y resta fluidez. | Moderado/medio, notas largas, líneas mixtas. Se enseña como estándar (CAP). | ROG voicings-part1; ABS pp.63-64, 77-78; CAP |
| **5 voces** | Estándar: duplicar la nota superior una octava abajo. Variante: 5 voces en **cuartas** (acordes 6/9 mayor y m9/11), con reglas de reemplazo 7=1 (mayor) y 9=1 (menor) para no bajar demasiado; si baja demasiado, cerrar hasta formar clúster. | 5 saxos; temas con más contenido armónico. | ABS cap. 4 pp.75-86; ROG voicings-part1 |
| **Spread (abierto de 5)** | Se construye **desde la nota grave**, no desde la melodía. **Ninguna voz se duplica.** Conducción muy suave (los saltos se notan). Primero 3.ª y 7.ª, después tensiones; sin voicings ambiguos (falta la 3.ª o 7.ª y el acorde cambia). Pensado para ≥5 cornos. | Colchones/pads bajo una melodía; acordes de impacto. | ROG voicings-part2, open-voicings; VDL |
| **Clústeres** | Todos los intervalos son segundas; se puede omitir 3.ª o 7.ª si el acorde sigue implícito; nunca b2 entre las dos voces superiores. Sirven para notas repetidas o largas, mal para melodías rápidas. UNT: los clústeres suenan bien **desde do central hacia arriba**. | Color, sonidos "shock", Thad Jones. | VDL; ROG voicings-part2; UNT3 p.1 |
| **Cuartas (quartal)** | Todos los intervalos son cuartas; evitar novenas menores; b2+#4 "no funciona, esconde la melodía". Mal en pasajes rápidos que armonizan melodía; bien en notas importantes, fondos abiertos y modal. Mejor justo antes o después de un voicing que afirme el acorde. | Modal, fondos. | VDL; ROG voicings-part2; ABS 4.2 |
| **Upper structures** | Tríada mayor/menor (invertida o no) que contiene al menos una tensión; la sección rítmica debe afirmar el acorde. Sola es inestable. | Acordes de impacto al final de frase. | VDL; ROG open-voicings |
| **Cascada** | Una línea en unísono/octava se abre en armonía (típico: cerrado de 4) justo en la cadencia; guardarla para la puntuación final de la frase. | Cadencias, backings funk/soul. | ROG voicings-part2 |

### 1.2 Cuándo cada una (resumen para decidir)

- **Riff corto o acento rítmico → unísono/octavas.** [I] respaldado por el corpus propio del proyecto (52 temas con vientos): 55% de los ataques en unísono u octavas; 1-3 notas distintas por ataque en 84% (`vientos_corpus.txt`, corpus propio, no fuente externa).
- **Nota larga o final de frase → armonía** (cerrado, drop 2, cascada). [F] ROG; corpus propio.
- **Fondo/colchón → spread** con 3.ª y 7.ª, sin ritmo. [F] ROG open-voicings.
- **Línea de saxos de tempo medio/rápido → cerrado/block**, pasar a drop 2 cuando el rango lo pida. [F] UNT3; ABS.
- **Clímax tutti a ff → voicing "percusivo"** (ver 5.2). [F] ABS 5.4.
- **Si 4 voces no alcanzan para una tensión → sustituir una nota del acorde** en vez de agregar una voz (ver 1.1 y R08). [F] ROG.

**Ejemplo numérico [I], construido por mí con las reglas de 1.1 y 1.3 (Dm7, melodía A4):** cerrado = A4 69 (5.ª, melodía), F4 65 (3.ª), D4 62 (raíz), C4 60 (7.ª), colgadas bajo la melodía; exteriores A4-C4 = 9 semitonos = 6.ª mayor; la 2.ª mayor D4-C4 queda abajo, sin problema. Drop 2 = la 2.ª voz desde arriba (F4) baja una octava: A4 69, D4 62, C4 60, F3 53; exteriores A4-F3 = 16 semitonos (décima mayor); 5.ª justa F3-C4 en 53 (límite de 5.ª: 34, cumple), 2.ª mayor C4-D4 en 60 (límite: 51, cumple); la 3.ª del acorde (F3 = 53) está por encima de C3 (48).

### 1.3 Límites inferiores de intervalos (cuán grave puede sonar cada intervalo sin enturbiarse)

**Tabla de Hoffmann (imagen en el sitio; decodificada por mí, ver nota).** Para cada intervalo, el par más grave aceptable; entre paréntesis, MIDI de la nota inferior. Hoffmann: "NOT definitive rules but a good guide to avoid muddyness"; los metales fuertes perdonan menos que cuerdas suaves; se asume la raíz presente aunque no suene (ejemplo Am7); se pueden violar a propósito para un efecto retumbante.

| Intervalo | Par más grave | Nota inferior (MIDI) |
|---|---|---|
| 2.ª menor | E3-F3 | E3 (52) |
| 2.ª mayor | Eb3-F3 | Eb3 (51) |
| 3.ª menor | C3-Eb3 | C3 (48) |
| 3.ª mayor | Bb2-D3 | Bb2 (46) |
| 4.ª justa | Bb2-Eb3 | Bb2 (46) |
| 4.ª aum. / 5.ª dism. | Bb2-E3 / Bb2-Fb3 | Bb2 (46) |
| 5.ª justa | Bb1-F2 | Bb1 (34) |
| 6.ª menor | G2-Eb3 | G2 (43) |
| 6.ª mayor | F2-D3 | F2 (41) |
| 7.ª dism. | F#2-Eb3 | F#2 (42) |
| 7.ª menor | F2-Eb3 | F2 (41) |
| 7.ª mayor | F2-E3 | F2 (41) |
| octava, unísono | sin límite | - |
| 9.ª menor | E2-F3 | E2 (40) |
| 9.ª mayor | Eb2-F3 | Eb2 (39) |
| 10.ª menor | C2-Eb3 | C2 (36) |
| 10.ª mayor | Bb1-D3 | Bb1 (34) |

*Nota de decodificación [I]:* leí la figura (clave de fa, sin texto) nota por nota con recortes ampliados; los intervalos coinciden con sus etiquetas, pero verifícalo contra la imagen original: https://i0.wp.com/www.robin-hoffmann.com/wp-content/uploads/2019/12/Low_Interval_Limits.jpg . Sweetwater publica otra versión con números algo distintos (no pude abrirla, 403).

**Reglas verbales de otras fuentes:**

- "Por debajo de la línea central de la clave de fa (D3), que todos los intervalos sean consonantes, idealmente décima, quinta u octava." Octavas sirven en cualquier parte, décimas bastante abajo, "una cuarta demasiado grave suele sonar mal". Los cornos suenan parecido, así que no se puede arreglar con timbre. [F] ROG voicings-part2; ROG open-voicings ("que no haya demasiados intervalos graves que no sean octavas y quintas").
- **Raíz acústica**: la 3.ª del acorde no debería bajar de **C3 (130,8 Hz)** ni la 7.ª de **Eb3 (155,6 Hz)**, porque implicarían una fundamental absurdamente grave (quinto y séptimo armónico). El PDF imprime "E3" pero la frecuencia 155,6 Hz es Eb3; leo "Eb3" (se perdió el bemol). [F] ABS p.62, nota 4.
- **Sistema de rangos de UNT** (nota más grave del voicing): **D2-D3** = rango del bajo, posición fundamental con la nota del bajo del símbolo, forma de **pirámide** (intervalos grandes abajo, chicos arriba), voicing abierto, "no se construye para correr sino para sostener"; **D3-C4** = rango de inversión, si abierto la 3.ª o 7.ª abajo y forma de **reloj de arena** (intervalo chico al medio), puede ir cerrado; **C4 hacia arriba** (una octava) = rango de clústeres, "no sube el nivel de shock, sólo color"; en música rápida la intensidad es extrema. Los sonidos graves se perciben grandes y no pueden moverse tan rápido. [F] UNT3 p.1 (los dos D los leí de la figura: D2 y D3, [I] el D inferior).

### 1.4 Espaciado típico en un tutti (trompetas, trombones, saxos)

Cinco recetas de la literatura; ninguna es "la" regla, se escogen según el registro del líder.

1. **Superposición por secciones (ABS 5.1-5.2.1, pp.88-91)**: trompetas en cerrado con Tpt1 en registro medio; trombones también en cerrado, **superpuestos**: Tbn1 = Tpt3 y Tbn2 = Tpt4 (mismas alturas), Tbn3-4 más graves; saxos en cerrado con AS1 = Tpt2 y BS = Tbn4. Copiar los trombones una octava bajo las trompetas habría bajado demasiado a Tbn4. Se comprueban las voces exteriores entre secciones: Tpt1-Tbn1, Tpt1-AS1, Tpt1-Tbn4, Tpt1-BS (consonancia). "Nunca encontrarás Tbn1 por encima de Tpt1 (el unísono sí)". Orden de trabajo: primero la sección dominante (los metales), luego los saxos.
2. **Trombones una octava abajo (BUS [S])**: con la líder en registro moderado los trombones duplican a las trompetas una octava abajo; los saxos duplican a los trombones o usan voicing abierto con el alto líder doblando a la 2.ª o 3.ª trompeta.
3. **Líder alta (BUS [S]; ABS p.99; ROG shout)**: trompetas como tríada, la 4.ª una octava bajo la 1.ª, el trombón líder doblando a la 2.ª trompeta una octava abajo; por encima de ~D5-F5 el líder necesita ese apoyo (esencial con voicings de 5-6 notas).
4. **Distancia entre líderes (UNT4 p.1)**: con la trompeta líder alta, los dos líderes (trompeta-trombón) se separan entre una **octava y una décima**; los trombones van en registros medios y sólo al cerrar la sección pasan a posición fundamental (los líderes siguen a 8.ª-10.ª). Líder de trompeta arriba del pentagrama: trombones pueden ir abiertos (pirámide) o cerrados. Trompetas en registro medio y movimiento lento: trompetas graves y trombones agudos pueden formar clúster. En registro grave, 4 trompetas y luego 2 equilibran a 4-5 trombones en posiciones fundamentales lentas.
5. **Trombones como extensión (ROG shout)**: los trombones continúan el voicing de las trompetas hacia abajo ("como acordes de 8 voces"), o el trombón líder se enlaza a otra línea y se armoniza hacia abajo, según el rango; el trombón líder cerca del tope de la clave de fa; armonía cerrada en el grave de la clave de fa es "un sonido muy grueso".

**Contraste entre secciones**: si las trompetas van cerradas, los saxos abiertos y viceversa, "para evitar un sonido metálico y de fase" (ROG shout). "Mientras los saxos suenen bien solos, los metales estarán bien" (principio de Ray Wright citado por ROG, [S]). Cada sección debe sonar completa por sí sola; trompetas y trombones no tienen que enunciar el mismo acorde (BUS [S]).

**Tutti de 8 metales contra 5 saxos está desbalanceado**; se mitiga con sordinas, dinámica, o piano/guitarra reforzando la línea de saxos (BUS [S]).

### 1.5 Reglas de duplicación

- **Líder**: "el alto líder dobla a la trompeta líder, y así hacia abajo; el barítono dobla al trombón 1 o 2"; si la trompeta pasa de **F5**, el alto líder dobla a la 2.ª o 3.ª trompeta (BUS [S]). Contrasta con ABS p.90 (AS1 = Tpt2, BS = Tbn4) y con ROG shout (Alto 1 puede enlazar con Tpt2/3/4 o doblar a la líder una octava abajo).
- **Saxos con 5 en cuatro notas distintas (density-4)**: se duplica la **melodía** (cerrado o drop 2); "duplicar otras notas que no sean la melodía suele dar sonidos que no son idiomáticos". [F] UNT3 p.2. En un spread **nada** se duplica (VDL, ROG open).
- **Cada sección tiene su "bajo"**: bajo trombón = raíces; las voces más graves llevan 3.ª y 7.ª (en dominantes 3.ª+7.ª); evitar la **5.ª justa** en trombones sobre un dominante (usar b5/#11 o #5/b13 arriba). [F] ABS 5.3 pp.98-99; 5.4 p.101.
- **Barítono** puede doblar al trombón 4 en líneas de bajo; el 4.º trombón es bajo y no dobla (ROG getting-started). Doblar una octava arriba la nota del bajo del acorde: evitarlo (BUS [S]).
- **Máximo 4 instrumentos por línea** en unísono; octavas ≤3 octavas (ROG unisons).

---

## 2. Armonizar líneas melódicas: notas de aproximación y notas de paso

### 2.1 Método estándar (objetivo primero, aproximaciones hacia atrás)

1. **Armonizar las notas objetivo (target notes)** con cerrado de 4 voces: son "a menudo notas del acorde y en tiempos fuertes". Se ignoran por ahora las notas de paso y de aproximación. [F] ROG soli-writing.
2. **Armonizar las de aproximación trabajando hacia atrás**, desde cada objetivo (ya voiceado). ROG: cromática, diatónica, dominante, disminuida o paralela. ABS: "chord de destino" (aiming chord) y se construye hacia atrás. HER: "el acorde de destino tiene que estar voiceado antes de poder escribir la armonización cromática que lo precede". [F]
3. **Revisar al pasar a los instrumentos**: rangos, saltos internos, notas repetidas; ROG: "si hay que cambiar de voicing, mejor eso que un salto torpe en una voz interna". [F]

Método alternativo para solis destacados con líneas independientes: **voice leading libre** (armonizar objetivos de forma convencional y rellenar las voces internas libremente, prioridad "líneas coherentes y sin notas repetidas"). [F] ROG voicings-part2; HER cap. "Line writing".

### 2.2 Los cinco métodos de Rogers, con ejemplo (ejemplos construidos por mí, verificados con las reglas de 1.3 y 3)

Definiciones [F] ROG voicings-part1 ("Approach note harmonisation"):

- **Cromática**: la nota de aproximación está fuera de la tonalidad del momento y entra por semitono; se voicea el acorde de destino y las otras voces se mueven por paso al acorde de destino.
- **Diatónica**: la nota de aproximación está en la tonalidad del momento y entra por semitono o tono; se armoniza **sólo con notas de la tonalidad**.
- **Dominante**: la nota de aproximación pasa a ser parte de un acorde dominante de la nota de destino (que se vuelve tónica momentánea); "sólo funciona si la nota de aproximación es parte del dominante" (normal o alterado; se puede añadir el ii).
- **Disminuida**: igual que la dominante pero con un acorde disminuido de séptima, "lo mismo que una aproximación dominante cambiando la raíz por una b9, para un sonido más crujiente".
- **Paralela**: "un comodín"; copiar el movimiento de la nota de aproximación en **todas** las voces del acorde de destino (si es un tono, todas se mueven un tono); el acorde de aproximación tiene la **misma calidad** que el de destino.

Ejemplo (destino **Dm7**, melodía D5; voicing destino, cerrado, MIDI: D5 74, C5 72, A4 69, F4 65; exteriores D5-F4 = 6.ª mayor):

| Aproximación (nota melódica) | Acorde de aproximación (MIDI, sup→inf) | Movimiento por voz al destino |
|---|---|---|
| **Dominante**, C#5 (73), semitono bajo | A7: C#5 73, A4 69, G4 67, E4 64 | +1, +3, +2, +1 |
| **Cromática / paralela exacta**, C#5 | Dm7 bajado un semitono = C#m7: 73, 71, 68, 64 | +1, +1, +1, +1 |
| **Disminuida**, C#5 | C#dim7: 73, Bb4 70, G4 67, E4 64 | +1, +2, +2, +1 |
| **Diatónica**, E5 (76), vecina superior (F mayor) | Em7b5: E5 76, D5 74, Bb4 70, G4 67 | -2, -2, -1, -2 |
| **Paralela**, E5 (76), un tono arriba | Em7: 76, 74, 71, 67 | -2, -2, -2, -2 |

Todas respetan: exteriores dentro de una octava (6.ª), sin notas repetidas en la misma voz, sin m2 en las dos voces superiores (74-72 es una 2.ª mayor, aceptable).

### 2.3 Herramientas equivalentes en Absil y Herborn

- **Dominante secundario = estructura disminuida de 7.ª** para notas no cordales que se resuelven por grado a una nota del acorde. Con un **salto** después, "el acorde disminuido tiene un efecto mucho más débil": mejor **extender** el acorde anterior (p.ej. Gsus4 en vez del G7 plano). [F] ABS 3.3.1 p.44.
- **Leading-tone chord (acorde de sensible)**: movimiento paralelo exacto **local**: todas las voces del primer acorde se mueven la misma distancia (2.ª menor o mayor) hacia el acorde destino. Efecto más fuerte con 2.ª menor; "se usa más hacia arriba que hacia abajo". La cromática descendente es aceptable pero suena mejor con línea ascendente. Cuidado con la **relación cruzada**: una b9 abajo y una 9 arriba dan una novena menor áspera entre melodía y voz inferior; usar el truco del sus4 y dejar el dominante real para el último tiempo. [F] ABS 3.3.3 p.47; p.70.
- **Armonización cromática** (HER p.60): melodía y todas las voces inferiores se mueven medio tono hacia el acorde destino; "fácil de entender y muy usada"; "discreta mientras no se use demasiado en un mismo pasaje". Requiere que destino y nota armonizada tengan la misma estructura. **Armonización paralela** (HER p.60): todas las voces inferiores se mueven en la misma dirección e intervalo que la melodía; el intervalo puede ser mayor.
- **Estructuras paralelas diatónicas, acordes sustitutos, subdominantes secundarios, dominantes alterados** (ABS 3.3.4-3.4.5, pp.48-71) para casos que lo anterior no resuelve; un dominante armonizador debe incluir **3.ª y 7.ª**.
- **Nota melódica que es tensión (9, 11, 13)** (HER p.50): "colocar los demás tonos del acorde lo más cerca posible, omitiendo la nota del acorde que quede junto a la melodía". La armonización de la 9 lleva las mismas voces inferiores que la de la raíz, la de la 11 como la de la 3.ª, la de la 13 como la de la 5.ª. En 4 voces las tensiones **sustituyen** notas del acorde (ROG, ver 1.1).
- **Raíz arriba y 7.ª mayor justo debajo (m2/m9)**: sustituir la raíz de armonía por la 9 o pasar a un acorde 6. [F] ROG voicings-part1.
- **Acordes compatibles (UNT3 p.4)**: cuando la música se mueve rápido y por grados, "el mismo acorde no puede armonizar dos notas contiguas: no hay conducción de voces y suena ingenuo". Se usan acordes **de la misma escala** (compatibles con el de base).

### 2.4 Qué armonizar y qué dejar en unísono

- **Tiempos fuertes y notas largas → armonizar.** **Síncopas y notas ligadas**: la última corchea de un grupo sincopado, o una nota anticipada, se armoniza con **el acorde del siguiente tiempo regular** (misma regla que para las ligadas). [F] ABS pp.51, 60.
- **Ornamentos de semicorchea (16th) en la melodía "no necesariamente tienen que armonizarse, especialmente en tempos altos"** (se dejan a la línea líder). [F] ABS 3.4.3 p.60. Esto respalda la regla de ejemplo del encargo: notas de paso muy cortas en **unísono/octava** en vez de acorde. El umbral exacto de duración/tempo **no está en las fuentes**; es parámetro [I] (ver R23).
- **Unísono al principio de la frase y armonía en el objetivo**: ROG abre una frase de soli en octavas y entra en armonía recién en el acorde destino; "cascada" justo en la cadencia (ROG voicings-part2).
- **Contra-ejemplo**: tresillos de corcheas ascendentes se **armonizaron** en el soli de ejemplo ("me planteé octavas, pero funciona mejor como soli de saxos armonizarlos"). [F] ROG soli-writing. Es decir, la decisión es estilística, no sólo de duración.
- **Pasar de unísono a armonía crea notas repetidas** (la voz que estaba en unísono repite la nota); en solis veloces evitarlas ("estancan la línea y se articulan distinto"). Se arregla armonizando la nota superior con otro apoyo, o dejando fuera la 3.ª. [F] ROG soli-writing.
- **Latín**: [I] en riffs de acento y moñas cortas, unísono/octavas domina (corpus propio, 55%); la armonía va en notas largas, finales de frase y fondos.

### 2.5 Comprobaciones automáticas útiles

Después de armonizar cada acorde: (a) exteriores dentro de una octava si es cerrado; (b) sin notas repetidas en voces internas respecto del acorde anterior; (c) sin m2 entre las dos voces superiores; (d) sin m9 de relación cruzada entre melodía y voz inferior; (e) límites de intervalos graves (1.3); (f) 3.ª ≥ C3 y 7.ª ≥ Eb3; (g) cada instrumento dentro de su rango (sección 6).

---

## 3. Conducción de voces dentro de una sección

**Reglas base de ABS 3.1 (p.39-41), para armonía seccional de 4 voces:** (1) de arriba hacia abajo; (2) cuatro voces; (3) cerrado (exteriores 6.ª o 7.ª); (4) **todas las voces en movimiento paralelo** (no aplica preparación/resolución de disonancias del contrapunto clásico); (5) **sin notas repetidas** en ninguna voz salvo la melodía.

**Qué dicen otras fuentes (y dónde discrepan):**

- UNT3 (p.5): "buena conducción **no** significa que todos hagan el mismo movimiento que el líder: eso es planing"; cada voz debe tener una línea "compatible con la melodía y que la apoye"; "cuando el líder se mueve por grado, sólo raramente una voz interna no se mueve"; el paso de block a drop 2 es más fácil cuando hay un **salto** en la melodía. Se bosqueja a 3 pentagramas en concierto (altos, tenores en clave de octava, bari en clave de fa).
- ROG voicings-part2: voice leading libre para tempos rápidos (movimiento contrario); si hay que cambiar de voicing, mejor cambiarlo que dar un salto inconveniente.
- **Mantener notas comunes (HER p.49-50)**: si la melodía se liga sobre un cambio de acorde, las notas bajo la melodía que **también están** en el acorde siguiente se quedan; las que no pertenecen se llevan a "la nota más cercana posible del nuevo acorde, preferiblemente la inferior".
- **Cuándo cambiar de cerrado a drop 2 (ABS p.62, 77)**: de preferencia sobre un acorde **disminuido** (por su simetría de terceras menores casi no se nota) o ante un **salto grande** de la melodía; esto evita saltos de quinta en las voces graves y las terceras demasiado graves.
- **Sin repetidas**: son difíciles de hacer "swing" y causan problemas de mezcla y balance (un tenor repetido "sobresale"). Remedios: sustituir por otra nota disponible del acorde (A → Bb como b9), pasar a drop 2, y como último recurso **cruce de voces**. Las repetidas lentas en fondos no melódicos son aceptables. [F] ROG voicings-part1. ABS (nota 6, p.71): si hay varias repetidas en voces vecinas se pueden **intercambiar notas**; el cruce temporal "es aceptable y casi imperceptible" en instrumentación homogénea. [F]
- **Excepción: voicing percusivo a ff**: "la conducción cuidadosa se relaja: las repetidas son permisibles; pueden aparecer pasos o saltos aumentados/disminuidos en las voces medias". [F] ABS 5.4 p.101.
- **Pads/spreads**: conducción muy suave porque los saltos grandes se oyen; resolver sensibles hacia arriba; 3.ª y 7.ª primero. [F] ROG voicings-part2, open-voicings.
- **Estilo coral** (ABS 6.8 p.131): conducción por grados, acordes de tríada y 7.ª, pocas extensiones, retardos; o contrapunto (ver 4.4).

**Lo que suena mal en cornos (lista de chequeo):** 2.ª menor entre las voces superiores ("demasiado áspera", ABS p.41; la 2.ª mayor es aceptable salvo en registro alto); novena menor entre melodía y voz inferior ("relación cruzada", ABS p.47); 3.ª o 7.ª por debajo de C3/Eb3 (ABS p.62); notas repetidas en voces internas; cuartas muy graves (ROG); saltos internos grandes (ROG); voicings muy abiertos (drop 2+4, drop 3) que "se mezclan peor y se afinan peor" (ROG voicings-part1).

**¿Quintas y octavas paralelas?** En bloque de metales/saxos **no están prohibidas** (ABS: la preparación/resolución clásica "no importa"), son justamente el recurso de planing. [I] Lo que sí hacen es **fusionar** las voces (ver 4.1), lo cual es deseable en un soli o tutti y indeseable cuando se pide independencia entre líneas.

---

## 4. Contrapunto aplicado a secciones de vientos

### 4.1 Qué hace que dos líneas se oigan como independientes (percepción)

- **Límite de densidad** (Huron 1989, 2016, resumido por SIE): con timbres homogéneos, el error al contar voces sube de ~10% con 3 voces a ~50% con 4. El estudio de Siedenburg et al. (2021) midió que **la diferencia de timbre compensa en parte**: con 4 voces, 72% de acierto si los instrumentos son distintos (flauta, violín, trompa, fagot) contra 56% con cuarteto de cuerdas; "el rendimiento no cae abruptamente". **[F]** SIE (ojo: en ese experimento se medía seguir **una** voz señalada, no contar cuántas hay; y las voces objetivo eran siempre internas).
- **Principios de Huron 2001 ("Tone and Voice", *Music Perception* 19(1):1-64)**: sólo leí resúmenes: derivó las reglas tradicionales de conducción de voces de principios perceptuales (proximidad de alturas, fusión tonal, co-modulación de altura, entre otros). **[S]**
- **Consecuencia para cornos [I]**: voces que se mueven **en paralelo** y en intervalos consonantes (8.ª, 5.ª) **se funden** en una sola; es lo que se quiere en soli y tutti (movimiento paralelo/planing, ABS regla 4). Para que dos líneas se oigan **independientes** hacen falta: movimiento contrario u oblicuo, registros separados, **ataques en lugares distintos** y timbres distintos (secciones distintas).

### 4.2 Cuántas capas puede seguir el oyente

- **Regla de Absil (p.195-197)**: combinar **hasta tres elementos en paralelo**, **contando la sección rítmica y la voz** como elementos; pasar de tres "debe ser una decisión deliberada"; cambiar de técnica con regularidad (~30 s de atención). No combinar 4 con 5 voces seccionales ni contrapunto imitativo con armonía seccional.
- **Contraejemplo latino**: en *Oyeme* (Machito, 1957) Sanabria describe "una matriz de **cuatro cosas independientes** todas entrelazadas en la clave": saxos, trombones y trompetas más el solista, "las tres secciones se preguntan y responden mientras el solista tiene su propia conversación"; los cornos "actúan en cierto sentido como bateristas". Cada capa es **una sección con timbre propio** y se pega a la clave. [F] JAL jlc5126, notas de ensayo (pp.3-5 del PDF).
- [I] Regla de diseño: **3 capas** como tope general con timbre homogéneo; **hasta 4-5 elementos** (sección rítmica como bloque fusionado + 3 secciones + solista) sólo si cada capa tiene timbre propio y **sus ataques no coinciden** (ver 4.3). Con cantante o solista en foco, bajar a **2 capas de vientos**.

### 4.3 Contrapunto rítmico y ritmos complementarios (una sección se mueve, la otra sostiene)

- **Escalas de duración distintas** (ABS pp.197-198, Fig. 11.4): "las combinaciones con duraciones iguales suenan borrosas y el oyente no las distingue"; **colocar los ataques cortos de una técnica durante las notas largas de otra**. Ejemplo útil: T1 colchón sostenido, T2 bajo, T3 melodía; o T1 pedal, T2 melodía en unísono, T3 bloques acentuados.
- **Intercambio de actividad** (ABS Ej. 11.1, *Like a Lover*, p.199): voz en corcheas; contramelodía de trombones en negras y blancas; al subir la actividad de uno, baja la del otro.
- **Ataques yuxtapuestos** (ABS 6.1, p.113): melodía, trombones y bajo "deliberadamente con ataques yuxtapuestos (mínimas coincidencias)" para mantener el groove.
- **Fondo detrás de un solista** (HER p.169, Ej. 125 vs 126): tres trompetas altas y forte con trombones rítmicamente activos hacen que un saxo alto solista "no tenga prácticamente posibilidad de imponerse". El mismo registro alto **funciona** si el fondo es rítmicamente inactivo (voicings de dos compases). Moraleja: no es el registro sino la **actividad rítmica** relativa al solista.
- **Staccato de metales contra acordes ligados de saxos** funciona; trompetas en unísono contra acordes de saxos y trombones sirve al principio de un arreglo, no al clímax. [S] BUS.
- **Big band mambo**: "clásicos mambos tenían a los **saxos tocando un ritmo mientras las trompetas tocaban un riff**" (Ray Santos). [F] SAN parte 2. Los trombones entran con un guajeo, los saxos responden con ataques cortos en forma de acorde arpegiado, las trompetas cierran con una contramelodía (Oyeme, ver 7.2). [F] JAL jlc5126.

### 4.4 Movimiento contrario y oblicuo

- **Apertura contraria**: en un bloque tutti, trompetas que **suben** y trombones que **bajan** "piden un crescendo y llevan al clímax". [F] ABS 5.4.1 Ej. 5.10 (solución 2), pp.104-105. También el escalón gradual de tensión por "apertura contraria en un bloque tutti" (ABS p.194).
- **Densidad variable** (ABS 6.6 p.128): el caso extremo es una sección que se **abre desde** un unísono o **se cierra en** un unísono. En su ejemplo (introducción de *Autumn Leaves*, para maderas) cada frase arranca con dos voces a una 3.ª y por movimiento contrario abierto llega a una tríada abierta de 4 voces, con la densidad creciendo. Es una receta directa para "tres líneas que convergen" (al revés) y para entradas escalonadas.
- **Contrapunto a dos partes por familias** [S] BUS (arranging.pdf): trompetas con altos (y flauta/clarinete) contra trombones con tenores y barítono.
- **Contrapunto clásico en jazz** (ABS 6.8 p.131): imitación de motivos o fugato; independencia melódica de cada voz; **la sección rítmica queda tacet** y el contrabajo duplica la voz más grave. No se mezcla en el mismo instante con armonía seccional (ABS p.196).

### 4.5 Líneas de notas guía (3.ª y 7.ª) como fondo

**no encontrado** como técnica nombrada en las fuentes accesibles. Lo más cercano:

- ROG open-voicings: en spreads "priorizar las 3.ª y 7.ª, luego agregar tensiones (9, 11, 13)".
- ABS 5.3, 5.4 (p.98-101): los trombones "dan las funciones armónicas esenciales: 3.ª para mayores/menores y 3.ª+7.ª para los demás"; en el voicing percusivo se asignan 3.ª y 7.ª a dos trombones.
- Carp (citado en `vientos_salsa.md`) elogia el "dominio de los shell voicings" en tres trombones de Palmieri; la lectura habitual de "shell" es 3.ª y 7.ª, pero el texto no lo precisa. **[S]**

[I] Regla propuesta: un fondo de notas guía es una línea que une la **3.ª → 7.ª** del acorde siguiente por semitono o tono (la 7.ª de un acorde a la 3.ª del siguiente), en notas largas, en trombones/saxos, sin mover más de un tono por cambio. Es la lectura natural de las reglas de arriba, no una cita.

### 4.6 Llamada y respuesta entre secciones

- **Categoría I (UNT4)**: una sección en **unísono**, la otra en **acordes**; "sólo funciona bien cuando hay diferencia en el movimiento lineal entre las dos secciones (también al combinar metales y saxos)". **Categoría II**: todos en unísono/octavas, vigilando que (1) la línea sea idiomática para los instrumentos y (2) la sección cierre con **voicings integrados** (notación "en pentagrama"). Tramos cortos de **acoplamiento paralelo** (trompetas y trombones a la octava) "no suenan viejos" si los acordes están extendidos y la línea tiene buen movimiento. [F] UNT4 pp.2-4.
- Esquema [S] BUS: "llamada y respuesta funciona con trompetas en unísono, saxos con contrafrases y trombones en acordes divisi".
- El shout chorus clásico: "llamada y respuesta entre metales y saxos, o entre conjunto y baterista". [F] WK Shout chorus.
- *Congo Mulence*: "los metales entran en el segundo coro (letra B) en llamada y respuesta con los saxofones. Esta es la capa tres". [F] JAL jlc5122.
- *Kenya*: en la letra C los saxos tienen "partes independientes en movimiento que deben oírse"; en la D hay un tutti de metales que repite la melodía ("toca **debajo** de la trompeta líder"); en la F el tenor responde con parte de la melodía. [F] JAL jlc5125.

### 4.7 Fondos tras una melodía o solista: colchones (pads), golpes (punches), "pirámides"

- **Cuándo entran** (ROG solos-and-backgrounds): "suelen empezar la **segunda vez** de la sección A"; la primera vuelta queda para ritmo y solista; la última A sirve de "traspaso" al próximo solista; cobran protagonismo en el clímax del solo. "Mucho unísono y octavas salvo cuando se necesitan acordes, para mantener la textura liviana." "No saturar los fondos para que el solista no tenga que pelear con ellos." En el clímax, **golpes con huecos** que dejan lugar al solista. [F]
- **Duración y capas** (BUS arranging [S]): "las notas más largas son mejores"; construir tras un solo de ritmo: 8 compases con ritmo, luego trombones o saxos en unísono/divisi como colchón o riff, luego agregar algo en el puente; "pero no exagerar o el solista se ahoga".
- **Colchones** (ROG open-voicings): se construyen "de la nota grave hacia arriba"; 3.ª y 7.ª primero; "evitar voicings ambiguos" (si falta una 3.ª o 7.ª el acorde puede cambiar); respiración para los jugadores; trombones por encima de los saxos deben quedar controlables y **más suaves** que ellos; trompetas con sordina **cup** "se acomodan entre cañas y trombones"; intervalos oscuros y cerrados en acordes de clímax y abiertos en acordes de reposo; evitar 2.ª menor y 9.ª menor en puntos estables.
- **Golpes (punches)**: ver voicing percusivo en 5.2 (ABS 5.4).
- **Machito**: "los fondos están ahí para complementar, no para competir"; "pequeños crescendos inherentes"; los saxos "básicamente nunca dejan de tocar" detrás del solista de trompeta y quedan "subordinados a los metales, a los trombones"; en los intercambios de cuatro "los poderosos fondos se desvanecen" y quedan sólo las percusiones. [F] JAL jlc5120, 5122, 5126.
- **"Pirámides"**: **no encontrado** como técnica nombrada. Lo más cercano: (a) **bell chord** (ABS 6.1 p.113): las notas de un acorde entran una tras otra, ascendente (o menos veces descendente), a intervalo constante, típico en breaks e introducciones, con ataques yuxtapuestos al resto; es la forma de "entradas escalonadas"; (b) "pirámide" como **forma** de un voicing (intervalos grandes abajo, chicos arriba; UNT3 p.1).

---

## 5. El shout chorus / clímax y el mambo latino

### 5.1 Qué es y dónde va

- **Shout chorus (out chorus)**: normalmente el último coro, la parte más enérgica y el clímax; motivos reordenados en **riffs** cortos y acentuados; **rangos extremos y dinámicas fuertes**; a menudo tutti, pero también contrapuntístico o en llamada y respuesta (metales/saxos, conjunto/baterista); los metales agregan falls, doits, turns, shakes. [F] WK Shout chorus (sin citas).
- **Posición**: "alrededor de 2/3 del camino" (ROG shout); "el clímax global se espera entre 60% y 70% de la duración, ~0,618 de la razón áurea" (ABS p.194); "después del 80-90% del tiempo total" (HER p.172); "el clímax principal al 80% o al final" (BUS [S]). **Las fuentes discrepan**: ver sección 9.
- **Rol**: un tutti que desarrolla temas, motivos y armonía anteriores. Los shouts modernos no necesitan toda la banda y pueden ser más suaves, pero demasiada contención le quita el "shout". [F] ROG shout.

### 5.2 Cómo se construye (registro, densidad, dinámica, ritmo)

1. **Registro**: la trompeta líder va en buen rango y la tonalidad conviene a toda la banda; "la líder es alta: eso deja espacio para que las voces se extiendan por debajo". Las notas más altas y las líneas más rápidas se guardan **para el final del coro**. [F] ROG shout; [S] BUS.
2. **Densidad**: escalón por paso de **unísono a armonía seccional de 5 voces**, o por repetir la melodía **una octava arriba con acentos de metales**; gradual con crescendo de mf a ff o con **apertura contraria** en un bloque tutti. [F] ABS p.194.
3. **Factores verticales** que se **suman**: dinámica ff, orquestación llena y densa con todos los músicos, ritmo con corcheas y semicorcheas (el pasaje más activo), homofonía muy abierta, varias octavas en unísono y/o pasajes polifónicos: "cuantos más factores se combinan, más fuerte el clímax". [F] HER p.172.
4. **Tensión rítmica**: "en el shout la tensión es a menudo rítmica": repetir la estructura del tema y luego añadir unos compases o un fill de batería **antes de las notas clave**; "retrasar una nota importante un tiempo" ya tiene un gran efecto. [F] ROG shout.
5. **Mezcla de voicings** a medida que avanza la forma, "subiendo el nivel de contorno sin volverlo injugable". [F] UNT4 p.4.
6. **Voicing percusivo** (ABS 5.4 pp.101-106), el que se usa "para crear un sonido tutti masivo a fortissimo": voicings extendidos de 5-6 voces para metales (trompetas+trombones) o para todo el conjunto; frases cortas con ritmos irregulares, muchas síncopas y silencios; articulaciones y dinámicas sincronizadas (mp a fff de golpe); la sección rítmica **sigue el ritmo de los cornos** (guitarra y bajo abandonan rasgueo y walking; el baterista prepara y refuerza acentos; el piano copia el voicing o mete notas agudas en los silencios); repetidas permisibles. **Procedimiento**: (1) bajo trombón con las raíces; (2) 3.ª y 7.ª a otros dos trombones en acordes dominantes (la 3.ª en los demás tipos); (3) trompetas en tríadas (pueden ser bitonales sobre el dominante: tríadas de las 12 posibles estructuras de la figura 5.12) o en clúster dentro de una 6.ª (una 5.ª es típica), con 3.ª o 4.ª entre Tpt1 y Tpt2 en la versión diatónica; (4) completar los trombones, con duplicaciones elegidas con cuidado; **sin 5.ª justa en trombones sobre un dominante**; la líder alta se duplica una octava abajo desde F5.
7. **Orden de escritura**: ROG: trompetas, luego saxos, luego trombones, sección rítmica última (el "orden" es de escritura, no de entrada en el tiempo). BUS: líder, trompetas en cerrado, trombones, saxos. ABS: primero la sección dominante (metales), luego saxos. Y la advertencia de Wright citada por ROG: que los saxos suenen bien solos. [F/S]

### 5.3 Cómo se relaciona la sección de mambo con el shout

**Parentesco documentado [F]:**

- "Los Afro-Cubans agregaron material de **metales y saxos tomado del estilo big band**" a lo que después se llamó sección de mambo. [F] WK Mambo section (Payne, *Tito Puente*, pp.56-57; Salazar 2002).
- "El mambo de big band de los 40 y 50 desarrolló **riffs contrastantes de metales y saxos**, que muchos músicos ven como derivados de la última sección de la guaracha." "Sección de mambo: una sección de riffs contrastantes que equilibra, por ejemplo, trompetas contra saxos o trombones." [F] LOP glosario.
- Ray Santos: "mi amor por el swing me permitió mezclar muchos riffs y orquestaciones de jazz en los mambos"; Machito "estableció el estilo de su banda con esos emocionantes arreglos de big band basados en el swing de los años 30 y 40". [F] SAN partes 1 y 2.
- Sanabria sobre *Blues a la Machito*: "¿Cómo sonaría la banda de Count Basie con una sección rítmica afrocubana auténtica? ... Basie meets Machito". Bauzá fue trompeta líder y director musical de Chick Webb y pasó por Cab Calloway. [F] JAL jlc5120; JAL jlc5125; WK Bauzá.
- Glosario JAL: el mambo "involucraba líneas repetitivas de metales que se cruzan en la clave" (Pérez Prado la llevó al contexto big band) y "mambo" también nombra las líneas repetitivas de metales de la sección de montuno en el son. [F] JAL jlc5125.

**Equivalencias [I]** (mi lectura, no una cita):

| Shout chorus de swing | Sección de mambo |
|---|---|
| Un coro de tutti, escrito, de una pasada | Ciclos de riff de 2/4/8 compases que **se repiten** sobre el montuno; se acumulan capas |
| Riffs de metales vs saxos | Trompetas vs saxos o trombones; moñas |
| Llamada y respuesta, o tutti en unísono/octavas | Idem; unísonos de metales (Bauzá, ver 7.1) |
| Falls, doits, shakes | Shakes de trompeta; falls |
| Fill de batería, parada antes de la nota clave | Abanico/cierre; parada tutti **en clave** |
| Registro y densidad crecen al final del coro | Entrada de la trompeta líder al final del mambo (VonKelemen, en `vientos_salsa.md`); moñas que suben |
| Clímax a ~2/3-80-90% | Mambo y moña en el tramo final de la forma; el cierre baja intensidad |

[I] **Regla práctica**: modelar el mambo como "un shout hecho de bucles": cada pasada del bucle agrega una capa o sube de registro; el "golpe tutti" final (parada) cae en la última pasada y en posiciones de la clave del lado siguiente.

---

## 6. Registros y rangos prácticos (sonido real)

**Cómo se obtuvo cada número.** Los rangos de HER (pp.14, 21) y ROG (figuras de rangos) vienen en pentagramas sin texto; los **decodifiqué a ojo** con recortes ampliados y comprobé contra los textos (los que dicen "E a F# sonando" etc.), así que las notas están bien pero tómalas como "leídas de figura" **[I]**. Las conversiones escrito→real son aritmética (alto: -9 semitonos, tenor: -14, barítono: -21, trompeta: -2; trombón y flauta sin transponer).

### 6.1 Tabla (MIDI con C4 = 60)

| Instrumento | Rango duro | Zona cómoda / "mejor" | Fuerte vs suave, notas | Fuentes |
|---|---|---|---|---|
| **Trompeta (Bb)** | E3-C6 (52-84) profesional; sólo para el líder: hasta ~F6 (89) y screamers | Cómoda B3-G5 (59-79); "brillante" A5-C6 (81-84); "rango de líder" C6-F6 (84-89), decodificado de la figura (escrito D6-G6) | 3.ª-4.ª trompeta desde **G3 (55)**: E3-F#3 son tocables pero "nasales y borrosos"; G3-A3 "más claros", se usan en 3.ª y 4.ª. "La octava más grave, salvo una buena 4.ª trompeta, suele estar desenfocada." **Techo del líder habitual: F5 (77)**; por encima necesita doblar una octava abajo. "Mantener las notas altas del líder para clímax y finales." La 2.ª no debe llegar tan alto como el líder ni la 3.ª como la 2.ª. Notas del pentagrama (escrito E4-F5) "dan buenos resultados en todas las dinámicas". Muy potente: Bb4-Bb5 (70-82); "flojas" bajo A4 (69) **[S]** | HER p.14; ROG instrumentation; ABS p.99; BUS [S] |
| **Trombón tenor** (no transpone; clave de fa siempre) | E2-F5 (40-77); conservador hasta D5 (74) | Claro y controlable ≈A2-G4 (45-67) (figura); "todos los trombones muy fusionados hasta ~G4"; Ab4 más débil; "líder" ≈Ab4-C5 | Piso: E2 (7.ª posición); **Tbn 1 y 2 no por debajo de C3 (48)**; Tbn 1 más agudo que Tbn 2, éste que Tbn 3. Zona gruesa E2-≈G2. Un trombón o trompeta empujado muy agudo "no tiene más remedio que tocar fuerte", lo que limita las opciones de voicing. "Algunos trombonistas flaquean por encima de F4 (65)" y "fuertes desde Bb3 (58)" **[S]** | WK Trombone; ROG instrumentation, unisons, open-voicings; BUS [S] |
| **Trombón bajo** | Bb1 (34, con válvulas) a ≈C4 (60) | "Por encima de do central rara vez hace falta y no es muy efectivo" | En pads suaves, ROG lo quiere "por encima del pentagrama" para control dinámico completo (tensión con lo anterior: en la práctica evitar su octava más grave en piano, **[I]**). Hace raíces. | ROG instrumentation, open-voicings |
| **Saxo alto** | Db3-Ab5 (49-80); A5 (81) con Fa# agudo | Conservador (quitar una 4.ª al rango escrito): Gb3-Eb5 (54-75) | "Break" escrito C#→D = sonoro E4→F4. "Partes en el pentagrama con pocos renglones abajo; si necesita clave de fa, es demasiado grave." Evitar los Bb-C# graves y el C# del medio del pentagrama en pads. **Evitar por encima del Fa# agudo** ("nunca ocurre en big band"). | ROG instrumentation, open-voicings |
| **Saxo tenor** | Ab2-Eb5 (44-75); E5 (76) con Fa# agudo | **Mejor C3-Eb5 (48-75)** (HER). Conservador: Db3-Bb4 (49-70) | Los cuatro semitonos más graves (Ab2-B2) "en partes arregladas rara vez" y de ser posible se le da el Ab2 al trombón. "Break" sonoro B3→C4. | HER p.21; ROG instrumentation |
| **Saxo barítono** | C2/Db2-Ab4 (36/37-68); A4 (69) con Fa# agudo | Todo el registro grave: "el quinto inferior es perfectamente común (y alentado)"; [I] no subirlo por encima de ≈Eb4 (63) salvo línea doblada | "Escribir demasiado agudo causa problemas de balance y afinación." No todos tienen el La/Do grave (C2). Dobla al trombón 4 en líneas de bajo; una octava bajo Alto 1 en solis. | HER p.21; ROG instrumentation, getting-started |
| **Saxos en general** | Los más graves (más llaves cerradas) son los más gruesos; el registro adelgaza al subir | "Quitar una 4.ª arriba y abajo y estás seguro en casi cualquier situación y dinámica" | Afinación problemática en el quinto superior; tocar piano en el tercio inferior es difícil: evitar los graves en pasajes suaves. Líneas de soli sin tocar el cuarto superior ni el inferior (excepto Alto 1 arriba y bari abajo). | ROG instrumentation, soli-writing |

### 6.2 Qué suena bien fuerte y qué suave (síntesis)

- **Fuerte**: trompetas B3-Bb5 (zona cómoda y brillante), trombones desde Bb3 hasta G4-C5, saxos en su mitad superior de zona cómoda; "los metales funcionan en casi cualquier voicing si evitan los registros extremos; los saxos necesitan que el voicing funcione por sí solo" (ROG open-voicings).
- **Suave**: trompetas dentro del pentagrama (escrito) o con sordina cup (se acomodan entre cañas y trombones); trombones en la zona media; saxos fuera del tercio inferior y del quinto superior; spreads con tensiones controladas. Lo más agudo del líder y lo más grave de saxos/trombón **no** se usa en piano.
- **Líder de trompeta**: "Muy potente de Bb4 a Bb5" y "evitar notas altas por debajo de mf" **[S]**; el techo habitual F5 (77) con apoyo y C6 (84) como excepción de clímax (HER: "rango sólo para el líder").

---

## 7. Big bands latinas: Machito/Bauzá, René Hernández, O'Farrill, Puente, Tito Rodríguez, Pérez Prado, Ray Santos

### 7.1 Machito y los Afro-Cubans (Mario Bauzá, director musical)

- **Formato**: arrancaron con "sección de metales de estilo big band con trompetas y saxos más batería, piano, bajo y bongó cubano"; en 1948-49 una banda de 14 con 3 trompetas (incluido Bauzá) y 4 saxos [F WK Machito, citando Leymarie y Yanow]. En la transcripción de *Kenya* (1957): **5 saxos (2 altos, 2 tenores, 1 barítono), 4 trompetas, 3 trombones**, bajo, batería, congas, bongó, timbales, timpani [F JAL jlc5125; la lista de instrumentación del PDF lleva por error el título "Congo Mulence"]; la grabación sumó invitados (Cannonball, Joe Newman, 6 trompetas y 4 trombones en la lista de personal).
- **Los saxos**: "los Afro-Cubans eran conocidos por su sección de saxos hábil; usaban una sección **completa de cinco**, dándole un sonido **grueso y gordo**; Bauzá le pidió a Salim algo que los luciera" (*Blues a la Machito*). La melodía va en los saxos durante dos coros "con elementos de vocabulario bebop"; detrás del solista de trompeta "continúan tocando fondos; básicamente nunca dejan de tocar" y quedan "subordinados a la sección de metales, a los trombones". [F] JAL jlc5120.
- **Los metales**: "complejos pasajes en unísono" de Bauzá, influyentes en la banda de Gillespie y en algunas orquestaciones de Ellington de la fiebre del mambo [F, reseña de MusicWeb; es una opinión crítica]. En *Kenya* hay un tutti de metales que repite la melodía "debajo de la trompeta líder" (letra D). [F] JAL jlc5125.
- **Capas**: "*Tanga* (1943)": nació de un vamp de piano; Bauzá hizo entrar primero al bajo, luego a los saxos, luego a las trompetas, y los riffs entrelazados formaron la melodía; "el efecto de una hoja de sonido mediante capas múltiples"; un solo acorde (modal), más tarde con un cambio de acorde tras la improvisación. [F] WK Bauzá (texto sin referencias en línea, cita a Salazar 1997); JAL jlc5126 ("armonía minimalista: Machito lo hacía desde 1943").
- **Contrapunto de claves**: "los primeros en explorar abiertamente el concepto de **clave counterpoint** desde el arreglo: pasar sin costuras de un lado de la clave al otro sin romper su integridad rítmica" [F JAL jlc5125]; el bajista Andy González lo bautizó "Clave Counterpoint" (Peñalosa, vía WK Bauzá).
- **Cita de Bauzá**: quería "una big band estadounidense con ritmos afrocubanos auténticos". Chico O'Farrill sobre el concepto: "una forma nueva de interpretar la música cubana con la mayor riqueza armónica posible... hizo seguidoras a todas las bandas que vinieron después". [F] JAL jlc5125.

### 7.2 Receta de capas de un mambo de Machito (Oyeme, 1957, A. K. Salim) [F] JAL jlc5126, notas de ensayo

1. Claves de son en 3/2 **y bajo** (tumbao en la clave, lado 3). Timbal suave sobre la primera nota del lado 2.
2. Congas y cencerro (campana del bongó) alinean sus patrones a la clave.
3. **Trombones** entran con un **guajeo** (arpegio rítmico).
4. **Saxos** responden con **ataques cortos en forma de acorde arpegiado**.
5. **Trompetas** entran con una **contramelodía** = "la capa final de la introducción".
6. En 24 compases "se creó un muro de sonido construido sobre sólo clave, bajo y un platillo". Termina con un **cierre** (stop-time) y entra la melodía en los saxos.

Sanabria: "Este es el concepto de arreglo del big band mambo: **capa sobre capa construida con frases rítmicas/melódicas que se intersectan con precisión en la clave**." Tras la melodía, los fondos "entrelazados" de saxos, trombones y trompetas "preguntan y responden"; con el solista son "cuatro cosas independientes". Método de ensayo: percusión+bajo+trombones; luego percusión+bajo+trompetas; luego +saxos; luego todo. En *Congo Mulence*: capa 1 bajo+piano sobre cáscara; capa 2 trombones con la melodía (blues de 12) y conga; capa 3 metales en llamada y respuesta con los saxos (compás B), "con shakes" en las trompetas. [F] JAL jlc5122.

### 7.3 René Hernández

Pianista y arreglista de Machito de **1946 a 1966**; según Leonardo Acosta "introdujo el mambo en la banda de Machito, con sus arreglos y su estilo pianístico". Ray Santos recuerda *Sambia* como "un chart muy swingueante del pianista René Hernández", uno de los que Machito empezó a dar en el Palladium para probarlo (EcuRed dice que *Zambia* "es considerada una obra clásica del jazz afrocubano" sin aclarar la relación con él). Co-compuso y co-arregló *Kenya* con Bauzá. [F] ECU; SAN parte 2; JAL jlc5125. **No encontré** descripciones de cómo voiceaba saxos o metales.

### 7.4 Chico O'Farrill

- "Siempre tengo la sección rítmica en mente cuando escribo" y "**hay que escribir partes de cornos que no choquen con el concepto rítmico**" (liner notes de Blumenthal, *Pure Emotion*, vía WK). Sus melodías y armonías son más cercanas al big band jazz estadounidense; lo cubano da sobre todo el ritmo. [F, WK Chico O'Farrill]
- *Afro-Cuban Jazz Suite* (1950), con Machito y Charlie Parker: forma de suite europea (Canción, Mambo, Rhumba abierta...). Su objetivo declarado en general: fusionar la música cubana con "las técnicas de jazz de riqueza armónica y orquestación". [F]
- Ray Santos: el *Carioca* de O'Farrill "tenía 10 millones de notas" y fue lo más difícil de su audición. [F, SAN parte 2]
- Reseña con citas de las notas de Blumenthal (**[S]**, CER): *El Loco Blues* es un "mambo blues" con "riffs contrastantes de metales y saxos que recuerdan los clásicos arreglos de big band mambo"; *Get Me to the Church on Time* reescrita como guaracha, cuya segunda sección se cita como "la fuente del mambo instrumental"; O'Farrill: "nunca fue mi interés principal preservar la autenticidad de la melodía cubana" y "con una big band no se puede jugar como en los grupos chicos"; su maestro de piano y orquestación fue Felix Guerrero, "figura grande" de la escuela cubana de arreglistas de los 40. [CER]
- **No encontré** análisis de sus voicings de saxos vs metales.

### 7.5 Tito Puente, Tito Rodríguez, Pérez Prado

- **Puente**: estudió el sistema de Schillinger; su grupo de 1949 (los Picadilly Boys) "tenía un pesado sonido de metales influido por la orquesta de Kenton"; su rasgo es "crear percusión usando la orquesta entera como instrumento percusivo", sobre todo en el mambo; escribía mambos "muy sofisticados pero bailables". [F EBS] *Mambo Inn* (ficha de venta): "las líneas de metales son afiladas y nerviosas". [S]
- **Tito Rodríguez**: Ray Santos le arregló *El Agua de Belén*, *Modulando*, *Tómame Ya*, *Azucón*; el comentario de Myers señala "la escritura de cañas a mitad de camino y el golpe sincopado de la sección de trompetas". [F SAN parte 2; **no encontré** técnica de voicing.]
- **Pérez Prado**: 4-5 trompetas y 4-5 saxos con "un pegadizo contrapunto entre trompetas y saxos"; llevó el mambo al contexto big band con "líneas repetitivas de metales que se cruzan en la clave". [F WK Mambo (music); JAL jlc5125] Los reportes de que usaba trompetas en unísono muy agudas vienen de una reseña crítica que no leí completa; **no encontré** análisis de partitura.
- **Ray Santos (m. 2019, a los 90)**: tenor y arreglista de las "Tres Grandes" (Machito, Puente, Rodríguez). "Había más cosas en arreglar este tipo de música que sólo voicear acordes para vientos" y "las figuras rítmicas que tocaban ellos eran en muchos sentidos más importantes" (en la nota de WBGO "ellos" son los músicos de la sesión con Noro Morales que discutían figuras escritas y hablaban de clave, probablemente los de la sección rítmica; **no** es una frase sobre los vientos, así que no la uso como regla de vientos; corrige la lectura que había en `vientos_salsa.md` cita 7); sus charts, según Sanabria, eran "siempre en clave". "Los clásicos mambos tenían a los saxos tocando un ritmo mientras las trompetas tocaban un riff. Cuando entraban esos riffs, el pulso subía y los bailarines empezaban a mover." "Cada sección de la banda de Machito entraba y salía con tiempo perfecto." [F WBGO; SAN partes 1-2]

### 7.6 El papel de los saxos en la era del mambo (síntesis)

- Ritmo/respuesta frente al riff de trompetas (Santos); ataques cortos en forma de acorde arpegiado contestando el guajeo de trombones (Oyeme); llamada y respuesta con metales (Congo Mulence); partes independientes en el puente (Kenya C); melodía con lenguaje bebop y fondos casi continuos (Blues a la Machito).
- Sección de **cinco** saxos ("gruesa y gorda"), no un cuarteto: lo que justifica 5 voces/drop 2 en el generador. Barítono con el bajo/trombón 4. [I]
- En salsa de conjunto (trabajo previo): "los saxos son más aptos para rellenar con arpegios que para figuras acentuadas; los saxos juntos suenan como los violines de una charanga" (SalsaForums, [S]; ver `vientos_salsa.md`).
- **Voicing de saxos vs metales en bandas latinas**: no encontré análisis de intervalos; lo único documentado es de **rol y textura** (arriba).

### 7.7 Alineación de las figuras de vientos con la clave

- **Frases en clave** (Ferguson p.49, síntesis de Hernandez 2007 y Mauleón-Santana 1997): notas de negra o más, o corcheas sincopadas seguidas de silencio, "insinúan la clave"; un **anticipo que empieza en un tiempo fuerte** anuncia que el compás siguiente es el **lado de 2**; un anticipo en contratiempo anuncia el **lado de 3**. "En términos prácticos, la frase en clave tendrá más tiempos fuertes en el lado de 2 y más contratiempos en el lado de 3"; las que rompen esto son "cruzadas" (*cruzado*). Un **salto** de clave (dos compases seguidos del mismo lado) "suele considerarse un error"; en arreglos modernos, una vez empezado el tema, la clave rara vez se interrumpe (p.50). [F]
- **Número de compases**: "un número **par** de compases no cambia la dirección de la clave; un número **impar** la cambia"; decidir 2/3 o 3/2 de entrada y no cambiarla. [F LOP, consejos de clave]
- **Los cornos "primero ritmo"**: "la prioridad de los cornos en este género es el ritmo... la melodía hay que interpretarla primero desde lo rítmico"; "cada componente (percusión, montuno, bajo, fraseo melódico, líneas de cornos) tiene que estar sincronizado con la clave" (Díaz, Midwest Clinic 2009, [F] copia local `diaz.txt`).
- **Machito**: pasaban de un lado de la clave al otro "sin costuras" (Tanga); en 1957 el solo de Joe Newman delineó clave 2/3 dentro de un tema en 3/2: "se cruzó" y la sección rítmica lo siguió; "romper la integridad rítmica de la clave es casi un sacrilegio"; los congas de la grabación original alinean su melodía con el lado de 3. [F JAL jlc5126]
- **Paradas y cierres** deben estar "en clave" (John Santos, citado en `vientos_salsa.md`, [S] vía Wikipedia).

---

## 8. Reglas para un generador (36, testables)

Convención: MIDI sonoro, C4 = 60; "F" = dicho por la fuente, "I" = inferido o parámetro mío (cambiable). Entre paréntesis, la prueba que puede escribirse en código.

### Registros y límites

**R01 · Rango duro.** Ninguna nota fuera de: trompeta 52-84 (el líder llega a 89 sólo en el clímax final); trombón tenor 40-77; trombón bajo 34-60; alto 49-80; tenor 44-75; barítono 37-68. (`lo <= nota <= hi`). *Fuentes:* HER pp.14, 21; WK Trombone; ROG instrumentation. *Tipo:* F (conversiones: I).

**R02 · Zona cómoda y pisos de sección.** Por defecto generar dentro de: trompeta 59-79; trombón 45-67 (líder hasta 72); alto 54-75; tenor 48-75; barítono 37-63. Pisos: Tpt3-4 ≥ 55 (G3); Tbn1-2 ≥ 48 (C3). Salir de la zona cómoda sólo en el clímax. *Fuentes:* ROG instrumentation (figuras 3.x, decodificadas), HER p.14, 21; ROG "quitar una cuarta". *Tipo:* F/I.

**R03 · Jerarquía de secciones y techo del líder.** Tpt1 ≥ Tpt2 ≥ Tpt3 ≥ Tpt4 y Tbn1 ≥ Tbn2 ≥ Tbn3; Tbn1 ≤ Tpt1 (el unísono sí). Si Tpt1 ≥ 77 (F5) debe haber un doblaje una octava abajo (Tpt4 o Tbn1); es obligatorio con voicings de 5-6 notas a partir de ≈74 (D5). Si Tpt1 ≤ 67 (G4) Tpt2 puede doblarla en unísono. (`assert tpt1>=77 -> any(v==tpt1-12)`). *Fuentes:* ABS pp.88, 99; BUS [S]; ROG instrumentation. *Tipo:* F.

**R04 · Dinámica y registro.** En p/mp: no usar el tercio inferior de alto (<59) ni de tenor (<54), ni los graves del trombón por debajo de ≈45; el barítono queda exento. Notas de trompeta por encima de 77 sólo desde mf. *Fuentes:* ROG instrumentation ("tocar piano en el tercio inferior es difícil"); BUS [S] (mf). *Tipo:* F/I (los cortes numéricos son I).

**R05 · Límites de intervalos graves.** Para cada par de voces adyacentes (al menos entre las tres más graves), la nota inferior ≥ `LOW_INT[semitonos]` de la tabla 1.3 (`LOW_INT = {1:52, 2:51, 3:48, 4:46, 5:46, 6:46, 7:34, 8:43, 9:41, 10:41, 11:41, 13:40, 14:39, 15:36, 16:34}`; 12 sin límite). Si no cumple: subir la voz, abrir el voicing (drop 2) o dejar sólo octava y quinta. *Fuente:* HOF (decodificada). *Tipo:* F.

**R06 · Región grave y raíz acústica.** Por debajo de D3 (50) sólo octavas, quintas y décimas entre voces adyacentes (cuartas y segundas, no). La 3.ª del acorde ≥ C3 (48) y la 7.ª ≥ Eb3 (51). Es la versión **conservadora** de R05 (el gráfico de Hoffmann deja, p.ej., una 4.ª justa en Bb2-Eb3, que ROG desaconseja): usar R06 por defecto y R05 como límite absoluto en pasajes suaves o en cierres. *Fuentes:* ROG voicings-part2; ABS p.62 (nota 4). *Tipo:* F (la jerarquía entre R05 y R06: I).

**R07 · Zonas de UNT para la nota más grave del voicing.** 38-50 (D2-D3): posición fundamental con la nota del bajo del símbolo, "pirámide" (distancias no decrecientes hacia abajo), para notas largas; 50-60 (D3-C4): inversión; si es abierto la nota más grave es la 3.ª o 7.ª y la forma es "reloj de arena" (distancia mínima en el medio); ≥ 60 (C4): se permiten clústeres. *Fuente:* UNT3 p.1 (el D inferior = D2 es lectura mía de la figura). *Tipo:* F/I.

### Tipos de voicing

**R08 · Cerrado de 4 voces.** Defecto para saxos y trompetas: voz superior - inferior ≤ 12 semitonos y exteriores 8-11 semitonos (6.ª o 7.ª); acorde de 4 notas distintas colgado bajo la melodía; las tensiones sustituyen notas (raíz→9/#9/b9; 7→6; 5→11/#11/13/b13; 3→4). Prohibido: raíz arriba con la 7.ª mayor inmediatamente debajo (m2/m9); usar 6.ª o 9.ª en su lugar. *Fuentes:* ABS 3.1 pp.39-40; ROG voicings-part1. *Tipo:* F.

**R09 · Drop 2 y cambio de voicing.** Drop 2 = bajar una octava la 2.ª voz desde arriba. Usarlo si (a) la voz más grave viola R01/R05/R06, (b) la 2.ª voz está sobre la zona cómoda, o (c) la melodía quedaría tapada. Las exteriores quedan `(V1-V2)+12`: preferir V1-V2 en {3,4,5,7}, aceptar 2 (novena) ocasionalmente, evitar 1. Cambiar entre cerrado y drop 2 **sobre un acorde disminuido o ante un salto de la melodía** (≥ 3.ª). *Fuentes:* ABS pp.60-63, 77; UNT3 pp.4-5; ROG voicings-part1. *Tipo:* F.

**R10 · Drop 3, drop 2+4, abiertos.** Excepcionales: sólo sobre notas largas, nunca en trompetas (viven en una octava), preferiblemente en saxos o trombones, tempo medio/lento. *Fuentes:* ROG voicings-part1 (abre, poderoso, se afina peor) frente a ABS pp.63-64, 77-78 (casi nunca; roza el rango de saxos, resta fluidez). *Tipo:* F (conciliación: I).

**R11 · Sección de 5 saxos.** Density-4 con **sólo la melodía duplicada una octava abajo** (block o drop 2); no duplicar otra voz; el barítono lleva la nota duplicada o la más grave, sin pasar de ≈63 (R02). Density-5 (extensión o alteración sobre un density-4 eficaz) sólo en notas largas/finales. *Fuentes:* UNT3 pp.2-4; ABS 4.1 p.75. *Tipo:* F.

**R12 · Pad / spread.** Construir desde la nota grave; 5 voces sin duplicar ninguna; 3.ª y 7.ª siempre presentes; luego tensiones propias del acorde; sin m2/m9 en acordes estables; cada voz se mueve ≤ 2 semitonos entre acordes (≤ 3 con justificación); trombones por encima de los saxos controlables y más suaves; dejar respirar. *Fuentes:* ROG open-voicings, voicings-part2; VDL. *Tipo:* F (el ≤ 2 semitonos es I).

**R13 · Cuartas, clústeres, upper structures.** Cuartas: todos los intervalos 4.ª justa (inversiones 4+4, 2+4, 4+2 válidas); no b2+#4; no en pasajes rápidos que armonizan melodía; mejor adyacentes a un voicing que afirme el acorde. Clúster: intervalos de 2.ª, no b2 entre las dos superiores, sin 3.ª/7.ª sólo si el acorde sigue claro; no en melodías rápidas; nota más grave ≥ 60. UST: tríada con ≥ 1 tensión y sección rítmica afirmando el acorde. *Fuentes:* VDL; ROG voicings-part2; UNT3 p.1. *Tipo:* F.

**R14 · Funciones por sección.** Trombón bajo = raíz; los otros trombones llevan 3.ª (y 7.ª en dominantes) y **no** la 5.ª justa en un dominante (usar b5/#11 o #5/b13 arriba); trompetas en una octava (cerrado, tríada o clúster dentro de una 6.ª, 5.ª típica), con Tpt1-Tpt2 a 3.ª o 4.ª en la versión diatónica. *Fuentes:* ABS pp.98-101, 5.4.1 (Ej. 5.10); UNT4; ROG shout. *Tipo:* F.

### Espaciado y dobles en el tutti

**R15 · Plantilla de tutti.** Por defecto: trompetas cerradas; trombones cerrados y **superpuestos** (Tbn1 = Tpt3, Tbn2 = Tpt4, mismas alturas); saxos cerrados (AS1 = Tpt2, BS = Tbn4). Alternativa si el registro lo permite: trombones una octava bajo las trompetas (sólo si el más grave cumple R05-R06). Con líder alta: Tpt1-Tbn1 entre 12 y 16 semitonos (octava-décima). Verificar los pares exteriores Tpt1-Tbn1, Tpt1-AS1, Tpt1-Tbn4, Tpt1-BS por consonancia (m2 ocasional entre Tpt1 y AS1 se tolera en tempos medios). *Fuentes:* ABS pp.88-91; UNT4 p.1; BUS [S]; ROG shout. *Tipo:* F.

**R16 · Dobles del líder.** Alto 1 = Tpt1 mientras Tpt1 ≤ 77; si Tpt1 > 77, Alto 1 dobla a Tpt2 o Tpt3; barítono dobla Tbn1/2 (BUS) o Tbn4 (ABS) y lleva la línea de bajo con Tbn4; Tpt4 octava bajo Tpt1 cuando Tpt1 ≥ 77. *Fuentes:* BUS [S]; ABS pp.90-91, 99; ROG getting-started, shout. *Tipo:* F/S (es opcional elegir entre BUS y ABS).

**R17 · Contraste y completitud.** Si trompetas cerradas ⇒ saxos abiertos (drop 2) y viceversa; cada sección debe formar un acorde completo por sí sola; con 8 metales contra 5 saxos bajar metales, usar sordina o reforzar saxos. *Fuentes:* ROG shout; BUS [S]. *Tipo:* F/S.

**R18 · Unísonos y octavas.** ≤ 4 instrumentos por línea; con jugadores pares, espejar; ≤ 3 octavas de extensión; unísono de **todos** los cornos sólo en ≈58-67 (Bb3-G4); mezcla caña+metal: tpt+alto, tbn+tenor, tbn bajo+bari. *Fuentes:* ROG unisons-and-octaves; BUS [S]. *Tipo:* F/S.

### Armonizar la melodía

**R19 · Objetivos primero.** Notas objetivo = nota del acorde o tensión disponible en tiempo fuerte o de duración ≥ corchea [I]; armonizarlas primero con R08; las demás se armonizan hacia atrás desde el objetivo siguiente. Orden de escritura: líder, trompetas, trombones, saxos (BUS) o trompetas-saxos-trombones (ROG); lo esencial: los saxos deben sonar bien solos. *Fuentes:* ROG soli-writing, shout; ABS 5.1; HER p.60. *Tipo:* F (umbral de duración: I).

**R20 · Cinco métodos de aproximación.** Elegir por orden: (1) **dominante** si la nota de aproximación es 3.ª, 5.ª, 7.ª o b9/#9 de un V7 (o sustituto tritonal) del objetivo; (2) **disminuida** si pertenece a un dim7 que resuelve al objetivo (sólo con resolución por grado); (3) **cromática/paralela exacta** si está a un semitono y conviene el efecto "sensible" (mejor hacia arriba) — todas las voces se mueven la misma distancia y el acorde tiene la misma calidad que el objetivo; (4) **diatónica** con acordes de la escala del momento; (5) **paralela** como comodín (mismo intervalo en todas las voces). No encadenar el mismo método más de 2-3 veces. Ejemplos numéricos en 2.2. *Fuentes:* ROG voicings-part1; ABS 3.3.1, 3.3.3; HER p.60. *Tipo:* F (el orden de preferencia y el límite de repeticiones: I).

**R21 · Nota melódica que es tensión.** Armonizar con los demás tonos del acorde, omitiendo el que quede junto a la melodía; 9↔raíz, 11↔3.ª, 13↔5.ª comparten voces inferiores. *Fuentes:* HER p.50; ROG voicings-part1. *Tipo:* F.

**R22 · Síncopas, anticipos y ligaduras.** Una corchea sincopada o nota anticipada se armoniza con el acorde del **siguiente** tiempo; si la melodía se liga sobre un cambio de acorde, las notas inferiores comunes se mantienen y las otras bajan a la nota más cercana del acorde nuevo. *Fuentes:* ABS pp.51, 60; HER pp.49-50. *Tipo:* F.

**R23 · Notas rápidas de paso.** Una nota sin acento, no objetivo y de duración ≤ semicorchea (≤ 1/8 si es de tresillo) **no se armoniza**: unísono u octava (o sólo el líder). Cascada: unísono → armonía en el último objetivo de la frase. El umbral exacto es parámetro [I]; las fuentes sólo dicen "no necesariamente, sobre todo en tempos altos". *Fuentes:* ABS p.60; ROG voicings-part2, soli-writing. *Tipo:* F/I.

**R24 · Notas contiguas por grado.** Nunca el mismo acorde para dos notas contiguas que se mueven por grado: usar acordes compatibles de la misma escala, paralelos diatónicos o un aproximante; el disminuido sólo si la aproximación resuelve por grado (con salto, extender el acorde anterior). *Fuentes:* UNT3 p.4; ABS 3.3.1 p.44. *Tipo:* F.

### Conducción de voces

**R25 · Repetidas y segundas.** Ninguna voz interna repite nota respecto del acorde anterior (excepto la melodía, fondos lentos y el voicing percusivo); remedios en orden: sustituir por otra nota disponible (A→Bb como b9), pasar a drop 2, cruzar voces. Sin 2.ª menor entre las dos voces superiores (la mayor es aceptable salvo en registro alto); sin relación cruzada de 9.ª menor entre melodía y voz inferior. *Fuentes:* ABS pp.41, 47, 71 (nota 6); ROG voicings-part1. *Tipo:* F.

**R26 · Voces internas.** Cuando la melodía se mueve por grado, la voz interna se mueve (planing exacto no es obligatorio); evitar saltos de 5.ª o mayores en voces graves (si hace falta, cambiar de voicing en vez de saltar); minimizar el movimiento total. *Fuentes:* UNT3 p.5; ABS pp.62-63; ROG soli-writing. *Tipo:* F (minimizar: I).

### Capas y contrapunto

**R27 · Presupuesto de capas.** Elementos en paralelo ≤ 3 contando la sección rítmica y la voz/solista como elementos; con cantante o solista, 2 capas de vientos; en un mambo instrumental, 3 capas de vientos sólo si cada una tiene timbre propio (trombones, trompetas, saxos) y la sección rítmica va como bloque; cambiar de técnica ≈ cada 30 s. *Fuentes:* ABS pp.195-197; SIE; JAL jlc5126. *Tipo:* F/I.

**R28 · Fusión o independencia.** Para fundir (soli, tutti): movimiento paralelo, consonancias de 8.ª/5.ª y ataques simultáneos. Para independizar dos capas exigir al menos dos de: movimiento contrario u oblicuo, separación de registro ≥ 12 semitonos entre sus voces medias, ataques no coincidentes, timbre distinto. *Fuentes:* SIE/Huron (resumen), ABS regla 4 y 6.8. *Tipo:* I.

**R29 · Complementariedad rítmica.** Entre dos capas, la proporción de ataques coincidentes ≤ ≈30%; una capa de notas largas (≥ negra) admite otra de corcheas/semicorcheas; al subir la actividad de una, bajar la de la otra (intercambio). *Fuentes:* ABS pp.197-198 (Fig. 11.4), Ej. 11.1 p.199, 6.1 p.113-114; HER p.169. *Tipo:* F (el 30%: I).

**R30 · Fondos.** Entran en la segunda pasada del tema/solo; ritmo menos activo que el del solista; notas largas; pads con 3.ª y 7.ª, sin ambigüedad; un fondo puede estar sobre el solista sólo si es rítmicamente inactivo; en el clímax golpes con huecos; en los intercambios de cuatro, los fondos se retiran. *Fuentes:* ROG solos-and-backgrounds, open-voicings; HER p.169; JAL jlc5126. *Tipo:* F.

**R31 · Llamada y respuesta.** Categoría I: una sección en unísono y la otra en acordes (sólo si su movimiento lineal difiere; vale para metales vs saxos). Categoría II: todos en unísono u octavas, línea idiomática, y la sección **cierra con voicing integrado**. La respuesta cae en los huecos de la llamada. Trompetas en unísono contra acordes de saxos+trombones: etapa temprana, no el clímax. *Fuentes:* UNT4 pp.2-4; BUS [S]; WK Shout chorus. *Tipo:* F/S.

**R32 · Fondo de notas guía.** [I] Línea en notas largas que une la 7.ª de un acorde con la 3.ª del siguiente (o la 3.ª con la 7.ª) por semitono o tono, en trombones o saxos; sin ritmo; por debajo del solista. *Fuentes:* ROG open-voicings (3.ª y 7.ª primero); ABS 5.3-5.4 (trombones llevan 3.ª y 7.ª). *Tipo:* I (como técnica nombrada: no encontrado).

### Clímax, shout y mambo

**R33 · Forma del clímax.** Un clímax global por pieza, posición parametrizable entre 0,62-0,70 de la duración (Absil, Rogers) y 0,80-0,90 (Herborn, Busby); ff; instrumentación llena; el registro y los pasos más rápidos se guardan al final; subir de a escalones (unísono → 5 voces; repetir a la octava con acentos de metales) o de forma gradual (crescendo; apertura contraria); tensión rítmica antes de la nota clave (compases extra, fill, retrasar un tiempo). *Fuentes:* ABS pp.193-195; HER pp.171-172; ROG shout; BUS [S]. *Tipo:* F.

**R34 · Voicing percusivo (tutti a ff).** Procedimiento: bajo trombón raíz; 3.ª y 7.ª a dos trombones (3.ª sola en otros acordes); trompetas en tríadas (pueden ser bitonales sobre el dominante) o clúster ≤ 6.ª; completar trombones; sin 5.ª justa en trombones; frases cortas con síncopa y silencios; repetidas permitidas; la sección rítmica sigue el ritmo de los vientos; el bajo escrito concuerda con la raíz que toman los trombones cuando éstos caen en posición fundamental. *Fuentes:* ABS 5.3-5.4 pp.98-106; UNT4 p.5 (bajo). *Tipo:* F.

**R35 · Mambo en capas (bucles).** Orden de entrada (Oyeme): percusión con clave y bajo → conga y campana → **trombones: guajeo** → **saxos: respuestas cortas arpegiadas** → **trompetas: contramelodía**; una capa nueva por pasada del bucle; al final un cierre (parada en clave). Variante Tanga: bajo → saxos → trompetas. Saxos: ritmo o respuesta mientras las trompetas llevan el riff; detrás del solista de trompeta, fondos casi continuos y subordinados; sección de cinco saxos. *Fuentes:* JAL jlc5126, 5122, 5120; SAN parte 2; WK Bauzá. *Tipo:* F (traducción a bucles: I).

**R36 · Alineación con la clave.** Decidir 2/3 o 3/2 al inicio y no cambiar; número **par** de compases mantiene la dirección y **impar** la invierte (cambio sólo declarado); lado de 2: más ataques en tiempos fuertes y anticipos que empiezan en un tiempo; lado de 3: más contratiempos; ninguna frase "cruzada"; paradas y cierres en clave; los cornos piensan el ritmo antes que la melodía. *Fuentes:* FER pp.49-50; LOP; DIA; JAL jlc5126. *Tipo:* F.

---

## 9. Discrepancias entre fuentes y decisión sugerida

| Tema | Fuentes en conflicto | Sugerencia |
|---|---|---|
| Drop 2+4 / abiertos | ROG "abierto y poderoso" vs ABS "casi nunca se usa" y CAP lo enseña como estándar | Permitir, con baja probabilidad, en saxos/trombones sobre notas largas (R10) |
| Posición del clímax | ABS 60-70% (0,618); ROG ~2/3; HER 80-90%; BUS ~80% | Parámetro; por defecto 0,66 para el "shout" y 0,8-0,9 para el golpe final de una forma larga |
| Techo del trompeta líder | ABS: apoyo desde F5; BUS: "sobre D5 necesita apoyo"; ROG: cómoda hasta G5, "brillante" hasta C6, "rango de líder" C6-F6 | Apoyo obligatorio en 77 (F5), desde 74 con 5-6 notas (R03); C6 sólo en clímax |
| Quién dobla al alto líder | ABS: AS1 = Tpt2; BUS: alto líder = Tpt1 mientras ≤ F5; ROG: puede ser cualquiera | R16 admite ambas |
| Movimiento paralelo | ABS "todas las partes en paralelo" vs UNT3 "no hace falta el mismo movimiento (planing)" | Paralelo exacto sólo en soli fusionado; en demás casos conducción compatible (R26) |
| Trombón bajo en pads | ROG: "por encima del pentagrama" para control vs "por encima de do central rara vez hace falta" | Evitar su octava más grave en piano; no subir de 60 (R01) |
| Orden de escritura | ROG trompetas-saxos-trombones; BUS trompetas-trombones-saxos; ABS metales primero | Irrelevante para el resultado; lo que importa es que cada sección suene completa (R17) |
| Unísono de todos los cornos | BUS: sólo ≈Bb3-G4 (sin aclarar escrito/real) | Usar como límite de [I] 58-67 |

---

## 10. No encontrado y pistas

- **Texto de los libros pedidos** (Lowell/Pullig, Nestico, Sebesky, Wright, Mancini, Dobbins, Pease, Tomaro/Wilson): sólo fichas. La cita de Rogers a Ray Wright ("mientras los saxos suenen bien solos...") es de segunda mano. Un comentario de foro (Gearspace; sólo vi el resumen del buscador, la página dio 403) atribuye a Nestico "trompetas en tríada con la 4.ª duplicando la líder una octava abajo y trombones en clúster"; **no verificado**, y por eso no lo usé como regla (la parte de tríada + 4.ª trompeta una octava abajo sí aparece en BUS y ABS).
- **Líneas de notas guía como fondo**, **"pirámides"** como técnica de fondo, **voicings de intervalos** de Machito/Puente/Rodríguez/Prado/René Hernández/O'Farrill (sólo roles y texturas; las partituras de avance de JAL no las analicé). Pista: las transcripciones completas de Nate Sparks (*Oyeme*, *Kenya*, *Congo Mulence*, *Blues a la Machito*) vía Jazz at Lincoln Center/Alfred, y el ensayo de Paul Austerlitz sobre Bauzá y Machito con la transcripción de *Tanga* (A-R Editions, *Selected transcriptions*).
- **Tesis de Nathan Brad Miller (2007)** sobre Bauzá en MOspace (bloqueada) y **tesis UNCO (Chang Su, 2019)** sobre el estilo de arreglo de Thad Jones (PDF 403; el resumen dice que sus "polychords no identificados" y la llamada y respuesta saxos-metales son rasgos suyos).
- **Nota sobre la cuota de búsquedas**: terminé la búsqueda antes de cerrar guide tones, pirámides y técnica de Tito Rodríguez; si hace falta, otra sesión puede retomarlos.
- Lo ya cubierto en `vientos_salsa.md`/`..._timba.md` no se repite (estructura de canción, rejillas de ataque por lado de clave, corpus propio de 52 temas).

---

## 11. Cómo se mapea a las formas de mambo que ya tiene la app

| Forma de la app | Equivale a | Reglas |
|---|---|---|
| Todos con el mismo ritmo | Categoría II (unísono/octavas) o soli en bloque; cerrar con voicing integrado | R08-R11, R15-R18, R31 |
| Llamada y respuesta trompetas/trombones | Categoría I; en Machito, trombones guajeo ↔ saxos respuestas ↔ trompetas contramelodía | R31, R35 |
| Dos riffs simultáneos | Dos capas con ataques complementarios y registros separados | R27-R29, R36 |
| Tres líneas que convergen | Densidad variable en sentido inverso: voces que se cierran por movimiento contrario hacia un unísono o una tríada; "bell chord" invertido | R28, R33 (ABS 6.6, 6.1) |
| Entradas escalonadas | Capas de Oyeme (una por pasada) o bell chord; "champola" (ver archivo de salsa) | R35, R30 |

### Datos listos para copiar (valores propuestos, ver R01-R05)

```js
// MIDI sonoro, C4 = 60. Proviene de HER/ROG/WK/ABS; los márgenes "comodo" son mis conversiones [I].
const RANGO = {
  trompeta:     { duro: [52, 84], comodo: [59, 79], pisoT3T4: 55, techoLider: 77, lider: [84, 89] },
  trombon:      { duro: [40, 77], comodo: [45, 67], lider: [67, 72], pisoT1T2: 48 },
  trombonBajo:  { duro: [34, 60] },
  alto:         { duro: [49, 80], comodo: [54, 75] },
  tenor:        { duro: [44, 75], comodo: [48, 75] },
  baritono:     { duro: [37, 68], comodo: [37, 63] },
};
// R05: nota inferior mínima por tamaño del intervalo (semitonos); 12 y >16 sin límite.
const LOW_INT = {1:52, 2:51, 3:48, 4:46, 5:46, 6:46, 7:34, 8:43, 9:41, 10:41, 11:41, 13:40, 14:39, 15:36, 16:34};
// R06: 3.ª del acorde >= 48, 7.ª >= 51.
```
