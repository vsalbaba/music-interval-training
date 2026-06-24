Status: completed

# Progress tracking with localStorage

## Parent

[PRD](../PRD.md)

## What to build

Track exercise accuracy in localStorage and surface weak spots. Every answer (correct or incorrect) is recorded per interval and per chord quality. The user can see a stats view showing their accuracy breakdown and which intervals/chords they struggle with most.

Data persists across browser sessions via localStorage.

## Acceptance criteria

- [ ] Every answer recorded: which interval/chord, correct or incorrect, timestamp
- [ ] Stats view accessible from the main UI (e.g. a "Stats" button/tab)
- [ ] Shows accuracy percentage per interval (e.g. "minor 6th: 40% correct")
- [ ] Shows accuracy percentage per chord quality (e.g. "diminished: 55% correct")
- [ ] Highlights weak spots -- intervals/chords below a threshold (e.g. below 60%)
- [ ] Data persisted in localStorage, survives browser close/reopen
- [ ] Stats view shows total exercises completed and overall accuracy
- [ ] No server-side persistence

## Blocked by

- [05 - Chord quality recognition](./05-chord-quality-recognition-triads.md)
