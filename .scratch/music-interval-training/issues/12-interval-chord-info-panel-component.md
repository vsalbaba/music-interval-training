Status: completed

# Interval and chord info panel component

## What to build

A Svelte component that serves as a music theory reference panel. It has two modes (intervals / chords) controlled by a prop, and contains:

1. **Key picker** -- a row of 12 buttons for selecting a root note (C through B, sharps only). Default selection is C. Visually compact, similar to the existing difficulty selector styling.

2. **Reference table** -- switches content based on the active mode:

   **Intervals mode:** Shows all 13 intervals (unison through octave). Each row displays:
   - Scale degree label (e.g. `b3`)
   - Full interval name (e.g. `Minor 3rd`)
   - Concrete notes in the selected key (e.g. `C - Eb`)

   **Chords mode:** Shows all 9 chord types (6 triads + 3 sevenths). Each row displays:
   - Scale degree formula (e.g. `1-b3-5`)
   - Chord name (e.g. `Minor`)
   - Concrete notes in the selected key (e.g. `C - Eb - G`)

Uses the resolver utility from issue #11 for all note/degree calculations.

The component receives its mode via props and does not manage its own visibility -- that's handled by the layout issue (#13).

## Acceptance criteria

- [ ] Key picker shows 12 buttons, one per pitch class, sharps only
- [ ] Default selected key is C
- [ ] Interval mode shows all 13 intervals with scale degree, name, and concrete notes
- [ ] Chord mode shows all 9 chord types with formula, name, and concrete notes
- [ ] Notes update reactively when the selected key changes
- [ ] Styling is consistent with the existing dark theme (gray-800/900 backgrounds, same text sizing patterns)

## Blocked by

- Issue #11 (scale-degree note resolver utility)
