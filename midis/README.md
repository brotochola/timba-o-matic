# midis/

Los MIDI de los que aprende la app. **No se suben al repositorio** (el `.gitignore` deja afuera `*.mid`, `*.midi` y `*.kar`): en git solo están los `fuentes.json` con los datos de cada archivo. Lo que sí se sube es el resultado de analizarlos, `base/base_tumbaos.json`, que `herramientas/construir.js` también mete en `index.html`.

## Las carpetas

| Carpeta | Qué hay | Temas | Qué usa la app |
|---|---|---|---|
| `originales/` | La base original: temas de salsa y timba bajados de varios sitios (midistimberos, Int. MIDI Hits 1998, karaokes…) | 48 | Todo. El generador aprende de acá el piano, el bajo y la percusión, y el perfil de la clave. |
| `mididb/` | El género «latino-salsa» de [mididb.com](https://www.mididb.com/genres/latino-salsa-midi/) (ver [docs/analisis_de_los_midis.md](../docs/analisis_de_los_midis.md) §11) | 102 | Los vientos y los montunos de Opus. |
| `mambos/` | Temas con vientos, para estudiar los mambos | 74 | Los vientos y los montunos de Opus. |
| `vientos2/` | Más temas con vientos (karaokes de archive.org) | 116 | Los vientos y los montunos de Opus. |
| `solos_salsa/` | Temas de son, salsa y latin jazz bajados para buscar solos de vientos (karaokes de archive.org; ver [docs/investigacion/fuentes_de_solos.md](../docs/investigacion/fuentes_de_solos.md)) | 27 | La trompeta solista: `herramientas/solos_salsa.js` busca los solos en todas las carpetas. |
| `transcripciones/` | Solos de trompeta de son pasados a mano de partituras, en LilyPond, con el lado de la clave y los acordes de cada compás: «Coralia» (Félix Chappottín, 1928) y «Criollo haragán» (José Interián, 1931), de la tesis de Eric Ferguson (2009). Estos sí se suben: no se pueden volver a bajar | 2 | La trompeta solista: pesan el doble que lo que encuentra el detector. |
| `toontrack/` | *Latin Cuban EZkeys MIDI* de Toontrack (comprado; piano de Manuel Valera), una subcarpeta por estilo | 109 | El piano: «patrón de Toontrack» y Opus. Solo en esta compu (ver abajo). |

Cada tema entra a la base con un id: `b:<archivo>` los originales (`b:1165.mid`) y `b:<colección>/<archivo>` los demás (`b:toontrack/SON_MONTUNO_91_BPM/Intro_Variation_01.mid`). Si se renombra un archivo o una carpeta, cambia su id.

## Sumar un MIDI

1. Copialo a `originales/` (si querés que el generador aprenda de él) o a la carpeta de una colección.
2. Poné sus datos en el `fuentes.json` de esa carpeta (ver abajo). Sin entrada, entra como salsa y con el nombre del archivo de título.
3. Corré `node herramientas/construir.js`. Cada archivo imprime una línea: cuántos ciclos de piano, de bajo y juegos de percusión salieron, y de dónde sacó el lado de la clave (`clave`: la clave suena en la percusión; `declarado`: lo dice `fuentes.json`; `deducido`: lo adivinó por el ritmo del piano; `sin`: no pudo).
4. Si dice «sin compases usables de piano, bajo ni percusión: queda afuera», no aporta nada: borralo.

**Para grabar MIDIs que sirvan:** con click, en 4/4, que el compás 1 sea el comienzo de la clave; alcanza con un instrumento; la percusión en el canal 10 con el mapa General MIDI (conga 62/63/64, bongó 60/61, campana 56, timbal 65/66, güiro 73/74).

Se aceptan `.mid`, `.midi` y `.kar` (MIDI con letra). Quedan afuera los repetidos al bajarlos («… (1).mid») y lo que exporta la app («!!…»).

## fuentes.json

Un objeto: la clave es el nombre del archivo (en las colecciones con subcarpetas, la ruta desde la colección: `SON_MONTUNO_91_BPM/Intro_Variation_01.mid`). Las claves que empiezan con `_` son de la carpeta.

Datos de cada archivo:

| Campo | Qué es |
|---|---|
| `titulo` | «Artista · Tema» |
| `estilo` | `salsa`, `cubano` o `timba` |
| `autor` | quién lo arregló o lo secuenció |
| `clave` | `son 3-2`, `son 2-3`, `rumba 3-2`…: el compás 1 del MIDI empieza en ese lado |
| `inicio` | compases a saltear antes del 1 de la clave |
| `rol` | `auto`, `piano`, `bajo` o `percusion` |
| `acordes` | `Am7 D7 \| Gmaj7 C+B7…`, uno por compás desde el 1 |
| `excluir` | `true` lo deja afuera |
| `fuente`, `genero`, `pais`, `vientos`, `nota` | informativos: de dónde salió, qué vientos tiene |

De la carpeta (solo en las colecciones):

| Campo | Qué hace |
|---|---|
| `_titulo` | el nombre de la colección en la app |
| `_ayuda` | una nota para quien lea el archivo |
| `_encendida` | el generador aprende de ella como de los originales (si no, solo toma sus vientos y sus montunos para Opus) |
| `_local` | material comprado: su base va a `base/base_local.js`, que no se sube; `index.html` la carga si está |
| `_frases` | guarda la frase entera de cada archivo, para tocar el patrón tal cual |
| `_grupos` | por subcarpeta: estilo, grupo, título y la clave en la que está tocada; `excluir` deja afuera la subcarpeta |
| `_secciones` | cómo empieza el nombre del archivo → tipo de sección de la app (`Coro` → coro, `Mambo` → mambo…) |

El perfil de la clave (con qué se adivina el lado en los temas que no tocan la clave) se aprende solo de los originales.

## Toontrack

`toontrack/` es la parte *Straight 4-4* del paquete, convertida a MIDI: son montuno, salsa media y rápida, songo y funk cubano (la carpeta del mambo de los 50 se sacó: la app no toca ese género). La clave está medida por carpeta en el piano: 2-3 el son montuno, la salsa rápida y el songo; 3-2 la salsa media y el funk cubano.

Como es comprado, lo que se analiza de ella va a `base/base_local.js`, que no se sube. Sin ese archivo (por ejemplo, en GitHub Pages), «patrón de Toontrack» toca Opus en el estilo más parecido.
