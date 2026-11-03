# Qué hace el piano de verdad: análisis de 19 MIDI de salsa y timba

Este documento acompaña a la guía **Tumbaos de timba**. La guía describe la app y lo que dice la bibliografía; acá se mide lo que tocan los pianos de 19 archivos MIDI, para que el algoritmo nuevo de tumbaos tenga números en vez de suposiciones.

Todo sale del motor (`motor/`) y de las herramientas (`herramientas/`), en Node y sin dependencias. Los números completos, archivo por archivo, los escribe `node herramientas/informe.js` en `salidas/informe.txt`.

> **Fecha.** Escrito el 30 de octubre de 2026 con los primeros 19 MIDI. Después la base creció (hoy son 48 originales y cuatro colecciones, ver [midis/README.md](../midis/README.md)) y el generador también: los números de acá son de ese primer corpus. Cómo genera la app hoy está en el [README](../README.md).

> **Antes de leer.** Casi todo el corpus es **salsa** (Nueva York, Puerto Rico, Colombia, Venezuela, Perú, Japón). Lo cubano son *Cachita* (Benny Moré, en un arreglo secuenciado) y cinco archivos de timba, cuatro de ellos cortos. Las reglas generales del montuno salen firmes; los rasgos propios de la timba (Pupy, Melón, Tirso) todavía se apoyan en la bibliografía de la guía. Para medirlos hacen falta más MIDI de timba (ver §9).

---

## 0. Lo esencial, en 12 reglas

1. **El montuno está atado a la clave.** Mirando solo el ritmo del piano se adivina de qué lado de la clave está cada compás: acierta el 100% en 8 de los 10 archivos que traen la clave en la percusión. Las excepciones son el medley de Gilberto (52%) y *Llorarás*, donde el piano va al revés.
2. **Los contratiempos casi nunca faltan.** El 1&, 2&, 3& y 4& se atacan en el 83–99% de los compases, de los dos lados.
3. **El 1 del lado 3 y el 3 de los dos lados se ligan.** El piano ataca el 1 del lado 3 solo en el 18% de los compases y el 3 en el 22–27%. Se llega a esos tiempos con una nota ligada desde el contratiempo anterior. El 1 del lado 2 sí se ataca (61%).
4. **No se tocan las 8 corcheas.** Se tocan unos 5,5 ataques por compás en el lado 3 y unos 5,9 en el lado 2.
5. **La línea va en octavas y los «bloques» van en el 3&.** La mitad de los ataques son octavas. Los ataques con dos o más notas del acorde (una díada doblada a la octava) se juntan en el **3&** (53–59%) y en el **1& del lado 3** (49%).
6. **Cuando hay una nota adentro de la octava, va pegada arriba.** Va una 3a (o una 2a o una 4a) **debajo de la nota de arriba**, que es la melodía. La forma `<mi sol mi'>` de la guía, con la nota interna pegada abajo, casi no aparece (8%).
7. **La línea son notas del acorde que zigzaguean.** El 81% de las notas de arriba son del acorde: en los tiempos sobre todo 5, 1 y 3; a contratiempo 1, 3 y 5. Se mueve por 3as (43%) y 4as (21%) y cambia de dirección dos de cada tres veces. Después de un salto, el 63% de las veces vuelve con otro salto para el otro lado.
8. **En el cambio de acorde, la voz de arriba se mueve poco.** Va por paso (43%) o por 3a (24%) a la nota más cercana del acorde nuevo.
9. **El anticipo existe, pero no siempre.** El piano anticipa el 56% de los cambios de acorde, casi siempre en el **4&** (98%), y en el 79% de esos casos no vuelve a atacar el 1. Anticipa mucho más **hacia el lado 3** (72%) que hacia el lado 2 (44%).
10. **El tumbao es un gancho que se repite, pero no se transporta.** Dos compases separados por 2 o 4 compases comparten el 78–80% de los ataques. Cuatro compases después se repite la misma nota en el 42% de los casos en salsa y en el 77% en lo cubano. Cuando el acorde cambia, la figura **no** se transporta tal cual (13%): el pianista la acomoda a las notas más cercanas.
11. **Las semicorcheas son condimento.** Son el 2% de los ataques.
12. **Los acentos están donde está la clave.** En los MIDI con dinámica, el 1, el 2&, el 4& y el 3 del lado 3 van entre 2 y 8% más fuertes. Las semicorcheas van, en promedio, un 20% más suaves.

---

## 1. Qué se analizó

| Archivo | Tema | Grupo | Compases de montuno | Clave |
|---|---|---|---|---|
| 1025 | Celia Cruz · *Cuba qué lindos son tus paisajes* | salsa | 285 | en la percusión (son) |
| 1026 | Gilberto Santa Rosa · *Mix* | salsa | 358 | en la percusión, con secciones en contra |
| 1117 | Antonio Cartagena · *Necesito un amor* | salsa | 131 | en la percusión (son) |
| 1126 | Grupo Niche · *Mecánico* | salsa | 184 | deducida del piano |
| 1148 | Oscar D'León · *Mix* | salsa | 354 | en la percusión (son) |
| 1161 | Orquesta de la Luz · *Piano* | salsa | 128 | deducida del piano |
| 1165 | *Despacito* (versión salsa) | salsa | 154 | en la percusión (son) |
| 1176 | Benny Moré · *Cachita* | cubano | 156 | en la percusión (rumba) |
| 1178 | Héctor Lavoe · *Todo tiene su final* | salsa | 9 | — tocado sin click, queda afuera |
| 1206 | Anaís · *Lo que son las cosas* | salsa | 86 | en la percusión (son) |
| 1210 | Grupo Niche · *Anamilé* | salsa | 179 | deducida del piano |
| 715 | timba («midistimberos 2017») | cubano | 6 | en la percusión (son) |
| — | Joe Arroyo · *La rebelión* | salsa | 242 | en la percusión (son) |
| — | Oscar D'León · *Llorarás* | salsa | 187 | en la percusión; el piano va al revés |
| — | Marc Anthony · *Vivir mi vida* | salsa | 126 | deducida del piano |
| — | *La bola* | cubano (1998) | 26 | deducida del piano |
| — | *La mitad de La Habana* | cubano (1998) | 6 | deducida del piano |
| — | *Soy normal, natural* | cubano (1998) | 20 | deducida del piano |
| — | *Ya empezó la fiesta* | cubano (1998) | 23 | deducida del piano |

En total hay **2660 compases de montuno** y unos 15 000 ataques de piano. Los cuatro archivos de 1998 dicen solo «International MIDI Hits» en los metadatos, sin intérprete.

### 1.1 Cómo lo mide la herramienta

1. **Pulso.** Toma la corchea de salsa como pulso: 16 pulsos por clave. Algunos MIDI están escritos a tempo doble o a mitad de tempo; la herramienta elige el pulso que deja la negra entre 130 y 260.
2. **Grilla.** Sigue la deriva de los archivos grabados en vivo, con la media circular de los golpes de batería. *Anamilé* se corre más de un pulso a lo largo del tema y queda bien alineada.
3. **Compás y clave.** El 1 de cada compás sale del bajo de tumbao, que ataca el 2& y el 4. El lado de la clave sale del instrumento que toca la clave (claves, wood block). Si la percusión no tiene clave, el lado se deduce del ritmo del piano (regla 1).
4. **Acordes.** Un acorde por compás, o dos si las mitades lo piden. Salen del piano y del bajo, con la ventana corrida una corchea para que entren los anticipos. Las fundamentales son confiables. La calidad del acorde es aproximada: a veces marca «sus4» donde hay una nota de paso.
5. **Ataques.** Junta las notas simultáneas en un ataque y las cuantiza a la corchea, o a la semicorchea solo si queda clara. La «nota de arriba» es la melodía. La mano derecha es lo que entra en la octava de arriba; la izquierda, lo que queda abajo.
6. **Montuno.** Un compás cuenta como montuno si tiene 4 ataques o más, al menos 2 a contratiempo y notas cortas. Solo esos compases entran en las estadísticas.

**Excepciones.** En *Llorarás* la percusión es coherente: la tumba marca el bombo del lado 3 justo donde lo dice la clave. Aun así, el piano sigue otro patrón. En el medley de Gilberto, algunas secciones también van en contra. Esos compases quedan fuera de las tablas por lado de clave.

---

## 2. El ritmo

### 2.1 Dónde ataca el piano

Porcentaje de compases con ataque en cada corchea (todo el corpus, solo compases con lado de clave confiable):

```
                1   &   2   &   3   &   4   &
lado 3         18  95  72  99  22  85  58  83
lado 2         61  66  90  94  27  93  53  96
```

- **Contratiempos casi siempre.** El 2& y el 4& son los más firmes.
- **El 1 del lado 3 se liga** desde el 4& del lado 2 (ver anticipo, §5). El **3 se liga** desde el 2& en los dos lados.
- **El 1 del lado 2 se ataca** (61%), y por eso el 1& del lado 2 baja (66%).
- La diferencia principal entre los lados está en el 1 y el 1&. Con eso alcanza para reconocer el lado de la clave.

### 2.2 Las células más comunes (lado 3 | lado 2)

Ciclos de dos compases, solo ritmo, sobre todo el corpus (`x` = ataque, `.` = nada o nota ligada):

```
                       1 & 2 & 3 & 4 &   1 & 2 & 3 & 4 &
1. ×51                 . x x x . x . x | . x x x . x . x
2. ×48                 . x x x . x x x | x . x x . x x x
3. ×44                 . x x x . x . x | x x x x . x . x
4. ×39 (Cachita)       . x x x x . x x | x . x x . x x x
5. ×38                 . x x x . x x x | . x x x x x x x
6. ×25                 . x x x . x x x | x x x x . x x x
7. ×25 montuno clásico . x . x . x . x | x . x x . x . x
8. ×25                 . x . x . x . x | . x x x . x . x
```

La célula 7 es el montuno de libro de la guía (§2.1, «Rebeca 1A»). Que aparezca sola entre los datos es una buena señal de que la alineación de clave funciona. La mayoría de los pianistas lo **rellenan**: agregan el 2 y, a veces, el 4 sobre esa base.

### 2.3 Densidad y semicorcheas

- Hay 5,5 ataques por compás en el lado 3 y 5,9 en el lado 2.
- Las semicorcheas son el **2%** de los ataques. La más usada es la anterior al 4 del lado 3 (5% de los compases). La excepción es *Soy normal, natural*, con 6% de semicorcheas.
- Nota: los MIDI secuenciados tienden a simplificar. La timba «picada» real tiene más semicorcheas, pero acá no se pudo medir.

### 2.4 Acentos (velocidad, en los MIDI que la tienen)

```
                1    &    2    &    3    &    4    &
lado 3        105   97   97  104  106   98  103  102
lado 2        108   97   96  104   98  101   93  104      (100 = velocidad media)
```

Los acentos caen en el 1, el 2& y el 4&, y en el 3 del lado 3: los lugares de la clave y del anticipo. Las semicorcheas (no están en la tabla) rondan el 80: son notas fantasma.

---

## 3. La textura: octavas, bloques y manos

### 3.1 Qué toca la mano derecha

| Textura | % de ataques |
|---|---|
| Octava sola | 49% |
| Nota sola | 28% |
| Octava con una nota adentro | 7% |
| Díada de 3a | 5% |
| Octava con dos notas adentro | 3% |
| Díada de 4a / de 6a | 3% / 2% |
| Acorde | 3% |

### 3.2 Dónde van las octavas y dónde los bloques

Porcentaje de los ataques de cada posición que son **octava**:

```
                1   &   2   &   3   &   4   &
lado 3         71  54  38  76  63  58  52  64
lado 2         77  57  52  76  52  59  34  79
```

Porcentaje de los ataques de cada posición que son un **bloque** (dos o más notas distintas del acorde, por ejemplo una 3a doblada a la octava):

```
                1   &   2   &   3   &   4   &
lado 3         27  49  34  29  20  59  35  31
lado 2         26  35  37  25  46  53  26  28
```

La forma típica del montuno salsero sale clarita:

- **La línea va en octavas** en el 2&, el 4& y el 1 del lado 2.
- **El bloque armónico va en el 3&** (los dos lados) y en el **1& del lado 3**. Es el «golpe de acorde» que contesta a la línea.
- **El 2 y el 4** son más seguido notas sueltas: notas de paso de la línea.

Ejemplo real (Grupo Niche, *Mecánico*, con el lado deducido del piano; las notas en cifrado inglés, C4 = do central):

```
lado 3  Gm        1&: Bb3-Bb4   2: D4-D5   2&: G3-G4-G5   3&: Bb3-D4-Bb4-D5   4&: Bb3-Bb4-Bb5
lado 2  Cm7 → F7  1: Bb3-Bb4-Bb5   2: Eb4-G4-Eb5   2&: A3-A4-A5   3&: Eb4-F4-Eb5-F5   4&: A3-A4-A5
```

El 3& es un bloque (Bb–D y Eb–F doblados a la octava) y el resto es línea en octavas. En el lado 2, el F7 llega en el **2&** con su 3a (La), anticipado media barra.

### 3.3 La nota de adentro de la octava

Cuando la octava lleva una nota adentro, esa nota está a estos semitonos **debajo de la nota de arriba**:

| 3 st (3a menor) | 4 st (3a mayor) | 2 st (2a) | 5 st (4a) | 8–9 st (6a, la forma `<mi sol mi'>`) |
|---|---|---|---|---|
| 30% | 22% | 14% | 13% | 8% |

La nota de arriba es la melodía y la armonía va pegada debajo. Es la misma lógica del bloque: una 3a con la nota de arriba doblada.

### 3.4 La mano izquierda

| Mano izquierda | % de ataques |
|---|---|
| Nada aparte: textura de una mano o izquierda dentro del voicing | 45% |
| Dobla la línea una octava abajo | 20% |
| Dobla dos octavas abajo | 12% |
| Una nota suelta (bajo propio) | 8% |
| **Décima** abajo | 8% |
| Acorde u octava propia | 6% |

Las décimas son el sello de dos archivos: *Necesito un amor* (Cartagena, 46%) y *La bola* (46%). Oscar D'León prefiere las manos a **dos octavas** (45%), el sonido abierto que menciona Fiol. El **movimiento contrario** de Pupy no aparece en este corpus.

---

## 4. La línea (la nota de arriba)

### 4.1 Qué notas del acorde

| | 1.ª | 2.ª | 3.ª | después |
|---|---|---|---|---|
| **En el tiempo** | 5 (24%) | 1 (21%) | 3 (19%) | b3 10%, b7 7%, 11 6%, 9 3% |
| **A contratiempo** | 1 (24%) | 3 (19%) | 5 (19%) | b7 10%, b3 8%, 11 5%, 13 5% |
| **En las octavas** | 1 (25%) | 5 (20%) | 3 (17%) | b7 9%, b3 8% |
| **En notas sueltas** | 5 (22%) | 3 (21%) | 1 (21%) | b3 10%, b7 8% |

En los grados, «b3» y «3» son la 3a menor o mayor según el acorde.

- El **81%** son notas del acorde, el **9%** son tensiones (9, 11, 13) y el **10%** son cromáticas o alteradas.
- Las notas fuera del acorde casi nunca son notas de paso por grado conjunto. Así se reparten:

| Cómo es la nota fuera del acorde | % |
|---|---|
| Color que sale saltando | 59% |
| Apoyatura: llega saltando y resuelve por paso | 18% |
| Nota de paso | 12% |
| Bordadura | 6% |
| Se repite | 5% |

### 4.2 Cómo se mueve

Intervalos de la nota de arriba de un ataque al siguiente, plegados a la octava (un salto de octava cuenta como cambio de registro):

| Repite | Semitono | Tono | 3a | 4a | Trítono |
|---|---|---|---|---|---|
| 11% | 9% | 11% | **43%** | **21%** | 6% |

- **Zigzag.** Cambia de dirección en el 67% de los movimientos. Después de un salto, el 63% de las veces vuelve con otro salto, el 30% sigue para el mismo lado y el 7% vuelve por paso. Es el «tres» arpegiado: la línea salta entre notas del acorde, de un lado al otro.
- **Registro.** La nota de arriba va de F4 a C#6, con la mediana en F5. Dentro de un compás se mueve unos 10 semitonos.

### 4.3 De un acorde al siguiente

La nota de arriba del acorde viejo pasa a la primera del acorde nuevo así:

| Por paso (1–2 st) | Por 3a | 4a o más | Nota común |
|---|---|---|---|
| **43%** | 24% | 26% | 7% |

La conducción de voces por paso es lo más común. En Oscar D'León llega al 74%, y en *Soy normal, natural*, al 93%.

---

## 5. Armonía y anticipo

- El piano **anticipa el 56% de los cambios de acorde**, y lo hace en el **4&** (98%).
- En el 79% de esos casos **no vuelve a atacar el 1**: el acorde nuevo queda ligado sobre la barra.
- **Anticipa mucho más hacia el lado 3** (72%) que hacia el lado 2 (44%). En lo cubano llega al 96% contra 43%. Por eso el 1 del lado 3 casi nunca se ataca: llega ligado desde el 4& del lado 2.
- Si hay dos acordes en un compás, el segundo se anticipa en el **2&** en el 63% de los casos.
- Por estilo: Celia anticipa el 100% hacia el lado 3, Cartagena el 78% hacia los dos lados y *Despacito* apenas el 27%.

**Corrección a la guía.** La guía dice **[app]** que, con clave de rumba, el anticipo lo «empuja» el 4& del lado 3. Los datos dicen lo contrario, incluso en *Cachita*, que tiene clave de rumba: anticipa el 100% hacia el lado 3 y el 31% hacia el lado 2. El anticipo fuerte es el del **final del lado 2**.

---

## 6. El gancho: cuánto se repite

- **Ritmo.** De un compás al siguiente se comparte el 66% de los ataques; entre compases separados por 2, el 78%; por 4, el 80%. La unidad es la clave (2 compases), y muchas veces el gancho dura 4 compases porque acompaña una progresión de 4.
- **Notas.** Cuatro compases después, en la misma posición, se repite **la misma nota** en el 42% de los casos en salsa y en el **77%** en lo cubano. *La bola* llega al 80% y *Ya empezó la fiesta*, al 98%. El tumbao cubano es fijo, como dicen Moore y Fiol: es el gancho del tema.
- **Transporte.** Cuando el acorde cambia, la figura **no se transporta tal cual** (13–14%). El pianista mantiene el ritmo y el contorno, pero elige las notas del acorde nuevo más cercanas. Un algoritmo que transporta la figura entera suena a máquina.

---

## 7. El bajo, para comparar

Porcentaje de compases con ataque del bajo:

```
                1   &   2   &   3   &   4   &
salsa  lado 3  22  12  10  98  26   9  93   9
salsa  lado 2  34   3  10  90  29   2  94   5
cubano lado 3   6   1   3  91  18   3  50  23
cubano lado 2  75   8   4  80   9   7  93  28
```

- La salsa hace el tumbao de manual: **2& y 4** en los dos lados.
- En lo cubano (sobre todo *Cachita*), el bajo ataca el **1 del lado 2** y agrega el **4&** (23–28%).

---

## 8. Estilos que se distinguen

**Salsa clásica: Celia Cruz, Oscar D'León, Grupo Niche, Gilberto.**
- Línea en octavas con bloque en el 3&.
- Oscar D'León: notas sueltas (58%) dobladas a dos octavas, con la conducción por paso más prolija del corpus (74%).
- Niche: octavas (55–69%) y ritmo muy estable.

**Salsa romántica: Cartagena, Anaís, Marc Anthony, *Despacito*.**
- *Necesito un amor*: **décimas** en la izquierda, bloques en casi todas las posiciones, 93% de notas del acorde y período de 2 compases muy claro.
- *Vivir mi vida*: octavas (65%) y acordes llenos (12%), izquierda a dos octavas, lado 3 ralo (4,6 ataques) y 91% de notas del acorde. Ejemplo, con el lado deducido del piano:

```
lado 3  Cm   1&: C4-Eb4-G4-C5-Eb5   2&: Eb3-Eb4-Eb5   3: G3-G4-G5   4: C4-Eb4-G4-C5-Eb5
lado 2  Cm7  1: G3-G4-G5   1&: C4-C5   2: Eb4-Eb5   2&: Bb3-Bb4-Bb5   3: Bb3-Bb4-Bb5   4&: Ab3-Ab4-Ab5
```

**Cubano tradicional: *Cachita*.**
- Octavas (70%) y la célula 4 de §2.2, `. x x x x . x x | x . x x . x x x`, que ataca el 3 del lado 3.
- El bajo ataca el 1 del lado 2.

**Timba de los 90: *La bola*.**
- **Sin octavas.** Notas sueltas y díadas, con la izquierda en **décimas**: la textura que Fiol describe para Melón (el «tres armonizado»).
- Casi todo a contratiempo, el 1 nunca se ataca y hay un gancho fijo de 4 compases (Eb | Ab | C | Db). El 4& trae el acorde siguiente. En este archivo el lado de la clave no se puede confirmar:

```
Eb   1&: Eb4-G4 | G5-Bb5   2&: Bb3 | Eb5   3&: Eb4-G4 | G5-Bb5   4&: Ab4 | C6        ← anticipa Ab
Ab   1&: Eb4 | Ab5   2&: C4 | Eb5   3: Ab3 | C5   3&: C4 | Eb5
C    1&: C4 | E5   2&: E4-G4 | G5-C6   3&: C4 | E5   4: G4   4&: C#4 | F5          ← anticipa Db
Db   1&: F4-Ab4 | Ab5-C#6   2&: C4 | E5   3: C#4 | F5   3&: F4-Ab4 | Ab5-C#6   4&: Bb3 | Eb5   ← anticipa Eb
```

  (`|` separa izquierda y derecha)

**Timba de los 90: *Ya empezó la fiesta*.**
- **Célula de un compás** que se repite (período 1).
- Notas sueltas, 3as y octava+1, con 99% de notas del acorde.
- Anticipa el 100% de los cambios.

**Timba de los 90: *Soy normal, natural*.**
- Notas sueltas (43%) y 3as (21%), con más semicorcheas que el resto (6%).

**La excepción: *Llorarás*.**
- El piano va al revés de la clave de la percusión.
- Puede ser un tumbao «cruzado» a propósito o una costumbre del arreglador.

---

## 9. Qué cambia para el algoritmo

### 9.1 Lo que hoy hace la app y los datos contradicen

| La app hoy (`TUMBAO.generate`) | Lo que dicen los datos |
|---|---|
| Llena las 8 corcheas en casi todas las ondas | Se tocan unas 5,5–6; el 1 del lado 3 y el 3 se ligan |
| Octavas en los golpes de clave (lado 3: 1 y 2&; lado 2: 2 y 3) | El 1 del lado 3 y el 3 del lado 2 casi no se atacan. Las octavas van en el 2&, el 4& y el 1 del lado 2; el bloque, en el 3& |
| Anticipa en el 4& de **todos** los compases, aunque no cambie el acorde | Anticipa solo cuando cambia el acorde: 72% hacia el lado 3, 44% hacia el lado 2 |
| Cada acento es octava con nota interna **arriba de la nota de abajo** (`<mi sol mi'>`) | La octava sola es lo normal (49%). La nota interna va **debajo de la de arriba** (3a, 2a o 4a) |
| Cromatismo antes de cada acento hasta 60% (Pupy) y corridas hasta 70% (Melón) | 10% de notas cromáticas, casi todas apoyaturas. Semicorcheas: 2% |
| Línea al azar hacia arriba o hacia abajo, compás por compás | Zigzag por 3as y 4as. Paso o 3a en el cambio de acorde. Gancho repetido |
| Solo Pupy repite su figura en cada clave; las demás ondas sortean de nuevo cada compás | Todo tumbao repite: 78–80% del ritmo, 42–77% de las notas cada 4 compases, con las notas acomodadas al acorde nuevo |

### 9.2 El diseño (ya está en la app como «Algoritmo nuevo»)

La idea es armar el tumbao en capas, cada una con sus números medidos. Está hecho en `motor/` y la app lo trae como opción, al lado del algoritmo clásico. Las pruebas cambiaron dos cosas respecto del plan:

- **La línea sortea primero la función armónica de cada ataque** (fundamental, 3a, 5a, 7a, tensión o cromática), con las proporciones de la base, y recién después la búsqueda en haz elige la nota. La búsqueda sola se quedaba con lo más probable: 98% de notas del acorde y 25% de notas repetidas.
- **El cromatismo va solo en ataques cortos, nunca en el 1 ni en el 3,** y tiene que resolver por paso. Imitar el 10% «crudo» del corpus metía notas largas fuera del acorde en tiempos fuertes, y parte de ese 10% es ruido de la detección de acordes.

1. **Gancho rítmico por sección.**
   - Elegir una célula lado 3 | lado 2 del vocabulario de §2.2, filtrado por estilo.
   - Asignar la textura de cada posición con las tablas de §3.2: octava, nota sola o bloque.
   - Repetirla en toda la sección y variar uno de cada cuatro o cinco ciclos: sacar o agregar un 2 o un 4, o una semicorchea antes del 2& o del 4&.
2. **Armonía por posición.**
   - Asignar a cada ataque su acorde.
   - Si el acorde cambia, anticipar en el 4& con probabilidad 0,72 hacia el lado 3 y 0,44 hacia el lado 2; en estilo cubano, 0,96 y 0,43.
   - Ligar al 1 con probabilidad 0,79.
   - Con dos acordes en el compás, anticipar el segundo en el 2& con probabilidad 0,63.
3. **Línea con búsqueda, no al azar.**
   - Para cada ciclo, buscar la mejor secuencia de notas de arriba con una búsqueda en haz (*beam search*). Son unos 12 ataques por ciclo, así que es barata.
   - El puntaje suma tres cosas:
     - la probabilidad del grado según la posición (§4.1);
     - la probabilidad del intervalo, con un premio al zigzag después de un salto (§4.2);
     - el paso o la 3a en el cambio de acorde (§4.3).
   - Resta un castigo por salir del registro F4–D6.
   - Cuando vuelve la misma progresión, reusar la línea (gancho).
   - Cuando cambia, mantener el ritmo y el contorno y volver a elegir las notas.
4. **Voicing.**
   - Octava: nota de arriba y la misma una octava abajo.
   - Octava con nota adentro: agregar la nota del acorde que esté 3–4 semitonos debajo de la de arriba.
   - Bloque: una 3a o 4a debajo de la nota de arriba, doblada a la octava.
   - Mano izquierda según el estilo: dobla a 1 o 2 octavas (salsa), décimas (romántica, Melón), nada o movimiento contrario (Pupy, desde la bibliografía).
5. **Color.**
   - Tensiones 9, 11 y 13 en el 9% de las notas, sobre todo a contratiempo.
   - Cromatismo en el 10% de las notas, como apoyatura hacia el acorde anticipado.
   - Semicorcheas en un 2–6% de los ataques.
   - El disminuido de paso de Pupy, como adorno ocasional.
6. **Dinámica.** Acentos de +5% en el 1, el 2&, el 4& y el 3 del lado 3, y semicorcheas al 80%.
7. **Células reales.**
   - `base/base_tumbaos.json` trae unos **990 ciclos de piano** lado 3 | lado 2, **1.420 de bajo** y **840 juegos de percusión**, con sus notas y acordes.
   - El generador toma las células de piano de un mismo tema («a la manera de…»), para que el estilo sea coherente, y vuelve a elegir las notas sobre los acordes nuevos.
   - El bajo usa ciclos con roles claros (raíz, quinta, anticipo de la raíz que viene, aproximación cromática), pesados por cuántas veces aparece su ritmo en la base.
   - La percusión usa juegos completos (un patrón por instrumento), clasificados por marcha. La clave no se aprende: la escribe el generador según lo que elijas.

### 9.3 Cómo saber si suena creíble

La misma herramienta sirve de crítico. `node herramientas/probar_motor.js salidas/prueba` genera 36 tumbaos, los guarda como MIDI y `node herramientas/informe.js salidas/prueba salidas/prueba` los analiza como si fueran del corpus. Con los valores por defecto:

| Medida | Generado | Corpus |
|---|---|---|
| Octavas | 54% | 49% |
| Línea por 3as / 4as | 49% / 21% | 42% / 21% |
| Notas repetidas | 14% | 11% |
| Cambia de dirección | 67% | 67% |
| Después de un salto, vuelve con otro | 64% | 63% |
| Enlace entre acordes por paso | 45% | 43% |
| Bajo en el 2& / en el 4 | 88–97% / 89–97% | 89–97% / 88–94% |
| Parecido rítmico a 2 compases | 85% | 78% |

Queda un poco más repetitivo que el corpus, a propósito: es el gancho. La perilla «Variación por vuelta» lo afloja. Además, las partituras generadas compilan sin errores ni avisos en LilyPond 2.24.

### 9.4 Lo que falta medir

- **Timba de verdad.** Con 4 a 10 MIDI de Pupy, Melón, Tirso, Havana D'Primera o NG La Banda se podrían medir la densidad «picada», el movimiento contrario, los cromatismos y los tumbaos de 4 y 8 claves. Se consiguen MIDI en sitios como «midistimberos» o transcribiendo las muestras de *Beyond Salsa Piano*.
- **La partitura de Javier333** (en Scribd, documento 460573410, «TUMBAOS SALSA») trae tumbaos 2-3 y 3-2, uno en Cm, uno en Gm y una guajira. Transcriptos a MIDI, entran al corpus con la clave escrita.
- **El tempo vivo.** *Todo tiene su final* quedó afuera porque está tocado sin click. Habría que agregar un seguidor de pulso más fino.

---

## 10. Cómo usar la herramienta

Desde la carpeta del proyecto:

```
node herramientas/construir.js                              analiza los MIDI y actualiza la base y index.html
node herramientas/informe.js                                las tablas de este documento (salidas/informe.txt)
node herramientas/ver.js "la bola.mid" 12 8                 muestra 8 compases desde el 12
node herramientas/probar_motor.js salidas/prueba            genera tumbaos de prueba para el crítico
node herramientas/informe.js salidas/prueba salidas/prueba  y los pasa por el informe
```

- Los MIDI van en `midis/originales/` o en una colección de `midis/`, con sus datos (título, estilo, clave, rol, acordes) en el `fuentes.json` de esa carpeta: ver [midis/README.md](../midis/README.md). El `.gitignore` los deja afuera del repositorio: al repositorio va solo la base ya analizada.
- `informe.js` escribe `informe.txt` (todas las tablas, para el corpus, por grupo y por archivo) y `corpus_tumbaos.json` (las mismas estadísticas en JSON).

Qué hace cada archivo del motor y de las herramientas: [README](../README.md#qué-hay-en-el-repo).

---

## 11. Segundo corpus: 109 MIDIs de mididb.com

Para contrastar se bajaron los MIDI del género «latino-salsa» de [mididb.com](https://www.mididb.com/genres/latino-salsa-midi/).

**Qué se bajó**
- El listado tiene 118 temas. Se bajaron 109; los otros 9 dan error en el servidor.
- 96 traen piano.
- Por artista hay 97 de salsa, 4 cubanos (Buena Vista, Compay Segundo, Polo Montañez), 1 de timba (Los Van Van, «Disco Azúcar») y 8 de otros géneros (Gloria Estefan, Simón Díaz…).
- Son versiones cortas, de 2 a 12 kB: en total dan **1036 compases de montuno**, contra 2710 del corpus original.

**Dónde quedó**
- Los MIDI están en `midis/mididb/`, que el `.gitignore` deja afuera del repositorio.
- El informe completo lo escribe `node herramientas/informe.js midis/mididb salidas/mididb`.



### 11.1 Qué confirma

| Medida | Corpus original | mididb |
|---|---|---|
| Contratiempos atacados | 83–99% | 83–99% (salvo el 4& del lado 3: 67%) |
| 1 del lado 3 atacado | 19% | 24% |
| 3 atacado (lado 3 / lado 2) | 22% / 27% | 33% / 39% |
| Ataques por compás (lado 3 / lado 2) | 5,5 / 5,9 | 5,3 / 5,7 |
| Anticipo en los cambios de acorde | 56%, en el 4& el 99% | 50%, en el 4& el 95% |
| Sin volver a atacar el 1 después del anticipo | 79% | 74% |
| Línea por 3as / 4as | 42% / 21% | 42% / 19% |
| Cambia de dirección | 67% | 63% |
| Nota de arriba del acorde | 81% | 86% |
| Bajo en el 2& y en el 4 | 89–97% y 88–94% | 84–87% y 77–86% |

Las reglas de §0 se sostienen con otro corpus, de otros secuenciadores.

### 11.2 Qué cambia

- **Texturas más simples.**
  - Menos octavas (43% contra 49%) y más notas sueltas (34%) y acordes llenos (7%).
  - La izquierda casi nunca toca aparte (65% «nada»).
  - Más notas repetidas (17% contra 11%).
  - Son secuencias más esquemáticas.
- **Registro más grave.** La mediana de la nota de arriba es D5, contra F5.
- **La clave no siempre está alineada.** De los 31 archivos con clave en la percusión, 18 coinciden con el perfil del piano del corpus original y 13 van al revés (61% de los compases). En el corpus original eran 8 de 10. En secuencias amateur, la clave o el piano «cruzados» son frecuentes; por eso, para saber de qué lado de la clave está cada compás, estos datos valen menos.

### 11.3 Un ejemplo de timba: Los Van Van, «Disco Azúcar»

- Es el único tema de timba (en rigor, songo) de la tanda.
- **Piano «picado»:** ataca las 8 corcheas, con octavas en el 1, el 2& y el 3, y notas sueltas o séptimas en el resto.
- **Gancho:** repite el ritmo exacto cada 4 compases.
- **Izquierda:** toca su propia línea grave, dos octavas abajo.
- **Anticipos:** anticipa el 68% de los cambios, mitad en el 4 y mitad en el 4&.

Es el tipo de material que falta en la base (ver §9.4).
