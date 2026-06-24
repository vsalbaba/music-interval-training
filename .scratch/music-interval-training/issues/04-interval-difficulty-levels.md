Status: completed

# Interval difficulty levels (medium + hard)

## Parent

[PRD](../PRD.md)

## What to build

Add a difficulty selector to the interval ear training exercise. The selector switches which intervals appear in the button grid and the random generation pool.

Difficulty levels:
- **Easy** (already implemented): unison, perfect 4th, perfect 5th, octave
- **Medium**: adds minor 3rd, major 3rd, minor 6th, major 6th
- **Hard**: all 13 intervals (unison, minor 2nd, major 2nd, minor 3rd, major 3rd, perfect 4th, tritone, perfect 5th, minor 6th, major 6th, minor 7th, major 7th, octave)

Switching difficulty resets the current session score.

## Acceptance criteria

- [ ] Difficulty selector visible in the exercise area (easy / medium / hard)
- [ ] Easy shows 4 interval buttons (unison, P4, P5, octave)
- [ ] Medium shows 8 interval buttons (easy + minor 3rd, major 3rd, minor 6th, major 6th)
- [ ] Hard shows all 13 interval buttons
- [ ] Random note generation only produces intervals from the selected difficulty's pool
- [ ] Switching difficulty resets the session score counter
- [ ] Selected difficulty persists within the session

## Blocked by

- [05 - Chord quality recognition](./05-chord-quality-recognition-triads.md)
