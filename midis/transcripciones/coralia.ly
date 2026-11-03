% Coralia (Gerardo Martínez). Septeto Habanero, Nueva York, 28/5/1928. Félix Chappottín, trompeta (sonido real).
% Transcripción de Eric Ferguson, «Afro-Cuban Son Trumpet in the Septeto Period» (Cal State LA, 2009), págs. 43-46 del PDF,
% pasada a mano. Cada compás: «%% número lado acordes» (lado 3 o 2 de la clave, como la escribe Ferguson debajo; uno o dos
% acordes, «-» sigue el de antes) y sus notas, en LilyPond (altura absoluta). La lee herramientas/solos_salsa.js.
\version "2.24.0"
\header { title = "Coralia" solista = "Félix Chappottín" grupo = "Septeto Habanero" anio = "1928" estilo = "cubano" pulso = "140" }
trompeta = {
  \key f \minor \time 4/4
  %% 5 2 Fm
  r4 r8 c''8 des''8 c''8 b'8 c''8 |
  %% 6 3 C7b9
  g'8 bes'8 r8 des''8~ des''2 |
  %% 7 2 -
  r4 aes'8 f'8 \tuplet 3/2 { f'4( g'4) f'4 } |
  %% 8 3 -
  des''4. c''8~ c''2 |
  %% 9 2 Fm F7
  r4 f'8. f'16~ \tuplet 3/2 { f'4 a'4 c''4 } |
  %% 10 3 F7
  ees''4. a'8~ a'2 |
  %% 11 2 F7
  r8 a'8 bes'8 c''8 \tuplet 3/2 { des''4 des''4 c''4 } |
  %% 12 3 Bb
  bes'1 |
  %% 13 2 Bbm
  \tuplet 3/2 { r4 bes'4 c''4 } \tuplet 3/2 { des''4 c''4 bes'4 } |
  %% 14 3 Bbm
  \tuplet 3/2 { des''4 c''4 aes'4 } \tuplet 3/2 { f'4( g'4) f'4 } |
  %% 15 2 C7b9
  e'4. g'8 c''8 bes'8 aes'8 g'8 |
  %% 16 3 Fm
  f'1~ |
  %% 17 2 Fm
  f'4 r4 r2 |
  \bar "||" R1*17
  %% 35 2 Fm
  r4 r8 c''8 des''8 c''8 b'8 c''8 |
  %% 36 3 C7b9
  g'8 bes'8 r8 des''8~ des''2 |
  %% 37 2 -
  r4 gis'8 f'8 \tuplet 3/2 { f'4( g'4) bes'4 } |
  %% 38 3 -
  des''4. c''8~ c''2 |
  %% 39 2 F7
  r4 f'8 f'4 a'4 c''8 |
  %% 40 3 F7
  ees''4. a'8~ a'2 |
  %% 41 2 F7
  r8 aes'8 bes'8 c''8 \tuplet 3/2 { des''4 des''4 c''4 } |
  %% 42 3 Bb
  bes'1 |
  %% 43 2 Bbm
  r4 bes'8 c''8 \tuplet 3/2 { des''4 c''4 bes'4 } |
  %% 44 3 Fm
  \tuplet 3/2 { des''4 c''4 aes'4 } f'8 g'4 f'8 |
  %% 45 2 C7b9
  e'4. g'8 c''8 bes'8 aes'8 g'8 |
  %% 46 3 Fm
  f'1~ |
  %% 47 2 Fm
  f'4 r4 r2 |
  \bar "||" \key f \major R1*18 \mark "Montuno"
  %% 66 2 F
  f'8 f'4 f'8~ f'8 g'8 a'8 bes'8 |
  %% 67 3 C
  c''4-. r4 r8 g'8 a'8 bes'8 |
  %% 68 2 C
  c''8 a'16 g'16~ g'16 f'8. a'4 g'4-. |
  %% 69 3 F
  f'4. f'8~ f'4 r4 |
  R1*3
  %% 73 3 F
  r2 r8 d''4.~ |
  %% 74 2 F
  d''2.~ d''8 c''8 |
  %% 75 3 C
  \tuplet 3/2 { b'4 d''4 c''4 } \tuplet 3/2 { b'4 d''4 c''4~ } |
  %% 76 2 C
  c''2. g'8 a'8 |
  %% 77 3 F
  f'4. f'8 f'4-. r4 |
  R1*3
  %% 81 3 F
  r2 r8 c''4.~ |
  %% 82 2 F
  \tuplet 3/2 { c''4 c''4 b'4 } \tuplet 3/2 { d''4 c''4 b'4 } |
  %% 83 3 C
  \tuplet 3/2 { c''4 b'4 c''4 } r8 b'8 c''4~ |
  %% 84 2 C
  c''8 a'8( g'8) f'8 a'4 g'4 |
  %% 85 3 F
  f'4( e'8) f'8~ f'4 r4 |
  R1*3
  %% 89 3 F
  r2 r4 c''8 c''8 |
  %% 90 2 F
  c''8 c''8 \tuplet 3/2 { c''4 c''4 c''4 } r8 c''8-.~ |
  %% 91 3 C
  c''8 c''8-.~ c''8 r8 c''4-.~ c''8 c''8-.~ |
  %% 92 2 C
  c''8 b'8-.~ b'8 c''8~ c''4 g'8 a'8 |
  %% 93 3 F
  f'4. f'8~ f'8. c''16~ c''16 c''8 c''16~ |
  %% 94 2 F
  c''16 r16 r8 r4 c''4-. r4 |
  %% 95 3 C
  r2 c''4-. r4 |
  %% 96 2 C
  c''4-. r4 c''4-. r4 |
  %% 97 3 F
  r2 r4 f'4~ |
  %% 98 2 F
  f'4. f'8~ f'8 g'8 a'8 bes'8 |
  %% 99 3 C
  c''4 r4 r8 g'8 a'8 bes'8 |
  %% 100 2 C
  \tuplet 3/2 { c''4 a'4 f'4 } g'4 r4 |
  %% 101 3 F
  f'4. f'8~ f'4 r4 |
  %% 102 2 F
  R1 |
  %% 103 3 C
  c''4 r4 c''4 r4 |
  %% 104 2 C
  c''4 r4 c''4 r4 |
  %% 105 3 F
  c''4-. r8 c''8 r2 |
  \bar "|."
}
\score { \new Staff \with { instrumentName = "Trompeta" } \trompeta \layout { } }
