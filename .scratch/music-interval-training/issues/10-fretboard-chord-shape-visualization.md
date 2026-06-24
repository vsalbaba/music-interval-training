Status: completed

# Fretboard chord shape visualization

## Parent

[PRD](../PRD.md)

## What to build

Extend the fretboard component and page wiring so that after answering a chord question, the full chord shape is visualized with three visual states:

1. **Played notes** -- the 3-4 notes used in the audio. Root in amber, other intervals in sky-blue. Same colors as current behavior.
2. **Ghost notes** -- other notes in the chord shape voicing that weren't selected for audio (duplicate pitch classes on other strings). Rendered as dimmed dots with the note name visible.
3. **Muted strings** -- strings marked null in the shape. An X marker displayed at the nut (fret 0 column).

The fretboard highlight system needs position-aware matching: highlights carry optional string index and fret so the same MIDI on different strings can be distinguished. The existing interval exercise must continue to work with MIDI-only matching (no string/fret specified).

The page component derives highlights from the chord question's voicing and played notes. Played notes get `'root'` or `'interval'` roles with string+fret coordinates. Non-played voicing notes get `'ghost'` role. Muted strings are passed separately.

Optionally, show the CAGED shape family and fret offset in the feedback area after answering (e.g., "E-shape at fret 3").

## Acceptance criteria

- [ ] Fretboard accepts `mutedStrings` prop alongside existing `highlights`
- [ ] Highlight role type extended to `'root' | 'interval' | 'ghost'`
- [ ] Highlight matching uses string+fret when available, falls back to MIDI-only
- [ ] Ghost notes render as dimmed dots with visible note name
- [ ] Muted strings show X marker at the nut (fret 0)
- [ ] After answering a chord question, played/ghost/muted notes all display correctly
- [ ] Interval exercise highlighting still works unchanged
- [ ] Chord shape looks like a real guitar chord diagram on the fretboard
- [ ] Type-checks pass with zero errors

## Blocked by

- [09 - Shape-based chord question generation](./09-shape-based-chord-question-generation.md) (HITL -- user must validate the visual output)
