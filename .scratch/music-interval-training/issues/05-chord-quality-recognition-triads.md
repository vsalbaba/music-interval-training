Status: completed

# Chord quality recognition -- triads

## Parent

[PRD](../PRD.md)

## What to build

Second exercise type. The app picks a random root note and triad chord quality, plays each chord tone one by one then strums them together after a 200ms pause (same playback pattern as interval training but with 3+ notes). The user identifies the chord quality from a button grid.

Triad qualities: major, minor, diminished, augmented, sus2, sus4.

An exercise type selector allows switching between interval training and chord recognition. The same feedback/reveal/highlight/replay/advance flow from interval training applies here.

## Acceptance criteria

- [ ] Exercise type selector to switch between "Intervals" and "Chords"
- [ ] App generates a random root note (within E3-E5 range, ensuring all chord tones fit in range) and a random triad quality
- [ ] Playback pattern: each chord tone played one by one, 200ms pause, then all tones strummed together (30-50ms stagger)
- [ ] Button grid shows 6 chord quality buttons: major, minor, diminished, augmented, sus2, sus4
- [ ] Correct answer shows green feedback
- [ ] Wrong answer shows red feedback and reveals the correct chord quality
- [ ] On reveal, all chord tones highlighted on the fretboard (root in one color, other tones in another)
- [ ] Replay, manual advance, running score -- same behavior as interval training
- [ ] Switching exercise type resets the session score

## Blocked by

- [03 - Interval ear training](./03-interval-ear-training-easy.md)
