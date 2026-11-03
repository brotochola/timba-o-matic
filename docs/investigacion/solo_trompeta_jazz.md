# Investigación: solo de trompeta sobre cambios de acordes (jazz, datos y evaluación)

Fecha de la investigación: 2026-11-03. Idioma: español, citas en el idioma original. Alcance: lado jazz y computacional (datasets, qué se midió en solos reales, cómo generar líneas, cómo evaluar). El lado salsa/clave está en `vientos_salsa.md`.

## 0. Nota de honestidad sobre las fuentes

Leído de primera mano (texto completo o tabla leída):

- **Libro "Inside the Jazzomat"** (Pfleiderer, Frieler, Abeßer, Zaddach, Burkhart, eds., Schott Campus 2017, acceso abierto). Bajé el PDF (10 MB) y lo leí con `pdftotext`: https://schott-campus.com/wp-content/uploads/2017/11/inside_the_jazzomat_final_rev_oa4.pdf . De ahí salen casi todos los números de la sección 2. Las figuras (histogramas) vienen como imagen y **no** se pueden leer: cuando el texto no da el número, lo digo.
- Páginas de descarga y de contenido de WJazzD (https://jazzomat.hfm-weimar.de/download/download.html, https://jazzomat.hfm-weimar.de/dbformat/dbformat.html, https://jazzomat.hfm-weimar.de/dbformat/dbcontent.html); confirmé con `curl -I` que los archivos existen.
- Frieler, Pfleiderer, Abeßer, Zaddach, "Telling a Story. On the Dramaturgy of Monophonic Jazz Solos", Empirical Musicology Review 11(1), 2016 (leído vía el espejo https://www.osu.tests.sfulib4.publicknowledgeproject.org/index.php/EMR/article/view/4959/4379).
- Tutorial de Frieler "Low-Skip Bias in Jazz": https://jazzomat.hfm-weimar.de/tutorials/klaus/tutorial_low_skip.html
- Frieler y Zaddach, "Evaluating an Analysis-By-Synthesis Model for Jazz Improvisation", TISMIR 2022: https://transactions.ismir.net/articles/10.5334/tismir.87 (leído por un resumen automático de WebFetch, no el PDF).
- BebopNet (ISMIR 2020), PDF leído: https://archives.ismir.net/ismir2020/paper/000132.pdf
- Jazz Transformer (Wu y Yang, ISMIR 2020), PDF leído: https://arxiv.org/pdf/2008.01307
- Yang y Lerch 2018, postprint leído (secciones de método): https://musicinformatics.gatech.edu/wp-content_nondefault/uploads/2018/11/postprint.pdf
- Diapositivas de Gillick, Tang, Keller (SMC 2009) sobre Impro-Visor: https://www.cs.hmc.edu/~keller/jazz/improvisor/SMC2009LearningJazzGrammarsSlides.pdf
- Repositorio de Impro-Visor (lista de archivos y licencia por la API de GitHub): https://github.com/Impro-Visor/Impro-Visor

**No pude leer** (solo resúmenes de búsqueda o nada): Frieler "Constructing Jazz Lines" 2019 (el servidor de la HfM rechazó la conexión), el artículo de 2010 en Computer Music Journal de Gillick-Tang-Keller, los libros de Hal Crook, Jerry Bergonzi, Jerry Coker, Narmour y Meyer (no hay texto abierto). Lo que digo de ellos sale de resúmenes de búsqueda y está marcado. Tampoco leí MINGUS ni JazzGAN: de ellos solo sé lo que dicen los resultados de búsqueda.

**No bajé** el `wjazzd.db` ni el zip de MIDI (pedido del encargo); por eso **no calculé yo los números de referencia de trompeta**: los números de abajo son del libro y de artículos, sobre el corpus entero o sobre un solista. Para calibrar con trompeta sola, la sección 1.1 trae consultas SQL.

Todo lo marcado **inferido** es deducción mía. Lo marcado **no encontrado** no apareció en ninguna fuente accesible.

---

## 1. Datasets que se pueden bajar

### 1.1 Weimar Jazz Database (WJazzD), el principal

- **Qué es**: 456 transcripciones de solos monofónicos (notas, no audio), proyecto Jazzomat, Hochschule für Musik Weimar. 78 solistas (https://dh-abstracts.library.virginia.edu/works/9830). Versión que ofrece la página: "Weimar Jazz Database v2.1 (DB version 2.2)", 456 solos (https://jazzomat.hfm-weimar.de/download/download.html).
- **URLs reales (confirmadas con HEAD, respuesta 200)**. Los links de la página son relativos a `/download/`:
  - SQLite: `https://jazzomat.hfm-weimar.de/download/downloads/wjazzd.db` — 42 512 384 bytes (~40,5 MB), Last-Modified 2018-02-08.
  - MIDI sin cuantizar (todos los solos): `https://jazzomat.hfm-weimar.de/download/downloads/RELEASE2.0_mid_unquant.zip` — 1 345 859 bytes (~1,3 MB), Last-Modified 2017-12-22.
  - Página de descarga: https://jazzomat.hfm-weimar.de/download/download.html
- **Licencia**: la base está bajo **Open Data Commons Open Database License (ODbL)**; el software MeloSpySuite es GPL (de la página de descarga). ODbL pide atribución y compartir igual si se redistribuye la base derivada. La página pide citar el libro de 2017. **Inferido**: para usar la base como entrenamiento/medición interna no hay problema; si publican una base derivada, ODbL aplica.
- **Formato SQLite** (https://jazzomat.hfm-weimar.de/dbformat/dbformat.html):
  - `melody`: una fila por nota. Columnas: `eventid`, `melid`, `onset` y `duration` (segundos), `pitch` (MIDI fraccionario), `bar`, `beat`, `division`, `tatum`, `subtatum`, `period`, `num`, `denom`, `beatprops`, `tatumprops`, `beatdur`, más `loud_*` y `f0_*` por nota.
  - `beats` (solo WJD): `onset`, `bar`, `beat`, `chord` (acorde de ese pulso), `form` (A1, B2…), `chorus_id`, `bass_pitch`, `signature`.
  - `sections`: filas con `type` en `PHRASE`, `CHORD`, `FORM`, `CHORUS`, `KEY`; `start`/`end` son ids de evento relativos a la melodía.
  - `solo_info`: `performer`, `title`, `instrument`, `style`, `avgtempo`, `tempoclass`, `rhythmfeel`, `key`, `signature`, `chorus_count`, `chord_changes`. Además `composition_info`, `transcription_info`, `track_info`, `record_info`.
  - **Frases**: son filas `sections.type='PHRASE'` (primer y último evento). **Acordes**: por pulso en `beats.chord` y por tramo en `sections.type='CHORD'`.
  - **Unidades de nivel medio (MLU)**: la página de formato **no** las describe (la herramienta las pidió y no aparecieron). Según el libro están anotadas a mano en todos los solos (Frieler: κ de Fleiss .81 para límites y .60 para tipos) y el libro las trata como parte de la base; **dónde viven en el .db no lo pude confirmar** (puede ser `sections` con otro `type`, o `mcm`/tabla aparte). Mirar con `.tables` y `SELECT DISTINCT type FROM sections`.
- **Instrumentos** (Tabla 2 del libro, 456 solos): ts 158 (34,6 %), **tp (trompeta) 101 (22,1 %)**, as 80, tb 26, ss 23, cl 15, **cor (corneta) 15**, vib 12, bs 11, g 6, p 6, bcl 2, ts-c 1.
  - La página de contenido (https://jazzomat.hfm-weimar.de/dbformat/dbcontent.html) mostró 94 solos `tp`, pero **su texto estaba cortado en el solo 443**, así que 94 es un piso; el número del libro (101) es el que vale. Por solista (esa lista parcial): Miles Davis 19, Clifford Brown 9, Chet Baker 8, Kenny Dorham 7, Dizzy Gillespie 6, Don Ellis 6, Fats Navarro 6, Freddie Hubbard 6, Roy Eldridge 6, Woody Shaw 5, Lee Morgan 4, Buck Clayton 3, Kenny Wheeler 3, Nat Adderley 2, y 1 de Shavers, Edison, Henry Allen, Armstrong. **No hay Wynton Marsalis** en esa lista.
- **Feel**: ~80 % de los solos son SWING; hay LATIN, FUNK y otros (Tabla 4 del libro). Tempo mediano 170,5 bpm; mediana de 2 coros y 87 s por solo. **Inferido**: el feel LATIN existe en la base y se puede filtrar con `rhythmfeel`, pero seguramente son pocos solos de trompeta: contarlos con SQL.
- **Consultas sugeridas** (para que ustedes calibren con trompeta):

```sql
-- trompeta y corneta
SELECT melid, performer, title, instrument, style, avgtempo, rhythmfeel, chorus_count
FROM solo_info WHERE instrument IN ('tp','cor');
-- solos de trompeta con feel LATIN
SELECT performer,title FROM solo_info WHERE instrument='tp' AND rhythmfeel LIKE 'LATIN%';
-- notas de un solo con el acorde del pulso (join por bar/beat y melid de 'beats')
SELECT m.pitch,m.bar,m.beat,m.division,b.chord FROM melody m
JOIN beats b ON b.melid=m.melid AND b.bar=m.bar AND b.beat=m.beat WHERE m.melid=?;
```

  (Los nombres exactos de la columna `melid` en `beats` y los valores de `rhythmfeel` no los pude verificar sin abrir la base: **inferido** a partir de la descripción del formato.)

### 1.2 Otros conjuntos

| Conjunto | URL | Formato / tamaño | Licencia | Utilidad |
|---|---|---|---|---|
| **Charlie Parker Omnibook en MusicXML** (Deguernel, Vincent, Assayag) | https://homepages.loria.fr/evincent/omnibook/ ; archivo `https://homepages.loria.fr/evincent/omnibook/omnibook_xml.zip` (HEAD: 200, 424 198 bytes) | MusicXML: 50 temas y los solos de Parker | "license file" dentro del zip, **no leído**; pide citar su paper SMC 2016 | Alto saxo, no trompeta; ver forma bebop |
| **Impro-Visor** (repositorio) | https://github.com/Impro-Visor/Impro-Visor | `.ls` (texto de lead sheet). `connectomes-more-and-training-leadsheets/training-data/combination/transcriptions/` tiene **115 archivos `.ls`** (conté los paths de la API de GitHub) con solos transcriptos, entre ellos `NowsTheTimeCliffordBrown.ls`, `ByrdLikeHubbard.ls`, `CeoraMorgan.ls`, `MomentsNoticeMorgan.ls`, `OnGreenDolphinStreetMiles.ls`, `GroovinHighGillespie.ls` | GPL-2.0 (API de GitHub) | Trompeta mezclada con otros; es el corpus que usa Keller para aprender gramáticas. Hay también licks (`MinorII-V-I-VI-licks.ls`). Formato propio, hay que escribir un lector |
| **Filosax** (Foster y Dixon, ISMIR 2021) | https://zenodo.org/records/5643734 (Lite) | 48 grabaciones multipista, MIDI de las transcripciones, MusicXML, PDF; **saxo** | **Restringido**: acceso a pedido, solo investigación no comercial, no redistribuir (según resumen de búsqueda de la página de Zenodo) | No sirve para trompeta ni para redistribuir |
| **FiloBass** (Riley y Dixon) | arXiv https://arxiv.org/pdf/2311.02023 ; Zenodo DOI 10.5281/zenodo.10265335 | 48 líneas de bajo, >50 000 notas, MIDI alineado + acordes/pulsos | **no verificada** (solo vi que el paper es CC BY 4.0) | Bajo; útil solo como contexto armónico |
| **Parker reconstruido** (Riley y Dixon 2024) | https://arxiv.org/abs/2405.16687 | pares partitura-audio con MIDI alineado | sin enlace de descarga confirmado | Saxo |
| **DTL1000 / Dig That Lick** | https://dig-that-lick.eecs.qmul.ac.uk/ | ~300 000 notas de 1 736 solos monofónicos, extraídos **del audio** con una CRNN, de >600 temas | la página **no** dice licencia ni dónde bajarlo; hay un buscador de patrones | Más trompeta que WJazzD seguramente, pero sin descarga confirmada |
| **Pattern History Explorer** (Frieler, Höger, Pfleiderer) | https://dh-abstracts.library.virginia.edu/works/9830 | >600 patrones de intervalos, >11 000 instancias pre-minadas de WJazzD | no revisada | Lista de "licks" ya minados |

- **Latin jazz / salsa**: **no encontrado** ningún set abierto de solos de trompeta de salsa o jazz latino en MIDI/MusicXML (la búsqueda solo devolvió libros comerciales y servicios de transcripción pagos). Lo más cercano es el feel LATIN de WJazzD (1.1). **Inferido**: para ritmo de salsa hay que usar el corpus propio del proyecto y las reglas de `vientos_salsa.md`, no datos de solos.
- **Transcripciones comerciales** (Dizzy Gillespie Collection, etc.) son libros, no datos: https://www.halleonard.com/product/672479/the-dizzy-gillespie-collection

---

## 2. Qué se midió en solos reales (todo WJazzD, salvo que diga otra cosa)

Unidades: "corpus" = los 456 solos (1 416 coros). Pitches son notas sonoras (concierto) en MIDI; **inferido**: la trompeta en Si bemol escribe una segunda mayor más arriba.

### 2.1 Densidad y ritmo

- **Densidad de eventos**: promedio del corpus 4,8 notas por segundo; **Freddie Hubbard 3,4** (con tempo medio 114 bpm contra 196 del resto). Fuente: libro, capítulo estadístico (Pfleiderer y Abeßer), Tabla 9 y su texto.
- **Parker, "Star Eyes"** (referencia de la página de síntesis https://jazzomat.hfm-weimar.de/dbformat/synopsis/solo65.html): 4,81 notas/s, 8,64 notas/compás, 133,8 bpm, ambitus 55-79 (24 semitonos), sincopa 45,5 %, razón de swing mediana 1,67:1.
- **Hawkins** (saxo tenor, "Body and Soul"): 3,79 tonos/s; texto del libro dice que "Hawkins plays four tones per second" aprox.
- **Conversión a notas por pulso** (**inferido**): densidad × 60 / bpm. Parker 4,81 × 60 / 133,8 ≈ 2,16 notas por pulso (casi corcheas continuas). Corpus mediana de 170 bpm con 4,8/s ≈ 1,7 notas por pulso.
- **Sincopa ("syncopicity", % de notas sincopadas)**: corpus sin Goodman **31 %**; Hubbard **45 %**; Goodman 19 %, y el libro advierte que errores de ejecución pueden contar como sincopas. West Coast: Getz y Sims más sincopados, Konitz y Marsh menos (capítulo de Burkhart, números solo en figura).
- **Clases de duración** (relativas al pulso y absolutas con corte en 500 ms): los estilos se diferencian sobre todo en ritmo y no en tono. Swing: 31 % de duraciones "muy cortas" contra 45 % en el resto; 41 % "cortas" contra 30 %; postbop toca más notas muy cortas.
- **Trompeta frente al resto**: el libro dice que trompeta y saxo tenor "mainly differ with regard to pitch range (tenor is lower, trumpet is higher) as well as in the case of trumpet solos with regard to the share of very long tones (2.9 % vs. 1.7 %, ioiclass_rel_hist_05_very_long)". Es decir, **la trompeta sostiene notas largas más seguido** que el promedio. Alto saxo "en el centro" sin diferencias.
- **Swing 8vas**: acento en la corchea del tiempo (on-beat) más fuerte que la del contratiempo en 67 de 77 solos con efecto significativo (solo 10 al revés). **Swing ratio** promedio en la base ~1,3:1 según un estudio de Music Perception 2021 citado en resultados de búsqueda (no lo leí). **Inferido**: salsa va con corcheas rectas; no aplicar swing.

### 2.2 Intervalos

- **Saltos (skips = intervalos mayores a una segunda mayor)**: **41,4 %** de los intervalos en promedio, sobre 299 solos (https://jazzomat.hfm-weimar.de/tutorials/klaus/tutorial_low_skip.html). **Inferido**: quedan ~58,6 % de pasos (1-2 semitonos) y repeticiones.
- **"Low-skip bias"**: el porcentaje de saltos baja al subir el registro, Spearman ρ = -0,59; los saltos **ascendentes** tienen un sesgo mucho más fuerte que los descendentes ("jump up and trickle down" dice el autor, cualitativo).
- **Repeticiones de nota**: 5,3 % de los intervalos en el resto del corpus; **trombón 12,3 %** (el libro lo marca como lo más distintivo del trombón). Sin dato directo para trompeta.
- **Saltos grandes hacia arriba** (fuzzy "big jump up", más de 7 semitonos): corpus 2,2 %, Hubbard 4 %.
- **Clases difusas de intervalo** (Tabla 3 del libro): salto grande abajo < -7; salto -7..-5; salto corto -4..-3; paso -2..-1; repetición 0; paso +1..+2; salto corto +3..+4; salto +5..+7; salto grande > +7. Usable tal cual como histograma de 9 clases.
- **Cromatismo**: Woody Shaw tiene más cuartas (11,2 % contra 8,5 %) y más segundas menores (5,5 % contra 3,9 %) **respecto a la armonía** que el resto (medidas "cdpcx": clase de altura relativa al acorde).
- **Entropía de intervalos por frase**: Miles Davis en "Airegin" tiene baja variabilidad y concentra los intervalos en pasos; los solos de Gillespie, Navarro y Dorham son más variables (capítulo "Mellow Miles", solo en figuras: **no hay números**).

### 2.3 Altura y registro

- **Miles Davis, "Airegin"**: ambitus casi dos octavas (de La3 a La5, el libro lo escribe con símbolos de alteración que se perdieron en el texto), concentrado entre unos Mi4 y Re5; mediana de rango por frase **13 semitonos** (mín 3, máx 16); el rango por frase baja en el medio del solo y tras llegar a 16 se reduce enseguida (capítulo de Burkhart).
- **Gillespie, "Be-Bop"**: ambitus de más de tres octavas, notas frecuentes hasta Re6 y algunas hasta Sol6.
- **Mediana de altura** (MIDI): Woody Shaw 71,3 contra 65,3 del resto; Hubbard 69,0 contra 65,4 (la tabla extraída del PDF quedó desordenada: **inferido** que ese valor es de Hubbard por la columna). Resto del corpus: rango 23,5 semitonos; trombón 18,9.
- **Modal** (25 solos): rango de intervalos mayor (29,5 contra 21,1) y más notas muy cortas.

### 2.4 Frases

- **Largo**: en "Airegin" hay 42 frases de entre 3 y 20 notas, **mediana 10 notas**, variabilidad baja y sin tendencia a crecer o achicarse. En Gillespie "Anthropology", Navarro "Our Delight" y Dorham "Blues in Be-Bop" el largo es mucho más variable (capítulo de Burkhart; sin números).
- **Medido en segundos o pulsos**: **no encontrado** en lo que leí (el libro lo trata por número de notas). **Inferido**: con ~10 notas y 2-4,8 notas/s, una frase dura 2-5 s.
- **Descansos entre frases**: el libro dice que "jazz soloists add short breaks between phrases, e. g., just for breathing"; los silencios largos se anotan aparte como MLU "void" (silencio activo). Duración en números: **no encontrada**.
- **Contorno de altura de las frases** (Tabla 6 del libro, sobre todas las frases de la base; frases de 4 notas o más se clasifican por mediana del primer 25 %, 50 % central y último 25 %): **descendente 38,1 %**, ascendente 20,0 %, convexo (arco) 17,4 %, cóncavo 10,9 %, horizontal 3,5 %, **menos de 4 notas 10,1 %**. El contorno de intensidad es parecido: descendente 40,3 %.
- **Mientras más tarde en la frase, más fuerte la nota larga**: correlaciones pequeñas (|r| ≤ 0,06) entre posición en la frase y tono, duración e intensidad; las notas más largas tienden a caer al final de la frase.

### 2.5 Armonía: tonos de acorde y disonancia

- **Lo que sí está medido**: el libro usa la "clase de altura cordal extendida" (CDPCX): cada nota se expresa como grado respecto a la raíz del acorde y la escala asociada. Da fracciones por grado.
  - Terceras menores sobre acordes mayores ("blue notes"): **3,6 %** en el resto del corpus, **0,8 %** en solos modales; Hubbard **6,6 %** contra 3,3 %.
  - Terceras mayores sobre acordes menores / escalas dórica, eólica, frigia, locria: **2,9 %** contra **1,1 %** en modal.
  - "While the percentage of these dissonant pitches is in general very low, those dissonances are clearly avoided within modal improvisation."
- **Porcentaje de tonos de acorde en tiempos fuertes**: **no encontrado**. La búsqueda dirigida solo devolvió pedagogía ("chord tones on downbeats", sin porcentaje) y foros que dicen que la regla es una simplificación. El número más cercano es el de BebopNet (2.7): fracción del tiempo en que la nota está en el acorde = 0,50-0,54, y en la escala asociada 0,78-0,83, para ocho solistas bebop (saxos).
- **Pedido para ustedes**: calcular con SQL sobre WJazzD (`melody` + `beats.chord`) el % de notas de acorde en cada posición métrica para solos de `tp`. Es la medida más importante que falta.

### 2.6 Unidades de nivel medio (MLA, Frieler)

- Nueve tipos (libro, cap. "Computational melody analysis"): **line**, **lick** (con subtipos `lick_bebop`, `lick_blues`), **melody**, **rhythm**, **theme**, **quote**, **fragment**, **expressive**, **void**. Una frase empieza una MLU; varias MLU pueden estar en una frase ("glueing").
  - *line*: "a series of tones for the most part proceeding in small, step-sized intervals with high rhythmical uniformity and a salient trajectory in pitch space"; subtipos simple, tick, interwoven, wavy; formas horizontal, ascendente, descendente, cóncava, convexa.
  - *lick*: "a rather short and concise melodic figure that often includes rhythmical and intervallic salience", mayormente notas cortas y a veces saltos grandes y cromatismo; los `lick_bebop` usan notas de aproximación y cromáticas de paso.
  - *rhythm*: notas repetidas regulares u oscilaciones; *void*: "actively playing nothing", claramente más largo que un respiro.
- **Frecuencias**: por **cantidad** (116 solos, 4 412 MLU; Telling a Story): lick **44,3 %**, line **33,5 %**, melody 7,0 %, expressive 4,9 %, rhythm 4,9 %, resto menos de 2 % cada uno. Por **tiempo** (libro): lick ≈ 37 % de la duración, line ≈ 40 %.
- **Dónde caen en el solo** (posición relativa mediana, 0 = inicio, 1 = final): theme **.22**, quote **.33**, void **.38**, rhythm **.62**, expressive **.63**; licks con picos al inicio, medio y final (bi/trimodal). Es decir: lo "relajado" (tema, cita, silencio) va temprano; lo "expresivo" y la repetición rítmica van en la segunda mitad.
- **Fusión** de segmentos en una línea de Bob Berg: la mitad de los segmentos repite el tipo anterior; cromáticos aparecen antes dentro de la línea (posición .45), diatónicos y pentatónicos después (.68 y .64); la mediana de línea es 5,5 segmentos (un solo solista, solo ilustra).

### 2.7 Dramaturgia: cómo se arma el solo

Datos de Frieler et al. 2016 (299 solos, ajuste de curvas cuadráticas):

- **Altura**: solo el 18,8 % de los solos muestra una tendencia no plana (56 solos): 62,5 % de esas ascendentes y 37,5 % descendentes. El 42,1 % no tiene ajuste significativo y el 39,1 % es plano. Convexas (arco) 12,7 %.
- **Intensidad** (sonoridad): 10,1 % con tendencia; entre esas, ~68 % ascendentes. 53 % sin ajuste.
- **Por frase**: **densidad de eventos** tiene 21 ajustes significativos, **17 convexos**, con pico a posición relativa media **0,52** (más o menos la mitad del solo). Otras que suben y bajan: altura media (20 de 28 convexos), entropía de intervalos, entropía métrica.
- **Conclusión de los autores**: no hay un modelo dramático único; las tendencias son débiles. **Inferido**: la regla pedagógica "clímax a 2/3-3/4" **no** se ve en los números (pico de densidad ≈ 0,5); no la impongan como obligatoria.
- **Variación de rango**: en Airegin el rango por frase "disminuye en el medio del solo".

### 2.8 Repetición de motivos y patrones

- **Longitud media de átomo** (Weimar Bebop Alphabet): 2,3 a 2,4 intervalos (Frieler y Zaddach; resultados de búsqueda). Categorías del WBA: diatónico, cromático, aproximación, arpegio, arpegio con salto, repetición, trino, enlace (https://jazzforschung.hfm-weimar.de/wp-content/uploads/2019/06/JazzforschungHeute2019_Frieler-Constructing-Jazz-Lines.pdf , **no pude abrirlo**; datos vía búsqueda).
- **Motivos**: Miles en "Bags' Groove" (take 1) se apoya en dos motivos (resumen de búsqueda de https://vbn.aau.dk/en/publications/miles-davis-bags-groove-take-1-241254; no leído). "Airegin" no tiene momentos de alta expresividad y organiza el solo por homogeneidad (libro, Burkhart).
- **Frecuencia de n-gramas** en WJazzD: patrones de intervalos se minan con MeloSpy (libro, cap. de búsqueda de patrones; ejemplo "The Lick" con 6 instancias en la base). Tasas globales de repetición de n-gramas por solo: **no encontradas**.

### 2.9 Descartado por falta de datos

- Chet Baker, Clifford Brown, Fats Navarro, Lee Morgan, Woody Shaw, Marsalis: solo hay números sueltos para Shaw y Hubbard; para el resto el libro compara por figuras sin valores. Hay que calcularlos con la base.
- Contorno por coro, curva de densidad por coro: solo la de arriba (convexa, pico ~0,5).

---

## 3. Cómo generar líneas interesantes sobre acordes

### 3.1 Impro-Visor (Bob Keller)

- **Categorías de nota sobre un acorde** (diapositivas SMC 2009, https://www.cs.hmc.edu/~keller/jazz/improvisor/SMC2009LearningJazzGrammarsSlides.pdf): "Chord tone (C), Color tone (L, not in chord, but sonorous with it), Approach tone (A, frequently used in jazz), Other ('outside')". Además S = escala, X = arbitraria, H = C o L, R = silencio. Ejemplo del autor: melodía concreta `r8 b8 e+8 d+8 b8 f8 bb8 b8` ↔ abstracta `R8 L8 C8 L8 C8 S8 A8 C8`.
- **Generación**: gramática libre de contexto probabilística para los ritmos (ejemplo del autor: `V2 → X2 (0,2) | X8 X4 X8 (0,8)`), después se llenan las categorías con probabilidades. **Pendientes (slope)** dan el contorno: `(slope 1 5 S8 S8 C4)` = subida entre 1 y 5 semitonos. Se agrupan melodías abstractas en clusters y se usan cadenas de Markov entre clusters para estructura de largo plazo. Con motivos y "motif patterns" es la extensión de Josephy y Keller (https://par.nsf.gov/servlets/purl/10089617).
- **Corpus**: los `.ls` de la sección 1.2. Licencia GPL-2.0.
- **Resultados con números**: el artículo de 2010 (Computer Music Journal 34(3)) reporta comparaciones a ciegas; **no leí los números**.

### 3.2 Modelo de Frieler y Zaddach (2022)

Es lo más cercano a lo que queremos y está medido con oyentes (ver 4.3). Estructura (https://transactions.ismir.net/articles/10.5334/tismir.87):

- Nivel alto: cadena de Markov de MLU, solo **lick** y **line**.
- Dentro de cada MLU: cadena de Markov de primer orden sobre átomos del Weimar Bebop Alphabet.
- Las alturas se ajustan al acorde con teoría acorde-escala (mapeo fijo, escala elegida al azar con pesos).
- Ritmo: cadena de Markov de primer orden sobre cinco clases de IOI, con retoques manuales porque el modelo crudo daba ritmos "too many syncopated, inhomogeneous".
- Todas las probabilidades se estiman de WJazzD.

### 3.3 Reglas bebop y de pedagogía (fuentes pedagógicas, no medidas)

Todo este bloque viene de resúmenes de búsqueda de páginas didácticas, **no es evidencia empírica**:

- Tonos de acorde en tiempos fuertes (1 y 3), notas de paso en los contratiempos; la escala bebop agrega una nota cromática de paso para que los tonos de acorde caigan en el pulso (fuente: https://www.jazz.qld.edu.au/how-to-solo-on-a-jazz-blues-part-3-of-4/ y foros de jazzguitar.be). Varias fuentes advierten que es una simplificación y que Parker usaba también la cuarta en tiempo fuerte.
- **Enclosure** (cerco): nota de acercamiento por encima y por debajo (típicamente un semitono) a un tono objetivo (https://jazzimproviser.com/enclosure-approach-notes-jazz-chromatics).
- **Notas objetivo en cambios de acorde**: guía de voces 3 → 7 (tercera de un acorde a la séptima del siguiente, un semitono). **Inferido**: es lo que Keller llama "chord tone" al llegar al acorde nuevo.
- Hal Crook, Jerry Bergonzi, Jerry Coker: **no pude leerlos**. **Inferido** por lo general de la pedagogía: desarrollo motívico (repetir, secuenciar, desplazar rítmicamente, fragmentar, expandir) y el uso de silencio. Un resumen de búsqueda de una tesis de 2017 sobre saxo (https://digital.library.unt.edu/ark:/67531/metadc1062820/m2/1/high_res_d/FRAILELAINEZ-DISSERTATION-2017.pdf) lista fragmentación, expansión y repetición como procesos de desarrollo motívico distintos.
- **Espacio (Miles)**: análisis web dicen que Miles deja mucho silencio, que los silencios "le dan al oído la chance de recuperarse" (póster de Berkeley https://bailando.berkeley.edu/talks/improVizPoster.pdf). Cualitativo.

### 3.4 Gap-fill, implicación-realización

- Narmour (implication-realization) y Meyer (gap-fill: salto seguido de pasos en dirección contraria): **no leí las fuentes originales**.
- Von Hippel y Huron (2000, Music Perception): la reversión después de un salto **se explica por la tesitura** (los saltos llegan a los extremos del registro y de ahí solo se puede volver), no por una expectativa del oyente; "gap-fill... mere side effects" según resumen de búsqueda (https://labs.sonicfield.org/library/why-do-skips-precede-reversals-the-effect-of-tessitura-on-melodic-structure).
- Consistente con los datos de jazz del tutorial de Frieler: saltos ascendentes raros en registro alto, descenso por pasos ("jump up and trickle down"). **Inferido**: implementar "regresión a la media del registro" en lugar de una regla dura de relleno.

---

## 4. Cómo se evalúan los solos generados

### 4.1 Métricas objetivas de los papers

1. **Coherencia armónica** (BebopNet, https://archives.ismir.net/ismir2020/paper/000132.pdf): "percent of time within a measure where notes match pitches of the scale or the chord being played". Los acordes se toman en forma de séptima (1, 3, 5, 7); la escala por el sistema acorde-escala. Tabla 1 del paper:

| Medida | Adderley | Gordon | Getz | Parker | Rollins | Stitt | Woods | Ammons | BebopNet (visto) | BebopNet (no visto) |
|---|---|---|---|---|---|---|---|---|---|---|
| Chord | 0,50 | 0,54 | 0,53 | 0,52 | 0,52 | 0,53 | 0,50 | 0,54 | 0,53 | 0,52 |
| Scale | 0,78 | 0,83 | 0,81 | 0,80 | 0,81 | 0,83 | 0,78 | 0,83 | 0,82 | 0,81 |

   El mismo paper dice "we do not expect a perfect harmonic match according to pure music rules" por cromatismo, notas de paso y enclosures.
2. **Plagio / novedad** (BebopNet): porcentaje de n-gramas del solo que aparecen en otros solos (se normalizan por transposición); promedio de plagio de BebopNet **3,8**, "within the human plagiarism range"; se calcula también el auto-plagio por artista. (La unidad exacta del 3,8 no queda clara en el texto que leí.)
3. **Entropía del histograma de clases de altura (H1, H4)** (Jazz Transformer, https://arxiv.org/pdf/2008.01307): entropía (en bits, máximo log2 12 ≈ 3,58) del histograma de 12 clases en 1 compás (H1) y en 4 compases (H4). Una tonalidad estable da entropía baja; uso errático da alta. Tabla 2: modelos 2,29/2,45/2,26/2,20/2,17 contra **real 1,94** (H1); 3,12/3,05/3,04/2,91/2,94 contra **real 2,87** (H4). Gap grande = uso inestable de alturas.
4. **Similitud de patrón rítmico (GS, "grooving")** (Jazz Transformer): vector binario de 64 posiciones de compás con onset; `GS(a,b) = 1 - (1/Q) Σ XOR(a_i,b_i)` promediado sobre pares de compases del pieza. Real **0,86**; modelos 0,69-0,76.
5. **Irregularidad de progresión de acordes (CPI)**: % de trigramas de acordes únicos. Real 40,4 %; modelos 72-81 %. No aplica a nuestro solo (el acorde lo damos nosotros), **pero** sirve de control para la canción.
6. **Distribuciones y divergencia** (Yang y Lerch, https://musicinformatics.gatech.edu/wp-content_nondefault/uploads/2018/11/postprint.pdf): sobre cada muestra se calculan rasgos de altura (conteo de alturas, **histograma de clases de altura**, matriz de transición de clases de altura 12×12, rango de altura, intervalo medio) y de ritmo (conteo de notas, **IOI medio**, histograma de duraciones en 12 clases, matriz de transición de duraciones 12×12). Se arma la distribución de distancias **intra-conjunto** (cada muestra contra las demás del mismo conjunto) e **inter-conjunto** (generados contra reales), se estima la densidad con kernel y se compara con **KLD** y **área de solapamiento (OA)**. OA es simétrica y acotada en [0,1] (resumen de búsqueda de la revisión de 2025 https://arxiv.org/pdf/2506.05104). Valor de referencia: OA cercano a 1 = indistinguible de los reales. **No hay valores absolutos publicados para jazz**; hay que calcularlos con las referencias de WJazzD.
7. **Estructura / repetición** (Jazz Transformer): "fitness scape plot" para ver repeticiones a distintas escalas, indicadores SI (structureness). En humanos aparecen repeticiones de 10 a 30 s; el modelo no. **Inferido**: para un solo corto de 8-16 compases usar autosimilitud de intervalos por compás.
8. **Del libro de Jazzomat**: más de 100 rasgos con MeloSpy; Frieler propone cuantificar el solo con histogramas de clases de intervalo difusas, clases de duración, entropías, densidad, sincopa y clases de altura cordales; esos son los rasgos de las tablas de la sección 2. Se pueden usar directamente como vector de referencia.

### 4.2 Qué correlaciona con la opinión humana

- **Frieler y Zaddach 2022** (41 oyentes, 29 expertos, 14 estímulos sobre blues de 12 compases en Fa; https://transactions.ismir.net/articles/10.5334/tismir.87): tres factores explicaron 85 % de la varianza: **MUSICALITY, COMPLEXITY, RHYTHM_EXACT**. MUSICALITY correlaciona con gusto y negativamente con "parece artificial" (r = -0,59). Gusto medio: solos originales de los autores 5,14, solos WJazzD 4,37, MIDI de los autores 3,47, **algorítmicos 3,37**, alumnos 3,29. Los algorítmicos salieron bajos en MUSICALITY, salvo la versión retocada a mano. Detectar el algoritmo: expertos 64,4 %, no expertos 41,7 %.
- **Lo que delata a lo generado**: ritmo demasiado sincopado/inhomogéneo en el modelo crudo y, sobre todo, **la ejecución** (timbre, articulación, microtiming, interacción con la banda): las versiones MIDI de solos humanos se juzgaron "de computadora" aunque las notas eran iguales. **Inferido para nosotros**: la articulación y el volumen por nota pesan tanto como la elección de notas; la humanización (dinámica, ataques, leve adelanto/atraso) cuenta en el jurado auditivo.
- **Jazz Transformer** (59 oyentes, 27 "pros"): escala de 5 puntos en Overall Quality, Impression, Structureness, Richness; el modelo quedó por debajo de humanos en todos, con más brecha en calidad general y estructura. Las métricas objetivas H1/H4/GS/CPI y los SI se eligieron porque reflejan esas fallas, pero el paper **no** reporta correlación estadística entre cada métrica y las notas de los oyentes. **No encontrado** un estudio que correlacione cada métrica con rating humano en jazz.
- **BebopNet**: la métrica de preferencia es aprendida por usuario (4 amateurs) con un dial continuo (CRDI) sobre fragmentos; el propio paper admite que los solos generados "lack ... motif development and variations" y que evaluar la calidad es el cuello de botella. Esto es un **limitante**: ninguna métrica automática capta bien el desarrollo motívico.
- **Otras**: una transferencia de aprendizaje para melodía de jazz usó prueba objetiva + subjetiva con escala Likert de 5 puntos (https://arxiv.org/pdf/1908.09484, no leída).

---

## 5. Reglas para un generador

(Números de la sección 2 y 4; adaptar al tempo de salsa. "Corpus" = WJazzD completo, no solo trompeta.)

- **R01. Mezcla de unidades.** Construir el solo con unidades de dos tipos principales: `lick` (corto, rítmicamente variado, con cromatismo y aproximación) y `line` (pasos con ritmo uniforme y trayectoria clara). Proporción por cantidad ~45 % licks / ~34 % lines; por tiempo ~37 % / ~40 %. El resto (melody, rhythm, expressive) ≤ 7 % cada uno. Fuente: libro, Telling a Story.
- **R02. Abstracto antes que concreto.** Generar primero una melodía abstracta con categorías C (tono de acorde), L (color), A (aproximación), S (escala), X (libre) y R, y recién después concretar las alturas con el acorde vigente, como Impro-Visor. Así la armonía se garantiza por construcción. Fuente: diapositivas de Keller.
- **R03. Notas objetivo en los cambios de acorde.** La primera nota fuerte de cada acorde nuevo es un tono de acorde (preferir 3ª o 7ª; guía de voces por semitono hacia el acorde siguiente). **Inferido** de la pedagogía bebop (sección 3.3); no hay medida empírica.
- **R04. Meta de coherencia armónica.** Apuntar a que ~50-54 % del tiempo sea tono de acorde (1-3-5-7) y ~78-83 % sea nota de la escala asociada. No forzar 100 %: el resto son aproximaciones y color. Fuente: BebopNet Tabla 1 (saxos bebop).
- **R05. Aproximación y enclosure.** Al llegar a un tono objetivo, usar a veces aproximación cromática por debajo, por arriba, o ambas (cerco). Mantener los cromatismos fuera de las notas largas y de los tiempos fuertes. Fuente: pedagogía (jazzimproviser.com) y libro (lick_bebop).
- **R06. Mezcla de intervalos.** ~41 % saltos (>2 st) y ~59 % pasos y repeticiones; repetición de nota ≈ 5 % en general (más en figuras "rhythm", que son ~5 % de las unidades); saltos grandes hacia arriba ≈ 2 %. Fuente: tutorial de Frieler, libro.
- **R07. Saltos hacia arriba, descenso por pasos.** En registro alto pocos saltos; después de un salto grande volver hacia el centro del registro (regresión a la media), no obligatoriamente por pasos. Fuente: tutorial de Frieler; von Hippel y Huron; Meyer/Narmour solo como **inferido**.
- **R08. Largo de frase.** Mediana ~10 notas, entre 3 y 20; frases de menos de 4 notas ≈ 10 %. Poner un respiro (silencio corto) entre frases; reservar el silencio largo ("void") para momentos precisos (posición relativa ~0,4). Fuente: Airegin (un solo solo), Tabla 6; resto **inferido**.
- **R09. Contorno de frase.** Repartir: descendente 38 %, ascendente 20 %, convexa 17 %, cóncava 11 %, horizontal 3-4 %, cortas 10 %. Fuente: Tabla 6 del libro.
- **R10. Densidad.** Promedio ~4,8 notas/s en jazz a ~170 bpm (≈1,7 notas por pulso), ~2,2 notas/pulso en bebop medio (Parker). **Inferido**: para salsa convertir a notas por pulso y no por segundo, y bajar respecto de bebop; trompeta de Hubbard a 114 bpm toca 3,4/s (≈1,8/pulso). Variar la densidad por frase.
- **R11. Sincopa.** ~31 % de las notas en contratiempo en promedio; subir hacia 45 % en frases "calientes". **Inferido**: en salsa la sincopa debe caer sobre la clave (ver R15); 31 % es solo el punto de partida de swing.
- **R12. Notas largas de trompeta.** Más notas muy largas que el promedio (2,9 % contra 1,7 % del resto); usarlas al final de frase y en los puntos de llegada. Fuente: libro.
- **R13. Desarrollo motívico.** Reutilizar un motivo de 3-5 notas por repetición, secuencia (transposición diatónica o cromática), desplazamiento rítmico y fragmentación, antes de pasar a material nuevo; incluir 1-2 citas de tema o "theme" tempranas (posiciones relativas ~0,2-0,35). Fuente: Telling a Story para las posiciones; pedagogía para las operaciones (**inferido**: sin tasas medidas).
- **R14. Curva dramática suave.** Densidad y altura media con forma de arco con pico hacia la mitad (~0,5), unidades "expresivas" y "rhythm" hacia la segunda mitad (~0,62). **No** forzar un clímax a 2/3: no se ve en los datos. Fuente: Telling a Story.
- **R15. Anclar a la clave y al coro (inferido).** Empezar frases en o poco antes de los golpes de la clave, dejar el silencio donde el coro responde, y alinear llegadas a tonos de acorde con el primer compás de cada acorde. No hay datos de solos de salsa para respaldarlo: pedido de `vientos_salsa.md` y criterio propio.
- **R16. Registro.** Centrar en torno a mediana MIDI ~65-69 (sonoro), rango por frase mediana ~13 st, rango total ≤ 2 octavas salvo clímax (Gillespie llega a 3). Subir la altura a la mitad del solo y reducir el rango justo después de un pico. Fuente: Airegin, libro.
- **R17. Humanizar la ejecución.** Varios niveles de dinámica por nota (más fuerte en el tiempo que en el contratiempo), articulación (largo/corto) y microtiming leve. Fuente: Frieler y Zaddach 2022 (las versiones MIDI crudas se reconocen como artificiales).

---

## 6. Medidas para el jurado

Cada medida se calcula sobre un solo generado (lista de notas con tiempo en pulsos, altura MIDI, acorde vigente, fase de clave). "Ref." = valor de la literatura o de la base. Cuando solo hay valor del corpus general, calibrar luego con trompeta de WJazzD usando SQL (1.1).

- **M01. Densidad de eventos.** `notas / segundos` y `notas / pulso`. Ref. corpus 4,8 notas/s; Parker 4,81; Hubbard 3,4; Hawkins ~3,8-4. Aceptar ±30 % del valor objetivo del estilo. Fuente: libro (capítulo de Pfleiderer y Abeßer, Tabla 9) y página de síntesis https://jazzomat.hfm-weimar.de/dbformat/synopsis/solo65.html .
- **M02. Coincidencia con el acorde.** Fracción de tiempo (duración ponderada) con la nota en {1,3,5,7} del acorde. Ref. 0,50-0,54. Fuente: BebopNet Tabla 1.
- **M03. Coincidencia con la escala.** Igual con la escala acorde-escala. Ref. 0,78-0,83. Fuente: BebopNet Tabla 1.
- **M04. Tono de acorde en tiempos fuertes.** Fracción de notas que caen en los pulsos 1 y 3 (o en el inicio de cada acorde) y son tonos de acorde. Ref. **no encontrada**; **inferido**: debería ser claramente mayor que M02 (esperar ≥ 0,65-0,75). Hay que medirla en WJazzD con `melody` + `beats.chord`.
- **M05. Histograma de intervalos difusos (9 clases).** Distribución de las clases de la Tabla 3 del libro. Ref. resumen: saltos (>2 st) 41,4 %; repeticiones ~5 %; salto grande arriba ~2,2 %. Comparar con L1 o área de solapamiento contra el histograma de referencia. Fuentes: tutorial de Frieler, libro.
- **M06. Proporción de repeticiones de nota.** Intervalos 0 / total. Ref. ~5 % (corpus), 12 % trombón. Fuente: libro.
- **M07. Sincopa.** Fracción de notas que empiezan fuera del pulso y se sostienen o superan el siguiente tiempo fuerte (definición exacta de MeloSpy: **no verificada**, usar definición propia coherente y calibrar). Ref. 31 % corpus, 45 % Hubbard/Parker. Fuente: libro.
- **M08. Largo de frase.** Cantidad de notas por frase (frase = grupo separado por silencio ≥ medio pulso, **inferido**). Ref. mediana 10, rango 3-20; frases < 4 notas ≈ 10 %. Fuente: Airegin, Tabla 6.
- **M09. Distribución de contornos de frase.** Mediana de altura del primer 25 %, 50 % central y último 25 %; umbral 10 % del rango; clasificar según Tabla 5. Ref. desc. 38,1 / asc. 20,0 / convexo 17,4 / cóncavo 10,9 / horiz. 3,5 / < 4 notas 10,1 %. Fuente: libro, Tabla 5-6.
- **M10. Rango por frase y total.** Máx-mín por frase; ref. mediana 13 st, entre 3 y 16 (Airegin, solo un solo); ambitus total 24 (Parker) y hasta ~36 (Gillespie). Fuente: libro.
- **M11. Mediana de altura.** Ref. 65,3 corpus; 69-71 trompetistas modernos (Hubbard, Shaw). Fuente: libro.
- **M12. Fracción de notas largas.** IOI "muy largo" relativo al pulso. Ref. trompeta 2,9 % contra 1,7 % del resto. Fuente: libro.
- **M13. Entropía de clases de altura (1 compás y 4 compases).** `H = -Σ p log2 p` sobre 12 clases. Ref. H1 1,94; H4 2,87 en piezas reales de Wu y Yang (otro dominio; **inferido** que ordena igual para solos). Fuente: Jazz Transformer, Tabla 2.
- **M14. Similitud rítmica entre compases (GS).** Vector de onsets en 64 posiciones por compás, media de `1 - XOR/Q` entre pares. Ref. real 0,86 (melodías de lead sheet, no solos puros). **Inferido**: un solo de jazz tendrá GS menor que una melodía de tema; calibrar con WJazzD. Fuente: Jazz Transformer.
- **M15. Dispersión de tipo de unidad (MLU).** Si se anotan las unidades generadas: lick ~44 %, line ~34 %, melody 7 %, rhythm 5 %, expressive 5 %. Fuente: Telling a Story.
- **M16. Curva de densidad por frase.** Ajuste cuadrático de `notas/segundo` por frase; esperar convexo con pico en ~0,5. Ref. 17 de 21 ajustes significativos son convexos, pico medio 0,52. Fuente: Telling a Story.
- **M17. Autosimilitud / desarrollo motívico.** Fracción de n-gramas de intervalos (n = 3-4) que se repiten dentro del solo y fracción compartida con otros solos del corpus (novedad). Ref. BebopNet: plagio medio 3,8 dentro del rango humano; tasas de repetición intra-solo **no encontradas**. Usar para detectar solos sin ningún motivo repetido (M17≈0) o con copia excesiva. Fuente: BebopNet, libro (búsqueda de patrones).
- **M18. Distancia a la distribución real (Yang-Lerch).** Rasgos: histograma de clases de altura, matriz de transición 12×12, histograma de duraciones en 12 clases, IOI medio, rango, intervalo medio, conteo de notas; KLD y OA entre distancias intra e inter conjunto, tomando como conjunto real los solos de trompeta de WJazzD. Ref.: no hay valor absoluto, OA → 1 es mejor. Fuente: Yang y Lerch 2018.
- **M19. Disonancia fuera de la armonía.** Fracción de notas "no diatónicas" respecto al acorde (CDPCX): terceras mayores sobre acordes menores ≈ 1-3 %; terceras menores sobre acordes mayores ≈ 3-4 % (0,8 % en modal; Hubbard 6,6 %). Penalizar valores mucho mayores. Fuente: libro, capítulo estadístico.
- **M20. Humanización (jurado auditivo).** Variación de velocidad y duración por nota y microtiming; sin números de referencia: **no encontrados**. Usar como bandera binaria (hay/no hay variación). Fuente: Frieler y Zaddach 2022.
- **M21. Control de sanidad rítmica (salsa, inferido).** Fracción de ataques que coinciden con golpes de la clave o con pulsos. Sin referencia: definirla con el corpus propio.

---

## 7. Qué no se encontró

- **Porcentaje de tonos de acorde en tiempos fuertes** en solos de trompeta o de jazz en general (solo pedagogía sin cifras). Se calcula con la base: M04.
- **Cualquier corpus abierto de solos de trompeta de salsa, timba o jazz latino** en MIDI/MusicXML.
- **Descarga y licencia de DTL1000.** El sitio no las muestra.
- **Duración de frases en segundos/pulsos y duración de los silencios entre frases** en WJazzD (el libro mide por cantidad de notas).
- **Estudios que correlacionen cada métrica objetiva con rating humano** en solos de jazz; los papers usan ambos por separado.
- **Estadísticas por trompetista** (Clifford Brown, Fats Navarro, Lee Morgan, Chet Baker, Marsalis): solo existen en figuras o no están en el corpus (Marsalis).
- **Dónde guarda el `.db` las unidades de nivel medio (MLU)**: la página de formato no las describe.
- **Contenido de Hal Crook, Bergonzi, Coker, Narmour, Meyer** (libros sin texto abierto); todo lo que se dice de ellos es general o inferido.
- **Texto del PDF de Frieler "Constructing Jazz Lines" (2019)** (conexión rechazada) y de los papers de MINGUS y JazzGAN (no leídos).
- **Un clímax a 2/3-3/4 del solo**: la pedagogía lo sugiere, pero ni la búsqueda ni los números de Frieler et al. lo confirman (pico de densidad ≈ 0,5).
