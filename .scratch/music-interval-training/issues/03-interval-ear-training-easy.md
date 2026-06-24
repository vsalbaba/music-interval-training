Status: completed

# Interval ear training -- easy difficulty

## Parent

[PRD](../PRD.md)

## What to build

The first complete exercise loop. The app picks two random notes within E3-E5, plays them in the pattern (first note -- second note -- 200ms pause -- both strummed together), and the user identifies the interval from a button grid.

Easy difficulty includes: unison, perfect 4th, perfect 5th, octave.

Full session flow: play sound, user picks answer from button grid, show correct/incorrect feedback, reveal correct answer if wrong, highlight root and interval notes on the fretboard, replay button always available (unlimited, no penalty), user clicks "next" to advance manually. Running score counter (correct/total) visible throughout.

## Acceptance criteria

- [ ] Exercise area at the top of the layout with play/replay button
- [ ] App generates two random notes within E3-E5 range
- [ ] Playback pattern: note 1, note 2, 200ms pause, both notes strummed together
- [ ] Button grid in the middle of the layout showing 4 interval buttons: unison, perfect 4th, perfect 5th, octave
- [ ] Correct answer shows green feedback
- [ ] Wrong answer shows red feedback and reveals the correct interval
- [ ] On answer reveal, root and interval notes highlighted on the fretboard (different colors for root vs interval)
- [ ] Replay button available at all times, unlimited replays, no penalty
- [ ] User advances to next exercise manually (click "next")
- [ ] Running score counter (correct/total) visible on screen
- [ ] Session is endless -- exercises keep coming until user navigates away

## Blocked by

- [02 - Fretboard component](./02-fretboard-component-with-audio.md) (HITL -- user must validate first)
