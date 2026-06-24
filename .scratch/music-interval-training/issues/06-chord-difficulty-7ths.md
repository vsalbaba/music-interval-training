Status: completed

# Chord difficulty -- add 7th chords

## Parent

[PRD](../PRD.md)

## What to build

Add a difficulty selector to the chord recognition exercise, matching the pattern from interval training.

Difficulty levels:
- **Triads only** (already implemented): major, minor, diminished, augmented, sus2, sus4
- **With 7ths**: adds dominant 7, major 7, minor 7

Switching difficulty resets the session score.

## Acceptance criteria

- [ ] Difficulty selector visible in the chord exercise area (triads / with 7ths)
- [ ] Triads shows 6 chord quality buttons
- [ ] With 7ths shows 9 chord quality buttons (triads + dom7, maj7, min7)
- [ ] Random generation produces 4-note chords for 7th qualities (root, 3rd, 5th, 7th)
- [ ] Playback pattern unchanged -- individual notes then strum, with 4 notes instead of 3 for 7th chords
- [ ] Switching difficulty resets the session score counter

## Blocked by

- [05 - Chord quality recognition](./05-chord-quality-recognition-triads.md)
