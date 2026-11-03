# Investigaciones

Notas de trabajo del 31 de octubre y el 3 de noviembre de 2026: qué dicen los músicos, los libros y los métodos sobre cada instrumento, buscado para decidir cómo genera el motor. Cada afirmación lleva su fuente; lo que es deducción propia dice **inferido** y lo que se buscó y no apareció, **no encontrado**. Las citas en español de fuentes en inglés son traducciones. Casi todas terminan con reglas numeradas «para un generador» (R01, R02…), que es como las cita el código.

El código las nombra (por ejemplo, `docs/investigacion/campana.md` en `motor/07_percusion.js`). Son notas, no documentación de la app: algunas nombran archivos de trabajo de ese día que no están en el repositorio.

| Archivo | De qué trata | Parte del motor |
|---|---|---|
| [piano_bajo.md](piano_bajo.md) | El montuno de piano y el tumbao de bajo estilo por estilo: son montuno, mambo, salsa brava, salsa de los 90, songo, timba | piano y bajo |
| [percusion.md](percusion.md) | Congas, bongó, timbales y güiro en la grilla de 16 posiciones por lado de la clave; cierres y transiciones; las diferencias entre estilos | percusión |
| [campana.md](campana.md) | La campana del bongó y el contracampaneo: golpes, patrones, cambios de sección y el sonido de cada campana | percusión y su sonido en `index.html` |
| [vientos_salsa.md](vientos_salsa.md) | Los vientos en la salsa: su papel en cada sección, formatos, voicing, ritmo y clave, articulación, mambos y moñas | vientos |
| [vientos_timba.md](vientos_timba.md) | Los metales en la timba y en qué se diferencian de la salsa de Nueva York | vientos |
| [vientos_generos.md](vientos_generos.md) | Los vientos en los géneros vecinos (bolero, chachachá, mambo de los 40-50, cumbia) y la salsa país por país | vientos y finales de sección |
| [willie_colon.md](willie_colon.md) | Willie Colón y la trombanga: los dos trombones, el registro, los mambos y las moñas | la armonía trombanga |
| [solo_trompeta_salsa.md](solo_trompeta_salsa.md) | El solo de trompeta en el son, la salsa y la timba: dónde va, la trompeta de septeto (Ferguson), Chocolate Armenteros (Ortega), la clave y el solista, el registro | la trompeta solista |
| [solo_trompeta_jazz.md](solo_trompeta_jazz.md) | Los solos de jazz medidos (Weimar Jazz Database, *Inside the Jazzomat*), cómo se generan líneas sobre acordes (Impro-Visor, bebop) y cómo se evalúan los solos generados | la trompeta solista y su jurado |
| [fuentes_de_solos.md](fuentes_de_solos.md) | Dónde hay solos de vientos de son, salsa y timba para bajar: MIDIs (casi nada confirmado), partituras (la tesis de Ferguson: siete temas de septeto con la clave escrita) | la trompeta solista (midis/solos_salsa, midis/transcripciones) |
| [latin_jazz.md](latin_jazz.md) | El latin jazz y los solos de vientos en él: la forma, lo que hace la banda detrás, la clave, en qué se diferencia de la salsa | la trompeta solista |
| [bigband_contrapunto.md](bigband_contrapunto.md) | El oficio de big band y de las big bands latinas: voicings, notas de paso, conducción de voces, contrapunto entre secciones, registros | vientos (orquesta grande, registros) |
| [rock_en_timba.md](rock_en_timba.md) | Cómo se versiona un tema de rock en timba (la Charanga Habanera, Tony Succar, la forma de la timba) y «Lithium» de Nirvana medido en su MIDI; el criterio, en reglas | la demo «Litio» (no el motor) |
