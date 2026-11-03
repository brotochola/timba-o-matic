# De Nirvana a la timba: cómo se versiona un tema de rock

Notas del 3 de noviembre de 2026, escritas para la demo «Litio» ([canciones/litio.json](../../canciones/litio.json)): los acordes de «Lithium» de Nirvana (*Nevermind*, 1991) en timba. El criterio sirve para cualquier tema de rock que se le parezca: power chords, un verso suave y un estribillo fuerte, y un puente que da vueltas sobre dos acordes. Como en las otras notas, cada afirmación lleva su fuente; lo que es deducción propia dice **inferido** y lo que se buscó y no apareció, **no encontrado**.

La canción toma de Nirvana la armonía y la forma. No lleva ni la melodía ni la letra (la app no tiene voz).

## 1. Qué hacen los que versionan

- **La Charanga Habanera, «No estamos locos»** (un tema de Ketama, rock flamenco español). Según timba.com, la letra del cuerpo es fiel al original salvo un pasaje, pero el arreglo musical es otro. La versión de Ketama termina donde termina el cuerpo: todo lo que viene después (coros, guías, mambo) es material nuevo. Los coros tienen la «geometría de la timba»: a cada cantante le dejan dos huecos de distinto tamaño para llenar. Esas versiones salieron de una idea comercial («incluir en cada disco una versión de un éxito del pop español»), y la «timbificación» dio un arreglo «inusualmente inspirado». Es el mismo caso que «Laura» (de Nek, rock italiano), en el arreglo de Paulito FG, que nunca se grabó en estudio. https://www.timba.com/artist_pages/1-no-estamos-locos
- **Tony Succar, *Unity: The Latin Tribute to Michael Jackson*** (2015). Elegía los temas con la prueba de la clave: «escuchaba la música y le tocaba la clave encima; si sonaba bien, me lo quedaba». Las letras las pasa a veces al español, porque «muchas veces los latinos conocen los temas, pero no las letras». https://www.nbcnews.com/news/latino/unity-album-first-ever-latino-tribute-king-pop-michael-jackson-n340751
- **La forma de la timba** (Kevin Moore, resumido en [piano_bajo.md](piano_bajo.md), §Secciones/gears). El cuerpo es el 20-30% de un tema de estudio (10% en vivo). Después viene el montuno, «una serie abierta de coros, mambos de metales, breakdowns, solos», con cambios de marcha a veces cada 4 claves. En un cambio de marcha cambian juntos la percusión y el bajo, y el bajo suele dejar su tumbao mientras el piano sigue.
- **El solo sobre los cambios** ([latin_jazz.md](latin_jazz.md), R01). En la salsa, el solo va sobre el montuno de dos compases. En el latin jazz, también puede ir sobre los cambios del tema.
- **No encontrado:** un análisis publicado de un tema de Nirvana (o del grunge) llevado a la salsa o a la timba. Tampoco un análisis armónico de «Lithium»: los cifrados (Ultimate Guitar) dicen E5 G#5 C#5 A5 C5 D5 B5 D5, todos power chords.

## 2. «Lithium», medido en el MIDI

El MIDI es `Nirvana_-_Lithium.mid` (guitarras, voz, batería y bajo; no está en el repositorio). Las medidas salen de la raíz del bajo, de las notas de las guitarras cada dos tiempos y de la voz.

- 124 negras por minuto, en 4/4 y en Mi. Un acorde cada dos tiempos, en el 1 y en el 3.
- **Verso y estribillo:** la misma vuelta de cuatro compases, | E G# | C#m A | C D | B D |. El verso la toca cuatro veces, suave (la guitarra limpia en arpegio). El estribillo («yeah») la toca tres veces, fuerte (power chords con distorsión). En el estribillo, el bajo toca Sol debajo del Do y La debajo del Re.
- **Puente:** | A C | dieciséis veces, después | D | B | y un remate del bajo en corcheas (Mi, Sol, La) que lleva al Mi.
- Un interludio de bajo solo (cuatro compases, la vuelta del verso).
- Termina en Mi.
- **Forma:** intro (la vuelta, la guitarra sola) · verso · estribillo · verso · estribillo · puente · interludio · verso · estribillo · puente · Mi.
- **Las terceras:** la guitarra toca quintas. La calidad de cada acorde sale de la voz y de las cuerdas al aire:
  - Mi mayor: la voz canta Sol#.
  - Do# menor: suena el Mi al aire de la guitarra.
  - La mayor: la voz canta Do#.
  - Re mayor: la voz del estribillo canta Fa#.
  - Si con séptima: la voz canta La.
  - Sol# y Do: la tercera no suena. Van mayores, como en los cifrados.
  - En el puente, la voz canta Sol sobre el La (La7) y Re y Mi sobre el Do.
- El estribillo canta un Sol natural sobre el Mi mayor: la blue note, el choque entre mayor y menor del grunge. Sin voz, eso no pasa a la versión.

## 3. El criterio

**R01. La prueba de la clave** (Succar). Antes de arreglar, hay que ver que cada frase entre en claves enteras. En «Lithium» entran: la vuelta (ocho acordes) da 8 compases de timba, o sea 4 claves; el puente (A–C) da 1 clave; el final del puente (D–B), 2 claves. Si una frase diera un número impar de compases, se estira o se acorta un acorde para cerrar la clave. [inferido]

**R02. Un tiempo de rock es una blanca de timba.** Así, un acorde de dos tiempos dura un compás. A 124, eso daría 248 negras, que es demasiado. La timba va a 190-200 (las demos, de 188 a 196), así que queda en 196: el acorde dura 1,2 segundos en vez de 0,97. Va un acorde por compás, nunca dos («½»): a 196, medio compás no le alcanza al montuno para decir el acorde. [inferido]

**R03. Las raíces van en orden y no se tocan.** Lo que hace reconocible a «Lithium» es el camino de las raíces: Mi, Sol#, Do#, La, Do, Re, Si, Re. Sobre todo, el Sol# mayor y los dos acordes que no son de Mi mayor (Do y Re, prestados de Mi menor). En el cuerpo no hay sustitutos: ni tritonales ni ii–V metidos. Lo que sí se hace es completar los power chords:
- la tercera, la que dice la melodía;
- la séptima, solo donde hay una función que la pide: G#7 (es la dominante de C#m, adonde va), B7 (la voz canta La) y A7 en el puente (la voz canta Sol, y al final del puente va a Re);
- C#m7, por el color de la timba.

La vuelta queda así: **E · G#7 · C#m7 · A · C · D · B7 · D**. [inferido de §2]

**R04. El cuerpo es el tema; el montuno es nuevo** (la Charanga Habanera). El verso y el estribillo llevan la vuelta tal cual. El montuno no se inventa de la nada: sale de la parte del tema que ya es un vamp, el puente (A–C). Son dos acordes en una clave, que es lo que la timba necesita para los coros y las marchas. [fuente para la forma; la elección del puente es inferida]

**R05. Lo suave y lo fuerte de Nirvana son las marchas.** [inferido]
- **El verso es el cuerpo:** sin campanas y sin vientos. El bajo va en negras con la raíz en el lado 2 (las negras de Krist Novoselic; la perilla «Negras en el lado 2»).
- **El estribillo es la marcha:** con campanas, plato y los vientos en bloques. Un golpe de toda la banda en cada cambio de acorde (en el 4&) hace de los power chords del estribillo.
- **De lo fuerte a lo suave,** sin aviso: una parada en clave (el estribillo se calla de golpe y el verso entra en el 1).
- **Del verso al estribillo,** el relleno de toms de la batería, el redoble de Dave Grohl.

**R06. Las marchas que tapan la armonía van solo sobre el vamp.** En la presión el bajo hace pedal, en la bomba se desliza y en la muela muele (piano_bajo.md: «el bajo suele parar su tumbao»). Sobre la vuelta de ocho acordes se perderían las raíces, que son lo reconocible. Sobre A–C no se pierde nada. [inferido]

**R07. Un gancho que vuelve.** La intro es el piano solo con la vuelta, como la guitarra limpia de Kurt Cobain sola al principio. Va en estilo Pupy: un gancho que se repite igual en cada clave, como el arpegio de Kurt que se repite en cada acorde. Ese gancho vuelve en el verso, el estribillo, el solo y el final (`ganchoDe`). El montuno tiene el suyo (estilo Melón), que vuelve en la presión y el despelote. [inferido]

**R08. Las uniones van donde el tema ya tiene una.** El final del puente (D, B y el remate del bajo Mi-Sol-La) es un bloque de timba: D D B7 B7 con contratiempos (1&, 2&, 3& y el golpe en el 4&) que llevan al Mi, como el remate de Krist. [inferido]

**R09. El solo va sobre la vuelta, no sobre el vamp.** «Lithium» no tiene solo. Su vuelta de ocho acordes, con esos saltos de tercera (Mi–Sol#, Do–Re–Si), es buen terreno para un solo de latin jazz sobre los cambios (latin_jazz.md, R01 b). Y mientras la trompeta sopla, la vuelta sigue sonando: el tema no se pierde. La semilla la elige el jurado del solo. [inferido]

**R10. Se vuelve al tema y se termina como el tema.** Después del montuno vuelve la vuelta: el estribillo, con una moña en capas. La canción termina en Mi, con un corte, como «Lithium». [inferido]

**R11. Lo que no se hace.** [inferido]
- No se cambia de clave ni de tonalidad en el medio. Una canción tiene una sola clave (latin_jazz.md, Berklee PULSE).
- No se usan el son ni la salsa brava. La textura del grunge (batería, bajo eléctrico, guitarras en bloque) tiene su par en la timba (batería, bajo eléctrico, metales en bloque), no en el conjunto.

## 4. «Litio», sección por sección

196 negras por minuto, clave de rumba 2-3, banda de timba, metales de timba. 166 compases, unos tres minutos y medio.

| Sección | Compases | Acordes | De «Lithium» | Cómo va | Regla |
|---|---|---|---|---|---|
| Intro: el piano solo | 8 | la vuelta | la guitarra sola | el piano con la clave, Pupy; redoble de timbal hacia la banda | R07 |
| Verso | 16 | la vuelta ×2 | el verso | cuerpo, sin campanas ni vientos; el bajo en negras con la raíz; relleno de toms | R05 |
| Estribillo | 16 | la vuelta ×2 | el estribillo | marcha, plato al entrar, vientos en bloques; termina en parada | R05 |
| Verso, segunda vez | 8 | la vuelta | el verso | cuerpo; ahora los vientos responden, suaves | R05 |
| Estribillo, segunda vez | 16 | la vuelta ×2 | el estribillo | como el primero; termina en tres contra cuatro, que abre el montuno | R05 |
| Montuno sobre el puente | 16 | A7 C ×8 | el puente | coro, Melón, respuestas de los vientos; abanico al final | R04 |
| Mambo | 16 | A7 C ×8 | — | mambo en contrapunto con crescendo; contratiempos | R04 |
| Presión | 8 | A7 C ×4 | — | presión, pregunta y respuesta de los metales; parada | R06 |
| Bomba | 8 | A7 C ×4 | (el interludio de bajo solo) | sin piano; tres contra cuatro | R06 |
| Despelote | 16 | A7 C ×8 | — | champola de los metales, en cuartas, sube al agudo | R06 |
| Bloque: el final del puente | 4 | D D B7 B7 | D, B y el remate | bloques de los vientos y contratiempos hacia el Mi | R08 |
| Solo de trompeta | 16 | la vuelta ×2 | — | latin jazz (semilla 2); el gancho de la intro debajo | R09 |
| Estribillo final y moña | 16 | la vuelta ×2 | el estribillo | moña en capas | R10 |
| Final | 2 | E E | el Mi del final | corte | R10 |

**Medido** (con `herramientas/exportar.js` y un contador hecho para esto):
- **El bajo:** donde llega cada acorde (en el 4& del compás de antes o en el 1) toca la raíz en los 104 compases que tocan la vuelta. Sobre el vamp también, salvo en la presión (5 de 8: el pedal) y en la bomba (7 de 8: los deslizamientos). Así lo quiere R06.
- **El piano:** tiene la tercera en todos los compases en que toca. Del 90% al 96% de sus notas son del acorde; las demás son notas de paso (los disminuidos de paso de Pupy).
- **El solo:** el jurado del solo le da 9,83. Los trompetistas reales sacan 8,76. Probadas 8 semillas en modo timba y 8 en latin jazz (de 8,79 a 9,83); sin semilla propia, la sección sacaba 8,10 (clave 0,50).
- **La app y la partitura** escriben el Sol# como La♭ (G#7 sale «A♭7», en LilyPond `aes1:7`). La canción guarda cada raíz como un número, sin nombre, y siempre se nombra igual.

## 5. Para otro tema de Nirvana [inferido]

1. **Sacar la vuelta del MIDI:** la raíz del bajo y las notas de las guitarras cada dos tiempos. La tercera sale de la melodía. Si no suena, va mayor, como en los cifrados.
2. **Hacer la prueba de la clave** (R01) y pasar el tiempo (R02).
3. **Buscar el vamp:** dos o cuatro acordes que se repiten. Ahí va el montuno. Si el tema entero es un vamp (en «Smells Like Teen Spirit», cuatro power chords que dan vueltas; sin medir), la misma vuelta hace de cuerpo y de montuno, y lo que cambia son las marchas. En ese caso, R06 pide no poner presión ni bomba sobre la vuelta entera: va la marcha, el mambo y el despelote, o un vamp nuevo de dos acordes sacado de la vuelta.
4. **Lo suave y lo fuerte** pasan a cuerpo y marcha (R05).
5. **Lo que la app todavía no puede:** darles a los vientos o al piano una línea escrita, como el riff de «Come As You Are» o el «yeah» del estribillo de «Lithium». Hoy los vientos aprenden sus riffs de la base, y el piano, sus montunos. Con eso, el riff de un tema podría ser el gancho del piano o la moña de los metales.
