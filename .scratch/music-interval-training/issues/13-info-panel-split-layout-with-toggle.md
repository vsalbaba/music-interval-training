Status: completed

# Info panel 50/50 split layout with toggle button

## What to build

Wire the info panel component into the main page layout:

1. **Toggle button** -- add an "Info" button next to the existing Stats button in the exercise type selector row. Clicking it toggles the info panel open/closed.

2. **50/50 split** -- when the info panel is open, the exercise area (everything above the fretboard) splits into a 50/50 horizontal layout:
   - Left half: the existing exercise UI (type selector, difficulty, play button, answer grid, feedback)
   - Right half: the info panel component from issue #12

3. **Mode sync** -- the info panel automatically switches between interval and chord mode based on the currently selected exercise tab (Intervals / Chords).

4. **Fretboard unaffected** -- the fretboard section at the bottom remains full-width regardless of whether the info panel is open or closed.

5. **State persistence** -- the panel open/closed state does not need to persist across page reloads.

## Acceptance criteria

- [ ] "Info" toggle button appears next to Stats button
- [ ] Clicking Info opens the panel in a 50/50 split alongside the exercise area
- [ ] Clicking Info again closes the panel and returns to the centered single-column layout
- [ ] Info panel shows interval content when Intervals tab is active, chord content when Chords tab is active
- [ ] Switching exercise tabs while the panel is open updates the panel content
- [ ] Fretboard remains full-width at all times
- [ ] Exercise functionality (play, answer, score) is unaffected by the panel being open

## Blocked by

- Issue #12 (interval and chord info panel component)
