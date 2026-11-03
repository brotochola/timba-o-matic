% Criollo haragán (Graciano Gómez). Septeto Habanero, La Habana, 28/2/1931. José Interián, trompeta (sonido real).
% Transcripción de Eric Ferguson, «Afro-Cuban Son Trumpet in the Septeto Period» (Cal State LA, 2009), págs. 58-61 del PDF,
% pasada a mano. Cada compás: «%% número lado acordes» (lado 3 o 2 de la clave, como la escribe Ferguson debajo) y sus notas.
% La lee herramientas/solos_salsa.js.
\version "2.24.0"
\header { title = "Criollo haragán" solista = "José Interián" grupo = "Septeto Habanero" anio = "1931" estilo = "cubano" pulso = "130" }
trompeta = {
  \key e \major \time 4/4
  R1*3
  %% 4 3 B7
  r2 r4 r8 gis'8 |
  %% 5 2 E
  \tuplet 3/2 { b'4 b'4 gis'4 } \tuplet 3/2 { b'4 b'4 dis''4~ } |
  %% 6 3 B7
  dis''2 r4 r8 fis'8 |
  %% 7 2 A
  \tuplet 3/2 { a'4 a'4 fis'4 } \tuplet 3/2 { a'4 a'8 r8 cis''4~ } |
  %% 8 3 A
  cis''2 r4 r8 gis'8 |
  %% 9 2 E
  \tuplet 3/2 { b'4 b'4 gis'4 } \tuplet 3/2 { b'4 b'4 dis''4~ } |
  %% 10 3 B7
  dis''2 r4 r8 fis'8 |
  %% 11 2 A
  \tuplet 3/2 { a'4 a'4 fis'4 } \tuplet 3/2 { a'4 a'4 cis''4~ } |
  %% 12 3 A
  cis''8 r8 r4 r4 cis''8 cis''8~ |
  %% 13 2 C#7
  cis''8 b'4 gis'8~ gis'8 eis'8 fis'8 gis'8 |
  %% 14 3 F#m
  fis'8 r8 r4 b'4 ais'8 b'8 |
  %% 15 2 B7
  dis''8 cis''8 b'8 a'8 cis'8 e'8 dis'8 fis'8 |
  %% 16 3 E
  e'8 r8 r8 b'8~ b'4. c''8 |
  %% 17 2 C#7
  \tuplet 3/2 { cis''4 b'4 gis'4 } \tuplet 3/2 { eis'4 fis'4 gis'4 } |
  %% 18 3 F#m
  fis'8 r8 r4 b'8 r8 ais'8 b'8 |
  %% 19 2 B7
  dis''8 cis''8 b'8 a'8 cis'8 e'8 dis'8 fis'8 |
  %% 20 3 E
  e'4-. r4 r2 |
  R1*17
  %% 38 3 C#m
  r2 r4 r8 gis8 |
  %% 39 2 C#m
  cis'4 cis'4~ cis'8 e'8 gis'8 e'8 |
  %% 40 3 C#m
  cis'8 r8 r8 gis'8 cis''8. dis''16( cis''8) c''8 |
  %% 41 2 G#m
  gis'2~ gis'8 fis'8( e'8 dis'8) |
  %% 42 3 C#m
  cis'8 r8 cis'8 r8 r4 r8 gis8 |
  %% 43 2 C#m
  cis'4 cis'8 e'8 gis'8( fis'8 e'8 dis'8) |
  %% 44 3 C#m
  cis'4-. r8 gis'8 cis''8. dis''16( cis''8 c''8) |
  %% 45 2 G#m
  gis'4. a'8( gis'8 fis'8 e'8 dis'8) |
  %% 46 3 C#m
  cis'4-. cis'4 r2 |
  R1*8
  %% 55 2 C#m A7
  r2 b4 ais8( b8) |
  \bar "||" \mark "Montuno"
  %% 56 3 E
  e'4-. r4 r2 |
  %% 57 2 E
  r8 gis'8 b'4( ais'8) b'4 gis'8 |
  %% 58 3 E
  e'8 r8 gis'8 cis''8 b'8 gis'8 e'8 gis'8 |
  %% 59 2 B7
  fis'2 b'4 gis'8 e'8 |
  %% 60 3 B7
  fis'4 dis'8 cis'8 r8 cis'8 e'8 r8 |
  %% 61 2 E
  e'2 r2 |
  R1*2
  %% 64 3 E
  r2 r4 r8 e''8 |
  %% 65 2 E
  \tuplet 3/2 { dis''8 cis''8 dis''8 } r8 b'8 \tuplet 3/2 { cis''4 a'4 b'4 } |
  %% 66 3 E
  \tuplet 3/2 { gis'4 fis'4 e'4 } gis'8 cis''8 b'8 gis'8 |
  %% 67 2 B7
  fis'4 r4 b'4 fis'8 a'8 |
  %% 68 3 B7
  gis'8 fis'4 cis'8 r8 cis'8 e'8 r8 |
  %% 69 2 E
  e'2 r2 |
  R1*2
  %% 72 3 B7
  r4 r8 b'8 cis''8 dis''8 e''8 fis''8~ |
  %% 73 2 E
  fis''2~ fis''8 dis''8 e''8 cis''8 |
  %% 74 3 E
  \tuplet 3/2 { dis''4 b'4 cis''4 } b'8. a'16( gis'8 fis'8) |
  %% 75 2 B7
  b'2~ b'8 gis'8 a'8 gis'8 |
  %% 76 3 B7
  \tuplet 3/2 { fis'4 dis'4 cis'4~ } cis'8 cis'8 e'8 r8 |
  %% 77 2 E
  e'4 r4 r2 |
  R1
  %% 79 2 B7
  cis''8 dis''8 b'8 cis''8 a'8( fis'8) cis'8 b8 |
  %% 80 3 B7
  r2 b'8 r8 cis''8 r8 |
  %% 81 2 E
  r8 dis''8 r8 b'8 cis''8 r8 a'8 b'8 |
  %% 82 3 B7
  R1 |
  %% 83 2 B7
  r8 b'8 gis'8 e'8 fis'8( e'8) cis'8 r8 |
  R1*7
  %% 91 2 B7
  r8 b'8 cis''8 dis''8 e''8 fis''4. |
  %% 92 3 B7
  R1 |
  %% 93 2 E
  r8 e''8 fis''8 dis''8 \tuplet 3/2 { e''4 cis''4 dis''4 } |
  %% 94 3 B7
  \tuplet 3/2 { b'4 cis''4 a'4 } \tuplet 3/2 { b'4 gis'4 fis'4 } |
  %% 95 2 B7
  r8 b'4. gis'8( a'8 gis'8 fis'8) |
  %% 96 3 B7
  r2 r8 e''8 cis''8 dis''8 |
  %% 97 2 E
  b'8 cis''8 a'8 b'8 gis'8( fis'8) e'8 r8 |
  %% 98 3 B7
  r2 r4 r8 e''8~ |
  %% 99 2 B7
  \tuplet 3/2 { e''4 cis''4 b'4 } \tuplet 3/2 { gis'4( fis'4 e'4) } |
  %% 100 3 B7
  b4 r4 r2 |
  \bar "|."
}
\score { \new Staff \with { instrumentName = "Trompeta" } \trompeta \layout { } }
