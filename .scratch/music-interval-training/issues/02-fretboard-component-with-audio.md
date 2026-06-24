Status: completed

# Fretboard component with audio playback

## Parent

[PRD](../PRD.md)

## What to build

A horizontal guitar fretboard component that spans the full screen width, rendered at the bottom of the layout. 6 strings, 12 frets, standard tuning (E-A-D-G-B-E). Fret markers at positions 3, 5, 7, 9, and double dot at 12. Clicking any note plays it via Tone.js PluckSynth.

This component is always visible and always functional -- it serves as a scratchpad/reference tool independent of any exercise state. It also supports a "highlight" mode where specific notes can be shown in different colors (root vs interval/chord tones), used later by exercises during answer reveal.

**HITL: User must validate the fretboard rendering, note layout, and audio playback locally before subsequent issues proceed.**

## Acceptance criteria

- [ ] Fretboard renders horizontally spanning full screen width at the bottom of the layout
- [ ] 6 strings, 12 frets displayed with correct note names
- [ ] Standard tuning: E-A-D-G-B-E (low to high)
- [ ] Fret markers at positions 3, 5, 7, 9 (single dot) and 12 (double dot)
- [ ] Clicking any fret/string intersection plays the correct note via Tone.js PluckSynth
- [ ] Note range is E3 to E5
- [ ] Open strings (fret 0) are clickable and play correctly
- [ ] Highlight API: component accepts a list of notes to highlight with a color role (root, interval/chord tone) -- can be visually verified with hardcoded test data
- [ ] No scrolling required -- fretboard fits on a standard desktop viewport

## Blocked by

- [01 - Project scaffold](./01-project-scaffold-dockerized-deployment.md)
