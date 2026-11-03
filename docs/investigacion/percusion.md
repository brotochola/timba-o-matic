# Investigación de percusión: salsa / timba (grillas de 16 posiciones, dos lados de clave)

Lo verificado en fuentes es poco y está en texto plano. La mayoría de los libros (Mauleón, Uribe, Silverman, Berroa, Fiol, Dreier, el método de Changuito) tienen la notación en imágenes o de pago y no se pudo leer. Cada grilla lleva su etiqueta de origen:

- **[V]** = verificado, leído como texto en la fuente citada y convertido a la grilla de la app.
- **[I]** = inferido por mí. Lo armé con celdas verificadas más convenciones generales, sin cita directa. Usalo como punto de partida, no como dato.
- **no encontrado** = no pude leerlo.

## 0. Cómo leer las grillas y cómo se convirtió

**Conversión de la notación de Kevin Moore (timba.com) a la app.**

- Moore escribe una clave completa como 16 pasos, en 4 grupos de 4. Ejemplo: `3-2 son clave = XooX ooXo ooXo Xooo`.
- Un paso de Moore equivale a 2 posiciones de la app. Cada lado de clave son 8 pasos de Moore, que son 16 posiciones de la app. Es decir, `pos_app = 2 × paso_dentro_del_lado`.
- Con eso la clave sale bien: el son clave lado 3 queda en 0,6,12 y el lado 2 en 4,8. La rumba lado 3 queda en 0,6,14.
- Consecuencia: todo lo que viene de Moore cae en posiciones PARES de la app (resolución de corchea de la app). Las posiciones impares quedan sin información.
- Los patrones de Moore rotulados "(2-3)" tienen el lado 2 en los pasos 0-7 y el lado 3 en los pasos 8-15. Para 3-2 se rotan 8 pasos. Como cada lado se toca igual en 2-3 y en 3-2, la grilla por lado es la misma. Lo que cambia es el orden de los compases.
- Resultado de la conversión: "lado 2" y "lado 3" son dos compases distintos, y cada uno se repite igual sin importar la dirección de la clave.

**Equivalencias.**

- Pos 0 = tiempo 1, pos 4 = tiempo 2, pos 8 = tiempo 3, pos 12 = tiempo 4, pos 14 = el "y" del 4.
- En términos de Moore: `main beats` = pos 0,4,8,12. `frontbeats` = pos 0. `backbeats` = pos 8. `bombo` (paso 3) = pos 6. `ponche` (paso 6) = pos 12.
- Esto choca con la idea de que el ponche cae en 4& (pos 14). Según Moore el ponche está en pos 12, que coincide con el 3er golpe del son clave. El pos 14 es el 3er golpe de la rumba clave. Ver sección 7.

**Notación de las filas.**

- Cada fila tiene 16 caracteres.
- Mayúscula = acento (7-9). Minúscula = medio (4-6). Un dígito en una fila "din" abajo da la dinámica exacta, y 1-3 es fantasma.
- Los símbolos de los trazos están definidos en cada bloque.

**Fuentes que dieron material usable.**

| Cód. | Fuente | Qué aportó |
|---|---|---|
| M3 | Kevin Moore, Beyond Salsa Percussion Vol. 3 (Calixto Oviedo, Timba Gears), PDF promo: https://www.timba.com/page_files/0000/3539/Beyond_Salsa_Percussion_Vol_3-promo.pdf (cuadro "Terminology Reference Chart", p. 29 del libro completo; mismo cuadro en el promo del Vol. 2: https://www.timba.com/page_files/0000/3538/Beyond_Salsa_Percussion_Vol_2-promo.pdf) | Celdas X/o de clave, bombo/ponche, baqueteo, campaneo, contracampaneo, cáscara, tres patadas de timba. Los TOC del Vol. 2 y 3 (https://www.timba.com/page_files/0000/3541/Table_of_Contents--Beyond_Salsa_Percussion_Vol_2.pdf y https://www.timba.com/page_files/0000/3543/Table_of_Contents-Beyond_Salsa_Percussion_Vol_3.pdf) dan los capítulos y páginas |
| ENS | Moore, Beyond Salsa for Ensemble, Vol. 1 (muestra): https://www.timba.com/blog_files/0000/0559/BeyondSalsaEnsemble_Vol1_KevinMoore_Sample.pdf | Glosario de gears, comparación salsa/timba, roles de la sección rítmica |
| BEG | Moore, Beyond Salsa for Beginners (muestra): https://www.latinpulsemusic.com/files/album_pages/beyondsalsabeginners/BeyondSalsaForBeginners_KevinMoore_Sample.pdf | Glosario (p. 224-233), TOC con los ejercicios 3-19 a 3-40 de timbales/patada/redoblante/conga (sin las grillas, que son imágenes) |
| CHG | timba.com, Roots of Timba II, página Changuito: https://www.timba.com/encyclopedia_pages/changuito | Grillas Egües y Changuito (songo), 2-3 rumba clave |
| LLL | timba.com, "Llegué llegué" (Van Van): https://www.timba.com/encyclopedia_pages/llegu-llegu y "La cosa es aprendizaje": https://www.timba.com/encyclopedia_pages/la-cosa-es-aprendizaje | Patada y redoblante de Changuito |
| WTU | Wikipedia "Tumbao": https://en.wikipedia.org/wiki/Tumbao (cita Mauleón 1993 p. 63-64) | Tumbao de conga H T S T H T O O |
| SF | SalsaForums, gears: https://www.salsaforums.com/threads/timba-gears-and-how-to-dance-to-each-of-them-differently.39264/ | Definiciones de gears |
| WTI | Wikipedia "Timba" y "Songo music": https://en.wikipedia.org/wiki/Timba y https://en.wikipedia.org/wiki/Songo_music | Descripción de roles (cita Moore 2010/2011) |

**Lo que NO se pudo leer** (ver "no encontrado" abajo): Mauleón (Salsa Guidebook), Uribe, Silverman, Berroa, Fiol, Dreier ("Timba Groove"), Changuito (método). timba.com no publica gratis las grillas de cuerpo/coro/mambo/presión/bomba/muela de Calixto Oviedo. Están en las imágenes del libro pago Vol. 3.

---

## 1. Celdas base [V] (usadas en todos los estilos)

Fuente M3, cuadro de terminología. Conversión mía. Fila A = lado 2, fila B = lado 3.

### 1.1 Clave
- Son clave lado 3 = `x.....x.....x...` (pos 0,6,12).
- Rumba clave lado 3 = `x.....x.......x.` (pos 0,6,14).
- Lado 2 (ambas) = `....x...x.......` (pos 4,8).

Fuente M3: 3-2 son `XooX ooXo ooXo Xooo`, 3-2 rumba `XooX oooX ooXo Xooo`, 2-3 son `ooXo Xooo XooX ooXo`, 2-3 rumba `ooXo Xooo XooX oooX`.

### 1.2 Cáscara [V]
Fuente M3, "cáscara (2-3) XoXo XXoX XoXX oXoX". Los acentos están subrayados en el original y se perdieron en el texto.

| lado 2 | lado 3 |
|---|---|
| `c...c...c.c...c.` | `c...c.c...c...c.` |

- **Acentos [I]**: acentuar donde coincide con la clave, es decir pos 4 y 8 en el lado 2 (din `8`) y pos 0 y 6 en el lado 3 (din `8`). El resto en `5`. Los golpes sin clave pueden ser fantasma (`3`).
- **Discrepancia**: Soundbrenner https://www.soundbrenner.com/blogs/articles/cascara da una "3-2 cáscara" en corcheas, `X--X--X-|-XX-X--X`. Es distinta de la de Moore, parece más una clave que una cáscara y el propio artículo no marca acentos. La descarto y priorizo a Moore.

### 1.3 Campaneo = campana del bongosero (bongoBell) [V]
Fuente M3: `Xoxo Xoxx Xoxx Xoxx` (campaneo, 2-3). X = acento, x = suave.

| lado 2 | lado 3 |
|---|---|
| `A...a...A...a.a.` | `A...a.a.A...a.a.` |

- A = bongoBell din 8. a = bongoBell din 4.
- **Dato adicional, sin grilla**: el libro de batería "Afro-Cuban Rhythms For Drumset" (https://studfile.net/preview/4164821/page:4/) dice que la campana del bongó marca el lado 2 con una sola nota en el medio de la campana. La grilla está en una imagen.
- **bongoBellC (apagada) [I]**: usarla en las minúsculas de relleno (`a`) para dar contraste. Moore anota en su leyenda "Bongó Bell Open / Heel", pero no hay grilla que diga dónde va cada una.

### 1.4 Contracampaneo = campana de mambo del timbalero (bell) [V]
Fuente M3: `XoXo XXXX oXXX XoXX` (contracampaneo, 2-3).

| lado 2 | lado 3 |
|---|---|
| `X...X...X.X.X.X.` | `..X.X.X.X...X.X.` |

- Es un patrón denso, de golpes parejos. Dinámica no indicada. Propongo `6` salvo los que caen en clave (`8`) [I].
- Moore usa los dos juntos: campaneo (bongó) + contracampaneo (timbalero) = marcha arriba con las dos campanas ("two interlocking bell rides", ENS p. ~20).

### 1.5 Baqueteo (timbal, danzón) [V]
Fuente M3: `XoXo XoXo XoXX oXXo` (baqueteo 2-3).

| lado 2 | lado 3 |
|---|---|
| `b...b...b...b...` | `b...b.b...b.b...` |

(b = timbalH sobre los costados / palito.)

### 1.6 Bombo / ponche [V]
Fuente M3: `oooX oooo oooX oooo` (bombos), `oooo ooXo oooo ooXo` (ponches).

- Bombo = pos 6 en ambos lados. Ponche = pos 12 en ambos lados.
- Un tumbao de bajo o de conga "bombo-ponche" toca 6 y 12 (`oooX ooXo oooX ooXo`).

### 1.7 Patadas de timba [V, dirección no indicada]
Fuente M3, tres filas de la leyenda (los libros traen versiones 2-3 y 3-2 por separado: Vol. 1 ejercicios 3-27 a 3-30, pp. 150-151; la leyenda no dice a qué dirección corresponde la fila).

| patrón | mitad 1 (pasos 0-7) | mitad 2 (pasos 8-15) |
|---|---|---|
| timba marcha estándar `XooX oooo oXoo XoXo` | `K.....K.........` | `..K.....K...K...` |
| marcha Charanga Habanera `XoXo Xooo oooX Xooo` | `K...K...K.......` | `......K.K.......` |
| presión/breakdown estándar `oooo XoXo oooo XoXo` | `........K...K...` | `........K...K...` |

- La mitad 1 de la estándar lleva patada en pos 6 (el bombo). Por eso supongo [I] que la mitad 1 es el **lado 3** y la mitad 2 el **lado 2**. Si fuera al revés, se invierten las dos filas.
- La patada de presión (pos 8 y 12) es igual en ambos lados, así que no depende de la dirección.
- Dinámica: patada `7-8` sobre los golpes de bombo/ponche (pos 6, 12), `5-6` en los demás [I].

### 1.8 Backbeat [V]
Fuente M3, `frontbeats Xooo oooo Xooo oooo`, `backbeats oooo Xooo oooo Xooo`: en la app el redoblante de backbeat cae en pos 8 de cada compás (tiempo 3 de la app) y el frontbeat en pos 0.

---

## 2. Conga: el tumbao con manoteo completo

### 2.1 Una conga [V]
Fuente WTU (Mauleón 1993 p. 63): `1 e & a 2 e & a = H T S T H T O O` (manos L L R L L L R R). Los golpes fuertes ("tonos abiertos") caen en los dos últimos contratiempos del ciclo de dos tiempos. El abierto que coincide con el 3er golpe de la clave es el ponche.

Traducción a la app (los 8 golpes caen en pos 0,2,...,14). h = congaH talón, t = congaH punta, S = congaS, O = congaO.

| | lado 2 y lado 3 |
|---|---|
| golpes | `h.t.S.t.h.t.O.O.` |
| din | `3.2.8.2.3.2.7.8.` |

- El golpe de talón (`h`) y el de punta (`t`) son ambos `congaH` en la app, en dinámica 2-3.
- El slap queda en el tiempo 2 (pos 4). Los abiertos en el 4 (pos 12) y el 4& (pos 14).
- Las dos mitades son idénticas, sin diferencia por lado (clave-neutral).
- **Discrepancia con otras fuentes**: WTU (Wikipedia) dice que "la alineación con la clave es crítica", y que en la variante común se pone un solo abierto en el 3er golpe de la clave más dos tonos antes del lado 3 (Mauleón 1993 p. 63). Sin la grilla de Mauleón no puedo precisar esa variante.

### 2.2 Dos congas y tres congas [I]
Mauleón p. 64 (vía WTU): el "bombo" es un tono abierto en la tumba en el lado 3. Armo [I]:

| | lado 2 | lado 3 |
|---|---|---|
| conga alta (golpes) | `h.t.S.t.h.t.O.O.` | `h.t.S.t.h.t.O.O.` |
| salidor/tumba (low, open) | `................` | `......B.........` (bombo en pos 6) |
| tresdos (tercer tambor, 3 congas) | `............D...` | `......D.....D.D.` |

- B = salidor abierto din 8. D = tresdos abierto din 6.
- En 3 congas, la alta pierde los abiertos de pos 12 y 14 en el lado 3, que pasan al tresdos (las abiertas "se mueven de tambor según el lado").
- Todo esto es mi armado: se apoya en que bombo = pos 6 y ponche = pos 12 [V], pero NO hay grilla leída de dónde van los tonos en 2 o 3 congas. Los ejercicios 3-39 y 3-40 de Moore (BEG, p. 158) son "2-drum conga marcha", pero la grilla es una imagen: no encontrado.

### 2.3 Marcha de conga en la timba (Tomás Cruz) [V descripción, sin grilla]
Fuente WTI y ENS: las marchas de timba son de uno, dos o cuatro claves de largo, a veces compuestas por canción; Tomás Cruz usó más tonos tapados (muff). "Tumbao length: in timba, lengths of one clave are extremely rare; two claves with different rhythm in each" (ENS p. 20). Grilla: no encontrado. Sugerencia [I]: sustituir el slap de pos 4 por `muff` y variar el abierto entre lados (lado 2 usa solo pos 12; lado 3 usa 12 y 14).

---

## 3. Estilo por estilo

Convención: **[V]** si hay celda de Moore detrás, **[I]** si lo armé yo. Donde diga "igual que 1.x", se usa esa grilla.

### 3.1 Son montuno (conjunto, años 40-50)

Fuentes: no encontré grillas de Arsenio Rodríguez. Para el período usé las celdas de Moore y su clasificación de géneros (Vol. 2 TOC: danzón, chachachá, etc.; el son no tiene capítulo propio).

| instrumento | cuerpo | coro/montuno | mambo |
|---|---|---|---|
| clave | 1.1 son | idem | idem |
| conga (una, sin tumba separada) | 2.1 [V] | 2.1 | 2.1 con slap más fuerte [I] |
| bongó martillo | `h.l.h.l.h.l.h.l.` [I] (corcheas alternadas bongoH/bongoL; acentos no encontrados) | campana del bongosero 1.3 [V] | 1.3 [V] |
| timbal / cáscara | no había timbalero estable en el conjunto de son (el glosario: conjunto = trompetas, tres, bongó, sin timbales) | — | — |
| güiro | no encontrado | | |

- BEG, glosario: "conjunto: a group with trumpets, tres (optional), and bongó but not timbales".
- Marcado como **inferido** porque no hay grilla: el bongó cambia a campana en el montuno/coro y vuelve al martillo en el cuerpo. Esa idea sí aparece en los libros de Moore: marcha abajo = cuerpo con cáscara y bongó sin campanas; marcha arriba = coro con dos campanas (ENS p. ~17-18, SF).

### 3.2 Mambo (big band, años 50)

Fuente: Vol. 2 TOC de Moore lista "Danzón / Chachachá / Mozambique" pero no big band. No encontrado.

| instrumento | cuerpo | coro / montuno | mambo (metales) |
|---|---|---|---|
| clave | son (1.1) | son | son |
| conga | 2.1 | 2.1 | 2.1 con macizo [I] |
| bongó | martillo [I] | campana 1.3 [V] | campana 1.3 con más acentos [I] |
| timbal | cáscara 1.2 [V] | cáscara 1.2 | campana de mambo 1.4 [V], con cierre en abanico (sección 6) |
| güiro | no encontrado | | |

- Definición de Moore (ENS/BEG): marcha de mambo = "a gear used for horn mambos, with bells, cymbals and lots of percussion fills". Se aplica igual a mambos de big band.
- En el Vol. 3 la sección de platillos es "Ride Cymbal Accents" (pp. 98-99, sin grilla legible).

### 3.3 Salsa brava (Nueva York, 70s: Fania, Palmieri, Harlow, Colón)

Moore, Vol. 3 intro: "What works for an old-school salsa band playing Ray Barreto covers will definitely not work for a Cuban timba band" y que la salsa no usa patada. No encontré grillas por álbum.

| instrumento | cuerpo (verso) | coro / montuno | mambo |
|---|---|---|---|
| clave | son (1.1) o, menos común, rumba | idem | idem |
| conga | 2.1 [V] | 2.1 [V] | 2.1 con tumba haciendo el bombo (2.2) [I] |
| bongó | martillo [I] | campana 1.3 [V] | campana 1.3 [V] |
| timbal | cáscara 1.2 [V] (a veces solo el borde del timbal bajo) | campana de mambo 1.4 [V] | 1.4 con abanicos y cierres (sección 6) [I] |
| güiro | no encontrado | | |
| batería / patada | ausente | ausente | ausente |

- Moore ENS p. 20: "In salsa, the bass is often clave-neutral while the piano has a very formulaic style of marking the clave"; la clave rumba es mucho menos común en salsa que en timba; "kick drum: the one critical difference".
- Cambio de campana: el timbalero pasa de cáscara a campana de mambo en el coro. En el cuerpo el bongosero hace martillo y el timbalero cáscara; esta división está en BEG/ENS (marcha abajo: "cáscara and usually bongó, no bells").
- Mano izquierda del timbalero en el lado 2: **no encontrado en texto**. En timbal bajo se suele tocar el tono bajo (palo o mano) en el lado 2; es dato general no verificado aquí [I].

### 3.4 Salsa de los 90 (romántica: Gilberto Santa Rosa, Marc Anthony)

No encontré grillas. Fuentes sobre la sección rítmica de la salsa de los 90 no son accesibles gratis. Postura [I]: la sección rítmica es la de salsa brava (3.3) con tempos más lentos y menos relleno; cuerpo con cáscara más suave y conga con más tonos tapados; platillo del timbalero en 4& para las anticipaciones.

| instrumento | cuerpo | coro | mambo |
|---|---|---|---|
| conga | 2.1 con `muff` en lugar de `h/t` en pos 2,6 [I] | 2.1 | 2.1 + 2.2 [I] |
| bongó | martillo [I] | 1.3 [V] | 1.3 [V] |
| timbal | cáscara 1.2 [V] | campana de mambo 1.4 [V] | 1.4 + abanico [I] |
| platillo (plato) | `plato` en pos 14 del lado 2 como marca de anticipación [I] | idem | idem |

(Todo marcado como inferido: ninguna fuente leída trata este subgénero.)

### 3.5 Songo (Los Van Van, Changuito)

Fuente CHG (timba.com, Roots of Timba II, Changuito) y LLL. Las filas de timba.com son 16 pasos sobre **2-3 rumba clave** y usan `0` = golpe, `x` = silencio. En conga `0` = tono grave, `o` = tono agudo. Conversión mía: A = lado 2, B = lado 3.

**Parte original de Blas Egües (primer LP de Van Van) [V]**

| instrumento | lado 2 | lado 3 |
|---|---|---|
| clave rumba `xx0x 0xxx 0xx0 xxx0` | `....x...x.......` | `x.....x.......x.` |
| guagua `0xxx` ×4 | `x.......x.......` | `x.......x.......` |
| patada `0xxx xxxx xxxx xxxx` | `K...............` | `................` |
| aro del redoblante (rim) `xxxx 0xx0 xx0x xxxx` | `........r.....r.` | `....r...........` |
| tonos de conga `xxx0 xxox xxx0 xxox` | grave pos 6, agudo pos 12 | grave pos 6, agudo pos 12 |

(Guagua = el patrón de cuatro tiempos en bell/block; en la app: `bell` o `block`.)

**Songo con las alteraciones de Changuito [V]** (CHG: "Songo groove with Changuito's alterations")

| instrumento | lado 2 | lado 3 |
|---|---|---|
| guagua `0xxx` ×4 | `x.......x.......` | `x.......x.......` |
| patada `xxx0 xxxx xxx0 xxxx` | `......K.........` | `......K.........` |
| rim `x00x x0x0 x00x xxxx` | `..r.r.....r...r.` | `..r.r...........` |
| tonos de conga `xxxo ox00 0000 xxoo` | agudo pos 6 y 8; grave pos 12 y 14 | grave pos 0,2,4,6; agudo pos 12 y 14 |

- La alteración de Changuito de la patada es "xxx0 xxxx xxxx xxxx" (solo el primer bombo) como segunda versión posterior (CHG, tercera grilla).
- La patada en pos 6 ("bombo") es la diferencia de fondo: la patada de Egües marca el 1; la de Changuito marca el bombo.

**Otro songo, "La cosa es aprendizaje" (Formell, Changuito, 2-3 clave)** [V, LLL https://www.timba.com/encyclopedia_pages/la-cosa-es-aprendizaje]: `xKxx xKSx xxxK xxxx` = patada (K) y redoblante (S).

| instrumento | lado 2 | lado 3 |
|---|---|---|
| patada | `..K.......K.....` | `......K.........` |
| redoblante | `............S...` | `................` |

Sobre "Llegué llegué": las grillas del sitio (https://www.timba.com/encyclopedia_pages/llegu-llegu) tienen la fila de patada/redoblante, pero está dañada en el texto extraído; la grilla 3 (songo, 2-3 rumba) da patada `x0xx xxxx xxxx xxxx` = solo pos 2 del lado 2. Sin dinámicas en ninguna fuente.

**Patrón de platillo/mano derecha**: WTI (Wikipedia, citando Moore 2010 y Santos 1985) dice que la mano derecha toca los cuatro tiempos principales en charles cerrado, bloque o campana, y la izquierda toca los contratiempos en aro, redoblante, campanas o toms. Patrón de campana de mano derecha [I]: `X.......X.......` (tiempos 1 y 3 de la app) en cualquier lado. Sin grilla leída.

Videos nombrados por esa fuente (no vistos): Changuito "Songo Patterns on Drum Kit" https://www.youtube.com/watch?v=PzYXM8j7NTA y Ignacio Berroa "Basic Songo for Drum Kit" https://www.youtube.com/watch?v=idmkvI55THY.

**Resumen para el generador, songo**: cuerpo y coro usan la grilla de arriba (patada en 6, rim en 2,4,10,14 del lado 2 y 2,4 del lado 3, guagua en 0 y 8); el mambo suma campana/cáscara estilo 1.2 [I].

### 3.6 Timba (NG La Banda, Charanga Habanera, Pupy, Manolito Simonet)

**Los gears de Moore** (seis grupos, TOC del Vol. 3: Marcha abajo cap. 1, Marcha arriba cap. 2, Marcha de mambo cap. 3, Muela cap. 4, Presión cap. 5, Bomba cap. 6). **Despelote no es un gear de percusión en Moore**: el glosario de BEG lo define como el baile sin pareja ("non-couple dancing...") que se hace en los gears sin tumbao de bajo; el texto de SalsaForums lo nombra solo como nota de baile. Para despelote no hay patrón de batería: no encontrado.

Definiciones citables:
- **Marcha abajo = cuerpo (verso)**: cáscara y casi siempre bongó, sin campanas (ENS glosario p. 17-18; BEG glosario p. 229).
- **Marcha arriba = coro**: dos campanas entrelazadas, tumbao de bajo estable y marcha de conga estable (ENS glosario p. 18).
- **Marcha de mambo = mambo de metales**: campanas, platillos y mucho relleno (BEG glosario p. 229).
- **Presión**: caída dramática; el bajo se calla o toca pedales, y la marcha de conga y las campanas se retiran (BEG glosario, ENS; SF). Wikipedia (citando Moore 2011:127): empieza de golpe, sube, con patrón funky de Calixto.
- **Muela**: baja intensidad; el cantante interactúa con el público (SF, WTI).
- **Bomba**: batería funk intensa; el bajo reemplaza el tumbao con deslizados y golpes (SF, WTI). Es el único gear en que Moore dice explícitamente "full funk mode".
- **Masacote**: gear sin tumbao de bajo, con marcha de conga (BEG glosario). Vol. 3 ejercicio 5-19: "Masacote in the Style of Yulién Oviedo / Charanga Habanera".

Grillas por gear. Las filas de **[V]** salen de las celdas de la sección 1; el resto **[I]**.

| gear | clave | conga | bongó | timbal / campanas | batería |
|---|---|---|---|---|---|
| marcha abajo (cuerpo) | rumba o son, en jamblock/claves (Moore: en timba es más probable que se toque la clave) | marcha de 2 claves [no encontrado]; usar 2.1 con `muff` [I] | martillo [I] o campana [V 1.3] | cáscara 1.2 [V] | patada estándar 1.7 [V] (o Charanga Habanera, ver abajo); `hhC` corcheas en pos 0,4,8,12 [I]; redoblante: backbeat pos 8 [V 1.8] más fantasmas `2` [I] |
| marcha arriba (coro) | idem | 2.1 / 2.2 [V/I] | campaneo 1.3 [V] | contracampaneo 1.4 [V], con campaneo, ver 4.2 | patada estándar [V], `rim` o `snare` en pos 8, `hhC`/`ride` [I]; "Calixto's Hihat Stomp Style" (Vol. 3 p. 78): hhP, sin grilla |
| marcha de mambo | idem | 2.1 | 1.3 [V] | 1.4 [V] más platillos `rideBell` en 4 y `crash` en 1 de cada 4 compases [I] | patada estándar; "Ride Cymbal Accents" (Vol. 3 p. 98) sin grilla; `ride` en pos 0,4,8,12 [I] |
| presión | idem | cae (la marcha se retira) | cae | cae | patada presión 1.7 (pos 8 y 12 ambos lados) [V]; `rim`/`snare` en pos 8 [V 1.8]; funky de Calixto (Vol. 3 pp. 128-141, 18 ejercicios): no encontrado |
| bomba | idem | marcha continua [Moore: sí] | no encontrado | no encontrado | batería funk completa (Vol. 3 pp. 145-157): no encontrado; esquema funk [I]: `K` pos 0 y 6 (lado 3) o 2, 8 (lado 2), `snare` pos 8, `hhC` corcheas |
| muela | idem | baja intensidad, tonos tapados [I] | cae [I] | bell suave 1.4 con dinámica 3 [I] | patada reducida: pos 0 solo [I]; `hhC` sutil |
| despelote | no es gear de percusión | | | | no encontrado |

**Detalle para la patada de timba:** "Kick Drum Sellos of Different Bands" (Vol. 3 p. 38, Chart 3 pp. 38 y "Common Marcha abajo Kick Drum Patterns"): el sello es la patada característica de cada banda, y por eso hay más de una. Las dos que están en el texto de la leyenda M3: la estándar y la de Charanga Habanera (sección 1.7).

**Los Que Son Son (Pupy)**: BEG lista "2-3 / 3-2 Los Que Son Son kick & snare" (3-33 a 3-34, p. 154) y "ghost snare" (3-35 y 3-36, p. 155), sin grilla legible: no encontrado. Solo se sabe que se usan redoblante fantasma.

**Dreier / Timba Groove, Piloto, Berroa, Uribe**: no encontré grillas citables. No inventar.

---

## 4. Bongó

### 4.1 Martillo (cuerpo) [I]
Sin grilla en las fuentes leídas. Martillo = corcheas continuas alternando mano (bongoH / bongoL). Moore: "the principal time-keeping pattern of the bongó" (BEG glosario, p. 229). Acentos: variables.

| | lado 2 y lado 3 |
|---|---|
| golpes | `h.l.h.l.h.l.h.l.` |
| din | `4.4.5.4.4.4.5.4.` [I] |

### 4.2 Campana (coro/mambo) [V]
Ver 1.3 (campaneo de Moore). Cambia a campana en el coro: en marcha arriba "both timbalero and bongosero play bell rides" (ENS glosario p. 18).

- Variante con bongoBellC (apagada) en las notas suaves [I].
- La campana de mano ("hand bell, bongó bell") es el campaneo; el timbalero toca el contracampaneo (BEG glosario: contracampana = campana plana montada, "martillo" en un uso).

---

## 5. Timbales

### 5.1 Cáscara [V]
Ver 1.2. Va en el cuerpo, con bongó. Moore: marcha abajo "cáscara, no bells".

### 5.2 Campana de mambo (contracampaneo) [V]
Ver 1.4. Se usa en el coro y mambo.

### 5.3 Campana cha-cha (cha bell) [I]
BEG glosario (p. 224-233): "cha bell: a small higher-pitched bell, usually mounted on the timbalero's stand (campana de...)". La grilla ("Basic Güiro and Cha Bell Patterns for Danzón Mambo Sections (2-3 Clave)", Vol. 2 p. 44) es imagen: no encontrado. Propuesta [I]: `bellC` en pos 0,4,8,12 como pulso constante; el lado 3 con pos 6 suave. No verificar contra fuente.

### 5.4 Mano izquierda en el lado 2 y timbal bajo [no encontrado]
El libro de Moore (Vol. 2, ejercicios de baqueteo y cáscara) trata los timbales completos pero no hay texto legible. Convención general [I]: en el lado 2 la mano izquierda puede tocar `timbalL` (bajo) en pos 4 y 8 (sobre la clave de 2 lados) con la derecha sobre cáscara.

### 5.5 Abanico y rellenos [descripción V, grilla no encontrada]
Glosario de Moore (BEG p. ~224): "abanico: a special timbal figure used to introduce a new section; originated in danzón". Vol. 2 cap. 1: "The Abanico" y "Common Abanico Patterns" (p. ~60-62), con "Paseo to Danzón Bell with Abanicos and Llamada" (ejercicio 1-12, p. 62). Grilla: no encontrado. Propuesta [I]: al final del lado 3 antes de un cambio de sección, `timbalH`/`timbalL` alternados en pos 8-14 con crescendo (din 3 a 8) y `plato` o `crash` en la pos 0 del compás siguiente.

---

## 6. Güiro

| | cuerpo | coro / mambo |
|---|---|---|
| lado 2 y lado 3 | `guiroL` en pos 0 y 8, `guiroS` en 4, 12 [I] | igual, más seguido [I] |

- Moore Vol. 2 (TOC): "Basic Güiro Pattern for Danzón A-section (3-2 clave)" p. 43 y "Basic Güiro and Cha Bell Patterns for Danzón Mambo Sections (2-3)" p. 44. Las grillas son imágenes: no encontrado.
- ENS: "The Role of the Güiro in Efectos" (p. 63), sin grilla.
- BEG 3.x ejercicio 2-1 "güiro time-keeping pattern" (p. 71): sin grilla.
- Vale solo para charanga/danzón/chachachá y para timba tipo charanga; en salsa brava y timba de metales no hay güiro [I].

---

## 7. Anticipaciones, cierres y transiciones

- **Ponche / bombo [V]**: bombo en pos 6, ponche en pos 12, ambos lados (M3 `bombos`, `ponches`). El ponche coincide con el 3er golpe del son clave (pos 12); en rumba clave el 3er golpe es pos 14. Para el generador: el 4& (pos 14) es el 3er golpe de la rumba clave y el punto donde piano/bajo se adelantan al compás siguiente. Moore marca el "pickup" del bajo en las grillas de LLL ("La cosa es aprendizaje": `xxxx xxxx xxx0 0x0x`, pasos 11, 14 y 15 = lado 3, pos 6, 12 y 14), así que en esas grabaciones la anticipación cae en pos 12 y 14, no solo en 14.
- **Platillo del timbalero en 4& [I]**: marcar la anticipación con `plato` o `crash` en pos 14 del compás previo al cambio. La cita para la idea del ponche es M3; para el plato, ninguna fuente leída: inferido.
- **Bloque / cierre / efecto (definición V)**: ENS glosario p. 18: "a rhythmic figure played by all or part of the rhythm section during a gear already in progress, or to connect two gears" (sinónimos: bloque, break, punches, cierre). La entrada de "efecto" dice que un efecto es un corte opcional y un bloque uno obligatorio. Grillas de bloques de ejemplo: el "Efecto 15" de ENS (p. ~21) sale como `oXXo oooo oooo ooXo` / `oXoo XooX oooo X-X-xx` en 2-3 y `oooo ooXo oXoo XooX` / `oooo X-X-xx Xooo oooo` en 3-2. No dice qué instrumento lo toca. Las filas del original son la clave más la figura; no se puede separar de forma fiable qué es clave y qué es el efecto, así que no la convierto.
- **Abanico**: ver 5.5.
- **Entrada de presión/muela**: Moore, "Muela Entry Bloques" (Vol. 3 p. 113); grillas: no encontrado.
- **Cómo marca la percusión una transición [I]**: crash en pos 0 del compás nuevo, patada en pos 0, y la última corchea del compás anterior (pos 14) con abanico en timbal.

---

## 8. Resumen: no encontrado / pendiente de libro

- Marcha de conga de timba de 2 claves de Tomás Cruz (grilla).
- Martillo del bongó (acentos), güiro, cha bell, mano izquierda del timbalero, abanicos.
- Cuerpo/coro/mambo/presión/bomba/muela de Calixto (están en Vol. 3, pp. 35-157, imágenes).
- Patrones de la salsa brava por álbum; de la salsa de los 90.
- Despelote como patrón.
- Dreier "Timba Groove", Giraldo Piloto, Berroa, Uribe, Silverman, Fiol, Mauleón: ningún acceso gratuito a la notación.

---

## 9. Las 10 diferencias entre estilos que el generador tiene que reproducir

1. **Patada (kick):** ausente en son montuno, mambo, salsa brava y salsa 90s; indispensable en timba y songo (Moore ENS p. 20: "the one critical and extremely important difference is the presence of an independent kick drum part"). En songo marca el bombo en pos 6 (Changuito) en vez del 1 (Egües).
2. **Batería completa vs. timbales:** timba y songo usan redoblante/rim, charles y platillos; los estilos de salsa solo usan timbales y campanas.
3. **Tumbao de conga:** salsa usa la marcha estándar `h.t.S.t.h.t.O.O.` (clave-neutral); la timba usa marchas de 2 claves con distinto ritmo por lado y más tonos tapados.
4. **Cuerpo vs. coro:** cuerpo = cáscara + martillo, sin campanas (marcha abajo); coro = campaneo en el bongó + contracampaneo en el timbal (marcha arriba). Es el cambio de textura más claro de la timba y de la salsa.
5. **Mambo:** campanas, platillos y relleno (marcha de mambo). En salsa brava se agrega abanico y cierre; en timba aparecen ride/crash y patada.
6. **Presión y muela:** presión retira la marcha de conga y las campanas y deja patada en pos 8 y 12; muela baja la intensidad. Salsa y songo no tienen estos gears.
7. **Bomba y masacote:** sin tumbao de bajo; batería funk. Exclusivos de timba.
8. **Clave:** en salsa domina el son clave; en timba la rumba clave es mucho más común y a menudo se toca la clave en jamblock (ENS p. 20).
9. **Ponche:** pos 12 (ambos lados), bombo en pos 6; en timba se anticipa con patada en bombo/ponche, en salsa con el bajo y el piano.
10. **Güiro y chachachá:** el güiro queda para charanga, danzón, chachachá y timba tipo charanga; no entra en salsa brava ni en timba de metales. El timbal pasa a campana de mambo en el coro.
