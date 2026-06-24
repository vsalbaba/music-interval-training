Status: completed

# Scale-degree note resolver utility

## What to build

A pure-data utility that, given a root pitch class (0-11, sharps-only naming) and a semitone offset, returns:

1. The **scale degree label** for that offset (`1`, `b2`, `2`, `b3`, `3`, `4`, `b5`, `5`, `b6`, `6`, `b7`, `7`, `8`)
2. The **concrete note name** using sharps-only spelling (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)

Export two higher-level functions:

- `getIntervalTableRows(rootPitchClass: number)` -- returns all 13 interval rows (unison through octave), each with scale degree, full name, and concrete root + target note names
- `getChordTableRows(rootPitchClass: number)` -- returns all chord types (6 triads + 3 sevenths from the existing `ChordQuality` definitions), each with scale degree formula (e.g. `1-b3-5`), chord name, and concrete note names

The 12 root pitch classes map to names: `['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']`.

## Acceptance criteria

- [ ] Scale degree mapping covers all 13 semitone offsets (0-12)
- [ ] Note spelling uses sharps only, no enharmonic corrections
- [ ] `getIntervalTableRows` returns rows for all intervals defined in the existing `ALL_INTERVALS` array
- [ ] `getChordTableRows` returns rows for all chord qualities defined in the existing `ALL_CHORD_QUALITIES` array
- [ ] Chord formula uses flat/sharp scale degree notation (e.g. `1-b3-5` for minor, `1-3-#5` for augmented)
- [ ] Unit tests cover at least key of C and one sharp key (e.g. C#)

## Blocked by

None -- can start immediately.
