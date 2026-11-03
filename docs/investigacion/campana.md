# Campana del bongó y contracampaneo: golpes, patrones y sonido

Para timba-o-matic (`motor/07_percusion.js` e `index.html`). Solo investigación: no toqué ningún archivo del proyecto. Fecha: 2026-10-31.

## 0. Resumen (lo que importa)

1. **Por qué suenan igual.** En la ruta por defecto (SoundFont GeneralUser GS) las cuatro voces (boca y talón de la campana del bongó, campana y talón del timbal) son la misma muestra: GM 56, de 110 ms. Solo cambian el `rate` (1.12 el bongó, 1.0 el timbal), la ganancia (el talón es 1.5 dB más bajo que la boca) y una `dur` que no hace nada porque la zona tiene una release de 3.85 s. Resultado medido: la campana del bongó queda 2 semitonos MÁS AGUDA que la del timbal (563 Hz contra 503 Hz), al revés de lo que dice Moore (la campana del bongó es la más grave de las tres). En el pack incluido las dos campanas están en la misma nota (470 Hz contra 459 Hz, unos 40 cents).
2. **Qué distingue a los golpes (fuentes).** Dos ejes: dónde se pega (parte más ancha = sonido grave; parte más estrecha = agudo) y si se aprieta la campana con los dedos (cerrado) o no (abierto). Moore anota dos timbres por campana ("open" y "heel of bell") para las tres campanas (bongó, timbal, cha-cha). La campana del bongó es la más grave de las tres campanas; la del timbal, más fina y aguda; la cha-cha, la más aguda.
3. **Los patrones del motor están bien.** El campaneo y el contracampaneo de Moore coinciden posición por posición con el corpus MIDI del proyecto (95 temas con lado de clave seguro): GM 56 es "boca en el 1 y el 3" en el 68 % de los compases; "El gran varón" (Willie Colón) toca el campaneo exacto en los dos lados; GM 68 toca el contracampaneo exacto (lado 3 `..x.x.x.x...x.x.`, lado 2 `x...x...x.x.x.x.`) en 12 temas (aparece en 18-20); y en 5 temas el talón del bongó va en una nota aparte (agogó) en las posiciones de talón de Moore (4, 6, 12, 14 en el lado 3; 4, 12, 14 en el lado 2; exactas en 3 de los 5). Lo que falta no es el ritmo: es que el talón y la campana del timbal no suenan distinto.
4. **Números para implementar.** Idea: la identidad de la campana es la altura (bongó 420 Hz < timbal 630 Hz < cha-cha 1 kHz o más) y la identidad del golpe es el decaimiento y el brillo (boca: -20 dB a ~120 ms; talón: -20 dB a ~35 ms, centroide ~2 veces más alto, 5 dB menos de energía). Recetas medidas más abajo para SoundFont (6.1), VCSL (6.2) y síntesis (6.3).
5. **Secciones.** El bongosero toca bongó (martillo) en los versos y en los solos de piano, y agarra la campana al entrar el montuno. En el corpus (49 temas con parte de bongó): 159 entradas de campana, 84 % arrancan en el tiempo 1, en 55 % de los casos no hay bongó en el compás anterior y solo en 8 % hay un relleno de más de 4 golpes.

**Límite grande:** el cupo de WebSearch del turno ya estaba agotado (200 búsquedas compartidas), así que no pude buscar. Usé WebFetch solo sobre URLs que ya conocía (timba.com, latinpulsemusic, Wikipedia, studfile, GitHub) y mucha medición en disco. No encontré entrevistas (Dandy Rodríguez, Roena, Ray Romero) ni texto de Uribe, Mauleón, Spiro, Díaz o Sanabria. Si querés esa parte, hay que mandar un mensaje de seguimiento (o subir `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`).

## 1. Etiquetas y archivos de trabajo

- **[V]** leído en la fuente (URL). Las citas vienen tal cual las devolvió WebFetch.
- **[C]** medido en el corpus MIDI del proyecto (95 temas con lado de clave seguro), con scripts de solo lectura.
- **[A]** medido por mí en audio (FFT) sobre muestras reales.
- **[D]** decisión de diseño mía, apoyada en lo anterior.
- **[M]** de memoria o práctica común, sin fuente leída: hipótesis, a probar de oído.

Archivos de trabajo (todo en el scratchpad, nada ejecutado desde carpetas descargadas): `campana_scripts\` (scripts Node propios: `sf2dump.js`, `analyze.js`, `render.js`, `synth.js`, `corpus_*.js`), `campana_vcsl\` (muestras VCSL, CC0), `campana_gm\` (muestras sacadas de `GeneralUser-GS.sf2`), `campana_pack\` (mp3 del pack, decodificados), `campana_render\` (pruebas), `campana_corpus\` (salidas del corpus), `campana_pdfs\` (PDF de Moore).

## 2. Por qué suenan igual hoy (con números)

| Ruta | boca (`bongoBell`) | talón (`bongoBellC`) | campana timbal (`bell`) | talón timbal (`bellC`) |
|---|---|---|---|---|
| SoundFont GeneralUser GS (la de por defecto) | GM 56, rate 1.12, g .40 | GM 56, rate 1.12, g .28 | GM 56, rate 1.0, g .42 | GM 56, rate 1.0, g .30 |
| Pack incluido (mp3 embebidos, VCSL) | Cowbell1_Hit v2/v3/v4 (f1 470 Hz) | Cowbell1_Muted v2/v3 | Cowbell2_Normal v2/v3 (f1 459 Hz) | Cowbell2_Muted v2/v3 |
| Menú VCSL | Cowbell1_Hit_v3 | sin entrada: cae al sintetizador | Cowbell2_Normal_v2 | sin entrada: cae al sintetizador |
| Menú GM FluidR3 | GM 56, rate 1.12 | sin entrada: cae al sintetizador | GM 56 | sin entrada: cae al sintetizador |
| Sintetizador | 2 cuadradas 420+640 Hz, pasa-banda 700 Hz Q1, cae en .20/.35 s | lo mismo con vel×0.7 | 2 cuadradas 540+800 Hz, pasa-banda 820 Hz Q.9, cae en .18/.32 s | lo mismo con vel×0.7 |

[A] sobre `GeneralUser-GS.sf2` (preset 128/0 "Standard", tecla 56, instrumento "Accessory Drums 2"):

- La muestra "Cowbell" tiene 4831 muestras a 44.1 kHz = 110 ms, sin loop. Raíz 61, coarse -2, fine -1: sonando la tecla 56 a `rate` 1 se reproduce a 0.6672 de velocidad. El parcial más fuerte de la muestra cruda (751 Hz) sale a 501 Hz.
- Con los `rate` actuales: bongó 1.12 → f1 563 Hz; timbal 1.0 → f1 503 Hz. Medido sobre el render con la misma cuenta que hace `SF2.voice()`.
- `SF2.drum(...)` recibe `dur = max(.3, d*2)` (0.5-0.9 s según la voz). Esa `dur` solo dispara la release, que en esta zona es 3.85 s (constante de tiempo 0.35 s en la app): no apaga nada. Y la muestra termina sola a los 0.15-0.17 s. Por eso el talón solo se distingue por 1.5 dB menos (`sqrt(.28/.4)`) y por los dígitos del patrón.
- En el pack los tres niveles de velocidad de la boca son de verdad VCSL Hit v2/v3/v4 (+4 y +10 dB), pero las dos campanas tienen la misma altura, y los talones (Muted) sí se distinguen por brillo.
- Aparte: el importador de MIDI de `index.html` (`GM_APP`) manda GM 56 y GM 68 a la misma voz `bell` y GM 67 a `bongoBell`; en el corpus GM 56 casi siempre es la boca del bongó y GM 68 casi siempre el contracampaneo (o el talón del bongó), así que un MIDI importado junta la boca y el contracampaneo en un solo sonido.

## 3. Los golpes

### 3.1 Qué dicen las fuentes

- [V] Moore, leyenda de notación de Beyond Salsa Percussion: "Group 2: Instruments with 2 Timbres ... open bell / heel of bell", y en la lista de sonidos: "Timbal Bell Heel / Timbal Bell Open / Bongó Bell Heel / Bongó Bell Open / Cha Bell Open / Cha Bell Heel". O sea: cada campana tiene exactamente dos timbres, abierta y talón. https://www.timba.com/page_files/0000/3539/Beyond_Salsa_Percussion_Vol_3-promo.pdf (misma leyenda en https://www.timba.com/page_files/0000/3538/Beyond_Salsa_Percussion_Vol_2-promo.pdf).
- [V] Moore, glosario de Beyond Salsa for Beginners (pp. 224-233): campana = "the hand bell or bongó bell; the lowest of the three common bells of salsa and timba"; bongosero = "plays bongó (and also the hand bell in most genres)"; contracampana / mambo bell = "a long flat bell mounted on the timbalero's stand"; cha bell = "a small higher-pitched bell, usually mounted on the timbalero's stand". https://www.latinpulsemusic.com/files/album_pages/beyondsalsabeginners/BeyondSalsaForBeginners_KevinMoore_Sample.pdf
- [V] Wikipedia en español, "Cencerro (instrumento musical)": "El sonido grave se practica percutiendo el instrumento con la baqueta en la parte más ancha del cencerro"; "El sonido agudo se consigue golpeando la baqueta en la parte más estrecha"; "Para conseguir los sonidos cerrados hay que hacer cierta presión sobre el instrumento con los dedos índice y corazón"; abierto = sin presionar; cuatro sonidos: agudo abierto, agudo cerrado, grave abierto, grave cerrado; efecto de rebote (dejar rebotar la baqueta) y de redoble (meter la baqueta dentro del cencerro y moverla contra las paredes). En Cuba "la persona que toca los bongos, a menudo, alterna los dos instrumentos". https://es.wikipedia.org/wiki/Cencerro_(instrumento_musical) (WebFetch no mostró citas para esa parte: tomarlo como descripción general, no como cita de un bongosero).
- [V] Wikipedia en inglés, "Cowbell (instrument)": las campanas sin badajo se golpean con palo, "the tone being modulated by striking different parts of the bell and by damping with the hand holding the bell". https://en.wikipedia.org/wiki/Cowbell_(instrument) (esa sección está marcada sin fuentes; la frase se apoya en https://www.playmusic123.com/blogs/news/cowbell-and-cowbell-onic-comparison, que dice: sostenida por el extremo angosto la campana suena libre; sostenida por el medio, suena muerta).
- [V] "Afro-Cuban Rhythms For Drumset" (copia de texto en studfile; el autor no figura en la página). Bongó: "the bongocero plays a cowbell called campana or bongo bell. This cowbell has a wider, thicker bell with a 'fatter' lower sound. Played with a short, round piece of wood, the mouth and middle of the bell are played, producing two different sounds"; la boca lleva el tiempo fuerte; "on the 2-part of the clave only one note is played on the middle of the bell. This is your key to where the 2-part of the clave falls". Timbal: el mambo bell es "a long, wide, lowpitched bell" (comparado con la cha-cha), va montado "perpendicular to the player", "Played with timbale sticks, the stick strikes across the middle of the bell", "During louder sections the mambo bell is played". Mezcla de campanas: "The higher-pitched, thinner-sounding bell can play the mambo bell pattern while the lower-pitched, fatter-sounding bell plays the bongo bell pattern"; "The mouth of the mambo bell is too thin and the body of the bongo bell is too low-sounding"; hay campanas con "wide mouth and a clear high-pitched body". https://studfile.net/preview/4164821/page:4/ ; cha-cha: "a straight quarter-note feel which is not played to clave", https://studfile.net/preview/4164821/page:5/ ; songo: "the bongo bell (downbeats 1 and 3) and mambo bell (syncopated with lots of upbeats)", https://studfile.net/preview/4164821/page:6/
- [V] Wikipedia, "Timbales": en la era del mambo (años 40) los timbaleros empezaron a montar cencerros en los timbales; Changuito, en los 70 con Los Van Van, "developed the technique of simultaneously playing timbale and bongo bell parts". https://en.wikipedia.org/wiki/Timbales
- [V] Wikipedia, "Bongó" (es): el cencerro cuelga de una cuerda atada a la pierna del bongosero sentado, con los bongós a los lados. https://es.wikipedia.org/wiki/Bong%C3%B3 ; en inglés, Salsa music y Son montuno lo llaman "large hand held cowbell".

### 3.2 Tabla de golpes (con lo que cada fuente permite afirmar)

| Golpe | Voz en la app | Cómo se toca | Cómo suena | Volumen típico | Evidencia |
|---|---|---|---|---|---|
| Boca, abierta (Moore: Bongó Bell Open; Malabe: "mouth"; es.wiki: grave abierto) | `bongoBell` | Palo corto y redondo de madera en la parte más ancha (la boca, [D]); la campana floja, sin apretar | El sonido más gordo y grave de la campana y el que más resuena. En cencerros reales (VCSL Hit): parcial grave dominante (470 Hz), -20 dB a 70-118 ms, -40 dB a ~0.3 s, centroide 0.55-1.2 kHz | El más fuerte; marca el 1 y el 3 | [V] + [A] |
| Talón (Moore: Bongó Bell Heel; Malabe: "middle", [D] el mismo golpe; es.wiki: agudo) | `bongoBellC` | Parte más estrecha / cerrada (el talón), muchas veces con la mano que sostiene apoyada | Más agudo y más seco. En cencerros reales con golpe apagado (VCSL Muted): centroide 1.9-4.2 kHz (2-4 veces el de la boca), parcial grave 0-16 dB más flojo, -20 dB a 54-84 ms | Más suave: 0.4-0.85 de la boca en la velocity de las transcripciones MIDI (corpus); ver 4.1 | [V] + [A] + [C] |
| Cerrado (apretado con índice y mayor) | no existe (podría ser `bongoBellM`) | Cualquiera de los dos sitios, con presión | Casi sin resonancia, "tuk" | Fantasma | [V] es.wiki; uso exacto en salsa: [M] |
| Redoble / rebote | relleno | Palo adentro de la campana, o palo que rebota | Zumbido / roll | Fuerte, en transiciones | [V] es.wiki; uso exacto: [M] |
| Campana del timbal, abierta (Moore: Timbal Bell Open) | `bell` | Palos de timbal, el palo cruza el medio de la campana larga y plana | Más aguda y fina que la del bongó, resuena | Acento en tiempos y notas de clave | [V] |
| Campana del timbal, talón (Moore: Timbal Bell Heel) | `bellC` | Parte trasera / estrecha | Más seco y corto; en los VCSL Cowbell2 Muted el parcial grave sigue pero domina uno de 2.3 kHz | Contratiempos | [V] que existe; el resto [A]/[D] |
| Cha-cha bell (abierta / talón) | no existe | Campana chica en el soporte del timbalero | La más aguda; en negras, sin clave | Parejo | [V] Moore y studfile p. 5 |

Qué NO cierran las fuentes: qué parte del palo (punta u hombro), la diferencia exacta de altura entre boca y talón, y si el "heel" de Moore es el extremo estrecho o el golpe con la mano apoyada. Con es.wikipedia la lectura más probable es "talón = parte estrecha = más agudo", y los VCSL reales (golpe apagado con el parcial dominante mucho más arriba) apuntan en el mismo sentido. Esa es la dirección que uso en 6.1-6.3; el tamaño del salto (+3 a +7 semitonos) es [D].

## 4. Patrones (formato de la app: 16 caracteres por compás, dígito = fuerza 1-9; A = lado 3, B = lado 2)

### 4.1 Campaneo (campana del bongó)

Base de Moore (ya está en el motor). [V] Moore, cuadro de terminología: campaneo (2-3) `Xoxo Xoxx Xoxx Xoxx`. El cuadro no define la x minúscula; se lee como golpe suave / talón, y el corpus lo respalda: en los temas que ponen el "segundo tono" de la campana en otra nota, esa nota cae justo en las x minúsculas.

```
lado 3 (A)  bongoBell  : 9.......8.......   boca en 1 y 3
            bongoBellC : ....6.4.....6.4.   talón en 2, 2&, 4, 4&
lado 2 (B)  bongoBell  : 9.......8.......
            bongoBellC : ....6.......6.4.   talón en 2, 4, 4& (sin 2&)
```

Evidencia del corpus [C]:

- GM 56 es `x.......x.......` (boca en 1 y 3) en 68 % de los 2730 compases lado 3 y 68 % de los 2780 lado 2 (48 de 57 temas con campana). Es la columna vertebral.
- El campaneo completo aparece exacto en "Willie Colon - El gran varon" (lado 3 `x...x.x.x...x.x.`, lado 2 `x...x...x...x.x.`, 59 compases cada uno) y, con boca y talón en la misma nota 56, en Yumbambe (el patrón del lado 3 en los dos lados, 77 y 78 compases).
- El talón en otra nota: en 1165.mid, 1117.mid, 1025.mid, Celia Cruz "Que le den candela" y Oscar D'Leon "Mi bajo y yo" el talón va en un agogó (GM 67 o 68) en `....x.x.....x.x.` (lado 3) y `....x.......x.x.` (lado 2): las posiciones de talón de Moore. En "Mi bajo y yo" hay tres campanas en tres notas: 56 boca (vel 127), 68 talón (107) y 67 contracampaneo (97).
- Volumen del talón respecto de la boca (velocity MIDI media): Yumbambe boca ~100, talón en el 2 y el 4 = 37-46, en los empujes 2& y 4& = 61-64; Marc Anthony "Que precio tiene el cielo": 100 contra 50; Celia Cruz 99-102 contra 75-84; Oscar D'Leon 127 contra 107. Rango 0.4-0.85; no hay regla de acentos entre los talones (Yumbambe acentúa los empujes; Celia Cruz, los tiempos). Los dígitos actuales (6/4) están en el rango; conviene humanizar con ±15 %.

Variaciones (qué evidencia tiene cada una):

```
V1 solo bocas [C] 68 % de los compases del corpus: arranque del coro, bajar energía
  A y B  bongoBell  : 9.......8.......
         bongoBellC : ................

V2 cuatro negras [C] Lloraras (45-56 % de sus compases), Mambo All Stars "Perfidia", Sanz "Esto es amor"
  A y B  bongoBell  : 9...7...8...7...
         bongoBellC : ................

V3 talones de Yumbambe [C] empujes más fuertes que los tiempos 2 y 4
  A      bongoBell  : 9.......8.......
         bongoBellC : ....3.6.....3.6.
  B      bongoBell  : 9.......8.......
         bongoBellC : ....4.5.....3.6.     (Yumbambe toca el 2& también en el lado 2)

V4 octavos corridos para el mambo [M]/[D], no verificado: boca en los 4 tiempos, talón en los contratiempos
  A      bongoBell  : 9...7...8...7...
         bongoBellC : ..4...6...4...5.
  B      bongoBell  : 9...7...8...7...
         bongoBellC : ..4...4...4...5.
```

Cómo se varía a lo largo de un tema (resumen): [V] la campana del timbal "se toca en las partes fuertes" y la variación de campana o la cáscara (en el medio de la campana) se usa en los solos de timbal o conga (studfile p. 4); [V] Moore: marcha arriba = dos campanas entrelazadas, marcha de mambo = campanas, platillos y muchos rellenos; [M] subir densidad con el tema (V1 → base → V4) y cerrar cada 4 u 8 compases con un redoble o rebote (ver 5). "Changuito's Doubler Bell Pattern" (tocar a la vez la campana del timbal y la del bongó) figura en el índice del Vol. 3 de Moore (cap. 2) sin la grilla a mano. https://www.timba.com/page_files/0000/3543/Table_of_Contents-Beyond_Salsa_Percussion_Vol_3.pdf

### 4.2 Contracampaneo (campana del timbal)

[V] Moore: contracampaneo (2-3) `XoXo XXXX oXXX XoXX`. En el motor ya están como `bell`:

```
lado 3 (A)  bell  : ..6.9.6.9...9.6.     posiciones 2 4 6 8 12 14
lado 2 (B)  bell  : 9...9...9.6.9.6.     posiciones 0 4 8 10 12 14
```

Corpus [C]: GM 68 toca exactamente esas formas, `..x.x.x.x...x.x.` en el lado 3 (36 % de 1915 compases, aparece en 18 temas) y `x...x...x.x.x.x.` en el lado 2 (38 % de 1978 compases, 20 temas); en 12 temas son la forma dominante de los dos lados: 1026, 1148, Cantante, Conciencia, Le temes, Cheo Feliciano "Los entierros", Gilberto Santa Rosa "Dejame sentirte", Hector Lavoe "Rompe saraguey", Ismael Rivera "Las caras lindas", Ruben Blades "Buscando guayaba", La India "Seduceme" y Tito Nieves "Le gusta que la vean". En 4 temas (El Gran Combo "Aguacero", Tito Rodriguez "El que se fue", Oscar D'Leon en la nota 67, y Abuso solo en el lado 3) las dos formas vienen con los lados cambiados: existen las dos convenciones; la de Moore es la mayoritaria.

Separar en abierta (9) y talón (6) usando los dígitos que ya tiene el motor [D]:

```
lado 3 (A)  bell  : ....9...9...9...     abierta en 2, 3, 4
            bellC : ..6...6.......6.     talón en 1&, 2&, 4&
lado 2 (B)  bell  : 9...9...9...9...     abierta en 1, 2, 3, 4
            bellC : ..........6...6.     talón en 3&, 4&
variante: abierta también en la nota de clave (2&, lado 3)
lado 3 (A)  bell  : ....9.7.9...9...
            bellC : ..6...........6.
```

### 4.3 Cómo encajan las dos campanas

Posiciones con el patrón de Moore:

| Lado | Campana del bongó (boca B / talón t) | Campana del timbal | En común | Solo bongó | Solo timbal |
|---|---|---|---|---|---|
| 3 | B0 t4 t6 B8 t12 t14 | 2 4 6 8 12 14 | 4 6 8 12 14 | 0 (la boca del 1) | 2 (el 1&) |
| 2 | B0 t4 B8 t12 t14 | 0 4 8 10 12 14 | 0 4 8 12 14 | nada | 10 (el 3&) |

Cinco de seis golpes caen juntos en los dos lados: lo que hace que se oigan dos partes no es el ritmo sino el timbre. En el lado 3 el 1 es solo de la campana del bongó y el 1& es solo del timbal (ahí está el "entrelazado"). La división de roles es [V] studfile p. 6 ("bongo bell on downbeats 1 and 3, mambo bell syncopated with lots of upbeats") y Wikipedia Salsa music ("The interlocking counterpoint of the timbale bell and bongo bell provides a propelling force during the montuno", https://en.wikipedia.org/wiki/Salsa_music). Con las alturas de 6.0 (bongó 420/530 Hz, timbal 630/795 Hz) cada golpe doble suena como una campana grave más una aguda.

### 4.4 Otras campanas

- Cha-cha bell (chachachá, charanga) [V]: negras, sin clave: `9...7...9...7...` en los dos lados, en una voz más aguda que `bell` (hoy el motor usa `bell` para `negras`).
- Songo [V]: la campana del bongó sigue en 1 y 3; la del timbal, a contratiempo (studfile p. 6). La grilla exacta del timbal no está en el texto.
- Salsa brava, salsa de los 90, son montuno: en el corpus no cambia el esqueleto (boca en 1 y 3 en Celia Cruz, Cheo Feliciano, Hector Lavoe, Ismael Rivera, Rubén Blades, Gilberto Santa Rosa, Jerry Rivera, Marc Anthony, Tito Nieves, Trío Matamoros). Timba: Moore, mismo campaneo/contracampaneo en marcha arriba. Diferencias entre estilos: [M].

## 5. Cambios de sección

- [V] Bongó en versos y solos de piano; campana al entrar el montuno: "the bongos play primarily during the verses and the piano solos" y "When the song transitions into the montuno section, the bongo player picks up a large hand held cowbell called the bongo bell"; también "plays the bell more during a piece than the actual bongos". https://en.wikipedia.org/wiki/Salsa_music
- [V] Arsenio Rodríguez: su bongosero tocaba el cencerro grande "during montunos (call-and-response chorus section)". https://en.wikipedia.org/wiki/Son_montuno ; https://es.wikipedia.org/wiki/Bong%C3%B3
- [V] Moore: marcha abajo (cuerpo) = cáscara y casi siempre bongó, sin campanas; marcha arriba (coro) = las dos campanas, bajo y conga estables; marcha de mambo = campanas, platillos y muchos rellenos; presión = caen bajo, marcha de conga y campanas. https://www.timba.com/blog_files/0000/0559/BeyondSalsaEnsemble_Vol1_KevinMoore_Sample.pdf y el glosario de Beginners
- [C] Corpus: 49 temas tienen bongó (60/61) y campana (56). En esos temas hay 159 tandas de campana de 4 o más compases que empiezan después de compases sin campana; duran 28 compases en promedio. La campana entra en el tiempo 1 en 133 casos (84 %), en el 2 en 12 (8 %). En el compás anterior no hay bongó en 88 casos (55 %), hay martillo suelto (4 golpes o menos) en 58 (36 %) y hay relleno (más de 4) en 13 (8 %). En 49 casos (31 %) hay un solo golpe de campana en el compás anterior, en el 1 (19), el 3 (11) o el 4 (12). Cuando termina la tanda, el bongó vuelve enseguida en 74 de 153 casos (48 %). Las transcripciones pueden haber dejado afuera los rellenos.
- [V] Para el relleno de entrada: redoble con la baqueta dentro de la campana y rebote (es.wikipedia, Cencerro). El cambio de mano (soltar el bongó y agarrar la campana) lo hace el bongosero en el compás previo: [M]. En charanga no hay bongó (Wikipedia Salsa music), como ya tiene `DE_ESTILO.charanga`.

Para el motor [D]: entrar con la boca en el 1 del primer compás del coro; en 3 de cada 10 entradas, un golpe de boca suelto en el compás anterior (1, 3 o 4); relleno de bongó solo en 1 de cada 12; en el mambo, V4 (octavos) y un redoble en el último compás de cada frase.

## 6. Diseño de sonido

### 6.0 Idea

- Identidad de la campana = altura: bongó (la más grave) < timbal < cha-cha (la más aguda) [V Moore, Malabe].
- Identidad del golpe = decaimiento y brillo: boca = grave, abierta, larga; talón = más agudo, seco, corto; cerrado = muerto.
- Retícula de alturas propuesta [D]: bongó boca 420 Hz, bongó talón 530 Hz, timbal boca 630 Hz, timbal talón 795 Hz, cha-cha 1050-1500 Hz. Separaciones de 3 a 4 semitonos entre vecinos y 7 entre las dos bocas.

### 6.1 (a) SoundFont GeneralUser GS / GM

Muestra GM 56 cruda (a velocidad 1): parciales en Hz (dB respecto del más fuerte): 751 (0), 855 (-14), 1582 (-16), 2082 (-13), 2317 (-4), 3353 (-14), 5334 (-17), 6285 (-14). La app la reproduce a 0.6672 de velocidad: 501 (0), 570 (-14), 1055 (-16), 1389 (-13), 1546 (-4), 2237 (-14), 3559 (-17), 4193 (-14). Cae 10 dB a 57 ms y 20 dB a 117 ms (a velocidad neutra); la muestra dura 165 ms.

Altura según `rate` (se multiplica por el 0.6672 de arriba): f1 = 501 × rate. 0.70 → 351 Hz, 0.80 → 401, 0.84 → 421, 0.89 → 446, 1.00 → 501, 1.12 → 561, 1.26 → 631, 1.33 → 666, 1.59 → 797, 1.68 → 842.

Recetas probadas offline (re-muestreo cúbico + pasa-altos de 4.º orden, o sea dos `BiquadFilter` "highpass" en serie con Q 0.707 + corte exponencial `exp(-(t-corte)/constante)`; mismo nivel de entrada) [A]:

| Voz | rate | f1 | Filtro | Corte (mantiene / constante) | -20 dB | Centroide 40-200 ms | Energía |
|---|---|---|---|---|---|---|---|
| hoy `bongoBell` | 1.12 | 563 Hz | no | no | 94 ms | 1.22 kHz | -25.0 dB |
| hoy `bell` | 1.00 | 503 Hz | no | no | 108 ms | 1.08 kHz | -24.5 dB |
| `bongoBell` (boca) | **0.84** | **421 Hz** | no | no | 122 ms | 0.90 kHz | -23.7 dB |
| `bongoBellC` (talón) | **1.06** | 530 Hz (parcial fuerte 1.64 kHz) | pasa-altos 650 Hz | 26 ms / 12 ms | 38 ms | 1.80 kHz | -29.1 dB (-5.4) |
| `bell` (boca) | **1.26** | **631 Hz** | no | no | 92 ms | 1.38 kHz | -25.5 dB |
| `bellC` (talón) | **1.59** | 797 Hz (parcial fuerte 2.46 kHz) | pasa-altos 900 Hz | 20 ms / 10 ms | 32 ms | 2.73 kHz | -30.3 dB (-4.8) |

Las bocas quedan a 7 semitonos entre sí (bongó más grave); el talón tiene un tercio del largo y el doble de centroide. Sin filtro (solo corte) el talón del bongó queda en 534 Hz de parcial fuerte y centroide 1.07 kHz: más "tonk" que "tik"; la versión con pasa-altos es la que sigue la medición de los VCSL apagados. Ganancia: no hace falta bajar `g0` del talón, la receta ya pierde 5 dB de energía; el acento va por los dígitos (5-6 en los talones, no menos de 4).

Notas de código para esta ruta: `SF2.drum(...)` no tiene filtro ni corte, hay que agregar dos opciones (pasa-altos y un `rel` que reemplace la release de la zona, 3.85 s). Cambiar solo los `rate` de la tabla `GM`/`SFX` (0.84 / 1.06 / 1.26 / 1.59) ya separa las alturas sin tocar código (sin filtro ni corte el talón queda como el "tonk"). Ojo: esos `rate` valen para GeneralUser; la tabla `GM` también la usa el modo FluidR3, con otra muestra que no medí.

Otras notas GM del kit "Standard" medidas [A]:

| Tecla | Muestra | Sonido | Uso |
|---|---|---|---|
| 68 Low Agogo | "Agogo" 144 ms, raíz 72, ×1.0 | f1 1047 Hz, parcial fuerte 4402 Hz, centroide 4.4-4.7 kHz, -20 dB a 116 ms | cha-cha bell (rate 1.0); a rate 0.5: f1 524 Hz, picos 2.2 y 3.6 kHz, centroide 2.4 kHz, 287 ms, vidrioso |
| 67 High Agogo | misma muestra, coarse +10 → ×1.3348 | f1 1396 Hz, parcial fuerte 5876 Hz, centroide 6.0-6.6 kHz | cha-cha más aguda |
| 53 Ride Bell | 80012 muestras a 28 kHz, release 48 s | resuena casi 3 s | no sirve |
| 75 Claves, 76/77 Wood Block, 37 Side Stick, 80/81 Triángulo | golpes secos | | no son campanas; solo como "tuk" extra para el cerrado (no medido) |

### 6.2 (b) VCSL

Repositorio: https://github.com/sgossner/VCSL (CC0). Carpetas con campanas (cantidad de archivos): `Idiophones/Struck Idiophones/Cowbells` (13), `Agogo Bells` (5 + 10 en Legacy), `Hand Bells, Nepalese` (3), `Anvil` (9), `Hand Chimes` (19), `Sleigh Bells`, `Tubular Bells`, `Bell Tree`, `Triangles`, más secos: `Claves`, `Woodblock`. Los números `v2/v3/v4` son capas de velocidad (el pico sube 4 y 10 dB). Solo hay un round robin (`rr1`), micrófono `Mid`.

Cowbells medidos [A] (44.1 kHz; pico en dBFS; parcial fuerte; centroide 2-40 / 40-200 ms; tiempo a -20 / -40 dB desde el pico):

| Archivo | Pico | Parcial fuerte (Hz) | Centroide (Hz) | -20 / -40 dB (ms) | Para |
|---|---|---|---|---|---|
| Cowbell1_Hit_v2 | -27.0 | 469 | 1196 / 1029 | 70 / 297 | boca del bongó |
| Cowbell1_Hit_v3 | -23.1 | 468-472 | 940 / 935 | 118 / 301 | boca del bongó |
| Cowbell1_Hit_v4 | -13.1 | 471 | 556 / 560 | 110 / 271 | boca del bongó, la más "gorda" y oscura |
| Cowbell1_Normal_v2 | -26.6 | 694 | 923 / 756 | 144 / 291 | boca del timbal (más aguda) |
| Cowbell1_Normal_v3 | -12.1 | 690 | 938 / 869 | 46 / 259 | boca del timbal; el 690 cae rápido (T60 0.12 s) |
| Cowbell1_Muted_v2 | -19.5 | 1833 (552 a -16 dB) | 2294 / 2719 | 54 / 273 | talón del bongó |
| Cowbell1_Muted_v3 | -11.6 | 559 (+1.83 kHz a -6 dB) | 1957 / 1916 | 84 / 287 | talón del bongó |
| Cowbell2_Normal_v2 | -17.1 | 459 | 772 / 706 | 90 / 249 | boca del timbal (subida de velocidad) |
| Cowbell2_Normal_v3 | -8.1 | 457-460 | 525 / 572 | 88 / 212 | boca del timbal (subida) |
| Cowbell2_Muted_v2 | -23.0 | 2336 (462 a -1 dB) | 3698 / 3103 | 62 / 263 | talón del timbal |
| Cowbell2_Muted_v3 | -10.0 | 2335 (459 a -4..0 dB) | 4181 / 3377 | 60 / 257 | talón del timbal |
| Cowbell2_Double_v2 / v3 | -15.6 / -11.0 | 448-478 | 1445-2394 | 70-104 / ~311 | dos golpes seguidos: flam, relleno, "doubler" |
| Agogo_High_v2 | -29.6 | 1508 (y 6836) | 6014 / 3780 | 116 / 403 | cha-cha bell |
| Agogo_Low_v2 | -28.3 | 1047 (T60 1.8 s) | 4782 / 2000 | 245 / 758 | cha-cha bell (hay que apagarla) |

Cómo se mueve el espectro entre abierto y apagado [A]: Cowbell1 Hit → Muted: el parcial dominante pasa de 470 a 1833 Hz (v2) o aparecen 1833 / 2183 / 2950 / 4720 Hz casi al nivel del grave (v3); centroide 0.56-1.2 kHz → 1.9-2.7 kHz. Cowbell2 Normal → Muted: el grave (458 Hz) se queda pero 2336 Hz pasa a 0 dB y aparecen 1285, 3830, 3980, 4520, 4900 y 6900 Hz; centroide 0.53-0.77 → 3.1-4.2 kHz. Ojo: estas muestras apagadas siguen sonando hasta -40 dB a ~0.26 s; un talón con la mano encima de verdad corta mucho más.

Recetas VCSL (el reproductor de la app corta en `dmax` con un fade lineal de 40 ms, así que `dmax` hace de apagador) [A]/[D]:

| Voz | Archivo | rate | f1 resultante | dmax | Medido |
|---|---|---|---|---|---|
| `bongoBell` | Cowbell1_Hit_v4 (o v3) | 0.89 | 417 Hz | 0.45 s | v4: centroide 0.49 kHz, -20 dB a 82 ms, -40 dB a 307 ms; v3: centroide 0.8 kHz, -20 dB a 134 ms |
| `bongoBellC` | Cowbell1_Muted_v3 | 0.89 | 494 Hz, fuertes 1.63 y 1.94 kHz | 0.10 s | centroide 1.4-1.7 kHz, -20 dB a 52 ms, -40 dB a 90 ms |
| `bell` | Cowbell2_Normal_v3 (o Cowbell1_Normal_v3 a rate 1.0, f1 690 Hz) | 1.36 | 624 Hz | 0.40 s | centroide 0.74-0.97 kHz, -20 dB a 64 ms |
| `bellC` | Cowbell2_Muted_v3 | 1.36 | 615-623 Hz + brillo 3-6.6 kHz | 0.09 s | centroide 4.5-5.4 kHz, -20 dB a 44 ms |

Hoy la tabla `VM` solo tiene `bongoBell` y `bell`; `bongoBellC` y `bellC` no tienen entrada y caen al sintetizador. Capas de velocidad: usar v2 para suave, v3 normal, v4 (solo Cowbell1_Hit) para acento.

### 6.3 (c) Síntesis (Web Audio)

Parciales de cencerros reales [A] (relación con f1; dB respecto del más fuerte; T60 estimado):

| Cencerro / golpe | f1 | Parciales (ratio:dB) |
|---|---|---|
| VCSL Cowbell1 Hit | 470 Hz | 1:0 (T60 0.45 s), 2.11:-8 (0.66), 3.0:-16 (0.60), 3.6:-18, 3.85:-10 (0.54), 5.4:-12 (0.65), 7.4:-17 (0.62) |
| VCSL Cowbell2 Normal | 459 Hz | 1:0 (0.27), 2.06:-12, 2.55:-18, 2.80:-21, 3.13:-22, 3.68:-22, 5.09:-18, 6.28:-19, 9.0:-20 |
| VCSL Cowbell1 Muted | 559 Hz | 1:0, 1.39:-4 (0.69), 3.28:-6 (0.22), 3.90:-3 (0.30), 5.27:-5, 6.26:-14, 8.47:-8 (0.51), 11.4:-9 |
| VCSL Cowbell2 Muted | 458 Hz | 1:0 (0.42), 2.80:-9, 3.14:-9, 3.68:-4, 5.10:0, 5.51:-7, 8.36:-6, 8.68:-7 |

No hay medición publicada de una campana de bongó o de mambo bell concreta que yo haya leído; los dos cencerros son los de VCSL (modelos sin identificar). Las alturas de la campana del bongó (420 Hz) y del timbal (630 Hz) son [D] a partir del orden de Moore.

Recetas modales (suma de senos con caída exponencial por parcial; clic de ruido de 4 ms) [A]/[D]. Cada fila: ratio:dB:T60 en segundos. Las medí renderizadas:

| Voz | f1 | Parciales | Clic | Resultado medido |
|---|---|---|---|---|
| `bongoBell` boca | 420 | 1:0:.45, 2.11:-8:.60, 3.0:-16:.55, 3.85:-10:.50, 5.4:-12:.55, 7.4:-17:.50 | -24 dB | centroide 0.7-1.0 kHz, -20 dB a 160 ms |
| `bongoBellC` talón | 530 | 1:-3:.14, 1.39:-4:.15, 3.28:-6:.10, 3.9:-3:.10, 5.27:-5:.10, 8.47:-8:.08 | -14 dB | -20 dB a 44 ms, centroide 0.7-1.3 kHz, 7.9 dB menos de energía que la boca |
| `bell` boca | 630 | 1:0:.28, 2.06:-12:.35, 2.55:-18:.30, 2.8:-21:.30, 3.13:-22:.30, 3.68:-22:.30, 5.09:-18:.30, 6.28:-19:.25 | -24 dB | -20 dB a 96 ms, centroide 0.8-1.1 kHz |
| `bellC` talón | 795 | 1:-3:.12, 2.8:-9:.12, 3.14:-9:.10, 3.68:-4:.10, 5.1:0:.10 | -14 dB | -20 dB a 36 ms, centroide 1.9-2.7 kHz, 7.2 dB menos de energía que la boca |

Versión barata (3 senos + clic, sin probar): boca = 1, 2.1, 3.9 con T60 .45/.55/.5; talón = 1, 1.39, 3.9 con T60 .14/.15/.10 (f1 = la altura del talón).

Lo que hay hoy: `bell` = cuadradas 540 + 800 Hz (ratio 1.48) por pasa-banda 820 Hz; es el timbre clásico de cencerro electrónico (TR-808) [M: esos dos números son de memoria, no los leí en una fuente], con solo dos parciales y un único decaimiento. El talón es el mismo sonido con vel×0.7. Si se quiere mantener ese carácter con el mismo esquema de dos cuadradas [D, sin probar]: multiplicar las dos frecuencias por la retícula de 6.0: bongó boca 420+640, talón 530+800; timbal boca 630+950, talón 795+1200; pasa-banda en 1.65 veces la frecuencia baja; caída de la boca .35 s y del talón .08 s.

### 6.4 Cómo apaga cada ruta

- Pack (`PACK`): campos `rate`, `dur`, `gain` del manifest; `dur` corta con 30 ms de fade. Hoy bongoBell {rate 1, dur .4}, bongoBellC {1, .25}, bell {1, .5}, bellC {1, .25}. Propuesta: rate .89 / .89 / 1.36 / 1.36 y dur .45 / .10 / .40 / .09.
- VCSL y GM FluidR3 (`PERC`): `dmax` corta con 40 ms de fade; faltan las entradas de `bongoBellC` y `bellC`. La muestra FluidR3 de cowbell es otra que la de GeneralUser; no la medí.
- SoundFont (`SF2.drum`): ver 6.1.
- Sintetizador: tabla 6.3.

Orden sugerido [D]: (1) un `rate` distinto por voz (cero riesgo); (2) partir el patrón de `bell` en `bell` y `bellC` (4.2); (3) apagador y pasa-altos para el talón en la ruta SoundFont; (4) entradas VCSL/GM para `bongoBellC` y `bellC`; (5) cha-cha bell con agogó (6.1) para el patrón `negras`.

## 7. Para probar de oído

1. Primero solo los `rate` de 6.1 (cero código): ¿se oyen dos campanas distintas en el coro?
2. Boca contra talón sola con el patrón V1 + base: ¿el talón se oye "tik" y no "ploc"? Si suena demasiado agudo, bajar el salto de +4 a +3 semitonos.
3. Cambiar el pasa-altos del talón entre 650 y 900 Hz, y la caída entre 12 y 18 ms.
4. Con las dos campanas juntas (marcha arriba): ¿se separan el 1 y el 1& del lado 3?
5. Comparar la receta de síntesis (6.3) contra la de VCSL (6.2).

## 8. No encontrado / pendiente

- Entrevistas y métodos: Dandy Rodríguez, Roena, Ray Romero, Uribe, Mauleón, Spiro, Díaz, Sanabria: sin acceso (sin cupo de búsqueda; los libros son de pago).
- Qué parte del palo se usa en cada golpe; el tamaño del salto de altura entre boca y talón en una campana real; la grilla de Malabe para el lado 2 (una sola nota en el medio) y la del "Changuito's Doubler Bell Pattern".
- Mediciones de una campana de bongó o mambo bell real de LP: no encontradas.
- Patrones propios de salsa de los 90 y timba frente a salsa brava: en el corpus son iguales; diferencias por estilo [M].

## 9. Fuentes

- Moore, leyenda de notación y cuadro de terminología (campaneo, contracampaneo, X/o): https://www.timba.com/page_files/0000/3539/Beyond_Salsa_Percussion_Vol_3-promo.pdf ; https://www.timba.com/page_files/0000/3538/Beyond_Salsa_Percussion_Vol_2-promo.pdf
- Moore, glosario de Beyond Salsa for Beginners: https://www.latinpulsemusic.com/files/album_pages/beyondsalsabeginners/BeyondSalsaForBeginners_KevinMoore_Sample.pdf
- Moore, Beyond Salsa for Ensemble (marcha arriba, efecto): https://www.timba.com/blog_files/0000/0559/BeyondSalsaEnsemble_Vol1_KevinMoore_Sample.pdf
- Moore, índice del Vol. 3 (Campaneo, Contracampaneo, Playing Both Bells at Once, Changuito's Doubler Bell Pattern): https://www.timba.com/page_files/0000/3543/Table_of_Contents-Beyond_Salsa_Percussion_Vol_3.pdf
- "Afro-Cuban Rhythms For Drumset" (texto en studfile): https://studfile.net/preview/4164821/page:4/ , page:5/ , page:6/
- Wikipedia: https://es.wikipedia.org/wiki/Cencerro_(instrumento_musical) ; https://es.wikipedia.org/wiki/Bong%C3%B3 ; https://en.wikipedia.org/wiki/Salsa_music ; https://en.wikipedia.org/wiki/Son_montuno ; https://en.wikipedia.org/wiki/Timbales ; https://en.wikipedia.org/wiki/Cowbell_(instrument)
- Cencerro, agarre y apagado: https://www.playmusic123.com/blogs/news/cowbell-and-cowbell-onic-comparison
- VCSL (CC0): https://github.com/sgossner/VCSL ; árbol de archivos: https://api.github.com/repos/sgossner/VCSL/git/trees/master?recursive=1
- Medido en local: `GeneralUser-GS.sf2` (preset 128/0), mp3 del pack dentro de `index.html`, corpus MIDI (`analisis_tumbaos\motor`, 95 temas con lado de clave seguro), salidas en `campana_corpus\`.
