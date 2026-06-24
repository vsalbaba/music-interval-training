Status: completed

# Shape-based chord question generation

## Parent

[PRD](../PRD.md)

## What to build

Rewrite the chord question generator to use the CAGED shape catalog instead of random root MIDI + intervals. The generator picks a random quality from the difficulty pool, filters the shape catalog by that quality, picks a random shape, picks a random valid offset, resolves the absolute voicing, then selects which notes to play.

Note selection algorithm: group all non-muted notes by pitch class, pick one representative per pitch class (prefer the lowest string), sort by string index. This produces 3 notes for triads and 4 for 7ths with close voicings.

The `ChordQuestion` interface gains new fields (shape, offset, voicing, played notes) but keeps the existing `rootMidi`, `chordMidis`, `quality`, and `noteStrings` fields populated from the selected played notes. This ensures audio playback and answer submission continue to work without changes.

If a quality has no matching shapes in the catalog (shouldn't happen per issue #08, but as a guard), the generator should re-roll with a different quality.

## Acceptance criteria

- [ ] `generateChordQuestion` picks from CAGED shapes filtered by quality name
- [ ] Random valid offset applied, all fretted notes within 0-12
- [ ] Note selection picks one note per unique pitch class, preferring lower strings
- [ ] Triads produce exactly 3 played notes, 7ths produce exactly 4
- [ ] `ChordQuestion` includes shape, offset, voicing, and playedNotes
- [ ] Existing `chordMidis` and `noteStrings` fields derived from played notes
- [ ] Audio playback unchanged -- `playChordPattern` still receives the note strings
- [ ] Answer submission and stats recording unchanged
- [ ] Type-checks pass with zero errors

## Blocked by

- [08 - CAGED chord shape data model](./08-caged-chord-shape-data-model.md)
