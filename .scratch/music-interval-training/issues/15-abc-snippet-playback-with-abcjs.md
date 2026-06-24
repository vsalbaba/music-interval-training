Status: completed

# ABC snippet playback with abcjs

## What to build

Add the `abcjs` npm dependency and build a playback utility that takes an ABC notation string and plays the single-voice melody through the existing Tone.js audio engine.

The utility should:
1. Parse an ABC string using abcjs to extract a sequence of notes with pitches and durations
2. Convert the parsed note data into the format the existing Tone.js `PluckSynth` engine expects (note strings like `"C4"`, `"G#3"`)
3. Schedule and play the notes with correct relative timing

The ABC strings will be imported from `.abc` files using Vite's `?raw` suffix (e.g. `import abc from './song.abc?raw'`). The `.abc` files contain standard ABC headers (`X:`, `T:`, `K:`, `L:`) and a single-voice melody line.

## Acceptance criteria

- [ ] `abcjs` is added as a project dependency
- [ ] A playback function accepts an ABC string and plays the melody
- [ ] Notes play with correct relative durations (half notes twice as long as quarter notes, etc.)
- [ ] Key signatures from the ABC `K:` header are respected (accidentals applied correctly)
- [ ] Works with the existing Tone.js PluckSynth audio engine
- [ ] Vite `?raw` import of a test `.abc` file works in the dev build

## Blocked by

None -- can start immediately.
