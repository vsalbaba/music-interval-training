# PRD: Guitar Interval & Chord Ear Training App

## Overview

A single-user desktop web app for practicing musical interval and chord recognition. Primarily for guitar players. Hosted on Hetzner behind Caddy basicauth.

## Tech Stack

- **Framework:** SvelteKit
- **Audio:** Tone.js (PluckSynth as default synth)
- **Storage:** localStorage (progress, session stats)
- **Deployment:** Docker on Hetzner, reverse-proxied by Caddy with basicauth (4-digit PIN)
- **Auth:** Caddy basicauth only -- no app-level authentication

## UI Layout

Desktop-only. Top-to-bottom stack, no scrolling:

1. **Exercise area** -- current exercise type selector, play/replay button, correct/incorrect feedback, running score (correct/total)
2. **Answer button grid** -- interval buttons or chord quality buttons depending on active exercise
3. **Fretboard** -- horizontal, full screen width, 6 strings, 12 frets, standard tuning (E-A-D-G-B-E), always visible, always clickable as a scratchpad

## Note Range

E3 to E5 -- maps to frets 0-12 on all 6 strings in standard tuning.

## Exercise Types

### 1. Interval Ear Training

**Flow:**
1. App picks two random notes within the E3-E5 range
2. Plays them sequentially (note -- note -- 200ms pause -- both strummed together)
3. User picks the interval from a button grid
4. Feedback shown: correct (green) or incorrect (red) with correct answer revealed
5. On answer reveal, root and interval notes highlighted on fretboard
6. User clicks "next" to advance (manual advance, no auto-advance)
7. Replay button always available, unlimited, no penalty

**Intervals (13 total):**
Unison, minor 2nd, major 2nd, minor 3rd, major 3rd, perfect 4th, tritone, perfect 5th, minor 6th, major 6th, minor 7th, major 7th, octave

**Difficulty levels (manual selection):**
- **Easy:** perfect unison, perfect 4th, perfect 5th, octave
- **Medium:** adds major/minor 3rd, major/minor 6th
- **Hard:** all 13 intervals

### 2. Chord Quality Recognition

**Flow:**
1. App picks a random root note and chord quality
2. Plays each chord tone sequentially (one by one), then after a 200ms pause plays the full chord strummed (30-50ms stagger between notes)
3. User picks the chord quality from a button grid
4. Same feedback/reveal/advance flow as interval training
5. On reveal, chord tones highlighted on fretboard

**Chord qualities:**
- Major
- Minor
- Dominant 7
- Major 7
- Minor 7
- Diminished
- Augmented
- Suspended (sus2 and sus4)

**Difficulty levels:**
- **Triads only:** major, minor, diminished, augmented, suspended
- **With 7ths:** adds dom7, maj7, min7

## Fretboard Component

- Horizontal orientation, spanning full screen width
- 6 strings, 12 frets, standard tuning
- Fret markers at standard positions (3, 5, 7, 9, 12)
- Clickable -- any note plays its sound via PluckSynth
- Note highlighting: can show root (one color) and interval/chord tones (another color) during answer reveal
- Always visible, always functional regardless of exercise state

## Session & Progress

- **Session:** endless, running score counter visible (correct/total)
- **Progress storage:** localStorage
  - Accuracy per interval
  - Accuracy per chord quality
  - Weak spot identification ("you get minor 6ths wrong 60% of the time")
- **No server-side persistence**

## Deployment

- Dockerfile for the SvelteKit app
- Caddy reverse proxy with basicauth directive (username + 4-digit PIN)
- PIN stored as environment variable or in Caddy config

## Deferred Features

- Alternate tunings
- Custom interval/chord selection (pick which intervals to drill)
- Adaptive difficulty (auto-adjusts based on accuracy)
- Musical staff notation display
- Piano keyboard component
- Chord shape recognition on fretboard (identify chord by fret pattern)
- Mobile/responsive layout
- Guitar and piano sample sounds (real instrument recordings)
- Lessons/educational content on intervals and chord theory
- Fretboard visual recognition exercise (see highlighted notes, name the interval)
- Harmonic intervals (simultaneous, as opposed to melodic)
- Czech song interval helper -- use well-known Czech songs as memory aids for each interval. Song snippets stored as data files (MIDI or text-based note descriptions), playable on demand via the synth engine so the user can hear the reference melody
