Status: completed

# CAGED chord shape data model and catalog

## Parent

[PRD](../PRD.md)

## What to build

A new data module containing the CAGED chord shape system. Each shape is a movable pattern defined by its CAGED family (C, A, G, E, D), chord quality (matching `ChordQuality.name` from the existing chords module), a 6-element frets array (index 0 = low E through 5 = high e, `null` for muted strings, values relative to root position), and the root string index.

Supporting types for resolved voicings: an absolute string note (string index, fret, MIDI, pitch class, is-root flag) and an absolute voicing (array of 6 entries, null for muted).

Two helper functions: one to compute valid fret offsets for a shape (ensuring all fretted notes stay within frets 0-12), and one to apply an offset and produce the absolute voicing with computed MIDI values.

The catalog should contain ~35-40 hand-curated entries from standard guitar chord charts. E-shape and A-shape families should cover all 9 qualities (Major, Minor, Diminished, Augmented, Sus2, Sus4, Dominant 7, Major 7, Minor 7). C-shape and D-shape should cover most. G-shape covers Major, Minor, and Dominant 7 at minimum. Every quality name that appears in the existing `TRIAD_QUALITIES` and `SEVENTH_QUALITIES` arrays must have at least one matching shape.

Open chords are shapes at offset 0. Barre chords are the same shapes at offset > 0.

## Acceptance criteria

- [ ] `ChordShape` type with family, quality, frets (6-element array with nulls), and rootStringIndex
- [ ] `AbsoluteStringNote` and `AbsoluteVoicing` types for resolved voicings
- [ ] `getValidOffsets(shape)` returns array of valid offsets (0 through 12 minus max relative fret)
- [ ] `applyOffset(shape, offset)` returns absolute voicing with correct MIDI values using standard tuning
- [ ] Catalog contains entries for all 9 chord qualities with at least one shape each
- [ ] E-shape and A-shape families cover all 9 qualities
- [ ] All fret values in the catalog are correct per standard guitar chord charts
- [ ] Type-checks pass with zero errors

## Blocked by

None -- can start immediately
